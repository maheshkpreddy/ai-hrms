import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  // PUBLIC - No auth required for resume submission
  try {
    let data: Record<string, string | undefined>
    let resumeFileName: string | null = null

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with file upload
      const formData = await req.formData()
      data = {
        name: formData.get('name') as string | undefined,
        email: formData.get('email') as string | undefined,
        phone: formData.get('phone') as string | undefined,
        skills: formData.get('skills') as string | undefined,
        experience: formData.get('experience') as string | undefined,
        previousCompany: formData.get('previousCompany') as string | undefined,
        previousRole: formData.get('previousRole') as string | undefined,
        education: formData.get('education') as string | undefined,
        currentCompany: formData.get('currentCompany') as string | undefined,
        expectedSalary: formData.get('expectedSalary') as string | undefined,
        location: formData.get('location') as string | undefined,
        noticePeriod: formData.get('noticePeriod') as string | undefined,
        source: formData.get('source') as string | undefined,
        notes: formData.get('coverNote') as string | undefined,
        jobId: formData.get('jobId') as string | undefined,
        jobTitle: formData.get('jobTitle') as string | undefined,
        department: formData.get('department') as string | undefined,
      }

      // Handle file upload
      const file = formData.get('resume') as File | null
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes')
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const ext = path.extname(file.name) || '.docx'
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
        const filePath = path.join(uploadDir, uniqueName)

        await writeFile(filePath, buffer)
        resumeFileName = `/uploads/resumes/${uniqueName}`
      }
    } else {
      // Handle JSON body (backward compatibility)
      data = await req.json()
    }

    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const resume = await db.jobPortalResume.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        resumeUrl: resumeFileName || data.resumeUrl || null,
        skills: data.skills || null,
        experience: data.experience || null,
        previousCompany: data.previousCompany || null,
        previousRole: data.previousRole || null,
        education: data.education || null,
        currentCompany: data.currentCompany || null,
        expectedSalary: data.expectedSalary || null,
        location: data.location || null,
        noticePeriod: data.noticePeriod || null,
        source: data.source || 'portal',
        status: 'new',
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ success: true, resume }, { status: 201 })
  } catch (error: any) {
    console.error('Error submitting resume:', error)
    if (error.code === 'P2002') {
      // Unique constraint violation - candidate may be re-applying
      return NextResponse.json(
        { error: 'A resume with this email already exists. Please contact HR for updates.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to submit resume' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Requires auth to view resumes
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const source = searchParams.get('source')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (source) where.source = source
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { skills: { contains: search, mode: 'insensitive' } },
        { previousCompany: { contains: search, mode: 'insensitive' } },
        { previousRole: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [resumes, total] = await Promise.all([
      db.jobPortalResume.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.jobPortalResume.count({ where }),
    ])

    return NextResponse.json({
      resumes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}
