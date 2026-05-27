'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Shield,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  LayoutDashboard,
  Palette,
  Lock,
  Unlock,
  Loader2,
  CheckCircle2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react'

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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'

// ─── Constants ──────────────────────────────────────────────────────────────
const PERMISSION_TYPES = ['canRead', 'canWrite', 'canModify', 'canDelete', 'canAdmin'] as const
type PermissionType = typeof PERMISSION_TYPES[number]

const MODULES = ['HR', 'Payroll', 'Attendance', 'Performance', 'Learning', 'Analytics', 'Recruitment', 'ProjectManagement'] as const
type ModuleName = typeof MODULES[number]

const PERMISSION_LABELS: Record<PermissionType, string> = {
  canRead: 'Read',
  canWrite: 'Write',
  canModify: 'Modify',
  canDelete: 'Delete',
  canAdmin: 'Admin',
}

const DASHBOARD_OPTIONS = [
  { value: 'admin', label: 'Admin Dashboard' },
  { value: 'hr', label: 'HR Dashboard' },
  { value: 'payroll', label: 'Payroll Dashboard' },
  { value: 'manager', label: 'Manager Dashboard' },
  { value: 'employee', label: 'Employee Dashboard' },
  { value: 'recruiter', label: 'Recruiter Dashboard' },
  { value: 'learning', label: 'Learning Dashboard' },
] as const

const COLOR_OPTIONS = [
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
] as const

const ROLE_COLOR_MAP: Record<string, string> = {
  red: 'bg-red-100 text-red-700 border-red-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'L0 — System',
  1: 'L1 — Admin',
  2: 'L2 — Power',
  3: 'L3 — Manager',
  4: 'L4 — Standard',
}

// ─── API types ──────────────────────────────────────────────────────────────
interface ApiRolePermission {
  id: string
  roleId: string
  module: string
  canRead: boolean
  canWrite: boolean
  canModify: boolean
  canDelete: boolean
  canAdmin: boolean
}

