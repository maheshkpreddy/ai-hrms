'use client'

import { useState } from 'react'
import {
  Ticket,
  Plus,
  Search,
  MessageSquare,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Trash2,
  Send,
  Filter,
  BarChart3,
  Upload,
  ArrowUpRight,
  X,
  FileText,
  TrendingUp,
  AlertCircle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketCategory = 'HR' | 'IT' | 'Payroll' | 'Admin' | 'Facilities'
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
type TicketStatus = 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed'

interface TicketItem {
  id: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assignedAgent: string
  createdDate: string
  description: string
  comments: CommentItem[]
}

interface CommentItem {
  id: string
  author: string
  message: string
  date: string
  isAgent: boolean
}

interface KnowledgeArticle {
  id: string
  title: string
  category: string
  summary: string
  views: number
  helpful: number
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const initialTickets: TicketItem[] = [
  {
    id: 'TK-001',
    subject: 'Cannot access payroll module',
    category: 'IT',
    priority: 'High',
    status: 'In Progress',
    assignedAgent: 'Rajesh Kumar',
    createdDate: '2026-03-01',
    description: 'Getting 403 Forbidden error when trying to access the payroll module. Other modules work fine. Tried clearing cache and using different browser.',
    comments: [
      { id: 'C001', author: 'Rajesh Kumar', message: 'Investigating the permission issue. It seems your role was not updated after the recent migration.', date: '2026-03-01', isAgent: true },
      { id: 'C002', author: 'You', message: 'Any update on this? I need to process the monthly payroll by Friday.', date: '2026-03-02', isAgent: false },
    ],
  },
  {
    id: 'TK-002',
    subject: 'Leave balance incorrect',
    category: 'HR',
    priority: 'Medium',
    status: 'Open',
    assignedAgent: 'Sneha R.',
    createdDate: '2026-03-02',
    description: 'My casual leave balance shows 3 days but I should have 8 days remaining as per my calculations. I have only used 4 CLs this year.',
    comments: [],
  },
  {
    id: 'TK-003',
    subject: 'Expense reimbursement delayed',
    category: 'Payroll',
    priority: 'High',
    status: 'Escalated',
    assignedAgent: 'Finance Team',
    createdDate: '2026-02-25',
    description: 'My travel expense reimbursement of ₹12,500 submitted on Feb 10th is still pending. It has been over 15 working days.',
    comments: [
      { id: 'C003', author: 'Finance Team', message: 'The expense is under review. There is a query on one of the bills.', date: '2026-02-28', isAgent: true },
      { id: 'C004', author: 'You', message: 'Which bill has the issue? All bills were uploaded correctly.', date: '2026-03-01', isAgent: false },
      { id: 'C005', author: 'Finance Team', message: 'Escalating to Finance Head for expedited processing.', date: '2026-03-02', isAgent: true },
    ],
  },
  {
    id: 'TK-004',
    subject: 'New laptop request',
    category: 'IT',
    priority: 'Low',
    status: 'Open',
    assignedAgent: 'IT Support',
    createdDate: '2026-03-03',
    description: 'My current laptop is 4 years old and very slow. Requesting a new laptop as per the 3-year replacement policy.',
    comments: [],
  },
  {
    id: 'TK-005',
    subject: 'Payslip not generated',
    category: 'Payroll',
    priority: 'Urgent',
    status: 'Resolved',
    assignedAgent: 'Payroll Team',
    createdDate: '2026-02-28',
    description: 'February 2026 payslip has not been generated. All other team members have received theirs. This is urgent as I need it for bank loan processing.',
    comments: [
      { id: 'C006', author: 'Payroll Team', message: 'Found the issue - your tax declaration was incomplete which blocked payslip generation. It has been resolved now.', date: '2026-03-01', isAgent: true },
      { id: 'C007', author: 'You', message: 'Thank you! I can see the payslip now.', date: '2026-03-01', isAgent: false },
    ],
  },
  {
    id: 'TK-006',
    subject: 'Office AC not working',
    category: 'Facilities',
    priority: 'Medium',
    status: 'Open',
    assignedAgent: 'Facilities Team',
    createdDate: '2026-03-03',
    description: 'The AC on the 3rd floor (wing B) has been non-functional since Monday. The temperature is uncomfortable for work.',
    comments: [],
  },
  {
    id: 'TK-007',
    subject: 'Profile update issue',
    category: 'HR',
    priority: 'Low',
    status: 'Closed',
    assignedAgent: 'HR Team',
    createdDate: '2026-02-20',
    description: 'Unable to update my emergency contact number in the profile section. Getting a validation error.',
    comments: [
      { id: 'C008', author: 'HR Team', message: 'The validation rule has been fixed. You should now be able to update the contact number.', date: '2026-02-21', isAgent: true },
      { id: 'C009', author: 'You', message: 'Confirmed, it works now. Thanks!', date: '2026-02-21', isAgent: false },
    ],
  },
  {
    id: 'TK-008',
    subject: 'VPN connection failing',
    category: 'IT',
    priority: 'High',
    status: 'In Progress',
    assignedAgent: 'IT Security',
    createdDate: '2026-03-03',
    description: 'VPN keeps disconnecting every 10-15 minutes while working from home. This is severely impacting productivity. Tried reinstalling the VPN client.',
    comments: [
      { id: 'C010', author: 'IT Security', message: 'We have identified a server-side issue with the VPN gateway. A fix is being deployed.', date: '2026-03-03', isAgent: true },
    ],
  },
]

const knowledgeArticles: KnowledgeArticle[] = [
  { id: 'KB-001', title: 'How to Apply Leave', category: 'HR', summary: 'Step-by-step guide to apply for different types of leaves including casual, sick, and earned leaves through the self-service portal.', views: 324, helpful: 89 },
  { id: 'KB-002', title: 'How to Update Bank Details', category: 'Payroll', summary: 'Instructions for updating your bank account details for salary credit. Requires HR approval and may take 1-2 payroll cycles.', views: 256, helpful: 72 },
  { id: 'KB-003', title: 'How to Raise Expense Claim', category: 'Finance', summary: 'Complete process for submitting expense reimbursement claims including required documents and approval workflow.', views: 198, helpful: 65 },
  { id: 'KB-004', title: 'How to Check Payslip', category: 'Payroll', summary: 'Guide to view, download, and understand your monthly payslip including breakdown of earnings and deductions.', views: 412, helpful: 95 },
  { id: 'KB-005', title: 'How to Reset Password', category: 'IT', summary: 'Self-service password reset procedure for all company systems. Includes steps for when MFA is enabled.', views: 567, helpful: 134 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPriorityBadge(priority: TicketPriority) {
  const config: Record<TicketPriority, { className: string }> = {
    Low: { className: 'bg-gray-100 text-gray-700 border-gray-200' },
    Medium: { className: 'bg-amber-100 text-amber-700 border-amber-200' },
    High: { className: 'bg-orange-100 text-orange-700 border-orange-200' },
    Urgent: { className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const cfg = config[priority]
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{priority}</Badge>
}

function getStatusBadge(status: TicketStatus) {
  const config: Record<TicketStatus, { className: string }> = {
    Open: { className: 'bg-sky-100 text-sky-700 border-sky-200' },
    'In Progress': { className: 'bg-amber-100 text-amber-700 border-amber-200' },
    Escalated: { className: 'bg-red-100 text-red-700 border-red-200' },
    Resolved: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Closed: { className: 'bg-gray-100 text-gray-500 border-gray-200' },
  }
  const cfg = config[status]
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{status}</Badge>
}

function getCategoryBadge(category: string) {
  const config: Record<string, { className: string }> = {
    HR: { className: 'bg-violet-100 text-violet-700 border-violet-200' },
    IT: { className: 'bg-sky-100 text-sky-700 border-sky-200' },
    Payroll: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Admin: { className: 'bg-orange-100 text-orange-700 border-orange-200' },
    Facilities: { className: 'bg-teal-100 text-teal-700 border-teal-200' },
    Finance: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }
  const cfg = config[category] || config.IT
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{category}</Badge>
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HelpdeskModule() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const tabMap: Record<string, string> = { 'my-tickets': 'my-tickets', 'raise': 'raise-ticket', 'kb': 'knowledge-base', 'sla': 'sla-tracking', 'hr-helpdesk': 'my-tickets', 'it-helpdesk': 'my-tickets', 'knowledge-base': 'knowledge-base' }
  const [manualTab, setManualTab] = useState('my-tickets')
  // Derive active tab: sidebar sub-item takes priority, then manual tab
  const activeTab = (activeSubItem && tabMap[activeSubItem]) ? tabMap[activeSubItem] : manualTab

  const handleTabChange = (tab: string) => {
    setManualTab(tab)
    setActiveSubItem(null)
  }
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [kbSearch, setKbSearch] = useState('')
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'IT' as TicketCategory,
    priority: 'Medium' as TicketPriority,
    attachment: '',
  })

  const filteredTickets = tickets.filter(t =>
    (filterStatus === 'all' || t.status === filterStatus) &&
    (filterPriority === 'all' || t.priority === filterPriority) &&
    (t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredKB = knowledgeArticles.filter(a =>
    a.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
    a.summary.toLowerCase().includes(kbSearch.toLowerCase()) ||
    a.category.toLowerCase().includes(kbSearch.toLowerCase())
  )

  const openCount = tickets.filter(t => t.status === 'Open').length
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length
  const escalatedCount = tickets.filter(t => t.status === 'Escalated').length
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length

  // SLA Metrics
  const slaMetrics = {
    avgResponseTime: '2.4 hrs',
    avgResolutionTime: '18.6 hrs',
    withinSla: 87,
    slaBreaches: 3,
    totalTickets: tickets.length,
    resolvedWithinSla: 5,
  }

  const categorySla = [
    { category: 'IT', avgResponse: '1.8 hrs', avgResolution: '16 hrs', compliance: 85, total: 3, breached: 1 },
    { category: 'HR', avgResponse: '3.2 hrs', avgResolution: '24 hrs', compliance: 90, total: 2, breached: 0 },
    { category: 'Payroll', avgResponse: '2.1 hrs', avgResolution: '36 hrs', compliance: 75, total: 2, breached: 1 },
    { category: 'Facilities', avgResponse: '4.5 hrs', avgResolution: '48 hrs', compliance: 100, total: 1, breached: 0 },
    { category: 'Admin', avgResponse: '3.0 hrs', avgResolution: '12 hrs', compliance: 95, total: 0, breached: 0 },
  ]

  function handleRaiseTicket() {
    const newTicket: TicketItem = {
      id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: ticketForm.subject,
      description: ticketForm.description,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: 'Open',
      assignedAgent: ticketForm.category === 'IT' ? 'IT Support' : ticketForm.category === 'Payroll' ? 'Payroll Team' : ticketForm.category === 'HR' ? 'HR Team' : ticketForm.category === 'Facilities' ? 'Facilities Team' : 'Admin Team',
      createdDate: new Date().toISOString().split('T')[0],
      comments: [],
    }
    setTickets(prev => [newTicket, ...prev])
    setTicketForm({ subject: '', description: '', category: 'IT', priority: 'Medium', attachment: '' })
    handleTabChange('my-tickets')
  }

  function handleAddComment() {
    if (!selectedTicket || !newComment.trim()) return
    const comment: CommentItem = { id: `C${Date.now()}`, author: 'You', message: newComment, date: new Date().toISOString().split('T')[0], isAgent: false }
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, comments: [...t.comments, comment] } : t))
    setSelectedTicket(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null)
    setNewComment('')
  }

  function handleStatusChange(ticketId: string, newStatus: TicketStatus) {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  function handleDelete(id: string) {
    setTickets(prev => prev.filter(t => t.id !== id))
    setDeleteConfirm(null)
    if (selectedTicket?.id === id) setDetailOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Ticket className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Helpdesk</h1>
              <p className="text-muted-foreground text-sm">{tickets.length} tickets · {escalatedCount} escalated</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tickets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-9 w-full pl-9 sm:w-[200px]" />
            </div>
            <Button onClick={() => handleTabChange('raise-ticket')} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Raise Ticket
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-sky-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold">{openCount}</p></CardContent></Card>
          <Card className="border-l-4 border-l-amber-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold">{inProgressCount}</p></CardContent></Card>
          <Card className="border-l-4 border-l-red-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Escalated</p><p className="text-2xl font-bold">{escalatedCount}</p></CardContent></Card>
          <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold">{resolvedCount}</p></CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="my-tickets" className="gap-1.5"><Ticket className="h-3.5 w-3.5" /> My Tickets</TabsTrigger>
            <TabsTrigger value="raise-ticket" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Raise Ticket</TabsTrigger>
            <TabsTrigger value="knowledge-base" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Knowledge Base</TabsTrigger>
            <TabsTrigger value="sla-tracking" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> SLA Tracking</TabsTrigger>
          </TabsList>

          {/* My Tickets Tab */}
          <TabsContent value="my-tickets">
            {/* Filters */}
            <Card className="mb-4">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[140px]" size="sm"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Escalated">Escalated</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full sm:w-[140px]" size="sm"><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">ID</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="hidden sm:table-cell">Category</TableHead>
                        <TableHead className="hidden sm:table-cell">Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Assigned Agent</TableHead>
                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No tickets found</TableCell></TableRow>
                      ) : filteredTickets.map(ticket => (
                        <TableRow key={ticket.id} className="group cursor-pointer" onClick={() => { setSelectedTicket(ticket); setDetailOpen(true) }}>
                          <TableCell className="pl-4">
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{ticket.id}</code>
                          </TableCell>
                          <TableCell className="text-sm font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                          <TableCell className="hidden sm:table-cell">{getCategoryBadge(ticket.category)}</TableCell>
                          <TableCell className="hidden sm:table-cell">{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{ticket.assignedAgent}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">{formatDate(ticket.createdDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => { setSelectedTicket(ticket); setDetailOpen(true) }}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteConfirm(ticket.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Raise Ticket Tab */}
          <TabsContent value="raise-ticket">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-600" /> Create New Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 max-w-lg">
                  <div>
                    <Label>Subject</Label>
                    <Input value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} placeholder="Brief description of the issue" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={ticketForm.category} onValueChange={v => setTicketForm({ ...ticketForm, category: v as TicketCategory })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="Payroll">Payroll</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Facilities">Facilities</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={ticketForm.priority} onValueChange={v => setTicketForm({ ...ticketForm, priority: v as TicketPriority })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} placeholder="Describe your issue in detail..." rows={5} />
                  </div>
                  <div>
                    <Label>Attachment</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="gap-2" onClick={() => setTicketForm({ ...ticketForm, attachment: 'screenshot.png' })}>
                        <Upload className="h-4 w-4" /> Upload File
                      </Button>
                      {ticketForm.attachment && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          {ticketForm.attachment}
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setTicketForm({ ...ticketForm, attachment: '' })}><X className="h-3 w-3" /></Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleRaiseTicket} className="w-fit bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={!ticketForm.subject || !ticketForm.description}>
                    <Plus className="h-4 w-4" /> Submit Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge-base">
            <Card className="mb-4">
              <CardContent className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search articles..." value={kbSearch} onChange={e => setKbSearch(e.target.value)} className="h-9 pl-9" />
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredKB.map(article => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getCategoryBadge(article.category)}
                          <span className="text-xs text-muted-foreground">{article.views} views</span>
                          <span className="text-xs text-muted-foreground">· {article.helpful} helpful</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredKB.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No articles found matching your search.</CardContent></Card>
            )}
          </TabsContent>

          {/* SLA Tracking Tab */}
          <TabsContent value="sla-tracking">
            {/* SLA Overview Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
              <Card className="border-l-4 border-l-sky-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-sky-600" />
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  <p className="text-2xl font-bold">{slaMetrics.avgResponseTime}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1"><TrendingUp className="h-3 w-3" /> 12% faster</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                  </div>
                  <p className="text-2xl font-bold">{slaMetrics.avgResolutionTime}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-0.5 mt-1"><TrendingUp className="h-3 w-3" /> 8% faster</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm text-muted-foreground">Tickets Within SLA</p>
                  </div>
                  <p className="text-2xl font-bold">{slaMetrics.withinSla}%</p>
                  <Progress value={slaMetrics.withinSla} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-muted-foreground">SLA Breaches</p>
                  </div>
                  <p className="text-2xl font-bold">{slaMetrics.slaBreaches}</p>
                  <p className="text-xs text-red-600 mt-1">Needs attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Category-wise SLA */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">SLA by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySla.map(sla => (
                  <div key={sla.category} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getCategoryBadge(sla.category)}
                        <span className="text-sm text-muted-foreground">{sla.total} tickets</span>
                      </div>
                      <Badge variant="outline" className={`text-[11px] ${sla.compliance >= 90 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : sla.compliance >= 75 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {sla.compliance}% SLA
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div><span className="text-muted-foreground">Avg Response:</span> <span className="font-medium">{sla.avgResponse}</span></div>
                      <div><span className="text-muted-foreground">Avg Resolution:</span> <span className="font-medium">{sla.avgResolution}</span></div>
                      <div><span className="text-muted-foreground">Breaches:</span> <span className={`font-medium ${sla.breached > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{sla.breached}</span></div>
                    </div>
                    <Progress value={sla.compliance} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{selectedTicket.id}</code>
                  {selectedTicket.subject}
                </DialogTitle>
                <DialogDescription>{selectedTicket.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {getCategoryBadge(selectedTicket.category)}
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                  <span className="text-xs text-muted-foreground">Created {formatDate(selectedTicket.createdDate)}</span>
                </div>

                <div className="flex gap-2 items-center">
                  <Select value={selectedTicket.status} onValueChange={v => handleStatusChange(selectedTicket.id, v as TicketStatus)}>
                    <SelectTrigger className="w-[160px]" size="sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Escalated">Escalated</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">Assigned: {selectedTicket.assignedAgent}</span>
                </div>

                <Separator />

                {/* Comments Thread */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" /> Comments ({selectedTicket.comments.length})
                  </h4>
                  <ScrollArea className="max-h-60">
                    <div className="space-y-3">
                      {selectedTicket.comments.map(comment => (
                        <div key={comment.id} className={`rounded-lg border p-3 ${comment.isAgent ? 'bg-muted/30 border-muted' : 'bg-emerald-50/50 border-emerald-100'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.message}</p>
                        </div>
                      ))}
                      {selectedTicket.comments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1" onKeyDown={e => { if (e.key === 'Enter') handleAddComment() }} />
                  <Button onClick={handleAddComment} className="bg-emerald-600 hover:bg-emerald-700" disabled={!newComment.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The ticket will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
