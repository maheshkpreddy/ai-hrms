'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  LayoutDashboard,
  Users,
  Laptop,
  FileText,
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
  Menu,
  LogOut,
  Settings,
  Sparkles,
  Building2,
  ListTodo,
  Video,
  FolderKanban,
  UserCircle,
  Ticket,
  Briefcase,
  Globe,
  Kanban,
  UserCheck,
} from 'lucide-react'
import { useHRMSStore, type ModuleKey } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
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

// ─── Module Configuration ────────────────────────────────────────────────────

interface NavItem {
  key: ModuleKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  aiPowered: boolean
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, aiPowered: false },
  { key: 'employees', label: 'Employees', icon: Users, aiPowered: false },
  { key: 'company', label: 'Company', icon: Building2, aiPowered: false },
  { key: 'tasks', label: 'Task Management', icon: ListTodo, aiPowered: false },
  { key: 'projects', label: 'Project Kanban', icon: FolderKanban, aiPowered: false },
  { key: 'meetings', label: 'Meetings', icon: Video, aiPowered: false },
  { key: 'clients', label: 'Client Portal', icon: Building2, aiPowered: false },
  { key: 'subvendors', label: 'Sub Vendors', icon: UserCheck, aiPowered: false },
  { key: 'jobportal', label: 'Job Portal', icon: Globe, aiPowered: true },
  { key: 'assets', label: 'Asset Management', icon: Laptop, aiPowered: false },
  { key: 'documents', label: 'Document Management', icon: FileText, aiPowered: false },
  { key: 'rbac', label: 'RBAC & Security', icon: Shield, aiPowered: false },
  { key: 'talent', label: 'Talent Acquisition', icon: Brain, aiPowered: true },
  { key: 'attendance', label: 'Time & Attendance', icon: Clock, aiPowered: false },
  { key: 'payroll', label: 'Payroll & Expenses', icon: Banknote, aiPowered: false },
  { key: 'performance', label: 'Performance', icon: TrendingUp, aiPowered: true },
  { key: 'learning', label: 'Learning & Development', icon: GraduationCap, aiPowered: true },
  { key: 'analytics', label: 'Analytics & Reporting', icon: BarChart3, aiPowered: true },
  { key: 'selfservice', label: 'Self-Service', icon: MessageSquare, aiPowered: false },
  { key: 'profile', label: 'My Profile', icon: UserCircle, aiPowered: false },
  { key: 'settings', label: 'Settings', icon: Settings, aiPowered: false },
]

// ─── Notification Count ──────────────────────────────────────────────────────

const NOTIFICATION_COUNT = 5

// ─── Navigation Item Component ───────────────────────────────────────────────

interface NavItemButtonProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onSelect: () => void
}

function NavItemButton({ item, isActive, collapsed, onSelect }: NavItemButtonProps) {
  const Icon = item.icon

  const button = (
    <button
      onClick={onSelect}
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
          <span className="truncate transition-opacity duration-200">{item.label}</span>

          {item.aiPowered && (
            <span
              className={cn(
                'ml-auto inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider',
                'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
                'transition-opacity duration-200'
              )}
            >
              <Sparkles className="size-2.5" />
              AI
            </span>
          )}
        </>
      )}

      {/* Tooltip content for collapsed state - rendered outside */}
    </button>
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
}

function SidebarContent({
  collapsed,
  onToggle,
  onNavSelect,
  activeModule,
  searchQuery,
  onSearchChange,
}: SidebarContentProps) {
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const userRole = (session?.user as any)?.role || 'Employee'
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            'flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 transition-all duration-300',
            collapsed ? 'size-9' : 'size-10'
          )}
        >
          <Sparkles className="size-5 text-white" />
        </div>

        {!collapsed && (
          <div className="flex flex-col overflow-hidden transition-all duration-300">
            <span className="text-lg font-bold tracking-tight text-white">
              eh2r AI
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
              An AI Product of MARQ AI
            </span>
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

      {/* ── Search ── */}
      {!collapsed && (
        <div className="shrink-0 px-3 pt-3 transition-all duration-300">
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
      <ScrollArea className="flex-1 px-2 py-2">
        <TooltipProvider>
          <nav className="flex flex-col gap-1">
            {filteredItems.map((item) => (
              <NavItemButton
                key={item.key}
                item={item}
                isActive={activeModule === item.key}
                collapsed={collapsed}
                onSelect={() => onNavSelect(item.key)}
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

      {/* Quick actions */}
      {!collapsed && (
        <div className="flex shrink-0 items-center gap-1 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
            onClick={() => onNavSelect('settings')}
          >
            <Settings className="size-4" />
            <span className="text-xs">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="size-4" />
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      )}

      {collapsed && (
        <div className="flex shrink-0 items-center justify-center gap-1 px-2 py-2">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  onClick={() => onNavSelect('settings')}
                >
                  <Settings className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="bg-slate-800 text-white border-slate-700">
                Settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-slate-400 hover:bg-white/[0.06] hover:text-white"
                >
                  <LogOut className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="bg-slate-800 text-white border-slate-700">
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

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
          <Avatar className="size-8 ring-2 ring-emerald-500/30">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-white">
                {userName}
              </span>
              <span className="truncate text-[11px] text-slate-400">
                {userRole}
              </span>
            </div>
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
      // Schedule state update after effect cleanup to avoid cascading renders
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
    setActiveModule,
    setSidebarOpen,
    setSearchQuery,
  } = useHRMSStore()

  const mounted = useHasMounted()
  const isMobile = useSyncExternalStore(
    subscribeToMediaQuery,
    getMobileSnapshot,
    getServerSnapshot
  )

  // Auto-close sidebar on mobile when selecting a module
  const handleNavSelect = useCallback(
    (key: ModuleKey) => {
      setActiveModule(key)
      if (isMobile) {
        setSidebarOpen(false)
      }
    },
    [isMobile, setActiveModule, setSidebarOpen]
  )

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="hidden md:flex h-screen w-64 shrink-0 flex-col bg-slate-900" />
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
          'relative hidden md:flex h-screen shrink-0 flex-col transition-all duration-300 ease-in-out',
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
