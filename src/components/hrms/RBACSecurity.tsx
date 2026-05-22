'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Plus,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  ClipboardList,
  UserCheck,
  Clock,
  Loader2,
} from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useApi, apiPost, apiPatch } from '@/lib/useApi'

// ─── Static constants (schema structure, not data) ────────────────────────
const permissionTypes = ['read', 'write', 'modify', 'delete', 'admin'] as const
type PermissionType = typeof permissionTypes[number]

const modules = ['HR', 'Payroll', 'Attendance', 'Performance', 'Learning', 'Analytics'] as const
type ModuleName = typeof modules[number]

type RoleModulePermissions = Record<ModuleName, Record<PermissionType, boolean>>

// ─── API response types ───────────────────────────────────────────────────
interface ApiUser {
  id: string
  name: string
  email: string
}

interface ApiRole {
  id: string
  name: string
  description: string | null
  permissions: string | null
  level: number
  users: ApiUser[]
  createdAt: string
  updatedAt: string
}

interface RolesApiResponse {
  roles: ApiRole[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ApiAuditEmployee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  avatar: string | null
}

interface ApiAuditLog {
  id: string
  userId: string | null
  employeeId: string | null
  action: string
  module: string
  details: string | null
  ipAddress: string | null
  employee: ApiAuditEmployee | null
  createdAt: string
}

interface AuditApiResponse {
  logs: ApiAuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── UI-facing role type (transformed from API) ───────────────────────────
interface UIRole {
  id: string
  name: string
  description: string
  level: number
  permissions: PermissionType[]
  userCount: number
  modulePermissions: RoleModulePermissions
}

// ─── Permission badge styling ─────────────────────────────────────────────
const permissionStyles: Record<string, string> = {
  read: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  write: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  modify: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  delete: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800',
}

// ─── Action badge styling for audit ───────────────────────────────────────
const actionStyles: Record<string, string> = {
  read: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  create: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
  update: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  modify: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  login: 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400',
  write: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
}

// ─── Level labels ──────────────────────────────────────────────────────────
const levelLabels: Record<number, string> = {
  0: 'L0 — System',
  1: 'L1 — Admin',
  2: 'L2 — Power',
  3: 'L3 — Manager',
  4: 'L4 — Standard',
}

// ─── Data masking state type ──────────────────────────────────────────────
interface MaskingRule {
  label: string
  icon: React.ElementType
  roles: Record<string, boolean>
}

// ─── Compliance breakdown ─────────────────────────────────────────────────
const complianceBreakdown = [
  { label: 'Data Protection', score: 98 },
  { label: 'Access Controls', score: 96 },
  { label: 'Audit Logging', score: 100 },
  { label: 'Encryption', score: 95 },
  { label: 'Policy Compliance', score: 94 },
]

// ─── Approval workflows ───────────────────────────────────────────────────
const approvalWorkflows = [
  {
    id: '1',
    name: 'Leave Approval',
    icon: Clock,
    steps: ['Employee Request', 'Manager Review', 'HR Approval', 'Notification'],
    activeStep: 2,
  },
  {
    id: '2',
    name: 'Expense Approval',
    icon: FileCheck,
    steps: ['Employee Submit', 'Manager Review', 'Finance Review', 'Payment'],
    activeStep: 3,
  },
  {
    id: '3',
    name: 'Promotion Approval',
    icon: UserCheck,
    steps: ['Manager Nomination', 'HR Review', 'Director Approval', 'Board Approval', 'Implementation'],
    activeStep: 4,
  },
]

// ─── Default module permissions (all false) ───────────────────────────────
function getDefaultModulePermissions(): RoleModulePermissions {
  const result = {} as RoleModulePermissions
  for (const mod of modules) {
    result[mod] = {} as Record<PermissionType, boolean>
    for (const perm of permissionTypes) {
      result[mod][perm] = false
    }
  }
  return result
}

// ─── Parse permissions JSON from API ──────────────────────────────────────
function parsePermissions(raw: string | null): { flat: PermissionType[], module: RoleModulePermissions } {
  const defaultMp = getDefaultModulePermissions()

  if (!raw) {
    return { flat: [], module: defaultMp }
  }

  try {
    const parsed = JSON.parse(raw)

    // If it's already a modulePermissions object (Record<ModuleName, Record<PermissionType, boolean>>)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const mp = getDefaultModulePermissions()
      const flatSet = new Set<PermissionType>()

      for (const mod of modules) {
        if (parsed[mod] && typeof parsed[mod] === 'object') {
          for (const perm of permissionTypes) {
            const val = !!parsed[mod][perm]
            mp[mod][perm] = val
            if (val) flatSet.add(perm)
          }
        }
      }

      return { flat: permissionTypes.filter((p) => flatSet.has(p)), module: mp }
    }

    // If it's a flat array like ['read', 'write', 'modify']
    if (Array.isArray(parsed)) {
      const validPerms = parsed.filter((p: string) => permissionTypes.includes(p as PermissionType)) as PermissionType[]
      return { flat: validPerms, module: defaultMp }
    }

    return { flat: [], module: defaultMp }
  } catch {
    return { flat: [], module: defaultMp }
  }
}

// ─── Transform API role to UI role ────────────────────────────────────────
function transformRole(apiRole: ApiRole): UIRole {
  const { flat, module: modulePerms } = parsePermissions(apiRole.permissions)
  return {
    id: apiRole.id,
    name: apiRole.name,
    description: apiRole.description ?? '',
    level: apiRole.level,
    permissions: flat,
    userCount: apiRole.users?.length ?? 0,
    modulePermissions: modulePerms,
  }
}

// ─── Format date for audit display ────────────────────────────────────────
function formatAuditDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  } catch {
    return dateStr
  }
}

