import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// ==================== HELPERS ====================

const d = (s: string) => new Date(s);
const daysAgo = (n: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - n);
  dt.setHours(0, 0, 0, 0);
  return dt;
};
const daysFromNow = (n: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + n);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

// ==================== DELETE ALL DATA (in dependency order) ====================

async function deleteAllData() {
  const deleteOps = [
    () => db.subVendorResume.deleteMany(),
    () => db.workflowStepInstance.deleteMany(),
    () => db.workflowInstance.deleteMany(),
    () => db.workflowStepDef.deleteMany(),
    () => db.workflowDefinition.deleteMany(),
    () => db.surveyResponse.deleteMany(),
    () => db.surveyQuestion.deleteMany(),
    () => db.survey.deleteMany(),
    () => db.taskComment.deleteMany(),
    () => db.taskAssignment.deleteMany(),
    () => db.task.deleteMany(),
    () => db.timesheetEntry.deleteMany(),
    () => db.timesheet.deleteMany(),
    () => db.projectMilestone.deleteMany(),
    () => db.projectMember.deleteMany(),
    () => db.project.deleteMany(),
    () => db.helpdeskTicketComment.deleteMany(),
    () => db.helpdeskTicket.deleteMany(),
    () => db.shiftMember.deleteMany(),
    () => db.shift.deleteMany(),
    () => db.employeeSkill.deleteMany(),
    () => db.skill.deleteMany(),
    () => db.userRoleAssignment.deleteMany(),
    () => db.rolePermission.deleteMany(),
    () => db.role.deleteMany(),
    () => db.auditLog.deleteMany(),
    () => db.notification.deleteMany(),
    () => db.complianceItem.deleteMany(),
    () => db.manpowerRequisition.deleteMany(),
    () => db.companyPolicy.deleteMany(),
    () => db.alumniRecord.deleteMany(),
    () => db.onboardingTask.deleteMany(),
    () => db.document.deleteMany(),
    () => db.subVendor.deleteMany(),
    () => db.vendor.deleteMany(),
    () => db.client.deleteMany(),
    () => db.ticket.deleteMany(),
    () => db.learningRecord.deleteMany(),
    () => db.expenseClaim.deleteMany(),
    () => db.travelRequest.deleteMany(),
    () => db.assetAllocation.deleteMany(),
    () => db.performance.deleteMany(),
    () => db.performanceReview.deleteMany(),
    () => db.reviewCycle.deleteMany(),
    () => db.goal.deleteMany(),
    () => db.payrollRecord.deleteMany(),
    () => db.payrollStructure.deleteMany(),
    () => db.leave.deleteMany(),
    () => db.leavePolicy.deleteMany(),
    () => db.attendance.deleteMany(),
    () => db.aIInterview.deleteMany(),
    () => db.interview.deleteMany(),
    () => db.candidate.deleteMany(),
    () => db.job.deleteMany(),
    () => db.employee.deleteMany(),
    () => db.user.deleteMany(),
    () => db.department.deleteMany(),
    () => db.branch.deleteMany(),
    () => db.company.deleteMany(),
  ];
  for (const op of deleteOps) {
    try { await op(); } catch { /* continue */ }
  }
}

// ==================== MAIN SEED FUNCTION ====================

