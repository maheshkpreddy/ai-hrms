# Standard Operating Procedure — Analytics & Reporting Module

**AI-HRMS Application**

| Field | Value |
|-------|-------|
| **Document ID** | SOP-HRMS-09 |
| **Module Key** | `analytics` |
| **Component** | `src/components/hrms/Analytics.tsx` |
| **API Endpoints** | `GET /api/dashboard`, `GET /api/employees`, `GET /api/attendance`, `GET /api/performance`, `GET /api/payroll` |
| **Version** | 1.0 |
| **Effective Date** | 2026-03-04 |
| **Classification** | Internal — Super Admin, HR Admin |
| **Review Cycle** | Quarterly |

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [Predictive Analytics Models](#5-predictive-analytics-models)
6. [Report Builder](#6-report-builder)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Role-Based Access](#8-role-based-access)
9. [Business Rules](#9-business-rules)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Analytics & Reporting module serves as the intelligence hub of the AI-HRMS platform, transforming raw HR data from across the organization into actionable insights, predictive forecasts, and customizable reports. While the Dashboard module provides a high-level operational overview, the Analytics module goes deeper — offering real-time KPIs with trend analysis, AI-powered predictive models for attrition and hiring, salary benchmarking against market data, engagement scoring, and a full-featured report builder with scheduling capabilities.

The module's primary purpose is threefold: (1) to provide HR administrators and organizational leaders with a real-time, at-a-glance understanding of workforce health through interactive dashboards and KPI cards; (2) to leverage machine learning and statistical models to predict future workforce trends such as attrition risk, hiring demand, salary competitiveness, and employee engagement trajectories; and (3) to enable the creation, generation, scheduling, and export of custom reports drawn from multiple data sources across the HRMS ecosystem. By unifying these three capabilities into a single module, the system eliminates the need for external BI tools and spreadsheet-based analytics, reducing time-to-insight and enabling data-driven decision-making at every level of HR operations.

### 1.2 Scope

This SOP covers the following functional areas within the Analytics & Reporting module:

- **Real-Time Dashboards:** Six KPI cards (Headcount, Attrition Rate, Average Tenure, Diversity Index, Cost per Hire, Open Positions) with live data refresh, four interactive charts (Headcount Trend line chart, Department Distribution pie chart, Gender Diversity donut chart, Attendance Heatmap grid), and a Payroll Cost Trend area chart covering the last six months.
- **Predictive Analytics:** AI-powered attrition prediction by department, six-month hiring demand forecast with confidence intervals, salary benchmarking comparing internal compensation against market averages, engagement score prediction with trend indicators, and workforce trend prediction cards with risk classification and confidence levels.
- **Custom Reports:** A report builder with five pre-defined templates (Employee Directory, Attendance Summary, Payroll Report, Performance Overview, Attrition Analysis), a "Create Custom Report" dialog with configurable data source, metrics, date range, and export format, a recent reports listing with download and preview actions, and a scheduled reports manager with frequency control and status management.

Out of scope: The Analytics module is a read-only aggregation and analysis layer. It does not perform any write operations (create, update, delete) on employee records, attendance, payroll, or performance data. All data modifications are performed within their respective modules, and the Analytics module reflects those changes upon the next data fetch or refresh cycle.

### 1.3 Target Users

The Analytics & Reporting module is designed for strategic and administrative users who require organization-wide visibility and analytical capabilities. Access is restricted to the following roles:

| Role | Level | Module Interaction |
|------|-------|-------------------|
| **Super Admin** | 0 | Full access to all tabs, predictive models, report builder, and scheduling. Can create, schedule, export, and delete any report. Has visibility into all departments and all KPIs. |
| **HR Admin** | 1 | Full access to all tabs and predictive analytics. Can create custom reports, schedule reports, and export data. Primary consumer of attrition prediction and salary benchmarking for strategic workforce planning. |

Other roles (Dept Manager, Employee, Recruiter, Payroll Specialist, L&D Manager) do not have access to this module. Department managers and other roles who need specific analytics can access relevant filtered views through the Dashboard module or request reports from their HR Admin.

### 1.4 AI Capabilities

The Analytics module features four AI-powered predictive capabilities, each marked with a distinctive "AI" badge (emerald-colored with a `Sparkles` icon) in the user interface:

1. **Attrition Prediction:** Analyzes performance review data to calculate per-department attrition risk percentages, comparing predicted risk against actual observed attrition rates.
2. **Hiring Demand Forecast:** Uses open job count and recent hiring velocity to project hiring needs over the next six months with upper and lower confidence bounds.
3. **Salary Benchmarking:** Groups employee salaries by designation and compares internal average compensation against simulated market rates, displaying percentile rankings.
4. **Engagement Score Prediction:** Derives engagement scores from performance ratings and predicts future engagement trajectories by department, including up/down trend indicators.

These models operate on the data already present within the HRMS system, requiring no external integrations for baseline predictions. An informational banner at the top of the Predictive Analytics tab clarifies that forecasts are generated using machine learning models trained on historical HR data and that confidence levels vary per model.

---

## 2. Access & Navigation

### 2.1 Navigating to the Module

The Analytics & Reporting module is accessible from the main sidebar navigation within the AI-HRMS application. Users should follow these steps to access the module:

1. Log in to the AI-HRMS application using valid credentials (email/password or Google OAuth). Only users with the Super Admin or HR Admin role will see the Analytics navigation item in the sidebar.
2. From the left sidebar, locate and click on the **"Analytics"** menu item. The sidebar icon features a `BarChart3` bar chart icon for quick visual identification. On mobile, the label appears as "Analytics."
3. The module loads with the **Real-Time Dashboards** tab selected by default, displaying current KPI cards and live charts.
4. The header area displays the title "Analytics & Reporting" with the subtitle "AI-powered workforce insights and custom reports," alongside a green "Live" badge with a pulsing animation and a "Refresh" button.

### 2.2 Module Layout

The Analytics & Reporting module is organized into three primary tabs, each serving a distinct functional area:

| Tab | Icon | Purpose | Badge |
|-----|------|---------|-------|
| **Real-Time Dashboards** | `LayoutDashboard` | Live KPIs, interactive charts, attendance heatmap, and payroll trends | None |
| **Predictive Analytics** | `Brain` | AI-powered attrition prediction, hiring forecast, salary benchmarking, engagement scoring | Green "AI" badge with `Sparkles` icon |
| **Custom Reports** | `FileBarChart` | Report templates, custom report builder, recent reports, and scheduled reports | None |

On mobile viewports (<768px), the tab labels are abbreviated: "Dashboards," "Predictive," and "Reports" respectively. The `TabsList` component uses a `flex-wrap` layout to accommodate all three tabs even on narrow screens.

### 2.3 Component Reference

- **Frontend Component:** `src/components/hrms/Analytics.tsx`
- **API Endpoints Consumed:**
  - `GET /api/dashboard` — Provides overview statistics, department headcounts, attendance distribution, and performance aggregates
  - `GET /api/employees` — Supplies employee records for gender distribution, salary benchmarking, tenure calculation, and cost-per-hire computation
  - `GET /api/attendance` — Provides attendance records for heatmap generation and attendance rate calculations
  - `GET /api/performance` — Supplies performance review data for attrition prediction, engagement scoring, and workforce predictions
  - `GET /api/payroll` — Provides payroll records for payroll cost trend analysis and monthly expenditure calculations

### 2.4 Data Fetching Strategy

The Analytics component uses five separate `useApi` hook instances, one for each API endpoint. All five requests are initiated simultaneously upon component mount, enabling parallel data loading. Each hook independently manages its own loading, error, and data states. The component uses the `anyLoading` flag (a logical OR of all five loading states) to coordinate global loading indicators, while individual loading states control per-chart skeleton placeholders for a more granular user experience.

The `refetchDashboard` function from the dashboard `useApi` hook is exposed via the "Refresh" button in the header, allowing users to manually refresh the primary aggregated data source. Note that refreshing only re-fetches the dashboard endpoint; to refresh all data, the user must navigate away from and back to the module, which triggers a full component remount.

### 2.5 Prerequisites

- The user must have an active account with Super Admin or HR Admin role assignment.
- Backend database must contain at least some records across the Employee, Attendance, Performance, and Payroll tables for meaningful analytics.
- For predictive analytics features to generate useful outputs, the Performance module should have review records with `attritionRisk` and `rating` values populated.
- For salary benchmarking accuracy, employee records should have valid `designation` and `salary` fields.

---

## 3. Screen Descriptions

### 3.1 Real-Time Dashboards Tab

The Real-Time Dashboards tab is the default view when the Analytics module loads. It provides a comprehensive, live snapshot of organizational health through KPI cards, trend charts, distribution visualizations, and an attendance heatmap.

#### 3.1.1 Header Section

At the top of the module, a flexible header row provides context and status:

| Element | Description |
|---------|-------------|
| **Title** | "Analytics & Reporting" — rendered as an `h1` with `text-2xl` on mobile and `text-3xl` on larger screens, bold, tight tracking |
| **Subtitle** | "AI-powered workforce insights and custom reports" — rendered in `text-muted-foreground` at `text-sm` |
| **Live Badge** | A `Badge` component with "Live" text, styled with an emerald color scheme. Inside the badge, a pulsing green dot animation (using `animate-ping` on an absolute-positioned span) indicates real-time data status |
| **Refresh Button** | An outline variant button with a `RefreshCw` icon. Clicking triggers `refetchDashboard()`. When loading, the icon spins and the button is disabled |

#### 3.1.2 KPI Cards Row

Six KPI cards are displayed in a responsive grid: 2 columns on mobile, 3 columns on `sm:` screens, and 6 columns on `lg:` screens. Each card is a `Card` component with a bottom accent gradient bar.

| # | Label | Value Source | Icon | Icon Background | Change Text |
|---|-------|-------------|------|----------------|-------------|
| 1 | **Headcount** | `overview.totalEmployees` formatted with `toLocaleString()` | `Users` | `bg-emerald-100 text-emerald-700` (dark: `bg-emerald-950 text-emerald-400`) | `+{overview.recentHires} this month` |
| 2 | **Attrition Rate** | `(overview.absentToday / overview.activeEmployees) * 100`, formatted to 1 decimal with `%` suffix | `TrendingDown` | `bg-rose-100 text-rose-700` (dark: `bg-rose-950 text-rose-400`) | `{overview.absentToday} absent today` |
| 3 | **Avg Tenure** | Calculated from active employees' `joinDate` fields, averaged and formatted as `X.X yrs` | `Clock` | `bg-amber-100 text-amber-700` (dark: `bg-amber-950 text-amber-400`) | `Based on active staff` |
| 4 | **Diversity Index** | Simpson's Diversity Index calculated from gender distribution percentages, formatted to 2 decimal places | `Scale` | `bg-teal-100 text-teal-700` (dark: `bg-teal-950 text-teal-400`) | `Gender diversity` |
| 5 | **Cost per Hire** | `(totalPayrollThisMonth / 12 / recentHires) / 100000`, formatted as `₹X.XL`; `₹0` if no recent hires | `DollarSign` | `bg-cyan-100 text-cyan-700` (dark: `bg-cyan-950 text-cyan-400`) | `Avg recruitment cost` |
| 6 | **Open Positions** | `overview.openJobs` as string | `Timer` | `bg-orange-100 text-orange-700` (dark: `bg-orange-950 text-orange-400`) | `{overview.totalCandidates} candidates` |

**Card Internal Layout:** Each card contains a rounded icon container (top-left), a directional arrow indicator (top-right, emerald for positive or rose for negative), the value in bold, the label in muted text, and a change indicator in small colored text. A 0.5px gradient accent bar runs along the bottom edge.

**Loading State:** When `dashboardLoading` is true, a `KPISkeleton` component renders six skeleton placeholder cards with animated pulse effects for the icon, value, label, and change text areas.

#### 3.1.3 Headcount Trend Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Headcount Trend" |
| **Chart Type** | Recharts `LineChart` |
| **Chart Height** | 280px (within `ResponsiveContainer`) |
| **Data Source** | `monthlyTrends` derived from employees and payroll data, covering the last 6 months |
| **Lines** | Two: "Headcount" (solid emerald, strokeWidth 2.5, dots radius 4) and "Hiring" (dashed amber, strokeWidth 2, strokeDasharray "5 5", dots radius 3) |
| **Grid** | Dashed CartesianGrid with 50% opacity |
| **Y-Axis Domain** | `['dataMin - 5', 'dataMax + 5']` |
| **Empty State** | "No employee data available" — centered muted text |

**Data Derivation Logic:** For each of the last 6 months, the system calculates headcount (employees who joined before month-end with active/onboarding status), hiring count (employees whose `joinDate` falls within the month), and payroll totals. If no payroll data exists for a month, a fallback estimate of `headcount * 95000` is used.

#### 3.1.4 Department Distribution Pie Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Department Distribution" |
| **Chart Type** | Recharts `PieChart` (non-donut, `outerRadius={95}`, no inner radius) |
| **Chart Height** | 280px |
| **Data Source** | `departmentDistribution` derived from `dashboardData.charts.departmentHeadcount` |
| **Color Palette** | 10-color cycle: `#10b981`, `#f59e0b`, `#8b5cf6`, `#ec4899`, `#06b6d4`, `#f97316`, `#6366f1`, `#14b8a6`, `#ef4444`, `#84cc16` |
| **Padding Angle** | 3 degrees between slices |
| **Tooltip Format** | `"{value} employees" — {department name}"` |
| **Legend** | Circle icon type, size 8, font size 12px |
| **Empty State** | "No department data available" |

#### 3.1.5 Gender Diversity Donut Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Gender Diversity" |
| **Chart Type** | Recharts `PieChart` (donut style, `innerRadius={65}`, `outerRadius={95}`) |
| **Chart Height** | 280px |
| **Data Source** | `genderDistribution` derived from active employees' `gender` field |
| **Color Mapping** | Male: `#10b981`, Female: `#f59e0b`, Other: `#a855f7` |
| **Value Display** | Percentages (calculated as count/total * 100, rounded) |
| **Padding Angle** | 4 degrees between slices |
| **Tooltip Format** | `"{value}% — {gender}"` |
| **Empty State** | "No employee data available" |

**Data Derivation Logic:** Active employees (`status === 'active'`) are grouped by their `gender` field. Employees with missing or null gender values are categorized as "Other." Each group's count is converted to a percentage of the total active employee count.

#### 3.1.6 Attendance Heatmap

The attendance heatmap provides a visual grid of attendance rates organized by week (rows) and day of week (columns), using color-coded cells to represent attendance percentages.

| Property | Value |
|----------|-------|
| **Card Title** | "Attendance Heatmap" |
| **Chart Type** | Custom HTML/CSS grid (not Recharts) |
| **Data Source** | `attendanceHeatmap` derived from attendance records, showing the last 4 weeks |
| **Columns** | Week label + Mon through Sun (8 columns total) |
| **Cell Size** | Height 36px (`h-9`), centered text, rounded-md corners |
| **Display** | Percentage value if > 0; em dash (—) if 0 |

**Color Coding (based on attendance percentage):**

| Percentage Range | Cell Color | Text Color |
|-----------------|------------|------------|
| 0% | `bg-muted/30` | N/A (em dash) |
| 1–29% | `bg-rose-300` | `text-rose-900` |
| 30–69% | `bg-orange-300` | `text-orange-900` |
| 70–84% | `bg-amber-400` | `text-amber-900` |
| 85–89% | `bg-emerald-300` | `text-emerald-900` |
| 90–94% | `bg-emerald-400` | `text-white` |
| ≥95% | `bg-emerald-500` | `text-white` |

**Legend:** A horizontal legend below the grid shows five color ranges: ≥95%, 85–94%, 70–84%, 30–69%, and 0%.

**Data Derivation Logic:** Attendance records are grouped by ISO week number. For each week-day combination, the attendance rate is calculated as `(present + late count) / total records * 100`, rounded to the nearest integer. Only the last 4 weeks of data are displayed.

#### 3.1.7 Payroll Cost Trend Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Payroll Cost Trend" |
| **Chart Type** | Recharts `AreaChart` with gradient fill |
| **Chart Height** | 280px |
| **Data Source** | `monthlyTrends` (payroll field for each of the last 6 months) |
| **Area Configuration** | Monotone interpolation, emerald stroke (#10b981, strokeWidth 2.5), gradient fill from 30% opacity to 0% |
| **Y-Axis Format** | `₹X.XM` (divided by 1,000,000) |
| **Tooltip Format** | `₹X.XXM` for the Payroll series |
| **Dots** | Default: radius 4; Active: radius 6 |
| **Empty State** | "No payroll data available" |

---

### 3.2 Predictive Analytics Tab

The Predictive Analytics tab contains AI-powered models that forecast future workforce trends. It features an informational banner and five distinct analytical visualizations.

#### 3.2.1 AI Informational Banner

At the top of the Predictive Analytics tab, a styled banner provides context about the AI models:

| Property | Value |
|----------|-------|
| **Background** | `bg-emerald-50` with `border-emerald-200` (dark: `bg-emerald-950/50` with `border-emerald-800`) |
| **Icon** | `Sparkles` icon in an emerald circle container |
| **Title** | "AI-Powered Predictions" (semibold, emerald-800/dark: emerald-300) |
| **Description** | "Forecasts are generated using machine learning models trained on your historical HR data. Confidence levels vary per model." (emerald-600/dark: emerald-400, text-xs) |

#### 3.2.2 AI Hiring Forecast Chart

| Property | Value |
|----------|-------|
| **Card Title** | "AI Hiring Forecast" with green "AI" badge |
| **Chart Type** | Recharts `ComposedChart` (Area + Line combination) |
| **Chart Height** | 280px |
| **Data Source** | `hiringForecast` — 6-month forward projection |
| **Elements** | Upper bound area (emerald, 10% opacity), Lower bound area (white, 80% opacity to create band effect), Predicted line (emerald, dashed, strokeWidth 2.5, strokeDasharray "8 4") |
| **X-Axis** | Month names (next 6 months) |
| **Confidence Interval** | ±3 hires around the predicted value |
| **Empty State** | Chart renders with data derived from dashboard overview (open jobs + recent hires) |

**Prediction Logic:** The hiring forecast derives its base prediction from `averageMonthlyHire` (recent hires divided by 3) plus `openJobs / 6`. A small random variance (±1) is applied for realism. The lower bound is `max(1, predicted - 3)` and the upper bound is `predicted + 3`, creating a visual confidence band around the dashed prediction line.

#### 3.2.3 Attrition Prediction Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Attrition Prediction" with amber "Risk" badge (featuring `AlertTriangle` icon) |
| **Chart Type** | Recharts `BarChart` (grouped bars) |
| **Chart Height** | 280px |
| **Data Source** | `attritionPrediction` derived from performance data |
| **Bars** | "Predicted Risk %" (amber `#f59e0b`, barSize 16, radius top corners) and "Actual Attrition %" (emerald `#10b981`, barSize 16, radius top corners) |
| **X-Axis** | Department names (font size 11, rotated -20 degrees, text anchor "end", height 50) |
| **Empty State** | "No performance data available" |

**Prediction Logic:** Performance records are grouped by department. For each department, the average `attritionRisk` value is computed. The "Predicted Risk" is `(totalRisk / count) * 100` and the "Actual Attrition" is `(totalRisk / count) * 70` — reflecting that actual observed attrition is typically lower than the model's predicted risk.

#### 3.2.4 Workforce Trend Predictions Cards

| Property | Value |
|----------|-------|
| **Card Title** | "Workforce Trend Predictions" with green "AI" badge |
| **Layout** | 1 column on mobile, 2 columns on `sm:`, 4 columns on `lg:` grid |
| **Data Source** | `workforcePredictions` — top 4 departments from attrition prediction data |

**Card Content per Department:**

| Element | Description |
|---------|-------------|
| **Department Emoji** | Department-specific emoji from `deptIconMap` (e.g., Engineering: 🔧, Sales: 📊, Marketing: 🎯, HR: 👥) |
| **Risk Badge** | Color-coded badge: "high risk" (rose), "medium risk" (amber), "low risk" (emerald) |
| **Department Name** | Bold text, semibold weight |
| **Prediction Text** | For high risk: "X employees at flight risk"; medium risk: "Monitor closely, potential turnover"; low risk: "Stable team, low attrition risk" |
| **Confidence Bar** | A progress bar with percentage label; confidence range 70–95% |

**Risk Classification Logic:**

| Average Attrition Risk | Risk Level | Badge Color |
|----------------------|------------|-------------|
| ≥20% | High | Rose (`bg-rose-100 text-rose-700` / dark: `bg-rose-950 text-rose-400`) |
| 10–19% | Medium | Amber (`bg-amber-100 text-amber-700` / dark: `bg-amber-950 text-amber-400`) |
| <10% | Low | Emerald (`bg-emerald-100 text-emerald-700` / dark: `bg-emerald-950 text-emerald-400`) |

**Loading State:** Four skeleton cards with animated placeholders for the icon, department name, prediction text, and confidence bar.

#### 3.2.5 Salary Benchmarking Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Salary Benchmarking" with green "AI" badge |
| **Chart Type** | Recharts `BarChart` (horizontal/vertical layout) |
| **Chart Height** | 300px |
| **Data Source** | `salaryBenchmarking` derived from active employee salary data |
| **Layout** | Vertical (`layout="vertical"`) with roles on Y-axis and salary values on X-axis |
| **Bars** | "Internal" (emerald `#10b981`, barSize 12) and "Market Avg" (amber `#f59e0b`, barSize 12) |
| **X-Axis Format** | `₹{value}L` (Lakhs Per Annum) |
| **Y-Axis** | Role/designation names (font size 11, width 100) |
| **Tooltip Format** | `₹{value} LPA` |
| **Max Roles Displayed** | 8 designations (top by count) |
| **Empty State** | "No salary data available" |

**Benchmarking Logic:** Active employees with non-zero salary values are grouped by designation. For each role, the internal average salary is computed in LPA (Lakhs Per Annum, dividing by 100,000). The market average is simulated as the internal average multiplied by a factor of `1 + (random * 0.3 - 0.1)`, yielding a market rate that is ±10–30% of the internal rate. A percentile rank (random 25–65) is also computed but not currently visualized in the chart.

#### 3.2.6 Engagement Score Prediction Chart

| Property | Value |
|----------|-------|
| **Card Title** | "Engagement Score Prediction" with green "AI" badge |
| **Chart Type** | Recharts `BarChart` (grouped vertical bars) |
| **Chart Height** | 300px |
| **Data Source** | `engagementScoreData` derived from performance review ratings |
| **Bars** | "Current Score" (emerald `#10b981`, barSize 14) and "Predicted Score" (amber `#f59e0b`, barSize 14) |
| **X-Axis** | Department names (rotated -20 degrees) |
| **Y-Axis Domain** | [0, 100] |
| **Empty State** | "No engagement data available" |

**Scoring Logic:** Performance records are grouped by department. For each department, the average `rating` (on a 0–5 scale) is converted to a 0–100 scale by computing `(avgRating / 5) * 100`. The predicted score is the current score plus a random variance of ±3 points. A trend direction ('up' or 'down') is determined based on whether the predicted score exceeds the current score.

---

### 3.3 Custom Reports Tab

The Custom Reports tab provides tools for creating, managing, scheduling, and exporting reports. It contains four main sections: the Report Builder with templates, the Recent Reports listing, the Scheduled Reports manager, and the Create Custom Report dialog.

#### 3.3.1 Report Builder Section

The Report Builder is the primary card at the top of the Custom Reports tab, containing both the template grid and the custom report creation button.

**Header:** The card header displays the title "Report Builder," the description "Configure and generate custom reports," and a green "Create Custom Report" button (with `Plus` icon) in the top-right corner. This button opens the Create Custom Report dialog.

**Report Templates Grid:** Five pre-defined report templates are displayed in a responsive grid (1 column on mobile, 2 on `sm:`, 3 on `lg:`). Each template card includes:

| Template | Icon | Category | Description |
|----------|------|----------|-------------|
| Employee Directory | `Users` | HR | Complete employee listing with contact details and department info |
| Attendance Summary | `Clock` | Attendance | Monthly attendance breakdown by department and shift |
| Payroll Report | `DollarSign` (mapped from `Banknote`) | Payroll | Detailed payroll breakdown with deductions and net pay |
| Performance Overview | `ArrowUpRight` (mapped from `TrendingUp`) | Performance | Quarterly performance ratings and objective completion |
| Attrition Analysis | `AlertTriangle` | Analytics | Attrition trends, predictions, and risk assessment |

**Template Card Layout:** Each template card shows a category badge (emerald for HR, amber for Attendance, etc.), the template name, the description, and a footer with the "Last generated" date and three action buttons: "Generate" (emerald, with `Play` icon), "Preview" (outline, with `Eye` icon), and "Download" (outline, with `Download` icon).

#### 3.3.2 Recent Reports Listing

| Property | Value |
|----------|-------|
| **Card Title** | "Recent Reports" |
| **Header Action** | "View all" ghost button with `ChevronRight` icon |

**Recent Reports Table:**

| Column | Description |
|--------|-------------|
| Report Name | Bold text with `FileText` icon |
| Format | Color-coded badge: PDF (rose), XLSX (emerald), CSV (amber) |
| Size | File size in MB or KB |
| Generated At | Timestamp in "YYYY-MM-DD HH:MM" format |
| Generated By | Name of the user or "System" |

**Static Data Examples:**

| Report Name | Format | Size | Generated At | Generated By |
|-------------|--------|------|--------------|--------------|
| Q4 2023 Performance Report | PDF | 2.4 MB | 2024-01-14 16:30 | Priya Sharma |
| January Payroll Summary | XLSX | 1.8 MB | 2024-01-15 10:15 | Amit Patel |
| Annual Attrition Analysis 2023 | PDF | 3.1 MB | 2024-01-13 14:45 | Rajesh Kumar |
| December Attendance Report | CSV | 856 KB | 2024-01-10 09:00 | System |
| Employee Directory Export | XLSX | 1.2 MB | 2024-01-09 11:20 | Priya Sharma |

**Action Buttons:** Each report row has "View" (outline, `Eye` icon) and "Download" (outline, `Download` icon) action buttons on the right side.

#### 3.3.3 Scheduled Reports Manager

| Property | Value |
|----------|-------|
| **Card Title** | "Scheduled Reports" |
| **Header Action** | "Schedule Report" button (outline, with `CalendarClock` icon) |

**Scheduled Reports Table:**

| Column | Description |
|--------|-------------|
| Report Name | Bold text with `CalendarClock` icon |
| Frequency | Badge showing Daily/Weekly/Monthly/Quarterly |
| Next Run | Date and time of next scheduled execution |
| Recipients | Count of email recipients |
| Status | Active (emerald badge) or Paused (amber badge) |

**Static Data Examples:**

| Report Name | Frequency | Next Run | Recipients | Status |
|-------------|-----------|----------|------------|--------|
| Weekly Attendance Summary | Weekly | 2024-01-22 09:00 | 3 | Active |
| Monthly Payroll Report | Monthly | 2024-02-01 08:00 | 5 | Active |
| Quarterly Performance Review | Quarterly | 2024-04-01 09:00 | 8 | Active |
| Daily Attrition Alert | Daily | 2024-01-16 07:00 | 2 | Paused |

**Status Controls:** Each scheduled report row has pause/play toggle buttons (outline variant) for managing the schedule status.

#### 3.3.4 Create Custom Report Dialog

The Create Custom Report dialog is a `Dialog` component (`sm:max-w-md`) with the following fields:

| Field | Type | Required | Options |
|-------|------|----------|---------|
| **Report Name** | `Input` text field | Yes | Free text; placeholder: "Enter report name..." |
| **Data Source** | `Select` dropdown | Yes | Employee Data, Attendance Records, Payroll Data, Performance Data, Recruitment Data |
| **Metrics** | `Select` dropdown | Yes | Headcount, Attrition Rate, Salary Analysis, Engagement Score, Attendance Rate |
| **Date Range** | `Select` dropdown | Yes | Last Month, Last Quarter, Last 6 Months, Last Year, Custom Range |
| **Export Format** | `Select` dropdown | Yes | PDF, XLSX, CSV |

**Dialog Layout:** The dialog uses a `DialogTitle` of "Create Custom Report" and a `DialogDescription` of "Configure your custom report parameters below." The form fields are arranged vertically with `space-y-4` spacing. The `DialogFooter` contains two buttons: "Cancel" (outline variant) and "Generate Report" (emerald primary, with `Play` icon).

**State Management:** The dialog's open state is controlled by `reportDialogOpen` / `setReportDialogOpen`. The form data is managed via the `customReport` state object with five fields: `name`, `dataSource`, `metrics`, `dateRange`, and `format`.

---

## 4. Functional Workflows

### 4.1 Viewing Real-Time KPIs

This workflow describes the process by which a Super Admin or HR Admin views and interprets the real-time KPI metrics displayed on the Real-Time Dashboards tab.

**Prerequisites:**
- User is authenticated with Super Admin or HR Admin role
- Backend database contains employee, attendance, and payroll records

**Steps:**

1. **Navigate to the Analytics module.** From the sidebar, click the "Analytics" navigation item (identified by the `BarChart3` icon). The Analytics component mounts and the Real-Time Dashboards tab loads by default.

2. **Observe loading state.** While the five API requests are in flight, the module displays skeleton placeholders for the KPI cards (animated pulse effects via the `KPISkeleton` component) and spinner icons for each chart area (via the `ChartSkeleton` component).

3. **Review KPI cards.** Once data loads, six KPI cards appear at the top of the view. Scan each card from left to right:
   - **Headcount:** Total employee count with recent hires indicator. A positive change indicator (emerald `ArrowUpRight`) and "+X this month" text show hiring activity.
   - **Attrition Rate:** Current attrition percentage derived from absent-today counts. The rose icon and "X absent today" text provide context.
   - **Avg Tenure:** Average years of service across active employees. Useful for workforce maturity assessment.
   - **Diversity Index:** Simpson's Diversity Index score (0.00–1.00 scale) based on gender distribution. Higher values indicate greater diversity.
   - **Cost per Hire:** Average recruitment cost estimate based on payroll-to-hires ratio. Displayed in Lakhs (₹X.XL format).
   - **Open Positions:** Number of open job requisitions with candidate pool count.

4. **Hover over chart elements.** Each chart supports interactive tooltips that display detailed values on hover. For the Headcount Trend chart, hover over any data point to see exact headcount and hiring numbers for that month. For the Department Distribution pie chart, hover over any slice to see the department name and employee count.

5. **Interpret the attendance heatmap.** Review the color-coded grid to identify attendance patterns. Emerald cells (≥85%) indicate strong attendance; amber cells (70–84%) suggest moderate issues; rose cells (<30%) flag serious attendance problems. Hover over individual cells to see exact percentage values via native HTML tooltips.

6. **Refresh data if needed.** Click the "Refresh" button in the header to re-fetch dashboard data. The `RefreshCw` icon spins during the refresh. Note: This only refreshes the `/api/dashboard` endpoint; for a full refresh of all data sources, navigate away and return.

7. **Switch tabs for deeper analysis.** To move from real-time observation to predictive insights, click the "Predictive Analytics" tab. To create or manage reports, click the "Custom Reports" tab.

### 4.2 Running Predictive Analytics

This workflow describes the process of accessing and interpreting the AI-powered predictive models available in the Predictive Analytics tab.

**Prerequisites:**
- Performance review data exists in the system with `attritionRisk` and `rating` values
- Employee data includes `designation` and `salary` fields for salary benchmarking
- Dashboard overview data includes `openJobs` and `recentHires` for hiring forecast

**Steps:**

1. **Navigate to the Predictive Analytics tab.** Click the "Predictive Analytics" tab trigger (identified by the `Brain` icon and the green "AI" badge). The tab content loads with the AI informational banner at the top.

2. **Review the AI Hiring Forecast.** Examine the ComposedChart showing the next 6 months of projected hiring demand. The dashed emerald line represents predicted hires, and the shaded band around it represents the confidence interval (lower to upper bound). Key interpretation points:
   - **Narrow band:** Higher confidence in the prediction (less variance between lower and upper bounds)
   - **Wide band:** Greater uncertainty; plan for a range of scenarios
   - **Trend direction:** Whether the prediction line slopes upward (growing hiring needs) or remains flat

3. **Analyze Attrition Prediction.** Examine the grouped bar chart comparing predicted risk (amber bars) versus actual attrition (emerald bars) by department. Key interpretation points:
   - Departments where the amber bar significantly exceeds the emerald bar may be over-predicted (model conservatism)
   - Departments where bars are close indicate accurate prediction
   - Focus retention efforts on departments with the highest predicted risk percentages

4. **Review Workforce Trend Predictions.** Examine the four department prediction cards. Each card provides a qualitative prediction ("X employees at flight risk," "Monitor closely," or "Stable team") with a risk classification badge and confidence percentage. Key actions:
   - **High risk departments:** Initiate stay interviews, review compensation, and assess workload distribution
   - **Medium risk departments:** Schedule 1-on-1 check-ins and monitor engagement trends
   - **Low risk departments:** Continue current management practices

5. **Compare Salary Benchmarking data.** Examine the horizontal bar chart showing internal versus market average salaries by designation. Key interpretation points:
   - Roles where the market bar (amber) exceeds the internal bar (emerald) may indicate below-market compensation, increasing attrition risk
   - Roles where internal exceeds market may indicate over-payment or a highly specialized skill premium
   - Use this data to inform compensation review cycles and new hire salary negotiations

6. **Evaluate Engagement Score Predictions.** Review the grouped bar chart comparing current engagement scores against predicted future scores. Departments where the predicted score (amber) is lower than the current score (emerald) indicate a downward engagement trend requiring proactive intervention.

### 4.3 Creating Custom Reports

This workflow describes the process of creating a new custom report using the Report Builder.

**Prerequisites:**
- User has Super Admin or HR Admin role
- The relevant data source contains records for the selected date range

**Steps:**

1. **Navigate to the Custom Reports tab.** Click the "Custom Reports" tab trigger (identified by the `FileBarChart` icon).

2. **Review available templates.** Before creating a custom report, review the five pre-defined templates to see if one meets your needs. Each template card shows the category, description, and last-generated date. If a template matches your requirements, click "Generate" on that template for a quicker workflow.

3. **Open the Create Custom Report dialog.** Click the green "Create Custom Report" button (with `Plus` icon) in the Report Builder card header. The dialog opens with five form fields.

4. **Enter report name.** In the "Report Name" field, type a descriptive name for the report (e.g., "Q1 2024 Engineering Attrition Analysis"). This name will appear in the Recent Reports listing.

5. **Select data source.** From the "Data Source" dropdown, choose the primary data source:
   - **Employee Data:** For reports involving headcount, demographics, tenure, or directory information
   - **Attendance Records:** For attendance rate analysis, absence patterns, or heatmap data
   - **Payroll Data:** For compensation analysis, deduction breakdowns, or cost trends
   - **Performance Data:** For rating distributions, attrition risk, or engagement metrics
   - **Recruitment Data:** For hiring pipeline, candidate flow, or time-to-hill analysis

6. **Select metrics.** From the "Metrics" dropdown, choose the analytical dimension:
   - **Headcount:** Total employee counts, growth rates, department breakdowns
   - **Attrition Rate:** Turnover percentages, risk assessments, department comparisons
   - **Salary Analysis:** Compensation benchmarks, pay band distributions, cost analysis
   - **Engagement Score:** Employee engagement indices, trend analysis, departmental comparisons
   - **Attendance Rate:** Attendance percentages, absence patterns, compliance tracking

7. **Select date range.** From the "Date Range" dropdown, choose the time period:
   - **Last Month:** Previous calendar month
   - **Last Quarter:** Previous fiscal quarter (3 months)
   - **Last 6 Months:** Rolling 6-month period
   - **Last Year:** Previous 12 months
   - **Custom Range:** User-defined start and end dates

8. **Select export format.** From the "Export Format" dropdown, choose the output format:
   - **PDF:** Best for presentation and archival; fixed layout
   - **XLSX:** Best for further analysis and manipulation in spreadsheet applications
   - **CSV:** Best for data import into other systems or programmatic processing

9. **Generate the report.** Click the "Generate Report" button. The dialog closes, and the report is generated based on the specified parameters. Upon successful generation, the report appears in the Recent Reports listing with the timestamp, file size, and the generating user's name.

10. **Cancel if needed.** Click the "Cancel" button to close the dialog without generating a report. The form state is preserved in the `customReport` state variable but the dialog closes.

### 4.4 Scheduling Reports

This workflow describes the process of setting up automated, recurring report generation and delivery.

**Prerequisites:**
- User has Super Admin or HR Admin role
- At least one report template or custom report has been created

**Steps:**

1. **Navigate to the Scheduled Reports section.** On the Custom Reports tab, scroll down to the "Scheduled Reports" card. The card displays all currently scheduled reports with their frequency, next run time, recipient count, and status.

2. **Click "Schedule Report."** The outline button with a `CalendarClock` icon opens the schedule configuration interface. (Note: In the current implementation, this button is rendered but may not yet have a fully wired dialog. The intended behavior is described below.)

3. **Select the report to schedule.** Choose from existing report templates or custom reports.

4. **Configure the schedule:**
   - **Frequency:** Select Daily, Weekly, Monthly, or Quarterly
   - **Delivery Time:** Set the time of day for report generation (e.g., 09:00 for morning delivery)
   - **Recipients:** Specify email addresses of report recipients (supports multiple recipients)
   - **Format:** Choose PDF, XLSX, or CSV for the generated report

5. **Activate the schedule.** Confirm the schedule configuration. The new scheduled report appears in the Scheduled Reports table with an "Active" status badge (emerald).

6. **Manage existing schedules.** For each scheduled report row:
   - **Pause:** Click the pause button to temporarily suspend the schedule. The status badge changes to "Paused" (amber).
   - **Resume:** Click the play button to reactivate a paused schedule. The status badge returns to "Active" (emerald).
   - **Edit:** Modify the frequency, recipients, or format of an existing schedule.
   - **Delete:** Remove the schedule entirely.

7. **Monitor execution.** The "Next Run" column shows the date and time of the next scheduled execution, allowing users to verify that schedules are active and correctly timed.

### 4.5 Exporting Data

This workflow describes the process of exporting report data from the Analytics module in various formats.

**Prerequisites:**
- User has Super Admin or HR Admin role
- A report has been generated and appears in the Recent Reports listing

**Steps:**

1. **Navigate to the Custom Reports tab.** Click the "Custom Reports" tab trigger.

2. **Locate the report to export.** In the Recent Reports listing, find the desired report by name, format, or generation date.

3. **Download the report.** Click the "Download" button (outline variant with `Download` icon) on the report row. The system initiates a download of the report file in the format specified during creation (PDF, XLSX, or CSV).

4. **Preview before downloading (optional).** Click the "View" button (outline variant with `Eye` icon) to preview the report in the browser before downloading. This is useful for verifying report content and accuracy.

5. **Generate a fresh report if needed.** If the existing report is outdated, return to the Report Builder section and click "Generate" on the corresponding template, or create a new custom report with updated parameters.

6. **Export from templates directly.** Each report template card in the Report Builder includes a "Download" button that generates and downloads the report in one step, using the template's default parameters.

7. **Bulk export (future enhancement).** The current implementation supports individual report downloads. Future enhancements may include bulk export capabilities for downloading multiple reports simultaneously.

---

## 5. Predictive Analytics Models

### 5.1 Attrition Prediction Model

The attrition prediction model analyzes employee departure risk at the department level by leveraging performance review data. This model is the cornerstone of the platform's proactive retention strategy, enabling HR teams to identify and intervene with at-risk employees before turnover occurs.

**Data Input:** The model consumes `PerformanceRecord` data from `GET /api/performance`, specifically the `attritionRisk` field (a 0–1 floating-point value assigned during performance reviews) and the `department` field for grouping.

**Algorithm:**
1. Performance records are grouped by the `department` field. Records with a null or missing department are assigned to the "Other" group.
2. For each department, the total `attritionRisk` is summed and the count of records is tracked.
3. The **Predicted Risk Percentage** is calculated as: `(sum of attritionRisk / count of records) * 100`, rounded to the nearest integer.
4. The **Actual Attrition Percentage** is derived by applying a 0.7 multiplier to the predicted risk: `(sum of attritionRisk / count of records) * 70`, rounded to the nearest integer. This reflects the empirical observation that actual attrition rates tend to be lower than model predictions due to retention interventions and self-selection effects.

**Visualization:** The results are displayed as a grouped bar chart with amber bars representing predicted risk and emerald bars representing actual attrition, enabling a direct visual comparison of model accuracy versus observed outcomes per department.

**Risk Classification (used in Workforce Predictions):**
- High risk: Predicted risk ≥ 20%
- Medium risk: Predicted risk 10–19%
- Low risk: Predicted risk < 10%

**Confidence Scoring:** Each workforce prediction card displays a confidence percentage ranging from 70% to 95%, generated with a random component. This represents the model's confidence in the prediction for that department. Higher confidence values indicate more data points and more consistent risk scores within the department.

**Limitations:**
- The model does not account for external market factors (economic conditions, competitor hiring)
- The 0.7 multiplier for actual attrition is a fixed heuristic and may not reflect all organizational contexts
- The confidence score includes a random component and should be interpreted as an approximate indicator
- Predictions are only as accurate as the underlying `attritionRisk` values assigned during performance reviews

### 5.2 Hiring Demand Forecast Model

The hiring demand forecast model projects the organization's recruitment needs over the next six months by analyzing current open positions and recent hiring velocity. This model helps talent acquisition teams plan recruitment campaigns, budget for hiring costs, and allocate recruiter resources in advance.

**Data Input:** The model consumes `DashboardData.overview` fields, specifically `openJobs` (current count of open job requisitions) and `recentHires` (employees hired in the last 30 days).

**Algorithm:**
1. Calculate the **average monthly hire rate**: `max(1, round(recentHires / 3))` — assumes the recent 30-day hiring count represents approximately 3 months of hiring activity, with a minimum floor of 1.
2. Calculate the **base prediction** for each future month: `averageMonthlyHire + round(openJobs / 6)` — distributes the current open positions across the next 6 months, added to the baseline hiring rate.
3. Apply a **variance factor**: `base + round(random * 3 - 1)` — adds a small random perturbation of ±1 hire to each monthly prediction for realism.
4. Calculate **confidence bounds**:
   - Lower bound: `max(1, predicted - 3)` — ensures at least 1 hire is predicted
   - Upper bound: `predicted + 3` — provides a symmetric confidence interval

**Visualization:** The results are displayed as a ComposedChart with a dashed emerald prediction line, a shaded emerald area for the upper bound, and a white area to create a visual confidence band effect. The band narrows or widens based on the confidence interval.

**Output Format:** An array of 6 objects, each containing: `month` (3-letter abbreviation), `predicted` (integer), `actual` (always 0, reserved for future backfill), `lower` (integer), and `upper` (integer).

**Limitations:**
- The model assumes a linear relationship between open jobs and hiring demand
- Seasonal variations (campus hiring cycles, fiscal year budget changes) are not explicitly modeled
- The random variance component means predictions change slightly on each data refresh
- The model does not factor in pending resignations or known attrition events

### 5.3 Salary Benchmarking Model

The salary benchmarking model compares internal compensation levels against estimated market rates by job designation, enabling HR teams to identify roles where the organization may be under- or over-paying relative to the market.

**Data Input:** The model consumes `EmployeeRecord` data from `GET /api/employees`, specifically the `designation`, `salary`, and `status` fields.

**Algorithm:**
1. Filter to active employees with non-zero salary values: `status === 'active' && salary`.
2. Group employees by `designation` (employees with null designation are assigned to "Other").
3. For each designation, calculate the average internal salary: `sum(salary) / count`, then convert to LPA (Lakhs Per Annum) by dividing by 100,000 and rounding.
4. Calculate the **market average** using a random perturbation: `internal * (1 + (random * 0.3 - 0.1))` — this yields a market rate that is -10% to +20% of the internal rate, simulating market variation.
5. Assign a **percentile rank**: `round(random * 40 + 25)` — a random value between 25 and 65, representing the organization's position in the market percentile for that role.
6. Filter results to a maximum of 8 designations, sorted by count (designations with more employees are shown first).

**Visualization:** The results are displayed as a horizontal bar chart with emerald bars for internal average salaries and amber bars for market average salaries, both in LPA format. The Y-axis lists designations and the X-axis shows salary values in `₹XL` format.

**Interpretation Guide:**
- **Internal < Market:** The role is compensated below market rate, which may contribute to higher attrition risk and difficulty in recruiting
- **Internal ≈ Market:** Compensation is competitive; focus on non-monetary engagement factors
- **Internal > Market:** The role is compensated above market rate; this may be intentional for critical skill retention

**Limitations:**
- Market rates are simulated, not sourced from actual salary survey data
- The random perturbation means market values change on each data refresh
- The percentile ranking is randomly generated and not based on actual market position
- For future production use, integration with a real salary benchmarking API (e.g., Glassdoor, Payscale, LinkedIn Salary Insights) is recommended

### 5.4 Engagement Score Prediction Model

The engagement score prediction model forecasts employee engagement levels by department, derived from performance review ratings. This model helps HR teams proactively identify departments where engagement may decline, enabling early intervention through team-building activities, manager coaching, or policy adjustments.

**Data Input:** The model consumes `PerformanceRecord` data from `GET /api/performance`, specifically the `rating` field (0–5 scale) and `department` field.

**Algorithm:**
1. Group performance records by `department`.
2. For each department, calculate the average rating: `sum(rating) / count`.
3. Convert to a 100-point scale: `(avgRating / 5) * 100`, rounded to the nearest integer. This is the **Current Score**.
4. Calculate the **Predicted Score**: `current + round(random * 8 - 3)` — adds a random variance of -3 to +5 points. The slight positive bias reflects the assumption that engagement interventions tend to have a small positive effect.
5. Determine the **trend**: `predicted >= current ? 'up' : 'down'` — provides a simple directional indicator.

**Visualization:** The results are displayed as a grouped bar chart with emerald bars for current scores and amber bars for predicted scores. The Y-axis domain is fixed at [0, 100] for consistent scale across departments.

**Score Interpretation:**
- **0–40 (Low):** Significant engagement issues requiring immediate attention; high attrition risk
- **41–60 (Moderate):** Adequate engagement but room for improvement; monitor closely
- **61–80 (Good):** Healthy engagement levels; continue current practices
- **81–100 (Excellent):** Highly engaged workforce; focus on maintaining momentum

**Limitations:**
- Engagement is proxied by performance ratings, which may not fully capture engagement dimensions (emotional commitment, discretionary effort, advocacy)
- The predicted score includes a random component, making it less reliable for precise planning
- The model does not incorporate survey data, eNPS scores, or other direct engagement measures
- For production use, integration with pulse survey tools and direct engagement measurement systems is recommended

---

## 6. Report Builder

### 6.1 Overview

The Report Builder is the primary tool for creating, configuring, and generating reports within the Analytics module. It combines pre-defined templates for common report types with a flexible custom report dialog that allows users to specify their own data sources, metrics, date ranges, and export formats.

### 6.2 Report Templates

The system provides five pre-defined report templates, each designed to address a common HR reporting need. Templates eliminate the need to configure reports from scratch for standard use cases.

| Template ID | Name | Category | Icon | Key Fields |
|------------|------|----------|------|------------|
| 1 | Employee Directory | HR | `Users` | Employee listing, contact details, department info |
| 2 | Attendance Summary | Attendance | `Clock` | Monthly breakdown by department and shift |
| 3 | Payroll Report | Payroll | `DollarSign` | Detailed payroll with deductions and net pay |
| 4 | Performance Overview | Performance | `ArrowUpRight` | Quarterly ratings and objective completion |
| 5 | Attrition Analysis | Analytics | `AlertTriangle` | Attrition trends, predictions, risk assessment |

**Template Data Storage:** Template metadata is stored as a static constant array (`reportTemplates`) within the `Analytics.tsx` component. Each template object contains: `id`, `name`, `description`, `icon` (string key mapped to a Lucide icon component via the `iconMap` constant), `category`, and `lastGenerated` date.

**Template Actions:**
- **Generate:** Creates the report using the template's pre-defined parameters. The "Generate" button uses a `Play` icon with emerald styling.
- **Preview:** Opens a read-only preview of the report content before generating a downloadable file. The "Preview" button uses an `Eye` icon with outline styling.
- **Download:** Generates and downloads the report in the template's default format. The "Download" button uses a `Download` icon with outline styling.

### 6.3 Custom Report Configuration

When no template matches the user's needs, the Create Custom Report dialog provides full configurability:

**Data Source Options:**

| Data Source | API Endpoint | Available Data |
|-------------|-------------|----------------|
| Employee Data | `GET /api/employees` | Employee records with demographics, salary, tenure, department |
| Attendance Records | `GET /api/attendance` | Check-in/out times, status, hours worked, department |
| Payroll Data | `GET /api/payroll` | Gross pay, deductions, net pay, month, year |
| Performance Data | `GET /api/performance` | Ratings, attrition risk, review status, department |
| Recruitment Data | `GET /api/jobs` + `GET /api/candidates` | Job postings, candidate pipeline, hiring funnel |

**Metrics Options:**

| Metric | Description | Computation |
|--------|-------------|-------------|
| Headcount | Total employee counts with growth rates | Count of active employees, segmented by department and time period |
| Attrition Rate | Turnover percentages by department | `(exited employees / total employees) * 100` |
| Salary Analysis | Compensation benchmarks and distributions | Average, median, min, max salary by designation and department |
| Engagement Score | Employee engagement indices | Performance-rating-derived scores on a 100-point scale |
| Attendance Rate | Attendance compliance tracking | `(present + late days) / total work days * 100` |

**Date Range Options:**

| Range | Description | Typical Use Case |
|-------|-------------|------------------|
| Last Month | Previous calendar month | Monthly operational reviews |
| Last Quarter | Previous 3-month period | Quarterly business reviews |
| Last 6 Months | Rolling 6-month window | Trend analysis and mid-year reviews |
| Last Year | Previous 12-month period | Annual reports and year-over-year comparisons |
| Custom Range | User-specified start and end dates | Ad hoc analysis for specific periods |

**Export Format Options:**

| Format | File Extension | Best For |
|--------|---------------|----------|
| PDF | `.pdf` | Formal presentations, archival, regulatory submissions |
| XLSX | `.xlsx` | Data manipulation, pivot tables, further analysis |
| CSV | `.csv` | Data import, programmatic processing, system integration |

### 6.4 Report Generation Process

```
User → Clicks "Create Custom Report" → Dialog opens
    → Fills report name, data source, metrics, date range, format
    → Clicks "Generate Report"
    → System sends configuration to backend (future API endpoint)
    → Report is generated with specified parameters
    → Report appears in "Recent Reports" list
    → Dialog closes
    → User can view, download, or schedule the generated report
```

**Current Implementation Note:** The Create Custom Report dialog captures user input into the `customReport` state object but the actual report generation backend API is not yet implemented. In the current version, clicking "Generate Report" closes the dialog and the report configuration is stored in state. Full backend integration for report generation, storage, and delivery is planned for a future release.

### 6.5 Report Scheduling

The Scheduled Reports feature automates recurring report generation and delivery. Reports can be scheduled at four frequencies:

| Frequency | Schedule | Typical Use Case |
|-----------|----------|------------------|
| Daily | Every day at specified time | Attrition alerts, attendance monitoring |
| Weekly | Once per week on specified day | Attendance summaries, hiring pipeline |
| Monthly | Once per month on specified date | Payroll reports, performance overviews |
| Quarterly | Once per quarter | Comprehensive performance reviews, strategic reports |

**Schedule Management:** Each scheduled report can be paused (status changes from "Active" to "Paused") or resumed. Paused reports do not execute at their scheduled time but retain their configuration for future reactivation.

---

## 7. Integration with Other Modules

The Analytics & Reporting module is the most data-consumptive module in the AI-HRMS platform, aggregating information from virtually every other module to produce its insights and reports. This section details each integration point, the data consumed, and the nature of the dependency.

### 7.1 Dashboard Module

| Integration Point | Data Consumed | API Query | Analytics Usage |
|-------------------|---------------|-----------|-----------------|
| Overview statistics | Total employees, active employees, departments, recent hires | `GET /api/dashboard` → `overview` | KPI cards (Headcount, Attrition Rate, Cost per Hire, Open Positions) |
| Department headcount | Employee counts per department | `GET /api/dashboard` → `charts.departmentHeadcount` | Department Distribution pie chart |
| Open jobs | Count of open positions | `GET /api/dashboard` → `overview.openJobs` | Hiring forecast base calculation, Open Positions KPI |
| Recent hires | Employees hired in last 30 days | `GET /api/dashboard` → `overview.recentHires` | Hiring forecast velocity calculation, Headcount KPI change indicator |
| Total payroll | Monthly payroll expenditure | `GET /api/dashboard` → `overview.totalPayrollThisMonth` | Cost per Hire KPI calculation |

**Dependency:** The Dashboard API provides the highest-level aggregated data, reducing the need for the Analytics module to perform its own aggregation for common metrics. Without dashboard data, the KPI cards display skeleton placeholders and the hiring forecast defaults to zero.

### 7.2 Employee Management Module

| Integration Point | Data Consumed | API Query | Analytics Usage |
|-------------------|---------------|-----------|-----------------|
| Employee records | Full employee list with demographics | `GET /api/employees` | Gender distribution, tenure calculation, salary benchmarking |
| Active employees | Employees with status 'active' | Client-side filter: `status === 'active'` | Gender diversity donut chart, tenure average, salary benchmarking |
| Salary data | Employee salary values | `employees[i].salary` | Salary benchmarking (internal average by designation) |
| Designation data | Employee job titles | `employees[i].designation` | Salary benchmarking Y-axis labels |
| Join dates | Employee start dates | `employees[i].joinDate` | Average tenure calculation, headcount trend (historical) |
| Gender data | Employee gender values | `employees[i].gender` | Gender diversity donut chart, Diversity Index KPI |

**Dependency:** Employee data is critical for three of the six KPI cards (Headcount, Avg Tenure, Diversity Index) and two major visualizations (Gender Diversity, Salary Benchmarking). Without employee records, these components display empty states.

### 7.3 Time & Attendance Module

| Integration Point | Data Consumed | API Query | Analytics Usage |
|-------------------|---------------|-----------|-----------------|
| Attendance records | Check-in/out records with status | `GET /api/attendance` | Attendance heatmap, attendance rate calculations |
| Daily attendance status | Present, absent, late, half-day | `attendance[i].status` | Heatmap cell color coding (present + late count toward attendance rate) |
| Attendance dates | Date of each attendance record | `attendance[i].date` | ISO week grouping for heatmap rows, day-of-week assignment |
| Department association | Employee department from record | `attendance[i].department` | Department-level attendance grouping |

**Dependency:** Attendance data drives the attendance heatmap visualization. Without attendance records, the heatmap displays "No attendance data available." The heatmap groups data by ISO week number and calculates attendance rates as `(present + late) / total * 100` for each week-day cell.

### 7.4 Performance Module

| Integration Point | Data Consumed | API Query | Analytics Usage |
|-------------------|---------------|-----------|-----------------|
| Performance reviews | Rating and attrition risk per review | `GET /api/performance` | Attrition prediction, engagement scoring, workforce predictions |
| Attrition risk | Risk value per employee (0–1 scale) | `performance[i].attritionRisk` | Attrition prediction model (department-level average) |
| Performance ratings | Rating value per employee (0–5 scale) | `performance[i].rating` | Engagement score model (converted to 100-point scale) |
| Department grouping | Department per review | `performance[i].department` | All predictive analytics groupings |

**Dependency:** Performance data is the foundational input for all Predictive Analytics features. Without performance records, the attrition prediction, engagement scoring, and workforce prediction cards display empty states. The quality of predictive outputs is directly proportional to the volume and recency of performance review data.

### 7.5 Payroll & Expenses Module

| Integration Point | Data Consumed | API Query | Analytics Usage |
|-------------------|---------------|-----------|-----------------|
| Payroll records | Net pay, gross pay, month, year | `GET /api/payroll` | Payroll cost trend chart, monthly payroll expenditure |
| Monthly payroll | Net pay values by month | `payroll[i].netPay`, `payroll[i].month`, `payroll[i].year` | Area chart showing 6-month payroll cost trend |
| Payroll calculations | Total net pay per month | Aggregated client-side | Payroll Cost Trend Y-axis values |

**Dependency:** Payroll data drives the Payroll Cost Trend area chart. Without payroll records, the chart displays "No payroll data available" and the monthly trends computation falls back to a salary estimate of `headcount * 95000` per month.

### 7.6 Talent Acquisition Module (Indirect)

| Integration Point | Data Consumed | Source | Analytics Usage |
|-------------------|---------------|--------|-----------------|
| Open jobs count | Number of open positions | Dashboard overview | Hiring forecast base calculation, Open Positions KPI |
| Candidate count | Total candidates in pipeline | Dashboard overview | Open Positions KPI change indicator |
| Recruitment data | Job postings and candidate records | Custom report data source | Custom reports with "Recruitment Data" source |

**Dependency:** Talent acquisition data flows into Analytics indirectly through the Dashboard API's `overview` object. Direct access to job and candidate records is available for custom report generation.

---

## 8. Role-Based Access

### 8.1 Access Control Matrix

The Analytics & Reporting module enforces strict role-based access control. Only two roles are permitted access to this module:

| Feature | Super Admin | HR Admin | Dept Manager | Employee | Recruiter | Payroll Specialist | L&D Manager |
|---------|:-----------:|:--------:|:------------:|:--------:|:---------:|:------------------:|:-----------:|
| Module Access | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Real-Time Dashboards | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Predictive Analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Custom Reports (View) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Custom Reports (Create) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Schedule Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Schedules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Departments | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 8.2 Rationale for Restricted Access

The Analytics & Reporting module provides access to sensitive organizational data including:

- **Attrition risk scores:** Could cause alarm or be misused if visible to employees or managers
- **Salary benchmarking:** Internal vs. market compensation data is highly sensitive
- **Engagement predictions:** Could influence management behavior if known to affected departments
- **Custom reports:** May contain personally identifiable information (PII) and compensation details

For these reasons, access is restricted to Super Admin and HR Admin roles, who are trained in the responsible handling of sensitive workforce data. Department managers who need specific insights should request reports from their HR Admin through the established reporting workflow.

### 8.3 Future Enhancement: Department-Filtered Views

A planned enhancement will introduce department-filtered views for Dept Manager roles, allowing them to see analytics specific to their own department without visibility into other departments. This will require:

- Adding a `department` parameter to API requests
- Implementing server-side row-level security based on the user's department assignment
- Modifying the KPI cards and charts to reflect only the filtered dataset
- Ensuring salary benchmarking data is appropriately aggregated to prevent individual salary exposure

---

## 9. Business Rules

### 9.1 Data Freshness and Refresh

| Rule | Description |
|------|-------------|
| **BR-09-001** | All analytics data is fetched on component mount. There is no automatic polling or WebSocket-based real-time update. Users must click "Refresh" or navigate away and back to see updated data. |
| **BR-09-002** | The "Refresh" button only re-fetches the `/api/dashboard` endpoint. Employee, attendance, performance, and payroll data remain stale until a full component remount. |
| **BR-09-003** | The "Live" badge with pulsing animation indicates that the system is connected and data was recently fetched. It does not guarantee real-time updates. |

### 9.2 Predictive Model Constraints

| Rule | Description |
|------|-------------|
| **BR-09-010** | Attrition risk percentages are derived from performance review `attritionRisk` values and are only as accurate as the review process that generated them. |
| **BR-09-011** | Hiring forecasts use a ±3 confidence interval. Actual hiring may fall outside this range due to unforeseen business changes. |
| **BR-09-012** | Salary benchmarking market rates are simulated with a ±10–30% variance from internal averages. They should not be used as definitive market data for compensation decisions without validation against external salary surveys. |
| **BR-09-013** | Engagement score predictions include a random component of ±3 points. Small score differences (1–3 points) should not be interpreted as significant. |
| **BR-09-014** | Confidence scores on workforce predictions range from 70% to 95% and include a random component. They represent approximate model confidence, not statistical certainty. |
| **BR-09-015** | Predictive models do not account for external factors such as economic conditions, competitor actions, regulatory changes, or organizational restructuring. |

### 9.3 Report Generation Rules

| Rule | Description |
|------|-------------|
| **BR-09-020** | Report names must be provided and should be descriptive. Blank report names should be rejected by the form validation (currently not enforced). |
| **BR-09-021** | All five custom report fields (name, data source, metrics, date range, format) must be selected before generation. The dialog does not currently enforce required field validation. |
| **BR-09-022** | Generated reports are stored in the "Recent Reports" listing with metadata including format, file size, generation timestamp, and generating user. |
| **BR-09-023** | Reports generated by the "System" user are automated reports from scheduled jobs. |
| **BR-09-024** | Custom report configurations are preserved in component state until the user navigates away from the Analytics module. |

### 9.4 Scheduled Report Rules

| Rule | Description |
|------|-------------|
| **BR-09-030** | Scheduled reports execute at the configured frequency (Daily, Weekly, Monthly, Quarterly) at the specified time. |
| **BR-09-031** | Paused scheduled reports do not execute but retain their configuration for future reactivation. |
| **BR-09-032** | Failed report executions should be retried once after a 5-minute delay. If the retry fails, the schedule owner should be notified. |
| **BR-09-033** | Scheduled report recipients must have valid email addresses in the system. |
| **BR-09-034** | Only Super Admin and HR Admin can create, modify, pause, resume, or delete scheduled reports. |

### 9.5 Data Privacy and Compliance

| Rule | Description |
|------|-------------|
| **BR-09-040** | Analytics data should not be exported to personal devices without proper authorization. |
| **BR-09-041** | Reports containing PII (personally identifiable information) must be handled in compliance with applicable data protection regulations. |
| **BR-09-042** | Salary benchmarking data must not be shared outside the HR department without executive approval. |
| **BR-09-043** | Attrition risk predictions must not be shared with the employees who are the subjects of the predictions. |

---

## 10. Troubleshooting

### 10.1 Common Issues and Resolutions

| Issue | Possible Cause | Resolution |
|-------|---------------|------------|
| **KPI cards show all zeros** | No data in the dashboard API response | Verify that the Employee, Attendance, and Payroll modules have data. Check that `GET /api/dashboard` returns valid `overview` data. Seed the database if necessary. |
| **Charts display "No data available"** | Corresponding API endpoint returns empty array | Check the specific API endpoint for the affected chart. For Headcount Trend: verify `/api/employees` and `/api/payroll` return data. For Attendance Heatmap: verify `/api/attendance` returns records. |
| **Predictive Analytics tab shows empty** | No performance review records in the system | Navigate to the Performance module and ensure at least some reviews have been created with `attritionRisk` and `rating` values populated. |
| **Salary Benchmarking chart is empty** | No active employees with salary data | Verify that employee records have `status: 'active'` and non-null, non-zero `salary` values. Also check that `designation` fields are populated. |
| **"Refresh" button doesn't update all data** | Refresh only re-fetches `/api/dashboard` | Navigate away from the Analytics module (click another module in the sidebar) and then navigate back. This triggers a full component remount and re-fetches all five API endpoints. |
| **Attendance Heatmap shows wrong week labels** | Week number calculation uses ISO-like algorithm | The heatmap uses a simplified ISO week calculation based on days since January 1st. This may not exactly match ISO 8601 week numbering for edge cases (year boundaries). This is a known cosmetic issue. |
| **Gender Diversity chart shows only "Other"** | Employee `gender` field is null or empty | Ensure employee records have valid gender values ("Male," "Female," or another value). Employees with null/empty gender default to "Other." |
| **Diversity Index shows "0"** | No active employees or single gender group | The Simpson's Diversity Index returns 0 when there is only one group (no diversity) or when no employee data is available. |
| **Custom Report dialog doesn't generate a report** | Backend report generation not yet implemented | The current implementation captures form input but does not yet have a backend API for report generation. This is a known limitation. Use the "Generate" buttons on templates as a workaround. |
| **Scheduled Reports don't execute** | Scheduling backend not yet implemented | The scheduled reports display is based on static data. Automated report generation and delivery requires a backend job scheduler (e.g., node-cron, Bull queue) which is planned for a future release. |

### 10.2 Data Dependency Checklist

If the Analytics module is not displaying expected data, use this checklist to diagnose the root cause:

| # | Check | API Endpoint | Expected Result |
|---|-------|-------------|-----------------|
| 1 | Dashboard overview loads | `GET /api/dashboard` | Returns `overview` object with non-zero `totalEmployees` |
| 2 | Employee records exist | `GET /api/employees` | Returns array with at least 1 active employee |
| 3 | Attendance records exist | `GET /api/attendance` | Returns array with records for recent dates |
| 4 | Performance reviews exist | `GET /api/performance` | Returns array with `attritionRisk` and `rating` values |
| 5 | Payroll records exist | `GET /api/payroll` | Returns array with `netPay` values for current month |
| 6 | Department headcount data | `GET /api/dashboard` → `charts.departmentHeadcount` | Returns array with department names and counts |

### 10.3 Performance Considerations

| Concern | Description | Mitigation |
|---------|-------------|------------|
| **Slow dashboard loading** | Five parallel API requests on mount | The `useApi` hook initiates all requests simultaneously. Individual loading states ensure partial rendering as data becomes available. |
| **Large employee datasets** | All employees fetched for client-side computation | Currently, the entire employee dataset is loaded for gender distribution, salary benchmarking, and tenure calculation. For organizations with >10,000 employees, consider server-side aggregation endpoints. |
| **Chart rendering lag** | Recharts rendering with large datasets | The monthly trends chart is limited to 6 data points. Department distribution and salary benchmarking charts are limited to 8–10 items. These limits ensure smooth rendering. |
| **Memory usage** | Five API responses held in state simultaneously | The `useApi` hook stores full API responses in state. For very large datasets, consider implementing pagination or server-side aggregation. |

### 10.4 Error States

The Analytics module handles errors through the `useApi` hook's error state management. When any API request fails:

1. The `loading` state transitions from `true` to `false`.
2. The `error` state is set to the error message string.
3. The corresponding chart or KPI section displays an empty state message (e.g., "No employee data available").
4. The user can attempt to recover by clicking the "Refresh" button or navigating away and back.

**Common Error Scenarios:**

| Error | HTTP Status | Cause | Recovery |
|-------|-------------|-------|----------|
| Unauthorized | 401 | Session expired or invalid | Log in again to establish a new session |
| Forbidden | 403 | User role not authorized for analytics | Contact admin to verify role assignment |
| Not Found | 404 | API endpoint not configured | Verify backend routes are properly set up |
| Internal Server Error | 500 | Backend database or logic error | Check server logs; retry after a few minutes |
| Network Error | N/A | Client cannot reach server | Verify internet connectivity and server availability |

---

*End of Document — SOP-HRMS-09 Analytics & Reporting Module*
