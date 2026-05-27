import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/jobportal/candidates - List candidates with search and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const isActive = searchParams.get('isActive');
    const skills = searchParams.get('skills');
    const location = searchParams.get('location');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { currentCompany: { contains: search } },
      ];
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (location) {
      where.location = { contains: location };
    }

    if (skills) {
      where.skills = { contains: skills };
    }

    const [candidates, total] = await Promise.all([
      db.jobPortalCandidate.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          resumeUrl: true,
          skills: true,
          experience: true,
          education: true,
          currentCompany: true,
          expectedSalary: true,
          location: true,
          noticePeriod: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { applications: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.jobPortalCandidate.count({ where }),
    ]);

    return NextResponse.json({
      data: candidates,
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

// POST /api/jobportal/candidates - Create a new candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      password,
      resumeUrl,
      skills,
      experience,
      education,
      currentCompany,
      expectedSalary,
      location,
      noticePeriod,
      avatar,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if candidate with email already exists
    const existingCandidate = await db.jobPortalCandidate.findUnique({
      where: { email },
    });

    if (existingCandidate) {
      return NextResponse.json(
        { error: 'A candidate with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const candidate = await db.jobPortalCandidate.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        resumeUrl,
        skills: skills ? JSON.stringify(skills) : null,
        experience,
        education,
        currentCompany,
        expectedSalary,
        location,
        noticePeriod,
        avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        resumeUrl: true,
        skills: true,
        experience: true,
        education: true,
        currentCompany: true,
        expectedSalary: true,
        location: true,
        noticePeriod: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: candidate }, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}
