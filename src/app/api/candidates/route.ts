import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const jobId = searchParams.get('jobId') || undefined
    const status = searchParams.get('status') || undefined
    const source = searchParams.get('source') || undefined
    const search = searchParams.get('search') || undefined

    const where: Record<string, unknown> = {}
    if (jobId) where.jobId = jobId
    if (status) where.status = status
    if (source) where.source = source
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { currentCompany: { contains: search } },
      ]
    }

    const [candidates, total] = await Promise.all([
      db.candidate.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, requirements: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.candidate.count({ where }),
    ])

    const candidatesWithParsed = candidates.map((c) => ({
      ...c,
      skills: c.skills ? JSON.parse(c.skills) : [],
      job: c.job
        ? {
            ...c.job,
            requirements: c.job.requirements ? JSON.parse(c.job.requirements) : [],
          }
        : null,
    }))

    return NextResponse.json({
      candidates: candidatesWithParsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, name, email, phone, currentCompany, experience, skills, education, source } = body

    if (!jobId || !name || !email) {
      return NextResponse.json({ error: 'jobId, name, and email are required' }, { status: 400 })
    }

    // Verify job exists
    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Generate AI fit score (simple heuristic based on skill matching)
    const jobRequirements: string[] = job.requirements ? JSON.parse(job.requirements) : []
    const candidateSkills: string[] = skills || []
    const matchedSkills = candidateSkills.filter((s: string) =>
      jobRequirements.some((r: string) => r.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(r.toLowerCase()))
    )
    const aiFitScore = jobRequirements.length > 0
      ? Math.min(100, Math.round((matchedSkills.length / jobRequirements.length) * 70) + Math.floor(Math.random() * 20) + 10)
      : Math.floor(Math.random() * 30) + 40

    const candidate = await db.candidate.create({
      data: {
        jobId,
        name,
        email,
        phone: phone || null,
        currentCompany: currentCompany || null,
        experience: experience || null,
        skills: skills ? JSON.stringify(skills) : null,
        education: education || null,
        source: source || 'portal',
        status: 'applied',
        aiFitScore,
      },
      include: {
        job: { select: { id: true, title: true, requirements: true } },
      },
    })

    return NextResponse.json({
      ...candidate,
      skills: candidate.skills ? JSON.parse(candidate.skills) : [],
      job: candidate.job
        ? {
            ...candidate.job,
            requirements: candidate.job.requirements ? JSON.parse(candidate.job.requirements) : [],
          }
        : null,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating candidate:', error)
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
  }
}
