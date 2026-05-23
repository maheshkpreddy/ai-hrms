import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// AI Interview API Route

function safeJsonParse(str: string | null, fallback: unknown = []) {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

// GET /api/ai-interview - List AI interviews with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId') || undefined
    const jobId = searchParams.get('jobId') || undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (candidateId) where.candidateId = candidateId
    if (jobId) where.jobId = jobId
    if (status) where.status = status

    const [interviews, total] = await Promise.all([
      db.aIInterview.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              currentCompany: true,
              experience: true,
              skills: true,
              education: true,
              status: true,
              aiFitScore: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              description: true,
              requirements: true,
              skills: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.aIInterview.count({ where }),
    ])

    const interviewsWithParsed = interviews.map((interview) => ({
      ...interview,
      questions: safeJsonParse(interview.questions, []),
      responses: safeJsonParse(interview.responses, []),
      candidate: {
        ...interview.candidate,
        skills: safeJsonParse(interview.candidate.skills, []),
      },
      job: {
        ...interview.job,
        requirements: safeJsonParse(interview.job.requirements, []),
        skills: safeJsonParse(interview.job.skills, []),
      },
    }))

    return NextResponse.json({
      interviews: interviewsWithParsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching AI interviews:', error)
    return NextResponse.json({ error: 'Failed to fetch AI interviews' }, { status: 500 })
  }
}

// POST /api/ai-interview - Create a new AI interview session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateId, jobId } = body

    if (!candidateId || !jobId) {
      return NextResponse.json({ error: 'candidateId and jobId are required' }, { status: 400 })
    }

    // Verify candidate exists
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      include: {
        job: { select: { id: true, title: true, description: true, requirements: true, skills: true } },
      },
    })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Verify job exists
    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Create the interview session (questions will be generated separately)
    const interview = await db.aIInterview.create({
      data: {
        candidateId,
        jobId,
        status: 'scheduled',
        questions: JSON.stringify([]),
        responses: JSON.stringify([]),
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            currentCompany: true,
            experience: true,
            skills: true,
            education: true,
            status: true,
            aiFitScore: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            description: true,
            requirements: true,
            skills: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...interview,
      questions: safeJsonParse(interview.questions, []),
      responses: safeJsonParse(interview.responses, []),
      candidate: {
        ...interview.candidate,
        skills: safeJsonParse(interview.candidate.skills, []),
      },
      job: {
        ...interview.job,
        requirements: safeJsonParse(interview.job.requirements, []),
        skills: safeJsonParse(interview.job.skills, []),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating AI interview:', error)
    return NextResponse.json({ error: 'Failed to create AI interview' }, { status: 500 })
  }
}
