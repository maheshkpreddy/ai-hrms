'use client'

import { useHRMSStore, type ModuleKey } from '@/lib/store'
import Sidebar from '@/components/hrms/Sidebar'
import Dashboard from '@/components/hrms/Dashboard'
import EmployeeManagement from '@/components/hrms/EmployeeManagement'
import RBACSecurity from '@/components/hrms/RBACSecurity'
import TalentAcquisition from '@/components/hrms/TalentAcquisition'
import TimeAttendance from '@/components/hrms/TimeAttendance'
import PayrollExpense from '@/components/hrms/PayrollExpense'
import Performance from '@/components/hrms/Performance'
import LearningDevelopment from '@/components/hrms/LearningDevelopment'
import Analytics from '@/components/hrms/Analytics'
import SelfService from '@/components/hrms/SelfService'

const moduleComponents: Record<ModuleKey, React.ComponentType> = {
  dashboard: Dashboard,
  employees: EmployeeManagement,
  rbac: RBACSecurity,
  talent: TalentAcquisition,
  attendance: TimeAttendance,
  payroll: PayrollExpense,
  performance: Performance,
  learning: LearningDevelopment,
  analytics: Analytics,
  selfservice: SelfService,
}

const moduleTitles: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  employees: 'Employee Management',
  rbac: 'RBAC & Security',
  talent: 'AI Talent Acquisition',
  attendance: 'Time & Attendance',
  payroll: 'Payroll & Expenses',
  performance: 'Performance & Talent',
  learning: 'Learning & Development',
  analytics: 'Analytics & Reporting',
  selfservice: 'Employee Self-Service',
}

export default function Home() {
  const { activeModule, sidebarOpen } = useHRMSStore()
  const ActiveComponent = moduleComponents[activeModule]

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
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-gray-500 sm:inline-block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">System Online</span>
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
