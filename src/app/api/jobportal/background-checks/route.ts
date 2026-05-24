import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/jobportal/background-checks - List background checks with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const applicationId = searchParams.get('applicationId');
    const vendorName = searchParams.get('vendorName');
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

    if (vendorName) {
      where.vendorName = { contains: vendorName, mode: 'insensitive' };
    }

    const [backgroundChecks, total] = await Promise.all([
      db.backgroundCheck.findMany({
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
      db.backgroundCheck.count({ where }),
    ]);

    return NextResponse.json({
      data: backgroundChecks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching background checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch background checks' },
      { status: 500 }
    );
  }
}

// POST /api/jobportal/background-checks - Initiate a background check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationId,
      vendorName,
      initiatedAt,
      notes,
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

    // Check if background check already exists
    const existingCheck = await db.backgroundCheck.findUnique({
      where: { applicationId },
    });

    if (existingCheck) {
      return NextResponse.json(
        { error: 'Background check already exists for this application' },
        { status: 409 }
      );
    }

    const backgroundCheck = await db.backgroundCheck.create({
      data: {
        applicationId,
        status: 'pending',
        vendorName,
        criminalCheck: 'pending',
        educationCheck: 'pending',
        employmentCheck: 'pending',
        addressCheck: 'pending',
        drugTest: 'pending',
        initiatedAt: initiatedAt || new Date().toISOString(),
        notes,
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

    return NextResponse.json({ data: backgroundCheck }, { status: 201 });
  } catch (error) {
    console.error('Error initiating background check:', error);
    return NextResponse.json(
      { error: 'Failed to initiate background check' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobportal/background-checks - Update individual check statuses
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      criminalCheck,
      educationCheck,
      employmentCheck,
      addressCheck,
      drugTest,
      status,
      vendorName,
      reportUrl,
      notes,
      completedAt,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Background check record id is required' },
        { status: 400 }
      );
    }

    // Verify background check record exists
    const existingCheck = await db.backgroundCheck.findUnique({
      where: { id },
    });

    if (!existingCheck) {
      return NextResponse.json(
        { error: 'Background check record not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Individual check status fields
    if (criminalCheck !== undefined) updateData.criminalCheck = criminalCheck;
    if (educationCheck !== undefined) updateData.educationCheck = educationCheck;
    if (employmentCheck !== undefined) updateData.employmentCheck = employmentCheck;
    if (addressCheck !== undefined) updateData.addressCheck = addressCheck;
    if (drugTest !== undefined) updateData.drugTest = drugTest;

    // Other updatable fields
    if (status !== undefined) updateData.status = status;
    if (vendorName !== undefined) updateData.vendorName = vendorName;
    if (reportUrl !== undefined) updateData.reportUrl = reportUrl;
    if (notes !== undefined) updateData.notes = notes;
    if (completedAt !== undefined) updateData.completedAt = completedAt;

    // Auto-update overall status based on individual check results
    if (Object.keys(updateData).some(k =>
      ['criminalCheck', 'educationCheck', 'employmentCheck', 'addressCheck', 'drugTest'].includes(k)
    )) {
      const merged = {
        ...existingCheck,
        ...updateData,
      };

      const allChecks = [
        merged.criminalCheck,
        merged.educationCheck,
        merged.employmentCheck,
        merged.addressCheck,
        merged.drugTest,
      ];

      const anyFailed = allChecks.some(c => c === 'failed' || c === 'flagged');
      const allComplete = allChecks.every(c => c !== 'pending' && c !== 'in_progress');

      if (anyFailed) {
        updateData.status = 'failed';
        updateData.completedAt = new Date().toISOString();
      } else if (allComplete) {
        updateData.status = 'completed';
        updateData.completedAt = new Date().toISOString();
      } else if (allChecks.some(c => c !== 'pending')) {
        updateData.status = 'in_progress';
      }
    }

    const backgroundCheck = await db.backgroundCheck.update({
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

    return NextResponse.json({ data: backgroundCheck });
  } catch (error) {
    console.error('Error updating background check:', error);
    return NextResponse.json(
      { error: 'Failed to update background check' },
      { status: 500 }
    );
  }
}
