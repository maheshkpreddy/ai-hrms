# AI-HRMS - Complete Documentation Hub

## 🏢 Company-Wise Login System

AI-HRMS now supports multi-tenant company-wise login. Each organization has a unique company code that employees use to access their company's HR portal.

### How It Works
1. **Company Code**: Every company gets a unique short code (e.g., "ACME")
2. **Login Flow**: Users enter Company Code + Email + Password
3. **Company Verification**: The system verifies the company code against the database
4. **Role Assignment**: After authentication, the user's role determines their dashboard and visible modules
5. **Data Isolation**: Each company's data is scoped by `companyId`

### Default Demo
- **Company Code**: `ACME`
- **Company**: Acme Corporation (Bangalore, India)

## 🔐 Role Master & Configuration

The Role Master system allows Super Admins to fully configure role-based access control.

### Role Configuration Fields
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Role name (unique) |
| `description` | String | Role description |
| `level` | Integer | Hierarchy level (0=Super Admin, 4=Employee) |
| `isSystem` | Boolean | System roles cannot be deleted |
| `dashboard` | String | Auto-assigned dashboard on login |
| `menuItems` | JSON Array | List of visible sidebar modules |
| `color` | String | UI badge color |
| `permissions` | JSON Object | Module-level CRUD permissions |
| `companyId` | String | null=global, set=company-specific |

### Role → Dashboard Mapping
| Role | Dashboard | Modules Visible |
|------|-----------|----------------|
| Super Admin | Dashboard (admin) | All modules |
| HR Admin | Employees (hr) | All modules |
| Payroll Specialist | Payroll (payroll) | Dashboard, Payroll, Self-Service |
| Department Manager | Dashboard (manager) | Dashboard, Employees, Attendance, Performance, Learning, Self-Service |
| Employee | Self-Service (employee) | Dashboard, Attendance, Self-Service |
| Recruiter | Talent Acquisition (recruiter) | Dashboard, Talent, Self-Service |
| L&D Manager | Learning & Development (learning) | Dashboard, Learning, Performance, Self-Service |

### Super Admin Capabilities
- Create, edit, and delete custom roles
- Configure which modules each role can access
- Set the default dashboard for each role
- Assign role colors for visual identification
- Define granular permissions per module (read/write/modify/delete/admin)
- Cannot delete system roles (isSystem=true)

---

## 🧭 Navigation & Sidebar

### Module Icons Home Page
The home page (ModuleHome) displays a grid of all 20 modules as interactive cards with:
- **Colored icons** for each module on gradient backgrounds
- **AI badge** for AI-powered modules (Talent Acquisition, Performance, Learning, Job Portal, Analytics)
- **"New" badge** for recently added modules (Project Kanban, Client Portal, Sub Vendors, Job Portal)
- **Module descriptions** and hover-triggered "Open Module" action
- **Welcome header** with "eh2r AI — An AI Product of MARQ AI" branding and system status indicator

### Collapsible Sidebar
- **Expanded mode**: 16rem width with full labels, search bar, sub-menus, and notification bell
- **Collapsed mode**: 4.5rem width with icon-only view and tooltip labels
- **Toggle**: Expand/collapse button at bottom; floating expand button when collapsed
- **Search**: Filter modules by name in the sidebar search bar
- **Sub-menus**: Each module has expandable sub-items with icons (click module to expand/collapse)
- **Scrollbar**: Custom-styled scrollbar for the navigation area (visible, dark-themed)
- **Mobile**: Responsive Sheet/Drawer with hamburger trigger on small screens
- **Keyboard**: Ctrl+B shortcut to toggle sidebar (via shadcn/ui SidebarProvider)

### Sub-Menu Structure
Each sidebar module has expandable sub-items for quick navigation:

