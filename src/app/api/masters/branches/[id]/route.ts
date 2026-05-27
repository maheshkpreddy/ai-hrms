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

    const existing = await db.branch.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Check for duplicate code if code is being updated
    if (data.code && data.code !== existing.code) {
      const duplicate = await db.branch.findUnique({ where: { code: data.code } })
      if (duplicate) {
        return NextResponse.json({ error: 'Branch code already exists' }, { status: 409 })
      }
    }

    const branch = await db.branch.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.pincode !== undefined && { pincode: data.pincode }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.head !== undefined && { head: data.head }),
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
        details: `Updated branch: ${branch.name}`,
      },
    })

    return NextResponse.json({ branch })
  } catch (error: unknown) {
    console.error('Error updating branch:', error)
    const message = error instanceof Error ? error.message : 'Failed to update branch'
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

    const existing = await db.branch.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    await db.branch.delete({ where: { id } })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: (session.user as any)?.id,
        employeeId: (session.user as any)?.employeeId,
        action: 'delete',
        module: 'hr',
        details: `Deleted branch: ${existing.name}`,
      },
    })

    return NextResponse.json({ message: 'Branch deleted successfully' })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
  }
}
