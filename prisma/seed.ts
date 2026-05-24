import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Company ──────────────────────────────────────────────────────
  console.log('Creating company...')
  const companyAcme = await db.company.create({
    data: {
      name: 'Acme Corporation',
      code: 'ACME',
      industry: 'Technology',
      address: '42, Koramangala 5th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      phone: '+91-80-12345678',
      email: 'hr@acme.com',
      website: 'https://acme.example.com',
      gstNumber: '29AABCA1234F1Z5',
      panNumber: 'AABCA1234F',
      subscription: 'premium',
      isActive: true,
    },
  })

  // ─── Shifts ────────────────────────────────────────────────────────
  console.log('Creating shifts...')
  const morningShift = await db.shift.create({ data: { name: 'Morning Shift', startTime: '09:00', endTime: '18:00', graceTime: 15 } })
  const eveningShift = await db.shift.create({ data: { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', graceTime: 10 } })
  const nightShift = await db.shift.create({ data: { name: 'Night Shift', startTime: '22:00', endTime: '06:00', graceTime: 10 } })
  const generalShift = await db.shift.create({ data: { name: 'General Shift', startTime: '10:00', endTime: '19:00', graceTime: 15 } })

  // ─── Departments ───────────────────────────────────────────────────
  console.log('Creating departments...')
  const deptEngineering = await db.department.create({ data: { name: 'Engineering', head: 'Rajesh Kumar', description: 'Software development and infrastructure', budget: 2500000, companyId: companyAcme.id } })
  const deptHR = await db.department.create({ data: { name: 'Human Resources', head: 'Priya Sharma', description: 'HR operations, recruitment, and employee welfare', budget: 800000, companyId: companyAcme.id } })
  const deptFinance = await db.department.create({ data: { name: 'Finance', head: 'Amit Patel', description: 'Financial planning, accounting, and compliance', budget: 600000, companyId: companyAcme.id } })
  const deptMarketing = await db.department.create({ data: { name: 'Marketing', head: 'Neha Gupta', description: 'Brand management, digital marketing, and communications', budget: 1200000, companyId: companyAcme.id } })
  const deptSales = await db.department.create({ data: { name: 'Sales', head: 'Vikram Singh', description: 'Revenue generation and client relationships', budget: 1500000, companyId: companyAcme.id } })
  const deptOperations = await db.department.create({ data: { name: 'Operations', head: 'Deepak Joshi', description: 'Process optimization and operational efficiency', budget: 900000, companyId: companyAcme.id } })
  const deptProduct = await db.department.create({ data: { name: 'Product', head: 'Anita Desai', description: 'Product strategy, roadmap, and lifecycle management', budget: 1100000, companyId: companyAcme.id } })
  const deptSupport = await db.department.create({ data: { name: 'Customer Support', head: 'Suresh Nair', description: 'Customer service and technical support', budget: 700000, companyId: companyAcme.id } })

  // ─── Roles (with enhanced fields) ──────────────────────────────────
  console.log('Creating roles...')
  const roleSuperAdmin = await db.role.create({
    data: {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      level: 0,
      isSystem: true,
      dashboard: 'admin',
      menuItems: null, // null = all modules visible
      color: 'red',
      permissions: JSON.stringify({
        HR: { read: true, write: true, modify: true, delete: true, admin: true },
        Payroll: { read: true, write: true, modify: true, delete: true, admin: true },
        Attendance: { read: true, write: true, modify: true, delete: true, admin: true },
        Performance: { read: true, write: true, modify: true, delete: true, admin: true },
        Learning: { read: true, write: true, modify: true, delete: true, admin: true },
        Analytics: { read: true, write: true, modify: true, delete: true, admin: true },
      }),
    },
  })

  const roleHRAdmin = await db.role.create({
    data: {
      name: 'HR Admin',
      description: 'Manage employees, payroll, and HR operations',
      level: 1,
      isSystem: true,
      dashboard: 'hr',
      menuItems: JSON.stringify(['dashboard', 'employees', 'rbac', 'talent', 'attendance', 'payroll', 'performance', 'learning', 'analytics', 'selfservice']),
      color: 'purple',
      permissions: JSON.stringify({
        HR: { read: true, write: true, modify: true, delete: false, admin: false },
        Payroll: { read: true, write: true, modify: true, delete: false, admin: false },
        Attendance: { read: true, write: true, modify: false, delete: false, admin: false },
        Performance: { read: true, write: true, modify: true, delete: false, admin: false },
        Learning: { read: true, write: true, modify: false, delete: false, admin: false },
        Analytics: { read: true, write: false, modify: false, delete: false, admin: false },
      }),
    },
  })

  const rolePayrollSpec = await db.role.create({
    data: {
      name: 'Payroll Specialist',
      description: 'Process payroll, manage tax declarations',
      level: 2,
      isSystem: true,
      dashboard: 'payroll',
      menuItems: JSON.stringify(['dashboard', 'payroll', 'selfservice']),
      color: 'green',
      permissions: JSON.stringify({
        HR: { read: true, write: false, modify: false, delete: false, admin: false },
        Payroll: { read: true, write: true, modify: true, delete: false, admin: false },
        Attendance: { read: true, write: false, modify: false, delete: false, admin: false },
        Performance: { read: false, write: false, modify: false, delete: false, admin: false },
        Learning: { read: false, write: false, modify: false, delete: false, admin: false },
        Analytics: { read: true, write: false, modify: false, delete: false, admin: false },
      }),
    },
  })

  const roleManager = await db.role.create({
    data: {
      name: 'Department Manager',
      description: 'Manage team, approve leaves and expenses',
      level: 3,
      isSystem: true,
      dashboard: 'manager',
      menuItems: JSON.stringify(['dashboard', 'employees', 'attendance', 'performance', 'learning', 'selfservice']),
      color: 'blue',
      permissions: JSON.stringify({
        HR: { read: true, write: false, modify: true, delete: false, admin: false },
        Payroll: { read: true, write: false, modify: false, delete: false, admin: false },
        Attendance: { read: true, write: true, modify: true, delete: false, admin: false },
        Performance: { read: true, write: true, modify: true, delete: false, admin: false },
        Learning: { read: true, write: false, modify: false, delete: false, admin: false },
        Analytics: { read: true, write: false, modify: false, delete: false, admin: false },
      }),
    },
  })

  const roleEmployee = await db.role.create({
    data: {
      name: 'Employee',
      description: 'Self-service access to personal data',
      level: 4,
      isSystem: true,
      dashboard: 'employee',
      menuItems: JSON.stringify(['dashboard', 'attendance', 'selfservice']),
      color: 'teal',
      permissions: JSON.stringify({
        HR: { read: true, write: false, modify: false, delete: false, admin: false },
        Payroll: { read: true, write: false, modify: false, delete: false, admin: false },
        Attendance: { read: true, write: false, modify: false, delete: false, admin: false },
        Performance: { read: true, write: false, modify: false, delete: false, admin: false },
        Learning: { read: true, write: true, modify: false, delete: false, admin: false },
        Analytics: { read: false, write: false, modify: false, delete: false, admin: false },
      }),
    },
  })

  const roleRecruiter = await db.role.create({
    data: {
      name: 'Recruiter',
      description: 'Manage job postings and candidate pipeline',
      level: 2,
      isSystem: true,
      dashboard: 'recruiter',
      menuItems: JSON.stringify(['dashboard', 'talent', 'selfservice']),
      color: 'orange',
      permissions: JSON.stringify({
        HR: { read: true, write: true, modify: true, delete: false, admin: false },
        Payroll: { read: false, write: false, modify: false, delete: false, admin: false },
        Attendance: { read: false, write: false, modify: false, delete: false, admin: false },
        Performance: { read: false, write: false, modify: false, delete: false, admin: false },
        Learning: { read: true, write: false, modify: false, delete: false, admin: false },
        Analytics: { read: true, write: false, modify: false, delete: false, admin: false },
      }),
    },
  })

  const roleLDManager = await db.role.create({
    data: {
      name: 'L&D Manager',
      description: 'Manage training programs and skill development',
      level: 2,
      isSystem: true,
      dashboard: 'learning',
      menuItems: JSON.stringify(['dashboard', 'learning', 'performance', 'selfservice']),
      color: 'indigo',
      permissions: JSON.stringify({
        HR: { read: true, write: false, modify: false, delete: false, admin: false },
        Payroll: { read: false, write: false, modify: false, delete: false, admin: false },
        Attendance: { read: true, write: false, modify: false, delete: false, admin: false },
        Performance: { read: true, write: true, modify: true, delete: false, admin: false },
        Learning: { read: true, write: true, modify: true, delete: true, admin: false },
        Analytics: { read: true, write: false, modify: false, delete: false, admin: false },
      }),
    },
  })

  // ─── Employees ─────────────────────────────────────────────────────
  console.log('Creating employees...')
  const employees = [
    { employeeId: 'EMP001', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@company.com', phone: '+91-9876543210', department: 'Engineering', designation: 'Senior Software Engineer', jobTitle: 'Tech Lead', contractType: 'full-time', status: 'active', joinDate: '2021-03-15', salary: 1800000, gender: 'Male', dateOfBirth: '1988-05-12', address: '42, Koramangala 5th Block, Bangalore', bankAccount: 'XXXX-XXXX-1234', panNumber: 'ABCPK1234L', pfNumber: 'PF/001/2021', emergencyContact: '+91-9876500001', companyId: companyAcme.id },
    { employeeId: 'EMP002', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@company.com', phone: '+91-9876543211', department: 'Human Resources', designation: 'HR Manager', jobTitle: 'HR Manager', contractType: 'full-time', status: 'active', joinDate: '2020-06-01', salary: 1500000, gender: 'Female', dateOfBirth: '1990-08-22', address: '15, HSR Layout Sector 2, Bangalore', bankAccount: 'XXXX-XXXX-5678', panNumber: 'DEFPS5678M', pfNumber: 'PF/002/2020', emergencyContact: '+91-9876500002', companyId: companyAcme.id },
    { employeeId: 'EMP003', firstName: 'Amit', lastName: 'Patel', email: 'amit.patel@company.com', phone: '+91-9876543212', department: 'Finance', designation: 'Finance Manager', jobTitle: 'Finance Manager', contractType: 'full-time', status: 'active', joinDate: '2019-11-20', salary: 1600000, gender: 'Male', dateOfBirth: '1985-11-03', address: '78, Powai Lake Road, Mumbai', bankAccount: 'XXXX-XXXX-9012', panNumber: 'GHIAP9012N', pfNumber: 'PF/003/2019', emergencyContact: '+91-9876500003', companyId: companyAcme.id },
    { employeeId: 'EMP004', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@company.com', phone: '+91-9876543213', department: 'Marketing', designation: 'Marketing Director', jobTitle: 'Marketing Director', contractType: 'full-time', status: 'active', joinDate: '2020-01-10', salary: 2000000, gender: 'Female', dateOfBirth: '1987-02-18', address: '23, Vasant Kunj, New Delhi', bankAccount: 'XXXX-XXXX-3456', panNumber: 'JKLNG3456O', pfNumber: 'PF/004/2020', emergencyContact: '+91-9876500004', companyId: companyAcme.id },
    { employeeId: 'EMP005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@company.com', phone: '+91-9876543214', department: 'Sales', designation: 'Sales Head', jobTitle: 'VP Sales', contractType: 'full-time', status: 'active', joinDate: '2018-08-05', salary: 2500000, gender: 'Male', dateOfBirth: '1983-07-09', address: '56, Bandra West, Mumbai', bankAccount: 'XXXX-XXXX-7890', panNumber: 'MNOPS7890P', pfNumber: 'PF/005/2018', emergencyContact: '+91-9876500005', companyId: companyAcme.id },
    { employeeId: 'EMP006', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@company.com', phone: '+91-9876543215', department: 'Engineering', designation: 'Software Engineer', jobTitle: 'Full Stack Developer', contractType: 'full-time', status: 'active', joinDate: '2022-07-12', salary: 1200000, gender: 'Female', dateOfBirth: '1993-04-25', address: '89, Madhapur, Hyderabad', bankAccount: 'XXXX-XXXX-2345', panNumber: 'QRSTS2345Q', pfNumber: 'PF/006/2022', emergencyContact: '+91-9876500006', companyId: companyAcme.id },
    { employeeId: 'EMP007', firstName: 'Arjun', lastName: 'Mehta', email: 'arjun.mehta@company.com', phone: '+91-9876543216', department: 'Product', designation: 'Product Manager', jobTitle: 'Senior PM', contractType: 'full-time', status: 'active', joinDate: '2021-09-25', salary: 1700000, gender: 'Male', dateOfBirth: '1989-12-14', address: '34, Indiranagar, Bangalore', bankAccount: 'XXXX-XXXX-6789', panNumber: 'UVWAM6789R', pfNumber: 'PF/007/2021', emergencyContact: '+91-9876500007', companyId: companyAcme.id },
    { employeeId: 'EMP008', firstName: 'Kavita', lastName: 'Nair', email: 'kavita.nair@company.com', phone: '+91-9876543217', department: 'Customer Support', designation: 'Support Lead', jobTitle: 'Team Lead', contractType: 'full-time', status: 'active', joinDate: '2022-01-18', salary: 900000, gender: 'Female', dateOfBirth: '1991-09-07', address: '12, Kakkanad, Kochi', bankAccount: 'XXXX-XXXX-0123', panNumber: 'XYZKN0123S', pfNumber: 'PF/008/2022', emergencyContact: '+91-9876500008', companyId: companyAcme.id },
    { employeeId: 'EMP009', firstName: 'Rohit', lastName: 'Verma', email: 'rohit.verma@company.com', phone: '+91-9876543218', department: 'Engineering', designation: 'DevOps Engineer', jobTitle: 'Senior DevOps', contractType: 'full-time', status: 'active', joinDate: '2021-05-30', salary: 1500000, gender: 'Male', dateOfBirth: '1990-06-30', address: '67, Whitefield, Bangalore', bankAccount: 'XXXX-XXXX-4567', panNumber: 'ABCRV4567T', pfNumber: 'PF/009/2021', emergencyContact: '+91-9876500009', companyId: companyAcme.id },
    { employeeId: 'EMP010', firstName: 'Meera', lastName: 'Iyer', email: 'meera.iyer@company.com', phone: '+91-9876543219', department: 'Human Resources', designation: 'L&D Specialist', jobTitle: 'Training Coordinator', contractType: 'full-time', status: 'active', joinDate: '2023-02-14', salary: 1000000, gender: 'Female', dateOfBirth: '1992-01-19', address: '45, Egmore, Chennai', bankAccount: 'XXXX-XXXX-8901', panNumber: 'DEFMI8901U', pfNumber: 'PF/010/2023', emergencyContact: '+91-9876500010', companyId: companyAcme.id },
    { employeeId: 'EMP011', firstName: 'Suresh', lastName: 'Nair', email: 'suresh.nair@company.com', phone: '+91-9876543220', department: 'Customer Support', designation: 'Support Manager', jobTitle: 'CS Manager', contractType: 'full-time', status: 'active', joinDate: '2020-04-08', salary: 1300000, gender: 'Male', dateOfBirth: '1986-10-28', address: '90, Salt Lake, Kolkata', bankAccount: 'XXXX-XXXX-2346', panNumber: 'GHISN2346V', pfNumber: 'PF/011/2020', emergencyContact: '+91-9876500011', companyId: companyAcme.id },
    { employeeId: 'EMP012', firstName: 'Deepak', lastName: 'Joshi', email: 'deepak.joshi@company.com', phone: '+91-9876543221', department: 'Operations', designation: 'Operations Manager', jobTitle: 'Ops Manager', contractType: 'full-time', status: 'active', joinDate: '2019-12-01', salary: 1400000, gender: 'Male', dateOfBirth: '1984-03-15', address: '23, Vastrapur, Ahmedabad', bankAccount: 'XXXX-XXXX-6790', panNumber: 'JKLDJ6790W', pfNumber: 'PF/012/2019', emergencyContact: '+91-9876500012', companyId: companyAcme.id },
    { employeeId: 'EMP013', firstName: 'Anita', lastName: 'Desai', email: 'anita.desai@company.com', phone: '+91-9876543222', department: 'Product', designation: 'VP Product', jobTitle: 'VP Product', contractType: 'full-time', status: 'active', joinDate: '2018-03-20', salary: 2800000, gender: 'Female', dateOfBirth: '1980-08-11', address: '56, Jubilee Hills, Hyderabad', bankAccount: 'XXXX-XXXX-0134', panNumber: 'MNOPD0134X', pfNumber: 'PF/013/2018', emergencyContact: '+91-9876500013', companyId: companyAcme.id },
    { employeeId: 'EMP014', firstName: 'Karthik', lastName: 'Rao', email: 'karthik.rao@company.com', phone: '+91-9876543223', department: 'Engineering', designation: 'Junior Developer', jobTitle: 'Frontend Developer', contractType: 'full-time', status: 'onboarding', joinDate: '2024-01-08', salary: 700000, gender: 'Male', dateOfBirth: '1998-11-05', address: '78, Electronic City, Bangalore', bankAccount: 'XXXX-XXXX-4578', panNumber: 'QRSTK4578Y', pfNumber: 'PF/014/2024', emergencyContact: '+91-9876500014', companyId: companyAcme.id },
    { employeeId: 'EMP015', firstName: 'Pooja', lastName: 'Malhotra', email: 'pooja.malhotra@company.com', phone: '+91-9876543224', department: 'Marketing', designation: 'Content Strategist', jobTitle: 'Content Lead', contractType: 'contract', status: 'active', joinDate: '2023-06-15', salary: 1100000, gender: 'Female', dateOfBirth: '1991-05-23', address: '34, Sector 29, Gurugram', bankAccount: 'XXXX-XXXX-8912', panNumber: 'UVWPM8912Z', pfNumber: 'PF/015/2023', emergencyContact: '+91-9876500015', companyId: companyAcme.id },
    { employeeId: 'EMP016', firstName: 'Ravi', lastName: 'Krishnan', email: 'ravi.krishnan@company.com', phone: '+91-9876543225', department: 'Sales', designation: 'Sales Executive', jobTitle: 'Sales Executive', contractType: 'full-time', status: 'inactive', joinDate: '2022-03-01', salary: 800000, gender: 'Male', dateOfBirth: '1995-07-19', address: '12, T. Nagar, Chennai', bankAccount: 'XXXX-XXXX-3457', panNumber: 'ABCRK3457A', pfNumber: 'PF/016/2022', emergencyContact: '+91-9876500016', companyId: companyAcme.id },
    { employeeId: 'EMP017', firstName: 'Fatima', lastName: 'Khan', email: 'fatima.khan@company.com', phone: '+91-9876543226', department: 'Human Resources', designation: 'HR Executive', jobTitle: 'HR Executive', contractType: 'full-time', status: 'active', joinDate: '2023-04-10', salary: 750000, gender: 'Female', dateOfBirth: '1994-09-02', address: '56, Banjara Hills, Hyderabad', bankAccount: 'XXXX-XXXX-7891', panNumber: 'DEFKF7891B', pfNumber: 'PF/017/2023', emergencyContact: '+91-9876500017', companyId: companyAcme.id },
    { employeeId: 'EMP018', firstName: 'Sanjay', lastName: 'Mishra', email: 'sanjay.mishra@company.com', phone: '+91-9876543227', department: 'Engineering', designation: 'QA Engineer', jobTitle: 'Senior QA', contractType: 'part-time', status: 'active', joinDate: '2022-09-05', salary: 950000, gender: 'Male', dateOfBirth: '1990-12-11', address: '89, Hinjewadi, Pune', bankAccount: 'XXXX-XXXX-1235', panNumber: 'GHISM1235C', pfNumber: 'PF/018/2022', emergencyContact: '+91-9876500018', companyId: companyAcme.id },
    { employeeId: 'EMP019', firstName: 'Divya', lastName: 'Menon', email: 'divya.menon@company.com', phone: '+91-9876543228', department: 'Engineering', designation: 'Software Engineer', jobTitle: 'Backend Developer', contractType: 'intern', status: 'active', joinDate: '2024-01-02', salary: 400000, gender: 'Female', dateOfBirth: '1996-03-28', address: '23, Technopark, Trivandrum', bankAccount: 'XXXX-XXXX-5679', panNumber: 'JKLDM5679D', pfNumber: 'PF/019/2024', emergencyContact: '+91-9876500019', companyId: companyAcme.id },
    { employeeId: 'EMP020', firstName: 'Arun', lastName: 'Pillai', email: 'arun.pillai@company.com', phone: '+91-9876543229', department: 'Finance', designation: 'Accountant', jobTitle: 'Senior Accountant', contractType: 'full-time', status: 'exited', joinDate: '2019-05-20', salary: 1100000, gender: 'Male', dateOfBirth: '1987-06-14', address: '45, MG Road, Kochi', bankAccount: 'XXXX-XXXX-9013', panNumber: 'MNOPA9013E', pfNumber: 'PF/020/2019', exitDate: '2023-12-31', emergencyContact: '+91-9876500020', companyId: companyAcme.id },
  ]

  const createdEmployees: Record<string, string> = {}
  for (const emp of employees) {
    const created = await db.employee.create({ data: emp })
    createdEmployees[emp.employeeId] = created.id
    console.log(`  Created employee: ${emp.employeeId} - ${emp.firstName} ${emp.lastName}`)
  }

  // ─── Users (Authentication Accounts) ──────────────────────────────
  console.log('Creating user accounts...')
  const saltRounds = 10

  const users = [
    { email: 'admin@company.com', password: 'Admin@2024', name: 'System Administrator', roleId: roleSuperAdmin.id, employeeId: null, companyId: companyAcme.id, isActive: true },
    { email: 'priya.sharma@company.com', password: 'HRAdmin@2024', name: 'Priya Sharma', roleId: roleHRAdmin.id, employeeId: createdEmployees['EMP002'], companyId: companyAcme.id, isActive: true },
    { email: 'amit.patel@company.com', password: 'Payroll@2024', name: 'Amit Patel', roleId: rolePayrollSpec.id, employeeId: createdEmployees['EMP003'], companyId: companyAcme.id, isActive: true },
    { email: 'rajesh.kumar@company.com', password: 'Manager@2024', name: 'Rajesh Kumar', roleId: roleManager.id, employeeId: createdEmployees['EMP001'], companyId: companyAcme.id, isActive: true },
    { email: 'anita.desai@company.com', password: 'Manager@2024', name: 'Anita Desai', roleId: roleManager.id, employeeId: createdEmployees['EMP013'], companyId: companyAcme.id, isActive: true },
    { email: 'vikram.singh@company.com', password: 'Manager@2024', name: 'Vikram Singh', roleId: roleManager.id, employeeId: createdEmployees['EMP005'], companyId: companyAcme.id, isActive: true },
    { email: 'sneha.reddy@company.com', password: 'Employee@2024', name: 'Sneha Reddy', roleId: roleEmployee.id, employeeId: createdEmployees['EMP006'], companyId: companyAcme.id, isActive: true },
    { email: 'karthik.rao@company.com', password: 'Employee@2024', name: 'Karthik Rao', roleId: roleEmployee.id, employeeId: createdEmployees['EMP014'], companyId: companyAcme.id, isActive: true },
    { email: 'rohit.verma@company.com', password: 'Employee@2024', name: 'Rohit Verma', roleId: roleEmployee.id, employeeId: createdEmployees['EMP009'], companyId: companyAcme.id, isActive: true },
    { email: 'fatima.khan@company.com', password: 'Recruiter@2024', name: 'Fatima Khan', roleId: roleRecruiter.id, employeeId: createdEmployees['EMP017'], companyId: companyAcme.id, isActive: true },
    { email: 'meera.iyer@company.com', password: 'LDManager@2024', name: 'Meera Iyer', roleId: roleLDManager.id, employeeId: createdEmployees['EMP010'], companyId: companyAcme.id, isActive: true },
  ]

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, saltRounds)
    await db.user.create({
      data: {
        email: user.email,
        passwordHash,
        name: user.name,
        roleId: user.roleId,
        employeeId: user.employeeId,
        companyId: user.companyId,
        isActive: user.isActive,
      },
    })
    console.log(`  Created user: ${user.email} - Role: ${user.name}`)
  }

  // ─── Skills ────────────────────────────────────────────────────────
  console.log('Creating skills...')
  const skillsData = [
    { name: 'React', category: 'Frontend', description: 'React.js library for building user interfaces' },
    { name: 'Node.js', category: 'Backend', description: 'Server-side JavaScript runtime' },
    { name: 'Python', category: 'Backend', description: 'General-purpose programming language' },
    { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services cloud platform' },
    { name: 'Machine Learning', category: 'Data Science', description: 'ML algorithms and model training' },
    { name: 'Project Management', category: 'Management', description: 'Agile and waterfall project management' },
    { name: 'Data Analysis', category: 'Analytics', description: 'Statistical analysis and data visualization' },
    { name: 'Leadership', category: 'Soft Skills', description: 'Team leadership and management' },
    { name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript' },
    { name: 'Docker', category: 'DevOps', description: 'Containerization platform' },
    { name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration system' },
    { name: 'SQL', category: 'Database', description: 'Structured Query Language' },
    { name: 'Communication', category: 'Soft Skills', description: 'Verbal and written communication' },
    { name: 'Digital Marketing', category: 'Marketing', description: 'Online marketing strategies and tools' },
    { name: 'Financial Analysis', category: 'Finance', description: 'Financial modeling and reporting' },
  ]
  const createdSkills: Record<string, string> = {}
  for (const skill of skillsData) {
    const created = await db.skill.create({ data: skill })
    createdSkills[skill.name] = created.id
  }

  // ─── Employee Skills ───────────────────────────────────────────────
  console.log('Assigning skills to employees...')
  const employeeSkills = [
    { employeeId: createdEmployees['EMP001'], skillId: createdSkills['React'], proficiency: 'expert', certified: true },
    { employeeId: createdEmployees['EMP001'], skillId: createdSkills['Node.js'], proficiency: 'expert', certified: true },
    { employeeId: createdEmployees['EMP001'], skillId: createdSkills['TypeScript'], proficiency: 'advanced', certified: true },
    { employeeId: createdEmployees['EMP006'], skillId: createdSkills['React'], proficiency: 'advanced', certified: true },
    { employeeId: createdEmployees['EMP006'], skillId: createdSkills['Node.js'], proficiency: 'intermediate', certified: false },
    { employeeId: createdEmployees['EMP009'], skillId: createdSkills['AWS'], proficiency: 'expert', certified: true },
    { employeeId: createdEmployees['EMP009'], skillId: createdSkills['Docker'], proficiency: 'advanced', certified: true },
    { employeeId: createdEmployees['EMP009'], skillId: createdSkills['Kubernetes'], proficiency: 'advanced', certified: true },
    { employeeId: createdEmployees['EMP007'], skillId: createdSkills['Project Management'], proficiency: 'advanced', certified: true },
    { employeeId: createdEmployees['EMP007'], skillId: createdSkills['Communication'], proficiency: 'expert', certified: false },
    { employeeId: createdEmployees['EMP005'], skillId: createdSkills['Leadership'], proficiency: 'advanced', certified: true },
    { employeeId: createdEmployees['EMP005'], skillId: createdSkills['Communication'], proficiency: 'expert', certified: true },
    { employeeId: createdEmployees['EMP013'], skillId: createdSkills['Leadership'], proficiency: 'expert', certified: true },
    { employeeId: createdEmployees['EMP013'], skillId: createdSkills['Project Management'], proficiency: 'expert', certified: true },
  ]
  for (const es of employeeSkills) {
    await db.employeeSkill.create({ data: es })
  }

  // ─── Attendance ────────────────────────────────────────────────────
  console.log('Creating attendance records...')
  const attendanceRecords = [
    { employeeId: createdEmployees['EMP001'], date: '2024-01-15', checkIn: '09:00', checkOut: '18:30', status: 'present', shift: 'morning', location: 'Office - Bangalore' },
    { employeeId: createdEmployees['EMP002'], date: '2024-01-15', checkIn: '09:15', checkOut: '18:00', status: 'present', shift: 'morning', location: 'Office - Delhi' },
    { employeeId: createdEmployees['EMP003'], date: '2024-01-15', checkIn: '09:30', checkOut: '18:15', status: 'late', shift: 'morning', location: 'Office - Mumbai' },
    { employeeId: createdEmployees['EMP005'], date: '2024-01-15', checkIn: null, checkOut: null, status: 'absent', shift: 'morning', location: null },
    { employeeId: createdEmployees['EMP006'], date: '2024-01-15', checkIn: '10:00', checkOut: '19:00', status: 'late', shift: 'morning', location: 'Office - Hyderabad' },
    { employeeId: createdEmployees['EMP008'], date: '2024-01-15', checkIn: '14:00', checkOut: '22:00', status: 'present', shift: 'evening', location: 'Office - Bangalore' },
    { employeeId: createdEmployees['EMP009'], date: '2024-01-15', checkIn: '22:00', checkOut: '06:00', status: 'present', shift: 'night', location: 'Office - Bangalore' },
    { employeeId: createdEmployees['EMP010'], date: '2024-01-15', checkIn: '09:00', checkOut: '13:00', status: 'half-day', shift: 'morning', location: 'Office - Delhi' },
  ]
  for (const att of attendanceRecords) {
    await db.attendance.create({ data: att })
  }

  // ─── Leaves ────────────────────────────────────────────────────────
  console.log('Creating leave records...')
  const leaves = [
    { employeeId: createdEmployees['EMP001'], leaveType: 'casual', startDate: '2024-01-20', endDate: '2024-01-22', days: 3, reason: 'Personal work', status: 'approved', approvedBy: 'Priya Sharma' },
    { employeeId: createdEmployees['EMP005'], leaveType: 'sick', startDate: '2024-01-15', endDate: '2024-01-16', days: 2, reason: 'Medical appointment', status: 'approved', approvedBy: 'Priya Sharma' },
    { employeeId: createdEmployees['EMP006'], leaveType: 'earned', startDate: '2024-02-01', endDate: '2024-02-05', days: 5, reason: 'Vacation', status: 'pending', approvedBy: null },
    { employeeId: createdEmployees['EMP007'], leaveType: 'casual', startDate: '2024-01-25', endDate: '2024-01-25', days: 1, reason: 'Family event', status: 'pending', approvedBy: null },
    { employeeId: createdEmployees['EMP008'], leaveType: 'maternity', startDate: '2024-03-01', endDate: '2024-05-31', days: 92, reason: 'Maternity leave', status: 'approved', approvedBy: 'Priya Sharma' },
    { employeeId: createdEmployees['EMP012'], leaveType: 'casual', startDate: '2024-01-18', endDate: '2024-01-18', days: 1, reason: 'Personal', status: 'rejected', approvedBy: 'Priya Sharma', comments: 'Insufficient leave balance' },
  ]
  for (const leave of leaves) {
    await db.leave.create({ data: leave })
  }

  // ─── Payroll ───────────────────────────────────────────────────────
  console.log('Creating payroll records...')
  const payrolls = [
    { employeeId: createdEmployees['EMP001'], month: 'January', year: 2024, basicSalary: 75000, hra: 30000, da: 15000, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 130000, pf: 9000, esi: 1755, tax: 15000, professionalTax: 200, totalDeductions: 25955, netPay: 104045, status: 'paid' },
    { employeeId: createdEmployees['EMP002'], month: 'January', year: 2024, basicSalary: 62500, hra: 25000, da: 12500, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 110000, pf: 7500, esi: 1463, tax: 12000, professionalTax: 200, totalDeductions: 21163, netPay: 88837, status: 'paid' },
    { employeeId: createdEmployees['EMP003'], month: 'January', year: 2024, basicSalary: 66667, hra: 26667, da: 13333, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 116667, pf: 8000, esi: 1562, tax: 13000, professionalTax: 200, totalDeductions: 22762, netPay: 93905, status: 'processed' },
    { employeeId: createdEmployees['EMP005'], month: 'January', year: 2024, basicSalary: 104167, hra: 41667, da: 20833, conveyance: 5000, medical: 5000, bonus: 20000, grossPay: 196667, pf: 12500, esi: 2646, tax: 28000, professionalTax: 200, totalDeductions: 43346, netPay: 153321, status: 'paid' },
    { employeeId: createdEmployees['EMP006'], month: 'January', year: 2024, basicSalary: 50000, hra: 20000, da: 10000, conveyance: 5000, medical: 5000, bonus: 0, grossPay: 90000, pf: 6000, esi: 1197, tax: 8000, professionalTax: 200, totalDeductions: 15397, netPay: 74603, status: 'pending' },
  ]
  for (const pr of payrolls) {
    await db.payroll.create({ data: pr })
  }

  // ─── Expenses ──────────────────────────────────────────────────────
  console.log('Creating expense records...')
  const expenses = [
    { employeeId: createdEmployees['EMP001'], category: 'travel', amount: 15000, description: 'Client visit to Mumbai', date: '2024-01-10', status: 'approved', approvedBy: 'Priya Sharma' },
    { employeeId: createdEmployees['EMP005'], category: 'accommodation', amount: 8500, description: 'Hotel stay for conference', date: '2024-01-08', status: 'reimbursed', approvedBy: 'Amit Patel' },
    { employeeId: createdEmployees['EMP006'], category: 'equipment', amount: 25000, description: 'External monitor for development', date: '2024-01-12', status: 'pending', approvedBy: null },
    { employeeId: createdEmployees['EMP007'], category: 'food', amount: 3200, description: 'Team lunch during sprint planning', date: '2024-01-11', status: 'approved', approvedBy: 'Priya Sharma' },
    { employeeId: createdEmployees['EMP009'], category: 'travel', amount: 4500, description: 'Cloud conference ticket', date: '2024-01-14', status: 'rejected', approvedBy: 'Amit Patel', comments: 'Not pre-approved' },
  ]
  for (const exp of expenses) {
    await db.expense.create({ data: exp })
  }

  // ─── Performance ───────────────────────────────────────────────────
  console.log('Creating performance records...')
  const performances = [
    { employeeId: createdEmployees['EMP001'], reviewPeriod: 'Q4 2023', rating: 4.5, objectives: JSON.stringify(['Complete microservices migration', 'Mentor 2 junior developers']), achievements: 'Successfully migrated 3 services to microservices architecture', feedback: 'Exceptional technical leadership', selfReview: 'Proud of the team progress this quarter', attritionRisk: 0.15, status: 'completed', reviewerId: createdEmployees['EMP013'] },
    { employeeId: createdEmployees['EMP002'], reviewPeriod: 'Q4 2023', rating: 4.2, objectives: JSON.stringify(['Implement new HR policies', 'Reduce hiring TAT by 20%']), achievements: 'Implemented 5 new HR policies, reduced TAT by 25%', feedback: 'Strong HR process improvements', selfReview: 'Good progress on all objectives', attritionRisk: 0.10, status: 'completed', reviewerId: createdEmployees['EMP002'] },
    { employeeId: createdEmployees['EMP005'], reviewPeriod: 'Q4 2023', rating: 4.0, objectives: JSON.stringify(['Achieve 120% sales target', 'Expand to 3 new territories']), achievements: 'Achieved 115% of target, expanded to 2 territories', feedback: 'Good performance but engagement concerns', selfReview: 'Challenging quarter with market headwinds', attritionRisk: 0.35, status: 'completed', reviewerId: createdEmployees['EMP005'] },
    { employeeId: createdEmployees['EMP006'], reviewPeriod: 'Q4 2023', rating: 3.8, objectives: JSON.stringify(['Deliver 3 product features', 'Complete AWS certification']), achievements: 'Delivered 2 features, AWS certification in progress', feedback: 'Solid contributor, needs more initiative', selfReview: 'Need to improve time management', attritionRisk: 0.25, status: 'in-review', reviewerId: createdEmployees['EMP001'] },
    { employeeId: createdEmployees['EMP007'], reviewPeriod: 'Q4 2023', rating: 4.3, objectives: JSON.stringify(['Launch product v2.0', 'Improve NPS by 15 points']), achievements: 'Launched v2.0 on time, NPS improved by 12 points', feedback: 'Outstanding product vision', selfReview: 'Great team collaboration this quarter', attritionRisk: 0.20, status: 'completed', reviewerId: createdEmployees['EMP013'] },
    { employeeId: createdEmployees['EMP013'], reviewPeriod: 'Q4 2023', rating: 4.7, objectives: JSON.stringify(['Scale product team', 'Launch 3 new features', 'Improve cross-team collaboration']), achievements: 'Hired 5 PMs, launched 4 features, improved collaboration score by 30%', feedback: 'Exceptional leadership and strategic thinking', selfReview: 'Focused on building a strong team culture', attritionRisk: 0.05, status: 'completed', reviewerId: createdEmployees['EMP013'] },
  ]
  for (const perf of performances) {
    await db.performance.create({ data: perf })
  }

  // ─── Assets ────────────────────────────────────────────────────────
  console.log('Creating assets...')
  const assets = [
    { employeeId: createdEmployees['EMP001'], assetType: 'laptop', assetName: 'MacBook Pro 16"', serialNo: 'MBP2023-001', assignedDate: '2023-01-15', condition: 'good', status: 'assigned' },
    { employeeId: createdEmployees['EMP001'], assetType: 'access-card', assetName: 'Proximity Card', serialNo: 'AC-00145', assignedDate: '2023-01-15', condition: 'new', status: 'assigned' },
    { employeeId: createdEmployees['EMP005'], assetType: 'phone', assetName: 'iPhone 15 Pro', serialNo: 'IP15-0089', assignedDate: '2023-09-01', condition: 'good', status: 'assigned' },
    { employeeId: createdEmployees['EMP006'], assetType: 'laptop', assetName: 'Dell XPS 15', serialNo: 'DXPS-00567', assignedDate: '2022-07-12', condition: 'fair', status: 'assigned' },
    { employeeId: createdEmployees['EMP009'], assetType: 'laptop', assetName: 'ThinkPad X1 Carbon', serialNo: 'TPX1-00234', assignedDate: '2023-03-01', condition: 'good', status: 'assigned' },
    { employeeId: createdEmployees['EMP014'], assetType: 'laptop', assetName: 'MacBook Air M2', serialNo: 'MBA-00987', assignedDate: '2024-01-08', condition: 'new', status: 'assigned' },
  ]
  for (const asset of assets) {
    await db.asset.create({ data: asset })
  }

  // ─── Documents ─────────────────────────────────────────────────────
  console.log('Creating documents...')
  const documents = [
    { employeeId: createdEmployees['EMP001'], docType: 'id-proof', title: 'Aadhaar Card', accessLevel: 'hr-only', uploadedBy: 'HR Department' },
    { employeeId: createdEmployees['EMP001'], docType: 'contract', title: 'Employment Agreement', accessLevel: 'hr-only', uploadedBy: 'HR Department' },
    { employeeId: createdEmployees['EMP001'], docType: 'certificate', title: 'AWS Solutions Architect', accessLevel: 'public', uploadedBy: 'Rajesh Kumar' },
    { employeeId: createdEmployees['EMP002'], docType: 'id-proof', title: 'Aadhaar Card', accessLevel: 'hr-only', uploadedBy: 'HR Department' },
    { employeeId: createdEmployees['EMP002'], docType: 'contract', title: 'Employment Agreement', accessLevel: 'hr-only', uploadedBy: 'HR Department' },
    { employeeId: createdEmployees['EMP006'], docType: 'id-proof', title: 'Aadhaar Card', accessLevel: 'hr-only', uploadedBy: 'HR Department' },
    { employeeId: createdEmployees['EMP006'], docType: 'contract', title: 'Employment Agreement', accessLevel: 'hr-only', uploadedBy: 'HR Department' },
    { employeeId: createdEmployees['EMP014'], docType: 'id-proof', title: 'Aadhaar Card', accessLevel: 'hr-only', uploadedBy: 'HR Department' },
  ]
  for (const doc of documents) {
    await db.document.create({ data: doc })
  }

  // ─── Courses ───────────────────────────────────────────────────────
  console.log('Creating courses...')
  const courses = [
    { title: 'Advanced React Patterns', description: 'Master advanced React patterns including compound components, render props, and hooks', category: 'Engineering', duration: 20, provider: 'Udemy', skills: JSON.stringify(['React', 'TypeScript']) },
    { title: 'Machine Learning Fundamentals', description: 'Build a strong foundation in machine learning algorithms and techniques', category: 'Data Science', duration: 40, provider: 'Coursera', skills: JSON.stringify(['Python', 'ML']) },
    { title: 'Leadership & Management', description: 'Develop essential leadership skills for managing teams effectively', category: 'Management', duration: 15, provider: 'LinkedIn Learning', skills: JSON.stringify(['Leadership', 'Communication']) },
    { title: 'Cloud Architecture (AWS)', description: 'Design and implement scalable cloud architectures on AWS', category: 'Engineering', duration: 30, provider: 'A Cloud Guru', skills: JSON.stringify(['AWS', 'DevOps']) },
    { title: 'Digital Marketing Mastery', description: 'Comprehensive digital marketing strategies and analytics', category: 'Marketing', duration: 25, provider: 'HubSpot Academy', skills: JSON.stringify(['Marketing', 'Analytics']) },
    { title: 'Financial Analysis & Reporting', description: 'Learn financial analysis techniques and reporting best practices', category: 'Finance', duration: 18, provider: 'Coursera', skills: JSON.stringify(['Finance', 'Analysis']) },
    { title: 'Effective Communication Skills', description: 'Improve workplace communication and presentation skills', category: 'Soft Skills', duration: 10, provider: 'LinkedIn Learning', skills: JSON.stringify(['Communication', 'Presentation']) },
    { title: 'Kubernetes & Container Orchestration', description: 'Master container orchestration with Kubernetes in production', category: 'Engineering', duration: 35, provider: 'A Cloud Guru', skills: JSON.stringify(['Kubernetes', 'Docker', 'DevOps']) },
  ]
  const createdCourses: string[] = []
  for (const course of courses) {
    const created = await db.course.create({ data: course })
    createdCourses.push(created.id)
  }

  // ─── Course Enrollments ────────────────────────────────────────────
  console.log('Creating course enrollments...')
  const enrollments = [
    { employeeId: createdEmployees['EMP006'], courseId: createdCourses[0], status: 'in-progress', progress: 65, score: null },
    { employeeId: createdEmployees['EMP001'], courseId: createdCourses[3], status: 'completed', progress: 100, score: 92, completedAt: '2023-11-15' },
    { employeeId: createdEmployees['EMP009'], courseId: createdCourses[7], status: 'in-progress', progress: 40, score: null },
    { employeeId: createdEmployees['EMP007'], courseId: createdCourses[2], status: 'completed', progress: 100, score: 88, completedAt: '2023-10-20' },
    { employeeId: createdEmployees['EMP014'], courseId: createdCourses[0], status: 'enrolled', progress: 0, score: null },
  ]
  for (const enr of enrollments) {
    await db.courseEnrollment.create({ data: enr })
  }

  // ─── Jobs ──────────────────────────────────────────────────────────
  console.log('Creating job postings...')
  const jobs = [
    { title: 'Senior Full Stack Developer', department: 'Engineering', location: 'Bangalore', type: 'full-time', experience: '5-8 years', salary: '18-25 LPA', description: 'We are looking for an experienced Full Stack Developer to join our engineering team.', requirements: JSON.stringify(['React', 'Node.js', 'TypeScript', 'PostgreSQL']), skills: JSON.stringify(['Full Stack', 'System Design']), status: 'open', postedDate: '2024-01-10', closingDate: '2024-02-28' },
    { title: 'Data Scientist', department: 'Engineering', location: 'Hyderabad', type: 'full-time', experience: '3-6 years', salary: '15-22 LPA', description: 'Join our data science team to build ML models and derive insights.', requirements: JSON.stringify(['Python', 'ML', 'TensorFlow', 'SQL']), skills: JSON.stringify(['Machine Learning', 'Data Analysis']), status: 'open', postedDate: '2024-01-08', closingDate: '2024-02-15' },
    { title: 'Marketing Coordinator', department: 'Marketing', location: 'New Delhi', type: 'full-time', experience: '2-4 years', salary: '8-12 LPA', description: 'Coordinate marketing campaigns and manage brand presence.', requirements: JSON.stringify(['Digital Marketing', 'Content Creation', 'Analytics']), skills: JSON.stringify(['Marketing', 'Communication']), status: 'open', postedDate: '2024-01-05', closingDate: '2024-01-31' },
    { title: 'HR Executive', department: 'Human Resources', location: 'Bangalore', type: 'full-time', experience: '1-3 years', salary: '6-10 LPA', description: 'Support HR operations including recruitment and employee engagement.', requirements: JSON.stringify(['HR Management', 'Communication', 'MS Office']), skills: JSON.stringify(['HR', 'Recruitment']), status: 'open', postedDate: '2024-01-12', closingDate: '2024-02-15' },
    { title: 'DevOps Engineer', department: 'Engineering', location: 'Bangalore', type: 'full-time', experience: '3-5 years', salary: '14-20 LPA', description: 'Build and maintain CI/CD pipelines and cloud infrastructure.', requirements: JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'Terraform']), skills: JSON.stringify(['DevOps', 'Cloud', 'CI/CD']), status: 'open', postedDate: '2024-01-09', closingDate: '2024-02-20' },
  ]
  const createdJobs: Record<string, string> = {}
  for (const job of jobs) {
    const created = await db.job.create({ data: job })
    createdJobs[job.title] = created.id
  }

  // ─── Candidates ────────────────────────────────────────────────────
  console.log('Creating candidates...')
  const candidates = [
    { jobId: createdJobs['Senior Full Stack Developer'], name: 'Arun Kumar', email: 'arun.k@email.com', phone: '+91-9876501001', experience: '6 years', skills: JSON.stringify(['React', 'Node.js', 'TypeScript']), education: 'B.Tech CSE', source: 'portal', status: 'interview', aiFitScore: 88, interviewDate: '2024-01-25' },
    { jobId: createdJobs['Senior Full Stack Developer'], name: 'Priya Nair', email: 'priya.n@email.com', phone: '+91-9876501002', experience: '5 years', skills: JSON.stringify(['React', 'Python', 'AWS']), education: 'M.Tech CSE', source: 'referral', status: 'screening', aiFitScore: 75 },
    { jobId: createdJobs['Data Scientist'], name: 'Rahul Sharma', email: 'rahul.s@email.com', phone: '+91-9876501003', experience: '4 years', skills: JSON.stringify(['Python', 'TensorFlow', 'SQL']), education: 'M.Stat', source: 'linkedin', status: 'offered', aiFitScore: 92 },
    { jobId: createdJobs['Data Scientist'], name: 'Meera Patel', email: 'meera.p@email.com', phone: '+91-9876501004', experience: '3 years', skills: JSON.stringify(['Python', 'R', 'ML']), education: 'M.Sc Statistics', source: 'portal', status: 'applied', aiFitScore: 72 },
    { jobId: createdJobs['HR Executive'], name: 'Sunita Reddy', email: 'sunita.r@email.com', phone: '+91-9876501005', experience: '2 years', skills: JSON.stringify(['HR', 'Communication', 'Recruitment']), education: 'MBA HR', source: 'portal', status: 'hired', aiFitScore: 85, onboardingStatus: 'in-progress' },
    { jobId: createdJobs['DevOps Engineer'], name: 'Kiran Joshi', email: 'kiran.j@email.com', phone: '+91-9876501006', experience: '4 years', skills: JSON.stringify(['AWS', 'Docker', 'Terraform']), education: 'B.Tech IT', source: 'linkedin', status: 'screening', aiFitScore: 65 },
  ]
  for (const cand of candidates) {
    await db.candidate.create({ data: cand })
  }

  // ─── Holidays ──────────────────────────────────────────────────────
  console.log('Creating holidays...')
  const holidays = [
    { name: 'Republic Day', date: '2024-01-26', type: 'national' },
    { name: 'Holi', date: '2024-03-25', type: 'national' },
    { name: 'Good Friday', date: '2024-03-29', type: 'national' },
    { name: 'Eid ul-Fitr', date: '2024-04-10', type: 'national' },
    { name: 'May Day', date: '2024-05-01', type: 'national' },
    { name: 'Independence Day', date: '2024-08-15', type: 'national' },
    { name: 'Gandhi Jayanti', date: '2024-10-02', type: 'national' },
    { name: 'Dussehra', date: '2024-10-12', type: 'national' },
    { name: 'Diwali', date: '2024-11-01', type: 'national' },
    { name: 'Christmas', date: '2024-12-25', type: 'national' },
    { name: 'Company Foundation Day', date: '2024-06-15', type: 'company' },
    { name: 'Year End Break', date: '2024-12-30', type: 'company' },
    { name: 'Year End Break', date: '2024-12-31', type: 'company' },
  ]
  for (const holiday of holidays) {
    await db.holiday.create({ data: holiday })
  }

  // ─── Company Policies ──────────────────────────────────────────────
  console.log('Creating company policies...')
  const policies = [
    { title: 'Leave Policy', category: 'HR', content: 'Employees are entitled to 24 casual leaves, 10 sick leaves, and 15 earned leaves per year. Maternity leave of 26 weeks and paternity leave of 15 days are provided as per government regulations. All leaves must be pre-approved by the reporting manager except in emergencies.', version: '2.1', effectiveDate: '2024-01-01' },
    { title: 'Code of Conduct', category: 'HR', content: 'All employees must maintain professional conduct at the workplace. This includes respectful communication, adherence to work hours, appropriate use of company resources, and maintaining confidentiality of company information. Violations may result in disciplinary action up to termination.', version: '1.5', effectiveDate: '2024-01-01' },
    { title: 'Remote Work Policy', category: 'HR', content: 'Employees may work remotely up to 2 days per week with manager approval. Remote workers must be available during core hours (10 AM - 4 PM IST), maintain a stable internet connection, and use company VPN for accessing internal resources. Equipment must be returned upon request.', version: '1.2', effectiveDate: '2024-01-01' },
    { title: 'Expense Reimbursement Policy', category: 'Finance', content: 'Business expenses must be pre-approved and submitted within 30 days of incurrence. Receipts are mandatory for all expenses above ₹500. Travel expenses follow tier-based limits. Reimbursements are processed within 15 business days of approval.', version: '2.0', effectiveDate: '2024-01-01' },
    { title: 'IT Security Policy', category: 'IT', content: 'All employees must use strong passwords (12+ characters, mixed case, numbers, symbols), enable two-factor authentication, and report any security incidents immediately. Company devices must have approved antivirus software. Personal devices accessing company data must be enrolled in MDM.', version: '1.8', effectiveDate: '2024-01-01' },
    { title: 'Travel Policy', category: 'Finance', content: 'Domestic travel must be approved by department head. International travel requires VP-level approval. Economy class for domestic, business class for international flights over 6 hours. Hotel stays limited to per-diem rates by city tier. Meal allowance: ₹1500/day metro, ₹1000/day non-metro.', version: '1.3', effectiveDate: '2024-01-01' },
    { title: 'Anti-Harassment Policy', category: 'HR', content: 'The company maintains zero tolerance for harassment of any kind including sexual, verbal, physical, or visual. An Internal Complaints Committee (ICC) is constituted as per the Sexual Harassment of Women at Workplace Act, 2013. Complaints can be filed anonymously through the HR portal.', version: '1.0', effectiveDate: '2024-01-01' },
    { title: 'Data Protection Policy', category: 'IT', content: 'All employee and customer data must be handled in compliance with applicable data protection laws. Personal data access is restricted to authorized personnel only. Data retention periods are defined by data category. Breaches must be reported to the DPO within 24 hours.', version: '1.1', effectiveDate: '2024', effectiveDate: '2024-01-01' },
  ]
  for (const policy of policies) {
    await db.companyPolicy.create({ data: policy })
  }

  // ─── Approval Workflows ────────────────────────────────────────────
  console.log('Creating approval workflows...')
  await db.approvalWorkflow.create({
    data: { type: 'leave', requesterId: createdEmployees['EMP006'], approverId: createdEmployees['EMP001'], level: 1, status: 'pending' },
  })
  await db.approvalWorkflow.create({
    data: { type: 'expense', requesterId: createdEmployees['EMP006'], approverId: createdEmployees['EMP002'], level: 1, status: 'pending' },
  })

  console.log('✅ Seeding completed successfully!')
  console.log(`   Company: ${companyAcme.name} (${companyAcme.code})`)
  console.log(`   Employees: ${employees.length}`)
  console.log(`   Users: ${users.length}`)
  console.log(`   Roles: 7 (with dashboard & menu assignments)`)
  console.log(`   Company Code for login: ACME`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
