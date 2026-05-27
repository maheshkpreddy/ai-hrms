import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true, employees: true, departments: true, branches: true },
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.company.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Check for duplicate code if code is being updated
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.company.findUnique({
        where: { code: body.code },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Company with this code already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.company.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.legalName !== undefined && { description: body.legalName }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.industryType !== undefined && { industry: body.industryType }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.logo !== undefined && { logo: body.logo }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.pincode !== undefined && { pincode: body.pincode }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.gstVat !== undefined && { gstNumber: body.gstVat }),
        ...(body.gstNumber !== undefined && { gstNumber: body.gstNumber }),
        ...(body.panTanCin !== undefined && { panNumber: body.panTanCin }),
        ...(body.panNumber !== undefined && { panNumber: body.panNumber }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.status !== undefined && { isActive: body.status === 'active' }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.company.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    await db.company.delete({ where: { id } })

    return NextResponse.json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
