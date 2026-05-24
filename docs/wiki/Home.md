# AI-HRMS - Complete Documentation Hub

## 🏢 Company-Wise Login System

AI-HRMS now supports multi-tenant company-wise login. Each organization has a unique company code that employees use to access their company's HR portal.

### How It Works
1. **Company Code**: Every company gets a unique short code (e.g., "ACME")
2. **Login Flow**: Users enter Company Code + Email + Password
3. **Company Verification**: The system verifies the company code against the database
4. **Role Assignment**: After authentication, the user's role determines their dashboard and visible modules
5. **Data Isolation**: Each company's data is scoped by `companyId`

### Default Demo
- **Company Code**: `ACME`
- **Company**: Acme Corporation (Bangalore, India)

## 🔐 Role Master & Configuration

The Role Master system allows Super Admins to fully configure role-based access control.

### Role Configuration Fields
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Role name (unique) |
| `description` | String | Role description |
| `level` | Integer | Hierarchy level (0=Super Admin, 4=Employee) |
| `isSystem` | Boolean | System roles cannot be deleted |
| `dashboard` | String | Auto-assigned dashboard on login |
| `menuItems` | JSON Array | List of visible sidebar modules |
| `color` | String | UI badge color |
| `permissions` | JSON Object | Module-level CRUD permissions |
| `companyId` | String | null=global, set=company-specific |

### Role → Dashboard Mapping
| Role | Dashboard | Modules Visible |
|------|-----------|----------------|
| Super Admin | Dashboard (admin) | All modules |
| HR Admin | Employees (hr) | All modules |
| Payroll Specialist | Payroll (payroll) | Dashboard, Payroll, Self-Service |
| Department Manager | Dashboard (manager) | Dashboard, Employees, Attendance, Performance, Learning, Self-Service |
| Employee | Self-Service (employee) | Dashboard, Attendance, Self-Service |
| Recruiter | Talent Acquisition (recruiter) | Dashboard, Talent, Self-Service |
| L&D Manager | Learning & Development (learning) | Dashboard, Learning, Performance, Self-Service |

### Super Admin Capabilities
- Create, edit, and delete custom roles
- Configure which modules each role can access
- Set the default dashboard for each role
- Assign role colors for visual identification
- Define granular permissions per module (read/write/modify/delete/admin)
- Cannot delete system roles (isSystem=true)

## 📱 Flutter Mobile App

A Flutter mobile application is available for Android and iOS, providing on-the-go HR access.

### Features
- Company-wise login with biometric authentication
- Mark attendance with GPS geolocation
- Apply and track leave requests
- View payslips and payroll information
- AI HR Assistant chatbot
- Push notifications for approvals and updates
- Employee self-service portal
- Offline mode for attendance

### Download
- **Android**: Available on Google Play Store (link on login page)
- **iOS**: Available on Apple App Store (link on login page)

### Mobile App Structure
```
mobile/
├── lib/
│   ├── main.dart              # App entry point
│   ├── config/app_config.dart  # API configuration
│   ├── models/user_model.dart  # User & Company models
│   ├── services/auth_service.dart  # Authentication with JWT
│   └── screens/
│       ├── login_screen.dart   # Company code + email + password
│       └── home_screen.dart    # Dashboard, Attendance, Leave, AI Chat, Profile
└── pubspec.yaml
```

## 🔗 Quick Links
- **Live App**: https://ai-hrms-rho.vercel.app
- **GitHub**: https://github.com/maheshkpreddy/ai-hrms
- **Company Code**: ACME (for demo)

## 📋 Demo Credentials
| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Super Admin | admin@company.com | Admin@2024 | Full Dashboard |
| HR Admin | priya.sharma@company.com | HRAdmin@2024 | Employees |
| Payroll Specialist | amit.patel@company.com | Payroll@2024 | Payroll |
| Department Manager | rajesh.kumar@company.com | Manager@2024 | Dashboard |
| Employee | sneha.reddy@company.com | Employee@2024 | Self-Service |
| Recruiter | fatima.khan@company.com | Recruiter@2024 | Talent Acquisition |
| L&D Manager | meera.iyer@company.com | LDManager@2024 | Learning & Development |

## 📚 Module-wise SOP Documents
1. [Dashboard SOP](./01-Dashboard-SOP.md)
2. [Employee Management SOP](./02-Employee-Management-SOP.md)
3. [RBAC & Security SOP](./03-RBAC-Security-SOP.md)
4. [AI Talent Acquisition SOP](./04-Talent-Acquisition-SOP.md)
5. [Time & Attendance SOP](./05-Time-Attendance-SOP.md)
6. [Payroll & Expenses SOP](./06-Payroll-Expense-SOP.md)
7. [Performance & Talent SOP](./07-Performance-Talent-SOP.md)
8. [Learning & Development SOP](./08-Learning-Development-SOP.md)
9. [Analytics & Reporting SOP](./09-Analytics-Reporting-SOP.md)
10. [Employee Self-Service SOP](./10-Self-Service-SOP.md)
