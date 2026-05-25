import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const meeting = await db.meeting.findUnique({
      where: { id },
      include: {
        invitations: {
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
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
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

    const existing = await db.meeting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title', 'description', 'date', 'startTime', 'endTime',
      'location', 'meetingType', 'status', 'companyId',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const meeting = await db.meeting.update({
      where: { id },
      data: updateData,
      include: {
        invitations: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                email: true,
                department: true,
                avatar: true,
              },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
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

    const existing = await db.meeting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Delete related records first
    await db.$transaction([
      db.meetingInvitation.deleteMany({ where: { meetingId: id } }),
      db.meeting.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
