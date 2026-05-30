import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * Quick-fix endpoint to ensure login works.
 * Uses the ACTUAL database columns (isActive boolean, not status text).
 */
export async function GET() {
  const log: string[] = [];

  try {
    // Step 1: Check current Company table schema
    const companyCols = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Company' AND table_schema = 'public'
    `;
    const existingCols = new Set(companyCols.map(c => c.column_name));
    log.push(`Current Company columns: ${Array.from(existingCols).join(', ')}`);

    const hasIsActive = existingCols.has('isActive');
    const hasStatus = existingCols.has('status');

    // Step 2: Ensure MARQ company exists and is active
    log.push('Checking MARQ company...');

    let marqId: string;

    // Use the column that actually exists
    if (hasIsActive) {
      const companies: any[] = await db.$queryRaw`
        SELECT id, name, code, "isActive" FROM "Company" WHERE code = 'MARQ'
      `;

      if (companies.length > 0) {
        marqId = companies[0].id;
        if (!companies[0].isActive) {
          await db.$executeRaw`UPDATE "Company" SET "isActive" = true WHERE code = 'MARQ'`;
          log.push('Updated MARQ company isActive to true');
        } else {
          log.push('MARQ company already exists with isActive=true');
        }
      } else {
        await db.$executeRaw`
          INSERT INTO "Company" (id, name, code, industry, country, currency, timezone, "isActive", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), 'MARQ AI Technologies', 'MARQ', 'AI & Technology', 'IN', 'INR', 'Asia/Kolkata', true, NOW(), NOW())
        `;
        const newCompanies: any[] = await db.$queryRaw`
          SELECT id FROM "Company" WHERE code = 'MARQ'
        `;
        marqId = newCompanies[0].id;
        log.push('Created MARQ company with isActive=true');
      }
    } else if (hasStatus) {
      const companies: any[] = await db.$queryRaw`
        SELECT id, name, code, status FROM "Company" WHERE code = 'MARQ'
      `;

      if (companies.length > 0) {
        marqId = companies[0].id;
        if (companies[0].status !== 'active') {
          await db.$executeRaw`UPDATE "Company" SET status = 'active' WHERE code = 'MARQ'`;
          log.push('Updated MARQ company status to active');
        } else {
          log.push('MARQ company already exists with status=active');
        }
      } else {
        await db.$executeRaw`
          INSERT INTO "Company" (id, name, code, industry, country, currency, timezone, status, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), 'MARQ AI Technologies', 'MARQ', 'AI & Technology', 'IN', 'INR', 'Asia/Kolkata', 'active', NOW(), NOW())
        `;
        const newCompanies: any[] = await db.$queryRaw`
          SELECT id FROM "Company" WHERE code = 'MARQ'
        `;
        marqId = newCompanies[0].id;
        log.push('Created MARQ company with status=active');
      }
    } else {
      // Neither column exists - create with minimal columns
      await db.$executeRaw`
        INSERT INTO "Company" (id, name, code, industry, country, currency, timezone, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'MARQ AI Technologies', 'MARQ', 'AI & Technology', 'IN', 'INR', 'Asia/Kolkata', NOW(), NOW())
      `;
      const newCompanies: any[] = await db.$queryRaw`
        SELECT id FROM "Company" WHERE code = 'MARQ'
      `;
      marqId = newCompanies[0].id;
      log.push('Created MARQ company (no isActive/status columns)');
    }

    // Step 3: Ensure admin user exists with correct password
    log.push('Checking admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminEmail = 'admin@marqai.com';

    const users: any[] = await db.$queryRaw`
      SELECT id, email, password, name, role, "isActive", "companyId" FROM "User" WHERE email = ${adminEmail}
    `;

    if (users.length > 0) {
      const existingUser = users[0];
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
      await db.$executeRaw`
        INSERT INTO "User" (id, email, password, name, role, "isActive", "companyId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${adminEmail}, ${passwordHash}, 'MARQ Admin', 'super_admin', true, ${marqId}, NOW(), NOW())
      `;
      log.push('Created admin user with password=admin123, companyId=' + marqId);
    }

    // Step 4: Verify login works
    const verifyUsers: any[] = await db.$queryRaw`
      SELECT id, email, password, name, role, "isActive", "companyId" FROM "User" WHERE email = ${adminEmail}
    `;
    const verifyUser = verifyUsers[0];

    const isPasswordValid = await bcrypt.compare('admin123', verifyUser.password);
    const isUserActive = verifyUser.isActive;
    const companyMatches = verifyUser.companyId === marqId;

    log.push(`Verification: password=${isPasswordValid}, userActive=${isUserActive}, companyMatches=${companyMatches}`);

    const allGood = isPasswordValid && isUserActive && companyMatches;

    return NextResponse.json({
      success: allGood,
      message: allGood ? 'Login should work now! Use: admin@marqai.com / admin123 / MARQ' : 'Some issues remain',
      log,
      user: {
        email: verifyUser.email,
        name: verifyUser.name,
        role: verifyUser.role,
        isActive: verifyUser.isActive,
        companyId: verifyUser.companyId,
      },
      company: {
        id: marqId,
        hasIsActive,
        hasStatus,
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
