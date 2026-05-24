# AI-HRMS Comprehensive Technical Documentation

## Table of Contents

- [Part I: System Architecture](#part-i-system-architecture-overview)
- [Part II: Frontend Architecture](#part-ii-frontend-architecture)
- [Part III: Backend Architecture](#part-iii-backend-architecture)
- [Part IV: Database Schema & Models](#part-iv-database-schema--models)
- [Part V: Middleware Layer](#part-v-middleware-layer)
- [Part VI: API Integration Reference](#part-vi-api-integration-reference)
- [Part VII: AI Integration & Standards](#part-vii-ai-integration--standards)
- [Part VIII: Coding Standards](#part-viii-coding-standards)
- [Part IX: Module-wise Technical Deep Dive](#part-ix-module-wise-technical-deep-dive)
- [Part X: Deployment & Configuration](#part-x-deployment--configuration)

---

## Part I: System Architecture Overview

The AI-HRMS platform is built on a modern full-stack JavaScript architecture leveraging Next.js 16 with App Router, React 19, Prisma ORM 6 with PostgreSQL, and NextAuth.js v4 for authentication. The application follows a single-page application (SPA) pattern within the Next.js framework, where a single page component (`app/page.tsx`) dynamically renders 18 module components based on the active module selected from the sidebar navigation.

The deployment target is Vercel's serverless platform, which imposes specific architectural constraints: all API routes execute as serverless functions, database connections must be managed through a singleton Prisma client pattern to prevent connection pool exhaustion, and the application must be stateless at the server level with JWT-based session management.

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | Next.js (App Router) | 16 | Full-stack React framework |
| UI Library | React | 19 | Component-based UI |
| Styling | Tailwind CSS | 4 | Utility-first CSS with dark mode |
| UI Components | shadcn/ui + Radix UI | Latest | 40+ accessible primitives |
| State Management | Zustand | 5 | Lightweight client store |
| Charts | Recharts | 2 | Area, Bar, Pie charts |
| Backend ORM | Prisma | 6 | Type-safe database queries |
| Database | PostgreSQL (Neon) | Managed | Primary data store with 28 models |
| Authentication | NextAuth.js | 4 | Credentials + Google OAuth, JWT sessions |
| Password Hashing | bcryptjs | Latest | Salt factor 12 |
| Excel Export | xlsx (SheetJS) | Latest | Client-side .xlsx generation |
| AI Integration | z-ai-web-dev-sdk | Latest | Chat, interviews, image gen |
| Forms | react-hook-form + zod | Latest | Validation and schemas |
| Icons | lucide-react | Latest | 1,000+ SVG icons |
| Animations | framer-motion | Latest | Transitions and interactions |
| Deployment | Vercel | Serverless | Edge functions, HTTPS, CI/CD |

### Project Structure

```
ai-hrms/
├── prisma/
│   ├── schema.prisma          # 28 Prisma models (PostgreSQL)
│   └── seed.ts                # 373-line seed script
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main SPA page (18 module switcher)
│   │   ├── login/page.tsx     # Login page
│   │   └── api/               # 42 API route handlers
│   ├── components/
│   │   ├── hrms/              # 18 module components (27,347 LOC)
│   │   └── ui/                # 40+ shadcn/ui primitives
│   ├── hooks/                 # use-mobile, use-toast
│   └── lib/                   # Shared utilities
│       ├── auth.ts            # NextAuth config (201 lines)
│       ├── db.ts              # Prisma singleton (13 lines)
│       ├── excelExport.ts     # 6 export functions (261 lines)
│       ├── store.ts           # Zustand store (39 lines)
│       ├── useApi.ts          # API hooks (111 lines)
│       ├── data.ts            # Mock data (659 lines)
│       └── utils.ts           # cn() utility (6 lines)
├── middleware.ts              # NextAuth route protection (22 lines)
└── package.json               # 30+ dependencies
```

---

## Part II: Frontend Architecture

### Component Architecture Pattern

The AI-HRMS frontend follows a single-page application pattern where the main `page.tsx` component acts as a module router. Instead of using Next.js file-based routing, the application renders all 18 module components within a single page and switches between them using Zustand's `activeModule` state.

Each module component follows a consistent internal structure:
- `'use client'` directive for client-side interactivity
- TypeScript interfaces for data types
- `useApi` hooks for data fetching with loading/error states
- Handler functions for CRUD operations
- JSX with shadcn/ui components in responsive grid layout
- Integration with Excel export utility

### Module Component Mapping

```typescript
const moduleComponents: Record<ModuleKey, React.ComponentType> = {
  dashboard: Dashboard,
  employees: EmployeeManagement,
  company: CompanyManagement,
  tasks: TaskManagement,
  meetings: MeetingManagement,
  projects: ProjectManagement,
  assets: AssetManagement,
  documents: DocumentManagement,
  rbac: RBACSecurity,
  talent: TalentAcquisition,
  attendance: TimeAttendance,
  payroll: PayrollExpense,
  performance: Performance,
  learning: LearningDevelopment,
  analytics: Analytics,
  selfservice: SelfService,
  profile: ProfileManagement,
  settings: Settings,
}
```

### State Management (Zustand)

```typescript
// lib/store.ts
import { create } from 'zustand'

export type ModuleKey = 'dashboard' | 'employees' | 'assets' |
  'documents' | 'rbac' | 'talent' | 'attendance' | 'payroll' |
  'performance' | 'learning' | 'analytics' | 'selfservice' |
  'company' | 'tasks' | 'meetings' | 'projects' |
  'profile' | 'settings'

interface HRMSStore {
  activeModule: ModuleKey
  sidebarOpen: boolean
  searchQuery: string
  setActiveModule: (module: ModuleKey) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useHRMSStore = create<HRMSStore>((set) => ({
  activeModule: 'dashboard',
  sidebarOpen: true,
  searchQuery: '',
  setActiveModule: (module) => set({ activeModule: module }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
```

### Data Fetching Pattern (useApi)

```typescript
// Usage in components:
const { data, loading, error, refetch } = useApi<EmployeesResponse>({
  baseUrl: '/api/employees',
  params: { page: 1, limit: 100, department: filterDept, search: searchQuery },
})

// Mutation helpers:
await apiPost('/api/employees', employeeData)
await apiPut(`/api/employees/${id}`, updatedData)
await apiDelete(`/api/employees/${id}`)
```

### Excel Export System

Located in `/lib/excelExport.ts` (261 lines), provides 6 specialized export functions:

| Function | Columns |
|----------|---------|
| `exportAttendanceReport` | Employee ID, Name, Date, Status, Check-in, Check-out |
| `exportPayrollReport` | Employee, Basic, HRA, DA, PF, ESI, Prof Tax, Net Salary |
| `exportLeaveReport` | Employee, Type, Start Date, End Date, Status, Reason |
| `exportExpenseReport` | Employee, Category, Amount, Date, Status |
| `exportProjectReport` | Project, Status, Progress, Start, End, Team |
| `exportEmployeeReport` | ID, Name, Email, Phone, Department, Designation, Status, Join Date, Salary |

Auto-generates filenames: `ReportType_Report_YYYY-MM-DD.xlsx`

---

## Part III: Backend Architecture

### API Route Handler Pattern

All 42 API routes follow Next.js 16 App Router conventions with Route Handlers. Key patterns:
- Named async functions: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`
- Dynamic params use async pattern: `{ params: Promise<{ id: string }> }`
- Consistent error handling: try/catch with console.error and JSON error responses
- All write operations create AuditLog entries
- HTTP status codes: 200 (OK), 201 (Created), 400 (Validation), 404 (Not Found), 500 (Server Error)

### Pagination Pattern

All list endpoints support server-side pagination:
```
GET /api/employees?page=1&limit=20&department=Engineering
Response:
{
  employees: [...],
  pagination: { page: 1, limit: 20, total: 156, totalPages: 8 }
}
```

### Cascade Delete Pattern

Multi-record deletes use `prisma.$transaction()` for atomicity:

```typescript
// Example: DELETE /api/companies/[id]
await db.$transaction([
  db.taskComment.deleteMany({ where: { task: { companyId: id } } }),
  db.taskAssignment.deleteMany({ where: { task: { companyId: id } } }),
  db.task.deleteMany({ where: { companyId: id } }),
  db.meetingInvitation.deleteMany({ where: { meeting: { companyId: id } } }),
  db.meeting.deleteMany({ where: { companyId: id } }),
  db.officeLocation.deleteMany({ where: { companyId: id } }),
  db.companyMember.deleteMany({ where: { companyId: id } }),
  db.company.delete({ where: { id } }),
])
```

### Audit Logging Pattern

Every write operation creates an AuditLog entry:
- `action`: CREATE, UPDATE, DELETE, APPROVE, REJECT
- `module`: hr, payroll, attendance, leave, etc.
- `details`: Human-readable description
- `userId`: Authenticated user performing the action

---

## Part IV: Database Schema & Models

### Prisma Singleton Pattern

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### Complete Data Model Catalog

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| User | email, passwordHash, name, roleId | Authentication |
| Account | provider, providerAccountId, access_token | OAuth accounts |
| Employee | employeeId, firstName, lastName, department, salary, status | Core HR |
| Department | name, head, budget | Organizational structure |
| Role | name, level, permissions (JSON) | RBAC (7 levels) |
| Attendance | employeeId, date, status, checkInTime, location | Time tracking |
| Leave | employeeId, leaveType, startDate, endDate, status | Leave management |
| Shift | name, startTime, endTime, graceTime | Work shifts |
| Holiday | name, date, type | Holiday calendar |
| Payroll | employeeId, month, year, basicSalary, hra, da, pf, esi, netSalary | Indian payroll |
| Expense | employeeId, category, amount, status | Expense claims |
| Performance | employeeId, rating, attritionRisk, status | Reviews + prediction |
| Skill | name, category | Skill definitions |
| EmployeeSkill | employeeId, skillId, proficiencyLevel | Proficiency mapping |
| Course | title, category, duration, difficulty | L&D catalog |
| CourseEnrollment | employeeId, courseId, status, progress | Enrollment tracking |
| Job | title, department, requirements (JSON), skills (JSON) | Job postings |
| Candidate | jobId, aiFitScore, status | Recruitment pipeline |
| AIInterview | candidateId, jobId, questions (JSON), responses (JSON) | AI interviews |
| Company | name, industry, joinCode | Multi-company |
| CompanyMember | companyId, employeeId, role, status | Membership |
| OfficeLocation | companyId, latitude, longitude, radius | Geofence locations |
| Task | title, companyId, priority, status | Task tracking |
| TaskAssignment | taskId, employeeId, status | Multi-assignee |
| TaskComment | taskId, employeeId, content, isHr | Discussion threads |
| Meeting | title, companyId, meetingType, date | Scheduling |
| MeetingInvitation | meetingId, employeeId, status, respondedAt | RSVP tracking |
| Project | name, companyId, priority, progress | Project lifecycle |
| ProjectMember | projectId, employeeId, role | Team management |
| ProjectMilestone | projectId, title, dueDate, completedDate | Milestone tracking |
| Asset | employeeId, assetType, serialNo, condition, status | IT asset tracking |
| Document | employeeId, name, docType, accessLevel | Document management |
| CompanyPolicy | companyId, title, content, version | Policy management |
| AuditLog | action, module, details, userId, createdAt | Compliance trail |

### Seed Data

The seed script creates: 4 shifts, 8 departments, 7 roles, 20 employees, 11 user accounts, 15 skills, 14 employee-skill mappings, 8 attendance records, 6 leaves, 5 payroll records, 5 expenses, 6 performance reviews, 6 assets, 8 documents, 8 courses, 5 enrollments, 5 jobs, 6 candidates, 5 policies, 10 holidays.

---

## Part V: Middleware Layer

### NextAuth Middleware

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
```

Allows unauthenticated access only to: `/api/auth/*`, `/_next/static/*`, `/_next/image/*`, `/favicon.ico`, `/logo.svg`. All other routes redirect to `/login`.

### Authentication Flow

- **CredentialsProvider**: email/password → `prisma.user.findUnique()` → `bcryptjs.compare()` → JWT
- **GoogleProvider**: OAuth → auto-create/link user → JWT
- **JWT Strategy**: 24h maxAge, enriches token with role, roleId, permissions, employeeId, avatar
- **Session Callback**: Transfers JWT claims to client-side session object

---

## Part VI: API Integration Reference

### Complete API Endpoint Catalog

| Endpoint | Methods | Key Features | Audit |
|----------|---------|-------------|-------|
| /api/ai-chat | POST | AI HR assistant (Z-AI SDK) | No |
| /api/ai-interview | GET, POST | List/create sessions | Yes |
| /api/ai-interview/generate-questions | POST | AI question generation | No |
| /api/assets | GET, POST, PATCH, DELETE | Full CRUD | Yes |
| /api/attendance | GET, POST, PATCH, DELETE | Date range, duplicate prevention | Yes |
| /api/audit | GET | Read-only, filtered | N/A |
| /api/auth/change-password | POST | bcrypt verification | Yes |
| /api/candidates | GET, POST, PATCH, DELETE | AI fit score, pipeline | Yes |
| /api/companies | GET, POST | Auto join code | Yes |
| /api/companies/[id] | GET, PATCH, DELETE | Cascade delete | Yes |
| /api/companies/join | POST | Join via code | Yes |
| /api/companies/members | GET, PATCH, POST | Approve/reject | Yes |
| /api/courses | GET, POST, PATCH, DELETE | Dual-mode (courses + enrollments) | Yes |
| /api/dashboard | GET | Aggregated from 8+ models | No |
| /api/departments | GET, POST, PATCH, DELETE | Duplicate prevention | Yes |
| /api/documents | GET, POST, PATCH, DELETE | Access levels | Yes |
| /api/employees | GET, POST | Auto EMP###, search/filter | Yes |
| /api/employees/[id] | GET, PUT, DELETE | Full profile, cascade | Yes |
| /api/expenses | GET, POST, PATCH, DELETE | Approval workflow | Yes |
| /api/holidays | GET, POST, PATCH, DELETE | Type enum | Yes |
| /api/jobs | GET, POST, PATCH, DELETE | JSON fields | Yes |
| /api/leaves | GET, POST, PATCH, DELETE | Approval workflow | Yes |
| /api/meetings | GET, POST | Bulk invitations | Yes |
| /api/meetings/[id] | GET, PATCH, DELETE | Cascade invitations | Yes |
| /api/meetings/invitations | GET, PATCH | RSVP tracking | Yes |
| /api/office-locations | GET, POST, PATCH, DELETE | Geofence data | Yes |
| /api/payroll | GET, POST, PATCH, DELETE | Auto-calc Indian compliance | Yes |
| /api/performance | GET, POST, PATCH, DELETE | Rating 0-5, attrition 0-1 | Yes |
| /api/policies | GET, POST, PATCH, DELETE | Version tracking | Yes |
| /api/profile | GET, PATCH, POST | Avatar upload, field control | Yes |
| /api/projects | GET, POST | Status/priority/progress | Yes |
| /api/projects/[id] | GET, PATCH, DELETE | Cascade milestones+members | Yes |
| /api/projects/members | POST, PATCH, DELETE | Role assignment | Yes |
| /api/projects/milestones | POST, PATCH, DELETE | Auto completedDate | Yes |
| /api/roles | GET, POST, PATCH, DELETE | JSON permissions | Yes |
| /api/shifts | GET, POST, PATCH, DELETE | Duplicate prevention | Yes |
| /api/skills | GET, POST, PATCH, DELETE | Dual-mode | Yes |
| /api/tasks | GET, POST | Bulk assignments | Yes |
| /api/tasks/[id] | GET, PATCH, DELETE | Cascade comments+assignments | Yes |
| /api/tasks/assignments | PATCH | Auto-finish on all complete | Yes |
| /api/tasks/comments | GET, POST | HR flag support | Yes |

---

## Part VII: AI Integration & Standards

### Z-AI Web Dev SDK Integration

```typescript
import ZAI from 'z-ai-web-dev-sdk';

const zai = await ZAI.create();

// Chat completions
const completion = await zai.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are an HR assistant...' },
    { role: 'user', content: userMessage },
  ],
});

// Interview question generation
const questions = await zai.chat.completions.create({
  messages: [
    { role: 'system', content: 'Generate interview questions...' },
    { role: 'user', content: `Job: ${title}, Skills: ${skills}` },
  ],
});
```

### AI Interview System

1. **Question Generation**: 8-10 questions across 4 categories (technical, behavioral, problem_solving, culture_fit)
2. **Fallback**: Hardcoded question templates when AI fails
3. **Storage**: Questions and responses stored as JSON strings in AIInterview model
4. **Safety**: `safeJsonParse()` helper for graceful handling of malformed data

### AI Coding Standards

1. Z-AI SDK **must only** be used in backend API routes (never client-side)
2. Every AI operation must implement a **fallback mechanism**
3. AI-generated content must be **clearly labeled** in the UI
4. All AI inputs/outputs must be **logged for audit**
5. AI responses must be **validated and sanitized** before storage
6. AI is **advisory only**; final decisions require human confirmation
7. Conversation history limited to **last 10 messages** for token management

---

## Part VIII: Coding Standards

### TypeScript Standards
- Explicit type annotations on all props and parameters
- Interfaces preferred over type aliases for object shapes
- API response types co-located with component files
- `ModuleKey` string literal union for type-safe module references
- Generic types in `useApi<T>` and `exportToExcel<T>()`

### Component Standards
- `'use client'` directive on all module components
- Default exports following Next.js conventions
- Consistent hook ordering: useState → useApi → useMemo → useCallback → useEffect
- Explicit error states with retry buttons
- Loading spinners (Loader2 from lucide-react)
- Responsive grid layouts (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)

### API Route Standards
- GET for reads, POST for creates, PATCH for partial updates, PUT for full updates, DELETE for removals
- Success: `{ data: T }` or `{ message: string }`. Error: `{ error: string }` with status code
- Status codes: 200, 201, 400, 404, 500
- Required fields validated with descriptive error messages
- Cascading operations wrapped in `prisma.$transaction()`
- Next.js 16 async params: `{ params: Promise<{ id: string }> }`

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Component files | PascalCase.tsx | EmployeeManagement.tsx |
| API routes | route.ts in kebab-case dirs | /api/ai-interview/route.ts |
| Prisma models | PascalCase singular | Employee, CompanyMember |
| Database fields | camelCase | employeeId, firstName |
| React state | camelCase with prefix | employeesLoading, filterDept |
| Handler functions | handle + Action | handleView, handleEdit |
| TypeScript interfaces | PascalCase + Response | EmployeesResponse |
| Environment variables | UPPER_SNAKE_CASE | DATABASE_URL |

---

## Part IX: Module-wise Technical Deep Dive

### Dashboard Module

**Frontend** (765 lines): Uses `useApi<DashboardData>` for aggregated data. 4 stat cards with trend indicators. Recharts: AreaChart (headcount), PieChart (distribution), BarChart (expenses). Quick Actions grid calls `setActiveModule()`. Activity timeline with `formatTimeAgo()`. Pending Approvals panel.

**Backend**: `GET /api/dashboard` performs 8+ Prisma queries: employee counts, attendance sums, payroll totals, department groupBy, expense categories, performance aggregates, candidate pipeline, recent AuditLog entries.

### Employee Management Module

**Frontend** (1,577 lines): 4 `useApi` hooks (employees, departments, assets, documents). Search, 3 filters, org chart, Excel export, add/edit dialog, detail Sheet with salary masking. Auto-generates `EMP###` IDs.

**Backend**: Auto employeeId generation, duplicate email check, cascade delete in `$transaction`. Full profile endpoint with all 9+ relations.

### Talent Acquisition Module (AI-Powered)

**Frontend** (2,658 lines - largest): Three-tab interface (Jobs, Candidates, AI Interviews). Job form with JSON arrays. Kanban pipeline. AI Interview button triggers question generation.

**Backend**: Auto `aiFitScore` = matchingSkills / totalRequired * 100. Z-AI SDK for question generation with fallback. Candidate status pipeline enforced.

### Payroll & Expenses Module

**Frontend** (1,464 lines): Two-tab layout. Payroll table with editable computed cells. Expense approval interface with status badges.

**Backend**: Auto-calculates HRA (40%), DA (10%), PF (12%), ESI (0.75%), ProfTax (Rs.200). Recalculates on any change. Expense workflow: pending → approved → reimbursed (immutable).

### Time & Attendance Module

**Frontend** (1,566 lines): Four tabs (Attendance, Leaves, Shifts, Holidays). Geofence-validated check-in. Leave request/approval interface. Shift management. Holiday calendar.

**Backend**: Duplicate attendance prevention. Late status based on shift grace time. Leave approval with re-processing prevention.

---

## Part X: Deployment & Configuration

### Vercel Deployment

Build command: `next build` generates standalone output for serverless. All API routes execute as serverless functions. DATABASE_URL and NEXTAUTH_SECRET must be configured in Vercel project settings.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string (Neon) |
| NEXTAUTH_SECRET | Yes | JWT signing secret (min 32 chars) |
| NEXTAUTH_URL | Yes | Production URL for callbacks |
| GOOGLE_CLIENT_ID | Optional | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Optional | Google OAuth client secret |

### Database Commands

```bash
npm run db:generate    # Generate Prisma client from schema
npm run db:push        # Push schema changes to database
npm run db:migrate     # Create and apply migrations
npm run db:reset       # Reset database and re-seed
npm run db:seed        # Run seed script for demo data
```

---

## Download Links

- 📄 [Module-wise SOP Document (DOCX)](../download/AI-HRMS_Module-wise_SOP_Document.docx)
- 📄 [Comprehensive Technical Documentation (DOCX)](../download/AI-HRMS_Technical_Documentation.docx)
