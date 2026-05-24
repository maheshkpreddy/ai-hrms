'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  Network,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Building2,
  Briefcase,
  FileText,
  Laptop,
  IndianRupee,
  EyeOff,
  X,
  User,
  Users,
  Loader2,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/useApi'
import { exportEmployeeReport } from '@/lib/excelExport'
import { useToast } from '@/hooks/use-toast'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  department: string
  designation: string
  jobTitle: string
  contractType: string
  status: string
  joinDate: string
  salary: number
  reportingTo: string | null
  bankAccount: string
  panNumber: string
  pfNumber: string
  avatar: string
}

interface Department {
  id: string
  name: string
  head: string
  budget: number
  count: number
}

interface Asset {
  id: string
  employeeId: string
  assetType: string
  assetName: string
  serialNo: string
  assignedDate: string
  condition: string
  status: string
}

interface EmployeeDocument {
  id: string
  employeeId: string
  name: string
  type: string
  uploadedDate: string
  status: string
}

interface EmployeesResponse {
  employees: Employee[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface DepartmentsResponse {
  departments: Department[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface AssetsResponse {
  assets: Asset[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface DocumentsResponse {
  documents: EmployeeDocument[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatCurrency(amount: number, masked: boolean): string {
  if (masked) {
    const formatted = new Intl.NumberFormat('en-IN').format(amount)
    return `₹${formatted.replace(/\d/g, 'X')}`
  }
  return `₹${new Intl.NumberFormat('en-IN').format(amount)}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    active: {
      label: 'Active',
      className:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    inactive: {
      label: 'Inactive',
      className:
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    },
    onboarding: {
      label: 'Onboarding',
      className:
        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
    exited: {
      label: 'Exited',
      className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    },
  }
  const cfg = config[status] || config.inactive
  return (
    <Badge variant="secondary" className={`text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

function getContractBadge(type: string) {
  const config: Record<string, { label: string; className: string }> = {
    'full-time': {
      label: 'Full-time',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    },
    'part-time': {
      label: 'Part-time',
      className:
        'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
    },
    contract: {
      label: 'Contract',
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    },
    intern: {
      label: 'Intern',
      className:
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
    },
  }
  const cfg = config[type] || config['full-time']
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

// ─── Detail Info Row ──────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmployeeManagement() {
  const { toast } = useToast()
  const { activeSubItem, setActiveSubItem } = useHRMSStore()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterContract, setFilterContract] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [salaryVisible, setSalaryVisible] = useState(false)
  const [orgChartOpen, setOrgChartOpen] = useState(false)
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)

  // Add Employee Form State
  const [addForm, setAddForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    department: '',
    designation: '',
    jobTitle: '',
    contractType: '',
    joinDate: '',
    reportingTo: '',
    salary: '',
    bankAccount: '',
    panNumber: '',
    pfNumber: '',
  })

  // Respond to sub-item navigation from sidebar
  useEffect(() => {
    if (activeSubItem) {
      switch (activeSubItem) {
        case 'add-employee':
          setEditingEmployeeId(null)
          setAddOpen(true)
          break
        case 'employee-list':
          // Default view - no special action needed
          break
        case 'departments':
          setOrgChartOpen(true)
          break
        default:
          break
      }
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem, setAddOpen, setEditingEmployeeId, setOrgChartOpen])

  // ── API hooks ─────────────────────────────────────────────────────────────

  // Employees list with server-side search, department, and status filters
  const {
    data: employeesData,
    loading: employeesLoading,
    error: employeesError,
    refetch: refetchEmployees,
  } = useApi<EmployeesResponse>({
    baseUrl: '/api/employees',
    params: {
      page: 1,
      limit: 100,
      department: filterDept !== 'all' ? filterDept : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      search: searchQuery || undefined,
    },
  })

  // Departments list
  const {
    data: departmentsData,
    loading: departmentsLoading,
  } = useApi<DepartmentsResponse>({
    baseUrl: '/api/departments',
    params: { limit: 100 },
  })

  // Assets for selected employee
  const {
    data: assetsData,
    loading: assetsLoading,
  } = useApi<AssetsResponse>({
    baseUrl: '/api/assets',
    params: { employeeId: selectedEmployee?.id, limit: 100 },
    enabled: !!selectedEmployee,
  })

  // Documents for selected employee
  const {
    data: documentsData,
    loading: documentsLoading,
  } = useApi<DocumentsResponse>({
    baseUrl: '/api/documents',
    params: { employeeId: selectedEmployee?.id, limit: 100 },
    enabled: !!selectedEmployee,
  })

  // Derived data from API responses
  const employees = employeesData?.employees ?? []
  const departments = departmentsData?.departments ?? []
  const selectedAssets = assetsData?.assets ?? []
  const selectedDocs = documentsData?.documents ?? []

  // Client-side contract type filter (API doesn't support it)
  const filteredEmployees = useMemo(() => {
    if (filterContract === 'all') return employees
    return employees.filter((emp) => emp.contractType === filterContract)
  }, [employees, filterContract])

  // Reporting manager lookup
  const reportingManager = selectedEmployee?.reportingTo
    ? employees.find((e) => e.id === selectedEmployee.reportingTo)
    : null

  // Org chart data
  const orgTree = useMemo(() => {
    const deptGroups = employees.reduce<Record<string, Employee[]>>((acc, emp) => {
      if (!acc[emp.department]) acc[emp.department] = []
      acc[emp.department].push(emp)
      return acc
    }, {})

    return departments
      .map((dept) => ({
        name: dept.name,
        head: dept.head,
        employees: deptGroups[dept.name] || [],
      }))
      .filter((d) => d.employees.length > 0)
  }, [employees, departments])

  // Active counts for badges
  const activeCount = employees.filter((e) => e.status === 'active').length
  const onboardingCount = employees.filter((e) => e.status === 'onboarding').length

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleView(emp: Employee) {
    setSelectedEmployee(emp)
    setSalaryVisible(false)
    setDetailOpen(true)
  }

  async function handleEdit(emp: Employee) {
    // Open a simple edit flow: populate the add form with existing data, reuse the dialog
    setAddForm({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      dateOfBirth: emp.dateOfBirth,
      gender: emp.gender,
      address: emp.address,
      department: emp.department,
      designation: emp.designation,
      jobTitle: emp.jobTitle,
      contractType: emp.contractType,
      joinDate: emp.joinDate,
      reportingTo: emp.reportingTo ?? '',
      salary: String(emp.salary),
      bankAccount: emp.bankAccount,
      panNumber: emp.panNumber,
      pfNumber: emp.pfNumber,
    })
    setEditingEmployeeId(emp.id)
    setAddOpen(true)
  }

  function handleDelete(id: string) {
    setDeleteConfirm(id)
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await apiDelete(`/api/employees/${deleteConfirm}`)
      toast({
        title: 'Employee Deleted',
        description: `Employee ${deleteConfirm} has been removed.`,
        variant: 'destructive',
      })
      setDeleteConfirm(null)
      refetchEmployees()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete employee',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  async function handleAddEmployee() {
    setSaving(true)
    try {
      // Auto-generate employeeId for new employees
      const nextEmpNum = (employeesData?.pagination?.total ?? 0) + 1
      const employeeId = `EMP${String(nextEmpNum).padStart(3, '0')}`

      const body = {
        ...addForm,
        employeeId: editingEmployeeId ? undefined : employeeId,
        dateOfBirth: addForm.dateOfBirth || undefined,
        salary: addForm.salary ? Number(addForm.salary) : 0,
        reportingTo: addForm.reportingTo || null,
      }

      if (editingEmployeeId) {
        await apiPut(`/api/employees/${editingEmployeeId}`, body)
        toast({
          title: 'Employee Updated',
          description: `${addForm.firstName} ${addForm.lastName} has been updated successfully.`,
        })
      } else {
        await apiPost('/api/employees', body)
        toast({
          title: 'Employee Added',
          description: `${addForm.firstName} ${addForm.lastName} has been added successfully.`,
        })
      }

      setAddOpen(false)
      setEditingEmployeeId(null)
      setAddForm({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        department: '',
        designation: '',
        jobTitle: '',
        contractType: '',
        joinDate: '',
        reportingTo: '',
        salary: '',
        bankAccount: '',
        panNumber: '',
        pfNumber: '',
      })
      refetchEmployees()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save employee',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  function toggleDept(name: string) {
    setExpandedDepts((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  // Reset editing state when dialog closes
  const handleAddDialogChange = useCallback((open: boolean) => {
    setAddOpen(open)
    if (!open) {
      setEditingEmployeeId(null)
      setAddForm({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        department: '',
        designation: '',
        jobTitle: '',
        contractType: '',
        joinDate: '',
        reportingTo: '',
        salary: '',
        bankAccount: '',
        panNumber: '',
        pfNumber: '',
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Employee Management
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  {employeesData?.pagination?.total ?? employees.length}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {activeCount} active · {onboardingCount} onboarding
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 sm:w-[260px]"
              />
            </div>
            <Button
              onClick={() => setOrgChartOpen(!orgChartOpen)}
              variant="outline"
              className="gap-2"
            >
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Org Chart</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportEmployeeReport(filteredEmployees.map((e) => ({
                employeeId: e.employeeId,
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                phone: e.phone,
                department: e.department,
                designation: e.designation,
                jobTitle: e.jobTitle,
                status: e.status,
                joinDate: e.joinDate,
                salary: e.salary,
              })))}
              disabled={filteredEmployees.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              onClick={() => {
                setEditingEmployeeId(null)
                setAddOpen(true)
              }}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* ─── Filter Bar ─────────────────────────────────────────── */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium whitespace-nowrap">
                  Filters:
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="w-full sm:w-[180px]" size="sm">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="exited">Exited</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterContract}
                  onValueChange={setFilterContract}
                >
                  <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                    <SelectValue placeholder="Contract Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filterDept !== 'all' ||
                filterStatus !== 'all' ||
                filterContract !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => {
                    setFilterDept('all')
                    setFilterStatus('all')
                    setFilterContract('all')
                  }}
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Org Chart ──────────────────────────────────────────── */}
        {orgChartOpen && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Network className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Organizational Chart
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOrgChartOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-1">
                  {/* Root node */}
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/50">
                    <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Organization
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400"
                    >
                      {employees.length} employees
                    </Badge>
                  </div>

                  {/* Department nodes */}
                  <div className="ml-4 space-y-1 border-l-2 border-emerald-200 pl-4 dark:border-emerald-800">
                    {orgTree.map((dept) => (
                      <div key={dept.name}>
                        <button
                          onClick={() => toggleDept(dept.name)}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/50"
                        >
                          {expandedDepts.has(dept.name) ? (
                            <ChevronDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {dept.name}
                          </span>
                          <Badge variant="secondary" className="ml-auto text-[10px]">
                            {dept.employees.length}
                          </Badge>
                        </button>
                        {expandedDepts.has(dept.name) && (
                          <div className="ml-6 space-y-0.5 border-l border-muted pl-4">
                            {dept.employees.map((emp) => (
                              <div
                                key={emp.id}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
                              >
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                  {getInitials(emp.firstName, emp.lastName)}
                                </div>
                                <span className="truncate">
                                  {emp.firstName} {emp.lastName}
                                </span>
                                <span className="text-muted-foreground ml-auto text-xs">
                                  {emp.designation}
                                </span>
                                {getStatusBadge(emp.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* ─── Employee Table ──────────────────────────────────────── */}
        <Card>
          <CardContent className="p-0">
            {employeesLoading ? (
              <LoadingSpinner message="Loading employees..." />
            ) : employeesError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <p className="text-destructive text-sm">{employeesError}</p>
                <Button variant="outline" size="sm" onClick={refetchEmployees}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="pl-4">Employee</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Department
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Designation
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Contract Type
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden xl:table-cell">
                        Join Date
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                            <p>No employees found</p>
                            <p className="text-xs">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <TableRow key={emp.id} className="group">
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                {getInitials(emp.firstName, emp.lastName)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {emp.firstName} {emp.lastName}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                  {emp.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                              {emp.employeeId}
                            </code>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm">{emp.department}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm">{emp.designation}</span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {getContractBadge(emp.contractType)}
                          </TableCell>
                          <TableCell>{getStatusBadge(emp.status)}</TableCell>
                          <TableCell className="hidden xl:table-cell text-sm">
                            {formatDate(emp.joinDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                onClick={() => handleView(emp)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                onClick={() => handleEdit(emp)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                onClick={() => handleDelete(emp.id)}
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

            {/* Table Footer */}
            {!employeesLoading && !employeesError && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-sm">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {filteredEmployees.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-foreground">
                    {employeesData?.pagination?.total ?? employees.length}
                  </span>{' '}
                  employees
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Employee Detail Sheet ────────────────────────────────── */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                {selectedEmployee
                  ? getInitials(
                      selectedEmployee.firstName,
                      selectedEmployee.lastName,
                    )
                  : ''}
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                </p>
                <p className="text-muted-foreground text-sm font-normal">
                  {selectedEmployee?.designation} · {selectedEmployee?.employeeId}
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>

          {selectedEmployee && (
            <div className="space-y-6 pb-8">
              {/* Status & Contract */}
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedEmployee.status)}
                {getContractBadge(selectedEmployee.contractType)}
              </div>

              <Separator />

              {/* Personal Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2">
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={selectedEmployee.email}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={selectedEmployee.phone}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Date of Birth"
                    value={formatDate(selectedEmployee.dateOfBirth)}
                  />
                  <InfoRow
                    icon={Shield}
                    label="Gender"
                    value={selectedEmployee.gender}
                  />
                </div>
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={selectedEmployee.address}
                />
              </div>

              <Separator />

              {/* Employment Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <Briefcase className="h-4 w-4" />
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2">
                  <InfoRow
                    icon={Building2}
                    label="Department"
                    value={selectedEmployee.department}
                  />
                  <InfoRow
                    icon={Briefcase}
                    label="Designation"
                    value={selectedEmployee.designation}
                  />
                  <InfoRow
                    icon={User}
                    label="Job Title"
                    value={selectedEmployee.jobTitle}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Join Date"
                    value={formatDate(selectedEmployee.joinDate)}
                  />
                  <InfoRow
                    icon={FileText}
                    label="Contract Type"
                    value={
                      selectedEmployee.contractType.charAt(0).toUpperCase() +
                      selectedEmployee.contractType.slice(1)
                    }
                  />
                  <InfoRow
                    icon={User}
                    label="Reporting To"
                    value={
                      reportingManager
                        ? `${reportingManager.firstName} ${reportingManager.lastName}`
                        : 'None'
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Financial Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <IndianRupee className="h-4 w-4" />
                  Financial Information
                  <button
                    onClick={() => setSalaryVisible(!salaryVisible)}
                    className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {salaryVisible ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {salaryVisible ? 'Hide' : 'Show'}
                  </button>
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2">
                  <InfoRow
                    icon={IndianRupee}
                    label="Annual Salary"
                    value={formatCurrency(selectedEmployee.salary, !salaryVisible)}
                  />
                  <InfoRow
                    icon={Building2}
                    label="Bank Account"
                    value={selectedEmployee.bankAccount}
                  />
                  <InfoRow
                    icon={FileText}
                    label="PAN Number"
                    value={selectedEmployee.panNumber}
                  />
                  <InfoRow
                    icon={FileText}
                    label="PF Number"
                    value={selectedEmployee.pfNumber}
                  />
                </div>
              </div>

              <Separator />

              {/* Assets */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <Laptop className="h-4 w-4" />
                  Assigned Assets
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {selectedAssets.length}
                  </Badge>
                </h3>
                {assetsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : selectedAssets.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No assets assigned
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950">
                          <Laptop className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            {asset.assetName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {asset.assetType} · {asset.serialNo}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            asset.condition === 'new'
                              ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                              : asset.condition === 'good'
                                ? 'border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-400'
                                : 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400'
                          }
                        >
                          {asset.condition}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Documents */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <FileText className="h-4 w-4" />
                  Documents
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {selectedDocs.length}
                  </Badge>
                </h3>
                {documentsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : selectedDocs.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No documents uploaded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 dark:bg-amber-950">
                          <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {doc.type} · Uploaded {formatDate(doc.uploadedDate)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            doc.status === 'verified'
                              ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                              : 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400'
                          }
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Add / Edit Employee Dialog ────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={handleAddDialogChange}>
        <DialogContent className="max-h-[85vh] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {editingEmployeeId ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployeeId
                ? 'Update the employee details below.'
                : 'Fill in the details to add a new employee to the system.'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="personal" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="personal" className="flex-1">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex-1">
                Employment Info
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex-1">
                Financial Info
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="mt-4">
              <ScrollArea className="max-h-[50vh]">
                <div className="grid grid-cols-1 gap-4 pr-2 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID {!editingEmployeeId && '*'}</Label>
                    <Input
                      id="employeeId"
                      placeholder="e.g. EMP021 (auto-generated if blank)"
                      value={addForm.employeeId}
                      onChange={(e) =>
                        setAddForm({ ...addForm, employeeId: e.target.value })
                      }
                      disabled={!!editingEmployeeId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={addForm.firstName}
                      onChange={(e) =>
                        setAddForm({ ...addForm, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={addForm.lastName}
                      onChange={(e) =>
                        setAddForm({ ...addForm, lastName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@company.com"
                      value={addForm.email}
                      onChange={(e) =>
                        setAddForm({ ...addForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="+91-XXXXXXXXXX"
                      value={addForm.phone}
                      onChange={(e) =>
                        setAddForm({ ...addForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={addForm.dateOfBirth}
                      onChange={(e) =>
                        setAddForm({ ...addForm, dateOfBirth: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={addForm.gender}
                      onValueChange={(v) =>
                        setAddForm({ ...addForm, gender: v })
                      }
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter full address"
                      value={addForm.address}
                      onChange={(e) =>
                        setAddForm({ ...addForm, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Employment Info Tab */}
            <TabsContent value="employment" className="mt-4">
              <ScrollArea className="max-h-[50vh]">
                <div className="grid grid-cols-1 gap-4 pr-2 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={addForm.department}
                      onValueChange={(v) =>
                        setAddForm({ ...addForm, department: v })
                      }
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation *</Label>
                    <Input
                      id="designation"
                      placeholder="e.g. Software Engineer"
                      value={addForm.designation}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          designation: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Full Stack Developer"
                      value={addForm.jobTitle}
                      onChange={(e) =>
                        setAddForm({ ...addForm, jobTitle: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type *</Label>
                    <Select
                      value={addForm.contractType}
                      onValueChange={(v) =>
                        setAddForm({ ...addForm, contractType: v })
                      }
                    >
                      <SelectTrigger id="contractType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Join Date *</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={addForm.joinDate}
                      onChange={(e) =>
                        setAddForm({ ...addForm, joinDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportingTo">Reporting To</Label>
                    <Select
                      value={addForm.reportingTo}
                      onValueChange={(v) =>
                        setAddForm({ ...addForm, reportingTo: v })
                      }
                    >
                      <SelectTrigger id="reportingTo">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees
                          .filter(
                            (e) =>
                              e.status === 'active' &&
                              e.contractType === 'full-time',
                          )
                          .map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.firstName} {e.lastName} — {e.designation}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Financial Info Tab */}
            <TabsContent value="financial" className="mt-4">
              <ScrollArea className="max-h-[50vh]">
                <div className="grid grid-cols-1 gap-4 pr-2 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Annual Salary (₹)</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="e.g. 1200000"
                      value={addForm.salary}
                      onChange={(e) =>
                        setAddForm({ ...addForm, salary: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bank Account</Label>
                    <Input
                      id="bankAccount"
                      placeholder="XXXX-XXXX-XXXX"
                      value={addForm.bankAccount}
                      onChange={(e) =>
                        setAddForm({ ...addForm, bankAccount: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      placeholder="e.g. ABCDE1234F"
                      value={addForm.panNumber}
                      onChange={(e) =>
                        setAddForm({ ...addForm, panNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pfNumber">PF Number</Label>
                    <Input
                      id="pfNumber"
                      placeholder="e.g. PF/XXX/YYYY"
                      value={addForm.pfNumber}
                      onChange={(e) =>
                        setAddForm({ ...addForm, pfNumber: e.target.value })
                      }
                    />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => handleAddDialogChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEmployee}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {editingEmployeeId ? 'Save Changes' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ──────────────────────────────────── */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete employee{' '}
              <span className="font-semibold text-foreground">
                {deleteConfirm}
              </span>
              ? This action cannot be undone. All associated data including
              attendance records, payroll history, and documents will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
