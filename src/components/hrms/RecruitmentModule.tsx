'use client'

import { useState, useEffect } from 'react'
import {
  Briefcase,
  FileText,
  Users,
  Calendar,
  Mail,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  XCircle,
  ChevronRight,
  Star,
  IndianRupee,
  Send,
  ChevronLeft,
  MapPin,
  Building2,
  GraduationCap,
  Target,
  CalendarDays,
  UserCircle,
  FileCheck,
  Edit,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Requisition {
  id: string
  title: string
  department: string
  positions: number
  experience: string
  skills: string[]
  budget: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  expectedJoinDate: string
  hiringManager: string
  status: 'draft' | 'manager-approved' | 'hr-approved' | 'budget-approved' | 'rejected' | 'fulfilled'
  requestedBy: string
  requestedDate: string
  justification: string
}

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  experience: string
  salary: string
  status: 'active' | 'paused' | 'closed'
  postedDate: string
  applicants: number
  requisitionId: string
  skills: string[]
  description: string
  requirements: string
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  experience: number
  currentCompany: string
  skills: string[]
  aiScore: number
  stage: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected'
  appliedDate: string
  source: string
  rating: number
}

interface Interview {
  id: string
  candidateId: string
  candidateName: string
  position: string
  date: string
  time: string
  type: 'phone' | 'video' | 'onsite' | 'technical'
  interviewer: string
  status: 'scheduled' | 'completed' | 'cancelled'
  feedback: string
  result: 'pass' | 'fail' | 'pending'
}

interface OfferLetter {
  id: string
  candidateId: string
  candidateName: string
  position: string
  salary: string
  startDate: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  sentDate: string | null
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const initialRequisitions: Requisition[] = [
  { id: 'REQ001', title: 'Senior Full-Stack Developer', department: 'Engineering', positions: 3, experience: '5-8 years', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], budget: '₹18-25 LPA', priority: 'urgent', expectedJoinDate: '2026-06-15', hiringManager: 'Rahul M.', status: 'budget-approved', requestedBy: 'Rahul M.', requestedDate: '2026-05-01', justification: 'Critical project delivery requires additional senior resources' },
  { id: 'REQ002', title: 'Marketing Lead', department: 'Marketing', positions: 1, experience: '8-12 years', skills: ['Digital Marketing', 'Brand Strategy', 'Team Leadership'], budget: '₹15-20 LPA', priority: 'high', expectedJoinDate: '2026-07-01', hiringManager: 'Sneha R.', status: 'manager-approved', requestedBy: 'Sneha R.', requestedDate: '2026-05-10', justification: 'Need leadership for Q3 marketing campaign expansion' },
  { id: 'REQ003', title: 'Financial Analyst', department: 'Finance', positions: 2, experience: '2-4 years', skills: ['Financial Modeling', 'Excel', 'SAP', 'Python'], budget: '₹8-12 LPA', priority: 'medium', expectedJoinDate: '2026-07-15', hiringManager: 'Deepak T.', status: 'hr-approved', requestedBy: 'Deepak T.', requestedDate: '2026-05-05', justification: 'Growing financial reporting requirements for compliance' },
]

const initialJobPostings: JobPosting[] = [
  { id: 'JP001', title: 'Senior Full-Stack Developer', department: 'Engineering', location: 'Bangalore / Remote', type: 'Full-time', experience: '5-8 years', salary: '₹18-25 LPA', status: 'active', postedDate: '2026-05-05', applicants: 28, requisitionId: 'REQ001', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], description: 'We are looking for an experienced Full-Stack Developer to join our engineering team and help build scalable web applications.', requirements: '5+ years in full-stack development, strong React & Node.js skills, experience with cloud platforms, excellent problem-solving ability.' },
  { id: 'JP002', title: 'DevOps Engineer', department: 'Engineering', location: 'Bangalore', type: 'Full-time', experience: '3-5 years', salary: '₹14-20 LPA', status: 'active', postedDate: '2026-05-08', applicants: 15, requisitionId: 'REQ001', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], description: 'Seeking a DevOps Engineer to automate deployment pipelines and manage cloud infrastructure.', requirements: '3+ years DevOps experience, AWS certification preferred, strong CI/CD and containerization skills.' },
  { id: 'JP003', title: 'UI/UX Designer', department: 'Engineering', location: 'Remote', type: 'Full-time', experience: '3-6 years', salary: '₹12-18 LPA', status: 'active', postedDate: '2026-05-10', applicants: 22, requisitionId: 'REQ001', skills: ['Figma', 'User Research', 'Design Systems'], description: 'Looking for a creative UI/UX Designer to craft intuitive user experiences for our products.', requirements: '3+ years in product design, strong Figma skills, portfolio demonstrating user-centered design process.' },
  { id: 'JP004', title: 'Financial Analyst', department: 'Finance', location: 'Mumbai', type: 'Full-time', experience: '2-4 years', salary: '₹8-12 LPA', status: 'active', postedDate: '2026-05-12', applicants: 18, requisitionId: 'REQ003', skills: ['Financial Modeling', 'Excel', 'SAP'], description: 'Seeking a Financial Analyst to support our growing financial reporting and compliance needs.', requirements: '2+ years in financial analysis, strong Excel and modeling skills, SAP experience preferred.' },
  { id: 'JP005', title: 'Content Writer', department: 'Marketing', location: 'Remote', type: 'Part-time', experience: '1-3 years', salary: '₹5-8 LPA', status: 'paused', postedDate: '2026-05-15', applicants: 35, requisitionId: 'REQ002', skills: ['SEO', 'Copywriting', 'Social Media'], description: 'Looking for a creative Content Writer to produce engaging content across our digital channels.', requirements: '1+ year content writing, SEO knowledge, experience with social media content strategies.' },
]

