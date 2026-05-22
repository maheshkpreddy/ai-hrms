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
