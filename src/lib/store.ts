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
  | 'profile'
  | 'settings'

interface HRMSState {
  activeModule: ModuleKey
  sidebarOpen: boolean
  searchQuery: string
  setActiveModule: (module: ModuleKey) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useHRMSStore = create<HRMSState>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  searchQuery: '',
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
