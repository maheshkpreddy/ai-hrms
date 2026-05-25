#!/usr/bin/env python3
"""
eh2r AI Training Video Generator — Fast FFmpeg Pipeline
Creates module-wise and role-wise training videos with TTS voice-over and visual slides.
Uses ffmpeg directly instead of moviepy for 10x faster encoding.
"""

import os
import sys
import textwrap
import tempfile
import shutil
import subprocess
from pathlib import Path

from gtts import gTTS
from PIL import Image, ImageDraw, ImageFont

# ─── Configuration ───────────────────────────────────────────────────────────────

OUTPUT_DIR = Path("/home/z/my-project/download/training-videos")
WIKI_DIR = Path("/home/z/my-project/docs/wiki")
FONT_DIR = Path("/usr/share/fonts/truetype")

WIDTH, HEIGHT = 1280, 720

# Brand colors
BG_DARK = (15, 23, 42)
EMERALD = (16, 185, 129)
WHITE = (255, 255, 255)
LIGHT_GRAY = (203, 213, 225)
MUTED = (148, 163, 184)

# ─── Training Content (same as before) ──────────────────────────────────────────

MODULES = [
    {"id": "01-dashboard", "title": "Dashboard", "icon": "📊", "color": (16, 185, 129),
     "description": "Role-based dashboard with KPIs, charts, and quick actions",
     "slides": [
        {"title": "Dashboard Overview", "bullets": ["The Dashboard is the first screen you see after logging in", "It provides a role-specific overview of key HR metrics", "Admins see company-wide statistics and trends", "Managers see team performance and pending approvals", "Employees see personal summaries and quick actions"],
         "narration": "Welcome to the Dashboard module. This is your command center in eh2r AI. The dashboard adapts to your role: administrators see company-wide KPIs and trends, managers see team performance and pending approvals, and employees see their personal summaries and quick actions."},
        {"title": "Key Dashboard Components", "bullets": ["Employee headcount with department breakdown", "Attendance summary with today's check-in rate", "Leave calendar showing upcoming and pending leaves", "Quick action cards for common tasks", "Recent activity feed with timestamps"],
         "narration": "The dashboard contains several key components. You will find the employee headcount with a department breakdown chart. The attendance summary shows today's check-in rate at a glance. The leave calendar highlights upcoming and pending leave requests. Quick action cards let you perform common tasks with a single click. And the recent activity feed keeps you updated with the latest changes across the system."},
        {"title": "Quick Actions and Navigation", "bullets": ["One-click access to add employee, approve leave, run payroll", "Navigation sidebar to switch between 20 HR modules", "Home button to return to the dashboard from any module", "Search bar to quickly find any module", "Breadcrumb trail showing your current location"],
         "narration": "Quick actions on the dashboard give you one-click access to tasks like adding an employee, approving leave requests, or running payroll. The navigation sidebar lets you switch between all 20 HR modules. You can always return to the dashboard by clicking the Home button. The search bar helps you quickly find any module, and the breadcrumb trail shows your current location."},
     ]},
    {"id": "02-employees", "title": "Employee Management", "icon": "👥", "color": (59, 130, 246),
     "description": "Complete employee lifecycle management from hiring to exit",
     "slides": [
        {"title": "Employee Management Overview", "bullets": ["Central hub for managing the entire employee lifecycle", "Add, edit, view, and deactivate employee records", "Track personal info, employment details, and documents", "Department and designation management", "Bulk import employees via Excel upload"],
         "narration": "The Employee Management module is your central hub for managing the entire employee lifecycle. You can add new employees, edit existing records, view detailed profiles, and deactivate departing employees. The module tracks personal information, employment details, and documents. You can also manage departments and designations, and perform bulk imports using Excel files."},
        {"title": "Adding a New Employee", "bullets": ["Click Add Employee button to open the form", "Fill in personal details: name, email, phone, address", "Set employment details: department, designation, join date", "Assign role and reporting manager", "Upload profile photo and supporting documents"],
         "narration": "To add a new employee, click the Add Employee button to open the registration form. Fill in the personal details including name, email, phone, and address. Then set the employment details such as department, designation, and joining date. You can assign a role and reporting manager. Finally, upload a profile photo and any supporting documents."},
        {"title": "Employee Directory and Filters", "bullets": ["Searchable employee directory with profile cards", "Filter by department, designation, status, and location", "Sort by name, join date, or employee ID", "Export employee data to Excel or PDF", "Bulk actions for status updates and communications"],
         "narration": "The Employee Directory provides a searchable view of all employees with profile cards. You can filter by department, designation, status, and location. For reporting, export employee data to Excel or PDF. Bulk actions allow you to update statuses and send communications to multiple employees at once."},
     ]},
    {"id": "03-company", "title": "Company Management", "icon": "🏢", "color": (100, 116, 139),
     "description": "Multi-tenant company setup, branches, and policy management",
     "slides": [
        {"title": "Company Management Overview", "bullets": ["Manage company profile, branches, and policies", "Multi-tenant architecture with company code isolation", "Each company gets a unique code for login", "Configure company-wide settings and preferences", "Manage office locations with GPS coordinates"],
         "narration": "The Company Management module lets you manage your organization's profile, branches, and policies. eh2r AI uses a multi-tenant architecture where each company gets a unique code for login. You can configure company-wide settings and preferences, and manage office locations with GPS coordinates for geofencing attendance."},
        {"title": "Branch and Policy Management", "bullets": ["Add and manage multiple office branches", "Set branch address, contact info, and timezone", "Configure branch-specific leave and holiday policies", "Create and manage company HR policies", "Employee acknowledgment tracking for policies"],
         "narration": "Under Branch Management, you can add and manage multiple office branches with their own address, contact information, and timezone. You can configure branch-specific leave and holiday policies. The Policy Management section allows you to create company HR policies and track employee acknowledgments."},
     ]},
    {"id": "04-assets", "title": "Asset Management", "icon": "💻", "color": (249, 115, 22),
     "description": "Track, assign, and manage company assets and equipment",
     "slides": [
        {"title": "Asset Management Overview", "bullets": ["Track all company assets: laptops, phones, vehicles, equipment", "Assign assets to employees with return dates", "Monitor asset condition and maintenance schedules", "Handle asset requests from employees", "Generate asset inventory and depreciation reports"],
         "narration": "The Asset Management module helps you track all company assets including laptops, phones, vehicles, and equipment. You can assign assets to employees with return dates, monitor asset condition, handle asset requests, and generate inventory and depreciation reports."},
        {"title": "Asset Assignment and Tracking", "bullets": ["Search and filter assets by type, status, and assignee", "Assign assets with automatic email notification", "Track asset lifecycle from purchase to disposal", "Set maintenance reminders and warranty alerts", "Employee asset return workflow on offboarding"],
         "narration": "For asset assignment, you can search and filter by type, status, and assignee. Assignments trigger automatic email notifications. You can track the complete asset lifecycle from purchase to disposal. Maintenance reminders and warranty alerts keep you informed, and offboarding triggers an asset return workflow."},
     ]},
    {"id": "05-documents", "title": "Document Management", "icon": "📄", "color": (234, 179, 8),
     "description": "Centralized document storage, templates, and version control",
     "slides": [
        {"title": "Document Management Overview", "bullets": ["Centralized repository for all HR documents", "Upload, organize, and share documents securely", "Document templates for offer letters, contracts, policies", "Version control with change history", "Role-based access control for sensitive documents"],
         "narration": "The Document Management module provides a centralized repository for all HR documents. You can upload, organize, and share documents securely. The system includes templates for offer letters and contracts. Version control maintains change history, and role-based access ensures sensitive documents are protected."},
        {"title": "Upload and Organize", "bullets": ["Drag-and-drop file upload with multi-file support", "Categorize documents by type: contracts, policies, certificates", "Tag documents for easy search and retrieval", "Set document expiry dates with automatic reminders", "Bulk download and export capabilities"],
         "narration": "Uploading is easy with drag-and-drop support and multi-file uploads. Categorize by type such as contracts, policies, and certificates. Tagging makes search simple. Set expiry dates on documents with automatic reminders. Bulk download and export are available for compliance needs."},
     ]},
    {"id": "06-tasks", "title": "Task Management", "icon": "✅", "color": (236, 72, 153),
     "description": "Personal and team task tracking with assignments and reports",
     "slides": [
        {"title": "Task Management Overview", "bullets": ["Create, assign, and track tasks across teams", "Set priorities, due dates, and dependencies", "Track progress with status updates and comments", "Team view for managers to monitor workload", "Task reports for productivity analysis"],
         "narration": "The Task Management module enables you to create, assign, and track tasks across teams. Set priorities, due dates, and dependencies. Progress is tracked through status updates and comments. Managers get a team view to monitor workload, and task reports provide productivity insights."},
        {"title": "Creating and Assigning Tasks", "bullets": ["Click New Task to create with title and description", "Assign to one or multiple team members", "Set priority level: Low, Medium, High, or Urgent", "Add due date and estimated hours", "Attach files and add comments for context"],
         "narration": "To create a task, click New Task and fill in the details. Assign it to team members, set the priority level, add a due date and estimated hours. You can also attach files and add comments for context."},
     ]},
    {"id": "07-meetings", "title": "Meeting Management", "icon": "📹", "color": (139, 92, 246),
     "description": "Schedule, manage, and track meetings with invitations",
     "slides": [
        {"title": "Meeting Management Overview", "bullets": ["Schedule meetings with date, time, and location", "Send invitations with RSVP tracking", "Set recurring meetings for regular check-ins", "Attach agenda documents before the meeting", "Record meeting minutes and action items"],
         "narration": "The Meeting Management module lets you schedule meetings with full details. Invitations are sent with RSVP tracking. Set up recurring meetings, attach agendas, and record minutes and action items after the meeting."},
        {"title": "Meeting Lifecycle", "bullets": ["Create meeting with title, description, and participants", "System sends calendar invites via email", "Track RSVP status: Accepted, Declined, Tentative", "Start meeting with one-click join for virtual meetings", "Post-meeting: add notes, assign action items, set deadlines"],
         "narration": "The meeting lifecycle starts with creating and inviting participants. The system sends calendar invites automatically. Track RSVP status. Start virtual meetings with one click. After the meeting, add notes, assign action items, and set deadlines."},
     ]},
    {"id": "08-rbac", "title": "RBAC and Security", "icon": "🛡", "color": (239, 68, 68),
     "description": "Role-based access control, permissions, and audit logs",
     "slides": [
        {"title": "RBAC and Security Overview", "bullets": ["Role-Based Access Control for granular permissions", "7 predefined roles from Super Admin to Employee", "Custom role creation with module-level permissions", "Audit trail for all sensitive operations", "Permission matrix: Read, Write, Modify, Delete, Admin"],
         "narration": "The RBAC and Security module provides Role-Based Access Control for granular permissions. There are 7 predefined roles. You can create custom roles with module-level permissions. The system maintains audit trails for all operations. The permission matrix covers Read, Write, Modify, Delete, and Admin levels."},
        {"title": "Role Configuration and Audit Logs", "bullets": ["Super Admin: Full access to all modules and settings", "HR Admin: Employee management, attendance, payroll", "Manager: Team views, approvals, performance reviews", "Employee: Self-service, attendance, profile only", "Track every action: who did what and when"],
         "narration": "Role configuration is flexible. Super Admins have full access. HR Admins manage employees, attendance, and payroll. Managers see team views and approvals. Employees access self-service and attendance only. Audit logs track every action: who did what and when."},
     ]},
    {"id": "09-talent", "title": "AI Talent Acquisition", "icon": "🧠", "color": (168, 85, 247),
     "description": "AI-powered recruitment from job posting to onboarding",
     "slides": [
        {"title": "AI Talent Acquisition Overview", "bullets": ["AI-powered end-to-end recruitment workflow", "Create job postings with AI-suggested descriptions", "Smart candidate screening and ranking", "Automated interview scheduling with AI interviewer", "AI-driven onboarding checklist generation"],
         "narration": "The AI Talent Acquisition module provides an AI-powered end-to-end recruitment workflow. Create job postings with AI-suggested descriptions. Smart screening ranks candidates automatically. Interview scheduling includes an AI interviewer option. Onboarding checklists are generated by AI."},
        {"title": "Interview and Offer Process", "bullets": ["Schedule human or AI-conducted interviews", "AI interviewer asks role-specific questions and scores responses", "Track interview feedback from all panel members", "Generate offer letters with salary breakdown", "Digital offer acceptance with e-signature"],
         "narration": "The interview process supports human and AI-conducted interviews. The AI interviewer asks role-specific questions and scores responses. Track feedback from all panel members. Generate offer letters with salary breakdown, and candidates accept digitally with e-signature."},
     ]},
    {"id": "10-attendance", "title": "Time and Attendance", "icon": "⏰", "color": (6, 182, 212),
     "description": "Attendance tracking, shifts, leaves, holidays, and geofencing",
     "slides": [
        {"title": "Time and Attendance Overview", "bullets": ["Mark daily attendance with check-in and check-out", "GPS geofencing for office-based attendance", "Manage shifts: day, night, rotational, and custom", "Leave management with approval workflows", "Holiday calendar with company and regional holidays"],
         "narration": "The Time and Attendance module handles all aspects of attendance. Mark daily attendance with check-in and check-out. GPS geofencing ensures attendance near the office. Manage shifts including day, night, and rotational. Leave management with approvals, and a comprehensive holiday calendar."},
        {"title": "Check-In, Check-Out, and Bulk Attendance", "bullets": ["Employees click Check-In when arriving at work", "GPS location captured for geofenced verification", "Click Check-Out when leaving, hours auto-calculated", "Admins can mark attendance for multiple employees at once", "Export attendance reports to Excel for payroll"],
         "narration": "Employees check in when arriving and check out when leaving. GPS location is captured for verification. Working hours are calculated automatically. Admins can mark bulk attendance for multiple employees at once. Export attendance reports to Excel for payroll processing."},
     ]},
    {"id": "11-payroll", "title": "Payroll and Expenses", "icon": "💰", "color": (245, 158, 11),
     "description": "Payroll processing, expense management, and financial reports",
     "slides": [
        {"title": "Payroll and Expenses Overview", "bullets": ["Run monthly payroll with automated calculations", "Configure salary components: basic, HRA, DA, deductions", "Tax computation with TDS and professional tax", "Expense claims with approval workflow", "Generate payslips, bank advice, and statutory reports"],
         "narration": "The Payroll and Expenses module automates monthly payroll processing. Configure salary components and tax computations. Employees submit expense claims through approval workflows. Generate payslips, bank advice, and statutory reports."},
        {"title": "Processing Payroll", "bullets": ["Select pay period and employee group", "System auto-calculates earnings, deductions, and taxes", "Review and adjust before finalizing", "Generate payslips and send to employees via email", "Export bank advice file for salary disbursement"],
         "narration": "To process payroll, select the pay period and employee group. The system auto-calculates everything. Review and adjust before finalizing. Generate payslips and email them to employees. Export bank advice for salary disbursement."},
     ]},
    {"id": "12-performance", "title": "Performance Management", "icon": "📈", "color": (244, 63, 94),
     "description": "AI-powered performance reviews, goals, and 360 feedback",
     "slides": [
        {"title": "Performance Management Overview", "bullets": ["AI-powered performance review cycles", "Set goals and OKRs aligned with company objectives", "360-degree feedback from peers, managers, and reports", "AI-generated performance insights and recommendations", "Track performance trends over time"],
         "narration": "The Performance Management module is AI-powered. Set up review cycles, create goals and OKRs aligned with company objectives. The 360-degree feedback system collects input from all directions. AI generates insights and recommendations, and you can track trends over time."},
        {"title": "Goal Setting and OKRs", "bullets": ["Create individual and team goals with measurable targets", "Align goals with company OKRs for strategic focus", "Track progress with percentage completion indicators", "Regular check-ins and milestone updates", "AI suggests goal adjustments based on progress patterns"],
         "narration": "Goal setting supports individual and team goals with measurable targets. Align with company OKRs. Track progress with completion indicators. Regular check-ins keep everyone aligned, and AI suggests adjustments based on progress patterns."},
     ]},
    {"id": "13-learning", "title": "Learning and Development", "icon": "🎓", "color": (20, 184, 166),
     "description": "AI-curated courses, certifications, and skill development",
     "slides": [
        {"title": "Learning and Development Overview", "bullets": ["AI-curated learning paths for each role", "Course catalog with video, document, and quiz content", "Enrollment management with progress tracking", "Certification management with expiry alerts", "Skill gap analysis with AI recommendations"],
         "narration": "The Learning and Development module offers AI-curated learning paths for each role. The course catalog includes videos, documents, and quizzes. Track enrollment and progress. Manage certifications with expiry alerts. AI performs skill gap analysis and provides targeted recommendations."},
        {"title": "Course Management", "bullets": ["Create courses with modules, videos, and assessments", "AI recommends courses based on role and skill gaps", "Employees self-enroll or are assigned by managers", "Track completion rates and quiz scores", "Issue certificates upon successful completion"],
         "narration": "Create courses with multiple modules, videos, and assessments. AI recommends courses based on role and skill gaps. Employees can self-enroll or be assigned. Track completion rates and scores. Certificates are issued automatically upon completion."},
     ]},
    {"id": "14-projects", "title": "Project Kanban", "icon": "📋", "color": (99, 102, 241),
     "description": "Kanban boards for project and task visualization",
     "slides": [
        {"title": "Project Kanban Overview", "bullets": ["Visual Kanban boards for project management", "Drag-and-drop cards between columns", "Multiple boards for different projects or teams", "Cards with priority, tags, due dates, and assignees", "Track project progress with completion statistics"],
         "narration": "The Project Kanban module provides visual boards for project management. Drag and drop cards between columns. Create multiple boards for different projects. Each card includes priority, tags, due dates, and assignees. Track overall progress with completion statistics."},
        {"title": "Working with Kanban Boards", "bullets": ["Default columns: Backlog, To Do, In Progress, Done", "Click plus to add new cards to any column", "Card detail view shows description, comments, history", "Move cards between columns with arrow buttons or drag", "Board stats show total cards, in progress, and completed"],
         "narration": "Working with Kanban boards is intuitive. Default columns are Backlog, To Do, In Progress, and Done. Add cards to any column. The detail view shows description, comments, and history. Move cards with arrow buttons or drag and drop. Board statistics show progress at a glance."},
     ]},
    {"id": "15-clients", "title": "Client Portal", "icon": "🤝", "color": (14, 165, 233),
     "description": "Client management, tickets, and service tracking",
     "slides": [
        {"title": "Client Portal Overview", "bullets": ["Manage client relationships and contracts", "Support ticket system with priority and status tracking", "Resume access tracking for staffing clients", "Client detail view with contact and contract information", "Service request management and SLA tracking"],
         "narration": "The Client Portal manages client relationships and contracts. The support ticket system includes priority and status tracking. Resume access tracking monitors usage for staffing clients. Client details show contact and contract information. Service requests are tracked with SLA monitoring."},
        {"title": "Ticket Management", "bullets": ["Create tickets with subject, category, and priority", "Assign tickets to agents for resolution", "Status workflow: Open, In Progress, Resolved, Closed", "Add comments and attachments to tickets", "SLA tracking with response and resolution time alerts"],
         "narration": "Create tickets with subject, category, and priority. Assign to agents for resolution. The status workflow progresses through Open, In Progress, Resolved, and Closed. Add comments and attachments. SLA tracking provides alerts for response and resolution times."},
     ]},
    {"id": "16-subvendors", "title": "Sub-Vendor Management", "icon": "🏭", "color": (249, 115, 22),
     "description": "Sub-vendor management with resume pipeline tracking",
     "slides": [
        {"title": "Sub-Vendor Management Overview", "bullets": ["Manage staffing sub-vendor relationships", "Track vendor-provided resumes through the hiring pipeline", "Resume status: uploaded, shortlisted, interviewed, offered", "Vendor performance metrics and rating system", "Contract management with compliance tracking"],
         "narration": "Manage staffing sub-vendor relationships in this module. Track vendor-provided resumes through the complete hiring pipeline. Resume statuses progress from uploaded to offered. Vendor performance metrics and ratings help evaluate quality. Contract management ensures compliance."},
        {"title": "Resume Pipeline", "bullets": ["Vendors upload resumes against open job requirements", "Pipeline summary shows counts at each stage", "Review resumes with skill matching and scoring", "Advance or reject candidates with status transitions", "Track conversion rates per vendor for evaluation"],
         "narration": "Vendors upload resumes against open requirements. The pipeline summary shows counts at each stage. Review resumes with skill matching and scoring. Advance or reject candidates through status transitions. Track conversion rates per vendor to evaluate performance."},
     ]},
    {"id": "17-jobportal", "title": "AI Job Portal", "icon": "🌐", "color": (139, 92, 246),
     "description": "AI-powered recruitment pipeline with background verification",
     "slides": [
        {"title": "AI Job Portal Overview", "bullets": ["Comprehensive 7-tab recruitment pipeline", "AI-powered candidate screening and fit scoring", "Automated interview scheduling with AI interviewer", "Offer letter generation and digital acceptance", "Background verification and onboarding checklist"],
         "narration": "The AI Job Portal is a comprehensive 7-tab recruitment pipeline. AI powers candidate screening and fit scoring. Interview scheduling is automated with an AI interviewer option. Offer letters are generated and accepted digitally. Background verification and onboarding checklists are included."},
        {"title": "Recruitment Pipeline Stages", "bullets": ["Applied: All incoming applications collected", "Screening: AI scores and ranks candidates automatically", "Interviews: Schedule rounds with human or AI interviewers", "Offers: Generate, send, and track offer letters", "Onboarding: Checklist ensures smooth new hire transition"],
         "narration": "The pipeline flows through clear stages. Applications are collected in Applied. During Screening, AI scores and ranks candidates. Schedule interviews with human or AI interviewers. Generate and track offer letters. The onboarding checklist ensures smooth transitions for every new hire."},
     ]},
    {"id": "18-analytics", "title": "Analytics and Reporting", "icon": "📊", "color": (217, 70, 239),
     "description": "AI-powered HR analytics, custom reports, and data export",
     "slides": [
        {"title": "Analytics and Reporting Overview", "bullets": ["AI-powered HR analytics dashboard", "Pre-built reports for headcount, attrition, and costs", "Custom report builder with drag-and-drop fields", "Interactive charts and visualizations", "Export data to Excel, PDF, and CSV formats"],
         "narration": "The Analytics module features an AI-powered dashboard. Pre-built reports cover headcount, attrition, and costs. The custom report builder lets you drag and drop fields. Interactive charts make data easy to understand. Export to Excel, PDF, and CSV formats."},
        {"title": "Custom Reports and AI Insights", "bullets": ["Build custom reports by selecting metrics and dimensions", "AI identifies trends, anomalies, and recommendations", "Schedule reports for automatic generation and email delivery", "Compare periods for trend analysis", "Dashboard widgets for frequently used reports"],
         "narration": "Build custom reports by selecting metrics and dimensions. AI identifies trends and anomalies with actionable recommendations. Schedule reports for automatic delivery. Compare periods for trend analysis. Dashboard widgets give quick access to frequent reports."},
     ]},
    {"id": "19-selfservice", "title": "Employee Self-Service", "icon": "💬", "color": (132, 204, 22),
     "description": "Employee portal for attendance, leaves, payslips, and AI assistant",
     "slides": [
        {"title": "Employee Self-Service Overview", "bullets": ["Personal HR hub for every employee", "Check-in and check-out for daily attendance", "Apply for leaves and track approval status", "View and download payslips", "AI HR Assistant for instant answers"],
         "narration": "The Self-Service module is the personal HR hub for every employee. Check in and out for daily attendance. Apply for leaves and track approvals. View and download payslips. The AI HR Assistant answers HR questions instantly."},
        {"title": "Attendance and AI HR Assistant", "bullets": ["One-tap check-in with GPS location capture", "Check-out with automatic working hours calculation", "Apply for casual, sick, earned, and other leave types", "Track leave balance and approval status", "AI chat assistant available 24/7 for HR questions"],
         "narration": "One-tap check-in captures GPS location. Check-out calculates working hours automatically. Apply for various leave types and track balances. The AI chat assistant is available 24/7 to answer any HR question instantly, like having an HR representative at all times."},
     ]},
    {"id": "20-profile", "title": "My Profile", "icon": "👤", "color": (20, 184, 166),
     "description": "Personal information, employment details, and documents",
     "slides": [
        {"title": "My Profile Overview", "bullets": ["View and update personal information", "Employment details: department, designation, manager", "Upload and manage personal documents", "Update contact information and emergency contacts", "View employment history and organizational hierarchy"],
         "narration": "The My Profile module lets employees view and update personal information. See employment details including department and manager. Upload and manage documents. Update contact information and emergency contacts. View employment history and organizational hierarchy."},
        {"title": "Profile Management", "bullets": ["Edit personal details: name, address, phone, email", "Update bank details for payroll processing", "Add or update emergency contact information", "Upload and verify identity documents", "Set profile photo and notification preferences"],
         "narration": "Edit personal details including name, address, phone, and email. Update bank details for payroll. Add emergency contacts. Upload identity documents for verification. Set your profile photo and notification preferences."},
     ]},
]

