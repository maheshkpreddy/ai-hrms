import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * Quick-fix endpoint to ensure login works.
 * Run: GET /api/fix-login
 * This will:
 * 1. Ensure the MARQ company exists with status='active'
 * 2. Ensure the admin user exists with correct password and is linked to MARQ
 */
export async function GET() {
  const log: string[] = [];

  try {
    // Step 1: Ensure MARQ company exists with status='active'
    log.push('Checking MARQ company...');
    let marqCompany = await db.company.findUnique({ where: { code: 'MARQ' } });

    if (marqCompany) {
      if (marqCompany.status !== 'active') {
        await db.$executeRaw`UPDATE "Company" SET status = 'active' WHERE code = 'MARQ'`;
        log.push('Updated MARQ company status to active');
      } else {
        log.push('MARQ company already exists with active status');
      }
    } else {
      // Create MARQ company using raw SQL (avoids schema mismatch issues)
      await db.$executeRaw`
        INSERT INTO "Company" (id, name, code, industry, country, currency, timezone, status, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'MARQ AI Technologies', 'MARQ', 'AI & Technology', 'IN', 'INR', 'Asia/Kolkata', 'active', NOW(), NOW())
      `;
      marqCompany = await db.company.findUnique({ where: { code: 'MARQ' } });
      log.push('Created MARQ company with active status');
    }

    const marqId = marqCompany?.id;
    if (!marqId) {
      return NextResponse.json({ error: 'Failed to create/find MARQ company', log });
    }

    // Step 2: Ensure admin user exists with correct password
    log.push('Checking admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminEmail = 'admin@marqai.com';

    const users: any[] = await db.$queryRaw`
      SELECT id, email, password, name, role, "isActive", "companyId" FROM "User" WHERE email = ${adminEmail}
    `;

    if (users.length > 0) {
      const existingUser = users[0];
      // Update password, companyId, and isActive
      await db.$executeRaw`
        UPDATE "User" SET
          password = ${passwordHash},
          "companyId" = ${marqId},
          "isActive" = true,
          "updatedAt" = NOW()
        WHERE email = ${adminEmail}
      `;
      log.push(`Updated admin user (id=${existingUser.id}) with fresh password and companyId=${marqId}`);
    } else {
      // Create admin user
      await db.$executeRaw`
        INSERT INTO "User" (id, email, password, name, role, "isActive", "companyId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${adminEmail}, ${passwordHash}, 'MARQ Admin', 'super_admin', true, ${marqId}, NOW(), NOW())
      `;
      log.push('Created admin user with password=admin123, companyId=' + marqId);
    }

    // Step 3: Verify login works
    const verifyUsers: any[] = await db.$queryRaw`
      SELECT id, email, password, name, role, "isActive", "companyId" FROM "User" WHERE email = ${adminEmail}
    `;
    const verifyUser = verifyUsers[0];

    const isPasswordValid = await bcrypt.compare('admin123', verifyUser.password);
    const isCompanyActive = marqCompany?.status === 'active';
    const isUserActive = verifyUser.isActive;
    const companyMatches = verifyUser.companyId === marqId;

    log.push(`Verification: password=${isPasswordValid}, companyActive=${isCompanyActive}, userActive=${isUserActive}, companyMatches=${companyMatches}`);

    const allGood = isPasswordValid && isCompanyActive && isUserActive && companyMatches;

    return NextResponse.json({
      success: allGood,
      message: allGood ? 'Login should work now!' : 'Some issues remain',
      log,
      user: {
        email: verifyUser.email,
        name: verifyUser.name,
        role: verifyUser.role,
        isActive: verifyUser.isActive,
        companyId: verifyUser.companyId,
      },
      company: {
        id: marqCompany?.id,
        name: marqCompany?.name,
        code: marqCompany?.code,
        status: marqCompany?.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      log,
    }, { status: 500 });
  }
}
