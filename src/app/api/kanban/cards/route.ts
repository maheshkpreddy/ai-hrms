import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/kanban/cards - Create card in column
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.columnId || typeof body.columnId !== 'string') {
      return NextResponse.json(
        { error: 'columnId is required' },
        { status: 400 }
      )
    }

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    // Verify the column exists
    const column = await db.kanbanColumn.findUnique({
      where: { id: body.columnId },
    })
    if (!column) {
      return NextResponse.json(
        { error: 'Column not found' },
        { status: 404 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    const priority = body.priority || 'medium'
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `priority must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      )
    }

    // Get max position in the column to append at the end
    const maxPos = await db.kanbanCard.findFirst({
      where: { columnId: body.columnId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const card = await db.kanbanCard.create({
      data: {
        columnId: body.columnId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        priority,
        position: body.position !== undefined ? body.position : (maxPos?.position ?? -1) + 1,
        dueDate: body.dueDate || null,
        assigneeId: body.assigneeId || null,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        coverColor: body.coverColor || null,
      },
      include: {
        comments: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating kanban card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}
