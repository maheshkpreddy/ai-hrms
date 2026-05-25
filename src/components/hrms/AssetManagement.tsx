'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Laptop,
  Phone,
  CreditCard,
  Mouse,
  Package,
  RotateCcw,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetEmployee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  department: string | null
  avatar: string | null
}

interface Asset {
  id: string
  employeeId: string
  assetType: string
  assetName: string
  serialNo: string | null
  assignedDate: string | null
  returnDate: string | null
  condition: string | null
  status: string
  employee: AssetEmployee
  createdAt: string
}

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  department: string | null
}

interface AssetsResponse {
  assets: Asset[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface EmployeesResponse {
  employees: Employee[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
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

function getAssetTypeIcon(type: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    laptop: Laptop,
    phone: Phone,
    'access-card': CreditCard,
    peripheral: Mouse,
    other: Package,
  }
  return icons[type] || Package
}

function getAssetTypeBadge(type: string) {
  const config: Record<string, { label: string; className: string }> = {
    laptop: {
      label: 'Laptop',
      className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
    },
    phone: {
      label: 'Phone',
      className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
    },
    'access-card': {
      label: 'Access Card',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    },
    peripheral: {
      label: 'Peripheral',
      className: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800',
    },
    other: {
      label: 'Other',
      className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    },
  }
  const cfg = config[type] || config.other
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    assigned: {
      label: 'Assigned',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    returned: {
      label: 'Returned',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    },
    lost: {
      label: 'Lost',
      className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    },
  }
  const cfg = config[status] || config.assigned
  return (
    <Badge variant="secondary" className={`text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

function getConditionBadge(condition: string | null) {
  if (!condition) return <span className="text-muted-foreground text-xs">—</span>
  const config: Record<string, { label: string; className: string }> = {
    new: {
      label: 'New',
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    good: {
      label: 'Good',
      className: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
    },
    fair: {
      label: 'Fair',
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
    damaged: {
      label: 'Damaged',
      className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    },
  }
  const cfg = config[condition]
  if (!cfg) return <span className="text-muted-foreground text-xs">{condition}</span>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssetManagement() {
  const { toast } = useToast()
  const { activeSubItem, setActiveSubItem } = useHRMSStore()

  // Clear activeSubItem when navigating to this module
  useEffect(() => {
    if (activeSubItem) {
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCondition, setFilterCondition] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // Add Asset Form
  const [addForm, setAddForm] = useState({
    employeeId: '',
    assetType: 'laptop',
    assetName: '',
    serialNo: '',
    assignedDate: new Date().toISOString().split('T')[0],
    condition: 'new',
  })

  // Edit Asset Form
  const [editForm, setEditForm] = useState({
    id: '',
    status: 'assigned',
    condition: 'new',
  })

  // ── API hooks ─────────────────────────────────────────────────────────────

  const {
    data: assetsData,
    loading: assetsLoading,
    error: assetsError,
    refetch: refetchAssets,
  } = useApi<AssetsResponse>({
    baseUrl: '/api/assets',
    params: {
      page: 1,
      limit: 100,
      assetType: filterType !== 'all' ? filterType : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
    },
  })

  // Employees list for the add form dropdown
  const {
    data: employeesData,
  } = useApi<EmployeesResponse>({
    baseUrl: '/api/employees',
    params: { page: 1, limit: 500, status: 'active' },
  })

  const assets = assetsData?.assets ?? []
  const employees = employeesData?.employees ?? []

  // Client-side filtering for condition and search
  const filteredAssets = useMemo(() => {
    let result = assets

    // Filter by condition (client-side)
    if (filterCondition !== 'all') {
      result = result.filter((a) => a.condition === filterCondition)
    }

    // Search by asset name or serial number
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.assetName.toLowerCase().includes(q) ||
          (a.serialNo && a.serialNo.toLowerCase().includes(q)) ||
          `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase().includes(q)
      )
    }

    return result
  }, [assets, filterCondition, searchQuery])

  // Stats
  const totalAssets = assets.length
  const assignedCount = assets.filter((a) => a.status === 'assigned').length
  const availableCount = assets.filter((a) => a.status === 'returned').length
  const lostCount = assets.filter((a) => a.status === 'lost').length

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddDialogChange = useCallback((open: boolean) => {
    setAddOpen(open)
    if (!open) {
      setAddForm({
        employeeId: '',
        assetType: 'laptop',
        assetName: '',
        serialNo: '',
        assignedDate: new Date().toISOString().split('T')[0],
        condition: 'new',
      })
    }
  }, [])

  async function handleAddAsset() {
    if (!addForm.employeeId || !addForm.assetType || !addForm.assetName) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/assets', {
        employeeId: addForm.employeeId,
        assetType: addForm.assetType,
        assetName: addForm.assetName,
        serialNo: addForm.serialNo || null,
        assignedDate: addForm.assignedDate,
        condition: addForm.condition,
        status: 'assigned',
      })
      toast({
        title: 'Asset Added',
        description: `${addForm.assetName} has been assigned successfully.`,
      })
      setAddOpen(false)
      setAddForm({
        employeeId: '',
        assetType: 'laptop',
        assetName: '',
        serialNo: '',
        assignedDate: new Date().toISOString().split('T')[0],
        condition: 'new',
      })
      refetchAssets()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add asset',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(asset: Asset) {
    setSelectedAsset(asset)
    setEditForm({
      id: asset.id,
      status: asset.status,
      condition: asset.condition || 'new',
    })
    setEditOpen(true)
  }

  async function handleEditAsset() {
    setSaving(true)
    try {
      await apiPatch('/api/assets', {
        id: editForm.id,
        status: editForm.status,
        condition: editForm.condition,
      })
      toast({
        title: 'Asset Updated',
        description: `Asset has been updated successfully.`,
      })
      setEditOpen(false)
      setSelectedAsset(null)
      refetchAssets()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update asset',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleReturnAsset(asset: Asset) {
    try {
      await apiPatch('/api/assets', {
        id: asset.id,
        status: 'returned',
        returnDate: new Date().toISOString().split('T')[0],
      })
      toast({
        title: 'Asset Returned',
        description: `${asset.assetName} has been marked as returned.`,
      })
      refetchAssets()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to return asset',
        variant: 'destructive',
      })
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await apiDelete(`/api/assets?id=${deleteConfirm}`)
      toast({
        title: 'Asset Deleted',
        description: 'Asset has been removed.',
        variant: 'destructive',
      })
      setDeleteConfirm(null)
      refetchAssets()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete asset',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <Laptop className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Asset Management
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  {totalAssets}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {assignedCount} assigned · {availableCount} returned · {lostCount} lost
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, serial no, or employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 sm:w-[260px]"
              />
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* ─── Stats Cards ──────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Assets</p>
                  <p className="text-2xl font-bold">{totalAssets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                  <Laptop className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Assigned</p>
                  <p className="text-2xl font-bold">{assignedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <RotateCcw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Returned</p>
                  <p className="text-2xl font-bold">{availableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Lost</p>
                  <p className="text-2xl font-bold">{lostCount}</p>
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
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                    <SelectValue placeholder="Asset Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="access-card">Access Card</SelectItem>
                    <SelectItem value="peripheral">Peripheral</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px]" size="sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCondition} onValueChange={setFilterCondition}>
                  <SelectTrigger className="w-full sm:w-[150px]" size="sm">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filterType !== 'all' || filterStatus !== 'all' || filterCondition !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => {
                    setFilterType('all')
                    setFilterStatus('all')
                    setFilterCondition('all')
                  }}
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Asset Table ──────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-0">
            {assetsLoading ? (
              <LoadingSpinner message="Loading assets..." />
            ) : assetsError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <p className="text-destructive text-sm">{assetsError}</p>
                <Button variant="outline" size="sm" onClick={refetchAssets}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="pl-4">Asset Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">Serial No</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="hidden lg:table-cell">Assigned Date</TableHead>
                      <TableHead className="hidden sm:table-cell">Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                            <p>No assets found</p>
                            <p className="text-xs">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => {
                        const TypeIcon = getAssetTypeIcon(asset.assetType)
                        return (
                          <TableRow key={asset.id} className="group">
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                  <TypeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {asset.assetName}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getAssetTypeBadge(asset.assetType)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                                {asset.serialNo || '—'}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                  {asset.employee.firstName.charAt(0)}{asset.employee.lastName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {asset.employee.firstName} {asset.employee.lastName}
                                  </p>
                                  <p className="text-muted-foreground truncate text-[11px]">
                                    {asset.employee.department}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">
                              {formatDate(asset.assignedDate)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {getConditionBadge(asset.condition)}
                            </TableCell>
                            <TableCell>{getStatusBadge(asset.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {asset.status === 'assigned' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:text-teal-400 dark:hover:bg-teal-950"
                                    onClick={() => handleReturnAsset(asset)}
                                    title="Return Asset"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                  onClick={() => handleEdit(asset)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                  onClick={() => setDeleteConfirm(asset.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Table Footer */}
            {!assetsLoading && !assetsError && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-sm">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {filteredAssets.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-foreground">
                    {assetsData?.pagination?.total ?? assets.length}
                  </span>{' '}
                  assets
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Add Asset Dialog ─────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={handleAddDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add New Asset
            </DialogTitle>
            <DialogDescription>
              Assign a new asset to an employee
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee *</Label>
              <Select
                value={addForm.employeeId}
                onValueChange={(v) => setAddForm((f) => ({ ...f, employeeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select
                  value={addForm.assetType}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, assetType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="access-card">Access Card</SelectItem>
                    <SelectItem value="peripheral">Peripheral</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={addForm.condition}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, condition: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input
                id="assetName"
                value={addForm.assetName}
                onChange={(e) => setAddForm((f) => ({ ...f, assetName: e.target.value }))}
                placeholder="e.g., MacBook Pro 16-inch"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="serialNo">Serial Number</Label>
                <Input
                  id="serialNo"
                  value={addForm.serialNo}
                  onChange={(e) => setAddForm((f) => ({ ...f, serialNo: e.target.value }))}
                  placeholder="e.g., SN-12345"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignedDate">Assigned Date</Label>
                <Input
                  id="assignedDate"
                  type="date"
                  value={addForm.assignedDate}
                  onChange={(e) => setAddForm((f) => ({ ...f, assignedDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddAsset}
              disabled={saving || !addForm.employeeId || !addForm.assetName}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Assign Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Asset Dialog ─────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600" />
              Edit Asset
            </DialogTitle>
            <DialogDescription>
              Update asset status and condition for &ldquo;{selectedAsset?.assetName}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editCondition">Condition</Label>
              <Select
                value={editForm.condition}
                onValueChange={(v) => setEditForm((f) => ({ ...f, condition: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
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
              onClick={handleEditAsset}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              Update Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ────────────────────────────────────────── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
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
    </div>
  )
}
