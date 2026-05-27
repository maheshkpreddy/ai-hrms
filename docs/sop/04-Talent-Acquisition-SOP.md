# SOP 04 — AI Talent Acquisition Module

**Module Key:** `talent`  
**Component:** `src/components/hrms/TalentAcquisition.tsx`  
**API Routes:** `GET/POST/PATCH/DELETE /api/jobs`, `GET/POST/PATCH/DELETE /api/candidates`  
**Document Version:** 1.0  
**Last Updated:** 2025-02-27  
**Classification:** Internal — HR Operations  

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Screen Descriptions](#3-screen-descriptions)
4. [Functional Workflows](#4-functional-workflows)
5. [AI Fit Score Algorithm](#5-ai-fit-score-algorithm)
6. [Data Flow](#6-data-flow)
7. [Integration with Other Modules](#7-integration-with-other-modules)
8. [Role-Based Access](#8-role-based-access)
9. [Business Rules](#9-business-rules)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Module Overview

### 1.1 Purpose

The AI Talent Acquisition Module is the central recruitment and onboarding engine of the AI-HRMS platform. It provides end-to-end lifecycle management for job postings and candidates, from requisition creation through hiring and onboarding completion. The module is designed to eliminate manual overhead in the recruitment pipeline by leveraging artificial intelligence to assess candidate suitability, generate role-specific interview questions, and recommend onboarding actions. It replaces fragmented spreadsheet-based tracking and email-driven workflows with a unified, visual pipeline that gives recruiters and HR administrators real-time visibility into every open position and every applicant.

### 1.2 Scope

This module covers the following functional areas:

- **Job Posting Management** — Creating, editing, filtering, and status-tracking of open positions across all departments.
- **Candidate Pipeline** — A Kanban-style visual pipeline that tracks candidates through six discrete stages: Applied → Screening → Interview → Offered → Hired / Rejected.
- **AI-Powered Fit Scoring** — Automatic calculation of a 0–100 fit score for each candidate based on a skill-matching heuristic against job requirements, displayed as a circular gauge on every candidate card and detailed breakdown in the candidate profile.
- **AI Interview Question Generation** — Context-aware interview questions generated based on the job title and domain (engineering, data science, marketing, HR, DevOps, etc.) to standardize and improve interview quality.
- **Onboarding Management** — A structured onboarding checklist system for hired candidates, with AI-generated recommendations for training, mentoring, and cross-functional introductions.
- **AI Compliance Bot** — An interactive chat-based assistant that helps HR users verify onboarding compliance for document collection, policy acknowledgment, and IT setup.

### 1.3 Target Users

| User Role | Primary Use |
|---|---|
| **Super Admin** | Full access to all job postings, candidates, pipeline management, and onboarding oversight. Can configure system-wide settings and audit recruitment activity. |
| **HR Admin** | Manages the complete recruitment lifecycle — creates job postings, reviews candidates, moves them through the pipeline, schedules interviews, makes offers, and oversees onboarding. |
| **Recruiter** | Focuses on candidate sourcing, screening, and pipeline management. Can add candidates, review AI fit scores, and advance candidates through early pipeline stages. |

### 1.4 AI Capabilities

The module integrates AI in three distinct areas:

1. **AI Fit Score** — Automatically computed on candidate creation using a skill-matching heuristic (detailed in Section 5). Scores range from 0–100 and are displayed as a circular gauge with color coding: green (≥75), amber (50–74), red (<50).
2. **AI-Generated Interview Questions** — Dynamically generated based on job title keywords, producing domain-relevant questions for engineering, data science, marketing, HR, and DevOps roles, with generic fallback questions for other positions.
3. **AI Onboarding Recommendations** — Personalized recommendations for each new hire, including role-specific training based on skill gap analysis, mentoring pair suggestions, and cross-functional introduction scheduling.

---

## 2. Access & Navigation

### 2.1 Entry Points

The Talent Acquisition module is accessible through the following navigation paths:

- **Sidebar Navigation:** Click **"Talent Acquisition"** in the left sidebar under the HRMS modules section. The sidebar icon uses the `Briefcase` icon from Lucide.
- **Direct URL:** Navigate to the main application URL and select the Talent Acquisition tab from the sidebar.
- **Dashboard Link:** The Dashboard module may display recruitment KPIs (open positions, total applications) with click-through links to the Talent Acquisition module.

### 2.2 Module Layout

The module renders a full-page interface with the following structure:

1. **Page Header** — Displays the title "Talent Acquisition & Onboarding" with the subtitle "AI-powered recruitment, candidate pipeline, and onboarding management" and an "AI Powered" badge indicator.
2. **Tab Navigation** — Three primary tabs control the view:
   - **Job Postings** (icon: Briefcase) — Default active tab. Shows job listing grid with stats, filters, and search.
   - **Candidate Pipeline** (icon: Users) — Kanban-style board with columns for each pipeline stage.
   - **AI Onboarding** (icon: UserCheck) — Onboarding management for hired candidates with AI compliance bot.
3. **Content Area** — Dynamically renders based on the selected tab, with responsive layout that adapts to mobile (compact labels), tablet, and desktop viewports.

### 2.3 Responsive Behavior

- On mobile screens (`sm` breakpoint), tab labels collapse to shorter text (e.g., "Job Postings" becomes "Jobs", "Candidate Pipeline" becomes "Pipeline").
- The pipeline Kanban board uses horizontal scrolling on smaller screens.
- The onboarding grid shifts from a 3-column layout (2/3 + 1/3) to a single column on mobile.

---

## 3. Screen Descriptions

### 3.1 Job Postings Tab

The Job Postings tab is the default landing view for the Talent Acquisition module. It provides a comprehensive overview of all open, closed, and on-hold positions across the organization.

**Statistics Row (Top)**

Four summary cards are displayed in a responsive 2×2 grid (4 columns on large screens):

| Stat Card | Description | Icon |
|---|---|---|
| Open Positions | Count of jobs with `status = 'open'` | Briefcase (emerald) |
| Total Applications | Sum of `applicants` count across all jobs | Users (amber) |
| Avg Time to Hire | Average days from candidate creation to hire date, calculated from hired candidates with interview dates. Falls back to 18 days when no data is available. | Clock (cyan) |
| Offer Acceptance | Percentage of candidates who accepted offers (hired / [offered + hired]). Falls back to 87% when no data is available. | CheckCircle (teal) |

Each card has a gradient accent bar at the bottom for visual emphasis.

**Filters & Search Bar**

A toolbar row provides:
- **Search Input** — Free-text search that filters jobs by title, department, or location (case-insensitive `contains` query). Includes a clear (×) button.
- **Department Filter** — Dropdown populated dynamically from distinct departments found in existing job records. Select "All Departments" to remove the filter.
- **Status Filter** — Dropdown with options: All Status, Open, Closed.
- **Post New Job Button** — Emerald-colored action button that opens the job creation dialog.

**Job Cards Grid**

Jobs are rendered as cards in a responsive grid (1 column on mobile, 2 on medium, 3 on large screens). Each card displays:

- **Title** (top-left) and **Status Badge** (top-right, emerald for "Open", slate for "Closed")
- **Meta Info Row** — Department (Building2 icon), Location (MapPin icon), Employment Type (Clock icon)
- **Salary** (DollarSign icon, emerald text) and **Experience** requirement
- **Skills/Requirements** — Rendered as outline badges, sourced from the `requirements` JSON field
- **Footer** — Applicant count (Users icon), Posted Date (Calendar icon), and "View" link

Empty state: When no jobs match filters, a centered message displays "No jobs found" with a suggestion to adjust filters.

### 3.2 Candidate Pipeline Tab

The Candidate Pipeline tab presents a Kanban-style board with six columns, one for each pipeline stage. This visual layout allows recruiters to see the distribution and progress of candidates at a glance.

**Toolbar**

- **Title** — "Candidate Pipeline" heading
- **Search Input** — Filters candidates by name, email, or current company (case-insensitive)
- **Add Candidate Button** — Opens the candidate creation dialog

**Pipeline Columns**

| Column | Label | Color Theme | Description |
|---|---|---|---|
| `applied` | Applied | Slate | Initial stage for all newly added candidates |
| `screening` | Screening | Amber | Candidates under initial review |
| `interview` | Interview | Cyan | Candidates scheduled for or in interview process |
| `offered` | Offered | Emerald | Candidates who have received an offer |
| `hired` | Hired | Teal | Candidates who accepted the offer and are onboarded |
| `rejected` | Rejected | Rose | Candidates who were not selected |

Each column header shows the stage label, a count badge, and a colored background. The board scrolls horizontally on smaller screens (each column is fixed at 288px / `w-72`).

**Candidate Cards (within each column)**

Each candidate card is clickable and displays:
- **Avatar** — Initials with gradient background (emerald-to-teal)
- **Name** and **Current Company** (or "No company")
- **AI Fit Score Gauge** — Circular SVG gauge (44px) with the numeric score and "AI" label. Color-coded: green (≥75), amber (50–74), red (<50). Rendered only when `aiFitScore` is not null.
- **Experience** — Text display (or "N/A")
- **Skills** — Up to 3 skill badges shown, with a "+N" overflow badge if more exist
- **Source Badge** — Color-coded by source: Portal (emerald), Referral (amber), LinkedIn (cyan), Other (slate)
- **Interview Date** — Displayed if set (Calendar icon, formatted as "day month")

Empty columns show a dashed-border placeholder with "No candidates" text.

### 3.3 Candidate Profile Dialog

Clicking any candidate card opens a detailed profile dialog (`sm:max-w-2xl`, scrollable). The dialog contains:

**Header Section**
- Large avatar (56px) with initials
- Candidate name and subtitle (current company · experience)

**Contact Information & Education**
- Two-column grid showing email (Mail icon), phone (Phone icon), and education (GraduationCap icon)

**AI Resume Match Analysis**
- Section header with "AI" badge
- Four metric cards in a 2×2 grid (4 columns on larger screens):
  - **Overall** — The `aiFitScore` value from the candidate record
  - **Skills** — Percentage of job requirements matched by candidate skills
  - **Experience** — Derived score based on skills match with variance
  - **Education** — Estimated score based on educational background
- Each metric shows a numeric percentage, a label, and a progress bar

**Skills Section**
- All candidate skills displayed as outline badges

**AI-Generated Interview Questions**
- Section header with "AI" badge
- Four role-specific interview questions, each displayed in a bordered card with a numbered circle (emerald)
- Questions are dynamically selected based on the job title keywords:
  - Developer/Engineer roles → architecture, microservices, TypeScript, database optimization
  - Data Science/ML roles → model deployment, class imbalance, model serving, recommendation metrics
  - Marketing roles → attribution modeling, A/B testing, SEO, ROI measurement
  - HR roles → recruitment processes, compliance, HRIS optimization, harassment handling
  - DevOps/Cloud roles → infrastructure as code, CI/CD, AWS cost optimization, container security
  - Default/Other → general leadership, problem-solving, cross-functional teams, continuous learning

**Footer Actions**
- "Close" button (outline)
- "Schedule Interview" button (emerald, with Calendar icon)

### 3.4 AI Onboarding Tab

The AI Onboarding tab manages the post-hire transition of candidates into employees. It uses a 3-column grid layout (2/3 + 1/3 on large screens).

**New Hires List (Left 2/3)**

- Section header: "New Hires Onboarding" with "AI Enhanced" badge
- Each hired candidate with an `onboardingStatus` value is displayed as an expandable card:
  - **Collapsed View** — Avatar, name, designation/department, start date, progress percentage, and task completion count. A progress bar shows overall completion.
  - **Expanded View** — Reveals two sub-sections:
    - **Onboarding Checklist** — Six standard items with completion status:
      1. Document Collection (FileText icon)
      2. IT Setup (Monitor icon)
      3. Policy Acknowledgment (BookOpen icon)
      4. Team Introduction (UsersRound icon)
      5. Training Assignment (GraduationCap icon)
      6. First Week Review (BarChart3 icon)
    - **AI Recommendations** — Three personalized suggestions per hire:
      - Role-specific training based on skill gap analysis
      - Mentoring pair with senior team member
      - Cross-functional team introductions

Empty state: When no hired candidates have onboarding status, a centered message displays "No active onboarding" with a note that hired candidates will appear here.

**Right Sidebar (1/3)**

Contains two cards:

1. **Onboarding Overview** — Statistics: Total New Hires, Completed count, In Progress count, Average Progress percentage with progress bar.
2. **Checklist Status** — Per-item completion statistics showing how many hires have completed each of the six checklist items, with visual progress indicators.
3. **AI Compliance Bot** — A chat interface with a bot that answers onboarding compliance questions. The bot provides pre-programmed responses for:
   - Document collection compliance (ID proof, address proof, certificates, employment letter, bank details)
   - Policy compliance (Code of Conduct, Data Security Policy, Remote Work Guidelines within 3 days)
   - IT setup (laptop, email, VPN, Slack, Jira/GitHub access)
   - General onboarding guidance

---

## 4. Functional Workflows

### 4.1 Creating a Job Posting

**Objective:** Create and publish a new job requisition to attract candidates.

**Steps:**

1. Navigate to the **Job Postings** tab in the Talent Acquisition module.
2. Click the **"Post New Job"** button (emerald, with Plus icon) in the top-right toolbar. This opens the job creation dialog.
3. Fill in the required and optional fields:
   - **Job Title** (required) — e.g., "Senior Backend Developer". The Publish button is disabled until this field has content.
   - **Department** (optional) — Select from: Engineering, Human Resources, Finance, Marketing, Sales, Operations, Product, Customer Support.
   - **Location** (optional) — Free-text, e.g., "Bangalore".
   - **Employment Type** (optional) — Select from: Full-time, Part-time, Contract, Internship.
   - **Experience** (optional) — Free-text, e.g., "3-5 years".
   - **Salary Range** (optional) — Free-text, e.g., "15-22 LPA".
   - **Required Skills** (optional) — Comma-separated, e.g., "React, Node.js, TypeScript". These values are stored as both `requirements` and `skills` JSON arrays.
   - **Job Description** (optional) — Multi-line text area for role details and qualifications.
4. Review the AI optimization notice at the bottom of the form: "AI will optimize your job description for better visibility and candidate matching."
5. Click **"Publish Job"** to submit. The button shows a loading spinner during submission.
6. On success, the dialog closes, the job list refreshes, and the new job appears in the grid with `status = 'open'` and today's date as `postedDate`.
7. On failure, an error banner appears at the top of the dialog with the error message. Correct the issue and retry.

**API Call:** `POST /api/jobs` with JSON body containing all form fields. The API sets `status: 'open'` and `postedDate` to the current date automatically. Returns `201 Created` on success.

### 4.2 Managing Job Status (Open / Closed / On-Hold)

**Objective:** Update the status of an existing job posting to reflect its current hiring state.

**Steps:**

1. Navigate to the **Job Postings** tab.
2. Locate the job card whose status needs to be changed. Use the search bar or department/status filters if needed.
3. Use the **Status Filter** dropdown to verify the current status, or identify the status badge on the job card (emerald for "Open", slate for "Closed").
4. To change the job status, an API call must be made:
   - `PATCH /api/jobs` with `{ id: <jobId>, status: 'open' | 'closed' | 'on-hold' }`
5. The API validates that the status value is one of the three allowed values. Invalid status values are silently ignored.
6. On success, the job card updates to reflect the new status badge.

**Status Definitions:**

| Status | Meaning |
|---|---|
| `open` | Actively accepting applications. Visible to candidates and recruiters. |
| `closed` | No longer accepting applications. Position is filled or cancelled. |
| `on-hold` | Temporarily paused. Hiring may resume later. |

**Note:** Only jobs with `status = 'open'` appear in the candidate creation form's job position dropdown. Changing a job to "closed" or "on-hold" prevents new candidates from being added to it through the UI.

### 4.3 Adding Candidates to a Job

**Objective:** Register a new candidate against an open job position, with automatic AI fit score calculation.

**Steps:**

1. Navigate to the **Candidate Pipeline** tab.
2. Click the **"Add Candidate"** button (emerald, with Plus icon). This opens the candidate creation dialog.
3. Fill in the required and optional fields:
   - **Job Position** (required) — Dropdown showing only jobs with `status = 'open'`. This is mandatory; the form cannot be submitted without selecting a job.
   - **Full Name** (required) — e.g., "Aditya Sharma"
   - **Email** (required) — e.g., "aditya@email.com". Must be a valid email format.
   - **Phone** (optional) — e.g., "+91-9900011122"
   - **Current Company** (optional) — e.g., "TechCorp"
   - **Experience** (optional) — e.g., "5 years"
   - **Education** (optional) — e.g., "B.Tech, IIT Delhi"
   - **Skills** (optional) — Comma-separated, e.g., "React, Node.js, TypeScript". These are parsed into a JSON array and used for AI fit score computation.
   - **Source** (optional, default: "portal") — Select from: Portal, Referral, LinkedIn, Other.
4. Click **"Add Candidate"** to submit. The button shows a loading spinner during submission. The button is disabled if name, email, or jobId is empty.
5. On success:
   - The dialog closes.
   - The candidate list refreshes.
   - The job list also refreshes to update applicant counts.
   - The new candidate appears in the **Applied** column of the pipeline with their AI fit score calculated automatically.
6. On failure, an error banner appears with the error message.

**API Call:** `POST /api/candidates` with JSON body. The API automatically:
- Sets `status: 'applied'`
- Computes and assigns `aiFitScore` (see Section 5 for algorithm details)
- Validates that the referenced job exists (returns 404 if not found)
- Returns `201 Created` on success

### 4.4 Reviewing AI Fit Scores

**Objective:** Understand and interpret the AI-generated fit scores for candidates to make informed screening decisions.

**Steps:**

1. Navigate to the **Candidate Pipeline** tab.
2. Each candidate card in the pipeline displays an **AI Fit Score Gauge** — a circular SVG visualization in the top-right corner of the card.
3. Interpret the score using the color coding:
   - **Green (≥75):** Strong match — candidate's skills closely align with job requirements. Prioritize for screening.
   - **Amber (50–74):** Moderate match — partial skill alignment. Review profile details for potential.
   - **Red (<50):** Weak match — significant skill gaps. Consider for rejection or alternative positions.
4. Click on a candidate card to open the **Candidate Profile Dialog**.
5. In the profile dialog, review the **AI Resume Match Analysis** section for a detailed breakdown:
   - **Overall Score** — The computed `aiFitScore` (0–100)
   - **Skills Match** — Percentage of job requirements that the candidate's skills match (exact calculation, not randomized)
   - **Experience Score** — Derived from skills match with a small variance factor
   - **Education Score** — Estimated based on educational background
6. Use these scores to prioritize which candidates to advance to the Screening stage. Candidates with higher overall and skills scores should be moved first.

**Important:** The AI fit score is calculated once at the time of candidate creation. It does not automatically recalculate if job requirements change. If job requirements are updated, consider re-adding candidates or manually reviewing their fit.

### 4.5 Moving Candidates Through the Pipeline

**Objective:** Advance or transition candidates through the recruitment pipeline stages.

**Pipeline Stages and Valid Transitions:**

```
applied → screening → interview → offered → hired
    │         │           │          │
    └─────────┴───────────┴──────────┴──→ rejected
```

Any candidate can be moved to `rejected` from any stage. Forward progression follows the linear path from `applied` through `hired`.

**Steps:**

1. Navigate to the **Candidate Pipeline** tab.
2. Locate the candidate card in their current stage column. Use the search bar if needed.
3. To update a candidate's status, an API call must be made:
   - `PATCH /api/candidates` with `{ id: <candidateId>, status: '<newStatus>' }`
4. The API validates that the status is one of the six allowed values: `applied`, `screening`, `interview`, `offered`, `hired`, `rejected`.
5. On success, the candidate card moves to the corresponding pipeline column on the next data refresh.

**Stage Descriptions:**

| Stage | Purpose | Typical Actions |
|---|---|---|
| **Applied** | Initial application received | Review AI fit score, check basic qualifications |
| **Screening** | Under initial review | Verify resume details, assess skill match, phone screen |
| **Interview** | Scheduled for interview | Set interview date, add notes, generate AI interview questions |
| **Offered** | Extended an offer | Document offer terms, await acceptance |
| **Hired** | Offer accepted, joining | Initiate onboarding process, set onboarding status |
| **Rejected** | Not selected | Document rejection reason, close candidate record |

### 4.6 Scheduling Interviews

**Objective:** Schedule an interview for a candidate and add interview notes.

**Steps:**

1. Navigate to the **Candidate Pipeline** tab and locate the candidate in the **Screening** or **Interview** column.
2. Click on the candidate card to open the **Candidate Profile Dialog**.
3. Review the **AI-Generated Interview Questions** section for role-specific questions to use during the interview.
4. Click the **"Schedule Interview"** button in the dialog footer.
5. To record the interview schedule, an API call must be made:
   - `PATCH /api/candidates` with `{ id: <candidateId>, interviewDate: '<ISO-date-string>', status: 'interview' }`
6. After the interview, add notes:
   - `PATCH /api/candidates` with `{ id: <candidateId>, interviewNotes: '<notes-text>' }`
7. The interview date is displayed on the candidate card in the pipeline (Calendar icon) and in the profile dialog.

**Interview Question Categories:**

The AI generates four questions per candidate based on job title analysis:

| Job Title Pattern | Sample Questions |
|---|---|
| Developer/Engineer/Full Stack | Component architecture, microservices migration, TypeScript generics, query optimization |
| Data Scientist/ML | Model deployment, class imbalance, model serving, recommendation metrics |
| Marketing | Attribution modeling, A/B testing, SEO strategy, ROI measurement |
| HR/Human Resources | Recruitment processes, compliance, HRIS optimization, harassment handling |
| DevOps/Cloud/Infrastructure | Infrastructure as code, CI/CD pipelines, AWS cost optimization, container security |
| Default | Leadership, problem-solving, cross-functional teams, continuous learning |

### 4.7 Making Offers

**Objective:** Extend a job offer to a candidate who has successfully completed the interview process.

**Steps:**

1. Ensure the candidate is in the **Interview** stage and interview notes have been recorded.
2. Move the candidate to the **Offered** stage:
   - `PATCH /api/candidates` with `{ id: <candidateId>, status: 'offered' }`
3. The candidate card moves to the "Offered" column in the pipeline.
4. If the candidate accepts the offer, proceed to Section 4.8 (Onboarding).
5. If the candidate declines, move them to **Rejected**:
   - `PATCH /api/candidates` with `{ id: <candidateId>, status: 'rejected' }`

**Offer Acceptance Metrics:** The module tracks offer acceptance rate automatically — calculated as `hired / (offered + hired) * 100`. This metric is displayed on the Job Postings tab stats row.

### 4.8 Onboarding Hired Candidates

**Objective:** Transition a hired candidate into an employee through a structured onboarding process.

**Steps:**

1. After the candidate accepts the offer, move them to the **Hired** stage:
   - `PATCH /api/candidates` with `{ id: <candidateId>, status: 'hired' }`
2. Set the onboarding status to initiate the onboarding process:
   - `PATCH /api/candidates` with `{ id: <candidateId>, onboardingStatus: 'in-progress' }`
3. Navigate to the **AI Onboarding** tab. The new hire now appears in the "New Hires Onboarding" list.
4. Expand the hire's card to view the onboarding checklist:
   - Document Collection
   - IT Setup
   - Policy Acknowledgment
   - Team Introduction
   - Training Assignment
   - First Week Review
5. As each checklist item is completed, update the onboarding status. When all items are done:
   - `PATCH /api/candidates` with `{ id: <candidateId>, onboardingStatus: 'completed' }`
6. Review the **AI Recommendations** for the hire:
   - Role-specific training based on skill gap analysis
   - Mentoring pair assignment with a senior team member
   - Cross-functional team introduction scheduling
7. Use the **AI Compliance Bot** (right sidebar) to verify compliance for:
   - Document collection requirements (ID proof, address proof, certificates, employment letter, bank details)
   - Policy acknowledgment status (Code of Conduct, Data Security Policy, Remote Work Guidelines within 3 days)
   - IT setup completion (laptop, email, VPN, Slack, Jira/GitHub)
8. Once all checklist items are completed and compliance is verified, the onboarding is marked as complete with a green "Complete" badge.

**Onboarding Status Values:**

| Status | Meaning |
|---|---|
| `pending` | Onboarding has not yet started |
| `in-progress` | Onboarding is actively underway |
| `completed` | All checklist items are finished |

---

## 5. AI Fit Score Algorithm

### 5.1 Overview

The AI Fit Score is an automated heuristic-based scoring system that evaluates how well a candidate's skills align with a job's requirements. The score is computed at the time of candidate creation and stored in the `aiFitScore` field of the Candidate record. It ranges from 0 to 100 and is used to help recruiters quickly prioritize candidates for screening.

### 5.2 Algorithm Implementation

The algorithm is implemented in the `POST /api/candidates` route handler. Here is the step-by-step computation:

**Step 1: Parse Job Requirements**

```
jobRequirements = JSON.parse(job.requirements) || []
```

The job's `requirements` field is a JSON string containing an array of skill/requirement strings (e.g., `["React", "Node.js", "TypeScript"]`). It is parsed into an array for matching.

**Step 2: Parse Candidate Skills**

```
candidateSkills = body.skills || []
```

The candidate's `skills` field is provided as an array in the request body (e.g., `["React", "Python", "TypeScript"]`).

**Step 3: Compute Matched Skills**

```
matchedSkills = candidateSkills.filter(candidateSkill =>
  jobRequirements.some(requirement =>
    requirement.toLowerCase().includes(candidateSkill.toLowerCase()) ||
    candidateSkill.toLowerCase().includes(requirement.toLowerCase())
  )
)
```

For each candidate skill, the algorithm checks if any job requirement contains the skill string or if the skill string contains the requirement string (case-insensitive). This bidirectional substring matching handles cases where:
- The candidate skill is a subset of the requirement (e.g., skill "React" matches requirement "React.js")
- The requirement is a subset of the skill (e.g., skill "JavaScript ES6+" matches requirement "JavaScript")

**Step 4: Calculate Base Score**

```
if (jobRequirements.length > 0) {
  baseScore = Math.round((matchedSkills.length / jobRequirements.length) * 70)
} else {
  baseScore = 0
}
```

When job requirements exist, the ratio of matched skills to total requirements is multiplied by 70. This means a perfect skill match yields a base score of 70, leaving room for additional factors to bring the score closer to 100.

**Step 5: Add Variance and Floor**

```
if (jobRequirements.length > 0) {
  aiFitScore = Math.min(100, baseScore + Math.floor(Math.random() * 20) + 10)
} else {
  aiFitScore = Math.floor(Math.random() * 30) + 40
}
```

- **When requirements exist:** A random value between 10 and 29 is added to the base score, capped at 100. This simulates additional factors (experience weighting, education relevance) that would be evaluated in a more sophisticated model.
- **When no requirements exist:** A random score between 40 and 69 is assigned, as there is no basis for skill matching.

### 5.3 Score Interpretation

| Score Range | Color | Interpretation |
|---|---|---|
| 75–100 | Green (`#10b981`) | Strong match. Candidate skills closely align with job requirements. Recommend fast-tracking through screening. |
| 50–74 | Amber (`#f59e0b`) | Moderate match. Partial alignment with requirements. Review profile for compensating strengths. |
| 0–49 | Red (`#ef4444`) | Weak match. Significant skill gaps relative to job requirements. Consider for alternative roles or rejection. |

### 5.4 Resume Match Analysis (Client-Side)

The Candidate Profile Dialog also performs a client-side resume match analysis using the `getResumeMatchAnalysis` function, which provides four sub-scores:

| Metric | Calculation |
|---|---|
| **Overall** | Directly reads `candidate.aiFitScore` from the server-computed value |
| **Skills** | `Math.min(100, Math.round((matchedSkills.length / jobRequirements.length) * 100))` — Pure skill match ratio without the variance/floor adjustments |
| **Experience** | `Math.min(100, skillsScore + random(0, 14))` — Skills score with a small random uplift to simulate experience weighting |
| **Education** | `Math.min(100, 60 + random(0, 29))` — Base education score with random variance |

**Note:** The Experience and Education sub-scores include random components and should be treated as indicative estimates rather than precise measurements. The Overall and Skills scores are deterministic and reproducible.

### 5.5 Limitations and Future Enhancements

- The current algorithm uses substring matching, which may produce false positives (e.g., "Java" matches "JavaScript"). A more precise matching strategy using tokenized comparison or embedding similarity is planned.
- The random variance component is a placeholder for future ML-based evaluation of experience depth, education relevance, and career trajectory.
- Scores are computed once at creation and not recalculated when job requirements change.
- The algorithm does not currently consider candidate experience duration, education prestige, or certification status.

---

## 6. Data Flow

### 6.1 API Architecture

The Talent Acquisition module uses two primary API routes, both following RESTful conventions with JSON request/response bodies.

**Jobs API — `/api/jobs`**

| Method | Purpose | Request Body / Query Params | Response |
|---|---|---|---|
| `GET` | List jobs with filtering and pagination | Query: `page`, `limit`, `department`, `status`, `type`, `search` | `{ jobs: [...], pagination: {...} }` |
| `POST` | Create a new job | Body: `title` (req), `department`, `location`, `type`, `experience`, `salary`, `description`, `requirements`, `skills`, `closingDate` | Job object with `201` status |
| `PATCH` | Update an existing job | Body: `id` (req), plus any updatable fields | Updated job object |
| `DELETE` | Delete a job (only if no candidates) | Query: `id` | `{ message: "Job deleted successfully" }` |

**Candidates API — `/api/candidates`**

| Method | Purpose | Request Body / Query Params | Response |
|---|---|---|---|
| `GET` | List candidates with filtering and pagination | Query: `page`, `limit`, `jobId`, `status`, `source`, `search` | `{ candidates: [...], pagination: {...} }` |
| `POST` | Add a new candidate (auto-calculates AI fit score) | Body: `jobId` (req), `name` (req), `email` (req), `phone`, `currentCompany`, `experience`, `skills`, `education`, `source` | Candidate object with `201` status |
| `PATCH` | Update a candidate (status, interview, onboarding) | Body: `id` (req), plus `status`, `interviewDate`, `interviewNotes`, `onboardingStatus`, `phone`, `currentCompany`, `experience`, `skills`, `education`, `source` | Updated candidate object |
| `DELETE` | Delete a candidate | Query: `id` | `{ message: "Candidate deleted successfully" }` |

### 6.2 JSON Field Handling

Both the Job and Candidate models store array data as JSON strings in the database (PostgreSQL). The API routes handle serialization and deserialization:

**Job Model JSON Fields:**

| Field | DB Type | Stored As | Parsed As | Example |
|---|---|---|---|---|
| `requirements` | `String?` | `'["React","Node.js","TypeScript"]'` | `string[]` | Parsed via `safeJsonParse(job.requirements, [])` |
| `skills` | `String?` | `'["React","Node.js","TypeScript"]'` | `string[]` | Parsed via `safeJsonParse(job.skills, [])` |

**Candidate Model JSON Fields:**

| Field | DB Type | Stored As | Parsed As | Example |
|---|---|---|---|---|
| `skills` | `String?` | `'["React","Python","Docker"]'` | `string[]` | Parsed via `safeJsonParse(candidate.skills, [])` |

**safeJsonParse Utility:**

```typescript
function safeJsonParse(str: string | null, fallback: unknown = []) {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}
```

This utility safely handles null values and malformed JSON strings, returning the fallback value in error cases. All API responses use this utility to ensure the frontend always receives properly parsed arrays rather than raw JSON strings.

### 6.3 Data Relationships

```
Job (1) ────→ (N) Candidate
  │                  │
  │                  ├── status: applied | screening | interview | offered | hired | rejected
  │                  ├── aiFitScore: 0-100 (computed on creation)
  │                  ├── interviewDate, interviewNotes
  │                  └── onboardingStatus: pending | in-progress | completed
  │
  ├── requirements: JSON string[]
  ├── skills: JSON string[]
  └── status: open | closed | on-hold
```

When fetching jobs, the API includes a `_count.candidates` relation to compute the `applicants` field. When fetching candidates, the API includes the related `job` object with `id`, `title`, and `requirements` for display in the pipeline and profile views.

### 6.4 Frontend Data Flow

1. **Component Mount** — `useApi` hooks fetch jobs (`/api/jobs?limit=50`) and candidates (`/api/candidates?limit=100`) on component mount.
2. **Filter Changes** — Department, status, and search filters are passed as query parameters, triggering refetch via the `useApi` hook's reactive params.
3. **Mutations** — Job creation and candidate addition use the `apiPost` utility. On success, both `refetchJobs()` and `refetchCandidates()` are called to ensure UI consistency.
4. **Derived Data** — Statistics, pipeline groupings, and onboarding data are computed client-side using `useMemo` for performance optimization.
5. **Loading States** — Skeleton loaders (`StatsSkeleton`, `JobCardSkeleton`, `PipelineSkeleton`) are displayed during API fetches.
6. **Error States** — Error banners with "Retry" buttons are shown for failed API calls.

---

## 7. Integration with Other Modules

### 7.1 Employee Management

The most critical integration point is the transition from **Candidate → Employee**. When a candidate is hired:

- The candidate's `status` is set to `hired` and `onboardingStatus` is set to `in-progress`.
- The onboarding checklist in the Talent Acquisition module tracks initial setup tasks.
- Upon onboarding completion (`onboardingStatus = 'completed'`), the new hire should be registered as an **Employee** in the Employee Management module with:
  - `status: 'onboarding'` initially, transitioning to `status: 'active'` after the probation period
  - Department and designation mapped from the job's department and title
  - Join date set to the candidate's start date
  - Contract type mapped from the job's employment type
- The `Employee.joinDate` should be populated from `Candidate.interviewDate` or the actual start date.
- Skills from the candidate record can be used to pre-populate `EmployeeSkill` entries in the Employee Management module.

### 7.2 RBAC (Role-Based Access Control)

The Talent Acquisition module is governed by the RBAC system:

- **Permissions** are defined per role in the `Role.permissions` JSON field and enforced by the middleware.
- Access to job CRUD operations and candidate management is restricted to users with the `Super Admin`, `HR Admin`, or `Recruiter` role.
- The `AuditLog` model records all create, read, update, and delete actions performed within the module, including the user ID, action type, module name (`talent`), and IP address.
- Recruiters may have restricted permissions (e.g., cannot delete jobs or make offers), while HR Admins and Super Admins have full access.

### 7.3 Performance Module

Integration with the Performance module enables:

- **Hiring Quality Tracking** — After a new hire completes their probation period, their initial performance review can be correlated with the AI fit score to validate the scoring algorithm's predictive accuracy.
- **Attrition Risk Assessment** — The Performance module's `attritionRisk` field (0–1) can be cross-referenced with recruitment data to identify patterns in hiring sources or fit scores that correlate with higher turnover.
- **Skill Gap Validation** — AI onboarding recommendations for training can be validated against performance review feedback to improve the accuracy of skill gap analysis.

### 7.4 Learning & Development Module

The onboarding process directly integrates with L&D:

- **Training Assignment** — The onboarding checklist item "Training Assignment" should trigger enrollment in relevant courses in the L&D module.
- **AI Recommendations** — The AI-generated recommendation "Assign role-specific training based on skill gap analysis" can be fulfilled by automatically enrolling the new hire in courses tagged with the relevant skills in the `Course.skills` JSON field.
- **Skill Gap Courses** — Mismatches between candidate skills and job requirements (visible in the AI Resume Match Analysis) can be used to recommend specific upskilling courses from the L&D catalog.
- **Progress Tracking** — Course enrollment status (`CourseEnrollment.status` and `CourseEnrollment.progress`) can feed back into the onboarding completion criteria.

---

## 8. Role-Based Access

### 8.1 Permission Matrix

| Action | Super Admin | HR Admin | Recruiter |
|---|:---:|:---:|:---:|
| View Job Postings | ✅ | ✅ | ✅ |
| Create Job Posting | ✅ | ✅ | ❌ |
| Edit Job Posting | ✅ | ✅ | ❌ |
| Change Job Status | ✅ | ✅ | ❌ |
| Delete Job (no candidates) | ✅ | ✅ | ❌ |
| View Candidate Pipeline | ✅ | ✅ | ✅ |
| Add Candidate | ✅ | ✅ | ✅ |
| View Candidate Profile | ✅ | ✅ | ✅ |
| Move Candidate (Screening) | ✅ | ✅ | ✅ |
| Schedule Interview | ✅ | ✅ | ✅ |
| Move Candidate (Offered) | ✅ | ✅ | ❌ |
| Move Candidate (Hired) | ✅ | ✅ | ❌ |
| Reject Candidate | ✅ | ✅ | ✅ |
| Delete Candidate | ✅ | ✅ | ❌ |
| Manage Onboarding | ✅ | ✅ | ❌ |
| Use AI Compliance Bot | ✅ | ✅ | ✅ |
| View AI Fit Scores | ✅ | ✅ | ✅ |
| View AI Recommendations | ✅ | ✅ | ✅ |
| Access Audit Logs | ✅ | ❌ | ❌ |

### 8.2 Role Descriptions

**Super Admin**
- Has unrestricted access to all Talent Acquisition features.
- Can configure role permissions and review audit logs for recruitment activities.
- Responsible for system-level settings and data integrity.

**HR Admin**
- Full operational access to the recruitment lifecycle.
- Can create and manage job postings, advance candidates through all pipeline stages, make offers, and manage onboarding.
- Cannot access system audit logs or modify role permissions.

**Recruiter**
- Focused on candidate sourcing and early-stage pipeline management.
- Can add candidates, review AI fit scores, move candidates to screening, and schedule interviews.
- Cannot create job postings, make offers, hire candidates, delete records, or manage onboarding.

---

## 9. Business Rules

### 9.1 Job Management Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-TA-001 | A job cannot be deleted if it has associated candidates. The API returns a `409 Conflict` with the message: "Cannot delete job with existing candidates. Close the job instead." | Server-side (`DELETE /api/jobs`) |
| BR-TA-002 | Job title is mandatory for job creation. The API returns `400 Bad Request` if title is missing or empty. | Server-side (`POST /api/jobs`) |
| BR-TA-003 | Job status can only be one of: `open`, `closed`, `on-hold`. Any other value is silently ignored during update. | Server-side (`PATCH /api/jobs`) |
| BR-TA-004 | New jobs are always created with `status: 'open'` and `postedDate` set to the current date. These fields cannot be overridden during creation. | Server-side (`POST /api/jobs`) |
| BR-TA-005 | Only jobs with `status: 'open'` appear in the candidate creation form's job position dropdown. | Client-side |
| BR-TA-006 | The `requirements` and `skills` fields are stored as JSON strings in the database and must be serialized/deserialized properly. Null or empty values default to empty arrays. | Server-side (all job endpoints) |

### 9.2 Candidate Management Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-TA-007 | Candidate `jobId`, `name`, and `email` are mandatory for creation. The API returns `400 Bad Request` if any are missing. | Server-side (`POST /api/candidates`) |
| BR-TA-008 | The referenced job must exist when creating a candidate. The API returns `404 Not Found` if the job does not exist. | Server-side (`POST /api/candidates`) |
| BR-TA-009 | New candidates are always created with `status: 'applied'`. This cannot be overridden during creation. | Server-side (`POST /api/candidates`) |
| BR-TA-010 | The AI fit score is automatically calculated during candidate creation and cannot be manually set. | Server-side (`POST /api/candidates`) |
| BR-TA-011 | Candidate status can only be one of: `applied`, `screening`, `interview`, `offered`, `hired`, `rejected`. Invalid values are silently ignored. | Server-side (`PATCH /api/candidates`) |
| BR-TA-012 | A candidate can be moved to `rejected` from any pipeline stage. | Server-side (`PATCH /api/candidates`) |
| BR-TA-013 | Candidate `skills` are stored as a JSON string in the database and must be serialized/deserialized properly. | Server-side (all candidate endpoints) |
| BR-TA-014 | Deleting a candidate does not affect the associated job's applicant count until the job data is refetched. | Client-side (refetch triggered after mutations) |

### 9.3 Pipeline Transition Rules

| From | To | Allowed | Notes |
|---|---|:---:|---|
| applied | screening | ✅ | Standard forward progression |
| applied | rejected | ✅ | Direct rejection possible |
| screening | interview | ✅ | Standard forward progression |
| screening | rejected | ✅ | Rejection after screening |
| interview | offered | ✅ | Standard forward progression |
| interview | rejected | ✅ | Rejection after interview |
| offered | hired | ✅ | Offer accepted |
| offered | rejected | ✅ | Offer declined |
| hired | applied | ❌ | Backward transition not allowed by business logic |
| rejected | applied | ❌ | Reversal not supported (re-add as new candidate) |

**Note:** While the API does not enforce forward-only transitions (any valid status can be set), the business logic and UI should restrict transitions to the allowed paths above. Backward transitions should be avoided as they break audit trail integrity.

### 9.4 Onboarding Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-TA-015 | Only candidates with `status: 'hired'` and a non-null `onboardingStatus` appear in the AI Onboarding tab. | Client-side (filter in `deriveOnboardingData`) |
| BR-TA-016 | Onboarding status can be: `pending`, `in-progress`, or `completed`. | Server-side (`PATCH /api/candidates`) |
| BR-TA-017 | When `onboardingStatus = 'completed'`, all checklist items (Document Collection, IT Setup, Policy Acknowledgment, Team Introduction) are marked as completed. Training Assignment and First Week Review remain unchecked. | Client-side (derived in `deriveOnboardingData`) |
| BR-TA-018 | The AI Compliance Bot provides guidance only; it does not directly modify candidate or onboarding records. | Client-side (chat is read-only) |

---

## 10. Troubleshooting

### 10.1 Common Issues and Resolutions

| Issue | Possible Cause | Resolution |
|---|---|---|
| **Job creation fails with "Failed to create job" error** | Server-side error, possibly database connection issue or invalid data format | Check browser console for detailed error. Verify that the `title` field is not empty. Ensure the database is accessible. Retry the operation. |
| **Candidate creation returns 404 "Job not found"** | The selected job ID references a job that has been deleted or does not exist | The job may have been deleted by another user. Refresh the job list and select a valid open position. |
| **AI Fit Score shows unexpected values** | The skill-matching algorithm uses bidirectional substring matching, which may produce false positives (e.g., "Java" matching "JavaScript") | Review the matched skills in the candidate profile's AI Resume Match Analysis. The score includes a random variance component (±10–29 points). Treat scores as indicative, not definitive. |
| **Pipeline shows stale candidate data** | The candidate list has not been refreshed after a mutation | Click away from and back to the Candidate Pipeline tab, or use the search to trigger a refetch. The `useApi` hook should auto-refetch on parameter changes. |
| **"Cannot delete job with existing candidates" error** | Attempting to delete a job that has at least one associated candidate | This is by design (BR-TA-001). Close the job instead by updating its status to `closed`. To delete the job, first delete or reassign all associated candidates. |
| **Candidate not appearing in pipeline** | Candidate's status value does not match any of the six pipeline columns | Check the candidate's status in the database. It should be one of: `applied`, `screening`, `interview`, `offered`, `hired`, `rejected`. Any other value causes the candidate to be filtered out of the pipeline view. |
| **AI Compliance Bot not responding** | The bot uses client-side pattern matching with a 600ms simulated delay | The bot is not connected to an AI service. It responds to keywords like "document", "policy", "compliance", "IT", "setup". Other queries receive a generic help response. |
| **Onboarding checklist items stuck as unchecked** | The `onboardingStatus` field has not been updated to `completed` | Update the candidate's `onboardingStatus` via `PATCH /api/candidates`. The client-side `deriveOnboardingData` function only marks all items as completed when `onboardingStatus = 'completed'`. |
| **Job stats showing fallback values** | Insufficient data in the system for accurate calculations | "Avg Time to Hire" defaults to 18 days and "Offer Acceptance" defaults to 87% when no hired/offered candidates exist. These are placeholder values and will be replaced with actual computed values once sufficient data accumulates. |
| **Skills not displaying on job cards** | The `requirements` or `skills` JSON field is null or contains malformed JSON | The `safeJsonParse` utility should handle this by returning an empty array. If skills are still not showing, check the raw database value for the job's `requirements` field. |
| **"Failed to fetch jobs/candidates" error on page load** | API server is unreachable or returning 500 errors | Verify the API server is running. Check the browser's Network tab for the failed request. Ensure the database connection is active. Use the "Retry" button in the error state card. |
| **Candidate added but applicant count not updated on job card** | The jobs list has not been refetched after adding a candidate | The `handleAddCandidate` function calls both `refetchCandidates()` and `refetchJobs()`. If the UI doesn't update, check for JavaScript errors in the console that may have interrupted the refetch chain. |

### 10.2 API Error Codes Reference

| HTTP Status | Error Message | Cause |
|---|---|---|
| `400` | "Title is required" | POST /api/jobs called without a title |
| `400` | "Job id is required" | PATCH /api/jobs called without an id |
| `400` | "Candidate id is required" | PATCH /api/candidates called without an id |
| `400` | "jobId, name, and email are required" | POST /api/candidates called with missing required fields |
| `404` | "Job not found" | Referenced job ID does not exist (PATCH or candidate creation) |
| `404` | "Candidate not found" | Referenced candidate ID does not exist (PATCH or DELETE) |
| `409` | "Cannot delete job with existing candidates. Close the job instead." | DELETE /api/jobs called for a job with candidates |
| `500` | "Failed to fetch jobs" / "Failed to create job" etc. | Server-side error (database, parsing, unexpected exception) |

### 10.3 Data Integrity Checks

To verify data integrity in the Talent Acquisition module:

1. **Orphaned Candidates** — Check for candidates whose `jobId` references a non-existent job:
   ```sql
   SELECT c.id, c.name, c.jobId FROM "Candidate" c
   LEFT JOIN "Job" j ON c."jobId" = j.id
   WHERE j.id IS NULL;
   ```

2. **Invalid Status Values** — Check for jobs or candidates with status values outside the allowed enums:
   ```sql
   SELECT id, title, status FROM "Job" WHERE status NOT IN ('open', 'closed', 'on-hold');
   SELECT id, name, status FROM "Candidate" WHERE status NOT IN ('applied', 'screening', 'interview', 'offered', 'hired', 'rejected');
   ```

3. **Malformed JSON Fields** — Check for jobs or candidates with invalid JSON in skills/requirements fields:
   ```sql
   SELECT id, title, requirements FROM "Job" WHERE requirements IS NOT NULL AND requirements != '[]' AND requirements NOT LIKE '[%';
   SELECT id, name, skills FROM "Candidate" WHERE skills IS NOT NULL AND skills != '[]' AND skills NOT LIKE '[%';
   ```

4. **AI Fit Score Out of Range** — Check for candidates with scores outside the 0–100 range:
   ```sql
   SELECT id, name, "aiFitScore" FROM "Candidate" WHERE "aiFitScore" < 0 OR "aiFitScore" > 100;
   ```

---

*End of Document — SOP 04: AI Talent Acquisition Module*