export async function POST() {
  const log: string[] = [];
  const created: Record<string, number> = {};

  try {
    log.push('🗑️  Deleting all existing data...');
    await deleteAllData();
    log.push('✅ All existing data deleted');

    const hashedPassword = await bcrypt.hash('admin123', 12);

    // ═══════════════════════ COMPANY 1: MARQ AI Technologies ═══════════════════════
    const marq = await db.company.create({
      data: {
        name: 'MARQ AI Technologies',
        code: 'MARQ',
        industry: 'AI & Technology',
        country: 'IN',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        domain: 'marqai.com',
        isActive: true,
      },
    });
    log.push(`✅ Company: ${marq.name}`);

    const marqBranches = await Promise.all([
      db.branch.create({ data: { name: 'Bangalore HQ', code: 'MQ-BLR', city: 'Bangalore', state: 'Karnataka', country: 'IN', address: 'Whitefield, Bangalore', isActive: true, companyId: marq.id } }),
      db.branch.create({ data: { name: 'Mumbai Office', code: 'MQ-MUM', city: 'Mumbai', state: 'Maharashtra', country: 'IN', address: 'BKC, Mumbai', isActive: true, companyId: marq.id } }),
      db.branch.create({ data: { name: 'Hyderabad Dev Center', code: 'MQ-HYD', city: 'Hyderabad', state: 'Telangana', country: 'IN', address: 'HITEC City, Hyderabad', isActive: true, companyId: marq.id } }),
    ]);
    created.branches = (created.branches || 0) + marqBranches.length;

    const marqDepts = await Promise.all(
      ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'].map(n =>
        db.department.create({ data: { name: n, code: `MQ-${n.substring(0, 3).toUpperCase()}`, description: `${n} Department`, isActive: true, companyId: marq.id } })
      )
    );
    created.departments = (created.departments || 0) + marqDepts.length;

    // ═══════════════════════ COMPANY 2: TechCorp Global ═══════════════════════
    const tcg = await db.company.create({
      data: {
        name: 'TechCorp Global',
        code: 'TCGC',
        industry: 'IT Services',
        country: 'US',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        domain: 'techcorp.com',
        isActive: true,
      },
    });
    log.push(`✅ Company: ${tcg.name}`);

    const tcgBranches = await Promise.all([
      db.branch.create({ data: { name: 'San Francisco HQ', code: 'TC-SF', city: 'San Francisco', state: 'CA', country: 'US', address: '101 Market St, San Francisco', isActive: true, companyId: tcg.id } }),
      db.branch.create({ data: { name: 'New York Office', code: 'TC-NY', city: 'New York', state: 'NY', country: 'US', address: '350 5th Ave, New York', isActive: true, companyId: tcg.id } }),
      db.branch.create({ data: { name: 'Austin Tech Hub', code: 'TC-AUS', city: 'Austin', state: 'TX', country: 'US', address: '200 Congress Ave, Austin', isActive: true, companyId: tcg.id } }),
    ]);
    created.branches += tcgBranches.length;

    const tcgDepts = await Promise.all(
      ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'].map(n =>
        db.department.create({ data: { name: n, code: `TC-${n.substring(0, 3).toUpperCase()}`, description: `${n} Department`, isActive: true, companyId: tcg.id } })
      )
    );
    created.departments += tcgDepts.length;

    // ═══════════════════════ ROLES & PERMISSIONS ═══════════════════════
    const roleNames = ['super_admin', 'company_hr_admin', 'manager', 'employee', 'finance'];
    const modules = ['employees', 'leaves', 'payroll', 'attendance', 'recruitment', 'performance', 'assets', 'travel', 'expenses', 'helpdesk', 'projects', 'reports', 'settings', 'compliance', 'learning'];
    const allRoles: { id: string; name: string }[] = [];

    for (const comp of [marq, tcg]) {
      for (const rn of roleNames) {
        const role = await db.role.create({
          data: { name: `${comp.code}_${rn}`, description: `${rn} role`, isSystem: rn === 'super_admin', companyId: comp.id },
        });
        allRoles.push(role);
        for (const mod of modules) {
          const isSuperAdmin = rn === 'super_admin';
          const isHrAdmin = rn === 'company_hr_admin';
          const isManager = rn === 'manager';
          const isFinanceRole = rn === 'finance';
          await db.rolePermission.create({
            data: {
              roleId: role.id,
              module: mod,
              canRead: true,
              canWrite: isSuperAdmin || isHrAdmin || isManager || (isFinanceRole && ['payroll', 'expenses', 'reports'].includes(mod)),
              canDelete: isSuperAdmin || isHrAdmin,
              canExport: isSuperAdmin || isHrAdmin || isFinanceRole || isManager,
            },
          });
        }
      }
    }
    created.roles = allRoles.length;
    log.push(`✅ Roles: ${allRoles.length}`);

    // ═══════════════════════ USERS & EMPLOYEES ═══════════════════════
    const marqAdminUser = await db.user.create({
      data: { email: 'admin@marqai.com', password: hashedPassword, name: 'MARQ Admin', role: 'super_admin', isActive: true, companyId: marq.id },
    });
    const tcgAdminUser = await db.user.create({
      data: { email: 'admin@techcorp.com', password: hashedPassword, name: 'TCG Admin', role: 'super_admin', isActive: true, companyId: tcg.id },
    });
    const platformAdmin = await db.user.create({
      data: { email: 'superadmin@eh2r.com', password: hashedPassword, name: 'Platform Super Admin', role: 'super_admin', isActive: true },
    });

    const marqEmpDefs = [
      { empId: 'MQ-001', fn: 'Aarav', ln: 'Sharma', email: 'aarav.sharma@marqai.com', phone: '+91-9876543201', designation: 'VP Engineering', deptIdx: 0, branchIdx: 0, role: 'manager', jDate: '2020-01-15', dob: '1985-06-15', gender: 'male', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-002', fn: 'Meera', ln: 'Patel', email: 'meera.patel@marqai.com', phone: '+91-9876543202', designation: 'HR Manager', deptIdx: 1, branchIdx: 0, role: 'company_hr_admin', jDate: '2020-05-01', dob: '1988-03-22', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-003', fn: 'Vikram', ln: 'Singh', email: 'vikram.singh@marqai.com', phone: '+91-9876543203', designation: 'Senior ML Engineer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2021-03-10', dob: '1990-11-08', gender: 'male', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-004', fn: 'Ananya', ln: 'Reddy', email: 'ananya.reddy@marqai.com', phone: '+91-9876543204', designation: 'Marketing Lead', deptIdx: 3, branchIdx: 0, role: 'employee', jDate: '2022-01-20', dob: '1993-07-14', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-005', fn: 'Rohan', ln: 'Joshi', email: 'rohan.joshi@marqai.com', phone: '+91-9876543205', designation: 'Finance Analyst', deptIdx: 2, branchIdx: 1, role: 'finance', jDate: '2022-09-05', dob: '1991-04-30', gender: 'male', city: 'Mumbai', state: 'Maharashtra', country: 'IN', status: 'active' },
      { empId: 'MQ-006', fn: 'Priya', ln: 'Nair', email: 'priya.nair@marqai.com', phone: '+91-9876543206', designation: 'Tech Lead', deptIdx: 0, branchIdx: 2, role: 'manager', jDate: '2021-11-01', dob: '1987-12-03', gender: 'female', city: 'Hyderabad', state: 'Telangana', country: 'IN', status: 'active' },
      { empId: 'MQ-007', fn: 'Arjun', ln: 'Kumar', email: 'arjun.kumar@marqai.com', phone: '+91-9876543207', designation: 'Sales Executive', deptIdx: 4, branchIdx: 1, role: 'employee', jDate: '2023-04-12', dob: '1994-09-18', gender: 'male', city: 'Mumbai', state: 'Maharashtra', country: 'IN', status: 'active' },
      { empId: 'MQ-008', fn: 'Sneha', ln: 'Gupta', email: 'sneha.gupta@marqai.com', phone: '+91-9876543208', designation: 'Operations Manager', deptIdx: 5, branchIdx: 0, role: 'manager', jDate: '2021-08-15', dob: '1989-02-25', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-009', fn: 'Rajesh', ln: 'Verma', email: 'rajesh.verma@marqai.com', phone: '+91-9876543209', designation: 'Backend Developer', deptIdx: 0, branchIdx: 2, role: 'employee', jDate: '2024-09-01', dob: '1996-05-11', gender: 'male', city: 'Hyderabad', state: 'Telangana', country: 'IN', status: 'probation' },
      { empId: 'MQ-010', fn: 'Kavitha', ln: 'Menon', email: 'kavitha.menon@marqai.com', phone: '+91-9876543210', designation: 'Data Scientist', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2022-06-20', dob: '1992-10-07', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
    ];

    const tcgEmpDefs = [
      { empId: 'TC-001', fn: 'Sarah', ln: 'Johnson', email: 'sarah.johnson@techcorp.com', phone: '+1-415-555-0001', designation: 'VP Engineering', deptIdx: 0, branchIdx: 0, role: 'manager', jDate: '2019-06-15', dob: '1984-08-20', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-002', fn: 'Michael', ln: 'Brown', email: 'michael.brown@techcorp.com', phone: '+1-212-555-0002', designation: 'HR Director', deptIdx: 1, branchIdx: 1, role: 'company_hr_admin', jDate: '2020-02-01', dob: '1986-11-12', gender: 'male', city: 'New York', state: 'NY', country: 'US', status: 'active' },
      { empId: 'TC-003', fn: 'Emily', ln: 'Chen', email: 'emily.chen@techcorp.com', phone: '+1-415-555-0003', designation: 'Senior Software Engineer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2021-03-10', dob: '1990-04-15', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-004', fn: 'David', ln: 'Wilson', email: 'david.wilson@techcorp.com', phone: '+1-415-555-0004', designation: 'Marketing Manager', deptIdx: 3, branchIdx: 0, role: 'employee', jDate: '2021-07-20', dob: '1989-09-28', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-005', fn: 'Lisa', ln: 'Anderson', email: 'lisa.anderson@techcorp.com', phone: '+1-512-555-0005', designation: 'Finance Manager', deptIdx: 2, branchIdx: 2, role: 'finance', jDate: '2020-11-01', dob: '1987-01-05', gender: 'female', city: 'Austin', state: 'TX', country: 'US', status: 'active' },
      { empId: 'TC-006', fn: 'James', ln: 'Martinez', email: 'james.martinez@techcorp.com', phone: '+1-415-555-0006', designation: 'DevOps Lead', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2022-01-15', dob: '1991-06-30', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-007', fn: 'Amanda', ln: 'Taylor', email: 'amanda.taylor@techcorp.com', phone: '+1-212-555-0007', designation: 'Sales Manager', deptIdx: 4, branchIdx: 1, role: 'manager', jDate: '2021-05-10', dob: '1988-12-18', gender: 'female', city: 'New York', state: 'NY', country: 'US', status: 'active' },
      { empId: 'TC-008', fn: 'Robert', ln: 'Garcia', email: 'robert.garcia@techcorp.com', phone: '+1-512-555-0008', designation: 'Operations Lead', deptIdx: 5, branchIdx: 2, role: 'employee', jDate: '2022-04-01', dob: '1990-03-22', gender: 'male', city: 'Austin', state: 'TX', country: 'US', status: 'active' },
      { empId: 'TC-009', fn: 'Jessica', ln: 'Lee', email: 'jessica.lee@techcorp.com', phone: '+1-415-555-0009', designation: 'Frontend Developer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2024-10-01', dob: '1995-07-09', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US', status: 'probation' },
      { empId: 'TC-010', fn: 'Daniel', ln: 'Kim', email: 'daniel.kim@techcorp.com', phone: '+1-415-555-0010', designation: 'Data Engineer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2023-02-14', dob: '1993-10-02', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
    ];

    const allUsers: { id: string }[] = [platformAdmin, marqAdminUser, tcgAdminUser];
    const allEmployees: { id: string; companyId: string; employeeId: string }[] = [];

    for (const [compId, empDefs, depts, branches] of [
      [marq.id, marqEmpDefs, marqDepts, marqBranches],
      [tcg.id, tcgEmpDefs, tcgDepts, tcgBranches],
    ] as const) {
      for (const ed of empDefs) {
        const user = await db.user.create({
          data: {
            email: ed.email,
            password: hashedPassword,
            name: `${ed.fn} ${ed.ln}`,
            role: ed.role,
            isActive: true,
            companyId: compId,
          },
        });
        allUsers.push(user);
        const emp = await db.employee.create({
          data: {
            employeeId: ed.empId,
            firstName: ed.fn,
            lastName: ed.ln,
            email: ed.email,
            phone: ed.phone,
            designation: ed.designation,
            jobTitle: ed.designation,
            employmentType: 'full-time',
            status: ed.status,
            joiningDate: d(ed.jDate),
            probationEnd: ed.status === 'probation' ? d('2025-06-01') : null,
            dateOfBirth: d(ed.dob),
            gender: ed.gender,
            city: ed.city,
            state: ed.state,
            country: ed.country,
            nationality: ed.country === 'IN' ? 'Indian' : 'American',
            companyId: compId,
            departmentId: depts[ed.deptIdx].id,
            branchId: branches[ed.branchIdx].id,
            userId: user.id,
          },
        });
        allEmployees.push(emp);
      }
    }

    // Set reporting managers
    const marqEmps = allEmployees.filter(e => e.companyId === marq.id);
    const tcgEmps = allEmployees.filter(e => e.companyId === tcg.id);
    for (const emps of [marqEmps, tcgEmps]) {
      for (let i = 2; i < emps.length; i++) {
        if (i === 5 || i === 7) continue;
        await db.employee.update({
          where: { id: emps[i].id },
          data: { reportingManagerId: i < 5 ? emps[0].id : emps[5].id },
        });
      }
    }

    created.users = allUsers.length;
    created.employees = allEmployees.length;
    log.push(`✅ Users: ${allUsers.length}, Employees: ${allEmployees.length}`);

    // User role assignments
    for (const comp of [marq, tcg]) {
      const compAdmin = comp.id === marq.id ? marqAdminUser : tcgAdminUser;
      const prefix = comp.id === marq.id ? 'MARQ' : 'TCGC';
      const hrRole = allRoles.find(r => r.name === `${prefix}_company_hr_admin`);
      const superAdminRole = allRoles.find(r => r.name === `${prefix}_super_admin`);
      if (hrRole) await db.userRoleAssignment.create({ data: { userId: compAdmin.id, roleId: hrRole.id } });
      if (superAdminRole) await db.userRoleAssignment.create({ data: { userId: compAdmin.id, roleId: superAdminRole.id } });
    }

    // ═══════════════════════ JOBS (3 per company) ═══════════════════════
    const marqJobs = await Promise.all([
      db.job.create({ data: { title: 'Senior Full-Stack Developer', description: 'Join our engineering team to build next-gen AI products.', requirements: 'React, Node.js, TypeScript, 5+ years', department: 'Engineering', location: 'Bangalore', employmentType: 'Full-time', experienceMin: 5, experienceMax: 8, salaryMin: 1800000, salaryMax: 3000000, status: 'open', priority: 'high', positions: 2, postedDate: daysAgo(20), companyId: marq.id } }),
      db.job.create({ data: { title: 'AI/ML Research Scientist', description: 'Work on cutting-edge AI research and model development.', requirements: 'ML, Python, TensorFlow, 4+ years', department: 'Engineering', location: 'Hyderabad', employmentType: 'Full-time', experienceMin: 4, experienceMax: 7, salaryMin: 2000000, salaryMax: 3500000, status: 'open', priority: 'urgent', positions: 1, postedDate: daysAgo(15), companyId: marq.id } }),
      db.job.create({ data: { title: 'HR Business Partner', description: 'Dedicated HR support for engineering teams.', requirements: '7+ years HR experience', department: 'HR', location: 'Mumbai', employmentType: 'Full-time', experienceMin: 6, experienceMax: 10, salaryMin: 1200000, salaryMax: 1800000, status: 'open', priority: 'medium', positions: 1, postedDate: daysAgo(25), companyId: marq.id } }),
    ]);

    const tcgJobs = await Promise.all([
      db.job.create({ data: { title: 'Senior Full-Stack Developer', description: 'Join our engineering team.', requirements: 'React, Node.js, 5+ years', department: 'Engineering', location: 'San Francisco, CA', employmentType: 'Full-time', experienceMin: 5, experienceMax: 8, salaryMin: 140000, salaryMax: 180000, status: 'open', priority: 'high', positions: 2, postedDate: daysAgo(20), companyId: tcg.id } }),
      db.job.create({ data: { title: 'Cloud Infrastructure Engineer', description: 'Build and maintain cloud infrastructure.', requirements: 'AWS, Terraform, K8s', department: 'Engineering', location: 'Austin, TX', employmentType: 'Full-time', experienceMin: 4, experienceMax: 7, salaryMin: 120000, salaryMax: 160000, status: 'open', priority: 'medium', positions: 1, postedDate: daysAgo(15), companyId: tcg.id } }),
      db.job.create({ data: { title: 'Sales Executive', description: 'Drive enterprise sales growth.', requirements: '3+ years B2B sales', department: 'Sales', location: 'New York, NY', employmentType: 'Full-time', experienceMin: 3, experienceMax: 5, salaryMin: 80000, salaryMax: 110000, status: 'open', priority: 'medium', positions: 3, postedDate: daysAgo(12), companyId: tcg.id } }),
    ]);
    created.jobs = marqJobs.length + tcgJobs.length;
    log.push(`✅ Jobs: ${created.jobs}`);

    // ═══════════════════════ CANDIDATES (5 per company) ═══════════════════════
    const candidateData = [
      { fn: 'Rahul', ln: 'Verma', email: 'rahul.verma@email.com', company: 'Infosys', title: 'Senior Developer', exp: 6, sal: 2200000, status: 'interviewing', source: 'LinkedIn', jobIdx: 0, comp: 'MARQ' },
      { fn: 'Sneha', ln: 'Kapoor', email: 'sneha.kapoor@email.com', company: 'TCS', title: 'ML Engineer', exp: 4, sal: 2500000, status: 'shortlisted', source: 'Naukri', jobIdx: 1, comp: 'MARQ' },
      { fn: 'Vikram', ln: 'Malhotra', email: 'vikram.m@email.com', company: 'Wipro', title: 'Full Stack Dev', exp: 5, sal: 1800000, status: 'applied', source: 'Referral', jobIdx: 0, comp: 'MARQ' },
      { fn: 'Anita', ln: 'Bose', email: 'anita.bose@email.com', company: 'Accenture', title: 'HR Manager', exp: 8, sal: 1500000, status: 'offered', source: 'Naukri', jobIdx: 2, comp: 'MARQ' },
      { fn: 'Deepak', ln: 'Chopra', email: 'deepak.c@email.com', company: 'Cognizant', title: 'Data Engineer', exp: 3, sal: 1600000, status: 'screening', source: 'Portal', jobIdx: 0, comp: 'MARQ' },
      { fn: 'Alex', ln: 'Turner', email: 'alex.turner@email.com', company: 'Google', title: 'Software Engineer', exp: 6, sal: 170000, status: 'interviewing', source: 'LinkedIn', jobIdx: 0, comp: 'TCG' },
      { fn: 'Maya', ln: 'Singh', email: 'maya.singh@email.com', company: 'Amazon', title: 'Cloud Engineer', exp: 8, sal: 185000, status: 'shortlisted', source: 'Indeed', jobIdx: 1, comp: 'TCG' },
      { fn: 'James', ln: 'Williams', email: 'james.w@email.com', company: 'Microsoft', title: 'Cloud Engineer', exp: 5, sal: 155000, status: 'offered', source: 'Referral', jobIdx: 1, comp: 'TCG' },
      { fn: 'Sophie', ln: 'Martin', email: 'sophie.m@email.com', company: 'Meta', title: 'Sales Lead', exp: 7, sal: 150000, status: 'screening', source: 'Portal', jobIdx: 2, comp: 'TCG' },
      { fn: 'Wei', ln: 'Zhang', email: 'wei.z@email.com', company: 'Apple', title: 'Data Engineer', exp: 4, sal: 140000, status: 'applied', source: 'LinkedIn', jobIdx: 0, comp: 'TCG' },
    ];

    const allCandidates = await Promise.all(
      candidateData.map(cd => {
        const jobs = cd.comp === 'MARQ' ? marqJobs : tcgJobs;
        return db.candidate.create({
          data: {
            firstName: cd.fn, lastName: cd.ln, email: cd.email,
            currentCompany: cd.company, currentTitle: cd.title,
            experience: cd.exp, expectedSalary: cd.sal,
            noticePeriod: '30 days', status: cd.status, source: cd.source,
            aiScore: 65 + Math.floor(Math.random() * 30),
            skillMatch: 60 + Math.floor(Math.random() * 35),
            cultureFitScore: 70 + Math.floor(Math.random() * 25),
            jobId: jobs[cd.jobIdx].id,
          },
        });
      })
    );
    created.candidates = allCandidates.length;
    log.push(`✅ Candidates: ${created.candidates}`);

    // ═══════════════════════ AI INTERVIEWS (2 per company) ═══════════════════════
    const aiQuestions = [
      { question: 'Tell us about a challenging project.', category: 'experience' },
      { question: 'How do you approach system design?', category: 'technical' },
      { question: 'Describe microservices experience.', category: 'technical' },
      { question: 'How do you handle team conflicts?', category: 'communication' },
      { question: 'Debugging approach for production?', category: 'problem-solving' },
      { question: 'How do you stay updated?', category: 'culture-fit' },
    ];

    // MARQ AI Interviews (first 2 candidates)
    for (let i = 0; i < 2; i++) {
      const cand = allCandidates[i];
      const scores = aiQuestions.map(() => 65 + Math.floor(Math.random() * 30));
      const responses = aiQuestions.map((q, idx) => ({
        question: q.question, answer: `My experience in ${q.category} is strong.`,
        score: scores[idx], duration: 60 + Math.floor(Math.random() * 120),
      }));
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const isCompleted = i === 0;
      await db.aIInterview.create({
        data: {
          candidateId: cand.id, jobId: cand.jobId,
          status: isCompleted ? 'completed' : 'in_progress',
          questions: JSON.stringify(aiQuestions),
          responses: JSON.stringify(responses),
          score: isCompleted ? overall : null,
          feedback: isCompleted ? JSON.stringify({ overallScore: overall, recommendation: overall >= 75 ? 'proceed' : 'reject' }) : null,
          language: 'en', interviewLink: `/interview/ai-marq-${i + 1}`,
          cvScore: 70 + i * 8,
          duration: isCompleted ? 22 + i * 5 : null,
          startedAt: daysAgo(5 - i),
          completedAt: isCompleted ? daysAgo(4 - i) : null,
        },
      });
    }

    // TCG AI Interviews (next 2 candidates)
    for (let i = 0; i < 2; i++) {
      const cand = allCandidates[5 + i];
      const scores = aiQuestions.map(() => 65 + Math.floor(Math.random() * 30));
      const responses = aiQuestions.map((q, idx) => ({
        question: q.question, answer: `My experience in ${q.category} is solid.`,
        score: scores[idx], duration: 60 + Math.floor(Math.random() * 120),
      }));
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const isCompleted = i === 0;
      await db.aIInterview.create({
        data: {
          candidateId: cand.id, jobId: cand.jobId,
          status: isCompleted ? 'completed' : 'in_progress',
          questions: JSON.stringify(aiQuestions),
          responses: JSON.stringify(responses),
          score: isCompleted ? overall : null,
          feedback: isCompleted ? JSON.stringify({ overallScore: overall, recommendation: overall >= 75 ? 'proceed' : 'reject' }) : null,
          language: 'en', interviewLink: `/interview/ai-tcg-${i + 1}`,
          cvScore: 72 + i * 6,
          duration: isCompleted ? 25 + i * 4 : null,
          startedAt: daysAgo(3 - i),
          completedAt: isCompleted ? daysAgo(2 - i) : null,
        },
      });
    }
    created.aiInterviews = 4;
    log.push(`✅ AI Interviews: ${created.aiInterviews}`);

    // ═══════════════════════ ATTENDANCE (7 days with GPS) ═══════════════════════
    let attCount = 0;
    const gpsCoords = {
      IN: { lat: 12.9716, lng: 77.5946 },  // Bangalore
      US: { lat: 37.7749, lng: -122.4194 }, // SF
    };

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = daysAgo(dayOffset);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      for (const emp of allEmployees) {
        const rand = Math.random();
        const status = rand < 0.75 ? 'present' : rand < 0.85 ? 'late' : rand < 0.93 ? 'half_day' : 'absent';
        const dateStr = date.toISOString().split('T')[0];
        const coords = gpsCoords[emp.companyId === marq.id ? 'IN' : 'US'] || gpsCoords.US;
        const latVariation = (Math.random() - 0.5) * 0.01;
        const lngVariation = (Math.random() - 0.5) * 0.01;

        if (status !== 'absent') {
          await db.attendance.create({
            data: {
              date,
              checkIn: d(`${dateStr}T${status === 'late' ? '10' : '09'}:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00`),
              checkOut: status === 'half_day' ? d(`${dateStr}T13:00:00`) : d(`${dateStr}T18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00`),
              workHours: status === 'half_day' ? 4 : 8,
              status,
              source: 'web',
              gpsLatitude: coords.lat + latVariation,
              gpsLongitude: coords.lng + lngVariation,
              employeeId: emp.id,
            },
          });
        } else {
          await db.attendance.create({
            data: { date, status, source: 'web', gpsLatitude: coords.lat + latVariation, gpsLongitude: coords.lng + lngVariation, employeeId: emp.id },
          });
        }
        attCount++;
      }
    }
    created.attendance = attCount;
    log.push(`✅ Attendance: ${attCount} records`);

    // ═══════════════════════ LEAVE POLICIES & LEAVES ═══════════════════════
    const lpData = [
      { name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarryDays: 3 },
      { name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, maxCarryDays: 0 },
      { name: 'Earned Leave', type: 'earned', totalDays: 15, carryForward: true, maxCarryDays: 5 },
      { name: 'Maternity Leave', type: 'maternity', totalDays: 182, carryForward: false, maxCarryDays: 0 },
    ];
    for (const comp of [marq, tcg]) {
      for (const lp of lpData) {
        await db.leavePolicy.create({ data: { name: lp.name, type: lp.type, totalDays: lp.totalDays, carryForward: lp.carryForward, maxCarryDays: lp.maxCarryDays, isPaid: true, companyId: comp.id } });
      }
    }
    created.leavePolicies = lpData.length * 2;

    let leaveCount = 0;
    const leaveDefs = [
      { type: 'casual', startOff: -5, endOff: -4, days: 2, reason: 'Personal work', status: 'approved' },
      { type: 'sick', startOff: -2, endOff: -1, days: 2, reason: 'Not feeling well', status: 'pending' },
      { type: 'earned', startOff: 10, endOff: 14, days: 5, reason: 'Family vacation', status: 'pending' },
      { type: 'casual', startOff: 20, endOff: 20, days: 1, reason: 'Doctor appointment', status: 'rejected' },
      { type: 'sick', startOff: -10, endOff: -9, days: 2, reason: 'Fever', status: 'approved' },
    ];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (const ld of leaveDefs) {
        await db.leave.create({
          data: {
            type: ld.type, startDate: daysFromNow(ld.startOff), endDate: daysFromNow(ld.endOff),
            totalDays: ld.days, reason: ld.reason, status: ld.status,
            approverId: ld.status !== 'pending' ? compEmps[1].id : null,
            employeeId: compEmps[leaveCount % compEmps.length].id,
          },
        });
        leaveCount++;
      }
    }
    created.leaves = leaveCount;
    log.push(`✅ Leave Policies: ${created.leavePolicies}, Leaves: ${leaveCount}`);

    // ═══════════════════════ PAYROLL STRUCTURES & RECORDS (3 months) ═══════════════════════
    await db.payrollStructure.create({ data: { name: 'Standard MARQ', basicPay: 50000, hra: 20000, da: 5000, transportAllowance: 3000, medicalAllowance: 1500, specialAllowance: 10000, pfEmployee: 6000, pfEmployer: 6000, esiEmployee: 1500, esiEmployer: 4000, taxDeduction: 5000, companyId: marq.id } });
    await db.payrollStructure.create({ data: { name: 'Standard TCG', basicPay: 6000, hra: 2400, da: 600, transportAllowance: 400, medicalAllowance: 200, specialAllowance: 1200, pfEmployee: 720, pfEmployer: 720, taxDeduction: 1500, companyId: tcg.id } });
    created.payrollStructures = 2;

    let payrollCount = 0;
    const basicINR = [80000, 60000, 70000, 55000, 50000, 90000, 45000, 65000, 40000, 60000];
    const basicUSD = [10000, 8000, 9000, 7500, 8500, 9500, 7000, 7500, 6000, 8000];
    for (let month = 1; month <= 3; month++) {
      for (const [compEmps, pays] of [[marqEmps, basicINR], [tcgEmps, basicUSD]] as const) {
        for (let eIdx = 0; eIdx < compEmps.length; eIdx++) {
          const basic = pays[eIdx];
          const gross = basic * 1.5;
          const deductions = basic * 0.22;
          await db.payrollRecord.create({
            data: {
              month, year: 2025, basicPay: basic, grossSalary: gross,
              totalDeductions: deductions, netSalary: gross - deductions,
              status: month < 3 ? 'paid' : 'processed',
              paymentDate: d(`2025-${String(month).padStart(2, '0')}-28`),
              employeeId: compEmps[eIdx].id,
            },
          });
          payrollCount++;
        }
      }
    }
    created.payrollRecords = payrollCount;
    log.push(`✅ Payroll: 2 structures, ${payrollCount} records`);

    // ═══════════════════════ GOALS & PERFORMANCE REVIEWS ═══════════════════════
    let goalCount = 0;
    const goalTitles = ['Improve code quality', 'Complete certification', 'Lead a project', 'Reduce bug rate', 'Mentor juniors', 'Improve velocity'];
    for (const emp of allEmployees) {
      for (let g = 0; g < 3; g++) {
        await db.goal.create({
          data: {
            title: goalTitles[goalCount % goalTitles.length],
            description: 'Annual goal',
            type: g === 0 ? 'individual' : 'team',
            category: ['Technical', 'Development', 'Leadership'][g % 3],
            progress: Math.min(100, (goalCount + 1) * 15),
            status: ['not_started', 'in_progress', 'completed'][g % 3],
            startDate: d('2025-01-01'), endDate: d('2025-12-31'),
            employeeId: emp.id,
          },
        });
        goalCount++;
      }
    }
    created.goals = goalCount;

    for (const comp of [marq, tcg]) {
      const cycle = await db.reviewCycle.create({
        data: { name: `${comp.code} Annual 2025`, type: 'annual', startDate: d('2025-01-01'), endDate: d('2025-01-31'), status: 'active', companyId: comp.id },
      });
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (let i = 0; i < 5; i++) {
        await db.performanceReview.create({
          data: { cycleId: cycle.id, reviewerId: compEmps[(i + 1) % compEmps.length].id, revieweeId: compEmps[i].id, rating: 3 + (i % 3), comments: ['Quality work', 'Needs improvement', 'Team player', 'Good skills', 'Leadership'][i], status: i < 3 ? 'completed' : 'pending' },
        });
        await db.performance.create({
          data: { employeeId: compEmps[i].id, reviewPeriod: 'Q1 2025', reviewerId: compEmps[(i + 1) % compEmps.length].id, rating: 3 + (i % 3), objectives: 'Deliver key objectives', achievements: 'Met targets', feedback: 'Good progress.', status: i < 3 ? 'completed' : 'draft' },
        });
      }
    }
    created.performanceReviews = 10;
    created.performanceRecords = 10;
    log.push(`✅ Goals: ${goalCount}, Performance: 10 reviews + 10 records`);

    // ═══════════════════════ ASSETS (5 per company) ═══════════════════════
    let assetCount = 0;
    for (const [comp, compEmps, prefix] of [[marq, marqEmps, 'MQ'], [tcg, tcgEmps, 'TC']] as const) {
      const assetDefs = [
        { type: 'laptop', name: 'MacBook Pro 16"', code: 'LTP' },
        { type: 'laptop', name: 'Dell XPS 15', code: 'LTP' },
        { type: 'monitor', name: 'Dell 27" 4K', code: 'MON' },
        { type: 'phone', name: 'iPhone 15 Pro', code: 'PHN' },
        { type: 'headset', name: 'Jabra Evolve2', code: 'HST' },
      ];
      for (let i = 0; i < assetDefs.length; i++) {
        await db.assetAllocation.create({
          data: {
            assetType: assetDefs[i].type, assetName: assetDefs[i].name,
            assetCode: `${assetDefs[i].code}-${prefix}-${String(i + 1).padStart(3, '0')}`,
            serialNumber: `SN-${prefix}-${String(i + 1).padStart(4, '0')}`,
            status: 'allocated', allocatedAt: daysAgo(60 + i * 10),
            employeeId: compEmps[i % compEmps.length].id,
          },
        });
        assetCount++;
      }
    }
    created.assets = assetCount;
    log.push(`✅ Assets: ${assetCount}`);

    // ═══════════════════════ TRAVEL REQUESTS & EXPENSE CLAIMS ═══════════════════════
    let travelCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const isINR = comp.id === marq.id;
      const travelDefs = [
        { purpose: 'Client meeting', dest: isINR ? 'Mumbai' : 'New York', cost: isINR ? 15000 : 2500, status: 'approved' },
        { purpose: 'Tech Conference', dest: isINR ? 'Singapore' : 'Las Vegas', cost: isINR ? 80000 : 4000, status: 'pending' },
        { purpose: 'Team sync', dest: isINR ? 'Hyderabad' : 'Austin', cost: isINR ? 8000 : 800, status: 'pending' },
      ];
      for (const td of travelDefs) {
        await db.travelRequest.create({
          data: {
            purpose: td.purpose, destination: td.dest,
            departureDate: daysFromNow(15), returnDate: daysFromNow(17),
            estimatedCost: td.cost, approvedCost: td.status === 'approved' ? td.cost : null,
            status: td.status,
            approverId: td.status === 'approved' ? compEmps[1].id : null,
            employeeId: compEmps[0].id,
          },
        });
        travelCount++;
      }
    }
    created.travelRequests = travelCount;

    let expenseCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const isINR = comp.id === marq.id;
      const expenseDefs = [
        { type: 'travel', amt: isINR ? 5000 : 450, desc: 'Taxi to airport', status: 'pending' },
        { type: 'food', amt: isINR ? 2500 : 120, desc: 'Team lunch', status: 'approved' },
        { type: 'communication', amt: isINR ? 1500 : 85, desc: 'International calls', status: 'reimbursed' },
        { type: 'equipment', amt: isINR ? 8000 : 250, desc: 'USB Hub', status: 'pending' },
        { type: 'travel', amt: isINR ? 12000 : 350, desc: 'Flight booking', status: 'approved' },
      ];
      for (const ed of expenseDefs) {
        await db.expenseClaim.create({
          data: {
            type: ed.type, amount: ed.amt, description: ed.desc, status: ed.status,
            approverId: ed.status !== 'pending' ? compEmps[1].id : null,
            employeeId: compEmps[0].id,
          },
        });
        expenseCount++;
      }
    }
    created.expenseClaims = expenseCount;
    log.push(`✅ Travel: ${travelCount}, Expenses: ${expenseCount}`);

    // ═══════════════════════ LEARNING RECORDS ═══════════════════════
    let learningCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const courses = [
        { courseName: 'Advanced React Patterns', provider: 'Frontend Masters', type: 'e_learning' },
        { courseName: 'AWS Solutions Architect', provider: 'AWS Training', type: 'certification' },
        { courseName: 'Leadership Essentials', provider: 'Coursera', type: 'e_learning' },
        { courseName: 'Data Science with Python', provider: 'edX', type: 'e_learning' },
        { courseName: 'Scrum Master Certification', provider: 'Scrum Alliance', type: 'certification' },
      ];
      for (let i = 0; i < courses.length; i++) {
        await db.learningRecord.create({
          data: {
            courseName: courses[i].courseName, provider: courses[i].provider, type: courses[i].type,
            status: i < 2 ? 'completed' : i === 2 ? 'in_progress' : 'enrolled',
            completedAt: i < 2 ? daysAgo(15 + i * 5) : null,
            score: i < 2 ? 80 + (i * 5) % 20 : null,
            certificate: i < 2 && courses[i].type === 'certification' ? `cert-${i + 1}` : null,
            employeeId: compEmps[i % compEmps.length].id,
          },
        });
        learningCount++;
      }
    }
    created.learningRecords = learningCount;
    log.push(`✅ Learning: ${learningCount}`);

    // ═══════════════════════ TICKETS (Helpdesk) ═══════════════════════
    let ticketCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const ticketDefs = [
        { subject: 'VPN Connection Issue', cat: 'it', pri: 'high', status: 'in_progress' },
        { subject: 'Payroll Discrepancy', cat: 'payroll', pri: 'urgent', status: 'open' },
        { subject: 'Access Request', cat: 'it', pri: 'medium', status: 'resolved' },
        { subject: 'New Laptop Request', cat: 'it', pri: 'medium', status: 'open' },
        { subject: 'Cafeteria Feedback', cat: 'general', pri: 'low', status: 'resolved' },
      ];
      for (const td of ticketDefs) {
        await db.ticket.create({
          data: {
            subject: td.subject, description: `Detailed: ${td.subject}`,
            category: td.cat, priority: td.pri, status: td.status,
            resolution: td.status === 'resolved' ? 'Resolved successfully' : null,
            employeeId: compEmps[0].id,
          },
        });
        ticketCount++;
      }
    }
    created.tickets = ticketCount;
    log.push(`✅ Tickets: ${ticketCount}`);

    // ═══════════════════════ HELPDESK TICKETS ═══════════════════════
    let helpdeskCount = 0;
    for (const [comp, prefix] of [[marq, 'MARQ'], [tcg, 'TCG']] as const) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const helpdeskDefs = [
        { subject: 'Email not syncing', cat: 'IT', pri: 'high', status: 'open' },
        { subject: 'License renewal', cat: 'IT', pri: 'medium', status: 'in_progress' },
        { subject: 'AC not working', cat: 'Facilities', pri: 'medium', status: 'resolved' },
        { subject: 'New hire equipment', cat: 'IT', pri: 'high', status: 'open' },
        { subject: 'Badge access issue', cat: 'Security', pri: 'urgent', status: 'resolved' },
      ];
      for (let i = 0; i < helpdeskDefs.length; i++) {
        const hd = helpdeskDefs[i];
        const ticket = await db.helpdeskTicket.create({
          data: {
            ticketId: `${prefix}-HD-${String(i + 1001).padStart(4, '0')}`,
            requesterId: compEmps[i % compEmps.length].id,
            requesterType: 'employee',
            category: hd.cat, priority: hd.pri,
            subject: hd.subject, description: `Detailed: ${hd.subject}`,
            status: hd.status,
            resolution: hd.status === 'resolved' ? 'Resolved.' : null,
            companyId: comp.id,
          },
        });
        await db.helpdeskTicketComment.create({
          data: { content: hd.status === 'resolved' ? 'Fixed.' : 'Looking into it.', ticketId: ticket.id, employeeId: compEmps[1].id },
        });
        helpdeskCount++;
      }
    }
    created.helpdeskTickets = helpdeskCount;
    log.push(`✅ Helpdesk: ${helpdeskCount}`);

    // ═══════════════════════ CLIENTS (3 per company) ═══════════════════════
    let clientCount = 0;
    const marqClientDefs = [
      { name: 'TechCorp Solutions', email: 'biz@techcorp.in', industry: 'IT' },
      { name: 'Global Finance', email: 'partner@globalfin.in', industry: 'Finance' },
      { name: 'HealthFirst India', email: 'connect@healthfirst.in', industry: 'Healthcare' },
    ];
    const tcgClientDefs = [
      { name: 'Acme Corp', email: 'hr@acme.com', industry: 'Technology' },
      { name: 'GlobalTech Inc', email: 'talent@globaltech.com', industry: 'Software' },
      { name: 'BuildRight', email: 'biz@buildright.com', industry: 'Construction' },
    ];
    for (const cd of marqClientDefs) {
      await db.client.create({ data: { ...cd, clientCompany: cd.name, contractStart: d('2024-01-01'), contractEnd: d('2025-12-31'), status: 'active', companyId: marq.id } });
      clientCount++;
    }
    for (const cd of tcgClientDefs) {
      await db.client.create({ data: { ...cd, clientCompany: cd.name, contractStart: d('2024-01-01'), contractEnd: d('2025-12-31'), status: 'active', companyId: tcg.id } });
      clientCount++;
    }
    created.clients = clientCount;
    log.push(`✅ Clients: ${clientCount}`);

    // ═══════════════════════ VENDORS & SUBVENDORS ═══════════════════════
    let vendorCount = 0;
    let subVendorCount = 0;
    const marqVendorDefs = [
      { name: 'TalentHunt India', email: 'hr@talenthunt.in', vendorCompany: 'TalentHunt', serviceType: 'Recruitment', rating: 4.5 },
      { name: 'CloudHost India', email: 'support@cloudhost.in', vendorCompany: 'CloudHost', serviceType: 'IT Infra', rating: 4.0 },
      { name: 'SecureIT', email: 'contact@secureit.in', vendorCompany: 'SecureIT', serviceType: 'Cybersecurity', rating: 4.2 },
    ];
    const tcgVendorDefs = [
      { name: 'TalentHunt Agency', email: 'info@talenthunt.com', vendorCompany: 'TalentHunt', serviceType: 'recruitment', rating: 4.5 },
      { name: 'StaffPro Solutions', email: 'contact@staffpro.com', vendorCompany: 'StaffPro', serviceType: 'staffing', rating: 4.2 },
      { name: 'VerifyRight BGV', email: 'team@verifyright.com', vendorCompany: 'VerifyRight', serviceType: 'bgv', rating: 4.8 },
    ];
    for (const [comp, vDefs] of [[marq, marqVendorDefs], [tcg, tcgVendorDefs]] as const) {
      for (const vd of vDefs) {
        const vendor = await db.vendor.create({
          data: { name: vd.name, email: vd.email, vendorCompany: vd.vendorCompany, serviceType: vd.serviceType, rating: vd.rating, status: 'active', companyId: comp.id },
        });
        vendorCount++;
        await db.subVendor.create({
          data: {
            companyName: `${vd.vendorCompany} Associates`,
            contactPerson: `${vd.name} Partner`,
            email: `partner@${vd.email.split('@')[1]}`,
            status: 'active',
            vendorId: vendor.id,
          },
        });
        subVendorCount++;
      }
    }
    created.vendors = vendorCount;
    created.subVendors = subVendorCount;
    log.push(`✅ Vendors: ${vendorCount}, SubVendors: ${subVendorCount}`);

    // ═══════════════════════ DOCUMENTS (5 per company) ═══════════════════════
    let docCount = 0;
    const docDefs = [
      { name: 'Employment Offer Letter', type: 'contract' },
      { name: 'Non-Disclosure Agreement', type: 'legal' },
      { name: 'ID Proof', type: 'id_proof' },
      { name: 'Tax Form', type: 'tax' },
      { name: 'Benefits Enrollment Form', type: 'general' },
    ];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (let i = 0; i < docDefs.length; i++) {
        await db.document.create({
          data: {
            name: docDefs[i].name,
            title: `${docDefs[i].name} - ${compEmps[i % compEmps.length].employeeId}`,
            type: docDefs[i].type,
            status: 'active',
            employeeId: compEmps[i % compEmps.length].id,
          },
        });
        docCount++;
      }
    }
    created.documents = docCount;
    log.push(`✅ Documents: ${docCount}`);

    // ═══════════════════════ SHIFTS ═══════════════════════
    let shiftCount = 0;
    let shiftMemberCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const shifts = await Promise.all([
        db.shift.create({ data: { name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakMinutes: 30, isActive: true, companyId: comp.id } }),
        db.shift.create({ data: { name: 'General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60, isActive: true, companyId: comp.id } }),
        db.shift.create({ data: { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakMinutes: 30, isActive: true, companyId: comp.id } }),
      ]);
      shiftCount += shifts.length;
      for (let i = 0; i < compEmps.length; i++) {
        await db.shiftMember.create({
          data: { effectiveDate: d('2025-01-01'), shiftId: shifts[i < 7 ? 1 : i % 3].id, employeeId: compEmps[i].id },
        });
        shiftMemberCount++;
      }
    }
    created.shifts = shiftCount;
    created.shiftMembers = shiftMemberCount;
    log.push(`✅ Shifts: ${shiftCount}, Shift Members: ${shiftMemberCount}`);

    // ═══════════════════════ SURVEYS ═══════════════════════
    let surveyCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const survey = await db.survey.create({
        data: {
          title: `Q1 2025 Engagement - ${comp.code}`,
          description: 'Employee engagement pulse survey.',
          type: 'pulse', status: 'active',
          startDate: daysAgo(10), endDate: daysFromNow(5),
          companyId: comp.id,
        },
      });
      const qs = await Promise.all([
        db.surveyQuestion.create({ data: { question: 'How satisfied are you with your role?', type: 'rating', order: 0, surveyId: survey.id } }),
        db.surveyQuestion.create({ data: { question: 'Do you feel recognized?', type: 'rating', order: 1, surveyId: survey.id } }),
        db.surveyQuestion.create({ data: { question: 'How is team collaboration?', type: 'rating', order: 2, surveyId: survey.id } }),
      ]);
      for (let i = 0; i < Math.min(5, compEmps.length); i++) {
        for (const q of qs) {
          await db.surveyResponse.create({ data: { answer: String(3 + (i % 3)), questionId: q.id, employeeId: compEmps[i].id } });
        }
      }
      surveyCount++;
    }
    created.surveys = surveyCount;
    log.push(`✅ Surveys: ${surveyCount}`);

    // ═══════════════════════ COMPLIANCE ITEMS ═══════════════════════
    let complianceCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const compDefs = [
        { title: 'Annual Safety Training', category: 'safety', status: 'pending' },
        { title: 'Data Protection Audit', category: 'regulatory', status: 'pending' },
        { title: 'Quarterly Tax Filing', category: 'tax', status: 'completed' },
        { title: 'Privacy Policy Update', category: 'legal', status: 'in_progress' },
        { title: 'ISO Certification Renewal', category: 'industry', status: 'pending' },
      ];
      for (const cd of compDefs) {
        await db.complianceItem.create({
          data: { title: cd.title, description: cd.title, category: cd.category, dueDate: daysFromNow(60), status: cd.status, assignee: compEmps[1].id, companyId: comp.id },
        });
        complianceCount++;
      }
    }
    created.complianceItems = complianceCount;
    log.push(`✅ Compliance: ${complianceCount}`);

    // ═══════════════════════ PROJECTS & TASKS ═══════════════════════
    let projectCount = 0;
    let taskCount = 0;
    const marqProjectDefs = [
      { name: 'HRMS 2.0 Redesign', status: 'in_progress', priority: 'high', budget: 5000000, progress: 45 },
      { name: 'AI Chatbot Integration', status: 'completed', priority: 'medium', budget: 1500000, progress: 100 },
      { name: 'Mobile App Development', status: 'planning', priority: 'high', budget: 3000000, progress: 10 },
    ];
    const tcgProjectDefs = [
      { name: 'Cloud Migration', status: 'in_progress', priority: 'high', budget: 800000, progress: 60 },
      { name: 'Client Portal v3', status: 'in_progress', priority: 'medium', budget: 450000, progress: 35 },
      { name: 'DevOps Automation', status: 'planning', priority: 'medium', budget: 250000, progress: 5 },
    ];

    for (const [comp, pDefs, compEmps] of [[marq, marqProjectDefs, marqEmps], [tcg, tcgProjectDefs, tcgEmps]] as const) {
      for (const pd of pDefs) {
        const project = await db.project.create({
          data: { ...pd, description: pd.name, startDate: daysAgo(60), endDate: daysFromNow(120), companyId: comp.id, createdBy: compEmps[0].id },
        });
        projectCount++;
        for (let m = 0; m < 3; m++) {
          await db.projectMember.create({
            data: { role: m === 0 ? 'lead' : 'member', projectId: project.id, employeeId: compEmps[m % compEmps.length].id },
          });
        }
        await db.projectMilestone.create({
          data: { name: 'Phase 1', description: `Phase 1 of ${pd.name}`, dueDate: daysFromNow(30), status: pd.status === 'completed' ? 'completed' : 'pending', projectId: project.id },
        });
      }
    }
    created.projects = projectCount;

    const taskTitles = ['Implement feature X', 'Design flow Y', 'Build API Z', 'Fix bug W', 'Add search', 'Create report module', 'Deploy to staging', 'Optimize queries'];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (let i = 0; i < 8; i++) {
        const task = await db.task.create({
          data: {
            title: taskTitles[i], description: `Complete: ${taskTitles[i]}`,
            priority: ['low', 'medium', 'high', 'urgent'][i % 4],
            status: ['todo', 'in_progress', 'completed', 'review'][i % 4],
            dueDate: daysFromNow(5 + i * 3),
            companyId: comp.id, createdBy: compEmps[0].id,
          },
        });
        taskCount++;
        await db.taskAssignment.create({ data: { taskId: task.id, employeeId: compEmps[i % compEmps.length].id } });
        if (i % 2 === 0) {
          await db.taskComment.create({ data: { content: `Working on this. ETA: ${3 + i} days.`, taskId: task.id, employeeId: compEmps[i % compEmps.length].id } });
        }
      }
    }
    created.tasks = taskCount;
    log.push(`✅ Projects: ${projectCount}, Tasks: ${taskCount}`);

    // ═══════════════════════ ONBOARDING TASKS ═══════════════════════
    let onboardingCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const targetEmp = compEmps.find(e => e.employeeId.includes('009')) || compEmps[0];
      const onboardDefs = [
        { title: 'Complete IT Setup', category: 'it', status: 'completed' },
        { title: 'HR Orientation', category: 'hr', status: 'completed' },
        { title: 'Team Introduction', category: 'team', status: 'completed' },
        { title: 'Codebase Walkthrough', category: 'training', status: 'in_progress' },
        { title: 'First Project Assignment', category: 'training', status: 'pending' },
      ];
      for (const od of onboardDefs) {
        await db.onboardingTask.create({
          data: {
            title: od.title, description: od.title, category: od.category, status: od.status,
            dueDate: daysFromNow(7),
            completedAt: od.status === 'completed' ? daysAgo(5) : null,
            assignedTo: compEmps[0].id,
            employeeId: targetEmp.id,
          },
        });
        onboardingCount++;
      }
    }
    created.onboardingTasks = onboardingCount;
    log.push(`✅ Onboarding: ${onboardingCount}`);

    // ═══════════════════════ COMPANY POLICIES (5 per company) ═══════════════════════
    let policyCount = 0;
    for (const comp of [marq, tcg]) {
      const policyDefs = [
        { title: 'Leave Policy', category: 'Leave', version: '2.1' },
        { title: 'Code of Conduct', category: 'HR', version: '2.5' },
        { title: 'Remote Work Policy', category: 'Work Policy', version: '1.3' },
        { title: 'IT Security Policy', category: 'Security', version: '1.8' },
        { title: 'Travel Policy', category: 'Finance', version: '2.0' },
      ];
      for (const pd of policyDefs) {
        await db.companyPolicy.create({
          data: { title: pd.title, content: `${pd.title} for ${comp.name}`, category: pd.category, version: pd.version, effectiveDate: d('2024-01-01'), status: 'active', companyId: comp.id },
        });
        policyCount++;
      }
    }
    created.companyPolicies = policyCount;
    log.push(`✅ Policies: ${policyCount}`);

    // ═══════════════════════ TIMESHEETS ═══════════════════════
    let timesheetCount = 0;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    for (const emp of allEmployees) {
      const ts = await db.timesheet.create({
        data: { employeeId: emp.id, weekStart, weekEnd, totalHours: 40, status: 'approved', approvedBy: allEmployees[0].id, approvedAt: daysAgo(1) },
      });
      timesheetCount++;
      for (let day = 1; day <= 5; day++) {
        const entryDate = new Date(weekStart);
        entryDate.setDate(entryDate.getDate() + day);
        await db.timesheetEntry.create({
          data: { timesheetId: ts.id, date: entryDate, hours: 8, project: 'Main Project', task: 'Development', notes: 'Regular work' },
        });
      }
    }
    created.timesheets = timesheetCount;
    log.push(`✅ Timesheets: ${timesheetCount}`);

    // ═══════════════════════ WORKFLOWS ═══════════════════════
    let workflowCount = 0;
    for (const [comp, prefix] of [[marq, 'MARQ'], [tcg, 'TCG']] as const) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const wfDefs = [
        { name: 'Leave Approval', entity: 'leave', desc: 'Manager → HR', role1: `${prefix}_manager`, role2: `${prefix}_company_hr_admin` },
        { name: 'Expense Approval', entity: 'expense', desc: 'Manager → Finance', role1: `${prefix}_manager`, role2: `${prefix}_finance` },
      ];
      for (const wd of wfDefs) {
        const wf = await db.workflowDefinition.create({
          data: { name: wd.name, type: 'approval', entity: wd.entity, description: wd.desc, isActive: true, companyId: comp.id },
        });
        workflowCount++;
        await db.workflowStepDef.createMany({
          data: [
            { name: 'Manager Approval', stepOrder: 0, approverRole: wd.role1, approverType: 'role', action: 'approve_reject', workflowDefId: wf.id },
            { name: 'HR/Finance Approval', stepOrder: 1, approverRole: wd.role2, approverType: 'role', action: 'approve_reject', workflowDefId: wf.id },
          ],
        });
        const instance = await db.workflowInstance.create({
          data: { status: 'approved', currentStep: 2, initiatedBy: compEmps[2].id, workflowDefId: wf.id },
        });
        await db.workflowStepInstance.createMany({
          data: [
            { stepOrder: 0, status: 'approved', actionedBy: compEmps[0].id, comments: 'Approved', actedAt: daysAgo(2), workflowInstanceId: instance.id },
            { stepOrder: 1, status: 'approved', actionedBy: compEmps[1].id, comments: 'OK', actedAt: daysAgo(1), workflowInstanceId: instance.id },
          ],
        });
      }
    }
    created.workflows = workflowCount;
    log.push(`✅ Workflows: ${workflowCount}`);

    // ═══════════════════════ NOTIFICATIONS ═══════════════════════
    let notifCount = 0;
    const notifDefs = [
      { title: 'Leave Request', message: 'A leave request was submitted', type: 'info', category: 'leave' },
      { title: 'New Candidate', message: 'New application received', type: 'success', category: 'recruitment' },
      { title: 'Payslip Generated', message: 'Payslip is ready', type: 'info', category: 'payroll' },
      { title: 'Expense Approved', message: 'Travel expense approved', type: 'success', category: 'expense' },
      { title: 'Task Overdue', message: 'Task is overdue', type: 'warning', category: 'task' },
    ];
    for (const user of allUsers.slice(0, 6)) {
      for (const nd of notifDefs) {
        await db.notification.create({
          data: { title: nd.title, message: nd.message, type: nd.type, category: nd.category, isRead: Math.random() > 0.5, actionUrl: `/${nd.category}`, userId: user.id },
        });
        notifCount++;
      }
    }
    created.notifications = notifCount;
    log.push(`✅ Notifications: ${notifCount}`);

    // ═══════════════════════ AUDIT LOGS ═══════════════════════
    let auditCount = 0;
    const auditDefs = [
      { action: 'CREATE', entity: 'Employee', mod: 'employees' },
      { action: 'UPDATE', entity: 'Leave', mod: 'leaves' },
      { action: 'APPROVE', entity: 'ExpenseClaim', mod: 'expenses' },
      { action: 'LOGIN', entity: 'User', mod: 'auth' },
      { action: 'UPDATE', entity: 'PayrollRecord', mod: 'payroll' },
      { action: 'CREATE', entity: 'Job', mod: 'recruitment' },
      { action: 'DELETE', entity: 'Document', mod: 'documents' },
      { action: 'UPDATE', entity: 'CompanyPolicy', mod: 'settings' },
      { action: 'CREATE', entity: 'Project', mod: 'projects' },
      { action: 'APPROVE', entity: 'TravelRequest', mod: 'travel' },
    ];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (const ad of auditDefs) {
        await db.auditLog.create({
          data: {
            action: ad.action, entity: ad.entity,
            entityId: `sample-${auditCount + 1}`,
            details: `${ad.action} on ${ad.entity}`,
            userId: allUsers[auditCount % allUsers.length]?.id,
            ipAddress: `192.168.1.${100 + auditCount}`,
            module: ad.mod,
            employeeId: compEmps[auditCount % compEmps.length].id,
          },
        });
        auditCount++;
      }
    }
    created.auditLogs = auditCount;
    log.push(`✅ Audit Logs: ${auditCount}`);

    // ═══════════════════════ MANPOWER REQUISITIONS ═══════════════════════
    let reqCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const reqDefs = [
        { title: 'Senior ML Engineer', dept: 'Engineering', pos: 'ML Engineer', needed: 2, pri: 'urgent', just: 'AI demand', status: 'approved' },
        { title: 'HR Business Partner', dept: 'HR', pos: 'HR BP', needed: 1, pri: 'medium', just: 'HR support', status: 'pending' },
        { title: 'Sales Lead', dept: 'Sales', pos: 'Sales Lead', needed: 1, pri: 'high', just: 'Expand pipeline', status: 'draft' },
      ];
      for (const rd of reqDefs) {
        await db.manpowerRequisition.create({
          data: {
            title: rd.title, department: rd.dept, position: rd.pos,
            positionsNeeded: rd.needed, priority: rd.pri, justification: rd.just,
            status: rd.status, requestedBy: compEmps[0].id,
            approvedBy: rd.status === 'approved' ? compEmps[1].id : null,
            companyId: comp.id,
          },
        });
        reqCount++;
      }
    }
    created.requisitions = reqCount;
    log.push(`✅ Requisitions: ${reqCount}`);

    // ═══════════════════════ SKILLS ═══════════════════════
    const skillNames = ['React', 'Node.js', 'Python', 'ML', 'TensorFlow', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'TypeScript'];
    let skillCount = 0;
    for (const [comp, prefix] of [[marq, 'MARQ'], [tcg, 'TCG']] as const) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const skills = await Promise.all(
        skillNames.map(sn => db.skill.upsert({
          where: { name: `${prefix}_${sn}` },
          update: {},
          create: { name: `${prefix}_${sn}`, category: 'Technical', description: sn },
        }))
      );
      for (const emp of compEmps) {
        for (let s = 0; s < 4; s++) {
          try {
            await db.employeeSkill.create({
              data: {
                employeeId: emp.id,
                skillId: skills[(compEmps.indexOf(emp) * 3 + s) % skills.length].id,
                proficiency: ['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)],
                yearsExp: 1 + Math.floor(Math.random() * 8),
              },
            });
            skillCount++;
          } catch { /* unique constraint */ }
        }
      }
    }
    created.skills = skillCount;
    log.push(`✅ Skills: ${skillCount}`);

    // ═══════════════════════ FINAL SUMMARY ═══════════════════════
    log.push('\n🎉 Comprehensive seed completed successfully!');
    log.push('\n📊 Summary: 2 Companies (MARQ AI Technologies, TechCorp Global) with full module data');
    log.push('\n🔑 Login Credentials:');
    log.push('  - Platform Admin: superadmin@eh2r.com / admin123');
    log.push('  - MARQ Admin: admin@marqai.com / admin123');
    log.push('  - TCG Admin: admin@techcorp.com / admin123');
    log.push('  - All employee passwords: admin123');

    return NextResponse.json({
      success: true,
      message: 'Comprehensive database seeding completed',
      summary: created,
      log,
    });
  } catch (error) {
    console.error('Comprehensive seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      { success: false, error: errorMessage, stack: process.env.NODE_ENV === 'development' ? errorStack : undefined, created, log },
      { status: 500 }
    );
  }
}
