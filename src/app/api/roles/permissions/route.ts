import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/roles/permissions?roleId=xxx - Get all permissions for a role
// GET /api/roles/permissions - Get all role-permission mappings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (roleId) {
      const permissions = await db.rolePermission.findMany({
        where: { roleId },
        orderBy: { module: 'asc' },
      });
      return NextResponse.json({ permissions });
    }

    // Get all permissions grouped by role
    const allPermissions = await db.rolePermission.findMany({
      orderBy: [{ roleId: 'asc' }, { module: 'asc' }],
      include: {
        role: {
          select: { id: true, name: true, level: true },
        },
      },
    });

    return NextResponse.json({ permissions: allPermissions });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role permissions' },
      { status: 500 }
    );
  }
}

// POST /api/roles/permissions - Bulk create/update permissions
// Body: { permissions: [{ roleId, module, canRead, canWrite, canModify, canDelete, canAdmin }] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.permissions || !Array.isArray(body.permissions)) {
      return NextResponse.json(
        { error: 'permissions array is required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const perm of body.permissions) {
      if (!perm.roleId || !perm.module) {
        continue;
      }

      // Upsert: if permission for this role+module exists, update it; otherwise create
      const result = await db.rolePermission.upsert({
        where: {
          roleId_module: {
            roleId: perm.roleId,
            module: perm.module,
          },
        },
        update: {
          canRead: perm.canRead ?? false,
          canWrite: perm.canWrite ?? false,
          canModify: perm.canModify ?? false,
          canDelete: perm.canDelete ?? false,
          canAdmin: perm.canAdmin ?? false,
        },
        create: {
          roleId: perm.roleId,
          module: perm.module,
          canRead: perm.canRead ?? false,
          canWrite: perm.canWrite ?? false,
          canModify: perm.canModify ?? false,
          canDelete: perm.canDelete ?? false,
          canAdmin: perm.canAdmin ?? false,
        },
      });

      results.push(result);
    }

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'update',
        module: 'hr',
        details: `Updated permissions for ${results.length} role-module combinations`,
      },
    });

    return NextResponse.json({ permissions: results, count: results.length });
  } catch (error) {
    console.error('Error creating/updating role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to create/update role permissions' },
      { status: 500 }
    );
  }
}

// PATCH /api/roles/permissions - Update a single permission entry
// Body: { id, canRead, canWrite, canModify, canDelete, canAdmin }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Permission id is required' },
        { status: 400 }
      );
    }

    const existing = await db.rolePermission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }

    const permission = await db.rolePermission.update({
      where: { id },
      data: {
        ...(updates.canRead !== undefined && { canRead: updates.canRead }),
        ...(updates.canWrite !== undefined && { canWrite: updates.canWrite }),
        ...(updates.canModify !== undefined && { canModify: updates.canModify }),
        ...(updates.canDelete !== undefined && { canDelete: updates.canDelete }),
        ...(updates.canAdmin !== undefined && { canAdmin: updates.canAdmin }),
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    console.error('Error updating role permission:', error);
    return NextResponse.json(
      { error: 'Failed to update role permission' },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/permissions?id=xxx - Remove a permission entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const roleId = searchParams.get('roleId');

    if (roleId && !id) {
      // Delete all permissions for a role
      await db.rolePermission.deleteMany({ where: { roleId } });
      return NextResponse.json({ message: 'All permissions for role deleted' });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Permission id or roleId is required' },
        { status: 400 }
      );
    }

    await db.rolePermission.delete({ where: { id } });
    return NextResponse.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting role permission:', error);
    return NextResponse.json(
      { error: 'Failed to delete role permission' },
      { status: 500 }
    );
  }
}
