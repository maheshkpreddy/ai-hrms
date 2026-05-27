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
    const departmentId = searchParams.get('departmentId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (companyId) where.companyId = companyId
    if (departmentId) where.departmentId = departmentId
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const subDepartments = await db.subDepartment.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ subDepartments })
  } catch (error) {
    console.error('Error fetching sub-departments:', error)
    return NextResponse.json({ error: 'Failed to fetch sub-departments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await req.json()

    if (!data.name) {
      return NextResponse.json({ error: 'Sub-department name is required' }, { status: 400 })
    }

    if (!data.departmentId) {
      return NextResponse.json({ error: 'Parent department ID is required' }, { status: 400 })
    }

    // Verify parent department exists
    const department = await db.department.findUnique({ where: { id: data.departmentId } })
    if (!department) {
      return NextResponse.json({ error: 'Parent department not found' }, { status: 404 })
    }

    const subDepartment = await db.subDepartment.create({
      data: {
        name: data.name,
        departmentId: data.departmentId,
        head: data.head || null,
        description: data.description || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        companyId: data.companyId || null,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: (session.user as any)?.id,
        employeeId: (session.user as any)?.employeeId,
        action: 'create',
        module: 'hr',
        details: `Created sub-department: ${subDepartment.name} under ${department.name}`,
      },
    })

    return NextResponse.json({ subDepartment }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating sub-department:', error)
    const message = error instanceof Error ? error.message : 'Failed to create sub-department'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
