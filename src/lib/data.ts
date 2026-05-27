// Mock data for the HRMS application

export const departments = [
  { id: '1', name: 'Engineering', head: 'Rajesh Kumar', budget: 2500000, count: 45 },
  { id: '2', name: 'Human Resources', head: 'Priya Sharma', budget: 800000, count: 12 },
  { id: '3', name: 'Finance', head: 'Amit Patel', budget: 600000, count: 10 },
  { id: '4', name: 'Marketing', head: 'Neha Gupta', budget: 1200000, count: 20 },
  { id: '5', name: 'Sales', head: 'Vikram Singh', budget: 1500000, count: 28 },
  { id: '6', name: 'Operations', head: 'Deepak Joshi', budget: 900000, count: 15 },
  { id: '7', name: 'Product', head: 'Anita Desai', budget: 1100000, count: 18 },
  { id: '8', name: 'Customer Support', head: 'Suresh Nair', budget: 700000, count: 22 },
]

export const employees = [
  { id: 'EMP001', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@company.com', phone: '+91-9876543210', dob: '1988-05-12', gender: 'Male', address: '42, Koramangala 5th Block, Bangalore, Karnataka 560095', department: 'Engineering', designation: 'Senior Software Engineer', jobTitle: 'Tech Lead', contractType: 'full-time', status: 'active', joinDate: '2021-03-15', salary: 1800000, reportingTo: 'EMP013', bankAccount: 'XXXX-XXXX-1234', panNumber: 'ABCPK1234L', pfNumber: 'PF/001/2021', avatar: '' },
  { id: 'EMP002', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@company.com', phone: '+91-9876543211', dob: '1990-08-22', gender: 'Female', address: '15, HSR Layout Sector 2, Bangalore, Karnataka 560102', department: 'Human Resources', designation: 'HR Manager', jobTitle: 'HR Manager', contractType: 'full-time', status: 'active', joinDate: '2020-06-01', salary: 1500000, reportingTo: null, bankAccount: 'XXXX-XXXX-5678', panNumber: 'DEFPS5678M', pfNumber: 'PF/002/2020', avatar: '' },
  { id: 'EMP003', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@company.com', phone: '+91-9876543212', dob: '1985-11-03', gender: 'Male', address: '78, Powai Lake Road, Mumbai, Maharashtra 400076', department: 'Finance', designation: 'Finance Manager', jobTitle: 'Finance Manager', contractType: 'full-time', status: 'active', joinDate: '2019-11-20', salary: 1600000, reportingTo: null, bankAccount: 'XXXX-XXXX-9012', panNumber: 'GHIAP9012N', pfNumber: 'PF/003/2019', avatar: '' },
  { id: 'EMP004', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@company.com', phone: '+91-9876543213', dob: '1987-02-18', gender: 'Female', address: '23, Vasant Kunj, New Delhi 110070', department: 'Marketing', designation: 'Marketing Director', jobTitle: 'Marketing Director', contractType: 'full-time', status: 'active', joinDate: '2020-01-10', salary: 2000000, reportingTo: null, bankAccount: 'XXXX-XXXX-3456', panNumber: 'JKLNG3456O', pfNumber: 'PF/004/2020', avatar: '' },
  { id: 'EMP005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@company.com', phone: '+91-9876543214', dob: '1983-07-09', gender: 'Male', address: '56, Bandra West, Mumbai, Maharashtra 400050', department: 'Sales', designation: 'Sales Head', jobTitle: 'VP Sales', contractType: 'full-time', status: 'active', joinDate: '2018-08-05', salary: 2500000, reportingTo: null, bankAccount: 'XXXX-XXXX-7890', panNumber: 'MNOPS7890P', pfNumber: 'PF/005/2018', avatar: '' },
  { id: 'EMP006', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@company.com', phone: '+91-9876543215', dob: '1993-04-25', gender: 'Female', address: '89, Madhapur, Hyderabad, Telangana 500081', department: 'Engineering', designation: 'Software Engineer', jobTitle: 'Full Stack Developer', contractType: 'full-time', status: 'active', joinDate: '2022-07-12', salary: 1200000, reportingTo: 'EMP001', bankAccount: 'XXXX-XXXX-2345', panNumber: 'QRSTS2345Q', pfNumber: 'PF/006/2022', avatar: '' },
  { id: 'EMP007', firstName: 'Arjun', lastName: 'Mehta', email: 'arjun.mehta@company.com', phone: '+91-9876543216', dob: '1989-12-14', gender: 'Male', address: '34, Indiranagar, Bangalore, Karnataka 560038', department: 'Product', designation: 'Product Manager', jobTitle: 'Senior PM', contractType: 'full-time', status: 'active', joinDate: '2021-09-25', salary: 1700000, reportingTo: 'EMP013', bankAccount: 'XXXX-XXXX-6789', panNumber: 'UVWAM6789R', pfNumber: 'PF/007/2021', avatar: '' },
  { id: 'EMP008', firstName: 'Kavita', lastName: 'Nair', email: 'kavita.nair@company.com', phone: '+91-9876543217', dob: '1991-09-07', gender: 'Female', address: '12, Kakkanad, Kochi, Kerala 682030', department: 'Customer Support', designation: 'Support Lead', jobTitle: 'Team Lead', contractType: 'full-time', status: 'active', joinDate: '2022-01-18', salary: 900000, reportingTo: 'EMP011', bankAccount: 'XXXX-XXXX-0123', panNumber: 'XYZKN0123S', pfNumber: 'PF/008/2022', avatar: '' },
  { id: 'EMP009', firstName: 'Rohit', lastName: 'Verma', email: 'rohit.verma@company.com', phone: '+91-9876543218', dob: '1990-06-30', gender: 'Male', address: '67, Whitefield, Bangalore, Karnataka 560066', department: 'Engineering', designation: 'DevOps Engineer', jobTitle: 'Senior DevOps', contractType: 'full-time', status: 'active', joinDate: '2021-05-30', salary: 1500000, reportingTo: 'EMP001', bankAccount: 'XXXX-XXXX-4567', panNumber: 'ABCRV4567T', pfNumber: 'PF/009/2021', avatar: '' },
  { id: 'EMP010', firstName: 'Meera', lastName: 'Iyer', email: 'meera.iyer@company.com', phone: '+91-9876543219', dob: '1992-01-19', gender: 'Female', address: '45, Egmore, Chennai, Tamil Nadu 600008', department: 'Learning & Development', designation: 'L&D Specialist', jobTitle: 'Training Coordinator', contractType: 'full-time', status: 'active', joinDate: '2023-02-14', salary: 1000000, reportingTo: 'EMP002', bankAccount: 'XXXX-XXXX-8901', panNumber: 'DEFMI8901U', pfNumber: 'PF/010/2023', avatar: '' },
  { id: 'EMP011', firstName: 'Suresh', lastName: 'Nair', email: 'suresh.nair@company.com', phone: '+91-9876543220', dob: '1986-10-28', gender: 'Male', address: '90, Salt Lake, Kolkata, West Bengal 700091', department: 'Customer Support', designation: 'Support Manager', jobTitle: 'CS Manager', contractType: 'full-time', status: 'active', joinDate: '2020-04-08', salary: 1300000, reportingTo: null, bankAccount: 'XXXX-XXXX-2346', panNumber: 'GHISN2346V', pfNumber: 'PF/011/2020', avatar: '' },
  { id: 'EMP012', firstName: 'Deepak', lastName: 'Joshi', email: 'deepak.joshi@company.com', phone: '+91-9876543221', dob: '1984-03-15', gender: 'Male', address: '23, Vastrapur, Ahmedabad, Gujarat 380015', department: 'Operations', designation: 'Operations Manager', jobTitle: 'Ops Manager', contractType: 'full-time', status: 'active', joinDate: '2019-12-01', salary: 1400000, reportingTo: null, bankAccount: 'XXXX-XXXX-6790', panNumber: 'JKLDJ6790W', pfNumber: 'PF/012/2019', avatar: '' },
  { id: 'EMP013', firstName: 'Anita', lastName: 'Desai', email: 'anita.desai@company.com', phone: '+91-9876543222', dob: '1980-08-11', gender: 'Female', address: '56, Jubilee Hills, Hyderabad, Telangana 500033', department: 'Product', designation: 'VP Product', jobTitle: 'VP Product', contractType: 'full-time', status: 'active', joinDate: '2018-03-20', salary: 2800000, reportingTo: null, bankAccount: 'XXXX-XXXX-0134', panNumber: 'MNOPD0134X', pfNumber: 'PF/013/2018', avatar: '' },
  { id: 'EMP014', firstName: 'Karthik', lastName: 'Rao', email: 'karthik.rao@company.com', phone: '+91-9876543223', dob: '1998-11-05', gender: 'Male', address: '78, Electronic City, Bangalore, Karnataka 560100', department: 'Engineering', designation: 'Junior Developer', jobTitle: 'Frontend Developer', contractType: 'full-time', status: 'onboarding', joinDate: '2024-01-08', salary: 700000, reportingTo: 'EMP001', bankAccount: 'XXXX-XXXX-4578', panNumber: 'QRSTK4578Y', pfNumber: 'PF/014/2024', avatar: '' },
  { id: 'EMP015', firstName: 'Pooja', lastName: 'Malhotra', email: 'pooja.malhotra@company.com', phone: '+91-9876543224', dob: '1991-05-23', gender: 'Female', address: '34, Sector 29, Gurugram, Haryana 122001', department: 'Marketing', designation: 'Content Strategist', jobTitle: 'Content Lead', contractType: 'contract', status: 'active', joinDate: '2023-06-15', salary: 1100000, reportingTo: 'EMP004', bankAccount: 'XXXX-XXXX-8912', panNumber: 'UVWPM8912Z', pfNumber: 'PF/015/2023', avatar: '' },
  { id: 'EMP016', firstName: 'Ravi', lastName: 'Krishnan', email: 'ravi.krishnan@company.com', phone: '+91-9876543225', dob: '1995-07-19', gender: 'Male', address: '12, T. Nagar, Chennai, Tamil Nadu 600017', department: 'Sales', designation: 'Sales Executive', jobTitle: 'Sales Executive', contractType: 'full-time', status: 'inactive', joinDate: '2022-03-01', salary: 800000, reportingTo: 'EMP005', bankAccount: 'XXXX-XXXX-3457', panNumber: 'ABCRK3457A', pfNumber: 'PF/016/2022', avatar: '' },
  { id: 'EMP017', firstName: 'Fatima', lastName: 'Khan', email: 'fatima.khan@company.com', phone: '+91-9876543226', dob: '1994-09-02', gender: 'Female', address: '56, Banjara Hills, Hyderabad, Telangana 500034', department: 'Human Resources', designation: 'HR Executive', jobTitle: 'HR Executive', contractType: 'full-time', status: 'active', joinDate: '2023-04-10', salary: 750000, reportingTo: 'EMP002', bankAccount: 'XXXX-XXXX-7891', panNumber: 'DEFKF7891B', pfNumber: 'PF/017/2023', avatar: '' },
  { id: 'EMP018', firstName: 'Sanjay', lastName: 'Mishra', email: 'sanjay.mishra@company.com', phone: '+91-9876543227', dob: '1990-12-11', gender: 'Male', address: '89, Hinjewadi, Pune, Maharashtra 411057', department: 'Engineering', designation: 'QA Engineer', jobTitle: 'Senior QA', contractType: 'part-time', status: 'active', joinDate: '2022-09-05', salary: 950000, reportingTo: 'EMP001', bankAccount: 'XXXX-XXXX-1235', panNumber: 'GHISM1235C', pfNumber: 'PF/018/2022', avatar: '' },
  { id: 'EMP019', firstName: 'Divya', lastName: 'Menon', email: 'divya.menon@company.com', phone: '+91-9876543228', dob: '1996-03-28', gender: 'Female', address: '23, Technopark, Trivandrum, Kerala 695581', department: 'Engineering', designation: 'Software Engineer', jobTitle: 'Backend Developer', contractType: 'intern', status: 'active', joinDate: '2024-01-02', salary: 400000, reportingTo: 'EMP009', bankAccount: 'XXXX-XXXX-5679', panNumber: 'JKLDM5679D', pfNumber: 'PF/019/2024', avatar: '' },
  { id: 'EMP020', firstName: 'Arun', lastName: 'Pillai', email: 'arun.pillai@company.com', phone: '+91-9876543229', dob: '1987-06-14', gender: 'Male', address: '45, MG Road, Kochi, Kerala 682016', department: 'Finance', designation: 'Accountant', jobTitle: 'Senior Accountant', contractType: 'full-time', status: 'exited', joinDate: '2019-05-20', salary: 1100000, reportingTo: 'EMP003', bankAccount: 'XXXX-XXXX-9013', panNumber: 'MNOPA9013E', pfNumber: 'PF/020/2019', avatar: '' },
]

export const employeeDocuments = [
  { id: '1', employeeId: 'EMP001', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2021-03-15', status: 'verified' },
  { id: '2', employeeId: 'EMP001', name: 'PAN Card', type: 'Tax', uploadedDate: '2021-03-15', status: 'verified' },
  { id: '3', employeeId: 'EMP001', name: 'Employment Agreement', type: 'Contract', uploadedDate: '2021-03-16', status: 'verified' },
  { id: '4', employeeId: 'EMP002', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2020-06-01', status: 'verified' },
  { id: '5', employeeId: 'EMP002', name: 'PAN Card', type: 'Tax', uploadedDate: '2020-06-01', status: 'verified' },
  { id: '6', employeeId: 'EMP002', name: 'Employment Agreement', type: 'Contract', uploadedDate: '2020-06-02', status: 'verified' },
  { id: '7', employeeId: 'EMP005', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2018-08-05', status: 'verified' },
  { id: '8', employeeId: 'EMP005', name: 'PAN Card', type: 'Tax', uploadedDate: '2018-08-05', status: 'verified' },
  { id: '9', employeeId: 'EMP006', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2022-07-12', status: 'verified' },
  { id: '10', employeeId: 'EMP006', name: 'Employment Agreement', type: 'Contract', uploadedDate: '2022-07-13', status: 'pending' },
  { id: '11', employeeId: 'EMP014', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2024-01-08', status: 'pending' },
  { id: '12', employeeId: 'EMP014', name: 'PAN Card', type: 'Tax', uploadedDate: '2024-01-08', status: 'pending' },
  { id: '13', employeeId: 'EMP014', name: 'Employment Agreement', type: 'Contract', uploadedDate: '2024-01-09', status: 'pending' },
  { id: '14', employeeId: 'EMP015', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2023-06-15', status: 'verified' },
  { id: '15', employeeId: 'EMP015', name: 'Contract Agreement', type: 'Contract', uploadedDate: '2023-06-16', status: 'verified' },
  { id: '16', employeeId: 'EMP013', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2018-03-20', status: 'verified' },
  { id: '17', employeeId: 'EMP013', name: 'PAN Card', type: 'Tax', uploadedDate: '2018-03-20', status: 'verified' },
  { id: '18', employeeId: 'EMP013', name: 'Employment Agreement', type: 'Contract', uploadedDate: '2018-03-21', status: 'verified' },
  { id: '19', employeeId: 'EMP009', name: 'Aadhaar Card', type: 'Identity', uploadedDate: '2021-05-30', status: 'verified' },
  { id: '20', employeeId: 'EMP009', name: 'PAN Card', type: 'Tax', uploadedDate: '2021-05-30', status: 'verified' },
]

export const permissionTypes = ['read', 'write', 'modify', 'delete', 'admin'] as const
export type PermissionType = typeof permissionTypes[number]

export const modules = ['HR', 'Payroll', 'Attendance', 'Performance', 'Learning', 'Analytics'] as const
export type ModuleName = typeof modules[number]

export type RoleModulePermissions = Record<ModuleName, Record<PermissionType, boolean>>

export const roles = [
  { id: '1', name: 'Super Admin', description: 'Full system access with all permissions', level: 0, permissions: ['read', 'write', 'modify', 'delete', 'admin'], userCount: 1, modulePermissions: { HR: { read: true, write: true, modify: true, delete: true, admin: true }, Payroll: { read: true, write: true, modify: true, delete: true, admin: true }, Attendance: { read: true, write: true, modify: true, delete: true, admin: true }, Performance: { read: true, write: true, modify: true, delete: true, admin: true }, Learning: { read: true, write: true, modify: true, delete: true, admin: true }, Analytics: { read: true, write: true, modify: true, delete: true, admin: true } } as RoleModulePermissions },
  { id: '2', name: 'HR Admin', description: 'Manage employees, payroll, and HR operations', level: 1, permissions: ['read', 'write', 'modify'], userCount: 3, modulePermissions: { HR: { read: true, write: true, modify: true, delete: false, admin: false }, Payroll: { read: true, write: true, modify: true, delete: false, admin: false }, Attendance: { read: true, write: true, modify: false, delete: false, admin: false }, Performance: { read: true, write: true, modify: true, delete: false, admin: false }, Learning: { read: true, write: true, modify: false, delete: false, admin: false }, Analytics: { read: true, write: false, modify: false, delete: false, admin: false } } as RoleModulePermissions },
  { id: '3', name: 'Payroll Specialist', description: 'Process payroll, manage tax declarations', level: 2, permissions: ['read', 'write'], userCount: 2, modulePermissions: { HR: { read: true, write: false, modify: false, delete: false, admin: false }, Payroll: { read: true, write: true, modify: true, delete: false, admin: false }, Attendance: { read: true, write: false, modify: false, delete: false, admin: false }, Performance: { read: false, write: false, modify: false, delete: false, admin: false }, Learning: { read: false, write: false, modify: false, delete: false, admin: false }, Analytics: { read: true, write: false, modify: false, delete: false, admin: false } } as RoleModulePermissions },
  { id: '4', name: 'Department Manager', description: 'Manage team, approve leaves and expenses', level: 3, permissions: ['read', 'modify'], userCount: 8, modulePermissions: { HR: { read: true, write: false, modify: true, delete: false, admin: false }, Payroll: { read: true, write: false, modify: false, delete: false, admin: false }, Attendance: { read: true, write: true, modify: true, delete: false, admin: false }, Performance: { read: true, write: true, modify: true, delete: false, admin: false }, Learning: { read: true, write: false, modify: false, delete: false, admin: false }, Analytics: { read: true, write: false, modify: false, delete: false, admin: false } } as RoleModulePermissions },
  { id: '5', name: 'Employee', description: 'Self-service access to personal data', level: 4, permissions: ['read'], userCount: 140, modulePermissions: { HR: { read: true, write: false, modify: false, delete: false, admin: false }, Payroll: { read: true, write: false, modify: false, delete: false, admin: false }, Attendance: { read: true, write: false, modify: false, delete: false, admin: false }, Performance: { read: true, write: false, modify: false, delete: false, admin: false }, Learning: { read: true, write: true, modify: false, delete: false, admin: false }, Analytics: { read: false, write: false, modify: false, delete: false, admin: false } } as RoleModulePermissions },
  { id: '6', name: 'Recruiter', description: 'Manage job postings and candidate pipeline', level: 2, permissions: ['read', 'write'], userCount: 4, modulePermissions: { HR: { read: true, write: true, modify: true, delete: false, admin: false }, Payroll: { read: false, write: false, modify: false, delete: false, admin: false }, Attendance: { read: false, write: false, modify: false, delete: false, admin: false }, Performance: { read: false, write: false, modify: false, delete: false, admin: false }, Learning: { read: true, write: false, modify: false, delete: false, admin: false }, Analytics: { read: true, write: false, modify: false, delete: false, admin: false } } as RoleModulePermissions },
  { id: '7', name: 'L&D Manager', description: 'Manage training programs and skill development', level: 2, permissions: ['read', 'write', 'modify'], userCount: 2, modulePermissions: { HR: { read: true, write: false, modify: false, delete: false, admin: false }, Payroll: { read: false, write: false, modify: false, delete: false, admin: false }, Attendance: { read: true, write: false, modify: false, delete: false, admin: false }, Performance: { read: true, write: true, modify: true, delete: false, admin: false }, Learning: { read: true, write: true, modify: true, delete: true, admin: false }, Analytics: { read: true, write: false, modify: false, delete: false, admin: false } } as RoleModulePermissions },
]

export const auditLogs = [
  { id: '1', user: 'Rajesh Kumar', action: 'read', module: 'hr', details: 'Viewed employee dashboard', timestamp: '2024-01-15 09:00:12', ip: '192.168.1.100' },
  { id: '2', user: 'Priya Sharma', action: 'create', module: 'hr', details: 'Created new employee record for Karthik Rao', timestamp: '2024-01-15 09:15:30', ip: '192.168.1.45' },
  { id: '3', user: 'Amit Patel', action: 'modify', module: 'payroll', details: 'Updated payroll for December 2023', timestamp: '2024-01-15 10:00:45', ip: '192.168.1.78' },
  { id: '4', user: 'System', action: 'delete', module: 'attendance', details: 'Auto-cleaned attendance records older than 2 years', timestamp: '2024-01-15 02:00:00', ip: '10.0.0.1' },
  { id: '5', user: 'Neha Gupta', action: 'read', module: 'hr', details: 'Viewed employee salary data', timestamp: '2024-01-15 10:30:22', ip: '192.168.1.92' },
  { id: '6', user: 'Vikram Singh', action: 'modify', module: 'performance', details: 'Updated performance review for Q4 2023', timestamp: '2024-01-15 11:00:15', ip: '192.168.1.55' },
  { id: '7', user: 'Priya Sharma', action: 'create', module: 'hr', details: 'Updated permissions for Recruiter role', timestamp: '2024-01-15 11:30:00', ip: '192.168.1.45' },
  { id: '8', user: 'System', action: 'modify', module: 'payroll', details: 'Automated daily backup completed', timestamp: '2024-01-15 03:00:00', ip: '10.0.0.1' },
  { id: '9', user: 'Rohit Verma', action: 'read', module: 'attendance', details: 'Viewed attendance report for January', timestamp: '2024-01-15 11:45:10', ip: '192.168.1.110' },
  { id: '10', user: 'Meera Iyer', action: 'create', module: 'learning', details: 'Added new course: Advanced React Patterns', timestamp: '2024-01-15 12:00:30', ip: '192.168.1.134' },
  { id: '11', user: 'Sneha Reddy', action: 'read', module: 'performance', details: 'Viewed own performance review', timestamp: '2024-01-15 12:15:45', ip: '192.168.1.67' },
  { id: '12', user: 'Arjun Mehta', action: 'modify', module: 'hr', details: 'Updated team allocation for Q1 sprint', timestamp: '2024-01-15 13:00:00', ip: '192.168.1.89' },
  { id: '13', user: 'Kavita Nair', action: 'create', module: 'attendance', details: 'Submitted leave request for March', timestamp: '2024-01-15 13:30:20', ip: '192.168.1.156' },
  { id: '14', user: 'System', action: 'delete', module: 'hr', details: 'Removed expired job posting for HR Executive', timestamp: '2024-01-15 04:00:00', ip: '10.0.0.1' },
  { id: '15', user: 'Rajesh Kumar', action: 'modify', module: 'analytics', details: 'Generated Q4 attrition prediction report', timestamp: '2024-01-15 14:00:15', ip: '192.168.1.100' },
  { id: '16', user: 'Priya Sharma', action: 'read', module: 'payroll', details: 'Viewed January payroll summary', timestamp: '2024-01-15 14:15:30', ip: '192.168.1.45' },
  { id: '17', user: 'Deepak Joshi', action: 'modify', module: 'attendance', details: 'Approved shift swap request from Rohit Verma', timestamp: '2024-01-15 14:30:00', ip: '192.168.1.201' },
  { id: '18', user: 'Anita Desai', action: 'create', module: 'performance', details: 'Created new OKR framework for Q1 2024', timestamp: '2024-01-15 15:00:45', ip: '192.168.1.178' },
  { id: '19', user: 'System', action: 'modify', module: 'hr', details: 'Automated compliance check completed successfully', timestamp: '2024-01-15 05:00:00', ip: '10.0.0.1' },
  { id: '20', user: 'Amit Patel', action: 'read', module: 'analytics', details: 'Viewed financial analytics dashboard', timestamp: '2024-01-15 15:30:20', ip: '192.168.1.78' },
  { id: '21', user: 'Vikram Singh', action: 'create', module: 'hr', details: 'Submitted expense report for Mumbai trip', timestamp: '2024-01-15 16:00:00', ip: '192.168.1.55' },
  { id: '22', user: 'Neha Gupta', action: 'modify', module: 'learning', details: 'Updated Digital Marketing course content', timestamp: '2024-01-15 16:15:30', ip: '192.168.1.92' },
  { id: '23', user: 'Rajesh Kumar', action: 'delete', module: 'performance', details: 'Removed outdated performance template', timestamp: '2024-01-15 16:30:45', ip: '192.168.1.100' },
  { id: '24', user: 'Priya Sharma', action: 'create', module: 'hr', details: 'Onboarded new hire: Pooja Malhotra', timestamp: '2024-01-15 17:00:00', ip: '192.168.1.45' },
  { id: '25', user: 'System', action: 'modify', module: 'attendance', details: 'Auto-generated attendance summary for week 2', timestamp: '2024-01-15 06:00:00', ip: '10.0.0.1' },
]

export const jobs = [
  { id: '1', title: 'Senior Full Stack Developer', department: 'Engineering', location: 'Bangalore', type: 'full-time', experience: '5-8 years', salary: '18-25 LPA', status: 'open', postedDate: '2024-01-10', applicants: 45, requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], skills: ['Full Stack', 'System Design'] },
  { id: '2', title: 'Data Scientist', department: 'Engineering', location: 'Hyderabad', type: 'full-time', experience: '3-6 years', salary: '15-22 LPA', status: 'open', postedDate: '2024-01-08', applicants: 32, requirements: ['Python', 'ML', 'TensorFlow', 'SQL'], skills: ['Machine Learning', 'Data Analysis'] },
  { id: '3', title: 'Marketing Coordinator', department: 'Marketing', location: 'Mumbai', type: 'full-time', experience: '2-4 years', salary: '8-12 LPA', status: 'open', postedDate: '2024-01-12', applicants: 28, requirements: ['Digital Marketing', 'Content', 'Analytics'], skills: ['Marketing', 'Communication'] },
  { id: '4', title: 'HR Executive', department: 'Human Resources', location: 'Delhi', type: 'full-time', experience: '2-3 years', salary: '6-9 LPA', status: 'closed', postedDate: '2023-12-15', applicants: 56, requirements: ['HR Operations', 'Recruitment', 'Compliance'], skills: ['HR', 'People Management'] },
  { id: '5', title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', type: 'full-time', experience: '4-7 years', salary: '16-22 LPA', status: 'open', postedDate: '2024-01-14', applicants: 19, requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'], skills: ['Cloud', 'DevOps'] },
]

export const candidates = [
  { id: '1', jobId: '1', name: 'Aditya Sharma', email: 'aditya@email.com', phone: '+91-9900011122', currentCompany: 'TechCorp', experience: '6 years', skills: ['React', 'Node.js', 'TypeScript'], education: 'B.Tech, IIT Delhi', source: 'portal', status: 'interview', aiFitScore: 87, interviewDate: '2024-01-20', onboardingStatus: null },
  { id: '2', jobId: '1', name: 'Lakshmi Iyer', email: 'lakshmi@email.com', phone: '+91-9900011123', currentCompany: 'StartupXYZ', experience: '5 years', skills: ['React', 'Python', 'AWS'], education: 'M.Tech, BITS Pilani', source: 'referral', status: 'screening', aiFitScore: 72, interviewDate: null, onboardingStatus: null },
  { id: '3', jobId: '2', name: 'Rahul Krishnan', email: 'rahul@email.com', phone: '+91-9900011124', currentCompany: 'DataMinds', experience: '4 years', skills: ['Python', 'ML', 'TensorFlow'], education: 'M.Sc Statistics, ISI Kolkata', source: 'linkedin', status: 'offered', aiFitScore: 92, interviewDate: '2024-01-18', onboardingStatus: 'pending' },
  { id: '4', jobId: '3', name: 'Divya Patel', email: 'divya@email.com', phone: '+91-9900011125', currentCompany: 'AdAgency', experience: '3 years', skills: ['Digital Marketing', 'SEO', 'Analytics'], education: 'MBA Marketing, IIM A', source: 'portal', status: 'applied', aiFitScore: 65, interviewDate: null, onboardingStatus: null },
  { id: '5', jobId: '5', name: 'Sanjay Reddy', email: 'sanjay@email.com', phone: '+91-9900011126', currentCompany: 'CloudFirst', experience: '5 years', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], education: 'B.Tech, NIT Warangal', source: 'linkedin', status: 'interview', aiFitScore: 81, interviewDate: '2024-01-22', onboardingStatus: null },
  { id: '6', jobId: '4', name: 'Asha Kumari', email: 'asha@email.com', phone: '+91-9900011127', currentCompany: 'HRCorp', experience: '2 years', skills: ['HR Operations', 'Recruitment'], education: 'MBA HR, XLRI', source: 'referral', status: 'hired', aiFitScore: 78, interviewDate: '2024-01-10', onboardingStatus: 'completed' },
]

export const attendanceData = [
  { id: '1', employeeId: 'EMP001', name: 'Rajesh Kumar', date: '2024-01-15', checkIn: '09:00', checkOut: '18:30', status: 'present', shift: 'morning', hours: 9.5, department: 'Engineering', location: 'Office - Bangalore' },
  { id: '2', employeeId: 'EMP002', name: 'Priya Sharma', date: '2024-01-15', checkIn: '09:15', checkOut: '18:00', status: 'present', shift: 'morning', hours: 8.75, department: 'Human Resources', location: 'Office - Delhi' },
  { id: '3', employeeId: 'EMP003', name: 'Amit Patel', date: '2024-01-15', checkIn: '09:30', checkOut: '18:15', status: 'late', shift: 'morning', hours: 8.75, department: 'Finance', location: 'Office - Mumbai' },
  { id: '4', employeeId: 'EMP005', name: 'Vikram Singh', date: '2024-01-15', checkIn: '00:00', checkOut: '00:00', status: 'absent', shift: 'morning', hours: 0, department: 'Sales', location: '—' },
  { id: '5', employeeId: 'EMP006', name: 'Sneha Reddy', date: '2024-01-15', checkIn: '10:00', checkOut: '19:00', status: 'late', shift: 'morning', hours: 9, department: 'Engineering', location: 'Office - Hyderabad' },
  { id: '6', employeeId: 'EMP008', name: 'Kavita Nair', date: '2024-01-15', checkIn: '14:00', checkOut: '22:00', status: 'present', shift: 'evening', hours: 8, department: 'Customer Support', location: 'Office - Bangalore' },
  { id: '7', employeeId: 'EMP009', name: 'Rohit Verma', date: '2024-01-15', checkIn: '22:00', checkOut: '06:00', status: 'present', shift: 'night', hours: 8, department: 'Engineering', location: 'Office - Bangalore' },
  { id: '8', employeeId: 'EMP010', name: 'Meera Iyer', date: '2024-01-15', checkIn: '09:00', checkOut: '13:00', status: 'half-day', shift: 'morning', hours: 4, department: 'Learning & Development', location: 'Office - Delhi' },
]

export const leaveData = [
  { id: '1', employeeId: 'EMP001', name: 'Rajesh Kumar', leaveType: 'Casual Leave', startDate: '2024-01-20', endDate: '2024-01-22', days: 3, reason: 'Personal work', status: 'approved', approvedBy: 'Priya Sharma' },
  { id: '2', employeeId: 'EMP005', name: 'Vikram Singh', leaveType: 'Sick Leave', startDate: '2024-01-15', endDate: '2024-01-16', days: 2, reason: 'Medical appointment', status: 'approved', approvedBy: 'Priya Sharma' },
  { id: '3', employeeId: 'EMP006', name: 'Sneha Reddy', leaveType: 'Earned Leave', startDate: '2024-02-01', endDate: '2024-02-05', days: 5, reason: 'Vacation', status: 'pending', approvedBy: null },
  { id: '4', employeeId: 'EMP007', name: 'Arjun Mehta', leaveType: 'Casual Leave', startDate: '2024-01-25', endDate: '2024-01-25', days: 1, reason: 'Family event', status: 'pending', approvedBy: null },
  { id: '5', employeeId: 'EMP008', name: 'Kavita Nair', leaveType: 'Maternity Leave', startDate: '2024-03-01', endDate: '2024-05-31', days: 92, reason: 'Maternity', status: 'approved', approvedBy: 'Priya Sharma' },
  { id: '6', employeeId: 'EMP012', name: 'Deepak Joshi', leaveType: 'Casual Leave', startDate: '2024-01-18', endDate: '2024-01-18', days: 1, reason: 'Personal', status: 'rejected', approvedBy: 'Priya Sharma' },
]

export const payrollData = [
  { id: '1', employeeId: 'EMP001', name: 'Rajesh Kumar', month: 'January', year: 2024, basicSalary: 75000, hra: 30000, da: 15000, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 130000, pf: 9000, esi: 1755, tax: 15000, professionalTax: 200, totalDeductions: 25955, netPay: 104045, status: 'paid' },
  { id: '2', employeeId: 'EMP002', name: 'Priya Sharma', month: 'January', year: 2024, basicSalary: 62500, hra: 25000, da: 12500, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 110000, pf: 7500, esi: 1463, tax: 12000, professionalTax: 200, totalDeductions: 21163, netPay: 88837, status: 'paid' },
  { id: '3', employeeId: 'EMP003', name: 'Amit Patel', month: 'January', year: 2024, basicSalary: 66667, hra: 26667, da: 13333, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 116667, pf: 8000, esi: 1562, tax: 13000, professionalTax: 200, totalDeductions: 22762, netPay: 93905, status: 'processed' },
  { id: '4', employeeId: 'EMP005', name: 'Vikram Singh', month: 'January', year: 2024, basicSalary: 104167, hra: 41667, da: 20833, conveyance: 5000, medical: 5000, bonus: 20000, grossPay: 196667, pf: 12500, esi: 2646, tax: 28000, professionalTax: 200, totalDeductions: 43346, netPay: 153321, status: 'paid' },
  { id: '5', employeeId: 'EMP006', name: 'Sneha Reddy', month: 'January', year: 2024, basicSalary: 50000, hra: 20000, da: 10000, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 90000, pf: 6000, esi: 1197, tax: 8000, professionalTax: 200, totalDeductions: 15397, netPay: 74603, status: 'pending' },
]

export const expenseData = [
  { id: '1', employeeId: 'EMP001', name: 'Rajesh Kumar', category: 'Travel', amount: 15000, description: 'Client visit to Mumbai', date: '2024-01-10', status: 'approved', approvedBy: 'Priya Sharma' },
  { id: '2', employeeId: 'EMP005', name: 'Vikram Singh', category: 'Accommodation', amount: 8500, description: 'Hotel stay for conference', date: '2024-01-08', status: 'reimbursed', approvedBy: 'Amit Patel' },
  { id: '3', employeeId: 'EMP006', name: 'Sneha Reddy', category: 'Equipment', amount: 25000, description: 'External monitor for development', date: '2024-01-12', status: 'pending', approvedBy: null },
  { id: '4', employeeId: 'EMP007', name: 'Arjun Mehta', category: 'Food', amount: 3200, description: 'Team lunch during sprint planning', date: '2024-01-11', status: 'approved', approvedBy: 'Priya Sharma' },
  { id: '5', employeeId: 'EMP009', name: 'Rohit Verma', category: 'Travel', amount: 4500, description: 'Cloud conference ticket', date: '2024-01-14', status: 'rejected', approvedBy: 'Amit Patel' },
]

export const performanceData = [
  { id: '1', employeeId: 'EMP001', name: 'Rajesh Kumar', reviewPeriod: 'Q4 2023', rating: 4.5, objectives: 'Complete microservices migration', status: 'completed', attritionRisk: 0.15, feedback: 'Exceptional technical leadership' },
  { id: '2', employeeId: 'EMP002', name: 'Priya Sharma', reviewPeriod: 'Q4 2023', rating: 4.2, objectives: 'Implement new HR policies', status: 'completed', attritionRisk: 0.10, feedback: 'Strong HR process improvements' },
  { id: '3', employeeId: 'EMP005', name: 'Vikram Singh', reviewPeriod: 'Q4 2023', rating: 4.0, objectives: 'Achieve 120% sales target', status: 'completed', attritionRisk: 0.35, feedback: 'Good performance but engagement concerns' },
  { id: '4', employeeId: 'EMP006', name: 'Sneha Reddy', reviewPeriod: 'Q4 2023', rating: 3.8, objectives: 'Deliver 3 product features', status: 'in-review', attritionRisk: 0.25, feedback: 'Solid contributor, needs more initiative' },
  { id: '5', employeeId: 'EMP007', name: 'Arjun Mehta', reviewPeriod: 'Q4 2023', rating: 4.3, objectives: 'Launch product v2.0', status: 'completed', attritionRisk: 0.20, feedback: 'Outstanding product vision' },
  { id: '6', employeeId: 'EMP013', name: 'Anita Desai', reviewPeriod: 'Q4 2023', rating: 4.7, objectives: 'Scale product team and launch 3 new features', status: 'completed', attritionRisk: 0.05, feedback: 'Exceptional leadership and strategic thinking' },
]

export const courses = [
  { id: '1', title: 'Advanced React Patterns', category: 'Engineering', duration: 20, provider: 'Udemy', enrollmentCount: 35, completionRate: 72, skills: ['React', 'TypeScript'], aiRecommended: true, description: 'Master advanced React patterns including compound components, render props, and hooks.', level: 'Advanced', rating: 4.7 },
  { id: '2', title: 'Machine Learning Fundamentals', category: 'Data Science', duration: 40, provider: 'Coursera', enrollmentCount: 28, completionRate: 58, skills: ['Python', 'ML'], aiRecommended: true, description: 'Build a strong foundation in machine learning algorithms and techniques.', level: 'Intermediate', rating: 4.5 },
  { id: '3', title: 'Leadership & Management', category: 'Management', duration: 15, provider: 'LinkedIn Learning', enrollmentCount: 42, completionRate: 85, skills: ['Leadership', 'Communication'], aiRecommended: false, description: 'Develop essential leadership skills for managing teams effectively.', level: 'Beginner', rating: 4.3 },
  { id: '4', title: 'Cloud Architecture (AWS)', category: 'Engineering', duration: 30, provider: 'A Cloud Guru', enrollmentCount: 22, completionRate: 64, skills: ['AWS', 'DevOps'], aiRecommended: true, description: 'Design and implement scalable cloud architectures on AWS.', level: 'Advanced', rating: 4.6 },
  { id: '5', title: 'Digital Marketing Mastery', category: 'Marketing', duration: 25, provider: 'HubSpot Academy', enrollmentCount: 18, completionRate: 78, skills: ['Marketing', 'Analytics'], aiRecommended: false, description: 'Comprehensive digital marketing strategies and analytics.', level: 'Intermediate', rating: 4.2 },
  { id: '6', title: 'Financial Analysis & Reporting', category: 'Finance', duration: 18, provider: 'Coursera', enrollmentCount: 10, completionRate: 90, skills: ['Finance', 'Analysis'], aiRecommended: false, description: 'Learn financial analysis techniques and reporting best practices.', level: 'Intermediate', rating: 4.4 },
  { id: '7', title: 'Effective Communication Skills', category: 'Soft Skills', duration: 10, provider: 'LinkedIn Learning', enrollmentCount: 55, completionRate: 92, skills: ['Communication', 'Presentation'], aiRecommended: false, description: 'Improve workplace communication and presentation skills.', level: 'Beginner', rating: 4.8 },
  { id: '8', title: 'Kubernetes & Container Orchestration', category: 'Engineering', duration: 35, provider: 'A Cloud Guru', enrollmentCount: 19, completionRate: 52, skills: ['Kubernetes', 'Docker', 'DevOps'], aiRecommended: true, description: 'Master container orchestration with Kubernetes in production.', level: 'Advanced', rating: 4.5 },
  { id: '9', title: 'Data Visualization with Python', category: 'Data Science', duration: 22, provider: 'Coursera', enrollmentCount: 24, completionRate: 70, skills: ['Python', 'Data Analysis', 'Visualization'], aiRecommended: false, description: 'Create compelling data visualizations using Python libraries.', level: 'Intermediate', rating: 4.3 },
  { id: '10', title: 'Agile Project Management', category: 'Management', duration: 12, provider: 'Udemy', enrollmentCount: 38, completionRate: 88, skills: ['Agile', 'Project Management'], aiRecommended: true, description: 'Implement Agile methodologies for project management success.', level: 'Beginner', rating: 4.6 },
  { id: '11', title: 'Cybersecurity Essentials', category: 'Engineering', duration: 28, provider: 'LinkedIn Learning', enrollmentCount: 16, completionRate: 62, skills: ['Security', 'Networking'], aiRecommended: false, description: 'Essential cybersecurity principles and practices for IT professionals.', level: 'Intermediate', rating: 4.1 },
  { id: '12', title: 'Strategic Thinking & Innovation', category: 'Soft Skills', duration: 8, provider: 'Harvard ManageMentor', enrollmentCount: 30, completionRate: 82, skills: ['Strategy', 'Innovation', 'Critical Thinking'], aiRecommended: true, description: 'Develop strategic thinking and drive innovation in your organization.', level: 'Advanced', rating: 4.7 },
]

export const assets = [
  { id: '1', employeeId: 'EMP001', assetType: 'Laptop', assetName: 'MacBook Pro 16"', serialNo: 'MBP2023-001', assignedDate: '2023-01-15', condition: 'good', status: 'assigned' },
  { id: '2', employeeId: 'EMP001', assetType: 'Access Card', assetName: 'Proximity Card', serialNo: 'AC-00145', assignedDate: '2023-01-15', condition: 'new', status: 'assigned' },
  { id: '3', employeeId: 'EMP005', assetName: 'iPhone 15 Pro', assetType: 'Phone', serialNo: 'IP15-0089', assignedDate: '2023-09-01', condition: 'good', status: 'assigned' },
  { id: '4', employeeId: 'EMP006', assetName: 'Dell XPS 15', assetType: 'Laptop', serialNo: 'DXPS-00567', assignedDate: '2022-07-12', condition: 'fair', status: 'assigned' },
  { id: '5', employeeId: 'EMP009', assetName: 'ThinkPad X1 Carbon', assetType: 'Laptop', serialNo: 'TPX1-00234', assignedDate: '2023-03-01', condition: 'good', status: 'assigned' },
  { id: '6', employeeId: 'EMP014', assetName: 'MacBook Air M2', assetType: 'Laptop', serialNo: 'MBA-00987', assignedDate: '2024-01-08', condition: 'new', status: 'assigned' },
]

export const dashboardStats = {
  totalEmployees: 170,
  activeEmployees: 156,
  newHires: 12,
  attritionRate: 8.5,
  openPositions: 14,
  pendingLeaves: 8,
  avgAttendance: 94.2,
  totalPayroll: 18500000,
  pendingExpenses: 5,
  complianceScore: 97,
}

export const monthlyTrends = [
  { month: 'Aug', headcount: 158, attrition: 5, hiring: 8, payroll: 17200000 },
  { month: 'Sep', headcount: 160, attrition: 3, hiring: 5, payroll: 17400000 },
  { month: 'Oct', headcount: 163, attrition: 4, hiring: 7, payroll: 17600000 },
  { month: 'Nov', headcount: 165, attrition: 2, hiring: 4, payroll: 17800000 },
  { month: 'Dec', headcount: 167, attrition: 6, hiring: 6, payroll: 18000000 },
  { month: 'Jan', headcount: 170, attrition: 3, hiring: 12, payroll: 18500000 },
]

export const departmentDistribution = [
  { name: 'Engineering', value: 45, color: '#10b981' },
  { name: 'Sales', value: 28, color: '#f59e0b' },
  { name: 'Customer Support', value: 22, color: '#8b5cf6' },
  { name: 'Marketing', value: 20, color: '#ec4899' },
  { name: 'Product', value: 18, color: '#06b6d4' },
  { name: 'Operations', value: 15, color: '#f97316' },
  { name: 'HR', value: 12, color: '#6366f1' },
  { name: 'Finance', value: 10, color: '#14b8a6' },
]

export const genderDistribution = [
  { name: 'Male', value: 62, color: '#10b981' },
  { name: 'Female', value: 35, color: '#f59e0b' },
  { name: 'Other', value: 3, color: '#a855f7' },
]

export const hiringForecast = [
  { month: 'Feb', predicted: 8, actual: 0, lower: 5, upper: 11 },
  { month: 'Mar', predicted: 6, actual: 0, lower: 3, upper: 9 },
  { month: 'Apr', predicted: 10, actual: 0, lower: 7, upper: 13 },
  { month: 'May', predicted: 5, actual: 0, lower: 2, upper: 8 },
  { month: 'Jun', predicted: 7, actual: 0, lower: 4, upper: 10 },
  { month: 'Jul', predicted: 9, actual: 0, lower: 6, upper: 12 },
]

export const salaryBenchmarking = [
  { role: 'Sr. Developer', internal: 18, market: 20, percentile: 45 },
  { role: 'Data Scientist', internal: 16, market: 19, percentile: 35 },
  { role: 'Product Manager', internal: 22, market: 21, percentile: 60 },
  { role: 'Marketing Lead', internal: 14, market: 15, percentile: 42 },
  { role: 'Sales Head', internal: 25, market: 24, percentile: 65 },
  { role: 'HR Manager', internal: 15, market: 16, percentile: 40 },
  { role: 'DevOps Engineer', internal: 17, market: 19, percentile: 38 },
  { role: 'Support Lead', internal: 10, market: 11, percentile: 44 },
]

export const engagementScoreData = [
  { department: 'Engineering', current: 78, predicted: 82, trend: 'up' },
  { department: 'Sales', current: 65, predicted: 60, trend: 'down' },
  { department: 'Marketing', current: 72, predicted: 75, trend: 'up' },
  { department: 'Product', current: 80, predicted: 83, trend: 'up' },
  { department: 'Support', current: 68, predicted: 64, trend: 'down' },
  { department: 'Finance', current: 74, predicted: 76, trend: 'up' },
  { department: 'HR', current: 82, predicted: 84, trend: 'up' },
  { department: 'Operations', current: 70, predicted: 68, trend: 'down' },
]

export const attendanceHeatmap = [
  // Week 1
  { week: 'W1', Mon: 95, Tue: 97, Wed: 93, Thu: 96, Fri: 88, Sat: 30, Sun: 0 },
  // Week 2
  { week: 'W2', Mon: 96, Tue: 94, Wed: 98, Thu: 95, Fri: 90, Sat: 28, Sun: 0 },
  // Week 3
  { week: 'W3', Mon: 92, Tue: 95, Wed: 91, Thu: 97, Fri: 85, Sat: 32, Sun: 0 },
  // Week 4
  { week: 'W4', Mon: 97, Tue: 96, Wed: 94, Thu: 93, Fri: 87, Sat: 25, Sun: 0 },
]

export const reportTemplates = [
  { id: '1', name: 'Employee Directory', description: 'Complete employee listing with contact details and department info', icon: 'Users', category: 'HR', lastGenerated: '2024-01-12' },
  { id: '2', name: 'Attendance Summary', description: 'Monthly attendance breakdown by department and shift', icon: 'Clock', category: 'Attendance', lastGenerated: '2024-01-15' },
  { id: '3', name: 'Payroll Report', description: 'Detailed payroll breakdown with deductions and net pay', icon: 'Banknote', category: 'Payroll', lastGenerated: '2024-01-10' },
  { id: '4', name: 'Performance Overview', description: 'Quarterly performance ratings and objective completion', icon: 'TrendingUp', category: 'Performance', lastGenerated: '2024-01-08' },
  { id: '5', name: 'Attrition Analysis', description: 'Attrition trends, predictions, and risk assessment', icon: 'AlertTriangle', category: 'Analytics', lastGenerated: '2024-01-14' },
]

export const recentReports = [
  { id: '1', name: 'Q4 2023 Performance Report', format: 'PDF', size: '2.4 MB', generatedAt: '2024-01-14 16:30', generatedBy: 'Priya Sharma' },
  { id: '2', name: 'January Payroll Summary', format: 'XLSX', size: '1.8 MB', generatedAt: '2024-01-15 10:15', generatedBy: 'Amit Patel' },
  { id: '3', name: 'Annual Attrition Analysis 2023', format: 'PDF', size: '3.1 MB', generatedAt: '2024-01-13 14:45', generatedBy: 'Rajesh Kumar' },
  { id: '4', name: 'December Attendance Report', format: 'CSV', size: '856 KB', generatedAt: '2024-01-10 09:00', generatedBy: 'System' },
  { id: '5', name: 'Employee Directory Export', format: 'XLSX', size: '1.2 MB', generatedAt: '2024-01-09 11:20', generatedBy: 'Priya Sharma' },
]

export const scheduledReports = [
  { id: '1', name: 'Weekly Attendance Summary', frequency: 'Weekly', nextRun: '2024-01-22 09:00', recipients: 3, status: 'active' },
  { id: '2', name: 'Monthly Payroll Report', frequency: 'Monthly', nextRun: '2024-02-01 08:00', recipients: 5, status: 'active' },
  { id: '3', name: 'Quarterly Performance Review', frequency: 'Quarterly', nextRun: '2024-04-01 09:00', recipients: 8, status: 'active' },
  { id: '4', name: 'Daily Attrition Alert', frequency: 'Daily', nextRun: '2024-01-16 07:00', recipients: 2, status: 'paused' },
]

export const attritionPrediction = [
  { department: 'Engineering', risk: 12, actual: 8 },
  { department: 'Sales', risk: 22, actual: 18 },
  { department: 'Marketing', risk: 15, actual: 10 },
  { department: 'Support', risk: 18, actual: 14 },
  { department: 'Product', risk: 8, actual: 5 },
  { department: 'Finance', risk: 6, actual: 3 },
  { department: 'HR', risk: 10, actual: 7 },
  { department: 'Operations', risk: 14, actual: 9 },
]

export const policies = [
  {
    id: '1',
    title: 'Leave Policy 2024',
    category: 'Leave',
    version: '3.1',
    effectiveDate: '2024-01-01',
    content: `## Leave Policy 2024\n\n### Overview\nThis policy outlines the leave entitlements and procedures for all full-time employees.\n\n### Leave Entitlements\n- **Casual Leave (CL):** 12 days per year\n- **Sick Leave (SL):** 10 days per year\n- **Earned Leave (EL):** 15 days per year\n- **Maternity Leave:** 26 weeks as per Maternity Benefit Act\n- **Paternity Leave:** 15 days\n\n### Leave Carry Forward\n- Earned Leave can be carried forward up to a maximum of 30 days\n- Casual Leave and Sick Leave cannot be carried forward\n\n### Leave Application Process\n1. Submit leave request through the HRMS portal at least 3 days in advance\n2. Emergency leaves can be applied retroactively within 2 working days\n3. Manager approval is required for leaves exceeding 3 days\n4. HR approval is required for leaves exceeding 10 consecutive days\n\n### Leave Encashment\nEarned Leave can be encashed at the end of the financial year at the employee's basic salary rate.`,
  },
  {
    id: '2',
    title: 'Code of Conduct',
    category: 'Compliance',
    version: '2.0',
    effectiveDate: '2023-06-01',
    content: `## Code of Conduct\n\n### Purpose\nThis code establishes the standards of behavior expected from all employees.\n\n### Core Values\n- **Integrity:** Act honestly and ethically in all business dealings\n- **Respect:** Treat all colleagues, clients, and stakeholders with dignity\n- **Excellence:** Strive for the highest quality in all work\n- **Collaboration:** Work together to achieve common goals\n\n### Key Policies\n- Maintain confidentiality of company and client information\n- Avoid conflicts of interest and disclose any potential conflicts\n- Report any unethical behavior through the whistleblower channel\n- Comply with all applicable laws and regulations\n- Do not accept gifts or hospitality that could influence business decisions\n\n### Disciplinary Actions\nViolations may result in verbal warning, written warning, suspension, or termination depending on severity.`,
  },
  {
    id: '3',
    title: 'Remote Work Guidelines',
    category: 'Work Policy',
    version: '1.5',
    effectiveDate: '2023-09-01',
    content: `## Remote Work Guidelines\n\n### Eligibility\nAll full-time employees who have completed their probation period may apply for remote work.\n\n### Work Arrangements\n- **Hybrid Model:** 3 days office, 2 days remote per week\n- **Full Remote:** Available for specific roles with VP-level approval\n- **Temporary Remote:** Up to 2 weeks with manager approval\n\n### Requirements\n- Stable internet connection (minimum 25 Mbps)\n- Dedicated workspace free from distractions\n- Availability during core working hours (10:00 AM - 4:00 PM IST)\n- Mandatory attendance for in-person meetings and team events\n\n### Expense Reimbursement\n- Internet allowance: ₹1,500/month for hybrid, ₹2,500/month for full remote\n- Home office setup: One-time allowance of ₹15,000 (requires approval)\n\n### Performance Expectations\nRemote employees are evaluated on the same criteria as on-site employees. Productivity, communication, and deliverables must be maintained.`,
  },
  {
    id: '4',
    title: 'Travel & Expense Policy',
    category: 'Finance',
    version: '4.0',
    effectiveDate: '2024-01-01',
    content: `## Travel & Expense Policy\n\n### Travel Approval\nAll business travel must be pre-approved by the immediate manager and department head.\n\n### Travel Class\n- **Domestic:** Economy class for all employees; Business class for VP and above\n- **International:** Economy class for up to Director level; Business class for VP and above\n\n### Per Diem Rates\n- **Metro Cities:** ₹3,500/day\n- **Non-Metro Cities:** ₹2,500/day\n- **International:** As per country-specific rate card\n\n### Accommodation\n- Budget limit: ₹5,000/night (Domestic metro), ₹3,500/night (Non-metro)\n- Preferred hotels through corporate booking portal\n\n### Expense Submission\n- Submit all expenses within 15 days of travel completion\n- Original bills required for expenses above ₹500\n- Digital receipts accepted for expenses below ₹500\n\n### Reimbursement Timeline\nApproved expenses are reimbursed within 10 working days.`,
  },
  {
    id: '5',
    title: 'Data Security & Privacy',
    category: 'Security',
    version: '2.2',
    effectiveDate: '2023-11-01',
    content: `## Data Security & Privacy Policy\n\n### Purpose\nThis policy ensures the protection of company and employee data in compliance with applicable data protection laws.\n\n### Data Classification\n- **Public:** Information available to everyone\n- **Internal:** For employee use only\n- **Confidential:** Restricted to authorized personnel\n- **Restricted:** Highly sensitive, need-to-know basis only\n\n### Employee Responsibilities\n- Use strong, unique passwords and enable multi-factor authentication\n- Lock devices when unattended\n- Report security incidents immediately to IT Security\n- Do not share login credentials\n- Encrypt sensitive data before sharing externally\n\n### Data Handling\n- Follow the principle of least privilege\n- Regularly review and clean up data access permissions\n- Dispose of sensitive documents through secure shredding\n- Personal data must be processed in accordance with consent and purpose limitation\n\n### Violations\nNon-compliance may result in disciplinary action, including termination and legal proceedings.`,
  },
  {
    id: '6',
    title: 'Performance Review Framework',
    category: 'HR',
    version: '3.0',
    effectiveDate: '2024-01-01',
    content: `## Performance Review Framework\n\n### Review Cycles\n- **Quarterly Check-ins:** Informal progress reviews\n- **Mid-Year Review:** Formal assessment at 6-month mark\n- **Annual Review:** Comprehensive year-end evaluation\n\n### Rating Scale\n1. **Needs Improvement** - Below expectations\n2. **Meets Expectations** - Satisfactory performance\n3. **Exceeds Expectations** - Above average contribution\n4. **Outstanding** - Exceptional performance\n5. **Exceptional Leader** - Role model performance\n\n### Review Process\n1. Self-assessment by employee\n2. Manager evaluation and rating\n3. Calibration sessions across department\n4. Final rating and feedback discussion\n5. Development plan creation\n\n### Promotion Criteria\n- Minimum 2 annual reviews with "Exceeds Expectations" or above\n- Demonstrated leadership and initiative\n- Completion of required training programs\n- No active performance improvement plans\n\n### Grievance Process\nEmployees may appeal ratings through HR within 15 days of review discussion.`,
  },
]

export const selfServiceLeaveBalances = [
  { type: 'Casual Leave', total: 12, used: 4, balance: 8, color: 'bg-emerald-500' },
  { type: 'Sick Leave', total: 10, used: 3, balance: 7, color: 'bg-amber-500' },
  { type: 'Earned Leave', total: 15, used: 5, balance: 10, color: 'bg-teal-500' },
  { type: 'Maternity/Paternity', total: 26, used: 0, balance: 26, color: 'bg-rose-500' },
]

export const selfServicePayslips = [
  { id: '1', month: 'January 2024', netPay: '₹1,04,045', status: 'paid', date: '2024-01-31' },
  { id: '2', month: 'December 2023', netPay: '₹1,02,890', status: 'paid', date: '2023-12-31' },
  { id: '3', month: 'November 2023', netPay: '₹1,01,750', status: 'paid', date: '2023-11-30' },
  { id: '4', month: 'October 2023', netPay: '₹1,03,200', status: 'paid', date: '2023-10-31' },
  { id: '5', month: 'September 2023', netPay: '₹1,00,500', status: 'paid', date: '2023-09-30' },
]

export const selfServiceDocuments = [
  { id: '1', name: 'Employment Offer Letter', type: 'PDF', size: '245 KB', uploadedDate: '2021-03-15' },
  { id: '2', name: 'NDA Agreement', type: 'PDF', size: '128 KB', uploadedDate: '2021-03-15' },
  { id: '3', name: 'Tax Declaration FY 2023-24', type: 'PDF', size: '312 KB', uploadedDate: '2023-04-10' },
  { id: '4', name: 'PF Nomination Form', type: 'PDF', size: '89 KB', uploadedDate: '2021-04-01' },
  { id: '5', name: 'Annual Health Checkup Report', type: 'PDF', size: '567 KB', uploadedDate: '2023-11-20' },
]

export const selfServiceAssets = [
  { id: '1', assetType: 'Laptop', assetName: 'MacBook Pro 16"', serialNo: 'MBP2023-001', assignedDate: '2023-01-15', condition: 'Good' },
  { id: '2', assetType: 'Access Card', assetName: 'Proximity Card', serialNo: 'AC-00145', assignedDate: '2023-01-15', condition: 'New' },
  { id: '3', assetType: 'Monitor', assetName: 'Dell 27" 4K Monitor', serialNo: 'DM-00892', assignedDate: '2023-06-01', condition: 'Good' },
  { id: '4', assetType: 'Headset', assetName: 'Jabra Evolve2 85', serialNo: 'JH-00341', assignedDate: '2023-03-10', condition: 'Good' },
]

export const skills = [
  { id: '1', name: 'React', category: 'Frontend', proficiency: 'Advanced', employees: 28 },
  { id: '2', name: 'Node.js', category: 'Backend', proficiency: 'Advanced', employees: 22 },
  { id: '3', name: 'Python', category: 'Backend', proficiency: 'Intermediate', employees: 18 },
  { id: '4', name: 'AWS', category: 'Cloud', proficiency: 'Intermediate', employees: 15 },
  { id: '5', name: 'Machine Learning', category: 'Data Science', proficiency: 'Intermediate', employees: 8 },
  { id: '6', name: 'Project Management', category: 'Management', proficiency: 'Advanced', employees: 12 },
  { id: '7', name: 'Data Analysis', category: 'Analytics', proficiency: 'Intermediate', employees: 14 },
  { id: '8', name: 'Leadership', category: 'Soft Skills', proficiency: 'Advanced', employees: 10 },
  { id: '9', name: 'TypeScript', category: 'Frontend', proficiency: 'Advanced', employees: 25 },
  { id: '10', name: 'Docker', category: 'DevOps', proficiency: 'Intermediate', employees: 16 },
  { id: '11', name: 'Kubernetes', category: 'DevOps', proficiency: 'Beginner', employees: 9 },
  { id: '12', name: 'Communication', category: 'Soft Skills', proficiency: 'Advanced', employees: 40 },
  { id: '13', name: 'SQL', category: 'Backend', proficiency: 'Intermediate', employees: 20 },
  { id: '14', name: 'Agile', category: 'Management', proficiency: 'Intermediate', employees: 18 },
  { id: '15', name: 'Cybersecurity', category: 'Security', proficiency: 'Beginner', employees: 6 },
  { id: '16', name: 'Financial Analysis', category: 'Finance', proficiency: 'Intermediate', employees: 8 },
]

export const skillGapData = [
  { skill: 'React', required: 90, available: 75 },
  { skill: 'Cloud (AWS)', required: 80, available: 50 },
  { skill: 'Machine Learning', required: 70, available: 35 },
  { skill: 'Leadership', required: 85, available: 60 },
  { skill: 'DevOps', required: 75, available: 45 },
  { skill: 'Data Analysis', required: 65, available: 55 },
  { skill: 'Cybersecurity', required: 60, available: 25 },
  { skill: 'Agile', required: 80, available: 65 },
]

export const topSkillsByDepartment = [
  { department: 'Engineering', topSkills: ['React', 'Node.js', 'AWS', 'Docker'] },
  { department: 'Data Science', topSkills: ['Python', 'ML', 'Data Analysis', 'SQL'] },
  { department: 'Marketing', topSkills: ['Digital Marketing', 'Analytics', 'Communication', 'Strategy'] },
  { department: 'Finance', topSkills: ['Financial Analysis', 'SQL', 'Data Analysis', 'Reporting'] },
  { department: 'Operations', topSkills: ['Agile', 'Project Management', 'Leadership', 'Communication'] },
  { department: 'Product', topSkills: ['Agile', 'Strategy', 'Data Analysis', 'Communication'] },
]

export const enrolledCourses = [
  { id: '1', courseId: '1', title: 'Advanced React Patterns', progress: 68, lastAccessed: '2 hours ago', nextModule: 'Compound Components', category: 'Engineering' },
  { id: '2', courseId: '4', title: 'Cloud Architecture (AWS)', progress: 35, lastAccessed: '1 day ago', nextModule: 'EC2 Auto Scaling', category: 'Engineering' },
  { id: '3', courseId: '10', title: 'Agile Project Management', progress: 82, lastAccessed: '3 hours ago', nextModule: 'Sprint Retrospectives', category: 'Management' },
]

export const completedCourses = [
  { id: '4', courseId: '3', title: 'Leadership & Management', score: 92, completedDate: '2024-01-10', certificateId: 'CERT-2024-001', category: 'Management' },
  { id: '5', courseId: '7', title: 'Effective Communication Skills', score: 88, completedDate: '2024-01-05', certificateId: 'CERT-2024-002', category: 'Soft Skills' },
]

export const learningPath = [
  { id: '1', title: 'React Fundamentals', status: 'completed', order: 1 },
  { id: '2', title: 'Advanced React Patterns', status: 'in-progress', order: 2 },
  { id: '3', title: 'TypeScript Deep Dive', status: 'upcoming', order: 3 },
  { id: '4', title: 'Cloud Architecture (AWS)', status: 'upcoming', order: 4 },
  { id: '5', title: 'DevOps & CI/CD', status: 'upcoming', order: 5 },
]

export const certificates = [
  { id: '1', title: 'Leadership & Management', issuedDate: '2024-01-10', certificateId: 'CERT-2024-001', provider: 'LinkedIn Learning' },
  { id: '2', title: 'Effective Communication Skills', issuedDate: '2024-01-05', certificateId: 'CERT-2024-002', provider: 'LinkedIn Learning' },
]

export const onboardingData = [
  {
    id: '1',
    name: 'Karthik Rao',
    department: 'Engineering',
    designation: 'Frontend Developer',
    startDate: '2024-01-08',
    avatar: '',
    checklist: [
      { item: 'Document Collection', completed: true },
      { item: 'IT Setup', completed: true },
      { item: 'Policy Acknowledgment', completed: true },
      { item: 'Team Introduction', completed: true },
      { item: 'Training Assignment', completed: false },
      { item: 'First Week Review', completed: false },
    ],
    aiRecommendations: [
      'Assign React advanced training based on skill gap analysis',
      'Pair with senior developer Rajesh Kumar for mentoring',
      'Schedule introduction with Product team for cross-functional alignment',
    ],
  },
  {
    id: '2',
    name: 'Rahul Krishnan',
    department: 'Engineering',
    designation: 'Data Scientist',
    startDate: '2024-01-22',
    avatar: '',
    checklist: [
      { item: 'Document Collection', completed: true },
      { item: 'IT Setup', completed: true },
      { item: 'Policy Acknowledgment', completed: false },
      { item: 'Team Introduction', completed: false },
      { item: 'Training Assignment', completed: false },
      { item: 'First Week Review', completed: false },
    ],
    aiRecommendations: [
      'Enroll in ML Ops certification program for infrastructure knowledge',
      'Provide access to internal data pipeline documentation',
      'Schedule 1:1 with Engineering lead for project alignment',
    ],
  },
  {
    id: '3',
    name: 'Asha Kumari',
    department: 'Human Resources',
    designation: 'HR Executive',
    startDate: '2024-01-15',
    avatar: '',
    checklist: [
      { item: 'Document Collection', completed: true },
      { item: 'IT Setup', completed: true },
      { item: 'Policy Acknowledgment', completed: true },
      { item: 'Team Introduction', completed: true },
      { item: 'Training Assignment', completed: true },
      { item: 'First Week Review', completed: true },
    ],
    aiRecommendations: [
      'All onboarding tasks completed — consider for buddy program mentor',
      'Recommend advanced compliance training for HR specialization',
    ],
  },
  {
    id: '4',
    name: 'Divya Patel',
    department: 'Marketing',
    designation: 'Marketing Coordinator',
    startDate: '2024-02-01',
    avatar: '',
    checklist: [
      { item: 'Document Collection', completed: true },
      { item: 'IT Setup', completed: false },
      { item: 'Policy Acknowledgment', completed: false },
      { item: 'Team Introduction', completed: false },
      { item: 'Training Assignment', completed: false },
      { item: 'First Week Review', completed: false },
    ],
    aiRecommendations: [
      'Pre-assign marketing analytics tool access before start date',
      'Schedule brand guidelines workshop in first week',
      'Connect with Content Lead Pooja Malhotra for project briefing',
    ],
  },
  {
    id: '5',
    name: 'Sanjay Reddy',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    startDate: '2024-02-05',
    avatar: '',
    checklist: [
      { item: 'Document Collection', completed: false },
      { item: 'IT Setup', completed: false },
      { item: 'Policy Acknowledgment', completed: false },
      { item: 'Team Introduction', completed: false },
      { item: 'Training Assignment', completed: false },
      { item: 'First Week Review', completed: false },
    ],
    aiRecommendations: [
      'Provision AWS and Kubernetes access prior to start date',
      'Assign security compliance training as mandatory first task',
      'Pair with DevOps lead Rohit Verma for infrastructure onboarding',
    ],
  },
]

export const shifts = [
  { id: '1', name: 'Morning Shift', startTime: '09:00', endTime: '18:00', graceTime: 15, employeesAssigned: 85 },
  { id: '2', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', graceTime: 10, employeesAssigned: 35 },
  { id: '3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', graceTime: 10, employeesAssigned: 20 },
  { id: '4', name: 'General Shift', startTime: '10:00', endTime: '19:00', graceTime: 15, employeesAssigned: 30 },
]

export const weeklyAttendance = [
  { day: 'Mon', present: 148, late: 12, absent: 10 },
  { day: 'Tue', present: 152, late: 8, absent: 10 },
  { day: 'Wed', present: 145, late: 15, absent: 10 },
  { day: 'Thu', present: 150, late: 10, absent: 10 },
  { day: 'Fri', present: 140, late: 18, absent: 12 },
  { day: 'Sat', present: 45, late: 5, absent: 120 },
]

export const geofenceCheckIns = [
  { id: '1', name: 'Rajesh Kumar', checkInTime: '09:00', location: 'Office - Bangalore', lat: 12.9716, lng: 77.5946, verified: true, distance: '0.1 km' },
  { id: '2', name: 'Priya Sharma', checkInTime: '09:15', location: 'Office - Delhi', lat: 28.6139, lng: 77.2090, verified: true, distance: '0.3 km' },
  { id: '3', name: 'Sneha Reddy', checkInTime: '10:00', location: 'Office - Hyderabad', lat: 17.3850, lng: 78.4867, verified: false, distance: '1.2 km' },
  { id: '4', name: 'Kavita Nair', checkInTime: '14:00', location: 'Office - Bangalore', lat: 12.9716, lng: 77.5946, verified: true, distance: '0.05 km' },
  { id: '5', name: 'Rohit Verma', checkInTime: '22:00', location: 'Office - Bangalore', lat: 12.9716, lng: 77.5946, verified: true, distance: '0.2 km' },
]

export const holidays = [
  { id: '1', name: 'Republic Day', date: '2024-01-26', type: 'national' },
  { id: '2', name: 'Holi', date: '2024-03-25', type: 'national' },
  { id: '3', name: 'Good Friday', date: '2024-03-29', type: 'national' },
  { id: '4', name: 'Eid ul-Fitr', date: '2024-04-10', type: 'national' },
  { id: '5', name: 'Independence Day', date: '2024-08-15', type: 'national' },
  { id: '6', name: 'Company Foundation Day', date: '2024-05-20', type: 'company' },
  { id: '7', name: 'Diwali', date: '2024-11-01', type: 'national' },
  { id: '8', name: 'Christmas', date: '2024-12-25', type: 'national' },
]

export const companyOKRs = [
  {
    id: '1',
    objective: 'Increase Annual Revenue by 30%',
    keyResults: [
      { title: 'Close 50 enterprise deals', progress: 72, target: 50, current: 36 },
      { title: 'Expand to 3 new markets', progress: 67, target: 3, current: 2 },
      { title: 'Improve customer retention to 95%', progress: 88, target: 95, current: 83.6 },
    ],
    overallProgress: 76,
  },
  {
    id: '2',
    objective: 'Enhance Product Quality & Innovation',
    keyResults: [
      { title: 'Reduce bug count by 40%', progress: 65, target: 40, current: 26 },
      { title: 'Launch 2 major product features', progress: 50, target: 2, current: 1 },
      { title: 'Achieve NPS score of 70+', progress: 83, target: 70, current: 58 },
    ],
    overallProgress: 66,
  },
  {
    id: '3',
    objective: 'Build a High-Performance Culture',
    keyResults: [
      { title: 'Achieve 90% employee satisfaction', progress: 82, target: 90, current: 73.8 },
      { title: 'Complete 100% performance reviews on time', progress: 85, target: 100, current: 85 },
      { title: 'Reduce attrition rate below 10%', progress: 58, target: 10, current: 5.8 },
    ],
    overallProgress: 75,
  },
]

export const individualOKRs = [
  { id: '1', employeeId: 'EMP001', name: 'Rajesh Kumar', objective: 'Complete microservices migration', progress: 85, quarter: 'Q1 2024' },
  { id: '2', employeeId: 'EMP005', name: 'Vikram Singh', objective: 'Achieve 120% of sales target', progress: 92, quarter: 'Q1 2024' },
  { id: '3', employeeId: 'EMP006', name: 'Sneha Reddy', objective: 'Deliver 3 product features', progress: 67, quarter: 'Q1 2024' },
  { id: '4', employeeId: 'EMP007', name: 'Arjun Mehta', objective: 'Launch product v2.0', progress: 78, quarter: 'Q1 2024' },
  { id: '5', employeeId: 'EMP013', name: 'Anita Desai', objective: 'Scale product team and launch 3 features', progress: 90, quarter: 'Q1 2024' },
  { id: '6', employeeId: 'EMP009', name: 'Rohit Verma', objective: 'Achieve 99.9% infrastructure uptime', progress: 95, quarter: 'Q1 2024' },
]

export const peerFeedbackData = [
  { id: '1', from: 'Sneha Reddy', to: 'Rajesh Kumar', sentiment: 'positive' as const, content: 'Rajesh has been an exceptional mentor. His technical guidance helped the team deliver the microservices migration ahead of schedule.', date: '2024-01-12' },
  { id: '2', from: 'Arjun Mehta', to: 'Anita Desai', sentiment: 'positive' as const, content: 'Anita provides clear strategic direction and empowers the team to make decisions. Her leadership style is truly inspiring.', date: '2024-01-10' },
  { id: '3', from: 'Rajesh Kumar', to: 'Sneha Reddy', sentiment: 'constructive' as const, content: 'Sneha is a solid contributor but could take more initiative in team discussions and code reviews.', date: '2024-01-08' },
  { id: '4', from: 'Kavita Nair', to: 'Suresh Nair', sentiment: 'positive' as const, content: 'Great support from Suresh during the holiday season rush. His calm approach helped the entire team stay focused.', date: '2024-01-05' },
  { id: '5', from: 'Vikram Singh', to: 'Ravi Krishnan', sentiment: 'neutral' as const, content: 'Ravi meets his targets consistently. Could benefit from more proactive client engagement strategies.', date: '2024-01-03' },
  { id: '6', from: 'Priya Sharma', to: 'Fatima Khan', sentiment: 'positive' as const, content: 'Fatima has quickly become an integral part of the HR team. Her onboarding process improvements are excellent.', date: '2024-01-02' },
]

export const highRiskEmployees = [
  { id: '1', name: 'Vikram Singh', department: 'Sales', riskScore: 35, keyFactors: ['Compensation below market', 'Declining engagement scores', 'Increased absenteeism'], recommendedActions: ['Review compensation package', 'Schedule career growth discussion', 'Assign mentor'] },
  { id: '2', name: 'Ravi Krishnan', department: 'Sales', riskScore: 55, keyFactors: ['Low performance ratings', 'Minimal peer interaction', 'Frequent late arrivals'], recommendedActions: ['Immediate manager check-in', 'Performance improvement plan', 'Flexible work arrangement'] },
  { id: '3', name: 'Sneha Reddy', department: 'Engineering', riskScore: 25, keyFactors: ['Limited career growth visibility', 'Below-market salary'], recommendedActions: ['Career path discussion', 'Salary benchmarking review'] },
  { id: '4', name: 'Sanjay Mishra', department: 'Engineering', riskScore: 18, keyFactors: ['Part-time contract concerns'], recommendedActions: ['Discuss full-time conversion timeline'] },
  { id: '5', name: 'Pooja Malhotra', department: 'Marketing', riskScore: 42, keyFactors: ['Contract position uncertainty', 'Limited team integration', 'No clear career path'], recommendedActions: ['Convert to full-time role', 'Team integration program', 'Define career milestones'] },
]

export const ratingDistribution = [
  { stars: 1, count: 3, percentage: 3 },
  { stars: 2, count: 8, percentage: 7 },
  { stars: 3, count: 25, percentage: 22 },
  { stars: 4, count: 52, percentage: 45 },
  { stars: 5, count: 27, percentage: 23 },
]
