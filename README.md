<p align="center">
  <img src="public/logo.svg" alt="AI-HRMS Logo" width="80" height="80" />
</p>

<h1 align="center">AI-HRMS</h1>

<p align="center">
  <strong>AI-Powered Human Resource Management System</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Deploy-000?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License: MIT" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/AI_Powered-z--ai--sdk-9333EA?style=flat-square" alt="AI Powered" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Routes](#-api-routes)
- [Deployment](#-deployment)
- [RBAC Roles](#-rbac-roles)
- [Screenshots & Demo](#-screenshots--demo)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 Overview

**AI-HRMS** is a comprehensive, enterprise-grade Human Resource Management System that leverages artificial intelligence to transform how organizations manage their most valuable asset — their people. Built with modern web technologies, it delivers a seamless, intuitive experience across the entire employee lifecycle.

From AI-driven talent acquisition with automated candidate scoring, to predictive attrition analytics that help retain top performers, AI-HRMS brings intelligence to every HR workflow. The system features a conversational AI assistant that can answer HR queries in natural language, smart approval workflows that adapt to organizational hierarchies, and real-time dashboards that turn workforce data into actionable insights.

Whether you're a startup scaling your team or an enterprise managing thousands of employees across multiple locations, AI-HRMS provides the flexibility, security, and intelligence to streamline your HR operations.

### 🤖 AI-Powered Capabilities

| Feature | Description |
|---------|-------------|
| 🧠 **AI Chat Assistant** | Natural language HR queries answered instantly via z-ai-web-dev-sdk — from leave policies to payroll calculations |
| 🎯 **AI Candidate Scoring** | Automated fit-score (0–100) for job applicants based on skills, experience, and job requirements |
| 📉 **Attrition Risk Prediction** | ML-driven employee retention risk analysis (0–1 score) with early warning indicators |
| 💡 **Smart Recommendations** | Personalized learning paths and career development suggestions based on skill gap analysis |
| 🔄 **Intelligent Workflows** | Auto-routing of approval workflows based on organizational hierarchy and role-based rules |

---

## ✨ Key Features

### 9 Core Modules

| # | Module | Icon | Description |
|---|--------|:----:|-------------|
| 1 | **Core HR & Employee Management** | 👥 | Complete employee lifecycle management — onboarding, profiles, documents, asset tracking, and offboarding with full CRUD operations and department organization |
| 2 | **RBAC & Security System** | 🔐 | Granular role-based access control with 7 predefined roles, permission matrices, comprehensive audit logging, and GDPR-ready compliance tracking |
| 3 | **AI-Driven Talent Acquisition & Onboarding** | 🎯 | End-to-end recruitment pipeline — job postings, AI-powered candidate scoring, interview scheduling, offer management, and automated onboarding workflows |
| 4 | **Time & Attendance Management** | ⏰ | Shift management with grace periods, attendance tracking (present/absent/late/half-day), leave management with multi-level approval, and holiday calendars |
| 5 | **Payroll & Expense Management** | 💰 | Automated payroll processing with Indian tax compliance (PF, ESI, Professional Tax), expense claims with receipt uploads, and multi-level approval workflows |
| 6 | **Performance & Talent Development** | 📈 | OKR tracking, 360° performance reviews, AI-driven attrition risk prediction, skill gap analysis, and career path mapping |
| 7 | **Learning & Development (L&D)** | 📚 | Course catalog management, enrollment tracking, progress monitoring, certification tracking, and personalized learning path recommendations |
| 8 | **Analytics & Reporting** | 📊 | Interactive dashboards with Recharts, department headcount analytics, attendance distribution, expense breakdowns, and exportable custom reports |
| 9 | **Employee Self-Service (ESS) & Collaboration** | 🤝 | Self-service portal for profile updates, leave applications, expense submissions, document access, and team collaboration tools |

### 🏢 Enterprise Features

- **NextAuth.js v4** authentication with secure session management
- **Audit logging** for every critical action (create, read, update, delete, login, logout)
- **Multi-level approval workflows** for leaves, expenses, and promotions
- **Responsive design** — works seamlessly on desktop, tablet, and mobile
- **Dark mode** support via `next-themes`
- **Real-time updates** with WebSocket / Socket.io support
- **Security headers** — X-Frame-Options, X-XSS-Protection, Content-Type-Options, Referrer-Policy, Permissions-Policy

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | [Next.js 16](https://nextjs.org/) | App Router, Server Components, API Routes |
| | [React 19](https://react.dev/) | UI library with latest features |
| | [TypeScript 5](https://www.typescriptlang.org/) | Type-safe development |
| | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| | [shadcn/ui](https://ui.shadcn.com/) | 40+ accessible UI components |
| | [Recharts](https://recharts.org/) | Interactive data visualization |
| | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| | [TanStack Table](https://tanstack.com/table) | Powerful data tables |
| | [TanStack Query](https://tanstack.com/query) | Server state management |
| | [Framer Motion](https://www.framer.com/motion/) | Smooth animations |
| **Backend** | Next.js API Routes | RESTful API endpoints |
| | [Prisma ORM 6](https://www.prisma.io/) | Type-safe database access |
| | SQLite | Development database |
| | PostgreSQL | Production database |
| | [NextAuth.js v4](https://next-auth.js.org/) | Authentication & sessions |
| | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev) | Form validation |
| **AI** | [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) | AI chatbot & predictions |
| **Deployment** | [Vercel](https://vercel.com/) | Hosting & edge functions |
| | [GitHub Actions](https://github.com/features/actions) | CI/CD pipelines |

---

## 📁 Project Structure

```
ai-hrms/
├── docs/
│   ├── API_DOCUMENTATION.md         # API Reference
│   ├── DATABASE_SCHEMA.md           # Schema Documentation
│   ├── DEPLOYMENT_GUIDE.md          # Deployment Walkthrough
│   ├── FUNCTIONALITY_DOCUMENT.md    # Feature Specification
│   ├── TECHNICAL_DOCUMENTATION.md   # Architecture Deep-Dive
│   └── USER_SOP.md                  # Standard Operating Procedures
├── download/
│   ├── AI-HRMS_User_SOP.pdf
│   ├── AI-HRMS_Functionality_Document.pdf
│   └── AI-HRMS_Technical_Documentation.pdf
├── examples/
│   └── websocket/
│       ├── frontend.tsx             # WebSocket Client Example
│       └── server.ts                # WebSocket Server Example
├── prisma/
│   ├── schema.prisma                # Database Schema (21 models)
│   └── seed.ts                      # Sample Data (20 employees, 8 depts)
├── public/
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── api/                     # REST API Routes
│   │   │   ├── ai-chat/route.ts     # AI Assistant Endpoint
│   │   │   ├── attendance/route.ts
│   │   │   ├── audit/route.ts
│   │   │   ├── candidates/route.ts
│   │   │   ├── courses/route.ts
│   │   │   ├── dashboard/route.ts
│   │   │   ├── employees/
│   │   │   │   ├── route.ts         # GET (list), POST (create)
│   │   │   │   └── [id]/route.ts    # GET, PATCH (update)
│   │   │   ├── expenses/route.ts
│   │   │   ├── jobs/route.ts
│   │   │   ├── leaves/route.ts
│   │   │   ├── payroll/route.ts
│   │   │   ├── performance/route.ts
│   │   │   └── route.ts             # API Root
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Main Application Entry
│   ├── components/
│   │   ├── hrms/                    # Domain Components (9 modules)
│   │   │   ├── Analytics.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmployeeManagement.tsx
│   │   │   ├── LearningDevelopment.tsx
│   │   │   ├── PayrollExpense.tsx
│   │   │   ├── Performance.tsx
│   │   │   ├── RBACSecurity.tsx
│   │   │   ├── SelfService.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TalentAcquisition.tsx
│   │   │   └── TimeAttendance.tsx
│   │   └── ui/                      # 40+ shadcn/ui Components
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── ... (40+ components)
│   │       └── textarea.tsx
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── data.ts                  # Static Data & Constants
│       ├── db.ts                    # Prisma Client Singleton
│       ├── store.ts                 # Zustand Store
│       └── utils.ts                 # Utility Functions (cn, formatters)
├── .env.example                     # Environment Template
├── Caddyfile                        # Reverse Proxy Config
├── LICENSE                          # MIT License
├── README.md                        # This File
├── components.json                  # shadcn/ui Configuration
├── next.config.ts                   # Next.js Configuration
├── package.json
├── tailwind.config.ts               # Tailwind CSS Configuration
├── tsconfig.json                    # TypeScript Configuration
└── vercel.json                      # Vercel Deployment Config
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Installation |
|:------------|:--------|:-------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** or **Bun** | latest | Comes with Node / [bun.sh](https://bun.sh/) |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com/) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ai-hrms.git
cd ai-hrms

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Variables below)
```

### Database Setup

```bash
# Push Prisma schema to create tables
npx prisma db push

# Seed the database with sample data (20 employees, 8 departments, 7 roles, etc.)
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production (standalone output) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma Client |
| `npx prisma migrate dev` | Run database migrations (dev) |
| `npx prisma migrate reset` | Reset database and re-seed |
| `npm run db:seed` | Seed database with sample data |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required

| Variable | Description | Default |
|:---------|:------------|:--------|
| `DATABASE_URL` | Prisma database connection URL | `file:./dev.db` (SQLite) |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js session encryption | — *(generate with `openssl rand -base64 32`)* |
| `NEXTAUTH_URL` | Canonical URL of your application | `http://localhost:3000` |
| `ZAI_API_KEY` | API key for z-ai-web-dev-sdk (AI chat feature) | — |

### Application Settings

| Variable | Description | Default |
|:---------|:------------|:--------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Application port | `3000` |

### Optional — Email Service

| Variable | Description | Default |
|:---------|:------------|:--------|
| `SMTP_HOST` | SMTP server hostname | — |
| `SMTP_PORT` | SMTP server port | — |
| `SMTP_USER` | SMTP authentication username | — |
| `SMTP_PASS` | SMTP authentication password | — |
| `SMTP_FROM` | Sender email address | — |

### Optional — File Storage

| Variable | Description | Default |
|:---------|:------------|:--------|
| `STORAGE_TYPE` | Storage backend (`local` or `s3`) | `local` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | — |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | — |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | — |

### Optional — Monitoring

| Variable | Description | Default |
|:---------|:------------|:--------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Google Analytics tracking ID | — |
| `SENTRY_DSN` | Sentry error tracking DSN | — |
| `SENTRY_ORG` | Sentry organization slug | — |
| `SENTRY_PROJECT` | Sentry project slug | — |

### Optional — Vercel Deployment

| Variable | Description | Default |
|:---------|:------------|:--------|
| `VERCEL_TOKEN` | Vercel deployment token | — |
| `VERCEL_ORG_ID` | Vercel organization ID | — |
| `VERCEL_PROJECT_ID` | Vercel project ID | — |

> 💡 **Production Tip:** Switch from SQLite to PostgreSQL for production:
> `DATABASE_URL="postgresql://user:password@host:5432/aihrms?schema=public"`

---

## 🗄 Database Schema

AI-HRMS uses **21 Prisma models** organized across the following domains:

### Core HR & Organization

| Model | Description | Key Fields |
|:------|:------------|:-----------|
| `Employee` | Central employee entity with full profile | `employeeId`, `firstName`, `lastName`, `email`, `department`, `status`, `salary` |
| `Department` | Organizational departments | `name`, `head`, `budget` |
| `Role` | RBAC role definitions with permission JSON | `name`, `level`, `permissions` |
| `Document` | Employee documents with access control | `docType`, `title`, `accessLevel` |
| `Asset` | Company assets assigned to employees | `assetType`, `serialNo`, `condition`, `status` |

### Time & Attendance

| Model | Description | Key Fields |
|:------|:------------|:-----------|
| `Attendance` | Daily attendance records | `checkIn`, `checkOut`, `status`, `shift`, `location` |
| `Leave` | Leave requests and approvals | `leaveType`, `days`, `status`, `approvedBy` |
| `Shift` | Shift definitions with timing | `startTime`, `endTime`, `graceTime` |
| `Holiday` | Company and national holidays | `name`, `date`, `type` |

### Payroll & Finance

| Model | Description | Key Fields |
|:------|:------------|:-----------|
| `Payroll` | Monthly payroll with full breakdown | `basicSalary`, `hra`, `pf`, `esi`, `tax`, `netPay` |
| `Expense` | Employee expense claims | `category`, `amount`, `receiptUrl`, `status` |

### Performance & Growth

| Model | Description | Key Fields |
|:------|:------------|:-----------|
| `Performance` | Performance reviews with OKRs | `rating`, `objectives`, `attritionRisk`, `status` |
| `Skill` | Organization-wide skill catalog | `name`, `category` |
| `EmployeeSkill` | Employee-skill mapping with proficiency | `proficiency`, `certified` |
| `Course` | L&D course catalog | `title`, `duration`, `provider`, `skills` |
| `CourseEnrollment` | Employee course enrollments | `status`, `progress`, `score` |

### Talent Acquisition

| Model | Description | Key Fields |
|:------|:------------|:-----------|
| `Job` | Job postings with requirements | `title`, `type`, `experience`, `salary`, `status` |
| `Candidate` | Job applicants with AI scoring | `aiFitScore`, `status`, `onboardingStatus` |

### System & Compliance

| Model | Description | Key Fields |
|:------|:------------|:-----------|
| `AuditLog` | Comprehensive action audit trail | `action`, `module`, `ipAddress` |
| `ApprovalWorkflow` | Multi-level approval routing | `type`, `level`, `status` |
| `CompanyPolicy` | Organization policy documents | `category`, `version`, `effectiveDate` |

### Entity Relationships

```
Employee ──┬── Attendance (1:N)
           ├── Leave (1:N)
           ├── Payroll (1:N)
           ├── Expense (1:N)
           ├── Performance (1:N)
           ├── Asset (1:N)
           ├── EmployeeSkill (1:N)
           ├── CourseEnrollment (1:N)
           ├── Document (1:N)
           └── AuditLog (1:N)

Job ──── Candidate (1:N)
```

---

## 📡 API Routes

All API endpoints follow REST conventions and return JSON responses.

### Employee Management

| Method | Endpoint | Description | Key Parameters |
|:-------|:---------|:------------|:---------------|
| `GET` | `/api/employees` | List employees with pagination & filters | `page`, `limit`, `department`, `status`, `search` |
| `POST` | `/api/employees` | Create a new employee | JSON body with employee details |
| `GET` | `/api/employees/[id]` | Get employee by ID (with skills) | — |
| `PATCH` | `/api/employees/[id]` | Update employee details | JSON body with fields to update |

### Dashboard & Analytics

| Method | Endpoint | Description | Key Parameters |
|:-------|:---------|:------------|:---------------|
| `GET` | `/api/dashboard` | Dashboard overview with metrics, charts & recent activity | — |

### Time & Leave

| Method | Endpoint | Description | Key Parameters |
|:-------|:---------|:------------|:---------------|
| `GET` | `/api/attendance` | List attendance records | `employeeId`, `date`, `status` |
| `POST` | `/api/attendance` | Create attendance record | `employeeId`, `date`, `checkIn`, `status` |
| `GET` | `/api/leaves` | List leave requests | `employeeId`, `status` |
| `POST` | `/api/leaves` | Submit leave request | `employeeId`, `leaveType`, `startDate`, `endDate` |

### Payroll & Expenses

| Method | Endpoint | Description | Key Parameters |
|:-------|:---------|:------------|:---------------|
| `GET` | `/api/payroll` | List payroll records | `employeeId`, `month`, `year`, `status` |
| `POST` | `/api/payroll` | Process payroll | `employeeId`, `month`, `year`, salary breakdown |
| `GET` | `/api/expenses` | List expense claims | `employeeId`, `category`, `status` |
| `POST` | `/api/expenses` | Submit expense claim | `employeeId`, `category`, `amount`, `date` |

### Talent Acquisition

| Method | Endpoint | Description | Key Parameters |
|:-------|:---------|:------------|:---------------|
| `GET` | `/api/jobs` | List job postings | `department`, `status` |
| `POST` | `/api/jobs` | Create job posting | `title`, `department`, `requirements`, `skills` |
| `GET` | `/api/candidates` | List candidates | `jobId`, `status` |
| `POST` | `/api/candidates` | Add a candidate | `jobId`, `name`, `email`, `skills`, `experience` |

### Performance & Learning

| Method | Endpoint | Description | Key Parameters |
|:-------|:---------|:------------|:---------------|
| `GET` | `/api/performance` | List performance reviews | `employeeId`, `status` |
| `POST` | `/api/performance` | Create performance review | `employeeId`, `rating`, `objectives`, `attritionRisk` |
| `GET` | `/api/courses` | List learning courses | `category` |
| `POST` | `/api/courses` | Create a course | `title`, `category`, `duration`, `skills` |

### System

| Method | Endpoint | Description | Key Parameters |
|:-------|:---------|:------------|:---------------|
| `GET` | `/api/audit` | List audit logs | `module`, `action`, `userId` |
| `POST` | `/api/ai-chat` | AI assistant conversation | `message`, `conversationHistory` |

> All `POST` endpoints accept JSON bodies. All `GET` list endpoints support pagination. See individual route files in `src/app/api/` for detailed request/response schemas.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/ai-hrms&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,ZAI_API_KEY)

**Quick Deploy Steps:**

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Configure the required environment variables:
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXTAUTH_SECRET` — Generated secret key
   - `NEXTAUTH_URL` — Your production domain
   - `ZAI_API_KEY` — Your AI service API key
4. Click **Deploy**

The project includes a `vercel.json` with optimized build commands and security headers:

```jsonc
{
  "buildCommand": "prisma generate && next build",
  "headers": [
    // API routes: no-cache + strict security headers
    // Static pages: SAMEORIGIN frame policy + Permissions-Policy
  ]
}
```

### GitHub Actions CI/CD

Create `.github/workflows/ci.yml` for automated testing and deployment:

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run build
```

### Database Migration for Production

When moving from SQLite (development) to PostgreSQL (production):

```bash
# 1. Update your DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@host:5432/aihrms?schema=public"

# 2. Update prisma/schema.prisma datasource
#    Change: provider = "sqlite"
#    To:     provider = "postgresql"

# 3. Create and apply migration
npx prisma migrate dev --name init-postgresql

# 4. Seed production data
npm run db:seed
```

> 📖 See the **[Complete Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** for detailed instructions on Vercel setup, custom domains, SSL, monitoring, and cost estimation.

---

## 🔐 RBAC Roles

AI-HRMS implements a 7-tier role hierarchy with granular permissions across 6 modules (HR, Payroll, Attendance, Performance, Learning, Analytics). Each permission supports 5 access levels: **read**, **write**, **modify**, **delete**, **admin**.

| Role | Level | HR | Payroll | Attendance | Performance | Learning | Analytics |
|:-----|:------|:----|:--------|:-----------|:------------|:---------|:----------|
| **Super Admin** | 0 | Full | Full | Full | Full | Full | Full |
| **HR Admin** | 1 | R/W/M | R/W/M | R/W | R/W/M | R/W | R |
| **Payroll Specialist** | 2 | R | R/W/M | R | — | — | R |
| **Department Manager** | 3 | R/M | R | R/W/M | R/W/M | R | R |
| **Employee** | 4 | R | R | R | R | R/W | — |
| **Recruiter** | 2 | R/W/M | — | — | — | R | R |
| **L&D Manager** | 2 | R | — | R | R/W/M | Full | R |

> **Legend:** R = Read, W = Write, M = Modify, Full = R/W/M/D/Admin, — = No Access

### Permission Details

- **Super Admin** — Unrestricted access to all modules and administrative functions
- **HR Admin** — Full HR operations including employee management, payroll processing, and performance reviews
- **Payroll Specialist** — Focused on payroll processing and tax management with read-only access to HR and analytics
- **Department Manager** — Manage team attendance, performance reviews, and approve team requests
- **Employee** — Self-service access: view own data, apply for leaves, submit expenses, enroll in courses
- **Recruiter** — Manage job postings, candidate pipeline, and hiring workflows
- **L&D Manager** — Full control over training programs, course catalog, and skill development initiatives

---

## 📸 Screenshots & Demo

> **Placeholder** — Add your screenshots here by replacing the descriptions with actual image references.

### Dashboard Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  🤖 AI-HRMS                                                      │
│  ┌────────────┐  ┌──────────────────────────────────────────────┐│
│  │ Dashboard  │  │  📊 Dashboard Overview                       ││
│  │ Employees  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       ││
│  │ RBAC       │  │  │  247 │ │  12  │ │  98% │ │  1.2M│       ││
│  │ Talent     │  │  │Staff │ │Depts │ │Atten.│ │Payroll│       ││
│  │ Attendance │  │  └──────┘ └──────┘ └──────┘ └──────┘       ││
│  │ Payroll    │  │                                              ││
│  │ Performance│  │  🤖 AI Assistant: "How can I help you?"     ││
│  │ Learning   │  │                                              ││
│  │ Analytics  │  │  📈 Performance Trends   🎯 OKR Tracker     ││
│  │ Self-Svc   │  │                                              ││
│  └────────────┘  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

<!-- Uncomment when screenshots are available:
![Dashboard](screenshots/dashboard.png)
![Employee Management](screenshots/employees.png)
![AI Chat](screenshots/ai-chat.png)
![Analytics](screenshots/analytics.png)
-->

### Live Demo

<!-- Add your live demo link here:
🔗 **[Live Demo](https://your-demo-url.vercel.app)** — Try AI-HRMS with sample data
-->

| Demo Credentials (Seed Data) | |
|:------------------------------|:--|
| **Admin Access** | Super Admin with full system access |
| **HR Access** | HR Admin for employee & payroll management |
| **Employee Access** | Self-service portal for individual employees |

---

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, new feature, or documentation improvement — every contribution matters.

### Quick Start

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/ai-hrms.git
cd ai-hrms

# Install dependencies
npm install

# Set up local database
cp .env.example .env
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

### Guidelines

- ✅ Follow the existing code style (ESLint config is provided)
- ✅ Write descriptive, conventional commit messages
- ✅ Ensure all lint checks pass (`npm run lint`)
- ✅ Update documentation for any new features
- ✅ Keep PRs focused — one feature or fix per PR
- ✅ Add seed data for any new models in `prisma/seed.ts`
- ✅ Test your changes with the sample dataset before submitting

### Reporting Issues

- 🐛 **Bug reports** — Use the GitHub Issues template with reproduction steps
- 💡 **Feature requests** — Describe the use case and expected behavior
- 📖 **Documentation** — Fix typos, add examples, improve clarity

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 AI-HRMS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Built with ❤️ using <strong>Next.js 16</strong> + <strong>TypeScript</strong> + <strong>AI</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> ·
  <a href="#-key-features">Features</a> ·
  <a href="#-getting-started">Get Started</a> ·
  <a href="#-api-routes">API</a> ·
  <a href="#-deployment">Deploy</a> ·
  <a href="#-contributing">Contribute</a>
</p>
