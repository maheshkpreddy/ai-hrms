'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useHRMSStore } from '@/lib/store'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Building2,
  GitBranch,
  Network,
  Award,
  Layers,
  Clock,
  CalendarDays,
  Wrench,
  FileText,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Loader2,
  MapPin,
  Globe,
  UserCircle,
  Users,
  UserCheck,
  Target,
  DollarSign,
  Briefcase,
  GraduationCap,
  Shield,
  FileCheck,
  ToggleLeft,
  ToggleRight,
  Eye,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// ─── Type Definitions ──────────────────────────────────────────────────────────

interface CompanyMaster {
  id: string
  name: string
  legalName: string
  code: string
  gstVat: string
  panTanCin: string
  registrationNumber: string
  industryType: string
  logo: string
  address: string
  country: string
  state: string
  city: string
  currency: string
  timezone: string
  financialYear: string
  payrollCycle: string
  defaultLanguage: string
  status: 'active' | 'inactive'
  parentId?: string
  parentName?: string
  children?: { id: string; name: string; code: string }[]
  _count?: {
    employees?: number
    departments?: number
    branches?: number
    companyPolicies?: number
    payrollStructures?: number
    workflowDefs?: number
    users?: number
  }
}

interface CompanyDetailData {
  id: string
  name: string
  legalName?: string | null
  code: string
  gstVat?: string | null
  panTanCin?: string | null
  registrationNumber?: string | null
  industry?: string | null
  logo?: string | null
  domain?: string | null
  address?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  currency: string
  timezone: string
  payrollCycle?: string | null
  financialYear?: string | null
  defaultLanguage?: string | null
  status: string
  parentId?: string | null
  parent?: { id: string; name: string; code: string } | null
  children?: { id: string; name: string; code: string; status: string }[]
  _count?: {
    employees?: number
    departments?: number
    branches?: number
    companyPolicies?: number
    payrollStructures?: number
    workflowDefs?: number
    users?: number
  }
  companyPolicies?: { id: string; title: string; category?: string | null; status: string; version?: string | null; effectiveDate?: string | null }[]
  payrollStructures?: { id: string; name: string; basicPay: number; hra?: number | null; da?: number | null; pfEmployee?: number | null; taxDeduction?: number | null }[]
  workflowDefs?: { id: string; name: string; type: string; entity: string; isActive: boolean }[]
  users?: { id: string; name: string; email: string; role: string; isActive: boolean }[]
}

interface BranchMaster {
  id: string
  name: string
  code: string
  company: string
  address: string
  geoLocation: string
  timezone: string
  geofenceRadius: string
  branchManager: string
  status: 'active' | 'inactive'
}

interface DepartmentMaster {
  id: string
  name: string
  code: string
  company: string
  parentDepartment: string
  departmentHead: string
  costCenter: string
  status: 'active' | 'inactive'
}

interface DesignationMaster {
  id: string
  name: string
  code: string
  department: string
  grade: string
  level: number
  jobDescription: string
  status: 'active' | 'inactive'
}

interface GradeMaster {
  id: string
  name: string
  code: string
  salaryBandMin: number
  salaryBandMax: number
  leaveEligibility: string
  benefitsEligibility: string
  approvalLevel: number
  status: 'active' | 'inactive'
}

interface ShiftMaster {
  id: string
  name: string
  startTime: string
  endTime: string
  breakDuration: string
  graceTime: string
  lateMarkRule: string
  overtimeEligible: boolean
  weeklyOff: string
  status: 'active' | 'inactive'
}

interface LeaveTypeMaster {
  id: string
  name: string
  code: string
  paidUnpaid: 'paid' | 'unpaid'
  annualQuota: number
  accrualRule: string
  carryForwardRule: string
  encashmentRule: string
  applicableGender: string
  applicableEmploymentType: string
  approvalRequired: boolean
  attachmentRequired: boolean
  status: 'active' | 'inactive'
}

interface SkillMaster {
  id: string
  name: string
  category: string
  level: string
  certificationRequired: boolean
  status: 'active' | 'inactive'
}

interface DocumentTypeMaster {
  id: string
  name: string
  mandatoryOptional: 'mandatory' | 'optional'
  applicableModule: string
  expiryRequired: boolean
  verificationRequired: boolean
  status: 'active' | 'inactive'
}

interface PolicyMaster {
  id: string
  title: string
  company: string
  category: string
  version: string
  effectiveDate: string
  status: 'active' | 'inactive' | 'draft'
}

type MasterRecord =
  | CompanyMaster
  | BranchMaster
  | DepartmentMaster
  | DesignationMaster
  | GradeMaster
  | ShiftMaster
  | LeaveTypeMaster
  | SkillMaster
  | DocumentTypeMaster
  | PolicyMaster

// ─── Tab Configuration ─────────────────────────────────────────────────────────

interface TabConfig {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  subItemKey: string
  apiEndpoint: string
}

const TABS: TabConfig[] = [
  { key: 'companies', label: 'Company', icon: Building2, subItemKey: 'company-masters', apiEndpoint: '/api/masters/companies' },
  { key: 'branches', label: 'Branch', icon: GitBranch, subItemKey: 'branches', apiEndpoint: '/api/masters/branches' },
  { key: 'departments', label: 'Department', icon: Network, subItemKey: 'departments-master', apiEndpoint: '/api/masters/departments' },
  { key: 'sub-departments', label: 'Sub-Department', icon: Users, subItemKey: 'sub-departments', apiEndpoint: '/api/masters/departments' },
  { key: 'designations', label: 'Designation', icon: Award, subItemKey: 'designation-master', apiEndpoint: '/api/masters/designations' },
  { key: 'roles', label: 'Roles', icon: Shield, subItemKey: 'roles-master', apiEndpoint: '/api/masters/roles' },
  { key: 'employee-types', label: 'Employee Types', icon: UserCheck, subItemKey: 'employee-types', apiEndpoint: '/api/masters/employee-types' },
  { key: 'grades', label: 'Grade/Band', icon: Layers, subItemKey: 'grade-master', apiEndpoint: '/api/masters/grades' },
  { key: 'shifts', label: 'Shift', icon: Clock, subItemKey: 'shift-master', apiEndpoint: '/api/masters/shifts' },
  { key: 'leave-types', label: 'Leave Type', icon: CalendarDays, subItemKey: 'leave-type-master', apiEndpoint: '/api/masters/leave-types' },
  { key: 'skills', label: 'Skill', icon: Wrench, subItemKey: 'skill-master', apiEndpoint: '/api/masters/skills' },
  { key: 'document-types', label: 'Document Type', icon: FileText, subItemKey: 'document-type-master', apiEndpoint: '/api/masters/document-types' },
  { key: 'policies', label: 'Policies', icon: FileText, subItemKey: 'policies', apiEndpoint: '/api/masters/companies' },
]

// ─── Sample Data ───────────────────────────────────────────────────────────────

const SAMPLE_COMPANIES: CompanyMaster[] = [
  {
    id: 'comp-1',
    name: 'MARQ AI Technologies',
    legalName: 'MARQ AI Technologies Private Limited',
    code: 'MARQ',
    gstVat: '27AABCM1234F1Z5',
    panTanCin: 'AABCM1234F',
    registrationNumber: 'U72200MH2020PTC345678',
    industryType: 'Technology',
    logo: '',
    address: 'BKC, Bandra Kurla Complex, Bandra East',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    financialYear: 'April-March',
    payrollCycle: 'Monthly',
    defaultLanguage: 'English',
    status: 'active',
    _count: { employees: 150, departments: 8, branches: 4, companyPolicies: 12, payrollStructures: 5, workflowDefs: 8, users: 150 },
  },
  {
    id: 'comp-2',
    name: 'Acme Corp',
    legalName: 'Acme Corporation Inc.',
    code: 'ACME',
    gstVat: '29AABCA5678G1Z3',
    panTanCin: 'AABCA5678G',
    registrationNumber: 'U72200KA2018PTC234567',
    industryType: 'Consulting',
    logo: '',
    address: 'Whitefield Main Road, ITPL Area',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    financialYear: 'April-March',
    payrollCycle: 'Monthly',
    defaultLanguage: 'English',
    status: 'active',
    _count: { employees: 80, departments: 5, branches: 3, companyPolicies: 8, payrollStructures: 3, workflowDefs: 5, users: 80 },
  },
  {
    id: 'comp-3',
    name: 'Global Solutions',
    legalName: 'Global Solutions Ltd.',
    code: 'GSOL',
    gstVat: '07AABCG9012H1Z7',
    panTanCin: 'AABCG9012H',
    registrationNumber: 'U72200DL2019PTC456789',
    industryType: 'Technology',
    logo: '',
    address: 'Connaught Place, New Delhi',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    financialYear: 'April-March',
    payrollCycle: 'Monthly',
    defaultLanguage: 'English',
    status: 'inactive',
    _count: { employees: 45, departments: 4, branches: 2, companyPolicies: 6, payrollStructures: 2, workflowDefs: 3, users: 45 },
  },
]

const SAMPLE_BRANCHES: BranchMaster[] = [
  { id: 'br-1', name: 'Mumbai HQ', code: 'MUM-HQ', company: 'MARQ AI Technologies', address: 'BKC, Bandra Kurla Complex, Mumbai', geoLocation: '19.0596, 72.8654', timezone: 'Asia/Kolkata', geofenceRadius: '500m', branchManager: 'Rajesh Kumar', status: 'active' },
  { id: 'br-2', name: 'Bangalore Tech', code: 'BLR-TECH', company: 'MARQ AI Technologies', address: 'Whitefield, Bangalore', geoLocation: '12.9716, 77.5946', timezone: 'Asia/Kolkata', geofenceRadius: '500m', branchManager: 'Priya Sharma', status: 'active' },
  { id: 'br-3', name: 'Delhi Sales', code: 'DEL-SALES', company: 'Acme Corp', address: 'Connaught Place, New Delhi', geoLocation: '28.6329, 77.2200', timezone: 'Asia/Kolkata', geofenceRadius: '300m', branchManager: 'Amit Verma', status: 'active' },
  { id: 'br-4', name: 'Hyderabad Dev', code: 'HYD-DEV', company: 'MARQ AI Technologies', address: 'HITEC City, Hyderabad', geoLocation: '17.4435, 78.3772', timezone: 'Asia/Kolkata', geofenceRadius: '500m', branchManager: 'Srinivas Reddy', status: 'active' },
  { id: 'br-5', name: 'Pune BPO', code: 'PNE-BPO', company: 'Global Solutions', address: 'Hinjewadi, Pune', geoLocation: '18.5913, 73.7389', timezone: 'Asia/Kolkata', geofenceRadius: '300m', branchManager: 'Sneha Patil', status: 'inactive' },
]

