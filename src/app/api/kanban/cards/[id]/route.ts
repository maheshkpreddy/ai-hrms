import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/kanban/cards/[id] - Update card (including move to different column)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.kanbanCard.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    // If moving to a different column, verify the target column exists
    if (body.columnId && body.columnId !== existing.columnId) {
      const targetColumn = await db.kanbanColumn.findUnique({
        where: { id: body.columnId },
      })
      if (!targetColumn) {
        return NextResponse.json(
          { error: 'Target column not found' },
          { status: 404 }
        )
      }
    }

    // Validate priority if provided
    if (body.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high', 'urgent']
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { error: `priority must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.priority !== undefined) data.priority = body.priority
    if (body.position !== undefined) data.position = body.position
    if (body.columnId !== undefined) data.columnId = body.columnId
    if (body.dueDate !== undefined) data.dueDate = body.dueDate
    if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId
    if (body.tags !== undefined) data.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)
    if (body.coverColor !== undefined) data.coverColor = body.coverColor

    const card = await db.kanbanCard.update({
      where: { id },
      data,
      include: {
        comments: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating kanban card:', error)
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    )
  }
}

// DELETE /api/kanban/cards/[id] - Delete card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.kanbanCard.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    // Delete comments first, then the card
    await db.kanbanCardComment.deleteMany({ where: { cardId: id } })
    await db.kanbanCard.delete({ where: { id } })

    return NextResponse.json({ message: 'Card deleted successfully' })
  } catch (error) {
    console.error('Error deleting kanban card:', error)
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    )
  }
}
