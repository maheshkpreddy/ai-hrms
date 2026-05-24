import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/kanban/boards/[id] - Single board with all columns/cards/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const board = await db.kanbanBoard.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                comments: { orderBy: { createdAt: 'desc' } },
              },
            },
          },
        },
        project: { select: { id: true, name: true } },
      },
    })

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error('Error fetching kanban board:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    )
  }
}

// PATCH /api/kanban/boards/[id] - Update board
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.kanbanBoard.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.description !== undefined) data.description = body.description
    if (body.projectId !== undefined) data.projectId = body.projectId
    if (body.companyId !== undefined) data.companyId = body.companyId

    const board = await db.kanbanBoard.update({
      where: { id },
      data,
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: { orderBy: { position: 'asc' } },
          },
        },
      },
    })

    return NextResponse.json(board)
  } catch (error) {
    console.error('Error updating kanban board:', error)
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    )
  }
}

// DELETE /api/kanban/boards/[id] - Delete board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.kanbanBoard.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      )
    }

    await db.kanbanBoard.delete({ where: { id } })

    return NextResponse.json({ message: 'Board deleted successfully' })
  } catch (error) {
    console.error('Error deleting kanban board:', error)
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    )
  }
}