const initialCandidates: Candidate[] = [
  { id: 'CAN001', name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '+91 98765 11111', position: 'Senior Full-Stack Developer', experience: 6, currentCompany: 'Infosys', skills: ['React', 'Node.js', 'TypeScript', 'AWS'], aiScore: 92, stage: 'interview', appliedDate: '2026-05-06', source: 'LinkedIn', rating: 4 },
  { id: 'CAN002', name: 'Nisha Kapoor', email: 'nisha.k@gmail.com', phone: '+91 98765 22222', position: 'Senior Full-Stack Developer', experience: 7, currentCompany: 'TCS', skills: ['React', 'Java', 'Spring Boot', 'MySQL'], aiScore: 87, stage: 'screening', appliedDate: '2026-05-07', source: 'Naukri', rating: 4 },
  { id: 'CAN003', name: 'Ravi Teja', email: 'ravi.teja@gmail.com', phone: '+91 98765 33333', position: 'DevOps Engineer', experience: 4, currentCompany: 'Wipro', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], aiScore: 85, stage: 'interview', appliedDate: '2026-05-09', source: 'Referral', rating: 3 },
  { id: 'CAN004', name: 'Sneha Gupta', email: 'sneha.g@gmail.com', phone: '+91 98765 44444', position: 'UI/UX Designer', experience: 5, currentCompany: 'Flipkart', skills: ['Figma', 'User Research', 'Prototyping', 'CSS'], aiScore: 94, stage: 'offered', appliedDate: '2026-05-11', source: 'LinkedIn', rating: 5 },
  { id: 'CAN005', name: 'Karthik Rajan', email: 'karthik.r@gmail.com', phone: '+91 98765 55555', position: 'Senior Full-Stack Developer', experience: 8, currentCompany: 'Amazon', skills: ['React', 'Node.js', 'Python', 'PostgreSQL'], aiScore: 89, stage: 'applied', appliedDate: '2026-05-12', source: 'Direct', rating: 4 },
  { id: 'CAN006', name: 'Divya Iyer', email: 'divya.i@gmail.com', phone: '+91 98765 66666', position: 'Financial Analyst', experience: 3, currentCompany: 'Deloitte', skills: ['Financial Modeling', 'Excel', 'SAP', 'Python'], aiScore: 78, stage: 'screening', appliedDate: '2026-05-13', source: 'Naukri', rating: 3 },
  { id: 'CAN007', name: 'Amit Verma', email: 'amit.v@gmail.com', phone: '+91 98765 77777', position: 'DevOps Engineer', experience: 2, currentCompany: 'Startup', skills: ['Docker', 'CI/CD', 'Linux', 'Bash'], aiScore: 65, stage: 'rejected', appliedDate: '2026-05-09', source: 'Naukri', rating: 2 },
  { id: 'CAN008', name: 'Pooja Reddy', email: 'pooja.r@gmail.com', phone: '+91 98765 88888', position: 'UI/UX Designer', experience: 4, currentCompany: 'Swiggy', skills: ['Figma', 'Sketch', 'User Testing'], aiScore: 72, stage: 'applied', appliedDate: '2026-05-14', source: 'LinkedIn', rating: 3 },
  { id: 'CAN009', name: 'Manish Kumar', email: 'manish.k@gmail.com', phone: '+91 98765 99999', position: 'Financial Analyst', experience: 2, currentCompany: 'EY', skills: ['Financial Analysis', 'Excel', 'Power BI'], aiScore: 71, stage: 'interview', appliedDate: '2026-05-14', source: 'Referral', rating: 3 },
  { id: 'CAN010', name: 'Tanvi Sharma', email: 'tanvi.s@gmail.com', phone: '+91 98765 00000', position: 'Content Writer', experience: 3, currentCompany: 'Freelance', skills: ['SEO', 'Copywriting', 'WordPress', 'Analytics'], aiScore: 80, stage: 'screening', appliedDate: '2026-05-16', source: 'Direct', rating: 4 },
]

