const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, PageNumber, PageBreak, BorderStyle, WidthType,
  ShadingType, TableOfContents, NumberFormat } = require("docx");
const fs = require("fs");

// ── Palette: Tech/AI theme (DM-1 Deep Cyan) ──
const P = {
  primary: "162235", body: "1A2B40", secondary: "5A6080", accent: "37DCF2",
  surface: "F8F9FF", coverBg: "162235", coverTitle: "FFFFFF",
  coverSub: "B0B8C0", coverMeta: "90989F", coverFooter: "687078",
  tableHeaderBg: "1B6B7A", tableHeaderText: "FFFFFF",
  tableAccentLine: "1B6B7A", tableInnerLine: "C8DDE2", tableSurface: "EDF3F5",
};
const c = (hex) => hex.replace("#","");

// ── Border helpers ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const hBorders = {
  top: { style: BorderStyle.SINGLE, size: 2, color: P.tableAccentLine },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: P.tableAccentLine },
  left: NB, right: NB,
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.tableInnerLine },
  insideVertical: NB,
};

// ── Builders ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function p(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}
function pNoIndent(text) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    indent: { left: 720 + level * 360 },
    spacing: { line: 312, after: 40 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: c(P.accent) }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
    ],
  });
}
function boldBullet(label, desc) {
  return new Paragraph({
    indent: { left: 720 },
    spacing: { line: 312, after: 40 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: c(P.accent) }),
      new TextRun({ text: label + ": ", size: 24, bold: true, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } }),
      new TextRun({ text: desc, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
    ],
  });
}

function makeTable(headers, rows) {
  const cellMargins = { top: 60, bottom: 60, left: 120, right: 120 };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: hBorders,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: P.tableHeaderBg },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22, color: P.tableHeaderText, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] })],
        })),
      }),
      ...rows.map((row, idx) => new TableRow({
        children: row.map(cell => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? P.tableSurface : "FFFFFF" },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 21, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })] })],
        })),
      })),
    ],
  });
}

