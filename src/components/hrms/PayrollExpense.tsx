'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Banknote,
  CheckCircle2,
  Clock,
  CalendarDays,
  IndianRupee,
  FileText,
  Download,
  Play,
  Plus,
  Plane,
  BedDouble,
  Monitor,
  UtensilsCrossed,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Upload,
  Send,
  ChevronDown,
  Receipt,
  Users,
  AlertCircle,
  FileDown,
  HandCoins,
  HeartPulse,
  Home,
  ReceiptText,
  Calculator,
  Loader2,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
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
import { useApi, apiPost, apiPatch } from '@/lib/useApi'
import { exportPayrollReport, exportExpenseReport } from '@/lib/excelExport'
import { useHRMSStore } from '@/lib/store'

// ─── API Response Types ──────────────────────────────────────────────────────
interface PayrollRecord {
  id: string
  employeeId: string
  month: string
  year: number
  basicSalary: number
  hra: number
  da: number
  conveyance: number
  medical: number
  bonus: number
  grossPay: number
  pf: number
  esi: number
  tax: number
  professionalTax: number
  totalDeductions: number
  netPay: number
  status: string
  employee: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
    department: string | null
    avatar: string | null
  }
}

interface ExpenseRecord {
  id: string
  employeeId: string
  category: string
  amount: number
  description: string | null
  receiptUrl: string | null
  date: string
  status: string
  approvedBy: string | null
  comments: string | null
  employee: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
    department: string | null
    avatar: string | null
  }
}

