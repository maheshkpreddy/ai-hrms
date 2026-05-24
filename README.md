# AI-HRMS: AI-Powered Human Resource Management System

A comprehensive, full-stack HRMS application built with Next.js 16, Prisma ORM, and AI-powered features. Deployed on Vercel with PostgreSQL.

## 🚀 Live Demo

**URL**: [https://ai-hrms-rho.vercel.app](https://ai-hrms-rho.vercel.app)

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@hrms.com | admin123 |
| HR Admin | hradmin@hrms.com | admin123 |
| Payroll Specialist | payroll@hrms.com | admin123 |
| Department Manager | manager@hrms.com | admin123 |
| Employee | employee@hrms.com | admin123 |
| Recruiter | recruiter@hrms.com | admin123 |
| L&D Manager | ldmgr@hrms.com | admin123 |

## 📚 Documentation

### Downloadable Documents
- 📄 **[Module-wise SOP Document (DOCX)](download/AI-HRMS_Module-wise_SOP_Document.docx)** — Complete SOPs for all 19 modules with workflows, integrations, and screen descriptions
- 📄 **[Technical Documentation (DOCX)](download/AI-HRMS_Technical_Documentation.docx)** — Comprehensive technical reference: Frontend, Backend, Middleware, API, AI, Coding Standards

### Markdown Documentation (in /docs/)
- 📋 [Module-wise SOP](docs/MODULE_SOP.md) — Standard Operating Procedures for all 19 HRMS modules
- 🔧 [Technical Documentation V2](docs/TECHNICAL_DOCUMENTATION_V2.md) — Complete technical architecture and code explanation
- 🌐 [API Documentation](docs/API_DOCUMENTATION.md) — Full API endpoint catalog
- 🗄️ [Database Schema](docs/DATABASE_SCHEMA.md) — Prisma schema with 28 models
- 📖 [Functional Document](docs/FUNCTIONALITY_DOCUMENT.md) — Feature specifications
- 🚀 [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) — Setup and deployment instructions
- 👤 [User SOP](docs/USER_SOP.md) — End-user operating procedures

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI (40+ components) |
| State Management | Zustand 5 |
| Backend | Next.js API Routes + Prisma ORM 6 |
| Database | PostgreSQL (Neon) |
| Authentication | NextAuth.js v4 (Credentials + Google OAuth) |
| AI | Z-AI Web Dev SDK |
| Charts | Recharts |
| Export | xlsx (SheetJS) |
| Deployment | Vercel Serverless |

## 📦 19 Modules

1. **Authentication & Login** — Credentials + Google OAuth
2. **Dashboard** — AI-powered analytics overview
3. **Employee Management** — Full CRUD with org chart
4. **Company Management** — Multi-company with join codes
5. **Task Management** — Multi-assignee with comments
6. **Time & Attendance** — Geofence check-in/out
7. **Payroll & Expenses** — Indian payroll compliance
8. **Talent Acquisition** — AI-powered recruitment & interviews
9. **Performance Management** — Reviews + attrition prediction
10. **Project Management** — Milestones & team tracking
11. **Meeting Management** — Scheduling + RSVP
12. **Learning & Development** — Courses & skill gap analysis
13. **Asset Management** — IT asset lifecycle tracking
14. **Document Management** — Access-controlled storage
15. **RBAC & Security** — 7-level role hierarchy
16. **Analytics & Reporting** — Excel exports + AI insights
17. **Self-Service Portal** — Employee self-service
18. **Profile Management** — Avatar + info updates
19. **Settings** — System configuration

## 🤖 AI Features

- **AI Fit Score**: Auto-evaluates candidate-job compatibility
- **AI Interviews**: Generates role-specific questions (technical, behavioral, problem-solving, culture fit)
- **AI Chat**: HR assistant for policy and compliance queries
- **Attrition Prediction**: Identifies flight-risk employees
- **Smart Recommendations**: Course and training suggestions

## 🛠️ Getting Started

\`\`\`bash
# Clone the repository
git clone https://github.com/maheshkpreddy/ai-hrms.git
cd ai-hrms

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, NEXTAUTH_SECRET, etc.

# Set up database
npm run db:generate
npm run db:push
npm run db:seed

# Run development server
npm run dev
\`\`\`

## 📄 License

Proprietary - All rights reserved.
