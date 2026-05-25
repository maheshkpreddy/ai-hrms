import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const createdBy = searchParams.get('createdBy');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};

    if (companyId) {
      where.companyId = companyId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (createdBy) {
      where.createdBy = createdBy;
    }

    // If employeeId is provided, filter tasks where the employee has an assignment
    if (employeeId) {
      where.assignments = {
        some: { employeeId },
      };
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignments: {
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
            },
          },
          comments: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeId: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          company: {
            select: { id: true, name: true },
          },
        },
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    const { assignedEmployeeIds = [], ...taskData } = body;

    const task = await db.task.create({
      data: {
        companyId: taskData.companyId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'not_started',
        dueDate: taskData.dueDate,
        imageUrl: taskData.imageUrl,
        createdBy: taskData.createdBy,
      },
    });

    // Create assignments for each employee
    if (assignedEmployeeIds.length > 0) {
      await db.taskAssignment.createMany({
        data: assignedEmployeeIds.map((empId: string) => ({
          taskId: task.id,
          employeeId: empId,
          status: 'not_started',
        })),
      });
    }

    // Fetch the task with relations to return
    const createdTask = await db.task.findUnique({
      where: { id: task.id },
      include: {
        assignments: {
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
          },
        },
        comments: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                avatar: true,
              },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(createdTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
