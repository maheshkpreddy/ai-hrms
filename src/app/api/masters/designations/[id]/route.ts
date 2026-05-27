import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.designationMaster.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Designation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching designation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designation' },
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

    const existing = await db.designationMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Designation not found' },
        { status: 404 }
      )
    }

    // Check for duplicate code if code is being updated
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.designationMaster.findUnique({
        where: { code: body.code },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Designation with this code already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.designationMaster.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.departmentId !== undefined && { departmentId: body.departmentId }),
        ...(body.department !== undefined && { departmentId: body.department }),
        ...(body.grade !== undefined && { grade: body.grade }),
        ...(body.level !== undefined && { level: body.level }),
        ...(body.jobDescription !== undefined && { jobDescription: body.jobDescription }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.status !== undefined && { isActive: body.status === 'active' }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating designation:', error)
    return NextResponse.json(
      { error: 'Failed to update designation' },
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

    const existing = await db.designationMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Designation not found' },
        { status: 404 }
      )
    }

    await db.designationMaster.delete({ where: { id } })

    return NextResponse.json({ message: 'Designation deleted successfully' })
  } catch (error) {
    console.error('Error deleting designation:', error)
    return NextResponse.json(
      { error: 'Failed to delete designation' },
      { status: 500 }
    )
  }
}
