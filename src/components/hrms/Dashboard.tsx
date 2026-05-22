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
import {
  dashboardStats,
  monthlyTrends,
  departmentDistribution,
  attritionPrediction,
} from '@/lib/data'

// ─── Stat Card Config ────────────────────────────────────────────────────────
const statCards = [
  {
    label: 'Total Employees',
    value: dashboardStats.totalEmployees.toLocaleString(),
    icon: Users,
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    change: `+${dashboardStats.newHires} this month`,
    changeType: 'positive' as const,
  },
  {
    label: 'Active Positions',
    value: dashboardStats.openPositions.toString(),
    icon: Briefcase,
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    change: '5 urgent',
    changeType: 'negative' as const,
  },
  {
    label: 'Attendance Rate',
    value: `${dashboardStats.avgAttendance}%`,
    icon: Clock,
    iconBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    change: '+2.1% vs last month',
    changeType: 'positive' as const,
  },
  {
    label: 'Monthly Payroll',
    value: `₹${(dashboardStats.totalPayroll / 10000000).toFixed(2)} Cr`,
    icon: Banknote,
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    change: 'Processed on time',
    changeType: 'positive' as const,
  },
]

// ─── Quick Actions Config ─────────────────────────────────────────────────────
const quickActions = [
  { label: 'Add Employee', icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Process Payroll', icon: CreditCard, color: 'text-amber-600 dark:text-amber-400' },
  { label: 'Post Job', icon: FileText, color: 'text-cyan-600 dark:text-cyan-400' },
  { label: 'Run Reports', icon: BarChart3, color: 'text-rose-600 dark:text-rose-400' },
  { label: 'Schedule Interview', icon: CalendarCheck, color: 'text-purple-600 dark:text-purple-400' },
  { label: 'Approve Leaves', icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400' },
]

// ─── Recent Activities ────────────────────────────────────────────────────────
const recentActivities = [
  {
    id: 1,
    icon: UserPlus,
    iconColor: 'text-emerald-500',
    text: 'Karthik Rao onboarded as Frontend Developer',
    time: '2 hours ago',
  },
  {
    id: 2,
    icon: CreditCard,
    iconColor: 'text-amber-500',
    text: 'January payroll processed for 156 employees',
    time: '5 hours ago',
  },
  {
    id: 3,
    icon: CalendarDays,
    iconColor: 'text-purple-500',
    text: 'Sneha Reddy requested earned leave (5 days)',
    time: '1 day ago',
  },
  {
    id: 4,
    icon: ShieldCheck,
    iconColor: 'text-cyan-500',
    text: 'Compliance score updated to 97%',
    time: '1 day ago',
  },
  {
    id: 5,
    icon: Activity,
    iconColor: 'text-rose-500',
    text: 'AI attrition alert: Sales department risk at 22%',
    time: '2 days ago',
  },
]

// ─── Pending Approvals ────────────────────────────────────────────────────────
const pendingApprovals = [
  {
    id: 1,
    type: 'leave',
    icon: CalendarDays,
    iconColor: 'text-amber-500',
    title: 'Sneha Reddy',
    description: 'Earned Leave · Feb 1–5 (5 days)',
    badge: 'Leave',
    badgeVariant: 'secondary' as const,
  },
  {
    id: 2,
    type: 'leave',
    icon: CalendarDays,
    iconColor: 'text-amber-500',
    title: 'Arjun Mehta',
    description: 'Casual Leave · Jan 25 (1 day)',
    badge: 'Leave',
    badgeVariant: 'secondary' as const,
  },
  {
    id: 3,
    type: 'leave',
    icon: CalendarDays,
    iconColor: 'text-amber-500',
    title: 'Deepak Joshi',
    description: 'Casual Leave · Jan 18 (1 day)',
    badge: 'Leave',
    badgeVariant: 'secondary' as const,
  },
  {
    id: 4,
    type: 'expense',
    icon: Receipt,
    iconColor: 'text-rose-500',
    title: 'Sneha Reddy',
    description: 'Equipment · ₹25,000',
    badge: 'Expense',
    badgeVariant: 'outline' as const,
  },
  {
    id: 5,
    type: 'expense',
    icon: Receipt,
    iconColor: 'text-rose-500',
    title: 'Rohit Verma',
    description: 'Travel · ₹4,500',
    badge: 'Expense',
    badgeVariant: 'outline' as const,
  },
]

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
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
          })}
        </div>

        {/* ─── Row 2: Charts ──────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Headcount Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Headcount Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyTrends}
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
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                      domain={['dataMin - 5', 'dataMax + 5']}
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      stroke="none"
                    >
                      {departmentDistribution.map((entry, index) => (
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Row 3: AI Predictions + Quick Actions ─────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* AI Attrition Predictions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  AI Attrition Predictions
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                >
                  <AlertTriangle className="h-3 w-3" />
                  AI
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attritionPrediction}
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
                      name="Predicted Risk %"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      barSize={16}
                    />
                    <Bar
                      dataKey="actual"
                      name="Actual Attrition %"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
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
                    >
                      <Icon className={`h-5 w-5 ${action.color}`} />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Row 4: Recent Activities + Pending Approvals ──────────── */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card>
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
                <div className="space-y-1">
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">
                            {activity.text}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {activity.time}
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
                  {pendingApprovals.length} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
