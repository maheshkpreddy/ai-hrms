import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId || !body.employeeId) {
      return NextResponse.json(
        { error: 'projectId and employeeId are required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db.project.findUnique({ where: { id: body.projectId } });
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
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

    // Check for duplicate
    const existing = await db.projectMember.findUnique({
      where: {
        projectId_employeeId: {
          projectId: body.projectId,
          employeeId: body.employeeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Employee is already a member of this project' },
        { status: 409 }
      );
    }

    const validRoles = ['lead', 'manager', 'member'];
    if (body.role && !validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: lead, manager, member' },
        { status: 400 }
      );
    }

    const member = await db.projectMember.create({
      data: {
        projectId: body.projectId,
        employeeId: body.employeeId,
        role: body.role || 'member',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true,
            avatar: true,
            designation: true,
            department: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding project member:', error);
    const message = error instanceof Error ? error.message : 'Failed to add project member';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Member id is required' },
        { status: 400 }
      );
    }

    const existing = await db.projectMember.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Project member not found' },
        { status: 404 }
      );
    }

    const validRoles = ['lead', 'manager', 'member'];
    if (body.role && !validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: lead, manager, member' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.role !== undefined) {
      updateData.role = body.role;
    }

    const member = await db.projectMember.update({
      where: { id: body.id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true,
            avatar: true,
            designation: true,
            department: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating project member:', error);
    return NextResponse.json(
      { error: 'Failed to update project member' },
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
        { error: 'Member id is required' },
        { status: 400 }
      );
    }

    const existing = await db.projectMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Project member not found' },
        { status: 404 }
      );
    }

    await db.projectMember.delete({ where: { id } });

    return NextResponse.json({ message: 'Project member removed successfully' });
  } catch (error) {
    console.error('Error removing project member:', error);
    return NextResponse.json(
      { error: 'Failed to remove project member' },
      { status: 500 }
    );
  }
}
