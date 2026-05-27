import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const projectId = searchParams.get('projectId')
    const approvalStatus = searchParams.get('approvalStatus')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {}

    if (employeeId) {
      where.employeeId = employeeId
    }
    if (projectId) {
      where.projectId = projectId
    }
    if (approvalStatus) {
      where.approvalStatus = approvalStatus
    }
    if (date) {
      where.date = date
    }
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate }
    } else if (startDate) {
      where.date = { gte: startDate }
    } else if (endDate) {
      where.date = { lte: endDate }
    }

    const records = await db.timesheet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            avatar: true,
            department: true,
          },
        },
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching timesheets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timesheets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.employeeId || !body.date) {
      return NextResponse.json(
        { error: 'Employee ID and date are required' },
        { status: 400 }
      )
    }

    const record = await db.timesheet.create({
      data: {
        employeeId: body.employeeId,
        projectId: body.projectId,
        task: body.task,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        hours: body.hours ?? 0,
        isBillable: body.isBillable ?? true,
        description: body.description,
        approvalStatus: body.approvalStatus ?? 'pending',
        approvedBy: body.approvedBy,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating timesheet:', error)
    return NextResponse.json(
      { error: 'Failed to create timesheet' },
      { status: 500 }
    )
  }
}
