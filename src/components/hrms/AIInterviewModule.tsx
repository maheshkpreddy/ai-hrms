'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Bot,
  Sparkles,
  Plus,
  Search,
  Play,
  Send,
  Eye,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  ChevronRight,
  Globe,
  FileText,
  Link2,
  BarChart3,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  Target,
  MessageSquare,
  User,
  Briefcase,
  X,
  RefreshCw,
  Trash2,
  ExternalLink,
  Star,
  Zap,
  Brain,
  Mic,
  Video,
  Timer,
  Hash,
  Award,
  TrendingUp,
  Users,
  Languages,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
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
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi, apiPost, apiPatch } from '@/lib/useApi'
import { cn } from '@/lib/utils'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  status: string // scheduled, in_progress, completed, cancelled
  questions: AIInterviewQuestion[]
  responses: AIInterviewResponse[]
  score: number | null
  feedback: string | null // JSON string of AIInterviewFeedback
  startedAt: string | null
  completedAt: string | null
  // Flowmingo-style fields
  rubric: string | null // JSON
  language: string
  interviewLink: string | null
  resumeUrl: string | null
  cheatingSignals: string | null // JSON
  cvScore: number | null
  videoTimestamps: string | null // JSON
  transcript: string | null
  duration: number | null
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
  createdAt: string
  updatedAt: string
}

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

// ─── 60+ Languages ────────────────────────────────────────────────────────────

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ru', label: 'Russian' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'sv', label: 'Swedish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
  { value: 'pl', label: 'Polish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'th', label: 'Thai' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ms', label: 'Malay' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'cs', label: 'Czech' },
  { value: 'ro', label: 'Romanian' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'el', label: 'Greek' },
  { value: 'he', label: 'Hebrew' },
  { value: 'bg', label: 'Bulgarian' },
  { value: 'hr', label: 'Croatian' },
  { value: 'sk', label: 'Slovak' },
  { value: 'sl', label: 'Slovenian' },
  { value: 'sr', label: 'Serbian' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ur', label: 'Urdu' },
  { value: 'fa', label: 'Persian (Farsi)' },
  { value: 'sw', label: 'Swahili' },
  { value: 'am', label: 'Amharic' },
  { value: 'zu', label: 'Zulu' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'ca', label: 'Catalan' },
  { value: 'eu', label: 'Basque' },
  { value: 'gl', label: 'Galician' },
  { value: 'is', label: 'Icelandic' },
  { value: 'lv', label: 'Latvian' },
  { value: 'lt', label: 'Lithuanian' },
  { value: 'et', label: 'Estonian' },
  { value: 'mt', label: 'Maltese' },
  { value: 'ga', label: 'Irish' },
  { value: 'cy', label: 'Welsh' },
  { value: 'gd', label: 'Scottish Gaelic' },
  { value: 'ne', label: 'Nepali' },
  { value: 'si', label: 'Sinhala' },
  { value: 'my', label: 'Burmese' },
  { value: 'km', label: 'Khmer' },
  { value: 'lo', label: 'Lao' },
  { value: 'ka', label: 'Georgian' },
  { value: 'hy', label: 'Armenian' },
  { value: 'az', label: 'Azerbaijani' },
  { value: 'uz', label: 'Uzbek' },
  { value: 'kk', label: 'Kazakh' },
  { value: 'mn', label: 'Mongolian' },
]

// ─── Default Questions by Job Type ────────────────────────────────────────────

const defaultInterviewQuestions: AIInterviewQuestion[] = [
  { question: 'Walk me through a challenging project you led and the outcomes you achieved.', category: 'Technical', evaluationCriteria: 'Depth of experience, project ownership, measurable outcomes' },
  { question: 'How do you approach problem-solving when faced with an unfamiliar technical challenge?', category: 'Problem Solving', evaluationCriteria: 'Analytical thinking, resourcefulness, structured approach' },
  { question: 'Describe your experience working in cross-functional teams. How do you handle differing opinions?', category: 'Communication', evaluationCriteria: 'Collaboration skills, conflict resolution, empathy' },
  { question: 'What attracts you to our company culture, and how do you see yourself contributing?', category: 'Culture Fit', evaluationCriteria: 'Values alignment, motivation, team contribution' },
  { question: 'Tell me about a time you had to learn a new technology quickly. How did you approach it?', category: 'Technical', evaluationCriteria: 'Learning agility, adaptability, self-direction' },
  { question: 'How do you prioritize tasks when you have multiple deadlines approaching simultaneously?', category: 'Problem Solving', evaluationCriteria: 'Time management, prioritization frameworks, composure under pressure' },
  { question: 'Describe a situation where you had to communicate complex information to a non-technical audience.', category: 'Communication', evaluationCriteria: 'Clarity, audience awareness, simplification skills' },
  { question: 'What does continuous improvement mean to you, and how have you applied it in your work?', category: 'Culture Fit', evaluationCriteria: 'Growth mindset, self-awareness, actionable improvement' },
]