const SAMPLE_DEPARTMENTS: DepartmentMaster[] = [
  { id: 'dep-1', name: 'Engineering', code: 'ENG', company: 'MARQ AI Technologies', parentDepartment: '-', departmentHead: 'Vikram Singh', costCenter: 'CC-ENG-001', status: 'active' },
  { id: 'dep-2', name: 'HR', code: 'HR', company: 'MARQ AI Technologies', parentDepartment: '-', departmentHead: 'Meera Nair', costCenter: 'CC-HR-001', status: 'active' },
  { id: 'dep-3', name: 'Finance', code: 'FIN', company: 'MARQ AI Technologies', parentDepartment: '-', departmentHead: 'Anil Gupta', costCenter: 'CC-FIN-001', status: 'active' },
  { id: 'dep-4', name: 'Sales', code: 'SAL', company: 'Acme Corp', parentDepartment: '-', departmentHead: 'Rohit Mehra', costCenter: 'CC-SAL-001', status: 'active' },
  { id: 'dep-5', name: 'Marketing', code: 'MKT', company: 'Acme Corp', parentDepartment: '-', departmentHead: 'Neha Kapoor', costCenter: 'CC-MKT-001', status: 'active' },
  { id: 'dep-6', name: 'Operations', code: 'OPS', company: 'MARQ AI Technologies', parentDepartment: '-', departmentHead: 'Kiran Rao', costCenter: 'CC-OPS-001', status: 'active' },
  { id: 'dep-7', name: 'Legal', code: 'LGL', company: 'Global Solutions', parentDepartment: '-', departmentHead: 'Deepak Joshi', costCenter: 'CC-LGL-001', status: 'active' },
  { id: 'dep-8', name: 'Admin', code: 'ADM', company: 'Global Solutions', parentDepartment: '-', departmentHead: 'Sunita Sharma', costCenter: 'CC-ADM-001', status: 'inactive' },
]

const SAMPLE_DESIGNATIONS: DesignationMaster[] = [
  { id: 'des-1', name: 'Software Engineer', code: 'SE', department: 'Engineering', grade: 'E2', level: 2, jobDescription: 'Design, develop, and maintain software applications', status: 'active' },
  { id: 'des-2', name: 'Senior Engineer', code: 'SSE', department: 'Engineering', grade: 'E3', level: 3, jobDescription: 'Lead technical design and mentor junior engineers', status: 'active' },
  { id: 'des-3', name: 'Tech Lead', code: 'TL', department: 'Engineering', grade: 'E4', level: 4, jobDescription: 'Lead development teams and drive technical decisions', status: 'active' },
  { id: 'des-4', name: 'Engineering Manager', code: 'EM', department: 'Engineering', grade: 'E5', level: 5, jobDescription: 'Manage engineering teams and delivery', status: 'active' },
  { id: 'des-5', name: 'HR Executive', code: 'HRE', department: 'HR', grade: 'E2', level: 2, jobDescription: 'Handle HR operations and employee relations', status: 'active' },
  { id: 'des-6', name: 'HR Manager', code: 'HRM', department: 'HR', grade: 'E4', level: 4, jobDescription: 'Oversee HR functions and strategic initiatives', status: 'active' },
  { id: 'des-7', name: 'Sales Executive', code: 'SAE', department: 'Sales', grade: 'E2', level: 2, jobDescription: 'Drive sales and client acquisition', status: 'active' },
  { id: 'des-8', name: 'Sales Manager', code: 'SAM', department: 'Sales', grade: 'E4', level: 4, jobDescription: 'Manage sales team and revenue targets', status: 'active' },
  { id: 'des-9', name: 'Finance Analyst', code: 'FA', department: 'Finance', grade: 'E2', level: 2, jobDescription: 'Analyze financial data and prepare reports', status: 'active' },
  { id: 'des-10', name: 'Finance Manager', code: 'FM', department: 'Finance', grade: 'E4', level: 4, jobDescription: 'Oversee financial planning and compliance', status: 'inactive' },
]

const SAMPLE_GRADES: GradeMaster[] = [
  { id: 'grd-1', name: 'E1 - Junior', code: 'E1', salaryBandMin: 300000, salaryBandMax: 600000, leaveEligibility: '18 days/year', benefitsEligibility: 'Basic Health', approvalLevel: 1, status: 'active' },
  { id: 'grd-2', name: 'E2 - Associate', code: 'E2', salaryBandMin: 600000, salaryBandMax: 1000000, leaveEligibility: '21 days/year', benefitsEligibility: 'Standard Health + Dental', approvalLevel: 2, status: 'active' },
  { id: 'grd-3', name: 'E3 - Senior', code: 'E3', salaryBandMin: 1000000, salaryBandMax: 1800000, leaveEligibility: '24 days/year', benefitsEligibility: 'Premium Health + Dental + Vision', approvalLevel: 3, status: 'active' },
  { id: 'grd-4', name: 'E4 - Lead', code: 'E4', salaryBandMin: 1800000, salaryBandMax: 3000000, leaveEligibility: '27 days/year', benefitsEligibility: 'Premium Health + Dental + Vision + Life', approvalLevel: 4, status: 'active' },
  { id: 'grd-5', name: 'E5 - Manager', code: 'E5', salaryBandMin: 3000000, salaryBandMax: 5000000, leaveEligibility: '30 days/year', benefitsEligibility: 'Executive Package', approvalLevel: 5, status: 'active' },
  { id: 'grd-6', name: 'E6 - Director', code: 'E6', salaryBandMin: 5000000, salaryBandMax: 10000000, leaveEligibility: '30 days/year', benefitsEligibility: 'C-Suite Package', approvalLevel: 6, status: 'active' },
]

const SAMPLE_SHIFTS: ShiftMaster[] = [
  { id: 'shf-1', name: 'General Shift', startTime: '09:00', endTime: '18:00', breakDuration: '60 min', graceTime: '15 min', lateMarkRule: 'After 15 min grace', overtimeEligible: true, weeklyOff: 'Saturday, Sunday', status: 'active' },
  { id: 'shf-2', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakDuration: '45 min', graceTime: '10 min', lateMarkRule: 'After 10 min grace', overtimeEligible: true, weeklyOff: 'Sunday', status: 'active' },
  { id: 'shf-3', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakDuration: '45 min', graceTime: '10 min', lateMarkRule: 'After 10 min grace', overtimeEligible: true, weeklyOff: 'Sunday', status: 'active' },
  { id: 'shf-4', name: 'Night Shift', startTime: '22:00', endTime: '06:00', breakDuration: '45 min', graceTime: '10 min', lateMarkRule: 'After 10 min grace', overtimeEligible: true, weeklyOff: 'Sunday', status: 'active' },
]

const SAMPLE_LEAVE_TYPES: LeaveTypeMaster[] = [
  { id: 'lt-1', name: 'Casual Leave', code: 'CL', paidUnpaid: 'paid', annualQuota: 12, accrualRule: '1 per month', carryForwardRule: 'Max 3 days', encashmentRule: 'Not allowed', applicableGender: 'All', applicableEmploymentType: 'Full-time, Part-time', approvalRequired: true, attachmentRequired: false, status: 'active' },
  { id: 'lt-2', name: 'Sick Leave', code: 'SL', paidUnpaid: 'paid', annualQuota: 10, accrualRule: '1 per month', carryForwardRule: 'Max 5 days', encashmentRule: 'Not allowed', applicableGender: 'All', applicableEmploymentType: 'Full-time', approvalRequired: true, attachmentRequired: true, status: 'active' },
  { id: 'lt-3', name: 'Earned Leave', code: 'EL', paidUnpaid: 'paid', annualQuota: 15, accrualRule: '1.25 per month', carryForwardRule: 'Max 10 days', encashmentRule: 'Allowed at basic pay', applicableGender: 'All', applicableEmploymentType: 'Full-time', approvalRequired: true, attachmentRequired: false, status: 'active' },
  { id: 'lt-4', name: 'Maternity Leave', code: 'ML', paidUnpaid: 'paid', annualQuota: 182, accrualRule: 'Flat allocation', carryForwardRule: 'Not applicable', encashmentRule: 'Not allowed', applicableGender: 'Female', applicableEmploymentType: 'Full-time', approvalRequired: true, attachmentRequired: true, status: 'active' },
  { id: 'lt-5', name: 'Paternity Leave', code: 'PL', paidUnpaid: 'paid', annualQuota: 15, accrualRule: 'Flat allocation', carryForwardRule: 'Not applicable', encashmentRule: 'Not allowed', applicableGender: 'Male', applicableEmploymentType: 'Full-time', approvalRequired: true, attachmentRequired: true, status: 'active' },
  { id: 'lt-6', name: 'Comp-off', code: 'CO', paidUnpaid: 'paid', annualQuota: 0, accrualRule: '1 per extra day worked', carryForwardRule: 'Max 3 days', encashmentRule: 'Not allowed', applicableGender: 'All', applicableEmploymentType: 'Full-time', approvalRequired: true, attachmentRequired: false, status: 'active' },
  { id: 'lt-7', name: 'Loss of Pay', code: 'LOP', paidUnpaid: 'unpaid', annualQuota: 0, accrualRule: 'N/A', carryForwardRule: 'N/A', encashmentRule: 'N/A', applicableGender: 'All', applicableEmploymentType: 'All', approvalRequired: true, attachmentRequired: false, status: 'active' },
]