| Module | Sub-Items |
|--------|-----------|
| Dashboard | Overview, Quick Actions, Recent Activity |
| Employees | Employee Directory, Add Employee, Departments |
| Company | Company Info, Branches, Policies |
| Asset Management | Asset Inventory, Assign Assets, Requests |
| Document Management | All Documents, Upload Document, Templates |
| Task Management | My Tasks, Team Tasks, Reports |
| Meetings | Upcoming Meetings, Schedule Meeting, Past Meetings |
| RBAC & Security | Role Master, Permissions, Audit Logs |
| Talent Acquisition (AI) | Job Postings, Candidate Pool, Interview Schedule, Offer Letters, AI Onboarding |
| Time & Attendance | Mark Attendance, Shifts, Holidays, Export Reports |
| Payroll & Expenses | Process Payroll, Expenses, Reports |
| Performance (AI) | Performance Reviews, Goals & OKRs, 360 Feedback |
| Learning & Development (AI) | Courses, Enrollments, Certifications |
| Project Kanban | Kanban Board, Projects, Timelines |
| Client Portal | Clients, Tickets, Service Requests |
| Sub Vendors | Vendors, Resume Uploads, Assignments |
| Job Portal (AI) | Resumes, Search, Shortlisted, Interviews, Offer Letters, Background Check |
| Analytics & Reporting (AI) | HR Analytics, Custom Reports, Export Data |
| Self-Service | My Profile, My Leaves, My Payslips, Raise Request |
| My Profile | Personal Info, Employment, Documents |
| Settings | General, Notifications, Security |

---

## 🆕 New Modules (Recently Added)

### Project Kanban
A full Kanban board system for project and task management with:
- Multiple boards with tab switching
- Horizontal scrollable columns (Backlog, To Do, In Progress, Done by default)
- Cards with priority badges (low/medium/high/urgent), tags, due dates, assignee avatars
- Move-left/move-right buttons for card progression
- Create boards, add cards, rename/delete columns
- Card detail view with comments
- Stats bar showing total boards, cards, in-progress, completed
- API: `/api/kanban/boards`, `/api/kanban/cards`, `/api/kanban/columns`

### Client Portal
A 3-tab portal for managing client relationships with:
- **Clients tab**: Searchable/filterable table with company name, contact, industry, subscription tier, resume access progress, status
- **Tickets tab**: Support tickets with subject, client, category, priority, status workflow (open/in_progress/resolved/closed), assigned agent, comment threads
- **Access Tracking tab**: Resume access usage per client with percentage and progress bars
- Client detail sheet with resume access log
- API: `/api/clients`, `/api/tickets`

### Sub Vendors
A 2-tab interface for managing staffing sub-vendors with:
- **Vendors tab**: Searchable/filterable table with company name, contact, specialization, resume count, active status, edit/delete actions
- **Vendor detail dialog** with resume list and add-resume form
- **Resumes tab**: Pipeline summary (uploaded/shortlisted/interviewed/offered/rejected with counts), scrollable resume cards with skills badges, status badges, linked job info
- Resume detail dialog with status transition actions
- API: `/api/subvendors`, `/api/subvendors/[id]/resumes`

### Job Portal (AI-Powered)
A comprehensive recruitment pipeline with 7 tabs:
- **Pipeline tab**: Horizontal Kanban-style columns (Applied → Screening → Shortlisted → Interview R1/R2/R3 → Offered → Hired + Rejected) with move-stage buttons and AI fit scores
- **Candidates tab**: Add/search candidates with skills, experience, education
- **Applications tab**: Full application list with status tracking
- **Interviews tab**: Schedule human or AI interviews, view feedback/scores
- **Offers tab**: Create/send/accept/reject offer letters with salary/department details
- **Onboarding tab**: Checklist (document upload, policy acknowledgment, equipment, account, orientation, buddy)
- **Background checks tab**: Criminal/education/employment/address/drug checks with clear/flagged/failed statuses
- API: `/api/jobportal/candidates`, `/api/jobportal/applications`, `/api/jobportal/interviews`, `/api/jobportal/offer-letters`, `/api/jobportal/onboarding`, `/api/jobportal/background-checks`

---

## 🎨 Branding & UI Updates

