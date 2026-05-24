const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, PageNumber, PageBreak, BorderStyle, WidthType,
  ShadingType, TableOfContents, NumberFormat } = require("docx");
const fs = require("fs");

// ── Palette: GO-1 Graphite Orange (proposal/PRD feel) ──
const P = {
  primary: "1A2330", body: "2C3E50", secondary: "607080", accent: "D4875A",
  surface: "F8F0EB", coverBg: "1A2330", coverTitle: "FFFFFF",
  coverSub: "B0B8C0", coverMeta: "90989F", coverFooter: "687078",
  tableHeaderBg: "D4875A", tableHeaderText: "FFFFFF",
  tableAccentLine: "D4875A", tableInnerLine: "DDD0C8", tableSurface: "F8F0EB",
};
const c = (hex) => hex.replace("#","");

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const hBorders = {
  top: { style: BorderStyle.SINGLE, size: 2, color: P.tableAccentLine },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: P.tableAccentLine },
  left: NB, right: NB,
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.tableInnerLine },
  insideVertical: NB,
};

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 480, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3, spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: c(P.primary), font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}
function p(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, indent: { firstLine: 480 }, spacing: { line: 312, after: 80 },
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
    indent: { left: 720 + level * 360 }, spacing: { line: 312, after: 40 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: c(P.accent) }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } }),
    ],
  });
}
function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    spacing: { line: 260, after: 0 },
    indent: { left: 720 },
    children: [new TextRun({ text: line, size: 18, color: "2D2D2D", font: { ascii: "Consolas", eastAsia: "Consolas" } })],
  }));
}
function boldBullet(label, desc) {
  return new Paragraph({
    indent: { left: 720 }, spacing: { line: 312, after: 40 },
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
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: hBorders,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: P.tableHeaderBg }, margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22, color: P.tableHeaderText, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] })],
        })),
      }),
      ...rows.map((row, idx) => new TableRow({
        children: row.map(cell => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? P.tableSurface : "FFFFFF" }, margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 21, color: c(P.body), font: { ascii: "Times New Roman", eastAsia: "SimSun" } })] })],
        })),
      })),
    ],
  });
}

