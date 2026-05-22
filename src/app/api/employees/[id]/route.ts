import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        leaves: {
          orderBy: { createdAt: 'desc' },
        },
        payroll: {
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        performance: {
          orderBy: { createdAt: 'desc' },
        },
        expenses: {
          orderBy: { createdAt: 'desc' },
        },
        assets: {
          where: { status: 'assigned' },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        enrollments: {
          include: {
            course: true,
          },
        },
        documents: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingEmployee = await db.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employee = await db.employee.update({
      where: { id },
      data: {
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
        status: body.status,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingEmployee = await db.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    await db.employee.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'hr',
        details: `Deleted employee: ${existingEmployee.firstName} ${existingEmployee.lastName} (${existingEmployee.employeeId})`,
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
