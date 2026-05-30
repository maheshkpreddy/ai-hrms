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
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true, status: true } },
        _count: {
          select: {
            members: true,
            employees: true,
            departments: true,
            branches: true,
            companyPolicies: true,
            payrollStructures: true,
            workflowDefs: true,
            users: true,
          },
        },
        companyPolicies: {
          select: { id: true, title: true, category: true, status: true, version: true, effectiveDate: true },
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        payrollStructures: {
          select: { id: true, name: true, basicPay: true, hra: true, da: true, pfEmployee: true, taxDeduction: true },
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        workflowDefs: {
          select: { id: true, name: true, type: true, entity: true, isActive: true },
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true },
          take: 50,
          orderBy: { createdAt: 'desc' },
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
        ...(body.legalName !== undefined && { legalName: body.legalName }),
        ...(body.code !== undefined && { code: body.code }),
        ...(body.gstVat !== undefined && { gstVat: body.gstVat }),
        ...(body.panTanCin !== undefined && { panTanCin: body.panTanCin }),
        ...(body.registrationNumber !== undefined && { registrationNumber: body.registrationNumber }),
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.industryType !== undefined && { industry: body.industryType }),
        ...(body.logo !== undefined && { logo: body.logo }),
        ...(body.domain !== undefined && { domain: body.domain }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.timezone !== undefined && { timezone: body.timezone }),
        ...(body.payrollCycle !== undefined && { payrollCycle: body.payrollCycle }),
        ...(body.financialYear !== undefined && { financialYear: body.financialYear }),
        ...(body.defaultLanguage !== undefined && { defaultLanguage: body.defaultLanguage }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.parentId !== undefined && { parentId: body.parentId || null }),
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
