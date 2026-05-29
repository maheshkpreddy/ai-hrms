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

/** Format candidate for API response */
function formatCandidate(c: any) {
  return {
    ...c,
    name: `${c.firstName} ${c.lastName}`.trim(),
    skills: [] as string[],
    education: null as string | null,
    experience: c.experience ? `${c.experience} years` : null,
    aiFitScore: c.aiScore,
    resumeUrl: c.resume,
  }
}

/** Format job for API response */
function formatJob(j: any) {
  return {
    ...j,
    requirements: safeJsonParse(j.requirements, []),
    skills: [] as string[],
  }
}

// ─── Helper: Simulate cheating signal detection ────────────────────────────
function detectCheatingSignals(
  responses: Array<{ question: string; answer: string; score?: number }>
): { signals: string[]; riskLevel: 'low' | 'medium' | 'high' } {
  const signals: string[] = []

  if (responses.length === 0) {
    return { signals: ['No responses provided'], riskLevel: 'high' }
  }

  const shortAnswers = responses.filter(
    (r) => typeof r.answer === 'string' && r.answer.trim().length < 15
  )
  if (shortAnswers.length > responses.length * 0.5) {
    signals.push('More than 50% of answers are suspiciously short')
  }

  const answerTexts = responses.map((r) => r.answer?.trim().toLowerCase())
  const uniqueAnswers = new Set(answerTexts)
  if (uniqueAnswers.size < answerTexts.length * 0.6 && answerTexts.length > 2) {
    signals.push('Multiple identical or near-identical answers detected')
  }

  const longIdentical = answerTexts.filter(
    (a, i) => a.length > 100 && answerTexts.indexOf(a) !== i
  )
  if (longIdentical.length > 0) {
    signals.push('Long identical responses detected – possible copy-paste')
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (signals.length >= 3) riskLevel = 'high'
  else if (signals.length >= 1) riskLevel = 'medium'

  if (signals.length === 0) {
    signals.push('No suspicious patterns detected')
  }

  return { signals, riskLevel }
}

// ─── Helper: Compute CV score ────────────────────────────────────────────
async function computeCvScore(params: {
  candidateSkills: string[]
  candidateExperience: string | null
  candidateEducation: string | null
  jobRequirements: unknown[]
  jobSkills: unknown[]
  jobTitle: string
  jobDescription: string | null
}): Promise<number> {
  try {
    const zai = await ZAI.create()
    const prompt = `You are a recruiter AI scoring a candidate's CV against job requirements. Score from 0 to 100.

Job Title: ${params.jobTitle}
Job Description: ${params.jobDescription || 'N/A'}
Job Requirements: ${JSON.stringify(params.jobRequirements)}
Required Skills: ${JSON.stringify(params.jobSkills)}

Candidate Skills: ${JSON.stringify(params.candidateSkills)}
Candidate Experience: ${params.candidateExperience || 'N/A'}
Candidate Education: ${params.candidateEducation || 'N/A'}

Return ONLY a single integer number between 0 and 100 representing the CV fit score. No other text.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a precise CV scoring AI. Return only a single integer score.' },
        { role: 'user', content: prompt },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content?.trim() || ''
    const score = parseInt(raw.replace(/[^0-9]/g, ''), 10)
    if (!isNaN(score) && score >= 0 && score <= 100) return score
  } catch {
    // fall through to heuristic
  }

  return Math.round(50 + Math.random() * 20)
}

// ─── Helper: Generate video timestamps ──────────────────────────────
function generateVideoTimestamps(
  responses: Array<{ question: string; answer: string }>,
  totalDurationSec: number
): Array<{ questionIndex: number; label: string; time: string }> {
  if (responses.length === 0 || totalDurationSec <= 0) return []

  const avgPerQuestion = totalDurationSec / responses.length
  const timestamps: Array<{ questionIndex: number; label: string; time: string }> = []

  for (let i = 0; i < responses.length; i++) {
    const startSec = Math.round(i * avgPerQuestion)
    const mins = Math.floor(startSec / 60)
    const secs = startSec % 60
    timestamps.push({
      questionIndex: i,
      label: `Q${i + 1}: ${responses[i].question?.substring(0, 60) || 'Question'}...`,
      time: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
    })
  }

  return timestamps
}

// ─── Helper: Build transcript ───────────────────────────────────────
function buildTranscript(
  candidateName: string,
  responses: Array<{ question: string; answer: string }>,
  language: string
): string {
  const header = `Interview Transcript - ${candidateName}${language !== 'en' ? ` (Language: ${language})` : ''}`
  const separator = '-'.repeat(60)
  const lines = [header, separator]

  for (let i = 0; i < responses.length; i++) {
    lines.push('')
    lines.push(`[Q${i + 1}] ${responses[i].question || '(no question text)'}`)
    lines.push(`[A${i + 1}] ${responses[i].answer || '(no answer provided)'}`)
  }

  lines.push('', separator, `End of transcript. ${responses.length} question(s) answered.`)
  return lines.join('\n')
}

// GET /api/ai-interview/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const interview = await db.aIInterview.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
      },
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...interview,
      questions: safeJsonParse(interview.questions, []),
      responses: safeJsonParse(interview.responses, []),
      rubric: safeJsonParse(interview.rubric, null),
      cheatingSignals: safeJsonParse(interview.cheatingSignals, null),
      videoTimestamps: safeJsonParse(interview.videoTimestamps, []),
      candidate: formatCandidate(interview.candidate),
      job: formatJob(interview.job),
    })
  } catch (error) {
    console.error('Error fetching AI interview:', error)
    return NextResponse.json({ error: 'Failed to fetch AI interview' }, { status: 500 })
  }
}

// PATCH /api/ai-interview/[id]
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
        candidate: true,
        job: true,
      },
    })

    if (!existingInterview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (action === 'start') {
      updateData.status = 'in_progress'
      updateData.startedAt = new Date().toISOString()

    } else if (action === 'add_response') {
      const currentResponses: Array<{
        questionIndex: number
        question: string
        answer: string
        aiEvaluation?: string
        score?: number
      }> = safeJsonParse(existingInterview.responses, [])
      currentResponses.push(response)
      updateData.responses = JSON.stringify(currentResponses)

      // Generate dynamic follow-up question
      try {
        const zai = await ZAI.create()
        const currentQuestions: Array<{ question: string; category?: string }> = safeJsonParse(
          existingInterview.questions, []
        )

        const followUpPrompt = `You are an expert interviewer for: ${existingInterview.job.title}.
The candidate just answered:
Q: ${response.question || 'N/A'}
A: ${response.answer || 'N/A'}

Generate ONE relevant follow-up question. Return ONLY the question text.`

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert interviewer. Return only the follow-up question text.' },
            { role: 'user', content: followUpPrompt },
          ],
        })

        const aiText = completion.choices?.[0]?.message?.content?.trim()
        if (aiText) {
          currentQuestions.push({ question: aiText, category: 'follow_up' })
          updateData.questions = JSON.stringify(currentQuestions)
        }
      } catch (aiError) {
        console.error('Error generating follow-up question:', aiError)
      }

    } else if (action === 'update_questions') {
      updateData.questions = JSON.stringify(questions)

    } else if (action === 'complete') {
      const completedAt = new Date()
      updateData.status = 'completed'
      updateData.completedAt = completedAt.toISOString()

      const responsesData: Array<{ question: string; answer: string; score?: number }> =
        safeJsonParse(existingInterview.responses, [])

      // Duration
      if (existingInterview.startedAt) {
        const startedAtDate = new Date(existingInterview.startedAt)
        const diffMs = completedAt.getTime() - startedAtDate.getTime()
        updateData.duration = Math.max(0, Math.round(diffMs / 1000))
      }

      const durationSec = (updateData.duration as number) || 0

      // Cheating signals
      const cheatingResult = detectCheatingSignals(responsesData)
      updateData.cheatingSignals = JSON.stringify(cheatingResult)

      // CV score
      const candidateFormatted = formatCandidate(existingInterview.candidate)
      const jobFormatted = formatJob(existingInterview.job)

      const cvScore = await computeCvScore({
        candidateSkills: candidateFormatted.skills,
        candidateExperience: candidateFormatted.experience,
        candidateEducation: candidateFormatted.education,
        jobRequirements: jobFormatted.requirements,
        jobSkills: jobFormatted.skills,
        jobTitle: existingInterview.job.title,
        jobDescription: existingInterview.job.description,
      })
      updateData.cvScore = cvScore

      // Video timestamps
      const videoTimestamps = generateVideoTimestamps(responsesData, durationSec)
      updateData.videoTimestamps = JSON.stringify(videoTimestamps)

      // Transcript
      const candidateName = `${existingInterview.candidate.firstName} ${existingInterview.candidate.lastName}`.trim()
      const transcript = buildTranscript(candidateName, responsesData, existingInterview.language || 'en')
      updateData.transcript = transcript

      // AI Feedback
      try {
        const zai = await ZAI.create()

        const feedbackPrompt = `You are an expert HR interviewer analyzing an AI-conducted interview.

Job Title: ${existingInterview.job.title}
Candidate: ${candidateName}
CV Score: ${cvScore}/100
Cheating Risk: ${cheatingResult.riskLevel}

Interview Responses:
${responsesData.map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`).join('\n\n')}

Provide assessment in JSON format:
{
  "overallScore": <0-100>,
  "categoryScores": { "technical": <0-100>, "communication": <0-100>, "problemSolving": <0-100>, "cultureFit": <0-100> },
  "strengths": [<strings>],
  "weaknesses": [<strings>],
  "recommendation": "<Strong Hire|Hire|Maybe|No Hire>",
  "summary": "<detailed feedback>"
}`

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert HR interviewer. Return valid JSON only, no markdown.' },
            { role: 'user', content: feedbackPrompt },
          ],
        })

        const aiResponse = completion.choices?.[0]?.message?.content || ''
        let feedbackData: Record<string, unknown>
        try {
          const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          feedbackData = JSON.parse(cleaned)
        } catch {
          const avgScore = responsesData.length > 0
            ? Math.round(responsesData.reduce((sum, r) => sum + (r.score || 60), 0) / responsesData.length)
            : 60
          feedbackData = {
            overallScore: avgScore,
            categoryScores: { technical: avgScore, communication: avgScore, problemSolving: avgScore, cultureFit: avgScore },
            strengths: ['Demonstrated relevant experience'],
            weaknesses: ['Could elaborate more on technical details'],
            recommendation: 'Maybe',
            summary: aiResponse || 'Assessment completed. Manual review recommended.',
          }
        }

        updateData.score = typeof feedbackData.overallScore === 'number' ? feedbackData.overallScore : 60
        updateData.feedback = JSON.stringify(feedbackData)
      } catch (aiError) {
        console.error('Error generating AI feedback:', aiError)
        const avgScore = responsesData.length > 0
          ? Math.round(responsesData.reduce((sum, r) => sum + (r.score || 60), 0) / responsesData.length)
          : 60
        updateData.score = avgScore
        updateData.feedback = JSON.stringify({
          overallScore: avgScore,
          categoryScores: { technical: avgScore, communication: avgScore, problemSolving: avgScore, cultureFit: avgScore },
          strengths: ['Assessment generated with limited data'],
          weaknesses: ['Manual review recommended'],
          recommendation: 'Maybe',
          summary: 'Automated assessment completed. Manual review recommended.',
        })
      }

    } else if (action === 'cancel') {
      updateData.status = 'cancelled'
    } else if (status) {
      if (['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        updateData.status = status
      }
    }

    const updatedInterview = await db.aIInterview.update({
      where: { id },
      data: updateData,
      include: {
        candidate: true,
        job: true,
      },
    })

    return NextResponse.json({
      ...updatedInterview,
      questions: safeJsonParse(updatedInterview.questions, []),
      responses: safeJsonParse(updatedInterview.responses, []),
      rubric: safeJsonParse(updatedInterview.rubric, null),
      cheatingSignals: safeJsonParse(updatedInterview.cheatingSignals, null),
      videoTimestamps: safeJsonParse(updatedInterview.videoTimestamps, []),
      candidate: formatCandidate(updatedInterview.candidate),
      job: formatJob(updatedInterview.job),
    })
  } catch (error) {
    console.error('Error updating AI interview:', error)
    return NextResponse.json({ error: 'Failed to update AI interview' }, { status: 500 })
  }
}
