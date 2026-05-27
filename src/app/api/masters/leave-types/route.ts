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

    const records = await db.leaveTypeMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching leave types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave types' },
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
    const existing = await db.leaveTypeMaster.findUnique({
      where: { code: body.code },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Leave type with this code already exists' },
        { status: 409 }
      )
    }

    const record = await db.leaveTypeMaster.create({
      data: {
        name: body.name,
        code: body.code,
        isPaid: body.isPaid ?? true,
        annualQuota: body.annualQuota ?? 0,
        accrualRule: body.accrualRule,
        carryForwardRule: body.carryForwardRule,
        encashmentRule: body.encashmentRule,
        applicableGender: body.applicableGender,
        applicableEmpType: body.applicableEmpType,
        approvalRequired: body.approvalRequired ?? true,
        attachmentRequired: body.attachmentRequired ?? false,
        companyId: body.companyId,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating leave type:', error)
    return NextResponse.json(
      { error: 'Failed to create leave type' },
      { status: 500 }
    )
  }
}
