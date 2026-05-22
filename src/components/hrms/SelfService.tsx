'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Calendar,
  FileText,
  Receipt,
  UserCircle,
  BookOpen,
  GraduationCap,
  Sparkles,
  Send,
  Download,
  Edit3,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Shield,
  File,
  Monitor,
  Smartphone,
  Headphones,
  CreditCard,
  Loader2,
  Bot,
  User,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  policies,
  leaveData,
  selfServiceLeaveBalances,
  selfServicePayslips,
  selfServiceDocuments,
  selfServiceAssets,
} from '@/lib/data'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Employee Profile Data ─────────────────────────────────────────────────────

const employeeProfile = {
  name: 'Rajesh Kumar',
  employeeId: 'EMP001',
  email: 'rajesh.kumar@company.com',
  phone: '+91-9876543210',
  designation: 'Senior Software Engineer',
  department: 'Engineering',
  jobTitle: 'Tech Lead',
  joinDate: '2021-03-15',
  status: 'Active',
  contractType: 'Full-time',
  location: 'Bangalore',
  manager: 'Anita Desai',
  workMode: 'Hybrid',
}

// ─── Quick Actions Config ───────────────────────────────────────────────────────

const quickActions = [
  {
    label: 'Apply Leave',
    icon: Calendar,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  {
    label: 'View Payslip',
    icon: FileText,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    border: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  {
    label: 'Submit Expense',
    icon: Receipt,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    border: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
  {
    label: 'Update Profile',
    icon: UserCircle,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/50',
    border: 'hover:border-teal-300 dark:hover:border-teal-700',
  },
  {
    label: 'Company Policies',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    border: 'hover:border-purple-300 dark:hover:border-purple-700',
  },
  {
    label: 'Training Portal',
    icon: GraduationCap,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    border: 'hover:border-cyan-300 dark:hover:border-cyan-700',
  },
]

// ─── Policy Category Config ────────────────────────────────────────────────────

const policyCategories = [
  'All',
  'Leave',
  'Compliance',
  'Work Policy',
  'Finance',
  'Security',
  'HR',
] as const

type PolicyCategory = (typeof policyCategories)[number]

const categoryColors: Record<string, string> = {
  Leave: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  Compliance: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  'Work Policy': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  Finance: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  Security: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  HR: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
}

// ─── Suggested Queries ─────────────────────────────────────────────────────────

const suggestedQueries = [
  'What is the leave policy?',
  'How to apply for expense reimbursement?',
  'When is the next holiday?',
  'What are my tax benefits?',
]

// ─── Asset Icon Helper ─────────────────────────────────────────────────────────

function getAssetIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'laptop':
      return Monitor
    case 'phone':
      return Smartphone
    case 'headset':
      return Headphones
    default:
      return CreditCard
  }
}

// ─── Format Date ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getTodayFormatted() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Simple Markdown Renderer ──────────────────────────────────────────────────

function renderSimpleMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  lines.forEach((line, index) => {
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-base font-semibold mt-3 mb-1">
          {line.replace('## ', '')}
        </h3>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={index} className="text-sm font-semibold mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      )
    } else if (line.startsWith('- **')) {
      const match = line.match(/^- \*\*(.+?)\*\*(.*)$/)
      if (match) {
        elements.push(
          <li key={index} className="ml-4 text-sm text-muted-foreground list-disc">
            <span className="font-medium text-foreground">{match[1]}</span>
            {match[2]}
          </li>
        )
      }
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-4 text-sm text-muted-foreground list-disc">
          {line.replace('- ', '')}
        </li>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/)
      if (match) {
        elements.push(
          <li key={index} className="ml-4 text-sm text-muted-foreground list-decimal">
            {match[2]}
          </li>
        )
      }
    } else if (line.trim() === '') {
      elements.push(<div key={index} className="h-2" />)
    } else {
      elements.push(
        <p key={index} className="text-sm text-muted-foreground">
          {line}
        </p>
      )
    }
  })

  return elements
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SelfService() {
  // Tab state
  const [activeTab, setActiveTab] = useState('profile')

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false)

  // Policy state
  const [policySearch, setPolicySearch] = useState('')
  const [policyCategory, setPolicyCategory] = useState<PolicyCategory>('All')
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set())

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your AI HR Assistant. I can help you with leave policies, payroll queries, company policies, and more. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  // Toggle policy expansion
  const togglePolicy = useCallback((id: string) => {
    setExpandedPolicies((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Filter policies
  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(policySearch.toLowerCase()) ||
      p.content.toLowerCase().includes(policySearch.toLowerCase())
    const matchesCategory =
      policyCategory === 'All' || p.category === policyCategory
    return matchesSearch && matchesCategory
  })

  // Pending leave count for stats
  const pendingLeaves = leaveData.filter((l) => l.status === 'pending').length
  const pendingTasks = 2 // Mock

  // Send chat message
  const sendMessage = useCallback(
    async (messageText?: string) => {
      const text = (messageText || chatInput).trim()
      if (!text || isTyping) return

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, userMsg])
      setChatInput('')
      setIsTyping(true)

      try {
        // Build conversation history (last 10 messages)
        const history = chatMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            conversationHistory: history,
          }),
        })

        const data = await response.json()

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message || data.error || 'Sorry, I could not process your request.',
          timestamp: new Date(),
        }

        setChatMessages((prev) => [...prev, aiMsg])
      } catch {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'I apologize, but I encountered a technical issue. Please try again in a moment.',
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsTyping(false)
      }
    },
    [chatInput, chatMessages, isTyping]
  )

  // Handle chat input key press
  const handleChatKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Welcome Banner ─────────────────────────────────────────── */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-4 text-white shadow-lg sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-white/30 sm:h-16 sm:w-16">
                <AvatarImage src="" alt={employeeProfile.name} />
                <AvatarFallback className="bg-white/20 text-lg font-bold text-white">
                  RK
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  Welcome back, {employeeProfile.name.split(' ')[0]}!
                </h1>
                <p className="mt-0.5 text-sm text-emerald-100">
                  {getTodayFormatted()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="rounded-lg bg-white/15 px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-emerald-100">Leave Balance</p>
                <p className="text-lg font-bold">25 days</p>
              </div>
              <div className="rounded-lg bg-white/15 px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-emerald-100">Pending Tasks</p>
                <p className="text-lg font-bold">{pendingTasks + pendingLeaves}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Quick Actions Grid ─────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className={cn(
                  'h-auto flex-col gap-2.5 py-5 transition-all',
                  action.border,
                  'hover:shadow-md'
                )}
              >
                <div className={cn('rounded-lg p-2.5', action.bg)}>
                  <Icon className={cn('h-5 w-5', action.color)} />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            )
          })}
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="profile" className="gap-1.5">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">My Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Company Policies</span>
              <span className="sm:hidden">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI Chat</span>
              <Badge
                className={cn(
                  'ml-1 gap-0.5 rounded-full px-1.5 py-0 text-[9px] font-bold uppercase',
                  'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 ring-1 ring-emerald-500/30',
                  'dark:text-emerald-400'
                )}
              >
                <Sparkles className="h-2 w-2" />
                AI
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ─── My Profile Tab ──────────────────────────────────────── */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <CardDescription>Your personal details</CardDescription>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16 ring-2 ring-emerald-500/20">
                        <AvatarImage src="" alt={employeeProfile.name} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white">
                          RK
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{employeeProfile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employeeProfile.employeeId}
                        </p>
                        <Badge
                          variant="secondary"
                          className="mt-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        >
                          {employeeProfile.status}
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm">{employeeProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm">{employeeProfile.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm">{employeeProfile.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Join Date</p>
                          <p className="text-sm">{formatDate(employeeProfile.joinDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Employment Details</CardTitle>
                  <CardDescription>Work-related information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Designation</p>
                        <p className="text-sm font-medium">
                          {employeeProfile.designation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="text-sm font-medium">
                          {employeeProfile.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Job Title</p>
                        <p className="text-sm font-medium">
                          {employeeProfile.jobTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Contract Type</p>
                        <p className="text-sm font-medium">
                          {employeeProfile.contractType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Manager</p>
                        <p className="text-sm font-medium">
                          {employeeProfile.manager}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Work Mode</p>
                        <p className="text-sm font-medium">
                          {employeeProfile.workMode}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Balances */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Leave Balances</CardTitle>
                  <CardDescription>Your available leave days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selfServiceLeaveBalances.map((leave) => {
                      const percentage = Math.round(
                        (leave.used / leave.total) * 100
                      )
                      return (
                        <div key={leave.type} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{leave.type}</span>
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                {leave.balance}
                              </span>{' '}
                              / {leave.total} days
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                leave.color
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {leave.used} day{leave.used !== 1 ? 's' : ''} used
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payslips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Payslips</CardTitle>
                  <CardDescription>Download your payslips</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      {selfServicePayslips.map((payslip) => (
                        <div
                          key={payslip.id}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{payslip.month}</p>
                              <p className="text-xs text-muted-foreground">
                                Net Pay: {payslip.netPay}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download payslip</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* My Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">My Documents</CardTitle>
                  <CardDescription>Your uploaded documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      {selfServiceDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50">
                              <File className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type} · {doc.size} · {formatDate(doc.uploadedDate)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:bg-amber-100 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download document</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* My Assets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">My Assets</CardTitle>
                  <CardDescription>Company assets assigned to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      {selfServiceAssets.map((asset) => {
                        const AssetIcon = getAssetIcon(asset.assetType)
                        return (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/50">
                                <AssetIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {asset.assetName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  S/N: {asset.serialNo} · Assigned:{' '}
                                  {formatDate(asset.assignedDate)}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[10px]',
                                asset.condition === 'New'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              )}
                            >
                              {asset.condition}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Company Policies Tab ──────────────────────────────────── */}
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Company Policies</CardTitle>
                    <CardDescription>
                      Browse and search company policies
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search policies..."
                      value={policySearch}
                      onChange={(e) => setPolicySearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Category Filters */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {policyCategories.map((cat) => (
                    <Button
                      key={cat}
                      variant={policyCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-7 text-xs',
                        policyCategory === cat &&
                          'bg-emerald-600 hover:bg-emerald-700'
                      )}
                      onClick={() => setPolicyCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                {/* Policy List */}
                <div className="space-y-2">
                  {filteredPolicies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BookOpen className="mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        No policies found
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Try adjusting your search or category filter
                      </p>
                    </div>
                  ) : (
                    filteredPolicies.map((policy) => (
                      <Collapsible
                        key={policy.id}
                        open={expandedPolicies.has(policy.id)}
                        onOpenChange={() => togglePolicy(policy.id)}
                      >
                        <div className="rounded-lg border transition-colors hover:bg-muted/30">
                          <CollapsibleTrigger asChild>
                            <button className="flex w-full items-center justify-between p-4 text-left">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                                  <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {policy.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        'text-[10px]',
                                        categoryColors[policy.category] ||
                                          ''
                                      )}
                                    >
                                      {policy.category}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      v{policy.version}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      · Effective: {formatDate(policy.effectiveDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {expandedPolicies.has(policy.id) ? (
                                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t px-4 py-4">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                {renderSimpleMarkdown(policy.content)}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── AI Assistant Tab ──────────────────────────────────────── */}
          <TabsContent value="assistant">
            <Card className="flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
              <CardHeader className="shrink-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      AI HR Assistant
                      <Badge
                        className={cn(
                          'gap-0.5 rounded-full px-1.5 py-0 text-[9px] font-bold uppercase',
                          'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 ring-1 ring-emerald-500/30',
                          'dark:text-emerald-400'
                        )}
                      >
                        <Sparkles className="h-2 w-2" />
                        AI
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Powered by AI · Ask anything about HR
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-2',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                            <Bot className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                            msg.role === 'user'
                              ? 'bg-emerald-600 text-white rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                          <p
                            className={cn(
                              'mt-1 text-[10px]',
                              msg.role === 'user'
                                ? 'text-emerald-200'
                                : 'text-muted-foreground'
                            )}
                          >
                            {msg.timestamp.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                            <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:0ms]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Suggested Queries - show only at start */}
                {chatMessages.length <= 1 && (
                  <div className="shrink-0 border-t px-4 py-3">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQueries.map((query) => (
                        <Button
                          key={query}
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/50"
                          onClick={() => sendMessage(query)}
                          disabled={isTyping}
                        >
                          <Sparkles className="h-3 w-3 text-emerald-500" />
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="shrink-0 border-t px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={chatInputRef}
                      type="text"
                      placeholder="Ask your HR question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      disabled={isTyping}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 shrink-0 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => sendMessage()}
                      disabled={!chatInput.trim() || isTyping}
                    >
                      {isTyping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="sr-only">Send message</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
