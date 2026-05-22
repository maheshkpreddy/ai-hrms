import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const assetType = searchParams.get('assetType');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (assetType) {
      where.assetType = assetType;
    }

    if (status) {
      where.status = status;
    }

    const [assets, total] = await Promise.all([
      db.asset.findMany({
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
      db.asset.count({ where }),
    ]);

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.assetType || !body.assetName) {
      return NextResponse.json(
        { error: 'employeeId, assetType, and assetName are required' },
        { status: 400 }
      );
    }

    const asset = await db.asset.create({
      data: {
        employeeId: body.employeeId,
        assetType: body.assetType,
        assetName: body.assetName,
        serialNo: body.serialNo,
        assignedDate: body.assignedDate,
        condition: body.condition,
        status: body.status || 'assigned',
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
        module: 'hr',
        details: `Asset assigned to ${asset.employee.firstName} ${asset.employee.lastName}: ${body.assetType} - ${body.assetName}${body.serialNo ? ` (S/N: ${body.serialNo})` : ''}`,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, returnDate, condition } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Asset id is required' },
        { status: 400 }
      );
    }

    if (status && !['assigned', 'returned', 'lost'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be one of: assigned, returned, lost' },
        { status: 400 }
      );
    }

    const existing = await db.asset.findUnique({
      where: { id },
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

    if (!existing) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (returnDate !== undefined) updateData.returnDate = returnDate;
    if (condition !== undefined) updateData.condition = condition;

    const asset = await db.asset.update({
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
        module: 'hr',
        details: `Asset status updated for ${existing.employee.firstName} ${existing.employee.lastName}: ${existing.assetName} changed to ${status || 'updated'}${returnDate ? ` (returned on ${returnDate})` : ''}`,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
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
        { error: 'Asset id is required' },
        { status: 400 }
      );
    }

    const existing = await db.asset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    await db.asset.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: existing.employeeId,
        action: 'delete',
        module: 'hr',
        details: `Deleted asset: ${existing.assetName} (${existing.assetType})`,
      },
    });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
