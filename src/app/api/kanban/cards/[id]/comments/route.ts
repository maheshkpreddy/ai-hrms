import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/kanban/cards/[id]/comments - List comments for a card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify the card exists
    const card = await db.kanbanCard.findUnique({ where: { id } })
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    const comments = await db.kanbanCardComment.findMany({
      where: { cardId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching card comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/kanban/cards/[id]/comments - Add comment to a card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Verify the card exists
    const card = await db.kanbanCard.findUnique({ where: { id } })
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      )
    }

    if (!body.authorName || typeof body.authorName !== 'string' || !body.authorName.trim()) {
      return NextResponse.json(
        { error: 'authorName is required' },
        { status: 400 }
      )
    }

    const comment = await db.kanbanCardComment.create({
      data: {
        cardId: id,
        authorId: body.authorId || null,
        authorName: body.authorName.trim(),
        content: body.content.trim(),
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating card comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
