'use client'

import { useState } from 'react'
import {
  Users,
  TrendingDown,
  Clock,
  Scale,
  DollarSign,
  Timer,
  Sparkles,
  Brain,
  Download,
  Play,
  CalendarClock,
  FileText,
  Plus,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  BarChart3,
  FileBarChart,
  Filter,
  RefreshCw,
  Eye,
} from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  monthlyTrends,
  departmentDistribution,
  genderDistribution,
  attritionPrediction,
  dashboardStats,
  hiringForecast,
  salaryBenchmarking,
  engagementScoreData,
  attendanceHeatmap,
  reportTemplates,
  recentReports,
  scheduledReports,
} from '@/lib/data'

// ─── Tooltip Style ──────────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemStyle: { padding: '2px 0' },
}

// ─── KPI Card Config ────────────────────────────────────────────────────────
const kpiCards = [
  {
    label: 'Headcount',
    value: dashboardStats.totalEmployees.toLocaleString(),
    icon: Users,
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    change: `+${dashboardStats.newHires} this month`,
    changeType: 'positive' as const,
  },
  {
    label: 'Attrition Rate',
    value: `${dashboardStats.attritionRate}%`,
    icon: TrendingDown,
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    change: '-0.5% vs last month',
    changeType: 'positive' as const,
  },
  {
    label: 'Avg Tenure',
    value: '3.2 yrs',
    icon: Clock,
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    change: '+0.3 vs last year',
    changeType: 'positive' as const,
  },
  {
    label: 'Diversity Index',
    value: '0.78',
    icon: Scale,
    iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
    change: '+0.02 vs Q3',
    changeType: 'positive' as const,
  },
  {
    label: 'Cost per Hire',
    value: '₹1.8L',
    icon: DollarSign,
    iconBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
    change: '-5% vs last quarter',
    changeType: 'positive' as const,
  },
  {
    label: 'Time to Fill',
    value: '28 days',
    icon: Timer,
    iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    change: '-3 days vs last month',
    changeType: 'positive' as const,
  },
]

// ─── Attendance Heatmap Cell ────────────────────────────────────────────────
function getAttendanceColor(value: number): string {
  if (value === 0) return 'bg-muted/30'
  if (value >= 95) return 'bg-emerald-500 text-white'
  if (value >= 90) return 'bg-emerald-400 text-white'
  if (value >= 85) return 'bg-emerald-300 text-emerald-900'
  if (value >= 70) return 'bg-amber-400 text-amber-900'
  if (value >= 30) return 'bg-orange-300 text-orange-900'
  return 'bg-rose-300 text-rose-900'
}

// ─── Workforce Prediction Cards ─────────────────────────────────────────────
const workforcePredictions = [
  {
    department: 'Engineering',
    prediction: 'Need +5 developers by Q2',
    risk: 'medium' as const,
    icon: '🔧',
    confidence: 87,
  },
  {
    department: 'Sales',
    prediction: '3 reps at flight risk',
    risk: 'high' as const,
    icon: '📊',
    confidence: 92,
  },
  {
    department: 'Marketing',
    prediction: 'Budget reallocation needed',
    risk: 'low' as const,
    icon: '🎯',
    confidence: 74,
  },
  {
    department: 'Product',
    prediction: 'Stable team, +2 designers recommended',
    risk: 'low' as const,
    icon: '🎨',
    confidence: 81,
  },
]

const riskColors = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
}