const initialInterviews: Interview[] = [
  { id: 'IV001', candidateId: 'CAN001', candidateName: 'Arjun Mehta', position: 'Senior Full-Stack Developer', date: '2026-05-22', time: '10:00 AM', type: 'technical', interviewer: 'Rahul M.', status: 'scheduled', feedback: '', result: 'pending' },
  { id: 'IV002', candidateId: 'CAN003', candidateName: 'Ravi Teja', position: 'DevOps Engineer', date: '2026-05-23', time: '2:00 PM', type: 'video', interviewer: 'IT Lead', status: 'scheduled', feedback: '', result: 'pending' },
  { id: 'IV003', candidateId: 'CAN004', candidateName: 'Sneha Gupta', position: 'UI/UX Designer', date: '2026-05-20', time: '11:00 AM', type: 'onsite', interviewer: 'Design Head', status: 'completed', feedback: 'Excellent design sense, great portfolio presentation', result: 'pass' },
  { id: 'IV004', candidateId: 'CAN009', candidateName: 'Manish Kumar', position: 'Financial Analyst', date: '2026-05-24', time: '3:00 PM', type: 'video', interviewer: 'Finance Lead', status: 'scheduled', feedback: '', result: 'pending' },
  { id: 'IV005', candidateId: 'CAN002', candidateName: 'Nisha Kapoor', position: 'Senior Full-Stack Developer', date: '2026-05-25', time: '11:00 AM', type: 'phone', interviewer: 'HR Team', status: 'scheduled', feedback: '', result: 'pending' },
]

const initialOffers: OfferLetter[] = [
  { id: 'OF001', candidateId: 'CAN004', candidateName: 'Sneha Gupta', position: 'UI/UX Designer', salary: '₹16 LPA', startDate: '2026-06-15', status: 'sent', sentDate: '2026-05-21' },
  { id: 'OF002', candidateId: 'CAN001', candidateName: 'Arjun Mehta', position: 'Senior Full-Stack Developer', salary: '₹22 LPA', startDate: '2026-06-20', status: 'draft', sentDate: null },
  { id: 'OF003', candidateId: 'CAN003', candidateName: 'Ravi Teja', position: 'DevOps Engineer', salary: '₹18 LPA', startDate: '2026-07-01', status: 'accepted', sentDate: '2026-05-19' },
]

