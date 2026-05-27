import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}

    if (companyId) {
      where.companyId = companyId
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const records = await db.designationMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching designations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existing = await db.designationMaster.findUnique({
      where: { code: body.code },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Designation with this code already exists' },
        { status: 409 }
      )
    }

    const record = await db.designationMaster.create({
      data: {
        name: body.name,
        code: body.code,
        departmentId: body.departmentId,
        grade: body.grade,
        level: body.level ?? 1,
        jobDescription: body.jobDescription,
        companyId: body.companyId,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating designation:', error)
    return NextResponse.json(
      { error: 'Failed to create designation' },
      { status: 500 }
    )
  }
}
