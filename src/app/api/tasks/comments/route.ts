import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId query parameter is required' },
        { status: 400 }
      );
    }

    const [comments, total] = await Promise.all([
      db.taskComment.findMany({
        where: { taskId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              avatar: true,
              designation: true,
            },
          },
        },
      }),
      db.taskComment.count({ where: { taskId } }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching task comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.taskId || !body.employeeId || !body.content) {
      return NextResponse.json(
        { error: 'taskId, employeeId, and content are required' },
        { status: 400 }
      );
    }

    const comment = await db.taskComment.create({
      data: {
        taskId: body.taskId,
        employeeId: body.employeeId,
        content: body.content,
        isHr: body.isHr ?? false,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            avatar: true,
            designation: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating task comment:', error);
    return NextResponse.json(
      { error: 'Failed to create task comment' },
      { status: 500 }
    );
  }
}
