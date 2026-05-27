# Standard Operating Procedure — Payroll & Expenses Module

**AI-HRMS Application**
**Document ID:** SOP-HRMS-06
**Module Key:** `payroll`
**Version:** 1.0
**Effective Date:** 2024-01-15
**Last Reviewed:** 2024-01-15

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [Salary Component Calculation](#5-salary-component-calculation)
6. [Expense Approval Workflow](#6-expense-approval-workflow)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Role-Based Access](#8-role-based-access)
9. [Business Rules](#9-business-rules)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Payroll & Expenses module is a mission-critical component of the AI-HRMS platform responsible for end-to-end payroll processing, employee expense claim management, and tax declaration tracking. It serves as the authoritative system for computing salary components based on the Indian salary structure, managing statutory deductions (Provident Fund, Employee State Insurance, Professional Tax), and facilitating the complete expense reimbursement lifecycle from submission through approval to final reimbursement. The module automates complex salary calculations that would otherwise be error-prone when performed manually, ensuring compliance with Indian labor laws and statutory requirements.

Beyond basic payroll computation, the module provides comprehensive salary breakdowns with visual charts for earnings and deductions, monthly and yearly payroll filtering, bulk payroll processing capabilities, and detailed payslip generation. The expense management subsystem supports multi-category claims (Travel, Accommodation, Equipment, Food) with receipt attachment, a structured approval workflow, and real-time expense trend analytics. The tax declaration feature enables employees to submit investment proofs under various Income Tax Act sections (80C, 80D, HRA Exemption, and Others), with the system automatically estimating tax liability based on the new tax regime slabs. Together, these capabilities ensure that the organization's compensation and reimbursement processes are transparent, auditable, and compliant.

### 1.2 Scope

This SOP covers the following functional areas within the Payroll & Expenses module:

- **Payroll Processing:** Monthly payroll computation for individual employees and bulk processing, including auto-calculation of all salary components (earnings and deductions) based on the Indian salary structure.
- **Salary Component Auto-Calculation:** Automated computation of HRA (40% of basic), DA (10% of basic), PF (12% of basic), ESI (0.75% of gross), Professional Tax (₹200/month), gross pay, total deductions, and net pay with support for manual overrides.
- **Expense Claim Management:** Submission, approval, rejection, and reimbursement of employee expense claims across five categories (Travel, Food, Accommodation, Equipment, Other) with receipt upload capability.
- **Expense Approval Workflow:** Structured state machine for expense lifecycle management (pending → approved → reimbursed, with rejection from pending state), including audit logging for every state transition.
- **Tax Declarations:** Management of employee investment declarations under Sections 80C, 80D, HRA Exemption, and Other Deductions, with proof submission tracking and estimated tax computation.
- **Payroll Analytics:** Summary statistics cards, salary breakdown pie charts, monthly expense trend line charts, and category-wise expense distribution for management decision-making.

### 1.3 Target Users

| User Role | Primary Activities |
|---|---|
| **Super Admin** | Full system access including bulk payroll processing, deletion of payroll/expense records, configuration of salary structure parameters, and audit trail review across all employees |
| **HR Admin** | Process payroll for employees, approve/reject expense claims, process reimbursements, manage tax declarations, view organization-wide payroll and expense data, export reports |
| **Payroll Specialist** | Process individual and bulk payroll, review salary component calculations, manage statutory deduction compliance, generate payslips, and handle payroll corrections |
| **Employee** (via Self-Service) | View own payslips, submit expense claims, track expense claim status, manage tax declarations, upload investment proofs |

---

## 2. Access & Navigation

### 2.1 Navigating to the Module

The Payroll & Expenses module is accessible from the main sidebar navigation within the AI-HRMS application. Users should follow these steps to access the module:

1. Log in to the AI-HRMS application using your credentials (email and password).
2. From the left sidebar, locate and click on the **"Payroll & Expenses"** menu item. The sidebar icon features a banknote/currency symbol for quick visual identification.
3. The module loads with the **Payroll Processing** tab selected by default, displaying the current month's payroll summary and employee payroll records.
4. The header area displays the module title "Payroll & Expenses" along with the subtitle "Manage payroll processing, expense claims & tax declarations" and a live status indicator badge.

### 2.2 Module Layout

The Payroll & Expenses module is organized into three primary tabs, each serving a distinct functional area:

| Tab | Icon | Purpose |
|---|---|---|
| **Payroll Processing** | Banknote | Monthly payroll computation, salary breakdown, payslip generation, and bulk processing |
| **Expense Claims** | Receipt | Expense submission, approval/rejection, reimbursement processing, and expense analytics |
| **Tax Declarations** | ShieldCheck | Investment declarations under IT sections, proof submission tracking, and estimated tax computation |

### 2.3 Component Reference

- **Frontend Component:** `src/components/hrms/PayrollExpense.tsx`
- **API Endpoints:**
  - `GET/POST/PATCH/DELETE /api/payroll` — Payroll CRUD operations + auto-calculation of salary components
  - `GET/POST/PATCH/DELETE /api/expenses` — Expense CRUD operations + approve/reject/reimburse workflow

### 2.4 Prerequisites

- The user must have an active account in the system with a role of Super Admin, HR Admin, or Payroll Specialist to access payroll processing and expense approval features.
- Employee records must exist in the `Employee` model with a valid `salary` field set before payroll can be processed. If the salary field is zero or null, the API returns a `400 Bad Request` error with the message: *"Employee salary is not set. Please update employee salary before processing payroll."*
- The employee's database ID (not the display employee ID) is used for API operations. The system resolves the display ID to the database ID internally when processing from the UI.
- Attendance data for the payroll period should be finalized before payroll processing to ensure accurate salary computations (integration with the Time & Attendance module).

---

## 3. Screen Descriptions

### 3.1 Payroll Processing View

The Payroll Processing tab is the default landing view when users navigate to the Payroll & Expenses module. It provides a comprehensive overview of the organization's monthly payroll status with interactive controls for processing.

**Summary Statistics Row:** Four KPI cards are displayed at the top of the view:

| Card | Color Theme | Description |
|---|---|---|
| Total Payroll | Emerald (Green) | Sum of all gross pay amounts for the selected month/year. Displayed in abbreviated format (e.g., ₹12.5 L for ₹12,50,000 or ₹1.25 Cr for ₹1,25,00,000). Includes a trend indicator showing percentage change vs. last month. |
| Employees Processed | Teal | Count of employees whose payroll status is not "pending" out of the total employee count. Displays as a fraction (e.g., "18/25") with a percentage completion indicator. |
| Pending | Amber (Yellow) | Count of employees with "pending" payroll status for the selected period. Includes an alert indicator noting "Requires attention" when count is greater than zero. |
| Next Pay Date | Cyan | Displays the upcoming scheduled pay date (e.g., "28 Feb") with an "Auto-scheduled" label. This serves as a visual reminder for the payroll processing deadline. |

Each card includes an icon in a colored rounded container, large numeric display, and a gradient accent bar along the bottom edge. During data loading, skeleton placeholders animate in place of the actual values.

**Month/Year Selector + Action Buttons:** Below the stats row, a control bar provides:

- **Month Dropdown:** Select the payroll month from January through December. Defaults to the current month.
- **Year Dropdown:** Select the payroll year (2024, 2023). Defaults to the current year.
- **Process Payroll Button (emerald):** Triggers payroll processing for all pending records in the selected month/year.
- **Process All Button (outline):** Re-processes all payroll records for the selected period regardless of current status.
- **Export to Excel Button (outline):** Exports the current payroll data to a downloadable Excel file for offline review or reporting.

**Payroll Table:** A scrollable data table displaying individual payroll records with the following columns:

| Column | Description |
|---|---|
| Employee | Employee name with avatar initial badge (emerald circle with first letter) and employee ID below |
| Basic Salary | Basic salary amount in INR (₹) format with Indian numbering system (e.g., ₹50,000) |
| HRA | House Rent Allowance component |
| DA | Dearness Allowance component |
| Gross Pay | Total earnings before deductions (basic + HRA + DA + conveyance + medical + bonus) |
| PF | Provident Fund deduction (12% of basic) |
| ESI | Employee State Insurance deduction (0.75% of gross) |
| Tax | Income Tax deduction (computed from tax declarations) |
| Net Pay | Final take-home pay after all deductions, displayed in bold |
| Status | Color-coded badge: Paid (emerald), Processed (amber), Pending (rose) |
| Actions | View breakdown (eye icon), process (play icon), mark as paid (check icon) |

**Empty State:** When no payroll records exist for the selected month/year, the table displays an Indian Rupee icon with the message: *"No payroll records found for [Month] [Year]"* along with a helpful suggestion: *"Try selecting a different month/year or process payroll."*

### 3.2 Salary Breakdown Dialog

Clicking the view action on any payroll row opens the Salary Breakdown dialog, which provides a detailed visual breakdown of the employee's salary for that month. This dialog is essential for reviewing salary computations, verifying deductions, and generating payslips.

**Earnings Section (Left Panel):**

- **Pie Chart:** An interactive donut chart (Recharts PieChart) showing the proportional breakdown of earnings components: Basic Salary, HRA, DA, Conveyance + Medical (combined), and Bonus. Each segment is color-coded using the emerald-centric palette (Emerald, Teal, Amber, Rose, Orange, Cyan).
- **Legend with Values:** Below the chart, each component is listed with its color indicator and exact INR amount, formatted with the Indian numbering system.
- **Gross Pay Total:** A bordered summary line at the bottom showing the total gross pay in emerald text.

**Deductions Section (Right Panel):**

- **Deductions List:** Each deduction component (PF, ESI, Income Tax, Professional Tax) is listed with the amount shown in rose/red text with a minus prefix.
- **Total Deductions:** A bordered summary line showing the total deductions in rose/red text.
- **Net Pay Highlight:** A prominent card with emerald background displaying the final net pay amount in large bold text, making it immediately visible.

**Dialog Actions:**

- **Download Payslip Button:** An emerald-colored button with a download icon that generates and downloads the payslip for the employee. The payslip includes all salary components, deductions, and net pay for the selected month.

**Dialog Header:** Displays the employee name with an Indian Rupee icon, and the subtitle shows the month, year, and employee ID for context.

### 3.3 Expense Claims View

The Expense Claims tab provides a complete interface for submitting, reviewing, and managing employee expense claims. It includes both summary analytics and a detailed claims table.

**Summary Statistics Row:** Four KPI cards provide at-a-glance expense metrics:

| Card | Color Theme | Description |
|---|---|---|
| Total Claims | Emerald (Green) | Sum of all expense claim amounts regardless of status. Includes a month-over-month trend indicator. |
| Approved Amount | Teal | Sum of amounts for claims in "approved" or "reimbursed" status. Represents the total financial liability for approved expenses. |
| Pending Amount | Amber (Yellow) | Sum of amounts for claims in "pending" status. Indicates expenses awaiting review and approval. |
| Rejected Amount | Rose (Red) | Sum of amounts for claims in "rejected" status. Provides visibility into denied claims for trend analysis. |

**Monthly Expense Trend Chart:** A line chart (Recharts LineChart) at the top of the expense section displays the 6-month expense trend. Features include:

- Emerald-colored line with gradient area fill
- X-axis showing month abbreviations (Aug, Sep, Oct, etc.)
- Y-axis showing expense amounts
- Custom tooltip matching the application theme
- Responsive container adapting to all screen sizes
- When API data has fewer than 3 months of history, default trend data is displayed for visual context

**Expense Table:** A scrollable data table displaying individual expense claims:

| Column | Description |
|---|---|
| Employee | Employee name with avatar initial badge and employee ID |
| Category | Color-coded category badge with icon: Travel (emerald/plane), Accommodation (amber/bed), Equipment (cyan/monitor), Food (orange/utensils) |
| Amount | Claim amount in INR format |
| Description | Brief description of the expense |
| Date | Date of the expense in YYYY-MM-DD format |
| Status | Color-coded badge: Approved (emerald), Pending (amber), Rejected (rose), Reimbursed (teal) |
| Approved By | Name of the approver (blank for pending claims) |
| Actions | Approve (emerald thumbs-up), Reject (rose thumbs-down) — visible only for pending claims |

**Submit Expense Button:** A prominent emerald button with a plus icon at the top of the expense section opens the expense submission dialog.

### 3.4 Expense Submission Dialog

The expense submission dialog is a modal form accessed via the "Submit Expense" button. It contains the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| Category | Select dropdown | Yes | Options: Travel, Accommodation, Equipment, Food. Maps to the `category` field in the Expense model. |
| Amount (₹) | Number input | Yes | The expense amount in Indian Rupees. Must be a positive number. |
| Date | Date input | Yes | The date on which the expense was incurred, in YYYY-MM-DD format. |
| Description | Textarea | No | Brief description of the expense. Stored in the `description` field. |
| Upload Receipt | File input | No | Accepts PDF, JPG, PNG files. The uploaded file is stored as the `receiptUrl`. |

**Form Behavior:**

- The Category, Amount, and Date fields are mandatory. The Submit button remains disabled until all three are provided.
- Upon successful submission, the dialog closes, the form resets to blank values, and the expense list refreshes to show the new claim with "Pending" status.
- While the request is in progress, a spinning loader icon replaces the send icon on the Submit button, and the Cancel button is disabled.
- The submitted expense claim automatically enters the `pending` status and routes through the approval workflow.
- The system automatically assigns the current employee's database ID as the `employeeId` for the claim.

### 3.5 Expense Approval View

Managers and HR Admins can review and act upon pending expense claims from the expense table. The approval interface is integrated directly into the expense claims table:

**Pending Claim Actions:**

- Each pending expense claim row displays two action buttons:
  - **Approve (emerald):** Transitions the claim from "pending" to "approved" status.
  - **Reject (rose):** Transitions the claim from "pending" to "rejected" status.
- A loading spinner appears on the action button while the request is processing.
- Once processed, the expense table refreshes and the status badge updates accordingly.

**Approved Claim Actions:**

- Claims in "approved" status display a **Reimburse** action button that transitions the claim to "reimbursed" status, indicating that the payment has been disbursed to the employee.
- The approver's name is recorded in the `approvedBy` field for audit purposes.

**State Transition Validation:**

- Claims in "rejected" status cannot be updated — the API returns a `409 Conflict` with the message: *"Cannot update a rejected expense."*
- Claims in "reimbursed" status cannot be updated — the API returns a `409 Conflict` with the message: *"Cannot update a reimbursed expense."*
- Claims can only be moved to "reimbursed" from the "approved" status — attempting to reimburse a pending claim returns a `409 Conflict` with the message: *"Expense must be approved before it can be reimbursed."*

### 3.6 Tax Declarations View

The Tax Declarations tab enables employees and payroll administrators to manage investment declarations and proof submissions for income tax computation. This is a critical compliance feature for Indian payroll.

**Tax Section Cards:** Four expandable section cards represent the major tax-saving categories:

| Section | Icon | Annual Limit | Description |
|---|---|---|---|
| Section 80C | HandCoins | ₹1,50,000 | Covers PPF, ELSS, Life Insurance, and other qualifying investments |
| Section 80D | HeartPulse | ₹75,000 | Covers Health Insurance premiums for self and parents |
| HRA Exemption | Home | ₹3,00,000 | Covers House Rent Allowance exemption based on rent paid |
| Other Deductions | ReceiptText | ₹50,000 | Covers NPS Contribution, Donations under 80G, and other qualifying deductions |

**Each Section Contains:**

- **Investment Items:** Individual line items showing the investment name, declared amount, and proof submitted amount.
- **Progress Bar:** Visual indicator showing utilization percentage against the section limit.
- **Summary Metrics:** Total declared vs. total proof submitted, with the section limit displayed for reference.

**Tax Computation Panel:** A summary panel at the bottom of the Tax Declarations tab provides:

- **Gross Annual Salary:** The assumed annual gross salary (e.g., ₹15,00,000).
- **Total Declared Deductions:** Sum of all investment declarations across all sections.
- **Total Proofs Submitted:** Sum of all proof-of-investment amounts submitted.
- **Taxable Income:** Calculated as `Gross Salary - Total Declared Deductions` (minimum 0).
- **Estimated Tax:** Computed using the new tax regime slabs:
  - Up to ₹5,00,000: 5% of taxable income
  - ₹5,00,001 to ₹10,00,000: 20% of taxable income
  - Above ₹10,00,000: 30% of taxable income

### 3.7 Summary Charts

The module includes several data visualization components powered by Recharts:

- **Earnings Pie Chart:** Donut chart in the salary breakdown dialog showing the proportional distribution of salary components (Basic, HRA, DA, Conveyance+Medical, Bonus). Uses a 6-color emerald-centric palette with interactive tooltips.
- **Deductions Summary:** Bar-style visualization of PF, ESI, Tax, and Professional Tax in the salary breakdown dialog.
- **Monthly Expense Trend Line Chart:** 6-month trend line showing total expense amounts by month, displayed on the Expense Claims tab. Includes gradient area fill and custom tooltip styling.
- **Tax Utilization Progress Bars:** Multiple progress bars within each tax section card showing declaration utilization against the annual limit.

All charts feature responsive containers that adapt to screen size, custom tooltip styling matching the application theme (popover background, border, rounded corners, shadow), and emerald-centric color schemes that maintain visual consistency across the module.

---

## 4. Functional Workflows

### 4.1 Processing Payroll for an Employee

This workflow describes the end-to-end process for generating a payroll record for a single employee for a given month and year.

```
Payroll Specialist → Selects month/year → Clicks "Process" on employee row
    → POST /api/payroll {employeeId, month, year}
    → API validates required fields (employeeId, month, year)
    → API checks for duplicate payroll (employeeId + month + year)
    → If duplicate: Returns 409 Conflict
    → API fetches employee record
    → API validates employee.salary is set and non-zero
    → If salary not set: Returns 400 Bad Request
    → API auto-calculates salary components (HRA, DA, PF, ESI, etc.)
    → API creates payroll record with status "processed"
    → Audit log created (action: "create", module: "payroll")
    → UI refreshes payroll table
```

**Step-by-step:**

1. Log in as a Super Admin, HR Admin, or Payroll Specialist.
2. Navigate to the **Payroll & Expenses** module from the sidebar.
3. On the Payroll Processing tab, use the **Month** and **Year** dropdowns to select the target payroll period.
4. Review the payroll table to verify the employee does not already have a payroll record for the selected period.
5. Click the **Process** action (play icon) on the employee's row, or click **"Process Payroll"** to process all pending records.
6. The system sends a `POST` request to `/api/payroll` with the payload:
   ```json
   {
     "employeeId": "<database_employee_id>",
     "month": "January",
     "year": 2024
   }
   ```
7. The API validates that:
   - All required fields are provided (employeeId, month, year).
   - No payroll record already exists for this employee for the given month/year (duplicate check).
   - The employee record exists and has a valid, non-zero salary.
8. If validation passes, the API automatically computes all salary components:
   - `hra = basicSalary × 0.4` (40% of basic)
   - `da = basicSalary × 0.1` (10% of basic)
   - `conveyance = 1600` (fixed)
   - `medical = 1250` (fixed)
   - `bonus = 0` (default, can be overridden)
   - `pf = basicSalary × 0.12` (12% of basic)
   - `esi = grossPay × 0.0075` (0.75% of gross)
   - `professionalTax = 200` (fixed)
   - `grossPay = basic + hra + da + conveyance + medical + bonus`
   - `totalDeductions = pf + esi + tax + professionalTax`
   - `netPay = grossPay - totalDeductions`
9. The payroll record is created with `status: "processed"` and an audit log entry is generated.
10. The payroll table and statistics cards refresh to reflect the new record.

### 4.2 Auto-Calculating Salary Components

The system automatically computes all salary components when a payroll record is created or updated. This ensures consistency and eliminates manual calculation errors. The auto-calculation follows the Indian salary structure conventions.

**Creation Flow (POST /api/payroll):**

When creating a payroll record, the API accepts optional override values for each component. If a value is not provided, the system calculates it using the default formula:

```
1. basicSalary = body.basicSalary ?? employee.salary (from Employee record)
2. hra = body.hra ?? round(basicSalary × 0.4)
3. da = body.da ?? round(basicSalary × 0.1)
4. conveyance = body.conveyance ?? 1600
5. medical = body.medical ?? 1250
6. bonus = body.bonus ?? 0
7. grossPay = basicSalary + hra + da + conveyance + medical + bonus
8. pf = body.pf ?? round(basicSalary × 0.12)
9. esi = body.esi ?? round(grossPay × 0.0075)
10. tax = body.tax ?? 0 (computed from tax declarations)
11. professionalTax = body.professionalTax ?? 200
12. totalDeductions = pf + esi + tax + professionalTax
13. netPay = grossPay - totalDeductions
```

**Update Flow (PATCH /api/payroll):**

When updating a payroll record, the API merges the provided values with existing values and recalculates the dependent fields:

```
1. For each component in the update payload, use the new value; otherwise retain the existing value.
2. Recalculate:
   grossPay = basicSalary + hra + da + conveyance + medical + bonus
   totalDeductions = pf + esi + tax + professionalTax
   netPay = grossPay - totalDeductions
3. Update the record with the recalculated values.
4. Create an audit log entry for the update.
```

**Important Notes:**

- The auto-calculation uses `Math.round()` for HRA, DA, PF, and ESI to avoid fractional rupee values.
- The conveyance allowance (₹1,600) and medical allowance (₹1,250) are fixed defaults that can be overridden.
- The Professional Tax is a flat ₹200 per month as per most Indian state regulations.
- Income Tax (`tax` field) defaults to 0 and must be manually set or computed from tax declaration data.

### 4.3 Viewing Payslips

This workflow describes how users can view detailed salary breakdowns and download payslips for processed payroll records.

**Step-by-step:**

1. Navigate to the **Payroll Processing** tab.
2. Select the desired month and year using the dropdown selectors.
3. Locate the employee in the payroll table.
4. Click the **View** action (eye icon) on the employee's payroll row.
5. The **Salary Breakdown** dialog opens, displaying:
   - Employee name, month/year, and employee ID in the header.
   - **Earnings pie chart** showing the proportional distribution of Basic Salary, HRA, DA, Conveyance + Medical, and Bonus.
   - **Earnings legend** with exact amounts for each component.
   - **Gross Pay total** at the bottom of the earnings section.
   - **Deductions list** showing PF, ESI, Income Tax, and Professional Tax with amounts.
   - **Total Deductions** summary.
   - **Net Pay** displayed prominently in a highlighted emerald card.
6. To download the payslip, click the **"Download Payslip"** button at the bottom of the dialog.
7. The system generates a formatted payslip document containing all salary details for the selected month.
8. The payslip can be saved or printed for record-keeping.

**Payslip Contents:**

A generated payslip includes the following information:

| Section | Details |
|---|---|
| Employee Information | Name, Employee ID, Department, Designation |
| Pay Period | Month and Year |
| Earnings | Basic Salary, HRA, DA, Conveyance, Medical, Bonus |
| Gross Pay | Total of all earnings |
| Deductions | PF, ESI, Income Tax, Professional Tax |
| Total Deductions | Sum of all deductions |
| Net Pay | Gross Pay minus Total Deductions |

### 4.4 Submitting Expense Claims

This workflow describes the process for an employee to submit a new expense claim for reimbursement.

```
Employee → Clicks "Submit Expense" → Fills form (category, amount, date, description, receipt)
    → POST /api/expenses {employeeId, category, amount, date, description, receiptUrl}
    → API validates required fields (employeeId, category, amount, date)
    → Expense created with status "pending"
    → Audit log created (action: "create", module: "expense")
    → UI refreshes expense list
```

**Step-by-step:**

1. Navigate to the **Expense Claims** tab.
2. Click the **"Submit Expense"** button (emerald, with Plus icon).
3. The expense submission dialog opens with five fields:
   - **Category:** Select from Travel, Accommodation, Equipment, or Food.
   - **Amount (₹):** Enter the expense amount as a positive number.
   - **Date:** Select the date on which the expense was incurred.
   - **Description:** Type a brief description of the expense (optional but recommended).
   - **Upload Receipt:** Attach a PDF, JPG, or PNG file of the receipt (optional but recommended for faster approval).
4. Click **"Submit."** The button displays a loading spinner (Loader2 animation) while the request processes.
5. The system sends a `POST` request to `/api/expenses` with the employee ID, category, amount, date, description, and receipt URL.
6. The API validates:
   - All required fields are present (employeeId, category, amount, date).
   - The employee record exists.
7. The expense record is created with `status: "pending"`.
8. An audit log entry is recorded (action: "create", module: "expense").
9. The dialog closes, the form resets, and the expense list refreshes with the new claim visible.
10. The claim is now visible to HR Admins and managers for review and approval.

### 4.5 Approving/Rejecting Expenses

This workflow describes how HR Admins and authorized personnel review and approve or reject pending expense claims.

```
HR Admin → Views pending expenses → Clicks Approve/Reject
    → PATCH /api/expenses {id, status: "approved"|"rejected", approvedBy, comments}
    → API validates status transition rules
    → API blocks invalid transitions (409 Conflict)
    → Expense record updated
    → Audit log created (action: "update", module: "expense")
    → UI refreshes
```

**Step-by-step:**

1. Log in as a Super Admin or HR Admin.
2. Navigate to the **Expense Claims** tab.
3. Review the expense table — pending claims display Approve (emerald) and Reject (rose) action buttons.
4. To **approve** a claim:
   a. Click the **Approve** button on the expense claim row.
   b. A loading spinner appears on the button while processing.
   c. The system sends a `PATCH` request to `/api/expenses` with:
      ```json
      {
        "id": "<expense_id>",
        "status": "approved",
        "approvedBy": "HR Admin"
      }
      ```
   d. The API validates the status transition (only "pending" claims can be approved).
   e. If valid, the expense status is updated and an audit log is created.
   f. The expense table refreshes and the status badge changes to "Approved" (emerald).
5. To **reject** a claim:
   a. Click the **Reject** button on the expense claim row.
   b. The system sends a `PATCH` request with `status: "rejected"` and the approver's name.
   c. The API validates the transition and updates the record.
   d. The expense table refreshes and the status badge changes to "Rejected" (rose).
6. If the expense has already been processed (approved, rejected, or reimbursed), the API returns a `409 Conflict` error with an appropriate message:
   - *"Cannot update a rejected expense"* — for rejected claims
   - *"Cannot update a reimbursed expense"* — for reimbursed claims

### 4.6 Processing Reimbursements

This workflow describes the process of disbursing payment for approved expense claims, transitioning them to "reimbursed" status.

```
HR Admin → Views approved expenses → Clicks "Reimburse"
    → PATCH /api/expenses {id, status: "reimbursed", approvedBy, comments}
    → API validates expense is in "approved" status
    → API blocks if not approved (409 Conflict)
    → Expense record updated to "reimbursed"
    → Audit log created (action: "update", module: "expense")
    → UI refreshes
```

**Step-by-step:**

1. Log in as a Super Admin or HR Admin.
2. Navigate to the **Expense Claims** tab.
3. Review the expense table for claims with "Approved" status.
4. Verify that the expense claim is legitimate and the receipt has been attached.
5. Click the **Reimburse** action on the approved expense row.
6. The system sends a `PATCH` request to `/api/expenses` with:
   ```json
   {
     "id": "<expense_id>",
     "status": "reimbursed",
     "approvedBy": "HR Admin",
     "comments": "Reimbursed via bank transfer"
   }
   ```
7. The API validates:
   - The expense exists (returns `404` if not found).
   - The expense is in "approved" status (returns `409` if the expense is pending, rejected, or already reimbursed).
8. If validation passes, the expense status is updated to "reimbursed."
9. An audit log entry is created documenting the reimbursement.
10. The expense table refreshes and the status badge changes to "Reimbursed" (teal).

**Important:** Reimbursement is a terminal state. Once an expense is marked as "reimbursed," it cannot be modified or deleted (for audit compliance). The only way to correct an erroneous reimbursement is to create an adjusting entry or contact the system administrator for a database-level correction.

---

## 5. Salary Component Calculation

### 5.1 Indian Salary Structure Overview

The AI-HRMS Payroll module implements the standard Indian salary structure, which divides compensation into earnings (gross pay components) and deductions (statutory and voluntary). This structure is designed to comply with Indian labor laws including the Employees' Provident Fund and Miscellaneous Provisions Act, 1952, the Employees' State Insurance Act, 1948, and state-level Professional Tax regulations. The module supports auto-calculation of all components while allowing manual overrides for special cases such as negotiated CTC structures, variable pay, or company-specific policies.

The salary structure follows a layered computation model: basic salary serves as the foundation from which most other components are derived. The gross pay is the sum of all earnings before deductions, and the net pay (take-home salary) is what remains after subtracting all statutory and voluntary deductions from the gross pay. This approach ensures transparency in salary computation and enables employees to understand exactly how their take-home pay is calculated.

### 5.2 Earnings Components

The following table details each earnings component, its calculation formula, and its purpose within the Indian salary structure:

| Component | Formula | Default Value | Description |
|---|---|---|---|
| **Basic Salary** | As per employee record | `employee.salary` | The foundational component of the salary structure. All other components are typically derived as percentages of basic. It forms the basis for PF, ESI, and gratuity calculations. |
| **HRA** | `basicSalary × 0.4` (40% of basic) | Auto-calculated | House Rent Allowance provided to employees to offset rental expenses. The 40% rate applies to non-metro cities; metro cities typically use 50%. Tax exemption is available under Section 10(13A) subject to conditions. |
| **DA** | `basicSalary × 0.1` (10% of basic) | Auto-calculated | Dearness Allowance is a cost-of-living adjustment allowance paid to offset the impact of inflation. It is fully taxable and forms part of basic salary for PF and gratuity computation. |
| **Conveyance** | Fixed | ₹1,600/month | Conveyance Allowance is provided to cover commuting expenses between home and workplace. Tax-exempt up to ₹1,600/month under the old tax regime. |
| **Medical** | Fixed | ₹1,250/month | Medical Allowance is provided to cover medical expenses. Tax-exempt up to ₹15,000/year if medical bills are submitted; otherwise fully taxable. |
| **Bonus** | Variable | ₹0 (default) | Performance-based or festive bonus. Can be overridden during payroll processing. Subject to Payment of Bonus Act, 1965 for eligible employees. |

**Gross Pay Formula:**

```
grossPay = basicSalary + hra + da + conveyance + medical + bonus
```

### 5.3 Deduction Components

The following table details each deduction component, its calculation formula, and statutory basis:

| Component | Formula | Default Value | Statutory Basis |
|---|---|---|---|
| **PF** | `basicSalary × 0.12` (12% of basic) | Auto-calculated | Employees' Provident Fund and Miscellaneous Provisions Act, 1952. Both employer (12%) and employee (12%) contribute. The system calculates the employee's share. Employer contribution is separate and not reflected in the employee's net pay. |
| **ESI** | `grossPay × 0.0075` (0.75% of gross) | Auto-calculated | Employees' State Insurance Act, 1948. Applicable to employees with gross salary up to ₹21,000/month. Employee contributes 0.75%; employer contributes 3.25%. |
| **Income Tax** | Variable (from tax declarations) | ₹0 (default) | Income Tax Act, 1961. Computed based on tax regime selection and investment declarations. The system uses the new tax regime slabs as default. |
| **Professional Tax** | Fixed | ₹200/month | State-level tax levied by respective state governments. Varies by state; ₹200/month is the most common rate. Maximum ₹2,500/year. |

**Total Deductions Formula:**

```
totalDeductions = pf + esi + tax + professionalTax
```

### 5.4 Net Pay Calculation

The net pay (take-home salary) is the final amount credited to the employee's bank account after all deductions:

```
netPay = grossPay - totalDeductions
```

### 5.5 Detailed Calculation Example

Consider an employee with a basic salary of ₹50,000 per month:

**Earnings Computation:**

| Component | Calculation | Amount (₹) |
|---|---|---|
| Basic Salary | As per record | 50,000 |
| HRA | 50,000 × 0.40 | 20,000 |
| DA | 50,000 × 0.10 | 5,000 |
| Conveyance | Fixed | 1,600 |
| Medical | Fixed | 1,250 |
| Bonus | Default | 0 |
| **Gross Pay** | **Sum of above** | **77,850** |

**Deductions Computation:**

| Component | Calculation | Amount (₹) |
|---|---|---|
| PF | 50,000 × 0.12 | 6,000 |
| ESI | 77,850 × 0.0075 | 584 |
| Income Tax | From declarations | 0 (default) |
| Professional Tax | Fixed | 200 |
| **Total Deductions** | **Sum of above** | **6,784** |

**Net Pay:**

| | Calculation | Amount (₹) |
|---|---|---|
| **Net Pay** | 77,850 - 6,784 | **71,066** |

### 5.6 PF and ESI Applicability Notes

**Provident Fund (PF):**

- PF is mandatory for establishments with 20 or more employees.
- Both employer and employee contribute 12% of basic salary + DA.
- The system currently calculates only the employee's contribution (12% of basic).
- Of the employer's 12%: 8.33% goes to EPS (Employee Pension Scheme) and 3.67% goes to EPF.
- Employees with basic salary above ₹15,000 can opt out of PF at the time of joining if they have no existing PF account.
- The PF wage ceiling is ₹15,000/month for mandatory coverage, but organizations may calculate PF on actual basic.

**Employee State Insurance (ESI):**

- ESI is applicable to employees with gross monthly salary ≤ ₹21,000.
- Employee contribution: 0.75% of gross salary.
- Employer contribution: 3.25% of gross salary.
- The system calculates only the employee's share (0.75% of gross).
- Employees earning above ₹21,000/month are exempt from ESI; the system still calculates it by default and it should be manually set to 0 for exempt employees.
- ESI contribution periods: April–September and October–March.

---

## 6. Expense Approval Workflow

### 6.1 State Machine Diagram

The expense claim lifecycle follows a strict state machine with defined transitions. No backward transitions are allowed, ensuring audit integrity and compliance with financial record-keeping requirements.

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
              ┌──────────┐    Approve     ┌──────────┐│
              │          │───────────────▶│          ││
              │ PENDING  │                │ APPROVED ││
              │          │                │          ││
              └────┬─────┘                └────┬─────┘│
                   │                           │      │
                   │ Reject                    │Reimburse
                   │                           │      │
                   ▼                           ▼      │
              ┌──────────┐              ┌────────────┐ │
              │          │              │            │ │
              │ REJECTED │              │ REIMBURSED │ │
              │          │              │            │ │
              └──────────┘              └────────────┘ │
                   │                           │      │
                   │  (Terminal State)         │(Terminal)
                   │  No further transitions   │  No further
                   │                           │  transitions
                   └───────────────────────────┘
```

### 6.2 State Definitions

| State | Badge Color | Description | Allowed Transitions |
|---|---|---|---|
| **Pending** | Amber (Yellow) | Initial state when an expense claim is submitted. Awaiting review by an authorized approver. | → Approved, → Rejected |
| **Approved** | Emerald (Green) | The claim has been reviewed and approved by an authorized approver. The `approvedBy` field is populated with the approver's name. Awaiting reimbursement. | → Reimbursed |
| **Rejected** | Rose (Red) | The claim has been denied by the approver. The `approvedBy` field contains the name of the person who rejected it. The `comments` field may contain the reason. | None (terminal state) |
| **Reimbursed** | Teal | The approved claim has been paid out to the employee. Payment has been disbursed through bank transfer or other means. | None (terminal state) |

### 6.3 Transition Rules

The following rules govern state transitions and are enforced by the API:

**Pending → Approved:**
- Any authorized user (Super Admin, HR Admin) can approve a pending expense.
- The `approvedBy` field must be provided with the approver's name.
- The `comments` field is optional but recommended for audit purposes.
- An audit log entry is created with action "update" and module "expense."

**Pending → Rejected:**
- Any authorized user (Super Admin, HR Admin) can reject a pending expense.
- The `approvedBy` field must be provided with the name of the person rejecting.
- The `comments` field should contain the reason for rejection to provide feedback to the employee.
- An audit log entry is created.

**Approved → Reimbursed:**
- Only authorized users can reimburse an approved expense.
- The `approvedBy` field must be provided.
- The system verifies the current status is "approved" before allowing the transition.
- If the current status is not "approved," the API returns `409 Conflict` with the message: *"Expense must be approved before it can be reimbursed."*
- An audit log entry is created.

**Blocked Transitions:**

| From | To | Reason | API Response |
|---|---|---|---|
| Rejected | Any | Rejected expenses cannot be modified | `409 Conflict: Cannot update a rejected expense` |
| Reimbursed | Any | Reimbursed expenses are locked for audit compliance | `409 Conflict: Cannot update a reimbursed expense` |
| Pending | Reimbursed | Must be approved first | `409 Conflict: Expense must be approved before it can be reimbursed` |
| Approved | Rejected | Approved expenses cannot be rejected after approval | `409 Conflict` (implicit — only "approved" or "rejected" statuses accepted for update, and approved→rejected is not a valid transition) |

### 6.4 Expense Categories

The system supports the following expense categories, each with a visual icon and color coding in the UI:

| Category | Icon | Badge Color | Typical Use Cases |
|---|---|---|---|
| **Travel** | Plane | Emerald | Flight tickets, train fare, cab charges, fuel reimbursement, toll charges |
| **Accommodation** | BedDouble | Amber | Hotel stays, guest house charges, rental for business travel |
| **Equipment** | Monitor | Cyan | Laptops, monitors, peripherals, software licenses, office supplies |
| **Food** | UtensilsCrossed | Orange | Business meals, client entertainment, per diem expenses |
| **Other** | — | Default | Miscellaneous expenses not fitting the above categories |

### 6.5 Audit Trail

Every state transition in the expense workflow generates an audit log entry with the following information:

| Field | Value Example |
|---|---|
| `employeeId` | The employee who submitted the expense |
| `action` | "create" (submission), "update" (approval/rejection/reimbursement), "delete" (deletion) |
| `module` | "expense" |
| `details` | "Expense approved for John Doe: Travel - ₹5,000" |

Audit log entries are immutable and cannot be modified or deleted, ensuring a complete financial audit trail.

---

## 7. Integration with Other Modules

### 7.1 Employee Management Module

The Payroll & Expenses module has a fundamental dependency on the Employee Management module. Every payroll record and expense claim references an `employeeId` that links to the `Employee` model. The integration points include:

- **Salary Data:** The `salary` field from the `Employee` model serves as the default basic salary for payroll processing. When payroll is created without an explicit `basicSalary`, the system uses `employee.salary`. If this field is zero or null, payroll processing is blocked with a validation error.
- **Employee Identity:** The payroll and expense tables join with the Employee table to display the employee's name, employee ID, department, and avatar. The `flattenPayroll` and `flattenExpense` functions in the frontend component transform the API response to include `name` (firstName + lastName) and display `employeeId` for human-readable tables.
- **Department Filtering:** Department-wise payroll and expense analysis relies on the `department` field from the Employee model, enabling HR administrators to analyze compensation costs and expense patterns by department.
- **Employee Status:** Only employees with `status: "active"` should have payroll processed. Employees with "inactive," "onboarding," or "exited" status should be excluded from payroll runs. The system does not currently enforce this at the API level and relies on the payroll processor to verify employee status.

**Data Flow:**
```
Employee Record → Payroll Module
    → salary field → basicSalary for payroll computation
    → firstName + lastName → Display name in payroll table
    → department → Department-wise filtering and analytics
    → employeeId (display) → Human-readable employee reference
```

### 7.2 Attendance Module

The Attendance module provides critical data for accurate payroll processing, particularly for employees with variable attendance patterns:

- **Present Days Count:** The number of days an employee was marked "present" or "half-day" during the payroll month should be used to calculate proportional salary for employees with incomplete attendance. The formula is: `Proportional Salary = (Basic Salary / Total Working Days) × Days Present`.
- **Absenteeism Deductions:** Days marked "absent" without approved leave result in per-day salary deductions. The payroll module should query attendance data to compute: `Deduction = (Basic Salary / Total Working Days) × Unapproved Absent Days`.
- **Leave Data:** Approved leave data from the Leave Management subsystem determines whether absences are paid (approved leave) or unpaid (unapproved absence). This data feeds into the salary computation as an adjustment to the basic salary.
- **Overtime Calculation:** Employees with total working hours consistently exceeding their shift duration may qualify for overtime pay, which should be added to the `bonus` or as a separate component in the payroll record.
- **Half-Day Adjustments:** Half-day attendance records should result in proportional salary adjustments, typically calculated as half the per-day salary rate for each half-day recorded.

### 7.3 Performance Module

The Performance module integration affects payroll through variable pay components:

- **Bonus Calculation:** Performance ratings and review scores from the Performance module can be used to determine variable bonus amounts. Employees with higher performance ratings may receive larger bonuses, which are reflected in the `bonus` field of the Payroll model.
- **Increment Processing:** Performance-based salary increments identified during review cycles should update the employee's `salary` field in the Employee model, which then flows into the next month's payroll processing as the updated basic salary.
- **Objective Achievement:** Key Result Indicator (KRI) and OKR completion percentages from performance reviews can trigger additional variable pay or bonus components.
- **Pay-for-Performance:** Organizations with pay-for-performance policies can use the `rating` field from the Performance model to calculate performance multipliers for bonus computation.

### 7.4 Self-Service Module

The Self-Service module provides employees with direct access to their payroll and expense data:

- **Payslip Access:** Employees can view and download their own payslips from the Self-Service portal without navigating to the full Payroll & Expenses module. This provides quick access to salary details, deductions, and net pay information.
- **Expense Submission:** Employees can submit expense claims directly from Self-Service, which routes the claim through the same approval workflow. This reduces friction in the expense reporting process.
- **Expense Status Tracking:** Employees can monitor the status of their submitted expense claims (pending, approved, rejected, reimbursed) from the Self-Service portal.
- **Tax Declaration:** Employees can manage their investment declarations and upload proof documents through Self-Service, which integrates with the Tax Declarations tab for payroll tax computation.

### 7.5 Analytics Module

The Analytics module consumes payroll and expense data for organizational insights and predictive modeling:

- **Compensation Analytics:** Analysis of salary distributions, average compensation by department, pay equity metrics, and year-over-year salary growth trends. The `grossPay` and `netPay` fields from the Payroll model are primary data sources.
- **Expense Trends:** Monthly and quarterly expense trend analysis, category-wise expense distribution, and department-wise expense comparison. The expense trend line chart in the module provides a visual starting point for deeper analytics.
- **Payroll Cost Forecasting:** Using historical payroll data, the Analytics module can project future payroll costs, enabling budget planning and resource allocation decisions.
- **Compliance Reporting:** Aggregation of PF, ESI, and Professional Tax data across all employees for statutory compliance reporting and government filing purposes.
- **Anomaly Detection:** Identification of unusual payroll amounts, unexpected deductions, or expense claim patterns that may warrant investigation, leveraging AI-powered analytics capabilities within the HRMS platform.

---

## 8. Role-Based Access

### 8.1 Role Permission Matrix

The Payroll & Expenses module implements role-based access control to ensure that sensitive financial data is only accessible to authorized personnel. The following matrix defines the permissions for each role:

| Action | Super Admin | HR Admin | Payroll Specialist | Employee (Self-Service) |
|---|:---:|:---:|:---:|:---:|
| View all payroll records | ✅ | ✅ | ✅ | ❌ |
| View own payroll/payslip | ✅ | ✅ | ✅ | ✅ |
| Process individual payroll | ✅ | ✅ | ✅ | ❌ |
| Bulk process payroll | ✅ | ✅ | ✅ | ❌ |
| Update salary components | ✅ | ✅ | ✅ | ❌ |
| Mark payroll as paid | ✅ | ✅ | ✅ | ❌ |
| Delete payroll records | ✅ | ❌ | ❌ | ❌ |
| View all expense claims | ✅ | ✅ | ✅ | ❌ |
| Submit own expense claims | ✅ | ✅ | ✅ | ✅ |
| Approve/reject expenses | ✅ | ✅ | ❌ | ❌ |
| Process reimbursements | ✅ | ✅ | ❌ | ❌ |
| Delete expense claims | ✅ | ✅ | ❌ | ❌ |
| Manage tax declarations | ✅ | ✅ | ✅ | ✅ (own) |
| Export payroll/expense reports | ✅ | ✅ | ✅ | ❌ |
| View audit trail | ✅ | ✅ | ❌ | ❌ |
| Configure salary structure | ✅ | ❌ | ❌ | ❌ |

### 8.2 Access Enforcement

Role-based access is enforced at multiple layers within the AI-HRMS application:

- **Frontend Visibility:** The UI conditionally renders action buttons, edit controls, and data columns based on the user's role. For example, the "Delete" button on payroll records is only visible to Super Admins, and the "Approve/Reject" buttons on expense claims are only shown to HR Admins and Super Admins.
- **API Validation:** The API routes validate that the requesting user has the appropriate role before executing sensitive operations. Role checks are performed in the middleware before the request reaches the handler.
- **Data Filtering:** Employees accessing the system through Self-Service only see their own records. The API automatically applies `employeeId` filters based on the authenticated user's employee association.
- **Audit Logging:** All access to payroll and expense data is logged in the audit trail, including view access for sensitive salary information, enabling compliance audits and security reviews.

### 8.3 Role Descriptions

**Super Admin:** Has unrestricted access to all module features including deletion of records, configuration of salary structure parameters, and viewing of the complete audit trail. This role is typically reserved for IT administrators and senior management who require full system visibility for governance purposes. Super Admins can override business rules in exceptional circumstances (e.g., deleting a payroll record that was created in error).

**HR Admin:** Has access to all payroll processing, expense approval, and reimbursement features. Can view organization-wide data, process bulk payroll, and manage employee expense claims. Cannot delete payroll records or modify the salary structure configuration. This role is assigned to HR department personnel responsible for day-to-day payroll operations.

**Payroll Specialist:** Has access to payroll processing features including individual and bulk payroll computation, salary component review, and payslip generation. Cannot approve or reject expense claims, process reimbursements, or delete records. This role is designed for payroll team members who handle the computational aspects of salary processing.

**Employee (Self-Service):** Can view their own payslips, submit expense claims, track claim status, and manage their own tax declarations. Cannot access other employees' payroll or expense data. This role is automatically assigned to all employees with active accounts in the system.

---

## 9. Business Rules

### 9.1 Duplicate Payroll Check

The system enforces a strict uniqueness constraint on payroll records to prevent duplicate salary processing. The combination of `employeeId`, `month`, and `year` must be unique across all payroll records.

**Rule:** When a `POST /api/payroll` request is submitted, the API checks for an existing record with the same `employeeId`, `month`, and `year`. If a record already exists, the API returns a `409 Conflict` error with the message: *"Payroll record already exists for this employee for the given month/year."*

**Rationale:** Duplicate payroll records would result in double payment, incorrect financial reporting, and statutory compliance violations. The uniqueness check is the primary safeguard against this scenario.

**Workaround:** If a payroll record needs to be corrected, use the `PATCH /api/payroll` endpoint to update the existing record's components rather than creating a new one. If the record was created in error, a Super Admin can delete it via `DELETE /api/payroll?id=<record_id>` and then recreate it with corrected values.

**Bulk Processing:** When using the "Process Payroll" button to process multiple employees, the system iterates through pending records and processes each individually. If a duplicate is encountered for a specific employee, that employee's payroll is skipped while others continue processing. The error is captured and displayed to the user via the mutation error banner.

### 9.2 Expense State Transition Rules

The expense claim lifecycle follows a strict state machine with irreversible transitions. The following business rules govern state transitions:

1. **Initial State:** All newly created expense claims start with `status: "pending"`. This is enforced by the API regardless of any status value provided in the POST request body.

2. **Forward-Only Transitions:** State transitions can only move forward in the workflow: pending → approved → reimbursed. Backward transitions (e.g., approved → pending, reimbursed → approved) are not permitted under any circumstances.

3. **Rejection from Pending:** A pending expense can be rejected, transitioning directly from pending → rejected. Rejection is a terminal state — once rejected, the expense cannot be modified or transitioned to any other status.

4. **Reimbursement Requires Approval:** An expense must be in "approved" status before it can be marked as "reimbursed." Attempting to reimburse a pending expense results in a `409 Conflict` error with the message: *"Expense must be approved before it can be reimbursed."*

5. **Terminal State Locking:** Once an expense reaches "rejected" or "reimbursed" status, no further modifications are allowed. The API returns `409 Conflict` for any update attempts on terminal-state records. This ensures audit integrity and prevents tampering with financial records after disbursement or formal denial.

6. **Approver Attribution:** Every state transition from pending → approved or pending → rejected must include the `approvedBy` field identifying the person who made the decision. This creates a clear accountability trail for all financial decisions.

### 9.3 Cannot Delete Reimbursed Expenses

**Rule:** Expense claims with `status: "reimbursed"` cannot be deleted from the system. The API enforces this by checking the status before deletion and returning a `409 Conflict` error with the message: *"Cannot delete a reimbursed expense for audit purposes."*

**Rationale:** Reimbursed expenses represent completed financial transactions where money has been disbursed to the employee. Deleting these records would:
- Break the audit trail and violate financial record-keeping regulations.
- Create discrepancies between bank statements and system records.
- Complicate tax audits and compliance reviews.
- Undermine the integrity of expense analytics and reporting.

**Exceptions:** In exceptional circumstances (e.g., fraudulent claim discovered after reimbursement), a Super Admin may need to reverse a reimbursement. This requires a database-level correction and should be documented with a formal audit entry. The recommended approach is to create an offsetting adjustment entry rather than deleting the original record.

### 9.4 Salary Validation Rules

1. **Non-Zero Basic Salary:** The employee's salary field must be a positive, non-zero value before payroll can be processed. If `employee.salary` is 0 or null, the API returns `400 Bad Request` with the message: *"Employee salary is not set. Please update employee salary before processing payroll."*

2. **Positive Amount Validation:** All salary components (basicSalary, hra, da, conveyance, medical, bonus) must be non-negative. Deduction components (pf, esi, tax, professionalTax) must also be non-negative.

3. **Gross Pay Consistency:** The `grossPay` field must equal the sum of all earnings components. The API recalculates this on every update to ensure consistency: `grossPay = basicSalary + hra + da + conveyance + medical + bonus`.

4. **Net Pay Non-Negative:** While the system does not explicitly block negative net pay (which could occur if deductions exceed earnings), the payroll processor should review such cases manually. A negative net pay typically indicates an error in salary component configuration or an excessive deduction that needs correction.

5. **PF Wage Ceiling:** For employees with basic salary above ₹15,000/month, the employer may optionally restrict PF calculation to the wage ceiling (₹15,000). The system calculates PF on the actual basic salary by default; this should be manually overridden for organizations following the wage ceiling approach.

### 9.5 Expense Amount Validation

1. **Positive Amount:** The expense amount must be a positive number greater than zero. The API validates this as a required field on POST requests.

2. **Category Required:** The expense category must be one of the predefined values: Travel, Accommodation, Equipment, Food, or Other. The API validates this as a required field.

3. **Date Required:** The expense date must be provided in the request. The system does not currently validate that the date is within a reasonable range (e.g., not a future date or excessively old date), but organizations may implement such policies at the approval stage.

4. **Receipt Upload:** While receipt upload is optional in the system, organizational policy may require receipts for expenses above a certain threshold (e.g., ₹500). This policy enforcement happens at the approval stage rather than the submission stage.

### 9.6 Payroll Status Rules

1. **Status Values:** The payroll `status` field accepts three values: `pending`, `processed`, and `paid`. New payroll records default to `processed` status unless explicitly set otherwise.

2. **Status Transitions:** Payroll status follows a linear progression: pending → processed → paid. The API allows updating the status field via PATCH requests, validating that the new status is one of the accepted values.

3. **Mark as Paid:** After payroll has been processed and the salary has been disbursed to employees' bank accounts, the payroll status should be updated to `paid` to indicate that the payment cycle is complete.

4. **Re-Processing:** If a payroll record needs to be recalculated (e.g., due to an attendance correction or bonus update), the existing record should be updated via PATCH rather than deleted and recreated. The API automatically recalculates grossPay, totalDeductions, and netPay whenever any component is modified.

---

## 10. Troubleshooting

### 10.1 Common Issues and Resolutions

#### Issue: "Payroll record already exists for this employee for the given month/year"

**Symptom:** When attempting to process payroll for an employee, the API returns a `409 Conflict` error indicating a duplicate record.

**Cause:** A payroll record for this employee already exists for the selected month and year. The system enforces a uniqueness constraint on the combination of employeeId + month + year.

**Resolution:**
1. Check the payroll table for the selected month/year to verify if a record already exists for the employee.
2. If the existing record needs correction, use the update functionality (PATCH) to modify the specific salary components rather than creating a new record.
3. If the existing record was created in error, a Super Admin can delete it via `DELETE /api/payroll?id=<record_id>` and then recreate it with the correct values.
4. When using the "Process Payroll" bulk action, the system automatically skips employees with existing records and only processes those with "pending" status.

#### Issue: "Employee salary is not set. Please update employee salary before processing payroll."

**Symptom:** When attempting to process payroll for an employee, the API returns a `400 Bad Request` error indicating the salary field is not set.

**Cause:** The employee's `salary` field in the Employee model is either null or zero. The payroll system requires a valid basic salary to compute all other components.

**Resolution:**
1. Navigate to the **Employee Management** module.
2. Locate the employee using the search or filter functionality.
3. Edit the employee record and set the `salary` field to the correct basic salary amount.
4. Save the employee record.
5. Return to the Payroll & Expenses module and attempt payroll processing again.
6. If the salary was recently updated, ensure the payroll system is using the latest employee data by refreshing the page.

#### Issue: "Cannot update a rejected expense"

**Symptom:** When attempting to approve or modify a rejected expense claim, the API returns a `409 Conflict` error.

**Cause:** The expense claim has already been rejected and is in a terminal state. Rejected expenses are locked from further modifications to maintain audit integrity.

**Resolution:**
1. If the rejection was made in error, the employee must submit a new expense claim with the same details.
2. The original rejected claim remains in the system as an audit record and cannot be modified or deleted.
3. HR Admins can add a comment to the original rejection (if not yet at terminal state) explaining the reason, but the record itself cannot be reopened.
4. To prevent accidental rejections, ensure that approvers review claim details carefully before clicking the Reject button.

#### Issue: "Cannot delete a reimbursed expense for audit purposes"

**Symptom:** When attempting to delete a reimbursed expense, the API returns a `409 Conflict` error.

**Cause:** Reimbursed expenses represent completed financial transactions and are protected from deletion for audit and compliance purposes.

**Resolution:**
1. Reimbursed expenses cannot be deleted through the API. This is intentional design behavior.
2. If a reimbursement was made in error, contact a Super Admin to create an offsetting adjustment entry.
3. For cases of confirmed fraud or duplicate reimbursement, document the issue formally and have a Super Admin perform a database-level correction with appropriate audit documentation.
4. To prevent erroneous reimbursements, ensure that expense claims are thoroughly reviewed during the approval stage before reimbursement is processed.

#### Issue: Payroll data not loading / empty table

**Symptom:** The payroll table shows no records or displays the empty state message despite knowing that payroll records exist.

**Cause:** This can be caused by several factors: incorrect month/year selection, API connectivity issues, or data loading errors.

**Resolution:**
1. Verify the **Month** and **Year** dropdowns are set to the correct period.
2. If an error banner is displayed, click the **"Retry"** button to re-fetch the data.
3. Check the browser console for API errors (network issues, 500 Internal Server Error).
4. If the API returns data but the table is empty, ensure the payroll records exist for the selected month by querying `GET /api/payroll?month=January&year=2024` directly.
5. If using custom filters or pagination, verify that the `page` and `limit` parameters are appropriate (default: page=1, limit=50).

#### Issue: Expense claims showing incorrect status after approval

**Symptom:** An expense claim's status badge does not update after clicking Approve or Reject, or the status shows an unexpected value.

**Cause:** This may be caused by a race condition, stale cache, or API error during the update operation.

**Resolution:**
1. Refresh the page to fetch the latest data from the API.
2. Check the mutation error banner for any error messages that may have been displayed briefly.
3. Verify the expense record's current status by querying `GET /api/expenses?id=<expense_id>`.
4. If the status update failed silently, retry the approval/rejection action.
5. If the issue persists, check the browser network tab for the PATCH request and response to identify the specific error.

#### Issue: Salary component values are unexpected

**Symptom:** The computed HRA, DA, PF, or other salary components do not match the expected values based on the basic salary.

**Cause:** The auto-calculation formulas may have been overridden with custom values during payroll creation, or the employee's salary field was different at the time of processing.

**Resolution:**
1. Open the Salary Breakdown dialog for the affected employee to review all component values.
2. Compare the computed values against the expected formulas:
   - HRA should be 40% of basic (basicSalary × 0.4)
   - DA should be 10% of basic (basicSalary × 0.1)
   - PF should be 12% of basic (basicSalary × 0.12)
   - ESI should be 0.75% of gross (grossPay × 0.0075)
   - Professional Tax should be ₹200
3. If any component was manually overridden, use the PATCH endpoint to correct it: `PATCH /api/payroll {id, hra: <correct_value>, ...}`.
4. The API automatically recalculates grossPay, totalDeductions, and netPay when any component is updated.
5. To verify the original computation, check the audit log for the payroll creation event which records the net pay amount.

#### Issue: "Failed to process payroll" generic error

**Symptom:** A generic error message appears when attempting to process payroll, without a specific reason.

**Cause:** This can occur due to database connectivity issues, validation errors not caught by the frontend, or server-side exceptions.

**Resolution:**
1. Check the mutation error banner for the specific error message.
2. Verify that all required fields are provided (employeeId, month, year).
3. Ensure the employee record exists and has a valid salary.
4. Check for any ongoing database maintenance or connectivity issues.
5. If the error persists, check the server logs for the detailed error stack trace.
6. As a fallback, try processing the payroll for a single employee rather than using the bulk process option to isolate the issue.

---

**Document End**

*This Standard Operating Procedure is a living document and should be reviewed and updated whenever the Payroll & Expenses module undergoes significant changes, new features are added, or business rules are modified. All updates must be approved by the HR department and the IT administration team before publication.*
