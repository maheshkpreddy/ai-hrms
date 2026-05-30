import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = 'admin@marqai.com';
    const password = 'admin123';
    const companyCode = 'MARQ';

    // Step 1: Find user
    const user = await db.user.findUnique({
      where: { email },
      include: { company: true, employee: true },
    });

    if (!user) {
      return NextResponse.json({ step: 'find_user', error: 'User not found', email });
    }

    // Step 2: Check isActive
    if (!user.isActive) {
      return NextResponse.json({ step: 'is_active', error: 'User is not active', userId: user.id });
    }

    // Step 3: Verify company code
    if (companyCode) {
      const company = await db.company.findUnique({
        where: { code: companyCode.toUpperCase() },
      });
      if (!company) {
        return NextResponse.json({ step: 'company_code', error: 'Company not found', companyCode, userCompanyId: user.companyId });
      }
      if (!company.isActive) {
        return NextResponse.json({ step: 'company_active', error: 'Company is not active', companyCode });
      }
      if (user.companyId && user.companyId !== company.id) {
        return NextResponse.json({ step: 'company_mismatch', error: 'User company does not match', userCompanyId: user.companyId, expectedCompanyId: company.id });
      }
    }

    // Step 4: Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ step: 'password', error: 'Invalid password', passwordLength: password.length, hashLength: user.password.length, hashPrefix: user.password.substring(0, 10) });
    }

    return NextResponse.json({
      step: 'success',
      user: { id: user.id, email: user.email, name: user.name, role: user.role, companyId: user.companyId },
      company: user.company ? { id: user.company.id, name: user.company.name, code: user.company.code } : null,
      employee: user.employee ? { id: user.employee.id, employeeId: user.employee.employeeId } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ step: 'exception', error: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 });
  }
}
