# Task: Fix eh2r AI HRMS Login Page

## Summary

Completed all three tasks for the eh2r AI HRMS login page:

### TASK 1: Remove Google Login ✅
- Removed the "Or continue with" divider section (lines 239-247)
- Removed the Google OAuth sign-in button and SVG icon (lines 249-262)
- Removed the `signIn('google', ...)` call
- Kept `signIn` import since it's still used for credentials login
- All other functionality preserved (company code verification, email/password login, mobile app download)

### TASK 2: Add Job Portal Tab ✅
- Added a tab toggle at the top of the right panel switching between "Employee Login" and "Job Portal"
- Employee Login tab: Same as original login form (preserved all existing functionality)
- Job Portal tab features:
  - Fetches open positions from `/api/jobs?status=open`
  - Displays job cards with title, department, location, type, salary, skills tags
  - Expandable job details (description, requirements, closing date)
  - "Apply" button on each job card
  - Application dialog with form fields:
    - Full Name (required)
    - Email (required)
    - Phone
    - Skills (comma-separated)
    - Years of Experience
    - Current Company
    - Resume upload (.doc, .docx only)
    - Cover Letter / Additional Notes
  - "No login required" note displayed prominently
  - Custom scrollbar styling for job list
  - Dark theme with emerald color scheme matching existing design

### TASK 3: Job Portal Public Apply API Route ✅
- Created `/src/app/api/jobportal/public-apply/route.ts`
- Accepts POST with FormData (supports file upload)
- Validates required fields (jobId, name, email)
- Validates email format
- Checks job exists and is open
- Validates resume file type (only .doc, .docx)
- Saves resume to `public/uploads/resumes/` with UUID filename
- Creates or finds `JobPortalCandidate` by email:
  - New candidates get a random password hash (can set their own later)
  - Existing candidates get their info updated if new data provided
- Creates `JobApplication` linking candidate to job
- Handles duplicate application detection (409 error)
- Returns success with application ID
- Graceful error handling throughout

### Files Modified
- `/src/app/login/page.tsx` - Complete rewrite with tabs + job portal
- `/src/app/api/jobportal/public-apply/route.ts` - New file

### Files Created
- `/public/uploads/resumes/` - Directory for uploaded resumes
