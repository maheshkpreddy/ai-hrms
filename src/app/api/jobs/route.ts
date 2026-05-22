import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          candidates: {
            select: {
              id: true,
              name: true,
              status: true,
              aiFitScore: true,
            },
          },
          _count: {
            select: { candidates: true },
          },
        },
      }),
      db.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job postings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    const job = await db.job.create({
      data: {
        title: body.title,
        department: body.department,
        location: body.location,
        type: body.type,
        experience: body.experience,
        salary: body.salary,
        description: body.description,
        requirements: body.requirements,
        skills: body.skills,
        status: body.status || 'open',
        postedDate: body.postedDate || new Date().toISOString().split('T')[0],
        closingDate: body.closingDate,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'recruitment',
        details: `Job posting created: ${body.title} (${body.department || 'No department'})`,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job posting' },
      { status: 500 }
    );
  }
}
