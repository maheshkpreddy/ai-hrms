import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.shift.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching shift:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shift' },
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

    const existing = await db.shift.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name if name is being updated
    if (body.name && body.name !== existing.name) {
      const duplicate = await db.shift.findFirst({ where: { name: body.name } })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Shift with this name already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.shift.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.startTime !== undefined && { startTime: body.startTime }),
        ...(body.endTime !== undefined && { endTime: body.endTime }),
        ...(body.breakDuration !== undefined && { breakDuration: body.breakDuration }),
        ...(body.graceTime !== undefined && { graceTime: body.graceTime }),
        ...(body.lateMarkRule !== undefined && { lateMarkRule: body.lateMarkRule }),
        ...(body.overtimeEligible !== undefined && { overtimeEligible: body.overtimeEligible }),
        ...(body.weeklyOff !== undefined && { weeklyOff: body.weeklyOff }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.status !== undefined && { isActive: body.status === 'active' }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating shift:', error)
    return NextResponse.json(
      { error: 'Failed to update shift' },
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

    const existing = await db.shift.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Shift not found' },
        { status: 404 }
      )
    }

    await db.shift.delete({ where: { id } })

    return NextResponse.json({ message: 'Shift deleted successfully' })
  } catch (error) {
    console.error('Error deleting shift:', error)
    return NextResponse.json(
      { error: 'Failed to delete shift' },
      { status: 500 }
    )
  }
}
