# AI-HRMS User Standard Operating Procedure (SOP)

**Document Version:** 2.0  
**Effective Date:** March 2026  
**Classification:** Internal — All Employees  
**Application:** AI-HRMS Smart Workspace  

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Module 1: Dashboard](#2-module-1-dashboard)
3. [Module 2: Employee Management](#3-module-2-employee-management)
4. [Module 3: RBAC & Security](#4-module-3-rbac--security)
5. [Module 4: AI Talent Acquisition](#5-module-4-ai-talent-acquisition)
6. [Module 5: Time & Attendance](#6-module-5-time--attendance)
7. [Module 6: Payroll & Expenses](#7-module-6-payroll--expenses)
8. [Module 7: Performance & Talent](#8-module-7-performance--talent)
9. [Module 8: Learning & Development](#9-module-8-learning--development)
10. [Module 9: Analytics & Reporting](#10-module-9-analytics--reporting)
11. [Module 10: Employee Self-Service](#11-module-10-employee-self-service)
12. [Glossary of Terms](#12-glossary-of-terms)
13. [Frequently Asked Questions](#13-frequently-asked-questions)
14. [Contact & Support](#14-contact--support)

---

## 1. Getting Started

### 1.1 Purpose

This section provides first-time users with the foundational knowledge required to log in, navigate, and begin using the AI-HRMS Smart Workspace platform effectively.

### 1.2 System Requirements

| Requirement | Specification |
|---|---|
| Browser | Chrome 90+, Firefox 88+, Safari 15+, Edge 90+ |
| Screen Resolution | Minimum 1280×720; recommended 1920×1080 |
| Mobile | iOS 15+ / Android 12+ (responsive web app) |
| Network | Stable internet connection (minimum 2 Mbps) |

### 1.3 Login Procedure

1. Open your web browser and navigate to the AI-HRMS URL provided by your organization (e.g., `https://hrms.yourcompany.com`).
2. On the login screen, enter your **corporate email address** in the Email field.
3. Enter your **password** in the Password field. Your initial password is sent to your corporate email by the HR Admin upon onboarding.
4. Click the **Sign In** button.
5. If Multi-Factor Authentication (MFA) is enabled for your account, enter the 6-digit code from your authenticator app (e.g., Google Authenticator, Microsoft Authenticator).
6. Upon first login, you will be prompted to **change your password**. Enter your current password, then your new password (minimum 12 characters, must include uppercase, lowercase, number, and special character).
7. After changing your password, you will be redirected to the **Dashboard**.

> **Security Note:** Never share your credentials. If you suspect unauthorized access, immediately contact IT Support and change your password.

### 1.4 Navigation Overview

The AI-HRMS interface consists of the following areas:

- **Sidebar (Left Panel):** Contains navigation links to all 10 modules, a search bar to filter modules, the Settings button, and the Logout button. The sidebar can be collapsed by clicking the **Collapse** button at the bottom or the chevron icon on the edge. On mobile devices, the sidebar opens as a slide-out drawer via the hamburger menu.
- **Main Content Area (Center):** Displays the active module's content, including data tables, forms, charts, and action buttons.
- **User Profile (Sidebar Footer):** Shows your name, role, and avatar. Click to view your profile details.
- **Notification Bell:** Located in the sidebar header; displays a count badge for unread notifications.
- **AI Badge:** Modules with AI-powered features display a green **AI** badge next to their name in the sidebar.

### 1.5 Quick Navigation Steps

1. Locate the desired module in the sidebar navigation list.
2. Click the module name to load it in the main content area.
3. Alternatively, use the **Search modules** field at the top of the sidebar to type a module name and click the result.
4. On mobile, tap the **hamburger menu** (☰) in the top-left corner, then select a module.

---

## 2. Module 1: Dashboard

### 2.1 Purpose and Scope

The Dashboard module serves as the central command center for the AI-HRMS platform. It provides a high-level overview of key HR metrics, live trends, AI-driven attrition predictions, recent activities, and pending approvals — all in real time. The Dashboard is the default landing page after login.

### 2.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full dashboard with all widgets and data |
| HR Admin | Full dashboard with all widgets and data |
| Payroll Specialist | Payroll and attendance widgets only |
| Department Manager | Department-specific data and pending approvals |
| Employee | Limited personal summary (leave balance, payslips) |
| Recruiter | Recruitment-specific widgets |
| L&D Manager | Training and skill-related widgets |

### 2.3 Step-by-Step Procedures

#### 2.3.1 Viewing Key Statistics

1. After login, the Dashboard loads automatically. If on another module, click **Dashboard** in the sidebar.
2. The top row displays four stat cards: **Total Employees**, **Active Positions**, **Attendance Rate**, and **Monthly Payroll**.
3. Each card shows the current value, a trend indicator (green upward arrow or red downward arrow), and a contextual change message (e.g., "+12 this month").
4. Hover over any card to see it highlighted with a colored accent bar at the bottom.

#### 2.3.2 Reviewing Charts

1. **Headcount Trend Chart:** An area chart displaying monthly headcount over the past 12 months. Hover over data points to view exact values in the tooltip.
2. **Department Distribution Chart:** A donut chart showing employee distribution across departments. Hover over segments to see the count per department.
3. **AI Attrition Predictions Chart:** A grouped bar chart comparing predicted risk (%) vs. actual attrition (%) by department. This chart carries the **AI** badge.

#### 2.3.3 Using Quick Actions

1. Locate the **Quick Actions** card below the charts.
2. Click any action button (e.g., "Add Employee," "Process Payroll," "Post Job," "Run Reports," "Schedule Interview," "Approve Leaves") to navigate directly to the relevant module.

#### 2.3.4 Reviewing Pending Approvals

1. Locate the **Pending Approvals** card in the bottom row.
2. Each item displays the employee name, request type (Leave/Expense), details, and an **approve** (checkmark) button.
3. Click the **checkmark icon** to approve a request inline, or click the item to view full details before approving.

### 2.4 UI Descriptions

| UI Element | Description |
|---|---|
| Stat Cards | Four rectangular cards in a horizontal row, each with an icon, metric value, and trend indicator |
| Headcount Trend | Green area chart with gradient fill, interactive tooltips |
| Department Distribution | Donut chart with color-coded legend at the bottom |
| AI Attrition Predictions | Dual-bar chart with amber (predicted) and green (actual) bars per department |
| Quick Actions | Grid of outlined buttons with icons; hover turns border emerald |
| Recent Activities | Scrollable list with icons, description text, and timestamps |
| Pending Approvals | Scrollable list with request details and inline approve button |
| Live Badge | A pulsing green dot labeled "Live" in the header indicating real-time data |

### 2.5 Common Scenarios

| Scenario | Action |
|---|---|
| Dashboard not loading data | Check your network connection and refresh the page. If the issue persists, clear browser cache or try a different browser. |
| Need to approve multiple leaves quickly | Use the Pending Approvals section on the Dashboard to approve leaves inline without navigating to the Time & Attendance module. |
| Want a quick overview before a meeting | Check the stat cards and AI Attrition Predictions chart for a 30-second summary of organizational health. |

### 2.6 Troubleshooting Tips

- **Charts not rendering:** Ensure JavaScript is enabled in your browser. Check for any browser extensions that may block chart rendering (e.g., ad blockers).
- **Stale data displayed:** Click the browser refresh button or press `Ctrl+F5` for a hard refresh. The Dashboard data is live but may cache for up to 60 seconds.
- **Pending approvals count mismatch:** Pending approvals are role-specific. If you recently delegated approval authority, items may no longer appear for your role.

### 2.7 Best Practices

- Review the Dashboard at the start of each workday to stay informed on organizational metrics and pending items.
- Use Quick Actions to reduce navigation time for frequent tasks.
- Monitor the AI Attrition Predictions weekly and escalate high-risk departments to HR leadership proactively.

---

## 3. Module 2: Employee Management

### 3.1 Purpose and Scope

The Employee Management module is the central repository for all employee data. It includes the employee database, organizational chart, document management, and asset tracking. This module enables HR personnel to manage the full employee lifecycle from onboarding to offboarding.

### 3.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full CRUD on all employees, org chart, documents, assets |
| HR Admin | Full CRUD on all employees, org chart, documents, assets |
| Department Manager | View and edit own department employees; view org chart |
| Employee | View own profile only (redirects to Self-Service) |
| Payroll Specialist | View employee compensation data (read-only) |
| Recruiter | View employee directory (read-only) |
| L&D Manager | View employee skills and training records |

### 3.3 Step-by-Step Procedures

#### 3.3.1 Adding a New Employee

1. Navigate to **Employees** in the sidebar.
2. Click the **Add Employee** button (top-right of the employee list).
3. Fill in the required fields in the dialog form:
   - First Name, Last Name
   - Email Address, Phone Number
   - Department (select from dropdown)
   - Designation, Job Title
   - Join Date (use the date picker)
   - Employment Type (Full-time, Part-time, Contract, Internship)
   - Location, Work Mode (Office, Remote, Hybrid)
   - Reporting Manager (searchable dropdown)
4. Click **Save** to create the employee record.
5. The system sends a welcome email to the new employee with login credentials.

#### 3.3.2 Viewing the Organization Chart

1. Navigate to **Employees** and click the **Org Chart** tab.
2. The org chart renders as an interactive tree diagram with nodes representing employees.
3. Click a node to expand/collapse the subtree under that manager.
4. Hover over a node to see a tooltip with employee details (name, designation, department).

#### 3.3.3 Managing Employee Documents

1. Open an employee's profile by clicking their row in the employee list.
2. Navigate to the **Documents** tab within the profile.
3. Click **Upload Document** to add a new document.
4. Select the document type (ID Proof, Address Proof, Certificate, Offer Letter, etc.), then choose the file from your device.
5. Click **Upload**. The document appears in the list with type, upload date, and a download button.

#### 3.3.4 Assigning Assets to Employees

1. Open the employee profile and navigate to the **Assets** tab.
2. Click **Assign Asset**.
3. Fill in the asset details: Asset Name, Type (Laptop, Phone, Headset, Access Card), Serial Number, Condition (New/Used).
4. Click **Assign**. The asset is now linked to the employee record.

### 3.4 Common Scenarios

| Scenario | Action |
|---|---|
| Employee transfers to another department | Edit the employee profile, update the Department and Reporting Manager fields, and save. The org chart updates automatically. |
| Employee resigns | Change the employee status to "Inactive," set the last working day, and initiate the offboarding checklist. Recover all assigned assets via the Assets tab. |
| Document expires (e.g., work visa) | Set an expiry date when uploading. The system generates alerts 30/15/7 days before expiry. |

### 3.5 Troubleshooting Tips

- **Employee not appearing in org chart:** Ensure the employee has a Reporting Manager assigned. Employees without a manager do not render in the tree.
- **Cannot upload documents:** Verify the file is under 10 MB and in an accepted format (PDF, JPG, PNG, DOCX). Large files may need to be compressed first.
- **Duplicate employee records found:** Contact the Super Admin to merge duplicate records. Do not delete records, as this affects audit trails.

### 3.6 Best Practices

- Always assign a Reporting Manager when creating an employee to ensure org chart integrity.
- Upload all onboarding documents within the first 3 days of joining.
- Conduct quarterly asset audits to verify physical assets match system records.

---

## 4. Module 3: RBAC & Security

### 4.1 Purpose and Scope

The Role-Based Access Control (RBAC) & Security module manages user roles, permissions, audit trails, and data security policies. It ensures that every user accesses only the data and features appropriate to their role, maintaining compliance and data protection standards.

### 4.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full access: create/edit roles, assign permissions, view audit trails, configure security policies |
| HR Admin | View roles and audit trails; request permission changes from Super Admin |
| All other roles | No direct access to this module |

### 4.3 Step-by-Step Procedures

#### 4.3.1 Creating a New Role

1. Navigate to **RBAC & Security** in the sidebar.
2. Click the **Roles** tab.
3. Click **Create Role**.
4. Enter the Role Name and Description.
5. Set the Access Level (0–4, where 0 is highest privilege).
6. Select the permissions to grant by toggling each permission checkbox (e.g., "Employee: Read," "Payroll: Write," "Analytics: Export").
7. Click **Save Role**.

#### 4.3.2 Assigning a Role to a User

1. Navigate to the **Users** tab within RBAC & Security.
2. Search for the user by name or email.
3. Click the user row to open the edit panel.
4. Select the desired role from the **Role** dropdown.
5. Click **Save**. The change takes effect immediately upon the user's next page load.

#### 4.3.3 Viewing Audit Trails

1. Navigate to the **Audit Trails** tab.
2. Use the filters: Date Range, User, Action Type (Login, Create, Update, Delete, Export), Module.
3. Click **Apply Filters** to load the results.
4. Each audit entry shows: Timestamp, User, Action, Module, Affected Record ID, and IP Address.
5. Click **Export** to download the audit trail as a CSV file.

#### 4.3.4 Configuring Data Security Policies

1. Navigate to the **Data Security** tab.
2. Configure settings such as:
   - **Password Policy:** Minimum length, complexity requirements, expiry days.
   - **Session Timeout:** Auto-logout after inactivity (default: 30 minutes).
   - **IP Whitelisting:** Restrict access to specific IP ranges.
   - **Data Encryption:** Toggle field-level encryption for sensitive data (SSN, bank details).
3. Click **Save Configuration**.

### 4.4 Common Scenarios

| Scenario | Action |
|---|---|
| Employee should see only their own salary data | Ensure the employee's role does not have "Payroll: Read Others" permission. The default Employee role restricts payroll visibility to self only. |
| Suspicious login detected | Check the Audit Trails for the user's login history. If the IP address is unfamiliar, force a password reset and enable MFA for that account. |
| Compliance audit request | Export the full audit trail for the requested period and share it with the compliance team. |

### 4.5 Troubleshooting Tips

- **User cannot access a module:** Check their assigned role and permissions. Ensure the role includes the module access permission. Changes may require the user to log out and log back in.
- **Audit trail missing entries:** Audit logging must be enabled in Data Security settings. Contact Super Admin to verify logging is active.

### 4.6 Best Practices

- Follow the **principle of least privilege**: assign the minimum permissions required for each role.
- Review role assignments quarterly and remove unnecessary access.
- Enable MFA for all admin-level accounts (Level 0 and Level 1).
- Export audit trails monthly and archive them per your organization's data retention policy.

---

## 5. Module 4: AI Talent Acquisition

### 5.1 Purpose and Scope

The AI Talent Acquisition module streamlines the entire recruitment lifecycle — from job posting and candidate sourcing to pipeline management and AI-powered onboarding. AI features include candidate fit scoring, resume matching, interview question generation, and a compliance chatbot for onboarding.

### 5.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full access to all talent acquisition features |
| HR Admin | Full access to all talent acquisition features |
| Recruiter | Full access to job postings, candidate pipeline, onboarding |
| Department Manager | View candidates for own department's jobs; approve hiring requests |
| Employee | No access (referrals submitted via Self-Service) |
| Payroll Specialist | No access |
| L&D Manager | View onboarding training assignments |

### 5.3 Step-by-Step Procedures

#### 5.3.1 Posting a New Job

1. Navigate to **Talent Acquisition** in the sidebar.
2. The module opens with three tabs: **Job Postings**, **Candidate Pipeline**, and **AI Onboarding**.
3. On the Job Postings tab, click **Post New Job** (green button, top-right).
4. Fill in the job posting form:
   - **Job Title** (e.g., "Senior Backend Developer")
   - **Department** (select from dropdown)
   - **Location** (e.g., "Bangalore")
   - **Employment Type** (Full-time, Part-time, Contract, Internship)
   - **Experience** (e.g., "3–5 years")
   - **Salary Range** (e.g., "15–22 LPA")
   - **Required Skills** (comma-separated, e.g., "React, Node.js, TypeScript")
   - **Job Description** (free-text area)
5. Note the AI optimization notice: "AI will optimize your job description for better visibility and candidate matching."
6. Click **Publish Job** to make the posting live, or **Cancel** to discard.

#### 5.3.2 Managing the Candidate Pipeline (Kanban)

1. Switch to the **Candidate Pipeline** tab.
2. The pipeline displays as a horizontal Kanban board with six columns: **Applied**, **Screening**, **Interview**, **Offered**, **Hired**, and **Rejected**.
3. Each candidate card shows: Name, Current Company, Experience, Skills (up to 3 with overflow count), Source Badge (Portal, Referral, LinkedIn), and the **AI Fit Score** gauge (circular, color-coded: green ≥75, amber ≥50, red <50).
4. Click a candidate card to open the **Candidate Detail Dialog**.
5. In the detail dialog, review:
   - Contact Information (email, phone)
   - Education
   - **AI Resume Match Analysis** (Overall, Skills, Experience, Education match percentages with progress bars)
   - Full skills list
   - **AI-Generated Interview Questions** tailored to the job and candidate profile
6. To move a candidate between stages, use the action buttons in the detail dialog (Advance, Reject, Schedule Interview).

#### 5.3.3 Using the AI Onboarding Assistant

1. Switch to the **AI Onboarding** tab.
2. View onboarding progress for new hires with a checklist: Document Collection, IT Setup, Policy Acknowledgment, Team Introduction, Training Assignment, First Week Review.
3. Click a new hire's card to expand their onboarding details.
4. Use the **AI Compliance Bot** (floating chat panel):
   - Type questions such as "What documents are pending for Karthik Rao?" or "Check IT setup status."
   - The bot provides real-time compliance status and recommendations.
5. Send messages in the chat input and press **Enter** or click **Send**.

### 5.4 Common Scenarios

| Scenario | Action |
|---|---|
| Too many applicants for one position | Use the AI Fit Score to prioritize high-scoring candidates. Filter by score threshold (e.g., ≥70) before reviewing resumes manually. |
| Candidate declined the offer | Move the candidate to the "Rejected" column with reason "Offer Declined." Revisit the next-best candidate from the "Interview" column. |
| Onboarding compliance gap identified | The AI Compliance Bot will flag gaps automatically. Review the flagged items and take corrective action (e.g., request missing documents). |

### 5.5 Troubleshooting Tips

- **Kanban board not scrolling horizontally:** Use the horizontal scrollbar at the bottom of the pipeline area, or scroll with Shift+Mouse Wheel.
- **AI Fit Score seems inaccurate:** The AI Fit Score is based on keyword matching between the candidate's skills and the job's requirements. It is a recommendation tool, not a definitive assessment — always combine it with human review.
- **Compliance Bot not responding:** Ensure you have a stable internet connection. The bot requires connectivity to the AI backend service. If the issue persists, contact IT Support.

### 5.6 Best Practices

- Always include comprehensive required skills when posting a job; the AI matching quality depends on the specificity of the job requirements.
- Review AI-generated interview questions before sharing them with candidates; customize them to fit your team's evaluation criteria.
- Use the onboarding checklist consistently to ensure no compliance steps are missed for new hires.
- Update the pipeline status promptly after each candidate interaction to maintain accurate recruitment analytics.

---

## 6. Module 5: Time & Attendance

### 6.1 Purpose and Scope

The Time & Attendance module handles daily attendance tracking, leave management, shift scheduling, and geofencing for location-based attendance. It ensures accurate time records for payroll processing and compliance with labor regulations.

### 6.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full access to all attendance, leave, shift, and geofencing features |
| HR Admin | Full access to all attendance, leave, shift, and geofencing features |
| Department Manager | Approve/reject team leaves; view team attendance |
| Employee | Clock in/out, apply for leave, view own attendance |
| Payroll Specialist | View attendance data for payroll processing (read-only) |
| Recruiter | View own attendance only |
| L&D Manager | View own attendance only |

### 6.3 Step-by-Step Procedures

#### 6.3.1 Clocking In/Out

1. Navigate to **Time & Attendance** in the sidebar.
2. On the Attendance tab, click the **Clock In** button when starting work.
3. If geofencing is enabled, the system prompts for location permission. Allow location access to verify you are within the authorized geofence.
4. A green confirmation toast appears with your clock-in time.
5. At the end of the workday, click **Clock Out**. The system records total hours worked.

#### 6.3.2 Applying for Leave

1. Navigate to **Time & Attendance** → **Leave Management** tab.
2. Click **Apply Leave**.
3. Fill in the form:
   - **Leave Type** (Earned Leave, Casual Leave, Sick Leave, Comp Off, Loss of Pay)
   - **From Date** and **To Date** (use date pickers)
   - **Reason** (free text)
   - **Contact During Leave** (phone number)
4. Click **Submit**. The leave request is sent to your Reporting Manager for approval.
5. Track the status: Pending → Approved/Rejected.

#### 6.3.3 Approving Leave Requests (Manager)

1. Navigate to **Time & Attendance** → **Leave Management** tab.
2. Switch to the **Pending Approvals** view.
3. Review each request: employee name, leave type, dates, and reason.
4. Click **Approve** or **Reject** with an optional comment.
5. The employee is notified of the decision via email and in-app notification.

#### 6.3.4 Managing Shifts

1. Navigate to the **Shifts** tab.
2. View the current shift roster in a calendar or list format.
3. To assign a shift, click **Assign Shift**, select the employee(s), and choose the shift template (e.g., Morning 6AM–2PM, General 9AM–6PM, Evening 2PM–10PM, Night 10PM–6AM).
4. Click **Save**. Affected employees are notified.

#### 6.3.5 Configuring Geofencing

1. Navigate to the **Geofencing** tab (available to HR Admin and Super Admin only).
2. Click **Add Geofence**.
3. Enter the office location address or pin it on the map.
4. Set the radius (in meters) for the allowed zone.
5. Click **Save**. Employees must be within this radius to clock in.

### 6.4 Common Scenarios

| Scenario | Action |
|---|---|
| Employee forgot to clock out | The employee or manager can submit a manual time correction request. HR Admin approves the correction. |
| Sick leave taken without prior approval | The employee applies for Sick Leave retroactively within 2 working days. Manager approves with medical certificate. |
| Geofence clock-in fails | Verify location services are enabled on the device. Move closer to the office location. If persistent, contact IT to check the geofence configuration. |

### 6.5 Troubleshooting Tips

- **Geofence not detecting location:** Ensure GPS/Location Services are enabled on your mobile device. Allow location permission for the browser. Some VPNs may interfere with location detection — disable VPN when clocking in.
- **Leave balance showing incorrect:** Leave balances are pro-rated based on joining date and leave policy. Contact HR Admin if the balance seems incorrect after a policy change.

### 6.6 Best Practices

- Clock in and out at the designated times to maintain accurate attendance records.
- Apply for leaves at least 3 days in advance (except Sick Leave) to allow managers to plan coverage.
- Review and approve leave requests within 24 hours to maintain employee trust and operational continuity.
- Audit geofence configurations quarterly to ensure they match current office locations.

---

## 7. Module 6: Payroll & Expenses

### 7.1 Purpose and Scope

The Payroll & Expenses module handles end-to-end payroll processing, expense claim submissions and approvals, and tax declarations. It integrates with attendance data to compute accurate compensation and supports multi-component salary structures.

### 7.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full access: process payroll, manage expenses, configure tax rules |
| HR Admin | Full access: process payroll, manage expenses, configure tax rules |
| Payroll Specialist | Process payroll, manage tax declarations, view expense claims |
| Department Manager | Approve team expense claims; view own payroll |
| Employee | View own payslips, submit expense claims, file tax declarations |
| Recruiter | View own payslips and submit expense claims |
| L&D Manager | View own payslips and submit expense claims |

### 7.3 Step-by-Step Procedures

#### 7.3.1 Processing Payroll

1. Navigate to **Payroll & Expenses** in the sidebar.
2. On the **Payroll** tab, select the payroll month and year.
3. Review the employee payroll summary: gross salary, deductions (PF, ESI, TDS, Professional Tax), and net pay.
4. Click **Run Payroll** to initiate the payroll calculation.
5. The system pulls attendance data from the Time & Attendance module, applies leave deductions, and computes the final amounts.
6. Review the payroll register for accuracy. Flag any discrepancies for manual correction.
7. Click **Approve & Process** to finalize. The system generates payslips and sends them to employee emails.

#### 7.3.2 Submitting an Expense Claim

1. Navigate to the **Expenses** tab.
2. Click **Submit Expense**.
3. Fill in the form:
   - **Expense Category** (Travel, Equipment, Meals, Training, Other)
   - **Amount** (in INR)
   - **Date of Expense**
   - **Description** (purpose and justification)
   - **Receipt Upload** (attach PDF/image, max 5 MB)
4. Click **Submit**. The claim is routed to the Reporting Manager for approval.
5. Track the status: Pending → Manager Approved → Finance Approved → Reimbursed.

#### 7.3.3 Filing Tax Declarations

1. Navigate to the **Tax Declarations** tab.
2. Click **Add Declaration**.
3. Select the investment/deduction category: 80C (PF, PPF, ELSS, Life Insurance), 80D (Health Insurance), HRA, Home Loan Interest, etc.
4. Enter the declared amount and upload supporting documents.
5. Click **Submit**. Declarations must be filed before the deadline (typically January 31st) for the current financial year.

### 7.4 Common Scenarios

| Scenario | Action |
|---|---|
| Payroll discrepancy found after processing | Submit a payroll correction request to the Payroll Specialist. Corrections are applied in the next payroll cycle or as an ad-hoc payment. |
| Expense receipt lost | Attach a self-attested declaration with the expense details. Manager approval is still required. Finance may request additional proof. |
| Tax declaration deadline missed | Contact HR Admin immediately. Late declarations may result in higher TDS deductions. Revised declarations can be submitted with HR approval. |

### 7.5 Troubleshooting Tips

- **Payslip not generated:** Ensure payroll has been processed for the month. Check with the Payroll Specialist for processing timelines.
- **Expense claim auto-rejected:** Verify the expense policy limits (e.g., meal expenses capped at ₹1,500/day). Claims exceeding policy limits are auto-flagged.

### 7.6 Best Practices

- Process payroll by the 25th of each month to ensure payslips are distributed before month-end.
- Submit expense claims within 7 days of the expense date to avoid rejections.
- File tax declarations proactively at the start of the financial year to optimize monthly TDS.

---

## 8. Module 7: Performance & Talent

### 8.1 Purpose and Scope

The Performance & Talent module manages performance review cycles, OKR (Objectives and Key Results) tracking, and AI-powered attrition analysis. It enables continuous feedback, structured reviews, and data-driven talent retention strategies.

### 8.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Configure review cycles, view all performance data, access AI attrition analysis |
| HR Admin | Configure review cycles, view all performance data, access AI attrition analysis |
| Department Manager | Review team performance, set OKRs, approve objectives |
| Employee | Self-assessments, view own OKRs, provide peer feedback |
| Payroll Specialist | No access |
| Recruiter | No access |
| L&D Manager | View skill gaps and training recommendations from performance data |

### 8.3 Step-by-Step Procedures

#### 8.3.1 Initiating a Performance Review Cycle

1. Navigate to **Performance** in the sidebar.
2. On the **Reviews** tab, click **Create Review Cycle**.
3. Enter the cycle name (e.g., "H1 2026 Performance Review"), start date, end date, and review type (360°, Manager-Only, Self+Manager).
4. Select the departments and employees included in the cycle.
5. Configure the rating scale (1–5 or 1–10).
6. Click **Publish**. Invited employees and managers receive notifications to begin the review process.

#### 8.3.2 Setting OKRs

1. Navigate to the **OKRs** tab.
2. Click **Add Objective**.
3. Enter the Objective (e.g., "Improve customer onboarding experience").
4. Add 2–5 Key Results with measurable targets (e.g., "Reduce onboarding time from 14 days to 7 days").
5. Assign the OKR to yourself or a team member.
6. Set the quarter and alignment (company-level, department-level, individual).
7. Click **Save**. Managers approve objectives before they become active.

#### 8.3.3 Using AI Attrition Analysis

1. Navigate to the **AI Attrition** tab.
2. The dashboard displays department-wise attrition risk scores (predicted by AI), comparison with actual attrition, and key risk factors (compensation, engagement score, tenure, manager changes).
3. Click a department to drill down into individual employee risk profiles.
4. Review AI-suggested retention actions (e.g., "Schedule stay interview," "Review compensation alignment," "Assign mentor").
5. Export the attrition risk report for leadership review.

### 8.4 Common Scenarios

| Scenario | Action |
|---|---|
| Employee disagrees with review rating | Initiate a calibration session with HR and the manager. Document the discussion outcome and update the rating if warranted. |
| OKR targets need mid-quarter adjustment | Submit an OKR revision request with justification. Manager approves the change. History of changes is preserved. |
| High attrition risk in a department | Review the AI analysis factors, conduct stay interviews with flagged employees, and implement targeted retention measures within 2 weeks. |

### 8.5 Troubleshooting Tips

- **OKR not appearing for team member:** Ensure the OKR was assigned to the correct employee and approved by the manager. Check the quarter filter.
- **AI attrition scores seem inflated/deflated:** AI models improve with more data. Newly created departments with few employees may have less reliable predictions. Always use AI insights as one input among many.

### 8.6 Best Practices

- Conduct performance reviews at least twice a year (mid-year and annual).
- Set OKRs at the beginning of each quarter with measurable, time-bound key results.
- Review AI attrition predictions monthly and act on high-risk cases within 14 days.
- Encourage a culture of continuous feedback rather than relying solely on formal review cycles.

---

## 9. Module 8: Learning & Development

### 9.1 Purpose and Scope

The Learning & Development (L&D) module manages the corporate course catalog, learning paths, skill inventory, and AI-driven training recommendations. It supports both self-directed and assigned learning to close skill gaps and accelerate professional growth.

### 9.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full access: manage catalog, paths, skills, reports |
| HR Admin | Full access: manage catalog, paths, skills, reports |
| L&D Manager | Full access: manage catalog, paths, skills, reports |
| Department Manager | Assign courses to team; view team learning progress |
| Employee | Browse catalog, enroll in courses, view learning path, update skill profile |
| Payroll Specialist | Browse catalog and enroll |
| Recruiter | Browse catalog and enroll |

### 9.3 Step-by-Step Procedures

#### 9.3.1 Creating a Course

1. Navigate to **Learning & Development** in the sidebar.
2. On the **Course Catalog** tab, click **Create Course**.
3. Fill in the details:
   - **Course Title** (e.g., "Advanced React Patterns")
   - **Category** (Technical, Leadership, Compliance, Soft Skills)
   - **Duration** (e.g., "4 hours")
   - **Format** (Self-paced, Instructor-led, Blended)
   - **Description** and learning objectives
   - **Skills Covered** (tag relevant skills)
4. Upload course materials (videos, PDFs, links).
5. Configure assessments: add quiz questions if applicable.
6. Click **Publish** to make the course available in the catalog.

#### 9.3.2 Creating a Learning Path

1. Navigate to the **Learning Paths** tab.
2. Click **Create Learning Path**.
3. Enter the path name, description, and target role/department.
4. Add courses in the desired sequence by searching and selecting from the catalog.
5. Set prerequisites between courses if needed (e.g., "Complete React Basics before Advanced React").
6. Assign the learning path to employees or departments.
7. Click **Publish**.

#### 9.3.3 Managing the Skill Inventory

1. Navigate to the **Skill Inventory** tab.
2. View a matrix of employees and their skill proficiency levels (Beginner, Intermediate, Advanced, Expert).
3. Filter by department, skill category, or proficiency level.
4. Identify skill gaps: employees with "Beginner" proficiency in critical skills are flagged.
5. Click **Recommend Training** to auto-suggest courses that address identified gaps (AI-powered).

### 9.4 Common Scenarios

| Scenario | Action |
|---|---|
| Compliance training deadline approaching | The system sends automated reminders 14, 7, and 3 days before the deadline. Managers are also notified of non-compliant team members. |
| Employee requests a course not in the catalog | Submit a course request via the "Request Course" button. L&D Manager reviews and either adds the course or suggests an alternative. |
| Skill inventory shows widespread gap in a critical skill | Create a targeted learning path, assign it to the affected department, and track completion over the next quarter. |

### 9.5 Troubleshooting Tips

- **Course video not playing:** Ensure your browser supports HTML5 video. Disable any browser extensions that may block media playback. Check your internet speed — videos require at least 5 Mbps for smooth streaming.
- **Learning path progress not updating:** Course completion is recorded when the learner finishes all modules AND passes the assessment (if applicable). Incomplete modules do not contribute to path progress.

### 9.6 Best Practices

- Update the course catalog quarterly to include emerging technologies and updated compliance requirements.
- Map every learning path to specific OKRs to demonstrate ROI on training investments.
- Encourage employees to self-assess their skill proficiency at least twice a year to keep the inventory current.

---

## 10. Module 9: Analytics & Reporting

### 10.1 Purpose and Scope

The Analytics & Reporting module provides real-time dashboards, predictive analytics powered by AI, and custom report generation. It enables data-driven decision-making across all HR functions by consolidating data from every module into unified views.

### 10.2 Access by Role

| Role | Access Level |
|---|---|
| Super Admin | Full access: all dashboards, predictive analytics, custom reports, export |
| HR Admin | Full access: all dashboards, predictive analytics, custom reports, export |
| Department Manager | Department-specific dashboards and reports |
| Payroll Specialist | Payroll and compensation analytics |
| Employee | No access to this module |
| Recruiter | Recruitment analytics and pipeline reports |
| L&D Manager | Training and skill analytics |

### 10.3 Step-by-Step Procedures

#### 10.3.1 Viewing Real-Time Dashboards

1. Navigate to **Analytics & Reporting** in the sidebar.
2. Select a dashboard from the left panel: **HR Overview**, **Recruitment**, **Attrition**, **Payroll**, **Learning**, or **Attendance**.
3. Each dashboard features interactive charts and KPI cards. Hover over chart elements for detailed tooltips.
4. Use the date range selector at the top to filter data by period.
5. Use the department filter to narrow the view to specific departments.

#### 10.3.2 Using Predictive Analytics

1. Navigate to the **Predictive Analytics** tab.
2. Available predictions include: Attrition Risk, Headcount Forecast, Time-to-Hire Projection, and Training Completion Forecast.
3. Select a prediction model and configure the parameters (e.g., department, time horizon).
4. Click **Run Prediction**. The AI model generates forecasts with confidence intervals.
5. Review the output charts and key findings.

#### 10.3.3 Creating Custom Reports

1. Navigate to the **Custom Reports** tab.
2. Click **Create Report**.
3. Select the data source modules (e.g., Employee + Attendance + Payroll).
4. Choose the fields to include by dragging them from the available fields panel to the report builder.
5. Apply filters (e.g., "Department = Engineering," "Join Date > 2024-01-01").
6. Select the output format: Table, Bar Chart, Line Chart, or Pie Chart.
7. Click **Generate** to preview the report.
8. Click **Export** to download as PDF, Excel, or CSV.

### 10.4 Common Scenarios

| Scenario | Action |
|---|---|
| Need a headcount report for the board meeting | Use the Custom Reports builder: select Employee data source, include fields Department, Designation, Join Date, Status. Filter by Status = Active. Export as PDF. |
| Predict next quarter's attrition | Run the Attrition Risk prediction model with a 3-month horizon. Review the department-level breakdown and individual risk profiles. |
| Compare recruitment efficiency across quarters | Open the Recruitment dashboard, set the date range to the past 4 quarters, and compare the Time-to-Hire and Offer Acceptance Rate charts. |

### 10.5 Troubleshooting Tips

- **Dashboard loading slowly:** Large date ranges with many records can slow down rendering. Narrow the date range or filter by department.
- **Custom report returns no data:** Verify your filters are not too restrictive. Check that the selected data source modules contain data for the specified period.
- **Export file is empty:** Ensure the report has been generated successfully before clicking Export. Re-generate if the preview shows data but the export is blank.

### 10.6 Best Practices

- Schedule recurring reports (e.g., weekly headcount, monthly payroll summary) to automate delivery to stakeholders.
- Always include a date range in custom reports to ensure data relevance.
- Use predictive analytics as a planning tool, not as a sole decision-maker. Validate AI forecasts with domain expertise.

---

## 11. Module 10: Employee Self-Service

### 11.1 Purpose and Scope

The Employee Self-Service (ESS) module empowers employees to manage their own HR-related tasks without depending on HR staff. It includes profile management, company policy access, payslip downloads, leave applications, expense submissions, asset tracking, and an AI-powered HR chatbot assistant.

### 11.2 Access by Role

| Role | Access Level |
|---|---|
| All Roles | Full access to own data: profile, policies, payslips, leave, expenses, assets, AI chatbot |

### 11.3 Step-by-Step Procedures

#### 11.3.1 Viewing and Editing Your Profile

1. Navigate to **Self-Service** in the sidebar.
2. A personalized welcome banner displays your name, leave balance, and pending task count.
3. Use the **Quick Actions** grid (Apply Leave, View Payslip, Submit Expense, Update Profile, Company Policies, Training Portal) for one-click access to common tasks.
4. Switch to the **My Profile** tab.
5. Review your Personal Information (name, email, phone, location, join date) and Employment Details (designation, department, job title, contract type, manager, work mode).
6. Click the **Edit** button (top-right of the Personal Information card) to update your contact details.
7. After making changes, click **Save**.

#### 11.3.2 Browsing Company Policies

1. Switch to the **Company Policies** tab.
2. Use the **search bar** to find policies by keyword.
3. Filter by category using the category buttons: All, Leave, Compliance, Work Policy, Finance, Security, HR.
4. Click a policy card to expand its content. The content renders in a readable format with headings, lists, and links.
5. Each policy displays its category badge, version number, and effective date.

#### 11.3.3 Using the AI HR Assistant Chatbot

1. Switch to the **AI Assistant** tab.
2. The chat interface opens with a welcome message from the AI HR Assistant.
3. Type your question in the input field at the bottom (e.g., "What is the leave policy?", "How to apply for expense reimbursement?", "When is the next holiday?", "What are my tax benefits?").
4. Press **Enter** or click the **Send** button.
5. The AI processes your query and responds with relevant, context-aware answers drawn from company policies, HR data, and general HR knowledge.
6. Use the **suggested query chips** displayed above the input field for quick access to common questions.
7. The chat history is preserved within the session. Start a new session to clear previous messages.

### 11.4 Common Scenarios

| Scenario | Action |
|---|---|
| Need to update emergency contact | Go to My Profile → Edit → update the emergency contact field → Save. Changes are reflected immediately. |
| Want to know company holiday list | Ask the AI Assistant: "When is the next holiday?" or browse Company Policies → category "Leave." |
| Download payslip for loan application | Use the Quick Action "View Payslip" or go to My Profile → Recent Payslips → click the download icon next to the desired month. |

### 11.5 Troubleshooting Tips

- **AI Assistant not responding:** Check your internet connection. The chatbot requires real-time API access. If the issue persists, try refreshing the page.
- **Profile edit not saving:** Ensure all required fields are filled. The system highlights missing required fields in red. Address the validation errors and try saving again.
- **Payslip download fails:** Verify that the payroll for the requested month has been processed. Payslips are only available after the Payroll Specialist completes processing.

### 11.6 Best Practices

- Keep your profile information up to date, especially contact details and emergency contacts.
- Use the AI Assistant as your first point of contact for HR queries — it can resolve most common questions instantly, saving you and the HR team time.
- Review company policies at least once per quarter to stay informed of any updates.

---

## 12. Glossary of Terms

| Term | Definition |
|---|---|
| **AI Fit Score** | A machine learning-generated score (0–100) that indicates how well a candidate's profile matches a job's requirements. Higher scores indicate better alignment. |
| **Audit Trail** | A chronological record of all user actions within the system, used for compliance and security monitoring. |
| **Attrition** | The rate at which employees leave an organization, typically expressed as a percentage of the workforce. |
| **CRUD** | Create, Read, Update, Delete — the four basic operations for data management. |
| **ESS** | Employee Self-Service — a module that allows employees to manage their own HR tasks. |
| **Geofencing** | A location-based technology that defines virtual boundaries; used to restrict attendance clock-in to authorized physical locations. |
| **Kanban** | A visual project management method using columns to represent workflow stages. Used in the candidate pipeline. |
| **LPA** | Lakhs Per Annum — a salary denomination commonly used in India. 1 Lakh = ₹100,000. |
| **MFA** | Multi-Factor Authentication — a security method requiring two or more verification factors to access an account. |
| **OKR** | Objectives and Key Results — a goal-setting framework that defines objectives and tracks measurable outcomes. |
| **PF** | Provident Fund — a retirement savings scheme mandatory in India, with contributions from both employee and employer. |
| **RBAC** | Role-Based Access Control — a security model that restricts system access based on the user's assigned role. |
| **TDS** | Tax Deducted at Source — income tax withheld by the employer from the employee's salary and remitted to the government. |
| **360° Review** | A performance evaluation method that collects feedback from an employee's manager, peers, subordinates, and self-assessment. |

---

## 13. Frequently Asked Questions

### General

**Q: How do I reset my password?**  
A: Click "Forgot Password" on the login screen. Enter your corporate email. A reset link will be sent to your inbox. The link expires in 30 minutes.

**Q: Can I access AI-HRMS on my mobile phone?**  
A: Yes. AI-HRMS is a responsive web application that works on mobile browsers. Open the URL in your phone's browser. The sidebar converts to a slide-out drawer on smaller screens.

**Q: How do I switch between light and dark mode?**  
A: Click the Settings button in the sidebar footer. Toggle the "Theme" option between Light and Dark.

### Employee Management

**Q: How long does it take for a new employee to receive login credentials?**  
A: Login credentials are generated automatically when an employee record is created. The welcome email is typically sent within 5 minutes.

### Time & Attendance

**Q: What if I forget to clock in?**  
A: Submit a manual time correction request through the Time & Attendance module. Your manager must approve it.

**Q: Can I apply for half-day leave?**  
A: Yes. When applying for leave, select the "Half Day" option and specify First Half or Second Half.

### Payroll

**Q: When are payslips generated?**  
A: Payslips are generated after the Payroll Specialist processes payroll for the month, typically by the 25th–28th of each month.

**Q: How do I update my bank account for salary credit?**  
A: Go to Self-Service → My Profile → Edit → update the bank account details. Upload a cancelled cheque or bank statement as proof. HR Admin must verify the change.

### AI Features

**Q: How accurate is the AI Fit Score?**  
A: The AI Fit Score is a recommendation based on keyword and semantic matching. It should be used as a filtering aid, not as the sole decision criterion. Human review is always recommended.

**Q: Does the AI Assistant store my chat history?**  
A: Chat sessions are stored temporarily for context continuity within a session. Chat data is not used for training models and is purged after 30 days per the data retention policy.

**Q: Can I trust the AI attrition predictions?**  
A: AI attrition predictions are based on historical patterns and current data signals. They are probabilistic, not deterministic. Use them as early warning indicators and validate with qualitative assessments.

---

## 14. Contact & Support

### Support Channels

| Channel | Details | Availability |
|---|---|---|
| **Email Support** | hrms-support@company.com | 24/7 (response within 4 hours) |
| **Phone Support** | +91-1800-XXX-XXXX (Toll-Free) | Mon–Fri, 9:00 AM – 6:00 PM IST |
| **In-App Support** | Use the AI Assistant in Self-Service module | 24/7 |
| **IT Helpdesk** | helpdesk@company.com | Mon–Fri, 8:00 AM – 8:00 PM IST |

### Escalation Matrix

| Level | Contact | Response Time | When to Escalate |
|---|---|---|---|
| Level 1 | AI Assistant / Email Support | 4 hours | General queries, how-to questions |
| Level 2 | HR Admin (your organization) | 2 hours | Data corrections, access issues |
| Level 3 | IT Helpdesk | 1 hour | System outages, security incidents |
| Level 4 | Super Admin / CISO | 30 minutes | Critical security breaches, data leaks |

### Reporting a Bug

When reporting a bug, please include:

1. **Module name** where the issue occurred
2. **Steps to reproduce** the issue (numbered list)
3. **Expected behavior** vs. **actual behavior**
4. **Screenshots** (if applicable)
5. **Browser and device** information
6. **Timestamp** of the occurrence

Send bug reports to `hrms-support@company.com` with the subject line: `[BUG] Module Name – Brief Description`.

### Feature Requests

To request a new feature or enhancement:

1. Email `hrms-support@company.com` with subject: `[FEATURE REQUEST] Brief Description`.
2. Include a description of the problem the feature would solve and any relevant examples.
3. The product team reviews requests on a bi-weekly cycle and responds with a status update.

---

**Document End**

*This SOP is maintained by the HRMS Product Team. Last reviewed: March 2026. Next review: September 2026.*

*For the latest version, visit the AI-HRMS internal wiki at `https://hrms.yourcompany.com/docs/sop`.*