function getPriorityBadge(priority: string) {
  const config: Record<string, { label: string; className: string }> = {
    urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-200' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { label: 'Low', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  }
  const cfg = config[priority] || config.medium
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getReqStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    'manager-approved': { label: 'Manager Approved', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    'hr-approved': { label: 'HR Approved', className: 'bg-violet-100 text-violet-700 border-violet-200' },
    'budget-approved': { label: 'Budget Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
    fulfilled: { label: 'Fulfilled', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }
  const cfg = config[status] || config.draft
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getStageBadge(stage: string) {
  const config: Record<string, { label: string; className: string }> = {
    applied: { label: 'Applied', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    screening: { label: 'Screening', className: 'bg-violet-100 text-violet-700 border-violet-200' },
    interview: { label: 'Interview', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    offered: { label: 'Offered', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    hired: { label: 'Hired', className: 'bg-emerald-200 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const cfg = config[stage] || config.applied
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getJobStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    paused: { label: 'Paused', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    closed: { label: 'Closed', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  }
  const cfg = config[status] || config.active
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getOfferStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    sent: { label: 'Sent', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    accepted: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const cfg = config[status] || config.draft
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getInterviewStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Scheduled', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  }
  const cfg = config[status] || config.scheduled
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getAiScoreColor(score: number) {
  if (score >= 85) return 'text-emerald-600'
  if (score >= 70) return 'text-amber-600'
  return 'text-red-600'
}

function getAiScoreBg(score: number) {
  if (score >= 85) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (score >= 70) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

// Requisition approval flow
const reqApprovalFlow = ['draft', 'manager-approved', 'hr-approved', 'budget-approved']

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecruitmentModule() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [localTab, setLocalTab] = useState('requisitions')
  const [requisitions, setRequisitions] = useState<Requisition[]>(initialRequisitions)
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(initialJobPostings)
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews)
  const [offers, setOffers] = useState<OfferLetter[]>(initialOffers)
  const [searchQuery, setSearchQuery] = useState('')
  const [addReqOpen, setAddReqOpen] = useState(false)
  const [addJobOpen, setAddJobOpen] = useState(false)
  const [scheduleInterviewOpen, setScheduleInterviewOpen] = useState(false)
  const [candidateDetail, setCandidateDetail] = useState<Candidate | null>(null)
  const [reqForm, setReqForm] = useState({ title: '', department: '', positions: 1, experience: '', skills: '', budget: '', priority: 'medium' as Requisition['priority'], expectedJoinDate: '', hiringManager: '', justification: '' })
  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', type: 'Full-time' as JobPosting['type'], experience: '', salary: '', skills: '', description: '', requirements: '' })
  const [interviewForm, setInterviewForm] = useState({ candidateId: '', date: '', time: '', type: 'video' as Interview['type'], interviewer: '' })

  const tabMap: Record<string, string> = { 'requisitions': 'requisitions', 'postings': 'job-postings', 'candidates': 'candidate-pool', 'interviews': 'interview-schedule', 'offers': 'offer-letters' }

  // Sync sidebar sub-item to local tab and clear it
  useEffect(() => {
    if (activeSubItem && tabMap[activeSubItem]) {
      setLocalTab(tabMap[activeSubItem])
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // Derive active tab: sidebar sub-item takes priority, then local tab
  const activeTab = (activeSubItem && tabMap[activeSubItem]) || localTab

  const handleTabChange = (tab: string) => {
    setLocalTab(tab)
    setActiveSubItem(null)
  }

  const totalCandidates = candidates.length
  const activePostings = jobPostings.filter(j => j.status === 'active').length
  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled').length
  const pendingOffers = offers.filter(o => o.status === 'sent' || o.status === 'draft').length

  function handleAddRequisition() {
    const newReq: Requisition = {
      id: `REQ${String(requisitions.length + 1).padStart(3, '0')}`,
      title: reqForm.title,
      department: reqForm.department,
      positions: reqForm.positions,
      experience: reqForm.experience,
      skills: reqForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      budget: reqForm.budget,
      priority: reqForm.priority,
      expectedJoinDate: reqForm.expectedJoinDate,
      hiringManager: reqForm.hiringManager,
      status: 'draft',
      requestedBy: 'Current User',
      requestedDate: new Date().toISOString().split('T')[0],
      justification: reqForm.justification,
    }
    setRequisitions(prev => [...prev, newReq])
    setAddReqOpen(false)
    setReqForm({ title: '', department: '', positions: 1, experience: '', skills: '', budget: '', priority: 'medium', expectedJoinDate: '', hiringManager: '', justification: '' })
  }

  function handleAdvanceRequisition(id: string) {
    setRequisitions(prev => prev.map(r => {
      if (r.id !== id) return r
      const currentIdx = reqApprovalFlow.indexOf(r.status)
      if (currentIdx < reqApprovalFlow.length - 1) return { ...r, status: reqApprovalFlow[currentIdx + 1] }
      return r
    }))
  }

  function handleAddJob() {
    const newJob: JobPosting = {
      id: `JP${String(jobPostings.length + 1).padStart(3, '0')}`,
      title: jobForm.title,
      department: jobForm.department,
      location: jobForm.location,
      type: jobForm.type,
      experience: jobForm.experience,
      salary: jobForm.salary,
      status: 'active',
      postedDate: new Date().toISOString().split('T')[0],
      applicants: 0,
      requisitionId: '',
      skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      description: jobForm.description,
      requirements: jobForm.requirements,
    }
    setJobPostings(prev => [...prev, newJob])
    setAddJobOpen(false)
    setJobForm({ title: '', department: '', location: '', type: 'Full-time', experience: '', salary: '', skills: '', description: '', requirements: '' })
  }

  function handleScheduleInterview() {
    const candidate = candidates.find(c => c.id === interviewForm.candidateId)
    if (!candidate) return
    const newInterview: Interview = {
      id: `IV${String(interviews.length + 1).padStart(3, '0')}`,
      candidateId: interviewForm.candidateId,
      candidateName: candidate.name,
      position: candidate.position,
      date: interviewForm.date,
      time: interviewForm.time,
      type: interviewForm.type,
      interviewer: interviewForm.interviewer,
      status: 'scheduled',
      feedback: '',
      result: 'pending',
    }
    setInterviews(prev => [...prev, newInterview])
    setCandidates(prev => prev.map(c => c.id === interviewForm.candidateId ? { ...c, stage: 'interview' } : c))
    setScheduleInterviewOpen(false)
    setInterviewForm({ candidateId: '', date: '', time: '', type: 'video', interviewer: '' })
  }

  function handleAdvanceCandidate(candidateId: string) {
    const stages: Candidate['stage'][] = ['applied', 'screening', 'interview', 'offered', 'hired']
    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c
      const currentIdx = stages.indexOf(c.stage)
      if (currentIdx < stages.length - 1) return { ...c, stage: stages[currentIdx + 1] }
      return c
    }))
  }

  function handleRejectCandidate(candidateId: string) {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: 'rejected' } : c))
  }

  function handleGenerateOffer(candidateId: string) {
    const candidate = candidates.find(c => c.id === candidateId)
    if (!candidate) return
    const newOffer: OfferLetter = {
      id: `OF${String(offers.length + 1).padStart(3, '0')}`,
      candidateId,
      candidateName: candidate.name,
      position: candidate.position,
      salary: 'Competitive',
      startDate: '',
      status: 'draft',
      sentDate: null,
    }
    setOffers(prev => [...prev, newOffer])
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: 'offered' } : c))
  }

  function handleSendOffer(offerId: string) {
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'sent', sentDate: new Date().toISOString().split('T')[0] } : o))
  }

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Interview calendar helpers
  const interviewDates = [...new Set(interviews.filter(i => i.status === 'scheduled').map(i => i.date))].sort()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Briefcase className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Recruitment ATS
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]"><Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI</Badge>
              </h1>
              <p className="text-muted-foreground text-sm">{totalCandidates} candidates · {activePostings} active jobs · {scheduledInterviews} interviews</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search candidates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-9 w-full pl-9 sm:w-[200px]" />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Card className="border-l-4 border-l-violet-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Requisitions</p><p className="text-2xl font-bold">{requisitions.length}</p></CardContent></Card>
          <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active Jobs</p><p className="text-2xl font-bold">{activePostings}</p></CardContent></Card>
          <Card className="border-l-4 border-l-sky-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Candidates</p><p className="text-2xl font-bold">{totalCandidates}</p></CardContent></Card>
          <Card className="border-l-4 border-l-amber-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Interviews</p><p className="text-2xl font-bold">{scheduledInterviews}</p></CardContent></Card>
          <Card className="border-l-4 border-l-pink-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending Offers</p><p className="text-2xl font-bold">{pendingOffers}</p></CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setLocalTab}>
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="requisitions" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Requisitions</TabsTrigger>
            <TabsTrigger value="job-postings" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Job Postings</TabsTrigger>
            <TabsTrigger value="candidate-pool" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Candidates</TabsTrigger>
            <TabsTrigger value="interview-schedule" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Interviews</TabsTrigger>
            <TabsTrigger value="offer-letters" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> Offers</TabsTrigger>
          </TabsList>

          {/* ─── Requisitions Tab ─────────────────────────────────────────── */}
          <TabsContent value="requisitions">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setAddReqOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4" /> New Requisition</Button>
            </div>
            <div className="space-y-4">
              {requisitions.map(req => {
                const flowIdx = reqApprovalFlow.indexOf(req.status)
                return (
                  <Card key={req.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                            <FileText className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{req.title}</p>
                            <p className="text-sm text-muted-foreground">{req.department} · {req.positions} position(s) · {req.experience}</p>
                            <p className="text-xs text-muted-foreground mt-1">{req.justification}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {req.skills.map(s => (
                                <Badge key={s} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{s}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {req.budget}</span>
                              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Join by: {req.expectedJoinDate}</span>
                              <span className="flex items-center gap-1"><UserCircle className="h-3 w-3" /> Manager: {req.hiringManager}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(req.priority)}
                            {getReqStatusBadge(req.status)}
                          </div>
                          {/* Approval Flow Progress */}
                          <div className="flex items-center gap-1">
                            {reqApprovalFlow.map((step, idx) => (
                              <div key={step} className="flex items-center gap-1">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${idx <= flowIdx ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                  {idx <= flowIdx ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                                </div>
                                {idx < reqApprovalFlow.length - 1 && (
                                  <div className={`h-0.5 w-4 ${idx < flowIdx ? 'bg-emerald-600' : 'bg-muted'}`} />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <span>Draft</span><span>→</span><span>Mgr</span><span>→</span><span>HR</span><span>→</span><span>Budget</span>
                          </div>
                          {flowIdx < reqApprovalFlow.length - 1 && req.status !== 'rejected' && req.status !== 'fulfilled' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600 mt-1" onClick={() => handleAdvanceRequisition(req.id)}>
                              <CheckCircle2 className="h-3 w-3" /> Advance
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* ─── Job Postings Tab ─────────────────────────────────────────── */}
          <TabsContent value="job-postings">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setAddJobOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4" /> New Job Posting</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobPostings.map(job => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.department} · {job.location}</p>
                      </div>
                      {getJobStatusBadge(job.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div><span className="text-muted-foreground">Type:</span> {job.type}</div>
                      <div><span className="text-muted-foreground">Exp:</span> {job.experience}</div>
                      <div><span className="text-muted-foreground">Salary:</span> {job.salary}</div>
                      <div><span className="text-muted-foreground">Posted:</span> {job.postedDate}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{skill}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {job.applicants} applicants</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><Eye className="h-3 w-3" /> View</Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><Edit className="h-3 w-3" /> Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── Candidate Pool Tab ───────────────────────────────────────── */}
          <TabsContent value="candidate-pool">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="hidden md:table-cell">Experience</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="hidden lg:table-cell">Source</TableHead>
                        <TableHead className="text-right">Quick Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCandidates.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No candidates found</TableCell></TableRow>
                      ) : filteredCandidates.map(candidate => (
                        <TableRow key={candidate.id} className="group">
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{candidate.name}</p>
                                <p className="text-xs text-muted-foreground">{candidate.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm max-w-[150px] truncate">{candidate.position}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{candidate.experience} yrs · {candidate.currentCompany}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[11px] font-bold ${getAiScoreBg(candidate.aiScore)}`}>
                              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> {candidate.aiScore}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStageBadge(candidate.stage)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">{candidate.source}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setCandidateDetail(candidate)}><Eye className="h-3 w-3" /> View</Button>
                              {candidate.stage !== 'hired' && candidate.stage !== 'rejected' && candidate.stage !== 'offered' && (
                                <>
                                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-sky-600" onClick={() => { setInterviewForm({ ...interviewForm, candidateId: candidate.id }); setScheduleInterviewOpen(true) }}><Calendar className="h-3 w-3" /> Interview</Button>
                                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-emerald-600" onClick={() => handleGenerateOffer(candidate.id)}><Mail className="h-3 w-3" /> Offer</Button>
                                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-red-600" onClick={() => handleRejectCandidate(candidate.id)}><XCircle className="h-3 w-3" /> Reject</Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Interview Schedule Tab ───────────────────────────────────── */}
          <TabsContent value="interview-schedule">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setScheduleInterviewOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4" /> Schedule Interview</Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Calendar View */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-600" /> Interview Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interviewDates.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-sm">No scheduled interviews</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {interviewDates.map(date => (
                          <div key={date}>
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarDays className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-semibold">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <Badge variant="outline" className="text-[10px]">{interviews.filter(i => i.date === date && i.status === 'scheduled').length} interview(s)</Badge>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {interviews.filter(i => i.date === date && i.status === 'scheduled').map(iv => (
                                <Card key={iv.id} className="border-l-4 border-l-emerald-400">
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="text-sm font-medium">{iv.candidateName}</p>
                                        <p className="text-xs text-muted-foreground">{iv.position}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {iv.time}</span>
                                          <Badge variant="outline" className="text-[10px]">{iv.type}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Interviewer: {iv.interviewer}</p>
                                      </div>
                                      {getInterviewStatusBadge(iv.status)}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Completed interviews */}
                    {interviews.filter(i => i.status === 'completed').length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Completed</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {interviews.filter(i => i.status === 'completed').map(iv => (
                            <Card key={iv.id} className="border-l-4 border-l-gray-300 opacity-75">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{iv.candidateName}</p>
                                    <p className="text-xs text-muted-foreground">{iv.position} · {iv.date}</p>
                                    {iv.feedback && <p className="text-xs text-muted-foreground mt-1 italic">"{iv.feedback}"</p>}
                                  </div>
                                  {iv.result === 'pass' ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Pass</Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-700 text-[10px]">Fail</Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Interview Pipeline</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Scheduled</span>
                      <span className="font-bold text-sky-600">{interviews.filter(i => i.status === 'scheduled').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-bold text-emerald-600">{interviews.filter(i => i.status === 'completed').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pass Rate</span>
                      <span className="font-bold">{interviews.filter(i => i.result === 'pass').length}/{interviews.filter(i => i.result !== 'pending').length}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">By Type</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {(['technical', 'video', 'onsite', 'phone'] as const).map(type => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{type}</span>
                        <span className="font-medium">{interviews.filter(i => i.type === type).length}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── Offer Letters Tab ────────────────────────────────────────── */}
          <TabsContent value="offer-letters">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead className="hidden sm:table-cell">Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No offers yet. Generate one from the candidate pool.</TableCell></TableRow>
                      ) : offers.map(offer => (
                        <TableRow key={offer.id}>
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                {offer.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium">{offer.candidateName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{offer.position}</TableCell>
                          <TableCell className="text-sm font-semibold">{offer.salary}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{offer.startDate || '—'}</TableCell>
                          <TableCell>{getOfferStatusBadge(offer.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {offer.status === 'draft' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleSendOffer(offer.id)}>
                                  <Send className="h-3 w-3" /> Send
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="h-3 w-3" /> View</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Generate Offer Section */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><FileCheck className="h-4 w-4 text-emerald-600" /> Generate New Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Select a candidate who has passed the interview to generate an offer letter.</p>
                <div className="flex flex-wrap gap-2">
                  {candidates.filter(c => c.stage === 'interview').map(c => (
                    <Button key={c.id} variant="outline" size="sm" className="gap-2" onClick={() => handleGenerateOffer(c.id)}>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-semibold text-emerald-700">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      {c.name}
                      <Badge variant="outline" className={`text-[9px] ${getAiScoreBg(c.aiScore)}`}><Sparkles className="h-2 w-2" /> {c.aiScore}</Badge>
                    </Button>
                  ))}
                  {candidates.filter(c => c.stage === 'interview').length === 0 && (
                    <p className="text-xs text-muted-foreground">No candidates currently in interview stage.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Candidate Detail Dialog */}
      <Dialog open={!!candidateDetail} onOpenChange={() => setCandidateDetail(null)}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          {candidateDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {candidateDetail.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p>{candidateDetail.name}</p>
                    <p className="text-sm font-normal text-muted-foreground">{candidateDetail.position}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getStageBadge(candidateDetail.stage)}
                  <Badge variant="outline" className={`text-[11px] font-bold ${getAiScoreBg(candidateDetail.aiScore)}`}>
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI Score: {candidateDetail.aiScore}
                  </Badge>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`h-3.5 w-3.5 ${star <= candidateDetail.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> {candidateDetail.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {candidateDetail.phone}</div>
                  <div><span className="text-muted-foreground">Experience:</span> {candidateDetail.experience} years</div>
                  <div><span className="text-muted-foreground">Current:</span> {candidateDetail.currentCompany}</div>
                  <div><span className="text-muted-foreground">Source:</span> {candidateDetail.source}</div>
                  <div><span className="text-muted-foreground">Applied:</span> {candidateDetail.appliedDate}</div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidateDetail.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  {candidateDetail.stage !== 'hired' && candidateDetail.stage !== 'rejected' && candidateDetail.stage !== 'offered' && (
                    <>
                      <Button className="gap-1 bg-emerald-600 hover:bg-emerald-700 flex-1" onClick={() => { handleAdvanceCandidate(candidateDetail.id); setCandidateDetail(null) }}>
                        <ChevronRight className="h-4 w-4" /> Advance Stage
                      </Button>
                      <Button variant="outline" className="gap-1 text-sky-600 flex-1" onClick={() => { setInterviewForm({ ...interviewForm, candidateId: candidateDetail.id }); setCandidateDetail(null); setScheduleInterviewOpen(true) }}>
                        <Calendar className="h-4 w-4" /> Schedule Interview
                      </Button>
                      <Button variant="outline" className="gap-1 text-red-600" onClick={() => { handleRejectCandidate(candidateDetail.id); setCandidateDetail(null) }}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  {candidateDetail.stage === 'offered' && (
                    <Button className="gap-1 bg-emerald-600 hover:bg-emerald-700 flex-1" onClick={() => { handleGenerateOffer(candidateDetail.id); setCandidateDetail(null) }}>
                      <Mail className="h-4 w-4" /> Generate Offer
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Requisition Dialog */}
      <Dialog open={addReqOpen} onOpenChange={setAddReqOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-600" /> New Requisition</DialogTitle>
            <DialogDescription>Create a new manpower requisition for hiring.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Position Title</Label>
                <Input value={reqForm.title} onChange={e => setReqForm({ ...reqForm, title: e.target.value })} placeholder="e.g. Senior Developer" />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={reqForm.department} onValueChange={v => setReqForm({ ...reqForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Openings</Label>
                <Input type="number" min={1} value={reqForm.positions} onChange={e => setReqForm({ ...reqForm, positions: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Experience</Label>
                <Input value={reqForm.experience} onChange={e => setReqForm({ ...reqForm, experience: e.target.value })} placeholder="e.g. 3-5 years" />
              </div>
              <div>
                <Label>Budget</Label>
                <Input value={reqForm.budget} onChange={e => setReqForm({ ...reqForm, budget: e.target.value })} placeholder="e.g. ₹15-20 LPA" />
              </div>
            </div>
            <div>
              <Label>Required Skills (comma separated)</Label>
              <Input value={reqForm.skills} onChange={e => setReqForm({ ...reqForm, skills: e.target.value })} placeholder="React, Node.js, TypeScript" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={reqForm.priority} onValueChange={v => setReqForm({ ...reqForm, priority: v as Requisition['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Join Date</Label>
                <Input type="date" value={reqForm.expectedJoinDate} onChange={e => setReqForm({ ...reqForm, expectedJoinDate: e.target.value })} />
              </div>
              <div>
                <Label>Hiring Manager</Label>
                <Input value={reqForm.hiringManager} onChange={e => setReqForm({ ...reqForm, hiringManager: e.target.value })} placeholder="Manager name" />
              </div>
            </div>
            <div>
              <Label>Justification</Label>
              <Textarea value={reqForm.justification} onChange={e => setReqForm({ ...reqForm, justification: e.target.value })} placeholder="Why is this position needed?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddReqOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRequisition} className="bg-emerald-600 hover:bg-emerald-700" disabled={!reqForm.title || !reqForm.department}>Create Requisition</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Job Posting Dialog */}
      <Dialog open={addJobOpen} onOpenChange={setAddJobOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-emerald-600" /> New Job Posting</DialogTitle>
            <DialogDescription>Create a new job posting to attract candidates.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Title</Label>
                <Input value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Senior Developer" />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={jobForm.department} onValueChange={v => setJobForm({ ...jobForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Location</Label>
                <Input value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Bangalore / Remote" />
              </div>
              <div>
                <Label>Job Type</Label>
                <Select value={jobForm.type} onValueChange={v => setJobForm({ ...jobForm, type: v as JobPosting['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience</Label>
                <Input value={jobForm.experience} onChange={e => setJobForm({ ...jobForm, experience: e.target.value })} placeholder="3-5 years" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary Range</Label>
                <Input value={jobForm.salary} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="₹15-20 LPA" />
              </div>
              <div>
                <Label>Skills (comma separated)</Label>
                <Input value={jobForm.skills} onChange={e => setJobForm({ ...jobForm, skills: e.target.value })} placeholder="React, Node.js" />
              </div>
            </div>
            <div>
              <Label>Job Description</Label>
              <Textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Describe the role, responsibilities, and what makes it exciting..." rows={4} />
            </div>
            <div>
              <Label>Requirements</Label>
              <Textarea value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} placeholder="List the key requirements and qualifications..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddJobOpen(false)}>Cancel</Button>
            <Button onClick={handleAddJob} className="bg-emerald-600 hover:bg-emerald-700" disabled={!jobForm.title || !jobForm.department || !jobForm.location}>Create Posting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={scheduleInterviewOpen} onOpenChange={setScheduleInterviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-600" /> Schedule Interview</DialogTitle>
            <DialogDescription>Schedule an interview for a candidate.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Candidate</Label>
              <Select value={interviewForm.candidateId} onValueChange={v => setInterviewForm({ ...interviewForm, candidateId: v })}>
                <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>
                  {candidates.filter(c => c.stage !== 'rejected' && c.stage !== 'hired').map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} — {c.position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={interviewForm.date} onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={interviewForm.time} onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Interview Type</Label>
                <Select value={interviewForm.type} onValueChange={v => setInterviewForm({ ...interviewForm, type: v as Interview['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Screen</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interviewer</Label>
                <Input value={interviewForm.interviewer} onChange={e => setInterviewForm({ ...interviewForm, interviewer: e.target.value })} placeholder="Interviewer name" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleInterviewOpen(false)}>Cancel</Button>
            <Button onClick={handleScheduleInterview} className="bg-emerald-600 hover:bg-emerald-700" disabled={!interviewForm.candidateId || !interviewForm.date || !interviewForm.time}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