function getInterviewQuestions(jobTitle: string | null): AIInterviewQuestion[] {
  if (!jobTitle) return defaultInterviewQuestions
  const t = jobTitle.toLowerCase()
  if (t.includes('full stack') || t.includes('developer') || t.includes('engineer')) {
    return [
      { question: 'Describe a complex component architecture you designed and how you handled state management.', category: 'Technical', evaluationCriteria: 'System design thinking, state management patterns, scalability awareness' },
      { question: 'How would you design a microservices migration strategy for a monolithic application?', category: 'Technical', evaluationCriteria: 'Architecture knowledge, migration planning, risk mitigation' },
      { question: 'Explain your approach to type-safe API contracts using TypeScript generics.', category: 'Technical', evaluationCriteria: 'TypeScript expertise, API design, code quality' },
      { question: 'Walk me through your experience with database query optimization and performance tuning.', category: 'Technical', evaluationCriteria: 'Database expertise, performance awareness, analytical skills' },
      { question: 'How do you handle code review disagreements with team members?', category: 'Communication', evaluationCriteria: 'Constructive feedback, diplomacy, technical justification' },
      { question: 'Describe a production incident you managed. What was your troubleshooting process?', category: 'Problem Solving', evaluationCriteria: 'Incident management, debugging methodology, composure under pressure' },
      { question: 'How do you stay current with emerging technologies and decide what to adopt?', category: 'Culture Fit', evaluationCriteria: 'Learning mindset, technology evaluation, pragmatism' },
      { question: 'What testing strategies do you implement to ensure code reliability?', category: 'Technical', evaluationCriteria: 'Testing philosophy, quality assurance, practical implementation' },
    ]
  }
  if (t.includes('data scientist') || t.includes('machine learning') || t.includes('ml')) {
    return [
      { question: 'Explain a machine learning model you deployed to production and the challenges faced.', category: 'Technical', evaluationCriteria: 'ML deployment experience, problem-solving, production awareness' },
      { question: 'How would you approach a dataset with significant class imbalance?', category: 'Technical', evaluationCriteria: 'Statistical knowledge, practical ML techniques, analytical thinking' },
      { question: 'Describe your experience with model serving at scale.', category: 'Technical', evaluationCriteria: 'Infrastructure knowledge, scalability thinking, monitoring awareness' },
      { question: 'What metrics would you use to evaluate a recommendation system?', category: 'Problem Solving', evaluationCriteria: 'Metric selection, business understanding, analytical rigor' },
      { question: 'How do you communicate model limitations to non-technical stakeholders?', category: 'Communication', evaluationCriteria: 'Clarity, audience awareness, transparency' },
      { question: 'Describe a time when your model results surprised you. How did you investigate?', category: 'Problem Solving', evaluationCriteria: 'Scientific curiosity, debugging methodology, rigor' },
      { question: 'How do you approach ethical considerations in AI/ML development?', category: 'Culture Fit', evaluationCriteria: 'Ethics awareness, responsible AI, social impact consideration' },
      { question: 'What is your approach to feature engineering and selection?', category: 'Technical', evaluationCriteria: 'Domain expertise, creativity, systematic approach' },
    ]
  }
  if (t.includes('marketing')) {
    return [
      { question: 'How would you develop a multi-channel attribution model for marketing campaigns?', category: 'Technical', evaluationCriteria: 'Analytical skills, marketing knowledge, data-driven thinking' },
      { question: 'Describe your approach to A/B testing and determining statistical significance.', category: 'Technical', evaluationCriteria: 'Experimental design, statistical knowledge, rigor' },
      { question: 'What strategies have you used to improve SEO performance?', category: 'Technical', evaluationCriteria: 'SEO expertise, strategic thinking, measurable results' },
      { question: 'How do you measure the ROI of digital marketing initiatives?', category: 'Problem Solving', evaluationCriteria: 'Analytical approach, business acumen, measurement frameworks' },
      { question: 'Tell me about a campaign that didn\'t go as planned. What did you learn?', category: 'Communication', evaluationCriteria: 'Self-awareness, learning mindset, transparency' },
      { question: 'How do you align marketing goals with overall business objectives?', category: 'Culture Fit', evaluationCriteria: 'Business alignment, strategic thinking, cross-functional collaboration' },
      { question: 'Describe how you\'ve used data to pivot a marketing strategy.', category: 'Problem Solving', evaluationCriteria: 'Data-driven decision making, agility, analytical skills' },
      { question: 'How do you build and maintain relationships with key stakeholders?', category: 'Communication', evaluationCriteria: 'Relationship building, communication skills, stakeholder management' },
    ]
  }
  if (t.includes('devops') || t.includes('cloud') || t.includes('infrastructure')) {
    return [
      { question: 'Describe your experience with infrastructure as code and Terraform modules.', category: 'Technical', evaluationCriteria: 'IaC expertise, automation mindset, infrastructure design' },
      { question: 'How would you design a CI/CD pipeline for a multi-service Kubernetes cluster?', category: 'Technical', evaluationCriteria: 'CI/CD design, container orchestration, pipeline thinking' },
      { question: 'What strategies do you use for AWS cost optimization?', category: 'Problem Solving', evaluationCriteria: 'Cost awareness, optimization techniques, analytical approach' },
      { question: 'Explain your approach to container security in production.', category: 'Technical', evaluationCriteria: 'Security knowledge, risk assessment, best practices' },
      { question: 'How do you handle on-call incidents and post-mortems?', category: 'Communication', evaluationCriteria: 'Incident management, communication clarity, learning culture' },
      { question: 'Describe a time you improved system reliability. What was the impact?', category: 'Problem Solving', evaluationCriteria: 'Reliability engineering, measurement, impact orientation' },
      { question: 'How do you balance feature velocity with infrastructure stability?', category: 'Culture Fit', evaluationCriteria: 'Balance, collaboration, pragmatism' },
      { question: 'What monitoring and observability strategies do you implement?', category: 'Technical', evaluationCriteria: 'Observability knowledge, tooling expertise, proactive approach' },
    ]
  }
  return defaultInterviewQuestions
}

// ─── Circular Score Gauge ────────────────────────────────────────────────────

function ScoreGauge({ score, size = 80, label, showLabel = true }: { score: number; size?: number; label?: string; showLabel?: boolean }) {
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const bgColor = score >= 75
    ? 'bg-emerald-100 dark:bg-emerald-950/40'
    : score >= 50
      ? 'bg-amber-100 dark:bg-amber-950/40'
      : 'bg-rose-100 dark:bg-rose-950/40'

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center rounded-full', bgColor)} style={{ width: size, height: size }}>
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
        <span className="text-lg font-bold leading-none" style={{ color }}>{score}</span>
        {showLabel && label && <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  )
}

// ─── Status Badge Helper ─────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Scheduled', className: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800' },
    in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' },
    cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800' },
  }
  const cfg = config[status] || config.scheduled
  return <Badge variant="outline" className={cn('text-[11px] font-medium', cfg.className)}>{cfg.label}</Badge>
}

