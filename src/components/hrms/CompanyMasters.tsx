'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  Loader2,
  X,
  MapPin,
  Network,
  Shield,
  Briefcase,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { useToast } from '@/hooks/use-toast'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Branch {
  id: string
  name: string
  code: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  pincode: string | null
  phone: string | null
  email: string | null
  head: string | null
  isActive: boolean
  companyId: string | null
  createdAt: string
}

interface Department {
  id: string
  name: string
  head: string | null
  description: string | null
  budget: number | null
  companyId: string | null
  createdAt: string
  updatedAt: string
}

interface SubDepartment {
  id: string
  name: string
  departmentId: string
  head: string | null
  description: string | null
  isActive: boolean
  companyId: string | null
  department?: { id: string; name: string }
  createdAt: string
}

interface Role {
  id: string
  name: string
  description: string | null
  level: number
  isSystem: boolean
  dashboard: string
  color: string
  createdAt: string
  _count?: { users: number }
}

interface EmployeeType {
  id: string
  name: string
  code: string | null
  description: string | null
  isActive: boolean
  companyId: string | null
  createdAt: string
}

interface BranchesResponse {
  branches: Branch[]
}

interface DepartmentsResponse {
  departments: Department[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface SubDepartmentsResponse {
  subDepartments: SubDepartment[]
}

interface RolesResponse {
  roles: Role[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface EmployeeTypesResponse {
  employeeTypes: EmployeeType[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(isActive: boolean) {
  return isActive ? (
    <Badge
      variant="secondary"
      className="text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
    >
      Active
    </Badge>
  ) : (
    <Badge
      variant="secondary"
      className="text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      Inactive
    </Badge>
  )
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyMasters() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('branches')

  // Sync sidebar sub-item selection to activeTab
  const { activeSubItem } = useHRMSStore()

  useEffect(() => {
    if (!activeSubItem) return
    const subItemToTab: Record<string, string> = {
      'branches': 'branches',
      'departments-master': 'departments',
      'sub-departments': 'sub-departments',
      'roles-master': 'roles',
      'employee-types': 'employee-types',
    }
    const tab = subItemToTab[activeSubItem]
    if (tab) setActiveTab(tab)
  }, [activeSubItem])

  // ── Search States ─────────────────────────────────────────────────────────
  const [branchSearch, setBranchSearch] = useState('')
  const [deptSearch, setDeptSearch] = useState('')
  const [subDeptSearch, setSubDeptSearch] = useState('')
  const [roleSearch, setRoleSearch] = useState('')
  const [empTypeSearch, setEmpTypeSearch] = useState('')

  // ── Branch State ──────────────────────────────────────────────────────────
  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [branchEditItem, setBranchEditItem] = useState<Branch | null>(null)
  const [branchSaving, setBranchSaving] = useState(false)
  const [branchDeleteId, setBranchDeleteId] = useState<string | null>(null)
  const [branchDeleting, setBranchDeleting] = useState(false)
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    phone: '',
    email: '',
    head: '',
    isActive: true,
  })

  // ── Department State ─────────────────────────────────────────────────────
  const [deptDialogOpen, setDeptDialogOpen] = useState(false)
  const [deptEditItem, setDeptEditItem] = useState<Department | null>(null)
  const [deptSaving, setDeptSaving] = useState(false)
  const [deptDeleteId, setDeptDeleteId] = useState<string | null>(null)
  const [deptDeleting, setDeptDeleting] = useState(false)
  const [deptForm, setDeptForm] = useState({
    name: '',
    head: '',
    description: '',
    budget: '',
  })

  // ── Sub-Department State ─────────────────────────────────────────────────
  const [subDeptDialogOpen, setSubDeptDialogOpen] = useState(false)
  const [subDeptEditItem, setSubDeptEditItem] = useState<SubDepartment | null>(null)
  const [subDeptSaving, setSubDeptSaving] = useState(false)
  const [subDeptDeleteId, setSubDeptDeleteId] = useState<string | null>(null)
  const [subDeptDeleting, setSubDeptDeleting] = useState(false)
  const [subDeptForm, setSubDeptForm] = useState({
    name: '',
    departmentId: '',
    head: '',
    description: '',
    isActive: true,
  })

  // ── Role State ───────────────────────────────────────────────────────────
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [roleEditItem, setRoleEditItem] = useState<Role | null>(null)
  const [roleSaving, setRoleSaving] = useState(false)
  const [roleDeleteId, setRoleDeleteId] = useState<string | null>(null)
  const [roleDeleting, setRoleDeleting] = useState(false)
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    level: '0',
    dashboard: 'employee',
  })

  // ── Employee Type State ──────────────────────────────────────────────────
  const [empTypeDialogOpen, setEmpTypeDialogOpen] = useState(false)
  const [empTypeEditItem, setEmpTypeEditItem] = useState<EmployeeType | null>(null)
  const [empTypeSaving, setEmpTypeSaving] = useState(false)
  const [empTypeDeleteId, setEmpTypeDeleteId] = useState<string | null>(null)
  const [empTypeDeleting, setEmpTypeDeleting] = useState(false)
  const [empTypeForm, setEmpTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  // ── API Hooks ────────────────────────────────────────────────────────────

  const {
    data: branchesData,
    loading: branchesLoading,
    error: branchesError,
    refetch: refetchBranches,
  } = useApi<BranchesResponse>({
    baseUrl: '/api/masters/branches',
    params: {
      search: branchSearch || undefined,
    },
  })

  const {
    data: deptsData,
    loading: deptsLoading,
    error: deptsError,
    refetch: refetchDepts,
  } = useApi<DepartmentsResponse>({
    baseUrl: '/api/departments',
    params: {
      limit: 100,
      search: deptSearch || undefined,
    },
  })

  const {
    data: subDeptsData,
    loading: subDeptsLoading,
    error: subDeptsError,
    refetch: refetchSubDepts,
  } = useApi<SubDepartmentsResponse>({
    baseUrl: '/api/masters/sub-departments',
    params: {
      search: subDeptSearch || undefined,
    },
  })

  const {
    data: rolesData,
    loading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useApi<RolesResponse>({
    baseUrl: '/api/roles',
    params: {
      limit: 100,
      search: roleSearch || undefined,
    },
  })

  const {
    data: empTypesData,
    loading: empTypesLoading,
    error: empTypesError,
    refetch: refetchEmpTypes,
  } = useApi<EmployeeTypesResponse>({
    baseUrl: '/api/masters/employee-types',
    params: {
      search: empTypeSearch || undefined,
    },
  })

  // ── Derived Data ─────────────────────────────────────────────────────────

  const branches = branchesData?.branches ?? []
  const departments = deptsData?.departments ?? []
  const subDepartments = subDeptsData?.subDepartments ?? []
  const roles = rolesData?.roles ?? []
  const employeeTypes = empTypesData?.employeeTypes ?? []

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = {
    branches: branches.length,
    departments: departments.length,
    subDepartments: subDepartments.length,
    roles: roles.length,
    employeeTypes: employeeTypes.length,
  }

  // ── Branch Handlers ──────────────────────────────────────────────────────

  const openBranchDialog = useCallback((item?: Branch) => {
    if (item) {
      setBranchEditItem(item)
      setBranchForm({
        name: item.name,
        code: item.code || '',
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        country: item.country || '',
        pincode: item.pincode || '',
        phone: item.phone || '',
        email: item.email || '',
        head: item.head || '',
        isActive: item.isActive,
      })
    } else {
      setBranchEditItem(null)
      setBranchForm({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        phone: '',
        email: '',
        head: '',
        isActive: true,
      })
    }
    setBranchDialogOpen(true)
  }, [])

  async function handleSaveBranch() {
    if (!branchForm.name) {
      toast({ title: 'Validation Error', description: 'Branch name is required.', variant: 'destructive' })
      return
    }
    setBranchSaving(true)
    try {
      if (branchEditItem) {
        await apiPatch(`/api/masters/branches/${branchEditItem.id}`, {
          name: branchForm.name,
          code: branchForm.code || null,
          address: branchForm.address || null,
          city: branchForm.city || null,
          state: branchForm.state || null,
          country: branchForm.country || null,
          pincode: branchForm.pincode || null,
          phone: branchForm.phone || null,
          email: branchForm.email || null,
          head: branchForm.head || null,
          isActive: branchForm.isActive,
        })
        toast({ title: 'Branch Updated', description: `${branchForm.name} has been updated successfully.` })
      } else {
        await apiPost('/api/masters/branches', {
          name: branchForm.name,
          code: branchForm.code || null,
          address: branchForm.address || null,
          city: branchForm.city || null,
          state: branchForm.state || null,
          country: branchForm.country || null,
          pincode: branchForm.pincode || null,
          phone: branchForm.phone || null,
          email: branchForm.email || null,
          head: branchForm.head || null,
          isActive: branchForm.isActive,
        })
        toast({ title: 'Branch Created', description: `${branchForm.name} has been created successfully.` })
      }
      setBranchDialogOpen(false)
      refetchBranches()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save branch',
        variant: 'destructive',
      })
    } finally {
      setBranchSaving(false)
    }
  }

  async function handleDeleteBranch() {
    if (!branchDeleteId) return
    setBranchDeleting(true)
    try {
      await apiDelete(`/api/masters/branches/${branchDeleteId}`)
      toast({ title: 'Branch Deleted', description: 'Branch has been removed.', variant: 'destructive' })
      setBranchDeleteId(null)
      refetchBranches()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete branch',
        variant: 'destructive',
      })
    } finally {
      setBranchDeleting(false)
    }
  }

