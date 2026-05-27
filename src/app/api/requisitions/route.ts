import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status')
    const approvalStatus = searchParams.get('approvalStatus')
    const priority = searchParams.get('priority')

    const where: Record<string, unknown> = {}

    if (companyId) {
      where.companyId = companyId
    }
    if (departmentId) {
      where.departmentId = departmentId
    }
    if (status) {
      where.status = status
    }
    if (approvalStatus) {
      where.approvalStatus = approvalStatus
    }
    if (priority) {
      where.priority = priority
    }

    const records = await db.manpowerRequisition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching requisitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requisitions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.companyId || !body.positionTitle) {
      return NextResponse.json(
        { error: 'Company ID and position title are required' },
        { status: 400 }
      )
    }

    const record = await db.manpowerRequisition.create({
      data: {
        companyId: body.companyId,
        departmentId: body.departmentId,
        location: body.location,
        positionTitle: body.positionTitle,
        numberOfOpenings: body.numberOfOpenings ?? 1,
        replacementNew: body.replacementNew ?? 'new',
        replacementEmpId: body.replacementEmpId,
        budgetedSalary: body.budgetedSalary,
        requiredExperience: body.requiredExperience,
        skillsRequired: body.skillsRequired,
        qualification: body.qualification,
        employmentType: body.employmentType,
        priority: body.priority ?? 'medium',
        expectedJoinDate: body.expectedJoinDate,
        hiringManagerId: body.hiringManagerId,
        approvalStatus: body.approvalStatus ?? 'pending',
        status: body.status ?? 'draft',
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating requisition:', error)
    return NextResponse.json(
      { error: 'Failed to create requisition' },
      { status: 500 }
    )
  }
}