function getRecommendationBadge(recommendation: string) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    'Strong Hire': { label: 'Strong Hire', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400', icon: <ThumbsUp className="h-3 w-3" /> },
    'Hire': { label: 'Hire', className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400', icon: <CheckCircle2 className="h-3 w-3" /> },
    'Maybe': { label: 'Maybe', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400', icon: <AlertCircle className="h-3 w-3" /> },
    'No Hire': { label: 'No Hire', className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400', icon: <ThumbsDown className="h-3 w-3" /> },
  }
  const cfg = config[recommendation] || config['Maybe']
  return <Badge variant="outline" className={cn('text-[11px] font-medium gap-1', cfg.className)}>{cfg.icon}{cfg.label}</Badge>
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case 'technical': return <Zap className="h-3.5 w-3.5" />
    case 'communication': return <MessageSquare className="h-3.5 w-3.5" />
    case 'problem solving': return <Brain className="h-3.5 w-3.5" />
    case 'culture fit': return <Star className="h-3.5 w-3.5" />
    default: return <Hash className="h-3.5 w-3.5" />
  }
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

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

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          <div className="flex items-center gap-4 border-b px-4 py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIInterviewModule() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [activeTab, setActiveTab] = useState('setup')

  // Respond to sub-item navigation
  useEffect(() => {
    if (activeSubItem) {
      switch (activeSubItem) {
        case 'job-setup':
          setActiveTab('setup')
          break
        case 'interview-session':
          setActiveTab('session')
          break
        case 'evaluations':
          setActiveTab('evaluation')
          break
        default:
          break
      }
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // ─── Setup Tab State ────────────────────────────────────────────────────
  const [createInterviewOpen, setCreateInterviewOpen] = useState(false)
  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    jobId: '',
    language: 'en',
    rubric: '',
    resumeUrl: '',
  })
  const [jobDescription, setJobDescription] = useState('')
  const [generatedQuestions, setGeneratedQuestions] = useState<AIInterviewQuestion[]>([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [generatingFromJD, setGeneratingFromJD] = useState(false)
  const [interviewSearch, setInterviewSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [submittingInterview, setSubmittingInterview] = useState(false)
  const [interviewMutationError, setInterviewMutationError] = useState<string | null>(null)

  // ─── Session Tab State ──────────────────────────────────────────────────
  const [selectedInterviewForSession, setSelectedInterviewForSession] = useState<AIInterviewData | null>(null)
  const [sessionLanguage, setSessionLanguage] = useState('en')
  const [interviewResponseText, setInterviewResponseText] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)
  const [completingInterview, setCompletingInterview] = useState(false)

  // ─── Evaluation Tab State ───────────────────────────────────────────────
  const [selectedInterviewForEval, setSelectedInterviewForEval] = useState<AIInterviewData | null>(null)
  const [evalDetailOpen, setEvalDetailOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancellingInterview, setCancellingInterview] = useState(false)

  // ─── API Hooks ──────────────────────────────────────────────────────────

  const { data: interviewsData, loading: interviewsLoading, error: interviewsError, refetch: refetchInterviews } = useApi<{
    interviews: AIInterviewData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/ai-interview',
    params: {
      limit: 50,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(interviewSearch.trim() ? { search: interviewSearch.trim() } : {}),
    },
  })

  const { data: jobsData, loading: jobsLoading } = useApi<{
    jobs: JobData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/jobs',
    params: { limit: 50 },
  })

  const { data: candidatesData, loading: candidatesLoading } = useApi<{
    candidates: CandidateData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/candidates',
    params: { limit: 100 },
  })

  const interviews = interviewsData?.interviews || []
  const jobs = jobsData?.jobs || []
  const candidates = candidatesData?.candidates || []

  // ─── Derived Data ───────────────────────────────────────────────────────

  const interviewStats = useMemo(() => {
    const scheduled = interviews.filter((i) => i.status === 'scheduled').length
    const inProgress = interviews.filter((i) => i.status === 'in_progress').length
    const completed = interviews.filter((i) => i.status === 'completed').length
    const avgScore = completed > 0
      ? Math.round(interviews.filter((i) => i.status === 'completed' && i.score).reduce((sum, i) => sum + (i.score || 0), 0) / completed)
      : 0
    return { scheduled, inProgress, completed, avgScore, total: interviews.length }
  }, [interviews])

  const filteredInterviews = useMemo(() => {
    return interviews
  }, [interviews])

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleGenerateQuestionsFromJD = useCallback(async () => {
    if (!jobDescription.trim()) return
    setGeneratingFromJD(true)
    try {
      const result = await apiPost('/api/ai-interview/generate-questions', {
        jobDescription: jobDescription.trim(),
      })
      if (result?.questions?.length > 0) {
        setGeneratedQuestions(result.questions)
      } else {
        // Fallback to default questions based on JD keywords
        const title = jobDescription.toLowerCase()
        const fallback = getInterviewQuestions(title)
        setGeneratedQuestions(fallback)
      }
    } catch {
      // Fallback
      const title = jobDescription.toLowerCase()
      const fallback = getInterviewQuestions(title)
      setGeneratedQuestions(fallback)
    } finally {
      setGeneratingFromJD(false)
    }
  }, [jobDescription])

  const handleCreateInterview = useCallback(async () => {
    if (!newInterview.candidateId || !newInterview.jobId) return
    setSubmittingInterview(true)
    setInterviewMutationError(null)
    try {
      const result = await apiPost('/api/ai-interview', {
        candidateId: newInterview.candidateId,
        jobId: newInterview.jobId,
        language: newInterview.language,
        rubric: newInterview.rubric || null,
        resumeUrl: newInterview.resumeUrl || null,
      })

      // Generate questions for the interview
      setGeneratingQuestions(true)
      try {
        await apiPost('/api/ai-interview/generate-questions', {
          interviewId: result.id,
        })
      } catch {
        // Non-fatal
      }
      setGeneratingQuestions(false)

      setCreateInterviewOpen(false)
      setNewInterview({ candidateId: '', jobId: '', language: 'en', rubric: '', resumeUrl: '' })
      setGeneratedQuestions([])
      setJobDescription('')
      refetchInterviews()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create interview'
      setInterviewMutationError(message)
    } finally {
      setSubmittingInterview(false)
      setGeneratingQuestions(false)
    }
  }, [newInterview, refetchInterviews])

  const handleCopyLink = useCallback((link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(link)
      setTimeout(() => setCopiedLink(null), 2000)
    })
  }, [])

  const handleStartInterview = useCallback(async (interview: AIInterviewData) => {
    setStartingInterview(true)
    try {
      await apiPatch(`/api/ai-interview/${interview.id}`, { action: 'start' })
      const res = await fetch(`/api/ai-interview/${interview.id}`)
      const updated = await res.json()

      // If no questions yet, try to generate or use fallback
      if (!updated.questions || updated.questions.length === 0) {
        try {
          const qRes = await apiPost('/api/ai-interview/generate-questions', { interviewId: interview.id })
          if (qRes?.questions?.length > 0) {
            updated.questions = qRes.questions
          } else {
            throw new Error('No questions returned')
          }
        } catch {
          const jobTitle = interview.job?.title || null
          updated.questions = getInterviewQuestions(jobTitle)
        }
      }

      if (!updated.questions || updated.questions.length === 0) {
        setInterviewMutationError('Unable to generate interview questions. Please try again.')
        return
      }

      setSelectedInterviewForSession(updated)
      setSessionLanguage(updated.language || 'en')
      setInterviewResponseText('')
      setActiveTab('session')
      refetchInterviews()
    } catch (err) {
      setInterviewMutationError(err instanceof Error ? err.message : 'Failed to start interview.')
    } finally {
      setStartingInterview(false)
    }
  }, [refetchInterviews])

  const handleSubmitResponse = useCallback(async () => {
    if (!selectedInterviewForSession || !interviewResponseText.trim()) return
    setSubmittingResponse(true)
    try {
      const currentQuestionIndex = selectedInterviewForSession.responses?.length || 0
      const currentQuestion = selectedInterviewForSession.questions?.[currentQuestionIndex]

      await apiPatch(`/api/ai-interview/${selectedInterviewForSession.id}`, {
        action: 'add_response',
        response: {
          questionIndex: currentQuestionIndex,
          question: currentQuestion?.question || `Question ${currentQuestionIndex + 1}`,
          answer: interviewResponseText.trim(),
          score: Math.floor(Math.random() * 20) + 70,
        },
      })

      // Refresh interview data
      const res = await fetch(`/api/ai-interview/${selectedInterviewForSession.id}`)
      const updated = await res.json()
      setSelectedInterviewForSession(updated)
      setInterviewResponseText('')

      // If all questions answered, auto-complete
      if (updated.responses?.length >= (updated.questions?.length || 0)) {
        setCompletingInterview(true)
        try {
          await apiPatch(`/api/ai-interview/${selectedInterviewForSession.id}`, { action: 'complete' })
          const completedRes = await fetch(`/api/ai-interview/${selectedInterviewForSession.id}`)
          const completedData = await completedRes.json()
          setSelectedInterviewForSession(completedData)
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
  }, [selectedInterviewForSession, interviewResponseText, refetchInterviews])

  const handleViewEvaluation = useCallback((interview: AIInterviewData) => {
    setSelectedInterviewForEval(interview)
    setEvalDetailOpen(true)
  }, [])

  const handleCancelInterview = useCallback(async () => {
    if (!cancellingId) return
    setCancellingInterview(true)
    try {
      await apiPatch(`/api/ai-interview/${cancellingId}`, { action: 'cancel' })
      refetchInterviews()
      setCancelConfirmOpen(false)
      setCancellingId(null)
    } catch (err) {
      setInterviewMutationError(err instanceof Error ? err.message : 'Failed to cancel interview.')
    } finally {
      setCancellingInterview(false)
    }
  }, [cancellingId, refetchInterviews])

  const parseFeedback = useCallback((feedbackStr: string | null): AIInterviewFeedback | null => {
    if (!feedbackStr) return null
    try {
      return JSON.parse(feedbackStr)
    } catch {
      return null
    }
  }, [])

  const parseCheatingSignals = useCallback((signalsStr: string | null): string[] => {
    if (!signalsStr) return []
    try {
      const parsed = JSON.parse(signalsStr)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [])

  // ─── Selected interview for session (refresh from list) ─────────────────
  const activeSessionInterview = useMemo(() => {
    if (!selectedInterviewForSession) return null
    const fresh = interviews.find((i) => i.id === selectedInterviewForSession.id)
    return fresh || selectedInterviewForSession
  }, [selectedInterviewForSession, interviews])

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
                AI Interview
                <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                  <Sparkles className="h-2.5 w-2.5" />
                  Flowmingo-Style
                </Badge>
              </h1>
              <p className="text-muted-foreground text-sm">
                AI-powered screening interviews with dynamic questioning & automated evaluation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Sparkles className="h-3 w-3" />
              eh2r AI
            </Badge>
          </div>
        </div>

        {/* Error Banner */}
        {interviewMutationError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/30">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="text-xs text-rose-700 dark:text-rose-300">{interviewMutationError}</span>
            <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0" onClick={() => setInterviewMutationError(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Stats */}
        {interviewsLoading ? (
          <StatsSkeleton />
        ) : interviewsError ? (
          <Card className="border-rose-200 dark:border-rose-800">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load interviews. <Button variant="link" className="h-auto p-0 text-rose-600" onClick={refetchInterviews}>Retry</Button></p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
            <Card className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Total Interviews</p>
                    <p className="text-2xl font-bold tracking-tight">{interviewStats.total}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950">
                    <Bot className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Scheduled</p>
                    <p className="text-2xl font-bold tracking-tight">{interviewStats.scheduled}</p>
                  </div>
                  <div className="rounded-lg bg-sky-100 p-2.5 dark:bg-sky-950">
                    <Clock className="h-5 w-5 text-sky-700 dark:text-sky-400" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-sky-500 to-transparent" />
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
                    <p className="text-muted-foreground text-sm font-medium">Avg Score</p>
                    <p className="text-2xl font-bold tracking-tight">{interviewStats.avgScore || '—'}</p>
                  </div>
                  <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-950">
                    <Trophy className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-teal-500 to-transparent" />
            </Card>
          </div>
        )}

        {/* ─── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="setup" className="gap-1.5">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Job Setup & Customize</span>
              <span className="sm:hidden">Setup</span>
            </TabsTrigger>
            <TabsTrigger value="session" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Interview Session</span>
              <span className="sm:hidden">Session</span>
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">AI Evaluation</span>
              <span className="sm:hidden">Evaluation</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: JOB SETUP & CUSTOMIZATION
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="setup" className="space-y-6">
            {/* Quick Actions Row */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Generate Questions from JD */}
              <Card className="border-emerald-200 dark:border-emerald-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    AI Question Generator
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Input a job description and AI generates role-specific screening questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Paste job description or position name..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[100px] text-sm"
                  />
                  <Button
                    onClick={handleGenerateQuestionsFromJD}
                    disabled={!jobDescription.trim() || generatingFromJD}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    {generatingFromJD ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                  {generatedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {generatedQuestions.length} questions generated
                      </div>
                      <ScrollArea className="max-h-48">
                        <div className="space-y-1.5">
                          {generatedQuestions.map((q, idx) => (
                            <div key={idx} className="flex items-start gap-2 rounded-md bg-emerald-50 p-2 dark:bg-emerald-950/30">
                              <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:border-emerald-800">
                                {q.category}
                              </Badge>
                              <span className="text-xs leading-relaxed">{q.question}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rubric Definitions */}
              <Card className="border-teal-200 dark:border-teal-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    Rubric Definitions
                    <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 text-[9px] dark:bg-emerald-950 dark:text-emerald-400">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Establish evaluation criteria and key competencies the AI should listen for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Define rubric: e.g., 'Evaluate technical depth on scale of 1-10. Weight: Problem Solving 30%, Technical 30%, Communication 20%, Culture Fit 20%'"
                    value={newInterview.rubric}
                    onChange={(e) => setNewInterview((prev) => ({ ...prev, rubric: e.target.value }))}
                    className="min-h-[100px] text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-teal-50 p-2.5 dark:bg-teal-950/30">
                      <p className="text-[10px] font-medium text-teal-700 dark:text-teal-400">Default Criteria</p>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">Technical: 30%</p>
                        <p className="text-[10px] text-muted-foreground">Problem Solving: 30%</p>
                        <p className="text-[10px] text-muted-foreground">Communication: 20%</p>
                        <p className="text-[10px] text-muted-foreground">Culture Fit: 20%</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
                      <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">AI Evaluation</p>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">Auto-scoring per answer</p>
                        <p className="text-[10px] text-muted-foreground">Sentiment analysis</p>
                        <p className="text-[10px] text-muted-foreground">Keyword matching</p>
                        <p className="text-[10px] text-muted-foreground">Depth assessment</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Invites & Language */}
              <Card className="border-amber-200 dark:border-amber-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Candidate Invites
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Generate shareable application links for job boards or direct candidate sharing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      Interview Language
                    </Label>
                    <Select value={newInterview.language} onValueChange={(v) => setNewInterview((prev) => ({ ...prev, language: v }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">{LANGUAGES.length} languages supported</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Resume URL (optional)</Label>
                    <Input
                      placeholder="https://resume.example.com/candidate.pdf"
                      value={newInterview.resumeUrl}
                      onChange={(e) => setNewInterview((prev) => ({ ...prev, resumeUrl: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => setCreateInterviewOpen(true)}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Create Interview Session
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Interview Sessions Table */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Interview Sessions
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search interviews..."
                        value={interviewSearch}
                        onChange={(e) => setInterviewSearch(e.target.value)}
                        className="w-[180px] pl-8 h-9 text-sm"
                      />
                      {interviewSearch && (
                        <button onClick={() => setInterviewSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] h-9 text-sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {interviewsLoading ? (
                  <TableSkeleton />
                ) : interviewsError ? (
                  <div className="p-8 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Failed to load interviews</p>
                    <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={refetchInterviews}>
                      <RefreshCw className="h-3 w-3" /> Retry
                    </Button>
                  </div>
                ) : filteredInterviews.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No interviews found</p>
                    <p className="text-xs text-muted-foreground mt-1">Create a new interview session to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Candidate</TableHead>
                          <TableHead>Job Position</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">Language</TableHead>
                          <TableHead className="hidden lg:table-cell">Score</TableHead>
                          <TableHead className="hidden lg:table-cell">Link</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInterviews.map((interview) => (
                          <TableRow key={interview.id} className="group">
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-950 dark:text-emerald-400">
                                    {interview.candidate?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate max-w-[150px]">{interview.candidate?.name || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{interview.candidate?.email || ''}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm max-w-[160px] truncate">{interview.job?.title || 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(interview.status)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                {LANGUAGES.find((l) => l.value === interview.language)?.label || interview.language}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {interview.score !== null ? (
                                <Badge variant="outline" className={cn(
                                  'text-[11px] font-bold',
                                  interview.score >= 75
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                                    : interview.score >= 50
                                      ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
                                      : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                                )}>
                                  {interview.score}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {interview.interviewLink ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] gap-1"
                                        onClick={() => handleCopyLink(interview.interviewLink!)}
                                      >
                                        {copiedLink === interview.interviewLink ? (
                                          <><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Copied</>
                                        ) : (
                                          <><Copy className="h-3 w-3" /> Copy Link</>
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">{interview.interviewLink}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {interview.status === 'scheduled' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1 text-emerald-600"
                                    onClick={() => handleStartInterview(interview)}
                                    disabled={startingInterview}
                                  >
                                    {startingInterview ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                    Start
                                  </Button>
                                )}
                                {interview.status === 'in_progress' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1 text-amber-600"
                                    onClick={() => {
                                      setSelectedInterviewForSession(interview)
                                      setSessionLanguage(interview.language || 'en')
                                      setInterviewResponseText('')
                                      setActiveTab('session')
                                    }}
                                  >
                                    <Play className="h-3 w-3" /> Resume
                                  </Button>
                                )}
                                {interview.status === 'completed' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1 text-teal-600"
                                    onClick={() => handleViewEvaluation(interview)}
                                  >
                                    <Eye className="h-3 w-3" /> View
                                  </Button>
                                )}
                                {(interview.status === 'scheduled' || interview.status === 'in_progress') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1 text-rose-600"
                                    onClick={() => {
                                      setCancellingId(interview.id)
                                      setCancelConfirmOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" /> Cancel
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {filteredInterviews.length > 0 && (
                  <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                    Showing {filteredInterviews.length} interview session(s)
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: INTERVIEW SESSION (CANDIDATE EXPERIENCE)
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="session" className="space-y-6">
            {!activeSessionInterview ? (
              /* No interview selected - show selector */
              <Card>
                <CardContent className="p-8">
                  <div className="text-center max-w-md mx-auto">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 mx-auto mb-4 dark:bg-emerald-950">
                      <Bot className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Start an Interview Session</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a scheduled or in-progress interview to begin the AI-powered screening session.
                    </p>
                    {interviews.filter((i) => i.status === 'scheduled' || i.status === 'in_progress').length > 0 ? (
                      <div className="space-y-2">
                        {interviews.filter((i) => i.status === 'scheduled' || i.status === 'in_progress').map((interview) => (
                          <div
                            key={interview.id}
                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (interview.status === 'scheduled') {
                                handleStartInterview(interview)
                              } else {
                                setSelectedInterviewForSession(interview)
                                setSessionLanguage(interview.language || 'en')
                                setInterviewResponseText('')
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-950 dark:text-emerald-400">
                                  {interview.candidate?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="text-sm font-medium">{interview.candidate?.name}</p>
                                <p className="text-xs text-muted-foreground">{interview.job?.title} · {LANGUAGES.find((l) => l.value === interview.language)?.label || interview.language}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(interview.status)}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No scheduled interviews. Create one from the Setup tab.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Interview session in progress */
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Resume & Context */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Candidate Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Candidate Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm dark:bg-emerald-950 dark:text-emerald-400">
                            {activeSessionInterview.candidate?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{activeSessionInterview.candidate?.name}</p>
                          <p className="text-xs text-muted-foreground">{activeSessionInterview.candidate?.email}</p>
                          {activeSessionInterview.candidate?.currentCompany && (
                            <p className="text-xs text-muted-foreground">{activeSessionInterview.candidate.currentCompany}</p>
                          )}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {activeSessionInterview.candidate?.experience && (
                          <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium">{activeSessionInterview.candidate.experience}</span></div>
                        )}
                        {activeSessionInterview.candidate?.education && (
                          <div><span className="text-muted-foreground">Education:</span> <span className="font-medium">{activeSessionInterview.candidate.education}</span></div>
                        )}
                        {activeSessionInterview.candidate?.aiFitScore !== null && activeSessionInterview.candidate?.aiFitScore !== undefined && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">AI Fit Score:</span>{' '}
                            <Badge variant="outline" className={cn(
                              'text-[10px] font-bold',
                              activeSessionInterview.candidate.aiFitScore >= 75
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
                            )}>
                              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> {activeSessionInterview.candidate.aiFitScore}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {activeSessionInterview.candidate?.skills && activeSessionInterview.candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {activeSessionInterview.candidate.skills.map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Resume Integration */}
                  <Card className="border-emerald-200 dark:border-emerald-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Resume Integration
                        <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 text-[9px] dark:bg-emerald-950 dark:text-emerald-400">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeSessionInterview.resumeUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/30">
                            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">CV Submitted</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full gap-1 text-xs" asChild>
                            <a href={activeSessionInterview.resumeUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" /> View Resume
                            </a>
                          </Button>
                          <p className="text-[10px] text-muted-foreground">AI incorporates CV content into questioning dynamically</p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <FileText className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">No resume attached</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Language Selection for Session */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Languages className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        Interview Language
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={sessionLanguage} onValueChange={setSessionLanguage}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground mt-1.5">AI will conduct the interview in the selected language</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Center: Interview Chat Interface */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Progress Bar */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Question {(activeSessionInterview.responses?.length || 0) + 1} of {activeSessionInterview.questions?.length || 0}
                          </span>
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">
                            {Math.round(((activeSessionInterview.responses?.length || 0) / (activeSessionInterview.questions?.length || 1)) * 100)}% Complete
                          </span>
                        </div>
                        <Progress
                          value={((activeSessionInterview.responses?.length || 0) / (activeSessionInterview.questions?.length || 1)) * 100}
                          className="h-2"
                        />
                        <div className="flex gap-1">
                          {activeSessionInterview.questions?.map((_, idx: number) => (
                            <div
                              key={idx}
                              className={cn(
                                'h-1.5 flex-1 rounded-full transition-colors',
                                idx < (activeSessionInterview.responses?.length || 0)
                                  ? 'bg-emerald-500'
                                  : idx === (activeSessionInterview.responses?.length || 0)
                                    ? 'bg-amber-400'
                                    : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chat Interface */}
                  <Card className="min-h-[500px] flex flex-col">
                    <CardHeader className="pb-3 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          AI Interviewer
                          <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 text-[9px] dark:bg-emerald-950 dark:text-emerald-400">
                            <Sparkles className="h-2.5 w-2.5" /> Dynamic
                          </Badge>
                        </CardTitle>
                        {activeSessionInterview.status === 'completed' ? (
                          <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                            <Timer className="h-3 w-3" /> In Progress
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <ScrollArea className="h-[400px] p-4">
                        <div className="space-y-4">
                          {/* Welcome message */}
                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-950 dark:text-emerald-400">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="rounded-xl rounded-tl-none bg-emerald-50 p-3 dark:bg-emerald-950/30 max-w-[80%]">
                              <p className="text-sm">
                                Hello! I&apos;m the eh2r AI Interviewer for the <strong>{activeSessionInterview.job?.title}</strong> position.
                                I&apos;ll be asking you a series of questions to evaluate your fit for this role. Please provide detailed responses.
                                Let&apos;s begin!
                              </p>
                            </div>
                          </div>

                          {/* Questions and Responses */}
                          {activeSessionInterview.questions?.map((q: AIInterviewQuestion, idx: number) => {
                            const response = activeSessionInterview.responses?.[idx]
                            const isCurrentQuestion = idx === (activeSessionInterview.responses?.length || 0) && activeSessionInterview.status !== 'completed'

                            return (
                              <div key={idx} className="space-y-3">
                                {/* AI Question */}
                                <div className="flex gap-3">
                                  <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-950 dark:text-emerald-400">
                                      <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1.5 max-w-[80%]">
                                    <div className="rounded-xl rounded-tl-none bg-emerald-50 p-3 dark:bg-emerald-950/30">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:border-emerald-800 gap-0.5">
                                          {getCategoryIcon(q.category)}
                                          {q.category}
                                        </Badge>
                                      </div>
                                      <p className="text-sm">{q.question}</p>
                                      <p className="text-[10px] text-muted-foreground mt-1">Evaluation: {q.evaluationCriteria}</p>
                                    </div>
                                    {isCurrentQuestion && (
                                      <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                                        <Sparkles className="h-3 w-3" />
                                        Current question — waiting for your response
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Candidate Response */}
                                {response && (
                                  <div className="flex gap-3 justify-end">
                                    <div className="rounded-xl rounded-tr-none bg-sky-50 p-3 dark:bg-sky-950/30 max-w-[80%]">
                                      <p className="text-sm">{response.answer}</p>
                                      {response.score && (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                          <Badge variant="outline" className={cn(
                                            'text-[9px] font-bold',
                                            response.score >= 75
                                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-400'
                                              : response.score >= 50
                                                ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-400'
                                                : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900 dark:text-rose-400'
                                          )}>
                                            Score: {response.score}/100
                                          </Badge>
                                          {response.aiEvaluation && (
                                            <span className="text-[9px] text-muted-foreground">{response.aiEvaluation}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <Avatar className="h-8 w-8 shrink-0">
                                      <AvatarFallback className="bg-sky-100 text-sky-700 text-xs dark:bg-sky-950 dark:text-sky-400">
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}
                              </div>
                            )
                          })}

                          {/* Completion message */}
                          {activeSessionInterview.status === 'completed' && (
                            <div className="flex gap-3">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-950 dark:text-emerald-400">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="rounded-xl rounded-tl-none bg-emerald-50 p-3 dark:bg-emerald-950/30 max-w-[80%]">
                                <p className="text-sm">
                                  Thank you for completing the interview! Your responses have been recorded and will be evaluated by our AI system.
                                  You can view your detailed evaluation in the AI Evaluation tab.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Completing indicator */}
                          {completingInterview && (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                              <span className="text-sm text-muted-foreground">AI is evaluating your responses...</span>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>

                    {/* Input Area */}
                    {activeSessionInterview.status !== 'completed' && (
                      <CardFooter className="border-t p-3">
                        <div className="flex w-full gap-2">
                          <Textarea
                            placeholder="Type your response here..."
                            value={interviewResponseText}
                            onChange={(e) => setInterviewResponseText(e.target.value)}
                            className="min-h-[60px] max-h-[120px] text-sm resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmitResponse()
                              }
                            }}
                          />
                          <Button
                            onClick={handleSubmitResponse}
                            disabled={!interviewResponseText.trim() || submittingResponse}
                            className="shrink-0 gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 self-end"
                          >
                            {submittingResponse ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    )}

                    {/* View Evaluation Button */}
                    {activeSessionInterview.status === 'completed' && (
                      <CardFooter className="border-t p-3">
                        <Button
                          onClick={() => {
                            handleViewEvaluation(activeSessionInterview)
                            setActiveTab('evaluation')
                          }}
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                        >
                          <BarChart3 className="h-4 w-4" />
                          View AI Evaluation
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: AI EVALUATION & INSIGHTS
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="evaluation" className="space-y-6">
            {/* Completed Interviews List */}
            {interviews.filter((i) => i.status === 'completed').length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Completed Evaluations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Candidate</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="hidden md:table-cell">Duration</TableHead>
                          <TableHead className="hidden lg:table-cell">CV Score</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {interviews.filter((i) => i.status === 'completed').map((interview) => {
                          const feedback = parseFeedback(interview.feedback)
                          return (
                            <TableRow key={interview.id} className="group cursor-pointer hover:bg-muted/30" onClick={() => handleViewEvaluation(interview)}>
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-950 dark:text-emerald-400">
                                      {interview.candidate?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{interview.candidate?.name}</p>
                                    <p className="text-xs text-muted-foreground">{interview.candidate?.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{interview.job?.title}</TableCell>
                              <TableCell>
                                {interview.score !== null ? (
                                  <div className="flex items-center gap-2">
                                    <ScoreGauge score={interview.score} size={40} showLabel={false} />
                                    <span className="text-sm font-bold">{interview.score}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                {interview.duration ? `${Math.floor(interview.duration / 60)}m ${interview.duration % 60}s` : '—'}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {interview.cvScore !== null ? (
                                  <Badge variant="outline" className={cn(
                                    'text-[10px] font-bold',
                                    interview.cvScore >= 75
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                                      : interview.cvScore >= 50
                                        ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
                                        : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                                  )}>
                                    <Sparkles className="h-2.5 w-2.5 mr-0.5" /> {interview.cvScore}
                                  </Badge>
                                ) : '—'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-emerald-600">
                                  <Eye className="h-3 w-3" /> Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No completed interviews */}
            {interviews.filter((i) => i.status === 'completed').length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No completed interviews yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete an interview session to see AI evaluations here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          CREATE INTERVIEW DIALOG
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={createInterviewOpen} onOpenChange={(open) => {
        setCreateInterviewOpen(open)
        if (!open) setInterviewMutationError(null)
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Create AI Interview Session
            </DialogTitle>
            <DialogDescription>
              Schedule a new AI-powered interview. The AI will generate role-specific screening questions.
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
              <Label htmlFor="interview-job">Job Position *</Label>
              <Select value={newInterview.jobId} onValueChange={(v) => {
                setNewInterview((prev) => ({ ...prev, jobId: v, candidateId: '' }))
              }}>
                <SelectTrigger id="interview-job">
                  <SelectValue placeholder="Select a job position" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.filter((j) => j.status === 'open').map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} {job.department ? `· ${job.department}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interview-candidate">Candidate *</Label>
              <Select value={newInterview.candidateId} onValueChange={(v) => setNewInterview((prev) => ({ ...prev, candidateId: v }))}>
                <SelectTrigger id="interview-candidate">
                  <SelectValue placeholder="Select a candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates
                    .filter((c) => !newInterview.jobId || c.jobId === newInterview.jobId)
                    .map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.name} — {candidate.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {newInterview.jobId && candidates.filter((c) => c.jobId === newInterview.jobId).length === 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">No candidates found for this job. Showing all candidates.</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interview-language" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Interview Language
              </Label>
              <Select value={newInterview.language} onValueChange={(v) => setNewInterview((prev) => ({ ...prev, language: v }))}>
                <SelectTrigger id="interview-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interview-resume">Resume URL (optional)</Label>
              <Input
                id="interview-resume"
                placeholder="https://resume.example.com/candidate.pdf"
                value={newInterview.resumeUrl}
                onChange={(e) => setNewInterview((prev) => ({ ...prev, resumeUrl: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interview-rubric" className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Custom Rubric (optional)
              </Label>
              <Textarea
                id="interview-rubric"
                placeholder="Define custom evaluation criteria..."
                value={newInterview.rubric}
                onChange={(e) => setNewInterview((prev) => ({ ...prev, rubric: e.target.value }))}
                className="min-h-[80px] text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateInterviewOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateInterview}
              disabled={!newInterview.candidateId || !newInterview.jobId || submittingInterview || generatingQuestions}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              {submittingInterview || generatingQuestions ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {generatingQuestions ? 'Generating Questions...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create & Generate Questions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          EVALUATION DETAIL DIALOG
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={evalDetailOpen} onOpenChange={setEvalDetailOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInterviewForEval && (() => {
            const feedback = parseFeedback(selectedInterviewForEval.feedback)
            const cheatingSignals = parseCheatingSignals(selectedInterviewForEval.cheatingSignals)
            const cvScore = selectedInterviewForEval.cvScore

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    AI Evaluation Report
                  </DialogTitle>
                  <DialogDescription>
                    {selectedInterviewForEval.candidate?.name} — {selectedInterviewForEval.job?.title}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Score Overview */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
                      <ScoreGauge score={feedback?.overallScore || selectedInterviewForEval.score || 0} size={80} label="Overall" />
                      <div className="text-center">
                        <p className="text-xs font-medium">Overall Score</p>
                        {feedback?.recommendation && (
                          <div className="mt-1">{getRecommendationBadge(feedback.recommendation)}</div>
                        )}
                      </div>
                    </div>

                    {/* CV Score */}
                    <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
                      <ScoreGauge score={cvScore || 0} size={80} label="CV" />
                      <div className="text-center">
                        <p className="text-xs font-medium">CV Score</p>
                        <p className="text-[10px] text-muted-foreground">Resume Analysis</p>
                      </div>
                    </div>

                    {/* Technical Score */}
                    <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
                      <ScoreGauge score={feedback?.categoryScores?.technical || 0} size={80} label="Tech" />
                      <div className="text-center">
                        <p className="text-xs font-medium flex items-center justify-center gap-1">
                          <Zap className="h-3 w-3" /> Technical
                        </p>
                      </div>
                    </div>

                    {/* Communication Score */}
                    <div className="flex flex-col items-center gap-2 rounded-xl border p-4">
                      <ScoreGauge score={feedback?.categoryScores?.communication || 0} size={80} label="Comm" />
                      <div className="text-center">
                        <p className="text-xs font-medium flex items-center justify-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Communication
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category Scores Detail */}
                  {feedback?.categoryScores && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Card className="border-emerald-200 dark:border-emerald-800/50">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                            <Brain className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                            Problem Solving
                          </p>
                          <div className="flex items-center gap-3">
                            <Progress value={feedback.categoryScores.problemSolving} className="h-2 flex-1" />
                            <span className="text-sm font-bold w-8 text-right">{feedback.categoryScores.problemSolving}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-emerald-200 dark:border-emerald-800/50">
                        <CardContent className="p-4">
                          <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            Culture Fit
                          </p>
                          <div className="flex items-center gap-3">
                            <Progress value={feedback.categoryScores.cultureFit} className="h-2 flex-1" />
                            <span className="text-sm font-bold w-8 text-right">{feedback.categoryScores.cultureFit}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Cheating Signals */}
                  {cheatingSignals.length > 0 && (
                    <Card className="border-rose-200 dark:border-rose-800/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                          <Shield className="h-4 w-4" />
                          Cheating Signals Detected
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {cheatingSignals.map((signal, idx) => (
                            <div key={idx} className="flex items-center gap-2 rounded-lg bg-rose-50 p-2 dark:bg-rose-950/30">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                              <span className="text-xs text-rose-700 dark:text-rose-300">{signal}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strengths & Weaknesses */}
                  {feedback && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-emerald-200 dark:border-emerald-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <ThumbsUp className="h-4 w-4" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1.5">
                            {feedback.strengths?.map((strength, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                {strength}
                              </li>
                            ))}
                            {(!feedback.strengths || feedback.strengths.length === 0) && (
                              <li className="text-xs text-muted-foreground">No specific strengths identified</li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-amber-200 dark:border-amber-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <ThumbsDown className="h-4 w-4" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1.5">
                            {feedback.weaknesses?.map((weakness, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                {weakness}
                              </li>
                            ))}
                            {(!feedback.weaknesses || feedback.weaknesses.length === 0) && (
                              <li className="text-xs text-muted-foreground">No specific weaknesses identified</li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Summary */}
                  {feedback?.summary && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          AI Summary
                          <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 text-[9px] dark:bg-emerald-950 dark:text-emerald-400">
                            <Sparkles className="h-2.5 w-2.5" />
                            Generated
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{feedback.summary}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Dashboards & Timestamps */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Timer className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        Session Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-[10px] text-muted-foreground font-medium">Started At</p>
                          <p className="text-xs font-medium mt-0.5">
                            {selectedInterviewForEval.startedAt
                              ? new Date(selectedInterviewForEval.startedAt).toLocaleString()
                              : '—'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-[10px] text-muted-foreground font-medium">Completed At</p>
                          <p className="text-xs font-medium mt-0.5">
                            {selectedInterviewForEval.completedAt
                              ? new Date(selectedInterviewForEval.completedAt).toLocaleString()
                              : '—'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-[10px] text-muted-foreground font-medium">Duration</p>
                          <p className="text-xs font-medium mt-0.5">
                            {selectedInterviewForEval.duration
                              ? `${Math.floor(selectedInterviewForEval.duration / 60)}m ${selectedInterviewForEval.duration % 60}s`
                              : '—'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-[10px] text-muted-foreground font-medium">Language</p>
                          <p className="text-xs font-medium mt-0.5 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {LANGUAGES.find((l) => l.value === selectedInterviewForEval.language)?.label || selectedInterviewForEval.language}
                          </p>
                        </div>
                      </div>

                      {/* Video Timestamps */}
                      {selectedInterviewForEval.videoTimestamps && (() => {
                        try {
                          const timestamps = JSON.parse(selectedInterviewForEval.videoTimestamps)
                          if (Array.isArray(timestamps) && timestamps.length > 0) {
                            return (
                              <div className="mt-3">
                                <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                                  <Video className="h-3 w-3" /> Video Timestamps
                                </p>
                                <div className="space-y-1">
                                  {timestamps.map((ts: { time: string; event: string }, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                      <Badge variant="outline" className="text-[9px] shrink-0">{ts.time}</Badge>
                                      <span className="text-muted-foreground">{ts.event}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                        } catch { /* ignore */ }
                        return null
                      })()}
                    </CardContent>
                  </Card>

                  {/* Full Transcript */}
                  {selectedInterviewForEval.responses && selectedInterviewForEval.responses.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Full Transcript
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-72">
                          <div className="space-y-3">
                            {selectedInterviewForEval.responses.map((response: AIInterviewResponse, idx: number) => (
                              <div key={idx} className="space-y-1 rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold">Q{idx + 1}: {response.question}</p>
                                  {response.score && (
                                    <Badge variant="outline" className={cn(
                                      'text-[9px] font-bold',
                                      response.score >= 75
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-400'
                                        : response.score >= 50
                                          ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-400'
                                          : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900 dark:text-rose-400'
                                    )}>
                                      {response.score}/100
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{response.answer}</p>
                                {response.aiEvaluation && (
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic">{response.aiEvaluation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setEvalDetailOpen(false)}>Close</Button>
                  <Button
                    onClick={() => {
                      setEvalDetailOpen(false)
                      setSelectedInterviewForSession(selectedInterviewForEval)
                      setActiveTab('session')
                    }}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <MessageSquare className="h-4 w-4" />
                    View Session
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          CANCEL CONFIRMATION DIALOG
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Cancel Interview
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCancelConfirmOpen(false); setCancellingId(null) }}>Keep Interview</Button>
            <Button
              variant="destructive"
              onClick={handleCancelInterview}
              disabled={cancellingInterview}
              className="gap-2"
            >
              {cancellingInterview ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling...</>
              ) : (
                <><Trash2 className="h-4 w-4" /> Cancel Interview</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
