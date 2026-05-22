<p align="center">
  <img src="public/logo.svg" alt="AI-HRMS Logo" width="80" height="80" />
</p>

<h1 align="center">AI-HRMS: AI-Powered Human Resource Management System</h1>

<p align="center">
  <strong>A modern, intelligent HRMS built with Next.js 16, TypeScript, and AI-powered features</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" /></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Deploy-000?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/github/actions/workflow/status/your-org/ai-hrms/ci.yml?style=flat-square&label=CI" alt="CI Status" />
</p>

---

## 📸 Screenshot

> **Placeholder** — Replace with an actual screenshot of the application running.

```
┌──────────────────────────────────────────────────────────────┐
│  🤖 AI-HRMS                                                  │
│  ┌────────────┐  ┌──────────────────────────────────────────┐│
│  │ Dashboard  │  │  📊 Dashboard Overview                   ││
│  │ Employees  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   ││
│  │ RBAC       │  │  │  247 │ │  12  │ │  98% │ │  1.2M│   ││
│  │ Talent     │  │  │Staff │ │Depts │ │Atten.│ │Payroll│   ││
│  │ Attendance │  │  └──────┘ └──────┘ └──────┘ └──────┘   ││
│  │ Payroll    │  │                                          ││
│  │ Performance│  │  🤖 AI Assistant: "How can I help?"      ││
│  │ Learning   │  │                                          ││
│  │ Analytics  │  │  📈 Performance Trends    🎯 OKR Tracker ││
│  │ Self-Svc   │  │                                          ││
│  └────────────┘  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🏢 Core HR Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Dashboard** | Real-time organizational overview with key metrics, charts, and AI-powered insights |
| 2 | **Employee Management** | Complete employee lifecycle — onboarding, profiles, documents, assets, and offboarding |
| 3 | **RBAC & Security** | Role-based access control with granular permissions, audit logging, and compliance tracking |
| 4 | **AI Talent Acquisition** | AI-powered recruitment pipeline — job posting, candidate scoring, interview scheduling, and onboarding |
| 5 | **Time & Attendance** | Shift management, biometric-style tracking, leave management, holiday calendars, and overtime |
| 6 | **Payroll & Expenses** | Automated payroll processing, tax calculations, expense claims, and approval workflows |
| 7 | **Performance & Talent** | OKR tracking, 360° reviews, attrition risk prediction, skill gap analysis, and career paths |
| 8 | **Learning & Development** | Course management, skill assessments, certification tracking, and personalized learning paths |
| 9 | **Analytics & Reporting** | Interactive dashboards, predictive analytics, custom reports, and exportable data |

### 🤖 AI-Powered Capabilities

- **AI Chat Assistant** — Natural language HR queries answered instantly using z-ai-web-dev-sdk
- **AI Candidate Scoring** — Automated fit-score calculation for job applicants (0–100)
- **Attrition Risk Prediction** — ML-driven employee retention risk analysis
- **Smart Recommendations** — Personalized learning and career path suggestions

### 🔐 Enterprise Features

- **NextAuth.js v4** authentication with multiple providers
- **Audit logging** for every critical action (GDPR-ready)
- **Multi-level approval workflows** for leaves, expenses, and promotions
- **Responsive design** — works seamlessly on desktop, tablet, and mobile
- **Dark mode** support via next-themes
- **Real-time updates** with WebSocket / Socket.io support

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Database** | [Prisma ORM](https://www.prisma.io/) (SQLite dev / PostgreSQL prod) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) + [TanStack Query](https://tanstack.com/query) |
| **AI SDK** | [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Tables** | [TanStack Table](https://tanstack.com/table) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Runtime** | [Bun](https://bun.sh/) |
| **Deployment** | [Vercel](https://vercel.com/) + [GitHub Actions](https://github.com/features/actions) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Bun** ≥ 1.1 ([install](https://bun.sh/docs/installation))
- **Git** ≥ 2.40

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ai-hrms.git
cd ai-hrms

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Setup below)
```

### Environment Setup

Edit the `.env` file with your values:

```bash
# Required
DATABASE_URL="file:./dev.db"                          # SQLite for development
NEXTAUTH_SECRET="openssl rand -base64 32"             # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Optional — AI Features
ZAI_API_KEY=""                                        # Required for AI chat assistant
```