interface PayrollApiResponse {
  records: PayrollRecord[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

interface ExpenseApiResponse {
  expenses: ExpenseRecord[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

// ─── Flattened display types (matches component expectations) ────────────────
interface PayrollRow {
  id: string
  employeeId: string
  dbEmployeeId: string
  name: string
  month: string
  year: number
  basicSalary: number
  hra: number
  da: number
  conveyance: number
  medical: number
  bonus: number
  grossPay: number
  pf: number
  esi: number
  tax: number
  professionalTax: number
  totalDeductions: number
  netPay: number
  status: string
}

interface ExpenseRow {
  id: string
  employeeId: string
  name: string
  category: string
  amount: number
  description: string
  date: string
  status: string
  approvedBy: string | null
}

function flattenPayroll(r: PayrollRecord): PayrollRow {
  return {
    id: r.id,
    employeeId: r.employee.employeeId,
    dbEmployeeId: r.employeeId,
    name: `${r.employee.firstName} ${r.employee.lastName}`,
    month: r.month,
    year: r.year,
    basicSalary: r.basicSalary,
    hra: r.hra,
    da: r.da,
    conveyance: r.conveyance,
    medical: r.medical,
    bonus: r.bonus,
    grossPay: r.grossPay,
    pf: r.pf,
    esi: r.esi,
    tax: r.tax,
    professionalTax: r.professionalTax,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    status: r.status,
  }
}

function flattenExpense(r: ExpenseRecord): ExpenseRow {
  return {
    id: r.id,
    employeeId: r.employee.employeeId,
    name: `${r.employee.firstName} ${r.employee.lastName}`,
    category: r.category,
    amount: r.amount,
    description: r.description ?? '',
    date: r.date,
    status: r.status,
    approvedBy: r.approvedBy,
  }
}

// ─── Color palette (emerald-centric, no blue/indigo) ────────────────────────
const EMERALD = '#10b981'
const AMBER = '#f59e0b'
const ROSE = '#f43f5e'
const TEAL = '#14b8a6'
const ORANGE = '#f97316'
const CYAN = '#06b6d4'

const SALARY_PIE_COLORS = [EMERALD, TEAL, AMBER, ROSE, ORANGE, CYAN]

// ─── Chart tooltip style ─────────────────────────────────────────────────────
const customTooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemStyle: { padding: '2px 0' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtShort = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`
  return fmt(n)
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_INDEX: Record<string, number> = Object.fromEntries(MONTHS.map((m, i) => [m, i + 1]))

// ─── Tax Declarations Mock ────────────────────────────────────────────────────
interface TaxSection {
  section: string
  label: string
  icon: React.ElementType
  limit: number
  items: { name: string; declared: number; proofSubmitted: number }[]
}

const taxSections: TaxSection[] = [
  {
    section: '80C',
    label: 'Section 80C',
    icon: HandCoins,
    limit: 150000,
    items: [
      { name: 'PPF', declared: 50000, proofSubmitted: 50000 },
      { name: 'ELSS', declared: 35000, proofSubmitted: 20000 },
      { name: 'Life Insurance', declared: 25000, proofSubmitted: 25000 },
    ],
  },
  {
    section: '80D',
    label: 'Section 80D',
    icon: HeartPulse,
    limit: 75000,
    items: [
      { name: 'Health Insurance (Self)', declared: 30000, proofSubmitted: 30000 },
      { name: 'Health Insurance (Parents)', declared: 35000, proofSubmitted: 15000 },
    ],
  },
  {
    section: 'HRA',
    label: 'HRA Exemption',
    icon: Home,
    limit: 300000,
    items: [
      { name: 'Rent Paid', declared: 240000, proofSubmitted: 180000 },
    ],
  },
  {
    section: 'Other',
    label: 'Other Deductions',
    icon: ReceiptText,
    limit: 50000,
    items: [
      { name: 'NPS Contribution', declared: 20000, proofSubmitted: 20000 },
      { name: 'Donations (80G)', declared: 10000, proofSubmitted: 0 },
    ],
  },
]

// ─── Monthly expense trend (computed from API data when available) ──────────
const defaultMonthlyExpenseTrend = [
  { month: 'Aug', amount: 42000 },
  { month: 'Sep', amount: 38500 },
  { month: 'Oct', amount: 51200 },
  { month: 'Nov', amount: 47800 },
  { month: 'Dec', amount: 54300 },
  { month: 'Jan', amount: 56200 },
]

// ─── Category badge config ───────────────────────────────────────────────────
const categoryConfig: Record<string, { icon: React.ElementType; bg: string; text: string }> = {
  Travel: { icon: Plane, bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-400' },
  Accommodation: { icon: BedDouble, bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-400' },
  Equipment: { icon: Monitor, bg: 'bg-cyan-100 dark:bg-cyan-950', text: 'text-cyan-700 dark:text-cyan-400' },
  Food: { icon: UtensilsCrossed, bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-400' },
}

// ─── Status badge helper ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    processed: { label: 'Processed', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
    pending: { label: 'Pending', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' },
    approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
    rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' },
    reimbursed: { label: 'Reimbursed', className: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400' },
  }
  const cfg = map[status] ?? { label: status, className: '' }
  return (
    <Badge variant="secondary" className={`text-[10px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </Badge>
  )
}

// ─── Salary Breakdown Dialog ─────────────────────────────────────────────────
function SalaryBreakdownDialog({ row }: { row: PayrollRow }) {
  const pieData = [
    { name: 'Basic Salary', value: row.basicSalary },
    { name: 'HRA', value: row.hra },
    { name: 'DA', value: row.da },
    { name: 'Conveyance + Medical', value: row.conveyance + row.medical },
    { name: 'Bonus', value: row.bonus },
  ].filter((d) => d.value > 0)

  const deductionData = [
    { name: 'PF', value: row.pf },
    { name: 'ESI', value: row.esi },
    { name: 'Income Tax', value: row.tax },
    { name: 'Prof. Tax', value: row.professionalTax },
  ]

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-emerald-600" />
          Salary Breakdown — {row.name}
        </DialogTitle>
        <DialogDescription>
          {row.month} {row.year} &middot; Employee ID: {row.employeeId}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Earnings Pie */}
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">Earnings</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={SALARY_PIE_COLORS[i % SALARY_PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...customTooltipStyle} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: SALARY_PIE_COLORS[i % SALARY_PIE_COLORS.length] }}
                  />
                  {d.name}
                </span>
                <span className="font-medium">{fmt(d.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-1 text-xs font-semibold">
              <span>Gross Pay</span>
              <span className="text-emerald-700 dark:text-emerald-400">{fmt(row.grossPay)}</span>
            </div>
          </div>
        </div>

        {/* Deductions List */}
        <div>
          <p className="mb-2 text-sm font-semibold text-rose-600 dark:text-rose-400">Deductions</p>
          <div className="space-y-1">
            {deductionData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span>{d.name}</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">−{fmt(d.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-1 text-xs font-semibold">
              <span>Total Deductions</span>
              <span className="text-rose-600 dark:text-rose-400">−{fmt(row.totalDeductions)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/40">
            <p className="text-xs text-muted-foreground">Net Pay</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{fmt(row.netPay)}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
          <Download className="h-4 w-4" />
          Download Payslip
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// ─── Submit Expense Dialog ───────────────────────────────────────────────────
function SubmitExpenseDialog({ onSubmit }: { onSubmit: (data: { category: string; amount: number; date: string; description: string }) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!category || !amount || !date) return
    setSubmitting(true)
    try {
      await onSubmit({ category, amount: Number(amount), date, description })
      setOpen(false)
      setCategory('')
      setAmount('')
      setDate('')
      setDescription('')
    } catch {
      // error handled by parent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
          <Plus className="h-4 w-4" />
          Submit Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Expense Claim</DialogTitle>
          <DialogDescription>Fill in the details to submit a new expense claim for reimbursement.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="exp-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="exp-category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Accommodation">Accommodation</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exp-amount">Amount (₹)</Label>
            <Input id="exp-amount" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exp-date">Date</Label>
            <Input id="exp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exp-desc">Description</Label>
            <Textarea id="exp-desc" placeholder="Describe the expense..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="exp-receipt">Upload Receipt</Label>
            <Input id="exp-receipt" type="file" accept=".pdf,.jpg,.png" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleSubmit} disabled={submitting || !category || !amount || !date}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Loading skeleton for table rows ─────────────────────────────────────────
function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <TableCell key={j}>
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// ─── Loading skeleton for stat cards ─────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-28 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function PayrollExpense() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [activePayrollTab, setActivePayrollTab] = useState('payroll')

  // Respond to sub-item navigation from sidebar
  useEffect(() => {
    if (activeSubItem) {
      switch (activeSubItem) {
        case 'process-payroll':
          setActivePayrollTab('payroll')
          break
        case 'expenses':
          setActivePayrollTab('expenses')
          break
        case 'reports':
          setActivePayrollTab('payroll')
          break
        default:
          break
      }
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  const [selectedMonth, setSelectedMonth] = useState('January')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [processingPayroll, setProcessingPayroll] = useState(false)
  const [processingAll, setProcessingAll] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  // ─── Fetch payroll data from API ────────────────────────────────────────
  const {
    data: payrollResponse,
    loading: payrollLoading,
    error: payrollError,
    refetch: refetchPayroll,
  } = useApi<PayrollApiResponse>({
    baseUrl: '/api/payroll',
    params: {
      page: 1,
      limit: 50,
      month: selectedMonth,
      year: Number(selectedYear),
    },
  })

  // ─── Fetch expense data from API ───────────────────────────────────────
  const {
    data: expenseResponse,
    loading: expenseLoading,
    error: expenseError,
    refetch: refetchExpenses,
  } = useApi<ExpenseApiResponse>({
    baseUrl: '/api/expenses',
    params: {
      page: 1,
      limit: 50,
    },
  })

  // ─── Flatten API data for display ───────────────────────────────────────
  const payrollRows: PayrollRow[] = useMemo(
    () => (payrollResponse?.records ?? []).map(flattenPayroll),
    [payrollResponse]
  )

  const expenseRows: ExpenseRow[] = useMemo(
    () => (expenseResponse?.expenses ?? []).map(flattenExpense),
    [expenseResponse]
  )

  // ─── Payroll stats ────────────────────────────────────────────────────────
  const totalPayroll = useMemo(() => payrollRows.reduce((s, r) => s + r.grossPay, 0), [payrollRows])
  const processedCount = payrollRows.filter((r) => r.status !== 'pending').length
  const pendingCount = payrollRows.filter((r) => r.status === 'pending').length
  const totalEmployees = payrollResponse?.pagination.total ?? 0

  // ─── Expense stats ────────────────────────────────────────────────────────
  const totalClaims = expenseRows.reduce((s, r) => s + r.amount, 0)
  const approvedExpenses = expenseRows.filter((r) => r.status === 'approved' || r.status === 'reimbursed')
  const approvedAmount = approvedExpenses.reduce((s, r) => s + r.amount, 0)
  const pendingExpenses = expenseRows.filter((r) => r.status === 'pending')
  const pendingAmount = pendingExpenses.reduce((s, r) => s + r.amount, 0)
  const rejectedExpenses = expenseRows.filter((r) => r.status === 'rejected')
  const rejectedAmount = rejectedExpenses.reduce((s, r) => s + r.amount, 0)

  // ─── Monthly expense trend (derive from API data or use default) ──────────
  const monthlyExpenseTrend = useMemo(() => {
    if (expenseRows.length === 0) return defaultMonthlyExpenseTrend
    // Group expenses by month from the data
    const monthMap: Record<string, number> = {}
    for (const row of expenseRows) {
      const d = new Date(row.date)
      const monthStr = d.toLocaleString('en', { month: 'short' })
      monthMap[monthStr] = (monthMap[monthStr] || 0) + row.amount
    }
    // Convert to chart data, sorted by recent 6 months
    const entries = Object.entries(monthMap).map(([month, amount]) => ({ month, amount }))
    return entries.length >= 3 ? entries.slice(-6) : defaultMonthlyExpenseTrend
  }, [expenseRows])

  // ─── Tax computation ──────────────────────────────────────────────────────
  const totalDeclared = taxSections.reduce((s, sec) => s + sec.items.reduce((a, it) => a + it.declared, 0), 0)
  const totalProof = taxSections.reduce((s, sec) => s + sec.items.reduce((a, it) => a + it.proofSubmitted, 0), 0)
  const totalLimit = taxSections.reduce((s, sec) => s + sec.limit, 0)
  const grossSalary = 1500000 // assumed annual
  const taxableIncome = Math.max(0, grossSalary - totalDeclared)
  const estimatedTax = taxableIncome > 1000000
    ? taxableIncome * 0.3
    : taxableIncome > 500000
      ? taxableIncome * 0.2
      : taxableIncome * 0.05

  // ─── Export handlers ────────────────────────────────────────────────────────
  const handleExportPayroll = useCallback(() => {
    exportPayrollReport(payrollRows.map((r) => ({
      employeeName: r.name,
      employeeId: r.employeeId,
      department: '',
      month: r.month,
      year: r.year,
      basicSalary: r.basicSalary,
      hra: r.hra,
      da: r.da,
      grossPay: r.grossPay,
      pf: r.pf,
      esi: r.esi,
      tax: r.tax,
      totalDeductions: r.totalDeductions,
      netPay: r.netPay,
      status: r.status,
    })))
  }, [payrollRows])

  const handleExportExpenses = useCallback(() => {
    exportExpenseReport(expenseRows.map((r) => ({
      employeeName: r.name,
      employeeId: r.employeeId,
      category: r.category,
      amount: r.amount,
      description: r.description,
      date: r.date,
      status: r.status,
      approvedBy: r.approvedBy,
    })))
  }, [expenseRows])

  // ─── Payroll processing handler ──────────────────────────────────────────
  const handleProcessPayroll = useCallback(async (employeeId?: string) => {
    setMutationError(null)
    const isAll = !employeeId
    if (isAll) setProcessingAll(true)
    else setProcessingPayroll(true)

    try {
      if (isAll) {
        // Process all pending payroll records
        const pending = payrollRows.filter((r) => r.status === 'pending')
        for (const row of pending) {
          await apiPost('/api/payroll', {
            employeeId: row.dbEmployeeId,
            month: selectedMonth,
            year: Number(selectedYear),
          })
        }
      } else {
        // employeeId passed in here is the display ID from the table row; find the dbEmployeeId
        const targetRow = payrollRows.find((r) => r.employeeId === employeeId || r.dbEmployeeId === employeeId)
        const dbId = targetRow?.dbEmployeeId ?? employeeId
        await apiPost('/api/payroll', {
          employeeId: dbId,
          month: selectedMonth,
          year: Number(selectedYear),
        })
      }
      refetchPayroll()
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Failed to process payroll')
    } finally {
      setProcessingPayroll(false)
      setProcessingAll(false)
    }
  }, [payrollRows, selectedMonth, selectedYear, refetchPayroll])

  // ─── Fetch first employee for default expense submissions ────────────
  const {
    data: firstEmployeeData,
  } = useApi<{ employees: { id: string; employeeId: string; firstName: string; lastName: string }[]; pagination: { total: number } }>({
    baseUrl: '/api/employees',
    params: { page: 1, limit: 1 },
  })

  const defaultEmployeeDbId = firstEmployeeData?.employees?.[0]?.id ?? ''

  // ─── Expense submission handler ──────────────────────────────────────────
  const handleExpenseSubmit = useCallback(async (data: { category: string; amount: number; date: string; description: string }) => {
    setMutationError(null)
    try {
      if (!defaultEmployeeDbId) {
        throw new Error('No employee found. Please add an employee first.')
      }
      await apiPost('/api/expenses', {
        employeeId: defaultEmployeeDbId,
        category: data.category,
        amount: data.amount,
        date: data.date,
        description: data.description,
      })
      refetchExpenses()
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Failed to submit expense')
      throw err
    }
  }, [refetchExpenses, defaultEmployeeDbId])

  // ─── Expense approve/reject handler ──────────────────────────────────────
  const handleExpenseAction = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    setMutationError(null)
    try {
      await apiPatch('/api/expenses', {
        id,
        status,
        approvedBy: 'HR Admin', // would be current user in production
      })
      refetchExpenses()
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : `Failed to ${status} expense`)
    }
  }, [refetchExpenses])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Payroll &amp; Expenses
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage payroll processing, expense claims &amp; tax declarations
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </Badge>
        </div>

        {/* Mutation Error Banner */}
        {mutationError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {mutationError}
            <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={() => setMutationError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {/* ─── Tabs ──────────────────────────────────────────────────────── */}
        <Tabs value={activePayrollTab} onValueChange={setActivePayrollTab} className="space-y-6">
          <TabsList className="h-10 w-full sm:w-auto">
            <TabsTrigger value="payroll" className="gap-1.5 text-xs sm:text-sm">
              <Banknote className="h-4 w-4" />
              Payroll Processing
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-1.5 text-xs sm:text-sm">
              <Receipt className="h-4 w-4" />
              Expense Claims
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-1.5 text-xs sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              Tax Declarations
            </TabsTrigger>
          </TabsList>

          {/* ═════════════════════════════════════════════════════════════════
              TAB 1 — PAYROLL PROCESSING
              ═════════════════════════════════════════════════════════════════ */}
          <TabsContent value="payroll" className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {payrollLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Total Payroll</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{fmtShort(totalPayroll)}</p>
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-3 w-3" />
                            +2.8% vs last month
                          </div>
                        </div>
                        <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <IndianRupee className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #10b981, transparent)' }} />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Employees Processed</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{processedCount}/{totalEmployees}</p>
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {totalEmployees > 0 ? Math.round((processedCount / totalEmployees) * 100) : 0}% completed
                          </div>
                        </div>
                        <div className="rounded-lg bg-teal-100 p-2.5 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #14b8a6, transparent)' }} />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Pending</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{pendingCount}</p>
                          <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                            <AlertCircle className="h-3 w-3" />
                            Requires attention
                          </div>
                        </div>
                        <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                          <Clock className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }} />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Next Pay Date</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">28 Feb</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            Auto-scheduled
                          </div>
                        </div>
                        <div className="rounded-lg bg-cyan-100 p-2.5 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">
                          <CalendarDays className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #06b6d4, transparent)' }} />
                  </Card>
                </>
              )}
            </div>

            {/* API Error */}
            {payrollError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Failed to load payroll data: {payrollError}
                <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={refetchPayroll}>
                  Retry
                </Button>
              </div>
            )}

            {/* Month/Year selector + Bulk Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => handleProcessPayroll()}
                  disabled={processingPayroll}
                >
                  {processingPayroll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Process Payroll
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => handleProcessPayroll()}
                  disabled={processingAll}
                >
                  {processingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Process All
                </Button>
                <Button variant="outline" className="gap-1.5" onClick={handleExportPayroll} disabled={payrollRows.length === 0}>
                  <FileDown className="h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </div>

            {/* Payroll Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Basic Salary</TableHead>
                        <TableHead className="text-right">HRA</TableHead>
                        <TableHead className="text-right">DA</TableHead>
                        <TableHead className="text-right">Gross Pay</TableHead>
                        <TableHead className="text-right">PF</TableHead>
                        <TableHead className="text-right">ESI</TableHead>
                        <TableHead className="text-right">Tax</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollLoading ? (
                        <TableSkeleton cols={11} />
                      ) : payrollRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="py-12 text-center text-muted-foreground">
                            <IndianRupee className="mx-auto mb-2 h-8 w-8 opacity-40" />
                            <p className="text-sm">No payroll records found for {selectedMonth} {selectedYear}</p>
                            <p className="text-xs mt-1">Try selecting a different month/year or process payroll</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        payrollRows.map((row) => (
                          <TableRow key={row.id} className="cursor-pointer">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  {row.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{row.name}</p>
                                  <p className="text-muted-foreground text-xs">{row.employeeId}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm">{fmt(row.basicSalary)}</TableCell>
                            <TableCell className="text-right text-sm">{fmt(row.hra)}</TableCell>
                            <TableCell className="text-right text-sm">{fmt(row.da)}</TableCell>
                            <TableCell className="text-right text-sm font-semibold">{fmt(row.grossPay)}</TableCell>
                            <TableCell className="text-right text-sm text-rose-600 dark:text-rose-400">−{fmt(row.pf)}</TableCell>
                            <TableCell className="text-right text-sm text-rose-600 dark:text-rose-400">−{fmt(row.esi)}</TableCell>
                            <TableCell className="text-right text-sm text-rose-600 dark:text-rose-400">−{fmt(row.tax)}</TableCell>
                            <TableCell className="text-right text-sm font-bold text-emerald-700 dark:text-emerald-400">{fmt(row.netPay)}</TableCell>
                            <TableCell><StatusBadge status={row.status} /></TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                                      <FileText className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Breakdown</span>
                                    </Button>
                                  </DialogTrigger>
                                  <SalaryBreakdownDialog row={row} />
                                </Dialog>
                                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                  <Download className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Payslip</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════════════
              TAB 2 — EXPENSE CLAIMS
              ═════════════════════════════════════════════════════════════════ */}
          <TabsContent value="expenses" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {expenseLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Total Claims</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{fmtShort(totalClaims)}</p>
                          <p className="text-xs text-muted-foreground">{expenseRows.length} claims submitted</p>
                        </div>
                        <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <Receipt className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #10b981, transparent)' }} />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Approved</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{fmtShort(approvedAmount)}</p>
                          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {approvedExpenses.length} claims
                          </div>
                        </div>
                        <div className="rounded-lg bg-teal-100 p-2.5 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #14b8a6, transparent)' }} />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Pending</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{fmtShort(pendingAmount)}</p>
                          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            Awaiting approval
                          </div>
                        </div>
                        <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                          <Clock className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }} />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm font-medium">Rejected</p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">{fmtShort(rejectedAmount)}</p>
                          <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                            <XCircle className="h-3 w-3" />
                            {rejectedExpenses.length} claim{rejectedExpenses.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="rounded-lg bg-rose-100 p-2.5 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                          <XCircle className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #f43f5e, transparent)' }} />
                  </Card>
                </>
              )}
            </div>

            {/* API Error */}
            {expenseError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Failed to load expense data: {expenseError}
                <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs" onClick={refetchExpenses}>
                  Retry
                </Button>
              </div>
            )}

            {/* Expense Table + Submit */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Expense Claims</h2>
              <SubmitExpenseDialog onSubmit={handleExpenseSubmit} />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseLoading ? (
                        <TableSkeleton cols={7} />
                      ) : expenseRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                            <Receipt className="mx-auto mb-2 h-8 w-8 opacity-40" />
                            <p className="text-sm">No expense claims found</p>
                            <p className="text-xs mt-1">Submit a new expense claim to get started</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenseRows.map((row) => {
                          const catCfg = categoryConfig[row.category] ?? {
                            icon: Receipt,
                            bg: 'bg-muted',
                            text: 'text-muted-foreground',
                          }
                          const CatIcon = catCfg.icon
                          return (
                            <TableRow key={row.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                    {row.name.split(' ').map((n) => n[0]).join('')}
                                  </div>
                                  <span className="text-sm font-medium">{row.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`gap-1 ${catCfg.bg} ${catCfg.text}`}>
                                  <CatIcon className="h-3 w-3" />
                                  {row.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-sm font-semibold">{fmt(row.amount)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{row.description}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{row.date}</TableCell>
                              <TableCell><StatusBadge status={row.status} /></TableCell>
                              <TableCell className="text-right">
                                {row.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 gap-1 text-xs text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                      onClick={() => handleExpenseAction(row.id, 'approved')}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 gap-1 text-xs text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
                                      onClick={() => handleExpenseAction(row.id, 'rejected')}
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    {row.approvedBy ? `By ${row.approvedBy}` : '—'}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Expense Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Monthly Expense Trend</CardTitle>
                <CardDescription>Claims amount over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyExpenseTrend}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={EMERALD} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={EMERALD} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip {...customTooltipStyle} formatter={(v: number) => fmt(v)} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke={EMERALD}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: EMERALD, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: EMERALD, strokeWidth: 2 }}
                        name="Expense Amount"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════════════
              TAB 3 — TAX DECLARATIONS
              ═════════════════════════════════════════════════════════════════ */}
          <TabsContent value="tax" className="space-y-6">
            {/* Employee self-service header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Tax Declarations — FY 2023-24</h2>
                <p className="text-sm text-muted-foreground">Employee self-service portal for tax planning</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                  <Send className="h-4 w-4" />
                  Submit Declaration
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Upload className="h-4 w-4" />
                  Upload Proof
                </Button>
              </div>
            </div>

            {/* Overall Progress */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Declaration vs Limit</p>
                    <p className="text-sm text-muted-foreground">
                      {fmtShort(totalDeclared)} / {fmtShort(totalLimit)}
                    </p>
                  </div>
                  <Progress value={Math.min(100, (totalDeclared / totalLimit) * 100)} className="h-3 [&>div]:bg-emerald-500" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Declared: {fmtShort(totalDeclared)}</span>
                    <span>Proof Submitted: {fmtShort(totalProof)}</span>
                    <span>Remaining: {fmtShort(Math.max(0, totalLimit - totalDeclared))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Sections */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {taxSections.map((sec) => {
                const SecIcon = sec.icon
                const secDeclared = sec.items.reduce((s, it) => s + it.declared, 0)
                const secProof = sec.items.reduce((s, it) => s + it.proofSubmitted, 0)
                const pct = Math.min(100, (secDeclared / sec.limit) * 100)
                return (
                  <Card key={sec.section}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <SecIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">{sec.label}</CardTitle>
                          <CardDescription className="text-xs">Limit: {fmt(sec.limit)}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Items */}
                        {sec.items.map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground">
                                {fmt(item.declared)} declared &middot; {fmt(item.proofSubmitted)} proof
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
                                <div
                                  className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 transition-all"
                                  style={{ width: `${Math.min(100, (item.proofSubmitted / item.declared) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Section Summary */}
                        <div className="mt-2 rounded-lg bg-muted/50 p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span>Total Declared</span>
                            <span className="font-semibold">{fmt(secDeclared)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Proof Submitted</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(secProof)}</span>
                          </div>
                          <div className="mt-2">
                            <Progress value={pct} className="h-2 [&>div]:bg-emerald-500" />
                            <p className="mt-1 text-[10px] text-muted-foreground text-right">{pct.toFixed(0)}% of limit used</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Tax Computation Summary */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Calculator className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Tax Computation Summary</CardTitle>
                    <CardDescription className="text-xs">Estimated tax liability for FY 2023-24</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">Gross Annual Salary</p>
                    <p className="text-lg font-bold">{fmt(grossSalary)}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                    <p className="text-xs text-muted-foreground">Total Deductions</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">−{fmt(totalDeclared)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">Taxable Income</p>
                    <p className="text-lg font-bold">{fmt(taxableIncome)}</p>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-4 dark:bg-rose-950/30">
                    <p className="text-xs text-muted-foreground">Estimated Tax</p>
                    <p className="text-lg font-bold text-rose-700 dark:text-rose-400">{fmt(Math.round(estimatedTax))}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/30">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        Tax Saving Opportunity
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You have unused deductions of <strong>{fmt(Math.max(0, totalLimit - totalDeclared))}</strong> under
                        Sections 80C, 80D, and others. Maximize your tax savings by declaring eligible investments before
                        the deadline.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
