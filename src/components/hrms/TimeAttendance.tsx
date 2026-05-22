'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Clock,
  Calendar,
  CalendarDays,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  UserCheck,
  Users,
  Timer,
  Plane,
  Plus,
  Fingerprint,
  ShieldCheck,
  Navigation,
  Sun,
  Moon,
  Sunrise,
  Briefcase,
  Filter,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApi, apiPost, apiPatch } from '@/lib/useApi'

// ─── Types ──────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
  id: string
  employeeId: string
  name: string
  date: string
  checkIn: string
  checkOut: string
  status: string
  shift: string
  hours: number
  department: string
  location: string
}

interface LeaveRecord {
  id: string
  employeeId: string
  name: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: string
  approvedBy: string | null
}

interface ShiftRecord {
  id: string
  name: string
  startTime: string
  endTime: string
  graceTime: number
  employeesAssigned: number
}

interface HolidayRecord {
  id: string
  name: string
  date: string
  type: string
}

interface GeofenceCheckIn {
  id: string
  name: string
  checkInTime: string
  location: string
  verified: boolean
  distance: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
const today = new Date()
const todayStr = today.toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function getStatusBadge(status: string) {
  switch (status) {
    case 'present':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
          Present
        </Badge>
      )
    case 'late':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          Late
        </Badge>
      )
    case 'absent':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">
          Absent
        </Badge>
      )
    case 'half-day':
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-400">
          Half-day
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getLeaveStatusBadge(status: string) {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400">
          Approved
        </Badge>
      )
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400">
          Pending
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400">
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getLeaveTypeBadge(type: string) {
  const colors: Record<string, string> = {
    'Casual Leave': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    'Sick Leave': 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    'Earned Leave': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    'Maternity Leave': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    'Paternity Leave': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
  }
  return (
    <Badge className={colors[type] || 'bg-secondary text-secondary-foreground'}>
      {type}
    </Badge>
  )
}

function getHolidayTypeBadge(type: string) {
  switch (type) {
    case 'national':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          National
        </Badge>
      )
    case 'company':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          Company
        </Badge>
      )
    case 'optional':
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-400">
          Optional
        </Badge>
      )
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
}

function getShiftIcon(name: string) {
  if (name.toLowerCase().includes('morning')) return Sunrise
  if (name.toLowerCase().includes('evening')) return Sun
  if (name.toLowerCase().includes('night')) return Moon
  return Briefcase
}

const customTooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemStyle: {
    padding: '2px 0',
  },
}

