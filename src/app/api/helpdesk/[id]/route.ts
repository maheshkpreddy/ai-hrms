import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.helpdeskTicket.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
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

    const existing = await db.helpdeskTicket.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const record = await db.helpdeskTicket.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.assignedAgentId !== undefined && { assignedAgentId: body.assignedAgentId }),
        ...(body.slaDeadline !== undefined && { slaDeadline: body.slaDeadline }),
        ...(body.resolution !== undefined && { resolution: body.resolution }),
        ...(body.subCategory !== undefined && { subCategory: body.subCategory }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.attachmentUrl !== undefined && { attachmentUrl: body.attachmentUrl }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
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

    const existing = await db.helpdeskTicket.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Delete comments first
    await db.helpdeskTicketComment.deleteMany({
      where: { ticketId: id },
    })

    await db.helpdeskTicket.delete({ where: { id } })

    return NextResponse.json({ message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
