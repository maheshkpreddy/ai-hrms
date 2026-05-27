import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const requesterId = searchParams.get('requesterId')
    const priority = searchParams.get('priority')
    const assignedAgentId = searchParams.get('assignedAgentId')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }
    if (category) {
      where.category = category
    }
    if (requesterId) {
      where.requesterId = requesterId
    }
    if (priority) {
      where.priority = priority
    }
    if (assignedAgentId) {
      where.assignedAgentId = assignedAgentId
    }

    const records = await db.helpdeskTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching helpdesk tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch helpdesk tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.requesterId || !body.category || !body.subject || !body.description) {
      return NextResponse.json(
        { error: 'Requester ID, category, subject, and description are required' },
        { status: 400 }
      )
    }

    // Auto-generate ticketId like "TK-XXX"
    const lastTicket = await db.helpdeskTicket.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { ticketId: true },
    })

    let nextNumber = 1
    if (lastTicket?.ticketId) {
      const lastNumber = parseInt(lastTicket.ticketId.replace('TK-', ''), 10)
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1
      }
    }

    const ticketId = `TK-${String(nextNumber).padStart(3, '0')}`

    const record = await db.helpdeskTicket.create({
      data: {
        ticketId,
        requesterId: body.requesterId,
        requesterType: body.requesterType ?? 'employee',
        category: body.category,
        subCategory: body.subCategory,
        priority: body.priority ?? 'medium',
        subject: body.subject,
        description: body.description,
        attachmentUrl: body.attachmentUrl,
        assignedAgentId: body.assignedAgentId,
        slaDeadline: body.slaDeadline,
        status: body.status ?? 'open',
        resolution: body.resolution,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating helpdesk ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create helpdesk ticket' },
      { status: 500 }
    )
  }
}
