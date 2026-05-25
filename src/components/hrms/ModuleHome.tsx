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
  stats?: string
}

const modules: ModuleCard[] = [
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
    key: 'employees',
    label: 'Employee Management',
    description: 'Directory, onboarding, departments, and teams',
    icon: Users,
    aiPowered: false,
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'company',
    label: 'Company',
    description: 'Company info, branches, and organizational policies',
    icon: Building2,
    aiPowered: false,
    gradient: 'from-slate-500 to-gray-600',
    iconBg: 'bg-slate-100 text-slate-700',
  },
  {
    key: 'assets',
    label: 'Asset Management',
    description: 'IT assets, inventory, assignments, and tracking',
    icon: Laptop,
    aiPowered: false,
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'documents',
    label: 'Document Management',
    description: 'Upload, organize, and manage company documents',
    icon: FileText,
    aiPowered: false,
    gradient: 'from-yellow-500 to-amber-600',
    iconBg: 'bg-yellow-100 text-yellow-700',
  },
  {
    key: 'rbac',
    label: 'RBAC & Security',
    description: 'Role master, permissions, and audit logs',
    icon: Shield,
    aiPowered: false,
    gradient: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-100 text-red-700',
  },
  {
    key: 'talent',
    label: 'Talent Acquisition',
    description: 'AI-powered recruitment, interviews, and offers',
    icon: Brain,
    aiPowered: true,
    gradient: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-100 text-purple-700',
  },
  {
    key: 'attendance',
    label: 'Time & Attendance',
    description: 'Mark attendance, shifts, holidays, and exports',
    icon: Clock,
    aiPowered: false,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-100 text-cyan-700',
  },
  {
    key: 'payroll',
    label: 'Payroll & Expenses',
    description: 'Process payroll, manage expenses, and reports',
    icon: Banknote,
    aiPowered: false,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'AI reviews, goals, OKRs, and 360 feedback',
    icon: TrendingUp,
    aiPowered: true,
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 text-rose-700',
  },
  {
    key: 'learning',
    label: 'Learning & Development',
    description: 'Courses, enrollments, and certifications',
    icon: GraduationCap,
    aiPowered: true,
    gradient: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    key: 'tasks',
    label: 'Task Management',
    description: 'Create, assign, and track tasks across teams',
    icon: ListTodo,
    aiPowered: false,
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-100 text-pink-700',
  },
  {
    key: 'meetings',
    label: 'Meetings',
    description: 'Schedule and manage meetings and video calls',
    icon: Video,
    aiPowered: false,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 text-violet-700',
  },
  {
    key: 'projects',
    label: 'Project Kanban',
    description: 'Kanban boards, project tracking, and timelines',
    icon: FolderKanban,
    aiPowered: false,
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-100 text-indigo-700',
    stats: 'New',
  },
  {
    key: 'clients',
    label: 'Client Portal',
    description: 'Client management, tickets, and service requests',
    icon: Building2,
    aiPowered: false,
    gradient: 'from-sky-500 to-cyan-600',
    iconBg: 'bg-sky-100 text-sky-700',
    stats: 'New',
  },
  {
    key: 'subvendors',
    label: 'Sub Vendors',
    description: 'Vendor management and resume uploads',
    icon: UsersRound,
    aiPowered: false,
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-orange-100 text-orange-700',
    stats: 'New',
  },
  {
    key: 'jobportal',
    label: 'Job Portal',
    description: 'Candidate resumes, AI screening, interviews, and offers',
    icon: Briefcase,
    aiPowered: true,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 text-violet-700',
    stats: 'New',
  },
  {
    key: 'analytics',
    label: 'Analytics & Reporting',
    description: 'AI analytics, custom reports, and data export',
    icon: BarChart3,
    aiPowered: true,
    gradient: 'from-fuchsia-500 to-pink-600',
    iconBg: 'bg-fuchsia-100 text-fuchsia-700',
  },
  {
    key: 'selfservice',
    label: 'Self-Service',
    description: 'My profile, leaves, payslips, and requests',
    icon: MessageSquare,
    aiPowered: false,
    gradient: 'from-lime-500 to-green-600',
    iconBg: 'bg-lime-100 text-lime-700',
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

        {/* Module Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <Card
                key={mod.key}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 overflow-hidden"
                onClick={() => selectModule(mod.key)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`rounded-xl p-2.5 ${mod.iconBg}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {mod.stats && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0">
                          {mod.stats}
                        </Badge>
                      )}
                      {mod.aiPowered && (
                        <Badge
                          variant="secondary"
                          className="gap-0.5 text-[10px] bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-1.5 py-0"
                        >
                          <Sparkles className="size-2.5" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-emerald-700 transition-colors">
                    {mod.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {mod.description}
                  </p>
                  <div className="flex items-center text-emerald-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Module
                    <ArrowRight className="ml-1 size-3" />
                  </div>
                </CardContent>
                {/* Bottom gradient accent */}
                <div className={`h-1 w-full bg-gradient-to-r ${mod.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </Card>
            )
          })}
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
