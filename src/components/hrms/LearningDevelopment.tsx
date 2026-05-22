'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Sparkles,
  BookOpen,
  GraduationCap,
  Target,
  Clock,
  Users,
  Star,
  Play,
  Award,
  CheckCircle2,
  ChevronRight,
  Plus,
  BarChart3,
  Zap,
  ArrowRight,
  TrendingUp,
  Filter,
  ShieldCheck,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  courses,
  skills,
  skillGapData,
  topSkillsByDepartment,
  enrolledCourses,
  completedCourses,
  learningPath,
  certificates,
} from '@/lib/data'

// ─── Category color map (emerald-based, no blue/indigo) ────────────────────
const categoryColors: Record<string, string> = {
  Engineering: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  'Data Science': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  Management: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  Marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
  Finance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
  'Soft Skills': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  Frontend: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  Backend: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  Cloud: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
  DevOps: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  Analytics: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  Security: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
}

const proficiencyColors: Record<string, string> = {
  Advanced: 'bg-emerald-500',
  Intermediate: 'bg-amber-500',
  Beginner: 'bg-rose-400',
}

// ─── Learning stat cards ─────────────────────────────────────────────────────
const learningStats = [
  {
    label: 'Courses Enrolled',
    value: '5',
    icon: BookOpen,
    iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    label: 'In Progress',
    value: '3',
    icon: Play,
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
  {
    label: 'Completed',
    value: '2',
    icon: CheckCircle2,
    iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  },
  {
    label: 'Avg Score',
    value: '85%',
    icon: Target,
    iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  },
]

// ─── Custom tooltip style ─────────────────────────────────────────────────────
const customTooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LearningDevelopment() {
  // Course Catalog state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [providerFilter, setProviderFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')

  // Skill Inventory state
  const [skillSearch, setSkillSearch] = useState('')

  // Unique categories and providers for filters
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(courses.map((c) => c.category)))],
    []
  )
  const providers = useMemo(
    () => ['all', ...Array.from(new Set(courses.map((c) => c.provider)))],
    []
  )

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        categoryFilter === 'all' || course.category === categoryFilter

      const matchesProvider =
        providerFilter === 'all' || course.provider === providerFilter

      const matchesDuration =
        durationFilter === 'all' ||
        (durationFilter === 'short' && course.duration <= 15) ||
        (durationFilter === 'medium' && course.duration > 15 && course.duration <= 30) ||
        (durationFilter === 'long' && course.duration > 30)

      return matchesSearch && matchesCategory && matchesProvider && matchesDuration
    })
  }, [searchQuery, categoryFilter, providerFilter, durationFilter])

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter(
      (skill) =>
        skillSearch === '' ||
        skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
        skill.category.toLowerCase().includes(skillSearch.toLowerCase())
    )
  }, [skillSearch])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Learning &amp; Development
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-powered skill development &amp; training management
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          >
            <Sparkles className="h-3 w-3" />
            AI Enhanced
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="catalog" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Course Catalog</span>
              <span className="sm:hidden">Catalog</span>
            </TabsTrigger>
            <TabsTrigger value="mylearning" className="gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">My Learning</span>
              <span className="sm:hidden">Learning</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1.5">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Skill Inventory</span>
              <span className="sm:hidden">Skills</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Course Catalog ──────────────────────────────────────── */}
          <TabsContent value="catalog" className="space-y-6">
            {/* AI Recommendation Banner */}
            <div className="rounded-xl border bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/40 dark:to-teal-950/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                    <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                      AI-Powered Recommendations
                    </h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      AI recommends courses based on your role and performance gaps
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 sm:ml-auto"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Get Recommendations
                </Button>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses, skills..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-1 h-3.5 w-3.5" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov === 'all' ? 'All Providers' : prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Duration</SelectItem>
                    <SelectItem value="short">Short (≤ 15h)</SelectItem>
                    <SelectItem value="medium">Medium (16–30h)</SelectItem>
                    <SelectItem value="long">Long (&gt; 30h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Admin Add Course Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="gap-1.5 hover:border-emerald-300 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group relative overflow-hidden transition-all hover:shadow-md"
                >
                  {/* AI Recommended Ribbon */}
                  {course.aiRecommended && (
                    <div className="absolute right-0 top-0 z-10">
                      <div className="rounded-bl-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Recommended
                        </span>
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                        <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <CardTitle className="text-sm font-semibold leading-snug">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 text-xs">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    {/* Category & Level */}
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${categoryColors[course.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
                      >
                        {course.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {course.level}
                      </Badge>
                    </div>

                    {/* Meta info */}
                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrollmentCount} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        {course.rating}
                      </span>
                    </div>

                    {/* Provider */}
                    <p className="text-muted-foreground text-xs">
                      by {course.provider}
                    </p>

                    {/* Completion Rate */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Completion rate</span>
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                          {course.completionRate}%
                        </span>
                      </div>
                      <Progress
                        value={course.completionRate}
                        className="h-1.5 [&>div]:bg-emerald-500"
                      />
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {course.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Enroll Button */}
                    <Button className="w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
                      <Play className="h-3.5 w-3.5" />
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/40" />
                <h3 className="font-semibold">No courses found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </TabsContent>

          {/* ─── Tab 2: My Learning ────────────────────────────────────────── */}
          <TabsContent value="mylearning" className="space-y-6">
            {/* Learning Progress Dashboard */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {learningStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-xs font-medium sm:text-sm">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`rounded-lg p-2.5 ${stat.iconBg}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
                  </Card>
                )
              })}
            </div>

            {/* Active Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Active Courses
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                  >
                    {enrolledCourses.length} in progress
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                        <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <Badge
                            variant="secondary"
                            className={`w-fit text-[10px] ${categoryColors[course.category] || ''}`}
                          >
                            {course.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.lastAccessed}
                          </span>
                          <span>Next: {course.nextModule}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress
                            value={course.progress}
                            className="h-2 [&>div]:bg-emerald-500"
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 sm:shrink-0"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Completed Courses
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  >
                    {completedCourses.length} completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <Badge
                            variant="secondary"
                            className={`w-fit text-[10px] ${categoryColors[course.category] || ''}`}
                          >
                            {course.category}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Score: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{course.score}%</span>
                          </span>
                          <span>Completed: {course.completedDate}</span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 sm:shrink-0"
                      >
                        <Award className="h-3 w-3" />
                        Certificate
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Learning Path Visualization */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">
                    AI Learning Path
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  >
                    <Sparkles className="h-3 w-3" />
                    AI Suggested
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Personalized learning sequence based on your skill gaps and career goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Horizontal Path Visualization */}
                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-max items-center gap-0">
                    {learningPath.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        {/* Step Node */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all sm:h-16 sm:w-16 ${
                              step.status === 'completed'
                                ? 'border-emerald-500 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-950'
                                : step.status === 'in-progress'
                                  ? 'border-amber-500 bg-amber-100 dark:border-amber-400 dark:bg-amber-950 animate-pulse'
                                  : 'border-muted-foreground/30 bg-muted/50 dark:bg-muted/20'
                            }`}
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            ) : step.status === 'in-progress' ? (
                              <Play className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <span className="text-lg font-bold text-muted-foreground/50">
                                {step.order}
                              </span>
                            )}
                          </div>
                          <div className="max-w-[100px] text-center sm:max-w-[120px]">
                            <p
                              className={`text-[11px] font-medium leading-tight ${
                                step.status === 'completed'
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : step.status === 'in-progress'
                                    ? 'text-amber-700 dark:text-amber-400'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {step.title}
                            </p>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-[9px] ${
                                step.status === 'completed'
                                  ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                                  : step.status === 'in-progress'
                                    ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                                    : ''
                              }`}
                            >
                              {step.status === 'completed'
                                ? 'Done'
                                : step.status === 'in-progress'
                                  ? 'Active'
                                  : 'Upcoming'}
                            </Badge>
                          </div>
                        </div>

                        {/* Arrow Connector */}
                        {index < learningPath.length - 1 && (
                          <div className="flex items-center px-1 sm:px-2">
                            <ArrowRight
                              className={`h-5 w-5 ${
                                step.status === 'completed'
                                  ? 'text-emerald-500'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      Certificates
                    </CardTitle>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {certificates.length} earned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                        <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm">{cert.title}</h4>
                        <p className="text-muted-foreground text-xs">
                          {cert.provider} · Issued {cert.issuedDate}
                        </p>
                        <p className="mt-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                          {cert.certificateId}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs">
                        View
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 3: Skill Inventory ────────────────────────────────────── */}
          <TabsContent value="skills" className="space-y-6">
            {/* Skill Search & Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  className="pl-9"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-1.5 hover:border-emerald-300 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                >
                  <Plus className="h-4 w-4" />
                  Add Skill
                </Button>
                <Button className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Assess Skills
                </Button>
              </div>
            </div>

            {/* Organization Skill Map */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">
                    Organization Skill Map
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {skills.length} skills
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Overview of skills across the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group rounded-lg border p-3 transition-all hover:border-emerald-300 hover:shadow-sm dark:hover:border-emerald-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm">{skill.name}</h4>
                            <Badge
                              variant="secondary"
                              className={`mt-1 text-[10px] ${categoryColors[skill.category] || ''}`}
                            >
                              {skill.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Proficiency</span>
                            <span className="font-medium">{skill.proficiency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${proficiencyColors[skill.proficiency] || 'bg-gray-400'}`}
                                style={{
                                  width:
                                    skill.proficiency === 'Advanced'
                                      ? '85%'
                                      : skill.proficiency === 'Intermediate'
                                        ? '55%'
                                        : '30%',
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{skill.employees} employees</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {filteredSkills.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Target className="mb-2 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No skills found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skill Gap Analysis */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      Skill Gap Analysis
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    >
                      <Sparkles className="h-3 w-3" />
                      AI
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Required vs available skill levels across the organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={skillGapData} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis
                          dataKey="skill"
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip {...customTooltipStyle} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Radar
                          name="Required"
                          dataKey="required"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Available"
                          dataKey="available"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Skills by Department */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                      Top Skills by Department
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-xs">
                    Key skills driving each department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-4">
                      {topSkillsByDepartment.map((dept) => (
                        <div
                          key={dept.department}
                          className="rounded-lg border p-3 transition-colors hover:bg-muted/30"
                        >
                          <h4 className="mb-2 font-medium text-sm">{dept.department}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.topSkills.map((skill, idx) => (
                              <Badge
                                key={skill}
                                variant={idx === 0 ? 'default' : 'secondary'}
                                className={`text-[10px] ${
                                  idx === 0
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : ''
                                }`}
                              >
                                <TrendingUp className="mr-1 h-2.5 w-2.5" />
                                {skill}
                              </Badge>
                            ))}
                          </div>
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
