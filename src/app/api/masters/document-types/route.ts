import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const applicableModule = searchParams.get('applicableModule')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}

    if (companyId) {
      where.companyId = companyId
    }
    if (applicableModule) {
      where.applicableModule = applicableModule
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const records = await db.documentTypeMaster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching document types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { error: 'Document type name is required' },
        { status: 400 }
      )
    }

    const record = await db.documentTypeMaster.create({
      data: {
        name: body.name,
        isMandatory: body.isMandatory ?? false,
        applicableModule: body.applicableModule,
        expiryRequired: body.expiryRequired ?? false,
        verificationRequired: body.verificationRequired ?? false,
        companyId: body.companyId,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating document type:', error)
    return NextResponse.json(
      { error: 'Failed to create document type' },
      { status: 500 }
    )
  }
}
