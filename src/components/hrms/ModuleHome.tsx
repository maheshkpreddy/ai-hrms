'use client'

import {
  LayoutDashboard,
  Users,
  Shield,
  Brain,
  Clock,
  Banknote,
  TrendingUp,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Sparkles,
  FolderKanban,
  Building2,
  Briefcase,
  UsersRound,
  ArrowRight,
  Laptop,
  FileText,
  ListTodo,
  Video,
  UserCircle,
  Settings,
  Globe,
  CalendarDays,
  Timer,
  ClipboardCheck,
  Bot,
  GitBranch,
  HandMetal,
  LogOut,
  ScanSearch,
  HelpCircle,
  UserCog,
  Truck,
  Network,
} from 'lucide-react'
import { useHRMSStore, type ModuleKey } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ModuleCard {
  key: ModuleKey
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  aiPowered: boolean
  gradient: string
  iconBg: string
}

interface ModuleCategory {
  title: string
  modules: ModuleCard[]
}

const moduleDefinitions: ModuleCard[] = [
  // ─── Core ─────────────────────────────────────
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Overview analytics, KPIs, and real-time insights',
    icon: LayoutDashboard,
    aiPowered: false,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'masters',
    label: 'Master Management',
    description: 'Branches, designations, grades, leave types, and skills',
    icon: ClipboardCheck,
    aiPowered: false,
    gradient: 'from-slate-500 to-gray-600',
    iconBg: 'bg-slate-100 text-slate-700',
  },
  {
    key: 'employees',
    label: 'Employee Management',
    description: 'Directory, profiles, departments, and team management',
    icon: Users,
    aiPowered: false,
    gradient: 'from-cyan-500 to-sky-600',
    iconBg: 'bg-cyan-100 text-cyan-700',
  },
  {
    key: 'company',
    label: 'Company Management',
    description: 'Company info, branches, policies, and organization setup',
    icon: Building2,
    aiPowered: false,
    gradient: 'from-gray-500 to-slate-600',
    iconBg: 'bg-gray-100 text-gray-700',
  },

  // ─── Talent & Recruitment ─────────────────────
  {
    key: 'recruitment',
    label: 'Recruitment ATS',
    description: 'Requisitions, candidate pipeline, and hiring workflow',
    icon: UsersRound,
    aiPowered: false,
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  {
    key: 'ai-interview',
    label: 'AI Interview',
    description: 'AI-powered video interviews, question generation, and scoring',
    icon: Brain,
    aiPowered: true,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 text-violet-700',
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    description: 'New hire onboarding, document collection, and orientation',
    icon: HandMetal,
    aiPowered: false,
    gradient: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    key: 'jobportal',
    label: 'Job Portal',
    description: 'Public job listings, candidate applications, and AI screening',
    icon: Briefcase,
    aiPowered: true,
    gradient: 'from-fuchsia-500 to-pink-600',
    iconBg: 'bg-fuchsia-100 text-fuchsia-700',
  },

  // ─── Time & Finance ───────────────────────────
  {
    key: 'attendance',
    label: 'Time & Attendance',
    description: 'Attendance tracking, shifts, holidays, and geofencing',
    icon: Clock,
    aiPowered: false,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-100 text-cyan-700',
  },
  {
    key: 'leave',
    label: 'Leave Management',
    description: 'Leave requests, approvals, balance tracking, and policies',
    icon: CalendarDays,
    aiPowered: false,
    gradient: 'from-sky-500 to-cyan-600',
    iconBg: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'payroll',
    label: 'Payroll & Expenses',
    description: 'Salary processing, expense claims, and financial reports',
    icon: Banknote,
    aiPowered: false,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'timesheet',
    label: 'Timesheet',
    description: 'Time logging, project hours, billable tracking, and approvals',
    icon: Timer,
    aiPowered: false,
    gradient: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-100 text-orange-700',
  },

  // ─── Performance & Growth ─────────────────────
  {
    key: 'performance',
    label: 'Performance',
    description: 'AI reviews, goals, OKRs, 360 feedback, and appraisals',
    icon: TrendingUp,
    aiPowered: true,
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 text-rose-700',
  },
  {
    key: 'training',
    label: 'Training & LMS',
    description: 'AI-curated courses, certifications, and skill development',
    icon: GraduationCap,
    aiPowered: true,
    gradient: 'from-teal-500 to-green-600',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    key: 'projects',
    label: 'Project Management',
    description: 'Kanban boards, milestones, timelines, and team allocation',
    icon: FolderKanban,
    aiPowered: false,
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-100 text-indigo-700',
  },

  // ─── Portals ──────────────────────────────────
  {
    key: 'clients',
    label: 'Client Portal',
    description: 'Client management, ticketing, and resume access control',
    icon: Globe,
    aiPowered: false,
    gradient: 'from-sky-500 to-cyan-600',
    iconBg: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'vendors',
    label: 'Vendor Portal',
    description: 'Vendor management, contracts, and compliance tracking',
    icon: Truck,
    aiPowered: false,
    gradient: 'from-lime-500 to-green-600',
    iconBg: 'bg-lime-100 text-lime-700',
  },
  {
    key: 'subvendors',
    label: 'Sub-Vendor Portal',
    description: 'Sub-vendor management, resume uploads, and candidate tracking',
    icon: Network,
    aiPowered: false,
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-orange-100 text-orange-700',
  },

  // ─── Operations ───────────────────────────────
  {
    key: 'helpdesk',
    label: 'Helpdesk',
    description: 'Internal ticketing, SLA management, and issue resolution',
    icon: MessageSquare,
    aiPowered: false,
    gradient: 'from-yellow-500 to-amber-600',
    iconBg: 'bg-yellow-100 text-yellow-700',
  },
  {
    key: 'ai-chatbot',
    label: 'AI Chatbot',
    description: 'AI-powered HR assistant for queries, policies, and guidance',
    icon: Bot,
    aiPowered: true,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'workflows',
    label: 'Workflow Engine',
    description: 'Automated approval workflows, triggers, and business rules',
    icon: GitBranch,
    aiPowered: false,
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'assets',
    label: 'Asset Management',
    description: 'IT assets, inventory tracking, assignments, and lifecycle',
    icon: Laptop,
    aiPowered: false,
    gradient: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'documents',
    label: 'Document Management',
    description: 'Upload, organize, version, and manage company documents',
    icon: FileText,
    aiPowered: false,
    gradient: 'from-yellow-500 to-orange-600',
    iconBg: 'bg-yellow-100 text-yellow-700',
  },

  // ─── Administration ───────────────────────────
  {
    key: 'rbac',
    label: 'RBAC & Security',
    description: 'Role permissions, access control, and security policies',
    icon: Shield,
    aiPowered: false,
    gradient: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-100 text-red-700',
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'System configuration, preferences, and integrations',
    icon: Settings,
    aiPowered: false,
    gradient: 'from-gray-500 to-slate-600',
    iconBg: 'bg-gray-100 text-gray-700',
  },
  {
    key: 'audit',
    label: 'Audit & Compliance',
    description: 'Audit trails, compliance reports, and activity logs',
    icon: ScanSearch,
    aiPowered: false,
    gradient: 'from-red-500 to-orange-600',
    iconBg: 'bg-red-100 text-red-700',
  },

  // ─── Personal ─────────────────────────────────
  {
    key: 'selfservice',
    label: 'Self-Service',
    description: 'My leaves, payslips, requests, and personal dashboard',
    icon: UserCog,
    aiPowered: false,
    gradient: 'from-lime-500 to-green-600',
    iconBg: 'bg-lime-100 text-lime-700',
  },
  {
    key: 'tasks',
    label: 'Task Management',
    description: 'Create, assign, prioritize, and track team tasks',
    icon: ListTodo,
    aiPowered: false,
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-100 text-pink-700',
  },
  {
    key: 'meetings',
    label: 'Meetings',
    description: 'Schedule meetings, send invites, and manage RSVPs',
    icon: Video,
    aiPowered: false,
    gradient: 'from-violet-500 to-indigo-600',
    iconBg: 'bg-violet-100 text-violet-700',
  },
  {
    key: 'profile',
    label: 'My Profile',
    description: 'Personal info, employment details, and documents',
    icon: UserCircle,
    aiPowered: false,
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    key: 'help',
    label: 'Help & Training',
    description: 'User guides, tutorials, FAQs, and support resources',
    icon: HelpCircle,
    aiPowered: false,
    gradient: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-100 text-green-700',
  },
  {
    key: 'exit',
    label: 'Exit Workflow',
    description: 'Resignation, clearance, FNF, and knowledge transfer',
    icon: LogOut,
    aiPowered: false,
    gradient: 'from-red-500 to-gray-600',
    iconBg: 'bg-red-100 text-red-700',
  },

  // ─── Analytics (standalone) ───────────────────
  {
    key: 'analytics',
    label: 'Analytics & Reporting',
    description: 'AI-powered analytics, custom reports, and data export',
    icon: BarChart3,
    aiPowered: true,
    gradient: 'from-fuchsia-500 to-purple-600',
    iconBg: 'bg-fuchsia-100 text-fuchsia-700',
  },
]

