import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract fields
    const jobId = formData.get('jobId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = (formData.get('phone') as string) || null
    const skills = (formData.get('skills') as string) || null
    const experience = (formData.get('experience') as string) || null
    const currentCompany = (formData.get('currentCompany') as string) || null
    const coverLetter = (formData.get('coverLetter') as string) || null
    const resumeFile = formData.get('resume') as File | null

    // Validate required fields
    if (!jobId || !name || !email) {
      return NextResponse.json(
        { error: 'Job ID, name, and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check if the job exists and is open
    const job = await db.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json(
        { error: 'Job position not found' },
        { status: 404 }
      )
    }
    if (job.status !== 'open') {
      return NextResponse.json(
        { error: 'This position is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Handle resume upload
    let resumeUrl: string | null = null
    if (resumeFile) {
      // Validate file type
      const allowedTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      const allowedExtensions = ['.doc', '.docx']
      const fileExtension = path.extname(resumeFile.name).toLowerCase()

      if (!allowedTypes.includes(resumeFile.type) && !allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: 'Only Word documents (.doc, .docx) are accepted' },
          { status: 400 }
        )
      }

      // Save file
      const uniqueId = randomUUID()
      const fileName = `${uniqueId}${fileExtension}`
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes')

      const buffer = Buffer.from(await resumeFile.arrayBuffer())
      const filePath = path.join(uploadsDir, fileName)

      try {
        await writeFile(filePath, buffer)
        resumeUrl = `/uploads/resumes/${fileName}`
      } catch (writeError) {
        console.error('Error saving resume file:', writeError)
        // Continue without the resume rather than failing the whole application
        resumeUrl = null
      }
    }

    // Find or create candidate
    let candidate = await db.jobPortalCandidate.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!candidate) {
      // Create a new candidate with a random password (they can set their own later)
      const randomPassword = randomUUID()
      const passwordHash = await bcrypt.hash(randomPassword, 12)

      candidate = await db.jobPortalCandidate.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone,
          passwordHash,
          resumeUrl,
          skills: skills ? JSON.stringify(skills.split(',').map(s => s.trim()).filter(Boolean)) : null,
          experience,
          currentCompany,
          isActive: true,
        },
      })
    } else {
      // Update existing candidate info if provided
      const updateData: Record<string, unknown> = {}
      if (name && name !== candidate.name) updateData.name = name
      if (phone) updateData.phone = phone
      if (resumeUrl) updateData.resumeUrl = resumeUrl
      if (skills) updateData.skills = JSON.stringify(skills.split(',').map(s => s.trim()).filter(Boolean))
      if (experience) updateData.experience = experience
      if (currentCompany) updateData.currentCompany = currentCompany

      if (Object.keys(updateData).length > 0) {
        candidate = await db.jobPortalCandidate.update({
          where: { id: candidate.id },
          data: updateData,
        })
      }
    }

    // Check for duplicate application
    const existingApplication = await db.jobApplication.findFirst({
      where: {
        candidateId: candidate.id,
        jobId,
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 409 }
      )
    }

    // Create the job application
    const application = await db.jobApplication.create({
      data: {
        candidateId: candidate.id,
        jobId,
        status: 'applied',
        coverLetter,
      },
    })

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully!',
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting public application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again later.' },
      { status: 500 }
    )
  }
}