ROLES = [
    {"id": "super-admin", "title": "Super Admin Training", "role": "Super Admin", "icon": "👑", "color": (239, 68, 68),
     "slides": [
        {"title": "Super Admin: Complete Access", "bullets": ["Full access to all 20 HR modules", "Create and manage company configuration", "Set up roles and permissions for all users", "View all audit logs and compliance reports", "Manage billing, subscriptions, and system settings"],
         "narration": "As a Super Admin, you have complete access to all 20 HR modules in eh2r AI. You manage company configuration, set up roles and permissions, view all audit logs and compliance reports, and manage billing and system settings. Your role is the highest authority."},
        {"title": "Super Admin: Key Workflows", "bullets": ["Initial company setup: branches, departments, designations", "Role creation and permission assignment", "Employee onboarding with role assignment", "Monitoring system-wide dashboards and analytics", "Handling escalations and system configuration changes"],
         "narration": "Key workflows start with initial company setup including branches and departments. Create roles and assign permissions. Onboard employees with proper role assignment. Monitor system-wide dashboards and analytics. Handle escalations and configuration changes."},
     ]},
    {"id": "hr-admin", "title": "HR Admin Training", "role": "HR Admin", "icon": "👔", "color": (59, 130, 246),
     "slides": [
        {"title": "HR Admin: Employee-Centric Access", "bullets": ["Manage all employee records and lifecycle events", "Process attendance, leaves, and payroll", "Handle recruitment from posting to onboarding", "Conduct performance reviews and manage appraisals", "Generate compliance and statutory reports"],
         "narration": "As an HR Admin, you manage all employee records and lifecycle events. Process attendance, leaves, and payroll. Handle recruitment from posting to onboarding. Conduct performance reviews and generate compliance reports."},
        {"title": "HR Admin: Daily Operations", "bullets": ["Review and approve leave requests from employees", "Mark attendance for employees who forgot to check in", "Process monthly payroll with deductions and taxes", "Manage job postings and screen candidates", "Resolve employee queries and escalate issues"],
         "narration": "Daily operations include reviewing and approving leave requests, marking attendance for missed check-ins, processing monthly payroll, managing job postings and screening candidates, and resolving employee queries while escalating issues when needed."},
     ]},
    {"id": "manager", "title": "Department Manager Training", "role": "Department Manager", "icon": "📊", "color": (16, 185, 129),
     "slides": [
        {"title": "Manager: Team-Focused Access", "bullets": ["View and manage your team members", "Approve or reject leave and attendance requests", "Conduct performance reviews for your team", "Assign tasks and track team productivity", "Access team dashboards and analytics"],
         "narration": "As a Manager, your access is team-focused. View and manage team members, approve or reject leave and attendance requests, conduct performance reviews, assign tasks, and access team dashboards and analytics."},
        {"title": "Manager: Approval Workflows", "bullets": ["Leave requests appear in your dashboard for approval", "Attendance regularization requests need your sign-off", "Expense claims from team members require your approval", "Performance review completion reminders", "Team skill development and course recommendations"],
         "narration": "Approval workflows are key. Leave requests appear on your dashboard. Attendance regularization needs your sign-off. Expense claims require your approval. You receive performance review reminders and can recommend skill development courses for your team."},
     ]},
    {"id": "employee", "title": "Employee Training", "role": "Employee", "icon": "👤", "color": (20, 184, 166),
     "slides": [
        {"title": "Employee: Self-Service Portal", "bullets": ["Check in and check out for daily attendance", "Apply for leaves and view leave balance", "Download payslips and tax documents", "Update personal profile and documents", "Chat with AI HR Assistant for instant help"],
         "narration": "As an Employee, your primary interface is the Self-Service Portal. Check in and out for attendance, apply for leaves, download payslips, update your profile, and chat with the AI HR Assistant for instant help."},
        {"title": "Employee: Getting Started", "bullets": ["Log in with your company code, email, and password", "Your dashboard shows attendance status and pending items", "Use the sidebar to navigate between your modules", "Check in when you arrive at the office", "Apply for leave through the Self-Service module"],
         "narration": "Getting started is simple. Log in with your company code, email, and password. Your dashboard shows attendance and pending items. Use the sidebar to navigate. Check in when you arrive, and apply for leave through Self-Service when needed."},
     ]},
    {"id": "recruiter", "title": "Recruiter Training", "role": "Recruiter", "icon": "🎯", "color": (168, 85, 247),
     "slides": [
        {"title": "Recruiter: Talent Acquisition Focus", "bullets": ["Create and manage job postings", "Screen candidates with AI-powered tools", "Schedule and conduct interviews", "Generate and send offer letters", "Manage the complete hiring pipeline"],
         "narration": "As a Recruiter, focus on Talent Acquisition. Create job postings, screen candidates with AI tools, schedule and conduct interviews, generate offer letters, and manage the complete hiring pipeline."},
        {"title": "Recruiter: AI-Powered Screening", "bullets": ["AI automatically scores and ranks candidate resumes", "View fit scores based on job requirements matching", "Shortlist top candidates with one click", "AI interviewer asks role-specific questions", "Track candidate pipeline from applied to hired"],
         "narration": "AI-powered screening is your biggest advantage. The AI scores and ranks resumes automatically. View fit scores for each candidate. Shortlist with one click. The AI interviewer conducts initial screenings. Track the complete pipeline from applied to hired."},
     ]},
    {"id": "payroll-specialist", "title": "Payroll Specialist Training", "role": "Payroll Specialist", "icon": "💰", "color": (245, 158, 11),
     "slides": [
        {"title": "Payroll Specialist: Financial Operations", "bullets": ["Process monthly payroll for all employees", "Configure salary structures and components", "Handle tax deductions including TDS and professional tax", "Manage expense claims and reimbursements", "Generate statutory reports and bank advice files"],
         "narration": "As a Payroll Specialist, handle all financial operations. Process monthly payroll, configure salary structures, handle tax deductions, manage expense claims, and generate statutory reports and bank advice files."},
        {"title": "Payroll: Monthly Process", "bullets": ["Verify attendance data for the pay period", "Review leave deductions and overtime calculations", "Run payroll with automated tax computations", "Review and approve payslips before distribution", "Export bank advice and file statutory returns"],
         "narration": "The monthly process starts with verifying attendance data. Review leave deductions and overtime. Run payroll with automated tax computations. Review payslips before distribution. Export bank advice and file statutory returns on time."},
     ]},
    {"id": "ld-manager", "title": "L&D Manager Training", "role": "L&D Manager", "icon": "🎓", "color": (20, 184, 166),
     "slides": [
        {"title": "L&D Manager: Learning and Growth", "bullets": ["Create and manage training courses", "AI-curated learning paths for different roles", "Track employee enrollment and completion rates", "Manage certifications and skill development", "Analyze skill gaps and recommend training"],
         "narration": "As an L&D Manager, drive learning and growth. Create and manage courses, leverage AI-curated learning paths, track enrollment and completion, manage certifications, and analyze skill gaps to recommend targeted training."},
        {"title": "L&D: Course Creation and Analytics", "bullets": ["Build courses with video, documents, and quiz modules", "Set prerequisites and learning path sequences", "Monitor completion rates and assessment scores", "AI identifies skill gaps and suggests interventions", "Issue certificates and track credential expiry"],
         "narration": "Build courses with video, documents, and quizzes. Set prerequisites and learning paths. Monitor completion rates and scores. AI identifies skill gaps and suggests interventions. Issue certificates and track expiry dates."},
     ]},
]


