'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import {
  Briefcase, Clock, Globe, Play, Send, CheckCircle2,
  AlertCircle, Loader2, ChevronRight, Sparkles, Shield,
  ArrowRight, MessageSquare, Timer, RotateCcw
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface InterviewQuestion {
  question: string
  category?: string
  evaluationCriteria?: string
}

interface InterviewResponse {
  questionIndex: number
  question: string
  answer: string
  aiEvaluation?: string
  score?: number
}

interface InterviewData {
  id: string
  candidateId: string
  jobId: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  questions: InterviewQuestion[]
  responses: InterviewResponse[]
  score: number | null
  feedback: string | null
  startedAt: string | null
  completedAt: string | null
  rubric: unknown
  language: string
  interviewLink: string | null
  resumeUrl: string | null
  cheatingSignals: unknown
  cvScore: number | null
  videoTimestamps: unknown[]
  duration: number | null
  createdAt: string
  updatedAt: string
  candidate: {
    id: string
    name: string
    email: string
    phone: string | null
    currentCompany: string | null
    experience: string | null
    skills: string[]
    education: string | null
    status: string
    aiFitScore: number | null
  }
  job: {
    id: string
    title: string
    department: string | null
    description: string | null
    requirements: string[]
    skills: string[]
  }
}

interface APIResponse {
  error?: string
  [key: string]: unknown
}

// ─── Language Map ──────────────────────────────────────────────────────────────

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German',
  pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese (Mandarin)', ja: 'Japanese',
  ko: 'Korean', ru: 'Russian', it: 'Italian', nl: 'Dutch', sv: 'Swedish',
  no: 'Norwegian', da: 'Danish', fi: 'Finnish', pl: 'Polish', tr: 'Turkish',
  th: 'Thai', vi: 'Vietnamese', id: 'Indonesian', ms: 'Malay', tl: 'Tagalog',
  uk: 'Ukrainian', cs: 'Czech', ro: 'Romanian', hu: 'Hungarian', el: 'Greek',
  he: 'Hebrew', bg: 'Bulgarian', hr: 'Croatian', sk: 'Slovak', sl: 'Slovenian',
  sr: 'Serbian', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', mr: 'Marathi',
  gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi', ur: 'Urdu',
  fa: 'Persian (Farsi)', sw: 'Swahili', am: 'Amharic', zu: 'Zulu', af: 'Afrikaans',
  ca: 'Catalan', eu: 'Basque', gl: 'Galician', is: 'Icelandic', lv: 'Latvian',
  lt: 'Lithuanian', et: 'Estonian', mt: 'Maltese', ga: 'Irish', cy: 'Welsh',
  gd: 'Scottish Gaelic', ne: 'Nepali', si: 'Sinhala', my: 'Burmese',
  km: 'Khmer', lo: 'Lao', ka: 'Georgian', hy: 'Armenian', az: 'Azerbaijani',
  uz: 'Uzbek', kk: 'Kazakh', mn: 'Mongolian',
}

function getLanguageLabel(code: string): string {
  return LANGUAGE_MAP[code] || code.toUpperCase()
}

// ─── Category Badge Colors ─────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  technical: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  behavioral: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  problem_solving: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  culture_fit: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  follow_up: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
}

function getCategoryStyle(category?: string) {
  if (!category) return CATEGORY_COLORS.technical
  const key = category.toLowerCase().replace(/\s+/g, '_')
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.technical
}