const categories: ModuleCategory[] = [
  {
    title: 'Core',
    modules: moduleDefinitions.filter(m =>
      ['dashboard', 'masters', 'employees', 'company'].includes(m.key)
    ),
  },
  {
    title: 'Talent & Recruitment',
    modules: moduleDefinitions.filter(m =>
      ['recruitment', 'ai-interview', 'onboarding', 'jobportal'].includes(m.key)
    ),
  },
  {
    title: 'Time & Finance',
    modules: moduleDefinitions.filter(m =>
      ['attendance', 'leave', 'payroll', 'timesheet'].includes(m.key)
    ),
  },
  {
    title: 'Performance & Growth',
    modules: moduleDefinitions.filter(m =>
      ['performance', 'training', 'projects'].includes(m.key)
    ),
  },
  {
    title: 'Portals',
    modules: moduleDefinitions.filter(m =>
      ['clients', 'vendors', 'subvendors'].includes(m.key)
    ),
  },
  {
    title: 'Operations',
    modules: moduleDefinitions.filter(m =>
      ['helpdesk', 'ai-chatbot', 'workflows', 'assets', 'documents'].includes(m.key)
    ),
  },
  {
    title: 'Administration',
    modules: moduleDefinitions.filter(m =>
      ['rbac', 'settings', 'audit'].includes(m.key)
    ),
  },
  {
    title: 'Personal',
    modules: moduleDefinitions.filter(m =>
      ['selfservice', 'tasks', 'meetings', 'profile', 'help', 'exit'].includes(m.key)
    ),
  },
  {
    title: 'Analytics',
    modules: moduleDefinitions.filter(m =>
      ['analytics'].includes(m.key)
    ),
  },
]

export default function ModuleHome() {
  const { selectModule } = useHRMSStore()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome to eh2r AI
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select a module to get started. An AI Product of MARQ AI.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="w-fit gap-1.5 bg-emerald-100 text-emerald-700"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            System Online
          </Badge>
        </div>

        {/* Module Categories */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.title}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  {category.title}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {category.modules.length} module{category.modules.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Module Grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {category.modules.map((mod) => {
                  const Icon = mod.icon
                  return (
                    <Card
                      key={mod.key}
                      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 overflow-hidden"
                      onClick={() => selectModule(mod.key)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`rounded-lg p-1.5 ${mod.iconBg}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {mod.aiPowered && (
                            <Badge
                              variant="secondary"
                              className="gap-0.5 text-[8px] bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-1 py-0"
                            >
                              <Sparkles className="size-2" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-xs text-foreground group-hover:text-emerald-700 transition-colors truncate">
                          {mod.label}
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                          {mod.description}
                        </p>
                      </CardContent>
                      {/* Bottom gradient accent */}
                      <div className={`h-0.5 w-full bg-gradient-to-r ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            eh2r AI — An AI Product of MARQ AI | AI-Powered Human Resource Management System
          </p>
        </div>
      </div>
    </div>
  )
}