function buildCoverSection() {
  return {
    properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: allNoBorders,
        rows: [new TableRow({
          height: { value: 16838, rule: "exact" },
          children: [new TableCell({
            verticalAlign: "top", shading: { type: ShadingType.CLEAR, fill: P.coverBg }, borders: allNoBorders,
            children: [
              new Paragraph({ spacing: { before: 4000 }, children: [] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200, line: 1200, lineRule: "atLeast" },
                children: [new TextRun({ text: "AI-HRMS", size: 96, bold: true, color: P.coverTitle, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100, line: 600, lineRule: "atLeast" },
                children: [new TextRun({ text: "Comprehensive Technical Documentation", size: 40, color: P.accent, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
                children: [new TextRun({ text: "Frontend | Backend | Middleware | API | AI | Coding Standards", size: 22, color: P.coverSub, font: { ascii: "Times New Roman" } })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
                border: { top: { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 20 } },
                indent: { left: 3000, right: 3000 }, children: [] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 },
                children: [new TextRun({ text: "Version 1.0  |  May 2026", size: 22, color: P.coverMeta, font: { ascii: "Times New Roman" } })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 },
                children: [new TextRun({ text: "Complete Code Explanation & Architecture Reference", size: 20, color: P.coverFooter, font: { ascii: "Times New Roman" } })] }),
            ],
          })],
        })],
      }),
    ],
  };
}

function buildBody() {
  const children = [];

  // ═══════════════════════════════════════════════════════
  // PART I: SYSTEM ARCHITECTURE
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part I: System Architecture Overview"));
  children.push(p("The AI-HRMS platform is built on a modern full-stack JavaScript architecture leveraging Next.js 16 with App Router, React 19, Prisma ORM 6 with PostgreSQL, and NextAuth.js v4 for authentication. The application follows a single-page application (SPA) pattern within the Next.js framework, where a single page component (app/page.tsx) dynamically renders 18 module components based on the active module selected from the sidebar navigation. This architectural decision eliminates the need for client-side routing complexity while maintaining a seamless user experience with instant module switching."));
  children.push(p("The deployment target is Vercel's serverless platform, which imposes specific architectural constraints: all API routes execute as serverless functions, database connections must be managed through a singleton Prisma client pattern to prevent connection pool exhaustion, and the application must be stateless at the server level with JWT-based session management. The frontend utilizes a comprehensive set of Radix UI primitives composed via shadcn/ui, providing consistent, accessible, and highly customizable UI components across all modules."));

  children.push(h2("Technology Stack"));
  children.push(makeTable(
    ["Layer", "Technology", "Version", "Purpose"],
    [
      ["Frontend Framework", "Next.js (App Router)", "16", "Full-stack React framework with server components, API routes, SSR"],
      ["UI Library", "React", "19", "Component-based UI with hooks, concurrent features"],
      ["Styling", "Tailwind CSS", "4", "Utility-first CSS with dark mode support"],
      ["UI Components", "shadcn/ui + Radix UI", "Latest", "40+ accessible, composable UI primitives"],
      ["State Management", "Zustand", "5", "Lightweight client-side store (activeModule, sidebarOpen, searchQuery)"],
      ["Charts", "Recharts", "2", "Area, Bar, Pie charts for dashboard and analytics"],
      ["Backend ORM", "Prisma", "6", "Type-safe database queries, migrations, seeding"],
      ["Database", "PostgreSQL (Neon)", "Managed", "Primary data store with 28 models"],
      ["Authentication", "NextAuth.js", "4", "Credentials + Google OAuth, JWT sessions (24h)"],
      ["Password Hashing", "bcryptjs", "Latest", "Salt factor 12 for secure password storage"],
      ["Excel Export", "xlsx (SheetJS)", "Latest", "Client-side .xlsx generation with 6 report templates"],
      ["AI Integration", "z-ai-web-dev-sdk", "Latest", "AI chat, interview question generation, image gen"],
      ["Forms", "react-hook-form + zod", "Latest", "Form validation and schema definitions"],
      ["Icons", "lucide-react", "Latest", "1,000+ consistent SVG icons across all modules"],
      ["Animations", "framer-motion", "Latest", "Page transitions and micro-interactions"],
      ["Deployment", "Vercel", "Serverless", "Edge functions, automatic HTTPS, CI/CD from GitHub"],
    ]
  ));

  children.push(h2("Project Structure"));
  children.push(...codeBlock([
    "ai-hrms/",
    "\u251c\u2500\u2500 prisma/",
    "\u2502   \u251c\u2500\u2500 schema.prisma          # 28 Prisma models (PostgreSQL)",
    "\u2502   \u2514\u2500\u2500 seed.ts              # 373-line seed script with 11 users",
    "\u251c\u2500\u2500 src/",
    "\u2502   \u251c\u2500\u2500 app/",
    "\u2502   \u2502   \u251c\u2500\u2500 layout.tsx           # Root layout (fonts, providers, toaster)",
    "\u2502   \u2502   \u251c\u2500\u2500 page.tsx            # Main SPA page (18 module switcher)",
    "\u2502   \u2502   \u251c\u2500\u2500 login/page.tsx      # Login page (credentials + Google OAuth)",
    "\u2502   \u2502   \u2514\u2500\u2500 api/               # 42 API route handlers",
    "\u2502   \u2502       \u251c\u2500\u2500 ai-chat/           # AI HR assistant endpoint",
    "\u2502   \u2502       \u251c\u2500\u2500 ai-interview/      # AI interview CRUD + question gen",
    "\u2502   \u2502       \u251c\u2500\u2500 assets/            # Asset management CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 attendance/        # Attendance CRUD + geofence",
    "\u2502   \u2502       \u251c\u2500\u2500 audit/             # Read-only audit log",
    "\u2502   \u2502       \u251c\u2500\u2500 auth/              # NextAuth + change password",
    "\u2502   \u2502       \u251c\u2500\u2500 candidates/        # Candidate CRUD + AI fit score",
    "\u2502   \u2502       \u251c\u2500\u2500 companies/         # Company + members + locations",
    "\u2502   \u2502       \u251c\u2500\u2500 courses/           # Course + enrollment dual-mode",
    "\u2502   \u2502       \u251c\u2500\u2500 dashboard/         # Aggregated dashboard stats",
    "\u2502   \u2502       \u251c\u2500\u2500 departments/       # Department CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 documents/         # Document CRUD + access control",
    "\u2502   \u2502       \u251c\u2500\u2500 employees/         # Employee CRUD + full profile",
    "\u2502   \u2502       \u251c\u2500\u2500 expenses/          # Expense CRUD + approval workflow",
    "\u2502   \u2502       \u251c\u2500\u2500 holidays/          # Holiday CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 jobs/              # Job posting CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 leaves/            # Leave CRUD + approval",
    "\u2502   \u2502       \u251c\u2500\u2500 meetings/          # Meeting + invitations + RSVP",
    "\u2502   \u2502       \u251c\u2500\u2500 payroll/           # Payroll with Indian compliance",
    "\u2502   \u2502       \u251c\u2500\u2500 performance/       # Performance reviews + attrition",
    "\u2502   \u2502       \u251c\u2500\u2500 policies/          # Company policy CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 profile/           # Employee profile + avatar",
    "\u2502   \u2502       \u251c\u2500\u2500 projects/          # Project + members + milestones",
    "\u2502   \u2502       \u251c\u2500\u2500 roles/             # Role + permissions CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 shifts/            # Shift CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 skills/            # Skill + employee-skill CRUD",
    "\u2502   \u2502       \u251c\u2500\u2500 tasks/             # Task + assignments + comments",
    "\u2502   \u2502       \u2514\u2500\u2500 office-locations/  # Geofence office locations",
    "\u2502   \u251c\u2500\u2500 components/",
    "\u2502   \u2502   \u251c\u2500\u2500 hrms/               # 18 module components (27,347 LOC)",
    "\u2502   \u2502   \u2514\u2500\u2500 ui/                 # 40+ shadcn/ui primitives",
    "\u2502   \u251c\u2500\u2500 hooks/                  # use-mobile, use-toast",
    "\u2502   \u2514\u2500\u2500 lib/                    # Shared utilities",
    "\u2502       \u251c\u2500\u2500 auth.ts            # NextAuth config (201 lines)",
    "\u2502       \u251c\u2500\u2500 db.ts             # Prisma singleton (13 lines)",
    "\u2502       \u251c\u2500\u2500 excelExport.ts     # 6 export functions (261 lines)",
    "\u2502       \u251c\u2500\u2500 store.ts           # Zustand store (39 lines)",
    "\u2502       \u251c\u2500\u2500 useApi.ts          # API hooks + helpers (111 lines)",
    "\u2502       \u251c\u2500\u2500 data.ts            # Mock data (659 lines)",
    "\u2502       \u2514\u2500\u2500 utils.ts           # cn() utility (6 lines)",
    "\u251c\u2500\u2500 middleware.ts               # NextAuth route protection (22 lines)",
    "\u2514\u2500\u2500 package.json               # 99 lines, 30+ dependencies",
  ]));

  // ═══════════════════════════════════════════════════════
  // PART II: FRONTEND ARCHITECTURE
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part II: Frontend Architecture"));
  children.push(h2("Component Architecture Pattern"));
  children.push(p("The AI-HRMS frontend follows a single-page application pattern where the main page.tsx component acts as a module router. Instead of using Next.js file-based routing with separate pages for each module, the application renders all 18 module components within a single page and switches between them using Zustand's activeModule state. This approach provides instant module switching without page reloads, consistent state preservation across module switches, simplified state management with a single global store, and easier implementation of cross-module features like global search and quick actions."));
  children.push(p("Each module component follows a consistent internal structure: a 'use client' directive at the top for client-side interactivity, TypeScript interfaces defining the component's data types, custom hooks from useApi.ts for data fetching with automatic loading/error states, handler functions for user interactions (CRUD operations, navigation, filtering), JSX rendering with shadcn/ui components arranged in a responsive grid layout, and integration with the Excel export utility for data export functionality."));

  children.push(h2("Module Component Mapping"));
  children.push(p("The main page.tsx defines a moduleComponents record that maps each ModuleKey (from the Zustand store) to its corresponding React component. When a user selects a module from the sidebar, the setActiveModule action updates the store, and the main page re-renders with the newly selected component. The mapping is defined as follows:"));
  children.push(...codeBlock([
    "const moduleComponents: Record<ModuleKey, React.ComponentType> = {",
    "  dashboard: Dashboard,",
    "  employees: EmployeeManagement,",
    "  company: CompanyManagement,",
    "  tasks: TaskManagement,",
    "  meetings: MeetingManagement,",
    "  projects: ProjectManagement,",
    "  assets: AssetManagement,",
    "  documents: DocumentManagement,",
    "  rbac: RBACSecurity,",
    "  talent: TalentAcquisition,",
    "  attendance: TimeAttendance,",
    "  payroll: PayrollExpense,",
    "  performance: Performance,",
    "  learning: LearningDevelopment,",
    "  analytics: Analytics,",
    "  selfservice: SelfService,",
    "  profile: ProfileManagement,",
    "  settings: Settings,",
    "}",
  ]));

  children.push(h2("State Management"));
  children.push(p("The application uses Zustand 5 as its primary client-side state management solution. The store is defined in /lib/store.ts with three state fields: activeModule (a ModuleKey union type of 18 module identifiers), sidebarOpen (boolean controlling sidebar collapse state, default true), and searchQuery (string for the sidebar module search filter). Zustand was chosen over Redux or Context API for its minimal boilerplate, TypeScript-first design, automatic re-render optimization through selectors, and ability to persist state across module switches without prop drilling."));
  children.push(...codeBlock([
    "// lib/store.ts",
    "import { create } from 'zustand'",
    "",
    "export type ModuleKey = 'dashboard' | 'employees' | 'assets' |",
    "  'documents' | 'rbac' | 'talent' | 'attendance' | 'payroll' |",
    "  'performance' | 'learning' | 'analytics' | 'selfservice' |",
    "  'company' | 'tasks' | 'meetings' | 'projects' |",
    "  'profile' | 'settings'",
    "",
    "interface HRMSStore {",
    "  activeModule: ModuleKey",
    "  sidebarOpen: boolean",
    "  searchQuery: string",
    "  setActiveModule: (module: ModuleKey) => void",
    "  setSidebarOpen: (open: boolean) => void",
    "  setSearchQuery: (query: string) => void",
    "}",
    "",
    "export const useHRMSStore = create<HRMSStore>((set) => ({",
    "  activeModule: 'dashboard',",
    "  sidebarOpen: true,",
    "  searchQuery: '',",
    "  setActiveModule: (module) => set({ activeModule: module }),",
    "  setSidebarOpen: (open) => set({ sidebarOpen: open }),",
    "  setSearchQuery: (query) => set({ searchQuery: query }),",
    "}))",
  ]));

  children.push(h2("Data Fetching Pattern"));
  children.push(p("All API communication follows a consistent pattern through the useApi hook and helper functions defined in /lib/useApi.ts. The useApi hook is a custom React hook that manages GET requests with automatic state management for loading, error, and data states. It serializes params into URL query strings, supports an enabled flag for conditional fetching (used when selectedEmployee exists before fetching assets/documents), and provides a refetch function for manual data refresh after mutations. For POST, PATCH, PUT, and DELETE operations, the module provides standalone async functions (apiPost, apiPatch, apiPut, apiDelete) that handle JSON serialization, error parsing, and response validation."));
  children.push(...codeBlock([
    "// lib/useApi.ts - useApi hook signature",
    "interface UseApiOptions<T> {",
    "  baseUrl: string          // API endpoint path (e.g., '/api/employees')",
    "  params?: Record<string, any>  // Query parameters (auto-serialized)",
    "  enabled?: boolean        // Conditional fetch flag (default: true)",
    "}",
    "",
    "interface UseApiReturn<T> {",
    "  data: T | null           // Response data (typed)",
    "  loading: boolean         // Loading state indicator",
    "  error: string | null     // Error message string",
    "  refetch: () => void      // Manual refetch trigger",
    "}",
    "",
    "// Usage in components:",
    "const { data, loading, error, refetch } = useApi<EmployeesResponse>({",
    "  baseUrl: '/api/employees',",
    "  params: { page: 1, limit: 100, department: filterDept, search: searchQuery },",
    "})",
  ]));

  children.push(h2("Sidebar Navigation Architecture"));
  children.push(p("The Sidebar component (540 lines) implements a sophisticated responsive navigation system with three rendering modes: desktop expanded (16rem width), desktop collapsed (4.5rem width with tooltip-only labels), and mobile (Sheet/drawer component). It features a branded header with the AI-HRMS logo and 'Smart Workspace' tagline, a module search input that filters the navigation list in real-time, 18 navigation items with active state indicators (emerald highlight bar on left edge), AI-powered badges on 4 modules (Talent Acquisition, Performance, L&D, Analytics), a notification bell with count badge, user profile section with avatar and role display, and Settings/Logout quick actions. The component uses useSyncExternalStore for SSR-safe media query detection and requestAnimationFrame for hydration-safe mounting."));

  children.push(h2("UI Component Library"));
  children.push(p("The application utilizes 40+ shadcn/ui components built on Radix UI primitives. These components follow a consistent design system with emerald as the primary accent color, dark mode support through CSS custom properties (hsl(var(--*))), and a composable pattern where complex UIs are built by composing primitives. Key components used across modules include: Dialog and Sheet for modal interactions (employee detail, add/edit forms), Table for data display with sorting and pagination, Select and Input for form controls, Tabs for module sub-navigation, Badge for status indicators with color-coded variants, Card for content grouping, and Toast (via sonner) for operation feedback. All components are defined in /components/ui/ with proper TypeScript types and Tailwind CSS styling."));

  children.push(h2("Excel Export System"));
  children.push(p("The Excel export functionality is centralized in /lib/excelExport.ts (261 lines) using the xlsx (SheetJS) library. It provides a generic exportToExcel function and 6 specialized export functions, each with pre-defined column mappings and optional transform functions for data formatting. The system auto-generates filenames with the current date (e.g., Employee_Report_2026-05-24.xlsx) and triggers browser downloads through the FileSaver pattern. The six specialized functions are: exportAttendanceReport (columns: Employee ID, Name, Date, Status, Check-in, Check-out), exportPayrollReport (columns: Employee, Basic, HRA, DA, PF, ESI, Prof Tax, Net Salary), exportLeaveReport (columns: Employee, Type, Start Date, End Date, Status, Reason), exportExpenseReport (columns: Employee, Category, Amount, Date, Status), exportProjectReport (columns: Project, Status, Progress, Start, End, Team), and exportEmployeeReport (columns: ID, Name, Email, Phone, Department, Designation, Status, Join Date, Salary)."));

  // ═══════════════════════════════════════════════════════
  // PART III: BACKEND ARCHITECTURE
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part III: Backend Architecture"));
  children.push(h2("API Route Handler Pattern"));
  children.push(p("All 42 API routes follow Next.js 16 App Router conventions with Route Handlers. Each route.ts file exports named async functions (GET, POST, PATCH, PUT, DELETE) that receive a Request object and return a NextResponse. Dynamic route parameters use the Next.js 16 async pattern where params is a Promise that must be awaited: { params: Promise<{ id: string }> }. This pattern ensures proper type safety and handles the asynchronous nature of route parameter resolution in the latest Next.js version."));
  children.push(p("Every API route follows a consistent error handling pattern: try/catch blocks wrapping all Prisma operations, console.error for server-side logging, JSON error responses with descriptive messages, and appropriate HTTP status codes (400 for validation errors, 404 for not found, 500 for server errors). Successful operations return JSON responses with the affected data and a 200/201 status code. All write operations (POST, PATCH, PUT, DELETE) create AuditLog entries with the action, module, and human-readable details string."));

  children.push(h2("Pagination Pattern"));
  children.push(p("All list endpoints support server-side pagination through page and limit query parameters with sensible defaults (page=1, limit=10). The response format consistently returns a pagination object alongside the data array. The pagination object includes four fields: page (current page number), limit (items per page), total (total count of matching records), and totalPages (calculated as Math.ceil(total / limit)). This pattern is implemented across all 20+ list endpoints including employees, departments, candidates, attendance, leaves, expenses, documents, assets, meetings, projects, tasks, courses, jobs, and audit logs. The frontend useApi hook integrates seamlessly with this pagination structure."));
  children.push(...codeBlock([
    "// Standard paginated response structure",
    "// GET /api/employees?page=1&limit=20&department=Engineering",
    "{",
    "  employees: [...],  // Array of employee objects",
    "  pagination: {",
    "    page: 1,",
    "    limit: 20,",
    "    total: 156,",
    "    totalPages: 8",
    "  }",
    "}",
  ]));

  children.push(h2("Cascade Delete Pattern"));
  children.push(p("Several modules implement cascade delete operations using Prisma's $transaction API to ensure data integrity when deleting parent records. The pattern follows a specific order: first delete child records that reference the parent, then delete the parent record itself. This approach is used in the Employee module (delete taskComments, taskAssignments, tasks, meetingInvitations, meetings, officeLocations, companyMembers, company, then employee), Company module (delete taskComments, taskAssignments, tasks, meetingInvitations, meetings, officeLocations, members, then company), Project module (delete milestones, members, then project), Task module (delete comments, assignments, then task), and Meeting module (delete invitations, then meeting). All cascade operations are wrapped in prisma.$transaction() to ensure atomicity."));
  children.push(...codeBlock([
    "// Example: Cascade delete in /api/companies/[id]/route.ts",
    "export async function DELETE(",
    "  request: Request,",
    "  { params }: { params: Promise<{ id: string }> }",
    ") {",
    "  const { id } = await params;",
    "  try {",
    "    await db.$transaction([",
    "      db.taskComment.deleteMany({ where: { task: { companyId: id } } }),",
    "      db.taskAssignment.deleteMany({ where: { task: { companyId: id } } }),",
    "      db.task.deleteMany({ where: { companyId: id } }),",
    "      db.meetingInvitation.deleteMany({ where: { meeting: { companyId: id } } }),",
    "      db.meeting.deleteMany({ where: { companyId: id } }),",
    "      db.officeLocation.deleteMany({ where: { companyId: id } }),",
    "      db.companyMember.deleteMany({ where: { companyId: id } }),",
    "      db.company.delete({ where: { id } }),",
    "    ]);",
    "    return NextResponse.json({ message: 'Company deleted' });",
    "  } catch (error) {",
    "    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });",
    "  }",
    "}",
  ]));

  children.push(h2("Audit Logging Pattern"));
  children.push(p("Audit logging is implemented consistently across all write operations. Each audit entry is created via prisma.auditLog.create() with four required fields: action (the verb describing the operation, e.g., 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'), module (the module name, e.g., 'hr', 'payroll', 'attendance', 'leave'), details (a human-readable description string, e.g., 'Employee John Doe added to Engineering department'), and userId (the authenticated user performing the action). Optional fields include employeeId when the action relates to a specific employee. The audit log is read-only via GET /api/audit with filtering by action, module, employeeId, userId, and date range. This pattern ensures complete traceability for compliance requirements."));

  // ═══════════════════════════════════════════════════════
  // PART IV: DATABASE SCHEMA
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part IV: Database Schema & Models"));
  children.push(h2("Prisma Configuration"));
  children.push(p("The database layer uses Prisma ORM 6 with PostgreSQL as the provider. The schema is defined in prisma/schema.prisma with 28 models organized into functional domains. The Prisma client is instantiated as a singleton using the globalThis pattern in /lib/db.ts to prevent connection pool exhaustion in development mode where hot module reloading would otherwise create multiple PrismaClient instances. In production, only error-level logging is enabled to minimize overhead, while development mode includes query, error, and warn logging for debugging."));
  children.push(...codeBlock([
    "// lib/db.ts - Singleton Prisma Client",
    "import { PrismaClient } from '@prisma/client'",
    "",
    "const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }",
    "",
    "export const db = globalForPrisma.prisma || new PrismaClient({",
    "  log: process.env.NODE_ENV === 'development'",
    "    ? ['query', 'error', 'warn']",
    "    : ['error'],",
    "})",
    "",
    "if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db",
  ]));

  children.push(h2("Complete Data Model Catalog"));
  children.push(makeTable(
    ["Model", "Key Fields", "Relations", "Purpose"],
    [
      ["User", "email, passwordHash, name, roleId", "Role, Account, Employee", "Authentication and authorization"],
      ["Account", "provider, providerAccountId, access_token", "User", "OAuth provider accounts (Google)"],
      ["Session", "sessionToken, expires", "User", "NextAuth session management"],
      ["Employee", "employeeId, firstName, lastName, email, department, salary, status", "Department, User, Assets, Documents", "Core HR employee records"],
      ["Department", "name, head, description, budget", "Employees", "Organizational structure"],
      ["Role", "name, level, permissions (JSON)", "Users", "RBAC with 7 levels (0-6)"],
      ["Attendance", "employeeId, date, status, checkInTime, location", "Employee, Shift", "Time tracking with geofence"],
      ["Leave", "employeeId, leaveType, startDate, endDate, status", "Employee", "Leave management with approval"],
      ["Shift", "name, startTime, endTime, graceTime", "Attendance", "Work shift definitions"],
      ["Holiday", "name, date, type, description", "Company", "Holiday calendar (national/company/optional)"],
      ["Payroll", "employeeId, month, year, basicSalary, hra, da, pf, esi, netSalary", "Employee", "Indian payroll compliance"],
      ["Expense", "employeeId, category, amount, date, status", "Employee", "Expense claims with approval workflow"],
      ["Performance", "employeeId, reviewerId, rating, attritionRisk, status", "Employee", "Performance reviews + attrition prediction"],
      ["Skill", "name, category", "EmployeeSkill", "Skill definitions"],
      ["EmployeeSkill", "employeeId, skillId, proficiencyLevel", "Employee, Skill", "Employee-skill proficiency mapping"],
      ["Course", "title, category, duration, difficulty", "Enrollments", "L&D course catalog"],
      ["CourseEnrollment", "employeeId, courseId, status, progress", "Employee, Course", "Course enrollment tracking"],
      ["Job", "title, department, requirements (JSON), skills (JSON)", "Candidates", "Job postings"],
      ["Candidate", "jobId, aiFitScore, status", "Job", "Recruitment pipeline tracking"],
      ["AIInterview", "candidateId, jobId, questions (JSON), responses (JSON)", "Candidate, Job", "AI interview sessions"],
      ["Company", "name, industry, joinCode", "Members, Locations", "Multi-company management"],
      ["CompanyMember", "companyId, employeeId, role, status", "Company, Employee", "Company membership with approval"],
      ["OfficeLocation", "companyId, name, latitude, longitude, radius", "Company", "Geofence office locations"],
      ["Task", "title, companyId, priority, status, dueDate", "Company, Assignments, Comments", "Task tracking"],
      ["TaskAssignment", "taskId, employeeId, status", "Task, Employee", "Multi-assignee task tracking"],
      ["TaskComment", "taskId, employeeId, content, isHr", "Task, Employee", "Task discussion threads"],
      ["Meeting", "title, companyId, meetingType, date", "Company, Invitations", "Meeting scheduling"],
      ["MeetingInvitation", "meetingId, employeeId, status, respondedAt", "Meeting, Employee", "RSVP tracking"],
      ["Project", "name, companyId, priority, progress, startDate", "Company, Members, Milestones", "Project lifecycle management"],
      ["ProjectMember", "projectId, employeeId, role", "Project, Employee", "Project team management"],
      ["ProjectMilestone", "projectId, title, dueDate, completedDate", "Project", "Project milestone tracking"],
      ["Asset", "employeeId, assetType, assetName, serialNo, condition, status", "Employee", "IT asset tracking"],
      ["Document", "employeeId, name, docType, accessLevel, fileUrl", "Employee", "Document management with access control"],
      ["CompanyPolicy", "companyId, title, category, content, version", "Company", "Policy document management"],
      ["AuditLog", "action, module, details, userId, employeeId, createdAt", "User, Employee", "Immutable compliance trail"],
    ]
  ));

  children.push(h2("Seed Data"));
  children.push(p("The seed script (prisma/seed.ts, 373 lines) creates a comprehensive demo dataset with 4 shifts, 8 departments, 7 roles (Super Admin at level 0 through Employee at level 6, each with JSON permissions for 18+ modules), 20 employees (EMP001-EMP020 with Indian names, distributed across departments with active/onboarding/inactive/exited statuses), 11 user accounts with bcrypt-hashed passwords (printed in a table at the end of seeding), 15 skills with 14 employee-skill mappings, 8 attendance records, 6 leave requests, 5 payroll records, 5 expense claims, 6 performance reviews, 6 assets, 8 documents, 8 courses with 5 enrollments, 5 job postings, 6 candidates with AI fit scores, 5 company policies, and 10 holidays."));

  // ═══════════════════════════════════════════════════════
  // PART V: MIDDLEWARE LAYER
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part V: Middleware Layer"));
  children.push(h2("NextAuth Middleware"));
  children.push(p("The middleware layer (middleware.ts, 22 lines) implements route protection using NextAuth's withAuth function. It acts as a gatekeeper for all incoming requests, allowing unauthenticated access only to specific routes: /api/auth/* (authentication endpoints), /_next/static/* (static assets), /_next/image/* (image optimization), /favicon.ico, and /logo.svg. All other routes require an authenticated session. When an unauthenticated user attempts to access a protected route, the middleware redirects them to the /login page. The middleware runs on the Edge runtime for optimal performance on Vercel's serverless platform."));
  children.push(...codeBlock([
    "// middleware.ts",
    "import { withAuth } from 'next-auth/middleware'",
    "",
    "export default withAuth({",
    "  pages: { signIn: '/login' },",
    "})",
    "",
    "export const config = {",
    "  matcher: [",
    "    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.svg).*)',",
    "  ],",
    "}",
  ]));

  children.push(h2("Authentication Flow"));
  children.push(p("The authentication system is configured in /lib/auth.ts (201 lines) using NextAuth.js v4 with two providers: CredentialsProvider for email/password authentication and GoogleProvider for OAuth. The CredentialsProvider's authorize callback queries the User model by email, verifies the password using bcryptjs.compare(), updates lastLoginAt, and creates an AuditLog entry for the login attempt. The GoogleProvider handles both existing user linking (matching by email) and new user auto-creation (assigning the 'Employee' role by default, creating an Account record for the Google provider)."));
  children.push(p("The JWT strategy is used exclusively (no database sessions) with a 24-hour maximum age. The JWT callback enriches the token with role, roleId, roleLevel, permissions, employeeId, and avatar data from the User and Role models. The session callback transfers these JWT claims into the client-side session object, making them available throughout the application for role-based UI rendering and permission checks. This approach ensures that role and permission changes take effect on the next token refresh without requiring database queries on every request."));

  // ═══════════════════════════════════════════════════════
  // PART VI: API INTEGRATION
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part VI: API Integration Reference"));
  children.push(h2("Complete API Endpoint Catalog"));
  children.push(makeTable(
    ["Endpoint", "Methods", "Key Features", "Audit Logged"],
    [
      ["/api/ai-chat", "POST", "AI HR assistant using Z-AI SDK", "No"],
      ["/api/ai-interview", "GET, POST", "List/create AI interview sessions", "Yes"],
      ["/api/ai-interview/generate-questions", "POST", "AI question generation (8-10 questions)", "No"],
      ["/api/ai-interview/[id]", "GET, PATCH", "Get/update interview session", "Yes"],
      ["/api/assets", "GET, POST, PATCH, DELETE", "Full CRUD, filter by employeeId/type/status", "Yes"],
      ["/api/attendance", "GET, POST, PATCH, DELETE", "Full CRUD, date range filter, duplicate prevention", "Yes"],
      ["/api/audit", "GET", "Read-only, filter by action/module/date/employee", "N/A"],
      ["/api/auth/change-password", "POST", "bcrypt verification, min 6 chars", "Yes"],
      ["/api/candidates", "GET, POST, PATCH, DELETE", "Auto AI fit score, status pipeline", "Yes"],
      ["/api/companies", "GET, POST", "Auto join code, auto-add creator as owner", "Yes"],
      ["/api/companies/[id]", "GET, PATCH, DELETE", "Cascade delete all child records", "Yes"],
      ["/api/companies/join", "POST", "Join via code, pending/approval workflow", "Yes"],
      ["/api/companies/members", "GET, PATCH, POST", "Approve/reject/add members", "Yes"],
      ["/api/courses", "GET, POST, PATCH, DELETE", "Dual-mode: courses + enrollments", "Yes"],
      ["/api/dashboard", "GET", "Aggregated stats from 8+ models", "No"],
      ["/api/departments", "GET, POST, PATCH, DELETE", "Duplicate name prevention", "Yes"],
      ["/api/documents", "GET, POST, PATCH, DELETE", "Access levels (public/hr-only/confidential)", "Yes"],
      ["/api/employees", "GET, POST", "Auto employeeId (EMP###), search/filter", "Yes"],
      ["/api/employees/[id]", "GET, PUT, DELETE", "Full profile with all relations, cascade delete", "Yes"],
      ["/api/expenses", "GET, POST, PATCH, DELETE", "Approval workflow, immutable when reimbursed", "Yes"],
      ["/api/holidays", "GET, POST, PATCH, DELETE", "Types: national/company/optional", "Yes"],
      ["/api/jobs", "GET, POST, PATCH, DELETE", "JSON requirements/skills, candidate count", "Yes"],
      ["/api/leaves", "GET, POST, PATCH, DELETE", "Approval workflow, prevents re-processing", "Yes"],
      ["/api/meetings", "GET, POST", "Bulk invitation creation", "Yes"],
      ["/api/meetings/[id]", "GET, PATCH, DELETE", "Cascade delete invitations", "Yes"],
      ["/api/meetings/invitations", "GET, PATCH", "RSVP tracking with timestamp", "Yes"],
      ["/api/office-locations", "GET, POST, PATCH, DELETE", "Geofence with lat/lng/radius", "Yes"],
      ["/api/payroll", "GET, POST, PATCH, DELETE", "Auto-calc HRA/DA/PF/ESI/ProfTax", "Yes"],
      ["/api/performance", "GET, POST, PATCH, DELETE", "Rating 0-5, attrition risk 0-1", "Yes"],
      ["/api/policies", "GET, POST, PATCH, DELETE", "Version tracking, effective dates", "Yes"],
      ["/api/profile", "GET, PATCH, POST", "Avatar upload (base64/URL), field access control", "Yes"],
      ["/api/projects", "GET, POST", "Status/priority/progress tracking", "Yes"],
      ["/api/projects/[id]", "GET, PATCH, DELETE", "Cascade delete milestones+members", "Yes"],
      ["/api/projects/members", "POST, PATCH, DELETE", "Role assignment (lead/manager/member)", "Yes"],
      ["/api/projects/milestones", "POST, PATCH, DELETE", "Auto-set completedDate", "Yes"],
      ["/api/roles", "GET, POST, PATCH, DELETE", "JSON permissions, cannot delete assigned roles", "Yes"],
      ["/api/shifts", "GET, POST, PATCH, DELETE", "Duplicate name prevention", "Yes"],
      ["/api/skills", "GET, POST, PATCH, DELETE", "Dual-mode: skills + employee-skills", "Yes"],
      ["/api/tasks", "GET, POST", "Bulk assignment creation", "Yes"],
      ["/api/tasks/[id]", "GET, PATCH, DELETE", "Cascade delete comments+assignments", "Yes"],
      ["/api/tasks/assignments", "PATCH", "Auto-finish task when all assignments complete", "Yes"],
      ["/api/tasks/comments", "GET, POST", "HR flag support (isHr)", "Yes"],
    ]
  ));

  // ═══════════════════════════════════════════════════════
  // PART VII: AI INTEGRATION
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part VII: AI Integration & Standards"));
  children.push(h2("Z-AI Web Dev SDK Integration"));
  children.push(p("The AI-HRMS integrates with the Z-AI Web Dev SDK for three primary AI capabilities: conversational AI chat, interview question generation, and image generation. The SDK is imported as 'z-ai-web-dev-sdk' and must be used exclusively in backend API routes (server-side only) to protect API keys and prevent client-side exposure. The initialization pattern uses the async ZAI.create() method which returns a configured client instance for subsequent API calls."));
  children.push(...codeBlock([
    "// Standard Z-AI SDK initialization pattern",
    "import ZAI from 'z-ai-web-dev-sdk';",
    "",
    "const zai = await ZAI.create();",
    "",
    "// Chat completions for HR assistant",
    "const completion = await zai.chat.completions.create({",
    "  messages: [",
    "    { role: 'system', content: 'You are an HR assistant...' },",
    "    { role: 'user', content: userMessage },",
    "  ],",
    "});",
    "",
    "// Interview question generation",
    "const questions = await zai.chat.completions.create({",
    "  messages: [",
    "    { role: 'system', content: 'Generate interview questions...' },",
    "    { role: 'user', content: `Job: ${title}, Skills: ${skills.join(',')}` },",
    "  ],",
    "});",
  ]));

  children.push(h2("AI Chat Implementation"));
  children.push(p("The AI Chat endpoint (/api/ai-chat/route.ts) implements an HR-specific conversational AI using the Z-AI SDK's chat.completions API. The system prompt positions the AI as an expert HR assistant knowledgeable about HR policies, compliance, employee management, payroll, benefits, and workplace best practices. The endpoint accepts a message string and an optional conversationHistory array, enabling multi-turn conversations with context preservation. The AI response is returned as a JSON object with the message content, allowing the frontend to display it in a chat interface."));

  children.push(h2("AI Interview System"));
  children.push(p("The AI Interview system consists of two endpoints that work together: /api/ai-interview/generate-questions for question generation and /api/ai-interview for session management. The question generation endpoint creates 8-10 questions across four categories: technical (assessing domain-specific knowledge and problem-solving), behavioral (evaluating past experiences and interpersonal skills using STAR methodology), problem_solving (testing analytical thinking and creative solutions), and culture_fit (assessing values alignment and team compatibility). Each question includes evaluation criteria for objective scoring. The system implements a fallback mechanism: if the Z-AI SDK call fails (network error, rate limit, or invalid response), hardcoded question templates are used to ensure the interview can proceed. Interview sessions store both questions and responses as JSON strings in the AIInterview model, with a safe JSON parsing utility that handles malformed data gracefully."));

  children.push(h2("AI Coding Standards"));
  children.push(p("All AI integration code follows these mandatory standards: First, the Z-AI SDK must only be used in backend API routes, never in client-side components, to protect API keys and prevent exposure. Second, every AI operation must implement a fallback mechanism for graceful degradation when the AI service is unavailable. Third, AI-generated content must be clearly labeled as AI-generated in the user interface. Fourth, all AI inputs and outputs must be logged for audit purposes (via the existing AuditLog system). Fifth, AI responses must be validated and sanitized before storage or display, particularly for JSON parsing of structured outputs. Sixth, the AI system is advisory only; final hiring decisions and critical HR actions must require human confirmation. Seventh, conversation history sent to the AI must be limited to the last 10 messages to manage token usage and response latency."));

  // ═══════════════════════════════════════════════════════
  // PART VIII: CODING STANDARDS
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part VIII: Coding Standards"));
  children.push(h2("TypeScript Standards"));
  children.push(p("The codebase enforces strict TypeScript practices throughout. All component props and function parameters must have explicit type annotations. Interfaces are preferred over type aliases for object shapes. API response types are defined as interfaces within each component file (not shared globally) to keep module types co-located with their usage. The ModuleKey type is defined as a string literal union in the Zustand store and reused across the application for type-safe module references. Generic types are used in the useApi hook (useApi<T>) and Excel export functions (exportToExcel<T>()) for type-safe data handling."));

  children.push(h2("Component Standards"));
  children.push(boldBullet("Client Components", "All module components use 'use client' directive since they require React hooks (useState, useEffect, useCallback, useMemo) and browser APIs."));
  children.push(boldBullet("Named Exports", "All components use default exports (export default function ComponentName) following Next.js conventions."));
  children.push(boldBullet("Hooks Ordering", "Consistent hook ordering: useState declarations, useApi hooks, useMemo for derived data, useCallback for handlers, then useEffect for side effects."));
  children.push(boldBullet("Error Boundaries", "Each module renders explicit error states (error message + retry button) rather than crashing the entire application."));
  children.push(boldBullet("Loading States", "Every data-fetching module renders a loading spinner (Loader2 from lucide-react with animate-spin) during API calls."));
  children.push(boldBullet("Responsive Design", "All modules use responsive grid layouts (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) and hide non-essential table columns on mobile."));

  children.push(h2("API Route Standards"));
  children.push(boldBullet("HTTP Methods", "GET for reads, POST for creates, PATCH for partial updates, PUT for full updates, DELETE for removals."));
  children.push(boldBullet("Response Format", "Success: { data: T } or { message: string }. Error: { error: string } with appropriate status code."));
  children.push(boldBullet("Status Codes", "200 (OK), 201 (Created), 400 (Bad Request/Validation), 404 (Not Found), 500 (Internal Server Error)."));
  children.push(boldBullet("Input Validation", "Required fields checked explicitly with descriptive error messages. Status enums validated against allowed values."));
  children.push(boldBullet("Transaction Usage", "Cascade deletes and multi-step operations wrapped in prisma.$transaction() for atomicity."));
  children.push(boldBullet("Async Params", "Next.js 16 dynamic routes use { params: Promise<{ id: string }> } pattern, always awaited before use."));

  children.push(h2("Naming Conventions"));
  children.push(makeTable(
    ["Element", "Convention", "Example"],
    [
      ["Component files", "PascalCase.tsx", "EmployeeManagement.tsx"],
      ["API route files", "route.ts (in kebab-case dirs)", "/api/ai-interview/route.ts"],
      ["Prisma models", "PascalCase singular", "Employee, CompanyMember"],
      ["Database fields", "camelCase", "employeeId, firstName, checkInTime"],
      ["API parameters", "camelCase (query params)", "?employeeId=xxx&leaveType=sick"],
      ["React state", "camelCase with descriptive prefix", "employeesLoading, filterDept, addOpen"],
      ["Handler functions", "handle + Action", "handleView, handleEdit, handleDelete"],
      ["TypeScript interfaces", "PascalCase + Response suffix for API types", "EmployeesResponse, DashboardData"],
      ["Environment variables", "UPPER_SNAKE_CASE", "DATABASE_URL, NEXTAUTH_SECRET"],
      ["CSS classes", "Tailwind utility classes", "bg-emerald-100 text-emerald-700"],
    ]
  ));

  children.push(h2("File Organization Standards"));
  children.push(p("Each module component is self-contained in a single file under /components/hrms/, including its TypeScript interfaces, helper functions, and JSX. This co-location pattern keeps all module-related code together for easy maintenance and reduces import complexity. Shared utilities are centralized in /lib/: auth.ts for NextAuth configuration, db.ts for Prisma client, excelExport.ts for export functions, store.ts for Zustand state, useApi.ts for data fetching, data.ts for mock/fallback data, and utils.ts for the cn() class merging utility. API routes follow the Next.js App Router convention with each route in its own directory under /app/api/."));

  // ═══════════════════════════════════════════════════════
  // PART IX: MODULE-WISE TECHNICAL DEEP DIVE
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part IX: Module-wise Technical Deep Dive"));

  const moduleTech = [
    { name: "Dashboard Module", frontend: "Dashboard.tsx (765 lines). Uses useApi<DashboardData> hook to fetch aggregated data from /api/dashboard. Renders 4 stat cards with trend indicators using emerald/amber/cyan/rose color coding. Three Recharts visualizations: AreaChart for department headcount (with linear gradient fill), PieChart for distribution (donut style with innerRadius=60, outerRadius=95), and BarChart for expense breakdown (dual bars for amount and transaction count). Quick Actions grid with 6 navigation buttons calling setActiveModule(). Recent Activities timeline with formatTimeAgo() relative time formatting. Pending Approvals panel with counts from overview data.", backend: "GET /api/dashboard performs 8+ Prisma queries: totalEmployees count, activeEmployees count with status='active', recentHires with date filter (last 30 days), presentToday/absentToday from Attendance model, openJobs count, totalCandidates count, pendingLeaves count, pendingExpenses count, department headcount via groupBy, attendance distribution via groupBy, expense by category via groupBy, performance averages via aggregate, candidate pipeline via groupBy, and recent 20 AuditLog entries with employee relation. All results composed into a single DashboardData response object.", middleware: "No special middleware. Protected by global NextAuth middleware requiring authentication." },
    { name: "Employee Management", frontend: "EmployeeManagement.tsx (1,577 lines). Manages employee CRUD with 4 useApi hooks: employees list (with search/dept/status params), departments list, assets for selected employee (conditional fetch with enabled flag), and documents for selected employee. Features: search input with server-side filtering, 3 select filters (department, status, contract type), org chart view (collapsible department tree), Excel export via exportEmployeeReport(), add/edit dialog reusing same form with editingEmployeeId state, detail Sheet (side panel) with personal/employment/financial info sections, salary masking toggle (Eye/EyeOff icons), and delete confirmation AlertDialog. Auto-generates employeeId: EMP{nextNumber} based on pagination total.", backend: "POST /api/employees auto-generates employeeId by counting existing records. Duplicate email check via findUnique. GET /api/employees supports search (OR: firstName/lastName/email/employeeId contains), department filter, status filter, and pagination. GET /api/employees/[id] returns full employee profile with all relations (attendance, leaves, payroll, performance, expenses, assets, skills, enrollments, documents). PUT /api/employees/[id] updates all fields. DELETE /api/employees/[id] cascades: taskComments > taskAssignments > tasks > meetingInvitations > meetings > officeLocations > companyMembers > companies > employee (wrapped in $transaction).", middleware: "No authentication/authorization middleware on API routes (publicly accessible). Route protection only via NextAuth middleware on page level." },
    { name: "Talent Acquisition (AI-Powered)", frontend: "TalentAcquisition.tsx (2,658 lines - largest component). Three-tab interface: Jobs (card grid with post/edit/delete), Candidates (Kanban pipeline with status columns), AI Interviews (session list with transcript viewer). Job form includes: title, department, location, employmentType, experienceLevel, description, requirements (array), skills (array), salaryMin/Max. Candidate form with auto AI Fit Score display. AI Interview button triggers question generation flow with loading state. Interview interface shows questions sequentially with response text areas.", backend: "POST /api/candidates auto-calculates aiFitScore by comparing candidate skills (JSON array) against job required skills (JSON array). Score = (matchingSkills / totalRequiredSkills) * 100, adjusted by experience level alignment. POST /api/ai-interview/generate-questions uses Z-AI SDK with system prompt requesting 8-10 questions across technical/behavioral/problem_solving/culture_fit categories. Falls back to hardcoded questions on AI failure. POST /api/ai-interview creates session with questions as JSON string. Candidate status pipeline: applied > screening > interview > offered > hired > rejected (enforced by PATCH /api/candidates).", middleware: "Z-AI SDK calls require backend-only execution. Interview questions stored as JSON strings with safeJsonParse() helper for safe deserialization." },
    { name: "Payroll & Expenses", frontend: "PayrollExpense.tsx (1,464 lines). Two-tab layout: Payroll tab with month/year selector, payroll table showing all computed components, and process button; Expenses tab with status-based filtering and approval actions. Payroll table columns: Employee, Basic, HRA, DA, Gross, PF, ESI, Prof Tax, Net. Each cell editable for manual adjustment. Expense form: category (select), amount, date, description, receipt. Status badges: pending (amber), approved (green), rejected (red), reimbursed (blue). Export buttons for both payroll and expense reports.", backend: "POST /api/payroll auto-calculates Indian payroll components: HRA = basic * 0.40, DA = basic * 0.10, PF = basic * 0.12, ESI = gross * 0.0075, professionalTax = 200. Gross = basic + HRA + DA. Net = Gross - PF - ESI - professionalTax. PATCH /api/payroll recalculates all dependent components when any input changes. Expense status workflow enforced: cannot update rejected or reimbursed expenses, cannot delete reimbursed expenses (audit compliance). PATCH transitions: pending > approved > reimbursed (or rejected at any pending/approved stage).", middleware: "Payroll calculations follow Indian statutory requirements. Professional tax is flat Rs.200 as per Indian tax slabs for the applicable salary range." },
    { name: "Time & Attendance", frontend: "TimeAttendance.tsx (1,566 lines). Four-tab interface: Attendance (mark attendance with geofence validation, today's summary cards, weekly heatmap), Leaves (balance cards by type, request form, pending approvals), Shifts (admin management with time pickers), Holidays (calendar view with type-based color coding). Mark Attendance button enabled/disabled based on geofence check. Leave request form: leaveType, startDate, endDate, reason. Approval interface for managers with approve/reject buttons.", backend: "POST /api/attendance with duplicate prevention (same employee + same date). Status determined by shift grace time: if checkInTime > shift.startTime + shift.graceTime then 'late', otherwise 'present'. GET /api/attendance supports date range filtering and employee filtering. POST /api/leaves with status 'pending'. PATCH /api/leaves for approval/rejection with prevention of re-processing already processed leaves. Shift CRUD with duplicate name prevention. Holiday CRUD with type enum validation (national/company/optional).", middleware: "Geofence validation: browser Geolocation API provides coordinates, compared against OfficeLocation radius (default 500m). If outside all office perimeters, mark attendance is disabled." },
    { name: "Company Management", frontend: "CompanyManagement.tsx (2,152 lines). Four-tab interface: Overview (company info, stats), Members (list with role badges, approval actions, add member), Office Locations (location cards with lat/lng/radius), Policies (policy documents with version tracking). Join company dialog with 6-character code input. Member approval workflow with pending/approved/rejected status badges.", backend: "POST /api/companies auto-generates 6-char join code. Creator auto-added as 'owner' member. POST /api/companies/join handles: new member (create pending), existing pending (return message), existing rejected (reactivate to pending). PATCH /api/companies/members for approve/reject/update role. DELETE /api/companies/[id] cascades through all child records in correct dependency order using $transaction. Office locations with geofence data (lat, lng, radius in meters).", middleware: "Company-scoped data isolation: tasks, meetings, projects all have companyId foreign key for multi-company support." },
    { name: "Project Management", frontend: "ProjectManagement.tsx (1,470 lines). Project board with card grid, status/priority filters, and create button. Each project card shows: name, priority badge, progress bar (0-100%), team avatars, milestone count, due date. Project detail view with four tabs: Overview, Team (add/remove members with role assignment), Milestones (timeline with add/complete), Tasks (project-scoped task list). Progress slider for manual update.", backend: "POST /api/projects with status/priority/progress. POST /api/projects/members with role (lead/manager/member) and duplicate prevention. DELETE /api/projects/[id] cascades: milestones > members > project. POST /api/projects/milestones with auto-set completedDate when status changes to 'completed'. PATCH /api/projects/[id] for progress and status updates. Status enum: planning/active/on-hold/completed/cancelled.", middleware: "Project-scoped through companyId. Team member roles: lead (1 per project, enforced at application level), manager (multiple), member (multiple)." },
  ];

  for (const mt of moduleTech) {
    children.push(h2(mt.name));
    children.push(h3("Frontend Implementation"));
    children.push(p(mt.frontend));
    children.push(h3("Backend Implementation"));
    children.push(p(mt.backend));
    children.push(h3("Middleware & Integration Notes"));
    children.push(p(mt.middleware));
  }

  // ═══════════════════════════════════════════════════════
  // PART X: DEPLOYMENT
  // ═══════════════════════════════════════════════════════
  children.push(h1("Part X: Deployment & Configuration"));
  children.push(h2("Vercel Deployment"));
  children.push(p("The AI-HRMS is deployed to Vercel's serverless platform via GitHub integration. The deployment configuration is specified in vercel.json and package.json scripts. The build command (next build) generates a standalone output suitable for serverless deployment. All API routes execute as serverless functions with automatic scaling, cold start optimization, and edge caching for static assets. The DATABASE_URL environment variable must be configured in Vercel's project settings to point to the Neon PostgreSQL instance. Other required environment variables include NEXTAUTH_SECRET for JWT signing, NEXTAUTH_URL for the production domain, and GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET for OAuth."));

  children.push(h2("Environment Configuration"));
  children.push(makeTable(
    ["Variable", "Required", "Description", "Example"],
    [
      ["DATABASE_URL", "Yes", "PostgreSQL connection string (Neon)", "postgresql://user:pass@host/db?sslmode=require"],
      ["NEXTAUTH_SECRET", "Yes", "JWT signing secret (min 32 chars)", "your-secret-key-here"],
      ["NEXTAUTH_URL", "Yes", "Production URL for callbacks", "https://ai-hrms-rho.vercel.app"],
      ["GOOGLE_CLIENT_ID", "Optional", "Google OAuth client ID", "xxx.apps.googleusercontent.com"],
      ["GOOGLE_CLIENT_SECRET", "Optional", "Google OAuth client secret", "GOCSPX-xxx"],
    ]
  ));

  children.push(h2("Database Management Commands"));
  children.push(...codeBlock([
    "npm run db:generate    # Generate Prisma client from schema",
    "npm run db:push        # Push schema changes to database (no migration)",
    "npm run db:migrate     # Create and apply migrations",
    "npm run db:reset       # Reset database and re-seed",
    "npm run db:seed        # Run seed script to populate demo data",
  ]));

  return children;
}

async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: c(P.body) }, paragraph: { spacing: { line: 312 } } },
        heading1: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) } },
        heading2: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) } },
        heading3: { run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 26, bold: true, color: c(P.primary) } },
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
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "AI-HRMS Technical Documentation", size: 18, color: "808080", font: { ascii: "Times New Roman" } })] })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })] })] }),
        },
        children: [
          new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
          new Paragraph({ children: [new PageBreak()] }),
          ...buildBody(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/download/AI-HRMS_Technical_Documentation.docx", buffer);
  console.log("Technical Document generated successfully!");
}

main().catch(console.error);
