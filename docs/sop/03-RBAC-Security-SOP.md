# SOP-03: RBAC & Security Module

**AI-HRMS Application — Standard Operating Procedure**

| Field | Detail |
|---|---|
| **Document ID** | SOP-HRMS-003 |
| **Module Key** | `rbac` |
| **Version** | 1.0.0 |
| **Effective Date** | 2026-03-04 |
| **Classification** | Internal — Restricted |
| **Owner** | IT Security & HR Admin Team |
| **Review Cycle** | Quarterly |

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [Authentication Flow](#5-authentication-flow)
6. [Authorization Architecture](#6-authorization-architecture)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Security Best Practices](#8-security-best-practices)
9. [Troubleshooting](#9-troubleshooting)
10. [Appendices](#10-appendices)

---

## 1. Module Overview

### 1.1 Purpose

The RBAC (Role-Based Access Control) & Security module serves as the foundational security layer for the entire AI-HRMS application. It governs who can access the system, what actions they are permitted to perform, and maintains a comprehensive, tamper-proof audit trail of all security-relevant events. The module ensures that the principle of least privilege is enforced across every functional domain — from HR administration and payroll processing to attendance tracking and performance management — by mapping every user to a clearly defined role with granular, module-level permissions.

By centralizing authorization logic, this module eliminates ad-hoc permission checks scattered throughout the codebase and provides a single source of truth for access policy. All permission evaluations flow through the RBAC engine, ensuring consistency, auditability, and compliance with organizational security policies and regulatory requirements (e.g., SOC 2, GDPR access-control mandates).

### 1.2 Scope

This SOP covers the complete lifecycle of access control within AI-HRMS, including:

- **Role Lifecycle Management** — Creation, modification, and deactivation of roles and their associated permission sets.
- **Permission Matrix Configuration** — Defining and adjusting the module × action permission grid that governs all user capabilities.
- **User Account Governance** — Provisioning, deprovisioning, role assignment, and activation/deactivation of user accounts.
- **Authentication Operations** — Login, session management, token lifecycle, and logout procedures powered by NextAuth.js.
- **Audit & Compliance** — Generation, storage, querying, and review of audit logs that record every security-relevant action.

Out of scope: Infrastructure-level security (firewalls, TLS termination, DDoS mitigation), third-party SSO integration beyond NextAuth Credentials provider, and physical access controls.

### 1.3 Target Users

| User Category | Typical Role Level | Primary Activities |
|---|---|---|
| Super Admin | Level 0 | Full system configuration, role management, user provisioning, audit review |
| HR Admin | Level 1 | Employee onboarding, role assignment (limited), HR module administration |
| Payroll Specialist | Level 2 | Payroll processing, compensation data access |
| Department Manager | Level 3 | Team-level approvals, attendance review, performance evaluations |
| Recruiter | Level 2 | Candidate management, job posting, interview scheduling |
| L&D Manager | Level 2 | Training program management, learning module configuration |
| Employee | Level 4 | Self-service profile, leave requests, personal data view |

---

## 2. Access & Navigation

### 2.1 Entry Points

The RBAC & Security module is accessible through the following navigation paths within the AI-HRMS application:

1. **Main Sidebar Navigation** — Under the **"Security"** section (visible only to users with `admin` permission on the HR module or Super Admin role):
   - **Roles & Permissions** → Navigates to `src/components/hrms/RBACSecurity.tsx`, which renders the role management and permission matrix interface.
   - **Audit Logs** → Navigates to the audit log viewer sub-view within the same component, accessible via a tab or route parameter.

2. **Direct URL Access**:
   - Role Management: `/settings/rbac/roles`
   - Audit Log Viewer: `/settings/rbac/audit`
   - User Account Management: `/settings/rbac/users`

3. **Quick-Action Shortcuts**:
   - Super Admin dashboard contains a **"Security Overview"** card with quick links to pending role changes, recent audit events, and inactive user accounts.
   - A global search command (Ctrl+K) can locate roles, users, or audit entries by name or ID.

### 2.2 Navigation Guard

All routes under `/settings/rbac/*` are protected by a client-side navigation guard that verifies the authenticated user's JWT session contains a role with `admin`-level permission on the HR module. If the user lacks sufficient privileges, the guard redirects to the dashboard with an "Access Denied" toast notification and logs an unauthorized access attempt to the audit system.

### 2.3 Breadcrumb Trail

Each screen displays a breadcrumb trail for orientation:

```
Home → Settings → Security → Roles & Permissions
Home → Settings → Security → Audit Logs
Home → Settings → Security → User Accounts
```

---

## 3. Screen Descriptions

### 3.1 Role Management UI

The Role Management screen is the primary interface for creating, editing, and deleting roles within the system. It is organized into the following regions:

#### 3.1.1 Role List Panel (Left Sidebar)

- Displays all roles in a scrollable list sorted by **level** (ascending), then alphabetically.
- Each role card shows: role name, level badge (color-coded: red for 0, orange for 1, blue for 2–3, green for 4), user count, and a status indicator (active/inactive).
- A search bar at the top allows filtering roles by name.
- Clicking a role card loads its details in the right panel.
- The **"+ New Role"** button at the bottom opens the role creation form.

#### 3.1.2 Role Detail Panel (Main Area)

When a role is selected, this panel displays:

- **Header Section**: Role name (editable inline), level selector (dropdown 0–4), and description (multi-line text area).
- **Permission Matrix Grid**: A 6 × 5 interactive matrix where rows represent modules (HR, Payroll, Attendance, Performance, Learning, Analytics) and columns represent actions (Read, Write, Modify, Delete, Admin). Each cell is a toggle switch (checked = granted, unchecked = denied). The matrix updates the role's `permissions` JSON in real time.
- **User Assignment Tab**: Lists all users currently assigned to this role, with the ability to reassign or remove users.
- **Danger Zone**: Contains the **"Delete Role"** button, which is disabled if any users are currently assigned to the role. A tooltip explains: "Cannot delete a role with assigned users. Reassign all users first."

#### 3.1.3 Role Creation Form (Modal)

Triggered by the "+ New Role" button, this modal contains:

- **Role Name** (required, text input) — Validated for uniqueness against existing role names on blur. If a duplicate is detected, a red validation message appears immediately.
- **Level** (required, dropdown 0–4) — Defaults to 4 (Employee).
- **Description** (optional, text area) — A brief description of the role's purpose and typical assignees.
- **Permission Matrix** — Pre-populated with all permissions unchecked. The administrator toggles permissions as needed.
- **Actions** — "Cancel" (discards and closes) and "Create Role" (validates and submits via `POST /api/roles`).

### 3.2 Permission Matrix View

The Permission Matrix view provides a consolidated, read-write overview of all roles and their permissions in a single grid. It is designed for administrators who need to compare permission sets across roles or perform bulk permission adjustments.

- **Layout**: Rows = Modules (6), Columns = Actions (5), with one sub-grid per role displayed as a stacked series or in a tabbed layout.
- **Color Coding**: Granted permissions are shown as green checkmarks; denied permissions as grey dashes.
- **Bulk Operations**: Administrators can select multiple roles via checkboxes and apply a permission change to all selected roles simultaneously (e.g., grant "Read" on "Analytics" to all level-3+ roles).
- **Diff View**: When editing a role, a "diff" indicator highlights which permissions have changed from the saved state (yellow for modified, green for new grants, red for revocations).

### 3.3 Audit Log Viewer

The Audit Log viewer is a read-only interface for searching, filtering, and reviewing security-relevant events recorded by the system. It is critical for compliance reviews, incident investigations, and operational monitoring.

#### 3.3.1 Filter Bar (Top)

A horizontal filter bar provides the following filter controls:

| Filter | Type | Description |
|---|---|---|
| Action | Multi-select dropdown | `create`, `read`, `update`, `delete`, `login`, `logout` |
| Module | Multi-select dropdown | `hr`, `payroll`, `attendance`, `performance`, `learning`, `analytics`, `rbac` |
| Employee ID | Text input | Filter by specific employee identifier |
| User ID | Text input | Filter by specific user account identifier |
| Date Range | Date picker (from/to) | Start and end date for the audit period |
| Quick Presets | Button group | "Today", "Last 7 Days", "Last 30 Days", "Last 90 Days" |

All filters are applied via `GET /api/audit` query parameters and are combined with AND logic. The "Clear Filters" button resets all filters to their defaults.

#### 3.3.2 Audit Log Table (Main Area)

A paginated data table displaying audit entries with the following columns:

| Column | Width | Description |
|---|---|---|
| Timestamp | Fixed | ISO 8601 formatted date and time of the event |
| User | Medium | Name and email of the user who performed the action |
| Action | Narrow | Badge indicating the action type (color-coded) |
| Module | Narrow | Badge indicating the affected module |
| Details | Flexible | Free-text description of what occurred |
| IP Address | Medium | Client IP address from which the action originated |

- **Row Expansion**: Clicking a row expands it to show the full `details` payload (JSON formatted), any associated metadata, and a link to the related entity (e.g., the employee record or role that was modified).
- **Pagination**: 50 entries per page by default, adjustable to 25, 100, or 200. Server-side pagination ensures performance with large audit datasets.
- **Export**: An "Export CSV" button generates a downloadable CSV of the currently filtered results (limited to 10,000 rows per export).

#### 3.3.3 Audit Summary Dashboard (Collapsible)

A collapsible panel above the table provides aggregated statistics:

- Total events in the current filter scope.
- Breakdown by action type (pie chart).
- Top 5 most active users (bar chart).
- Events over time (line chart with daily granularity).

---

## 4. Functional Workflows

### 4.1 Creating a New Role with Custom Permissions

**Precondition**: The authenticated user must have `admin` permission on the HR module (typically Super Admin or HR Admin).

**Steps**:

1. Navigate to **Settings → Security → Roles & Permissions**.
2. Click the **"+ New Role"** button in the role list panel. The Role Creation Modal opens.
3. Enter the **Role Name** in the text input. The system performs an asynchronous duplicate-name check against `GET /api/roles?name=<input>`. If the name already exists, a red validation message appears: *"A role with this name already exists. Choose a different name."*
4. Select the **Level** from the dropdown (0–4). Consider the organizational hierarchy:
   - Level 0: Reserved for Super Admin only.
   - Level 1: Senior administrative roles (HR Admin).
   - Level 2: Specialist roles (Payroll, Recruiter, L&D).
   - Level 3: Mid-management (Dept Manager).
   - Level 4: General employee access.
5. Enter an optional **Description** explaining the role's purpose, scope, and typical assignees.
6. Configure the **Permission Matrix** by toggling each module × action cell:
   - Start by granting **Read** access for the modules this role needs to view.
   - Then grant **Write** and **Modify** for modules where data entry or editing is required.
   - Grant **Delete** only for roles that need record removal capability (use sparingly).
   - Grant **Admin** only for roles that need full configuration control over a module.
   - **Tip**: Use an existing role as a reference. Click "Clone from Existing Role" to pre-populate the matrix from another role's permissions, then adjust as needed.
7. Review the configured permissions in the **Summary Preview** at the bottom of the modal, which lists all granted permissions in plain language (e.g., "HR: Read, Write, Modify; Payroll: Read").
8. Click **"Create Role"**. The system sends a `POST /api/roles` request with the following payload:

   ```json
   {
     "name": "Custom Role Name",
     "description": "Description text",
     "level": 3,
     "permissions": "{\"hr\":[\"read\",\"write\"],\"payroll\":[\"read\"],\"attendance\":[\"read\",\"write\",\"modify\"],\"performance\":[\"read\"],\"learning\":[\"read\"],\"analytics\":[\"read\"]}"
   }
   ```

9. On success (HTTP 201), the modal closes, the new role appears in the role list, and an audit log entry is created with action `create`, module `rbac`, and details `"Created role 'Custom Role Name' with level 3"`.
10. On failure (HTTP 400/409/500), an error toast displays the server message. Correct the issue and retry.

**Post-condition**: The new role is persisted in the database and can be assigned to users immediately.

---

### 4.2 Editing Role Permissions

**Precondition**: The authenticated user must have `admin` permission on the HR module. The target role must exist.

**Steps**:

1. Navigate to **Settings → Security → Roles & Permissions**.
2. Select the target role from the **Role List Panel** by clicking its card.
3. The **Role Detail Panel** loads, displaying the current role configuration and permission matrix.
4. To modify the **Role Name** or **Description**, click the inline edit icon next to the field, make changes, and press Enter or click outside the field to save. A `PATCH /api/roles` request is sent with only the changed fields.
5. To modify **Permissions**, toggle the relevant cells in the Permission Matrix grid. Each toggle immediately stages the change (highlighted in yellow as "unsaved").
6. To modify the **Level**, select a new value from the dropdown. A confirmation dialog warns: *"Changing this role's level may affect access for all assigned users. Continue?"*
7. After making all desired changes, click the **"Save Changes"** button in the top-right corner. This sends a `PATCH /api/roles` request with the full updated permissions JSON:

   ```json
   {
     "id": "role-uuid",
     "name": "Updated Role Name",
     "description": "Updated description",
     "level": 2,
     "permissions": "{\"hr\":[\"read\",\"write\",\"modify\"],\"payroll\":[\"read\",\"write\"],\"attendance\":[\"read\"],\"performance\":[\"read\",\"write\"],\"learning\":[\"read\"],\"analytics\":[\"read\",\"write\"]}"
   }
   ```

8. On success (HTTP 200), staged changes are committed, the yellow highlights clear, and an audit log entry records the update with a diff of changed permissions (e.g., `"Updated role 'Dept Manager': granted payroll:write, revoked attendance:modify"`).
9. If you navigate away without saving, a **"Discard unsaved changes?"** dialog appears. Confirming discards all staged changes.

**Important Constraints**:
- The Super Admin role (level 0) permissions cannot be reduced below full admin access on all modules. The UI prevents unchecking any permission for this role.
- A role's level cannot be set to 0 unless the role is already at level 0.
- At least one role must retain `admin` permission on the HR module at all times; the system rejects changes that would leave no administrative role.

---

### 4.3 Deleting a Role (With Constraints)

**Precondition**: The authenticated user must have `admin` permission on the HR module. The target role must exist.

**Steps**:

1. Navigate to **Settings → Security → Roles & Permissions**.
2. Select the target role from the **Role List Panel**.
3. Scroll to the **Danger Zone** section at the bottom of the Role Detail Panel.
4. Click the **"Delete Role"** button.

   **Constraint Check A — Users Assigned**: The system queries for users currently assigned to this role. If any users exist:
   - The button is disabled (greyed out).
   - A warning message displays: *"This role cannot be deleted because [N] user(s) are currently assigned. Reassign all users to another role before deleting."*
   - A "View Assigned Users" link scrolls to the User Assignment Tab, where the administrator can reassign users individually or in bulk to alternative roles.

5. Once all users have been reassigned (user count = 0), the **"Delete Role"** button becomes enabled.
6. Click **"Delete Role"**. A confirmation dialog appears: *"Are you sure you want to permanently delete the role '[Role Name]'? This action cannot be undone."*
7. Type the role name in the confirmation input field to confirm (destructive action safeguard).
8. Click **"Confirm Delete"**. The system sends a `DELETE /api/roles?id=<role-id>` request.

   **Constraint Check B — System Role Protection**: The server verifies that the role is not a built-in system role (Super Admin, HR Admin). If it is, the request is rejected with HTTP 403 and the message: *"System roles cannot be deleted."*

9. On success (HTTP 200), the role is removed from the list, and an audit log entry is created: action `delete`, module `rbac`, details `"Deleted role '[Role Name]' (level [N])"`.
10. On failure, an error toast displays the server message. Investigate and retry.

**Post-condition**: The role is permanently removed from the database. Any references to the role in cached sessions are invalidated on the next request (users who had this role will receive a "Role Not Found" error and be prompted to contact an administrator).

---

### 4.4 Viewing Audit Logs with Filters

**Precondition**: The authenticated user must have `read` permission on the HR module (all admin-level roles and some manager roles have this by default).

**Steps**:

1. Navigate to **Settings → Security → Audit Logs**.
2. By default, the audit log table displays the most recent 50 entries across all actions and modules.
3. To narrow results, use the **Filter Bar**:
   - **Action Filter**: Click the multi-select dropdown and check one or more action types (e.g., `login`, `delete`). Only entries matching any selected action are shown.
   - **Module Filter**: Click the multi-select dropdown and select one or more modules (e.g., `payroll`, `rbac`).
   - **Employee ID**: Type a specific employee ID to see all actions performed by or on behalf of that employee.
   - **User ID**: Type a specific user ID to see all actions performed by that user account.
   - **Date Range**: Click the date picker to select a start and end date. Entries outside this range are excluded.
   - **Quick Presets**: Click "Last 7 Days" to auto-fill the date range to the past week.
4. Click **"Apply Filters"** (or filters apply automatically with a 300ms debounce). The system sends a `GET /api/audit?action=login&module=rbac&employeeId=EMP001&from=2026-01-01&to=2026-03-04` request.
5. Results populate the **Audit Log Table**. Use pagination controls at the bottom to navigate through large result sets.
6. Click any row to **expand** it and view the full details payload, including the complete JSON metadata of the event.
7. To **export** the filtered results, click **"Export CSV"**. A download begins for up to 10,000 rows. If the result set exceeds this limit, a warning advises narrowing the filters.
8. To **clear** all filters and return to the default view, click **"Clear Filters"**.

**Use Cases**:

| Scenario | Recommended Filters |
|---|---|
| Investigating unauthorized access | Action: `login`, `read`; Date Range: incident window |
| Reviewing payroll changes | Module: `payroll`; Action: `update`, `delete` |
| Compliance audit for HR data | Module: `hr`; Date Range: audit quarter |
| Monitoring admin activity | Action: `create`, `update`, `delete`; Level ≤ 1 roles |
| Tracking a specific employee's actions | Employee ID: target ID; Date Range: relevant period |

---

### 4.5 Managing User Accounts and Access

**Precondition**: The authenticated user must have `admin` permission on the HR module.

#### 4.5.1 Creating a New User Account

1. Navigate to **Settings → Security → User Accounts**.
2. Click **"+ New User"**. The User Creation Form opens.
3. Fill in the required fields:
   - **Email** (required, unique) — The user's corporate email address. Validated for format and uniqueness on blur.
   - **Name** (required) — Full display name.
   - **Password** (required, min 8 chars) — Must meet password policy (see Section 8). The password is hashed with bcryptjs (salt rounds: 12) before storage.
   - **Role** (required, dropdown) — Select from active roles. The dropdown shows role name and level.
   - **Employee ID** (optional, unique) — Link to an existing employee record in the HR module. If provided, it must match an existing employee.
   - **Avatar** (optional) — Upload a profile image (accepted: JPG, PNG; max 2MB).
4. Click **"Create User"**. The system creates the user with `isActive: true` and sends a welcome email (if email integration is configured).
5. An audit log entry records: action `create`, module `rbac`, details `"Created user account for [email] with role [Role Name]"`.

#### 4.5.2 Editing User Account

1. Select a user from the **User Accounts** list.
2. Editable fields include: Name, Role, Employee ID, Avatar, and isActive status.
3. Changing a user's **Role** immediately affects their permissions on the next API request (the JWT is re-issued on the next session refresh or forced logout).
4. Click **"Save Changes"** to persist via `PATCH` to the users API. An audit log entry records all changes.

#### 4.5.3 Deactivating a User Account

1. Select a user from the **User Accounts** list.
2. Toggle the **"Active"** switch to **Off**.
3. A confirmation dialog: *"Deactivate user [Name]? They will immediately lose system access."*
4. Confirm. The system sets `isActive: false` and invalidates any active JWT sessions for this user.
5. An audit log entry records: action `update`, module `rbac`, details `"Deactivated user account [email]"`.

#### 4.5.4 Resetting a User's Password

1. Select a user from the **User Accounts** list.
2. Click **"Reset Password"** in the action menu.
3. Enter and confirm the new temporary password (must comply with password policy).
4. Click **"Reset"**. The password hash is updated in the database.
5. The user is prompted to change their password on next login (flagged via a `mustChangePassword` field).
6. An audit log entry records: action `update`, module `rbac`, details `"Password reset for user [email] by admin [admin_email]"`.

---

## 5. Authentication Flow

### 5.1 Overview

The AI-HRMS application uses **NextAuth.js** with the **Credentials provider** for username/password authentication. Sessions are maintained via **JWT tokens** stored in an HTTP-only cookie, with a configurable expiry of **24 hours**. Passwords are hashed using **bcryptjs** with 12 salt rounds before storage.

### 5.2 Detailed Login Flow

The following steps describe the complete authentication sequence from the user opening the login page to accessing a protected resource:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. Login    │────▶│  2. Validate │────▶│  3. Password │────▶│  4. Role     │
│     Page     │     │     Email    │     │     Check    │     │   Resolution │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐           │
│  7. Redirect │◀────│  6. Session  │◀────│  5. JWT      │◀──────────┘
│   to App     │     │    Cookie    │     │   Generated  │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Step-by-Step**:

1. **Login Page Load**: The user navigates to `/auth/login`. NextAuth renders the Credentials sign-in form with email and password fields.

2. **Credential Submission**: The user enters their email and password and clicks "Sign In". NextAuth's Credentials provider invokes the `authorize()` callback defined in `[...nextauth].ts`.

3. **Email Lookup**: The `authorize()` function queries the `User` table by email:
   ```sql
   SELECT * FROM "User" WHERE email = $1 AND "isActive" = true
   ```
   - If no active user is found, authentication fails with error `"Invalid credentials"`.
   - The generic error message prevents email enumeration attacks.

4. **Password Verification**: The retrieved `passwordHash` is compared against the submitted password using bcryptjs:
   ```typescript
   const isValid = await bcrypt.compare(password, user.passwordHash);
   ```
   - If the comparison fails, authentication fails with `"Invalid credentials"`.
   - bcryptjs's constant-time comparison mitigates timing attacks.

5. **JWT Generation**: Upon successful authentication, NextAuth invokes the `jwt()` callback:
   - The JWT payload is constructed with:
     ```json
     {
       "sub": "user-uuid",
       "email": "user@company.com",
       "name": "User Name",
       "roleId": "role-uuid",
       "roleName": "HR Admin",
       "roleLevel": 1,
       "permissions": "{\"hr\":[\"read\",\"write\",\"modify\",\"delete\",\"admin\"],...}",
 
       "iat": 1709539200,
       "exp": 1709625600
     }
     ```
   - The `exp` claim is set to current time + 24 hours (86,400 seconds).
   - The JWT is signed with `NEXTAUTH_SECRET` using HS256.

6. **Session Cookie**: The signed JWT is stored in an HTTP-only, Secure, SameSite=Lax cookie named `__Secure-next-auth.session-token` (production) or `next-auth.session-token` (development).
   - The `lastLoginAt` field on the User record is updated to the current timestamp.

7. **Redirect**: The user is redirected to the application dashboard. The client-side session provider reads the JWT from the cookie and populates the React context with user information.

8. **Audit Log**: An audit entry is created: action `login`, module `rbac`, details `"User user@company.com logged in"`, with the client's IP address.

### 5.3 Session Lifecycle

| Event | Behavior |
|---|---|
| **Session Start** | JWT is issued at login and stored in an HTTP-only cookie |
| **Session Validation** | Every API request middleware decodes the JWT, verifies the signature, and checks `exp` |
| **Session Refresh** | NextAuth's `session()` callback refreshes the JWT if within the refresh window (last 1 hour before expiry) |
| **Session Expiry** | After 24 hours, the JWT expires. The next request triggers a 401, and the client redirects to login |
| **Manual Logout** | Clicking "Sign Out" calls `signOut()`, which clears the session cookie and redirects to login |
| **Forced Logout** | Admin deactivates a user; the middleware rejects the JWT on the next request (based on `isActive: false` check) |

### 5.4 Logout Flow

1. The user clicks **"Sign Out"** from the user menu (or the session expires).
2. NextAuth's `signOut()` function is called, which:
   - Deletes the session cookie.
   - Invalidates the JWT on the client side.
3. An audit log entry is created: action `logout`, module `rbac`, details `"User user@company.com logged out"`.
4. The user is redirected to the login page with a "You have been signed out" message.

### 5.5 Password Storage

- **Hashing Algorithm**: bcryptjs with 12 salt rounds.
- **Never Stored**: Plain-text passwords are never written to the database or logs.
- **Hash Format**: `$2a$12$[22-char salt][31-char hash]`
- **Verification**: Constant-time comparison via `bcrypt.compare()`.

---

## 6. Authorization Architecture

### 6.1 Permission Storage Model

Permissions are stored as a **JSON string** on the `Role` model in the `permissions` field. The JSON structure maps module names to arrays of granted actions:

```json
{
  "hr": ["read", "write", "modify", "delete", "admin"],
  "payroll": ["read", "write"],
  "attendance": ["read", "write", "modify"],
  "performance": ["read"],
  "learning": ["read", "write"],
  "analytics": ["read"]
}
```

**Design Rationale**: Storing permissions as JSON provides maximum flexibility — new modules and actions can be added without schema migrations. The trade-off is that JSON fields are not directly queryable in SQL with type safety; this is mitigated by validating the JSON structure in the API layer and using TypeScript types on the frontend.

### 6.2 Permission Matrix Definition

The complete permission matrix defines 6 modules × 5 actions = 30 permission cells per role:

| Module | Read | Write | Modify | Delete | Admin |
|---|---|---|---|---|---|
| **HR** | View employee records | Create employee records | Edit employee details | Remove employee records | Configure HR settings |
| **Payroll** | View salary data | Process payroll runs | Adjust compensation | Delete payroll records | Configure payroll rules |
| **Attendance** | View attendance logs | Submit attendance | Approve/correct entries | Remove attendance records | Configure attendance policies |
| **Performance** | View reviews | Submit reviews | Edit review outcomes | Remove reviews | Configure review cycles |
| **Learning** | View training catalog | Enroll in courses | Manage course content | Remove courses | Configure L&D programs |
| **Analytics** | View dashboards | Create custom reports | Modify report configs | Delete saved reports | Configure analytics access |

### 6.3 Default Role Permission Assignments

| Role | Level | HR | Payroll | Attendance | Performance | Learning | Analytics |
|---|---|---|---|---|---|---|---|
| Super Admin | 0 | Full | Full | Full | Full | Full | Full |
| HR Admin | 1 | Full | R,W | R,W,M | R,W,M | R,W,M | R,W |
| Payroll Specialist | 2 | R | Full | R | R | R | R,W |
| Dept Manager | 3 | R,W,M | R | R,W,M | R,W,M | R,W | R |
| Employee | 4 | R (self) | R (self) | R,W (self) | R,W (self) | R,W | R |
| Recruiter | 2 | R,W,M | — | R | — | R | R |
| L&D Manager | 2 | R | — | R | R | Full | R,W |

*(Full = Read, Write, Modify, Delete, Admin; R = Read; W = Write; M = Modify; — = No access)*

### 6.4 Permission Evaluation Pipeline

Every API request passes through the following authorization pipeline before reaching the route handler:

```
Request → Middleware (JWT Decode) → Role Fetch → Permission Parse → Action Check → Handler
```

1. **JWT Decode**: The API middleware extracts the JWT from the session cookie, verifies the signature using `NEXTAUTH_SECRET`, and checks the `exp` claim.
2. **User Validation**: The `sub` claim (user ID) is used to fetch the user record. If `isActive` is `false`, the request is rejected with HTTP 401.
3. **Role Fetch**: The user's `roleId` is used to fetch the associated `Role` record from the database.
4. **Permission Parse**: The `permissions` JSON string is parsed into a JavaScript object. If parsing fails (corrupt JSON), all access is denied and an alert is logged.
5. **Action Check**: The middleware checks if the required action for the target module is present in the parsed permissions:
   ```typescript
   function hasPermission(permissions: string, module: string, action: string): boolean {
     const parsed = JSON.parse(permissions);
     return parsed[module]?.includes(action) ?? false;
   }
   ```
6. **Handler Execution**: If the permission check passes, the request proceeds to the route handler. If it fails, HTTP 403 is returned with: `{"error": "Insufficient permissions: requires [module].[action]"}`.

### 6.5 Level-Based Access Rules

In addition to the permission matrix, certain operations enforce level-based checks:

- **Level 0–1 roles** can manage users and roles at their level or below.
- **Level 2–3 roles** cannot modify roles or users above their level.
- **Level 4 roles** have no administrative capabilities.
- A user cannot change their own role or elevate their own permissions.

These checks are enforced in the API route handlers as a secondary authorization layer.

---

## 7. Integration with Other Modules

### 7.1 Overview

The RBAC & Security module is deeply integrated with every other module in the AI-HRMS application. It acts as the gatekeeper that enforces access control policies across the entire system. The following subsections detail the specific integration points.

### 7.2 HR Module

- **Employee Records**: All CRUD operations on employee data require the corresponding permission (`hr:read`, `hr:write`, `hr:modify`, `hr:delete`). The HR Admin and Super Admin have full access; Dept Managers have limited write/modify for their department's employees; Employees have read-only access to their own record.
- **Onboarding/Offboarding**: When a new employee is created via the HR module, the system can optionally auto-create a User account with the "Employee" role (level 4). When an employee is offboarded, their linked User account is automatically deactivated.
- **Department-Level Scoping**: Dept Managers (level 3) are restricted to viewing and managing employees within their own department. This scoping is enforced by the RBAC middleware in combination with department assignment data from the HR module.

### 7.3 Payroll Module

- **Salary Data Access**: The `payroll:read` permission is required to view any compensation data. This is one of the most tightly controlled permissions due to the sensitive nature of salary information.
- **Payroll Processing**: Only roles with `payroll:write` (Payroll Specialist, HR Admin, Super Admin) can initiate payroll runs.
- **Payroll Adjustment**: The `payroll:modify` permission is required for salary revisions, bonus allocations, and tax adjustments. Every payroll modification is logged to the audit trail with the full before/after values.
- **Payslip Access**: Employees can view their own payslips (`payroll:read` scoped to self), while managers cannot view subordinates' payslips unless they also hold a payroll permission.

### 7.4 Attendance Module

- **Clock-In/Out**: All active users with `attendance:write` can submit attendance entries. For employees, this is scoped to their own attendance.
- **Approval Workflow**: Dept Managers with `attendance:modify` can approve, reject, or correct attendance entries for their team members.
- **Policy Configuration**: Only `attendance:admin` holders can configure attendance policies (work hours, grace periods, overtime rules).

### 7.5 Performance Module

- **Review Submission**: Employees with `performance:write` can submit self-assessments. Managers can submit peer reviews for their direct reports.
- **Review Management**: `performance:modify` allows HR Admin and Dept Managers to edit, finalize, or override review outcomes.
- **360-Degree Feedback**: The permission system determines who can initiate, participate in, and view 360-degree feedback cycles.

### 7.6 Learning & Development Module

- **Course Enrollment**: Employees with `learning:write` can enroll in available courses.
- **Content Management**: L&D Managers with `learning:modify` or `learning:admin` can create, edit, and remove course content.
- **Training Records**: `learning:read` allows viewing training histories. Managers can view their team's training records.

### 7.7 Analytics Module

- **Dashboard Access**: `analytics:read` is the baseline requirement for viewing any dashboard. The specific data visible is further scoped by the user's other module permissions (e.g., a Dept Manager sees analytics filtered to their department).
- **Custom Reports**: `analytics:write` allows creating and saving custom reports.
- **Export**: `analytics:modify` is required to modify or share report configurations.
- **Configuration**: `analytics:admin` controls who can access the analytics configuration panel, including data source connections and metric definitions.

### 7.8 Cross-Module Integration Points

| Integration Point | Mechanism | Description |
|---|---|---|
| **API Middleware** | Shared `withAuth()` wrapper | Every API route is wrapped with an authentication/authorization middleware that checks the JWT, resolves the role, and validates permissions |
| **Client-Side Guards** | `usePermission()` hook | React components use a custom hook to conditionally render UI elements based on the current user's permissions |
| **Audit Trail** | Shared `logAudit()` utility | All modules call a centralized audit logging function that writes to the `AuditLog` table with standardized fields |
| **Role-Scoped Queries** | Prisma query filters | Data queries automatically apply role-based filters (e.g., department scoping for managers) via Prisma middleware |
| **Notification System** | Event-driven triggers | RBAC changes (role created, permissions modified, user deactivated) trigger notifications to affected users and relevant administrators |

---

## 8. Security Best Practices

### 8.1 Password Policies

The following password requirements are enforced at both the client and server levels:

| Policy | Requirement |
|---|---|
| **Minimum Length** | 8 characters |
| **Maximum Length** | 128 characters (to prevent bcrypt hash DoS) |
| **Complexity** | At least one uppercase letter, one lowercase letter, one digit, and one special character |
| **History** | Last 5 passwords are stored (hashed) and cannot be reused |
| **Expiry** | Optional; configurable per organization (default: 90 days) |
| **Lockout** | Account locked after 5 consecutive failed attempts for 30 minutes |
| **Must-Change on Reset** | Users must set a new password after an admin-initiated reset |
| **Must-Change on First Login** | New users must change their temporary password on first login |

**Password Validation (Server-Side)**:
```typescript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
```

### 8.2 Session Management

| Practice | Implementation |
|---|---|
| **JWT Expiry** | 24 hours from issuance (configurable via `NEXTAUTH_SESSION_MAX_AGE` env var) |
| **Cookie Security** | HTTP-only, Secure (production), SameSite=Lax |
| **Concurrent Sessions** | A single user can have up to 3 concurrent sessions across devices |
| **Idle Timeout** | After 30 minutes of inactivity, the frontend prompts re-authentication |
| **Absolute Timeout** | Regardless of activity, sessions expire after 24 hours |
| **Session Invalidation** | Deactivating a user or changing their role invalidates active sessions on the next API call |
| **Token Rotation** | JWT is re-signed with a new `iat` and `exp` when the session is refreshed (within the last hour before expiry) |

### 8.3 Audit Trail Integrity

| Practice | Implementation |
|---|---|
| **Immutability** | Audit log entries are INSERT-only; no UPDATE or DELETE operations are permitted on the `AuditLog` table at the database level (enforced via Prisma middleware and database triggers) |
| **Completeness** | All security-relevant actions are logged — including failed login attempts, permission-denied events, and data access (read operations on sensitive modules) |
| **Detail Level** | Each audit entry captures: who (userId, employeeId), what (action, module, details), when (auto-generated timestamp), and where (ipAddress) |
| **Retention** | Audit logs are retained for a minimum of 3 years (configurable). Archival is handled by a scheduled job that moves entries older than the retention period to cold storage |
| **Tamper Detection** | A cryptographic hash chain is maintained across audit entries (each entry includes a hash of the previous entry). Any gap or mismatch indicates potential tampering and triggers a security alert |

### 8.4 API Security

| Practice | Implementation |
|---|---|
| **Rate Limiting** | Login endpoint: 5 attempts per minute per IP. General API: 100 requests per minute per user |
| **Input Validation** | All API inputs are validated with Zod schemas before processing |
| **SQL Injection Prevention** | Prisma ORM uses parameterized queries exclusively |
| **XSS Prevention** | All user-supplied content is sanitized before rendering; React's JSX provides automatic escaping |
| **CSRF Protection** | SameSite cookies + NextAuth's built-in CSRF token |
| **CORS** | Strict origin allowlist; no wildcard origins in production |
| **Error Handling** | Generic error messages in production; detailed errors only in development. No stack traces or internal IDs exposed to clients |

### 8.5 Data Protection

| Practice | Implementation |
|---|---|
| **Encryption at Rest** | Database-level encryption (AES-256) for sensitive fields: `passwordHash`, salary data, personal identifiers |
| **Encryption in Transit** | TLS 1.3 for all client-server and server-database communication |
| **PII Handling** | Personally identifiable information (email, name, employee ID) is only included in API responses when the requester has appropriate permissions |
| **Data Masking** | In audit logs and error messages, sensitive values (passwords, salary figures) are masked (e.g., `"salary": "****"`) |
| **Backup Security** | Database backups are encrypted and stored in access-controlled, geographically redundant storage |

### 8.6 Operational Security

| Practice | Implementation |
|---|---|
| **Environment Secrets** | `NEXTAUTH_SECRET`, database credentials, and API keys are stored in environment variables — never in source code or configuration files committed to version control |
| **Dependency Auditing** | `npm audit` is run on every CI build; critical vulnerabilities block deployment |
| **Access Reviews** | Quarterly access review: administrators verify that all user accounts have appropriate roles and that no dormant accounts remain active |
| **Incident Response** | A documented incident response procedure is triggered when unauthorized access is detected (via audit log anomalies or automated alerts) |

---

## 9. Troubleshooting

### 9.1 Common Issues and Resolutions

#### 9.1.1 "Insufficient permissions" Error (HTTP 403)

**Symptoms**: A user with an apparently correct role receives a 403 error when attempting an action.

**Possible Causes & Resolutions**:

| # | Cause | Resolution |
|---|---|---|
| 1 | The user's JWT contains stale permissions from before a role update | Have the user log out and log back in to receive a fresh JWT with updated permissions |
| 2 | The role's permissions JSON does not include the required action for the target module | Navigate to Roles & Permissions, select the user's role, and verify the permission matrix includes the needed module × action grant |
| 3 | The permissions JSON is malformed or corrupt | Open the role in the admin panel, review the permission toggles (if they appear inconsistent), save the role to rewrite the JSON, or manually correct the JSON in the database |
| 4 | Level-based restriction is blocking the action | Verify the user's role level is sufficient for the operation (e.g., only level 0–1 can manage roles) |

#### 9.1.2 "Invalid credentials" on Login

**Symptoms**: A user with a valid account cannot log in.

**Possible Causes & Resolutions**:

| # | Cause | Resolution |
|---|---|---|
| 1 | Incorrect password | Use the "Forgot Password" flow or have an admin reset the password |
| 2 | Account is deactivated (`isActive: false`) | An admin must reactivate the account via User Accounts management |
| 3 | Account is locked due to failed attempts | Wait 30 minutes for the lockout to expire, or have an admin unlock the account |
| 4 | Email typo or case sensitivity | Verify the exact email address in the User Accounts list; emails are case-sensitive in the lookup query |

#### 9.1.3 "A role with this name already exists"

**Symptoms**: Cannot create a new role because the name conflicts with an existing role.

**Resolution**: The `name` field on the Role model has a `@unique` constraint. Choose a different, descriptive name. If the existing role is obsolete, consider renaming it (e.g., appending "— Deprecated") or deleting it (after reassigning all users).

#### 9.1.4 "Cannot delete role with assigned users"

**Symptoms**: The "Delete Role" button is disabled or the DELETE API returns an error.

**Resolution**: This is an intentional safeguard. To delete the role:
1. Navigate to the role's **User Assignment Tab**.
2. Reassign each user to an alternative role (use bulk reassignment if available).
3. Once the user count reaches 0, the delete button becomes enabled.

#### 9.1.5 Audit Log Not Showing Expected Entries

**Symptoms**: Expected audit entries are missing from the log viewer.

**Possible Causes & Resolutions**:

| # | Cause | Resolution |
|---|---|---|
| 1 | Incorrect filter configuration | Clear all filters and retry. Check that date ranges encompass the expected event time |
| 2 | The action was not logged | Verify that the code path for the action calls `logAudit()`. Check server logs for any `logAudit()` errors |
| 3 | Database write failure | Check the database connection and Prisma logs. Audit entries are written synchronously — a write failure may indicate a database issue |
| 4 | Pagination offset | The event may be on a later page. Increase the page size or navigate to later pages |

#### 9.1.6 JWT Session Not Reflecting Role Changes

**Symptoms**: After an admin changes a user's role, the user still has the old permissions until they log out and back in.

**Cause**: The JWT is issued at login and contains a snapshot of the user's role and permissions. Server-side role changes do not automatically invalidate existing JWTs.

**Resolutions**:
- **Immediate**: Have the user log out and log back in.
- **Systemic**: Implement a JWT invalidation mechanism by storing a `tokenVersion` field on the User model. Increment this version when the role changes. The API middleware checks if the JWT's `tokenVersion` matches the database value; if not, the session is rejected and the user must re-authenticate.

#### 9.1.7 bcrypt Hash Comparison Fails for Valid Password

**Symptoms**: A user enters the correct password but authentication fails.

**Possible Causes & Resolutions**:

| # | Cause | Resolution |
|---|---|---|
| 1 | Password was hashed with a different salt rounds count | Verify that all password hashing uses 12 salt rounds consistently. Check for legacy hashes created with different rounds |
| 2 | Unicode normalization issue | Ensure the password is normalized (NFC) before hashing. Characters like `é` can have multiple Unicode representations |
| 3 | Trailing whitespace | Trim whitespace from password input on the client side, or ensure both hash and compare operations handle whitespace identically |

### 9.2 Diagnostic Commands

The following commands can assist in diagnosing RBAC-related issues:

```bash
# Verify a user's current role and permissions
npx prisma studio
# Navigate to User table → find user → note roleId → navigate to Role table → find role → check permissions JSON

# Check for duplicate role names
npx prisma db execute --stdin <<EOF
SELECT name, COUNT(*) FROM "Role" GROUP BY name HAVING COUNT(*) > 1;
EOF

# Count users per role
npx prisma db execute --stdin <<EOF
SELECT r.name, COUNT(u.id) FROM "Role" r LEFT JOIN "User" u ON u."roleId" = r.id GROUP BY r.name;
EOF

# Recent audit entries for a specific user
npx prisma db execute --stdin <<EOF
SELECT * FROM "AuditLog" WHERE "userId" = 'USER_UUID' ORDER BY id DESC LIMIT 20;
EOF

# Check for inactive users with active sessions
npx prisma db execute --stdin <<EOF
SELECT id, email, "isActive", "lastLoginAt" FROM "User" WHERE "isActive" = false AND "lastLoginAt" > NOW() - INTERVAL '24 hours';
EOF
```

### 9.3 Escalation Path

If an issue cannot be resolved using the steps above, follow this escalation path:

| Level | Contact | Typical Issues |
|---|---|---|
| **L1** | IT Help Desk | Password resets, account lockouts, basic access requests |
| **L2** | HR Admin / System Administrator | Role configuration, permission adjustments, audit log queries |
| **L3** | IT Security Team | Suspected unauthorized access, audit anomalies, JWT/session issues, database-level permission problems |
| **L4** | Development Team | Code bugs, schema migration issues, integration failures, performance problems with permission evaluation |

---

## 10. Appendices

### Appendix A: Permission Matrix Quick Reference

| Permission | Description | Typical Roles |
|---|---|---|
| `hr:read` | View employee records and HR data | All roles |
| `hr:write` | Create new employee records | HR Admin, Super Admin |
| `hr:modify` | Edit existing employee details | HR Admin, Super Admin, Dept Manager (own dept) |
| `hr:delete` | Remove employee records | HR Admin, Super Admin |
| `hr:admin` | Configure HR module settings | HR Admin, Super Admin |
| `payroll:read` | View compensation and payroll data | Payroll Specialist, HR Admin, Super Admin, Employee (self) |
| `payroll:write` | Process payroll runs | Payroll Specialist, HR Admin, Super Admin |
| `payroll:modify` | Adjust compensation and tax settings | Payroll Specialist, HR Admin, Super Admin |
| `payroll:delete` | Delete payroll records | HR Admin, Super Admin |
| `payroll:admin` | Configure payroll rules and policies | HR Admin, Super Admin |
| `attendance:read` | View attendance logs | All roles |
| `attendance:write` | Submit attendance entries | All roles (self), Dept Manager (team) |
| `attendance:modify` | Approve, correct, or override attendance | Dept Manager, HR Admin, Super Admin |
| `attendance:delete` | Remove attendance records | HR Admin, Super Admin |
| `attendance:admin` | Configure attendance policies | HR Admin, Super Admin |
| `performance:read` | View performance reviews | All roles (own), Dept Manager (team), HR Admin |
| `performance:write` | Submit performance reviews | All roles (self-assessment), Dept Manager |
| `performance:modify` | Edit or finalize review outcomes | HR Admin, Super Admin, Dept Manager |
| `performance:delete` | Remove performance reviews | HR Admin, Super Admin |
| `performance:admin` | Configure review cycles and templates | HR Admin, Super Admin |
| `learning:read` | View training catalog and records | All roles |
| `learning:write` | Enroll in or assign courses | Employee, L&D Manager, HR Admin |
| `learning:modify` | Manage course content and structure | L&D Manager, HR Admin, Super Admin |
| `learning:delete` | Remove courses or training records | L&D Manager, HR Admin, Super Admin |
| `learning:admin` | Configure L&D programs and policies | L&D Manager, HR Admin, Super Admin |
| `analytics:read` | View dashboards and reports | All roles (scoped by other permissions) |
| `analytics:write` | Create custom reports | HR Admin, Payroll Specialist, Super Admin |
| `analytics:modify` | Modify report configurations | HR Admin, Super Admin |
| `analytics:delete` | Delete saved reports | HR Admin, Super Admin |
| `analytics:admin` | Configure analytics data sources and access | Super Admin |

### Appendix B: Audit Log Action Codes

| Action Code | Description | Example Detail |
|---|---|---|
| `create` | A new record was created | "Created employee record for John Doe (EMP-042)" |
| `read` | Sensitive data was accessed | "Viewed payroll report for Q4 2025" |
| `update` | An existing record was modified | "Updated role 'Dept Manager': granted analytics:write" |
| `delete` | A record was removed | "Deleted training course 'Advanced Excel'" |
| `login` | A user authenticated to the system | "User jane@company.com logged in from 192.168.1.50" |
| `logout` | A user explicitly signed out | "User jane@company.com logged out" |

### Appendix C: Role Level Hierarchy

```
Level 0 ─── Super Admin        ████  Full system access, can manage all roles and users
  │
Level 1 ─── HR Admin           ███   Manages HR operations, user accounts, and role assignments
  │
Level 2 ─── Payroll Specialist ██    Processes payroll, manages compensation data
  │     ─── Recruiter          ██    Manages recruitment pipeline and candidate data
  │     ─── L&D Manager        ██    Manages training programs and learning content
  │
Level 3 ─── Dept Manager       █     Manages team-level operations within assigned department
  │
Level 4 ─── Employee                 Self-service access only; no administrative capabilities
```

### Appendix D: API Endpoint Summary

| Method | Endpoint | Description | Required Permission |
|---|---|---|---|
| `GET` | `/api/roles` | List all roles with permissions | `hr:read` |
| `POST` | `/api/roles` | Create a new role | `hr:admin` |
| `PATCH` | `/api/roles` | Update role name, description, level, or permissions | `hr:admin` |
| `DELETE` | `/api/roles` | Delete a role (no assigned users) | `hr:admin` |
| `GET` | `/api/audit` | Query audit logs with filters | `hr:read` |

### Appendix E: Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXTAUTH_SECRET` | Secret key for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the application | `https://hrms.company.com` |
| `NEXTAUTH_SESSION_MAX_AGE` | Session expiry in seconds | `86400` (24 hours) |
| `BCRYPT_SALT_ROUNDS` | Number of bcrypt salt rounds | `12` |
| `AUDIT_LOG_RETENTION_DAYS` | Days to retain audit logs | `1095` (3 years) |
| `MAX_LOGIN_ATTEMPTS` | Failed login attempts before lockout | `5` |
| `LOCKOUT_DURATION_MINUTES` | Account lockout duration | `30` |

---

*Document End — SOP-03: RBAC & Security Module v1.0.0*
*Next Review Date: 2026-06-04*
