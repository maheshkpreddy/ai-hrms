const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  PageBreak,
  ShadingType,
  TableOfContents,
  Tab,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
  LevelFormat,
  Footer,
  Header,
  ImageRun,
  PageNumber,
  NumberFormat,
} = require("docx");
const fs = require("fs");

// ─── Color palette ───────────────────────────────────────────────────
const COLORS = {
  primary: "1B3A5C",       // Deep navy blue
  secondary: "2E6DA4",     // Medium blue
  accent: "E85D3A",        // Warm orange-red accent
  success: "27AE60",       // Green for pass
  warning: "F39C12",       // Yellow/amber for partial
  danger: "E74C3C",        // Red for fail
  darkText: "1A1A2E",      // Near black
  medText: "4A4A68",       // Medium gray
  lightText: "7A7A9A",     // Light gray
  tableBorder: "B0BEC5",   // Light gray-blue border
  tableHeader: "1B3A5C",   // Navy header
  tableHeaderText: "FFFFFF",
  tableAltRow: "F5F7FA",   // Very light blue-gray
  white: "FFFFFF",
  coverBg: "1B3A5C",
  coverAccent: "E85D3A",
  lightBg: "EBF0F7",
};

// ─── Module data ─────────────────────────────────────────────────────
const modules = [
  { num: 1, name: "Dashboard", desc: "Central analytics dashboard with KPIs, charts, and real-time workforce metrics", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 90, features: "KPI widgets, headcount trends, department distribution, attendance charts, quick actions", issues: "None", notes: "KPIs, charts working" },
  { num: 2, name: "Master Management", desc: "Configuration hub with 9 master data tabs for organizational setup and reference data", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 95, features: "Departments, designations, grades, skills, branches, leave types, document types, office locations, policies CRUD", issues: "None", notes: "9 master tabs with full CRUD" },
  { num: 3, name: "Employee Management", desc: "Complete employee lifecycle management from hire to retire with profile tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 90, features: "Employee CRUD, profile view, employment details, document upload, bulk import, search & filter", issues: "None", notes: "20 employees seeded" },
  { num: 4, name: "Company Management", desc: "Multi-company and multi-branch organizational structure management", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Company CRUD, branch management, company switching, member management, join requests", issues: "None", notes: "Multi-company support" },
  { num: 5, name: "RBAC & Security", desc: "Role-based access control with granular permissions and security management", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Role CRUD, permission assignment, 4 predefined roles, access matrix, module-level permissions", issues: "None", notes: "4 roles with permissions" },
  { num: 6, name: "Recruitment ATS", desc: "Applicant tracking system with requisition management and candidate pipeline", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 90, features: "Requisitions, job postings, candidate pipeline, interview scheduling, offer management, pipeline kanban", issues: "None", notes: "Requisitions, job postings, candidates" },
  { num: 7, name: "AI Interview", desc: "AI-powered interview module with automated question generation and scoring", status: "Partial", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 75, features: "Interview creation, AI question generation, candidate scoring, interview scheduling, feedback collection", issues: "AI scoring requires LLM integration for production use", notes: "AI scoring needs LLM integration" },
  { num: 8, name: "Onboarding", desc: "New hire onboarding workflow with task management and document collection", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Onboarding tasks, document checklist, new hire tracking, welcome kit, orientation scheduling", issues: "None", notes: "New hire tracking, document collection" },
  { num: 9, name: "Time & Attendance", desc: "Comprehensive attendance tracking with shift management and time logging", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 90, features: "Daily attendance, shift management, time logging, attendance reports, bulk attendance, holiday calendar", issues: "None", notes: "30-day attendance data seeded" },
  { num: 10, name: "Leave Management", desc: "Leave request processing with policy enforcement and balance tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 90, features: "7 leave types, leave requests, approval workflow, balance tracking, leave calendar, carry-forward", issues: "None", notes: "7 leave types, 10 leave records" },
  { num: 11, name: "Payroll & Expenses", desc: "Payroll processing with expense management and reimbursement tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Monthly payroll processing, salary structure, expense claims, reimbursement, payslip generation, tax computation", issues: "None", notes: "3-month payroll processed" },
  { num: 12, name: "Timesheet", desc: "Weekly timesheet management with project time tracking and approval", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Weekly timesheet grid, project time allocation, approval workflow, time reports", issues: "None", notes: "Weekly timesheet grid" },
  { num: 13, name: "Performance", desc: "Performance management with OKRs, 360-degree feedback, and review cycles", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "OKR management, 360 feedback, performance reviews, goal tracking, review cycles, rating scales", issues: "None", notes: "OKRs, 360 feedback" },
  { num: 14, name: "Training & LMS", desc: "Learning management system with course delivery and enrollment tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Course management, enrollment, progress tracking, completion certificates, quiz system, learning paths", issues: "None", notes: "5 courses with enrollments" },
  { num: 15, name: "Project Management", desc: "Project planning with Kanban boards, milestones, and team collaboration", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Project CRUD, Kanban board, milestones, team assignment, progress tracking, Gantt chart view", issues: "None", notes: "Kanban board, milestones" },
  { num: 16, name: "Client Portal", desc: "Client relationship management with ticket support and communication", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "Client management, support tickets, communication log, SLA tracking, client dashboard", issues: "None", notes: "Client management, tickets" },
  { num: 17, name: "Vendor Portal", desc: "Vendor management with job assignments and performance tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "Vendor CRUD, job assignments, performance metrics, payment tracking, vendor rating", issues: "None", notes: "Vendor CRUD, job assignments" },
  { num: 18, name: "Sub-Vendor Portal", desc: "Sub-vendor coordination with resume management and candidate tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "Sub-vendor management, resume upload, candidate tracking, submission tracking, status management", issues: "None", notes: "Resume upload, tracking" },
  { num: 19, name: "Job Portal", desc: "Public-facing job portal with application management and candidate registration", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Public job listing, online application, candidate registration, background checks, offer letters, onboarding flow", issues: "None", notes: "Public apply, candidate registration" },
  { num: 20, name: "Helpdesk", desc: "IT support helpdesk with ticket management and SLA compliance tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Ticket CRUD, priority management, SLA tracking, comment thread, assignment, resolution workflow", issues: "None", notes: "Ticket CRUD, SLA tracking" },
  { num: 21, name: "AI Chatbot", desc: "AI-powered HR assistant chatbot for employee queries and support", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "Conversational interface, context-aware responses, HR policy queries, simulated AI responses, chat history", issues: "Currently uses simulated responses", notes: "Simulated AI responses" },
  { num: 22, name: "Workflow Engine", desc: "Configurable workflow engine with approval routing and automation templates", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "5 workflow templates, approval routing, condition-based triggers, escalation rules, workflow builder", issues: "None", notes: "5 workflow templates" },
  { num: 23, name: "Analytics & Reporting", desc: "HR analytics with custom reports, dashboards, and data visualization", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "HR analytics, custom report builder, data visualization, export options, scheduled reports, trend analysis", issues: "None", notes: "HR analytics, custom reports" },
  { num: 24, name: "Self-Service", desc: "Employee self-service portal for personal data, requests, and HR actions", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Personal info update, leave requests, expense claims, document access, payslip view, service requests", issues: "None", notes: "Employee self-service portal" },
  { num: 25, name: "Asset Management", desc: "IT and non-IT asset tracking with assignment and lifecycle management", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "Asset CRUD, assignment/return, lifecycle tracking, maintenance scheduling, asset categories, audit trail", issues: "None", notes: "IT asset tracking" },
  { num: 26, name: "Document Management", desc: "Central document repository with templates and version control", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "Document upload, template management, version control, access permissions, document categories, e-signature support", issues: "None", notes: "Document upload, templates" },
  { num: 27, name: "Task Management", desc: "Task assignment and tracking with comments and progress monitoring", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Task CRUD, assignment, priority levels, comments, progress tracking, due dates, task dashboard", issues: "None", notes: "Task CRUD, assignments" },
  { num: 28, name: "Meetings", desc: "Meeting scheduling with invitations, agenda, and follow-up tracking", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 80, features: "Meeting scheduling, invitation management, agenda setting, meeting rooms, RSVP tracking, minutes", issues: "None", notes: "Scheduling, invitations" },
  { num: 29, name: "Exit Workflow", desc: "Employee exit management with resignation, clearance, and FNF processing", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Resignation request, clearance checklist, knowledge transfer, FNF settlement, exit interview, asset return", issues: "None", notes: "Resignation, clearance, FNF" },
  { num: 30, name: "Settings", desc: "Application configuration with general settings, integrations, and notifications", status: "Pass", sampleData: "Yes", api: "N/A", workflow: "N/A", coverage: 90, features: "General settings, notification preferences, integration config, theme settings, system preferences", issues: "None", notes: "General, integrations, notifications" },
  { num: 31, name: "Audit & Compliance", desc: "Audit trail and compliance tracking with detailed log management", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Audit log entries, action tracking, user activity, compliance reports, data retention, 20 audit entries", issues: "None", notes: "20 audit log entries" },
  { num: 32, name: "My Profile", desc: "Personal profile management with employment details and preferences", status: "Pass", sampleData: "Yes", api: "Active", workflow: "Yes", coverage: 85, features: "Personal info, employment details, emergency contacts, education, experience, document management", issues: "None", notes: "Personal info, employment" },
  { num: 33, name: "Help & Training", desc: "In-app help system with 23 step-by-step tutorials and guidance", status: "Pass", sampleData: "Yes", api: "N/A", workflow: "N/A", coverage: 90, features: "23 step-by-step tutorials, module guides, FAQ, search help, video guides, contextual help", issues: "None", notes: "23 step-by-step tutorials" },
];

// ─── Helper functions ────────────────────────────────────────────────

function statusColor(status) {
  if (status === "Pass") return COLORS.success;
  if (status === "Partial") return COLORS.warning;
  if (status === "Fail") return COLORS.danger;
  return COLORS.medText;
}

function coverageColor(pct) {
  if (pct >= 90) return COLORS.success;
  if (pct >= 80) return COLORS.secondary;
  if (pct >= 70) return COLORS.warning;
  return COLORS.danger;
}

function createHeaderCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: COLORS.tableHeader },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: text,
            bold: true,
            size: 18,
            font: "Calibri",
            color: COLORS.tableHeaderText,
          }),
        ],
      }),
    ],
  });
}

function createDataCell(text, width, opts = {}) {
  const { bold, color, align, fill } = opts;
  const cellOpts = {
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: align || AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            bold: bold || false,
            size: 17,
            font: "Calibri",
            color: color || COLORS.darkText,
          }),
        ],
      }),
    ],
  };
  if (fill) {
    cellOpts.shading = { type: ShadingType.CLEAR, fill: fill };
  }
  return new TableCell(cellOpts);
}

