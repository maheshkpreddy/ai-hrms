'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  FileText,
  Download,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Database,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileDown,
  AlertCircle,
  Users,
  Building2,
  FileCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: 'Create' | 'Read' | 'Update' | 'Delete' | 'Login' | 'Export' | 'Approve' | 'Alert' | 'Process' | 'Download'
  module: string
  details: string
  ipAddress: string
  severity: 'info' | 'warning' | 'critical'
}

interface ComplianceItem {
  id: string
  name: string
  score: number
  status: 'compliant' | 'non-compliant' | 'pending' | 'expiring'
  nextDue: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  extraInfo: string
}

interface ExportOption {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  estimatedSize: string
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const initialLogs: AuditLog[] = [
  { id: 'AL001', timestamp: '2026-05-21 09:45:12', user: 'Aarav Sharma', action: 'Login', module: 'Authentication', details: 'User logged in from Chrome/Windows', ipAddress: '192.168.1.105', severity: 'info' },
  { id: 'AL002', timestamp: '2026-05-21 09:52:30', user: 'HR Admin', action: 'Create', module: 'Employees', details: 'Created employee record for Rohan Joshi (EMP005)', ipAddress: '192.168.1.100', severity: 'info' },
  { id: 'AL003', timestamp: '2026-05-21 10:05:15', user: 'Meera Patel', action: 'Update', module: 'Leave', details: 'Applied for casual leave from May 25-27', ipAddress: '192.168.1.112', severity: 'info' },
  { id: 'AL004', timestamp: '2026-05-21 10:15:00', user: 'System', action: 'Alert', module: 'Security', details: 'Failed login attempt (3rd) for user admin@test.com', ipAddress: '103.45.67.89', severity: 'critical' },
  { id: 'AL005', timestamp: '2026-05-21 10:22:45', user: 'Finance Team', action: 'Process', module: 'Payroll', details: 'Payroll processing initiated for May 2026', ipAddress: '192.168.1.108', severity: 'info' },
  { id: 'AL006', timestamp: '2026-05-21 10:30:00', user: 'Vikram Singh', action: 'Download', module: 'Documents', details: 'Downloaded offer letter template', ipAddress: '192.168.1.115', severity: 'info' },
  { id: 'AL007', timestamp: '2026-05-21 10:45:22', user: 'IT Admin', action: 'Delete', module: 'Assets', details: 'Retired laptop asset AST-045', ipAddress: '192.168.1.100', severity: 'warning' },
  { id: 'AL008', timestamp: '2026-05-21 11:00:00', user: 'System', action: 'Process', module: 'System', details: 'Daily database backup completed successfully', ipAddress: '10.0.0.1', severity: 'info' },
  { id: 'AL009', timestamp: '2026-05-21 11:15:33', user: 'Ananya Reddy', action: 'Update', module: 'Employees', details: 'Updated emergency contact for EMP004', ipAddress: '192.168.1.120', severity: 'info' },
  { id: 'AL010', timestamp: '2026-05-21 11:30:10', user: 'HR Admin', action: 'Create', module: 'Policies', details: 'Created new WFH policy document', ipAddress: '192.168.1.100', severity: 'info' },
  { id: 'AL011', timestamp: '2026-05-21 11:45:55', user: 'Suresh Nair', action: 'Update', module: 'Exit', details: 'Submitted resignation request', ipAddress: '192.168.1.125', severity: 'warning' },
  { id: 'AL012', timestamp: '2026-05-21 12:00:00', user: 'System', action: 'Process', module: 'Attendance', details: 'Auto-absent marked for 2 employees (no check-in)', ipAddress: '10.0.0.1', severity: 'warning' },
  { id: 'AL013', timestamp: '2026-05-21 12:15:40', user: 'Rahul M.', action: 'Approve', module: 'Leave', details: 'Approved leave for Meera Patel (May 25-27)', ipAddress: '192.168.1.101', severity: 'info' },
  { id: 'AL014', timestamp: '2026-05-21 12:30:22', user: 'Recruiter', action: 'Create', module: 'Recruitment', details: 'Created job posting for Senior Developer', ipAddress: '192.168.1.130', severity: 'info' },
  { id: 'AL015', timestamp: '2026-05-21 13:00:00', user: 'System', action: 'Alert', module: 'Security', details: 'Password expiry notification sent to 5 users', ipAddress: '10.0.0.1', severity: 'warning' },
  { id: 'AL016', timestamp: '2026-05-21 13:15:10', user: 'Payroll Admin', action: 'Update', module: 'Payroll', details: 'Updated tax slab configuration for FY2026-27', ipAddress: '192.168.1.108', severity: 'warning' },
  { id: 'AL017', timestamp: '2026-05-21 13:30:45', user: 'Aarav Sharma', action: 'Read', module: 'Payslip', details: 'Viewed payslip for April 2026', ipAddress: '192.168.1.105', severity: 'info' },
  { id: 'AL018', timestamp: '2026-05-21 14:00:00', user: 'HR Admin', action: 'Export', module: 'Reports', details: 'Monthly attendance report exported', ipAddress: '192.168.1.100', severity: 'info' },
  { id: 'AL019', timestamp: '2026-05-21 14:15:33', user: 'Admin', action: 'Update', module: 'RBAC', details: 'Modified permissions for Manager role', ipAddress: '192.168.1.100', severity: 'critical' },
  { id: 'AL020', timestamp: '2026-05-21 14:30:00', user: 'Kavitha Menon', action: 'Create', module: 'Helpdesk', details: 'Raised helpdesk ticket HD-2026-008', ipAddress: '192.168.1.135', severity: 'info' },
]

const complianceData: ComplianceItem[] = [
  { id: 'CR001', name: 'GDPR Compliance', score: 92, status: 'compliant', nextDue: '2026-08-15', description: 'General Data Protection Regulation adherence for employee data handling and privacy', icon: Shield, extraInfo: 'Data processing agreements up to date' },
  { id: 'CR002', name: 'Statutory Compliance', score: 88, status: 'compliant', nextDue: '2026-07-01', description: 'PF, ESI, PT, TDS, and other statutory compliance requirements', icon: Building2, extraInfo: 'PF & ESI returns filed for Q4' },
  { id: 'CR003', name: 'Document Expiry', score: 76, status: 'expiring', nextDue: '2026-06-01', description: 'Track employee document expirations — 3 documents expiring soon', icon: FileText, extraInfo: '3 documents expiring within 30 days' },
  { id: 'CR004', name: 'Policy Acknowledgment', score: 95, status: 'compliant', nextDue: '2026-12-31', description: 'Employee acknowledgment of company policies and code of conduct', icon: FileCheck, extraInfo: '47/50 employees have acknowledged' },
  { id: 'CR005', name: 'POSH Compliance', score: 100, status: 'compliant', nextDue: '2026-12-31', description: 'Prevention of Sexual Harassment at Workplace Act compliance', icon: Users, extraInfo: 'ICC committee formed and trained' },
  { id: 'CR006', name: 'Data Retention Policy', score: 65, status: 'pending', nextDue: '2026-06-15', description: 'Review data retention and deletion policies for compliance', icon: Database, extraInfo: 'Data retention audit pending' },
]

const exportOptions: ExportOption[] = [
  { id: 'EX001', title: 'Employee Data', description: 'Export complete employee directory with personal, professional, and payroll fields', icon: Users, estimatedSize: '~2.5 MB' },
  { id: 'EX002', title: 'Attendance Records', description: 'Export attendance records with check-in/out timestamps and overtime data', icon: Clock, estimatedSize: '~3.2 MB' },
  { id: 'EX003', title: 'Payroll History', description: 'Export payroll data for all employees across selected period', icon: Database, estimatedSize: '~1.8 MB' },
  { id: 'EX004', title: 'Leave Records', description: 'Export all leave applications, balances, and approval history', icon: Calendar, estimatedSize: '~0.8 MB' },
  { id: 'EX005', title: 'Audit Logs', description: 'Export complete audit trail with all activities and security events', icon: Shield, estimatedSize: '~5.1 MB' },
]

const ITEMS_PER_PAGE = 8

function getSeverityBadge(severity: string) {
  const config: Record<string, { label: string; className: string }> = {
    info: { label: 'Info', className: 'bg-sky-100 text-sky-700 border-sky-200' },
    warning: { label: 'Warning', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    critical: { label: 'Critical', className: 'bg-red-100 text-red-700 border-red-200' },
  }
  const cfg = config[severity] || config.info
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

function getActionBadge(action: string) {
  const config: Record<string, { className: string }> = {
    Create: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Read: { className: 'bg-sky-100 text-sky-700 border-sky-200' },
    Update: { className: 'bg-amber-100 text-amber-700 border-amber-200' },
    Delete: { className: 'bg-red-100 text-red-700 border-red-200' },
    Login: { className: 'bg-violet-100 text-violet-700 border-violet-200' },
    Export: { className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    Approve: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Alert: { className: 'bg-orange-100 text-orange-700 border-orange-200' },
    Process: { className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    Download: { className: 'bg-sky-100 text-sky-700 border-sky-200' },
  }
  const cfg = config[action] || { className: 'bg-gray-100 text-gray-700 border-gray-200' }
  return <Badge variant="outline" className={`text-[10px] font-medium ${cfg.className}`}>{action}</Badge>
}

function getComplianceBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    compliant: { label: 'Compliant', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    'non-compliant': { label: 'Non-Compliant', className: 'bg-red-100 text-red-700 border-red-200' },
    pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    expiring: { label: 'Expiring Soon', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  }
  const cfg = config[status] || config.pending
  return <Badge variant="outline" className={`text-[11px] font-medium ${cfg.className}`}>{cfg.label}</Badge>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuditCompliance() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [localTab, setLocalTab] = useState('audit-logs')
  const [logs] = useState<AuditLog[]>(initialLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModule, setFilterModule] = useState('all')
  const [filterAction, setFilterAction] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Data Export state
  const [exportType, setExportType] = useState<string>('')
  const [exportDateFrom, setExportDateFrom] = useState('')
  const [exportDateTo, setExportDateTo] = useState('')
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [exporting, setExporting] = useState(false)

  const tabMap: Record<string, string> = { 'logs': 'audit-logs', 'compliance': 'compliance-reports', 'export': 'data-export', 'audit-logs-view': 'audit-logs', 'data-security': 'data-export' }

  // Sync sidebar sub-item to local tab and clear it
  useEffect(() => {
    if (activeSubItem && tabMap[activeSubItem]) {
      setLocalTab(tabMap[activeSubItem])
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // Derive active tab: sidebar sub-item takes priority, then local tab
  const activeTab = (activeSubItem && tabMap[activeSubItem]) || localTab

  const handleTabChange = (tab: string) => {
    setLocalTab(tab)
    setActiveSubItem(null)
  }

  const modules = [...new Set(logs.map(l => l.module))]
  const actions = [...new Set(logs.map(l => l.action))]

  const filteredLogs = logs.filter(l =>
    (filterModule === 'all' || l.module === filterModule) &&
    (filterAction === 'all' || l.action === filterAction) &&
    (filterSeverity === 'all' || l.severity === filterSeverity) &&
    (l.user.toLowerCase().includes(searchQuery.toLowerCase()) || l.details.toLowerCase().includes(searchQuery.toLowerCase()) || l.module.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const criticalCount = logs.filter(l => l.severity === 'critical').length
  const warningCount = logs.filter(l => l.severity === 'warning').length
  const avgCompliance = Math.round(complianceData.reduce((s, c) => s + c.score, 0) / complianceData.length)

  function handleExport() {
    if (!exportType) return
    setExporting(true)
    setTimeout(() => setExporting(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Audit & Compliance</h1>
              <p className="text-muted-foreground text-sm">{logs.length} log entries · {criticalCount} critical alerts</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-sky-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{criticalCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold">{warningCount}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Avg Compliance</p>
              <p className="text-2xl font-bold">{avgCompliance}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="audit-logs" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Audit Logs</TabsTrigger>
            <TabsTrigger value="compliance-reports" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Compliance</TabsTrigger>
            <TabsTrigger value="data-export" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Data Export</TabsTrigger>
          </TabsList>

          {/* ─── Audit Logs Tab ──────────────────────────────────────────── */}
          <TabsContent value="audit-logs">
            {/* Filters */}
            <Card className="mb-4">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                  <span className="text-sm text-muted-foreground font-medium flex items-center gap-1"><Filter className="h-3.5 w-3.5" /> Filters:</span>
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search logs..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="h-9 pl-9" />
                  </div>
                  <Select value={filterModule} onValueChange={v => { setFilterModule(v); setCurrentPage(1) }}>
                    <SelectTrigger className="w-full sm:w-[150px]" ><SelectValue placeholder="Module" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Modules</SelectItem>{modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={filterAction} onValueChange={v => { setFilterAction(v); setCurrentPage(1) }}>
                    <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Action" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Actions</SelectItem>{actions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={v => { setFilterSeverity(v); setCurrentPage(1) }}>
                    <SelectTrigger className="w-full sm:w-[120px]"><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="pl-4">Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden md:table-cell">Module</TableHead>
                        <TableHead className="hidden lg:table-cell">Details</TableHead>
                        <TableHead className="hidden xl:table-cell">IP Address</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No logs found</TableCell></TableRow>
                      ) : paginatedLogs.map(log => (
                        <TableRow key={log.id} className={log.severity === 'critical' ? 'bg-red-50/50' : ''}>
                          <TableCell className="pl-4 text-xs font-mono whitespace-nowrap">{log.timestamp}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold">
                                {log.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span>{log.user}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{log.module}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm max-w-[250px] truncate">{log.details}</TableCell>
                          <TableCell className="hidden xl:table-cell text-xs font-mono text-muted-foreground">{log.ipAddress}</TableCell>
                          <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="border-t px-4 py-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" className={`h-8 w-8 p-0 ${page === currentPage ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`} onClick={() => setCurrentPage(page)}>
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Compliance Reports Tab ──────────────────────────────────── */}
          <TabsContent value="compliance-reports">
            <div className="grid gap-4 sm:grid-cols-2">
              {complianceData.map(report => {
                const Icon = report.icon
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                            <Icon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{report.name}</p>
                            {getComplianceBadge(report.status)}
                          </div>
                        </div>
                        <span className={`text-2xl font-bold ${report.score >= 90 ? 'text-emerald-600' : report.score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {report.score}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{report.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={report.score} className="h-2.5 flex-1" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>{report.extraInfo}</span>
                        <span>Next review: {report.nextDue}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="h-3 w-3" /> View Details</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /> Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* ─── Data Export Tab ──────────────────────────────────────────── */}
          <TabsContent value="data-export">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Export Options */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Export Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {exportOptions.map(opt => {
                      const Icon = opt.icon
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${exportType === opt.id ? 'border-emerald-400 bg-emerald-50/50' : 'hover:bg-muted/30'}`}
                          onClick={() => setExportType(opt.id)}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${exportType === opt.id ? 'bg-emerald-100' : 'bg-muted'}`}>
                            <Icon className={`h-5 w-5 ${exportType === opt.id ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{opt.title}</p>
                              <span className="text-[10px] text-muted-foreground">{opt.estimatedSize}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${exportType === opt.id ? 'border-emerald-600' : 'border-muted-foreground/30'}`}>
                            {exportType === opt.id && <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Export Configuration */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Export Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm">Date Range</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <Input type="date" value={exportDateFrom} onChange={e => setExportDateFrom(e.target.value)} className="h-9 text-sm" placeholder="From" />
                          <p className="text-[10px] text-muted-foreground mt-0.5">From</p>
                        </div>
                        <div>
                          <Input type="date" value={exportDateTo} onChange={e => setExportDateTo(e.target.value)} className="h-9 text-sm" placeholder="To" />
                          <p className="text-[10px] text-muted-foreground mt-0.5">To</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Export Format</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <button
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-colors ${exportFormat === 'csv' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'hover:bg-muted/30'}`}
                          onClick={() => setExportFormat('csv')}
                        >
                          <FileText className="h-5 w-5" />
                          CSV
                        </button>
                        <button
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-colors ${exportFormat === 'excel' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'hover:bg-muted/30'}`}
                          onClick={() => setExportFormat('excel')}
                        >
                          <FileSpreadsheet className="h-5 w-5" />
                          Excel
                        </button>
                        <button
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-colors ${exportFormat === 'pdf' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'hover:bg-muted/30'}`}
                          onClick={() => setExportFormat('pdf')}
                        >
                          <FileDown className="h-5 w-5" />
                          PDF
                        </button>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Selected: <span className="font-medium text-foreground">{exportType ? exportOptions.find(o => o.id === exportType)?.title : 'None'}</span></p>
                      <p>Format: <span className="font-medium text-foreground">{exportFormat.toUpperCase()}</span></p>
                      {exportDateFrom && exportDateTo && (
                        <p>Period: <span className="font-medium text-foreground">{exportDateFrom} to {exportDateTo}</span></p>
                      )}
                    </div>
                    <Button
                      className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                      disabled={!exportType || exporting}
                      onClick={handleExport}
                    >
                      {exporting ? (
                        <><CheckCircle2 className="h-4 w-4" /> Exporting...</>
                      ) : (
                        <><Download className="h-4 w-4" /> Export Data</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
