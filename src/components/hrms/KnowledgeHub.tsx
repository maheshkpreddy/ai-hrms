'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen,
  Shield,
  Users,
  FileText,
  Building2,
  Sparkles,
  LayoutDashboard,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  UserCircle,
  ArrowRight,
  Target,
  ChevronRight,
  Play,
  Search,
  X,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useHRMSStore } from '@/lib/store'
import {
  videoTutorials,
  trainingCategories,
  trainingCategoryIcons,
  trainingCategoryColors,
  trainingRoleTabs,
  VideoCard,
  TutorialPlayerDialog,
  type VideoTutorial,
} from '@/components/hrms/HelpTraining'

// ─── Wiki URL Base ──────────────────────────────────────────────────────────
const WIKI_URL = 'https://github.com/maheshkpreddy/ai-hrms/wiki'

// ─── Getting Started Steps ────────────────────────────────────────────────────
const gettingStartedSteps = [
  {
    step: 1,
    title: 'Log In & Explore Dashboard',
    description: 'Sign in with your credentials and familiarize yourself with the main dashboard. The dashboard provides an overview of key HR metrics, pending actions, and quick access to all modules.',
    icon: LayoutDashboard,
  },
  {
    step: 2,
    title: 'Set Up Your Profile',
    description: 'Complete your personal and employment profile. Upload your photo, verify your contact details, and set your preferences for notifications and display settings.',
    icon: UserCircle,
  },
  {
    step: 3,
    title: 'Configure Company Settings',
    description: 'If you are an admin, set up company information, branches, departments, and policies. Define holiday calendars, leave types, and working hours.',
    icon: Building2,
  },
  {
    step: 4,
    title: 'Manage Roles & Permissions',
    description: 'Define user roles and assign module permissions using RBAC. Create role-based dashboards to ensure each user sees only what they need.',
    icon: Shield,
  },
  {
    step: 5,
    title: 'Onboard Employees',
    description: 'Start adding employees or use bulk import. Assign them to departments, designate reporting managers, and set up their access credentials.',
    icon: Users,
  },
  {
    step: 6,
    title: 'Explore AI Features',
    description: 'Discover AI-powered features like talent acquisition, performance insights, analytics, and learning recommendations. Look for the AI badge on modules.',
    icon: Sparkles,
  },
]

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const faqData = [
  {
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page. You will receive a password reset link via email. If you do not receive the email, contact your HR admin to reset it for you.',
  },
  {
    question: 'How do I apply for leave?',
    answer: 'Navigate to Self-Service → My Leaves, click "Apply Leave", select the leave type, dates, and provide a reason. Your manager will receive a notification to approve or reject the request.',
  },
  {
    question: 'How do I view my payslips?',
    answer: 'Go to Self-Service → My Payslips. You can view and download payslips for any processed payroll period. Payslips are available as PDF downloads.',
  },
  {
    question: 'How do I submit an expense claim?',
    answer: 'Navigate to Payroll & Expenses → Expenses, click "Submit Expense", fill in the category, amount, date, and attach receipts. The claim will be routed to your manager for approval.',
  },
  {
    question: 'What are AI-powered features?',
    answer: 'Modules marked with an "AI" badge use artificial intelligence for enhanced functionality. This includes AI-powered candidate screening in Talent Acquisition, performance insights, predictive analytics, and personalized learning recommendations.',
  },
  {
    question: 'How do I manage role-based access?',
    answer: 'Admin users can navigate to RBAC & Security to create and manage roles. Each role can be assigned specific module permissions and a default dashboard. Users are then assigned to roles to control their access.',
  },
  {
    question: 'How do I generate reports?',
    answer: 'Go to Analytics & Reporting to access pre-built HR analytics dashboards or create custom reports. You can export data in various formats including PDF, Excel, and CSV.',
  },
  {
    question: 'How do I clock in/out for attendance?',
    answer: 'Navigate to Time & Attendance → Mark Attendance. You can clock in and out, view your attendance history, and check your monthly attendance summary.',
  },
  {
    question: 'Can I access the system on mobile?',
    answer: 'Yes, eh2r AI HRMS is fully responsive and works on mobile browsers. Simply open the URL in your mobile browser and log in with your credentials.',
  },
  {
    question: 'Where can I find detailed documentation?',
    answer: 'Visit our GitHub Wiki for comprehensive documentation, API references, and configuration guides. You can access it from the Wiki Link section below or directly at github.com/maheshkpreddy/ai-hrms/wiki.',
  },
]

