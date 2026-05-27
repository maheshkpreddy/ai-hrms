import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const reviewPeriod = searchParams.get('reviewPeriod');

    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (reviewPeriod) {
      where.reviewPeriod = reviewPeriod;
    }

    const [reviews, total] = await Promise.all([
      db.performance.findMany({
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
      db.performance.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.reviewPeriod) {
      return NextResponse.json(
        { error: 'employeeId and reviewPeriod are required' },
        { status: 400 }
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

    const review = await db.performance.create({
      data: {
        employeeId: body.employeeId,
        reviewPeriod: body.reviewPeriod,
        reviewerId: body.reviewerId,
        rating: body.rating ?? 0,
        objectives: body.objectives,
        achievements: body.achievements,
        feedback: body.feedback,
        selfReview: body.selfReview,
        goals: body.goals,
        attritionRisk: body.attritionRisk ?? 0,
        status: body.status || 'draft',
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
        module: 'performance',
        details: `Performance review created for ${review.employee.firstName} ${review.employee.lastName} - Period: ${body.reviewPeriod}`,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating performance review:', error);
    return NextResponse.json(
      { error: 'Failed to create performance review' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Performance review id is required' },
        { status: 400 }
      );
    }

    const existing = await db.performance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Performance review not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.reviewPeriod) updateData.reviewPeriod = body.reviewPeriod;
    if (body.reviewerId !== undefined) updateData.reviewerId = body.reviewerId;
    if (body.rating !== undefined) updateData.rating = Math.min(5, Math.max(0, body.rating));
    if (body.objectives !== undefined) updateData.objectives = body.objectives;
    if (body.achievements !== undefined) updateData.achievements = body.achievements;
    if (body.feedback !== undefined) updateData.feedback = body.feedback;
    if (body.selfReview !== undefined) updateData.selfReview = body.selfReview;
    if (body.goals !== undefined) updateData.goals = body.goals;
    if (body.attritionRisk !== undefined) updateData.attritionRisk = Math.min(1, Math.max(0, body.attritionRisk));
    if (body.status && ['draft', 'in-review', 'completed'].includes(body.status)) {
      updateData.status = body.status;
    }

    const review = await db.performance.update({
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
        module: 'performance',
        details: `Performance review updated for ${review.employee.firstName} ${review.employee.lastName} - Status: ${body.status || existing.status}`,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating performance review:', error);
    return NextResponse.json(
      { error: 'Failed to update performance review' },
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
        { error: 'Performance review id is required' },
        { status: 400 }
      );
    }

    const existing = await db.performance.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Performance review not found' },
        { status: 404 }
      );
    }

    await db.performance.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: existing.employeeId,
        action: 'delete',
        module: 'performance',
        details: `Performance review deleted for period: ${existing.reviewPeriod}`,
      },
    });

    return NextResponse.json({ message: 'Performance review deleted successfully' });
  } catch (error) {
    console.error('Error deleting performance review:', error);
    return NextResponse.json(
      { error: 'Failed to delete performance review' },
      { status: 500 }
    );
  }
}
