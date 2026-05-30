'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { useAppStore } from '@/store/app-store';
import { useHRMSStore } from '@/lib/store';
import { useTheme } from '@/components/ThemeProvider';
import { getNotifications, markNotificationRead } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/types';
import type { CompanyInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Menu, Search, Bell, Moon, Sun, LogOut, User, Settings, ChevronDown,
  Building2, MapPin, Users, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationData {
  id: string; title: string; message: string; type: string; category: string;
  isRead: boolean; createdAt: string; actionUrl: string | null;
}

export function Header() {
  const {
    userRole, userName, userEmail, currentCompany, companies, user,
    setCurrentCompany, fetchCompanies,
    logout, setNotificationCount,
  } = useAppStore();
  const { selectModule, sidebarOpen, setSidebarOpen } = useHRMSStore();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [switchingCompany, setSwitchingCompany] = useState(false);

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getNotifications(user.id)
      .then((res) => {
        if (cancelled) return;
        const data = res as { notifications: NotificationData[]; unreadCount: number };
        setNotifications(data.notifications || []);
        setNotificationCount(data.unreadCount || 0);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, setNotificationCount]);

  // Fetch companies from the API when authenticated
  useEffect(() => {
    if (!user?.id) return;
    fetchCompanies();
  }, [user?.id, fetchCompanies]);

  // Listen for company changes from MasterManagement
  useEffect(() => {
    const handleCompanyChange = () => {
      fetchCompanies();
    };
    window.addEventListener('companies-updated', handleCompanyChange);
    return () => window.removeEventListener('companies-updated', handleCompanyChange);
  }, [fetchCompanies]);

  const handleSwitchCompany = useCallback(async (company: CompanyInfo) => {
    if (company.id === currentCompany?.id) return;
    setSwitchingCompany(true);
    try {
      await setCurrentCompany(company);
      toast.success(`Switched to ${company.name}`, {
        description: `${company.city ? company.city + ', ' : ''}${company.country || ''}`,
      });
    } catch {
      toast.error('Failed to switch company');
    } finally {
      setSwitchingCompany(false);
    }
  }, [currentCompany, setCurrentCompany]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setNotificationCount(Math.max(0, (notifications.filter(n => !n.isRead).length) - 1));
    } catch {
      // silently fail
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 gap-3">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Company Switcher - Desktop */}
      <div className="shrink-0 hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[220px] h-9 justify-start gap-2 text-sm font-normal border-border hover:bg-accent/50"
              disabled={switchingCompany}
            >
              {currentCompany?.logo ? (
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={currentCompany.logo} alt={currentCompany.code} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[9px] font-bold">
                    {currentCompany?.code?.slice(0, 2) || 'TC'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-bold">{currentCompany?.code?.slice(0, 2) || 'TC'}</span>
                </div>
              )}
              <span className="truncate flex-1 text-left">{currentCompany?.name || 'Select Company'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px] p-2">
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
              Switch Company
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {companies.length > 0 ? companies.map((c: CompanyInfo) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => handleSwitchCompany(c)}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-md cursor-pointer ${
                  c.id === currentCompany?.id ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                }`}
              >
                {c.logo ? (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={c.logo} alt={c.code} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-bold">
                      {c.code?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{c.code?.slice(0, 2) || 'CO'}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm truncate">{c.name}</span>
                    {c.id === currentCompany?.id && (
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {c.code && <span className="font-mono">{c.code}</span>}
                    {c.employeeCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />{c.employeeCount}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${
                    c.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {c.status}
                </Badge>
              </DropdownMenuItem>
            )) : (
              <div className="px-2 py-4 text-center text-muted-foreground text-sm">
                No companies found
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => selectModule('masters')}
              className="text-emerald-600 dark:text-emerald-400 justify-center gap-1.5 text-xs font-medium"
            >
              <Building2 className="h-3.5 w-3.5" />
              Manage Companies in Masters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees, modules, actions..."
            className="pl-9 h-9 bg-background/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Right section */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Mobile company switcher */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 gap-1">
                {currentCompany?.logo ? (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={currentCompany.logo} alt={currentCompany.code} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[8px] font-bold">
                      {currentCompany?.code?.slice(0, 2) || 'TC'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">{currentCompany?.code?.slice(0,2) || 'TC'}</span>
                  </div>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[260px] p-2">
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">Switch Company</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {companies.map((c: CompanyInfo) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => handleSwitchCompany(c)}
                  className={`flex items-center gap-2 px-2 py-2 ${
                    c.id === currentCompany?.id ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  {c.logo ? (
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={c.logo} alt={c.code} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[9px] font-bold">
                        {c.code?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center shrink-0">
                      <span className="text-white text-[8px] font-bold">{c.code?.slice(0, 2) || 'CO'}</span>
                    </div>
                  )}
                  <span className="truncate flex-1">{c.name}</span>
                  {c.id === currentCompany?.id && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dark Mode Toggle */}
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length > 9 ? '9+' : notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="text-xs">{notifications.filter(n => !n.isRead).length} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? notifications.slice(0, 10).map(n => (
                <DropdownMenuItem
                  key={n.id}
                  className={`flex flex-col items-start gap-1 p-3 ${!n.isRead ? 'bg-accent/50' : ''}`}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.message || new Date(n.createdAt).toLocaleString()}</span>
                </DropdownMenuItem>
              )) : (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No notifications
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-emerald-600 font-medium justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-emerald-600 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium leading-tight">{userName}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{ROLE_LABELS[userRole]}</span>
              </div>
              <ChevronDown className="h-3 w-3 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => selectModule('profile')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => selectModule('settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => {
              logout();
              await signOut({ callbackUrl: '/login' });
            }} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