// ─── Training Guide Dialog Component ───────────────────────────────────────────
function TrainingGuideDialog({
  open,
  onOpenChange,
  title,
  description,
  steps,
  wikiUrl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  steps: string[]
  wikiUrl: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-700/50 text-white p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          {/* Step-by-step guide */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">
              For detailed walkthroughs, visit the GitHub Wiki.
            </p>
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50"
            >
              <ExternalLink className="size-3.5" />
              Open Wiki Guide
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Training Videos Tab Content ───────────────────────────────────────────────
type Category = (typeof trainingCategories)[number]
type RoleTab = (typeof trainingRoleTabs)[number]

function TrainingVideosContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [activeRole, setActiveRole] = useState<RoleTab>('All')
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)

  // Filter videos
  const filteredVideos = useMemo(() => {
    return videoTutorials.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        activeCategory === 'All' || video.category === activeCategory
      const matchesRole =
        activeRole === 'All' ||
        video.role.includes('all') ||
        video.role.includes(activeRole.toLowerCase())
      return matchesSearch && matchesCategory && matchesRole
    })
  }, [searchQuery, activeCategory, activeRole])

  // Group videos by category for the grid view
  const videosByCategory = useMemo(() => {
    const grouped: Record<string, VideoTutorial[]> = {}
    filteredVideos.forEach((video) => {
      if (!grouped[video.category]) grouped[video.category] = []
      grouped[video.category].push(video)
    })
    return grouped
  }, [filteredVideos])

  const handleVideoClick = useCallback((video: VideoTutorial) => {
    setSelectedVideo(video)
    setPlayerOpen(true)
  }, [])

  const handleClosePlayer = useCallback(() => {
    setPlayerOpen(false)
    setTimeout(() => setSelectedVideo(null), 200)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md">
          <Play className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Training Videos & Tutorials</h2>
          <p className="text-sm text-muted-foreground">
            {videoTutorials.length} interactive tutorials across {trainingCategories.length - 1} categories
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tutorials by title or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Role Filter Tabs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter by Role</span>
        </div>
        <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as RoleTab)}>
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            {trainingRoleTabs.map((role) => (
              <TabsTrigger key={role} value={role} className="gap-1.5 text-xs sm:text-sm">
                {role === 'All' ? <Filter className="h-3.5 w-3.5" /> : null}
                {role}
              </TabsTrigger>
            ))}
          </TabsList>

          {trainingRoleTabs.map((role) => (
            <TabsContent key={role} value={role}>
              {/* Category Chips */}
              <div className="mb-4 flex flex-wrap gap-2">
                {trainingCategories.map((cat) => {
                  const catCount = cat === 'All'
                    ? filteredVideos.length
                    : videoTutorials.filter((v) => {
                        const matchesRole = role === 'All' || v.role.includes('all') || v.role.includes(role.toLowerCase())
                        return v.category === cat && matchesRole
                      }).length
                  if (cat !== 'All' && catCount === 0) return null
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                        activeCategory === cat
                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                      )}
                    >
                      {cat !== 'All' && trainingCategoryIcons[cat] ? (() => {
                        const CIcon = trainingCategoryIcons[cat]
                        return <CIcon className="h-3 w-3" />
                      })() : null}
                      {cat}
                      <span className={cn(
                        'ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-semibold',
                        activeCategory === cat
                          ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      )}>
                        {catCount}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Video Grid */}
              {filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-medium text-gray-500">No tutorials found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-1.5"
                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActiveRole('All'); }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear Filters
                  </Button>
                </div>
              ) : activeCategory === 'All' ? (
                /* Grouped by category */
                <div className="space-y-8">
                  {Object.entries(videosByCategory).map(([category, videos]) => {
                    const catIcon = trainingCategoryIcons[category] || BookOpen
                    const CatIcon = catIcon
                    const catColors = trainingCategoryColors[category] || trainingCategoryColors['Dashboard & Navigation']
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={cn('flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br text-white', catColors.gradient)}>
                            <CatIcon className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category}</h3>
                          <Badge variant="secondary" className="text-[10px]">{videos.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {videos.map((video) => (
                            <VideoCard
                              key={video.id}
                              video={video}
                              onClick={() => handleVideoClick(video)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Flat grid for single category */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onClick={() => handleVideoClick(video)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Tutorial Player Dialog */}
      <TutorialPlayerDialog
        video={selectedVideo}
        open={playerOpen}
        onClose={handleClosePlayer}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KnowledgeHub() {
  const { activeSubItem } = useHRMSStore()
  const [guideDialog, setGuideDialog] = useState<{
    open: boolean
    title: string
    description: string
    steps: string[]
    wikiUrl: string
  }>({ open: false, title: '', description: '', steps: [], wikiUrl: '' })

  // Determine the target tab based on the active sub-item
  const targetTab = useMemo(() => {
    if (activeSubItem === 'training-videos') return 'training-videos'
    if (activeSubItem === 'faq') return 'faq'
    if (activeSubItem === 'knowledge-base') return 'getting-started'
    return 'getting-started'
  }, [activeSubItem])

  const [activeTab, setActiveTab] = useState(targetTab)

  // Track the previous sub-item to detect navigation changes
  const prevSubItemRef = useState(activeSubItem)
  if (prevSubItemRef[0] !== activeSubItem) {
    prevSubItemRef[1](activeSubItem)
    if (targetTab !== activeTab) {
      setActiveTab(targetTab)
    }
  }

  const openGuide = (title: string, description: string, steps: string[], wikiPage: string) => {
    setGuideDialog({
      open: true,
      title,
      description,
      steps,
      wikiUrl: WIKI_URL,
    })
  }

  const closeGuide = () => {
    setGuideDialog((prev) => ({ ...prev, open: false }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
              <BookOpen className="size-7 text-emerald-600 dark:text-emerald-400" />
              Knowledge Hub
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Documentation, training videos, help resources, and guides for eh2r AI HRMS
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          >
            <BookOpen className="size-3" />
            Help & Documentation
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="getting-started" className="gap-1.5 text-xs sm:text-sm">
              <Lightbulb className="size-3.5" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="training-videos" className="gap-1.5 text-xs sm:text-sm">
              <Play className="size-3.5" />
              Training Videos
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-1.5 text-xs sm:text-sm">
              <HelpCircle className="size-3.5" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="wiki" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="size-3.5" />
              Wiki & Docs
            </TabsTrigger>
          </TabsList>

          {/* ── Getting Started Tab ── */}
          <TabsContent value="getting-started">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                  <Lightbulb className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Quick Start Guide</h2>
                  <p className="text-sm text-muted-foreground">
                    Get up and running with eh2r AI HRMS in 6 simple steps
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {gettingStartedSteps.map((step) => {
                  const Icon = step.icon
                  return (
                    <Card
                      key={step.step}
                      className="transition-all duration-200 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          {/* Step number */}
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-sm">
                            {step.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <h3 className="text-sm font-semibold">{step.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                          <CheckCircle2 className="size-5 text-muted-foreground/30 shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* CTA */}
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800/50">
                <CardContent className="p-6 text-center">
                  <Sparkles className="size-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Ready to get started?</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Explore the onboarding guide or check the wiki for detailed documentation.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      className="gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      onClick={() => openGuide('Onboarding Guide', 'Complete walkthrough of eh2r AI HRMS setup and configuration', ['Log in with your company code, email, and password', 'Explore the dashboard and familiarize with KPIs', 'Set up company masters (branches, departments, roles, employee types)', 'Add employees and configure attendance, payroll, and leave policies', 'Explore AI-powered features like talent acquisition and analytics'], 'Getting-Started')}
                    >
                      <BookOpen className="size-4" />
                      View Onboarding Guide
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      asChild
                    >
                      <a href={WIKI_URL} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                        Read Full Documentation
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Training Videos Tab ── */}
          <TabsContent value="training-videos">
            <TrainingVideosContent />
          </TabsContent>

          {/* ── FAQ Tab ── */}
          <TabsContent value="faq">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                  <HelpCircle className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
                  <p className="text-sm text-muted-foreground">
                    Common questions and answers about using eh2r AI HRMS
                  </p>
                </div>
              </div>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqData.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-sm font-medium text-left hover:no-underline hover:text-emerald-600 dark:hover:text-emerald-400">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <HelpCircle className="size-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-sm font-semibold mb-1">Still have questions?</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Check the wiki for detailed documentation or contact support
                  </p>
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href={WIKI_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" />
                      Visit Wiki
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Wiki & Docs Tab ── */}
          <TabsContent value="wiki">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-gray-700 text-white shadow-md">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Wiki & Documentation</h2>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive documentation, guides, and API references
                  </p>
                </div>
              </div>

              {/* Main Wiki Card */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                      <svg className="size-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-white mb-2">
                        eh2r AI HRMS GitHub Wiki
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        Access our comprehensive wiki for installation guides, configuration references, API documentation, troubleshooting tips, and contribution guidelines.
                      </p>
                      <Button
                        className="gap-1.5 bg-white text-slate-900 hover:bg-slate-100"
                        asChild
                      >
                        <a href={WIKI_URL} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" />
                          Open GitHub Wiki
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Documentation Sections */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: 'Installation Guide',
                    description: 'Step-by-step setup instructions for development and production environments',
                    icon: ArrowRight,
                    color: 'from-emerald-500 to-teal-600',
                    wikiPage: 'Installation',
                  },
                  {
                    title: 'Configuration',
                    description: 'Environment variables, database setup, authentication, and system configuration',
                    icon: Target,
                    color: 'from-blue-500 to-indigo-600',
                    wikiPage: 'Configuration',
                  },
                  {
                    title: 'API Reference',
                    description: 'REST API endpoints, request/response formats, and authentication methods',
                    icon: FileText,
                    color: 'from-purple-500 to-violet-600',
                    wikiPage: 'API-Reference',
                  },
                  {
                    title: 'RBAC Setup',
                    description: 'Role-based access control configuration, permissions, and user management',
                    icon: Shield,
                    color: 'from-red-500 to-rose-600',
                    wikiPage: 'RBAC-Setup',
                  },
                  {
                    title: 'Troubleshooting',
                    description: 'Common issues, error messages, and their solutions',
                    icon: HelpCircle,
                    color: 'from-amber-500 to-orange-600',
                    wikiPage: 'Troubleshooting',
                  },
                  {
                    title: 'Contributing',
                    description: 'How to contribute to the project, coding standards, and PR guidelines',
                    icon: Users,
                    color: 'from-cyan-500 to-sky-600',
                    wikiPage: 'Contributing',
                  },
                ].map((doc) => {
                  const Icon = doc.icon
                  return (
                    <Card
                      key={doc.title}
                      className="group transition-all duration-200 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${doc.color} text-white shadow-sm`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">{doc.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {doc.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          asChild
                        >
                          <a
                            href={`${WIKI_URL}/${doc.wikiPage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="size-3" />
                            Read on Wiki
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Quick Links */}
              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[
                      { label: 'GitHub Repository', url: 'https://github.com/maheshkpreddy/ai-hrms' },
                      { label: 'Release Notes', url: 'https://github.com/maheshkpreddy/ai-hrms/releases' },
                      { label: 'Issue Tracker', url: 'https://github.com/maheshkpreddy/ai-hrms/issues' },
                      { label: 'Wiki Home', url: WIKI_URL },
                      { label: 'Training Videos', url: `${WIKI_URL}` },
                      { label: 'Discussions', url: 'https://github.com/maheshkpreddy/ai-hrms/discussions' },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      >
                        <ChevronRight className="size-3 shrink-0" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Training Guide Dialog */}
      <TrainingGuideDialog
        open={guideDialog.open}
        onOpenChange={closeGuide}
        title={guideDialog.title}
        description={guideDialog.description}
        steps={guideDialog.steps}
        wikiUrl={guideDialog.wikiUrl}
      />
    </div>
  )
}
