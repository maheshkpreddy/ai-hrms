import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Verify the company exists and is active
    const company = await db.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        code: true,
        industry: true,
        logo: true,
        country: true,
        currency: true,
        status: true,
        _count: {
          select: { employees: true, departments: true, branches: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (company.status !== 'active') {
      return NextResponse.json({ error: 'Company is not active' }, { status: 400 });
    }

    // Update the user's companyId in the database
    try {
      await db.$executeRaw`
        UPDATE "User" SET "companyId" = ${companyId}, "updatedAt" = NOW() WHERE id = ${userId}
      `;
    } catch (e) {
      console.error('Failed to update user companyId:', e);
      // Non-critical: the local state will still update
    }

    // Create audit log
    try {
      await db.auditLog.create({
        data: {
          action: 'SWITCH_COMPANY',
          entity: 'User',
          entityId: userId,
          userId,
          details: `Switched to company: ${company.name} (${company.code})`,
        },
      });
    } catch (e) {
      console.error('Failed to create audit log:', e);
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        code: company.code,
        industry: company.industry || '',
        logo: company.logo || '',
        country: company.country || '',
        currency: company.currency || 'USD',
        employeeCount: company._count.employees,
        status: company.status,
      },
    });
  } catch (error) {
    console.error('Switch company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
