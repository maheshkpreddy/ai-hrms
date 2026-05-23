import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (month) {
      where.month = month;
    }

    if (year) {
      where.year = year;
    }

    if (status) {
      where.status = status;
    }

    const [records, total] = await Promise.all([
      db.payroll.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              department: true,
              avatar: true,
            },
          },
        },
      }),
      db.payroll.count({ where }),
    ]);

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, month, year } = body;

    if (!employeeId || !month || !year) {
      return NextResponse.json(
        { error: 'employeeId, month, and year are required' },
        { status: 400 }
      );
    }

    // Check for duplicate payroll record
    const existing = await db.payroll.findFirst({
      where: { employeeId, month, year },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Payroll record already exists for this employee for the given month/year' },
        { status: 409 }
      );
    }

    // Get employee salary
    const employee = await db.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    if (!employee.salary || employee.salary === 0) {
      return NextResponse.json(
        { error: 'Employee salary is not set. Please update employee salary before processing payroll.' },
        { status: 400 }
      );
    }

    const basicSalary = body.basicSalary ?? employee.salary;
    const hra = body.hra ?? Math.round(basicSalary * 0.4);
    const da = body.da ?? Math.round(basicSalary * 0.1);
    const conveyance = body.conveyance ?? 1600;
    const medical = body.medical ?? 1250;
    const bonus = body.bonus ?? 0;
    const grossPay = basicSalary + hra + da + conveyance + medical + bonus;

    const pf = body.pf ?? Math.round(basicSalary * 0.12);
    const esi = body.esi ?? Math.round(grossPay * 0.0075);
    const tax = body.tax ?? 0;
    const professionalTax = body.professionalTax ?? 200;
    const totalDeductions = pf + esi + tax + professionalTax;
    const netPay = grossPay - totalDeductions;

    const payroll = await db.payroll.create({
      data: {
        employeeId,
        month,
        year,
        basicSalary,
        hra,
        da,
        conveyance,
        medical,
        bonus,
        grossPay,
        pf,
        esi,
        tax,
        professionalTax,
        totalDeductions,
        netPay,
        status: body.status || 'processed',
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId,
        action: 'create',
        module: 'payroll',
        details: `Payroll processed for ${payroll.employee.firstName} ${payroll.employee.lastName} - ${month}/${year}: Net Pay Rs.${netPay.toFixed(2)}`,
      },
    });

    return NextResponse.json(payroll, { status: 201 });
  } catch (error) {
    console.error('Error processing payroll:', error);
    return NextResponse.json(
      { error: 'Failed to process payroll' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Payroll record id is required' },
        { status: 400 }
      );
    }

    const existing = await db.payroll.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status && ['processed', 'paid', 'pending'].includes(status)) {
      updateData.status = status;
    }

    // Allow updating individual components
    if (body.basicSalary !== undefined) updateData.basicSalary = body.basicSalary;
    if (body.hra !== undefined) updateData.hra = body.hra;
    if (body.da !== undefined) updateData.da = body.da;
    if (body.conveyance !== undefined) updateData.conveyance = body.conveyance;
    if (body.medical !== undefined) updateData.medical = body.medical;
    if (body.bonus !== undefined) updateData.bonus = body.bonus;
    if (body.pf !== undefined) updateData.pf = body.pf;
    if (body.esi !== undefined) updateData.esi = body.esi;
    if (body.tax !== undefined) updateData.tax = body.tax;
    if (body.professionalTax !== undefined) updateData.professionalTax = body.professionalTax;

    // Recalculate if any salary components changed
    const basicSalary = (updateData.basicSalary as number) ?? existing.basicSalary;
    const hra = (updateData.hra as number) ?? existing.hra;
    const da = (updateData.da as number) ?? existing.da;
    const conveyance = (updateData.conveyance as number) ?? existing.conveyance;
    const medical = (updateData.medical as number) ?? existing.medical;
    const bonus = (updateData.bonus as number) ?? existing.bonus;
    const pf = (updateData.pf as number) ?? existing.pf;
    const esi = (updateData.esi as number) ?? existing.esi;
    const tax = (updateData.tax as number) ?? existing.tax;
    const professionalTax = (updateData.professionalTax as number) ?? existing.professionalTax;

    updateData.grossPay = basicSalary + hra + da + conveyance + medical + bonus;
    updateData.totalDeductions = pf + esi + tax + professionalTax;
    updateData.netPay = (updateData.grossPay as number) - (updateData.totalDeductions as number);

    const payroll = await db.payroll.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: existing.employeeId,
        action: 'update',
        module: 'payroll',
        details: `Payroll ${status ? `status changed to ${status}` : 'updated'} for ${payroll.employee.firstName} ${payroll.employee.lastName} - ${existing.month}/${existing.year}`,
      },
    });

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error updating payroll:', error);
    return NextResponse.json(
      { error: 'Failed to update payroll record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payroll record id is required' },
        { status: 400 }
      );
    }

    const existing = await db.payroll.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      );
    }

    await db.payroll.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: existing.employeeId,
        action: 'delete',
        module: 'payroll',
        details: `Payroll record deleted for employee - ${existing.month}/${existing.year}`,
      },
    });

    return NextResponse.json({ message: 'Payroll record deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    return NextResponse.json(
      { error: 'Failed to delete payroll record' },
      { status: 500 }
    );
  }
}
