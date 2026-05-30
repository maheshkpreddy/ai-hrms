'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Users,
  Upload,
  Sun,
  Moon,
  Paperclip,
  Info,
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

interface LeaveRecord {
  id: string
  employeeName: string
  employeeId: string
  type: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Comp Off' | 'Loss of Pay'
  startDate: string
  endDate: string
  halfDay: boolean
  halfDayPeriod?: 'first-half' | 'second-half'
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  appliedDate: string
  approvedBy: string | null
  comments: string
  attachment: string | null
}

interface LeaveBalance {
  type: string
  total: number
  used: number
  pending: number
  available: number
  carryForward: number
  color: string
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const initialLeaves: LeaveRecord[] = [
  { id: 'LV001', employeeName: 'Aarav Sharma', employeeId: 'EMP001', type: 'Earned Leave', startDate: '2026-05-25', endDate: '2026-05-27', halfDay: false, days: 3, reason: 'Family vacation', status: 'approved', appliedDate: '2026-05-10', approvedBy: 'Rahul M.', comments: 'Enjoy your vacation!', attachment: null },
  { id: 'LV002', employeeName: 'Meera Patel', employeeId: 'EMP002', type: 'Casual Leave', startDate: '2026-05-28', endDate: '2026-05-29', halfDay: false, days: 2, reason: 'Personal work', status: 'pending', appliedDate: '2026-05-20', approvedBy: null, comments: '', attachment: null },
  { id: 'LV003', employeeName: 'Vikram Singh', employeeId: 'EMP003', type: 'Sick Leave', startDate: '2026-05-18', endDate: '2026-05-19', halfDay: false, days: 2, reason: 'Fever and cold', status: 'approved', appliedDate: '2026-05-18', approvedBy: 'Deepak T.', comments: 'Get well soon', attachment: 'medical_cert.pdf' },
  { id: 'LV004', employeeName: 'Ananya Reddy', employeeId: 'EMP004', type: 'Comp Off', startDate: '2026-05-30', endDate: '2026-05-30', halfDay: true, halfDayPeriod: 'first-half', days: 0.5, reason: 'Worked on weekend for release', status: 'pending', appliedDate: '2026-05-21', approvedBy: null, comments: '', attachment: null },
  { id: 'LV005', employeeName: 'Rohan Joshi', employeeId: 'EMP005', type: 'Earned Leave', startDate: '2026-06-01', endDate: '2026-06-05', halfDay: false, days: 5, reason: 'Travel to hometown', status: 'pending', appliedDate: '2026-05-19', approvedBy: null, comments: '', attachment: null },
  { id: 'LV006', employeeName: 'Aarav Sharma', employeeId: 'EMP001', type: 'Casual Leave', startDate: '2026-04-15', endDate: '2026-04-15', halfDay: true, halfDayPeriod: 'second-half', days: 0.5, reason: 'Doctor appointment', status: 'approved', appliedDate: '2026-04-13', approvedBy: 'Rahul M.', comments: '', attachment: null },
  { id: 'LV007', employeeName: 'Meera Patel', employeeId: 'EMP002', type: 'Sick Leave', startDate: '2026-04-08', endDate: '2026-04-09', halfDay: false, days: 2, reason: 'Migraine', status: 'approved', appliedDate: '2026-04-08', approvedBy: 'Sneha R.', comments: '', attachment: null },
  { id: 'LV008', employeeName: 'Vikram Singh', employeeId: 'EMP003', type: 'Loss of Pay', startDate: '2026-06-10', endDate: '2026-06-12', halfDay: false, days: 3, reason: 'Personal emergency - no leave balance', status: 'rejected', appliedDate: '2026-05-20', approvedBy: 'Deepak T.', comments: 'Please manage within available leaves', attachment: null },
  { id: 'LV009', employeeName: 'Ananya Reddy', employeeId: 'EMP004', type: 'Casual Leave', startDate: '2026-05-12', endDate: '2026-05-12', halfDay: false, days: 1, reason: 'Home maintenance', status: 'cancelled', appliedDate: '2026-05-10', approvedBy: null, comments: 'Cancelled by employee', attachment: null },
  { id: 'LV010', employeeName: 'Rohan Joshi', employeeId: 'EMP005', type: 'Earned Leave', startDate: '2026-05-22', endDate: '2026-05-23', halfDay: false, days: 2, reason: 'Personal work', status: 'approved', appliedDate: '2026-05-18', approvedBy: 'Deepak T.', comments: '', attachment: null },
]

const leaveBalances: LeaveBalance[] = [
  { type: 'Casual Leave', total: 12, used: 5, pending: 1, available: 6, carryForward: 0, color: '#38bdf8' },
  { type: 'Sick Leave', total: 10, used: 2, pending: 0, available: 8, carryForward: 0, color: '#f87171' },
  { type: 'Earned Leave', total: 15, used: 3, pending: 3, available: 9, carryForward: 3, color: '#6ee7b7' },
  { type: 'Comp Off', total: 2, used: 0, pending: 1, available: 1, carryForward: 0, color: '#c4b5fd' },
]

const leavePolicies = [
  { type: 'Casual Leave', entitlement: '12 days/year', carryForward: 'Not allowed', encashment: 'Not allowed', probation: 'After 3 months', description: 'For personal work, short emergencies, or family obligations. Must be applied 2 days in advance except emergencies.', halfDayAllowed: true, maxConsecutive: 3 },
  { type: 'Sick Leave', entitlement: '10 days/year', carryForward: 'Not allowed', encashment: 'Not allowed', probation: 'From Day 1', description: 'For illness, medical appointments, or health-related absences. Medical certificate required for 3+ consecutive days.', halfDayAllowed: true, maxConsecutive: 5 },
  { type: 'Earned Leave', entitlement: '15 days/year', carryForward: 'Up to 5 days', encashment: 'Up to 10 days/year', probation: 'After 6 months', description: 'Accumulated leave for planned vacations. Accrues monthly at 1.25 days. Requires 5 days advance notice.', halfDayAllowed: false, maxConsecutive: 10 },
  { type: 'Comp Off', entitlement: 'As earned', carryForward: 'Within 30 days', encashment: 'Not allowed', probation: 'From Day 1', description: 'Compensatory off for working on weekends or public holidays. Must be availed within 30 days of earning.', halfDayAllowed: true, maxConsecutive: 2 },
]

const teamMembers = [
  { name: 'Aarav Sharma', id: 'EMP001' },
  { name: 'Meera Patel', id: 'EMP002' },
  { name: 'Vikram Singh', id: 'EMP003' },
  { name: 'Ananya Reddy', id: 'EMP004' },
  { name: 'Rohan Joshi', id: 'EMP005' },
]

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  }
  const cfg = config[status] || config.pending
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getLeaveTypeColor(type: string) {
  const colors: Record<string, string> = {
    'Casual Leave': 'bg-sky-200 text-sky-800',
    'Sick Leave': 'bg-red-200 text-red-800',
    'Earned Leave': 'bg-emerald-200 text-emerald-800',
    'Comp Off': 'bg-violet-200 text-violet-800',
    'Loss of Pay': 'bg-gray-200 text-gray-800',
  }
  return colors[type] || 'bg-gray-200 text-gray-800'
}

