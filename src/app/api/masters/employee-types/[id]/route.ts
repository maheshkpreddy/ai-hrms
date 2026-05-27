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

    const existing = await db.employeeType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Employee type not found' }, { status: 404 })
    }

    // Check for duplicate code if code is being updated
    if (data.code && data.code !== existing.code) {
      const duplicate = await db.employeeType.findUnique({ where: { code: data.code } })
      if (duplicate) {
        return NextResponse.json({ error: 'Employee type code already exists' }, { status: 409 })
      }
    }

    const employeeType = await db.employeeType.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: (session.user as any)?.id,
        employeeId: (session.user as any)?.employeeId,
        action: 'update',
        module: 'hr',
        details: `Updated employee type: ${employeeType.name}`,
      },
    })

    return NextResponse.json({ employeeType })
  } catch (error: unknown) {
    console.error('Error updating employee type:', error)
    const message = error instanceof Error ? error.message : 'Failed to update employee type'
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

    const existing = await db.employeeType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Employee type not found' }, { status: 404 })
    }

    await db.employeeType.delete({ where: { id } })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: (session.user as any)?.id,
        employeeId: (session.user as any)?.employeeId,
        action: 'delete',
        module: 'hr',
        details: `Deleted employee type: ${existing.name}`,
      },
    })

    return NextResponse.json({ message: 'Employee type deleted successfully' })
  } catch (error) {
    console.error('Error deleting employee type:', error)
    return NextResponse.json({ error: 'Failed to delete employee type' }, { status: 500 })
  }
}
