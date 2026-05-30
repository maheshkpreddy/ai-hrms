import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { candidateName: { contains: search } },
        { email: { contains: search } },
        { skills: { contains: search } },
        { currentCompany: { contains: search } },
      ]
    }

    const [resumes, total] = await Promise.all([
      db.subVendorResume.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subVendor: { select: { id: true, companyName: true } },
          job: { select: { id: true, title: true, department: true } },
        },
      }),
      db.subVendorResume.count({ where }),
    ])

    return NextResponse.json({
      resumes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching all resumes:', error)
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}
