# ❓ Frequently Asked Questions

This page answers the most commonly asked questions about **eh2r AI — An AI Product of MARQ AI**. If you cannot find the answer to your question here, please contact your HR administrator or open an issue on the [GitHub repository](https://github.com/maheshkpreddy/ai-hrms/issues).

📖 [Back to Wiki Home](https://github.com/maheshkpreddy/ai-hrms/wiki/Home) | 🚀 [Getting Started](https://github.com/maheshkpreddy/ai-hrms/wiki/Getting-Started)

---

## 🔐 Login & Access

### Q: How do I log in to eh2r AI?
**A**: Navigate to [https://ai-hrms-rho.vercel.app](https://ai-hrms-rho.vercel.app), enter your company code (e.g., `ACME`), then enter your email and password. See the [Getting Started Guide](https://github.com/maheshkpreddy/ai-hrms/wiki/Getting-Started) for detailed instructions.

### Q: I forgot my password. How do I reset it?
**A**: Contact your HR administrator or Super Admin to reset your password. You can also use the "Forgot Password" link on the login page if it has been configured by your administrator.

### Q: What is a company code?
**A**: The company code is a unique identifier for your organization in the multi-tenant eh2r AI system. It ensures that you access only your company's data. Your HR administrator provides this code.

### Q: Can I log in with my Google account?
**A**: Yes, if Google OAuth has been configured by your administrator, you can use the "Sign in with Google" option on the login page.

### Q: Why can't I see certain modules in the sidebar?
**A**: Module visibility is controlled by your assigned role. Each role has access to specific modules. Contact your administrator if you believe you should have access to additional modules. See the [Role Access Matrix](https://github.com/maheshkpreddy/ai-hrms/wiki/Home#role--module-access-matrix) for details.

---

## 📦 Modules & Features

### Q: What are the AI-powered modules?
**A**: Five modules leverage AI capabilities: **AI Talent Acquisition** (intelligent candidate matching), **Performance Management** (attrition risk prediction), **Learning & Development** (personalized course recommendations), **AI Job Portal** (candidate fit scoring, AI interviews), and **Analytics & Reporting** (predictive analytics). These modules are marked with an AI badge in the interface.

### Q: How many modules does eh2r AI have?
**A**: The platform includes 20 modules covering the complete HR lifecycle: Dashboard, Employee Management, Company Management, Asset Management, Document Management, Task Management, Meeting Management, RBAC & Security, AI Talent Acquisition, Time & Attendance, Payroll & Expenses, Performance Management, Learning & Development, Project Kanban, Client Portal, Sub Vendor Management, AI Job Portal, Analytics & Reporting, Employee Self-Service, and My Profile.

### Q: How do I navigate between modules?
**A**: Use the sidebar navigation on the left side of the screen. Click on a module to expand its sub-items. You can also use the search bar in the sidebar to quickly find modules. Press Ctrl+B to toggle the sidebar between expanded and collapsed views.

### Q: What is the Module Home page?
**A**: The Module Home page displays all 20 modules as interactive cards in a grid layout. You can click on any card to open that module. This page serves as a visual navigation hub.

---

## 👤 Roles & Permissions

### Q: What roles are available in eh2r AI?
**A**: There are 7 predefined roles: Super Admin, HR Admin, Department Manager, Employee, Payroll Specialist, Recruiter, and L&D Manager. Each role has specific module access and permission levels.

### Q: Can I have multiple roles?
**A**: Each user is assigned one primary role. If you need access to additional modules, contact your Super Admin to adjust your role permissions or create a custom role with the required access.

### Q: How are permissions configured?
**A**: Super Admins configure permissions through the RBAC & Security module. Permissions are defined at the module level with CRUD granularity (read, write, modify, delete, admin) for each functional area.

### Q: Can custom roles be created?
**A**: Yes, Super Admins can create custom roles through the Role Master in the RBAC & Security module. Custom roles can have any combination of module access and permission levels.

---

## 💰 Payroll & Attendance

### Q: How do I mark my attendance?
**A**: Navigate to the Time & Attendance module and click "Mark Attendance." Enter your check-in time when you start work and check-out time when you leave. The system automatically calculates work hours and flags late arrivals based on your shift.

### Q: How do I apply for leave?
**A**: Go to Employee Self-Service → My Leaves → Apply. Select the leave type (casual, sick, earned, maternity), enter the dates and reason, then submit. Your manager will receive the request for approval.

### Q: How do I access my payslips?
**A**: Navigate to Employee Self-Service → My Payslips. You can view and download payslips for any month. Payslips include a detailed breakdown of earnings, deductions, and net pay.

### Q: How is payroll processed?
**A**: Payroll Specialists or HR Admins process payroll through the Payroll & Expenses module. The system calculates earnings and deductions based on configured salary structures, attendance data, and tax rules. Payroll goes through pending → processed → paid statuses.

---

## 🤖 AI Features

### Q: How does the AI Talent Acquisition work?
**A**: The AI Talent Acquisition module uses machine learning to match candidates with job requirements, generate interview questions, and predict candidate fit. It analyzes candidate skills, experience, and other factors to provide fit scores and recommendations.

### Q: What is AI-based performance prediction?
**A**: The Performance Management module uses AI to predict attrition risk for employees based on various factors including performance trends, engagement signals, and market conditions. This helps managers take proactive retention actions.

### Q: How does the AI Job Portal interview work?
**A**: The AI Job Portal can conduct automated interviews where AI generates role-specific questions, records candidate responses, and provides automated scoring and feedback summaries. This speeds up the initial screening process significantly.

---

## 📱 Mobile App

### Q: Is there a mobile app available?
**A**: Yes, eh2r AI has a Flutter mobile app available for both Android and iOS. You can download it from the respective app stores. Links are available on the login page.

### Q: What features are available on the mobile app?
**A**: The mobile app supports company-wise login, biometric authentication, GPS-based attendance marking, leave management, payslip viewing, an AI HR chatbot, and push notifications for approvals and updates.

---

## 🔧 Technical & Administration

### Q: What browsers are supported?
**A**: Chrome, Firefox, Safari, and Edge (latest versions) are fully supported. For the best experience, we recommend using the latest version of Chrome.

### Q: Is my data secure?
**A**: Yes, eh2r AI implements multi-tenant data isolation, role-based access control, encrypted passwords (bcrypt), audit logging, and secure API endpoints. Each company's data is completely isolated from others.

### Q: How do I report a bug or request a feature?
**A**: Open an issue on the [GitHub repository](https://github.com/maheshkpreddy/ai-hrms/issues) with a clear description of the bug or feature request. Include steps to reproduce for bugs.

### Q: Can eh2r AI be self-hosted?
**A**: Yes, eh2r AI is an open-source project. You can clone the repository and deploy it on your own infrastructure. See the repository README for deployment instructions.

---

## 📹 Training Videos

### Q: Where can I find training videos?
**A**: Training videos are available for all 20 modules and 7 roles. Access them through the individual training pages linked from the [Wiki Home](https://github.com/maheshkpreddy/ai-hrms/wiki/Home), or download them directly from the [GitHub Releases](https://github.com/maheshkpreddy/ai-hrms/releases/tag/training-videos) page.

### Q: Are training videos available offline?
**A**: Yes, all training videos can be downloaded as MP4 files for offline viewing. Right-click the video link and select "Save link as..." to download.

---

*eh2r AI — An AI Product of MARQ AI*
