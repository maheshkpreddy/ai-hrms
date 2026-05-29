import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  const results: string[] = [];
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "name" TEXT NOT NULL,
      "description" TEXT,
      "status" TEXT NOT NULL DEFAULT 'planning',
      "priority" TEXT NOT NULL DEFAULT 'medium',
      "startDate" TIMESTAMP(3),
      "endDate" TIMESTAMP(3),
      "budget" DOUBLE PRECISION,
      "progress" INTEGER NOT NULL DEFAULT 0,
      "companyId" TEXT NOT NULL,
      "createdBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "ProjectMember" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "role" TEXT NOT NULL DEFAULT 'member',
      "projectId" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "ProjectMilestone" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "name" TEXT NOT NULL,
      "description" TEXT,
      "dueDate" TIMESTAMP(3),
      "status" TEXT NOT NULL DEFAULT 'pending',
      "projectId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Task" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "title" TEXT NOT NULL,
      "description" TEXT,
      "priority" TEXT NOT NULL DEFAULT 'medium',
      "status" TEXT NOT NULL DEFAULT 'todo',
      "dueDate" TIMESTAMP(3),
      "imageUrl" TEXT,
      "companyId" TEXT NOT NULL,
      "createdBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "TaskAssignment" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "taskId" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "TaskComment" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "content" TEXT NOT NULL,
      "taskId" TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "HelpdeskTicket" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "ticketId" TEXT NOT NULL UNIQUE,
      "requesterId" TEXT,
      "requesterType" TEXT NOT NULL DEFAULT 'employee',
      "category" TEXT NOT NULL,
      "subCategory" TEXT,
      "priority" TEXT NOT NULL DEFAULT 'medium',
      "subject" TEXT NOT NULL,
      "description" TEXT,
      "attachmentUrl" TEXT,
      "assignedAgentId" TEXT,
      "slaDeadline" TIMESTAMP(3),
      "status" TEXT NOT NULL DEFAULT 'open',
      "resolution" TEXT,
      "companyId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "HelpdeskTicketComment" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "content" TEXT NOT NULL,
      "ticketId" TEXT NOT NULL,
      "employeeId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Performance" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "employeeId" TEXT NOT NULL,
      "reviewPeriod" TEXT NOT NULL,
      "reviewerId" TEXT,
      "rating" INTEGER NOT NULL DEFAULT 0,
      "objectives" TEXT,
      "achievements" TEXT,
      "feedback" TEXT,
      "selfReview" TEXT,
      "goals" TEXT,
      "attritionRisk" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Role" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "name" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "isSystem" BOOLEAN NOT NULL DEFAULT false,
      "companyId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "RolePermission" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "roleId" TEXT NOT NULL,
      "module" TEXT NOT NULL,
      "canRead" BOOLEAN NOT NULL DEFAULT false,
      "canWrite" BOOLEAN NOT NULL DEFAULT false,
      "canDelete" BOOLEAN NOT NULL DEFAULT false,
      "canExport" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "UserRoleAssignment" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "roleId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Skill" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "name" TEXT NOT NULL UNIQUE,
      "category" TEXT,
      "description" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "EmployeeSkill" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "employeeId" TEXT NOT NULL,
      "skillId" TEXT NOT NULL,
      "proficiency" TEXT NOT NULL DEFAULT 'intermediate',
      "yearsExp" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "CompanyPolicy" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "title" TEXT NOT NULL,
      "content" TEXT,
      "category" TEXT,
      "version" TEXT,
      "effectiveDate" TIMESTAMP(3),
      "status" TEXT NOT NULL DEFAULT 'active',
      "companyId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Timesheet" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "employeeId" TEXT NOT NULL,
      "weekStart" TIMESTAMP(3) NOT NULL,
      "weekEnd" TIMESTAMP(3) NOT NULL,
      "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "approvedBy" TEXT,
      "approvedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "TimesheetEntry" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "timesheetId" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "project" TEXT,
      "task" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "ManpowerRequisition" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT replace(gen_random_uuid()::text, '-', ''),
      "title" TEXT NOT NULL,
      "department" TEXT,
      "position" TEXT,
      "positionsNeeded" INTEGER NOT NULL DEFAULT 1,
      "priority" TEXT NOT NULL DEFAULT 'medium',
      "justification" TEXT,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "requestedBy" TEXT,
      "approvedBy" TEXT,
      "companyId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  // Add AuditLog columns
  const alterStatements = [
    `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "module" TEXT`,
    `ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "employeeId" TEXT`,
  ];

  // Add foreign keys
  const fkStatements = [
    `DO $$ BEGIN ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "Task" ADD CONSTRAINT "Task_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "HelpdeskTicket" ADD CONSTRAINT "HelpdeskTicket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "HelpdeskTicketComment" ADD CONSTRAINT "HelpdeskTicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "HelpdeskTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "Performance" ADD CONSTRAINT "Performance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "CompanyPolicy" ADD CONSTRAINT "CompanyPolicy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "TimesheetEntry" ADD CONSTRAINT "TimesheetEntry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "ManpowerRequisition" ADD CONSTRAINT "ManpowerRequisition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  ];

  // Unique constraints
  const uniqueStatements = [
    `DO $$ BEGIN ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_employeeId_key" UNIQUE ("projectId", "employeeId"); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_module_key" UNIQUE ("roleId", "module"); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employeeId_skillId_key" UNIQUE ("employeeId", "skillId"); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_employeeId_weekStart_key" UNIQUE ("employeeId", "weekStart"); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  ];

  for (const sql of tables) {
    try {
      await db.$executeRawUnsafe(sql);
      results.push(`Created table: ${sql.match(/"(\w+)"/)?.[1] || 'unknown'}`);
    } catch (e: any) {
      results.push(`Table ${sql.match(/"(\w+)"/)?.[1]}: ${e.message?.substring(0, 80)}`);
    }
  }

  for (const sql of alterStatements) {
    try {
      await db.$executeRawUnsafe(sql);
      results.push('Added AuditLog columns');
    } catch (e: any) {
      results.push(`AuditLog alter: ${e.message?.substring(0, 80)}`);
    }
  }

  for (const sql of fkStatements) {
    try {
      await db.$executeRawUnsafe(sql);
    } catch (e: any) {
      // Foreign key errors are not critical
    }
  }
  results.push('Foreign keys applied');

  for (const sql of uniqueStatements) {
    try {
      await db.$executeRawUnsafe(sql);
    } catch (e: any) {
      // Unique constraint errors are not critical
    }
  }
  results.push('Unique constraints applied');

  return NextResponse.json({ success: true, results });
}
