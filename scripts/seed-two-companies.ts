import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
const d = (s: string) => new Date(s);
const daysAgo = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() - n); dt.setHours(0,0,0,0); return dt; };
const daysFromNow = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() + n); dt.setHours(0,0,0,0); return dt; };
const today = () => { const dt = new Date(); dt.setHours(0,0,0,0); return dt; };

// ─── Delete all existing data in correct dependency order ──────────────────────
async function deleteAllData() {
  console.log('🗑️  Deleting all existing data...');

  // Delete in reverse dependency order
  const deleteOps = [
    () => prisma.workflowStepInstance.deleteMany(),
    () => prisma.workflowInstance.deleteMany(),
    () => prisma.workflowStepDef.deleteMany(),
    () => prisma.workflowDefinition.deleteMany(),
    () => prisma.surveyResponse.deleteMany(),
    () => prisma.surveyQuestion.deleteMany(),
    () => prisma.survey.deleteMany(),
    () => prisma.taskComment.deleteMany(),
    () => prisma.taskAssignment.deleteMany(),
    () => prisma.task.deleteMany(),
    () => prisma.timesheetEntry.deleteMany(),
    () => prisma.timesheet.deleteMany(),
    () => prisma.projectMilestone.deleteMany(),
    () => prisma.projectMember.deleteMany(),
    () => prisma.project.deleteMany(),
    () => prisma.helpdeskTicketComment.deleteMany(),
    () => prisma.helpdeskTicket.deleteMany(),
    () => prisma.shiftMember.deleteMany(),
    () => prisma.shift.deleteMany(),
    () => prisma.employeeSkill.deleteMany(),
    () => prisma.skill.deleteMany(),
    () => prisma.userRoleAssignment.deleteMany(),
    () => prisma.rolePermission.deleteMany(),
    () => prisma.role.deleteMany(),
    () => prisma.auditLog.deleteMany(),
    () => prisma.notification.deleteMany(),
    () => prisma.complianceItem.deleteMany(),
    () => prisma.manpowerRequisition.deleteMany(),
    () => prisma.companyPolicy.deleteMany(),
    () => prisma.alumniRecord.deleteMany(),
    () => prisma.onboardingTask.deleteMany(),
    () => prisma.document.deleteMany(),
    () => prisma.subVendor.deleteMany(),
    () => prisma.vendor.deleteMany(),
    () => prisma.client.deleteMany(),
    () => prisma.ticket.deleteMany(),
    () => prisma.learningRecord.deleteMany(),
    () => prisma.expenseClaim.deleteMany(),
    () => prisma.travelRequest.deleteMany(),
    () => prisma.assetAllocation.deleteMany(),
    () => prisma.performance.deleteMany(),
    () => prisma.performanceReview.deleteMany(),
    () => prisma.reviewCycle.deleteMany(),
    () => prisma.goal.deleteMany(),
    () => prisma.payrollRecord.deleteMany(),
    () => prisma.payrollStructure.deleteMany(),
    () => prisma.leave.deleteMany(),
    () => prisma.leavePolicy.deleteMany(),
    () => prisma.attendance.deleteMany(),
    () => prisma.aIInterview.deleteMany(),
    () => prisma.interview.deleteMany(),
    () => prisma.candidate.deleteMany(),
    () => prisma.job.deleteMany(),
    () => prisma.employee.deleteMany(),
    () => prisma.user.deleteMany(),
    () => prisma.department.deleteMany(),
    () => prisma.branch.deleteMany(),
    () => prisma.company.deleteMany(),
  ];

  for (const op of deleteOps) {
    try { await op(); } catch (e) { /* continue */ }
  }
  console.log('✅ All existing data deleted');
}

// ─── Company Config ───────────────────────────────────────────────────────────
interface CompanyConfig {
  code: string;
  name: string;
  industry: string;
  country: string;
  currency: string;
  timezone: string;
  domain: string;
  headquarters: string;
  prefix: string; // prefix for IDs
}

const MARQ: CompanyConfig = {
  code: 'MARQ',
  name: 'MARQ AI Technologies',
  industry: 'AI & Technology',
  country: 'IN',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  domain: 'marqai.tech',
  headquarters: 'Bangalore, Karnataka',
  prefix: 'MQ',
};

const TCG: CompanyConfig = {
  code: 'TCG',
  name: 'TechCorp Global',
  industry: 'IT Services',
  country: 'US',
  currency: 'USD',
  timezone: 'America/Los_Angeles',
  domain: 'techcorp.com',
  headquarters: 'San Francisco, CA',
  prefix: 'TC',
};

