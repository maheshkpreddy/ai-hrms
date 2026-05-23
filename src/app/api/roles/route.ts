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
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [roles, total] = await Promise.all([
      db.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { level: 'asc' },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.role.count({ where }),
    ]);

    return NextResponse.json({
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await db.role.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      );
    }

    const role = await db.role.create({
      data: {
        name: body.name,
        description: body.description,
        permissions: body.permissions ? JSON.stringify(body.permissions) : null,
        level: body.level || 0,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'hr',
        details: `Created role: ${role.name} (level: ${role.level})`,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating role:', error);
    const message = error instanceof Error ? error.message : 'Failed to create role';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, permissions, level } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Role id is required' },
        { status: 400 }
      );
    }

    const existing = await db.role.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (name && name !== existing.name) {
      const duplicate = await db.role.findFirst({ where: { name } });
      if (duplicate) {
        return NextResponse.json(
          { error: 'Role with this name already exists' },
          { status: 409 }
        );
      }
    }

    const role = await db.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions !== undefined && { permissions: JSON.stringify(permissions) }),
        ...(level !== undefined && { level }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'update',
        module: 'hr',
        details: `Updated role: ${role.name}`,
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
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
        { error: 'Role id is required' },
        { status: 400 }
      );
    }

    const existing = await db.role.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    if (existing.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role assigned to users. Reassign users first.' },
        { status: 409 }
      );
    }

    await db.role.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'hr',
        details: `Deleted role: ${existing.name}`,
      },
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
