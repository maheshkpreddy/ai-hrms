# Task: Fix Company Masters API 500 Error - HRMS Project

## Summary

Fixed the Company Masters API 500 error in the HRMS project by addressing missing API routes, Prisma schema mismatches, and incomplete CRUD support.

## Root Causes Identified

1. **Missing API Routes**: The MasterManagement component defined `apiEndpoint` for 3 entities that had no corresponding route files:
   - `/api/masters/companies` — MISSING (only `/api/companies` existed)
   - `/api/masters/departments` — MISSING (only `/api/departments` existed)
   - `/api/masters/shifts` — MISSING (only `/api/shifts` existed)

2. **Prisma Schema Mismatches**: The `Shift` and `Skill` models were missing fields that the frontend expected:
   - `Shift` was missing: `breakDuration`, `lateMarkRule`, `overtimeEligible`, `weeklyOff`, `isActive`
   - `Skill` was missing: `isActive`, `level`, `certificationRequired`, `companyId`

3. **Missing [id] Routes**: Most master entities lacked individual record routes for PATCH/DELETE operations.

## Changes Made

### Prisma Schema Updates
- **`Shift` model**: Added `breakDuration` (String?), `graceTime` (String?, changed from Int?), `lateMarkRule` (String?), `overtimeEligible` (Boolean), `weeklyOff` (String?), `companyId` (String?), `isActive` (Boolean)
- **`Skill` model**: Added `level` (String?), `certificationRequired` (Boolean), `isActive` (Boolean), `companyId` (String?)

### New API Routes Created
1. `/api/masters/companies/route.ts` — GET (list), POST (create)
2. `/api/masters/companies/[id]/route.ts` — GET, PATCH, DELETE
3. `/api/masters/departments/route.ts` — GET (list), POST (create)
4. `/api/masters/departments/[id]/route.ts` — GET, PATCH, DELETE
5. `/api/masters/shifts/route.ts` — GET (list), POST (create)
6. `/api/masters/shifts/[id]/route.ts` — GET, PATCH, DELETE
7. `/api/masters/designations/[id]/route.ts` — GET, PATCH, DELETE
8. `/api/masters/grades/[id]/route.ts` — GET, PATCH, DELETE
9. `/api/masters/leave-types/[id]/route.ts` — GET, PATCH, DELETE
10. `/api/masters/skills/[id]/route.ts` — GET, PATCH, DELETE
11. `/api/masters/document-types/[id]/route.ts` — GET, PATCH, DELETE

### Updated Existing Routes
- `/api/masters/skills/route.ts` — Updated to handle new `isActive`, `level`, `certificationRequired` fields
- `/api/shifts/route.ts` — Updated to handle new schema fields

### Key Design Decisions
- All routes map frontend field names to Prisma field names (e.g., `status: 'active'` → `isActive: true`, `paidUnpaid: 'paid'` → `isPaid: true`)
- Duplicate code/name checks with 409 responses for uniqueness constraints
- Proper error handling with try/catch and meaningful error messages
- All [id] routes support GET, PATCH, DELETE operations
