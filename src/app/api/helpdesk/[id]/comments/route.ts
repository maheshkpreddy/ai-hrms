import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const comments = await db.helpdeskTicketComment.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching ticket comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.authorId || !body.authorName || !body.content) {
      return NextResponse.json(
        { error: 'Author ID, author name, and content are required' },
        { status: 400 }
      )
    }

    // Verify ticket exists
    const ticket = await db.helpdeskTicket.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const comment = await db.helpdeskTicketComment.create({
      data: {
        ticketId: id,
        authorId: body.authorId,
        authorName: body.authorName,
        authorType: body.authorType ?? 'employee',
        content: body.content,
        isInternal: body.isInternal ?? false,
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket comment:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket comment' },
      { status: 500 }
    )
  }
}