const SAMPLE_SKILLS: SkillMaster[] = [
  { id: 'sk-1', name: 'React', category: 'Frontend', level: 'Intermediate', certificationRequired: false, status: 'active' },
  { id: 'sk-2', name: 'Node.js', category: 'Backend', level: 'Intermediate', certificationRequired: false, status: 'active' },
  { id: 'sk-3', name: 'Python', category: 'Backend', level: 'Advanced', certificationRequired: false, status: 'active' },
  { id: 'sk-4', name: 'Java', category: 'Backend', level: 'Advanced', certificationRequired: true, status: 'active' },
  { id: 'sk-5', name: 'SQL', category: 'Database', level: 'Intermediate', certificationRequired: false, status: 'active' },
  { id: 'sk-6', name: 'AWS', category: 'Cloud', level: 'Advanced', certificationRequired: true, status: 'active' },
  { id: 'sk-7', name: 'Docker', category: 'DevOps', level: 'Intermediate', certificationRequired: false, status: 'active' },
  { id: 'sk-8', name: 'Kubernetes', category: 'DevOps', level: 'Advanced', certificationRequired: true, status: 'active' },
  { id: 'sk-9', name: 'Machine Learning', category: 'AI/ML', level: 'Expert', certificationRequired: true, status: 'active' },
  { id: 'sk-10', name: 'Data Analysis', category: 'Analytics', level: 'Intermediate', certificationRequired: false, status: 'active' },
  { id: 'sk-11', name: 'Project Management', category: 'Management', level: 'Advanced', certificationRequired: true, status: 'active' },
  { id: 'sk-12', name: 'Communication', category: 'Soft Skills', level: 'Intermediate', certificationRequired: false, status: 'active' },
  { id: 'sk-13', name: 'Leadership', category: 'Soft Skills', level: 'Advanced', certificationRequired: false, status: 'active' },
  { id: 'sk-14', name: 'Problem Solving', category: 'Soft Skills', level: 'Advanced', certificationRequired: false, status: 'active' },
  { id: 'sk-15', name: 'Teamwork', category: 'Soft Skills', level: 'Intermediate', certificationRequired: false, status: 'inactive' },
]

const SAMPLE_DOCUMENT_TYPES: DocumentTypeMaster[] = [
  { id: 'dt-1', name: 'Offer Letter', mandatoryOptional: 'mandatory', applicableModule: 'Onboarding', expiryRequired: false, verificationRequired: true, status: 'active' },
  { id: 'dt-2', name: 'ID Proof', mandatoryOptional: 'mandatory', applicableModule: 'Onboarding', expiryRequired: true, verificationRequired: true, status: 'active' },
  { id: 'dt-3', name: 'Address Proof', mandatoryOptional: 'mandatory', applicableModule: 'Onboarding', expiryRequired: true, verificationRequired: true, status: 'active' },
  { id: 'dt-4', name: 'Education Certificate', mandatoryOptional: 'mandatory', applicableModule: 'Onboarding', expiryRequired: false, verificationRequired: true, status: 'active' },
  { id: 'dt-5', name: 'Experience Certificate', mandatoryOptional: 'optional', applicableModule: 'Onboarding', expiryRequired: false, verificationRequired: true, status: 'active' },
  { id: 'dt-6', name: 'Bank Statement', mandatoryOptional: 'mandatory', applicableModule: 'Payroll', expiryRequired: false, verificationRequired: true, status: 'active' },
  { id: 'dt-7', name: 'PF Form', mandatoryOptional: 'mandatory', applicableModule: 'Payroll', expiryRequired: false, verificationRequired: true, status: 'active' },
  { id: 'dt-8', name: 'Medical Certificate', mandatoryOptional: 'optional', applicableModule: 'Attendance', expiryRequired: true, verificationRequired: false, status: 'inactive' },
]

const SAMPLE_POLICIES: PolicyMaster[] = [
  { id: 'pol-1', title: 'Leave Policy', company: 'MARQ AI Technologies', category: 'HR', version: '3.0', effectiveDate: '2025-04-01', status: 'active' },
  { id: 'pol-2', title: 'Attendance Policy', company: 'MARQ AI Technologies', category: 'HR', version: '2.1', effectiveDate: '2025-04-01', status: 'active' },
  { id: 'pol-3', title: 'Code of Conduct', company: 'MARQ AI Technologies', category: 'Compliance', version: '1.5', effectiveDate: '2025-01-01', status: 'active' },
  { id: 'pol-4', title: 'Remote Work Policy', company: 'MARQ AI Technologies', category: 'HR', version: '2.0', effectiveDate: '2025-04-01', status: 'active' },
  { id: 'pol-5', title: 'Data Security Policy', company: 'MARQ AI Technologies', category: 'IT', version: '1.2', effectiveDate: '2025-01-01', status: 'active' },
  { id: 'pol-6', title: 'Travel & Expense Policy', company: 'MARQ AI Technologies', category: 'Finance', version: '2.0', effectiveDate: '2024-04-01', status: 'active' },
  { id: 'pol-7', title: 'Anti-Harassment Policy', company: 'MARQ AI Technologies', category: 'Compliance', version: '1.0', effectiveDate: '2024-01-01', status: 'active' },
  { id: 'pol-8', title: 'Leave Policy', company: 'Acme Corp', category: 'HR', version: '2.0', effectiveDate: '2025-01-01', status: 'active' },
  { id: 'pol-9', title: 'IT Security Policy', company: 'Acme Corp', category: 'IT', version: '1.0', effectiveDate: '2024-06-01', status: 'active' },
  { id: 'pol-10', title: 'Dress Code Policy', company: 'Global Solutions', category: 'HR', version: '1.0', effectiveDate: '2024-01-01', status: 'inactive' },
  { id: 'pol-11', title: 'Probation Policy', company: 'Acme Corp', category: 'HR', version: '1.1', effectiveDate: '2025-07-01', status: 'draft' },
  { id: 'pol-12', title: 'Grievance Policy', company: 'Global Solutions', category: 'Compliance', version: '1.0', effectiveDate: '2025-06-01', status: 'draft' },
]

