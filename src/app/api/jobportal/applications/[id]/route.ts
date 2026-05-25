import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/jobportal/applications/[id] - Get single application with all relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await db.jobApplication.findUnique({
      where: { id },
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
            education: true,
            currentCompany: true,
            expectedSalary: true,
            location: true,
            noticePeriod: true,
            resumeUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            type: true,
            description: true,
            requirements: true,
            skills: true,
            salary: true,
          },
        },
        interviews: {
          orderBy: { roundNumber: 'asc' },
        },
        offerLetter: true,
        onboarding: true,
        backgroundCheck: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobportal/applications/[id] - Update application (status, shortlist, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      shortlistedBy,
      shortlistedAt,
      interviewMode,
      interviewRounds,
      currentRound,
      aiFitScore,
      coverLetter,
      expectedSalary,
      noticePeriod,
    } = body;

    // Verify application exists
    const existingApplication = await db.jobApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) updateData.status = status;
    if (shortlistedBy !== undefined) updateData.shortlistedBy = shortlistedBy;
    if (shortlistedAt !== undefined) updateData.shortlistedAt = shortlistedAt;
    if (interviewMode !== undefined) updateData.interviewMode = interviewMode;
    if (interviewRounds !== undefined) updateData.interviewRounds = interviewRounds;
    if (currentRound !== undefined) updateData.currentRound = currentRound;
    if (aiFitScore !== undefined) updateData.aiFitScore = aiFitScore;
    if (coverLetter !== undefined) updateData.coverLetter = coverLetter;
    if (expectedSalary !== undefined) updateData.expectedSalary = expectedSalary;
    if (noticePeriod !== undefined) updateData.noticePeriod = noticePeriod;

    const application = await db.jobApplication.update({
      where: { id },
      data: updateData,
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
          },
        },
        interviews: {
          orderBy: { roundNumber: 'asc' },
        },
        offerLetter: true,
        onboarding: true,
        backgroundCheck: true,
      },
    });

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
