import { create } from 'zustand';
import type { UserRole, ModuleKey, CompanyInfo } from '@/lib/types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string | null;
  avatar: string | null;
  employeeId?: string;
  employeeName?: string;
  companyName?: string;
  companyCode?: string;
  companyCurrency?: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  user: AuthUser | null;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  userAvatar: string;
  
  // Company context
  currentCompany: CompanyInfo | null;
  companies: CompanyInfo[];
  
  // Navigation
  activeModule: ModuleKey;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme
  darkMode: boolean;
  
  // Notifications
  notificationCount: number;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole, name: string, email: string) => void;
  logout: () => void;
  setUserFromSession: (user: AuthUser) => void;
  setActiveModule: (module: ModuleKey) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentCompany: (company: CompanyInfo) => void;
  toggleDarkMode: () => void;
  setNotificationCount: (count: number) => void;
  setCompanies: (companies: CompanyInfo[]) => void;
  fetchCompanies: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  user: null,
  userRole: 'employee',
  userName: '',
  userEmail: '',
  userAvatar: '',
  
  currentCompany: null,
  companies: [],
  
  activeModule: 'dashboard',
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  darkMode: false,
  notificationCount: 0,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        set({ isLoading: false, authError: data.error || 'Login failed' });
        return;
      }
      
      const apiUser = data.user;
      const apiEmployee = apiUser.employee;
      const apiCompany = apiUser.company;

      const user: AuthUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role as UserRole,
        companyId: apiUser.companyId,
        avatar: apiUser.avatar,
        employeeId: apiEmployee?.employeeId,
        employeeName: apiEmployee ? `${apiEmployee.firstName} ${apiEmployee.lastName}` : apiUser.name,
        companyName: apiCompany?.name,
        companyCode: apiCompany?.code,
        companyCurrency: apiCompany?.currency,
      };
      
      const company = apiCompany ? {
        id: apiCompany.id,
        name: apiCompany.name,
        code: apiCompany.code || '',
        industry: apiCompany.industry || '',
        country: apiCompany.country || '',
        currency: apiCompany.currency || 'USD',
        employeeCount: 0,
        status: 'active',
      } : null;
      
      set({
        isAuthenticated: true,
        isLoading: false,
        authError: null,
        user,
        userRole: user.role,
        userName: user.employeeName || user.name,
        userEmail: user.email,
        currentCompany: company,
        activeModule: 'dashboard',
      });
    } catch {
      set({ isLoading: false, authError: 'Network error. Please try again.' });
    }
  },
  
  demoLogin: (role, name, email) => {
    const user: AuthUser = {
      id: 'demo',
      email,
      name,
      role,
      companyId: null,
      avatar: null,
    };
    set({
      isAuthenticated: true,
      isLoading: false,
      authError: null,
      user,
      userRole: role,
      userName: name,
      userEmail: email,
      activeModule: 'dashboard',
    });
  },
  
  logout: () => {
    // Sign out from NextAuth on the server side
    fetch('/api/auth/signout', { method: 'POST' }).catch(() => {});
    // Reset the HRMS navigation store as well
    try {
      const { useHRMSStore } = require('@/lib/store');
      useHRMSStore.getState().setActiveModule('dashboard');
      useHRMSStore.getState().setActiveSubItem(null);
      useHRMSStore.getState().setHomeView(true);
    } catch {}
    set({
      isAuthenticated: false,
      isLoading: false,
      authError: null,
      user: null,
      userRole: 'employee',
      userName: '',
      userEmail: '',
      activeModule: 'dashboard',
    });
  },

  setUserFromSession: (user: AuthUser) => {
    const company = user.companyId ? {
      id: user.companyId,
      name: user.companyName || 'Unknown',
      code: user.companyCode || '',
      industry: '',
      country: '',
      currency: user.companyCurrency || 'USD',
      employeeCount: 0,
      status: 'active',
    } : null;

    set({
      isAuthenticated: true,
      isLoading: false,
      authError: null,
      user,
      userRole: user.role,
      userName: user.employeeName || user.name,
      userEmail: user.email,
      currentCompany: company,
      activeModule: 'dashboard',
    });
  },
  
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentCompany: (company) => set({ currentCompany: company }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setNotificationCount: (count) => set({ notificationCount: count }),
  setCompanies: (companies) => set({ companies }),

  fetchCompanies: async () => {
    try {
      const res = await fetch('/api/companies?status=active&limit=100');
      if (!res.ok) return;
      const json = await res.json();
      const apiCompanies = (json.data || []) as Array<Record<string, unknown>>;
      const mapped: CompanyInfo[] = apiCompanies.map((c) => ({
        id: c.id as string,
        name: c.name as string,
        code: (c.code as string) || '',
        industry: (c.industry as string) || '',
        logo: c.logo as string | undefined,
        country: (c.country as string) || '',
        currency: (c.currency as string) || 'USD',
        employeeCount: (c._count as Record<string, number>)?.employees ?? 0,
        status: (c.status as string) || 'active',
      }));
      set({ companies: mapped });

      // If currentCompany is set but not found in loaded companies, update it
      const { currentCompany } = get();
      if (currentCompany) {
        const match = mapped.find(c => c.id === currentCompany.id);
        if (!match && mapped.length > 0) {
          set({ currentCompany: mapped[0] });
        } else if (match) {
          // Update with full data from API (includes employeeCount, etc.)
          set({ currentCompany: match });
        }
      } else if (!currentCompany && mapped.length > 0) {
        // No current company set yet — pick the first one
        set({ currentCompany: mapped[0] });
      }
    } catch {
      // Silently fail — dropdown will just be empty
    }
  },
}));
