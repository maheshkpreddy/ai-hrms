import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.exitRequest.findUnique({
      where: { id },
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
            reportingTo: true,
          },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Exit request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching exit request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exit request' },
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

    const existing = await db.exitRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Exit request not found' },
        { status: 404 }
      )
    }

    const record = await db.exitRequest.update({
      where: { id },
      data: {
        ...(body.resignationDate !== undefined && { resignationDate: body.resignationDate }),
        ...(body.reason !== undefined && { reason: body.reason }),
        ...(body.exitType !== undefined && { exitType: body.exitType }),
        ...(body.noticePeriodDays !== undefined && { noticePeriodDays: body.noticePeriodDays }),
        ...(body.lastWorkingDay !== undefined && { lastWorkingDay: body.lastWorkingDay }),
        ...(body.managerApproval !== undefined && { managerApproval: body.managerApproval }),
        ...(body.hrApproval !== undefined && { hrApproval: body.hrApproval }),
        ...(body.clearanceStatus !== undefined && { clearanceStatus: body.clearanceStatus }),
        ...(body.knowledgeTransfer !== undefined && { knowledgeTransfer: body.knowledgeTransfer }),
        ...(body.assetClearance !== undefined && { assetClearance: body.assetClearance }),
        ...(body.accessRevocation !== undefined && { accessRevocation: body.accessRevocation }),
        ...(body.fnfStatus !== undefined && { fnfStatus: body.fnfStatus }),
        ...(body.exitInterviewNotes !== undefined && { exitInterviewNotes: body.exitInterviewNotes }),
        ...(body.relievingLetterUrl !== undefined && { relievingLetterUrl: body.relievingLetterUrl }),
        ...(body.rehireEligible !== undefined && { rehireEligible: body.rehireEligible }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating exit request:', error)
    return NextResponse.json(
      { error: 'Failed to update exit request' },
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

    const existing = await db.exitRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Exit request not found' },
        { status: 404 }
      )
    }

    await db.exitRequest.delete({ where: { id } })

    return NextResponse.json({ message: 'Exit request deleted successfully' })
  } catch (error) {
    console.error('Error deleting exit request:', error)
    return NextResponse.json(
      { error: 'Failed to delete exit request' },
      { status: 500 }
    )
  }
}
