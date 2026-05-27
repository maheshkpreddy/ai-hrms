'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  Loader2,
  Edit3,
  X,
  Calendar,
  Shield,
  Building2,
  AlertCircle,
  Check,
  Heart,
  Banknote,
  Hash,
  Link as LinkIcon,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi, apiPatch, apiPost } from '@/lib/useApi'
import { useHRMSStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  avatar?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  address?: string | null
  department?: string | null
  designation?: string | null
  jobTitle?: string | null
  contractType?: string | null
  reportingTo?: string | null
  joinDate?: string | null
  exitDate?: string | null
  status: string
  salary?: number | null
  bankAccount?: string | null
  panNumber?: string | null
  pfNumber?: string | null
  esiNumber?: string | null
  emergencyContact?: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    name: string
    avatar?: string | null
    roleId?: string | null
    isActive: boolean
    role?: {
      id: string
      name: string
      permissions?: string | null
    }
  }
  companyMembers?: Array<{
    id: string
    role: string
    status: string
    company: {
      id: string
      name: string
      code: string
      logo?: string | null
      industry?: string | null
    }
  }>
}

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  department: string
  designation: string
  jobTitle: string
  emergencyContact: string
  bankAccount: string
  panNumber: string
  pfNumber: string
  esiNumber: string
  avatar: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getInitials(firstName: string, lastName: string) {
  return [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const genderLabels: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-Binary',
  prefer_not_to_say: 'Prefer not to say',
}

const contractLabels: Record<string, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  contract: 'Contract',
  intern: 'Intern',
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  onboarding: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  exited: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

// ─── Info Row (View Mode) ──────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm', !value && 'text-muted-foreground/60')}>
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="relative h-48 rounded-xl bg-muted animate-pulse">
        <div className="absolute -bottom-12 left-6">
          <Skeleton className="h-24 w-24 rounded-full ring-4 ring-background" />
        </div>
      </div>
      <div className="mt-16 px-2 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" style={{ maxWidth: `${90 - j * 10}%` }} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ProfileManagement() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { activeSubItem } = useHRMSStore()

  // Internal tab state synced from sidebar sub-items
  const [activeTab, setActiveTab] = useState<string>('personal-info')

  // Refs for scrolling to sections
  const personalInfoRef = useRef<HTMLDivElement>(null)
  const employmentRef = useRef<HTMLDivElement>(null)
  const documentsRef = useRef<HTMLDivElement>(null)

  // Sync sidebar sub-item selection to internal active tab
  useEffect(() => {
    if (activeSubItem) {
      setActiveTab(activeSubItem)
    }
  }, [activeSubItem])

  // Scroll to the active section when tab changes
  useEffect(() => {
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      'personal-info': personalInfoRef,
      'employment': employmentRef,
      'documents-tab': documentsRef,
    }
    const ref = refMap[activeTab]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeTab])

  // Get employeeId from session
  const employeeId = (session?.user as any)?.employeeId || ''

  // Fetch profile data
  const {
    data: profileData,
    loading,
    error,
    refetch,
  } = useApi<ProfileData>({
    baseUrl: employeeId ? '/api/profile' : '',
    params: { employeeId },
    enabled: !!employeeId,
  })

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    department: '',
    designation: '',
    jobTitle: '',
    emergencyContact: '',
    bankAccount: '',
    panNumber: '',
    esiNumber: '',
    pfNumber: '',
    avatar: '',
  })

  // Avatar URL input
  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [avatarSaving, setAvatarSaving] = useState(false)
  const [showAvatarInput, setShowAvatarInput] = useState(false)

  // Sync form data when profile loads
  useEffect(() => {
    if (profileData) {
      setForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        department: profileData.department || '',
        designation: profileData.designation || '',
        jobTitle: profileData.jobTitle || '',
        emergencyContact: profileData.emergencyContact || '',
        bankAccount: profileData.bankAccount || '',
        panNumber: profileData.panNumber || '',
        esiNumber: profileData.esiNumber || '',
        pfNumber: profileData.pfNumber || '',
        avatar: profileData.avatar || '',
      })
      setAvatarUrlInput(profileData.avatar || '')
    }
  }, [profileData])

  // Form field updater
  const updateField = useCallback(
    (field: keyof FormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Save profile
  const handleSave = useCallback(async () => {
    if (!profileData?.id) return

    setSaving(true)
    try {
      await apiPatch('/api/profile', {
        id: profileData.id,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        address: form.address,
        department: form.department,
        designation: form.designation,
        jobTitle: form.jobTitle,
        emergencyContact: form.emergencyContact,
        bankAccount: form.bankAccount,
        panNumber: form.panNumber,
        pfNumber: form.pfNumber,
        esiNumber: form.esiNumber,
      })

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      })

      setIsEditing(false)
      refetch()
    } catch (err) {
      toast({
        title: 'Update Failed',
        description:
          err instanceof Error ? err.message : 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }, [profileData?.id, form, toast, refetch])

  // Cancel editing
  const handleCancel = useCallback(() => {
    if (profileData) {
      setForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        address: profileData.address || '',
        department: profileData.department || '',
        designation: profileData.designation || '',
        jobTitle: profileData.jobTitle || '',
        emergencyContact: profileData.emergencyContact || '',
        bankAccount: profileData.bankAccount || '',
        panNumber: profileData.panNumber || '',
        esiNumber: profileData.esiNumber || '',
        pfNumber: profileData.pfNumber || '',
        avatar: profileData.avatar || '',
      })
      setAvatarUrlInput(profileData.avatar || '')
    }
    setIsEditing(false)
    setShowAvatarInput(false)
  }, [profileData])

  // Upload avatar
  const handleAvatarUpload = useCallback(async () => {
    if (!employeeId || !avatarUrlInput.trim()) return

    setAvatarSaving(true)
    try {
      await apiPost('/api/profile', {
        employeeId,
        avatar: avatarUrlInput.trim(),
        avatarUrl: avatarUrlInput.trim(),
      })

      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated.',
      })

      setForm((prev) => ({ ...prev, avatar: avatarUrlInput.trim() }))
      setShowAvatarInput(false)
      refetch()
    } catch (err) {
      toast({
        title: 'Upload Failed',
        description:
          err instanceof Error ? err.message : 'Failed to update avatar',
        variant: 'destructive',
      })
    } finally {
      setAvatarSaving(false)
    }
  }, [employeeId, avatarUrlInput, toast, refetch])

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <ProfileSkeleton />
      </div>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
          <h2 className="text-lg font-semibold">Failed to Load Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4 gap-1.5" onClick={refetch}>
            <Loader2 className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">No Profile Found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Could not find profile data for your account.
          </p>
        </div>
      </div>
    )
  }

  // ─── Derived Data ───────────────────────────────────────────────────────────

  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim()
  const initials = getInitials(profileData.firstName, profileData.lastName)
  const currentAvatar = profileData.avatar || profileData.user?.avatar
  const roleName = profileData.user?.role?.name || 'Employee'
  const companyName =
    profileData.companyMembers?.[0]?.company?.name || ''

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl">
      {/* ════════════════════ Profile Header ════════════════════ */}
      <div className="relative mb-16">
        {/* Cover */}
        <div className="h-44 sm:h-52 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.1),transparent_50%)]" />
          {/* Decorative pattern */}
          <svg
            className="absolute inset-0 h-full w-full opacity-10"
            viewBox="0 0 400 200"
          >
            <circle cx="350" cy="50" r="120" fill="white" />
            <circle cx="50" cy="180" r="80" fill="white" />
          </svg>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4 sm:left-6">
          <div className="relative group">
            <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
              <AvatarImage
                src={isEditing ? form.avatar : currentAvatar || ''}
                alt={fullName}
              />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-3xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                onClick={() => setShowAvatarInput(!showAvatarInput)}
                className="absolute inset-0 flex h-28 w-28 items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Change profile picture"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6 flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 bg-white/90 hover:bg-white shadow-sm"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 bg-white/90 hover:bg-white shadow-sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Avatar URL input (shown in edit mode) */}
      {isEditing && showAvatarInput && (
        <Card className="mb-4 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">Update Profile Picture</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Enter the URL of your profile picture. Supports direct image links from cloud storage (Supabase, S3, etc.).
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 shrink-0"
                onClick={handleAvatarUpload}
                disabled={avatarSaving || !avatarUrlInput.trim()}
              >
                {avatarSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Name and role */}
      <div className="mb-6 px-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
          <Badge
            variant="secondary"
            className={cn(
              'w-fit text-xs',
              statusColors[profileData.status] || statusColors.active
            )}
          >
            {profileData.status}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {profileData.designation || profileData.jobTitle || roleName}
          </span>
          {companyName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {companyName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Hash className="h-3.5 w-3.5" />
            {profileData.employeeId}
          </span>
        </div>
      </div>

      {/* ════════════════════ Content Sections ════════════════════ */}
      {isEditing ? (
        /* ─── EDIT MODE ─── */
        <div className="space-y-4">
          {/* Personal Info Form */}
          <Card ref={personalInfoRef} className={cn(activeTab === 'personal-info' && 'ring-2 ring-emerald-500/50')}>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={User}
                title="Personal Information"
                description="Your personal details and demographics"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Last name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    className="bg-muted/50"
                    disabled
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Email cannot be changed here
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={form.gender || '_none'}
                    onValueChange={(v) =>
                      updateField('gender', v === '_none' ? '' : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Prefer not to say</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non_binary">Non-Binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Info Form */}
          <Card ref={employmentRef} className={cn(activeTab === 'employment' && 'ring-2 ring-emerald-500/50')}>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={Briefcase}
                title="Work Information"
                description="Your employment and role details"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    placeholder="Engineering, Marketing, etc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={form.designation}
                    onChange={(e) => updateField('designation', e.target.value)}
                    placeholder="Senior Engineer, Lead, etc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={form.jobTitle}
                    onChange={(e) => updateField('jobTitle', e.target.value)}
                    placeholder="Full Stack Developer, etc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Contract Type</Label>
                  <Input
                    value={
                      contractLabels[profileData.contractType || ''] ||
                      profileData.contractType ||
                      '—'
                    }
                    className="bg-muted/50"
                    disabled
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Contact HR to change contract type
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Form */}
          <Card>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={MapPin}
                title="Contact Information"
                description="Your address and emergency contact"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Street, City, State, Pincode"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={form.emergencyContact}
                    onChange={(e) =>
                      updateField('emergencyContact', e.target.value)
                    }
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Form (placeholder for documents-tab sub-item) */}
          <Card ref={documentsRef} className={cn(activeTab === 'documents-tab' && 'ring-2 ring-emerald-500/50')}>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={LinkIcon}
                title="Documents"
                description="Your uploaded documents and files"
              />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </CardContent>
          </Card>

          {/* Financial Info Form */}
          <Card>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={Banknote}
                title="Financial Information"
                description="Banking and tax-related details"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="bankAccount">Bank Account</Label>
                  <Input
                    id="bankAccount"
                    value={form.bankAccount}
                    onChange={(e) => updateField('bankAccount', e.target.value)}
                    placeholder="Bank account number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={form.panNumber}
                    onChange={(e) => updateField('panNumber', e.target.value)}
                    placeholder="ABCDE1234F"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pfNumber">PF Number</Label>
                  <Input
                    id="pfNumber"
                    value={form.pfNumber}
                    onChange={(e) => updateField('pfNumber', e.target.value)}
                    placeholder="Provident Fund number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="esiNumber">ESI Number</Label>
                  <Input
                    id="esiNumber"
                    value={form.esiNumber}
                    onChange={(e) => updateField('esiNumber', e.target.value)}
                    placeholder="Employee State Insurance number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save/Cancel Actions (bottom) */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-4">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        /* ─── VIEW MODE ─── */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Personal Info */}
          <Card ref={personalInfoRef} className={cn(activeTab === 'personal-info' && 'ring-2 ring-emerald-500/50')}>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={User}
                title="Personal Information"
                description="Your personal details and demographics"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow icon={User} label="First Name" value={profileData.firstName} />
                <InfoRow icon={User} label="Last Name" value={profileData.lastName} />
                <InfoRow icon={Mail} label="Email" value={profileData.email} />
                <InfoRow icon={Phone} label="Phone" value={profileData.phone} />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={formatDate(profileData.dateOfBirth)}
                />
                <InfoRow
                  icon={User}
                  label="Gender"
                  value={
                    profileData.gender
                      ? genderLabels[profileData.gender] || profileData.gender
                      : null
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Work Info */}
          <Card ref={employmentRef} className={cn(activeTab === 'employment' && 'ring-2 ring-emerald-500/50')}>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={Briefcase}
                title="Work Information"
                description="Your employment and role details"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={Briefcase}
                  label="Designation"
                  value={profileData.designation}
                />
                <InfoRow
                  icon={Building2}
                  label="Department"
                  value={profileData.department}
                />
                <InfoRow
                  icon={User}
                  label="Job Title"
                  value={profileData.jobTitle}
                />
                <InfoRow
                  icon={Shield}
                  label="Contract Type"
                  value={
                    profileData.contractType
                      ? contractLabels[profileData.contractType] ||
                        profileData.contractType
                      : null
                  }
                />
                <InfoRow
                  icon={Calendar}
                  label="Join Date"
                  value={formatDate(profileData.joinDate)}
                />
                <InfoRow
                  icon={Shield}
                  label="Role"
                  value={roleName}
                />
              </div>

              {companyName && (
                <>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm font-medium">{companyName}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={MapPin}
                title="Contact Information"
                description="Your address and emergency contact"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <InfoRow icon={MapPin} label="Address" value={profileData.address} />
                <Separator className="my-1" />
                <div className="flex items-start gap-2.5">
                  <Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Emergency Contact
                    </p>
                    <p
                      className={cn(
                        'text-sm',
                        !profileData.emergencyContact &&
                          'text-muted-foreground/60'
                      )}
                    >
                      {profileData.emergencyContact || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={Banknote}
                title="Financial Information"
                description="Banking and tax-related details"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={Banknote}
                  label="Bank Account"
                  value={
                    profileData.bankAccount
                      ? `••••${profileData.bankAccount.slice(-4)}`
                      : null
                  }
                />
                <InfoRow
                  icon={Hash}
                  label="PAN Number"
                  value={profileData.panNumber}
                />
                <InfoRow
                  icon={Hash}
                  label="PF Number"
                  value={profileData.pfNumber}
                />
                <InfoRow
                  icon={Hash}
                  label="ESI Number"
                  value={profileData.esiNumber}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents (placeholder for documents-tab sub-item) */}
          <Card ref={documentsRef} className={cn(activeTab === 'documents-tab' && 'ring-2 ring-emerald-500/50')}>
            <CardHeader className="pb-4">
              <SectionHeader
                icon={LinkIcon}
                title="Documents"
                description="Your uploaded documents and files"
              />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
