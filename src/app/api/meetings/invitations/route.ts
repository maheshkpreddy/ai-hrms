import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');
    const rsvpStatus = searchParams.get('rsvpStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { meetingId };

    if (rsvpStatus) {
      where.rsvpStatus = rsvpStatus;
    }

    const [invitations, total] = await Promise.all([
      db.meetingInvitation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          meeting: {
            select: {
              id: true,
              title: true,
              date: true,
              startTime: true,
              endTime: true,
              status: true,
            },
          },
        },
      }),
      db.meetingInvitation.count({ where }),
    ]);

    return NextResponse.json({
      invitations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching meeting invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting invitations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.rsvpStatus) {
      return NextResponse.json(
        { error: 'id and rsvpStatus are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'accepted', 'declined'];
    if (!validStatuses.includes(body.rsvpStatus)) {
      return NextResponse.json(
        { error: `rsvpStatus must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await db.meetingInvitation.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Meeting invitation not found' },
        { status: 404 }
      );
    }

    const invitation = await db.meetingInvitation.update({
      where: { id: body.id },
      data: {
        rsvpStatus: body.rsvpStatus,
        respondedAt: new Date().toISOString(),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true,
            avatar: true,
          },
        },
        meeting: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error updating meeting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting invitation' },
      { status: 500 }
    );
  }
}
