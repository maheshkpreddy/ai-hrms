#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const WIKI_DIR = '/home/z/my-project/docs/wiki';
const BASE_URL = 'https://github.com/maheshkpreddy/ai-hrms/wiki';
const VIDEO_BASE = 'https://github.com/maheshkpreddy/ai-hrms/releases/download/training-videos';
const LIVE_URL = 'https://ai-hrms-rho.vercel.app';
const COMPANY_CODE = 'ACME';

const CREDENTIALS = [
  { role: 'Super Admin', email: 'admin@company.com', password: 'Admin@2024', dashboard: 'Full Dashboard' },
  { role: 'HR Admin', email: 'priya.sharma@company.com', password: 'HRAdmin@2024', dashboard: 'HR Dashboard' },
  { role: 'Payroll Specialist', email: 'amit.patel@company.com', password: 'Payroll@2024', dashboard: 'Payroll' },
  { role: 'Department Manager', email: 'rajesh.kumar@company.com', password: 'Manager@2024', dashboard: 'Manager Dashboard' },
  { role: 'Employee', email: 'sneha.reddy@company.com', password: 'Employee@2024', dashboard: 'Self-Service' },
  { role: 'Recruiter', email: 'fatima.khan@company.com', password: 'Recruiter@2024', dashboard: 'Talent Acquisition' },
  { role: 'L&D Manager', email: 'meera.iyer@company.com', password: 'LDManager@2024', dashboard: 'Learning & Development' },
];

