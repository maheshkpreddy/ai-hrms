import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/jobportal/onboarding - List onboarding records with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const applicationId = searchParams.get('applicationId');
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

    const [onboardingRecords, total] = await Promise.all([
      db.onboarding.findMany({
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
      db.onboarding.count({ where }),
    ]);

    return NextResponse.json({
      data: onboardingRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding records' },
      { status: 500 }
    );
  }
}

// POST /api/jobportal/onboarding - Start onboarding for an application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationId,
      buddyAssigned,
      startDate,
      employeeId,
    } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'applicationId is required' },
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

    // Check if onboarding already exists
    const existingOnboarding = await db.onboarding.findUnique({
      where: { applicationId },
    });

    if (existingOnboarding) {
      return NextResponse.json(
        { error: 'Onboarding already exists for this application' },
        { status: 409 }
      );
    }

    const onboarding = await db.onboarding.create({
      data: {
        applicationId,
        status: 'pending',
        documentUpload: false,
        policyAcknowledgment: false,
        equipmentSetup: false,
        accountCreation: false,
        orientationComplete: false,
        buddyAssigned,
        startDate,
        employeeId,
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

    return NextResponse.json({ data: onboarding }, { status: 201 });
  } catch (error) {
    console.error('Error creating onboarding record:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding record' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobportal/onboarding - Update onboarding checklist items
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      documentUpload,
      policyAcknowledgment,
      equipmentSetup,
      accountCreation,
      orientationComplete,
      buddyAssigned,
      startDate,
      status,
      completedAt,
      employeeId,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Onboarding record id is required' },
        { status: 400 }
      );
    }

    // Verify onboarding record exists
    const existingOnboarding = await db.onboarding.findUnique({
      where: { id },
    });

    if (!existingOnboarding) {
      return NextResponse.json(
        { error: 'Onboarding record not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Checklist boolean fields
    if (documentUpload !== undefined) updateData.documentUpload = documentUpload;
    if (policyAcknowledgment !== undefined) updateData.policyAcknowledgment = policyAcknowledgment;
    if (equipmentSetup !== undefined) updateData.equipmentSetup = equipmentSetup;
    if (accountCreation !== undefined) updateData.accountCreation = accountCreation;
    if (orientationComplete !== undefined) updateData.orientationComplete = orientationComplete;

    // Other updatable fields
    if (buddyAssigned !== undefined) updateData.buddyAssigned = buddyAssigned;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (status !== undefined) updateData.status = status;
    if (completedAt !== undefined) updateData.completedAt = completedAt;
    if (employeeId !== undefined) updateData.employeeId = employeeId;

    // Auto-complete: if all checklist items are done, mark status as completed
    if (Object.keys(updateData).length > 0) {
      const merged = {
        ...existingOnboarding,
        ...updateData,
      };

      const allChecklistComplete =
        merged.documentUpload === true &&
        merged.policyAcknowledgment === true &&
        merged.equipmentSetup === true &&
        merged.accountCreation === true &&
        merged.orientationComplete === true;

      if (allChecklistComplete && merged.status !== 'completed') {
        updateData.status = 'completed';
        updateData.completedAt = new Date().toISOString();
      } else if (!allChecklistComplete && merged.status === 'completed') {
        updateData.status = 'in_progress';
        updateData.completedAt = null;
      } else if (merged.status === 'pending' && Object.keys(updateData).some(k =>
        ['documentUpload', 'policyAcknowledgment', 'equipmentSetup', 'accountCreation', 'orientationComplete'].includes(k)
      )) {
        updateData.status = 'in_progress';
      }
    }

    const onboarding = await db.onboarding.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ data: onboarding });
  } catch (error) {
    console.error('Error updating onboarding record:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding record' },
      { status: 500 }
    );
  }
}
