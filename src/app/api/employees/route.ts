import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');

    const where: Record<string, unknown> = {};

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      db.employee.count({ where }),
    ]);

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: 'firstName, lastName, and email are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingEmail = await db.employee.findUnique({ where: { email: body.email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An employee with this email already exists' },
        { status: 409 }
      );
    }

    // Auto-generate employeeId if not provided
    let employeeId = body.employeeId;
    if (!employeeId) {
      const count = await db.employee.count();
      employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
      // Ensure uniqueness by checking if it already exists
      const existing = await db.employee.findUnique({ where: { employeeId } });
      if (existing) {
        // Increment until we find a unique one
        let next = count + 2;
        while (await db.employee.findUnique({ where: { employeeId: `EMP${String(next).padStart(3, '0')}` } })) {
          next++;
        }
        employeeId = `EMP${String(next).padStart(3, '0')}`;
      }
    }

    // Validate companyId if provided
    if (body.companyId) {
      const companyExists = await db.company.findUnique({ where: { id: body.companyId } });
      if (!companyExists) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    const employee = await db.employee.create({
      data: {
        employeeId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        avatar: body.avatar || null,
        dateOfBirth: body.dateOfBirth || null,
        gender: body.gender || null,
        address: body.address || null,
        department: body.department || null,
        designation: body.designation || null,
        jobTitle: body.jobTitle || null,
        contractType: body.contractType || null,
        reportingTo: body.reportingTo || null,
        joinDate: body.joinDate || null,
        exitDate: body.exitDate || null,
        status: body.status || 'active',
        salary: body.salary || null,
        bankAccount: body.bankAccount || null,
        panNumber: body.panNumber || null,
        pfNumber: body.pfNumber || null,
        esiNumber: body.esiNumber || null,
        emergencyContact: body.emergencyContact || null,
        companyId: body.companyId || null,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: employee.id,
        action: 'create',
        module: 'hr',
        details: `Created employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating employee:', error);
    const message = error instanceof Error ? error.message : 'Failed to create employee';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, email, phone, avatar, dateOfBirth, gender, address, department, designation, jobTitle, contractType, reportingTo, joinDate, exitDate, status, salary, bankAccount, panNumber, pfNumber, esiNumber, emergencyContact, companyId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee id is required' },
        { status: 400 }
      );
    }

    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check for duplicate email if email is being updated
    if (email && email !== existing.email) {
      const duplicate = await db.employee.findUnique({ where: { email } });
      if (duplicate) {
        return NextResponse.json(
          { error: 'An employee with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Validate companyId if being updated
    if (companyId !== undefined && companyId !== null) {
      const companyExists = await db.company.findUnique({ where: { id: companyId } });
      if (!companyExists) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    const employee = await db.employee.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(gender !== undefined && { gender }),
        ...(address !== undefined && { address }),
        ...(department !== undefined && { department }),
        ...(designation !== undefined && { designation }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(contractType !== undefined && { contractType }),
        ...(reportingTo !== undefined && { reportingTo }),
        ...(joinDate !== undefined && { joinDate }),
        ...(exitDate !== undefined && { exitDate }),
        ...(status !== undefined && { status }),
        ...(salary !== undefined && { salary }),
        ...(bankAccount !== undefined && { bankAccount }),
        ...(panNumber !== undefined && { panNumber }),
        ...(pfNumber !== undefined && { pfNumber }),
        ...(esiNumber !== undefined && { esiNumber }),
        ...(emergencyContact !== undefined && { emergencyContact }),
        ...(companyId !== undefined && { companyId }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: id,
        action: 'update',
        module: 'hr',
        details: `Updated employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
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
        { error: 'Employee id is required' },
        { status: 400 }
      );
    }

    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee has a linked user account
    const linkedUser = await db.user.findUnique({ where: { employeeId: id } });
    if (linkedUser) {
      return NextResponse.json(
        { error: 'Cannot delete employee with active user account. Deactivate the user first.' },
        { status: 409 }
      );
    }

    await db.employee.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'hr',
        details: `Deleted employee: ${existing.firstName} ${existing.lastName} (${existing.employeeId})`,
      },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