const MODULES = [
  {
    num: '01', key: 'dashboard', name: 'Dashboard', fileName: 'Dashboard',
    description: 'The Dashboard is the central command center of eh2r AI, providing a role-based overview of key HR metrics, KPIs, and quick actions. It adapts to each user\'s role, displaying relevant information such as employee headcount, attendance summaries, leave calendars, and recent activity feeds. The dashboard enables administrators to monitor company-wide statistics and trends, managers to track team performance and pending approvals, and employees to view personal summaries and quick actions.',
    subItems: [
      { name: 'Overview', desc: 'Displays key performance indicators including total employees, active employees, new hires, and department breakdown. The overview section provides at-a-glance metrics with visual charts and trend indicators to help you understand the current state of your organization.' },
      { name: 'Quick Actions', desc: 'One-click access to common tasks such as adding a new employee, approving leave requests, running payroll, and scheduling meetings. Quick actions are context-aware based on your role.' },
      { name: 'Recent Activity', desc: 'A real-time feed showing the latest activities across the system including new employee additions, leave approvals, payroll processing, and document uploads. Each activity entry includes a timestamp and the user who performed the action.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Department Manager', 'Employee', 'Payroll Specialist', 'Recruiter', 'L&D Manager'],
    tips: [
      'Use the dashboard as your starting point each day to stay updated on important metrics and pending actions.',
      'Quick actions can save significant time — use them instead of navigating through menus for common tasks.',
      'The dashboard content changes based on your role, so you only see what\'s relevant to you.',
      'Check the recent activity feed regularly to stay informed about team updates and system changes.',
      'Customize your dashboard view by pinning frequently used widgets and reports.',
    ],
  },
  {
    num: '02', key: 'employees', name: 'Employee Management', fileName: 'Employee-Management',
    description: 'The Employee Management module is the core HR module that handles the complete employee lifecycle from onboarding to exit. It provides a comprehensive employee directory, streamlined employee onboarding workflows, and department management capabilities. HR administrators can add, edit, and manage employee records, track employment status changes, and maintain detailed personnel files. The module supports various contract types including full-time, part-time, contract, and intern.',
    subItems: [
      { name: 'Employee Directory', desc: 'A searchable, filterable directory of all employees with details including employee ID, name, department, designation, contact information, and employment status. Supports advanced filtering by department, status, contract type, and more.' },
      { name: 'Add Employee', desc: 'A step-by-step employee onboarding form that captures personal information, employment details, compensation, bank account details, and emergency contacts. The form includes validation and auto-generates employee IDs.' },
      { name: 'Departments', desc: 'Manage organizational departments including department heads, budgets, and descriptions. Track department-wise employee counts and budget utilization.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Department Manager'],
    tips: [
      'Use bulk import for onboarding multiple employees at once via CSV upload.',
      'Always verify employee details before saving to avoid data corrections later.',
      'Set up departments before adding employees to ensure proper organization.',
      'Use the employee directory search and filters to quickly find specific employees.',
      'Keep employee records updated with current contact information and job details.',
    ],
  },
  {
    num: '03', key: 'company', name: 'Company Management', fileName: 'Company-Management',
    description: 'The Company Management module allows administrators to configure and manage company-wide settings, branch offices, and organizational policies. This module is essential for multi-tenant setups where each company has its own isolated data environment. Administrators can update company information, manage branch locations, and define HR policies that apply across the organization. The module also handles company registration details such as GST and PAN numbers.',
    subItems: [
      { name: 'Company Info', desc: 'View and edit company details including name, code, industry, address, contact information, GST number, PAN number, and subscription plan. Company info is used across all modules for branding and compliance.' },
      { name: 'Branches', desc: 'Manage company branch offices with location details, office capacity, and assigned departments. Branch information is used for attendance location tracking and asset assignment.' },
      { name: 'Policies', desc: 'Create, edit, and manage company HR policies including leave policies, attendance rules, reimbursement guidelines, and code of conduct. Policies can be categorized and versioned for compliance tracking.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Set up company information completely before adding employees to ensure proper data association.',
      'Use the company code system for multi-tenant isolation — each company has a unique code.',
      'Keep GST and PAN numbers accurate for payroll and compliance purposes.',
      'Define clear policies and make them accessible to all employees for transparency.',
      'Regularly review and update company policies to stay compliant with labor laws.',
    ],
  },
  {
    num: '04', key: 'assets', name: 'Asset Management', fileName: 'Asset-Management',
    description: 'The Asset Management module enables organizations to track and manage company assets throughout their lifecycle. From laptops and phones to access cards and equipment, the module provides complete visibility into asset inventory, assignment status, and condition tracking. Administrators can assign assets to employees, track asset requests, and manage asset returns during employee exits. The module supports various asset types and maintains a full audit trail of asset movements.',
    subItems: [
      { name: 'Asset Inventory', desc: 'A comprehensive list of all company assets with details including asset type, name, serial number, condition, and current assignment status. Supports filtering by type, status, and assigned employee.' },
      { name: 'Assign Assets', desc: 'Assign assets to employees with date tracking and condition notes. The system records the assignment date and maintains history of all asset assignments and returns.' },
      { name: 'Requests', desc: 'Employees can submit asset requests which are then reviewed and approved by administrators. The request workflow includes justification, priority, and approval chain.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Record serial numbers and asset tags when adding new assets for easy tracking.',
      'Conduct regular asset audits to verify physical inventory matches system records.',
      'Use the asset condition field to track wear and plan for replacements proactively.',
      'Ensure all assets are returned and accounted for during employee exit processing.',
      'Categorize assets by type for easier management and reporting.',
    ],
  },
  {
    num: '05', key: 'documents', name: 'Document Management', fileName: 'Document-Management',
    description: 'The Document Management module provides a centralized repository for all organizational and employee documents. It supports document upload, categorization, access control, and template management. The module ensures that sensitive documents like ID proofs and contracts are accessible only to authorized personnel, while public documents like certificates can be shared more broadly. Template support enables HR teams to create standardized document formats for consistent communication.',
    subItems: [
      { name: 'All Documents', desc: 'A searchable and filterable document repository showing all uploaded documents with metadata including document type, title, access level, upload date, and uploaded by. Supports filtering by employee, type, and access level.' },
      { name: 'Upload Document', desc: 'Upload new documents with categorization (ID proof, contract, certificate, policy, etc.), access level settings (public, hr-only, confidential), and employee association. Supports multiple file formats.' },
      { name: 'Templates', desc: 'Create and manage document templates for offer letters, appointment letters, experience certificates, and other standard HR documents. Templates can include dynamic placeholders that auto-fill employee data.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Set appropriate access levels for sensitive documents to maintain confidentiality.',
      'Use templates for frequently generated documents to save time and ensure consistency.',
      'Organize documents by type and employee for easy retrieval during audits.',
      'Regularly review document access permissions to ensure compliance with data privacy policies.',
      'Back up important documents and maintain version control for policy documents.',
    ],
  },
  {
    num: '06', key: 'tasks', name: 'Task Management', fileName: 'Task-Management',
    description: 'The Task Management module helps teams organize, track, and complete work efficiently. It provides personal task lists, team task visibility, and reporting capabilities. Users can create tasks with priorities, due dates, and assignments; track progress through status updates; and collaborate through comments. The module supports task categorization, deadline tracking, and workload distribution to ensure nothing falls through the cracks.',
    subItems: [
      { name: 'My Tasks', desc: 'A personal task view showing all tasks assigned to the current user. Includes task title, priority, due date, status, and progress indicators. Supports filtering by status, priority, and due date.' },
      { name: 'Team Tasks', desc: 'A team-level view of all tasks across team members. Managers can see task distribution, identify bottlenecks, and reassign tasks as needed. Includes team workload metrics.' },
      { name: 'Reports', desc: 'Task completion reports with metrics on overdue tasks, completion rates, average resolution time, and team productivity. Reports can be filtered by date range, team, and priority.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Break large tasks into smaller subtasks for better tracking and accountability.',
      'Set realistic due dates and priorities to help team members plan their work effectively.',
      'Use comments on tasks for context and communication instead of separate channels.',
      'Review task reports regularly to identify process bottlenecks and improve workflows.',
      'Archive completed tasks periodically to keep the task list clean and focused.',
    ],
  },
  {
    num: '07', key: 'meetings', name: 'Meeting Management', fileName: 'Meeting-Management',
    description: 'The Meeting Management module streamlines the scheduling, tracking, and documentation of meetings across the organization. Users can schedule meetings with participants, set agendas, and send invitations. The module tracks upcoming and past meetings, manages participant RSVPs, and maintains meeting notes and action items. Integration with calendar systems ensures no scheduling conflicts and improves meeting productivity.',
    subItems: [
      { name: 'Upcoming Meetings', desc: 'View all scheduled meetings with details including title, date, time, location, participants, and agenda. Supports filtering by date range and participant. Includes RSVP tracking.' },
      { name: 'Schedule Meeting', desc: 'Create new meetings with title, date, time, location (physical or virtual), participant selection, agenda items, and meeting notes template. Sends automatic invitations to participants.' },
      { name: 'Past Meetings', desc: 'Access history of completed meetings with notes, action items, and participant feedback. Supports searching and filtering past meetings for reference and follow-up tracking.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Always include an agenda when scheduling meetings to keep discussions focused.',
      'Set meeting durations appropriately — shorter meetings tend to be more productive.',
      'Document action items and assignees during meetings for accountability.',
      'Review past meeting notes before scheduling follow-ups to ensure continuity.',
      'Use the virtual meeting option for remote participants to improve attendance.',
    ],
  },
  {
    num: '08', key: 'rbac', name: 'RBAC & Security', fileName: 'RBAC-and-Security',
    description: 'The RBAC (Role-Based Access Control) & Security module is the backbone of eh2r AI\'s permission system. It allows Super Admins to define roles, configure granular permissions for each module, and maintain comprehensive audit logs. The module supports hierarchical role levels, module-level CRUD permissions (read, write, modify, delete, admin), and system roles that cannot be deleted. Audit logs track all user actions for compliance and security monitoring.',
    subItems: [
      { name: 'Role Master', desc: 'Create and manage roles with configurable fields including name, description, hierarchy level, default dashboard, visible menu items, UI color, and granular permissions. System roles (isSystem=true) cannot be deleted.' },
      { name: 'Permissions', desc: 'Define module-level permissions for each role with CRUD access control (read, write, modify, delete, admin). Permissions can be configured per functional area (HR, Payroll, Attendance, Performance, Learning, Analytics).' },
      { name: 'Audit Logs', desc: 'Comprehensive log of all user actions including login events, data modifications, permission changes, and administrative actions. Each log entry includes timestamp, user, action type, and affected resource.' },
    ],
    roles: ['Super Admin', 'HR Admin'],
    tips: [
      'Follow the principle of least privilege — grant only the minimum permissions required for each role.',
      'Regularly audit role permissions to ensure they align with current organizational needs.',
      'Use system roles as templates when creating custom roles to maintain consistency.',
      'Review audit logs periodically to detect any unauthorized access attempts.',
      'Document role configurations for compliance and onboarding purposes.',
    ],
  },
  {
    num: '09', key: 'talent', name: 'AI Talent Acquisition', fileName: 'AI-Talent-Acquisition', isAI: true,
    description: 'The AI Talent Acquisition module leverages artificial intelligence to streamline the entire recruitment process from job posting to onboarding. AI-powered features include intelligent candidate matching, automated interview scheduling, and smart onboarding workflows. The module manages job postings, maintains a candidate pool, schedules interviews, generates offer letters, and facilitates AI-assisted onboarding. This module significantly reduces time-to-hire and improves candidate quality through data-driven matching.',
    subItems: [
      { name: 'Job Postings', desc: 'Create, publish, and manage job postings with AI-suggested job descriptions, required skills, experience levels, and salary ranges. Track application counts and posting performance metrics.' },
      { name: 'Candidate Pool', desc: 'Maintain a centralized database of candidates with AI-powered skill matching, experience scoring, and cultural fit assessment. Search and filter candidates by skills, experience, education, and availability.' },
      { name: 'Interview Schedule', desc: 'Schedule interviews with automatic calendar integration, AI-generated interview questions based on job requirements, and structured feedback forms. Supports multiple interview rounds with different panelists.' },
      { name: 'Offer Letters', desc: 'Generate and send offer letters using customizable templates with auto-populated candidate and compensation details. Track offer status (sent, accepted, rejected, negotiated) and manage offer revisions.' },
      { name: 'AI Onboarding', desc: 'Automate the onboarding process with AI-generated checklists, document collection workflows, equipment assignment, and orientation scheduling. Track onboarding progress for each new hire.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Recruiter'],
    tips: [
      'Use AI-suggested job descriptions as a starting point and customize them for your specific needs.',
      'Leverage the AI candidate matching to identify top candidates quickly from the pool.',
      'Set up interview question templates for consistent evaluation across candidates.',
      'Track offer letter statuses proactively to reduce candidate drop-off.',
      'Use the AI onboarding checklist to ensure no steps are missed for new hires.',
    ],
  },
  {
    num: '10', key: 'attendance', name: 'Time & Attendance', fileName: 'Time-and-Attendance',
    description: 'The Time & Attendance module provides comprehensive workforce time tracking capabilities. Employees can mark attendance with check-in and check-out times, and the system automatically calculates work hours, overtime, and late arrivals. The module supports multiple shift configurations, holiday calendars, and bulk attendance processing. Detailed reports and export capabilities enable HR teams to analyze attendance patterns and ensure payroll accuracy.',
    subItems: [
      { name: 'Mark Attendance', desc: 'Record daily attendance with check-in and check-out times. Supports location-based attendance marking, automatic late detection based on shift schedule, and half-day tracking. The system calculates total work hours automatically.' },
      { name: 'Shifts', desc: 'Configure and manage work shifts including start time, end time, and grace period for late arrivals. Supports morning, evening, night, and general shifts with employee-to-shift assignment.' },
      { name: 'Holidays', desc: 'Maintain a company holiday calendar with dates, holiday names, and types (national, company, optional). Employees can view upcoming holidays and plan their leaves accordingly.' },
      { name: 'Export Reports', desc: 'Generate and export attendance reports in multiple formats including Excel and PDF. Reports include daily, weekly, and monthly attendance summaries with filters for department, employee, and date range.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Department Manager', 'Employee'],
    tips: [
      'Configure shifts with appropriate grace periods to accommodate minor delays without flagging late arrivals.',
      'Set up the holiday calendar at the beginning of each year for proper leave planning.',
      'Use bulk attendance marking for days when the system is unavailable or for retroactive entries.',
      'Export monthly attendance reports for payroll processing to ensure accurate salary calculations.',
      'Encourage employees to mark attendance at the actual check-in time for accurate tracking.',
    ],
  },
  {
    num: '11', key: 'payroll', name: 'Payroll & Expenses', fileName: 'Payroll-and-Expenses',
    description: 'The Payroll & Expenses module handles the complete payroll lifecycle from processing monthly salaries to managing employee expense claims. It automates salary calculations including basic pay, HRA, DA, conveyance, medical allowance, and bonuses, while also computing deductions for PF, ESI, tax, and professional tax. The expense management system handles employee expense submissions, approval workflows, and reimbursement tracking with detailed audit trails.',
    subItems: [
      { name: 'Process Payroll', desc: 'Run monthly payroll processing with automated calculation of earnings (basic, HRA, DA, conveyance, medical, bonus) and deductions (PF, ESI, tax, professional tax). Supports payroll review, approval, and payment status tracking (pending, processed, paid).' },
      { name: 'Expenses', desc: 'Submit, approve, and track employee expense claims across categories (travel, accommodation, equipment, food, etc.). Includes approval workflow, receipt attachment, and reimbursement status tracking.' },
      { name: 'Reports', desc: 'Generate payroll reports including salary registers, tax reports, PF/ESI reports, and expense summaries. Reports support department-wise, employee-wise, and period-wise filtering with export capabilities.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Payroll Specialist'],
    tips: [
      'Always verify attendance data before running payroll to ensure accurate calculations.',
      'Review payroll in "processed" status before marking as "paid" to catch any errors.',
      'Set up expense approval workflows with multiple levels for high-value claims.',
      'Generate monthly payroll reports for compliance and audit requirements.',
      'Keep tax declaration data updated to ensure accurate TDS calculations.',
    ],
  },
  {
    num: '12', key: 'performance', name: 'Performance Management', fileName: 'Performance-Management', isAI: true,
    description: 'The AI-powered Performance Management module provides a comprehensive framework for evaluating and developing employee performance. It supports periodic performance reviews, goal setting with OKR methodology, and 360-degree feedback collection. AI features include attrition risk prediction, performance trend analysis, and personalized development recommendations. The module helps organizations identify top performers, address underperformance, and create targeted development plans.',
    subItems: [
      { name: 'Performance Reviews', desc: 'Conduct structured performance reviews with self-assessment, manager evaluation, and final rating. Track review status (pending, in-review, completed), objectives, achievements, and feedback. AI provides performance trend insights.' },
      { name: 'Goals & OKRs', desc: 'Set and track organizational, team, and individual goals using the OKR (Objectives and Key Results) framework. Define measurable key results, track progress percentages, and align individual goals with organizational objectives.' },
      { name: '360 Feedback', desc: 'Collect multi-rater feedback from peers, subordinates, managers, and cross-functional collaborators. AI analyzes feedback patterns to identify strengths, areas for improvement, and development recommendations.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Department Manager', 'L&D Manager'],
    tips: [
      'Set clear, measurable objectives at the beginning of each review period.',
      'Use the 360 feedback feature for comprehensive performance evaluation beyond just manager assessment.',
      'Pay attention to AI-generated attrition risk scores to proactively address retention concerns.',
      'Conduct regular check-ins on goal progress rather than waiting for the formal review cycle.',
      'Ensure feedback is specific and actionable to drive meaningful improvement.',
    ],
  },
  {
    num: '13', key: 'learning', name: 'Learning & Development', fileName: 'Learning-and-Development', isAI: true,
    description: 'The AI-powered Learning & Development module manages employee training programs, course enrollments, and certification tracking. AI capabilities include personalized course recommendations based on skill gaps and career goals, learning path optimization, and certification expiry tracking. The module supports various learning providers and course formats, enabling organizations to build a skilled and future-ready workforce through data-driven L&D initiatives.',
    subItems: [
      { name: 'Courses', desc: 'Create and manage training courses with details including title, description, category, duration, provider, and associated skills. AI suggests relevant courses based on organizational skill gaps and industry trends.' },
      { name: 'Enrollments', desc: 'Manage course enrollments with status tracking (enrolled, in-progress, completed, dropped). Track completion rates, time spent, and learner feedback. AI recommends courses to employees based on their role, skills, and career aspirations.' },
      { name: 'Certifications', desc: 'Track employee certifications with issue dates, expiry dates, and verification status. Set up automatic reminders for certification renewals and maintain a central repository of all employee certifications.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Department Manager', 'L&D Manager'],
    tips: [
      'Use AI course recommendations to create personalized learning paths for each employee.',
      'Set certification expiry reminders to ensure compliance requirements are always met.',
      'Track completion rates to measure the effectiveness of your L&D programs.',
      'Align course offerings with organizational skill gap analysis for maximum impact.',
      'Encourage employees to complete courses by linking learning achievements to performance reviews.',
    ],
  },
  {
    num: '14', key: 'projects', name: 'Project Kanban', fileName: 'Project-Kanban',
    description: 'The Project Kanban module provides a visual project management system with Kanban boards, project tracking, and timeline management. Teams can organize work using boards with customizable columns (Backlog, To Do, In Progress, Done), create and move cards across stages, and track project progress at a glance. The module supports multiple boards, card assignments, priority levels, due dates, and comment threads for collaborative project execution.',
    subItems: [
      { name: 'Kanban Board', desc: 'Interactive Kanban board with horizontally scrollable columns. Cards display priority badges (low/medium/high/urgent), tags, due dates, assignee avatars, and move-left/move-right buttons. Supports creating new cards and columns.' },
      { name: 'Projects', desc: 'Create and manage projects with details including name, description, team members, milestones, and status. Link Kanban boards to projects for visual task management.' },
      { name: 'Timelines', desc: 'View project timelines with milestones, deadlines, and progress indicators. Gantt-style visualization helps teams understand dependencies and track overall project health.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Use consistent column names across boards to standardize workflow stages.',
      'Set due dates on cards to enable timely completion tracking.',
      'Assign cards to specific team members to ensure clear accountability.',
      'Use priority badges to help team members focus on the most important tasks first.',
      'Archive completed boards periodically to keep the workspace organized.',
    ],
  },
  {
    num: '15', key: 'clients', name: 'Client Portal', fileName: 'Client-Portal',
    description: 'The Client Portal module enables organizations to manage client relationships, support tickets, and service requests in a unified interface. It provides a comprehensive view of client accounts, ticket management with priority and status workflows, and resume access tracking for staffing companies. The module helps maintain strong client relationships through responsive support and transparent service delivery tracking.',
    subItems: [
      { name: 'Clients', desc: 'Manage client accounts with details including company name, contact person, industry, subscription tier, and status. Track resume access usage and client engagement metrics.' },
      { name: 'Tickets', desc: 'Create, assign, and resolve support tickets with priority levels (low, medium, high, urgent), categories, and status workflow (open, in_progress, resolved, closed). Includes comment threads for ticket communication.' },
      { name: 'Service Requests', desc: 'Track service requests from clients with request type, urgency, assigned team, and fulfillment status. Link service requests to client accounts for comprehensive tracking.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Respond to high-priority tickets within SLA timeframes to maintain client satisfaction.',
      'Use ticket categories for routing requests to the right team members automatically.',
      'Track resume access metrics to ensure clients are getting value from their subscriptions.',
      'Document resolution steps in ticket comments for knowledge base building.',
      'Review client engagement metrics regularly to identify upsell opportunities.',
    ],
  },
  {
    num: '16', key: 'subvendors', name: 'Sub Vendor Management', fileName: 'Sub-Vendor-Management',
    description: 'The Sub Vendor Management module handles the complete lifecycle of staffing sub-vendor relationships. It enables organizations to manage vendor profiles, collect and track resumes from vendors, and monitor the candidate pipeline from submission through placement. The module provides visibility into vendor performance, resume quality, and placement rates, helping organizations optimize their vendor partnerships and streamline the staffing supply chain.',
    subItems: [
      { name: 'Vendors', desc: 'Manage sub-vendor profiles with company details, contact information, specialization areas, and active status. Track resume count, placement rates, and vendor performance metrics.' },
      { name: 'Resume Uploads', desc: 'Collect and manage resumes submitted by vendors. Track resume metadata including candidate name, skills, experience, and current status in the pipeline.' },
      { name: 'Assignments', desc: 'Track candidate assignments from vendor resume submission through shortlisting, interview, offer, and placement. Monitor pipeline conversion rates and vendor effectiveness.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Evaluate vendor performance regularly based on resume quality and placement conversion rates.',
      'Maintain clear communication with vendors about job requirements and candidate expectations.',
      'Track the entire pipeline to identify bottlenecks in the staffing process.',
      'Use vendor specialization tags to match vendors with appropriate job openings.',
      'Regularly update vendor status to reflect current partnerships accurately.',
    ],
  },
  {
    num: '17', key: 'jobportal', name: 'AI Job Portal', fileName: 'AI-Job-Portal', isAI: true,
    description: 'The AI-powered Job Portal module is a comprehensive recruitment pipeline management system. It provides a 7-tab interface covering the entire hiring process from candidate application to background verification. AI features include candidate fit scoring, automated interview question generation, and intelligent candidate matching. The module manages candidates, applications, interviews (both human and AI-conducted), offer letters, onboarding checklists, and background checks in a unified platform.',
    subItems: [
      { name: 'Resumes', desc: 'Collect and manage candidate resumes with AI-powered parsing that extracts skills, experience, and education. Supports bulk resume upload and automated candidate profile creation.' },
      { name: 'Search', desc: 'AI-powered candidate search with natural language queries, skill-based filtering, and experience matching. The system ranks candidates by relevance and fit score for the position.' },
      { name: 'Shortlisted', desc: 'Track shortlisted candidates with evaluation scores, interview feedback, and comparison tools. Move candidates through pipeline stages with one-click actions.' },
      { name: 'Interviews', desc: 'Schedule and manage both human and AI-conducted interviews. AI interviews generate role-specific questions, record responses, and provide automated scoring and feedback summaries.' },
      { name: 'Offer Letters', desc: 'Generate offer letters from templates with auto-populated salary details, start dates, and department information. Track offer status through sent, accepted, rejected, and negotiated stages.' },
      { name: 'Background Check', desc: 'Conduct and track background verification across multiple categories: criminal, education, employment, address, and drug screening. Each check has clear/flagged/failed status tracking.' },
    ],
    roles: ['Super Admin'],
    tips: [
      'Use AI fit scores to prioritize candidates but always validate with human evaluation.',
      'Create structured interview templates for consistent candidate assessment.',
      'Start background checks early in the process to avoid last-minute delays.',
      'Track offer letter acceptance rates to optimize your offer strategy.',
      'Use the pipeline view to identify bottlenecks and improve hiring velocity.',
    ],
  },
  {
    num: '18', key: 'analytics', name: 'Analytics & Reporting', fileName: 'Analytics-and-Reporting', isAI: true,
    description: 'The AI-powered Analytics & Reporting module transforms HR data into actionable insights. It provides interactive dashboards for HR analytics, custom report building capabilities, and data export functionality. AI features include predictive analytics for workforce planning, trend identification, and anomaly detection. The module enables data-driven decision making across all HR functions with visualizations that make complex data easy to understand and act upon.',
    subItems: [
      { name: 'HR Analytics', desc: 'Interactive dashboards displaying key HR metrics including headcount trends, attrition rates, hiring velocity, diversity metrics, and department-wise analytics. AI identifies trends and provides predictive insights.' },
      { name: 'Custom Reports', desc: 'Build custom reports by selecting data sources, metrics, dimensions, and visualization types. Save report configurations for recurring use and schedule automated report generation.' },
      { name: 'Export Data', desc: 'Export data and reports in multiple formats (Excel, PDF, CSV) for offline analysis and sharing. Schedule automated exports and distribution to stakeholders.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'L&D Manager'],
    tips: [
      'Start with pre-built HR analytics dashboards and customize them for your needs.',
      'Use AI-generated insights to identify trends you might miss with manual analysis.',
      'Schedule regular report generation to keep stakeholders informed automatically.',
      'Export data for deep-dive analysis in your preferred BI tools when needed.',
      'Monitor attrition and hiring metrics proactively to address workforce challenges early.',
    ],
  },
  {
    num: '19', key: 'selfservice', name: 'Employee Self-Service', fileName: 'Employee-Self-Service',
    description: 'The Employee Self-Service module empowers employees to manage their own HR-related tasks without depending on HR staff. Employees can view and update their profiles, apply for leaves, access payslips, and raise service requests. The module reduces HR workload by enabling employees to handle routine tasks independently while maintaining proper approval workflows for sensitive actions. It provides a convenient one-stop portal for all employee HR needs.',
    subItems: [
      { name: 'My Profile', desc: 'View and update personal information including contact details, address, emergency contacts, and bank account information. Changes to sensitive fields may require HR approval.' },
      { name: 'My Leaves', desc: 'View leave balance, apply for leaves (casual, sick, earned, maternity), track leave application status, and cancel pending leave requests. View leave history and upcoming approved leaves.' },
      { name: 'My Payslips', desc: 'Access and download monthly payslips with detailed salary breakdown including earnings, deductions, and net pay. View historical payslips and tax withholding information.' },
      { name: 'Raise Request', desc: 'Submit service requests for IT support, HR queries, facility requests, and other workplace needs. Track request status and communicate with the assigned resolver.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Department Manager', 'Employee', 'Payroll Specialist', 'Recruiter', 'L&D Manager'],
    tips: [
      'Keep your profile information updated for accurate records and communication.',
      'Apply for leaves in advance whenever possible to help managers plan team capacity.',
      'Download and save payslips for tax filing and financial planning purposes.',
      'Use the raise request feature for any workplace needs instead of informal channels.',
      'Check your leave balance before applying to avoid rejections due to insufficient balance.',
    ],
  },
  {
    num: '20', key: 'profile', name: 'My Profile', fileName: 'My-Profile',
    description: 'The My Profile module provides a focused view of the current user\'s personal and employment information. Unlike the broader Employee Self-Service module, My Profile is dedicated to viewing and managing the user\'s own detailed profile including personal information, employment history, and associated documents. It serves as the single source of truth for an employee\'s data within the system and provides quick access to profile editing and document management.',
    subItems: [
      { name: 'Personal Info', desc: 'View and edit personal details including full name, date of birth, gender, contact information (phone, email), address, and emergency contacts. Some fields may require HR approval for changes.' },
      { name: 'Employment', desc: 'View employment details including employee ID, department, designation, job title, contract type, join date, salary, and reporting manager. Track employment status and contract details.' },
      { name: 'Documents', desc: 'Access and upload personal documents including ID proofs, certificates, contracts, and other employment-related documents. Manage document visibility and access permissions.' },
    ],
    roles: ['Super Admin', 'HR Admin', 'Department Manager', 'Employee', 'Payroll Specialist', 'Recruiter', 'L&D Manager'],
    tips: [
      'Review your profile periodically to ensure all information is current and accurate.',
      'Upload all required documents during onboarding to complete your employee file.',
      'Update emergency contact information whenever there are changes.',
      'Keep your bank account details updated for accurate salary processing.',
      'Check your employment details if you notice any discrepancies in your records.',
    ],
  },
];

const ROLES = [
  {
    key: 'super-admin', name: 'Super Admin', fileName: 'Super-Admin',
    description: 'The Super Admin role has unrestricted access to all 20 modules in eh2r AI. As the highest authority in the system, Super Admins manage company configuration, create and assign roles, define permissions, monitor audit logs, and handle system-wide settings. They are responsible for the initial system setup, ongoing configuration, and ensuring that all other users have appropriate access levels. Super Admins can also manage billing, subscriptions, and data export.',
    modules: ['dashboard', 'employees', 'company', 'assets', 'documents', 'rbac', 'talent', 'attendance', 'payroll', 'performance', 'learning', 'analytics', 'projects', 'clients', 'subvendors', 'jobportal', 'selfservice', 'profile', 'tasks', 'meetings'],
    moduleNames: ['Dashboard', 'Employee Management', 'Company Management', 'Asset Management', 'Document Management', 'RBAC & Security', 'AI Talent Acquisition', 'Time & Attendance', 'Payroll & Expenses', 'Performance Management', 'Learning & Development', 'Analytics & Reporting', 'Project Kanban', 'Client Portal', 'Sub Vendor Management', 'AI Job Portal', 'Employee Self-Service', 'My Profile', 'Task Management', 'Meeting Management'],
    workflows: [
      'Initial company setup including branches, departments, and designations',
      'Role creation and permission configuration for all user types',
      'Employee onboarding with proper role and department assignment',
      'Monitoring system-wide dashboards, analytics, and compliance reports',
      'Managing billing, subscriptions, and system configuration changes',
      'Reviewing audit logs for security and compliance monitoring',
      'Handling escalations that require administrative intervention',
    ],
    email: 'admin@company.com', password: 'Admin@2024', dashboard: 'admin',
  },
  {
    key: 'hr-admin', name: 'HR Admin', fileName: 'HR-Admin',
    description: 'The HR Admin role manages day-to-day HR operations including employee management, talent acquisition, attendance tracking, payroll processing, and performance management. HR Admins have broad access to HR-related modules but cannot modify system-level configurations or manage company settings. They focus on employee lifecycle management, recruitment, compliance, and workforce planning. This role is ideal for HR managers and HR business partners who need comprehensive HR functionality.',
    modules: ['dashboard', 'employees', 'rbac', 'talent', 'attendance', 'payroll', 'performance', 'learning', 'analytics', 'selfservice'],
    moduleNames: ['Dashboard', 'Employee Management', 'RBAC & Security', 'AI Talent Acquisition', 'Time & Attendance', 'Payroll & Expenses', 'Performance Management', 'Learning & Development', 'Analytics & Reporting', 'Employee Self-Service'],
    workflows: [
      'Managing the complete employee lifecycle from onboarding to exit',
      'Processing recruitment through the AI Talent Acquisition module',
      'Running monthly payroll and managing expense claims',
      'Conducting and overseeing performance review cycles',
      'Managing attendance, shifts, and leave approvals',
      'Monitoring HR analytics and generating compliance reports',
      'Coordinating learning and development programs',
    ],
    email: 'priya.sharma@company.com', password: 'HRAdmin@2024', dashboard: 'hr',
  },
  {
    key: 'department-manager', name: 'Department Manager', fileName: 'Department-Manager',
    description: 'The Department Manager role focuses on team management, performance oversight, and attendance tracking for a specific department. Managers can view their team members, approve leaves, conduct performance reviews, and track learning progress. They have visibility into employee details and attendance data but limited access to payroll and system configuration. This role is designed for team leads and department heads who manage people and need insight into team performance.',
    modules: ['dashboard', 'employees', 'attendance', 'performance', 'learning', 'selfservice'],
    moduleNames: ['Dashboard', 'Employee Management', 'Time & Attendance', 'Performance Management', 'Learning & Development', 'Employee Self-Service'],
    workflows: [
      'Monitoring team attendance and approving leave requests',
      'Conducting performance reviews and setting goals for team members',
      'Tracking team learning and certification progress',
      'Viewing employee details within their department',
      'Managing daily team operations through the dashboard',
      'Recommending training and development opportunities for team members',
    ],
    email: 'rajesh.kumar@company.com', password: 'Manager@2024', dashboard: 'manager',
  },
  {
    key: 'employee', name: 'Employee', fileName: 'Employee',
    description: 'The Employee role provides self-service access for individual employees to manage their own HR-related tasks. Employees can view their dashboard, mark attendance, and access the self-service portal for leave applications, payslip downloads, and service requests. This role has the most restricted access, focusing on personal data and actions rather than organizational management. It is designed for all regular employees who need to interact with the HR system for their personal needs.',
    modules: ['dashboard', 'attendance', 'selfservice'],
    moduleNames: ['Dashboard', 'Time & Attendance', 'Employee Self-Service'],
    workflows: [
      'Viewing personal dashboard with relevant metrics and updates',
      'Marking daily attendance with check-in and check-out',
      'Applying for leaves and tracking application status',
      'Downloading payslips and viewing salary details',
      'Raising service requests for workplace needs',
      'Updating personal profile information',
    ],
    email: 'sneha.reddy@company.com', password: 'Employee@2024', dashboard: 'employee',
  },
  {
    key: 'payroll-specialist', name: 'Payroll Specialist', fileName: 'Payroll-Specialist',
    description: 'The Payroll Specialist role is focused on payroll processing and financial operations. Payroll Specialists have access to the payroll module for salary processing, tax calculations, and report generation, along with basic dashboard and self-service access. They can view HR data for payroll purposes but cannot modify employee records or access other HR modules. This role is designed for finance team members who handle monthly payroll runs, expense approvals, and financial compliance.',
    modules: ['dashboard', 'payroll', 'selfservice'],
    moduleNames: ['Dashboard', 'Payroll & Expenses', 'Employee Self-Service'],
    workflows: [
      'Processing monthly payroll for all employees',
      'Reviewing and approving employee expense claims',
      'Generating payroll reports for compliance and audits',
      'Managing tax deductions and statutory compliance',
      'Viewing attendance data for payroll accuracy',
      'Handling salary revisions and arrears processing',
    ],
    email: 'amit.patel@company.com', password: 'Payroll@2024', dashboard: 'payroll',
  },
  {
    key: 'recruiter', name: 'Recruiter', fileName: 'Recruiter',
    description: 'The Recruiter role focuses on talent acquisition and recruitment operations. Recruiters have access to the AI Talent Acquisition module for managing job postings, candidate pipelines, interview scheduling, and offer management. They also have basic dashboard and self-service access. This role is designed for recruitment specialists and talent acquisition teams who need to manage the end-to-end hiring process efficiently using AI-powered tools.',
    modules: ['dashboard', 'talent', 'selfservice'],
    moduleNames: ['Dashboard', 'AI Talent Acquisition', 'Employee Self-Service'],
    workflows: [
      'Creating and publishing job postings with AI assistance',
      'Managing the candidate pool and reviewing applications',
      'Scheduling and coordinating interviews with candidates and panelists',
      'Generating and tracking offer letters',
      'Managing the AI-powered onboarding process for new hires',
      'Tracking recruitment metrics and time-to-hire analytics',
    ],
    email: 'fatima.khan@company.com', password: 'Recruiter@2024', dashboard: 'recruiter',
  },
  {
    key: 'ld-manager', name: 'L&D Manager', fileName: 'LD-Manager',
    description: 'The L&D Manager role manages learning, development, and performance programs across the organization. L&D Managers have access to the Learning & Development module for course management and enrollment tracking, the Performance module for review oversight, and self-service for personal needs. They can create courses, track learning progress, manage certifications, and oversee performance review cycles. This role is designed for training managers and L&D professionals who drive skill development initiatives.',
    modules: ['dashboard', 'learning', 'performance', 'selfservice'],
    moduleNames: ['Dashboard', 'Learning & Development', 'Performance Management', 'Employee Self-Service'],
    workflows: [
      'Creating and managing training courses and learning paths',
      'Enrolling employees in courses and tracking completion',
      'Managing certification programs and tracking expiry dates',
      'Overseeing performance review cycles and providing guidance',
      'Analyzing skill gaps and recommending targeted training',
      'Generating learning and development reports for leadership',
    ],
    email: 'meera.iyer@company.com', password: 'LDManager@2024', dashboard: 'learning',
  },
];

// ─── Generate Home.md ──────────────────────────────────────────────
function generateHome() {
  const moduleLinks = MODULES.map((m, i) => `| ${String(i+1).padStart(2, '0')} | ${m.isAI ? '🤖 ' : ''}${m.name} | [Training Page](${BASE_URL}/Training-${m.num}-${m.key}-${m.fileName}) | [📹 Video](${VIDEO_BASE}/${m.num}-${m.key}-${m.fileName}.mp4) |`).join('\n');
  const roleLinks = ROLES.map(r => `| ${r.name} | [Training Page](${BASE_URL}/Role-Training-${r.fileName}) | [📹 Video](${VIDEO_BASE}/${r.key}-${r.fileName}.mp4) |`).join('\n');
  const credRows = CREDENTIALS.map(c => `| ${c.role} | ${c.email} | ${c.password} | ${c.dashboard} |`).join('\n');

  return `# 🏠 eh2r AI — An AI Product of MARQ AI

Welcome to the **eh2r AI** wiki — your comprehensive guide to the AI-powered Human Resource Management System built by MARQ AI. This wiki provides complete training documentation, module guides, role-based access references, and frequently asked questions to help you get the most out of the platform.

> **Live Application**: [${LIVE_URL}](${LIVE_URL}) | **GitHub Repository**: [maheshkpreddy/ai-hrms](https://github.com/maheshkpreddy/ai-hrms) | **Company Code**: \`${COMPANY_CODE}\`

---

## 🚀 Quick Start

1. **Access the Application**: Open [${LIVE_URL}](${LIVE_URL}) in your browser
2. **Enter Company Code**: Type \`${COMPANY_CODE}\` (for the demo environment)
3. **Log In**: Use your assigned email and password (see credentials table below)
4. **Explore Modules**: Use the sidebar navigation to access your available modules
5. **Watch Training Videos**: Follow the module and role training pages below

📖 **[Getting Started Guide](${BASE_URL}/Getting-Started)** | ❓ **[FAQ](${BASE_URL}/FAQ)**

---

## 📋 Demo Login Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
${credRows}

> ⚠️ **Note**: These are demo credentials for the ACME Corporation. In production, each organization receives unique credentials.

---

## 📦 Module Training (20 Modules)

The eh2r AI platform consists of 20 integrated modules covering every aspect of HR management. Modules marked with 🤖 are AI-powered, providing intelligent automation and insights.

| # | Module | Training Page | Training Video |
|---|--------|--------------|----------------|
${moduleLinks}

---

## 👤 Role Training (7 Roles)

Each user role provides access to specific modules and features. Click on a role below to view the complete training guide for that role.

| Role | Training Page | Training Video |
|------|--------------|----------------|
${roleLinks}

### Role → Module Access Matrix

| Module | Super Admin | HR Admin | Dept. Manager | Employee | Payroll Spec. | Recruiter | L&D Manager |
|--------|:-----------:|:--------:|:-------------:|:--------:|:------------:|:---------:|:-----------:|
${MODULES.map(m => `| ${m.isAI ? '🤖 ' : ''}${m.name} | ${m.roles.includes('Super Admin') ? '✅' : '❌'} | ${m.roles.includes('HR Admin') ? '✅' : '❌'} | ${m.roles.includes('Department Manager') ? '✅' : '❌'} | ${m.roles.includes('Employee') ? '✅' : '❌'} | ${m.roles.includes('Payroll Specialist') ? '✅' : '❌'} | ${m.roles.includes('Recruiter') ? '✅' : '❌'} | ${m.roles.includes('L&D Manager') ? '✅' : '❌'} |`).join('\n')}

---

## 🤖 AI-Powered Modules

The following modules leverage artificial intelligence for enhanced functionality:

- **AI Talent Acquisition** — Intelligent candidate matching, AI-generated interview questions, automated onboarding
- **Performance Management** — Attrition risk prediction, performance trend analysis, personalized recommendations
- **Learning & Development** — Personalized course recommendations, skill gap analysis, learning path optimization
- **AI Job Portal** — Candidate fit scoring, AI interviews, automated resume parsing
- **Analytics & Reporting** — Predictive analytics, trend identification, anomaly detection

---

## 📱 Mobile App

A Flutter mobile application is available for Android and iOS, providing on-the-go HR access including:
- Company-wise login with biometric authentication
- Mark attendance with GPS geolocation
- Apply and track leave requests
- View payslips and payroll information
- AI HR Assistant chatbot

---

## 🎬 All Training Videos

Training videos with voice-over narration are available for all modules and user roles. Videos can be downloaded from the [GitHub Releases](https://github.com/maheshkpreddy/ai-hrms/releases/tag/training-videos) section.

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Live Application | [${LIVE_URL}](${LIVE_URL}) |
| GitHub Repository | [maheshkpreddy/ai-hrms](https://github.com/maheshkpreddy/ai-hrms) |
| Wiki Home | [${BASE_URL}](${BASE_URL}) |
| Getting Started | [${BASE_URL}/Getting-Started](${BASE_URL}/Getting-Started) |
| FAQ | [${BASE_URL}/FAQ](${BASE_URL}/FAQ) |

---

*eh2r AI — An AI Product of MARQ AI*
`;
}

// ─── Generate Getting-Started.md ───────────────────────────────────
function generateGettingStarted() {
  const credRows = CREDENTIALS.map(c => `| ${c.role} | ${c.email} | ${c.password} | ${c.dashboard} |`).join('\n');

  return `# 🚀 Getting Started with eh2r AI

This guide will help you get up and running with **eh2r AI — An AI Product of MARQ AI** in just a few minutes. Whether you are a Super Admin setting up the system for the first time, or an employee logging in for the first time, this guide covers everything you need to know.

📖 [Back to Wiki Home](${BASE_URL}/Home) | ❓ [FAQ](${BASE_URL}/FAQ)

---

## Step 1: Access the Application

Open your web browser and navigate to the eh2r AI application:

🔗 **[${LIVE_URL}](${LIVE_URL})**

> **Supported Browsers**: Chrome, Firefox, Safari, Edge (latest versions recommended)

The login page features a two-panel design with the eh2r AI branding on the left and the login form on the right.

---

## Step 2: Enter Your Company Code

eh2r AI uses a multi-tenant architecture where each organization has a unique company code. This ensures data isolation between companies.

1. On the login page, enter your company code in the **Company Code** field
2. For the demo environment, use: **\`${COMPANY_CODE}\`**
3. The system will verify the company code and display the company name
4. Click **Continue** to proceed to the login form

> 💡 **Tip**: Your company code is provided by your HR administrator. It is typically a short alphanumeric code (e.g., ACME, TECH01).

---

## Step 3: Log In with Your Credentials

Enter your registered email address and password to log in:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
${credRows}

1. Enter your **email address** (e.g., admin@company.com)
2. Enter your **password** (e.g., Admin@2024)
3. Click **Sign In** to log in
4. Optionally, use **Google OAuth** for single sign-on if configured

> ⚠️ **Security**: Change your default password immediately after first login using the Change Password option in your profile.

---

## Step 4: Navigate the Interface

After logging in, you will see the main application interface:

### Module Home Page
- A grid of 20 interactive module cards with icons
- AI-powered modules display an "AI" badge
- Recently added modules display a "New" badge
- Click any card to open that module

### Sidebar Navigation
- **Expanded mode**: Full module labels with search bar and sub-menus
- **Collapsed mode**: Icon-only view (toggle with the collapse button)
- **Search**: Type to quickly find any module
- **Sub-menus**: Click a module to expand its sub-items
- **Keyboard shortcut**: Press **Ctrl+B** to toggle the sidebar

### Dashboard
- Your role-specific dashboard with KPIs and charts
- Quick action cards for common tasks
- Recent activity feed with timestamps

---

## Step 5: Explore Your Modules

Based on your role, you will have access to different modules. Here is a quick overview:

### For Super Admins
You have access to **all 20 modules**. Start with Company Management to configure your organization, then set up RBAC for user access, and proceed with Employee Management.

### For HR Admins
Focus on Employee Management, AI Talent Acquisition, Time & Attendance, Payroll & Expenses, and Performance Management for your daily HR operations.

### For Department Managers
Use the Dashboard for team overview, manage attendance approvals, conduct performance reviews, and track team learning progress.

### For Employees
Access your Dashboard, mark daily attendance, and use the Self-Service portal for leave applications, payslip downloads, and service requests.

### For Payroll Specialists
Process monthly payroll, manage expense claims, and generate financial reports.

### For Recruiters
Manage job postings, candidate pipelines, interview scheduling, and offer letters through the AI Talent Acquisition module.

### For L&D Managers
Create and manage training courses, track enrollments and certifications, and oversee performance review cycles.

---

## Step 6: Watch Training Videos

Comprehensive training videos with voice-over narration are available for every module and role:

- **Module Videos**: Step-by-step walkthrough of each module's features
- **Role Videos**: Complete guide to workflows available for each user role

📖 [Module Training Pages](${BASE_URL}/Home#module-training-20-modules) | [Role Training Pages](${BASE_URL}/Home#role-training-7-roles)

---

## Step 7: Mobile App Setup

Download the eh2r AI mobile app for on-the-go access:

- **Android**: Available on Google Play Store
- **iOS**: Available on Apple App Store

The mobile app supports attendance marking with GPS, leave management, payslip access, and an AI HR chatbot.

---

## Common First-Time Tasks

| Task | Module | How To |
|------|--------|--------|
| Change password | My Profile | Profile → Security → Change Password |
| Update personal info | My Profile | Profile → Personal Info → Edit |
| Apply for leave | Self-Service | Self-Service → My Leaves → Apply |
| Mark attendance | Attendance | Attendance → Mark Attendance → Check In |
| Download payslip | Self-Service | Self-Service → My Payslips → Download |
| Submit expense | Payroll | Payroll → Expenses → Submit |
| Raise a request | Self-Service | Self-Service → Raise Request → Submit |

---

## Getting Help

- 📖 Browse the [Wiki Home](${BASE_URL}/Home) for complete documentation
- ❓ Check the [FAQ](${BASE_URL}/FAQ) for common questions
- 📧 Contact your HR administrator for account-related issues
- 🐛 Report bugs through the GitHub repository [Issues](https://github.com/maheshkpreddy/ai-hrms/issues) page

---

*eh2r AI — An AI Product of MARQ AI*
`;
}

// ─── Generate FAQ.md ───────────────────────────────────────────────
function generateFAQ() {
  return `# ❓ Frequently Asked Questions

This page answers the most commonly asked questions about **eh2r AI — An AI Product of MARQ AI**. If you cannot find the answer to your question here, please contact your HR administrator or open an issue on the [GitHub repository](https://github.com/maheshkpreddy/ai-hrms/issues).

📖 [Back to Wiki Home](${BASE_URL}/Home) | 🚀 [Getting Started](${BASE_URL}/Getting-Started)

---

## 🔐 Login & Access

### Q: How do I log in to eh2r AI?
**A**: Navigate to [${LIVE_URL}](${LIVE_URL}), enter your company code (e.g., \`${COMPANY_CODE}\`), then enter your email and password. See the [Getting Started Guide](${BASE_URL}/Getting-Started) for detailed instructions.

### Q: I forgot my password. How do I reset it?
**A**: Contact your HR administrator or Super Admin to reset your password. You can also use the "Forgot Password" link on the login page if it has been configured by your administrator.

### Q: What is a company code?
**A**: The company code is a unique identifier for your organization in the multi-tenant eh2r AI system. It ensures that you access only your company's data. Your HR administrator provides this code.

### Q: Can I log in with my Google account?
**A**: Yes, if Google OAuth has been configured by your administrator, you can use the "Sign in with Google" option on the login page.

### Q: Why can't I see certain modules in the sidebar?
**A**: Module visibility is controlled by your assigned role. Each role has access to specific modules. Contact your administrator if you believe you should have access to additional modules. See the [Role Access Matrix](${BASE_URL}/Home#role--module-access-matrix) for details.

---

## 📦 Modules & Features

### Q: What are the AI-powered modules?
**A**: Five modules leverage AI capabilities: **AI Talent Acquisition** (intelligent candidate matching), **Performance Management** (attrition risk prediction), **Learning & Development** (personalized course recommendations), **AI Job Portal** (candidate fit scoring, AI interviews), and **Analytics & Reporting** (predictive analytics). These modules are marked with an AI badge in the interface.

### Q: How many modules does eh2r AI have?
**A**: The platform includes 20 modules covering the complete HR lifecycle: Dashboard, Employee Management, Company Management, Asset Management, Document Management, Task Management, Meeting Management, RBAC & Security, AI Talent Acquisition, Time & Attendance, Payroll & Expenses, Performance Management, Learning & Development, Project Kanban, Client Portal, Sub Vendor Management, AI Job Portal, Analytics & Reporting, Employee Self-Service, and My Profile.

### Q: How do I navigate between modules?
**A**: Use the sidebar navigation on the left side of the screen. Click on a module to expand its sub-items. You can also use the search bar in the sidebar to quickly find modules. Press Ctrl+B to toggle the sidebar between expanded and collapsed views.

### Q: What is the Module Home page?
**A**: The Module Home page displays all 20 modules as interactive cards in a grid layout. You can click on any card to open that module. This page serves as a visual navigation hub.

---

## 👤 Roles & Permissions

### Q: What roles are available in eh2r AI?
**A**: There are 7 predefined roles: Super Admin, HR Admin, Department Manager, Employee, Payroll Specialist, Recruiter, and L&D Manager. Each role has specific module access and permission levels.

### Q: Can I have multiple roles?
**A**: Each user is assigned one primary role. If you need access to additional modules, contact your Super Admin to adjust your role permissions or create a custom role with the required access.

### Q: How are permissions configured?
**A**: Super Admins configure permissions through the RBAC & Security module. Permissions are defined at the module level with CRUD granularity (read, write, modify, delete, admin) for each functional area.

### Q: Can custom roles be created?
**A**: Yes, Super Admins can create custom roles through the Role Master in the RBAC & Security module. Custom roles can have any combination of module access and permission levels.

---

## 💰 Payroll & Attendance

### Q: How do I mark my attendance?
**A**: Navigate to the Time & Attendance module and click "Mark Attendance." Enter your check-in time when you start work and check-out time when you leave. The system automatically calculates work hours and flags late arrivals based on your shift.

### Q: How do I apply for leave?
**A**: Go to Employee Self-Service → My Leaves → Apply. Select the leave type (casual, sick, earned, maternity), enter the dates and reason, then submit. Your manager will receive the request for approval.

### Q: How do I access my payslips?
**A**: Navigate to Employee Self-Service → My Payslips. You can view and download payslips for any month. Payslips include a detailed breakdown of earnings, deductions, and net pay.

### Q: How is payroll processed?
**A**: Payroll Specialists or HR Admins process payroll through the Payroll & Expenses module. The system calculates earnings and deductions based on configured salary structures, attendance data, and tax rules. Payroll goes through pending → processed → paid statuses.

---

## 🤖 AI Features

### Q: How does the AI Talent Acquisition work?
**A**: The AI Talent Acquisition module uses machine learning to match candidates with job requirements, generate interview questions, and predict candidate fit. It analyzes candidate skills, experience, and other factors to provide fit scores and recommendations.

### Q: What is AI-based performance prediction?
**A**: The Performance Management module uses AI to predict attrition risk for employees based on various factors including performance trends, engagement signals, and market conditions. This helps managers take proactive retention actions.

### Q: How does the AI Job Portal interview work?
**A**: The AI Job Portal can conduct automated interviews where AI generates role-specific questions, records candidate responses, and provides automated scoring and feedback summaries. This speeds up the initial screening process significantly.

---

## 📱 Mobile App

### Q: Is there a mobile app available?
**A**: Yes, eh2r AI has a Flutter mobile app available for both Android and iOS. You can download it from the respective app stores. Links are available on the login page.

### Q: What features are available on the mobile app?
**A**: The mobile app supports company-wise login, biometric authentication, GPS-based attendance marking, leave management, payslip viewing, an AI HR chatbot, and push notifications for approvals and updates.

---

## 🔧 Technical & Administration

### Q: What browsers are supported?
**A**: Chrome, Firefox, Safari, and Edge (latest versions) are fully supported. For the best experience, we recommend using the latest version of Chrome.

### Q: Is my data secure?
**A**: Yes, eh2r AI implements multi-tenant data isolation, role-based access control, encrypted passwords (bcrypt), audit logging, and secure API endpoints. Each company's data is completely isolated from others.

### Q: How do I report a bug or request a feature?
**A**: Open an issue on the [GitHub repository](https://github.com/maheshkpreddy/ai-hrms/issues) with a clear description of the bug or feature request. Include steps to reproduce for bugs.

### Q: Can eh2r AI be self-hosted?
**A**: Yes, eh2r AI is an open-source project. You can clone the repository and deploy it on your own infrastructure. See the repository README for deployment instructions.

---

## 📹 Training Videos

### Q: Where can I find training videos?
**A**: Training videos are available for all 20 modules and 7 roles. Access them through the individual training pages linked from the [Wiki Home](${BASE_URL}/Home), or download them directly from the [GitHub Releases](https://github.com/maheshkpreddy/ai-hrms/releases/tag/training-videos) page.

### Q: Are training videos available offline?
**A**: Yes, all training videos can be downloaded as MP4 files for offline viewing. Right-click the video link and select "Save link as..." to download.

---

*eh2r AI — An AI Product of MARQ AI*
`;
}

// ─── Generate Module Training Page ─────────────────────────────────
function generateModuleTraining(m) {
  const videoFileName = `${m.num}-${m.key}-${m.fileName}.mp4`;
  const videoUrl = `${VIDEO_BASE}/${videoFileName}`;
  const aiBadge = m.isAI ? ' 🤖' : '';
  const subItemsContent = m.subItems.map((s, i) => `### ${i + 1}. ${s.name}\n\n${s.desc}\n\n**Steps to use ${s.name}:**\n1. Navigate to the ${m.name} module from the sidebar or module home page\n2. Click on "${s.name}" from the sub-menu\n3. ${s.name === 'Overview' || s.name === 'Dashboard Overview' ? 'Review the displayed metrics and charts for insights' : 'Use the available options to create, view, edit, or manage records'}\n4. Apply filters or search as needed to find specific items\n5. Save or submit your changes when complete`).join('\n\n');
  const roleAccess = m.roles.map(r => `- **${r}**`).join('\n');
  const tipsContent = m.tips.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const otherModules = MODULES.filter(other => other.key !== m.key).slice(0, 5).map(other => `[${other.name}](${BASE_URL}/Training-${other.num}-${other.key}-${other.fileName})`).join(' | ');

  return `# ${aiBadge} ${m.name} — Module Training

> **Module**: ${m.name} | **Number**: ${m.num}/20${m.isAI ? ' | **AI-Powered**: Yes' : ''}

📖 [Back to Wiki Home](${BASE_URL}/Home) | 🚀 [Getting Started](${BASE_URL}/Getting-Started) | ❓ [FAQ](${BASE_URL}/FAQ)

---

## 🎬 Training Video

📽️ **[Watch Training Video](${videoUrl})**

> Right-click the link above and select "Save link as..." to download the MP4 video, or click to stream in your browser.

---

## 📋 Module Overview

${m.description}

The ${m.name} module is accessible from both the sidebar navigation and the module home page grid. It contains the following sub-items that provide specialized functionality within the module.

---

## 🔧 Sub-Items & Features

${subItemsContent}

---

## 👤 Role Access

The following roles have access to the ${m.name} module:

${roleAccess}

> 💡 **Note**: The level of access (read, write, modify, delete) varies by role. Super Admins have full access, while other roles may have restricted permissions. Check the [Role Access Matrix](${BASE_URL}/Home#role--module-access-matrix) for details.

---

## 📝 Step-by-Step Usage Instructions

### Getting Started
1. **Log in** to eh2r AI at [${LIVE_URL}](${LIVE_URL}) with your credentials
2. **Navigate** to the ${m.name} module using the sidebar or module home page
3. **Select** the appropriate sub-item from the module menu
4. **Perform** the desired action (create, view, edit, or manage records)
5. **Save** your changes and verify the results

### Common Actions
${m.subItems.map(s => `- **${s.name}**: Access via ${m.name} → ${s.name}`).join('\n')}

### Best Practices for ${m.name}
- Always review data before submitting or saving changes
- Use search and filter options to quickly find specific records
- Check for validation errors and correct them before saving
- Log out when you are done to protect your account security

---

## 💡 Tips & Best Practices

${tipsContent}

---

## 📸 Screenshots

*Screenshots will be added here to provide visual guidance for each feature within the ${m.name} module.*

| Feature | Screenshot |
|---------|-----------|
| ${m.name} - Main View | *[Placeholder: Main module interface showing the primary dashboard/list view]* |
${m.subItems.map(s => `| ${s.name} | *[Placeholder: ${s.name} interface showing key features and actions]* |`).join('\n')}

---

## 🔗 Related Modules

${otherModules}

---

## 📚 Additional Resources

- [Getting Started Guide](${BASE_URL}/Getting-Started)
- [FAQ](${BASE_URL}/FAQ)
- [Role Training Pages](${BASE_URL}/Home#role-training-7-roles)
- [All Training Videos](${BASE_URL}/Home#all-training-videos)

---

*eh2r AI — An AI Product of MARQ AI*
`;
}

// ─── Generate Role Training Page ───────────────────────────────────
function generateRoleTraining(r) {
  const videoFileName = `${r.key}-${r.fileName}.mp4`;
  const videoUrl = `${VIDEO_BASE}/${videoFileName}`;
  const modulesContent = r.modules.map((m, i) => `- **${r.moduleNames[i]}** (\`${m}\`) — [Module Training](${BASE_URL}/Training-${MODULES.find(mod => mod.key === m)?.num || '00'}-${m}-${MODULES.find(mod => mod.key === m)?.fileName || m})`).join('\n');
  const workflowsContent = r.workflows.map((w, i) => `${i + 1}. ${w}`).join('\n');
  const otherRoles = ROLES.filter(other => other.key !== r.key).map(other => `[${other.name}](${BASE_URL}/Role-Training-${other.fileName})`).join(' | ');

  return `# 👤 ${r.name} — Role Training

> **Role**: ${r.name} | **Dashboard**: ${r.dashboard}

📖 [Back to Wiki Home](${BASE_URL}/Home) | 🚀 [Getting Started](${BASE_URL}/Getting-Started) | ❓ [FAQ](${BASE_URL}/FAQ)

---

## 🎬 Training Video

📽️ **[Watch Role Training Video](${videoUrl})**

> Right-click the link above and select "Save link as..." to download the MP4 video, or click to stream in your browser.

---

## 📋 Role Overview

${r.description}

---

## 🔑 Demo Credentials

| Field | Value |
|-------|-------|
| **Company Code** | \`${COMPANY_CODE}\` |
| **Email** | ${r.email} |
| **Password** | ${r.password} |
| **Dashboard** | ${r.dashboard} |

**Login URL**: [${LIVE_URL}/login](${LIVE_URL}/login)

---

## 📦 Accessible Modules

As a **${r.name}**, you have access to the following **${r.modules.length}** module(s):

${modulesContent}

> 💡 **Note**: While you can access these modules, your permission level within each module may vary (read, write, modify, delete). See the [RBAC & Security](${BASE_URL}/Training-08-rbac-RBAC-and-Security) module for detailed permission configurations.

---

## 🔄 Key Workflows

The following are the primary workflows you will perform as a **${r.name}**:

${workflowsContent}

---

## 📝 Step-by-Step Getting Started

### First Login
1. Open [${LIVE_URL}](${LIVE_URL}) in your browser
2. Enter the company code: **\`${COMPANY_CODE}\`**
3. Enter your email: **${r.email}**
4. Enter your password: **${r.password}**
5. Click **Sign In** to access your ${r.name} dashboard

### Daily Routine
${r.modules.slice(0, 3).map((m, i) => `${i + 1}. Check the **${r.moduleNames[i]}** module for updates and pending actions`).join('\n')}

### Common Tasks
${r.modules.map(m => {
  const mod = MODULES.find(mod => mod.key === m);
  return `- **${mod?.name || m}**: Navigate to the module → Select sub-item → Perform action`;
}).join('\n')}

---

## 💡 Tips & Best Practices

1. Start your day by checking the dashboard for pending actions and important updates
2. Use the sidebar search to quickly find modules instead of scrolling through the list
3. Keep your profile information updated for accurate records and communication
4. Log out when you are done, especially when using shared computers
5. Report any issues or feature requests through the appropriate channels
6. Watch the training video above for a visual walkthrough of all your available features
7. Contact your system administrator if you need access to additional modules

---

## 📸 Screenshots

*Screenshots will be added here to provide visual guidance for the ${r.name} role.*

| Feature | Screenshot |
|---------|-----------|
| ${r.name} Dashboard | *[Placeholder: Dashboard view specific to the ${r.name} role]* |
| Module Navigation | *[Placeholder: Sidebar showing available modules for ${r.name}]* |
| Key Workflow | *[Placeholder: Primary workflow interface for ${r.name}]* |

---

## 🔗 Other Role Training Pages

${otherRoles}

---

## 📚 Additional Resources

- [Getting Started Guide](${BASE_URL}/Getting-Started)
- [FAQ](${BASE_URL}/FAQ)
- [Module Training Pages](${BASE_URL}/Home#module-training-20-modules)
- [Role Access Matrix](${BASE_URL}/Home#role--module-access-matrix)
- [All Training Videos](${BASE_URL}/Home#all-training-videos)

---

*eh2r AI — An AI Product of MARQ AI*
`;
}

// ─── Write All Files ───────────────────────────────────────────────
console.log('Generating wiki files...\n');

// Home.md
fs.writeFileSync(path.join(WIKI_DIR, 'Home.md'), generateHome());
console.log('✅ Home.md');

// Getting-Started.md
fs.writeFileSync(path.join(WIKI_DIR, 'Getting-Started.md'), generateGettingStarted());
console.log('✅ Getting-Started.md');

// FAQ.md
fs.writeFileSync(path.join(WIKI_DIR, 'FAQ.md'), generateFAQ());
console.log('✅ FAQ.md');

// Module training pages
for (const m of MODULES) {
  const fileName = `Training-${m.num}-${m.key}-${m.fileName}.md`;
  fs.writeFileSync(path.join(WIKI_DIR, fileName), generateModuleTraining(m));
  console.log(`✅ ${fileName}`);
}

// Role training pages
for (const r of ROLES) {
  const fileName = `Role-Training-${r.fileName}.md`;
  fs.writeFileSync(path.join(WIKI_DIR, fileName), generateRoleTraining(r));
  console.log(`✅ ${fileName}`);
}

console.log('\n✨ All 30 wiki files generated successfully!');