// ─── Helper: Status Badge ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'active' | 'inactive' | 'draft' }) {
  const draftClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
  const activeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
  const inactiveClass = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: activeClass },
    inactive: { label: 'Inactive', className: inactiveClass },
    draft: { label: 'Draft', className: draftClass },
  }
  const cfg = config[status] || config.active
  return (
    <Badge variant="secondary" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

// ─── Helper: Format Currency (INR) ────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// ─── Pagination Helper ─────────────────────────────────────────────────────────

function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const paginated = items.slice((page - 1) * pageSize, page * pageSize)

  const resetPage = useCallback(() => setPage(1), [])

  return { page, setPage, totalPages, paginated, resetPage }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MasterManagement() {
  const { toast } = useToast()
  const { activeSubItem, setActiveSubItem } = useHRMSStore()

  // ── Active Tab ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('companies')

  // Sync with sidebar sub-item
  useEffect(() => {
    if (activeSubItem) {
      const matchTab = TABS.find(t => t.subItemKey === activeSubItem)
      if (matchTab) setActiveTab(matchTab.key)
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // ── Data State ────────────────────────────────────────────────────────────
  const [companies, setCompanies] = useState<CompanyMaster[]>(SAMPLE_COMPANIES)
  const [branches, setBranches] = useState<BranchMaster[]>(SAMPLE_BRANCHES)
  const [departments, setDepartments] = useState<DepartmentMaster[]>(SAMPLE_DEPARTMENTS)
  const [designations, setDesignations] = useState<DesignationMaster[]>(SAMPLE_DESIGNATIONS)
  const [grades, setGrades] = useState<GradeMaster[]>(SAMPLE_GRADES)
  const [shifts, setShifts] = useState<ShiftMaster[]>(SAMPLE_SHIFTS)
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeMaster[]>(SAMPLE_LEAVE_TYPES)
  const [skills, setSkills] = useState<SkillMaster[]>(SAMPLE_SKILLS)
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeMaster[]>(SAMPLE_DOCUMENT_TYPES)
  const [policies, setPolicies] = useState<PolicyMaster[]>(SAMPLE_POLICIES)

  // ── Search & Filter ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')

  // ── Dialog State ─────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Company Detail Dialog ─────────────────────────────────────────────
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState<CompanyDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailTab, setDetailTab] = useState('info')

  // ── Fetch Companies from API ───────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/masters/companies')
      if (res.ok) {
        const data = await res.json()
        if (data.records && data.records.length > 0) {
          const mapped: CompanyMaster[] = data.records.map((r: any) => ({
            id: r.id,
            name: r.name,
            legalName: r.legalName || '',
            code: r.code,
            gstVat: r.gstVat || '',
            panTanCin: r.panTanCin || '',
            registrationNumber: r.registrationNumber || '',
            industryType: r.industry || '',
            logo: r.logo || '',
            address: r.address || '',
            country: r.country || '',
            state: r.state || '',
            city: r.city || '',
            currency: r.currency || 'USD',
            timezone: r.timezone || 'UTC',
            financialYear: r.financialYear || '',
            payrollCycle: r.payrollCycle || '',
            defaultLanguage: r.defaultLanguage || '',
            status: r.status === 'active' ? 'active' : 'inactive',
            parentId: r.parentId || undefined,
            parentName: r.parent?.name || undefined,
            children: r.children || [],
            _count: r._count || {},
          }))
          setCompanies(mapped)
        }
      }
    } catch {
      // Fall back to sample data
    }
  }, [])

  // Fetch companies when tab is active
  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies()
    }
  }, [activeTab, fetchCompanies])

  // ── Fetch Company Detail ──────────────────────────────────────────────
  const fetchCompanyDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    setDetailOpen(true)
    setDetailTab('info')
    try {
      const res = await fetch(`/api/masters/companies/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDetailData(data)
      } else {
        // Fall back to local data
        const localCompany = companies.find(c => c.id === id)
        if (localCompany) {
          setDetailData({
            ...localCompany,
            status: localCompany.status,
            companyPolicies: [],
            payrollStructures: [],
            workflowDefs: [],
            users: [],
          } as CompanyDetailData)
        }
      }
    } catch {
      const localCompany = companies.find(c => c.id === id)
      if (localCompany) {
        setDetailData({
          ...localCompany,
          status: localCompany.status,
          companyPolicies: [],
          payrollStructures: [],
          workflowDefs: [],
          users: [],
        } as CompanyDetailData)
      }
    }
    setDetailLoading(false)
  }, [companies])

  // ── Notify header dropdown of company changes ───────────────────────────
  const notifyCompanyChange = useCallback(() => {
    if (activeTab === 'companies') {
      window.dispatchEvent(new CustomEvent('companies-updated'))
    }
  }, [activeTab])

  // ── Generate ID ──────────────────────────────────────────────────────────
  const genId = () => `${activeTab}-${Date.now()}`

  // ── Get Current Data ─────────────────────────────────────────────────────
  const getCurrentData = useCallback((): MasterRecord[] => {
    switch (activeTab) {
      case 'companies': return companies
      case 'branches': return branches
      case 'departments': return departments
      case 'designations': return designations
      case 'grades': return grades
      case 'shifts': return shifts
      case 'leave-types': return leaveTypes
      case 'skills': return skills
      case 'document-types': return documentTypes
      case 'policies': return policies
      default: return []
    }
  }, [activeTab, companies, branches, departments, designations, grades, shifts, leaveTypes, skills, documentTypes, policies])

  const currentData = getCurrentData()

  // ── Filtered Data ────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = currentData
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter((item) => {
        const searchable = Object.values(item).filter(v => typeof v === 'string' || typeof v === 'number').map(String).join(' ').toLowerCase()
        return searchable.includes(q)
      })
    }
    if (statusFilter !== 'all') {
      data = data.filter((item) => (item as any).status === statusFilter)
    }
    return data
  }, [currentData, searchQuery, statusFilter])

  // ── Pagination ───────────────────────────────────────────────────────────
  const { page, setPage, totalPages, paginated, resetPage } = usePagination(filteredData, 10)

  // Reset page on filter change
  useEffect(() => { resetPage() }, [searchQuery, statusFilter, activeTab, resetPage])

  // ── Update Data Helper ───────────────────────────────────────────────────
  const updateData = useCallback((newData: MasterRecord[]) => {
    switch (activeTab) {
      case 'companies': setCompanies(newData as CompanyMaster[]); break
      case 'branches': setBranches(newData as BranchMaster[]); break
      case 'departments': setDepartments(newData as DepartmentMaster[]); break
      case 'designations': setDesignations(newData as DesignationMaster[]); break
      case 'grades': setGrades(newData as GradeMaster[]); break
      case 'shifts': setShifts(newData as ShiftMaster[]); break
      case 'leave-types': setLeaveTypes(newData as LeaveTypeMaster[]); break
      case 'skills': setSkills(newData as SkillMaster[]); break
      case 'document-types': setDocumentTypes(newData as DocumentTypeMaster[]); break
      case 'policies': setPolicies(newData as PolicyMaster[]); break
    }
  }, [activeTab])

  // ── Toggle Status ────────────────────────────────────────────────────────
  const toggleStatus = useCallback(async (id: string) => {
    const record = currentData.find((item) => item.id === id)
    if (!record) return
    const newStatus = (record as any).status === 'active' ? 'inactive' : 'active'

    // Try API for companies
    if (activeTab === 'companies') {
      try {
        const res = await fetch(`/api/masters/companies/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (res.ok) {
          const newData = currentData.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          ) as MasterRecord[]
          updateData(newData)
          notifyCompanyChange()
          toast({ title: 'Status Updated', description: 'Company status has been toggled via API.' })
          return
        }
      } catch {
        // Fall back to local
      }
    }

    const newData = currentData.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    ) as MasterRecord[]
    updateData(newData)
    toast({ title: 'Status Updated', description: 'Record status has been toggled.' })
  }, [currentData, updateData, toast, activeTab])

  // ── Delete Record ────────────────────────────────────────────────────────
  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return

    // Try API for companies
    if (activeTab === 'companies') {
      try {
        const res = await fetch(`/api/masters/companies/${deleteConfirm}`, { method: 'DELETE' })
        if (res.ok) {
          const newData = currentData.filter((item) => item.id !== deleteConfirm) as MasterRecord[]
          updateData(newData)
          setDeleteConfirm(null)
          notifyCompanyChange()
          toast({ title: 'Record Deleted', description: 'The company has been removed via API.', variant: 'destructive' })
          return
        }
      } catch {
        // Fall back to local
      }
    }

    const newData = currentData.filter((item) => item.id !== deleteConfirm) as MasterRecord[]
    updateData(newData)
    setDeleteConfirm(null)
    toast({ title: 'Record Deleted', description: 'The record has been removed.', variant: 'destructive' })
  }, [deleteConfirm, currentData, updateData, toast, activeTab])

  // ── Stats ────────────────────────────────────────────────────────────────
  const activeCount = currentData.filter((i: any) => i.status === 'active').length
  const inactiveCount = currentData.filter((i: any) => i.status === 'inactive').length
  const totalCount = currentData.length

  // ── Tab Change Handler ───────────────────────────────────────────────────
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSearchQuery('')
    setStatusFilter('all')
    setAddOpen(false)
    setEditOpen(false)
  }

  // ── Current Tab Config ───────────────────────────────────────────────────
  const currentTabConfig = TABS.find(t => t.key === activeTab)!
  const CurrentTabIcon = currentTabConfig.icon

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <CurrentTabIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Master Management</h1>
              <p className="text-sm text-muted-foreground">Manage all HRMS master data and configurations</p>
            </div>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Add {currentTabConfig.label}
          </Button>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <CurrentTabIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <ToggleRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-xl font-bold text-emerald-600">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <ToggleLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                  <p className="text-xl font-bold text-gray-500">{inactiveCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="mb-4 overflow-x-auto">
            <TabsList className="w-full flex flex-nowrap gap-1 h-auto p-1 bg-white border shadow-sm rounded-lg">
              {TABS.map((tab) => {
                const TabIcon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 whitespace-nowrap"
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split('/')[0]}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* ── Search & Filter Bar ────────────────────────────────────── */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${currentTabConfig.label.toLowerCase()} records...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || statusFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground"
                      onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Data Table ─────────────────────────────────────────────── */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80">
                      {renderTableHeaders(activeTab)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={20} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm font-medium text-muted-foreground">No records found</p>
                            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((record) => renderTableRow(record as any, activeTab))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ── Pagination ──────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, filteredData.length)} of {filteredData.length} records
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? 'default' : 'outline'}
                        size="icon"
                        className={`h-8 w-8 ${p === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        <span className="text-xs">{p}</span>
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Tab Content (for tab routing) ── */}
          {TABS.map(tab => (
            <TabsContent key={tab.key} value={tab.key} className="hidden" />
          ))}
        </Tabs>

        {/* ── Add Dialog ──────────────────────────────────────────────── */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                Add {currentTabConfig.label}
              </DialogTitle>
              <DialogDescription>
                Create a new {currentTabConfig.label.toLowerCase()} record. Fill in all required fields.
              </DialogDescription>
            </DialogHeader>
            {renderForm(activeTab, 'add')}
          </DialogContent>
        </Dialog>

        {/* ── Edit Dialog ─────────────────────────────────────────────── */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-amber-600" />
                Edit {currentTabConfig.label}
              </DialogTitle>
              <DialogDescription>
                Update the {currentTabConfig.label.toLowerCase()} record details.
              </DialogDescription>
            </DialogHeader>
            {renderForm(activeTab, 'edit')}
          </DialogContent>
        </Dialog>

        {/* ── Company Detail Dialog ────────────────────────────────────── */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : detailData ? (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-lg">
                      {detailData.logo ? (
                        <AvatarImage src={detailData.logo} alt={detailData.name} />
                      ) : null}
                      <AvatarFallback className="rounded-lg bg-emerald-100 dark:bg-emerald-950">
                        <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{detailData.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold">{detailData.code}</code>
                        {detailData.legalName && <span className="text-muted-foreground">· {detailData.legalName}</span>}
                        <StatusBadge status={detailData.status as 'active' | 'inactive'} />
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-4">
                  <TabsList className="w-full grid grid-cols-5 h-auto p-1">
                    <TabsTrigger value="info" className="text-xs gap-1"><Building2 className="h-3 w-3" /> Info</TabsTrigger>
                    <TabsTrigger value="policies" className="text-xs gap-1"><FileCheck className="h-3 w-3" /> Policies</TabsTrigger>
                    <TabsTrigger value="payroll" className="text-xs gap-1"><DollarSign className="h-3 w-3" /> Payroll</TabsTrigger>
                    <TabsTrigger value="workflows" className="text-xs gap-1"><Target className="h-3 w-3" /> Workflows</TabsTrigger>
                    <TabsTrigger value="users" className="text-xs gap-1"><Users className="h-3 w-3" /> Users</TabsTrigger>
                  </TabsList>

                  {/* Info Tab */}
                  <TabsContent value="info" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Company Details</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Industry</span><span>{detailData.industry || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">GST/VAT</span><span>{detailData.gstVat || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">PAN/TAN/CIN</span><span>{detailData.panTanCin || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Registration #</span><span>{detailData.registrationNumber || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span>{detailData.domain || '—'}</span></div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Location & Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-right max-w-[200px] truncate">{detailData.address || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">City/State</span><span>{[detailData.city, detailData.state].filter(Boolean).join(', ') || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span>{detailData.country || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{detailData.currency}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Timezone</span><span className="text-right text-xs">{detailData.timezone}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Financial Year</span><span>{detailData.financialYear || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Payroll Cycle</span><span>{detailData.payrollCycle || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Language</span><span>{detailData.defaultLanguage || '—'}</span></div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Hierarchy</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Parent Company</span><span>{detailData.parent?.name || 'None (Top-level)'}</span></div>
                          {detailData.children && detailData.children.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">Child Companies</span>
                              <div className="mt-1 space-y-1">
                                {detailData.children.map(child => (
                                  <div key={child.id} className="flex items-center gap-2 text-xs">
                                    <Building2 className="h-3 w-3 text-emerald-600" />
                                    <span>{child.name}</span>
                                    <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-mono">{child.code}</code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950">
                              <p className="text-2xl font-bold text-emerald-600">{detailData._count?.employees ?? 0}</p>
                              <p className="text-xs text-muted-foreground">Employees</p>
                            </div>
                            <div className="rounded-lg bg-sky-50 p-3 text-center dark:bg-sky-950">
                              <p className="text-2xl font-bold text-sky-600">{detailData._count?.departments ?? 0}</p>
                              <p className="text-xs text-muted-foreground">Departments</p>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-950">
                              <p className="text-2xl font-bold text-amber-600">{detailData._count?.branches ?? 0}</p>
                              <p className="text-xs text-muted-foreground">Branches</p>
                            </div>
                            <div className="rounded-lg bg-violet-50 p-3 text-center dark:bg-violet-950">
                              <p className="text-2xl font-bold text-violet-600">{detailData._count?.users ?? 0}</p>
                              <p className="text-xs text-muted-foreground">Users</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Policies Tab */}
                  <TabsContent value="policies" className="mt-4">
                    {detailData.companyPolicies && detailData.companyPolicies.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Effective Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailData.companyPolicies.map(p => (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.title}</TableCell>
                              <TableCell>{p.category || '—'}</TableCell>
                              <TableCell><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{p.version || '—'}</code></TableCell>
                              <TableCell className="text-xs">{p.effectiveDate ? new Date(p.effectiveDate).toLocaleDateString() : '—'}</TableCell>
                              <TableCell><StatusBadge status={p.status as 'active' | 'inactive'} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <FileCheck className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm">No policies linked to this company</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Payroll Settings Tab */}
                  <TabsContent value="payroll" className="mt-4">
                    {detailData.payrollStructures && detailData.payrollStructures.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Basic Pay</TableHead>
                            <TableHead>HRA</TableHead>
                            <TableHead>DA</TableHead>
                            <TableHead>PF (Employee)</TableHead>
                            <TableHead>Tax Deduction</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailData.payrollStructures.map(ps => (
                            <TableRow key={ps.id}>
                              <TableCell className="font-medium">{ps.name}</TableCell>
                              <TableCell>{formatINR(ps.basicPay)}</TableCell>
                              <TableCell>{ps.hra ? formatINR(ps.hra) : '—'}</TableCell>
                              <TableCell>{ps.da ? formatINR(ps.da) : '—'}</TableCell>
                              <TableCell>{ps.pfEmployee ? formatINR(ps.pfEmployee) : '—'}</TableCell>
                              <TableCell>{ps.taxDeduction ? formatINR(ps.taxDeduction) : '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <DollarSign className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm">No payroll structures linked to this company</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Approval Workflows Tab */}
                  <TabsContent value="workflows" className="mt-4">
                    {detailData.workflowDefs && detailData.workflowDefs.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailData.workflowDefs.map(wf => (
                            <TableRow key={wf.id}>
                              <TableCell className="font-medium">{wf.name}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{wf.type}</Badge></TableCell>
                              <TableCell className="text-xs">{wf.entity}</TableCell>
                              <TableCell>{wf.isActive ? <StatusBadge status="active" /> : <StatusBadge status="inactive" />}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <Target className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm">No approval workflows linked to this company</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* User Access Tab */}
                  <TabsContent value="users" className="mt-4">
                    {detailData.users && detailData.users.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailData.users.map(u => (
                            <TableRow key={u.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs">{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{u.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">{u.email}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs capitalize">{u.role}</Badge></TableCell>
                              <TableCell>{u.isActive ? <StatusBadge status="active" /> : <StatusBadge status="inactive" />}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm">No users linked to this company</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm">Company not found</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ──────────────────────────────────────────── */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this record? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // TABLE HEADERS
  // ──────────────────────────────────────────────────────────────────────────

  function renderTableHeaders(tab: string) {
    switch (tab) {
      case 'companies':
        return (
          <>
            <TableHead className="pl-4">Company Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Industry</TableHead>
            <TableHead className="hidden md:table-cell">City</TableHead>
            <TableHead className="hidden sm:table-cell">Currency</TableHead>
            <TableHead className="hidden lg:table-cell">Payroll Cycle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'branches':
        return (
          <>
            <TableHead className="pl-4">Branch Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead className="hidden md:table-cell">Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'departments':
        return (
          <>
            <TableHead className="pl-4">Department</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead className="hidden md:table-cell">Head</TableHead>
            <TableHead className="hidden lg:table-cell">Cost Center</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'designations':
        return (
          <>
            <TableHead className="pl-4">Designation</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'grades':
        return (
          <>
            <TableHead className="pl-4">Grade</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Salary Band Min</TableHead>
            <TableHead className="hidden md:table-cell">Salary Band Max</TableHead>
            <TableHead className="hidden lg:table-cell">Leave Eligibility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'shifts':
        return (
          <>
            <TableHead className="pl-4">Shift Name</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className="hidden md:table-cell">Break</TableHead>
            <TableHead className="hidden md:table-cell">Overtime</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'leave-types':
        return (
          <>
            <TableHead className="pl-4">Leave Type</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Annual Quota</TableHead>
            <TableHead className="hidden lg:table-cell">Carry Forward</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'skills':
        return (
          <>
            <TableHead className="pl-4">Skill</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Level</TableHead>
            <TableHead className="hidden md:table-cell">Certification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'document-types':
        return (
          <>
            <TableHead className="pl-4">Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Module</TableHead>
            <TableHead className="hidden md:table-cell">Expiry Req.</TableHead>
            <TableHead className="hidden lg:table-cell">Verification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      case 'policies':
        return (
          <>
            <TableHead className="pl-4">Policy Title</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Version</TableHead>
            <TableHead className="hidden lg:table-cell">Effective Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
      default:
        return (
          <>
            <TableHead className="pl-4">Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        )
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TABLE ROWS
  // ──────────────────────────────────────────────────────────────────────────

  function renderTableRow(record: any, tab: string) {
    const renderActions = (id: string) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {tab === 'companies' && (
            <DropdownMenuItem onClick={() => fetchCompanyDetail(id)} className="gap-2">
              <Eye className="h-4 w-4" /> View Details
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => { setEditingRecord(record); setEditOpen(true) }} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleStatus(id)} className="gap-2">
            {record.status === 'active' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
            {record.status === 'active' ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteConfirm(id)} className="gap-2 text-red-600 focus:text-red-600">
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    switch (tab) {
      case 'companies':
        return (
          <TableRow
            key={record.id}
            className="group hover:bg-gray-50/50 cursor-pointer"
            onClick={() => fetchCompanyDetail(record.id)}
          >
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 rounded-lg">
                  {record.logo ? (
                    <AvatarImage src={record.logo} alt={record.name} />
                  ) : null}
                  <AvatarFallback className="rounded-lg bg-emerald-100 dark:bg-emerald-950">
                    <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{record.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{record.legalName || record.city}</p>
                </div>
              </div>
            </TableCell>
            <TableCell><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold">{record.code}</code></TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant="outline" className="text-[11px] font-medium">{record.industryType}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.city}</span></TableCell>
            <TableCell className="hidden sm:table-cell"><span className="text-xs">{record.currency}</span></TableCell>
            <TableCell className="hidden lg:table-cell"><span className="text-xs">{record.payrollCycle}</span></TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'branches':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950">
                  <GitBranch className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{record.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{record.address}</p>
                </div>
              </div>
            </TableCell>
            <TableCell><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold">{record.code}</code></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.company}</span></TableCell>
            <TableCell className="hidden lg:table-cell"><span className="text-xs text-muted-foreground">{record.geoLocation}</span></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.branchManager}</span></TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'departments':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                  <Network className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-sm font-medium">{record.name}</span>
              </div>
            </TableCell>
            <TableCell><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold">{record.code}</code></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.company}</span></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.departmentHead}</span></TableCell>
            <TableCell className="hidden lg:table-cell"><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{record.costCenter}</code></TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'designations':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                  <Award className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-sm font-medium">{record.name}</span>
              </div>
            </TableCell>
            <TableCell><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold">{record.code}</code></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.department}</span></TableCell>
            <TableCell><Badge variant="outline" className="text-[11px]">{record.grade}</Badge></TableCell>
            <TableCell><span className="text-xs font-medium">L{record.level}</span></TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'grades':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-medium">{record.name}</span>
              </div>
            </TableCell>
            <TableCell><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold">{record.code}</code></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{formatINR(record.salaryBandMin)}</span></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{formatINR(record.salaryBandMax)}</span></TableCell>
            <TableCell className="hidden lg:table-cell"><span className="text-xs text-muted-foreground">{record.leaveEligibility}</span></TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'shifts':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-950">
                  <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="text-sm font-medium">{record.name}</span>
              </div>
            </TableCell>
            <TableCell><span className="text-xs font-mono">{record.startTime}</span></TableCell>
            <TableCell><span className="text-xs font-mono">{record.endTime}</span></TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.breakDuration}</span></TableCell>
            <TableCell className="hidden md:table-cell">
              {record.overtimeEligible
                ? <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">Yes</Badge>
                : <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500">No</Badge>
              }
            </TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'leave-types':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                  <CalendarDays className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="text-sm font-medium">{record.name}</span>
              </div>
            </TableCell>
            <TableCell><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-semibold">{record.code}</code></TableCell>
            <TableCell>
              {record.paidUnpaid === 'paid'
                ? <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">Paid</Badge>
                : <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500">Unpaid</Badge>
              }
            </TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-sm font-medium">{record.annualQuota > 0 ? record.annualQuota : 'Unlimited'}</span></TableCell>
            <TableCell className="hidden lg:table-cell"><span className="text-xs text-muted-foreground">{record.carryForwardRule}</span></TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'skills':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                  <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm font-medium">{record.name}</span>
              </div>
            </TableCell>
            <TableCell><Badge variant="outline" className="text-[11px]">{record.category}</Badge></TableCell>
            <TableCell><span className="text-xs">{record.level}</span></TableCell>
            <TableCell className="hidden md:table-cell">
              {record.certificationRequired
                ? <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">Required</Badge>
                : <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500">Not Required</Badge>
              }
            </TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'document-types':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium">{record.name}</span>
              </div>
            </TableCell>
            <TableCell>
              {record.mandatoryOptional === 'mandatory'
                ? <Badge variant="outline" className="text-[10px] border-red-200 text-red-700">Mandatory</Badge>
                : <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-500">Optional</Badge>
              }
            </TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.applicableModule}</span></TableCell>
            <TableCell className="hidden md:table-cell">
              {record.expiryRequired
                ? <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">Yes</Badge>
                : <span className="text-xs text-muted-foreground">No</span>
              }
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {record.verificationRequired
                ? <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">Yes</Badge>
                : <span className="text-xs text-muted-foreground">No</span>
              }
            </TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      case 'policies':
        return (
          <TableRow key={record.id} className="group hover:bg-gray-50/50">
            <TableCell className="pl-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950">
                  <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-sm font-medium">{record.title}</span>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs">{record.company}</span></TableCell>
            <TableCell>
              <Badge variant="outline" className="text-[10px]">{record.category}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell"><span className="text-xs font-mono">v{record.version}</span></TableCell>
            <TableCell className="hidden lg:table-cell"><span className="text-xs">{record.effectiveDate}</span></TableCell>
            <TableCell><StatusBadge status={record.status} /></TableCell>
            <TableCell className="text-right">{renderActions(record.id)}</TableCell>
          </TableRow>
        )
      default:
        return null
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FORM RENDERING
  // ──────────────────────────────────────────────────────────────────────────

  function renderForm(tab: string, mode: 'add' | 'edit') {
    const record = mode === 'edit' ? editingRecord : null

    switch (tab) {
      case 'companies': return <CompanyForm record={record as CompanyMaster | null} mode={mode} />
      case 'branches': return <BranchForm record={record as BranchMaster | null} mode={mode} />
      case 'departments': return <DepartmentForm record={record as DepartmentMaster | null} mode={mode} />
      case 'designations': return <DesignationForm record={record as DesignationMaster | null} mode={mode} />
      case 'grades': return <GradeForm record={record as GradeMaster | null} mode={mode} />
      case 'shifts': return <ShiftForm record={record as ShiftMaster | null} mode={mode} />
      case 'leave-types': return <LeaveTypeForm record={record as LeaveTypeMaster | null} mode={mode} />
      case 'skills': return <SkillForm record={record as SkillMaster | null} mode={mode} />
      case 'document-types': return <DocumentTypeForm record={record as DocumentTypeMaster | null} mode={mode} />
      case 'policies': return <PolicyForm record={record as PolicyMaster | null} mode={mode} />
      default: return null
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INDIVIDUAL FORMS
  // ──────────────────────────────────────────────────────────────────────────

  function CompanyForm({ record, mode }: { record: CompanyMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<CompanyMaster>>(
      mode === 'edit' && record
        ? { ...record }
        : { name: '', legalName: '', code: '', gstVat: '', panTanCin: '', registrationNumber: '', industryType: '', logo: '', address: '', country: 'India', state: '', city: '', currency: 'INR', timezone: 'Asia/Kolkata', financialYear: 'April-March', payrollCycle: 'Monthly', defaultLanguage: 'English', status: 'active', parentId: '' }
    )
    const [savingLocal, setSavingLocal] = useState(false)

    const handleSave = async () => {
      if (!form.name || !form.code) {
        toast({ title: 'Validation Error', description: 'Name and Code are required.', variant: 'destructive' })
        return
      }

      setSavingLocal(true)

      try {
        if (mode === 'add') {
          // Try API first
          try {
            const res = await fetch('/api/masters/companies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.name,
                legalName: form.legalName || null,
                code: form.code,
                gstVat: form.gstVat || null,
                panTanCin: form.panTanCin || null,
                registrationNumber: form.registrationNumber || null,
                industry: form.industryType || null,
                logo: form.logo || null,
                address: form.address || null,
                country: form.country || null,
                state: form.state || null,
                city: form.city || null,
                currency: form.currency || 'USD',
                timezone: form.timezone || 'UTC',
                payrollCycle: form.payrollCycle || null,
                financialYear: form.financialYear || null,
                defaultLanguage: form.defaultLanguage || null,
                status: form.status || 'active',
                parentId: form.parentId || null,
              }),
            })
            if (res.ok) {
              toast({ title: 'Company Added', description: `${form.name} has been created via API.` })
              setAddOpen(false)
              fetchCompanies()
              notifyCompanyChange()
              setSavingLocal(false)
              return
            }
          } catch {
            // Fall back to local
          }

          const newRecord: CompanyMaster = {
            id: genId(), name: form.name || '', legalName: form.legalName || '', code: form.code || '',
            gstVat: form.gstVat || '', panTanCin: form.panTanCin || '', registrationNumber: form.registrationNumber || '',
            industryType: form.industryType || '', logo: form.logo || '', address: form.address || '',
            country: form.country || 'India', state: form.state || '', city: form.city || '',
            currency: form.currency || 'INR', timezone: form.timezone || 'Asia/Kolkata',
            financialYear: form.financialYear || 'April-March', payrollCycle: form.payrollCycle || 'Monthly',
            defaultLanguage: form.defaultLanguage || 'English', status: 'active',
          }
          setCompanies(prev => [...prev, newRecord])
          notifyCompanyChange()
          toast({ title: 'Company Added', description: `${newRecord.name} has been created.` })
          setAddOpen(false)
        } else if (record) {
          // Try API first
          try {
            const res = await fetch(`/api/masters/companies/${record.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.name,
                legalName: form.legalName,
                code: form.code,
                gstVat: form.gstVat,
                panTanCin: form.panTanCin,
                registrationNumber: form.registrationNumber,
                industry: form.industryType,
                logo: form.logo,
                address: form.address,
                country: form.country,
                state: form.state,
                city: form.city,
                currency: form.currency,
                timezone: form.timezone,
                payrollCycle: form.payrollCycle,
                financialYear: form.financialYear,
                defaultLanguage: form.defaultLanguage,
                status: form.status,
                parentId: form.parentId || null,
              }),
            })
            if (res.ok) {
              toast({ title: 'Company Updated', description: `${form.name} has been updated via API.` })
              setEditOpen(false)
              setEditingRecord(null)
              fetchCompanies()
              notifyCompanyChange()
              setSavingLocal(false)
              return
            }
          } catch {
            // Fall back to local
          }

          setCompanies(prev => prev.map(c => c.id === record.id ? { ...c, ...form } as CompanyMaster : c))
          notifyCompanyChange()
          toast({ title: 'Company Updated', description: `${form.name} has been updated.` })
          setEditOpen(false)
          setEditingRecord(null)
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save company.', variant: 'destructive' })
      }

      setSavingLocal(false)
    }

    // Filter other companies for parent selector (exclude self in edit mode)
    const otherCompanies = companies.filter(c => mode === 'add' || c.id !== record?.id)

    return (
      <div className="space-y-6 py-2">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name <span className="text-red-500">*</span></Label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. MARQ AI Technologies" />
            </div>
            <div className="space-y-2">
              <Label>Legal Name</Label>
              <Input value={form.legalName || ''} onChange={e => setForm({ ...form, legalName: e.target.value })} placeholder="Registered legal name" />
            </div>
            <div className="space-y-2">
              <Label>Company Code <span className="text-red-500">*</span></Label>
              <Input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. MARQ" className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label>Industry Type</Label>
              <Select value={form.industryType || ''} onValueChange={v => setForm({ ...form, industryType: v })}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {['Technology', 'Consulting', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Retail', 'Other'].map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-3">
                {form.logo && (
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={form.logo} alt="Logo" />
                    <AvatarFallback className="rounded-lg"><ImageIcon className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
                <Input value={form.logo || ''} onChange={e => setForm({ ...form, logo: e.target.value })} placeholder="Logo URL" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Parent Company</Label>
              <Select value={form.parentId || '__none__'} onValueChange={v => setForm({ ...form, parentId: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="None (Top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (Top-level)</SelectItem>
                  {otherCompanies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Registration & Tax */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <FileCheck className="h-4 w-4" /> Registration & Tax
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GST/VAT Number</Label>
              <Input value={form.gstVat || ''} onChange={e => setForm({ ...form, gstVat: e.target.value })} placeholder="GST Identification Number" />
            </div>
            <div className="space-y-2">
              <Label>PAN/TAN/CIN</Label>
              <Input value={form.panTanCin || ''} onChange={e => setForm({ ...form, panTanCin: e.target.value })} placeholder="PAN/TAN/CIN" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Registration Number</Label>
              <Input value={form.registrationNumber || ''} onChange={e => setForm({ ...form, registrationNumber: e.target.value })} placeholder="Company registration number" />
            </div>
          </div>
        </div>

        {/* Address & Location */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Address & Location
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Textarea value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={form.country || 'India'} onValueChange={v => setForm({ ...form, country: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['India', 'USA', 'UK', 'Australia', 'Singapore', 'UAE', 'Canada', 'Germany', 'Japan'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state || ''} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="State" />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency || 'INR'} onValueChange={v => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED', 'AUD'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select value={form.timezone || 'Asia/Kolkata'} onValueChange={v => setForm({ ...form, timezone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney', 'Asia/Tokyo'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Financial Year</Label>
              <Select value={form.financialYear || 'April-March'} onValueChange={v => setForm({ ...form, financialYear: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['April-March', 'January-December', 'July-June'].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payroll Cycle</Label>
              <Select value={form.payrollCycle || 'Monthly'} onValueChange={v => setForm({ ...form, payrollCycle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Monthly', 'Bi-weekly', 'Weekly'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select value={form.defaultLanguage || 'English'} onValueChange={v => setForm({ ...form, defaultLanguage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi'].map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-7">
              <Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} />
              <Label className="font-normal">
                Status: <span className={form.status === 'active' ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>{form.status === 'active' ? 'Active' : 'Inactive'}</span>
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }} disabled={savingLocal}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700" disabled={savingLocal}>
            {savingLocal && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'add' ? 'Create Company' : 'Update Company'}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  function BranchForm({ record, mode }: { record: BranchMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<BranchMaster>>(
      mode === 'edit' && record
        ? { ...record }
        : { name: '', code: '', company: '', address: '', geoLocation: '', timezone: 'Asia/Kolkata', geofenceRadius: '500m', branchManager: '', status: 'active' }
    )

    const handleSave = () => {
      if (!form.name || !form.code) {
        toast({ title: 'Validation Error', description: 'Branch Name and Code are required.', variant: 'destructive' })
        return
      }
      if (mode === 'add') {
        const newRecord: BranchMaster = { id: genId(), name: form.name || '', code: form.code || '', company: form.company || '', address: form.address || '', geoLocation: form.geoLocation || '', timezone: form.timezone || 'Asia/Kolkata', geofenceRadius: form.geofenceRadius || '500m', branchManager: form.branchManager || '', status: 'active' }
        setBranches(prev => [...prev, newRecord])
        toast({ title: 'Branch Added', description: `${newRecord.name} has been created.` })
        setAddOpen(false)
      } else if (record) {
        setBranches(prev => prev.map(b => b.id === record.id ? { ...b, ...form } as BranchMaster : b))
        toast({ title: 'Branch Updated', description: `${form.name} has been updated.` })
        setEditOpen(false)
        setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Branch Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mumbai HQ" /></div>
          <div className="space-y-2"><Label>Code *</Label><Input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. MUM-HQ" className="uppercase" /></div>
          <div className="space-y-2"><Label>Company</Label><Select value={form.company || ''} onValueChange={v => setForm({ ...form, company: v })}><SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger><SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Branch Manager</Label><Input value={form.branchManager || ''} onChange={e => setForm({ ...form, branchManager: e.target.value })} placeholder="Manager name" /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Textarea value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" rows={2} /></div>
          <div className="space-y-2"><Label>Geo-Location</Label><Input value={form.geoLocation || ''} onChange={e => setForm({ ...form, geoLocation: e.target.value })} placeholder="e.g. 19.0596, 72.8654" /></div>
          <div className="space-y-2"><Label>Timezone</Label><Select value={form.timezone || 'Asia/Kolkata'} onValueChange={v => setForm({ ...form, timezone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Singapore'].map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Geofence Radius</Label><Input value={form.geofenceRadius || ''} onChange={e => setForm({ ...form, geofenceRadius: e.target.value })} placeholder="e.g. 500m" /></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Branch' : 'Update Branch'}</Button>
        </DialogFooter>
      </div>
    )
  }

  function DepartmentForm({ record, mode }: { record: DepartmentMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<DepartmentMaster>>(
      mode === 'edit' && record
        ? { ...record }
        : { name: '', code: '', company: '', parentDepartment: '-', departmentHead: '', costCenter: '', status: 'active' }
    )

    const handleSave = () => {
      if (!form.name || !form.code) { toast({ title: 'Validation Error', description: 'Department Name and Code are required.', variant: 'destructive' }); return }
      if (mode === 'add') {
        const newRecord: DepartmentMaster = { id: genId(), name: form.name || '', code: form.code || '', company: form.company || '', parentDepartment: form.parentDepartment || '-', departmentHead: form.departmentHead || '', costCenter: form.costCenter || '', status: 'active' }
        setDepartments(prev => [...prev, newRecord])
        toast({ title: 'Department Added', description: `${newRecord.name} has been created.` })
        setAddOpen(false)
      } else if (record) {
        setDepartments(prev => prev.map(d => d.id === record.id ? { ...d, ...form } as DepartmentMaster : d))
        toast({ title: 'Department Updated', description: `${form.name} has been updated.` })
        setEditOpen(false); setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Department Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engineering" /></div>
          <div className="space-y-2"><Label>Code *</Label><Input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. ENG" className="uppercase" /></div>
          <div className="space-y-2"><Label>Company</Label><Select value={form.company || ''} onValueChange={v => setForm({ ...form, company: v })}><SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger><SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Parent Department</Label><Select value={form.parentDepartment || '-'} onValueChange={v => setForm({ ...form, parentDepartment: v })}><SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger><SelectContent><SelectItem value="-">None (Top-level)</SelectItem>{departments.filter(d => d.id !== record?.id).map(d => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Department Head</Label><Input value={form.departmentHead || ''} onChange={e => setForm({ ...form, departmentHead: e.target.value })} placeholder="Head name" /></div>
          <div className="space-y-2"><Label>Cost Center</Label><Input value={form.costCenter || ''} onChange={e => setForm({ ...form, costCenter: e.target.value })} placeholder="e.g. CC-ENG-001" /></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Department' : 'Update Department'}</Button>
        </DialogFooter>
      </div>
    )
  }

  function DesignationForm({ record, mode }: { record: DesignationMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<DesignationMaster>>(mode === 'edit' && record ? { ...record } : { name: '', code: '', department: '', grade: 'E1', level: 1, jobDescription: '', status: 'active' })

    const handleSave = () => {
      if (!form.name || !form.code) { toast({ title: 'Validation Error', description: 'Designation Name and Code are required.', variant: 'destructive' }); return }
      if (mode === 'add') {
        const newRecord: DesignationMaster = { id: genId(), name: form.name || '', code: form.code || '', department: form.department || '', grade: form.grade || 'E1', level: form.level || 1, jobDescription: form.jobDescription || '', status: 'active' }
        setDesignations(prev => [...prev, newRecord]); toast({ title: 'Designation Added', description: `${newRecord.name} has been created.` }); setAddOpen(false)
      } else if (record) {
        setDesignations(prev => prev.map(d => d.id === record.id ? { ...d, ...form } as DesignationMaster : d)); toast({ title: 'Designation Updated', description: `${form.name} has been updated.` }); setEditOpen(false); setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Designation Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Software Engineer" /></div>
          <div className="space-y-2"><Label>Code *</Label><Input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SE" className="uppercase" /></div>
          <div className="space-y-2"><Label>Department</Label><Select value={form.department || ''} onValueChange={v => setForm({ ...form, department: v })}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Grade</Label><Select value={form.grade || 'E1'} onValueChange={v => setForm({ ...form, grade: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{grades.map(g => <SelectItem key={g.id} value={g.code}>{g.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Level</Label><Input type="number" min={1} max={10} value={form.level || 1} onChange={e => setForm({ ...form, level: parseInt(e.target.value) || 1 })} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Job Description</Label><Textarea value={form.jobDescription || ''} onChange={e => setForm({ ...form, jobDescription: e.target.value })} placeholder="Describe the role responsibilities" rows={3} /></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Designation' : 'Update Designation'}</Button>
        </DialogFooter>
      </div>
    )
  }

  function GradeForm({ record, mode }: { record: GradeMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<GradeMaster>>(mode === 'edit' && record ? { ...record } : { name: '', code: '', salaryBandMin: 0, salaryBandMax: 0, leaveEligibility: '', benefitsEligibility: '', approvalLevel: 1, status: 'active' })

    const handleSave = () => {
      if (!form.name || !form.code) { toast({ title: 'Validation Error', description: 'Grade Name and Code are required.', variant: 'destructive' }); return }
      if (mode === 'add') {
        const newRecord: GradeMaster = { id: genId(), name: form.name || '', code: form.code || '', salaryBandMin: form.salaryBandMin || 0, salaryBandMax: form.salaryBandMax || 0, leaveEligibility: form.leaveEligibility || '', benefitsEligibility: form.benefitsEligibility || '', approvalLevel: form.approvalLevel || 1, status: 'active' }
        setGrades(prev => [...prev, newRecord]); toast({ title: 'Grade Added', description: `${newRecord.name} has been created.` }); setAddOpen(false)
      } else if (record) {
        setGrades(prev => prev.map(g => g.id === record.id ? { ...g, ...form } as GradeMaster : g)); toast({ title: 'Grade Updated', description: `${form.name} has been updated.` }); setEditOpen(false); setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Grade Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. E1 - Junior" /></div>
          <div className="space-y-2"><Label>Code *</Label><Input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. E1" className="uppercase" /></div>
          <div className="space-y-2"><Label>Salary Band Min (INR)</Label><Input type="number" value={form.salaryBandMin || 0} onChange={e => setForm({ ...form, salaryBandMin: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label>Salary Band Max (INR)</Label><Input type="number" value={form.salaryBandMax || 0} onChange={e => setForm({ ...form, salaryBandMax: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label>Leave Eligibility</Label><Input value={form.leaveEligibility || ''} onChange={e => setForm({ ...form, leaveEligibility: e.target.value })} placeholder="e.g. 18 days/year" /></div>
          <div className="space-y-2"><Label>Benefits Eligibility</Label><Input value={form.benefitsEligibility || ''} onChange={e => setForm({ ...form, benefitsEligibility: e.target.value })} placeholder="e.g. Basic Health" /></div>
          <div className="space-y-2"><Label>Approval Level</Label><Input type="number" min={1} max={10} value={form.approvalLevel || 1} onChange={e => setForm({ ...form, approvalLevel: parseInt(e.target.value) || 1 })} /></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Grade' : 'Update Grade'}</Button>
        </DialogFooter>
      </div>
    )
  }

  function ShiftForm({ record, mode }: { record: ShiftMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<ShiftMaster>>(mode === 'edit' && record ? { ...record } : { name: '', startTime: '09:00', endTime: '18:00', breakDuration: '60 min', graceTime: '15 min', lateMarkRule: 'After grace period', overtimeEligible: true, weeklyOff: 'Saturday, Sunday', status: 'active' })

    const handleSave = () => {
      if (!form.name) { toast({ title: 'Validation Error', description: 'Shift Name is required.', variant: 'destructive' }); return }
      if (mode === 'add') {
        const newRecord: ShiftMaster = { id: genId(), name: form.name || '', startTime: form.startTime || '09:00', endTime: form.endTime || '18:00', breakDuration: form.breakDuration || '60 min', graceTime: form.graceTime || '15 min', lateMarkRule: form.lateMarkRule || '', overtimeEligible: form.overtimeEligible ?? true, weeklyOff: form.weeklyOff || 'Sunday', status: 'active' }
        setShifts(prev => [...prev, newRecord]); toast({ title: 'Shift Added', description: `${newRecord.name} has been created.` }); setAddOpen(false)
      } else if (record) {
        setShifts(prev => prev.map(s => s.id === record.id ? { ...s, ...form } as ShiftMaster : s)); toast({ title: 'Shift Updated', description: `${form.name} has been updated.` }); setEditOpen(false); setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Shift Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. General Shift" /></div>
          <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={form.startTime || '09:00'} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
          <div className="space-y-2"><Label>End Time</Label><Input type="time" value={form.endTime || '18:00'} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
          <div className="space-y-2"><Label>Break Duration</Label><Input value={form.breakDuration || ''} onChange={e => setForm({ ...form, breakDuration: e.target.value })} placeholder="e.g. 60 min" /></div>
          <div className="space-y-2"><Label>Grace Time</Label><Input value={form.graceTime || ''} onChange={e => setForm({ ...form, graceTime: e.target.value })} placeholder="e.g. 15 min" /></div>
          <div className="space-y-2"><Label>Late Mark Rule</Label><Input value={form.lateMarkRule || ''} onChange={e => setForm({ ...form, lateMarkRule: e.target.value })} placeholder="e.g. After 15 min grace" /></div>
          <div className="space-y-2"><Label>Weekly Off</Label><Input value={form.weeklyOff || ''} onChange={e => setForm({ ...form, weeklyOff: e.target.value })} placeholder="e.g. Saturday, Sunday" /></div>
          <div className="space-y-2 flex items-center gap-3 pt-6"><Switch checked={form.overtimeEligible ?? true} onCheckedChange={v => setForm({ ...form, overtimeEligible: v })} /><Label>Overtime Eligible</Label></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Shift' : 'Update Shift'}</Button>
        </DialogFooter>
      </div>
    )
  }

  function LeaveTypeForm({ record, mode }: { record: LeaveTypeMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<LeaveTypeMaster>>(mode === 'edit' && record ? { ...record } : { name: '', code: '', paidUnpaid: 'paid', annualQuota: 0, accrualRule: '', carryForwardRule: '', encashmentRule: '', applicableGender: 'All', applicableEmploymentType: 'Full-time', approvalRequired: true, attachmentRequired: false, status: 'active' })

    const handleSave = () => {
      if (!form.name || !form.code) { toast({ title: 'Validation Error', description: 'Leave Type Name and Code are required.', variant: 'destructive' }); return }
      if (mode === 'add') {
        const newRecord: LeaveTypeMaster = { id: genId(), name: form.name || '', code: form.code || '', paidUnpaid: form.paidUnpaid || 'paid', annualQuota: form.annualQuota || 0, accrualRule: form.accrualRule || '', carryForwardRule: form.carryForwardRule || '', encashmentRule: form.encashmentRule || '', applicableGender: form.applicableGender || 'All', applicableEmploymentType: form.applicableEmploymentType || 'Full-time', approvalRequired: form.approvalRequired ?? true, attachmentRequired: form.attachmentRequired ?? false, status: 'active' }
        setLeaveTypes(prev => [...prev, newRecord]); toast({ title: 'Leave Type Added', description: `${newRecord.name} has been created.` }); setAddOpen(false)
      } else if (record) {
        setLeaveTypes(prev => prev.map(l => l.id === record.id ? { ...l, ...form } as LeaveTypeMaster : l)); toast({ title: 'Leave Type Updated', description: `${form.name} has been updated.` }); setEditOpen(false); setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Leave Type Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Casual Leave" /></div>
          <div className="space-y-2"><Label>Code *</Label><Input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. CL" className="uppercase" /></div>
          <div className="space-y-2"><Label>Paid/Unpaid</Label><Select value={form.paidUnpaid || 'paid'} onValueChange={v => setForm({ ...form, paidUnpaid: v as 'paid' | 'unpaid' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">Paid</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Annual Quota (days)</Label><Input type="number" min={0} value={form.annualQuota || 0} onChange={e => setForm({ ...form, annualQuota: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-2"><Label>Accrual Rule</Label><Input value={form.accrualRule || ''} onChange={e => setForm({ ...form, accrualRule: e.target.value })} placeholder="e.g. 1 per month" /></div>
          <div className="space-y-2"><Label>Carry Forward Rule</Label><Input value={form.carryForwardRule || ''} onChange={e => setForm({ ...form, carryForwardRule: e.target.value })} placeholder="e.g. Max 3 days" /></div>
          <div className="space-y-2"><Label>Encashment Rule</Label><Input value={form.encashmentRule || ''} onChange={e => setForm({ ...form, encashmentRule: e.target.value })} placeholder="e.g. Not allowed" /></div>
          <div className="space-y-2"><Label>Applicable Gender</Label><Select value={form.applicableGender || 'All'} onValueChange={v => setForm({ ...form, applicableGender: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['All', 'Male', 'Female'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Applicable Employment Type</Label><Select value={form.applicableEmploymentType || 'Full-time'} onValueChange={v => setForm({ ...form, applicableEmploymentType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['All', 'Full-time', 'Part-time', 'Contract', 'Intern'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2 flex items-center gap-3 pt-6"><Switch checked={form.approvalRequired ?? true} onCheckedChange={v => setForm({ ...form, approvalRequired: v })} /><Label>Approval Required</Label></div>
          <div className="space-y-2 flex items-center gap-3 pt-6"><Switch checked={form.attachmentRequired ?? false} onCheckedChange={v => setForm({ ...form, attachmentRequired: v })} /><Label>Attachment Required</Label></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Leave Type' : 'Update Leave Type'}</Button>
        </DialogFooter>
      </div>
    )
  }

  function SkillForm({ record, mode }: { record: SkillMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<SkillMaster>>(mode === 'edit' && record ? { ...record } : { name: '', category: '', level: 'Intermediate', certificationRequired: false, status: 'active' })

    const handleSave = () => {
      if (!form.name) { toast({ title: 'Validation Error', description: 'Skill Name is required.', variant: 'destructive' }); return }
      if (mode === 'add') {
        const newRecord: SkillMaster = { id: genId(), name: form.name || '', category: form.category || '', level: form.level || 'Intermediate', certificationRequired: form.certificationRequired ?? false, status: 'active' }
        setSkills(prev => [...prev, newRecord]); toast({ title: 'Skill Added', description: `${newRecord.name} has been created.` }); setAddOpen(false)
      } else if (record) {
        setSkills(prev => prev.map(s => s.id === record.id ? { ...s, ...form } as SkillMaster : s)); toast({ title: 'Skill Updated', description: `${form.name} has been updated.` }); setEditOpen(false); setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Skill Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. React" /></div>
          <div className="space-y-2"><Label>Category</Label><Select value={form.category || ''} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'AI/ML', 'Analytics', 'Management', 'Soft Skills'].map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Level</Label><Select value={form.level || 'Intermediate'} onValueChange={v => setForm({ ...form, level: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2 flex items-center gap-3 pt-6"><Switch checked={form.certificationRequired ?? false} onCheckedChange={v => setForm({ ...form, certificationRequired: v })} /><Label>Certification Required</Label></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Skill' : 'Update Skill'}</Button>
        </DialogFooter>
      </div>
    )
  }

  function DocumentTypeForm({ record, mode }: { record: DocumentTypeMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState<Partial<DocumentTypeMaster>>(mode === 'edit' && record ? { ...record } : { name: '', mandatoryOptional: 'mandatory', applicableModule: 'Onboarding', expiryRequired: false, verificationRequired: true, status: 'active' })

    const handleSave = () => {
      if (!form.name) { toast({ title: 'Validation Error', description: 'Document Name is required.', variant: 'destructive' }); return }
      if (mode === 'add') {
        const newRecord: DocumentTypeMaster = { id: genId(), name: form.name || '', mandatoryOptional: form.mandatoryOptional || 'mandatory', applicableModule: form.applicableModule || 'Onboarding', expiryRequired: form.expiryRequired ?? false, verificationRequired: form.verificationRequired ?? true, status: 'active' }
        setDocumentTypes(prev => [...prev, newRecord]); toast({ title: 'Document Type Added', description: `${newRecord.name} has been created.` }); setAddOpen(false)
      } else if (record) {
        setDocumentTypes(prev => prev.map(d => d.id === record.id ? { ...d, ...form } as DocumentTypeMaster : d)); toast({ title: 'Document Type Updated', description: `${form.name} has been updated.` }); setEditOpen(false); setEditingRecord(null)
      }
    }

    return (
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Document Name *</Label><Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Offer Letter" /></div>
          <div className="space-y-2"><Label>Mandatory/Optional</Label><Select value={form.mandatoryOptional || 'mandatory'} onValueChange={v => setForm({ ...form, mandatoryOptional: v as 'mandatory' | 'optional' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mandatory">Mandatory</SelectItem><SelectItem value="optional">Optional</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Applicable Module</Label><Select value={form.applicableModule || 'Onboarding'} onValueChange={v => setForm({ ...form, applicableModule: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Onboarding', 'Payroll', 'Attendance', 'Employee', 'Compliance', 'General'].map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2 flex items-center gap-3 pt-6"><Switch checked={form.expiryRequired ?? false} onCheckedChange={v => setForm({ ...form, expiryRequired: v })} /><Label>Expiry Required</Label></div>
          <div className="space-y-2 flex items-center gap-3 pt-6"><Switch checked={form.verificationRequired ?? true} onCheckedChange={v => setForm({ ...form, verificationRequired: v })} /><Label>Verification Required</Label></div>
          {mode === 'edit' && (<div className="space-y-2 flex items-center gap-3"><Label>Status</Label><Switch checked={form.status === 'active'} onCheckedChange={v => setForm({ ...form, status: v ? 'active' : 'inactive' })} /><span className="text-sm">{form.status === 'active' ? 'Active' : 'Inactive'}</span></div>)}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (mode === 'add') setAddOpen(false); else setEditOpen(false); setEditingRecord(null) }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">{mode === 'add' ? 'Create Document Type' : 'Update Document Type'}</Button>
        </DialogFooter>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POLICY FORM
  // ──────────────────────────────────────────────────────────────────────────

  function PolicyForm({ record, mode }: { record: PolicyMaster | null; mode: 'add' | 'edit' }) {
    const [form, setForm] = useState({
      title: record?.title || '',
      company: record?.company || '',
      category: record?.category || 'HR',
      version: record?.version || '1.0',
      effectiveDate: record?.effectiveDate || new Date().toISOString().split('T')[0],
      status: record?.status || 'draft' as 'active' | 'inactive' | 'draft',
    })

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Policy Title *</Label>
            <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter policy title" />
          </div>
          <div className="space-y-2">
            <Label>Company *</Label>
            <Select value={form.company} onValueChange={(v) => setForm(f => ({ ...f, company: v }))}>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {companies.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Version</Label>
            <Input value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} placeholder="e.g. 1.0" />
          </div>
          <div className="space-y-2">
            <Label>Effective Date</Label>
            <Input type="date" value={form.effectiveDate} onChange={(e) => setForm(f => ({ ...f, effectiveDate: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: any) => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { addOpen ? setAddOpen(false) : setEditOpen(false) }}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={!form.title || !form.company}
            onClick={() => {
              const newRecord: PolicyMaster = {
                id: record?.id || genId(),
                ...form,
              }
              if (mode === 'add') {
                updateData([...currentData, newRecord] as MasterRecord[])
                setAddOpen(false)
                toast({ title: 'Policy Created', description: `${form.title} has been created successfully.` })
              } else {
                const newData = currentData.map(r => r.id === newRecord.id ? newRecord : r) as MasterRecord[]
                updateData(newData)
                setEditOpen(false)
                toast({ title: 'Policy Updated', description: `${form.title} has been updated successfully.` })
              }
            }}
          >
            {mode === 'add' ? 'Create Policy' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </div>
    )
  }
}