function getLeaveTypeBg(type: string) {
  const colors: Record<string, string> = {
    'Casual Leave': 'bg-sky-100 border-sky-300',
    'Sick Leave': 'bg-red-100 border-red-300',
    'Earned Leave': 'bg-emerald-100 border-emerald-300',
    'Comp Off': 'bg-violet-100 border-violet-300',
    'Loss of Pay': 'bg-gray-100 border-gray-300',
  }
  return colors[type] || 'bg-gray-100 border-gray-300'
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeaveManagement() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [localTab, setLocalTab] = useState('my-leaves')
  const [leaves, setLeaves] = useState<LeaveRecord[]>(initialLeaves)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [applyOpen, setApplyOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave' as LeaveRecord['type'],
    startDate: '',
    endDate: '',
    halfDay: false,
    halfDayPeriod: 'first-half' as 'first-half' | 'second-half',
    reason: '',
    attachment: null as string | null,
  })

  const tabMap: Record<string, string> = { 'my-leaves': 'my-leaves', 'balance': 'leave-balance', 'policy': 'leave-policy', 'calendar': 'team-calendar', 'leave-requests': 'my-leaves', 'leave-balance': 'leave-balance', 'leave-calendar': 'team-calendar' }
  const activeTab = (activeSubItem && tabMap[activeSubItem]) || localTab

  useEffect(() => {
    if (activeSubItem) setActiveSubItem(null)
  }, [activeSubItem, setActiveSubItem])

  const myLeaves = leaves.filter(l => l.employeeId === 'EMP001')
  const pendingApprovals = leaves.filter(l => l.status === 'pending' && l.employeeId !== 'EMP001')

  const filteredMyLeaves = myLeaves.filter(l =>
    (filterStatus === 'all' || l.status === filterStatus) &&
    (l.type.toLowerCase().includes(searchQuery.toLowerCase()) || l.reason.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  function handleApplyLeave() {
    const start = new Date(leaveForm.startDate)
    const end = new Date(leaveForm.endDate)
    const days = leaveForm.halfDay ? 0.5 : Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    const newLeave: LeaveRecord = {
      id: `LV${String(leaves.length + 1).padStart(3, '0')}`,
      employeeName: 'Aarav Sharma',
      employeeId: 'EMP001',
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.halfDay ? leaveForm.startDate : leaveForm.endDate,
      halfDay: leaveForm.halfDay,
      halfDayPeriod: leaveForm.halfDay ? leaveForm.halfDayPeriod : undefined,
      days,
      reason: leaveForm.reason,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: null,
      comments: '',
      attachment: leaveForm.attachment,
    }
    setLeaves(prev => [newLeave, ...prev])
    setApplyOpen(false)
    setLeaveForm({ type: 'Casual Leave', startDate: '', endDate: '', halfDay: false, halfDayPeriod: 'first-half', reason: '', attachment: null })
  }

  function handleApproveLeave(id: string) {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved', approvedBy: 'Aarav Sharma', comments: 'Approved' } : l))
  }

  function handleRejectLeave(id: string) {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected', approvedBy: 'Aarav Sharma', comments: 'Rejected' } : l))
  }

  function handleCancelLeave(id: string) {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'cancelled', comments: 'Cancelled by employee' } : l))
  }

  // Calendar helpers
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay()

  function getLeavesForDate(day: number) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leaves.filter(l => {
      const start = l.startDate
      const end = l.endDate
      return dateStr >= start && dateStr <= end && l.status !== 'cancelled'
    })
  }

  const totalBalance = leaveBalances.reduce((s, b) => s + b.available, 0)
  const pendingCount = leaves.filter(l => l.status === 'pending').length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
              <p className="text-muted-foreground text-sm">{totalBalance} days available · {pendingCount} pending approvals</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-9 w-full pl-9 sm:w-[200px]" />
            </div>
            <Button onClick={() => setApplyOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Apply Leave
            </Button>
          </div>
        </div>

        {/* Leave Balance Quick Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {leaveBalances.map(balance => (
            <Card key={balance.type} className="border-l-4" style={{ borderLeftColor: balance.color }}>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{balance.type}</p>
                <p className="text-xl font-bold">{balance.available}<span className="text-sm font-normal text-muted-foreground">/{balance.total}</span></p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>{balance.used} used</span>
                  {balance.pending > 0 && <span className="text-amber-600">· {balance.pending} pending</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setLocalTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="my-leaves" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> My Leaves</TabsTrigger>
            <TabsTrigger value="leave-balance" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Balance</TabsTrigger>
            <TabsTrigger value="leave-policy" className="gap-1.5"><Info className="h-3.5 w-3.5" /> Policy</TabsTrigger>
            <TabsTrigger value="team-calendar" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Calendar</TabsTrigger>
          </TabsList>

          {/* ─── My Leaves Tab ────────────────────────────────────────────── */}
          <TabsContent value="my-leaves">
            {/* Pending Approvals (Manager View) */}
            {pendingApprovals.length > 0 && (
              <Card className="mb-4 border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" /> Pending Approvals ({pendingApprovals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-amber-100/50">
                          <TableHead className="pl-4">Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="hidden sm:table-cell">Dates</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingApprovals.map(leave => (
                          <TableRow key={leave.id}>
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                                  {leave.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-sm font-medium">{leave.employeeName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{leave.type}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{formatDate(leave.startDate)}{!leave.halfDay && leave.startDate !== leave.endDate ? ` - ${formatDate(leave.endDate)}` : ''}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[11px]">
                                {leave.halfDay ? '0.5' : leave.days} {leave.halfDay ? `(${leave.halfDayPeriod === 'first-half' ? '1st' : '2nd'} Half)` : ''}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(leave.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleApproveLeave(leave.id)}><CheckCircle2 className="h-3 w-3" /> Approve</Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-600" onClick={() => handleRejectLeave(leave.id)}><XCircle className="h-3 w-3" /> Reject</Button>
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

            {/* My Leaves */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">My Leave Applications</CardTitle>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px]" ><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead className="hidden sm:table-cell">To</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead className="hidden md:table-cell">Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMyLeaves.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No leave records found</TableCell></TableRow>
                      ) : filteredMyLeaves.map(leave => (
                        <TableRow key={leave.id}>
                          <TableCell className="pl-4">
                            <Badge variant="outline" className={`text-[11px] ${getLeaveTypeColor(leave.type)}`}>{leave.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(leave.startDate)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{leave.halfDay ? '—' : formatDate(leave.endDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-[11px]">{leave.halfDay ? '0.5' : leave.days}</Badge>
                              {leave.halfDay && <span className="text-[10px] text-muted-foreground">{leave.halfDayPeriod === 'first-half' ? '1st Half' : '2nd Half'}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm max-w-[150px] truncate">{leave.reason}</TableCell>
                          <TableCell>{getStatusBadge(leave.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {leave.attachment && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" title={leave.attachment}>
                                  <Paperclip className="h-3 w-3" />
                                </Button>
                              )}
                              {leave.status === 'pending' && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-600" onClick={() => handleCancelLeave(leave.id)}>Cancel</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                  Showing {filteredMyLeaves.length} leave application(s)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Leave Balance Tab ────────────────────────────────────────── */}
          <TabsContent value="leave-balance">
            <div className="grid gap-4 sm:grid-cols-2">
              {leaveBalances.map(balance => (
                <Card key={balance.type} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold">{balance.type}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {balance.carryForward > 0 && `${balance.carryForward} days carried forward`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold" style={{ color: balance.color }}>{balance.available}</p>
                        <p className="text-xs text-muted-foreground">of {balance.total} days</p>
                      </div>
                    </div>
                    <Progress value={balance.total > 0 ? ((balance.total - balance.available) / balance.total) * 100 : 0} className="h-3 mb-4" />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-sky-50 p-2">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-sm font-bold">{balance.total}</p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-2">
                        <p className="text-xs text-muted-foreground">Used</p>
                        <p className="text-sm font-bold text-red-600">{balance.used}</p>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-2">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-sm font-bold text-amber-600">{balance.pending}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── Leave Policy Tab ─────────────────────────────────────────── */}
          <TabsContent value="leave-policy">
            <div className="space-y-4">
              {leavePolicies.map(policy => (
                <Card key={policy.type} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getLeaveTypeBg(policy.type)} border`}>
                        <Calendar className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{policy.type}</p>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Entitlement</p>
                        <p className="text-sm font-medium mt-0.5">{policy.entitlement}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Carry Forward</p>
                        <p className="text-sm font-medium mt-0.5">{policy.carryForward}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Encashment</p>
                        <p className="text-sm font-medium mt-0.5">{policy.encashment}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Half Day</p>
                        <p className="text-sm font-medium mt-0.5">{policy.halfDayAllowed ? 'Allowed' : 'Not Allowed'}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">During Probation</p>
                        <p className="text-sm font-medium mt-0.5">{policy.probation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── Team Calendar Tab ────────────────────────────────────────── */}
          <TabsContent value="team-calendar">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" /> Team Leave Calendar
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1) } else setCalendarMonth(calendarMonth - 1) }}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm font-medium min-w-[140px] text-center">{monthNames[calendarMonth]} {calendarYear}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1) } else setCalendarMonth(calendarMonth + 1) }}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {['Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off'].map(type => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className={`h-3 w-3 rounded-sm ${getLeaveTypeColor(type).split(' ')[0]}`} />
                      <span className="text-xs">{type}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {teamMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-semibold text-emerald-700">
                          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-[10px] text-muted-foreground hidden lg:inline">{m.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px]" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dayLeaves = getLeavesForDate(day)
                    const isToday = day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear()
                    const isWeekend = new Date(calendarYear, calendarMonth, day).getDay() === 0 || new Date(calendarYear, calendarMonth, day).getDay() === 6
                    return (
                      <div key={day} className={`min-h-[70px] sm:min-h-[90px] rounded-lg border p-1.5 text-xs transition-colors ${isToday ? 'border-emerald-400 bg-emerald-50' : isWeekend ? 'bg-muted/20' : 'hover:bg-muted/30'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${isToday ? 'bg-emerald-600 text-white rounded-full h-5 w-5 flex items-center justify-center' : isWeekend ? 'text-muted-foreground' : ''}`}>{day}</span>
                        </div>
                        <div className="mt-0.5 space-y-0.5">
                          {dayLeaves.slice(0, 2).map(leave => (
                            <div key={leave.id} className={`rounded px-1 py-0.5 text-[9px] truncate font-medium ${getLeaveTypeColor(leave.type)}`}>
                              {leave.employeeName.split(' ')[0]}{leave.halfDay ? ` (${leave.halfDayPeriod === 'first-half' ? '1H' : '2H'})` : ''}
                            </div>
                          ))}
                          {dayLeaves.length > 2 && (
                            <div className="text-[9px] text-muted-foreground pl-1">+{dayLeaves.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Apply Leave Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-600" /> Apply for Leave</DialogTitle>
            <DialogDescription>Submit your leave application for approval.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Leave Type</Label>
              <Select value={leaveForm.type} onValueChange={v => setLeaveForm({ ...leaveForm, type: v as LeaveRecord['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual Leave">Casual Leave (6 available)</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave (8 available)</SelectItem>
                  <SelectItem value="Earned Leave">Earned Leave (9 available)</SelectItem>
                  <SelectItem value="Comp Off">Comp Off (1 available)</SelectItem>
                  <SelectItem value="Loss of Pay">Loss of Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Date</Label>
                <Input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value, endDate: leaveForm.halfDay ? e.target.value : leaveForm.endDate })} />
              </div>
              <div>
                <Label>To Date</Label>
                <Input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} disabled={leaveForm.halfDay} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="half-day-toggle" className="text-sm">Half Day</Label>
                <input
                  id="half-day-toggle"
                  type="checkbox"
                  checked={leaveForm.halfDay}
                  onChange={e => setLeaveForm({ ...leaveForm, halfDay: e.target.checked, endDate: e.target.checked ? leaveForm.startDate : leaveForm.endDate })}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              {leaveForm.halfDay && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Period:</Label>
                  <Select value={leaveForm.halfDayPeriod} onValueChange={v => setLeaveForm({ ...leaveForm, halfDayPeriod: v as 'first-half' | 'second-half' })}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-half">
                        <span className="flex items-center gap-1"><Sun className="h-3 w-3" /> First Half</span>
                      </SelectItem>
                      <SelectItem value="second-half">
                        <span className="flex items-center gap-1"><Moon className="h-3 w-3" /> Second Half</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {leaveForm.startDate && (leaveForm.endDate || leaveForm.halfDay) && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                <span className="font-medium text-emerald-700">Duration:</span>{' '}
                <span className="text-emerald-700">
                  {leaveForm.halfDay
                    ? `0.5 day (${leaveForm.halfDayPeriod === 'first-half' ? 'First Half' : 'Second Half'})`
                    : `${Math.max(1, Math.ceil((new Date(leaveForm.endDate).getTime() - new Date(leaveForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} day(s)`
                  }
                </span>
              </div>
            )}
            <div>
              <Label>Reason</Label>
              <Textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Reason for leave..." rows={3} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" /> Attachment (Optional)</Label>
              <div className="mt-1 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setLeaveForm({ ...leaveForm, attachment: leaveForm.attachment ? null : 'document.pdf' })}>
                  <Upload className="h-4 w-4" /> {leaveForm.attachment ? 'Change File' : 'Upload File'}
                </Button>
                {leaveForm.attachment && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{leaveForm.attachment}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setLeaveForm({ ...leaveForm, attachment: null })}>
                      <XCircle className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB. Medical certificate for sick leave &gt; 3 days.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyLeave} className="bg-emerald-600 hover:bg-emerald-700" disabled={!leaveForm.startDate || (!leaveForm.halfDay && !leaveForm.endDate) || !leaveForm.reason}>Apply Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
