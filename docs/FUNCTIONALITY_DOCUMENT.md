# AI-Powered HRMS — Module-wise Functionality Document

**Document Version:** 2.0.0  
**Classification:** Internal — Confidential  
**Effective Date:** 2025-03-05  
**Document Owner:** HRMS Product Architecture Team  
**Review Cycle:** Quarterly  

---

## Table of Contents

1. [Document Purpose and Scope](#1-document-purpose-and-scope)
2. [System Overview](#2-system-overview)
3. [Role Definitions and Hierarchy](#3-role-definitions-and-hierarchy)
4. [Module 1: Dashboard](#4-module-1-dashboard)
5. [Module 2: Employee Management](#5-module-2-employee-management)
6. [Module 3: RBAC & Security](#6-module-3-rbac--security)
7. [Module 4: AI Talent Acquisition](#7-module-4-ai-talent-acquisition)
8. [Module 5: Time & Attendance](#8-module-5-time--attendance)
9. [Module 6: Payroll & Expenses](#9-module-6-payroll--expenses)
10. [Module 7: Performance & Talent](#10-module-7-performance--talent)
11. [Module 8: Learning & Development](#11-module-8-learning--development)
12. [Module 9: Analytics & Reporting](#12-module-9-analytics--reporting)
13. [Module 10: Employee Self-Service](#13-module-10-employee-self-service)
14. [Configured Workflows](#14-configured-workflows)
15. [Complete RBAC Permission Matrix](#15-complete-rbac-permission-matrix)
16. [Workflow State Machine Definitions](#16-workflow-state-machine-definitions)
17. [Notification Triggers](#17-notification-triggers)
18. [Cross-Module Integration Map](#18-cross-module-integration-map)
19. [Data Flow Diagrams](#19-data-flow-diagrams)
20. [Appendix](#20-appendix)

---

## 1. Document Purpose and Scope

This document provides a comprehensive, module-wise functional specification for the AI-powered Human Resource Management System (HRMS). It serves as the authoritative reference for:

- **Development Teams:** Understanding feature scope, role-based access constraints, and workflow logic for implementation.
- **QA Teams:** Deriving test cases from role-based access matrices, business rules, and workflow state transitions.
- **Product Stakeholders:** Validating functional coverage against business requirements.
- **Operations Teams:** Understanding notification triggers, integration touchpoints, and data flow dependencies.

### Scope

This document covers **ten functional modules**, **seven organizational roles**, **nine configured workflows**, cross-module integration specifications, and AI feature definitions. It does not cover infrastructure, deployment topology, or non-functional requirements (those are addressed in the SRS and SAD documents).

---

## 2. System Overview

The AI-powered HRMS is a unified, cloud-native platform designed to digitize and automate the full spectrum of human resource operations — from talent acquisition through employee lifecycle management to offboarding. The system leverages Artificial Intelligence across modules for predictive analytics, intelligent screening, automated recommendations, and anomaly detection.

### Architectural Principles

| Principle | Description |
|-----------|-------------|
| **Role-Driven Access** | Every feature is gated by a hierarchical RBAC model with Level 0–4 granularity |
| **Workflow-First Design** | All state-changing operations traverse configurable approval workflows |
| **AI-Augmented Operations** | AI assists but does not autonomously execute critical decisions without human confirmation |
| **Audit Trail Completeness** | Every CREATE, UPDATE, DELETE operation is logged with actor, timestamp, and delta |
| **Module Independence with Event Coupling** | Modules are independently deployable but communicate via an event bus for cross-cutting concerns |

---

## 3. Role Definitions and Hierarchy

| Role | Level | Scope of Authority | Delegation Permitted |
|------|-------|--------------------|---------------------|
| **Super Admin** | 0 | Unlimited — full system configuration, all modules, all data | Yes — can delegate any permission |
| **HR Admin** | 1 | HR operations, payroll oversight, performance management, attendance policy, employee lifecycle | Yes — within HR domain |
| **Payroll Specialist** | 2 | Payroll processing, tax declarations, statutory compliance, expense audit | No — cannot delegate |
| **Department Manager** | 3 | Team management, leave approvals, expense approvals, performance reviews, promotion nominations | Yes — can delegate approvals to acting manager |
| **Employee** | 4 | Self-service only — view own data, submit requests, update profile | No |
| **Recruiter** | 2 | Job postings, candidate pipeline management, interview scheduling, AI screening review | No — cannot delegate |
| **L&D Manager** | 2 | Course catalog, skill assessments, training program management, enrollment approvals | No — cannot delegate |

### Role Hierarchy Inheritance Rules

1. **Super Admin** inherits all permissions of every role.
2. **HR Admin** inherits Employee-level self-service permissions.
3. **Department Manager** inherits Employee-level self-service permissions.
4. Roles at the same level (Level 2) do **not** inherit from each other — Payroll Specialist, Recruiter, and L&D Manager have orthogonal permission sets.
5. Delegation is time-bound (max 30 days) and auditable.

---

## 4. Module 1: Dashboard

### 4.1 Module Overview and Purpose

The Dashboard module serves as the central command center for all HRMS users. It aggregates key metrics, pending actions, workflow notifications, and AI-generated insights into a role-adaptive interface. The dashboard dynamically reconfigures its widgets, KPI cards, and action items based on the authenticated user's role and permissions.

### 4.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Role-Adaptive Widgets** | Dashboard layout and widgets change based on logged-in role |
| 2 | **KPI Scorecards** | Real-time headcount, attrition rate, open positions, pending approvals |
| 3 | **Pending Actions Panel** | Aggregated list of approval tasks, document submissions, review cycles |
| 4 | **AI Insight Cards** | Predictive attrition alerts, hiring recommendations, engagement scores |
| 5 | **Quick Action Buttons** | One-click shortcuts: Apply Leave, Submit Expense, Raise Ticket |
| 6 | **Announcements Banner** | HR-published organizational announcements with read-receipt tracking |
| 7 | **Calendar Integration** | Upcoming holidays, team leaves, review cycles, interview schedules |
| 8 | **Trend Charts** | Headcount trends, attendance patterns, payroll summaries |
| 9 | **Document Expiry Alerts** | Passport, visa, certification expiry warnings |
| 10 | **Team Availability View** | Manager-level view of team presence/absence status |

### 4.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Role-Adaptive Widgets | ADMIN | ADMIN | READ | READ | READ | READ | READ |
| KPI Scorecards | ADMIN | ADMIN | READ | READ | READ(own) | READ(recruit) | READ(L&D) |
| Pending Actions | ADMIN | ADMIN | READ | READ | READ | READ | READ |
| AI Insight Cards | ADMIN | ADMIN | READ | READ | — | READ | READ |
| Quick Actions | ADMIN | ADMIN | WRITE | WRITE | WRITE | WRITE | WRITE |
| Announcements Banner | ADMIN | WRITE | READ | READ | READ | READ | READ |
| Calendar Integration | ADMIN | ADMIN | READ | READ | READ | READ | READ |
| Trend Charts | ADMIN | ADMIN | READ(payroll) | READ(team) | READ(own) | READ(recruit) | READ(L&D) |
| Document Expiry Alerts | ADMIN | ADMIN | READ | READ(team) | READ(own) | — | — |
| Team Availability | ADMIN | ADMIN | — | ADMIN | — | — | — |

### 4.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Predictive Attrition Alert** | Employee tenure, engagement scores, salary benchmark, manager change history | Gradient-boosted classification model with 90-day prediction window | Risk score (0–100), contributing factors list, recommended retention actions |
| **Hiring Demand Forecast** | Historical attrition, open requisitions, business growth rate, seasonal patterns | Time-series forecasting (ARIMA + ensemble) | 30/60/90-day hiring demand by department |
| **Engagement Score Predictor** | Pulse survey responses, attendance patterns, LMS activity, peer interaction frequency | NLP sentiment analysis + behavioral clustering | Engagement score (1–10), trend direction, at-risk employee list |

### 4.5 Business Rules and Validations

1. Dashboard data refreshes every 60 seconds for KPI scorecards; AI insights refresh every 4 hours.
2. Employees can only view their own KPI data; managers see aggregated team data.
3. Announcement read-receipts are mandatory — employees must acknowledge within 48 hours.
4. Quick Action buttons are context-aware and disabled when the user has no permission for the target action.

### 4.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Employee Management | Read | Headcount, org structure |
| Time & Attendance | Read | Attendance rates, leave balances |
| Payroll & Expenses | Read | Payroll summaries, pending expenses |
| Performance & Talent | Read | Review cycle status, scores |
| AI Talent Acquisition | Read | Open positions, pipeline metrics |
| Learning & Development | Read | Enrollment rates, completion rates |

---

## 5. Module 2: Employee Management

### 5.1 Module Overview and Purpose

The Employee Management module is the system of record for all employee lifecycle data — from onboarding through active employment to offboarding. It maintains the employee master data, organizational hierarchy, job history, document repository, and asset assignments. It serves as the foundational data source for all other modules.

### 5.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Employee Master Data** | Personal info, contact, emergency contacts, bank details |
| 2 | **Employment Records** | Job title, department, reporting manager, employment type, dates |
| 3 | **Organization Chart** | Interactive hierarchical org chart with drill-down |
| 4 | **Document Management** | Upload, verify, and track employee documents (ID, contracts, certs) |
| 5 | **Asset Assignment** | IT assets, equipment, access cards tracking |
| 6 | **Job History Timeline** | Complete record of role changes, transfers, promotions |
| 7 | **Onboarding Checklist** | Configurable task list for new employee onboarding |
| 8 | **Offboarding Workflow** | Exit process: clearance, asset return, knowledge transfer |
| 9 | **Bulk Import/Export** | CSV/Excel batch operations for employee data |
| 10 | **AI Duplicate Detection** | Identifies potential duplicate employee records |
| 11 | **Employee Directory** | Searchable directory with filters and advanced search |
| 12 | **Probation Management** | Track probation periods, trigger review at completion |

### 5.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Employee Master Data | ADMIN | WRITE | READ(compensation) | READ(team) | READ(own) | — | — |
| Employment Records | ADMIN | WRITE | READ | READ(team) | READ(own) | — | — |
| Organization Chart | ADMIN | ADMIN | READ | READ | READ | READ | READ |
| Document Management | ADMIN | WRITE | READ | READ(team) | WRITE(own) | — | — |
| Asset Assignment | ADMIN | WRITE | — | READ(team) | READ(own) | — | — |
| Job History Timeline | ADMIN | WRITE | READ | READ(team) | READ(own) | — | — |
| Onboarding Checklist | ADMIN | WRITE | — | READ(new hire) | READ(own) | — | READ |
| Offboarding Workflow | ADMIN | WRITE | READ(final pay) | READ(team) | — | — | — |
| Bulk Import/Export | ADMIN | WRITE | READ | — | — | — | — |
| AI Duplicate Detection | ADMIN | WRITE | — | — | — | — | — |
| Employee Directory | ADMIN | ADMIN | READ | READ | READ | READ | READ |
| Probation Management | ADMIN | WRITE | — | WRITE(team) | READ(own) | — | — |

### 5.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Duplicate Record Detection** | Employee name, DOB, email, phone, national ID | Fuzzy matching with configurable threshold (Levenshtein distance + phonetic matching) | Potential duplicate pairs with confidence score, merge recommendation |
| **Onboarding Task Prediction** | Role, department, location, access requirements | ML model trained on historical onboarding patterns | Auto-generated onboarding checklist with estimated completion times |
| **Flight Risk Assessment** | Tenure, compensation benchmark, engagement, manager rating | Ensemble model (logistic regression + XGBoost) | Risk classification (Low/Medium/High/Critical) with retention strategy |

### 5.5 Business Rules and Validations

1. Employee ID is system-generated and immutable after creation.
2. Personal data modifications require HR Admin approval for fields marked as "verified" (e.g., bank details, national ID).
3. An employee cannot be their own reporting manager; circular reporting chains are rejected.
4. Offboarding requires clearance from IT, Finance, and the reporting manager before processing final settlement.
5. Bulk import supports a maximum of 5,000 records per operation; larger datasets must be split.
6. Documents marked as "mandatory" must be uploaded before onboarding checklist completion.
7. Probation end date is auto-calculated from joining date + probation period; reminder triggered 15 days before.

### 5.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| RBAC & Security | Write | User account creation, role assignment |
| Dashboard | Read | Headcount, org metrics |
| Payroll & Expenses | Write | Bank details, salary structure, tax declarations |
| Time & Attendance | Write | Work schedule, shift assignment |
| Performance & Talent | Write | Job title, manager, department for review cycles |
| Learning & Development | Write | Mandatory training assignments |
| Employee Self-Service | Read | Employee profile data for self-service views |

---

## 6. Module 3: RBAC & Security

### 6.1 Module Overview and Purpose

The RBAC & Security module enforces the principle of least privilege across the HRMS platform. It manages user accounts, role assignments, permission policies, authentication mechanisms, and comprehensive audit logging. This module is the gatekeeper ensuring that every data access and modification is authorized, authenticated, and auditable.

### 6.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **User Account Management** | Create, suspend, reactivate, deactivate user accounts |
| 2 | **Role Assignment Engine** | Assign/revoke roles with effective dates and justification |
| 3 | **Permission Policy Editor** | Define granular permissions per module per action per role |
| 4 | **Multi-Factor Authentication (MFA)** | TOTP, SMS, email-based second-factor enforcement |
| 5 | **Session Management** | Concurrent session limits, idle timeout, forced logout |
| 6 | **Audit Log Viewer** | Searchable log of all system actions with actor, action, timestamp, delta |
| 7 | **Data Encryption Management** | At-rest and in-transit encryption configuration |
| 8 | **IP Whitelisting** | Restrict access to configured IP ranges |
| 9 | **Delegation Management** | Time-bound permission delegation with revocation |
| 10 | **Compliance Reporting** | SOC 2, GDPR, HIPAA compliance status dashboards |
| 11 | **Login Analytics** | Failed login tracking, anomaly detection, geolocation mapping |
| 12 | **API Key Management** | Generate, rotate, revoke API keys for integrations |

### 6.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| User Account Management | ADMIN | WRITE | — | — | — | — | — |
| Role Assignment Engine | ADMIN | WRITE(limited) | — | — | — | — | — |
| Permission Policy Editor | ADMIN | — | — | — | — | — | — |
| MFA Configuration | ADMIN | READ | — | — | WRITE(own) | — | — |
| Session Management | ADMIN | READ | — | — | READ(own) | — | — |
| Audit Log Viewer | ADMIN | READ | READ(payroll) | READ(team) | READ(own) | — | — |
| Data Encryption Mgmt | ADMIN | — | — | — | — | — | — |
| IP Whitelisting | ADMIN | — | — | — | — | — | — |
| Delegation Management | ADMIN | WRITE | — | WRITE | — | — | — |
| Compliance Reporting | ADMIN | READ | READ | — | — | — | — |
| Login Analytics | ADMIN | READ | — | — | — | — | — |
| API Key Management | ADMIN | — | — | — | — | — | — |

### 6.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Anomalous Login Detection** | Login time, IP geolocation, device fingerprint, behavioral biometrics | Isolation Forest anomaly detection on login patterns | Risk score, suggested action (allow/challenge/block), incident ticket creation |
| **Privilege Escalation Detection** | Role change history, access patterns, permission utilization metrics | Behavioral analysis comparing actual usage vs. granted permissions | Unused permission report, over-provisioning alerts, recommended least-privilege adjustments |
| **Insider Threat Scoring** | Data access patterns, bulk download events, off-hours activity, access to sensitive data | Graph-based anomaly detection across user behavior network | Threat score, flagged activities, recommended investigation actions |

### 6.5 Business Rules and Validations

1. No user can modify their own role assignment — changes require a different Super Admin or HR Admin.
2. MFA is mandatory for all roles at Level 0–2; optional but recommended for Level 3–4.
3. Audit logs are immutable — no CREATE, UPDATE, or DELETE operations are permitted on the audit log table.
4. API keys have a maximum lifespan of 90 days; automatic rotation reminder at 75 days.
5. Session idle timeout: Super Admin = 15 min, HR Admin = 30 min, all others = 60 min.
6. IP whitelisting rules are evaluated before authentication; non-whitelisted IPs receive a generic 403 response.
7. Delegation must include an end date; maximum delegation period is 30 days.
8. Account suspension triggers immediate session invalidation across all devices.

### 6.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Employee Management | Write | User account provisioning on employee creation |
| All Modules | Enforce | Permission checks on every API request |
| Dashboard | Read | Login statistics, security alerts |
| Analytics & Reporting | Read | Audit data for compliance reports |

---

## 7. Module 4: AI Talent Acquisition

### 7.1 Module Overview and Purpose

The AI Talent Acquisition module automates and optimizes the end-to-end recruitment lifecycle — from requisition creation through candidate sourcing, AI-powered screening, interview management, offer generation, and onboarding handoff. AI capabilities significantly reduce time-to-hire and improve quality-of-hire through intelligent matching and bias reduction.

### 7.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Job Requisition Management** | Create, approve, publish, and close job requisitions |
| 2 | **Job Posting Multi-Channel** | Publish to internal portal, job boards, social media, career page |
| 3 | **AI Resume Screening** | Automated parsing, scoring, and ranking of resumes |
| 4 | **Candidate Pipeline** | Kanban-style pipeline: Applied → Screened → Interview → Offer → Hired |
| 5 | **Interview Scheduling** | Calendar-based scheduling with panel allocation |
| 6 | **Assessment Integration** | Technical tests, psychometric evaluations, culture-fit assessments |
| 7 | **Offer Letter Generation** | Template-based offer letters with e-signature integration |
| 8 | **AI Bias Detection** | Scans job descriptions and screening criteria for bias |
| 9 | **Candidate Communication** | Automated email/SMS sequences at each pipeline stage |
| 10 | **Referral Management** | Employee referral tracking with reward calculation |
| 11 | **Recruitment Analytics** | Time-to-hire, cost-per-hire, source effectiveness, funnel metrics |
| 12 | **AI Candidate Matching** | Matches candidates to open roles based on skills, experience, culture fit |
| 13 | **Talent Pool Management** | Maintain silver-medalist pool for future opportunities |

### 7.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Job Requisition Mgmt | ADMIN | WRITE | — | WRITE(request) | — | WRITE | — |
| Job Posting Multi-Channel | ADMIN | WRITE | — | READ | READ(internal) | WRITE | — |
| AI Resume Screening | ADMIN | WRITE | — | READ(team) | — | ADMIN | — |
| Candidate Pipeline | ADMIN | WRITE | — | READ(team) | — | ADMIN | — |
| Interview Scheduling | ADMIN | WRITE | — | WRITE(panel) | — | WRITE | — |
| Assessment Integration | ADMIN | WRITE | — | READ | — | WRITE | READ |
| Offer Letter Generation | ADMIN | WRITE | READ(comp) | — | — | WRITE | — |
| AI Bias Detection | ADMIN | WRITE | — | — | — | WRITE | — |
| Candidate Communication | ADMIN | WRITE | — | — | — | WRITE | — |
| Referral Management | ADMIN | ADMIN | — | READ | WRITE(own) | READ | — |
| Recruitment Analytics | ADMIN | ADMIN | — | READ(team) | — | ADMIN | — |
| AI Candidate Matching | ADMIN | WRITE | — | — | — | ADMIN | — |
| Talent Pool Management | ADMIN | WRITE | — | — | — | WRITE | — |

### 7.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Resume Parser & Screener** | Resume file (PDF/DOCX), job description, required skills | NLP-based extraction (spaCy + custom NER), skill matching with synonym expansion, experience validation | Structured candidate profile, match score (0–100), skill gap analysis, ranking |
| **Bias Detection Engine** | Job description text, screening criteria, historical hiring data | NLP with debiased word embeddings, statistical parity analysis on past selections | Bias score per category (gender, age, ethnicity indicators), suggested rewording, compliance flag |
| **Candidate-Job Matching** | Candidate profile, job requirements, team composition, culture attributes | Multi-dimensional matching: skills (weighted), experience, culture fit score, diversity contribution | Match percentage, ranked candidate list, hiring recommendation with confidence interval |
| **Attrition Risk for New Hires** | Candidate profile, offer details, market benchmarking | Predictive model on first-year attrition probability | 1-year retention probability, risk factors, onboarding focus areas |
| **Salary Benchmarking** | Role, location, experience, market data feeds | Regression model on market salary data | Suggested salary range, percentile position, negotiation buffer |

### 7.5 Business Rules and Validations

1. Job requisitions require HR Admin or Department Manager approval before publishing.
2. AI screening scores are advisory — final shortlisting requires Recruiter or HR Admin confirmation.
3. Offer letters cannot be generated without completed interview feedback from at least two panelists.
4. Bias detection is mandatory — job descriptions with bias scores above 70% cannot be published without override approval from HR Admin.
5. Candidate data retention: Rejected candidates' data is retained for 12 months in the talent pool, then archived.
6. Referral rewards are triggered only after the referred candidate completes 90 days of employment.
7. Internal job postings are visible to employees for a minimum of 5 days before external publication.

### 7.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Employee Management | Write | New employee record on hire |
| RBAC & Security | Write | Account provisioning for new hires |
| Dashboard | Read | Open positions, pipeline metrics |
| Performance & Talent | Read | Job requirements, competency frameworks |
| Learning & Development | Write | Mandatory training assignments for new hires |
| Payroll & Expenses | Write | Offer compensation data, salary structure |

---

## 8. Module 5: Time & Attendance

### 8.1 Module Overview and Purpose

The Time & Attendance module captures, validates, and processes employee work-time data. It supports multiple capture methods (biometric, web check-in, mobile GPS), enforces attendance policies, manages leave workflows, and provides the attendance data foundation for payroll calculation. The module also includes AI-powered anomaly detection for time fraud prevention.

### 8.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Check-In/Check-Out** | Web, mobile, biometric, and GPS-based time capture |
| 2 | **Shift Management** | Define, assign, and rotate work shifts |
| 3 | **Leave Management** | Apply, approve, track, and carry-forward leave balances |
| 4 | **Holiday Calendar** | Configure organizational and location-specific holidays |
| 5 | **Overtime Tracking** | Auto-calculate OT based on shift rules; approval workflow |
| 6 | **Attendance Regularization** | Request corrections for missed or incorrect punches |
| 7 | **Comp-Off Management** | Earn and claim compensatory off days |
| 8 | **Timesheet Management** | Project-based time logging for billable hours |
| 9 | **AI Anomaly Detection** | Flag unusual attendance patterns (buddy punching, ghost hours) |
| 10 | **Attendance Policy Engine** | Configure grace periods, half-day rules, late arrival penalties |
| 11 | **Leave Encashment** | Calculate and process leave encashment requests |
| 12 | **Work From Home Tracking** | Separate WFH attendance with deliverable logging |

### 8.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Check-In/Check-Out | ADMIN | ADMIN | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) |
| Shift Management | ADMIN | WRITE | — | READ(team) | READ(own) | — | — |
| Leave Management | ADMIN | WRITE | READ | WRITE(approve) | WRITE(apply) | WRITE(apply) | WRITE(apply) |
| Holiday Calendar | ADMIN | WRITE | READ | READ | READ | READ | READ |
| Overtime Tracking | ADMIN | WRITE | READ | WRITE(approve) | WRITE(request) | — | — |
| Attendance Regularization | ADMIN | WRITE(approve) | — | WRITE(approve) | WRITE(request) | WRITE(request) | WRITE(request) |
| Comp-Off Management | ADMIN | WRITE | READ | WRITE(approve) | WRITE(claim) | — | — |
| Timesheet Management | ADMIN | READ | READ | WRITE(approve) | WRITE(submit) | — | — |
| AI Anomaly Detection | ADMIN | WRITE | READ | READ(team) | — | — | — |
| Attendance Policy Engine | ADMIN | WRITE | READ | — | — | — | — |
| Leave Encashment | ADMIN | WRITE | WRITE(process) | READ(team) | WRITE(request) | — | — |
| WFH Tracking | ADMIN | WRITE | READ | READ(team) | WRITE(own) | WRITE(own) | WRITE(own) |

### 8.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Buddy Punching Detection** | Check-in/out timestamps, geolocation, device IDs, biometric confidence scores | Clustering analysis on co-located check-ins, device correlation, time-pattern analysis | Suspicious pairs report, confidence score, investigation trigger |
| **Absenteeism Prediction** | Historical leave patterns, engagement scores, team workload, seasonal factors | LSTM-based time-series model with attention mechanism | 30-day absence probability per employee, high-risk group identification |
| **Optimal Shift Scheduling** | Employee preferences, workload forecasts, labor laws, skill coverage requirements | Constraint satisfaction optimization (genetic algorithm) | Proposed shift roster, coverage analysis, compliance validation |

### 8.5 Business Rules and Validations

1. Check-in without check-out auto-logs end-of-shift after configurable grace period (default: 2 hours).
2. Leave balance cannot go negative unless "advance leave" policy is enabled for the employee type.
3. Overtime is calculated only for employees with "OT-eligible" flag; others receive comp-off.
4. Attendance regularization requests must be submitted within 7 days of the occurrence.
5. Holiday calendar must be published at least 30 days before the start of the calendar year.
6. Shift changes require 48-hour advance notice; emergency overrides require HR Admin approval.
7. WFH requests exceeding 3 consecutive days require Manager approval.
8. Leave carry-forward is capped at the policy-defined maximum (configurable per leave type).

### 8.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Payroll & Expenses | Write | Attendance data, leave deductions, OT hours |
| Dashboard | Read | Attendance rates, leave summaries |
| Employee Management | Read | Employee work schedules, shift assignments |
| Performance & Talent | Read | Attendance records for performance calibration |
| Employee Self-Service | Read | Leave balances, attendance history |

---

## 9. Module 6: Payroll & Expenses

### 9.1 Module Overview and Purpose

The Payroll & Expenses module handles the complete payroll lifecycle — from salary structure definition through monthly processing, statutory compliance, and disbursement. It also manages employee expense claims with multi-level approval workflows. The module is designed to handle multi-country payroll with country-specific tax regulations and currency conversions.

### 9.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Salary Structure Definition** | Configure CTC breakdown: basic, HRA, allowances, deductions |
| 2 | **Payroll Processing** | Monthly payroll run with auto-calculation of all components |
| 3 | **Tax Calculation Engine** | Country-specific tax computation with regime selection |
| 4 | **Statutory Compliance** | PF, ESI, TDS, professional tax, labor welfare fund |
| 5 | **Expense Claim Management** | Submit, approve, and reimburse employee expenses |
| 6 | **Advance Salary** | Request and process salary advances with recovery schedule |
| 7 | **Loan Management** | Employee loans with EMI calculation and auto-deduction |
| 8 | **Payslip Generation** | Automated payslip generation with email distribution |
| 9 | **Bank Integration** | Payment file generation (NEFT/RTGS/SWIFT formats) |
| 10 | **Tax Declaration** | Employee investment declarations for TDS calculation |
| 11 | **AI Payroll Anomaly Detection** | Flag unusual payroll entries, duplicate payments, miscalculations |
| 12 | **Year-End Processing** | Form 16, W-2, annual tax statements generation |
| 13 | **Reimbursement Policies** | Configure reimbursement types, limits, and approval rules |

### 9.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Salary Structure Definition | ADMIN | WRITE | WRITE | — | — | — | — |
| Payroll Processing | ADMIN | WRITE(approve) | ADMIN | — | — | — | — |
| Tax Calculation Engine | ADMIN | READ | WRITE | — | — | — | — |
| Statutory Compliance | ADMIN | READ | WRITE | — | — | — | — |
| Expense Claim Mgmt | ADMIN | WRITE(audit) | WRITE(process) | WRITE(approve) | WRITE(submit) | WRITE(submit) | WRITE(submit) |
| Advance Salary | ADMIN | WRITE(approve) | WRITE(process) | — | WRITE(request) | — | — |
| Loan Management | ADMIN | WRITE(approve) | WRITE(process) | — | WRITE(request) | — | — |
| Payslip Generation | ADMIN | WRITE | WRITE | — | READ(own) | — | — |
| Bank Integration | ADMIN | — | ADMIN | — | — | — | — |
| Tax Declaration | ADMIN | READ | READ | — | WRITE(own) | — | — |
| AI Payroll Anomaly | ADMIN | WRITE | ADMIN | — | — | — | — |
| Year-End Processing | ADMIN | WRITE | WRITE | — | READ(own) | — | — |
| Reimbursement Policies | ADMIN | WRITE | READ | READ | — | — | — |

### 9.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Payroll Anomaly Detection** | Payroll register, historical patterns, organizational averages | Statistical outlier detection (Z-score + IQR), rule-based validation | Flagged entries with anomaly type, severity, recommended correction |
| **Expense Fraud Detection** | Expense claims, receipt images, historical claims, policy limits | OCR on receipts, duplicate image detection, pattern analysis | Fraud probability score, flagged claims, investigation recommendations |
| **Salary Benchmarking AI** | Role, experience, location, market data, internal equity matrix | Regression analysis on multi-source market data | Suggested salary band, internal equity flags, market percentile position |

### 9.5 Business Rules and Validations

1. Payroll can only be processed for a month after the attendance lock date has passed.
2. No two payroll runs for the same month are permitted without HR Admin override.
3. Expense claims exceeding the policy limit require additional approval from HR Admin.
4. Salary advances cannot exceed 50% of net monthly pay; recovery within 3 months.
5. Bank payment files are generated in read-only format with checksum validation.
6. Tax declarations are frozen after the January payroll run; changes require Payroll Specialist approval.
7. Payslips are auto-emailed to employees within 24 hours of payroll processing.
8. Statutory payments must be disbursed before the government-mandated due dates.

### 9.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Time & Attendance | Read | Attendance data, leave deductions, OT hours |
| Employee Management | Read | Bank details, salary structure, tax declarations |
| Dashboard | Read | Payroll summaries, expense metrics |
| Performance & Talent | Read | Bonus calculations, increment data |
| RBAC & Security | Enforce | Payroll data access restricted to authorized roles |

---

## 10. Module 7: Performance & Talent

### 10.1 Module Overview and Purpose

The Performance & Talent module manages the complete performance evaluation lifecycle — from goal setting through multi-rater reviews, calibration, and talent classification. It supports configurable review cycles, competency frameworks, and AI-powered performance insights. The module also handles succession planning, promotion workflows, and talent pipeline management.

### 10.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Goal Setting (OKR/KPI)** | Define, track, and measure individual and team goals |
| 2 | **Review Cycle Management** | Configure review periods, reviewers, and rating scales |
| 3 | **Self-Assessment** | Employee self-evaluation against goals and competencies |
| 4 | **Peer Review (360°)** | Multi-rater feedback collection and aggregation |
| 5 | **Manager Review** | Direct manager evaluation with justification |
| 6 | **Calibration Sessions** | Cross-team rating normalization and moderation |
| 7 | **Performance Improvement Plan (PIP)** | Structured improvement plans with milestones |
| 8 | **Succession Planning** | Identify and develop successors for critical roles |
| 9 | **9-Box Talent Matrix** | Classify employees on performance vs. potential |
| 10 | **Competency Framework** | Define role-specific competency models with proficiency levels |
| 11 | **AI Performance Insights** | Sentiment analysis on feedback, bias detection in ratings |
| 12 | **Promotion Workflow** | Nomination, review, committee approval, implementation |
| 13 | **Skill Gap Analysis** | Compare current skills vs. role requirements |

### 10.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Goal Setting | ADMIN | WRITE | — | WRITE(team) | WRITE(own) | — | — |
| Review Cycle Mgmt | ADMIN | WRITE | — | READ(team) | READ(own) | — | — |
| Self-Assessment | ADMIN | READ | — | READ(team) | WRITE(own) | — | — |
| Peer Review (360°) | ADMIN | READ | — | WRITE(assign) | WRITE(own) | — | — |
| Manager Review | ADMIN | READ | — | WRITE(team) | — | — | — |
| Calibration Sessions | ADMIN | WRITE | — | WRITE | — | — | — |
| PIP Management | ADMIN | WRITE | — | WRITE(team) | READ(own) | — | READ |
| Succession Planning | ADMIN | WRITE | — | READ(team) | — | — | READ |
| 9-Box Talent Matrix | ADMIN | WRITE | — | READ(team) | — | — | READ |
| Competency Framework | ADMIN | WRITE | — | READ | — | — | WRITE |
| AI Performance Insights | ADMIN | WRITE | — | READ(team) | — | — | READ |
| Promotion Workflow | ADMIN | WRITE | READ(comp) | WRITE(nominate) | READ(own) | — | — |
| Skill Gap Analysis | ADMIN | READ | — | READ(team) | READ(own) | — | WRITE |

### 10.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Feedback Sentiment Analysis** | Written feedback text from all review channels | NLP sentiment analysis (BERT-based), emotion detection, topic extraction | Sentiment score, key themes, flagged negative feedback requiring attention |
| **Rating Bias Detector** | Ratings by manager, department, demographics, historical trends | Statistical parity analysis, regression for protected attribute correlation | Bias indicators, rating adjustment recommendations, calibration alerts |
| **Succession Readiness Score** | Performance history, skill assessments, leadership potential indicators, tenure | Multi-factor scoring model with weighted criteria | Readiness score (1–100), development gap analysis, recommended timeline |
| **Performance Trajectory Prediction** | Historical ratings, goal completion rate, feedback trends, peer comparison | Time-series prediction with confidence intervals | Predicted next-cycle rating, improvement/decline probability, intervention triggers |

### 10.5 Business Rules and Validations

1. A review cycle cannot be closed until all mandatory reviews (self + manager) are completed.
2. Peer reviewers must include at least one cross-functional reviewer for 360° reviews.
3. Ratings above the department average require written justification by the manager.
4. PIP duration must be between 30 and 90 days; extension requires HR Admin approval.
5. 9-Box classification is visible only to HR Admin and Department Manager; not visible to the employee.
6. Calibration sessions can adjust ratings by a maximum of ±1 point from the manager's original rating.
7. Promotion nominations require at least 12 months in the current role (configurable).
8. Goal weights must sum to 100% per employee per review cycle.

### 10.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Employee Management | Read | Job titles, department, reporting manager |
| Payroll & Expenses | Write | Bonus calculations, increment data |
| Learning & Development | Write | Skill gaps, mandatory training assignments |
| Dashboard | Read | Review cycle status, performance metrics |
| Time & Attendance | Read | Attendance data for performance calibration |
| AI Talent Acquisition | Read | Competency frameworks, role requirements |

---

## 11. Module 8: Learning & Development

### 11.1 Module Overview and Purpose

The Learning & Development module manages the corporate training ecosystem — from course catalog management and skill assessments to enrollment workflows and certification tracking. It supports both instructor-led and self-paced learning, integrates with external LMS platforms, and uses AI to recommend personalized learning paths based on skill gaps, career aspirations, and organizational needs.

### 11.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Course Catalog** | Central repository of courses with metadata, categories, and prerequisites |
| 2 | **Learning Path Management** | Define structured learning sequences for roles/skills |
| 3 | **Course Enrollment** | Employee enrollment with approval workflow |
| 4 | **Skill Assessment** | Pre and post-course skill evaluations |
| 5 | **Certification Tracking** | Issue, verify, and track professional certifications |
| 6 | **Training Calendar** | Schedule instructor-led sessions with room and trainer allocation |
| 7 | **Content Management** | Upload, version, and manage training content (video, PDF, SCORM) |
| 8 | **AI Learning Recommendations** | Personalized course suggestions based on skill gaps and goals |
| 9 | **Feedback & Rating** | Post-course feedback collection and trainer evaluation |
| 10 | **Compliance Training** | Mandatory training assignment with deadline enforcement |
| 11 | **Budget Management** | Training budget allocation, tracking, and utilization |
| 12 | **External Training Requests** | Employee requests for external conferences/courses |
| 13 | **Skill Matrix** | Organization-wide skill inventory with proficiency mapping |

### 11.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Course Catalog | ADMIN | WRITE | — | READ | READ | — | ADMIN |
| Learning Path Mgmt | ADMIN | WRITE | — | READ | READ | — | ADMIN |
| Course Enrollment | ADMIN | WRITE | — | WRITE(approve) | WRITE(request) | — | WRITE(approve) |
| Skill Assessment | ADMIN | READ | — | READ(team) | WRITE(own) | — | ADMIN |
| Certification Tracking | ADMIN | WRITE | — | READ(team) | READ(own) | — | ADMIN |
| Training Calendar | ADMIN | READ | — | READ | READ | — | ADMIN |
| Content Management | ADMIN | — | — | — | — | — | ADMIN |
| AI Learning Recommendations | ADMIN | READ | — | READ(team) | READ(own) | — | ADMIN |
| Feedback & Rating | ADMIN | READ | — | READ | WRITE(own) | — | READ |
| Compliance Training | ADMIN | WRITE | — | READ(team) | READ(own) | — | ADMIN |
| Budget Management | ADMIN | WRITE | READ | — | — | — | ADMIN |
| External Training Requests | ADMIN | WRITE(approve) | — | WRITE(approve) | WRITE(request) | — | WRITE(review) |
| Skill Matrix | ADMIN | READ | — | READ(team) | READ(own) | — | ADMIN |

### 11.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Personalized Learning Path** | Employee skill profile, role requirements, career goals, learning history | Collaborative filtering + content-based recommendation engine | Ranked course recommendations, suggested learning path, estimated completion time |
| **Skill Gap Auto-Identifier** | Current skill assessments, target role competencies, performance review data | Differential analysis between current and target skill profiles | Skill gap report, priority-ranked skill development areas, recommended courses |
| **Training Effectiveness Predictor** | Pre/post-assessment scores, on-the-job performance metrics, feedback scores | Causal inference analysis on training-to-performance correlation | Effectiveness score per course, ROI estimate, improvement recommendations |
| **Content Difficulty Calibrator** | Course content, assessment scores, completion time, dropout rates | Bayesian difficulty estimation | Difficulty rating adjustment, prerequisite recommendations, content restructuring suggestions |

### 11.5 Business Rules and Validations

1. Compliance training assignments cannot be declined by employees; only acknowledged.
2. Course enrollment requires Manager approval if the course fee exceeds the per-course budget threshold.
3. External training requests exceeding the annual training budget require HR Admin approval.
4. Certification expiry reminders are triggered 90, 60, and 30 days before expiry.
5. Learning paths are locked once started; sequence changes require L&D Manager override.
6. Course feedback must be submitted within 7 days of course completion.
7. Skill assessments are valid for 12 months; re-assessment is required after expiry.
8. Training room allocation follows a priority system: compliance training > leadership development > general upskilling.

### 11.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Performance & Talent | Read | Skill gaps, competency requirements, PIP training needs |
| Employee Management | Read | Employee role, department, manager |
| Dashboard | Read | Training completion rates, upcoming sessions |
| Time & Attendance | Write | Training day attendance, leave integration |
| Payroll & Expenses | Write | Training expenses, certification reimbursement |

---

## 12. Module 9: Analytics & Reporting

### 12.1 Module Overview and Purpose

The Analytics & Reporting module provides comprehensive data analysis and visualization capabilities across all HRMS modules. It supports ad-hoc query building, scheduled report generation, custom dashboard creation, and AI-powered predictive analytics. The module is designed to serve both operational reporting needs and strategic workforce planning.

### 12.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Standard Report Library** | Pre-built reports for common HR metrics |
| 2 | **Custom Report Builder** | Drag-and-drop report creation with data source selection |
| 3 | **Data Visualization Engine** | Charts, graphs, heatmaps, treemaps, scatter plots |
| 4 | **Scheduled Reports** | Automated report generation and distribution on schedule |
| 5 | **Export Capabilities** | PDF, Excel, CSV, PowerPoint export options |
| 6 | **AI Predictive Analytics** | Workforce planning, attrition forecasting, hiring demand |
| 7 | **Custom Dashboards** | User-created dashboards with configurable widgets |
| 8 | **Drill-Down Analysis** | Click-through from summary to detail level |
| 9 | **Benchmarking Reports** | Industry and internal benchmark comparisons |
| 10 | **Compliance Reports** | Statutory and regulatory compliance dashboards |
| 11 | **Data Quality Monitoring** | Identify data inconsistencies, missing values, stale records |
| 12 | **AI Natural Language Query** | Ask questions in plain English to generate reports |

### 12.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Standard Report Library | ADMIN | ADMIN | READ(payroll) | READ(team) | READ(own) | READ(recruit) | READ(L&D) |
| Custom Report Builder | ADMIN | WRITE | WRITE(payroll) | WRITE(team) | — | WRITE(recruit) | WRITE(L&D) |
| Data Visualization | ADMIN | ADMIN | READ(payroll) | READ(team) | READ(own) | READ(recruit) | READ(L&D) |
| Scheduled Reports | ADMIN | WRITE | WRITE(payroll) | WRITE(team) | — | WRITE(recruit) | WRITE(L&D) |
| Export Capabilities | ADMIN | WRITE | WRITE(payroll) | WRITE(team) | READ(own) | WRITE(recruit) | WRITE(L&D) |
| AI Predictive Analytics | ADMIN | WRITE | READ | READ(team) | — | READ(recruit) | READ(L&D) |
| Custom Dashboards | ADMIN | WRITE | WRITE(payroll) | WRITE(team) | WRITE(own) | WRITE(own) | WRITE(own) |
| Drill-Down Analysis | ADMIN | ADMIN | READ(payroll) | READ(team) | — | READ(recruit) | READ(L&D) |
| Benchmarking Reports | ADMIN | WRITE | — | READ | — | — | — |
| Compliance Reports | ADMIN | WRITE | WRITE | — | — | — | — |
| Data Quality Monitoring | ADMIN | WRITE | — | — | — | — | — |
| AI NL Query | ADMIN | WRITE | READ(payroll) | READ(team) | — | READ(recruit) | READ(L&D) |

### 12.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **Workforce Planning Predictor** | Headcount trends, business growth projections, attrition forecasts | Multi-variate regression with scenario modeling | Headcount projections by department, hiring timeline, budget estimates |
| **Natural Language to SQL** | User's natural language question | LLM-based NL2SQL translation with schema awareness | SQL query, result preview, visualization recommendation |
| **Anomaly Detection in HR Data** | All HRMS data streams | Statistical process control + ML-based outlier detection | Anomalous data points, potential root causes, data quality score |
| **What-If Scenario Simulator** | Parameters: hiring rate, attrition rate, budget changes | Monte Carlo simulation with configurable parameters | Probability distributions, risk assessment, recommended actions |

### 12.5 Business Rules and Validations

1. Report data is subject to the user's role-based data access — no report can expose data the user cannot access directly.
2. Scheduled reports are delivered via email with password-protected attachments.
3. Custom reports cannot include PII columns unless the user has explicit PII access permission.
4. Export operations are logged with user ID, report ID, timestamp, and row count.
5. AI-generated reports include a confidence score and methodology disclosure.
6. Natural language queries are processed with a 30-second timeout; complex queries return a "processing" status with async notification.
7. Data quality score is recalculated daily; scores below 80% trigger a data steward notification.

### 12.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| All Modules | Read | Aggregated data from all modules |
| RBAC & Security | Enforce | Data access filtering based on user permissions |
| Dashboard | Write | Custom dashboard widgets |

---

## 13. Module 10: Employee Self-Service

### 13.1 Module Overview and Purpose

The Employee Self-Service (ESS) module empowers employees to manage their own HR-related tasks without requiring HR intermediation. It provides a unified interface for profile updates, document access, request submissions, and information retrieval. The module serves as the primary daily-touchpoint for all employees, designed with a mobile-first approach for maximum accessibility.

### 13.2 Feature List

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Profile Management** | View and update personal information, emergency contacts |
| 2 | **Document Access** | View and download payslips, tax forms, offer letters, certificates |
| 3 | **Leave Application** | Apply for leave, view balance, check team calendar |
| 4 | **Expense Submission** | Submit expense claims with receipt upload |
| 5 | **Attendance View** | View attendance history, regularize entries |
| 6 | **Pay Information** | View payslips, tax declarations, investment proofs |
| 7 | **Asset Requests** | Request IT assets and equipment |
| 8 | **Grievance Portal** | Raise and track HR grievances with anonymity option |
| 9 | **Directory Search** | Search employee directory for contact information |
| 10 | **Policy Repository** | Access company policies, SOPs, and handbook |
| 11 | **AI Helpdesk Chatbot** | Natural language HR query resolution |
| 12 | **Service Request Portal** | Raise IT, Facilities, Admin service requests |
| 13 | **Notification Center** | Centralized notification management with preferences |
| 14 | **Feedback & Suggestions** | Submit anonymous or attributed feedback |

### 13.3 Role-Based Access Matrix

| Feature | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|---------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Profile Management | ADMIN | WRITE | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) |
| Document Access | ADMIN | WRITE | READ(payroll) | READ(own) | READ(own) | READ(own) | READ(own) |
| Leave Application | ADMIN | WRITE | WRITE(own) | WRITE(own+approve) | WRITE(own) | WRITE(own) | WRITE(own) |
| Expense Submission | ADMIN | WRITE(audit) | WRITE(own) | WRITE(own+approve) | WRITE(own) | WRITE(own) | WRITE(own) |
| Attendance View | ADMIN | ADMIN | READ(own) | READ(team) | READ(own) | READ(own) | READ(own) |
| Pay Information | ADMIN | ADMIN | ADMIN | READ(own) | READ(own) | READ(own) | READ(own) |
| Asset Requests | ADMIN | WRITE(approve) | WRITE(own) | WRITE(approve) | WRITE(own) | WRITE(own) | WRITE(own) |
| Grievance Portal | ADMIN | WRITE(resolve) | — | READ(team) | WRITE(own) | — | — |
| Directory Search | ADMIN | ADMIN | READ | READ | READ | READ | READ |
| Policy Repository | ADMIN | WRITE | READ | READ | READ | READ | READ |
| AI Helpdesk Chatbot | ADMIN | ADMIN | READ | READ | READ | READ | READ |
| Service Request Portal | ADMIN | ADMIN | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) |
| Notification Center | ADMIN | WRITE(broadcast) | READ(own) | READ(own) | READ(own) | READ(own) | READ(own) |
| Feedback & Suggestions | ADMIN | READ | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) | WRITE(own) |

### 13.4 AI Features

| AI Feature | Input | Processing | Output |
|------------|-------|-----------|--------|
| **HR Helpdesk Chatbot** | Employee's natural language query | Intent classification, entity extraction, knowledge base retrieval, LLM response generation | Contextual answer, relevant policy links, form pre-fill, escalation trigger |
| **Smart Form Pre-fill** | Employee profile, historical data, context | Auto-populate form fields based on employee context | Pre-filled form with editable fields, data validation |
| **Document Classification** | Uploaded document (expense receipt, certificate, ID) | OCR + document classification model | Document type, extracted key fields, verification status |

### 13.5 Business Rules and Validations

1. Profile changes to verified fields (national ID, bank details) are submitted for HR Admin approval; other fields update immediately.
2. Document downloads are logged with timestamp and user ID for audit purposes.
3. Grievances marked as "anonymous" cannot be traced back to the employee by any role except Super Admin.
4. The AI chatbot cannot access payroll data or performance ratings; it redirects such queries to the appropriate module with authentication.
5. Service requests auto-escalate if not acknowledged within 24 hours (configurable SLA).
6. Notification preferences allow employees to opt out of non-mandatory notifications.
7. Policy repository documents are version-controlled; employees always see the latest published version.

### 13.6 Integration Points

| Integrates With | Integration Type | Data Exchanged |
|-----------------|-----------------|----------------|
| Employee Management | Read/Write | Profile data, document access |
| Time & Attendance | Read/Write | Leave applications, attendance views |
| Payroll & Expenses | Read/Write | Payslip access, expense submission |
| Learning & Development | Read | Course catalog, enrollment status |
| Performance & Talent | Read | Self-assessment, feedback |
| RBAC & Security | Enforce | Authentication, session management |

---

## 14. Configured Workflows

### 14.1 Leave Approval Workflow

**Purpose:** Manage employee leave requests through a structured approval chain ensuring adequate team coverage and policy compliance.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Employee │───▶│  System  │───▶│  Manager │───▶│ HR Admin │
│  Apply   │    │ Validate │    │ Approve/ │    │  Record  │
│          │    │ Balance  │    │ Reject   │    │  & Post  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     │               ▼               │               │
     │         ┌──────────┐          │               │
     │         │ Insuff.  │◀─────────┘               │
     │         │ Balance  │  Rejection                │
     │         │ Reject   │  Notification             │
     │         └──────────┘                           │
     │                                                │
     │           ┌────────────────────────┐           │
     │           │   Auto-Debit Balance   │◀──────────┘
     │           │   Update Team Calendar │           │
     │           │   Notify Stakeholders  │           │
     │           └────────────────────────┘           │
     │                                                │
     ▼                                                ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 1: Employee submits leave request                   │
│   - Select leave type, dates, reason                     │
│   - System validates leave balance & overlapping requests │
│   - If balance insufficient → auto-reject with reason    │
│                                                          │
│ STEP 2: System validation (automated)                    │
│   - Check leave policy rules (min advance notice, etc.)  │
│   - Check team calendar for coverage conflicts           │
│   - If coverage conflict → flag to manager with warning  │
│                                                          │
│ STEP 3: Manager reviews and approves/rejects             │
│   - View team availability, project impact               │
│   - Approve, reject with reason, or request modification │
│   - If >5 consecutive days → escalate to HR Admin        │
│                                                          │
│ STEP 4: HR Admin records and posts                       │
│   - Verify policy compliance                             │
│   - Update leave balance                                 │
│   - Generate leave certificate if needed                 │
│   - Trigger payroll deduction if applicable               │
│                                                          │
│ POST-CONDITIONS:                                         │
│   - Leave balance debited                                │
│   - Team calendar updated                                │
│   - Employee notified of final status                    │
│   - Payroll module informed of leave days for deduction  │
└──────────────────────────────────────────────────────────┘
```

**State Transitions:**

| From State | Event | To State | Actor |
|------------|-------|----------|-------|
| — | Submit | PENDING_MANAGER | Employee |
| PENDING_MANAGER | Approve | PENDING_HR | Manager |
| PENDING_MANAGER | Reject | REJECTED | Manager |
| PENDING_MANAGER | Request Modification | MODIFICATION_REQUESTED | Manager |
| MODIFICATION_REQUESTED | Resubmit | PENDING_MANAGER | Employee |
| MODIFICATION_REQUESTED | Cancel | CANCELLED | Employee |
| PENDING_HR | Approve | APPROVED | HR Admin |
| PENDING_HR | Reject | REJECTED | HR Admin |
| APPROVED | Cancel (before start) | CANCELLATION_PENDING | Employee |
| CANCELLATION_PENDING | Approve Cancel | CANCELLED | Manager |
| Any | Auto-expire (no action in 72h) | ESCALATED | System |

---

### 14.2 Expense Approval Workflow

**Purpose:** Process employee expense claims through a multi-level approval chain with financial controls and compliance verification.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Employee │───▶│  System  │───▶│  Manager │───▶│ Finance/ │───▶│ HR Admin │
│  Submit  │    │ Validate │    │ Approve/ │    │  Payroll │    │  Audit & │
│  Claim   │    │ Policy   │    │ Reject   │    │ Verify   │    │ Disburse │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Employee submits expense claim                                   │
│   - Select expense category, amount, date, project code                  │
│   - Upload receipt image (mandatory for >₹500/$25)                      │
│   - System runs AI receipt validation (OCR + fraud check)                │
│   - If policy violation → flag with warning, allow override with reason  │
│                                                                          │
│ STEP 2: System validation (automated)                                    │
│   - Check expense policy limits per category                             │
│   - AI duplicate receipt detection                                       │
│   - Verify project code validity                                         │
│   - If amount > threshold → require additional justification             │
│                                                                          │
│ STEP 3: Manager reviews and approves/rejects                             │
│   - Verify business justification                                        │
│   - Check budget availability                                            │
│   - Approve, reject, or partially approve with adjusted amount           │
│   - If amount > department threshold → auto-escalate to Finance          │
│                                                                          │
│ STEP 4: Finance/Payroll Specialist verifies                              │
│   - Validate receipt authenticity                                        │
│   - Check tax implications                                               │
│   - Verify budget allocation and cost center                             │
│   - Approve for disbursement or return for correction                    │
│                                                                          │
│ STEP 5: HR Admin audits and authorizes disbursement                      │
│   - Final compliance check                                               │
│   - Authorize payment                                                    │
│   - Include in next payroll cycle or process as separate reimbursement    │
│   - Update expense records and generate audit trail                      │
│                                                                          │
│ THRESHOLD-BASED ROUTING:                                                 │
│   - ≤ ₹5,000 / $100     → Manager → Disbursement                       │
│   - ₹5,001–₹50,000      → Manager → Finance → Disbursement             │
│   - > ₹50,000 / $1,000  → Manager → Finance → HR Admin → Disbursement  │
│                                                                          │
│ POST-CONDITIONS:                                                         │
│   - Expense recorded in payroll system                                   │
│   - Reimbursement scheduled for next payroll cycle                       │
│   - Budget utilization updated                                           │
│   - Employee notified of disbursement timeline                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 14.3 Performance Review Workflow

**Purpose:** Execute a structured, multi-rater performance evaluation process with calibration and bias detection.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Self   │───▶│  Peer    │───▶│ Manager  │───▶│ Calibration│──▶│   HR    │
│  Review  │    │  Review  │    │  Review  │    │  Session   │    │ Review  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     ▼               ▼               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Self-Review                                                      │
│   - Employee rates self against goals and competencies                    │
│   - Provides written justification for ratings                           │
│   - Identifies achievements and development areas                        │
│   - Submits self-assessment form                                         │
│   - Deadline: 7 days from cycle start                                    │
│                                                                          │
│ STEP 2: Peer Review (360° Feedback)                                      │
│   - Manager/HR assigns 3–5 peer reviewers                                │
│   - Peers provide feedback on competencies and collaboration              │
│   - AI sentiment analysis on written feedback                            │
│   - Anonymous aggregation to protect reviewer identity                   │
│   - Deadline: 7 days from self-review completion                         │
│                                                                          │
│ STEP 3: Manager Review                                                   │
│   - Manager reviews self-assessment and peer feedback                     │
│   - Provides ratings with mandatory written justification                │
│   - AI bias detection alerts on rating anomalies                         │
│   - Identifies development plan items                                    │
│   - Submits manager evaluation                                           │
│   - Deadline: 7 days from peer review completion                         │
│                                                                          │
│ STEP 4: Calibration Session                                              │
│   - Cross-functional manager meeting facilitated by HR Admin             │
│   - Normalize ratings across teams to ensure fairness                    │
│   - Review AI bias detection flags                                       │
│   - Adjust ratings with documented justification (max ±1 point)          │
│   - Finalize ratings and talent classification                          │
│   - Duration: 2–5 business days                                          │
│                                                                          │
│ STEP 5: HR Review and Closure                                            │
│   - HR Admin reviews calibration outcomes                                │
│   - Validates against organizational distribution guidelines              │
│   - Approves final ratings                                               │
│   - Triggers downstream: bonus calculation, increment, promotion, PIP    │
│   - Shares review results with employee                                  │
│   - Employee acknowledges receipt                                        │
│                                                                          │
│ POST-CONDITIONS:                                                         │
│   - Final rating recorded in employee profile                            │
│   - Bonus/increment data sent to Payroll module                          │
│   - Development plan created in L&D module                               │
│   - 9-Box classification updated                                        │
│   - Succession planning data refreshed                                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 14.4 Recruitment Workflow

**Purpose:** Manage the end-to-end recruitment process from job requisition through onboarding, leveraging AI at key decision points.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   Job    │─▶│ Applica- │─▶│   AI     │─▶│ Interview│─▶│  Offer   │─▶│Onboarding│
│ Posting  │  │  tions   │  │ Screening│  │  Process │  │  & Hire  │  │  Handoff │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │             │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼             ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Job Posting                                                             │
│   - Dept Manager submits job requisition                                         │
│   - HR Admin reviews and approves requisition                                    │
│   - AI bias detection scans job description                                      │
│   - Recruiter publishes to configured channels (portal, boards, social)          │
│   - Internal posting visible for 5 days before external                         │
│                                                                                  │
│ STEP 2: Application Collection                                                  │
│   - Candidates apply through portal or are sourced by recruiter                  │
│   - Employee referrals tracked separately with referral code                     │
│   - System captures: resume, cover letter, portfolio, answers to screening Qs    │
│   - Auto-acknowledgment email sent to each applicant                            │
│                                                                                  │
│ STEP 3: AI Screening                                                            │
│   - AI parses all resumes (NLP extraction)                                       │
│   - Scores each candidate against job requirements (0–100)                       │
│   - Ranks candidates by match score                                              │
│   - AI identifies skills gaps and highlights                                     │
│   - Recruiter reviews AI recommendations and shortlists                          │
│   - AI is advisory — human override is always possible                           │
│                                                                                  │
│ STEP 4: Interview Process                                                       │
│   - Recruiter schedules interviews (phone → technical → cultural → final)        │
│   - Interviewers submit structured feedback forms                                │
│   - AI aggregates feedback and generates candidate summary                       │
│   - Decision: Advance, Hold, Reject                                              │
│   - Rejected candidates added to talent pool with consent                        │
│                                                                                  │
│ STEP 5: Offer & Hire                                                            │
│   - Recruiter initiates offer with proposed compensation                         │
│   - AI salary benchmarking validates offer against market data                    │
│   - HR Admin approves offer                                                      │
│   - System generates offer letter with e-signature                               │
│   - Candidate accepts/rejects/negotiates                                         │
│   - On acceptance → trigger onboarding workflow                                  │
│                                                                                  │
│ STEP 6: Onboarding Handoff                                                      │
│   - Employee record created in Employee Management module                         │
│   - IT setup request triggered (email, laptop, access)                           │
│   - Mandatory training assigned in L&D module                                    │
│   - Onboarding checklist activated                                               │
│   - Reporting manager notified                                                   │
│   - Buddy/mentor assigned                                                        │
│                                                                                  │
│ POST-CONDITIONS:                                                                 │
│   - Candidate status → "Hired"                                                   │
│   - Employee master record created                                               │
│   - User account provisioned                                                     │
│   - Onboarding checklist initiated                                               │
│   - Referral reward triggered (if applicable, after 90-day cliff)                │
│   - Recruitment analytics updated                                                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### 14.5 Payroll Processing Workflow

**Purpose:** Execute the monthly payroll cycle with data validation, calculation, multi-level verification, and disbursement.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Data    │─▶│  Calcul- │─▶│  Verify  │─▶│ Approve  │─▶│Disburse- │
│Collection│  │  ation   │  │  & Audit │  │  & Lock  │  │  ment    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: Data Collection (Day 1–3 of month)                           │
│   - Lock attendance data for previous month                          │
│   - Import leave data from Time & Attendance module                  │
│   - Import approved overtime hours                                   │
│   - Collect variable pay: bonuses, incentives, reimbursements        │
│   - Import new joiner salary data from Employee Management           │
│   - Import exit employee data for final settlement                   │
│   - Import tax declaration changes                                   │
│   - Validate all data sources for completeness                       │
│                                                                      │
│ STEP 2: Calculation (Day 3–5)                                        │
│   - Calculate gross salary (basic + allowances)                      │
│   - Apply attendance/leave deductions                                │
│   - Compute overtime payments                                        │
│   - Calculate statutory deductions (PF, ESI, TDS, Prof Tax)         │
│   - Process loan EMI deductions                                      │
│   - Calculate salary advance recoveries                              │
│   - Compute LWP (Leave Without Pay) deductions                       │
│   - Generate net pay for each employee                               │
│   - AI anomaly detection on calculated amounts                       │
│                                                                      │
│ STEP 3: Verification & Audit (Day 5–7)                               │
│   - Payroll Specialist reviews AI-flagged anomalies                  │
│   - Cross-check headcount vs. payroll count                          │
│   - Verify total payout against budget                               │
│   - Validate statutory deduction calculations                         │
│   - Compare month-over-month variances (flag >10% deviation)         │
│   - Generate verification report                                     │
│                                                                      │
│ STEP 4: Approval & Lock (Day 7–8)                                    │
│   - HR Admin reviews verification report                             │
│   - HR Admin approves or returns for correction                      │
│   - On approval, payroll is LOCKED — no further changes              │
│   - Audit log entry created with approval timestamp                  │
│   - Bank payment file generated in required format                   │
│                                                                      │
│ STEP 5: Disbursement (Day 8–10)                                      │
│   - Payroll Specialist uploads payment file to bank portal            │
│   - Bank confirmation received and reconciled                         │
│   - Payslips generated and auto-emailed to employees                 │
│   - Statutory payment challans generated                             │
│   - Payroll register archived                                        │
│   - Notification sent to all employees                               │
│                                                                      │
│ POST-CONDITIONS:                                                     │
│   - All employees receive salary credit                              │
│   - Payslips available in self-service portal                        │
│   - Statutory payments made within due dates                         │
│   - Payroll data available for Analytics & Reporting                 │
│   - Month locked for further payroll changes                         │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 14.6 Course Enrollment Workflow

**Purpose:** Manage employee course enrollment requests through approval chain ensuring alignment with development plans and budget.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Employee │───▶│  Manager │───▶│  L&D     │───▶│ Enrolled │
│ Request  │    │ Approval │    │ Approval │    │ & Notify │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Employee submits enrollment request                       │
│   - Browse course catalog or follow AI recommendation             │
│   - Select course, preferred schedule (for ILT)                   │
│   - Provide business justification                                │
│   - If course fee ≤ per-course threshold → skip manager approval  │
│                                                                  │
│ STEP 2: Manager approval                                         │
│   - Review alignment with employee development plan               │
│   - Check team workload for schedule compatibility               │
│   - Approve, reject, or suggest alternative course               │
│   - If external course → verify budget allocation                │
│                                                                  │
│ STEP 3: L&D Manager approval                                     │
│   - Verify course relevance and quality                          │
│   - Check seat availability and prerequisites                    │
│   - Approve budget for external courses                          │
│   - Confirm enrollment and allocate resources                    │
│                                                                  │
│ STEP 4: Enrollment & notification                                │
│   - Employee enrolled in course                                  │
│   - Calendar invite sent for ILT sessions                        │
│   - Access credentials generated for online courses              │
│   - Training budget debited                                     │
│   - Manager and employee notified                                │
│                                                                  │
│ ROUTING RULES:                                                   │
│   - Internal free course → Direct enrollment (no approval)       │
│   - Internal paid course → Manager approval only                 │
│   - External course → Manager + L&D Manager approval             │
│   - External course > budget → Manager + L&D + HR Admin approval │
│   - Compliance training → Auto-enrolled, no approval needed      │
│                                                                  │
│ POST-CONDITIONS:                                                 │
│   - Employee added to course roster                              │
│   - Training budget updated                                      │
│   - Calendar entry created                                       │
│   - Pre-assessment scheduled (if applicable)                     │
└──────────────────────────────────────────────────────────────────┘
```

---

### 14.7 Employee Onboarding Workflow

**Purpose:** Ensure a structured, consistent onboarding experience for new employees with complete setup across all systems.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Offer   │─▶│  IT &   │─▶│  Policy  │─▶│ Training │─▶│  Week 1  │
│ Accepted │  │  Setup   │  │  Acknow. │  │  Assign  │  │  Review  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: Offer Accepted (Day -7 to Day 0)                             │
│   - Candidate accepts offer letter via e-signature                    │
│   - System creates employee record with "Pre-boarding" status         │
│   - HR Admin receives notification                                    │
│   - Pre-boarding welcome email sent with document checklist           │
│   - Background verification initiated                                 │
│                                                                      │
│ STEP 2: IT & System Setup (Day -3 to Day 0)                          │
│   - IT team receives provisioning request                             │
│   - Email account created                                             │
│   - Laptop/workstation configured                                     │
│   - Access cards/badges issued                                        │
│   - Software licenses allocated                                       │
│   - Network access configured (VPN, Wi-Fi)                            │
│   - HRMS user account created with Employee role                      │
│                                                                      │
│ STEP 3: Policy Acknowledgment (Day 1)                                 │
│   - Employee completes joining formalities                             │
│   - Digital policy handbook presented                                  │
│   - Employee acknowledges: Code of Conduct, IT Policy,               │
│     Data Privacy Policy, Anti-Harassment Policy                       │
│   - Emergency contacts submitted                                      │
│   - Bank details submitted for payroll setup                          │
│   - Tax declaration form filled                                       │
│   - All mandatory documents uploaded and verified                     │
│                                                                      │
│ STEP 4: Training Assignment (Day 1–5)                                 │
│   - Compliance training auto-assigned (mandatory)                     │
│   - Role-specific training assigned based on AI recommendation        │
│   - Security awareness training completed                             │
│   - Product/tool training scheduled                                   │
│   - Mentor/buddy introduced                                           │
│                                                                      │
│ STEP 5: First Week Review (Day 5–7)                                   │
│   - Manager conducts first-week check-in                              │
│   - Onboarding checklist completion verified                          │
│   - IT setup confirmation                                             │
│   - Training progress reviewed                                        │
│   - Any blockers or issues escalated                                  │
│   - Employee status changed from "Pre-boarding" to "Active"           │
│                                                                      │
│ POST-CONDITIONS:                                                      │
│   - Employee fully provisioned in all systems                         │
│   - All policy acknowledgments recorded                               │
│   - Payroll setup complete with bank details and tax declaration      │
│   - Probation period start date set                                   │
│   - Onboarding checklist 100% complete                                │
│   - First-week review documented                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 14.8 Asset Assignment Workflow

**Purpose:** Manage the lifecycle of IT and non-IT asset requests, approvals, provisioning, and assignment to employees.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Employee │───▶│  Manager │───▶│    IT    │───▶│ Assigned │
│ Request  │    │ Approval │    │Provision │    │ & Record │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Employee submits asset request                            │
│   - Select asset type (laptop, monitor, phone, access card, etc.) │
│   - Provide business justification                                │
│   - Specify urgency (Standard: 5 days, Urgent: 2 days)          │
│   - If replacement → attach return receipt for old asset          │
│                                                                  │
│ STEP 2: Manager approval                                         │
│   - Verify business need                                          │
│   - Check team budget allocation                                  │
│   - Approve, reject, or suggest alternative                      │
│   - Auto-approve for new joiners during onboarding                │
│                                                                  │
│ STEP 3: IT Provisioning                                          │
│   - IT team receives provisioning ticket                          │
│   - Check inventory availability                                  │
│   - If in stock → configure and assign                            │
│   - If not in stock → initiate procurement (notify requester)     │
│   - Install required software and configure access                │
│   - Update asset register with serial number, assignee, date      │
│                                                                  │
│ STEP 4: Assignment & Record                                      │
│   - Asset handed over to employee with acknowledgment             │
│   - Employee digitally accepts asset responsibility               │
│   - Asset record updated in Employee Management module             │
│   - Warranty and maintenance schedule tracked                     │
│   - Return date set (for temporary assignments)                   │
│                                                                  │
│ POST-CONDITIONS:                                                 │
│   - Asset registered in asset inventory                          │
│   - Employee's asset list updated                                │
│   - Insurance/warranty activated                                 │
│   - Maintenance schedule created                                 │
│   - Return process defined for exit/offboarding                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 14.9 Promotion Workflow

**Purpose:** Manage the promotion process with multi-level review ensuring fairness, budget compliance, and organizational alignment.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Manager  │───▶│   HR     │───▶│ Committee│───▶│  Implement│
│Nomination│    │  Review  │    │ Approval │    │  & Notify │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Manager Nomination                                       │
│   - Manager nominates employee for promotion                     │
│   - Provide justification: performance, readiness, business need │
│   - Propose new role, grade, and compensation                    │
│   - Attach performance review history                            │
│   - Verify minimum tenure in current role (12 months)            │
│                                                                  │
│ STEP 2: HR Review                                                │
│   - HR Admin validates against promotion policy                  │
│   - AI checks: internal equity, market benchmark, budget fit     │
│   - Verify performance ratings meet threshold                    │
│   - Check organizational headcount and budget allocation         │
│   - Recommend approval, modification, or deferral               │
│                                                                  │
│ STEP 3: Committee Approval                                       │
│   - Promotion committee (senior leadership) reviews nomination   │
│   - Committee can: approve, approve with modification, defer,    │
│     or reject                                                    │
│   - If compensation increase > 25% → requires CFO approval      │
│   - Final decision recorded with comments                        │
│                                                                  │
│ STEP 4: Implementation                                           │
│   - Employee Management module updates role, grade, manager      │
│   - Payroll module updates salary structure                      │
│   - RBAC module updates access permissions for new role          │
│   - L&D module assigns role-transition training                  │
│   - Employee formally notified with revised offer letter         │
│   - Org chart updated                                            │
│   - Reporting chain updated (if applicable)                      │
│                                                                  │
│ POST-CONDITIONS:                                                 │
│   - Employee record updated with new role and grade              │
│   - Salary structure revised in payroll                          │
│   - Access permissions updated                                   │
│   - Org chart refreshed                                          │
│   - Promotion history recorded                                   │
│   - Succession plan updated                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 15. Complete RBAC Permission Matrix

The following matrix defines the permission level for each role across all modules and all action types.

**Legend:**  
- **A** = ADMIN (full control including configuration)  
- **W** = WRITE (create and update)  
- **M** = MODIFY (update only, no create)  
- **R** = READ (view only)  
- **O** = READ (own data only)  
- **—** = No Access

| Module | Action | Super Admin | HR Admin | Payroll Specialist | Dept Manager | Employee | Recruiter | L&D Manager |
|--------|--------|:-----------:|:--------:|:------------------:|:------------:|:--------:|:---------:|:-----------:|
| Dashboard | Read | A | A | R | R | O | R | R |
| Dashboard | Configure Widgets | A | A | — | — | — | — | — |
| Dashboard | Publish Announcements | A | W | — | — | — | — | — |
| Employee Mgmt | Create Employee | A | W | — | — | — | — | — |
| Employee Mgmt | Read Employee | A | A | R | O | O | — | — |
| Employee Mgmt | Update Employee | A | W | M(comp) | M(team) | M(own) | — | — |
| Employee Mgmt | Delete Employee | A | — | — | — | — | — | — |
| Employee Mgmt | Import/Export | A | W | R | — | — | — | — |
| Employee Mgmt | View Org Chart | A | A | R | R | R | R | R |
| RBAC & Security | Create User | A | W | — | — | — | — | — |
| RBAC & Security | Assign Roles | A | W(limited) | — | — | — | — | — |
| RBAC & Security | Edit Permissions | A | — | — | — | — | — | — |
| RBAC & Security | View Audit Log | A | R | R(payroll) | R(team) | O | — | — |
| RBAC & Security | Manage MFA | A | R | — | — | W(own) | — | — |
| RBAC & Security | Manage API Keys | A | — | — | — | — | — | — |
| AI Talent Acq | Create Requisition | A | W | — | W(request) | — | W | — |
| AI Talent Acq | Publish Job | A | W | — | — | — | W | — |
| AI Talent Acq | Screen Candidates | A | W | — | — | — | A | — |
| AI Talent Acq | Schedule Interview | A | W | — | W(panel) | — | W | — |
| AI Talent Acq | Generate Offer | A | W | R(comp) | — | — | W | — |
| AI Talent Acq | View Pipeline | A | A | — | R(team) | — | A | — |
| Time & Attendance | Check In/Out | A | A | W(own) | W(own) | W(own) | W(own) | W(own) |
| Time & Attendance | Manage Shifts | A | W | — | R(team) | O | — | — |
| Time & Attendance | Apply Leave | A | W | W(own) | W(own) | W(own) | W(own) | W(own) |
| Time & Attendance | Approve Leave | A | W | — | W | — | — | — |
| Time & Attendance | Regularize Attendance | A | W | — | W(approve) | W(request) | W(request) | W(request) |
| Time & Attendance | Configure Policy | A | W | — | — | — | — | — |
| Payroll & Expenses | Define Salary Structure | A | W | W | — | — | — | — |
| Payroll & Expenses | Process Payroll | A | W(approve) | A | — | — | — | — |
| Payroll & Expenses | Submit Expense | A | W(audit) | W(own) | W(own+approve) | W(own) | W(own) | W(own) |
| Payroll & Expenses | Approve Expense | A | W(audit) | W(process) | W(approve) | — | — | — |
| Payroll & Expenses | Generate Payslip | A | W | W | — | O | — | — |
| Payroll & Expenses | Tax Declaration | A | R | R | — | W(own) | — | — |
| Payroll & Expenses | Bank Integration | A | — | A | — | — | — | — |
| Performance & Talent | Set Goals | A | W | — | W(team) | W(own) | — | — |
| Performance & Talent | Self-Assessment | A | R | — | R(team) | W(own) | — | — |
| Performance & Talent | Manager Review | A | R | — | W(team) | — | — | — |
| Performance & Talent | Assign Peer Reviewers | A | W | — | W | — | — | — |
| Performance & Talent | Calibration | A | W | — | W | — | — | — |
| Performance & Talent | Nominate Promotion | A | W | R(comp) | W | — | — | — |
| Performance & Talent | Manage PIP | A | W | — | W(team) | O | — | R |
| Learning & Dev | Manage Course Catalog | A | W | — | — | — | — | A |
| Learning & Dev | Enroll in Course | A | W | — | W(approve) | W(request) | — | W(approve) |
| Learning & Dev | Conduct Assessment | A | R | — | R(team) | W(own) | — | A |
| Learning & Dev | Manage Certifications | A | W | — | R(team) | O | — | A |
| Learning & Dev | Configure Learning Paths | A | W | — | — | — | — | A |
| Learning & Dev | Manage Budget | A | W | R | — | — | — | A |
| Analytics & Reporting | Run Standard Reports | A | A | R(payroll) | R(team) | O | R(recruit) | R(L&D) |
| Analytics & Reporting | Build Custom Reports | A | W | W(payroll) | W(team) | — | W(recruit) | W(L&D) |
| Analytics & Reporting | Schedule Reports | A | W | W(payroll) | W(team) | — | W(recruit) | W(L&D) |
| Analytics & Reporting | Export Data | A | W | W(payroll) | W(team) | O | W(recruit) | W(L&D) |
| Analytics & Reporting | AI Predictive Analytics | A | W | R | R(team) | — | R(recruit) | R(L&D) |
| Employee Self-Svc | Update Profile | A | W | W(own) | W(own) | W(own) | W(own) | W(own) |
| Employee Self-Svc | View Documents | A | W | R(payroll) | O | O | O | O |
| Employee Self-Svc | Submit Grievance | A | W(resolve) | — | R(team) | W(own) | — | — |
| Employee Self-Svc | Use AI Chatbot | A | A | R | R | R | R | R |
| Employee Self-Svc | Request Asset | A | W(approve) | W(own) | W(approve) | W(own) | W(own) | W(own) |

---

## 16. Workflow State Machine Definitions

### 16.1 Leave Request State Machine

```
States: [DRAFT, PENDING_MANAGER, PENDING_HR, APPROVED, REJECTED, 
         CANCELLED, MODIFICATION_REQUESTED, CANCELLATION_PENDING, ESCALATED]

DRAFT ──submit──▶ PENDING_MANAGER
PENDING_MANAGER ──manager_approve──▶ PENDING_HR
PENDING_MANAGER ──manager_reject──▶ REJECTED
PENDING_MANAGER ──request_modification──▶ MODIFICATION_REQUESTED
PENDING_MANAGER ──timeout(72h)──▶ ESCALATED
MODIFICATION_REQUESTED ──resubmit──▶ PENDING_MANAGER
MODIFICATION_REQUESTED ──cancel──▶ CANCELLED
PENDING_HR ──hr_approve──▶ APPROVED
PENDING_HR ──hr_reject──▶ REJECTED
PENDING_HR ──timeout(72h)──▶ ESCALATED
APPROVED ──employee_cancel──▶ CANCELLATION_PENDING
CANCELLATION_PENDING ──manager_approve_cancel──▶ CANCELLED
CANCELLATION_PENDING ──manager_reject_cancel──▶ APPROVED
ESCALATED ──any_approve──▶ APPROVED
ESCALATED ──any_reject──▶ REJECTED

Terminal States: [APPROVED, REJECTED, CANCELLED]
```

### 16.2 Expense Claim State Machine

```
States: [DRAFT, PENDING_MANAGER, PENDING_FINANCE, PENDING_HR, 
         APPROVED, REJECTED, RETURNED_FOR_CORRECTION, DISBURSED, ESCALATED]

DRAFT ──submit──▶ PENDING_MANAGER
PENDING_MANAGER ──approve(≤threshold_low)──▶ APPROVED
PENDING_MANAGER ──approve(>threshold_low)──▶ PENDING_FINANCE
PENDING_MANAGER ──reject──▶ REJECTED
PENDING_MANAGER ──return──▶ RETURNED_FOR_CORRECTION
PENDING_FINANCE ──approve(≤threshold_high)──▶ APPROVED
PENDING_FINANCE ──approve(>threshold_high)──▶ PENDING_HR
PENDING_FINANCE ──reject──▶ REJECTED
PENDING_FINANCE ──return──▶ RETURNED_FOR_CORRECTION
PENDING_HR ──approve──▶ APPROVED
PENDING_HR ──reject──▶ REJECTED
PENDING_HR ──return──▶ RETURNED_FOR_CORRECTION
RETURNED_FOR_CORRECTION ──resubmit──▶ PENDING_MANAGER
APPROVED ──disburse──▶ DISBURSED

Terminal States: [DISBURSED, REJECTED]
```

### 16.3 Performance Review State Machine

```
States: [NOT_STARTED, SELF_REVIEW, PEER_REVIEW, MANAGER_REVIEW, 
         CALIBRATION, HR_REVIEW, COMPLETED]

NOT_STARTED ──cycle_start──▶ SELF_REVIEW
SELF_REVIEW ──self_submit──▶ PEER_REVIEW
SELF_REVIEW ──timeout(7d)──▶ PEER_REVIEW (auto-advance with empty self-review)
PEER_REVIEW ──all_peers_submitted──▶ MANAGER_REVIEW
PEER_REVIEW ──timeout(7d)──▶ MANAGER_REVIEW (auto-advance with received reviews)
MANAGER_REVIEW ──manager_submit──▶ CALIBRATION
MANAGER_REVIEW ──timeout(7d)──▶ CALIBRATION (escalate to HR)
CALIBRATION ──calibration_complete──▶ HR_REVIEW
HR_REVIEW ──hr_approve──▶ COMPLETED
HR_REVIEW ──hr_return──▶ CALIBRATION

Terminal States: [COMPLETED]
```

### 16.4 Recruitment Pipeline State Machine

```
States: [REQUISITION_DRAFT, REQUISITION_PENDING, REQUISITION_APPROVED,
         APPLICATION_RECEIVED, AI_SCREENING, SHORTLISTED, 
         INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, OFFER_PENDING,
         OFFERED, OFFER_ACCEPTED, OFFER_REJECTED, HIRED, REJECTED,
         TALENT_POOL]

REQUISITION_DRAFT ──submit──▶ REQUISITION_PENDING
REQUISITION_PENDING ──approve──▶ REQUISITION_APPROVED
REQUISITION_PENDING ──reject──▶ REJECTED
REQUISITION_APPROVED ──publish──▶ APPLICATION_RECEIVED
APPLICATION_RECEIVED ──run_ai_screening──▶ AI_SCREENING
AI_SCREENING ──shortlist──▶ SHORTLISTED
AI_SCREENING ──reject──▶ TALENT_POOL
SHORTLISTED ──schedule_interview──▶ INTERVIEW_SCHEDULED
INTERVIEW_SCHEDULED ──complete──▶ INTERVIEW_COMPLETED
INTERVIEW_COMPLETED ──advance──▶ OFFER_PENDING
INTERVIEW_COMPLETED ──reject──▶ TALENT_POOL
OFFER_PENDING ──generate_offer──▶ OFFERED
OFFERED ──candidate_accept──▶ OFFER_ACCEPTED
OFFERED ──candidate_reject──▶ OFFER_REJECTED
OFFER_ACCEPTED ──onboarding_complete──▶ HIRED
OFFER_REJECTED ──reopen──▶ SHORTLISTED (or close requisition)
TALENT_POOL ──reactivate──▶ SHORTLISTED

Terminal States: [HIRED, REJECTED]
```

### 16.5 Payroll Processing State Machine

```
States: [INITIALIZED, DATA_COLLECTION, CALCULATION, VERIFICATION, 
         APPROVAL, LOCKED, DISBURSEMENT_PENDING, DISBURSED, 
         RETURNED_FOR_CORRECTION]

INITIALIZED ──start_cycle──▶ DATA_COLLECTION
DATA_COLLECTION ──data_complete──▶ CALCULATION
DATA_COLLECTION ──data_incomplete──▶ RETURNED_FOR_CORRECTION
CALCULATION ──calculation_complete──▶ VERIFICATION
VERIFICATION ──verified──▶ APPROVAL
VERIFICATION ──issues_found──▶ RETURNED_FOR_CORRECTION
APPROVAL ──approved──▶ LOCKED
APPROVAL ──rejected──▶ RETURNED_FOR_CORRECTION
LOCKED ──generate_payment──▶ DISBURSEMENT_PENDING
DISBURSEMENT_PENDING ──confirm_payment──▶ DISBURSED
RETURNED_FOR_CORRECTION ──resubmit──▶ DATA_COLLECTION

Terminal States: [DISBURSED]
```

### 16.6 Course Enrollment State Machine

```
States: [REQUESTED, PENDING_MANAGER, PENDING_L&D, PENDING_HR,
         ENROLLED, REJECTED, CANCELLED, COMPLETED, WAITLISTED]

REQUESTED ──auto_enroll(compliance)──▶ ENROLLED
REQUESTED ──submit(free_internal)──▶ ENROLLED
REQUESTED ──submit(paid_internal)──▶ PENDING_MANAGER
REQUESTED ──submit(external)──▶ PENDING_MANAGER
PENDING_MANAGER ──approve──▶ PENDING_L&D (if external) / ENROLLED (if internal)
PENDING_MANAGER ──reject──▶ REJECTED
PENDING_L&D ──approve──▶ ENROLLED (if within budget) / PENDING_HR (if over budget)
PENDING_L&D ──reject──▶ REJECTED
PENDING_L&D ──waitlist──▶ WAITLISTED
PENDING_HR ──approve──▶ ENROLLED
PENDING_HR ──reject──▶ REJECTED
ENROLLED ──complete──▶ COMPLETED
ENROLLED ──cancel──▶ CANCELLED
WAITLISTED ──seat_available──▶ ENROLLED

Terminal States: [COMPLETED, REJECTED, CANCELLED]
```

### 16.7 Onboarding State Machine

```
States: [OFFER_ACCEPTED, PRE_BOARDING, IT_SETUP, POLICY_ACK, 
         TRAINING_ASSIGNED, FIRST_WEEK_REVIEW, COMPLETED]

OFFER_ACCEPTED ──initiate──▶ PRE_BOARDING
PRE_BOARDING ──setup_start──▶ IT_SETUP
IT_SETUP ──setup_complete──▶ POLICY_ACK
POLICY_ACK ──all_acknowledged──▶ TRAINING_ASSIGNED
TRAINING_ASSIGNED ──compliance_training_done──▶ FIRST_WEEK_REVIEW
FIRST_WEEK_REVIEW ──review_passed──▶ COMPLETED
FIRST_WEEK_REVIEW ──issues_found──▶ TRAINING_ASSIGNED (loop back)

Terminal States: [COMPLETED]
```

### 16.8 Asset Assignment State Machine

```
States: [REQUESTED, PENDING_MANAGER, IT_PROVISIONING, 
         ASSIGNED, RETURNED, RETURN_PENDING, DECOMMISSIONED]

REQUESTED ──submit──▶ PENDING_MANAGER
PENDING_MANAGER ──approve──▶ IT_PROVISIONING
PENDING_MANAGER ──reject──▶ DECOMMISSIONED
IT_PROVISIONING ──provision_complete──▶ ASSIGNED
IT_PROVISIONING ──out_of_stock──▶ REQUESTED (notify requester)
ASSIGNED ──return_initiated──▶ RETURN_PENDING
RETURN_PENDING ──returned──▶ RETURNED
RETURNED ──decommission──▶ DECOMMISSIONED
RETURNED ──reassign──▶ IT_PROVISIONING

Terminal States: [DECOMMISSIONED]
```

### 16.9 Promotion State Machine

```
States: [NOMINATED, HR_REVIEW, COMMITTEE_REVIEW, CFO_APPROVAL,
         APPROVED, REJECTED, DEFERRED, IMPLEMENTED]

NOMINATED ──submit──▶ HR_REVIEW
HR_REVIEW ──recommend──▶ COMMITTEE_REVIEW
HR_REVIEW ──defer──▶ DEFERRED
HR_REVIEW ──reject──▶ REJECTED
COMMITTEE_REVIEW ──approve──▶ APPROVED (if comp increase ≤ 25%)
COMMITTEE_REVIEW ──approve(comp>25%)──▶ CFO_APPROVAL
COMMITTEE_REVIEW ──defer──▶ DEFERRED
COMMITTEE_REVIEW ──reject──▶ REJECTED
CFO_APPROVAL ──approve──▶ APPROVED
CFO_APPROVAL ──reject──▶ REJECTED
APPROVED ──implement──▶ IMPLEMENTED
DEFERRED ──resubmit──▶ HR_REVIEW

Terminal States: [IMPLEMENTED, REJECTED]
```

---

## 17. Notification Triggers

### 17.1 Leave Workflow Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Leave submitted | Manager | Email + In-app | `leave.submitted.manager` |
| Leave approved by manager | HR Admin | In-app | `leave.approved.hr` |
| Leave approved (final) | Employee | Email + In-app + Push | `leave.approved.employee` |
| Leave rejected | Employee | Email + In-app | `leave.rejected.employee` |
| Modification requested | Employee | Email + In-app | `leave.modification.requested` |
| Leave cancellation requested | Manager | Email + In-app | `leave.cancel.request` |
| Leave escalation | HR Admin | Email + In-app + SMS | `leave.escalated` |
| Leave starting tomorrow | Employee + Manager | Push | `leave.reminder.tomorrow` |
| Leave balance low (<3 days) | Employee | In-app | `leave.balance.low` |

### 17.2 Expense Workflow Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Expense submitted | Manager | Email + In-app | `expense.submitted.manager` |
| Expense approved by manager | Finance/Payroll | In-app | `expense.approved.finance` |
| Expense returned for correction | Employee | Email + In-app | `expense.returned.employee` |
| Expense approved (final) | Employee | Email + In-app | `expense.approved.employee` |
| Expense disbursed | Employee | Email + Push | `expense.disbursed` |
| AI fraud flag detected | Finance + HR Admin | Email + In-app + SMS | `expense.fraud.flag` |
| Policy violation warning | Employee (on submit) | In-app | `expense.policy.warning` |

### 17.3 Performance Workflow Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Review cycle started | All participants | Email + In-app | `review.cycle.started` |
| Self-review due in 2 days | Employee | Email + Push | `review.self.due` |
| Self-review overdue | Employee + Manager | Email + In-app | `review.self.overdue` |
| Peer review requested | Peer reviewers | Email + In-app | `review.peer.requested` |
| Manager review ready | Manager | Email + In-app | `review.manager.ready` |
| Calibration session scheduled | Managers + HR | Calendar + Email | `review.calibration.scheduled` |
| Review completed | Employee | Email + In-app | `review.completed` |
| Bias detected alert | HR Admin | In-app | `review.bias.detected` |
| PIP initiated | Employee + Manager | Email + In-app (confidential) | `performance.pip.initiated` |

### 17.4 Recruitment Workflow Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Requisition submitted | HR Admin | Email + In-app | `recruit.requisition.submitted` |
| Requisition approved | Recruiter | Email + In-app | `recruit.requisition.approved` |
| New application received | Recruiter | In-app | `recruit.application.received` |
| AI screening complete | Recruiter | In-app | `recruit.screening.complete` |
| Interview scheduled | Interviewer + Candidate | Email + Calendar | `recruit.interview.scheduled` |
| Interview feedback overdue | Interviewer | Email + In-app | `recruit.feedback.overdue` |
| Offer generated | HR Admin | In-app | `recruit.offer.generated` |
| Offer accepted | Recruiter + Manager | Email + In-app | `recruit.offer.accepted` |
| Offer rejected | Recruiter | In-app | `recruit.offer.rejected` |
| Onboarding handoff | HR Admin + IT + Manager | Email + In-app | `recruit.onboarding.handoff` |

### 17.5 Payroll Workflow Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Payroll cycle initialized | Payroll Specialist | In-app | `payroll.cycle.initialized` |
| Data collection complete | Payroll Specialist | In-app | `payroll.data.complete` |
| AI anomaly detected | Payroll Specialist + HR Admin | Email + In-app | `payroll.anomaly.detected` |
| Payroll verification complete | HR Admin | In-app | `payroll.verification.complete` |
| Payroll approved & locked | Payroll Specialist | In-app | `payroll.approved.locked` |
| Salary credited | All employees | Email + Push | `payroll.credited` |
| Payslip available | All employees | Email | `payroll.payslip.available` |
| Tax declaration reminder | All employees | In-app | `payroll.tax.reminder` |

### 17.6 Course Enrollment Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Enrollment requested | Manager | In-app | `course.enroll.requested` |
| Manager approved | L&D Manager | In-app | `course.enroll.manager.approved` |
| Enrollment confirmed | Employee | Email + In-app | `course.enroll.confirmed` |
| Enrollment rejected | Employee | Email + In-app | `course.enroll.rejected` |
| Course starting tomorrow | Employee | Push | `course.reminder.tomorrow` |
| Certification expiring (90/60/30 days) | Employee + L&D Manager | Email | `cert.expiring.reminder` |
| Compliance training overdue | Employee + Manager | Email + In-app | `training.compliance.overdue` |

### 17.7 Onboarding Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Offer accepted | HR Admin + IT + Manager | Email + In-app | `onboarding.offer.accepted` |
| IT setup complete | HR Admin + Employee | In-app | `onboarding.it.complete` |
| Day 1 welcome | New employee | Email | `onboarding.welcome` |
| Policy acknowledgment pending | Employee | In-app | `onboarding.policy.pending` |
| Training assigned | Employee | In-app | `onboarding.training.assigned` |
| First week review scheduled | Manager + Employee | Calendar + In-app | `onboarding.week1.scheduled` |
| Onboarding complete | HR Admin + Manager | In-app | `onboarding.complete` |

### 17.8 Asset Assignment Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Asset requested | Manager | In-app | `asset.requested` |
| Asset approved | IT team | In-app (ticket) | `asset.approved.it` |
| Asset provisioned | Employee | Email + In-app | `asset.provisioned` |
| Asset out of stock | Employee + Manager | In-app | `asset.out.of.stock` |
| Asset return reminder (exit) | Employee | Email + In-app | `asset.return.reminder` |
| Warranty expiring | IT team + Employee | Email | `asset.warranty.expiring` |

### 17.9 Promotion Notifications

| Trigger | Recipient | Channel | Template |
|---------|-----------|---------|----------|
| Promotion nominated | HR Admin | In-app (confidential) | `promotion.nominated` |
| HR review complete | Committee members | In-app (confidential) | `promotion.hr.reviewed` |
| Committee approved | Employee + Manager | Email + In-app | `promotion.approved` |
| Promotion implemented | Employee | Email + In-app | `promotion.implemented` |
| Promotion deferred | Nominating manager | In-app | `promotion.deferred` |
| Promotion rejected | Nominating manager | In-app (confidential) | `promotion.rejected` |

---

## 18. Cross-Module Integration Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HRMS CROSS-MODULE INTEGRATION MAP                 │
│                                                                     │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐  │
│  │  Dashboard   │◀───▶│  Employee Mgmt   │◀───▶│  RBAC & Security│  │
│  │  (Read All)  │     │  (Master Data)   │     │  (Auth & Authz) │  │
│  └──────┬───────┘     └────────┬─────────┘     └────────┬────────┘  │
│         │                      │                         │           │
│         │              ┌───────┼─────────┐               │           │
│         │              │       │         │               │           │
│         ▼              ▼       ▼         ▼               ▼           │
│  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────────┐  │
│  │  Analytics   │ │ Payroll │ │  Time &  │ │  AI Talent           │  │
│  │  & Reporting │ │ & Exp   │ │Attend.   │ │  Acquisition         │  │
│  │  (Read All)  │ │         │ │          │ │                      │  │
│  └──────────────┘ └────┬────┘ └────┬─────┘ └──────────┬───────────┘  │
│                        │           │                    │              │
│                        │    ┌──────┼────────┐          │              │
│                        ▼    ▼      ▼        ▼          ▼              │
│                   ┌──────────┐ ┌──────────┐ ┌──────────────────┐     │
│                   │Performance│ │  L&D     │ │  Employee        │     │
│                   │ & Talent  │ │          │ │  Self-Service    │     │
│                   │           │ │          │ │  (Unified Portal)│     │
│                   └───────────┘ └──────────┘ └──────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

INTEGRATION DETAILS:

1. Employee Management ←→ RBAC & Security
   - Employee creation triggers user account provisioning
   - Role changes in RBAC update employee access levels
   - Employee deactivation triggers account suspension

2. Employee Management ←→ AI Talent Acquisition
   - Candidate hiring triggers employee record creation
   - Onboarding handoff creates checklist items
   - Employee org data informs requisition approval routing

3. Employee Management ←→ Payroll & Expenses
   - Employee bank details flow to payroll setup
   - Salary structure defined in payroll references employee grade
   - Employee exit triggers final settlement calculation

4. Time & Attendance ←→ Payroll & Expenses
   - Attendance data feeds payroll calculation (LWP, OT)
   - Leave deductions auto-reflected in payroll
   - Approved overtime hours flow to payroll calculation

5. Performance & Talent ←→ Payroll & Expenses
   - Review ratings trigger bonus and increment calculations
   - Promotion implementation updates salary structure
   - PIP status may affect variable pay eligibility

6. Performance & Talent ←→ Learning & Development
   - Skill gaps identified in reviews auto-create training needs
   - PIP includes mandatory training assignments
   - 9-Box classification informs leadership development paths

7. Learning & Development ←→ Time & Attendance
   - Training days recorded as "Training Leave"
   - Course completion affects attendance requirements
   - ILT sessions block employee calendar

8. AI Talent Acquisition ←→ Learning & Development
   - New hire onboarding includes mandatory training
   - Competency frameworks used for candidate assessment
   - Offer includes L&D benefits information

9. Dashboard ←→ All Modules
   - Aggregated read access to all module KPIs
   - Real-time event subscription for widget updates
   - AI insights pull data from multiple modules

10. Analytics & Reporting ←→ All Modules
    - Read access to all module data (subject to RBAC)
    - Cross-module report generation
    - Data warehouse ETL from all source modules

11. Employee Self-Service ←→ All Modules
    - Unified portal aggregating employee-facing features
    - Read/write delegation to respective modules
    - AI chatbot routes queries to appropriate modules
```

---

## 19. Data Flow Diagrams

### 19.1 Employee Onboarding Data Flow

```
AI Talent Acquisition          Employee Management           RBAC & Security
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ Offer Accepted   │─────────▶│ Create Employee  │─────────▶│ Create User      │
│ Candidate Data   │          │ Master Record    │          │ Account          │
│ Role & Dept      │          │ Assign ID        │          │ Assign Role      │
│ Compensation     │          │ Set Status:      │          │ Generate         │
└──────────────────┘          │ Pre-boarding     │          │ Credentials      │
                              └────────┬─────────┘          └──────────────────┘
                                       │
                    ┌──────────────────┼────────────────────┐
                    │                  │                     │
                    ▼                  ▼                     ▼
           Payroll & Expenses   Time & Attendance    Learning & Dev
           ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
           │ Setup Salary     │ │ Assign Work      │ │ Assign Mandatory │
           │ Structure        │ │ Schedule         │ │ Training         │
           │ Configure Tax    │ │ Set Leave        │ │ Create Learning  │
           │ Bank Details     │ │ Balances         │ │ Path             │
           └──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 19.2 Monthly Payroll Data Flow

```
Time & Attendance          Employee Management         Performance & Talent
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│ Attendance Data  │──────▶│ New Joiners      │───────▶│ Bonus/Increment  │
│ Leave Deductions │       │ Exits/Terminations│        │ Variable Pay     │
│ OT Hours         │       │ Salary Changes   │        │ Promotion Data   │
└──────────────────┘       └──────────────────┘        └──────────────────┘
        │                          │                           │
        └──────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
                          Payroll & Expenses
                    ┌──────────────────────────────┐
                    │  Data Collection (Step 1)     │
                    │           │                   │
                    │           ▼                   │
                    │  Calculation (Step 2)         │
                    │  - Gross = Basic + Allowances │
                    │  - Deductions = PF+ESI+TDS   │
                    │  - Net = Gross - Deductions   │
                    │           │                   │
                    │           ▼                   │
                    │  Verification & Approval      │
                    │           │                   │
                    │           ▼                   │
                    │  Disbursement                 │
                    │  - Bank File Generation       │
                    │  - Payslip Generation         │
                    │  - Statutory Payments         │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┼───────────────┐
                    │              │               │
                    ▼              ▼               ▼
            Employee Self-Svc  Analytics        Bank System
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ View Payslip │  │ Payroll      │  │ Process      │
            │ Tax Forms    │  │ Reports      │  │ Payments     │
            └──────────────┘  └──────────────┘  └──────────────┘
```

### 19.3 Performance Review Data Flow

```
Performance & Talent ──▶ Learning & Development ──▶ Payroll & Expenses
┌──────────────────┐    ┌──────────────────┐      ┌──────────────────┐
│ Self-Review Data │───▶│ Skill Gaps       │─────▶│ Bonus Calc       │
│ Peer Feedback    │    │ Training Needs   │      │ Increment Calc   │
│ Manager Rating   │    │ Development Plan │      │ Promotion Pay    │
│ Calibration      │    └──────────────────┘      └──────────────────┘
│ 9-Box Score      │
│ Succession Data  │──────────────────────────────────────┐
└──────────────────┘                                      │
       │                                                  │
       ▼                                                  ▼
Employee Management                              Employee Self-Service
┌──────────────────┐                            ┌──────────────────┐
│ Update Role/Grade│◀─── Promotion Flow ◀───────│ View Results     │
│ Update Manager   │                            │ Acknowledge      │
│ Job History      │                            │ Development Plan │
└──────────────────┘                            └──────────────────┘
```

---

## 20. Appendix

### 20.1 Permission Action Definitions

| Action | Definition |
|--------|-----------|
| **ADMIN** | Full control including configuration, policy settings, and override capabilities. Can delegate permissions to lower roles. |
| **WRITE** | Can create new records and update existing records within the scope. Cannot configure policies or delegate. |
| **MODIFY** | Can update existing records only. Cannot create new records or delete. |
| **READ** | Can view all records within the role's data scope (department, team, or organization-wide). |
| **READ(own)** | Can view only the user's own records. No access to other employees' data. |
| **DELETE** | Can permanently remove records. Reserved for Super Admin only. |
| **—** | No access. The module or feature is not visible or accessible. |

### 20.2 Workflow SLA Definitions

| Workflow | Step | SLA | Escalation |
|----------|------|-----|------------|
| Leave Approval | Manager Review | 48 hours | Auto-escalate to HR Admin |
| Leave Approval | HR Review | 24 hours | Notify Super Admin |
| Expense Approval | Manager Review | 72 hours | Auto-escalate to Finance |
| Expense Approval | Finance Review | 48 hours | Notify HR Admin |
| Expense Approval | HR Review | 24 hours | Notify Super Admin |
| Performance Review | Self-Assessment | 7 days | Notify Manager |
| Performance Review | Peer Review | 7 days | Notify HR Admin |
| Performance Review | Manager Review | 7 days | Escalate to HR Admin |
| Performance Review | Calibration | 5 days | Escalate to HR Admin |
| Recruitment | Requisition Approval | 48 hours | Escalate to HR Admin |
| Recruitment | AI Screening | 4 hours | Alert Recruiter |
| Recruitment | Interview Scheduling | 3 days | Alert HR Admin |
| Recruitment | Offer Generation | 2 days | Alert HR Admin |
| Payroll | Data Collection | 3 days | Alert Payroll Specialist |
| Payroll | Verification | 2 days | Alert HR Admin |
| Payroll | Approval | 1 day | Alert Super Admin |
| Course Enrollment | Manager Approval | 48 hours | Auto-approve (for compliance) |
| Course Enrollment | L&D Approval | 48 hours | Notify HR Admin |
| Onboarding | IT Setup | 3 days before joining | Escalate to IT Head |
| Onboarding | Policy Acknowledgment | Day 1 | Notify Manager |
| Onboarding | First Week Review | Day 5–7 | Escalate to HR Admin |
| Asset Assignment | Manager Approval | 24 hours | Auto-approve (for onboarding) |
| Asset Assignment | IT Provisioning | 5 days (standard) / 2 days (urgent) | Escalate to IT Head |
| Promotion | HR Review | 5 days | Escalate to Super Admin |
| Promotion | Committee Review | 10 days | Escalate to CEO |

### 20.3 Data Retention Policies

| Data Category | Active Retention | Archive Retention | Disposal |
|--------------|:----------------:|:-----------------:|:--------:|
| Employee Master Data | Employment duration + 7 years | 10 years | Secure delete |
| Payroll Records | 7 years | 10 years | Secure delete |
| Attendance Records | 3 years | 7 years | Secure delete |
| Performance Reviews | 5 years | 10 years | Secure delete |
| Recruitment Data (Hired) | Employment duration + 7 years | 10 years | Secure delete |
| Recruitment Data (Not Hired) | 1 year | 3 years | Anonymize |
| Training Records | 5 years | 10 years | Secure delete |
| Audit Logs | 3 years | 7 years | Secure delete |
| Expense Records | 7 years | 10 years | Secure delete |
| Grievance Records | 3 years post resolution | 7 years | Secure delete |

### 20.4 AI Model Governance

| AI Feature | Model Type | Retraining Frequency | Bias Audit Frequency | Human Override |
|-----------|-----------|:--------------------:|:--------------------:|:--------------:|
| Resume Screening | NER + Classification | Monthly | Quarterly | Always available |
| Bias Detection | NLP + Statistical | Monthly | Monthly | N/A (advisory) |
| Attrition Prediction | XGBoost Ensemble | Weekly | Quarterly | Always available |
| Payroll Anomaly | Statistical + Rule-based | Daily | Monthly | Always available |
| Expense Fraud | OCR + Classification | Monthly | Quarterly | Always available |
| Performance Bias | Statistical | Per review cycle | Per review cycle | N/A (advisory) |
| Learning Recommendations | Collaborative Filtering | Weekly | Quarterly | Always available |
| Login Anomaly | Isolation Forest | Daily | Monthly | Always available |
| NL Query | LLM | Continuous | Quarterly | N/A (read-only) |
| Shift Optimization | Genetic Algorithm | Per scheduling cycle | Quarterly | Always available |

### 20.5 Glossary

| Term | Definition |
|------|-----------|
| **CTC** | Cost to Company — total compensation including all components |
| **ESI** | Employee State Insurance — statutory health insurance |
| **ILT** | Instructor-Led Training — live training sessions |
| **LMS** | Learning Management System |
| **LWP** | Leave Without Pay |
| **MFA** | Multi-Factor Authentication |
| **NER** | Named Entity Recognition |
| **OKR** | Objectives and Key Results |
| **OT** | Overtime |
| **PF** | Provident Fund |
| **PIP** | Performance Improvement Plan |
| **RBAC** | Role-Based Access Control |
| **SCORM** | Sharable Content Object Reference Model |
| **TDS** | Tax Deducted at Source |
| **WFH** | Work From Home |

---

**Document End**

*This document is a living specification and is updated with each sprint cycle. All changes must be approved by the HRMS Product Architecture Team. Last reviewed: 2025-03-05.*
