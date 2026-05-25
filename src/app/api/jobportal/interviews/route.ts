import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/jobportal/interviews - List interviews with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');
    const interviewType = searchParams.get('interviewType');
    const interviewerId = searchParams.get('interviewerId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (status) {
      where.status = status;
    }

    if (interviewType) {
      where.interviewType = interviewType;
    }

    if (interviewerId) {
      where.interviewerId = interviewerId;
    }

    const [interviews, total] = await Promise.all([
      db.jobInterview.findMany({
        where,
        include: {
          application: {
            select: {
              id: true,
              status: true,
              currentRound: true,
              interviewRounds: true,
              candidate: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
              job: {
                select: {
                  id: true,
                  title: true,
                  department: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.jobInterview.count({ where }),
    ]);

    return NextResponse.json({
      data: interviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

// POST /api/jobportal/interviews - Schedule a new interview
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationId,
      roundNumber,
      interviewType,
      scheduledAt,
      interviewerId,
      questions,
    } = body;

    if (!applicationId || roundNumber === undefined || !interviewType) {
      return NextResponse.json(
        { error: 'applicationId, roundNumber, and interviewType are required' },
        { status: 400 }
      );
    }

    // Verify application exists
    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check for duplicate round for the same application
    const existingInterview = await db.jobInterview.findFirst({
      where: {
        applicationId,
        roundNumber,
      },
    });

    if (existingInterview) {
      return NextResponse.json(
        { error: `Round ${roundNumber} already exists for this application` },
        { status: 409 }
      );
    }

    const interview = await db.jobInterview.create({
      data: {
        applicationId,
        roundNumber,
        interviewType,
        scheduledAt,
        interviewerId,
        questions: questions ? JSON.stringify(questions) : null,
      },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            currentRound: true,
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Update the application's interview rounds if needed
    if (application.interviewRounds < roundNumber) {
      await db.jobApplication.update({
        where: { id: applicationId },
        data: { interviewRounds: roundNumber },
      });
    }

    return NextResponse.json({ data: interview }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview' },
      { status: 500 }
    );
  }
}
