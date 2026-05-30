'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  Users,
  CheckCircle2,
  BarChart3,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  AlertCircle,
  Timer,
  Save,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimesheetRow {
  id: string
  employeeId: string
  employeeName: string
  project: string
  task: string
  weekStartDate: string // Monday of the week
  hours: Record<string, number> // Mon-Sun hours
  billable: boolean
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  approvedBy: string | null
  totalHours: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function getWeekDates(weekStart: string): string[] {
  const d = new Date(weekStart)
  return DAY_KEYS.map((_, i) => {
    const date = new Date(d)
    date.setDate(d.getDate() + i)
    return date.toISOString().split('T')[0]
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getWeekLabel(weekStart: string): string {
  const dates = getWeekDates(weekStart)
  return `${formatDate(dates[0])} - ${formatDate(dates[6])}`
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const WEEK1 = '2024-01-22' // Monday
const WEEK2 = '2024-01-29' // Monday
const PROJECTS = ['HRMS Development', 'Client Portal']

const initialEntries: TimesheetRow[] = [
  // Week 1
  { id: 'TS001', employeeId: 'EMP001', employeeName: 'Aarav Sharma', project: 'HRMS Development', task: 'API Development', weekStartDate: WEEK1, hours: { mon: 8, tue: 7, wed: 8, thu: 6, fri: 8, sat: 0, sun: 0 }, billable: true, status: 'approved', approvedBy: 'Rahul M.', totalHours: 37 },
  { id: 'TS002', employeeId: 'EMP001', employeeName: 'Aarav Sharma', project: 'Client Portal', task: 'Code Review', weekStartDate: WEEK1, hours: { mon: 0, tue: 1, wed: 0, thu: 2, fri: 0, sat: 0, sun: 0 }, billable: false, status: 'approved', approvedBy: 'Rahul M.', totalHours: 3 },
  { id: 'TS003', employeeId: 'EMP002', employeeName: 'Meera Patel', project: 'HRMS Development', task: 'UI Development', weekStartDate: WEEK1, hours: { mon: 7, tue: 8, wed: 7, thu: 8, fri: 6, sat: 0, sun: 0 }, billable: true, status: 'submitted', approvedBy: null, totalHours: 36 },
  { id: 'TS004', employeeId: 'EMP003', employeeName: 'Vikram Singh', project: 'Client Portal', task: 'Database Design', weekStartDate: WEEK1, hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 }, billable: true, status: 'submitted', approvedBy: null, totalHours: 40 },
  { id: 'TS005', employeeId: 'EMP004', employeeName: 'Ananya Reddy', project: 'HRMS Development', task: 'Testing & QA', weekStartDate: WEEK1, hours: { mon: 6, tue: 6, wed: 7, thu: 5, fri: 6, sat: 0, sun: 0 }, billable: true, status: 'draft', approvedBy: null, totalHours: 30 },
  // Week 2
  { id: 'TS006', employeeId: 'EMP001', employeeName: 'Aarav Sharma', project: 'HRMS Development', task: 'Feature Implementation', weekStartDate: WEEK2, hours: { mon: 8, tue: 8, wed: 7, thu: 8, fri: 0, sat: 0, sun: 0 }, billable: true, status: 'draft', approvedBy: null, totalHours: 31 },
  { id: 'TS007', employeeId: 'EMP001', employeeName: 'Aarav Sharma', project: 'Client Portal', task: 'Bug Fixes', weekStartDate: WEEK2, hours: { mon: 0, tue: 0, wed: 1, thu: 0, fri: 4, sat: 0, sun: 0 }, billable: true, status: 'draft', approvedBy: null, totalHours: 5 },
  { id: 'TS008', employeeId: 'EMP002', employeeName: 'Meera Patel', project: 'HRMS Development', task: 'Dashboard Design', weekStartDate: WEEK2, hours: { mon: 7, tue: 8, wed: 8, thu: 8, fri: 7, sat: 0, sun: 0 }, billable: true, status: 'submitted', approvedBy: null, totalHours: 38 },
  { id: 'TS009', employeeId: 'EMP003', employeeName: 'Vikram Singh', project: 'Client Portal', task: 'API Integration', weekStartDate: WEEK2, hours: { mon: 8, tue: 7, wed: 8, thu: 6, fri: 8, sat: 0, sun: 0 }, billable: true, status: 'rejected', approvedBy: 'Rahul M.', totalHours: 37 },
  { id: 'TS010', employeeId: 'EMP005', employeeName: 'Rohan Joshi', project: 'Client Portal', task: 'Sprint Planning', weekStartDate: WEEK2, hours: { mon: 4, tue: 4, wed: 3, thu: 4, fri: 3, sat: 0, sun: 0 }, billable: false, status: 'submitted', approvedBy: null, totalHours: 18 },
]

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    submitted: { label: 'Submitted', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const cfg = config[status] || config.draft
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TimesheetModule() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const tabMap: Record<string, string> = {
    'my-timesheet': 'my-timesheet',
    'team': 'team-timesheet',
    'team-timesheet': 'team-timesheet',
    'approval': 'approval-queue',
    'timesheet-reports': 'reports',
    'reports': 'reports',
  }
  const [manualTab, setManualTab] = useState('my-timesheet')

  // Sync sidebar sub-item to manual tab and clear it
  useEffect(() => {
    if (activeSubItem && tabMap[activeSubItem]) {
      setManualTab(tabMap[activeSubItem])
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // Derive active tab: sidebar sub-item takes priority, then manual tab
  const activeTab = (activeSubItem && tabMap[activeSubItem]) ? tabMap[activeSubItem] : manualTab

  const handleTabChange = (tab: string) => {
    setManualTab(tab)
    setActiveSubItem(null)
  }
  const [entries, setEntries] = useState<TimesheetRow[]>(initialEntries)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentWeek, setCurrentWeek] = useState(WEEK2)
  const [addRowOpen, setAddRowOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newRowForm, setNewRowForm] = useState({
    project: 'HRMS Development',
    task: '',
    hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
    billable: true,
  })

  // Navigation helpers
  function goToPrevWeek() {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() - 7)
    setCurrentWeek(d.toISOString().split('T')[0])
  }

  function goToNextWeek() {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() + 7)
    setCurrentWeek(d.toISOString().split('T')[0])
  }

  // My timesheet entries for current user (EMP001) for the selected week
  const myWeekEntries = entries.filter(e => e.employeeId === 'EMP001' && e.weekStartDate === currentWeek)
  const myTotalHours = myWeekEntries.reduce((sum, e) => sum + e.totalHours, 0)
  const myBillableHours = myWeekEntries.filter(e => e.billable).reduce((sum, e) => sum + e.totalHours, 0)
  const myNonBillableHours = myWeekEntries.filter(e => !e.billable).reduce((sum, e) => sum + e.totalHours, 0)

  // Team entries for selected week
  const teamWeekEntries = entries.filter(e => e.weekStartDate === currentWeek)

  // Approval entries - all submitted entries
  const approvalEntries = entries.filter(e => e.status === 'submitted')

  // Stats
  const totalBillable = entries.reduce((sum, e) => e.billable ? sum + e.totalHours : sum, 0)
  const totalNonBillable = entries.reduce((sum, e) => !e.billable ? sum + e.totalHours : sum, 0)
  const totalHours = totalBillable + totalNonBillable
  const pendingApprovals = approvalEntries.length

  // CRUD handlers
  function handleAddRow() {
    const total = Object.values(newRowForm.hours).reduce((s, h) => s + h, 0)
    const newEntry: TimesheetRow = {
      id: `TS${String(entries.length + 1).padStart(3, '0')}`,
      employeeId: 'EMP001',
      employeeName: 'Aarav Sharma',
      project: newRowForm.project,
      task: newRowForm.task,
      weekStartDate: currentWeek,
      hours: { ...newRowForm.hours },
      billable: newRowForm.billable,
      status: 'draft',
      approvedBy: null,
      totalHours: total,
    }
    setEntries(prev => [...prev, newEntry])
    setAddRowOpen(false)
    setNewRowForm({ project: 'HRMS Development', task: '', hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }, billable: true })
  }

  function handleEditRow() {
    if (!editId) return
    const total = Object.values(newRowForm.hours).reduce((s, h) => s + h, 0)
    setEntries(prev => prev.map(e => e.id === editId ? {
      ...e,
      project: newRowForm.project,
      task: newRowForm.task,
      hours: { ...newRowForm.hours },
      billable: newRowForm.billable,
      totalHours: total,
      status: 'draft' as const,
    } : e))
    setEditId(null)
    setAddRowOpen(false)
    setNewRowForm({ project: 'HRMS Development', task: '', hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }, billable: true })
  }

  function handleDelete(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
    setDeleteConfirm(null)
  }

  function handleSubmit(id: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'submitted' as const } : e))
  }

  function handleSubmitAllWeek() {
    setEntries(prev => prev.map(e =>
      e.employeeId === 'EMP001' && e.weekStartDate === currentWeek && e.status === 'draft'
        ? { ...e, status: 'submitted' as const }
        : e
    ))
  }

  function handleSaveAllWeek() {
    // In a real app, this would persist to backend - here it just keeps draft state
    // Just a visual indicator that saves were acknowledged
  }

  function handleApprove(id: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'approved', approvedBy: 'Rahul M.' } : e))
  }

  function handleReject(id: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected', approvedBy: 'Rahul M.' } : e))
  }

  function handleEditEntry(entry: TimesheetRow) {
    setNewRowForm({
      project: entry.project,
      task: entry.task,
      hours: { ...entry.hours },
      billable: entry.billable,
    })
    setEditId(entry.id)
    setAddRowOpen(true)
  }

  // Update a specific day's hours for my timesheet
  function handleHourChange(entryId: string, day: string, value: number) {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e
      const newHours = { ...e.hours, [day]: value }
      const newTotal = Object.values(newHours).reduce((s, h) => s + h, 0)
      return { ...e, hours: newHours, totalHours: newTotal }
    }))
  }

  // Toggle billable for my timesheet
  function handleBillableToggle(entryId: string) {
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, billable: !e.billable } : e))
  }

  // Project summary for reports
  const projectSummary = PROJECTS.map(p => {
    const pEntries = entries.filter(e => e.project === p)
    return {
      name: p,
      totalHours: pEntries.reduce((s, e) => s + e.totalHours, 0),
      billable: pEntries.filter(e => e.billable).reduce((s, e) => s + e.totalHours, 0),
      nonBillable: pEntries.filter(e => !e.billable).reduce((s, e) => s + e.totalHours, 0),
      entries: pEntries.length,
    }
  })

  // Employee summary for reports
  const employeeIds = [...new Set(entries.map(e => e.employeeId))]
  const employeeSummary = employeeIds.map(empId => {
    const empEntries = entries.filter(e => e.employeeId === empId)
    const name = empEntries[0]?.employeeName || empId
    return {
      employeeId: empId,
      name,
      totalHours: empEntries.reduce((s, e) => s + e.totalHours, 0),
      billable: empEntries.filter(e => e.billable).reduce((s, e) => s + e.totalHours, 0),
      nonBillable: empEntries.filter(e => !e.billable).reduce((s, e) => s + e.totalHours, 0),
      entries: empEntries.length,
    }
  })

  // Week summary for reports
  const weekSummary = [WEEK1, WEEK2].map(w => {
    const wEntries = entries.filter(e => e.weekStartDate === w)
    return {
      week: w,
      label: getWeekLabel(w),
      totalHours: wEntries.reduce((s, e) => s + e.totalHours, 0),
      billable: wEntries.filter(e => e.billable).reduce((s, e) => s + e.totalHours, 0),
      nonBillable: wEntries.filter(e => !e.billable).reduce((s, e) => s + e.totalHours, 0),
      entries: wEntries.length,
    }
  })

  const weekDates = getWeekDates(currentWeek)
  const hasDraftEntries = myWeekEntries.some(e => e.status === 'draft')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
              <p className="text-muted-foreground text-sm">{totalHours}h total · {pendingApprovals} pending approvals</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-9 w-full pl-9 sm:w-[200px]" />
            </div>
            <Button onClick={() => { setEditId(null); setNewRowForm({ project: 'HRMS Development', task: '', hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }, billable: true }); setAddRowOpen(true) }} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Entry
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Total Hours</p><p className="text-2xl font-bold">{totalHours}h</p></div>
                <Timer className="h-7 w-7 text-emerald-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-sky-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Billable</p><p className="text-2xl font-bold">{totalBillable}h</p></div>
                <Briefcase className="h-7 w-7 text-sky-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Non-Billable</p><p className="text-2xl font-bold">{totalNonBillable}h</p></div>
                <Clock className="h-7 w-7 text-gray-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">{pendingApprovals}</p></div>
                <AlertCircle className="h-7 w-7 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="my-timesheet" className="gap-1.5"><Timer className="h-3.5 w-3.5" /> My Timesheet</TabsTrigger>
            <TabsTrigger value="team-timesheet" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Team</TabsTrigger>
            <TabsTrigger value="approval-queue" className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Approvals</TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Reports</TabsTrigger>
          </TabsList>

          {/* ── My Timesheet Tab ── */}
          <TabsContent value="my-timesheet">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Timer className="h-4 w-4 text-emerald-600" /> Weekly Timesheet
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevWeek}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[160px] text-center">{getWeekLabel(currentWeek)}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {myWeekEntries.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="font-medium">No entries for this week</p>
                    <p className="text-sm mt-1">Click &ldquo;Add Entry&rdquo; to log your hours</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4 min-w-[140px]">Project / Task</TableHead>
                          <TableHead className="text-center w-[60px]">Mon<br/><span className="text-[10px] font-normal text-muted-foreground">{formatDate(weekDates[0])}</span></TableHead>
                          <TableHead className="text-center w-[60px]">Tue<br/><span className="text-[10px] font-normal text-muted-foreground">{formatDate(weekDates[1])}</span></TableHead>
                          <TableHead className="text-center w-[60px]">Wed<br/><span className="text-[10px] font-normal text-muted-foreground">{formatDate(weekDates[2])}</span></TableHead>
                          <TableHead className="text-center w-[60px]">Thu<br/><span className="text-[10px] font-normal text-muted-foreground">{formatDate(weekDates[3])}</span></TableHead>
                          <TableHead className="text-center w-[60px]">Fri<br/><span className="text-[10px] font-normal text-muted-foreground">{formatDate(weekDates[4])}</span></TableHead>
                          <TableHead className="text-center w-[60px]">Sat<br/><span className="text-[10px] font-normal text-muted-foreground">{formatDate(weekDates[5])}</span></TableHead>
                          <TableHead className="text-center w-[60px]">Sun<br/><span className="text-[10px] font-normal text-muted-foreground">{formatDate(weekDates[6])}</span></TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Billable</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myWeekEntries.map(entry => (
                          <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-4">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{entry.project}</p>
                                <p className="text-xs text-muted-foreground truncate">{entry.task}</p>
                              </div>
                            </TableCell>
                            {DAY_KEYS.map(day => (
                              <TableCell key={day} className="text-center p-1">
                                <Input
                                  type="number"
                                  min={0}
                                  max={24}
                                  value={entry.hours[day]}
                                  onChange={e => handleHourChange(entry.id, day, Number(e.target.value))}
                                  className="h-8 w-14 text-center text-sm mx-auto p-1"
                                  disabled={entry.status !== 'draft'}
                                />
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                                {entry.totalHours}h
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={entry.billable}
                                onCheckedChange={() => handleBillableToggle(entry.id)}
                                disabled={entry.status !== 'draft'}
                                className="data-[state=checked]:bg-emerald-600"
                              />
                            </TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {entry.status === 'draft' && (
                                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-sky-600" onClick={() => handleSubmit(entry.id)}>
                                    <Send className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => handleEditEntry(entry)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setDeleteConfirm(entry.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total row */}
                        <TableRow className="bg-muted/30 font-semibold">
                          <TableCell className="pl-4 text-sm">Weekly Total</TableCell>
                          {DAY_KEYS.map(day => (
                            <TableCell key={day} className="text-center text-sm">
                              {myWeekEntries.reduce((s, e) => s + (e.hours[day] || 0), 0)}h
                            </TableCell>
                          ))}
                          <TableCell className="text-center text-sm">
                            <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                              {myTotalHours}h
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {myBillableHours}h billable
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Save / Submit buttons */}
                {myWeekEntries.length > 0 && hasDraftEntries && (
                  <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
                    <Button variant="outline" className="gap-2" onClick={handleSaveAllWeek}>
                      <Save className="h-4 w-4" /> Save Draft
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitAllWeek}>
                      <Send className="h-4 w-4" /> Submit Week
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Team Timesheet Tab ── */}
          <TabsContent value="team-timesheet">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" /> Team Timesheets
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevWeek}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[160px] text-center">{getWeekLabel(currentWeek)}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Employee</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead className="hidden sm:table-cell">Week</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Billable</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamWeekEntries.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No entries for this week</TableCell></TableRow>
                      ) : teamWeekEntries.map(entry => (
                        <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                {entry.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium">{entry.employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{entry.project}</TableCell>
                          <TableCell className="text-sm max-w-[150px] truncate">{entry.task}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{getWeekLabel(entry.weekStartDate)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[11px] bg-emerald-50 text-emerald-700">{entry.totalHours}h</Badge>
                          </TableCell>
                          <TableCell>
                            {entry.billable ? (
                              <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[11px] bg-gray-50 text-gray-600 border-gray-200">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Approval Queue Tab ── */}
          <TabsContent value="approval-queue">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Pending Approvals ({approvalEntries.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Employee</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead className="hidden sm:table-cell">Week</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Billable</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalEntries.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No pending approvals</TableCell></TableRow>
                      ) : approvalEntries.map(entry => (
                        <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                {entry.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-sm font-medium">{entry.employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{entry.project}</TableCell>
                          <TableCell className="text-sm max-w-[150px] truncate">{entry.task}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{getWeekLabel(entry.weekStartDate)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[11px] bg-emerald-50 text-emerald-700">{entry.totalHours}h</Badge>
                          </TableCell>
                          <TableCell>
                            {entry.billable ? (
                              <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[11px] bg-gray-50 text-gray-600 border-gray-200">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprove(entry.id)}>
                                <CheckCircle2 className="h-3 w-3" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 hover:bg-red-50" onClick={() => handleReject(entry.id)}>
                                <X className="h-3 w-3" /> Reject
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
          </TabsContent>

          {/* ── Reports Tab ── */}
          <TabsContent value="reports">
            <div className="space-y-6">
              {/* By Project */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-600" /> Hours by Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {projectSummary.map(ps => (
                      <Card key={ps.name} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                              <Briefcase className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{ps.name}</p>
                              <p className="text-xs text-muted-foreground">{ps.entries} entries</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total Hours</span>
                              <span className="text-lg font-bold">{ps.totalHours}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Billable</span>
                              <span className="text-sm font-medium text-emerald-600">{ps.billable}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Non-Billable</span>
                              <span className="text-sm font-medium text-gray-600">{ps.nonBillable}h</span>
                            </div>
                            <Progress value={ps.totalHours > 0 ? (ps.billable / ps.totalHours) * 100 : 0} className="h-2" />
                            <p className="text-xs text-muted-foreground">{ps.totalHours > 0 ? Math.round((ps.billable / ps.totalHours) * 100) : 0}% billable</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* By Week */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" /> Hours by Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Week</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Billable</TableHead>
                          <TableHead>Non-Billable</TableHead>
                          <TableHead>Entries</TableHead>
                          <TableHead>% Billable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weekSummary.map(ws => (
                          <TableRow key={ws.week} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-4 text-sm font-medium">{ws.label}</TableCell>
                            <TableCell className="text-sm font-semibold">{ws.totalHours}h</TableCell>
                            <TableCell className="text-sm text-emerald-600">{ws.billable}h</TableCell>
                            <TableCell className="text-sm text-gray-600">{ws.nonBillable}h</TableCell>
                            <TableCell className="text-sm">{ws.entries}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={ws.totalHours > 0 ? (ws.billable / ws.totalHours) * 100 : 0} className="h-2 w-16" />
                                <span className="text-xs text-muted-foreground">{ws.totalHours > 0 ? Math.round((ws.billable / ws.totalHours) * 100) : 0}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* By Employee */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" /> Hours by Employee
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Employee</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Billable</TableHead>
                          <TableHead>Non-Billable</TableHead>
                          <TableHead>Entries</TableHead>
                          <TableHead>% Billable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeSummary.map(es => (
                          <TableRow key={es.employeeId} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                  {es.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="text-sm font-medium">{es.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-semibold">{es.totalHours}h</TableCell>
                            <TableCell className="text-sm text-emerald-600">{es.billable}h</TableCell>
                            <TableCell className="text-sm text-gray-600">{es.nonBillable}h</TableCell>
                            <TableCell className="text-sm">{es.entries}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={es.totalHours > 0 ? (es.billable / es.totalHours) * 100 : 0} className="h-2 w-16" />
                                <span className="text-xs text-muted-foreground">{es.totalHours > 0 ? Math.round((es.billable / es.totalHours) * 100) : 0}%</span>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Entry Dialog */}
      <Dialog open={addRowOpen} onOpenChange={setAddRowOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" /> {editId ? 'Edit' : 'Add'} Timesheet Entry
            </DialogTitle>
            <DialogDescription>{editId ? 'Update' : 'Create'} a timesheet entry for {getWeekLabel(currentWeek)}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project</Label>
                <Select value={newRowForm.project} onValueChange={v => setNewRowForm({ ...newRowForm, project: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROJECTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Billable</Label>
                  <div className="flex items-center gap-2 h-9">
                    <Switch
                      checked={newRowForm.billable}
                      onCheckedChange={v => setNewRowForm({ ...newRowForm, billable: v })}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-sm">{newRowForm.billable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label>Task</Label>
              <Input value={newRowForm.task} onChange={e => setNewRowForm({ ...newRowForm, task: e.target.value })} placeholder="Task description" />
            </div>
            <div>
              <Label>Hours per Day</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {DAY_KEYS.map((day, i) => (
                  <div key={day} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{DAYS[i]}</p>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      value={newRowForm.hours[day]}
                      onChange={e => setNewRowForm({
                        ...newRowForm,
                        hours: { ...newRowForm.hours, [day]: Number(e.target.value) },
                      })}
                      className="h-8 w-full text-center text-sm p-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Total: {Object.values(newRowForm.hours).reduce((s, h) => s + h, 0)}h
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddRowOpen(false); setEditId(null) }}>Cancel</Button>
            <Button onClick={editId ? handleEditRow : handleAddRow} className="bg-emerald-600 hover:bg-emerald-700" disabled={!newRowForm.task}>
              {editId ? 'Update' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /> Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this timesheet entry?</AlertDialogDescription>
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
