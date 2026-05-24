'use client'

import { useSession, signOut } from 'next-auth/react'
import { useHRMSStore, type ModuleKey, getDashboardModule, getDashboardRoute } from '@/lib/store'
import Sidebar from '@/components/hrms/Sidebar'
import Dashboard from '@/components/hrms/Dashboard'
import EmployeeManagement from '@/components/hrms/EmployeeManagement'
import AssetManagement from '@/components/hrms/AssetManagement'
import DocumentManagement from '@/components/hrms/DocumentManagement'
import RBACSecurity from '@/components/hrms/RBACSecurity'
import TalentAcquisition from '@/components/hrms/TalentAcquisition'
import TimeAttendance from '@/components/hrms/TimeAttendance'
import PayrollExpense from '@/components/hrms/PayrollExpense'
import Performance from '@/components/hrms/Performance'
import LearningDevelopment from '@/components/hrms/LearningDevelopment'
import Analytics from '@/components/hrms/Analytics'
import SelfService from '@/components/hrms/SelfService'
import CompanyManagement from '@/components/hrms/CompanyManagement'
import TaskManagement from '@/components/hrms/TaskManagement'
import MeetingManagement from '@/components/hrms/MeetingManagement'
import ProjectKanban from '@/components/hrms/ProjectKanban'
import ClientPortal from '@/components/hrms/ClientPortal'
import SubVendorManagement from '@/components/hrms/SubVendorManagement'
import JobPortalComponent from '@/components/hrms/JobPortal'
import ProfileManagement from '@/components/hrms/ProfileManagement'
import ModuleHome from '@/components/hrms/ModuleHome'
import { LogOut, ChevronDown, HomeIcon } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const moduleComponents: Record<ModuleKey, React.ComponentType> = {
  dashboard: Dashboard,
  employees: EmployeeManagement,
  assets: AssetManagement,
  documents: DocumentManagement,
  rbac: RBACSecurity,
  talent: TalentAcquisition,
  attendance: TimeAttendance,
  payroll: PayrollExpense,
  performance: Performance,
  learning: LearningDevelopment,
  analytics: Analytics,
  selfservice: SelfService,
  company: CompanyManagement,
  tasks: TaskManagement,
  meetings: MeetingManagement,
  projects: ProjectKanban,
  clients: ClientPortal,
  subvendors: SubVendorManagement,
  jobportal: JobPortalComponent,
  profile: ProfileManagement,
}

const moduleTitles: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  employees: 'Employee Management',
  assets: 'Asset Management',
  documents: 'Document Management',
  rbac: 'RBAC & Security',
  talent: 'AI Talent Acquisition',
  attendance: 'Time & Attendance',
  payroll: 'Payroll & Expenses',
  performance: 'Performance & Talent',
  learning: 'Learning & Development',
  analytics: 'Analytics & Reporting',
  selfservice: 'Employee Self-Service',
  company: 'Company Management',
  tasks: 'Task Management',
  meetings: 'Meeting Management',
  projects: 'Project Kanban',
  clients: 'Client Portal',
  subvendors: 'Sub-Vendor Management',
  jobportal: 'Job Portal',
  profile: 'My Profile',
}

// Dashboard type to display name mapping for the header badge
const dashboardLabels: Record<string, string> = {
  admin: 'Admin Dashboard',
  hr: 'HR Dashboard',
  payroll: 'Payroll Dashboard',
  manager: 'Manager Dashboard',
  employee: 'Employee Dashboard',
  recruiter: 'Recruiter Dashboard',
  learning: 'Learning Dashboard',
}

export default function Home() {
  const { data: session, status } = useSession()
  const { activeModule, homeView, goHome, setUserRole, setUserDashboard, setAllowedModules } = useHRMSStore()
  const ActiveComponent = moduleComponents[activeModule]
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Set role-based data from session
  useEffect(() => {
    if (session?.user && !initializedRef.current) {
      const userRole = (session.user as any)?.role || 'Employee'
      const dashboard = (session.user as any)?.dashboard || 'employee'
      const menuItemsStr = (session.user as any)?.menuItems || null

      setUserRole(userRole)
      setUserDashboard(dashboard)

      // Parse allowed modules from role's menuItems
      if (menuItemsStr) {
        try {
          const parsed = JSON.parse(menuItemsStr)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllowedModules(parsed as ModuleKey[])
          }
        } catch {
          setAllowedModules(null)
        }
      } else {
        setAllowedModules(null) // null = all modules visible
      }

      initializedRef.current = true
    }
  }, [session, setUserRole, setUserDashboard, setAllowedModules])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show loading while session is being checked
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading eh2r AI...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated' || !session) {
    if (typeof window !== 'undefined') {
      window.location.replace('/login')
    }
    return null
  }

  const userRole = (session.user as any)?.role || 'Employee'
  const userName = session.user?.name || 'User'
  const userEmail = session.user?.email || ''
  const userAvatar = (session.user as any)?.avatar
  const companyName = (session.user as any)?.companyName || ''
  const roleColor = (session.user as any)?.roleColor || 'teal'
  const userDashboard = (session.user as any)?.dashboard || 'employee'

  const roleColorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    teal: 'bg-teal-100 text-teal-700',
    orange: 'bg-orange-100 text-orange-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    cyan: 'bg-cyan-100 text-cyan-700',
  }

  const badgeClass = roleColorMap[roleColor] || roleColorMap.teal

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile hamburger trigger */}
      <MobileMenuButton />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {homeView ? (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  eh2r AI
                </h1>
                <span className="hidden sm:inline-block text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  An AI Product of MARQ AI
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={goHome}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Back to Home"
                >
                  <HomeIcon className="size-4" />
                </button>
                <span className="text-gray-300">/</span>
                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {moduleTitles[activeModule]}
                </h1>
              </div>
            )}
            {companyName && !homeView && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {companyName}
              </span>
            )}
            {!homeView && (
              <span className="hidden md:inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {dashboardLabels[userDashboard] || 'Dashboard'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-500 sm:inline-block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Online</span>
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-7 h-7 rounded-full" />
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700">
                      {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-gray-900 leading-tight">{userName}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{userRole}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>{userRole}</span>
                      {companyName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{companyName}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Module Content */}
        <div className="p-4 sm:p-6">
          {homeView ? <ModuleHome /> : <ActiveComponent />}
        </div>
      </main>
    </div>
  )
}

function MobileMenuButton() {
  const { setSidebarOpen } = useHRMSStore()

  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg hover:bg-slate-800 md:hidden"
      aria-label="Open navigation menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
    </button>
  )
}
