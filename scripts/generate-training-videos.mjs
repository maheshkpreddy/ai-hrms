#!/usr/bin/env node
/**
 * Training Video Generator for eh2r AI HRMS
 * 
 * Uses Playwright to navigate the live application, record screen,
 * and combine with TTS voice-over narration.
 * 
 * Usage: node scripts/generate-training-videos.mjs [--module dashboard] [--role admin] [--all]
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'download', 'training-videos');
const TEMP_DIR = join(ROOT, 'download', 'training-videos', '.temp');

// ─── Configuration ──────────────────────────────────────────────────────────

const APP_URL = 'https://ai-hrms-rho.vercel.app';
const COMPANY_CODE = 'ACME';

// Role credentials
const ROLE_CREDENTIALS = {
  'super-admin': { email: 'admin@company.com', password: 'Admin@2024', label: 'Super Admin' },
  'hr-admin': { email: 'priya.sharma@company.com', password: 'HRAdmin@2024', label: 'HR Admin' },
  'payroll-specialist': { email: 'amit.patel@company.com', password: 'Payroll@2024', label: 'Payroll Specialist' },
  'manager': { email: 'rajesh.kumar@company.com', password: 'Manager@2024', label: 'Department Manager' },
  'employee': { email: 'sneha.reddy@company.com', password: 'Employee@2024', label: 'Employee' },
  'recruiter': { email: 'fatima.khan@company.com', password: 'Recruiter@2024', label: 'Recruiter' },
  'ld-manager': { email: 'meera.iyer@company.com', password: 'LDManager@2024', label: 'L&D Manager' },
};

// Module definitions with narration
const MODULES = [
  {
    key: 'dashboard', label: 'Dashboard', navLabel: 'Dashboard', role: 'super-admin',
    narration: [
      { action: 'overview', text: "Welcome to the eh2r AI Dashboard module. This is your central command center for all HR operations. The dashboard provides a comprehensive overview of your organization's key metrics." },
      { action: 'click-subitem', subItem: 'overview', text: "The Overview section displays real-time KPIs including total headcount, active employees, new hires this month, and attrition rate. You can quickly see trends and identify areas that need attention." },
      { action: 'click-subitem', subItem: 'quick-actions', text: "Quick Actions lets you perform common tasks instantly. You can add a new employee, process payroll, approve leave requests, or run reports with just one click from this convenient panel." },
      { action: 'click-subitem', subItem: 'recent-activity', text: "Recent Activity shows the latest changes across all modules. This includes new hires, leave approvals, payroll runs, and performance reviews. Stay updated on everything happening in your organization." },
    ]
  },
  {
    key: 'employees', label: 'Employee Management', navLabel: 'Employees', role: 'hr-admin',
    narration: [
      { action: 'overview', text: "The Employee Management module is your one-stop solution for managing your workforce. From here, you can view, add, edit, and manage all employee records in your organization." },
      { action: 'click-subitem', subItem: 'employee-list', text: "The Employee Directory provides a searchable, filterable list of all employees. You can search by name, department, or designation. Click on any employee card to view their complete profile." },
      { action: 'click-subitem', subItem: 'add-employee', text: "Adding a new employee is simple. Click on the Add Employee sub-item, fill in the required details including personal information and employment details. The system will automatically generate an employee ID." },
      { action: 'click-subitem', subItem: 'departments', text: "The Departments section lets you manage your organizational structure. You can create new departments, assign department heads, and view employee counts per department." },
    ]
  },
  {
    key: 'company', label: 'Company Management', navLabel: 'Company', role: 'super-admin',
    narration: [
      { action: 'overview', text: "The Company Management module helps you configure and manage your organization's core information. This includes company details, branch offices, and organizational policies." },
      { action: 'click-subitem', subItem: 'company-info', text: "Company Info displays your organization's basic details including company name, registration number, address, and contact information." },
      { action: 'click-subitem', subItem: 'branches', text: "The Branches section allows you to manage multiple office locations. You can add new branches with their addresses and contact details." },
      { action: 'click-subitem', subItem: 'policies', text: "The Policies section is where you define organizational policies such as leave policy, attendance rules, and code of conduct." },
    ]
  },
  {
    key: 'assets', label: 'Asset Management', navLabel: 'Asset Management', role: 'super-admin',
    narration: [
      { action: 'overview', text: "The Asset Management module helps you track and manage all company assets including laptops, phones, and other equipment." },
      { action: 'click-subitem', subItem: 'asset-list', text: "The Asset Inventory shows all company assets in a searchable list. Each asset has details like type, serial number, purchase date, and current assignee." },
      { action: 'click-subitem', subItem: 'assign-asset', text: "Assign Assets lets you allocate equipment to employees. Select an available asset, choose the employee, and set the assignment date." },
      { action: 'click-subitem', subItem: 'asset-requests', text: "The Requests section shows asset requests from employees. You can approve or reject these requests directly from this view." },
    ]
  },
  {
    key: 'documents', label: 'Document Management', navLabel: 'Document Management', role: 'hr-admin',
    narration: [
      { action: 'overview', text: "The Document Management module provides a centralized repository for all company documents with version control and access permissions." },
      { action: 'click-subitem', subItem: 'doc-list', text: "All Documents shows your complete document library. Browse through folders, search by name or type, and filter by category." },
      { action: 'click-subitem', subItem: 'upload-doc', text: "Upload Document allows you to add new files to the repository. Simply drag and drop or browse to select files." },
      { action: 'click-subitem', subItem: 'templates', text: "Templates are pre-built document templates for common HR documents like offer letters and appraisal forms." },
    ]
  },
  {
    key: 'tasks', label: 'Task Management', navLabel: 'Task Management', role: 'manager',
    narration: [
      { action: 'overview', text: "The Task Management module helps you create, assign, and track tasks across your teams." },
      { action: 'click-subitem', subItem: 'my-tasks', text: "My Tasks shows all tasks assigned to you. You can see task priority, due date, and status at a glance." },
      { action: 'click-subitem', subItem: 'team-tasks', text: "Team Tasks gives you visibility into all tasks across your team. Filter by team member, status, or priority." },
      { action: 'click-subitem', subItem: 'task-reports', text: "The Reports section provides analytics on task completion rates and team productivity." },
    ]
  },
  {
    key: 'meetings', label: 'Meeting Management', navLabel: 'Meetings', role: 'manager',
    narration: [
      { action: 'overview', text: "The Meeting Management module helps you schedule, organize, and track meetings." },
      { action: 'click-subitem', subItem: 'upcoming', text: "Upcoming Meetings shows all your scheduled meetings with title, date, time, and attendees." },
      { action: 'click-subitem', subItem: 'schedule', text: "Schedule Meeting lets you create a new meeting with title, date, time, and attendee list." },
      { action: 'click-subitem', subItem: 'past-meetings', text: "Past Meetings is your archive of completed meetings with notes and action items." },
    ]
  },
  {
    key: 'rbac', label: 'RBAC & Security', navLabel: 'RBAC & Security', role: 'super-admin',
    narration: [
      { action: 'overview', text: "The RBAC and Security module is the backbone of your system's access control." },
      { action: 'click-subitem', subItem: 'roles', text: "Role Master lets you create and manage user roles. Each role defines what modules and actions a user can access." },
      { action: 'click-subitem', subItem: 'permissions', text: "The Permissions section provides granular control over what each role can do. You can set read, write, modify, and admin permissions for each module." },
      { action: 'click-subitem', subItem: 'audit-logs', text: "Audit Logs track every action in the system. You can see who did what and when for security compliance." },
    ]
  },
  {
    key: 'talent', label: 'AI Talent Acquisition', navLabel: 'Talent Acquisition', role: 'recruiter',
    narration: [
      { action: 'overview', text: "The AI Talent Acquisition module is an AI-powered recruitment solution. It streamlines the entire hiring process from posting jobs to onboarding new hires." },
      { action: 'click-subitem', subItem: 'job-postings', text: "Job Postings lets you create and manage open positions. The AI automatically suggests optimal job descriptions based on industry standards." },
      { action: 'click-subitem', subItem: 'candidate-pool', text: "The Candidate Pool shows all applicants across your open positions. The AI automatically screens resumes and ranks candidates based on job fit." },
      { action: 'click-subitem', subItem: 'interviews', text: "Interview Schedule helps you organize the interview process. The AI can generate interview questions tailored to each role." },
      { action: 'click-subitem', subItem: 'offers', text: "Offer Letters allows you to generate and send offer letters to selected candidates using pre-built templates." },
      { action: 'click-subitem', subItem: 'onboarding', text: "AI Onboarding automates the new hire onboarding process from document collection to system access setup." },
    ]
  },
  {
    key: 'attendance', label: 'Time & Attendance', navLabel: 'Time & Attendance', role: 'hr-admin',
    narration: [
      { action: 'overview', text: "The Time and Attendance module helps you track employee work hours, manage shifts, and maintain attendance records." },
      { action: 'click-subitem', subItem: 'mark-attendance', text: "Mark Attendance allows you to record daily attendance. Employees can check in and check out through the self-service portal." },
      { action: 'click-subitem', subItem: 'shifts', text: "The Shifts section lets you define work shifts including start time, end time, and grace period." },
      { action: 'click-subitem', subItem: 'holidays', text: "Holidays lets you manage the company holiday calendar including national and company-specific holidays." },
      { action: 'click-subitem', subItem: 'export', text: "Export Reports lets you generate and download attendance reports in various formats for payroll processing." },
    ]
  },
  {
    key: 'payroll', label: 'Payroll & Expenses', navLabel: 'Payroll & Expenses', role: 'payroll-specialist',
    narration: [
      { action: 'overview', text: "The Payroll and Expenses module automates salary processing and expense management." },
      { action: 'click-subitem', subItem: 'process-payroll', text: "Process Payroll is the core function. Select the payroll period, review salary calculations, and approve payments." },
      { action: 'click-subitem', subItem: 'expenses', text: "The Expenses section manages employee expense claims. Review and approve or reject submitted expenses." },
      { action: 'click-subitem', subItem: 'reports', text: "Reports provides detailed payroll analytics including salary breakdowns and tax summaries." },
    ]
  },
  {
    key: 'performance', label: 'Performance Management', navLabel: 'Performance', role: 'hr-admin',
    narration: [
      { action: 'overview', text: "The Performance module is an AI-powered performance management system for comprehensive employee evaluation." },
      { action: 'click-subitem', subItem: 'reviews', text: "Performance Reviews lets you create and manage review cycles. The AI analyzes employee data to suggest performance ratings." },
      { action: 'click-subitem', subItem: 'goals', text: "Goals and OKRs allows you to set and track organizational and individual objectives." },
      { action: 'click-subitem', subItem: 'feedback', text: "360 Feedback enables multi-rater evaluations. The AI analyzes feedback patterns and highlights strengths and improvement areas." },
    ]
  },
  {
    key: 'learning', label: 'Learning & Development', navLabel: 'Learning & Development', role: 'ld-manager',
    narration: [
      { action: 'overview', text: "The Learning and Development module is an AI-powered training platform to build a skilled workforce." },
      { action: 'click-subitem', subItem: 'courses', text: "Courses lets you create and manage training content. The AI can suggest learning paths based on employee roles." },
      { action: 'click-subitem', subItem: 'enrollments', text: "Enrollments tracks course participation. See who is enrolled, track completion rates, and send reminders." },
      { action: 'click-subitem', subItem: 'certifications', text: "Certifications manages employee credentials and qualifications. Track expiry dates and set renewal reminders." },
    ]
  },
  {
    key: 'projects', label: 'Project Kanban', navLabel: 'Project Kanban', role: 'manager',
    narration: [
      { action: 'overview', text: "The Project Kanban module provides visual project management with Kanban boards and timeline views." },
      { action: 'click-subitem', subItem: 'kanban-board', text: "The Kanban Board gives you a visual overview of all project tasks with drag-and-drop management." },
      { action: 'click-subitem', subItem: 'project-list', text: "Projects shows all your active and completed projects with team and timeline information." },
      { action: 'click-subitem', subItem: 'timelines', text: "Timelines provides a Gantt-style view of project schedules with task dependencies and milestones." },
    ]
  },
  {
    key: 'clients', label: 'Client Portal', navLabel: 'Client Portal', role: 'super-admin',
    narration: [
      { action: 'overview', text: "The Client Portal module manages your client relationships, support tickets, and service requests." },
      { action: 'click-subitem', subItem: 'client-list', text: "Clients shows all your business clients with company details and contact persons." },
      { action: 'click-subitem', subItem: 'tickets', text: "Tickets manages client support requests. Track status, priority, and assigned handler." },
      { action: 'click-subitem', subItem: 'service-requests', text: "Service Requests handles new service demands from clients from request to delivery." },
    ]
  },
  {
    key: 'subvendors', label: 'Sub Vendor Management', navLabel: 'Sub Vendors', role: 'super-admin',
    narration: [
      { action: 'overview', text: "The Sub Vendor Management module handles vendor relationships for staffing and consulting." },
      { action: 'click-subitem', subItem: 'vendor-list', text: "Vendors displays all your registered vendors with contract terms and performance metrics." },
      { action: 'click-subitem', subItem: 'resume-uploads', text: "Resume Uploads is where vendors submit candidate resumes for review and screening." },
      { action: 'click-subitem', subItem: 'vendor-assignments', text: "Assignments tracks vendor resource deployments with billing rates and contract duration." },
    ]
  },
  {
    key: 'jobportal', label: 'AI Job Portal', navLabel: 'Job Portal', role: 'recruiter',
    narration: [
      { action: 'overview', text: "The AI Job Portal is a comprehensive recruitment platform covering the entire hiring pipeline." },
      { action: 'click-subitem', subItem: 'candidate-resumes', text: "Resumes is your candidate database. The AI automatically parses resume content and creates searchable profiles." },
      { action: 'click-subitem', subItem: 'search-candidates', text: "Search uses AI-powered matching to find the best candidates for your open positions." },
      { action: 'click-subitem', subItem: 'shortlisted', text: "Shortlisted shows candidates who have passed initial screening." },
      { action: 'click-subitem', subItem: 'interview-process', text: "Interviews manages the complete interview process with scheduling and feedback collection." },
      { action: 'click-subitem', subItem: 'offer-generation', text: "Offer Letters generates professional offer letters automatically." },
      { action: 'click-subitem', subItem: 'background-check', text: "Background Check manages the verification process for identity, education, and employment history." },
    ]
  },
  {
    key: 'analytics', label: 'Analytics & Reporting', navLabel: 'Analytics & Reporting', role: 'super-admin',
    narration: [
      { action: 'overview', text: "The Analytics and Reporting module is an AI-powered business intelligence tool for HR data." },
      { action: 'click-subitem', subItem: 'hr-analytics', text: "HR Analytics provides AI-driven insights into workforce trends including attrition analysis and hiring funnel." },
      { action: 'click-subitem', subItem: 'custom-reports', text: "Custom Reports lets you build tailored reports with selected data fields and visualization types." },
      { action: 'click-subitem', subItem: 'export-data', text: "Export Data allows you to download reports in multiple formats including Excel, CSV, and PDF." },
    ]
  },
  {
    key: 'selfservice', label: 'Employee Self-Service', navLabel: 'Self-Service', role: 'employee',
    narration: [
      { action: 'overview', text: "The Employee Self-Service module empowers employees to manage their own HR tasks." },
      { action: 'click-subitem', subItem: 'my-profile', text: "My Profile shows your personal and employment information. Update contact details and view organizational details." },
      { action: 'click-subitem', subItem: 'my-leaves', text: "My Leaves lets you view your leave balance, apply for new leaves, and track request status." },
      { action: 'click-subitem', subItem: 'my-payslips', text: "My Payslips provides access to your salary slips with detailed breakdowns of earnings and deductions." },
      { action: 'click-subitem', subItem: 'raise-request', text: "Raise Request allows you to submit various requests like IT support or document requests." },
    ]
  },
  {
    key: 'profile', label: 'My Profile', navLabel: 'My Profile', role: 'employee',
    narration: [
      { action: 'overview', text: "The My Profile module provides a detailed view of your personal and professional information." },
      { action: 'click-subitem', subItem: 'personal-info', text: "Personal Info displays your personal details including name, date of birth, and contact information." },
      { action: 'click-subitem', subItem: 'employment', text: "Employment shows your professional details like designation, department, and reporting manager." },
      { action: 'click-subitem', subItem: 'documents-tab', text: "Documents is where you can view and manage your employment documents like offer letters and appraisals." },
    ]
  },
];

// Role-wise training scripts
const ROLE_TRAINING = [
  {
    key: 'super-admin', label: 'Super Admin', credentialKey: 'super-admin',
    narration: [
      { text: "Welcome to the Super Admin training for eh2r AI. As a Super Admin, you have complete access to all modules in the system." },
      { text: "From the Dashboard, you can monitor the entire organization's health metrics including headcount, attrition, and payroll summaries." },
      { text: "In Employee Management, you can add, edit, and manage all employee records. You also have access to department configuration." },
      { text: "The Company module lets you configure core organization details, manage branch offices, and define company policies." },
      { text: "RBAC and Security is critical for your role. Here you manage user roles and permissions, ensuring each user has appropriate access levels." },
      { text: "The Analytics module gives you AI-powered insights into workforce trends. Generate custom reports and make data-driven decisions." },
      { text: "Remember, as Super Admin, you have the power to configure the entire system. Always review changes carefully and use audit logs to monitor activity." },
    ],
    modules: ['dashboard', 'employees', 'company', 'assets', 'documents', 'rbac'],
  },
  {
    key: 'hr-admin', label: 'HR Admin', credentialKey: 'hr-admin',
    narration: [
      { text: "Welcome to the HR Admin training for eh2r AI. As an HR Admin, you manage the core HR functions of the organization." },
      { text: "Your Dashboard provides HR-specific KPIs including pending approvals, upcoming reviews, and employee milestones." },
      { text: "Employee Management is your primary module. Manage the employee directory, process new hires, and organize departments." },
      { text: "In Talent Acquisition, manage the recruitment pipeline with AI-powered screening and interview scheduling." },
      { text: "Time and Attendance lets you track employee work hours, manage shifts, and handle holiday calendars." },
      { text: "The Performance module helps you manage review cycles, track goals, and coordinate 360-degree feedback with AI insights." },
      { text: "Learning and Development lets you create training courses, manage enrollments, and track certifications." },
    ],
    modules: ['dashboard', 'employees', 'talent', 'attendance', 'performance', 'learning'],
  },
  {
    key: 'manager', label: 'Department Manager', credentialKey: 'manager',
    narration: [
      { text: "Welcome to the Department Manager training for eh2r AI. As a manager, you oversee your team's operations and performance." },
      { text: "Your Dashboard shows team-specific metrics including attendance rates, task completion, and upcoming reviews." },
      { text: "In Employee Management, you can view your team members and their details." },
      { text: "Time and Attendance shows your team's attendance records. Monitor check-in and check-out times." },
      { text: "The Performance module is essential for your role. Conduct team reviews, set goals, and provide feedback." },
      { text: "Use Self-Service to manage your own leaves, view payslips, and raise requests." },
    ],
    modules: ['dashboard', 'employees', 'attendance', 'performance', 'selfservice'],
  },
  {
    key: 'employee', label: 'Employee', credentialKey: 'employee',
    narration: [
      { text: "Welcome to the Employee training for eh2r AI. The system helps you manage your day-to-day HR tasks easily." },
      { text: "Your Dashboard shows your personal summary including pending tasks, leave balance, and recent announcements." },
      { text: "Time and Attendance lets you check in when you start work and check out when you leave." },
      { text: "The Self-Service module is your main hub. View your profile, apply for leaves, download payslips, and raise requests." },
      { text: "In My Profile, you can view and update your personal information and access important documents." },
      { text: "To apply for leave, go to Self-Service, then My Leaves. Select the leave type and dates. Your manager will approve it." },
    ],
    modules: ['dashboard', 'attendance', 'selfservice'],
  },
  {
    key: 'payroll-specialist', label: 'Payroll Specialist', credentialKey: 'payroll-specialist',
    narration: [
      { text: "Welcome to the Payroll Specialist training for eh2r AI. Your primary responsibility is processing payroll and managing expenses." },
      { text: "Your Dashboard provides payroll-specific metrics including payroll status and expense summaries." },
      { text: "The Payroll and Expenses module is your main workspace. Process monthly payroll and review salary calculations." },
      { text: "In the Expenses section, review and process employee expense claims." },
      { text: "Reports provide detailed payroll analytics including tax summaries and deduction breakdowns." },
      { text: "Use Self-Service to manage your own HR tasks like leaves and profile updates." },
    ],
    modules: ['dashboard', 'payroll', 'selfservice'],
  },
  {
    key: 'recruiter', label: 'Recruiter', credentialKey: 'recruiter',
    narration: [
      { text: "Welcome to the Recruiter training for eh2r AI. Your role focuses on talent acquisition using AI-powered recruitment tools." },
      { text: "Your Dashboard shows recruitment KPIs including open positions, pipeline candidates, and upcoming interviews." },
      { text: "Talent Acquisition is your primary module. Post new jobs, screen candidates using AI, and manage the offer process." },
      { text: "Create compelling job postings with the AI writing assistant. The system suggests job descriptions and salary ranges." },
      { text: "Use the candidate pool to review and shortlist applicants. The AI ranks candidates by job fit." },
      { text: "Self-Service is available for your personal HR tasks like leave management and payslip access." },
    ],
    modules: ['dashboard', 'talent', 'selfservice'],
  },
  {
    key: 'ld-manager', label: 'L&D Manager', credentialKey: 'ld-manager',
    narration: [
      { text: "Welcome to the L&D Manager training for eh2r AI. You are responsible for employee learning and development programs." },
      { text: "Your Dashboard shows training metrics including course completion rates and enrollment numbers." },
      { text: "Learning and Development is your primary module. Create courses, enroll employees, and track certifications." },
      { text: "The Performance module helps you align training with performance goals. Identify skill gaps and assign targeted training." },
      { text: "Use the AI features to automatically suggest courses based on employee roles and identified skill gaps." },
      { text: "Self-Service is available for your own HR needs including leave management and profile updates." },
    ],
    modules: ['dashboard', 'learning', 'performance', 'selfservice'],
  },
];

// ─── Utility Functions ──────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function generateTTS(text, outputPath) {
  try {
    // Use gTTS via Python
    const safeText = text.replace(/'/g, "\\'").replace(/"/g, '\\"');
    execSync(`python3 -c "
from gtts import gTTS
tts = gTTS(text='${safeText}', lang='en', slow=False)
tts.save('${outputPath}')
"`, { stdio: 'pipe', timeout: 30000 });
    return existsSync(outputPath);
  } catch (e) {
    console.error(`  TTS failed: ${e.message.slice(0, 100)}`);
    return false;
  }
}

function concatAudioFiles(audioFiles, outputPath) {
  const listFile = join(TEMP_DIR, `audio_concat_${Date.now()}.txt`);
  const content = audioFiles.filter(f => existsSync(f)).map(f => `file '${f}'`).join('\n');
  writeFileSync(listFile, content);
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c:a aac -b:a 128k "${outputPath}" 2>/dev/null`, { stdio: 'pipe' });
  return existsSync(outputPath);
}

function combineVideoAudio(videoPath, audioPath, outputPath) {
  // Check if video is webm - needs transcoding for mp4
  const ext = videoPath.split('.').pop().toLowerCase();
  if (ext === 'webm') {
    execSync(`ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -pix_fmt yuv420p "${outputPath}" 2>/dev/null`, { stdio: 'pipe' });
  } else {
    execSync(`ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -b:a 128k -shortest "${outputPath}" 2>/dev/null`, { stdio: 'pipe' });
  }
  return existsSync(outputPath);
}

function getAudioDuration(path) {
  try {
    return parseFloat(execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${path}"`, { encoding: 'utf8' }).trim());
  } catch { return 10; }
}

// ─── Login Helper ───────────────────────────────────────────────────────────

async function loginToApp(page, credentialKey) {
  const creds = ROLE_CREDENTIALS[credentialKey];
  console.log(`  Logging in as ${creds.label} (${creds.email})...`);
  
  await page.goto(APP_URL + '/login', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  // Fill company code
  const companyInput = page.locator('input[placeholder="Enter your company code"]');
  if (await companyInput.isVisible()) {
    await companyInput.clear();
    await companyInput.fill(COMPANY_CODE);
    await page.waitForTimeout(500);
  }
  
  // Fill email
  const emailInput = page.locator('input[placeholder="your.email@company.com"]');
  await emailInput.fill(creds.email);
  
  // Fill password
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill(creds.password);
  
  // Click sign in (use the submit button in the form specifically)
  const signInBtn = page.locator('form button[type="submit"]').first();
  await signInBtn.click();
  
  // Wait for navigation
  try {
    await page.waitForURL('**/', { timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log(`  Login successful!`);
    return true;
  } catch {
    console.error(`  Login failed - timeout waiting for redirect`);
    return false;
  }
}