def get_font(size, bold=False):
    paths = [
        (FONT_DIR / "english" / ("Carlito-Bold.ttf" if bold else "Carlito.ttf")),
        (FONT_DIR / "dejavu" / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")),
        (FONT_DIR / "liberation" / ("LiberationSans-Bold.ttf" if bold else "LiberationSans-Regular.ttf")),
    ]
    for fp in paths:
        if fp.exists():
            return ImageFont.truetype(str(fp), size)
    return ImageFont.load_default()


def render_title_slide(title, desc, icon, color):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    d = ImageDraw.Draw(img)
    cx = WIDTH // 2
    # Top gradient bar
    for i in range(8):
        r = int(color[0]*(1-i/8) + BG_DARK[0]*(i/8))
        g = int(color[1]*(1-i/8) + BG_DARK[1]*(i/8))
        b = int(color[2]*(1-i/8) + BG_DARK[2]*(i/8))
        d.rectangle([(0, i*10), (WIDTH, (i+1)*10)], fill=(r, g, b))
    # Icon circle
    cy = 230
    d.ellipse([(cx-65, cy-65), (cx+65, cy+65)], fill=color)
    bf = get_font(55)
    bb = d.textbbox((0,0), icon, font=bf)
    d.text((cx-(bb[2]-bb[0])//2, cy-(bb[3]-bb[1])//2-5), icon, fill=WHITE, font=bf)
    # Title
    tf = get_font(42, True)
    tb = d.textbbox((0,0), title, font=tf)
    d.text((cx-(tb[2]-tb[0])//2, 330), title, fill=WHITE, font=tf)
    # Brand
    bf2 = get_font(17, True)
    brand = "eh2r AI - An AI Product of MARQ AI"
    bb2 = d.textbbox((0,0), brand, font=bf2)
    d.text((cx-(bb2[2]-bb2[0])//2, 400), brand, fill=EMERALD, font=bf2)
    # Desc
    df = get_font(19)
    for i, line in enumerate(textwrap.wrap(desc, width=55)):
        lb = d.textbbox((0,0), line, font=df)
        d.text((cx-(lb[2]-lb[0])//2, 455+i*28), line, fill=MUTED, font=df)
    # Label
    lf = get_font(13)
    lb = d.textbbox((0,0), "Training Video", font=lf)
    d.text((cx-(lb[2]-lb[0])//2, HEIGHT-55), "Training Video", fill=MUTED, font=lf)
    return img


def render_content_slide(title, bullets, num, total, color):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    d = ImageDraw.Draw(img)
    d.rectangle([(0,0), (6, HEIGHT)], fill=color)
    d.rectangle([(0,0), (WIDTH, 4)], fill=color)
    d.text((WIDTH-280, 18), "eh2r AI - MARQ AI", fill=MUTED, font=get_font(11))
    d.text((45, 45), title, fill=WHITE, font=get_font(32, True))
    d.rectangle([(45, 92), (WIDTH-45, 94)], fill=color)
    y = 120
    bf = get_font(21)
    for bullet in bullets:
        wrapped = textwrap.wrap(bullet, width=55)
        d.ellipse([(55, y+8), (67, y+20)], fill=color)
        for line in wrapped:
            d.text((82, y), line, fill=LIGHT_GRAY, font=bf)
            y += 32
        y += 14
    d.text((WIDTH-95, HEIGHT-35), f"{num}/{total}", fill=MUTED, font=get_font(13))
    return img


def render_end_slide(title):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    d = ImageDraw.Draw(img)
    cx = WIDTH // 2
    for i in range(8):
        d.rectangle([(0, i*10), (WIDTH, (i+1)*10)], fill=EMERALD)
    f1 = get_font(46, True)
    t = "Thank You!"
    b = d.textbbox((0,0), t, font=f1)
    d.text((cx-(b[2]-b[0])//2, 220), t, fill=EMERALD, font=f1)
    f2 = get_font(22)
    b2 = d.textbbox((0,0), title, font=f2)
    d.text((cx-(b2[2]-b2[0])//2, 310), title, fill=WHITE, font=f2)
    f3 = get_font(17, True)
    br = "eh2r AI - An AI Product of MARQ AI"
    b3 = d.textbbox((0,0), br, font=f3)
    d.text((cx-(b3[2]-b3[0])//2, 375), br, fill=MUTED, font=f3)
    f4 = get_font(13)
    ft = "https://ai-hrms-rho.vercel.app"
    b4 = d.textbbox((0,0), ft, font=f4)
    d.text((cx-(b4[2]-b4[0])//2, HEIGHT-55), ft, fill=MUTED, font=f4)
    return img


def get_audio_duration(path):
    """Get audio duration using ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())


def create_video(items, output_path, subdir_name):
    """Create a video from a list of slides using ffmpeg directly."""
    tmp_dir = tempfile.mkdtemp(prefix="eh2r_vid_")
    concat_list = []

    try:
        for idx, (img, narration_text) in enumerate(items):
            # Save image
            img_path = os.path.join(tmp_dir, f"slide_{idx:03d}.png")
            img.save(img_path)

            # Generate TTS
            audio_path = os.path.join(tmp_dir, f"audio_{idx:03d}.mp3")
            tts = gTTS(text=narration_text, lang='en', slow=False)
            tts.save(audio_path)

            # Get audio duration
            duration = get_audio_duration(audio_path)

            # Create video segment with ffmpeg (image + audio)
            seg_path = os.path.join(tmp_dir, f"seg_{idx:03d}.mp4")
            subprocess.run([
                "ffmpeg", "-y", "-loop", "1", "-i", img_path, "-i", audio_path,
                "-c:v", "libx264", "-tune", "stillimage", "-c:a", "aac",
                "-b:a", "128k", "-pix_fmt", "yuv420p",
                "-t", str(duration), "-shortest",
                "-r", "8", "-preset", "ultrafast",
                seg_path
            ], capture_output=True, timeout=60)

            if os.path.exists(seg_path):
                concat_list.append(seg_path)

        if not concat_list:
            print(f"  ❌ No segments generated for {output_path}")
            return None

        # Concatenate all segments
        concat_file = os.path.join(tmp_dir, "concat.txt")
        with open(concat_file, 'w') as f:
            for seg in concat_list:
                f.write(f"file '{seg}'\n")

        out_dir = OUTPUT_DIR / subdir_name
        out_dir.mkdir(parents=True, exist_ok=True)

        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_file,
            "-c:v", "libx264", "-c:a", "aac",
            "-b:a", "128k", "-pix_fmt", "yuv420p",
            "-preset", "fast",
            str(output_path)
        ], capture_output=True, timeout=120)

        if os.path.exists(output_path):
            size_mb = os.path.getsize(output_path) / (1024*1024)
            print(f"  ✅ {os.path.basename(output_path)} ({size_mb:.1f} MB)")
            return output_path
        else:
            print(f"  ❌ Output not created: {output_path}")
            return None

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def create_module_video(module):
    title = module["title"]
    safe_title = title.replace(" ", "-").replace("&", "and")
    output_path = OUTPUT_DIR / "module-wise" / f"{module['id']}-{safe_title}.mp4"

    print(f"  🎬 {title}")
    items = []

    # Title slide
    items.append((
        render_title_slide(title, module["description"], module["icon"], module["color"]),
        f"Welcome to the {title} training module for eh2r AI. {module['description']}. Let's explore the key features and workflows."
    ))

    # Content slides
    total = len(module["slides"])
    for i, slide in enumerate(module["slides"]):
        items.append((
            render_content_slide(slide["title"], slide["bullets"], i+1, total, module["color"]),
            slide["narration"]
        ))

    # End slide
    items.append((
        render_end_slide(title),
        f"This concludes the {title} training module. Thank you for watching. If you have questions, please contact your HR administrator."
    ))

    return create_video(items, output_path, "module-wise")


def create_role_video(role):
    safe_role = role["role"].replace(" ", "-")
    output_path = OUTPUT_DIR / "role-wise" / f"{role['id']}-{safe_role}.mp4"

    print(f"  🎬 {role['title']}")
    items = []

    items.append((
        render_title_slide(role["title"], f"Role-specific training for {role['role']}", role["icon"], role["color"]),
        f"Welcome to the {role['role']} training for eh2r AI. This video covers features and workflows for the {role['role']} role."
    ))

    total = len(role["slides"])
    for i, slide in enumerate(role["slides"]):
        items.append((
            render_content_slide(slide["title"], slide["bullets"], i+1, total, role["color"]),
            slide["narration"]
        ))

    items.append((
        render_end_slide(role["title"]),
        f"This concludes the {role['role']} training. Your dashboard and modules are tailored to your role. Thank you for watching."
    ))

    return create_video(items, output_path, "role-wise")


def generate_wiki_pages():
    WIKI_DIR.mkdir(parents=True, exist_ok=True)

    # Update Home.md
    home_path = WIKI_DIR / "Home.md"
    existing = home_path.read_text() if home_path.exists() else ""

    if "Training Videos" not in existing:
        training_section = """

---

## 🎬 Training Videos

Comprehensive training videos with voice-over narration are available for all modules and user roles.

### 📦 Module-Wise Training Videos

| # | Module | Video |
|---|--------|-------|
| 01 | Dashboard | [Watch Training](./Training-01-Dashboard) |
| 02 | Employee Management | [Watch Training](./Training-02-Employee-Management) |
| 03 | Company Management | [Watch Training](./Training-03-Company-Management) |
| 04 | Asset Management | [Watch Training](./Training-04-Asset-Management) |
| 05 | Document Management | [Watch Training](./Training-05-Document-Management) |
| 06 | Task Management | [Watch Training](./Training-06-Task-Management) |
| 07 | Meeting Management | [Watch Training](./Training-07-Meeting-Management) |
| 08 | RBAC and Security | [Watch Training](./Training-08-RBAC-and-Security) |
| 09 | AI Talent Acquisition | [Watch Training](./Training-09-AI-Talent-Acquisition) |
| 10 | Time and Attendance | [Watch Training](./Training-10-Time-and-Attendance) |
| 11 | Payroll and Expenses | [Watch Training](./Training-11-Payroll-and-Expenses) |
| 12 | Performance Management | [Watch Training](./Training-12-Performance-Management) |
| 13 | Learning and Development | [Watch Training](./Training-13-Learning-and-Development) |
| 14 | Project Kanban | [Watch Training](./Training-14-Project-Kanban) |
| 15 | Client Portal | [Watch Training](./Training-15-Client-Portal) |
| 16 | Sub-Vendor Management | [Watch Training](./Training-16-Sub-Vendor-Management) |
| 17 | AI Job Portal | [Watch Training](./Training-17-AI-Job-Portal) |
| 18 | Analytics and Reporting | [Watch Training](./Training-18-Analytics-and-Reporting) |
| 19 | Employee Self-Service | [Watch Training](./Training-19-Employee-Self-Service) |
| 20 | My Profile | [Watch Training](./Training-20-My-Profile) |

### 👤 Role-Wise Training Videos

| Role | Video |
|------|-------|
| Super Admin | [Watch Training](./Training-Role-Super-Admin) |
| HR Admin | [Watch Training](./Training-Role-HR-Admin) |
| Department Manager | [Watch Training](./Training-Role-Manager) |
| Employee | [Watch Training](./Training-Role-Employee) |
| Recruiter | [Watch Training](./Training-Role-Recruiter) |
| Payroll Specialist | [Watch Training](./Training-Role-Payroll) |
| L&D Manager | [Watch Training](./Training-Role-LD-Manager) |

"""
        home_path.write_text(existing + training_section)
        print("  📝 Updated Home.md")

    # Module training wiki pages
    for module in MODULES:
        safe = module["title"].replace(" ", "-").replace("&", "and")
        page = WIKI_DIR / f"Training-{module['id']}-{safe}.md"
        video_file = f"{module['id']}-{safe}.mp4"
        content = f"""# 🎬 {module['title']} — Training Video

> **Module**: {module['title']} | **Duration**: ~2-3 minutes | **Voice-over**: Yes

## Video

📽️ **[Download and watch the training video](https://github.com/maheshkpreddy/ai-hrms/raw/main/download/training-videos/module-wise/{video_file})**

> Right-click the link above and select "Save link as..." to download the MP4 video, or click to stream in your browser.

## Module Overview

{module['description']}

## Key Topics Covered

"""
        for j, slide in enumerate(module["slides"]):
            content += f"### {j+1}. {slide['title']}\n\n"
            for b in slide["bullets"]:
                content += f"- {b}\n"
            content += f"\n**Narration**: {slide['narration']}\n\n"
        content += """---

*eh2r AI — An AI Product of MARQ AI*
"""
        page.write_text(content)
        print(f"  📝 {page.name}")

    # Role training wiki pages
    role_page_map = {"super-admin":"Super-Admin","hr-admin":"HR-Admin","manager":"Manager","employee":"Employee","recruiter":"Recruiter","payroll-specialist":"Payroll","ld-manager":"LD-Manager"}
    demo_creds = {"Super Admin":"admin@company.com / Admin@2024","HR Admin":"priya.sharma@company.com / HRAdmin@2024","Department Manager":"rajesh.kumar@company.com / Manager@2024","Employee":"sneha.reddy@company.com / Employee@2024","Recruiter":"fatima.khan@company.com / Recruiter@2024","Payroll Specialist":"amit.patel@company.com / Payroll@2024","L&D Manager":"meera.iyer@company.com / LDManager@2024"}

    for role in ROLES:
        safe = role_page_map.get(role["id"], role["id"])
        page = WIKI_DIR / f"Training-Role-{safe}.md"
        video_file = f"{role['id']}-{role['role'].replace(' ', '-')}.mp4"
        cred = demo_creds.get(role["role"], "Contact your admin")
        content = f"""# 🎬 {role['title']} — Training Video

> **Role**: {role['role']} | **Duration**: ~1-2 minutes | **Voice-over**: Yes

## Video

📽️ **[Download and watch the training video](https://github.com/maheshkpreddy/ai-hrms/raw/main/download/training-videos/role-wise/{video_file})**

> Right-click the link above and select "Save link as..." to download the MP4 video, or click to stream in your browser.

## Role Overview

This training covers the features and workflows available for the **{role['role']}** role.

## Key Topics Covered

"""
        for j, slide in enumerate(role["slides"]):
            content += f"### {j+1}. {slide['title']}\n\n"
            for b in slide["bullets"]:
                content += f"- {b}\n"
            content += f"\n**Narration**: {slide['narration']}\n\n"
        content += f"""---

## Demo Credentials

**Company Code**: ACME | **Email / Password**: {cred}

**Login**: https://ai-hrms-rho.vercel.app/login

---

*eh2r AI — An AI Product of MARQ AI*
"""
        page.write_text(content)
        print(f"  📝 {page.name}")


def main():
    print("=" * 60)
    print("  eh2r AI — Training Video Generator (Fast FFmpeg)")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Generate module videos
    print("\n📦 Module-Wise Training Videos:")
    print("-" * 40)
    mvids = []
    for m in MODULES:
        p = create_module_video(m)
        if p:
            mvids.append(p)

    # Generate role videos
    print("\n👤 Role-Wise Training Videos:")
    print("-" * 40)
    rvids = []
    for r in ROLES:
        p = create_role_video(r)
        if p:
            rvids.append(p)

    # Generate wiki pages
    print("\n📝 Wiki Pages:")
    print("-" * 40)
    generate_wiki_pages()

    print(f"\n{'='*60}")
    print(f"  ✅ {len(mvids)} module videos | {len(rvids)} role videos")
    print(f"  📁 {OUTPUT_DIR}")
    print(f"  📝 {WIKI_DIR}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
