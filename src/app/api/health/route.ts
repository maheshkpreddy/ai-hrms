import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET',
      DIRECT_URL: process.env.DIRECT_URL ? 'SET (length: ' + process.env.DIRECT_URL.length + ')' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    }
  }

  // Test Prisma connection
  try {
    const userCount = await db.user.count()
    const companyCount = await db.company.count()
    const employeeCount = await db.employee.count()
    results.prisma = {
      status: 'ok',
      userCount,
      companyCount,
      employeeCount,
    }
  } catch (e: any) {
    results.prisma = {
      status: 'error',
      error: e.message,
      code: e.code,
    }
  }

  return NextResponse.json(results)
}
