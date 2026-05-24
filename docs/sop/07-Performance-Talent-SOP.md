# Standard Operating Procedure: Performance & Talent Module

**Document ID:** SOP-HRMS-07  
**Module Key:** `performance`  
**Version:** 1.0  
**Last Updated:** 2025-03-04  
**Classification:** Internal — HR Operations  

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [OKR Framework](#5-okr-framework)
6. [Rating & Attrition Risk](#6-rating--attrition-risk)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Role-Based Access](#8-role-based-access)
9. [Business Rules](#9-business-rules)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Performance & Talent Module is the central performance management and talent retention engine of the AI-HRMS platform. It provides a structured, data-driven system for managing the entire performance review lifecycle — from objective setting and self-assessment through manager feedback and final review completion. The module is designed to replace ad-hoc, spreadsheet-based performance tracking with a unified workflow that ensures consistency, fairness, and transparency across all departments. By integrating AI-powered attrition risk scoring, the module goes beyond traditional performance management to proactively identify flight-risk employees, enabling HR teams and managers to take preemptive retention actions before valuable talent departs.

The module supports the OKR (Objectives and Key Results) framework natively, storing objectives as structured JSON data that links individual goals to organizational priorities. Each performance review record captures quantitative ratings, qualitative feedback, self-assessments, and achievement documentation, providing a holistic view of employee performance. The status-driven workflow (draft → in-review → completed) enforces a controlled review cadence, preventing premature completion and ensuring that both employees and managers have the opportunity to contribute before a review is finalized. This systematic approach reduces bias, increases accountability, and delivers actionable talent intelligence to organizational leadership.

### 1.2 Scope

This SOP covers all operations related to performance review and talent management within the AI-HRMS application, including:

- Performance review creation, editing, viewing, and deletion (CRUD operations)
- OKR (Objectives and Key Results) definition, tracking, and progress measurement
- Self-review submission and self-assessment workflows
- Manager review, feedback delivery, and rating assignment
- Review cycle status management (draft → in-review → completed)
- AI-powered attrition risk scoring and monitoring (0–1 scale)
- Performance rating visualization and historical tracking
- Attrition risk threshold alerting and escalation
- Integration touchpoints with Employee Management, Talent Acquisition, L&D, Analytics, and Self-Service modules
- Role-based access controls governing each operation and data visibility

Out of scope: Compensation planning and salary adjustment workflows (handled by the Payroll module), recruitment pipeline management (handled by the Talent Acquisition module), and course enrollment and training delivery (handled by the Learning & Development module), although this module provides data inputs that inform those modules.

### 1.3 Target Users

| User Role | Description |
|---|---|
| **Super Admin** | Full system access — can perform all CRUD operations on performance reviews, view and manage reviews for any employee across all departments, configure system-level settings including attrition risk thresholds, and access analytics dashboards for organizational talent insights. |
| **HR Admin** | Primary operator of this module — responsible for initiating review cycles, monitoring completion rates, reviewing attrition risk reports, ensuring compliance with review timelines, and providing oversight on calibration across departments. Has full read/write access to all performance data. |
| **Department Manager** | Responsible for conducting reviews for their direct reports — setting objectives, providing feedback, assigning ratings, and reviewing self-assessments. Can only access and manage performance reviews for employees within their own department. Cannot delete reviews or override completed statuses. |

### 1.4 AI Capabilities

The module integrates AI in one primary area with significant organizational impact:

1. **AI Attrition Risk Scoring** — Automatically computed attrition risk probability for each employee on a continuous 0–1 scale. The score is generated using a multi-factor heuristic that analyzes performance trends, rating trajectories, review engagement patterns, and comparative departmental metrics. Scores are displayed with color-coded severity indicators: green (0.00–0.29, low risk), amber (0.30–0.59, moderate risk), and red (0.60–1.00, high risk). This enables proactive retention interventions rather than reactive responses to resignation notices.

### 1.5 Technical Reference

| Property | Value |
|---|---|
| **Component** | `src/components/hrms/Performance.tsx` |
| **API Routes** | `GET/POST/PATCH/DELETE /api/performance` |
| **Prisma Model — Performance** | id, employeeId, reviewPeriod, reviewerId, rating (0–5), objectives (JSON OKRs), achievements, feedback, selfReview, goals, attritionRisk (0–1), status (draft/in-review/completed) |
| **Database** | PostgreSQL via Prisma ORM |
| **AI Feature** | Attrition risk scoring (0–1 scale) |

---

## 2. Access & Navigation

### 2.1 Accessing the Module from the Sidebar

The Performance & Talent module is accessed through the main navigation sidebar of the AI-HRMS application. The sidebar is present on every page and provides persistent navigation across all modules. Follow these steps to navigate to the Performance module:

1. **Locate the Sidebar:** On desktop viewports (768px and above), the sidebar is fixed on the left side of the screen. On mobile viewports (below 768px), tap the hamburger menu icon (≡) in the top-left corner to open the sidebar as a slide-out drawer.

2. **Identify the Module:** In the sidebar navigation list, find the item labeled **"Performance"** with a TrendingUp (or BarChart3) icon. The module is positioned among the HRMS modules section, following the Time & Attendance module. The Performance module displays an **"AI" badge** indicator next to its label, signifying its AI-powered attrition risk scoring capability.

3. **Click to Navigate:** Click or tap the "Performance" item. The sidebar highlights the active module with an emerald-colored left indicator bar and a tinted background. The main content area transitions to display the Performance & Talent screen.

4. **Collapsed Sidebar:** If the sidebar is in its collapsed state (showing only icons), hover over the TrendingUp icon to reveal a tooltip labeled "Performance," then click to navigate. To expand the sidebar, click the expand button (chevron-right icon) on the sidebar's right edge.

### 2.2 Direct URL Access

Authenticated users with the appropriate role can also access the module directly via the application URL. The module renders as the primary content view when the `activeModule` state in the global Zustand store is set to `"performance"`. Direct navigation is only permitted for users who hold one of the three authorized roles: Super Admin, HR Admin, or Department Manager. Users without the required role will see an access-denied message if they attempt to navigate to this module.

### 2.3 Module Header

Upon entering the module, the screen header displays:

- **Module Title:** "Performance & Talent" with a TrendingUp icon in an emerald-styled container
- **AI Badge:** An "AI Powered" indicator highlighting the attrition risk scoring feature
- **Total Reviews Count Badge:** Showing the total number of performance reviews in the system (e.g., "38")
- **Quick Stats:** A subtitle line showing review status distribution (e.g., "12 draft · 8 in-review · 18 completed")
- **Search Bar:** A full-text search input for searching by employee name, review period, or reviewer
- **Filter Controls:** Dropdowns for status, department, and review period filtering
- **New Review Button:** A prominent emerald-colored button to initiate a new performance review

---

## 3. Screen Descriptions

### 3.1 Performance Review List

The performance review list is the primary view of the module and occupies the main content area. It presents a paginated, filterable, and searchable listing of all performance reviews in the system.

**Table Columns:**

| Column | Description | Visibility |
|---|---|---|
| **Employee** | Displays the employee's avatar initials circle (emerald background with first+last name initials), full name, and employee ID below. | Always visible |
| **Review Period** | The review period label (e.g., "Q1 2025", "FY 2024-25") displayed in a monospace code badge. | Always visible |
| **Reviewer** | The name of the assigned reviewer (manager or HR admin) with a User icon. | Hidden on screens below `md` (768px) |
| **Rating** | A star-based or numeric rating display (0.0–5.0) with color coding: emerald (≥4.0), amber (2.5–3.9), red (<2.5). Displays "—" for draft reviews without a rating. | Always visible |
| **Attrition Risk** | A color-coded badge displaying the attrition risk score: green (0.00–0.29), amber (0.30–0.59), red (0.60–1.00). Displays "—" if not yet computed. Includes an "AI" micro-badge. | Hidden on screens below `sm` (640px) |
| **Status** | A colored badge indicating review status — Draft (slate/gray), In Review (amber), Completed (emerald). | Always visible |
| **Actions** | Three icon buttons: View (eye icon, emerald), Edit (pencil icon, amber), Delete (trash icon, red, restricted to Super Admin and HR Admin only). | Always visible |

**Table Footer:** Displays a summary line "Showing X of Y reviews" with the filtered count and total count.

**Empty State:** When no reviews match the current search/filter criteria, the table displays a centered empty state with a search icon, "No performance reviews found" message, and a hint to adjust search or filters.

**Loading State:** While data is being fetched, a centered spinner with "Loading reviews..." text is displayed. If an error occurs, an error message with a "Retry" button appears.

### 3.2 Review Detail View (Side Sheet)

Clicking the View (eye) icon on any review row opens a right-side Sheet panel (max-width: 576px on desktop, full-width on mobile) displaying comprehensive review information organized into sections:

**Sheet Header:**
- Large initials avatar circle (emerald background) for the reviewed employee
- Employee full name and designation + review period subtitle
- Status badge and rating display

**Sections within the Detail View:**

1. **Review Status & Rating (TrendingUp icon):**
   - Current status badge (Draft / In Review / Completed)
   - Numeric rating with star visualization (0.0–5.0 scale)
   - Reviewer name and assignment date
   - Attrition risk score gauge with AI badge and color-coded severity

2. **Objectives / OKRs (Target icon):**
   - Count badge showing number of objectives
   - Each objective displayed as a bordered card with:
     - Objective title and description
     - Key Results listed with individual progress indicators
     - Overall objective completion percentage with progress bar
   - Empty state: "No objectives defined" message

3. **Achievements (Award icon):**
   - Free-text achievements documentation
   - Formatted display of employee accomplishments for the review period
   - Empty state: "No achievements recorded" message

4. **Self-Review (User icon):**
   - The employee's self-assessment text
   - Self-evaluated strengths, areas for improvement, and career aspirations
   - Empty state: "Self-review not yet submitted" message with prompt indicator

5. **Manager Feedback (MessageSquare icon):**
   - The reviewer's feedback narrative
   - Constructive comments, recognition, and development recommendations
   - Empty state: "Feedback not yet provided" message

6. **Goals (Flag icon):**
   - Forward-looking goals for the next review period
   - Development objectives and career progression targets
   - Empty state: "No goals defined" message

### 3.3 OKR Tracking View

The OKR tracking view provides a dedicated visualization of objectives and key results across the organization. It allows managers and HR administrators to monitor OKR progress at a glance and identify objectives that are at risk of non-completion.

**OKR Dashboard Cards:**

Each OKR is rendered as a card in a responsive grid layout (1 column on mobile, 2 on medium, 3 on large screens). Each card displays:

- **Objective Title** — Bold header text describing the high-level goal
- **Owner** — The employee responsible, shown with initials avatar and name
- **Review Period** — Badge indicating the associated review period
- **Key Results List** — Each key result displayed with:
  - Description text
  - Current value vs. target value (e.g., "7 / 10")
  - Individual progress bar with percentage
  - Status indicator: On Track (emerald), At Risk (amber), Behind (red)
- **Overall Progress** — Aggregated completion percentage with a large progress bar
- **Expand/Collapse** — Toggle to show/hide detailed key result breakdowns

**OKR Summary Statistics:**

A statistics row at the top displays aggregate OKR metrics:

| Stat Card | Description | Icon |
|---|---|---|
| Total Objectives | Count of all objectives across all reviews | Target (emerald) |
| Average Completion | Mean completion percentage across all objectives | BarChart3 (cyan) |
| At Risk | Count of objectives with < 40% completion | AlertTriangle (amber) |
| Completed | Count of objectives with 100% completion | CheckCircle (teal) |

### 3.4 Rating Visualization

The rating visualization provides graphical representations of performance ratings across the organization, enabling calibration and distribution analysis.

**Rating Distribution Chart:**

- A bar chart or histogram showing the distribution of ratings across the 0–5 scale
- X-axis: Rating values (0, 1, 2, 3, 4, 5) with half-point increments
- Y-axis: Number of employees receiving each rating
- Color coding: Red (0–1.9), Amber (2.0–2.9), Emerald (3.0–5.0)
- Filterable by department, review period, and reviewer

**Rating Trends:**

- A line chart showing average rating trends over consecutive review periods
- Allows identification of improving, declining, or stable performance trajectories
- Department-level and organization-level trend lines for comparison

**Individual Rating History:**

- When viewing an employee's review detail, a mini sparkline chart shows their rating progression across review periods
- Highlights upward or downward trends with green or red directional indicators

### 3.5 Attrition Risk Display

The attrition risk display is a dedicated visualization of AI-computed attrition risk scores across the organization. This view is critical for proactive talent retention.

**Attrition Risk Dashboard:**

| Component | Description |
|---|---|
| **Risk Distribution Gauge** | A semi-circular gauge showing the overall organizational attrition risk level (low/moderate/high) based on the average attrition risk score |
| **Risk Tier Breakdown** | Three cards showing counts of employees in each risk tier: Low (0.00–0.29), Moderate (0.30–0.59), High (0.60–1.00) |
| **High-Risk Employee List** | A prioritized table listing employees with attrition risk ≥ 0.60, sorted by risk score descending. Columns: Employee Name, Department, Current Rating, Attrition Risk Score, Last Review Date, Recommended Action |
| **Department Heatmap** | A color-coded grid showing average attrition risk by department, enabling identification of departments with systemic retention challenges |
| **Trend Over Time** | A line chart showing how attrition risk scores have changed over consecutive review periods for the organization and per department |

**Risk Score Badge on Review Cards:**

Each performance review card and list row includes an attrition risk badge:

- **Green Badge (0.00–0.29):** Label "Low Risk" with the numeric score (e.g., "0.15")
- **Amber Badge (0.30–0.59):** Label "Moderate Risk" with the numeric score (e.g., "0.42")
- **Red Badge (0.60–1.00):** Label "High Risk" with the numeric score (e.g., "0.78")
- All badges include an "AI" micro-badge to indicate the score was algorithmically generated

### 3.6 Self-Review Form

The self-review form allows employees to submit their self-assessment as part of the performance review cycle. This form is embedded within the review detail view or accessible through the Self-Service module.

**Form Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| **Self-Assessment** | Multi-line textarea | Yes | Free-text self-evaluation covering accomplishments, challenges, and contributions during the review period |
| **Key Achievements** | Multi-line textarea | No | Specific achievements the employee wants to highlight for the reviewer |
| **Challenges Faced** | Multi-line textarea | No | Obstacles or difficulties encountered and how they were addressed |
| **Areas for Improvement** | Multi-line textarea | No | Self-identified areas where the employee seeks development or support |
| **Career Aspirations** | Multi-line textarea | No | Short-term and long-term career goals the employee wants to communicate |
| **Goals for Next Period** | Multi-line textarea | No | Objectives and targets the employee proposes for the upcoming review cycle |

**Form Behavior:**

- The self-review form is only available when the review status is `draft` or `in-review`. It is locked once the review reaches `completed` status.
- The form auto-saves as a draft when the employee pauses typing (debounced at 2 seconds).
- A "Submit Self-Review" button finalizes the submission, changing the self-review status indicator from "Pending" to "Submitted."
- After submission, the form becomes read-only for the employee, though the manager can still add feedback.
- The self-review content is visible to the assigned reviewer and HR Admin roles, but not to other employees.

---

## 4. Functional Workflows

### 4.1 Initiating a Performance Review

**Objective:** Create a new performance review record for an employee, setting the foundation for the review cycle.

**Pre-conditions:** User must have Super Admin or HR Admin role. The employee must exist in the Employee Management module. The review period must be defined.

**Steps:**

1. Navigate to the **Performance & Talent** module from the sidebar.
2. Click the **"New Review"** button (emerald, with Plus icon) in the module header. This opens the review creation dialog.
3. Fill in the required and optional fields:
   - **Employee** (required) — Select from a dropdown of active employees, populated from the Employee Management module. The dropdown shows employee name, ID, and department for easy identification.
   - **Review Period** (required) — Enter the review period label (e.g., "Q1 2025", "H1 2025", "FY 2024-25"). This is a free-text field that identifies the review cycle.
   - **Reviewer** (required) — Select the assigned reviewer from a dropdown. By default, this is pre-populated with the employee's reporting manager (derived from the `reportingTo` field in the Employee record). The dropdown lists all managers and HR admins.
   - **Objectives / OKRs** (optional at creation) — JSON-formatted objectives can be added now or later (see Section 4.2).
   - **Goals** (optional) — Forward-looking goals for the next period. Can be added now or later.
4. Click **"Create Review"** to submit. The button shows a loading spinner during submission.
5. On success:
   - The dialog closes and the review list refreshes.
   - A new performance review record is created with `status: 'draft'`, `rating: null` (not yet assigned), and `attritionRisk: null` (not yet computed).
   - A success toast appears: "Review Created — Performance review for {employeeName} ({reviewPeriod}) has been initiated."
6. On failure, an error toast appears with the API error message (e.g., "An active review already exists for this employee in this period"). The dialog remains open for corrections.

**API Call:** `POST /api/performance` with JSON body containing `employeeId`, `reviewPeriod`, `reviewerId`, and optionally `objectives`, `goals`. The API validates that the employee exists, the reviewer exists, and no duplicate active review exists for the same employee and period.

**Post-conditions:** A new Performance record exists with status `draft`. The employee and reviewer are linked via their respective foreign keys. The review is now visible in the performance review list.

### 4.2 Setting OKRs and Objectives

**Objective:** Define Objectives and Key Results (OKRs) for a performance review, establishing measurable goals for the review period.

**Pre-conditions:** A performance review record must exist in `draft` or `in-review` status. User must have Super Admin, HR Admin, or Department Manager role (manager can only set OKRs for their own reports).

**Steps:**

1. Locate the performance review in the list table using search or filters.
2. Click the **Edit** (pencil) icon on the review row, or click **View** and then select "Edit OKRs" from the detail sheet.
3. In the OKR editor section, click **"Add Objective"** to create a new objective entry.
4. For each objective, fill in:
   - **Objective Title** (required) — A concise, inspiring statement of the goal (e.g., "Improve product quality metrics").
   - **Objective Description** (optional) — Additional context or scope for the objective.
   - **Key Results** (at least one required per objective) — Click "Add Key Result" and define:
     - **Key Result Description** — The measurable outcome (e.g., "Reduce bug rate to < 2%").
     - **Target Value** — The numeric target (e.g., 2).
     - **Current Value** — The current progress (e.g., 5). Defaults to 0.
     - **Unit** — The measurement unit (e.g., "%", "count", "score"). Optional.
5. Repeat steps 3–4 for each additional objective.
6. To remove an objective or key result, click the delete (×) icon next to it.
7. Click **"Save OKRs"** to persist the objectives. The system serializes the OKR structure as JSON and stores it in the `objectives` field.
8. On success, a toast notification confirms: "OKRs Updated — {N} objectives saved for {employeeName}."
9. The OKR progress is automatically computed from the current and target values of each key result.

**API Call:** `PATCH /api/performance` with `{ id: <reviewId>, objectives: <JSON_OKR_Structure> }`. The API validates the JSON structure and clamps any values to acceptable ranges.

**Post-conditions:** The review record's `objectives` field contains the structured JSON OKR data. The OKR tracking view reflects the new objectives. Progress percentages are calculated client-side from key result current/target values.

### 4.3 Completing Self-Review

**Objective:** Allow the employee to submit their self-assessment as part of an active performance review cycle.

**Pre-conditions:** A performance review must exist for the employee with status `draft` or `in-review`. The employee must have access to the Self-Service module or the self-review form within the Performance module.

**Steps:**

1. The employee navigates to their active performance review through the **Self-Service** portal or via a direct link from a notification.
2. The self-review form is displayed (see Section 3.6 for field descriptions).
3. The employee fills in each section:
   - **Self-Assessment** (required) — A reflective narrative covering their contributions, challenges, and growth during the period.
   - **Key Achievements** — Specific accomplishments they want to highlight.
   - **Challenges Faced** — Obstacles encountered and how they were addressed.
   - **Areas for Improvement** — Self-identified development needs.
   - **Career Aspirations** — Short-term and long-term goals.
   - **Goals for Next Period** — Proposed objectives for the upcoming review cycle.
4. The form auto-saves as a draft as the employee types (debounced at 2 seconds). A "Draft saved" indicator appears near the save button.
5. Once all required fields are complete, the employee clicks **"Submit Self-Review"**.
6. A confirmation dialog appears: "Are you sure you want to submit your self-review? You will not be able to edit it after submission."
7. The employee confirms by clicking **"Submit"**.
8. On success:
   - The self-review content is saved to the `selfReview` field.
   - The achievements are saved to the `achievements` field.
   - The proposed goals are saved to the `goals` field.
   - The form becomes read-only for the employee.
   - A notification is sent to the assigned reviewer indicating that the self-review is ready for their assessment.
   - The review status automatically transitions from `draft` to `in-review` if it was still in `draft` status.
   - A success toast appears: "Self-Review Submitted — Your self-assessment has been submitted to your reviewer."
9. On failure, an error toast appears and the form remains in editable state.

**API Call:** `PATCH /api/performance` with `{ id: <reviewId>, selfReview: "<text>", achievements: "<text>", goals: "<text>" }`. The API may also update the status to `in-review` if the current status is `draft`.

**Post-conditions:** The review record contains the employee's self-assessment data. The status is `in-review`. The reviewer is notified and can proceed with their assessment.

### 4.4 Manager Review and Feedback

**Objective:** Enable the assigned reviewer (manager or HR admin) to evaluate the employee's performance, provide feedback, and assign a rating.

**Pre-conditions:** A performance review must exist with status `in-review` (or `draft` if the manager is starting the review independently). The user must be the assigned reviewer or have HR Admin / Super Admin role. The employee's self-review should ideally be submitted before the manager completes their assessment, though this is not strictly enforced.

**Steps:**

1. Navigate to the **Performance & Talent** module.
2. Locate the review in the list table. Filter by "In Review" status and/or by your name as reviewer to find pending reviews.
3. Click the **View** (eye) icon to open the review detail sheet, or click the **Edit** (pencil) icon to open the review form.
4. Review the employee's submitted data:
   - **Self-Review** — Read the employee's self-assessment to understand their perspective.
   - **Achievements** — Review the accomplishments the employee has highlighted.
   - **Objectives / OKRs** — Evaluate progress against the defined key results.
   - **Previous Goals** — Check the goals set in prior review periods for continuity.
5. Provide your assessment:
   - **Feedback** (required for completion) — Enter constructive, specific feedback addressing the employee's performance, strengths, and areas for improvement. Use the multi-line textarea. Best practice: reference specific OKRs and achievements in your feedback.
   - **Rating** (required for completion) — Assign a rating on the 0–5 scale. The input may accept decimal values (e.g., 3.5, 4.2). The system will clamp the value to the 0–5 range (see Section 9).
   - **Updated Goals** (optional) — Modify or add to the goals for the next review period based on your assessment.
6. Click **"Save Feedback"** to save your progress without completing the review. This allows you to draft feedback and return later.
7. When ready to finalize, click **"Complete Review"**. This action:
   - Validates that both `feedback` and `rating` fields are populated.
   - Transitions the review status from `in-review` to `completed`.
   - Triggers the AI attrition risk scoring algorithm to compute or update the `attritionRisk` score.
   - Sends a notification to the employee that their review has been completed.
8. On success, a toast appears: "Review Completed — Performance review for {employeeName} has been finalized."

**API Call:** `PATCH /api/performance` with `{ id: <reviewId>, feedback: "<text>", rating: <number>, goals: "<text>" }` for saving feedback. For completing: the same call with an additional `status: 'completed'` that triggers the status transition and attrition risk computation.

**Post-conditions:** The review record contains the manager's feedback, rating, and updated goals. The status is `completed`. The attrition risk score has been computed and stored. The employee is notified.

### 4.5 Completing the Review Cycle

**Objective:** Finalize a performance review, ensuring all required data is captured and the review is locked from further modification.

**Pre-conditions:** The review must be in `in-review` status. The reviewer must have provided both feedback and a rating.

**Steps:**

1. Verify that all required fields are populated:
   - **Rating** — Must be a numeric value between 0 and 5 (system enforces clamping).
   - **Feedback** — Must contain non-empty text.
   - **Review Period** — Must be defined.
   - **Employee and Reviewer** — Both must be linked to the review.
2. Navigate to the review and click **"Complete Review"** (or save with `status: 'completed'` via the edit form).
3. The system performs the following actions atomically:
   - Validates the status transition: only `in-review` → `completed` is allowed. Reviews in `draft` status must first be moved to `in-review`.
   - Clamps the rating to the 0–5 range if it falls outside (e.g., 5.3 becomes 5.0, -0.5 becomes 0.0).
   - Computes the AI attrition risk score and stores it in the `attritionRisk` field (0–1 range, clamped).
   - Sets the status to `completed`.
   - Creates an audit log entry recording the completion.
4. On success, the review is locked. No further edits are permitted unless the review is reopened by a Super Admin or HR Admin (which requires a status change back to `in-review`).
5. Notifications are dispatched:
   - To the employee: "Your performance review for {reviewPeriod} has been completed."
   - To HR Admin: Digest notification of completed reviews for the period.
6. The review data becomes available for analytics dashboards, attrition risk monitoring, and integration with other modules.

**API Call:** `PATCH /api/performance` with `{ id: <reviewId>, status: 'completed' }`. The API enforces the status transition rules, rating clamping, and attrition risk computation.

**Post-conditions:** The review record is in `completed` status with all fields populated, including the computed `attritionRisk`. The review is locked from standard editing. Analytics and reporting modules can consume the data.

### 4.6 Monitoring Attrition Risk

**Objective:** Proactively monitor AI-generated attrition risk scores to identify and retain at-risk employees before they depart.

**Pre-conditions:** Performance reviews must be completed (attrition risk is computed upon review completion). User must have Super Admin or HR Admin role for organization-wide visibility; Department Managers see risk scores only for their direct reports.

**Steps:**

1. Navigate to the **Performance & Talent** module.
2. Access the **Attrition Risk Dashboard** (either as a sub-tab or through a dedicated view within the module).
3. Review the **Risk Distribution Gauge** to understand the overall organizational risk posture.
4. Examine the **Risk Tier Breakdown** cards:
   - **Low Risk (0.00–0.29):** Employees with stable performance and engagement indicators. No immediate action required.
   - **Moderate Risk (0.30–0.59):** Employees showing early warning signs. Schedule check-in conversations and review development opportunities.
   - **High Risk (0.60–1.00):** Employees with significant flight risk indicators. Prioritize for retention interventions.
5. Review the **High-Risk Employee List** — a prioritized table sorted by risk score descending:
   - For each high-risk employee, note the recommended action (auto-generated based on risk factors).
   - Cross-reference the employee's current rating and last review date.
   - Review their department context using the Department Heatmap.
6. Take action for high-risk employees:
   - Schedule a one-on-one retention conversation.
   - Review and potentially adjust their OKRs to increase engagement.
   - Coordinate with L&D for skill development opportunities.
   - Consult with HR Admin for compensation review if appropriate.
7. Use the **Trend Over Time** chart to identify whether risk scores are improving or worsening across review periods.
8. Set up monitoring alerts (if configured in the system) to receive automatic notifications when an employee's attrition risk crosses the 0.60 threshold.

**API Call:** `GET /api/performance` with optional query parameters for filtering by `attritionRisk` range, `department`, and `status: 'completed'`. The attrition risk scores are computed at review completion time and stored with the review record.

**Post-conditions:** The HR team has visibility into at-risk employees and can take proactive retention measures. Attrition risk trends are tracked over time for organizational health monitoring.

---

## 5. OKR Framework

### 5.1 Overview

The Performance & Talent module natively supports the OKR (Objectives and Key Results) framework for goal setting and progress tracking. OKRs provide a structured methodology for defining measurable objectives and tracking their completion through quantifiable key results. Within the HRMS system, OKRs are stored as JSON data in the `objectives` field of the Performance model, enabling flexible structure while maintaining queryability and consistent rendering across the application.

The OKR framework in this module is designed to support both top-down (organization-to-individual) and bottom-up (individual-to-organization) goal alignment. Each performance review can contain multiple objectives, and each objective can have multiple key results with individual progress tracking. This hierarchical structure allows for granular progress measurement while maintaining the simplicity of a single overall completion percentage per objective.

### 5.2 JSON Structure

The `objectives` field stores a JSON array of objective objects. Each objective contains a title, description, and an array of key results. The JSON schema is as follows:

```json
{
  "objectives": [
    {
      "id": "obj_001",
      "title": "Improve product quality metrics",
      "description": "Reduce defect rates and improve customer satisfaction scores for the core product line",
      "category": "quality",
      "keyResults": [
        {
          "id": "kr_001",
          "description": "Reduce production bug rate to below 2%",
          "targetValue": 2,
          "currentValue": 5,
          "unit": "%",
          "status": "at-risk"
        },
        {
          "id": "kr_002",
          "description": "Achieve customer satisfaction score of 4.5 or higher",
          "targetValue": 4.5,
          "currentValue": 4.2,
          "unit": "score",
          "status": "on-track"
        },
        {
          "id": "kr_003",
          "description": "Complete 100% of sprint commitments for Q1",
          "targetValue": 100,
          "currentValue": 85,
          "unit": "%",
          "status": "at-risk"
        }
      ]
    },
    {
      "id": "obj_002",
      "title": "Enhance team technical capabilities",
      "description": "Upskill team members in modern development practices and tools",
      "category": "development",
      "keyResults": [
        {
          "id": "kr_004",
          "description": "Complete 3 technical certifications across the team",
          "targetValue": 3,
          "currentValue": 1,
          "unit": "count",
          "status": "behind"
        },
        {
          "id": "kr_005",
          "description": "Conduct 4 knowledge-sharing sessions",
          "targetValue": 4,
          "currentValue": 4,
          "unit": "count",
          "status": "completed"
        }
      ]
    }
  ]
}
```

### 5.3 Field Definitions

**Objective-Level Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String | Yes | Unique identifier for the objective within the review (e.g., "obj_001") |
| `title` | String | Yes | Concise, inspiring statement of the goal |
| `description` | String | No | Additional context, scope, or rationale for the objective |
| `category` | String | No | Classification tag (e.g., "quality", "development", "revenue", "culture") |
| `keyResults` | Array | Yes | Array of key result objects (minimum 1 recommended) |

**Key Result-Level Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | String | Yes | Unique identifier for the key result within the objective (e.g., "kr_001") |
| `description` | String | Yes | Measurable, specific outcome statement |
| `targetValue` | Number | Yes | The target numeric value to achieve |
| `currentValue` | Number | Yes | The current progress value (defaults to 0 at creation) |
| `unit` | String | No | The measurement unit (e.g., "%", "count", "score", "USD") |
| `status` | String | No | Progress status: "on-track", "at-risk", "behind", "completed" |

### 5.4 Progress Computation

Objective completion percentage is computed client-side using the key result progress values:

```
objectiveCompletion = average(
  keyResults.map(kr => 
    Math.min(100, (kr.currentValue / kr.targetValue) * 100)
  )
)
```

For key results where the target value is 0 (avoidance objectives, e.g., "Zero security incidents"), the completion logic inverts: completion is 100% if currentValue is also 0, and decreases as currentValue increases.

**Key Result Status Auto-Classification:**

| Status | Condition |
|---|---|
| `completed` | `currentValue >= targetValue` (100% or more) |
| `on-track` | Completion ≥ 67% and < 100% |
| `at-risk` | Completion ≥ 33% and < 67% |
| `behind` | Completion < 33% |

### 5.5 OKR Best Practices

When setting OKRs within the Performance module, adhere to the following guidelines:

- **Objectives should be qualitative and inspirational** — They describe *what* you want to achieve, not how. Example: "Become the market leader in customer satisfaction" rather than "Score 95% on CSAT survey."
- **Key Results should be quantitative and measurable** — They describe *how* you measure progress toward the objective. Each key result must have a clear numeric target.
- **Aim for 3–5 objectives per review period** with 2–4 key results each. Too many OKRs dilute focus; too few may miss important areas.
- **Set ambitious but achievable targets** — Industry best practice suggests that 70% completion of OKRs represents strong performance. Setting targets that are too easy undermines the framework's value.
- **Update key result current values regularly** — OKRs should not be "set and forget." Managers and employees should update progress at least bi-weekly to ensure the tracking view remains accurate.
- **Align individual OKRs with team and organizational goals** — The `category` field helps map individual objectives to broader strategic priorities.

---

## 6. Rating & Attrition Risk

### 6.1 Performance Rating Scale (0–5)

The Performance & Talent module uses a 0–5 numeric rating scale to evaluate employee performance. This scale supports both integer and decimal values (e.g., 3.5, 4.2) to allow nuanced differentiation between performance levels.

**Rating Scale Definitions:**

| Rating Range | Label | Color Code | Description |
|---|---|---|---|
| 4.5 – 5.0 | Exceptional | Emerald (dark) | Consistently exceeds all expectations. Demonstrates outstanding performance, innovation, and leadership. Sets the standard for others. |
| 3.5 – 4.4 | Exceeds Expectations | Emerald (light) | Regularly surpasses expectations in most areas. Delivers high-quality work and takes initiative beyond their role. |
| 2.5 – 3.4 | Meets Expectations | Amber | Consistently meets the requirements of their role. Delivers solid, reliable performance with occasional areas of strength. |
| 1.5 – 2.4 | Below Expectations | Orange | Partially meets role requirements. Performance gaps exist that require focused improvement and development support. |
| 0.0 – 1.4 | Unsatisfactory | Red | Fails to meet minimum role requirements. Immediate performance improvement plan (PIP) should be considered. |

**Rating Clamping:**

The API enforces rating clamping to ensure values always fall within the valid range:

```
clampedRating = Math.min(5, Math.max(0, submittedRating))
```

- If a rating value less than 0 is submitted (e.g., -1.0), it is clamped to 0.
- If a rating value greater than 5 is submitted (e.g., 5.8), it is clamped to 5.
- Null ratings are permitted for reviews in `draft` and `in-review` status; a rating is required before the review can transition to `completed`.

**Rating Display Conventions:**

- In list views: Numeric value with one decimal place (e.g., "4.2") plus a colored dot indicator.
- In detail views: Star visualization (filled stars for whole numbers, half-filled for .5 values) plus numeric display.
- In analytics: Histograms and distribution charts use 0.5-point buckets.
- Draft reviews display "—" (em dash) for the rating field.

### 6.2 Attrition Risk Scoring (0–1)

The AI-powered attrition risk scoring system generates a probability score between 0 and 1 for each employee upon completion of a performance review. This score represents the likelihood that the employee will leave the organization within the next review period.

**Risk Score Computation:**

The attrition risk score is computed by the API when a performance review transitions to `completed` status. The algorithm analyzes the following factors:

| Factor | Weight | Description |
|---|---|---|
| **Rating Trajectory** | High | Declining ratings over consecutive review periods significantly increase risk. A drop of ≥1.0 points between reviews is a strong negative indicator. |
| **Rating Level** | High | Employees with ratings below 2.5 have elevated risk due to dissatisfaction or poor role fit. |
| **Self-Review Engagement** | Medium | Short or missing self-reviews may indicate disengagement. Detailed, thoughtful self-assessments are a positive signal. |
| **OKR Completion Rate** | Medium | Low OKR completion (< 40%) correlates with misalignment between the employee's efforts and organizational expectations. |
| **Review Timeliness** | Low | Delayed reviews (completed significantly after the review period end) may indicate process avoidance or lack of manager engagement. |
| **Department Average Comparison** | Low | Employees rated significantly below their department average face higher flight risk due to perceived unfairness or poor fit. |

**Risk Tier Classification:**

| Score Range | Tier | Color | Action Required |
|---|---|---|---|
| 0.00 – 0.29 | Low Risk | Green | No immediate action. Continue standard engagement and development practices. |
| 0.30 – 0.59 | Moderate Risk | Amber | Schedule a check-in conversation. Review development opportunities. Consider adjusting OKRs or workload. |
| 0.60 – 1.00 | High Risk | Red | Urgent retention intervention required. Schedule immediate one-on-one. Review compensation, role fit, and career path. Involve HR Admin. |

**Risk Score Clamping:**

Similar to ratings, the attrition risk score is clamped to the valid range:

```
clampedRisk = Math.min(1, Math.max(0, computedRisk))
```

- Scores below 0 are clamped to 0 (no risk).
- Scores above 1 are clamped to 1 (certain departure).
- The clamping ensures consistent display and interpretation across the system.

**Risk Score Refresh:**

- Attrition risk scores are computed or updated each time a performance review is completed.
- If an employee has multiple completed reviews, the most recent review's attrition risk score is considered the current risk level.
- Historical risk scores are preserved in each review record, enabling trend analysis over time.
- Risk scores are not automatically recomputed when other data changes (e.g., department reassignment, salary update). A manual recalculation can be triggered by an HR Admin if needed.

**Score Interpretation Guidance:**

- The attrition risk score is a probabilistic estimate, not a definitive prediction. A score of 0.75 does not mean the employee will definitely leave; it means the algorithm identifies strong indicators of potential departure.
- Always combine the AI risk score with qualitative context — a high performer with a high risk score may be receiving external offers, while a low performer with a high risk score may be disengaged.
- Use risk scores as conversation starters, not as standalone decision-making tools. Manager intuition and direct communication remain essential.

---

## 7. Integration with Other Modules

### 7.1 Employee Management

The Performance module has a fundamental dependency on the Employee Management module, which provides the foundational employee data that every performance review references.

- **Employee Records:** Each performance review requires a valid `employeeId` foreign key referencing an Employee record. The employee's name, department, designation, and reporting structure are displayed in the review interface by joining with employee data.
- **Reviewer Assignment:** The default reviewer is derived from the Employee record's `reportingTo` field, which identifies the employee's direct manager. This auto-population reduces manual setup effort during review creation.
- **Department Filtering:** Performance reviews can be filtered by department using the department field from the Employee record, enabling department-level analytics and manager-scoped views.
- **Cascade Deletion:** When an employee is deleted from the Employee Management module, all associated Performance records are cascade-deleted within the same database transaction. This ensures data consistency but permanently removes performance history. HR Admins should consider archiving performance data or setting the employee status to "exited" rather than deleting the record.

### 7.2 Talent Acquisition

The Performance module integrates with the Talent Acquisition module to provide end-to-end talent lifecycle tracking, from hiring through performance evaluation.

- **Hiring Quality Validation:** The AI fit score assigned to candidates during recruitment can be correlated with their subsequent performance ratings to validate the hiring algorithm's predictive accuracy. High fit scores that align with high performance ratings confirm effective hiring practices.
- **Onboarding-to-Performance Pipeline:** Candidates who are hired and onboarded through the Talent Acquisition module should have their first performance review initiated at the end of their probation period. The review period label can reference the probation completion (e.g., "Probation Review Q2 2025").
- **Attrition Risk Feedback Loop:** Attrition risk scores from the Performance module can feed back into the Talent Acquisition module to identify whether certain hiring sources, job fit scores, or onboarding experiences correlate with higher turnover, enabling continuous improvement in recruitment practices.

### 7.3 Learning & Development

The L&D module is a critical downstream consumer of performance review data, using review outcomes to drive personalized development plans.

- **Skill Gap Identification:** Performance review feedback that identifies areas for improvement can be cross-referenced with the employee's current skill profile (from the Skills module) to generate targeted training recommendations. The L&D module can automatically suggest courses that address the specific competencies highlighted in the review.
- **OKR-Aligned Training:** Key results that are classified as "at-risk" or "behind" may indicate skill gaps that can be addressed through targeted learning interventions. The system can recommend specific courses from the L&D catalog that align with the objective category.
- **Development Plan Integration:** Goals defined in the performance review (the `goals` field) for the next period should be actionable through the L&D module. For example, a goal to "Improve leadership skills" can be linked to a leadership development course enrollment.
- **Course Completion Tracking:** Course enrollment status and completion data from the L&D module can be referenced in subsequent performance reviews to validate whether development goals from the previous period were achieved.

### 7.4 Analytics

The Analytics module consumes performance data to generate organizational insights, trends, and predictive models.

- **Rating Distribution Analysis:** Performance ratings are aggregated to show distribution curves, department-level comparisons, and period-over-period trends. This data is used for calibration sessions and organizational health assessments.
- **Attrition Risk Aggregation:** Attrition risk scores are aggregated at the department and organizational levels to provide leadership with visibility into retention hotspots and overall workforce stability.
- **Review Completion Metrics:** The Analytics module tracks review cycle completion rates, time-to-completion, and participation rates. These metrics help HR Admins identify departments or managers that are lagging in their review responsibilities.
- **OKR Progress Analytics:** Aggregate OKR completion rates across the organization provide insight into goal alignment and execution effectiveness. Departments with low OKR completion may need strategic realignment or resource adjustments.
- **Predictive Modeling:** Historical performance and attrition data feed into predictive models that forecast future attrition, identify high-potential employees for succession planning, and simulate the impact of retention interventions.

### 7.5 Self-Service

The Self-Service module provides employees with direct access to their own performance data, enabling transparency and self-directed development.

- **Self-Review Access:** Employees can access and complete their self-review forms through the Self-Service portal without needing to navigate to the full Performance module. This simplifies the employee experience and increases self-review completion rates.
- **Review History:** Employees can view their completed performance reviews, including ratings, feedback, and OKR progress. This promotes transparency and helps employees understand their performance trajectory.
- **OKR Progress Updates:** Employees can update the current values of their key results through the Self-Service portal, ensuring OKR tracking remains current between formal review cycles.
- **Goal Visibility:** Employees can view their goals for the current and upcoming review periods, helping them stay aligned with expectations and track their own progress.
- **Attrition Risk Privacy:** Employees cannot view their own attrition risk score through the Self-Service portal. This score is visible only to Super Admin, HR Admin, and the employee's Department Manager to prevent anxiety and maintain constructive review relationships.

---

## 8. Role-Based Access

### 8.1 Access Control Matrix

The following matrix defines what each role can do within the Performance & Talent module:

| Operation | Super Admin | HR Admin | Department Manager |
|---|:---:|:---:|:---:|
| View performance review list (all) | ✅ | ✅ | ✅ (own dept only) |
| View review details (all employees) | ✅ | ✅ | ✅ (own dept only) |
| Create new performance review | ✅ | ✅ | ❌ |
| Edit review (draft status) | ✅ | ✅ | ✅ (own reports only) |
| Edit review (in-review status) | ✅ | ✅ | ✅ (own reports only) |
| Edit review (completed status) | ✅ | ⚠️ (reopen only) | ❌ |
| Delete performance review | ✅ | ✅ | ❌ |
| Submit self-review (as employee) | ✅ | ✅ | ✅ |
| Provide manager feedback | ✅ | ✅ | ✅ (own reports only) |
| Assign rating | ✅ | ✅ | ✅ (own reports only) |
| Complete review (transition to completed) | ✅ | ✅ | ✅ (own reports only) |
| Set OKRs and objectives | ✅ | ✅ | ✅ (own reports only) |
| View attrition risk scores | ✅ | ✅ | ✅ (own dept only) |
| Access attrition risk dashboard | ✅ | ✅ | ❌ |
| Reopen completed review | ✅ | ✅ | ❌ |
| View rating analytics | ✅ | ✅ | ✅ (own dept only) |
| Export performance data | ✅ | ✅ | ❌ |
| Configure attrition risk thresholds | ✅ | ❌ | ❌ |
| Trigger manual attrition risk recalculation | ✅ | ✅ | ❌ |

### 8.2 Department Manager Scoping

Department Managers have restricted access within the Performance module to ensure they can only manage reviews for employees within their own department:

- **List View Filtering:** When a Department Manager accesses the performance review list, the API automatically filters results to show only reviews where the reviewed employee belongs to the manager's department. This is enforced server-side through the `department` field on the Employee record.
- **Reviewer Validation:** When a Department Manager is assigned as a reviewer, the API validates that the employee being reviewed is in the manager's department. Cross-department reviewer assignments by Department Managers are rejected.
- **Attrition Risk Visibility:** Department Managers can see attrition risk scores for their own team members but cannot access the organization-wide attrition risk dashboard or view risk scores for other departments.
- **Edit Restrictions:** Department Managers can edit reviews for their direct reports only when the review is in `draft` or `in-review` status. They cannot modify completed reviews or reopen them.
- **Delete Restriction:** Department Managers cannot delete performance reviews under any circumstances. This prevents accidental or intentional removal of performance records that may be needed for compliance or audit purposes.

### 8.3 Employee Self-Service Access

Employees (who are not managers or admins) access the Performance module through the Self-Service portal with the following capabilities:

| Operation | Employee (Self) |
|---|:---:|
| View own performance reviews | ✅ |
| Submit self-review | ✅ |
| Update own OKR progress (key result current values) | ✅ |
| View own rating and feedback (completed reviews) | ✅ |
| View own goals | ✅ |
| View own attrition risk score | ❌ |
| Edit manager feedback or rating | ❌ |
| Create or delete reviews | ❌ |
| View other employees' reviews | ❌ |

---

## 9. Business Rules

### 9.1 Rating Clamping

The performance rating is strictly bounded to the 0–5 range. The API enforces clamping at the data layer to prevent invalid values from being stored:

- **Minimum Rating:** 0.0 — Represents complete failure to meet any role requirements. Any submitted value below 0 is automatically clamped to 0.
- **Maximum Rating:** 5.0 — Represents exceptional, beyond-expectations performance. Any submitted value above 5 is automatically clamped to 5.
- **Decimal Precision:** Ratings support up to one decimal place (e.g., 3.7, 4.2). Values with more precision are rounded to one decimal place.
- **Null Handling:** Ratings can be null for reviews in `draft` and `in-review` status. A non-null rating is required to transition a review to `completed` status.
- **Clamping Logic:**
  ```typescript
  const clampedRating = Math.round(Math.min(5, Math.max(0, submittedRating)) * 10) / 10
  ```

### 9.2 Attrition Risk Clamping

The attrition risk score is strictly bounded to the 0–1 range, representing a probability:

- **Minimum Risk:** 0.0 — No detectable attrition risk. Any computed value below 0 is clamped to 0.
- **Maximum Risk:** 1.0 — Maximum attrition risk probability. Any computed value above 1 is clamped to 1.
- **Decimal Precision:** Attrition risk scores are stored with two decimal places (e.g., 0.35, 0.72).
- **Null Handling:** Attrition risk is null for reviews in `draft` or `in-review` status. It is computed and populated only when the review transitions to `completed`.
- **Clamping Logic:**
  ```typescript
  const clampedRisk = Math.round(Math.min(1, Math.max(0, computedRisk)) * 100) / 100
  ```

### 9.3 Status Transition Rules

Performance reviews follow a strict status lifecycle with controlled transitions:

```
draft → in-review → completed
  ↑                      │
  └──────────────────────┘  (reopen: Super Admin / HR Admin only)
```

**Valid Transitions:**

| From | To | Allowed By | Condition |
|---|---|---|---|
| `draft` | `in-review` | Super Admin, HR Admin, Dept Manager (own reports) | Review must have an assigned employee and reviewer |
| `in-review` | `completed` | Super Admin, HR Admin, Dept Manager (own reports) | Must have non-null `rating` and non-empty `feedback` |
| `completed` | `in-review` | Super Admin, HR Admin only | Reopens the review for editing; attrition risk is cleared |
| `draft` | `completed` | ❌ Not allowed | Must transition through `in-review` first |

**Invalid Transitions:**

| Transition | Reason |
|---|---|
| `completed` → `draft` | Reviews cannot be reverted to draft once they've been in review |
| `in-review` → `draft` | Reviews cannot be stepped back to draft once review has begun |
| Any → `deleted` | Deletion is a separate operation, not a status transition |
| Skipping `in-review` | Direct `draft` → `completed` transition is prohibited |

**Reopening Completed Reviews:**

When a completed review is reopened (status changed from `completed` back to `in-review`):

- The `attritionRisk` field is set to null (it will be recomputed upon next completion).
- The `rating` and `feedback` fields are preserved (not cleared).
- An audit log entry is created recording the reopen action, the user who initiated it, and the reason.
- The employee is notified that their review has been reopened.
- Only Super Admin and HR Admin can reopen completed reviews.

### 9.4 Attrition Risk Thresholds

The following threshold values define the risk tier classification and trigger escalation actions:

| Threshold | Tier | System Action |
|---|---|---|
| 0.00 – 0.29 | Low Risk | No automated action. Score is recorded and displayed. |
| 0.30 – 0.59 | Moderate Risk | Score is highlighted in amber. A notification is sent to the employee's Department Manager suggesting a check-in conversation. |
| 0.60 – 0.79 | High Risk | Score is highlighted in red. A notification is sent to both the Department Manager and HR Admin. The employee appears on the High-Risk Employee List with "Urgent" priority. |
| 0.80 – 1.00 | Critical Risk | Score is highlighted in red with a pulsing indicator. Immediate notification is sent to Department Manager, HR Admin, and Super Admin. The employee is flagged for urgent retention intervention. A task is created in the HR Admin's action items. |

**Threshold Configuration:**

The threshold boundaries (0.30 for moderate, 0.60 for high, 0.80 for critical) are configurable by the Super Admin through system settings. Changing thresholds does not retroactively alter existing notifications but will affect future risk tier classifications and alert triggers.

### 9.5 Review Period Uniqueness

The system enforces a business rule that only one active (non-completed) performance review can exist per employee per review period. This prevents duplicate reviews from being created for the same time frame:

- When creating a new review, the API checks whether an existing review with the same `employeeId` and `reviewPeriod` already exists with a status of `draft` or `in-review`.
- If a duplicate is detected, the API returns a `409 Conflict` error with the message: "An active review already exists for this employee in the specified review period."
- Multiple completed reviews for the same employee and period are allowed (e.g., if a review was reopened and completed again), but only one can be active at a time.

### 9.6 Audit Logging

All mutations to performance review records generate audit log entries for compliance and traceability:

| Action | Audit Details |
|---|---|
| Create review | "Performance review created for {employeeName} ({reviewPeriod})" |
| Update review (any field) | "Performance review updated for {employeeName}: {changedFields}" |
| Submit self-review | "Self-review submitted by {employeeName} for {reviewPeriod}" |
| Submit manager feedback | "Feedback provided by {reviewerName} for {employeeName}" |
| Complete review | "Performance review completed for {employeeName} ({reviewPeriod}). Rating: {rating}, Attrition Risk: {risk}" |
| Reopen review | "Performance review reopened for {employeeName} ({reviewPeriod}) by {userName}" |
| Delete review | "Performance review deleted for {employeeName} ({reviewPeriod}) by {userName}" |

---

## 10. Troubleshooting

### 10.1 Common Issues and Resolutions

| Issue | Possible Cause | Resolution |
|---|---|---|
| **"An active review already exists for this employee in this period" error when creating a review** | A draft or in-review review already exists for the same employee and review period. | Locate the existing review using the search or filter functionality. Either complete the existing review or delete it before creating a new one. If the existing review is stale (e.g., abandoned draft), an HR Admin or Super Admin can delete it. |
| **Unable to transition review from `draft` to `completed`** | Direct `draft` → `completed` transitions are not allowed. Reviews must go through the `in-review` status first. | First transition the review to `in-review`, then to `completed`. Ensure that `rating` and `feedback` fields are populated before attempting the final transition. |
| **"Rating and feedback are required to complete a review" error** | The `rating` field is null or the `feedback` field is empty when attempting to transition to `completed` status. | Edit the review and provide both a numeric rating (0–5) and non-empty feedback text before attempting to complete the review. |
| **Rating appears different from what was submitted** | Rating clamping has been applied. Submitted values outside the 0–5 range are automatically clamped. | This is expected behavior. Ensure ratings are entered within the 0–5 range. If a rating of 5.5 was submitted, it will be stored and displayed as 5.0. |
| **Attrition risk score shows as "—" or null** | The review has not yet been completed. Attrition risk is only computed upon review completion. | Complete the review (transition to `completed` status). The attrition risk score will be automatically computed and displayed. |
| **Attrition risk score seems inaccurate** | The algorithm uses heuristic factors that may not capture all contextual nuances. Recent role changes, personal circumstances, or external factors may not be reflected. | Use the attrition risk score as one input among many. Combine it with direct manager feedback, recent engagement signals, and qualitative context. A Super Admin or HR Admin can trigger a manual recalculation if significant new data is available. |
| **Department Manager cannot see certain reviews** | Department Managers are scoped to their own department only. Reviews for employees in other departments are hidden. | This is expected role-based access control behavior. If a manager needs cross-department visibility, an HR Admin or Super Admin can grant temporary access or provide the specific review data. |
| **Self-review form is locked / read-only** | The self-review has already been submitted, or the review has transitioned to `completed` status. | Once a self-review is submitted, it cannot be edited by the employee. If changes are needed, the assigned reviewer or an HR Admin can reopen the review (changing status back to `in-review`) which may allow resubmission. |
| **Unable to delete a performance review** | Department Managers do not have delete permissions. Only Super Admin and HR Admin can delete reviews. | Contact an HR Admin or Super Admin to request review deletion. Ensure there is a valid business reason for deletion, as it permanently removes performance history. |
| **OKR progress not updating** | Key result `currentValue` has not been updated, or the client-side progress computation cache needs refreshing. | Update the key result current values through the OKR editor or Self-Service portal. Refresh the page to recalculate progress percentages. If the issue persists, verify the JSON structure of the `objectives` field is valid. |
| **JSON parsing error on objectives field** | The `objectives` field contains malformed JSON, possibly due to a failed save or manual database edit. | The system uses a `safeJsonParse` utility that falls back to an empty array on parse errors. To fix, edit the review and re-enter the OKRs through the UI, which will regenerate valid JSON. Contact a developer if the issue persists. |
| **"Cannot reopen a completed review" error** | Only Super Admin and HR Admin roles can reopen completed reviews. Department Managers do not have this permission. | Escalate the request to an HR Admin or Super Admin if a completed review needs to be reopened for corrections. |

### 10.2 Error Response Codes

The following HTTP status codes may be returned by the `/api/performance` endpoints:

| Status Code | Meaning | Typical Cause |
|---|---|---|
| `200 OK` | Request succeeded | Successful GET, PATCH, or DELETE |
| `201 Created` | Resource created | Successful POST (new review created) |
| `400 Bad Request` | Invalid input | Missing required fields, invalid status value, or malformed JSON in objectives |
| `401 Unauthorized` | Authentication required | No valid session token or token expired |
| `403 Forbidden` | Insufficient permissions | Department Manager attempting cross-department access or restricted operation |
| `404 Not Found` | Resource not found | Review ID does not exist or has been deleted |
| `409 Conflict` | Duplicate resource | Active review already exists for the employee in the specified period |
| `500 Internal Server Error` | Server error | Database connectivity issue, unhandled exception in attrition risk computation |

### 10.3 Data Recovery Procedures

**Accidentally Deleted Review:**

Performance review deletions are permanent and cannot be undone through the UI. If a review was deleted accidentally:

1. Check the audit log (`GET /api/audit-logs?module=performance&action=delete`) for the deletion record, which contains the review ID and timestamp.
2. If database backups are available, coordinate with the database administrator to restore the specific record from the most recent backup preceding the deletion.
3. As a last resort, recreate the review manually using data from the audit log entry and any available screenshots or reports.

**Corrupted Objectives JSON:**

If the `objectives` field contains malformed JSON that causes rendering errors:

1. Access the review through the edit interface.
2. Clear the existing objectives and re-enter them through the OKR editor, which generates valid JSON.
3. If the edit interface is also affected by the malformed JSON, a developer may need to directly update the database record with valid JSON.
4. Always use the UI to modify OKRs rather than direct database edits to prevent future corruption.

**Incorrect Attrition Risk Score:**

If an attrition risk score appears significantly inaccurate:

1. Verify the input data: check the rating, feedback, self-review, and OKR completion for the review.
2. Compare the score with the employee's rating trajectory and previous risk scores.
3. If the score is clearly erroneous (e.g., 0.95 for a high-performing, long-tenured employee), a Super Admin or HR Admin can trigger a manual recalculation.
4. Document the discrepancy and the corrected score for audit purposes.
