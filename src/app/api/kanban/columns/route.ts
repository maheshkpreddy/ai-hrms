import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/kanban/columns - Add column to board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.boardId || typeof body.boardId !== 'string') {
      return NextResponse.json(
        { error: 'boardId is required' },
        { status: 400 }
      )
    }

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    // Verify the board exists
    const board = await db.kanbanBoard.findUnique({
      where: { id: body.boardId },
    })
    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    // Get max position for the board to append at the end
    const maxPos = await db.kanbanColumn.findFirst({
      where: { boardId: body.boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const column = await db.kanbanColumn.create({
      data: {
        boardId: body.boardId,
        title: body.title.trim(),
        color: body.color || '#6366f1',
        position: body.position !== undefined ? body.position : (maxPos?.position ?? -1) + 1,
      },
      include: {
        cards: { orderBy: { position: 'asc' } },
      },
    })

    return NextResponse.json(column, { status: 201 })
  } catch (error) {
    console.error('Error creating kanban column:', error)
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    )
  }
}
