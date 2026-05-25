import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId || !body.title) {
      return NextResponse.json(
        { error: 'projectId and title are required' },
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

    const validStatuses = ['pending', 'completed', 'overdue'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, completed, overdue' },
        { status: 400 }
      );
    }

    const milestone = await db.projectMilestone.create({
      data: {
        projectId: body.projectId,
        title: body.title,
        description: body.description || null,
        dueDate: body.dueDate || null,
        completedDate: body.completedDate || null,
        status: body.status || 'pending',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating milestone:', error);
    const message = error instanceof Error ? error.message : 'Failed to create milestone';
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
        { error: 'Milestone id is required' },
        { status: 400 }
      );
    }

    const existing = await db.projectMilestone.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['title', 'description', 'dueDate', 'completedDate', 'status'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // If marking as completed, auto-set completedDate
    if (body.status === 'completed' && !body.completedDate) {
      updateData.completedDate = new Date().toISOString().split('T')[0];
    }

    const milestone = await db.projectMilestone.update({
      where: { id: body.id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
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
        { error: 'Milestone id is required' },
        { status: 400 }
      );
    }

    const existing = await db.projectMilestone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    await db.projectMilestone.delete({ where: { id } });

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
