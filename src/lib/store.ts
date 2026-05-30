import { create } from 'zustand'

export type ModuleKey =
  | 'dashboard'
  | 'masters'
  | 'employees'
  | 'rbac'
  | 'talent'
  | 'recruitment'
  | 'ai-interview'
  | 'onboarding'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'timesheet'
  | 'performance'
  | 'training'
  | 'learning'
  | 'projects'
  | 'clients'
  | 'vendors'
  | 'subvendors'
  | 'jobportal'
  | 'helpdesk'
  | 'ai-chatbot'
  | 'workflows'
  | 'analytics'
  | 'selfservice'
  | 'assets'
  | 'documents'
  | 'tasks'
  | 'meetings'
  | 'exit'
  | 'settings'
  | 'audit'
  | 'profile'
  | 'knowledge-hub'

interface HRMSState {
  activeModule: ModuleKey
  sidebarOpen: boolean
  searchQuery: string
  homeView: boolean
  activeSubItem: string | null
  userRole: string | null
  userDashboard: string | null
  allowedModules: ModuleKey[] | null
  setActiveModule: (module: ModuleKey) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setHomeView: (home: boolean) => void
  setActiveSubItem: (item: string | null) => void
  setUserRole: (role: string | null) => void
  setUserDashboard: (dashboard: string | null) => void
  setAllowedModules: (modules: ModuleKey[] | null) => void
  goHome: () => void
  selectModule: (module: ModuleKey) => void
  selectModuleWithSubItem: (module: ModuleKey, subItem: string) => void
}

// Maps the Role's `dashboard` field to the default module shown when that role logs in
const dashboardModuleMap: Record<string, ModuleKey> = {
  admin: 'dashboard',
  hr: 'employees',
  manager: 'dashboard',
  recruiter: 'recruitment',
  employee: 'selfservice',
  payroll: 'payroll',
  learning: 'training',
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
  homeView: true,
  activeSubItem: null,
  userRole: null,
  userDashboard: null,
  allowedModules: null,
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setHomeView: (home) => set({ homeView: home }),
  setActiveSubItem: (item) => set({ activeSubItem: item }),
  setUserRole: (role) => set({ userRole: role }),
  setUserDashboard: (dashboard) => set({ userDashboard: dashboard }),
  setAllowedModules: (modules) => set({ allowedModules: modules }),
  goHome: () => set({ homeView: true, activeSubItem: null }),
  selectModule: (module) => set({ activeModule: module, homeView: false, activeSubItem: null }),
  selectModuleWithSubItem: (module, subItem) => set({ activeModule: module, homeView: false, activeSubItem: subItem }),
}))
