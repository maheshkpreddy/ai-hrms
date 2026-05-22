import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { currentCompany: { contains: search } },
      ];
    }

    const [candidates, total] = await Promise.all([
      db.candidate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
            },
          },
        },
      }),
      db.candidate.count({ where }),
    ]);

    return NextResponse.json({
      candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.jobId || !body.name || !body.email) {
      return NextResponse.json(
        { error: 'jobId, name, and email are required' },
        { status: 400 }
      );
    }

    // Verify the job exists
    const job = await db.job.findUnique({ where: { id: body.jobId } });
    if (!job) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    const candidate = await db.candidate.create({
      data: {
        jobId: body.jobId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        resumeUrl: body.resumeUrl,
        currentCompany: body.currentCompany,
        experience: body.experience,
        skills: body.skills,
        education: body.education,
        source: body.source || 'portal',
        status: body.status || 'applied',
        aiFitScore: body.aiFitScore,
        interviewDate: body.interviewDate,
        interviewNotes: body.interviewNotes,
        onboardingStatus: body.onboardingStatus,
      },
      include: {
        job: {
          select: {
            title: true,
            department: true,
          },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'recruitment',
        details: `Candidate ${body.name} applied for ${candidate.job.title} (${candidate.job.department || 'N/A'})`,
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}
