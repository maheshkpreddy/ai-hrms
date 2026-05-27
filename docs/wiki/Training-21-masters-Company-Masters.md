#  🏢 Company Masters — Module Training

> **Module**: Company Masters | **Number**: 21/20 | **AI-Powered**: No

📖 [Back to Wiki Home](https://github.com/maheshkpreddy/ai-hrms/wiki/Home) | 🚀 [Getting Started](https://github.com/maheshkpreddy/ai-hrms/wiki/Getting-Started) | ❓ [FAQ](https://github.com/maheshkpreddy/ai-hrms/wiki/FAQ)

---

## 🎬 Training Video

📽️ **[Watch Training Video](https://github.com/maheshkpreddy/ai-hrms/releases/download/training-videos/21-masters-Company-Masters.mp4)**

> Right-click the link above and select "Save link as..." to download the MP4 video, or click to stream in your browser.

---

## 📋 Module Overview

The Company Masters module is the central hub for managing all master data used across the eh2r AI HRMS platform. Master data includes branches, departments, sub-departments, roles, and employee types — the foundational reference data that powers dropdown lists, filters, and data validation throughout the entire application. Without properly configured master data, modules like Employee Management, Job Portal, and Payroll cannot function correctly because they rely on these values for categorization and classification.

This module provides a tabbed interface with five distinct tabs, each dedicated to a specific category of master data. Administrators can create, edit, and (where appropriate) delete master entries. The data defined here flows automatically into every module that uses dropdown selections, ensuring consistency and eliminating data-entry errors caused by free-text fields.

The Company Masters module is accessible from the sidebar navigation under the **Masters** section. Only Super Admin and HR Admin roles typically have access to this module.

---

## 🔧 Tabs & Features

The Company Masters module is organized into five tabs, each managing a specific type of master data.

### 1. Branches

Manage company branch offices and locations. Branch data is used across the system for employee assignment, attendance tracking, asset allocation, and reporting.

**Fields available:**

| Field | Description | Required |
|-------|-------------|----------|
| Branch Name | The display name of the branch (e.g., "Mumbai Head Office") | Yes |
| Branch Code | A unique short code for the branch (e.g., "MUM-HO") | Yes |
| Address | Full street address of the branch | No |
| City | City where the branch is located | Yes |
| State | State or province | Yes |
| Country | Country of the branch | Yes |
| Pincode | Postal / ZIP code | No |
| Phone | Branch contact phone number | No |
| Email | Branch contact email address | No |

**Steps to add a branch:**
1. Navigate to **Masters** → **Company Masters** from the sidebar
2. Click on the **Branches** tab
3. Click the **Add Branch** button
4. Fill in all required fields (Branch Name, Branch Code, City, State, Country)
5. Optionally provide Address, Pincode, Phone, and Email
6. Click **Save** to create the branch

**How to edit a branch:**
1. Locate the branch in the list (use search or filters if needed)
2. Click the **Edit** (pencil) icon on the branch row
3. Update the desired fields
4. Click **Save** to apply changes

**How to delete a branch:**
1. Locate the branch in the list
2. Click the **Delete** (trash) icon on the branch row
3. Confirm the deletion when prompted

> ⚠️ **Warning**: Deleting a branch that is currently assigned to employees or other records may cause data integrity issues. Always reassign employees before deleting a branch.

---

### 2. Departments

Manage organizational departments such as Engineering, Finance, Human Resources, Marketing, etc. Department data appears in dropdowns across Employee Management, Job Portal, and Reporting modules.

**Fields available:**

| Field | Description | Required |
|-------|-------------|----------|
| Department Name | The display name of the department (e.g., "Engineering") | Yes |
| Department Head | The employee assigned as head of the department | No |
| Description | A brief description of the department's function | No |
| Budget | Allocated annual budget for the department | No |

**Steps to add a department:**
1. Click on the **Departments** tab
2. Click the **Add Department** button
3. Enter the Department Name (required)
4. Optionally assign a Department Head by selecting an employee from the dropdown
5. Add a Description and Budget if applicable
6. Click **Save** to create the department

**How to edit a department:**
1. Locate the department in the list
2. Click the **Edit** (pencil) icon
3. Update the fields as needed
4. Click **Save** to apply changes

---

### 3. Sub-Departments

Create sub-departments that fall under a parent department. This allows for a hierarchical organizational structure — for example, "Frontend Engineering" and "Backend Engineering" as sub-departments under the "Engineering" department.

**Key feature — Linking to Parent Department:**
When creating a sub-department, you must select a parent department from the dropdown. This dropdown is populated from the Departments tab, so departments must be created before sub-departments can be added.

**Steps to add a sub-department:**
1. Click on the **Sub-Departments** tab
2. Click the **Add Sub-Department** button
3. Enter the Sub-Department Name (required)
4. **Select the Parent Department** from the dropdown — this links the sub-department to its parent
5. Add an optional Description
6. Click **Save** to create the sub-department

> 💡 **Tip**: The parent department dropdown is populated from the Departments tab. If you don't see a department in the dropdown, create it first under the Departments tab.

---

### 4. Roles

View and manage user roles within the system, including role name, hierarchy level, dashboard assignment, and associated permissions. Roles control what modules and actions each user can access.

**Fields available:**

| Field | Description | Notes |
|-------|-------------|-------|
| Role Name | Display name of the role | Yes |
| Level | Hierarchy level (higher = more access) | Yes |
| Dashboard Assignment | Which dashboard the role sees on login | Configurable |
| Permissions | Module-level read/write/delete permissions | Configurable |

**Steps to manage roles:**
1. Click on the **Roles** tab
2. View the list of all configured roles
3. Click **Edit** on a role to modify its level, dashboard assignment, or permissions
4. Adjust permissions by toggling access for each module
5. Click **Save** to apply changes

> 🔒 **Important**: System roles (such as Super Admin and HR Admin) are **protected** and cannot be deleted or have their core permissions modified. This prevents accidental lockout or privilege escalation. Custom roles can be fully edited.

---

### 5. Employee Types

Define the employment categories used throughout the system. Employee types appear in dropdowns during employee onboarding, job postings, and reporting filters.

**Pre-defined types include:**
- **Full-Time** — Standard permanent employees
- **Part-Time** — Employees working reduced hours
- **Contract** — Employees on fixed-term contracts
- **Intern** — Temporary internship positions
- **Consultant** — External consultants engaged for specific projects
- **Probation** — Employees currently in their probation period

**Fields available:**

| Field | Description | Required |
|-------|-------------|----------|
| Type Name | Display name (e.g., "Full-Time") | Yes |
| Code | Short unique code (e.g., "FT", "PT", "CON") | Yes |
| Description | Brief explanation of the employment type | No |

**Steps to add an employee type:**
1. Click on the **Employee Types** tab
2. Click the **Add Employee Type** button
3. Enter the Type Name and Code (both required)
4. Add an optional Description
5. Click **Save** to create the employee type

---

## 🔄 How Master Data Flows Across the Application

Master data defined in the Company Masters module is the single source of truth for dropdown values throughout eh2r AI HRMS. Here is how it connects to other modules:

| Master Data | Used In |
|-------------|---------|
| **Branches** | Employee Management (branch assignment), Asset Management (asset location), Attendance (location tracking), Company Management |
| **Departments** | Employee Management (department assignment), Job Portal (job posting department), Project Kanban (team assignment), Reporting |
| **Sub-Departments** | Employee Management (sub-department assignment), Job Portal (detailed job categorization) |
| **Roles** | RBAC & Security (access control), User Management (role assignment), Dashboard (role-based views) |
| **Employee Types** | Employee Management (employment type), Payroll & Expenses (type-based salary rules), Job Portal (job type filtering) |

When a new value is added in Company Masters (e.g., a new branch), it automatically appears in all relevant dropdowns across the application — no additional configuration is needed. Similarly, editing or deactivating a master entry updates all downstream references.

---

## 📝 Step-by-Step Usage Instructions

### Getting Started
1. **Log in** to eh2r AI at [https://ai-hrms-rho.vercel.app](https://ai-hrms-rho.vercel.app) with your credentials
2. **Navigate** to the Company Masters module using the sidebar under the **Masters** section
3. **Select** the appropriate tab for the type of master data you want to manage
4. **Perform** the desired action (add, view, edit, or delete records)
5. **Save** your changes and verify the dropdown values appear correctly in other modules

### Common Actions
- **Add a Branch**: Access via Masters → Company Masters → Branches tab → Add Branch
- **Create a Department**: Access via Masters → Company Masters → Departments tab → Add Department
- **Link a Sub-Department**: Access via Masters → Company Masters → Sub-Departments tab → Select Parent Department
- **Manage Role Permissions**: Access via Masters → Company Masters → Roles tab → Edit Role
- **Add Employee Type**: Access via Masters → Company Masters → Employee Types tab → Add Employee Type

---

## 👤 Role Access

The following roles have access to the Company Masters module:

- **Super Admin**
- **HR Admin**

> 💡 **Note**: The level of access (read, write, modify, delete) varies by role. Super Admins have full access, while HR Admins may have restricted permissions for certain tabs like Roles. Check the [Role Access Matrix](https://github.com/maheshkpreddy/ai-hrms/wiki/Home#role--module-access-matrix) for details.

---

## 💡 Tips & Best Practices

1. **Set up master data before onboarding employees.** Branches, departments, and employee types should be configured before adding employees to ensure proper data association.
2. **Use consistent naming conventions.** For branch codes and employee type codes, use short uppercase abbreviations (e.g., "MUM-HO" for Mumbai Head Office, "FT" for Full-Time) to maintain uniformity.
3. **Create departments before sub-departments.** The sub-department dropdown depends on existing departments, so always create the parent first.
4. **Avoid deleting master data in active use.** Instead of deleting a branch or department that is assigned to employees, consider renaming or marking it inactive to preserve data integrity.
5. **Review role permissions carefully.** When editing custom roles, ensure that the permission set aligns with the user's job responsibilities — over-permissioning is a security risk.
6. **Periodically audit master data.** Review branches, departments, and employee types quarterly to remove duplicates and ensure the organizational structure is up to date.
7. **Document custom employee types.** If you add non-standard employee types, include a clear description so that other administrators understand when to use them.
8. **Keep the hierarchy logical.** When setting role levels, ensure that higher-level roles have at least the same permissions as the roles below them to avoid access gaps.

---

## 📸 Screenshots

*Screenshots will be added here to provide visual guidance for each feature within the Company Masters module.*

| Feature | Screenshot |
|---------|-----------|
| Company Masters - Main View | *[Placeholder: Main module interface showing the tabbed layout]* |
| Branches Tab | *[Placeholder: Branches tab showing the list and add form]* |
| Departments Tab | *[Placeholder: Departments tab with department head assignment]* |
| Sub-Departments Tab | *[Placeholder: Sub-Departments tab showing parent department linking]* |
| Roles Tab | *[Placeholder: Roles tab with permission matrix]* |
| Employee Types Tab | *[Placeholder: Employee Types tab showing predefined types]* |

---

## 🔗 Related Modules

[Company Management](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-03-company-Company-Management) | [Employee Management](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-02-employees-Employee-Management) | [AI Job Portal](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-17-jobportal-AI-Job-Portal) | [RBAC and Security](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-08-rbac-RBAC-and-Security) | [Dashboard](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-01-dashboard-Dashboard)

---

## 📚 Additional Resources

- [Getting Started Guide](https://github.com/maheshkpreddy/ai-hrms/wiki/Getting-Started)
- [FAQ](https://github.com/maheshkpreddy/ai-hrms/wiki/FAQ)
- [Role Training Pages](https://github.com/maheshkpreddy/ai-hrms/wiki/Home#role-training-7-roles)
- [All Training Videos](https://github.com/maheshkpreddy/ai-hrms/wiki/Home#all-training-videos)

---

*eh2r AI — An AI Product of MARQ AI*
