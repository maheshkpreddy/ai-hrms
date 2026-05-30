import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

// POST /api/alter-schema - Add missing columns using DIRECT_URL (bypasses PgBouncer)
export async function POST() {
  // Create a Prisma client that uses the direct URL for DDL operations
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    return NextResponse.json({ error: 'DIRECT_URL not configured' }, { status: 500 });
  }

  const directDb = new PrismaClient({
    datasources: {
      db: { url: directUrl },
    },
  });

  const results: string[] = [];

  try {
    // Get current Company columns
    const companyCols = await directDb.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Company' AND table_schema = 'public'
    `;
    const existingCompanyCols = new Set(companyCols.map(c => c.column_name));
    results.push(`Current Company columns: ${Array.from(existingCompanyCols).join(', ')}`);

    // Add missing Company columns based on current Prisma schema
    const companyMigrations: [string, string][] = [
      ['legalName', 'TEXT'],
      ['gstVat', 'TEXT'],
      ['panTanCin', 'TEXT'],
      ['registrationNumber', 'TEXT'],
      ['address', 'TEXT'],
      ['city', 'TEXT'],
      ['state', 'TEXT'],
      ['payrollCycle', 'TEXT'],
      ['financialYear', 'TEXT'],
      ['defaultLanguage', 'TEXT'],
      ['status', `TEXT DEFAULT 'active'`],
    ];

    for (const [col, type] of companyMigrations) {
      if (!existingCompanyCols.has(col)) {
        try {
          await directDb.$executeRawUnsafe(`ALTER TABLE "Company" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Company.${col}`);
        } catch (e: any) {
          results.push(`Skip Company.${col}: ${e.message?.substring(0, 150)}`);
        }
      } else {
        results.push(`Company.${col} already exists`);
      }
    }

    // Migrate isActive -> status for Company
    if (existingCompanyCols.has('isActive') && existingCompanyCols.has('status')) {
      try {
        await directDb.$executeRawUnsafe(`UPDATE "Company" SET "status" = CASE WHEN "isActive" = true THEN 'active' ELSE 'inactive' END WHERE "status" IS NULL`);
        results.push('Migrated Company.isActive values to Company.status');
      } catch (e: any) {
        results.push(`Migration isActive->status failed: ${e.message?.substring(0, 150)}`);
      }
    }

    // Check Employee columns
    const empCols = await directDb.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Employee' AND table_schema = 'public'
    `;
    const existingEmpCols = new Set(empCols.map(c => c.column_name));

    const empMigrations: [string, string][] = [
      ['zipCode', 'TEXT'],
      ['maritalStatus', 'TEXT'],
      ['emergencyContact', 'TEXT'],
      ['emergencyPhone', 'TEXT'],
    ];

    for (const [col, type] of empMigrations) {
      if (!existingEmpCols.has(col)) {
        try {
          await directDb.$executeRawUnsafe(`ALTER TABLE "Employee" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Employee.${col}`);
        } catch (e: any) {
          results.push(`Skip Employee.${col}: ${e.message?.substring(0, 150)}`);
        }
      }
    }

    // Check Job columns
    const jobCols = await directDb.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Job' AND table_schema = 'public'
    `;
    const existingJobCols = new Set(jobCols.map(c => c.column_name));
    const jobMigrations: [string, string][] = [
      ['filledPositions', 'INTEGER DEFAULT 0'],
      ['closingDate', 'TIMESTAMP(3)'],
      ['companyId', 'TEXT'],
    ];
    for (const [col, type] of jobMigrations) {
      if (!existingJobCols.has(col)) {
        try {
          await directDb.$executeRawUnsafe(`ALTER TABLE "Job" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Job.${col}`);
        } catch (e: any) {
          results.push(`Skip Job.${col}: ${e.message?.substring(0, 150)}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Alter schema error:', error);
    return NextResponse.json(
      { success: false, error: error.message?.substring(0, 500) },
      { status: 500 }
    );
  } finally {
    await directDb.$disconnect();
  }
}
