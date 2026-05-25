import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.ticket.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    const ticket = await db.ticket.update({
      where: { id },
      data: {
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
        ...(body.resolution !== undefined && { resolution: body.resolution }),
      },
      include: {
        client: { select: { id: true, companyName: true } },
        comments: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}
