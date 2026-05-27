# Task: Create API Routes for Master Management and Module Features

## Summary
Created 16 API route files for the HRMS application covering master management, timesheets, exit requests, helpdesk, requisitions, workflows, and vendors.

## Files Created

### Master Management Routes (6 routes)
1. `src/app/api/masters/branches/route.ts` - GET (with companyId filter) + POST for BranchMaster
2. `src/app/api/masters/designations/route.ts` - GET + POST for DesignationMaster
3. `src/app/api/masters/grades/route.ts` - GET + POST for GradeMaster
4. `src/app/api/masters/leave-types/route.ts` - GET + POST for LeaveTypeMaster
5. `src/app/api/masters/skills/route.ts` - GET (with category/search filter) + POST for Skill
6. `src/app/api/masters/document-types/route.ts` - GET (with applicableModule filter) + POST for DocumentTypeMaster

### Module Feature Routes (6 routes)
7. `src/app/api/timesheets/route.ts` - GET (with employeeId, date range filters) + POST for Timesheet
8. `src/app/api/exit-requests/route.ts` - GET (with employeeId, status, exitType filters) + POST for ExitRequest
9. `src/app/api/helpdesk/route.ts` - GET (with status/category/requesterId filters) + POST (auto-generates TK-XXX ticketId) for HelpdeskTicket
10. `src/app/api/requisitions/route.ts` - GET (with companyId, status filters) + POST for ManpowerRequisition
11. `src/app/api/workflows/route.ts` - GET (with type filter) + POST for WorkflowDefinition
12. `src/app/api/vendors/route.ts` - GET (with search, companyId, specialization filters) + POST for Vendor

### Individual Record Routes (4 routes)
13. `src/app/api/masters/branches/[id]/route.ts` - GET + PATCH + DELETE for BranchMaster
14. `src/app/api/helpdesk/[id]/route.ts` - GET (with comments) + PATCH + DELETE for HelpdeskTicket
15. `src/app/api/helpdesk/[id]/comments/route.ts` - GET + POST for HelpdeskTicketComment
16. `src/app/api/exit-requests/[id]/route.ts` - GET + PATCH + DELETE for ExitRequest

## Additional Changes
- Modified `src/lib/db.ts` to include a version-based PrismaClient cache invalidation mechanism, ensuring new Prisma models are picked up after schema changes without manual server restarts.

## Verification
- All 16 routes tested and returning correct responses
- No lint errors in any new files
- Branch CRUD, Helpdesk ticket creation with auto-generated ticketId, and comment posting all verified
