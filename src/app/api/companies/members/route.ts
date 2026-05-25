import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { companyId };

    if (status) {
      where.status = status;
    }

    if (role) {
      where.role = role;
    }

    const [members, total] = await Promise.all([
      db.companyMember.findMany({
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
        },
      }),
      db.companyMember.count({ where }),
    ]);

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching company members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company members' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['approved', 'rejected', 'removed'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await db.companyMember.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Company member not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { status: body.status };

    // Set joinedAt when approved
    if (body.status === 'approved') {
      updateData.joinedAt = new Date().toISOString();
    }

    // Optionally update role
    if (body.role) {
      updateData.role = body.role;
    }

    const member = await db.companyMember.update({
      where: { id: body.id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating company member:', error);
    return NextResponse.json(
      { error: 'Failed to update company member' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.companyId || !body.employeeId) {
      return NextResponse.json(
        { error: 'companyId and employeeId are required' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existing = await db.companyMember.findUnique({
      where: {
        companyId_employeeId: {
          companyId: body.companyId,
          employeeId: body.employeeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Employee is already a member of this company' },
        { status: 400 }
      );
    }

    const member = await db.companyMember.create({
      data: {
        companyId: body.companyId,
        employeeId: body.employeeId,
        role: body.role || 'employee',
        status: body.status || 'approved',
        joinedAt: body.status === 'approved' || !body.status
          ? new Date().toISOString()
          : null,
      },
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
        company: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding company member:', error);
    return NextResponse.json(
      { error: 'Failed to add company member' },
      { status: 500 }
    );
  }
}
