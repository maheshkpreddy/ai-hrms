'use client'

import {
  Users,
  Briefcase,
  Clock,
  Banknote,
  UserPlus,
  CreditCard,
  FileText,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Receipt,
  CalendarDays,
  ShieldCheck,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useApi } from '@/lib/useApi'
import { useHRMSStore, type ModuleKey } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  overview: {
    totalEmployees: number
    activeEmployees: number
    departments: number
    recentHires: number
    presentToday: number
    absentToday: number
    openJobs: number
    totalCandidates: number
    pendingLeaves: number
    pendingExpenses: number
    coursesActive: number
    totalPayrollThisMonth: number
  }
  charts: {
    departmentHeadcount: { department: string; count: number }[]
    attendanceDistribution: { status: string; count: number }[]
    leaveTypeDistribution: { leaveType: string; count: number }[]
    expenseByCategory: { category: string; totalAmount: number; count: number }[]
  }
  performance: {
    averageRating: number
    averageAttritionRisk: number
    totalReviews: number
  }
  candidatePipeline: { status: string; count: number }[]
  recentActivities: {
    action: string
    module: string
    details: string
    createdAt: string
    employee: { firstName: string; lastName: string }
  }[]
}

// ─── Color palette for pie chart ──────────────────────────────────────────────
const PIE_COLORS = [
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#6366f1',
  '#14b8a6',
  '#ef4444',
  '#84cc16',
]

// ─── Quick Actions Config ─────────────────────────────────────────────────────
const quickActions: { label: string; icon: typeof UserPlus; color: string; module: ModuleKey }[] = [
  { label: 'Add Employee', icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400', module: 'employees' },
  { label: 'Process Payroll', icon: CreditCard, color: 'text-amber-600 dark:text-amber-400', module: 'payroll' },
  { label: 'Post Job', icon: FileText, color: 'text-cyan-600 dark:text-cyan-400', module: 'talent' },
  { label: 'Run Reports', icon: BarChart3, color: 'text-rose-600 dark:text-rose-400', module: 'analytics' },
  { label: 'Schedule Interview', icon: CalendarCheck, color: 'text-purple-600 dark:text-purple-400', module: 'talent' },
  { label: 'Approve Leaves', icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', module: 'attendance' },
]

// ─── Activity icon mapping ────────────────────────────────────────────────────
const moduleIconMap: Record<string, { icon: typeof UserPlus; iconColor: string }> = {
  hr: { icon: UserPlus, iconColor: 'text-emerald-500' },
  payroll: { icon: CreditCard, iconColor: 'text-amber-500' },
  attendance: { icon: Clock, iconColor: 'text-cyan-500' },
  leave: { icon: CalendarDays, iconColor: 'text-purple-500' },
  performance: { icon: Activity, iconColor: 'text-rose-500' },
  recruitment: { icon: Briefcase, iconColor: 'text-blue-500' },
  learning: { icon: ShieldCheck, iconColor: 'text-teal-500' },
  expense: { icon: Receipt, iconColor: 'text-orange-500' },
}

function getActivityIcon(module: string | undefined | null) {
  if (!module) return { icon: Activity, iconColor: 'text-gray-500' }
  return moduleIconMap[module.toLowerCase()] || { icon: Activity, iconColor: 'text-gray-500' }
}

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  } catch {
    return dateStr
  }
}

