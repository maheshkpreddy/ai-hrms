import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// AI Interview API Route

function safeJsonParse(str: string | null, fallback: unknown = []) {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/** Format candidate for API response (map firstName/lastName → name, etc.) */
function formatCandidate(c: {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  currentCompany: string | null
  experience: number | null
  aiScore: number | null
  resume: string | null
  status: string
}) {
  return {
    ...c,
    name: `${c.firstName} ${c.lastName}`.trim(),
    skills: [] as string[], // Not in schema, return empty
    education: null as string | null, // Not in schema
    experience: c.experience ? `${c.experience} years` : null,
    aiFitScore: c.aiScore, // Map aiScore → aiFitScore
    resumeUrl: c.resume, // Map resume → resumeUrl
  }
}

/** Format job for API response */
function formatJob(j: {
  id: string
  title: string
  department: string | null
  description: string | null
  requirements: string | null
}) {
  return {
    ...j,
    requirements: safeJsonParse(j.requirements, []),
    skills: [] as string[], // Not in schema, return empty
  }
}

/** Generate a unique interview link */
function generateInterviewLink(): string {
  return `/interview/${nanoid()}`
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
          candidate: true,
          job: true,
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
      cheatingSignals: safeJsonParse(interview.cheatingSignals, []),
      videoTimestamps: safeJsonParse(interview.videoTimestamps, []),
      rubric: safeJsonParse(interview.rubric, null),
      feedback: interview.feedback ? safeJsonParse(interview.feedback, null) : null,
      candidate: formatCandidate(interview.candidate as any),
      job: formatJob(interview.job as any),
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
    const { candidateId, jobId, language, rubric, resumeUrl } = body

    if (!candidateId || !jobId) {
      return NextResponse.json({ error: 'candidateId and jobId are required' }, { status: 400 })
    }

    // Verify candidate exists
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
    })
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Verify job exists
    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Determine interview language (default to "en")
    const interviewLanguage = typeof language === 'string' && language.trim() ? language.trim() : 'en'

    // Validate rubric
    let rubricJson: string | undefined
    if (rubric !== undefined && rubric !== null) {
      if (typeof rubric === 'string') {
        try {
          JSON.parse(rubric)
          rubricJson = rubric
        } catch {
          return NextResponse.json({ error: 'rubric must be a valid JSON string' }, { status: 400 })
        }
      } else if (typeof rubric === 'object') {
        rubricJson = JSON.stringify(rubric)
      } else {
        return NextResponse.json({ error: 'rubric must be a valid JSON string or object' }, { status: 400 })
      }
    }

    const resumeUrlValue = typeof resumeUrl === 'string' && resumeUrl.trim() ? resumeUrl.trim() : undefined

    // Generate a unique interview link
    const interviewLink = generateInterviewLink()

    // Create the interview session
    const interview = await db.aIInterview.create({
      data: {
        candidateId,
        jobId,
        status: 'scheduled',
        questions: JSON.stringify([]),
        responses: JSON.stringify([]),
        language: interviewLanguage,
        ...(rubricJson !== undefined && { rubric: rubricJson }),
        ...(resumeUrlValue !== undefined && { resumeUrl: resumeUrlValue }),
        interviewLink,
      },
      include: {
        candidate: true,
        job: true,
      },
    })

    return NextResponse.json({
      ...interview,
      questions: safeJsonParse(interview.questions, []),
      responses: safeJsonParse(interview.responses, []),
      rubric: safeJsonParse(interview.rubric, null),
      candidate: formatCandidate(interview.candidate as any),
      job: formatJob(interview.job as any),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating AI interview:', error)
    return NextResponse.json({ error: 'Failed to create AI interview' }, { status: 500 })
  }
}
