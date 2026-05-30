import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await db.auditLog.findMany({
      where: { action: 'AUTH_DEBUG' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ logs: logs.map(l => ({ time: l.createdAt, details: l.details })) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.auditLog.deleteMany({ where: { action: 'AUTH_DEBUG' } });
    return NextResponse.json({ cleared: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
