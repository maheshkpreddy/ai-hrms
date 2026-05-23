import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'employeeId query parameter is required' },
        { status: 400 }
      );
    }

    const employee = await db.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            roleId: true,
            isActive: true,
            role: {
              select: {
                id: true,
                name: true,
                permissions: true,
              },
            },
          },
        },
        companyMembers: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                code: true,
                logo: true,
                industry: true,
              },
            },
          },
          where: { status: 'approved' },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Employee id is required' },
        { status: 400 }
      );
    }

    const existing = await db.employee.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'avatar', 'dateOfBirth',
      'gender', 'address', 'designation', 'jobTitle', 'department',
      'emergencyContact', 'bankAccount', 'panNumber', 'pfNumber', 'esiNumber',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const employee = await db.employee.update({
      where: { id: body.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId) {
      return NextResponse.json(
        { error: 'employeeId is required' },
        { status: 400 }
      );
    }

    const existing = await db.employee.findUnique({
      where: { id: body.employeeId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    let avatarUrl = body.avatarUrl || body.avatar;

    // If base64 image is provided, save the avatar URL
    // In a production app, you would upload to cloud storage
    if (body.base64Image) {
      // For now, store the base64 as the avatar
      // In production, upload to S3/Cloudflare R2 and store the URL
      avatarUrl = body.base64Image;
    }

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'avatarUrl or base64Image is required' },
        { status: 400 }
      );
    }

    const employee = await db.employee.update({
      where: { id: body.employeeId },
      data: { avatar: avatarUrl },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Also update user avatar if linked
    if (employee.user) {
      await db.user.update({
        where: { id: employee.user.id },
        data: { avatar: avatarUrl },
      });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile image' },
      { status: 500 }
    );
  }
}
