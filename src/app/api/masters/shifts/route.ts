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
      where.name = { contains: search }
    }

    const records = await db.shift.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Name, startTime, and endTime are required' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existing = await db.shift.findFirst({
      where: { name: body.name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Shift with this name already exists' },
        { status: 409 }
      )
    }

    const record = await db.shift.create({
      data: {
        name: body.name,
        startTime: body.startTime,
        endTime: body.endTime,
        breakDuration: body.breakDuration,
        graceTime: body.graceTime,
        lateMarkRule: body.lateMarkRule,
        overtimeEligible: body.overtimeEligible ?? false,
        weeklyOff: body.weeklyOff,
        companyId: body.companyId,
        isActive: body.isActive ?? (body.status === 'inactive' ? false : true),
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating shift:', error)
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    )
  }
}
