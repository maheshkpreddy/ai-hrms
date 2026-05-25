# Standard Operating Procedure — Time & Attendance Module

**AI-HRMS Application**
**Document ID:** SOP-HRMS-05
**Module Key:** `attendance`
**Version:** 1.0
**Effective Date:** 2024-01-15
**Last Reviewed:** 2024-01-15

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [Leave Types & Policies](#5-leave-types--policies)
6. [Attendance Status Logic](#6-attendance-status-logic)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Role-Based Views](#8-role-based-views)
9. [Business Rules](#9-business-rules)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Time & Attendance module is a core component of the AI-HRMS platform responsible for tracking employee attendance, managing leave requests, defining work shifts, and maintaining the organizational holiday calendar. It serves as the single source of truth for all time-tracking data across the organization and directly feeds into payroll processing, compliance reporting, and workforce analytics. By centralizing attendance management, the module eliminates manual spreadsheet tracking, reduces errors in salary computation, and provides real-time visibility into workforce availability for managers and HR administrators.

The module supports multiple attendance-tracking paradigms — from simple check-in/check-out marking to geofenced location-verified check-ins — ensuring flexibility for organizations with diverse operational models including office-based, remote, and field-deployed workforces. Additionally, the leave management subsystem handles the complete lifecycle of leave requests from application through approval or rejection, including leave balance tracking across all leave categories.

### 1.2 Scope

This SOP covers the following functional areas within the Time & Attendance module:

- **Attendance Recording:** Marking daily check-in and check-out times, automatic status determination, and manual corrections by authorized personnel.
- **Leave Management:** Application, approval, rejection, and cancellation of leave requests across five leave types (Casual, Sick, Earned, Maternity, and Paternity), with balance tracking and approval workflow integration.
- **Shift Management:** Definition and configuration of work shifts (Morning, Evening, Night, General), including grace time settings for late-arrival tolerance.
- **Holiday Calendar:** Management of organizational holidays categorized as National, Company, or Optional, with year-wise filtering and search capabilities.
- **Geofencing:** Location-based attendance verification using configurable radius settings to ensure employees check in from authorized locations.
- **Reporting & Analytics:** Weekly attendance overview charts, department-wise and shift-wise filtering, and export capabilities for attendance data.

### 1.3 Target Users

| User Role | Primary Activities |
|---|---|
| **Employee** | Mark own attendance (check-in/check-out), apply for leave, view leave balances, view personal attendance history |
| **Department Manager** | All employee capabilities plus: approve/reject leave requests for team members, view team attendance, export attendance reports |
| **HR Admin** | All manager capabilities plus: manage shifts, configure holiday calendar, correct attendance records, view organization-wide attendance data |
| **Super Admin** | Full system access including deletion of records, configuration of business rules, and audit trail review |

---

## 2. Access & Navigation

### 2.1 Navigating to the Module

The Time & Attendance module is accessible from the main sidebar navigation within the AI-HRMS application. Users should follow these steps to access the module:

1. Log in to the AI-HRMS application using your credentials (email and password).
2. From the left sidebar, locate and click on the **"Time & Attendance"** menu item. The sidebar icon features a clock symbol for quick visual identification.
3. The module loads with the **Attendance** tab selected by default, displaying the current day's attendance summary and records.
4. The header area displays the current date in the format `Weekday, Month DD, YYYY` (e.g., "Monday, January 15, 2024") for immediate context.

### 2.2 Module Layout

The Time & Attendance module is organized into four primary tabs, each serving a distinct functional area:

| Tab | Icon | Purpose |
|---|---|---|
| **Attendance** | Clock | Daily attendance tracking, stats overview, records table, and weekly chart |
| **Leave Management** | CalendarDays | Leave balances, leave application, and leave request list |
| **Shifts & Holidays** | Timer | Shift definitions and holiday calendar management |
| **Geofencing** | MapPin | Location-based check-in verification and radius configuration |

### 2.3 Component Reference

- **Frontend Component:** `src/components/hrms/TimeAttendance.tsx`
- **API Endpoints:**
  - `GET/POST/PATCH/DELETE /api/attendance`
  - `GET/POST/PATCH/DELETE /api/leaves`
  - `GET/POST/PATCH/DELETE /api/shifts`
  - `GET/POST/PATCH/DELETE /api/holidays`

### 2.4 Prerequisites

- The user must have an active account in the system with a valid employee record linked to their user profile.
- The employee record must exist in the `Employee` model before attendance can be marked.
- Shifts and holiday data should be pre-configured by HR Admin before employees begin using the module (seed data provides four default shifts).

---

## 3. Screen Descriptions

### 3.1 Attendance Records View

The Attendance tab is the default landing view when users navigate to the Time & Attendance module. It provides a comprehensive overview of the day's attendance status across the organization.

**Summary Statistics Row:** Four KPI cards are displayed at the top of the view:

| Card | Color Theme | Description |
|---|---|---|
| Present Today | Emerald (Green) | Count of employees currently marked as "present" for the day |
| Late Arrivals | Amber (Yellow) | Count of employees who checked in after the grace period |
| Absent | Red | Count of employees with no attendance record for the day |
| On Leave | Purple | Count of employees with approved leave for the current date |

Each card includes an icon, a large numeric count, and a gradient accent bar along the bottom edge for visual emphasis. During data loading, skeleton placeholders animate in place of the actual values.

**Filters Bar:** Below the stats row, a set of dropdown filters allows users to narrow the displayed attendance records:

- **Department Filter:** Filters by department name, derived dynamically from the attendance data. Default: "All Departments."
- **Shift Filter:** Filters by shift type (Morning, Evening, Night). Default: "All Shifts."
- **Status Filter:** Filters by attendance status (Present, Late, Absent, Half-day). Default: "All Status."

**Action Buttons:**

- **Mark Attendance:** Primary action button (emerald green) — records a check-in for the current employee with the current timestamp.
- **Export Report:** Secondary action button (outline variant) — exports the filtered attendance data to a downloadable report format.

**Attendance Table:** A scrollable data table displaying individual attendance records with the following columns:

| Column | Description |
|---|---|
| Employee Name | Full name of the employee |
| Check-In | Time of check-in (HH:MM format) |
| Check-Out | Time of check-out (HH:MM format) |
| Hours | Total hours worked (calculated from check-in to check-out) |
| Shift | Assigned shift (morning, evening, night) |
| Status | Color-coded badge: Present (emerald), Late (amber), Absent (red), Half-day (sky blue) |
| Location | Check-in location (visible on medium+ screens) |

**Weekly Attendance Chart:** A stacked bar chart (Recharts-powered) at the bottom of the tab shows the daily breakdown of Present, Late, and Absent counts for the current week. The chart features:
- Emerald bars for Present count
- Amber bars for Late count
- Red bars for Absent count
- Custom tooltip styling matching the application theme
- Responsive container for all screen sizes

### 3.2 Mark Attendance

When a user clicks the **"Mark Attendance"** button, the system performs the following actions:

1. Retrieves the current employee's database ID from the employee profile linked to the logged-in user.
2. Captures the current date in `YYYY-MM-DD` format.
3. Captures the current time in `HH:MM` (24-hour) format using the `en-IN` locale.
4. Sends a `POST` request to `/api/attendance` with the payload:
   ```json
   {
     "employeeId": "<current_employee_db_id>",
     "date": "2024-01-15",
     "checkIn": "09:05",
     "status": "present"
   }
   ```
5. The API validates the request (duplicate check, employee existence) and creates the record.
6. On success, the attendance data is refreshed and the table updates.
7. On failure (e.g., duplicate record), an error is logged to the console and the user may see the error state banner.

**Important:** Each employee can only have one attendance record per date. If a record already exists, the API returns a `409 Conflict` error with the message: *"Attendance record already exists for this employee on this date."* To record check-out, the existing record must be updated via `PATCH /api/attendance`.

### 3.3 Leave Application Form

The leave application form is accessed via the **"Apply Leave"** button on the Leave Management tab. It opens a modal dialog with the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| Leave Type | Select dropdown | Yes | Options: Casual Leave, Sick Leave, Earned Leave, Maternity Leave, Paternity Leave |
| Start Date | Date input | Yes | First day of the leave period |
| End Date | Date input | Yes | Last day of the leave period |
| Reason | Textarea | Yes | Brief description of the leave reason |

**Form Behavior:**

- All four fields are mandatory. The submit button remains clickable but the handler will not proceed if any field is empty.
- The form does not currently auto-calculate the number of days from start/end dates; the `days` field must be calculated server-side or provided manually.
- Upon successful submission, the dialog closes, the form resets to blank values, and the leave list refreshes to show the new request with "Pending" status.
- While the request is in progress, a spinning loader icon appears on the submit button and the cancel button is disabled.
- The submitted leave request automatically enters the `pending` status and routes through the approval workflow.

### 3.4 Leave Approval View

Managers and HR Admins can view and act upon pending leave requests from their team members. The leave requests table displays all leave records with the following information:

| Column | Description |
|---|---|
| Employee Name | Full name of the requesting employee |
| Leave Type | Color-coded badge by type (CL=emerald, SL=rose, EL=amber, ML=purple, PL=cyan) |
| Duration | Start date to end date range with total days |
| Reason | The reason provided by the employee |
| Status | Color-coded badge: Approved (emerald), Pending (amber), Rejected (red) |
| Approved By | Name of the manager who approved/rejected (blank if pending) |
| Actions | Approve (emerald) and Reject (red) buttons — visible only for pending requests |

**Approval/Rejection Flow:**

- When a manager clicks **Approve**, a `PATCH` request is sent to `/api/leaves` with:
  ```json
  {
    "id": "<leave_id>",
    "status": "approved",
    "approvedBy": "Current Manager",
    "comments": "Approved"
  }
  ```
- When a manager clicks **Reject**, the same endpoint is called with `"status": "rejected"` and `"comments": "Rejected"`.
- A loading spinner appears on the action button while the request is processing.
- Once processed, the leave list refreshes and the status badge updates accordingly.
- Already-processed leave requests cannot be approved or rejected again (the API returns a `409 Conflict` for such attempts).

**Leave Balance Cards:** Four cards at the top of the Leave Management tab show the current leave balance:

| Leave Type | Total | Default Used | Color |
|---|---|---|---|
| Casual Leave | 12 | 5 | Emerald |
| Sick Leave | 10 | 2 | Rose |
| Earned Leave | 15 | 3 | Amber |
| Maternity / Paternity | 180 | 0 | Purple |

Each card displays: remaining days (large bold number), total days, used days, and a progress bar indicating utilization percentage.

**Leave Calendar:** A monthly calendar view highlights leave dates with color-coded backgrounds by leave type. The current date is emphasized with an emerald ring. The calendar legend shows abbreviations: CL (Casual), SL (Sick), EL (Earned), ML (Maternity).

### 3.5 Shift Management

The Shifts & Holidays tab includes shift configuration capabilities accessible to HR Admins and Super Admins. The system ships with four pre-configured default shifts:

| Shift Name | Start Time | End Time | Grace Time | Icon |
|---|---|---|---|---|
| Morning Shift | 09:00 | 18:00 | 15 minutes | Sunrise |
| Evening Shift | 14:00 | 22:00 | 10 minutes | Sun |
| Night Shift | 22:00 | 06:00 | 10 minutes | Moon |
| General Shift | 10:00 | 19:00 | 15 minutes | Briefcase |

**Shift Card Display:** Each shift is displayed as a card showing:
- Shift name with the corresponding icon (Sunrise for Morning, Sun for Evening, Moon for Night, Briefcase for General)
- Time range (startTime — endTime)
- Grace time in minutes
- Number of employees assigned to the shift

**Creating a New Shift:**
1. Navigate to the Shifts & Holidays tab.
2. Click the **"Add Shift"** button.
3. Fill in the required fields: Name, Start Time, End Time, and optional Grace Time.
4. Submit the form — a `POST` request is sent to `/api/shifts`.
5. The API checks for duplicate shift names (returns `409 Conflict` if a shift with the same name exists).
6. On success, the shift list refreshes with the new entry.

**Editing a Shift:**
1. Click the edit action on the shift card.
2. Modify the desired fields (name, startTime, endTime, graceTime).
3. Submit — a `PATCH` request is sent to `/api/shifts` with the shift ID and updated fields.
4. If renaming, the API validates that no other shift has the new name.

**Deleting a Shift:**
1. Click the delete action on the shift card.
2. Confirm the deletion.
3. A `DELETE` request is sent to `/api/shifts?id=<shift_id>`.
4. **Caution:** Deleting a shift does not automatically update attendance records referencing that shift.

### 3.6 Holiday Calendar

The holiday calendar section displays all configured holidays for the organization, filterable by type and year. Each holiday entry shows:

| Field | Description |
|---|---|
| Name | The holiday name (e.g., "Republic Day," "Diwali") |
| Date | The date of the holiday |
| Type | Color-coded badge: National (emerald), Company (amber), Optional (sky blue) |

**Adding a Holiday:**
1. Click the **"Add Holiday"** button on the Shifts & Holidays tab.
2. Enter the holiday name (required), date (required), and type (optional, defaults to "company").
3. Submit — a `POST` request is sent to `/api/holidays` with the payload.
4. The API validates that name and date are provided, then creates the record.

**Filtering Holidays:**
- **Type Filter:** Filter by National, Company, or Optional.
- **Year Filter:** Filter by year (e.g., 2024) — the API matches dates starting with the year string.
- **Search:** Text search across holiday name and type fields.

---

## 4. Functional Workflows

### 4.1 Marking Attendance (Check-In / Check-Out)

This workflow describes the end-to-end process for an employee marking their daily attendance.

#### 4.1.1 Check-In Process

```
Employee → Clicks "Mark Attendance" → System captures timestamp
    → POST /api/attendance {employeeId, date, checkIn, status:"present"}
    → API validates employee exists
    → API checks for duplicate (employeeId + date)
    → If duplicate: Returns 409 Conflict
    → If unique: Creates attendance record with status "present"
    → Audit log created (action: "create", module: "attendance")
    → UI refreshes attendance table
```

**Step-by-step:**

1. The employee logs in to the AI-HRMS application.
2. Navigates to **Time & Attendance** from the sidebar.
3. On the Attendance tab, clicks the **"Mark Attendance"** button.
4. The system automatically captures the current date and time.
5. A `POST` request is submitted to `/api/attendance` with the employee's database ID, the current date, the check-in time, and an initial status of "present."
6. The API validates that:
   - The employee ID corresponds to an existing employee record.
   - No attendance record already exists for this employee on this date (duplicate check).
7. If validation passes, the attendance record is created and an audit log entry is generated.
8. The attendance table and statistics cards refresh to reflect the new record.
9. If the check-in time exceeds the shift's start time plus grace time, the system may later recalculate the status as "late" depending on the business logic applied.

#### 4.1.2 Check-Out Process

Check-out is performed by updating the existing attendance record for the day:

1. The employee returns to the Attendance tab.
2. The system identifies the existing attendance record for the current date.
3. Clicks the **"Check Out"** action (or the system auto-triggers at end of shift).
4. A `PATCH` request is submitted to `/api/attendance` with:
   ```json
   {
     "id": "<attendance_record_id>",
     "checkOut": "18:30"
   }
   ```
5. The API updates the `checkOut` field and recalculates the total hours worked.
6. The status may be re-evaluated based on total hours (e.g., if hours < 4, status changes to "half-day").
7. An audit log entry is created (action: "update", module: "attendance").

#### 4.1.3 Manager/HR Correction

When an attendance record needs correction (e.g., employee forgot to check in):

1. The manager or HR Admin navigates to the Attendance tab.
2. Locates the employee's record using filters (department, shift, status).
3. Clicks the edit action on the attendance record.
4. Updates the necessary fields (checkIn, checkOut, status, notes).
5. Submits a `PATCH` request to `/api/attendance` with the corrected values.
6. The status field must be one of the valid values: `present`, `absent`, `late`, or `half-day`.
7. An audit log captures the correction for compliance purposes.

### 4.2 Applying for Leave

```
Employee → Clicks "Apply Leave" → Fills form (type, dates, reason)
    → POST /api/leaves {employeeId, leaveType, startDate, endDate, reason}
    → API validates required fields
    → API validates employee exists
    → Leave created with status "pending"
    → Audit log created
    → Approval workflow entry created
    → UI refreshes leave list
```

**Step-by-step:**

1. Navigate to the **Leave Management** tab.
2. Review leave balances on the four balance cards to confirm available days.
3. Click the **"Apply Leave"** button (emerald, with Plus icon).
4. The leave application dialog opens with four fields:
   - **Leave Type:** Select from Casual Leave, Sick Leave, Earned Leave, Maternity Leave, or Paternity Leave.
   - **Start Date:** Click to open the date picker and select the first day of leave.
   - **End Date:** Select the last day of leave.
   - **Reason:** Type a brief description of the leave reason (minimum meaningful content required).
5. Click **"Submit Request."** The button displays a loading spinner while the request processes.
6. The system sends a `POST` request to `/api/leaves` with the employee ID, leave type, dates, and reason.
7. The API validates:
   - All required fields are present (employeeId, leaveType, startDate, endDate, days).
   - The employee record exists.
8. The leave record is created with `status: "pending"`.
9. An audit log entry is recorded (action: "create", module: "leave").
10. The dialog closes, the form resets, and the leave request list refreshes.
11. The request is now visible to the employee's reporting manager for approval.

### 4.3 Approving/Rejecting Leave Requests

```
Manager → Views pending leaves → Clicks Approve/Reject
    → PATCH /api/leaves {id, status, approvedBy, comments}
    → API validates status transition (pending → approved/rejected)
    → API blocks if already processed (409 Conflict)
    → Leave record updated
    → Audit log created
    → UI refreshes
```

**Step-by-step:**

1. Log in as a Manager or HR Admin.
2. Navigate to the **Leave Management** tab.
3. Review the list of leave requests — pending requests show Approve (emerald) and Reject (red) action buttons.
4. To **approve** a request:
   a. Click the **Approve** button on the leave request row.
   b. A loading spinner appears on the button while processing.
   c. The system sends a `PATCH` request to `/api/leaves` with `status: "approved"`, the approver's name, and a default comment.
   d. The API validates the status transition (only "pending" requests can be approved).
   e. If valid, the leave status is updated and an audit log is created.
   f. The leave balance for the employee is effectively reduced by the approved days.
5. To **reject** a request:
   a. Click the **Reject** button on the leave request row.
   b. The system sends a `PATCH` request with `status: "rejected"` and a rejection comment.
   c. The API validates the transition and updates the record.
   d. The employee's leave balance is not affected.
6. If the leave has already been processed, the API returns a `409 Conflict` error with the message *"Leave request has already been processed."*
7. Employees can **cancel** their own leave requests by submitting a `PATCH` with `status: "cancelled"` (this is allowed even for non-pending leaves as a special transition).

### 4.4 Managing Shifts

**Creating a Shift:**

1. Navigate to the **Shifts & Holidays** tab.
2. Click the **"Add Shift"** button.
3. Enter the shift details:
   - **Name** (required): A unique name for the shift (e.g., "Early Morning Shift").
   - **Start Time** (required): The shift start time in `HH:MM` format.
   - **End Time** (required): The shift end time in `HH:MM` format.
   - **Grace Time** (optional): Number of minutes allowed as late-arrival tolerance.
4. Click **Create** — a `POST` request is sent to `/api/shifts`.
5. The API validates:
   - Name, startTime, and endTime are provided.
   - No shift with the same name already exists (duplicate name check returns `409 Conflict`).
6. On success, the shift is created and an audit log is generated.

**Updating a Shift:**

1. Locate the shift in the shift list and click the edit action.
2. Modify the desired fields (name, startTime, endTime, graceTime).
3. Submit — a `PATCH` request is sent to `/api/shifts` with the shift ID and updated fields.
4. If renaming, the API checks for duplicate names (excluding the current shift).
5. An audit log captures the update.

**Deleting a Shift:**

1. Click the delete action on the target shift.
2. Confirm the deletion prompt.
3. A `DELETE` request is sent to `/api/shifts?id=<shift_id>`.
4. The API validates the shift exists, then deletes it.
5. **Warning:** Deleting a shift does not cascade-update attendance records that reference it. Existing attendance records retain the shift value as stored.

### 4.5 Managing Holiday Calendar

**Adding a Holiday:**

1. Navigate to the **Shifts & Holidays** tab and locate the Holidays section.
2. Click the **"Add Holiday"** button.
3. Enter the holiday details:
   - **Name** (required): The name of the holiday (e.g., "Independence Day").
   - **Date** (required): The date of the holiday in `YYYY-MM-DD` format.
   - **Type** (optional): One of `national`, `company`, or `optional`. Defaults to `company` if not specified.
4. Submit — a `POST` request is sent to `/api/holidays`.
5. The API validates name and date are present, then creates the record.
6. An audit log is generated with module "attendance" and action "create."

**Updating a Holiday:**

1. Locate the holiday in the list and click the edit action.
2. Modify the name, date, or type as needed.
3. Submit — a `PATCH` request is sent to `/api/holidays` with the holiday ID and updated fields.
4. The API validates:
   - The holiday exists (returns `404` if not found).
   - If type is provided, it must be one of `national`, `company`, or `optional` (returns `400` for invalid values).
5. An audit log is generated.

**Deleting a Holiday:**

1. Click the delete action on the target holiday.
2. Confirm the deletion.
3. A `DELETE` request is sent to `/api/holidays?id=<holiday_id>`.
4. The API validates existence and deletes the record.

**Filtering Holidays:**

- Use the **type** filter to view National, Company, or Optional holidays separately.
- Use the **year** filter to view holidays for a specific year (the API uses a `startsWith` match on the date field).
- Use the **search** input to find holidays by name or type.

### 4.6 Viewing Attendance Reports

1. Navigate to the **Attendance** tab.
2. Apply desired filters (Department, Shift, Status) to narrow the data.
3. The attendance table displays filtered records with real-time counts.
4. Review the **Weekly Attendance Overview** chart for aggregated daily trends.
5. Click **"Export Report"** to download the currently filtered attendance data as a report file.
6. For more detailed analytics, navigate to the **Analytics** module which pulls attendance data for trend analysis, department-wise comparisons, and predictive insights.

---

## 5. Leave Types & Policies

### 5.1 Casual Leave (CL)

**Purpose:** Casual Leave is intended for short-duration, unplanned personal needs such as family emergencies, urgent personal errands, or brief absences that cannot be scheduled in advance. It is the most commonly used leave type for day-to-day personal matters.

| Attribute | Value |
|---|---|
| Total Annual Entitlement | 12 days |
| Carry Forward | Not typically allowed; resets at fiscal year end |
| Advance Notice | Not mandatory but preferred; same-day application accepted |
| Approval | Requires manager approval via the system |
| Accumulation | Does not accumulate; use-it-or-lose-it policy |
| Encashment | Not encashable upon exit |
| Applicability | All full-time and part-time employees after probation |

**Usage Guidelines:**
- Casual Leave is typically used for durations of 1-3 days.
- For periods exceeding 3 days, employees should consider Earned Leave instead.
- Casual Leave cannot be combined with Sick Leave for the same period.
- Half-day Casual Leave is permitted (counts as 0.5 days).

### 5.2 Sick Leave (SL)

**Purpose:** Sick Leave provides employees with paid time off for medical reasons, including personal illness, injury, medical appointments, or quarantine. This leave type acknowledges that health-related absences are often unpredictable and should not penalize the employee.

| Attribute | Value |
|---|---|
| Total Annual Entitlement | 10 days |
| Carry Forward | Up to 5 days may be carried forward to the next year |
| Advance Notice | Not required; post-facto application within 2 working days |
| Medical Certificate | Required for absences exceeding 2 consecutive days |
| Approval | Manager approval required; HR may verify medical certificates |
| Accumulation | Up to a maximum of 30 days over career |
| Encashment | May be partially encashable at separation (company policy) |
| Applicability | All full-time employees from date of joining |

**Usage Guidelines:**
- Employees must apply for Sick Leave through the system within 2 working days of returning.
- Medical certificates must be uploaded or submitted to HR for leave exceeding 2 days.
- Sick Leave cannot be used for family member illness (use Casual Leave for that purpose).
- If Sick Leave balance is exhausted, further medical absences may be charged against Casual or Earned Leave with manager approval.

### 5.3 Earned Leave (EL) / Privilege Leave

**Purpose:** Earned Leave (also known as Privilege Leave) is planned leave accrued over the course of employment. It is intended for vacations, personal travel, or extended time off that can be planned in advance. This is the primary leave type for long-duration absences.

| Attribute | Value |
|---|---|
| Total Annual Entitlement | 15 days |
| Accrual Rate | 1.25 days per month of completed service |
| Carry Forward | Up to 10 days may be carried forward |
| Advance Notice | Minimum 5 working days for durations over 3 days |
| Approval | Manager approval required; may require team coverage plan |
| Accumulation | Maximum 30 days carry-forward balance |
| Encashment | Fully encashable upon resignation/retirement at basic salary rate |
| Applicability | All full-time employees after completion of 1 year of service |

**Usage Guidelines:**
- Earned Leave accrues monthly (1.25 days/month) and is available for use after accrual.
- For leave exceeding 5 consecutive days, employees should provide at least 5 working days' advance notice.
- Managers should ensure adequate team coverage before approving extended Earned Leave.
- Earned Leave can be combined with holidays or weekends for extended breaks.
- Unused Earned Leave at the end of the fiscal year may be carried forward (up to 10 days) or encashed per company policy.

### 5.4 Maternity Leave (ML)

**Purpose:** Maternity Leave is a statutory benefit provided to female employees during pregnancy, childbirth, and post-natal care. It ensures job protection and financial security during the maternity period, complying with the Maternity Benefit Act.

| Attribute | Value |
|---|---|
| Total Entitlement | 26 weeks (182 days) per delivery |
| Applicability | Female employees who have worked for at least 80 days in the past 12 months |
| Advance Notice | Written notice required at least 8 weeks before expected delivery |
| Medical Certificate | Mandatory; pre-natal and post-natal certificates required |
| Approval | HR Admin approval with medical documentation |
| Split Usage | Up to 8 weeks before delivery; remaining after delivery |
| Subsequent Children | 12 weeks for second and subsequent children |
| Pay | Full basic salary + allowances during leave period |
| Career Impact | No adverse impact on performance reviews or seniority |

**Usage Guidelines:**
- The employee must submit the leave application with the expected delivery date and medical certificate.
- Maternity Leave can commence up to 8 weeks before the expected delivery date.
- In case of miscarriage or medical termination, 6 weeks of paid leave is provided.
- For complications arising during pregnancy, additional leave may be granted under Sick Leave.
- The employee's position is protected during Maternity Leave; no role changes or terminations are permitted.

### 5.5 Paternity Leave (PL)

**Purpose:** Paternity Leave provides male employees with time off to support their spouse during childbirth and to assist with newborn care during the initial weeks. This leave recognizes the importance of paternal involvement in early childcare.

| Attribute | Value |
|---|---|
| Total Entitlement | 15 days per delivery |
| Applicability | Male employees (including adoptive fathers) with at least 6 months of service |
| Usage Window | Must be taken within 6 months of the child's birth |
| Advance Notice | Minimum 1 week notice preferred |
| Medical Certificate | Birth certificate of the child required |
| Approval | Manager approval with HR verification of birth certificate |
| Consecutive Usage | Must be taken in a single continuous block |
| Pay | Full basic salary + allowances during leave period |
| Career Impact | No adverse impact on performance reviews or seniority |

**Usage Guidelines:**
- Paternity Leave must be taken in a single continuous period and cannot be split.
- The leave must be utilized within 6 months of the child's birth; unused leave expires.
- In the case of adoption, the same entitlement applies from the date of adoption.
- Paternity Leave cannot be combined with Casual Leave for the same purpose but can be taken adjacent to Earned Leave.

---

## 6. Attendance Status Logic

### 6.1 Status Definitions

The Time & Attendance module uses four distinct statuses to classify each employee's daily attendance. These statuses directly impact payroll calculations and compliance reporting.

| Status | Badge Color | Description |
|---|---|---|
| **Present** | Emerald (Green) | Employee checked in on time (within shift start + grace time) and completed a full working day |
| **Late** | Amber (Yellow) | Employee checked in after the shift start time plus grace time but before the half-day threshold |
| **Absent** | Red | Employee has no attendance record for the day and no approved leave covering the date |
| **Half-day** | Sky Blue | Employee worked less than half the required hours (typically < 4-5 hours) or specifically marked as half-day |

### 6.2 Status Determination Algorithm

The attendance status is determined through the following logic, evaluated at the time of check-in and re-evaluated upon check-out:

```
IF no attendance record exists for the employee on the given date:
    AND no approved leave covers this date:
        → Status = "absent"
    AND approved leave covers this date:
        → No attendance record created; leave takes precedence

IF attendance record exists:
    Check-in time evaluation:
        IF checkIn <= (shift.startTime + shift.graceTime):
            → Initial status = "present"
        IF checkIn > (shift.startTime + shift.graceTime):
            → Initial status = "late"
        IF checkIn is NULL and no check-in recorded:
            → Status remains "absent" or is set by manager

    Check-out time evaluation (when checkOut is recorded):
        totalHours = checkOut - checkIn
        IF totalHours < halfDayThreshold (typically 4-5 hours):
            → Status = "half-day" (overrides "present" or "late")
        IF totalHours >= halfDayThreshold AND initial status was "late":
            → Status remains "late"
        IF totalHours >= fullDayThreshold (typically 8-9 hours):
            → Status = "present" (if originally "late" and total hours are compensatory)

Manual Override:
    Managers and HR Admins can manually set status to any valid value
    regardless of the algorithmic determination, with audit trail.
```

### 6.3 Grace Time Application

Grace time is the tolerance period added to the shift start time before an employee's check-in is considered "late." Each shift can have a different grace time configuration.

| Shift | Start Time | Grace Time | Late Threshold |
|---|---|---|---|
| Morning Shift | 09:00 | 15 min | 09:15 |
| Evening Shift | 14:00 | 10 min | 14:10 |
| Night Shift | 22:00 | 10 min | 22:10 |
| General Shift | 10:00 | 15 min | 10:15 |

**Examples:**
- An employee on the Morning Shift checking in at 09:10 → **Present** (within 15-min grace)
- An employee on the Morning Shift checking in at 09:20 → **Late** (exceeded 15-min grace)
- An employee on the Evening Shift checking in at 14:12 → **Late** (exceeded 10-min grace)
- An employee on the General Shift checking in at 10:14 → **Present** (within 15-min grace)

### 6.4 Half-Day Logic

A half-day status is applied when the total working hours fall below the half-day threshold. The system uses the following rules:

- **Automatic half-day:** If the employee checks out before completing half the required working hours (e.g., before 13:00 for the Morning Shift with a 9-hour workday).
- **Manual half-day:** An employee or manager can explicitly mark attendance as "half-day" through the system.
- **Late arrival + early departure:** If an employee arrives late AND leaves early, resulting in total hours below the half-day threshold, the status is "half-day" rather than "late."
- **Leave integration:** Half-day attendance can be combined with half-day Casual Leave to cover the other half of the working day.

---

## 7. Integration with Other Modules

### 7.1 Payroll Module

The Time & Attendance module has a critical integration with the Payroll module. Attendance data directly influences salary calculations in the following ways:

- **Present Days Count:** The number of days an employee is marked "present" or "half-day" forms the basis for salary computation. The payroll system queries attendance records for the given month to determine the actual working days.
- **Absenteeism Deductions:** Days marked as "absent" (without approved leave) result in per-day salary deductions. The payroll module calculates: `Deduction = (Basic Salary / Total Working Days) × Absent Days`.
- **Late Arrival Tracking:** While a single late arrival may not trigger a salary deduction, habitual late arrivals (configurable threshold, e.g., 3+ per month) may result in a half-day deduction per company policy.
- **Leave Deductions:** Approved leave is paid leave and does not affect salary. However, if leave balances are exhausted and the employee takes additional leave, the excess days are treated as unpaid leave.
- **Overtime Calculation:** If an employee's total hours exceed the standard shift duration consistently, the excess hours may be flagged for overtime computation in the payroll module.

**Data Flow:**
```
Attendance Records (monthly) → Payroll Module
    → Present/Late/Absent counts per employee
    → Total working hours per employee
    → Leave days consumed per employee
    → Payroll calculates: Gross Pay - Deductions = Net Pay
```

### 7.2 Employee Management Module

The Time & Attendance module depends on the Employee Management module for core employee data:

- **Employee Identity:** Attendance and leave records reference the `employeeId` from the `Employee` model. When displaying attendance tables, the system joins with the Employee table to show the employee's name, department, and avatar.
- **Department Information:** Department-wise attendance filtering relies on the department field from the Employee model. The filter dropdown dynamically populates from unique department values in the attendance data.
- **Reporting Structure:** Leave approval routing uses the `reportingTo` field from the Employee model to determine which manager should receive the leave request for approval.
- **Employee Status:** Only employees with `status: "active"` are expected to mark attendance. Employees with "inactive," "onboarding," or "exited" status should not appear in attendance tracking.
- **Contract Type Impact:** Part-time and contract employees may have different attendance requirements and shift assignments, configured through the employee profile.

### 7.3 Self-Service Module

The Self-Service module provides employees with quick access to their own attendance and leave data without navigating to the full Time & Attendance module:

- **Attendance Summary:** Employees can view their monthly attendance summary from the Self-Service portal.
- **Leave Balances:** Current leave balances across all types are visible in the Self-Service dashboard.
- **Quick Leave Application:** A shortcut to the leave application form is available from Self-Service.
- **Attendance Regularization:** Employees can submit requests to correct attendance records (e.g., forgot to check in) through Self-Service, which routes to the manager for approval.

### 7.4 Analytics Module

The Analytics module consumes attendance data for workforce insights and predictive modeling:

- **Attendance Trends:** Daily, weekly, and monthly attendance trend analysis across departments and teams.
- **Absenteeism Patterns:** Identification of employees or departments with high absenteeism rates, enabling proactive HR intervention.
- **Late Arrival Heatmaps:** Visualization of late-arrival patterns by day of week, time of day, and department.
- **Leave Utilization Reports:** Analysis of leave consumption patterns by type, department, and season.
- **Workforce Availability:** Real-time dashboard showing how many employees are present, on leave, or absent across the organization.
- **AI-Powered Insights:** The AI engine may analyze attendance patterns to predict attrition risk, identify burnout indicators (excessive overtime), and recommend optimal leave scheduling to avoid team coverage gaps.

---

## 8. Role-Based Views

### 8.1 Employee View

Employees have the most restricted view within the Time & Attendance module, focused on their own data:

**Attendance Tab:**
- Can mark their own attendance (check-in/check-out) using the "Mark Attendance" button.
- Can view only their own attendance records in the table (filtered by their employeeId).
- Can see organization-wide summary statistics (Present, Late, Absent, On Leave counts).
- Cannot edit or delete attendance records.
- Cannot export attendance reports.
- Can view the weekly attendance chart for their own data.

**Leave Management Tab:**
- Can apply for leave using the "Apply Leave" dialog.
- Can view their own leave balances (Casual: 12, Sick: 10, Earned: 15, Maternity/Paternity: 180).
- Can view their own leave request history with status badges.
- Cannot approve or reject any leave requests.
- Can cancel their own pending leave requests (status transition: pending → cancelled).

**Shifts & Holidays Tab:**
- Can view the list of shifts (read-only).
- Can view the holiday calendar.
- Cannot create, edit, or delete shifts or holidays.

**Geofencing Tab:**
- Can view geofence check-in data for their own records.
- Cannot modify geofence radius or location settings.

### 8.2 Manager View

Department Managers have expanded visibility and action capabilities over their team members:

**Attendance Tab:**
- All Employee capabilities, plus:
- Can view attendance records for all employees in their reporting chain.
- Can filter attendance by department (their own department(s)).
- Can export attendance reports for their team.
- Can edit attendance records for their team members (corrections).
- Can see the weekly attendance chart aggregated for their department.

**Leave Management Tab:**
- All Employee capabilities, plus:
- Can view leave requests from their team members.
- Can **approve** or **reject** pending leave requests with one click.
- Approval/rejection automatically sets the `approvedBy` field to the manager's name.
- Can view leave balances for their team members.
- Cannot override leave balances or create leave requests on behalf of employees.

**Shifts & Holidays Tab:**
- Can view shifts and holidays (read-only).
- Cannot create, edit, or delete shifts or holidays.

**Geofencing Tab:**
- Can view geofence check-in data for their team members.
- Cannot modify geofence configuration.

### 8.3 HR Admin View

HR Administrators have comprehensive access across the entire Time & Attendance module:

**Attendance Tab:**
- All Manager capabilities, plus:
- Can view attendance records for ALL employees across all departments.
- Can edit any employee's attendance record (status, check-in, check-out, notes).
- Can delete attendance records (with appropriate confirmation).
- Can export organization-wide attendance reports.
- Can apply all filters (department, shift, status) across the full dataset.

**Leave Management Tab:**
- All Manager capabilities, plus:
- Can approve or reject any leave request in the system.
- Can override leave status transitions beyond the normal flow.
- Can view leave balances and utilization for all employees.
- Can delete leave records if necessary.

**Shifts & Holidays Tab:**
- Full CRUD access for shifts: create, edit, and delete shifts.
- Full CRUD access for holidays: create, edit, and delete holidays.
- Can configure holiday types (National, Company, Optional).
- Can set and modify grace times for each shift.

**Geofencing Tab:**
- Can configure geofence radius and authorized locations.
- Can view geofence verification status for all employees.

---

## 9. Business Rules

### 9.1 Duplicate Attendance Check

**Rule:** An employee can only have one attendance record per date. The API enforces this by checking for an existing record with the same `employeeId` and `date` combination before creating a new one.

**Implementation:** The `POST /api/attendance` endpoint performs a `findFirst` query with `where: { employeeId, date }`. If a matching record exists, the API returns:

```json
{
  "error": "Attendance record already exists for this employee on this date"
}
```

**HTTP Status:** `409 Conflict`

**Implications:**
- Employees cannot accidentally mark attendance twice for the same day.
- To correct attendance data, use `PATCH /api/attendance` with the existing record's ID.
- The duplicate check applies at the database query level; it is not enforced by a unique constraint in the Prisma schema (consider adding `@@unique([employeeId, date])` for database-level enforcement).

### 9.2 Leave Status Transitions

**Valid Transitions:**

```
pending  →  approved   (Manager/HR action)
pending  →  rejected   (Manager/HR action)
pending  →  cancelled  (Employee action)
```

**Invalid Transitions (blocked by API):**

- `approved → pending` — Once approved, a leave cannot be set back to pending.
- `rejected → pending` — Once rejected, a leave cannot be set back to pending.
- `approved → rejected` — Cannot reject an already-approved leave.
- `rejected → approved` — Cannot approve an already-rejected leave.

**Exception:** The `cancelled` status can be set from any other status as a special override (the API allows `cancelled` as a valid transition regardless of current status, enabling employees to withdraw leave requests even after approval in exceptional circumstances).

**API Validation:** The `PATCH /api/leaves` endpoint enforces these rules:

```typescript
if (status) {
  if (!['approved', 'rejected', 'cancelled'].includes(status)) {
    return 400; // Invalid status value
  }
  if (existingLeave.status !== 'pending' && status !== 'cancelled') {
    return 409; // Already processed
  }
}
```

### 9.3 Grace Time Rules

Grace time is the buffer period added to the shift start time before an arrival is considered "late." The following rules govern grace time behavior:

1. **Shift-Level Configuration:** Grace time is defined at the shift level in the `Shift` model (`graceTime` field, integer representing minutes). Different shifts can have different grace times.
2. **Default Values:** The seed data provides the following defaults:
   - Morning Shift: 15 minutes (late threshold: 09:15)
   - Evening Shift: 10 minutes (late threshold: 14:10)
   - Night Shift: 10 minutes (late threshold: 22:10)
   - General Shift: 15 minutes (late threshold: 10:15)
3. **Modification:** Only HR Admin and Super Admin can modify shift grace times.
4. **Zero Grace Time:** A grace time of `0` means the employee must check in exactly at or before the shift start time to be marked "present." Any check-in after the start time is "late."
5. **Null Grace Time:** If `graceTime` is `null` or not set, the system defaults to `0` (no grace period).
6. **Retroactive Changes:** Changing a shift's grace time does NOT retroactively recalculate existing attendance records. Only new records are affected by the updated grace time.

### 9.4 Attendance Status Validation

When updating an attendance record via `PATCH /api/attendance`, the `status` field must be one of the four valid values:

| Valid Value | Meaning |
|---|---|
| `present` | Full-day attendance |
| `absent` | No attendance |
| `late` | Late arrival but full-day attendance |
| `half-day` | Partial-day attendance |

**API Validation:**
```typescript
if (status && ['present', 'absent', 'late', 'half-day'].includes(status)) {
  updateData.status = status;
}
```

Any other value for the `status` field is silently ignored (the field is not updated, and no error is returned). This behavior should be noted as a potential improvement area — the API could return a `400 Bad Request` for invalid status values instead.

### 9.5 Employee Existence Validation

Both the attendance and leave APIs validate that the referenced employee exists before creating a record:

- `POST /api/attendance`: Returns `404 Not Found` with `"Employee not found"` if the employeeId does not exist.
- `POST /api/leaves`: Returns `404 Not Found` with `"Employee not found"` if the employeeId does not exist.

This prevents orphan records where attendance or leave data references a non-existent employee.

### 9.6 Audit Trail Requirements

All mutations (create, update, delete) in the Time & Attendance module generate audit log entries in the `AuditLog` model:

| Action | Module | Details Example |
|---|---|---|
| `create` | `attendance` | "Attendance record created for Rajesh Kumar on 2024-01-15" |
| `update` | `attendance` | "Attendance record updated for Rajesh Kumar on 2024-01-15" |
| `delete` | `attendance` | "Attendance record deleted for employee on 2024-01-15" |
| `create` | `leave` | "Leave request created by Sneha Reddy: Casual Leave from 2024-02-01 to 2024-02-05" |
| `update` | `leave` | "Leave request approved for Sneha Reddy: Casual Leave (2024-02-01 - 2024-02-05)" |
| `delete` | `leave` | "Leave request deleted: Casual Leave (2024-02-01 - 2024-02-05)" |
| `create` | `attendance` | "Created shift: Morning Shift (09:00 - 18:00) Grace: 15min" |
| `create` | `attendance` | "Created holiday: Independence Day on 2024-08-15 (national)" |

Audit logs include the `employeeId` of the affected employee (for attendance and leave), the action performed, the module, and a human-readable details string. Shift and holiday audit logs use the generic `attendance` module since they are configuration data within the same domain.

### 9.7 Pagination

All list endpoints return paginated data with the following structure:

```json
{
  "records": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

Default pagination limits:
- Attendance: 20 records per page
- Leaves: 10 records per page
- Shifts: 10 records per page
- Holidays: 10 records per page

---

## 10. Troubleshooting

### 10.1 "Attendance record already exists for this employee on this date"

**Symptom:** When an employee clicks "Mark Attendance," the system returns a 409 Conflict error.

**Cause:** An attendance record for the same employee and date already exists in the database. This typically happens when:
- The employee accidentally clicks the "Mark Attendance" button multiple times.
- The system did not refresh the UI after the first successful check-in.
- A manager or HR Admin already created an attendance record for the employee.

**Resolution:**
1. Check the attendance table to see if a record exists for today's date.
2. If a record exists with only a check-in time (no check-out), the employee should use the check-out functionality (PATCH) rather than creating a new record.
3. If the record was created in error, a manager or HR Admin should delete the duplicate record via `DELETE /api/attendance?id=<record_id>`.
4. To prevent future occurrences, the "Mark Attendance" button should be disabled after a successful check-in until the record is checked out.

### 10.2 "Leave request has already been processed"

**Symptom:** A manager attempting to approve or reject a leave request receives a 409 Conflict error.

**Cause:** The leave request is no longer in the "pending" status — it has already been approved, rejected, or cancelled by another authorized user.

**Resolution:**
1. Refresh the leave request list to see the current status.
2. If the status is "approved" and needs to be reversed, the manager should contact HR Admin who can delete the leave record and ask the employee to reapply.
3. If the status is "rejected" and the employee believes it should be reconsidered, the employee should submit a new leave request.
4. Implement UI-level locking: once a manager clicks Approve or Reject, disable the action buttons for that request immediately to prevent double-processing.

### 10.3 Attendance Statistics Show Zero Counts

**Symptom:** The Present Today, Late Arrivals, Absent, and On Leave cards all show 0.

**Cause:**
- No attendance records have been created for the current date.
- The API is returning an empty array (possibly due to database connection issues).
- The employee database ID (`currentEmployeeDbId`) is not being set correctly, preventing attendance marking.

**Resolution:**
1. Verify that the database connection is working by checking other modules (e.g., Employee Management).
2. Check the browser console for API errors.
3. Ensure that the employee profile is correctly linked to the logged-in user account.
4. If the data is genuinely empty (first day of deployment), click "Mark Attendance" to create the first record.
5. If the API returns data but the stats are zero, check the status field values in the database — they must match exactly ("present", "late", "absent", "half-day") with lowercase spelling.

### 10.4 Leave Balance Cards Show Incorrect Values

**Symptom:** The leave balance cards show default/placeholder values (12, 10, 15, 180) that don't match the employee's actual leave balance.

**Cause:** The leave balance cards currently use hardcoded demo values in the frontend component rather than computing balances from the leave records in the database.

**Resolution:**
1. This is a known limitation in the current implementation. The leave balance should be computed dynamically by:
   - Querying the employee's leave entitlement from a configuration or policy model.
   - Subtracting the sum of approved leave days for the current year from the entitlement.
   - Displaying the calculated remaining balance.
2. As a temporary workaround, HR Admins can manually track leave balances in a spreadsheet or external system.
3. For a permanent fix, implement a `LeaveBalance` model or server-side computed field that aggregates approved leave days per type per year.

### 10.5 Weekly Attendance Chart Shows Default Data

**Symptom:** The Weekly Attendance Overview chart shows static demo data (Mon: 148 present, etc.) regardless of actual attendance records.

**Cause:** The chart component includes fallback demo data that is displayed when no attendance records are returned from the API. This happens when:
- The database has no attendance records for the current week.
- The API query fails silently.
- The date format in the attendance records doesn't match the chart's date parsing.

**Resolution:**
1. Check the attendance API response in the browser's network tab to verify data is being returned.
2. Ensure attendance records have valid date strings in the `YYYY-MM-DD` format.
3. If data exists but the chart still shows defaults, verify the `weeklyAttendance` memoized computation is correctly parsing dates and aggregating counts.
4. The chart should ideally display an empty state or "No data available" message instead of demo data to avoid confusion.

### 10.6 Geofence Verification Shows Inconsistent Results

**Symptom:** The geofence verification status alternates between verified and unverified for the same location, or the distance measurement appears random.

**Cause:** The current geofence implementation generates distance values using `Math.random()` as a placeholder rather than actual GPS coordinate calculations. This means:
- Distance values are randomized on each render.
- Verification status is based on whether the location string contains "remote" or is a dash ("—"), not on actual proximity to the office.

**Resolution:**
1. This is a known placeholder implementation. For production use, replace the random distance generation with the Haversine formula using actual GPS coordinates.
2. Implement proper geofence validation:
   - Store office coordinates (latitude/longitude) and the authorized radius in the database.
   - On check-in, capture the device's GPS coordinates.
   - Calculate the actual distance from the office using the Haversine formula.
   - Mark as "verified" if within the configured radius; otherwise, flag for manual review.
3. The geofence radius slider (default 500m) should be persisted per office location and respected during verification.

### 10.7 API Returns 500 Internal Server Error

**Symptom:** Any Time & Attendance API endpoint returns a 500 status code.

**Cause:**
- Database connection failure (PostgreSQL not accessible).
- Prisma client not initialized or out of sync with the schema.
- Invalid data types in request body (e.g., non-numeric `days` field for leave).
- Missing required fields that the database schema expects but the API doesn't validate.

**Resolution:**
1. Check the server logs for the specific error message.
2. Verify the `DATABASE_URL` environment variable is correctly set.
3. Run `npx prisma generate` to sync the Prisma client with the schema.
4. Run `npx prisma db push` to ensure the database schema matches.
5. Validate request payloads match the expected types (especially `days` as Float for leaves, `graceTime` as Int for shifts).
6. If the error persists, check for data integrity issues in the database (e.g., foreign key violations).

### 10.8 Shift Deletion Causes Data Inconsistency

**Symptom:** After deleting a shift, attendance records still reference the deleted shift name, but new records cannot be created for that shift.

**Cause:** The `Shift` model and `Attendance` model are not linked by a foreign key. The `shift` field in the Attendance model is a simple String, not a relation. Deleting a shift does not cascade or nullify the `shift` field in existing attendance records.

**Resolution:**
1. Before deleting a shift, check for attendance records that reference it:
   ```
   GET /api/attendance?shift=<shift_name>
   ```
2. If records exist, either:
   a. Reassign those records to a different shift via bulk PATCH, or
   b. Set the shift field to null before deleting the shift definition.
3. For a long-term fix, consider adding a foreign key relation between Attendance and Shift, or implementing soft-delete for shifts (mark as "inactive" instead of deleting).

---

**Document End**

*This SOP is a living document and should be updated whenever the Time & Attendance module undergoes feature changes, API modifications, or business rule updates. All changes must be reviewed by the HR Operations team and approved by the HR Admin before publication.*
