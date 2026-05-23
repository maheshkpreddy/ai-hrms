'use client'

import { useState, useCallback } from 'react'
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Globe,
  Clock,
  Save,
  Check,
  Loader2,
  Monitor,
  Moon,
  Sun,
  ChevronRight,
  Key,
  Smartphone,
  Mail,
  Download,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

// ─── Types ──────────────────────────────────────────────────────────────────────
interface GeneralSettings {
  companyName: string
  timezone: string
  dateFormat: string
  language: string
  fiscalYearStart: string
}

interface AppearanceSettings {
  theme: string
  sidebarDefaultOpen: boolean
  compactMode: boolean
  animationsEnabled: boolean
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  leaveApprovalAlerts: boolean
  attendanceReminders: boolean
  payrollProcessedAlerts: boolean
  performanceReviewReminders: boolean
  weeklyDigest: boolean
  systemUpdates: boolean
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: string
  passwordMinLength: number
  requireSpecialChars: boolean
}

interface PrivacySettings {
  dataRetentionPeriod: string
  allowAnalytics: boolean
  allowErrorReporting: boolean
  profileVisibility: string
}

// ─── Default Settings ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'ai-hRMS-settings'

function loadSettings<T>(key: string, defaults: T): T {
  if (typeof window === 'undefined') return defaults
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${key}`)
    return stored ? JSON.parse(stored) : defaults
  } catch {
    return defaults
  }
}

function saveSettings<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(value))
  } catch {
    console.error('Failed to save settings to localStorage')
  }
}

const defaultGeneral: GeneralSettings = {
  companyName: 'AI-HRMS Corp',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  fiscalYearStart: 'April',
}

const defaultAppearance: AppearanceSettings = {
  theme: 'system',
  sidebarDefaultOpen: true,
  compactMode: false,
  animationsEnabled: true,
}

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  leaveApprovalAlerts: true,
  attendanceReminders: true,
  payrollProcessedAlerts: true,
  performanceReviewReminders: true,
  weeklyDigest: false,
  systemUpdates: true,
}

const defaultSecurity: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: '30',
  passwordMinLength: 8,
  requireSpecialChars: true,
}

const defaultPrivacy: PrivacySettings = {
  dataRetentionPeriod: '365',
  allowAnalytics: true,
  allowErrorReporting: true,
  profileVisibility: 'internal',
}

// ─── Save Indicator ─────────────────────────────────────────────────────────────
function SaveIndicator({ saved }: { saved: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs transition-all duration-300 ${
        saved ? 'text-emerald-600 dark:text-emerald-400 opacity-100' : 'opacity-0'
      }`}
    >
      <Check className="h-3 w-3" />
      Saved
    </span>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function Settings() {
  const { setTheme, theme } = useTheme()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // General (lazy init from localStorage)
  const [general, setGeneral] = useState<GeneralSettings>(() => loadSettings('general', defaultGeneral))
  // Appearance
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => loadSettings('appearance', defaultAppearance))
  // Notifications
  const [notifications, setNotifications] = useState<NotificationSettings>(() => loadSettings('notifications', defaultNotifications))
  // Security
  const [security, setSecurity] = useState<SecuritySettings>(() => loadSettings('security', defaultSecurity))
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordChanging, setPasswordChanging] = useState(false)
  // Privacy
  const [privacy, setPrivacy] = useState<PrivacySettings>(() => loadSettings('privacy', defaultPrivacy))

  // Persist general settings
  const saveGeneral = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      saveSettings('general', general)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 400)
  }, [general])

  // Persist appearance settings
  const saveAppearance = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      saveSettings('appearance', appearance)
      setTheme(appearance.theme)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 400)
  }, [appearance, setTheme])

  // Persist notification settings
  const saveNotifications = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      saveSettings('notifications', notifications)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 400)
  }, [notifications])

  // Persist security settings
  const saveSecurity = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      saveSettings('security', security)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 400)
  }, [security])

  // Change password handler (connected to real API)
  const { data: session } = useSession()
  const { toast } = useToast()
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return
    if (newPassword !== confirmPassword) return
    if (newPassword.length < security.passwordMinLength) return

    setPasswordChanging(true)
    setPasswordError(null)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordChanging(false)
      setSaved(true)
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      })
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setPasswordChanging(false)
      const message = err instanceof Error ? err.message : 'Failed to change password'
      setPasswordError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    }
  }, [currentPassword, newPassword, confirmPassword, security.passwordMinLength, session?.user?.email, toast])

  // Persist privacy settings
  const savePrivacy = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      saveSettings('privacy', privacy)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 400)
  }, [privacy])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your application preferences and configurations</p>
          </div>
          <SaveIndicator saved={saved} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full flex-wrap sm:w-auto">
            <TabsTrigger value="general" className="gap-1.5">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1.5">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data &amp; Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════ GENERAL TAB ═══════════════════════ */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Company Information</CardTitle>
                <CardDescription>Basic organization details used across the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={general.companyName}
                    onChange={(e) => setGeneral((g) => ({ ...g, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={general.timezone} onValueChange={(v) => setGeneral((g) => ({ ...g, timezone: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST -5:00)</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST -8:00)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT +0:00)</SelectItem>
                        <SelectItem value="Europe/Berlin">Europe/Berlin (CET +1:00)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST +9:00)</SelectItem>
                        <SelectItem value="Asia/Singapore">Asia/Singapore (SGT +8:00)</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney (AEST +10:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={general.dateFormat} onValueChange={(v) => setGeneral((g) => ({ ...g, dateFormat: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={general.language} onValueChange={(v) => setGeneral((g) => ({ ...g, language: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                    <Select value={general.fiscalYearStart} onValueChange={(v) => setGeneral((g) => ({ ...g, fiscalYearStart: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fiscal year start" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={saveGeneral} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════ APPEARANCE TAB ═══════════════════════ */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Theme</CardTitle>
                <CardDescription>Customize how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selector */}
                <div className="space-y-3">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setAppearance((a) => ({ ...a, theme: 'light' }))}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        appearance.theme === 'light'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <Sun className="h-6 w-6 text-amber-500" />
                      <span className="text-xs font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => setAppearance((a) => ({ ...a, theme: 'dark' }))}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        appearance.theme === 'dark'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <Moon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      <span className="text-xs font-medium">Dark</span>
                    </button>
                    <button
                      onClick={() => setAppearance((a) => ({ ...a, theme: 'system' }))}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        appearance.theme === 'system'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-border hover:border-emerald-300'
                      }`}
                    >
                      <Monitor className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                      <span className="text-xs font-medium">System</span>
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Sidebar & Layout */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Layout</Label>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Sidebar Default Open</p>
                        <p className="text-xs text-muted-foreground">Keep the sidebar expanded by default</p>
                      </div>
                    </div>
                    <Switch
                      checked={appearance.sidebarDefaultOpen}
                      onCheckedChange={(v) => setAppearance((a) => ({ ...a, sidebarDefaultOpen: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Compact Mode</p>
                        <p className="text-xs text-muted-foreground">Reduce padding and spacing for denser layouts</p>
                      </div>
                    </div>
                    <Switch
                      checked={appearance.compactMode}
                      onCheckedChange={(v) => setAppearance((a) => ({ ...a, compactMode: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Animations</p>
                        <p className="text-xs text-muted-foreground">Enable smooth transitions and animations</p>
                      </div>
                    </div>
                    <Switch
                      checked={appearance.animationsEnabled}
                      onCheckedChange={(v) => setAppearance((a) => ({ ...a, animationsEnabled: v }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={saveAppearance} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════ NOTIFICATIONS TAB ═══════════════════════ */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Notification Channels</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(v) => setNotifications((n) => ({ ...n, emailNotifications: v }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(v) => setNotifications((n) => ({ ...n, pushNotifications: v }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
                <CardDescription>Fine-tune which notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: 'leaveApprovalAlerts' as const,
                    label: 'Leave Approval Alerts',
                    description: 'Get notified when a leave request needs your approval',
                  },
                  {
                    key: 'attendanceReminders' as const,
                    label: 'Attendance Reminders',
                    description: 'Daily reminders to mark attendance',
                  },
                  {
                    key: 'payrollProcessedAlerts' as const,
                    label: 'Payroll Processed',
                    description: 'Get notified when payroll has been processed',
                  },
                  {
                    key: 'performanceReviewReminders' as const,
                    label: 'Performance Review Reminders',
                    description: 'Reminders for upcoming performance reviews',
                  },
                  {
                    key: 'weeklyDigest' as const,
                    label: 'Weekly Digest',
                    description: 'Receive a weekly summary of HR activities',
                  },
                  {
                    key: 'systemUpdates' as const,
                    label: 'System Updates',
                    description: 'Get notified about system updates and maintenance',
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
                    />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={saveNotifications} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════ SECURITY TAB ═══════════════════════ */}
          <TabsContent value="security" className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
                )}
                {newPassword && newPassword.length < security.passwordMinLength && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Password must be at least {security.passwordMinLength} characters
                  </p>
                )}
                {passwordError && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {passwordError}
                  </p>
                )}
                <div className="flex justify-end">
                  <Button
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleChangePassword}
                    disabled={
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword ||
                      newPassword.length < security.passwordMinLength ||
                      passwordChanging
                    }
                  >
                    {passwordChanging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Enable Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Require a verification code in addition to your password
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(v) => setSecurity((s) => ({ ...s, twoFactorEnabled: v }))}
                  />
                </div>
                {security.twoFactorEnabled && (
                  <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Two-factor authentication is enabled
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session & Password Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Session &amp; Password Policy</CardTitle>
                <CardDescription>Configure session timeout and password requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(v) => setSecurity((s) => ({ ...s, sessionTimeout: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="min-password-length">Min Password Length</Label>
                    <Select
                      value={String(security.passwordMinLength)}
                      onValueChange={(v) => setSecurity((s) => ({ ...s, passwordMinLength: Number(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 characters</SelectItem>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                        <SelectItem value="16">16 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Require Special Characters</p>
                    <p className="text-xs text-muted-foreground">Passwords must contain at least one special character</p>
                  </div>
                  <Switch
                    checked={security.requireSpecialChars}
                    onCheckedChange={(v) => setSecurity((s) => ({ ...s, requireSpecialChars: v }))}
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={saveSecurity} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════ DATA & PRIVACY TAB ═══════════════════════ */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Data Management</CardTitle>
                <CardDescription>Manage your data export and retention settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select
                    value={privacy.dataRetentionPeriod}
                    onValueChange={(v) => setPrivacy((p) => ({ ...p, dataRetentionPeriod: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                      <SelectItem value="1825">5 years</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Data older than this period will be automatically archived or deleted based on policy
                  </p>
                </div>
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Export All Data</p>
                    <p className="text-xs text-muted-foreground">Download a copy of all your data in JSON format</p>
                  </div>
                  <Button variant="outline" className="gap-1.5">
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete All Data</p>
                    <p className="text-xs text-muted-foreground">Permanently delete all your data. This action cannot be undone.</p>
                  </div>
                  <Button variant="destructive" className="gap-1.5">
                    <Trash2 className="h-4 w-4" />
                    Delete Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Privacy Settings</CardTitle>
                <CardDescription>Control how your data is used within the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Usage Analytics</p>
                    <p className="text-xs text-muted-foreground">Allow anonymous usage data to help improve the application</p>
                  </div>
                  <Switch
                    checked={privacy.allowAnalytics}
                    onCheckedChange={(v) => setPrivacy((p) => ({ ...p, allowAnalytics: v }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Error Reporting</p>
                    <p className="text-xs text-muted-foreground">Automatically report errors to help fix issues faster</p>
                  </div>
                  <Switch
                    checked={privacy.allowErrorReporting}
                    onCheckedChange={(v) => setPrivacy((p) => ({ ...p, allowErrorReporting: v }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(v) => setPrivacy((p) => ({ ...p, profileVisibility: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public — Visible to everyone</SelectItem>
                      <SelectItem value="internal">Internal — Visible to colleagues only</SelectItem>
                      <SelectItem value="managers">Managers — Visible to managers only</SelectItem>
                      <SelectItem value="private">Private — Only you can see your profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={savePrivacy} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
