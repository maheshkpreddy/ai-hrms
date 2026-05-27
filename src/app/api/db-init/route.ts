import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

// POST /api/db-init - Initialize database schema and seed data
// This should be called once after deployment to set up the database
export async function POST(request: Request) {
  try {
    const { action } = await request.json().catch(() => ({ action: 'all' }))
    
    const results: string[] = []

    if (action === 'all' || action === 'schema') {
      try {
        console.log('Pushing schema to database...')
        execSync('npx prisma db push --accept-data-loss', { 
          stdio: 'pipe', 
          timeout: 60000,
          env: { ...process.env }
        })
        results.push('Schema pushed successfully')
      } catch (e: any) {
        results.push(`Schema push error: ${e.message?.substring(0, 200)}`)
      }
    }

    if (action === 'all' || action === 'seed') {
      try {
        // Check if database already has data
        const { PrismaClient } = await import('@prisma/client')
        const db = new PrismaClient()
        const count = await db.company.count()
        
        if (count === 0) {
          console.log('Database is empty, running seed...')
          execSync('npx tsx prisma/seed.ts', { 
            stdio: 'pipe', 
            timeout: 120000,
            env: { ...process.env }
          })
          results.push('Database seeded successfully')
        } else {
          results.push(`Database already has ${count} companies, skipping seed`)
        }
        await db.$disconnect()
      } catch (e: any) {
        results.push(`Seed error: ${e.message?.substring(0, 200)}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message?.substring(0, 500) 
    }, { status: 500 })
  }
}

// GET /api/db-init - Check database status
export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const db = new PrismaClient()
    
    const [companyCount, userCount, employeeCount] = await Promise.all([
      db.company.count(),
      db.user.count(),
      db.employee.count(),
    ])
    
    await db.$disconnect()
    
    return NextResponse.json({ 
      connected: true,
      companies: companyCount,
      users: userCount,
      employees: employeeCount,
      seeded: companyCount > 0
    })
  } catch (error: any) {
    return NextResponse.json({ 
      connected: false, 
      error: error.message?.substring(0, 300) 
    }, { status: 500 })
  }
}
