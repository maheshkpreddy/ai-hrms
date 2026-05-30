import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = 'admin@marqai.com';
    const password = 'admin123';
    const companyCode = 'MARQ';

    // Step 1: Find user using raw SQL (avoids schema mismatch)
    const users: any[] = await db.$queryRaw`
      SELECT id, email, password, name, role, "isActive", "companyId"
      FROM "User" WHERE email = ${email}
    `;

    if (!users[0]) {
      return NextResponse.json({ step: 'find_user', error: 'User not found', email });
    }

    const user = users[0];

    // Step 2: Check isActive
    if (!user.isActive) {
      return NextResponse.json({ step: 'is_active', error: 'User is not active', userId: user.id });
    }

    // Step 3: Verify company code using raw SQL
    if (companyCode) {
      const companies: any[] = await db.$queryRaw`
        SELECT id, name, code, "isActive" FROM "Company" WHERE code = ${companyCode.toUpperCase()}
      `;
      if (!companies[0]) {
        return NextResponse.json({ step: 'company_code', error: 'Company not found', companyCode, userCompanyId: user.companyId });
      }
      const company = companies[0];
      if (!company.isActive) {
        return NextResponse.json({ step: 'company_active', error: 'Company is not active', companyCode, isActive: company.isActive });
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

    // Step 5: Get employee info
    let employeeData = null;
    try {
      const employees: any[] = await db.$queryRaw`
        SELECT id, "employeeId" FROM "Employee" WHERE "userId" = ${user.id}
      `;
      if (employees[0]) {
        employeeData = { id: employees[0].id, employeeId: employees[0].employeeId };
      }
    } catch {}

    return NextResponse.json({
      step: 'success',
      user: { id: user.id, email: user.email, name: user.name, role: user.role, companyId: user.companyId },
      company: companyCode ? { code: companyCode } : null,
      employee: employeeData,
    });
  } catch (error: any) {
    return NextResponse.json({ step: 'exception', error: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 });
  }
}
