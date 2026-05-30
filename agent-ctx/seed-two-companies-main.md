# Task: Create comprehensive seed script for eh2r AI HRMS platform

## Agent: Main Developer
## Date: 2026-03-04

## Summary
Created a comprehensive database seed script that creates exactly 2 companies (MARQ AI Technologies and TechCorp Global) with sample data in ALL 41+ modules.

## Files Created/Modified

### 1. `/home/z/my-project/scripts/seed-two-companies.ts` (NEW)
- Standalone seed script that can be run directly with `bun run scripts/seed-two-companies.ts`
- Seeds 2 companies with full module data for all 41 modules
- Uses helper function pattern with `seedCompany()` to avoid code duplication
- Includes delete-all-data cleanup before seeding (idempotent)
- Exports `seedTwoCompanies()` function for programmatic use

### 2. `/home/z/my-project/src/app/api/setup/seed-all/route.ts` (NEW)
- POST endpoint at `/api/setup/seed-all`
- Calls the same seed logic inline (since we can't import from scripts/ in Next.js)
- Returns success with counts of records created
- Protected: only works in development or with super_admin role
- Returns credentials in response

### 3. `/home/z/my-project/prisma/seed.ts` (MODIFIED)
- Updated to use the same 2-company pattern
- Deletes all existing data first, then seeds fresh
- Includes all 41 modules for both companies
- Same employee/user data as the API route

## Data Created Per Company
- 2 Companies: MARQ AI Technologies (INR/India) and TechCorp Global (USD/US)
- 6 Branches (3 per company)
- 12 Departments (6 per company)
- 10 Roles with permissions
- 23 Users (10 employees + admin per company + platform admin)
- 20 Employees (10 per company)
- 10 Jobs (5 per company)
- 10 Candidates (5 per company)
- 5 Interviews
- 4 AI Interviews (with questions, responses, scores)
- 7-day attendance for all employees
- 8 Leave Policies (4 per company)
- 10 Leaves (5 per company)
- 2 Payroll Structures
- 60 Payroll Records (3 months × 10 employees × 2)
- ~60 Goals (3 per employee)
- 10 Performance Reviews + 10 Performance Records
- 10 Asset Allocations
- 6 Travel Requests
- 10 Expense Claims
- 10 Learning Records
- 10 Tickets
- 10 Helpdesk Tickets with comments
- 7 Clients
- 6 Vendors + 6 SubVendors
- 60 Documents (3 per employee)
- 6 Shifts with shift members
- 12 Company Policies
- 6 Projects with members and milestones
- 16 Tasks with assignments and comments
- 20 Timesheets with entries
- 6 Manpower Requisitions
- 10 Compliance Items
- 30 Notifications
- 10 Onboarding Tasks
- 30 Skills with employee skills
- 20 Audit Logs
- 4 Workflow Definitions with steps and instances
- 2 Surveys with questions and responses
- 2 Alumni Records

## Login Credentials
- Platform Admin: `superadmin@eh2r.com` / `admin123`
- MARQ Admin: `admin@marqai.tech` / `admin123`
- TCG Admin: `admin@techcorp.com` / `admin123`
- Employee passwords: `employee123` or `admin123`

## Lint Status
All new files pass lint with zero errors.
