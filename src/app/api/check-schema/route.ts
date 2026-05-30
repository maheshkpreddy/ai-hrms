import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tables = ['User', 'Employee', 'Branch', 'Department', 'Job', 'Leave', 'Attendance', 'SubVendor', 'Document', 'TravelRequest', 'ExpenseClaim', 'Project', 'Role', 'Candidate', 'AIInterview', 'PayrollRecord', 'PayrollStructure', 'Goal', 'Performance', 'PerformanceReview', 'ReviewCycle', 'AssetAllocation', 'LearningRecord', 'Ticket', 'HelpdeskTicket', 'Client', 'Vendor', 'WorkflowDefinition', 'WorkflowStepDef', 'OfficeLocation'];
    const result: Record<string, string[]> = {};
    for (const table of tables) {
      try {
        const cols = await db.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND table_schema = 'public' ORDER BY ordinal_position`) as Array<{column_name: string}>;
        result[table] = cols.map(c => c.column_name);
      } catch (e: any) {
        result[table] = [`ERROR: ${e.message?.substring(0, 100)}`];
      }
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
