import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/jobportal/offer-letters - List offer letters with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const applicationId = searchParams.get('applicationId');
    const issuedBy = searchParams.get('issuedBy');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (issuedBy) {
      where.issuedBy = issuedBy;
    }

    const [offerLetters, total] = await Promise.all([
      db.offerLetter.findMany({
        where,
        include: {
          application: {
            select: {
              id: true,
              status: true,
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
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.offerLetter.count({ where }),
    ]);

    return NextResponse.json({
      data: offerLetters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching offer letters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer letters' },
      { status: 500 }
    );
  }
}

// POST /api/jobportal/offer-letters - Create an offer letter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationId,
      position,
      department,
      salary,
      startDate,
      issuedBy,
      issuedAt,
      letterContent,
      status,
    } = body;

    if (!applicationId || !position) {
      return NextResponse.json(
        { error: 'applicationId and position are required' },
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

    // Check if offer letter already exists for this application
    const existingOfferLetter = await db.offerLetter.findUnique({
      where: { applicationId },
    });

    if (existingOfferLetter) {
      return NextResponse.json(
        { error: 'An offer letter already exists for this application' },
        { status: 409 }
      );
    }

    const offerLetter = await db.offerLetter.create({
      data: {
        applicationId,
        position,
        department,
        salary,
        startDate,
        issuedBy,
        issuedAt,
        letterContent,
        status: status || 'draft',
      },
      include: {
        application: {
          select: {
            id: true,
            status: true,
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

    return NextResponse.json({ data: offerLetter }, { status: 201 });
  } catch (error) {
    console.error('Error creating offer letter:', error);
    return NextResponse.json(
      { error: 'Failed to create offer letter' },
      { status: 500 }
    );
  }
}
