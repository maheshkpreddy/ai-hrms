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

    const where: Record<string, unknown> = {};

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
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

    const employee = await db.employee.create({
      data: {
        employeeId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        avatar: body.avatar,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        address: body.address,
        department: body.department,
        designation: body.designation,
        jobTitle: body.jobTitle,
        contractType: body.contractType,
        reportingTo: body.reportingTo,
        joinDate: body.joinDate,
        exitDate: body.exitDate,
        status: body.status || 'active',
        salary: body.salary,
        bankAccount: body.bankAccount,
        panNumber: body.panNumber,
        pfNumber: body.pfNumber,
        esiNumber: body.esiNumber,
        emergencyContact: body.emergencyContact,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
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
