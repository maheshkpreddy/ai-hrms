import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (companyId) where.companyId = companyId
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const branches = await db.branch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ branches })
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await req.json()

    if (!data.name) {
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 })
    }

    // Check for duplicate code if provided
    if (data.code) {
      const existing = await db.branch.findUnique({ where: { code: data.code } })
      if (existing) {
        return NextResponse.json({ error: 'Branch code already exists' }, { status: 409 })
      }
    }

    const branch = await db.branch.create({
      data: {
        name: data.name,
        code: data.code || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        pincode: data.pincode || null,
        phone: data.phone || null,
        email: data.email || null,
        head: data.head || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        companyId: data.companyId || null,
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: (session.user as any)?.id,
        employeeId: (session.user as any)?.employeeId,
        action: 'create',
        module: 'hr',
        details: `Created branch: ${branch.name}${branch.code ? ` (${branch.code})` : ''}`,
      },
    })

    return NextResponse.json({ branch }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating branch:', error)
    const message = error instanceof Error ? error.message : 'Failed to create branch'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
