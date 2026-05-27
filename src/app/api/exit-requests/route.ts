import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const exitType = searchParams.get('exitType')

    const where: Record<string, unknown> = {}

    if (employeeId) {
      where.employeeId = employeeId
    }
    if (status) {
      where.status = status
    }
    if (exitType) {
      where.exitType = exitType
    }

    const records = await db.exitRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            designation: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching exit requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exit requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.employeeId || !body.resignationDate || !body.reason) {
      return NextResponse.json(
        { error: 'Employee ID, resignation date, and reason are required' },
        { status: 400 }
      )
    }

    const record = await db.exitRequest.create({
      data: {
        employeeId: body.employeeId,
        resignationDate: body.resignationDate,
        reason: body.reason,
        exitType: body.exitType ?? 'voluntary',
        noticePeriodDays: body.noticePeriodDays,
        lastWorkingDay: body.lastWorkingDay,
        managerApproval: body.managerApproval ?? 'pending',
        hrApproval: body.hrApproval ?? 'pending',
        clearanceStatus: body.clearanceStatus ?? 'pending',
        knowledgeTransfer: body.knowledgeTransfer ?? false,
        assetClearance: body.assetClearance ?? false,
        accessRevocation: body.accessRevocation ?? false,
        fnfStatus: body.fnfStatus ?? 'pending',
        exitInterviewNotes: body.exitInterviewNotes,
        relievingLetterUrl: body.relievingLetterUrl,
        rehireEligible: body.rehireEligible ?? true,
        status: body.status ?? 'submitted',
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating exit request:', error)
    return NextResponse.json(
      { error: 'Failed to create exit request' },
      { status: 500 }
    )
  }
}