// ─── Seed a single company with all module data ───────────────────────────────
async function seedCompany(cfg: CompanyConfig) {
  const p = cfg.prefix;
  console.log(`\n🏢 Seeding company: ${cfg.name} (${cfg.code})`);

  // ═══════════════════════ 1. COMPANY ═══════════════════════
  const company = await prisma.company.create({
    data: {
      name: cfg.name,
      code: cfg.code,
      industry: cfg.industry,
      country: cfg.country,
      currency: cfg.currency,
      timezone: cfg.timezone,
      domain: cfg.domain,
      isActive: true,
    },
  });

  // ═══════════════════════ 2. BRANCHES ═══════════════════════
  const branchData = cfg.code === 'MARQ'
    ? [
        { name: 'Bangalore HQ', code: `${p}-BLR`, city: 'Bangalore', state: 'Karnataka', country: 'IN', address: 'Whitefield, Bangalore 560066' },
        { name: 'Mumbai Office', code: `${p}-MUM`, city: 'Mumbai', state: 'Maharashtra', country: 'IN', address: 'BKC, Mumbai 400051' },
        { name: 'Hyderabad Dev Center', code: `${p}-HYD`, city: 'Hyderabad', state: 'Telangana', country: 'IN', address: 'HITEC City, Hyderabad 500081' },
      ]
    : [
        { name: 'San Francisco HQ', code: `${p}-SF`, city: 'San Francisco', state: 'CA', country: 'US', address: '101 Market St, San Francisco, CA 94105' },
        { name: 'New York Office', code: `${p}-NY`, city: 'New York', state: 'NY', country: 'US', address: '350 5th Ave, New York, NY 10118' },
        { name: 'Austin Tech Hub', code: `${p}-AUS`, city: 'Austin', state: 'TX', country: 'US', address: '200 Congress Ave, Austin, TX 78701' },
      ];

  const branches = await Promise.all(
    branchData.map((b, i) =>
      prisma.branch.create({
        data: { ...b, isActive: true, companyId: company.id },
      })
    )
  );

  // ═══════════════════════ 3. DEPARTMENTS ═══════════════════════
  const deptNames = ['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Design'];
  const departments = await Promise.all(
    deptNames.map((name, i) =>
      prisma.department.create({
        data: {
          name,
          code: name.substring(0, 3).toUpperCase(),
          description: `${name} Department`,
          isActive: true,
          companyId: company.id,
        },
      })
    )
  );
  const [engDept, hrDept, finDept, opsDept, salesDept, designDept] = departments;

  // ═══════════════════════ 4. ROLES & PERMISSIONS ═══════════════════════
  const roleDefs = [
    { name: 'super_admin', description: 'Super Administrator with full access', isSystem: true },
    { name: 'company_hr_admin', description: 'Company HR Administrator', isSystem: false },
    { name: 'manager', description: 'Department Manager', isSystem: false },
    { name: 'employee', description: 'Regular Employee', isSystem: false },
    { name: 'finance', description: 'Finance Team Member', isSystem: false },
  ];

  const modules = ['employees', 'leaves', 'payroll', 'attendance', 'recruitment', 'performance', 'assets', 'travel', 'expenses', 'helpdesk', 'projects', 'reports', 'settings', 'compliance', 'learning'];

  const roles = await Promise.all(
    roleDefs.map(rd =>
      prisma.role.create({
        data: {
          name: `${cfg.code}_${rd.name}`,
          description: rd.description,
          isSystem: rd.isSystem,
          companyId: company.id,
        },
      })
    )
  );
  const [superAdminRole, hrAdminRole, managerRole, employeeRole, financeRole] = roles;

  // Role permissions
  const permData: { roleId: string; module: string; canRead: boolean; canWrite: boolean; canDelete: boolean; canExport: boolean }[] = [];
  for (const role of roles) {
    const isSuperAdmin = role.name.includes('super_admin');
    const isHrAdmin = role.name.includes('company_hr_admin');
    const isManager = role.name.includes('manager');
    const isFinance = role.name.includes('finance');
    for (const mod of modules) {
      permData.push({
        roleId: role.id,
        module: mod,
        canRead: true,
        canWrite: isSuperAdmin || isHrAdmin || isManager || (isFinance && ['payroll','expenses','reports'].includes(mod)),
        canDelete: isSuperAdmin || isHrAdmin,
        canExport: isSuperAdmin || isHrAdmin || isFinance || isManager,
      });
    }
  }
  await prisma.rolePermission.createMany({ data: permData });

  // ═══════════════════════ 5. USERS ═══════════════════════
  const defaultPassword = await hashPassword('admin123');
  const empPassword = await hashPassword('employee123');

  const employeeDefs = cfg.code === 'MARQ'
    ? [
        { empId: 'MQ-001', fn: 'Aarav', ln: 'Sharma', email: 'aarav.sharma@marqai.tech', phone: '+91-9876543201', designation: 'VP Engineering', jobTitle: 'VP Engineering', dept: engDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2020-01-15', role: 'manager', dob: '1985-06-15', gender: 'male', city: 'Bangalore', state: 'Karnataka', country: 'IN' },
        { empId: 'MQ-002', fn: 'Meera', ln: 'Patel', email: 'meera.patel@marqai.tech', phone: '+91-9876543202', designation: 'HR Manager', jobTitle: 'HR Manager', dept: hrDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2020-05-01', role: 'company_hr_admin', dob: '1988-03-22', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN' },
        { empId: 'MQ-003', fn: 'Vikram', ln: 'Singh', email: 'vikram.singh@marqai.tech', phone: '+91-9876543203', designation: 'Senior ML Engineer', jobTitle: 'Senior ML Engineer', dept: engDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2021-03-10', role: 'employee', dob: '1990-11-08', gender: 'male', city: 'Bangalore', state: 'Karnataka', country: 'IN' },
        { empId: 'MQ-004', fn: 'Ananya', ln: 'Reddy', email: 'ananya.reddy@marqai.tech', phone: '+91-9876543204', designation: 'Product Designer', jobTitle: 'Product Designer', dept: designDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2022-01-20', role: 'employee', dob: '1993-07-14', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN' },
        { empId: 'MQ-005', fn: 'Rohan', ln: 'Joshi', email: 'rohan.joshi@marqai.tech', phone: '+91-9876543205', designation: 'Finance Analyst', jobTitle: 'Finance Analyst', dept: finDept, branch: branches[1], type: 'full-time', status: 'active', jDate: '2022-09-05', role: 'finance', dob: '1991-04-30', gender: 'male', city: 'Mumbai', state: 'Maharashtra', country: 'IN' },
        { empId: 'MQ-006', fn: 'Priya', ln: 'Nair', email: 'priya.nair@marqai.tech', phone: '+91-9876543206', designation: 'Tech Lead', jobTitle: 'Tech Lead - AI', dept: engDept, branch: branches[2], type: 'full-time', status: 'active', jDate: '2021-11-01', role: 'manager', dob: '1987-12-03', gender: 'female', city: 'Hyderabad', state: 'Telangana', country: 'IN' },
        { empId: 'MQ-007', fn: 'Arjun', ln: 'Kumar', email: 'arjun.kumar@marqai.tech', phone: '+91-9876543207', designation: 'Sales Executive', jobTitle: 'Sales Executive', dept: salesDept, branch: branches[1], type: 'full-time', status: 'active', jDate: '2023-04-12', role: 'employee', dob: '1994-09-18', gender: 'male', city: 'Mumbai', state: 'Maharashtra', country: 'IN' },
        { empId: 'MQ-008', fn: 'Sneha', ln: 'Gupta', email: 'sneha.gupta@marqai.tech', phone: '+91-9876543208', designation: 'Operations Manager', jobTitle: 'Operations Manager', dept: opsDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2021-08-15', role: 'manager', dob: '1989-02-25', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN' },
        { empId: 'MQ-009', fn: 'Rajesh', ln: 'Verma', email: 'rajesh.verma@marqai.tech', phone: '+91-9876543209', designation: 'Backend Developer', jobTitle: 'Backend Developer', dept: engDept, branch: branches[2], type: 'full-time', status: 'probation', jDate: '2024-09-01', role: 'employee', dob: '1996-05-11', gender: 'male', city: 'Hyderabad', state: 'Telangana', country: 'IN' },
        { empId: 'MQ-010', fn: 'Kavitha', ln: 'Menon', email: 'kavitha.menon@marqai.tech', phone: '+91-9876543210', designation: 'Data Scientist', jobTitle: 'Data Scientist', dept: engDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2022-06-20', role: 'employee', dob: '1992-10-07', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN' },
      ]
    : [
        { empId: 'TC-001', fn: 'Sarah', ln: 'Johnson', email: 'sarah.johnson@techcorp.com', phone: '+1-415-555-0001', designation: 'VP Engineering', jobTitle: 'VP Engineering', dept: engDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2019-06-15', role: 'manager', dob: '1984-08-20', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US' },
        { empId: 'TC-002', fn: 'Michael', ln: 'Brown', email: 'michael.brown@techcorp.com', phone: '+1-212-555-0002', designation: 'HR Director', jobTitle: 'HR Director', dept: hrDept, branch: branches[1], type: 'full-time', status: 'active', jDate: '2020-02-01', role: 'company_hr_admin', dob: '1986-11-12', gender: 'male', city: 'New York', state: 'NY', country: 'US' },
        { empId: 'TC-003', fn: 'Emily', ln: 'Chen', email: 'emily.chen@techcorp.com', phone: '+1-415-555-0003', designation: 'Senior Software Engineer', jobTitle: 'Senior Software Engineer', dept: engDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2021-03-10', role: 'employee', dob: '1990-04-15', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US' },
        { empId: 'TC-004', fn: 'David', ln: 'Wilson', email: 'david.wilson@techcorp.com', phone: '+1-415-555-0004', designation: 'UX Lead', jobTitle: 'UX Lead', dept: designDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2021-07-20', role: 'employee', dob: '1989-09-28', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US' },
        { empId: 'TC-005', fn: 'Lisa', ln: 'Anderson', email: 'lisa.anderson@techcorp.com', phone: '+1-512-555-0005', designation: 'Finance Manager', jobTitle: 'Finance Manager', dept: finDept, branch: branches[2], type: 'full-time', status: 'active', jDate: '2020-11-01', role: 'finance', dob: '1987-01-05', gender: 'female', city: 'Austin', state: 'TX', country: 'US' },
        { empId: 'TC-006', fn: 'James', ln: 'Martinez', email: 'james.martinez@techcorp.com', phone: '+1-415-555-0006', designation: 'DevOps Lead', jobTitle: 'DevOps Lead', dept: engDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2022-01-15', role: 'employee', dob: '1991-06-30', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US' },
        { empId: 'TC-007', fn: 'Amanda', ln: 'Taylor', email: 'amanda.taylor@techcorp.com', phone: '+1-212-555-0007', designation: 'Sales Manager', jobTitle: 'Sales Manager', dept: salesDept, branch: branches[1], type: 'full-time', status: 'active', jDate: '2021-05-10', role: 'manager', dob: '1988-12-18', gender: 'female', city: 'New York', state: 'NY', country: 'US' },
        { empId: 'TC-008', fn: 'Robert', ln: 'Garcia', email: 'robert.garcia@techcorp.com', phone: '+1-512-555-0008', designation: 'Operations Lead', jobTitle: 'Operations Lead', dept: opsDept, branch: branches[2], type: 'full-time', status: 'active', jDate: '2022-04-01', role: 'employee', dob: '1990-03-22', gender: 'male', city: 'Austin', state: 'TX', country: 'US' },
        { empId: 'TC-009', fn: 'Jessica', ln: 'Lee', email: 'jessica.lee@techcorp.com', phone: '+1-415-555-0009', designation: 'Frontend Developer', jobTitle: 'Frontend Developer', dept: engDept, branch: branches[0], type: 'full-time', status: 'probation', jDate: '2024-10-01', role: 'employee', dob: '1995-07-09', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US' },
        { empId: 'TC-010', fn: 'Daniel', ln: 'Kim', email: 'daniel.kim@techcorp.com', phone: '+1-415-555-0010', designation: 'Data Engineer', jobTitle: 'Data Engineer', dept: engDept, branch: branches[0], type: 'full-time', status: 'active', jDate: '2023-02-14', role: 'employee', dob: '1993-10-02', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US' },
      ];

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: `admin@${cfg.domain}`,
      password: defaultPassword,
      name: `${cfg.code} Admin`,
      role: 'super_admin',
      isActive: true,
      companyId: company.id,
      lastLogin: daysAgo(1),
    },
  });

  // Create employee users
  const users: { id: string; email: string; name: string }[] = [adminUser];
  const employees: { id: string; employeeId: string; email: string; firstName: string; lastName: string; designation: string; departmentId: string; branchId: string | null; userId: string | null; companyId: string }[] = [];

  for (const ed of employeeDefs) {
    const pw = ed.role === 'manager' || ed.role === 'company_hr_admin' || ed.role === 'finance' ? defaultPassword : empPassword;
    const user = await prisma.user.create({
      data: {
        email: ed.email,
        password: pw,
        name: `${ed.fn} ${ed.ln}`,
        role: ed.role,
        isActive: true,
        companyId: company.id,
        lastLogin: Math.random() > 0.3 ? daysAgo(Math.floor(Math.random() * 7)) : null,
      },
    });
    users.push(user);

    const emp = await prisma.employee.create({
      data: {
        employeeId: ed.empId,
        firstName: ed.fn,
        lastName: ed.ln,
        email: ed.email,
        phone: ed.phone,
        designation: ed.designation,
        jobTitle: ed.jobTitle,
        employmentType: ed.type,
        status: ed.status,
        joiningDate: d(ed.jDate),
        probationEnd: ed.status === 'probation' ? d('2025-06-01') : null,
        dateOfBirth: d(ed.dob),
        gender: ed.gender,
        city: ed.city,
        state: ed.state,
        country: ed.country,
        nationality: ed.country === 'IN' ? 'Indian' : 'American',
        emergencyContact: ed.fn === 'Aarav' || ed.fn === 'Sarah' ? `${ed.fn}'s Emergency` : null,
        emergencyPhone: ed.phone ? ed.phone.replace(/\d{4}$/, '9999') : null,
        companyId: company.id,
        departmentId: ed.dept.id,
        branchId: ed.branch.id,
        userId: user.id,
      },
    });
    employees.push(emp);
  }

  // Set reporting managers
  // emp[0] = VP/manager, emp[1] = HR, emp[5] = Tech Lead/manager
  const managerIds = [employees[0].id, employees[5].id];
  for (let i = 2; i < employees.length; i++) {
    if (i === 1 || i === 5 || i === 7) continue; // HR and other managers skip
    await prisma.employee.update({
      where: { id: employees[i].id },
      data: { reportingManagerId: i < 5 ? managerIds[0] : managerIds[1] },
    });
  }

  // UserRoleAssignments
  const roleAssignments = [
    { userId: adminUser.id, roleId: superAdminRole.id },
    { userId: users[1].id, roleId: hrAdminRole.id }, // HR person
  ];
  for (const ra of roleAssignments) {
    await prisma.userRoleAssignment.create({ data: ra });
  }
  // Assign manager role to managers
  for (let i = 0; i < employees.length; i++) {
    const ed = employeeDefs[i];
    if (ed.role === 'manager') {
      await prisma.userRoleAssignment.create({ data: { userId: users[i + 1].id, roleId: managerRole.id } });
    }
    if (ed.role === 'finance') {
      await prisma.userRoleAssignment.create({ data: { userId: users[i + 1].id, roleId: financeRole.id } });
    }
  }

  // ═══════════════════════ 6. JOBS ═══════════════════════
  const salaryRange = cfg.code === 'MARQ'
    ? { min: 1200000, max: 3500000 }
    : { min: 90000, max: 200000 };

  const jobDefs = cfg.code === 'MARQ'
    ? [
        { title: 'Senior Full-Stack Developer', dept: 'Engineering', loc: 'Bangalore', expMin: 5, expMax: 8, salMin: 1800000, salMax: 3000000, status: 'open', priority: 'high', positions: 2 },
        { title: 'AI/ML Research Scientist', dept: 'Engineering', loc: 'Hyderabad', expMin: 4, expMax: 7, salMin: 2000000, salMax: 3500000, status: 'open', priority: 'urgent', positions: 1 },
        { title: 'HR Business Partner', dept: 'HR', loc: 'Mumbai', expMin: 6, expMax: 10, salMin: 1200000, salMax: 1800000, status: 'open', priority: 'medium', positions: 1 },
        { title: 'Product Designer', dept: 'Design', loc: 'Bangalore', expMin: 3, expMax: 6, salMin: 1000000, salMax: 1800000, status: 'draft', priority: 'medium', positions: 1 },
        { title: 'Data Engineer', dept: 'Engineering', loc: 'Bangalore', expMin: 3, expMax: 5, salMin: 1500000, salMax: 2200000, status: 'open', priority: 'high', positions: 2 },
      ]
    : [
        { title: 'Senior Full-Stack Developer', dept: 'Engineering', loc: 'San Francisco, CA', expMin: 5, expMax: 8, salMin: 140000, salMax: 180000, status: 'open', priority: 'high', positions: 2 },
        { title: 'Cloud Infrastructure Engineer', dept: 'Engineering', loc: 'Austin, TX', expMin: 4, expMax: 7, salMin: 120000, salMax: 160000, status: 'open', priority: 'medium', positions: 1 },
        { title: 'UX Research Lead', dept: 'Design', loc: 'San Francisco, CA', expMin: 6, expMax: 9, salMin: 130000, salMax: 165000, status: 'open', priority: 'high', positions: 1 },
        { title: 'Sales Executive', dept: 'Sales', loc: 'New York, NY', expMin: 3, expMax: 5, salMin: 80000, salMax: 110000, status: 'draft', priority: 'low', positions: 3 },
        { title: 'DevOps Engineer', dept: 'Engineering', loc: 'Remote', expMin: 3, expMax: 6, salMin: 110000, salMax: 150000, status: 'open', priority: 'medium', positions: 1 },
      ];

  const jobs = await Promise.all(
    jobDefs.map(jd =>
      prisma.job.create({
        data: {
          title: jd.title,
          description: `We are looking for a ${jd.title} to join our ${jd.dept} team at ${cfg.name}.`,
          requirements: 'Strong technical skills, team collaboration, communication',
          department: jd.dept,
          location: jd.loc,
          employmentType: 'Full-time',
          experienceMin: jd.expMin,
          experienceMax: jd.expMax,
          salaryMin: jd.salMin,
          salaryMax: jd.salMax,
          status: jd.status,
          priority: jd.priority,
          positions: jd.positions,
          postedDate: jd.status !== 'draft' ? daysAgo(15 + Math.floor(Math.random() * 30)) : null,
          companyId: company.id,
        },
      })
    )
  );

  // ═══════════════════════ 7. CANDIDATES ═══════════════════════
  const candidateDefs = cfg.code === 'MARQ'
    ? [
        { fn: 'Rahul', ln: 'Verma', email: 'rahul.verma@email.com', company: 'Infosys', title: 'Senior Developer', exp: 6, sal: 2200000, status: 'interviewing', source: 'LinkedIn' },
        { fn: 'Sneha', ln: 'Kapoor', email: 'sneha.kapoor@email.com', company: 'TCS', title: 'ML Engineer', exp: 4, sal: 2500000, status: 'shortlisted', source: 'Naukri' },
        { fn: 'Vikram', ln: 'Malhotra', email: 'vikram.m@email.com', company: 'Wipro', title: 'Data Engineer', exp: 5, sal: 1800000, status: 'applied', source: 'Referral' },
        { fn: 'Anita', ln: 'Bose', email: 'anita.bose@email.com', company: 'Accenture', title: 'HR Manager', exp: 8, sal: 1500000, status: 'offered', source: 'Naukri' },
        { fn: 'Deepak', ln: 'Chopra', email: 'deepak.c@email.com', company: 'Cognizant', title: 'Full Stack Dev', exp: 3, sal: 1600000, status: 'screening', source: 'Portal' },
        { fn: 'Pooja', ln: 'Sharma', email: 'pooja.s@email.com', company: 'HCL', title: 'Designer', exp: 4, sal: 1400000, status: 'applied', source: 'LinkedIn' },
        { fn: 'Manish', ln: 'Agarwal', email: 'manish.a@email.com', company: 'Capgemini', title: 'Backend Dev', exp: 5, sal: 2000000, status: 'rejected', source: 'Portal' },
        { fn: 'Divya', ln: 'Chauhan', email: 'divya.c@email.com', company: 'Tech Mahindra', title: 'Data Scientist', exp: 3, sal: 1700000, status: 'interviewing', source: 'Referral' },
      ]
    : [
        { fn: 'Alex', ln: 'Turner', email: 'alex.turner@email.com', company: 'Google', title: 'Software Engineer', exp: 6, sal: 170000, status: 'interviewing', source: 'LinkedIn' },
        { fn: 'Maya', ln: 'Singh', email: 'maya.singh@email.com', company: 'Amazon', title: 'Senior Developer', exp: 8, sal: 185000, status: 'shortlisted', source: 'Indeed' },
        { fn: 'James', ln: 'Williams', email: 'james.w@email.com', company: 'Microsoft', title: 'Cloud Engineer', exp: 5, sal: 155000, status: 'offered', source: 'Referral' },
        { fn: 'Sophie', ln: 'Martin', email: 'sophie.m@email.com', company: 'Meta', title: 'UX Researcher', exp: 7, sal: 150000, status: 'screening', source: 'Portal' },
        { fn: 'Wei', ln: 'Zhang', email: 'wei.z@email.com', company: 'Apple', title: 'Data Engineer', exp: 4, sal: 140000, status: 'applied', source: 'LinkedIn' },
        { fn: 'Carlos', ln: 'Rodriguez', email: 'carlos.r@email.com', company: 'Netflix', title: 'DevOps Engineer', exp: 5, sal: 160000, status: 'interviewing', source: 'Indeed' },
        { fn: 'Olivia', ln: 'Davis', email: 'olivia.d@email.com', company: 'Stripe', title: 'Sales Executive', exp: 3, sal: 95000, status: 'applied', source: 'Portal' },
      ];

  const candidates = await Promise.all(
    candidateDefs.map((cd, i) =>
      prisma.candidate.create({
        data: {
          firstName: cd.fn,
          lastName: cd.ln,
          email: cd.email,
          currentCompany: cd.company,
          currentTitle: cd.title,
          experience: cd.exp,
          expectedSalary: cd.sal,
          noticePeriod: '30 days',
          status: cd.status,
          source: cd.source,
          aiScore: 65 + Math.floor(Math.random() * 30),
          skillMatch: 60 + Math.floor(Math.random() * 35),
          cultureFitScore: 70 + Math.floor(Math.random() * 25),
          jobId: jobs[i % jobs.length].id,
        },
      })
    )
  );

  // ═══════════════════════ 8. INTERVIEWS ═══════════════════════
  const interviewStatuses = ['scheduled', 'completed', 'completed', 'scheduled', 'cancelled'];
  const interviewTypes = ['technical', 'hr', 'manager', 'technical', 'culture'];
  const interviews = await Promise.all(
    candidates.slice(0, 5).map((cand, i) =>
      prisma.interview.create({
        data: {
          type: interviewTypes[i],
          scheduledAt: daysFromNow(i + 1),
          duration: 60,
          status: interviewStatuses[i],
          feedback: interviewStatuses[i] === 'completed' ? `Good ${interviewTypes[i]} skills demonstrated. Recommended for next round.` : null,
          rating: interviewStatuses[i] === 'completed' ? 3 + (i % 3) : null,
          meetingLink: `https://meet.${cfg.domain}/interview-${i + 1}`,
          candidateId: cand.id,
          jobId: jobs[i % jobs.length].id,
        },
      })
    )
  );

  // ═══════════════════════ 9. AI INTERVIEWS ═══════════════════════
  const aiInterviewQuestions = [
    { question: 'Tell us about a challenging project you led recently.', category: 'experience', type: 'behavioral' },
    { question: 'How do you approach system design for high-traffic applications?', category: 'technical', type: 'technical' },
    { question: 'Describe your experience with microservices architecture.', category: 'technical', type: 'technical' },
    { question: 'How do you handle conflicts within your team?', category: 'communication', type: 'behavioral' },
    { question: 'What is your approach to debugging production issues?', category: 'problem-solving', type: 'technical' },
    { question: 'How do you stay updated with the latest industry trends?', category: 'culture-fit', type: 'behavioral' },
  ];

  // 2-3 completed AI interviews
  for (let i = 0; i < 3; i++) {
    const scores = aiInterviewQuestions.map(() => 65 + Math.floor(Math.random() * 30));
    const responses = aiInterviewQuestions.map((q, idx) => ({
      question: q.question,
      answer: `I believe my experience in ${q.category} has been instrumental. For instance, in my previous role at ${candidateDefs[i % candidateDefs.length].company}, I actively worked on improving ${q.category === 'technical' ? 'system architecture and code quality' : q.category === 'communication' ? 'team collaboration and stakeholder management' : 'problem-solving methodologies'}.`,
      score: scores[idx],
      duration: 60 + Math.floor(Math.random() * 120),
    }));
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const feedbackObj = {
      overallScore,
      categoryScores: {
        technical: Math.round((scores[1] + scores[2] + scores[4]) / 3),
        communication: scores[3],
        cultureFit: scores[5],
      },
      strengths: ['Strong technical foundation', 'Good communication skills', 'Problem-solving ability'],
      weaknesses: ['Could improve system design depth', 'Limited cloud-native experience'],
      recommendation: overallScore >= 75 ? 'proceed' : 'reject',
    };

    await prisma.aIInterview.create({
      data: {
        candidateId: candidates[i].id,
        jobId: jobs[i % jobs.length].id,
        status: i < 2 ? 'completed' : 'in_progress',
        questions: JSON.stringify(aiInterviewQuestions),
        responses: JSON.stringify(responses),
        score: i < 2 ? overallScore : null,
        feedback: i < 2 ? JSON.stringify(feedbackObj) : null,
        language: 'en',
        rubric: JSON.stringify({ categories: ['technical', 'communication', 'culture-fit', 'problem-solving'], maxScore: 100 }),
        interviewLink: `${cfg.domain}/interview/ai-${i + 1}`,
        cheatingSignals: JSON.stringify([]),
        cvScore: 70 + i * 8,
        transcript: i < 2 ? `Full transcript for AI interview with ${candidateDefs[i].fn}...` : null,
        duration: i < 2 ? 22 + i * 5 : null,
        startedAt: daysAgo(5 - i),
        completedAt: i < 2 ? daysAgo(4 - i) : null,
      },
    });
  }

  // ═══════════════════════ 10. ATTENDANCE (last 7 days) ═══════════════════════
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = daysAgo(dayOffset);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    for (const emp of employees) {
      const rand = Math.random();
      const status = rand < 0.75 ? 'present' : rand < 0.85 ? 'late' : rand < 0.93 ? 'half_day' : 'absent';
      const checkInHour = status === 'late' ? 10 : 9;
      const checkInMin = Math.floor(Math.random() * 30);
      const dateStr = date.toISOString().split('T')[0];

      if (status !== 'absent') {
        await prisma.attendance.create({
          data: {
            date,
            checkIn: d(`${dateStr}T${String(checkInHour).padStart(2,'0')}:${String(checkInMin).padStart(2,'0')}:00`),
            checkOut: status === 'half_day'
              ? d(`${dateStr}T13:00:00`)
              : d(`${dateStr}T18:${String(Math.floor(Math.random() * 30)).padStart(2,'0')}:00`),
            workHours: status === 'half_day' ? 4 : 8 + Math.random() - 0.5,
            status,
            source: ['web', 'mobile', 'biometric'][Math.floor(Math.random() * 3)],
            employeeId: emp.id,
          },
        });
      } else {
        await prisma.attendance.create({
          data: { date, status, source: 'web', employeeId: emp.id },
        });
      }
    }
  }

  // ═══════════════════════ 11. LEAVE POLICIES ═══════════════════════
  const leavePolicyDefs = [
    { name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarry: 3, isPaid: true },
    { name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, maxCarry: 0, isPaid: true },
    { name: 'Earned Leave', type: 'earned', totalDays: 15, carryForward: true, maxCarry: 5, isPaid: true },
    { name: 'Maternity Leave', type: 'maternity', totalDays: 182, carryForward: false, maxCarry: 0, isPaid: true },
  ];
  const leavePolicies = await Promise.all(
    leavePolicyDefs.map(lp =>
      prisma.leavePolicy.create({
        data: {
          name: lp.name,
          type: lp.type,
          totalDays: lp.totalDays,
          carryForward: lp.carryForward,
          maxCarryDays: lp.maxCarry,
          isPaid: lp.isPaid,
          companyId: company.id,
        },
      })
    )
  );

  // ═══════════════════════ 12. LEAVES ═══════════════════════
  const leaveDefs = [
    { type: 'casual', startDate: daysAgo(5), endDate: daysAgo(4), totalDays: 2, reason: 'Personal work', status: 'approved' },
    { type: 'sick', startDate: daysAgo(2), endDate: daysAgo(1), totalDays: 2, reason: 'Not feeling well', status: 'pending' },
    { type: 'earned', startDate: daysFromNow(10), endDate: daysFromNow(14), totalDays: 5, reason: 'Family vacation', status: 'pending' },
    { type: 'casual', startDate: daysFromNow(20), endDate: daysFromNow(20), totalDays: 1, reason: 'Doctor appointment', status: 'rejected' },
    { type: 'sick', startDate: daysAgo(10), endDate: daysAgo(9), totalDays: 2, reason: 'Fever and cold', status: 'approved' },
  ];

  for (let i = 0; i < leaveDefs.length; i++) {
    const ld = leaveDefs[i];
    const emp = employees[i % employees.length];
    const approver = ld.status === 'approved' || ld.status === 'rejected' ? employees[1].id : null;
    await prisma.leave.create({
      data: {
        type: ld.type,
        startDate: ld.startDate,
        endDate: ld.endDate,
        totalDays: ld.totalDays,
        reason: ld.reason,
        status: ld.status,
        approverId: approver,
        approverComment: ld.status === 'rejected' ? 'Too many people on leave during this period' : (ld.status === 'approved' ? 'Approved' : null),
        employeeId: emp.id,
      },
    });
  }

  // ═══════════════════════ 13. PAYROLL STRUCTURE ═══════════════════════
  const isINR = cfg.currency === 'INR';
  const payrollStructure = await prisma.payrollStructure.create({
    data: {
      name: 'Standard Salary Structure',
      basicPay: isINR ? 50000 : 6000,
      hra: isINR ? 20000 : 2400,
      da: isINR ? 5000 : 600,
      transportAllowance: isINR ? 3000 : 400,
      medicalAllowance: isINR ? 1500 : 200,
      specialAllowance: isINR ? 10000 : 1200,
      pfEmployee: isINR ? 6000 : 720,
      pfEmployer: isINR ? 6000 : 720,
      esiEmployee: isINR ? 1500 : 0,
      esiEmployer: isINR ? 4000 : 0,
      taxDeduction: isINR ? 5000 : 1500,
      companyId: company.id,
    },
  });

  // ═══════════════════════ 14. PAYROLL RECORDS (last 3 months) ═══════════════════════
  const basicPays = isINR
    ? [80000, 60000, 70000, 55000, 50000, 90000, 45000, 65000, 40000, 60000]
    : [10000, 8000, 9000, 7500, 8500, 9500, 7000, 7500, 6000, 8000];

  for (let month = 1; month <= 3; month++) {
    for (let eIdx = 0; eIdx < employees.length; eIdx++) {
      const basic = basicPays[eIdx];
      const hra = basic * 0.4;
      const da = basic * 0.1;
      const gross = basic + hra + da;
      const pf = basic * 0.12;
      const tax = basic * 0.1;
      const deductions = pf + tax;
      const net = gross - deductions;

      await prisma.payrollRecord.create({
        data: {
          month,
          year: 2025,
          basicPay: basic,
          grossSalary: gross,
          totalDeductions: deductions,
          netSalary: net,
          status: month < 3 ? 'paid' : 'processed',
          paymentDate: d(`2025-${String(month).padStart(2,'0')}-28`),
          employeeId: employees[eIdx].id,
        },
      });
    }
  }

  // ═══════════════════════ 15. GOALS ═══════════════════════
  const goalTitles = [
    'Improve code quality', 'Complete certification', 'Lead a project', 'Reduce bug rate',
    'Mentor junior devs', 'Improve sprint velocity', 'Learn new framework',
    'Enhance testing coverage', 'Deliver Q1 features', 'Customer satisfaction NPS > 8',
  ];
  for (let i = 0; i < employees.length; i++) {
    for (let g = 0; g < 3 + Math.floor(i % 3); g++) {
      const gIdx = (i * 3 + g) % goalTitles.length;
      await prisma.goal.create({
        data: {
          title: goalTitles[gIdx],
          description: `Annual goal for ${employees[i].firstName}: ${goalTitles[gIdx]}`,
          type: g === 0 ? 'individual' : 'team',
          category: ['Technical', 'Professional Development', 'Leadership', 'Quality'][gIdx % 4],
          progress: Math.min(100, (gIdx + 1) * 15),
          status: ['not_started', 'in_progress', 'completed', 'in_progress'][gIdx % 4],
          startDate: d('2025-01-01'),
          endDate: d('2025-12-31'),
          employeeId: employees[i].id,
        },
      });
    }
  }

  // ═══════════════════════ 16. PERFORMANCE REVIEWS ═══════════════════════
  const reviewCycle = await prisma.reviewCycle.create({
    data: {
      name: `${cfg.code} Annual Review 2025`,
      type: 'annual',
      startDate: d('2025-01-01'),
      endDate: d('2025-01-31'),
      status: 'active',
      companyId: company.id,
    },
  });

  for (let i = 0; i < Math.min(5, employees.length); i++) {
    const reviewerIdx = i === 0 ? employees.length - 1 : (i - 1) % employees.length;
    await prisma.performanceReview.create({
      data: {
        cycleId: reviewCycle.id,
        reviewerId: employees[reviewerIdx].id,
        revieweeId: employees[i].id,
        rating: 3 + (i % 3),
        comments: ['Consistently delivers quality work', 'Needs improvement in time management', 'Excellent team player', 'Good technical skills', 'Strong leadership potential'][i],
        status: i < 3 ? 'completed' : 'pending',
      },
    });
  }

  // ═══════════════════════ 17. PERFORMANCE RECORDS ═══════════════════════
  const perfPeriods = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Annual 2024'];
  for (let i = 0; i < 5; i++) {
    await prisma.performance.create({
      data: {
        employeeId: employees[i].id,
        reviewPeriod: perfPeriods[i % perfPeriods.length],
        reviewerId: employees[(i + 1) % employees.length].id,
        rating: 3 + (i % 3),
        objectives: `Deliver key objectives for ${perfPeriods[i % perfPeriods.length]}`,
        achievements: i % 2 === 0 ? 'Exceeded targets by 15%' : 'Met all quarterly objectives',
        feedback: 'Good progress on goals. Continue developing leadership skills.',
        selfReview: 'I have grown significantly this period and taken on more responsibilities.',
        goals: 'Focus on technical depth and team mentoring',
        attritionRisk: Math.random() * 0.3,
        status: i < 3 ? 'completed' : 'draft',
      },
    });
  }

  // ═══════════════════════ 18. ASSET ALLOCATIONS ═══════════════════════
  const assetDefs = [
    { type: 'laptop', name: isINR ? 'MacBook Pro 16" M3' : 'MacBook Pro 14" M3', code: `LTP-${p}-001` },
    { type: 'laptop', name: isINR ? 'Dell XPS 15' : 'Dell Latitude 5540', code: `LTP-${p}-002` },
    { type: 'monitor', name: 'Dell U2723QE 27" 4K', code: `MON-${p}-001` },
    { type: 'phone', name: isINR ? 'iPhone 15 Pro' : 'iPhone 15', code: `PHN-${p}-001` },
    { type: 'headset', name: 'Jabra Evolve2 85', code: `HST-${p}-001` },
  ];

  for (let i = 0; i < assetDefs.length; i++) {
    await prisma.assetAllocation.create({
      data: {
        assetType: assetDefs[i].type,
        assetName: assetDefs[i].name,
        assetCode: assetDefs[i].code,
        serialNumber: `SN-${cfg.code}-${String(i + 1).padStart(4, '0')}`,
        status: 'allocated',
        allocatedAt: daysAgo(60 + i * 10),
        notes: i === 2 ? 'Dual monitor setup approved' : undefined,
        employeeId: employees[i % employees.length].id,
      },
    });
  }

  // ═══════════════════════ 19. TRAVEL REQUESTS ═══════════════════════
  const travelDefs = cfg.code === 'MARQ'
    ? [
        { purpose: 'Client meeting in Mumbai', dest: 'Mumbai, India', dep: daysFromNow(15), ret: daysFromNow(17), cost: 15000, status: 'pending' },
        { purpose: 'Tech Conference - AWS Summit', dest: 'Singapore', dep: daysFromNow(30), ret: daysFromNow(33), cost: 80000, appCost: 75000, status: 'approved' },
        { purpose: 'Hyderabad team sync', dest: 'Hyderabad, India', dep: daysFromNow(45), ret: daysFromNow(46), cost: 8000, status: 'pending' },
      ]
    : [
        { purpose: 'Client meeting in New York', dest: 'New York, NY', dep: daysFromNow(15), ret: daysFromNow(17), cost: 2500, status: 'pending' },
        { purpose: 'Tech Conference - CES 2025', dest: 'Las Vegas, NV', dep: daysFromNow(30), ret: daysFromNow(33), cost: 4000, appCost: 3800, status: 'approved' },
        { purpose: 'Austin office site visit', dest: 'Austin, TX', dep: daysFromNow(45), ret: daysFromNow(46), cost: 800, status: 'pending' },
      ];

  for (let i = 0; i < travelDefs.length; i++) {
    const td = travelDefs[i];
    await prisma.travelRequest.create({
      data: {
        purpose: td.purpose,
        destination: td.dest,
        departureDate: td.dep,
        returnDate: td.ret,
        estimatedCost: td.cost,
        approvedCost: (td as any).appCost || null,
        status: td.status,
        approverId: td.status === 'approved' ? employees[1].id : null,
        employeeId: employees[i].id,
      },
    });
  }

  // ═══════════════════════ 20. EXPENSE CLAIMS ═══════════════════════
  const expenseDefs = [
    { type: 'travel', amount: isINR ? 5000 : 450, desc: 'Taxi to airport', status: 'pending' },
    { type: 'food', amount: isINR ? 2500 : 120, desc: 'Team lunch meeting', status: 'approved' },
    { type: 'communication', amount: isINR ? 1500 : 85, desc: 'International calls for project', status: 'reimbursed' },
    { type: 'equipment', amount: isINR ? 8000 : 250, desc: 'USB-C hub for work setup', status: 'pending' },
    { type: 'travel', amount: isINR ? 12000 : 350, desc: 'Flight for client visit', status: 'approved' },
  ];

  for (let i = 0; i < expenseDefs.length; i++) {
    const ed = expenseDefs[i];
    await prisma.expenseClaim.create({
      data: {
        type: ed.type,
        amount: ed.amount,
        description: ed.desc,
        status: ed.status,
        approverId: ed.status !== 'pending' ? employees[1].id : null,
        approverComment: ed.status === 'approved' ? 'Approved - within budget' : ed.status === 'reimbursed' ? 'Processed via payroll' : null,
        employeeId: employees[i % employees.length].id,
      },
    });
  }

  // ═══════════════════════ 21. LEARNING RECORDS ═══════════════════════
  const courseDefs = [
    { name: 'Advanced React Patterns', provider: 'Frontend Masters', type: 'e_learning' },
    { name: isINR ? 'AWS Solutions Architect' : 'Azure Solutions Architect', provider: isINR ? 'AWS Training' : 'Microsoft Learn', type: 'certification' },
    { name: 'Leadership Essentials', provider: 'Coursera', type: 'e_learning' },
    { name: 'Data Science with Python', provider: 'edX', type: 'e_learning' },
    { name: isINR ? 'Scrum Master Certification' : 'PMP Certification', provider: isINR ? 'Scrum Alliance' : 'PMI', type: 'certification' },
  ];

  for (let i = 0; i < courseDefs.length; i++) {
    const isCompleted = i < 2;
    await prisma.learningRecord.create({
      data: {
        courseName: courseDefs[i].name,
        provider: courseDefs[i].provider,
        type: courseDefs[i].type,
        status: isCompleted ? 'completed' : i === 2 ? 'in_progress' : 'enrolled',
        completedAt: isCompleted ? daysAgo(15 + i * 5) : null,
        score: isCompleted ? 80 + (i * 5) % 20 : null,
        certificate: isCompleted && courseDefs[i].type === 'certification' ? `cert-${cfg.code}-${i + 1}` : null,
        employeeId: employees[i % employees.length].id,
      },
    });
  }

  // ═══════════════════════ 22. TICKETS ═══════════════════════
  const ticketDefs = [
    { subject: 'VPN Connection Issue', desc: 'Cannot connect to VPN since morning', cat: 'it', priority: 'high', status: 'in_progress' },
    { subject: 'Payroll Discrepancy', desc: 'Last month salary has incorrect deduction', cat: 'payroll', priority: 'urgent', status: 'open' },
    { subject: 'Access Request - Production DB', desc: 'Need read access for debugging', cat: 'it', priority: 'medium', status: 'resolved', resolution: 'Access granted by IT admin' },
    { subject: 'New Laptop Request', desc: 'Current laptop is very slow and freezes', cat: 'it', priority: 'medium', status: 'open' },
    { subject: 'Cafeteria Feedback', desc: 'Food quality has deteriorated', cat: 'general', priority: 'low', status: 'resolved', resolution: 'Raised with vendor, quality improved' },
  ];

  for (let i = 0; i < ticketDefs.length; i++) {
    const td = ticketDefs[i];
    await prisma.ticket.create({
      data: {
        subject: td.subject,
        description: td.desc,
        category: td.cat,
        priority: td.priority,
        status: td.status,
        resolution: (td as any).resolution || null,
        assignedTo: td.status === 'in_progress' ? employees[1].id : null,
        employeeId: employees[i % employees.length].id,
      },
    });
  }

  // ═══════════════════════ 23. HELPDESK TICKETS ═══════════════════════
  const helpdeskDefs = [
    { subject: 'Email not syncing on mobile', cat: 'IT Support', subCat: 'Email', priority: 'high', status: 'open' },
    { subject: 'Software license renewal', cat: 'IT Support', subCat: 'Licensing', priority: 'medium', status: 'in_progress' },
    { subject: 'Office AC not working', cat: 'Facilities', subCat: 'HVAC', priority: 'medium', status: 'resolved' },
    { subject: 'New hire equipment request', cat: 'IT Support', subCat: 'Equipment', priority: 'high', status: 'open' },
    { subject: 'Badge access issue', cat: 'Security', subCat: 'Access', priority: 'urgent', status: 'resolved' },
  ];

  for (let i = 0; i < helpdeskDefs.length; i++) {
    const hd = helpdeskDefs[i];
    const ticket = await prisma.helpdeskTicket.create({
      data: {
        ticketId: `${cfg.code}-HD-${String(i + 1001).padStart(4, '0')}`,
        requesterId: employees[i % employees.length].id,
        requesterType: 'employee',
        category: hd.cat,
        subCategory: hd.subCat,
        priority: hd.priority,
        subject: hd.subject,
        description: `Detailed description: ${hd.subject}. This needs attention.`,
        assignedAgentId: hd.status !== 'open' ? employees[1].id : null,
        slaDeadline: daysFromNow(2),
        status: hd.status,
        resolution: hd.status === 'resolved' ? 'Issue has been resolved. Closing ticket.' : null,
        companyId: company.id,
      },
    });

    // Add comments
    await prisma.helpdeskTicketComment.create({
      data: {
        content: hd.status === 'resolved' ? 'This has been fixed. Please verify.' : 'Looking into this issue.',
        ticketId: ticket.id,
        employeeId: employees[1].id,
      },
    });
  }

  // ═══════════════════════ 24. CLIENTS ═══════════════════════
  const clientDefs = cfg.code === 'MARQ'
    ? [
        { name: 'TechCorp Solutions', email: 'biz@techcorp.in', company: 'TechCorp Solutions Pvt Ltd', industry: 'IT Services', status: 'active' },
        { name: 'Global Finance Ltd', email: 'partner@globalfin.in', company: 'Global Finance Ltd', industry: 'Finance', status: 'active' },
        { name: 'HealthFirst India', email: 'connect@healthfirst.in', company: 'HealthFirst India', industry: 'Healthcare', status: 'active' },
        { name: 'EduLearn Academy', email: 'admin@edulearn.in', company: 'EduLearn Academy', industry: 'Education', status: 'inactive' },
      ]
    : [
        { name: 'Acme Corp', email: 'hr@acme.com', company: 'Acme Corporation', industry: 'Technology', status: 'active' },
        { name: 'GlobalTech Inc', email: 'talent@globaltech.com', company: 'GlobalTech Inc', industry: 'Software', status: 'active' },
        { name: 'BuildRight Construction', email: 'biz@buildright.com', company: 'BuildRight Corp', industry: 'Construction', status: 'active' },
      ];

  await Promise.all(
    clientDefs.map(cd =>
      prisma.client.create({
        data: {
          name: cd.name,
          email: cd.email,
          clientCompany: cd.company,
          industry: cd.industry,
          contractStart: d('2024-01-01'),
          contractEnd: d('2025-12-31'),
          status: cd.status,
          companyId: company.id,
        },
      })
    )
  );

  // ═══════════════════════ 25. VENDORS ═══════════════════════
  const vendorDefs = cfg.code === 'MARQ'
    ? [
        { name: 'TalentHunt India', email: 'hr@talenthunt.in', company: 'TalentHunt Pvt Ltd', service: 'Recruitment', rating: 4.5 },
        { name: 'CloudHost India', email: 'support@cloudhost.in', company: 'CloudHost Technologies', service: 'IT Infrastructure', rating: 4.0 },
        { name: 'SecureIT Solutions', email: 'contact@secureit.in', company: 'SecureIT Systems', service: 'Cybersecurity', rating: 4.2 },
      ]
    : [
        { name: 'TalentHunt Agency', email: 'info@talenthunt.com', company: 'TalentHunt', service: 'recruitment', rating: 4.5 },
        { name: 'StaffPro Solutions', email: 'contact@staffpro.com', company: 'StaffPro', service: 'staffing', rating: 4.2 },
        { name: 'VerifyRight BGV', email: 'team@verifyright.com', company: 'VerifyRight', service: 'bgv', rating: 4.8 },
      ];

  const vendors = await Promise.all(
    vendorDefs.map(vd =>
      prisma.vendor.create({
        data: {
          name: vd.name,
          email: vd.email,
          vendorCompany: vd.company,
          serviceType: vd.service,
          status: 'active',
          rating: vd.rating,
          companyId: company.id,
        },
      })
    )
  );

  // ═══════════════════════ 26. SUB-VENDORS ═══════════════════════
  const subVendorDefs = cfg.code === 'MARQ'
    ? [
        { name: 'QuickHire Regional', email: 'hire@quickhire.in', company: 'QuickHire' },
        { name: 'TalentBridge East', email: 'east@talentbridge.in', company: 'TalentBridge' },
        { name: 'SouthRecruit Partners', email: 'info@southrecruit.in', company: 'SouthRecruit' },
      ]
    : [
        { name: 'QuickHire Regional', email: 'hire@quickhire.com', company: 'QuickHire' },
        { name: 'TalentBridge East', email: 'east@talentbridge.com', company: 'TalentBridge' },
      ];

  for (let i = 0; i < subVendorDefs.length; i++) {
    await prisma.subVendor.create({
      data: {
        name: subVendorDefs[i].name,
        email: subVendorDefs[i].email,
        company: subVendorDefs[i].company,
        status: 'active',
        vendorId: vendors[i % vendors.length].id,
      },
    });
  }

  // ═══════════════════════ 27. DOCUMENTS ═══════════════════════
  const docTypes = ['offer-letter', 'id-proof', 'certificate'];
  for (const emp of employees) {
    for (const docType of docTypes) {
      await prisma.document.create({
        data: {
          name: `${docType}_${emp.firstName}_${emp.lastName}`,
          type: docType,
          status: 'active',
          employeeId: emp.id,
        },
      });
    }
  }

  // ═══════════════════════ 28. SHIFTS & SHIFT MEMBERS ═══════════════════════
  const shiftDefs = [
    { name: 'Morning Shift', start: '06:00', end: '14:00', break: 30 },
    { name: 'General Shift', start: '09:00', end: '18:00', break: 60 },
    { name: 'Evening Shift', start: '14:00', end: '22:00', break: 30 },
  ];

  const shifts = await Promise.all(
    shiftDefs.map(sd =>
      prisma.shift.create({
        data: {
          name: sd.name,
          startTime: sd.start,
          endTime: sd.end,
          breakMinutes: sd.break,
          isActive: true,
          companyId: company.id,
        },
      })
    )
  );

  // Assign employees to general shift
  for (let i = 0; i < employees.length; i++) {
    await prisma.shiftMember.create({
      data: {
        effectiveDate: d('2025-01-01'),
        shiftId: i < 7 ? shifts[1].id : shifts[i % shifts.length].id,
        employeeId: employees[i].id,
      },
    });
  }

  // ═══════════════════════ 29. COMPANY POLICIES ═══════════════════════
  const policyDefs = [
    { title: 'Leave Policy', category: 'Leave', content: `## Leave Policy\n\n- Casual Leave: 12 days/year\n- Sick Leave: 10 days/year\n- Earned Leave: 15 days/year\n- Maternity Leave: ${isINR ? '26 weeks' : '12 weeks'}\n- Carry forward allowed up to 5 days for Earned Leave.`, version: '2.1' },
    { title: 'Code of Conduct', category: 'HR', content: '## Code of Conduct\n\n- Professional behavior at all times\n- Respect for colleagues and clients\n- No conflict of interest\n- Confidentiality of company information\n- Dress code: Business casual', version: '2.5' },
    { title: 'Remote Work Policy', category: 'Work Policy', content: `## Remote Work Policy\n\n- Employees can work remotely up to 3 days/week\n- Must be available during core hours (${isINR ? '10 AM - 4 PM IST' : '9 AM - 3 PM PT'})\n- Home office setup allowance: ${isINR ? '₹25,000/year' : '$500/year'}\n- Monthly in-office attendance minimum: 8 days`, version: '1.3' },
    { title: 'IT Security Policy', category: 'Security', content: '## IT Security Policy\n\n- All devices must have company-approved antivirus\n- No personal cloud storage for company data\n- MFA required for all systems\n- Regular security training mandatory\n- Incident reporting within 24 hours', version: '1.8' },
    { title: 'Travel Policy', category: 'Finance', content: `## Travel Policy\n\n- Domestic travel: Economy class\n- International travel: Economy for <4hrs, Business for >4hrs\n- Per diem: ${isINR ? '₹3,000 domestic, $75 international' : '$50 domestic, $100 international'}\n- Pre-approval required for all travel\n- Expense submission within 7 days`, version: '2.0' },
    { title: 'Anti-Harassment Policy', category: 'Compliance', content: '## Anti-Harassment Policy\n\n- Zero tolerance for harassment of any kind\n- Confidential reporting mechanism\n- Investigation within 30 working days\n- Protection against retaliation', version: '3.0' },
  ];

  for (const pol of policyDefs) {
    await prisma.companyPolicy.create({
      data: {
        title: pol.title,
        content: pol.content,
        category: pol.category,
        version: pol.version,
        effectiveDate: d('2024-01-01'),
        status: 'active',
        companyId: company.id,
      },
    });
  }

  // ═══════════════════════ 30. PROJECTS ═══════════════════════
  const projectDefs = cfg.code === 'MARQ'
    ? [
        { name: 'HRMS 2.0 Redesign', desc: 'Complete redesign of HRMS platform with AI features', status: 'in_progress', priority: 'high', budget: 5000000, progress: 45 },
        { name: 'AI Chatbot Integration', desc: 'AI-powered HR assistant chatbot', status: 'completed', priority: 'medium', budget: 1500000, progress: 100 },
        { name: 'Mobile App Development', desc: 'Native mobile app for HRMS', status: 'planning', priority: 'high', budget: 3000000, progress: 10 },
      ]
    : [
        { name: 'Cloud Migration Project', desc: 'Migrate legacy systems to cloud infrastructure', status: 'in_progress', priority: 'high', budget: 800000, progress: 60 },
        { name: 'Client Portal v3', desc: 'Next-gen client portal with real-time analytics', status: 'in_progress', priority: 'medium', budget: 450000, progress: 35 },
        { name: 'DevOps Automation', desc: 'Automate CI/CD pipelines and infrastructure', status: 'planning', priority: 'medium', budget: 250000, progress: 5 },
      ];

  for (let i = 0; i < projectDefs.length; i++) {
    const pd = projectDefs[i];
    const project = await prisma.project.create({
      data: {
        name: pd.name,
        description: pd.desc,
        status: pd.status,
        priority: pd.priority,
        startDate: daysAgo(60 + i * 30),
        endDate: daysFromNow(120 - i * 30),
        budget: pd.budget,
        progress: pd.progress,
        companyId: company.id,
        createdBy: employees[0].id,
      },
    });

    // Project members
    for (let m = 0; m < 3; m++) {
      await prisma.projectMember.create({
        data: {
          role: m === 0 ? 'lead' : 'member',
          projectId: project.id,
          employeeId: employees[(i + m) % employees.length].id,
        },
      });
    }

    // Milestones
    await prisma.projectMilestone.create({
      data: {
        name: 'Phase 1 Completion',
        description: `Complete first phase of ${pd.name}`,
        dueDate: daysFromNow(30 + i * 15),
        status: pd.status === 'completed' ? 'completed' : i === 0 ? 'completed' : 'pending',
        projectId: project.id,
      },
    });
    await prisma.projectMilestone.create({
      data: {
        name: 'Phase 2 Delivery',
        description: `Second phase of ${pd.name}`,
        dueDate: daysFromNow(60 + i * 15),
        status: 'pending',
        projectId: project.id,
      },
    });
  }

  // ═══════════════════════ 31. TASKS ═══════════════════════
  const taskTitles = cfg.code === 'MARQ'
    ? ['Implement AI resume parser', 'Design onboarding flow', 'Build dashboard API', 'Fix attendance sync bug', 'Add leave calendar view', 'Implement search feature', 'Create reporting module', 'Deploy to staging']
    : ['Migrate database to Aurora', 'Build client dashboard UI', 'Set up monitoring alerts', 'Fix authentication bug', 'Add API rate limiting', 'Create onboarding flow', 'Implement file upload', 'Configure CI/CD pipeline'];

  const taskStatuses = ['todo', 'in_progress', 'completed', 'review', 'todo', 'in_progress', 'todo', 'in_progress'];
  const taskPriorities = ['high', 'medium', 'low', 'urgent', 'medium', 'high', 'low', 'medium'];

  for (let i = 0; i < taskTitles.length; i++) {
    const task = await prisma.task.create({
      data: {
        title: taskTitles[i],
        description: `Complete implementation of: ${taskTitles[i]}`,
        priority: taskPriorities[i],
        status: taskStatuses[i],
        dueDate: daysFromNow(5 + i * 3),
        companyId: company.id,
        createdBy: employees[0].id,
      },
    });

    // Task assignment
    await prisma.taskAssignment.create({
      data: {
        taskId: task.id,
        employeeId: employees[i % employees.length].id,
      },
    });

    // Task comments
    if (i % 2 === 0) {
      await prisma.taskComment.create({
        data: {
          content: `Working on this. ETA: ${3 + (i % 5)} days.`,
          taskId: task.id,
          employeeId: employees[i % employees.length].id,
        },
      });
    }
  }

  // ═══════════════════════ 32. TIMESHEETS ═══════════════════════
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  weekStart.setHours(0,0,0,0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  for (const emp of employees) {
    const timesheet = await prisma.timesheet.create({
      data: {
        employeeId: emp.id,
        weekStart,
        weekEnd,
        totalHours: 40,
        status: 'approved',
        approvedBy: employees[0].id,
        approvedAt: daysAgo(1),
      },
    });

    // Timesheet entries for weekdays
    for (let day = 1; day <= 5; day++) {
      const entryDate = new Date(weekStart);
      entryDate.setDate(entryDate.getDate() + day);
      await prisma.timesheetEntry.create({
        data: {
          timesheetId: timesheet.id,
          date: entryDate,
          hours: 8,
          project: projectDefs[day % projectDefs.length].name,
          task: taskTitles[day % taskTitles.length],
          notes: day === 1 ? 'Sprint planning + coding' : 'Development work',
        },
      });
    }
  }

  // ═══════════════════════ 33. MANPOWER REQUISITIONS ═══════════════════════
  const requisitionDefs = [
    { title: 'Senior ML Engineer', dept: 'Engineering', position: 'ML Engineer', positionsNeeded: 2, priority: 'urgent', justification: 'Growing AI product demand requires additional ML talent', status: 'approved' },
    { title: 'HR Business Partner', dept: 'HR', position: 'HR BP', positionsNeeded: 1, priority: 'medium', justification: 'Need dedicated HR support for Engineering team', status: 'pending' },
    { title: 'Sales Lead', dept: 'Sales', position: 'Sales Lead', positionsNeeded: 1, priority: 'high', justification: 'Expand enterprise sales pipeline', status: 'draft' },
  ];

  for (const rd of requisitionDefs) {
    await prisma.manpowerRequisition.create({
      data: {
        title: rd.title,
        department: rd.dept,
        position: rd.position,
        positionsNeeded: rd.positionsNeeded,
        priority: rd.priority,
        justification: rd.justification,
        status: rd.status,
        requestedBy: employees[0].id,
        approvedBy: rd.status === 'approved' ? employees[1].id : null,
        companyId: company.id,
      },
    });
  }

  // ═══════════════════════ 34. COMPLIANCE ITEMS ═══════════════════════
  const complianceDefs = cfg.code === 'MARQ'
    ? [
        { title: 'Annual Fire Safety Training', cat: 'safety', due: daysFromNow(60), status: 'pending', desc: 'Mandatory fire safety training for all employees' },
        { title: 'POSH Compliance Review', cat: 'regulatory', due: daysFromNow(90), status: 'pending', desc: 'Review Prevention of Sexual Harassment compliance' },
        { title: 'GST Filing Q4 2024', cat: 'tax', due: daysFromNow(15), status: 'completed', desc: 'Quarterly GST return filing' },
        { title: 'Data Protection Audit', cat: 'regulatory', due: daysFromNow(120), status: 'pending', desc: 'IT data protection and privacy audit' },
        { title: 'Shop & Establishment License Renewal', cat: 'legal', due: daysFromNow(45), status: 'in_progress', desc: 'Annual license renewal for all offices' },
      ]
    : [
        { title: 'Annual OSHA Training', cat: 'safety', due: daysFromNow(60), status: 'pending', desc: 'OSHA workplace safety training' },
        { title: 'SOC 2 Compliance Audit', cat: 'regulatory', due: daysFromNow(90), status: 'pending', desc: 'Annual SOC 2 Type II audit' },
        { title: 'Q4 Tax Filing', cat: 'tax', due: daysFromNow(15), status: 'completed', desc: 'Quarterly tax filing' },
        { title: 'Privacy Policy Update', cat: 'legal', due: daysFromNow(120), status: 'in_progress', desc: 'Update privacy policy per CCPA requirements' },
      ];

  for (const cd of complianceDefs) {
    await prisma.complianceItem.create({
      data: {
        title: cd.title,
        description: cd.desc,
        category: cd.cat,
        dueDate: cd.due,
        status: cd.status,
        assignee: employees[1].id,
        companyId: company.id,
      },
    });
  }

  // ═══════════════════════ 35. NOTIFICATIONS ═══════════════════════
  const notifDefs = [
    { title: 'Leave Request', message: `${employees[2].firstName} has submitted a leave request`, type: 'info', cat: 'leave' },
    { title: 'New Candidate', message: `New application received for ${jobs[0].title}`, type: 'success', cat: 'recruitment' },
    { title: 'Payslip Generated', message: `Your payslip for this month is ready`, type: 'info', cat: 'payroll' },
    { title: 'Expense Approved', message: `Your travel expense has been approved`, type: 'success', cat: 'expense' },
    { title: 'Task Overdue', message: `Task "Fix authentication bug" is overdue`, type: 'warning', cat: 'task' },
  ];

  for (let i = 0; i < notifDefs.length; i++) {
    const nd = notifDefs[i];
    for (const user of users.slice(0, 3)) {
      await prisma.notification.create({
        data: {
          title: nd.title,
          message: nd.message,
          type: nd.type,
          category: nd.cat,
          isRead: Math.random() > 0.5,
          actionUrl: `/${nd.cat}`,
          userId: user.id,
        },
      });
    }
  }

  // ═══════════════════════ 36. ONBOARDING TASKS ═══════════════════════
  // For probation employees
  const probationEmps = employees.filter(e => {
    const empDef = employeeDefs.find(ed => ed.empId === e.employeeId);
    return empDef && empDef.status === 'probation';
  });

  const onboardingTaskDefs = [
    { title: 'Complete IT Setup', desc: 'Laptop, email, VPN access setup', cat: 'it' },
    { title: 'HR Orientation', desc: 'Company policies, benefits overview', cat: 'hr' },
    { title: 'Team Introduction', desc: 'Meet the team members', cat: 'team' },
    { title: 'Codebase Walkthrough', desc: 'Overview of main repositories and architecture', cat: 'training' },
    { title: 'First Project Assignment', desc: 'Assign first development task', cat: 'training' },
  ];

  for (const emp of (probationEmps.length > 0 ? probationEmps : employees.slice(0, 2))) {
    for (let i = 0; i < onboardingTaskDefs.length; i++) {
      const od = onboardingTaskDefs[i];
      await prisma.onboardingTask.create({
        data: {
          title: od.title,
          description: od.desc,
          category: od.cat,
          status: i < 3 ? 'completed' : i === 3 ? 'in_progress' : 'pending',
          dueDate: daysFromNow(7 + i * 3),
          completedAt: i < 3 ? daysAgo(7 - i) : null,
          assignedTo: employees[0].id,
          employeeId: emp.id,
        },
      });
    }
  }

  // ═══════════════════════ 37. SKILLS & EMPLOYEE SKILLS ═══════════════════════
  const skillDefs = cfg.code === 'MARQ'
    ? [
        { name: 'React', cat: 'Frontend' }, { name: 'Node.js', cat: 'Backend' }, { name: 'Python', cat: 'Backend' },
        { name: 'Machine Learning', cat: 'AI/ML' }, { name: 'TensorFlow', cat: 'AI/ML' }, { name: 'PostgreSQL', cat: 'Database' },
        { name: 'Docker', cat: 'DevOps' }, { name: 'Kubernetes', cat: 'DevOps' }, { name: 'AWS', cat: 'Cloud' },
        { name: 'TypeScript', cat: 'Frontend' }, { name: 'Figma', cat: 'Design' }, { name: 'GraphQL', cat: 'API' },
        { name: 'Redis', cat: 'Database' }, { name: 'CI/CD', cat: 'DevOps' }, { name: 'Data Analysis', cat: 'Analytics' },
      ]
    : [
        { name: 'React', cat: 'Frontend' }, { name: 'Java', cat: 'Backend' }, { name: 'Go', cat: 'Backend' },
        { name: 'AWS', cat: 'Cloud' }, { name: 'Terraform', cat: 'DevOps' }, { name: 'PostgreSQL', cat: 'Database' },
        { name: 'Docker', cat: 'DevOps' }, { name: 'Kubernetes', cat: 'DevOps' }, { name: 'Python', cat: 'Backend' },
        { name: 'TypeScript', cat: 'Frontend' }, { name: 'Vue.js', cat: 'Frontend' }, { name: 'Azure', cat: 'Cloud' },
        { name: 'Kafka', cat: 'Messaging' }, { name: 'CI/CD', cat: 'DevOps' }, { name: 'System Design', cat: 'Architecture' },
      ];

  const skills = await Promise.all(
    skillDefs.map(sd =>
      prisma.skill.upsert({
        where: { name: `${cfg.code}_${sd.name}` },
        update: {},
        create: { name: `${cfg.code}_${sd.name}`, category: sd.cat, description: `${sd.name} skill` },
      })
    )
  );

  // Assign skills to employees
  const proficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
  for (const emp of employees) {
    const numSkills = 3 + Math.floor(Math.random() * 4);
    for (let s = 0; s < numSkills; s++) {
      try {
        await prisma.employeeSkill.create({
          data: {
            employeeId: emp.id,
            skillId: skills[(employees.indexOf(emp) * 3 + s) % skills.length].id,
            proficiency: proficiencies[Math.floor(Math.random() * proficiencies.length)],
            yearsExp: 1 + Math.floor(Math.random() * 8),
          },
        });
      } catch { /* unique constraint */ }
    }
  }

  // ═══════════════════════ 38. AUDIT LOGS ═══════════════════════
  const auditDefs = [
    { action: 'CREATE', entity: 'Employee', module: 'employees' },
    { action: 'UPDATE', entity: 'Leave', module: 'leaves' },
    { action: 'APPROVE', entity: 'ExpenseClaim', module: 'expenses' },
    { action: 'LOGIN', entity: 'User', module: 'auth' },
    { action: 'UPDATE', entity: 'PayrollRecord', module: 'payroll' },
    { action: 'CREATE', entity: 'Job', module: 'recruitment' },
    { action: 'DELETE', entity: 'Document', module: 'documents' },
    { action: 'UPDATE', entity: 'CompanyPolicy', module: 'settings' },
    { action: 'CREATE', entity: 'Project', module: 'projects' },
    { action: 'APPROVE', entity: 'TravelRequest', module: 'travel' },
  ];

  for (let i = 0; i < auditDefs.length; i++) {
    const ad = auditDefs[i];
    await prisma.auditLog.create({
      data: {
        action: ad.action,
        entity: ad.entity,
        entityId: `sample-${i + 1}`,
        details: `${ad.action} operation on ${ad.entity}`,
        userId: users[i % users.length].id,
        ipAddress: '192.168.1.' + (100 + i),
        module: ad.module,
        employeeId: employees[i % employees.length].id,
      },
    });
  }

  // ═══════════════════════ 39. WORKFLOW DEFINITIONS ═══════════════════════
  // Leave Approval workflow
  const leaveWorkflow = await prisma.workflowDefinition.create({
    data: {
      name: 'Leave Approval Workflow',
      type: 'approval',
      entity: 'leave',
      description: 'Standard leave approval: Manager → HR',
      isActive: true,
      companyId: company.id,
    },
  });

  await prisma.workflowStepDef.createMany({
    data: [
      { name: 'Manager Approval', stepOrder: 0, approverRole: `${cfg.code}_manager`, approverType: 'role', action: 'approve_reject', workflowDefId: leaveWorkflow.id },
      { name: 'HR Approval', stepOrder: 1, approverRole: `${cfg.code}_company_hr_admin`, approverType: 'role', action: 'approve_reject', workflowDefId: leaveWorkflow.id },
    ],
  });

  // Expense Approval workflow
  const expenseWorkflow = await prisma.workflowDefinition.create({
    data: {
      name: 'Expense Approval Workflow',
      type: 'approval',
      entity: 'expense',
      description: 'Expense approval: Manager → Finance',
      isActive: true,
      companyId: company.id,
    },
  });

  await prisma.workflowStepDef.createMany({
    data: [
      { name: 'Manager Approval', stepOrder: 0, approverRole: `${cfg.code}_manager`, approverType: 'role', action: 'approve_reject', workflowDefId: expenseWorkflow.id },
      { name: 'Finance Approval', stepOrder: 1, approverRole: `${cfg.code}_finance`, approverType: 'role', action: 'approve_reject', workflowDefId: expenseWorkflow.id },
    ],
  });

  // Workflow instances
  for (let i = 0; i < 2; i++) {
    const wfDef = i === 0 ? leaveWorkflow : expenseWorkflow;
    const instance = await prisma.workflowInstance.create({
      data: {
        status: i === 0 ? 'approved' : 'pending',
        currentStep: i === 0 ? 2 : 1,
        initiatedBy: employees[i + 2].id,
        workflowDefId: wfDef.id,
      },
    });

    // Step instances
    await prisma.workflowStepInstance.create({
      data: {
        stepOrder: 0,
        status: 'approved',
        actionedBy: employees[0].id,
        comments: 'Looks good, approved',
        actedAt: daysAgo(2),
        workflowInstanceId: instance.id,
      },
    });
    await prisma.workflowStepInstance.create({
      data: {
        stepOrder: 1,
        status: i === 0 ? 'approved' : 'pending',
        actionedBy: i === 0 ? employees[1].id : null,
        comments: i === 0 ? 'HR approved' : null,
        actedAt: i === 0 ? daysAgo(1) : null,
        workflowInstanceId: instance.id,
      },
    });
  }

  // ═══════════════════════ 40. SURVEYS ═══════════════════════
  const survey1 = await prisma.survey.create({
    data: {
      title: `Q1 2025 Employee Engagement Pulse - ${cfg.code}`,
      description: 'Quarterly pulse survey to measure employee engagement and satisfaction.',
      type: 'pulse',
      status: 'active',
      startDate: daysAgo(10),
      endDate: daysFromNow(5),
      companyId: company.id,
    },
  });

  const surveyQs = await Promise.all([
    prisma.surveyQuestion.create({ data: { question: 'How satisfied are you with your current role?', type: 'rating', order: 0, surveyId: survey1.id } }),
    prisma.surveyQuestion.create({ data: { question: 'Do you feel your work is recognized?', type: 'rating', order: 1, surveyId: survey1.id } }),
    prisma.surveyQuestion.create({ data: { question: 'How would you rate team collaboration?', type: 'rating', order: 2, surveyId: survey1.id } }),
    prisma.surveyQuestion.create({ data: { question: 'What could we improve?', type: 'text', required: false, order: 3, surveyId: survey1.id } }),
  ]);

  // Survey responses
  for (let i = 0; i < Math.min(5, employees.length); i++) {
    for (const sq of surveyQs.slice(0, 3)) {
      await prisma.surveyResponse.create({
        data: {
          answer: String(3 + (i % 3)),
          questionId: sq.id,
          employeeId: employees[i].id,
        },
      });
    }
  }

  // Second survey
  const survey2 = await prisma.survey.create({
    data: {
      title: `Remote Work Satisfaction - ${cfg.code}`,
      description: 'Survey about remote work experience and preferences.',
      type: 'feedback',
      status: 'draft',
      startDate: daysFromNow(15),
      endDate: daysFromNow(30),
      companyId: company.id,
    },
  });

  await Promise.all([
    prisma.surveyQuestion.create({ data: { question: 'How satisfied are you with remote work arrangements?', type: 'rating', order: 0, surveyId: survey2.id } }),
    prisma.surveyQuestion.create({ data: { question: 'Do you have the necessary tools for remote work?', type: 'rating', order: 1, surveyId: survey2.id } }),
    prisma.surveyQuestion.create({ data: { question: 'Suggestions for improving remote work?', type: 'text', required: false, order: 2, surveyId: survey2.id } }),
  ]);

  // ═══════════════════════ 41. ALUMNI RECORDS ═══════════════════════
  // Create alumni employees
  const alumniDefs = cfg.code === 'MARQ'
    ? [
        { empId: 'MQ-AL1', fn: 'Rahul', ln: 'Das', email: 'rahul.das@alumni.marqai.tech', designation: 'Former ML Engineer', jDate: '2021-06-01', exitDate: '2024-11-30', reason: 'Better opportunity abroad' },
        { empId: 'MQ-AL2', fn: 'Sanjay', ln: 'Mishra', email: 'sanjay.mishra@alumni.marqai.tech', designation: 'Former Data Analyst', jDate: '2022-03-15', exitDate: '2024-09-30', reason: 'Career change' },
      ]
    : [
        { empId: 'TC-AL1', fn: 'Kevin', ln: 'White', email: 'kevin.white@alumni.techcorp.com', designation: 'Former Senior Developer', jDate: '2019-08-01', exitDate: '2024-10-15', reason: 'Relocated to another city' },
      ];

  for (const ad of alumniDefs) {
    const alumniEmp = await prisma.employee.create({
      data: {
        employeeId: ad.empId,
        firstName: ad.fn,
        lastName: ad.ln,
        email: ad.email,
        designation: ad.designation,
        employmentType: 'full-time',
        status: 'exited',
        joiningDate: d(ad.jDate),
        exitDate: d(ad.exitDate),
        companyId: company.id,
        departmentId: departments[0].id,
        branchId: branches[0].id,
      },
    });

    await prisma.alumniRecord.create({
      data: {
        exitReason: ad.reason,
        rehireEligible: true,
        alumniEmail: ad.email,
        joinedAlumniAt: d(ad.exitDate),
        employeeId: alumniEmp.id,
      },
    });
  }

  console.log(`✅ ${cfg.name} seeded successfully!`);
  return { company, employees, users, jobs, candidates, branches, departments, roles, leavePolicies, payrollStructure };
}

// ─── Main function ────────────────────────────────────────────────────────────
export async function seedTwoCompanies() {
  console.log('🌱 Starting comprehensive seed for 2 companies...\n');

  await deleteAllData();

  const marqData = await seedCompany(MARQ);
  const tcgData = await seedCompany(TCG);

  // ═══════════════════════ CROSS-COMPANY: Super Admin ═══════════════════════
  // The admin@marqai.tech user already has super_admin role and is associated with MARQ
  // We also need a platform-level admin
  const platformAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@eh2r.com',
      password: await hashPassword('admin123'),
      name: 'Platform Super Admin',
      role: 'super_admin',
      isActive: true,
      lastLogin: daysAgo(0),
    },
  });

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 2 Companies: MARQ AI Technologies, TechCorp Global');
  console.log('  - ~20 Employees total (10 per company)');
  console.log('  - ~10 Jobs, ~15 Candidates');
  console.log('  - ~5 AI Interviews, ~10 Interviews');
  console.log('  - Attendance for last 7 days');
  console.log('  - Leave Policies, Leaves, Payroll Structures & Records');
  console.log('  - Goals, Performance Reviews, Performance Records');
  console.log('  - Assets, Travel Requests, Expense Claims');
  console.log('  - Learning Records, Tickets, Helpdesk Tickets');
  console.log('  - Clients, Vendors, SubVendors');
  console.log('  - Documents, Shifts, Company Policies');
  console.log('  - Projects with Members & Milestones');
  console.log('  - Tasks with Assignments & Comments');
  console.log('  - Timesheets with Entries');
  console.log('  - Manpower Requisitions, Compliance Items');
  console.log('  - Notifications, Onboarding Tasks');
  console.log('  - Skills with Employee Skills');
  console.log('  - Roles with Permissions & Assignments');
  console.log('  - Audit Logs, Workflow Definitions with Instances');
  console.log('  - Surveys with Questions & Responses');
  console.log('  - Alumni Records');
  console.log('\n🔑 Login Credentials:');
  console.log('  - Platform Admin: superadmin@eh2r.com / admin123');
  console.log('  - MARQ Admin: admin@marqai.tech / admin123');
  console.log('  - TCG Admin: admin@techcorp.com / admin123');
  console.log('  - Employee passwords: employee123 or admin123');
}

// Run if called directly
async function main() {
  try {
    await seedTwoCompanies();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
