import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.department.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department' },
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

    const existing = await db.department.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name if name is being updated
    if (body.name && body.name !== existing.name) {
      const duplicate = await db.department.findFirst({ where: { name: body.name } })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Department with this name already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.department.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.head !== undefined && { head: body.head }),
        ...(body.departmentHead !== undefined && { head: body.departmentHead }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.budget !== undefined && { budget: body.budget }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
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

    const existing = await db.department.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    await db.department.delete({ where: { id } })

    return NextResponse.json({ message: 'Department deleted successfully' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}