// ─── Icon map for report templates ──────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Clock,
  Banknote: DollarSign,
  TrendingUp: ArrowUpRight,
  AlertTriangle,
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Analytics() {
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [customReport, setCustomReport] = useState({
    name: '',
    dataSource: '',
    metrics: '',
    dateRange: '',
    format: '',
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Analytics &amp; Reporting
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-powered workforce insights and custom reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* ─── Tabs ─────────────────────────────────────────────────────── */}
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="realtime" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Real-Time Dashboards</span>
              <span className="sm:hidden">Dashboards</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="gap-1.5">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Predictive Analytics</span>
              <span className="sm:hidden">Predictive</span>
              <Badge className="ml-1 gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0 text-[10px]">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <FileBarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Custom Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: Real-Time Dashboards
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="realtime" className="space-y-6">
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {kpiCards.map((card) => {
                const Icon = card.icon
                return (
                  <Card key={card.label} className="relative overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className={`rounded-lg p-1.5 ${card.iconBg}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {card.changeType === 'positive' ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-lg font-bold tracking-tight sm:text-xl">
                          {card.value}
                        </p>
                        <p className="text-muted-foreground text-[11px] leading-tight">
                          {card.label}
                        </p>
                      </div>
                      <p
                        className={
                          card.changeType === 'positive'
                            ? 'mt-1 text-[10px] text-emerald-600 dark:text-emerald-400'
                            : 'mt-1 text-[10px] text-rose-600 dark:text-rose-400'
                        }
                      >
                        {card.change}
                      </p>
                    </CardContent>
                    <div
                      className="absolute bottom-0 left-0 h-0.5 w-full"
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

            {/* ── Headcount Trend + Department Distribution ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Headcount Trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Headcount Trend
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Monthly headcount over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyTrends}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
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
                        <Tooltip {...tooltipStyle} />
                        <Line
                          type="monotone"
                          dataKey="headcount"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          name="Headcount"
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hiring"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Hiring"
                          dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </LineChart>
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
                  <CardDescription className="text-xs">
                    Employee distribution across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentDistribution}
                          cx="50%"
                          cy="50%"
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
                          {...tooltipStyle}
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

            {/* ── Gender Diversity + Attendance Heatmap ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Gender Diversity Donut */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Gender Diversity
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Gender distribution across the organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                          stroke="none"
                        >
                          {genderDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(value: number, name: string) => [
                            `${value}%`,
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

              {/* Attendance Heatmap */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">
                    Attendance Heatmap
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Attendance rates by day and week (% present)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-8 gap-1 text-center">
                      <div className="text-[10px] font-medium text-muted-foreground" />
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div
                          key={day}
                          className="text-[10px] font-medium text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Data rows */}
                    {attendanceHeatmap.map((week) => (
                      <div key={week.week} className="grid grid-cols-8 gap-1">
                        <div className="flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                          {week.week}
                        </div>
                        {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map(
                          (day) => (
                            <div
                              key={day}
                              className={`flex h-9 items-center justify-center rounded-md text-[11px] font-semibold ${getAttendanceColor(week[day])}`}
                              title={`${week.week} ${day}: ${week[day]}%`}
                            >
                              {week[day] > 0 ? `${week[day]}` : '—'}
                            </div>
                          )
                        )}
                      </div>
                    ))}
                    {/* Legend */}
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                        <span className="text-[10px] text-muted-foreground">≥95%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-emerald-300" />
                        <span className="text-[10px] text-muted-foreground">85-94%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-amber-400" />
                        <span className="text-[10px] text-muted-foreground">70-84%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-orange-300" />
                        <span className="text-[10px] text-muted-foreground">30-69%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-muted/30" />
                        <span className="text-[10px] text-muted-foreground">0%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Payroll Cost Trend ── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Payroll Cost Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Monthly payroll expenditure over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlyTrends}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                        tickFormatter={(v: number) => `₹${(v / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(value: number) => [
                          `₹${(value / 1000000).toFixed(2)}M`,
                          'Payroll',
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="payroll"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#payrollGradient)"
                        name="Payroll"
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: Predictive Analytics
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="predictive" className="space-y-6">
            {/* ── AI Badge Banner ── */}
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  AI-Powered Predictions
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Forecasts are generated using machine learning models trained on your historical
                  HR data. Confidence levels vary per model.
                </p>
              </div>
            </div>

            {/* ── AI Hiring Forecast + Attrition Prediction ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* AI Hiring Forecast */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      AI Hiring Forecast
                    </CardTitle>
                    <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0 text-[10px]">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Predicted hiring needs for next 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={hiringForecast}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
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
                        />
                        <Tooltip {...tooltipStyle} />
                        <Area
                          type="monotone"
                          dataKey="upper"
                          fill="#10b981"
                          fillOpacity={0.1}
                          stroke="none"
                          name="Upper Bound"
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          fill="#ffffff"
                          fillOpacity={0.8}
                          stroke="none"
                          name="Lower Bound"
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          strokeDasharray="8 4"
                          name="Predicted"
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Attrition Prediction by Department */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      Attrition Prediction
                    </CardTitle>
                    <Badge className="gap-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 px-1.5 py-0 text-[10px]">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Risk
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Predicted vs actual attrition risk scores by department
                  </CardDescription>
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
                        <Tooltip {...tooltipStyle} />
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
            </div>

            {/* ── Workforce Trend Predictions ── */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">
                    Workforce Trend Predictions
                  </CardTitle>
                  <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0 text-[10px]">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  AI-generated insights on upcoming workforce changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {workforcePredictions.map((item) => (
                    <div
                      key={item.department}
                      className="rounded-lg border p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{item.icon}</span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${riskColors[item.risk]}`}
                        >
                          {item.risk} risk
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{item.department}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.prediction}
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-medium">{item.confidence}%</span>
                        </div>
                        <Progress value={item.confidence} className="mt-1 h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── Salary Benchmarking + Engagement Score ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Salary Benchmarking */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      Salary Benchmarking
                    </CardTitle>
                    <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0 text-[10px]">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Internal vs market salary comparison (LPA)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salaryBenchmarking}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.5}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={(v: number) => `₹${v}L`}
                        />
                        <YAxis
                          type="category"
                          dataKey="role"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          width={100}
                        />
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(value: number, name: string) => [
                            `₹${value} LPA`,
                            name,
                          ]}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Bar
                          dataKey="internal"
                          name="Internal"
                          fill="#10b981"
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                        />
                        <Bar
                          dataKey="market"
                          name="Market Avg"
                          fill="#f59e0b"
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Score Prediction */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      Engagement Score Prediction
                    </CardTitle>
                    <Badge className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0 text-[10px]">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Current vs predicted engagement scores by department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={engagementScoreData}
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
                          domain={[0, 100]}
                        />
                        <Tooltip {...tooltipStyle} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Bar
                          dataKey="current"
                          name="Current Score"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          barSize={14}
                        />
                        <Bar
                          dataKey="predicted"
                          name="Predicted Score"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          barSize={14}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: Custom Reports
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="reports" className="space-y-6">
            {/* ── Report Builder ── */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Report Builder
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configure and generate custom reports
                    </CardDescription>
                  </div>
                  <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create Custom Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Custom Report</DialogTitle>
                        <DialogDescription>
                          Configure your custom report parameters below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="report-name" className="text-sm">Report Name</Label>
                          <Input
                            id="report-name"
                            placeholder="Enter report name..."
                            value={customReport.name}
                            onChange={(e) =>
                              setCustomReport({ ...customReport, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Data Source</Label>
                          <Select
                            value={customReport.dataSource}
                            onValueChange={(v) =>
                              setCustomReport({ ...customReport, dataSource: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select data source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employees">Employee Data</SelectItem>
                              <SelectItem value="attendance">Attendance Records</SelectItem>
                              <SelectItem value="payroll">Payroll Data</SelectItem>
                              <SelectItem value="performance">Performance Data</SelectItem>
                              <SelectItem value="recruitment">Recruitment Data</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Metrics</Label>
                          <Select
                            value={customReport.metrics}
                            onValueChange={(v) =>
                              setCustomReport({ ...customReport, metrics: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select metrics" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="headcount">Headcount</SelectItem>
                              <SelectItem value="attrition">Attrition Rate</SelectItem>
                              <SelectItem value="salary">Salary Analysis</SelectItem>
                              <SelectItem value="engagement">Engagement Score</SelectItem>
                              <SelectItem value="attendance-rate">Attendance Rate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Date Range</Label>
                          <Select
                            value={customReport.dateRange}
                            onValueChange={(v) =>
                              setCustomReport({ ...customReport, dateRange: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select date range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="last-month">Last Month</SelectItem>
                              <SelectItem value="last-quarter">Last Quarter</SelectItem>
                              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                              <SelectItem value="last-year">Last Year</SelectItem>
                              <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Export Format</Label>
                          <Select
                            value={customReport.format}
                            onValueChange={(v) =>
                              setCustomReport({ ...customReport, format: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="xlsx">XLSX</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setReportDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => setReportDialogOpen(false)}
                          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                        >
                          Generate Report
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Data Source</Label>
                    <Select>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="hr">HR Data</SelectItem>
                        <SelectItem value="payroll">Payroll</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Metrics</Label>
                    <Select>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All metrics" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Metrics</SelectItem>
                        <SelectItem value="headcount">Headcount</SelectItem>
                        <SelectItem value="attrition">Attrition</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Filters</Label>
                    <Select>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Pre-built Report Templates ── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Report Templates
                </CardTitle>
                <CardDescription className="text-xs">
                  Pre-configured reports ready to generate or schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {reportTemplates.map((template) => {
                    const Icon = iconMap[template.icon] || FileText
                    return (
                      <div
                        key={template.id}
                        className="flex flex-col rounded-lg border p-4 transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                            <Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm font-semibold">{template.name}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 flex-1">
                          {template.description}
                        </p>
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          Last: {template.lastGenerated}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-[11px] h-7 hover:border-emerald-300 dark:hover:border-emerald-700"
                          >
                            <Play className="h-3 w-3" />
                            Generate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1 text-[11px] h-7 hover:border-emerald-300 dark:hover:border-emerald-700"
                          >
                            <CalendarClock className="h-3 w-3" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ── Recent Reports + Scheduled Reports ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Recent Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Recent Reports
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                      View all
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-1">
                      {recentReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{report.name}</p>
                            <p className="text-muted-foreground text-[11px]">
                              {report.generatedBy} · {report.generatedAt}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              {report.format}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {report.size}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Reports */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Scheduled Reports
                    </CardTitle>
                    <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <CalendarClock className="h-3 w-3" />
                      {scheduledReports.filter((r) => r.status === 'active').length} active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-2">
                      {scheduledReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              report.status === 'active'
                                ? 'bg-emerald-100 dark:bg-emerald-950'
                                : 'bg-muted'
                            }`}
                          >
                            <CalendarClock
                              className={`h-4 w-4 ${
                                report.status === 'active'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">{report.name}</p>
                              <Badge
                                variant={report.status === 'active' ? 'default' : 'secondary'}
                                className={`text-[10px] ${
                                  report.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                    : ''
                                }`}
                              >
                                {report.status}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                {report.frequency}
                              </span>
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                Next: {report.nextRun}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {report.recipients} recipients
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
