import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['not_started', 'in_progress', 'finished'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await db.taskAssignment.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Task assignment not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { status: body.status };

    // Set completedAt when status changes to finished
    if (body.status === 'finished') {
      updateData.completedAt = new Date().toISOString();
    } else {
      // Clear completedAt if moving away from finished
      updateData.completedAt = null;
    }

    const assignment = await db.taskAssignment.update({
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
            department: true,
            avatar: true,
          },
        },
        task: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    // Auto-update task status to "finished" when all assignments are finished
    if (body.status === 'finished') {
      const allAssignments = await db.taskAssignment.findMany({
        where: { taskId: existing.taskId },
      });

      const allFinished = allAssignments.every((a) => a.status === 'finished');

      if (allFinished && allAssignments.length > 0) {
        await db.task.update({
          where: { id: existing.taskId },
          data: { status: 'finished' },
        });
      }
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error updating task assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update task assignment' },
      { status: 500 }
    );
  }
}