function formatCategoryLabel(category?: string): string {
  if (!category) return 'Question'
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Timer Hook ────────────────────────────────────────────────────────────────

function useElapsedTime(startTime: string | null, isRunning: boolean) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime || !isRunning) return

    const startMs = new Date(startTime).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000))

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startTime, isRunning])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return {
    elapsed,
    display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    minutes,
    seconds,
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────

type PageView = 'loading' | 'error' | 'welcome' | 'interview' | 'completed' | 'already-completed' | 'cancelled'

export default function InterviewPage() {
  const params = useParams()
  const interviewId = params.id as string

  // ─── State ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<PageView>('loading')
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [error, setError] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)
  const [completingInterview, setCompletingInterview] = useState(false)
  const [followUpAnimating, setFollowUpAnimating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const timer = useElapsedTime(
    interview?.startedAt || null,
    interview?.status === 'in_progress'
  )

  // ─── Fetch Interview ────────────────────────────────────────────────────
  const fetchInterview = useCallback(async () => {
    try {
      const res = await fetch(`/api/ai-interview/${interviewId}`)
      if (!res.ok) {
        const data: APIResponse = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Interview not found')
      }
      const data: InterviewData = await res.json()
      setInterview(data)

      if (data.status === 'completed') {
        setView('already-completed')
      } else if (data.status === 'cancelled') {
        setView('cancelled')
      } else if (data.status === 'in_progress') {
        // Resume from where they left off
        const answeredCount = data.responses?.length || 0
        setCurrentQuestionIndex(answeredCount)
        setView('interview')
      } else {
        setView('welcome')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview')
      setView('error')
    }
  }, [interviewId])

  useEffect(() => {
    fetchInterview()
  }, [fetchInterview])

  // Auto-focus textarea when entering interview view or question changes
  useEffect(() => {
    if (view === 'interview' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [view, currentQuestionIndex])

  // ─── Start Interview ────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!interview) return
    setStartingInterview(true)
    setError('')

    try {
      const res = await fetch(`/api/ai-interview/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })

      if (!res.ok) {
        const data: APIResponse = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to start interview')
      }

      const updated: InterviewData = await res.json()
      setInterview(updated)
      setCurrentQuestionIndex(0)
      setView('interview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview')
    } finally {
      setStartingInterview(false)
    }
  }

  // ─── Submit Answer ──────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (!interview || !answer.trim()) return
    setSubmitting(true)
    setError('')

    const currentQuestion = interview.questions[currentQuestionIndex]
    if (!currentQuestion) {
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch(`/api/ai-interview/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_response',
          response: {
            questionIndex: currentQuestionIndex,
            question: currentQuestion.question,
            answer: answer.trim(),
          },
        }),
      })

      if (!res.ok) {
        const data: APIResponse = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit answer')
      }

      const updated: InterviewData = await res.json()
      setInterview(updated)
      setAnswer('')

      // Check if there are more questions (including any new follow-up)
      const nextIndex = currentQuestionIndex + 1
      if (nextIndex < updated.questions.length) {
        // Animate transition if a follow-up was added
        if (updated.questions.length > interview.questions.length) {
          setFollowUpAnimating(true)
          setTimeout(() => setFollowUpAnimating(false), 600)
        }
        setCurrentQuestionIndex(nextIndex)
      } else {
        // All questions answered — complete the interview
        await handleComplete(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Complete Interview ─────────────────────────────────────────────────
  const handleComplete = async (currentInterview?: InterviewData) => {
    const interviewToComplete = currentInterview || interview
    if (!interviewToComplete) return
    setCompletingInterview(true)
    setError('')

    try {
      const res = await fetch(`/api/ai-interview/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      if (!res.ok) {
        const data: APIResponse = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to complete interview')
      }

      const updated: InterviewData = await res.json()
      setInterview(updated)
      setView('completed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete interview')
    } finally {
      setCompletingInterview(false)
    }
  }

  // ─── Computed Values ────────────────────────────────────────────────────
  const currentQuestion = interview?.questions?.[currentQuestionIndex]
  const totalQuestions = interview?.questions?.length || 0
  const answeredCount = interview?.responses?.length || 0
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  // ─── Render: Loading ────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Loading interview...</p>
        </div>
      </div>
    )
  }

  // ─── Render: Error ──────────────────────────────────────────────────────
  if (view === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mb-6 mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => { setError(''); setView('loading'); fetchInterview() }}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ─── Render: Already Completed ──────────────────────────────────────────
  if (view === 'already-completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Already Completed</h2>
          <p className="text-slate-400 text-sm mb-2 leading-relaxed">
            You have already completed this interview. Thank you for your participation!
          </p>
          {interview?.job?.title && (
            <p className="text-emerald-400/80 text-xs font-medium">
              Position: {interview.job.title}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ─── Render: Cancelled ──────────────────────────────────────────────────
  if (view === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6 mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Cancelled</h2>
          <p className="text-slate-400 text-sm mb-2 leading-relaxed">
            This interview has been cancelled. Please contact the recruiter for more information.
          </p>
          {interview?.job?.title && (
            <p className="text-amber-400/80 text-xs font-medium">
              Position: {interview.job.title}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ─── Render: Welcome ────────────────────────────────────────────────────
  if (view === 'welcome' && interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-lg">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 sm:p-8 pb-0 sm:pb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI Interview</h1>
                  <p className="text-emerald-400/80 text-[10px] font-medium uppercase tracking-[0.2em]">
                    eh2r AI — Powered by MARQ AI
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-5">
              {/* Job Info Card */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/15 p-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Position</p>
                    <p className="text-sm font-semibold text-white">{interview.job.title}</p>
                  </div>
                </div>

                {interview.job.department && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/15 p-2">
                      <Shield className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Department</p>
                      <p className="text-sm font-semibold text-white">{interview.job.department}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-cyan-500/15 p-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Language</p>
                    <p className="text-sm font-semibold text-white">{getLanguageLabel(interview.language)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/15 p-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Questions</p>
                    <p className="text-sm font-semibold text-white">
                      {totalQuestions > 0 ? `${totalQuestions} questions` : 'Questions will be generated'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Instructions</p>
                <ul className="space-y-2">
                  {[
                    'Answer each question thoughtfully and in detail',
                    'The AI may ask follow-up questions based on your answers',
                    'Take your time — quality matters more than speed',
                    'You cannot go back to previous questions',
                    'The interview will be evaluated by AI after completion',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                      <ChevronRight className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Candidate info */}
              <div className="text-center">
                <p className="text-slate-400 text-xs">
                  Welcome, <span className="text-white font-medium">{interview.candidate.name}</span>
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={handleStart}
                disabled={startingInterview || totalQuestions === 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2.5 text-sm shadow-lg shadow-emerald-500/20"
              >
                {startingInterview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Interview
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {totalQuestions === 0 && (
                <p className="text-amber-400/80 text-xs text-center">
                  Questions are being prepared. Please wait or contact the recruiter.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Completed ──────────────────────────────────────────────────
  if (view === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="w-full max-w-md">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6 mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Thank you, {interview?.candidate?.name || 'Candidate'}! Your interview for the{' '}
              <span className="text-emerald-400 font-medium">{interview?.job?.title}</span> position
              has been submitted successfully.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Questions Answered</p>
                <p className="text-xl font-bold text-white">{interview?.responses?.length || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                <p className="text-xl font-bold text-white">
                  {timer.minutes > 0 ? `${timer.minutes}m ${timer.seconds}s` : `${timer.seconds}s`}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-left">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">What Happens Next?</p>
              <ul className="space-y-1.5">
                {[
                  'Your responses will be evaluated by our AI',
                  'The hiring team will review your assessment',
                  'You\'ll receive an update on your application status',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                    <ChevronRight className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-slate-500 text-[10px]">
              Powered by eh2r AI — An AI Product of MARQ AI
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render: Interview (Questions) ──────────────────────────────────────
  if (view === 'interview' && interview && currentQuestion) {
    const catStyle = getCategoryStyle(currentQuestion.category)

    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        {/* ─── Top Bar ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0f172a]/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-white font-semibold text-sm hidden sm:inline">AI Interview</span>
              </div>

              {/* Progress */}
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <Timer className="w-3.5 h-3.5" />
                <span className="text-xs font-mono tabular-nums">{timer.display}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Question Area ───────────────────────────────────────────── */}
        <div className="flex-1 flex items-start justify-center p-4 sm:p-6 pt-6 sm:pt-8">
          <div className="w-full max-w-2xl">
            {/* Question Card */}
            <div
              className={`rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 ${
                followUpAnimating ? 'scale-[1.02] border-emerald-500/30' : 'scale-100'
              }`}
            >
              <div className="p-5 sm:p-8">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                    {currentQuestion.category === 'follow_up' && <Sparkles className="w-3 h-3" />}
                    {formatCategoryLabel(currentQuestion.category)}
                  </span>
                  {currentQuestion.category === 'follow_up' && (
                    <span className="text-[10px] text-rose-400/70">AI-generated follow-up</span>
                  )}
                </div>

                {/* Question Number */}
                <p className="text-slate-500 text-xs mb-2">
                  Question {currentQuestionIndex + 1}
                </p>

                {/* Question Text */}
                <h2 className="text-lg sm:text-xl font-semibold text-white leading-relaxed mb-6">
                  {currentQuestion.question}
                </h2>

                {/* Evaluation Hint */}
                {currentQuestion.evaluationCriteria && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-6">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">What we&apos;re looking for</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{currentQuestion.evaluationCriteria}</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Answer Textarea */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-300">
                    Your Answer
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here... Be detailed and specific."
                    rows={6}
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-600">
                      {answer.length > 0 ? `${answer.length} characters` : 'Take your time to provide a thoughtful answer'}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {answeredCount} of {totalQuestions} answered
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Bar */}
              <div className="px-5 sm:px-8 pb-5 sm:pb-8">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answer.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2.5 text-sm shadow-lg shadow-emerald-500/20 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting & Generating Next Question...
                    </>
                  ) : completingInterview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Completing Interview...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Answer
                      {currentQuestionIndex + 1 < totalQuestions ? (
                        <span className="text-emerald-200/60 text-xs ml-1">
                          → Next Question
                        </span>
                      ) : (
                        <span className="text-emerald-200/60 text-xs ml-1">
                          → Finish
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
              {interview.questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < answeredCount
                      ? 'bg-emerald-400 scale-100'
                      : i === currentQuestionIndex
                      ? 'bg-emerald-400/50 scale-125 ring-2 ring-emerald-400/30'
                      : 'bg-white/10 scale-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return null
}
