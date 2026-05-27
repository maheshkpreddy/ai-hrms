import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET',
      DIRECT_URL: process.env.DIRECT_URL ? 'SET (length: ' + process.env.DIRECT_URL.length + ')' : 'NOT SET',
    }
  }

  // Test 1: Raw Neon serverless driver
  try {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DIRECT_URL || process.env.DATABASE_URL!)
    const dbResult = await sql`SELECT count(*) as count FROM "User"`
    results.neonDirect = { status: 'ok', userCount: dbResult[0].count }
  } catch (e: any) {
    results.neonDirect = { status: 'error', error: e.message, stack: e.stack?.substring(0, 200) }
  }

  // Test 2: Prisma with Neon adapter
  try {
    const { PrismaClient } = await import('@prisma/client')
    const { Pool, neonConfig } = await import('@neondatabase/serverless')
    const { PrismaNeon } = await import('@prisma/adapter-neon')
    
    // Set WebSocket constructor for serverless
    if (typeof window === 'undefined') {
      const ws = await import('ws')
      neonConfig.webSocketConstructor = ws.default || ws
    }
    
    const pool = new Pool({ connectionString: process.env.DIRECT_URL })
    const adapter = new PrismaNeon(pool)
    const db = new PrismaClient({ adapter })
    
    const userCount = await db.user.count()
    results.prismaNeon = { status: 'ok', userCount }
    await db.$disconnect()
  } catch (e: any) {
    results.prismaNeon = { 
      status: 'error', 
      error: e.message, 
      name: e.name,
      code: e.code,
      stack: e.stack?.substring(0, 300),
      cause: e.cause?.message
    }
  }

  // Test 3: Standard Prisma (no adapter)
  try {
    const { PrismaClient } = await import('@prisma/client')
    const db = new PrismaClient()
    const userCount = await db.user.count()
    results.prismaStandard = { status: 'ok', userCount }
    await db.$disconnect()
  } catch (e: any) {
    results.prismaStandard = { 
      status: 'error', 
      error: e.message, 
      name: e.name,
      code: e.code,
      stack: e.stack?.substring(0, 300),
    }
  }

  return NextResponse.json(results)
}
