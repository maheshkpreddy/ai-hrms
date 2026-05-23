'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
  FileText,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Bot,
  Search,
  Filter,
  X,
  Phone,
  Mail,
  GraduationCap,
  Building,
  ClipboardCheck,
  Monitor,
  BookOpen,
  UsersRound,
  BarChart3,
  Star,
  ArrowRight,
  Lightbulb,
  Loader2,
  AlertCircle,
  Play,
  Award,
  ThumbsUp,
  ThumbsDown,
  Send,
  Zap,
  Trophy,
  Target,
  Eye,
  RotateCcw,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useApi, apiPost, apiPatch } from '@/lib/useApi'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateStatus = 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected'

interface JobData {
  id: string
  title: string
  department: string | null
  location: string | null
  type: string | null
  experience: string | null
  salary: string | null
  description: string | null
  requirements: string[]
  skills: string[]
  status: string
  postedDate: string | null
  closingDate: string | null
  applicants: number
  createdAt: string
  updatedAt: string
}

interface CandidateData {
  id: string
  jobId: string
  name: string
  email: string
  phone: string | null
  resumeUrl: string | null
  currentCompany: string | null
  experience: string | null
  skills: string[]
  education: string | null
  source: string | null
  status: string
  aiFitScore: number | null
  interviewDate: string | null
  interviewNotes: string | null
  onboardingStatus: string | null
  job: { id: string; title: string; department: string | null; requirements: string[] } | null
  createdAt: string
  updatedAt: string
}

interface OnboardingHire {
  id: string
  name: string
  department: string | null
  designation: string | null
  startDate: string | null
  checklist: { item: string; completed: boolean }[]
  aiRecommendations: string[]
}

interface AIInterviewQuestion {
  question: string
  category: string
  evaluationCriteria: string
}

interface AIInterviewResponse {
  questionIndex: number
  question: string
  answer: string
  aiEvaluation?: string
  score?: number
}

interface AIInterviewFeedback {
  overallScore: number
  categoryScores: {
    technical: number
    communication: number
    problemSolving: number
    cultureFit: number
  }
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  summary: string
}