### Branding
- **Product Name**: eh2r AI
- **Tagline**: An AI Product of MARQ AI
- **Logo**: Sparkles icon on emerald-to-teal gradient background
- **Primary Color**: Emerald/Teal (#10b981 / #0d9488)
- **Sidebar**: Dark theme (slate-900 background)
- **AI Badge**: Emerald gradient with Sparkles icon

### Login Page
- Two-panel design: left panel (desktop only) with dark gradient and branding, right panel with login form
- Company code input with verification step
- Email + Password fields with show/hide toggle
- Google OAuth sign-in option
- Mobile app download links (Android/iOS)
- Feature highlights: AI-Powered Recruitment, Client & Vendor Portals, Mobile App Available

### Module Icons Home Page
- 20 interactive module cards in a responsive grid layout
- Each card has a unique gradient background icon
- AI-powered modules get a special "AI" badge
- Recently added modules get a "New" badge
- Hover effect reveals "Open Module →" action
- Bottom gradient accent on each card

---

## 📱 Flutter Mobile App

A Flutter mobile application is available for Android and iOS, providing on-the-go HR access.

### Features
- Company-wise login with biometric authentication
- Mark attendance with GPS geolocation
- Apply and track leave requests
- View payslips and payroll information
- AI HR Assistant chatbot
- Push notifications for approvals and updates
- Employee self-service portal
- Offline mode for attendance

### Download
- **Android**: Available on Google Play Store (link on login page)
- **iOS**: Available on Apple App Store (link on login page)

### Mobile App Structure
```
mobile/
├── lib/
│   ├── main.dart              # App entry point
│   ├── config/app_config.dart  # API configuration
│   ├── models/user_model.dart  # User & Company models
│   ├── services/auth_service.dart  # Authentication with JWT
│   └── screens/
│       ├── login_screen.dart   # Company code + email + password
│       └── home_screen.dart    # Dashboard, Attendance, Leave, AI Chat, Profile
└── pubspec.yaml
```

---

## 🔗 Quick Links
- **Live App**: https://ai-hrms-rho.vercel.app
- **GitHub**: https://github.com/maheshkpreddy/ai-hrms
- **Company Code**: ACME (for demo)

## 📋 Demo Credentials
| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Super Admin | admin@company.com | Admin@2024 | Full Dashboard |
| HR Admin | priya.sharma@company.com | HRAdmin@2024 | Employees |
| Payroll Specialist | amit.patel@company.com | Payroll@2024 | Payroll |
| Department Manager | rajesh.kumar@company.com | Manager@2024 | Dashboard |
| Employee | sneha.reddy@company.com | Employee@2024 | Self-Service |
| Recruiter | fatima.khan@company.com | Recruiter@2024 | Talent Acquisition |
| L&D Manager | meera.iyer@company.com | LDManager@2024 | Learning & Development |

---

## 📚 Module-wise SOP Documents
1. [Dashboard SOP](./01-Dashboard-SOP.md)
2. [Employee Management SOP](./02-Employee-Management-SOP.md)
3. [RBAC & Security SOP](./03-RBAC-Security-SOP.md)
4. [AI Talent Acquisition SOP](./04-Talent-Acquisition-SOP.md)
5. [Time & Attendance SOP](./05-Time-Attendance-SOP.md)
6. [Payroll & Expenses SOP](./06-Payroll-Expense-SOP.md)
7. [Performance & Talent SOP](./07-Performance-Talent-SOP.md)
8. [Learning & Development SOP](./08-Learning-Development-SOP.md)
9. [Analytics & Reporting SOP](./09-Analytics-Reporting-SOP.md)
10. [Employee Self-Service SOP](./10-Self-Service-SOP.md)

---

## 🔧 Changelog

### v2.2 — Sidebar & Navigation Overhaul
- **Fixed**: Sidebar scrollbar now works correctly with `overflow-hidden` and `min-h-0` on ScrollArea
- **Fixed**: Scrollbar thumb now visible on dark sidebar (custom CSS override for Radix ScrollArea)
- **Added**: Sub-menu items for all 20 sidebar modules with icons
- **Added**: Module icons home page (ModuleHome) with 20 interactive cards
- **Added**: "AI" badge on AI-powered modules in sidebar and home page
- **Added**: "New" badge on recently added modules (Project Kanban, Client Portal, Sub Vendors, Job Portal)
- **Added**: Search/filter functionality in sidebar for quick module lookup
- **Added**: Home button in sidebar to return to module grid view
- **Updated**: Branding to "eh2r AI — An AI Product of MARQ AI" across sidebar, home page, and login

### v2.1 — New Module Additions
- **Added**: Project Kanban module with full board/column/card CRUD
- **Added**: Client Portal module with clients, tickets, and access tracking
- **Added**: Sub Vendors module with vendor management and resume pipeline
- **Added**: Job Portal (AI-powered) module with 7-tab recruitment pipeline
- **Added**: API routes for kanban, clients, tickets, subvendors, jobportal
- **Updated**: Zustand store with new ModuleKey types (projects, clients, subvendors, jobportal)

### v2.0 — Multi-Tenant & RBAC
- **Added**: Company-wise login system with company codes
- **Added**: Role Master with configurable permissions per module
- **Added**: Role-based dashboard routing
- **Added**: Flutter mobile app scaffold
