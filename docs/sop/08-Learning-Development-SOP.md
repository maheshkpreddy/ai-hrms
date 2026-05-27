# Standard Operating Procedure: Learning & Development Module

**Document ID:** SOP-HRMS-08  
**Module Key:** `learning`  
**Version:** 1.0  
**Last Updated:** 2025-03-04  
**Classification:** Internal — HR Operations  

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [Course Enrollment Lifecycle](#5-course-enrollment-lifecycle)
6. [Skill Proficiency Framework](#6-skill-proficiency-framework)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Role-Based Access](#8-role-based-access)
9. [Business Rules](#9-business-rules)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The Learning & Development (L&D) module serves as the central hub for workforce skill development, training management, and competency tracking within the AI-HRMS application. It provides a comprehensive system for managing course catalogs, tracking employee enrollments, monitoring learning progress, and maintaining an organization-wide skill inventory. The module bridges the gap between organizational competency requirements and employee development by offering AI-powered course recommendations that target individual skill gaps, ensuring that training investments are directed where they deliver the highest impact.

This module is designed to support the entire training lifecycle — from course creation and catalog management through employee enrollment, progress tracking, and completion certification. It enables L&D managers and HR administrators to make data-driven decisions about training investments by providing visibility into skill gap analyses, enrollment metrics, completion rates, and proficiency distributions across the organization. The integrated skill inventory ensures that every skill in the organization is catalogued, categorized, and mapped to employees with measurable proficiency levels, creating a living competency matrix that feeds into performance reviews, succession planning, and talent acquisition strategies.

### 1.2 Scope

This SOP covers all operations related to learning and development data management within the AI-HRMS application, including:

- Course catalog creation, editing, viewing, and deletion
- Employee enrollment in courses and enrollment lifecycle management
- Course progress tracking, score recording, and completion certification
- Skill catalog CRUD operations (create, read, update, delete)
- Employee-skill assignments with proficiency levels and certification status
- AI-powered course recommendations based on skill gap analysis
- Skill gap radar chart visualization and department-level skill mapping
- Learning path visualization and certificate generation
- Dual API mode handling for courses and enrollments through a shared endpoint

Out of scope: Content delivery or learning management system (LMS) functionality such as video playback, quiz engines, or SCORM compliance. The module manages course metadata and enrollment records, not the actual course delivery experience. External course content is accessed via provider URLs.

### 1.3 Target Users

| User Role | Description |
|---|---|
| **Super Admin** | Full system access — can create, edit, and delete courses and skills, enroll any employee, manage all enrollment records, and configure AI recommendation parameters. Has unrestricted access across the entire L&D module. |
| **HR Admin** | Primary operator of this module — responsible for creating training programs, managing course catalogs, enrolling employees in mandatory training, tracking completion rates, and maintaining the skill inventory. Has full read/write access to all L&D data. |
| **L&D Manager** | Specialized role focused on learning operations — manages course catalogs and enrollment programs, runs skill gap analyses, reviews AI recommendations, assigns skills to employees, and generates training reports. Has full access to course and enrollment management, with read access to skill data. |

### 1.4 AI Capabilities

The Learning & Development module features an AI-enhanced recommendation engine that analyzes employee skill profiles, performance review data, and organizational competency requirements to generate personalized course suggestions. The AI system performs the following functions:

- **Skill Gap Identification:** Compares an employee's current skill proficiency levels against the target proficiency required for their role, identifying specific gaps that training can address.
- **Course Matching:** Maps identified skill gaps to courses in the catalog whose `skills` JSON field contains the relevant skill names, ranking recommendations by relevance and expected impact.
- **Learning Path Generation:** Automatically assembles a sequenced learning path from completed courses, in-progress enrollments, and upcoming recommendations, ensuring prerequisites are satisfied before advanced courses are suggested.
- **Department-Level Analysis:** Aggregates skill data across departments to identify organizational-level competency shortages and recommend group training programs.

The module displays an "AI Enhanced" badge with a Sparkles icon in the header, and the Course Catalog tab features a prominent AI-Powered Recommendations banner with a "Get Recommendations" action button.

### 1.5 Technical Reference

| Property | Value |
|---|---|
| **Component** | `src/components/hrms/LearningDevelopment.tsx` |
| **API — Courses** | `GET/POST/PATCH/DELETE /api/courses` |
| **API — Skills** | `GET/POST/PATCH/DELETE /api/skills` |
| **Prisma Model — Course** | 8 fields + enrollment relation |
| **Prisma Model — CourseEnrollment** | 8 fields + employee & course relations |
| **Prisma Model — Skill** | 5 fields + employeeSkill relation |
| **Prisma Model — EmployeeSkill** | 7 fields + employee & skill relations |
| **Database** | PostgreSQL via Prisma ORM |
| **Charting** | Recharts (RadarChart for skill gap analysis) |

---

## 2. Access & Navigation

### 2.1 Accessing the Module from the Sidebar

The Learning & Development module is accessed through the main navigation sidebar of the AI-HRMS application. The sidebar is present on every page and provides persistent navigation across all modules. Follow these steps to navigate to the Learning & Development screen:

1. **Locate the Sidebar:** On desktop viewports (768px and above), the sidebar is fixed on the left side of the screen. On mobile viewports (below 768px), tap the hamburger menu icon (≡) in the top-left corner to open the sidebar as a slide-out drawer.

2. **Identify the Module:** In the sidebar navigation list, find the item labeled **"Learning & Dev"** with a GraduationCap (or BookOpen) icon. This module carries an "AI" badge indicator in the sidebar, signifying its AI-powered recommendation capabilities.

3. **Click to Navigate:** Click or tap the "Learning & Dev" item. The sidebar highlights the active module with an emerald-colored left indicator bar and a tinted background. The main content area transitions to display the Learning & Development screen.

4. **Collapsed Sidebar:** If the sidebar is in its collapsed state (showing only icons), hover over the GraduationCap icon to reveal a tooltip labeled "Learning & Dev," then click to navigate. To expand the sidebar, click the expand button (chevron-right icon) on the sidebar's right edge.

### 2.2 Module Header

Upon entering the module, the screen header displays:

- **Module Title:** "Learning & Development" as a large heading (2xl/3xl responsive)
- **Subtitle:** "AI-powered skill development & training management"
- **AI Enhanced Badge:** A secondary badge with a Sparkles icon and "AI Enhanced" text, styled with emerald colors (emerald-100 background, emerald-700 text in light mode; emerald-950 background, emerald-400 text in dark mode)

### 2.3 Tab Navigation

The module content is organized into three primary tabs, controlled by a `Tabs` component:

| Tab | Icon | Label (Desktop) | Label (Mobile) | Description |
|---|---|---|---|---|
| **Course Catalog** | BookOpen | "Course Catalog" | "Catalog" | Browse, search, filter, and enroll in courses |
| **My Learning** | GraduationCap | "My Learning" | "Learning" | Track enrollments, progress, learning paths, and certificates |
| **Skill Inventory** | Target | "Skill Inventory" | "Skills" | Manage skill catalog and view skill gap analysis |

The tabs list is full-width on mobile and auto-width on desktop, with each tab trigger including a gap and icon prefix for visual clarity.

### 2.4 Direct URL Access

Authenticated users with the appropriate role can also access the module directly. The module renders as the primary content view when the `activeModule` state in the global Zustand store is set to `"learning"`.

---

## 3. Screen Descriptions

### 3.1 Course Catalog Tab

The Course Catalog tab is the default landing view of the Learning & Development module. It provides a comprehensive, filterable, and searchable grid of all available courses in the system.

**AI-Powered Recommendations Banner:**

Positioned at the top of the Course Catalog tab, this banner features a gradient background (emerald-50 to teal-50 in light mode, emerald-950/40 to teal-950/40 in dark mode) with rounded-xl borders. It displays:
- A Sparkles icon inside an emerald-styled container
- A heading: "AI-Powered Recommendations"
- A description: "AI recommends courses based on your role and performance gaps"
- A "Get Recommendations" button (emerald, with Zap icon, right-aligned on desktop)

**Search & Filters Bar:**

Below the recommendation banner, a search and filter bar provides four controls:

| Control | Type | Behavior |
|---|---|---|
| **Search Input** | Text input with Search icon | Client-side filtering across course title, description, and associated skill names. Case-insensitive partial matching. |
| **Category Filter** | Select dropdown with Filter icon | Dynamically populated from distinct categories in the course catalog. Options include "All Categories" plus all unique category values (Engineering, Data Science, Management, Marketing, Finance, Soft Skills). Client-side filtering. |
| **Provider Filter** | Select dropdown | Dynamically populated from distinct providers in the course catalog. Options include "All Providers" plus all unique provider values (Udemy, Coursera, LinkedIn Learning, A Cloud Guru, HubSpot Academy). Client-side filtering. |
| **Duration Filter** | Select dropdown with Clock icon | Fixed options: "Any Duration," "Short (≤ 15h)," "Medium (16–30h)," "Long (> 30h)." Client-side filtering based on course `duration` field. |

All filters and the search query are applied in combination using AND logic.

**Add Course Button:**

An "Add Course" button (outline variant with Plus icon) appears right-aligned below the filters. This button is visible to users with course creation permissions (Super Admin, HR Admin, L&D Manager). Clicking it opens the Create New Course dialog.

**Course Cards Grid:**

Courses are displayed in a responsive grid layout: 1 column on mobile, 2 columns on `sm` (640px+), and 3 columns on `lg` (1024px+). Each course card contains:

- **Header:** BookOpen icon in an emerald container + course title (semibold) + description (line-clamped to 2 lines, with "No description available" fallback)
- **Category & Level Badges:** Category badge with category-specific color mapping (Engineering = emerald, Data Science = teal, Management = amber, Marketing = pink, Finance = cyan, Soft Skills = purple) + difficulty level badge derived from duration (≤15h = Beginner, 16-30h = Intermediate, >30h = Advanced, null = "All Levels")
- **Meta Info:** Duration in hours (Clock icon) + enrollment count (Users icon, e.g., "3 enrolled")
- **Provider:** Text displaying "by {provider}" if a provider is specified
- **Completion Rate:** A Progress bar with percentage label, derived heuristically from enrollment count (0 enrollments = 0%, <10 = 90%, <20 = 78%, <30 = 70%, <40 = 65%, ≥40 = 60%)
- **Skills Tags:** Outline badges for each skill parsed from the course's JSON `skills` field (comma-separated skill names)
- **Enroll Button:** Full-width emerald button with Play icon and "Enroll Now" text. Shows a spinner with "Enrolling..." during enrollment. Disabled when no employee context is available.

**Loading State:** While courses are being fetched, 6 CardSkeleton placeholders are displayed in the grid layout. Each skeleton shows animated placeholders for the icon, title, description, badges, progress bar, skills, and button.

**Error State:** If the API call fails, a centered error message displays with an AlertCircle icon, "Failed to load courses" heading, the error message text, and a "Try Again" button that triggers a data refetch.

**Empty State:** When no courses match the current search/filter criteria, a centered empty state displays with a faded BookOpen icon, "No courses found" heading, and "Try adjusting your search or filters" hint.

### 3.2 Create New Course Dialog

Clicking the "Add Course" button opens a modal Dialog (max-width: `sm:max-w-lg`) titled "Create New Course." The dialog contains the following form fields:

| Field | Type | Required | Placeholder | Notes |
|---|---|---|---|---|
| **Title** | Text Input | Yes (*) | "Course title" | Must not be empty; validated before submission |
| **Description** | Textarea (3 rows) | No | "Course description" | Optional; sent as `undefined` if empty |
| **Category** | Text Input | No | "e.g. Engineering" | Free-text input; not a dropdown |
| **Duration (hours)** | Number Input | No | "e.g. 20" | Parsed as integer; optional |
| **Provider** | Text Input | No | "e.g. Coursera" | Free-text input for course provider name |
| **Skills** | Text Input | No | "e.g. React, TypeScript, Node.js" | Comma-separated values; converted to JSON array on submit |

**Dialog Footer:**
- **Cancel** button (outline variant) — closes the dialog without saving
- **Create Course** button (emerald variant) — validates title, submits the form, and on success closes the dialog and refreshes the course catalog

**Submission Logic:** The `handleCreateCourse` function validates that the title is non-empty, then sends a `POST /api/courses` request with the `title` field present, triggering the course creation branch of the dual-mode API. Skills are serialized as `JSON.stringify(skills.split(',').map(s => s.trim()))`. On error, an action error banner appears at the top of the module.

### 3.3 My Learning Tab

The My Learning tab provides a personal dashboard for tracking an employee's learning progress, active courses, completed certifications, and learning path. The employee context is derived by fetching the first employee from `/api/employees?limit=1` (the current user's employee record).

**Learning Progress Dashboard:**

Four stat cards are displayed in a responsive grid (2 columns on mobile, 4 columns on `lg`):

| Stat Card | Icon | Icon Background | Value Source |
|---|---|---|---|
| **Courses Enrolled** | BookOpen | emerald | Total count of all enrollments |
| **In Progress** | Play | amber | Count of enrollments with status "enrolled" or "in-progress" |
| **Completed** | CheckCircle2 | teal | Count of enrollments with status "completed" |
| **Avg Score** | Target | purple | Average of `score` values from completed enrollments; "N/A" if no completed courses with scores |

Each stat card features a bottom gradient accent line (emerald-500 to transparent) and displays the value in large bold text (2xl/3xl responsive).

**Active Courses Section:**

A Card titled "Active Courses" lists all enrollments with status "enrolled" or "in-progress." Each active course entry displays:
- Course title and category badge
- Enrollment status badge (color-coded: enrolled = amber, in-progress = emerald)
- Progress bar showing completion percentage (0-100)
- Score display (if available)
- Relative time since last update

**Learning Path Section:**

A Card titled "Your Learning Path" displays a vertical timeline visualization:
- **Completed items:** Marked with a green checkmark, showing course title and completion date
- **In-progress items:** Marked with an amber play icon, showing course title and current progress
- **Upcoming items:** Marked with a gray chevron, showing recommended courses not yet enrolled (up to 3 from the catalog)
- Items are ordered: completed → in-progress → upcoming

**Certificates Section:**

A Card titled "Certificates" displays certificates earned from completed courses. Each certificate card shows:
- Course title with Award icon
- Certificate ID (format: `CERT-{year}-{last6charsOfEnrollmentId}`)
- Issue date (from `completedAt` or `updatedAt`)
- Provider name

If no certificates exist, an empty state displays with an Award icon and "No certificates yet" message.

### 3.4 Skill Inventory Tab

The Skill Inventory tab provides a comprehensive view of the organization's skill catalog, employee-skill assignments, and skill gap analysis.

**Skill Search:**

A search input at the top of the tab allows filtering skills by name or category using case-insensitive partial matching. This operates entirely client-side on the already-fetched skills list.

**Skill Gap Analysis (Radar Chart):**

A prominent Card titled "Skill Gap Analysis" contains a RadarChart (from Recharts) visualizing the gap between required and available skill levels across the top 8 skills (sorted by employee-skill count). The chart features:
- **PolarGrid** and **PolarAngleAxis** displaying skill names
- **PolarRadiusAxis** with angle=18 for readability
- Two **Radar** areas: "Required" (emerald fill, 0.2 opacity) and "Available" (amber fill, 0.2 opacity)
- **Tooltip** with custom styling matching the application's popover theme
- **Legend** positioned at the bottom
- Custom tooltip style with rounded borders and shadow

The "Required" values are computed as heuristic targets (60-95 range), while "Available" values are derived from the number of employees possessing each skill relative to a 50-employee baseline. Both values are bounded (minimum 10 for available, maximum 95 for required).

**Top Skills by Department:**

Below the radar chart, a section groups skills by their category and maps categories to department-like names using an internal mapping:

| Skill Category | Mapped Department |
|---|---|
| Frontend, Backend, Cloud, DevOps, Security | Engineering |
| Data Science | Data Science |
| Analytics | Analytics |
| Management, Soft Skills | Operations |
| Finance | Finance |
| Marketing | Marketing |

Each department group displays up to 4 top skills as outline badges. Departments with no skills are filtered out.

**Skill Catalog List:**

The complete skill catalog is displayed as a searchable, scrollable list. Each skill entry shows:
- Skill name with a colored indicator dot (Advanced = emerald, Intermediate = amber, Beginner = rose)
- Category badge
- Employee count (how many employees have this skill assigned)
- Proficiency level derived from employee count (≥20 employees = Advanced, ≥10 = Intermediate, <10 = Beginner)

**Loading State:** StatSkeleton and ListSkeleton components display during data fetching. The StatSkeleton shows animated placeholders for the stat cards, while the ListSkeleton shows 3 list-item placeholders with icon, text, and progress bar skeletons.

**Error State:** If skills data fails to load, a centered error message displays with an AlertCircle icon, "Failed to load skills" heading, the error text, and a "Try Again" button.

---

## 4. Functional Workflows

### 4.1 Creating a New Course

**Pre-conditions:** User must have Super Admin, HR Admin, or L&D Manager role. The Course Catalog tab must be loaded.

**Steps:**

1. Navigate to the **Course Catalog** tab (default tab on module load).
2. Click the **"Add Course"** button (outline variant, Plus icon) positioned right-aligned below the filter bar.
3. The **Create New Course** dialog opens.
4. Fill in the course form:
   - **Title** (required): Enter the course title. This field must not be empty — the system validates this before submission and displays "Course title is required" as an inline error if left blank.
   - **Description** (optional): Enter a detailed description of the course content and learning objectives.
   - **Category** (optional): Enter a category name (e.g., "Engineering", "Data Science", "Management"). This is a free-text field, not a dropdown — new categories can be created by entering a new value.
   - **Duration (hours)** (optional): Enter the estimated course duration in hours as a number.
   - **Provider** (optional): Enter the course provider or platform name (e.g., "Coursera", "Udemy", "LinkedIn Learning").
   - **Skills** (optional): Enter comma-separated skill names that the course covers (e.g., "React, TypeScript, Node.js"). These are serialized as a JSON array on submission.
5. Click **"Create Course"** to submit.
6. **Processing:** The system sends a `POST /api/courses` request with the `title` field present, which triggers the course creation branch of the dual-mode API (since `title` is provided and `employeeId` is not).
7. **API Logic:** The server creates a Course record with all provided fields. The `skills` field is stored as a JSON string. An audit log entry is created with action "create", module "learning", and details "New course created: {title}".
8. **On Success:** The dialog closes, the form resets to blank values, the course catalog refreshes to include the new course, and the new course appears in the grid (filtered by current search/filter if applicable).
9. **On Error:** An action error banner appears at the top of the module with a rose-colored background, AlertCircle icon, and the error message. Click the X button to dismiss the error.

**Post-conditions:** A new Course record exists in the database. The course is immediately visible in the catalog. An audit log entry records the creation event.

### 4.2 Enrolling an Employee in a Course

**Pre-conditions:** User must have Super Admin, HR Admin, or L&D Manager role. The Course Catalog tab must be loaded. An employee context must be available (fetched from `/api/employees?limit=1`).

**Steps:**

1. Navigate to the **Course Catalog** tab.
2. Browse or search for the desired course using the search bar and filters.
3. Locate the course card in the grid.
4. Click the **"Enroll Now"** button (emerald, Play icon) on the course card.
5. **Processing:** The button transitions to a loading state showing a spinner and "Enrolling..." text. The system sends a `POST /api/courses` request with `employeeId` and `courseId` in the body, which triggers the enrollment branch of the dual-mode API (since `employeeId + courseId` are provided and `title` is not).
6. **API Logic:**
   - The server checks for an existing enrollment with the same `employeeId` and `courseId`. If found, returns a 409 Conflict error: "Employee is already enrolled in this course."
   - Verifies that the employee exists (404 if not found).
   - Verifies that the course exists (404 if not found).
   - Creates a CourseEnrollment record with `status: "enrolled"`, `progress: 0`, and `score: null`.
   - Creates an audit log entry with action "create", module "learning", and details "{employeeName} enrolled in course: {courseTitle}".
7. **On Success:** The enrollment list and course catalog are both refreshed. The course card's enrollment count increments by one. The enrollment appears in the "My Learning" tab under "Active Courses."
8. **On Error:** The action error banner displays the error message (e.g., "Employee is already enrolled in this course"). The enroll button returns to its normal state.

**Important Notes:**
- The "Enroll Now" button is disabled when no employee context is available (`currentEmployeeId` is empty). This prevents orphaned enrollments.
- The dual-mode API uses the presence of `employeeId + courseId` (without `title`) to distinguish enrollment creation from course creation.
- Each employee can only be enrolled in a specific course once. Duplicate enrollment attempts are rejected with a 409 status.

### 4.3 Tracking Course Progress

**Pre-conditions:** An employee must have at least one active enrollment (status "enrolled" or "in-progress"). The My Learning tab must be loaded.

**Steps:**

1. Navigate to the **My Learning** tab.
2. The **Learning Progress Dashboard** at the top shows aggregate metrics: Courses Enrolled, In Progress, Completed, and Average Score.
3. Scroll to the **Active Courses** section to see individual enrollment details.
4. Each active enrollment displays:
   - Course title and category
   - Current status badge (enrolled/in-progress)
   - Progress bar showing the completion percentage (0-100)
   - Score (if a score has been recorded)
   - Relative time since the last update

5. **Updating Progress** (via API): To update an enrollment's progress, send a `PATCH /api/courses` request with:
   ```json
   {
     "enrollmentId": "clx...",
     "progress": 65,
     "status": "in-progress"
   }
   ```
   The API validates the enrollment exists, clamps progress to 0-100, and updates the record. If status is set to "completed", the `completedAt` field is automatically set to the current date. An audit log entry is created.

6. **Marking as Completed:** Send a `PATCH /api/courses` request with:
   ```json
   {
     "enrollmentId": "clx...",
     "status": "completed",
     "progress": 100,
     "score": 92
   }
   ```
   This sets the status to "completed," progress to 100, records the score, and sets `completedAt`. The enrollment moves from "Active Courses" to "Certificates" in the My Learning tab.

7. **Dropping a Course:** Send a `PATCH /api/courses` request with:
   ```json
   {
     "enrollmentId": "clx...",
     "status": "dropped"
   }
   ```
   The enrollment status changes to "dropped" and the course no longer appears in the active courses list.

**Post-conditions:** Enrollment progress, status, and score are updated. The My Learning dashboard metrics recalculate. An audit log entry records the update.

### 4.4 Managing the Skill Catalog

**Pre-conditions:** User must have Super Admin or HR Admin role for write operations. Any authenticated user can view skills.

**Listing Skills:**

1. Navigate to the **Skill Inventory** tab.
2. Skills are loaded automatically via `GET /api/skills?limit=100`.
3. The skill data populates the skill gap radar chart, department groupings, and the skill catalog list.
4. Skills can be searched using the skill search input (client-side filtering by name or category).

**Creating a Skill:**

1. Send a `POST /api/skills` request with:
   ```json
   {
     "name": "GraphQL",
     "category": "Backend",
     "description": "Query language for APIs"
   }
   ```
2. The API validates that `name` is provided (400 if missing) and unique (409 Conflict if a skill with the same name already exists).
3. On success, the skill is created with an auto-generated CUID, and an audit log entry is generated with action "create", module "hr", and details "Created skill: GraphQL (Category: Backend)".
4. The new skill appears in the Skill Inventory after a data refresh.

**Updating a Skill:**

1. Send a `PATCH /api/skills` request with:
   ```json
   {
     "id": "clx...",
     "name": "GraphQL & Relay",
     "description": "Query language and client for APIs"
   }
   ```
2. Only include fields that need to be updated. Omitted fields remain unchanged.
3. If changing the name, the API validates that the new name doesn't conflict with existing skills (409 if duplicate).
4. On success, an audit log entry is generated.

**Deleting a Skill:**

1. Send a `DELETE /api/skills?id={id}` request.
2. The API validates the skill exists (404 if not found).
3. **Critical Check:** If the skill has any associated EmployeeSkill records (employees assigned this skill), the API returns a 409 Conflict error: "Cannot delete skill assigned to employees. Remove employee associations first."
4. All EmployeeSkill associations for the skill must be removed before the skill can be deleted.
5. On success, an audit log entry is generated with action "delete", module "hr", and details "Deleted skill: {name}".

### 4.5 Assigning Skills to Employees

**Pre-conditions:** User must have Super Admin or HR Admin role. The skill must exist in the catalog. The employee must exist in the system.

**Steps:**

1. Send a `POST /api/skills` request with the skill assignment data. The skills API endpoint supports dual mode: if `employeeId` is provided in a GET request, it returns employee-specific skill assignments.
2. To assign a skill to an employee, use the skills API in assignment mode by sending a `POST /api/skills` request with employee context, or manage EmployeeSkill records directly through the employee management API.
3. Each EmployeeSkill record includes:
   - `employeeId`: Reference to the employee
   - `skillId`: Reference to the skill
   - `proficiency`: One of "beginner", "intermediate", "advanced", or "expert"
   - `certified`: Boolean flag indicating whether the employee holds a formal certification for this skill

4. **Viewing Employee Skills:** Send a `GET /api/skills?employeeId={id}` request. The API returns all EmployeeSkill records for that employee, including the related Skill details and Employee information (first name, last name, employee ID, department, avatar).

5. **Proficiency Assignment Guidelines:**
   - **beginner:** Employee has introductory knowledge; less than 6 months of experience
   - **intermediate:** Employee can work independently; 6 months to 2 years of experience
   - **advanced:** Employee can mentor others; 2-5 years of experience
   - **expert:** Employee is a recognized authority; 5+ years of experience or formal certification

6. **Certification Flag:** Set `certified: true` when the employee holds a vendor certification (e.g., AWS Solutions Architect, PMP, CKA) or has passed a formal assessment. This flag is used in analytics and compliance reporting.

**Post-conditions:** The EmployeeSkill record is created. The skill appears in the employee's skill profile. The Skill Inventory's employee count for the skill increments. The skill gap analysis recalculates.

### 4.6 Using AI Recommendations

**Pre-conditions:** The Course Catalog tab must be loaded. The AI recommendation system requires both skill data and course data to be available.

**Steps:**

1. Navigate to the **Course Catalog** tab.
2. Observe the **AI-Powered Recommendations** banner at the top of the tab.
3. Click the **"Get Recommendations"** button (emerald, Zap icon).
4. **AI Processing:** The recommendation engine analyzes:
   - The current employee's skill profile (from EmployeeSkill records)
   - Skill proficiency levels compared to role-based targets
   - Performance review data (from the Performance module)
   - Available courses whose `skills` JSON field matches identified skill gaps
   - Courses already completed or in-progress (to avoid duplicate recommendations)

5. **Recommendation Output:** The system presents a ranked list of courses, prioritized by:
   - Direct match between course skills and the employee's skill gaps
   - Difficulty level appropriate for the employee's current proficiency
   - Courses that serve as prerequisites for advanced skills the employee needs
   - Organizational priority skills (skills with the largest gap between required and available levels)

6. **Action:** Employees can directly enroll in recommended courses using the "Enroll Now" button on each course card.

**Skill Gap Visualization:** The Skill Inventory tab's radar chart provides a visual representation of skill gaps across the top 8 organizational skills, showing the delta between required proficiency levels and current available proficiency. This chart helps L&D managers identify which skills need the most training investment.

**Learning Path Generation:** The My Learning tab automatically generates a learning path that sequences:
1. Completed courses (as milestones achieved)
2. In-progress courses (as current focus areas)
3. Upcoming recommended courses (up to 3, as future development targets)

This path ensures employees have a clear development trajectory from their current skill level to their target competency profile.

---

## 5. Course Enrollment Lifecycle

The Course Enrollment lifecycle defines the complete journey of an employee's participation in a learning course, from initial enrollment through to completion or withdrawal. Understanding this lifecycle is critical for L&D managers tracking training effectiveness and for employees managing their development plans.

### 5.1 Status Definitions

| Status | Description | Color Code | Display Behavior |
|---|---|---|---|
| **enrolled** | Initial state when an employee signs up for a course. The employee has committed to taking the course but has not yet started. Progress is 0. | Amber | Shown in Active Courses with "enrolled" badge |
| **in-progress** | The employee has actively started the course material. Progress is greater than 0 but less than 100. The employee is consuming course content. | Emerald | Shown in Active Courses with "in-progress" badge and progress bar |
| **completed** | The employee has finished the course. Progress is 100. A score may be recorded. The `completedAt` date is set. A certificate is generated. | Teal/Green | Moved to Certificates section; removed from Active Courses |
| **dropped** | The employee has withdrawn from the course before completion. The enrollment is no longer active. Progress and score are preserved as-is for record-keeping. | Rose/Red | Removed from Active Courses; visible only in enrollment history |

### 5.2 State Transitions

```
                    ┌──────────────────────────┐
                    │      No Enrollment        │
                    │   (Employee not in course) │
                    └──────────┬───────────────┘
                               │
                    POST /api/courses {employeeId, courseId}
                               │
                               ▼
                    ┌──────────────────────────┐
               ┌───►│        enrolled           │
               │    │  progress: 0, score: null │
               │    └──────────┬───────────────┘
               │               │
               │    PATCH {enrollmentId, status: "in-progress"}
               │               │
               │               ▼
               │    ┌──────────────────────────┐
               │    │      in-progress          │
               │    │  progress: 1-99           │
               │    └──────┬──────────┬────────┘
               │           │          │
               │    PATCH {status:    PATCH {status:
               │    "completed"}      "dropped"}
               │           │          │
               │           ▼          ▼
               │    ┌────────────┐  ┌────────────┐
               │    │  completed │  │   dropped   │
               │    │ progress:100│  │ (preserved) │
               │    │ score: N   │  │             │
               │    │ completedAt│  └────────────┘
               │    └────────────┘
               │
               │  (Re-enrollment not allowed —
               │   409 Conflict on duplicate)
               │
               └─────────────────────────────────
```

### 5.3 Transition Rules

1. **enrolled → in-progress:** Triggered when the employee begins course material. The API accepts a PATCH with `status: "in-progress"` and optionally an initial `progress` value. This is a manual state change typically initiated by the employee or an L&D administrator.

2. **in-progress → completed:** Triggered when the employee finishes the course. The API requires `status: "completed"` and typically includes `progress: 100` and a `score` value. The server automatically sets `completedAt` to the current date when status transitions to "completed."

3. **in-progress → dropped:** Triggered when the employee withdraws. The API accepts `status: "dropped"`. Progress and score values are preserved as-is for historical reference.

4. **enrolled → dropped:** An employee can drop a course even before starting it. This follows the same PATCH workflow.

5. **No reverse transitions:** Once an enrollment is "completed" or "dropped," it cannot be moved back to "enrolled" or "in-progress." If an employee needs to retake a course, the previous enrollment record must be deleted first (via `DELETE /api/courses?enrollmentId={id}`), and a new enrollment must be created.

6. **Duplicate prevention:** The API enforces uniqueness on the `(employeeId, courseId)` pair. Attempting to create a second enrollment for the same employee-course combination returns a 409 Conflict error.

### 5.4 Automatic Completions

When a PATCH request sets `status: "completed"`, the server automatically:
- Sets `completedAt` to the current date (ISO format, date portion only)
- Creates an audit log entry with the completion details
- The My Learning tab generates a certificate with ID format `CERT-{year}-{last6charsOfEnrollmentId}`

---

## 6. Skill Proficiency Framework

The Skill Proficiency Framework defines the standardized proficiency levels used across the AI-HRMS application for measuring and comparing employee competencies. This framework applies to every skill in the catalog and provides a consistent language for skill assessment, development planning, and organizational capability analysis.

### 6.1 Proficiency Levels

| Level | Numeric Range | Description | Typical Experience | Color Code |
|---|---|---|---|---|
| **beginner** | 1 | Has foundational awareness of the skill. Can perform basic tasks with guidance and supervision. Requires structured learning and mentoring to develop competency. | 0-6 months | Rose (rose-400) |
| **intermediate** | 2 | Can apply the skill independently in standard scenarios. Understands core concepts and best practices. May need guidance for complex or edge-case situations. | 6 months - 2 years | Amber (amber-500) |
| **advanced** | 3 | Demonstrates deep expertise and can handle complex scenarios. Can mentor junior team members, design solutions, and make architectural decisions involving this skill. | 2-5 years | Emerald (emerald-500) |
| **expert** | 4 | Recognized authority in this skill area. Sets organizational standards, evaluates new approaches, leads training programs, and provides strategic direction. Often holds formal certifications. | 5+ years or certification | Emerald (emerald-600) |

### 6.2 Proficiency Assessment Criteria

When assigning a proficiency level to an employee-skill combination, L&D managers and HR administrators should consider the following criteria:

**beginner:**
- Completed introductory training or coursework
- Can describe basic concepts and terminology
- Requires step-by-step instructions for task execution
- Cannot yet work independently on this skill

**intermediate:**
- Has practical experience applying the skill in real projects
- Can troubleshoot common issues without assistance
- Understands best practices and common anti-patterns
- Can complete standard tasks independently

**advanced:**
- Leads complex projects requiring this skill
- Mentors and reviews the work of intermediate practitioners
- Contributes to internal standards, templates, or frameworks
- Can architect solutions involving this skill
- Typically holds one or more relevant certifications

**expert:**
- Sets organizational strategy for this skill area
- Evaluates and adopts new tools, frameworks, or methodologies
- Delivers training sessions and creates learning content
- Recognized externally (conference speaker, open-source contributor, published author)
- Holds advanced or multiple certifications

### 6.3 Certification Tracking

The `certified` boolean flag on the EmployeeSkill model distinguishes between self-assessed proficiency and formally validated competency:

- **certified: true** — The employee holds a recognized certification, has passed a formal assessment, or has completed a verified training program for this skill.
- **certified: false** — The employee's proficiency is based on experience and/or self-assessment without formal validation.

Certification status is particularly important for:
- Compliance reporting (e.g., mandatory safety certifications)
- Client-facing skill verification (e.g., cloud certifications for client proposals)
- Training needs analysis (identifying skills where formal certification is needed)

### 6.4 Default Skills and Categories

The system is seeded with 15 default skills across 8 categories:

| Skill | Category | Seed Description |
|---|---|---|
| React | Frontend | React.js library for building user interfaces |
| Node.js | Backend | Server-side JavaScript runtime |
| Python | Backend | General-purpose programming language |
| AWS | Cloud | Amazon Web Services cloud platform |
| Machine Learning | Data Science | ML algorithms and model training |
| Project Management | Management | Agile and waterfall project management |
| Data Analysis | Analytics | Statistical analysis and data visualization |
| Leadership | Soft Skills | Team leadership and management |
| TypeScript | Frontend | Typed superset of JavaScript |
| Docker | DevOps | Containerization platform |
| Kubernetes | DevOps | Container orchestration system |
| SQL | Database | Structured Query Language |
| Communication | Soft Skills | Verbal and written communication |
| Digital Marketing | Marketing | Online marketing strategies and tools |
| Financial Analysis | Finance | Financial modeling and reporting |

### 6.5 Default Seed Enrollments

The system is seeded with 5 sample enrollments demonstrating various lifecycle states:

| Employee | Course | Status | Progress | Score |
|---|---|---|---|---|
| EMP006 | Advanced React Patterns | in-progress | 65% | — |
| EMP001 | Cloud Architecture (AWS) | completed | 100% | 92 |
| EMP009 | Kubernetes & Container Orchestration | in-progress | 40% | — |
| EMP007 | Leadership & Management | completed | 100% | 88 |
| EMP014 | Advanced React Patterns | enrolled | 0% | — |

---

## 7. Integration with Other Modules

The Learning & Development module does not operate in isolation — it integrates deeply with several other modules in the AI-HRMS ecosystem. Understanding these integration points is essential for maintaining data consistency and leveraging the full value of the L&D data.

### 7.1 Employee Management Module

- **Dependency:** CourseEnrollment and EmployeeSkill records reference employees via `employeeId` foreign keys. Every enrollment and skill assignment requires a valid employee record.
- **Data Flow:** The Employee Management module serves as the source of truth for employee data. The L&D module consumes employee names, IDs, and department information when displaying enrollment details and skill profiles. The My Learning tab fetches the current employee context from `/api/employees?limit=1`.
- **Impact of Employee Deletion:** When an employee is deleted via cascade deletion, all associated CourseEnrollment and EmployeeSkill records are deleted within the same database transaction. This removes the employee's complete learning history.
- **Best Practice:** Before deleting an employee, export their learning history and certificates for record-keeping. Consider setting the employee status to "exited" rather than deleting to preserve historical L&D data.

### 7.2 Performance Module

- **Dependency:** The Performance module stores performance review data, including skill ratings and development goals, that inform AI course recommendations.
- **Data Flow:** Performance review scores and identified improvement areas feed into the L&D module's recommendation engine. Skills flagged as "needs improvement" in performance reviews are prioritized in AI course recommendations. Conversely, course completion data (especially scores) can be referenced during performance calibration discussions.
- **Integration Point:** The AI recommendation engine cross-references performance review skill ratings with the employee's current skill proficiency in EmployeeSkill records to identify discrepancies and recommend targeted training.

### 7.3 Talent Acquisition Module

- **Dependency:** Job postings in the Talent Acquisition module specify required skills that should align with the L&D skill catalog.
- **Data Flow:** When new job postings are created with specific skill requirements, these requirements can inform organizational skill gap analysis. If multiple job postings require a skill that few current employees possess, the L&D module should prioritize training in that skill area. Additionally, candidate skill assessments during the hiring process can establish initial EmployeeSkill records when candidates are onboarded.
- **Integration Point:** The `skills` JSON field on Job records references skill names that should match entries in the Skill catalog. Consistent naming ensures that skill gap analysis covers both current workforce capabilities and incoming hiring requirements.

### 7.4 Self-Service Module

- **Dependency:** Employees access their own learning data through the Self-Service portal, including enrollment status, progress, certificates, and skill profiles.
- **Data Flow:** The Self-Service module queries the same `/api/courses?employeeId={id}` and `/api/skills?employeeId={id}` endpoints to display personalized learning dashards. Employees can view their enrolled courses, track progress, and access certificates without requiring HR admin access.
- **Integration Point:** Self-service enrollment requests may flow through the L&D module's enrollment workflow, potentially requiring manager approval for certain course categories or costs.

### 7.5 Analytics Module

- **Dependency:** The Analytics module consumes L&D data for organizational reporting, including training completion rates, skill distribution heatmaps, and learning investment ROI calculations.
- **Data Flow:** Enrollment statistics (counts by status, average scores, completion rates) and skill distribution data (proficiency breakdowns by department, certification rates) are aggregated by the Analytics module for executive dashboards and compliance reports.
- **Integration Point:** The Analytics module may display:
  - Training completion rates by department and time period
  - Skill gap heatmaps across the organization
  - Learning investment analysis (enrollment counts × course hours by category)
  - Certification compliance tracking
  - Correlation between training completion and performance improvements

### 7.6 Audit Log Module

- **Dependency:** The AuditLog model records all create, update, and delete operations in the L&D module.
- **Data Flow:** Every course creation, enrollment, progress update, skill creation, and skill deletion generates an audit log entry with the action type, module identifier ("learning" for course operations, "hr" for skill operations), and a descriptive details string.
- **Audit Log Entries Generated:**
  - Course creation: `"New course created: {title}"`
  - Employee enrollment: `"{employeeName} enrolled in course: {courseTitle}"`
  - Enrollment update: `"Course enrollment updated: {courseTitle} - Status: {status}, Progress: {progress}%"`
  - Enrollment deletion: `"Course enrollment deleted"`
  - Skill creation: `"Created skill: {name} (Category: {category})"`
  - Skill update: `"Updated skill: {name}"`
  - Skill deletion: `"Deleted skill: {name}"`

---

## 8. Role-Based Access

### 8.1 Access Control Matrix

The following matrix defines what each role can do within the Learning & Development module:

| Operation | Super Admin | HR Admin | L&D Manager |
|---|:---:|:---:|:---:|
| View course catalog | ✅ | ✅ | ✅ |
| Search and filter courses | ✅ | ✅ | ✅ |
| Create new course | ✅ | ✅ | ✅ |
| Update course details | ✅ | ✅ | ✅ |
| Delete course (no enrollments) | ✅ | ✅ | ✅ |
| Enroll employee in course | ✅ | ✅ | ✅ |
| View own learning dashboard | ✅ | ✅ | ✅ |
| View all employees' enrollments | ✅ | ✅ | ✅ |
| Update enrollment progress | ✅ | ✅ | ✅ |
| Update enrollment status | ✅ | ✅ | ✅ |
| Delete enrollment record | ✅ | ✅ | ✅ |
| View skill inventory | ✅ | ✅ | ✅ |
| Search and filter skills | ✅ | ✅ | ✅ |
| Create new skill | ✅ | ✅ | ❌ |
| Update skill details | ✅ | ✅ | ❌ |
| Delete skill (no assignments) | ✅ | ✅ | ❌ |
| Assign skills to employees | ✅ | ✅ | ✅ |
| Update employee skill proficiency | ✅ | ✅ | ✅ |
| Remove skill from employee | ✅ | ✅ | ✅ |
| Use AI recommendations | ✅ | ✅ | ✅ |
| View skill gap analysis | ✅ | ✅ | ✅ |
| Access audit logs for L&D | ✅ | ✅ | ❌ |
| Delete course with active enrollments | ❌ | ❌ | ❌ |
| Delete skill with employee assignments | ❌ | ❌ | ❌ |

### 8.2 Role Descriptions

**Super Admin:** Has unrestricted access across all L&D operations. Can create, modify, and delete any course, skill, or enrollment record. Can view all employees' learning data and manage the skill catalog without restrictions. The Super Admin is the only role that can delete skills and courses with existing associations (though the API enforces business rules preventing this regardless of role).

**HR Admin:** Has full operational access to the L&D module. Can manage the complete course catalog, enroll and manage employee training, maintain the skill inventory, and assign skills to employees. The HR Admin is the primary day-to-day operator of this module and is responsible for creating training programs, tracking compliance training, and maintaining the skill catalog.

**L&D Manager:** Has operational access to course management, enrollment operations, and employee skill assignments, but cannot modify the skill catalog (create, update, or delete skills). This role focuses on training delivery and employee development rather than catalog administration. The L&D Manager can run AI recommendations, view skill gap analyses, and track learning progress across the organization.

---

## 9. Business Rules

### 9.1 Dual API Mode (Courses Endpoint)

The `/api/courses` endpoint operates in a dual mode, serving both course management and enrollment management through the same URL path. The mode is determined by the request body structure:

**Mode 1 — Course Creation (POST):**
- **Trigger:** Request body contains `title` field (with or without other course fields)
- **Behavior:** Creates a new Course record
- **Required:** `title` (string, non-empty)
- **Optional:** `description`, `category`, `duration`, `provider`, `url`, `skills` (JSON string)
- **Response:** 201 Created with the new Course object

**Mode 2 — Enrollment Creation (POST):**
- **Trigger:** Request body contains `employeeId` + `courseId` but no `title`
- **Behavior:** Creates a new CourseEnrollment record
- **Required:** `employeeId` (string, valid employee ID), `courseId` (string, valid course ID)
- **Optional:** `status` (defaults to "enrolled"), `progress` (defaults to 0)
- **Validations:** Employee must exist, Course must exist, no duplicate enrollment
- **Response:** 201 Created with the new CourseEnrollment object (includes related course and employee data)

**Error (POST):** If the request body contains neither `title` nor `employeeId + courseId`, the API returns a 400 Bad Request error: "Provide either (employeeId + courseId) for enrollment or title for new course."

**Mode 3 — Course Listing (GET, no employeeId):**
- **Trigger:** GET request without `employeeId` query parameter
- **Behavior:** Returns paginated course catalog with enrollment counts
- **Response:** `{ courses: [...], pagination: {...} }`

**Mode 4 — Enrollment Listing (GET, with employeeId):**
- **Trigger:** GET request with `employeeId` query parameter
- **Behavior:** Returns paginated enrollment records for the specified employee
- **Optional:** `enrollmentStatus` query parameter for filtering by status
- **Response:** `{ enrollments: [...], pagination: {...} }`

**Mode 5 — Course Update (PATCH, with courseId/id):**
- **Trigger:** Request body contains `courseId` or `id` field
- **Behavior:** Updates the specified Course record
- **Response:** Updated Course object

**Mode 6 — Enrollment Update (PATCH, with enrollmentId):**
- **Trigger:** Request body contains `enrollmentId` field
- **Behavior:** Updates the specified CourseEnrollment record
- **Validations:** Enrollment must exist, status must be valid, progress clamped to 0-100
- **Auto-behavior:** Setting status to "completed" automatically sets `completedAt`
- **Response:** Updated CourseEnrollment object (includes related course and employee data)

**Mode 7 — Course Deletion (DELETE, with courseId):**
- **Trigger:** Query parameter `courseId` is provided
- **Behavior:** Deletes the specified Course
- **Constraint:** Cannot delete a course that has active enrollments (409 Conflict)
- **Response:** `{ message: "Course deleted successfully" }`

**Mode 8 — Enrollment Deletion (DELETE, with enrollmentId):**
- **Trigger:** Query parameter `enrollmentId` is provided
- **Behavior:** Deletes the specified CourseEnrollment
- **Response:** `{ message: "Enrollment deleted successfully" }`

### 9.2 Skill Deletion Constraint

Skills that are currently assigned to one or more employees cannot be deleted. This business rule protects data integrity by preventing orphaned references. The enforcement works as follows:

1. When a `DELETE /api/skills?id={id}` request is received, the API first queries the skill with its `_count.employeeSkills` aggregation.
2. If `employeeSkills` count is greater than 0, the API returns a 409 Conflict error: "Cannot delete skill assigned to employees. Remove employee associations first."
3. To delete a skill, an administrator must first remove all EmployeeSkill records referencing that skill. This can be done by:
   - Manually unassigning the skill from each employee through the UI or API
   - Using a bulk operation to remove all EmployeeSkill records for the skill
4. Once all associations are removed, the skill can be deleted.

### 9.3 Course Deletion Constraint

Courses with active enrollments cannot be deleted. This prevents the loss of employee learning records and progress data:

1. When a `DELETE /api/courses?courseId={id}` request is received, the API queries the course with its `_count.enrollments` aggregation.
2. If the enrollment count is greater than 0, the API returns a 409 Conflict error: "Cannot delete course with active enrollments."
3. To delete a course, an administrator must first delete all associated enrollment records.

### 9.4 Duplicate Enrollment Prevention

The system enforces a unique constraint on the combination of `(employeeId, courseId)` in the CourseEnrollment model. An employee can only be enrolled in a specific course once at any given time. Attempting to create a duplicate enrollment results in a 409 Conflict error.

### 9.5 Duplicate Skill Name Prevention

The Skill model enforces a unique constraint on the `name` field. No two skills can share the same name, regardless of category. This ensures unambiguous skill identification across the system. Attempting to create a skill with an existing name returns a 409 Conflict error, and renaming a skill to an existing name also returns a 409.

### 9.6 Progress Validation

The enrollment `progress` field is clamped to the range 0-100. Values below 0 are set to 0, and values above 100 are set to 100. This validation occurs on the server side during PATCH operations, ensuring data consistency regardless of client-side validation.

### 9.7 Status Validation

The enrollment `status` field must be one of the four valid values: "enrolled", "in-progress", "completed", or "dropped". Any other value is rejected by the PATCH endpoint.

### 9.8 Completion Date Automation

When an enrollment's status is updated to "completed", the `completedAt` field is automatically set to the current date by the server. This field cannot be manually set — it is always derived from the completion event timestamp.

### 9.9 Skills Field Storage

The Course `skills` field is stored as a JSON string (not a native JSON type in the database). The field contains a serialized array of skill name strings, e.g., `'["React", "TypeScript"]'`. This design allows flexible skill tagging without requiring foreign key relationships to the Skill table, but it means that:
- Skill names in courses are not validated against the Skill catalog
- Renaming a skill in the catalog does not automatically update course skill references
- The client must parse the JSON string using `JSON.parse()` to access individual skill names

---

## 10. Troubleshooting

### 10.1 Course Catalog Not Loading

**Symptoms:** The Course Catalog tab displays loading skeletons indefinitely, or shows an error state with "Failed to load courses."

**Possible Causes and Solutions:**

| Cause | Solution |
|---|---|
| API server is unreachable | Check network connectivity and verify the application server is running. The courses API endpoint is `/api/courses`. |
| Database connection failure | Verify the DATABASE_URL environment variable is correctly set and the PostgreSQL database is accessible. Check server logs for connection errors. |
| Invalid query parameters | Ensure the API request parameters are valid. The `limit` parameter should be a positive integer. The `category` and `search` parameters should be strings. |
| Prisma client not generated | Run `npx prisma generate` to regenerate the Prisma client. This is required after schema changes. |
| Rate limiting | If the API is behind a rate limiter, excessive requests may be throttled. Wait and retry. |

**Diagnostic Steps:**
1. Open browser DevTools Network tab and check the `/api/courses?limit=100` request status code.
2. If 500, check server logs for the error stack trace.
3. If 401/403, verify the user's authentication session is valid.
4. Click the "Try Again" button to trigger a data refetch.

### 10.2 Enrollment Fails with "Employee is already enrolled"

**Symptoms:** Clicking "Enroll Now" shows an error banner with "Employee is already enrolled in this course."

**Cause:** The employee already has an active enrollment record for the specified course. The system enforces uniqueness on `(employeeId, courseId)`.

**Solutions:**
1. Check the My Learning tab to see if the course already appears in Active Courses or Certificates.
2. If the employee dropped the course and wants to re-enroll, the old enrollment record must first be deleted: `DELETE /api/courses?enrollmentId={id}`.
3. After deleting the old enrollment, a new enrollment can be created.

### 10.3 Enroll Now Button Disabled

**Symptoms:** The "Enroll Now" button on course cards is grayed out and cannot be clicked.

**Cause:** The `currentEmployeeId` variable is empty, meaning the system could not determine the current employee context.

**Solutions:**
1. Verify that the `/api/employees?limit=1` API call is returning at least one employee record.
2. Check that the authenticated user has an associated Employee record in the database.
3. If the user account is not linked to an employee record, create the association through the RBAC module.
4. Refresh the page to trigger a re-fetch of the employee data.

### 10.4 Skill Gap Radar Chart Not Displaying

**Symptoms:** The Skill Inventory tab shows the radar chart area but the chart is empty or not rendering.

**Possible Causes and Solutions:**

| Cause | Solution |
|---|---|
| No skills in the catalog | Ensure the database has been seeded with default skills. Run `npx prisma db seed` to populate initial data. |
| Skills have no employee assignments | The radar chart uses `_count.employeeSkills` to compute values. If no employees are assigned to skills, the chart may show minimal or zero values. Assign skills to employees to populate the chart. |
| Recharts rendering issue | The RadarChart requires the container to have a defined width. Ensure the parent container is not collapsed or hidden. The `ResponsiveContainer` component should handle this automatically. |
| Invalid skill gap data | The `skillGapData` computation requires at least one skill. If `skills.length === 0`, the chart renders nothing. |

### 10.5 Cannot Delete a Skill

**Symptoms:** Attempting to delete a skill returns "Cannot delete skill assigned to employees. Remove employee associations first."

**Cause:** The skill has one or more EmployeeSkill records linking it to employees. The business rule prevents deletion of skills with active assignments.

**Solutions:**
1. Identify all employees assigned to the skill by checking `_count.employeeSkills` in the Skill Inventory.
2. Remove each EmployeeSkill association: this typically requires direct API calls or admin UI operations.
3. Once all associations are removed, retry the deletion.
4. **Alternative:** Instead of deleting, consider deprecating the skill by updating its description to indicate it is no longer active, while preserving historical data.

### 10.6 Cannot Delete a Course

**Symptoms:** Attempting to delete a course returns "Cannot delete course with active enrollments."

**Cause:** The course has one or more enrollment records. The business rule prevents deletion of courses with active enrollments to preserve learning history.

**Solutions:**
1. Delete all enrollment records for the course first: `DELETE /api/courses?enrollmentId={id}` for each enrollment.
2. Once all enrollments are removed, the course can be deleted: `DELETE /api/courses?courseId={id}`.
3. **Alternative:** Instead of deleting, consider archiving the course by updating its category or description to indicate it is no longer active.

### 10.7 Course Creation Fails Silently

**Symptoms:** Clicking "Create Course" in the dialog does not create the course, and no error message appears.

**Possible Causes and Solutions:**

| Cause | Solution |
|---|---|
| Title field is empty | The `handleCreateCourse` function validates that the title is non-empty before submission. If empty, it sets `actionError` to "Course title is required" — check if the error banner is visible (it may be scrolled out of view). |
| API returns 400 | The POST endpoint requires either `title` or `employeeId + courseId`. If the request body is malformed, a 400 error is returned. Check the browser console for the error response. |
| Network error | If the API request fails due to a network issue, the `catch` block sets `actionError`. Check the error banner at the top of the module. |
| Dialog closes on outer click | The Dialog component may close when clicking outside. Ensure the "Create Course" button is clicked directly. |

### 10.8 Skills Search Returns No Results

**Symptoms:** Typing in the Skill Inventory search input returns no results even though skills exist.

**Cause:** The skill search operates client-side on the `skills` array. If the skills API call failed or returned an empty array, the search will find nothing.

**Solutions:**
1. Check the Network tab for the `/api/skills?limit=100` request status.
2. If the request failed, click "Try Again" to refetch.
3. Clear the search input to verify that skills appear in the unfiltered list.
4. Verify the search query matches skill names or categories (the search checks both fields with case-insensitive partial matching).

### 10.9 Action Error Banner Persists

**Symptoms:** The rose-colored error banner at the top of the module does not go away after a successful operation.

**Cause:** The `actionError` state is only cleared when explicitly dismissed or when a new action is initiated. A previous error may remain visible.

**Solution:** Click the X button on the error banner to dismiss it. The error is also cleared when a new enrollment or course creation action is initiated (via `setActionError(null)` at the start of each handler).

### 10.10 Learning Stats Show Zero or "N/A"

**Symptoms:** The My Learning tab shows "0" for all stats or "N/A" for Average Score.

**Cause:** The employee has no enrollment records, or no completed enrollments with scores.

**Solutions:**
1. Enroll the employee in courses from the Course Catalog tab.
2. After completing courses with scores, the Average Score stat will populate.
3. If the employee should have enrollments but the dashboard shows zero, verify that the `/api/courses?employeeId={id}` API call is returning the correct data.
4. Ensure the `currentEmployeeId` is correctly set — it is derived from the first employee returned by `/api/employees?limit=1`.

---

## Appendix A: Default Courses

The system is seeded with 8 default courses across 6 categories:

| # | Title | Category | Duration (h) | Provider | Skills |
|---|---|---|---|---|---|
| 1 | Advanced React Patterns | Engineering | 20 | Udemy | React, TypeScript |
| 2 | Machine Learning Fundamentals | Data Science | 40 | Coursera | Python, ML |
| 3 | Leadership & Management | Management | 15 | LinkedIn Learning | Leadership, Communication |
| 4 | Cloud Architecture (AWS) | Engineering | 30 | A Cloud Guru | AWS, DevOps |
| 5 | Digital Marketing Mastery | Marketing | 25 | HubSpot Academy | Marketing, Analytics |
| 6 | Financial Analysis & Reporting | Finance | 18 | Coursera | Finance, Analysis |
| 7 | Effective Communication Skills | Soft Skills | 10 | LinkedIn Learning | Communication, Presentation |
| 8 | Kubernetes & Container Orchestration | Engineering | 35 | A Cloud Guru | Kubernetes, Docker, DevOps |

## Appendix B: API Quick Reference

### Courses API (`/api/courses`)

| Method | Mode | Key Parameters | Response |
|---|---|---|---|
| GET | Course Catalog | `page`, `limit`, `category`, `search` | `{ courses: [...], pagination: {...} }` |
| GET | Employee Enrollments | `employeeId`, `enrollmentStatus`, `page`, `limit` | `{ enrollments: [...], pagination: {...} }` |
| POST | Create Course | `title`, `description`, `category`, `duration`, `provider`, `url`, `skills` | Course object (201) |
| POST | Create Enrollment | `employeeId`, `courseId`, `status?`, `progress?` | Enrollment object (201) |
| PATCH | Update Course | `courseId`/`id` + fields to update | Updated Course object |
| PATCH | Update Enrollment | `enrollmentId`, `status?`, `progress?`, `score?` | Updated Enrollment object |
| DELETE | Delete Course | `?courseId={id}` | `{ message: "Course deleted successfully" }` |
| DELETE | Delete Enrollment | `?enrollmentId={id}` | `{ message: "Enrollment deleted successfully" }` |

### Skills API (`/api/skills`)

| Method | Mode | Key Parameters | Response |
|---|---|---|---|
| GET | Skill Catalog | `page`, `limit`, `category`, `search` | `{ skills: [...], pagination: {...} }` |
| GET | Employee Skills | `employeeId`, `page`, `limit` | `{ employeeSkills: [...], pagination: {...} }` |
| POST | Create Skill | `name` (required), `category?`, `description?` | Skill object (201) |
| PATCH | Update Skill | `id` (required), `name?`, `category?`, `description?` | Updated Skill object |
| DELETE | Delete Skill | `?id={id}` | `{ message: "Skill deleted successfully" }` |

## Appendix C: Data Model Reference

### Course Model

| Field | Type | Required | Unique | Default | Notes |
|---|---|---|---|---|---|
| id | String (CUID) | Auto | Yes | auto-generated | Primary key |
| title | String | Yes | No | — | Course title |
| description | String? | No | No | — | Course description |
| category | String? | No | No | — | Course category (e.g., "Engineering") |
| duration | Int? | No | No | — | Duration in hours |
| provider | String? | No | No | — | Course provider (e.g., "Coursera") |
| url | String? | No | No | — | External course URL |
| skills | String? | No | No | — | JSON array of skill names |
| createdAt | DateTime | Auto | No | now() | Creation timestamp |
| updatedAt | DateTime | Auto | No | auto-updated | Last update timestamp |

### CourseEnrollment Model

| Field | Type | Required | Unique | Default | Notes |
|---|---|---|---|---|---|
| id | String (CUID) | Auto | Yes | auto-generated | Primary key |
| employeeId | String | Yes | No | — | FK → Employee.id |
| courseId | String | Yes | No | — | FK → Course.id |
| status | String | No | No | "enrolled" | enrolled/in-progress/completed/dropped |
| progress | Float | No | No | 0 | Completion percentage (0-100) |
| score | Float? | No | No | — | Assessment score |
| completedAt | String? | No | No | — | Date of completion (ISO date string) |
| createdAt | DateTime | Auto | No | now() | Creation timestamp |
| updatedAt | DateTime | Auto | No | auto-updated | Last update timestamp |

**Unique Constraint:** `(employeeId, courseId)` — prevents duplicate enrollments.

### Skill Model

| Field | Type | Required | Unique | Default | Notes |
|---|---|---|---|---|---|
| id | String (CUID) | Auto | Yes | auto-generated | Primary key |
| name | String | Yes | **Yes** | — | Skill name (must be unique) |
| category | String? | No | No | — | Skill category (e.g., "Frontend") |
| description | String? | No | No | — | Skill description |
| createdAt | DateTime | Auto | No | now() | Creation timestamp |
| updatedAt | DateTime | Auto | No | auto-updated | Last update timestamp |

### EmployeeSkill Model

| Field | Type | Required | Unique | Default | Notes |
|---|---|---|---|---|---|
| id | String (CUID) | Auto | Yes | auto-generated | Primary key |
| employeeId | String | Yes | No | — | FK → Employee.id |
| skillId | String | Yes | No | — | FK → Skill.id |
| proficiency | String? | No | No | — | beginner/intermediate/advanced/expert |
| certified | Boolean | No | No | false | Whether formally certified |
| createdAt | DateTime | Auto | No | now() | Creation timestamp |
| updatedAt | DateTime | Auto | No | auto-updated | Last update timestamp |
