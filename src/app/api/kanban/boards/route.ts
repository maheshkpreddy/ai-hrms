import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/kanban/boards - List boards with columns and cards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const companyId = searchParams.get('companyId')

    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (companyId) where.companyId = companyId

    const boards = await db.kanbanBoard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({ boards })
  } catch (error) {
    console.error('Error fetching kanban boards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    )
  }
}

// POST /api/kanban/boards - Create board with 4 default columns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Board name is required' },
        { status: 400 }
      )
    }

    const board = await db.kanbanBoard.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        projectId: body.projectId || null,
        companyId: body.companyId || null,
        createdBy: body.createdBy || null,
        columns: {
          create: [
            { title: 'Backlog', color: '#6b7280', position: 0 },     // gray
            { title: 'To Do', color: '#3b82f6', position: 1 },       // blue
            { title: 'In Progress', color: '#f59e0b', position: 2 }, // amber
            { title: 'Done', color: '#10b981', position: 3 },        // emerald
          ],
        },
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: { orderBy: { position: 'asc' } },
          },
        },
      },
    })

    return NextResponse.json(board, { status: 201 })
  } catch (error) {
    console.error('Error creating kanban board:', error)
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    )
  }
}
