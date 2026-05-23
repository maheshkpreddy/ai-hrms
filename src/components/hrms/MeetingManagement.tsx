'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Video,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  User,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface MeetingEmployee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  email: string
  department?: string | null
  designation?: string | null
  avatar?: string | null
}

interface MeetingInvitation {
  id: string
  meetingId: string
  employeeId: string
  rsvpStatus: string // pending, accepted, declined
  respondedAt?: string | null
  employee: MeetingEmployee
  createdAt: string
  updatedAt: string
}

interface Meeting {
  id: string
  companyId?: string | null
  title: string
  description?: string | null
  date: string
  startTime: string
  endTime?: string | null
  location?: string | null
  meetingType?: string | null // in-person, virtual, hybrid
  status: string // scheduled, in_progress, completed, cancelled
  createdBy?: string | null
  createdAt: string
  updatedAt: string
  invitations: MeetingInvitation[]
  company?: { id: string; name: string } | null
}

interface EmployeeOption {
  id: string
  firstName: string
  lastName: string
  email: string
  department?: string | null
  designation?: string | null
  avatar?: string | null
}

// ─── Badge Helpers ──────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case 'scheduled':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          Scheduled
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
          In Progress
        </Badge>
      )
    case 'completed':
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
          Completed
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">
          Cancelled
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getMeetingTypeBadge(type: string | null) {
  switch (type) {
    case 'in-person':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400">
          <MapPin className="mr-1 h-3 w-3" />
          In-Person
        </Badge>
      )
    case 'virtual':
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-400">
          <Video className="mr-1 h-3 w-3" />
          Virtual
        </Badge>
      )
    case 'hybrid':
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-400">
          <Users className="mr-1 h-3 w-3" />
          Hybrid
        </Badge>
      )
    default:
      return <Badge variant="secondary">{type || 'N/A'}</Badge>
  }
}

function getRsvpBadge(status: string) {
  switch (status) {
    case 'accepted':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Accepted
        </Badge>
      )
    case 'declined':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">
          <XCircle className="mr-1 h-3 w-3" />
          Declined
        </Badge>
      )
    case 'pending':
    default:
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
  }
}

// ─── Format Helpers ─────────────────────────────────────────────────────────────

function formatMeetingDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(timeStr: string) {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return timeStr
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

function formatDuration(startTime: string, endTime: string | null) {
  if (!endTime) return '—'
  const [h1, m1] = startTime.split(':').map(Number)
  const [h2, m2] = endTime.split(':').map(Number)
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '—'
  const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (diffMins <= 0) return '—'
  const hrs = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

function isUpcoming(dateStr: string, status: string) {
  if (status === 'completed' || status === 'cancelled') return false
  const meetingDate = new Date(dateStr + 'T23:59:59')
  return meetingDate >= new Date()
}

// ─── Card Skeleton ──────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// ─── Create/Edit Meeting Form ──────────────────────────────────────────────────

interface MeetingForm {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  meetingType: string
  invitedEmployeeIds: string[]
}

const emptyForm: MeetingForm = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  meetingType: 'virtual',
  invitedEmployeeIds: [],
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MeetingManagement() {
  const { data: session } = useSession()
  const { toast } = useToast()

  // State
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [meetingForm, setMeetingForm] = useState<MeetingForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null)

  // Employee search for invite picker
  const [employeeSearch, setEmployeeSearch] = useState('')

  // Get current employee from session
  const sessionEmployeeId = (session?.user as any)?.employeeId || ''

  // ── API Hooks ──────────────────────────────────────────────────────────────

  // Fetch all meetings
  const {
    data: meetingsResponse,
    loading: meetingsLoading,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useApi<{ meetings: Meeting[]; pagination: { total: number } }>({
    baseUrl: '/api/meetings',
    params: { limit: 100 },
  })

  // Fetch employees for invite picker
  const {
    data: employeesResponse,
    loading: employeesLoading,
  } = useApi<{ employees: EmployeeOption[]; pagination: { total: number } }>({
    baseUrl: '/api/employees',
    params: { limit: 100, status: 'active' },
  })

  // Fetch my invitations (for the current employee)
  const {
    data: myInvitationsResponse,
    loading: myInvitationsLoading,
    error: myInvitationsError,
    refetch: refetchMyInvitations,
  } = useApi<{ invitations: any[]; pagination: { total: number } }>({
    baseUrl: '/api/meetings/invitations',
    params: sessionEmployeeId ? { employeeId: sessionEmployeeId, limit: 100 } : undefined,
    enabled: !!sessionEmployeeId,
  })

  // ── Derived Data ────────────────────────────────────────────────────────────

  const allMeetings: Meeting[] = useMemo(
    () => meetingsResponse?.meetings ?? [],
    [meetingsResponse]
  )

  const employees: EmployeeOption[] = useMemo(
    () => employeesResponse?.employees ?? [],
    [employeesResponse]
  )

  const myInvitations = useMemo(
    () => myInvitationsResponse?.invitations ?? [],
    [myInvitationsResponse]
  )

  // Split meetings into upcoming and past
  const upcomingMeetings = useMemo(
    () =>
      allMeetings.filter(
        (m) => isUpcoming(m.date, m.status)
      ),
    [allMeetings]
  )

  const pastMeetings = useMemo(
    () =>
      allMeetings.filter(
        (m) => !isUpcoming(m.date, m.status)
      ),
    [allMeetings]
  )

  // Stats
  const totalMeetings = allMeetings.length
  const scheduledCount = allMeetings.filter((m) => m.status === 'scheduled').length
  const completedCount = allMeetings.filter((m) => m.status === 'completed').length
  const pendingRsvpCount = allMeetings.reduce(
    (sum, m) => sum + m.invitations.filter((i) => i.rsvpStatus === 'pending').length,
    0
  )

  // Filtered meetings based on current tab + search + filters
  const filteredMeetings = useMemo(() => {
    let source: Meeting[]
    switch (activeTab) {
      case 'upcoming':
        source = upcomingMeetings
        break
      case 'past':
        source = pastMeetings
        break
      case 'invitations':
        // For invitations tab, we show meetings the user is invited to
        source = allMeetings.filter((m) =>
          m.invitations.some((inv) => inv.employeeId === sessionEmployeeId)
        )
        break
      default:
        source = allMeetings
    }

    return source.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.location || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter
      const matchesType = typeFilter === 'all' || m.meetingType === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [activeTab, upcomingMeetings, pastMeetings, allMeetings, searchQuery, statusFilter, typeFilter, sessionEmployeeId])

  // Filtered employees for the invite picker
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees
    return employees.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        (e.department || '').toLowerCase().includes(employeeSearch.toLowerCase())
    )
  }, [employees, employeeSearch])

  // ── Mutation Handlers ──────────────────────────────────────────────────────

  const handleCreateMeeting = useCallback(async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.startTime) {
      toast({
        title: 'Validation Error',
        description: 'Title, date, and start time are required.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      await apiPost('/api/meetings', {
        title: meetingForm.title,
        description: meetingForm.description || undefined,
        date: meetingForm.date,
        startTime: meetingForm.startTime,
        endTime: meetingForm.endTime || undefined,
        location: meetingForm.location || undefined,
        meetingType: meetingForm.meetingType,
        createdBy: sessionEmployeeId || undefined,
        invitedEmployeeIds: meetingForm.invitedEmployeeIds,
      })

      toast({
        title: 'Meeting Created',
        description: `"${meetingForm.title}" has been scheduled successfully.`,
      })

      setCreateDialogOpen(false)
      setMeetingForm(emptyForm)
      refetchMeetings()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create meeting. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }, [meetingForm, sessionEmployeeId, toast, refetchMeetings])

  const handleEditMeeting = useCallback(async () => {
    if (!selectedMeeting || !meetingForm.title || !meetingForm.date || !meetingForm.startTime) {
      toast({
        title: 'Validation Error',
        description: 'Title, date, and start time are required.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      await apiPatch(`/api/meetings/${selectedMeeting.id}`, {
        title: meetingForm.title,
        description: meetingForm.description || undefined,
        date: meetingForm.date,
        startTime: meetingForm.startTime,
        endTime: meetingForm.endTime || undefined,
        location: meetingForm.location || undefined,
        meetingType: meetingForm.meetingType,
        status: meetingForm.status === 'scheduled' ? 'scheduled' : undefined,
      })

      toast({
        title: 'Meeting Updated',
        description: `"${meetingForm.title}" has been updated successfully.`,
      })

      setEditDialogOpen(false)
      setSelectedMeeting(null)
      setMeetingForm(emptyForm)
      refetchMeetings()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update meeting. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }, [selectedMeeting, meetingForm, toast, refetchMeetings])

  const handleDeleteMeeting = useCallback(async () => {
    if (!deleteTarget) return

    setActionLoading(deleteTarget.id)
    try {
      await apiDelete(`/api/meetings/${deleteTarget.id}`)

      toast({
        title: 'Meeting Deleted',
        description: `"${deleteTarget.title}" has been deleted.`,
      })

      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      refetchMeetings()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete meeting. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [deleteTarget, toast, refetchMeetings])

  const handleUpdateStatus = useCallback(
    async (meetingId: string, newStatus: string) => {
      setActionLoading(meetingId)
      try {
        await apiPatch(`/api/meetings/${meetingId}`, { status: newStatus })

        toast({
          title: 'Status Updated',
          description: `Meeting status changed to ${newStatus.replace('_', ' ')}.`,
        })

        refetchMeetings()
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to update meeting status.',
          variant: 'destructive',
        })
      } finally {
        setActionLoading(null)
      }
    },
    [toast, refetchMeetings]
  )

  const handleRsvp = useCallback(
    async (invitationId: string, rsvpStatus: 'accepted' | 'declined') => {
      setActionLoading(invitationId)
      try {
        await apiPatch('/api/meetings/invitations', {
          id: invitationId,
          rsvpStatus,
        })

        toast({
          title: `Invitation ${rsvpStatus === 'accepted' ? 'Accepted' : 'Declined'}`,
          description: `You have ${rsvpStatus === 'accepted' ? 'accepted' : 'declined'} the meeting invitation.`,
        })

        refetchMeetings()
        refetchMyInvitations()
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to update RSVP. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setActionLoading(null)
      }
    },
    [toast, refetchMeetings, refetchMyInvitations]
  )

  // ── Dialog Openers ──────────────────────────────────────────────────────────

  const openCreateDialog = useCallback(() => {
    setMeetingForm(emptyForm)
    setEmployeeSearch('')
    setCreateDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setMeetingForm({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime || '',
      location: meeting.location || '',
      meetingType: meeting.meetingType || 'virtual',
      invitedEmployeeIds: meeting.invitations.map((i) => i.employeeId),
    })
    setEmployeeSearch('')
    setEditDialogOpen(true)
  }, [])

  const openDetailDialog = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setDetailDialogOpen(true)
  }, [])

  const openDeleteDialog = useCallback((meeting: Meeting) => {
    setDeleteTarget(meeting)
    setDeleteDialogOpen(true)
  }, [])

  // ── Toggle Employee Selection ────────────────────────────────────────────────

  const toggleEmployeeSelection = useCallback((empId: string) => {
    setMeetingForm((prev) => ({
      ...prev,
      invitedEmployeeIds: prev.invitedEmployeeIds.includes(empId)
        ? prev.invitedEmployeeIds.filter((id) => id !== empId)
        : [...prev.invitedEmployeeIds, empId],
    }))
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Meeting Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Schedule meetings, manage invitations, and track RSVPs
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={openCreateDialog}
          >
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {meetingsLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Total Meetings
                      </p>
                      <p className="text-2xl font-bold sm:text-3xl">{totalMeetings}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950">
                      <Calendar className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Scheduled
                      </p>
                      <p className="text-2xl font-bold sm:text-3xl">{scheduledCount}</p>
                    </div>
                    <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950">
                      <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Completed
                      </p>
                      <p className="text-2xl font-bold sm:text-3xl">{completedCount}</p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                      <CheckCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-gray-400 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Pending RSVPs
                      </p>
                      <p className="text-2xl font-bold sm:text-3xl">{pendingRsvpCount}</p>
                    </div>
                    <div className="rounded-lg bg-rose-100 p-2 dark:bg-rose-950">
                      <Users className="h-5 w-5 text-rose-700 dark:text-rose-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-rose-500 to-transparent" />
              </Card>
            </>
          )}
        </div>

        {/* Filters + Search */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-[140px]">
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in-person">In-Person</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full flex-wrap sm:w-auto">
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming</span>
              {upcomingMeetings.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 text-[10px]">
                  {upcomingMeetings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Past</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">My Invitations</span>
              {myInvitations.filter((i: any) => i.rsvpStatus === 'pending').length > 0 && (
                <Badge className="ml-1 h-5 min-w-[20px] px-1 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  {myInvitations.filter((i: any) => i.rsvpStatus === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════ UPCOMING TAB ═══════════════════════ */}
          <TabsContent value="upcoming" className="space-y-4">
            <MeetingList
              meetings={filteredMeetings}
              loading={meetingsLoading}
              error={meetingsError}
              onRetry={refetchMeetings}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onViewDetail={openDetailDialog}
              onUpdateStatus={handleUpdateStatus}
              actionLoading={actionLoading}
              sessionEmployeeId={sessionEmployeeId}
              onRsvp={handleRsvp}
              emptyMessage="No upcoming meetings found."
            />
          </TabsContent>

          {/* ═══════════════════════ PAST TAB ═══════════════════════ */}
          <TabsContent value="past" className="space-y-4">
            <MeetingList
              meetings={filteredMeetings}
              loading={meetingsLoading}
              error={meetingsError}
              onRetry={refetchMeetings}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onViewDetail={openDetailDialog}
              onUpdateStatus={handleUpdateStatus}
              actionLoading={actionLoading}
              sessionEmployeeId={sessionEmployeeId}
              onRsvp={handleRsvp}
              emptyMessage="No past meetings found."
            />
          </TabsContent>

          {/* ═══════════════════════ MY INVITATIONS TAB ═══════════════════════ */}
          <TabsContent value="invitations" className="space-y-4">
            {myInvitationsLoading ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meeting</TableHead>
                        <TableHead>Date &amp; Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>RSVP</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableSkeleton rows={4} cols={6} />
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : myInvitationsError ? (
              <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Failed to load invitations.</span>
                    <Button size="sm" variant="outline" onClick={refetchMyInvitations} className="ml-auto">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <MyInvitationsList
                invitations={myInvitations}
                meetings={allMeetings}
                onRsvp={handleRsvp}
                actionLoading={actionLoading}
                onViewDetail={openDetailDialog}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════ CREATE MEETING DIALOG ═══════════════════════ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a meeting and invite participants.
            </DialogDescription>
          </DialogHeader>
          <MeetingFormFields
            form={meetingForm}
            setForm={setMeetingForm}
            employees={filteredEmployees}
            allEmployees={employees}
            employeeSearch={employeeSearch}
            setEmployeeSearch={setEmployeeSearch}
            employeesLoading={employeesLoading}
            toggleEmployeeSelection={toggleEmployeeSelection}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateMeeting}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════ EDIT MEETING DIALOG ═══════════════════════ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update the meeting details below.
            </DialogDescription>
          </DialogHeader>
          <MeetingFormFields
            form={meetingForm}
            setForm={setMeetingForm}
            employees={filteredEmployees}
            allEmployees={employees}
            employeeSearch={employeeSearch}
            setEmployeeSearch={setEmployeeSearch}
            employeesLoading={employeesLoading}
            toggleEmployeeSelection={toggleEmployeeSelection}
            isEdit
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleEditMeeting}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════ MEETING DETAIL DIALOG ═══════════════════════ */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedMeeting.title}
                  {getStatusBadge(selectedMeeting.status)}
                </DialogTitle>
                <DialogDescription>{selectedMeeting.description || 'No description provided.'}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Meeting Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{formatMeetingDate(selectedMeeting.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">
                        {formatTime(selectedMeeting.startTime)}
                        {selectedMeeting.endTime ? ` – ${formatTime(selectedMeeting.endTime)}` : ''}
                      </p>
                    </div>
                  </div>
                  {selectedMeeting.location && (
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium truncate">{selectedMeeting.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {getMeetingTypeBadge(selectedMeeting.meetingType || null)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {selectedMeeting.invitations.length} invited
                    </span>
                  </div>
                </div>

                {/* Duration */}
                {selectedMeeting.endTime && (
                  <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/40">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatDuration(selectedMeeting.startTime, selectedMeeting.endTime)}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Invited Employees */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Invited Employees</h4>
                  {selectedMeeting.invitations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No employees invited.</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                      {selectedMeeting.invitations.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={inv.employee.avatar || ''} alt={inv.employee.firstName} />
                              <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                {inv.employee.firstName[0]}{inv.employee.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {inv.employee.firstName} {inv.employee.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {inv.employee.department || inv.employee.email}
                              </p>
                            </div>
                          </div>
                          {getRsvpBadge(inv.rsvpStatus)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RSVP Summary */}
                {selectedMeeting.invitations.length > 0 && (
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      {selectedMeeting.invitations.filter((i) => i.rsvpStatus === 'accepted').length} accepted
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {selectedMeeting.invitations.filter((i) => i.rsvpStatus === 'declined').length} declined
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      {selectedMeeting.invitations.filter((i) => i.rsvpStatus === 'pending').length} pending
                    </span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
                {selectedMeeting.status === 'scheduled' && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      handleUpdateStatus(selectedMeeting.id, 'in_progress')
                      setDetailDialogOpen(false)
                    }}
                    disabled={actionLoading === selectedMeeting.id}
                  >
                    {actionLoading === selectedMeeting.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Start Meeting
                  </Button>
                )}
                {selectedMeeting.status === 'in_progress' && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      handleUpdateStatus(selectedMeeting.id, 'completed')
                      setDetailDialogOpen(false)
                    }}
                    disabled={actionLoading === selectedMeeting.id}
                  >
                    {actionLoading === selectedMeeting.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mark Completed
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════ DELETE CONFIRMATION DIALOG ═══════════════════════ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
              All invitations will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteMeeting}
              disabled={actionLoading === deleteTarget?.id}
            >
              {actionLoading === deleteTarget?.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Meeting List Component ────────────────────────────────────────────────────

function MeetingList({
  meetings,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
  onViewDetail,
  onUpdateStatus,
  actionLoading,
  sessionEmployeeId,
  onRsvp,
  emptyMessage,
}: {
  meetings: Meeting[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onEdit: (m: Meeting) => void
  onDelete: (m: Meeting) => void
  onViewDetail: (m: Meeting) => void
  onUpdateStatus: (id: string, status: string) => void
  actionLoading: string | null
  sessionEmployeeId: string
  onRsvp: (invitationId: string, status: 'accepted' | 'declined') => void
  emptyMessage: string
}) {
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Failed to load meetings. Please try again.</span>
            <Button size="sm" variant="outline" onClick={onRetry} className="ml-auto">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!loading && meetings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Video className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Schedule a new meeting to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetail={onViewDetail}
            onUpdateStatus={onUpdateStatus}
            actionLoading={actionLoading}
            sessionEmployeeId={sessionEmployeeId}
            onRsvp={onRsvp}
          />
        ))
      )}
    </div>
  )
}

// ─── Meeting Card Component ────────────────────────────────────────────────────

function MeetingCard({
  meeting,
  onEdit,
  onDelete,
  onViewDetail,
  onUpdateStatus,
  actionLoading,
  sessionEmployeeId,
  onRsvp,
}: {
  meeting: Meeting
  onEdit: (m: Meeting) => void
  onDelete: (m: Meeting) => void
  onViewDetail: (m: Meeting) => void
  onUpdateStatus: (id: string, status: string) => void
  actionLoading: string | null
  sessionEmployeeId: string
  onRsvp: (invitationId: string, status: 'accepted' | 'declined') => void
}) {
  const acceptedCount = meeting.invitations.filter((i) => i.rsvpStatus === 'accepted').length
  const declinedCount = meeting.invitations.filter((i) => i.rsvpStatus === 'declined').length
  const pendingCount = meeting.invitations.filter((i) => i.rsvpStatus === 'pending').length

  // Find current user's invitation for this meeting
  const myInvitation = meeting.invitations.find((i) => i.employeeId === sessionEmployeeId)

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Meeting Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold truncate">{meeting.title}</h3>
              {getStatusBadge(meeting.status)}
              {getMeetingTypeBadge(meeting.meetingType || null)}
            </div>

            {meeting.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{meeting.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatMeetingDate(meeting.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(meeting.startTime)}
                {meeting.endTime ? ` – ${formatTime(meeting.endTime)}` : ''}
              </span>
              {meeting.endTime && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {formatDuration(meeting.startTime, meeting.endTime)}
                </span>
              )}
              {meeting.location && (
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{meeting.location}</span>
                </span>
              )}
            </div>

            {/* Attendees Preview */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {meeting.invitations.slice(0, 4).map((inv) => (
                  <Avatar key={inv.id} className="h-7 w-7 ring-2 ring-background">
                    <AvatarImage src={inv.employee.avatar || ''} alt={inv.employee.firstName} />
                    <AvatarFallback className="bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {inv.employee.firstName[0]}{inv.employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {meeting.invitations.length > 4 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-background">
                    +{meeting.invitations.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {acceptedCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <XCircle className="h-3 w-3 text-red-500" />
                  {declinedCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3 text-amber-500" />
                  {pendingCount}
                </span>
              </div>
            </div>

            {/* RSVP Buttons for invited employee */}
            {myInvitation && myInvitation.rsvpStatus === 'pending' && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 h-8"
                  onClick={() => onRsvp(myInvitation.id, 'accepted')}
                  disabled={actionLoading === myInvitation.id}
                >
                  {actionLoading === myInvitation.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
                  onClick={() => onRsvp(myInvitation.id, 'declined')}
                  disabled={actionLoading === myInvitation.id}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Decline
                </Button>
              </div>
            )}
            {myInvitation && myInvitation.rsvpStatus !== 'pending' && (
              <div className="pt-1">
                {getRsvpBadge(myInvitation.rsvpStatus)}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onViewDetail(meeting)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Status transition buttons */}
            {meeting.status === 'scheduled' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                onClick={() => onUpdateStatus(meeting.id, 'in_progress')}
                disabled={actionLoading === meeting.id}
                title="Start meeting"
              >
                {actionLoading === meeting.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Video className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Start</span>
              </Button>
            )}
            {meeting.status === 'in_progress' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                onClick={() => onUpdateStatus(meeting.id, 'completed')}
                disabled={actionLoading === meeting.id}
                title="Complete meeting"
              >
                {actionLoading === meeting.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Complete</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(meeting)}
              title="Edit meeting"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950"
                onClick={() => onUpdateStatus(meeting.id, 'cancelled')}
                disabled={actionLoading === meeting.id}
                title="Cancel meeting"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              onClick={() => onDelete(meeting)}
              title="Delete meeting"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      {/* Status indicator line */}
      {meeting.status === 'in_progress' && (
        <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 animate-pulse" />
      )}
      {meeting.status === 'scheduled' && (
        <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
      )}
    </Card>
  )
}

// ─── My Invitations List Component ─────────────────────────────────────────────

function MyInvitationsList({
  invitations,
  meetings,
  onRsvp,
  actionLoading,
  onViewDetail,
}: {
  invitations: any[]
  meetings: Meeting[]
  onRsvp: (invitationId: string, status: 'accepted' | 'declined') => void
  actionLoading: string | null
  onViewDetail: (m: Meeting) => void
}) {
  // Enrich invitations with meeting data
  const enrichedInvitations = useMemo(() => {
    return invitations.map((inv) => {
      const meeting = meetings.find((m) => m.id === inv.meetingId)
      return { ...inv, meeting }
    })
  }, [invitations, meetings])

  if (enrichedInvitations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Users className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No meeting invitations found.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {enrichedInvitations.map((inv: any) => {
        const meeting = inv.meeting as Meeting | undefined
        if (!meeting) return null

        return (
          <Card key={inv.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Meeting Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{meeting.title}</h3>
                    {getStatusBadge(meeting.status)}
                    {getMeetingTypeBadge(meeting.meetingType || null)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatMeetingDate(meeting.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(meeting.startTime)}
                      {meeting.endTime ? ` – ${formatTime(meeting.endTime)}` : ''}
                    </span>
                    {meeting.location && (
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{meeting.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* RSVP Section */}
                <div className="flex items-center gap-2 shrink-0">
                  {inv.rsvpStatus === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        className="gap-1 bg-emerald-600 hover:bg-emerald-700 h-8"
                        onClick={() => onRsvp(inv.id, 'accepted')}
                        disabled={actionLoading === inv.id}
                      >
                        {actionLoading === inv.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => onRsvp(inv.id, 'declined')}
                        disabled={actionLoading === inv.id}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Decline
                      </Button>
                    </>
                  ) : (
                    <>
                      {getRsvpBadge(inv.rsvpStatus)}
                      {inv.rsvpStatus === 'accepted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950 text-xs"
                          onClick={() => onRsvp(inv.id, 'declined')}
                          disabled={actionLoading === inv.id}
                        >
                          Change to Decline
                        </Button>
                      )}
                      {inv.rsvpStatus === 'declined' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900 dark:hover:bg-emerald-950 text-xs"
                          onClick={() => onRsvp(inv.id, 'accepted')}
                          disabled={actionLoading === inv.id}
                        >
                          Change to Accept
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onViewDetail(meeting)}
                    title="View meeting details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            {/* RSVP status indicator */}
            {inv.rsvpStatus === 'accepted' && (
              <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
            )}
            {inv.rsvpStatus === 'declined' && (
              <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
            )}
            {inv.rsvpStatus === 'pending' && (
              <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ─── Meeting Form Fields Component ─────────────────────────────────────────────

function MeetingFormFields({
  form,
  setForm,
  employees,
  allEmployees,
  employeeSearch,
  setEmployeeSearch,
  employeesLoading,
  toggleEmployeeSelection,
  isEdit = false,
}: {
  form: MeetingForm
  setForm: React.Dispatch<React.SetStateAction<MeetingForm>>
  employees: EmployeeOption[]
  allEmployees: EmployeeOption[]
  employeeSearch: string
  setEmployeeSearch: (v: string) => void
  employeesLoading: boolean
  toggleEmployeeSelection: (id: string) => void
  isEdit?: boolean
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="meeting-title">Title *</Label>
        <Input
          id="meeting-title"
          placeholder="Enter meeting title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="meeting-description">Description</Label>
        <Textarea
          id="meeting-description"
          placeholder="Meeting agenda or description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="meeting-date">Date *</Label>
          <Input
            id="meeting-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meeting-start">Start Time *</Label>
          <Input
            id="meeting-start"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meeting-end">End Time</Label>
          <Input
            id="meeting-end"
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="meeting-location">Location / Link</Label>
          <Input
            id="meeting-location"
            placeholder="Room name or meeting link"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meeting-type">Meeting Type</Label>
          <Select
            value={form.meetingType}
            onValueChange={(v) => setForm((f) => ({ ...f, meetingType: v }))}
          >
            <SelectTrigger id="meeting-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Employee Invite Picker */}
      <div className="grid gap-2">
        <Label>Invite Employees ({form.invitedEmployeeIds.length} selected)</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <div className="max-h-48 overflow-y-auto custom-scrollbar rounded-lg border">
          {employeesLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : employees.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No employees found.
            </div>
          ) : (
            employees.map((emp) => (
              <label
                key={emp.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={form.invitedEmployeeIds.includes(emp.id)}
                  onCheckedChange={() => toggleEmployeeSelection(emp.id)}
                />
                <Avatar className="h-7 w-7">
                  <AvatarImage src={emp.avatar || ''} alt={emp.firstName} />
                  <AvatarFallback className="bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{emp.department || emp.email}</p>
                </div>
              </label>
            ))
          )}
        </div>
        {/* Selected chips */}
        {form.invitedEmployeeIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {form.invitedEmployeeIds.map((empId) => {
              const emp = allEmployees.find((e) => e.id === empId)
              if (!emp) return null
              return (
                <Badge
                  key={empId}
                  variant="secondary"
                  className="gap-1 pr-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  {emp.firstName} {emp.lastName}
                  <button
                    className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                    onClick={() => toggleEmployeeSelection(empId)}
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
