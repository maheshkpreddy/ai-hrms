import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    // Date filtering: use range if provided, otherwise use single date
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    } else if (startDate) {
      where.date = { gte: startDate };
    } else if (endDate) {
      where.date = { lte: endDate };
    } else if (date) {
      where.date = date;
    }

    const [records, total] = await Promise.all([
      db.attendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
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
      db.attendance.count({ where }),
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
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.date) {
      return NextResponse.json(
        { error: 'employeeId and date are required' },
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

    // Check for duplicate attendance record
    const existing = await db.attendance.findFirst({
      where: {
        employeeId: body.employeeId,
        date: body.date,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this employee on this date' },
        { status: 409 }
      );
    }

    const record = await db.attendance.create({
      data: {
        employeeId: body.employeeId,
        date: body.date,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        status: body.status || 'present',
        shift: body.shift,
        location: body.location,
        notes: body.notes,
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
        module: 'attendance',
        details: `Attendance record created for ${record.employee.firstName} ${record.employee.lastName} on ${body.date}`,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, checkIn, checkOut, status, shift, location, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Attendance record id is required' },
        { status: 400 }
      );
    }

    const existing = await db.attendance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (checkIn !== undefined) updateData.checkIn = checkIn;
    if (checkOut !== undefined) updateData.checkOut = checkOut;
    if (status && ['present', 'absent', 'late', 'half-day'].includes(status)) updateData.status = status;
    if (shift !== undefined) updateData.shift = shift;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;

    const record = await db.attendance.update({
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
        module: 'attendance',
        details: `Attendance record updated for ${record.employee.firstName} ${record.employee.lastName} on ${existing.date}`,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
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
        { error: 'Attendance record id is required' },
        { status: 400 }
      );
    }

    const existing = await db.attendance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    await db.attendance.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: existing.employeeId,
        action: 'delete',
        module: 'attendance',
        details: `Attendance record deleted for employee on ${existing.date}`,
      },
    });

    return NextResponse.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return NextResponse.json(
      { error: 'Failed to delete attendance record' },
      { status: 500 }
    );
  }
}