// ─── Circular Progress Component ──────────────────────────────────────────
function CircularProgress({ value, size = 140, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{value}%</span>
        <span className="text-xs text-muted-foreground">Compliant</span>
      </div>
    </div>
  )
}

// ─── Step Indicator Component ─────────────────────────────────────────────
function StepIndicator({ steps, activeStep }: { steps: string[]; activeStep: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const isCompleted = index < activeStep
        const isActive = index === activeStep - 1
        return (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`text-[11px] whitespace-nowrap ${
                  isCompleted || isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className={`h-3 w-3 shrink-0 ${index < activeStep - 1 ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="relative overflow-hidden">
      <div className="h-1.5 w-full bg-muted animate-pulse" />
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-12 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-8 w-full rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  )
}

function SkeletonTable() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-8 w-full rounded bg-muted animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded bg-muted animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function RBACSecurity() {
  // ── Roles & Permissions state ─────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<UIRole | null>(null)
  const [editingPermissions, setEditingPermissions] = useState<RoleModulePermissions | null>(null)
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false)
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [creatingRole, setCreatingRole] = useState(false)

  // ── Add Role form state ────────────────────────────────────────────────
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [newRoleLevel, setNewRoleLevel] = useState('4')

  // ── Audit Trails state ────────────────────────────────────────────────
  const [moduleFilter, setModuleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [auditPage, setAuditPage] = useState(1)
  const auditLimit = 8

  // ── Data Security state ───────────────────────────────────────────────
  const [maskingRules, setMaskingRules] = useState<MaskingRule[]>([
    {
      label: 'Salary Information',
      icon: Lock,
      roles: { 'Super Admin': false, 'HR Admin': false, 'Department Manager': true, 'Employee': true },
    },
    {
      label: 'Medical History',
      icon: EyeOff,
      roles: { 'Super Admin': false, 'HR Admin': true, 'Department Manager': true, 'Employee': true },
    },
    {
      label: 'Bank Details',
      icon: Shield,
      roles: { 'Super Admin': false, 'HR Admin': false, 'Department Manager': true, 'Employee': true },
    },
    {
      label: 'Personal Contacts',
      icon: Users,
      roles: { 'Super Admin': false, 'HR Admin': false, 'Department Manager': true, 'Employee': false },
    },
  ])

  // ── API: Fetch roles ──────────────────────────────────────────────────
  const { data: rolesData, loading: rolesLoading, error: rolesError, refetch: refetchRoles } = useApi<RolesApiResponse>({
    baseUrl: '/api/roles',
    params: { page: 1, limit: 50 },
  })

  // ── API: Fetch audit logs ─────────────────────────────────────────────
  const { data: auditData, loading: auditLoading, error: auditError, refetch: refetchAudit } = useApi<AuditApiResponse>({
    baseUrl: '/api/audit',
    params: {
      page: auditPage,
      limit: auditLimit,
      action: actionFilter !== 'all' ? actionFilter : undefined,
      module: moduleFilter !== 'all' ? moduleFilter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  })

  // ── Transform API data ────────────────────────────────────────────────
  const roles: UIRole[] = useMemo(() => {
    if (!rolesData?.roles) return []
    return rolesData.roles.map(transformRole)
  }, [rolesData])

  const auditLogs = auditData?.logs ?? []
  const auditPagination = auditData?.pagination

  // ── Client-side search filter on audit logs ───────────────────────────
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return auditLogs
    const q = searchQuery.toLowerCase()
    return auditLogs.filter((log) => {
      const userName = log.employee
        ? `${log.employee.firstName} ${log.employee.lastName}`.toLowerCase()
        : ''
      return userName.includes(q)
    })
  }, [auditLogs, searchQuery])

  const auditTotalPages = auditPagination?.totalPages ?? 1
  const auditTotal = auditPagination?.total ?? 0

  // ── Unique modules and actions for filter dropdowns ────────────────────
  const uniqueModules = useMemo(() => {
    const modSet = new Set<string>()
    if (auditData?.logs) {
      auditData.logs.forEach((l) => modSet.add(l.module))
    }
    return [...modSet]
  }, [auditData])

  const uniqueActions = useMemo(() => {
    const actSet = new Set<string>()
    if (auditData?.logs) {
      auditData.logs.forEach((l) => actSet.add(l.action))
    }
    return [...actSet]
  }, [auditData])

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleEditPermissions = useCallback((role: UIRole) => {
    setEditingRole(role)
    setEditingPermissions(structuredClone(role.modulePermissions))
    setEditDialogOpen(true)
  }, [])

  const handleTogglePermission = useCallback((module: ModuleName, perm: PermissionType) => {
    setEditingPermissions((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [module]: {
          ...prev[module],
          [perm]: !prev[module][perm],
        },
      }
    })
  }, [])

  const handleSavePermissions = useCallback(async () => {
    if (!editingRole || !editingPermissions) return
    setSavingPermissions(true)
    try {
      await apiPatch('/api/roles', {
        id: editingRole.id,
        permissions: editingPermissions,
      })
      setEditDialogOpen(false)
      refetchRoles()
      refetchAudit()
    } catch (err) {
      console.error('Failed to save permissions:', err)
    } finally {
      setSavingPermissions(false)
    }
  }, [editingRole, editingPermissions, refetchRoles, refetchAudit])

  const handleCreateRole = useCallback(async () => {
    if (!newRoleName.trim()) return
    setCreatingRole(true)
    try {
      await apiPost('/api/roles', {
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
        level: parseInt(newRoleLevel),
        permissions: getDefaultModulePermissions(),
      })
      setAddRoleDialogOpen(false)
      setNewRoleName('')
      setNewRoleDescription('')
      setNewRoleLevel('4')
      refetchRoles()
      refetchAudit()
    } catch (err) {
      console.error('Failed to create role:', err)
    } finally {
      setCreatingRole(false)
    }
  }, [newRoleName, newRoleDescription, newRoleLevel, refetchRoles, refetchAudit])

  const handleMaskingToggle = useCallback((ruleIndex: number, role: string) => {
    setMaskingRules((prev) => {
      const next = [...prev]
      next[ruleIndex] = {
        ...next[ruleIndex],
        roles: {
          ...next[ruleIndex].roles,
          [role]: !next[ruleIndex].roles[role],
        },
      }
      return next
    })
  }, [])

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              RBAC &amp; Security
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage roles, audit trails, and data security policies
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="roles" className="gap-1.5">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Roles &amp; Permissions</span>
              <span className="sm:hidden">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Trails</span>
              <span className="sm:hidden">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Data Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1 — Roles & Permissions
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="roles">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {rolesLoading ? (
                  <span className="inline-block h-4 w-48 rounded bg-muted animate-pulse" />
                ) : rolesError ? (
                  <span className="text-red-500">Failed to load roles</span>
                ) : (
                  <>
                    {roles.length} roles configured · {roles.reduce((sum, r) => sum + r.userCount, 0)} total users
                  </>
                )}
              </p>
              <Button
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setAddRoleDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Role
              </Button>
            </div>

            {rolesLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : rolesError ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShieldAlert className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">Failed to load roles. Please try again.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={refetchRoles}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : roles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">No roles configured yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {roles.map((role) => {
                  const levelColor =
                    role.level === 0
                      ? 'from-emerald-500 to-emerald-600'
                      : role.level === 1
                        ? 'from-teal-500 to-teal-600'
                        : role.level === 2
                          ? 'from-amber-500 to-amber-600'
                          : role.level === 3
                            ? 'from-orange-500 to-orange-600'
                            : 'from-gray-400 to-gray-500'

                  return (
                    <Card key={role.id} className="relative overflow-hidden transition-shadow hover:shadow-md">
                      {/* Top accent bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${levelColor}`} />
                      <CardContent className="p-4 sm:p-5">
                        {/* Role header */}
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">{role.name}</h3>
                            <p className="text-muted-foreground text-xs mt-0.5">{role.description}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-[10px] font-mono">
                            {levelLabels[role.level] ?? `L${role.level}`}
                          </Badge>
                        </div>

                        {/* User count */}
                        <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{role.userCount} {role.userCount === 1 ? 'user' : 'users'}</span>
                        </div>

                        {/* Permission badges */}
                        <div className="mb-4 flex flex-wrap gap-1.5">
                          {permissionTypes.map((perm) => {
                            const isActive = role.permissions.includes(perm)
                            return (
                              <Badge
                                key={perm}
                                variant="outline"
                                className={`text-[10px] capitalize transition-colors ${
                                  isActive
                                    ? permissionStyles[perm]
                                    : 'bg-muted/50 text-muted-foreground/50 border-muted/50 line-through'
                                }`}
                              >
                                {perm}
                              </Badge>
                            )
                          })}
                        </div>

                        {/* Edit button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 hover:border-emerald-300 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                          onClick={() => handleEditPermissions(role)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Permissions
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2 — Audit Trails
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="audit">
            {/* Filter bar */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                  {/* Module filter */}
                  <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setAuditPage(1) }}>
                    <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                      <SelectValue placeholder="Module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {uniqueModules.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Action filter */}
                  <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setAuditPage(1) }}>
                    <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a.charAt(0).toUpperCase() + a.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date range */}
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setAuditPage(1) }}
                    className="w-full sm:w-[150px] h-8 text-sm"
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setAuditPage(1) }}
                    className="w-full sm:w-[150px] h-8 text-sm"
                    placeholder="End date"
                  />

                  {/* User search */}
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search user..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value) }}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit table */}
            {auditLoading ? (
              <SkeletonTable />
            ) : auditError ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShieldAlert className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">Failed to load audit logs.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={refetchAudit}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[160px]">Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="hidden md:table-cell">Details</TableHead>
                        <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No audit logs found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => {
                          const userName = log.employee
                            ? `${log.employee.firstName} ${log.employee.lastName}`
                            : 'System'
                          return (
                            <TableRow key={log.id}>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {formatAuditDate(log.createdAt)}
                              </TableCell>
                              <TableCell className="font-medium text-sm">{userName}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={`capitalize text-[10px] ${actionStyles[log.action] ?? 'bg-gray-100 text-gray-700'}`}
                                >
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize text-[10px]">
                                  {log.module}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[250px] truncate">
                                {log.details}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                                {log.ipAddress ?? '—'}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      {auditTotal > 0 ? (
                        <>
                          Showing {(auditPage - 1) * auditLimit + 1}–
                          {Math.min(auditPage * auditLimit, auditTotal)} of{' '}
                          {auditTotal} logs
                        </>
                      ) : (
                        'No logs'
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      {Array.from({ length: Math.min(auditTotalPages, 5) }, (_, i) => {
                        // Show pages around current page
                        let page: number
                        if (auditTotalPages <= 5) {
                          page = i + 1
                        } else if (auditPage <= 3) {
                          page = i + 1
                        } else if (auditPage >= auditTotalPages - 2) {
                          page = auditTotalPages - 4 + i
                        } else {
                          page = auditPage - 2 + i
                        }
                        return (
                          <Button
                            key={page}
                            variant={page === auditPage ? 'default' : 'outline'}
                            size="icon"
                            className={`h-7 w-7 text-xs ${
                              page === auditPage
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : ''
                            }`}
                            onClick={() => setAuditPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                        disabled={auditPage === auditTotalPages}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3 — Data Security
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* ── Data Masking ────────────────────────────────────────── */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-base font-semibold">Data Masking Rules</CardTitle>
                  </div>
                  <CardDescription>
                    Configure which sensitive data fields are masked per role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Table header */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[520px]">
                      <div className="grid grid-cols-[1fr_repeat(4,90px)] gap-2 mb-2 px-2">
                        <div className="text-xs font-medium text-muted-foreground">Data Field</div>
                        {maskingRules[0] && Object.keys(maskingRules[0].roles).map((role) => (
                          <div key={role} className="text-xs font-medium text-muted-foreground text-center truncate" title={role}>
                            {role.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {maskingRules.map((rule, ruleIdx) => {
                          const Icon = rule.icon
                          return (
                            <div
                              key={rule.label}
                              className="grid grid-cols-[1fr_repeat(4,90px)] gap-2 items-center rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="text-sm font-medium">{rule.label}</span>
                              </div>
                              {Object.entries(rule.roles).map(([role, masked]) => (
                                <div key={role} className="flex justify-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <Switch
                                      checked={masked}
                                      onCheckedChange={() => handleMaskingToggle(ruleIdx, role)}
                                      className="data-[state=checked]:bg-emerald-600"
                                    />
                                    <span className="text-[9px] text-muted-foreground">
                                      {masked ? 'Masked' : 'Visible'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Encryption Status ───────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-base font-semibold">Encryption Status</CardTitle>
                  </div>
                  <CardDescription>
                    Current encryption status for data categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: 'At Rest', algorithm: 'AES-256-GCM', status: 'Active', lastRotated: '2024-01-10' },
                      { category: 'In Transit', algorithm: 'TLS 1.3', status: 'Active', lastRotated: '2024-01-15' },
                      { category: 'Backup', algorithm: 'AES-256-CBC', status: 'Active', lastRotated: '2024-01-08' },
                    ].map((enc) => (
                      <div
                        key={enc.category}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{enc.category}</p>
                            <p className="text-xs text-muted-foreground">{enc.algorithm}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                          >
                            {enc.status}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Rotated {enc.lastRotated}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Compliance Score ────────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-base font-semibold">Compliance Score</CardTitle>
                  </div>
                  <CardDescription>
                    Overall security compliance rating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <CircularProgress value={97} />
                    <div className="w-full space-y-2">
                      {complianceBreakdown.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-8 text-right">{item.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ── Approval Workflows ──────────────────────────────────── */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-base font-semibold">Approval Workflows</CardTitle>
                  </div>
                  <CardDescription>
                    Configured multi-step approval workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvalWorkflows.map((workflow) => {
                      const Icon = workflow.icon
                      return (
                        <div
                          key={workflow.id}
                          className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                              <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{workflow.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Step {workflow.activeStep} of {workflow.steps.length} ·{' '}
                                {workflow.steps[workflow.activeStep - 1]}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                            >
                              Active
                            </Badge>
                          </div>
                          <StepIndicator steps={workflow.steps} activeStep={workflow.activeStep} />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DIALOG — Edit Permissions
          ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Edit Permissions — {editingRole?.name}
            </DialogTitle>
            <DialogDescription>
              Toggle module-level permissions for this role. Changes are previewed here.
            </DialogDescription>
          </DialogHeader>

          {editingPermissions && (
            <div className="space-y-4 py-2">
              {/* Permission table header */}
              <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 px-3">
                <div className="text-xs font-medium text-muted-foreground">Module</div>
                {permissionTypes.map((perm) => (
                  <div key={perm} className="text-xs font-medium text-muted-foreground text-center capitalize">
                    {perm}
                  </div>
                ))}
              </div>

              {/* Permission rows per module */}
              {modules.map((mod) => (
                <div
                  key={mod}
                  className="grid grid-cols-[100px_repeat(5,1fr)] gap-2 items-center rounded-lg border px-3 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium">{mod}</span>
                  {permissionTypes.map((perm) => (
                    <div key={`${mod}-${perm}`} className="flex justify-center">
                      <Switch
                        checked={editingPermissions[mod][perm]}
                        onCheckedChange={() => handleTogglePermission(mod, perm)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={savingPermissions}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSavePermissions}
              disabled={savingPermissions}
            >
              {savingPermissions ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Permissions'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════
          DIALOG — Add Role
          ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Add New Role
            </DialogTitle>
            <DialogDescription>
              Define a new role with custom permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Name</label>
              <Input
                placeholder="e.g. Team Lead"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Brief description of the role"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Level</label>
              <Select value={newRoleLevel} onValueChange={setNewRoleLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">L0 — System</SelectItem>
                  <SelectItem value="1">L1 — Admin</SelectItem>
                  <SelectItem value="2">L2 — Power</SelectItem>
                  <SelectItem value="3">L3 — Manager</SelectItem>
                  <SelectItem value="4">L4 — Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRoleDialogOpen(false)} disabled={creatingRole}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCreateRole}
              disabled={creatingRole || !newRoleName.trim()}
            >
              {creatingRole ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
