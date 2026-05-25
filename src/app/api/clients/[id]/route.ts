import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = await db.client.findUnique({
      where: { id },
      include: {
        tickets: {
          include: { _count: { select: { comments: true } } },
          orderBy: { createdAt: 'desc' },
        },
        resumeAccess: { orderBy: { accessedAt: 'desc' } },
        clientUsers: true,
        _count: { select: { tickets: true, resumeAccess: true, clientUsers: true } },
      },
    })
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.client.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    if (body.email && body.email !== existing.email) {
      const dup = await db.client.findUnique({ where: { email: body.email } })
      if (dup) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const client = await db.client.update({
      where: { id },
      data: {
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.contactPerson !== undefined && { contactPerson: body.contactPerson }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.logo !== undefined && { logo: body.logo }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.gstNumber !== undefined && { gstNumber: body.gstNumber }),
        ...(body.panNumber !== undefined && { panNumber: body.panNumber }),
        ...(body.subscription !== undefined && { subscription: body.subscription }),
        ...(body.resumeAccessLimit !== undefined && { resumeAccessLimit: body.resumeAccessLimit }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.client.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    await db.client.delete({ where: { id } })
    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