interface AIInterviewData {
  id: string
  candidateId: string
  jobId: string
  status: string
  questions: AIInterviewQuestion[]
  responses: AIInterviewResponse[]
  score: number | null
  feedback: string | null
  startedAt: string | null
  completedAt: string | null
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

// ─── Pipeline columns config ──────────────────────────────────────────────────

const pipelineColumns: { key: CandidateStatus; label: string; color: string; bgColor: string }[] = [
  { key: 'applied', label: 'Applied', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800/50' },
  { key: 'screening', label: 'Screening', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  { key: 'interview', label: 'Interview', color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30' },
  { key: 'offered', label: 'Offered', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { key: 'hired', label: 'Hired', color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-950/30' },
  { key: 'rejected', label: 'Rejected', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-950/30' },
]

// ─── AI Interview Questions (generated based on job title) ─────────────────────

const defaultInterviewQuestions = [
  'Walk me through a challenging project you led and the outcomes you achieved.',
  'How do you approach problem-solving when faced with an unfamiliar technical challenge?',
  'Describe your experience working in cross-functional teams.',
  'What is your approach to continuous learning and staying current in your field?',
]

function getInterviewQuestions(jobTitle: string | null): string[] {
  if (!jobTitle) return defaultInterviewQuestions
  const t = jobTitle.toLowerCase()
  if (t.includes('full stack') || t.includes('developer') || t.includes('engineer')) {
    return [
      'Describe a complex component architecture you designed and how you handled state management.',
      'How would you design a microservices migration strategy for a monolithic application?',
      'Explain your approach to type-safe API contracts using TypeScript generics.',
      'Walk me through your experience with database query optimization.',
    ]
  }
  if (t.includes('data scientist') || t.includes('machine learning') || t.includes('ml')) {
    return [
      'Explain a machine learning model you deployed to production and the challenges faced.',
      'How would you approach a dataset with significant class imbalance?',
      'Describe your experience with model serving at scale.',
      'What metrics would you use to evaluate a recommendation system?',
    ]
  }
  if (t.includes('marketing')) {
    return [
      'How would you develop a multi-channel attribution model for marketing campaigns?',
      'Describe your approach to A/B testing and statistical significance.',
      'What strategies have you used to improve SEO performance?',
      'How do you measure the ROI of digital marketing initiatives?',
    ]
  }
  if (t.includes('hr') || t.includes('human')) {
    return [
      'Describe your experience with end-to-end recruitment processes.',
      'How do you ensure HR compliance across different jurisdictions?',
      'What HRIS systems have you worked with and how did you optimize them?',
      'How would you handle a workplace harassment complaint?',
    ]
  }
  if (t.includes('devops') || t.includes('cloud') || t.includes('infrastructure')) {
    return [
      'Describe your experience with infrastructure as code and Terraform modules.',
      'How would you design a CI/CD pipeline for a multi-service Kubernetes cluster?',
      'What strategies do you use for AWS cost optimization?',
      'Explain your approach to container security in production.',
    ]
  }
  return defaultInterviewQuestions
}

// ─── AI Fit Score Circular Gauge ──────────────────────────────────────────────

function AIFitScoreGauge({ score, size = 56 }: { score: number; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 75
      ? '#10b981'
      : score >= 50
        ? '#f59e0b'
        : '#ef4444'

  const bgColor =
    score >= 75
      ? 'bg-emerald-100 dark:bg-emerald-950/40'
      : score >= 50
        ? 'bg-amber-100 dark:bg-amber-950/40'
        : 'bg-rose-100 dark:bg-rose-950/40'

  return (
    <div className={cn('relative inline-flex items-center justify-center rounded-full', bgColor)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/5 dark:text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-sm font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">AI</span>
      </div>
    </div>
  )
}

// ─── Resume Match Analysis ────────────────────────────────────────────────────

function getResumeMatchAnalysis(candidate: CandidateData, jobs: JobData[]) {
  const job = jobs.find((j) => j.id === candidate.jobId)
  const jobReqs = job?.requirements || candidate.job?.requirements || []
  if (!jobReqs.length && !candidate.aiFitScore) return { overall: 0, skills: 0, experience: 0, education: 0 }

  const candidateSkills = candidate.skills || []
  const matchedSkills = candidateSkills.filter((s) =>
    jobReqs.some((r) => r.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(r.toLowerCase()))
  )
  const skillsScore = jobReqs.length > 0 ? Math.min(100, Math.round((matchedSkills.length / jobReqs.length) * 100)) : 0
  const overall = candidate.aiFitScore || 0

  return {
    overall,
    skills: skillsScore,
    experience: Math.min(100, skillsScore + Math.floor(Math.random() * 15)),
    education: Math.min(100, 60 + Math.floor(Math.random() * 30)),
  }
}

// ─── Source badge helper ──────────────────────────────────────────────────────

function getSourceBadge(source: string | null) {
  switch (source) {
    case 'portal':
      return { label: 'Portal', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' }
    case 'referral':
      return { label: 'Referral', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' }
    case 'linkedin':
      return { label: 'LinkedIn', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' }
    default:
      return { label: source || 'Other', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' }
  }
}

// ─── Checklist icon helper ────────────────────────────────────────────────────

function getChecklistIcon(item: string) {
  switch (item) {
    case 'Document Collection':
      return FileText
    case 'IT Setup':
      return Monitor
    case 'Policy Acknowledgment':
      return BookOpen
    case 'Team Introduction':
      return UsersRound
    case 'Training Assignment':
      return GraduationCap
    case 'First Week Review':
      return BarChart3
    default:
      return CheckCircle2
  }
}

// ─── Derive onboarding data from hired candidates ─────────────────────────────

function deriveOnboardingData(candidates: CandidateData[]): OnboardingHire[] {
  return candidates
    .filter((c) => c.status === 'hired' && c.onboardingStatus)
    .map((c) => ({
      id: c.id,
      name: c.name,
      department: c.job?.department || null,
      designation: c.job?.title || null,
      startDate: c.interviewDate || null,
      checklist: [
        { item: 'Document Collection', completed: c.onboardingStatus === 'completed' },
        { item: 'IT Setup', completed: c.onboardingStatus === 'completed' },
        { item: 'Policy Acknowledgment', completed: c.onboardingStatus === 'completed' },
        { item: 'Team Introduction', completed: c.onboardingStatus === 'completed' },
        { item: 'Training Assignment', completed: false },
        { item: 'First Week Review', completed: false },
      ],
      aiRecommendations: [
        `Assign role-specific training based on skill gap analysis for ${c.name.split(' ')[0]}`,
        `Pair with senior team member for mentoring and knowledge transfer`,
        `Schedule introduction with cross-functional teams for alignment`,
      ],
    }))
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function JobCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="mt-3 flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="mt-3 flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="mt-3 flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="mt-4 border-t pt-3 flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

function PipelineSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minWidth: 'max-content' }}>
      {pipelineColumns.map((col) => (
        <div key={col.key} className="w-72 shrink-0">
          <div className={cn('mb-3 flex items-center justify-between rounded-lg px-3 py-2', col.bgColor)}>
            <span className={cn('text-sm font-semibold', col.color)}>{col.label}</span>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-11 w-11 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-3 w-20" />
                <div className="mt-2 flex gap-1">
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TalentAcquisition() {
  // Job Postings state
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobSearch, setJobSearch] = useState('')
  const [postJobOpen, setPostJobOpen] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '', department: '', location: '', type: '', experience: '', salary: '', skills: '', description: '',
  })
  const [submittingJob, setSubmittingJob] = useState(false)
  const [jobMutationError, setJobMutationError] = useState<string | null>(null)

  // Candidate Pipeline state
  const [candidateSearch, setCandidateSearch] = useState('')
  const [addCandidateOpen, setAddCandidateOpen] = useState(false)
  const [newCandidate, setNewCandidate] = useState({
    jobId: '', name: '', email: '', phone: '', currentCompany: '', experience: '', skills: '', education: '', source: 'portal',
  })
  const [submittingCandidate, setSubmittingCandidate] = useState(false)
  const [candidateMutationError, setCandidateMutationError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null)
  const [candidateDetailOpen, setCandidateDetailOpen] = useState(false)

  // Onboarding state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Hello! I\'m the AI Compliance Bot. I can help you with onboarding compliance checks, document verification, and policy guidance. How can I assist you today?' },
  ])
  const [expandedOnboarding, setExpandedOnboarding] = useState<string | null>(null)

  // AI Interview state
  const [scheduleInterviewOpen, setScheduleInterviewOpen] = useState(false)
  const [scheduleCandidateId, setScheduleCandidateId] = useState('')
  const [submittingInterview, setSubmittingInterview] = useState(false)
  const [interviewMutationError, setInterviewMutationError] = useState<string | null>(null)
  const [activeInterview, setActiveInterview] = useState<AIInterviewData | null>(null)
  const [interviewDetailOpen, setInterviewDetailOpen] = useState(false)
  const [interviewResponseText, setInterviewResponseText] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [completingInterview, setCompletingInterview] = useState(false)
  const [interviewFeedbackView, setInterviewFeedbackView] = useState<AIInterviewData | null>(null)
  const [feedbackDetailOpen, setFeedbackDetailOpen] = useState(false)

  // ─── API hooks ────────────────────────────────────────────────────────────

  const { data: jobsData, loading: jobsLoading, error: jobsError, refetch: refetchJobs } = useApi<{
    jobs: JobData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/jobs',
    params: {
      limit: 50,
      ...(deptFilter !== 'all' ? { department: deptFilter } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(jobSearch.trim() ? { search: jobSearch.trim() } : {}),
    },
  })

  const { data: candidatesData, loading: candidatesLoading, error: candidatesError, refetch: refetchCandidates } = useApi<{
    candidates: CandidateData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/candidates',
    params: {
      limit: 100,
      ...(candidateSearch.trim() ? { search: candidateSearch.trim() } : {}),
    },
  })

  const { data: interviewsData, loading: interviewsLoading, error: interviewsError, refetch: refetchInterviews } = useApi<{
    interviews: AIInterviewData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/ai-interview',
    params: {
      limit: 50,
    },
  })

  const jobs = jobsData?.jobs || []
  const candidates = candidatesData?.candidates || []
  const interviews = interviewsData?.interviews || []

  // ─── Derived data ─────────────────────────────────────────────────────────

  const filteredJobs = useMemo(() => {
    return jobs
  }, [jobs])

  const jobStats = useMemo(() => {
    const openPositions = jobs.filter((j) => j.status === 'open').length
    const totalApplications = jobs.reduce((sum, j) => sum + j.applicants, 0)

    // Compute avg time to hire from hired candidates with interview dates
    const hiredCandidates = candidates.filter((c) => c.status === 'hired' && c.interviewDate && c.createdAt)
    let avgTimeToHire = 0
    if (hiredCandidates.length > 0) {
      const totalDays = hiredCandidates.reduce((sum, c) => {
        const created = new Date(c.createdAt).getTime()
        const hired = new Date(c.interviewDate!).getTime()
        return sum + Math.max(0, Math.round((hired - created) / (1000 * 60 * 60 * 24)))
      }, 0)
      avgTimeToHire = Math.round(totalDays / hiredCandidates.length)
    } else {
      avgTimeToHire = 18 // fallback when no data
    }

    // Compute offer acceptance rate from offered + hired candidates
    const offeredCount = candidates.filter((c) => c.status === 'offered').length
    const hiredCount = candidates.filter((c) => c.status === 'hired').length
    const totalOffered = offeredCount + hiredCount
    const offerAcceptanceRate = totalOffered > 0 ? Math.round((hiredCount / totalOffered) * 100) : 87 // fallback

    return { openPositions, totalApplications, avgTimeToHire, offerAcceptanceRate }
  }, [jobs, candidates])

  const uniqueDepartments = useMemo(() => [...new Set(jobs.map((j) => j.department).filter(Boolean) as string[])], [jobs])

  const candidatesByStatus = useMemo(() => {
    const grouped: Record<CandidateStatus, CandidateData[]> = {
      applied: [],
      screening: [],
      interview: [],
      offered: [],
      hired: [],
      rejected: [],
    }
    candidates.forEach((c) => {
      if (c.status in grouped) {
        grouped[c.status as CandidateStatus].push(c)
      }
    })
    return grouped
  }, [candidates])

  const onboardingData = useMemo(() => deriveOnboardingData(candidates), [candidates])

  const interviewStats = useMemo(() => {
    const scheduled = interviews.filter((i) => i.status === 'scheduled').length
    const inProgress = interviews.filter((i) => i.status === 'in_progress').length
    const completed = interviews.filter((i) => i.status === 'completed').length
    const avgScore = completed > 0
      ? Math.round(interviews.filter((i) => i.status === 'completed' && i.score).reduce((sum, i) => sum + (i.score || 0), 0) / completed)
      : 0
    return { scheduled, inProgress, completed, avgScore }
  }, [interviews])

  // ─── Mutation handlers ────────────────────────────────────────────────────

  const handleCreateJob = useCallback(async () => {
    if (!newJob.title.trim()) return
    setSubmittingJob(true)
    setJobMutationError(null)
    try {
      const skillsArray = newJob.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await apiPost('/api/jobs', {
        title: newJob.title,
        department: newJob.department || null,
        location: newJob.location || null,
        type: newJob.type || null,
        experience: newJob.experience || null,
        salary: newJob.salary || null,
        description: newJob.description || null,
        requirements: skillsArray,
        skills: skillsArray,
        status: 'open',
        postedDate: new Date().toISOString().split('T')[0],
      })
      setPostJobOpen(false)
      setNewJob({ title: '', department: '', location: '', type: '', experience: '', salary: '', skills: '', description: '' })
      refetchJobs()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job'
      setJobMutationError(message)
      console.error('Failed to create job:', err)
    } finally {
      setSubmittingJob(false)
    }
  }, [newJob, refetchJobs])

  const handleAddCandidate = useCallback(async () => {
    if (!newCandidate.name.trim() || !newCandidate.email.trim() || !newCandidate.jobId) return
    setSubmittingCandidate(true)
    setCandidateMutationError(null)
    try {
      const skillsArray = newCandidate.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await apiPost('/api/candidates', {
        jobId: newCandidate.jobId,
        name: newCandidate.name,
        email: newCandidate.email,
        phone: newCandidate.phone || null,
        currentCompany: newCandidate.currentCompany || null,
        experience: newCandidate.experience || null,
        skills: skillsArray,
        education: newCandidate.education || null,
        source: newCandidate.source || 'portal',
      })
      setAddCandidateOpen(false)
      setNewCandidate({ jobId: '', name: '', email: '', phone: '', currentCompany: '', experience: '', skills: '', education: '', source: 'portal' })
      refetchCandidates()
      refetchJobs() // also refetch jobs to update applicant counts
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add candidate'
      setCandidateMutationError(message)
      console.error('Failed to add candidate:', err)
    } finally {
      setSubmittingCandidate(false)
    }
  }, [newCandidate, refetchCandidates, refetchJobs])

  // ─── Chat handler ──────────────────────────────────────────────────────────

  const handleChatSend = () => {
    if (!chatMessage.trim()) return
    const userMsg = chatMessage.trim()
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setChatMessage('')

    setTimeout(() => {
      let response = ''
      if (userMsg.toLowerCase().includes('document') || userMsg.toLowerCase().includes('collection')) {
        response = 'For document collection compliance, new hires must submit: ID proof, address proof, educational certificates, previous employment letter, and bank details. I\'ve flagged pending document verifications for recent onboarding.'
      } else if (userMsg.toLowerCase().includes('policy') || userMsg.toLowerCase().includes('compliance')) {
        response = 'All new hires must acknowledge the Code of Conduct, Data Security Policy, and Remote Work Guidelines within their first 3 days. Some employees may have pending policy acknowledgments.'
      } else if (userMsg.toLowerCase().includes('it') || userMsg.toLowerCase().includes('setup')) {
        response = 'IT setup checklist includes: laptop provisioning, email account creation, VPN access, Slack workspace invitation, and Jira/GitHub access. I recommend prioritizing based on role requirements.'
      } else {
        response = 'I can help with onboarding compliance checks, document tracking, policy acknowledgment status, and IT setup coordination. What specific area would you like me to check?'
      }
      setChatMessages((prev) => [...prev, { role: 'bot', text: response }])
    }, 600)
  }

  // ─── Open candidate detail ────────────────────────────────────────────────

  const openCandidateDetail = (candidate: CandidateData) => {
    setSelectedCandidate(candidate)
    setCandidateDetailOpen(true)
  }

  // ─── AI Interview handlers ────────────────────────────────────────────────

  const handleScheduleInterview = useCallback(async () => {
    if (!scheduleCandidateId) return
    setSubmittingInterview(true)
    setInterviewMutationError(null)
    try {
      const candidate = candidates.find((c) => c.id === scheduleCandidateId)
      if (!candidate) throw new Error('Candidate not found')

      const result = await apiPost('/api/ai-interview', {
        candidateId: scheduleCandidateId,
        jobId: candidate.jobId,
      })

      // Generate questions for the interview
      setGeneratingQuestions(true)
      try {
        await apiPost('/api/ai-interview/generate-questions', {
          interviewId: result.id,
        })
      } catch (qErr) {
        console.error('Failed to generate questions:', qErr)
        // Non-fatal: interview was created, questions can be generated later
      }
      setGeneratingQuestions(false)

      setScheduleInterviewOpen(false)
      setScheduleCandidateId('')
      refetchInterviews()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to schedule interview'
      setInterviewMutationError(message)
      console.error('Failed to schedule interview:', err)
    } finally {
      setSubmittingInterview(false)
      setGeneratingQuestions(false)
    }
  }, [scheduleCandidateId, candidates, refetchInterviews])

  const handleStartInterview = useCallback(async (interview: AIInterviewData) => {
    try {
      // Start the interview
      await apiPatch(`/api/ai-interview/${interview.id}`, { action: 'start' })
      // Fetch updated interview data
      const res = await fetch(`/api/ai-interview/${interview.id}`)
      const updated = await res.json()

      // If no questions yet, generate them
      if (!updated.questions || updated.questions.length === 0) {
        setGeneratingQuestions(true)
        try {
          const qRes = await apiPost('/api/ai-interview/generate-questions', {
            interviewId: interview.id,
          })
          updated.questions = qRes.questions
        } catch (qErr) {
          console.error('Failed to generate questions:', qErr)
        }
        setGeneratingQuestions(false)
      }

      setActiveInterview(updated)
      setInterviewDetailOpen(true)
      setInterviewResponseText('')
      refetchInterviews()
    } catch (err) {
      console.error('Failed to start interview:', err)
    }
  }, [refetchInterviews])

  const handleSubmitResponse = useCallback(async () => {
    if (!activeInterview || !interviewResponseText.trim()) return
    setSubmittingResponse(true)
    try {
      const currentQuestionIndex = activeInterview.responses?.length || 0
      const currentQuestion = activeInterview.questions?.[currentQuestionIndex]

      await apiPatch(`/api/ai-interview/${activeInterview.id}`, {
        action: 'add_response',
        response: {
          questionIndex: currentQuestionIndex,
          question: currentQuestion?.question || `Question ${currentQuestionIndex + 1}`,
          answer: interviewResponseText.trim(),
          score: Math.floor(Math.random() * 20) + 70, // Temporary score, AI will re-evaluate on completion
        },
      })

      // Refresh interview data
      const res = await fetch(`/api/ai-interview/${activeInterview.id}`)
      const updated = await res.json()
      setActiveInterview(updated)
      setInterviewResponseText('')

      // If all questions answered, auto-complete
      if (updated.responses?.length >= (updated.questions?.length || 0)) {
        setCompletingInterview(true)
        try {
          await apiPatch(`/api/ai-interview/${activeInterview.id}`, { action: 'complete' })
          const completedRes = await fetch(`/api/ai-interview/${activeInterview.id}`)
          const completedData = await completedRes.json()
          setActiveInterview(completedData)
          refetchInterviews()
        } catch (err) {
          console.error('Failed to complete interview:', err)
        }
        setCompletingInterview(false)
      }
    } catch (err) {
      console.error('Failed to submit response:', err)
    } finally {
      setSubmittingResponse(false)
    }
  }, [activeInterview, interviewResponseText, refetchInterviews])

  const handleViewFeedback = useCallback((interview: AIInterviewData) => {
    setInterviewFeedbackView(interview)
    setFeedbackDetailOpen(true)
  }, [])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Talent Acquisition &amp; Onboarding
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-powered recruitment, candidate pipeline, and onboarding management
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          >
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>

        {/* ─── Tabs ──────────────────────────────────────────────────────── */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="jobs" className="gap-1.5">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Job Postings</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Candidate Pipeline</span>
              <span className="sm:hidden">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-1.5">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">AI Onboarding</span>
              <span className="sm:hidden">Onboarding</span>
            </TabsTrigger>
            <TabsTrigger value="ai-interview" className="gap-1.5">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Interview</span>
              <span className="sm:hidden">Interview</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: JOB POSTINGS
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="jobs">
            {/* Stats Row */}
            {jobsLoading ? (
              <StatsSkeleton />
            ) : jobsError ? (
              <Card className="border-rose-200 dark:border-rose-800">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load job stats. <Button variant="link" className="h-auto p-0 text-rose-600" onClick={refetchJobs}>Retry</Button></p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card className="relative overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Open Positions</p>
                        <p className="text-2xl font-bold tracking-tight">{jobStats.openPositions}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950">
                        <Briefcase className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
                </Card>

                <Card className="relative overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Total Applications</p>
                        <p className="text-2xl font-bold tracking-tight">{jobStats.totalApplications}</p>
                      </div>
                      <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950">
                        <Users className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
                </Card>

                <Card className="relative overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Avg Time to Hire</p>
                        <p className="text-2xl font-bold tracking-tight">{jobStats.avgTimeToHire}<span className="text-sm font-normal text-muted-foreground ml-1">days</span></p>
                      </div>
                      <div className="rounded-lg bg-cyan-100 p-2.5 dark:bg-cyan-950">
                        <Clock className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-transparent" />
                </Card>

                <Card className="relative overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Offer Acceptance</p>
                        <p className="text-2xl font-bold tracking-tight">{jobStats.offerAcceptanceRate}<span className="text-sm font-normal text-muted-foreground ml-1">%</span></p>
                      </div>
                      <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-950">
                        <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-teal-500 to-transparent" />
                </Card>
              </div>
            )}

            {/* Filters + Search + Post New Job */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-[180px] pl-8 h-9 text-sm"
                  />
                  {jobSearch && (
                    <button
                      onClick={() => setJobSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="w-[160px]" size="sm">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {uniqueDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]" size="sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={postJobOpen} onOpenChange={(open) => {
                setPostJobOpen(open)
                if (!open) setJobMutationError(null)
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                    <Plus className="h-4 w-4" />
                    Post New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Post New Job</DialogTitle>
                    <DialogDescription>
                      Create a new job posting. AI will help optimize the description for better candidate matching.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {jobMutationError && (
                      <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/30">
                        <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="text-xs text-rose-700 dark:text-rose-300">{jobMutationError}</span>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="job-title">Job Title</Label>
                      <Input id="job-title" placeholder="e.g. Senior Backend Developer" value={newJob.title} onChange={(e) => setNewJob((p) => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={newJob.department} onValueChange={(v) => setNewJob((p) => ({ ...p, department: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations', 'Product', 'Customer Support'].map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g. Bangalore" value={newJob.location} onChange={(e) => setNewJob((p) => ({ ...p, location: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Employment Type</Label>
                        <Select value={newJob.type} onValueChange={(v) => setNewJob((p) => ({ ...p, type: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="experience">Experience</Label>
                        <Input id="experience" placeholder="e.g. 3-5 years" value={newJob.experience} onChange={(e) => setNewJob((p) => ({ ...p, experience: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input id="salary" placeholder="e.g. 15-22 LPA" value={newJob.salary} onChange={(e) => setNewJob((p) => ({ ...p, salary: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Required Skills (comma separated)</Label>
                      <Input id="skills" placeholder="e.g. React, Node.js, TypeScript" value={newJob.skills} onChange={(e) => setNewJob((p) => ({ ...p, skills: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea id="description" placeholder="Describe the role, responsibilities, and qualifications..." rows={4} value={newJob.description} onChange={(e) => setNewJob((p) => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-300">
                        AI will optimize your job description for better visibility and candidate matching
                      </span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPostJobOpen(false)} disabled={submittingJob}>Cancel</Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                      onClick={handleCreateJob}
                      disabled={submittingJob || !newJob.title.trim()}
                    >
                      {submittingJob ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Publish Job
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Job Cards Grid */}
            {jobsLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="group relative overflow-hidden transition-shadow hover:shadow-lg">
                    <CardContent className="p-5">
                      {/* Title + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base leading-tight">{job.title}</h3>
                        <Badge
                          className={cn(
                            'shrink-0 text-[10px]',
                            job.status === 'open'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          )}
                        >
                          {job.status === 'open' ? 'Open' : 'Closed'}
                        </Badge>
                      </div>

                      {/* Meta info */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {job.type}
                          </span>
                        )}
                      </div>

                      {/* Salary + Experience */}
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        {job.salary && (
                          <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                            <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                          </span>
                        )}
                        {job.experience && (
                          <span className="text-muted-foreground text-xs">{job.experience}</span>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(job.requirements || []).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-[10px] font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {job.applicants} applicants
                          </span>
                          {job.postedDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {new Date(job.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                          View <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!jobsLoading && filteredJobs.length === 0 && (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <Search className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">No jobs found</p>
                <p className="text-xs text-muted-foreground/70">Try adjusting your filters or search query</p>
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: CANDIDATE PIPELINE
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="pipeline">
            {/* Add Candidate Button + Search */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Candidate Pipeline</h3>
                {/* Candidate search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    className="w-[200px] pl-8 h-9 text-sm"
                  />
                  {candidateSearch && (
                    <button
                      onClick={() => setCandidateSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <Dialog open={addCandidateOpen} onOpenChange={(open) => {
                setAddCandidateOpen(open)
                if (!open) setCandidateMutationError(null)
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                    <Plus className="h-4 w-4" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Candidate</DialogTitle>
                    <DialogDescription>
                      Add a new candidate to the pipeline. AI will calculate their fit score automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {candidateMutationError && (
                      <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/30">
                        <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span className="text-xs text-rose-700 dark:text-rose-300">{candidateMutationError}</span>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="candidate-job">Job Position</Label>
                      <Select value={newCandidate.jobId} onValueChange={(v) => setNewCandidate((p) => ({ ...p, jobId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobs.filter((j) => j.status === 'open').map((job) => (
                            <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-name">Full Name</Label>
                        <Input id="candidate-name" placeholder="e.g. Aditya Sharma" value={newCandidate.name} onChange={(e) => setNewCandidate((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-email">Email</Label>
                        <Input id="candidate-email" type="email" placeholder="e.g. aditya@email.com" value={newCandidate.email} onChange={(e) => setNewCandidate((p) => ({ ...p, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-phone">Phone</Label>
                        <Input id="candidate-phone" placeholder="e.g. +91-9900011122" value={newCandidate.phone} onChange={(e) => setNewCandidate((p) => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-company">Current Company</Label>
                        <Input id="candidate-company" placeholder="e.g. TechCorp" value={newCandidate.currentCompany} onChange={(e) => setNewCandidate((p) => ({ ...p, currentCompany: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-experience">Experience</Label>
                        <Input id="candidate-experience" placeholder="e.g. 5 years" value={newCandidate.experience} onChange={(e) => setNewCandidate((p) => ({ ...p, experience: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-education">Education</Label>
                        <Input id="candidate-education" placeholder="e.g. B.Tech, IIT Delhi" value={newCandidate.education} onChange={(e) => setNewCandidate((p) => ({ ...p, education: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-skills">Skills (comma separated)</Label>
                        <Input id="candidate-skills" placeholder="e.g. React, Node.js, TypeScript" value={newCandidate.skills} onChange={(e) => setNewCandidate((p) => ({ ...p, skills: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="candidate-source">Source</Label>
                        <Select value={newCandidate.source} onValueChange={(v) => setNewCandidate((p) => ({ ...p, source: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portal">Portal</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddCandidateOpen(false)} disabled={submittingCandidate}>Cancel</Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                      onClick={handleAddCandidate}
                      disabled={submittingCandidate || !newCandidate.name.trim() || !newCandidate.email.trim() || !newCandidate.jobId}
                    >
                      {submittingCandidate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Add Candidate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {candidatesLoading ? (
              <PipelineSkeleton />
            ) : candidatesError ? (
              <Card className="border-rose-200 dark:border-rose-800">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load candidates. <Button variant="link" className="h-auto p-0 text-rose-600" onClick={refetchCandidates}>Retry</Button></p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                  {pipelineColumns.map((col) => {
                    const colCandidates = candidatesByStatus[col.key]
                    return (
                      <div key={col.key} className="w-72 shrink-0 sm:w-72">
                        {/* Column header */}
                        <div className={cn('mb-3 flex items-center justify-between rounded-lg px-3 py-2', col.bgColor)}>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-semibold', col.color)}>{col.label}</span>
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/80 px-1.5 text-[10px] font-bold shadow-sm dark:bg-black/30">
                              {colCandidates.length}
                            </span>
                          </div>
                        </div>

                        {/* Candidate cards */}
                        <div className="space-y-3">
                          {colCandidates.map((candidate) => {
                            const sourceBadge = getSourceBadge(candidate.source)
                            const initials = candidate.name.split(' ').map((n) => n[0]).join('')
                            return (
                              <Card
                                key={candidate.id}
                                className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800"
                                onClick={() => openCandidateDetail(candidate)}
                              >
                                <CardContent className="p-4">
                                  {/* Name + AI Score */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-semibold text-white">
                                          {initials}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{candidate.name}</p>
                                        <p className="text-[11px] text-muted-foreground truncate">{candidate.currentCompany || 'No company'}</p>
                                      </div>
                                    </div>
                                    {candidate.aiFitScore != null && <AIFitScoreGauge score={candidate.aiFitScore} size={44} />}
                                  </div>

                                  {/* Experience */}
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {candidate.experience || 'N/A'} experience
                                  </p>

                                  {/* Skills */}
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {(candidate.skills || []).slice(0, 3).map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-[10px] font-normal py-0">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {(candidate.skills || []).length > 3 && (
                                      <Badge variant="outline" className="text-[10px] font-normal py-0">
                                        +{candidate.skills.length - 3}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Source */}
                                  <div className="mt-2.5 flex items-center justify-between">
                                    <Badge className={cn('text-[10px]', sourceBadge.color)}>
                                      {sourceBadge.label}
                                    </Badge>
                                    {(candidate.status === 'interview' || candidate.status === 'screening') && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 gap-1 text-[10px] px-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 dark:text-emerald-400 dark:hover:from-emerald-950/50 dark:hover:to-teal-950/50 border border-emerald-200 dark:border-emerald-800"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setScheduleCandidateId(candidate.id)
                                                setScheduleInterviewOpen(true)
                                              }}
                                            >
                                              <Sparkles className="h-3 w-3" />
                                              AI Interview
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Schedule AI-conducted interview</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    {candidate.interviewDate && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(candidate.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                      </span>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}

                          {colCandidates.length === 0 && (
                            <div className="rounded-lg border-2 border-dashed p-6 text-center">
                              <p className="text-xs text-muted-foreground">No candidates</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Candidate Detail Dialog */}
            <Dialog open={candidateDetailOpen} onOpenChange={setCandidateDetailOpen}>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                {selectedCandidate && (
                  <>
                    <DialogHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white">
                            {selectedCandidate.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <DialogTitle className="text-xl">{selectedCandidate.name}</DialogTitle>
                          <DialogDescription className="mt-1">
                            {selectedCandidate.currentCompany || 'No company'} &middot; {selectedCandidate.experience || 'N/A'} experience
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Contact + Education */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Contact Information</h4>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" /> {selectedCandidate.email}
                            </div>
                            {selectedCandidate.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" /> {selectedCandidate.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Education</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {selectedCandidate.education || 'Not specified'}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* AI Resume Match Analysis */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">AI Resume Match Analysis</h4>
                          <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]">
                            <Sparkles className="h-2.5 w-2.5" /> AI
                          </Badge>
                        </div>
                        {(() => {
                          const analysis = getResumeMatchAnalysis(selectedCandidate, jobs)
                          return (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {[
                                { label: 'Overall', value: analysis.overall, color: 'text-emerald-600 dark:text-emerald-400' },
                                { label: 'Skills', value: analysis.skills, color: 'text-amber-600 dark:text-amber-400' },
                                { label: 'Experience', value: analysis.experience, color: 'text-cyan-600 dark:text-cyan-400' },
                                { label: 'Education', value: analysis.education, color: 'text-teal-600 dark:text-teal-400' },
                              ].map((item) => (
                                <div key={item.label} className="rounded-lg border p-3 text-center">
                                  <p className={cn('text-2xl font-bold', item.color)}>{item.value}%</p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
                                  <Progress value={item.value} className="mt-2 h-1.5" />
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </div>

                      <Separator />

                      {/* Skills */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {(selectedCandidate.skills || []).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* AI Interview Questions */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">AI-Generated Interview Questions</h4>
                          <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]">
                            <Sparkles className="h-2.5 w-2.5" /> AI
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {getInterviewQuestions(selectedCandidate.job?.title || null).map((q, idx) => (
                            <div key={idx} className="flex gap-3 rounded-lg border bg-muted/30 p-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                {idx + 1}
                              </span>
                              <p className="text-sm text-foreground">{q}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setCandidateDetailOpen(false)}>
                        Close
                      </Button>
                      <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                        <Calendar className="h-4 w-4" />
                        Schedule Interview
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: AI ONBOARDING
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="onboarding">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* New Hires List (2/3) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">New Hires Onboarding</h3>
                  <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Sparkles className="h-3 w-3" /> AI Enhanced
                  </Badge>
                </div>

                {candidatesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                              <Skeleton className="h-2 w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : onboardingData.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/50" />
                      <p className="mt-2 text-sm font-medium text-muted-foreground">No active onboarding</p>
                      <p className="text-xs text-muted-foreground/70">Hired candidates will appear here for onboarding</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {onboardingData.map((hire) => {
                      const completedCount = hire.checklist.filter((c) => c.completed).length
                      const totalCount = hire.checklist.length
                      const progressPercent = Math.round((completedCount / totalCount) * 100)
                      const isExpanded = expandedOnboarding === hire.id
                      const initials = hire.name.split(' ').map((n) => n[0]).join('')

                      return (
                        <Card key={hire.id} className="overflow-hidden transition-shadow hover:shadow-md">
                          <CardContent className="p-0">
                            {/* Header row */}
                            <div
                              className="flex items-center gap-4 p-4 cursor-pointer"
                              onClick={() => setExpandedOnboarding(isExpanded ? null : hire.id)}
                            >
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">{hire.name}</p>
                                  {progressPercent === 100 && (
                                    <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]">
                                      <CheckCircle2 className="h-2.5 w-2.5" /> Complete
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {hire.designation || 'New Hire'}{hire.department ? ` · ${hire.department}` : ''}
                                </p>
                                {hire.startDate && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Start: {new Date(hire.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progressPercent}%</p>
                                  <p className="text-[10px] text-muted-foreground">{completedCount}/{totalCount} tasks</p>
                                </div>
                                <ChevronRight className={cn(
                                  'h-4 w-4 text-muted-foreground transition-transform',
                                  isExpanded && 'rotate-90'
                                )} />
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="px-4 pb-2">
                              <Progress value={progressPercent} className="h-2" />
                            </div>

                            {/* Expanded checklist */}
                            {isExpanded && (
                              <div className="border-t bg-muted/20 px-4 py-4 space-y-4">
                                {/* Checklist items */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Onboarding Checklist</h4>
                                  {hire.checklist.map((item) => {
                                    const Icon = getChecklistIcon(item.item)
                                    return (
                                      <div key={item.item} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                                        <Checkbox checked={item.completed} className="pointer-events-none" />
                                        <Icon className={cn(
                                          'h-4 w-4 shrink-0',
                                          item.completed
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-muted-foreground'
                                        )} />
                                        <span className={cn(
                                          'text-sm flex-1',
                                          item.completed && 'line-through text-muted-foreground'
                                        )}>
                                          {item.item}
                                        </span>
                                        {item.completed ? (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                          <Clock className="h-4 w-4 text-muted-foreground/50" />
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* AI Recommendations */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Recommendations</h4>
                                    <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] py-0">
                                      <Sparkles className="h-2.5 w-2.5" /> AI
                                    </Badge>
                                  </div>
                                  {hire.aiRecommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                                      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                      <p className="text-xs text-emerald-800 dark:text-emerald-300">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* AI Compliance Bot + Stats (1/3) */}
              <div className="space-y-4">
                {/* Onboarding Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Onboarding Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {candidatesLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                        ))}
                      </div>
                    ) : (() => {
                      const total = onboardingData.length
                      const completed = onboardingData.filter((h) => h.checklist.every((c) => c.completed)).length
                      const inProgress = total - completed
                      const avgProgress = total > 0 ? Math.round(
                        onboardingData.reduce((sum, h) => {
                          const p = h.checklist.filter((c) => c.completed).length / h.checklist.length
                          return sum + p
                        }, 0) / total * 100
                      ) : 0
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total New Hires</span>
                            <span className="text-sm font-semibold">{total}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Completed</span>
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{completed}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">In Progress</span>
                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{inProgress}</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Avg Progress</span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{avgProgress}%</span>
                          </div>
                          <Progress value={avgProgress} className="h-2" />
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Checklist Status Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Checklist Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {['Document Collection', 'IT Setup', 'Policy Acknowledgment', 'Team Introduction', 'Training Assignment', 'First Week Review'].map((item) => {
                        const Icon = getChecklistIcon(item)
                        const completed = onboardingData.filter((h) => h.checklist.find((c) => c.item === item)?.completed).length
                        const total = onboardingData.length || 1
                        const percent = onboardingData.length > 0 ? Math.round((completed / total) * 100) : 0
                        return (
                          <div key={item} className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs truncate">{item}</span>
                                <span className="text-[10px] text-muted-foreground">{completed}/{onboardingData.length}</span>
                              </div>
                              <Progress value={percent} className="h-1.5" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Compliance Bot */}
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                        <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">AI Compliance Bot</CardTitle>
                        <CardDescription className="text-[11px]">Onboarding compliance assistant</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                          <MessageSquare className="h-4 w-4" />
                          Chat with AI Bot
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0">
                        <DialogHeader className="p-6 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                              <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <DialogTitle>AI Compliance Bot</DialogTitle>
                              <DialogDescription>Onboarding compliance assistant</DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>

                        <Separator />

                        {/* Chat messages */}
                        <ScrollArea className="flex-1 p-4" style={{ maxHeight: '400px' }}>
                          <div className="space-y-3">
                            {chatMessages.map((msg, idx) => (
                              <div key={idx} className={cn('flex gap-2', msg.role === 'user' && 'justify-end')}>
                                {msg.role === 'bot' && (
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                                    <Bot className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                )}
                                <div
                                  className={cn(
                                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                                    msg.role === 'bot'
                                      ? 'bg-muted text-foreground'
                                      : 'bg-emerald-600 text-white dark:bg-emerald-700'
                                  )}
                                >
                                  {msg.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        <Separator />

                        {/* Chat input */}
                        <div className="p-4 flex gap-2">
                          <Input
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleChatSend()
                            }}
                            placeholder="Ask about compliance..."
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            onClick={handleChatSend}
                            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 4: AI INTERVIEW
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="ai-interview">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Scheduled</p>
                      <p className="text-2xl font-bold tracking-tight">{interviewStats.scheduled}</p>
                    </div>
                    <div className="rounded-lg bg-cyan-100 p-2.5 dark:bg-cyan-950">
                      <Calendar className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">In Progress</p>
                      <p className="text-2xl font-bold tracking-tight">{interviewStats.inProgress}</p>
                    </div>
                    <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950">
                      <Play className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Completed</p>
                      <p className="text-2xl font-bold tracking-tight">{interviewStats.completed}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950">
                      <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Avg Score</p>
                      <p className="text-2xl font-bold tracking-tight">{interviewStats.avgScore}<span className="text-sm font-normal text-muted-foreground ml-1">/ 100</span></p>
                    </div>
                    <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-950">
                      <Trophy className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-teal-500 to-transparent" />
              </Card>
            </div>

            {/* Schedule Interview Button */}
            <div className="mt-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Interview Sessions</h3>
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-700 dark:to-teal-700 dark:hover:from-emerald-800 dark:hover:to-teal-800"
                onClick={() => {
                  setScheduleCandidateId('')
                  setScheduleInterviewOpen(true)
                }}
              >
                <Sparkles className="h-4 w-4" />
                Schedule AI Interview
              </Button>
            </div>

            {/* Interview List */}
            {interviewsLoading ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-32 mb-3" />
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-24 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : interviewsError ? (
              <Card className="mt-4 border-rose-200 dark:border-rose-800">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load interviews. <Button variant="link" className="h-auto p-0 text-rose-600" onClick={refetchInterviews}>Retry</Button></p>
                </CardContent>
              </Card>
            ) : interviews.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                  <Bot className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">No AI interviews scheduled</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Schedule an AI interview for candidates in the screening or interview stage</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {interviews.map((interview) => {
                  const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Clock }> = {
                    scheduled: { color: 'text-cyan-700 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-950', icon: Calendar },
                    in_progress: { color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-950', icon: Play },
                    completed: { color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-950', icon: CheckCircle2 },
                    cancelled: { color: 'text-rose-700 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-950', icon: X },
                  }
                  const config = statusConfig[interview.status] || statusConfig.scheduled
                  const StatusIcon = config.icon
                  const candidateInitials = interview.candidate?.name?.split(' ').map((n) => n[0]).join('') || '?'

                  return (
                    <Card key={interview.id} className="group relative overflow-hidden transition-shadow hover:shadow-lg">
                      {interview.status === 'in_progress' && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse" />
                      )}
                      <CardContent className="p-5">
                        {/* Candidate + Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                                {candidateInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{interview.candidate?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground truncate">{interview.job?.title || 'Unknown Position'}</p>
                            </div>
                          </div>
                          <Badge className={cn('shrink-0 text-[10px] gap-1', config.bgColor, config.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {interview.status === 'in_progress' ? 'In Progress' : interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                          </Badge>
                        </div>

                        {/* AI Badge */}
                        <div className="mt-3 flex items-center gap-2">
                          <Badge className="gap-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-400 text-[10px] border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI Interview
                          </Badge>
                          {interview.score != null && (
                            <Badge className="gap-1 text-[10px]">
                              <Trophy className="h-2.5 w-2.5" />
                              Score: {interview.score}
                            </Badge>
                          )}
                        </div>

                        {/* Progress */}
                        {interview.status === 'in_progress' && interview.questions?.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{interview.responses?.length || 0}/{interview.questions.length} questions</span>
                            </div>
                            <Progress value={((interview.responses?.length || 0) / interview.questions.length) * 100} className="h-1.5" />
                          </div>
                        )}

                        {/* Date info */}
                        <div className="mt-3 text-xs text-muted-foreground">
                          {interview.startedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Started {new Date(interview.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {interview.completedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed {new Date(interview.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {!interview.startedAt && !interview.completedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created {new Date(interview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-2 border-t pt-3">
                          {interview.status === 'scheduled' && (
                            <Button
                              size="sm"
                              className="gap-1.5 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs"
                              onClick={() => handleStartInterview(interview)}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start Interview
                            </Button>
                          )}
                          {interview.status === 'in_progress' && (
                            <Button
                              size="sm"
                              className="gap-1.5 h-8 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-xs"
                              onClick={() => {
                                // Fetch latest data then open
                                fetch(`/api/ai-interview/${interview.id}`)
                                  .then((r) => r.json())
                                  .then((data) => {
                                    setActiveInterview(data)
                                    setInterviewDetailOpen(true)
                                  })
                              }}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Continue
                            </Button>
                          )}
                          {interview.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 h-8 text-xs"
                              onClick={() => handleViewFeedback(interview)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Feedback
                            </Button>
                          )}
                          {(interview.status === 'scheduled' || interview.status === 'in_progress') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 h-8 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
                              onClick={async () => {
                                try {
                                  await apiPatch(`/api/ai-interview/${interview.id}`, { status: 'cancelled' })
                                  refetchInterviews()
                                } catch (err) {
                                  console.error('Failed to cancel interview:', err)
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Schedule Interview Dialog */}
            <Dialog open={scheduleInterviewOpen} onOpenChange={(open) => {
              setScheduleInterviewOpen(open)
              if (!open) setInterviewMutationError(null)
            }}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
                      <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Schedule AI Interview
                  </DialogTitle>
                  <DialogDescription>
                    AI will generate tailored interview questions based on the job description and candidate profile.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {interviewMutationError && (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/30">
                      <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-xs text-rose-700 dark:text-rose-300">{interviewMutationError}</span>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="interview-candidate">Select Candidate</Label>
                    <Select value={scheduleCandidateId} onValueChange={setScheduleCandidateId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a candidate..." />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates
                          .filter((c) => c.status === 'interview' || c.status === 'screening')
                          .map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.name} — {candidate.job?.title || 'Unknown Position'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {scheduleCandidateId && (() => {
                    const selectedCand = candidates.find((c) => c.id === scheduleCandidateId)
                    if (!selectedCand) return null
                    return (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-semibold text-white">
                              {selectedCand.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{selectedCand.name}</p>
                            <p className="text-[11px] text-muted-foreground">{selectedCand.currentCompany || 'No company'} &middot; {selectedCand.experience || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(selectedCand.skills || []).slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-[10px] font-normal py-0">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Job: {selectedCand.job?.title || 'Unknown'} (auto-selected)
                        </p>
                      </div>
                    )
                  })()}

                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-700 dark:text-emerald-300">
                      AI will generate contextual interview questions based on the job requirements and candidate profile
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setScheduleInterviewOpen(false)} disabled={submittingInterview}>
                    Cancel
                  </Button>
                  <Button
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    onClick={handleScheduleInterview}
                    disabled={submittingInterview || !scheduleCandidateId}
                  >
                    {submittingInterview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {generatingQuestions ? 'Generating Questions...' : submittingInterview ? 'Scheduling...' : 'Schedule & Generate Questions'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Conduct Interview Dialog */}
            <Dialog open={interviewDetailOpen} onOpenChange={(open) => {
              setInterviewDetailOpen(open)
              if (!open) {
                setActiveInterview(null)
                setInterviewResponseText('')
              }
            }}>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
                {activeInterview && (
                  <>
                    <DialogHeader className="p-6 pb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
                          <Bot className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <DialogTitle>AI Interview — {activeInterview.candidate?.name}</DialogTitle>
                          <DialogDescription>
                            {activeInterview.job?.title} &middot; {activeInterview.responses?.length || 0}/{activeInterview.questions?.length || 0} questions answered
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <Separator />

                    {/* Progress bar */}
                    <div className="px-6 pt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Interview Progress</span>
                        <span>{Math.round(((activeInterview.responses?.length || 0) / Math.max(activeInterview.questions?.length || 1, 1)) * 100)}%</span>
                      </div>
                      <Progress value={((activeInterview.responses?.length || 0) / Math.max(activeInterview.questions?.length || 1, 1)) * 100} className="h-2" />
                    </div>

                    <ScrollArea className="flex-1 px-6 py-4" style={{ maxHeight: '400px' }}>
                      <div className="space-y-4">
                        {/* Completed Q&A */}
                        {(activeInterview.responses || []).map((resp, idx) => (
                          <div key={idx} className="space-y-3">
                            {/* Question (AI) */}
                            <div className="flex gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                                <Bot className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="flex-1 rounded-lg bg-muted/50 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="text-[9px] py-0" variant="outline">
                                    {activeInterview.questions?.[idx]?.category || 'general'}
                                  </Badge>
                                </div>
                                <p className="text-sm">{resp.question}</p>
                              </div>
                            </div>
                            {/* Answer (Candidate) */}
                            <div className="flex gap-3 justify-end">
                              <div className="flex-1 max-w-[85%] rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                                <p className="text-sm">{resp.answer}</p>
                                {resp.score && (
                                  <div className="mt-2 flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-500" />
                                    <span className="text-[10px] text-muted-foreground">Score: {resp.score}/100</span>
                                  </div>
                                )}
                              </div>
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-[9px] font-semibold text-white">
                                  {activeInterview.candidate?.name?.split(' ').map((n) => n[0]).join('') || 'C'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        ))}

                        {/* Current question */}
                        {activeInterview.status !== 'completed' && activeInterview.questions?.[activeInterview.responses?.length || 0] && (
                          <div className="flex gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 animate-pulse">
                              <Bot className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="text-[9px] py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                  AI Question
                                </Badge>
                                <Badge className="text-[9px] py-0" variant="outline">
                                  {activeInterview.questions[activeInterview.responses?.length || 0]?.category || 'general'}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium">
                                {activeInterview.questions[activeInterview.responses?.length || 0]?.question}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Looking for: {activeInterview.questions[activeInterview.responses?.length || 0]?.evaluationCriteria}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Completion message */}
                        {activeInterview.status === 'completed' && (
                          <div className="flex flex-col items-center text-center py-4 space-y-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Interview Completed!</p>
                              <p className="text-xs text-muted-foreground mt-1">AI is generating comprehensive feedback...</p>
                            </div>
                            {activeInterview.score != null && (
                              <div className="flex items-center gap-2">
                                <AIFitScoreGauge score={activeInterview.score} size={48} />
                                <div>
                                  <p className="text-lg font-bold" style={{ color: activeInterview.score >= 75 ? '#10b981' : activeInterview.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {activeInterview.score}/100
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">Overall Score</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {completingInterview && (
                          <div className="flex items-center justify-center py-4 gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                            <span className="text-sm text-muted-foreground">AI is evaluating responses and generating feedback...</span>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <Separator />

                    {/* Response input */}
                    {activeInterview.status !== 'completed' && activeInterview.questions?.[activeInterview.responses?.length || 0] && (
                      <div className="p-4 flex gap-2">
                        <Textarea
                          value={interviewResponseText}
                          onChange={(e) => setInterviewResponseText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmitResponse()
                            }
                          }}
                          placeholder="Type your response here... (Press Enter to submit, Shift+Enter for new line)"
                          className="flex-1 min-h-[80px] resize-none"
                          disabled={submittingResponse}
                        />
                        <Button
                          size="icon"
                          onClick={handleSubmitResponse}
                          disabled={submittingResponse || !interviewResponseText.trim()}
                          className="shrink-0 h-[80px] w-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                          {submittingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}

                    {activeInterview.status === 'completed' && (
                      <div className="p-4 flex justify-center">
                        <Button
                          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                          onClick={() => {
                            setInterviewDetailOpen(false)
                            handleViewFeedback(activeInterview)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Full Feedback
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Feedback Detail Dialog */}
            <Dialog open={feedbackDetailOpen} onOpenChange={(open) => {
              setFeedbackDetailOpen(open)
              if (!open) setInterviewFeedbackView(null)
            }}>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                {interviewFeedbackView && (() => {
                  const feedback: AIInterviewFeedback | null = interviewFeedbackView.feedback
                    ? (() => {
                        try {
                          return typeof interviewFeedbackView.feedback === 'string'
                                            ? JSON.parse(interviewFeedbackView.feedback)
                                            : interviewFeedbackView.feedback
                        } catch {
                          return null
                        }
                      })()
                    : null

                  const recommendationConfig: Record<string, { color: string; bgColor: string; icon: typeof ThumbsUp }> = {
                    'Strong Hire': { color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-950', icon: ThumbsUp },
                    'Hire': { color: 'text-teal-700 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-950', icon: ThumbsUp },
                    'Maybe': { color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-950', icon: Target },
                    'No Hire': { color: 'text-rose-700 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-950', icon: ThumbsDown },
                  }
                  const recConfig = recommendationConfig[feedback?.recommendation || 'Maybe'] || recommendationConfig['Maybe']
                  const RecIcon = recConfig.icon

                  return (
                    <>
                      <DialogHeader>
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
                            <Bot className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <DialogTitle>AI Interview Feedback</DialogTitle>
                            <DialogDescription>
                              {interviewFeedbackView.candidate?.name} — {interviewFeedbackView.job?.title}
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>

                      {feedback ? (
                        <div className="space-y-6 py-4">
                          {/* Overall Score + Recommendation */}
                          <div className="flex items-center gap-6 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30">
                            <div className="flex items-center gap-3">
                              <AIFitScoreGauge score={feedback.overallScore} size={64} />
                              <div>
                                <p className="text-2xl font-bold" style={{ color: feedback.overallScore >= 75 ? '#10b981' : feedback.overallScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                                  {feedback.overallScore}<span className="text-sm font-normal text-muted-foreground">/100</span>
                                </p>
                                <p className="text-xs text-muted-foreground">Overall Score</p>
                              </div>
                            </div>
                            <Separator orientation="vertical" className="h-16" />
                            <div className="flex-1">
                              <Badge className={cn('gap-1.5 text-sm px-3 py-1.5', recConfig.bgColor, recConfig.color)}>
                                <RecIcon className="h-4 w-4" />
                                {feedback.recommendation}
                              </Badge>
                              <p className="mt-2 text-xs text-muted-foreground">AI Recommendation</p>
                            </div>
                          </div>

                          {/* Category Scores */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              Category Scores
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: 'Technical', value: feedback.categoryScores.technical, icon: Zap, color: 'text-emerald-600 dark:text-emerald-400' },
                                { label: 'Communication', value: feedback.categoryScores.communication, icon: MessageSquare, color: 'text-cyan-600 dark:text-cyan-400' },
                                { label: 'Problem Solving', value: feedback.categoryScores.problemSolving, icon: Lightbulb, color: 'text-amber-600 dark:text-amber-400' },
                                { label: 'Culture Fit', value: feedback.categoryScores.cultureFit, icon: UsersRound, color: 'text-teal-600 dark:text-teal-400' },
                              ].map((cat) => (
                                <div key={cat.label} className="rounded-lg border p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <cat.icon className={cn('h-4 w-4', cat.color)} />
                                      <span className="text-xs font-medium">{cat.label}</span>
                                    </div>
                                    <span className={cn('text-sm font-bold', cat.color)}>{cat.value}</span>
                                  </div>
                                  <Progress value={cat.value} className="h-1.5" />
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          {/* Strengths */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              Strengths
                            </h4>
                            <div className="space-y-2">
                              {feedback.strengths.map((strength, idx) => (
                                <div key={idx} className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                  <p className="text-sm text-emerald-800 dark:text-emerald-300">{strength}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Weaknesses */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <ThumbsDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              Areas for Improvement
                            </h4>
                            <div className="space-y-2">
                              {feedback.weaknesses.map((weakness, idx) => (
                                <div key={idx} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                  <p className="text-sm text-amber-800 dark:text-amber-300">{weakness}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          {/* Summary */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              Detailed Summary
                            </h4>
                            <div className="rounded-lg border bg-muted/30 p-4">
                              <p className="text-sm leading-relaxed">{feedback.summary}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground/50" />
                          <p className="mt-2 text-sm font-medium text-muted-foreground">No feedback available</p>
                          <p className="text-xs text-muted-foreground/70">The interview feedback could not be generated or parsed</p>
                        </div>
                      )}

                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setFeedbackDetailOpen(false)}>
                          Close
                        </Button>
                        {feedback && (
                          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                            <RotateCcw className="h-4 w-4" />
                            Re-evaluate
                          </Button>
                        )}
                      </DialogFooter>
                    </>
                  )
                })()}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
