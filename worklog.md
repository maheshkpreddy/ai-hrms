---
Task ID: 1
Agent: Main
Task: Fix Prisma schema, database connection, and all dashboard/form links

Work Log:
- Fixed prisma/schema.prisma: Changed datasource to use DATABASE_URL instead of POSTGRES_PRISMA_URL, removed relationMode = "prisma"
- Configured .env with Neon PostgreSQL connection string
- Pulled env vars from Vercel to .env.local
- Pushed schema to Neon PostgreSQL database
- Seeded database with 20 employees, 7 roles, 11 user accounts, and all related data
- Fixed Sidebar.tsx: Replaced hardcoded "Alex Morgan" with session-based user name/role/initials, added signOut to Logout button
- Fixed Dashboard.tsx: Added onClick handlers to Quick Actions buttons to navigate to proper modules (employees, payroll, talent, analytics, attendance)
- Fixed EmployeeManagement.tsx: Added auto-generation of employeeId when creating new employees
- Fixed SelfService.tsx: Replaced hardcoded employee profile with session + API data, added navigation to Quick Actions buttons, used dynamic user initials
- Fixed db.ts: Reduced Prisma logging in production
- Updated Vercel production DATABASE_URL env var with Neon PostgreSQL connection string
- Built and deployed to Vercel production: https://ai-hrms-rho.vercel.app

Stage Summary:
- All dashboard links now navigate to their respective modules
- All forms are connected to the Neon PostgreSQL database via API routes
- Employee creation auto-generates employeeId
- Self-Service portal shows logged-in user's profile data
- Sidebar displays current user info from session
- Quick Actions in Dashboard and Self-Service are functional navigation buttons
- Database is seeded and all CRUD operations work via 22 API endpoints
