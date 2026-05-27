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

    const records = await db.gradeMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
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
    const existing = await db.gradeMaster.findUnique({
      where: { code: body.code },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Grade with this code already exists' },
        { status: 409 }
      )
    }

    const record = await db.gradeMaster.create({
      data: {
        name: body.name,
        code: body.code,
        salaryBandMin: body.salaryBandMin,
        salaryBandMax: body.salaryBandMax,
        leaveEligibility: body.leaveEligibility,
        benefitsEligibility: body.benefitsEligibility,
        approvalLevel: body.approvalLevel ?? 1,
        companyId: body.companyId,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating grade:', error)
    return NextResponse.json(
      { error: 'Failed to create grade' },
      { status: 500 }
    )
  }
}
