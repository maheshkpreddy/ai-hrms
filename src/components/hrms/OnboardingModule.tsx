'use client'

import { useState } from 'react'
import {
  UserPlus,
  FileText,
  GraduationCap,
  ClipboardCheck,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Upload,
  Calendar,
  Building2,
  Mail,
  Phone,
  ChevronRight,
  X,
  AlertCircle,
  Download,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewHire {
  id: string
  name: string
  email: string
  department: string
  designation: string
  joinDate: string
  status: 'pending' | 'in-progress' | 'completed'
  buddy: string
  manager: string
  progress: number
}

interface DocumentItem {
  id: string
  hireId: string
  documentName: string
  type: string
  status: 'pending' | 'uploaded' | 'verified' | 'rejected'
  uploadDate: string | null
}

interface TrainingSession {
  id: string
  hireId: string
  title: string
  trainer: string
  scheduledDate: string
  duration: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed'
  category: string
}

interface ProbationRecord {
  id: string
  hireId: string
  hireName: string
  department: string
  startDate: string
  endDate: string
  manager: string
  status: 'ongoing' | 'confirmed' | 'extended' | 'terminated'
  managerReview: string
  confirmationDate: string | null
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const initialNewHires: NewHire[] = [
  { id: 'NH001', name: 'Priya Sharma', email: 'priya.sharma@eh2r.com', department: 'Engineering', designation: 'Software Engineer', joinDate: '2024-02-01', status: 'in-progress', buddy: 'Rahul M.', manager: 'Vikram T.', progress: 60 },
  { id: 'NH002', name: 'Arun Kumar', email: 'arun.kumar@eh2r.com', department: 'HR', designation: 'HR Executive', joinDate: '2024-01-15', status: 'completed', buddy: 'Sneha R.', manager: 'Deepak N.', progress: 100 },
  { id: 'NH003', name: 'Meera Patel', email: 'meera.patel@eh2r.com', department: 'Sales', designation: 'Sales Associate', joinDate: '2024-02-10', status: 'pending', buddy: 'Amit S.', manager: 'Kavitha V.', progress: 5 },
  { id: 'NH004', name: 'Raj Singh', email: 'raj.singh@eh2r.com', department: 'Finance', designation: 'Financial Analyst', joinDate: '2024-01-20', status: 'in-progress', buddy: 'Neha G.', manager: 'Sanjay K.', progress: 45 },
  { id: 'NH005', name: 'Sneha Reddy', email: 'sneha.reddy@eh2r.com', department: 'Marketing', designation: 'Marketing Specialist', joinDate: '2024-02-05', status: 'completed', buddy: 'Divya P.', manager: 'Arjun L.', progress: 100 },
]

const initialDocuments: DocumentItem[] = [
  // Priya Sharma
  { id: 'D001', hireId: 'NH001', documentName: 'Aadhaar Card', type: 'Identity', status: 'verified', uploadDate: '2024-02-01' },
  { id: 'D002', hireId: 'NH001', documentName: 'PAN Card', type: 'Tax', status: 'verified', uploadDate: '2024-02-01' },
  { id: 'D003', hireId: 'NH001', documentName: 'Previous Offer Letter', type: 'Employment', status: 'uploaded', uploadDate: '2024-02-02' },
  { id: 'D004', hireId: 'NH001', documentName: 'Bank Details', type: 'Finance', status: 'pending', uploadDate: null },
  { id: 'D005', hireId: 'NH001', documentName: 'Medical Certificate', type: 'Health', status: 'pending', uploadDate: null },
  // Arun Kumar
  { id: 'D006', hireId: 'NH002', documentName: 'Aadhaar Card', type: 'Identity', status: 'verified', uploadDate: '2024-01-15' },
  { id: 'D007', hireId: 'NH002', documentName: 'PAN Card', type: 'Tax', status: 'verified', uploadDate: '2024-01-15' },
  { id: 'D008', hireId: 'NH002', documentName: 'Previous Offer Letter', type: 'Employment', status: 'verified', uploadDate: '2024-01-16' },
  { id: 'D009', hireId: 'NH002', documentName: 'Bank Details', type: 'Finance', status: 'verified', uploadDate: '2024-01-16' },
  // Meera Patel
  { id: 'D010', hireId: 'NH003', documentName: 'Aadhaar Card', type: 'Identity', status: 'pending', uploadDate: null },
  { id: 'D011', hireId: 'NH003', documentName: 'PAN Card', type: 'Tax', status: 'pending', uploadDate: null },
  { id: 'D012', hireId: 'NH003', documentName: 'Previous Offer Letter', type: 'Employment', status: 'pending', uploadDate: null },
  { id: 'D013', hireId: 'NH003', documentName: 'Bank Details', type: 'Finance', status: 'pending', uploadDate: null },
  // Raj Singh
  { id: 'D014', hireId: 'NH004', documentName: 'Aadhaar Card', type: 'Identity', status: 'verified', uploadDate: '2024-01-20' },
  { id: 'D015', hireId: 'NH004', documentName: 'PAN Card', type: 'Tax', status: 'uploaded', uploadDate: '2024-01-21' },
  { id: 'D016', hireId: 'NH004', documentName: 'Previous Offer Letter', type: 'Employment', status: 'pending', uploadDate: null },
  // Sneha Reddy
  { id: 'D017', hireId: 'NH005', documentName: 'Aadhaar Card', type: 'Identity', status: 'verified', uploadDate: '2024-02-05' },
  { id: 'D018', hireId: 'NH005', documentName: 'PAN Card', type: 'Tax', status: 'verified', uploadDate: '2024-02-05' },
  { id: 'D019', hireId: 'NH005', documentName: 'Previous Offer Letter', type: 'Employment', status: 'verified', uploadDate: '2024-02-06' },
  { id: 'D020', hireId: 'NH005', documentName: 'Bank Details', type: 'Finance', status: 'verified', uploadDate: '2024-02-06' },
]

const initialTraining: TrainingSession[] = [
  // Priya Sharma
  { id: 'TR001', hireId: 'NH001', title: 'Company Orientation', trainer: 'HR Team', scheduledDate: '2024-02-01', duration: '2h', status: 'completed', category: 'Orientation' },
  { id: 'TR002', hireId: 'NH001', title: 'IT Systems Setup & Security', trainer: 'IT Team', scheduledDate: '2024-02-02', duration: '3h', status: 'completed', category: 'IT' },
  { id: 'TR003', hireId: 'NH001', title: 'Engineering Onboarding', trainer: 'Vikram T.', scheduledDate: '2024-02-05', duration: '4h', status: 'in-progress', category: 'Department' },
  { id: 'TR004', hireId: 'NH001', title: 'Codebase Walkthrough', trainer: 'Rahul M.', scheduledDate: '2024-02-07', duration: '3h', status: 'scheduled', category: 'Technical' },
  // Arun Kumar
  { id: 'TR005', hireId: 'NH002', title: 'Company Orientation', trainer: 'HR Team', scheduledDate: '2024-01-15', duration: '2h', status: 'completed', category: 'Orientation' },
  { id: 'TR006', hireId: 'NH002', title: 'HR Systems Training', trainer: 'Deepak N.', scheduledDate: '2024-01-16', duration: '3h', status: 'completed', category: 'Department' },
  { id: 'TR007', hireId: 'NH002', title: 'Compliance & Policies', trainer: 'Legal Team', scheduledDate: '2024-01-18', duration: '2h', status: 'completed', category: 'Compliance' },
  // Meera Patel
  { id: 'TR008', hireId: 'NH003', title: 'Company Orientation', trainer: 'HR Team', scheduledDate: '2024-02-10', duration: '2h', status: 'scheduled', category: 'Orientation' },
  { id: 'TR009', hireId: 'NH003', title: 'Sales Process Training', trainer: 'Kavitha V.', scheduledDate: '2024-02-12', duration: '4h', status: 'scheduled', category: 'Department' },
  // Raj Singh
  { id: 'TR010', hireId: 'NH004', title: 'Company Orientation', trainer: 'HR Team', scheduledDate: '2024-01-20', duration: '2h', status: 'completed', category: 'Orientation' },
  { id: 'TR011', hireId: 'NH004', title: 'Finance Systems & Processes', trainer: 'Sanjay K.', scheduledDate: '2024-01-22', duration: '4h', status: 'in-progress', category: 'Department' },
  { id: 'TR012', hireId: 'NH004', title: 'Compliance & Policies', trainer: 'Legal Team', scheduledDate: '2024-01-25', duration: '2h', status: 'scheduled', category: 'Compliance' },
  // Sneha Reddy
  { id: 'TR013', hireId: 'NH005', title: 'Company Orientation', trainer: 'HR Team', scheduledDate: '2024-02-05', duration: '2h', status: 'completed', category: 'Orientation' },
  { id: 'TR014', hireId: 'NH005', title: 'Marketing Tools Training', trainer: 'Arjun L.', scheduledDate: '2024-02-06', duration: '3h', status: 'completed', category: 'Department' },
  { id: 'TR015', hireId: 'NH005', title: 'Brand Guidelines', trainer: 'Design Team', scheduledDate: '2024-02-08', duration: '2h', status: 'completed', category: 'Creative' },
]

const initialProbation: ProbationRecord[] = [
  { id: 'P001', hireId: 'NH001', hireName: 'Priya Sharma', department: 'Engineering', startDate: '2024-02-01', endDate: '2024-05-01', manager: 'Vikram T.', status: 'ongoing', managerReview: 'Strong technical skills, adapting well to team dynamics', confirmationDate: null },
  { id: 'P002', hireId: 'NH002', hireName: 'Arun Kumar', department: 'HR', startDate: '2024-01-15', endDate: '2024-04-15', manager: 'Deepak N.', status: 'confirmed', managerReview: 'Excellent communicator, proactive in process improvements', confirmationDate: '2024-04-10' },
  { id: 'P003', hireId: 'NH003', hireName: 'Meera Patel', department: 'Sales', startDate: '2024-02-10', endDate: '2024-05-10', manager: 'Kavitha V.', status: 'ongoing', managerReview: '', confirmationDate: null },
  { id: 'P004', hireId: 'NH004', hireName: 'Raj Singh', department: 'Finance', startDate: '2024-01-20', endDate: '2024-04-20', manager: 'Sanjay K.', status: 'ongoing', managerReview: 'Good analytical skills, needs to improve reporting speed', confirmationDate: null },
  { id: 'P005', hireId: 'NH005', hireName: 'Sneha Reddy', department: 'Marketing', startDate: '2024-02-05', endDate: '2024-05-05', manager: 'Arjun L.', status: 'confirmed', managerReview: 'Creative thinker, delivers quality content consistently', confirmationDate: '2024-05-01' },
]

// ─── Status Badge Helpers ─────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    'in-progress': { label: 'In Progress', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    uploaded: { label: 'Uploaded', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    verified: { label: 'Verified', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
    scheduled: { label: 'Scheduled', className: 'bg-violet-100 text-violet-700 border-violet-200' },
    ongoing: { label: 'Ongoing', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    extended: { label: 'Extended', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    terminated: { label: 'Terminated', className: 'bg-red-100 text-red-700 border-red-200' },
    missed: { label: 'Missed', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const cfg = config[status] || config.pending
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingModule() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const tabMap: Record<string, string> = {
    'new-hires': 'new-hires',
    'documents': 'document-collection',
    'training': 'induction-training',
    'probation': 'probation-tracking',
  }
  const [manualTab, setManualTab] = useState('new-hires')
  // Derive active tab: sidebar sub-item takes priority, then manual tab
  const activeTab = (activeSubItem && tabMap[activeSubItem]) ? tabMap[activeSubItem] : manualTab

  const handleTabChange = (tab: string) => {
    setManualTab(tab)
    setActiveSubItem(null)
  }
  const [newHires, setNewHires] = useState<NewHire[]>(initialNewHires)
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments)
  const [training, setTraining] = useState<TrainingSession[]>(initialTraining)
  const [probation, setProbation] = useState<ProbationRecord[]>(initialProbation)
  const [searchQuery, setSearchQuery] = useState('')
  const [addHireOpen, setAddHireOpen] = useState(false)
  const [viewHireOpen, setViewHireOpen] = useState(false)
  const [editHireOpen, setEditHireOpen] = useState(false)
  const [selectedHire, setSelectedHire] = useState<NewHire | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [hireForm, setHireForm] = useState({
    name: '', email: '', department: '', designation: '', joinDate: '', buddy: '', manager: '',
  })

  const filteredHires = newHires.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // CRUD handlers
  function handleAddHire() {
    const newHire: NewHire = {
      id: `NH${String(newHires.length + 1).padStart(3, '0')}`,
      ...hireForm,
      status: 'pending',
      progress: 0,
    }
    setNewHires(prev => [...prev, newHire])
    // Add default documents
    const defaultDocs = ['Aadhaar Card', 'PAN Card', 'Previous Offer Letter', 'Bank Details'].map((docName, i) => ({
      id: `D${String(documents.length + i + 1).padStart(3, '0')}`,
      hireId: newHire.id,
      documentName: docName,
      type: ['Identity', 'Tax', 'Employment', 'Finance'][i],
      status: 'pending' as const,
      uploadDate: null,
    }))
    setDocuments(prev => [...prev, ...defaultDocs])
    // Add probation record
    const endDate = new Date(newHire.joinDate)
    endDate.setMonth(endDate.getMonth() + 3)
    setProbation(prev => [...prev, {
      id: `P${String(prev.length + 1).padStart(3, '0')}`,
      hireId: newHire.id,
      hireName: newHire.name,
      department: newHire.department,
      startDate: newHire.joinDate,
      endDate: endDate.toISOString().split('T')[0],
      manager: newHire.manager,
      status: 'ongoing',
      managerReview: '',
      confirmationDate: null,
    }])
    setAddHireOpen(false)
    setHireForm({ name: '', email: '', department: '', designation: '', joinDate: '', buddy: '', manager: '' })
  }

  function handleEditHire() {
    if (!selectedHire) return
    setNewHires(prev => prev.map(h => h.id === selectedHire.id ? { ...h, ...hireForm } : h))
    setEditHireOpen(false)
    setSelectedHire(null)
    setHireForm({ name: '', email: '', department: '', designation: '', joinDate: '', buddy: '', manager: '' })
  }

  function handleDeleteHire(id: string) {
    setNewHires(prev => prev.filter(h => h.id !== id))
    setDocuments(prev => prev.filter(d => d.hireId !== id))
    setTraining(prev => prev.filter(t => t.hireId !== id))
    setProbation(prev => prev.filter(p => p.hireId !== id))
    setDeleteConfirm(null)
  }

  function handleConfirmProbation(probId: string) {
    setProbation(prev => prev.map(p =>
      p.id === probId ? { ...p, status: 'confirmed', confirmationDate: new Date().toISOString().split('T')[0] } : p
    ))
    const prob = probation.find(p => p.id === probId)
    if (prob) {
      setNewHires(prev => prev.map(h =>
        h.id === prob.hireId ? { ...h, status: 'completed', progress: 100 } : h
      ))
    }
  }

  function handleExtendProbation(probId: string) {
    setProbation(prev => prev.map(p => {
      if (p.id !== probId) return p
      const newEnd = new Date(p.endDate)
      newEnd.setMonth(newEnd.getMonth() + 1)
      return { ...p, status: 'extended', endDate: newEnd.toISOString().split('T')[0] }
    }))
  }

  function handleToggleTraining(sessionId: string) {
    setTraining(prev => prev.map(t => {
      if (t.id !== sessionId) return t
      if (t.status === 'completed') return { ...t, status: 'scheduled' as const }
      return { ...t, status: 'completed' as const }
    }))
  }

  // Stats
  const pendingCount = newHires.filter(h => h.status === 'pending').length
  const inProgressCount = newHires.filter(h => h.status === 'in-progress').length
  const completedCount = newHires.filter(h => h.status === 'completed').length

  const selectedHireDocs = selectedHire ? documents.filter(d => d.hireId === selectedHire.id) : []
  const selectedHireTraining = selectedHire ? training.filter(t => t.hireId === selectedHire.id) : []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
              <p className="text-muted-foreground text-sm">{newHires.length} new hires · {inProgressCount} in progress</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search hires..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 sm:w-[220px]"
              />
            </div>
            <Button onClick={() => setAddHireOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Hire
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-sky-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-sky-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="new-hires" className="gap-1.5"><UserPlus className="h-3.5 w-3.5" /> New Hires</TabsTrigger>
            <TabsTrigger value="document-collection" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Documents</TabsTrigger>
            <TabsTrigger value="induction-training" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Training</TabsTrigger>
            <TabsTrigger value="probation-tracking" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Probation</TabsTrigger>
          </TabsList>

          {/* ── New Hires Tab ── */}
          <TabsContent value="new-hires">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">New Hire</TableHead>
                        <TableHead className="hidden md:table-cell">Department</TableHead>
                        <TableHead className="hidden sm:table-cell">Designation</TableHead>
                        <TableHead className="hidden sm:table-cell">Join Date</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHires.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            No new hires found
                          </TableCell>
                        </TableRow>
                      ) : filteredHires.map(hire => (
                        <TableRow key={hire.id} className="group hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                {hire.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{hire.name}</p>
                                <p className="text-muted-foreground truncate text-xs">{hire.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{hire.department}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{hire.designation}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{formatDate(hire.joinDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Progress value={hire.progress} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground w-8">{hire.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(hire.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => { setSelectedHire(hire); setViewHireOpen(true) }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={() => {
                                setSelectedHire(hire)
                                setHireForm({ name: hire.name, email: hire.email, department: hire.department, designation: hire.designation, joinDate: hire.joinDate, buddy: hire.buddy, manager: hire.manager })
                                setEditHireOpen(true)
                              }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => setDeleteConfirm(hire.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Document Collection Tab ── */}
          <TabsContent value="document-collection">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" /> Document Collection Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {newHires.map(hire => {
                    const hireDocs = documents.filter(d => d.hireId === hire.id)
                    const verified = hireDocs.filter(d => d.status === 'verified').length
                    const total = hireDocs.length
                    const allVerified = verified === total && total > 0
                    return (
                      <Card key={hire.id} className={`border shadow-sm ${allVerified ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                {hire.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{hire.name}</p>
                                <p className="text-xs text-muted-foreground">{hire.department} · {hire.designation}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-[11px] ${allVerified ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}`}>
                              {verified}/{total} Verified
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {hireDocs.map(doc => (
                              <div key={doc.id} className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-2">
                                  <Upload className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{doc.documentName}</p>
                                    <p className="text-xs text-muted-foreground">{doc.type}{doc.uploadDate ? ` · ${formatDate(doc.uploadDate)}` : ''}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(doc.status)}
                                  {doc.status === 'pending' && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() =>
                                      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'uploaded', uploadDate: new Date().toISOString().split('T')[0] } : d))
                                    }>
                                      <Upload className="h-3 w-3" /> Upload
                                    </Button>
                                  )}
                                  {doc.status === 'uploaded' && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() =>
                                      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'verified' } : d))
                                    }>
                                      <CheckCircle2 className="h-3 w-3" /> Verify
                                    </Button>
                                  )}
                                  {doc.status === 'verified' && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                            {hireDocs.length === 0 && (
                              <p className="text-xs text-muted-foreground py-2 text-center">No documents required</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Induction Training Tab ── */}
          <TabsContent value="induction-training">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-600" /> Induction Training Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {newHires.filter(h => h.status !== 'completed').map(hire => {
                    const hireTraining = training.filter(t => t.hireId === hire.id)
                    const completedTraining = hireTraining.filter(t => t.status === 'completed').length
                    return (
                      <Card key={hire.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                {hire.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{hire.name}</p>
                                <p className="text-xs text-muted-foreground">{completedTraining}/{hireTraining.length} sessions completed</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={hireTraining.length > 0 ? (completedTraining / hireTraining.length) * 100 : 0} className="h-2 w-24" />
                              <span className="text-xs text-muted-foreground">{hireTraining.length > 0 ? Math.round((completedTraining / hireTraining.length) * 100) : 0}%</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {hireTraining.map(session => (
                              <button
                                key={session.id}
                                onClick={() => handleToggleTraining(session.id)}
                                className="flex items-center gap-3 w-full rounded-lg border p-2.5 text-left hover:bg-muted/50 transition-colors"
                              >
                                {session.status === 'completed' ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : session.status === 'in-progress' ? (
                                  <Clock className="h-4 w-4 text-sky-500 shrink-0" />
                                ) : session.status === 'missed' ? (
                                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${session.status === 'completed' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                                    {session.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {session.category} · {session.trainer} · {formatDate(session.scheduledDate)} · {session.duration}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(session.status)}
                                </div>
                              </button>
                            ))}
                            {hireTraining.length === 0 && (
                              <p className="text-xs text-muted-foreground py-2 text-center">No training scheduled</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  {newHires.filter(h => h.status !== 'completed').length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        All hires have completed their onboarding
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Probation Tracking Tab ── */}
          <TabsContent value="probation-tracking">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-emerald-600" /> Probation Period Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Employee</TableHead>
                        <TableHead className="hidden md:table-cell">Department</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead className="hidden sm:table-cell">End Date</TableHead>
                        <TableHead className="hidden lg:table-cell">Manager</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden xl:table-cell">Review</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {probation.map(rec => {
                        const daysLeft = Math.max(0, Math.ceil((new Date(rec.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        return (
                          <TableRow key={rec.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                                  {rec.hireName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{rec.hireName}</p>
                                  {rec.status === 'ongoing' && <p className="text-xs text-amber-600">{daysLeft} days remaining</p>}
                                  {rec.status === 'extended' && <p className="text-xs text-orange-600">Extended by 1 month</p>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">{rec.department}</TableCell>
                            <TableCell className="text-sm">{formatDate(rec.startDate)}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{formatDate(rec.endDate)}</TableCell>
                            <TableCell className="hidden lg:table-cell text-sm">{rec.manager}</TableCell>
                            <TableCell>{getStatusBadge(rec.status)}</TableCell>
                            <TableCell className="hidden xl:table-cell text-sm max-w-[200px] truncate">{rec.managerReview || '—'}</TableCell>
                            <TableCell className="text-right">
                              {rec.status === 'ongoing' && (
                                <div className="flex items-center justify-end gap-1">
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleConfirmProbation(rec.id)}>
                                    <CheckCircle2 className="h-3 w-3" /> Confirm
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-amber-600" onClick={() => handleExtendProbation(rec.id)}>
                                    <Clock className="h-3 w-3" /> Extend
                                  </Button>
                                </div>
                              )}
                              {rec.status === 'extended' && (
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600" onClick={() => handleConfirmProbation(rec.id)}>
                                  <CheckCircle2 className="h-3 w-3" /> Confirm
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Hire Dialog */}
      <Dialog open={addHireOpen} onOpenChange={setAddHireOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" /> Add New Hire
            </DialogTitle>
            <DialogDescription>Enter details for the new employee onboarding.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={hireForm.name} onChange={e => setHireForm({ ...hireForm, name: e.target.value })} placeholder="Full Name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={hireForm.email} onChange={e => setHireForm({ ...hireForm, email: e.target.value })} placeholder="email@eh2r.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={hireForm.department} onValueChange={v => setHireForm({ ...hireForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Input value={hireForm.designation} onChange={e => setHireForm({ ...hireForm, designation: e.target.value })} placeholder="Designation" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Join Date</Label>
                <Input type="date" value={hireForm.joinDate} onChange={e => setHireForm({ ...hireForm, joinDate: e.target.value })} />
              </div>
              <div>
                <Label>Buddy</Label>
                <Input value={hireForm.buddy} onChange={e => setHireForm({ ...hireForm, buddy: e.target.value })} placeholder="Assigned buddy" />
              </div>
            </div>
            <div>
              <Label>Reporting Manager</Label>
              <Input value={hireForm.manager} onChange={e => setHireForm({ ...hireForm, manager: e.target.value })} placeholder="Manager name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddHireOpen(false)}>Cancel</Button>
            <Button onClick={handleAddHire} className="bg-emerald-600 hover:bg-emerald-700" disabled={!hireForm.name || !hireForm.email}>Add Hire</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hire Dialog */}
      <Dialog open={editHireOpen} onOpenChange={setEditHireOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-emerald-600" /> Edit Hire Details
            </DialogTitle>
            <DialogDescription>Update the employee onboarding information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={hireForm.name} onChange={e => setHireForm({ ...hireForm, name: e.target.value })} placeholder="Full Name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={hireForm.email} onChange={e => setHireForm({ ...hireForm, email: e.target.value })} placeholder="email@eh2r.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select value={hireForm.department} onValueChange={v => setHireForm({ ...hireForm, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Input value={hireForm.designation} onChange={e => setHireForm({ ...hireForm, designation: e.target.value })} placeholder="Designation" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Join Date</Label>
                <Input type="date" value={hireForm.joinDate} onChange={e => setHireForm({ ...hireForm, joinDate: e.target.value })} />
              </div>
              <div>
                <Label>Buddy</Label>
                <Input value={hireForm.buddy} onChange={e => setHireForm({ ...hireForm, buddy: e.target.value })} placeholder="Assigned buddy" />
              </div>
            </div>
            <div>
              <Label>Reporting Manager</Label>
              <Input value={hireForm.manager} onChange={e => setHireForm({ ...hireForm, manager: e.target.value })} placeholder="Manager name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHireOpen(false)}>Cancel</Button>
            <Button onClick={handleEditHire} className="bg-emerald-600 hover:bg-emerald-700" disabled={!hireForm.name || !hireForm.email}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Hire Dialog */}
      <Dialog open={viewHireOpen} onOpenChange={setViewHireOpen}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {selectedHire?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p>{selectedHire?.name}</p>
                <p className="text-sm font-normal text-muted-foreground">{selectedHire?.designation} · {selectedHire?.department}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedHire && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedHire.status)}
                <div className="flex items-center gap-2">
                  <Progress value={selectedHire.progress} className="h-2 w-32" />
                  <span className="text-xs text-muted-foreground">{selectedHire.progress}%</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-600" /> {selectedHire.email}</div>
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-600" /> {selectedHire.department}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-600" /> {formatDate(selectedHire.joinDate)}</div>
                <div className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-emerald-600" /> Manager: {selectedHire.manager}</div>
              </div>
              <Separator />
              {selectedHireDocs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-600" /> Documents ({selectedHireDocs.filter(d => d.status === 'verified').length}/{selectedHireDocs.length})</h4>
                  <div className="space-y-1.5">
                    {selectedHireDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between text-sm rounded-lg border p-2">
                        <span>{doc.documentName}</span>
                        {getStatusBadge(doc.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedHireTraining.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-emerald-600" /> Training ({selectedHireTraining.filter(t => t.status === 'completed').length}/{selectedHireTraining.length})</h4>
                  <div className="space-y-1.5">
                    {selectedHireTraining.map(session => (
                      <div key={session.id} className="flex items-center justify-between text-sm rounded-lg border p-2">
                        <div className="flex items-center gap-2">
                          {session.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
                          <span className={session.status === 'completed' ? 'line-through text-muted-foreground' : ''}>{session.title}</span>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this hire and all associated data? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteHire(deleteConfirm)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