// ─── Navigate to module ─────────────────────────────────────────────────────

async function navigateToModule(page, moduleKey) {
  const module = MODULES.find(m => m.key === moduleKey);
  const navLabel = module?.navLabel || moduleKey;
  
  // Try sidebar first
  const sidebarBtn = page.locator(`nav >> text="${navLabel}"`).first();
  if (await sidebarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sidebarBtn.click();
    await page.waitForTimeout(1500);
    return true;
  }
  
  // Try module home card
  const homeCard = page.locator(`.cursor-pointer:has-text("${module?.label || navLabel}")`).first();
  if (await homeCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await homeCard.click();
    await page.waitForTimeout(1500);
    return true;
  }
  
  // Click Home button first, then try module card
  const homeBtn = page.locator('button:has-text("Home")').first();
  if (await homeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await homeBtn.click();
    await page.waitForTimeout(1000);
    
    const card = page.locator(`.cursor-pointer:has-text("${module?.label || navLabel}")`).first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1500);
      return true;
    }
  }
  
  return false;
}

async function clickSubItem(page, moduleKey, subItemKey) {
  // Expand module in sidebar
  const module = MODULES.find(m => m.key === moduleKey);
  const navLabel = module?.navLabel || moduleKey;
  
  const sidebarBtn = page.locator(`nav >> text="${navLabel}"`).first();
  if (await sidebarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await sidebarBtn.click();
    await page.waitForTimeout(500);
  }
  
  // Find sub-item by label
  const subItem = MODULES.find(m => m.key === moduleKey)?.narration?.find(n => n.subItem === subItemKey);
  if (!subItem) return false;
  
  // Get the actual label from the Sidebar config
  const subItemLabels = {
    'overview': 'Overview', 'quick-actions': 'Quick Actions', 'recent-activity': 'Recent Activity',
    'employee-list': 'Employee Directory', 'add-employee': 'Add Employee', 'departments': 'Departments',
    'company-info': 'Company Info', 'branches': 'Branches', 'policies': 'Policies',
    'asset-list': 'Asset Inventory', 'assign-asset': 'Assign Assets', 'asset-requests': 'Requests',
    'doc-list': 'All Documents', 'upload-doc': 'Upload Document', 'templates': 'Templates',
    'my-tasks': 'My Tasks', 'team-tasks': 'Team Tasks', 'task-reports': 'Reports',
    'upcoming': 'Upcoming Meetings', 'schedule': 'Schedule Meeting', 'past-meetings': 'Past Meetings',
    'roles': 'Role Master', 'permissions': 'Permissions', 'audit-logs': 'Audit Logs',
    'job-postings': 'Job Postings', 'candidate-pool': 'Candidate Pool', 'interviews': 'Interview Schedule',
    'offers': 'Offer Letters', 'onboarding': 'AI Onboarding',
    'mark-attendance': 'Mark Attendance', 'shifts': 'Shifts', 'holidays': 'Holidays', 'export': 'Export Reports',
    'process-payroll': 'Process Payroll', 'expenses': 'Expenses', 'reports': 'Reports',
    'reviews': 'Performance Reviews', 'goals': 'Goals & OKRs', 'feedback': '360 Feedback',
    'courses': 'Courses', 'enrollments': 'Enrollments', 'certifications': 'Certifications',
    'kanban-board': 'Kanban Board', 'project-list': 'Projects', 'timelines': 'Timelines',
    'client-list': 'Clients', 'tickets': 'Tickets', 'service-requests': 'Service Requests',
    'vendor-list': 'Vendors', 'resume-uploads': 'Resume Uploads', 'vendor-assignments': 'Assignments',
    'candidate-resumes': 'Resumes', 'search-candidates': 'Search', 'shortlisted': 'Shortlisted',
    'interview-process': 'Interviews', 'offer-generation': 'Offer Letters', 'background-check': 'Background Check',
    'hr-analytics': 'HR Analytics', 'custom-reports': 'Custom Reports', 'export-data': 'Export Data',
    'my-profile': 'My Profile', 'my-leaves': 'My Leaves', 'my-payslips': 'My Payslips', 'raise-request': 'Raise Request',
    'personal-info': 'Personal Info', 'employment': 'Employment', 'documents-tab': 'Documents',
  };
  
  const label = subItemLabels[subItemKey] || subItemKey;
  const subBtn = page.locator(`nav >> text="${label}"`).first();
  if (await subBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await subBtn.click();
    await page.waitForTimeout(1500);
    return true;
  }
  
  return false;
}

