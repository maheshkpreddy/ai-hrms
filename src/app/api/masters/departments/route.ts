import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (companyId) {
      where.companyId = companyId
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { head: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const records = await db.department.findMany({
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
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existing = await db.department.findUnique({
      where: { name: body.name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Department with this name already exists' },
        { status: 409 }
      )
    }

    const record = await db.department.create({
      data: {
        name: body.name,
        head: body.departmentHead || body.head,
        description: body.description,
        budget: body.budget,
        companyId: body.companyId,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}