// ─── Chart tooltip style ─────────────────────────────────────────────────────
const customTooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemStyle: {
    padding: '2px 0',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data, loading, error } = useApi<DashboardData>({
    baseUrl: '/api/dashboard',
  })
  const { setActiveModule, activeSubItem, setActiveSubItem } = useHRMSStore()
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Sync sidebar sub-item selection to internal state and scroll to section
  useEffect(() => {
    if (activeSubItem) {
      const sectionId = activeSubItem
      // Small delay to ensure the DOM is ready before scrolling
      setTimeout(() => {
        setActiveSection(sectionId)
        const el = document.getElementById(sectionId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      // Clear the store's activeSubItem after consuming it
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // Clear active section highlight after a short period
  useEffect(() => {
    if (activeSection) {
      const timer = setTimeout(() => setActiveSection(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [activeSection])

  const overview = data?.overview ?? null
  const charts = data?.charts ?? null
  const performance = data?.performance ?? null
  const recentActivities = data?.recentActivities ?? []

  // ─── Derived stat cards ──────────────────────────────────────────────────
  const attendanceRate =
    overview && overview.presentToday + overview.absentToday > 0
      ? ((overview.presentToday / (overview.presentToday + overview.absentToday)) * 100).toFixed(1)
      : '0.0'

  const statCards = overview
    ? [
        {
          label: 'Total Employees',
          value: overview.totalEmployees.toLocaleString(),
          icon: Users,
          iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
          change: `+${overview.recentHires} this month`,
          changeType: 'positive' as const,
        },
        {
          label: 'Active Positions',
          value: overview.openJobs.toString(),
          icon: Briefcase,
          iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
          change: `${overview.totalCandidates} candidates`,
          changeType: 'negative' as const,
        },
        {
          label: 'Attendance Rate',
          value: `${attendanceRate}%`,
          icon: Clock,
          iconBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
          change: `${overview.presentToday} present today`,
          changeType: 'positive' as const,
        },
        {
          label: 'Monthly Payroll',
          value:
            overview.totalPayrollThisMonth >= 10000000
              ? `₹${(overview.totalPayrollThisMonth / 10000000).toFixed(2)} Cr`
              : `₹${(overview.totalPayrollThisMonth / 100000).toFixed(2)} L`,
          icon: Banknote,
          iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
          change: 'Processed on time',
          changeType: 'positive' as const,
        },
      ]
    : []

  // ─── Derived chart data ──────────────────────────────────────────────────
  const headcountChartData =
    charts?.departmentHeadcount?.map((d) => ({
      month: d.department,
      headcount: d.count,
    })) ?? []

  const departmentPieData =
    charts?.departmentHeadcount?.map((d, i) => ({
      name: d.department,
      value: d.count,
      color: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? []

  const expenseChartData =
    charts?.expenseByCategory?.map((d) => ({
      department: d.category.charAt(0).toUpperCase() + d.category.slice(1),
      risk: Math.round(d.totalAmount / 1000),
      actual: d.count,
    })) ?? []

  // ─── Pending approvals derived data ──────────────────────────────────────
  const pendingApprovals = overview
    ? [
        ...(overview.pendingLeaves > 0
          ? [
              {
                id: 'pending-leaves',
                type: 'leave' as const,
                icon: CalendarDays,
                iconColor: 'text-amber-500',
                title: 'Leave Requests',
                description: `${overview.pendingLeaves} pending approval`,
                badge: 'Leave',
                badgeVariant: 'secondary' as const,
              },
            ]
          : []),
        ...(overview.pendingExpenses > 0
          ? [
              {
                id: 'pending-expenses',
                type: 'expense' as const,
                icon: Receipt,
                iconColor: 'text-rose-500',
                title: 'Expense Claims',
                description: `${overview.pendingExpenses} pending approval`,
                badge: 'Expense',
                badgeVariant: 'outline' as const,
              },
            ]
          : []),
      ]
    : []

  const totalPending = overview ? overview.pendingLeaves + overview.pendingExpenses : 0

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-muted-foreground text-sm">Loading dashboard data…</p>
        </div>
      </div>
    )
  }

  // ─── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-lg font-semibold">Failed to load dashboard</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-powered HRMS overview &amp; analytics
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

        {/* ─── Row 1: Top Stats ────────────────────────────────────────── */}
        <div
          id="overview"
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-lg transition-all duration-500 ${activeSection === 'overview' ? 'ring-2 ring-emerald-400/50 ring-offset-2' : ''}`}
        >
          {statCards.length > 0 ? (
            statCards.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label} className="relative overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm font-medium">
                          {card.label}
                        </p>
                        <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                          {card.value}
                        </p>
                        <div className="flex items-center gap-1 text-xs">
                          {card.changeType === 'positive' ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={
                              card.changeType === 'positive'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {card.change}
                          </span>
                        </div>
                      </div>
                      <div className={`rounded-lg p-2.5 ${card.iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                  {/* Subtle accent line */}
                  <div
                    className="absolute bottom-0 left-0 h-1 w-full"
                    style={{
                      background:
                        card.changeType === 'positive'
                          ? 'linear-gradient(90deg, #10b981, transparent)'
                          : 'linear-gradient(90deg, #ef4444, transparent)',
                    }}
                  />
                </Card>
              )
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                No overview data available
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Row 2: Charts ──────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Department Headcount */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Department Headcount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                {headcountChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={headcountChartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="headcountGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        domain={['dataMin - 1', 'dataMax + 2']}
                      />
                      <Tooltip {...customTooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="headcount"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#headcountGradient)"
                        name="Headcount"
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No department data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                {departmentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {departmentPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...customTooltipStyle}
                        formatter={(value: number, name: string) => [
                          `${value} employees`,
                          name,
                        ]}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No distribution data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Row 3: Expense Breakdown + Quick Actions ─────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Expense & Category Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  Expense &amp; Category Breakdown
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Insights
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                {expenseChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expenseChartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="department"
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip {...customTooltipStyle} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar
                        dataKey="risk"
                        name="Amount (₹K)"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                      <Bar
                        dataKey="actual"
                        name="Transactions"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No expense data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card
            id="quick-actions"
            className={`transition-all duration-500 ${activeSection === 'quick-actions' ? 'ring-2 ring-emerald-400/50 ring-offset-2' : ''}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto flex-col gap-2 py-5 transition-all hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-700"
                      onClick={() => setActiveModule(action.module)}
                    >
                      <Icon className={`h-5 w-5 ${action.color}`} />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  )
                })}
              </div>
              {/* Performance summary */}
              {performance && (
                <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Performance Summary
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {performance.averageRating.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Avg Rating</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {(performance.averageAttritionRisk * 100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Attrition Risk</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                        {performance.totalReviews}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Reviews</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Row 4: Recent Activities + Pending Approvals ──────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card
            id="recent-activity"
            className={`transition-all duration-500 ${activeSection === 'recent-activity' ? 'ring-2 ring-emerald-400/50 ring-offset-2' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Recent Activities
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {recentActivities.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivities.map((activity, index) => {
                      const { icon: ActivityIcon, iconColor } = getActivityIcon(activity.module)
                      const employeeName =
                        activity.employee
                          ? `${activity.employee.firstName} ${activity.employee.lastName}`
                          : 'System'
                      return (
                        <div
                          key={`${activity.createdAt}-${index}`}
                          className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <ActivityIcon className={`h-4 w-4 ${iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug">
                              <span className="font-medium">{employeeName}</span>{' '}
                              {activity.details || `${activity.action} in ${activity.module}`}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {formatTimeAgo(activity.createdAt)}
                            </p>
                          </div>
                          {index === 0 && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                    No recent activities
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Pending Approvals
                </CardTitle>
                <Badge
                  variant="destructive"
                  className="text-[10px]"
                >
                  {totalPending} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-1">
                    {pendingApprovals.map((item) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Icon className={`h-4 w-4 ${item.iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-muted-foreground text-xs">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={item.badgeVariant} className="text-[10px]">
                              {item.badge}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
                    No pending approvals
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
