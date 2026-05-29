import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/migrate - Run schema migrations using raw SQL
export async function POST() {
  const results: string[] = [];

  try {
    // Create Role table if not exists
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Role" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "name" TEXT NOT NULL UNIQUE,
          "description" TEXT,
          "permissions" TEXT,
          "level" INTEGER NOT NULL DEFAULT 0,
          "isSystem" BOOLEAN NOT NULL DEFAULT false,
          "dashboard" TEXT NOT NULL DEFAULT 'employee',
          "menuItems" TEXT,
          "color" TEXT NOT NULL DEFAULT 'teal',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      results.push('Role table created/verified');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`Role: ${msg.substring(0, 120)}`);
    }

    // Create RolePermission table if not exists
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "RolePermission" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "roleId" TEXT NOT NULL,
          "module" TEXT NOT NULL,
          "canRead" BOOLEAN NOT NULL DEFAULT false,
          "canWrite" BOOLEAN NOT NULL DEFAULT false,
          "canModify" BOOLEAN NOT NULL DEFAULT false,
          "canDelete" BOOLEAN NOT NULL DEFAULT false,
          "canAdmin" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "RolePermission_roleId_module_unique" UNIQUE ("roleId", "module")
        );
      `);
      results.push('RolePermission table created/verified');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`RolePermission: ${msg.substring(0, 120)}`);
    }

    // Create CompanyMember table if not exists
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CompanyMember" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "companyId" TEXT NOT NULL,
          "employeeId" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'employee',
          "status" TEXT NOT NULL DEFAULT 'approved',
          "joinedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "CompanyMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "CompanyMember_companyId_employeeId_unique" UNIQUE ("companyId", "employeeId")
        );
      `);
      results.push('CompanyMember table created/verified');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`CompanyMember: ${msg.substring(0, 120)}`);
    }

    // Add roleId column to User table if not exists
    try {
      await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" TEXT;`);
      results.push('User.roleId column added/verified');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`User.roleId: ${msg.substring(0, 80)}`);
    }

    // Add roleId foreign key constraint to User table
    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'User_roleId_fkey' AND table_name = 'User'
          ) THEN
            ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" 
            FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      results.push('User.roleId FK added/verified');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push(`User.roleId FK: ${msg.substring(0, 80)}`);
    }

    // Add missing Employee columns
    const employeeColumns = [
      { name: 'bankAccount', type: 'TEXT' },
      { name: 'panNumber', type: 'TEXT' },
      { name: 'pfNumber', type: 'TEXT' },
      { name: 'esiNumber', type: 'TEXT' },
    ];
    for (const col of employeeColumns) {
      try {
        await db.$executeRawUnsafe(`ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`);
        results.push(`Employee.${col.name} added/verified`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push(`Employee.${col.name}: ${msg.substring(0, 80)}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      error: msg.substring(0, 500),
      partialResults: results,
    }, { status: 500 });
  }
}

// GET - Check migration status
export async function GET() {
  try {
    const roleCount = await db.role.count().catch(() => -1);
    const rpCount = await db.rolePermission.count().catch(() => -1);
    const cmCount = await db.companyMember.count().catch(() => -1);

    return NextResponse.json({
      Role: roleCount >= 0 ? `${roleCount} records` : 'table missing',
      RolePermission: rpCount >= 0 ? `${rpCount} records` : 'table missing',
      CompanyMember: cmCount >= 0 ? `${cmCount} records` : 'table missing',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg.substring(0, 300) }, { status: 500 });
  }
}
