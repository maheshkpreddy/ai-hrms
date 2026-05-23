import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department') || undefined
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined
    const search = searchParams.get('search') || undefined

    const where: Record<string, unknown> = {}
    if (department) where.department = department
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { department: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          candidates: { select: { id: true } },
          _count: { select: { candidates: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.job.count({ where }),
    ])

    const jobsWithApplicants = jobs.map((job) => ({
      ...job,
      applicants: job._count.candidates,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      skills: job.skills ? JSON.parse(job.skills) : [],
    }))

    return NextResponse.json({
      jobs: jobsWithApplicants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, department, location, type, experience, salary, description, requirements, skills } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const job = await db.job.create({
      data: {
        title,
        department: department || null,
        location: location || null,
        type: type || null,
        experience: experience || null,
        salary: salary || null,
        description: description || null,
        requirements: requirements ? JSON.stringify(requirements) : null,
        skills: skills ? JSON.stringify(skills) : null,
        status: 'open',
        postedDate: new Date().toISOString().split('T')[0],
      },
    })

    return NextResponse.json({
      ...job,
      applicants: 0,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      skills: job.skills ? JSON.parse(job.skills) : [],
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
