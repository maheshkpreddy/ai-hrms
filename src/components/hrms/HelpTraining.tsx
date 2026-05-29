'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Search,
  Play,
  BookOpen,
  ExternalLink,
  Clock,
  Users,
  Filter,
  X,
  ChevronRight,
  HelpCircle,
  FileText,
  Sparkles,
  LayoutDashboard,
  GraduationCap,
  TrendingUp,
  Briefcase,
  Banknote,
  Clock3,
  Brain,
  CheckCircle2,
  ArrowRight,
  Github,
  Mail,
  Phone,
  Lightbulb,
  Star,
  Calendar,
  ChevronLeft,
  Maximize,
  Video,
  List,
  MonitorPlay,
  RotateCcw,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoTutorial {
  id: string
  title: string
  description: string
  category: string
  role: string[]
  duration: string
  steps: string[] // Step-by-step tutorial instructions
  thumbnail: string
  videoUrl?: string // URL to actual video file
  thumbnailUrl?: string // URL to thumbnail image
}

// ─── Video URL Base ───────────────────────────────────────────────────────────

const VIDEO_BASE_URL = 'https://raw.githubusercontent.com/maheshkpreddy/ai-hrms/main/docs/training/videos'

// ─── Video Data ───────────────────────────────────────────────────────────────

