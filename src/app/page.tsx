'use client'

import { useSession, signOut } from 'next-auth/react'
import { useHRMSStore, type ModuleKey } from '@/lib/store'
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
import ProfileManagement from '@/components/hrms/ProfileManagement'
import Settings from '@/components/hrms/Settings'
import { LogOut, User, ChevronDown } from 'lucide-react'
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
  profile: ProfileManagement,
  settings: Settings,
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
  profile: 'My Profile',
  settings: 'Settings',
}

export default function Home() {
  const { data: session, status } = useSession()
  const { activeModule, sidebarOpen } = useHRMSStore()
  const ActiveComponent = moduleComponents[activeModule]
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
          <p className="text-gray-500 text-sm">Loading AI-HRMS...</p>
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
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
              {moduleTitles[activeModule]}
            </h1>
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
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{userRole}</span>
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
          <ActiveComponent />
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
