'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { useHRMSStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Search, Plus, Building2, Ticket, Filter, Loader2, X, Download, Eye } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { Pencil, Trash2, MessageSquare, FileText, ShieldCheck, Users } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientData {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  industry: string | null
  website: string | null
  subscription: string
  resumeAccessLimit: number
  resumesAccessed: number
  isActive: boolean
  companyId: string | null
  createdAt: string
  updatedAt: string
  tickets?: { id: string; status: string; priority: string }[]
  resumeAccess?: { id: string; accessType: string; accessedAt: string; candidateName: string }[]
  _count?: { tickets: number; resumeAccess: number; clientUsers: number }
}

interface TicketData {
  id: string
  clientId: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  assignedTo: string | null
  resolution: string | null
  createdAt: string
  updatedAt: string
  client?: { id: string; companyName: string; contactPerson: string; email: string }
  comments?: TicketCommentData[]
  _count?: { comments: number }
}

interface TicketCommentData {
  id: string
  ticketId: string
  authorType: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSubscriptionBadge(sub: string) {
  const cfg: Record<string, { label: string; className: string }> = {
    basic: { label: 'Basic', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    premium: { label: 'Premium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    enterprise: { label: 'Enterprise', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  }
  const c = cfg[sub] || cfg.basic
  return <Badge variant="secondary" className={`text-[11px] font-medium ${c.className}`}>{c.label}</Badge>
}

function getTicketStatusBadge(status: string) {
  const cfg: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' },
    in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    closed: { label: 'Closed', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  }
  const c = cfg[status] || cfg.open
  return <Badge variant="secondary" className={`text-[11px] font-medium ${c.className}`}>{c.label}</Badge>
}

function getPriorityBadge(priority: string) {
  const cfg: Record<string, { label: string; className: string }> = {
    low: { label: 'Low', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
    urgent: { label: 'Urgent', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' },
  }
  const c = cfg[priority] || cfg.medium
  return <Badge variant="outline" className={`text-[10px] ${c.className}`}>{c.label}</Badge>
}

function getAccessProgressColor(percentage: number) {
  if (percentage >= 90) return 'bg-rose-500'
  if (percentage >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

const emptyClientForm = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  industry: '',
  subscription: 'basic',
  resumeAccessLimit: '50',
  website: '',
  address: '',
  city: '',
  state: '',
  country: '',
}

const emptyTicketForm = {
  clientId: '',
  subject: '',
  description: '',
  category: 'service',
  priority: 'medium',
  assignedTo: '',
}

const ITEMS_PER_PAGE = 10

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i} className="p-4">
          <div className="h-4 rounded bg-muted animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  )
}

function SkeletonCard() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            <div className="h-7 w-12 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-muted animate-pulse" />
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientPortal() {
  const { toast } = useToast()
  const { activeSubItem, setActiveSubItem } = useHRMSStore()

  // Clear activeSubItem when navigating to this module
  useEffect(() => {
    if (activeSubItem) {
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // ── Tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('clients')

  // ── Client state ─────────────────────────────────────────────────────────
  const [clientSearch, setClientSearch] = useState('')
  const [clientFilterSub, setClientFilterSub] = useState('all')
  const [clientPage, setClientPage] = useState(1)
  const [addClientOpen, setAddClientOpen] = useState(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [clientForm, setClientForm] = useState(emptyClientForm)
  const [savingClient, setSavingClient] = useState(false)
  const [clientDetailOpen, setClientDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)

  // ── Ticket state ─────────────────────────────────────────────────────────
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketFilterStatus, setTicketFilterStatus] = useState('all')
  const [ticketFilterPriority, setTicketFilterPriority] = useState('all')
  const [ticketPage, setTicketPage] = useState(1)
  const [addTicketOpen, setAddTicketOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState(emptyTicketForm)
  const [savingTicket, setSavingTicket] = useState(false)
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null)
  const [ticketComment, setTicketComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // ── Access tracking state ────────────────────────────────────────────────
  const [accessFilterSub, setAccessFilterSub] = useState('all')
  const [accessSearch, setAccessSearch] = useState('')

  // ── API hooks ────────────────────────────────────────────────────────────

  const { data: clientsData, loading: clientsLoading, error: clientsError, refetch: refetchClients } = useApi<{
    clients: ClientData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/clients',
    params: {
      limit: 100,
      search: clientSearch || undefined,
      subscription: clientFilterSub !== 'all' ? clientFilterSub : undefined,
    },
  })

  const { data: allTicketsData, loading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useApi<{
    tickets: TicketData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/tickets',
    params: {
      limit: 100,
      search: ticketSearch || undefined,
      status: ticketFilterStatus !== 'all' ? ticketFilterStatus : undefined,
      priority: ticketFilterPriority !== 'all' ? ticketFilterPriority : undefined,
    },
  })

  const { data: clientTicketsData, loading: clientTicketsLoading, refetch: refetchClientTickets } = useApi<{
    tickets: TicketData[]
  }>({
    baseUrl: '/api/tickets',
    params: { limit: 100, clientId: selectedClient?.id },
    enabled: !!selectedClient && clientDetailOpen,
  })

  const { data: clientDetailData, refetch: refetchClientDetail } = useApi<ClientData & {
    resumeAccess: { id: string; candidateName: string; accessType: string; accessedAt: string; skills?: string; experience?: string }[]
  }>({
    baseUrl: `/api/clients/${selectedClient?.id}`,
    enabled: !!selectedClient && clientDetailOpen,
  })

  const { data: employeesData } = useApi<{
    employees: { id: string; firstName: string; lastName: string; email: string; designation?: string }[]
  }>({
    baseUrl: '/api/employees',
    params: { limit: 200, status: 'active' },
  })

  // ── Computed ─────────────────────────────────────────────────────────────

  const clients = clientsData?.clients ?? []
  const allTickets = allTicketsData?.tickets ?? []
  const employees = employeesData?.employees ?? []
  const clientDetailResumeAccess = clientDetailData?.resumeAccess ?? []

  // Client pagination
  const filteredClients = useMemo(() => clients, [clients])
  const totalClientPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  const paginatedClients = useMemo(
    () => filteredClients.slice((clientPage - 1) * ITEMS_PER_PAGE, clientPage * ITEMS_PER_PAGE),
    [filteredClients, clientPage]
  )

  // Ticket pagination & filtering
  const filteredTickets = useMemo(() => {
    let result = allTickets
    if (ticketFilterStatus !== 'all') {
      result = result.filter(t => t.status === ticketFilterStatus)
    }
    if (ticketFilterPriority !== 'all') {
      result = result.filter(t => t.priority === ticketFilterPriority)
    }
    if (ticketSearch) {
      const q = ticketSearch.toLowerCase()
      result = result.filter(t =>
        t.subject.toLowerCase().includes(q) ||
        t.client?.companyName?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [allTickets, ticketFilterStatus, ticketFilterPriority, ticketSearch])

  const totalTicketPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)
  const paginatedTickets = useMemo(
    () => filteredTickets.slice((ticketPage - 1) * ITEMS_PER_PAGE, ticketPage * ITEMS_PER_PAGE),
    [filteredTickets, ticketPage]
  )

  // Stats
  const totalClients = clientsData?.pagination?.total ?? clients.length
  const activeClients = clients.filter(c => c.isActive).length
  const activeTickets = allTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const resolvedThisMonth = allTickets.filter(t => {
    if (t.status !== 'resolved' && t.status !== 'closed') return false
    return new Date(t.updatedAt) >= startOfMonth
  }).length
  const totalResumesAccessed = clients.reduce((sum, c) => sum + (c.resumesAccessed ?? 0), 0)
  const totalResumeLimit = clients.reduce((sum, c) => sum + (c.resumeAccessLimit ?? 0), 0)

  // Access tracking data (filtered)
  const accessTrackingData = useMemo(() => {
    let result = clients
      .filter(c => c.isActive)
      .map(c => ({
        id: c.id,
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        email: c.email,
        subscription: c.subscription,
        resumesAccessed: c.resumesAccessed ?? 0,
        resumeAccessLimit: c.resumeAccessLimit ?? 50,
        percentage: c.resumeAccessLimit > 0 ? Math.round((c.resumesAccessed / c.resumeAccessLimit) * 100) : 0,
        remaining: Math.max(0, (c.resumeAccessLimit ?? 50) - (c.resumesAccessed ?? 0)),
        industry: c.industry,
      }))
    if (accessFilterSub !== 'all') {
      result = result.filter(c => c.subscription === accessFilterSub)
    }
    if (accessSearch) {
      const q = accessSearch.toLowerCase()
      result = result.filter(c =>
        c.companyName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => b.percentage - a.percentage)
  }, [clients, accessFilterSub, accessSearch])

  // ── Client handlers ──────────────────────────────────────────────────────

  const handleAddClient = useCallback(() => {
    setEditingClientId(null)
    setClientForm(emptyClientForm)
    setAddClientOpen(true)
  }, [])

  const handleEditClient = useCallback((client: ClientData) => {
    setEditingClientId(client.id)
    setClientForm({
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone || '',
      industry: client.industry || '',
      subscription: client.subscription,
      resumeAccessLimit: String(client.resumeAccessLimit),
      website: client.website || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      country: client.country || '',
    })
    setAddClientOpen(true)
  }, [])

  const handleSaveClient = useCallback(async () => {
    if (!clientForm.companyName || !clientForm.contactPerson || !clientForm.email) return
    setSavingClient(true)
    try {
      const body = {
        ...clientForm,
        resumeAccessLimit: parseInt(clientForm.resumeAccessLimit) || 50,
      }
      if (editingClientId) {
        await apiPatch(`/api/clients/${editingClientId}`, body)
        toast({ title: 'Client Updated', description: `${clientForm.companyName} updated successfully.` })
      } else {
        await apiPost('/api/clients', body)
        toast({ title: 'Client Added', description: `${clientForm.companyName} added successfully.` })
      }
      setAddClientOpen(false)
      setClientForm(emptyClientForm)
      setEditingClientId(null)
      refetchClients()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save client', variant: 'destructive' })
    } finally {
      setSavingClient(false)
    }
  }, [clientForm, editingClientId, refetchClients, toast])

  const handleDeleteClient = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return
    try {
      await apiDelete(`/api/clients/${id}`)
      toast({ title: 'Client Deleted', description: `${name} has been removed.`, variant: 'destructive' })
      refetchClients()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete client', variant: 'destructive' })
    }
  }, [refetchClients, toast])

  const handleViewClientDetail = useCallback((client: ClientData) => {
    setSelectedClient(client)
    setClientDetailOpen(true)
  }, [])

  // ── Ticket handlers ──────────────────────────────────────────────────────

  const handleAddTicket = useCallback(() => {
    setTicketForm(emptyTicketForm)
    setAddTicketOpen(true)
  }, [])

  const handleSaveTicket = useCallback(async () => {
    if (!ticketForm.clientId || !ticketForm.subject || !ticketForm.description) return
    setSavingTicket(true)
    try {
      await apiPost('/api/tickets', {
        ...ticketForm,
        assignedTo: ticketForm.assignedTo || null,
      })
      toast({ title: 'Ticket Created', description: `Ticket "${ticketForm.subject}" has been created.` })
      setAddTicketOpen(false)
      setTicketForm(emptyTicketForm)
      refetchTickets()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create ticket', variant: 'destructive' })
    } finally {
      setSavingTicket(false)
    }
  }, [ticketForm, refetchTickets, toast])

  const handleUpdateTicketStatus = useCallback(async (ticketId: string, status: string) => {
    try {
      await apiPatch(`/api/tickets/${ticketId}`, { status })
      refetchTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status } : null)
      }
      toast({ title: 'Ticket Updated', description: `Status changed to ${status.replace('_', ' ')}` })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update ticket', variant: 'destructive' })
    }
  }, [refetchTickets, selectedTicket, toast])

  const handleViewTicketDetail = useCallback((ticket: TicketData) => {
    setSelectedTicket(ticket)
    setTicketDetailOpen(true)
  }, [])

  const handleAddComment = useCallback(async () => {
    if (!ticketComment.trim() || !selectedTicket) return
    setSubmittingComment(true)
    try {
      await apiPost(`/api/tickets/${selectedTicket.id}/comments`, {
        content: ticketComment,
        authorType: 'employee',
        authorId: 'current-user',
        authorName: 'HR Admin',
      })
      setTicketComment('')
      refetchTickets()
      toast({ title: 'Comment Added' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add comment', variant: 'destructive' })
    } finally {
      setSubmittingComment(false)
    }
  }, [ticketComment, selectedTicket, refetchTickets, toast])

  const handleAssignTicket = useCallback(async (ticketId: string, assignedTo: string) => {
    try {
      await apiPatch(`/api/tickets/${ticketId}`, { assignedTo })
      refetchTickets()
      const emp = employees.find(e => e.id === assignedTo)
      toast({ title: 'Ticket Assigned', description: `Assigned to ${emp ? `${emp.firstName} ${emp.lastName}` : 'employee'}` })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to assign ticket', variant: 'destructive' })
    }
  }, [refetchTickets, employees, toast])

  // ── Pagination helpers ───────────────────────────────────────────────────

  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null
    return (
      <div className="flex items-center justify-between border-t px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
            className="h-8 px-2"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 px-2"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 px-2"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 px-2"
          >
            Last
          </Button>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Client Portal</h1>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {totalClients}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">Manage clients, tickets, and resume access</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {clientsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Total Clients</p>
                      <p className="text-2xl font-bold tracking-tight">{totalClients}</p>
                      <p className="text-xs text-muted-foreground">{activeClients} active</p>
                    </div>
                    <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950">
                      <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Active Tickets</p>
                      <p className="text-2xl font-bold tracking-tight">{activeTickets}</p>
                      <p className="text-xs text-muted-foreground">need attention</p>
                    </div>
                    <div className="rounded-lg bg-rose-100 p-2.5 dark:bg-rose-950">
                      <Ticket className="h-5 w-5 text-rose-700 dark:text-rose-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-rose-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Resolved This Month</p>
                      <p className="text-2xl font-bold tracking-tight">{resolvedThisMonth}</p>
                      <p className="text-xs text-muted-foreground">this month</p>
                    </div>
                    <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950">
                      <ShieldCheck className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Resume Access Used</p>
                      <p className="text-2xl font-bold tracking-tight">{totalResumesAccessed}</p>
                      <p className="text-xs text-muted-foreground">of {totalResumeLimit} total limit</p>
                    </div>
                    <div className="rounded-lg bg-cyan-100 p-2.5 dark:bg-cyan-950">
                      <FileText className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-transparent" />
              </Card>
            </>
          )}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="clients" className="gap-2">
              <Building2 className="h-4 w-4 hidden sm:block" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <Ticket className="h-4 w-4 hidden sm:block" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-2">
              <Eye className="h-4 w-4 hidden sm:block" />
              Access Tracking
            </TabsTrigger>
          </TabsList>

          {/* ─── CLIENTS TAB ──────────────────────────────────────────────── */}
          <TabsContent value="clients" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={clientSearch}
                    onChange={(e) => { setClientSearch(e.target.value); setClientPage(1) }}
                    className="h-9 w-full pl-9 sm:w-[260px]"
                  />
                  {clientSearch && (
                    <button onClick={() => { setClientSearch(''); setClientPage(1) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={clientFilterSub} onValueChange={(v) => { setClientFilterSub(v); setClientPage(1) }}>
                  <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                    <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddClient} className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                <Plus className="h-4 w-4" /> Add Client
              </Button>
            </div>

            {/* Client Table */}
            <Card>
              <CardContent className="p-0">
                {clientsLoading ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Company</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead className="hidden md:table-cell">Industry</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead className="hidden lg:table-cell">Resume Access</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
                    </TableBody>
                  </Table>
                ) : clientsError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{clientsError}</p>
                    <Button variant="outline" size="sm" onClick={refetchClients}>Retry</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Company</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead className="hidden md:table-cell">Industry</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead className="hidden lg:table-cell">Resume Access</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedClients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Building2 className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No clients found</p>
                                {clientSearch && <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : paginatedClients.map((client) => (
                          <TableRow key={client.id} className="group cursor-pointer hover:bg-muted/30" onClick={() => handleViewClientDetail(client)}>
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                  {client.companyName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{client.companyName}</p>
                                  <p className="text-muted-foreground truncate text-xs">{client.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{client.contactPerson}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className="text-[11px]">{client.industry || '—'}</Badge>
                            </TableCell>
                            <TableCell>{getSubscriptionBadge(client.subscription)}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={client.resumeAccessLimit > 0 ? (client.resumesAccessed / client.resumeAccessLimit) * 100 : 0}
                                  className="h-2 w-16"
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{client.resumesAccessed}/{client.resumeAccessLimit}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={`text-[11px] font-medium ${client.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {client.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950" onClick={() => handleViewClientDetail(client)} title="View Details">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950" onClick={() => handleEditClient(client)} title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950" onClick={() => handleDeleteClient(client.id, client.companyName)} title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {renderPagination(clientPage, totalClientPages, setClientPage)}
            </Card>
          </TabsContent>

          {/* ─── TICKETS TAB ──────────────────────────────────────────────── */}
          <TabsContent value="tickets" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={ticketSearch}
                    onChange={(e) => { setTicketSearch(e.target.value); setTicketPage(1) }}
                    className="h-9 w-full pl-9 sm:w-[240px]"
                  />
                  {ticketSearch && (
                    <button onClick={() => { setTicketSearch(''); setTicketPage(1) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={ticketFilterStatus} onValueChange={(v) => { setTicketFilterStatus(v); setTicketPage(1) }}>
                  <SelectTrigger className="w-full sm:w-[140px]" size="sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ticketFilterPriority} onValueChange={(v) => { setTicketFilterPriority(v); setTicketPage(1) }}>
                  <SelectTrigger className="w-full sm:w-[140px]" size="sm">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTicket} className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                <Plus className="h-4 w-4" /> Raise Ticket
              </Button>
            </div>

            {/* Ticket Table */}
            <Card>
              <CardContent className="p-0">
                {ticketsLoading ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Ticket</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                        <TableHead className="hidden md:table-cell">Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
                    </TableBody>
                  </Table>
                ) : ticketsError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{ticketsError}</p>
                    <Button variant="outline" size="sm" onClick={refetchTickets}>Retry</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Ticket</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                          <TableHead className="hidden md:table-cell">Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTickets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Ticket className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No tickets found</p>
                                {(ticketSearch || ticketFilterStatus !== 'all' || ticketFilterPriority !== 'all') && (
                                  <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : paginatedTickets.map((ticket) => (
                          <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/30" onClick={() => handleViewTicketDetail(ticket)}>
                            <TableCell className="pl-4">
                              <div className="min-w-0 max-w-[200px]">
                                <p className="truncate text-sm font-medium">{ticket.subject}</p>
                                <p className="text-muted-foreground truncate text-xs">{ticket.id.slice(0, 8)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="min-w-0 max-w-[150px]">
                                <p className="truncate text-sm">{ticket.client?.companyName || '—'}</p>
                                <p className="text-muted-foreground truncate text-xs">{ticket.client?.contactPerson || ''}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[11px] capitalize">{ticket.category}</Badge>
                            </TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell>{getTicketStatusBadge(ticket.status)}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {ticket.assignedTo ? (
                                <span className="text-sm">
                                  {(() => {
                                    const emp = employees.find(e => e.id === ticket.assignedTo)
                                    return emp ? `${emp.firstName} ${emp.lastName}` : ticket.assignedTo.slice(0, 8)
                                  })()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {formatRelativeTime(ticket.updatedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              {renderPagination(ticketPage, totalTicketPages, setTicketPage)}
            </Card>
          </TabsContent>

          {/* ─── ACCESS TRACKING TAB ──────────────────────────────────────── */}
          <TabsContent value="access" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={accessSearch}
                    onChange={(e) => setAccessSearch(e.target.value)}
                    className="h-9 w-full pl-9 sm:w-[260px]"
                  />
                  {accessSearch && (
                    <button onClick={() => setAccessSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={accessFilterSub} onValueChange={setAccessFilterSub}>
                  <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                    <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{accessTrackingData.length} clients</span>
                <span>·</span>
                <span>{accessTrackingData.reduce((s, c) => s + c.resumesAccessed, 0)} total accessed</span>
              </div>
            </div>

            {/* Summary bar */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Limit</p>
                    <p className="text-xl font-bold">{accessTrackingData.reduce((s, c) => s + c.resumeAccessLimit, 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Used</p>
                    <p className="text-xl font-bold">{accessTrackingData.reduce((s, c) => s + c.resumesAccessed, 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-xl font-bold">{accessTrackingData.reduce((s, c) => s + c.remaining, 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Avg Utilization</p>
                    <p className="text-xl font-bold">
                      {accessTrackingData.length > 0
                        ? Math.round(accessTrackingData.reduce((s, c) => s + c.percentage, 0) / accessTrackingData.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access tracking table */}
            <Card>
              <CardContent className="p-0">
                {clientsLoading ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Client</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="w-[200px]">Usage</TableHead>
                        <TableHead className="hidden sm:table-cell">Accessed</TableHead>
                        <TableHead className="hidden sm:table-cell">Limit</TableHead>
                        <TableHead className="hidden md:table-cell">Remaining</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
                    </TableBody>
                  </Table>
                ) : accessTrackingData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Eye className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No active clients to track</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Client</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead className="w-[200px]">Usage</TableHead>
                          <TableHead className="hidden sm:table-cell">Accessed</TableHead>
                          <TableHead className="hidden sm:table-cell">Limit</TableHead>
                          <TableHead className="hidden md:table-cell">Remaining</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accessTrackingData.map((item) => (
                          <TableRow key={item.id} className="cursor-pointer hover:bg-muted/30" onClick={() => {
                            const client = clients.find(c => c.id === item.id)
                            if (client) handleViewClientDetail(client)
                          }}>
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                  {item.companyName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{item.companyName}</p>
                                  <p className="text-muted-foreground truncate text-xs">{item.contactPerson}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getSubscriptionBadge(item.subscription)}</TableCell>
                            <TableCell>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{item.percentage}%</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${getAccessProgressColor(item.percentage)}`}
                                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm font-medium">{item.resumesAccessed}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{item.resumeAccessLimit}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className={`text-sm font-medium ${item.remaining <= 5 ? 'text-rose-600' : item.remaining <= 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {item.remaining}
                              </span>
                            </TableCell>
                            <TableCell>
                              {item.percentage >= 90 ? (
                                <Badge variant="secondary" className="text-[11px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">Critical</Badge>
                              ) : item.percentage >= 70 ? (
                                <Badge variant="secondary" className="text-[11px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">Warning</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Normal</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Add/Edit Client Dialog ────────────────────────────────────── */}
      <Dialog open={addClientOpen} onOpenChange={(open) => { setAddClientOpen(open); if (!open) { setEditingClientId(null); setClientForm(emptyClientForm) } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClientId ? 'Edit Client' : 'Add Client'}</DialogTitle>
            <DialogDescription>{editingClientId ? 'Update client information' : 'Add a new client to the system'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cp-companyName">Company Name *</Label>
                <Input id="cp-companyName" value={clientForm.companyName} onChange={(e) => setClientForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-contactPerson">Contact Person *</Label>
                <Input id="cp-contactPerson" value={clientForm.contactPerson} onChange={(e) => setClientForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="John Doe" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cp-email">Email *</Label>
                <Input id="cp-email" type="email" value={clientForm.email} onChange={(e) => setClientForm(f => ({ ...f, email: e.target.value }))} placeholder="john@acme.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-phone">Phone</Label>
                <Input id="cp-phone" value={clientForm.phone} onChange={(e) => setClientForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cp-industry">Industry</Label>
                <Select value={clientForm.industry} onValueChange={(v) => setClientForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT & Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance & Banking</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-subscription">Subscription</Label>
                <Select value={clientForm.subscription} onValueChange={(v) => setClientForm(f => ({ ...f, subscription: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cp-resumeAccessLimit">Resume Access Limit</Label>
                <Input id="cp-resumeAccessLimit" type="number" min="0" value={clientForm.resumeAccessLimit} onChange={(e) => setClientForm(f => ({ ...f, resumeAccessLimit: e.target.value }))} />
                <p className="text-[11px] text-muted-foreground">Max resumes client can view/download per month</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-website">Website</Label>
                <Input id="cp-website" value={clientForm.website} onChange={(e) => setClientForm(f => ({ ...f, website: e.target.value }))} placeholder="https://acme.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-address">Address</Label>
              <Textarea id="cp-address" value={clientForm.address} onChange={(e) => setClientForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cp-city">City</Label>
                <Input id="cp-city" value={clientForm.city} onChange={(e) => setClientForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-state">State</Label>
                <Input id="cp-state" value={clientForm.state} onChange={(e) => setClientForm(f => ({ ...f, state: e.target.value }))} placeholder="State" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp-country">Country</Label>
                <Input id="cp-country" value={clientForm.country} onChange={(e) => setClientForm(f => ({ ...f, country: e.target.value }))} placeholder="Country" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClientOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveClient} disabled={savingClient || !clientForm.companyName || !clientForm.contactPerson || !clientForm.email} className="bg-emerald-600 hover:bg-emerald-700">
              {savingClient ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingClientId ? 'Update Client' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Raise Ticket Dialog ────────────────────────────────────────── */}
      <Dialog open={addTicketOpen} onOpenChange={setAddTicketOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-emerald-600" />
              Raise Ticket
            </DialogTitle>
            <DialogDescription>Create a new support ticket for a client</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tk-client">Client *</Label>
              <Select value={ticketForm.clientId} onValueChange={(v) => setTicketForm(f => ({ ...f, clientId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk-subject">Subject *</Label>
              <Input id="tk-subject" value={ticketForm.subject} onChange={(e) => setTicketForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of the issue" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk-description">Description *</Label>
              <Textarea id="tk-description" value={ticketForm.description} onChange={(e) => setTicketForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description of the issue or request" rows={4} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tk-category">Category</Label>
                <Select value={ticketForm.category} onValueChange={(v) => setTicketForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tk-priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tk-assignedTo">Assign To</Label>
              <Select value={ticketForm.assignedTo} onValueChange={(v) => setTicketForm(f => ({ ...f, assignedTo: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}{emp.designation ? ` (${emp.designation})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTicketOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTicket} disabled={savingTicket || !ticketForm.clientId || !ticketForm.subject || !ticketForm.description} className="bg-emerald-600 hover:bg-emerald-700">
              {savingTicket ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Client Detail Sheet ──────────────────────────────────────────── */}
      <Sheet open={clientDetailOpen} onOpenChange={setClientDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                {selectedClient?.companyName?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold">{selectedClient?.companyName}</p>
                <p className="text-muted-foreground text-sm font-normal">{selectedClient?.contactPerson} · {selectedClient?.email}</p>
              </div>
            </SheetTitle>
          </SheetHeader>

          {selectedClient && (
            <div className="space-y-6 pb-8">
              {/* Client Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <Building2 className="h-4 w-4" /> Client Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Industry</p><p className="text-sm font-medium">{selectedClient.industry || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Subscription</p><div className="mt-0.5">{getSubscriptionBadge(selectedClient.subscription)}</div></div>
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedClient.phone || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Website</p><p className="text-sm font-medium truncate">{selectedClient.website || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium">{[selectedClient.city, selectedClient.state, selectedClient.country].filter(Boolean).join(', ') || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><div className="mt-0.5"><Badge variant="secondary" className={`text-[11px] ${selectedClient.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{selectedClient.isActive ? 'Active' : 'Inactive'}</Badge></div></div>
                </div>
              </div>

              <Separator />

              {/* Resume Access */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <FileText className="h-4 w-4" /> Resume Access
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usage this month</span>
                    <span className="text-sm font-medium">{selectedClient.resumesAccessed} / {selectedClient.resumeAccessLimit}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getAccessProgressColor(selectedClient.resumeAccessLimit > 0 ? (selectedClient.resumesAccessed / selectedClient.resumeAccessLimit) * 100 : 0)}`}
                      style={{ width: `${selectedClient.resumeAccessLimit > 0 ? Math.min(100, (selectedClient.resumesAccessed / selectedClient.resumeAccessLimit) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedClient.resumeAccessLimit - selectedClient.resumesAccessed} remaining accesses this month
                  </p>
                </div>
                {/* Recent access log */}
                {clientDetailResumeAccess.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Recent Access Log</p>
                    <ScrollArea className="max-h-32">
                      <div className="space-y-1">
                        {clientDetailResumeAccess.slice(0, 10).map(access => (
                          <div key={access.id} className="flex items-center justify-between rounded border p-2 text-xs">
                            <div className="flex items-center gap-2">
                              {access.accessType === 'download' ? <Download className="h-3 w-3 text-amber-500" /> : <Eye className="h-3 w-3 text-emerald-500" />}
                              <span className="font-medium truncate max-w-[150px]">{access.candidateName}</span>
                            </div>
                            <span className="text-muted-foreground">{formatRelativeTime(access.accessedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <Separator />

              {/* Tickets */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <Ticket className="h-4 w-4" /> Tickets ({clientTicketsData?.tickets?.length ?? 0})
                  </h3>
                </div>
                {clientTicketsLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
                ) : (clientTicketsData?.tickets ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No tickets yet</p>
                ) : (
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2">
                      {(clientTicketsData?.tickets ?? []).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer" onClick={() => {
                          setClientDetailOpen(false)
                          handleViewTicketDetail(ticket)
                        }}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground">{ticket.category} · {formatDate(ticket.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {getPriorityBadge(ticket.priority)}
                            {getTicketStatusBadge(ticket.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Ticket Detail Dialog ──────────────────────────────────────────── */}
      <Dialog open={ticketDetailOpen} onOpenChange={setTicketDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-emerald-600" />
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              {selectedTicket?.client?.companyName} · {selectedTicket?.category} · Priority: {selectedTicket?.priority}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {getTicketStatusBadge(selectedTicket.status)}
                {getPriorityBadge(selectedTicket.priority)}
                {selectedTicket.assignedTo && (
                  <Badge variant="outline" className="text-[11px] gap-1">
                    <Users className="h-3 w-3" />
                    {(() => {
                      const emp = employees.find(e => e.id === selectedTicket.assignedTo)
                      return emp ? `${emp.firstName} ${emp.lastName}` : 'Assigned'
                    })()}
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {selectedTicket.resolution && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Resolution</p>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.resolution}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Status Update */}
              <div>
                <Label className="text-sm font-medium">Update Status</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selectedTicket.status === s ? 'default' : 'outline'}
                      className={selectedTicket.status === s ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, s)}
                    >
                      {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Assign To */}
              <div>
                <Label className="text-sm font-medium">Assign To</Label>
                <Select
                  value={selectedTicket.assignedTo || 'none'}
                  onValueChange={(v) => handleAssignTicket(selectedTicket.id, v === 'none' ? '' : v)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Assign to employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}{emp.designation ? ` (${emp.designation})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <p className="text-sm font-medium mb-2">Comments ({selectedTicket.comments?.length ?? 0})</p>
                <ScrollArea className="max-h-40">
                  <div className="space-y-2">
                    {(selectedTicket.comments ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
                    ) : (selectedTicket.comments ?? []).map((comment) => (
                      <div key={comment.id} className="rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{comment.authorName}</span>
                          <Badge variant="outline" className="text-[9px] py-0">{comment.authorType}</Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Add a comment..."
                    value={ticketComment}
                    onChange={(e) => setTicketComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={submittingComment || !ticketComment.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                    {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
