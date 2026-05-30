import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.code) {
      return NextResponse.json(
        { error: 'employeeId and code are required' },
        { status: 400 }
      );
    }

    // Find company by join code
    const company = await db.company.findUnique({
      where: { code: body.code.toUpperCase() },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Invalid join code' },
        { status: 404 }
      );
    }

    if (company.status !== 'active') {
      return NextResponse.json(
        { error: 'Company is not accepting new members' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await db.companyMember.findUnique({
      where: {
        companyId_employeeId: {
          companyId: company.id,
          employeeId: body.employeeId,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === 'approved') {
        return NextResponse.json(
          { error: 'Already a member of this company' },
          { status: 400 }
        );
      }
      if (existingMember.status === 'pending') {
        return NextResponse.json(
          { error: 'Join request already pending' },
          { status: 400 }
        );
      }
      // If rejected/removed, allow re-joining by updating status
      const updated = await db.companyMember.update({
        where: { id: existingMember.id },
        data: { status: 'pending', joinedAt: null },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    // Create new member with pending status
    const member = await db.companyMember.create({
      data: {
        companyId: company.id,
        employeeId: body.employeeId,
        role: 'employee',
        status: 'pending',
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
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

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error joining company:', error);
    return NextResponse.json(
      { error: 'Failed to join company' },
      { status: 500 }
    );
  }
}
