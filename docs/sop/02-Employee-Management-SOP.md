# Standard Operating Procedure: Employee Management Module

**Document ID:** SOP-HRMS-02  
**Module Key:** `employees`  
**Version:** 1.0  
**Last Updated:** 2025-03-04  
**Classification:** Internal — HR Operations  

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [Data Flow](#5-data-flow)
6. [Integration with Other Modules](#6-integration-with-other-modules)
7. [Role-Based Access](#7-role-based-access)
8. [Business Rules](#8-business-rules)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Employee Management module serves as the foundational data hub of the AI-HRMS application. It provides a centralized system for creating, reading, updating, and deleting employee records, ensuring that all workforce data is accurately maintained, easily searchable, and securely accessible. This module acts as the single source of truth for employee demographics, employment details, financial information, and organizational relationships. Every other module within the HRMS ecosystem — including Attendance, Leave, Payroll, Performance, Assets, Documents, and Learning & Development — depends on the employee records maintained in this module to function correctly.

The module is designed to support the complete employee lifecycle from onboarding through active employment to exit, providing HR administrators and managers with the tools needed to manage personnel data efficiently while maintaining data integrity through automated validations, audit logging, and cascade operations.

### 1.2 Scope

This SOP covers all operations related to employee and department data management within the AI-HRMS application, including:

- Employee record creation, editing, viewing, and deletion
- Auto-generation of unique employee identifiers
- Search, filter, and sort functionality for employee lists
- Department CRUD operations (Create, Read, Update, Delete)
- Organizational chart visualization
- Integration touchpoints with downstream HRMS modules
- Role-based access controls governing each operation
- Audit logging of all data mutations

Out of scope: User account provisioning (handled by the RBAC module), payroll processing logic, attendance recording, and performance review workflows, although this module stores the foundational data those modules consume.

### 1.3 Target Users

| User Role | Description |
|---|---|
| **Super Admin** | Full system access — can perform all CRUD operations on employees and departments, manage any employee record regardless of department, and configure system-level settings. |
| **HR Admin** | Primary operator of this module — responsible for onboarding new hires, updating employee records, managing department structures, and processing employee exits. Has full read/write access to all employee data. |
| **Department Manager** | Can view employee details for their own department, edit limited fields for their direct reports, and initiate workflows. Cannot create or delete employees. |

### 1.4 Technical Reference

| Property | Value |
|---|---|
| **Component** | `src/components/hrms/EmployeeManagement.tsx` |
| **API — Employees** | `GET/POST /api/employees`, `GET/PUT/DELETE /api/employees/[id]` |
| **API — Departments** | `GET/POST/PATCH/DELETE /api/departments` |
| **Prisma Model — Employee** | 22+ fields with 10 relational associations |
| **Prisma Model — Department** | 5 fields |
| **Database** | PostgreSQL via Prisma ORM |

---

## 2. Access & Navigation

### 2.1 Accessing the Module from the Sidebar

The Employee Management module is accessed through the main navigation sidebar of the AI-HRMS application. The sidebar is present on every page of the application and provides persistent navigation across all modules. Follow these steps to navigate to the Employee Management screen:

1. **Locate the Sidebar:** On desktop viewports (768px and above), the sidebar is fixed on the left side of the screen. On mobile viewports (below 768px), tap the hamburger menu icon (≡) in the top-left corner to open the sidebar as a slide-out drawer.

2. **Identify the Module:** In the sidebar navigation list, find the item labeled **"Employees"** with a Users icon. It is the second item in the navigation, directly below "Dashboard." Unlike AI-powered modules (which display an "AI" badge), the Employees module does not carry the AI indicator.

3. **Click to Navigate:** Click or tap the "Employees" item. The sidebar highlights the active module with an emerald-colored left indicator bar and a tinted background. The main content area transitions to display the Employee Management screen.

4. **Collapsed Sidebar:** If the sidebar is in its collapsed state (showing only icons), hover over the Users icon to reveal a tooltip labeled "Employees," then click to navigate. To expand the sidebar, click the expand button (chevron-right icon) on the sidebar's right edge.

### 2.2 Direct URL Access

Authenticated users with the appropriate role can also access the module directly via the application URL. The module renders as the primary content view when the `activeModule` state in the global Zustand store is set to `"employees"`.

### 2.3 Module Header

Upon entering the module, the screen header displays:

- **Module Title:** "Employee Management" with a Users icon in an emerald-styled container
- **Total Count Badge:** Showing the total number of employees in the system (e.g., "42")
- **Quick Stats:** A subtitle line showing "X active · Y onboarding" counts
- **Search Bar:** A full-text search input for searching by name, email, or employee ID
- **Org Chart Toggle:** A button to show/hide the organizational chart panel
- **Add Employee Button:** A prominent emerald-colored button to initiate employee creation

---

## 3. Screen Descriptions

### 3.1 Employee List Table

The employee list table is the primary view of the module and occupies the main content area. It presents a paginated, filterable, and searchable listing of all employees in the system.

**Table Columns:**

| Column | Description | Visibility |
|---|---|---|
| **Employee** | Displays the employee's avatar initials circle (emerald background with first+last name initials), full name, and email address below. | Always visible |
| **ID** | The auto-generated employee ID (e.g., `EMP001`) displayed in a monospace code badge. | Always visible |
| **Department** | The department name the employee belongs to. | Hidden on screens below `md` (768px) |
| **Designation** | The employee's designation/role title. | Hidden on screens below `lg` (1024px) |
| **Contract Type** | A colored badge indicating contract type — Full-time (emerald), Part-time (sky blue), Contract (amber), Intern (purple). | Hidden on screens below `sm` (640px) |
| **Status** | A colored badge indicating current status — Active (emerald), Inactive (gray), Onboarding (amber), Exited (red). | Always visible |
| **Join Date** | The employee's joining date formatted as DD MMM YYYY (e.g., "15 Jan 2024"). | Hidden on screens below `xl` (1280px) |
| **Actions** | Three icon buttons: View (eye icon, emerald), Edit (pencil icon, amber), Delete (trash icon, red). | Always visible |

**Table Footer:** Displays a summary line "Showing X of Y employees" with the filtered count and total count.

**Empty State:** When no employees match the current search/filter criteria, the table displays a centered empty state with a search icon, "No employees found" message, and a hint to adjust search or filters.

**Loading State:** While data is being fetched, a centered spinner with "Loading employees..." text is displayed. If an error occurs, an error message with a "Retry" button appears.

### 3.2 Filter Bar

The filter bar is contained within a Card component positioned between the header and the table. It provides three filter dropdowns and a clear button:

| Filter | Type | Options |
|---|---|---|
| **Department** | Dropdown select | "All Departments" + all department names fetched from `/api/departments` |
| **Status** | Dropdown select | "All Status", "Active", "Inactive", "Onboarding", "Exited" |
| **Contract Type** | Dropdown select | "All Types", "Full-time", "Part-time", "Contract", "Intern" |

- The Department and Status filters operate server-side (query parameters sent to the API). The Contract Type filter operates client-side since the API does not support it as a query parameter.
- A "Clear" button (with an X icon) appears when any filter is active, resetting all three filters to "All."
- All filters are applied in combination (AND logic). A search query can be used simultaneously with any combination of filters.

### 3.3 Organizational Chart

The org chart is an expandable/collapsible Card panel that visualizes the company's organizational structure:

- **Root Node:** An "Organization" node with an emerald background, Building2 icon, and total employee count badge.
- **Department Nodes:** Expandable nodes for each department, showing department name, Briefcase icon, and employee count badge. Clicking a department node expands/collapses its employee list with a chevron animation.
- **Employee Nodes:** Under each expanded department, employees are listed with their initials avatar, full name, designation, and status badge.
- The org chart data is computed client-side by grouping employees by their `department` field and joining with the departments API data.
- A ScrollArea with a max height of 384px (max-h-96) ensures the chart doesn't overflow the viewport.
- A close button in the chart header allows dismissal.

### 3.4 Employee Detail View (Side Sheet)

Clicking the View (eye) icon on any employee row opens a right-side Sheet panel (max-width: 576px on desktop, full-width on mobile) displaying comprehensive employee information organized into sections:

**Sheet Header:**
- Large initials avatar circle (emerald background)
- Employee full name and designation + employee ID subtitle

**Sections within the Detail View:**

1. **Status & Contract Badges:** Two inline badges showing the employee's current status and contract type.

2. **Personal Information (User icon):**
   - Email (Mail icon)
   - Phone (Phone icon)
   - Date of Birth (Calendar icon)
   - Gender (Shield icon)
   - Address (MapPin icon) — full-width below the 2-column grid

3. **Employment Information (Briefcase icon):**
   - Department (Building2 icon)
   - Designation (Briefcase icon)
   - Job Title (User icon)
   - Join Date (Calendar icon)
   - Contract Type (FileText icon)
   - Reporting To (User icon) — resolves the manager's full name from the `reportingTo` field

4. **Financial Information (IndianRupee icon):**
   - Annual Salary (masked by default as ₹XX,XX,XXX; toggle Show/Hide button)
   - Bank Account (Building2 icon)
   - PAN Number (FileText icon)
   - PF Number (FileText icon)
   - The salary visibility toggle (Eye/EyeOff icons) masks/unmasks the salary figure for privacy.

5. **Assigned Assets (Laptop icon):**
   - Count badge showing number of assigned assets
   - Each asset displayed as a bordered card with: asset icon, asset name, asset type + serial number, and condition badge (new/good/fair)
   - Assets are fetched from `/api/assets?employeeId={id}&status=assigned`
   - Empty state: "No assets assigned" message

6. **Documents (FileText icon):**
   - Count badge showing number of documents
   - Each document displayed as a bordered card with: document icon, document name, type + upload date, and status badge (verified/pending)
   - Documents are fetched from `/api/documents?employeeId={id}`
   - Empty state: "No documents uploaded" message

### 3.5 Add Employee Dialog

Clicking the "Add Employee" button opens a modal Dialog (max-width: 672px, max-height: 85vh) with a tabbed form interface. The dialog title shows "Add New Employee" with a UserPlus icon.

**Form Tabs:**

**Tab 1 — Personal Info:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Employee ID | Text input | Yes (new) / Disabled (edit) | Auto-generated if left blank (e.g., EMP021) |
| First Name | Text input | Yes | — |
| Last Name | Text input | Yes | — |
| Email | Email input | Yes | Must be unique across the system |
| Phone | Text input | Yes | — |
| Date of Birth | Date picker | No | — |
| Gender | Dropdown select | No | Options: Male, Female, Other |
| Address | Text input | No | Full-width (spans 2 columns) |

**Tab 2 — Employment Info:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Department | Dropdown select | Yes | Populated from `/api/departments` |
| Designation | Text input | Yes | e.g., "Software Engineer" |
| Job Title | Text input | No | e.g., "Full Stack Developer" |
| Contract Type | Dropdown select | Yes | Options: Full-time, Part-time, Contract, Intern |
| Join Date | Date picker | Yes | — |
| Reporting To | Dropdown select | No | Lists active full-time employees as potential managers |

**Tab 3 — Financial Info:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Annual Salary (₹) | Number input | No | e.g., 1200000 |
| Bank Account | Text input | No | e.g., XXXX-XXXX-XXXX |
| PAN Number | Text input | No | e.g., ABCDE1234F |
| PF Number | Text input | No | e.g., PF/XXX/YYYY |

**Dialog Footer:**
- **Cancel** button (outline variant) — closes the dialog without saving
- **Add Employee** button (emerald variant) — submits the form. Shows a spinner while saving. On success, the dialog closes, the form resets, the employee list refreshes, and a success toast notification appears.

### 3.6 Edit Employee Dialog

The Edit Employee dialog reuses the same Dialog component as the Add Employee dialog, with these differences:

- **Title:** "Edit Employee" instead of "Add New Employee"
- **Description:** "Update the employee details below." instead of "Fill in the details to add a new employee to the system."
- **Employee ID field:** Disabled (cannot be changed after creation)
- **Form pre-populated:** All form fields are populated with the existing employee's current data
- **Submit button label:** "Save Changes" instead of "Add Employee"
- **API call:** Uses `PUT /api/employees/{id}` instead of `POST /api/employees`
- On successful save, a toast notification confirms the update.

### 3.7 Delete Confirmation Dialog

Clicking the Delete (trash) icon on any employee row opens an AlertDialog confirmation modal:

- **Title:** "Delete Employee"
- **Message:** "Are you sure you want to delete employee {id}? This action cannot be undone. All associated data including attendance records, payroll history, and documents will be permanently removed."
- **Cancel button:** Dismisses the dialog without action
- **Delete button:** Red-styled destructive action button. Shows a spinner while the delete operation is in progress.
- On successful deletion, the dialog closes, the employee list refreshes, and a destructive toast notification confirms the deletion.

### 3.8 Department Management Sub-Section

Departments are managed through the `/api/departments` API endpoint. While the Employee Management module primarily focuses on employee records, the department data is integral to the module because:

- Department names appear in the filter dropdown and the employee form's department selector
- The organizational chart groups employees by department
- Each employee record references a department by name (string field)

**Department Data Model:**

| Field | Type | Required | Unique | Notes |
|---|---|---|---|---|
| id | String (CUID) | Auto | Yes | Primary key |
| name | String | Yes | Yes | Department name |
| head | String | No | No | Name of department head |
| description | String | No | No | Department description |
| budget | Float | No | No | Annual budget allocation |

Department operations are performed via API calls:

- **List:** `GET /api/departments` with optional `search` and pagination parameters
- **Create:** `POST /api/departments` — requires `name`; validates uniqueness; creates audit log
- **Update:** `PATCH /api/departments` — requires `id` in request body; validates name uniqueness on rename; creates audit log
- **Delete:** `DELETE /api/departments?id={id}` — deletes the department; creates audit log

---

## 4. Functional Workflows

### 4.1 Adding a New Employee

**Pre-conditions:** User must have Super Admin or HR Admin role. The Employee Management module must be loaded.

**Steps:**

1. Click the **"Add Employee"** button (emerald, with UserPlus icon) in the module header.
2. The Add Employee dialog opens, defaulting to the **Personal Info** tab.
3. Fill in the **Personal Info** tab:
   - **Employee ID:** Leave blank for auto-generation, or manually enter a unique ID (format: EMP###). If manually entered, ensure it doesn't conflict with existing IDs.
   - **First Name** (required): Enter the employee's first name.
   - **Last Name** (required): Enter the employee's last name.
   - **Email** (required): Enter a unique email address. If the email already exists in the system, the API will return a 409 Conflict error.
   - **Phone** (required): Enter the phone number.
   - **Date of Birth** (optional): Select from the date picker.
   - **Gender** (optional): Select from dropdown.
   - **Address** (optional): Enter the full address.
4. Navigate to the **Employment Info** tab:
   - **Department** (required): Select from the dropdown populated by the departments API.
   - **Designation** (required): Enter the designation (e.g., "Software Engineer").
   - **Job Title** (optional): Enter the job title if different from designation.
   - **Contract Type** (required): Select Full-time, Part-time, Contract, or Intern.
   - **Join Date** (required): Select the joining date.
   - **Reporting To** (optional): Select the reporting manager from the list of active full-time employees.
5. Navigate to the **Financial Info** tab:
   - **Annual Salary** (optional): Enter the CTC in INR.
   - **Bank Account** (optional): Enter the bank account number.
   - **PAN Number** (optional): Enter the PAN card number.
   - **PF Number** (optional): Enter the Provident Fund number.
6. Click **"Add Employee"** to submit.
7. **Processing:** The button shows a loading spinner. The system sends a `POST /api/employees` request.
8. **On Success:** The dialog closes, the form resets to blank, the employee list refreshes to include the new employee, and a success toast appears: "Employee Added — {firstName} {lastName} has been added successfully."
9. **On Error:** An error toast appears with the API error message (e.g., "An employee with this email already exists"). The dialog remains open for corrections.

**Post-conditions:** A new employee record exists in the database with an auto-generated or provided employee ID, status set to "active" by default, and an audit log entry recording the creation.

### 4.2 Editing Employee Information

**Pre-conditions:** User must have Super Admin, HR Admin, or Department Manager role (Department Manager can only edit their own reports). An employee record must exist.

**Steps:**

1. Locate the employee in the list table using search or filters.
2. Click the **Edit** (pencil) icon on the employee's row.
3. The Edit Employee dialog opens with all fields pre-populated with the employee's current data.
4. The **Employee ID** field is disabled and cannot be modified.
5. Modify the desired fields across the three tabs (Personal, Employment, Financial).
6. Click **"Save Changes"** to submit.
7. **Processing:** The system sends a `PUT /api/employees/{id}` request with the modified fields.
8. **On Success:** The dialog closes, the form resets, the employee list refreshes, and a success toast appears: "Employee Updated — {firstName} {lastName} has been updated successfully."
9. **On Error:** An error toast appears. The dialog remains open for corrections.

**Post-conditions:** The employee record is updated in the database, and an audit log entry is created with action "update," recording the employee's name and ID.

### 4.3 Viewing Employee Details with All Relations

**Pre-conditions:** User must have at least read access (any of the three roles).

**Steps:**

1. Locate the employee in the list table.
2. Click the **View** (eye) icon on the employee's row.
3. The employee detail Sheet slides in from the right.
4. The sheet displays the employee's full profile across sections:
   - **Personal Information:** Email, phone, date of birth, gender, address
   - **Employment Information:** Department, designation, job title, join date, contract type, reporting manager name
   - **Financial Information:** Salary (masked by default — click Show/Hide to toggle), bank account, PAN number, PF number
   - **Assigned Assets:** List of assets currently assigned to the employee, fetched from the Assets API with `status=assigned`. Each asset card shows the asset name, type, serial number, and condition badge.
   - **Documents:** List of documents uploaded for the employee, fetched from the Documents API. Each document card shows the document name, type, upload date, and verification status.
5. To close the detail view, click the X button in the sheet header or click outside the sheet.

**Important Notes:**
- The detail view currently displays data from the list endpoint. For the most complete data including all relational records (attendance, leaves, payroll, performance, skills, course enrollments), the system would need to call `GET /api/employees/{id}` which includes all relations.
- The salary field is privacy-protected and displays as masked (₹XX,XX,XXX) by default. The Show/Hide toggle allows authorized viewers to see the actual amount.
- The reporting manager's name is resolved client-side by matching the `reportingTo` field against the employee list.

### 4.4 Deleting an Employee (Cascade)

**Pre-conditions:** User must have Super Admin or HR Admin role. An employee record must exist.

**Steps:**

1. Locate the employee in the list table.
2. Click the **Delete** (trash) icon on the employee's row.
3. A confirmation AlertDialog appears with the warning: "Are you sure you want to delete employee {id}? This action cannot be undone. All associated data including attendance records, payroll history, and documents will be permanently removed."
4. **To confirm:** Click the red **"Delete"** button.
5. **Processing:** The system executes a cascade delete via `DELETE /api/employees/{id}`. Within a single database transaction, the following records are deleted in order:
   - All Attendance records for the employee
   - All Leave records for the employee
   - All Expense records for the employee
   - All Payroll records for the employee
   - All Performance records for the employee
   - All Asset records for the employee
   - All EmployeeSkill records for the employee
   - All CourseEnrollment records for the employee
   - All Document records for the employee
   - All AuditLog records referencing the employee
   - All User accounts linked to the employee
   - The Employee record itself
6. After the transaction completes, a separate audit log entry is created recording the deletion (this is done outside the transaction since the employee foreign key no longer exists).
7. **On Success:** The dialog closes, the employee list refreshes (employee no longer appears), and a destructive toast appears: "Employee Deleted — Employee {id} has been removed."
8. **On Error:** An error toast appears with the failure message. The employee and all related records remain intact (transaction rollback).
9. **To cancel:** Click "Cancel" to dismiss the dialog without deleting.

**Critical Warning:** Cascade deletion is irreversible. All historical data associated with the employee is permanently removed. Consider alternative approaches for employee exits (setting `status` to "exited" and `exitDate` to the departure date) rather than deletion to preserve historical records and maintain data integrity for reporting and compliance purposes.

### 4.5 Searching and Filtering Employees

**Pre-conditions:** The Employee Management module must be loaded.

**Search Functionality:**

1. Locate the search input in the module header (next to the Add Employee button).
2. Type a search query. The system searches server-side across the following fields using case-insensitive partial matching (`contains` with `mode: 'insensitive'`):
   - First Name
   - Last Name
   - Email
   - Employee ID
3. Results update automatically as the search query changes (the `useApi` hook re-fetches when the `search` parameter changes).
4. To clear the search, delete the text in the search input.

**Filter Functionality:**

1. Use the Filter Bar below the module header.
2. **Department Filter:** Select a department from the dropdown. This sends the `department` parameter to the API for server-side filtering.
3. **Status Filter:** Select a status (Active, Inactive, Onboarding, Exited). This sends the `status` parameter to the API for server-side filtering.
4. **Contract Type Filter:** Select a contract type (Full-time, Part-time, Contract, Intern). This filter operates client-side — the API does not support contract type as a query parameter, so the frontend filters the already-fetched employee list.
5. **Combined Filtering:** All active filters and the search query are applied together using AND logic. For example, searching "john" with department "Engineering" and status "Active" returns only active engineering employees named John.
6. **Clear Filters:** Click the "Clear" button (X icon) that appears when any filter is active. This resets all three filters to "All."

**Sorting:** Employee records are returned from the API sorted by `createdAt` in descending order (newest first). Custom column sorting is not currently implemented in the UI.

### 4.6 Managing Departments

**Pre-conditions:** User must have Super Admin or HR Admin role for write operations. Any authenticated user can view departments.

**Listing Departments:**

1. Departments are loaded automatically when the Employee Management module mounts, via `GET /api/departments?limit=100`.
2. The department data populates both the filter dropdown and the form's department selector.
3. Departments are listed with pagination support (default: 10 per page, overridden to 100 in this module).

**Creating a Department:**

1. Submit a `POST /api/departments` request with:
   ```json
   {
     "name": "Engineering",
     "head": "Jane Doe",
     "description": "Product engineering team",
     "budget": 5000000
   }
   ```
2. The API validates that `name` is provided and unique. If a department with the same name exists, a 409 Conflict error is returned.
3. On success, the department is created and an audit log entry is generated.
4. The new department appears in filter dropdowns and employee form selectors after the next data refresh.

**Updating a Department:**

1. Submit a `PATCH /api/departments` request with:
   ```json
   {
     "id": "clx...",
     "name": "Engineering & Platform",
     "budget": 6000000
   }
   ```
2. Only include fields that need to be updated. Omitted fields remain unchanged.
3. If changing the name, the API validates that the new name doesn't conflict with existing departments.
4. On success, an audit log entry is generated.

**Deleting a Department:**

1. Submit a `DELETE /api/departments?id={id}` request.
2. The API validates the department exists. If not found, a 404 error is returned.
3. On success, the department is deleted and an audit log entry is generated.
4. **Caution:** Deleting a department does not automatically update employees who reference that department name. Employees with the deleted department name will display the old name until manually updated.

---

## 5. Data Flow

### 5.1 API Call Patterns

The Employee Management module follows a RESTful API pattern with the following call sequences:

**Employee List Loading:**
```
Frontend (mount) → GET /api/employees?page=1&limit=100
                 → GET /api/departments?limit=100
                 ↓
API validates query → Prisma findMany with where clause
                 ↓
Response: { employees: [...], pagination: { page, limit, total, totalPages } }
```

**Employee Creation:**
```
Frontend (form submit) → POST /api/employees
                       ↓ Body: { firstName, lastName, email, ... }
API validates required fields → Check duplicate email
                       ↓ If duplicate: 409 Conflict
Auto-generate employeeId → EMP### format with uniqueness check
                       ↓
Prisma create → Audit log create
                       ↓
Response: 201 Created with employee object
```

**Employee Update:**
```
Frontend (form submit) → PUT /api/employees/{id}
                       ↓ Body: { firstName, lastName, email, ... }
API validates employee exists → 404 if not found
                       ↓
Prisma update → Audit log create
                       ↓
Response: 200 OK with updated employee object
```

**Employee Deletion (Cascade):**
```
Frontend (confirm) → DELETE /api/employees/{id}
                   ↓
API validates employee exists → 404 if not found
                   ↓
Prisma $transaction([
  deleteMany attendance,
  deleteMany leaves,
  deleteMany expenses,
  deleteMany payroll,
  deleteMany performance,
  deleteMany assets,
  deleteMany employeeSkills,
  deleteMany courseEnrollments,
  deleteMany documents,
  deleteMany auditLogs (by employeeId),
  deleteMany users (by employeeId),
  delete employee
])
                   ↓
Audit log create (outside transaction)
                   ↓
Response: 200 OK { message: "Employee deleted successfully" }
```

**Employee Detail (with relations):**
```
Frontend (view) → GET /api/employees/{id}
               ↓
Prisma findUnique with include:
  - attendance (last 30, ordered by date desc)
  - leaves (all, ordered by createdAt desc)
  - payroll (last 12, ordered by createdAt desc)
  - performance (all, ordered by createdAt desc)
  - expenses (all, ordered by createdAt desc)
  - assets (where status=assigned)
  - skills (include skill details)
  - enrollments (include course details)
  - documents (all)
               ↓
Response: Full employee object with all nested relations
```

### 5.2 Request/Response Formats

**POST /api/employees — Request Body:**

```json
{
  "firstName": "Aarav",
  "lastName": "Sharma",
  "email": "aarav.sharma@company.com",
  "phone": "+91-9876543210",
  "dateOfBirth": "1995-06-15",
  "gender": "Male",
  "address": "123, MG Road, Bangalore, Karnataka 560001",
  "department": "Engineering",
  "designation": "Software Engineer",
  "jobTitle": "Full Stack Developer",
  "contractType": "full-time",
  "joinDate": "2024-01-15",
  "reportingTo": "clxabc123",
  "salary": 1200000,
  "bankAccount": "XXXX-XXXX-1234",
  "panNumber": "ABCPD1234F",
  "pfNumber": "PF/123/456",
  "esiNumber": "ESI-12345",
  "emergencyContact": "+91-9876543211"
}
```

**POST /api/employees — Success Response (201):**

```json
{
  "id": "clxnew123",
  "employeeId": "EMP042",
  "firstName": "Aarav",
  "lastName": "Sharma",
  "email": "aarav.sharma@company.com",
  "status": "active",
  "createdAt": "2025-03-04T10:30:00.000Z",
  "updatedAt": "2025-03-04T10:30:00.000Z",
  ...
}
```

**POST /api/employees — Error Response (409):**

```json
{
  "error": "An employee with this email already exists"
}
```

**GET /api/employees — List Response:**

```json
{
  "employees": [
    {
      "id": "clxabc123",
      "employeeId": "EMP001",
      "firstName": "Priya",
      "lastName": "Patel",
      "email": "priya.patel@company.com",
      "phone": "+91-9876543210",
      "department": "Engineering",
      "designation": "Senior Engineer",
      "jobTitle": "Tech Lead",
      "contractType": "full-time",
      "status": "active",
      "salary": 1800000,
      "joinDate": "2022-03-01",
      "skills": [
        { "id": "clxsk1", "skillId": "clxs1", "proficiency": "expert", "skill": { "id": "clxs1", "name": "React" } }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 42,
    "totalPages": 1
  }
}
```

**PUT /api/employees/{id} — Request Body:**

Same structure as POST, but all fields are optional (only included fields are updated).

**DELETE /api/employees/{id} — Success Response (200):**

```json
{
  "message": "Employee deleted successfully"
}
```

### 5.3 Employee ID Auto-Generation Algorithm

The employee ID is generated server-side with the following logic:

1. If the request body includes an `employeeId`, use it (no auto-generation).
2. If no `employeeId` is provided:
   a. Count the total number of employees: `db.employee.count()`
   b. Generate ID: `EMP${String(count + 1).padStart(3, '0')}` (e.g., count=41 → `EMP042`)
   c. Check if this ID already exists in the database
   d. If it exists, increment the counter and check again in a loop until a unique ID is found
   e. This handles edge cases where employees were deleted, creating gaps in the sequence

---

## 6. Integration with Other Modules

The Employee Management module serves as the central data foundation for nearly every other module in the AI-HRMS system. Understanding these integration points is critical for maintaining data consistency and avoiding orphaned records.

### 6.1 Attendance Module

- **Dependency:** Each Attendance record requires a valid `employeeId` foreign key referencing an Employee.
- **Data Flow:** When an employee checks in/out, the Attendance module creates a record linked to the employee. The employee detail view can display the last 30 attendance records via `GET /api/employees/{id}` with included attendance data.
- **Impact of Employee Deletion:** All attendance records are cascade-deleted when an employee is removed. This is handled within the same database transaction.
- **Reporting:** Attendance reports aggregate data by employee, requiring the employee's department and designation for grouping.

### 6.2 Leave Module

- **Dependency:** Leave requests are tied to an employee via the `employeeId` foreign key.
- **Data Flow:** Leave balances, request history, and approval workflows all reference the employee record. The employee's department determines the approval chain (department manager as default approver).
- **Impact of Employee Deletion:** All leave records are cascade-deleted with the employee.
- **Self-Service Integration:** Employees view their own leave history through the Self-Service module, which queries leave data by employee ID.

### 6.3 Payroll Module

- **Dependency:** Payroll records reference the employee via `employeeId`. The employee's salary, PF number, ESI number, bank account, and PAN number are critical inputs for payroll computation.
- **Data Flow:** The Payroll module reads the employee's `salary` field as the base salary and uses `pfNumber`, `esiNumber`, `bankAccount`, and `panNumber` for statutory deductions and direct deposit processing.
- **Impact of Changes:** Updating an employee's salary or financial details in the Employee Management module does not retroactively modify processed payroll records but will affect future payroll runs.
- **Impact of Employee Deletion:** All payroll records are cascade-deleted, removing historical payroll data.

### 6.4 Performance Module

- **Dependency:** Performance reviews are linked to employees via `employeeId`. The `reportingTo` field on the Employee record determines the default reviewer.
- **Data Flow:** Performance ratings, objectives, feedback, and attrition risk scores are stored per employee. The Performance module may use department and designation data for comparative analytics and calibration.
- **Impact of Employee Deletion:** All performance records are cascade-deleted.

### 6.5 Assets Module

- **Dependency:** Asset assignments reference employees via `employeeId`.
- **Data Flow:** When an asset is assigned to an employee, the Asset record's `employeeId` field is set. The employee detail view displays currently assigned assets (filtered by `status=assigned`).
- **Impact of Employee Deletion:** All asset records are cascade-deleted. **Important:** Before deleting an employee, HR should ensure all physical assets have been returned. The system does not automatically create return records upon employee deletion — the asset records are simply removed.
- **Best Practice:** Before deleting an employee, run an asset audit for that employee and update asset statuses to "returned" in the Assets module first.

### 6.6 Documents Module

- **Dependency:** Document records are linked to employees via `employeeId`.
- **Data Flow:** Documents such as employment contracts, ID proofs, certificates, and policies are uploaded and tagged to specific employees. The employee detail view displays all associated documents.
- **Access Control:** Documents have an `accessLevel` field (public, hr-only, manager, private) that determines who can view them. This integrates with the RBAC module for enforcement.
- **Impact of Employee Deletion:** All document records are cascade-deleted, removing references to stored files. The actual files in storage may remain depending on the file storage configuration.

### 6.7 Skills & Learning Development Module

- **Dependency:** Employee skills are modeled through the `EmployeeSkill` junction table linking employees to skills with proficiency levels. Course enrollments link employees to learning courses.
- **Data Flow:** The employee's skills profile (proficiency levels, certifications) feeds into the Learning & Development module for training recommendations and skill gap analysis. Course enrollment progress and completion records are tracked per employee.
- **Impact of Employee Deletion:** All EmployeeSkill and CourseEnrollment records are cascade-deleted.

### 6.8 RBAC & Security Module

- **Dependency:** The User model has an optional one-to-one relationship with Employee via `employeeId`. When an employee is created, a corresponding User account may or may not be provisioned.
- **Data Flow:** The RBAC module manages role assignments (Super Admin, HR Admin, Department Manager) through the User-Role relationship. The employee's department and reporting structure inform permission scoping — Department Managers can only access data for their direct reports.
- **Impact of Employee Deletion:** Any User account linked to the employee is cascade-deleted within the same transaction, effectively revoking system access.
- **Security Consideration:** Creating an employee record does not automatically create a User account. User provisioning is a separate workflow handled through the RBAC module.

### 6.9 Audit Log Module

- **Dependency:** The AuditLog model references employees optionally via `employeeId`.
- **Data Flow:** Every create, update, and delete operation on employee records generates an audit log entry with the action type, module ("hr"), and a descriptive details string.
- **Impact of Employee Deletion:** Audit logs referencing the deleted employee are cascade-deleted within the transaction. However, a new audit log entry is created after the transaction (without the employee foreign key) to record the deletion event itself.

---

## 7. Role-Based Access

### 7.1 Access Control Matrix

The following matrix defines what each role can do within the Employee Management module:

| Operation | Super Admin | HR Admin | Department Manager |
|---|:---:|:---:|:---:|
| View employee list (all) | ✅ | ✅ | ✅ |
| View employee details (all) | ✅ | ✅ | ✅ |
| View employee details (own dept only) | ✅ | ✅ | ✅ (restricted) |
| Add new employee | ✅ | ✅ | ❌ |
| Edit employee (all fields, all employees) | ✅ | ✅ | ❌ |
| Edit employee (limited fields, own reports) | ✅ | ✅ | ✅ (restricted) |
| Delete employee | ✅ | ✅ | ❌ |
| Search and filter employees | ✅ | ✅ | ✅ |
| View organizational chart | ✅ | ✅ | ✅ |
| Create department | ✅ | ✅ | ❌ |
| Update department | ✅ | ✅ | ❌ |
| Delete department | ✅ | ✅ | ❌ |
| View salary information (unmasked) | ✅ | ✅ | ❌ |
| Export employee data | ✅ | ✅ | ❌ |

### 7.2 Role Descriptions

**Super Admin:**
- Has unrestricted access to all operations in the Employee Management module.
- Can create, read, update, and delete any employee record regardless of department.
- Can manage department structures (create, rename, delete departments).
- Has full visibility into financial information including unmasked salary data.
- Typically reserved for IT administrators and system owners.

**HR Admin:**
- Has the same functional access as Super Admin within the Employee Management module.
- Can perform all CRUD operations on employees and departments.
- This is the primary role for HR personnel who manage the employee database on a daily basis.
- The distinction from Super Admin is in other modules (e.g., system configuration, RBAC settings) where HR Admin may have limited access.

**Department Manager:**
- Can view the employee list and details, but access is restricted to employees within their own department.
- Cannot create new employees or delete existing ones.
- May edit limited fields for their direct reports (e.g., updating a team member's job title or designation) but cannot modify financial information or change the employee's department.
- Cannot view unmasked salary information.
- Can use search, filters, and the organizational chart within their permitted scope.

### 7.3 Front-End Access Control

Currently, the Employee Management component renders all UI elements (Add button, Edit/Delete icons) for all authenticated users. Role-based visibility is enforced at the API level — unauthorized operations will return 403 Forbidden responses. For a production deployment, it is recommended to also hide unauthorized UI elements based on the user's role to improve the user experience and prevent unnecessary API calls.

---

## 8. Business Rules

### 8.1 Auto-Generated Employee IDs

- **Format:** `EMP` followed by a zero-padded 3-digit number (e.g., `EMP001`, `EMP042`, `EMP123`).
- **Generation Trigger:** When a new employee is created via `POST /api/employees` and the `employeeId` field is omitted or empty.
- **Uniqueness Guarantee:** The system first generates `EMP{count+1}` (where count is the total number of employees) and then checks for existing records with that ID. If a collision is found (possible after deletions), the system increments the number in a loop until a unique ID is found.
- **Manual Override:** A specific employee ID can be provided in the request body. The API does not validate the format of manually provided IDs, but the `employeeId` field has a unique constraint in the database, so duplicates will result in a Prisma error.
- **Immutability:** Once created, the employee ID cannot be changed. The Employee ID field is disabled in the Edit dialog.

### 8.2 Unique Email Constraint

- **Rule:** Each employee must have a unique email address across the entire system.
- **Enforcement Point:** The `email` field on the Employee model has a `@unique` constraint in the Prisma schema. Additionally, the `POST /api/employees` endpoint performs an explicit duplicate check before attempting to create the record.
- **Error Handling:** If a duplicate email is submitted, the API returns a 409 Conflict response with the message: "An employee with this email already exists."
- **Case Sensitivity:** Email uniqueness is enforced at the database level. PostgreSQL's default behavior for unique constraints is case-sensitive. The application does not currently normalize email addresses to lowercase, so `John@company.com` and `john@company.com` would be treated as different emails. This should be standardized in a future release.
- **Update Scenario:** When updating an employee, the API does not currently perform a duplicate email check. Changing an employee's email to one that already exists will result in a Prisma unique constraint violation and a 500 error. This should be handled gracefully in a future release.

### 8.3 Cascade Delete Behavior

- **Scope:** When an employee is deleted, all records in the following related models are deleted in a single database transaction:
  - `Attendance` (all records)
  - `Leave` (all records)
  - `Expense` (all records)
  - `Payroll` (all records)
  - `Performance` (all records)
  - `Asset` (all records)
  - `EmployeeSkill` (all records)
  - `CourseEnrollment` (all records)
  - `Document` (all records)
  - `AuditLog` (all records with this employeeId)
  - `User` (all accounts linked to this employeeId)
  - `Employee` (the employee record itself)
- **Transaction Safety:** All deletions are wrapped in a `db.$transaction()` call. If any delete operation fails, the entire transaction is rolled back, and no data is lost.
- **Post-Transaction Audit:** After the transaction completes successfully, a new audit log entry is created outside the transaction (since the employee foreign key no longer exists) recording the deletion event with the employee's name and ID.
- **Recommendation:** Use cascade deletion only for data cleanup in test/staging environments. For production employee exits, set the employee's `status` to "exited" and populate the `exitDate` field. This preserves historical data for compliance, analytics, and audit trail purposes.

### 8.4 Audit Logging

- **Automatic Logging:** All create, update, and delete operations on employees and departments automatically generate audit log entries.
- **Log Structure:**
  - `action`: "create", "update", or "delete"
  - `module`: "hr"
  - `details`: Descriptive text including the employee's name and ID (e.g., "Created employee: Aarav Sharma (EMP042)")
  - `employeeId`: Set to the affected employee's ID (for create and update operations; null for post-deletion audit logs)
- **Read Operations:** Viewing employee details or listing employees does not generate audit logs to avoid excessive logging.
- **Audit Log Deletion on Employee Delete:** Existing audit logs referencing the deleted employee are removed within the cascade transaction. Only the post-deletion audit log entry (recording the deletion itself) survives.
- **Future Enhancement:** Consider implementing field-level change tracking (before/after values) in audit logs for compliance requirements.

### 8.5 Department Name Uniqueness

- **Rule:** Department names must be unique across the system.
- **Enforcement:** The `name` field on the Department model has a `@unique` constraint. The `POST /api/departments` and `PATCH /api/departments` endpoints perform explicit duplicate checks before creating or updating.
- **Error Response:** 409 Conflict with message: "Department with this name already exists."

### 8.6 Default Employee Status

- **Rule:** When a new employee is created, their `status` is set to `"active"` by default if not explicitly provided in the request body.
- **Alternative Onboarding Flow:** For employees still in the onboarding phase, the status should be explicitly set to `"onboarding"` in the creation request. The HR team can then update the status to `"active"` once onboarding is complete.

### 8.7 Reporting Manager Validation

- **Rule:** The `reportingTo` field is optional and stores the CUID of another Employee record.
- **UI Enforcement:** The Add/Edit form only lists active full-time employees as potential managers in the "Reporting To" dropdown.
- **No Circular Reference Check:** The system does not currently validate for circular reporting relationships (e.g., Employee A reports to Employee B who reports to Employee A). This should be validated in a future release.

### 8.8 Salary Masking

- **Rule:** Salary information is displayed in a masked format (₹XX,XX,XXX) by default in the employee detail view.
- **Toggle:** An authorized user can click the Show/Hide toggle to reveal the actual salary amount.
- **Purpose:** Protects sensitive compensation data from casual observation while allowing authorized access when needed.

---

## 9. Troubleshooting

### 9.1 Employee List Not Loading

**Symptom:** The employee table displays a loading spinner indefinitely or shows an error message.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **API server is down** | Check the server logs. Verify the Next.js application is running. Try accessing `/api/employees` directly in the browser. |
| **Database connection failure** | Verify the `DATABASE_URL` environment variable is set correctly. Check that the PostgreSQL database is running and accessible. Run `npx prisma db push` to test connectivity. |
| **Network/CORS issue** | Open browser developer tools (F12) → Network tab. Check for failed requests, CORS errors, or timeout responses. |
| **Large dataset timeout** | If the employee count is very large, the default `limit=100` fetch may time out. Consider implementing server-side pagination with smaller page sizes. |
| **Prisma client not generated** | Run `npx prisma generate` to regenerate the Prisma client. This can happen after schema changes. |

### 9.2 "An employee with this email already exists" Error on Creation

**Symptom:** Attempting to add a new employee fails with a 409 Conflict error.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **Duplicate email** | The email address is already registered to another employee. Search for the email in the employee list to find the existing record. |
| **Case sensitivity issue** | PostgreSQL unique constraints are case-sensitive by default. Check if the same email exists with different casing. Consider normalizing emails to lowercase. |
| **Previous failed creation** | A partially completed employee record may exist. Check the database directly for orphaned records. |

### 9.3 Employee Not Found After Creation

**Symptom:** Employee creation succeeds (toast notification appears) but the new employee doesn't appear in the list.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **Active filter hiding the employee** | Check if any department, status, or contract type filters are active. The new employee may not match the current filter criteria. Click "Clear" to reset all filters. |
| **Search query still active** | Clear the search input to see all employees. |
| **List not refreshed** | The `refetchEmployees()` function should be called after creation. If the list still doesn't refresh, manually reload the page. |
| **Contract type filter (client-side)** | The contract type filter operates client-side. If the API returned the employee with a different `contractType` value than expected, it may be filtered out. |

### 9.4 Delete Operation Fails

**Symptom:** Clicking "Delete" and confirming results in an error toast instead of successful deletion.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **Foreign key constraint** | Although the cascade delete handles all known relations, if a new relation is added to the schema without updating the delete endpoint, the transaction will fail. Check the Prisma schema for any new relations on the Employee model and add corresponding `deleteMany` calls. |
| **Database transaction timeout** | If the employee has a very large number of related records, the transaction may timeout. Check PostgreSQL's `statement_timeout` setting. |
| **Concurrent modification** | If another user modifies or deletes the same employee simultaneously, the operation may fail. Refresh the list and try again. |
| **Insufficient permissions** | Verify the user's role has delete permissions. Check the API middleware for role-based restrictions. |

### 9.5 Department Dropdown Empty in Add/Edit Form

**Symptom:** The Department selector in the Add/Edit Employee form shows no options.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **No departments created** | Create at least one department via `POST /api/departments` before adding employees. |
| **Departments API failing** | Check the browser's Network tab for failed requests to `/api/departments`. |
| **Departments still loading** | The departments list loads asynchronously. Wait for the loading to complete. If the component unmounts and remounts, the fetch is re-triggered. |
| **Data format mismatch** | Ensure the departments API returns objects with `id` and `name` fields. The dropdown uses `id` as the key and `name` as the display value. |

### 9.6 Salary Toggle Not Working

**Symptom:** Clicking the Show/Hide button for salary information doesn't reveal the actual amount.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **Salary is zero or null** | If the employee's salary field is 0 or not set, the masked and unmasked values will both appear similar. Check the raw data. |
| **State not updating** | The `salaryVisible` state toggle should trigger a re-render. Check for React state management issues or component re-mounting. |
| **Formatting function error** | The `formatCurrency` function uses `Intl.NumberFormat('en-IN')`. Ensure the browser supports this locale. |

### 9.7 Org Chart Not Displaying Employees

**Symptom:** The organizational chart shows departments but no employees under them.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **Department name mismatch** | The org chart groups employees by their `department` field (string). If the employee's department string doesn't exactly match the Department model's `name` field, they won't appear under that department node. This is a data consistency issue — ensure employees are assigned to departments using the exact department name. |
| **Empty departments filtered out** | The org chart code filters out departments with zero employees: `.filter((d) => d.employees.length > 0)`. If all employees in a department were deleted, that department won't appear. |
| **Employees still loading** | The org chart depends on both the employees and departments API responses. Wait for both to complete loading. |

### 9.8 Audit Log Not Created After Operation

**Symptom:** An employee or department operation succeeds but no corresponding audit log entry appears.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **Audit log creation failure** | The audit log creation is performed after the main operation but not in the same transaction (for create/update). If the audit log insertion fails, the main operation still succeeds. Check the server logs for Prisma errors on the AuditLog model. |
| **Employee deletion removes audit logs** | The cascade delete for an employee includes `deleteMany auditLogs`. Only the post-deletion audit log (created after the transaction) survives. If you're looking for pre-deletion audit logs, they have been removed. |
| **Database connection issue** | If the database connection drops between the main operation and the audit log creation, the log won't be created. This is a known limitation of the non-transactional audit log pattern. |

### 9.9 Performance Issues with Large Employee Counts

**Symptom:** The employee list loads slowly, search is laggy, or the page becomes unresponsive.

**Possible Causes & Solutions:**

| Cause | Solution |
|---|---|
| **Fetching all employees** | The current implementation fetches up to 100 employees at once. For organizations with thousands of employees, consider implementing proper server-side pagination with smaller page sizes (e.g., 20-50 per page). |
| **Client-side contract filter** | The contract type filter operates on the client side, requiring all employees to be loaded first. Move this filter to the API for better performance. |
| **No debouncing on search** | The search input triggers an API call on every keystroke. Implement debouncing (300-500ms) to reduce API calls during typing. |
| **Org chart rendering** | The org chart computes grouping on every render. For large datasets, memoize the computation more aggressively or implement virtual scrolling. |
| **Too many relational includes** | The `GET /api/employees/{id}` endpoint includes 9 relational models. For detail views with large datasets, consider lazy-loading relations or using separate API calls per tab. |

---

## Appendix A: Employee Data Model Reference

```
Employee {
  id              String    @id @default(cuid())
  employeeId      String    @unique          // Auto-generated EMP###
  firstName       String                     // Required
  lastName        String                     // Required
  email           String    @unique          // Required, unique
  phone           String?                    // Optional
  avatar          String?                    // Optional, URL
  dateOfBirth     String?                    // Optional, ISO date
  gender          String?                    // Optional: Male/Female/Other
  address         String?                    // Optional
  department      String?                    // Optional, department name
  designation     String?                    // Optional
  jobTitle        String?                    // Optional
  contractType    String?                    // Optional: full-time/part-time/contract/intern
  reportingTo     String?                    // Optional, Employee CUID
  joinDate        String?                    // Optional, ISO date
  exitDate        String?                    // Optional, ISO date
  status          String    @default("active") // active/inactive/onboarding/exited
  salary          Float?                     // Optional, annual CTC in INR
  bankAccount     String?                    // Optional
  panNumber       String?                    // Optional
  pfNumber        String?                    // Optional
  esiNumber       String?                    // Optional
  emergencyContact String?                   // Optional
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  attendance      Attendance[]
  leaves          Leave[]
  expenses        Expense[]
  payroll         Payroll[]
  performance     Performance[]
  assets          Asset[]
  skills          EmployeeSkill[]
  enrollments     CourseEnrollment[]
  documents       Document[]
  auditLogs       AuditLog[]
  user            User?
}
```

## Appendix B: Department Data Model Reference

```
Department {
  id          String   @id @default(cuid())
  name        String   @unique             // Required, unique
  head        String?                      // Optional, department head name
  description String?                      // Optional
  budget      Float?                       // Optional, annual budget in INR
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Appendix C: Status & Contract Type Reference

**Employee Status Values:**

| Status | Badge Color | Description |
|---|---|---|
| `active` | Emerald (green) | Currently employed and active in the system |
| `inactive` | Gray | Temporarily inactive (e.g., on sabbatical, suspended) |
| `onboarding` | Amber | Newly hired and going through onboarding process |
| `exited` | Red | No longer with the organization |

**Contract Type Values:**

| Type | Badge Color | Description |
|---|---|---|
| `full-time` | Emerald (green) | Permanent full-time employee |
| `part-time` | Sky blue | Part-time employee with reduced hours |
| `contract` | Amber | Fixed-term contract employee |
| `intern` | Purple | Intern or trainee on a temporary basis |

---

*End of Document — SOP-HRMS-02 v1.0*
