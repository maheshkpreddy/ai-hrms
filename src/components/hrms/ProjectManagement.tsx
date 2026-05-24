'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  FolderKanban,
  Users,
  Flag,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  X,
  Download,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { exportProjectReport } from '@/lib/excelExport'

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  email: string
  avatar?: string | null
  designation?: string | null
  department?: string | null
}

interface ProjectMember {
  id: string
  projectId: string
  employeeId: string
  role: string
  employee: Employee
  project?: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

interface ProjectMilestone {
  id: string
  projectId: string
  title: string
  description?: string | null
  dueDate?: string | null
  completedDate?: string | null
  status: string
  project?: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description?: string | null
  status: string
  priority: string
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
  progress: number
  companyId?: string | null
  createdBy?: string | null
  members: ProjectMember[]
  milestones: ProjectMilestone[]
  createdAt: string
  updatedAt: string
}

// ─── Badge Helpers ──────────────────────────────────────────────────────────────
function getStatusBadge(status: string) {
  switch (status) {
    case 'planning':
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-400">
          Planning
        </Badge>
      )
    case 'active':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
          Active
        </Badge>
      )
    case 'on-hold':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          On Hold
        </Badge>
      )
    case 'completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
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

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'low':
      return (
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
          Low
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-400">
          Medium
        </Badge>
      )
    case 'high':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          High
        </Badge>
      )
    case 'critical':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">
          Critical
        </Badge>
      )
    default:
      return <Badge variant="secondary">{priority}</Badge>
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case 'lead':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
          Lead
        </Badge>
      )
    case 'manager':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          Manager
        </Badge>
      )
    case 'member':
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-400">
          Member
        </Badge>
      )
    default:
      return <Badge variant="secondary">{role}</Badge>
  }
}

function getMilestoneStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          Pending
        </Badge>
      )
    case 'completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
          Completed
        </Badge>
      )
    case 'overdue':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">
          Overdue
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getProgressColor(progress: number) {
  if (progress >= 75) return '[&>div]:bg-emerald-500'
  if (progress >= 50) return '[&>div]:bg-sky-500'
  if (progress >= 25) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-red-500'
}

// ─── Loading Skeletons ──────────────────────────────────────────────────────────
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

function ProjectCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-1">
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-2 w-full animate-pulse rounded bg-muted" />
        <div className="flex justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
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

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ProjectManagement() {
  // ── State ────────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [addMilestoneDialogOpen, setAddMilestoneDialogOpen] = useState(false)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [editStatusProject, setEditStatusProject] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── Form State ───────────────────────────────────────────────────────────────
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
  })

  const [memberForm, setMemberForm] = useState({
    projectId: '',
    employeeId: '',
    role: 'member',
  })

  const [milestoneForm, setMilestoneForm] = useState({
    projectId: '',
    title: '',
    description: '',
    dueDate: '',
  })

  // ── API Hooks ────────────────────────────────────────────────────────────────
  const {
    data: projectsResponse,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useApi<{ projects: Project[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>({
    baseUrl: '/api/projects',
    params: {
      page: 1,
      limit: 50,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      search: searchQuery || undefined,
    },
  })

  const {
    data: employeesResponse,
  } = useApi<{ employees: Employee[] }>({
    baseUrl: '/api/employees',
    params: { page: 1, limit: 100 },
  })

  // ── Derived Data ─────────────────────────────────────────────────────────────
  const projects = projectsResponse?.projects ?? []
  const employees = employeesResponse?.employees ?? []

  const totalProjects = projectsResponse?.pagination?.total ?? projects.length
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const completedProjects = projects.filter((p) => p.status === 'completed').length
  const onHoldProjects = projects.filter((p) => p.status === 'on-hold').length

  // Flatten all members across projects for the Members tab
  const allMembers = useMemo(() => {
    return projects.flatMap((project) =>
      project.members.map((m) => ({
        ...m,
        project: { id: project.id, name: project.name },
      }))
    )
  }, [projects])

  // Flatten all milestones across projects for the Milestones tab
  const allMilestones = useMemo(() => {
    return projects.flatMap((project) =>
      project.milestones.map((m) => ({
        ...m,
        project: { id: project.id, name: project.name },
      }))
    )
  }, [projects])

  // Group milestones by project
  const milestonesByProject = useMemo(() => {
    const grouped: Record<string, { projectName: string; milestones: typeof allMilestones }> = {}
    allMilestones.forEach((m) => {
      if (!grouped[m.projectId]) {
        grouped[m.projectId] = {
          projectName: m.project?.name || 'Unknown',
          milestones: [],
        }
      }
      grouped[m.projectId].milestones.push(m)
    })
    return grouped
  }, [allMilestones])

  // ── Mutation Handlers ────────────────────────────────────────────────────────
  const handleCreateProject = useCallback(async () => {
    if (!projectForm.name) return
    setSubmitting(true)
    try {
      await apiPost('/api/projects', {
        name: projectForm.name,
        description: projectForm.description || undefined,
        status: projectForm.status,
        priority: projectForm.priority,
        startDate: projectForm.startDate || undefined,
        endDate: projectForm.endDate || undefined,
        budget: projectForm.budget ? parseFloat(projectForm.budget) : undefined,
      })
      setCreateDialogOpen(false)
      setProjectForm({ name: '', description: '', status: 'planning', priority: 'medium', startDate: '', endDate: '', budget: '' })
      refetchProjects()
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setSubmitting(false)
    }
  }, [projectForm, refetchProjects])

  const handleUpdateProjectStatus = useCallback(async (projectId: string, newStatus: string) => {
    setActionLoading(projectId)
    try {
      await apiPatch(`/api/projects/${projectId}`, { status: newStatus })
      setEditStatusProject(null)
      refetchProjects()
    } catch (err) {
      console.error('Failed to update project status:', err)
    } finally {
      setActionLoading(null)
    }
  }, [refetchProjects])

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also remove all members and milestones.')) return
    setActionLoading(projectId)
    try {
      await apiDelete(`/api/projects/${projectId}`)
      refetchProjects()
    } catch (err) {
      console.error('Failed to delete project:', err)
    } finally {
      setActionLoading(null)
    }
  }, [refetchProjects])

  const handleAddMember = useCallback(async () => {
    if (!memberForm.projectId || !memberForm.employeeId) return
    setSubmitting(true)
    try {
      await apiPost('/api/projects/members', {
        projectId: memberForm.projectId,
        employeeId: memberForm.employeeId,
        role: memberForm.role,
      })
      setAddMemberDialogOpen(false)
      setMemberForm({ projectId: '', employeeId: '', role: 'member' })
      refetchProjects()
    } catch (err) {
      console.error('Failed to add member:', err)
    } finally {
      setSubmitting(false)
    }
  }, [memberForm, refetchProjects])

  const handleUpdateMemberRole = useCallback(async (memberId: string, newRole: string) => {
    setActionLoading(memberId)
    try {
      await apiPatch('/api/projects/members', { id: memberId, role: newRole })
      refetchProjects()
    } catch (err) {
      console.error('Failed to update member role:', err)
    } finally {
      setActionLoading(null)
    }
  }, [refetchProjects])

  const handleRemoveMember = useCallback(async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the project?')) return
    setActionLoading(memberId)
    try {
      await apiDelete(`/api/projects/members?id=${memberId}`)
      refetchProjects()
    } catch (err) {
      console.error('Failed to remove member:', err)
    } finally {
      setActionLoading(null)
    }
  }, [refetchProjects])

  const handleAddMilestone = useCallback(async () => {
    if (!milestoneForm.projectId || !milestoneForm.title) return
    setSubmitting(true)
    try {
      await apiPost('/api/projects/milestones', {
        projectId: milestoneForm.projectId,
        title: milestoneForm.title,
        description: milestoneForm.description || undefined,
        dueDate: milestoneForm.dueDate || undefined,
      })
      setAddMilestoneDialogOpen(false)
      setMilestoneForm({ projectId: '', title: '', description: '', dueDate: '' })
      refetchProjects()
    } catch (err) {
      console.error('Failed to add milestone:', err)
    } finally {
      setSubmitting(false)
    }
  }, [milestoneForm, refetchProjects])

  const handleCompleteMilestone = useCallback(async (milestoneId: string) => {
    setActionLoading(milestoneId)
    try {
      await apiPatch('/api/projects/milestones', { id: milestoneId, status: 'completed' })
      refetchProjects()
    } catch (err) {
      console.error('Failed to complete milestone:', err)
    } finally {
      setActionLoading(null)
    }
  }, [refetchProjects])

  const handleDeleteMilestone = useCallback(async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return
    setActionLoading(milestoneId)
    try {
      await apiDelete(`/api/projects/milestones?id=${milestoneId}`)
      refetchProjects()
    } catch (err) {
      console.error('Failed to delete milestone:', err)
    } finally {
      setActionLoading(null)
    }
  }, [refetchProjects])

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getEmployeeName = (emp: Employee) => `${emp.firstName} ${emp.lastName}`.trim()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Project Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage projects, team assignments, and track milestones
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportProjectReport(projects.map((p) => ({
              name: p.name,
              status: p.status,
              priority: p.priority,
              startDate: p.startDate || '',
              endDate: p.endDate || '',
              progress: p.progress,
              budget: p.budget || 0,
              memberCount: p.members.length,
              milestoneCount: p.milestones.length,
            })))} disabled={projects.length === 0}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-desc">Description</Label>
                  <Textarea
                    id="project-desc"
                    placeholder="Describe the project..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={projectForm.status} onValueChange={(v) => setProjectForm((f) => ({ ...f, status: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select value={projectForm.priority} onValueChange={(v) => setProjectForm((f) => ({ ...f, priority: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-start">Start Date</Label>
                    <Input
                      id="project-start"
                      type="date"
                      value={projectForm.startDate}
                      onChange={(e) => setProjectForm((f) => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-end">End Date</Label>
                    <Input
                      id="project-end"
                      type="date"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm((f) => ({ ...f, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-budget">Budget</Label>
                  <Input
                    id="project-budget"
                    type="number"
                    placeholder="Enter budget amount"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm((f) => ({ ...f, budget: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleCreateProject}
                  disabled={submitting || !projectForm.name}
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {projectsLoading ? (
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
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">Total Projects</p>
                      <p className="text-2xl font-bold sm:text-3xl">{totalProjects}</p>
                    </div>
                    <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-950">
                      <FolderKanban className="h-5 w-5 text-sky-700 dark:text-sky-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-sky-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">Active Projects</p>
                      <p className="text-2xl font-bold sm:text-3xl">{activeProjects}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950">
                      <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">Completed</p>
                      <p className="text-2xl font-bold sm:text-3xl">{completedProjects}</p>
                    </div>
                    <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-950">
                      <Flag className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-teal-500 to-transparent" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium sm:text-sm">On Hold</p>
                      <p className="text-2xl font-bold sm:text-3xl">{onHoldProjects}</p>
                    </div>
                    <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950">
                      <Clock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
              </Card>
            </>
          )}
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {projectsError && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Failed to load projects. Please try again.</span>
                <Button size="sm" variant="outline" onClick={refetchProjects} className="ml-auto">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="w-full flex-wrap sm:w-auto">
            <TabsTrigger value="projects" className="gap-1.5">
              <FolderKanban className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="gap-1.5">
              <Flag className="h-4 w-4" />
              <span className="hidden sm:inline">Milestones</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════ PROJECTS TAB ═══════════════════════ */}
          <TabsContent value="projects" className="space-y-4">
            {projectsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No Projects Found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'Create your first project to get started.'}
                  </p>
                  {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
                    <Button
                      className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const isExpanded = expandedProject === project.id
                  const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length
                  const totalMilestones = project.milestones.length

                  return (
                    <Card
                      key={project.id}
                      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
                        isExpanded ? 'ring-2 ring-emerald-500/30' : ''
                      }`}
                    >
                      <CardContent className="p-4 sm:p-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-sm truncate"
                              onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                            >
                              {project.name}
                            </h3>
                            {project.description && (
                              <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                              disabled={actionLoading === project.id}
                            >
                              {actionLoading === project.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getStatusBadge(project.status)}
                          {getPriorityBadge(project.priority)}
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(project.progress)}%</span>
                          </div>
                          <Progress
                            value={project.progress}
                            className={`h-2 ${getProgressColor(project.progress)}`}
                          />
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {project.startDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(project.startDate)}</span>
                            </div>
                          )}
                          {project.endDate && (
                            <div className="flex items-center gap-1">
                              <span>→</span>
                              <span>{formatDate(project.endDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Members & Milestones Row */}
                        <div className="flex items-center justify-between pt-1 border-t">
                          <div className="flex items-center gap-2">
                            {/* Member Avatars */}
                            <div className="flex -space-x-1.5">
                              {project.members.slice(0, 4).map((m) => (
                                                <div
                                                  key={m.id}
                                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-semibold text-emerald-700 ring-2 ring-background dark:bg-emerald-950 dark:text-emerald-400"
                                                  title={getEmployeeName(m.employee)}
                                                >
                                                  {m.employee.firstName?.[0]}{m.employee.lastName?.[0]}
                                                </div>
                                              ))}
                              {project.members.length > 4 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[9px] font-medium ring-2 ring-background">
                                  +{project.members.length - 4}
                                </div>
                              )}
                              {project.members.length === 0 && (
                                <span className="text-[10px] text-muted-foreground">No members</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Flag className="h-3 w-3" />
                            <span>{completedMilestones}/{totalMilestones}</span>
                          </div>
                        </div>

                        {/* Inline Status Edit */}
                        {editStatusProject === project.id ? (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Select
                              defaultValue={project.status}
                              onValueChange={(v) => handleUpdateProjectStatus(project.id, v)}
                            >
                              <SelectTrigger size="sm" className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => setEditStatusProject(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground px-0"
                              onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                            >
                              {isExpanded ? 'Less' : 'Details'}
                              <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground px-0"
                              onClick={() => setEditStatusProject(project.id)}
                            >
                              <Edit className="h-3 w-3" />
                              Status
                            </Button>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="space-y-3 pt-2 border-t">
                            {project.budget !== null && project.budget !== undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Budget</span>
                                <span className="font-medium">
                                  ₹{project.budget.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                            {project.description && (
                              <div className="text-xs text-muted-foreground">
                                <p className="line-clamp-3">{project.description}</p>
                              </div>
                            )}
                            {project.members.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Team</p>
                                {project.members.map((m) => (
                                  <div key={m.id} className="flex items-center justify-between text-xs">
                                    <span>{getEmployeeName(m.employee)}</span>
                                    {getRoleBadge(m.role)}
                                  </div>
                                ))}
                              </div>
                            )}
                            {project.milestones.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Milestones</p>
                                {project.milestones.map((ms) => (
                                  <div key={ms.id} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1.5">
                                      {ms.status === 'completed' ? (
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                      ) : ms.status === 'overdue' ? (
                                        <AlertTriangle className="h-3 w-3 text-red-500" />
                                      ) : (
                                        <Clock className="h-3 w-3 text-amber-500" />
                                      )}
                                      {ms.title}
                                    </span>
                                    <span className="text-muted-foreground">{formatDate(ms.dueDate)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════ MEMBERS TAB ═══════════════════════ */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Project Members</h3>
              <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Project Member</DialogTitle>
                    <DialogDescription>
                      Assign an employee to a project with a specific role.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Project *</Label>
                      <Select value={memberForm.projectId} onValueChange={(v) => setMemberForm((f) => ({ ...f, projectId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Employee *</Label>
                      <Select value={memberForm.employeeId} onValueChange={(v) => setMemberForm((f) => ({ ...f, employeeId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {getEmployeeName(e)} {e.designation ? `(${e.designation})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Role</Label>
                      <Select value={memberForm.role} onValueChange={(v) => setMemberForm((f) => ({ ...f, role: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleAddMember}
                      disabled={submitting || !memberForm.projectId || !memberForm.employeeId}
                    >
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectsLoading ? (
                        <TableSkeleton rows={5} cols={4} />
                      ) : allMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                            <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                            No project members yet. Add members to a project to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        allMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  {member.employee.firstName?.[0]}{member.employee.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{getEmployeeName(member.employee)}</p>
                                  <p className="text-xs text-muted-foreground">{member.employee.designation || member.employee.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{member.project?.name || '—'}</TableCell>
                            <TableCell>{getRoleBadge(member.role)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Select
                                  onValueChange={(v) => handleUpdateMemberRole(member.id, v)}
                                  disabled={actionLoading === member.id}
                                >
                                  <SelectTrigger size="sm" className="h-7 w-[90px] text-xs">
                                    <SelectValue placeholder="Change" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={actionLoading === member.id}
                                >
                                  {actionLoading === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════ MILESTONES TAB ═══════════════════════ */}
          <TabsContent value="milestones" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Project Milestones</h3>
              <Dialog open={addMilestoneDialogOpen} onOpenChange={setAddMilestoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Milestone</DialogTitle>
                    <DialogDescription>
                      Create a new milestone for a project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Project *</Label>
                      <Select value={milestoneForm.projectId} onValueChange={(v) => setMilestoneForm((f) => ({ ...f, projectId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="milestone-title">Title *</Label>
                      <Input
                        id="milestone-title"
                        placeholder="Enter milestone title"
                        value={milestoneForm.title}
                        onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="milestone-desc">Description</Label>
                      <Textarea
                        id="milestone-desc"
                        placeholder="Describe this milestone..."
                        value={milestoneForm.description}
                        onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="milestone-due">Due Date</Label>
                      <Input
                        id="milestone-due"
                        type="date"
                        value={milestoneForm.dueDate}
                        onChange={(e) => setMilestoneForm((f) => ({ ...f, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddMilestoneDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleAddMilestone}
                      disabled={submitting || !milestoneForm.projectId || !milestoneForm.title}
                    >
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add Milestone
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {projectsLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                      <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="h-10 w-full animate-pulse rounded bg-muted" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : Object.keys(milestonesByProject).length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Flag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No Milestones Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add milestones to your projects to track progress and deadlines.
                  </p>
                  <Button
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setAddMilestoneDialogOpen(true)}
                    disabled={projects.length === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(milestonesByProject).map(([projectId, group]) => (
                  <Card key={projectId}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        {group.projectName}
                        <Badge variant="secondary" className="text-[10px]">
                          {group.milestones.filter((m) => m.status === 'completed').length}/{group.milestones.length} completed
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-2">
                        {group.milestones.map((milestone, idx) => (
                          <div
                            key={milestone.id}
                            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                          >
                            {/* Timeline indicator */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                                  milestone.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                    : milestone.status === 'overdue'
                                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                                }`}
                              >
                                {milestone.status === 'completed' ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : milestone.status === 'overdue' ? (
                                  <AlertTriangle className="h-4 w-4" />
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                              </div>
                              {idx < group.milestones.length - 1 && (
                                <div className="w-px h-4 bg-border mt-1" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{milestone.title}</p>
                                {getMilestoneStatusBadge(milestone.status)}
                              </div>
                              {milestone.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {milestone.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {milestone.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {formatDate(milestone.dueDate)}
                                  </span>
                                )}
                                {milestone.completedDate && (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Completed: {formatDate(milestone.completedDate)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {milestone.status !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                  onClick={() => handleCompleteMilestone(milestone.id)}
                                  disabled={actionLoading === milestone.id}
                                >
                                  {actionLoading === milestone.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                  Complete
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteMilestone(milestone.id)}
                                disabled={actionLoading === milestone.id}
                              >
                                {actionLoading === milestone.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