// ── Module SOP Data ──
const modules = [
  {
    name: "1. Authentication & Login",
    overview: "The Authentication module serves as the gateway to the AI-HRMS platform, handling user identity verification, session management, and access control. It implements a dual authentication strategy combining traditional email/password credentials with Google OAuth for enterprise single sign-on. The module leverages NextAuth.js v4 with JWT-based session management, ensuring stateless authentication that scales seamlessly across Vercel serverless deployments. All passwords are hashed using bcryptjs with a salt factor of 12, providing robust protection against brute-force and rainbow table attacks. The system supports seven distinct role levels ranging from Super Admin to Employee, each with granular permissions stored as JSON in the Role model.",
    workflows: [
      { name: "Email/Password Login Flow", steps: ["User navigates to /login page", "System displays login form with email and password fields, plus Google OAuth button", "User enters credentials and clicks Sign In", "Frontend calls NextAuth signIn('credentials') with email/password", "NextAuth CredentialsProvider invokes authorize() callback", "Backend queries prisma.user.findUnique({ where: { email } }) to locate user", "bcryptjs.compare() validates password against stored hash", "On success: JWT token created with user id, email, role, roleId, permissions, employeeId", "On failure: error message displayed, failed attempt logged in AuditLog", "Client receives session via NextAuth JWT strategy (24h maxAge)", "User redirected to main dashboard at /"] },
      { name: "Google OAuth Login Flow", steps: ["User clicks Sign in with Google on login page", "Google OAuth consent screen presented", "Google returns authorization code and profile data", "NextAuth GoogleProvider callback invoked", "System queries existing user by email via prisma.user.findUnique()", "If user exists: link Google Account record, update lastLoginAt, create AuditLog", "If new user: auto-create User with 'Employee' role, create Account record, create AuditLog", "JWT token issued with full role/permissions payload", "Session established, user redirected to dashboard"] },
      { name: "Password Change Flow", steps: ["User navigates to Profile > Change Password", "Frontend presents form: current password, new password, confirm password", "POST /api/auth/change-password with { currentPassword, newPassword }", "Backend verifies current password via bcryptjs.compare()", "Validates new password meets minimum 6 character requirement", "Hashes new password with bcryptjs.hash(password, 12)", "Updates prisma.user.update({ passwordHash })", "Creates AuditLog entry for password change event", "Returns success; user must re-authenticate on next session"] },
    ],
    screens: [
      { name: "Login Page (/login)", description: "Full-page login with dark gradient background (#0f172a to #1e293b). Left panel contains the login form with email input, password input with show/hide toggle, error message area, Sign In button, and Google OAuth button. Right panel (desktop only) displays 7 demo credential cards for different roles (Super Admin, HR Admin, Payroll Specialist, Department Manager, Employee, Recruiter, L&D Manager), each with click-to-fill functionality. Mobile responsive with stacked layout." },
      { name: "Main App Page (/)", description: "After authentication, the main application page renders with a top header bar showing the current module title, date, online status indicator, and user dropdown menu with avatar initials, role badge, and sign out option. The sidebar navigation lists all 18 modules with AI-powered badges on Talent Acquisition, Performance, L&D, and Analytics modules." },
    ],
    integrations: [
      "NextAuth.js v4 - Core authentication framework handling JWT sessions, credentials provider, and Google OAuth provider",
      "Prisma ORM - User and Account model queries for credential verification and user creation",
      "bcryptjs - Password hashing (salt factor 12) and comparison for credential validation",
      "Zustand Store - Client-side session state propagation for role-based UI rendering",
      "AuditLog Model - Every login attempt (success/failure) and password change is recorded with timestamp, userId, and action details",
      "Middleware (middleware.ts) - NextAuth withAuth protects all routes except /api/auth, /login, /_next/*, and static assets",
    ],
    dataModels: "User (id, email, passwordHash, name, role, lastLoginAt), Account (id, userId, provider, providerAccountId, access_token, refresh_token), Role (id, name, level, permissions JSON), AuditLog (id, action, module, details, userId, employeeId, createdAt)",
  },
  {
    name: "2. Dashboard",
    overview: "The Dashboard module provides an executive-level overview of the entire HRMS platform, aggregating data from all other modules into a single, AI-powered analytics view. It fetches real-time data from the /api/dashboard endpoint, which performs multiple Prisma aggregation queries across Employee, Attendance, Payroll, Leave, Expense, Performance, and Candidate models. The dashboard renders four key metric cards (Total Employees, Active Positions, Attendance Rate, Monthly Payroll), two Recharts visualizations (Department Headcount area chart and Department Distribution donut chart), an Expense & Category Breakdown bar chart, Quick Actions grid with 6 shortcuts, Recent Activities timeline, and Pending Approvals panel.",
    workflows: [
      { name: "Dashboard Data Loading Flow", steps: ["Component mounts, useApi<DashboardData> hook triggers GET /api/dashboard", "Backend aggregates: totalEmployees count, activeEmployees count, recentHires (last 30 days), presentToday/absentToday from Attendance", "Computes department headcount via prisma.employee.groupBy({ by: ['department'] })", "Computes attendance distribution, leave type distribution, expense by category", "Fetches performance averages (avgRating, avgAttritionRisk, totalReviews)", "Fetches candidate pipeline counts grouped by status", "Fetches recent 20 AuditLog entries with employee relation for activity feed", "Returns unified DashboardData JSON with overview, charts, performance, candidatePipeline, recentActivities", "Frontend renders stat cards with trend indicators, Recharts visualizations, activity timeline"] },
      { name: "Quick Action Navigation Flow", steps: ["User clicks a Quick Action button (e.g., 'Add Employee', 'Process Payroll')", "setActiveModule(targetModule) called on Zustand store", "Main page.tsx detects activeModule change via useHRMSStore()", "Module component mapping lookup: moduleComponents[activeModule] resolves to target component", "Active component rendered in place of dashboard", "Sidebar navigation item updates to show active state with emerald highlight bar"] },
    ],
    screens: [
      { name: "Dashboard View", description: "Full-width layout with max-w-7xl container. Row 1: 4 stat cards in responsive grid (Total Employees with emerald icon, Active Positions with amber icon, Attendance Rate with cyan icon, Monthly Payroll with rose icon). Each card shows metric value, trend arrow, and contextual change text. Row 2: Department Headcount area chart (left) and Department Distribution donut chart (right) with custom tooltip styling. Row 3: Expense & Category Breakdown bar chart (left) and Quick Actions grid with 6 action buttons + Performance Summary mini-panel (right). Row 4: Recent Activities timeline (left, scrollable max-h-96) and Pending Approvals panel (right) with approve buttons." },
    ],
    integrations: [
      "Employee Module - Total count, active count, recent hires, department distribution data",
      "Attendance Module - Present/absent today counts for attendance rate calculation",
      "Payroll Module - Total payroll this month for financial overview card",
      "Leave Module - Pending leave request counts for approval panel",
      "Expense Module - Pending expense counts and category breakdown for charts",
      "Performance Module - Average rating, attrition risk, total reviews for summary panel",
      "Talent Acquisition Module - Open jobs count, candidate pipeline data",
      "AuditLog - Recent 20 activities for timeline feed",
      "Zustand Store - setActiveModule() for Quick Action navigation to other modules",
    ],
    dataModels: "DashboardData (overview, charts, performance, candidatePipeline, recentActivities) - computed from Employee, Attendance, Payroll, Leave, Expense, Performance, Candidate, Job, AuditLog, Department models",
  },
  {
    name: "3. Employee Management",
    overview: "The Employee Management module is the central hub for all employee lifecycle operations within the HRMS. It provides comprehensive CRUD operations for employee records, supporting 20+ fields per employee including personal information, employment details, financial data, and organizational hierarchy. The module features server-side pagination, filtering by department/status/contract type, full-text search across name/email/employee ID, an interactive organizational chart, Excel export functionality, and a detailed employee profile view with assets and documents. Employee IDs are auto-generated in EMP001 format, and all operations are audit-logged for compliance tracking.",
    workflows: [
      { name: "Add Employee Flow", steps: ["User clicks 'Add Employee' button in header", "Dialog opens with 17-field form: employeeId (auto), firstName, lastName, email, phone, dateOfBirth, gender, address, department, designation, jobTitle, contractType, joinDate, reportingTo, salary, bankAccount, panNumber, pfNumber", "System auto-generates employeeId: EMP{nextNumber} based on current total count + 1", "User fills required fields (firstName, lastName, email, department, designation, jobTitle, contractType, joinDate)", "Frontend validates: email format, required fields, salary must be numeric", "POST /api/employees with complete employee data", "Backend checks for duplicate email via prisma.employee.findUnique({ where: { email } })", "Creates employee record with prisma.employee.create()", "Creates AuditLog entry with action 'CREATE', module 'hr'", "Frontend shows success toast, refetches employee list, closes dialog"] },
      { name: "Employee Search & Filter Flow", steps: ["User types in search input (debounced) or selects department/status/contract filter", "useApi hook re-triggers GET /api/employees with updated params: search, department, status, page, limit", "Backend applies Prisma where clause: OR conditions for firstName/lastName/email/employeeId contains search term", "Department filter: where.department = selected value", "Status filter: where.status = selected value", "Contract type filter applied client-side (not supported server-side)", "Returns paginated results with { data: employees[], pagination: { page, limit, total, totalPages } }", "Table re-renders with filtered results, footer shows 'Showing X of Y employees'"] },
      { name: "Excel Export Flow", steps: ["User clicks 'Export' button in employee header", "exportEmployeeReport() called from /lib/excelExport.ts", "Maps filteredEmployees to export format with selected columns", "xlsx library creates workbook with headers and data rows", "Auto-generates filename: Employee_Report_YYYY-MM-DD.xlsx", "Triggers browser download of .xlsx file"] },
      { name: "View Employee Detail Flow", steps: ["User clicks eye icon on employee row", "handleView() sets selectedEmployee and opens detail Sheet", "Side panel fetches assets: GET /api/assets?employeeId={id}", "Side panel fetches documents: GET /api/documents?employeeId={id}", "Sheet displays: Personal Information, Employment Information, Financial Information (with show/hide toggle for salary masking), Assets tab, Documents tab", "Reporting manager resolved from employees list by matching reportingTo ID"] },
    ],
    screens: [
      { name: "Employee List View", description: "Header with employee icon, title 'Employee Management', total count badge, active/onboarding counts. Action bar: search input (260px wide), Org Chart toggle button, Export button, Add Employee button. Filter card with 3 select dropdowns (Department, Status, Contract Type) and Clear button. Data table with columns: Employee (avatar initials + name + email), ID (mono code), Department, Designation, Contract Type (colored badge), Status (colored badge), Join Date, Actions (view/edit/delete icon buttons). Table footer shows count summary." },
      { name: "Add/Edit Employee Dialog", description: "Modal dialog with title 'Add Employee' or 'Edit Employee'. Two-column form layout with 17 input fields organized into Personal Info (firstName, lastName, email, phone, dateOfBirth, gender, address), Employment Info (department select, designation, jobTitle, contractType select, joinDate, reportingTo select), and Financial Info (salary, bankAccount, panNumber, pfNumber). Save and Cancel buttons in footer." },
      { name: "Employee Detail Sheet", description: "Right-side slide-out panel (max-w-xl). Header shows avatar initials, full name, designation, employee ID. Status and contract type badges. Three sections: Personal Information (email, phone, DOB, gender, address), Employment Information (department, designation, job title, join date, contract type, reporting to), Financial Information (salary with show/hide toggle, bank account, PAN, PF number). Additional sections for Assets and Documents fetched from their respective APIs." },
      { name: "Organizational Chart", description: "Expandable card showing tree structure. Root node: 'Organization' with total employee count. Department nodes expandable with chevron toggle, showing department name and employee count badge. Employee nodes within departments: avatar circle with initials, full name, designation, and status badge." },
    ],
    integrations: [
      "Department Module - GET /api/departments for department dropdown in add/edit form and filter",
      "Asset Module - GET /api/assets?employeeId={id} for asset listing in employee detail view",
      "Document Module - GET /api/documents?employeeId={id} for document listing in employee detail view",
      "Excel Export Library - /lib/excelExport.ts exportEmployeeReport() for data export",
      "AuditLog - CREATE, UPDATE, DELETE actions on employees logged with details and userId",
      "Payroll Module - Employee salary data feeds payroll calculations",
      "Attendance Module - Employee ID links to attendance records",
      "Leave Module - Employee ID links to leave requests",
    ],
    dataModels: "Employee (id, employeeId, firstName, lastName, email, phone, dateOfBirth, gender, address, department, designation, jobTitle, contractType, status, joinDate, salary, reportingTo, bankAccount, panNumber, pfNumber, avatar)",
  },
  {
    name: "4. Company Management",
    overview: "The Company Management module enables multi-company and multi-branch operations within the HRMS. It supports company creation with auto-generated join codes, member management with approval workflows, office location tracking with geofencing capabilities, and company-level policy management. Companies serve as organizational containers that group employees, tasks, meetings, projects, and office locations together. The join code system allows employees to request membership, which company owners can approve or reject through the members management interface.",
    workflows: [
      { name: "Company Creation Flow", steps: ["User clicks 'Create Company' button", "Form presented: company name, industry, description, website, company size", "POST /api/companies with form data", "Backend auto-generates 6-character alphanumeric join code", "Creator is automatically added as 'owner' member via prisma.companyMember.create()", "Company record created with prisma.company.create()", "AuditLog entry created", "Company appears in list with owner badge"] },
      { name: "Join Company Flow", steps: ["Employee enters company join code in join dialog", "POST /api/companies/join with { code }", "Backend finds company by join code via prisma.company.findFirst({ where: { joinCode } })", "Checks if user already has a membership record", "If no existing record: creates CompanyMember with status 'pending'", "If existing 'pending': returns 'already pending'", "If existing 'rejected': updates status back to 'pending'", "Company owner receives notification of pending request", "Owner navigates to Members > Pending, clicks Approve or Reject", "PATCH /api/companies/members updates status to 'approved' or 'rejected'"] },
      { name: "Office Location & Geofence Setup", steps: ["Admin navigates to Company > Office Locations tab", "Clicks 'Add Location', fills: name, address, latitude, longitude, radius (default 500m), companyId", "POST /api/office-locations creates geofence record", "Location appears on map view with radius circle", "Employees within radius can mark attendance via geofence check-in"] },
    ],
    screens: [
      { name: "Company List View", description: "Card-based layout showing company entries. Each card displays company name, industry badge, description excerpt, member count, join code (copyable), and action buttons (view, edit, delete). 'Create Company' button in header. Search input for filtering by name." },
      { name: "Company Detail View", description: "Tabbed interface with 4 tabs: Overview (company info, stats), Members (member list with role badges, approval actions for pending requests, add member form), Office Locations (location cards with lat/lng/radius, add location form), Policies (company policy documents with version tracking)." },
    ],
    integrations: [
      "Employee Module - Company members linked via employeeId in CompanyMember model",
      "Task Module - Tasks belong to a company (companyId foreign key)",
      "Meeting Module - Meetings scoped to company",
      "Project Module - Projects belong to company",
      "Office Location Module - Locations belong to company with geofence data",
      "Policy Module - Company policies stored per company",
      "Attendance Module - Geofence check-in validates employee location against office locations",
    ],
    dataModels: "Company (id, name, industry, description, website, size, joinCode, createdBy), CompanyMember (id, companyId, employeeId, role, status), OfficeLocation (id, companyId, name, address, latitude, longitude, radius)",
  },
  {
    name: "5. Task Management",
    overview: "The Task Management module provides a comprehensive task tracking and assignment system that supports multi-assignee tasks, priority levels, status tracking, and threaded comments. Tasks are scoped to companies and can be assigned to multiple employees simultaneously. The module implements a sophisticated status workflow where a task automatically transitions to 'finished' status only when all individual assignments are marked complete. Each task supports a full comment thread with HR flagging capability for audit trail purposes.",
    workflows: [
      { name: "Task Creation & Assignment Flow", steps: ["User clicks 'Create Task' button", "Form presented: title, description, companyId, priority (low/medium/high/urgent), dueDate, assigneeIds (multi-select)", "POST /api/tasks with task data and assigneeIds array", "Backend creates task record via prisma.task.create()", "Creates TaskAssignment records for each assignee with status 'not_started'", "Creates AuditLog entry", "Task appears in list with assignee avatars and priority badge"] },
      { name: "Task Progress Update Flow", steps: ["Assignee views their assigned tasks", "Clicks on task to open detail view with assignments and comments", "Updates their assignment status: not_started > in_progress > finished", "PATCH /api/tasks/assignments with { assignmentId, status }", "Backend updates individual assignment status", "System checks if ALL assignments for this task have status 'finished'", "If all finished: auto-updates task status to 'finished'", "If not all finished: task status remains unchanged", "AuditLog created for status change"] },
      { name: "Task Comment Flow", steps: ["User opens task detail view", "Types comment in text area at bottom", "POST /api/tasks/comments with { taskId, employeeId, content, isHr }", "Comment appears in threaded list with timestamp, employee name, and HR badge if flagged", "Comments are read-only (no edit/delete) for audit integrity"] },
    ],
    screens: [
      { name: "Task List View", description: "Kanban-style or list view of tasks. Filter bar: company filter, status filter, priority filter, assignee search. Each task card shows: title, priority badge (color-coded), due date, assignee avatars (stacked), status badge, comment count. 'Create Task' button in header." },
      { name: "Task Detail View", description: "Full task information: title, description, company, priority, status, due date, created date. Assignment section: list of assignees with individual status badges and update buttons. Comment thread: chronological list with employee name, avatar, timestamp, content, and HR badge indicator." },
    ],
    integrations: [
      "Company Module - Tasks scoped to companyId for multi-company support",
      "Employee Module - Task assignments link to employees via TaskAssignment.employeeId",
      "Project Module - Tasks can be linked to project milestones",
      "AuditLog - All task CRUD and status changes logged",
      "Dashboard - Task counts and activity feed integration",
    ],
    dataModels: "Task (id, title, description, companyId, priority, status, dueDate, createdBy), TaskAssignment (id, taskId, employeeId, status), TaskComment (id, taskId, employeeId, content, isHr, createdAt)",
  },
  {
    name: "6. Time & Attendance",
    overview: "The Time & Attendance module handles employee time tracking, attendance marking, shift management, and holiday calendar administration. It supports geofence-based check-in/out, multiple attendance statuses (present, absent, late, half-day), shift scheduling with grace time periods, and comprehensive attendance reporting with Excel export. The module integrates with office locations for geofencing validation, ensuring employees can only mark attendance when physically present within designated office perimeters. Holiday management supports national, company, and optional holiday types.",
    workflows: [
      { name: "Mark Attendance Flow", steps: ["Employee navigates to Time & Attendance module", "System checks current date and employee's assigned shift", "If geofencing enabled: browser requests geolocation permission", "Employee's current coordinates compared against office location radius", "If within radius: 'Mark Attendance' button enabled", "If outside radius: button disabled with 'You are outside office premises' message", "Employee clicks 'Mark Attendance'", "POST /api/attendance with { employeeId, date, status, checkInTime, location }", "Backend checks for duplicate attendance (same employee + same date)", "If no duplicate: creates attendance record with status 'present' or 'late' based on shift grace time", "AuditLog created", "Attendance card updates with check-in time and status badge"] },
      { name: "Leave Request Flow", steps: ["Employee clicks 'Request Leave' in attendance module", "Form presented: leaveType (casual/sick/earned/maternity/paternity), startDate, endDate, reason", "POST /api/leaves with { employeeId, leaveType, startDate, endDate, reason }", "Backend validates: endDate >= startDate, no overlapping approved leaves", "Creates leave record with status 'pending'", "Manager/HR notified of pending request", "Approver reviews in Leave Management section, clicks Approve or Reject", "PATCH /api/leaves updates status to 'approved' or 'rejected'", "Cannot re-process already processed leaves (prevents double-action)", "AuditLog created for approval/rejection"] },
      { name: "Attendance Report Export Flow", steps: ["User selects date range and filters", "Clicks 'Export Report' button", "exportAttendanceReport() called from /lib/excelExport.ts", "Filters attendance data by date range and employee", "Generates Excel with columns: Employee ID, Name, Date, Status, Check-in, Check-out", "Auto-downloads as Attendance_Report_YYYY-MM-DD.xlsx"] },
    ],
    screens: [
      { name: "Attendance Dashboard", description: "Top section: today's attendance summary cards (Present, Absent, Late, On Leave) with counts and percentages. Mark Attendance button with geofence status indicator. Weekly attendance heatmap showing day-by-day status for current week. Bottom section: attendance records table with date, status, check-in/out times, and location data." },
      { name: "Leave Management", description: "Split view: left panel shows leave balance cards by type (Casual, Sick, Earned, Maternity, Paternity) with used/remaining counts. Right panel: leave request form and pending leave list. Manager view: approval queue with approve/reject buttons for each pending request." },
      { name: "Shift Management", description: "Admin-only view. Shift list with name, start time, end time, grace time (minutes), and assigned employee count. Add/Edit shift dialog with time pickers. Delete confirmation with employee reassignment warning." },
      { name: "Holiday Calendar", description: "Calendar view showing holidays color-coded by type (national=red, company=blue, optional=amber). Click date to add holiday with title, type, and description. List view toggle showing all holidays sorted by date with type badges." },
    ],
    integrations: [
      "Employee Module - Employee data for attendance records and leave balances",
      "Office Location Module - Geofence coordinates for check-in validation",
      "Shift Module - Shift schedules determine late/present status thresholds",
      "Holiday Module - Holiday calendar affects attendance expectations",
      "Payroll Module - Attendance data feeds salary calculations and deductions",
      "Excel Export - /lib/excelExport.ts for attendance report generation",
      "Dashboard - Today's attendance counts displayed on main dashboard",
    ],
    dataModels: "Attendance (id, employeeId, date, status, checkInTime, checkOutTime, location, shiftId), Leave (id, employeeId, leaveType, startDate, endDate, reason, status, approvedBy), Shift (id, name, startTime, endTime, graceTime), Holiday (id, name, date, type, description)",
  },
  {
    name: "7. Payroll & Expenses",
    overview: "The Payroll & Expenses module handles Indian payroll compliance with automated component calculations and expense claim management. The payroll engine auto-calculates HRA (40% of basic), DA (10% of basic), PF (12% of basic employee contribution), ESI (0.75% of gross salary), and professional tax (flat Rs.200). These calculations follow Indian statutory requirements and are automatically recomputed whenever any component is updated. The expense management system implements a three-stage approval workflow: pending, approved, and reimbursed, with appropriate constraints preventing modification of rejected or reimbursed claims and deletion of reimbursed claims for audit compliance.",
    workflows: [
      { name: "Payroll Processing Flow", steps: ["HR navigates to Payroll & Expenses > Payroll tab", "Clicks 'Process Payroll' for a specific month", "System fetches all active employees and their base salary data", "Auto-calculates: HRA = basic * 0.40, DA = basic * 0.10, PF = basic * 0.12, ESI = gross * 0.0075, professionalTax = 200", "Gross Salary = basic + HRA + DA; Net Salary = Gross - PF - ESI - professionalTax", "POST /api/payroll creates records for each employee with computed components", "Records created with status 'processed'", "HR reviews and can manually adjust any component", "PATCH /api/payroll recalculates dependent components on any change", "Final payroll report available for export via exportPayrollReport()"] },
      { name: "Expense Claim Flow", steps: ["Employee navigates to Payroll & Expenses > Expenses tab", "Clicks 'Submit Expense', fills: category, amount, date, description, receipt attachment", "POST /api/expenses creates record with status 'pending'", "Manager/HR views pending expenses, clicks Approve or Reject", "PATCH /api/expenses updates status to 'approved' or 'rejected'", "Once approved, finance marks as reimbursed via PATCH /api/expenses", "Status becomes 'reimbursed' - record is now immutable (cannot update or delete)", "AuditLog entries created at each status transition"] },
    ],
    screens: [
      { name: "Payroll View", description: "Month/year selector at top. Payroll table: Employee Name, Employee ID, Basic Salary, HRA, DA, Gross Salary, PF, ESI, Prof. Tax, Net Salary. Each row shows computed values with manual edit capability. Totals row at bottom. Export button generates Excel payroll report. Process Payroll button triggers batch creation." },
      { name: "Expense Management View", description: "Two-tab layout: My Expenses and Approval Queue (for managers). My Expenses: list of submitted claims with status badges (pending=amber, approved=green, rejected=red, reimbursed=blue). Submit Expense form dialog. Approval Queue: pending expenses with employee name, amount, category, Approve/Reject buttons." },
    ],
    integrations: [
      "Employee Module - Employee salary data and bank account details for payroll",
      "Attendance Module - Attendance data affects payroll deductions for absences/late marks",
      "Leave Module - Leave data affects salary for unpaid leaves",
      "Dashboard - Monthly payroll total displayed on dashboard, pending expense count in approvals",
      "Excel Export - /lib/excelExport.ts for payroll and expense report generation",
      "AuditLog - All payroll processing and expense status changes logged",
    ],
    dataModels: "Payroll (id, employeeId, month, year, basicSalary, hra, da, pf, esi, professionalTax, grossSalary, netSalary, status), Expense (id, employeeId, category, amount, date, description, status, approvedBy)",
  },
  {
    name: "8. Talent Acquisition (Recruitment)",
    overview: "The Talent Acquisition module is the AI-powered recruitment engine of the HRMS, combining traditional applicant tracking with intelligent candidate evaluation and automated AI-driven interviews. The module manages the complete recruitment pipeline from job posting through candidate screening, AI interview scheduling, and hiring decisions. It features an AI Fit Score that automatically evaluates candidate-job compatibility based on skill matching, and an AI Interview system that generates role-specific questions across four categories (technical, behavioral, problem-solving, and culture fit) using the Z-AI SDK. The interview system can conduct automated first-round interviews, evaluate responses, and provide hiring recommendations.",
    workflows: [
      { name: "Job Posting Flow", steps: ["Recruiter navigates to Talent Acquisition > Jobs tab", "Clicks 'Post Job', fills: title, department, location, employment type, experience level, description, requirements (JSON array), skills (JSON array), salary range, application deadline", "POST /api/jobs creates job record", "Job appears on job board with applicant count (initially 0)", "Recruiter can edit job details via PATCH /api/jobs", "Cannot delete jobs that have associated candidates (data integrity)"] },
      { name: "Candidate Application & Screening Flow", steps: ["Candidate applies through job listing or recruiter adds manually", "POST /api/candidates creates record with status 'applied'", "System auto-calculates aiFitScore: compares candidate skills against job requirements", "Score calculated as percentage of matching skills + experience level alignment", "Recruiter reviews candidate list sorted by aiFitScore (highest first)", "Updates candidate status: applied > screening > interview > offered > hired (or rejected)", "Each status change logged via PATCH /api/candidates", "Pipeline view shows candidates grouped by status"] },
      { name: "AI Interview Flow", steps: ["Recruiter selects candidate and clicks 'Start AI Interview' (optional feature)", "System confirms: job profile, candidate details, interview type", "POST /api/ai-interview/generate-questions with { jobId, candidateId, jobDescription, requiredSkills }", "Z-AI SDK generates 8-10 questions across 4 categories: technical, behavioral, problem_solving, culture_fit", "Each question includes evaluation criteria for objective scoring", "If AI fails, fallback to hardcoded question templates", "Interview session created: POST /api/ai-interview with { candidateId, jobId, questions }", "Candidate proceeds through questions one at a time via AI chat interface", "POST /api/ai-chat processes each response with HR-specific system prompt", "Interview responses stored as JSON in AIInterview model", "Recruiter reviews interview transcript and AI evaluation", "Final hiring decision made by human recruiter (AI is advisory only)"] },
    ],
    screens: [
      { name: "Job Board", description: "Card grid of open positions. Each card: job title, department badge, location, employment type, experience level, salary range, skills tags, applicant count, posted date. 'Post Job' button in header. Search and filter by department, type, status." },
      { name: "Candidate Pipeline", description: "Kanban board with columns: Applied, Screening, Interview, Offered, Hired, Rejected. Candidate cards show: name, avatar, current role, aiFitScore (color-coded: green >80%, amber 50-80%, red <50%), applied date. Drag-and-drop between stages or status update via dropdown." },
      { name: "AI Interview Interface", description: "Split-screen: left panel shows job description and candidate profile with fit score; right panel shows chat-style interview interface. AI presents questions sequentially, candidate types responses. Progress bar showing question X of Y. Timer for each question. After completion: evaluation summary with scores per category and recommendation." },
    ],
    integrations: [
      "Z-AI Web Dev SDK - AI question generation (zai.chat.completions.create) and interview chat processing",
      "Employee Module - Hiring converts candidate to employee with auto-populated fields",
      "Department Module - Jobs belong to departments, department filter on job board",
      "Dashboard - Open jobs count and candidate pipeline data on main dashboard",
      "AuditLog - All recruitment actions logged",
      "Excel Export - /lib/excelExport.ts for candidate pipeline reports",
    ],
    dataModels: "Job (id, title, department, location, employmentType, experienceLevel, description, requirements JSON, skills JSON, salaryMin, salaryMax, status, applicationDeadline), Candidate (id, jobId, firstName, lastName, email, phone, currentRole, experience, skills JSON, aiFitScore, status), AIInterview (id, candidateId, jobId, questions JSON, responses JSON, status, evaluation)",
  },
  {
    name: "9. Performance Management",
    overview: "The Performance Management module provides a structured framework for employee performance evaluation, goal tracking, and attrition risk analysis. It supports multi-dimensional review cycles with customizable rating criteria, goal-setting with OKR alignment, peer feedback collection, and AI-powered attrition risk prediction. Reviews follow a three-stage workflow: draft, in-review, and completed. The attrition risk score (0-1) is a predictive metric that helps HR identify flight-risk employees early, enabling proactive retention strategies. Performance data feeds into the dashboard analytics for organization-wide insights.",
    workflows: [
      { name: "Performance Review Cycle", steps: ["HR initiates review cycle for a period (quarterly/annual)", "Reviews created with status 'draft' for selected employees", "Reviewers assigned: self, manager, peers", "Each reviewer fills: rating (0-5 scale), goals achieved, strengths, areas for improvement", "Self-review: employee fills their own assessment", "Manager review: direct manager evaluates and sets attrition risk score", "Peer feedback: designated peers provide anonymous feedback", "Status transitions: draft > in-review > completed", "Once completed, average rating calculated across all reviewers", "Attrition risk score updated based on multiple factors (rating trends, tenure, engagement)"] },
      { name: "Attrition Risk Assessment", steps: ["System continuously evaluates attrition risk for active employees", "Factors: performance rating trends, time since last promotion, engagement indicators, absence frequency", "Risk score 0-1: <0.3 = low risk (green), 0.3-0.7 = medium risk (amber), >0.7 = high risk (red)", "High-risk employees flagged on dashboard for HR attention", "Proactive retention actions recommended: career discussion, role adjustment, compensation review"] },
    ],
    screens: [
      { name: "Performance Overview", description: "Top metrics: average rating, total reviews, average attrition risk with trend. Department-wise performance comparison bar chart. Rating distribution pie chart. High-risk employees list with risk scores and recommended actions." },
      { name: "Review Form", description: "Employee info header with name, role, department, tenure. Rating sliders (0-5) for: job knowledge, quality of work, productivity, communication, teamwork, leadership. Text areas for: strengths, areas for improvement, goals for next period. Attrition risk slider (0-1) for managers." },
    ],
    integrations: [
      "Employee Module - Employee data for review subjects and reviewers",
      "Dashboard - Performance averages and attrition risk displayed on main dashboard",
      "Analytics Module - Performance data feeds into advanced analytics and reporting",
      "Leave Module - Absence frequency contributes to attrition risk calculation",
      "Learning & Development - Performance gaps inform training recommendations",
    ],
    dataModels: "Performance (id, employeeId, reviewerId, period, rating, goals, strengths, areasForImprovement, attritionRisk, status), Skill (id, name, category), EmployeeSkill (id, employeeId, skillId, proficiencyLevel)",
  },
  {
    name: "10. Project Management",
    overview: "The Project Management module provides end-to-end project lifecycle management with milestone tracking, team member management, progress monitoring, and status reporting. Projects support five statuses (planning, active, on-hold, completed, cancelled) and four priority levels (low, medium, high, critical). Each project can have multiple team members with designated roles (lead, manager, member) and milestones with automatic completion date tracking. The module integrates with the task management system, allowing project-level task organization and progress aggregation.",
    workflows: [
      { name: "Project Creation & Setup Flow", steps: ["User clicks 'Create Project'", "Form: name, description, companyId, priority, startDate, endDate, budget", "POST /api/projects creates project with status 'planning'", "Add team members: POST /api/projects/members with { projectId, employeeId, role }", "Role options: lead (1 per project), manager (multiple), member (multiple)", "System prevents duplicate member assignments", "Create milestones: POST /api/projects/milestones with { projectId, title, dueDate }", "Project transitions to 'active' when team and milestones are configured"] },
      { name: "Project Progress Tracking Flow", steps: ["Project lead updates progress percentage (0-100)", "PATCH /api/projects/{id} with { progress }", "System checks milestones: when milestone marked complete, completedDate auto-set", "Progress bar updates on project card and detail view", "If all milestones complete: suggest marking project as 'completed'", "Project status can be changed: planning > active > on-hold > completed/cancelled"] },
    ],
    screens: [
      { name: "Project Board", description: "Card grid of projects with status color coding. Each card: project name, priority badge, progress bar, team avatars, milestone count, due date. Filter by status, priority, company. 'Create Project' button." },
      { name: "Project Detail View", description: "Header: project name, status badge, progress bar, priority. Tabs: Overview (description, dates, budget), Team (member list with role badges, add/remove), Milestones (timeline with completion dates, add milestone), Tasks (project-scoped task list)." },
    ],
    integrations: [
      "Company Module - Projects scoped to companyId",
      "Employee Module - Team member assignments via ProjectMember.employeeId",
      "Task Module - Project-scoped tasks linked via task.companyId",
      "Dashboard - Project counts and progress data",
      "Excel Export - exportProjectReport() for project status reports",
    ],
    dataModels: "Project (id, name, description, companyId, priority, status, progress, startDate, endDate, budget), ProjectMember (id, projectId, employeeId, role), ProjectMilestone (id, projectId, title, dueDate, completedDate, status)",
  },
  {
    name: "11. Meeting Management",
    overview: "The Meeting Management module handles scheduling, invitation management, and RSVP tracking for organizational meetings. It supports multiple meeting types (standup, review, one-on-one, team, all-hands) with bulk invitation creation and individual RSVP tracking. Meeting invitations track response status (pending, accepted, declined) with automatic timestamping of responses. The module is scoped to companies for multi-company deployments and integrates with the notification system for meeting reminders.",
    workflows: [
      { name: "Meeting Scheduling Flow", steps: ["User clicks 'Schedule Meeting'", "Form: title, description, companyId, meetingType, date, time, duration, location/platform, attendeeIds (multi-select)", "POST /api/meetings creates meeting record", "Bulk creates MeetingInvitation records for each attendee with status 'pending'", "Meeting appears on calendar with attendee avatars and RSVP counts", "Attendees receive notifications (pending invitations)"] },
      { name: "RSVP Flow", steps: ["Invitee views meeting invitation", "Clicks Accept or Decline", "PATCH /api/meetings/invitations with { invitationId, status: 'accepted'/'declined' }", "Backend updates status and sets respondedAt timestamp", "Meeting detail view updates with current RSVP summary: X accepted, Y declined, Z pending"] },
    ],
    screens: [
      { name: "Meeting Calendar", description: "Calendar view with meeting blocks. Color-coded by type (standup=green, review=blue, one-on-one=purple, team=amber, all-hands=red). Click to view meeting detail. 'Schedule Meeting' button." },
      { name: "Meeting Detail", description: "Header: title, type badge, date/time, duration, location. RSVP summary cards (accepted/declined/pending counts). Attendee list with individual status badges. Description section. Action buttons: Edit, Cancel Meeting." },
    ],
    integrations: [
      "Company Module - Meetings scoped to companyId",
      "Employee Module - Attendees linked via MeetingInvitation.employeeId",
      "Dashboard - Upcoming meetings count in activity feed",
    ],
    dataModels: "Meeting (id, title, description, companyId, meetingType, date, time, duration, location, createdBy), MeetingInvitation (id, meetingId, employeeId, status, respondedAt)",
  },
  {
    name: "12. Learning & Development",
    overview: "The Learning & Development (L&D) module manages corporate training programs, course enrollments, skill gap analysis, and certification tracking. It features AI-powered course recommendations based on employee skill profiles and career goals, a comprehensive course catalog with enrollment management, learning path visualization, and skill gap analysis that identifies training needs by comparing current employee skills against role requirements. The module tracks course completion status, certification expiry dates, and learning progress metrics.",
    workflows: [
      { name: "Course Enrollment Flow", steps: ["Employee browses course catalog filtered by category/skill", "Clicks 'Enroll' on desired course", "POST /api/courses with mode 'enrollment': { employeeId, courseId }", "Backend creates CourseEnrollment with status 'in-progress'", "Course appears in employee's 'My Courses' with progress tracking", "Employee completes course modules and assessments", "PATCH /api/courses updates enrollment status to 'completed'", "Completion date recorded, certificate generated if applicable", "Cannot delete courses with active enrollments (data integrity)"] },
      { name: "Skill Gap Analysis Flow", steps: ["HR navigates to L&D > Skill Gap Analysis", "System compares EmployeeSkill records against role requirements", "Gap identified: skills where proficiencyLevel < required level", "AI generates personalized course recommendations for gap closure", "Recommendations displayed as learning path with priority ordering"] },
    ],
    screens: [
      { name: "Course Catalog", description: "Grid of course cards with: thumbnail, title, category badge, duration, difficulty level, enrollment count, rating. Search and filter by category, difficulty, status. 'Add Course' button for admins." },
      { name: "My Learning", description: "Enrolled courses with progress bars. Completed courses with certificates. Learning path visualization showing recommended course sequence. Skill improvement tracker." },
    ],
    integrations: [
      "Employee Module - Employee skill profiles from EmployeeSkill model",
      "Skill Module - Skill definitions and proficiency levels",
      "Performance Module - Performance gaps inform L&D recommendations",
      "Dashboard - Active course count on dashboard",
    ],
    dataModels: "Course (id, title, description, category, duration, difficulty, instructor, skills JSON), CourseEnrollment (id, employeeId, courseId, status, progress, completedDate, certificate), Skill (id, name, category), EmployeeSkill (id, employeeId, skillId, proficiencyLevel)",
  },
  {
    name: "13. Asset Management",
    overview: "The Asset Management module tracks company assets assigned to employees throughout the asset lifecycle. It supports multiple asset types (laptop, desktop, phone, tablet, monitor, keyboard, mouse, headset, other) with condition tracking (new, good, fair, poor) and status management (assigned, returned, damaged, lost). The module maintains a complete audit trail of asset assignments and returns, enabling accurate asset inventory and depreciation tracking. Assets are linked to employees and can be viewed from both the asset management module and individual employee profiles.",
    workflows: [
      { name: "Asset Assignment Flow", steps: ["Admin navigates to Asset Management", "Clicks 'Assign Asset', fills: employeeId (select), assetType, assetName, serialNo, condition, assignedDate", "POST /api/assets creates record with status 'assigned'", "Asset appears in employee's profile under Assets tab", "Employee acknowledges receipt"] },
      { name: "Asset Return Flow", steps: ["Admin selects assigned asset", "Updates status: 'returned' or 'damaged' or 'lost'", "PATCH /api/assets with { status, returnDate, condition }", "Asset removed from employee's active assets list", "AuditLog created for asset lifecycle event"] },
    ],
    screens: [
      { name: "Asset Dashboard", description: "Summary cards: Total Assets, Assigned, Available, Due for Return. Filter by type, status, employee. Asset table: Asset Name, Type, Serial No., Assigned To, Condition, Status, Date. 'Assign Asset' button." },
      { name: "Asset Detail", description: "Full asset information: name, type, serial number, condition, status, assignment history, current employee, dates. Action buttons: Edit, Return, Mark Damaged/Lost." },
    ],
    integrations: [
      "Employee Module - Assets linked via employeeId, visible in employee detail view",
      "AuditLog - All asset assignments and returns logged",
      "Dashboard - Asset counts in overview metrics",
    ],
    dataModels: "Asset (id, employeeId, assetType, assetName, serialNo, assignedDate, returnDate, condition, status)",
  },
  {
    name: "14. Document Management",
    overview: "The Document Management module provides centralized storage and access control for employee documents. It supports multiple document types (offer letter, contract, ID proof, address proof, certificate, other) with access level controls (public, hr-only, confidential, manager-only) ensuring sensitive documents are only accessible to authorized personnel. Documents can be uploaded, updated, and deleted with full audit logging. The module integrates with employee profiles for comprehensive document viewing and with the self-service portal for employee self-document access.",
    workflows: [
      { name: "Document Upload Flow", steps: ["HR/Admin navigates to Document Management", "Clicks 'Upload Document', selects: employeeId, docType, name, accessLevel, file", "POST /api/documents creates record with uploaded date", "Document appears in employee's profile and document management list", "Access controlled: hr-only documents visible only to HR role and above"] },
      { name: "Document Access Control Flow", steps: ["User requests document list for an employee", "GET /api/documents?employeeId={id}", "Backend checks user role against document accessLevel", "hr-only: only HR Admin, Super Admin, Payroll Specialist can view", "confidential: only Super Admin and HR Admin", "manager-only: employee's direct manager + HR roles", "public: all authenticated users", "Returns filtered list based on access permissions"] },
    ],
    screens: [
      { name: "Document Library", description: "Grid or list view of documents. Each entry: document name, type badge, employee name, access level badge, upload date, status. Filters: docType, accessLevel, employee search. 'Upload Document' button." },
      { name: "Employee Documents (in profile)", description: "Embedded in employee detail sheet. Document list with type, name, date, access level. Upload button for HR. Download/view action per document." },
    ],
    integrations: [
      "Employee Module - Documents linked via employeeId",
      "RBAC Module - Access levels enforced based on user role",
      "Self-Service Module - Employees can view their own public documents",
      "AuditLog - Document uploads, views, and deletions logged",
    ],
    dataModels: "Document (id, employeeId, name, docType, fileUrl, accessLevel, uploadedDate, status)",
  },
  {
    name: "15. RBAC & Security",
    overview: "The Role-Based Access Control (RBAC) & Security module implements a hierarchical role system with granular permission management and comprehensive audit logging. The system defines 7 role levels: Super Admin (level 0), HR Admin (1), Payroll Specialist (2), Department Manager (3), Recruiter (4), L&D Manager (5), and Employee (6). Each role carries a JSON permissions object defining access to 18+ modules with read/write/admin actions. The AuditLog captures all significant system actions with employee and user context, providing a complete compliance trail for regulatory requirements.",
    workflows: [
      { name: "Role Permission Management", steps: ["Super Admin navigates to RBAC > Roles", "Selects role to modify", "Permission matrix displayed: modules (rows) x actions (columns: read, write, admin)", "Admin toggles permission checkboxes", "PATCH /api/roles updates permissions JSON", "Changes take effect immediately for users with that role", "Cannot delete roles that are assigned to users (data integrity constraint)"] },
      { name: "Audit Log Review", steps: ["Admin/Compliance navigates to RBAC > Audit Logs", "GET /api/audit with optional filters: action, module, employeeId, userId, date range", "System returns paginated audit entries with: timestamp, action, module, details, user, employee", "Admin can export audit log for compliance reporting", "Logs are immutable (read-only) for regulatory compliance"] },
    ],
    screens: [
      { name: "Role Management", description: "List of 7 roles with level badges and permission summary. Click role to open permission matrix editor. Add custom role button (name, level, permissions). Delete role (with user reassignment if users exist)." },
      { name: "Audit Log Viewer", description: "Filterable, paginated table: Timestamp, Action, Module, Details, User, Employee. Date range picker. Export button. Module and action filter dropdowns." },
    ],
    integrations: [
      "All Modules - Every write operation creates an AuditLog entry",
      "Authentication Module - Role assigned during user creation, permissions loaded into JWT",
      "Middleware - Route protection based on role level and permissions",
      "Document Module - Access levels enforced by RBAC permissions",
    ],
    dataModels: "Role (id, name, level, permissions JSON), AuditLog (id, action, module, details, userId, employeeId, createdAt), User (id, email, roleId)",
  },
  {
    name: "16. Analytics & Reporting",
    overview: "The Analytics & Reporting module provides advanced data visualization, trend analysis, and automated report generation across all HRMS modules. It leverages Recharts for interactive front-end visualizations and the Excel export library for downloadable reports. The module offers pre-built report templates (headcount, attrition, payroll, attendance, recruitment) and supports custom report configuration. AI-powered insights include attrition prediction models, salary benchmarking, engagement scoring, and hiring forecasts, all sourced from the mock data layer and database aggregations.",
    workflows: [
      { name: "Report Generation Flow", steps: ["User navigates to Analytics & Reporting", "Selects report type from templates or creates custom report", "Configures: date range, department filter, metrics selection", "System aggregates data from relevant modules via API calls", "Renders interactive charts using Recharts (area, bar, pie, heatmap)", "User clicks 'Export Report'", "Excel export function generates formatted .xlsx with charts data", "Report downloaded with auto-generated filename including date range"] },
      { name: "Attrition Prediction Flow", steps: ["AI model evaluates employee data: performance trends, absence patterns, tenure, engagement scores", "Risk scores calculated for each employee (0-1 scale)", "High-risk employees identified and flagged", "Prediction dashboard shows: risk distribution, top risk factors, department comparisons", "HR reviews predictions and initiates proactive retention measures"] },
    ],
    screens: [
      { name: "Analytics Dashboard", description: "Multiple chart panels: Headcount Trends (area chart), Department Distribution (pie chart), Attrition Prediction (risk heatmap), Salary Benchmarking (bar chart), Engagement Scores (radar chart), Hiring Forecast (line chart). Date range selector. Export All button." },
      { name: "Report Templates", description: "Grid of report template cards: Headcount Report, Attrition Analysis, Payroll Summary, Attendance Report, Recruitment Pipeline, Performance Review. Click to generate with date picker." },
    ],
    integrations: [
      "All Modules - Data aggregation from Employee, Attendance, Payroll, Leave, Expense, Performance, Candidate, Job models",
      "Excel Export - /lib/excelExport.ts for all 6 specialized export functions",
      "Dashboard - Analytics data feeds main dashboard charts",
      "Z-AI SDK - AI-powered predictions and insights",
    ],
    dataModels: "Aggregates data from all models; report configurations stored client-side; Excel exports use /lib/excelExport.ts templates",
  },
  {
    name: "17. Self-Service Portal",
    overview: "The Self-Service module provides employees with a personalized portal for accessing their HR information, submitting requests, and managing personal details without HR intervention. It aggregates data from multiple modules into a unified employee-centric view, including leave balances, payslips, document access, asset tracking, and profile management. The portal reduces HR workload by enabling self-service for common requests while maintaining proper approval workflows for actions requiring authorization.",
    workflows: [
      { name: "Self-Service Leave Request", steps: ["Employee navigates to Self-Service > Leave", "Views current leave balances by type", "Clicks 'Request Leave'", "Fills leave type, start/end dates, reason", "System validates against remaining balance", "POST /api/leaves creates pending request", "Manager notified for approval", "Employee tracks status in self-service portal"] },
      { name: "Self-Service Document Access", steps: ["Employee navigates to Self-Service > Documents", "System shows only documents with accessLevel 'public' or 'manager-only' (if they're a manager)", "Employee can view/download available documents", "Upload personal documents (ID proofs, certificates)"] },
    ],
    screens: [
      { name: "Self-Service Dashboard", description: "Personal dashboard with: Leave Balance cards, Recent Payslips list, My Documents section, My Assets section, Quick Actions (Request Leave, Update Profile, View Payslips). Profile summary card with avatar, name, role, department." },
    ],
    integrations: [
      "Leave Module - Leave balance and request submission",
      "Payroll Module - Payslip access and download",
      "Document Module - Personal document access and upload",
      "Asset Module - Assigned assets view",
      "Profile Module - Personal information update",
    ],
    dataModels: "Aggregates from Leave, Payroll, Document, Asset, Employee models for employee-specific views",
  },
  {
    name: "18. Profile Management",
    overview: "The Profile Management module allows employees to view and update their personal information, upload profile avatars, and manage their account settings. It provides a dedicated API endpoint for profile operations with controlled field access, ensuring employees can only modify permitted fields while sensitive data (salary, bank details) remains HR-managed. The module supports avatar upload via base64 encoding or URL, with automatic synchronization to the User model for consistent display across the application.",
    workflows: [
      { name: "Profile Update Flow", steps: ["Employee navigates to Profile (sidebar)", "GET /api/profile fetches employee data with user, role, and company relations", "Profile form displays editable fields: phone, address, emergency contact, personal email", "Read-only fields: name, email, department, designation, employee ID, join date, salary", "Employee modifies permitted fields and clicks Save", "PATCH /api/profile with updated fields", "Backend validates and updates only allowed fields", "Success toast displayed, profile refreshed"] },
      { name: "Avatar Upload Flow", steps: ["Employee clicks on avatar placeholder", "File picker or URL input presented", "If file selected: converted to base64 encoding on client", "POST /api/profile with { avatar: base64String } or { avatarUrl: 'https://...' }", "Backend updates Employee.avatar and synchronizes to User.image", "Avatar updates across all components (sidebar, header, profile)"] },
    ],
    screens: [
      { name: "Profile Page", description: "Full profile view with large avatar (click to change), employee name, role badge, department. Two-column layout: left side shows personal info (email, phone, DOB, gender, address), right side shows employment info (employee ID, department, designation, job title, join date, contract type, reporting to). Edit button enables inline editing of permitted fields. Change Password button in actions area." },
    ],
    integrations: [
      "Authentication Module - User model synced for name and avatar",
      "Employee Module - Core employee data source",
      "RBAC Module - Field-level access control based on user role",
      "Self-Service Module - Profile data displayed in self-service portal",
    ],
    dataModels: "Employee (profile fields), User (avatar sync), Role (permissions for field access control)",
  },
  {
    name: "19. Settings",
    overview: "The Settings module provides system-wide configuration management for the HRMS platform. It allows administrators to configure company-wide preferences, notification settings, theme customization, and system defaults. The module serves as the central control panel for application behavior, including email notification preferences, date/time format settings, currency configuration, and module-specific settings like attendance geofence radius defaults and payroll calculation parameters.",
    workflows: [
      { name: "Settings Configuration Flow", steps: ["Admin navigates to Settings (sidebar bottom)", "Settings page renders with tabs: General, Notifications, Appearance, Security, Modules", "General: company name, timezone, date format, currency, language", "Notifications: email notifications toggle, reminder frequency, digest settings", "Appearance: theme (light/dark/system), sidebar default state, density", "Security: session timeout, password policy, 2FA toggle", "Modules: enable/disable modules, feature flags", "Admin modifies settings and clicks Save", "Settings persisted (currently client-side with Zustand; server-side persistence planned)", "Changes take effect immediately for current session"] },
    ],
    screens: [
      { name: "Settings Page", description: "Tabbed interface: General (company info, timezone, date format, currency), Notifications (email toggle, reminder settings), Appearance (theme selector, sidebar preferences), Security (session timeout, password policy, 2FA), Modules (feature toggles). Save button at bottom of each tab." },
    ],
    integrations: [
      "All Modules - Settings affect global behavior (date formats, currency display, module availability)",
      "Authentication Module - Security settings (session timeout, password policy)",
      "Zustand Store - Client-side settings state management",
    ],
    dataModels: "Currently uses client-side Zustand store; server-side Settings model planned for future implementation",
  },
];

