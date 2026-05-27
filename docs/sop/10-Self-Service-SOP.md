# Standard Operating Procedure — Employee Self-Service Module

**AI-HRMS Application**

| Field | Value |
|-------|-------|
| **Document ID** | SOP-HRMS-SELF-010 |
| **Module Key** | `selfservice` |
| **Component** | `src/components/hrms/SelfService.tsx` |
| **API Endpoints** | `GET/POST /api/policies`, `GET /api/leaves`, `GET /api/payroll`, `GET /api/documents`, `GET /api/assets`, `POST /api/ai-chat` |
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
5. [AI Assistant Features](#5-ai-assistant-features)
6. [Policy Management](#6-policy-management)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Role-Based Views](#8-role-based-views)
9. [Business Rules](#9-business-rules)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Employee Self-Service module is the primary interface through which individual employees interact with the AI-HRMS platform on a day-to-day basis. Its core purpose is to empower employees by providing a single, unified portal where they can access their personal information, employment records, leave balances, payslips, documents, and company-issued assets—without needing to contact HR or administrative staff for routine inquiries. The module significantly reduces the administrative burden on the HR department by enabling employees to independently view and, where permitted, edit their profile details, download payslips, browse company policies, and get instant answers to HR-related questions through the integrated AI Assistant.

Beyond self-service data access, the module also serves as a gateway to action. Quick Action buttons on the welcome banner provide one-click shortcuts to common tasks such as applying for leave, viewing payslips, submitting expense claims, updating profile information, browsing company policies, and accessing the training portal. The module's AI Assistant—powered by the z-ai-web-dev-sdk—provides a conversational interface that can answer a wide range of HR queries in real time, from leave balance checks and policy clarifications to payroll and expense guidance, further reducing the need for employees to escalate questions to HR personnel.

### 1.2 Scope

The Employee Self-Service module encompasses the following functional areas:

- **Welcome Banner**: A personalized greeting displaying the employee's name, avatar, today's date, total leave balance, and count of pending tasks (e.g., pending leave requests), all rendered against a gradient background with glassmorphism stat cards.
- **Quick Actions Grid**: Six shortcut buttons—Apply Leave, View Payslip, Submit Expense, Update Profile, Company Policies, and Training Portal—arranged in a responsive 2/3/6-column grid with color-coded icons.
- **My Profile Tab**: A two-column card-based layout containing Personal Information (name, employee ID, email, phone, location, join date, status), Employment Details (designation, department, job title, contract type, manager, work mode), Leave Balances (progress bars per leave type), Recent Payslips (downloadable list), My Documents (uploaded document list), and My Assets (assigned asset inventory).
- **Company Policies Tab**: A searchable, filterable, expandable list of company policy documents organized by category with real-time client-side filtering.
- **AI Assistant Tab**: A conversational chat interface with suggested queries, conversation history (last 10 messages), markdown rendering for AI responses, and a typing indicator during response generation.

Out of scope: The Self-Service module does not provide write access to leave applications, expense submissions, or payroll modifications. Those operations are handled by their respective dedicated modules (Time & Attendance, Payroll & Expenses). The Self-Service module is primarily a read-only aggregation layer with limited profile editing capabilities.

### 1.3 Target Users

The Self-Service module is designed primarily for regular employees but is accessible to all authenticated users regardless of role. The data displayed is scoped to the currently logged-in employee, ensuring that each user sees only their own information.

| Role | Level | Self-Service Interaction |
|------|-------|--------------------------|
| **Super Admin** | 0 | Full access to own profile; can view all policies and use AI Assistant. May also access admin-level modules. |
| **HR Admin** | 1 | Full access to own profile; primarily uses admin modules but can view own self-service data. |
| **Payroll Specialist** | 2 | Full access to own profile; focus on payslip and payroll data within self-service. |
| **Dept Manager** | 3 | Full access to own profile; can view own leave balances, payslips, and use AI Assistant for team-related policy queries. |
| **Employee** | 6 | Primary target user. Uses all self-service features: profile, leave balances, payslips, documents, assets, policies, and AI Assistant. |
| **Recruiter** | 4 | Full access to own profile; may use AI Assistant for policy clarifications. |
| **L&D Manager** | 5 | Full access to own profile; may use Training Portal quick action and AI Assistant for L&D-related queries. |

---

## 2. Access & Navigation

### 2.1 Accessing the Self-Service Module

The Self-Service module is accessible via the sidebar navigation in the AI-HRMS application. Unlike the Dashboard module, which is the default landing page, the Self-Service module must be explicitly navigated to by the user. The sidebar displays a navigation item labeled "Self Service" (or an appropriate icon) that, when clicked, sets the `activeModule` state in the Zustand global store to `'selfservice'`, causing the main page component to render the `SelfService` component.

**Desktop Navigation Steps:**

1. Locate the sidebar on the left side of the screen. On desktop viewports (≥768px), the sidebar is persistently visible with the AI-HRMS logo at the top, a "Search modules..." input field, and a list of navigation items.
2. Identify the **Self Service** navigation item in the sidebar list, represented by the appropriate icon (e.g., `UserCircle` or similar).
3. Click the **Self Service** navigation item. The `setActiveModule('selfservice')` function is called on the Zustand store, updating the `activeModule` state.
4. The main `page.tsx` component detects the state change and renders the `SelfService` component in place of the previously active module.
5. The SelfService component mounts and triggers five parallel API calls to fetch policies, leaves, payroll, documents, and assets data.

**Mobile Navigation Steps:**

1. Tap the hamburger menu icon (three horizontal lines) located at the top-left corner of the screen.
2. A Sheet/Drawer component slides in from the left, displaying the full sidebar content.
3. Tap the **Self Service** navigation item in the list.
4. The sidebar automatically closes on mobile after selection, and the SelfService component renders.

### 2.2 Module Layout and Responsive Behavior

The SelfService component renders within a `max-w-7xl` (80rem) centered container with responsive horizontal padding (`px-4` on mobile, `sm:px-6`, `lg:px-8`) and vertical padding (`py-6`). The content is organized into three visual zones:

1. **Welcome Banner** — Full-width gradient banner at the top
2. **Quick Actions Grid** — Responsive grid below the banner
3. **Tabbed Content Area** — Three tabs (My Profile, Company Policies, AI Assistant) with full content below

On mobile viewports, the tab labels truncate to shorter versions ("Profile", "Policies", "AI Chat") to conserve space, while on desktop viewports, full labels ("My Profile", "Company Policies", "AI Assistant") are displayed.

### 2.3 Data Loading Strategy

Upon component mount, the SelfService component initiates five independent API requests in parallel via the `useApi` hook, each with its own loading, error, and refetch state:

| API Call | Endpoint | Parameters | Purpose |
|----------|----------|------------|---------|
| Policies | `GET /api/policies` | `{ limit: 50 }` | Fetch all company policies |
| Leaves | `GET /api/leaves` | `{ employeeId: currentEmployeeId, limit: 50 }` | Fetch employee's leave records |
| Payroll | `GET /api/payroll` | `{ employeeId: currentEmployeeId, limit: 10 }` | Fetch recent payroll records |
| Documents | `GET /api/documents` | `{ employeeId: currentEmployeeId, limit: 20 }` | Fetch employee's documents |
| Assets | `GET /api/assets` | `{ employeeId: currentEmployeeId, status: 'assigned', limit: 20 }` | Fetch assigned assets |

Each data section renders a `Skeleton` loading placeholder while its API call is in flight, an `ErrorBanner` with a retry button if the call fails, or an empty-state message if the call succeeds but returns no data. This granular loading approach ensures that a failure in one API call does not block the rendering of other sections.

---

## 3. Screen Descriptions

### 3.1 Welcome Banner

The Welcome Banner is the first visual element displayed when the SelfService component renders. It is a full-width card with a gradient background (`from-emerald-600 via-emerald-500 to-teal-500`), rounded corners (`rounded-xl`), shadow (`shadow-lg`), and white text, providing a visually distinct hero section.

| Element | Description |
|---------|-------------|
| **Avatar** | 56×56px (mobile) / 64×64px (desktop) circular avatar with a white ring (`ring-2 ring-white/30`). Displays the employee's initials (e.g., "RK") in a semi-transparent background (`bg-white/20`). |
| **Greeting** | "Welcome back, {firstName}!" rendered as `text-xl`/`text-2xl` bold white text. Only the first name (split by space) is used. |
| **Date** | Today's full date formatted as "Wednesday, March 4, 2026" in `text-sm text-emerald-100`. |
| **Leave Balance Card** | Glassmorphism stat card (`bg-white/15 backdrop-blur-sm`) showing "Leave Balance" label and total remaining days as `text-lg font-bold`. Displays a pulsing skeleton placeholder while leave data is loading. |
| **Pending Tasks Card** | Glassmorphism stat card showing "Pending Tasks" label and count of pending leave requests as `text-lg font-bold`. Displays a pulsing skeleton while data loads. |

The banner uses a responsive flex layout: on mobile, the avatar/greeting and stat cards stack vertically (`flex-col`), while on desktop they align horizontally with space-between justification (`sm:flex-row sm:items-center sm:justify-between`).

### 3.2 Quick Actions Grid

Below the Welcome Banner, a grid of six quick action buttons provides shortcuts to common employee tasks. The grid adapts its column count based on viewport width:

- **Mobile (< 640px)**: 2 columns (`grid-cols-2`)
- **Tablet (640–1023px)**: 3 columns (`sm:grid-cols-3`)
- **Desktop (≥ 1024px)**: 6 columns (`lg:grid-cols-6`)

Each button is a `Button` component with `variant="outline"`, displayed as a vertical flex column (`flex-col`) with centered content and generous vertical padding (`py-5`). The buttons feature color-coded icon containers and hover effects:

| # | Label | Icon | Color Scheme | Intended Navigation |
|---|-------|------|-------------|---------------------|
| 1 | Apply Leave | `Calendar` | Emerald (`text-emerald-600`, `bg-emerald-50`) | Time & Attendance module |
| 2 | View Payslip | `FileText` | Amber (`text-amber-600`, `bg-amber-50`) | My Profile tab / Payslips section |
| 3 | Submit Expense | `Receipt` | Rose (`text-rose-600`, `bg-rose-50`) | Payroll & Expenses module |
| 4 | Update Profile | `UserCircle` | Teal (`text-teal-600`, `bg-teal-50`) | My Profile tab / Personal Info edit |
| 5 | Company Policies | `BookOpen` | Purple (`text-purple-600`, `bg-purple-50`) | Company Policies tab |
| 6 | Training Portal | `GraduationCap` | Cyan (`text-cyan-600`, `bg-cyan-50`) | Learning & Development module |

Each button's hover state adds a colored border (`hover:border-{color}-300`) and a subtle shadow (`hover:shadow-md`), providing clear visual feedback. Dark mode variants are defined for all color values.

### 3.3 My Profile Tab

The My Profile tab is the default active tab when the SelfService component first renders. It uses a two-column responsive grid (`grid-cols-1 lg:grid-cols-2`) to display six distinct card sections:

#### 3.3.1 Personal Information Card

| Element | Description |
|---------|-------------|
| **Card Title** | "Personal Information" |
| **Card Description** | "Your personal details" |
| **Edit Button** | An outline button in the card header with an `Edit3` icon. Toggles between "Edit" and "Save" states via the `isEditing` state variable. |
| **Avatar** | 64×64px avatar with emerald gradient ring (`ring-2 ring-emerald-500/20`). Displays employee initials in a gradient background (`from-emerald-500 to-teal-600`). |
| **Name** | Employee full name in `font-semibold`. |
| **Employee ID** | Displayed below the name in `text-sm text-muted-foreground`. |
| **Status Badge** | A `secondary` variant badge with emerald color scheme showing the employee's status (e.g., "Active"). |
| **Separator** | A horizontal `Separator` component between the avatar row and detail fields. |
| **Detail Fields** | 2-column grid (`sm:grid-cols-2`) with icon-prefixed fields: Email (`Mail`), Phone (`Phone`), Location (`MapPin`), Join Date (`CalendarDays`). Each field shows a label in `text-xs text-muted-foreground` and a value in `text-sm`. |

#### 3.3.2 Employment Details Card

| Element | Description |
|---------|-------------|
| **Card Title** | "Employment Details" |
| **Card Description** | "Work-related information" |
| **Detail Fields** | 2-column grid with icon-prefixed fields: Designation (`Briefcase`), Department (`Building2`), Job Title (`UserCircle`), Contract Type (`Shield`), Manager (`User`), Work Mode (`Clock`). Each field shows a label in `text-xs text-muted-foreground` and a value in `text-sm font-medium`. |

#### 3.3.3 Leave Balances Card

| Element | Description |
|---------|-------------|
| **Card Title** | "Leave Balances" |
| **Card Description** | "Your available leave days" |
| **Loading State** | `CardSkeleton` with 4 lines while leave data is being fetched. |
| **Error State** | `ErrorBanner` with red border/background, `AlertCircle` icon, error message, and "Retry" button. |
| **Empty State** | Centered `Calendar` icon and "No leave data available" message. |
| **Leave Balance Items** | For each leave type: name label and balance display ("**{balance}** / {total} days"), a colored progress bar showing used-to-total ratio, and "X day(s) used" text. |

**Leave Balance Computation Logic:**

Leave balances are computed from the raw leave records using a `useMemo` hook. The algorithm:

1. Iterates through all leave records and sums the `days` field for each `leaveType` where `status === 'approved'`, building a `usedByType` map.
2. Cross-references against the `leaveTypeConfig` object which defines total allocations: Casual (12), Sick (10), Earned (15), Maternity/Paternity (26).
3. Calculates `balance = total - used` for each type.
4. Adds any leave types present in the data but not in the config, with a default allocation of 15 days.
5. Deduplicates the Maternity/Paternity entries (both map to the same label).

**Leave Type Configuration:**

| Leave Type | Key | Total Allocation | Progress Bar Color |
|------------|-----|-----------------|-------------------|
| Casual Leave | `casual` | 12 | `bg-emerald-500` |
| Sick Leave | `sick` | 10 | `bg-amber-500` |
| Earned Leave | `earned` | 15 | `bg-teal-500` |
| Maternity/Paternity | `maternity`/`paternity` | 26 | `bg-rose-500` |
| Other (default) | — | 15 | `bg-emerald-500` |

#### 3.3.4 Recent Payslips Card

| Element | Description |
|---------|-------------|
| **Card Title** | "Recent Payslips" |
| **Card Description** | "Download your payslips" |
| **Loading State** | `CardSkeleton` with 4 lines. |
| **Error State** | `ErrorBanner` with retry. |
| **Empty State** | Centered `FileText` icon and "No payslips available" message. |
| **Scroll Container** | `max-h-72` (18rem) with `overflow-y-auto` and custom scrollbar. |
| **Payslip Items** | Each item shows: an emerald `FileText` icon in a rounded container, pay period text (e.g., "March 2026") in `text-sm font-medium`, net pay amount formatted as INR currency (e.g., "₹85,000") in `text-xs text-muted-foreground`, and a download button (`Download` icon, ghost variant, emerald color). |

**Pay Period Formatting:** The `formatPayPeriod` function converts the numeric month field to a full month name (e.g., `month: "3"` → "March") and appends the year.

**Currency Formatting:** The `formatCurrency` function uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` to format amounts in Indian Rupees with proper grouping (e.g., ₹1,25,000).

#### 3.3.5 My Documents Card

| Element | Description |
|---------|-------------|
| **Card Title** | "My Documents" |
| **Card Description** | "Your uploaded documents" |
| **Loading State** | `CardSkeleton` with 4 lines. |
| **Error State** | `ErrorBanner` with retry. |
| **Empty State** | Centered `File` icon and "No documents available" message. |
| **Scroll Container** | `max-h-72` with `overflow-y-auto` and custom scrollbar. |
| **Document Items** | Each item shows: an amber `File` icon in a rounded container, document title in `text-sm font-medium`, document type and creation date (e.g., "Offer Letter · March 15, 2021") in `text-xs text-muted-foreground`, and a download button. |

**Document Record Fields:** Each `DocumentRecord` contains `id`, `employeeId`, `docType`, `title`, `fileUrl`, `accessLevel`, `uploadedBy`, `createdAt`, and `updatedAt`.

#### 3.3.6 My Assets Card

| Element | Description |
|---------|-------------|
| **Card Title** | "My Assets" |
| **Card Description** | "Assets assigned to you" |
| **Loading State** | `CardSkeleton` with 4 lines. |
| **Error State** | `ErrorBanner` with retry. |
| **Empty State** | Centered `Monitor` icon and "No assets assigned" message. |
| **Scroll Container** | `max-h-72` with `overflow-y-auto` and custom scrollbar. |
| **Asset Items** | Each item shows: a type-specific icon (Laptop → `Monitor`, Phone → `Smartphone`, Headset → `Headphones`, Other → `CreditCard`) in a purple rounded container, asset name in `text-sm font-medium`, serial number, assigned date, and condition in `text-xs text-muted-foreground`, and a status badge. |

**Asset Icon Mapping:**

| Asset Type | Icon Component | Visual |
|------------|---------------|--------|
| Laptop | `Monitor` | Desktop monitor icon |
| Phone | `Smartphone` | Mobile phone icon |
| Headset | `Headphones` | Headphones icon |
| Other (default) | `CreditCard` | Card icon |

**Asset Record Fields:** Each `AssetRecord` contains `id`, `employeeId`, `assetType`, `assetName`, `serialNo`, `assignedDate`, `returnDate`, `condition`, `status`, `createdAt`, and `updatedAt`. Only assets with `status === 'assigned'` are fetched.

### 3.4 Company Policies Tab

The Company Policies tab provides a searchable, filterable, and expandable interface for browsing all company policy documents. The tab consists of three visual elements:

#### 3.4.1 Search and Filter Bar

| Element | Description |
|---------|-------------|
| **Search Input** | An `Input` component with a `Search` icon prefix and "Search policies..." placeholder. Bound to the `policySearch` state. Client-side filtering is applied in real time as the user types. |
| **Category Filter Tabs** | A horizontally scrollable set of filter pills for policy categories: All, Leave, Compliance, Work Policy, Finance, Security, HR. The active category is tracked in `policyCategory` state. Default is "All". |

**Category Color Mapping:**

| Category | Badge Color (Light) | Badge Color (Dark) |
|----------|--------------------|--------------------|
| Leave | `bg-emerald-100 text-emerald-700` | `bg-emerald-950 text-emerald-400` |
| Compliance | `bg-amber-100 text-amber-700` | `bg-amber-950 text-amber-400` |
| Work Policy | `bg-teal-100 text-teal-700` | `bg-teal-950 text-teal-400` |
| Finance | `bg-rose-100 text-rose-700` | `bg-rose-950 text-rose-400` |
| Security | `bg-purple-100 text-purple-700` | `bg-purple-950 text-purple-400` |
| HR | `bg-cyan-100 text-cyan-700` | `bg-cyan-950 text-cyan-400` |

#### 3.4.2 Policy List

Policies are rendered as expandable `Collapsible` components within a `ScrollArea`. Each policy item displays:

| Element | Description |
|---------|-------------|
| **Title** | Policy title in `font-medium`, clickable to expand/collapse. |
| **Category Badge** | Color-coded badge showing the policy category. |
| **Version Badge** | A `secondary` variant badge showing the policy version (e.g., "v2.1"), if available. |
| **Effective Date** | The policy's effective date formatted using `formatDate()`, displayed in `text-xs text-muted-foreground`. |
| **Expand/Collapse Icon** | A `ChevronDown`/`ChevronUp` icon indicating the current expansion state. |
| **Content** | When expanded, the policy content is rendered in a padded content area with `text-sm` formatting. |

**Filtering Logic:** The `filteredPolicies` computed value applies two filters in conjunction:
1. **Search filter**: Checks if the policy `title` or `content` contains the search string (case-insensitive).
2. **Category filter**: Checks if the policy `category` matches the selected category (or allows all if "All" is selected).

#### 3.4.3 Policy Loading and Empty States

- **Loading**: `CardSkeleton` with 5 lines is displayed while policy data is being fetched.
- **Error**: `ErrorBanner` with red styling and a "Retry" button.
- **No Results**: If the search/category filter yields zero results, a centered empty state with a `BookOpen` icon and "No policies found matching your search" message is displayed.
- **No Policies**: If there are no policies in the system at all, a centered empty state with a `BookOpen` icon and "No company policies available" message is displayed.

### 3.5 AI Assistant Tab

The AI Assistant tab provides a conversational chat interface for employees to ask HR-related questions and receive AI-generated responses. It is the most distinctive feature of the Self-Service module, leveraging the z-ai-web-dev-sdk for intelligent, context-aware responses.

#### 3.5.1 Chat Interface Layout

| Element | Description |
|---------|-------------|
| **Chat Container** | A card component with a distinct header showing the "AI HR Assistant" title with a `Sparkles` icon and an emerald gradient badge labeled "AI". |
| **Message Area** | A `ScrollArea` component that contains all chat messages, with automatic scrolling to the bottom via `chatEndRef`. Messages are displayed in a vertical stack with spacing. |
| **Input Area** | A horizontal flex container at the bottom with a text `Input` field and a `Send` button. The input is bound to `chatInput` state and supports Enter key submission. |
| **Suggested Queries** | A horizontal scrollable row of chip buttons above the input field, showing predefined suggested queries that users can click to quickly send a message. |

#### 3.5.2 Chat Message Display

Each chat message is rendered differently based on its `role`:

**User Messages:**
- Right-aligned (`ml-auto`) with emerald gradient background (`from-emerald-500 to-teal-600`)
- White text, `rounded-2xl` with bottom-right sharp corner (`rounded-br-md`)
- Timestamp in `text-[10px] text-white/70`

**AI Messages:**
- Left-aligned with muted background (`bg-muted`)
- Foreground text, `rounded-2xl` with bottom-left sharp corner (`rounded-bl-md`)
- AI avatar (a `Bot` icon in a circular emerald container) displayed to the left
- Content rendered using the `renderSimpleMarkdown` function for structured formatting
- Timestamp in `text-[10px] text-muted-foreground`

**Welcome Message:**
The chat initializes with a welcome message from the AI Assistant:
> "Hi! I'm your AI HR Assistant. I can help you with leave policies, payroll queries, company policies, and more. How can I help you today?"

#### 3.5.3 Typing Indicator

When the AI is generating a response (`isTyping === true`), a typing indicator is displayed:
- Left-aligned (same position as AI messages)
- Shows a `Bot` icon avatar
- Displays three animated dots in a flex container with staggered `animate-bounce` animations
- Text: "AI is thinking..."

---

## 4. Functional Workflows

### 4.1 Viewing and Editing Personal Profile

This workflow describes how an employee views their personal information and toggles the edit mode to modify their profile data.

**Prerequisites:**
- User is authenticated and has an active session
- The employee's record exists in the Employee table
- The Self-Service module has successfully loaded profile data

**Steps:**

1. **Navigate to Self-Service.** Click the "Self Service" item in the sidebar navigation. The SelfService component renders with the "My Profile" tab active by default.

2. **Review Personal Information.** The Personal Information card displays the employee's name, employee ID, status badge (e.g., "Active"), email, phone, location, and join date. Each field is prefixed with a descriptive icon for quick visual scanning.

3. **Review Employment Details.** The Employment Details card displays designation, department, job title, contract type, reporting manager, and work mode. These fields are read-only in the current implementation.

4. **Toggle Edit Mode.** Click the "Edit" button in the top-right corner of the Personal Information card. The button text changes to "Save", and the `isEditing` state is set to `true`. In the current implementation, the toggle visually changes the button state but does not yet transform the display fields into editable input fields. The intended behavior is that clicking "Edit" should convert the personal detail fields (email, phone, location) into editable input fields, and clicking "Save" should persist the changes via a `PUT/PATCH /api/employees/{id}` request.

5. **Save Changes.** Click "Save" to toggle back to view mode. In a fully implemented version, this would trigger an API call to update the employee record, display a success toast notification, and refresh the profile data.

**Error Handling:** If the save operation fails, an error toast should be displayed with a descriptive message, and the profile data should remain in edit mode to allow the user to retry.

### 4.2 Checking Leave Balances

This workflow describes how an employee checks their available leave days across different leave types.

**Prerequisites:**
- User is authenticated
- Leave records exist for the employee in the Leave table

**Steps:**

1. **Navigate to Self-Service → My Profile.** The SelfService component renders with the "My Profile" tab active. The Leave Balances card is visible in the two-column grid layout.

2. **Wait for data to load.** While the `GET /api/leaves?employeeId={id}&limit=50` request is in flight, a skeleton loading animation is displayed in the Leave Balances card.

3. **Review leave balances.** Once data loads, each leave type is displayed with:
   - **Type name** (e.g., "Casual Leave") on the left
   - **Balance display** (e.g., "**8** / 12 days") on the right, with the remaining balance in bold
   - **Progress bar** — A colored bar showing the used-to-total ratio. The bar width is calculated as `Math.round((used / total) * 100)%`. Green for low usage, amber for moderate, rose for types like maternity/paternity.
   - **Usage text** (e.g., "4 days used") below the progress bar

4. **Check the Welcome Banner summary.** The total leave balance across all types is displayed in the Welcome Banner's "Leave Balance" stat card for quick reference.

5. **Review pending leaves.** The "Pending Tasks" stat card in the Welcome Banner shows the count of leave requests with `status === 'pending'`, indicating how many of the employee's leave applications are awaiting approval.

6. **Use AI Assistant for leave queries.** If the employee wants more context about their leave balance, they can switch to the AI Assistant tab and ask questions like "What's my leave balance?" or "How many sick leaves do I have left?" (Note: The AI Assistant provides general HR guidance and does not currently access real-time employee-specific data; it may direct the user to check the My Profile tab for exact numbers.)

**Data Computation:** Leave balances are computed entirely on the client side from the raw leave records. The `useMemo` hook processes the leaves array, sums approved leave days by type, and cross-references with the `leaveTypeConfig` for total allocations. This ensures real-time accuracy without requiring a separate balance API endpoint.

### 4.3 Viewing Payslips

This workflow describes how an employee accesses and downloads their payroll payslips.

**Prerequisites:**
- User is authenticated
- Payroll records exist for the employee in the Payroll table
- The payroll data has been processed (status: 'processed' or 'paid')

**Steps:**

1. **Navigate to Self-Service → My Profile.** The Recent Payslips card is displayed in the two-column grid layout.

2. **Wait for data to load.** While the `GET /api/payroll?employeeId={id}&limit=10` request is in flight, a skeleton loading animation is displayed.

3. **Review payslip list.** Once data loads, the most recent 10 payroll records are displayed in a scrollable list (`max-h-72`). Each payslip entry shows:
   - **Pay period** (e.g., "March 2026") formatted from the numeric month and year fields
   - **Net pay** amount in Indian Rupees format (e.g., "₹85,000")

4. **Download a payslip.** Click the download button (green `Download` icon) on the right side of any payslip entry. In the current implementation, the button is rendered but the download action is not yet wired to generate or retrieve the actual payslip PDF. The intended behavior is that clicking the download button should trigger a file download of the payslip in PDF format, either generated on-demand from the payroll data or retrieved from a stored file.

5. **Use Quick Action shortcut.** The "View Payslip" Quick Action button on the Welcome Banner provides a shortcut to scroll to or highlight the Recent Payslips section.

**Pay Period Formatting Details:**
- The month field is parsed as a zero-based index (e.g., `3` → March) using the `monthNames` array
- If parsing fails, the raw month string is displayed
- The format is: `{MonthName} {Year}` (e.g., "January 2026")

**Currency Formatting Details:**
- Uses `Intl.NumberFormat` with `style: 'currency'`, `currency: 'INR'`
- `maximumFractionDigits: 0` removes decimal places (e.g., "₹1,25,000" not "₹1,25,000.00")
- Indian grouping system is applied automatically (lakhs/crores)

### 4.4 Accessing Documents

This workflow describes how an employee views and downloads their personal documents stored in the HRMS.

**Prerequisites:**
- User is authenticated
- Document records exist for the employee in the Document table

**Steps:**

1. **Navigate to Self-Service → My Profile.** The My Documents card is displayed in the two-column grid layout.

2. **Wait for data to load.** While the `GET /api/documents?employeeId={id}&limit=20` request is in flight, a skeleton loading animation is displayed.

3. **Review document list.** Once data loads, up to 20 documents are displayed in a scrollable list. Each document entry shows:
   - **Document icon** — Amber `File` icon in a rounded container
   - **Document title** (e.g., "Employment Agreement") in `text-sm font-medium`
   - **Document type and date** (e.g., "Contract · March 15, 2021") in `text-xs text-muted-foreground`

4. **Download a document.** Click the download button (ghost variant) on the right side of any document entry. In the current implementation, the button is rendered but the download action is not yet wired. The intended behavior is that clicking the download button should retrieve the document from its `fileUrl` and trigger a browser download.

5. **Review access levels.** Each document has an `accessLevel` field that determines who can view it. Documents marked as "employee" are visible to the employee themselves, while those marked "manager" or "hr" may have restricted visibility. The Self-Service module only fetches and displays documents that the authenticated employee has permission to view.

**Document Types Commonly Stored:**
- Offer Letters
- Employment Agreements
- Non-Disclosure Agreements (NDAs)
- ID Proofs
- Address Proofs
- Educational Certificates
- Experience Letters
- Tax Documents (Form 16, etc.)
- Appraisal Letters

### 4.5 Browsing Company Policies

This workflow describes how an employee searches, filters, and reads company policy documents.

**Prerequisites:**
- User is authenticated
- Company policy records exist in the CompanyPolicy table

**Steps:**

1. **Navigate to Company Policies tab.** Click the "Company Policies" tab trigger in the tab bar. Alternatively, click the "Company Policies" Quick Action button on the Welcome Banner.

2. **Wait for data to load.** While the `GET /api/policies?limit=50` request is in flight, a skeleton loading animation is displayed.

3. **Browse the policy list.** All policies are displayed as expandable items. Each shows the policy title, a color-coded category badge, a version badge (if available), and the effective date. By default, all policies are collapsed to show only the summary information.

4. **Search for a specific policy.** Type a keyword or phrase into the search input (e.g., "remote work"). The list filters in real time to show only policies whose title or content contains the search string (case-insensitive). The search is performed entirely on the client side against the already-fetched policy data, so results appear instantly.

5. **Filter by category.** Click one of the category filter pills (Leave, Compliance, Work Policy, Finance, Security, HR) to narrow the list to policies in that category. Click "All" to remove the category filter. The category filter works in conjunction with the search filter—both must match for a policy to appear.

6. **Expand a policy.** Click on a policy title or the chevron icon to expand it. The `expandedPolicies` state (a `Set<string>` of policy IDs) is updated to include the clicked policy's ID. The policy content is revealed below the title with formatted text. Click again to collapse.

7. **Read the policy content.** The expanded policy content is displayed with proper formatting, including headings, paragraphs, and any structured data. The content field typically contains rich text stored in the database.

8. **Check the version and effective date.** The version badge (e.g., "v2.1") and effective date indicate when the policy was last updated and when it became effective. This helps employees ensure they are reading the most current version.

**Client-Side Filtering Logic:**
The `filteredPolicies` value is computed via a `useMemo` hook that applies two filters:
- **Search match**: `p.title.toLowerCase().includes(policySearch.toLowerCase()) || (p.content || '').toLowerCase().includes(policySearch.toLowerCase())`
- **Category match**: `policyCategory === 'All' || p.category === policyCategory`

Both conditions must be satisfied for a policy to appear in the filtered list.

### 4.6 Using AI Assistant for HR Queries

This workflow describes how an employee interacts with the AI Assistant to get answers to HR-related questions.

**Prerequisites:**
- User is authenticated
- The AI chat API endpoint (`POST /api/ai-chat`) is operational
- The z-ai-web-dev-sdk is properly configured with valid credentials

**Steps:**

1. **Navigate to AI Assistant tab.** Click the "AI Assistant" tab trigger in the tab bar. The tab is identified by the `Sparkles` icon and a distinctive emerald gradient "AI" badge.

2. **Review the welcome message.** The chat interface displays the AI Assistant's welcome message: "Hi! I'm your AI HR Assistant. I can help you with leave policies, payroll queries, company policies, and more. How can I help you today?"

3. **Type a question.** Click on the chat input field at the bottom of the chat area. Type a natural language question (e.g., "What is the leave policy for casual leaves?"). Press Enter or click the Send button (emerald `Send` icon) to submit.

4. **Alternatively, use a suggested query.** Click one of the suggested query chips displayed above the input field:
   - "What is the leave policy?"
   - "How to apply for expense reimbursement?"
   - "When is the next holiday?"
   - "What are my tax benefits?"
   
   Clicking a suggested query immediately sends it as a chat message without requiring the user to type anything.

5. **Wait for AI response.** After sending a message, a typing indicator appears ("AI is thinking..." with animated dots). The user's message appears immediately on the right side of the chat. The AI processes the query on the server side (typically taking 2–10 seconds depending on query complexity and API latency).

6. **Read the AI response.** The AI response appears on the left side of the chat, prefixed by a `Bot` icon. The response content is rendered using the `renderSimpleMarkdown` function, which supports:
   - H3 headings (`## `)
   - H4 headings (`### `)
   - Bold list items (`- **label** text`)
   - Bullet list items (`- text`)
   - Numbered list items (`1. text`)
   - Paragraph text
   - Empty line spacing

7. **Continue the conversation.** The AI maintains conversation context by sending the last 10 messages as conversation history with each request. The employee can ask follow-up questions that reference previous messages, and the AI will maintain contextual awareness.

8. **Handle errors gracefully.** If the AI fails to generate a response (network error, API timeout, server error), the chat displays an error message: "I apologize, but I encountered a technical issue. Please try again in a moment." The user can retry by sending the same or a different message.

**Conversation History Management:**
- The client maintains the full conversation history in the `chatMessages` state array
- Only the last 10 messages are sent to the API as `conversationHistory` to balance context and token limits
- The conversation persists for the duration of the component's lifecycle (until the user navigates away from the Self-Service module)
- Upon navigating away and returning, the chat resets to the initial welcome message

---

## 5. AI Assistant Features

### 5.1 Architecture Overview

The AI Assistant is built on a client-server architecture where the frontend captures user input and displays responses, while the backend handles the AI processing using the z-ai-web-dev-sdk. The architecture ensures that API keys and SDK configuration remain server-side, preventing exposure of sensitive credentials to the client.

```
┌─────────────────────────────────┐
│   Browser (Client)              │
│                                 │
│   SelfService.tsx               │
│   ├─ ChatMessage[] state        │──── POST /api/ai-chat ────┐
│   ├─ sendMessage() callback     │                           │
│   ├─ renderSimpleMarkdown()     │◄─── { message, timestamp }┤
│   └─ Suggested queries          │                           │
│                                 │                           │
└─────────────────────────────────┘                           │
                                                              │
┌─────────────────────────────────────────────────────────────┘
│
│   ┌──────────────────────────────────────────────────────────┐
│   │   Next.js API Route                                     │
│   │   src/app/api/ai-chat/route.ts                          │
│   │                                                          │
│   │   1. Validate request body (message required)            │
│   │   2. Build messages array:                               │
│   │      - System prompt (HR_SYSTEM_PROMPT)                  │
│   │      - Conversation history (last N messages)            │
│   │      - Current user message                              │
│   │   3. Initialize z-ai-web-dev-sdk (ZAI.create())         │
│   │   4. Call zai.chat.completions.create({ messages })      │
│   │   5. Extract response from choices[0].message.content    │
│   │   6. Return JSON { message, timestamp }                  │
│   └──────────────────────────────────────────────────────────┘
│
│   ┌──────────────────────────────────────────────────────────┐
│   │   z-ai-web-dev-sdk                                       │
│   │   ├─ ZAI.create() — async initialization                 │
│   │   └─ zai.chat.completions.create() — AI completion       │
│   └──────────────────────────────────────────────────────────┘
```

### 5.2 System Prompt

The AI Assistant uses a comprehensive system prompt that defines its persona, capabilities, and behavioral guidelines. The full system prompt (`HR_SYSTEM_PROMPT`) is:

```
You are an AI HR assistant for a Human Resource Management System (HRMS). You help with:

1. **Employee Management**: Queries about employee records, departments, designations, and organizational structure.
2. **Attendance & Leave**: Questions about attendance policies, leave balances, leave types, and holiday calendars.
3. **Payroll**: Salary structures, deductions, tax calculations, and payroll processing.
4. **Recruitment**: Job postings, candidate pipeline, interview scheduling, and hiring workflows.
5. **Performance**: Review cycles, OKRs, feedback, ratings, and attrition risk analysis.
6. **Learning & Development**: Training courses, skill assessments, certifications, and enrollment.
7. **Company Policies**: Leave policies, expense policies, code of conduct, and compliance.
8. **Expenses**: Expense categories, approval workflows, reimbursement processes.

Guidelines:
- Provide accurate, professional HR advice
- Reference common HR best practices and compliance standards
- Be helpful and empathetic in your responses
- When specific data is needed, suggest the user check the relevant section in the HRMS
- Keep responses concise but informative
- If you're unsure about company-specific policies, recommend checking with HR department
- Format responses with clear structure using markdown when appropriate
```

The system prompt covers all eight major HRMS modules, ensuring that the AI Assistant can provide relevant guidance across the entire platform. The guidelines emphasize professionalism, empathy, accuracy, and appropriate referral to the HRMS interface or HR department when the AI cannot provide a definitive answer.

### 5.3 Suggested Queries

The AI Assistant provides four pre-defined suggested queries that appear as clickable chip buttons above the chat input:

| # | Suggested Query | Domain | Expected AI Response Topic |
|---|----------------|--------|---------------------------|
| 1 | "What is the leave policy?" | Attendance & Leave | Overview of leave types, entitlements, and application process |
| 2 | "How to apply for expense reimbursement?" | Expenses | Step-by-step expense submission and approval workflow |
| 3 | "When is the next holiday?" | Attendance & Leave | Upcoming company holiday from the holiday calendar |
| 4 | "What are my tax benefits?" | Payroll | Tax deductions, exemptions, and benefits available to employees |

These suggested queries serve dual purposes: (a) they help new users understand the types of questions the AI can answer, reducing the blank-page problem, and (b) they provide quick access to the most commonly asked HR questions, saving typing time. Clicking a suggested query immediately invokes the `sendMessage()` function with the query text, bypassing the need to type in the input field.

### 5.4 Conversation Flow

The AI Assistant maintains a stateful conversation within a single session using the following flow:

1. **Session Initialization**: When the user navigates to the AI Assistant tab, the `chatMessages` state is initialized with a single welcome message from the assistant. The `chatInput` is empty and `isTyping` is `false`.

2. **Message Submission**: When the user sends a message (via typing + Enter, clicking Send, or clicking a suggested query):
   - A `ChatMessage` object is created with `role: 'user'`, the message content, a unique ID (`user-{timestamp}`), and the current timestamp
   - The message is appended to the `chatMessages` array
   - The input field is cleared
   - `isTyping` is set to `true`
   - The chat auto-scrolls to the bottom

3. **API Request**: The `sendMessage` callback constructs the request payload:
   - `message`: The user's current message text
   - `conversationHistory`: The last 10 messages from `chatMessages`, mapped to `{ role, content }` objects (stripping the ID and timestamp)
   - The request is sent as `POST /api/ai-chat` with `Content-Type: application/json`

4. **Server Processing**: The API route:
   - Validates that `message` is present (returns 400 if missing)
   - Builds the `messages` array: system prompt + conversation history + current message
   - Initializes the z-ai-web-dev-sdk via `ZAI.create()`
   - Calls `zai.chat.completions.create({ messages })`
   - Extracts the AI response from `response.choices[0].message.content`
   - Returns `{ message: aiMessage, timestamp: ISO string }`

5. **Response Handling**: On success:
   - A `ChatMessage` with `role: 'assistant'` is created and appended to `chatMessages`
   - `isTyping` is set to `false`
   
   On failure (catch block):
   - An error message ChatMessage is created: "I apologize, but I encountered a technical issue. Please try again in a moment."
   - `isTyping` is set to `false`

6. **Message Rendering**: Each message in `chatMessages` is rendered in the chat area. User messages appear on the right with emerald gradient backgrounds; AI messages appear on the left with muted backgrounds and a Bot avatar. AI message content is processed through `renderSimpleMarkdown()` for structured display.

7. **Auto-Scroll**: A `useEffect` hook watches `chatMessages` and `isTyping` and calls `chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })` to keep the most recent message visible.

### 5.5 Markdown Rendering

The `renderSimpleMarkdown` function provides lightweight markdown rendering for AI responses without requiring a full markdown library. It processes text line-by-line and produces React elements:

| Markdown Pattern | Rendered Output | CSS Classes |
|-----------------|----------------|-------------|
| `## Heading` | `<h3>` | `text-base font-semibold mt-3 mb-1` |
| `### Heading` | `<h4>` | `text-sm font-semibold mt-2 mb-1` |
| `- **Bold** text` | `<li>` with bold span | `ml-4 text-sm text-muted-foreground list-disc`; bold span: `font-medium text-foreground` |
| `- Item` | `<li>` | `ml-4 text-sm text-muted-foreground list-disc` |
| `1. Item` | `<li>` (ordered) | `ml-4 text-sm text-muted-foreground list-decimal` |
| Empty line | `<div>` spacer | `h-2` |
| Plain text | `<p>` | `text-sm text-muted-foreground` |

This minimal renderer covers the most common markdown patterns used in AI-generated HR responses and avoids the dependency overhead of a full markdown parsing library.

### 5.6 Rate Limiting and Performance Considerations

- **Debouncing**: The `sendMessage` function checks `isTyping` before processing, preventing duplicate requests while an AI response is being generated.
- **History Window**: Only the last 10 messages are sent as conversation history to manage token usage and API costs.
- **Error Recovery**: Network errors and API failures are caught gracefully, displaying user-friendly error messages rather than crashing the interface.
- **No Persistent Storage**: Chat history is stored only in component state and is lost when the user navigates away. This is by design for privacy and simplicity, though a future enhancement could persist conversations to local storage or a database.

---

## 6. Policy Management

### 6.1 Policy Categories

Company policies in the AI-HRMS system are organized into six distinct categories, each with its own color coding for visual identification:

| Category | Description | Color Theme | Example Policies |
|----------|-------------|-------------|------------------|
| **Leave** | Policies governing leave entitlements, types, application procedures, and carry-forward rules | Emerald | Casual Leave Policy, Sick Leave Policy, Earned Leave Policy |
| **Compliance** | Regulatory and legal compliance policies that the organization must adhere to | Amber | Anti-Harassment Policy, Data Protection Policy, Equal Employment Opportunity |
| **Work Policy** | Day-to-day workplace conduct and operational policies | Teal | Code of Conduct, Remote Work Policy, Office Hours Policy |
| **Finance** | Financial policies including expense management, reimbursement, and travel | Rose | Expense Reimbursement Policy, Travel Policy, Corporate Card Usage |
| **Security** | Information security and IT-related policies | Purple | IT Security Policy, Password Management, Data Classification |
| **HR** | General human resources policies covering the employee lifecycle | Cyan | Onboarding Policy, Probation Policy, Exit Policy |

### 6.2 Default Policies

The system ships with eight default company policies that cover the essential areas of employment governance:

| # | Policy Title | Category | Typical Content |
|---|-------------|----------|-----------------|
| 1 | **Leave Policy** | Leave | Leave types (casual, sick, earned, maternity/paternity), entitlements per year, carry-forward rules, application process, approval hierarchy |
| 2 | **Code of Conduct** | Work Policy | Expected workplace behavior, professional standards, conflict of interest guidelines, disciplinary procedures |
| 3 | **Remote Work Policy** | Work Policy | Eligibility criteria, work-from-home rules, equipment provisions, communication expectations, productivity tracking |
| 4 | **Expense Policy** | Finance | Reimbursable categories, approval thresholds, documentation requirements, submission deadlines, per-diem rates |
| 5 | **IT Security Policy** | Security | Password requirements, device management, data handling protocols, incident reporting, acceptable use of company systems |
| 6 | **Travel Policy** | Finance | Travel class by designation, advance booking requirements, per-diem rates by city, expense claim process |
| 7 | **Anti-Harassment Policy** | Compliance | Definition of harassment, reporting mechanism, investigation process, confidentiality provisions, zero-tolerance stance |
| 8 | **Data Protection Policy** | Compliance | GDPR/data privacy compliance, personal data handling, data retention periods, breach notification procedures, employee data rights |

### 6.3 Policy Versioning

Each policy in the CompanyPolicy model supports version tracking through the `version` field:

| Field | Type | Description |
|-------|------|-------------|
| `version` | `String?` (optional) | Semantic version identifier (e.g., "2.1", "3.0") |
| `effectiveDate` | `DateTime?` (optional) | The date from which this version of the policy becomes effective |

**Versioning Rules:**

1. When a policy is updated, the `version` field should be incremented to reflect the change (e.g., from "1.0" to "1.1" for minor changes, or "2.0" for major revisions).
2. The `effectiveDate` should be set to the date when the new version takes effect, allowing for future-dated policy changes.
3. The `updatedAt` timestamp is automatically maintained by Prisma and reflects when the record was last modified in the database.
4. Previous versions of a policy are not retained in the current schema; updating a policy replaces its content entirely. If version history is required, the previous version should be archived as a separate record before updating.
5. The version badge is displayed in the policy list, enabling employees to quickly identify which version they are reading.

### 6.4 Policy Access Levels

All authenticated users can view company policies through the Self-Service module. The policies are intended to be organization-wide documents accessible to every employee. The current implementation does not enforce role-based access restrictions on policy viewing; however, the policy creation, update, and deletion operations (via `POST /api/policies`, `PATCH /api/policies`, `DELETE /api/policies`) are intended for administrative use only and should be protected by role-based middleware.

| Operation | API Endpoint | Access Level |
|-----------|-------------|--------------|
| View/Read policies | `GET /api/policies` | All authenticated users |
| Create policy | `POST /api/policies` | Admin roles only (Super Admin, HR Admin) |
| Update policy | `PATCH /api/policies` | Admin roles only (Super Admin, HR Admin) |
| Delete policy | `DELETE /api/policies` | Super Admin only |

All policy write operations create audit log entries via `db.auditLog.create()`, recording the action type, module, and details of the change for compliance and traceability purposes.

### 6.5 Policy Search and Filtering

The Company Policies tab provides two filtering mechanisms that work in conjunction:

1. **Full-text Search**: The search input filters policies by matching the search term against both the policy `title` and `content` fields (case-insensitive). This allows employees to find policies by keyword even if the search term appears only within the policy body.

2. **Category Filter**: The category pill buttons filter policies by their `category` field. Selecting a specific category shows only policies in that category. Selecting "All" removes the category filter.

Both filters are applied client-side against the pre-fetched policy data (up to 50 records), ensuring instant results without additional API calls. The filtering logic uses a `useMemo` hook that recomputes the filtered list whenever the `policies`, `policySearch`, or `policyCategory` state values change.

---

## 7. Integration with Other Modules

The Employee Self-Service module is a consumption-heavy module that aggregates and displays data from nearly every other module in the AI-HRMS platform. It serves as the employee-facing window into the broader HRMS ecosystem. This section details each integration point, the data consumed, and the nature of the dependency.

### 7.1 Employee Management Module

| Integration Point | Data Consumed | API Query | Self-Service Usage |
|-------------------|---------------|-----------|-------------------|
| Employee profile | Personal info, employment details | `GET /api/employees/{id}` | Personal Information and Employment Details cards |
| Employee status | Status field (active, inactive, etc.) | Employee record | Status badge on profile card |
| Department/Designation | Department, designation, job title | Employee record | Employment Details card fields |
| Manager assignment | Reporting manager name | Employee record | Employment Details card — Manager field |

**Dependency:** The Employee module is the foundational data source for the Self-Service module. Without employee records, the profile cards display placeholder or empty data. The `currentEmployeeId` used for API calls is derived from the authenticated user's employee record.

### 7.2 Time & Attendance Module

| Integration Point | Data Consumed | API Query | Self-Service Usage |
|-------------------|---------------|-----------|-------------------|
| Leave records | All leaves for employee | `GET /api/leaves?employeeId={id}&limit=50` | Leave Balances card computation |
| Pending leaves | Leaves with status 'pending' | Filtered from leave records | Welcome Banner "Pending Tasks" count |
| Approved leave days | Sum of days for approved leaves | Computed from leave records | Leave balance used days calculation |
| Holiday calendar | Company holidays | Via AI Assistant queries | AI responses about upcoming holidays |

**Dependency:** The Leave data is essential for the Leave Balances card. Without leave records, the card shows the empty state ("No leave data available") and the Welcome Banner shows 0 days for leave balance. The "Apply Leave" Quick Action navigates to this module.

### 7.3 Payroll & Expenses Module

| Integration Point | Data Consumed | API Query | Self-Service Usage |
|-------------------|---------------|-----------|-------------------|
| Payroll records | Recent payroll for employee | `GET /api/payroll?employeeId={id}&limit=10` | Recent Payslips card |
| Net pay amount | `netPay` field from payroll | Payroll record | Payslip amount display (INR format) |
| Payroll status | `status` field (processed, paid) | Payroll record | Payslip availability |
| Expense categories | Category information | Via AI Assistant queries | AI responses about expense policies |

**Dependency:** The Payroll data populates the Recent Payslips card. Without payroll records, the card shows the empty state. The "View Payslip" and "Submit Expense" Quick Actions relate to this module.

### 7.4 Document Management Module

| Integration Point | Data Consumed | API Query | Self-Service Usage |
|-------------------|---------------|-----------|-------------------|
| Employee documents | Documents assigned to employee | `GET /api/documents?employeeId={id}&limit=20` | My Documents card |
| Document types | `docType` field | Document record | Document type label display |
| Document files | `fileUrl` field | Document record | Download functionality |
| Access levels | `accessLevel` field | Document record | Visibility filtering |

**Dependency:** The Documents data populates the My Documents card. Without document records, the card shows the empty state. Documents are uploaded through the admin Document Management module and made available to employees through Self-Service.

### 7.5 Asset Management Module

| Integration Point | Data Consumed | API Query | Self-Service Usage |
|-------------------|---------------|-----------|-------------------|
| Assigned assets | Assets with status 'assigned' | `GET /api/assets?employeeId={id}&status=assigned&limit=20` | My Assets card |
| Asset types | `assetType` field (Laptop, Phone, etc.) | Asset record | Asset icon mapping |
| Asset details | Serial number, condition, dates | Asset record | Asset detail display |

**Dependency:** The Assets data populates the My Assets card. Without assigned assets, the card shows the empty state ("No assets assigned"). Asset assignments are managed through the admin Asset Management module.

### 7.6 Company Policies (Internal to Self-Service)

| Integration Point | Data Consumed | API Query | Self-Service Usage |
|-------------------|---------------|-----------|-------------------|
| All policies | Complete policy list | `GET /api/policies?limit=50` | Company Policies tab |
| Policy categories | `category` field | Policy record | Category filter badges |
| Policy versions | `version` field | Policy record | Version badge display |
| Policy content | `content` field | Policy record | Expandable content display |
| Effective dates | `effectiveDate` field | Policy record | Policy date display |

**Dependency:** Policies are managed through the `/api/policies` CRUD endpoints (accessible to admin roles) and consumed read-only through the Self-Service module. The policy data is also available to the AI Assistant through its system prompt, which references company policies as one of its eight supported domains.

### 7.7 AI Chat (Internal to Self-Service)

| Integration Point | Data Consumed | API Query | Self-Service Usage |
|-------------------|---------------|-----------|-------------------|
| AI completions | Chat responses | `POST /api/ai-chat` | AI Assistant tab |
| Conversation history | Last 10 messages | Client state | Context-aware responses |
| System prompt | HR-specific prompt | Server-side config | AI behavior and domain knowledge |

**Dependency:** The AI Chat feature depends on the z-ai-web-dev-sdk being properly configured and the API endpoint being operational. If the SDK or API is unavailable, the AI Assistant tab will display error messages for all queries.

### 7.8 Learning & Development Module

| Integration Point | Data Consumed | Self-Service Usage |
|-------------------|---------------|-------------------|
| Training portal | N/A (navigation only) | "Training Portal" Quick Action navigates to L&D module |
| Course information | Via AI Assistant queries | AI responses about training courses and certifications |

**Dependency:** The "Training Portal" Quick Action provides navigation to the Learning & Development module. The AI Assistant can answer questions about training programs, skill assessments, and certifications based on its system prompt knowledge.

### 7.9 Dashboard Module

| Integration Point | Data Consumed | Self-Service Usage |
|-------------------|---------------|-------------------|
| Employee count | N/A | Self-Service contributes employee engagement metrics back to Dashboard |
| Activity tracking | AuditLog entries | Self-Service actions (profile edits, policy views) contribute to the Recent Activities feed on the Dashboard |

---

## 8. Role-Based Views

### 8.1 Overview

The Self-Service module is designed as an employee-first interface, meaning all authenticated users see a similar view scoped to their own data. However, certain elements and behaviors differ based on the user's role.

### 8.2 Role-Based Feature Matrix

| Feature | Super Admin (0) | HR Admin (1) | Payroll Specialist (2) | Dept Manager (3) | Recruiter (4) | L&D Manager (5) | Employee (6) |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Welcome Banner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quick Actions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Personal Info (own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Employment Details (own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leave Balances (own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recent Payslips (own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| My Documents (own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| My Assets (own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Company Policies (view) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI Assistant | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile Edit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Policy Management (CRUD) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 8.3 Data Scoping

All data displayed in the Self-Service module is automatically scoped to the currently authenticated employee. This is achieved by passing the `currentEmployeeId` as a query parameter in all API calls:

```
GET /api/leaves?employeeId=EMP001&limit=50
GET /api/payroll?employeeId=EMP001&limit=10
GET /api/documents?employeeId=EMP001&limit=20
GET /api/assets?employeeId=EMP001&status=assigned&limit=20
```

This ensures that even though all roles can access the Self-Service module, no user can view another employee's personal data through this interface. Cross-employee data access requires administrative modules with appropriate role-level permissions.

### 8.4 Admin-Specific Considerations

While the Self-Service module displays the same interface for all roles, users with administrative roles (Super Admin, HR Admin) have additional capabilities outside this module:

- **Policy Management**: Admin roles can create, update, and delete company policies through the `/api/policies` CRUD endpoints. These changes are immediately reflected in the Company Policies tab.
- **Employee Data Management**: Admin roles can modify employee records through the Employee Management module, which indirectly updates the data displayed in Self-Service.
- **Audit Logging**: All administrative actions (policy creation, employee updates) are logged in the AuditLog table and appear in the Dashboard's Recent Activities feed.

---

## 9. Business Rules

### 9.1 Profile Management Rules

| Rule ID | Rule Description | Enforcement Level |
|---------|-----------------|-------------------|
| BR-SS-001 | Employees can view but cannot modify their designation, department, job title, contract type, manager, or work mode. These fields are managed by HR Admin through the Employee Management module. | UI + API |
| BR-SS-002 | Employees can edit their contact information (email, phone) and location through the profile edit toggle. The employee ID, name, and join date are read-only. | UI |
| BR-SS-003 | Profile changes must be validated before saving. Email must follow a valid format, phone must follow the configured format (e.g., +91-XXXXXXXXXX), and location must be a non-empty string. | UI + API |
| BR-SS-004 | The employee status badge reflects the current employment status from the Employee record. It is not editable through Self-Service. | UI |

### 9.2 Leave Balance Rules

| Rule ID | Rule Description | Enforcement Level |
|---------|-----------------|-------------------|
| BR-SS-005 | Leave balances are computed from approved leave records only. Pending, rejected, and cancelled leaves do not count toward the used total. | Client computation |
| BR-SS-006 | Default leave allocations: Casual = 12 days/year, Sick = 10 days/year, Earned = 15 days/year, Maternity/Paternity = 26 days/year. These are configurable constants in the `leaveTypeConfig` object. | Client config |
| BR-SS-007 | If a leave type appears in the data but not in the configuration, a default allocation of 15 days is applied. | Client config |
| BR-SS-008 | Leave types not defined in `leaveTypeConfig` receive a default allocation of 15 | Client configuration |
| BR-SS-007 | Leave types found in the data but not in the `leaveTypeConfig` are assigned a default allocation of 15 days. | Client computation |
| BR-SS-008 | The total leave balance shown in the Welcome Banner is the sum of remaining days across all leave types. | Client computation |
| BR-SS-009 | Leave balances are a point-in-time snapshot based on the data fetched at component mount. They do not auto-refresh. | Architecture |

### 9.3 Payslip Rules

| Rule ID | Rule Description | Enforcement Level |
|---------|-----------------|-------------------|
| BR-SS-010 | Employees can only view their own payroll records. The API enforces employee ID filtering. | API |
| BR-SS-011 | Payslips are displayed for the most recent 10 payroll periods, sorted by creation date descending. | API + UI |
| BR-SS-012 | Currency amounts are formatted in Indian Rupees (INR) with Indian grouping conventions (lakhs/crores) and no decimal places. | UI formatting |
| BR-SS-013 | Payslip download functionality requires the payroll record to have a `status` of 'processed' or 'paid'. Draft payroll records are not downloadable. | Business logic |

### 9.4 Document Rules

| Rule ID | Rule Description | Enforcement Level |
|---------|-----------------|-------------------|
| BR-SS-014 | Employees can only view documents where the `accessLevel` permits employee access. Documents with 'hr-only' or 'manager-only' access levels are not returned by the API. | API |
| BR-SS-015 | Document uploads are not available through the Self-Service module. Documents are uploaded by HR Admin through the Document Management module. | UI |
| BR-SS-016 | The document list is limited to the 20 most recent documents for the employee. | API parameter |

### 9.5 Asset Rules

| Rule ID | Rule Description | Enforcement Level |
|---------|-----------------|-------------------|
| BR-SS-017 | Only assets with `status === 'assigned'` are displayed in the My Assets card. Returned, damaged, or disposed assets are excluded. | API parameter |
| BR-SS-018 | Employees cannot modify asset records through Self-Service. Asset assignments, returns, and status changes are managed by IT/Admin through the Asset Management module. | UI |
| BR-SS-019 | The asset list is limited to 20 items per employee. | API parameter |

### 9.6 Policy Rules

| Rule ID | Rule Description | Enforcement Level |
|---------|-----------------|-------------------|
| BR-SS-020 | All authenticated users can view all company policies. There are no role-based restrictions on policy visibility. | Architecture |
| BR-SS-021 | Policy creation, update, and deletion are restricted to admin roles (Super Admin, HR Admin). Regular employees can only read policies. | API (should be enforced by middleware) |
| BR-SS-022 | All policy write operations (create, update, delete) must create an AuditLog entry documenting the change. | API implementation |
| BR-SS-023 | Policy search is case-insensitive and searches both the `title` and `content` fields. | Client + API |
| BR-SS-024 | Policy filtering by category is performed client-side against the pre-fetched policy list (up to 50 records). | Client implementation |

### 9.7 AI Assistant Rules

| Rule ID | Rule Description | Enforcement Level |
|---------|-----------------|-------------------|
| BR-SS-025 | The AI Assistant does not have access to real-time employee-specific data (leave balances, payroll amounts, etc.). It provides general HR guidance based on its system prompt and training data. | Architecture |
| BR-SS-026 | When the AI cannot provide a definitive company-specific answer, it must recommend the user check with the HR department or the relevant section in the HRMS. | System prompt |
| BR-SS-027 | Conversation history is limited to the last 10 messages to manage token usage and API response times. | Client implementation |
| BR-SS-028 | Only one AI request can be in flight at a time. The `isTyping` state prevents duplicate submissions. | Client implementation |
| BR-SS-029 | Chat history is not persisted across sessions. Navigating away from the Self-Service module resets the conversation. | Architecture |
| BR-SS-030 | The AI Assistant must not provide legal, financial, or medical advice. Responses should be informational and direct users to appropriate professionals for specific advice. | System prompt |

---

## 10. Troubleshooting

### 10.1 Common Issues and Resolutions

#### Issue 1: Leave Balances Show Zero or Incorrect Values

**Symptoms:**
- Leave balance card shows "0 days" for all types
- Used days count does not match actual approved leaves
- "No leave data available" empty state is displayed

**Possible Causes:**
- No leave records exist for the employee in the database
- Leave records have a `status` other than 'approved' (e.g., 'pending', 'rejected')
- The `employeeId` parameter in the API call does not match the employee's actual ID
- The API endpoint returned an error that was not properly handled

**Resolution Steps:**
1. Verify that the `currentEmployeeId` matches the authenticated employee's ID in the Employee table.
2. Check the browser's Network tab for the `GET /api/leaves?employeeId={id}` request. Confirm it returns a 200 status with leave data.
3. If the API returns an empty array, verify that leave records exist in the database for this employee using a database query: `SELECT * FROM "Leave" WHERE "employeeId" = '{id}'`.
4. If leave records exist but the balance is still zero, check that the `status` field is 'approved' (lowercase). The balance computation only counts approved leaves.
5. Click the "Retry" button on the ErrorBanner, or navigate away and back to the Self-Service module to trigger a fresh data fetch.

#### Issue 2: Payslips Not Loading or Download Not Working

**Symptoms:**
- Recent Payslips card shows the loading skeleton indefinitely
- "No payslips available" empty state is displayed when payslips should exist
- Clicking the download button does not trigger a file download

**Possible Causes:**
- The `GET /api/payroll?employeeId={id}&limit=10` request is failing
- No payroll records have been created for this employee
- The download button handler is not yet implemented (current state)
- Network connectivity issues preventing the API call

**Resolution Steps:**
1. Check the browser's Network tab for the payroll API request. Verify the response status and payload.
2. If the API returns a 500 error, check the server logs for database connection issues or query errors.
3. If the API returns an empty records array, verify that payroll records exist: `SELECT * FROM "Payroll" WHERE "employeeId" = '{id}'`.
4. For download issues: The payslip download functionality is currently a placeholder. The download button is rendered but does not yet have a click handler wired to generate or retrieve the PDF. This is a known limitation to be addressed in a future sprint.

#### Issue 3: AI Assistant Returns Errors or No Response

**Symptoms:**
- Typing indicator appears but never resolves to a response
- Error message: "I apologize, but I encountered a technical issue. Please try again in a moment."
- Error message: "Failed to generate AI response" (HTTP 500 from API)
- Error message: "message is required" (HTTP 400 from API)

**Possible Causes:**
- The z-ai-web-dev-sdk credentials are missing, expired, or invalid
- The AI service endpoint is unreachable or experiencing downtime
- The request payload is malformed (missing `message` field)
- Network connectivity issues on the client side
- Token limit exceeded due to very long conversation history

**Resolution Steps:**
1. Verify that the z-ai-web-dev-sdk is properly configured with valid API credentials in the server environment.
2. Check the server console logs for the specific error thrown in the `catch` block of the `/api/ai-chat` route.
3. If the error is "message is required", ensure the client is sending a non-empty `message` field in the request body.
4. If the error is "Failed to generate AI response", the SDK initialization or completion call is failing. Check:
   - `ZAI.create()` is resolving successfully
   - `zai.chat.completions.create()` is receiving valid messages array
   - The API key has sufficient quota and is not rate-limited
5. Try refreshing the page and sending a simpler query to isolate whether the issue is with the specific query or the overall AI service.
6. If the issue persists, check the z-ai-web-dev-sdk documentation for service status and configuration requirements.

#### Issue 4: Company Policies Not Displaying or Search Not Working

**Symptoms:**
- Policy list is empty despite policies existing in the database
- Search input does not filter policies
- Category filter pills do not work
- Policy content does not expand when clicked

**Possible Causes:**
- The `GET /api/policies?limit=50` request is failing
- Policy records have null or empty `title` or `category` fields
- The search string contains special characters that interfere with the includes() comparison
- JavaScript error in the Collapsible component preventing expansion

**Resolution Steps:**
1. Check the Network tab for the policies API request. Verify the response status and data.
2. If the API returns policies but none are displayed, check that the `title` field is not null or empty for the policy records.
3. If search is not working, verify that the `policySearch` state is being updated on input change. Add a `console.log` to the `filteredPolicies` useMemo to confirm filtering logic.
4. If category filtering is not working, verify that the policy `category` values in the database exactly match the category strings in the `policyCategories` array (case-sensitive: 'Leave', 'Compliance', 'Work Policy', 'Finance', 'Security', 'HR').
5. If policies don't expand, check the browser console for JavaScript errors related to the Collapsible component. Ensure the `@radix-ui/react-collapsible` package is properly installed.

#### Issue 5: Profile Edit Mode Not Working

**Symptoms:**
- Clicking the "Edit" button changes the label to "Save" but fields remain read-only
- Clicking "Save" does not persist any changes
- Profile data reverts to original values after refreshing

**Possible Causes:**
- The profile edit functionality is partially implemented (toggle state only, no editable fields)
- The `PATCH /api/employees/{id}` endpoint is not being called
- API validation rejects the updated values

**Resolution Steps:**
1. The current implementation toggles the `isEditing` state and the button label, but does not transform the display fields into editable input fields. This is a known limitation.
2. To fully implement profile editing, the following changes are needed:
   - Convert the display-only field values into controlled input fields when `isEditing === true`
   - Add local state to track modified field values
   - Implement a `PATCH /api/employees/{id}` API call on "Save" click
   - Add form validation for email, phone, and other editable fields
   - Display success/error toast notifications after the save operation
3. In the interim, employees should contact HR Admin to update their profile information through the Employee Management module.

#### Issue 6: Page Loading Slowly or Data Not Refreshing

**Symptoms:**
- Welcome Banner shows skeleton placeholders for an extended period
- Leave balance and payslip data appear stale after changes made in other modules
- The page takes more than 5 seconds to become fully interactive

**Possible Causes:**
- Five parallel API requests on component mount are slow due to database query performance
- No automatic data refresh mechanism (data is fetched once on mount)
- Network latency or server load issues

**Resolution Steps:**
1. Check the Network tab for the timing of each API request. Identify which endpoint is slowest.
2. If a specific endpoint is slow (e.g., `/api/leaves`), check the database query performance. Ensure appropriate indexes exist on the `employeeId` and `status` columns.
3. To refresh stale data, navigate away from the Self-Service module and navigate back. This triggers a component remount and fresh API calls.
4. Each data section has an independent "Retry" button on its ErrorBanner. If only one section fails, click its specific retry button rather than refreshing the entire page.
5. Consider implementing a manual "Refresh" button or pull-to-refresh gesture in future iterations to improve the user experience for data staleness.

### 10.2 Error Code Reference

| HTTP Status | Error Message | Cause | Resolution |
|:-----------:|--------------|-------|------------|
| 400 | `message is required` | AI chat request missing the `message` field | Ensure the client sends a non-empty message in the request body |
| 400 | `Policy title is required` | Policy creation request missing the `title` field | Provide a title when creating a policy |
| 400 | `Policy id is required` | Policy update/delete request missing the `id` field | Provide the policy ID for update/delete operations |
| 404 | `Policy not found` | No policy exists with the specified ID | Verify the policy ID and retry |
| 500 | `Failed to fetch policies` | Database error when querying CompanyPolicy table | Check database connectivity and table integrity |
| 500 | `Failed to create policy` | Database error when inserting a new policy | Check database connectivity and field constraints |
| 500 | `Failed to update policy` | Database error when updating a policy | Check database connectivity and field constraints |
| 500 | `Failed to delete policy` | Database error when deleting a policy | Check for foreign key constraints or database connectivity |
| 500 | `Failed to generate AI response` | z-ai-web-dev-sdk error or configuration issue | Verify SDK credentials and service availability |
| 500 | `Failed to fetch leaves` | Database error when querying Leave table | Check database connectivity and query parameters |
| 500 | `Failed to fetch payroll records` | Database error when querying Payroll table | Check database connectivity and query parameters |
| 500 | `Failed to fetch documents` | Database error when querying Document table | Check database connectivity and query parameters |
| 500 | `Failed to fetch assets` | Database error when querying Asset table | Check database connectivity and query parameters |

### 10.3 Support Escalation

For issues that cannot be resolved using the troubleshooting steps above, escalate according to the following matrix:

| Issue Category | First Escalation | Second Escalation | Expected Response Time |
|---------------|-----------------|-------------------|----------------------|
| Data display issues (missing/incorrect data) | HR Admin | IT Support | 4 business hours |
| AI Assistant errors | IT Support | z-ai-web-dev-sdk vendor | 8 business hours |
| Profile edit functionality | IT Support | Development team | 2 business days |
| Policy content accuracy | HR Admin | Legal/Compliance | 5 business days |
| Payroll amount discrepancies | Payroll Specialist | Finance team | 24 business hours |
| Asset assignment issues | IT Support | Asset Management team | 2 business days |
| Document access/visibility | HR Admin | IT Support | 8 business hours |
| Performance/loading issues | IT Support | Development team | 1 business day |

---

*Document maintained by the AI-HRMS Development Team. For questions or updates, contact the HR Technology department.*
