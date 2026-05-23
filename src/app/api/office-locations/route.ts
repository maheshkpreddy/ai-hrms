import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { companyId };

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const [locations, total] = await Promise.all([
      db.officeLocation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
      }),
      db.officeLocation.count({ where }),
    ]);

    return NextResponse.json({
      locations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching office locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch office locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.companyId || !body.name || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json(
        { error: 'companyId, name, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const location = await db.officeLocation.create({
      data: {
        companyId: body.companyId,
        name: body.name,
        address: body.address,
        latitude: parseFloat(String(body.latitude)),
        longitude: parseFloat(String(body.longitude)),
        radius: body.radius ? parseFloat(String(body.radius)) : 500,
        isActive: body.isActive ?? true,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating office location:', error);
    return NextResponse.json(
      { error: 'Failed to create office location' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Office location id is required' },
        { status: 400 }
      );
    }

    const existing = await db.officeLocation.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Office location not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'address', 'isActive'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.latitude !== undefined) {
      updateData.latitude = parseFloat(String(body.latitude));
    }
    if (body.longitude !== undefined) {
      updateData.longitude = parseFloat(String(body.longitude));
    }
    if (body.radius !== undefined) {
      updateData.radius = parseFloat(String(body.radius));
    }

    const location = await db.officeLocation.update({
      where: { id: body.id },
      data: updateData,
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error updating office location:', error);
    return NextResponse.json(
      { error: 'Failed to update office location' },
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
        { error: 'Office location id is required' },
        { status: 400 }
      );
    }

    const existing = await db.officeLocation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Office location not found' },
        { status: 404 }
      );
    }

    await db.officeLocation.delete({ where: { id } });

    return NextResponse.json({ message: 'Office location deleted successfully' });
  } catch (error) {
    console.error('Error deleting office location:', error);
    return NextResponse.json(
      { error: 'Failed to delete office location' },
      { status: 500 }
    );
  }
}