// ─── Generate Module Video ──────────────────────────────────────────────────

async function generateModuleVideo(browser, module, index) {
  const { key, label, role, narration } = module;
  const paddedIndex = String(index + 1).padStart(2, '0');
  const fileName = `${paddedIndex}-${key}-${label.replace(/\s+/g, '-')}`;
  const outputPath = join(OUTPUT_DIR, 'module-wise', `${fileName}.mp4`);
  
  console.log(`\n📹 Generating Module Video: ${label}`);
  
  ensureDir(join(OUTPUT_DIR, 'module-wise'));
  ensureDir(TEMP_DIR);
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: join(TEMP_DIR, 'recordings'), size: { width: 1280, height: 720 } },
  });
  
  const page = await context.newPage();
  
  try {
    const loggedIn = await loginToApp(page, role);
    if (!loggedIn) {
      console.error(`  Skipping ${label} - login failed`);
      await context.close();
      return;
    }
    
    const audioFiles = [];
    
    for (let i = 0; i < narration.length; i++) {
      const step = narration[i];
      const stepDir = join(TEMP_DIR, `mod_${key}_step_${i}`);
      ensureDir(stepDir);
      
      // Generate TTS
      const audioPath = join(stepDir, `narration_${i}.mp3`);
      console.log(`  Narration ${i + 1}/${narration.length}: "${step.text.slice(0, 50)}..."`);
      generateTTS(step.text, audioPath);
      
      if (existsSync(audioPath)) {
        audioFiles.push(audioPath);
      }
      
      // Navigate
      if (step.action === 'overview') {
        await navigateToModule(page, key);
      } else if (step.action === 'click-subitem') {
        await clickSubItem(page, key, step.subItem);
      }
      
      // Wait for narration duration
      const duration = existsSync(audioPath) ? getAudioDuration(audioPath) : 10;
      const waitMs = Math.max(duration * 1000, 5000);
      
      // Subtle interactions for dynamic video
      await page.evaluate(() => window.scrollBy(0, 100));
      await page.waitForTimeout(Math.min(waitMs * 0.3, 3000));
      await page.evaluate(() => window.scrollBy(0, -50));
      await page.waitForTimeout(Math.min(waitMs * 0.3, 3000));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(Math.min(waitMs * 0.4, 3000));
    }
    
    // Get recorded video
    const videoPath = await page.video()?.path();
    
    // Combine audio
    const combinedAudioPath = join(TEMP_DIR, `${key}_audio.m4a`);
    if (audioFiles.length > 0) {
      concatAudioFiles(audioFiles, combinedAudioPath);
    }
    
    // Final video
    if (videoPath && existsSync(videoPath) && existsSync(combinedAudioPath)) {
      combineVideoAudio(videoPath, combinedAudioPath, outputPath);
      console.log(`  ✅ Module video saved: ${outputPath}`);
    } else if (videoPath && existsSync(videoPath)) {
      execSync(`cp "${videoPath}" "${outputPath}"`, { stdio: 'pipe' });
      console.log(`  ⚠️ Video saved without audio: ${outputPath}`);
    } else {
      console.error(`  ❌ No video recorded for ${label}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message.slice(0, 200)}`);
  } finally {
    await context.close();
  }
}

