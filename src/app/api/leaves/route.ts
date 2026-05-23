import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const leaveType = searchParams.get('leaveType');

    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (leaveType) {
      where.leaveType = leaveType;
    }

    const [leaves, total] = await Promise.all([
      db.leave.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      db.leave.count({ where }),
    ]);

    return NextResponse.json({
      leaves,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaves' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.leaveType || !body.startDate || !body.endDate || !body.days) {
      return NextResponse.json(
        { error: 'employeeId, leaveType, startDate, endDate, and days are required' },
        { status: 400 }
      );
    }

    // Verify employee exists
    const employee = await db.employee.findUnique({ where: { id: body.employeeId } });
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const leave = await db.leave.create({
      data: {
        employeeId: body.employeeId,
        leaveType: body.leaveType,
        startDate: body.startDate,
        endDate: body.endDate,
        days: body.days,
        reason: body.reason,
        status: 'pending',
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
        employeeId: body.employeeId,
        action: 'create',
        module: 'leave',
        details: `Leave request created by ${leave.employee.firstName} ${leave.employee.lastName}: ${body.leaveType} from ${body.startDate} to ${body.endDate}`,
      },
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error('Error creating leave:', error);
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy, comments, leaveType, startDate, endDate, days, reason } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Leave id is required' },
        { status: 400 }
      );
    }

    const existingLeave = await db.leave.findUnique({ where: { id } });
    if (!existingLeave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // If status change is requested
    if (status) {
      if (!['approved', 'rejected', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'Status must be approved, rejected, or cancelled' },
          { status: 400 }
        );
      }

      if (existingLeave.status !== 'pending' && status !== 'cancelled') {
        return NextResponse.json(
          { error: 'Leave request has already been processed' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (approvedBy) updateData.approvedBy = approvedBy;
    if (comments) updateData.comments = comments;
    if (leaveType) updateData.leaveType = leaveType;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (days !== undefined) updateData.days = days;
    if (reason !== undefined) updateData.reason = reason;

    const leave = await db.leave.update({
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
        employeeId: existingLeave.employeeId,
        action: 'update',
        module: 'leave',
        details: `Leave request ${status || 'updated'} for ${leave.employee.firstName} ${leave.employee.lastName}: ${existingLeave.leaveType} (${existingLeave.startDate} - ${existingLeave.endDate})`,
      },
    });

    return NextResponse.json(leave);
  } catch (error) {
    console.error('Error updating leave:', error);
    return NextResponse.json(
      { error: 'Failed to update leave request' },
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
        { error: 'Leave id is required' },
        { status: 400 }
      );
    }

    const existingLeave = await db.leave.findUnique({ where: { id } });
    if (!existingLeave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    await db.leave.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: existingLeave.employeeId,
        action: 'delete',
        module: 'leave',
        details: `Leave request deleted: ${existingLeave.leaveType} (${existingLeave.startDate} - ${existingLeave.endDate})`,
      },
    });

    return NextResponse.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave:', error);
    return NextResponse.json(
      { error: 'Failed to delete leave request' },
      { status: 500 }
    );
  }
}
