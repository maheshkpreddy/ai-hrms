import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const comments = await db.ticketComment.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching ticket comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.content || !body.authorName) {
      return NextResponse.json({ error: 'content and authorName are required' }, { status: 400 })
    }

    const ticket = await db.ticket.findUnique({ where: { id } })
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    const comment = await db.ticketComment.create({
      data: {
        ticketId: id,
        authorType: body.authorType || 'employee',
        authorId: body.authorId || 'system',
        authorName: body.authorName,
        content: body.content,
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
