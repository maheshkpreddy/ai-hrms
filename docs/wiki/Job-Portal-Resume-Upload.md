#  📄 Job Portal Resume Upload — Feature Guide

> **Feature**: Job Portal Resume Upload | **Module**: AI Job Portal | **Access**: Public (Login Page)

📖 [Back to Wiki Home](https://github.com/maheshkpreddy/ai-hrms/wiki/Home) | 🚀 [Getting Started](https://github.com/maheshkpreddy/ai-hrms/wiki/Getting-Started) | ❓ [FAQ](https://github.com/maheshkpreddy/ai-hrms/wiki/FAQ)

---

## 🎬 Training Video

📽️ **[Watch Training Video](https://github.com/maheshkpreddy/ai-hrms/releases/download/training-videos/Job-Portal-Resume-Upload.mp4)**

> Right-click the link above and select "Save link as..." to download the MP4 video, or click to stream in your browser.

---

## 📋 Feature Overview

The Job Portal Resume Upload feature allows **external candidates** to submit their resumes directly from the eh2r AI login page — **without needing an account**. This removes a major barrier in the recruitment pipeline by enabling any interested candidate to express interest and share their professional details in just a few clicks.

Instead of requiring candidates to go through a lengthy registration process, the resume upload form collects essential information and stores it in the system for the recruitment team to review. This feature significantly broadens the talent pool by making it effortless for passive and active job seekers alike to submit their profiles.

The submitted resumes flow directly into the **AI Job Portal** module, where HR administrators and recruiters can review, search, shortlist, and advance candidates through the hiring pipeline — all powered by AI-driven matching and scoring.

---

## 🔑 Key Highlights

- ✅ **No account required** — Candidates can submit resumes freely without signing up
- ✅ **Accessible from the login page** — One-click access via the "Job Portal - Upload Your Resume" button
- ✅ **Google Sign-In option** — Candidates can optionally use Google Sign-In for the job portal section to pre-fill details
- ✅ **Comprehensive form** — Collects all essential candidate information in a single submission
- ✅ **Seamless integration** — Resumes are automatically available in the AI Job Portal module for HR review

---

## 🖥️ How to Access

Candidates can access the resume upload form directly from the eh2r AI login page:

1. **Navigate** to the eh2r AI login page at [https://ai-hrms-rho.vercel.app](https://ai-hrms-rho.vercel.app)
2. **Locate** the **"Job Portal - Upload Your Resume"** button on the login page
3. **Click** the button to open the resume upload form
4. The form opens in a dedicated section — no login credentials are needed

> 💡 **Note**: The button is prominently displayed on the login page so that candidates can find it immediately without needing any guidance.

---

## 📝 Form Fields

The resume upload form collects the following information from candidates:

| # | Field | Description | Required |
|---|-------|-------------|----------|
| 1 | **Name** | Full name of the candidate | Yes |
| 2 | **Email** | Contact email address — used for all future communication | Yes |
| 3 | **Phone** | Contact phone number | Yes |
| 4 | **Skills** | Comma-separated list of skills (e.g., "React, Node.js, TypeScript, AWS") | Yes |
| 5 | **Years of Experience** | Total years of professional experience | Yes |
| 6 | **Education** | Highest educational qualification (e.g., "B.Tech in Computer Science") | Yes |
| 7 | **Previous Company** | Name of the most recent or current employer | No |
| 8 | **Previous Role** | Job title at the most recent or current employer | No |
| 9 | **Location** | Current city or region of residence | No |
| 10 | **Notice Period** | Expected notice period before joining (e.g., "30 days", "Immediate") | No |
| 11 | **Expected Salary** | Candidate's salary expectation (amount and currency) | No |

### Field Guidance

- **Skills**: Enter multiple skills separated by commas. Be as specific as possible (e.g., "Python, Django, PostgreSQL, Docker" rather than just "Backend Development").
- **Years of Experience**: Enter the total number of years as a numeric value. Internship and part-time experience can be included.
- **Education**: Include the degree and specialization for better matching (e.g., "MBA in Human Resources" instead of just "MBA").
- **Expected Salary**: Provide a realistic figure based on market standards. This helps recruiters filter candidates more efficiently.

---

## 🔐 Google Sign-In Option

The Job Portal section also supports **Google Sign-In** for candidates who prefer a faster submission experience. When a candidate signs in with Google:

- Their **name** and **email** are automatically pre-filled from their Google account
- They do not need to create a separate eh2r AI account
- The Google Sign-In is specifically for the **Job Portal section** and does not grant access to the main HRMS application

> 💡 **Tip**: Using Google Sign-In saves time and ensures that contact information is accurate and up to date. However, candidates can still submit the form manually without Google Sign-In.

---

## 📬 What Happens After Submission

Once a candidate submits the resume upload form, the following process takes place:

### 1. Data Storage
All submitted information is securely stored in the eh2r AI database. The candidate's profile is created as a resume record in the system with a timestamp and source marker indicating it came from the public job portal.

### 2. AI Processing
The AI engine processes the submitted data to:
- Extract and standardize skills from the comma-separated input
- Calculate an initial **fit score** based on open positions and skill matching
- Tag the resume with relevant categories (department, seniority level, skill clusters)

### 3. Availability in Job Portal Module
The resume immediately becomes visible to authorized HR and Admin users within the **AI Job Portal → Resumes** tab. Recruiters can:
- **Search** for candidates by skills, experience, or education
- **View** the full candidate profile with all submitted details
- **Shortlist** candidates for specific open positions
- **Schedule interviews** directly from the resume record
- **Track** the candidate through the entire hiring pipeline

### 4. Candidate Communication
Depending on the organization's workflow, candidates may receive:
- An automated acknowledgment email confirming their submission
- Follow-up communications if they are shortlisted for an interview
- Offer letter communications if selected

---

## 👁️ How HR/Admin Can View Submitted Resumes

Authorized users can access submitted resumes through the AI Job Portal module:

1. **Log in** to eh2r AI with HR Admin or Super Admin credentials
2. **Navigate** to the **AI Job Portal** module from the sidebar
3. **Click** on the **Resumes** tab
4. All candidate resumes — including those submitted from the public login page — are listed here
5. Use the **Search** functionality to filter by skills, experience, education, or location
6. Click on any resume to view the full candidate profile
7. From the profile, you can **shortlist**, **schedule an interview**, or **advance** the candidate through the pipeline

### Resume Source Identification
Resumes submitted from the public login page are tagged with a source indicator so that recruiters can distinguish them from:
- Resumes uploaded directly by HR staff
- Resumes received via email or other channels
- Resumes from AI-conducted searches

---

## ❓ Frequently Asked Questions

### Do candidates need an account to upload a resume?
**No.** The resume upload form is available directly on the login page and does not require any account creation. Candidates simply fill out the form and submit.

### Can a candidate submit multiple resumes?
Each email address can submit one resume. If a candidate needs to update their information, they can submit again with the same email and the system will update their existing record.

### Is the Google Sign-In required?
**No.** Google Sign-In is completely optional. It simply pre-fills the name and email fields for convenience. Candidates can fill out the form manually.

### Can candidates track their application status?
Currently, candidates receive communication from the HR team. A self-service candidate portal for status tracking is planned for a future release.

### How secure is the candidate data?
All candidate data is stored securely in the eh2r AI database with proper encryption and access controls. Only authorized HR and Admin personnel can view submitted resumes.

---

## 💡 Tips & Best Practices

### For Candidates
1. **Be specific with skills** — Use exact technology names (e.g., "React.js" instead of "Frontend") for better AI matching.
2. **Include all relevant experience** — Even short-term or internship experience helps recruiters find you.
3. **Keep your email and phone accurate** — These are the primary channels for recruiter contact.
4. **Mention your notice period** — This helps recruiters assess your availability and plan timelines.
5. **Use Google Sign-In** — It saves time and ensures your contact details are correct.

### For HR / Admins
1. **Check the Resumes tab regularly** — New submissions appear in real time and should be reviewed promptly to avoid losing top candidates.
2. **Use AI-powered search** — The AI Job Portal's search and fit scoring can help you quickly identify the best-matching candidates.
3. **Respond to candidates quickly** — Timely communication improves the candidate experience and your employer brand.
4. **Periodically export resume data** — Keep a backup of candidate data for compliance and reporting purposes.
5. **Update job postings** — Ensure your open positions are well-defined so the AI can accurately match candidates to roles.

---

## 📸 Screenshots

*Screenshots will be added here to provide visual guidance for the resume upload feature.*

| Feature | Screenshot |
|---------|-----------|
| Login Page - Resume Upload Button | *[Placeholder: Login page showing the "Job Portal - Upload Your Resume" button]* |
| Resume Upload Form | *[Placeholder: Full form with all fields visible]* |
| Google Sign-In Option | *[Placeholder: Google Sign-In button on the job portal section]* |
| Successful Submission | *[Placeholder: Confirmation message after form submission]* |
| HR View - Resumes Tab | *[Placeholder: AI Job Portal Resumes tab showing submitted candidate profiles]* |

---

## 🔗 Related Modules

[AI Job Portal](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-17-jobportal-AI-Job-Portal) | [Employee Management](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-02-employees-Employee-Management) | [AI Talent Acquisition](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-09-talent-AI-Talent-Acquisition) | [Company Masters](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-21-masters-Company-Masters) | [Dashboard](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-01-dashboard-Dashboard)

---

## 📚 Additional Resources

- [Getting Started Guide](https://github.com/maheshkpreddy/ai-hrms/wiki/Getting-Started)
- [FAQ](https://github.com/maheshkpreddy/ai-hrms/wiki/FAQ)
- [AI Job Portal Training](https://github.com/maheshkpreddy/ai-hrms/wiki/Training-17-jobportal-AI-Job-Portal)
- [Role Training Pages](https://github.com/maheshkpreddy/ai-hrms/wiki/Home#role-training-7-roles)
- [All Training Videos](https://github.com/maheshkpreddy/ai-hrms/wiki/Home#all-training-videos)

---

*eh2r AI — An AI Product of MARQ AI*
