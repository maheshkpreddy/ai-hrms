import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET() {
  const counts: Record<string, number> = {};
  const now = new Date();

  try {
    // ─── 1. COMPANIES ─────────────────────────────────────────────────
    const marqCompany = await db.company.upsert({
      where: { code: 'MARQ' },
      update: {},
      create: {
        name: 'MARQ AI Technologies',
        legalName: 'MARQ AI Technologies Pvt. Ltd.',
        code: 'MARQ',
        gstVat: '06AABCM1234F1Z5',
        panTanCin: 'AABCM1234F',
        registrationNumber: 'U72200HR2018PTC123456',
        industry: 'Technology',
        domain: 'marqai.tech',
        address: '101, Cyber City, DLF Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'IN',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        payrollCycle: 'monthly',
        financialYear: 'April-March',
        defaultLanguage: 'en',
        status: 'active',
      },
    });

    const acmeCompany = await db.company.upsert({
      where: { code: 'ACME' },
      update: {},
      create: {
        name: 'Acme Corp',
        legalName: 'Acme Corporation India Pvt. Ltd.',
        code: 'ACME',
        gstVat: '29AABCA1234F1Z8',
        panTanCin: 'AABCA1234F',
        registrationNumber: 'U74999KA2010PTC123789',
        industry: 'Manufacturing',
        domain: 'acmecorp.in',
        address: '42, Industrial Area, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'IN',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        payrollCycle: 'monthly',
        financialYear: 'April-March',
        defaultLanguage: 'en',
        status: 'active',
      },
    });

    counts.companies = 2;

    // ─── 2. BRANCHES ──────────────────────────────────────────────────
    const branches = await db.$transaction([
      db.branch.upsert({ where: { id: 'branch-marq-hq' }, update: {}, create: { id: 'branch-marq-hq', name: 'MARQ HQ - Gurugram', code: 'MARQ-HQ', address: '101, Cyber City', city: 'Gurugram', state: 'Haryana', country: 'India', isActive: true, companyId: marqCompany.id } }),
      db.branch.upsert({ where: { id: 'branch-marq-blr' }, update: {}, create: { id: 'branch-marq-blr', name: 'MARQ Bengaluru', code: 'MARQ-BLR', address: '5, Outer Ring Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', isActive: true, companyId: marqCompany.id } }),
      db.branch.upsert({ where: { id: 'branch-acme-hq' }, update: {}, create: { id: 'branch-acme-hq', name: 'Acme HQ - Bengaluru', code: 'ACME-HQ', address: '42, Industrial Area', city: 'Bengaluru', state: 'Karnataka', country: 'India', isActive: true, companyId: acmeCompany.id } }),
      db.branch.upsert({ where: { id: 'branch-acme-mum' }, update: {}, create: { id: 'branch-acme-mum', name: 'Acme Mumbai', code: 'ACME-MUM', address: '88, MIDC Andheri', city: 'Mumbai', state: 'Maharashtra', country: 'India', isActive: true, companyId: acmeCompany.id } }),
    ]);
    counts.branches = branches.length;

    // ─── 3. DEPARTMENTS ───────────────────────────────────────────────
    const marqDepts = await db.$transaction([
      db.department.upsert({ where: { id: 'dept-marq-eng' }, update: {}, create: { id: 'dept-marq-eng', name: 'Engineering', code: 'ENG', description: 'Software Engineering & AI Development', isActive: true, companyId: marqCompany.id } }),
      db.department.upsert({ where: { id: 'dept-marq-hr' }, update: {}, create: { id: 'dept-marq-hr', name: 'Human Resources', code: 'HR', description: 'HR & People Operations', isActive: true, companyId: marqCompany.id } }),
      db.department.upsert({ where: { id: 'dept-marq-sales' }, update: {}, create: { id: 'dept-marq-sales', name: 'Sales & Marketing', code: 'SM', description: 'Sales, Marketing & Business Development', isActive: true, companyId: marqCompany.id } }),
      db.department.upsert({ where: { id: 'dept-marq-finance' }, update: {}, create: { id: 'dept-marq-finance', name: 'Finance', code: 'FIN', description: 'Finance & Accounting', isActive: true, companyId: marqCompany.id } }),
      db.department.upsert({ where: { id: 'dept-marq-product' }, update: {}, create: { id: 'dept-marq-product', name: 'Product', code: 'PROD', description: 'Product Management & Design', isActive: true, companyId: marqCompany.id } }),
      db.department.upsert({ where: { id: 'dept-marq-qa' }, update: {}, create: { id: 'dept-marq-qa', name: 'Quality Assurance', code: 'QA', description: 'QA & Testing', isActive: true, companyId: marqCompany.id } }),
    ]);

    const acmeDepts = await db.$transaction([
      db.department.upsert({ where: { id: 'dept-acme-prod' }, update: {}, create: { id: 'dept-acme-prod', name: 'Production', code: 'PROD', description: 'Manufacturing & Production', isActive: true, companyId: acmeCompany.id } }),
      db.department.upsert({ where: { id: 'dept-acme-hr' }, update: {}, create: { id: 'dept-acme-hr', name: 'Human Resources', code: 'HR', description: 'HR & Administration', isActive: true, companyId: acmeCompany.id } }),
      db.department.upsert({ where: { id: 'dept-acme-supply' }, update: {}, create: { id: 'dept-acme-supply', name: 'Supply Chain', code: 'SCM', description: 'Supply Chain & Logistics', isActive: true, companyId: acmeCompany.id } }),
      db.department.upsert({ where: { id: 'dept-acme-finance' }, update: {}, create: { id: 'dept-acme-finance', name: 'Finance', code: 'FIN', description: 'Finance & Accounts', isActive: true, companyId: acmeCompany.id } }),
      db.department.upsert({ where: { id: 'dept-acme-rnd' }, update: {}, create: { id: 'dept-acme-rnd', name: 'R&D', code: 'RND', description: 'Research & Development', isActive: true, companyId: acmeCompany.id } }),
      db.department.upsert({ where: { id: 'dept-acme-quality' }, update: {}, create: { id: 'dept-acme-quality', name: 'Quality Control', code: 'QC', description: 'Quality Control & Compliance', isActive: true, companyId: acmeCompany.id } }),
    ]);
    counts.departments = marqDepts.length + acmeDepts.length;

    // ─── 4. SHIFTS ────────────────────────────────────────────────────
    const shifts = await db.$transaction([
      db.shift.upsert({ where: { id: 'shift-marq-general' }, update: {}, create: { id: 'shift-marq-general', name: 'General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60, isActive: true, companyId: marqCompany.id } }),
      db.shift.upsert({ where: { id: 'shift-marq-night' }, update: {}, create: { id: 'shift-marq-night', name: 'Night Shift', startTime: '21:00', endTime: '06:00', breakMinutes: 45, isActive: true, companyId: marqCompany.id } }),
      db.shift.upsert({ where: { id: 'shift-acme-general' }, update: {}, create: { id: 'shift-acme-general', name: 'General Shift', startTime: '08:00', endTime: '17:00', breakMinutes: 60, isActive: true, companyId: acmeCompany.id } }),
      db.shift.upsert({ where: { id: 'shift-acme-night' }, update: {}, create: { id: 'shift-acme-night', name: 'Night Shift', startTime: '20:00', endTime: '05:00', breakMinutes: 45, isActive: true, companyId: acmeCompany.id } }),
    ]);
    counts.shifts = shifts.length;

    // ─── 5. LEAVE POLICIES ────────────────────────────────────────────
    const leavePolicies = await db.$transaction([
      db.leavePolicy.upsert({ where: { id: 'lp-marq-cl' }, update: {}, create: { id: 'lp-marq-cl', name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarryDays: 3, isPaid: true, companyId: marqCompany.id } }),
      db.leavePolicy.upsert({ where: { id: 'lp-marq-sl' }, update: {}, create: { id: 'lp-marq-sl', name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, maxCarryDays: 0, isPaid: true, companyId: marqCompany.id } }),
      db.leavePolicy.upsert({ where: { id: 'lp-marq-el' }, update: {}, create: { id: 'lp-marq-el', name: 'Earned Leave', type: 'earned', totalDays: 15, carryForward: true, maxCarryDays: 5, isPaid: true, companyId: marqCompany.id } }),
      db.leavePolicy.upsert({ where: { id: 'lp-marq-ml' }, update: {}, create: { id: 'lp-marq-ml', name: 'Maternity Leave', type: 'maternity', totalDays: 180, carryForward: false, maxCarryDays: 0, isPaid: true, companyId: marqCompany.id } }),
      db.leavePolicy.upsert({ where: { id: 'lp-acme-cl' }, update: {}, create: { id: 'lp-acme-cl', name: 'Casual Leave', type: 'casual', totalDays: 10, carryForward: true, maxCarryDays: 2, isPaid: true, companyId: acmeCompany.id } }),
      db.leavePolicy.upsert({ where: { id: 'lp-acme-sl' }, update: {}, create: { id: 'lp-acme-sl', name: 'Sick Leave', type: 'sick', totalDays: 7, carryForward: false, maxCarryDays: 0, isPaid: true, companyId: acmeCompany.id } }),
      db.leavePolicy.upsert({ where: { id: 'lp-acme-el' }, update: {}, create: { id: 'lp-acme-el', name: 'Earned Leave', type: 'earned', totalDays: 12, carryForward: true, maxCarryDays: 3, isPaid: true, companyId: acmeCompany.id } }),
      db.leavePolicy.upsert({ where: { id: 'lp-acme-pl' }, update: {}, create: { id: 'lp-acme-pl', name: 'Paternity Leave', type: 'paternity', totalDays: 15, carryForward: false, maxCarryDays: 0, isPaid: true, companyId: acmeCompany.id } }),
    ]);
    counts.leavePolicies = leavePolicies.length;

    // ─── 6. PAYROLL STRUCTURES ────────────────────────────────────────
    const payrollStructures = await db.$transaction([
      db.payrollStructure.upsert({ where: { id: 'ps-marq-sde' }, update: {}, create: { id: 'ps-marq-sde', name: 'SDE Pay Structure', basicPay: 50000, hra: 20000, da: 5000, transportAllowance: 3000, medicalAllowance: 2500, specialAllowance: 10000, pfEmployee: 6000, pfEmployer: 6000, esiEmployee: 0, esiEmployer: 0, taxDeduction: 8000, companyId: marqCompany.id } }),
      db.payrollStructure.upsert({ where: { id: 'ps-marq-lead' }, update: {}, create: { id: 'ps-marq-lead', name: 'Tech Lead Pay Structure', basicPay: 75000, hra: 30000, da: 7500, transportAllowance: 5000, medicalAllowance: 3500, specialAllowance: 15000, pfEmployee: 9000, pfEmployer: 9000, esiEmployee: 0, esiEmployer: 0, taxDeduction: 15000, companyId: marqCompany.id } }),
      db.payrollStructure.upsert({ where: { id: 'ps-acme-supervisor' }, update: {}, create: { id: 'ps-acme-supervisor', name: 'Supervisor Pay Structure', basicPay: 35000, hra: 14000, da: 3500, transportAllowance: 2500, medicalAllowance: 2000, specialAllowance: 7000, pfEmployee: 4200, pfEmployer: 4200, esiEmployee: 630, esiEmployer: 1837, taxDeduction: 3000, companyId: acmeCompany.id } }),
      db.payrollStructure.upsert({ where: { id: 'ps-acme-manager' }, update: {}, create: { id: 'ps-acme-manager', name: 'Manager Pay Structure', basicPay: 60000, hra: 24000, da: 6000, transportAllowance: 4000, medicalAllowance: 3000, specialAllowance: 12000, pfEmployee: 7200, pfEmployer: 7200, esiEmployee: 0, esiEmployer: 0, taxDeduction: 10000, companyId: acmeCompany.id } }),
    ]);
    counts.payrollStructures = payrollStructures.length;

    // ─── 7. OFFICE LOCATIONS ──────────────────────────────────────────
    const officeLocations = await db.$transaction([
      db.officeLocation.upsert({ where: { id: 'ol-marq-ggn' }, update: {}, create: { id: 'ol-marq-ggn', name: 'MARQ Cyber City Office', address: '101, Cyber City, DLF Phase 2, Gurugram', latitude: 28.4947, longitude: 77.0887, radius: 500, isActive: true, companyId: marqCompany.id } }),
      db.officeLocation.upsert({ where: { id: 'ol-marq-blr' }, update: {}, create: { id: 'ol-marq-blr', name: 'MARQ Bengaluru Office', address: '5, Outer Ring Road, Bengaluru', latitude: 12.9716, longitude: 77.5946, radius: 500, isActive: true, companyId: marqCompany.id } }),
      db.officeLocation.upsert({ where: { id: 'ol-acme-blr' }, update: {}, create: { id: 'ol-acme-blr', name: 'Acme Whitefield Plant', address: '42, Industrial Area, Whitefield, Bengaluru', latitude: 12.9698, longitude: 77.7500, radius: 800, isActive: true, companyId: acmeCompany.id } }),
      db.officeLocation.upsert({ where: { id: 'ol-acme-mum' }, update: {}, create: { id: 'ol-acme-mum', name: 'Acme Mumbai Warehouse', address: '88, MIDC Andheri, Mumbai', latitude: 19.1136, longitude: 72.8697, radius: 600, isActive: true, companyId: acmeCompany.id } }),
    ]);
    counts.officeLocations = officeLocations.length;

    // ─── 8. EMPLOYEES ─────────────────────────────────────────────────
    const passwordHash = await hash('admin123', 12);

    // MARQ Employees
    const marqEmployeeData = [
      { empId: 'MARQ001', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@marqai.tech', phone: '+91-9876543210', gender: 'male', designation: 'Chief Technology Officer', jobTitle: 'CTO', departmentId: 'dept-marq-eng', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2018-03-15'), dob: new Date('1985-07-20'), city: 'Gurugram', state: 'Haryana', country: 'India', role: 'super_admin' },
      { empId: 'MARQ002', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@marqai.tech', phone: '+91-9876543211', gender: 'female', designation: 'HR Director', jobTitle: 'HR Director', departmentId: 'dept-marq-hr', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2019-01-10'), dob: new Date('1988-11-05'), city: 'Delhi', state: 'Delhi', country: 'India', role: 'company_hr_admin' },
      { empId: 'MARQ003', firstName: 'Rahul', lastName: 'Verma', email: 'rahul.verma@marqai.tech', phone: '+91-9876543212', gender: 'male', designation: 'Senior Software Engineer', jobTitle: 'Sr. SDE', departmentId: 'dept-marq-eng', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2020-06-01'), dob: new Date('1993-03-12'), city: 'Gurugram', state: 'Haryana', country: 'India', role: 'employee' },
      { empId: 'MARQ004', firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.reddy@marqai.tech', phone: '+91-9876543213', gender: 'female', designation: 'ML Engineer', jobTitle: 'ML Engineer', departmentId: 'dept-marq-eng', branchId: 'branch-marq-blr', employmentType: 'full-time', status: 'active', joiningDate: new Date('2021-02-15'), dob: new Date('1995-09-28'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'employee' },
      { empId: 'MARQ005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@marqai.tech', phone: '+91-9876543214', gender: 'male', designation: 'Sales Manager', jobTitle: 'Sales Manager', departmentId: 'dept-marq-sales', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2020-09-20'), dob: new Date('1990-12-03'), city: 'Delhi', state: 'Delhi', country: 'India', role: 'dept_head' },
      { empId: 'MARQ006', firstName: 'Neha', lastName: 'Gupta', email: 'neha.gupta@marqai.tech', phone: '+91-9876543215', gender: 'female', designation: 'Finance Manager', jobTitle: 'Finance Manager', departmentId: 'dept-marq-finance', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2019-11-05'), dob: new Date('1991-05-17'), city: 'Gurugram', state: 'Haryana', country: 'India', role: 'finance' },
      { empId: 'MARQ007', firstName: 'Amit', lastName: 'Kumar', email: 'amit.kumar@marqai.tech', phone: '+91-9876543216', gender: 'male', designation: 'Product Manager', jobTitle: 'Product Manager', departmentId: 'dept-marq-product', branchId: 'branch-marq-blr', employmentType: 'full-time', status: 'active', joiningDate: new Date('2021-07-12'), dob: new Date('1992-08-22'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'dept_head' },
      { empId: 'MARQ008', firstName: 'Sneha', lastName: 'Iyer', email: 'sneha.iyer@marqai.tech', phone: '+91-9876543217', gender: 'female', designation: 'QA Lead', jobTitle: 'QA Lead', departmentId: 'dept-marq-qa', branchId: 'branch-marq-blr', employmentType: 'full-time', status: 'active', joiningDate: new Date('2022-01-15'), dob: new Date('1994-02-14'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'reporting_manager' },
      { empId: 'MARQ009', firstName: 'Rohan', lastName: 'Nair', email: 'rohan.nair@marqai.tech', phone: '+91-9876543218', gender: 'male', designation: 'DevOps Engineer', jobTitle: 'DevOps Engineer', departmentId: 'dept-marq-eng', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2022-04-01'), dob: new Date('1996-06-30'), city: 'Gurugram', state: 'Haryana', country: 'India', role: 'employee' },
      { empId: 'MARQ010', firstName: 'Kavitha', lastName: 'Subramaniam', email: 'kavitha.s@marqai.tech', phone: '+91-9876543219', gender: 'female', designation: 'Data Scientist', jobTitle: 'Data Scientist', departmentId: 'dept-marq-eng', branchId: 'branch-marq-blr', employmentType: 'full-time', status: 'active', joiningDate: new Date('2023-01-09'), dob: new Date('1997-04-18'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'employee' },
      { empId: 'MARQ011', firstName: 'Deepak', lastName: 'Joshi', email: 'deepak.joshi@marqai.tech', phone: '+91-9876543220', gender: 'male', designation: 'Frontend Developer', jobTitle: 'Frontend Dev', departmentId: 'dept-marq-eng', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2023-05-15'), dob: new Date('1998-10-08'), city: 'Gurugram', state: 'Haryana', country: 'India', role: 'employee' },
      { empId: 'MARQ012', firstName: 'Meera', lastName: 'Krishnan', email: 'meera.k@marqai.tech', phone: '+91-9876543221', gender: 'female', designation: 'HR Executive', jobTitle: 'HR Executive', departmentId: 'dept-marq-hr', branchId: 'branch-marq-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2022-08-01'), dob: new Date('1995-01-25'), city: 'Delhi', state: 'Delhi', country: 'India', role: 'hr_executive' },
    ];

    // Acme Employees
    const acmeEmployeeData = [
      { empId: 'ACME001', firstName: 'Suresh', lastName: 'Menon', email: 'suresh.menon@acmecorp.in', phone: '+91-8765432101', gender: 'male', designation: 'VP Operations', jobTitle: 'VP Ops', departmentId: 'dept-acme-prod', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2010-06-01'), dob: new Date('1978-09-14'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'super_admin' },
      { empId: 'ACME002', firstName: 'Lakshmi', lastName: 'Ramanathan', email: 'lakshmi.r@acmecorp.in', phone: '+91-8765432102', gender: 'female', designation: 'HR Manager', jobTitle: 'HR Manager', departmentId: 'dept-acme-hr', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2015-03-10'), dob: new Date('1986-12-22'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'company_hr_admin' },
      { empId: 'ACME003', firstName: 'Rajesh', lastName: 'Pillai', email: 'rajesh.pillai@acmecorp.in', phone: '+91-8765432103', gender: 'male', designation: 'Production Supervisor', jobTitle: 'Supervisor', departmentId: 'dept-acme-prod', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2018-01-20'), dob: new Date('1989-04-05'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'reporting_manager' },
      { empId: 'ACME004', firstName: 'Divya', lastName: 'Nair', email: 'divya.nair@acmecorp.in', phone: '+91-8765432104', gender: 'female', designation: 'Supply Chain Analyst', jobTitle: 'SCM Analyst', departmentId: 'dept-acme-supply', branchId: 'branch-acme-mum', employmentType: 'full-time', status: 'active', joiningDate: new Date('2019-07-15'), dob: new Date('1992-08-11'), city: 'Mumbai', state: 'Maharashtra', country: 'India', role: 'employee' },
      { empId: 'ACME005', firstName: 'Karthik', lastName: 'Bhat', email: 'karthik.bhat@acmecorp.in', phone: '+91-8765432105', gender: 'male', designation: 'Finance Executive', jobTitle: 'Fin Executive', departmentId: 'dept-acme-finance', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2020-02-01'), dob: new Date('1993-06-19'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'finance' },
      { empId: 'ACME006', firstName: 'Pooja', lastName: 'Deshmukh', email: 'pooja.d@acmecorp.in', phone: '+91-8765432106', gender: 'female', designation: 'R&D Engineer', jobTitle: 'R&D Engineer', departmentId: 'dept-acme-rnd', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2021-04-12'), dob: new Date('1994-11-03'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'employee' },
      { empId: 'ACME007', firstName: 'Manoj', lastName: 'Tiwari', email: 'manoj.tiwari@acmecorp.in', phone: '+91-8765432107', gender: 'male', designation: 'Quality Inspector', jobTitle: 'QC Inspector', departmentId: 'dept-acme-quality', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2020-11-05'), dob: new Date('1990-02-28'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'employee' },
      { empId: 'ACME008', firstName: 'Swati', lastName: 'Kulkarni', email: 'swati.k@acmecorp.in', phone: '+91-8765432108', gender: 'female', designation: 'Machine Operator', jobTitle: 'Operator', departmentId: 'dept-acme-prod', branchId: 'branch-acme-mum', employmentType: 'full-time', status: 'active', joiningDate: new Date('2022-03-14'), dob: new Date('1996-07-08'), city: 'Mumbai', state: 'Maharashtra', country: 'India', role: 'employee' },
      { empId: 'ACME009', firstName: 'Anil', lastName: 'Yadav', email: 'anil.yadav@acmecorp.in', phone: '+91-8765432109', gender: 'male', designation: 'Warehouse Manager', jobTitle: 'WH Manager', departmentId: 'dept-acme-supply', branchId: 'branch-acme-mum', employmentType: 'full-time', status: 'active', joiningDate: new Date('2019-09-01'), dob: new Date('1988-05-16'), city: 'Mumbai', state: 'Maharashtra', country: 'India', role: 'dept_head' },
      { empId: 'ACME010', firstName: 'Ritu', lastName: 'Agarwal', email: 'ritu.a@acmecorp.in', phone: '+91-8765432110', gender: 'female', designation: 'HR Executive', jobTitle: 'HR Exec', departmentId: 'dept-acme-hr', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2023-02-20'), dob: new Date('1997-03-23'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'hr_executive' },
      { empId: 'ACME011', firstName: 'Vivek', lastName: 'Chauhan', email: 'vivek.c@acmecorp.in', phone: '+91-8765432111', gender: 'male', designation: 'Maintenance Technician', jobTitle: 'Technician', departmentId: 'dept-acme-prod', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'active', joiningDate: new Date('2021-10-08'), dob: new Date('1994-09-12'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'employee' },
      { empId: 'ACME012', firstName: 'Sunita', lastName: 'Kumari', email: 'sunita.k@acmecorp.in', phone: '+91-8765432112', gender: 'female', designation: 'Accounts Assistant', jobTitle: 'Accts Asst', departmentId: 'dept-acme-finance', branchId: 'branch-acme-hq', employmentType: 'full-time', status: 'probation', joiningDate: new Date('2024-01-15'), dob: new Date('1999-01-07'), city: 'Bengaluru', state: 'Karnataka', country: 'India', role: 'employee' },
    ];

    const allEmployeeData = [
      ...marqEmployeeData.map(e => ({ ...e, companyId: marqCompany.id })),
      ...acmeEmployeeData.map(e => ({ ...e, companyId: acmeCompany.id })),
    ];

    // Create employees
    const createdEmployees: { id: string; employeeId: string; email: string; companyId: string }[] = [];
    for (const emp of allEmployeeData) {
      const employee = await db.employee.upsert({
        where: { employeeId: emp.empId },
        update: {},
        create: {
          employeeId: emp.empId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          gender: emp.gender,
          designation: emp.designation,
          jobTitle: emp.jobTitle,
          departmentId: emp.departmentId,
          branchId: emp.branchId,
          companyId: emp.companyId,
          employmentType: emp.employmentType,
          status: emp.status,
          joiningDate: emp.joiningDate,
          dateOfBirth: emp.dob,
          city: emp.city,
          state: emp.state,
          country: emp.country,
        },
      });
      createdEmployees.push({ id: employee.id, employeeId: employee.employeeId, email: employee.email, companyId: employee.companyId });

      // Create user for each employee
      const user = await db.user.upsert({
        where: { email: emp.email },
        update: {},
        create: {
          email: emp.email,
          password: passwordHash,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role,
          company: { connect: { id: emp.companyId } },
          isActive: true,
        },
      });

      // Link employee to user
      await db.employee.update({
        where: { id: employee.id },
        data: { userId: user.id },
      });
    }
    counts.employees = createdEmployees.length;
    counts.users = createdEmployees.length;

    // ─── 9. COMPANY MEMBERS ───────────────────────────────────────────
    let memberCount = 0;
    for (const emp of createdEmployees) {
      try {
        await db.companyMember.create({
          data: {
            companyId: emp.companyId,
            employeeId: emp.id,
            role: emp.employeeId.startsWith('MARQ001') || emp.employeeId.startsWith('ACME001') ? 'owner' :
                  emp.employeeId.startsWith('MARQ002') || emp.employeeId.startsWith('ACME002') ? 'hr' :
                  emp.employeeId.includes('MARQ') && ['MARQ005', 'MARQ007'].includes(emp.employeeId) ? 'manager' :
                  emp.employeeId.includes('ACME') && ['ACME009'].includes(emp.employeeId) ? 'manager' : 'employee',
            status: 'approved',
            joinedAt: new Date(),
          },
        });
        memberCount++;
      } catch { /* skip duplicates */ }
    }
    counts.companyMembers = memberCount;

    // ─── 10. ATTENDANCE RECORDS ───────────────────────────────────────
    const today = new Date();
    const attendanceData = [];
    for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const emp of createdEmployees) {
        const isPresent = Math.random() > 0.1; // 90% attendance
        if (isPresent) {
          const checkInHour = 8 + Math.floor(Math.random() * 2);
          const checkInMin = Math.floor(Math.random() * 60);
          const checkIn = new Date(date);
          checkIn.setHours(checkInHour, checkInMin, 0);
          const checkOut = new Date(date);
          checkOut.setHours(checkInHour + 8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
          attendanceData.push({
            date,
            checkIn,
            checkOut,
            workHours: 8 + Math.random() * 1.5,
            status: 'present',
            source: 'web',
            employeeId: emp.id,
          });
        } else {
          attendanceData.push({
            date,
            status: Math.random() > 0.5 ? 'absent' : 'half_day',
            source: 'web',
            workHours: Math.random() > 0.5 ? 0 : 4,
            employeeId: emp.id,
          });
        }
      }
    }

    // Insert attendance in batches
    for (let i = 0; i < attendanceData.length; i += 50) {
      const batch = attendanceData.slice(i, i + 50);
      await db.attendance.createMany({ data: batch });
    }
    counts.attendance = attendanceData.length;

    // ─── 11. LEAVE REQUESTS ───────────────────────────────────────────
    const marqEmps = createdEmployees.filter(e => e.companyId === marqCompany.id);
    const acmeEmps = createdEmployees.filter(e => e.companyId === acmeCompany.id);

    const leaveData = [
      { employeeId: marqEmps[2]?.id, type: 'casual', startDate: new Date('2025-02-10'), endDate: new Date('2025-02-11'), totalDays: 2, reason: 'Personal work', status: 'approved' },
      { employeeId: marqEmps[3]?.id, type: 'sick', startDate: new Date('2025-03-05'), endDate: new Date('2025-03-06'), totalDays: 2, reason: 'Fever and cold', status: 'approved' },
      { employeeId: marqEmps[5]?.id, type: 'earned', startDate: new Date('2025-04-14'), endDate: new Date('2025-04-18'), totalDays: 5, reason: 'Family vacation', status: 'pending' },
      { employeeId: marqEmps[8]?.id, type: 'casual', startDate: new Date('2025-05-01'), endDate: new Date('2025-05-02'), totalDays: 2, reason: 'Personal errand', status: 'approved' },
      { employeeId: acmeEmps[2]?.id, type: 'casual', startDate: new Date('2025-02-20'), endDate: new Date('2025-02-21'), totalDays: 2, reason: 'Family function', status: 'approved' },
      { employeeId: acmeEmps[4]?.id, type: 'sick', startDate: new Date('2025-03-12'), endDate: new Date('2025-03-13'), totalDays: 2, reason: 'Medical appointment', status: 'rejected' },
      { employeeId: acmeEmps[6]?.id, type: 'earned', startDate: new Date('2025-04-01'), endDate: new Date('2025-04-05'), totalDays: 5, reason: 'Annual leave', status: 'approved' },
      { employeeId: acmeEmps[8]?.id, type: 'casual', startDate: new Date('2025-06-15'), endDate: new Date('2025-06-16'), totalDays: 2, reason: 'Moving house', status: 'pending' },
    ].filter(l => l.employeeId);

    await db.leave.createMany({ data: leaveData as any });
    counts.leaves = leaveData.length;

    // ─── 12. PAYROLL RECORDS ──────────────────────────────────────────
    const payrollData = [];
    for (const emp of createdEmployees) {
      const baseSalary = emp.employeeId.includes('MARQ') ? 50000 + Math.random() * 50000 : 30000 + Math.random() * 40000;
      for (let month = 1; month <= 3; month++) {
        payrollData.push({
          month,
          year: 2025,
          basicPay: Math.round(baseSalary * 0.5),
          grossSalary: Math.round(baseSalary),
          totalDeductions: Math.round(baseSalary * 0.2),
          netSalary: Math.round(baseSalary * 0.8),
          status: month < 3 ? 'processed' : 'pending',
          paymentDate: month < 3 ? new Date(2025, month - 1, 28) : null,
          employeeId: emp.id,
        });
      }
    }
    await db.payrollRecord.createMany({ data: payrollData });
    counts.payrollRecords = payrollData.length;

    // ─── 13. PROJECTS ─────────────────────────────────────────────────
    const projects = await db.$transaction([
      db.project.create({ data: { name: 'MARQ AI Platform v2', description: 'Next-gen AI platform with LLM integration', status: 'in_progress', priority: 'high', startDate: new Date('2025-01-15'), endDate: new Date('2025-09-30'), budget: 5000000, progress: 45, companyId: marqCompany.id, createdBy: marqEmps[0]?.id } }),
      db.project.create({ data: { name: 'Mobile App Redesign', description: 'Redesigning the MARQ mobile application', status: 'planning', priority: 'medium', startDate: new Date('2025-04-01'), endDate: new Date('2025-08-31'), budget: 1500000, progress: 10, companyId: marqCompany.id, createdBy: marqEmps[6]?.id } }),
      db.project.create({ data: { name: 'Data Pipeline Optimization', description: 'Optimize ETL data pipelines for performance', status: 'completed', priority: 'high', startDate: new Date('2024-10-01'), endDate: new Date('2025-02-28'), budget: 800000, progress: 100, companyId: marqCompany.id, createdBy: marqEmps[0]?.id } }),
      db.project.create({ data: { name: 'Smart Factory Initiative', description: 'IoT-enabled smart factory setup', status: 'in_progress', priority: 'high', startDate: new Date('2025-02-01'), endDate: new Date('2025-12-31'), budget: 8000000, progress: 30, companyId: acmeCompany.id, createdBy: acmeEmps[0]?.id } }),
      db.project.create({ data: { name: 'Supply Chain Digitization', description: 'End-to-end supply chain digital transformation', status: 'planning', priority: 'medium', startDate: new Date('2025-05-01'), endDate: new Date('2026-03-31'), budget: 3000000, progress: 5, companyId: acmeCompany.id, createdBy: acmeEmps[0]?.id } }),
      db.project.create({ data: { name: 'Quality Management System', description: 'QMS implementation for ISO compliance', status: 'in_progress', priority: 'medium', startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'), budget: 1200000, progress: 60, companyId: acmeCompany.id, createdBy: acmeEmps[0]?.id } }),
    ]);
    counts.projects = projects.length;

    // ─── 14. PROJECT MEMBERS ──────────────────────────────────────────
    const projectMembersData: any[] = [];
    for (const project of projects) {
      const empList = project.companyId === marqCompany.id ? marqEmps : acmeEmps;
      // Add 3-4 members per project
      for (let j = 0; j < Math.min(4, empList.length); j++) {
        projectMembersData.push({
          projectId: project.id,
          employeeId: empList[j]?.id,
          role: j === 0 ? 'lead' : 'member',
        });
      }
    }
    await db.projectMember.createMany({ data: projectMembersData.filter(d => d.employeeId) });
    counts.projectMembers = projectMembersData.length;

    // ─── 15. TASKS ────────────────────────────────────────────────────
    const tasks = [];
    const taskData = [
      { title: 'Implement LLM API Gateway', priority: 'high', status: 'in_progress', companyId: marqCompany.id, projectIdx: 0 },
      { title: 'Design new onboarding flow', priority: 'medium', status: 'todo', companyId: marqCompany.id, projectIdx: 1 },
      { title: 'Fix data pipeline memory leak', priority: 'high', status: 'completed', companyId: marqCompany.id, projectIdx: 2 },
      { title: 'Set up IoT sensor network', priority: 'high', status: 'in_progress', companyId: acmeCompany.id, projectIdx: 3 },
      { title: 'Vendor integration API', priority: 'medium', status: 'todo', companyId: acmeCompany.id, projectIdx: 4 },
      { title: 'QMS audit preparation', priority: 'high', status: 'in_progress', companyId: acmeCompany.id, projectIdx: 5 },
      { title: 'Unit test coverage improvement', priority: 'low', status: 'todo', companyId: marqCompany.id, projectIdx: 0 },
      { title: 'Deploy monitoring dashboards', priority: 'medium', status: 'in_progress', companyId: marqCompany.id, projectIdx: 2 },
      { title: 'RFID tag installation', priority: 'medium', status: 'todo', companyId: acmeCompany.id, projectIdx: 3 },
      { title: 'Supplier onboarding portal', priority: 'medium', status: 'todo', companyId: acmeCompany.id, projectIdx: 4 },
    ];
    for (const t of taskData) {
      const project = projects[t.projectIdx];
      const empList = t.companyId === marqCompany.id ? marqEmps : acmeEmps;
      const task = await db.task.create({
        data: {
          title: t.title,
          description: `Description for ${t.title}`,
          priority: t.priority,
          status: t.status,
          dueDate: new Date(Date.now() + Math.random() * 30 * 86400000),
          companyId: t.companyId,
          createdBy: empList[0]?.id,
        },
      });
      tasks.push(task);
      // Assign task to an employee
      if (empList[1]?.id) {
        await db.taskAssignment.create({ data: { taskId: task.id, employeeId: empList[1].id } });
      }
    }
    counts.tasks = tasks.length;

    // ─── 16. JOBS & AI INTERVIEWS ─────────────────────────────────────
    const jobs = await db.$transaction([
      db.job.create({ data: { title: 'Senior ML Engineer', description: 'Build and deploy ML models', department: 'Engineering', location: 'Gurugram', employmentType: 'full-time', experienceMin: 4, experienceMax: 8, salaryMin: 1500000, salaryMax: 3000000, status: 'published', priority: 'high', positions: 2, filledPositions: 0, postedDate: new Date('2025-05-01'), closingDate: new Date('2025-06-30'), companyId: marqCompany.id } }),
      db.job.create({ data: { title: 'Product Designer', description: 'Design intuitive product experiences', department: 'Product', location: 'Bengaluru', employmentType: 'full-time', experienceMin: 3, experienceMax: 6, salaryMin: 1200000, salaryMax: 2500000, status: 'published', priority: 'medium', positions: 1, filledPositions: 0, postedDate: new Date('2025-05-10'), closingDate: new Date('2025-07-15'), companyId: marqCompany.id } }),
      db.job.create({ data: { title: 'Production Engineer', description: 'Manage production line operations', department: 'Production', location: 'Bengaluru', employmentType: 'full-time', experienceMin: 2, experienceMax: 5, salaryMin: 800000, salaryMax: 1500000, status: 'published', priority: 'high', positions: 3, filledPositions: 1, postedDate: new Date('2025-04-15'), closingDate: new Date('2025-06-15'), companyId: acmeCompany.id } }),
    ]);

    const candidates = await db.$transaction([
      db.candidate.create({ data: { firstName: 'Aditya', lastName: 'Mehta', email: 'aditya.mehta@gmail.com', phone: '+91-9988776655', currentCompany: 'TCS', currentTitle: 'Data Engineer', experience: 5, expectedSalary: 2000000, noticePeriod: '30 days', status: 'interviewed', source: 'linkedin', aiScore: 85, skillMatch: 92, cultureFitScore: 78, jobId: jobs[0].id } }),
      db.candidate.create({ data: { firstName: 'Shruti', lastName: 'Bansal', email: 'shruti.bansal@gmail.com', phone: '+91-9876501234', currentCompany: 'Infosys', currentTitle: 'UI Designer', experience: 4, expectedSalary: 1800000, noticePeriod: '60 days', status: 'applied', source: 'referral', aiScore: 72, skillMatch: 80, cultureFitScore: 88, jobId: jobs[1].id } }),
      db.candidate.create({ data: { firstName: 'Prakash', lastName: 'Hegde', email: 'prakash.h@gmail.com', phone: '+91-9123456789', currentCompany: 'Wipro', currentTitle: 'Manufacturing Eng', experience: 3, expectedSalary: 1200000, noticePeriod: '45 days', status: 'shortlisted', source: 'naukri', aiScore: 68, skillMatch: 75, cultureFitScore: 82, jobId: jobs[2].id } }),
    ]);
    counts.jobs = jobs.length;
    counts.candidates = candidates.length;

    // AI Interviews
    const aiInterviews = await db.$transaction([
      db.aIInterview.create({ data: { candidateId: candidates[0].id, jobId: jobs[0].id, status: 'completed', questions: JSON.stringify(['Tell me about your ML experience', 'How do you handle imbalanced datasets?', 'Explain the difference between batch and online learning']), responses: JSON.stringify(['5 years in ML...', 'SMOTE and undersampling...', 'Batch processes all data...']), score: 8.2, feedback: 'Strong ML fundamentals, good communication', language: 'en', cvScore: 88, duration: 35, startedAt: new Date('2025-05-15T10:00:00'), completedAt: new Date('2025-05-15T10:35:00') } }),
      db.aIInterview.create({ data: { candidateId: candidates[1].id, jobId: jobs[1].id, status: 'scheduled', questions: JSON.stringify(['Walk me through your design process', 'How do you handle design criticism?']), responses: '[]', language: 'en', interviewLink: `ai-interview-${Date.now()}` } }),
      db.aIInterview.create({ data: { candidateId: candidates[2].id, jobId: jobs[2].id, status: 'in_progress', questions: JSON.stringify(['Describe your production optimization experience', 'How do you ensure quality in manufacturing?']), responses: JSON.stringify(['Led efficiency improvements...', 'Six Sigma methodology...']), language: 'en', cvScore: 72, startedAt: new Date('2025-05-20T14:00:00') } }),
    ]);
    counts.aiInterviews = aiInterviews.length;

    // ─── 17. HELPDESK TICKETS ─────────────────────────────────────────
    const helpdeskTickets = await db.$transaction([
      db.helpdeskTicket.create({ data: { ticketId: 'HD-MARQ-001', category: 'IT', subCategory: 'Hardware', priority: 'high', subject: 'Laptop screen flickering', description: 'My laptop screen has been flickering since yesterday', status: 'open', companyId: marqCompany.id, requesterId: marqEmps[2]?.id } }),
      db.helpdeskTicket.create({ data: { ticketId: 'HD-MARQ-002', category: 'HR', subCategory: 'Policy', priority: 'medium', subject: 'Leave policy clarification', description: 'Need clarification on carry forward leave policy', status: 'in_progress', companyId: marqCompany.id, requesterId: marqEmps[4]?.id, assignedAgentId: marqEmps[1]?.id } }),
      db.helpdeskTicket.create({ data: { ticketId: 'HD-ACME-001', category: 'IT', subCategory: 'Software', priority: 'high', subject: 'ERP system slow response', description: 'ERP taking 5+ minutes to load any page', status: 'open', companyId: acmeCompany.id, requesterId: acmeEmps[2]?.id } }),
      db.helpdeskTicket.create({ data: { ticketId: 'HD-ACME-002', category: 'Facilities', subCategory: 'AC', priority: 'low', subject: 'AC not working in Bay 3', description: 'Air conditioning not working in production bay 3', status: 'resolved', companyId: acmeCompany.id, requesterId: acmeEmps[7]?.id, resolution: 'AC compressor replaced, working now' } }),
    ]);
    counts.helpdeskTickets = helpdeskTickets.length;

    // ─── 18. ASSETS ───────────────────────────────────────────────────
    const assets = await db.$transaction([
      db.assetAllocation.create({ data: { assetType: 'laptop', assetName: 'MacBook Pro 16"', assetCode: 'MARQ-LT-001', serialNumber: 'C02XX1XXHASH', allocatedAt: new Date('2024-01-15'), status: 'allocated', notes: 'M3 Max, 36GB RAM', employeeId: marqEmps[0]?.id } }),
      db.assetAllocation.create({ data: { assetType: 'laptop', assetName: 'MacBook Pro 14"', assetCode: 'MARQ-LT-002', serialNumber: 'C02YY2YYHASH', allocatedAt: new Date('2024-03-20'), status: 'allocated', notes: 'M2 Pro, 16GB RAM', employeeId: marqEmps[2]?.id } }),
      db.assetAllocation.create({ data: { assetType: 'monitor', assetName: 'Dell 27" 4K', assetCode: 'MARQ-MN-001', serialNumber: 'DELL-4K-001', allocatedAt: new Date('2024-02-10'), status: 'allocated', employeeId: marqEmps[3]?.id } }),
      db.assetAllocation.create({ data: { assetType: 'laptop', assetName: 'ThinkPad T14', assetCode: 'ACME-LT-001', serialNumber: 'LNV-T14-001', allocatedAt: new Date('2023-06-15'), status: 'allocated', notes: 'i7, 16GB RAM', employeeId: acmeEmps[0]?.id } }),
      db.assetAllocation.create({ data: { assetType: 'phone', assetName: 'iPhone 15', assetCode: 'ACME-PH-001', serialNumber: 'AAPL-15-001', allocatedAt: new Date('2024-01-10'), status: 'allocated', employeeId: acmeEmps[1]?.id } }),
    ]);
    counts.assets = assets.length;

    // ─── 19. COMPANY POLICIES ─────────────────────────────────────────
    const policies = await db.$transaction([
      db.companyPolicy.create({ data: { title: 'Remote Work Policy', content: 'Employees are allowed to work remotely up to 3 days per week. Must be available during core hours (10 AM - 4 PM IST).', category: 'HR', version: '2.0', effectiveDate: new Date('2025-01-01'), status: 'active', companyId: marqCompany.id } }),
      db.companyPolicy.create({ data: { title: 'Code of Conduct', content: 'All employees must adhere to professional conduct standards. Harassment of any kind will not be tolerated.', category: 'Compliance', version: '1.5', effectiveDate: new Date('2024-06-01'), status: 'active', companyId: marqCompany.id } }),
      db.companyPolicy.create({ data: { title: 'Data Security Policy', content: 'All proprietary data must be handled according to ISO 27001 standards. Use only approved devices and networks.', category: 'IT Security', version: '3.0', effectiveDate: new Date('2025-02-01'), status: 'active', companyId: marqCompany.id } }),
      db.companyPolicy.create({ data: { title: 'Safety & Health Policy', content: 'All factory personnel must wear PPE at all times. Report any safety incidents immediately.', category: 'Safety', version: '1.2', effectiveDate: new Date('2024-01-01'), status: 'active', companyId: acmeCompany.id } }),
      db.companyPolicy.create({ data: { title: 'Attendance & Shift Policy', content: 'All shifts are 8 hours with 1 hour break. Overtime must be pre-approved by department head.', category: 'HR', version: '2.1', effectiveDate: new Date('2024-03-01'), status: 'active', companyId: acmeCompany.id } }),
    ]);
    counts.policies = policies.length;

    // ─── 20. PERFORMANCE REVIEWS ──────────────────────────────────────
    const reviewCycle = await db.reviewCycle.create({
      data: { name: 'H1 2025 Review', type: 'half_yearly', startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'), status: 'active', companyId: marqCompany.id },
    });

    const perfReviews = [];
    for (let i = 0; i < Math.min(4, marqEmps.length); i++) {
      if (i === 0) continue; // skip CTO as reviewee, they review others
      const review = await db.performanceReview.create({
        data: {
          cycleId: reviewCycle.id,
          reviewerId: marqEmps[0]?.id,
          revieweeId: marqEmps[i]?.id,
          rating: 3 + Math.floor(Math.random() * 3),
          comments: 'Good performance during the review period.',
          status: 'completed',
        },
      });
      perfReviews.push(review);
    }
    counts.performanceReviews = perfReviews.length;

    // Performance records for Acme
    const perfRecords = [];
    for (let i = 0; i < Math.min(5, acmeEmps.length); i++) {
      const perf = await db.performance.create({
        data: {
          employeeId: acmeEmps[i]?.id,
          reviewPeriod: 'H1 2025',
          reviewerId: acmeEmps[0]?.id,
          rating: 3 + Math.floor(Math.random() * 3),
          objectives: 'Meet production targets, improve quality metrics',
          achievements: 'Exceeded production targets by 15%',
          feedback: 'Consistent performer with good leadership qualities',
          status: 'completed',
        },
      });
      perfRecords.push(perf);
    }
    counts.performances = perfRecords.length;

    // ─── 21. LEARNING/COURSE DATA ─────────────────────────────────────
    const learningData = [
      { employeeId: marqEmps[2]?.id, courseName: 'Advanced Machine Learning', provider: 'Coursera', type: 'e_learning', status: 'completed', score: 92, completedAt: new Date('2025-03-15') },
      { employeeId: marqEmps[3]?.id, courseName: 'MLOps Engineering', provider: 'Udemy', type: 'e_learning', status: 'in_progress' },
      { employeeId: marqEmps[8]?.id, courseName: 'AWS Solutions Architect', provider: 'A Cloud Guru', type: 'certification', status: 'enrolled' },
      { employeeId: marqEmps[9]?.id, courseName: 'Deep Learning Specialization', provider: 'Coursera', type: 'e_learning', status: 'completed', score: 88, completedAt: new Date('2025-02-28') },
      { employeeId: acmeEmps[3]?.id, courseName: 'Supply Chain Management', provider: 'edX', type: 'e_learning', status: 'completed', score: 85, completedAt: new Date('2025-01-20') },
      { employeeId: acmeEmps[5]?.id, courseName: 'Six Sigma Green Belt', provider: 'ASQ', type: 'certification', status: 'in_progress' },
      { employeeId: acmeEmps[6]?.id, courseName: 'ISO 9001 Lead Auditor', provider: 'BSI', type: 'certification', status: 'enrolled' },
      { employeeId: acmeEmps[9]?.id, courseName: 'HR Analytics', provider: 'Coursera', type: 'e_learning', status: 'completed', score: 90, completedAt: new Date('2025-04-10') },
    ].filter(l => l.employeeId);

    await db.learningRecord.createMany({ data: learningData as any });
    counts.learningRecords = learningData.length;

    // ─── 22. VENDORS & SUB-VENDORS ────────────────────────────────────
    const vendors = await db.$transaction([
      db.vendor.create({ data: { name: 'TechParts India', email: 'sales@techparts.in', phone: '+91-11-23456789', vendorCompany: 'TechParts India Pvt Ltd', serviceType: 'IT Hardware', status: 'active', rating: 4.5, companyId: marqCompany.id } }),
      db.vendor.create({ data: { name: 'CloudInfra Solutions', email: 'info@cloudinfra.in', phone: '+91-80-98765432', vendorCompany: 'CloudInfra Solutions Ltd', serviceType: 'Cloud Services', status: 'active', rating: 4.2, companyId: marqCompany.id } }),
      db.vendor.create({ data: { name: 'SteelCraft Industries', email: 'orders@steelcraft.in', phone: '+91-22-34567890', vendorCompany: 'SteelCraft Industries Ltd', serviceType: 'Raw Materials', status: 'active', rating: 4.0, companyId: acmeCompany.id } }),
      db.vendor.create({ data: { name: 'SafeGuard Equipments', email: 'sales@safeguard.in', phone: '+91-80-45678901', vendorCompany: 'SafeGuard Equipments Pvt Ltd', serviceType: 'Safety Equipment', status: 'active', rating: 3.8, companyId: acmeCompany.id } }),
    ]);
    counts.vendors = vendors.length;

    const subVendors = await db.$transaction([
      db.subVendor.create({ data: { companyName: 'MicroChips Corp', contactPerson: 'Sandeep Malhotra', email: 'sandeep@microchips.in', phone: '+91-11-87654321', city: 'Delhi', state: 'Delhi', country: 'India', specialization: 'Semiconductors', vendorId: vendors[0].id, isActive: true } }),
      db.subVendor.create({ data: { companyName: 'NetConnect Systems', contactPerson: 'Harish Rao', email: 'harish@netconnect.in', phone: '+91-80-76543210', city: 'Bengaluru', state: 'Karnataka', country: 'India', specialization: 'Networking', vendorId: vendors[0].id, isActive: true } }),
      db.subVendor.create({ data: { companyName: 'AlloyMasters', contactPerson: 'Ganesh Pai', email: 'ganesh@alloymasters.in', phone: '+91-22-65432109', city: 'Mumbai', state: 'Maharashtra', country: 'India', specialization: 'Steel Alloys', vendorId: vendors[2].id, isActive: true } }),
    ]);
    counts.subVendors = subVendors.length;

    // ─── 23. WORKFLOW DEFINITIONS ─────────────────────────────────────
    const workflowDefs = await db.$transaction([
      db.workflowDefinition.create({ data: { name: 'Leave Approval Workflow', type: 'approval', entity: 'leave', description: 'Standard leave approval process', isActive: true, companyId: marqCompany.id, steps: { create: [
        { name: 'Manager Approval', stepOrder: 1, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject' },
        { name: 'HR Approval', stepOrder: 2, approverRole: 'company_hr_admin', approverType: 'role', action: 'approve_reject' },
      ] } } }),
      db.workflowDefinition.create({ data: { name: 'Expense Approval Workflow', type: 'approval', entity: 'expense', description: 'Expense claim approval process', isActive: true, companyId: marqCompany.id, steps: { create: [
        { name: 'Manager Approval', stepOrder: 1, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject' },
        { name: 'Finance Approval', stepOrder: 2, approverRole: 'finance', approverType: 'role', action: 'approve_reject' },
      ] } } }),
      db.workflowDefinition.create({ data: { name: 'Leave Approval Workflow', type: 'approval', entity: 'leave', description: 'Standard leave approval process', isActive: true, companyId: acmeCompany.id, steps: { create: [
        { name: 'Supervisor Approval', stepOrder: 1, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject' },
        { name: 'HR Approval', stepOrder: 2, approverRole: 'company_hr_admin', approverType: 'role', action: 'approve_reject' },
      ] } } }),
    ]);
    counts.workflowDefinitions = workflowDefs.length;

    // ─── 24. AUDIT LOGS ───────────────────────────────────────────────
    const marqUsers = await db.user.findMany({ where: { companyId: marqCompany.id }, take: 6 });
    const acmeUsers = await db.user.findMany({ where: { companyId: acmeCompany.id }, take: 6 });

    const auditLogs = [
      { action: 'CREATE', entity: 'Company', details: 'Company MARQ AI Technologies created', userId: marqUsers[0]?.id, module: 'companies' },
      { action: 'CREATE', entity: 'Company', details: 'Company Acme Corp created', userId: acmeUsers[0]?.id, module: 'companies' },
      { action: 'UPDATE', entity: 'Employee', details: 'Employee MARQ003 profile updated', userId: marqUsers[1]?.id, module: 'employees' },
      { action: 'APPROVE', entity: 'Leave', details: 'Leave request approved for MARQ003', userId: marqUsers[4]?.id, module: 'leave' },
      { action: 'CREATE', entity: 'PayrollRecord', details: 'Payroll processed for January 2025 - MARQ', userId: marqUsers[5]?.id, module: 'payroll' },
      { action: 'LOGIN', entity: 'User', details: 'User logged in', userId: acmeUsers[0]?.id, module: 'auth' },
      { action: 'UPDATE', entity: 'HelpdeskTicket', details: 'Ticket HD-ACME-002 resolved', userId: acmeUsers[1]?.id, module: 'helpdesk' },
      { action: 'CREATE', entity: 'AssetAllocation', details: 'Laptop allocated to ACME001', userId: acmeUsers[1]?.id, module: 'assets' },
    ].filter(l => l.userId);

    await db.auditLog.createMany({ data: auditLogs as any });
    counts.auditLogs = auditLogs.length;

    // ─── 25. MEETINGS ─────────────────────────────────────────────────
    const meetings = await db.$transaction([
      db.meeting.create({ data: { companyId: marqCompany.id, title: 'Weekly Engineering Standup', description: 'Weekly sync for engineering team', date: new Date('2025-06-02'), startTime: '10:00', endTime: '10:30', location: 'Conference Room A', meetingType: 'in_person', status: 'scheduled', createdBy: marqEmps[0]?.id, invitations: { create: [
        { employeeId: marqEmps[2]?.id, rsvpStatus: 'accepted' },
        { employeeId: marqEmps[3]?.id, rsvpStatus: 'accepted' },
        { employeeId: marqEmps[8]?.id, rsvpStatus: 'pending' },
      ].filter(i => i.employeeId) } } }),
      db.meeting.create({ data: { companyId: marqCompany.id, title: 'Q2 Business Review', description: 'Quarterly business performance review', date: new Date('2025-06-05'), startTime: '14:00', endTime: '16:00', location: 'Main Conference Hall', meetingType: 'hybrid', status: 'scheduled', createdBy: marqEmps[0]?.id, invitations: { create: [
        { employeeId: marqEmps[1]?.id, rsvpStatus: 'accepted' },
        { employeeId: marqEmps[4]?.id, rsvpStatus: 'tentative' },
        { employeeId: marqEmps[5]?.id, rsvpStatus: 'accepted' },
      ].filter(i => i.employeeId) } } }),
      db.meeting.create({ data: { companyId: acmeCompany.id, title: 'Safety Committee Meeting', description: 'Monthly safety review and updates', date: new Date('2025-06-03'), startTime: '09:00', endTime: '10:00', location: 'Factory Conference Room', meetingType: 'in_person', status: 'scheduled', createdBy: acmeEmps[0]?.id, invitations: { create: [
        { employeeId: acmeEmps[2]?.id, rsvpStatus: 'accepted' },
        { employeeId: acmeEmps[6]?.id, rsvpStatus: 'accepted' },
      ].filter(i => i.employeeId) } } }),
      db.meeting.create({ data: { companyId: acmeCompany.id, title: 'Vendor Review Meeting', description: 'Review vendor performance and contracts', date: new Date('2025-06-10'), startTime: '11:00', endTime: '12:00', meetingType: 'virtual', status: 'scheduled', createdBy: acmeEmps[0]?.id, invitations: { create: [
        { employeeId: acmeEmps[3]?.id, rsvpStatus: 'pending' },
        { employeeId: acmeEmps[8]?.id, rsvpStatus: 'accepted' },
      ].filter(i => i.employeeId) } } }),
    ]);
    counts.meetings = meetings.length;

    // ─── 26. DOCUMENTS ────────────────────────────────────────────────
    const documents = [
      { name: 'offer_letter', title: 'Offer Letter - Arjun Sharma', type: 'offer_letter', docType: 'hr', accessLevel: 'hr-only', status: 'active', employeeId: marqEmps[0]?.id },
      { name: 'id_proof', title: 'Aadhaar Card - Rahul Verma', type: 'id_proof', docType: 'hr', accessLevel: 'hr-only', status: 'active', employeeId: marqEmps[2]?.id },
      { name: 'tax_document', title: 'Form 16 - Neha Gupta', type: 'tax', docType: 'finance', accessLevel: 'finance-only', status: 'active', employeeId: marqEmps[5]?.id },
      { name: 'safety_certificate', title: 'Safety Training Cert - Rajesh Pillai', type: 'certificate', docType: 'compliance', accessLevel: 'department', status: 'active', employeeId: acmeEmps[2]?.id },
      { name: 'contract', title: 'Employment Contract - Suresh Menon', type: 'contract', docType: 'hr', accessLevel: 'hr-only', status: 'active', employeeId: acmeEmps[0]?.id },
    ].filter(d => d.employeeId);

    await db.document.createMany({ data: documents as any });
    counts.documents = documents.length;

    // ─── 27. GOALS ────────────────────────────────────────────────────
    const goals = [
      { title: 'Complete LLM Platform v2', description: 'Deliver the MARQ AI Platform v2 on time', type: 'individual', category: 'engineering', progress: 45, status: 'in_progress', startDate: new Date('2025-01-15'), endDate: new Date('2025-09-30'), employeeId: marqEmps[0]?.id },
      { title: 'Improve Code Quality', description: 'Achieve 80% unit test coverage', type: 'individual', category: 'engineering', progress: 60, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'), employeeId: marqEmps[2]?.id },
      { title: 'Reduce Production Defects', description: 'Reduce defect rate by 25%', type: 'team', category: 'quality', progress: 30, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), employeeId: acmeEmps[0]?.id },
      { title: 'Supply Chain Optimization', description: 'Reduce lead time by 15%', type: 'individual', category: 'operations', progress: 20, status: 'in_progress', startDate: new Date('2025-02-01'), endDate: new Date('2025-12-31'), employeeId: acmeEmps[3]?.id },
    ].filter(g => g.employeeId);

    await db.goal.createMany({ data: goals as any });
    counts.goals = goals.length;

    // ─── 28. NOTIFICATIONS ────────────────────────────────────────────
    const notifications = [
      ...marqUsers.map(u => ({ title: 'Welcome to MARQ AI Technologies', message: 'Your account has been set up successfully.', type: 'info', category: 'general', isRead: false, userId: u.id })),
      ...acmeUsers.map(u => ({ title: 'Welcome to Acme Corp', message: 'Your account has been set up successfully.', type: 'info', category: 'general', isRead: false, userId: u.id })),
      { title: 'Leave Approved', message: 'Your casual leave request has been approved.', type: 'success', category: 'leave', isRead: false, userId: marqUsers[2]?.id },
      { title: 'Payroll Processed', message: 'February 2025 payroll has been processed.', type: 'info', category: 'payroll', isRead: true, userId: marqUsers[0]?.id },
      { title: 'Safety Training Due', message: 'Please complete safety training by June 30.', type: 'warning', category: 'compliance', isRead: false, userId: acmeUsers[2]?.id },
    ].filter(n => n.userId);

    await db.notification.createMany({ data: notifications });
    counts.notifications = notifications.length;

    // ─── 29. TICKETS (Simple Helpdesk) ────────────────────────────────
    const tickets = [
      { subject: 'VPN connection issues', description: 'Cannot connect to VPN since morning', category: 'IT', priority: 'high', status: 'open', employeeId: marqEmps[8]?.id },
      { subject: 'Printer not working', description: '3rd floor printer showing offline', category: 'IT', priority: 'low', status: 'resolved', resolution: 'Replaced printer toner', employeeId: marqEmps[11]?.id },
      { subject: 'Access card not working', description: 'My access card is not recognized at gate', category: 'Admin', priority: 'medium', status: 'in_progress', employeeId: acmeEmps[10]?.id },
    ].filter(t => t.employeeId);

    await db.ticket.createMany({ data: tickets as any });
    counts.tickets = tickets.length;

    // ─── 30. CLIENTS ──────────────────────────────────────────────────
    const clients = await db.$transaction([
      db.client.create({ data: { name: 'Bharat Bank', email: 'procurement@bharatbank.in', phone: '+91-22-11111111', clientCompany: 'Bharat Bank Ltd', industry: 'Banking', contractStart: new Date('2024-01-01'), contractEnd: new Date('2026-12-31'), status: 'active', companyId: marqCompany.id } }),
      db.client.create({ data: { name: 'MediCare Hospitals', email: 'it@medicare.in', phone: '+91-80-22222222', clientCompany: 'MediCare Hospitals Group', industry: 'Healthcare', contractStart: new Date('2024-06-01'), contractEnd: new Date('2025-12-31'), status: 'active', companyId: marqCompany.id } }),
      db.client.create({ data: { name: 'AutoTech Motors', email: 'supply@autotech.in', phone: '+91-20-33333333', clientCompany: 'AutoTech Motors Ltd', industry: 'Automotive', contractStart: new Date('2023-01-01'), contractEnd: new Date('2027-01-01'), status: 'active', companyId: acmeCompany.id } }),
    ]);
    counts.clients = clients.length;

    // ─── 31. SKILLS ───────────────────────────────────────────────────
    const skills = await db.$transaction([
      db.skill.upsert({ where: { name: 'Machine Learning' }, update: {}, create: { name: 'Machine Learning', category: 'Engineering', description: 'ML model development and deployment' } }),
      db.skill.upsert({ where: { name: 'React' }, update: {}, create: { name: 'React', category: 'Frontend', description: 'React.js web development' } }),
      db.skill.upsert({ where: { name: 'Python' }, update: {}, create: { name: 'Python', category: 'Programming', description: 'Python programming language' } }),
      db.skill.upsert({ where: { name: 'Supply Chain Management' }, update: {}, create: { name: 'Supply Chain Management', category: 'Operations', description: 'SCM processes and optimization' } }),
      db.skill.upsert({ where: { name: 'Six Sigma' }, update: {}, create: { name: 'Six Sigma', category: 'Quality', description: 'Six Sigma quality management' } }),
    ]);

    // Assign skills to employees
    const empSkillData = [];
    if (marqEmps[0]?.id && skills[0]?.id) empSkillData.push({ employeeId: marqEmps[0].id, skillId: skills[0].id, proficiency: 'expert', yearsExp: 7 });
    if (marqEmps[2]?.id && skills[2]?.id) empSkillData.push({ employeeId: marqEmps[2].id, skillId: skills[2].id, proficiency: 'expert', yearsExp: 5 });
    if (marqEmps[10]?.id && skills[1]?.id) empSkillData.push({ employeeId: marqEmps[10].id, skillId: skills[1].id, proficiency: 'advanced', yearsExp: 3 });
    if (acmeEmps[3]?.id && skills[3]?.id) empSkillData.push({ employeeId: acmeEmps[3].id, skillId: skills[3].id, proficiency: 'advanced', yearsExp: 6 });
    if (acmeEmps[5]?.id && skills[4]?.id) empSkillData.push({ employeeId: acmeEmps[5].id, skillId: skills[4].id, proficiency: 'intermediate', yearsExp: 2 });

    await db.employeeSkill.createMany({ data: empSkillData });
    counts.skills = skills.length;

    // ─── 32. SHIFT MEMBERS ────────────────────────────────────────────
    const shiftMemberData = [];
    const generalShifts = shifts.filter(s => s.name.includes('General'));
    for (const emp of createdEmployees.slice(0, 8)) {
      const shift = generalShifts.find(s => s.companyId === emp.companyId);
      if (shift) {
        shiftMemberData.push({ shiftId: shift.id, employeeId: emp.id, effectiveDate: new Date('2025-01-01') });
      }
    }
    await db.shiftMember.createMany({ data: shiftMemberData });
    counts.shiftMembers = shiftMemberData.length;

    // ─── 33. ONBOARDING TASKS ─────────────────────────────────────────
    const onboardingTasks = [
      { title: 'Complete IT setup', description: 'Get laptop, email, and system access', category: 'it', status: 'completed', completedAt: new Date('2025-05-16'), employeeId: marqEmps[10]?.id },
      { title: 'HR orientation', description: 'Attend HR orientation session', category: 'hr', status: 'completed', completedAt: new Date('2025-05-17'), employeeId: marqEmps[10]?.id },
      { title: 'Team introduction', description: 'Meet with team members and lead', category: 'general', status: 'in_progress', employeeId: marqEmps[10]?.id },
      { title: 'Complete IT setup', description: 'Get workstation and access cards', category: 'it', status: 'in_progress', employeeId: acmeEmps[11]?.id },
      { title: 'Safety training', description: 'Complete mandatory safety training', category: 'compliance', status: 'pending', dueDate: new Date('2025-02-15'), employeeId: acmeEmps[11]?.id },
    ].filter(t => t.employeeId);

    await db.onboardingTask.createMany({ data: onboardingTasks as any });
    counts.onboardingTasks = onboardingTasks.length;

    // ─── 34. EXPENSE CLAIMS ───────────────────────────────────────────
    const expenseClaims = [
      { type: 'travel', amount: 15000, description: 'Client visit to Mumbai', status: 'approved', employeeId: marqEmps[4]?.id, approverId: marqEmps[0]?.id },
      { type: 'equipment', amount: 5000, description: 'Keyboard and mouse purchase', status: 'pending', employeeId: marqEmps[8]?.id },
      { type: 'travel', amount: 8000, description: 'Factory site visit - Pune', status: 'approved', employeeId: acmeEmps[2]?.id, approverId: acmeEmps[0]?.id },
      { type: 'training', amount: 25000, description: 'AWS certification exam fee', status: 'pending', employeeId: acmeEmps[5]?.id },
    ].filter(e => e.employeeId);

    await db.expenseClaim.createMany({ data: expenseClaims as any });
    counts.expenseClaims = expenseClaims.length;

    // ─── 35. TRAVEL REQUESTS ──────────────────────────────────────────
    const travelRequests = [
      { purpose: 'Client meeting - Bharat Bank', destination: 'Mumbai', departureDate: new Date('2025-06-15'), returnDate: new Date('2025-06-17'), estimatedCost: 30000, approvedCost: 28000, status: 'approved', employeeId: marqEmps[4]?.id, approverId: marqEmps[0]?.id },
      { purpose: 'Vendor audit - SteelCraft', destination: 'Pune', departureDate: new Date('2025-07-01'), returnDate: new Date('2025-07-02'), estimatedCost: 15000, status: 'pending', employeeId: acmeEmps[3]?.id },
    ].filter(t => t.employeeId);

    await db.travelRequest.createMany({ data: travelRequests as any });
    counts.travelRequests = travelRequests.length;

    // ─── 36. SURVEYS ──────────────────────────────────────────────────
    const surveys = await db.$transaction([
      db.survey.create({ data: { title: 'Employee Engagement Q2 2025', description: 'Quarterly employee engagement survey', type: 'pulse', status: 'active', startDate: new Date('2025-06-01'), endDate: new Date('2025-06-15'), companyId: marqCompany.id, questions: { create: [
        { question: 'How satisfied are you with your role?', type: 'rating', required: true, order: 1 },
        { question: 'How would you rate work-life balance?', type: 'rating', required: true, order: 2 },
        { question: 'Any suggestions for improvement?', type: 'text', required: false, order: 3 },
      ] } } }),
      db.survey.create({ data: { title: 'Workplace Safety Survey', description: 'Annual safety culture assessment', type: 'annual', status: 'active', startDate: new Date('2025-06-01'), endDate: new Date('2025-06-30'), companyId: acmeCompany.id, questions: { create: [
        { question: 'How safe do you feel at the workplace?', type: 'rating', required: true, order: 1 },
        { question: 'Are safety protocols followed consistently?', type: 'rating', required: true, order: 2 },
      ] } } }),
    ]);
    counts.surveys = surveys.length;

    // ─── 37. ROLES ────────────────────────────────────────────────────
    const roles = await db.$transaction([
      db.role.upsert({ where: { name: 'super_admin' }, update: {}, create: { name: 'super_admin', description: 'Super Administrator with full access', isSystem: true, level: 1, dashboard: 'admin', color: 'red' } }),
      db.role.upsert({ where: { name: 'company_hr_admin' }, update: {}, create: { name: 'company_hr_admin', description: 'Company HR Administrator', isSystem: true, level: 2, dashboard: 'hr', color: 'purple' } }),
      db.role.upsert({ where: { name: 'hr_executive' }, update: {}, create: { name: 'hr_executive', description: 'HR Executive', isSystem: true, level: 3, dashboard: 'hr', color: 'pink' } }),
      db.role.upsert({ where: { name: 'dept_head' }, update: {}, create: { name: 'dept_head', description: 'Department Head', isSystem: true, level: 3, dashboard: 'manager', color: 'orange' } }),
      db.role.upsert({ where: { name: 'reporting_manager' }, update: {}, create: { name: 'reporting_manager', description: 'Reporting Manager', isSystem: true, level: 3, dashboard: 'manager', color: 'yellow' } }),
      db.role.upsert({ where: { name: 'employee' }, update: {}, create: { name: 'employee', description: 'Standard Employee', isSystem: true, level: 4, dashboard: 'employee', color: 'green' } }),
      db.role.upsert({ where: { name: 'finance' }, update: {}, create: { name: 'finance', description: 'Finance Team Member', isSystem: true, level: 3, dashboard: 'finance', color: 'blue' } }),
    ]);
    counts.roles = roles.length;

    // ─── 38. COMPLIANCE ITEMS ─────────────────────────────────────────
    const complianceItems = [
      { title: 'Annual Fire Safety Audit', description: 'Fire safety compliance audit for all premises', category: 'safety', dueDate: new Date('2025-07-31'), status: 'in_progress', assignee: acmeEmps[6]?.id, companyId: acmeCompany.id },
      { title: 'GDPR Compliance Review', description: 'Annual GDPR compliance review', category: 'data_privacy', dueDate: new Date('2025-09-30'), status: 'pending', assignee: marqEmps[0]?.id, companyId: marqCompany.id },
      { title: 'ISO 27001 Recertification', description: 'ISO 27001 information security recertification', category: 'certification', dueDate: new Date('2025-12-31'), status: 'in_progress', assignee: marqEmps[8]?.id, companyId: marqCompany.id },
    ].filter(c => c.assignee);

    await db.complianceItem.createMany({ data: complianceItems as any });
    counts.complianceItems = complianceItems.length;

    // ─── 39. TIMESHEETS ───────────────────────────────────────────────
    const timesheetData = [];
    for (const emp of createdEmployees.slice(0, 6)) {
      const weekStart = new Date('2025-05-26');
      const weekEnd = new Date('2025-05-30');
      timesheetData.push({
        employeeId: emp.id,
        weekStart,
        weekEnd,
        totalHours: 40,
        status: 'approved',
        approvedBy: emp.companyId === marqCompany.id ? marqEmps[0]?.id : acmeEmps[0]?.id,
        approvedAt: new Date('2025-06-01'),
      });
    }
    await db.timesheet.createMany({ data: timesheetData.filter(t => t.employeeId) });
    counts.timesheets = timesheetData.length;

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      counts,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error', counts },
      { status: 500 }
    );
  }
}