interface ApiRole {
  id: string
  name: string
  description: string | null
  permissions: string | null
  level: number
  isSystem: boolean
  dashboard: string
  menuItems: string | null
  color: string
  users: { id: string; name: string; email: string }[]
  rolePermissions: ApiRolePermission[]
  _count: { users: number }
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

interface PermissionsApiResponse {
  permissions: ApiRolePermission[]
}

// ─── UI types ───────────────────────────────────────────────────────────────
interface RoleFormData {
  name: string
  description: string
  level: number
  dashboard: string
  color: string
  menuItems: string
}

const defaultRoleForm: RoleFormData = {
  name: '',
  description: '',
  level: 4,
  dashboard: 'employee',
  color: 'teal',
  menuItems: '',
}

// ─── Permission toggle component ────────────────────────────────────────────
function PermissionToggle({
  enabled,
  onChange,
  disabled,
  label,
}: {
  enabled: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <div className="flex items-center justify-center">
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={label}
        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-200"
      />
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function RoleMasterPage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null)
  const [roleForm, setRoleForm] = useState<RoleFormData>(defaultRoleForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Permission editing state
  const [editingPermissions, setEditingPermissions] = useState<Record<string, ApiRolePermission>>({})
  const [permissionsChanged, setPermissionsChanged] = useState(false)
  const [savingPermissions, setSavingPermissions] = useState(false)

  // Expand/collapse for permission matrix
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null)

  // ── API Data ───────────────────────────────────────────────────────────
  const { data: rolesData, loading: rolesLoading, error: rolesError, refetch: refetchRoles } = useApi<RolesApiResponse>({
    baseUrl: '/api/roles',
    params: { page: 1, limit: 50 },
  })

  const { data: allPermissionsData, loading: permissionsLoading, refetch: refetchPermissions } = useApi<PermissionsApiResponse>({
    baseUrl: '/api/roles/permissions',
    enabled: true,
  })

  const roles = rolesData?.roles ?? []
  const allPermissions = allPermissionsData?.permissions ?? []

  // ── Filtered roles ─────────────────────────────────────────────────────
  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles
    const q = searchQuery.toLowerCase()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    )
  }, [roles, searchQuery])

  // ── Build permission lookup for a role ─────────────────────────────────
  const getPermissionsForRole = useCallback(
    (roleId: string): Record<string, ApiRolePermission> => {
      const map: Record<string, ApiRolePermission> = {}
      for (const rp of allPermissions) {
        if (rp.roleId === roleId) {
          map[rp.module] = rp
        }
      }
      return map
    },
    [allPermissions]
  )

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleCreateRole = useCallback(async () => {
    if (!roleForm.name.trim()) return
    setSaving(true)
    try {
      const menuItemsValue = roleForm.menuItems.trim()
      await apiPost('/api/roles', {
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || null,
        level: roleForm.level,
        dashboard: roleForm.dashboard,
        color: roleForm.color,
        menuItems: menuItemsValue || null,
      })
      setCreateDialogOpen(false)
      setRoleForm(defaultRoleForm)
      refetchRoles()
      refetchPermissions()
    } catch (err) {
      console.error('Failed to create role:', err)
    } finally {
      setSaving(false)
    }
  }, [roleForm, refetchRoles, refetchPermissions])

  const handleEditRole = useCallback((role: ApiRole) => {
    setSelectedRole(role)
    setRoleForm({
      name: role.name,
      description: role.description || '',
      level: role.level,
      dashboard: role.dashboard || 'employee',
      color: role.color || 'teal',
      menuItems: role.menuItems || '',
    })
    setEditDialogOpen(true)
  }, [])

  const handleSaveEditRole = useCallback(async () => {
    if (!selectedRole) return
    setSaving(true)
    try {
      const menuItemsValue = roleForm.menuItems.trim()
      await apiPatch('/api/roles', {
        id: selectedRole.id,
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || null,
        level: roleForm.level,
        dashboard: roleForm.dashboard,
        color: roleForm.color,
        menuItems: menuItemsValue || null,
      })
      setEditDialogOpen(false)
      setSelectedRole(null)
      refetchRoles()
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setSaving(false)
    }
  }, [selectedRole, roleForm, refetchRoles])

  const handleDeleteRole = useCallback(async () => {
    if (!selectedRole) return
    setDeleting(true)
    try {
      await apiDelete(`/api/roles?id=${selectedRole.id}`)
      setDeleteDialogOpen(false)
      setSelectedRole(null)
      refetchRoles()
      refetchPermissions()
    } catch (err) {
      console.error('Failed to delete role:', err)
    } finally {
      setDeleting(false)
    }
  }, [selectedRole, refetchRoles, refetchPermissions])

  const handleOpenPermissionMatrix = useCallback(
    (role: ApiRole) => {
      if (expandedRoleId === role.id) {
        setExpandedRoleId(null)
        return
      }
      setExpandedRoleId(role.id)
      // Initialize permission editing state from current data
      const perms = getPermissionsForRole(role.id)
      setEditingPermissions(
        Object.fromEntries(Object.entries(perms).map(([k, v]) => [k, { ...v }]))
      )
      setPermissionsChanged(false)
    },
    [expandedRoleId, getPermissionsForRole]
  )

  const handleTogglePermission = useCallback(
    (module: string, permType: PermissionType, value: boolean) => {
      setEditingPermissions((prev) => {
        const existing = prev[module]
        if (existing) {
          return {
            ...prev,
            [module]: { ...existing, [permType]: value },
          }
        }
        // Create a new entry
        return {
          ...prev,
          [module]: {
            id: `new-${module}`,
            roleId: expandedRoleId || '',
            module,
            canRead: permType === 'canRead' ? value : false,
            canWrite: permType === 'canWrite' ? value : false,
            canModify: permType === 'canModify' ? value : false,
            canDelete: permType === 'canDelete' ? value : false,
            canAdmin: permType === 'canAdmin' ? value : false,
          },
        }
      })
      setPermissionsChanged(true)
    },
    [expandedRoleId]
  )

  const handleSavePermissions = useCallback(async () => {
    if (!expandedRoleId) return
    setSavingPermissions(true)
    try {
      const entries = Object.values(editingPermissions).map((p) => ({
        roleId: expandedRoleId,
        module: p.module,
        canRead: p.canRead,
        canWrite: p.canWrite,
        canModify: p.canModify,
        canDelete: p.canDelete,
        canAdmin: p.canAdmin,
      }))

      await apiPost('/api/roles/permissions', { permissions: entries })
      setPermissionsChanged(false)
      refetchPermissions()
    } catch (err) {
      console.error('Failed to save permissions:', err)
    } finally {
      setSavingPermissions(false)
    }
  }, [expandedRoleId, editingPermissions, refetchPermissions])

  const handleToggleAllForModule = useCallback(
    (module: string, value: boolean) => {
      setEditingPermissions((prev) => {
        const existing = prev[module]
        if (existing) {
          return {
            ...prev,
            [module]: {
              ...existing,
              canRead: value,
              canWrite: value,
              canModify: value,
              canDelete: value,
              canAdmin: value,
            },
          }
        }
        return {
          ...prev,
          [module]: {
            id: `new-${module}`,
            roleId: expandedRoleId || '',
            module,
            canRead: value,
            canWrite: value,
            canModify: value,
            canDelete: value,
            canAdmin: value,
          },
        }
      })
      setPermissionsChanged(true)
    },
    [expandedRoleId]
  )

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
              Role Master
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure roles, assign permissions, and manage access control for all modules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 bg-emerald-100 text-emerald-700">
              <Shield className="h-3.5 w-3.5" />
              {roles.length} Roles
            </Badge>
            <Button
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                setRoleForm(defaultRoleForm)
                setCreateDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Loading */}
        {rolesLoading || permissionsLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <div className="h-5 w-48 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-64 rounded bg-muted animate-pulse" />
                  <div className="h-20 w-full rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rolesError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">Failed to load roles. Please try again.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={refetchRoles}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredRoles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'No roles match your search.' : 'No roles configured yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRoles.map((role) => {
              const rolePerms = getPermissionsForRole(role.id)
              const isExpanded = expandedRoleId === role.id
              const userCount = role._count?.users ?? role.users?.length ?? 0
              const colorClass = ROLE_COLOR_MAP[role.color] || ROLE_COLOR_MAP.teal

              return (
                <Card key={role.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  {/* Role header row */}
                  <div
                    className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleOpenPermissionMatrix(role)}
                  >
                    {/* Color indicator */}
                    <div className={`h-12 w-1.5 shrink-0 rounded-full ${COLOR_OPTIONS.find(c => c.value === role.color)?.class || 'bg-teal-500'}`} />

                    {/* Role info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold truncate">{role.name}</h3>
                        <Badge variant="outline" className={`text-[10px] font-mono ${colorClass}`}>
                          {LEVEL_LABELS[role.level] || `L${role.level}`}
                        </Badge>
                        {role.isSystem && (
                          <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            System
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <LayoutDashboard className="h-2.5 w-2.5" />
                          {role.dashboard || 'employee'}
                        </Badge>
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{role.description}</p>
                      )}
                    </div>

                    {/* User count */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                      <Users className="h-4 w-4" />
                      <span>{userCount}</span>
                    </div>

                    {/* Permission count */}
                    <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                      <Shield className="h-4 w-4" />
                      <span>{Object.keys(rolePerms).length} modules</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-emerald-600"
                        onClick={() => handleEditRole(role)}
                        title="Edit role"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600"
                          onClick={() => {
                            setSelectedRole(role)
                            setDeleteDialogOpen(true)
                          }}
                          title="Delete role"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Expand indicator */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>

                  {/* Permission Matrix (expanded) */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20">
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-emerald-600" />
                            Permission Matrix
                          </h4>
                          {permissionsChanged && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 h-7 text-xs"
                                onClick={() => {
                                  const perms = getPermissionsForRole(role.id)
                                  setEditingPermissions(
                                    Object.fromEntries(Object.entries(perms).map(([k, v]) => [k, { ...v }]))
                                  )
                                  setPermissionsChanged(false)
                                }}
                              >
                                <X className="h-3 w-3" />
                                Discard
                              </Button>
                              <Button
                                size="sm"
                                className="gap-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleSavePermissions}
                                disabled={savingPermissions}
                              >
                                {savingPermissions ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                                Save
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[180px]">Module</TableHead>
                                {PERMISSION_TYPES.map((pt) => (
                                  <TableHead key={pt} className="text-center w-[80px]">
                                    {PERMISSION_LABELS[pt]}
                                  </TableHead>
                                ))}
                                <TableHead className="text-center w-[80px]">All</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {MODULES.map((mod) => {
                                const perm = editingPermissions[mod]
                                const allEnabled = perm
                                  ? PERMISSION_TYPES.every((pt) => perm[pt])
                                  : false
                                const someEnabled = perm
                                  ? PERMISSION_TYPES.some((pt) => perm[pt])
                                  : false

                                return (
                                  <TableRow key={mod}>
                                    <TableCell className="font-medium text-sm">
                                      {mod}
                                    </TableCell>
                                    {PERMISSION_TYPES.map((pt) => (
                                      <TableCell key={pt} className="text-center">
                                        <PermissionToggle
                                          enabled={perm ? perm[pt] : false}
                                          onChange={(val) => handleTogglePermission(mod, pt, val)}
                                          label={`${mod} ${PERMISSION_LABELS[pt]}`}
                                        />
                                      </TableCell>
                                    ))}
                                    <TableCell className="text-center">
                                      <PermissionToggle
                                        enabled={allEnabled}
                                        onChange={(val) => handleToggleAllForModule(mod, val)}
                                        label={`${mod} All`}
                                      />
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Permission summary */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {MODULES.map((mod) => {
                            const perm = editingPermissions[mod]
                            const count = perm
                              ? PERMISSION_TYPES.filter((pt) => perm[pt]).length
                              : 0
                            if (count === 0) return null
                            return (
                              <Badge
                                key={mod}
                                variant="outline"
                                className={`text-[10px] ${
                                  count === 5
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {mod}: {count}/5
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Permission Overview Table */}
        {!rolesLoading && roles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Permission Overview
            </h2>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-10 min-w-[160px]">Role</TableHead>
                      {MODULES.map((mod) => (
                        <TableHead key={mod} className="text-center min-w-[80px]">
                          {mod}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => {
                      const rolePerms = getPermissionsForRole(role.id)
                      return (
                        <TableRow key={role.id}>
                          <TableCell className="sticky left-0 bg-background z-10 font-medium">
                            <div className="flex items-center gap-2">
                              <div className={`h-2.5 w-2.5 rounded-full ${COLOR_OPTIONS.find(c => c.value === role.color)?.class || 'bg-teal-500'}`} />
                              <span className="truncate">{role.name}</span>
                            </div>
                          </TableCell>
                          {MODULES.map((mod) => {
                            const perm = rolePerms[mod]
                            const count = perm
                              ? PERMISSION_TYPES.filter((pt) => perm[pt]).length
                              : 0
                            return (
                              <TableCell key={mod} className="text-center">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-mono ${
                                    count === 5
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                      : count > 0
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-gray-50 text-gray-400 border-gray-200'
                                  }`}
                                >
                                  {count}/5
                                </Badge>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── Create Role Dialog ──────────────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Define a new role with dashboard, access level, and color.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Role Name *</Label>
              <Input
                id="create-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Team Lead"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this role's responsibilities"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-level">Access Level</Label>
                <Select
                  value={String(roleForm.level)}
                  onValueChange={(v) => setRoleForm((f) => ({ ...f, level: parseInt(v) }))}
                >
                  <SelectTrigger id="create-level">
                    <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="create-dashboard">Dashboard</Label>
                <Select
                  value={roleForm.dashboard}
                  onValueChange={(v) => setRoleForm((f) => ({ ...f, dashboard: v }))}
                >
                  <SelectTrigger id="create-dashboard">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DASHBOARD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`h-8 w-8 rounded-full ${opt.class} transition-transform ${
                      roleForm.color === opt.value
                        ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setRoleForm((f) => ({ ...f, color: opt.value }))}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-menuitems">Menu Items (JSON array, leave empty for all)</Label>
              <Input
                id="create-menuitems"
                value={roleForm.menuItems}
                onChange={(e) => setRoleForm((f) => ({ ...f, menuItems: e.target.value }))}
                placeholder='["dashboard", "employees", "selfservice"]'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleCreateRole}
              disabled={!roleForm.name.trim() || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Role Dialog ────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-emerald-600" />
              Edit Role
            </DialogTitle>
            <DialogDescription>
              Update role details. Use the permission matrix on the main page to edit permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name *</Label>
              <Input
                id="edit-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Team Lead"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this role's responsibilities"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Access Level</Label>
                <Select
                  value={String(roleForm.level)}
                  onValueChange={(v) => setRoleForm((f) => ({ ...f, level: parseInt(v) }))}
                >
                  <SelectTrigger id="edit-level">
                    <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="edit-dashboard">Dashboard</Label>
                <Select
                  value={roleForm.dashboard}
                  onValueChange={(v) => setRoleForm((f) => ({ ...f, dashboard: v }))}
                >
                  <SelectTrigger id="edit-dashboard">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DASHBOARD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`h-8 w-8 rounded-full ${opt.class} transition-transform ${
                      roleForm.color === opt.value
                        ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    onClick={() => setRoleForm((f) => ({ ...f, color: opt.value }))}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-menuitems">Menu Items (JSON array, leave empty for all)</Label>
              <Input
                id="edit-menuitems"
                value={roleForm.menuItems}
                onChange={(e) => setRoleForm((f) => ({ ...f, menuItems: e.target.value }))}
                placeholder='["dashboard", "employees", "selfservice"]'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleSaveEditRole}
              disabled={!roleForm.name.trim() || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Role Confirmation Dialog ─────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role &quot;{selectedRole?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={handleDeleteRole}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
