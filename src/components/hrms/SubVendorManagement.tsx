'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { useHRMSStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Users, FileText, Filter, Loader2, X, Upload, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubVendorData {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  specialization: string | null
  isActive: boolean
  companyId: string | null
  createdAt: string
  updatedAt: string
  _count?: { uploadedResumes: number }
}

interface SubVendorResumeData {
  id: string
  subVendorId: string
  candidateName: string
  email: string
  phone: string | null
  resumeUrl: string | null
  skills: string | null
  experience: string | null
  currentCompany: string | null
  expectedSalary: string | null
  jobId: string | null
  status: string
  createdAt: string
  updatedAt: string
  job?: { id: string; title: string; department: string | null } | null
  subVendor?: { id: string; companyName: string } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const statusFlow = ['uploaded', 'shortlisted', 'interviewed', 'offered', 'rejected'] as const

const specializationOptions = [
  { value: 'IT', label: 'IT & Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Other', label: 'Other' },
] as const

const emptyForm = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  specialization: '',
  address: '',
  city: '',
  state: '',
  country: '',
}

const emptyResumeForm = {
  candidateName: '',
  email: '',
  phone: '',
  resumeUrl: '',
  skills: '',
  experience: '',
  currentCompany: '',
  expectedSalary: '',
  jobId: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getResumeStatusBadge(status: string) {
  const cfg: Record<string, { label: string; className: string }> = {
    uploaded: { label: 'Uploaded', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
    shortlisted: { label: 'Shortlisted', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    interviewed: { label: 'Interviewed', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' },
    offered: { label: 'Offered', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' },
  }
  const c = cfg[status] || cfg.uploaded
  return <Badge variant="secondary" className={`text-[11px] font-medium ${c.className}`}>{c.label}</Badge>
}

function getResumeStatusIcon(status: string) {
  switch (status) {
    case 'uploaded': return <Upload className="h-4 w-4 text-slate-500" />
    case 'shortlisted': return <CheckCircle2 className="h-4 w-4 text-amber-500" />
    case 'interviewed': return <Users className="h-4 w-4 text-cyan-500" />
    case 'offered': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case 'rejected': return <X className="h-4 w-4 text-rose-500" />
    default: return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getVendorStatusBadge(isActive: boolean) {
  return isActive
    ? <Badge variant="secondary" className="text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Active</Badge>
    : <Badge variant="secondary" className="text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Inactive</Badge>
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function parseSkills(skills: string | null): string[] {
  if (!skills) return []
  try {
    const parsed = JSON.parse(skills)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return skills.split(',').map(s => s.trim()).filter(Boolean)
  }
}

function getSpecializationLabel(value: string | null): string {
  if (!value) return '—'
  const found = specializationOptions.find(o => o.value === value)
  return found ? found.label : value
}

function getNextStatus(current: string): string[] {
  const idx = statusFlow.indexOf(current as any)
  if (idx === -1 || current === 'rejected') return []
  if (current === 'offered') return ['rejected']
  return [statusFlow[idx + 1], 'rejected']
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-14" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

function ResumeListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptyVendors() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-950">
        <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No sub-vendors found</p>
        <p className="text-xs text-muted-foreground mt-1">Add a staffing agency to get started</p>
      </div>
    </div>
  )
}

function EmptyResumes() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-cyan-100 p-4 dark:bg-cyan-950">
        <FileText className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No resumes uploaded yet</p>
        <p className="text-xs text-muted-foreground mt-1">Resumes from sub-vendors will appear here</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SubVendorManagement() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [activeVendorTab, setActiveVendorTab] = useState('vendors')

  // Respond to sub-item navigation from sidebar
  useEffect(() => {
    if (activeSubItem) {
      switch (activeSubItem) {
        case 'vendor-list':
          setActiveVendorTab('vendors')
          break
        case 'resume-uploads':
          setActiveVendorTab('resumes')
          break
        case 'vendor-assignments':
          setActiveVendorTab('vendors')
          break
        default:
          break
      }
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])
  const { toast } = useToast()

  // Vendor state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSpec, setFilterSpec] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  // Resume state
  const [resumeSearch, setResumeSearch] = useState('')
  const [resumeStatusFilter, setResumeStatusFilter] = useState('all')
  const [addResumeOpen, setAddResumeOpen] = useState(false)
  const [resumeForm, setResumeForm] = useState(emptyResumeForm)
  const [savingResume, setSavingResume] = useState(false)
  const [selectedResume, setSelectedResume] = useState<SubVendorResumeData | null>(null)
  const [resumeDetailOpen, setResumeDetailOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Vendor detail sheet state
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<SubVendorData | null>(null)

  // ── API hooks ─────────────────────────────────────────────────────────────

  const { data: vendorsData, loading: vendorsLoading, error: vendorsError, refetch: refetchVendors } = useApi<{
    subVendors: SubVendorData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/subvendors',
    params: {
      limit: 100,
      search: searchQuery || undefined,
      specialization: filterSpec !== 'all' ? filterSpec : undefined,
    },
  })

  const { data: vendorDetail, refetch: refetchDetail } = useApi<SubVendorData & { uploadedResumes: SubVendorResumeData[] }>({
    baseUrl: `/api/subvendors/${selectedVendor?.id}`,
    enabled: !!selectedVendor && detailOpen,
  })

  const { data: allResumesData, loading: allResumesLoading, error: allResumesError, refetch: refetchAllResumes } = useApi<{
    resumes: SubVendorResumeData[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    baseUrl: '/api/subvendors/resumes',
    params: {
      limit: 200,
      search: resumeSearch || undefined,
      status: resumeStatusFilter !== 'all' ? resumeStatusFilter : undefined,
    },
  })

  const { data: jobsData } = useApi<{
    jobs: { id: string; title: string; department: string | null }[]
    pagination: { total: number }
  }>({
    baseUrl: '/api/jobs',
    params: { limit: 100, status: 'open' },
  })

  const vendors = vendorsData?.subVendors ?? []
  const vendorResumes = vendorDetail?.uploadedResumes ?? []
  const allResumes = allResumesData?.resumes ?? []
  const jobs = jobsData?.jobs ?? []

  // ── Derived data ──────────────────────────────────────────────────────────

  const totalResumes = useMemo(() => vendors.reduce((sum, v) => sum + (v._count?.uploadedResumes ?? 0), 0), [vendors])

  const resumeStats = useMemo(() => {
    const shortlisted = allResumes.filter(r => r.status === 'shortlisted').length
    const interviewed = allResumes.filter(r => r.status === 'interviewed').length
    return { shortlisted, interviewed }
  }, [allResumes])

  // ── Vendor Handlers ──────────────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    setEditingId(null)
    setForm(emptyForm)
    setAddOpen(true)
  }, [])

  const handleEdit = useCallback((vendor: SubVendorData) => {
    setEditingId(vendor.id)
    setForm({
      companyName: vendor.companyName,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone || '',
      specialization: vendor.specialization || '',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      country: vendor.country || '',
    })
    setAddOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!form.companyName || !form.contactPerson || !form.email) return
    setSaving(true)
    try {
      if (editingId) {
        await apiPatch(`/api/subvendors/${editingId}`, form)
        toast({ title: 'Sub-Vendor Updated', description: `${form.companyName} updated successfully.` })
      } else {
        await apiPost('/api/subvendors', form)
        toast({ title: 'Sub-Vendor Added', description: `${form.companyName} added successfully.` })
      }
      setAddOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      refetchVendors()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [form, editingId, refetchVendors, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this sub-vendor? All associated resumes will also be removed.')) return
    try {
      await apiDelete(`/api/subvendors/${id}`)
      toast({ title: 'Sub-Vendor Deleted', description: 'The sub-vendor has been removed.' })
      refetchVendors()
      if (selectedVendor?.id === id) {
        setDetailOpen(false)
        setSelectedVendor(null)
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete sub-vendor', variant: 'destructive' })
    }
  }, [refetchVendors, selectedVendor, toast])

  const handleViewDetail = useCallback((vendor: SubVendorData) => {
    setSelectedVendor(vendor)
    setDetailOpen(true)
  }, [])

  // ── Resume Handlers ──────────────────────────────────────────────────────

  const handleAddResume = useCallback(async () => {
    if (!resumeForm.candidateName || !resumeForm.email || !selectedVendor) return
    setSavingResume(true)
    try {
      await apiPost(`/api/subvendors/${selectedVendor.id}/resumes`, {
        ...resumeForm,
        jobId: resumeForm.jobId || null,
      })
      toast({ title: 'Resume Added', description: `${resumeForm.candidateName}'s resume has been uploaded.` })
      setAddResumeOpen(false)
      setResumeForm(emptyResumeForm)
      refetchDetail()
      refetchAllResumes()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to add resume', variant: 'destructive' })
    } finally {
      setSavingResume(false)
    }
  }, [resumeForm, selectedVendor, refetchDetail, refetchAllResumes, toast])

  const handleUpdateResumeStatus = useCallback(async (resumeId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      await apiPatch(`/api/subvendors/${selectedVendor?.id}/resumes`, { resumeId, status: newStatus })
      toast({ title: 'Status Updated', description: `Resume moved to "${newStatus}" stage.` })
      refetchDetail()
      refetchAllResumes()
      // Update selected resume if it's the one being viewed
      if (selectedResume?.id === resumeId) {
        setSelectedResume(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update resume status', variant: 'destructive' })
      refetchDetail()
      refetchAllResumes()
    } finally {
      setUpdatingStatus(false)
    }
  }, [selectedVendor, selectedResume, refetchDetail, refetchAllResumes, toast])

  const handleResumeDetail = useCallback((resume: SubVendorResumeData) => {
    setSelectedResume(resume)
    setResumeDetailOpen(true)
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sub-Vendor Management</h1>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {vendorsData?.pagination?.total ?? vendors.length}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">Manage staffing agencies and their candidate resumes</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {vendorsLoading ? (
          <StatsSkeleton />
        ) : vendorsError ? (
          <Card className="mb-6 border-rose-200 dark:border-rose-800">
            <CardContent className="flex items-center justify-center gap-3 p-6">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load data</p>
              <Button variant="outline" size="sm" onClick={refetchVendors}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Total Sub-Vendors</p>
                    <p className="text-2xl font-bold">{vendors.length}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-100 p-2.5 dark:bg-emerald-950">
                    <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Total Resumes</p>
                    <p className="text-2xl font-bold">{totalResumes}</p>
                  </div>
                  <div className="rounded-lg bg-cyan-100 p-2.5 dark:bg-cyan-950">
                    <FileText className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-transparent" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Shortlisted</p>
                    <p className="text-2xl font-bold">{resumeStats.shortlisted}</p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-950">
                    <CheckCircle2 className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Interviewed</p>
                    <p className="text-2xl font-bold">{resumeStats.interviewed}</p>
                  </div>
                  <div className="rounded-lg bg-violet-100 p-2.5 dark:bg-violet-950">
                    <Users className="h-5 w-5 text-violet-700 dark:text-violet-400" />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-violet-500 to-transparent" />
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeVendorTab} onValueChange={setActiveVendorTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="vendors" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span>Vendors</span>
            </TabsTrigger>
            <TabsTrigger value="resumes" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span>Resumes</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: VENDORS
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="vendors" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-[280px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search sub-vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9"
                  />
                  {searchQuery && (
                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery('')}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <Select value={filterSpec} onValueChange={setFilterSpec}>
                  <SelectTrigger className="w-full sm:w-[180px]" size="sm">
                    <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {specializationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">
                <Plus className="h-4 w-4" /> Add Sub-Vendor
              </Button>
            </div>

            {/* Vendor Table */}
            <Card>
              <CardContent className="p-0">
                {vendorsLoading ? (
                  <TableSkeleton />
                ) : vendorsError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <AlertTriangle className="h-8 w-8 text-rose-500" />
                    <p className="text-destructive text-sm">{vendorsError}</p>
                    <Button variant="outline" size="sm" onClick={refetchVendors}>Retry</Button>
                  </div>
                ) : vendors.length === 0 ? (
                  <EmptyVendors />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="pl-4">Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead className="hidden md:table-cell">Specialization</TableHead>
                          <TableHead>Resumes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right pr-4">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors.map((vendor) => (
                          <TableRow key={vendor.id} className="group cursor-pointer" onClick={() => handleViewDetail(vendor)}>
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                  {vendor.companyName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{vendor.companyName}</p>
                                  <p className="text-muted-foreground truncate text-xs">{vendor.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{vendor.contactPerson}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className="text-[11px]">{getSpecializationLabel(vendor.specialization)}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[11px] bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">
                                {vendor._count?.uploadedResumes ?? 0}
                              </Badge>
                            </TableCell>
                            <TableCell>{getVendorStatusBadge(vendor.isActive)}</TableCell>
                            <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950" onClick={() => handleEdit(vendor)} title="Edit">
                                  <Plus className="h-4 w-4 rotate-45" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950" onClick={() => handleDelete(vendor.id)} title="Delete">
                                  <X className="h-4 w-4" />
                                </Button>
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

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: RESUMES
          ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="resumes" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-[280px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search resumes..."
                    value={resumeSearch}
                    onChange={(e) => setResumeSearch(e.target.value)}
                    className="h-9 pl-9"
                  />
                  {resumeSearch && (
                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setResumeSearch('')}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <Select value={resumeStatusFilter} onValueChange={setResumeStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[170px]" size="sm">
                    <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusFlow.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pipeline Summary */}
            {!allResumesLoading && !allResumesError && allResumes.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {statusFlow.map((s) => {
                  const count = allResumes.filter(r => r.status === s).length
                  const colorMap: Record<string, string> = {
                    uploaded: 'border-slate-300 dark:border-slate-700',
                    shortlisted: 'border-amber-300 dark:border-amber-800',
                    interviewed: 'border-cyan-300 dark:border-cyan-800',
                    offered: 'border-emerald-300 dark:border-emerald-800',
                    rejected: 'border-rose-300 dark:border-rose-800',
                  }
                  const iconColorMap: Record<string, string> = {
                    uploaded: 'text-slate-500',
                    shortlisted: 'text-amber-500',
                    interviewed: 'text-cyan-500',
                    offered: 'text-emerald-500',
                    rejected: 'text-rose-500',
                  }
                  return (
                    <div key={s} className={`text-center rounded-lg border p-3 ${colorMap[s]}`}>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {getResumeStatusIcon(s)}
                        <p className="text-lg font-bold">{count}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground capitalize">{s}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Resume List */}
            <Card>
              <CardContent className="p-0">
                {allResumesLoading ? (
                  <ResumeListSkeleton />
                ) : allResumesError ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <AlertTriangle className="h-8 w-8 text-rose-500" />
                    <p className="text-destructive text-sm">{allResumesError}</p>
                    <Button variant="outline" size="sm" onClick={refetchAllResumes}>Retry</Button>
                  </div>
                ) : allResumes.length === 0 ? (
                  <EmptyResumes />
                ) : (
                  <ScrollArea className="max-h-[600px]">
                    <div className="divide-y">
                      {allResumes.map((resume) => {
                        const skills = parseSkills(resume.skills)
                        return (
                          <div
                            key={resume.id}
                            className="flex items-start gap-4 p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() => handleResumeDetail(resume)}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-400">
                              {resume.candidateName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium truncate">{resume.candidateName}</p>
                                {getResumeStatusBadge(resume.status)}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {resume.email}{resume.experience ? ` · ${resume.experience}` : ''}
                              </p>
                              {skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {skills.slice(0, 5).map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-[10px] py-0">{skill}</Badge>
                                  ))}
                                  {skills.length > 5 && (
                                    <Badge variant="outline" className="text-[10px] py-0">+{skills.length - 5}</Badge>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                {resume.subVendor && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {resume.subVendor.companyName}
                                  </span>
                                )}
                                {resume.job && (
                                  <span>Linked: {resume.job.title}</span>
                                )}
                                <span>{formatDate(resume.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Add/Edit Vendor Dialog ────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) { setEditingId(null); setForm(emptyForm) } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Sub-Vendor' : 'Add Sub-Vendor'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update sub-vendor information' : 'Register a new staffing agency partner'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input value={form.companyName} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="StaffPro Inc" />
              </div>
              <div className="space-y-2">
                <Label>Contact Person *</Label>
                <Input value={form.contactPerson} onChange={(e) => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Jane Doe" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@staffpro.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={form.specialization} onValueChange={(v) => setForm(f => ({ ...f, specialization: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                  <SelectContent>
                    {specializationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))} placeholder="Country" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} placeholder="State" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} rows={2} placeholder="Full street address" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.companyName || !form.contactPerson || !form.email} className="bg-emerald-600 hover:bg-emerald-700">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? 'Update' : 'Add Sub-Vendor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Vendor Detail Dialog ──────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                {selectedVendor?.companyName?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <DialogTitle>{selectedVendor?.companyName}</DialogTitle>
                <DialogDescription>{selectedVendor?.contactPerson} · {getSpecializationLabel(selectedVendor?.specialization)}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-6 pb-2">
              {/* Vendor Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium">{selectedVendor.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium">{selectedVendor.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                  <p className="font-medium">{[selectedVendor.city, selectedVendor.state, selectedVendor.country].filter(Boolean).join(', ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                  <div className="mt-0.5">{getVendorStatusBadge(selectedVendor.isActive)}</div>
                </div>
              </div>

              <Separator />

              {/* Resumes Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    <FileText className="h-4 w-4" /> Uploaded Resumes ({vendorResumes.length})
                  </h3>
                  <Button size="sm" onClick={() => setAddResumeOpen(true)} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-3.5 w-3.5" /> Add Resume
                  </Button>
                </div>

                {/* Pipeline Summary for this vendor */}
                {vendorResumes.length > 0 && (
                  <div className="mb-4 grid grid-cols-5 gap-2">
                    {statusFlow.map((s) => {
                      const count = vendorResumes.filter(r => r.status === s).length
                      return (
                        <div key={s} className="text-center rounded-lg border p-2">
                          <div className="flex items-center justify-center gap-1">
                            {getResumeStatusIcon(s)}
                            <p className="text-base font-bold">{count}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground capitalize">{s}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {vendorResumes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <Upload className="h-6 w-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No resumes uploaded yet</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-80">
                    <div className="space-y-2">
                      {vendorResumes.map((resume) => {
                        const skills = parseSkills(resume.skills)
                        return (
                          <div key={resume.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm font-medium">{resume.candidateName}</p>
                                  {getResumeStatusBadge(resume.status)}
                                </div>
                                <p className="text-xs text-muted-foreground">{resume.email}{resume.experience ? ` · ${resume.experience}` : ''}</p>
                                {skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {skills.slice(0, 4).map((skill, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px] py-0">{skill}</Badge>
                                    ))}
                                    {skills.length > 4 && <Badge variant="outline" className="text-[10px] py-0">+{skills.length - 4}</Badge>}
                                  </div>
                                )}
                                {resume.job && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Linked to: {resume.job.title}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2 ml-3">
                                <Select
                                  value={resume.status}
                                  onValueChange={(v) => handleUpdateResumeStatus(resume.id, v)}
                                >
                                  <SelectTrigger className="w-[130px] h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusFlow.map((s) => (
                                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Resume Detail Dialog ──────────────────────────────────────────── */}
      <Dialog open={resumeDetailOpen} onOpenChange={setResumeDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-400">
                {selectedResume?.candidateName?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p>{selectedResume?.candidateName}</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedResume?.email}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedResume && (
            <div className="space-y-5 pb-2">
              {/* Status Header */}
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  {getResumeStatusIcon(selectedResume.status)}
                  <div>
                    <p className="text-xs text-muted-foreground">Current Status</p>
                    <p className="text-sm font-semibold capitalize">{selectedResume.status}</p>
                  </div>
                </div>
                {getResumeStatusBadge(selectedResume.status)}
              </div>

              {/* Candidate Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium">{selectedResume.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Experience</p>
                  <p className="font-medium">{selectedResume.experience || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Current Company</p>
                  <p className="font-medium">{selectedResume.currentCompany || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Expected Salary</p>
                  <p className="font-medium">{selectedResume.expectedSalary || '—'}</p>
                </div>
              </div>

              {/* Skills */}
              {parseSkills(selectedResume.skills).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parseSkills(selectedResume.skills).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Job */}
              {selectedResume.job && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Linked Job Requirement</p>
                  <div className="rounded-lg border p-3 bg-muted/30">
                    <p className="text-sm font-medium">{selectedResume.job.title}</p>
                    {selectedResume.job.department && (
                      <p className="text-xs text-muted-foreground">{selectedResume.job.department}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Source Vendor */}
              {selectedResume.subVendor && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Source Sub-Vendor</p>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                      {selectedResume.subVendor.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium">{selectedResume.subVendor.companyName}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Status Update Buttons */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusFlow.map((s) => {
                    const isCurrent = selectedResume.status === s
                    const colorMap: Record<string, string> = {
                      uploaded: 'bg-slate-600 hover:bg-slate-700',
                      shortlisted: 'bg-amber-600 hover:bg-amber-700',
                      interviewed: 'bg-cyan-600 hover:bg-cyan-700',
                      offered: 'bg-emerald-600 hover:bg-emerald-700',
                      rejected: 'bg-rose-600 hover:bg-rose-700',
                    }
                    return (
                      <Button
                        key={s}
                        size="sm"
                        variant={isCurrent ? 'default' : 'outline'}
                        className={isCurrent ? colorMap[s] : 'capitalize'}
                        disabled={isCurrent || updatingStatus}
                        onClick={() => {
                          if (selectedResume.subVendorId) {
                            setSelectedVendor({ ...selectedVendor!, id: selectedResume.subVendorId })
                            handleUpdateResumeStatus(selectedResume.id, s)
                          }
                        }}
                      >
                        {updatingStatus && !isCurrent && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                        <span className="capitalize">{s}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Status Pipeline</p>
                <div className="flex items-center gap-1">
                  {statusFlow.map((s, idx) => {
                    const currentIdx = statusFlow.indexOf(selectedResume.status as any)
                    const sIdx = idx
                    const isCompleted = currentIdx > sIdx || selectedResume.status === 'offered'
                    const isCurrent = selectedResume.status === s
                    const isRejected = selectedResume.status === 'rejected' && s === 'rejected'
                    const dotColor = isCurrent
                      ? s === 'uploaded' ? 'bg-slate-500' : s === 'shortlisted' ? 'bg-amber-500' : s === 'interviewed' ? 'bg-cyan-500' : s === 'offered' ? 'bg-emerald-500' : 'bg-rose-500'
                      : isCompleted ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-muted-foreground/30'
                    return (
                      <div key={s} className="flex items-center gap-1">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full ${dotColor}`} />
                          <p className="text-[9px] text-muted-foreground mt-0.5 capitalize">{s}</p>
                        </div>
                        {idx < statusFlow.length - 1 && (
                          <div className={`h-0.5 w-4 ${isCompleted ? 'bg-emerald-400' : 'bg-muted-foreground/20'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>Uploaded: {formatDate(selectedResume.createdAt)}</div>
                <div>Updated: {formatDate(selectedResume.updatedAt)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Add Resume Dialog ─────────────────────────────────────────────── */}
      <Dialog open={addResumeOpen} onOpenChange={setAddResumeOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Add Candidate Resume
            </DialogTitle>
            <DialogDescription>Upload a new candidate resume for {selectedVendor?.companyName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Candidate Name *</Label>
                <Input value={resumeForm.candidateName} onChange={(e) => setResumeForm(f => ({ ...f, candidateName: e.target.value }))} placeholder="John Smith" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={resumeForm.email} onChange={(e) => setResumeForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={resumeForm.phone} onChange={(e) => setResumeForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890" />
              </div>
              <div className="space-y-2">
                <Label>Experience</Label>
                <Input value={resumeForm.experience} onChange={(e) => setResumeForm(f => ({ ...f, experience: e.target.value }))} placeholder="5 years" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Company</Label>
                <Input value={resumeForm.currentCompany} onChange={(e) => setResumeForm(f => ({ ...f, currentCompany: e.target.value }))} placeholder="Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>Expected Salary</Label>
                <Input value={resumeForm.expectedSalary} onChange={(e) => setResumeForm(f => ({ ...f, expectedSalary: e.target.value }))} placeholder="$80,000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Skills (comma-separated)</Label>
              <Input value={resumeForm.skills} onChange={(e) => setResumeForm(f => ({ ...f, skills: e.target.value }))} placeholder="React, Node.js, TypeScript" />
            </div>
            <div className="space-y-2">
              <Label>Link to Job Requirement</Label>
              <Select value={resumeForm.jobId} onValueChange={(v) => setResumeForm(f => ({ ...f, jobId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a job (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific job</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.title}{j.department ? ` (${j.department})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddResumeOpen(false)}>Cancel</Button>
            <Button onClick={handleAddResume} disabled={savingResume || !resumeForm.candidateName || !resumeForm.email} className="bg-emerald-600 hover:bg-emerald-700">
              {savingResume && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Upload Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
