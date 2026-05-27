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

// ─── Helper: Simulate cheating signal detection ────────────────────────────
function detectCheatingSignals(
  responses: Array<{ question: string; answer: string; score?: number }>
): { signals: string[]; riskLevel: 'low' | 'medium' | 'high' } {
  const signals: string[] = []

  if (responses.length === 0) {
    return { signals: ['No responses provided'], riskLevel: 'high' }
  }

  // Check for very short answers (< 15 characters)
  const shortAnswers = responses.filter(
    (r) => typeof r.answer === 'string' && r.answer.trim().length < 15
  )
  if (shortAnswers.length > responses.length * 0.5) {
    signals.push('More than 50% of answers are suspiciously short (under 15 characters)')
  }

  // Check for identical answers
  const answerTexts = responses.map((r) => r.answer?.trim().toLowerCase())
  const uniqueAnswers = new Set(answerTexts)
  if (uniqueAnswers.size < answerTexts.length * 0.6 && answerTexts.length > 2) {
    signals.push('Multiple identical or near-identical answers detected')
  }

  // Check for copy-paste patterns (very long answers that are identical)
  const longIdentical = answerTexts.filter(
    (a, i) => a.length > 100 && answerTexts.indexOf(a) !== i
  )
  if (longIdentical.length > 0) {
    signals.push('Long identical responses detected – possible copy-paste')
  }

  // Check for answers that don't relate to the question (very basic heuristic)
  const offTopicCount = responses.filter((r) => {
    if (!r.question || !r.answer) return false
    const questionWords = r.question.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
    const answerLower = r.answer.toLowerCase()
    const overlap = questionWords.filter((w) => answerLower.includes(w))
    return questionWords.length > 2 && overlap.length === 0
  })
  if (offTopicCount.length > responses.length * 0.4) {
    signals.push('Many answers appear off-topic relative to the questions')
  }

  // Check for generic filler phrases
  const fillerPhrases = ['i dont know', 'not sure', 'no comment', 'n/a', 'na', 'pass']
  const fillerCount = responses.filter((r) =>
    fillerPhrases.includes(r.answer?.trim().toLowerCase())
  )
  if (fillerCount.length > responses.length * 0.3) {
    signals.push('High frequency of generic filler / non-substantive answers')
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (signals.length >= 3) riskLevel = 'high'
  else if (signals.length >= 1) riskLevel = 'medium'

  if (signals.length === 0) {
    signals.push('No suspicious patterns detected')
  }

  return { signals, riskLevel }
}

// ─── Helper: Compute CV score from candidate profile vs job requirements ───
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

  // Fallback heuristic scoring
  const jobSkillStrings: string[] = (
    Array.isArray(params.jobSkills) ? params.jobSkills : []
  ).map((s: unknown) => String(s).toLowerCase())

  const candidateSkillStrings: string[] = params.candidateSkills.map((s) =>
    typeof s === 'string' ? s.toLowerCase() : String(s).toLowerCase()
  )

  let matchCount = 0
  for (const js of jobSkillStrings) {
    if (candidateSkillStrings.some((cs) => cs.includes(js) || js.includes(cs))) {
      matchCount++
    }
  }

  const skillMatch = jobSkillStrings.length > 0 ? matchCount / jobSkillStrings.length : 0.5
  const hasExperience = !!params.candidateExperience
  const hasEducation = !!params.candidateEducation

  let base = skillMatch * 60
  if (hasExperience) base += 20
  if (hasEducation) base += 10
  base = Math.min(base, 100)

  return Math.round(base)
}

// ─── Helper: Generate video timestamps from responses ──────────────────────
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

