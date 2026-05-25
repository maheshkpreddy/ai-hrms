import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (clientId) where.clientId = clientId
    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
        { client: { contactPerson: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, companyName: true, contactPerson: true, email: true } },
          _count: { select: { comments: true } },
        },
      }),
      db.ticket.count({ where }),
    ])

    return NextResponse.json({
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.clientId || !body.subject || !body.description) {
      return NextResponse.json(
        { error: 'clientId, subject, and description are required' },
        { status: 400 }
      )
    }

    const clientExists = await db.client.findUnique({ where: { id: body.clientId } })
    if (!clientExists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const ticket = await db.ticket.create({
      data: {
        clientId: body.clientId,
        subject: body.subject,
        description: body.description,
        category: body.category || 'service',
        priority: body.priority || 'medium',
        status: body.status || 'open',
        assignedTo: body.assignedTo || null,
        resolution: body.resolution || null,
      },
      include: {
        client: { select: { id: true, companyName: true, contactPerson: true } },
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