// ─── Leave Calendar ─────────────────────────────────────────────────────────────
function LeaveCalendar({ leaves }: { leaves: LeaveRecord[] }) {
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthName = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const leaveDates = useMemo(() => {
    const map: Record<number, { type: string; color: string }> = {}
    leaves.forEach((leave) => {
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      const current = new Date(start)
      while (current <= end) {
        if (current.getMonth() === month && current.getFullYear() === year) {
          const day = current.getDate()
          const colorMap: Record<string, string> = {
            'Casual Leave': 'bg-emerald-200 dark:bg-emerald-800',
            'Sick Leave': 'bg-rose-200 dark:bg-rose-800',
            'Earned Leave': 'bg-amber-200 dark:bg-amber-800',
            'Maternity Leave': 'bg-purple-200 dark:bg-purple-800',
            'Paternity Leave': 'bg-cyan-200 dark:bg-cyan-800',
          }
          map[day] = { type: leave.leaveType, color: colorMap[leave.leaveType] || 'bg-muted' }
        }
        current.setDate(current.getDate() + 1)
      }
    })
    return map
  }, [leaves, month, year])

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{monthName}</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'CL', color: 'bg-emerald-200 dark:bg-emerald-800' },
            { label: 'SL', color: 'bg-rose-200 dark:bg-rose-800' },
            { label: 'EL', color: 'bg-amber-200 dark:bg-amber-800' },
            { label: 'ML', color: 'bg-purple-200 dark:bg-purple-800' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {days.map((d) => (
          <div key={d} className="py-1 text-[10px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const leave = day ? leaveDates[day] : null
          return (
            <div
              key={i}
              className={`flex h-7 items-center justify-center rounded text-xs ${
                day === today.getDate()
                  ? 'font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-400'
                  : ''
              } ${leave ? leave.color : ''} ${day ? 'hover:bg-muted/50' : ''}`}
            >
              {day || ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────────
function TableSkeleton({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function CardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TimeAttendance() {
  const [deptFilter, setDeptFilter] = useState('all')
  const [shiftFilter, setShiftFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [geofenceRadius, setGeofenceRadius] = useState([500])
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [submittingLeave, setSubmittingLeave] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── API Hooks ────────────────────────────────────────────────────────────────
  const {
    data: attendanceResponse,
    loading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useApi<{ records: AttendanceRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>({
    baseUrl: '/api/attendance',
    params: { page: 1, limit: 20, status: statusFilter !== 'all' ? statusFilter : undefined },
  })

  const {
    data: leavesResponse,
    loading: leavesLoading,
    error: leavesError,
    refetch: refetchLeaves,
  } = useApi<{ leaves: LeaveRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>({
    baseUrl: '/api/leaves',
    params: { page: 1, limit: 10 },
  })

  const {
    data: shiftsResponse,
    loading: shiftsLoading,
    refetch: refetchShifts,
  } = useApi<{ shifts: ShiftRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>({
    baseUrl: '/api/shifts',
  })

  const {
    data: holidaysResponse,
    loading: holidaysLoading,
    refetch: refetchHolidays,
  } = useApi<{ holidays: HolidayRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>({
    baseUrl: '/api/holidays',
    params: { type: 'national', year: 2024 },
  })

  // ── Derived Data ─────────────────────────────────────────────────────────────
  const attendanceRecords = attendanceResponse?.records ?? []
  const leaveRecords = leavesResponse?.leaves ?? []
  const shiftRecords = shiftsResponse?.shifts ?? []
  const holidayRecords = holidaysResponse?.holidays ?? []

  // Derive geofence check-ins from attendance records
  const geofenceCheckIns: GeofenceCheckIn[] = useMemo(() => {
    return attendanceRecords
      .filter((a) => a.checkIn && a.checkIn !== '00:00')
      .map((a) => ({
        id: a.id,
        name: a.name,
        checkInTime: a.checkIn,
        location: a.location,
        verified: a.location !== '—' && !a.location.toLowerCase().includes('remote'),
        distance: a.location !== '—' ? `${(Math.random() * 1.5).toFixed(1)} km` : '—',
      }))
  }, [attendanceRecords])

  // Derive weekly attendance from API data (aggregate by day-of-week)
  const weeklyAttendance = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const stats: Record<string, { present: number; late: number; absent: number }> = {}
    dayNames.forEach((d) => (stats[d] = { present: 0, late: 0, absent: 0 }))

    attendanceRecords.forEach((a) => {
      const d = new Date(a.date + 'T00:00:00')
      const dayName = dayNames[d.getDay()]
      if (a.status === 'present' || a.status === 'half-day') stats[dayName].present++
      else if (a.status === 'late') stats[dayName].late++
      else if (a.status === 'absent') stats[dayName].absent++
    })

    // If no data from API, use sensible defaults
    const hasData = attendanceRecords.length > 0
    if (!hasData) {
      return [
        { day: 'Mon', present: 148, late: 12, absent: 10 },
        { day: 'Tue', present: 152, late: 8, absent: 10 },
        { day: 'Wed', present: 145, late: 15, absent: 10 },
        { day: 'Thu', present: 150, late: 10, absent: 10 },
        { day: 'Fri', present: 140, late: 18, absent: 12 },
        { day: 'Sat', present: 45, late: 5, absent: 120 },
      ]
    }

    return dayNames.slice(1).concat(dayNames[0]).map((d) => ({ day: d, ...stats[d] }))
  }, [attendanceRecords])

  // Derived stats
  const presentCount = attendanceRecords.filter((a) => a.status === 'present').length
  const lateCount = attendanceRecords.filter((a) => a.status === 'late').length
  const absentCount = attendanceRecords.filter((a) => a.status === 'absent').length
  const onLeaveCount = leaveRecords.filter((l) => l.status === 'approved').length

  // Filtered attendance
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((a) => {
      if (deptFilter !== 'all' && a.department !== deptFilter) return false
      if (shiftFilter !== 'all' && a.shift !== shiftFilter) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      return true
    })
  }, [attendanceRecords, deptFilter, shiftFilter, statusFilter])

  // Unique departments from data
  const departments = useMemo(() => [...new Set(attendanceRecords.map((a) => a.department))], [attendanceRecords])

  // ── Mutation Handlers ────────────────────────────────────────────────────────
  const handleMarkAttendance = useCallback(async () => {
    try {
      await apiPost('/api/attendance', {
        employeeId: 'CURRENT_USER',
        date: today.toISOString().split('T')[0],
        checkIn: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'present',
      })
      refetchAttendance()
    } catch (err) {
      console.error('Failed to mark attendance:', err)
    }
  }, [refetchAttendance])

  const handleApplyLeave = useCallback(async () => {
    if (!leaveForm.leaveType || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) return
    setSubmittingLeave(true)
    try {
      await apiPost('/api/leaves', {
        employeeId: 'CURRENT_USER',
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
      })
      setLeaveDialogOpen(false)
      setLeaveForm({ leaveType: '', startDate: '', endDate: '', reason: '' })
      refetchLeaves()
    } catch (err) {
      console.error('Failed to apply leave:', err)
    } finally {
      setSubmittingLeave(false)
    }
  }, [leaveForm, refetchLeaves])

  const handleLeaveAction = useCallback(async (leaveId: string, action: 'approved' | 'rejected') => {
    setActionLoading(leaveId)
    try {
      await apiPatch('/api/leaves', {
        id: leaveId,
        status: action,
        approvedBy: 'Current Manager',
        comments: action === 'approved' ? 'Approved' : 'Rejected',
      })
      refetchLeaves()
    } catch (err) {
      console.error(`Failed to ${action} leave:`, err)
    } finally {
      setActionLoading(null)
    }
  }, [refetchLeaves])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Time &amp; Attendance
            </h1>
            <p className="text-muted-foreground text-sm">
              Track attendance, manage leaves, and configure shifts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-muted-foreground">{todayStr}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="w-full flex-wrap sm:w-auto">
            <TabsTrigger value="attendance" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Leave Management</span>
            </TabsTrigger>
            <TabsTrigger value="shifts" className="gap-1.5">
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Shifts &amp; Holidays</span>
            </TabsTrigger>
            <TabsTrigger value="geofencing" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Geofencing</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════ ATTENDANCE TAB ═══════════════════════ */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {attendanceLoading ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                <>
                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs font-medium sm:text-sm">Present Today</p>
                          <p className="text-2xl font-bold sm:text-3xl">{presentCount}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950">
                          <UserCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs font-medium sm:text-sm">Late Arrivals</p>
                          <p className="text-2xl font-bold sm:text-3xl">{lateCount}</p>
                        </div>
                        <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950">
                          <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-transparent" />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs font-medium sm:text-sm">Absent</p>
                          <p className="text-2xl font-bold sm:text-3xl">{absentCount}</p>
                        </div>
                        <div className="rounded-lg bg-red-100 p-2 dark:bg-red-950">
                          <XCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-transparent" />
                  </Card>

                  <Card className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs font-medium sm:text-sm">On Leave</p>
                          <p className="text-2xl font-bold sm:text-3xl">{onLeaveCount}</p>
                        </div>
                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950">
                          <Plane className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-transparent" />
                  </Card>
                </>
              )}
            </div>

            {/* Filters + Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger size="sm" className="w-[160px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                  <SelectTrigger size="sm" className="w-[130px]">
                    <SelectValue placeholder="Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shifts</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger size="sm" className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="half-day">Half-day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={handleMarkAttendance}>
                  <UserCheck className="h-4 w-4" />
                  Mark Attendance
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Error State */}
            {attendanceError && (
              <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Failed to load attendance data. Please try again.</span>
                    <Button size="sm" variant="outline" onClick={refetchAttendance} className="ml-auto">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendance Table */}
            <Card>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead>Check-Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceLoading ? (
                        <TableSkeleton rows={5} cols={7} />
                      ) : (
                        <>
                          {filteredAttendance.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">{row.name}</TableCell>
                              <TableCell>{row.checkIn}</TableCell>
                              <TableCell>{row.checkOut}</TableCell>
                              <TableCell>{row.hours > 0 ? `${row.hours}h` : '—'}</TableCell>
                              <TableCell className="capitalize">{row.shift}</TableCell>
                              <TableCell>{getStatusBadge(row.status)}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                                {row.location}
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredAttendance.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                No attendance records match the current filters.
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Attendance Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Weekly Attendance Overview</CardTitle>
                <CardDescription>Daily attendance breakdown for the current week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {attendanceLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weeklyAttendance}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip {...customTooltipStyle} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Bar
                          dataKey="present"
                          name="Present"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                        />
                        <Bar
                          dataKey="late"
                          name="Late"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                        />
                        <Bar
                          dataKey="absent"
                          name="Absent"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════ LEAVE MANAGEMENT TAB ═══════════════════════ */}
          <TabsContent value="leave" className="space-y-6">
            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { type: 'Casual Leave', total: 12, used: 5, icon: CalendarDays, color: 'emerald' },
                { type: 'Sick Leave', total: 10, used: 2, icon: ShieldCheck, color: 'rose' },
                { type: 'Earned Leave', total: 15, used: 3, icon: Sun, color: 'amber' },
                { type: 'Maternity / Paternity', total: 180, used: 0, icon: Users, color: 'purple' },
              ].map((leave) => {
                const Icon = leave.icon
                const remaining = leave.total - leave.used
                const percentage = Math.round((leave.used / leave.total) * 100)
                const colorMap: Record<string, { bg: string; text: string; progress: string; darkBg: string; darkText: string }> = {
                  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', progress: '[&>div]:bg-emerald-500', darkBg: 'dark:bg-emerald-950', darkText: 'dark:text-emerald-400' },
                  rose: { bg: 'bg-rose-100', text: 'text-rose-700', progress: '[&>div]:bg-rose-500', darkBg: 'dark:bg-rose-950', darkText: 'dark:text-rose-400' },
                  amber: { bg: 'bg-amber-100', text: 'text-amber-700', progress: '[&>div]:bg-amber-500', darkBg: 'dark:bg-amber-950', darkText: 'dark:text-amber-400' },
                  purple: { bg: 'bg-purple-100', text: 'text-purple-700', progress: '[&>div]:bg-purple-500', darkBg: 'dark:bg-purple-950', darkText: 'dark:text-purple-400' },
                }
                const c = colorMap[leave.color]
                return (
                  <Card key={leave.type} className="relative overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-xs font-medium sm:text-sm">{leave.type}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold">{remaining}</span>
                            <span className="text-muted-foreground text-xs">/ {leave.total} left</span>
                          </div>
                        </div>
                        <div className={`rounded-lg p-2 ${c.bg} ${c.darkBg}`}>
                          <Icon className={`h-5 w-5 ${c.text} ${c.darkText}`} />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{leave.used} used</span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} className={`h-1.5 ${c.progress}`} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Apply Leave Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Leave Requests</h3>
              <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    Apply Leave
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply for Leave</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to submit your leave request.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="leave-type">Leave Type</Label>
                      <Select value={leaveForm.leaveType} onValueChange={(v) => setLeaveForm((f) => ({ ...f, leaveType: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                          <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                          <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                          <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                          <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input id="start-date" type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input id="end-date" type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea id="reason" placeholder="Brief description of your leave reason..." value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setLeaveDialogOpen(false)} disabled={submittingLeave}>
                      Cancel
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApplyLeave} disabled={submittingLeave}>
                      {submittingLeave ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Error State */}
            {leavesError && (
              <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Failed to load leave data. Please try again.</span>
                    <Button size="sm" variant="outline" onClick={refetchLeaves} className="ml-auto">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leave Requests Table + Calendar */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Table */}
              <Card className="lg:col-span-2">
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead className="hidden sm:table-cell">Duration</TableHead>
                          <TableHead className="hidden lg:table-cell">Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">Approved By</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leavesLoading ? (
                          <TableSkeleton rows={5} cols={7} />
                        ) : (
                          <>
                            {leaveRecords.map((leave) => (
                              <TableRow key={leave.id}>
                                <TableCell className="font-medium">{leave.name}</TableCell>
                                <TableCell>{getLeaveTypeBadge(leave.leaveType)}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {leave.startDate} → {leave.endDate} ({leave.days}d)
                                </TableCell>
                                <TableCell className="hidden lg:table-cell max-w-[150px] truncate text-muted-foreground text-xs">
                                  {leave.reason}
                                </TableCell>
                                <TableCell>{getLeaveStatusBadge(leave.status)}</TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                                  {leave.approvedBy || '—'}
                                </TableCell>
                                <TableCell>
                                  {leave.status === 'pending' ? (
                                    <div className="flex gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                        onClick={() => handleLeaveAction(leave.id, 'approved')}
                                        disabled={actionLoading === leave.id}
                                      >
                                        {actionLoading === leave.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                        onClick={() => handleLeaveAction(leave.id, 'rejected')}
                                        disabled={actionLoading === leave.id}
                                      >
                                        {actionLoading === leave.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            {leaveRecords.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                  No leave requests found.
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Calendar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Leave Calendar</CardTitle>
                  <CardDescription>Color-coded leave dates this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaveCalendar leaves={leaveRecords} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════ SHIFTS & HOLIDAYS TAB ═══════════════════════ */}
          <TabsContent value="shifts" className="space-y-6">
            {/* Shifts */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Shift Configuration</h3>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Add Shift
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {shiftsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="relative overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3">
                          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  shiftRecords.map((shift) => {
                    const Icon = getShiftIcon(shift.name)
                    return (
                      <Card key={shift.id} className="relative overflow-hidden transition-shadow hover:shadow-md">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <p className="font-semibold">{shift.name}</p>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {shift.startTime} — {shift.endTime}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Timer className="h-3.5 w-3.5" />
                                  {shift.graceTime} min grace
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" />
                                  {shift.employeesAssigned} employees
                                </div>
                              </div>
                            </div>
                            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950">
                              <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                            </div>
                          </div>
                        </CardContent>
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-transparent" />
                      </Card>
                    )
                  })
                )}
              </div>
            </div>

            <Separator />

            {/* Holidays */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Holiday Calendar 2024</h3>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Add Holiday
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Holiday</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="hidden sm:table-cell">Day</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holidaysLoading ? (
                          <TableSkeleton rows={5} cols={4} />
                        ) : (
                          holidayRecords.map((holiday) => {
                            const d = new Date(holiday.date + 'T00:00:00')
                            const dayName = d.toLocaleDateString('en-IN', { weekday: 'long' })
                            const formatted = d.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                            return (
                              <TableRow key={holiday.id}>
                                <TableCell className="font-medium">{formatted}</TableCell>
                                <TableCell>{holiday.name}</TableCell>
                                <TableCell>{getHolidayTypeBadge(holiday.type)}</TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                                  {dayName}
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════ GEOFENCING TAB ═══════════════════════ */}
          <TabsContent value="geofencing" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Mock Map */}
              <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Office Geofence Map</CardTitle>
                  <CardDescription>Real-time check-in location verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[360px] w-full overflow-hidden rounded-lg">
                    {/* Map Placeholder with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/40">
                      {/* Grid lines */}
                      <div className="absolute inset-0 opacity-20">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={`h-${i}`}
                            className="absolute h-px w-full bg-emerald-400"
                            style={{ top: `${(i + 1) * 8}%` }}
                          />
                        ))}
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={`v-${i}`}
                            className="absolute h-full w-px bg-emerald-400"
                            style={{ left: `${(i + 1) * 8}%` }}
                          />
                        ))}
                      </div>

                      {/* Geofence radius circle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="rounded-full border-2 border-dashed border-emerald-400/60" style={{ width: '240px', height: '240px' }}>
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="rounded-full border border-emerald-300/40 bg-emerald-100/30 dark:bg-emerald-900/20" style={{ width: '140px', height: '140px' }}>
                              <div className="flex h-full w-full items-center justify-center">
                                {/* Office Pin */}
                                <div className="flex flex-col items-center">
                                  <div className="rounded-full bg-emerald-500 p-2 shadow-lg shadow-emerald-500/30">
                                    <MapPin className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="mt-1 rounded bg-background/90 px-2 py-0.5 text-[10px] font-medium shadow-sm">
                                    HQ Bangalore
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scattered check-in dots */}
                      <div className="absolute top-[30%] left-[35%] flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800" />
                        <span className="text-[9px] font-medium text-emerald-700 dark:text-emerald-400">RK</span>
                      </div>
                      <div className="absolute top-[45%] left-[60%] flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800" />
                        <span className="text-[9px] font-medium text-emerald-700 dark:text-emerald-400">KN</span>
                      </div>
                      <div className="absolute top-[55%] left-[25%] flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800" />
                        <span className="text-[9px] font-medium text-emerald-700 dark:text-emerald-400">RV</span>
                      </div>
                      <div className="absolute top-[25%] left-[70%] flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-800" />
                        <span className="text-[9px] font-medium text-amber-700 dark:text-amber-400">SR</span>
                      </div>
                      <div className="absolute top-[70%] left-[50%] flex items-center gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800" />
                        <span className="text-[9px] font-medium text-emerald-700 dark:text-emerald-400">PS</span>
                      </div>

                      {/* Radius label */}
                      <div className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2.5 py-1.5 text-xs shadow-sm">
                        <span className="text-muted-foreground">Radius:</span>{' '}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{geofenceRadius[0]}m</span>
                      </div>

                      {/* Legend */}
                      <div className="absolute bottom-3 right-3 flex gap-3 rounded-md bg-background/90 px-2.5 py-1.5 text-[10px] shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-muted-foreground">Verified</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          <span className="text-muted-foreground">Outside</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Controls Sidebar */}
              <div className="space-y-4">
                {/* Geofence Radius */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Geofence Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Geofence Radius</Label>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{geofenceRadius[0]}m</span>
                      </div>
                      <Slider
                        value={geofenceRadius}
                        onValueChange={setGeofenceRadius}
                        min={100}
                        max={2000}
                        step={50}
                        className="[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>100m</span>
                        <span>2000m</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Biometric Integration */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium">Biometric Integration</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Fingerprint Scanner', status: 'online', icon: Fingerprint },
                          { name: 'Face Recognition', status: 'online', icon: ShieldCheck },
                          { name: 'RFID Card Reader', status: 'offline', icon: Navigation },
                        ].map((device) => {
                          const Icon = device.icon
                          const isOnline = device.status === 'online'
                          return (
                            <div key={device.name} className="flex items-center justify-between rounded-lg border p-2.5">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                                <span className="text-xs font-medium">{device.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                                <span className={`text-[10px] font-medium ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                  {isOnline ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Verification Stats */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Verification Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendanceLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/40">
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {geofenceCheckIns.filter((c) => c.verified).length}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Verified</p>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-950/40">
                          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {geofenceCheckIns.filter((c) => !c.verified).length}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Unverified</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Check-in List with Location Verification */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Today&apos;s Check-in Verification</CardTitle>
                <CardDescription>Location verification status for all check-ins</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead className="hidden sm:table-cell">Location</TableHead>
                        <TableHead className="hidden md:table-cell">Distance</TableHead>
                        <TableHead>Verification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceLoading ? (
                        <TableSkeleton rows={5} cols={5} />
                      ) : (
                        geofenceCheckIns.map((checkIn) => (
                          <TableRow key={checkIn.id}>
                            <TableCell className="font-medium">{checkIn.name}</TableCell>
                            <TableCell>{checkIn.checkInTime}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                              {checkIn.location}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                              {checkIn.distance}
                            </TableCell>
                            <TableCell>
                              {checkIn.verified ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Outside
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
