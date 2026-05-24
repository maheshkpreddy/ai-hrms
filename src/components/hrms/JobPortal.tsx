'use client'

import { useState, useCallback, useMemo } from 'react'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Search, Plus, Globe, FileText, Brain, UserCheck, CheckCircle2, Clock, AlertTriangle, ArrowRight, ChevronRight, Loader2, X, Briefcase, Shield, ClipboardCheck, Send, UserPlus, Eye } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobPortalCandidate {
  id: string
  name: string
  email: string
  phone: string | null
  resumeUrl: string | null
  skills: string | null
  experience: string | null
  education: string | null
  currentCompany: string | null
  expectedSalary: string | null
  location: string | null
  noticePeriod: string | null
  isActive: boolean
  createdAt: string
}

interface JobData {
  id: string
  title: string
  department: string | null
  status: string
}

interface JobApplication {
  id: string
  candidateId: string
  jobId: string
  status: string
  coverLetter: string | null
  expectedSalary: string | null
  noticePeriod: string | null
  aiFitScore: number | null
  interviewMode: string | null
  interviewRounds: number
  currentRound: number
  createdAt: string
  updatedAt: string
  candidate?: { id: string; name: string; email: string; phone: string | null; skills: string | null; experience: string | null; education: string | null; resumeUrl: string | null; location: string | null }
  job?: { id: string; title: string; department: string | null }
  interviews?: InterviewData[]
  offerLetter?: OfferLetterData | null
  onboarding?: OnboardingData | null
  backgroundCheck?: BackgroundCheckData | null
}

interface InterviewData {
  id: string
  applicationId: string
  roundNumber: number
  interviewType: string
  status: string
  scheduledAt: string | null
  completedAt: string | null
  score: number | null
  feedback: string | null
  recommendation: string | null
}

interface OfferLetterData {
  id: string
  applicationId: string
  status: string
  position: string
  department: string | null
  salary: number | null
  startDate: string | null
  issuedAt: string | null
  acceptedAt: string | null
}

interface OnboardingData {
  id: string
  applicationId: string
  status: string
  documentUpload: boolean
  policyAcknowledgment: boolean
  equipmentSetup: boolean
  accountCreation: boolean
  orientationComplete: boolean
  buddyAssigned: string | null
  startDate: string | null
}

interface BackgroundCheckData {
  id: string
  applicationId: string
  status: string
  vendorName: string | null
  criminalCheck: string
  educationCheck: string
  employmentCheck: string
  addressCheck: string
  drugTest: string
  notes: string | null
}

// ─── Pipeline Stages ──────────────────────────────────────────────────────────

