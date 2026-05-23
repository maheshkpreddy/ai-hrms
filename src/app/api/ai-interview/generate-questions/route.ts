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

// POST /api/ai-interview/generate-questions - Generate interview questions using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { interviewId, jobTitle, jobDescription, requirements, skills } = body

    // If interviewId provided, fetch job details from database
    let jobData = {
      title: jobTitle || '',
      description: jobDescription || '',
      requirements: requirements || [],
      skills: skills || [],
    }

    if (interviewId) {
      const interview = await db.aIInterview.findUnique({
        where: { id: interviewId },
        include: {
          job: {
            select: {
              title: true,
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

      jobData = {
        title: interview.job.title,
        description: interview.job.description || '',
        requirements: safeJsonParse(interview.job.requirements, []),
        skills: safeJsonParse(interview.job.skills, []),
      }
    }

    if (!jobData.title) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }

    // Generate questions using AI
    const zai = await ZAI.create()

    const questionPrompt = `You are an expert HR interviewer preparing questions for a candidate interview. Generate 8-10 interview questions based on the following job details:

Job Title: ${jobData.title}
Job Description: ${jobData.description || 'Not provided'}
Requirements: ${JSON.stringify(jobData.requirements)}
Required Skills: ${JSON.stringify(jobData.skills)}

Generate a mix of question types:
- 2-3 Technical questions (specific to the role and skills)
- 2-3 Behavioral/Situational questions (how they handle real scenarios)
- 1-2 Problem-solving questions (analytical thinking)
- 1-2 Culture fit questions (teamwork, values, communication)

For each question, provide:
1. The question text
2. A category (technical, behavioral, problem_solving, culture_fit)
3. What to look for in the answer (evaluation criteria)

Respond ONLY with valid JSON in this format (no markdown, no code blocks):
{
  "questions": [
    {
      "question": "the question text",
      "category": "technical|behavioral|problem_solving|culture_fit",
      "evaluationCriteria": "what to look for in the answer"
    }
  ]
}`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert HR interviewer who creates targeted, insightful interview questions. Always respond with valid JSON only, no markdown formatting or code blocks.' },
        { role: 'user', content: questionPrompt },
      ],
    })

    const aiResponse = completion.choices?.[0]?.message?.content || ''
    let questionsData: Array<{ question: string; category: string; evaluationCriteria: string }>

    try {
      // Clean up potential markdown code blocks
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      questionsData = parsed.questions || parsed
    } catch {
      // Fallback questions if AI parsing fails
      questionsData = [
        { question: `Describe your experience with ${jobData.skills?.[0] || 'your core technical skill'} and how you've applied it in production.`, category: 'technical', evaluationCriteria: 'Depth of technical knowledge, real-world application examples' },
        { question: `Walk me through a challenging project related to ${jobData.title} and the outcomes you achieved.`, category: 'behavioral', evaluationCriteria: 'Problem-solving approach, ownership, measurable outcomes' },
        { question: `How do you approach learning new technologies or skills required for this ${jobData.title} role?`, category: 'problem_solving', evaluationCriteria: 'Learning agility, growth mindset, self-directed learning' },
        { question: 'Tell me about a time when you had to collaborate with a difficult team member. How did you handle it?', category: 'culture_fit', evaluationCriteria: 'Conflict resolution, empathy, professionalism' },
        { question: `What's your approach to debugging a complex issue in a ${jobData.skills?.[1] || 'technical'} system?`, category: 'technical', evaluationCriteria: 'Systematic debugging approach, root cause analysis' },
        { question: 'Describe a situation where you had to make a decision with incomplete information.', category: 'behavioral', evaluationCriteria: 'Decision-making framework, risk assessment, judgment' },
        { question: `How would you design a solution for scaling ${jobData.title.toLowerCase().includes('engineer') ? 'a high-traffic application' : 'a critical business process'}?`, category: 'problem_solving', evaluationCriteria: 'Architecture thinking, scalability considerations, trade-off analysis' },
        { question: 'What motivates you in your work and how do you align with team goals?', category: 'culture_fit', evaluationCriteria: 'Intrinsic motivation, team orientation, goal alignment' },
      ]
    }

    // If interviewId provided, update the interview with generated questions
    if (interviewId) {
      await db.aIInterview.update({
        where: { id: interviewId },
        data: {
          questions: JSON.stringify(questionsData),
        },
      })
    }

    return NextResponse.json({
      questions: questionsData,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating interview questions:', error)
    return NextResponse.json({ error: 'Failed to generate interview questions' }, { status: 500 })
  }
}
