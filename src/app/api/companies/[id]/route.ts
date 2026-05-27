import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await db.company.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                email: true,
                department: true,
                designation: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        officeLocations: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tasks: true, meetings: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'description', 'industry', 'website', 'logo', 'address',
      'city', 'state', 'country', 'pincode', 'phone', 'email',
      'foundedYear', 'employeeCount', 'isActive',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const company = await db.company.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Delete related records first (cascading manually)
    await db.$transaction([
      db.taskComment.deleteMany({
        where: { task: { companyId: id } },
      }),
      db.taskAssignment.deleteMany({
        where: { task: { companyId: id } },
      }),
      db.task.deleteMany({ where: { companyId: id } }),
      db.meetingInvitation.deleteMany({
        where: { meeting: { companyId: id } },
      }),
      db.meeting.deleteMany({ where: { companyId: id } }),
      db.officeLocation.deleteMany({ where: { companyId: id } }),
      db.companyMember.deleteMany({ where: { companyId: id } }),
      db.company.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
