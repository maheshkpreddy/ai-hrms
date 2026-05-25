import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const subVendor = await db.subVendor.findUnique({
      where: { id },
      include: {
        uploadedResumes: {
          include: { job: { select: { id: true, title: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { uploadedResumes: true } },
      },
    })
    if (!subVendor) return NextResponse.json({ error: 'Sub-vendor not found' }, { status: 404 })
    return NextResponse.json(subVendor)
  } catch (error) {
    console.error('Error fetching sub-vendor:', error)
    return NextResponse.json({ error: 'Failed to fetch sub-vendor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.subVendor.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Sub-vendor not found' }, { status: 404 })

    if (body.email && body.email !== existing.email) {
      const dup = await db.subVendor.findUnique({ where: { email: body.email } })
      if (dup) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const subVendor = await db.subVendor.update({
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
        ...(body.gstNumber !== undefined && { gstNumber: body.gstNumber }),
        ...(body.panNumber !== undefined && { panNumber: body.panNumber }),
        ...(body.specialization !== undefined && { specialization: body.specialization }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(subVendor)
  } catch (error) {
    console.error('Error updating sub-vendor:', error)
    return NextResponse.json({ error: 'Failed to update sub-vendor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.subVendor.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Sub-vendor not found' }, { status: 404 })

    await db.subVendor.delete({ where: { id } })
    return NextResponse.json({ message: 'Sub-vendor deleted successfully' })
  } catch (error) {
    console.error('Error deleting sub-vendor:', error)
    return NextResponse.json({ error: 'Failed to delete sub-vendor' }, { status: 500 })
  }
}
