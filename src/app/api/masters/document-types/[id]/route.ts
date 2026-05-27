import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const record = await db.documentTypeMaster.findUnique({
      where: { id },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Document type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching document type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document type' },
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

    const existing = await db.documentTypeMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Document type not found' },
        { status: 404 }
      )
    }

    const record = await db.documentTypeMaster.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.isMandatory !== undefined && { isMandatory: body.isMandatory }),
        ...(body.mandatoryOptional !== undefined && { isMandatory: body.mandatoryOptional === 'mandatory' }),
        ...(body.applicableModule !== undefined && { applicableModule: body.applicableModule }),
        ...(body.expiryRequired !== undefined && { expiryRequired: body.expiryRequired }),
        ...(body.verificationRequired !== undefined && { verificationRequired: body.verificationRequired }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.status !== undefined && { isActive: body.status === 'active' }),
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error updating document type:', error)
    return NextResponse.json(
      { error: 'Failed to update document type' },
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

    const existing = await db.documentTypeMaster.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Document type not found' },
        { status: 404 }
      )
    }

    await db.documentTypeMaster.delete({ where: { id } })

    return NextResponse.json({ message: 'Document type deleted successfully' })
  } catch (error) {
    console.error('Error deleting document type:', error)
    return NextResponse.json(
      { error: 'Failed to delete document type' },
      { status: 500 }
    )
  }
}
