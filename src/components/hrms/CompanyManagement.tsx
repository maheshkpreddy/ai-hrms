'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search, Plus, Pencil, Trash2, Building2, Users, MapPin, Loader2,
  X, Check, Eye, Copy, Globe, Clock, FileText, Briefcase,
  CalendarDays, Shield, CreditCard, BarChart3, Brain,
  ChevronDown, ChevronRight, AlertTriangle, TrendingUp,
  TrendingDown, DollarSign, UserCheck, UserX, Settings,
  PartyPopper, Truck, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApi, apiPost, apiPatch, apiPut, apiDelete } from '@/lib/useApi'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/hooks/use-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompanyMaster {
  id: string
  name: string
  legalName: string | null
  code: string
  gstVat: string | null
  panTanCin: string | null
  registrationNumber: string | null
  industry: string | null
  industryType: string | null
  logo: string | null
  domain: string | null
  address: string | null
  country: string | null
  state: string | null
  city: string | null
  currency: string
  timezone: string
  payrollCycle: string | null
  financialYear: string | null
  defaultLanguage: string | null
  status: string
  parentId: string | null
  parent?: { id: string; name: string; code: string } | null
  parentName?: string
  children?: { id: string; name: string; code: string }[]
  _count?: {
    members?: number
    employees?: number
    departments?: number
    branches?: number
    companyPolicies?: number
    payrollStructures?: number
    workflowDefs?: number
    users?: number
  }
  createdAt: string
  updatedAt: string
}

interface CompanyMember {
  id: string
  companyId: string
  employeeId: string
  role: string
  status: string
  joinedAt: string | null
  createdAt: string
  employee: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
    email: string
    department: string | null
    designation: string | null
    avatar: string | null
  }
}

interface Department {
  id: string
  name: string
  head: string | null
  description: string | null
  budget: number | null
  companyId: string
  isActive: boolean
  company?: { id: string; name: string; code: string }
  createdAt: string
}

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
  companyId: string
  createdAt: string
}

interface PayrollStructure {
  id: string
  name: string
  basicPay: number
  hra: number
  da: number
  transportAllowance: number
  medicalAllowance: number
  specialAllowance: number
  pfEmployee: number
  pfEmployer: number
  esiEmployee: number
  esiEmployer: number
  taxDeduction: number
  companyId: string
  createdAt: string
}

interface LeaveType {
  id: string
  name: string
  code: string
  isPaid: boolean
  annualQuota: number
  carryForwardRule: string | null
  encashmentRule: string | null
  applicableGender: string | null
  applicableEmpType: string | null
  approvalRequired: boolean
  attachmentRequired: boolean
  companyId: string | null
  isActive: boolean
  createdAt: string
}

interface Holiday {
  id: string
  name: string
  date: string
  type: string
  description: string | null
  isRecurring: boolean
  companyId: string
  createdAt: string
}

interface ComplianceItem {
  id: string
  title: string
  description: string | null
  category: string
  dueDate: string | null
  status: string
  assignee: string | null
  companyId: string
  createdAt: string
}

interface Subscription {
  id: string | null
  companyId: string
  planName: string
  maxEmployees: number
  maxBranches: number
  features: string
  startDate: string | null
  endDate: string | null
  billingCycle: string
  amount: number
  currency: string
  status: string
  trialEndsAt: string | null
  autoRenew: boolean
}

interface CompanyDetail {
  id: string
  name: string
  payrollStructures: PayrollStructure[]
  companyPolicies: { id: string; title: string; category: string; status: string }[]
  _count: Record<string, number>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Real Estate', 'Media', 'Consulting', 'Logistics', 'Energy', 'Other',
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED', 'JPY']

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Singapore',
  'Asia/Tokyo', 'Australia/Sydney',
]

const PAYROLL_CYCLES = ['monthly', 'bi-monthly', 'semi-monthly', 'weekly']

const HOLIDAY_TYPES = ['public', 'optional', 'company', 'restricted']

const PLAN_FEATURES: Record<string, { label: string; maxEmployees: number; maxBranches: number; amount: number }> = {
  free: { label: 'Free', maxEmployees: 10, maxBranches: 1, amount: 0 },
  starter: { label: 'Starter', maxEmployees: 50, maxBranches: 3, amount: 29 },
  professional: { label: 'Professional', maxEmployees: 250, maxBranches: 10, amount: 79 },
  enterprise: { label: 'Enterprise', maxEmployees: 9999, maxBranches: 999, amount: 199 },
}

