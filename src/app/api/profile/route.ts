import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const userId = searchParams.get('userId');

    if (!employeeId && !userId) {
      return NextResponse.json(
        { error: 'employeeId or userId query parameter is required' },
        { status: 400 }
      );
    }

    // Try to find employee - support both database UUID (id) and human-readable employeeId
    let employee = null;

    if (employeeId) {
      // First try lookup by database UUID (id field)
      employee = await db.employee.findUnique({
        where: { id: employeeId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              isActive: true,
              role: true,
            },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          branch: {
            select: { id: true, name: true, code: true },
          },
          company: {
            select: { id: true, name: true, code: true, logo: true, industry: true },
          },
        },
      });

      // If not found by UUID, try by human-readable employeeId code
      if (!employee) {
        employee = await db.employee.findUnique({
          where: { employeeId: employeeId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                isActive: true,
                role: true,
              },
            },
            department: {
              select: { id: true, name: true, code: true },
            },
            branch: {
              select: { id: true, name: true, code: true },
            },
            company: {
              select: { id: true, name: true, code: true, logo: true, industry: true },
            },
          },
        });
      }
    }

    // Fallback: try lookup by userId (for users without direct employeeId link)
    if (!employee && userId) {
      employee = await db.employee.findFirst({
        where: { userId: userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              isActive: true,
              role: true,
            },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          branch: {
            select: { id: true, name: true, code: true },
          },
          company: {
            select: { id: true, name: true, code: true, logo: true, industry: true },
          },
        },
      });
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Transform the data to include department name and company info
    const profileData = {
      ...employee,
      department: employee.department?.name || null,
      branchName: employee.branch?.name || null,
      companyName: employee.company?.name || null,
      companyCode: employee.company?.code || null,
    };

    return NextResponse.json(profileData);
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
      'gender', 'address', 'designation', 'jobTitle',
      'emergencyContact', 'maritalStatus', 'nationality',
      'city', 'state', 'country', 'zipCode', 'emergencyPhone',
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
            role: true,
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

    // Try both UUID and employeeId code lookups
    let existing = await db.employee.findUnique({ where: { id: body.employeeId } });
    if (!existing) {
      existing = await db.employee.findUnique({ where: { employeeId: body.employeeId } });
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    let avatarUrl = body.avatarUrl || body.avatar;

    if (body.base64Image) {
      avatarUrl = body.base64Image;
    }

    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'avatarUrl or base64Image is required' },
        { status: 400 }
      );
    }

    const employee = await db.employee.update({
      where: { id: existing.id },
      data: { avatar: avatarUrl },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
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
