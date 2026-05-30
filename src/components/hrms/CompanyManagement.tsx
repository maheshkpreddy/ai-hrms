'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  Clock,
  MapPin,
  Loader2,
  X,
  Check,
  UserPlus,
  LogIn,
  ArrowRightLeft,
  Eye,
  Copy,
  Phone,
  Mail,
  Globe,
  MapPinned,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { useHRMSStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: string
  name: string
  code: string
  description: string | null
  industry: string | null
  website: string | null
  logo: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  pincode: string | null
  phone: string | null
  email: string | null
  foundedYear: string | null
  employeeCount: number | null
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    members: number
    officeLocations: number
  }
}

interface MemberEmployee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  email: string
  department: string | null
  designation: string | null
  avatar: string | null
}

interface CompanyMember {
  id: string
  companyId: string
  employeeId: string
  role: string
  status: string
  joinedAt: string | null
  createdAt: string
  updatedAt: string
  employee: MemberEmployee
}

interface OfficeLocation {
  id: string
  companyId: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  company?: { id: string; name: string }
}

interface CompaniesResponse {
  companies?: Company[]
  data?: Company[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface MembersResponse {
  members: CompanyMember[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface LocationsResponse {
  locations: OfficeLocation[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// ─── Industry Options ─────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Media',
  'Consulting',
  'Logistics',
  'Energy',
  'Other',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    active: {
      label: 'Active',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    inactive: {
      label: 'Inactive',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    },
  }
  const cfg = config[status] || config.active
  return (
    <Badge variant="secondary" className={`text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

function getMemberStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
    approved: {
      label: 'Approved',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    },
    removed: {
      label: 'Removed',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    },
  }
  const cfg = config[status] || config.pending
  return (
    <Badge variant="secondary" className={`text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

function getRoleBadge(role: string) {
  const config: Record<string, { label: string; className: string }> = {
    owner: {
      label: 'Owner',
      className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
    },
    hr: {
      label: 'HR',
      className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
    },
    manager: {
      label: 'Manager',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    },
    employee: {
      label: 'Employee',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    },
  }
  const cfg = config[role] || config.employee
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
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

function EmptyState({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/50" />
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyManagement() {
  const { toast } = useToast()
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const { data: session } = useSession()
  const employeeId = (session?.user as any)?.employeeId || ''

  // ── Tab State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('companies')

  // Respond to sub-item navigation from sidebar
  useEffect(() => {
    if (activeSubItem) {
      switch (activeSubItem) {
        case 'company-info':
          setActiveTab('companies')
          break
        case 'branches':
          setActiveTab('locations')
          break
        case 'policies':
          setActiveTab('policies')
          break
        default:
          break
      }
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // ── Company State ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // ── Join Company State ────────────────────────────────────────────────────
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)

  // ── Members State ─────────────────────────────────────────────────────────
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [memberFilterStatus, setMemberFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── Office Location State ─────────────────────────────────────────────────
  const [locationCompanyId, setLocationCompanyId] = useState<string>('')
  const [addLocationOpen, setAddLocationOpen] = useState(false)
  const [editLocationOpen, setEditLocationOpen] = useState(false)
  const [deleteLocationConfirm, setDeleteLocationConfirm] = useState<string | null>(null)
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationDeleting, setLocationDeleting] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<OfficeLocation | null>(null)

  // ── Create Form ───────────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
  })

  // ── Edit Form ─────────────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    description: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone: '',
    email: '',
    isActive: true,
  })

  // ── Add Location Form ─────────────────────────────────────────────────────
  const [locationForm, setLocationForm] = useState({
    companyId: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '500',
  })

  // ── API hooks ─────────────────────────────────────────────────────────────

  const {
    data: companiesData,
    loading: companiesLoading,
    error: companiesError,
    refetch: refetchCompanies,
  } = useApi<CompaniesResponse>({
    baseUrl: '/api/companies',
    params: {
      page: 1,
      limit: 100,
      search: searchQuery || undefined,
      industry: filterIndustry !== 'all' ? filterIndustry : undefined,
      isActive: filterStatus !== 'all' ? filterStatus : undefined,
    },
  })

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useApi<MembersResponse>({
    baseUrl: '/api/companies/members',
    params: {
      companyId: selectedCompanyId || undefined,
      status: memberFilterStatus !== 'all' ? memberFilterStatus : undefined,
      page: 1,
      limit: 100,
    },
    enabled: !!selectedCompanyId,
  })

  const {
    data: locationsData,
    loading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useApi<LocationsResponse>({
    baseUrl: '/api/office-locations',
    params: {
      companyId: locationCompanyId || undefined,
      page: 1,
      limit: 100,
    },
    enabled: !!locationCompanyId,
  })

  const companies = companiesData?.companies ?? companiesData?.data ?? []
  const members = membersData?.members ?? []
  const locations = locationsData?.locations ?? []

  // ── Derived Stats ─────────────────────────────────────────────────────────

  const totalCompanies = companies.length
  const totalMembers = companies.reduce((acc, c) => acc + (c._count?.members || 0), 0)
  const pendingRequests = members.filter((m) => m.status === 'pending').length
  const totalLocations = companies.reduce((acc, c) => acc + (c._count?.officeLocations || 0), 0)

  // ── Company Handlers ──────────────────────────────────────────────────────

  const handleCreateDialogChange = useCallback((open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      setCreateForm({
        name: '',
        description: '',
        industry: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
      })
    }
  }, [])

  async function handleCreateCompany() {
    if (!createForm.name) {
      toast({ title: 'Validation Error', description: 'Company name is required.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/companies', {
        name: createForm.name,
        description: createForm.description || null,
        industry: createForm.industry || null,
        website: createForm.website || null,
        address: createForm.address || null,
        city: createForm.city || null,
        state: createForm.state || null,
        country: createForm.country || null,
        phone: createForm.phone || null,
        email: createForm.email || null,
        createdBy: employeeId || null,
      })
      toast({
        title: 'Company Created',
        description: `${createForm.name} has been created successfully. A unique join code has been generated.`,
      })
      setCreateOpen(false)
      setCreateForm({
        name: '',
        description: '',
        industry: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
      })
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create company',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(company: Company) {
    setSelectedCompany(company)
    setEditForm({
      id: company.id,
      name: company.name,
      description: company.description || '',
      industry: company.industry || '',
      website: company.website || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || '',
      phone: company.phone || '',
      email: company.email || '',
      isActive: company.isActive,
    })
    setEditOpen(true)
  }

  function handleView(company: Company) {
    setSelectedCompany(company)
    setSelectedCompanyId(company.id)
    setViewOpen(true)
  }

  async function handleEditCompany() {
    setSaving(true)
    try {
      await apiPatch(`/api/companies/${editForm.id}`, {
        name: editForm.name,
        description: editForm.description || null,
        industry: editForm.industry || null,
        website: editForm.website || null,
        address: editForm.address || null,
        city: editForm.city || null,
        state: editForm.state || null,
        country: editForm.country || null,
        phone: editForm.phone || null,
        email: editForm.email || null,
        isActive: editForm.isActive,
      })
      toast({
        title: 'Company Updated',
        description: `${editForm.name} has been updated successfully.`,
      })
      setEditOpen(false)
      setSelectedCompany(null)
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update company',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await apiDelete(`/api/companies/${deleteConfirm}`)
      toast({
        title: 'Company Deleted',
        description: 'Company and all related data have been removed.',
        variant: 'destructive',
      })
      setDeleteConfirm(null)
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete company',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast({
      title: 'Code Copied',
      description: `Join code "${code}" copied to clipboard.`,
    })
  }

  // ── Join Company Handler ──────────────────────────────────────────────────

  async function handleJoinCompany() {
    if (!joinCode.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter a company join code.', variant: 'destructive' })
      return
    }
    if (!employeeId) {
      toast({ title: 'Error', description: 'You must be logged in as an employee to join a company.', variant: 'destructive' })
      return
    }
    setJoining(true)
    try {
      await apiPost('/api/companies/join', {
        employeeId,
        code: joinCode.trim().toUpperCase(),
      })
      toast({
        title: 'Request Sent',
        description: 'Your join request has been submitted. Waiting for approval.',
      })
      setJoinOpen(false)
      setJoinCode('')
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to join company',
        variant: 'destructive',
      })
    } finally {
      setJoining(false)
    }
  }

  // ── Member Handlers ───────────────────────────────────────────────────────

  async function handleApproveMember(memberId: string, empName: string) {
    setActionLoading(memberId)
    try {
      await apiPatch('/api/companies/members', {
        id: memberId,
        status: 'approved',
      })
      toast({
        title: 'Member Approved',
        description: `${empName} has been approved to join the company.`,
      })
      refetchMembers()
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to approve member',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectMember(memberId: string, empName: string) {
    setActionLoading(memberId)
    try {
      await apiPatch('/api/companies/members', {
        id: memberId,
        status: 'rejected',
      })
      toast({
        title: 'Member Rejected',
        description: `${empName}'s join request has been rejected.`,
      })
      refetchMembers()
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to reject member',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRemoveMember(memberId: string, empName: string) {
    setActionLoading(memberId)
    try {
      await apiPatch('/api/companies/members', {
        id: memberId,
        status: 'removed',
      })
      toast({
        title: 'Member Removed',
        description: `${empName} has been removed from the company.`,
        variant: 'destructive',
      })
      refetchMembers()
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to remove member',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }

  function handleSelectCompanyForMembers(companyId: string) {
    setSelectedCompanyId(companyId)
    setMemberFilterStatus('all')
  }

  // ── Office Location Handlers ──────────────────────────────────────────────

  function handleAddLocation(companyId: string) {
    setLocationForm({
      companyId,
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      radius: '500',
    })
    setAddLocationOpen(true)
  }

  function handleEditLocation(location: OfficeLocation) {
    setSelectedLocation(location)
    setLocationForm({
      companyId: location.companyId,
      name: location.name,
      address: location.address || '',
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      radius: String(location.radius),
    })
    setEditLocationOpen(true)
  }

  async function handleSaveLocation() {
    if (!locationForm.name || !locationForm.latitude || !locationForm.longitude) {
      toast({ title: 'Validation Error', description: 'Name, latitude, and longitude are required.', variant: 'destructive' })
      return
    }
    setLocationSaving(true)
    try {
      await apiPost('/api/office-locations', {
        companyId: locationForm.companyId,
        name: locationForm.name,
        address: locationForm.address || null,
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        radius: parseFloat(locationForm.radius) || 500,
      })
      toast({
        title: 'Location Added',
        description: `${locationForm.name} has been added as an office location.`,
      })
      setAddLocationOpen(false)
      refetchLocations()
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add location',
        variant: 'destructive',
      })
    } finally {
      setLocationSaving(false)
    }
  }

  async function handleUpdateLocation() {
    if (!selectedLocation) return
    setLocationSaving(true)
    try {
      await apiPatch('/api/office-locations', {
        id: selectedLocation.id,
        name: locationForm.name,
        address: locationForm.address || null,
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        radius: parseFloat(locationForm.radius) || 500,
      })
      toast({
        title: 'Location Updated',
        description: `${locationForm.name} has been updated.`,
      })
      setEditLocationOpen(false)
      setSelectedLocation(null)
      refetchLocations()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update location',
        variant: 'destructive',
      })
    } finally {
      setLocationSaving(false)
    }
  }

  async function confirmDeleteLocation() {
    if (!deleteLocationConfirm) return
    setLocationDeleting(true)
    try {
      await apiDelete(`/api/office-locations?id=${deleteLocationConfirm}`)
      toast({
        title: 'Location Deleted',
        description: 'Office location has been removed.',
        variant: 'destructive',
      })
      setDeleteLocationConfirm(null)
      refetchLocations()
      refetchCompanies()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete location',
        variant: 'destructive',
      })
    } finally {
      setLocationDeleting(false)
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
                  Company Management
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  {totalCompanies}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage companies, members &amp; office locations
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 sm:w-[240px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setJoinOpen(true)}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              Join Company
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Create Company
            </Button>
          </div>
        </div>

        {/* ─── Stats Cards ──────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Companies</p>
                  <p className="text-2xl font-bold">{totalCompanies}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                  <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Active Members</p>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                  <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Office Locations</p>
                  <p className="text-2xl font-bold">{totalLocations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                  <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px]" size="sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filterIndustry !== 'all' || filterStatus !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => {
                    setFilterIndustry('all')
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

        {/* ─── Tabs ────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="h-4 w-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Office Locations
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="h-4 w-4" />
              Policies
            </TabsTrigger>
          </TabsList>

          {/* ─── Companies Tab ──────────────────────────────────────── */}
          <TabsContent value="companies">
            <Card>
              <CardContent className="p-0">
                {companiesLoading ? (
                  <LoadingSpinner message="Loading companies..." />
                ) : companiesError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <p className="text-destructive text-sm">{companiesError}</p>
                    <Button variant="outline" size="sm" onClick={refetchCompanies}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Company</TableHead>
                          <TableHead>Join Code</TableHead>
                          <TableHead className="hidden md:table-cell">Industry</TableHead>
                          <TableHead>Members</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                              <EmptyState
                                icon={Building2}
                                title="No companies found"
                                description="Create a new company or adjust your search filters"
                              />
                            </TableCell>
                          </TableRow>
                        ) : (
                          companies.map((company) => (
                            <TableRow key={company.id} className="group">
                              <TableCell className="pl-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                    <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{company.name}</p>
                                    <p className="text-muted-foreground truncate text-[11px]">
                                      {company.city}{company.city && company.country ? ', ' : ''}{company.country}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-semibold tracking-wider">
                                    {company.code}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-emerald-600"
                                    onClick={() => handleCopyCode(company.code)}
                                    title="Copy code"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {company.industry ? (
                                  <Badge variant="outline" className="text-[11px] font-medium">
                                    {company.industry}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm font-medium">{company._count?.members || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(company.isActive ? 'active' : 'inactive')}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:text-sky-400 dark:hover:bg-sky-950"
                                    onClick={() => handleView(company)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                    onClick={() => handleEdit(company)}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    onClick={() => setDeleteConfirm(company.id)}
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
                {!companiesLoading && !companiesError && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <p className="text-muted-foreground text-sm">
                      Showing{' '}
                      <span className="font-medium text-foreground">{companies.length}</span>{' '}
                      of{' '}
                      <span className="font-medium text-foreground">{companiesData?.pagination?.total ?? companies.length}</span>{' '}
                      companies
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Members Tab ───────────────────────────────────────── */}
          <TabsContent value="members">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Label className="text-sm font-medium whitespace-nowrap">Select Company:</Label>
                    <Select value={selectedCompanyId} onValueChange={handleSelectCompanyForMembers}>
                      <SelectTrigger className="w-full sm:w-[260px]">
                        <SelectValue placeholder="Choose a company..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={memberFilterStatus} onValueChange={setMemberFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[150px]" size="sm">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="removed">Removed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedCompanyId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setLocationCompanyId(selectedCompanyId)
                        setActiveTab('locations')
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      View Locations
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {!selectedCompanyId ? (
              <Card>
                <CardContent className="p-0">
                  <EmptyState
                    icon={Users}
                    title="Select a company"
                    description="Choose a company above to view and manage its members"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {membersLoading ? (
                    <LoadingSpinner message="Loading members..." />
                  ) : membersError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <p className="text-destructive text-sm">{membersError}</p>
                      <Button variant="outline" size="sm" onClick={refetchMembers}>
                        Retry
                      </Button>
                    </div>
                  ) : (
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
                            <TableRow>
                              <TableCell colSpan={5} className="h-32 text-center">
                                <EmptyState
                                  icon={Users}
                                  title="No members found"
                                  description="No members match the current filter"
                                />
                              </TableCell>
                            </TableRow>
                          ) : (
                            members.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell className="pl-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                      {member.employee.firstName.charAt(0)}{member.employee.lastName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium">
                                        {member.employee.firstName} {member.employee.lastName}
                                      </p>
                                      <p className="text-muted-foreground truncate text-[11px]">
                                        {member.employee.email}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{getRoleBadge(member.role)}</TableCell>
                                <TableCell>{getMemberStatusBadge(member.status)}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                  {member.joinedAt
                                    ? new Date(member.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {member.status === 'pending' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                          onClick={() => handleApproveMember(member.id, `${member.employee.firstName} ${member.employee.lastName}`)}
                                          disabled={actionLoading === member.id}
                                          title="Approve"
                                        >
                                          {actionLoading === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                          onClick={() => handleRejectMember(member.id, `${member.employee.firstName} ${member.employee.lastName}`)}
                                          disabled={actionLoading === member.id}
                                          title="Reject"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                    {member.status === 'approved' && member.role !== 'owner' && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                        onClick={() => handleRemoveMember(member.id, `${member.employee.firstName} ${member.employee.lastName}`)}
                                        disabled={actionLoading === member.id}
                                        title="Remove"
                                      >
                                        {actionLoading === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                      </Button>
                                    )}
                                    {member.role === 'owner' && (
                                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                        Owner
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {!membersLoading && !membersError && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <p className="text-muted-foreground text-sm">
                        Showing{' '}
                        <span className="font-medium text-foreground">{members.length}</span>{' '}
                        of{' '}
                        <span className="font-medium text-foreground">{membersData?.pagination?.total ?? members.length}</span>{' '}
                        members
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── Office Locations Tab ──────────────────────────────── */}
          <TabsContent value="locations">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Label className="text-sm font-medium whitespace-nowrap">Select Company:</Label>
                    <Select value={locationCompanyId} onValueChange={setLocationCompanyId}>
                      <SelectTrigger className="w-full sm:w-[260px]">
                        <SelectValue placeholder="Choose a company..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {locationCompanyId && (
                    <Button
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleAddLocation(locationCompanyId)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Location
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {!locationCompanyId ? (
              <Card>
                <CardContent className="p-0">
                  <EmptyState
                    icon={MapPin}
                    title="Select a company"
                    description="Choose a company above to manage its office locations"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  {locationsLoading ? (
                    <LoadingSpinner message="Loading office locations..." />
                  ) : locationsError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <p className="text-destructive text-sm">{locationsError}</p>
                      <Button variant="outline" size="sm" onClick={refetchLocations}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="pl-4">Location Name</TableHead>
                            <TableHead className="hidden md:table-cell">Address</TableHead>
                            <TableHead>Coordinates</TableHead>
                            <TableHead>Radius</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {locations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-32 text-center">
                                <EmptyState
                                  icon={MapPinned}
                                  title="No office locations"
                                  description="Add geofenced office locations for attendance tracking"
                                />
                              </TableCell>
                            </TableRow>
                          ) : (
                            locations.map((location) => (
                              <TableRow key={location.id}>
                                <TableCell className="pl-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                                      <MapPin className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <p className="text-sm font-medium">{location.name}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                  {location.address || '—'}
                                </TableCell>
                                <TableCell>
                                  <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{location.radius}m</span>
                                </TableCell>
                                <TableCell>
                                  {location.isActive ? (
                                    <Badge variant="secondary" className="text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                      Inactive
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                      onClick={() => handleEditLocation(location)}
                                      title="Edit"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                      onClick={() => setDeleteLocationConfirm(location.id)}
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

                  {!locationsLoading && !locationsError && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <p className="text-muted-foreground text-sm">
                        Showing{' '}
                        <span className="font-medium text-foreground">{locations.length}</span>{' '}
                        of{' '}
                        <span className="font-medium text-foreground">{locationsData?.pagination?.total ?? locations.length}</span>{' '}
                        locations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── Policies Tab ──────────────────────────────────────── */}
          <TabsContent value="policies">
            <Card>
              <CardContent className="p-6">
                <EmptyState
                  icon={FileText}
                  title="Company Policies"
                  description="Manage company policies and guidelines. Policy management features coming soon."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Create Company Dialog ────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Create New Company
            </DialogTitle>
            <DialogDescription>
              Add a new company. A unique 6-character join code will be auto-generated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Acme Technologies"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyDesc">Description</Label>
              <Textarea
                id="companyDesc"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the company"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="companyIndustry">Industry</Label>
                <Select
                  value={createForm.industry}
                  onValueChange={(v) => setCreateForm((f) => ({ ...f, industry: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input
                  id="companyWebsite"
                  value={createForm.website}
                  onChange={(e) => setCreateForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input
                id="companyAddress"
                value={createForm.address}
                onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="companyCity">City</Label>
                <Input
                  id="companyCity"
                  value={createForm.city}
                  onChange={(e) => setCreateForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyState">State</Label>
                <Input
                  id="companyState"
                  value={createForm.state}
                  onChange={(e) => setCreateForm((f) => ({ ...f, state: e.target.value }))}
                  placeholder="State"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyCountry">Country</Label>
                <Input
                  id="companyCountry"
                  value={createForm.country}
                  onChange={(e) => setCreateForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="Country"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="companyPhone"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 234 567 890"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="companyEmail"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="contact@company.com"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCreateCompany}
              disabled={saving || !createForm.name}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Company Dialog ──────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600" />
              Edit Company
            </DialogTitle>
            <DialogDescription>
              Update company information for &ldquo;{selectedCompany?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editCompanyName">Company Name *</Label>
              <Input
                id="editCompanyName"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editCompanyDesc">Description</Label>
              <Textarea
                id="editCompanyDesc"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="editCompanyIndustry">Industry</Label>
                <Select
                  value={editForm.industry}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, industry: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editCompanyWebsite">Website</Label>
                <Input
                  id="editCompanyWebsite"
                  value={editForm.website}
                  onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editCompanyAddress">Address</Label>
              <Input
                id="editCompanyAddress"
                value={editForm.address}
                onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="editCompanyCity">City</Label>
                <Input
                  id="editCompanyCity"
                  value={editForm.city}
                  onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editCompanyState">State</Label>
                <Input
                  id="editCompanyState"
                  value={editForm.state}
                  onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editCompanyCountry">Country</Label>
                <Input
                  id="editCompanyCountry"
                  value={editForm.country}
                  onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="editCompanyPhone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="editCompanyPhone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editCompanyEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="editCompanyEmail"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editCompanyStatus">Status</Label>
              <Select
                value={editForm.isActive ? 'true' : 'false'}
                onValueChange={(v) => setEditForm((f) => ({ ...f, isActive: v === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleEditCompany}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              Update Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Company Dialog ──────────────────────────────────── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-sky-600" />
              Company Details
            </DialogTitle>
            <DialogDescription>
              Overview of &ldquo;{selectedCompany?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
                  <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCompany.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedCompany.isActive ? 'active' : 'inactive')}
                    {selectedCompany.industry && (
                      <Badge variant="outline" className="text-[11px]">{selectedCompany.industry}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Join Code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-bold tracking-wider">{selectedCompany.code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyCode(selectedCompany.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedCompany.description && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm">{selectedCompany.description}</p>
                    </div>
                  </div>
                )}

                {selectedCompany.website && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">{selectedCompany.website}</p>
                    </div>
                  </div>
                )}

                {(selectedCompany.address || selectedCompany.city || selectedCompany.country) && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">
                        {[selectedCompany.address, selectedCompany.city, selectedCompany.state, selectedCompany.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {selectedCompany.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{selectedCompany.phone}</p>
                    </div>
                  </div>
                )}

                {selectedCompany.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{selectedCompany.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{selectedCompany._count?.members || 0}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-600">{selectedCompany._count?.officeLocations || 0}</p>
                  <p className="text-xs text-muted-foreground">Office Locations</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setViewOpen(false)
                if (selectedCompany) {
                  setSelectedCompanyId(selectedCompany.id)
                  setActiveTab('members')
                }
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Join Company Dialog ──────────────────────────────────── */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-emerald-600" />
              Join a Company
            </DialogTitle>
            <DialogDescription>
              Enter the 6-character join code shared by HR to request membership
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="joinCode">Company Join Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., AB12CD"
                className="h-12 text-center text-xl font-mono tracking-[0.3em] uppercase"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Ask your HR for the company join code
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleJoinCompany}
              disabled={joining || joinCode.length < 6}
            >
              {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Join Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Company Confirm ───────────────────────────────── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this company? This will also remove all members, office locations, tasks, and meetings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Add Office Location Dialog ───────────────────────────── */}
      <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Add Office Location
            </DialogTitle>
            <DialogDescription>
              Create a geofenced office location for attendance tracking
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="locName">Location Name *</Label>
              <Input
                id="locName"
                value={locationForm.name}
                onChange={(e) => setLocationForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., HQ - Main Office"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="locAddress">Address</Label>
              <Input
                id="locAddress"
                value={locationForm.address}
                onChange={(e) => setLocationForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Full address of the office"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="locLat">Latitude *</Label>
                <Input
                  id="locLat"
                  type="number"
                  step="any"
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm((f) => ({ ...f, latitude: e.target.value }))}
                  placeholder="e.g., 28.613895"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="locLng">Longitude *</Label>
                <Input
                  id="locLng"
                  type="number"
                  step="any"
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm((f) => ({ ...f, longitude: e.target.value }))}
                  placeholder="e.g., 77.209006"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="locRadius">Geofence Radius (meters)</Label>
              <Input
                id="locRadius"
                type="number"
                value={locationForm.radius}
                onChange={(e) => setLocationForm((f) => ({ ...f, radius: e.target.value }))}
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">
                Radius in meters for geofencing. Default is 500m.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLocationOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSaveLocation}
              disabled={locationSaving || !locationForm.name || !locationForm.latitude || !locationForm.longitude}
            >
              {locationSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Office Location Dialog ──────────────────────────── */}
      <Dialog open={editLocationOpen} onOpenChange={setEditLocationOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600" />
              Edit Office Location
            </DialogTitle>
            <DialogDescription>
              Update geofenced office location details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editLocName">Location Name *</Label>
              <Input
                id="editLocName"
                value={locationForm.name}
                onChange={(e) => setLocationForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editLocAddress">Address</Label>
              <Input
                id="editLocAddress"
                value={locationForm.address}
                onChange={(e) => setLocationForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editLocLat">Latitude *</Label>
                <Input
                  id="editLocLat"
                  type="number"
                  step="any"
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm((f) => ({ ...f, latitude: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editLocLng">Longitude *</Label>
                <Input
                  id="editLocLng"
                  type="number"
                  step="any"
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm((f) => ({ ...f, longitude: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editLocRadius">Geofence Radius (meters)</Label>
              <Input
                id="editLocRadius"
                type="number"
                value={locationForm.radius}
                onChange={(e) => setLocationForm((f) => ({ ...f, radius: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLocationOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleUpdateLocation}
              disabled={locationSaving}
            >
              {locationSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Location Confirm ──────────────────────────────── */}
      <AlertDialog open={!!deleteLocationConfirm} onOpenChange={() => setDeleteLocationConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Office Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this office location? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLocation}
              className="bg-red-600 hover:bg-red-700"
              disabled={locationDeleting}
            >
              {locationDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
