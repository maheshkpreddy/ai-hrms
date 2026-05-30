# Task: Create Comprehensive Seed API Endpoint

## Task ID: seed-comprehensive-endpoint

## Summary
Created a comprehensive seed API endpoint at `/api/setup/seed-comprehensive` that seeds the eh2r AI HRMS database with complete sample data for 2 companies.

## Changes Made

### 1. Updated `/src/app/api/setup/seed-comprehensive/route.ts`
Completely rewrote the seed endpoint (previously ~1248 lines of incremental seeding logic) with a clean-from-scratch approach:

- **DELETE ALL DATA**: Deletes all existing data in correct dependency order (respecting foreign keys) before creating new data
- **2 Companies**: 
  - MARQ AI Technologies (code: MARQ) - India, INR, Asia/Kolkata
  - TechCorp Global (code: TCGC) - US, USD, America/Los_Angeles
- **3 Branches per company** (6 total)
- **6 Departments per company**: Engineering, HR, Finance, Marketing, Sales, Operations
- **10 Employees per company** (20 total) with unique IDs (MQ-001 to MQ-010, TC-001 to TC-010)
- **Users**: All passwords hashed with bcrypt (salt rounds 12), password: `admin123`
  - Admin: admin@marqai.com / admin123
  - Admin: admin@techcorp.com / admin123
  - Platform: superadmin@eh2r.com / admin123
- **Roles & Permissions**: 5 roles per company (super_admin, company_hr_admin, manager, employee, finance) with 15 module permissions each
- **3 Jobs per company** (6 total) - open positions
- **5 Candidates per company** (10 total) with AI scores
- **2 AI Interviews per company** (4 total) with questions, responses, scores
- **7 days Attendance** with GPS coordinates (Bangalore for INR, SF for USD)
- **Leave Policies**: 4 types per company (casual, sick, earned, maternity)
- **Leaves**: 5 per company (10 total) with various statuses
- **Payroll Structures**: 1 per company + 3 months of payroll records per employee
- **Goals**: 3 per employee (60 total)
- **Performance Reviews**: 5 per company with review cycles
- **5 Assets per company** (10 total)
- **3 Travel Requests per company** (6 total)
- **5 Expense Claims per company** (10 total)
- **5 Learning Records per company** (10 total)
- **5 Tickets per company** (10 total)
- **5 Helpdesk Tickets per company** (10 total) with comments
- **3 Clients per company** (6 total)
- **3 Vendors per company** (6 total) + 3 SubVendors per company (6 total)
- **5 Documents per company** (10 total)
- **3 Shifts per company** (6 total) with shift members
- **2 Surveys per company** with questions and responses
- **5 Compliance Items per company** (10 total)
- **3 Projects per company** (6 total) with members and milestones
- **8 Tasks per company** (16 total) with assignments and comments
- **5 Onboarding Tasks per company** (10 total)
- **5 Company Policies per company** (10 total)
- **Timesheets**: 1 per employee with 5 daily entries
- **2 Workflows per company** (4 total) with step definitions and instances
- **Notifications**: 5 per user × 6 users (30 total)
- **10 Audit Logs per company** (20 total)
- **3 Manpower Requisitions per company** (6 total)
- **Skills**: 10 per company with employee skill assignments

### 2. Updated `/prisma/seed.ts`
Updated the standalone seed file to match the new comprehensive seed data structure, including:
- Same company codes (MARQ, TCGC)
- Same admin email (admin@marqai.com)
- Same bcrypt hashing (salt rounds 12)
- Same comprehensive data across all modules
- Fixed SubVendor schema (uses `companyName` and `contactPerson` instead of incorrect `name` and `company`)

## Key Fixes from Previous Version
1. SubVendor now uses correct schema fields: `companyName` and `contactPerson` (instead of `name` and `company`)
2. Company code for TechCorp changed from TCG to TCGC as requested
3. Admin email changed from admin@marqai.tech to admin@marqai.com as requested
4. All passwords use bcrypt with salt rounds 12 (instead of 10)
5. Attendance now includes GPS coordinates (latitude/longitude)
6. The endpoint properly deletes ALL existing data before seeding (not incremental)
7. The POST endpoint returns comprehensive summary and log

## Build Verification
- `bun run lint`: No errors from seed-comprehensive/route.ts (all lint errors are pre-existing in other files)
- `npx next build`: Build fails on home page (`Users is not defined` - pre-existing issue), not related to seed endpoint
