import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const year = searchParams.get('year');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (year) {
      where.date = { startsWith: year };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { type: { contains: search } },
      ];
    }

    const [holidays, total] = await Promise.all([
      db.holiday.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'asc' },
      }),
      db.holiday.count({ where }),
    ]);

    return NextResponse.json({
      holidays,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.date) {
      return NextResponse.json(
        { error: 'Holiday name and date are required' },
        { status: 400 }
      );
    }

    const holiday = await db.holiday.create({
      data: {
        name: body.name,
        date: body.date,
        type: body.type || 'company',
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'attendance',
        details: `Created holiday: ${holiday.name} on ${holiday.date}${holiday.type ? ` (${holiday.type})` : ''}`,
      },
    });

    return NextResponse.json(holiday, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating holiday:', error);
    const message = error instanceof Error ? error.message : 'Failed to create holiday';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, date, type } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Holiday id is required' },
        { status: 400 }
      );
    }

    const existing = await db.holiday.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      );
    }

    if (type && !['national', 'company', 'optional'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be one of: national, company, optional' },
        { status: 400 }
      );
    }

    const holiday = await db.holiday.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(date && { date }),
        ...(type && { type }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'update',
        module: 'attendance',
        details: `Updated holiday: ${holiday.name} on ${holiday.date}`,
      },
    });

    return NextResponse.json(holiday);
  } catch (error) {
    console.error('Error updating holiday:', error);
    return NextResponse.json(
      { error: 'Failed to update holiday' },
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
        { error: 'Holiday id is required' },
        { status: 400 }
      );
    }

    const existing = await db.holiday.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Holiday not found' },
        { status: 404 }
      );
    }

    await db.holiday.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'attendance',
        details: `Deleted holiday: ${existing.name} on ${existing.date}`,
      },
    });

    return NextResponse.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json(
      { error: 'Failed to delete holiday' },
      { status: 500 }
    );
  }
}
