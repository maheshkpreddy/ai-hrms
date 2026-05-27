import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.skill.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employeeSkills: true },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching skill:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
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

    const existing = await db.skill.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    // Check for duplicate name if name is being updated
    if (body.name && body.name !== existing.name) {
      const duplicate = await db.skill.findUnique({
        where: { name: body.name },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Skill with this name already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.skill.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.level !== undefined && { level: body.level }),
        ...(body.certificationRequired !== undefined && { certificationRequired: body.certificationRequired }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.status !== undefined && { isActive: body.status === 'active' }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating skill:', error)
    return NextResponse.json(
      { error: 'Failed to update skill' },
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

    const existing = await db.skill.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      )
    }

    await db.skill.delete({ where: { id } })

    return NextResponse.json({ message: 'Skill deleted successfully' })
  } catch (error) {
    console.error('Error deleting skill:', error)
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    )
  }
}
