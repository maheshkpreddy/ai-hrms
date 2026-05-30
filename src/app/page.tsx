'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/app-store';
import { useHRMSStore, getDashboardModule } from '@/lib/store';
import { LoginScreen } from '@/components/hrms/login-screen';
import { HRMSLayout } from '@/components/hrms/hrms-layout';

export default function Home() {
  const { isAuthenticated, setUserFromSession, fetchCompanies } = useAppStore();
  const { setActiveModule, setUserRole, setUserDashboard } = useHRMSStore();
  const { data: session, status } = useSession();

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    if (session?.user && !isAuthenticated) {
      const sessionUser = session.user as any;
      setUserFromSession({
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: sessionUser.name || '',
        role: sessionUser.role || 'employee',
        companyId: sessionUser.companyId || null,
        avatar: sessionUser.avatar || null,
        employeeId: sessionUser.employeeId || undefined,
        companyCode: sessionUser.companyCode || undefined,
        companyName: sessionUser.companyName || undefined,
      });

      // Sync user role and dashboard to HRMS navigation store
      const role = sessionUser.role || 'employee';
      const dashboard = sessionUser.dashboard || 'admin';
      setUserRole(role);
      setUserDashboard(dashboard);
      setActiveModule(getDashboardModule(dashboard));

      // Fetch real companies from the API
      fetchCompanies();
    }
  }, [session, isAuthenticated, setUserFromSession, setActiveModule, setUserRole, setUserDashboard, fetchCompanies]);

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <HRMSLayout /> : <LoginScreen />;
}
