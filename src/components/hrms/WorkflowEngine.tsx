'use client'

import { useState } from 'react'
import {
  GitBranch,
  Play,
  History,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  AlertCircle,
  Zap,
  User,
  Calendar,
  Sparkles,
  Edit,
  ChevronDown,
  ChevronUp,
  Timer,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  id: string
  name: string
  role: string
  type: 'approval' | 'notification' | 'action'
}

interface WorkflowDefinition {
  id: string
  name: string
  description: string
  category: string
  steps: WorkflowStep[]
  isActive: boolean
  instances: number
}

interface WorkflowInstance {
  id: string
  workflowId: string
  workflowName: string
  entityType: string
  initiatedBy: string
  initiatedDate: string
  currentStep: number
  totalSteps: number
  status: 'in-progress' | 'completed' | 'rejected' | 'on-hold'
  stepDetails: InstanceStep[]
  completedDate?: string
  duration?: string
}

interface InstanceStep {
  name: string
  role: string
  status: 'pending' | 'completed' | 'rejected' | 'current'
  actedBy: string | null
  actedDate: string | null
  comments: string
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const initialWorkflows: WorkflowDefinition[] = [
  {
    id: 'WF-001', name: 'Leave Approval', description: 'Standard leave approval workflow with manager and HR approval steps', category: 'Leave', isActive: true, instances: 24,
    steps: [
      { id: 'S1', name: 'Manager', role: 'Reporting Manager', type: 'approval' },
      { id: 'S2', name: 'HR', role: 'HR Team', type: 'approval' },
      { id: 'S3', name: 'Complete', role: 'System', type: 'notification' },
    ],
  },
  {
    id: 'WF-002', name: 'Expense Approval', description: 'Multi-level expense approval workflow based on amount threshold', category: 'Finance', isActive: true, instances: 15,
    steps: [
      { id: 'S1', name: 'Manager', role: 'Reporting Manager', type: 'approval' },
      { id: 'S2', name: 'Finance', role: 'Finance Team', type: 'approval' },
    ],
  },
  {
    id: 'WF-003', name: 'Recruitment Approval', description: 'End-to-end recruitment workflow from requisition to offer release', category: 'Talent', isActive: true, instances: 8,
    steps: [
      { id: 'S1', name: 'Manager', role: 'Hiring Manager', type: 'approval' },
      { id: 'S2', name: 'HR', role: 'HR Head', type: 'approval' },
      { id: 'S3', name: 'Budget', role: 'Finance Director', type: 'approval' },
      { id: 'S4', name: 'Director', role: 'Director', type: 'approval' },
    ],
  },
  {
    id: 'WF-004', name: 'Onboarding Checklist', description: 'New employee onboarding with IT setup, asset allocation, and induction', category: 'HR', isActive: true, instances: 5,
    steps: [
      { id: 'S1', name: 'Document Collection', role: 'HR Team', type: 'action' },
      { id: 'S2', name: 'IT Setup', role: 'IT Team', type: 'action' },
      { id: 'S3', name: 'Asset Allocation', role: 'Admin', type: 'action' },
      { id: 'S4', name: 'Policy Ack', role: 'HR Team', type: 'approval' },
      { id: 'S5', name: 'Induction', role: 'HR Team', type: 'notification' },
    ],
  },
  {
    id: 'WF-005', name: 'Exit Clearance', description: 'Employee exit workflow with clearance from multiple departments', category: 'HR', isActive: true, instances: 3,
    steps: [
      { id: 'S1', name: 'Manager', role: 'Reporting Manager', type: 'approval' },
      { id: 'S2', name: 'HR', role: 'HR Team', type: 'approval' },
      { id: 'S3', name: 'IT', role: 'IT Team', type: 'action' },
      { id: 'S4', name: 'Finance', role: 'Finance Team', type: 'approval' },
    ],
  },
  {
    id: 'WF-006', name: 'Offer Approval', description: 'Offer letter approval workflow for new hires', category: 'Talent', isActive: true, instances: 6,
    steps: [
      { id: 'S1', name: 'Recruiter', role: 'Recruiter', type: 'action' },
      { id: 'S2', name: 'HR Head', role: 'HR Head', type: 'approval' },
      { id: 'S3', name: 'Finance', role: 'Finance', type: 'approval' },
      { id: 'S4', name: 'Director', role: 'Director', type: 'approval' },
    ],
  },
  {
    id: 'WF-007', name: 'Timesheet Approval', description: 'Weekly timesheet approval workflow for project billing', category: 'Projects', isActive: true, instances: 32,
    steps: [
      { id: 'S1', name: 'Employee', role: 'Employee', type: 'action' },
      { id: 'S2', name: 'Manager', role: 'Project Manager', type: 'approval' },
    ],
  },
  {
    id: 'WF-008', name: 'Training Approval', description: 'Training and certification request approval workflow', category: 'Learning', isActive: true, instances: 10,
    steps: [
      { id: 'S1', name: 'Employee', role: 'Employee', type: 'action' },
      { id: 'S2', name: 'Manager', role: 'Reporting Manager', type: 'approval' },
      { id: 'S3', name: 'L&D', role: 'L&D Team', type: 'approval' },
      { id: 'S4', name: 'Finance', role: 'Finance', type: 'approval' },
    ],
  },
]

const initialActiveInstances: WorkflowInstance[] = [
  {
    id: 'WI-001', workflowId: 'WF-001', workflowName: 'Leave Approval', entityType: 'Leave', initiatedBy: 'Meera Patel', initiatedDate: '2026-03-02', currentStep: 1, totalSteps: 3, status: 'in-progress',
    stepDetails: [
      { name: 'Manager', role: 'Reporting Manager', status: 'current', actedBy: null, actedDate: null, comments: '' },
      { name: 'HR', role: 'HR Team', status: 'pending', actedBy: null, actedDate: null, comments: '' },
      { name: 'Complete', role: 'System', status: 'pending', actedBy: null, actedDate: null, comments: '' },
    ],
  },
  {
    id: 'WI-002', workflowId: 'WF-002', workflowName: 'Expense Approval', entityType: 'Expense', initiatedBy: 'Vikram Singh', initiatedDate: '2026-03-01', currentStep: 2, totalSteps: 2, status: 'in-progress',
    stepDetails: [
      { name: 'Manager', role: 'Reporting Manager', status: 'completed', actedBy: 'Deepak T.', actedDate: '2026-03-01', comments: 'Approved' },
      { name: 'Finance', role: 'Finance Team', status: 'current', actedBy: null, actedDate: null, comments: '' },
    ],
  },
  {
    id: 'WI-003', workflowId: 'WF-003', workflowName: 'Recruitment Approval', entityType: 'Requisition', initiatedBy: 'Rahul M.', initiatedDate: '2026-02-28', currentStep: 2, totalSteps: 4, status: 'in-progress',
    stepDetails: [
      { name: 'Manager', role: 'Hiring Manager', status: 'completed', actedBy: 'Rahul M.', actedDate: '2026-02-28', comments: 'Senior Developer position' },
      { name: 'HR', role: 'HR Head', status: 'completed', actedBy: 'Sanjay N.', actedDate: '2026-03-01', comments: 'Approved' },
      { name: 'Budget', role: 'Finance Director', status: 'current', actedBy: null, actedDate: null, comments: '' },
      { name: 'Director', role: 'Director', status: 'pending', actedBy: null, actedDate: null, comments: '' },
    ],
  },
]

const initialHistory: WorkflowInstance[] = [
  {
    id: 'WH-001', workflowId: 'WF-001', workflowName: 'Leave Approval', entityType: 'Leave', initiatedBy: 'Aarav Sharma', initiatedDate: '2026-02-20', currentStep: 3, totalSteps: 3, status: 'completed', completedDate: '2026-02-21', duration: '1 day',
    stepDetails: [
      { name: 'Manager', role: 'Reporting Manager', status: 'completed', actedBy: 'Rahul M.', actedDate: '2026-02-20', comments: 'Approved' },
      { name: 'HR', role: 'HR Team', status: 'completed', actedBy: 'HR Team', actedDate: '2026-02-21', comments: 'Approved' },
      { name: 'Complete', role: 'System', status: 'completed', actedBy: 'System', actedDate: '2026-02-21', comments: '' },
    ],
  },
  {
    id: 'WH-002', workflowId: 'WF-002', workflowName: 'Expense Approval', entityType: 'Expense', initiatedBy: 'Ananya Reddy', initiatedDate: '2026-02-15', currentStep: 2, totalSteps: 2, status: 'completed', completedDate: '2026-02-18', duration: '3 days',
    stepDetails: [
      { name: 'Manager', role: 'Reporting Manager', status: 'completed', actedBy: 'Sanjay N.', actedDate: '2026-02-16', comments: 'Approved' },
      { name: 'Finance', role: 'Finance Team', status: 'completed', actedBy: 'Finance Team', actedDate: '2026-02-18', comments: 'Paid via NEFT' },
    ],
  },
  {
    id: 'WH-003', workflowId: 'WF-001', workflowName: 'Leave Approval', entityType: 'Leave', initiatedBy: 'Priya Kumar', initiatedDate: '2026-02-10', currentStep: 1, totalSteps: 3, status: 'rejected', completedDate: '2026-02-11', duration: '1 day',
    stepDetails: [
      { name: 'Manager', role: 'Reporting Manager', status: 'rejected', actedBy: 'Rahul M.', actedDate: '2026-02-11', comments: 'Critical project delivery - cannot approve' },
      { name: 'HR', role: 'HR Team', status: 'pending', actedBy: null, actedDate: null, comments: '' },
      { name: 'Complete', role: 'System', status: 'pending', actedBy: null, actedDate: null, comments: '' },
    ],
  },
  {
    id: 'WH-004', workflowId: 'WF-004', workflowName: 'Onboarding Checklist', entityType: 'Onboarding', initiatedBy: 'HR Team', initiatedDate: '2026-02-01', currentStep: 5, totalSteps: 5, status: 'completed', completedDate: '2026-02-07', duration: '6 days',
    stepDetails: [
      { name: 'Document Collection', role: 'HR Team', status: 'completed', actedBy: 'HR Team', actedDate: '2026-02-02', comments: 'All docs collected' },
      { name: 'IT Setup', role: 'IT Team', status: 'completed', actedBy: 'IT Team', actedDate: '2026-02-03', comments: 'Laptop and email configured' },
      { name: 'Asset Allocation', role: 'Admin', status: 'completed', actedBy: 'Admin', actedDate: '2026-02-04', comments: 'ID card and assets issued' },
      { name: 'Policy Ack', role: 'HR Team', status: 'completed', actedBy: 'HR Team', actedDate: '2026-02-05', comments: 'Policies acknowledged' },
      { name: 'Induction', role: 'HR Team', status: 'completed', actedBy: 'HR Team', actedDate: '2026-02-07', comments: 'Induction completed' },
    ],
  },
  {
    id: 'WH-005', workflowId: 'WF-005', workflowName: 'Exit Clearance', entityType: 'Exit', initiatedBy: 'Suresh Nair', initiatedDate: '2026-02-20', currentStep: 3, totalSteps: 4, status: 'completed', completedDate: '2026-02-26', duration: '6 days',
    stepDetails: [
      { name: 'Manager', role: 'Reporting Manager', status: 'completed', actedBy: 'Manager', actedDate: '2026-02-21', comments: 'Approved with notice period' },
      { name: 'HR', role: 'HR Team', status: 'completed', actedBy: 'HR Team', actedDate: '2026-02-22', comments: 'Exit interview done' },
      { name: 'IT', role: 'IT Team', status: 'completed', actedBy: 'IT Team', actedDate: '2026-02-24', comments: 'Laptop and access revoked' },
      { name: 'Finance', role: 'Finance Team', status: 'completed', actedBy: 'Finance Team', actedDate: '2026-02-26', comments: 'FnF processed' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    'in-progress': { label: 'In Progress', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
    'on-hold': { label: 'On Hold', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    current: { label: 'Current', className: 'bg-sky-100 text-sky-700 border-sky-200' },
  }
  const cfg = config[status] || config.pending
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getStepIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
    case 'current': return <Clock className="h-5 w-5 text-sky-600 animate-pulse" />
    case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />
    default: return <Circle className="h-5 w-5 text-gray-300" />
  }
}

function getCategoryBadge(category: string) {
  const config: Record<string, { className: string }> = {
    Leave: { className: 'bg-violet-100 text-violet-700 border-violet-200' },
    Finance: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Talent: { className: 'bg-sky-100 text-sky-700 border-sky-200' },
    HR: { className: 'bg-amber-100 text-amber-700 border-amber-200' },
    Projects: { className: 'bg-orange-100 text-orange-700 border-orange-200' },
    Learning: { className: 'bg-teal-100 text-teal-700 border-teal-200' },
  }
  const cfg = config[category] || { className: 'bg-gray-100 text-gray-700 border-gray-200' }
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{category}</Badge>
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkflowEngine() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const tabMap: Record<string, string> = { 'builder': 'builder', 'workflow-builder': 'builder', 'active': 'active-workflows', 'active-workflows': 'active-workflows', 'history': 'workflow-history', 'workflow-templates': 'builder', 'templates': 'builder' }
  const [manualTab, setManualTab] = useState('builder')
  // Derive active tab: sidebar sub-item takes priority, then manual tab
  const activeTab = (activeSubItem && tabMap[activeSubItem]) ? tabMap[activeSubItem] : manualTab

  const handleTabChange = (tab: string) => {
    setManualTab(tab)
    setActiveSubItem(null)
  }
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(initialWorkflows)
  const [activeInstances, setActiveInstances] = useState<WorkflowInstance[]>(initialActiveInstances)
  const [history, setHistory] = useState<WorkflowInstance[]>(initialHistory)
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDefinition | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '', category: 'HR', steps: 3 })

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleApproveStep(instanceId: string) {
    setActiveInstances(prev => prev.map(inst => {
      if (inst.id !== instanceId) return inst
      const newStepDetails = inst.stepDetails.map((step, idx) => {
        if (idx === inst.currentStep) {
          return { ...step, status: 'completed' as const, actedBy: 'Current User', actedDate: new Date().toISOString().split('T')[0], comments: 'Approved' }
        }
        if (idx === inst.currentStep + 1) {
          return { ...step, status: 'current' as const }
        }
        return step
      })
      const nextStep = inst.currentStep + 1
      const isComplete = nextStep >= inst.totalSteps
      return { ...inst, stepDetails: newStepDetails, currentStep: nextStep, status: isComplete ? 'completed' as const : 'in-progress' as const }
    }))
  }

  function handleRejectStep(instanceId: string) {
    setActiveInstances(prev => prev.map(inst => {
      if (inst.id !== instanceId) return inst
      const newStepDetails = inst.stepDetails.map((step, idx) => {
        if (idx === inst.currentStep) return { ...step, status: 'rejected' as const, actedBy: 'Current User', actedDate: new Date().toISOString().split('T')[0], comments: 'Rejected' }
        return step
      })
      return { ...inst, stepDetails: newStepDetails, status: 'rejected' as const }
    }))
  }

  function handleCreateWorkflow() {
    const steps: WorkflowStep[] = []
    for (let i = 0; i < newWorkflow.steps; i++) {
      steps.push({
        id: `S${i + 1}`,
        name: `Step ${i + 1}`,
        role: i === 0 ? 'Initiator' : i === newWorkflow.steps - 1 ? 'System' : 'Approver',
        type: i === 0 ? 'action' : i === newWorkflow.steps - 1 ? 'notification' : 'approval',
      })
    }
    const wf: WorkflowDefinition = {
      id: `WF-${String(workflows.length + 1).padStart(3, '0')}`,
      name: newWorkflow.name,
      description: newWorkflow.description,
      category: newWorkflow.category,
      isActive: true,
      instances: 0,
      steps,
    }
    setWorkflows(prev => [...prev, wf])
    setCreateOpen(false)
    setNewWorkflow({ name: '', description: '', category: 'HR', steps: 3 })
  }

  function handleEditWorkflow() {
    if (!editingWorkflow) return
    setWorkflows(prev => prev.map(w => w.id === editingWorkflow.id ? editingWorkflow : w))
    setEditOpen(false)
    setEditingWorkflow(null)
  }

  function handleDeleteWorkflow(id: string) {
    setWorkflows(prev => prev.filter(w => w.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <GitBranch className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Workflow Engine
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]"><Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI</Badge>
              </h1>
              <p className="text-muted-foreground text-sm">{workflows.length} workflows · {activeInstances.filter(i => i.status === 'in-progress').length} active</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search workflows..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-9 w-full pl-9 sm:w-[200px]" />
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Create Workflow
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active Workflows</p><p className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</p></CardContent></Card>
          <Card className="border-l-4 border-l-sky-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Running Instances</p><p className="text-2xl font-bold">{activeInstances.filter(i => i.status === 'in-progress').length}</p></CardContent></Card>
          <Card className="border-l-4 border-l-violet-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{history.filter(h => h.status === 'completed').length}</p></CardContent></Card>
          <Card className="border-l-4 border-l-red-500"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Rejected</p><p className="text-2xl font-bold">{history.filter(h => h.status === 'rejected').length}</p></CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="builder" className="gap-1.5"><GitBranch className="h-3.5 w-3.5" /> Workflow Builder</TabsTrigger>
            <TabsTrigger value="active-workflows" className="gap-1.5"><Play className="h-3.5 w-3.5" /> Active Workflows</TabsTrigger>
            <TabsTrigger value="workflow-history" className="gap-1.5"><History className="h-3.5 w-3.5" /> History</TabsTrigger>
          </TabsList>

          {/* Workflow Builder Tab */}
          <TabsContent value="builder">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWorkflows.map(wf => (
                <Card key={wf.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">{wf.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {wf.isActive ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Active</Badge> : <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-600" onClick={() => { setEditingWorkflow({ ...wf }); setEditOpen(true) }}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => setDeleteConfirm(wf.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{wf.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 flex items-center gap-2">
                      {getCategoryBadge(wf.category)}
                      <span className="text-xs text-muted-foreground">{wf.instances} instances</span>
                    </div>
                    {/* Visual Step Diagram */}
                    <div className="flex items-center gap-0 overflow-x-auto pb-2">
                      {wf.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center shrink-0">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold border-2 ${step.type === 'approval' ? 'bg-amber-50 border-amber-300 text-amber-700' : step.type === 'action' ? 'bg-sky-50 border-sky-300 text-sky-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
                              {idx + 1}
                            </div>
                            <p className="text-[10px] text-center max-w-[70px] mt-1 font-medium leading-tight">{step.name}</p>
                            <p className="text-[9px] text-muted-foreground text-center">{step.role}</p>
                          </div>
                          {idx < wf.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Workflows Tab */}
          <TabsContent value="active-workflows">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Workflow</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead className="hidden sm:table-cell">Entity</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead>Current Step</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeInstances.filter(i => i.status === 'in-progress').length === 0 ? (
                        <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No active workflow instances</TableCell></TableRow>
                      ) : activeInstances.filter(i => i.status === 'in-progress').map(inst => (
                        <TableRow key={inst.id} className="cursor-pointer" onClick={() => { setSelectedInstance(inst); setDetailOpen(true) }}>
                          <TableCell className="pl-4">
                            <span className="text-sm font-medium">{inst.workflowName}</span>
                            <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{inst.id}</code>
                          </TableCell>
                          <TableCell className="text-sm">{inst.initiatedBy}</TableCell>
                          <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{inst.entityType}</Badge></TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{formatDate(inst.initiatedDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-sky-600" />
                              <span className="text-sm font-medium">{inst.stepDetails[inst.currentStep]?.name || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <Progress value={(inst.currentStep / inst.totalSteps) * 100} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{inst.currentStep}/{inst.totalSteps}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(inst.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleApproveStep(inst.id)}>
                                <CheckCircle2 className="h-3 w-3" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600" onClick={() => handleRejectStep(inst.id)}>
                                <AlertCircle className="h-3 w-3" /> Reject
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { setSelectedInstance(inst); setDetailOpen(true) }}><Eye className="h-4 w-4" /></Button>
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

          {/* Workflow History Tab */}
          <TabsContent value="workflow-history">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Workflow</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead className="hidden sm:table-cell">Entity</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map(inst => (
                        <TableRow key={inst.id} className="cursor-pointer" onClick={() => { setSelectedInstance(inst); setDetailOpen(true) }}>
                          <TableCell className="pl-4">
                            <span className="text-sm font-medium">{inst.workflowName}</span>
                          </TableCell>
                          <TableCell className="text-sm">{inst.initiatedBy}</TableCell>
                          <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[10px]">{inst.entityType}</Badge></TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{formatDate(inst.initiatedDate)}</TableCell>
                          <TableCell>{getStatusBadge(inst.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{inst.duration || '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { setSelectedInstance(inst); setDetailOpen(true) }}><Eye className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Instance Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          {selectedInstance && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedInstance.workflowName}
                  {getStatusBadge(selectedInstance.status)}
                </DialogTitle>
                <DialogDescription>
                  Initiated by {selectedInstance.initiatedBy} on {formatDate(selectedInstance.initiatedDate)}
                  {selectedInstance.duration && <span> · Duration: {selectedInstance.duration}</span>}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={(selectedInstance.currentStep / selectedInstance.totalSteps) * 100} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground">{selectedInstance.currentStep}/{selectedInstance.totalSteps} steps</span>
                </div>
                {selectedInstance.stepDetails.map((step, idx) => (
                  <div key={idx} className={`flex items-start gap-3 rounded-lg border p-3 ${step.status === 'current' ? 'border-sky-200 bg-sky-50' : step.status === 'rejected' ? 'border-red-200 bg-red-50' : step.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{step.name}</p>
                        <span className="text-xs text-muted-foreground">{step.role}</span>
                      </div>
                      {step.actedBy && <p className="text-xs text-muted-foreground mt-0.5">By {step.actedBy} · {step.actedDate ? formatDate(step.actedDate) : ''}</p>}
                      {step.comments && <p className="text-xs mt-1">{step.comments}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-emerald-600" /> Create Workflow</DialogTitle>
            <DialogDescription>Define a new workflow template.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Name</Label><Input value={newWorkflow.name} onChange={e => setNewWorkflow({ ...newWorkflow, name: e.target.value })} placeholder="Workflow name" /></div>
            <div><Label>Description</Label><Textarea value={newWorkflow.description} onChange={e => setNewWorkflow({ ...newWorkflow, description: e.target.value })} placeholder="Brief description" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={newWorkflow.category} onValueChange={v => setNewWorkflow({ ...newWorkflow, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Talent">Talent</SelectItem>
                    <SelectItem value="Leave">Leave</SelectItem>
                    <SelectItem value="Projects">Projects</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Number of Steps</Label><Input type="number" min={2} max={10} value={newWorkflow.steps} onChange={e => setNewWorkflow({ ...newWorkflow, steps: Number(e.target.value) })} /></div>
            </div>
            {/* Preview Steps */}
            {newWorkflow.name && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <p className="text-xs font-semibold mb-2">Step Preview:</p>
                <div className="flex items-center gap-0 overflow-x-auto">
                  {Array.from({ length: newWorkflow.steps }).map((_, i) => (
                    <div key={i} className="flex items-center shrink-0">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold border-2 ${i === 0 ? 'bg-sky-50 border-sky-300 text-sky-700' : i === newWorkflow.steps - 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
                          {i + 1}
                        </div>
                        <p className="text-[9px] mt-0.5">{i === 0 ? 'Initiate' : i === newWorkflow.steps - 1 ? 'Complete' : 'Approve'}</p>
                      </div>
                      {i < newWorkflow.steps - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkflow} className="bg-emerald-600 hover:bg-emerald-700" disabled={!newWorkflow.name}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          {editingWorkflow && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-emerald-600" /> Edit Workflow</DialogTitle>
                <DialogDescription>Modify workflow configuration and steps.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div><Label>Name</Label><Input value={editingWorkflow.name} onChange={e => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={editingWorkflow.description} onChange={e => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={editingWorkflow.category} onValueChange={v => setEditingWorkflow({ ...editingWorkflow, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Talent">Talent</SelectItem>
                        <SelectItem value="Leave">Leave</SelectItem>
                        <SelectItem value="Projects">Projects</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Active</Label>
                    <Button
                      variant={editingWorkflow.isActive ? 'default' : 'outline'}
                      size="sm"
                      className={editingWorkflow.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      onClick={() => setEditingWorkflow({ ...editingWorkflow, isActive: !editingWorkflow.isActive })}
                    >
                      {editingWorkflow.isActive ? 'Active' : 'Inactive'}
                    </Button>
                  </div>
                </div>
                {/* Step Configuration */}
                <div>
                  <Label className="mb-2 block">Steps ({editingWorkflow.steps.length})</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {editingWorkflow.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-2 rounded-lg border p-2 bg-muted/20">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border-2 ${step.type === 'approval' ? 'bg-amber-50 border-amber-300 text-amber-700' : step.type === 'action' ? 'bg-sky-50 border-sky-300 text-sky-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
                          {idx + 1}
                        </div>
                        <Input
                          value={step.name}
                          onChange={e => {
                            const newSteps = [...editingWorkflow.steps]
                            newSteps[idx] = { ...newSteps[idx], name: e.target.value }
                            setEditingWorkflow({ ...editingWorkflow, steps: newSteps })
                          }}
                          className="h-8 text-sm flex-1"
                          placeholder="Step name"
                        />
                        <Input
                          value={step.role}
                          onChange={e => {
                            const newSteps = [...editingWorkflow.steps]
                            newSteps[idx] = { ...newSteps[idx], role: e.target.value }
                            setEditingWorkflow({ ...editingWorkflow, steps: newSteps })
                          }}
                          className="h-8 text-sm w-[120px]"
                          placeholder="Role"
                        />
                        <Select
                          value={step.type}
                          onValueChange={v => {
                            const newSteps = [...editingWorkflow.steps]
                            newSteps[idx] = { ...newSteps[idx], type: v as WorkflowStep['type'] }
                            setEditingWorkflow({ ...editingWorkflow, steps: newSteps })
                          }}
                        >
                          <SelectTrigger className="h-8 w-[100px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approval">Approval</SelectItem>
                            <SelectItem value="action">Action</SelectItem>
                            <SelectItem value="notification">Notify</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleEditWorkflow} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this workflow template. Any active instances will not be affected.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteWorkflow(deleteConfirm)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