const pipelineStages = [
  { key: 'applied', label: 'Applied', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800/50', dotColor: 'bg-slate-400', borderColor: 'border-slate-300 dark:border-slate-700' },
  { key: 'screening', label: 'Screening', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/30', dotColor: 'bg-amber-400', borderColor: 'border-amber-300 dark:border-amber-700' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30', dotColor: 'bg-cyan-400', borderColor: 'border-cyan-300 dark:border-cyan-700' },
  { key: 'interview_round_1', label: 'Interview R1', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-950/30', dotColor: 'bg-purple-400', borderColor: 'border-purple-300 dark:border-purple-700' },
  { key: 'interview_round_2', label: 'Interview R2', color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-50 dark:bg-violet-950/30', dotColor: 'bg-violet-400', borderColor: 'border-violet-300 dark:border-violet-700' },
  { key: 'interview_round_3', label: 'Interview R3', color: 'text-fuchsia-600 dark:text-fuchsia-400', bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', dotColor: 'bg-fuchsia-400', borderColor: 'border-fuchsia-300 dark:border-fuchsia-700' },
  { key: 'offered', label: 'Offered', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', dotColor: 'bg-emerald-400', borderColor: 'border-emerald-300 dark:border-emerald-700' },
  { key: 'hired', label: 'Hired', color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-950/30', dotColor: 'bg-teal-400', borderColor: 'border-teal-300 dark:border-teal-700' },
]

const rejectedStage = { key: 'rejected', label: 'Rejected', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-950/30', dotColor: 'bg-rose-400', borderColor: 'border-rose-300 dark:border-rose-700' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStageConfig(status: string) {
  return pipelineStages.find(s => s.key === status) || rejectedStage
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function parseSkills(skills: string | null): string[] {
  if (!skills) return []
  try {
    const parsed = JSON.parse(skills)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return skills.split(',').map(s => s.trim()).filter(Boolean)
  }
}

function getCheckStatusBadge(status: string) {
  if (status === 'clear') return <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-100">Clear</Badge>
  if (status === 'flagged') return <Badge className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100">Flagged</Badge>
  if (status === 'failed') return <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 hover:bg-red-100">Failed</Badge>
  return <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 hover:bg-amber-100">Pending</Badge>
}

function getInterviewStatusBadge(status: string) {
  switch (status) {
    case 'scheduled': return <Badge className="text-[10px] bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">Scheduled</Badge>
    case 'in_progress': return <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">In Progress</Badge>
    case 'completed': return <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Completed</Badge>
    case 'cancelled': return <Badge className="text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Cancelled</Badge>
    default: return <Badge variant="secondary" className="text-[10px]">{status}</Badge>
  }
}

function getOfferStatusBadge(status: string) {
  switch (status) {
    case 'draft': return <Badge className="text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Draft</Badge>
    case 'sent': return <Badge className="text-[10px] bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">Sent</Badge>
    case 'accepted': return <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Accepted</Badge>
    case 'rejected': return <Badge className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">Rejected</Badge>
    default: return <Badge variant="secondary" className="text-[10px]">{status}</Badge>
  }
}

function getScoreColor(score: number) {
  if (score >= 75) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
  if (score >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
  return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-7 w-12 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-9 w-9 bg-muted animate-pulse rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PipelineSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minWidth: 'max-content' }}>
      {pipelineStages.map((stage) => (
        <div key={stage.key} className="w-72 shrink-0">
          <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${stage.bgColor}`}>
            <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
            <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg animate-pulse">
          <div className="h-8 w-8 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
          <div className="h-6 w-16 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty State Component ────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobPortal() {
  // ── Search & Filter State ──────────────────────────────────────────────────
  const [candidateSearch, setCandidateSearch] = useState('')
  const [skillsSearch, setSkillsSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [experienceSearch, setExperienceSearch] = useState('')
  const [appStatusFilter, setAppStatusFilter] = useState('all')
  const [interviewStatusFilter, setInterviewStatusFilter] = useState('all')

  // ── Dialog State ───────────────────────────────────────────────────────────
  const [addCandidateOpen, setAddCandidateOpen] = useState(false)
  const [appDetailOpen, setAppDetailOpen] = useState(false)
  const [scheduleInterviewOpen, setScheduleInterviewOpen] = useState(false)
  const [offerLetterOpen, setOfferLetterOpen] = useState(false)
  const [viewInterviewOpen, setViewInterviewOpen] = useState(false)
  const [bgCheckOpen, setBgCheckOpen] = useState(false)

  // ── Selected Items ─────────────────────────────────────────────────────────
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)
  const [selectedInterview, setSelectedInterview] = useState<InterviewData | null>(null)

  // ── Form State ─────────────────────────────────────────────────────────────
  const [candForm, setCandForm] = useState({
    name: '', email: '', phone: '', skills: '', experience: '',
    education: '', currentCompany: '', expectedSalary: '', location: '', noticePeriod: '',
  })

  const [interviewForm, setInterviewForm] = useState({
    roundNumber: 1, interviewType: 'human', scheduledAt: '',
  })

  const [offerForm, setOfferForm] = useState({
    position: '', department: '', salary: '', startDate: '',
  })

  const [bgCheckForm, setBgCheckForm] = useState({
    vendorName: '', notes: '',
  })

  // ── Loading State ──────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [schedulingInterview, setSchedulingInterview] = useState(false)
  const [creatingOffer, setCreatingOffer] = useState(false)
  const [initiatingBgCheck, setInitiatingBgCheck] = useState(false)

  // ── API Hooks ──────────────────────────────────────────────────────────────

  const { data: candidatesData, loading: candidatesLoading, refetch: refetchCandidates } = useApi<{
    candidates: JobPortalCandidate[]
    pagination: { total: number }
  }>({
    baseUrl: '/api/jobportal/candidates',
    params: {
      limit: 100,
      search: candidateSearch || undefined,
      skills: skillsSearch || undefined,
      location: locationSearch || undefined,
      experience: experienceSearch || undefined,
    },
  })

  const { data: applicationsData, loading: applicationsLoading, refetch: refetchApplications } = useApi<{
    applications: JobApplication[]
    pagination: { total: number }
  }>({
    baseUrl: '/api/jobportal/applications',
    params: { limit: 200 },
  })

  const { data: jobsData } = useApi<{
    jobs: JobData[]
  }>({
    baseUrl: '/api/jobs',
    params: { limit: 100 },
  })

  const { data: interviewsData, loading: interviewsLoading, refetch: refetchInterviews } = useApi<{
    interviews: (InterviewData & { application?: { candidate?: { name: string; email: string }; job?: { title: string } } })[]
  }>({
    baseUrl: '/api/jobportal/interviews',
    params: { limit: 200 },
  })

  const { data: offersData, loading: offersLoading, refetch: refetchOffers } = useApi<{
    offerLetters: (OfferLetterData & { application?: { candidate?: { name: string; email: string }; job?: { title: string } } })[]
  }>({
    baseUrl: '/api/jobportal/offer-letters',
  })

  const { data: onboardingsData, refetch: refetchOnboardings } = useApi<{
    onboardings: (OnboardingData & { application?: { candidate?: { name: string; email: string }; job?: { title: string; department: string | null } } })[]
  }>({
    baseUrl: '/api/jobportal/onboarding',
  })

  const { data: bgChecksData, refetch: refetchBgChecks } = useApi<{
    backgroundChecks: (BackgroundCheckData & { application?: { candidate?: { name: string; email: string }; job?: { title: string } } })[]
  }>({
    baseUrl: '/api/jobportal/background-checks',
  })

  // ── Derived Data ───────────────────────────────────────────────────────────

  const candidates = candidatesData?.candidates ?? []
  const applications = applicationsData?.applications ?? []
  const jobs = jobsData?.jobs ?? []
  const interviews = interviewsData?.interviews ?? []
  const offers = offersData?.offerLetters ?? []
  const onboardings = onboardingsData?.onboardings ?? []
  const bgChecks = bgChecksData?.backgroundChecks ?? []

  const applicationsByStage = useMemo(() => {
    const grouped: Record<string, JobApplication[]> = {}
    pipelineStages.forEach(s => { grouped[s.key] = [] })
    grouped[rejectedStage.key] = []
    applications.forEach(app => {
      if (grouped[app.status]) grouped[app.status].push(app)
      else grouped['applied'].push(app)
    })
    return grouped
  }, [applications])

  const filteredApplications = useMemo(() => {
    if (appStatusFilter === 'all') return applications
    return applications.filter(a => a.status === appStatusFilter)
  }, [applications, appStatusFilter])

  const filteredInterviews = useMemo(() => {
    if (interviewStatusFilter === 'all') return interviews
    return interviews.filter(i => i.status === interviewStatusFilter)
  }, [interviews, interviewStatusFilter])

  const stats = useMemo(() => ({
    totalCandidates: candidates.length,
    totalApplications: applications.length,
    shortlisted: applications.filter(a => ['shortlisted', 'screening'].includes(a.status)).length,
    offered: applications.filter(a => a.status === 'offered').length,
    hired: applications.filter(a => a.status === 'hired').length,
    activeOnboarding: onboardings.filter(o => o.status !== 'completed').length,
  }), [candidates, applications, onboardings])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddCandidate = useCallback(async () => {
    if (!candForm.name || !candForm.email) return
    setSaving(true)
    try {
      await apiPost('/api/jobportal/candidates', {
        ...candForm,
        skills: candForm.skills ? JSON.stringify(candForm.skills.split(',').map(s => s.trim()).filter(Boolean)) : null,
        expectedSalary: candForm.expectedSalary || null,
        noticePeriod: candForm.noticePeriod || null,
      })
      setAddCandidateOpen(false)
      setCandForm({ name: '', email: '', phone: '', skills: '', experience: '', education: '', currentCompany: '', expectedSalary: '', location: '', noticePeriod: '' })
      refetchCandidates()
    } catch (err) {
      console.error('Failed to add candidate:', err)
    } finally {
      setSaving(false)
    }
  }, [candForm, refetchCandidates])

  const handleMoveStage = useCallback(async (appId: string, newStatus: string) => {
    try {
      await apiPatch(`/api/jobportal/applications/${appId}`, { status: newStatus })
      refetchApplications()
    } catch (err) {
      console.error('Failed to move stage:', err)
    }
  }, [refetchApplications])

  const handleShortlist = useCallback(async (appId: string) => {
    try {
      await apiPatch(`/api/jobportal/applications/${appId}`, { status: 'shortlisted' })
      refetchApplications()
    } catch (err) {
      console.error('Failed to shortlist:', err)
    }
  }, [refetchApplications])

  const handleSetInterviewMode = useCallback(async (appId: string, mode: string) => {
    try {
      await apiPatch(`/api/jobportal/applications/${appId}`, { interviewMode: mode })
      refetchApplications()
    } catch (err) {
      console.error('Failed to set interview mode:', err)
    }
  }, [refetchApplications])

  const handleScheduleInterview = useCallback(async () => {
    if (!selectedApp) return
    setSchedulingInterview(true)
    try {
      await apiPost('/api/jobportal/interviews', {
        applicationId: selectedApp.id,
        roundNumber: interviewForm.roundNumber,
        interviewType: interviewForm.interviewType,
        status: 'scheduled',
        scheduledAt: interviewForm.scheduledAt || new Date().toISOString(),
      })
      const round = interviewForm.roundNumber
      await apiPatch(`/api/jobportal/applications/${selectedApp.id}`, {
        status: `interview_round_${Math.min(round, 3)}`,
        interviewMode: interviewForm.interviewType,
        interviewRounds: round,
        currentRound: round,
      })
      setScheduleInterviewOpen(false)
      setInterviewForm({ roundNumber: 1, interviewType: 'human', scheduledAt: '' })
      refetchApplications()
      refetchInterviews()
    } catch (err) {
      console.error('Failed to schedule interview:', err)
    } finally {
      setSchedulingInterview(false)
    }
  }, [selectedApp, interviewForm, refetchApplications, refetchInterviews])

  const handleCreateOffer = useCallback(async () => {
    if (!selectedApp || !offerForm.position) return
    setCreatingOffer(true)
    try {
      await apiPost('/api/jobportal/offer-letters', {
        applicationId: selectedApp.id,
        position: offerForm.position,
        department: offerForm.department || null,
        salary: offerForm.salary ? parseFloat(offerForm.salary) : null,
        startDate: offerForm.startDate || null,
        status: 'draft',
      })
      await apiPatch(`/api/jobportal/applications/${selectedApp.id}`, { status: 'offered' })
      setOfferLetterOpen(false)
      setOfferForm({ position: '', department: '', salary: '', startDate: '' })
      refetchApplications()
      refetchOffers()
    } catch (err) {
      console.error('Failed to create offer:', err)
    } finally {
      setCreatingOffer(false)
    }
  }, [selectedApp, offerForm, refetchApplications, refetchOffers])

  const handleSendOffer = useCallback(async (offerId: string) => {
    try {
      await apiPatch('/api/jobportal/offer-letters', { id: offerId, status: 'sent', issuedAt: new Date().toISOString() })
      refetchOffers()
    } catch (err) {
      console.error('Failed to send offer:', err)
    }
  }, [refetchOffers])

  const handleAcceptOffer = useCallback(async (offerId: string, appId: string) => {
    try {
      await apiPatch('/api/jobportal/offer-letters', { id: offerId, status: 'accepted', acceptedAt: new Date().toISOString() })
      await apiPatch(`/api/jobportal/applications/${appId}`, { status: 'hired' })
      // Auto-initiate onboarding
      await apiPost('/api/jobportal/onboarding', { applicationId: appId, status: 'pending' })
      refetchOffers()
      refetchApplications()
      refetchOnboardings()
    } catch (err) {
      console.error('Failed to accept offer:', err)
    }
  }, [refetchOffers, refetchApplications, refetchOnboardings])

  const handleRejectOffer = useCallback(async (offerId: string, appId: string) => {
    try {
      await apiPatch('/api/jobportal/offer-letters', { id: offerId, status: 'rejected' })
      await apiPatch(`/api/jobportal/applications/${appId}`, { status: 'rejected' })
      refetchOffers()
      refetchApplications()
    } catch (err) {
      console.error('Failed to reject offer:', err)
    }
  }, [refetchOffers, refetchApplications])

  const handleUpdateOnboarding = useCallback(async (onboardingId: string, field: string, value: boolean) => {
    try {
      await apiPatch('/api/jobportal/onboarding', { id: onboardingId, [field]: value })
      refetchOnboardings()
    } catch (err) {
      console.error('Failed to update onboarding:', err)
    }
  }, [refetchOnboardings])

  const handleInitiateBgCheck = useCallback(async () => {
    if (!selectedApp) return
    setInitiatingBgCheck(true)
    try {
      await apiPost('/api/jobportal/background-checks', {
        applicationId: selectedApp.id,
        status: 'in_progress',
        criminalCheck: 'pending',
        educationCheck: 'pending',
        employmentCheck: 'pending',
        addressCheck: 'pending',
        drugTest: 'pending',
        vendorName: bgCheckForm.vendorName || null,
        notes: bgCheckForm.notes || null,
      })
      setBgCheckOpen(false)
      setBgCheckForm({ vendorName: '', notes: '' })
      refetchBgChecks()
    } catch (err) {
      console.error('Failed to initiate background check:', err)
    } finally {
      setInitiatingBgCheck(false)
    }
  }, [selectedApp, bgCheckForm, refetchBgChecks])

  const handleUpdateBgCheck = useCallback(async (bgCheckId: string, field: string, value: string) => {
    try {
      await apiPatch('/api/jobportal/background-checks', { id: bgCheckId, [field]: value })
      refetchBgChecks()
    } catch (err) {
      console.error('Failed to update background check:', err)
    }
  }, [refetchBgChecks])

  const openAppDetail = useCallback((app: JobApplication) => {
    setSelectedApp(app)
    setAppDetailOpen(true)
  }, [])

  const openScheduleInterview = useCallback((app: JobApplication) => {
    setSelectedApp(app)
    const nextRound = (app.interviews?.length ?? 0) + 1
    setInterviewForm(prev => ({ ...prev, roundNumber: Math.min(nextRound, 3) }))
    setScheduleInterviewOpen(true)
  }, [])

  const openOfferLetter = useCallback((app: JobApplication) => {
    setSelectedApp(app)
    setOfferForm(prev => ({
      ...prev,
      position: app.job?.title || '',
      department: app.job?.department || '',
    }))
    setOfferLetterOpen(true)
  }, [])

  const openBgCheck = useCallback((app: JobApplication) => {
    setSelectedApp(app)
    setBgCheckOpen(true)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Job Portal</h1>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <Brain className="h-3 w-3 mr-1" /> AI
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">Full recruitment pipeline with AI-powered screening &amp; interviews</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddCandidateOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Candidate
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {candidatesLoading && applicationsLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">Total Candidates</p>
                    <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950"><UserPlus className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /></div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950"><FileText className="h-4 w-4 text-amber-700 dark:text-amber-400" /></div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">Shortlisted</p>
                    <p className="text-2xl font-bold">{stats.shortlisted}</p>
                  </div>
                  <div className="rounded-lg bg-cyan-100 p-2 dark:bg-cyan-950"><ClipboardCheck className="h-4 w-4 text-cyan-700 dark:text-cyan-400" /></div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-transparent" />
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">Offered</p>
                    <p className="text-2xl font-bold">{stats.offered}</p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950"><Send className="h-4 w-4 text-purple-700 dark:text-purple-400" /></div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-transparent" />
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">Hired</p>
                    <p className="text-2xl font-bold">{stats.hired}</p>
                  </div>
                  <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-950"><CheckCircle2 className="h-4 w-4 text-teal-700 dark:text-teal-400" /></div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-teal-500 to-transparent" />
            </Card>
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium">Active Onboarding</p>
                    <p className="text-2xl font-bold">{stats.activeOnboarding}</p>
                  </div>
                  <div className="rounded-lg bg-rose-100 p-2 dark:bg-rose-950"><UserCheck className="h-4 w-4 text-rose-700 dark:text-rose-400" /></div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-rose-500 to-transparent" />
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList className="w-full flex-wrap sm:w-auto">
            <TabsTrigger value="pipeline" className="gap-1.5"><Briefcase className="h-4 w-4" /><span className="hidden sm:inline">Pipeline</span></TabsTrigger>
            <TabsTrigger value="candidates" className="gap-1.5"><UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Candidates</span></TabsTrigger>
            <TabsTrigger value="applications" className="gap-1.5"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Applications</span></TabsTrigger>
            <TabsTrigger value="interviews" className="gap-1.5"><Brain className="h-4 w-4" /><span className="hidden sm:inline">Interviews</span></TabsTrigger>
            <TabsTrigger value="offers" className="gap-1.5"><Send className="h-4 w-4" /><span className="hidden sm:inline">Offers</span></TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-1.5"><UserCheck className="h-4 w-4" /><span className="hidden sm:inline">Onboarding</span></TabsTrigger>
            <TabsTrigger value="background" className="gap-1.5"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Background</span></TabsTrigger>
          </TabsList>

          {/* ═══ Pipeline Tab ══════════════════════════════════════════════════════ */}
          <TabsContent value="pipeline">
            {applicationsLoading ? (
              <PipelineSkeleton />
            ) : applications.length === 0 ? (
              <EmptyState icon={Briefcase} title="No applications in pipeline" description="Applications will appear here when candidates apply for jobs." />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4" style={{ minWidth: 'max-content' }}>
                {pipelineStages.map((stage) => {
                  const stageApps = applicationsByStage[stage.key] || []
                  return (
                    <div key={stage.key} className="w-72 shrink-0">
                      <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${stage.bgColor}`}>
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${stage.dotColor}`} />
                          <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{stageApps.length}</Badge>
                      </div>
                      <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                        {stageApps.map((app) => {
                          const stageIdx = pipelineStages.findIndex(s => s.key === stage.key)
                          const nextStage = pipelineStages[stageIdx + 1]
                          const prevStage = stageIdx > 0 ? pipelineStages[stageIdx - 1] : null
                          return (
                            <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow group">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1" onClick={() => openAppDetail(app)}>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 shrink-0">
                                        {getInitials(app.candidate?.name || '?')}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{app.candidate?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{app.job?.title || 'No Job'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  {app.aiFitScore != null && (
                                    <div className={`flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${getScoreColor(app.aiFitScore)}`} style={{ width: 32, height: 32 }}>
                                      {Math.round(app.aiFitScore)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                  {app.interviewMode && (
                                    <Badge variant="outline" className="text-[10px] py-0 gap-0.5">
                                      {app.interviewMode === 'ai' ? <Brain className="h-2.5 w-2.5" /> : <UserCheck className="h-2.5 w-2.5" />}
                                      {app.interviewMode.toUpperCase()}
                                    </Badge>
                                  )}
                                  <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(app.createdAt)}</span>
                                </div>
                                {/* Move buttons */}
                                <div className="flex items-center gap-1 mt-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                  {prevStage && (
                                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5" onClick={() => handleMoveStage(app.id, prevStage.key)}>
                                      ← {prevStage.label}
                                    </Button>
                                  )}
                                  {nextStage && (
                                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5 ml-auto text-emerald-600 hover:text-emerald-700" onClick={() => handleMoveStage(app.id, nextStage.key)}>
                                      {nextStage.label} →
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                        {stageApps.length === 0 && (
                          <div className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                            No candidates
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {/* Rejected column */}
                {applicationsByStage[rejectedStage.key]?.length > 0 && (
                  <div className="w-72 shrink-0">
                    <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${rejectedStage.bgColor}`}>
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${rejectedStage.dotColor}`} />
                        <span className={`text-sm font-semibold ${rejectedStage.color}`}>{rejectedStage.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{applicationsByStage[rejectedStage.key].length}</Badge>
                    </div>
                    <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
                      {applicationsByStage[rejectedStage.key].map((app) => (
                        <Card key={app.id} className="opacity-60 cursor-pointer hover:shadow-md transition-shadow" onClick={() => openAppDetail(app)}>
                          <CardContent className="p-3">
                            <p className="text-sm font-medium truncate">{app.candidate?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground truncate">{app.job?.title || 'No Job'}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ═══ Candidates Tab ═══════════════════════════════════════════════════ */}
          <TabsContent value="candidates">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name, email, company..." value={candidateSearch} onChange={(e) => setCandidateSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Filter by skills..." value={skillsSearch} onChange={(e) => setSkillsSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Filter by location..." value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="relative w-full sm:w-40">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Experience..." value={experienceSearch} onChange={(e) => setExperienceSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            {candidatesLoading ? (
              <TableSkeleton rows={6} />
            ) : candidates.length === 0 ? (
              <EmptyState icon={UserPlus} title="No candidates found" description="Add candidates or adjust your search filters." action={
                <Button onClick={() => setAddCandidateOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Candidate</Button>
              } />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Skills</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Current Company</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidates.map((cand) => {
                          const skills = parseSkills(cand.skills)
                          return (
                            <TableRow key={cand.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 shrink-0">
                                    {getInitials(cand.name)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{cand.name}</p>
                                    <p className="text-xs text-muted-foreground">{cand.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {skills.slice(0, 3).map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-[10px] py-0">{skill}</Badge>
                                  ))}
                                  {skills.length > 3 && <Badge variant="outline" className="text-[10px] py-0">+{skills.length - 3}</Badge>}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{cand.experience || '—'}</TableCell>
                              <TableCell className="text-sm">{cand.location || '—'}</TableCell>
                              <TableCell className="text-sm">{cand.currentCompany || '—'}</TableCell>
                              <TableCell>
                                {cand.isActive
                                  ? <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Active</Badge>
                                  : <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                                }
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                                  <Eye className="h-3 w-3" /> View
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
          </TabsContent>

          {/* ═══ Applications Tab ═════════════════════════════════════════════════ */}
          <TabsContent value="applications">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {pipelineStages.map(s => (
                    <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                  ))}
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
              </div>
            </div>
            {applicationsLoading ? (
              <TableSkeleton rows={8} />
            ) : filteredApplications.length === 0 ? (
              <EmptyState icon={FileText} title="No applications found" description="Applications will appear when candidates apply for open positions." />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>AI Score</TableHead>
                          <TableHead>Interview Mode</TableHead>
                          <TableHead>Applied</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((app) => {
                          const stage = getStageConfig(app.status)
                          return (
                            <TableRow key={app.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 shrink-0">
                                    {getInitials(app.candidate?.name || '?')}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{app.candidate?.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{app.candidate?.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm">{app.job?.title || '—'}</p>
                                <p className="text-xs text-muted-foreground">{app.job?.department || ''}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <span className={`size-2 rounded-full ${stage.dotColor}`} />
                                  <span className={`text-xs font-medium ${stage.color}`}>{stage.label}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {app.aiFitScore != null ? (
                                  <span className={`inline-flex items-center justify-center rounded-full text-xs font-bold ${getScoreColor(app.aiFitScore)}`} style={{ width: 32, height: 32 }}>
                                    {Math.round(app.aiFitScore)}
                                  </span>
                                ) : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell>
                                {app.interviewMode ? (
                                  <Badge variant="outline" className="text-[10px] gap-1">
                                    {app.interviewMode === 'ai' ? <Brain className="h-2.5 w-2.5" /> : <UserCheck className="h-2.5 w-2.5" />}
                                    {app.interviewMode.toUpperCase()}
                                  </Badge>
                                ) : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatDate(app.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {app.status === 'applied' && (
                                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => handleShortlist(app.id)}>
                                      <ClipboardCheck className="h-3 w-3" /> Shortlist
                                    </Button>
                                  )}
                                  {(app.status === 'shortlisted' || app.status === 'screening') && (
                                    <>
                                      <Select value={app.interviewMode || ''} onValueChange={(mode) => handleSetInterviewMode(app.id, mode)}>
                                        <SelectTrigger className="h-7 w-20 text-[10px]">
                                          <SelectValue placeholder="Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ai"><Brain className="h-3 w-3 mr-1 inline" />AI</SelectItem>
                                          <SelectItem value="human"><UserCheck className="h-3 w-3 mr-1 inline" />Human</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button size="sm" className="h-7 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => openScheduleInterview(app)}>
                                        <Clock className="h-3 w-3" /> Schedule
                                      </Button>
                                    </>
                                  )}
                                  {['interview_round_1', 'interview_round_2'].includes(app.status) && (
                                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => openScheduleInterview(app)}>
                                      <ArrowRight className="h-3 w-3" /> Next Round
                                    </Button>
                                  )}
                                  {app.status.startsWith('interview_round') && !app.offerLetter && (
                                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => openOfferLetter(app)}>
                                      <Send className="h-3 w-3" /> Offer
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1" onClick={() => openAppDetail(app)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
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
          </TabsContent>

          {/* ═══ Interviews Tab ═══════════════════════════════════════════════════ */}
          <TabsContent value="interviews">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Select value={interviewStatusFilter} onValueChange={setInterviewStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
              </div>
            </div>
            {interviewsLoading ? (
              <TableSkeleton rows={6} />
            ) : filteredInterviews.length === 0 ? (
              <EmptyState icon={Brain} title="No interviews found" description="Schedule interviews from the Applications tab." />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Job</TableHead>
                          <TableHead>Round</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Scheduled</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInterviews.map((interview) => (
                          <TableRow key={interview.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 shrink-0">
                                  {getInitials(interview.application?.candidate?.name || '?')}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{interview.application?.candidate?.name || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground">{interview.application?.candidate?.email || ''}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{interview.application?.job?.title || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">R{interview.roundNumber}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {interview.interviewType === 'ai' ? <Brain className="h-3 w-3 text-purple-600" /> : <UserCheck className="h-3 w-3 text-cyan-600" />}
                                <span className="text-xs font-medium">{interview.interviewType === 'ai' ? 'AI' : 'Human'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatDateTime(interview.scheduledAt)}</TableCell>
                            <TableCell>{getInterviewStatusBadge(interview.status)}</TableCell>
                            <TableCell>
                              {interview.score != null ? (
                                <span className={`inline-flex items-center justify-center rounded-full text-xs font-bold ${getScoreColor(interview.score)}`} style={{ width: 32, height: 32 }}>
                                  {Math.round(interview.score)}
                                </span>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {interview.status === 'scheduled' && (
                                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={async () => {
                                    try {
                                      await apiPatch('/api/jobportal/interviews', { id: interview.id, status: 'in_progress' })
                                      refetchInterviews()
                                    } catch (err) { console.error(err) }
                                  }}>
                                    Start
                                  </Button>
                                )}
                                {interview.status === 'in_progress' && (
                                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={async () => {
                                    try {
                                      await apiPatch('/api/jobportal/interviews', { id: interview.id, status: 'completed', completedAt: new Date().toISOString(), score: Math.floor(Math.random() * 30) + 60, recommendation: 'proceed' })
                                      refetchInterviews()
                                    } catch (err) { console.error(err) }
                                  }}>
                                    Complete
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1" onClick={() => { setSelectedInterview(interview); setViewInterviewOpen(true) }}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══ Offers Tab ═══════════════════════════════════════════════════════ */}
          <TabsContent value="offers">
            {offersLoading ? (
              <TableSkeleton rows={5} />
            ) : offers.length === 0 ? (
              <EmptyState icon={Send} title="No offer letters" description="Generate offer letters for candidates who have cleared interviews." />
            ) : (
              <div className="space-y-4">
                {/* Offer Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Draft</p>
                      <p className="text-lg font-bold">{offers.filter(o => o.status === 'draft').length}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-cyan-200 dark:border-cyan-800">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Sent</p>
                      <p className="text-lg font-bold text-cyan-600">{offers.filter(o => o.status === 'sent').length}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Accepted</p>
                      <p className="text-lg font-bold text-emerald-600">{offers.filter(o => o.status === 'accepted').length}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-rose-200 dark:border-rose-800">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Rejected</p>
                      <p className="text-lg font-bold text-rose-600">{offers.filter(o => o.status === 'rejected').length}</p>
                    </CardContent>
                  </Card>
                </div>
                {/* Offer Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Salary</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {offers.map((offer) => (
                            <TableRow key={offer.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 shrink-0">
                                    {getInitials(offer.application?.candidate?.name || '?')}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{offer.application?.candidate?.name || 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground">{offer.application?.candidate?.email || ''}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium">{offer.position}</TableCell>
                              <TableCell className="text-sm">{offer.department || '—'}</TableCell>
                              <TableCell className="text-sm font-medium">{offer.salary ? `₹${Number(offer.salary).toLocaleString('en-IN')}` : '—'}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{formatDate(offer.startDate)}</TableCell>
                              <TableCell>{getOfferStatusBadge(offer.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {offer.status === 'draft' && (
                                    <Button size="sm" className="h-7 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSendOffer(offer.id)}>
                                      <Send className="h-3 w-3" /> Send
                                    </Button>
                                  )}
                                  {offer.status === 'sent' && (
                                    <>
                                      <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => handleAcceptOffer(offer.id, offer.applicationId)}>
                                        <CheckCircle2 className="h-3 w-3" /> Accept
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => handleRejectOffer(offer.id, offer.applicationId)}>
                                        <X className="h-3 w-3" /> Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ═══ Onboarding Tab ═══════════════════════════════════════════════════ */}
          <TabsContent value="onboarding">
            {onboardings.length === 0 ? (
              <EmptyState icon={UserCheck} title="No active onboardings" description="Onboarding will begin when candidates accept their offer letters." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {onboardings.map((ob) => {
                  const checklist = [
                    { label: 'Document Upload', key: 'documentUpload', icon: FileText, done: ob.documentUpload },
                    { label: 'Policy Acknowledgment', key: 'policyAcknowledgment', icon: ClipboardCheck, done: ob.policyAcknowledgment },
                    { label: 'Equipment Setup', key: 'equipmentSetup', icon: Briefcase, done: ob.equipmentSetup },
                    { label: 'Account Creation', key: 'accountCreation', icon: UserPlus, done: ob.accountCreation },
                    { label: 'Orientation Complete', key: 'orientationComplete', icon: CheckCircle2, done: ob.orientationComplete },
                  ]
                  const completed = checklist.filter(c => c.done).length
                  const total = checklist.length
                  const pct = Math.round((completed / total) * 100)
                  return (
                    <Card key={ob.id} className={ob.status === 'completed' ? 'border-emerald-200 dark:border-emerald-800' : ''}>
                      <CardHeader className="pb-3 px-4 pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm">{ob.application?.candidate?.name || 'Unknown'}</CardTitle>
                            <CardDescription className="text-xs">{ob.application?.job?.title || 'N/A'} {ob.application?.job?.department ? `· ${ob.application.job.department}` : ''}</CardDescription>
                          </div>
                          <Badge variant="secondary" className={`text-[10px] shrink-0 ${ob.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : ob.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {ob.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{completed}/{total}</span>
                        </div>
                        <div className="space-y-2">
                          {checklist.map((item) => (
                            <div key={item.key} className="flex items-center gap-2 cursor-pointer group" onClick={() => handleUpdateOnboarding(ob.id, item.key, !item.done)}>
                              <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors shrink-0 ${item.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-muted-foreground/30 group-hover:border-emerald-400'}`}>
                                {item.done && <CheckCircle2 className="h-3 w-3" />}
                              </div>
                              <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className={`text-xs ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.label}</span>
                            </div>
                          ))}
                        </div>
                        {ob.buddyAssigned && (
                          <div className="mt-3 pt-2 border-t">
                            <p className="text-xs text-muted-foreground">Buddy: <span className="font-medium text-foreground">{ob.buddyAssigned}</span></p>
                          </div>
                        )}
                        {ob.startDate && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">Start: <span className="font-medium text-foreground">{formatDate(ob.startDate)}</span></p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ═══ Background Checks Tab ═══════════════════════════════════════════ */}
          <TabsContent value="background">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">{bgChecks.length} background check{bgChecks.length !== 1 ? 's' : ''}</p>
              <Button onClick={() => {
                const hiredApps = applications.filter(a => a.status === 'hired' && !a.backgroundCheck)
                if (hiredApps.length > 0) {
                  setSelectedApp(hiredApps[0])
                  setBgCheckOpen(true)
                }
              }} variant="outline" className="gap-2">
                <Shield className="h-4 w-4" /> New Background Check
              </Button>
            </div>
            {bgChecks.length === 0 ? (
              <EmptyState icon={Shield} title="No background checks" description="Initiate background checks for hired candidates to verify their credentials." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {bgChecks.map((bg) => {
                  const checks = [
                    { label: 'Criminal Check', key: 'criminalCheck', icon: Shield, value: bg.criminalCheck },
                    { label: 'Education Verify', key: 'educationCheck', icon: FileText, value: bg.educationCheck },
                    { label: 'Employment Verify', key: 'employmentCheck', icon: Briefcase, value: bg.employmentCheck },
                    { label: 'Address Verify', key: 'addressCheck', icon: Globe, value: bg.addressCheck },
                    { label: 'Drug Test', key: 'drugTest', icon: ClipboardCheck, value: bg.drugTest },
                  ]
                  const clear = checks.filter(c => c.value === 'clear').length
                  const flagged = checks.filter(c => c.value === 'flagged' || c.value === 'failed').length
                  const pct = Math.round((clear / checks.length) * 100)
                  return (
                    <Card key={bg.id} className={flagged > 0 ? 'border-rose-200 dark:border-rose-800' : clear === checks.length ? 'border-emerald-200 dark:border-emerald-800' : ''}>
                      <CardHeader className="pb-3 px-4 pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm">{bg.application?.candidate?.name || 'Unknown'}</CardTitle>
                            <CardDescription className="text-xs">{bg.application?.job?.title || 'N/A'}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[10px] shrink-0 ${bg.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : bg.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                              {bg.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{clear}/5 clear</span>
                        </div>
                        <div className="space-y-2">
                          {checks.map((check) => (
                            <div key={check.key} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <check.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs">{check.label}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {getCheckStatusBadge(check.value)}
                                {bg.status === 'in_progress' && check.value === 'pending' && (
                                  <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1" onClick={async () => {
                                    const outcomes: string[] = ['clear', 'clear', 'clear', 'flagged', 'clear']
                                    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]
                                    handleUpdateBgCheck(bg.id, check.key, outcome)
                                  }}>
                                    Run
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {bg.vendorName && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">Vendor: {bg.vendorName}</p>}
                        {bg.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {bg.notes}</p>}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══ Add Candidate Dialog ════════════════════════════════════════════════ */}
      <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
            <DialogDescription>Add a new candidate to the job portal</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input placeholder="Full name" value={candForm.name} onChange={(e) => setCandForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" placeholder="email@example.com" value={candForm.email} onChange={(e) => setCandForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="+91 9876543210" value={candForm.phone} onChange={(e) => setCandForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Experience</Label><Input placeholder="5 years" value={candForm.experience} onChange={(e) => setCandForm(f => ({ ...f, experience: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Education</Label><Input placeholder="B.Tech CS" value={candForm.education} onChange={(e) => setCandForm(f => ({ ...f, education: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Current Company</Label><Input placeholder="Company name" value={candForm.currentCompany} onChange={(e) => setCandForm(f => ({ ...f, currentCompany: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Expected Salary</Label><Input placeholder="12 LPA" value={candForm.expectedSalary} onChange={(e) => setCandForm(f => ({ ...f, expectedSalary: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Location</Label><Input placeholder="Bangalore" value={candForm.location} onChange={(e) => setCandForm(f => ({ ...f, location: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Skills (comma-separated)</Label><Input placeholder="React, Node.js, TypeScript" value={candForm.skills} onChange={(e) => setCandForm(f => ({ ...f, skills: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Notice Period</Label><Input placeholder="30 days" value={candForm.noticePeriod} onChange={(e) => setCandForm(f => ({ ...f, noticePeriod: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCandidateOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCandidate} disabled={saving || !candForm.name || !candForm.email} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}Add Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Application Detail Dialog ═══════════════════════════════════════════ */}
      <Dialog open={appDetailOpen} onOpenChange={setAppDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedApp?.candidate?.name || 'Application'}
              <Badge variant="outline" className="text-[10px]">{selectedApp?.status?.replace(/_/g, ' ')}</Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedApp?.job?.title || 'No Job'} {selectedApp?.job?.department ? `· ${selectedApp.job.department}` : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              {/* Pipeline Progress */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Pipeline Progress</Label>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {pipelineStages.map((stage, i) => {
                    const isActive = stage.key === selectedApp.status
                    const isPast = pipelineStages.findIndex(s => s.key === selectedApp.status) > i
                    return (
                      <div key={stage.key} className="flex items-center shrink-0">
                        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium whitespace-nowrap ${isActive ? stage.bgColor + ' ' + stage.color : isPast ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                          {isPast ? <CheckCircle2 className="h-3 w-3" /> : <span className={`size-1.5 rounded-full ${isActive ? stage.dotColor : 'bg-muted-foreground/30'}`} />}
                          {stage.label}
                        </div>
                        {i < pipelineStages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 mx-0.5 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Candidate Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{selectedApp.candidate?.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm">{selectedApp.candidate?.phone || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Experience</p><p className="text-sm">{selectedApp.candidate?.experience || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm">{selectedApp.candidate?.location || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">AI Fit Score</p><p className="text-sm">{selectedApp.aiFitScore != null ? `${Math.round(selectedApp.aiFitScore)}%` : '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Interview Mode</p><p className="text-sm">{selectedApp.interviewMode ? selectedApp.interviewMode.toUpperCase() : '—'}</p></div>
              </div>

              {/* Skills */}
              {selectedApp.candidate?.skills && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Skills</Label>
                  <div className="flex flex-wrap gap-1">
                    {parseSkills(selectedApp.candidate.skills).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Cover Letter</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedApp.coverLetter}</p>
                </div>
              )}

              {/* Interviews */}
              {selectedApp.interviews && selectedApp.interviews.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Interview Rounds</Label>
                  <div className="space-y-2">
                    {selectedApp.interviews.map((interview, i) => (
                      <div key={interview.id} className="flex items-center gap-3 p-2 rounded-lg border">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getScoreColor(interview.score || 0)}`}>
                          R{interview.roundNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Round {interview.roundNumber}</span>
                            {getInterviewStatusBadge(interview.status)}
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              {interview.interviewType === 'ai' ? <Brain className="h-2.5 w-2.5" /> : <UserCheck className="h-2.5 w-2.5" />}
                              {interview.interviewType.toUpperCase()}
                            </Badge>
                          </div>
                          {interview.score != null && <p className="text-xs text-muted-foreground">Score: {interview.score} · {interview.recommendation || ''}</p>}
                          {interview.feedback && <p className="text-xs text-muted-foreground truncate">{interview.feedback}</p>}
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDateTime(interview.completedAt || interview.scheduledAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {selectedApp.status === 'applied' && (
                  <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { handleShortlist(selectedApp.id); setAppDetailOpen(false) }}>
                    <ClipboardCheck className="h-4 w-4" /> Shortlist
                  </Button>
                )}
                {(selectedApp.status === 'shortlisted' || selectedApp.status === 'screening') && (
                  <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setAppDetailOpen(false); openScheduleInterview(selectedApp) }}>
                    <Clock className="h-4 w-4" /> Schedule Interview
                  </Button>
                )}
                {selectedApp.status.startsWith('interview_round') && !selectedApp.offerLetter && (
                  <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { setAppDetailOpen(false); openOfferLetter(selectedApp) }}>
                    <Send className="h-4 w-4" /> Generate Offer
                  </Button>
                )}
                {selectedApp.status === 'offered' && !selectedApp.onboarding && (
                  <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={async () => {
                    try {
                      await apiPost('/api/jobportal/onboarding', { applicationId: selectedApp.id, status: 'pending' })
                      await apiPatch(`/api/jobportal/applications/${selectedApp.id}`, { status: 'hired' })
                      refetchApplications()
                      refetchOnboardings()
                      setAppDetailOpen(false)
                    } catch (err) { console.error(err) }
                  }}>
                    <UserCheck className="h-4 w-4" /> Initiate Onboarding
                  </Button>
                )}
                {selectedApp.status === 'hired' && !selectedApp.backgroundCheck && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => { setAppDetailOpen(false); openBgCheck(selectedApp) }}>
                    <Shield className="h-4 w-4" /> Initiate Background Check
                  </Button>
                )}
                {!['hired', 'rejected'].includes(selectedApp.status) && (
                  <Button size="sm" variant="outline" className="gap-1 border-rose-300 text-rose-600 hover:bg-rose-50" onClick={() => { handleMoveStage(selectedApp.id, 'rejected'); setAppDetailOpen(false) }}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Schedule Interview Dialog ═══════════════════════════════════════════ */}
      <Dialog open={scheduleInterviewOpen} onOpenChange={setScheduleInterviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              {selectedApp?.candidate?.name} for {selectedApp?.job?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Round Number</Label>
              <Select value={String(interviewForm.roundNumber)} onValueChange={(v) => setInterviewForm(f => ({ ...f, roundNumber: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Round 1</SelectItem>
                  <SelectItem value="2">Round 2</SelectItem>
                  <SelectItem value="3">Round 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select value={interviewForm.interviewType} onValueChange={(v) => setInterviewForm(f => ({ ...f, interviewType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai"><Brain className="h-4 w-4 mr-2 inline" />AI Interview</SelectItem>
                  <SelectItem value="human"><UserCheck className="h-4 w-4 mr-2 inline" />Human Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date &amp; Time</Label>
              <Input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm(f => ({ ...f, scheduledAt: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleInterviewOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleInterview} disabled={schedulingInterview} className="bg-emerald-600 hover:bg-emerald-700">
              {schedulingInterview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Generate Offer Letter Dialog ═══════════════════════════════════════ */}
      <Dialog open={offerLetterOpen} onOpenChange={setOfferLetterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Offer Letter</DialogTitle>
            <DialogDescription>
              {selectedApp?.candidate?.name} for {selectedApp?.job?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Position *</Label>
              <Input placeholder="Job title" value={offerForm.position} onChange={(e) => setOfferForm(f => ({ ...f, position: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input placeholder="Department" value={offerForm.department} onChange={(e) => setOfferForm(f => ({ ...f, department: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Annual Salary (₹)</Label>
              <Input type="number" placeholder="1200000" value={offerForm.salary} onChange={(e) => setOfferForm(f => ({ ...f, salary: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={offerForm.startDate} onChange={(e) => setOfferForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferLetterOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOffer} disabled={creatingOffer || !offerForm.position} className="bg-emerald-600 hover:bg-emerald-700">
              {creatingOffer ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ View Interview Results Dialog ══════════════════════════════════════ */}
      <Dialog open={viewInterviewOpen} onOpenChange={setViewInterviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Results</DialogTitle>
            <DialogDescription>
              Round {selectedInterview?.roundNumber} · {selectedInterview?.interviewType === 'ai' ? 'AI' : 'Human'} Interview
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Status</p>{getInterviewStatusBadge(selectedInterview.status)}</div>
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  {selectedInterview.score != null ? (
                    <span className={`inline-flex items-center justify-center rounded-full text-sm font-bold ${getScoreColor(selectedInterview.score)}`} style={{ width: 36, height: 36 }}>
                      {selectedInterview.score}
                    </span>
                  ) : <span className="text-sm">—</span>}
                </div>
                <div><p className="text-xs text-muted-foreground">Scheduled</p><p className="text-sm">{formatDateTime(selectedInterview.scheduledAt)}</p></div>
                <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-sm">{formatDateTime(selectedInterview.completedAt)}</p></div>
              </div>
              {selectedInterview.recommendation && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
                  <Badge className={selectedInterview.recommendation === 'proceed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}>
                    {selectedInterview.recommendation === 'proceed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {selectedInterview.recommendation}
                  </Badge>
                </div>
              )}
              {selectedInterview.feedback && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Feedback</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selectedInterview.feedback}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Background Check Initiate Dialog ═══════════════════════════════════ */}
      <Dialog open={bgCheckOpen} onOpenChange={setBgCheckOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Initiate Background Check</DialogTitle>
            <DialogDescription>
              {selectedApp?.candidate?.name} for {selectedApp?.job?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Verification Vendor</Label>
              <Input placeholder="e.g. HireRight, Sterling" value={bgCheckForm.vendorName} onChange={(e) => setBgCheckForm(f => ({ ...f, vendorName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes..." value={bgCheckForm.notes} onChange={(e) => setBgCheckForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium mb-2">The following checks will be initiated:</p>
              <div className="grid grid-cols-2 gap-1">
                {['Criminal Check', 'Education Verify', 'Employment Verify', 'Address Verify', 'Drug Test'].map(check => (
                  <div key={check} className="flex items-center gap-1.5 text-xs">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    {check}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBgCheckOpen(false)}>Cancel</Button>
            <Button onClick={handleInitiateBgCheck} disabled={initiatingBgCheck} className="bg-emerald-600 hover:bg-emerald-700">
              {initiatingBgCheck ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Initiate Check
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
