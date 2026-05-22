import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [shifts, total] = await Promise.all([
      db.shift.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.shift.count({ where }),
    ]);

    return NextResponse.json({
      shifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'name, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await db.shift.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Shift with this name already exists' },
        { status: 409 }
      );
    }

    const shift = await db.shift.create({
      data: {
        name: body.name,
        startTime: body.startTime,
        endTime: body.endTime,
        graceTime: body.graceTime,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'attendance',
        details: `Created shift: ${shift.name} (${shift.startTime} - ${shift.endTime})${shift.graceTime ? ` Grace: ${shift.graceTime}min` : ''}`,
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating shift:', error);
    const message = error instanceof Error ? error.message : 'Failed to create shift';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, startTime, endTime, graceTime } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Shift id is required' },
        { status: 400 }
      );
    }

    const existing = await db.shift.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (name && name !== existing.name) {
      const duplicate = await db.shift.findUnique({ where: { name } });
      if (duplicate) {
        return NextResponse.json(
          { error: 'Shift with this name already exists' },
          { status: 409 }
        );
      }
    }

    const shift = await db.shift.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(graceTime !== undefined && { graceTime }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'update',
        module: 'attendance',
        details: `Updated shift: ${shift.name} (${shift.startTime} - ${shift.endTime})`,
      },
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json(
      { error: 'Failed to update shift' },
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
        { error: 'Shift id is required' },
        { status: 400 }
      );
    }

    const existing = await db.shift.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      );
    }

    await db.shift.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'attendance',
        details: `Deleted shift: ${existing.name}`,
      },
    });

    return NextResponse.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json(
      { error: 'Failed to delete shift' },
      { status: 500 }
    );
  }
}
