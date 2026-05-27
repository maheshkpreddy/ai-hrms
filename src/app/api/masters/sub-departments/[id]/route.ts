import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const data = await req.json()

    const existing = await db.subDepartment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sub-department not found' }, { status: 404 })
    }

    // Verify parent department exists if being updated
    if (data.departmentId && data.departmentId !== existing.departmentId) {
      const department = await db.department.findUnique({ where: { id: data.departmentId } })
      if (!department) {
        return NextResponse.json({ error: 'Parent department not found' }, { status: 404 })
      }
    }

    const subDepartment = await db.subDepartment.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.head !== undefined && { head: data.head }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
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
        action: 'update',
        module: 'hr',
        details: `Updated sub-department: ${subDepartment.name}`,
      },
    })

    return NextResponse.json({ subDepartment })
  } catch (error: unknown) {
    console.error('Error updating sub-department:', error)
    const message = error instanceof Error ? error.message : 'Failed to update sub-department'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.subDepartment.findUnique({
      where: { id },
      include: { department: { select: { name: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Sub-department not found' }, { status: 404 })
    }

    await db.subDepartment.delete({ where: { id } })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: (session.user as any)?.id,
        employeeId: (session.user as any)?.employeeId,
        action: 'delete',
        module: 'hr',
        details: `Deleted sub-department: ${existing.name} (under ${existing.department.name})`,
      },
    })

    return NextResponse.json({ message: 'Sub-department deleted successfully' })
  } catch (error) {
    console.error('Error deleting sub-department:', error)
    return NextResponse.json({ error: 'Failed to delete sub-department' }, { status: 500 })
  }
}
