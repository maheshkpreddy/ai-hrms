import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    const records = await db.skill.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { employeeSkills: true },
        },
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existing = await db.skill.findUnique({
      where: { name: body.name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Skill with this name already exists' },
        { status: 409 }
      )
    }

    const record = await db.skill.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        level: body.level,
        certificationRequired: body.certificationRequired ?? false,
        isActive: body.isActive ?? (body.status === 'inactive' ? false : true),
        companyId: body.companyId,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    )
  }
}
