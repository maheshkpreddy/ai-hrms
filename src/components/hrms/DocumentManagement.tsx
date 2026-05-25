'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
  FileCheck,
  FileClock,
  Shield,
  Lock,
  Users,
  Globe,
  Loader2,
  X,
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

interface DocumentEmployee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  department: string | null
  avatar: string | null
}

interface Document {
  id: string
  employeeId: string
  docType: string
  title: string
  fileUrl: string | null
  accessLevel: string | null
  uploadedBy: string | null
  employee: DocumentEmployee
  createdAt: string
}

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  department: string | null
}

interface DocumentsResponse {
  documents: Document[]
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

function getDocTypeBadge(type: string) {
  const config: Record<string, { label: string; className: string }> = {
    contract: {
      label: 'Contract',
      className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
    },
    policy: {
      label: 'Policy',
      className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
    },
    certificate: {
      label: 'Certificate',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    },
    'id-proof': {
      label: 'ID Proof',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
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

function getAccessLevelBadge(level: string | null) {
  if (!level) return <span className="text-muted-foreground text-xs">—</span>
  const config: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
    public: {
      label: 'Public',
      icon: Globe,
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    'hr-only': {
      label: 'HR Only',
      icon: Shield,
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
    manager: {
      label: 'Manager',
      icon: Users,
      className: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
    },
    private: {
      label: 'Private',
      icon: Lock,
      className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    },
  }
  const cfg = config[level]
  if (!cfg) return <span className="text-muted-foreground text-xs">{level}</span>
  const Icon = cfg.icon
  return (
    <Badge variant="secondary" className={`text-[11px] font-medium gap-1 ${cfg.className}`}>
      <Icon className="h-3 w-3" />
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

export default function DocumentManagement() {
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
  const [filterDocType, setFilterDocType] = useState('all')
  const [filterAccess, setFilterAccess] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  // Add Document Form
  const [addForm, setAddForm] = useState({
    employeeId: '',
    docType: 'contract',
    title: '',
    accessLevel: 'hr-only',
    uploadedBy: '',
  })

  // Edit Document Form
  const [editForm, setEditForm] = useState({
    id: '',
    title: '',
    docType: 'contract',
    accessLevel: 'hr-only',
  })

  // ── API hooks ─────────────────────────────────────────────────────────────

  const {
    data: documentsData,
    loading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useApi<DocumentsResponse>({
    baseUrl: '/api/documents',
    params: {
      page: 1,
      limit: 100,
      docType: filterDocType !== 'all' ? filterDocType : undefined,
      accessLevel: filterAccess !== 'all' ? filterAccess : undefined,
    },
  })

  // Employees list for the add form dropdown
  const {
    data: employeesData,
  } = useApi<EmployeesResponse>({
    baseUrl: '/api/employees',
    params: { page: 1, limit: 500 },
  })

  const documents = documentsData?.documents ?? []
  const employees = employeesData?.employees ?? []

  // Client-side search
  const filteredDocuments = useMemo(() => {
    let result = documents

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.docType.toLowerCase().includes(q) ||
          `${d.employee.firstName} ${d.employee.lastName}`.toLowerCase().includes(q)
      )
    }

    return result
  }, [documents, searchQuery])

  // Stats
  const totalDocs = documents.length
  const contractCount = documents.filter((d) => d.docType === 'contract').length
  const policyCount = documents.filter((d) => d.docType === 'policy').length
  const certCount = documents.filter((d) => d.docType === 'certificate').length
  const idProofCount = documents.filter((d) => d.docType === 'id-proof').length
  const otherDocCount = documents.filter((d) => d.docType === 'other').length

  const publicCount = documents.filter((d) => d.accessLevel === 'public').length
  const hrOnlyCount = documents.filter((d) => d.accessLevel === 'hr-only').length
  const managerCount = documents.filter((d) => d.accessLevel === 'manager').length
  const privateCount = documents.filter((d) => d.accessLevel === 'private').length

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddDialogChange = useCallback((open: boolean) => {
    setAddOpen(open)
    if (!open) {
      setAddForm({
        employeeId: '',
        docType: 'contract',
        title: '',
        accessLevel: 'hr-only',
        uploadedBy: '',
      })
    }
  }, [])

  async function handleAddDocument() {
    if (!addForm.employeeId || !addForm.docType || !addForm.title) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/documents', {
        employeeId: addForm.employeeId,
        docType: addForm.docType,
        title: addForm.title,
        accessLevel: addForm.accessLevel,
        uploadedBy: addForm.uploadedBy || null,
      })
      toast({
        title: 'Document Added',
        description: `${addForm.title} has been uploaded successfully.`,
      })
      setAddOpen(false)
      setAddForm({
        employeeId: '',
        docType: 'contract',
        title: '',
        accessLevel: 'hr-only',
        uploadedBy: '',
      })
      refetchDocuments()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add document',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(doc: Document) {
    setSelectedDoc(doc)
    setEditForm({
      id: doc.id,
      title: doc.title,
      docType: doc.docType,
      accessLevel: doc.accessLevel || 'hr-only',
    })
    setEditOpen(true)
  }

  async function handleEditDocument() {
    setSaving(true)
    try {
      await apiPatch('/api/documents', {
        id: editForm.id,
        title: editForm.title,
        docType: editForm.docType,
        accessLevel: editForm.accessLevel,
      })
      toast({
        title: 'Document Updated',
        description: `Document has been updated successfully.`,
      })
      setEditOpen(false)
      setSelectedDoc(null)
      refetchDocuments()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update document',
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
      await apiDelete(`/api/documents?id=${deleteConfirm}`)
      toast({
        title: 'Document Deleted',
        description: 'Document has been removed.',
        variant: 'destructive',
      })
      setDeleteConfirm(null)
      refetchDocuments()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete document',
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
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Document Management
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                >
                  {totalDocs}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage employee documents and access control
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, type, or employee..."
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
              Add Document
            </Button>
          </div>
        </div>

        {/* ─── Stats Cards ──────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Documents</p>
                  <p className="text-2xl font-bold">{totalDocs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                  <FileCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Contracts / Policies</p>
                  <p className="text-2xl font-bold">{contractCount + policyCount}</p>
                  <p className="text-[10px] text-muted-foreground">{contractCount} contracts · {policyCount} policies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                  <FileClock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Certificates / ID</p>
                  <p className="text-2xl font-bold">{certCount + idProofCount}</p>
                  <p className="text-[10px] text-muted-foreground">{certCount} certs · {idProofCount} IDs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Restricted Access</p>
                  <p className="text-2xl font-bold">{hrOnlyCount + privateCount}</p>
                  <p className="text-[10px] text-muted-foreground">{hrOnlyCount} HR-only · {privateCount} private</p>
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
                <Select value={filterDocType} onValueChange={setFilterDocType}>
                  <SelectTrigger className="w-full sm:w-[170px]" size="sm">
                    <SelectValue placeholder="Doc Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="id-proof">ID Proof</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAccess} onValueChange={setFilterAccess}>
                  <SelectTrigger className="w-full sm:w-[160px]" size="sm">
                    <SelectValue placeholder="Access Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Access Levels</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="hr-only">HR Only</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(filterDocType !== 'all' || filterAccess !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground"
                  onClick={() => {
                    setFilterDocType('all')
                    setFilterAccess('all')
                  }}
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Document Table ───────────────────────────────────────── */}
        <Card>
          <CardContent className="p-0">
            {documentsLoading ? (
              <LoadingSpinner message="Loading documents..." />
            ) : documentsError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <p className="text-destructive text-sm">{documentsError}</p>
                <Button variant="outline" size="sm" onClick={refetchDocuments}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="pl-4">Document Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead className="hidden md:table-cell">Access Level</TableHead>
                      <TableHead className="hidden lg:table-cell">Uploaded By</TableHead>
                      <TableHead className="hidden sm:table-cell">Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground/50" />
                            <p>No documents found</p>
                            <p className="text-xs">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc.id} className="group">
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {doc.title}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getDocTypeBadge(doc.docType)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400">
                                {doc.employee.firstName.charAt(0)}{doc.employee.lastName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {doc.employee.firstName} {doc.employee.lastName}
                                </p>
                                <p className="text-muted-foreground truncate text-[11px]">
                                  {doc.employee.department}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getAccessLevelBadge(doc.accessLevel)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {doc.uploadedBy || '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">
                            {formatDate(doc.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                                onClick={() => handleEdit(doc)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                onClick={() => setDeleteConfirm(doc.id)}
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
            {!documentsLoading && !documentsError && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-sm">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {filteredDocuments.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-foreground">
                    {documentsData?.pagination?.total ?? documents.length}
                  </span>{' '}
                  documents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Add Document Dialog ────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={handleAddDialogChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add New Document
            </DialogTitle>
            <DialogDescription>
              Upload a document record for an employee
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
                <Label htmlFor="docType">Document Type *</Label>
                <Select
                  value={addForm.docType}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, docType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="id-proof">ID Proof</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select
                  value={addForm.accessLevel}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, accessLevel: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="hr-only">HR Only</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={addForm.title}
                onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Employment Contract 2024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="uploadedBy">Uploaded By</Label>
              <Input
                id="uploadedBy"
                value={addForm.uploadedBy}
                onChange={(e) => setAddForm((f) => ({ ...f, uploadedBy: e.target.value }))}
                placeholder="Name of the person uploading"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddDocument}
              disabled={saving || !addForm.employeeId || !addForm.title}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Document Dialog ───────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600" />
              Edit Document
            </DialogTitle>
            <DialogDescription>
              Update document details for &ldquo;{selectedDoc?.title}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editTitle">Title</Label>
              <Input
                id="editTitle"
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editDocType">Document Type</Label>
                <Select
                  value={editForm.docType}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, docType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="id-proof">ID Proof</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editAccessLevel">Access Level</Label>
                <Select
                  value={editForm.accessLevel}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, accessLevel: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="hr-only">HR Only</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleEditDocument}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              Update Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm ────────────────────────────────────────── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
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
