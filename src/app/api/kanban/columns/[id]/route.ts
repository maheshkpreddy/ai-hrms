import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/kanban/columns/[id] - Rename and/or reorder column
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.kanbanColumn.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      )
    }

    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.color !== undefined) data.color = body.color
    if (body.position !== undefined) data.position = body.position

    const column = await db.kanbanColumn.update({
      where: { id },
      data,
      include: {
        cards: { orderBy: { position: 'asc' } },
      },
    })

    return NextResponse.json(column)
  } catch (error) {
    console.error('Error updating kanban column:', error)
    return NextResponse.json(
      { error: 'Failed to update column' },
      { status: 500 }
    )
  }
}

// DELETE /api/kanban/columns/[id] - Delete column with optional card reassignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.kanbanColumn.findUnique({
      where: { id },
      include: { cards: true },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      )
    }

    // Check for reassignment target in query params or body
    const { searchParams } = new URL(request.url)
    let reassignToColumnId = searchParams.get('reassignToColumnId')

    // Also try to read from body for POST-like DELETE
    try {
      const body = await request.json()
      if (body.reassignToColumnId) {
        reassignToColumnId = body.reassignToColumnId
      }
    } catch {
      // No body provided, that's fine
    }

    if (reassignToColumnId) {
      // Verify the target column exists and belongs to the same board
      const targetColumn = await db.kanbanColumn.findUnique({
        where: { id: reassignToColumnId },
      })
      if (!targetColumn) {
        return NextResponse.json(
          { error: 'Reassignment target column not found' },
          { status: 404 }
        )
      }
      if (targetColumn.boardId !== existing.boardId) {
        return NextResponse.json(
          { error: 'Cannot reassign cards to a column in a different board' },
          { status: 400 }
        )
      }

      // Get the max position in the target column
      const maxPos = await db.kanbanCard.findFirst({
        where: { columnId: reassignToColumnId },
        orderBy: { position: 'desc' },
        select: { position: true },
      })

      // Move all cards to the target column with adjusted positions
      const startPosition = (maxPos?.position ?? -1) + 1
      await Promise.all(
        existing.cards.map((card, index) =>
          db.kanbanCard.update({
            where: { id: card.id },
            data: {
              columnId: reassignToColumnId,
              position: startPosition + index,
            },
          })
        )
      )
    } else {
      // No reassignment target - delete all cards in this column along with their comments
      await db.kanbanCardComment.deleteMany({
        where: { cardId: { in: existing.cards.map((c) => c.id) } },
      })
      await db.kanbanCard.deleteMany({
        where: { columnId: id },
      })
    }

    // Delete the column itself
    await db.kanbanColumn.delete({ where: { id } })

    return NextResponse.json({
      message: reassignToColumnId
        ? 'Column deleted and cards reassigned successfully'
        : 'Column and its cards deleted successfully',
      reassignedCardCount: reassignToColumnId ? existing.cards.length : 0,
    })
  } catch (error) {
    console.error('Error deleting kanban column:', error)
    return NextResponse.json(
      { error: 'Failed to delete column' },
      { status: 500 }
    )
  }
}
