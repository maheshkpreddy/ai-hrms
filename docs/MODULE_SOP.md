# AI-HRMS Module-wise Standard Operating Procedures

## Table of Contents

1. [Authentication & Login](#1-authentication--login)
2. [Dashboard](#2-dashboard)
3. [Employee Management](#3-employee-management)
4. [Company Management](#4-company-management)
5. [Task Management](#5-task-management)
6. [Time & Attendance](#6-time--attendance)
7. [Payroll & Expenses](#7-payroll--expenses)
8. [Talent Acquisition (Recruitment)](#8-talent-acquisition-recruitment)
9. [Performance Management](#9-performance-management)
10. [Project Management](#10-project-management)
11. [Meeting Management](#11-meeting-management)
12. [Learning & Development](#12-learning--development)
13. [Asset Management](#13-asset-management)
14. [Document Management](#14-document-management)
15. [RBAC & Security](#15-rbac--security)
16. [Analytics & Reporting](#16-analytics--reporting)
17. [Self-Service Portal](#17-self-service-portal)
18. [Profile Management](#18-profile-management)
19. [Settings](#19-settings)

---

## 1. Authentication & Login

### Module Overview
The Authentication module serves as the gateway to the AI-HRMS platform, handling user identity verification, session management, and access control. It implements a dual authentication strategy combining traditional email/password credentials with Google OAuth for enterprise single sign-on. The module leverages NextAuth.js v4 with JWT-based session management, ensuring stateless authentication that scales seamlessly across Vercel serverless deployments. All passwords are hashed using bcryptjs with a salt factor of 12. The system supports seven distinct role levels ranging from Super Admin to Employee.

### Configured Workflows

#### Email/Password Login Flow
1. User navigates to `/login` page
2. System displays login form with email and password fields, plus Google OAuth button
3. User enters credentials and clicks Sign In
4. Frontend calls NextAuth `signIn('credentials')` with email/password
5. NextAuth CredentialsProvider invokes `authorize()` callback
6. Backend queries `prisma.user.findUnique({ where: { email } })` to locate user
7. `bcryptjs.compare()` validates password against stored hash
8. On success: JWT token created with user id, email, role, roleId, permissions, employeeId
9. On failure: error message displayed, failed attempt logged in AuditLog
10. Client receives session via NextAuth JWT strategy (24h maxAge)
11. User redirected to main dashboard at `/`

#### Google OAuth Login Flow
1. User clicks "Sign in with Google" on login page
2. Google OAuth consent screen presented
3. Google returns authorization code and profile data
4. NextAuth GoogleProvider callback invoked
5. System queries existing user by email via `prisma.user.findUnique()`
6. If user exists: link Google Account record, update lastLoginAt, create AuditLog
7. If new user: auto-create User with 'Employee' role, create Account record, create AuditLog
8. JWT token issued with full role/permissions payload
9. Session established, user redirected to dashboard

#### Password Change Flow
1. User navigates to Profile > Change Password
2. Frontend presents form: current password, new password, confirm password
3. `POST /api/auth/change-password` with `{ currentPassword, newPassword }`
4. Backend verifies current password via `bcryptjs.compare()`
5. Validates new password meets minimum 6 character requirement
6. Hashes new password with `bcryptjs.hash(password, 12)`
7. Updates `prisma.user.update({ passwordHash })`
8. Creates AuditLog entry for password change event

### Screen Descriptions

#### Login Page (`/login`)
Full-page login with dark gradient background (#0f172a to #1e293b). Left panel contains the login form with email input, password input with show/hide toggle, error message area, Sign In button, and Google OAuth button. Right panel (desktop only) displays 7 demo credential cards for different roles (Super Admin, HR Admin, Payroll Specialist, Department Manager, Employee, Recruiter, L&D Manager), each with click-to-fill functionality. Mobile responsive with stacked layout.

#### Main App Page (`/`)
After authentication, the main application page renders with a top header bar showing the current module title, date, online status indicator, and user dropdown menu with avatar initials, role badge, and sign out option. The sidebar navigation lists all 18 modules with AI-powered badges on Talent Acquisition, Performance, L&D, and Analytics modules.

### Module Integrations
- **NextAuth.js v4** — Core authentication framework handling JWT sessions, credentials provider, and Google OAuth provider
- **Prisma ORM** — User and Account model queries for credential verification and user creation
- **bcryptjs** — Password hashing (salt factor 12) and comparison for credential validation
- **Zustand Store** — Client-side session state propagation for role-based UI rendering
- **AuditLog Model** — Every login attempt (success/failure) and password change is recorded
- **Middleware** — NextAuth `withAuth` protects all routes except `/api/auth`, `/login`, `/_next/*`

### Data Models
- **User**: id, email, passwordHash, name, role, lastLoginAt
- **Account**: id, userId, provider, providerAccountId, access_token, refresh_token
- **Role**: id, name, level, permissions (JSON)
- **AuditLog**: id, action, module, details, userId, employeeId, createdAt

---

## 2. Dashboard

### Module Overview
The Dashboard module provides an executive-level overview of the entire HRMS platform, aggregating data from all other modules into a single, AI-powered analytics view. It fetches real-time data from the `/api/dashboard` endpoint, which performs multiple Prisma aggregation queries. The dashboard renders four key metric cards, two Recharts visualizations, an Expense & Category Breakdown bar chart, Quick Actions grid, Recent Activities timeline, and Pending Approvals panel.

### Configured Workflows

#### Dashboard Data Loading Flow
1. Component mounts, `useApi<DashboardData>` hook triggers `GET /api/dashboard`
2. Backend aggregates: totalEmployees count, activeEmployees count, recentHires, presentToday/absentToday
3. Computes department headcount via `prisma.employee.groupBy({ by: ['department'] })`
4. Computes attendance distribution, leave type distribution, expense by category
5. Fetches performance averages (avgRating, avgAttritionRisk, totalReviews)
6. Fetches candidate pipeline counts grouped by status
7. Fetches recent 20 AuditLog entries with employee relation for activity feed
8. Returns unified DashboardData JSON
9. Frontend renders stat cards, Recharts visualizations, activity timeline

#### Quick Action Navigation Flow
1. User clicks a Quick Action button (e.g., 'Add Employee', 'Process Payroll')
2. `setActiveModule(targetModule)` called on Zustand store
3. Main `page.tsx` detects `activeModule` change
4. Module component mapping lookup resolves to target component
5. Active component rendered in place of dashboard

### Screen Descriptions

#### Dashboard View
Full-width layout with max-w-7xl container. Row 1: 4 stat cards (Total Employees, Active Positions, Attendance Rate, Monthly Payroll). Row 2: Department Headcount area chart + Department Distribution donut chart. Row 3: Expense & Category Breakdown bar chart + Quick Actions grid with 6 buttons + Performance Summary. Row 4: Recent Activities timeline + Pending Approvals panel.

### Module Integrations
- Employee Module — Total count, active count, department distribution
- Attendance Module — Present/absent counts for attendance rate
- Payroll Module — Monthly payroll total
- Leave Module — Pending leave counts
- Expense Module — Pending expenses and category breakdown
- Performance Module — Average rating, attrition risk
- Talent Acquisition — Open jobs, candidate pipeline
- AuditLog — Recent 20 activities
- Zustand Store — `setActiveModule()` for navigation

---

## 3. Employee Management

### Module Overview
The Employee Management module is the central hub for all employee lifecycle operations. It provides comprehensive CRUD operations for 20+ fields per employee, server-side pagination, filtering, full-text search, organizational chart, Excel export, and detailed employee profiles with assets and documents.

### Configured Workflows

#### Add Employee Flow
1. User clicks 'Add Employee' button
2. Dialog opens with 17-field form
3. System auto-generates employeeId: `EMP{nextNumber}`
4. User fills required fields
5. `POST /api/employees` with complete data
6. Backend checks for duplicate email
7. Creates employee record and AuditLog
8. Success toast, list refetched, dialog closes

#### Employee Search & Filter Flow
1. User types search or selects filters
2. `useApi` re-triggers GET with updated params
3. Backend applies Prisma where clause with OR conditions
4. Returns paginated results
5. Table re-renders with filtered results

#### Excel Export Flow
1. User clicks 'Export' button
2. `exportEmployeeReport()` called
3. Maps filtered employees to export format
4. xlsx library creates workbook
5. Auto-downloads as `Employee_Report_YYYY-MM-DD.xlsx`

#### View Employee Detail Flow
1. User clicks eye icon
2. Side panel fetches assets and documents
3. Sheet displays: Personal, Employment, Financial info + Assets + Documents

### Screen Descriptions

#### Employee List View
Header with employee icon, title, count badges. Action bar: search, Org Chart toggle, Export, Add Employee. Filter card with 3 selects. Data table with avatar initials, ID, department, designation, contract type badge, status badge, join date, action buttons.

#### Add/Edit Employee Dialog
Two-column form with 17 fields organized into Personal Info, Employment Info, and Financial Info sections.

#### Employee Detail Sheet
Right-side slide-out panel with avatar, full name, status/contract badges, three info sections with icon rows, and salary show/hide toggle.

#### Organizational Chart
Expandable tree: Root node > Department nodes (with chevron toggle) > Employee nodes with initials, name, designation, status badge.

### Module Integrations
- Department Module — Dropdown in add/edit form and filter
- Asset Module — Asset listing in employee detail
- Document Module — Document listing in employee detail
- Excel Export — `exportEmployeeReport()` for data export
- AuditLog — All CRUD operations logged
- Payroll, Attendance, Leave — Employee ID links to related records

---

## 4. Company Management

### Module Overview
Enables multi-company and multi-branch operations with auto-generated join codes, member management with approval workflows, and office location tracking with geofencing.

### Configured Workflows

#### Company Creation Flow
1. User clicks 'Create Company'
2. Form: name, industry, description, website, size
3. `POST /api/companies` auto-generates 6-char join code
4. Creator auto-added as 'owner' member
5. AuditLog created

#### Join Company Flow
1. Employee enters join code
2. `POST /api/companies/join` finds company by code
3. Creates CompanyMember with status 'pending'
4. Owner approves or rejects via Members tab
5. `PATCH /api/companies/members` updates status

#### Office Location & Geofence Setup
1. Admin clicks 'Add Location'
2. Fills: name, address, lat, lng, radius (default 500m)
3. `POST /api/office-locations` creates geofence record

### Module Integrations
- Employee Module — Members linked via employeeId
- Task, Meeting, Project Modules — Scoped to companyId
- Attendance Module — Geofence validation against office locations
- Policy Module — Company policies per company

---

## 5. Task Management

### Module Overview
Comprehensive task tracking with multi-assignee support, priority levels, status tracking, and threaded comments. Tasks auto-finish when all assignments complete.

### Configured Workflows

#### Task Creation & Assignment Flow
1. User clicks 'Create Task'
2. Form: title, description, companyId, priority, dueDate, assigneeIds
3. `POST /api/tasks` creates task + TaskAssignment records
4. Each assignment starts as 'not_started'

#### Task Progress Update Flow
1. Assignee updates their assignment status
2. `PATCH /api/tasks/assignments` with new status
3. System checks if ALL assignments are 'finished'
4. If all finished: auto-updates task status to 'finished'

#### Task Comment Flow
1. User types comment in task detail
2. `POST /api/tasks/comments` with taskId, employeeId, content, isHr flag
3. Comment appears in thread with timestamp and HR badge

### Module Integrations
- Company Module — Tasks scoped to companyId
- Employee Module — Assignments via TaskAssignment.employeeId
- Project Module — Tasks linked to project milestones
- AuditLog — All changes logged

---

## 6. Time & Attendance

### Module Overview
Handles time tracking, geofence-based check-in, attendance statuses, shift management, holiday calendar, and leave management with approval workflows.

### Configured Workflows

#### Mark Attendance Flow
1. System checks current date and employee's shift
2. If geofencing enabled: browser requests geolocation
3. Coordinates compared against office location radius
4. Within radius: 'Mark Attendance' enabled
5. `POST /api/attendance` with employeeId, date, status, checkInTime, location
6. Backend checks for duplicate (same employee + same date)
7. Status: 'present' or 'late' based on shift grace time

#### Leave Request Flow
1. Employee selects leave type, dates, reason
2. `POST /api/leaves` creates pending request
3. Manager approves or rejects
4. `PATCH /api/leaves` updates status

#### Attendance Report Export
1. User selects date range
2. `exportAttendanceReport()` generates Excel

### Module Integrations
- Employee Module — Employee data for records
- Office Location Module — Geofence coordinates
- Shift Module — Grace time thresholds
- Holiday Module — Calendar affects expectations
- Payroll Module — Attendance affects salary

---

## 7. Payroll & Expenses

### Module Overview
Indian payroll compliance with auto-calculated components (HRA, DA, PF, ESI, Professional Tax) and expense claim management with three-stage approval workflow.

### Configured Workflows

#### Payroll Processing Flow
1. HR clicks 'Process Payroll' for a month
2. System fetches all active employees
3. Auto-calculates: HRA = basic × 0.40, DA = basic × 0.10, PF = basic × 0.12, ESI = gross × 0.0075, ProfTax = 200
4. Net = Gross - PF - ESI - ProfTax
5. `POST /api/payroll` creates records
6. Manual adjustments possible; recalculation on any change

#### Expense Claim Flow
1. Employee submits expense
2. Manager approves/rejects
3. Finance marks as reimbursed
4. Reimbursed records are immutable

### Module Integrations
- Employee Module — Salary and bank details
- Attendance Module — Absence deductions
- Leave Module — Unpaid leave adjustments
- Dashboard — Monthly totals and pending counts

---

## 8. Talent Acquisition (Recruitment)

### Module Overview
AI-powered recruitment engine with applicant tracking, AI Fit Score evaluation, and automated AI-driven interviews using Z-AI SDK.

### Configured Workflows

#### Job Posting Flow
1. Recruiter fills job details (title, department, requirements, skills as JSON)
2. `POST /api/jobs` creates record

#### Candidate Application & Screening Flow
1. Candidate added or applies
2. System auto-calculates `aiFitScore` (skill matching percentage)
3. Recruiter reviews sorted by fit score
4. Status pipeline: applied → screening → interview → offered → hired/rejected

#### AI Interview Flow (Optional)
1. Recruiter clicks 'Start AI Interview'
2. `POST /api/ai-interview/generate-questions` uses Z-AI SDK
3. 8-10 questions generated across 4 categories (technical, behavioral, problem_solving, culture_fit)
4. Falls back to hardcoded questions if AI fails
5. Candidate proceeds through questions
6. Responses stored as JSON
7. Recruiter reviews and makes final decision (AI is advisory only)

### Module Integrations
- Z-AI Web Dev SDK — Question generation and chat processing
- Employee Module — Hiring converts candidate to employee
- Department Module — Jobs belong to departments
- Dashboard — Open jobs and pipeline data

---

## 9. Performance Management

### Module Overview
Structured performance evaluation with multi-dimensional reviews, OKR alignment, peer feedback, and AI-powered attrition risk prediction.

### Configured Workflows

#### Performance Review Cycle
1. HR initiates review cycle
2. Reviews created with status 'draft'
3. Self-review, manager review, peer feedback collected
4. Status: draft → in-review → completed
5. Average rating and attrition risk calculated

#### Attrition Risk Assessment
1. System evaluates: rating trends, tenure, engagement, absence frequency
2. Risk score 0-1: <0.3 low, 0.3-0.7 medium, >0.7 high
3. High-risk employees flagged for proactive retention

### Module Integrations
- Employee Module — Review subjects and reviewers
- Dashboard — Performance averages and attrition risk
- Leave Module — Absence data for risk calculation
- Learning & Development — Performance gaps inform training

---

## 10. Project Management

### Module Overview
End-to-end project lifecycle management with milestones, team roles, and progress tracking.

### Configured Workflows

#### Project Creation & Setup
1. User creates project with name, description, company, priority, dates
2. Add team members with roles (lead, manager, member)
3. Create milestones with due dates
4. Project transitions: planning → active → completed/cancelled

#### Progress Tracking
1. Lead updates progress percentage
2. Milestones auto-set completedDate when marked complete
3. All milestones complete → suggest marking project completed

### Module Integrations
- Company Module — Project scope
- Employee Module — Team assignments
- Task Module — Project-scoped tasks
- Excel Export — Project reports

---

## 11. Meeting Management

### Module Overview
Meeting scheduling, invitation management, and RSVP tracking with multiple meeting types.

### Configured Workflows

#### Meeting Scheduling
1. User fills: title, type, date, time, attendees
2. `POST /api/meetings` creates meeting + bulk invitations
3. Attendees receive pending invitations

#### RSVP Flow
1. Invitee clicks Accept or Decline
2. `PATCH /api/meetings/invitations` updates status + timestamp
3. Meeting detail updates with RSVP summary

### Module Integrations
- Company Module — Meeting scope
- Employee Module — Attendee management

---

## 12. Learning & Development

### Module Overview
Corporate training management with course enrollments, skill gap analysis, and certification tracking.

### Configured Workflows

#### Course Enrollment
1. Employee browses catalog
2. Clicks 'Enroll' → `POST /api/courses` creates enrollment
3. Status: in-progress → completed
4. Certificate generated on completion

#### Skill Gap Analysis
1. System compares EmployeeSkill records vs. role requirements
2. AI generates course recommendations for gap closure

### Module Integrations
- Employee Module — Skill profiles
- Skill Module — Skill definitions
- Performance Module — Gaps inform recommendations

---

## 13. Asset Management

### Module Overview
IT asset tracking with assignment/return lifecycle, condition tracking, and status management.

### Configured Workflows

#### Asset Assignment
1. Admin fills: employee, type, name, serial, condition
2. `POST /api/assets` creates record with status 'assigned'
3. Asset appears in employee profile

#### Asset Return
1. Admin updates status: returned/damaged/lost
2. Asset removed from employee's active list
3. AuditLog created

### Module Integrations
- Employee Module — Assets linked via employeeId
- AuditLog — All lifecycle events logged

---

## 14. Document Management

### Module Overview
Centralized document storage with access level controls (public, hr-only, confidential, manager-only).

### Configured Workflows

#### Document Upload
1. HR selects employee, docType, accessLevel, file
2. `POST /api/documents` creates record
3. Access enforced by role against accessLevel

#### Document Access Control
- **hr-only**: HR Admin, Super Admin, Payroll Specialist
- **confidential**: Super Admin and HR Admin only
- **manager-only**: Employee's direct manager + HR roles
- **public**: All authenticated users

### Module Integrations
- Employee Module — Documents linked via employeeId
- RBAC Module — Access levels enforced by role
- Self-Service Module — Employees view own public documents

---

## 15. RBAC & Security

### Module Overview
Hierarchical role system with granular JSON permissions and comprehensive audit logging.

### Role Levels
| Level | Role | Description |
|-------|------|-------------|
| 0 | Super Admin | Full system access, all modules |
| 1 | HR Admin | HR operations, employee management |
| 2 | Payroll Specialist | Payroll processing, expense approval |
| 3 | Department Manager | Department-level operations |
| 4 | Recruiter | Talent acquisition, candidate management |
| 5 | L&D Manager | Learning & development operations |
| 6 | Employee | Self-service, profile management |

### Configured Workflows

#### Role Permission Management
1. Super Admin selects role
2. Toggles permissions in matrix (modules × actions)
3. `PATCH /api/roles` updates permissions JSON
4. Changes take effect immediately

#### Audit Log Review
1. Admin filters by action, module, employee, date range
2. `GET /api/audit` returns paginated immutable entries
3. Logs can be exported for compliance

### Module Integrations
- All Modules — Every write creates AuditLog
- Authentication — Role loaded into JWT
- Document Module — Access levels enforced

---

## 16. Analytics & Reporting

### Module Overview
Advanced data visualization, trend analysis, and automated report generation with AI-powered insights.

### Configured Workflows

#### Report Generation
1. User selects report type and date range
2. System aggregates data from relevant modules
3. Renders interactive Recharts visualizations
4. Excel export via specialized functions

#### Attrition Prediction
1. AI evaluates employee data patterns
2. Risk scores calculated per employee
3. High-risk flagged with recommendations

### Module Integrations
- All Modules — Data aggregation source
- Excel Export — All 6 specialized functions
- Z-AI SDK — AI predictions and insights

---

## 17. Self-Service Portal

### Module Overview
Personalized employee portal aggregating leave balances, payslips, documents, assets, and profile management.

### Configured Workflows

#### Self-Service Leave Request
1. Employee views leave balances
2. Submits request → pending approval
3. Tracks status in portal

#### Self-Service Document Access
1. Employee views own public/manager-level documents
2. Can upload personal documents

### Module Integrations
- Leave, Payroll, Document, Asset, Profile Modules — Data aggregation

---

## 18. Profile Management

### Module Overview
Employee self-service for viewing/updating personal information, avatar upload, and account settings.

### Configured Workflows

#### Profile Update
1. `GET /api/profile` fetches employee + user + role + company
2. Employee edits permitted fields only (phone, address, etc.)
3. `PATCH /api/profile` updates allowed fields
4. Salary, bank details remain HR-managed

#### Avatar Upload
1. Employee selects file or enters URL
2. File converted to base64 on client
3. `POST /api/profile` with avatar data
4. Synced to both Employee.avatar and User.image

### Module Integrations
- Authentication — User model synced
- RBAC — Field-level access control
- Self-Service — Profile data displayed

---

## 19. Settings

### Module Overview
System-wide configuration management for company preferences, notifications, appearance, security, and module feature flags.

### Configured Workflows

#### Settings Configuration
1. Admin navigates to Settings (sidebar bottom)
2. Configures: General, Notifications, Appearance, Security, Modules
3. Settings persisted in Zustand (server-side planned)

### Screen Description
Tabbed interface: General (company info, timezone, date format), Notifications (email toggles), Appearance (theme), Security (session timeout, 2FA), Modules (feature toggles).

---

## Download Links

- 📄 [Module-wise SOP Document (DOCX)](../download/AI-HRMS_Module-wise_SOP_Document.docx)
- 📄 [Comprehensive Technical Documentation (DOCX)](../download/AI-HRMS_Technical_Documentation.docx)
