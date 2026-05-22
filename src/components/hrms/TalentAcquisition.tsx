'use client'

import { useState, useMemo } from 'react'
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
import { jobs, candidates, onboardingData } from '@/lib/data'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type CandidateStatus = 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected'

interface CandidateDetail {
  id: string
  jobId: string
  name: string
  email: string
  phone: string
  currentCompany: string
  experience: string
  skills: string[]
  education: string
  source: string
  status: CandidateStatus
  aiFitScore: number
  interviewDate: string | null
  onboardingStatus: string | null
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

// ─── AI Interview Questions (mock) ────────────────────────────────────────────

const aiInterviewQuestions: Record<string, string[]> = {
  '1': [
    'Describe a complex React component architecture you designed and how you handled state management.',
    'How would you design a microservices migration strategy for a monolithic Node.js application?',
    'Explain your approach to type-safe API contracts using TypeScript generics.',
    'Walk me through your experience with PostgreSQL query optimization.',
  ],
  '2': [
    'Explain a machine learning model you deployed to production and the challenges faced.',
    'How would you approach a dataset with significant class imbalance?',
    'Describe your experience with TensorFlow model serving at scale.',
    'What metrics would you use to evaluate a recommendation system?',
  ],
  '3': [
    'How would you develop a multi-channel attribution model for marketing campaigns?',
    'Describe your approach to A/B testing and statistical significance.',
    'What strategies have you used to improve SEO performance?',
    'How do you measure the ROI of digital marketing initiatives?',
  ],
  '4': [
    'Describe your experience with end-to-end recruitment processes.',
    'How do you ensure HR compliance across different jurisdictions?',
    'What HRIS systems have you worked with and how did you optimize them?',
    'How would you handle a workplace harassment complaint?',
  ],
  '5': [
    'Describe your experience with infrastructure as code and Terraform modules.',
    'How would you design a CI/CD pipeline for a multi-service Kubernetes cluster?',
    'What strategies do you use for AWS cost optimization?',
    'Explain your approach to container security in production.',
  ],
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

// ─── Resume Match Analysis (mock) ─────────────────────────────────────────────

function getResumeMatchAnalysis(candidate: CandidateDetail) {
  const job = jobs.find((j) => j.id === candidate.jobId)
  if (!job) return { overall: 0, skills: 0, experience: 0, education: 0, culture: 0 }

  const matchedSkills = candidate.skills.filter((s) =>
    job.requirements.some((r) => r.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(r.toLowerCase()))
  )
  const skillsScore = Math.min(100, Math.round((matchedSkills.length / job.requirements.length) * 100))

  return {
    overall: candidate.aiFitScore,
    skills: skillsScore,
    experience: Math.min(100, skillsScore + Math.floor(Math.random() * 15)),
    education: Math.min(100, 60 + Math.floor(Math.random() * 30)),
    culture: Math.min(100, 55 + Math.floor(Math.random() * 35)),
  }
}

// ─── Source badge helper ──────────────────────────────────────────────────────

function getSourceBadge(source: string) {
  switch (source) {
    case 'portal':
      return { label: 'Portal', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' }
    case 'referral':
      return { label: 'Referral', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' }
    case 'linkedin':
      return { label: 'LinkedIn', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' }
    default:
      return { label: source, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' }
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TalentAcquisition() {
  // Job Postings state
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [postJobOpen, setPostJobOpen] = useState(false)

  // Candidate Pipeline state
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetail | null>(null)
  const [candidateDetailOpen, setCandidateDetailOpen] = useState(false)

  // Onboarding state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Hello! I\'m the AI Compliance Bot. I can help you with onboarding compliance checks, document verification, and policy guidance. How can I assist you today?' },
  ])
  const [expandedOnboarding, setExpandedOnboarding] = useState<string | null>(null)

  // ─── Derived data ─────────────────────────────────────────────────────────

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const deptMatch = deptFilter === 'all' || job.department === deptFilter
      const statusMatch = statusFilter === 'all' || job.status === statusFilter
      return deptMatch && statusMatch
    })
  }, [deptFilter, statusFilter])

  const jobStats = useMemo(() => {
    const openPositions = jobs.filter((j) => j.status === 'open').length
    const totalApplications = jobs.reduce((sum, j) => sum + j.applicants, 0)
    const avgTimeToHire = 18 // mock: days
    const offerAcceptanceRate = 87 // mock: percentage
    return { openPositions, totalApplications, avgTimeToHire, offerAcceptanceRate }
  }, [])

  const uniqueDepartments = useMemo(() => [...new Set(jobs.map((j) => j.department))], [])

  const candidatesByStatus = useMemo(() => {
    const grouped: Record<CandidateStatus, CandidateDetail[]> = {
      applied: [],
      screening: [],
      interview: [],
      offered: [],
      hired: [],
      rejected: [],
    }
    candidates.forEach((c) => {
      grouped[c.status as CandidateStatus].push(c as CandidateDetail)
    })
    return grouped
  }, [])

  // ─── Chat handler ──────────────────────────────────────────────────────────

  const handleChatSend = () => {
    if (!chatMessage.trim()) return
    const userMsg = chatMessage.trim()
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setChatMessage('')

    // Mock bot response
    setTimeout(() => {
      let response = ''
      if (userMsg.toLowerCase().includes('document') || userMsg.toLowerCase().includes('collection')) {
        response = 'For document collection compliance, new hires must submit: ID proof, address proof, educational certificates, previous employment letter, and bank details. I\'ve flagged 2 pending document verifications for Karthik Rao\'s onboarding.'
      } else if (userMsg.toLowerCase().includes('policy') || userMsg.toLowerCase().includes('compliance')) {
        response = 'All new hires must acknowledge the Code of Conduct, Data Security Policy, and Remote Work Guidelines within their first 3 days. Currently, 2 employees have pending policy acknowledgments.'
      } else if (userMsg.toLowerCase().includes('it') || userMsg.toLowerCase().includes('setup')) {
        response = 'IT setup checklist includes: laptop provisioning, email account creation, VPN access, Slack workspace invitation, and Jira/GitHub access. I recommend prioritizing DevOps engineer setup for cloud infrastructure access.'
      } else {
        response = 'I can help with onboarding compliance checks, document tracking, policy acknowledgment status, and IT setup coordination. What specific area would you like me to check?'
      }
      setChatMessages((prev) => [...prev, { role: 'bot', text: response }])
    }, 600)
  }

  // ─── Open candidate detail ────────────────────────────────────────────────

  const openCandidateDetail = (candidate: CandidateDetail) => {
    setSelectedCandidate(candidate)
    setCandidateDetailOpen(true)
  }

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
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: JOB POSTINGS
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="jobs">
            {/* Stats Row */}
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

            {/* Filters + Post New Job */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
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

              <Dialog open={postJobOpen} onOpenChange={setPostJobOpen}>
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
                    <div className="grid gap-2">
                      <Label htmlFor="job-title">Job Title</Label>
                      <Input id="job-title" placeholder="e.g. Senior Backend Developer" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueDepartments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g. Bangalore" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="type">Employment Type</Label>
                        <Select>
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
                        <Input id="experience" placeholder="e.g. 3-5 years" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input id="salary" placeholder="e.g. 15-22 LPA" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Required Skills (comma separated)</Label>
                      <Input id="skills" placeholder="e.g. React, Node.js, TypeScript" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea id="description" placeholder="Describe the role, responsibilities, and qualifications..." rows={4} />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-300">
                        AI will optimize your job description for better visibility and candidate matching
                      </span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPostJobOpen(false)}>Cancel</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800" onClick={() => setPostJobOpen(false)}>
                      Publish Job
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Job Cards Grid */}
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
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {job.type}
                      </span>
                    </div>

                    {/* Salary + Experience */}
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                        <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                      </span>
                      <span className="text-muted-foreground text-xs">{job.experience}</span>
                    </div>

                    {/* Skills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.requirements.map((skill) => (
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
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(job.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                        View <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <Search className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">No jobs found</p>
                <p className="text-xs text-muted-foreground/70">Try adjusting your filters</p>
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: CANDIDATE PIPELINE
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="pipeline">
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
                                      <p className="text-[11px] text-muted-foreground truncate">{candidate.currentCompany}</p>
                                    </div>
                                  </div>
                                  <AIFitScoreGauge score={candidate.aiFitScore} size={44} />
                                </div>

                                {/* Experience */}
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {candidate.experience} experience
                                </p>

                                {/* Skills */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {candidate.skills.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-[10px] font-normal py-0">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {candidate.skills.length > 3 && (
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
                            {selectedCandidate.currentCompany} &middot; {selectedCandidate.experience} experience
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
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" /> {selectedCandidate.phone}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Education</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {selectedCandidate.education}
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
                          const analysis = getResumeMatchAnalysis(selectedCandidate)
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
                          {selectedCandidate.skills.map((skill) => (
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
                          {(aiInterviewQuestions[selectedCandidate.jobId] || aiInterviewQuestions['1']).map((q, idx) => (
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
                                {hire.designation} &middot; {hire.department}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Start: {new Date(hire.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
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
              </div>

              {/* AI Compliance Bot + Stats (1/3) */}
              <div className="space-y-4">
                {/* Onboarding Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Onboarding Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const total = onboardingData.length
                      const completed = onboardingData.filter((h) => h.checklist.every((c) => c.completed)).length
                      const inProgress = total - completed
                      const avgProgress = Math.round(
                        onboardingData.reduce((sum, h) => {
                          const p = h.checklist.filter((c) => c.completed).length / h.checklist.length
                          return sum + p
                        }, 0) / total * 100
                      )
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
                        const total = onboardingData.length
                        const percent = Math.round((completed / total) * 100)
                        return (
                          <div key={item} className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs truncate">{item}</span>
                                <span className="text-[10px] text-muted-foreground">{completed}/{total}</span>
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
        </Tabs>
      </div>
    </div>
  )
}