// ─── Helper: Build transcript from responses ───────────────────────────────
function buildTranscript(
  candidateName: string,
  responses: Array<{ question: string; answer: string }>,
  language: string
): string {
  const header = `Interview Transcript – ${candidateName}${language !== 'en' ? ` (Language: ${language})` : ''}`
  const separator = '─'.repeat(60)
  const lines = [header, separator]

  for (let i = 0; i < responses.length; i++) {
    lines.push(``)
    lines.push(`[Q${i + 1}] ${responses[i].question || '(no question text)'}`)
    lines.push(`[A${i + 1}] ${responses[i].answer || '(no answer provided)'}`)
  }

  lines.push(``, separator, `End of transcript. ${responses.length} question(s) answered.`)
  return lines.join('\n')
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
      rubric: safeJsonParse(interview.rubric, null),
      cheatingSignals: safeJsonParse(interview.cheatingSignals, null),
      videoTimestamps: safeJsonParse(interview.videoTimestamps, []),
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
      // Add a candidate response AND generate a dynamic follow-up question using AI
      const currentResponses: Array<{
        questionIndex: number
        question: string
        answer: string
        aiEvaluation?: string
        score?: number
      }> = safeJsonParse(existingInterview.responses, [])
      currentResponses.push(response)
      updateData.responses = JSON.stringify(currentResponses)

      // Generate a dynamic follow-up question using AI
      let followUpQuestion: string | null = null
      try {
        const zai = await ZAI.create()
        const currentQuestions: Array<{ question: string; category?: string }> = safeJsonParse(
          existingInterview.questions,
          []
        )

        const followUpPrompt = `You are an expert interviewer conducting a live interview for the position: ${existingInterview.job.title}.

The candidate just answered the following question:
Q: ${response.question || 'N/A'}
A: ${response.answer || 'N/A'}

Based on the candidate's answer, generate ONE relevant follow-up question that digs deeper into their expertise or explores an area they mentioned. The question should be concise and probing.

Return ONLY the follow-up question text. No numbering, no explanation, no markdown.`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'You are an expert interviewer. Generate concise, probing follow-up questions based on candidate answers. Return only the question text.',
            },
            { role: 'user', content: followUpPrompt },
          ],
        })

        const aiText = completion.choices?.[0]?.message?.content?.trim()
        if (aiText) {
          followUpQuestion = aiText
          // Append the follow-up question to the questions array
          currentQuestions.push({
            question: followUpQuestion,
            category: 'follow_up',
          })
          updateData.questions = JSON.stringify(currentQuestions)
        }
      } catch (aiError) {
        console.error('Error generating follow-up question:', aiError)
        // Non-fatal – the response is still saved, just no follow-up generated
      }

    } else if (action === 'update_questions') {
      // Update questions (after AI generation)
      updateData.questions = JSON.stringify(questions)

    } else if (action === 'complete') {
      // Complete the interview and generate AI feedback + Flowmingo enhancements
      const completedAt = new Date()
      updateData.status = 'completed'
      updateData.completedAt = completedAt.toISOString()

      const responsesData: Array<{ question: string; answer: string; score?: number }> =
        safeJsonParse(existingInterview.responses, [])
      const questionsData: Array<{ question: string; category?: string }> = safeJsonParse(
        existingInterview.questions,
        []
      )

      // ── Calculate duration ──────────────────────────────────────────────
      if (existingInterview.startedAt) {
        const startedAtDate = new Date(existingInterview.startedAt)
        const diffMs = completedAt.getTime() - startedAtDate.getTime()
        updateData.duration = Math.max(0, Math.round(diffMs / 1000))
      }

      const durationSec = (updateData.duration as number) || 0

      // ── Cheating signal detection ───────────────────────────────────────
      const cheatingResult = detectCheatingSignals(responsesData)
      updateData.cheatingSignals = JSON.stringify(cheatingResult)

      // ── CV score ────────────────────────────────────────────────────────
      const cvScore = await computeCvScore({
        candidateSkills: safeJsonParse(existingInterview.candidate.skills, []) as string[],
        candidateExperience: existingInterview.candidate.experience,
        candidateEducation: existingInterview.candidate.education,
        jobRequirements: safeJsonParse(existingInterview.job.requirements, []),
        jobSkills: safeJsonParse(existingInterview.job.skills, []),
        jobTitle: existingInterview.job.title,
        jobDescription: existingInterview.job.description,
      })
      updateData.cvScore = cvScore

      // ── Video timestamps ────────────────────────────────────────────────
      const videoTimestamps = generateVideoTimestamps(responsesData, durationSec)
      updateData.videoTimestamps = JSON.stringify(videoTimestamps)

      // ── Transcript ──────────────────────────────────────────────────────
      const transcript = buildTranscript(
        existingInterview.candidate.name,
        responsesData,
        existingInterview.language || 'en'
      )
      updateData.transcript = transcript

      // ── AI Feedback (enhanced to include cvScore) ───────────────────────
      try {
        const zai = await ZAI.create()

        const feedbackPrompt = `You are an expert HR interviewer analyzing an AI-conducted interview. Based on the following interview data, generate a comprehensive assessment.

Job Title: ${existingInterview.job.title}
Job Description: ${existingInterview.job.description || 'N/A'}
Job Requirements: ${JSON.stringify(safeJsonParse(existingInterview.job.requirements, []))}
Required Skills: ${JSON.stringify(safeJsonParse(existingInterview.job.skills, []))}
Candidate Name: ${existingInterview.candidate.name}
Candidate Experience: ${existingInterview.candidate.experience || 'N/A'}
Candidate Skills: ${JSON.stringify(safeJsonParse(existingInterview.candidate.skills, []))}
Candidate Education: ${existingInterview.candidate.education || 'N/A'}
CV/Resume Score: ${cvScore}/100
Cheating Signal Risk: ${cheatingResult.riskLevel}

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
  "cvScore": ${cvScore},
  "cheatingRisk": "${cheatingResult.riskLevel}",
  "strengths": [<array of strings>],
  "weaknesses": [<array of strings>],
  "recommendation": "<Strong Hire|Hire|Maybe|No Hire>",
  "summary": "<detailed feedback paragraph>"
}`

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'You are an expert HR interviewer who provides objective, data-driven candidate assessments. Always respond with valid JSON only, no markdown formatting.',
            },
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
          // Ensure cvScore is included even if the AI didn't return it
          if (feedbackData.cvScore === undefined) feedbackData.cvScore = cvScore
          if (feedbackData.cheatingRisk === undefined) feedbackData.cheatingRisk = cheatingResult.riskLevel
        } catch {
          feedbackData = {
            overallScore: 60,
            categoryScores: { technical: 60, communication: 65, problemSolving: 55, cultureFit: 65 },
            cvScore,
            cheatingRisk: cheatingResult.riskLevel,
            strengths: ['Demonstrated relevant experience', 'Clear communication style'],
            weaknesses: ['Could elaborate more on technical details', 'Limited examples of problem-solving'],
            recommendation: 'Maybe',
            summary: aiResponse || 'Assessment could not be parsed. Please review manually.',
          }
        }

        updateData.score =
          typeof feedbackData.overallScore === 'number' ? feedbackData.overallScore : 60
        updateData.feedback = JSON.stringify(feedbackData)
      } catch (aiError) {
        console.error('Error generating AI feedback:', aiError)
        // Fallback feedback if AI fails
        const avgScore =
          responsesData.length > 0
            ? Math.round(
                responsesData.reduce((sum, r) => sum + (r.score || 60), 0) / responsesData.length
              )
            : 60

        updateData.score = avgScore
        updateData.feedback = JSON.stringify({
          overallScore: avgScore,
          categoryScores: {
            technical: avgScore,
            communication: avgScore,
            problemSolving: avgScore,
            cultureFit: avgScore,
          },
          cvScore,
          cheatingRisk: cheatingResult.riskLevel,
          strengths: ['Assessment generated with limited data'],
          weaknesses: [
            'AI feedback generation encountered an issue - manual review recommended',
          ],
          recommendation: 'Maybe',
          summary:
            'Automated assessment completed. Manual review recommended due to processing limitations.',
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
      rubric: safeJsonParse(updatedInterview.rubric, null),
      cheatingSignals: safeJsonParse(updatedInterview.cheatingSignals, null),
      videoTimestamps: safeJsonParse(updatedInterview.videoTimestamps, []),
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