// ── Build Document ──
function buildCoverSection() {
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const allNB = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
  return {
    properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: allNB,
        rows: [new TableRow({
          height: { value: 16838, rule: "exact" },
          children: [new TableCell({
            verticalAlign: "top",
            shading: { type: ShadingType.CLEAR, fill: P.coverBg },
            borders: allNB,
            children: [
              new Paragraph({ spacing: { before: 4000 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 800, after: 200, line: 1200, lineRule: "atLeast" },
                children: [new TextRun({ text: "AI-HRMS", size: 96, bold: true, color: P.coverTitle, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 100, line: 600, lineRule: "atLeast" },
                children: [new TextRun({ text: "Module-wise Standard Operating Procedures", size: 40, color: P.accent, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 300, after: 100 },
                children: [new TextRun({ text: "Workflows | Integrations | Screen Descriptions", size: 24, color: P.coverSub, font: { ascii: "Times New Roman" } })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 },
                border: { top: { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 20 } },
                indent: { left: 3000, right: 3000 },
                children: [],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [new TextRun({ text: "Version 1.0  |  May 2026", size: 22, color: P.coverMeta, font: { ascii: "Times New Roman" } })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100 },
                children: [new TextRun({ text: "AI-Powered Human Resource Management System", size: 20, color: P.coverFooter, font: { ascii: "Times New Roman" } })],
              }),
            ],
          })],
        })],
      }),
    ],
  };
}

function buildBody() {
  const children = [];
  // Executive Summary
  children.push(h1("Executive Summary"));
  children.push(p("This document provides comprehensive Standard Operating Procedures (SOPs) for all 19 modules of the AI-HRMS (AI-Powered Human Resource Management System) platform. Each module section includes a detailed overview of the module's purpose and capabilities, step-by-step workflow descriptions for all major operations, screen descriptions detailing the user interface layout and components, integration mappings showing how each module connects with other system modules, and the underlying data models that support the module's functionality."));
  children.push(p("The AI-HRMS platform is built on Next.js 16 with App Router architecture, using PostgreSQL via Prisma ORM for data persistence, NextAuth.js v4 for authentication with JWT sessions, and Zustand for client-side state management. The application is deployed on Vercel with serverless functions and follows a single-page application pattern where 18 module components are rendered dynamically based on the active module selected from the sidebar navigation. The platform features AI-powered capabilities in Talent Acquisition (AI Fit Score, AI Interviews), Performance Management (attrition risk prediction), Learning & Development (course recommendations), and Analytics (predictive insights)."));
  children.push(p("Each module follows consistent architectural patterns: React components with 'use client' directive for interactive UI, API route handlers following Next.js App Router conventions with Promise-based params, Prisma ORM for database operations with transaction support for cascading operations, Zustand store for cross-module state management, and comprehensive audit logging for all write operations. The system supports 7 role levels with JSON-based granular permissions, ensuring appropriate access control across all modules."));

  // Module sections
  for (const mod of modules) {
    children.push(h1(mod.name));
    children.push(h2("Module Overview"));
    children.push(p(mod.overview));

    children.push(h2("Configured Workflows"));
    for (const wf of mod.workflows) {
      children.push(h3(wf.name));
      for (let i = 0; i < wf.steps.length; i++) {
        children.push(new Paragraph({
          indent: { left: 720 },
          spacing: { line: 312, after: 40 },
          children: [
            new TextRun({ text: `${i + 1}.  `, size: 24, bold: true, color: c(P.accent), font: { ascii: "Times New Roman" } }),
            new TextRun({ text: wf.steps[i], size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
          ],
        }));
      }
    }

    children.push(h2("Screen Descriptions"));
    for (const scr of mod.screens) {
      children.push(h3(scr.name));
      children.push(p(scr.description));
    }

    children.push(h2("Module Integrations"));
    for (const integ of mod.integrations) {
      children.push(bullet(integ));
    }

    children.push(h2("Data Models"));
    children.push(p(mod.dataModels));
  }

  return children;
}

async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: c(P.body) },
          paragraph: { spacing: { line: 312 } },
        },
        heading1: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
        },
        heading2: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
        },
        heading3: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 26, bold: true, color: c(P.primary) },
        },
      },
    },
    sections: [
      buildCoverSection(),
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: "portrait" },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "AI-HRMS Module-wise SOP", size: 18, color: "808080", font: { ascii: "Times New Roman" } })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
            })],
          }),
        },
        children: [
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          new Paragraph({ children: [new PageBreak()] }),
          ...buildBody(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/download/AI-HRMS_Module-wise_SOP_Document.docx", buffer);
  console.log("SOP Document generated successfully!");
}

main().catch(console.error);