// ─── Generate Role Video ────────────────────────────────────────────────────

async function generateRoleVideo(browser, roleTraining) {
  const { key, label, credentialKey, narration, modules } = roleTraining;
  const fileName = `${key}-${label.replace(/\s+/g, '-')}`;
  const outputPath = join(OUTPUT_DIR, 'role-wise', `${fileName}.mp4`);
  
  console.log(`\n📹 Generating Role Video: ${label}`);
  
  ensureDir(join(OUTPUT_DIR, 'role-wise'));
  ensureDir(TEMP_DIR);
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: join(TEMP_DIR, 'recordings'), size: { width: 1280, height: 720 } },
  });
  
  const page = await context.newPage();
  
  try {
    const loggedIn = await loginToApp(page, credentialKey);
    if (!loggedIn) {
      console.error(`  Skipping ${label} - login failed`);
      await context.close();
      return;
    }
    
    const audioFiles = [];
    
    for (let i = 0; i < narration.length; i++) {
      const step = narration[i];
      const stepDir = join(TEMP_DIR, `role_${key}_step_${i}`);
      ensureDir(stepDir);
      
      const audioPath = join(stepDir, `narration_${i}.mp3`);
      console.log(`  Narration ${i + 1}/${narration.length}: "${step.text.slice(0, 50)}..."`);
      generateTTS(step.text, audioPath);
      
      if (existsSync(audioPath)) {
        audioFiles.push(audioPath);
      }
      
      // Navigate to module
      if (i < modules.length) {
        await navigateToModule(page, modules[i]);
        
        const duration = existsSync(audioPath) ? getAudioDuration(audioPath) : 10;
        const waitMs = Math.max(duration * 1000, 5000);
        
        await page.evaluate(() => window.scrollBy(0, 100));
        await page.waitForTimeout(Math.min(waitMs * 0.3, 3000));
        await page.evaluate(() => window.scrollBy(0, -50));
        await page.waitForTimeout(Math.min(waitMs * 0.3, 3000));
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(Math.min(waitMs * 0.4, 3000));
      }
    }
    
    const videoPath = await page.video()?.path();
    const combinedAudioPath = join(TEMP_DIR, `role_${key}_audio.m4a`);
    if (audioFiles.length > 0) {
      concatAudioFiles(audioFiles, combinedAudioPath);
    }
    
    if (videoPath && existsSync(videoPath) && existsSync(combinedAudioPath)) {
      combineVideoAudio(videoPath, combinedAudioPath, outputPath);
      console.log(`  ✅ Role video saved: ${outputPath}`);
    } else if (videoPath && existsSync(videoPath)) {
      execSync(`cp "${videoPath}" "${outputPath}"`, { stdio: 'pipe' });
      console.log(`  ⚠️ Video saved without audio: ${outputPath}`);
    } else {
      console.error(`  ❌ No video recorded for ${label}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message.slice(0, 200)}`);
  } finally {
    await context.close();
  }
}

