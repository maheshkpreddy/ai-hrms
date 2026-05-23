import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

function safeJsonParse(str: string | null, fallback: unknown = []) {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

// GET /api/ai-interview/[id] - Get interview details by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const interview = await db.aIInterview.findUnique({
      where: { id },
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

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

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
    })
  } catch (error) {
    console.error('Error fetching AI interview:', error)
    return NextResponse.json({ error: 'Failed to fetch AI interview' }, { status: 500 })
  }
}

// PATCH /api/ai-interview/[id] - Update interview (add response, complete, generate feedback)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, response, questions, status } = body

    const existingInterview = await db.aIInterview.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            skills: true,
            experience: true,
            education: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            skills: true,
          },
        },
      },
    })

    if (!existingInterview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    // Handle different actions
    if (action === 'start') {
      // Start the interview
      updateData.status = 'in_progress'
      updateData.startedAt = new Date().toISOString()
    } else if (action === 'add_response') {
      // Add a candidate response
      const currentResponses: Array<{ questionIndex: number; question: string; answer: string; aiEvaluation?: string; score?: number }> = safeJsonParse(existingInterview.responses, [])
      currentResponses.push(response)
      updateData.responses = JSON.stringify(currentResponses)
    } else if (action === 'update_questions') {
      // Update questions (after AI generation)
      updateData.questions = JSON.stringify(questions)
    } else if (action === 'complete') {
      // Complete the interview and generate AI feedback
      updateData.status = 'completed'
      updateData.completedAt = new Date().toISOString()

      // Generate AI feedback using the SDK
      try {
        const zai = await ZAI.create()
        const questionsData: Array<{ question: string; category?: string }> = safeJsonParse(existingInterview.questions, [])
        const responsesData: Array<{ question: string; answer: string; score?: number }> = safeJsonParse(existingInterview.responses, [])

        const feedbackPrompt = `You are an expert HR interviewer analyzing an AI-conducted interview. Based on the following interview data, generate a comprehensive assessment.

Job Title: ${existingInterview.job.title}
Job Description: ${existingInterview.job.description || 'N/A'}
Job Requirements: ${JSON.stringify(safeJsonParse(existingInterview.job.requirements, []))}
Required Skills: ${JSON.stringify(safeJsonParse(existingInterview.job.skills, []))}
Candidate Name: ${existingInterview.candidate.name}
Candidate Experience: ${existingInterview.candidate.experience || 'N/A'}
Candidate Skills: ${JSON.stringify(safeJsonParse(existingInterview.candidate.skills, []))}
Candidate Education: ${existingInterview.candidate.education || 'N/A'}

Interview Questions and Responses:
${responsesData.map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`).join('\n\n')}

Please provide a detailed assessment in the following JSON format (and nothing else):
{
  "overallScore": <number 0-100>,
  "categoryScores": {
    "technical": <number 0-100>,
    "communication": <number 0-100>,
    "problemSolving": <number 0-100>,
    "cultureFit": <number 0-100>
  },
  "strengths": [<array of strings>],
  "weaknesses": [<array of strings>],
  "recommendation": "<Strong Hire|Hire|Maybe|No Hire>",
  "summary": "<detailed feedback paragraph>"
}`

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert HR interviewer who provides objective, data-driven candidate assessments. Always respond with valid JSON only, no markdown formatting.' },
            { role: 'user', content: feedbackPrompt },
          ],
        })

        const aiResponse = completion.choices?.[0]?.message?.content || ''
        // Try to parse the AI response as JSON
        let feedbackData: Record<string, unknown>
        try {
          // Clean up potential markdown code blocks
          const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          feedbackData = JSON.parse(cleaned)
        } catch {
          feedbackData = {
            overallScore: 60,
            categoryScores: { technical: 60, communication: 65, problemSolving: 55, cultureFit: 65 },
            strengths: ['Demonstrated relevant experience', 'Clear communication style'],
            weaknesses: ['Could elaborate more on technical details', 'Limited examples of problem-solving'],
            recommendation: 'Maybe',
            summary: aiResponse || 'Assessment could not be parsed. Please review manually.',
          }
        }

        updateData.score = typeof feedbackData.overallScore === 'number' ? feedbackData.overallScore : 60
        updateData.feedback = JSON.stringify(feedbackData)
      } catch (aiError) {
        console.error('Error generating AI feedback:', aiError)
        // Fallback feedback if AI fails
        const responsesData: Array<{ score?: number }> = safeJsonParse(existingInterview.responses, [])
        const avgScore = responsesData.length > 0
          ? Math.round(responsesData.reduce((sum, r) => sum + (r.score || 60), 0) / responsesData.length)
          : 60

        updateData.score = avgScore
        updateData.feedback = JSON.stringify({
          overallScore: avgScore,
          categoryScores: { technical: avgScore, communication: avgScore, problemSolving: avgScore, cultureFit: avgScore },
          strengths: ['Assessment generated with limited data'],
          weaknesses: ['AI feedback generation encountered an issue - manual review recommended'],
          recommendation: 'Maybe',
          summary: 'Automated assessment completed. Manual review recommended due to processing limitations.',
        })
      }
    } else if (status) {
      // Direct status update (e.g., cancel)
      if (['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        updateData.status = status
      }
    }

    const updatedInterview = await db.aIInterview.update({
      where: { id },
      data: updateData,
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
      ...updatedInterview,
      questions: safeJsonParse(updatedInterview.questions, []),
      responses: safeJsonParse(updatedInterview.responses, []),
      candidate: {
        ...updatedInterview.candidate,
        skills: safeJsonParse(updatedInterview.candidate.skills, []),
      },
      job: {
        ...updatedInterview.job,
        requirements: safeJsonParse(updatedInterview.job.requirements, []),
        skills: safeJsonParse(updatedInterview.job.skills, []),
      },
    })
  } catch (error) {
    console.error('Error updating AI interview:', error)
    return NextResponse.json({ error: 'Failed to update AI interview' }, { status: 500 })
  }
}
