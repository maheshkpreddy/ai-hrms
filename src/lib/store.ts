import { create } from 'zustand'

export type ModuleKey =
  | 'dashboard'
  | 'employees'
  | 'rbac'
  | 'talent'
  | 'attendance'
  | 'payroll'
  | 'performance'
  | 'learning'
  | 'analytics'
  | 'selfservice'

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

const dashboardModuleMap: Record<string, ModuleKey> = {
  admin: 'dashboard',
  hr: 'employees',
  manager: 'dashboard',
  recruiter: 'talent',
  employee: 'selfservice',
  payroll: 'payroll',
  learning: 'learning',
}

export const defaultModule: ModuleKey = 'dashboard'

export function getDashboardModule(dashboard: string | null | undefined): ModuleKey {
  if (!dashboard) return defaultModule
  return dashboardModuleMap[dashboard] || defaultModule
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
