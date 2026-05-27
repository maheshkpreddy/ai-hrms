# Standard Operating Procedure — Dashboard Module

**AI-HRMS Application**

| Field | Value |
|-------|-------|
| **Document ID** | SOP-HRMS-DASH-001 |
| **Module Key** | `dashboard` |
| **Component** | `src/components/hrms/Dashboard.tsx` |
| **API Endpoint** | `GET /api/dashboard` |
| **Version** | 1.0 |
| **Effective Date** | 2026-03-04 |
| **Classification** | Internal — All Authenticated Users |
| **Review Cycle** | Quarterly |

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [Data Flow](#5-data-flow)
6. [Integration with Other Modules](#6-integration-with-other-modules)
7. [Role-Based Views](#7-role-based-views)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Dashboard module serves as the central command center and landing page of the AI-HRMS platform. Its primary purpose is to provide a consolidated, real-time executive summary of the organization's human resources health by aggregating data from every other module in the system. Rather than requiring administrators and managers to navigate to individual modules to assess the status of employees, attendance, payroll, recruitment, and performance, the Dashboard surfaces all critical KPIs, visualizations, and actionable items on a single screen. The module is designed to reduce the time-to-insight for decision-makers and to surface pending tasks—such as unapproved leave requests and expense claims—that require immediate attention.

The Dashboard is also the entry point of the application. Upon successful authentication, users are automatically routed to the Dashboard, where the `activeModule` state in the Zustand store is initialized to `'dashboard'`. The module leverages the Recharts visualization library to render interactive charts and uses a custom `useApi` hook to fetch all aggregated data from a single unified API endpoint, ensuring consistent data presentation and minimizing redundant network calls.

### 1.2 Scope

The Dashboard module encompasses the following functional areas:

- **Overview Statistics**: Four key metric cards displaying Total Employees, Active Positions, Attendance Rate, and Monthly Payroll with trend indicators and contextual sub-metrics.
- **Data Visualizations**: Three Recharts-powered charts—Department Headcount area chart, Department Distribution donut/pie chart, and Expense & Category Breakdown bar chart—providing at-a-glance analytical insights.
- **Quick Actions**: A grid of six shortcut buttons enabling one-click navigation to the most frequently used operations across the platform.
- **Performance Summary**: An embedded summary panel displaying average performance rating, average attrition risk percentage, and total review count.
- **Recent Activities**: A scrollable, time-relative feed of the ten most recent audit log entries, categorized by module with color-coded icons.
- **Pending Approvals**: A consolidated panel showing all outstanding leave requests and expense claims awaiting managerial or HR action, with inline approve actions.

Out of scope: The Dashboard does not perform any write operations (create, update, delete). It is a read-only aggregation layer. All data modifications are performed within their respective modules, and the Dashboard reflects those changes upon the next data fetch.

### 1.3 Target Users

The Dashboard is accessible to all authenticated users of the AI-HRMS platform. However, the data displayed and the actions available vary based on the user's assigned role. The seven supported roles and their typical interaction with the Dashboard are:

| Role | Level | Dashboard Interaction |
|------|-------|----------------------|
| **Super Admin** | 0 | Full visibility of all metrics, charts, and activities. Can act on all pending approvals. |
| **HR Admin** | 1 | Full visibility. Primary actor on leave approvals and employee-related quick actions. |
| **Payroll Specialist** | 2 | Focus on payroll metric, expense chart, and expense approvals. Uses Process Payroll quick action. |
| **Dept Manager** | 3 | Department-filtered view. Approves leaves and expenses for their department. Reviews team performance. |
| **Employee** | 6 | Self-service view: personal attendance, leave balance, and recent own activities only. |
| **Recruiter** | 4 | Focus on Active Positions metric, candidate pipeline data, and Post Job quick action. |
| **L&D Manager** | 5 | Focus on training metrics, performance summary, and course-related activities. |

---

## 2. Access & Navigation

### 2.1 Accessing the Dashboard

The Dashboard is the default landing page of the AI-HRMS application. Upon successful authentication (via email/password or Google OAuth), the system automatically sets the `activeModule` state to `'dashboard'` in the Zustand global store, and the main page component renders the Dashboard component. Users are not required to take any additional steps to reach the Dashboard after logging in.

### 2.2 Navigating to the Dashboard from Other Modules

When a user is working within any other module and wishes to return to the Dashboard, they can do so through the sidebar navigation. The sidebar is a persistent component rendered on the left side of the application on desktop viewports (≥768px) and accessible via a hamburger menu icon on mobile viewports (<768px).

**Desktop Navigation Steps:**

1. Locate the sidebar on the left side of the screen. The sidebar displays the AI-HRMS logo at the top followed by a "Search modules..." input field and a list of navigation items.
2. The **Dashboard** item is the first entry in the navigation list, represented by the `LayoutDashboard` icon (a grid/dashboard icon).
3. Click the **Dashboard** navigation item. The `setActiveModule('dashboard')` function is called on the Zustand store, which updates the `activeModule` state.
4. The main `page.tsx` component detects the state change and re-renders, displaying the `Dashboard` component in place of the previously active module.
5. The Dashboard component mounts and triggers `GET /api/dashboard` to fetch the latest data.

**Mobile Navigation Steps:**

1. Tap the hamburger menu icon (three horizontal lines) located at the top-left corner of the screen (positioned `fixed`, `left-4`, `top-4`, `z-40`).
2. A Sheet/Drawer component slides in from the left side of the screen, displaying the full sidebar content.
3. Tap the **Dashboard** navigation item at the top of the list.
4. The sidebar automatically closes on mobile after selection (`setSidebarOpen(false)` is called), and the Dashboard renders.

**Collapsed Sidebar Navigation:**

When the sidebar is in collapsed mode (width: 4.5rem), only the module icons are visible. The Dashboard icon is the first icon at the top. Hovering over the icon displays a tooltip with the label "Dashboard". Clicking the icon navigates to the Dashboard and, if desired, the user can expand the sidebar using the chevron button that appears at the right edge of the collapsed sidebar.

### 2.3 Auto-Refresh Behavior

The Dashboard fetches data once on component mount via the `useApi` hook. There is no automatic polling or WebSocket-based real-time refresh. To manually refresh the data, users can navigate away from the Dashboard and return, which triggers a fresh component mount and a new API call. The `useApi` hook also exposes a `refetch` function that can be called programmatically if a refresh button were to be added in future iterations.

---

## 3. Screen Descriptions

The Dashboard renders within a `max-w-7xl` (80rem) centered container with responsive horizontal padding (`px-4` on mobile, `sm:px-6`, `lg:px-8`) and vertical padding (`py-6`). The overall background uses the `background` CSS variable from the Tailwind theme, supporting both light and dark modes. Content is organized into four horizontal rows, each separated by `mt-6` (1.5rem) vertical spacing.

### 3.1 Header Section

At the top of the Dashboard, a flexible header row provides context and status:

| Element | Description |
|---------|-------------|
| **Title** | "Dashboard" — rendered as an `h1` with `text-2xl` on mobile and `text-3xl` on larger screens, bold, tight tracking. |
| **Subtitle** | "AI-powered HRMS overview & analytics" — rendered in `text-muted-foreground` at `text-sm`, providing a brief description of the page purpose. |
| **Live Badge** | A `Badge` component with "Live" text, styled with an emerald color scheme (`bg-emerald-100 text-emerald-700` in light mode, `dark:bg-emerald-950 dark:text-emerald-400`). Inside the badge, a pulsing green dot animation (using `animate-ping` on an absolute-positioned span) indicates real-time data status. Positioned at the right side of the header on `sm:` and above, or below the title on mobile. |

### 3.2 Row 1 — Stat Cards

The first content row consists of four stat cards arranged in a responsive grid: single column on mobile, two columns on `sm:` screens, and four columns on `lg:` screens. Each card is a `Card` component with `relative overflow-hidden` for the accent line feature.

| Card | Label | Value Source | Icon | Icon Background | Change Text | Change Indicator |
|------|-------|-------------|------|----------------|-------------|-----------------|
| 1 | **Total Employees** | `overview.totalEmployees` formatted with `toLocaleString()` | `Users` | `bg-emerald-100 text-emerald-700` (dark: `bg-emerald-950 text-emerald-400`) | `+{overview.recentHires} this month` | Positive (green `TrendingUp` icon) |
| 2 | **Active Positions** | `overview.openJobs` as string | `Briefcase` | `bg-amber-100 text-amber-700` (dark: `bg-amber-950 text-amber-400`) | `{overview.totalCandidates} candidates` | Negative (red `TrendingDown` icon) |
| 3 | **Attendance Rate** | Calculated: `(presentToday / (presentToday + absentToday)) * 100`, formatted to 1 decimal place with `%` suffix | `Clock` | `bg-cyan-100 text-cyan-700` (dark: `bg-cyan-950 text-cyan-400`) | `{overview.presentToday} present today` | Positive (green `TrendingUp` icon) |
| 4 | **Monthly Payroll** | `overview.totalPayrollThisMonth` — if ≥ ₹1,00,00,000 displays as `₹X.XX Cr`, otherwise as `₹X.XX L` | `Banknote` | `bg-rose-100 text-rose-700` (dark: `bg-rose-950 dark:text-rose-400`) | `Processed on time` | Positive (green `TrendingUp` icon) |

**Card Internal Layout:**
- `CardContent` with `p-4` (mobile) / `p-6` (sm+) padding
- Flex container with `items-start justify-between`
- Left side: label (`text-sm`, muted), value (`text-2xl` / `text-3xl`, bold), change indicator (icon + text, `text-xs`)
- Right side: Icon in a rounded-lg padded container
- Bottom accent line: A 1px-high gradient bar positioned absolutely at `bottom-0 left-0`, using `linear-gradient(90deg, #10b981, transparent)` for positive cards and `linear-gradient(90deg, #ef4444, transparent)` for negative cards

**Fallback State:** If no overview data is available, a single full-width card displays "No overview data available" with centered muted text.

### 3.3 Row 2 — Charts (Department Headcount & Distribution)

The second row contains two chart cards in a responsive two-column grid (`lg:grid-cols-2`), stacking on mobile.

#### 3.3.1 Department Headcount Area Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Department Headcount" |
| **Chart Type** | Recharts `AreaChart` |
| **Chart Height** | 280px (within `ResponsiveContainer`) |
| **Data Source** | `charts.departmentHeadcount` mapped to `{ month: department, headcount: count }` |
| **X-Axis** | `dataKey="month"` — department names, font size 11, rotated -20 degrees, text anchor "end", height 50 |
| **Y-Axis** | `dataKey="headcount"` — font size 12, domain auto-calculated with padding (`dataMin - 1` to `dataMax + 2`) |
| **Area** | Monotone interpolation, stroke `#10b981`, strokeWidth 2.5, gradient fill (`url(#headcountGradient)`) transitioning from 30% opacity to 0% |
| **Dots** | Default: radius 4, fill `#10b981`, white stroke, strokeWidth 2. Active: radius 6 |
| **Grid** | Dashed CartesianGrid with `strokeDasharray="3 3"`, 50% opacity, themed border color |
| **Tooltip** | Custom styled with themed background, rounded corners, 12px font, subtle box shadow |
| **Empty State** | "No department data available" — centered muted text |

#### 3.3.2 Department Distribution Pie Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Department Distribution" |
| **Chart Type** | Recharts `PieChart` with donut style |
| **Chart Height** | 280px (within `ResponsiveContainer`) |
| **Data Source** | `charts.departmentHeadcount` mapped to `{ name: department, value: count, color: PIE_COLORS[index % 10] }` |
| **Pie Configuration** | `cx="50%"`, `cy="50%"`, `innerRadius={60}`, `outerRadius={95}`, `paddingAngle={3}`, no stroke |
| **Color Palette** | 10 colors cycling: `#10b981`, `#f59e0b`, `#8b5cf6`, `#ec4899`, `#06b6d4`, `#f97316`, `#6366f1`, `#14b8a6`, `#ef4444`, `#84cc16` |
| **Tooltip** | Custom styled, formatter shows `"{value} employees"` |
| **Legend** | Circle icon type, size 8, wrapper font size 12px |
| **Empty State** | "No distribution data available" — centered muted text |

### 3.4 Row 3 — Expense Breakdown & Quick Actions

The third row contains two cards in a two-column grid layout.

#### 3.4.1 Expense & Category Breakdown Bar Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Expense & Category Breakdown" |
| **Additional Badge** | "Insights" badge with `AlertTriangle` icon, amber color scheme |
| **Chart Type** | Recharts `BarChart` |
| **Chart Height** | 280px (within `ResponsiveContainer`) |
| **Data Source** | `charts.expenseByCategory` mapped to `{ department: category (capitalized), risk: Math.round(totalAmount / 1000), actual: count }` |
| **X-Axis** | `dataKey="department"` — category names, font size 11, rotated -20 degrees |
| **Y-Axis** | Auto-scaled, font size 12 |
| **Bar 1** | `dataKey="risk"`, name "Amount (₹K)", fill `#f59e0b`, radius `[4, 4, 0, 0]`, barSize 16 |
| **Bar 2** | `dataKey="actual"`, name "Transactions", fill `#10b981`, radius `[4, 4, 0, 0]`, barSize 16 |
| **Grid** | Dashed CartesianGrid, 50% opacity |
| **Legend** | Circle icon type, size 8, font size 12px |
| **Empty State** | "No expense data available" — centered muted text |

#### 3.4.2 Quick Actions Grid

| Property | Value |
|----------|-------|
| **Card Title** | "Quick Actions" |
| **Grid Layout** | 2 columns on mobile, 3 columns on `sm:` and above |
| **Button Style** | `variant="outline"`, flex-column layout, `py-5` height, hover effects (emerald border + shadow) |

**Quick Action Buttons:**

| # | Label | Icon | Icon Color |
|---|-------|------|------------|
| 1 | Add Employee | `UserPlus` | `text-emerald-600` (dark: `text-emerald-400`) |
| 2 | Process Payroll | `CreditCard` | `text-amber-600` (dark: `text-amber-400`) |
| 3 | Post Job | `FileText` | `text-cyan-600` (dark: `text-cyan-400`) |
| 4 | Run Reports | `BarChart3` | `text-rose-600` (dark: `text-rose-400`) |
| 5 | Schedule Interview | `CalendarCheck` | `text-purple-600` (dark: `text-purple-400`) |
| 6 | Approve Leaves | `CheckCircle2` | `text-teal-600` (dark: `text-teal-400`) |

#### 3.4.3 Performance Summary (Nested within Quick Actions Card)

Below the Quick Actions grid, a bordered rounded panel displays three performance metrics in a three-column grid:

| Metric | Value Source | Display Format | Color |
|--------|-------------|----------------|-------|
| Avg Rating | `performance.averageRating.toFixed(1)` | Decimal (e.g., "3.8") | `text-emerald-600` (dark: `text-emerald-400`) |
| Attrition Risk | `(performance.averageAttritionRisk * 100).toFixed(0)` | Percentage (e.g., "23%") | `text-amber-600` (dark: `text-amber-400`) |
| Reviews | `performance.totalReviews` | Integer (e.g., "45") | `text-cyan-600` (dark: `text-cyan-400`) |

The panel has a label "Performance Summary" at the top in `text-xs font-medium text-muted-foreground`, with the three metrics displayed in centered columns with `text-lg font-bold` values and `text-[10px]` labels.

### 3.5 Row 4 — Recent Activities & Pending Approvals

The fourth row contains two cards in a two-column grid layout, both featuring scrollable content areas.

#### 3.5.1 Recent Activities Feed

| Property | Value |
|----------|-------|
| **Card Title** | "Recent Activities" |
| **Header Action** | "View all" ghost button with `ArrowRight` icon |
| **Content Area** | Max height 96 (24rem), overflow-y scrollable with custom scrollbar |
| **Data Source** | `recentActivities` array (latest 10 entries from AuditLog) |
| **Empty State** | "No recent activities" — centered muted text in 32-height container |

**Activity Item Layout:**
- Flex row with `items-start gap-3`, rounded-lg padding, hover background (`hover:bg-muted/50`)
- Left: Circular icon container (8×8, `bg-muted`) with module-specific icon and color
- Middle: Employee name in `font-medium`, followed by activity details or `"{action} in {module}"` fallback; timestamp in `text-xs text-muted-foreground` using relative time formatting (e.g., "5 min ago", "2 hours ago", "3 days ago")
- Right (first item only): Green "New" badge

**Module Icon Mapping:**

| Module | Icon | Color |
|--------|------|-------|
| HR | `UserPlus` | `text-emerald-500` |
| Payroll | `CreditCard` | `text-amber-500` |
| Attendance | `Clock` | `text-cyan-500` |
| Leave | `CalendarDays` | `text-purple-500` |
| Performance | `Activity` | `text-rose-500` |
| Recruitment | `Briefcase` | `text-blue-500` |
| Learning | `ShieldCheck` | `text-teal-500` |
| Expense | `Receipt` | `text-orange-500` |
| Default (unknown) | `Activity` | `text-gray-500` |

**Relative Time Formatting Logic:**
- Less than 1 minute: "Just now"
- 1–59 minutes: "{X} min ago"
- 1–23 hours: "{X} hour(s) ago"
- 1–29 days: "{X} day(s) ago"
- 30+ days: Full locale date string

#### 3.5.2 Pending Approvals Panel

| Property | Value |
|----------|-------|
| **Card Title** | "Pending Approvals" |
| **Header Badge** | Destructive variant badge showing "{totalPending} pending" in `text-[10px]` |
| **Content Area** | Max height 96 (24rem), overflow-y scrollable |
| **Empty State** | "No pending approvals" — centered muted text |

**Approval Items (conditionally rendered based on data):**

| Item | Display Condition | Icon | Icon Color | Title | Description | Badge | Badge Variant |
|------|-------------------|------|------------|-------|-------------|-------|--------------|
| Leave Requests | `overview.pendingLeaves > 0` | `CalendarDays` | `text-amber-500` | "Leave Requests" | "{pendingLeaves} pending approval" | "Leave" | `secondary` |
| Expense Claims | `overview.pendingExpenses > 0` | `Receipt` | `text-rose-500` | "Expense Claims" | "{pendingExpenses} pending approval" | "Expense" | `outline` |

**Approval Item Layout:**
- Flex row with `items-center gap-3`, rounded-lg padding, hover background
- Left: Circular icon container with type-specific icon and color
- Middle: Title in `font-medium`, description in `text-xs text-muted-foreground`
- Right: Type badge + green approve button (ghost, icon-only, `CheckCircle2` icon) styled with emerald hover state

---

## 4. Functional Workflows

### 4.1 Viewing Dashboard Statistics

This workflow describes the process by which a user views and interprets the key statistics displayed on the Dashboard.

**Prerequisites:**
- User is authenticated and has an active session
- User has been assigned one of the seven supported roles
- Backend database contains at least some employee, attendance, payroll, and/or leave records

**Steps:**

1. **Login to AI-HRMS.** The user authenticates via the login page using either email/password credentials or Google OAuth. Upon successful authentication, the NextAuth JWT session is established and the user is redirected to the main application page.

2. **Dashboard auto-loads.** The main `page.tsx` component reads the `activeModule` state from the Zustand store. Since the default value is `'dashboard'`, the `Dashboard` component is rendered immediately on first load.

3. **Data fetching begins.** The `useApi<DashboardData>` hook is initialized with `baseUrl: '/api/dashboard'`. On component mount, the hook triggers a `GET /api/dashboard` request to the Next.js API route.

4. **Loading state displays.** While the API request is in flight, the Dashboard renders a full-screen loading state: a centered `Loader2` spinner icon (emerald, `animate-spin`) with the text "Loading dashboard data…" in muted foreground color. This prevents the user from seeing empty or partially rendered content.

5. **API processes the request.** The backend API route executes 12 parallel Prisma queries via `Promise.all()`:
   - `employee.count()` — total employees
   - `employee.count({ where: { status: 'active' } })` — active employees
   - `department.count()` — department count
   - `leave.count({ where: { status: 'pending' } })` — pending leaves
   - `leave.count({ where: { status: 'approved', startDate: { lte: today }, endDate: { gte: today } } })` — approved leaves today
   - `expense.count({ where: { status: 'pending' } })` — pending expenses
   - `job.count({ where: { status: 'open' } })` — open jobs
   - `candidate.count()` — total candidates
   - `attendance.count({ where: { status: 'present', date: today } })` — present today
   - `attendance.count({ where: { status: 'absent', date: today } })` — absent today
   - `payroll.aggregate(...)` — monthly payroll total
   - `courseEnrollment.count(...)` — active course enrollments

   Additional sequential queries fetch department headcounts, attendance distribution, leave type distribution, expense categories, recent hires, recent audit log entries, performance statistics, and candidate pipeline data.

6. **Data returns to the frontend.** The unified `DashboardData` JSON is returned with `overview`, `charts`, `performance`, `candidatePipeline`, and `recentActivities` top-level keys.

7. **Stat cards render.** The four stat cards are populated with the overview data. The attendance rate is derived by calculating `(presentToday / (presentToday + absentToday)) * 100` on the frontend. The payroll value is formatted conditionally (Crores vs. Lakhs based on magnitude).

8. **Charts render.** The chart data is mapped from the API response into Recharts-compatible formats. The AreaChart, PieChart, and BarChart render with smooth animations.

9. **User reviews statistics.** The user can scan the four metric cards for quick KPIs, hover over chart elements for tooltips with detailed values, and scroll down to review activities and approvals.

**Error Handling:** If the API returns an error (network failure, 500 status, etc.), the Dashboard renders a full-screen error state with a red `AlertCircle` icon, the text "Failed to load dashboard", and the specific error message. The user must refresh the page or navigate away and back to retry.

### 4.2 Using Quick Actions to Navigate to Other Modules

Quick Actions provide a shortcut mechanism for users to jump directly to the most common operations across the platform without first navigating through the sidebar.

**Steps:**

1. **Locate the Quick Actions card.** The Quick Actions card is positioned in Row 3, right column (or stacked below the Expense chart on mobile). The card title "Quick Actions" is displayed at the top.

2. **Identify the desired action.** Six action buttons are displayed in a 2×3 (mobile) or 3×2 (desktop) grid. Each button shows a colored icon and a text label. The available actions are:
   - **Add Employee** (emerald UserPlus icon) — Navigates to the Employee Management module
   - **Process Payroll** (amber CreditCard icon) — Navigates to the Payroll & Expenses module
   - **Post Job** (cyan FileText icon) — Navigates to the Talent Acquisition module
   - **Run Reports** (rose BarChart3 icon) — Navigates to the Analytics & Reporting module
   - **Schedule Interview** (purple CalendarCheck icon) — Navigates to the Talent Acquisition module
   - **Approve Leaves** (teal CheckCircle2 icon) — Navigates to the Time & Attendance module (Leave Management)

3. **Click the Quick Action button.** When the user clicks a button, the `setActiveModule(targetModule)` function is called on the Zustand store with the appropriate module key (e.g., `'employees'`, `'payroll'`, `'talent'`, `'analytics'`, `'attendance'`).

4. **Module renders.** The main `page.tsx` component detects the `activeModule` state change and renders the corresponding module component in place of the Dashboard. The Dashboard component unmounts.

5. **Return to Dashboard.** To return, the user clicks the "Dashboard" item in the sidebar navigation, which calls `setActiveModule('dashboard')`, causing the Dashboard to remount and refetch data.

**Note:** In the current implementation, Quick Action buttons are rendered as `Button` components with `variant="outline"` but do not yet have explicit `onClick` handlers wired to `setActiveModule()`. The intended behavior is that clicking a Quick Action should navigate to the corresponding module. This functionality should be implemented by adding an `onClick` prop that calls `setActiveModule()` with the target module key.

### 4.3 Reviewing Pending Approvals

The Pending Approvals panel consolidates all items requiring managerial or HR approval, providing a single view for actioning leave requests and expense claims.

**Prerequisites:**
- User has a role with approval privileges (Super Admin, HR Admin, Payroll Specialist, or Dept Manager)
- There are pending leave requests or expense claims in the system

**Steps:**

1. **Locate the Pending Approvals card.** The card is positioned in Row 4, right column (or stacked below Recent Activities on mobile). The card title "Pending Approvals" is displayed alongside a red destructive badge showing the total count of pending items (e.g., "5 pending").

2. **Review the pending items.** Two types of pending items may appear:
   - **Leave Requests** — Displayed with a `CalendarDays` icon in amber, the title "Leave Requests", and a description indicating the number of pending requests (e.g., "3 pending approval"). A "Leave" badge in `secondary` variant is shown.
   - **Expense Claims** — Displayed with a `Receipt` icon in rose, the title "Expense Claims", and a description indicating the number of pending claims (e.g., "2 pending approval"). An "Expense" badge in `outline` variant is shown.

   Items are conditionally rendered; if `pendingLeaves` is 0, the Leave Requests item does not appear. If `pendingExpenses` is 0, the Expense Claims item does not appear. If both are 0, the "No pending approvals" empty state is displayed.

3. **Approve an item.** Each pending item has a green approve button (ghost variant, `CheckCircle2` icon) on the right side. Clicking this button should trigger the approval workflow for the respective module:
   - For **Leave Requests**: The system should navigate to the Time & Attendance module's leave management section, where the user can review each individual leave request and approve or reject it.
   - For **Expense Claims**: The system should navigate to the Payroll & Expenses module's expense section, where the user can review each claim and approve, reject, or mark as reimbursed.

4. **Verify approval.** After navigating to the respective module and completing the approval action, the user can return to the Dashboard. The next data fetch will reflect the updated pending counts.

**Important:** The current implementation renders the approve icon button, but it does not yet have an `onClick` handler wired to navigate to the appropriate module or directly approve items. The intended behavior is that clicking the approve button should either navigate to the relevant module or trigger a direct API approval call.

### 4.4 Checking Recent Activities

The Recent Activities feed provides a chronological view of the latest actions performed across the HRMS platform, sourced from the AuditLog table.

**Steps:**

1. **Locate the Recent Activities card.** The card is positioned in Row 4, left column (or stacked above Pending Approvals on mobile). The card title "Recent Activities" is displayed alongside a "View all" ghost button with an `ArrowRight` icon.

2. **Browse the activity feed.** The feed displays up to 10 recent activities, sorted by creation date in descending order (newest first). Each activity item shows:
   - **Module icon** — A circular icon in a muted background, color-coded by the module where the action occurred (see the icon mapping table in Section 3.5.1)
   - **Employee name** — The name of the employee who performed the action, displayed in `font-medium`. If the employee relation is null, "System" is displayed.
   - **Activity details** — The `details` field from the AuditLog, or a fallback string `"{action} in {module}"` if details are empty
   - **Timestamp** — Relative time string (e.g., "Just now", "5 min ago", "2 hours ago", "3 days ago")

3. **Identify new activities.** The most recent activity (first in the list) is highlighted with a green "New" badge on the right side, making it easy to spot the latest change at a glance.

4. **Scroll for more history.** If the content exceeds the visible area, the `max-h-96` container enables vertical scrolling with a custom scrollbar. The user can scroll through all 10 activities.

5. **View all activities.** Clicking the "View all" button should navigate the user to a comprehensive audit log view (RBAC & Security module), where all activities can be filtered by action type, module, employee, and date range.

**Activity Data Source:** Activities are sourced from `db.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { employee: { select: { firstName, lastName, avatar } } } })`. The AuditLog records every write operation (create, update, delete) across all HRMS modules, ensuring comprehensive traceability.

---

## 5. Data Flow

### 5.1 Overview

The Dashboard follows a unidirectional data flow pattern: the API route aggregates data from the database, returns it as a single JSON response, and the frontend component consumes and renders it. There is no client-side caching beyond the component lifecycle, and no server-side caching of the aggregated results.

```
┌─────────────────────┐
│   Browser (Client)  │
│                     │
│  Dashboard.tsx      │
│  ├─ useApi hook     │──── GET /api/dashboard ────┐
│  │  (fetch + state) │                           │
│  └─ JSX rendering   │◄─── DashboardData JSON ───┤
│                     │                           │
└─────────────────────┘                           │
                                                  │
┌─────────────────────────────────────────────────┘
│
│   ┌──────────────────────────────────────────┐
│   │   Next.js API Route                      │
│   │   src/app/api/dashboard/route.ts         │
│   │                                          │
│   │   1. Compute today's date                │
│   │   2. Promise.all([12 parallel queries])  │
│   │   3. Sequential groupBy queries          │
│   │   4. Aggregate performance stats         │
│   │   5. Fetch AuditLog (10 recent)          │
│   │   6. Compose DashboardData JSON          │
│   │   7. Return NextResponse.json()          │
│   └──────────────┬───────────────────────────┘
│                  │
│   ┌──────────────▼───────────────────────────┐
│   │   Prisma ORM                             │
│   │                                          │
│   │   Models queried:                        │
│   │   • Employee (count, groupBy)            │
│   │   • Department (count)                   │
│   │   • Leave (count, groupBy)               │
│   │   • Expense (count, groupBy)             │
│   │   • Job (count)                          │
│   │   • Candidate (count, groupBy)           │
│   │   • Attendance (count, groupBy)          │
│   │   • Payroll (aggregate)                  │
│   │   • CourseEnrollment (count)             │
│   │   • Performance (aggregate)              │
│   │   • AuditLog (findMany + include)        │
│   └──────────────┬───────────────────────────┘
│                  │
│   ┌──────────────▼───────────────────────────┐
│   │   PostgreSQL Database                     │
│   └──────────────────────────────────────────┘
```

### 5.2 API Response Schema

The `GET /api/dashboard` endpoint returns a JSON object with the following structure:

```typescript
interface DashboardData {
  overview: {
    totalEmployees: number       // Total employee count
    activeEmployees: number      // Employees with status 'active'
    departments: number          // Total department count
    recentHires: number          // Employees joined in last 30 days
    presentToday: number         // Attendance records with status 'present' for today
    absentToday: number          // Attendance records with status 'absent' for today
    openJobs: number             // Jobs with status 'open'
    totalCandidates: number      // Total candidate count
    pendingLeaves: number        // Leaves with status 'pending'
    pendingExpenses: number      // Expenses with status 'pending'
    coursesActive: number        // Course enrollments with status 'enrolled' or 'in-progress'
    totalPayrollThisMonth: number // Sum of netPay for processed/paid payroll this month
  }
  charts: {
    departmentHeadcount: {
      department: string         // Department name or 'Unassigned'
      count: number              // Number of active employees in department
    }[]
    attendanceDistribution: {
      status: string             // Attendance status (present, absent, late, etc.)
      count: number              // Number of records for this status
    }[]
    leaveTypeDistribution: {
      leaveType: string          // Leave type (casual, sick, earned, etc.)
      count: number              // Number of leaves of this type
    }[]
    expenseByCategory: {
      category: string           // Expense category name
      totalAmount: number        // Sum of amounts in this category
      count: number              // Number of expense records in this category
    }[]
  }
  performance: {
    averageRating: number        // Average performance rating (0-5 scale)
    averageAttritionRisk: number // Average attrition risk (0-1 scale)
    totalReviews: number         // Total number of performance reviews
  }
  candidatePipeline: {
    status: string               // Candidate status (applied, screening, interview, etc.)
    count: number                // Number of candidates at this stage
  }[]
  recentActivities: {
    action: string               // Action performed (e.g., 'create', 'update', 'delete')
    module: string               // Module where action occurred (e.g., 'hr', 'payroll')
    details: string              // Human-readable description of the action
    createdAt: string            // ISO timestamp of when the action occurred
    employee: {
      firstName: string          // First name of the employee who performed the action
      lastName: string           // Last name of the employee who performed the action
    } | null                     // Null if action was performed by the system
  }[]
}
```

### 5.3 Frontend Data Processing

The `Dashboard` component applies several transformations to the raw API data before rendering:

| Transformation | Input | Output | Purpose |
|----------------|-------|--------|---------|
| **Attendance Rate Calculation** | `overview.presentToday`, `overview.absentToday` | `(presentToday / (presentToday + absentToday)) * 100` | Derives percentage from raw counts |
| **Payroll Formatting** | `overview.totalPayrollThisMonth` (number) | `₹X.XX Cr` or `₹X.XX L` | Indian numbering format (Crores/Lakhs) |
| **Headcount Chart Mapping** | `charts.departmentHeadcount` | `{ month: department, headcount: count }` | Maps department names to Recharts `XAxis` `dataKey` |
| **Pie Chart Mapping** | `charts.departmentHeadcount` | `{ name: department, value: count, color: PIE_COLORS[i] }` | Adds color assignments for pie slices |
| **Expense Chart Mapping** | `charts.expenseByCategory` | `{ department: capitalized category, risk: amount/1000, actual: count }` | Transforms for dual-bar display |
| **Pending Approvals Derivation** | `overview.pendingLeaves`, `overview.pendingExpenses` | Conditional array of approval items | Only renders items with non-zero counts |
| **Relative Time Formatting** | `activity.createdAt` (ISO string) | "Just now", "5 min ago", etc. | Human-friendly timestamps |

### 5.4 Error Flow

```
API Request ──► Network Error ──► useApi sets error state
                                    │
                                    ▼
                              Error State UI:
                              • AlertCircle icon (red)
                              • "Failed to load dashboard"
                              • Error message text
                              • User must refresh to retry
```

The `useApi` hook handles errors by catching exceptions in the `fetchData` function, setting the `error` state to the error message string, and setting `loading` to `false`. The Dashboard component checks the `error` state after the `loading` state check and renders the error UI if `error` is truthy.

---

## 6. Integration with Other Modules

The Dashboard is the most integrated module in the AI-HRMS platform, consuming data from virtually every other module. This section details each integration point, the data consumed, and the nature of the dependency.

### 6.1 Employee Management Module

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Employee count | Total employee count | `db.employee.count()` | Total Employees stat card value |
| Active employee count | Active employees | `db.employee.count({ where: { status: 'active' } })` | Used in attendance rate denominator |
| Department headcount | Employees per department | `db.employee.groupBy({ by: ['department'] })` | Area chart and pie chart data |
| Recent hires | Employees joined in last 30 days | `db.employee.count({ where: { joinDate: { gte: 30DaysAgo } } })` | "this month" change indicator on stat card |

**Dependency:** The Employee module is the foundational data source. Without employee records, the Total Employees card shows 0, the department charts are empty, and the "recent hires" indicator is absent. The Quick Action "Add Employee" navigates to this module.

### 6.2 Attendance Module

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Present today | Count of present records | `db.attendance.count({ where: { status: 'present', date: today } })` | Attendance Rate numerator; "present today" indicator |
| Absent today | Count of absent records | `db.attendance.count({ where: { status: 'absent', date: today } })` | Attendance Rate denominator |
| Attendance distribution | Records grouped by status | `db.attendance.groupBy({ by: ['status'] })` | Available for additional chart rendering |

**Dependency:** Without attendance records for today, the Attendance Rate card displays "0.0%" and the change indicator shows "0 present today". The Quick Action "Mark Attendance" would navigate to this module.

### 6.3 Payroll & Expenses Module

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Monthly payroll total | Sum of netPay for current month | `db.payroll.aggregate({ _sum: { netPay: true }, where: { status: { in: ['processed', 'paid'] } } })` | Monthly Payroll stat card value |
| Pending expenses | Count of pending expense claims | `db.expense.count({ where: { status: 'pending' } })` | Pending Approvals panel |
| Expense by category | Expenses grouped by category | `db.expense.groupBy({ by: ['category'], _sum: { amount: true }, _count: { id: true } })` | Expense & Category Breakdown bar chart |

**Dependency:** Without payroll records, the Monthly Payroll card shows "₹0.00 L". Without expense records, the Expense chart is empty and no expense approvals are shown. The Quick Action "Process Payroll" navigates to this module.

### 6.4 Talent Acquisition Module

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Open positions | Count of open jobs | `db.job.count({ where: { status: 'open' } })` | Active Positions stat card value |
| Candidate count | Total candidates | `db.candidate.count()` | "candidates" indicator on Active Positions card |
| Candidate pipeline | Candidates grouped by status | `db.candidate.groupBy({ by: ['status'] })` | Available for pipeline visualization |

**Dependency:** Without job postings, the Active Positions card shows 0. Without candidates, the "candidates" indicator shows 0. The Quick Actions "Post Job" and "Schedule Interview" navigate to this module.

### 6.5 Performance Module

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Average rating | Mean performance rating | `db.performance.aggregate({ _avg: { rating: true } })` | Performance Summary — Avg Rating |
| Average attrition risk | Mean attrition risk score | `db.performance.aggregate({ _avg: { attritionRisk: true } })` | Performance Summary — Attrition Risk % |
| Total reviews | Count of performance records | `db.performance.aggregate({ _count: { id: true } })` | Performance Summary — Reviews count |

**Dependency:** Without performance reviews, the Performance Summary shows 0.0 rating, 0% attrition risk, and 0 reviews. The summary panel is only rendered when `performance` data is available.

### 6.6 Leave Management Module

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Pending leaves | Count of pending leave requests | `db.leave.count({ where: { status: 'pending' } })` | Pending Approvals panel — Leave Requests |
| Leave type distribution | Leaves grouped by type | `db.leave.groupBy({ by: ['leaveType'] })` | Available for leave type chart rendering |

**Dependency:** Without pending leaves, the Leave Requests item does not appear in the Pending Approvals panel. The Quick Action "Approve Leaves" navigates to the Time & Attendance module where leave management is handled.

### 6.7 AuditLog (Cross-Module)

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Recent activities | 10 most recent audit entries | `db.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { employee: ... } })` | Recent Activities feed |

**Dependency:** The AuditLog is written to by every module in the system whenever a create, update, or delete operation occurs. The Dashboard reads from this log to display recent activities. Without audit entries, the feed shows the "No recent activities" empty state.

### 6.8 Learning & Development Module

| Integration Point | Data Consumed | API Query | Dashboard Usage |
|-------------------|---------------|-----------|-----------------|
| Active courses | Count of active enrollments | `db.courseEnrollment.count({ where: { status: { in: ['enrolled', 'in-progress'] } } })` | Available in overview data (coursesActive) |

**Dependency:** The `coursesActive` value is returned in the overview but is not currently displayed as a stat card on the Dashboard. It is available for future UI expansion.

---

## 7. Role-Based Views

The Dashboard displays the same structural layout to all authenticated users; however, the data content and available actions vary based on the user's role. This section details what each role sees and can act upon.

### 7.1 Super Admin (Level 0)

| Dashboard Element | Visibility & Behavior |
|-------------------|----------------------|
| Stat Cards | Full visibility: Total Employees, Active Positions, Attendance Rate, Monthly Payroll |
| Department Headcount Chart | Full visibility of all departments |
| Department Distribution Chart | Full visibility of all departments |
| Expense Chart | Full visibility of all expense categories |
| Quick Actions | All 6 actions available: Add Employee, Process Payroll, Post Job, Run Reports, Schedule Interview, Approve Leaves |
| Performance Summary | Full visibility: company-wide averages |
| Recent Activities | Full visibility of all 10 recent activities across all modules |
| Pending Approvals | Can see and approve all pending leave requests and expense claims across the organization |

### 7.2 HR Admin (Level 1)

| Dashboard Element | Visibility & Behavior |
|-------------------|----------------------|
| Stat Cards | Full visibility (same as Super Admin) |
| Charts | Full visibility of all charts |
| Quick Actions | All 6 actions available. Primary user of "Add Employee" and "Approve Leaves" actions |
| Performance Summary | Full visibility of company-wide performance averages |
| Recent Activities | Full visibility of all recent activities |
| Pending Approvals | Primary handler of leave requests and expense claims. Sees all pending items across departments |

### 7.3 Payroll Specialist (Level 2)

| Dashboard Element | Visibility & Behavior |
|-------------------|----------------------|
| Stat Cards | Particular focus on Monthly Payroll card. Total Employees and Attendance Rate are relevant for payroll calculations |
| Expense Chart | Primary focus — uses expense breakdown for budgeting and reimbursement processing |
| Quick Actions | "Process Payroll" is the primary action. "Approve Leaves" may be relevant if absence affects payroll |
| Performance Summary | Secondary interest — performance ratings may influence salary adjustments |
| Pending Approvals | Primarily interested in Expense Claims. May not handle Leave Requests directly unless configured |
| Recent Activities | Focuses on payroll and expense-related activities |

### 7.4 Department Manager (Level 3)

| Dashboard Element | Visibility & Behavior |
|-------------------|----------------------|
| Stat Cards | Total Employees relevant for team size. Attendance Rate important for team productivity. Open Positions relevant for team hiring |
| Department Charts | Focus on own department in charts. Department Distribution shows relative team size |
| Quick Actions | "Approve Leaves" is the primary action for approving team members' leave requests |
| Performance Summary | Interested in team-level performance metrics |
| Pending Approvals | Sees leave requests from their department. May approve/reject leaves for direct reports |
| Recent Activities | Focuses on activities related to their department's employees |

> **Note:** In the current implementation, role-based data filtering is not applied at the API level. The `GET /api/dashboard` endpoint returns organization-wide data regardless of the requesting user's role. Department-level filtering should be implemented as a future enhancement by passing the user's department context to the API query.

### 7.5 Employee (Level 6)

| Dashboard Element | Visibility & Behavior |
|-------------------|----------------------|
| Stat Cards | Can see organization-wide metrics. Attendance Rate is personally relevant |
| Charts | Can view department distribution and expense charts (read-only, no approval actions) |
| Quick Actions | "Apply Leave" would be the most relevant action (currently mapped as "Approve Leaves", which should be replaced with "Apply Leave" for employee role) |
| Performance Summary | Can see their own performance rating if displayed individually (currently shows company average) |
| Pending Approvals | No approval privileges. This section should show "No pending approvals" or be hidden entirely |
| Recent Activities | Should ideally show only their own activities (currently shows all activities organization-wide) |

> **Future Enhancement:** Implement employee-specific Dashboard views that filter data to show personal attendance, leave balance, payslip access, and individual performance metrics rather than organization-wide data.

### 7.6 Recruiter (Level 4)

| Dashboard Element | Visibility & Behavior |
|-------------------|----------------------|
| Stat Cards | Active Positions is the primary metric of interest. Total Candidates indicator is highly relevant |
| Charts | Department charts useful for understanding hiring needs by department |
| Quick Actions | "Post Job" and "Schedule Interview" are the primary actions |
| Performance Summary | Secondary interest — may inform hiring decisions |
| Pending Approvals | Not typically involved in leave or expense approvals |
| Recent Activities | Focuses on recruitment-related activities (candidate applications, interview scheduling) |

### 7.7 L&D Manager (Level 5)

| Dashboard Element | Visibility & Behavior |
|-------------------|----------------------|
| Stat Cards | Total Employees relevant for training needs assessment. Attendance Rate affects training participation |
| Charts | Department Distribution useful for planning department-specific training programs |
| Quick Actions | Would benefit from a "Create Course" quick action (not currently present) |
| Performance Summary | Primary interest — performance gaps inform training program design and skill development initiatives |
| Pending Approvals | Not typically involved in standard approvals |
| Recent Activities | Focuses on learning and development-related activities (course completions, enrollments) |

### 7.8 Role-View Summary Matrix

| Feature | Super Admin | HR Admin | Payroll | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:-------:|:------------:|:--------:|:---------:|:-----------:|
| All 4 Stat Cards | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dept Headcount Chart | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dept Distribution Chart | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Expense Chart | ✅ | ✅ | ✅ | 🔶 | ✅ | 🔶 | 🔶 |
| All Quick Actions | ✅ | ✅ | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 |
| Performance Summary | ✅ | ✅ | 🔶 | ✅ | 🔶 | 🔶 | ✅ |
| Recent Activities (all) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve Leaves | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve Expenses | ✅ | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ |

> **Legend:** ✅ Full access | 🔶 Partial/conditional access | ❌ No access

---

## 8. Troubleshooting

### 8.1 Common Issues and Solutions

#### Issue 1: Dashboard Shows "Failed to load dashboard" Error

**Symptoms:** The Dashboard displays a red AlertCircle icon with the message "Failed to load dashboard" and a specific error message.

**Possible Causes:**
- The backend API route (`/api/dashboard`) is unreachable due to a network error or server downtime
- The database connection has failed or timed out
- One or more Prisma queries encountered an error (e.g., invalid data, missing table)
- The user's session has expired, and the API returned a 401 status

**Resolution Steps:**
1. Check the browser's Network tab (DevTools → Network) to inspect the `GET /api/dashboard` response status and body
2. If the response status is 401, the user's session has expired. Log out and log back in to establish a new session
3. If the response status is 500, check the server logs for the specific error. Common server-side issues include:
   - Database connection failure: Verify the `DATABASE_URL` environment variable and ensure PostgreSQL is running
   - Prisma query error: Check if all required database tables exist by running `npx prisma db push` or `npx prisma migrate status`
4. If the request itself failed (no response), check the network connectivity and ensure the Next.js server is running
5. After resolving the underlying issue, refresh the page to trigger a new data fetch

#### Issue 2: Stat Cards Show Zero or Unexpected Values

**Symptoms:** One or more stat cards display "0", "0.0%", or "₹0.00 L" when data is expected to exist.

**Possible Causes:**
- The database tables are empty (no employees, no attendance records, no payroll records)
- The date-based queries are returning no results because today's date doesn't match any records (common in development/testing with stale data)
- The `status` field values don't match the query filters (e.g., attendance status is "Present" instead of "present")

**Resolution Steps:**
1. Verify that the relevant database tables contain records by querying directly (e.g., `SELECT COUNT(*) FROM "Employee" WHERE status = 'active'`)
2. Check that attendance records exist for today's date by querying `SELECT COUNT(*) FROM "Attendance" WHERE date = CURRENT_DATE AND status = 'present'`
3. Verify that payroll records exist for the current month with status 'processed' or 'paid'
4. If testing with seed data, ensure the seed script creates records with the correct date values and status strings
5. Check for case-sensitivity issues in status values — Prisma queries are case-sensitive

#### Issue 3: Charts Are Empty or Show "No data available"

**Symptoms:** The Department Headcount area chart, Department Distribution pie chart, or Expense bar chart shows a "No {type} data available" placeholder.

**Possible Causes:**
- The `departmentHeadcount` array is empty because no employees have an assigned department
- The `expenseByCategory` array is empty because no expenses exist with status 'pending', 'approved', or 'reimbursed'
- The API route's `groupBy` queries return empty arrays when no matching records exist

**Resolution Steps:**
1. Ensure employees have non-empty, non-null department values: `SELECT department, COUNT(*) FROM "Employee" WHERE status = 'active' AND department IS NOT NULL AND department != '' GROUP BY department`
2. Ensure expense records exist with valid categories: `SELECT category, COUNT(*), SUM(amount) FROM "Expense" WHERE status IN ('pending', 'approved', 'reimbursed') GROUP BY category`
3. If using the seed script, verify that it populates department assignments and expense categories
4. The API route explicitly filters out employees with empty or null departments in the `departmentHeadcount` query — ensure department values are populated

#### Issue 4: Recent Activities Feed Is Empty

**Symptoms:** The Recent Activities panel displays "No recent activities" despite actions having been performed in the system.

**Possible Causes:**
- The `AuditLog` table is empty because no write operations have been recorded yet
- The `findMany` query's `take: 10` limit combined with `orderBy: { createdAt: 'desc' }` returns nothing if the table is empty
- The audit logging middleware is not properly recording actions

**Resolution Steps:**
1. Verify the AuditLog table has entries: `SELECT COUNT(*) FROM "AuditLog"`
2. If the table is empty, perform a write operation (e.g., add an employee, submit a leave request) and check if an audit entry is created
3. Check that all module API routes include audit log creation on write operations (look for `db.auditLog.create()` calls)
4. Verify the `include: { employee: ... }` relation in the audit log query — if the `employeeId` reference is invalid, the include may fail silently

#### Issue 5: Pending Approvals Section Shows No Items

**Symptoms:** The Pending Approvals panel shows "No pending approvals" even when there are unapproved leave requests or expense claims.

**Possible Causes:**
- The `pendingLeaves` count is 0 because all leave requests have been approved or rejected
- The `pendingExpenses` count is 0 because all expense claims have been processed
- The query filters don't match the actual status values in the database (e.g., "Pending" vs. "pending")

**Resolution Steps:**
1. Check for pending leaves: `SELECT COUNT(*) FROM "Leave" WHERE status = 'pending'`
2. Check for pending expenses: `SELECT COUNT(*) FROM "Expense" WHERE status = 'pending'`
3. Verify the exact status string values used in the database match the Prisma query filters
4. If the status values use different casing, update the seed data or the query to match

#### Issue 6: Dashboard Loading Spinner Persists Indefinitely

**Symptoms:** The "Loading dashboard data…" spinner continues spinning and the Dashboard content never renders.

**Possible Causes:**
- The API request is pending and has not received a response (server hang or extremely slow database)
- The `useApi` hook's `enabled` parameter is set to `false` (not applicable in current implementation, but possible in future)
- A JavaScript error occurs during the fetch that is not caught by the try-catch block

**Resolution Steps:**
1. Open the browser DevTools Network tab and check the status of the `GET /api/dashboard` request
2. If the request is pending, check for database query performance issues. The dashboard API runs 12+ queries; slow queries can cause timeouts
3. Consider adding query timeouts to the Prisma queries or implementing pagination for large datasets
4. Check the browser console for any uncaught JavaScript errors
5. If the API route is timing out, check the database connection pool settings and query execution plans

#### Issue 7: Payroll Value Displays Incorrectly

**Symptoms:** The Monthly Payroll stat card shows an unexpected value (e.g., ₹0.00 L when payroll has been processed, or a negative number).

**Possible Causes:**
- The payroll `aggregate` query returns `null` for `_sum.netPay` when no records match the filter (handled by `?? 0`)
- The current month/year filter doesn't match any payroll records
- The payroll status values are not 'processed' or 'paid' (e.g., they are 'draft' or 'pending')

**Resolution Steps:**
1. Verify payroll records for the current month: `SELECT SUM("netPay") FROM "Payroll" WHERE month = 'March' AND year = 2026 AND status IN ('processed', 'paid')`
2. Check that the month name matches exactly — the API uses `new Date().toLocaleString('en-US', { month: 'long' })` which returns full month names like "January", "February", etc.
3. Ensure payroll records have been processed (status = 'processed' or 'paid'), not left in 'draft' status
4. The Crore/Lakh formatting logic: values ≥ 10,000,000 display as Crores, others as Lakhs. Verify this matches the expected display format for your currency range

#### Issue 8: Quick Action Buttons Don't Navigate

**Symptoms:** Clicking a Quick Action button (Add Employee, Process Payroll, etc.) does not navigate to the respective module.

**Possible Causes:**
- The Quick Action buttons in the current implementation do not have `onClick` handlers wired to the `setActiveModule()` Zustand store action
- The buttons are rendered as `Button` components with `variant="outline"` but no navigation logic

**Resolution Steps:**
1. This is a known implementation gap. To fix, add an `onClick` handler to each Quick Action button that calls `setActiveModule()` with the appropriate module key
2. The mapping should be:
   - "Add Employee" → `setActiveModule('employees')`
   - "Process Payroll" → `setActiveModule('payroll')`
   - "Post Job" → `setActiveModule('talent')`
   - "Run Reports" → `setActiveModule('analytics')`
   - "Schedule Interview" → `setActiveModule('talent')`
   - "Approve Leaves" → `setActiveModule('attendance')`
3. Import `useHRMSStore` from `@/lib/store` in the Dashboard component and destructure `setActiveModule`
4. Alternatively, use the `useApi` hook's navigation pattern from other modules

### 8.2 Performance Considerations

| Concern | Details | Mitigation |
|---------|---------|------------|
| **Slow API response** | The dashboard API runs 12+ database queries per request | All count queries run in parallel via `Promise.all()`. Consider adding Redis caching for 60-second TTL |
| **Large dataset rendering** | Charts with many departments (>20) may render slowly | Recharts `ResponsiveContainer` handles rendering; consider pagination for extreme cases |
| **Unnecessary refetches** | Navigating away and back triggers a full refetch | Implement client-side caching (SWR, React Query, or local state) to avoid redundant API calls |
| **AuditLog query performance** | `findMany` with `include` on large tables can be slow | The query is limited to `take: 10` and ordered by indexed `createdAt` field. Ensure index exists |
| **Database connection pool** | Multiple parallel queries may exhaust the connection pool | Prisma manages connection pooling. Monitor pool usage and adjust `connection_limit` if needed |

### 8.3 Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Supported | Full compatibility with Recharts, CSS Grid, and Flexbox |
| Firefox 90+ | ✅ Supported | Full compatibility |
| Safari 15+ | ✅ Supported | Full compatibility |
| Edge 90+ | ✅ Supported | Chromium-based, full compatibility |
| IE 11 | ❌ Not supported | CSS Grid, Recharts, and modern JS features not supported |

---

*Document maintained by the AI-HRMS Engineering Team. For questions or updates, contact the platform administrators.*
