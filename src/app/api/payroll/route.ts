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

    const basicSalary = body.basicSalary ?? employee.salary ?? 0;
    const hra = body.hra ?? basicSalary * 0.4;
    const da = body.da ?? basicSalary * 0.1;
    const conveyance = body.conveyance ?? 1600;
    const medical = body.medical ?? 1250;
    const bonus = body.bonus ?? 0;
    const grossPay = basicSalary + hra + da + conveyance + medical + bonus;

    const pf = body.pf ?? basicSalary * 0.12;
    const esi = body.esi ?? grossPay * 0.0075;
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
        details: `Payroll processed for ${payroll.employee.firstName} ${payroll.employee.lastName} - ${month}/${year}: Net Pay ₹${netPay.toFixed(2)}`,
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
