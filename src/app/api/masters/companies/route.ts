import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    const industry = searchParams.get('industry')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
      ]
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    if (industry) {
      where.industry = industry
    }

    const records = await db.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true, employees: true, departments: true, branches: true },
        },
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate code if provided
    if (body.code) {
      const existingCode = await db.company.findUnique({
        where: { code: body.code },
      })
      if (existingCode) {
        return NextResponse.json(
          { error: 'Company with this code already exists' },
          { status: 409 }
        )
      }
    }

    const record = await db.company.create({
      data: {
        name: body.name,
        code: body.code || `COMP-${Date.now().toString(36).toUpperCase()}`,
        description: body.legalName || body.description || null,
        industry: body.industryType || body.industry || null,
        website: body.website || null,
        logo: body.logo || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || null,
        pincode: body.pincode || null,
        phone: body.phone || null,
        email: body.email || null,
        gstNumber: body.gstVat || body.gstNumber || null,
        panNumber: body.panTanCin || body.panNumber || null,
        isActive: body.isActive ?? (body.status === 'inactive' ? false : true),
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}
