'use client'

import { useState } from 'react'
import {
  LogOut,
  ClipboardList,
  IndianRupee,
  MessageSquare,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Building2,
  FileText,
  ChevronRight,
  Circle,
  X,
  ArrowRight,
  Shield,
  Laptop,
  Key,
  FolderOpen,
  Receipt,
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
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

type ExitStatus = 'submitted' | 'manager-review' | 'hr-review' | 'approved' | 'in-clearance' | 'fnf-pending' | 'completed'

interface ExitRequest {
  id: string
  employeeName: string
  employeeId: string
  department: string
  designation: string
  resignationDate: string
  lastWorkingDate: string
  noticePeriod: string
  reason: string
  exitType: 'voluntary' | 'termination' | 'contract-end'
  status: ExitStatus
  managerName: string
  managerApproval: { status: string; date: string | null; comments: string }
  hrApproval: { status: string; date: string | null; comments: string }
}

interface ClearanceItem {
  id: string
  exitId: string
  category: string
  item: string
  icon: string
  status: 'pending' | 'completed' | 'waived'
  assignedTo: string
  completedDate: string | null
  notes: string
}

interface FnFSettlement {
  id: string
  exitId: string
  employeeName: string
  basicSalary: number
  pendingDues: number
  noticePeriodAdjustment: number
  leaveEncashment: number
  bonus: number
  deductions: number
  finalAmount: number
  status: 'pending' | 'processed' | 'paid'
  processedDate: string | null
}

interface ExitInterview {
  id: string
  exitId: string
  employeeName: string
  conductedBy: string
  date: string | null
  overallExperience: string
  reasonForLeaving: string
  wouldRecommend: string
  whatLikedMost: string
  whatCouldImprove: string
  suggestions: string
  status: 'scheduled' | 'completed' | 'pending'
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const initialExits: ExitRequest[] = [
  {
    id: 'EX001',
    employeeName: 'Vikram Mehta',
    employeeId: 'EMP012',
    department: 'Engineering',
    designation: 'Senior Developer',
    resignationDate: '2024-01-15',
    lastWorkingDate: '2024-02-15',
    noticePeriod: '30 days',
    reason: 'Relocating to another city for personal reasons',
    exitType: 'voluntary',
    status: 'in-clearance',
    managerName: 'Rahul M.',
    managerApproval: { status: 'approved', date: '2024-01-17', comments: 'Approved. Vikram has been a valuable team member.' },
    hrApproval: { status: 'approved', date: '2024-01-19', comments: 'Approved. Initiate clearance process.' },
  },
  {
    id: 'EX002',
    employeeName: 'Anita Desai',
    employeeId: 'EMP018',
    department: 'Sales',
    designation: 'Sales Lead',
    resignationDate: '2024-02-01',
    lastWorkingDate: '2024-03-01',
    noticePeriod: '30 days',
    reason: 'Better career opportunity',
    exitType: 'voluntary',
    status: 'manager-review',
    managerName: 'Kavitha V.',
    managerApproval: { status: 'pending', date: null, comments: '' },
    hrApproval: { status: 'pending', date: null, comments: '' },
  },
  {
    id: 'EX003',
    employeeName: 'Suresh Nair',
    employeeId: 'EMP025',
    department: 'Admin',
    designation: 'Admin Executive',
    resignationDate: '2023-12-01',
    lastWorkingDate: '2023-12-31',
    noticePeriod: 'Waived',
    reason: 'Performance-related termination',
    exitType: 'termination',
    status: 'completed',
    managerName: 'Deepak N.',
    managerApproval: { status: 'approved', date: '2023-12-02', comments: 'Termination approved as per policy.' },
    hrApproval: { status: 'approved', date: '2023-12-03', comments: 'Processed. All clearances completed.' },
  },
]

const initialClearance: ClearanceItem[] = [
  // Vikram Mehta - in clearance
  { id: 'CL001', exitId: 'EX001', category: 'Knowledge Transfer', item: 'Project Documentation & Handover', icon: 'folder', status: 'completed', assignedTo: 'Vikram Mehta', completedDate: '2024-02-05', notes: 'All docs uploaded to shared drive' },
  { id: 'CL002', exitId: 'EX001', category: 'Knowledge Transfer', item: 'Code Review & KT Sessions', icon: 'folder', status: 'completed', assignedTo: 'Vikram Mehta', completedDate: '2024-02-08', notes: 'Completed 3 KT sessions with team' },
  { id: 'CL003', exitId: 'EX001', category: 'Asset Return', item: 'Laptop & Accessories', icon: 'laptop', status: 'completed', assignedTo: 'IT Team', completedDate: '2024-02-12', notes: 'MacBook Pro + charger returned in good condition' },
  { id: 'CL004', exitId: 'EX001', category: 'Asset Return', item: 'Access Card & ID Badge', icon: 'laptop', status: 'pending', assignedTo: 'Admin', completedDate: null, notes: '' },
  { id: 'CL005', exitId: 'EX001', category: 'Access Revocation', item: 'Email & System Deactivation', icon: 'key', status: 'pending', assignedTo: 'IT Security', completedDate: null, notes: '' },
  { id: 'CL006', exitId: 'EX001', category: 'Access Revocation', item: 'VPN & Cloud Access Revocation', icon: 'key', status: 'pending', assignedTo: 'IT Security', completedDate: null, notes: '' },
  { id: 'CL007', exitId: 'EX001', category: 'Document Handover', item: 'Signed NDA & Policy Documents', icon: 'document', status: 'completed', assignedTo: 'HR', completedDate: '2024-02-10', notes: 'All documents signed and filed' },
  { id: 'CL008', exitId: 'EX001', category: 'Outstanding Dues', item: 'Pending Dues Clearance', icon: 'receipt', status: 'pending', assignedTo: 'Finance', completedDate: null, notes: '' },
  // Anita Desai - still in review, no clearance yet but pre-populate
  { id: 'CL009', exitId: 'EX002', category: 'Knowledge Transfer', item: 'Client Handover', icon: 'folder', status: 'pending', assignedTo: 'Anita Desai', completedDate: null, notes: '' },
  { id: 'CL010', exitId: 'EX002', category: 'Asset Return', item: 'Laptop & Accessories', icon: 'laptop', status: 'pending', assignedTo: 'IT Team', completedDate: null, notes: '' },
  { id: 'CL011', exitId: 'EX002', category: 'Access Revocation', item: 'All System Access Revocation', icon: 'key', status: 'pending', assignedTo: 'IT Security', completedDate: null, notes: '' },
  { id: 'CL012', exitId: 'EX002', category: 'Document Handover', item: 'Signed Exit Documents', icon: 'document', status: 'pending', assignedTo: 'HR', completedDate: null, notes: '' },
  { id: 'CL013', exitId: 'EX002', category: 'Outstanding Dues', item: 'Pending Dues Clearance', icon: 'receipt', status: 'pending', assignedTo: 'Finance', completedDate: null, notes: '' },
  // Suresh Nair - completed
  { id: 'CL014', exitId: 'EX003', category: 'Knowledge Transfer', item: 'Process Documentation', icon: 'folder', status: 'completed', assignedTo: 'Suresh Nair', completedDate: '2023-12-20', notes: 'Basic handover completed' },
  { id: 'CL015', exitId: 'EX003', category: 'Asset Return', item: 'Laptop & Accessories', icon: 'laptop', status: 'completed', assignedTo: 'IT Team', completedDate: '2023-12-28', notes: 'All items returned' },
  { id: 'CL016', exitId: 'EX003', category: 'Access Revocation', item: 'All Access Revoked', icon: 'key', status: 'completed', assignedTo: 'IT Security', completedDate: '2023-12-31', notes: 'All access removed on last day' },
  { id: 'CL017', exitId: 'EX003', category: 'Document Handover', item: 'Exit Documents', icon: 'document', status: 'completed', assignedTo: 'HR', completedDate: '2023-12-30', notes: 'Completed' },
  { id: 'CL018', exitId: 'EX003', category: 'Outstanding Dues', item: 'Dues Cleared', icon: 'receipt', status: 'completed', assignedTo: 'Finance', completedDate: '2023-12-29', notes: 'No pending dues' },
]

const initialFnF: FnFSettlement[] = [
  {
    id: 'FN001', exitId: 'EX001', employeeName: 'Vikram Mehta',
    basicSalary: 180000, pendingDues: 0, noticePeriodAdjustment: 0,
    leaveEncashment: 42000, bonus: 15000, deductions: 8000,
    finalAmount: 229000, status: 'pending', processedDate: null,
  },
  {
    id: 'FN002', exitId: 'EX002', employeeName: 'Anita Desai',
    basicSalary: 150000, pendingDues: 5000, noticePeriodAdjustment: -15000,
    leaveEncashment: 35000, bonus: 10000, deductions: 6000,
    finalAmount: 179000, status: 'pending', processedDate: null,
  },
  {
    id: 'FN003', exitId: 'EX003', employeeName: 'Suresh Nair',
    basicSalary: 100000, pendingDues: 0, noticePeriodAdjustment: 0,
    leaveEncashment: 25000, bonus: 0, deductions: 5000,
    finalAmount: 120000, status: 'paid', processedDate: '2024-01-05',
  },
]

const initialInterviews: ExitInterview[] = [
  {
    id: 'EI001', exitId: 'EX001', employeeName: 'Vikram Mehta', conductedBy: 'HR Team',
    date: null, overallExperience: '', reasonForLeaving: '', wouldRecommend: '',
    whatLikedMost: '', whatCouldImprove: '', suggestions: '', status: 'pending',
  },
  {
    id: 'EI002', exitId: 'EX002', employeeName: 'Anita Desai', conductedBy: 'HR Team',
    date: null, overallExperience: '', reasonForLeaving: '', wouldRecommend: '',
    whatLikedMost: '', whatCouldImprove: '', suggestions: '', status: 'pending',
  },
  {
    id: 'EI003', exitId: 'EX003', employeeName: 'Suresh Nair', conductedBy: 'HR Team',
    date: '2023-12-28', overallExperience: 'Mixed experience, some challenges with role clarity',
    reasonForLeaving: 'Termination due to performance',
    wouldRecommend: 'Maybe', whatLikedMost: 'Supportive colleagues and good work environment',
    whatCouldImprove: 'Role clarity and better onboarding for admin processes',
    suggestions: 'Clearer job descriptions and regular feedback sessions',
    status: 'completed',
  },
]

// ─── Status Helpers ───────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    'manager-review': { label: 'Manager Review', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    'hr-review': { label: 'HR Review', className: 'bg-violet-100 text-violet-700 border-violet-200' },
    approved: { label: 'Approved', className: 'bg-teal-100 text-teal-700 border-teal-200' },
    'in-clearance': { label: 'In Clearance', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    'fnf-pending': { label: 'FnF Pending', className: 'bg-pink-100 text-pink-700 border-pink-200' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    processed: { label: 'Processed', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    scheduled: { label: 'Scheduled', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    waived: { label: 'Waived', className: 'bg-gray-50 text-gray-500 border-gray-200' },
    voluntary: { label: 'Voluntary', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    termination: { label: 'Termination', className: 'bg-red-100 text-red-700 border-red-200' },
    'contract-end': { label: 'Contract End', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  }
  const cfg = config[status] || config.pending
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(n: number): string {
  return `₹${new Intl.NumberFormat('en-IN').format(n)}`
}

const EXIT_STEPS: { key: ExitStatus; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'manager-review', label: 'Manager Review' },
  { key: 'hr-review', label: 'HR Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'in-clearance', label: 'Clearance' },
  { key: 'completed', label: 'Completed' },
]

function getStepIndex(status: ExitStatus): number {
  const idx = EXIT_STEPS.findIndex(s => s.key === status)
  if (status === 'fnf-pending') return 5 // Show as near completed
  return idx === -1 ? 0 : idx
}

function getClearanceIcon(icon: string) {
  switch (icon) {
    case 'folder': return <FolderOpen className="h-4 w-4 text-emerald-600" />
    case 'laptop': return <Laptop className="h-4 w-4 text-sky-600" />
    case 'key': return <Key className="h-4 w-4 text-amber-600" />
    case 'document': return <FileText className="h-4 w-4 text-violet-600" />
    case 'receipt': return <Receipt className="h-4 w-4 text-pink-600" />
    default: return <ClipboardList className="h-4 w-4 text-gray-600" />
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExitWorkflow() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const tabMap: Record<string, string> = {
    'resignation': 'resignation',
    'clearance': 'clearance',
    'fnf': 'fnf-settlement',
    'interview': 'exit-interview',
  }
  const [manualTab, setManualTab] = useState('resignation')
  // Derive active tab from sidebar sub-item, fallback to manual selection
  const activeTab = (activeSubItem && tabMap[activeSubItem]) ? tabMap[activeSubItem] : manualTab
  const handleTabChange = (tab: string) => {
    setManualTab(tab)
    setActiveSubItem(null)
  }
  const [exits, setExits] = useState<ExitRequest[]>(initialExits)
  const [clearance, setClearance] = useState<ClearanceItem[]>(initialClearance)
  const [fnf, setFnf] = useState<FnFSettlement[]>(initialFnF)
  const [interviews, setInterviews] = useState<ExitInterview[]>(initialInterviews)
  const [addResignOpen, setAddResignOpen] = useState(false)
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedExitId, setSelectedExitId] = useState<string | null>(null)
  const [resignForm, setResignForm] = useState({
    employeeName: '', employeeId: '', department: '', designation: '',
    resignationDate: '', lastWorkingDate: '', noticePeriod: '30 days',
    reason: '', exitType: 'voluntary' as 'voluntary' | 'termination' | 'contract-end',
    managerName: '',
  })
  const [interviewForm, setInterviewForm] = useState({
    overallExperience: '', reasonForLeaving: '', wouldRecommend: '',
    whatLikedMost: '', whatCouldImprove: '', suggestions: '',
  })

  // CRUD handlers
  function handleAddResignation() {
    const newExit: ExitRequest = {
      id: `EX${String(exits.length + 1).padStart(3, '0')}`,
      ...resignForm,
      status: 'submitted',
      managerApproval: { status: 'pending', date: null, comments: '' },
      hrApproval: { status: 'pending', date: null, comments: '' },
    }
    setExits(prev => [...prev, newExit])
    // Add default clearance items
    const defaultClearance = [
      { category: 'Knowledge Transfer', item: 'Project Documentation & Handover', icon: 'folder', assignedTo: resignForm.employeeName },
      { category: 'Asset Return', item: 'Laptop & Accessories', icon: 'laptop', assignedTo: 'IT Team' },
      { category: 'Asset Return', item: 'Access Card & ID Badge', icon: 'laptop', assignedTo: 'Admin' },
      { category: 'Access Revocation', item: 'Email & System Deactivation', icon: 'key', assignedTo: 'IT Security' },
      { category: 'Document Handover', item: 'Signed Exit Documents', icon: 'document', assignedTo: 'HR' },
      { category: 'Outstanding Dues', item: 'Pending Dues Clearance', icon: 'receipt', assignedTo: 'Finance' },
    ].map((item, i) => ({
      id: `CL${String(clearance.length + i + 1).padStart(3, '0')}`,
      exitId: newExit.id,
      ...item,
      status: 'pending' as const,
      completedDate: null,
      notes: '',
    }))
    setClearance(prev => [...prev, ...defaultClearance])
    setAddResignOpen(false)
    setResignForm({
      employeeName: '', employeeId: '', department: '', designation: '',
      resignationDate: '', lastWorkingDate: '', noticePeriod: '30 days',
      reason: '', exitType: 'voluntary', managerName: '',
    })
  }

  function handleAdvanceStatus(exitId: string) {
    setExits(prev => prev.map(e => {
      if (e.id !== exitId) return e
      const nextStatusMap: Record<ExitStatus, ExitStatus> = {
        'submitted': 'manager-review',
        'manager-review': 'hr-review',
        'hr-review': 'approved',
        'approved': 'in-clearance',
        'in-clearance': 'fnf-pending',
        'fnf-pending': 'completed',
        'completed': 'completed',
      }
      const nextStatus = nextStatusMap[e.status]
      const updates: Partial<ExitRequest> = { status: nextStatus }
      if (e.status === 'submitted') {
        updates.managerApproval = { status: 'approved', date: new Date().toISOString().split('T')[0], comments: 'Approved by manager' }
      }
      if (e.status === 'manager-review') {
        updates.managerApproval = { status: 'approved', date: new Date().toISOString().split('T')[0], comments: 'Approved by manager' }
      }
      if (e.status === 'hr-review') {
        updates.hrApproval = { status: 'approved', date: new Date().toISOString().split('T')[0], comments: 'Approved by HR' }
      }
      return { ...e, ...updates }
    }))
  }

  function handleCompleteClearanceItem(itemId: string) {
    setClearance(prev => prev.map(c =>
      c.id === itemId ? { ...c, status: 'completed', completedDate: new Date().toISOString().split('T')[0] } : c
    ))
  }

  function handleWaiveClearanceItem(itemId: string) {
    setClearance(prev => prev.map(c =>
      c.id === itemId ? { ...c, status: 'waived' } : c
    ))
  }

  function handleProcessFnF(fnfId: string) {
    setFnf(prev => prev.map(f =>
      f.id === fnfId ? { ...f, status: 'processed', processedDate: new Date().toISOString().split('T')[0] } : f
    ))
  }

  function handlePayFnF(fnfId: string) {
    setFnf(prev => prev.map(f =>
      f.id === fnfId ? { ...f, status: 'paid', processedDate: f.processedDate || new Date().toISOString().split('T')[0] } : f
    ))
    // Update exit status
    const fnfRecord = fnf.find(f => f.id === fnfId)
    if (fnfRecord) {
      setExits(prev => prev.map(e =>
        e.id === fnfRecord.exitId ? { ...e, status: 'completed' } : e
      ))
    }
  }

  function handleSaveInterview() {
    if (!selectedExitId) return
    setInterviews(prev => prev.map(i => i.exitId === selectedExitId ? {
      ...i,
      ...interviewForm,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
    } : i))
    setInterviewDialogOpen(false)
    setInterviewForm({ overallExperience: '', reasonForLeaving: '', wouldRecommend: '', whatLikedMost: '', whatCouldImprove: '', suggestions: '' })
  }

  function handleDeleteExit(id: string) {
    setExits(prev => prev.filter(e => e.id !== id))
    setClearance(prev => prev.filter(c => c.exitId !== id))
    setFnf(prev => prev.filter(f => f.exitId !== id))
    setInterviews(prev => prev.filter(i => i.exitId !== id))
    setDeleteConfirm(null)
  }

  const pendingCount = exits.filter(e => ['submitted', 'manager-review', 'hr-review'].includes(e.status)).length
  const clearanceCount = exits.filter(e => e.status === 'in-clearance').length
  const completedCount = exits.filter(e => e.status === 'completed').length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <LogOut className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Exit Workflow</h1>
              <p className="text-muted-foreground text-sm">{exits.length} exits · {pendingCount} pending approvals</p>
            </div>
          </div>
          <Button onClick={() => setAddResignOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Submit Resignation
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Pending Review</p><p className="text-2xl font-bold">{pendingCount}</p></div>
                <Clock className="h-7 w-7 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">In Clearance</p><p className="text-2xl font-bold">{clearanceCount}</p></div>
                <ClipboardList className="h-7 w-7 text-orange-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-pink-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">FnF Pending</p><p className="text-2xl font-bold">{fnf.filter(f => f.status === 'pending').length}</p></div>
                <IndianRupee className="h-7 w-7 text-pink-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{completedCount}</p></div>
                <CheckCircle2 className="h-7 w-7 text-emerald-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="resignation" className="gap-1.5"><LogOut className="h-3.5 w-3.5" /> Resignation</TabsTrigger>
            <TabsTrigger value="clearance" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Clearance</TabsTrigger>
            <TabsTrigger value="fnf-settlement" className="gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> FnF</TabsTrigger>
            <TabsTrigger value="exit-interview" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Interview</TabsTrigger>
          </TabsList>

          {/* ── Resignation Tab ── */}
          <TabsContent value="resignation">
            <div className="space-y-4">
              {exits.map(exit => {
                const stepIdx = getStepIndex(exit.status)
                return (
                  <Card key={exit.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {exit.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{exit.employeeName}</p>
                              {getStatusBadge(exit.exitType)}
                            </div>
                            <p className="text-sm text-muted-foreground">{exit.designation} · {exit.department}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Reason:</span> {exit.reason}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Resigned: {formatDate(exit.resignationDate)}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> LWD: {formatDate(exit.lastWorkingDate)}
                              </span>
                              <span className="text-xs text-muted-foreground">Notice: {exit.noticePeriod}</span>
                              <span className="text-xs text-muted-foreground">Manager: {exit.managerName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(exit.status)}
                          {exit.status !== 'completed' && exit.status !== 'fnf-pending' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleAdvanceStatus(exit.id)}>
                              <ArrowRight className="h-3 w-3" /> Advance
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteConfirm(exit.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {/* Status Timeline */}
                      <div className="mt-4 overflow-x-auto">
                        <div className="flex items-center gap-1 min-w-max">
                          {EXIT_STEPS.map((step, i) => (
                            <div key={step.key} className="flex items-center">
                              <div className="flex items-center gap-1.5">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium ${
                                  i <= stepIdx
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {i <= stepIdx ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                                </div>
                                <span className={`text-xs whitespace-nowrap ${i <= stepIdx ? 'text-emerald-700 font-medium' : 'text-muted-foreground'}`}>
                                  {step.label}
                                </span>
                              </div>
                              {i < EXIT_STEPS.length - 1 && (
                                <ChevronRight className={`h-3 w-3 mx-1 ${i < stepIdx ? 'text-emerald-400' : 'text-gray-300'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Approval details */}
                      {(exit.managerApproval.status === 'approved' || exit.hrApproval.status === 'approved') && (
                        <div className="mt-3 rounded-lg bg-muted/50 p-3 space-y-1.5">
                          {exit.managerApproval.status === 'approved' && (
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span className="text-muted-foreground">Manager ({exit.managerName}):</span>
                              <span>{exit.managerApproval.comments}</span>
                              <span className="text-muted-foreground ml-auto">{formatDate(exit.managerApproval.date)}</span>
                            </div>
                          )}
                          {exit.hrApproval.status === 'approved' && (
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span className="text-muted-foreground">HR:</span>
                              <span>{exit.hrApproval.comments}</span>
                              <span className="text-muted-foreground ml-auto">{formatDate(exit.hrApproval.date)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* ── Clearance Checklist Tab ── */}
          <TabsContent value="clearance">
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {exits.filter(e => ['in-clearance', 'approved', 'fnf-pending', 'completed'].includes(e.status)).map(exit => {
                const items = clearance.filter(c => c.exitId === exit.id)
                const completed = items.filter(c => c.status === 'completed' || c.status === 'waived').length
                const progress = items.length > 0 ? (completed / items.length) * 100 : 0
                const allDone = completed === items.length && items.length > 0
                return (
                  <Card key={exit.id} className={`border shadow-sm ${allDone ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-emerald-600" />
                          {exit.employeeName}
                          {getStatusBadge(exit.exitType)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-24" />
                          <span className="text-xs text-muted-foreground">{completed}/{items.length}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.id} className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                            item.status === 'completed' ? 'bg-emerald-50/50 border-emerald-200' :
                            item.status === 'waived' ? 'bg-gray-50/50 border-gray-200' : ''
                          }`}>
                            <div className="flex items-center gap-3">
                              {item.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : item.status === 'waived' ? (
                                <Circle className="h-4 w-4 text-gray-400 shrink-0" />
                              ) : (
                                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                              )}
                              {getClearanceIcon(item.icon)}
                              <div>
                                <p className={`text-sm font-medium ${item.status === 'completed' ? 'text-muted-foreground' : ''}`}>
                                  {item.item}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.category} · {item.assignedTo}{item.completedDate ? ` · ${formatDate(item.completedDate)}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(item.status)}
                              {item.status === 'pending' && exit.status === 'in-clearance' && (
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleCompleteClearanceItem(item.id)}>
                                    <CheckCircle2 className="h-3 w-3" /> Complete
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-gray-500" onClick={() => handleWaiveClearanceItem(item.id)}>
                                    Waive
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {exits.filter(e => ['in-clearance', 'approved', 'fnf-pending', 'completed'].includes(e.status)).length === 0 && (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No clearance items yet. Submit and approve resignations to begin clearance.</CardContent></Card>
              )}
            </div>
          </TabsContent>

          {/* ── FnF Settlement Tab ── */}
          <TabsContent value="fnf-settlement">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-600" /> Full & Final Settlement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fnf.map(f => (
                    <Card key={f.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                              {f.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{f.employeeName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(f.status)}
                                {f.processedDate && <span className="text-xs text-muted-foreground">{formatDate(f.processedDate)}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {f.status === 'pending' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleProcessFnF(f.id)}>
                                <IndianRupee className="h-3 w-3" /> Process
                              </Button>
                            )}
                            {f.status === 'processed' && (
                              <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePayFnF(f.id)}>
                                <CheckCircle2 className="h-3 w-3" /> Mark Paid
                              </Button>
                            )}
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                          <div>
                            <p className="text-xs text-muted-foreground">Basic Salary</p>
                            <p className="text-sm font-semibold">{formatCurrency(f.basicSalary)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pending Dues</p>
                            <p className="text-sm font-semibold text-amber-600">{f.pendingDues > 0 ? `+${formatCurrency(f.pendingDues)}` : formatCurrency(0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Notice Period Adj.</p>
                            <p className={`text-sm font-semibold ${f.noticePeriodAdjustment < 0 ? 'text-red-600' : ''}`}>{f.noticePeriodAdjustment < 0 ? '' : '+'}{formatCurrency(f.noticePeriodAdjustment)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Leave Encashment</p>
                            <p className="text-sm font-semibold text-emerald-600">+{formatCurrency(f.leaveEncashment)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Deductions</p>
                            <p className="text-sm font-semibold text-red-600">-{formatCurrency(f.deductions)}</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-muted-foreground">Final Amount</p>
                            <p className="text-lg font-bold text-emerald-700">{formatCurrency(f.finalAmount)}</p>
                          </div>
                        </div>
                        {/* Breakdown bar */}
                        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className="bg-emerald-500" style={{ width: `${(f.basicSalary / f.finalAmount) * 100}%` }} title="Basic" />
                          {f.pendingDues > 0 && <div className="bg-amber-400" style={{ width: `${(f.pendingDues / f.finalAmount) * 100}%` }} title="Dues" />}
                          {f.noticePeriodAdjustment < 0 && <div className="bg-red-400" style={{ width: `${(Math.abs(f.noticePeriodAdjustment) / f.finalAmount) * 100}%` }} title="Notice Adj" />}
                          <div className="bg-sky-400" style={{ width: `${(f.leaveEncashment / f.finalAmount) * 100}%` }} title="Leave" />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Basic</span>
                          {f.pendingDues > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Dues</span>}
                          {f.noticePeriodAdjustment < 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Notice Adj</span>}
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-400" /> Leave</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Exit Interview Tab ── */}
          <TabsContent value="exit-interview">
            <div className="space-y-4">
              {interviews.map(iv => {
                const exit = exits.find(e => e.id === iv.exitId)
                return (
                  <Card key={iv.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {iv.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{iv.employeeName}</p>
                              {getStatusBadge(iv.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{exit?.designation} · {exit?.department}</p>
                            {iv.date && <p className="text-xs text-muted-foreground mt-1">Conducted: {formatDate(iv.date)} by {iv.conductedBy}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {iv.status === 'pending' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => { setSelectedExitId(iv.exitId); setInterviewDialogOpen(true) }}>
                              <MessageSquare className="h-3 w-3" /> Conduct Interview
                            </Button>
                          )}
                        </div>
                      </div>
                      {iv.status === 'completed' && (
                        <div className="mt-4 space-y-3 rounded-lg bg-muted/50 p-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Overall Experience</p>
                            <p className="text-sm">{iv.overallExperience}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Reason for Leaving</p>
                            <p className="text-sm">{iv.reasonForLeaving}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Would Recommend?</p>
                              <p className="text-sm">{iv.wouldRecommend}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">What Liked Most</p>
                              <p className="text-sm">{iv.whatLikedMost}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">What Could Improve</p>
                            <p className="text-sm">{iv.whatCouldImprove}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Suggestions</p>
                            <p className="text-sm">{iv.suggestions}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Resignation Dialog */}
      <Dialog open={addResignOpen} onOpenChange={setAddResignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-emerald-600" /> Submit Resignation
            </DialogTitle>
            <DialogDescription>Fill in the resignation details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Employee Name</Label>
                <Input value={resignForm.employeeName} onChange={e => setResignForm({ ...resignForm, employeeName: e.target.value })} placeholder="Full Name" />
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input value={resignForm.employeeId} onChange={e => setResignForm({ ...resignForm, employeeId: e.target.value })} placeholder="EMP001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={resignForm.department} onValueChange={v => setResignForm({ ...resignForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Input value={resignForm.designation} onChange={e => setResignForm({ ...resignForm, designation: e.target.value })} placeholder="Designation" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Resignation Date</Label>
                <Input type="date" value={resignForm.resignationDate} onChange={e => setResignForm({ ...resignForm, resignationDate: e.target.value })} />
              </div>
              <div>
                <Label>Last Working Date</Label>
                <Input type="date" value={resignForm.lastWorkingDate} onChange={e => setResignForm({ ...resignForm, lastWorkingDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Notice Period</Label>
                <Select value={resignForm.noticePeriod} onValueChange={v => setResignForm({ ...resignForm, noticePeriod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 days">30 days</SelectItem>
                    <SelectItem value="60 days">60 days</SelectItem>
                    <SelectItem value="90 days">90 days</SelectItem>
                    <SelectItem value="Waived">Waived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exit Type</Label>
                <Select value={resignForm.exitType} onValueChange={v => setResignForm({ ...resignForm, exitType: v as 'voluntary' | 'termination' | 'contract-end' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary">Voluntary</SelectItem>
                    <SelectItem value="termination">Termination</SelectItem>
                    <SelectItem value="contract-end">Contract End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Reporting Manager</Label>
              <Input value={resignForm.managerName} onChange={e => setResignForm({ ...resignForm, managerName: e.target.value })} placeholder="Manager name" />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea value={resignForm.reason} onChange={e => setResignForm({ ...resignForm, reason: e.target.value })} placeholder="Reason for resignation..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddResignOpen(false)}>Cancel</Button>
            <Button onClick={handleAddResignation} className="bg-emerald-600 hover:bg-emerald-700" disabled={!resignForm.employeeName}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" /> Exit Interview
            </DialogTitle>
            <DialogDescription>Record the exit interview responses for {interviews.find(i => i.exitId === selectedExitId)?.employeeName}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>How was your overall experience at the company?</Label>
              <Textarea value={interviewForm.overallExperience} onChange={e => setInterviewForm({ ...interviewForm, overallExperience: e.target.value })} placeholder="Share your experience..." rows={2} />
            </div>
            <div>
              <Label>What is the primary reason for leaving?</Label>
              <Textarea value={interviewForm.reasonForLeaving} onChange={e => setInterviewForm({ ...interviewForm, reasonForLeaving: e.target.value })} placeholder="Reason for leaving..." rows={2} />
            </div>
            <div>
              <Label>Would you recommend this company to others?</Label>
              <Select value={interviewForm.wouldRecommend} onValueChange={v => setInterviewForm({ ...interviewForm, wouldRecommend: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Maybe">Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>What did you like most about working here?</Label>
              <Textarea value={interviewForm.whatLikedMost} onChange={e => setInterviewForm({ ...interviewForm, whatLikedMost: e.target.value })} placeholder="What you liked most..." rows={2} />
            </div>
            <div>
              <Label>What could the company improve?</Label>
              <Textarea value={interviewForm.whatCouldImprove} onChange={e => setInterviewForm({ ...interviewForm, whatCouldImprove: e.target.value })} placeholder="Areas for improvement..." rows={2} />
            </div>
            <div>
              <Label>Any other suggestions or feedback?</Label>
              <Textarea value={interviewForm.suggestions} onChange={e => setInterviewForm({ ...interviewForm, suggestions: e.target.value })} placeholder="Your suggestions..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveInterview} className="bg-emerald-600 hover:bg-emerald-700" disabled={!interviewForm.overallExperience}>Save Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>This will remove the exit request and all associated data (clearance, FnF, interview). This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteConfirm) handleDeleteExit(deleteConfirm) }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
