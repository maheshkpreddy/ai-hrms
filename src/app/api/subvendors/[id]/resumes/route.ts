import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const resumes = await db.subVendorResume.findMany({
      where: { subVendorId: id },
      orderBy: { createdAt: 'desc' },
      include: { job: { select: { id: true, title: true, department: true } } },
    })
    return NextResponse.json({ resumes })
  } catch (error) {
    console.error('Error fetching sub-vendor resumes:', error)
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.candidateName || !body.email) {
      return NextResponse.json({ error: 'candidateName and email are required' }, { status: 400 })
    }

    const resume = await db.subVendorResume.create({
      data: {
        subVendorId: id,
        candidateName: body.candidateName,
        email: body.email,
        phone: body.phone || null,
        resumeUrl: body.resumeUrl || null,
        skills: body.skills || null,
        experience: body.experience || null,
        currentCompany: body.currentCompany || null,
        expectedSalary: body.expectedSalary || null,
        jobId: body.jobId || null,
        status: body.status || 'uploaded',
      },
      include: { job: { select: { id: true, title: true } } },
    })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error('Error creating sub-vendor resume:', error)
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 })
  }
}
