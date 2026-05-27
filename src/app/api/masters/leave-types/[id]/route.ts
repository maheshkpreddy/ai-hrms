import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.leaveTypeMaster.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Leave type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching leave type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave type' },
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

    const existing = await db.leaveTypeMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Leave type not found' },
        { status: 404 }
      )
    }

    // Check for duplicate code if code is being updated
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.leaveTypeMaster.findUnique({
        where: { code: body.code },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Leave type with this code already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.leaveTypeMaster.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.isPaid !== undefined && { isPaid: body.isPaid }),
        ...(body.paidUnpaid !== undefined && { isPaid: body.paidUnpaid === 'paid' }),
        ...(body.annualQuota !== undefined && { annualQuota: body.annualQuota }),
        ...(body.accrualRule !== undefined && { accrualRule: body.accrualRule }),
        ...(body.carryForwardRule !== undefined && { carryForwardRule: body.carryForwardRule }),
        ...(body.encashmentRule !== undefined && { encashmentRule: body.encashmentRule }),
        ...(body.applicableGender !== undefined && { applicableGender: body.applicableGender }),
        ...(body.applicableEmpType !== undefined && { applicableEmpType: body.applicableEmpType }),
        ...(body.applicableEmploymentType !== undefined && { applicableEmpType: body.applicableEmploymentType }),
        ...(body.approvalRequired !== undefined && { approvalRequired: body.approvalRequired }),
        ...(body.attachmentRequired !== undefined && { attachmentRequired: body.attachmentRequired }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.status !== undefined && { isActive: body.status === 'active' }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating leave type:', error)
    return NextResponse.json(
      { error: 'Failed to update leave type' },
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

    const existing = await db.leaveTypeMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Leave type not found' },
        { status: 404 }
      )
    }

    await db.leaveTypeMaster.delete({ where: { id } })

    return NextResponse.json({ message: 'Leave type deleted successfully' })
  } catch (error) {
    console.error('Error deleting leave type:', error)
    return NextResponse.json(
      { error: 'Failed to delete leave type' },
      { status: 500 }
    )
  }
}