export const videoTutorials: VideoTutorial[] = [
  // Dashboard & Navigation (3 videos)
  {
    id: 'dash-1',
    title: 'Getting Started with eh2r AI Dashboard',
    description: 'Learn how to navigate the main dashboard, understand key metrics, and customize your view for maximum productivity.',
    category: 'Dashboard & Navigation',
    role: ['all'],
    duration: '8:24',
    steps: [
      'Log in with your company code and credentials',
      'The dashboard shows key HR metrics at a glance — headcount, attendance, pending approvals',
      'Use the sidebar to navigate between modules like Employees, Attendance, Payroll',
      'Click Home to see all available modules in a card-based layout',
      'Use the search bar at the top to quickly find any module or employee',
      'Check the notification bell for pending approvals and system alerts',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/dashboard/dash-1.mp4`,
  },
  {
    id: 'dash-2',
    title: 'Admin Dashboard Deep Dive',
    description: 'Comprehensive walkthrough of the admin dashboard including system health, user analytics, and configuration options.',
    category: 'Dashboard & Navigation',
    role: ['admin'],
    duration: '12:15',
    steps: [
      'Access the Admin Dashboard from the sidebar after logging in as Super Admin',
      'View system health indicators — uptime, API response times, and error rates',
      'Monitor user analytics including active sessions, login trends, and feature usage',
      'Configure global settings from Settings — company details, branding, and notifications',
      'Use the RBAC module to manage roles and permissions across the organization',
      'Review audit logs to track all system-level changes and user actions',
      'Set up data backup schedules and review storage usage from System Settings',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/dashboard/dash-2.mp4`,
  },
  {
    id: 'dash-3',
    title: 'Customizing Your Dashboard Layout',
    description: 'Personalize your dashboard widgets, arrange modules, and set up quick-access shortcuts for your daily workflow.',
    category: 'Dashboard & Navigation',
    role: ['admin', 'hr', 'manager', 'employee'],
    duration: '6:42',
    steps: [
      'Click the "Customize" button at the top-right of your dashboard',
      'Drag and drop widgets to rearrange your dashboard layout',
      'Add or remove widget cards — attendance, leave balance, team overview, tasks',
      'Set up quick-access shortcuts for your most-used modules',
      'Save your layout — it persists across sessions and devices',
      'Reset to default layout anytime from the Customize panel',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/dashboard/dash-3.mp4`,
  },

  // Employee Management (3 videos)
  {
    id: 'emp-1',
    title: 'Adding & Onboarding New Employees',
    description: 'Step-by-step guide to adding new employees, configuring their profiles, and managing the onboarding process.',
    category: 'Employee Management',
    role: ['admin', 'hr'],
    duration: '10:30',
    steps: [
      'Navigate to Employees module and click "Add Employee"',
      'Fill in personal details — name, email, phone, date of birth, and address',
      'Enter employment details — department, designation, join date, and contract type',
      'Assign a shift, grade, and reporting manager',
      'Upload required documents — ID proof, offer letter, education certificates',
      'Configure compensation — salary structure, bank details, PF and ESI information',
      'Send onboarding welcome email with login credentials and checklist',
      'Track onboarding progress from the Employee Detail page → Onboarding tab',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/employees/emp-1.mp4`,
  },
  {
    id: 'emp-2',
    title: 'Managing Employee Records & Documents',
    description: 'How to update employee information, upload documents, and maintain accurate records in the system.',
    category: 'Employee Management',
    role: ['admin', 'hr'],
    duration: '9:15',
    steps: [
      'Go to Employees module and search for the employee by name or ID',
      'Click on the employee card to open their detailed profile',
      'Edit personal information using the "Edit" button on each section',
      'Navigate to the Documents tab to upload, view, or replace documents',
      'Set document access levels — public, HR-only, manager, or private',
      'Track document expiry dates and receive automated reminders',
      'Use bulk actions to update multiple employee records simultaneously',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/employees/emp-2.mp4`,
  },
  {
    id: 'emp-3',
    title: 'Department & Team Structure Setup',
    description: 'Configure organizational hierarchy, departments, reporting structures, and team assignments.',
    category: 'Employee Management',
    role: ['admin', 'hr', 'manager'],
    duration: '7:50',
    steps: [
      'Navigate to Settings → Organization → Departments',
      'Create departments with name, head, description, and budget allocation',
      'Assign employees to departments from the employee profile or bulk assign',
      'Set up reporting structures — define who reports to whom',
      'Configure branch locations with geofence settings for attendance',
      'Review the org chart from the Organization module to visualize hierarchy',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/employees/emp-3.mp4`,
  },

  // Time & Attendance (3 videos)
  {
    id: 'att-1',
    title: 'Setting Up Shifts & Work Schedules',
    description: 'Configure shift patterns, work schedules, and rotation rules for your organization.',
    category: 'Time & Attendance',
    role: ['admin', 'hr', 'manager'],
    duration: '11:05',
    steps: [
      'Go to Attendance → Shifts to create and manage shifts',
      'Define shift timing — start time, end time, and grace period for late check-ins',
      'Create shift rotations for teams that work in rotating schedules',
      'Assign shifts to employees individually or by department',
      'Configure geofence settings for each branch office location',
      'Set up overtime rules — thresholds, rates, and approval requirements',
      'Test the shift configuration by checking in from the employee portal',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/attendance/att-1.mp4`,
  },
  {
    id: 'att-2',
    title: 'Daily Attendance Tracking & Check-In',
    description: 'Learn how employees check in/out, how managers track attendance, and how to handle exceptions.',
    category: 'Time & Attendance',
    role: ['all'],
    duration: '6:18',
    steps: [
      'Employees check in from the Attendance module — click "Check In" button',
      'The system records location, time, and IP address automatically',
      'Check out at the end of the day — total hours are calculated automatically',
      'View your attendance history in the "My Attendance" section',
      'Managers can view team attendance from Attendance → Team View',
      'Handle exceptions — approve late check-ins, regularize missed punches',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/attendance/att-2.mp4`,
  },
  {
    id: 'att-3',
    title: 'Holiday Calendar & Leave Policies',
    description: 'Set up company holidays, configure leave policies, and manage holiday calendars across branches.',
    category: 'Time & Attendance',
    role: ['admin', 'hr'],
    duration: '8:33',
    steps: [
      'Navigate to Attendance → Holidays to set up the holiday calendar',
      'Add holidays — national, company-specific, and optional holidays',
      'Assign holiday calendars per branch for multi-location organizations',
      'Configure leave types from Settings → Leave Types — CL, SL, EL, ML, PL',
      'Set annual quotas, accrual rules, and carry-forward policies per leave type',
      'Define approval workflows for leave requests',
      'Preview the holiday calendar and share with employees',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/attendance/att-3.mp4`,
  },

  // Leave Management (2 videos)
  {
    id: 'leave-1',
    title: 'Applying for Leave & Tracking Balances',
    description: 'Complete guide for employees on applying for leave, checking balances, and understanding leave types.',
    category: 'Leave Management',
    role: ['employee', 'manager'],
    duration: '5:45',
    steps: [
      'Go to Self-Service → My Leaves → "Apply for Leave"',
      'Select the leave type — Casual, Sick, Earned, Maternity, or Paternity',
      'Choose the start and end dates — the system auto-calculates working days',
      'Add a reason and attach supporting documents if required',
      'Review your leave balance before submitting — available, used, and pending',
      'Track your leave application status from the "My Leaves" dashboard',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/leave/leave-1.mp4`,
  },
  {
    id: 'leave-2',
    title: 'Leave Approval Workflow & Policies',
    description: 'How managers and HR admins approve/reject leave requests, configure approval chains, and set leave policies.',
    category: 'Leave Management',
    role: ['admin', 'hr', 'manager'],
    duration: '7:22',
    steps: [
      'Managers receive leave approval notifications via bell icon and email',
      'Navigate to Leaves → Approvals to see pending leave requests',
      'Review the leave details — type, dates, reason, and team calendar impact',
      'Approve or reject with comments — the employee gets notified instantly',
      'HR admins can override approvals and manage leave policy exceptions',
      'Configure multi-level approval chains from Settings → Workflow → Leave Approval',
      'Run leave reports to analyze patterns and plan workforce coverage',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/leave/leave-2.mp4`,
  },

  // Payroll & Expenses (3 videos)
  {
    id: 'pay-1',
    title: 'Processing Monthly Payroll',
    description: 'End-to-end walkthrough of running payroll, verifying calculations, and generating payslips for all employees.',
    category: 'Payroll & Expenses',
    role: ['admin', 'hr'],
    duration: '14:10',
    steps: [
      'Navigate to Payroll → Run Payroll and select the month/year',
      'Review employee list — active, new joiners, and exited employees are flagged',
      'Verify salary components — basic, HRA, DA, conveyance, and medical allowances',
      'Check deductions — PF, ESI, TDS, professional tax, and loan recoveries',
      'Apply bonuses, incentives, or arrears for the month',
      'Run the payroll calculation engine — the system processes all components',
      'Review the payroll summary — total gross pay, deductions, and net pay',
      'Lock and disburse payroll — generate payslips and send via email',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/payroll/pay-1.mp4`,
  },
  {
    id: 'pay-2',
    title: 'Expense Claims & Reimbursements',
    description: 'Submit, approve, and process employee expense claims with receipt uploads and policy validation.',
    category: 'Payroll & Expenses',
    role: ['all'],
    duration: '8:55',
    steps: [
      'Go to Payroll → Expenses → "New Expense Claim"',
      'Select the expense category — travel, food, accommodation, equipment, or other',
      'Enter the amount, date, and description of the expense',
      'Upload receipt or proof of purchase (image/PDF)',
      'Submit for approval — the claim goes to your reporting manager',
      'Managers review and approve/reject claims from the Approvals dashboard',
      'Approved expenses are automatically included in the next payroll cycle',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/payroll/pay-2.mp4`,
  },
  {
    id: 'pay-3',
    title: 'Tax Configuration & Compliance Reports',
    description: 'Set up tax slabs, deductions, and generate compliance reports for statutory filings.',
    category: 'Payroll & Expenses',
    role: ['admin', 'hr'],
    duration: '11:30',
    steps: [
      'Navigate to Payroll → Settings → Tax Configuration',
      'Configure TDS slabs based on the current income tax regime',
      'Set up PF contribution rates — employee and employer shares',
      'Configure ESI rates and salary thresholds',
      'Define professional tax slabs for your state',
      'Generate statutory compliance reports — PF ECR, ESI, TDS, and PT returns',
      'Download reports in the required format for government portal uploads',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/payroll/pay-3.mp4`,
  },

  // Recruitment & Talent (3 videos)
  {
    id: 'rec-1',
    title: 'Creating Job Postings & Sourcing',
    description: 'Create compelling job postings, publish to multiple channels, and use AI-powered candidate sourcing.',
    category: 'Recruitment & Talent',
    role: ['admin', 'hr', 'manager'],
    duration: '9:40',
    steps: [
      'Go to Recruitment → Jobs → "Create Job Posting"',
      'Fill in job details — title, department, location, employment type, and experience',
      'Set salary range and add a compelling job description',
      'Define required skills — the AI uses these for candidate matching',
      'Publish the job to internal portal, job boards, and social channels',
      'Create a manpower requisition for budget approval before posting',
      'Track application sources to measure channel effectiveness',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/recruitment/rec-1.mp4`,
  },
  {
    id: 'rec-2',
    title: 'Interview Scheduling & Evaluation',
    description: 'Schedule interviews, set up evaluation panels, and use structured scorecards for candidate assessment.',
    category: 'Recruitment & Talent',
    role: ['admin', 'hr', 'manager'],
    duration: '10:15',
    steps: [
      'From a candidate profile, click "Schedule Interview"',
      'Select interview type — AI interview, phone screen, or in-person panel',
      'Set date, time, and duration — invite panel members with calendar integration',
      'For AI interviews, the system generates role-specific questions automatically',
      'Conduct the interview and fill in the structured scorecard',
      'Rate the candidate on skills, culture fit, and overall recommendation',
      'Collaborate with panel members — all scores are aggregated for a final decision',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/recruitment/rec-2.mp4`,
  },
  {
    id: 'rec-3',
    title: 'AI-Powered Candidate Screening',
    description: 'Leverage AI to screen resumes, rank candidates, and identify the best matches for your open positions.',
    category: 'Recruitment & Talent',
    role: ['admin', 'hr'],
    duration: '7:50',
    steps: [
      'Navigate to Recruitment → Candidates for any open job posting',
      'The AI automatically scores each candidate with a Fit Score (0-100)',
      'Review the AI-generated score breakdown — skills match, experience, education',
      'Filter candidates by AI score threshold to shortlist top talent',
      'Click "AI Interview" to launch an automated screening interview',
      'Review AI interview results — question responses, scores, and recommendations',
      'Shortlist or reject candidates based on AI insights and human judgment',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/recruitment/rec-3.mp4`,
  },

  // Performance Management (2 videos)
  {
    id: 'perf-1',
    title: 'Setting Up Performance Review Cycles',
    description: 'Configure review periods, KPIs, goals, and 360-degree feedback workflows for your team.',
    category: 'Performance Management',
    role: ['admin', 'hr', 'manager'],
    duration: '11:20',
    steps: [
      'Go to Performance → Settings → "Create Review Cycle"',
      'Define the review period — quarterly, half-yearly, or annual',
      'Set up KPI templates for different departments and roles',
      'Configure 360-degree feedback — self, manager, peer, and reportee reviews',
      'Assign reviewers and set deadlines for each review stage',
      'Enable AI-powered attrition risk scoring for each employee',
      'Launch the review cycle — employees and managers receive notifications',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/performance/perf-1.mp4`,
  },
  {
    id: 'perf-2',
    title: 'Goals, OKRs & Continuous Feedback',
    description: 'Set individual and team goals, track OKR progress, and give continuous feedback throughout the review cycle.',
    category: 'Performance Management',
    role: ['manager', 'employee'],
    duration: '8:45',
    steps: [
      'Navigate to Performance → My Goals → "Add Goal"',
      'Create SMART goals aligned with team and company OKRs',
      'Set measurable key results with target values and deadlines',
      'Track progress by updating key result values regularly',
      'Use the continuous feedback feature to give real-time praise or coaching',
      'Managers can review goal progress and provide feedback anytime',
      'At review time, goals and feedback are auto-aggregated into the review form',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/performance/perf-2.mp4`,
  },

  // Learning & Development (2 videos)
  {
    id: 'ld-1',
    title: 'Creating Courses & Learning Paths',
    description: 'Build training courses, design learning paths, and assign them to teams or individual employees.',
    category: 'Learning & Development',
    role: ['admin', 'hr', 'manager'],
    duration: '10:55',
    steps: [
      'Go to Learning → Courses → "Create Course"',
      'Add course details — title, description, category, duration, and provider',
      'Link skills that the course develops — these update employee skill profiles',
      'Create learning paths by combining multiple courses in sequence',
      'Assign courses to individual employees, teams, or the entire organization',
      'Set deadlines and track completion rates from the Learning dashboard',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/learning/ld-1.mp4`,
  },
  {
    id: 'ld-2',
    title: 'Certifications & Skill Tracking',
    description: 'Track employee certifications, skill assessments, and identify skill gaps across your organization.',
    category: 'Learning & Development',
    role: ['admin', 'hr', 'manager', 'employee'],
    duration: '7:30',
    steps: [
      'Navigate to Learning → Skills to view the organization skill matrix',
      'Employee skills are tracked with proficiency levels — beginner to expert',
      'Add certifications from the employee profile → Skills tab',
      'Run skill gap analysis to identify missing competencies in teams',
      'Recommend training courses based on identified skill gaps',
      'Employees can self-assess and update their skill proficiency levels',
      'Managers validate and approve skill updates for their team members',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/learning/ld-2.mp4`,
  },

  // Self-Service Portal (2 videos)
  {
    id: 'ss-1',
    title: 'Employee Self-Service Overview',
    description: 'Complete guide to the self-service portal — view payslips, update profile, raise requests, and more.',
    category: 'Self-Service Portal',
    role: ['employee'],
    duration: '6:20',
    steps: [
      'Access the Self-Service module from the sidebar',
      'View and download your monthly payslips in PDF format',
      'Check your leave balance and apply for leave directly',
      'Update personal information — address, emergency contact, bank details',
      'Raise helpdesk tickets for IT, HR, or admin issues',
      'View company policies, announcements, and directory',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/self-service/ss-1.mp4`,
  },
  {
    id: 'ss-2',
    title: 'Using the AI HR Assistant',
    description: 'How to interact with the AI assistant for quick answers about policies, leave, payroll, and company information.',
    category: 'Self-Service Portal',
    role: ['all'],
    duration: '5:10',
    steps: [
      'Click the AI Assistant icon in the bottom-right corner of any page',
      'Type your question in natural language — e.g., "How many casual leaves do I have left?"',
      'The AI responds with personalized answers based on your employee data',
      'Ask about policies, payroll dates, holiday calendar, or company directory',
      'Use voice input for hands-free queries on mobile devices',
      'The AI can also help you navigate — "Take me to my payslips"',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/self-service/ss-2.mp4`,
  },

  // AI Features (3 videos)
  {
    id: 'ai-1',
    title: 'Introduction to eh2r AI Capabilities',
    description: 'Overview of all AI-powered features in eh2r including smart screening, onboarding, analytics, and chat assistance.',
    category: 'AI Features',
    role: ['all'],
    duration: '9:00',
    steps: [
      'eh2r AI is embedded across every module — not a separate add-on',
      'AI Candidate Screening — automatically scores and ranks job applicants',
      'AI Interviews — conducts automated video interviews with smart questions',
      'AI Attrition Prediction — identifies flight-risk employees before they leave',
      'AI HR Assistant — chat-based interface for instant answers to HR queries',
      'AI Analytics — predictive insights for workforce planning and trends',
      'AI Document Generation — auto-creates offer letters, contracts, and policies',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/ai/ai-1.mp4`,
  },
  {
    id: 'ai-2',
    title: 'AI Analytics & Predictive Insights',
    description: 'Use AI-driven analytics for attrition prediction, workforce planning, and trend analysis across your organization.',
    category: 'AI Features',
    role: ['admin', 'hr', 'manager'],
    duration: '12:35',
    steps: [
      'Navigate to Analytics → AI Insights to access predictive dashboards',
      'View attrition risk scores for every employee — ranked by risk level',
      'Analyze workforce trends — hiring velocity, turnover rate, and cost per hire',
      'Use the "What-If" simulator to model workforce changes and their impact',
      'Review AI-generated recommendations for retention and engagement',
      'Schedule automated reports to be delivered to your inbox weekly or monthly',
      'Export data to CSV or PDF for board presentations and strategic planning',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/ai/ai-2.mp4`,
  },
  {
    id: 'ai-3',
    title: 'Automating HR Workflows with AI',
    description: 'Set up automated workflows for onboarding, offboarding, leave approvals, and document generation using AI.',
    category: 'AI Features',
    role: ['admin', 'hr'],
    duration: '10:45',
    steps: [
      'Go to Settings → Workflows → "Create Workflow"',
      'Choose a workflow type — Leave Approval, Expense, Recruitment, Onboarding, or Exit',
      'Define workflow steps with approvers, conditions, and triggers',
      'Set up AI-assisted routing — the AI assigns approvers based on org structure',
      'Enable auto-approval rules for low-risk requests (e.g., 1-day sick leave)',
      'Configure exit workflows — clearance checklist, asset return, access revocation',
      'Test the workflow with a dry run before activating',
      'Monitor workflow performance from the Analytics → Workflow Dashboard',
    ],
    thumbnail: '',
    videoUrl: `${VIDEO_BASE_URL}/ai/ai-3.mp4`,
  },
]

// ─── Category Config ──────────────────────────────────────────────────────────

export const trainingCategories = [
  'All',
  'Dashboard & Navigation',
  'Employee Management',
  'Time & Attendance',
  'Leave Management',
  'Payroll & Expenses',
  'Recruitment & Talent',
  'Performance Management',
  'Learning & Development',
  'Self-Service Portal',
  'AI Features',
] as const

type Category = (typeof trainingCategories)[number]

export const trainingCategoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Dashboard & Navigation': LayoutDashboard,
  'Employee Management': Users,
  'Time & Attendance': Clock3,
  'Leave Management': Calendar,
  'Payroll & Expenses': Banknote,
  'Recruitment & Talent': Briefcase,
  'Performance Management': TrendingUp,
  'Learning & Development': GraduationCap,
  'Self-Service Portal': Users,
  'AI Features': Brain,
}

export const trainingCategoryColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'Dashboard & Navigation': { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', gradient: 'from-emerald-500 to-teal-600' },
  'Employee Management': { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', gradient: 'from-blue-500 to-indigo-600' },
  'Time & Attendance': { bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', gradient: 'from-cyan-500 to-blue-600' },
  'Leave Management': { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', gradient: 'from-teal-500 to-emerald-600' },
  'Payroll & Expenses': { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', gradient: 'from-amber-500 to-orange-600' },
  'Recruitment & Talent': { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', gradient: 'from-purple-500 to-violet-600' },
  'Performance Management': { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', gradient: 'from-rose-500 to-pink-600' },
  'Learning & Development': { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', gradient: 'from-teal-500 to-emerald-600' },
  'Self-Service Portal': { bg: 'bg-lime-50 dark:bg-lime-950/50', text: 'text-lime-700 dark:text-lime-400', border: 'border-lime-200 dark:border-lime-800', gradient: 'from-lime-500 to-green-600' },
  'AI Features': { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', gradient: 'from-emerald-500 to-teal-600' },
}

export const trainingRoleTabs = ['All', 'Admin', 'HR', 'Manager', 'Employee'] as const
type RoleTab = (typeof trainingRoleTabs)[number]

// ─── Quick Reference Cards ────────────────────────────────────────────────────

const quickReferenceCards = [
  {
    title: 'First Day Setup',
    description: 'Complete your onboarding checklist, set up your profile, and configure notifications.',
    steps: ['Log in with your credentials', 'Complete your profile information', 'Upload required documents', 'Set notification preferences'],
    icon: CheckCircle2,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Applying for Leave',
    description: 'Submit leave requests and track approval status in just a few clicks.',
    steps: ['Go to Self-Service → My Leaves', 'Select leave type and dates', 'Add reason and submit', 'Track status in your dashboard'],
    icon: Calendar,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Viewing Payslips',
    description: 'Access and download your monthly payslips and tax documents.',
    steps: ['Navigate to Self-Service → My Payslips', 'Select the month/year', 'View or download PDF', 'Check tax deductions breakdown'],
    icon: Banknote,
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Submit Expense Claims',
    description: 'Submit business expenses with receipts for quick reimbursement.',
    steps: ['Go to Payroll → Expenses', 'Click "New Expense Claim"', 'Fill details & upload receipt', 'Submit for manager approval'],
    icon: FileText,
    color: 'from-rose-500 to-pink-600',
  },
]

// ─── FAQ Items ────────────────────────────────────────────────────────────────

const faqItems = [
  { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox.' },
  { q: 'How do I change my manager?', a: 'Contact your HR admin. Manager assignments can only be changed by users with Admin or HR roles.' },
  { q: 'Where can I find company policies?', a: 'Navigate to Self-Service → Company Policies, or ask the AI HR Assistant any policy-related question.' },
  { q: 'How do I update my bank details?', a: 'Go to My Profile → Employment section. Bank details changes require HR approval before taking effect.' },
  { q: 'Can I access eh2r AI on mobile?', a: 'Yes! eh2r AI is fully responsive and works on all modern mobile browsers. No app download required.' },
]

// ─── Video Card Component ─────────────────────────────────────────────────────

export function VideoCard({ video, onClick }: { video: VideoTutorial; onClick: () => void }) {
  const colors = trainingCategoryColors[video.category] || trainingCategoryColors['Dashboard & Navigation']
  const CategoryIcon = trainingCategoryIcons[video.category] || BookOpen
  const hasVideo = !!video.videoUrl

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-gray-200 dark:border-gray-800"
      onClick={onClick}
    >
      {/* Thumbnail Area */}
      <div className={cn('relative h-36 rounded-t-lg bg-gradient-to-br overflow-hidden', colors.gradient)}>
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className={cn('absolute inset-0 flex items-center justify-center', !video.thumbnailUrl && 'bg-gradient-to-br', colors.gradient)}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
            <Play className="h-7 w-7 text-white ml-0.5" />
          </div>
        </div>
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          <Clock className="h-3 w-3" />
          {video.duration}
        </div>
        {/* Steps Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {hasVideo ? <Video className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
          {hasVideo ? 'Video' : `${video.steps.length} steps`}
        </div>
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={cn('gap-1 text-[10px] font-medium bg-white/20 text-white border-0 backdrop-blur-sm')}>
            <CategoryIcon className="h-3 w-3" />
            {video.category}
          </Badge>
        </div>
        {/* Video available indicator */}
        {hasVideo && (
          <div className="absolute top-2 right-2">
            <Badge className="gap-1 text-[10px] font-medium bg-emerald-500/80 text-white border-0 backdrop-blur-sm">
              <Video className="h-3 w-3" />
              HD
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {video.description}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {video.role.map((role) => (
            <Badge
              key={role}
              variant="secondary"
              className={cn(
                'text-[10px] px-1.5 py-0',
                role === 'all'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : role === 'admin'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                  : role === 'hr'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                  : role === 'manager'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              )}
            >
              {role === 'all' ? 'Everyone' : role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Tutorial Player Dialog ───────────────────────────────────────────────────

type PlayerMode = 'video' | 'tutorial'

export function TutorialPlayerDialog({
  video,
  open,
  onClose,
}: {
  video: VideoTutorial | null
  open: boolean
  onClose: () => void
}) {
  // Compute initial mode based on videoUrl availability
  // Since Dialog has key={dialogKey}, it remounts on video change, resetting all state
  const hasVideo = !!video?.videoUrl
  const initialMode: PlayerMode = hasVideo ? 'video' : 'tutorial'

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState<PlayerMode>(initialMode)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)

  const colors = video
    ? trainingCategoryColors[video.category] || trainingCategoryColors['Dashboard & Navigation']
    : trainingCategoryColors['Dashboard & Navigation']
  const CategoryIcon = video ? trainingCategoryIcons[video.category] || BookOpen : BookOpen

  // Reset state when video changes - dialogKey on Dialog forces remount
  const dialogKey = video?.id ?? 'no-video'

  const handleOpen = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      setTimeout(() => {
        setCurrentStep(0)
        setIsPlaying(false)
        setVideoError(false)
      }, 200)
    }
  }, [onClose])

  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }, [])

  // Handle video chapter click
  const handleChapterClick = useCallback((index: number) => {
    setCurrentStep(index)
    // Could seek video to a timestamp based on chapter index in future
  }, [])

  if (!video) return null

  const totalSteps = video.steps.length
  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0))

  return (
    <Dialog open={open} onOpenChange={handleOpen} key={dialogKey}>
      <DialogContent className={cn(
        'p-0 gap-0 overflow-hidden',
        mode === 'video' ? 'sm:max-w-4xl' : 'sm:max-w-2xl'
      )} showCloseButton={false}>
        {/* Accessible title/description (visually hidden) */}
        <DialogTitle className="sr-only">{video.title}</DialogTitle>
        <DialogDescription className="sr-only">{video.description}</DialogDescription>

        {/* Title Bar */}
        <div className={cn('bg-gradient-to-r px-5 py-3 text-white', colors.gradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <CategoryIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">{video.title}</h3>
                <p className="text-[11px] text-white/80">{video.category} · {video.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Mode Toggle */}
              {hasVideo && (
                <div className="flex items-center rounded-lg bg-white/10 p-0.5 backdrop-blur-sm">
                  <button
                    onClick={() => setMode('video')}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all',
                      mode === 'video'
                        ? 'bg-white/25 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    )}
                  >
                    <Video className="h-3 w-3" />
                    Video
                  </button>
                  <button
                    onClick={() => setMode('tutorial')}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all',
                      mode === 'tutorial'
                        ? 'bg-white/25 text-white shadow-sm'
                        : 'text-white/70 hover:text-white'
                    )}
                  >
                    <BookOpen className="h-3 w-3" />
                    Tutorial
                  </button>
                </div>
              )}
              {video.role.map((role) => (
                <Badge
                  key={role}
                  className="text-[9px] px-1.5 py-0 bg-white/20 text-white border-0 backdrop-blur-sm hidden sm:inline-flex"
                >
                  {role === 'all' ? 'Everyone' : role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Video Mode ─── */}
        {mode === 'video' && hasVideo ? (
          <div className="w-full">
            {/* Video Player Container */}
            <div className="relative bg-black">
              {!videoError ? (
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <video
                    ref={videoRef}
                    key={video.videoUrl}
                    className="h-full w-full rounded-none object-contain"
                    controls
                    playsInline
                    poster={video.thumbnailUrl || undefined}
                    preload="metadata"
                    onError={() => setVideoError(true)}
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* Fullscreen button overlay */}
                  <button
                    onClick={handleFullscreen}
                    className="absolute bottom-14 right-3 flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                    style={{ opacity: 1 }}
                    title="Fullscreen"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Video Error Fallback */
                <div className="flex aspect-video w-full flex-col items-center justify-center bg-gray-900 text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mb-3">
                    <Video className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium mb-1">Video not available yet</p>
                  <p className="text-xs text-gray-400 mb-4 text-center px-8">
                    The training video for this tutorial hasn&apos;t been uploaded yet. Switch to Tutorial mode for the step-by-step guide.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode('tutorial')}
                    className="gap-1.5 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Switch to Tutorial Mode
                  </Button>
                </div>
              )}
            </div>

            {/* Chapters Section Below Video */}
            <div className="border-t border-gray-200 dark:border-gray-800">
              <div className="px-5 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chapters</h4>
                    <Badge variant="secondary" className="text-[10px]">{totalSteps} steps</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode('tutorial')}
                    className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  >
                    <MonitorPlay className="h-3.5 w-3.5" />
                    Interactive Tutorial
                  </Button>
                </div>

                {/* Chapters List */}
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {video.steps.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChapterClick(idx)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-all duration-150',
                        idx === currentStep
                          ? cn('bg-gradient-to-r text-white', colors.gradient)
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <span className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5',
                        idx === currentStep
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-xs font-medium line-clamp-2',
                          idx === currentStep
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        )}>
                          {step}
                        </p>
                      </div>
                      {idx === currentStep && (
                        <Play className="h-3 w-3 shrink-0 mt-1 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── Tutorial Mode (existing step-by-step) ─── */
          <>
            {/* Video Tutorial Area */}
            {!isPlaying ? (
              <div
                className={cn('relative w-full aspect-video bg-gradient-to-br cursor-pointer flex items-center justify-center', colors.gradient)}
                onClick={() => setIsPlaying(true)}
              >
                <div className="absolute inset-0 bg-black/10" />
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-6 left-8 h-16 w-24 rounded bg-white/30" />
                  <div className="absolute top-6 left-36 h-16 w-40 rounded bg-white/20" />
                  <div className="absolute bottom-12 left-8 right-8 h-24 rounded bg-white/10" />
                </div>
                {/* Play button */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-transform hover:scale-105 shadow-xl">
                    <Play className="h-10 w-10 text-white ml-1" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-base">Interactive Tutorial</p>
                    <p className="text-white/80 text-xs mt-0.5">Click to start the step-by-step walkthrough</p>
                  </div>
                </div>
                {/* Info badges */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                    <BookOpen className="h-3 w-3" />
                    {totalSteps} Steps
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </div>
                </div>
                {/* Switch to video if available */}
                {hasVideo && (
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMode('video') }}
                      className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                    >
                      <Video className="h-3 w-3" />
                      Watch Video Instead
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-200 dark:bg-gray-700">
                  <div
                    className={cn('h-full bg-gradient-to-r transition-all duration-300', colors.gradient)}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Current Step Display */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br', colors.gradient)}>
                      {currentStep + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] text-muted-foreground">Step {currentStep + 1} of {totalSteps}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Sparkles className="h-3 w-3" />
                      Tutorial
                    </Badge>
                  </div>

                  {/* Step Content Card */}
                  <div className={cn('rounded-xl border-2 p-5 mb-5', colors.border, colors.bg)}>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                      {video.steps[currentStep]}
                    </p>
                  </div>

                  {/* Steps Overview */}
                  <div className="mb-5">
                    <p className="text-[11px] font-medium text-muted-foreground mb-2">All Steps</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {video.steps.map((step, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx)}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-150',
                            idx === currentStep
                              ? cn('bg-gradient-to-br text-white shadow-md', colors.gradient)
                              : idx < currentStep
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          )}
                          title={step}
                        >
                          {idx < currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goPrev}
                      disabled={currentStep === 0}
                      className="gap-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      {currentStep + 1} / {totalSteps}
                    </div>
                    {currentStep < totalSteps - 1 ? (
                      <Button
                        size="sm"
                        onClick={goNext}
                        className={cn('gap-1.5 bg-gradient-to-r text-white border-0', colors.gradient)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={onClose}
                        className={cn('gap-1.5 bg-gradient-to-r text-white border-0', colors.gradient)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Done
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description (shown when not playing) */}
            {!isPlaying && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-muted-foreground">{video.description}</p>
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5">What you&apos;ll learn:</p>
                  <div className="space-y-1">
                    {video.steps.slice(0, 3).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{step}</span>
                      </div>
                    ))}
                    {video.steps.length > 3 && (
                      <p className="text-[10px] text-muted-foreground pl-5.5">
                        + {video.steps.length - 3} more steps
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Quick Reference Card Component ───────────────────────────────────────────

function QuickRefCard({ card }: { card: typeof quickReferenceCards[number] }) {
  const Icon = card.icon
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className={cn('h-1.5 bg-gradient-to-r', card.color)} />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white', card.color)}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{card.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
          </div>
        </div>
        <ol className="mt-3 space-y-1.5">
          {card.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-gradient-to-br', card.color)}>
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HelpTraining() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [activeRole, setActiveRole] = useState<RoleTab>('All')
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)

  // Filter videos
  const filteredVideos = useMemo(() => {
    return videoTutorials.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        activeCategory === 'All' || video.category === activeCategory
      const matchesRole =
        activeRole === 'All' ||
        video.role.includes('all') ||
        video.role.includes(activeRole.toLowerCase())
      return matchesSearch && matchesCategory && matchesRole
    })
  }, [searchQuery, activeCategory, activeRole])

  // Group videos by category for the grid view
  const videosByCategory = useMemo(() => {
    const grouped: Record<string, VideoTutorial[]> = {}
    filteredVideos.forEach((video) => {
      if (!grouped[video.category]) grouped[video.category] = []
      grouped[video.category].push(video)
    })
    return grouped
  }, [filteredVideos])

  const handleVideoClick = useCallback((video: VideoTutorial) => {
    setSelectedVideo(video)
    setPlayerOpen(true)
  }, [])

  const handleClosePlayer = useCallback(() => {
    setPlayerOpen(false)
    setTimeout(() => setSelectedVideo(null), 200)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Hero Header ─────────────────────────────────────────── */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-5 text-white shadow-lg sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold sm:text-2xl">Help & Training Center</h1>
                <p className="mt-0.5 text-sm text-blue-100">
                  Interactive tutorials, quick guides & resources to master eh2r AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="rounded-lg bg-white/15 px-3 py-2 backdrop-blur-sm">
                <p className="text-xs text-blue-100">Tutorials</p>
                <p className="text-lg font-bold">{videoTutorials.length}</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 backdrop-blur-sm">
                <p className="text-xs text-blue-100">Categories</p>
                <p className="text-lg font-bold">{trainingCategories.length - 1}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-200" />
            <Input
              type="text"
              placeholder="Search tutorials by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-white/20 bg-white/10 pl-10 text-sm text-white placeholder:text-blue-200 focus-visible:border-white/40 focus-visible:ring-white/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Main Layout: Content + Sidebar ────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Content (3/4) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Role Filter Tabs */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filter by Role</span>
              </div>
              <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as RoleTab)}>
                <TabsList className="w-full sm:w-auto">
                  {trainingRoleTabs.map((role) => (
                    <TabsTrigger key={role} value={role} className="gap-1.5 text-xs sm:text-sm">
                      {role === 'All' ? <Filter className="h-3.5 w-3.5" /> : null}
                      {role}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {trainingRoleTabs.map((role) => (
                  <TabsContent key={role} value={role}>
                    {/* Category Chips */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {trainingCategories.map((cat) => {
                        const catCount = cat === 'All'
                          ? filteredVideos.length
                          : videoTutorials.filter((v) => {
                              const matchesRole = role === 'All' || v.role.includes('all') || v.role.includes(role.toLowerCase())
                              return v.category === cat && matchesRole
                            }).length
                        if (cat !== 'All' && catCount === 0) return null
                        return (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150',
                              activeCategory === cat
                                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                            )}
                          >
                            {cat !== 'All' && trainingCategoryIcons[cat] ? (() => {
                              const CIcon = trainingCategoryIcons[cat]
                              return <CIcon className="h-3 w-3" />
                            })() : null}
                            {cat}
                            <span className={cn(
                              'ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-semibold',
                              activeCategory === cat
                                ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            )}>
                              {catCount}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Video Grid */}
                    {filteredVideos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Search className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium text-gray-500">No tutorials found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 gap-1.5"
                          onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActiveRole('All'); }}
                        >
                          <X className="h-3.5 w-3.5" />
                          Clear Filters
                        </Button>
                      </div>
                    ) : activeCategory === 'All' ? (
                      /* Grouped by category */
                      <div className="space-y-8">
                        {Object.entries(videosByCategory).map(([category, videos]) => {
                          const catIcon = trainingCategoryIcons[category] || BookOpen
                          const CatIcon = catIcon
                          const catColors = trainingCategoryColors[category] || trainingCategoryColors['Dashboard & Navigation']
                          return (
                            <div key={category}>
                              <div className="flex items-center gap-2 mb-3">
                                <div className={cn('flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br text-white', catColors.gradient)}>
                                  <CatIcon className="h-3.5 w-3.5" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category}</h2>
                                <Badge variant="secondary" className="text-[10px]">{videos.length}</Badge>
                              </div>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {videos.map((video) => (
                                  <VideoCard
                                    key={video.id}
                                    video={video}
                                    onClick={() => handleVideoClick(video)}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      /* Flat grid for single category */
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredVideos.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            onClick={() => handleVideoClick(video)}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* ─── Quick Reference Cards ──────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Quick Reference Guides</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickReferenceCards.map((card) => (
                  <QuickRefCard key={card.title} card={card} />
                ))}
              </div>
            </div>

            {/* ─── FAQ Section ───────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {faqItems.map((faq, i) => (
                      <div key={i} className="px-4 py-3 sm:px-5 sm:py-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{faq.q}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ─── Sidebar (1/4) ────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="https://github.com/eh2r-ai/wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                    <Github className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">GitHub Wiki</p>
                    <p className="text-[10px] text-muted-foreground">Full documentation & guides</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </a>

                <a
                  href="#faq"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">FAQ</p>
                    <p className="text-[10px] text-muted-foreground">Common questions answered</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </a>

                <a
                  href="mailto:support@eh2r.ai"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Contact Support</p>
                    <p className="text-[10px] text-muted-foreground">support@eh2r.ai</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </a>

                <a
                  href="tel:+911234567890"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Call Support</p>
                    <p className="text-[10px] text-muted-foreground">+91 123 456 7890</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tutorials Available</span>
                  <span className="font-semibold">{videoTutorials.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Steps</span>
                  <span className="font-semibold">{videoTutorials.reduce((acc, v) => acc + v.steps.length, 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Categories</span>
                  <span className="font-semibold">{trainingCategories.length - 1}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Video Tutorials</span>
                  <span className="font-semibold">{videoTutorials.filter(v => v.videoUrl).length}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  {trainingCategories.filter(c => c !== 'All').map(cat => {
                    const catColors = trainingCategoryColors[cat] || trainingCategoryColors['Dashboard & Navigation']
                    const count = videoTutorials.filter(v => v.category === cat).length
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <div className={cn('h-2 w-2 rounded-full bg-gradient-to-r', catColors.gradient)} />
                        <span className="text-[11px] text-muted-foreground flex-1 truncate">{cat}</span>
                        <span className="text-[11px] font-medium">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Help Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2.5">
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Click the Video/Tutorial toggle to switch between watching and reading</p>
                </div>
                <div className="flex gap-2.5">
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Use the AI Assistant for instant answers to any HR question</p>
                </div>
                <div className="flex gap-2.5">
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Filter tutorials by your role to see only relevant content</p>
                </div>
                <div className="flex gap-2.5">
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Follow tutorials step-by-step in a separate browser tab for best results</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tutorial Player Dialog */}
      <TutorialPlayerDialog
        video={selectedVideo}
        open={playerOpen}
        onClose={handleClosePlayer}
      />
    </div>
  )
}
