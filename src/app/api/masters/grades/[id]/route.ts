import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.gradeMaster.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching grade:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grade' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.gradeMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      )
    }

    // Check for duplicate code if code is being updated
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.gradeMaster.findUnique({
        where: { code: body.code },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Grade with this code already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.gradeMaster.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.salaryBandMin !== undefined && { salaryBandMin: body.salaryBandMin }),
        ...(body.salaryBandMax !== undefined && { salaryBandMax: body.salaryBandMax }),
        ...(body.leaveEligibility !== undefined && { leaveEligibility: body.leaveEligibility }),
        ...(body.benefitsEligibility !== undefined && { benefitsEligibility: body.benefitsEligibility }),
        ...(body.approvalLevel !== undefined && { approvalLevel: body.approvalLevel }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.status !== undefined && { isActive: body.status === 'active' }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating grade:', error)
    return NextResponse.json(
      { error: 'Failed to update grade' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.gradeMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      )
    }

    await db.gradeMaster.delete({ where: { id } })

    return NextResponse.json({ message: 'Grade deleted successfully' })
  } catch (error) {
    console.error('Error deleting grade:', error)
    return NextResponse.json(
      { error: 'Failed to delete grade' },
      { status: 500 }
    )
  }
}
