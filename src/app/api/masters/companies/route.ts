import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const industry = searchParams.get('industry')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
        { legalName: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (industry) {
      where.industry = industry
    }

    const records = await db.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true } },
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

    if (!body.code) {
      return NextResponse.json(
        { error: 'Company code is required' },
        { status: 400 }
      )
    }

    // Check for duplicate code
    const existingCode = await db.company.findUnique({
      where: { code: body.code },
    })
    if (existingCode) {
      return NextResponse.json(
        { error: 'Company with this code already exists' },
        { status: 409 }
      )
    }

    const record = await db.company.create({
      data: {
        name: body.name,
        legalName: body.legalName || null,
        code: body.code,
        gstVat: body.gstVat || null,
        panTanCin: body.panTanCin || null,
        registrationNumber: body.registrationNumber || null,
        industry: body.industry || body.industryType || null,
        logo: body.logo || null,
        domain: body.domain || null,
        address: body.address || null,
        country: body.country || null,
        state: body.state || null,
        city: body.city || null,
        currency: body.currency || 'USD',
        timezone: body.timezone || 'UTC',
        payrollCycle: body.payrollCycle || null,
        financialYear: body.financialYear || null,
        defaultLanguage: body.defaultLanguage || null,
        status: body.status || 'active',
        parentId: body.parentId || null,
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const existing = await db.company.findUnique({ where: { id: body.id } })
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
      where: { id: body.id },
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

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
