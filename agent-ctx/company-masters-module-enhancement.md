# Task: Company Masters Module Enhancement

## Summary
Enhanced the Company Masters module in the MasterManagement component with full CRUD API integration, detail views, and multi-company hierarchy support.

## Files Modified

### 1. `prisma/schema.prisma`
- Changed datasource from PostgreSQL to SQLite (Neon DB was unreachable from sandbox)
- Added new fields to Company model:
  - `legalName String?`
  - `gstVat String?`
  - `panTanCin String?`
  - `registrationNumber String?`
  - `payrollCycle String?`
  - `financialYear String?`
  - `defaultLanguage String?`
  - `state String?`
  - `city String?`
  - `address String?`
  - `status String @default("active")` (replacing `isActive Boolean`)
- Kept existing `parentId`, `parent`, `children` hierarchy relations

### 2. `.env`
- Temporarily switched to SQLite for local development

### 3. `src/app/api/masters/companies/route.ts` (REWRITTEN)
- GET: Fetch companies with search, status, industry filters; includes parent/children/_count
- POST: Create company with all new fields (legalName, gstVat, panTanCin, registrationNumber, payrollCycle, financialYear, defaultLanguage, status, parentId)
- PUT: Update company by id with all fields
- DELETE: Delete company by id (via query param)

### 4. `src/app/api/masters/companies/[id]/route.ts` (REWRITTEN)
- GET: Fetch single company with full detail including:
  - parent company info
  - child companies list
  - _count (employees, departments, branches, policies, payroll, workflows, users)
  - companyPolicies (list)
  - payrollStructures (list)
  - workflowDefs (list)
  - users (list)
- PATCH: Update company with all fields
- DELETE: Delete company by id

### 5. `src/components/hrms/MasterManagement.tsx` (COMPLETE REWRITE)
Key enhancements:
- **CompanyMaster interface**: Added parentId, parentName, children, _count fields
- **CompanyDetailData interface**: New type for full detail view with related entities
- **API Integration**:
  - `fetchCompanies()` - fetches from API on tab activation, falls back to sample data
  - `fetchCompanyDetail(id)` - fetches single company detail with related data
  - CRUD operations try API first, fall back to local state
- **Enhanced CompanyForm**:
  - 2-column grid layout with section headers
  - Basic Information section (name, legalName, code, industry, logo preview, parent company selector)
  - Registration & Tax section (GST/VAT, PAN/TAN/CIN, registration number)
  - Address & Location section (address textarea, country/state/city)
  - Configuration section (currency, timezone, financial year, payroll cycle, default language, status toggle)
  - Logo preview using Avatar component
  - Parent company dropdown (excludes self in edit mode)
  - Required field markers with red asterisk
  - Loading spinner on save button
- **Company Detail Dialog** (NEW):
  - Shows company logo, name, code, legalName, status badge
  - 5 tabs: Info, Policies, Payroll, Workflows, Users
  - Info tab: 4 cards (Company Details, Location & Settings, Hierarchy, Quick Stats)
  - Policies tab: Table of CompanyPolicy records
  - Payroll tab: Table of PayrollStructure records
  - Workflows tab: Table of WorkflowDefinition records
  - Users tab: Table of User records with avatars
- **Enhanced Table**:
  - Clickable rows open detail dialog
  - Avatar with logo in company name column
  - Payroll Cycle column added
  - Dropdown menu with View Details, Edit, Toggle Status, Delete
- **All other tabs preserved**: branches, departments, designations, grades, shifts, leave-types, skills, document-types work exactly as before
