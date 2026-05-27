import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const specialization = searchParams.get('specialization')
    const isActiveParam = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (specialization) where.specialization = specialization
    if (isActiveParam !== null) where.isActive = isActiveParam === 'true'

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
        { specialization: { contains: search } },
      ]
    }

    const [subVendors, total] = await Promise.all([
      db.subVendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { uploadedResumes: true } },
        },
      }),
      db.subVendor.count({ where }),
    ])

    return NextResponse.json({
      subVendors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching sub-vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch sub-vendors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.companyName || !body.contactPerson || !body.email) {
      return NextResponse.json(
        { error: 'companyName, contactPerson, and email are required' },
        { status: 400 }
      )
    }

    const existing = await db.subVendor.findUnique({ where: { email: body.email } })
    if (existing) {
      return NextResponse.json({ error: 'A sub-vendor with this email already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash('TempPass@2024', 10)

    const subVendor = await db.subVendor.create({
      data: {
        companyName: body.companyName,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || null,
        gstNumber: body.gstNumber || null,
        panNumber: body.panNumber || null,
        specialization: body.specialization || null,
        companyId: body.companyId || null,
        passwordHash,
      },
    })

    return NextResponse.json(subVendor, { status: 201 })
  } catch (error) {
    console.error('Error creating sub-vendor:', error)
    return NextResponse.json({ error: 'Failed to create sub-vendor' }, { status: 500 })
  }
}
