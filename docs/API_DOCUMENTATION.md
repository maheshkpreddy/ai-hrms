# AI-Powered HRMS API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:3000/api`  
> **Format:** JSON  
> **Authentication:** Bearer token (planned — currently open access)  
> **Rate Limit:** 100 requests/minute per IP (production)

---

## Table of Contents

1. [Authentication & Headers](#authentication--headers)
2. [Employees — Collection](#1-employees--collection)
3. [Employees — Single Resource](#2-employees--single-resource)
4. [Attendance](#3-attendance)
5. [Leaves](#4-leaves)
6. [Payroll](#5-payroll)
7. [Expenses](#6-expenses)
8. [Performance Reviews](#7-performance-reviews)
9. [Job Postings](#8-job-postings)
10. [Candidates](#9-candidates)
11. [Courses & Enrollments](#10-courses--enrollments)
12. [Audit Logs](#11-audit-logs)
13. [Dashboard Statistics](#12-dashboard-statistics)
14. [AI Chatbot](#13-ai-chatbot)
15. [Error Handling](#error-handling)
16. [Rate Limiting](#rate-limiting)

---

## Authentication & Headers

All API requests should include the following headers:

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `Content-Type` | `application/json` | Yes | Required for POST/PATCH/PUT requests |
| `Authorization` | `Bearer <token>` | Planned | JWT token for authenticated requests |

> **Note:** Authentication middleware is planned for a future release. Currently, all endpoints are accessible without authentication for development purposes.

---

## 1. Employees — Collection

### `POST /api/employees` — Create Employee

Creates a new employee record and generates an audit log entry.

**Request Body:**

```json
{
  "employeeId": "EMP021",
  "firstName": "Ananya",
  "lastName": "Patel",
  "email": "ananya.patel@company.com",
  "phone": "+91-9876543230",
  "avatar": null,
  "dateOfBirth": "1992-06-15",
  "gender": "Female",
  "address": "12, MG Road, Pune",
  "department": "Engineering",
  "designation": "Software Engineer",
  "jobTitle": "Backend Developer",
  "contractType": "full-time",
  "reportingTo": "EMP001",
  "joinDate": "2024-02-01",
  "exitDate": null,
  "status": "active",
  "salary": 1200000,
  "bankAccount": "XXXX-XXXX-1234",
  "panNumber": "ABCAP1234F",
  "pfNumber": "PF/021/2024",
  "esiNumber": null,
  "emergencyContact": "+91-9876500021"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | string | **Yes** | — | Unique employee identifier |
| `firstName` | string | **Yes** | — | First name |
| `lastName` | string | **Yes** | — | Last name |
| `email` | string | **Yes** | — | Unique email address |
| `phone` | string | No | `null` | Phone number |
| `department` | string | No | `null` | Department name |
| `designation` | string | No | `null` | Designation title |
| `jobTitle` | string | No | `null` | Job title |
| `contractType` | string | No | `null` | `full-time`, `part-time`, `contract`, `intern` |
| `status` | string | No | `"active"` | `active`, `inactive`, `onboarding`, `exited` |
| `salary` | float | No | `null` | Annual salary |
| `joinDate` | string | No | `null` | Date string (YYYY-MM-DD) |

**Response `201 Created`:**

```json
{
  "id": "clx1abc2d0001",
  "employeeId": "EMP021",
  "firstName": "Ananya",
  "lastName": "Patel",
  "email": "ananya.patel@company.com",
  "status": "active",
  "createdAt": "2024-02-01T10:00:00.000Z",
  "updatedAt": "2024-02-01T10:00:00.000Z"
}
```

**Response `500 Internal Server Error`:**

```json
{ "error": "Failed to create employee" }
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP021",
    "firstName": "Ananya",
    "lastName": "Patel",
    "email": "ananya.patel@company.com",
    "department": "Engineering",
    "designation": "Software Engineer",
    "status": "active",
    "salary": 1200000
  }'
```

---

### `GET /api/employees` — List Employees

Returns a paginated, filterable list of employees with their skills.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `department` | string | — | Filter by department name |
| `status` | string | — | Filter by status (`active`, `inactive`, `onboarding`, `exited`) |
| `search` | string | — | Search across `firstName`, `lastName`, `email`, `employeeId` |

**Response `200 OK`:**

```json
{
  "employees": [
    {
      "id": "clx1abc2d0001",
      "employeeId": "EMP001",
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "email": "rajesh.kumar@company.com",
      "department": "Engineering",
      "designation": "Senior Software Engineer",
      "status": "active",
      "skills": [
        {
          "id": "clx1skill001",
          "proficiency": "expert",
          "certified": true,
          "skill": { "id": "clx1s001", "name": "React", "category": "Frontend" }
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

**Example:**

```bash
# List active engineering employees, page 2
curl "http://localhost:3000/api/employees?department=Engineering&status=active&page=2&limit=10"

# Search employees by name or email
curl "http://localhost:3000/api/employees?search=rajesh"
```

---

## 2. Employees — Single Resource

### `GET /api/employees/[id]` — Get Employee by ID

Returns a single employee with all related data including attendance, leaves, payroll, performance, expenses, assets, skills, enrollments, and documents.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Employee CUID |

**Response `200 OK`:**

```json
{
  "id": "clx1abc2d0001",
  "employeeId": "EMP001",
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "email": "rajesh.kumar@company.com",
  "attendance": [ { "id": "...", "date": "2024-01-15", "status": "present" } ],
  "leaves": [ { "id": "...", "leaveType": "casual", "status": "approved" } ],
  "payroll": [ { "id": "...", "month": "January", "year": 2024, "netPay": 104045 } ],
  "performance": [ { "id": "...", "rating": 4.5, "reviewPeriod": "Q4 2023" } ],
  "expenses": [],
  "assets": [ { "id": "...", "assetName": "MacBook Pro 16\"", "status": "assigned" } ],
  "skills": [ { "proficiency": "expert", "skill": { "name": "React" } } ],
  "enrollments": [ { "status": "completed", "course": { "title": "Cloud Architecture" } } ],
  "documents": [ { "title": "Aadhaar Card", "docType": "id-proof" } ]
}
```

**Response `404 Not Found`:**

```json
{ "error": "Employee not found" }
```

**Example:**

```bash
curl http://localhost:3000/api/employees/clx1abc2d0001
```

---

### `PUT /api/employees/[id]` — Update Employee

Updates an existing employee record. Only provided fields are updated.

**Request Body (partial update supported):**

```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "department": "Engineering",
  "designation": "Principal Engineer",
  "salary": 2200000,
  "status": "active"
}
```

**Response `200 OK`:** Returns the updated employee object.

**Response `404 Not Found`:**

```json
{ "error": "Employee not found" }
```

**Response `500 Internal Server Error`:**

```json
{ "error": "Failed to update employee" }
```

**Example:**

```bash
curl -X PUT http://localhost:3000/api/employees/clx1abc2d0001 \
  -H "Content-Type: application/json" \
  -d '{"designation": "Principal Engineer", "salary": 2200000}'
```

---

### `DELETE /api/employees/[id]` — Delete Employee

Permanently deletes an employee and all related records. Generates an audit log.

**Response `200 OK`:**

```json
{ "message": "Employee deleted successfully" }
```

**Response `404 Not Found`:**

```json
{ "error": "Employee not found" }
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/employees/clx1abc2d0001
```

---

## 3. Attendance

### `POST /api/attendance` — Check-In / Create Attendance Record

Creates a new attendance record. Prevents duplicate entries for the same employee on the same date.

**Request Body:**

```json
{
  "employeeId": "clx1abc2d0001",
  "date": "2024-01-16",
  "checkIn": "09:00",
  "checkOut": null,
  "status": "present",
  "shift": "morning",
  "location": "Office - Bangalore",
  "notes": null
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | string | **Yes** | — | Employee CUID |
| `date` | string | **Yes** | — | Date string (YYYY-MM-DD) |
| `checkIn` | string | No | `null` | Check-in time (HH:mm) |
| `checkOut` | string | No | `null` | Check-out time (HH:mm) |
| `status` | string | No | `"present"` | `present`, `absent`, `late`, `half-day` |
| `shift` | string | No | `null` | `morning`, `evening`, `night` |

**Response `201 Created`:** Returns attendance record with employee info.

**Response `409 Conflict`:**

```json
{ "error": "Attendance record already exists for this employee on this date" }
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"clx1abc2d0001","date":"2024-01-16","checkIn":"09:00","status":"present"}'
```

---

### `GET /api/attendance` — List Attendance Records

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page |
| `employeeId` | string | — | Filter by employee CUID |
| `date` | string | — | Filter by specific date (YYYY-MM-DD) |
| `status` | string | — | Filter by status |
| `startDate` | string | — | Date range start (inclusive) |
| `endDate` | string | — | Date range end (inclusive) |

**Response `200 OK`:**

```json
{
  "records": [
    {
      "id": "clx1att001",
      "employeeId": "clx1abc2d0001",
      "date": "2024-01-15",
      "checkIn": "09:00",
      "checkOut": "18:30",
      "status": "present",
      "shift": "morning",
      "location": "Office - Bangalore",
      "employee": {
        "id": "clx1abc2d0001",
        "firstName": "Rajesh",
        "lastName": "Kumar",
        "employeeId": "EMP001",
        "department": "Engineering",
        "avatar": null
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
}
```

**Example:**

```bash
# Get attendance for January 2024
curl "http://localhost:3000/api/attendance?startDate=2024-01-01&endDate=2024-01-31"

# Get attendance for a specific employee
curl "http://localhost:3000/api/attendance?employeeId=clx1abc2d0001"
```

---

## 4. Leaves

### `POST /api/leaves` — Apply for Leave

**Request Body:**

```json
{
  "employeeId": "clx1abc2d0001",
  "leaveType": "casual",
  "startDate": "2024-02-10",
  "endDate": "2024-02-12",
  "days": 3,
  "reason": "Personal work"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | string | **Yes** | — | Employee CUID |
| `leaveType` | string | **Yes** | — | `casual`, `sick`, `earned`, `maternity`, `paternity` |
| `startDate` | string | **Yes** | — | Start date (YYYY-MM-DD) |
| `endDate` | string | **Yes** | — | End date (YYYY-MM-DD) |
| `days` | float | **Yes** | — | Number of leave days |
| `reason` | string | No | `null` | Reason for leave |

**Response `201 Created`:** Returns leave record with employee info. Status is always `"pending"` on creation.

---

### `GET /api/leaves` — List Leave Requests

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `employeeId` | string | — | Filter by employee |
| `status` | string | — | `pending`, `approved`, `rejected` |
| `leaveType` | string | — | `casual`, `sick`, `earned`, `maternity`, `paternity` |

**Response `200 OK`:** Paginated list of leaves with employee details.

---

### `PATCH /api/leaves` — Approve or Reject Leave

**Request Body:**

```json
{
  "id": "clx1leave001",
  "status": "approved",
  "approvedBy": "Priya Sharma",
  "comments": "Approved - sufficient leave balance"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | **Yes** | Leave record CUID |
| `status` | string | **Yes** | Must be `"approved"` or `"rejected"` |
| `approvedBy` | string | No | Approver name or ID |
| `comments` | string | No | Approval/rejection comments |

**Response `200 OK`:** Returns updated leave record.

**Response `400 Bad Request`:**

```json
{ "error": "Valid id and status (approved/rejected) are required" }
```

**Response `404 Not Found`:**

```json
{ "error": "Leave request not found" }
```

**Response `409 Conflict`:**

```json
{ "error": "Leave request has already been processed" }
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/leaves \
  -H "Content-Type: application/json" \
  -d '{"id":"clx1leave001","status":"approved","approvedBy":"Priya Sharma"}'
```

---

## 5. Payroll

### `POST /api/payroll` — Process Payroll

Automatically calculates salary components if not explicitly provided. Defaults: HRA = 40% of basic, DA = 10% of basic, PF = 12% of basic, ESI = 0.75% of gross.

**Request Body:**

```json
{
  "employeeId": "clx1abc2d0001",
  "month": "February",
  "year": 2024,
  "basicSalary": 75000,
  "bonus": 5000
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | string | **Yes** | — | Employee CUID |
| `month` | string | **Yes** | — | Month name (e.g. `"January"`) |
| `year` | integer | **Yes** | — | Year (e.g. `2024`) |
| `basicSalary` | float | No | Employee salary / 12 | Basic salary component |
| `hra` | float | No | `basicSalary * 0.4` | House Rent Allowance |
| `da` | float | No | `basicSalary * 0.1` | Dearness Allowance |
| `conveyance` | float | No | `1600` | Conveyance allowance |
| `medical` | float | No | `1250` | Medical allowance |
| `bonus` | float | No | `0` | Bonus amount |
| `pf` | float | No | `basicSalary * 0.12` | Provident Fund |
| `esi` | float | No | `grossPay * 0.0075` | Employee State Insurance |
| `tax` | float | No | `0` | Income Tax |
| `professionalTax` | float | No | `200` | Professional Tax |
| `status` | string | No | `"processed"` | `processed`, `paid`, `pending` |

**Response `201 Created`:** Returns payroll record with calculated `grossPay`, `totalDeductions`, and `netPay`.

**Response `400 Bad Request`:**

```json
{ "error": "employeeId, month, and year are required" }
```

**Response `404 Not Found`:**

```json
{ "error": "Employee not found" }
```

**Response `409 Conflict`:**

```json
{ "error": "Payroll record already exists for this employee for the given month/year" }
```

---

### `GET /api/payroll` — List Payroll Records

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `employeeId` | string | — | Filter by employee |
| `month` | string | — | Filter by month name |
| `year` | integer | — | Filter by year |
| `status` | string | — | `processed`, `paid`, `pending` |

**Example:**

```bash
curl "http://localhost:3000/api/payroll?month=January&year=2024&status=paid"
```

---

## 6. Expenses

### `POST /api/expenses` — Submit Expense Claim

**Request Body:**

```json
{
  "employeeId": "clx1abc2d0001",
  "category": "travel",
  "amount": 15000,
  "description": "Client visit to Mumbai",
  "receiptUrl": "/receipts/travel-jan-2024.pdf",
  "date": "2024-01-10"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | string | **Yes** | Employee CUID |
| `category` | string | **Yes** | `travel`, `food`, `accommodation`, `equipment`, `other` |
| `amount` | float | **Yes** | Expense amount |
| `date` | string | **Yes** | Expense date (YYYY-MM-DD) |
| `description` | string | No | Description of expense |
| `receiptUrl` | string | No | URL to receipt file |

**Response `400 Bad Request`:**

```json
{ "error": "employeeId, category, amount, and date are required" }
```

---

### `GET /api/expenses` — List Expenses

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `employeeId` | string | — | Filter by employee |
| `status` | string | — | `pending`, `approved`, `rejected`, `reimbursed` |
| `category` | string | — | `travel`, `food`, `accommodation`, `equipment`, `other` |

---

### `PATCH /api/expenses` — Approve, Reject, or Reimburse Expense

**Request Body:**

```json
{
  "id": "clx1exp001",
  "status": "approved",
  "approvedBy": "Priya Sharma",
  "comments": "Valid business expense"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | **Yes** | Expense CUID |
| `status` | string | **Yes** | `approved`, `rejected`, or `reimbursed` |
| `approvedBy` | string | No | Approver name/ID |
| `comments` | string | No | Comments |

**Status Transition Rules:**
- `rejected` expenses cannot be updated further
- `reimbursed` requires `approved` status first
- Valid flow: `pending` → `approved` → `reimbursed` or `pending` → `rejected`

**Response `409 Conflict`:**

```json
{ "error": "Expense must be approved before it can be reimbursed" }
```

---

## 7. Performance Reviews

### `POST /api/performance` — Create Performance Review

**Request Body:**

```json
{
  "employeeId": "clx1abc2d0001",
  "reviewPeriod": "Q1 2024",
  "reviewerId": "clx1abc2d0013",
  "rating": 4.5,
  "objectives": "[\"Complete microservices migration\",\"Mentor 2 junior developers\"]",
  "achievements": "Successfully migrated 3 services",
  "feedback": "Exceptional technical leadership",
  "selfReview": "Proud of the team progress this quarter",
  "goals": "Lead architecture review board",
  "attritionRisk": 0.15,
  "status": "draft"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | string | **Yes** | — | Employee CUID |
| `reviewPeriod` | string | **Yes** | — | Review period (e.g. `"Q4 2023"`) |
| `reviewerId` | string | No | `null` | Reviewer employee CUID |
| `rating` | float | No | `0` | Rating (0-5) |
| `objectives` | string | No | `null` | JSON string of OKRs |
| `attritionRisk` | float | No | `0` | Attrition risk score (0-1) |
| `status` | string | No | `"draft"` | `draft`, `in-review`, `completed` |

**Response `400 Bad Request`:**

```json
{ "error": "employeeId and reviewPeriod are required" }
```

---

### `GET /api/performance` — List Performance Reviews

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `employeeId` | string | — | Filter by employee |
| `status` | string | — | `draft`, `in-review`, `completed` |
| `reviewPeriod` | string | — | Filter by review period |

---

## 8. Job Postings

### `POST /api/jobs` — Create Job Posting

**Request Body:**

```json
{
  "title": "Senior Full Stack Developer",
  "department": "Engineering",
  "location": "Bangalore",
  "type": "full-time",
  "experience": "5-8 years",
  "salary": "18-25 LPA",
  "description": "We are looking for an experienced Full Stack Developer.",
  "requirements": "[\"React\",\"Node.js\",\"TypeScript\",\"PostgreSQL\"]",
  "skills": "[\"Full Stack\",\"System Design\"]",
  "status": "open",
  "closingDate": "2024-02-28"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | **Yes** | — | Job title |
| `department` | string | No | `null` | Department |
| `location` | string | No | `null` | Work location |
| `type` | string | No | `null` | `full-time`, `part-time`, `contract`, `remote` |
| `requirements` | string | No | `null` | JSON array of requirements |
| `skills` | string | No | `null` | JSON array of required skills |
| `status` | string | No | `"open"` | `open`, `closed`, `on-hold` |
| `postedDate` | string | No | Today | Posting date (YYYY-MM-DD) |
| `closingDate` | string | No | `null` | Closing date |

**Response `400 Bad Request`:**

```json
{ "error": "Job title is required" }
```

---

### `GET /api/jobs` — List Job Postings

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `department` | string | — | Filter by department |
| `status` | string | — | `open`, `closed`, `on-hold` |
| `type` | string | — | `full-time`, `part-time`, `contract`, `remote` |
| `search` | string | — | Search `title`, `description`, `location` |

**Response includes:** Job details + candidate summary + `_count.candidates`.

---

## 9. Candidates

### `POST /api/candidates` — Add Candidate

**Request Body:**

```json
{
  "jobId": "clx1job001",
  "name": "Aditya Sharma",
  "email": "aditya@email.com",
  "phone": "+91-9900011122",
  "currentCompany": "TechCorp",
  "experience": "6 years",
  "skills": "[\"React\",\"Node.js\",\"TypeScript\"]",
  "education": "B.Tech, IIT Delhi",
  "source": "portal",
  "aiFitScore": 87,
  "interviewDate": "2024-01-20"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `jobId` | string | **Yes** | — | Job posting CUID |
| `name` | string | **Yes** | — | Candidate name |
| `email` | string | **Yes** | — | Candidate email |
| `source` | string | No | `"portal"` | `referral`, `portal`, `linkedin`, `other` |
| `status` | string | No | `"applied"` | `applied`, `screening`, `interview`, `offered`, `hired`, `rejected` |
| `aiFitScore` | float | No | `null` | AI-calculated fitness score (0-100) |

**Response `404 Not Found`:**

```json
{ "error": "Job posting not found" }
```

---

### `GET /api/candidates` — List Candidates

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `jobId` | string | — | Filter by job posting |
| `status` | string | — | Candidate status |
| `source` | string | — | Source of application |
| `search` | string | — | Search `name`, `email`, `currentCompany` |

---

## 10. Courses & Enrollments

### `POST /api/courses` — Create Course or Enroll Employee

This endpoint handles two distinct operations based on the request body:

**Option A: Create a New Course** (when `title` is provided)

```json
{
  "title": "Advanced React Patterns",
  "description": "Master advanced React patterns",
  "category": "Engineering",
  "duration": 20,
  "provider": "Udemy",
  "url": "https://udemy.com/course/advanced-react",
  "skills": "[\"React\",\"TypeScript\"]"
}
```

**Option B: Enroll Employee in Course** (when `employeeId` + `courseId` provided, no `title`)

```json
{
  "employeeId": "clx1abc2d0001",
  "courseId": "clx1course001",
  "status": "enrolled",
  "progress": 0
}
```

**Response `400 Bad Request`:**

```json
{ "error": "Provide either (employeeId + courseId) for enrollment or title for new course" }
```

**Response `409 Conflict`:**

```json
{ "error": "Employee is already enrolled in this course" }
```

---

### `GET /api/courses` — List Courses or Employee Enrollments

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Results per page |
| `category` | string | — | Filter by course category |
| `search` | string | — | Search `title`, `description`, `provider` |
| `employeeId` | string | — | If provided, returns enrollments instead of courses |
| `enrollmentStatus` | string | — | Filter enrollments by status (requires `employeeId`) |

> **Note:** When `employeeId` is provided, the response returns `enrollments` instead of `courses`.

---

## 11. Audit Logs

### `GET /api/audit` — Query Audit Logs

Returns a comprehensive, filterable audit trail of all system actions.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Results per page |
| `action` | string | — | `create`, `read`, `update`, `delete`, `login`, `logout` |
| `module` | string | — | `hr`, `payroll`, `attendance`, `leave`, `expense`, `performance`, `recruitment`, `learning` |
| `employeeId` | string | — | Filter by employee |
| `userId` | string | — | Filter by user ID |
| `startDate` | string | — | Date range start (ISO string) |
| `endDate` | string | — | Date range end (ISO string) |

**Response `200 OK`:**

```json
{
  "logs": [
    {
      "id": "clx1audit001",
      "action": "create",
      "module": "hr",
      "details": "Created employee: Rajesh Kumar (EMP001)",
      "ipAddress": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "employee": {
        "firstName": "Rajesh",
        "lastName": "Kumar",
        "employeeId": "EMP001",
        "avatar": null
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

**Example:**

```bash
# Get all payroll audit logs from January 2024
curl "http://localhost:3000/api/audit?module=payroll&startDate=2024-01-01&endDate=2024-01-31"

# Get all create actions
curl "http://localhost:3000/api/audit?action=create"
```

---

## 12. Dashboard Statistics

### `GET /api/dashboard` — Aggregate Dashboard Statistics

Returns a comprehensive overview of all HRMS metrics in a single request. No query parameters required.

**Response `200 OK`:**

```json
{
  "overview": {
    "totalEmployees": 20,
    "activeEmployees": 17,
    "departments": 8,
    "recentHires": 3,
    "presentToday": 5,
    "absentToday": 1,
    "openJobs": 4,
    "totalCandidates": 5,
    "pendingLeaves": 2,
    "pendingExpenses": 1,
    "coursesActive": 3,
    "totalPayrollThisMonth": 515111
  },
  "charts": {
    "departmentHeadcount": [
      { "department": "Engineering", "count": 6 },
      { "department": "Human Resources", "count": 3 }
    ],
    "attendanceDistribution": [
      { "status": "present", "count": 4 },
      { "status": "late", "count": 2 },
      { "status": "absent", "count": 1 },
      { "status": "half-day", "count": 1 }
    ],
    "leaveTypeDistribution": [
      { "leaveType": "casual", "count": 3 },
      { "leaveType": "sick", "count": 1 }
    ],
    "expenseByCategory": [
      { "category": "travel", "totalAmount": 19500, "count": 2 },
      { "category": "equipment", "totalAmount": 25000, "count": 1 }
    ]
  },
  "performance": {
    "averageRating": 4.25,
    "averageAttritionRisk": 0.18,
    "totalReviews": 6
  },
  "candidatePipeline": [
    { "status": "interview", "count": 1 },
    { "status": "screening", "count": 1 },
    { "status": "offered", "count": 1 }
  ],
  "recentActivities": [
    {
      "id": "clx1audit001",
      "action": "create",
      "module": "hr",
      "details": "Created employee: Rajesh Kumar (EMP001)",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "employee": { "firstName": "Rajesh", "lastName": "Kumar", "avatar": null }
    }
  ]
}
```

**Response `500 Internal Server Error`:**

```json
{ "error": "Failed to fetch dashboard statistics" }
```

**Example:**

```bash
curl http://localhost:3000/api/dashboard
```

---

## 13. AI Chatbot

### `POST /api/ai-chat` — AI Assistant Chat

Sends a message to the AI-powered HR assistant using the `z-ai-web-dev-sdk`. The assistant is specialized in HR topics including employee management, payroll, attendance, leave policies, recruitment, performance, learning, and company policies.

**Request Body:**

```json
{
  "message": "What is the leave policy for maternity leave?",
  "conversationHistory": [
    { "role": "user", "content": "How many casual leaves am I entitled to?" },
    { "role": "assistant", "content": "You are entitled to 12 casual leaves per year..." }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | **Yes** | The user's message to the AI |
| `conversationHistory` | array | No | Previous conversation messages for context |

**Conversation History Format:**

```json
[
  { "role": "user", "content": "string" },
  { "role": "assistant", "content": "string" }
]
```

**Response `200 OK`:**

```json
{
  "message": "As per the company policy, maternity leave is granted for a period of 26 weeks (approximately 6 months) as mandated by the Maternity Benefit Act. The leave can be availed starting from 8 weeks before the expected delivery date. During this period, the employee receives full pay. Please check the HRMS Leave section for your specific balance and to apply for maternity leave.",
  "timestamp": "2024-01-16T14:30:00.000Z"
}
```

**Response `400 Bad Request`:**

```json
{ "error": "message is required" }
```

**Response `500 Internal Server Error`:**

```json
{ "error": "Failed to generate AI response" }
```

**AI System Prompt Scope:**

The AI assistant is configured to help with:
1. Employee Management — records, departments, org structure
2. Attendance & Leave — policies, balances, holiday calendars
3. Payroll — salary structures, deductions, tax calculations
4. Recruitment — job postings, candidate pipeline, interviews
5. Performance — review cycles, OKRs, feedback, attrition risk
6. Learning & Development — courses, skills, certifications
7. Company Policies — leave policies, expense policies, compliance
8. Expenses — categories, approval workflows, reimbursement

**Example:**

```bash
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the leave policy for maternity leave?"}'
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{ "error": "Description of what went wrong" }
```

### Standard HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST |
| `400` | Bad Request | Missing/invalid required fields |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate entry, invalid state transition |
| `500` | Internal Server Error | Unexpected server error |

### Common Error Scenarios

- **Missing required fields:** `400` with descriptive message listing missing fields
- **Resource not found:** `404` with entity-specific message (e.g., `"Employee not found"`)
- **Duplicate records:** `409` for attendance/payroll duplicates
- **Invalid state transitions:** `409` for already-processed leaves or invalid expense status changes
- **Database errors:** `500` with generic error message (details logged server-side)

---

## Rate Limiting

| Environment | Rate Limit | Window |
|-------------|-----------|--------|
| Development | Unlimited | — |
| Staging | 200 requests | Per minute per IP |
| Production | 100 requests | Per minute per IP |

**Rate limit headers** (production):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705382400
```

When rate limited, the API returns:

```json
{ "error": "Rate limit exceeded. Please try again later." }
```

**HTTP Status:** `429 Too Many Requests`

---

## Pagination

All list endpoints return paginated results with the following structure:

```json
{
  "records": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

The `records` key name varies by endpoint: `employees`, `records`, `leaves`, `expenses`, `reviews`, `jobs`, `candidates`, `courses`/`enrollments`, `logs`.

---

## Audit Logging

The following operations automatically generate audit log entries:

| Endpoint | Actions Logged |
|----------|---------------|
| `POST /api/employees` | Employee creation |
| `PUT /api/employees/[id]` | Employee updates |
| `DELETE /api/employees/[id]` | Employee deletion |
| `POST /api/attendance` | Attendance check-in |
| `POST /api/leaves` | Leave application |
| `PATCH /api/leaves` | Leave approval/rejection |
| `POST /api/payroll` | Payroll processing |
| `POST /api/expenses` | Expense submission |
| `PATCH /api/expenses` | Expense approval/rejection/reimbursement |
| `POST /api/performance` | Review creation |
| `POST /api/jobs` | Job posting creation |
| `POST /api/candidates` | Candidate addition |
| `POST /api/courses` | Course creation / enrollment |

Each audit log records: `action`, `module`, `details`, `employeeId`, `ipAddress`, and `createdAt`.
