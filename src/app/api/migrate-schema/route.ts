import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/migrate-schema - Add missing columns to the database
export async function POST() {
  try {
    const results: string[] = [];

    // Get current columns in Company table
    const companyColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Company' AND table_schema = 'public'
    `;
    const existingCols = new Set(companyColumns.map(c => c.column_name));
    results.push(`Company columns: ${Array.from(existingCols).join(', ')}`);

    // Add missing Company columns
    const companyMigrations: [string, string][] = [
      ['description', 'TEXT'],
      ['logo', 'TEXT'],
      ['domain', 'TEXT'],
      ['website', 'TEXT'],
      ['address', 'TEXT'],
      ['city', 'TEXT'],
      ['state', 'TEXT'],
      ['pincode', 'TEXT'],
      ['phone', 'TEXT'],
      ['email', 'TEXT'],
      ['foundedYear', 'INTEGER'],
      ['employeeCount', 'INTEGER'],
      ['createdBy', 'TEXT'],
      ['parentId', 'TEXT'],
    ];

    for (const [col, type] of companyMigrations) {
      if (!existingCols.has(col)) {
        try {
          // Use parameterized approach for safety
          if (col === 'parentId') {
            await db.$executeRawUnsafe(`ALTER TABLE "Company" ADD COLUMN "parentId" TEXT`);
            // Add foreign key
            try {
              await db.$executeRawUnsafe(`ALTER TABLE "Company" ADD CONSTRAINT "Company_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
            } catch { /* FK might already exist */ }
          } else {
            await db.$executeRawUnsafe(`ALTER TABLE "Company" ADD COLUMN "${col}" ${type}`);
          }
          results.push(`Added Company.${col}`);
        } catch (e: any) {
          results.push(`Skip Company.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Check and add missing columns for other key tables
    // Branch table
    const branchColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Branch' AND table_schema = 'public'
    `;
    const branchCols = new Set(branchColumns.map(c => c.column_name));
    const branchMigrations: [string, string][] = [
      ['address', 'TEXT'],
      ['isActive', 'BOOLEAN DEFAULT true'],
    ];
    for (const [col, type] of branchMigrations) {
      if (!branchCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Branch" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Branch.${col}`);
        } catch (e: any) {
          results.push(`Skip Branch.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Department table
    const deptColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Department' AND table_schema = 'public'
    `;
    const deptCols = new Set(deptColumns.map(c => c.column_name));
    const deptMigrations: [string, string][] = [
      ['description', 'TEXT'],
      ['isActive', 'BOOLEAN DEFAULT true'],
    ];
    for (const [col, type] of deptMigrations) {
      if (!deptCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Department" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Department.${col}`);
        } catch (e: any) {
          results.push(`Skip Department.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Employee table - add missing columns
    const empColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Employee' AND table_schema = 'public'
    `;
    const empCols = new Set(empColumns.map(c => c.column_name));
    const empMigrations: [string, string][] = [
      ['phone', 'TEXT'],
      ['gender', 'TEXT'],
      ['dateOfBirth', 'TIMESTAMP(3)'],
      ['nationality', 'TEXT'],
      ['city', 'TEXT'],
      ['state', 'TEXT'],
      ['country', 'TEXT'],
      ['probationEnd', 'TIMESTAMP(3)'],
      ['reportingManagerId', 'TEXT'],
      ['avatar', 'TEXT'],
    ];
    for (const [col, type] of empMigrations) {
      if (!empCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Employee" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Employee.${col}`);
        } catch (e: any) {
          results.push(`Skip Employee.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Job table - add missing columns
    const jobColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Job' AND table_schema = 'public'
    `;
    const jobCols = new Set(jobColumns.map(c => c.column_name));
    const jobMigrations: [string, string][] = [
      ['filledPositions', 'INTEGER DEFAULT 0'],
      ['closingDate', 'TIMESTAMP(3)'],
      ['companyId', 'TEXT'],
    ];
    for (const [col, type] of jobMigrations) {
      if (!jobCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Job" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Job.${col}`);
        } catch (e: any) {
          results.push(`Skip Job.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // SubVendor table - add missing columns
    const svColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'SubVendor' AND table_schema = 'public'
    `;
    const svCols = new Set(svColumns.map(c => c.column_name));
    const svMigrations: [string, string][] = [
      ['companyName', 'TEXT'],
      ['contactPerson', 'TEXT'],
    ];
    for (const [col, type] of svMigrations) {
      if (!svCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "SubVendor" ADD COLUMN "${col}" ${type}`);
          results.push(`Added SubVendor.${col}`);
        } catch (e: any) {
          results.push(`Skip SubVendor.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Leave table - add missing columns
    const leaveColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Leave' AND table_schema = 'public'
    `;
    const leaveCols = new Set(leaveColumns.map(c => c.column_name));
    const leaveMigrations: [string, string][] = [
      ['approverId', 'TEXT'],
    ];
    for (const [col, type] of leaveMigrations) {
      if (!leaveCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Leave" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Leave.${col}`);
        } catch (e: any) {
          results.push(`Skip Leave.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // TravelRequest table - add missing columns
    const trColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'TravelRequest' AND table_schema = 'public'
    `;
    const trCols = new Set(trColumns.map(c => c.column_name));
    const trMigrations: [string, string][] = [
      ['approvedCost', 'FLOAT'],
      ['approverId', 'TEXT'],
    ];
    for (const [col, type] of trMigrations) {
      if (!trCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "TravelRequest" ADD COLUMN "${col}" ${type}`);
          results.push(`Added TravelRequest.${col}`);
        } catch (e: any) {
          results.push(`Skip TravelRequest.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // ExpenseClaim table - add missing columns
    const ecColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'ExpenseClaim' AND table_schema = 'public'
    `;
    const ecCols = new Set(ecColumns.map(c => c.column_name));
    const ecMigrations: [string, string][] = [
      ['approverId', 'TEXT'],
    ];
    for (const [col, type] of ecMigrations) {
      if (!ecCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "ExpenseClaim" ADD COLUMN "${col}" ${type}`);
          results.push(`Added ExpenseClaim.${col}`);
        } catch (e: any) {
          results.push(`Skip ExpenseClaim.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Document table - add missing columns
    const docColumns = await db.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Document' AND table_schema = 'public'
    `;
    const docCols = new Set(docColumns.map(c => c.column_name));
    const docMigrations: [string, string][] = [
      ['fileName', 'TEXT'],
      ['fileSize', 'INTEGER'],
      ['mimeType', 'TEXT'],
      ['uploadedAt', 'TIMESTAMP(3)'],
    ];
    for (const [col, type] of docMigrations) {
      if (!docCols.has(col)) {
        try {
          await db.$executeRawUnsafe(`ALTER TABLE "Document" ADD COLUMN "${col}" ${type}`);
          results.push(`Added Document.${col}`);
        } catch (e: any) {
          results.push(`Skip Document.${col}: ${e.message?.substring(0, 100)}`);
        }
      }
    }

    // Now create tables that might not exist at all
    const tables = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const tableNames = new Set(tables.map(t => t.tablename));
    results.push(`Tables: ${Array.from(tableNames).sort().join(', ')}`);

    // Create OfficeLocation table if missing
    if (!tableNames.has('OfficeLocation')) {
      await db.$executeRawUnsafe(`
        CREATE TABLE "OfficeLocation" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "companyId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "address" TEXT,
          "latitude" DOUBLE PRECISION NOT NULL,
          "longitude" DOUBLE PRECISION NOT NULL,
          "radius" DOUBLE PRECISION DEFAULT 500,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP(3) DEFAULT NOW(),
          "updatedAt" TIMESTAMP(3) DEFAULT NOW()
        )
      `);
      results.push('Created OfficeLocation table');
    }

    // Create CompanyMember table if missing
    if (!tableNames.has('CompanyMember')) {
      await db.$executeRawUnsafe(`
        CREATE TABLE "CompanyMember" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "companyId" TEXT NOT NULL,
          "employeeId" TEXT NOT NULL,
          "role" TEXT DEFAULT 'employee',
          "status" TEXT DEFAULT 'approved',
          "joinedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) DEFAULT NOW(),
          "updatedAt" TIMESTAMP(3) DEFAULT NOW()
        )
      `);
      results.push('Created CompanyMember table');
    }

    // Create CompanyPolicy table if missing
    if (!tableNames.has('CompanyPolicy')) {
      await db.$executeRawUnsafe(`
        CREATE TABLE "CompanyPolicy" (
          "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "title" TEXT NOT NULL,
          "content" TEXT,
          "category" TEXT,
          "version" TEXT,
          "effectiveDate" TIMESTAMP(3),
          "status" TEXT DEFAULT 'active',
          "companyId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) DEFAULT NOW(),
          "updatedAt" TIMESTAMP(3) DEFAULT NOW()
        )
      `);
      results.push('Created CompanyPolicy table');
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: error.message?.substring(0, 500) }, { status: 500 });
  }
}
