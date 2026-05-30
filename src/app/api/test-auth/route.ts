import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password, companyCode } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' });
    }

    // EXACT same logic as authorize function
    const user = await db.user.findUnique({
      where: { email },
      include: { company: true, employee: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found', step: 1 });
    if (!user.isActive) return NextResponse.json({ error: 'User not active', step: 2 });

    if (companyCode) {
      const company = await db.company.findUnique({
        where: { code: companyCode.toUpperCase() },
      });
      if (!company) return NextResponse.json({ error: 'Company not found', step: 3, companyCode });
      if (company.status !== 'active') return NextResponse.json({ error: 'Company not active', step: 4, status: company.status });
      if (user.companyId && user.companyId !== company.id) return NextResponse.json({ error: 'Company mismatch', step: 5, userCompanyId: user.companyId, expectedCompanyId: company.id });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return NextResponse.json({ error: 'Invalid password', step: 6 });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 });
  }
}
