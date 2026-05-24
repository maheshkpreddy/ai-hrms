import { create } from 'zustand'

export type ModuleKey =
  | 'dashboard'
  | 'employees'
  | 'assets'
  | 'documents'
  | 'rbac'
  | 'talent'
  | 'attendance'
  | 'payroll'
  | 'performance'
  | 'learning'
  | 'analytics'
  | 'selfservice'
  | 'company'
  | 'tasks'
  | 'meetings'
  | 'projects'
  | 'clients'
  | 'subvendors'
  | 'jobportal'
  | 'profile'
  | 'settings'

interface HRMSState {
  activeModule: ModuleKey
  sidebarOpen: boolean
  searchQuery: string
  userRole: string | null
  userDashboard: string | null
  allowedModules: ModuleKey[] | null
  setActiveModule: (module: ModuleKey) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setUserRole: (role: string | null) => void
  setUserDashboard: (dashboard: string | null) => void
  setAllowedModules: (modules: ModuleKey[] | null) => void
}

// Maps the Role's `dashboard` field to the default module shown when that role logs in
const dashboardModuleMap: Record<string, ModuleKey> = {
  admin: 'dashboard',
  hr: 'employees',
  manager: 'dashboard',
  recruiter: 'talent',
  employee: 'selfservice',
  payroll: 'payroll',
  learning: 'learning',
}

// Maps the Role's `dashboard` field to a Next.js route path
export const dashboardRouteMap: Record<string, string> = {
  admin: '/dashboard/admin',
  hr: '/dashboard/hr',
  payroll: '/dashboard/payroll',
  manager: '/dashboard/manager',
  employee: '/dashboard',
  recruiter: '/dashboard/recruiter',
  learning: '/dashboard/learning',
}

export const defaultModule: ModuleKey = 'dashboard'

export function getDashboardModule(dashboard: string | null | undefined): ModuleKey {
  if (!dashboard) return defaultModule
  return dashboardModuleMap[dashboard] || defaultModule
}

export function getDashboardRoute(dashboard: string | null | undefined): string {
  if (!dashboard) return '/dashboard'
  return dashboardRouteMap[dashboard] || '/dashboard'
}

export const useHRMSStore = create<HRMSState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  searchQuery: '',
  userRole: null,
  userDashboard: null,
  allowedModules: null,
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setUserRole: (role) => set({ userRole: role }),
  setUserDashboard: (dashboard) => set({ userDashboard: dashboard }),
  setAllowedModules: (modules) => set({ allowedModules: modules }),
}))