const MEMBER_ROLES = ['owner', 'hr', 'manager', 'employee']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const cfg: Record<string, { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    inactive: { label: 'Inactive', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
    removed: { label: 'Removed', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
    cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  }
  const c = cfg[status] || cfg.active
  return <Badge variant="secondary" className={`text-[11px] font-medium ${c.cls}`}>{c.label}</Badge>
}

function roleBadge(role: string) {
  const cfg: Record<string, { label: string; cls: string }> = {
    owner: { label: 'Owner', cls: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800' },
    hr: { label: 'HR', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800' },
    manager: { label: 'Manager', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' },
    employee: { label: 'Employee', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' },
  }
  const c = cfg[role] || cfg.employee
  return <Badge variant="outline" className={`text-[11px] font-medium ${c.cls}`}>{c.label}</Badge>
}

function severityBadge(severity: string) {
  const cfg: Record<string, { label: string; cls: string }> = {
    high: { label: 'High', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
    medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    low: { label: 'Low', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  }
  const c = cfg[severity] || cfg.low
  return <Badge variant="secondary" className={`text-[11px] font-medium ${c.cls}`}>{c.label}</Badge>
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    sky: 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
    rose: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color] || colorMap.emerald}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyManagement() {
  const { toast } = useToast()
  const { refreshCompanies } = useAppStore()

  // ── Global State ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('company-setup')
  const [globalCompanyId, setGlobalCompanyId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Companies ────────────────────────────────────────────────────────────
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false)
  const [companyEditId, setCompanyEditId] = useState<string | null>(null)
  const [companyDeleteId, setCompanyDeleteId] = useState<string | null>(null)
  const [companySaving, setCompanySaving] = useState(false)
  const [companyDeleting, setCompanyDeleting] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: '', legalName: '', code: '', industry: '', address: '',
    country: '', state: '', city: '', currency: 'USD', timezone: 'UTC',
    gstVat: '', panTanCin: '', registrationNumber: '', payrollCycle: 'monthly',
    financialYear: '', defaultLanguage: 'en', status: 'active', parentId: '',
  })

  // ── Admin Assignment ─────────────────────────────────────────────────────
  const [memberFilterStatus, setMemberFilterStatus] = useState('all')
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null)
  const [roleDialogMember, setRoleDialogMember] = useState<CompanyMember | null>(null)
  const [selectedRole, setSelectedRole] = useState('employee')

  // ── Departments & Branches ───────────────────────────────────────────────
  const [deptDialogOpen, setDeptDialogOpen] = useState(false)
  const [deptEditId, setDeptEditId] = useState<string | null>(null)
  const [deptDeleteId, setDeptDeleteId] = useState<string | null>(null)
  const [deptSaving, setDeptSaving] = useState(false)
  const [deptForm, setDeptForm] = useState({ name: '', head: '', description: '', budget: '' })

  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [branchEditId, setBranchEditId] = useState<string | null>(null)
  const [branchDeleteId, setBranchDeleteId] = useState<string | null>(null)
  const [branchSaving, setBranchSaving] = useState(false)
  const [branchForm, setBranchForm] = useState({
    name: '', code: '', address: '', city: '', state: '', country: '', pincode: '', phone: '', email: '', head: '',
  })

  // ── Payroll ──────────────────────────────────────────────────────────────
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false)
  const [payrollEditId, setPayrollEditId] = useState<string | null>(null)
  const [payrollDeleteId, setPayrollDeleteId] = useState<string | null>(null)
  const [payrollSaving, setPayrollSaving] = useState(false)
  const [payrollForm, setPayrollForm] = useState({
    name: '', basicPay: '0', hra: '0', da: '0', transportAllowance: '0',
    medicalAllowance: '0', specialAllowance: '0', pfEmployee: '0', pfEmployer: '0',
    esiEmployee: '0', esiEmployer: '0', taxDeduction: '0',
  })

  // ── Leave Policy ─────────────────────────────────────────────────────────
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveEditId, setLeaveEditId] = useState<string | null>(null)
  const [leaveDeleteId, setLeaveDeleteId] = useState<string | null>(null)
  const [leaveSaving, setLeaveSaving] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    name: '', code: '', isPaid: true, annualQuota: '0',
    carryForwardRule: '', approvalRequired: true, attachmentRequired: false,
  })

  // ── Holiday Calendar ─────────────────────────────────────────────────────
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false)
  const [holidayEditId, setHolidayEditId] = useState<string | null>(null)
  const [holidayDeleteId, setHolidayDeleteId] = useState<string | null>(null)
  const [holidaySaving, setHolidaySaving] = useState(false)
  const [holidayYear, setHolidayYear] = useState('2025')
  const [holidayForm, setHolidayForm] = useState({
    name: '', date: '', type: 'public', description: '', isRecurring: false,
  })

  // ── Compliance ───────────────────────────────────────────────────────────
  const [complianceDialogOpen, setComplianceDialogOpen] = useState(false)
  const [complianceEditId, setComplianceEditId] = useState<string | null>(null)
  const [complianceDeleteId, setComplianceDeleteId] = useState<string | null>(null)
  const [complianceSaving, setComplianceSaving] = useState(false)
  const [complianceForm, setComplianceForm] = useState({
    title: '', description: '', category: '', dueDate: '', status: 'pending', assignee: '',
  })

  // ── Subscription ─────────────────────────────────────────────────────────
  const [subscriptionSaving, setSubscriptionSaving] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('free')

  // ── API Data ─────────────────────────────────────────────────────────────
  const { data: companiesData, loading: companiesLoading, refetch: refetchCompanies } = useApi<{ records: CompanyMaster[] }>({
    baseUrl: '/api/masters/companies',
    params: { search: searchQuery || undefined },
  })

  const companies = companiesData?.records ?? []

  const { data: membersData, loading: membersLoading, refetch: refetchMembers } = useApi<{ members: CompanyMember[]; pagination: { total: number } }>({
    baseUrl: '/api/companies/members',
    params: {
      companyId: globalCompanyId || undefined,
      status: memberFilterStatus !== 'all' ? memberFilterStatus : undefined,
      limit: 100,
    },
    enabled: !!globalCompanyId,
  })

  const { data: deptData, loading: deptLoading, refetch: refetchDepts } = useApi<{ records: Department[] }>({
    baseUrl: '/api/masters/departments',
    params: { companyId: globalCompanyId || undefined },
    enabled: !!globalCompanyId,
  })

  const { data: branchData, loading: branchLoading, refetch: refetchBranches } = useApi<{ branches: Branch[] }>({
    baseUrl: '/api/masters/branches',
    params: { companyId: globalCompanyId || undefined },
    enabled: !!globalCompanyId,
  })

  const { data: companyDetail, refetch: refetchCompanyDetail } = useApi<CompanyDetail>({
    baseUrl: `/api/masters/companies/${globalCompanyId}`,
    enabled: !!globalCompanyId && activeTab === 'payroll',
  })

  const { data: leaveData, loading: leaveLoading, refetch: refetchLeaves } = useApi<{ records: LeaveType[] }>({
    baseUrl: '/api/masters/leave-types',
    params: { companyId: globalCompanyId || undefined },
    enabled: !!globalCompanyId,
  })

  const { data: holidayData, loading: holidayLoading, refetch: refetchHolidays } = useApi<{ records: Holiday[] }>({
    baseUrl: '/api/masters/holidays',
    params: { companyId: globalCompanyId || undefined, year: holidayYear },
    enabled: !!globalCompanyId,
  })

  const { data: complianceData, loading: complianceLoading, refetch: refetchCompliance } = useApi<{ data: ComplianceItem[]; overdueCount: number }>({
    baseUrl: '/api/compliance',
    params: { companyId: globalCompanyId || undefined, limit: 100 },
    enabled: !!globalCompanyId,
  })

  const { data: subscriptionData, loading: subscriptionLoading, refetch: refetchSubscription } = useApi<{ record: Subscription }>({
    baseUrl: '/api/masters/subscriptions',
    params: { companyId: globalCompanyId || undefined },
    enabled: !!globalCompanyId,
  })

  const { data: insightsData, loading: insightsLoading, refetch: refetchInsights } = useApi<Record<string, unknown>>({
    baseUrl: '/api/company-insights',
    params: { companyId: globalCompanyId || undefined, type: 'all' },
    enabled: !!globalCompanyId && (activeTab === 'reports' || activeTab === 'ai-insights'),
  })

  const { data: clientData } = useApi<{ data: { id: string; name: string; status: string; email: string | null; phone: string | null }[] }>({
    baseUrl: '/api/clients',
    params: { companyId: globalCompanyId || undefined, limit: 50 },
    enabled: !!globalCompanyId && activeTab === 'client-vendor',
  })

  const { data: vendorData } = useApi<{ data: { id: string; name: string; status: string; serviceType: string | null; rating: number | null }[] }>({
    baseUrl: '/api/vendors',
    params: { companyId: globalCompanyId || undefined, limit: 50 },
    enabled: !!globalCompanyId && activeTab === 'client-vendor',
  })

  const members = membersData?.members ?? []
  const departments = deptData?.records ?? []
  const branches = branchData?.branches ?? []
  const payrollStructures = companyDetail?.payrollStructures ?? []
  const leaveTypes = leaveData?.records ?? []
  const holidays = holidayData?.records ?? []
  const complianceItems = complianceData?.data ?? []
  const subscription = subscriptionData?.record ?? null

  // ── Auto-select first company ────────────────────────────────────────────
  useEffect(() => {
    if (!globalCompanyId && companies.length > 0) {
      setGlobalCompanyId(companies[0].id)
    }
  }, [companies, globalCompanyId])

  // ── Company CRUD ─────────────────────────────────────────────────────────

  function openCreateCompany() {
    setCompanyEditId(null)
    setCompanyForm({
      name: '', legalName: '', code: '', industry: '', address: '',
      country: '', state: '', city: '', currency: 'USD', timezone: 'UTC',
      gstVat: '', panTanCin: '', registrationNumber: '', payrollCycle: 'monthly',
      financialYear: '', defaultLanguage: 'en', status: 'active', parentId: '',
    })
    setCompanyDialogOpen(true)
  }

  function openEditCompany(c: CompanyMaster) {
    setCompanyEditId(c.id)
    setCompanyForm({
      name: c.name, legalName: c.legalName || '', code: c.code,
      industry: c.industry || c.industryType || '', address: c.address || '',
      country: c.country || '', state: c.state || '', city: c.city || '',
      currency: c.currency || 'USD', timezone: c.timezone || 'UTC',
      gstVat: c.gstVat || '', panTanCin: c.panTanCin || '',
      registrationNumber: c.registrationNumber || '', payrollCycle: c.payrollCycle || 'monthly',
      financialYear: c.financialYear || '', defaultLanguage: c.defaultLanguage || 'en',
      status: c.status, parentId: c.parentId || '',
    })
    setCompanyDialogOpen(true)
  }

  async function handleSaveCompany() {
    if (!companyForm.name || !companyForm.code) {
      toast({ title: 'Validation Error', description: 'Name and code are required.', variant: 'destructive' })
      return
    }
    setCompanySaving(true)
    try {
      const payload = {
        ...companyForm,
        industry: companyForm.industry || null,
        parentId: companyForm.parentId || null,
      }
      if (companyEditId) {
        await apiPut('/api/masters/companies', { id: companyEditId, ...payload })
        toast({ title: 'Company Updated', description: `${companyForm.name} updated successfully.` })
      } else {
        await apiPost('/api/masters/companies', payload)
        toast({ title: 'Company Created', description: `${companyForm.name} created successfully.` })
      }
      setCompanyDialogOpen(false)
      refetchCompanies()
      refreshCompanies()
      window.dispatchEvent(new CustomEvent('companies-updated'))
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save company', variant: 'destructive' })
    } finally {
      setCompanySaving(false)
    }
  }

  async function handleDeleteCompany() {
    if (!companyDeleteId) return
    setCompanyDeleting(true)
    try {
      await apiDelete(`/api/masters/companies?id=${companyDeleteId}`)
      toast({ title: 'Company Deleted', description: 'Company has been removed.', variant: 'destructive' })
      setCompanyDeleteId(null)
      refetchCompanies()
      refreshCompanies()
      window.dispatchEvent(new CustomEvent('companies-updated'))
      if (globalCompanyId === companyDeleteId) {
        setGlobalCompanyId('')
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to delete', variant: 'destructive' })
    } finally {
      setCompanyDeleting(false)
    }
  }

  async function handleToggleCompanyStatus(c: CompanyMaster) {
    try {
      const newStatus = c.status === 'active' ? 'inactive' : 'active'
      await apiPut('/api/masters/companies', { id: c.id, status: newStatus })
      toast({ title: 'Status Updated', description: `${c.name} is now ${newStatus}.` })
      refetchCompanies()
      refreshCompanies()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update status', variant: 'destructive' })
    }
  }

  // ── Member Actions ──────────────────────────────────────────────────────

  async function handleMemberAction(memberId: string, status: string, empName: string) {
    setMemberActionLoading(memberId)
    try {
      await apiPatch('/api/companies/members', { id: memberId, status })
      toast({ title: `Member ${status}`, description: `${empName} has been ${status}.` })
      refetchMembers()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setMemberActionLoading(null)
    }
  }

  async function handleAssignRole() {
    if (!roleDialogMember) return
    setMemberActionLoading(roleDialogMember.id)
    try {
      await apiPatch('/api/companies/members', { id: roleDialogMember.id, status: roleDialogMember.status, role: selectedRole })
      toast({ title: 'Role Updated', description: `Role set to ${selectedRole}.` })
      setRoleDialogMember(null)
      refetchMembers()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setMemberActionLoading(null)
    }
  }

  // ── Department CRUD ─────────────────────────────────────────────────────

  function openCreateDept() {
    setDeptEditId(null)
    setDeptForm({ name: '', head: '', description: '', budget: '' })
    setDeptDialogOpen(true)
  }

  function openEditDept(d: Department) {
    setDeptEditId(d.id)
    setDeptForm({ name: d.name, head: d.head || '', description: d.description || '', budget: d.budget?.toString() || '' })
    setDeptDialogOpen(true)
  }

  async function handleSaveDept() {
    if (!deptForm.name) {
      toast({ title: 'Validation Error', description: 'Department name is required.', variant: 'destructive' })
      return
    }
    setDeptSaving(true)
    try {
      const payload = {
        ...deptForm,
        companyId: globalCompanyId,
        head: deptForm.head || null,
        description: deptForm.description || null,
        budget: deptForm.budget ? parseFloat(deptForm.budget) : null,
      }
      if (deptEditId) {
        await apiPut('/api/masters/departments', { id: deptEditId, ...payload })
        toast({ title: 'Department Updated' })
      } else {
        await apiPost('/api/masters/departments', payload)
        toast({ title: 'Department Created' })
      }
      setDeptDialogOpen(false)
      refetchDepts()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setDeptSaving(false)
    }
  }

  async function handleDeleteDept() {
    if (!deptDeleteId) return
    try {
      await apiDelete(`/api/masters/departments/${deptDeleteId}`)
      toast({ title: 'Department Deleted', variant: 'destructive' })
      setDeptDeleteId(null)
      refetchDepts()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    }
  }

  // ── Branch CRUD ─────────────────────────────────────────────────────────

  function openCreateBranch() {
    setBranchEditId(null)
    setBranchForm({ name: '', code: '', address: '', city: '', state: '', country: '', pincode: '', phone: '', email: '', head: '' })
    setBranchDialogOpen(true)
  }

  function openEditBranch(b: Branch) {
    setBranchEditId(b.id)
    setBranchForm({
      name: b.name, code: b.code || '', address: b.address || '',
      city: b.city || '', state: b.state || '', country: b.country || '',
      pincode: b.pincode || '', phone: b.phone || '', email: b.email || '', head: b.head || '',
    })
    setBranchDialogOpen(true)
  }

  async function handleSaveBranch() {
    if (!branchForm.name) {
      toast({ title: 'Validation Error', description: 'Branch name is required.', variant: 'destructive' })
      return
    }
    setBranchSaving(true)
    try {
      const payload = {
        ...branchForm,
        companyId: globalCompanyId,
        code: branchForm.code || null,
        address: branchForm.address || null,
        city: branchForm.city || null,
        state: branchForm.state || null,
        country: branchForm.country || null,
        pincode: branchForm.pincode || null,
        phone: branchForm.phone || null,
        email: branchForm.email || null,
        head: branchForm.head || null,
      }
      if (branchEditId) {
        await apiPut(`/api/masters/branches/${branchEditId}`, payload)
        toast({ title: 'Branch Updated' })
      } else {
        await apiPost('/api/masters/branches', payload)
        toast({ title: 'Branch Created' })
      }
      setBranchDialogOpen(false)
      refetchBranches()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setBranchSaving(false)
    }
  }

  async function handleDeleteBranch() {
    if (!branchDeleteId) return
    try {
      await apiDelete(`/api/masters/branches/${branchDeleteId}`)
      toast({ title: 'Branch Deleted', variant: 'destructive' })
      setBranchDeleteId(null)
      refetchBranches()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    }
  }

  // ── Payroll Structure CRUD ───────────────────────────────────────────────

  function openCreatePayroll() {
    setPayrollEditId(null)
    setPayrollForm({ name: '', basicPay: '0', hra: '0', da: '0', transportAllowance: '0', medicalAllowance: '0', specialAllowance: '0', pfEmployee: '0', pfEmployer: '0', esiEmployee: '0', esiEmployer: '0', taxDeduction: '0' })
    setPayrollDialogOpen(true)
  }

  function openEditPayroll(p: PayrollStructure) {
    setPayrollEditId(p.id)
    setPayrollForm({
      name: p.name, basicPay: String(p.basicPay), hra: String(p.hra), da: String(p.da),
      transportAllowance: String(p.transportAllowance), medicalAllowance: String(p.medicalAllowance),
      specialAllowance: String(p.specialAllowance), pfEmployee: String(p.pfEmployee), pfEmployer: String(p.pfEmployer),
      esiEmployee: String(p.esiEmployee), esiEmployer: String(p.esiEmployer), taxDeduction: String(p.taxDeduction),
    })
    setPayrollDialogOpen(true)
  }

  async function handleSavePayroll() {
    if (!payrollForm.name) {
      toast({ title: 'Validation Error', description: 'Structure name is required.', variant: 'destructive' })
      return
    }
    setPayrollSaving(true)
    try {
      const payload = {
        ...Object.fromEntries(Object.entries(payrollForm).map(([k, v]) => [k, k === 'name' ? v : parseFloat(v) || 0])),
        companyId: globalCompanyId,
      }
      if (payrollEditId) {
        await apiPut(`/api/masters/companies/${globalCompanyId}/payroll-structures/${payrollEditId}`, payload)
        toast({ title: 'Payroll Structure Updated' })
      } else {
        await apiPost(`/api/masters/companies/${globalCompanyId}/payroll-structures`, payload)
        toast({ title: 'Payroll Structure Created' })
      }
      setPayrollDialogOpen(false)
      refetchCompanyDetail()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setPayrollSaving(false)
    }
  }

  // ── Leave Type CRUD ─────────────────────────────────────────────────────

  function openCreateLeave() {
    setLeaveEditId(null)
    setLeaveForm({ name: '', code: '', isPaid: true, annualQuota: '0', carryForwardRule: '', approvalRequired: true, attachmentRequired: false })
    setLeaveDialogOpen(true)
  }

  function openEditLeave(l: LeaveType) {
    setLeaveEditId(l.id)
    setLeaveForm({
      name: l.name, code: l.code, isPaid: l.isPaid, annualQuota: String(l.annualQuota),
      carryForwardRule: l.carryForwardRule || '', approvalRequired: l.approvalRequired, attachmentRequired: l.attachmentRequired,
    })
    setLeaveDialogOpen(true)
  }

  async function handleSaveLeave() {
    if (!leaveForm.name || !leaveForm.code) {
      toast({ title: 'Validation Error', description: 'Name and code are required.', variant: 'destructive' })
      return
    }
    setLeaveSaving(true)
    try {
      const payload = {
        ...leaveForm,
        annualQuota: parseInt(leaveForm.annualQuota) || 0,
        companyId: globalCompanyId,
        carryForwardRule: leaveForm.carryForwardRule || null,
      }
      if (leaveEditId) {
        await apiPut(`/api/masters/leave-types/${leaveEditId}`, payload)
        toast({ title: 'Leave Type Updated' })
      } else {
        await apiPost('/api/masters/leave-types', payload)
        toast({ title: 'Leave Type Created' })
      }
      setLeaveDialogOpen(false)
      refetchLeaves()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setLeaveSaving(false)
    }
  }

  async function handleDeleteLeave() {
    if (!leaveDeleteId) return
    try {
      await apiDelete(`/api/masters/leave-types/${leaveDeleteId}`)
      toast({ title: 'Leave Type Deleted', variant: 'destructive' })
      setLeaveDeleteId(null)
      refetchLeaves()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    }
  }

  // ── Holiday CRUD ────────────────────────────────────────────────────────

  function openCreateHoliday() {
    setHolidayEditId(null)
    setHolidayForm({ name: '', date: '', type: 'public', description: '', isRecurring: false })
    setHolidayDialogOpen(true)
  }

  function openEditHoliday(h: Holiday) {
    setHolidayEditId(h.id)
    setHolidayForm({
      name: h.name, date: h.date ? new Date(h.date).toISOString().split('T')[0] : '',
      type: h.type, description: h.description || '', isRecurring: h.isRecurring,
    })
    setHolidayDialogOpen(true)
  }

  async function handleSaveHoliday() {
    if (!holidayForm.name || !holidayForm.date) {
      toast({ title: 'Validation Error', description: 'Name and date are required.', variant: 'destructive' })
      return
    }
    setHolidaySaving(true)
    try {
      const payload = { ...holidayForm, companyId: globalCompanyId, description: holidayForm.description || null }
      if (holidayEditId) {
        await apiPut('/api/masters/holidays', { id: holidayEditId, ...payload })
        toast({ title: 'Holiday Updated' })
      } else {
        await apiPost('/api/masters/holidays', payload)
        toast({ title: 'Holiday Created' })
      }
      setHolidayDialogOpen(false)
      refetchHolidays()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setHolidaySaving(false)
    }
  }

  async function handleDeleteHoliday() {
    if (!holidayDeleteId) return
    try {
      await apiDelete(`/api/masters/holidays?id=${holidayDeleteId}`)
      toast({ title: 'Holiday Deleted', variant: 'destructive' })
      setHolidayDeleteId(null)
      refetchHolidays()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    }
  }

  // ── Compliance CRUD ─────────────────────────────────────────────────────

  function openCreateCompliance() {
    setComplianceEditId(null)
    setComplianceForm({ title: '', description: '', category: '', dueDate: '', status: 'pending', assignee: '' })
    setComplianceDialogOpen(true)
  }

  function openEditCompliance(c: ComplianceItem) {
    setComplianceEditId(c.id)
    setComplianceForm({
      title: c.title, description: c.description || '', category: c.category,
      dueDate: c.dueDate ? new Date(c.dueDate).toISOString().split('T')[0] : '',
      status: c.status, assignee: c.assignee || '',
    })
    setComplianceDialogOpen(true)
  }

  async function handleSaveCompliance() {
    if (!complianceForm.title || !complianceForm.category) {
      toast({ title: 'Validation Error', description: 'Title and category are required.', variant: 'destructive' })
      return
    }
    setComplianceSaving(true)
    try {
      const payload = {
        ...complianceForm,
        companyId: globalCompanyId,
        dueDate: complianceForm.dueDate || null,
        assignee: complianceForm.assignee || null,
        description: complianceForm.description || null,
      }
      if (complianceEditId) {
        await apiPut('/api/compliance', { id: complianceEditId, ...payload })
        toast({ title: 'Compliance Updated' })
      } else {
        await apiPost('/api/compliance', payload)
        toast({ title: 'Compliance Created' })
      }
      setComplianceDialogOpen(false)
      refetchCompliance()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setComplianceSaving(false)
    }
  }

  async function handleDeleteCompliance() {
    if (!complianceDeleteId) return
    try {
      await apiDelete(`/api/compliance?id=${complianceDeleteId}`)
      toast({ title: 'Compliance Deleted', variant: 'destructive' })
      setComplianceDeleteId(null)
      refetchCompliance()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    }
  }

  // ── Subscription Save ───────────────────────────────────────────────────

  async function handleSaveSubscription() {
    if (!globalCompanyId) return
    setSubscriptionSaving(true)
    try {
      const plan = PLAN_FEATURES[selectedPlan]
      await apiPost('/api/masters/subscriptions', {
        companyId: globalCompanyId,
        planName: selectedPlan,
        maxEmployees: plan.maxEmployees,
        maxBranches: plan.maxBranches,
        amount: plan.amount,
        currency: 'USD',
        billingCycle: 'monthly',
        autoRenew: true,
        features: JSON.stringify(['basic_hr', 'attendance', 'leave', ...(selectedPlan !== 'free' ? ['payroll', 'performance'] : []), ...(selectedPlan === 'professional' || selectedPlan === 'enterprise' ? ['analytics', 'ai'] : [])]),
      })
      toast({ title: 'Subscription Updated', description: `Plan changed to ${plan.label}.` })
      refetchSubscription()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' })
    } finally {
      setSubscriptionSaving(false)
    }
  }

  // ── Derived Stats ───────────────────────────────────────────────────────

  const selectedCompanyObj = companies.find(c => c.id === globalCompanyId)
  const totalEmployees = companies.reduce((a, c) => a + (c._count?.employees || 0), 0)
  const totalDepartments = companies.reduce((a, c) => a + (c._count?.departments || 0), 0)
  const totalBranches = companies.reduce((a, c) => a + (c._count?.branches || 0), 0)

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies
    const q = searchQuery.toLowerCase()
    return companies.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q))
  }, [companies, searchQuery])

  const pendingMembers = members.filter(m => m.status === 'pending')

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* ─── Header ─────────────────────────────────────────── */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Company Management</h1>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">{companies.length}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">Manage companies, structures, policies & insights</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* ── Company Context Selector ─────────────────────── */}
              <Select value={globalCompanyId} onValueChange={setGlobalCompanyId}>
                <SelectTrigger className="w-full sm:w-[260px]">
                  <Building2 className="mr-2 h-4 w-4 text-emerald-600" />
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-9 w-full pl-9 sm:w-[200px]" />
              </div>
              <Button onClick={openCreateCompany} className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                <Plus className="h-4 w-4" /> Add Company
              </Button>
            </div>
          </div>

          {/* ─── Stats ──────────────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Building2} label="Companies" value={companies.length} color="emerald" />
            <StatCard icon={Users} label="Total Employees" value={totalEmployees} color="sky" />
            <StatCard icon={Briefcase} label="Departments" value={totalDepartments} color="amber" />
            <StatCard icon={MapPin} label="Branches" value={totalBranches} color="violet" />
          </div>

          {/* ─── Tabs ───────────────────────────────────────────── */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6 overflow-x-auto">
              <TabsList className="flex-nowrap">
                <TabsTrigger value="company-setup" className="gap-1.5 text-xs sm:text-sm"><Building2 className="h-3.5 w-3.5" />Setup</TabsTrigger>
                <TabsTrigger value="admin-assignment" className="gap-1.5 text-xs sm:text-sm"><Users className="h-3.5 w-3.5" />Admins</TabsTrigger>
                <TabsTrigger value="dept-branch" className="gap-1.5 text-xs sm:text-sm"><Briefcase className="h-3.5 w-3.5" />Dept/Branch</TabsTrigger>
                <TabsTrigger value="payroll" className="gap-1.5 text-xs sm:text-sm"><DollarSign className="h-3.5 w-3.5" />Payroll</TabsTrigger>
                <TabsTrigger value="leave-policy" className="gap-1.5 text-xs sm:text-sm"><FileText className="h-3.5 w-3.5" />Leave</TabsTrigger>
                <TabsTrigger value="holidays" className="gap-1.5 text-xs sm:text-sm"><CalendarDays className="h-3.5 w-3.5" />Holidays</TabsTrigger>
                <TabsTrigger value="client-vendor" className="gap-1.5 text-xs sm:text-sm"><Truck className="h-3.5 w-3.5" />Clients/Vendors</TabsTrigger>
                <TabsTrigger value="compliance" className="gap-1.5 text-xs sm:text-sm"><Shield className="h-3.5 w-3.5" />Compliance</TabsTrigger>
                <TabsTrigger value="subscription" className="gap-1.5 text-xs sm:text-sm"><CreditCard className="h-3.5 w-3.5" />Plan</TabsTrigger>
                <TabsTrigger value="reports" className="gap-1.5 text-xs sm:text-sm"><BarChart3 className="h-3.5 w-3.5" />Reports</TabsTrigger>
                <TabsTrigger value="ai-insights" className="gap-1.5 text-xs sm:text-sm"><Brain className="h-3.5 w-3.5" />AI Insights</TabsTrigger>
              </TabsList>
            </div>

            {/* ═══════════ TAB 1: Company Setup ═══════════ */}
            <TabsContent value="company-setup">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Company Setup</CardTitle>
                    <Button onClick={openCreateCompany} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-3.5 w-3.5" /> New Company
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {companiesLoading ? <LoadingSpinner message="Loading companies..." /> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="pl-4">Company</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="hidden md:table-cell">Industry</TableHead>
                            <TableHead className="hidden lg:table-cell">Location</TableHead>
                            <TableHead>Employees</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCompanies.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="h-32 text-center"><EmptyState icon={Building2} title="No companies found" description="Create a new company or adjust your search" /></TableCell></TableRow>
                          ) : filteredCompanies.map(c => (
                            <TableRow key={c.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                    <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{c.name}</p>
                                    {c.legalName && <p className="text-muted-foreground truncate text-[11px]">{c.legalName}</p>}
                                    {c.parent && (
                                      <p className="text-muted-foreground text-[10px]">
                                        <ChevronRight className="mr-0.5 inline h-3 w-3" />
                                        Parent: {c.parent.name}
                                      </p>
                                    )}
                                    {c.children && c.children.length > 0 && (
                                      <p className="text-muted-foreground text-[10px]">
                                        <ChevronDown className="mr-0.5 inline h-3 w-3" />
                                        {c.children.length} subsidiary
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold">{c.code}</code>
                                  <Tooltip><TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-emerald-600" onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: 'Code Copied' }) }}>
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger><TooltipContent>Copy code</TooltipContent></Tooltip>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {c.industry || c.industryType ? <Badge variant="outline" className="text-[11px]">{c.industry || c.industryType}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <span className="text-muted-foreground text-xs">{[c.city, c.state, c.country].filter(Boolean).join(', ') || '—'}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm font-medium">{c._count?.employees || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Tooltip><TooltipTrigger asChild>
                                  <button onClick={() => handleToggleCompanyStatus(c)}>
                                    {statusBadge(c.status)}
                                  </button>
                                </TooltipTrigger><TooltipContent>Click to toggle status</TooltipContent></Tooltip>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:bg-sky-50" onClick={() => openEditCompany(c)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => setCompanyDeleteId(c.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══════════ TAB 2: Admin Assignment ═══════════ */}
            <TabsContent value="admin-assignment">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={Users} title="Select a Company" description="Choose a company from the dropdown above to manage admins" /></CardContent></Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="text-lg">Company Members &amp; Admins</CardTitle>
                      <div className="flex items-center gap-2">
                        {pendingMembers.length > 0 && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">{pendingMembers.length} Pending</Badge>}
                        <Select value={memberFilterStatus} onValueChange={setMemberFilterStatus}>
                          <SelectTrigger className="w-[140px]" size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {membersLoading ? <LoadingSpinner message="Loading members..." /> : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="pl-4">Employee</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="hidden md:table-cell">Joined</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {members.length === 0 ? (
                              <TableRow><TableCell colSpan={5} className="h-32 text-center"><EmptyState icon={Users} title="No members found" description="No members match the current filter" /></TableCell></TableRow>
                            ) : members.map(m => (
                              <TableRow key={m.id}>
                                <TableCell className="pl-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                      {m.employee.firstName[0]}{m.employee.lastName[0]}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium">{m.employee.firstName} {m.employee.lastName}</p>
                                      <p className="text-muted-foreground text-xs">{m.employee.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <button onClick={() => { setRoleDialogMember(m); setSelectedRole(m.role) }} className="hover:opacity-80">
                                    {roleBadge(m.role)}
                                  </button>
                                </TableCell>
                                <TableCell>{statusBadge(m.status)}</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                                  {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {m.status === 'pending' && (
                                      <>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" disabled={memberActionLoading === m.id} onClick={() => handleMemberAction(m.id, 'approved', `${m.employee.firstName} ${m.employee.lastName}`)} title="Approve"><Check className="h-3.5 w-3.5" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" disabled={memberActionLoading === m.id} onClick={() => handleMemberAction(m.id, 'rejected', `${m.employee.firstName} ${m.employee.lastName}`)} title="Reject"><X className="h-3.5 w-3.5" /></Button>
                                      </>
                                    )}
                                    {m.status === 'approved' && (
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" disabled={memberActionLoading === m.id} onClick={() => handleMemberAction(m.id, 'removed', `${m.employee.firstName} ${m.employee.lastName}`)} title="Remove"><UserX className="h-3.5 w-3.5" /></Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ═══════════ TAB 3: Departments & Branches ═══════════ */}
            <TabsContent value="dept-branch">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={Briefcase} title="Select a Company" description="Choose a company to manage departments & branches" /></CardContent></Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Departments */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Departments ({departments.length})</CardTitle>
                        <Button onClick={openCreateDept} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" /> Add</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {deptLoading ? <LoadingSpinner message="Loading..." /> : departments.length === 0 ? <EmptyState icon={Briefcase} title="No departments" description="Add departments for this company" /> : (
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader><TableRow className="bg-muted/50"><TableHead className="pl-4">Name</TableHead><TableHead className="hidden sm:table-cell">Head</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {departments.map(d => (
                                <TableRow key={d.id}>
                                  <TableCell className="pl-4"><p className="text-sm font-medium">{d.name}</p>{d.description && <p className="text-muted-foreground text-xs truncate max-w-[200px]">{d.description}</p>}</TableCell>
                                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{d.head || '—'}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600" onClick={() => openEditDept(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setDeptDeleteId(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Branches */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Branches ({branches.length})</CardTitle>
                        <Button onClick={openCreateBranch} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" /> Add</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {branchLoading ? <LoadingSpinner message="Loading..." /> : branches.length === 0 ? <EmptyState icon={MapPin} title="No branches" description="Add branches for this company" /> : (
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader><TableRow className="bg-muted/50"><TableHead className="pl-4">Name</TableHead><TableHead className="hidden sm:table-cell">City</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {branches.map(b => (
                                <TableRow key={b.id}>
                                  <TableCell className="pl-4"><p className="text-sm font-medium">{b.name}</p>{b.code && <p className="text-muted-foreground text-xs">{b.code}</p>}</TableCell>
                                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{b.city || '—'}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600" onClick={() => openEditBranch(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setBranchDeleteId(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ═══════════ TAB 4: Payroll Structure ═══════════ */}
            <TabsContent value="payroll">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={DollarSign} title="Select a Company" description="Choose a company to manage payroll structures" /></CardContent></Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Payroll Structures ({payrollStructures.length})</CardTitle>
                      <Button onClick={openCreatePayroll} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" /> Add Structure</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {payrollStructures.length === 0 ? <EmptyState icon={DollarSign} title="No payroll structures" description="Define payroll components for this company" /> : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="pl-4">Name</TableHead>
                              <TableHead>Basic</TableHead>
                              <TableHead>HRA</TableHead>
                              <TableHead>DA</TableHead>
                              <TableHead className="hidden lg:table-cell">PF (E)</TableHead>
                              <TableHead className="hidden lg:table-cell">PF (Er)</TableHead>
                              <TableHead className="hidden xl:table-cell">Tax</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payrollStructures.map(p => (
                              <TableRow key={p.id}>
                                <TableCell className="pl-4 font-medium text-sm">{p.name}</TableCell>
                                <TableCell className="text-sm">{p.basicPay.toLocaleString()}</TableCell>
                                <TableCell className="text-sm">{p.hra.toLocaleString()}</TableCell>
                                <TableCell className="text-sm">{p.da.toLocaleString()}</TableCell>
                                <TableCell className="hidden lg:table-cell text-sm">{p.pfEmployee.toLocaleString()}</TableCell>
                                <TableCell className="hidden lg:table-cell text-sm">{p.pfEmployer.toLocaleString()}</TableCell>
                                <TableCell className="hidden xl:table-cell text-sm">{p.taxDeduction.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600" onClick={() => openEditPayroll(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ═══════════ TAB 5: Leave Policy ═══════════ */}
            <TabsContent value="leave-policy">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={FileText} title="Select a Company" description="Choose a company to manage leave policies" /></CardContent></Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Leave Types ({leaveTypes.length})</CardTitle>
                      <Button onClick={openCreateLeave} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" /> Add Leave Type</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {leaveLoading ? <LoadingSpinner message="Loading..." /> : leaveTypes.length === 0 ? <EmptyState icon={FileText} title="No leave types" description="Define leave policies for this company" /> : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="pl-4">Name</TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Paid</TableHead>
                              <TableHead>Quota</TableHead>
                              <TableHead className="hidden md:table-cell">Carry Fwd</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {leaveTypes.map(l => (
                              <TableRow key={l.id}>
                                <TableCell className="pl-4 font-medium text-sm">{l.name}</TableCell>
                                <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{l.code}</code></TableCell>
                                <TableCell>{l.isPaid ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]">Paid</Badge> : <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px]">Unpaid</Badge>}</TableCell>
                                <TableCell className="text-sm">{l.annualQuota} days</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{l.carryForwardRule || 'None'}</TableCell>
                                <TableCell>{l.isActive ? statusBadge('active') : statusBadge('inactive')}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600" onClick={() => openEditLeave(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setLeaveDeleteId(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ═══════════ TAB 6: Holiday Calendar ═══════════ */}
            <TabsContent value="holidays">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={CalendarDays} title="Select a Company" description="Choose a company to manage holidays" /></CardContent></Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="text-lg">Holiday Calendar ({holidays.length})</CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={holidayYear} onValueChange={setHolidayYear}>
                          <SelectTrigger className="w-[100px]" size="sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['2024', '2025', '2026'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button onClick={openCreateHoliday} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" /> Add Holiday</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {holidayLoading ? <LoadingSpinner message="Loading..." /> : holidays.length === 0 ? <EmptyState icon={CalendarDays} title="No holidays" description={`No holidays defined for ${holidayYear}`} /> : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="pl-4">Name</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="hidden md:table-cell">Recurring</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {holidays.map(h => (
                              <TableRow key={h.id}>
                                <TableCell className="pl-4"><p className="text-sm font-medium">{h.name}</p>{h.description && <p className="text-muted-foreground text-xs truncate max-w-[200px]">{h.description}</p>}</TableCell>
                                <TableCell className="text-sm">{new Date(h.date).toLocaleDateString()}</TableCell>
                                <TableCell><Badge variant="outline" className="text-[11px] capitalize">{h.type}</Badge></TableCell>
                                <TableCell className="hidden md:table-cell">{h.isRecurring ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600" onClick={() => openEditHoliday(h)}><Pencil className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setHolidayDeleteId(h.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ═══════════ TAB 7: Client/Vendor Mapping ═══════════ */}
            <TabsContent value="client-vendor">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={Truck} title="Select a Company" description="Choose a company to view clients & vendors" /></CardContent></Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-lg">Clients ({clientData?.data?.length || 0})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      {!clientData?.data?.length ? <EmptyState icon={PartyPopper} title="No clients" description="No clients mapped to this company" /> : (
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader><TableRow className="bg-muted/50"><TableHead className="pl-4">Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {clientData.data.map(c => (
                                <TableRow key={c.id}>
                                  <TableCell className="pl-4"><p className="text-sm font-medium">{c.name}</p>{c.email && <p className="text-muted-foreground text-xs">{c.email}</p>}</TableCell>
                                  <TableCell>{statusBadge(c.status)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-lg">Vendors ({vendorData?.data?.length || 0})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      {!vendorData?.data?.length ? <EmptyState icon={Truck} title="No vendors" description="No vendors mapped to this company" /> : (
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader><TableRow className="bg-muted/50"><TableHead className="pl-4">Name</TableHead><TableHead>Service</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {vendorData.data.map(v => (
                                <TableRow key={v.id}>
                                  <TableCell className="pl-4"><p className="text-sm font-medium">{v.name}</p>{v.rating && <p className="text-muted-foreground text-xs">Rating: {v.rating}/5</p>}</TableCell>
                                  <TableCell className="text-muted-foreground text-xs">{v.serviceType || '—'}</TableCell>
                                  <TableCell>{statusBadge(v.status)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ═══════════ TAB 8: Compliance Settings ═══════════ */}
            <TabsContent value="compliance">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={Shield} title="Select a Company" description="Choose a company to manage compliance" /></CardContent></Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">Compliance Settings</CardTitle>
                        {complianceData?.overdueCount ? <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">{complianceData.overdueCount} Overdue</Badge> : null}
                      </div>
                      <Button onClick={openCreateCompliance} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" /> Add Item</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {complianceLoading ? <LoadingSpinner message="Loading..." /> : complianceItems.length === 0 ? <EmptyState icon={Shield} title="No compliance items" description="Add compliance items for this company" /> : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="pl-4">Title</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="hidden md:table-cell">Due Date</TableHead>
                              <TableHead className="hidden lg:table-cell">Assignee</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {complianceItems.map(c => {
                              const isOverdue = c.status === 'pending' && c.dueDate && new Date(c.dueDate) < new Date()
                              return (
                                <TableRow key={c.id} className={isOverdue ? 'bg-red-50/50 dark:bg-red-950/20' : ''}>
                                  <TableCell className="pl-4">
                                    <div className="flex items-center gap-2">
                                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                                      <p className="text-sm font-medium">{c.title}</p>
                                    </div>
                                    {c.description && <p className="text-muted-foreground text-xs truncate max-w-[200px]">{c.description}</p>}
                                  </TableCell>
                                  <TableCell><Badge variant="outline" className="text-[11px]">{c.category}</Badge></TableCell>
                                  <TableCell>{isOverdue ? statusBadge('overdue') : statusBadge(c.status)}</TableCell>
                                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '—'}</TableCell>
                                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{c.assignee || '—'}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600" onClick={() => openEditCompliance(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setComplianceDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
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
              )}
            </TabsContent>

            {/* ═══════════ TAB 9: Subscription/Package ═══════════ */}
            <TabsContent value="subscription">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={CreditCard} title="Select a Company" description="Choose a company to manage subscription" /></CardContent></Card>
              ) : subscriptionLoading ? <LoadingSpinner message="Loading subscription..." /> : (
                <div className="space-y-6">
                  {/* Current Plan */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subscription ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-muted-foreground text-xs">Plan</p>
                            <p className="text-xl font-bold capitalize">{subscription.planName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Max Employees</p>
                            <p className="text-xl font-bold">{subscription.maxEmployees}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Max Branches</p>
                            <p className="text-xl font-bold">{subscription.maxBranches}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Amount</p>
                            <p className="text-xl font-bold">{subscription.currency} {subscription.amount}/mo</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Billing Cycle</p>
                            <p className="text-xl font-bold capitalize">{subscription.billingCycle}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Auto Renew</p>
                            <p className="text-xl font-bold">{subscription.autoRenew ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      ) : <p className="text-muted-foreground">No subscription found.</p>}
                    </CardContent>
                  </Card>

                  {/* Plan Selection */}
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-lg">Change Plan</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(PLAN_FEATURES).map(([key, plan]) => (
                          <Card key={key} className={`cursor-pointer transition-all hover:border-emerald-400 ${selectedPlan === key ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800' : ''}`} onClick={() => setSelectedPlan(key)}>
                            <CardContent className="p-4">
                              <p className="font-bold">{plan.label}</p>
                              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${plan.amount}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <p>Up to {plan.maxEmployees} employees</p>
                                <p>Up to {plan.maxBranches} branches</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button onClick={handleSaveSubscription} disabled={subscriptionSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                          {subscriptionSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Save Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ═══════════ TAB 10: Reports ═══════════ */}
            <TabsContent value="reports">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={BarChart3} title="Select a Company" description="Choose a company to view reports" /></CardContent></Card>
              ) : insightsLoading ? <LoadingSpinner message="Generating insights..." /> : (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Users} label="Active Employees" value={((insightsData?.workforce as Record<string, unknown>)?.totalActive as number) ?? selectedCompanyObj?._count?.employees ?? 0} color="emerald" />
                    <StatCard icon={Briefcase} label="Departments" value={((insightsData?.workforce as Record<string, unknown>)?.departments as number) ?? selectedCompanyObj?._count?.departments ?? 0} color="sky" />
                    <StatCard icon={MapPin} label="Branches" value={((insightsData?.workforce as Record<string, unknown>)?.branches as number) ?? selectedCompanyObj?._count?.branches ?? 0} color="amber" />
                    <StatCard icon={FileText} label="Leave Policies" value={((insightsData?.workforce as Record<string, unknown>)?.leavePolicies as number) ?? 0} color="violet" />
                  </div>

                  {/* Department Distribution */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-lg">Department Distribution</CardTitle></CardHeader>
                      <CardContent>
                        {(() => {
                          const dist = (insightsData?.workforce as Record<string, unknown>)?.departmentDistribution as Record<string, number> | undefined
                          if (!dist || Object.keys(dist).length === 0) return <EmptyState icon={BarChart3} title="No data" description="No department data available" />
                          const maxVal = Math.max(...Object.values(dist))
                          return (
                            <div className="space-y-3">
                              {Object.entries(dist).map(([dept, count]) => (
                                <div key={dept} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{dept}</span>
                                    <span className="font-medium">{count as number}</span>
                                  </div>
                                  <Progress value={((count as number) / maxVal) * 100} className="h-2" />
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-lg">Employment Type Distribution</CardTitle></CardHeader>
                      <CardContent>
                        {(() => {
                          const dist = (insightsData?.workforce as Record<string, unknown>)?.employmentTypeDistribution as Record<string, number> | undefined
                          if (!dist || Object.keys(dist).length === 0) return <EmptyState icon={BarChart3} title="No data" description="No employment type data available" />
                          const total = Object.values(dist).reduce((a, b) => a + b, 0)
                          return (
                            <div className="space-y-3">
                              {Object.entries(dist).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <span className="text-sm">{type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{count as number}</span>
                                    <span className="text-muted-foreground text-xs">({Math.round(((count as number) / total) * 100)}%)</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payroll Summary */}
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-lg">Payroll Summary</CardTitle></CardHeader>
                    <CardContent>
                      {(() => {
                        const cost = insightsData?.cost as Record<string, unknown> | undefined
                        if (!cost) return <EmptyState icon={DollarSign} title="No payroll data" description="No cost prediction available" />
                        return (
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div><p className="text-muted-foreground text-xs">Avg Salary</p><p className="text-xl font-bold">{String(cost.currency || 'USD')} {Number(cost.averageSalary || 0).toLocaleString()}</p></div>
                            <div><p className="text-muted-foreground text-xs">Monthly Payroll</p><p className="text-xl font-bold">{String(cost.currency || 'USD')} {Number(cost.monthlyPayroll || 0).toLocaleString()}</p></div>
                            <div><p className="text-muted-foreground text-xs">Annual Payroll</p><p className="text-xl font-bold">{String(cost.currency || 'USD')} {Number(cost.annualPayroll || 0).toLocaleString()}</p></div>
                            <div><p className="text-muted-foreground text-xs">Total Projected Cost</p><p className="text-xl font-bold">{String(cost.currency || 'USD')} {Number(cost.totalProjectedCost || 0).toLocaleString()}</p></div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ═══════════ TAB 11: AI Insights ═══════════ */}
            <TabsContent value="ai-insights">
              {!globalCompanyId ? (
                <Card><CardContent className="py-16"><EmptyState icon={Brain} title="Select a Company" description="Choose a company to view AI insights" /></CardContent></Card>
              ) : insightsLoading ? <LoadingSpinner message="Generating AI insights..." /> : (
                <div className="space-y-6">
                  {/* Workforce Insights */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-emerald-600" /><CardTitle className="text-lg">Workforce Insights</CardTitle></div>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const wf = insightsData?.workforce as Record<string, unknown> | undefined
                        if (!wf) return <EmptyState icon={Brain} title="No data" description="Insufficient data for workforce analysis" />
                        return (
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Active Employees</p><p className="text-2xl font-bold">{String(wf.totalActive ?? 0)}</p></div>
                            <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Avg Tenure</p><p className="text-2xl font-bold">{String(wf.averageTenure ?? 0)} yrs</p></div>
                            <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Recent Hires (90d)</p><p className="text-2xl font-bold">{String(wf.recentHires ?? 0)}</p></div>
                            <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Payroll Structures</p><p className="text-2xl font-bold">{String(wf.payrollStructures ?? 0)}</p></div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Headcount Forecast */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-sky-600" /><CardTitle className="text-lg">Headcount Forecast</CardTitle></div>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const hc = insightsData?.headcount as Record<string, unknown> | undefined
                          if (!hc) return <EmptyState icon={TrendingUp} title="No data" description="Insufficient data" />
                          const forecast = hc.forecast as { month: string; projected: number; lowerBound: number; upperBound: number }[] | undefined
                          return (
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div><p className="text-muted-foreground text-xs">Current</p><p className="text-xl font-bold">{String(hc.currentHeadcount ?? 0)}</p></div>
                                <div><p className="text-muted-foreground text-xs">Growth Rate</p><p className="text-xl font-bold">{String(hc.monthlyGrowthRate ?? 0)}%</p></div>
                                <div><p className="text-muted-foreground text-xs">12mo Projected</p><p className="text-xl font-bold">{String(hc.projected12Months ?? 0)}</p></div>
                              </div>
                              {forecast && forecast.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {forecast.slice(0, 6).map(f => (
                                    <div key={f.month} className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">{f.month}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{f.projected}</span>
                                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>

                    {/* Compliance Risk */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-amber-600" /><CardTitle className="text-lg">Compliance Risk</CardTitle></div>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const comp = insightsData?.compliance as Record<string, unknown> | undefined
                          if (!comp) return <EmptyState icon={Shield} title="No data" description="Insufficient compliance data" />
                          const risks = comp.risks as { title: string; severity: string; description: string; recommendation: string }[] | undefined
                          return (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-muted-foreground text-xs">Score</p>
                                  <p className="text-3xl font-bold">{String(comp.complianceScore ?? 0)}</p>
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between text-sm"><span>High Risk</span><span className="font-medium text-red-600">{String(comp.highRiskCount ?? 0)}</span></div>
                                  <div className="flex items-center justify-between text-sm"><span>Medium Risk</span><span className="font-medium text-amber-600">{String(comp.mediumRiskCount ?? 0)}</span></div>
                                  <div className="flex items-center justify-between text-sm"><span>Low Risk</span><span className="font-medium text-emerald-600">{String(comp.lowRiskCount ?? 0)}</span></div>
                                </div>
                              </div>
                              {risks && risks.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {risks.map((r, i) => (
                                    <div key={i} className="flex items-start gap-2 rounded-lg border p-2">
                                      {severityBadge(r.severity)}
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium">{r.title}</p>
                                        <p className="text-muted-foreground text-[10px] truncate">{r.recommendation}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Attrition Trends */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-rose-600" /><CardTitle className="text-lg">Attrition Trends</CardTitle></div>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const attr = insightsData?.attrition as Record<string, unknown> | undefined
                        if (!attr) return <EmptyState icon={TrendingDown} title="No data" description="Insufficient attrition data" />
                        const monthly = attr.monthlyAttrition as { month: string; exits: number; rate: number }[] | undefined
                        const deptAttr = attr.departmentAttrition as Record<string, number> | undefined
                        const trend = attr.trend as string
                        return (
                          <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Total Exits (12mo)</p><p className="text-2xl font-bold">{String(attr.totalExits ?? 0)}</p></div>
                              <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Annual Attrition Rate</p><p className="text-2xl font-bold">{String(attr.annualAttritionRate ?? 0)}%</p></div>
                              <div className="rounded-lg border p-3">
                                <p className="text-muted-foreground text-xs">Trend</p>
                                <div className="flex items-center gap-1">
                                  {trend === 'increasing' ? <ArrowUpRight className="h-5 w-5 text-red-500" /> : trend === 'decreasing' ? <ArrowDownRight className="h-5 w-5 text-emerald-500" /> : <TrendingUp className="h-5 w-5 text-amber-500" />}
                                  <p className="text-xl font-bold capitalize">{trend || 'stable'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-2">
                              {monthly && monthly.length > 0 && (
                                <div>
                                  <p className="mb-2 text-sm font-medium">Monthly Attrition</p>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {monthly.map(m => (
                                      <div key={m.month} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{m.month}</span>
                                        <div className="flex items-center gap-2">
                                          <span>{m.exits} exits</span>
                                          <Badge variant="outline" className="text-[10px]">{m.rate}%</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {deptAttr && Object.keys(deptAttr).length > 0 && (
                                <div>
                                  <p className="mb-2 text-sm font-medium">By Department</p>
                                  <div className="space-y-1">
                                    {Object.entries(deptAttr).map(([dept, exits]) => (
                                      <div key={dept} className="flex items-center justify-between text-sm">
                                        <span>{dept}</span>
                                        <span className="font-medium">{exits as number} exits</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* Cost Prediction */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-emerald-600" /><CardTitle className="text-lg">Cost Prediction</CardTitle></div>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const cost = insightsData?.cost as Record<string, unknown> | undefined
                        if (!cost) return <EmptyState icon={DollarSign} title="No data" description="Insufficient cost data" />
                        const projections = cost.projections as Record<string, { rate: number; annual: number }> | undefined
                        const monthlyCost = cost.monthlyCost as { month: string; salary: number; benefits: number; overhead: number }[] | undefined
                        const cur = String(cost.currency || 'USD')
                        return (
                          <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Benefits Cost</p><p className="text-lg font-bold">{cur} {Number(cost.benefitsCost || 0).toLocaleString()}</p></div>
                              <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Overhead Cost</p><p className="text-lg font-bold">{cur} {Number(cost.overheadCost || 0).toLocaleString()}</p></div>
                              <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Total Projected</p><p className="text-lg font-bold">{cur} {Number(cost.totalProjectedCost || 0).toLocaleString()}</p></div>
                              <div className="rounded-lg border p-3"><p className="text-muted-foreground text-xs">Avg Salary</p><p className="text-lg font-bold">{cur} {Number(cost.averageSalary || 0).toLocaleString()}</p></div>
                            </div>
                            {projections && (
                              <div>
                                <p className="mb-2 text-sm font-medium">Growth Scenarios</p>
                                <div className="grid gap-2 sm:grid-cols-3">
                                  {Object.entries(projections).map(([scenario, data]) => (
                                    <div key={scenario} className="rounded-lg border p-3">
                                      <p className="text-xs font-medium capitalize">{scenario}</p>
                                      <p className="text-sm">+{Math.round(data.rate * 100)}% → {cur} {data.annual.toLocaleString()}/yr</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {monthlyCost && monthlyCost.length > 0 && (
                              <div>
                                <p className="mb-2 text-sm font-medium">Monthly Breakdown (Next 6mo)</p>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                  {monthlyCost.slice(0, 6).map(m => (
                                    <div key={m.month} className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">{m.month}</span>
                                      <div className="flex items-center gap-3 text-xs">
                                        <span>Salary: {cur} {m.salary.toLocaleString()}</span>
                                        <span>Benefits: {cur} {m.benefits.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ═══════════ DIALOGS ═══════════ */}

        {/* ── Company Create/Edit Dialog ── */}
        <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{companyEditId ? 'Edit Company' : 'Create Company'}</DialogTitle>
              <DialogDescription>{companyEditId ? 'Update company details.' : 'Add a new company to the system.'}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Company Name *</Label><Input value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" /></div>
                <div className="space-y-2"><Label>Legal Name</Label><Input value={companyForm.legalName} onChange={e => setCompanyForm(f => ({ ...f, legalName: e.target.value }))} placeholder="Acme Corporation Pvt. Ltd." /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Code *</Label><Input value={companyForm.code} onChange={e => setCompanyForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="ACME" /></div>
                <div className="space-y-2"><Label>Industry</Label>
                  <Select value={companyForm.industry} onValueChange={v => setCompanyForm(f => ({ ...f, industry: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Textarea value={companyForm.address} onChange={e => setCompanyForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" rows={2} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>City</Label><Input value={companyForm.city} onChange={e => setCompanyForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div className="space-y-2"><Label>State</Label><Input value={companyForm.state} onChange={e => setCompanyForm(f => ({ ...f, state: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Country</Label><Input value={companyForm.country} onChange={e => setCompanyForm(f => ({ ...f, country: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Currency</Label>
                  <Select value={companyForm.currency} onValueChange={v => setCompanyForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Timezone</Label>
                  <Select value={companyForm.timezone} onValueChange={v => setCompanyForm(f => ({ ...f, timezone: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMEZONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Payroll Cycle</Label>
                  <Select value={companyForm.payrollCycle} onValueChange={v => setCompanyForm(f => ({ ...f, payrollCycle: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYROLL_CYCLES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>GST/VAT</Label><Input value={companyForm.gstVat} onChange={e => setCompanyForm(f => ({ ...f, gstVat: e.target.value }))} /></div>
                <div className="space-y-2"><Label>PAN/TAN/CIN</Label><Input value={companyForm.panTanCin} onChange={e => setCompanyForm(f => ({ ...f, panTanCin: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Registration No.</Label><Input value={companyForm.registrationNumber} onChange={e => setCompanyForm(f => ({ ...f, registrationNumber: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Financial Year</Label><Input value={companyForm.financialYear} onChange={e => setCompanyForm(f => ({ ...f, financialYear: e.target.value }))} placeholder="Apr-Mar" /></div>
                <div className="space-y-2"><Label>Default Language</Label>
                  <Select value={companyForm.defaultLanguage} onValueChange={v => setCompanyForm(f => ({ ...f, defaultLanguage: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="hi">Hindi</SelectItem><SelectItem value="es">Spanish</SelectItem><SelectItem value="fr">French</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              {companyEditId && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Status</Label>
                    <Select value={companyForm.status} onValueChange={v => setCompanyForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Parent Company</Label>
                    <Select value={companyForm.parentId} onValueChange={v => setCompanyForm(f => ({ ...f, parentId: v }))}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {companies.filter(c => c.id !== companyEditId).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompanyDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCompany} disabled={companySaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                {companySaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {companyEditId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Company Delete Confirm ── */}
        <AlertDialog open={!!companyDeleteId} onOpenChange={() => setCompanyDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Company?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the company and all related data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCompany} disabled={companyDeleting} className="bg-red-600 hover:bg-red-700">{companyDeleting ? 'Deleting...' : 'Delete'}</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Role Assignment Dialog ── */}
        <Dialog open={!!roleDialogMember} onOpenChange={() => setRoleDialogMember(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Assign Role</DialogTitle><DialogDescription>Change role for {roleDialogMember?.employee.firstName} {roleDialogMember?.employee.lastName}</DialogDescription></DialogHeader>
            <div className="py-4">
              <Label>New Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{MEMBER_ROLES.map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogMember(null)}>Cancel</Button>
              <Button onClick={handleAssignRole} disabled={!!memberActionLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Department Dialog ── */}
        <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{deptEditId ? 'Edit Department' : 'Create Department'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Head</Label><Input value={deptForm.head} onChange={e => setDeptForm(f => ({ ...f, head: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
              <div className="space-y-2"><Label>Budget</Label><Input type="number" value={deptForm.budget} onChange={e => setDeptForm(f => ({ ...f, budget: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeptDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveDept} disabled={deptSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">{deptSaving && <Loader2 className="h-4 w-4 animate-spin" />}{deptEditId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Department Delete ── */}
        <AlertDialog open={!!deptDeleteId} onOpenChange={() => setDeptDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Department?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteDept} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Branch Dialog ── */}
        <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{branchEditId ? 'Edit Branch' : 'Create Branch'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Name *</Label><Input value={branchForm.name} onChange={e => setBranchForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Code</Label><Input value={branchForm.code} onChange={e => setBranchForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Textarea value={branchForm.address} onChange={e => setBranchForm(f => ({ ...f, address: e.target.value }))} rows={2} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>City</Label><Input value={branchForm.city} onChange={e => setBranchForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div className="space-y-2"><Label>State</Label><Input value={branchForm.state} onChange={e => setBranchForm(f => ({ ...f, state: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Country</Label><Input value={branchForm.country} onChange={e => setBranchForm(f => ({ ...f, country: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Pincode</Label><Input value={branchForm.pincode} onChange={e => setBranchForm(f => ({ ...f, pincode: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={branchForm.phone} onChange={e => setBranchForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={branchForm.email} onChange={e => setBranchForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div className="space-y-2"><Label>Branch Head</Label><Input value={branchForm.head} onChange={e => setBranchForm(f => ({ ...f, head: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveBranch} disabled={branchSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">{branchSaving && <Loader2 className="h-4 w-4 animate-spin" />}{branchEditId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Branch Delete ── */}
        <AlertDialog open={!!branchDeleteId} onOpenChange={() => setBranchDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Branch?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteBranch} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Payroll Structure Dialog ── */}
        <Dialog open={payrollDialogOpen} onOpenChange={setPayrollDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{payrollEditId ? 'Edit Payroll Structure' : 'Create Payroll Structure'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Structure Name *</Label><Input value={payrollForm.name} onChange={e => setPayrollForm(f => ({ ...f, name: e.target.value }))} placeholder="Standard Salary Structure" /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Basic Pay</Label><Input type="number" value={payrollForm.basicPay} onChange={e => setPayrollForm(f => ({ ...f, basicPay: e.target.value }))} /></div>
                <div className="space-y-2"><Label>HRA</Label><Input type="number" value={payrollForm.hra} onChange={e => setPayrollForm(f => ({ ...f, hra: e.target.value }))} /></div>
                <div className="space-y-2"><Label>DA</Label><Input type="number" value={payrollForm.da} onChange={e => setPayrollForm(f => ({ ...f, da: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Transport Allowance</Label><Input type="number" value={payrollForm.transportAllowance} onChange={e => setPayrollForm(f => ({ ...f, transportAllowance: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Medical Allowance</Label><Input type="number" value={payrollForm.medicalAllowance} onChange={e => setPayrollForm(f => ({ ...f, medicalAllowance: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Special Allowance</Label><Input type="number" value={payrollForm.specialAllowance} onChange={e => setPayrollForm(f => ({ ...f, specialAllowance: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>PF (Employee)</Label><Input type="number" value={payrollForm.pfEmployee} onChange={e => setPayrollForm(f => ({ ...f, pfEmployee: e.target.value }))} /></div>
                <div className="space-y-2"><Label>PF (Employer)</Label><Input type="number" value={payrollForm.pfEmployer} onChange={e => setPayrollForm(f => ({ ...f, pfEmployer: e.target.value }))} /></div>
                <div className="space-y-2"><Label>ESI (Employee)</Label><Input type="number" value={payrollForm.esiEmployee} onChange={e => setPayrollForm(f => ({ ...f, esiEmployee: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>ESI (Employer)</Label><Input type="number" value={payrollForm.esiEmployer} onChange={e => setPayrollForm(f => ({ ...f, esiEmployer: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Tax Deduction</Label><Input type="number" value={payrollForm.taxDeduction} onChange={e => setPayrollForm(f => ({ ...f, taxDeduction: e.target.value }))} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayrollDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePayroll} disabled={payrollSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">{payrollSaving && <Loader2 className="h-4 w-4 animate-spin" />}{payrollEditId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Leave Type Dialog ── */}
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{leaveEditId ? 'Edit Leave Type' : 'Create Leave Type'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Name *</Label><Input value={leaveForm.name} onChange={e => setLeaveForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Code *</Label><Input value={leaveForm.code} onChange={e => setLeaveForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Annual Quota (days)</Label><Input type="number" value={leaveForm.annualQuota} onChange={e => setLeaveForm(f => ({ ...f, annualQuota: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Carry Forward Rule</Label><Input value={leaveForm.carryForwardRule} onChange={e => setLeaveForm(f => ({ ...f, carryForwardRule: e.target.value }))} placeholder="e.g. max 5 days" /></div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Paid Leave</p><p className="text-muted-foreground text-xs">Employee receives pay during this leave</p></div>
                <Switch checked={leaveForm.isPaid} onCheckedChange={v => setLeaveForm(f => ({ ...f, isPaid: v }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Approval Required</p><p className="text-muted-foreground text-xs">Manager must approve before taking leave</p></div>
                <Switch checked={leaveForm.approvalRequired} onCheckedChange={v => setLeaveForm(f => ({ ...f, approvalRequired: v }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Attachment Required</p><p className="text-muted-foreground text-xs">Employee must upload document</p></div>
                <Switch checked={leaveForm.attachmentRequired} onCheckedChange={v => setLeaveForm(f => ({ ...f, attachmentRequired: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveLeave} disabled={leaveSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">{leaveSaving && <Loader2 className="h-4 w-4 animate-spin" />}{leaveEditId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Leave Delete ── */}
        <AlertDialog open={!!leaveDeleteId} onOpenChange={() => setLeaveDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Leave Type?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteLeave} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Holiday Dialog ── */}
        <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{holidayEditId ? 'Edit Holiday' : 'Create Holiday'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={holidayForm.name} onChange={e => setHolidayForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Date *</Label><Input type="date" value={holidayForm.date} onChange={e => setHolidayForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Type</Label>
                  <Select value={holidayForm.type} onValueChange={v => setHolidayForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{HOLIDAY_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={holidayForm.description} onChange={e => setHolidayForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Recurring Annually</p><p className="text-muted-foreground text-xs">This holiday repeats every year</p></div>
                <Switch checked={holidayForm.isRecurring} onCheckedChange={v => setHolidayForm(f => ({ ...f, isRecurring: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHolidayDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveHoliday} disabled={holidaySaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">{holidaySaving && <Loader2 className="h-4 w-4 animate-spin" />}{holidayEditId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Holiday Delete ── */}
        <AlertDialog open={!!holidayDeleteId} onOpenChange={() => setHolidayDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Holiday?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteHoliday} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Compliance Dialog ── */}
        <Dialog open={complianceDialogOpen} onOpenChange={setComplianceDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{complianceEditId ? 'Edit Compliance Item' : 'Create Compliance Item'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={complianceForm.title} onChange={e => setComplianceForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={complianceForm.description} onChange={e => setComplianceForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Category *</Label>
                  <Select value={complianceForm.category} onValueChange={v => setComplianceForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {['HR', 'IT', 'Finance', 'Legal', 'Safety', 'Tax', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={complianceForm.dueDate} onChange={e => setComplianceForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={complianceForm.status} onValueChange={v => setComplianceForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['pending', 'completed', 'overdue', 'cancelled'].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Assignee</Label><Input value={complianceForm.assignee} onChange={e => setComplianceForm(f => ({ ...f, assignee: e.target.value }))} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComplianceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCompliance} disabled={complianceSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">{complianceSaving && <Loader2 className="h-4 w-4 animate-spin" />}{complianceEditId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Compliance Delete ── */}
        <AlertDialog open={!!complianceDeleteId} onOpenChange={() => setComplianceDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete Compliance Item?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCompliance} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </TooltipProvider>
  )
}