> 💡 **Tip:** For production, use PostgreSQL instead of SQLite:
> `DATABASE_URL="postgresql://user:password@host:5432/aihrms?schema=public"`

### Database Setup

```bash
# Generate Prisma Client
bun run db:generate

# Push schema to database (development)
bun run db:push

# Seed with sample data
bun run db:seed
```

### Running the Application

```bash
# Start development server
bun run dev

# The app will be available at http://localhost:3000
```

### Other Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 3000) |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema changes |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database and re-seed |
| `bun run db:seed` | Seed database with sample data |

---

## 📁 Project Structure

```
ai-hrms/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Continuous Integration
│       └── deploy.yml              # Production Deployment
├── docs/
│   └── DEPLOYMENT_GUIDE.md         # Deployment Documentation
├── prisma/
│   ├── schema.prisma               # Database Schema
│   └── seed.ts                     # Seed Data
├── public/
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes (REST)
│   │   │   ├── ai-chat/route.ts    # AI Assistant Endpoint
│   │   │   ├── attendance/route.ts
│   │   │   ├── audit/route.ts
│   │   │   ├── candidates/route.ts
│   │   │   ├── courses/route.ts
│   │   │   ├── dashboard/route.ts
│   │   │   ├── employees/route.ts
│   │   │   ├── expenses/route.ts
│   │   │   ├── jobs/route.ts
│   │   │   ├── leaves/route.ts
│   │   │   ├── payroll/route.ts
│   │   │   └── performance/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                # Main Application Entry
│   ├── components/
│   │   ├── hrms/                   # Domain Components
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
│   │   └── ui/                     # shadcn/ui Components
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── data.ts                 # Static Data & Constants
│       ├── db.ts                   # Prisma Client Singleton
│       ├── store.ts                # Zustand Store
│       └── utils.ts                # Utility Functions
├── .env.example
├── .gitignore
├── Caddyfile                       # Gateway Configuration
├── LICENSE
├── README.md
├── components.json                 # shadcn/ui Config
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json                     # Vercel Deployment Config
```

---

## 📡 API Documentation

All API endpoints follow REST conventions and return JSON responses.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Dashboard summary metrics |
| `GET` | `/api/employees` | List all employees |
| `POST` | `/api/employees` | Create a new employee |
| `GET` | `/api/employees/[id]` | Get employee by ID |
| `PUT` | `/api/employees/[id]` | Update employee |
| `DELETE` | `/api/employees/[id]` | Delete employee |
| `GET` | `/api/attendance` | List attendance records |
| `POST` | `/api/attendance` | Create attendance record |
| `GET` | `/api/leaves` | List leave requests |
| `POST` | `/api/leaves` | Submit leave request |
| `GET` | `/api/payroll` | List payroll records |
| `POST` | `/api/payroll` | Process payroll |
| `GET` | `/api/expenses` | List expense claims |
| `POST` | `/api/expenses` | Submit expense claim |
| `GET` | `/api/performance` | List performance reviews |
| `POST` | `/api/performance` | Create performance review |
| `GET` | `/api/jobs` | List job postings |
| `POST` | `/api/jobs` | Create job posting |
| `GET` | `/api/candidates` | List candidates |
| `POST` | `/api/candidates` | Add a candidate |
| `GET` | `/api/courses` | List learning courses |
| `POST` | `/api/courses` | Create a course |
| `POST` | `/api/ai-chat` | AI assistant conversation |
| `GET` | `/api/audit` | List audit logs |

> All `POST` endpoints accept JSON bodies. See individual route files for detailed schemas.

---

## 🚢 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/ai-hrms&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,ZAI_API_KEY)

### Manual Deployment

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Configure environment variables
4. Deploy

📖 See the **[Complete Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** for detailed step-by-step instructions including:
- GitHub repository setup
- Vercel project configuration
- Custom domain & SSL
- Monitoring & rollback procedures
- Cost estimation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write descriptive commit messages
- Ensure all CI checks pass before requesting review
- Update documentation for any new features
- Keep PRs focused — one feature per PR

### Development Setup

```bash
# Install dependencies
bun install

# Set up local database
cp .env.example .env
bun run db:push
bun run db:seed

# Start development
bun run dev
```

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
  Built with ❤️ using <strong>Next.js 16</strong> + <strong>AI</strong>
</p>
