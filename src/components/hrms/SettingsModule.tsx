'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Puzzle,
  Bell,
  Mail,
  Globe,
  Building2,
  IndianRupee,
  Calendar,
  Save,
  CheckCircle2,
  Linkedin,
  Briefcase,
  MessageSquare,
  Video,
  ExternalLink,
  Upload,
  Eye,
  X,
  Search,
  Phone,
  CalendarDays,
  Key,
  Camera,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IntegrationItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  connected: boolean
  category: string
  apiKey: string
}

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  inApp: boolean
  sms: boolean
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  lastModified: string
  category: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SettingsModule() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [localTab, setLocalTab] = useState('general')
  const [saved, setSaved] = useState(false)

  // General Settings
  const [companyName, setCompanyName] = useState('eh2r AI Technologies Pvt. Ltd.')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [currency, setCurrency] = useState('INR')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [fiscalYearStart, setFiscalYearStart] = useState('April')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Integrations
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { id: 'int1', name: 'LinkedIn', icon: Linkedin, description: 'Import candidate profiles and post jobs directly to LinkedIn', connected: true, category: 'Recruitment', apiKey: 'li_sk_****a3f7' },
    { id: 'int2', name: 'Naukri', icon: Briefcase, description: 'Post jobs and receive applications from Naukri.com', connected: false, category: 'Recruitment', apiKey: '' },
    { id: 'int3', name: 'Indeed', icon: Search, description: 'Post job listings and access Indeed resume database', connected: false, category: 'Recruitment', apiKey: '' },
    { id: 'int4', name: 'Gmail', icon: Mail, description: 'Send emails and sync calendar events via Gmail', connected: true, category: 'Communication', apiKey: 'gm_****8d2k' },
    { id: 'int5', name: 'Slack', icon: MessageSquare, description: 'Send notifications and updates to Slack channels', connected: true, category: 'Communication', apiKey: 'xoxb_****mr9p' },
    { id: 'int6', name: 'Zoom', icon: Video, description: 'Schedule and manage video interviews seamlessly', connected: false, category: 'Communication', apiKey: '' },
    { id: 'int7', name: 'Google Calendar', icon: CalendarDays, description: 'Sync interviews, meetings, and events with Google Calendar', connected: true, category: 'Productivity', apiKey: 'gc_****v4n2' },
    { id: 'int8', name: 'WhatsApp', icon: Phone, description: 'Send notifications and reminders via WhatsApp Business API', connected: false, category: 'Communication', apiKey: '' },
  ])

  // Notifications
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'n1', label: 'Leave Requests', description: 'When an employee applies for leave or leave status changes', email: true, inApp: true, sms: false },
    { id: 'n2', label: 'Expense Approvals', description: 'Pending expense approvals and reimbursement updates', email: true, inApp: true, sms: false },
    { id: 'n3', label: 'Payroll Processing', description: 'Monthly payroll processing status and completion alerts', email: true, inApp: true, sms: true },
    { id: 'n4', label: 'Interview Reminders', description: 'Upcoming interview schedules and reminders', email: true, inApp: true, sms: true },
    { id: 'n5', label: 'Task Assignments', description: 'When a new task is assigned or task status changes', email: false, inApp: true, sms: false },
    { id: 'n6', label: 'System Alerts', description: 'Platform maintenance, security alerts, and updates', email: true, inApp: true, sms: true },
  ])

  // Email Templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    { id: 'et1', name: 'Offer Letter', subject: 'Offer of Employment - {{company_name}}', body: 'Dear {{candidate_name}},\n\nWe are pleased to offer you the position of {{position}} at {{company_name}}.\n\nCompensation: ₹{{salary}} per annum\nStart Date: {{start_date}}\nReporting To: {{reporting_manager}}\n\nPlease confirm your acceptance by {{confirmation_deadline}}.\n\nBest regards,\nHR Team', variables: ['candidate_name', 'position', 'company_name', 'salary', 'start_date', 'reporting_manager', 'confirmation_deadline'], lastModified: '2026-05-20', category: 'Recruitment' },
    { id: 'et2', name: 'Welcome Email', subject: 'Welcome to {{company_name}}!', body: 'Dear {{employee_name}},\n\nWelcome to {{company_name}}! We are thrilled to have you join our team as {{designation}} in the {{department}} department.\n\nYour joining date is {{join_date}}. Please report to {{reporting_manager}} on your first day.\n\nBest regards,\nHR Team', variables: ['company_name', 'employee_name', 'designation', 'department', 'join_date', 'reporting_manager'], lastModified: '2026-05-15', category: 'Onboarding' },
    { id: 'et3', name: 'Leave Approval', subject: 'Leave Application {{status}} - {{employee_name}}', body: 'Dear {{employee_name}},\n\nYour leave application from {{start_date}} to {{end_date}} has been {{status}}.\n\n{{comments}}\n\nRegards,\n{{approver_name}}', variables: ['employee_name', 'start_date', 'end_date', 'status', 'comments', 'approver_name'], lastModified: '2026-05-10', category: 'Leave' },
    { id: 'et4', name: 'Expense Approval', subject: 'Expense Claim {{status}} - {{expense_id}}', body: 'Dear {{employee_name}},\n\nYour expense claim {{expense_id}} for ₹{{amount}} has been {{status}}.\n\nCategory: {{category}}\nSubmitted: {{submitted_date}}\n{{comments}}\n\nRegards,\nFinance Team', variables: ['employee_name', 'expense_id', 'amount', 'status', 'category', 'submitted_date', 'comments'], lastModified: '2026-05-08', category: 'Finance' },
    { id: 'et5', name: 'Payroll Generated', subject: 'Payslip for {{month}} {{year}} - {{company_name}}', body: 'Dear {{employee_name}},\n\nYour payslip for {{month}} {{year}} has been generated and is available for download.\n\nNet Pay: ₹{{net_pay}}\n\nPlease login to view the detailed payslip.\n\nRegards,\nPayroll Team', variables: ['employee_name', 'month', 'year', 'net_pay', 'company_name'], lastModified: '2026-05-01', category: 'Payroll' },
    { id: 'et6', name: 'Interview Schedule', subject: 'Interview Scheduled - {{candidate_name}} for {{position}}', body: 'Dear {{panelist_name}},\n\nAn interview has been scheduled:\n\nCandidate: {{candidate_name}}\nPosition: {{position}}\nDate: {{interview_date}}\nTime: {{interview_time}}\nMode: {{interview_mode}}\n\nPlease confirm your availability.\n\nRegards,\nRecruitment Team', variables: ['panelist_name', 'candidate_name', 'position', 'interview_date', 'interview_time', 'interview_mode'], lastModified: '2026-04-28', category: 'Recruitment' },
  ])

  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const tabMap: Record<string, string> = { 'general': 'general', 'integrations': 'integrations', 'notifications': 'notifications', 'email-templates': 'email-templates', 'general-settings': 'general', 'notification-settings': 'notifications', 'integration-settings': 'integrations' }

  // Sync sidebar sub-item to local tab and clear it
  useEffect(() => {
    if (activeSubItem && tabMap[activeSubItem]) {
      setLocalTab(tabMap[activeSubItem])
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // Derive active tab: sidebar sub-item takes priority, then local tab
  const activeTab = (activeSubItem && tabMap[activeSubItem]) || localTab

  const handleTabChange = (tab: string) => {
    setLocalTab(tab)
    setActiveSubItem(null)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleIntegration(id: string) {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected, apiKey: !i.connected ? '' : i.apiKey } : i))
  }

  function updateApiKey(id: string, key: string) {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, apiKey: key } : i))
  }

  function toggleNotification(id: string, channel: 'email' | 'inApp' | 'sms') {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, [channel]: !n[channel] } : n))
  }

  function handleSaveTemplate() {
    if (!editingTemplate) return
    setEmailTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, lastModified: new Date().toISOString().split('T')[0] } : t))
    setEditingTemplate(null)
  }

  function handleLogoUpload() {
    setLogoPreview('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxMiIgZmlsbD0iIzA0N2E1NyIvPjx0ZXh0IHg9IjQwIiB5PSI0OCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+ZTI8L3RleHQ+PC9zdmc+')
  }

  const filteredTemplates = emailTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const connectedCount = integrations.filter(i => i.connected).length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Settings className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground text-sm">Configure your HRMS platform</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Integrations</p>
              <p className="text-2xl font-bold">{connectedCount}/{integrations.length}</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-sky-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Notifications</p>
              <p className="text-2xl font-bold">{notifications.filter(n => n.email || n.inApp || n.sms).length}/{notifications.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-violet-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Email Templates</p>
              <p className="text-2xl font-bold">{emailTemplates.length}</p>
              <p className="text-xs text-muted-foreground">Configured</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="text-2xl font-bold text-sm truncate">{companyName}</p>
              <p className="text-xs text-muted-foreground">{timezone}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="general" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> General</TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5"><Puzzle className="h-3.5 w-3.5" /> Integrations</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
            <TabsTrigger value="email-templates" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Templates</TabsTrigger>
          </TabsList>

          {/* ─── General Tab ─────────────────────────────────────────────── */}
          <TabsContent value="general">
            <div className="grid gap-6 max-w-2xl">
              {/* Company Logo */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Camera className="h-4 w-4 text-emerald-600" /> Company Logo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="h-20 w-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/30">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Company Logo" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleLogoUpload}>
                        <Upload className="h-4 w-4" /> Upload Logo
                      </Button>
                      {logoPreview && (
                        <Button variant="ghost" size="sm" className="gap-2 text-red-600" onClick={() => setLogoPreview(null)}>
                          <X className="h-4 w-4" /> Remove
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB. Recommended 200×200px</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-emerald-600" /> Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                          <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                          <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="AED">AED (د.إ)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date Format</Label>
                      <Select value={dateFormat} onValueChange={setDateFormat}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Fiscal Year Start</Label>
                      <Select value={fiscalYearStart} onValueChange={setFiscalYearStart}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="April">April (April - March)</SelectItem>
                          <SelectItem value="January">January (Jan - Dec)</SelectItem>
                          <SelectItem value="July">July (July - June)</SelectItem>
                          <SelectItem value="October">October (Oct - Sep)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      {saved ? 'Saved!' : 'Save Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Integrations Tab ────────────────────────────────────────── */}
          <TabsContent value="integrations">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {integrations.map(int => {
                const Icon = int.icon
                return (
                  <Card key={int.id} className={`hover:shadow-md transition-shadow ${int.connected ? 'border-emerald-200' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${int.connected ? 'bg-emerald-100' : 'bg-muted'}`}>
                            <Icon className={`h-5 w-5 ${int.connected ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{int.name}</p>
                            <Badge variant="outline" className="text-[10px] mt-0.5">{int.category}</Badge>
                          </div>
                        </div>
                        <Switch checked={int.connected} onCheckedChange={() => toggleIntegration(int.id)} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{int.description}</p>
                      {int.connected && (
                        <div className="mb-3">
                          <Label className="text-xs flex items-center gap-1 mb-1">
                            <Key className="h-3 w-3" /> API Key
                          </Label>
                          <Input
                            value={int.apiKey}
                            onChange={e => updateApiKey(int.id, e.target.value)}
                            placeholder="Enter API key..."
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {int.connected ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Not Connected</Badge>
                        )}
                        {int.connected && (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground">
                            <ExternalLink className="h-3 w-3" /> Configure
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* ─── Notifications Tab ───────────────────────────────────────── */}
          <TabsContent value="notifications">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left text-sm font-medium p-4">Notification Type</th>
                        <th className="text-center text-sm font-medium p-4">
                          <div className="flex items-center justify-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</div>
                        </th>
                        <th className="text-center text-sm font-medium p-4">
                          <div className="flex items-center justify-center gap-1.5"><Bell className="h-3.5 w-3.5" /> In-App</div>
                        </th>
                        <th className="text-center text-sm font-medium p-4">
                          <div className="flex items-center justify-center gap-1.5"><Phone className="h-3.5 w-3.5" /> SMS</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map(notif => (
                        <tr key={notif.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="text-sm font-medium">{notif.label}</p>
                            <p className="text-xs text-muted-foreground">{notif.description}</p>
                          </td>
                          <td className="text-center p-4"><Switch checked={notif.email} onCheckedChange={() => toggleNotification(notif.id, 'email')} /></td>
                          <td className="text-center p-4"><Switch checked={notif.inApp} onCheckedChange={() => toggleNotification(notif.id, 'inApp')} /></td>
                          <td className="text-center p-4"><Switch checked={notif.sms} onCheckedChange={() => toggleNotification(notif.id, 'sms')} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Changes are saved automatically</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Email: {notifications.filter(n => n.email).length}/{notifications.length}</span>
                    <span>In-App: {notifications.filter(n => n.inApp).length}/{notifications.length}</span>
                    <span>SMS: {notifications.filter(n => n.sms).length}/{notifications.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Email Templates Tab ─────────────────────────────────────── */}
          <TabsContent value="email-templates">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-9 pl-9 w-[250px]" />
              </div>
            </div>
            <div className="space-y-4">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                          <Mail className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">Subject: {template.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">{template.category}</Badge>
                            <span className="text-[10px] text-muted-foreground">Modified: {template.lastModified}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setPreviewTemplate({ ...template })}>
                          <Eye className="h-3 w-3" /> Preview
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditingTemplate({ ...template })}>
                          <FileText className="h-3 w-3" /> Edit
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.variables.map(v => (
                        <Badge key={v} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email Template Editor Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {editingTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-emerald-600" /> Edit Template</DialogTitle>
                <DialogDescription>Modify the email template content and subject line.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Template Name</Label>
                  <Input value={editingTemplate.name} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} />
                </div>
                <div>
                  <Label>Subject Line</Label>
                  <Input value={editingTemplate.subject} onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Email Body</Label>
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground mr-1">Insert:</span>
                      {editingTemplate.variables.map(v => (
                        <button key={v} onClick={() => setEditingTemplate({ ...editingTemplate, body: editingTemplate.body + `{{${v}}}` })} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea value={editingTemplate.body} onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })} rows={14} className="font-mono text-sm" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                <Button onClick={handleSaveTemplate} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Save className="h-4 w-4" /> Save Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-emerald-600" /> Preview: {previewTemplate.name}</DialogTitle>
                <DialogDescription>Preview of the email template with sample data</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="text-sm font-medium">{previewTemplate.subject}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-xs text-muted-foreground">Body</Label>
                      <div className="mt-1 rounded-lg border bg-white p-4 text-sm whitespace-pre-wrap">
                        {previewTemplate.body}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Variables</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {previewTemplate.variables.map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => { setEditingTemplate({ ...previewTemplate }); setPreviewTemplate(null) }}>
                  <FileText className="h-4 w-4" /> Edit Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
