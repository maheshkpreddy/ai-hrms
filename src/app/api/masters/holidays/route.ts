import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const year = searchParams.get('year')
    const type = searchParams.get('type')

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    const where: Record<string, unknown> = { companyId }

    if (year) {
      const startOfYear = new Date(`${year}-01-01`)
      const endOfYear = new Date(`${year}-12-31`)
      where.date = { gte: startOfYear, lte: endOfYear }
    }

    if (type) {
      where.type = type
    }

    const holidays = await db.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ records: holidays })
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.date || !body.companyId) {
      return NextResponse.json({ error: 'name, date, and companyId are required' }, { status: 400 })
    }

    const holiday = await db.holiday.create({
      data: {
        name: body.name,
        date: new Date(body.date),
        type: body.type || 'public',
        description: body.description || null,
        isRecurring: body.isRecurring || false,
        companyId: body.companyId,
      },
    })

    return NextResponse.json(holiday, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Holiday already exists for this date and company' }, { status: 409 })
    }
    console.error('Error creating holiday:', error)
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Holiday ID is required' }, { status: 400 })
    }

    const existing = await db.holiday.findUnique({ where: { id: body.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 })
    }

    const holiday = await db.holiday.update({
      where: { id: body.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.isRecurring !== undefined && { isRecurring: body.isRecurring }),
      },
    })

    return NextResponse.json(holiday)
  } catch (error) {
    console.error('Error updating holiday:', error)
    return NextResponse.json({ error: 'Failed to update holiday' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Holiday ID is required' }, { status: 400 })
    }

    await db.holiday.delete({ where: { id } })

    return NextResponse.json({ message: 'Holiday deleted successfully' })
  } catch (error) {
    console.error('Error deleting holiday:', error)
    return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 })
  }
}
