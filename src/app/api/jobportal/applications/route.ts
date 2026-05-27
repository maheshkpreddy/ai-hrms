import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/jobportal/applications - List applications with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const candidateId = searchParams.get('candidateId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    if (search) {
      where.OR = [
        { candidate: { name: { contains: search } } },
        { candidate: { email: { contains: search } } },
        { job: { title: { contains: search } } },
      ];
    }

    const [applications, total] = await Promise.all([
      db.jobApplication.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              skills: true,
              experience: true,
              currentCompany: true,
              expectedSalary: true,
              location: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              location: true,
              type: true,
            },
          },
          _count: {
            select: { interviews: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.jobApplication.count({ where }),
    ]);

    return NextResponse.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST /api/jobportal/applications - Create a new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      jobId,
      coverLetter,
      expectedSalary,
      noticePeriod,
      aiFitScore,
    } = body;

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { error: 'candidateId and jobId are required' },
        { status: 400 }
      );
    }

    // Verify candidate exists
    const candidate = await db.jobPortalCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Verify job exists
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check for duplicate application
    const existingApplication = await db.jobApplication.findFirst({
      where: {
        candidateId,
        jobId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Candidate has already applied for this job' },
        { status: 409 }
      );
    }

    const application = await db.jobApplication.create({
      data: {
        candidateId,
        jobId,
        coverLetter,
        expectedSalary,
        noticePeriod,
        aiFitScore,
      },
      include: {
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
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ data: application }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