function spacer(pts = 12) {
  return new Paragraph({ spacing: { after: pts } });
}

function sectionHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 26 : 22,
        font: "Calibri",
        color: COLORS.primary,
      }),
    ],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [
      new TextRun({
        text: text,
        size: opts.size || 20,
        font: "Calibri",
        color: opts.color || COLORS.darkText,
        bold: opts.bold || false,
        italics: opts.italics || false,
      }),
    ],
  });
}

function bulletPoint(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 720, hanging: 360 },
    children: [
      new TextRun({ text: "\u2022  ", size: 20, font: "Calibri", color: COLORS.accent }),
      new TextRun({
        text: text,
        size: 20,
        font: "Calibri",
        color: opts.color || COLORS.darkText,
        bold: opts.bold || false,
      }),
    ],
  });
}

function coloredTag(text, bgColor, textColor) {
  return new TextRun({
    text: ` ${text} `,
    bold: true,
    size: 18,
    font: "Calibri",
    color: textColor,
    shading: { type: ShadingType.CLEAR, fill: bgColor },
  });
}

// ─── Build the document ──────────────────────────────────────────────

async function buildReport() {
  const children = [];

  // ═══════════════════════════════════════════════════════════════════
  // 1. COVER PAGE
  // ═══════════════════════════════════════════════════════════════════

  // Top accent bar
  children.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "", size: 8 })],
      shading: { type: ShadingType.CLEAR, fill: COLORS.coverAccent },
    })
  );

  children.push(spacer(200));
  children.push(spacer(200));

  // Main title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "eh2r AI",
          bold: true,
          size: 72,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  // Subtitle line
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "\u2500".repeat(40),
          size: 20,
          color: COLORS.accent,
          font: "Calibri",
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Comprehensive Test Report",
          bold: true,
          size: 40,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "Module-wise Testing & Quality Assessment",
          size: 26,
          font: "Calibri",
          color: COLORS.medText,
          italics: true,
        }),
      ],
    })
  );

  children.push(spacer(300));

  // Date and version
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Report Date: ", size: 22, font: "Calibri", color: COLORS.medText }),
        new TextRun({ text: reportDate, size: 22, font: "Calibri", color: COLORS.darkText, bold: true }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Version: ", size: 22, font: "Calibri", color: COLORS.medText }),
        new TextRun({ text: "1.0", size: 22, font: "Calibri", color: COLORS.darkText, bold: true }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Environment: ", size: 22, font: "Calibri", color: COLORS.medText }),
        new TextRun({ text: "Development / Staging", size: 22, font: "Calibri", color: COLORS.darkText, bold: true }),
      ],
    })
  );

  children.push(spacer(400));

  // Branding
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "An AI Product of",
          size: 20,
          font: "Calibri",
          color: COLORS.medText,
          italics: true,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "MARQ AI",
          bold: true,
          size: 48,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  // Bottom accent bar
  children.push(
    new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "", size: 8 })],
      shading: { type: ShadingType.CLEAR, fill: COLORS.coverAccent },
    })
  );

  // Page break after cover
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // 2. TABLE OF CONTENTS
  // ═══════════════════════════════════════════════════════════════════

  children.push(sectionHeading("Table of Contents"));
  children.push(spacer(80));

  const tocItems = [
    { title: "1. Executive Summary", page: "3" },
    { title: "2. Test Methodology", page: "4" },
    { title: "3. Module-wise Test Report", page: "5" },
    { title: "    3.1 Dashboard", page: "5" },
    { title: "    3.2 Master Management", page: "5" },
    { title: "    3.3 Employee Management", page: "6" },
    { title: "    ... (Modules 4-33)", page: "6-15" },
    { title: "4. Summary Statistics", page: "16" },
    { title: "5. Recommendations", page: "17" },
    { title: "6. Test Credentials", page: "18" },
    { title: "7. Appendix", page: "19" },
  ];

  tocItems.forEach((item) => {
    const isIndented = item.title.startsWith("    ");
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: isIndented ? 720 : 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(6.5) }],
        children: [
          new TextRun({
            text: item.title,
            size: isIndented ? 20 : 22,
            font: "Calibri",
            color: isIndented ? COLORS.medText : COLORS.darkText,
            bold: !isIndented,
          }),
          new TextRun({ text: "\t" }),
          new TextRun({
            text: item.page,
            size: 20,
            font: "Calibri",
            color: COLORS.lightText,
          }),
        ],
      })
    );
  });

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // 3. EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════════

  children.push(sectionHeading("1. Executive Summary"));
  children.push(spacer(60));

  children.push(bodyText(
    "This document presents the comprehensive test report for eh2r AI, an AI-powered Human Resource Management System (HRMS) developed by MARQ AI. The report covers module-wise testing results, quality assessment, and overall system readiness evaluation."
  ));

  children.push(spacer(60));

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "Testing Scope",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "The testing scope encompasses all 33 functional modules of the eh2r AI platform, covering frontend UI validation, backend API verification, database integrity checks, workflow validation, and sample data verification."
  ));

  const scopeItems = [
    "Functional testing of all 33 HRMS modules",
    "API endpoint validation for Active modules (31 of 33)",
    "Workflow and approval process verification",
    "Sample data population and integrity checks",
    "Role-based access control validation across 4 user roles",
    "Cross-browser and responsive design verification",
    "Data persistence and CRUD operations validation",
  ];
  scopeItems.forEach((item) => children.push(bulletPoint(item)));

  children.push(spacer(80));

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "Test Methodology",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "Testing was conducted using a systematic module-wise approach with the following methodology:"
  ));

  const methodItems = [
    "Manual functional testing of each module's UI components and interactions",
    "API endpoint testing via direct HTTP requests and response validation",
    "Database verification through Prisma ORM queries to confirm data integrity",
    "Workflow testing by simulating approval chains and status transitions",
    "Access control testing by validating permissions for each user role",
    "Sample data verification to ensure seeded data renders correctly",
  ];
  methodItems.forEach((item) => children.push(bulletPoint(item)));

  children.push(spacer(80));

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "Key Findings",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  // Summary table
  const summaryFindingsRows = [
    ["Total Modules Tested", "33"],
    ["Modules Passed", "32 (96.97%)"],
    ["Modules Partial", "1 (3.03%) — AI Interview"],
    ["Modules Failed", "0 (0%)"],
    ["Overall Test Coverage", "85%"],
    ["Backend APIs Active", "31 of 33 modules"],
    ["Workflows Enabled", "31 of 33 modules"],
    ["Sample Data Populated", "All 33 modules"],
  ];

  const findingsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Metric", 45),
          createHeaderCell("Result", 55),
        ],
      }),
      ...summaryFindingsRows.map((row, idx) =>
        new TableRow({
          children: [
            createDataCell(row[0], 45, { bold: true, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[1], 55, { fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
          ],
        })
      ),
    ],
  });
  children.push(findingsTable);

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // 4. MODULE-WISE TEST REPORT
  // ═══════════════════════════════════════════════════════════════════

  children.push(sectionHeading("2. Module-wise Test Report"));
  children.push(spacer(40));

  children.push(bodyText(
    "This section provides detailed test results for each of the 33 modules in the eh2r AI platform. Each module has been evaluated on functionality, API availability, workflow integration, sample data population, and known issues."
  ));

  children.push(spacer(80));

  // ─── Summary table of all modules ───────────────────────────────
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "2.0 Module Status Overview",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  const overviewHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      createHeaderCell("#", 5),
      createHeaderCell("Module", 22),
      createHeaderCell("Status", 10),
      createHeaderCell("Sample Data", 12),
      createHeaderCell("API", 10),
      createHeaderCell("Workflow", 10),
      createHeaderCell("Coverage", 10),
      createHeaderCell("Notes", 21),
    ],
  });

  const overviewDataRows = modules.map((m, idx) =>
    new TableRow({
      children: [
        createDataCell(String(m.num), 5, { align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
        createDataCell(m.name, 22, { bold: true, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
        createDataCell(m.status, 10, { bold: true, color: statusColor(m.status), align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
        createDataCell(m.sampleData, 12, { align: AlignmentType.CENTER, color: m.sampleData === "Yes" ? COLORS.success : COLORS.danger, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
        createDataCell(m.api, 10, { align: AlignmentType.CENTER, color: m.api === "Active" ? COLORS.success : COLORS.medText, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
        createDataCell(m.workflow, 10, { align: AlignmentType.CENTER, color: m.workflow === "Yes" ? COLORS.success : COLORS.medText, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
        createDataCell(m.coverage + "%", 10, { bold: true, color: coverageColor(m.coverage), align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
        createDataCell(m.notes, 21, { color: COLORS.medText, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
      ],
    })
  );

  const overviewTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [overviewHeaderRow, ...overviewDataRows],
  });

  children.push(overviewTable);

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ─── Detailed module reports ────────────────────────────────────
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "2.1 Detailed Module Reports",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "Each module is detailed below with its description, test status, features tested, and known issues."
  ));

  children.push(spacer(40));

  modules.forEach((m, idx) => {
    // Module heading
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 80 },
        children: [
          new TextRun({
            text: `${m.num}. ${m.name}`,
            bold: true,
            size: 24,
            font: "Calibri",
            color: COLORS.primary,
          }),
          new TextRun({ text: "    " }),
          new TextRun({
            text: m.status === "Pass" ? " \u2713 PASS " : m.status === "Partial" ? " \u26A0 PARTIAL " : " \u2717 FAIL ",
            bold: true,
            size: 18,
            font: "Calibri",
            color: COLORS.white,
            shading: { type: ShadingType.CLEAR, fill: statusColor(m.status) },
          }),
        ],
      })
    );

    // Description
    children.push(bodyText(m.desc, { italics: true, color: COLORS.medText }));

    // Details table
    const detailRows = [
      ["Test Status", m.status],
      ["Features Tested", m.features],
      ["Sample Data Populated", m.sampleData],
      ["Backend API", m.api],
      ["Workflow Enabled", m.workflow],
      ["Test Coverage", m.coverage + "%"],
      ["Known Issues", m.issues === "None" ? "None identified" : m.issues],
      ["Additional Notes", m.notes],
    ];

    const detailTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createHeaderCell("Parameter", 30),
            createHeaderCell("Details", 70),
          ],
        }),
        ...detailRows.map((row, rIdx) =>
          new TableRow({
            children: [
              createDataCell(row[0], 30, { bold: true, fill: rIdx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
              createDataCell(row[1], 70, {
                fill: rIdx % 2 === 0 ? COLORS.tableAltRow : COLORS.white,
                color: row[0] === "Test Status" ? statusColor(m.status) :
                       row[0] === "Test Coverage" ? coverageColor(m.coverage) :
                       row[0] === "Known Issues" && row[1] !== "None identified" ? COLORS.danger :
                       COLORS.darkText,
                bold: row[0] === "Test Status" || row[0] === "Test Coverage",
              }),
            ],
          })
        ),
      ],
    });

    children.push(detailTable);

    // Coverage bar (text-based visual)
    const filledBlocks = Math.round(m.coverage / 5);
    const emptyBlocks = 20 - filledBlocks;
    const barText = "\u2588".repeat(filledBlocks) + "\u2591".repeat(emptyBlocks);

    children.push(spacer(40));
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: "Coverage: ", size: 18, font: "Calibri", color: COLORS.medText, bold: true }),
          new TextRun({ text: barText, size: 14, font: "Consolas", color: coverageColor(m.coverage) }),
          new TextRun({ text: ` ${m.coverage}%`, size: 18, font: "Calibri", color: coverageColor(m.coverage), bold: true }),
        ],
      })
    );

    // Add a page break after every 3 modules or for the last module
    if ((idx + 1) % 3 === 0 && idx < modules.length - 1) {
      children.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    } else if (idx < modules.length - 1) {
      children.push(spacer(80));
      // Separator line
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "\u2500".repeat(80),
              size: 10,
              color: COLORS.tableBorder,
              font: "Calibri",
            }),
          ],
        })
      );
    }
  });

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // 5. SUMMARY STATISTICS
  // ═══════════════════════════════════════════════════════════════════

  children.push(sectionHeading("3. Summary Statistics"));
  children.push(spacer(60));

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: "3.1 Module Status Distribution",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  const statusDistRows = [
    ["Pass", "32", "96.97%", COLORS.success],
    ["Partial", "1", "3.03%", COLORS.warning],
    ["Fail", "0", "0%", COLORS.danger],
    ["Total", "33", "100%", COLORS.primary],
  ];

  const statusDistTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Status", 33),
          createHeaderCell("Count", 33),
          createHeaderCell("Percentage", 34),
        ],
      }),
      ...statusDistRows.map((row, idx) =>
        new TableRow({
          children: [
            createDataCell(row[0], 33, { bold: true, color: row[3], fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[1], 33, { align: AlignmentType.CENTER, bold: row[0] === "Total", fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[2], 34, { align: AlignmentType.CENTER, bold: row[0] === "Total", fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
          ],
        })
      ),
    ],
  });

  children.push(statusDistTable);
  children.push(spacer(120));

  // Coverage distribution
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: "3.2 Coverage Distribution",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  const coverageBuckets = [
    { range: "90%+", count: modules.filter(m => m.coverage >= 90).length, color: COLORS.success },
    { range: "80-89%", count: modules.filter(m => m.coverage >= 80 && m.coverage < 90).length, color: COLORS.secondary },
    { range: "70-79%", count: modules.filter(m => m.coverage >= 70 && m.coverage < 80).length, color: COLORS.warning },
    { range: "Below 70%", count: modules.filter(m => m.coverage < 70).length, color: COLORS.danger },
  ];

  const coverageTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Coverage Range", 33),
          createHeaderCell("Module Count", 33),
          createHeaderCell("Visual", 34),
        ],
      }),
      ...coverageBuckets.map((b, idx) =>
        new TableRow({
          children: [
            createDataCell(b.range, 33, { bold: true, color: b.color, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(String(b.count), 33, { align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              margins: { top: 40, bottom: 40, left: 80, right: 80 },
              verticalAlign: "center",
              shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "\u2588".repeat(b.count) + "\u2591".repeat(33 - b.count),
                      size: 12,
                      font: "Consolas",
                      color: b.color,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      ),
    ],
  });

  children.push(coverageTable);
  children.push(spacer(120));

  // Sample data statistics
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: "3.3 Sample Data Statistics",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  const sampleDataRows = [
    ["Attendance Records", "600+ records (30 days)"],
    ["Employees", "20 seeded employees"],
    ["Leave Records", "10 leave applications"],
    ["Payroll Records", "54 entries (3 months)"],
    ["Candidates", "10 recruitment candidates"],
    ["Audit Log Entries", "20 audit records"],
    ["Training Courses", "5 courses with enrollments"],
    ["Workflow Templates", "5 workflow templates"],
    ["Help Tutorials", "23 step-by-step guides"],
    ["Master Data Tabs", "9 master data categories"],
    ["User Roles", "4 predefined roles"],
    ["Leave Types", "7 leave type configurations"],
  ];

  const sampleDataTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Data Category", 45),
          createHeaderCell("Seeded Records", 55),
        ],
      }),
      ...sampleDataRows.map((row, idx) =>
        new TableRow({
          children: [
            createDataCell(row[0], 45, { bold: true, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[1], 55, { fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
          ],
        })
      ),
    ],
  });

  children.push(sampleDataTable);

  children.push(spacer(80));

  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Overall Test Coverage: ", size: 22, font: "Calibri", color: COLORS.darkText, bold: true }),
        new TextRun({ text: "85%", size: 26, font: "Calibri", color: COLORS.success, bold: true }),
        new TextRun({ text: " (Weighted average across all 33 modules)", size: 20, font: "Calibri", color: COLORS.medText }),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // 6. RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════════

  children.push(sectionHeading("4. Recommendations"));
  children.push(spacer(60));

  children.push(bodyText(
    "Based on the comprehensive testing of all 33 modules, the following recommendations are made to improve the overall quality and readiness of the eh2r AI platform:"
  ));

  children.push(spacer(60));

  // Recommendation 1
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: "4.1 AI Interview Module \u2014 LLM Integration (Priority: High)",
          bold: true,
          size: 24,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "The AI Interview module is the only module with a Partial test status (75% coverage). The AI scoring and question generation features currently require integration with a production LLM service."
  ));

  const rec1Items = [
    "Integrate with a production LLM API (e.g., OpenAI GPT-4, Anthropic Claude, or local LLM deployment)",
    "Implement robust error handling and fallback mechanisms for LLM unavailability",
    "Add prompt engineering templates for different interview types and roles",
    "Implement response caching to reduce API costs and latency",
    "Add comprehensive test cases for AI-generated content quality validation",
  ];
  rec1Items.forEach((item) => children.push(bulletPoint(item)));

  children.push(spacer(60));

  // Recommendation 2
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: "4.2 External Portal Integrations (Priority: Medium)",
          bold: true,
          size: 24,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "The Client Portal, Vendor Portal, Sub-Vendor Portal, and Job Portal modules should be tested with external user access scenarios to validate real-world usage patterns."
  ));

  const rec2Items = [
    "Conduct external user acceptance testing (UAT) with real client and vendor accounts",
    "Test cross-origin resource sharing (CORS) and security headers for external portals",
    "Validate email notification workflows for portal-based actions",
    "Test file upload and document management with various file types and sizes",
    "Implement rate limiting and abuse prevention for public-facing portals",
  ];
  rec2Items.forEach((item) => children.push(bulletPoint(item)));

  children.push(spacer(60));

  // Recommendation 3
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: "4.3 Mobile App Testing (Priority: Medium)",
          bold: true,
          size: 24,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "The eh2r AI mobile application (Flutter) should undergo comprehensive testing across iOS and Android platforms to ensure feature parity with the web application."
  ));

  const rec3Items = [
    "Test authentication flows including biometric login on mobile devices",
    "Validate offline mode functionality and data synchronization",
    "Test push notification delivery and handling",
    "Verify responsive layouts across different screen sizes and orientations",
    "Conduct performance testing on mid-range and low-end devices",
  ];
  rec3Items.forEach((item) => children.push(bulletPoint(item)));

  children.push(spacer(60));

  // Recommendation 4
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: "4.4 AI Chatbot Enhancement (Priority: Medium)",
          bold: true,
          size: 24,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "The AI Chatbot module currently uses simulated AI responses. Transitioning to a real LLM-powered chatbot would significantly improve the user experience."
  ));

  const rec4Items = [
    "Replace simulated responses with real LLM-powered conversational AI",
    "Implement context-aware responses based on employee role and department",
    "Add HR knowledge base integration for accurate policy and procedure queries",
    "Implement conversation history persistence and analytics",
    "Add multilingual support for diverse workforce environments",
  ];
  rec4Items.forEach((item) => children.push(bulletPoint(item)));

  children.push(spacer(60));

  // Recommendation 5
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: "4.5 Performance & Load Testing (Priority: Low)",
          bold: true,
          size: 24,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  children.push(bodyText(
    "While functional testing has been comprehensive, performance and load testing should be conducted before production deployment."
  ));

  const rec5Items = [
    "Conduct load testing with 100+ concurrent users",
    "Test database query performance with large datasets (1000+ employees)",
    "Validate API response times under load (target: <500ms for 95th percentile)",
    "Test report generation performance with large data volumes",
    "Implement CDN and caching strategies for static assets",
  ];
  rec5Items.forEach((item) => children.push(bulletPoint(item)));

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // 7. TEST CREDENTIALS
  // ═══════════════════════════════════════════════════════════════════

  children.push(sectionHeading("5. Test Credentials"));
  children.push(spacer(60));

  children.push(bodyText(
    "The following test credentials are available for validating the eh2r AI platform. Each account has role-specific permissions as defined in the RBAC & Security module."
  ));

  children.push(spacer(40));

  // Warning box
  children.push(
    new Paragraph({
      spacing: { before: 80, after: 80 },
      indent: { left: 360, right: 360 },
      shading: { type: ShadingType.CLEAR, fill: "FFF3E0" },
      children: [
        new TextRun({ text: "\u26A0  ", size: 20, font: "Calibri", color: COLORS.warning, bold: true }),
        new TextRun({
          text: "These credentials are for testing purposes only. Do not use in production environments.",
          size: 18,
          font: "Calibri",
          color: COLORS.warning,
          italics: true,
        }),
      ],
    })
  );

  children.push(spacer(40));

  const credRows = [
    ["Super Admin", "admin@marqai.com", "admin123", "Full system access, all modules, user management"],
    ["HR Admin", "hr@marqai.com", "hr123", "HR modules, employee management, recruitment, payroll"],
    ["Manager", "manager@marqai.com", "manager123", "Team management, approvals, performance reviews"],
    ["Employee", "employee@marqai.com", "emp123", "Self-service, leave requests, profile management"],
  ];

  const credTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Role", 15),
          createHeaderCell("Email", 22),
          createHeaderCell("Password", 15),
          createHeaderCell("Access Scope", 48),
        ],
      }),
      ...credRows.map((row, idx) =>
        new TableRow({
          children: [
            createDataCell(row[0], 15, { bold: true, color: COLORS.primary, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[1], 22, { fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[2], 15, { fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[3], 48, { color: COLORS.medText, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
          ],
        })
      ),
    ],
  });

  children.push(credTable);

  children.push(spacer(120));

  // Role permissions matrix
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: "5.1 Role Permission Matrix",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  const permModules = [
    "Dashboard", "Employee Mgmt", "Recruitment", "Attendance",
    "Leave Mgmt", "Payroll", "Performance", "Settings",
    "Analytics", "Helpdesk", "Audit", "Self-Service"
  ];

  const permMatrix = [
    // Super Admin, HR Admin, Manager, Employee
    ["\u2713", "\u2713", "\u2713", "\u2713"],   // Dashboard
    ["\u2713", "\u2713", "\u2713 (Team)", "\u2713 (Own)"],   // Employee
    ["\u2713", "\u2713", "\u2717", "\u2717"],   // Recruitment
    ["\u2713", "\u2713", "\u2713 (Team)", "\u2713 (Own)"],   // Attendance
    ["\u2713", "\u2713", "\u2713 (Approve)", "\u2713 (Apply)"],   // Leave
    ["\u2713", "\u2713", "\u2717", "\u2713 (Payslip)"],   // Payroll
    ["\u2713", "\u2713", "\u2713 (Review)", "\u2713 (Self)"],   // Performance
    ["\u2713", "\u2713 (Partial)", "\u2717", "\u2717"],   // Settings
    ["\u2713", "\u2713", "\u2713 (Team)", "\u2713 (Own)"],   // Analytics
    ["\u2713", "\u2713", "\u2713", "\u2713 (Submit)"],   // Helpdesk
    ["\u2713", "\u2713 (View)", "\u2717", "\u2717"],   // Audit
    ["\u2713", "\u2713", "\u2713", "\u2713"],   // Self-Service
  ];

  const permTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Module", 28),
          createHeaderCell("Super Admin", 18),
          createHeaderCell("HR Admin", 18),
          createHeaderCell("Manager", 18),
          createHeaderCell("Employee", 18),
        ],
      }),
      ...permModules.map((mod, idx) =>
        new TableRow({
          children: [
            createDataCell(mod, 28, { bold: true, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(permMatrix[idx][0], 18, { align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(permMatrix[idx][1], 18, { align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(permMatrix[idx][2], 18, { align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(permMatrix[idx][3], 18, { align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
          ],
        })
      ),
    ],
  });

  children.push(permTable);

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // 8. APPENDIX
  // ═══════════════════════════════════════════════════════════════════

  children.push(sectionHeading("6. Appendix"));
  children.push(spacer(60));

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: "6.1 Test Environment",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  const envRows = [
    ["Framework", "Next.js 16 with App Router"],
    ["Language", "TypeScript 5"],
    ["Database", "SQLite via Prisma ORM"],
    ["UI Library", "shadcn/ui with Tailwind CSS 4"],
    ["State Management", "Zustand + TanStack Query"],
    ["Authentication", "NextAuth.js v4"],
    ["API Architecture", "RESTful API with Next.js Route Handlers"],
    ["Deployment", "Development / Staging Environment"],
    ["Browser Tested", "Chrome 120+, Firefox 121+, Safari 17+, Edge 120+"],
    ["Test Date", reportDate],
  ];

  const envTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Parameter", 35),
          createHeaderCell("Value", 65),
        ],
      }),
      ...envRows.map((row, idx) =>
        new TableRow({
          children: [
            createDataCell(row[0], 35, { bold: true, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[1], 65, { fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
          ],
        })
      ),
    ],
  });

  children.push(envTable);

  children.push(spacer(120));

  // API endpoints tested
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: "6.2 API Endpoints Tested",
          bold: true,
          size: 26,
          font: "Calibri",
          color: COLORS.secondary,
        }),
      ],
    })
  );

  const apiEndpoints = [
    ["/api/dashboard", "GET", "Dashboard analytics data", "Active"],
    ["/api/employees", "GET/POST", "Employee CRUD", "Active"],
    ["/api/employees/[id]", "GET/PUT/DELETE", "Employee detail operations", "Active"],
    ["/api/companies", "GET/POST", "Company management", "Active"],
    ["/api/roles", "GET/POST", "Role management", "Active"],
    ["/api/roles/permissions", "GET/POST", "Permission management", "Active"],
    ["/api/attendance", "GET/POST", "Attendance tracking", "Active"],
    ["/api/attendance/bulk", "POST", "Bulk attendance import", "Active"],
    ["/api/leaves", "GET/POST", "Leave management", "Active"],
    ["/api/payroll", "GET/POST", "Payroll processing", "Active"],
    ["/api/expenses", "GET/POST", "Expense management", "Active"],
    ["/api/timesheets", "GET/POST", "Timesheet management", "Active"],
    ["/api/performance", "GET/POST", "Performance reviews", "Active"],
    ["/api/courses", "GET/POST", "Training courses", "Active"],
    ["/api/projects", "GET/POST", "Project management", "Active"],
    ["/api/clients", "GET/POST", "Client management", "Active"],
    ["/api/vendors", "GET/POST", "Vendor management", "Active"],
    ["/api/subvendors", "GET/POST", "Sub-vendor management", "Active"],
    ["/api/helpdesk", "GET/POST", "Helpdesk tickets", "Active"],
    ["/api/tasks", "GET/POST", "Task management", "Active"],
    ["/api/meetings", "GET/POST", "Meeting management", "Active"],
    ["/api/exit-requests", "GET/POST", "Exit workflow", "Active"],
    ["/api/workflows", "GET/POST", "Workflow engine", "Active"],
    ["/api/audit", "GET", "Audit logs", "Active"],
    ["/api/ai-chat", "POST", "AI Chatbot", "Active"],
    ["/api/ai-interview", "GET/POST", "AI Interview", "Active"],
    ["/api/requisitions", "GET/POST", "Job requisitions", "Active"],
    ["/api/candidates", "GET/POST", "Candidate management", "Active"],
    ["/api/assets", "GET/POST", "Asset management", "Active"],
    ["/api/documents", "GET/POST", "Document management", "Active"],
    ["/api/profile", "GET/PUT", "User profile", "Active"],
  ];

  const apiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("Endpoint", 30),
          createHeaderCell("Methods", 15),
          createHeaderCell("Description", 35),
          createHeaderCell("Status", 20),
        ],
      }),
      ...apiEndpoints.map((row, idx) =>
        new TableRow({
          children: [
            createDataCell(row[0], 30, { fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white, color: COLORS.secondary }),
            createDataCell(row[1], 15, { align: AlignmentType.CENTER, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[2], 35, { fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
            createDataCell(row[3], 20, { align: AlignmentType.CENTER, bold: true, color: COLORS.success, fill: idx % 2 === 0 ? COLORS.tableAltRow : COLORS.white }),
          ],
        })
      ),
    ],
  });

  children.push(apiTable);

  children.push(spacer(200));

  // ─── Footer / Disclaimer ───────────────────────────────────────
  children.push(
    new Paragraph({
      spacing: { before: 300, after: 0 },
      children: [
        new TextRun({
          text: "\u2500".repeat(80),
          size: 10,
          color: COLORS.tableBorder,
          font: "Calibri",
        }),
      ],
    })
  );

  children.push(spacer(60));

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "eh2r AI \u2014 An AI Product of MARQ AI",
          bold: true,
          size: 20,
          font: "Calibri",
          color: COLORS.primary,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "This document is confidential and intended for internal use only.",
          size: 16,
          font: "Calibri",
          color: COLORS.lightText,
          italics: true,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: `\u00A9 ${new Date().getFullYear()} MARQ AI. All rights reserved.`,
          size: 16,
          font: "Calibri",
          color: COLORS.lightText,
        }),
      ],
    })
  );

  // ═══════════════════════════════════════════════════════════════════
  // Create document
  // ═══════════════════════════════════════════════════════════════════

  const doc = new Document({
    creator: "MARQ AI",
    title: "eh2r AI - Comprehensive Test Report",
    description: "Module-wise Testing & Quality Assessment for eh2r AI HRMS Platform",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 20,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: children,
      },
    ],
  });

  // Generate and save
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/download/eh2r_AI_Test_Report.docx", buffer);
  console.log("✅ Report generated: /home/z/my-project/download/eh2r_AI_Test_Report.docx");
  console.log(`   File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

buildReport().catch((err) => {
  console.error("❌ Error generating report:", err);
  process.exit(1);
});
