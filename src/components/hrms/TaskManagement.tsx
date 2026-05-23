'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ListTodo,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Trash2,
  Eye,
  Send,
  Loader2,
  X,
  Image as ImageIcon,
  LayoutGrid,
  LayoutList,
  Users,
  CalendarDays,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskEmployee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  email?: string
  department?: string | null
  designation?: string | null
  avatar?: string | null
}

interface TaskAssignment {
  id: string
  taskId: string
  employeeId: string
  status: string
  completedAt: string | null
  employee: TaskEmployee
  createdAt: string
  updatedAt: string
}

interface TaskComment {
  id: string
  taskId: string
  employeeId: string
  content: string
  isHr: boolean
  employee: TaskEmployee
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  companyId: string | null
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: string | null
  imageUrl: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  assignments: TaskAssignment[]
  comments: TaskComment[]
}

interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  department: string | null
  designation: string | null
  avatar: string | null
  status: string
}

interface EmployeesResponse {
  employees: Employee[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CommentsResponse {
  comments: TaskComment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'finished') return false
  return new Date(dueDate) < new Date()
}

function daysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null
  const diff = new Date(dueDate).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Badge Components ─────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string; icon?: React.ComponentType<{ className?: string }> }> = {
    urgent: {
      label: 'Urgent',
      className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
      icon: AlertTriangle,
    },
    high: {
      label: 'High',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
    medium: {
      label: 'Medium',
      className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
    },
    low: {
      label: 'Low',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    },
  }
  const c = config[priority] || config.medium
  const Icon = c.icon
  return (
    <Badge variant="secondary" className={`gap-1 text-[10px] font-medium ${c.className}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {c.label}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
    not_started: {
      label: 'Not Started',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      icon: Clock,
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      icon: Loader2,
    },
    finished: {
      label: 'Finished',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
      icon: CheckCircle2,
    },
  }
  const c = config[status] || config.not_started
  const Icon = c.icon
  return (
    <Badge variant="secondary" className={`gap-1 text-[10px] font-medium ${c.className}`}>
      <Icon className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
      {c.label}
    </Badge>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
}

function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TaskManagement() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const currentEmployeeId = (session?.user as any)?.employeeId || ''

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Create task dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    imageUrl: '',
    assignedEmployeeIds: [] as string[],
  })

  // Task detail dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Comments
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Assignment status update
  const [updatingAssignment, setUpdatingAssignment] = useState<string | null>(null)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── API Hooks ──────────────────────────────────────────────────────────────

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useApi<TasksResponse>({
    baseUrl: '/api/tasks',
    params: {
      page: 1,
      limit: 100,
    },
  })

  const {
    data: employeesData,
  } = useApi<EmployeesResponse>({
    baseUrl: '/api/employees',
    params: { limit: 500, status: 'active' },
  })

  const tasks = tasksData?.tasks ?? []
  const employees = employeesData?.employees ?? []

  // ── Computed: Filtered Tasks ───────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    let result = tasks

    // Tab filter
    if (activeTab === 'my') {
      result = result.filter((t) =>
        t.assignments.some((a) => a.employeeId === currentEmployeeId)
      )
    }

    // Priority filter
    if (filterPriority !== 'all') {
      result = result.filter((t) => t.priority === filterPriority)
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.assignments.some(
            (a) =>
              `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase().includes(q)
          )
      )
    }

    return result
  }, [tasks, activeTab, filterPriority, filterStatus, searchQuery, currentEmployeeId])

  // ── Computed: Stats ────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = tasks.length
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length
    const completed = tasks.filter((t) => t.status === 'finished').length
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length
    return { total, inProgress, completed, overdue }
  }, [tasks])

  // ── Computed: Board View Data ──────────────────────────────────────────────

  const boardColumns = useMemo(() => {
    const source = activeTab === 'my'
      ? filteredTasks
      : filteredTasks

    return {
      not_started: source.filter((t) => t.status === 'not_started'),
      in_progress: source.filter((t) => t.status === 'in_progress'),
      finished: source.filter((t) => t.status === 'finished'),
    }
  }, [filteredTasks, activeTab])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateDialogChange = useCallback((open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      setCreateForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        imageUrl: '',
        assignedEmployeeIds: [],
      })
    }
  }, [])

  async function handleCreateTask() {
    if (!createForm.title.trim()) {
      toast({ title: 'Validation Error', description: 'Task title is required.', variant: 'destructive' })
      return
    }
    setCreating(true)
    try {
      await apiPost('/api/tasks', {
        title: createForm.title,
        description: createForm.description || null,
        priority: createForm.priority,
        dueDate: createForm.dueDate || null,
        imageUrl: createForm.imageUrl || null,
        assignedEmployeeIds: createForm.assignedEmployeeIds,
        createdBy: currentEmployeeId || null,
      })
      toast({
        title: 'Task Created',
        description: `"${createForm.title}" has been created successfully.`,
      })
      setCreateOpen(false)
      refetchTasks()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create task',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  function handleViewTask(task: Task) {
    setSelectedTask(task)
    setDetailOpen(true)
    setCommentText('')
  }

  async function handleUpdateAssignmentStatus(assignmentId: string, newStatus: string) {
    setUpdatingAssignment(assignmentId)
    try {
      await apiPatch('/api/tasks/assignments', {
        id: assignmentId,
        status: newStatus,
      })
      toast({
        title: 'Status Updated',
        description: `Assignment status changed to ${newStatus.replace('_', ' ')}.`,
      })
      // Refetch tasks to get updated data including auto-completed tasks
      refetchTasks()
      // Update selected task if detail dialog is open
      if (selectedTask) {
        const updatedAssignments = selectedTask.assignments.map((a) =>
          a.id === assignmentId ? { ...a, status: newStatus } : a
        )
        // Check if all assignments are finished
        const allFinished = updatedAssignments.every((a) => a.status === 'finished')
        setSelectedTask({
          ...selectedTask,
          assignments: updatedAssignments,
          status: allFinished && updatedAssignments.length > 0 ? 'finished' : selectedTask.status,
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setUpdatingAssignment(null)
    }
  }

  async function handleAddComment() {
    if (!selectedTask || !commentText.trim()) return
    setSubmittingComment(true)
    try {
      const newComment = await apiPost('/api/tasks/comments', {
        taskId: selectedTask.id,
        employeeId: currentEmployeeId,
        content: commentText.trim(),
        isHr: true, // HR badge for HR users
      })
      // Update the selected task's comments
      setSelectedTask((prev) =>
        prev
          ? { ...prev, comments: [...prev.comments, newComment] }
          : prev
      )
      setCommentText('')
      toast({
        title: 'Comment Added',
        description: 'Your comment has been posted.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add comment',
        variant: 'destructive',
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleDeleteTask() {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await apiDelete(`/api/tasks/${deleteConfirm}`)
      toast({
        title: 'Task Deleted',
        description: 'The task has been removed.',
        variant: 'destructive',
      })
      setDeleteConfirm(null)
      refetchTasks()
      if (selectedTask?.id === deleteConfirm) {
        setDetailOpen(false)
        setSelectedTask(null)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete task',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  function toggleEmployeeSelection(empId: string) {
    setCreateForm((prev) => ({
      ...prev,
      assignedEmployeeIds: prev.assignedEmployeeIds.includes(empId)
        ? prev.assignedEmployeeIds.filter((id) => id !== empId)
        : [...prev.assignedEmployeeIds, empId],
    }))
  }

  // ── Render: Assignment Progress ────────────────────────────────────────────

  function renderAssignmentProgress(task: Task) {
    const total = task.assignments.length
    if (total === 0) return <span className="text-xs text-muted-foreground">Unassigned</span>
    const finished = task.assignments.filter((a) => a.status === 'finished').length
    const pct = Math.round((finished / total) * 100)
    return (
      <div className="flex items-center gap-2 min-w-[120px]">
        <Progress value={pct} className="h-1.5 flex-1" />
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
          {finished}/{total}
        </span>
      </div>
    )
  }

  // ── Render: Assignee Avatars ───────────────────────────────────────────────

  function renderAssigneeAvatars(task: Task, maxShow = 3) {
    const assignments = task.assignments
    if (assignments.length === 0) {
      return <span className="text-xs text-muted-foreground">Unassigned</span>
    }
    const shown = assignments.slice(0, maxShow)
    const remaining = assignments.length - maxShow
    return (
      <div className="flex items-center -space-x-2">
        {shown.map((a) => (
          <Avatar key={a.id} className="h-7 w-7 border-2 border-background">
            <AvatarImage src={a.employee.avatar || undefined} />
            <AvatarFallback className="bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {a.employee.firstName[0]}{a.employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
        ))}
        {remaining > 0 && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
            +{remaining}
          </div>
        )}
      </div>
    )
  }

  // ── Render: Kanban Card ────────────────────────────────────────────────────

  function renderKanbanCard(task: Task) {
    const overdue = isOverdue(task.dueDate, task.status)
    const days = daysUntilDue(task.dueDate)

    return (
      <Card
        key={task.id}
        className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
        onClick={() => handleViewTask(task)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Priority + Image indicator */}
          <div className="flex items-center justify-between">
            <PriorityBadge priority={task.priority} />
            {task.imageUrl && (
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}

          {/* Reference Image */}
          {task.imageUrl && (
            <div className="rounded-md overflow-hidden border">
              <img
                src={task.imageUrl}
                alt="Reference"
                className="w-full h-24 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}

          {/* Assignees */}
          <div className="flex items-center justify-between">
            {renderAssigneeAvatars(task, 4)}
            <span className="text-[11px] text-muted-foreground">
              {task.comments.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="h-3 w-3" />
                  {task.comments.length}
                </span>
              )}
            </span>
          </div>

          {/* Due date + progress */}
          <div className="flex items-center justify-between gap-2">
            {task.dueDate && (
              <span
                className={`text-[11px] flex items-center gap-1 ${
                  overdue
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : days !== null && days <= 3
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
            {renderAssignmentProgress(task)}
          </div>

          {overdue && (
            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 text-[10px]">
              Overdue
            </Badge>
          )}
        </CardContent>
      </Card>
    )
  }

  // ── Render: Detail Dialog ──────────────────────────────────────────────────

  function renderDetailDialog() {
    if (!selectedTask) return null

    const task = selectedTask
    const overdue = isOverdue(task.dueDate, task.status)
    const totalAssignments = task.assignments.length
    const finishedAssignments = task.assignments.filter((a) => a.status === 'finished').length
    const progressPct = totalAssignments > 0 ? Math.round((finishedAssignments / totalAssignments) * 100) : 0

    return (
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <DialogTitle className="text-lg leading-snug">{task.title}</DialogTitle>
                <DialogDescription className="text-xs">
                  Created {formatDateTime(task.createdAt)}
                  {task.dueDate && ` · Due ${formatDate(task.dueDate)}`}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-5 pb-4">
              {/* Overdue warning */}
              {overdue && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This task is overdue. Due date was {formatDate(task.dueDate)}.
                  </p>
                </div>
              )}

              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Description
                  </h4>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {/* Reference Image */}
              {task.imageUrl && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Reference Image
                  </h4>
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={task.imageUrl}
                      alt="Reference"
                      className="w-full max-h-48 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Progress Overview */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Progress
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {finishedAssignments} of {totalAssignments} assignments completed
                    </span>
                    <span className="font-medium">{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Assignments
                </h4>
                {task.assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-3 text-center">
                    No employees assigned to this task.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {task.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={assignment.employee.avatar || undefined} />
                            <AvatarFallback className="bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                              {assignment.employee.firstName[0]}{assignment.employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {assignment.employee.firstName} {assignment.employee.lastName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {assignment.employee.department || assignment.employee.designation || assignment.employee.employeeId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={assignment.status} />
                          {assignment.status !== 'finished' && (
                            <Select
                              value={assignment.status}
                              onValueChange={(value) =>
                                handleUpdateAssignmentStatus(assignment.id, value)
                              }
                              disabled={updatingAssignment === assignment.id}
                            >
                              <SelectTrigger className="h-7 w-[130px] text-[11px]">
                                {updatingAssignment === assignment.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_started">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="finished">Finished</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {assignment.completedAt && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              Done {formatDate(assignment.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Comments ({task.comments.length})
                </h4>

                {/* Comment list */}
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar mb-3">
                  {task.comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-3 text-center">
                      No comments yet. Start the discussion!
                    </p>
                  ) : (
                    task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarImage src={comment.employee.avatar || undefined} />
                          <AvatarFallback className="bg-emerald-100 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            {comment.employee.firstName[0]}{comment.employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">
                              {comment.employee.firstName} {comment.employee.lastName}
                            </span>
                            {comment.isHr && (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[9px] px-1.5 py-0 h-4"
                              >
                                HR
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[40px] resize-none text-sm"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 shrink-0 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                    onClick={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                  >
                    {submittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Press Ctrl+Enter to send. Comments will show your HR badge.
                </p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              onClick={() => {
                setDetailOpen(false)
                setDeleteConfirm(task.id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isLoading = tasksLoading

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <ListTodo className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Task Management
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  {stats.total}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {stats.inProgress} in progress · {stats.completed} completed · {stats.overdue} overdue
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 sm:w-[240px]"
              />
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* ─── Stats Cards ──────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <ListTodo className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-amber-500 to-transparent" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Overdue</p>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-red-500 to-transparent" />
          </Card>
        </div>

        {/* ─── Filter Bar ─────────────────────────────────────────── */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">
                Filters:
              </span>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-[150px]" size="sm">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px]" size="sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filterPriority !== 'all' || filterStatus !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => {
                    setFilterPriority('all')
                    setFilterStatus('all')
                  }}
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Tabs ─────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">All Tasks</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="my" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">My Tasks</span>
              <span className="sm:hidden">Mine</span>
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Board View</span>
              <span className="sm:hidden">Board</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════
              TAB: All Tasks (Table View)
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <LoadingSpinner message="Loading tasks..." />
                ) : tasksError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{tasksError}</p>
                    <Button variant="outline" size="sm" onClick={refetchTasks}>
                      Retry
                    </Button>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="py-12 text-center">
                    <ListTodo className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No tasks found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {searchQuery || filterPriority !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Create a new task to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Title</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">Assignees</TableHead>
                          <TableHead className="hidden lg:table-cell">Progress</TableHead>
                          <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks.map((task) => {
                          const overdue = isOverdue(task.dueDate, task.status)
                          const days = daysUntilDue(task.dueDate)
                          return (
                            <TableRow key={task.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                    <ListTodo className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium max-w-[200px]">
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-muted-foreground truncate text-[11px] max-w-[200px]">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <PriorityBadge priority={task.priority} />
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <StatusBadge status={task.status} />
                                  {overdue && (
                                    <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                                      Overdue
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {renderAssigneeAvatars(task)}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {renderAssignmentProgress(task)}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span
                                  className={`text-sm ${
                                    overdue
                                      ? 'text-red-600 dark:text-red-400 font-medium'
                                      : days !== null && days <= 3 && days >= 0
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-muted-foreground'
                                  }`}
                                >
                                  {formatDate(task.dueDate)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                    onClick={() => handleViewTask(task)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => setDeleteConfirm(task.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Table Footer */}
                {!isLoading && !tasksError && filteredTasks.length > 0 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-muted-foreground text-sm">
                      Showing{' '}
                      <span className="font-medium text-foreground">{filteredTasks.length}</span>{' '}
                      of{' '}
                      <span className="font-medium text-foreground">{tasksData?.pagination?.total ?? tasks.length}</span>{' '}
                      tasks
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════
              TAB: My Tasks (Table View - assigned to current user)
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="my" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <LoadingSpinner message="Loading your tasks..." />
                ) : filteredTasks.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No tasks assigned to you</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tasks assigned to you will appear here
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Title</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>My Status</TableHead>
                          <TableHead className="hidden md:table-cell">Task Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks.map((task) => {
                          const myAssignment = task.assignments.find(
                            (a) => a.employeeId === currentEmployeeId
                          )
                          const overdue = isOverdue(task.dueDate, task.status)
                          return (
                            <TableRow key={task.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                    <ListTodo className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium max-w-[200px]">
                                      {task.title}
                                    </p>
                                    {overdue && (
                                      <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                                        Overdue
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <PriorityBadge priority={task.priority} />
                              </TableCell>
                              <TableCell>
                                {myAssignment ? (
                                  <Select
                                    value={myAssignment.status}
                                    onValueChange={(value) =>
                                      handleUpdateAssignmentStatus(myAssignment.id, value)
                                    }
                                    disabled={updatingAssignment === myAssignment.id}
                                  >
                                    <SelectTrigger className="h-7 w-[130px] text-[11px]">
                                      {updatingAssignment === myAssignment.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <SelectValue />
                                      )}
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_started">Not Started</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="finished">Finished</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <StatusBadge status={task.status} />
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(task.dueDate)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                  onClick={() => handleViewTask(task)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════
              TAB: Board View (Kanban)
              ═══════════════════════════════════════════════════════════ */}
          <TabsContent value="board" className="space-y-4">
            {isLoading ? (
              <LoadingSpinner message="Loading board..." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Not Started Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Not Started</h3>
                    <Badge variant="secondary" className="ml-auto text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {boardColumns.not_started.length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {boardColumns.not_started.length === 0 ? (
                      <div className="flex items-center justify-center rounded-lg border border-dashed py-8">
                        <p className="text-xs text-muted-foreground">No tasks</p>
                      </div>
                    ) : (
                      boardColumns.not_started.map((task) => renderKanbanCard(task))
                    )}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-semibold text-muted-foreground">In Progress</h3>
                    <Badge variant="secondary" className="ml-auto text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      {boardColumns.in_progress.length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {boardColumns.in_progress.length === 0 ? (
                      <div className="flex items-center justify-center rounded-lg border border-dashed py-8">
                        <p className="text-xs text-muted-foreground">No tasks</p>
                      </div>
                    ) : (
                      boardColumns.in_progress.map((task) => renderKanbanCard(task))
                    )}
                  </div>
                </div>

                {/* Finished Column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Finished</h3>
                    <Badge variant="secondary" className="ml-auto text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      {boardColumns.finished.length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {boardColumns.finished.length === 0 ? (
                      <div className="flex items-center justify-center rounded-lg border border-dashed py-8">
                        <p className="text-xs text-muted-foreground">No tasks</p>
                      </div>
                    ) : (
                      boardColumns.finished.map((task) => renderKanbanCard(task))
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Create Task Dialog ─────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Create New Task
            </DialogTitle>
            <DialogDescription>
              Create a task and assign it to employees
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="taskTitle">Title *</Label>
              <Input
                id="taskTitle"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="taskDesc">Description</Label>
              <Textarea
                id="taskDesc"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>

            {/* Priority + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={createForm.priority}
                  onValueChange={(v) => setCreateForm((f) => ({ ...f, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskDueDate">Due Date</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="taskImage">Reference Image URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="taskImage"
                  value={createForm.imageUrl}
                  onChange={(e) => setCreateForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.png"
                  className="pl-9"
                />
              </div>
              {createForm.imageUrl && (
                <div className="rounded-md overflow-hidden border mt-1">
                  <img
                    src={createForm.imageUrl}
                    alt="Preview"
                    className="w-full h-24 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Assign Employees */}
            <div className="grid gap-2">
              <Label>Assign Employees</Label>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Click to select/deselect employees for this task
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/30 p-2 space-y-1 custom-scrollbar">
                {employees.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No employees found
                  </p>
                ) : (
                  employees
                    .filter((e) => e.status === 'active')
                    .map((emp) => {
                      const isSelected = createForm.assignedEmployeeIds.includes(emp.id)
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleEmployeeSelection(emp.id)}
                          className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                            isSelected
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500'
                                : 'border-muted-foreground/40'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={emp.avatar || undefined} />
                            <AvatarFallback className="bg-emerald-100 text-[8px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium text-sm">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="ml-auto text-[11px] text-muted-foreground truncate">
                            {emp.department || emp.designation || ''}
                          </span>
                        </button>
                      )
                    })
                )}
              </div>
              {createForm.assignedEmployeeIds.length > 0 && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {createForm.assignedEmployeeIds.length} employee{createForm.assignedEmployeeIds.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateTask}
              disabled={creating || !createForm.title.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Task Detail Dialog ─────────────────────────────────────── */}
      {renderDetailDialog()}

      {/* ─── Delete Confirmation ────────────────────────────────────── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This will also remove all assignments and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
