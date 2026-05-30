'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useSession, signOut } from 'next-auth/react'
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
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,

  Sparkles,
  Home,
  FolderKanban,
  Building2,
  UserCheck,
  Briefcase,
  Globe,
  Laptop,
  FileText,
  ListTodo,
  Video,
  UserCircle,
  CalendarCheck,
  ClipboardList,
  Target,
  Award,
  BookOpen,
  BarChart2,
  Heart,
  Download,
  Upload,
  Ticket,
  FileUser,
  UsersRound,
  DollarSign,
  UserPlus,
  Activity,
  Receipt,
  HelpCircle,
  GitBranch,
  Settings,
  LogOut,
  Lock,
  Headphones,
  CalendarDays,
} from 'lucide-react'
import { useHRMSStore, type ModuleKey } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// ─── Sub-menu Configuration ──────────────────────────────────────────────────

interface SubMenuItem {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  moduleKey?: ModuleKey // When set, clicking this sub-item navigates to a different module
}

interface NavItem {
  key: ModuleKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  aiPowered: boolean
  color: string
  subItems: SubMenuItem[]
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    aiPowered: false,
    color: 'from-emerald-500 to-teal-600',
    subItems: [
      { key: 'overview', label: 'Overview', icon: BarChart2 },
      { key: 'quick-actions', label: 'Quick Actions', icon: Target },
      { key: 'recent-activity', label: 'Recent Activity', icon: Activity },
    ],
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: Users,
    aiPowered: false,
    color: 'from-blue-500 to-indigo-600',
    subItems: [
      { key: 'employee-list', label: 'Employee Directory', icon: Users },
      { key: 'add-employee', label: 'Add Employee', icon: UserPlus },
      { key: 'departments', label: 'Departments', icon: Building2 },
    ],
  },
  {
    key: 'company',
    label: 'Company',
    icon: Building2,
    aiPowered: false,
    color: 'from-slate-500 to-gray-600',
    subItems: [
      { key: 'company-info', label: 'Company Info', icon: Building2 },
      { key: 'policies', label: 'Policies', icon: FileText },
    ],
  },
  {
    key: 'masters',
    label: 'Masters',
    icon: ClipboardList,
    aiPowered: false,
    color: 'from-emerald-500 to-teal-600',
    subItems: [
      { key: 'company-masters', label: 'Company Masters', icon: Building2 },
      { key: 'branches', label: 'Branches', icon: Globe },
      { key: 'departments-master', label: 'Departments', icon: Building2 },
      { key: 'sub-departments', label: 'Sub-Departments', icon: Users },
      { key: 'designations', label: 'Designations', icon: Award },
      { key: 'roles-master', label: 'Roles', icon: Shield },
      { key: 'employee-types', label: 'Employee Types', icon: UserCheck },
      { key: 'grade-master', label: 'Grades/Bands', icon: Layers },
      { key: 'shift-master', label: 'Shifts', icon: Clock },
      { key: 'leave-type-master', label: 'Leave Types', icon: CalendarDays },
      { key: 'skill-master', label: 'Skills', icon: Wrench },
      { key: 'document-type-master', label: 'Document Types', icon: FileText },
    ],
  },
  {
    key: 'assets',
    label: 'Asset Management',
    icon: Laptop,
    aiPowered: false,
    color: 'from-orange-500 to-amber-600',
    subItems: [
      { key: 'asset-list', label: 'Asset Inventory', icon: Laptop },
      { key: 'assign-asset', label: 'Assign Assets', icon: ClipboardList },
      { key: 'asset-requests', label: 'Requests', icon: FileText },
    ],
  },
  {
    key: 'documents',
    label: 'Document Management',
    icon: FileText,
    aiPowered: false,
    color: 'from-yellow-500 to-amber-600',
    subItems: [
      { key: 'doc-list', label: 'All Documents', icon: FileText },
      { key: 'upload-doc', label: 'Upload Document', icon: Upload },
      { key: 'templates', label: 'Templates', icon: FileText },
    ],
  },
  {
    key: 'tasks',
    label: 'Task Management',
    icon: ListTodo,
    aiPowered: false,
    color: 'from-pink-500 to-rose-600',
    subItems: [
      { key: 'my-tasks', label: 'My Tasks', icon: ListTodo },
      { key: 'team-tasks', label: 'Team Tasks', icon: Users },
      { key: 'task-reports', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    key: 'meetings',
    label: 'Meetings',
    icon: Video,
    aiPowered: false,
    color: 'from-violet-500 to-purple-600',
    subItems: [
      { key: 'upcoming', label: 'Upcoming Meetings', icon: Video },
      { key: 'schedule', label: 'Schedule Meeting', icon: CalendarCheck },
      { key: 'past-meetings', label: 'Past Meetings', icon: Clock },
    ],
  },
  {
    key: 'rbac',
    label: 'RBAC & Security',
    icon: Shield,
    aiPowered: false,
    color: 'from-red-500 to-rose-600',
    subItems: [
      { key: 'roles', label: 'Role Master', icon: Shield },
      { key: 'permissions', label: 'Permissions', icon: Award },
      { key: 'audit-logs', label: 'Audit Logs', icon: FileText },
    ],
  },
  {
    key: 'talent',
    label: 'Talent Acquisition',
    icon: Brain,
    aiPowered: true,
    color: 'from-purple-500 to-violet-600',
    subItems: [
      { key: 'job-postings', label: 'Job Postings', icon: Briefcase },
      { key: 'candidate-pool', label: 'Candidate Pool', icon: Users },
      { key: 'offers', label: 'Offer Letters', icon: FileText },
      { key: 'onboarding', label: 'AI Onboarding', icon: Sparkles },
    ],
  },
  {
    key: 'ai-interview',
    label: 'AI Interview',
    icon: Sparkles,
    aiPowered: true,
    color: 'from-emerald-500 to-teal-600',
    subItems: [
      { key: 'job-setup', label: 'Job Setup', icon: Briefcase },
      { key: 'interview-session', label: 'Interview Session', icon: Video },
      { key: 'evaluations', label: 'AI Evaluation', icon: BarChart3 },
    ],
  },
  {
    key: 'attendance',
    label: 'Time & Attendance',
    icon: Clock,
    aiPowered: false,
    color: 'from-cyan-500 to-blue-600',
    subItems: [
      { key: 'mark-attendance', label: 'Mark Attendance', icon: Clock },
      { key: 'shifts', label: 'Shifts', icon: CalendarCheck },
      { key: 'holidays', label: 'Holidays', icon: Heart },
      { key: 'export', label: 'Export Reports', icon: Download },
    ],
  },
  {
    key: 'leave',
    label: 'Leave Management',
    icon: CalendarDays,
    aiPowered: false,
    color: 'from-green-500 to-emerald-600',
    subItems: [
      { key: 'leave-requests', label: 'Leave Requests', icon: CalendarDays },
      { key: 'leave-balance', label: 'Leave Balance', icon: BarChart2 },
      { key: 'leave-calendar', label: 'Leave Calendar', icon: CalendarCheck },
    ],
  },
  {
    key: 'payroll',
    label: 'Payroll & Expenses',
    icon: Banknote,
    aiPowered: false,
    color: 'from-amber-500 to-orange-600',
    subItems: [
      { key: 'process-payroll', label: 'Process Payroll', icon: DollarSign },
      { key: 'expenses', label: 'Expenses', icon: Receipt },
      { key: 'reports', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    key: 'timesheet',
    label: 'Timesheet',
    icon: Clock,
    aiPowered: false,
    color: 'from-blue-500 to-cyan-600',
    subItems: [
      { key: 'my-timesheet', label: 'My Timesheet', icon: Clock },
      { key: 'team-timesheet', label: 'Team Timesheet', icon: Users },
      { key: 'timesheet-reports', label: 'Reports', icon: BarChart2 },
    ],
  },
  {
    key: 'performance',
    label: 'Performance',
    icon: TrendingUp,
    aiPowered: true,
    color: 'from-rose-500 to-pink-600',
    subItems: [
      { key: 'reviews', label: 'Performance Reviews', icon: TrendingUp },
      { key: 'goals', label: 'Goals & OKRs', icon: Target },
      { key: 'feedback', label: '360 Feedback', icon: MessageSquare },
    ],
  },
  {
    key: 'learning',
    label: 'Learning & Development',
    icon: GraduationCap,
    aiPowered: true,
    color: 'from-teal-500 to-emerald-600',
    subItems: [
      { key: 'courses', label: 'Courses', icon: BookOpen },
      { key: 'enrollments', label: 'My Learning', icon: UserCheck },
      { key: 'videos', label: 'Training Videos', icon: Video, moduleKey: 'knowledge-hub' as ModuleKey },
      { key: 'certifications', label: 'Certifications', icon: Award },
    ],
  },
  {
    key: 'exit',
    label: 'Exit Workflow',
    icon: LogOut,
    aiPowered: false,
    color: 'from-red-500 to-rose-600',
    subItems: [
      { key: 'resignations', label: 'Resignations', icon: FileText },
      { key: 'exit-clearance', label: 'Exit Clearance', icon: ClipboardList },
      { key: 'fnf-settlement', label: 'FNF Settlement', icon: DollarSign },
    ],
  },
  {
    key: 'projects',
    label: 'Project Management',
    icon: FolderKanban,
    aiPowered: false,
    color: 'from-indigo-500 to-blue-600',
    subItems: [
      { key: 'kanban-board', label: 'Kanban Board', icon: FolderKanban },
      { key: 'project-list', label: 'Projects', icon: ClipboardList },
      { key: 'timelines', label: 'Timelines', icon: CalendarCheck },
      { key: 'task-board', label: 'Task Board', icon: ListTodo, moduleKey: 'tasks' as ModuleKey },
      { key: 'my-tasks', label: 'My Tasks', icon: ListTodo, moduleKey: 'tasks' as ModuleKey },
      { key: 'team-tasks', label: 'Team Tasks', icon: Users, moduleKey: 'tasks' as ModuleKey },
    ],
  },
  {
    key: 'clients',
    label: 'Client Portal',
    icon: Building2,
    aiPowered: false,
    color: 'from-sky-500 to-cyan-600',
    subItems: [
      { key: 'client-list', label: 'Clients', icon: Building2 },
      { key: 'tickets', label: 'Tickets', icon: Ticket },
      { key: 'service-requests', label: 'Service Requests', icon: FileText },
    ],
  },
  {
    key: 'subvendors',
    label: 'Sub Vendors',
    icon: UsersRound,
    aiPowered: false,
    color: 'from-orange-500 to-amber-600',
    subItems: [
      { key: 'subvendor-list', label: 'Vendors', icon: UsersRound },
      { key: 'resume-uploads', label: 'Resume Uploads', icon: Upload },
      { key: 'vendor-assignments', label: 'Assignments', icon: ClipboardList },
    ],
  },
  {
    key: 'vendors',
    label: 'Vendor Portal',
    icon: Users,
    aiPowered: false,
    color: 'from-amber-500 to-orange-600',
    subItems: [
      { key: 'vendor-list', label: 'Vendors', icon: Users },
      { key: 'vendor-candidates', label: 'Vendor Candidates', icon: UserPlus },
      { key: 'vendor-invoices', label: 'Invoices', icon: Receipt },
    ],
  },
  {
    key: 'jobportal',
    label: 'Job Portal',
    icon: Briefcase,
    aiPowered: true,
    color: 'from-violet-500 to-purple-600',
    subItems: [
      { key: 'candidate-resumes', label: 'Resumes', icon: FileUser },
      { key: 'search-candidates', label: 'Search', icon: Search },
      { key: 'shortlisted', label: 'Shortlisted', icon: UserCheck },
      { key: 'interview-process', label: 'Interviews', icon: CalendarCheck },
      { key: 'offer-generation', label: 'Offer Letters', icon: FileText },
      { key: 'background-check', label: 'Background Check', icon: Shield },
    ],
  },
  {
    key: 'helpdesk',
    label: 'Helpdesk',
    icon: Headphones,
    aiPowered: false,
    color: 'from-sky-500 to-blue-600',
    subItems: [
      { key: 'hr-helpdesk', label: 'HR Helpdesk', icon: MessageSquare },
      { key: 'it-helpdesk', label: 'IT Helpdesk', icon: Laptop },
      { key: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, moduleKey: 'knowledge-hub' as ModuleKey },
    ],
  },
  {
    key: 'ai-chatbot',
    label: 'AI Chatbot',
    icon: Sparkles,
    aiPowered: true,
    color: 'from-emerald-500 to-teal-600',
    subItems: [
      { key: 'chat', label: 'Chat', icon: MessageSquare },
      { key: 'conversation-history', label: 'History', icon: Clock },
    ],
  },
  {
    key: 'workflows',
    label: 'Workflow Engine',
    icon: GitBranch,
    aiPowered: false,
    color: 'from-violet-500 to-purple-600',
    subItems: [
      { key: 'workflow-builder', label: 'Workflow Builder', icon: GitBranch },
      { key: 'active-workflows', label: 'Active Workflows', icon: Activity },
      { key: 'workflow-templates', label: 'Templates', icon: FileText },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    aiPowered: false,
    color: 'from-slate-500 to-gray-600',
    subItems: [
      { key: 'general-settings', label: 'General', icon: Settings },
      { key: 'notification-settings', label: 'Notifications', icon: Bell },
      { key: 'integration-settings', label: 'Integrations', icon: Globe },
    ],
  },
  {
    key: 'audit',
    label: 'Audit & Compliance',
    icon: Shield,
    aiPowered: false,
    color: 'from-red-500 to-rose-600',
    subItems: [
      { key: 'audit-logs-view', label: 'Audit Logs', icon: FileText },
      { key: 'compliance', label: 'Compliance', icon: Shield },
      { key: 'data-security', label: 'Data Security', icon: Lock },
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics & Reporting',
    icon: BarChart3,
    aiPowered: true,
    color: 'from-fuchsia-500 to-pink-600',
    subItems: [
      { key: 'hr-analytics', label: 'HR Analytics', icon: BarChart3 },
      { key: 'custom-reports', label: 'Custom Reports', icon: FileText },
      { key: 'export-data', label: 'Export Data', icon: Download },
    ],
  },
  {
    key: 'selfservice',
    label: 'Self-Service',
    icon: MessageSquare,
    aiPowered: false,
    color: 'from-lime-500 to-green-600',
    subItems: [
      { key: 'my-profile', label: 'My Profile', icon: UserCircle },
      { key: 'my-leaves', label: 'My Leaves', icon: CalendarCheck },
      { key: 'my-payslips', label: 'My Payslips', icon: Banknote },
      { key: 'raise-request', label: 'Raise Request', icon: MessageSquare },
    ],
  },
  {
    key: 'profile',
    label: 'My Profile',
    icon: UserCircle,
    aiPowered: false,
    color: 'from-teal-500 to-cyan-600',
    subItems: [
      { key: 'personal-info', label: 'Personal Info', icon: UserCircle },
      { key: 'employment', label: 'Employment', icon: Briefcase },
      { key: 'documents-tab', label: 'Documents', icon: FileText },
    ],
  },
  {
    key: 'knowledge-hub',
    label: 'Help & Training',
    icon: HelpCircle,
    aiPowered: false,
    color: 'from-emerald-500 to-teal-600',
    subItems: [
      { key: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
      { key: 'training-videos', label: 'Training Videos', icon: Video },
      { key: 'faq', label: 'FAQ', icon: HelpCircle },
    ],
  },

]

// ─── Notification Count ──────────────────────────────────────────────────────

const NOTIFICATION_COUNT = 5

// ─── Navigation Item Component ───────────────────────────────────────────────

interface NavItemButtonProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  expanded: boolean
  onSelect: () => void
  onToggleExpand: () => void
  activeSubItem: string | null
  onSubItemSelect: (moduleKey: ModuleKey, subKey: string) => void
}

function NavItemButton({
  item,
  isActive,
  collapsed,
  expanded,
  onSelect,
  onToggleExpand,
  activeSubItem,
  onSubItemSelect,
}: NavItemButtonProps) {
  const Icon = item.icon

  const button = (
    <div>
      <button
        onClick={() => {
          onSelect()
          if (!collapsed) onToggleExpand()
        }}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
          isActive
            ? 'bg-emerald-500/[0.18] text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
            : 'text-slate-300 hover:text-white',
          collapsed && 'justify-center px-0'
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400 transition-all duration-200" />
        )}

        <Icon
          className={cn(
            'size-5 shrink-0 transition-colors duration-200',
            isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
          )}
        />

        {!collapsed && (
          <>
            <span className="truncate transition-opacity duration-200 flex-1 text-left">{item.label}</span>

            <div className="flex items-center gap-1 ml-auto">
              {item.aiPowered && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider',
                    'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
                    'transition-opacity duration-200'
                  )}
                >
                  <Sparkles className="size-2.5" />
                  AI
                </span>
              )}
              {item.subItems.length > 0 && (
                <ChevronDown
                  className={cn(
                    'size-3.5 text-slate-500 transition-transform duration-200',
                    expanded && 'rotate-180'
                  )}
                />
              )}
            </div>
          </>
        )}
      </button>

      {/* Sub-menu items */}
      {!collapsed && expanded && item.subItems.length > 0 && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700/50 pl-3 max-h-60 overflow-y-auto sidebar-scroll">
          {item.subItems.map((subItem) => {
            const SubIcon = subItem.icon
            const isSubActive = activeSubItem === subItem.key
            return (
              <button
                key={subItem.key}
                onClick={(e) => {
                  e.stopPropagation()
                  onSubItemSelect(item.key, subItem.key)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                  'hover:bg-white/[0.06]',
                  isSubActive
                    ? 'text-emerald-400 bg-emerald-500/[0.1]'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <SubIcon className="size-3.5 shrink-0" />
                <span className="truncate">{subItem.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="bg-slate-800 text-white border-slate-700">
          <span className="flex items-center gap-1.5">
            {item.label}
            {item.aiPowered && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-400 ring-1 ring-emerald-500/30">
                <Sparkles className="size-2" />
                AI
              </span>
            )}
          </span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

// ─── Sidebar Content (shared between desktop & mobile) ───────────────────────

interface SidebarContentProps {
  collapsed: boolean
  onToggle: () => void
  onNavSelect: (key: ModuleKey) => void
  activeModule: ModuleKey
  searchQuery: string
  onSearchChange: (query: string) => void
  expandedModule: ModuleKey | null
  onToggleExpand: (key: ModuleKey) => void
  activeSubItem: string | null
  onSubItemSelect: (moduleKey: ModuleKey, subKey: string) => void
}

function SidebarContent({
  collapsed,
  onToggle,
  onNavSelect,
  activeModule,
  searchQuery,
  onSearchChange,
  expandedModule,
  onToggleExpand,
  activeSubItem,
  onSubItemSelect,
}: SidebarContentProps) {
  const { data: session } = useSession()
  const { goHome, homeView } = useHRMSStore()

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const userName = session?.user?.name || 'User'
  const userRole = (session?.user as any)?.role || 'Employee'
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* ── Header / Branding ── */}
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-slate-700/50 transition-all duration-300',
          collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-4 py-4'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg overflow-hidden transition-all duration-300',
            collapsed ? 'size-9' : 'size-10'
          )}
        >
          <img
            src="/eh2r-logo.png"
            alt="eh2r AI"
            className="size-full object-contain rounded-lg"
          />
        </div>

        {!collapsed && (
          <div className="flex flex-col overflow-hidden transition-all duration-300">
            <span className="text-lg font-bold tracking-tight text-white">
              eh2r AI
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <img
                src="/marq-logo.png"
                alt="MARQ AI"
                className="h-3 w-3 rounded-sm object-contain"
              />
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-emerald-400/80">
                An AI Product of MARQ AI
              </span>
            </div>
          </div>
        )}

        {/* Notification Bell */}
        {!collapsed && (
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative size-8 text-slate-400 hover:bg-white/[0.08] hover:text-white"
            >
              <Bell className="size-4" />
              {NOTIFICATION_COUNT > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-slate-900">
                  {NOTIFICATION_COUNT > 9 ? '9+' : NOTIFICATION_COUNT}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        )}
      </div>

      {/* ── Home Button ── */}
      <div className={cn('shrink-0 px-2 pt-2', collapsed && 'px-1')}>
        {collapsed ? (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={goHome}
                  className={cn(
                    'flex w-full items-center justify-center rounded-lg py-2 transition-all duration-200',
                    homeView
                      ? 'bg-emerald-500/[0.18] text-emerald-400'
                      : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  )}
                >
                  <Home className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="bg-slate-800 text-white border-slate-700">
                Home
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <button
            onClick={goHome}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              homeView
                ? 'bg-emerald-500/[0.18] text-emerald-400'
                : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
            )}
          >
            <Home className="size-5 shrink-0" />
            <span>Home</span>
          </button>
        )}
      </div>

      {/* ── Search ── */}
      {!collapsed && (
        <div className="shrink-0 px-3 pt-2 transition-all duration-300">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 border-slate-700/50 bg-slate-800/60 pl-8 text-xs text-slate-300 placeholder:text-slate-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden px-2 py-2 sidebar-scroll">
        <TooltipProvider>
          <nav className="flex flex-col gap-0.5">
            {filteredItems.map((item) => (
              <NavItemButton
                key={item.key}
                item={item}
                isActive={activeModule === item.key}
                collapsed={collapsed}
                expanded={expandedModule === item.key}
                onSelect={() => onNavSelect(item.key)}
                onToggleExpand={() => onToggleExpand(item.key)}
                activeSubItem={activeSubItem}
                onSubItemSelect={onSubItemSelect}
              />
            ))}
          </nav>
        </TooltipProvider>

        {filteredItems.length === 0 && !collapsed && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="mb-2 size-8 text-slate-600" />
            <p className="text-xs text-slate-500">No modules found</p>
            <p className="text-[10px] text-slate-600">Try a different search</p>
          </div>
        )}
      </ScrollArea>

      {/* ── Bottom Section ── */}
      <Separator className="bg-slate-700/50" />

      {/* User profile */}
      <div
        className={cn(
          'shrink-0 transition-all duration-300',
          collapsed ? 'px-2 py-3' : 'px-3 py-3'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-white/[0.06]',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={async () => {
                      await signOut({ callbackUrl: '/login' });
                    }}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  >
                    <LogOut className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12} className="bg-slate-800 text-white border-slate-700">
                  Sign Out
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <Avatar className="size-8 ring-2 ring-emerald-500/30">
                <AvatarImage src={(session?.user as any)?.avatar || ''} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-white">
                  {userName}
                </span>
                <span className="truncate text-[11px] text-slate-400">
                  {userRole}
                </span>
              </div>

              <button
                onClick={async () => {
                  await signOut({ callbackUrl: '/login' });
                }}
                className="ml-auto flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                title="Sign Out"
              >
                <LogOut className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Collapse Toggle ── */}
      {!collapsed && (
        <div className="shrink-0 border-t border-slate-700/50 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center gap-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronLeft className="size-4" />
            <span className="text-xs">Collapse</span>
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Responsive Hook (SSR-safe) ──────────────────────────────────────────────

const MOBILE_QUERY = '(max-width: 767px)'

function subscribeToMediaQuery(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches
}

function getServerSnapshot() {
  return false
}

// ─── Hydration-safe mount hook ────────────────────────────────────────────────

function useHasMounted() {
  const [mounted, setMounted] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      const id = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(id)
    }
  }, [])

  return mounted
}

// ─── Main Sidebar Component ──────────────────────────────────────────────────

export default function Sidebar() {
  const {
    activeModule,
    sidebarOpen,
    searchQuery,
    activeSubItem,
    setSidebarOpen,
    setSearchQuery,
    selectModule,
    selectModuleWithSubItem,
  } = useHRMSStore()

  const [expandedModule, setExpandedModule] = useState<ModuleKey | null>(null)

  const mounted = useHasMounted()
  const isMobile = useSyncExternalStore(
    subscribeToMediaQuery,
    getMobileSnapshot,
    getServerSnapshot
  )

  // Auto-close sidebar on mobile when selecting a module
  const handleNavSelect = useCallback(
    (key: ModuleKey) => {
      selectModule(key)
      if (isMobile) {
        setSidebarOpen(false)
      }
    },
    [isMobile, selectModule, setSidebarOpen]
  )

  const handleToggleExpand = useCallback(
    (key: ModuleKey) => {
      setExpandedModule((prev) => (prev === key ? null : key))
    },
    []
  )

  // When a sub-item is clicked, we need to navigate to its parent module AND set the sub-item
  // in a single atomic update to avoid selectModule clearing activeSubItem
  // If the sub-item has a moduleKey, navigate to that module instead
  const handleSubItemSelect = useCallback(
    (moduleKey: ModuleKey, subKey: string) => {
      // Find the sub-item to check if it has a custom moduleKey
      const navItem = navItems.find((item) => item.key === moduleKey)
      const subItem = navItem?.subItems.find((sub) => sub.key === subKey)
      const targetModule = subItem?.moduleKey || moduleKey
      selectModuleWithSubItem(targetModule, subKey)
      // Auto-expand the parent module in sidebar
      setExpandedModule(moduleKey)
      if (isMobile) {
        setSidebarOpen(false)
      }
    },
    [selectModuleWithSubItem, isMobile, setSidebarOpen]
  )

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed left-0 top-0 hidden md:flex h-screen w-64 shrink-0 flex-col bg-slate-900 z-40" />
    )
  }

  // ── Mobile: Sheet / Drawer ──
  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-slate-700/50">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent
            collapsed={false}
            onToggle={() => setSidebarOpen(false)}
            onNavSelect={handleNavSelect}
            activeModule={activeModule}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expandedModule={expandedModule}
            onToggleExpand={handleToggleExpand}
            activeSubItem={activeSubItem}
            onSubItemSelect={handleSubItemSelect}
          />
        </SheetContent>
      </Sheet>
    )
  }

  // ── Desktop: Fixed Sidebar ──
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 hidden md:flex h-screen shrink-0 flex-col transition-all duration-300 ease-in-out z-40',
          'border-r border-slate-700/50'
        )}
        style={{ width: sidebarOpen ? '16rem' : '4.5rem' }}
      >
        <SidebarContent
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavSelect={handleNavSelect}
          activeModule={activeModule}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          expandedModule={expandedModule}
          onToggleExpand={handleToggleExpand}
          activeSubItem={activeSubItem}
          onSubItemSelect={handleSubItemSelect}
        />

        {/* Expand button when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute -right-3 top-20 z-10 flex size-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-md transition-all duration-200 hover:bg-slate-700 hover:text-white"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </aside>

      {/* Mobile hamburger trigger (visible only on mobile) */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden bg-slate-900 text-white hover:bg-slate-800"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>
    </TooltipProvider>
  )
}