// ─── Main Entry ─────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--all';
  
  console.log('\n🎬 eh2r AI Training Video Generator');
  console.log('====================================\n');
  
  ensureDir(OUTPUT_DIR);
  ensureDir(TEMP_DIR);
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  
  try {
    if (mode === '--module' && args[1]) {
      const idx = MODULES.findIndex(m => m.key === args[1]);
      if (idx >= 0) await generateModuleVideo(browser, MODULES[idx], idx);
      else console.error(`Module not found: ${args[1]}. Available: ${MODULES.map(m => m.key).join(', ')}`);
    } else if (mode === '--role' && args[1]) {
      const rt = ROLE_TRAINING.find(r => r.key === args[1]);
      if (rt) await generateRoleVideo(browser, rt);
      else console.error(`Role not found: ${args[1]}. Available: ${ROLE_TRAINING.map(r => r.key).join(', ')}`);
    } else if (mode === '--modules') {
      for (let i = 0; i < MODULES.length; i++) await generateModuleVideo(browser, MODULES[i], i);
    } else if (mode === '--roles') {
      for (const rt of ROLE_TRAINING) await generateRoleVideo(browser, rt);
    } else if (mode === '--all') {
      console.log('Generating all module-wise videos...');
      for (let i = 0; i < MODULES.length; i++) await generateModuleVideo(browser, MODULES[i], i);
      console.log('\nGenerating all role-wise videos...');
      for (const rt of ROLE_TRAINING) await generateRoleVideo(browser, rt);
    } else {
      console.log('Usage:');
      console.log('  node generate-training-videos.mjs --all           Generate all videos');
      console.log('  node generate-training-videos.mjs --modules       All module videos');
      console.log('  node generate-training-videos.mjs --roles         All role videos');
      console.log('  node generate-training-videos.mjs --module <key>  Specific module');
      console.log('  node generate-training-videos.mjs --role <key>    Specific role');
    }
    
    console.log('\n✨ Video generation complete!');
    console.log(`📁 Module videos: ${join(OUTPUT_DIR, 'module-wise')}`);
    console.log(`📁 Role videos: ${join(OUTPUT_DIR, 'role-wise')}`);
  } finally {
    await browser.close();
    try { rmSync(TEMP_DIR, { recursive: true, force: true }); } catch {}
  }
}

main().catch(console.error);
