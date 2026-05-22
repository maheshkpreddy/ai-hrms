'use client'

import { useState } from 'react'
import {
  Star,
  TrendingUp,
  Users,
  Clock,
  Award,
  Plus,
  Sparkles,
  AlertTriangle,
  Target,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ThumbsUp,
  Minus,
  Lightbulb,
  Shield,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  performanceData,
  attritionPrediction,
  companyOKRs,
  individualOKRs,
  peerFeedbackData,
  highRiskEmployees,
  ratingDistribution,
  employees,
} from '@/lib/data'

// ─── Custom Tooltip Style ─────────────────────────────────────────────────────
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

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{rating}</span>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    completed: {
      label: 'Completed',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    'in-review': {
      label: 'In Review',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
    draft: {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    },
  }
  const c = config[status] || config.draft
  return (
    <Badge variant="secondary" className={`text-[10px] font-medium ${c.className}`}>
      {c.label}
    </Badge>
  )
}

// ─── Sentiment Badge ──────────────────────────────────────────────────────────
function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; className: string }> = {
    positive: {
      icon: ThumbsUp,
      label: 'Positive',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    },
    neutral: {
      icon: Minus,
      label: 'Neutral',
      className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    },
    constructive: {
      icon: Lightbulb,
      label: 'Constructive',
      className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    },
  }
  const c = config[sentiment] || config.neutral
  const Icon = c.icon
  return (
    <Badge variant="secondary" className={`gap-1 text-[10px] font-medium ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  )
}

// ─── Risk Score Badge ─────────────────────────────────────────────────────────
function RiskScoreBadge({ score }: { score: number }) {
  let className = ''
  if (score > 50) {
    className = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
  } else if (score >= 25) {
    className = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
  } else {
    className = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
  }
  return (
    <Badge variant="secondary" className={`text-[10px] font-medium ${className}`}>
      {score}%
    </Badge>
  )
}

// ─── Gauge Chart for Attrition Risk ───────────────────────────────────────────
function AttritionGauge({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100
  const angle = (percentage / 100) * 180
  const radius = 70
  const cx = 90
  const cy = 85

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 180) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    }
  }

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }

  const needleEnd = polarToCartesian(cx, cy, radius - 15, angle)
  const needleBase1 = polarToCartesian(cx, cy, 5, angle - 90)
  const needleBase2 = polarToCartesian(cx, cy, 5, angle + 90)

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Background arc */}
        <path
          d={describeArc(cx, cy, radius, 0, 180)}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored segments */}
        <path
          d={describeArc(cx, cy, radius, 0, 60)}
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={describeArc(cx, cy, radius, 60, 120)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="12"
          strokeLinecap="butt"
        />
        <path
          d={describeArc(cx, cy, radius, 120, 180)}
          fill="none"
          stroke="#ef4444"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Needle */}
        <polygon
          points={`${needleEnd.x},${needleEnd.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill="hsl(var(--foreground))"
          className="transition-all duration-1000"
        />
        <circle cx={cx} cy={cy} r="4" fill="hsl(var(--foreground))" />
        {/* Labels */}
        <text x="15" y="100" fontSize="10" fill="#10b981" fontWeight="600">Low</text>
        <text x="75" y="25" fontSize="10" fill="#f59e0b" fontWeight="600">Med</text>
        <text x="140" y="100" fontSize="10" fill="#ef4444" fontWeight="600">High</text>
      </svg>
      <div className="text-center -mt-1">
        <p className="text-3xl font-bold text-foreground">{value}%</p>
        <p className="text-xs text-muted-foreground">Overall Attrition Risk</p>
      </div>
    </div>
  )
}

// ─── Stat Card Config ─────────────────────────────────────────────────────────
const reviewStatCards = [
  {
    label: 'Avg Rating',
    value: '4.1/5',
    icon: Star,
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    change: '+0.3 vs last quarter',
    changeType: 'positive' as const,
  },
  {
    label: 'Reviews Completed',
    value: '85%',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    change: '102 of 120 done',
    changeType: 'positive' as const,
  },
  {
    label: 'Pending Reviews',
    value: '12',
    icon: Clock,
    iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    change: '3 overdue',
    changeType: 'negative' as const,
  },
  {
    label: 'Top Performers',
    value: '8',
    icon: Award,
    iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
    change: 'Rating 4.5+',
    changeType: 'positive' as const,
  },
]

// ─── AI Suggested Questions ───────────────────────────────────────────────────
const aiSuggestedQuestions = [
  'How has the employee demonstrated leadership in their role this quarter?',
  'What specific contributions has the employee made toward team goals?',
  'Identify areas where the employee has shown growth compared to the previous review period.',
  'What are the key skills the employee should develop for their next career milestone?',
  'How effectively has the employee collaborated with cross-functional teams?',
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function Performance() {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [reviewPeriod, setReviewPeriod] = useState('Q1 2024')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Performance &amp; Talent Development
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-powered performance reviews, OKRs, and attrition analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            >
              <Sparkles className="h-3 w-3" />
              AI Enhanced
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="reviews" className="gap-1.5">
              <Star className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Performance Reviews</span>
              <span className="sm:hidden">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="okrs" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">OKRs &amp; Feedback</span>
              <span className="sm:hidden">OKRs</span>
            </TabsTrigger>
            <TabsTrigger value="attrition" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Attrition Analysis</span>
              <span className="sm:hidden">Attrition</span>
              <Badge
                variant="secondary"
                className="ml-1 gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[9px] px-1 py-0"
              >
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: Performance Reviews
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {reviewStatCards.map((card) => {
                const Icon = card.icon
                return (
                  <Card key={card.label} className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <p className="text-muted-foreground text-xs font-medium">{card.label}</p>
                          <p className="text-xl font-bold tracking-tight sm:text-2xl">{card.value}</p>
                          <p
                            className={`text-[11px] ${
                              card.changeType === 'positive'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {card.change}
                          </p>
                        </div>
                        <div className={`rounded-lg p-2 ${card.iconBg}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
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

            {/* Review Table + Start Review */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base font-semibold">Performance Reviews</CardTitle>
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="h-4 w-4" />
                        Start Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Start Performance Review</DialogTitle>
                        <DialogDescription>
                          Initiate a new performance review cycle for an employee.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>Employee</Label>
                          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees
                                .filter((e) => e.status === 'active')
                                .map((emp) => (
                                  <SelectItem key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName} — {emp.designation}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Review Period</Label>
                          <Select value={reviewPeriod} onValueChange={setReviewPeriod}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                              <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                              <SelectItem value="H1 2024">H1 2024 (Mid-Year)</SelectItem>
                              <SelectItem value="FY 2024">FY 2024 (Annual)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>AI-Suggested Questions</Label>
                            <Badge
                              variant="secondary"
                              className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[9px]"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              AI
                            </Badge>
                          </div>
                          <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-2 custom-scrollbar">
                            {aiSuggestedQuestions.map((q, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  {i + 1}
                                </span>
                                <span>{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setReviewDialogOpen(false)}
                        >
                          Create Review
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Review Period</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="hidden md:table-cell">Objectives</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performanceData.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                {review.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                              <span className="font-medium text-sm">{review.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {review.reviewPeriod}
                          </TableCell>
                          <TableCell>
                            <StarRating rating={review.rating} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate text-sm text-muted-foreground">
                            {review.objectives}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={review.status} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                              View
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* AI-Assisted Reviews + Rating Distribution */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* AI-Assisted Reviews Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">AI-Assisted Reviews</CardTitle>
                    <Badge
                      variant="secondary"
                      className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      AI Powered
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    AI has analyzed performance data and generated review questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/50">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                            AI Analysis Complete
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                            Based on 120 performance records, project deliverables, and peer feedback data
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {aiSuggestedQuestions.slice(0, 4).map((q, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-md border bg-card p-2.5 text-sm"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground text-xs leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Rating Distribution</CardTitle>
                  <CardDescription className="text-xs">
                    Distribution of employee ratings across all reviews
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ratingDistribution}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        layout="vertical"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.5}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          domain={[0, 60]}
                        />
                        <YAxis
                          type="category"
                          dataKey="stars"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={(v) => `${v} ★`}
                          width={40}
                        />
                        <Tooltip
                          {...customTooltipStyle}
                          formatter={(value: number, name: string) => [
                            `${value} employees`,
                            name,
                          ]}
                          labelFormatter={(label) => `${label} Star Rating`}
                        />
                        <Bar dataKey="count" name="Employees" radius={[0, 4, 4, 0]} barSize={24}>
                          {ratingDistribution.map((entry, index) => {
                            const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#059669']
                            return <Cell key={`cell-${index}`} fill={colors[index]} />
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-4">
                      {ratingDistribution.map((d) => (
                        <div key={d.stars} className="text-center">
                          <p className="text-xs font-medium">{d.stars}★</p>
                          <p className="text-[10px] text-muted-foreground">{d.percentage}%</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">115 total reviews</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: OKRs & Feedback
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="okrs" className="space-y-6">
            {/* Company OKRs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">Company OKRs</CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    Q1 2024
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {companyOKRs.map((okr) => (
                    <div key={okr.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <h4 className="text-sm font-semibold">{okr.objective}</h4>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            okr.overallProgress >= 75
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : okr.overallProgress >= 50
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          }`}
                        >
                          {okr.overallProgress}% Complete
                        </Badge>
                      </div>
                      <div className="space-y-2 pl-6">
                        {okr.keyResults.map((kr, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{kr.title}</span>
                              <span className="font-medium">{kr.progress}%</span>
                            </div>
                            <Progress value={kr.progress} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Individual OKRs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Individual OKRs</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <Plus className="h-3 w-3" />
                    Add OKR
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto space-y-3 custom-scrollbar">
                  {individualOKRs.map((okr) => (
                    <div
                      key={okr.id}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        {okr.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{okr.name}</p>
                          <span
                            className={`ml-2 shrink-0 text-xs font-semibold ${
                              okr.progress >= 80
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : okr.progress >= 50
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {okr.progress}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{okr.objective}</p>
                        <Progress value={okr.progress} className="mt-1.5 h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Continuous Feedback */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">Continuous Feedback</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      Recent
                    </Badge>
                  </div>
                  <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                      >
                        <Plus className="h-3 w-3" />
                        Add Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Peer Feedback</DialogTitle>
                        <DialogDescription>
                          Share constructive feedback about a colleague&apos;s performance.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>For Employee</Label>
                          <Select>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select colleague" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees
                                .filter((e) => e.status === 'active')
                                .map((emp) => (
                                  <SelectItem key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Sentiment</Label>
                          <Select>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select sentiment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="positive">Positive</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="constructive">Constructive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Feedback</Label>
                          <Textarea
                            placeholder="Share your feedback..."
                            className="min-h-[100px] resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setFeedbackDialogOpen(false)}
                        >
                          Submit Feedback
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
                  {peerFeedbackData.map((fb) => (
                    <div
                      key={fb.id}
                      className="rounded-lg border p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                            {fb.from
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-xs font-medium">
                              <span className="text-foreground">{fb.from}</span>
                              <span className="text-muted-foreground"> → </span>
                              <span className="text-foreground">{fb.to}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">{fb.date}</p>
                          </div>
                        </div>
                        <SentimentBadge sentiment={fb.sentiment} />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {fb.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: AI Attrition Analysis
              ═══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="attrition" className="space-y-6">
            {/* Attrition Risk Overview + Department Chart */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Gauge Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">Attrition Risk Overview</CardTitle>
                    <Badge
                      variant="secondary"
                      className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      AI Prediction
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <AttritionGauge value={12.5} />
                  <div className="mt-4 grid w-full grid-cols-3 gap-3 border-t pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">72%</p>
                      <p className="text-[10px] text-muted-foreground">Low Risk</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">18%</p>
                      <p className="text-[10px] text-muted-foreground">Medium Risk</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">10%</p>
                      <p className="text-[10px] text-muted-foreground">High Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Department-wise Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      Department-wise Attrition Prediction
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
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
                          tick={{ fontSize: 10 }}
                          stroke="hsl(var(--muted-foreground))"
                          angle={-25}
                          textAnchor="end"
                          height={55}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          domain={[0, 30]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          {...customTooltipStyle}
                          formatter={(value: number, name: string) => [
                            `${value}%`,
                            name,
                          ]}
                        />
                        <Bar
                          dataKey="risk"
                          name="AI Predicted Risk"
                          radius={[4, 4, 0, 0]}
                          barSize={14}
                        >
                          {attritionPrediction.map((entry, index) => {
                            const color =
                              entry.risk > 20
                                ? '#ef4444'
                                : entry.risk > 12
                                  ? '#f59e0b'
                                  : '#10b981'
                            return <Cell key={`cell-${index}`} fill={color} />
                          })}
                        </Bar>
                        <Bar
                          dataKey="actual"
                          name="Actual Attrition"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          barSize={14}
                          opacity={0.6}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* High-Risk Employees Table */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">High-Risk Employees</CardTitle>
                    <Badge variant="destructive" className="text-[10px]">
                      {highRiskEmployees.length} flagged
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead className="hidden md:table-cell">Key Factors</TableHead>
                        <TableHead className="hidden lg:table-cell">Recommended Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highRiskEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                  emp.riskScore > 50
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                    : emp.riskScore >= 25
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                }`}
                              >
                                {emp.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                              <span className="font-medium text-sm">{emp.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {emp.department}
                          </TableCell>
                          <TableCell>
                            <RiskScoreBadge score={emp.riskScore} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {emp.keyFactors.map((factor, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-[10px] font-normal"
                                >
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[240px]">
                              {emp.recommendedActions.map((action, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-[10px] font-normal bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                >
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* AI-Generated Insights + Retention Plan */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Insight 1 */}
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-semibold">Sales Team Attrition Alert</p>
                        <Badge
                          variant="secondary"
                          className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[8px] px-1 py-0"
                        >
                          <Sparkles className="h-2 w-2" />
                          AI
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Sales team shows <span className="font-semibold text-amber-600 dark:text-amber-400">22% attrition risk</span> — primarily due to compensation concerns. 
                        3 out of 28 sales team members have declining engagement scores.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insight 2 */}
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                      <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-semibold">Engineering Disengagement</p>
                        <Badge
                          variant="secondary"
                          className="gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[8px] px-1 py-0"
                        >
                          <Sparkles className="h-2 w-2" />
                          AI
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">3 engineers</span> have disengagement patterns — recommend career growth discussions. 
        Particular concern around junior developers seeking advancement.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Retention Plan */}
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 mb-3">
                    <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">AI Retention Planning</h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Generate personalized retention strategies based on AI analysis of risk factors and employee data.
                  </p>
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Retention Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
