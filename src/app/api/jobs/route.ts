import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function safeJsonParse(str: string | null, fallback: unknown = []) {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

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
      requirements: safeJsonParse(job.requirements, []),
      skills: safeJsonParse(job.skills, []),
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
    const { title, department, location, type, experience, salary, description, requirements, skills, closingDate } = body

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
        closingDate: closingDate || null,
      },
    })

    return NextResponse.json({
      ...job,
      applicants: 0,
      requirements: safeJsonParse(job.requirements, []),
      skills: safeJsonParse(job.skills, []),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, department, location, type, experience, salary, description, requirements, skills, status, closingDate } = body

    if (!id) {
      return NextResponse.json({ error: 'Job id is required' }, { status: 400 })
    }

    const existingJob = await db.job.findUnique({ where: { id } })
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title) updateData.title = title
    if (department !== undefined) updateData.department = department
    if (location !== undefined) updateData.location = location
    if (type !== undefined) updateData.type = type
    if (experience !== undefined) updateData.experience = experience
    if (salary !== undefined) updateData.salary = salary
    if (description !== undefined) updateData.description = description
    if (requirements !== undefined) updateData.requirements = JSON.stringify(requirements)
    if (skills !== undefined) updateData.skills = JSON.stringify(skills)
    if (status && ['open', 'closed', 'on-hold'].includes(status)) updateData.status = status
    if (closingDate !== undefined) updateData.closingDate = closingDate

    const job = await db.job.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { candidates: true } },
      },
    })

    return NextResponse.json({
      ...job,
      applicants: job._count.candidates,
      requirements: safeJsonParse(job.requirements, []),
      skills: safeJsonParse(job.skills, []),
    })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Job id is required' }, { status: 400 })
    }

    const existingJob = await db.job.findUnique({
      where: { id },
      include: { _count: { select: { candidates: true } } },
    })
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (existingJob._count.candidates > 0) {
      return NextResponse.json(
        { error: 'Cannot delete job with existing candidates. Close the job instead.' },
        { status: 409 }
      )
    }

    await db.job.delete({ where: { id } })

    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
