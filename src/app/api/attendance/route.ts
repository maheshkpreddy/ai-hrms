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

    if (date) {
      where.date = date;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    } else if (startDate) {
      where.date = { gte: startDate };
    } else if (endDate) {
      where.date = { lte: endDate };
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
