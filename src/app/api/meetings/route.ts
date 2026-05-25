import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const meetingType = searchParams.get('meetingType');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};

    if (companyId) {
      where.companyId = companyId;
    }

    if (status) {
      where.status = status;
    }

    if (meetingType) {
      where.meetingType = meetingType;
    }

    // If employeeId is provided, filter meetings where the employee has an invitation
    if (employeeId) {
      where.invitations = {
        some: { employeeId },
      };
    }

    const [meetings, total] = await Promise.all([
      db.meeting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      db.meeting.count({ where }),
    ]);

    return NextResponse.json({
      meetings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.date || !body.startTime) {
      return NextResponse.json(
        { error: 'title, date, and startTime are required' },
        { status: 400 }
      );
    }

    const { invitedEmployeeIds = [], ...meetingData } = body;

    const meeting = await db.meeting.create({
      data: {
        companyId: meetingData.companyId,
        title: meetingData.title,
        description: meetingData.description,
        date: meetingData.date,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        location: meetingData.location,
        meetingType: meetingData.meetingType,
        status: meetingData.status || 'scheduled',
        createdBy: meetingData.createdBy,
      },
    });

    // Create invitations for each employee
    if (invitedEmployeeIds.length > 0) {
      await db.meetingInvitation.createMany({
        data: invitedEmployeeIds.map((empId: string) => ({
          meetingId: meeting.id,
          employeeId: empId,
          rsvpStatus: 'pending',
        })),
      });
    }

    // Fetch the meeting with relations to return
    const createdMeeting = await db.meeting.findUnique({
      where: { id: meeting.id },
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

    return NextResponse.json(createdMeeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
