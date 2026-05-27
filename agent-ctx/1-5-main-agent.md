# Task 1-5: Fix Critical CRUD Issues in AI HRMS Application

## Summary
Fixed all 7 critical CRUD issues in the AI HRMS application, covering employee creation, deletion, payroll processing, expense submission, attendance/leave management, and database connectivity.

## Changes Made

### 1. Prisma Schema (`prisma/schema.prisma`)
- Changed datasource from `postgresql` + `POSTGRES_PRISMA_URL` to `sqlite` + `DATABASE_URL`
- Removed `relationMode = "prisma"` (not needed for SQLite)

### 2. EmployeeManagement.tsx
- **Employee interface**: Added `employeeId: string`, replaced `dob: string` with `dateOfBirth: string`
- **addForm state**: Added `employeeId: ''`, replaced `dob` with `dateOfBirth`
- **handleEdit**: Maps `emp.employeeId` and `emp.dateOfBirth` to form fields
- **handleAddEmployee**: Passes `dateOfBirth` (not `dob`) to API, includes `employeeId`
- **handleAddDialogChange**: Resets with `employeeId` and `dateOfBirth` fields
- **Table display**: Shows `emp.employeeId` (EMP001) instead of `emp.id` (CUID)
- **Detail sheet**: Shows `selectedEmployee.employeeId` instead of `selectedEmployee.id`
- **DOB display**: Uses `selectedEmployee.dateOfBirth` instead of `selectedEmployee.dob`
- **Dialog form**: Added Employee ID input field with auto-generate hint, disabled on edit mode

### 3. Employees API POST (`/api/employees/route.ts`)
- Auto-generates `employeeId` (format: EMP021) when not provided in request body
- Includes uniqueness check by incrementing until a unique ID is found

### 4. Employees API DELETE (`/api/employees/[id]/route.ts`)
- Added cascade delete using `$transaction` for all related records:
  - attendance, leaves, expenses, payroll, performance, assets
  - employeeSkills, courseEnrollments, documents, auditLogs, user
- Audit log for deletion is created after the transaction

### 5. PayrollExpense.tsx
- Added `dbEmployeeId` field to `PayrollRow` interface
- `flattenPayroll`: Sets `dbEmployeeId: r.employeeId` (the CUID from Payroll record)
- `handleProcessPayroll`: Uses `row.dbEmployeeId` for API calls instead of display `employeeId`
- `handleExpenseSubmit`: Fetches first employee from `/api/employees` and uses their database CUID instead of hardcoded `'EMP001'`

### 6. TimeAttendance.tsx
- Added `currentEmployeeDbId` state and fetches first employee from `/api/employees?limit=1`
- `handleMarkAttendance`: Uses `currentEmployeeDbId` instead of `'CURRENT_USER'`
- `handleApplyLeave`: Uses `currentEmployeeDbId` instead of `'CURRENT_USER'`

### 7. Pre-existing fix
- Fixed `page.tsx` lint error: `window.location.href = '/login'` → `window.location.replace('/login')`

## Verification
- `prisma generate` ✅
- `prisma db push` ✅
- `bun run lint` ✅ (0 errors, 0 warnings)
- `bun run db:seed` ✅