  // ── Department Handlers ──────────────────────────────────────────────────

  const openDeptDialog = useCallback((item?: Department) => {
    if (item) {
      setDeptEditItem(item)
      setDeptForm({
        name: item.name,
        head: item.head || '',
        description: item.description || '',
        budget: item.budget ? String(item.budget) : '',
      })
    } else {
      setDeptEditItem(null)
      setDeptForm({ name: '', head: '', description: '', budget: '' })
    }
    setDeptDialogOpen(true)
  }, [])

  async function handleSaveDept() {
    if (!deptForm.name) {
      toast({ title: 'Validation Error', description: 'Department name is required.', variant: 'destructive' })
      return
    }
    setDeptSaving(true)
    try {
      if (deptEditItem) {
        await apiPatch('/api/departments', {
          id: deptEditItem.id,
          name: deptForm.name,
          head: deptForm.head || null,
          description: deptForm.description || null,
          budget: deptForm.budget ? parseFloat(deptForm.budget) : undefined,
        })
        toast({ title: 'Department Updated', description: `${deptForm.name} has been updated successfully.` })
      } else {
        await apiPost('/api/departments', {
          name: deptForm.name,
          head: deptForm.head || null,
          description: deptForm.description || null,
          budget: deptForm.budget ? parseFloat(deptForm.budget) : undefined,
        })
        toast({ title: 'Department Created', description: `${deptForm.name} has been created successfully.` })
      }
      setDeptDialogOpen(false)
      refetchDepts()
      refetchSubDepts()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save department',
        variant: 'destructive',
      })
    } finally {
      setDeptSaving(false)
    }
  }

  async function handleDeleteDept() {
    if (!deptDeleteId) return
    setDeptDeleting(true)
    try {
      await apiDelete(`/api/departments?id=${deptDeleteId}`)
      toast({ title: 'Department Deleted', description: 'Department has been removed.', variant: 'destructive' })
      setDeptDeleteId(null)
      refetchDepts()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete department',
        variant: 'destructive',
      })
    } finally {
      setDeptDeleting(false)
    }
  }

  // ── Sub-Department Handlers ──────────────────────────────────────────────

  const openSubDeptDialog = useCallback((item?: SubDepartment) => {
    if (item) {
      setSubDeptEditItem(item)
      setSubDeptForm({
        name: item.name,
        departmentId: item.departmentId,
        head: item.head || '',
        description: item.description || '',
        isActive: item.isActive,
      })
    } else {
      setSubDeptEditItem(null)
      setSubDeptForm({ name: '', departmentId: '', head: '', description: '', isActive: true })
    }
    setSubDeptDialogOpen(true)
  }, [])

  async function handleSaveSubDept() {
    if (!subDeptForm.name) {
      toast({ title: 'Validation Error', description: 'Sub-department name is required.', variant: 'destructive' })
      return
    }
    if (!subDeptForm.departmentId) {
      toast({ title: 'Validation Error', description: 'Parent department is required.', variant: 'destructive' })
      return
    }
    setSubDeptSaving(true)
    try {
      if (subDeptEditItem) {
        await apiPatch(`/api/masters/sub-departments/${subDeptEditItem.id}`, {
          name: subDeptForm.name,
          departmentId: subDeptForm.departmentId,
          head: subDeptForm.head || null,
          description: subDeptForm.description || null,
          isActive: subDeptForm.isActive,
        })
        toast({ title: 'Sub-Department Updated', description: `${subDeptForm.name} has been updated successfully.` })
      } else {
        await apiPost('/api/masters/sub-departments', {
          name: subDeptForm.name,
          departmentId: subDeptForm.departmentId,
          head: subDeptForm.head || null,
          description: subDeptForm.description || null,
          isActive: subDeptForm.isActive,
        })
        toast({ title: 'Sub-Department Created', description: `${subDeptForm.name} has been created successfully.` })
      }
      setSubDeptDialogOpen(false)
      refetchSubDepts()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save sub-department',
        variant: 'destructive',
      })
    } finally {
      setSubDeptSaving(false)
    }
  }

  async function handleDeleteSubDept() {
    if (!subDeptDeleteId) return
    setSubDeptDeleting(true)
    try {
      await apiDelete(`/api/masters/sub-departments/${subDeptDeleteId}`)
      toast({ title: 'Sub-Department Deleted', description: 'Sub-department has been removed.', variant: 'destructive' })
      setSubDeptDeleteId(null)
      refetchSubDepts()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete sub-department',
        variant: 'destructive',
      })
    } finally {
      setSubDeptDeleting(false)
    }
  }

  // ── Role Handlers ────────────────────────────────────────────────────────

  const openRoleDialog = useCallback((item?: Role) => {
    if (item) {
      setRoleEditItem(item)
      setRoleForm({
        name: item.name,
        description: item.description || '',
        level: String(item.level),
        dashboard: item.dashboard || 'employee',
      })
    } else {
      setRoleEditItem(null)
      setRoleForm({ name: '', description: '', level: '0', dashboard: 'employee' })
    }
    setRoleDialogOpen(true)
  }, [])

  async function handleSaveRole() {
    if (!roleForm.name) {
      toast({ title: 'Validation Error', description: 'Role name is required.', variant: 'destructive' })
      return
    }
    setRoleSaving(true)
    try {
      if (roleEditItem) {
        await apiPatch('/api/roles', {
          id: roleEditItem.id,
          name: roleForm.name,
          description: roleForm.description || null,
          level: parseInt(roleForm.level) || 0,
          dashboard: roleForm.dashboard,
        })
        toast({ title: 'Role Updated', description: `${roleForm.name} has been updated successfully.` })
      } else {
        await apiPost('/api/roles', {
          name: roleForm.name,
          description: roleForm.description || null,
          level: parseInt(roleForm.level) || 0,
          dashboard: roleForm.dashboard,
        })
        toast({ title: 'Role Created', description: `${roleForm.name} has been created successfully.` })
      }
      setRoleDialogOpen(false)
      refetchRoles()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save role',
        variant: 'destructive',
      })
    } finally {
      setRoleSaving(false)
    }
  }

  async function handleDeleteRole() {
    if (!roleDeleteId) return
    setRoleDeleting(true)
    try {
      await apiDelete(`/api/roles?id=${roleDeleteId}`)
      toast({ title: 'Role Deleted', description: 'Role has been removed.', variant: 'destructive' })
      setRoleDeleteId(null)
      refetchRoles()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete role',
        variant: 'destructive',
      })
    } finally {
      setRoleDeleting(false)
    }
  }

  // ── Employee Type Handlers ───────────────────────────────────────────────

  const openEmpTypeDialog = useCallback((item?: EmployeeType) => {
    if (item) {
      setEmpTypeEditItem(item)
      setEmpTypeForm({
        name: item.name,
        code: item.code || '',
        description: item.description || '',
        isActive: item.isActive,
      })
    } else {
      setEmpTypeEditItem(null)
      setEmpTypeForm({ name: '', code: '', description: '', isActive: true })
    }
    setEmpTypeDialogOpen(true)
  }, [])

  async function handleSaveEmpType() {
    if (!empTypeForm.name) {
      toast({ title: 'Validation Error', description: 'Employee type name is required.', variant: 'destructive' })
      return
    }
    setEmpTypeSaving(true)
    try {
      if (empTypeEditItem) {
        await apiPatch(`/api/masters/employee-types/${empTypeEditItem.id}`, {
          name: empTypeForm.name,
          code: empTypeForm.code || null,
          description: empTypeForm.description || null,
          isActive: empTypeForm.isActive,
        })
        toast({ title: 'Employee Type Updated', description: `${empTypeForm.name} has been updated successfully.` })
      } else {
        await apiPost('/api/masters/employee-types', {
          name: empTypeForm.name,
          code: empTypeForm.code || null,
          description: empTypeForm.description || null,
          isActive: empTypeForm.isActive,
        })
        toast({ title: 'Employee Type Created', description: `${empTypeForm.name} has been created successfully.` })
      }
      setEmpTypeDialogOpen(false)
      refetchEmpTypes()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save employee type',
        variant: 'destructive',
      })
    } finally {
      setEmpTypeSaving(false)
    }
  }

  async function handleDeleteEmpType() {
    if (!empTypeDeleteId) return
    setEmpTypeDeleting(true)
    try {
      await apiDelete(`/api/masters/employee-types/${empTypeDeleteId}`)
      toast({ title: 'Employee Type Deleted', description: 'Employee type has been removed.', variant: 'destructive' })
      setEmpTypeDeleteId(null)
      refetchEmpTypes()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete employee type',
        variant: 'destructive',
      })
    } finally {
      setEmpTypeDeleting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Company Masters
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage branches, departments, roles &amp; employee types
              </p>
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ──────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Branches</p>
                  <p className="text-2xl font-bold">{stats.branches}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                  <Network className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Departments</p>
                  <p className="text-2xl font-bold">{stats.departments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                  <ChevronRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Sub-Depts</p>
                  <p className="text-2xl font-bold">{stats.subDepartments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                  <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Roles</p>
                  <p className="text-2xl font-bold">{stats.roles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                  <Briefcase className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Emp. Types</p>
                  <p className="text-2xl font-bold">{stats.employeeTypes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Tabs ────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="branches" className="gap-2">
              <MapPin className="h-4 w-4" />
              Branches
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2">
              <Network className="h-4 w-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="sub-departments" className="gap-2">
              <ChevronRight className="h-4 w-4" />
              Sub-Depts
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="employee-types" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Emp. Types
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════ BRANCHES TAB ═══════════════ */}
          <TabsContent value="branches">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-3 p-4 border-b">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search branches..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                  <Button
                    onClick={() => openBranchDialog()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Branch
                  </Button>
                </div>

                {branchesLoading ? (
                  <LoadingSpinner message="Loading branches..." />
                ) : branchesError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{branchesError}</p>
                    <Button variant="outline" size="sm" onClick={refetchBranches}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Branch</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead className="hidden md:table-cell">City</TableHead>
                          <TableHead className="hidden lg:table-cell">State</TableHead>
                          <TableHead className="hidden lg:table-cell">Phone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                              <EmptyState
                                icon={MapPin}
                                title="No branches found"
                                description="Add a new branch or adjust your search"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          branches.map((branch) => (
                            <TableRow key={branch.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{branch.name}</p>
                                    <p className="text-muted-foreground truncate text-[11px]">
                                      {branch.address || 'No address'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {branch.code ? (
                                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                                    {branch.code}
                                  </code>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm">{branch.city || '—'}</span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-sm">{branch.state || '—'}</span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-sm">{branch.phone || '—'}</span>
                              </TableCell>
                              <TableCell>{getStatusBadge(branch.isActive)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                    onClick={() => openBranchDialog(branch)}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => setBranchDeleteId(branch.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ DEPARTMENTS TAB ═══════════════ */}
          <TabsContent value="departments">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-3 p-4 border-b">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search departments..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                  <Button
                    onClick={() => openDeptDialog()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Department
                  </Button>
                </div>

                {deptsLoading ? (
                  <LoadingSpinner message="Loading departments..." />
                ) : deptsError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{deptsError}</p>
                    <Button variant="outline" size="sm" onClick={refetchDepts}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Department</TableHead>
                          <TableHead className="hidden md:table-cell">Head</TableHead>
                          <TableHead className="hidden lg:table-cell">Description</TableHead>
                          <TableHead className="hidden md:table-cell">Budget</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center">
                              <EmptyState
                                icon={Network}
                                title="No departments found"
                                description="Add a new department or adjust your search"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          departments.map((dept) => (
                            <TableRow key={dept.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                                    <Network className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{dept.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm">{dept.head || '—'}</span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-muted-foreground text-sm truncate max-w-[200px] block">
                                  {dept.description || '—'}
                                </span>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {dept.budget ? (
                                  <span className="text-sm font-medium">
                                    ₹{dept.budget.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                    onClick={() => openDeptDialog(dept)}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => setDeptDeleteId(dept.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ SUB-DEPARTMENTS TAB ═══════════════ */}
          <TabsContent value="sub-departments">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-3 p-4 border-b">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sub-departments..."
                      value={subDeptSearch}
                      onChange={(e) => setSubDeptSearch(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                  <Button
                    onClick={() => openSubDeptDialog()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Sub-Dept
                  </Button>
                </div>

                {subDeptsLoading ? (
                  <LoadingSpinner message="Loading sub-departments..." />
                ) : subDeptsError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{subDeptsError}</p>
                    <Button variant="outline" size="sm" onClick={refetchSubDepts}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Sub-Department</TableHead>
                          <TableHead>Parent Dept</TableHead>
                          <TableHead className="hidden md:table-cell">Head</TableHead>
                          <TableHead className="hidden lg:table-cell">Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subDepartments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                              <EmptyState
                                icon={ChevronRight}
                                title="No sub-departments found"
                                description="Add a new sub-department or adjust your search"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          subDepartments.map((subDept) => (
                            <TableRow key={subDept.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                                    <ChevronRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{subDept.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[11px] font-medium">
                                  {subDept.department?.name || '—'}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm">{subDept.head || '—'}</span>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-muted-foreground text-sm truncate max-w-[200px] block">
                                  {subDept.description || '—'}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(subDept.isActive)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                    onClick={() => openSubDeptDialog(subDept)}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => setSubDeptDeleteId(subDept.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ ROLES TAB ═══════════════ */}
          <TabsContent value="roles">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-3 p-4 border-b">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search roles..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                  <Button
                    onClick={() => openRoleDialog()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </div>

                {rolesLoading ? (
                  <LoadingSpinner message="Loading roles..." />
                ) : rolesError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{rolesError}</p>
                    <Button variant="outline" size="sm" onClick={refetchRoles}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Role</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead className="hidden md:table-cell">Dashboard</TableHead>
                          <TableHead className="hidden lg:table-cell">Description</TableHead>
                          <TableHead className="hidden md:table-cell">Users</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                              <EmptyState
                                icon={Shield}
                                title="No roles found"
                                description="Add a new role or adjust your search"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          roles.map((role) => (
                            <TableRow key={role.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                                    <Shield className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate text-sm font-medium">{role.name}</p>
                                      {role.isSystem && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                          System
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-[11px]">
                                  L{role.level}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className="text-[11px]">
                                  {role.dashboard}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-muted-foreground text-sm truncate max-w-[200px] block">
                                  {role.description || '—'}
                                </span>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm font-medium">{role._count?.users || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                    onClick={() => openRoleDialog(role)}
                                    title="Edit"
                                    disabled={role.isSystem}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => setRoleDeleteId(role.id)}
                                    title="Delete"
                                    disabled={role.isSystem}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ EMPLOYEE TYPES TAB ═══════════════ */}
          <TabsContent value="employee-types">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-3 p-4 border-b">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search employee types..."
                      value={empTypeSearch}
                      onChange={(e) => setEmpTypeSearch(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                  <Button
                    onClick={() => openEmpTypeDialog()}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add Type
                  </Button>
                </div>

                {empTypesLoading ? (
                  <LoadingSpinner message="Loading employee types..." />
                ) : empTypesError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{empTypesError}</p>
                    <Button variant="outline" size="sm" onClick={refetchEmpTypes}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Employee Type</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead className="hidden md:table-cell">Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeTypes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center">
                              <EmptyState
                                icon={Briefcase}
                                title="No employee types found"
                                description="Add a new employee type or adjust your search"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          employeeTypes.map((empType) => (
                            <TableRow key={empType.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                                    <Briefcase className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{empType.name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {empType.code ? (
                                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">
                                    {empType.code}
                                  </code>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-muted-foreground text-sm truncate max-w-[250px] block">
                                  {empType.description || '—'}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(empType.isActive)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                    onClick={() => openEmpTypeDialog(empType)}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => setEmpTypeDeleteId(empType.id)}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ═══════════════ BRANCH DIALOG ═══════════════ */}
        <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{branchEditItem ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
              <DialogDescription>
                {branchEditItem ? 'Update branch details below.' : 'Fill in the details to create a new branch.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Name *</Label>
                  <Input
                    id="branch-name"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    placeholder="Branch name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-code">Code</Label>
                  <Input
                    id="branch-code"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    placeholder="e.g., BR-001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-address">Address</Label>
                <Textarea
                  id="branch-address"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-city">City</Label>
                  <Input
                    id="branch-city"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-state">State</Label>
                  <Input
                    id="branch-state"
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-country">Country</Label>
                  <Input
                    id="branch-country"
                    value={branchForm.country}
                    onChange={(e) => setBranchForm({ ...branchForm, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-pincode">Pincode</Label>
                  <Input
                    id="branch-pincode"
                    value={branchForm.pincode}
                    onChange={(e) => setBranchForm({ ...branchForm, pincode: e.target.value })}
                    placeholder="Pincode"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-head">Branch Head</Label>
                  <Input
                    id="branch-head"
                    value={branchForm.head}
                    onChange={(e) => setBranchForm({ ...branchForm, head: e.target.value })}
                    placeholder="Head name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-phone">Phone</Label>
                  <Input
                    id="branch-phone"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-email">Email</Label>
                  <Input
                    id="branch-email"
                    type="email"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={branchForm.isActive}
                  onCheckedChange={(checked) => setBranchForm({ ...branchForm, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveBranch}
                disabled={branchSaving}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                {branchSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {branchEditItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══════════════ DEPARTMENT DIALOG ═══════════════ */}
        <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{deptEditItem ? 'Edit Department' : 'Add Department'}</DialogTitle>
              <DialogDescription>
                {deptEditItem ? 'Update department details below.' : 'Fill in the details to create a new department.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dept-name">Name *</Label>
                <Input
                  id="dept-name"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="Department name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-head">Head</Label>
                <Input
                  id="dept-head"
                  value={deptForm.head}
                  onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                  placeholder="Department head"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-description">Description</Label>
                <Textarea
                  id="dept-description"
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Department description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-budget">Budget</Label>
                <Input
                  id="dept-budget"
                  type="number"
                  value={deptForm.budget}
                  onChange={(e) => setDeptForm({ ...deptForm, budget: e.target.value })}
                  placeholder="Annual budget"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeptDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveDept}
                disabled={deptSaving}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                {deptSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {deptEditItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══════════════ SUB-DEPARTMENT DIALOG ═══════════════ */}
        <Dialog open={subDeptDialogOpen} onOpenChange={setSubDeptDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{subDeptEditItem ? 'Edit Sub-Department' : 'Add Sub-Department'}</DialogTitle>
              <DialogDescription>
                {subDeptEditItem ? 'Update sub-department details below.' : 'Fill in the details to create a new sub-department.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subdept-name">Name *</Label>
                <Input
                  id="subdept-name"
                  value={subDeptForm.name}
                  onChange={(e) => setSubDeptForm({ ...subDeptForm, name: e.target.value })}
                  placeholder="Sub-department name"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Department *</Label>
                <Select
                  value={subDeptForm.departmentId}
                  onValueChange={(value) => setSubDeptForm({ ...subDeptForm, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdept-head">Head</Label>
                <Input
                  id="subdept-head"
                  value={subDeptForm.head}
                  onChange={(e) => setSubDeptForm({ ...subDeptForm, head: e.target.value })}
                  placeholder="Sub-department head"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdept-description">Description</Label>
                <Textarea
                  id="subdept-description"
                  value={subDeptForm.description}
                  onChange={(e) => setSubDeptForm({ ...subDeptForm, description: e.target.value })}
                  placeholder="Sub-department description"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={subDeptForm.isActive}
                  onCheckedChange={(checked) => setSubDeptForm({ ...subDeptForm, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubDeptDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSubDept}
                disabled={subDeptSaving}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                {subDeptSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {subDeptEditItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══════════════ ROLE DIALOG ═══════════════ */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{roleEditItem ? 'Edit Role' : 'Add Role'}</DialogTitle>
              <DialogDescription>
                {roleEditItem ? 'Update role details below.' : 'Fill in the details to create a new role.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Name *</Label>
                <Input
                  id="role-name"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="Role name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role-level">Level</Label>
                  <Input
                    id="role-level"
                    type="number"
                    value={roleForm.level}
                    onChange={(e) => setRoleForm({ ...roleForm, level: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dashboard</Label>
                  <Select
                    value={roleForm.dashboard}
                    onValueChange={(value) => setRoleForm({ ...roleForm, dashboard: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dashboard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Role description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveRole}
                disabled={roleSaving}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                {roleSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {roleEditItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══════════════ EMPLOYEE TYPE DIALOG ═══════════════ */}
        <Dialog open={empTypeDialogOpen} onOpenChange={setEmpTypeDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{empTypeEditItem ? 'Edit Employee Type' : 'Add Employee Type'}</DialogTitle>
              <DialogDescription>
                {empTypeEditItem ? 'Update employee type details below.' : 'Fill in the details to create a new employee type.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emptype-name">Name *</Label>
                  <Input
                    id="emptype-name"
                    value={empTypeForm.name}
                    onChange={(e) => setEmpTypeForm({ ...empTypeForm, name: e.target.value })}
                    placeholder="e.g., Full-Time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emptype-code">Code</Label>
                  <Input
                    id="emptype-code"
                    value={empTypeForm.code}
                    onChange={(e) => setEmpTypeForm({ ...empTypeForm, code: e.target.value })}
                    placeholder="e.g., FT"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emptype-description">Description</Label>
                <Textarea
                  id="emptype-description"
                  value={empTypeForm.description}
                  onChange={(e) => setEmpTypeForm({ ...empTypeForm, description: e.target.value })}
                  placeholder="Employee type description"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={empTypeForm.isActive}
                  onCheckedChange={(checked) => setEmpTypeForm({ ...empTypeForm, isActive: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmpTypeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEmpType}
                disabled={empTypeSaving}
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                {empTypeSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {empTypeEditItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ═══════════════ DELETE CONFIRMATIONS ═══════════════ */}
        <AlertDialog open={!!branchDeleteId} onOpenChange={(open) => !open && setBranchDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Branch</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this branch? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBranch}
                disabled={branchDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {branchDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deptDeleteId} onOpenChange={(open) => !open && setDeptDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this department? This will also remove any associated sub-departments. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDept}
                disabled={deptDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deptDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!subDeptDeleteId} onOpenChange={(open) => !open && setSubDeptDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sub-Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this sub-department? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSubDept}
                disabled={subDeptDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {subDeptDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!roleDeleteId} onOpenChange={(open) => !open && setRoleDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this role? Users assigned to this role will need to be reassigned. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRole}
                disabled={roleDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {roleDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!empTypeDeleteId} onOpenChange={(open) => !open && setEmpTypeDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Employee Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this employee type? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteEmpType}
                disabled={empTypeDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {empTypeDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
