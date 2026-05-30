import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/create-tables - Create new tables via raw SQL
export async function POST() {
  try {
    const results: string[] = []

    // Create Holiday table
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Holiday" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL,
          "type" TEXT NOT NULL DEFAULT 'public',
          "description" TEXT,
          "isRecurring" BOOLEAN NOT NULL DEFAULT false,
          "companyId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Holiday_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Holiday_companyId_date_name_key" UNIQUE ("companyId", "date", "name")
        )
      `)
      results.push('Holiday table created successfully')
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('Holiday table already exists')
      } else {
        results.push(`Holiday table error: ${e.message?.substring(0, 200)}`)
      }
    }

    // Create CompanySubscription table
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CompanySubscription" (
          "id" TEXT NOT NULL,
          "companyId" TEXT NOT NULL,
          "planName" TEXT NOT NULL DEFAULT 'free',
          "maxEmployees" INTEGER NOT NULL DEFAULT 10,
          "maxBranches" INTEGER NOT NULL DEFAULT 1,
          "features" TEXT NOT NULL DEFAULT '[]',
          "startDate" TIMESTAMP(3),
          "endDate" TIMESTAMP(3),
          "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
          "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "currency" TEXT NOT NULL DEFAULT 'USD',
          "status" TEXT NOT NULL DEFAULT 'active',
          "trialEndsAt" TIMESTAMP(3),
          "autoRenew" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "CompanySubscription_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "CompanySubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "CompanySubscription_companyId_key" UNIQUE ("companyId")
        )
      `)
      results.push('CompanySubscription table created successfully')
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('CompanySubscription table already exists')
      } else {
        results.push(`CompanySubscription table error: ${e.message?.substring(0, 200)}`)
      }
    }

    // Create indexes
    try {
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Holiday_companyId_idx" ON "Holiday"("companyId")`)
      results.push('Holiday index created')
    } catch (e: any) {
      results.push(`Index error: ${e.message?.substring(0, 100)}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message?.substring(0, 500)
    }, { status: 500 })
  }
}
