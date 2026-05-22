# Task: Create HRMS API Route Files

## Task ID: hrms-api-routes

## Summary
Created 13 API route files for the AI-powered HRMS application using Next.js 16 App Router with Prisma database client.

## Files Created

### 1. `/src/app/api/employees/route.ts`
- **GET**: List all employees with pagination, filtering by department/status, and search
- **POST**: Create new employee with full field support and audit logging

### 2. `/src/app/api/employees/[id]/route.ts`
- **GET**: Single employee with full relational data (attendance, leaves, payroll, performance, expenses, assets, skills, enrollments, documents)
- **PUT**: Update employee with audit logging
- **DELETE**: Delete employee with audit logging
- Uses `await params` pattern for Next.js 16 dynamic routes

### 3. `/src/app/api/attendance/route.ts`
- **GET**: List attendance records with pagination, filtering by employee/date/status/date range
- **POST**: Create attendance record with duplicate prevention

### 4. `/src/app/api/leaves/route.ts`
- **GET**: List leaves with filtering by employee/status/leave type
- **POST**: Create leave request (default status: pending)
- **PATCH**: Approve/reject leave with status transition validation

### 5. `/src/app/api/payroll/route.ts`
- **GET**: List payroll records with filtering by employee/month/year/status
- **POST**: Process payroll with auto-calculation of HRA, DA, PF, ESI, professional tax, net pay

### 6. `/src/app/api/expenses/route.ts`
- **GET**: List expenses with filtering by employee/status/category
- **POST**: Create expense claim (default status: pending)
- **PATCH**: Approve/reject/reimburse with status transition validation

### 7. `/src/app/api/performance/route.ts`
- **GET**: List performance reviews with filtering by employee/status/review period
- **POST**: Create performance review with OKRs, feedback, attrition risk

### 8. `/src/app/api/jobs/route.ts`
- **GET**: List job postings with search, filtering by department/status/type
- **POST**: Create job posting with requirements and skills

### 9. `/src/app/api/candidates/route.ts`
- **GET**: List candidates with filtering by job/status/source and search
- **POST**: Create candidate with job existence validation

### 10. `/src/app/api/courses/route.ts`
- **GET**: List courses or employee enrollments (based on employeeId param)
- **POST**: Dual mode - create course enrollment (employeeId+courseId) or new course (title)

### 11. `/src/app/api/audit/route.ts`
- **GET**: List audit logs with filtering by action/module/employee/date range

### 12. `/src/app/api/dashboard/route.ts`
- **GET**: Comprehensive dashboard with overview stats, chart data, performance metrics, candidate pipeline, and recent activities

### 13. `/src/app/api/ai-chat/route.ts`
- **POST**: AI chat endpoint using z-ai-web-dev-sdk with HR-specific system prompt and conversation history support

## Key Implementation Details
- All routes use `import { db } from '@/lib/db'` for database access
- Dynamic route params use `{ params }: { params: Promise<{ id: string }> }` with `await params`
- All routes have try/catch error handling with proper HTTP status codes
- All mutations create audit logs for traceability
- Lint passes cleanly (fixed `module` variable naming conflict in audit route)
