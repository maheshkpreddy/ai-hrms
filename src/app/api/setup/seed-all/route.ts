import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
const d = (s: string) => new Date(s);
const daysAgo = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() - n); dt.setHours(0,0,0,0); return dt; };
const daysFromNow = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() + n); dt.setHours(0,0,0,0); return dt; };

export async function POST(request: Request) {
  // Only allow in development or by super_admin
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) {
    try {
      const body = await request.json();
      if (body?.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden: Only super_admin can seed data' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Forbidden: Only available in development' }, { status: 403 });
    }
  }

  const counts: Record<string, number> = {};
  const startTime = Date.now();

  try {
    // ═══════════════════ DELETE EXISTING DATA ═══════════════════
    console.log('Deleting all existing data...');

    const deleteOps = [
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

    // ═══════════════════ SEED BOTH COMPANIES ═══════════════════
    const defaultPassword = await hashPassword('admin123');
    const empPassword = await hashPassword('employee123');

    // ──────── COMPANY 1: MARQ AI Technologies ────────
    const marq = await db.company.create({
      data: {
        name: 'MARQ AI Technologies',
        code: 'MARQ',
        industry: 'AI & Technology',
        country: 'IN',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        domain: 'marqai.tech',
        isActive: true,
      },
    });

    // ──────── COMPANY 2: TechCorp Global ────────
    const tcg = await db.company.create({
      data: {
        name: 'TechCorp Global',
        code: 'TCG',
        industry: 'IT Services',
        country: 'US',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        domain: 'techcorp.com',
        isActive: true,
      },
    });

    counts.companies = 2;

    // ──────── BRANCHES ────────
    const marqBranches = await Promise.all([
      db.branch.create({ data: { name: 'Bangalore HQ', code: 'MQ-BLR', city: 'Bangalore', state: 'Karnataka', country: 'IN', address: 'Whitefield, Bangalore 560066', isActive: true, companyId: marq.id } }),
      db.branch.create({ data: { name: 'Mumbai Office', code: 'MQ-MUM', city: 'Mumbai', state: 'Maharashtra', country: 'IN', address: 'BKC, Mumbai 400051', isActive: true, companyId: marq.id } }),
      db.branch.create({ data: { name: 'Hyderabad Dev Center', code: 'MQ-HYD', city: 'Hyderabad', state: 'Telangana', country: 'IN', address: 'HITEC City, Hyderabad 500081', isActive: true, companyId: marq.id } }),
    ]);

    const tcgBranches = await Promise.all([
      db.branch.create({ data: { name: 'San Francisco HQ', code: 'TC-SF', city: 'San Francisco', state: 'CA', country: 'US', address: '101 Market St, San Francisco, CA 94105', isActive: true, companyId: tcg.id } }),
      db.branch.create({ data: { name: 'New York Office', code: 'TC-NY', city: 'New York', state: 'NY', country: 'US', address: '350 5th Ave, New York, NY 10118', isActive: true, companyId: tcg.id } }),
      db.branch.create({ data: { name: 'Austin Tech Hub', code: 'TC-AUS', city: 'Austin', state: 'TX', country: 'US', address: '200 Congress Ave, Austin, TX 78701', isActive: true, companyId: tcg.id } }),
    ]);

    counts.branches = 6;

    // ──────── DEPARTMENTS ────────
    const deptNames = ['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Design'];
    const marqDepts = await Promise.all(deptNames.map(n => db.department.create({ data: { name: n, code: n.substring(0, 3).toUpperCase(), description: `${n} Department`, isActive: true, companyId: marq.id } })));
    const tcgDepts = await Promise.all(deptNames.map(n => db.department.create({ data: { name: n, code: n.substring(0, 3).toUpperCase(), description: `${n} Department`, isActive: true, companyId: tcg.id } })));
    counts.departments = 12;

    // ──────── ROLES & PERMISSIONS ────────
    const roleNames = ['super_admin', 'company_hr_admin', 'manager', 'employee', 'finance'];
    const modules = ['employees', 'leaves', 'payroll', 'attendance', 'recruitment', 'performance', 'assets', 'travel', 'expenses', 'helpdesk', 'projects', 'reports', 'settings', 'compliance', 'learning'];
    
    const allRoles: { id: string; name: string; companyId: string | null }[] = [];
    for (const comp of [marq, tcg]) {
      for (const rn of roleNames) {
        const role = await db.role.create({ data: { name: `${comp.code}_${rn}`, description: `${rn} role for ${comp.name}`, isSystem: rn === 'super_admin', companyId: comp.id } });
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
              canWrite: isSuperAdmin || isHrAdmin || isManager || (isFinanceRole && ['payroll','expenses','reports'].includes(mod)),
              canDelete: isSuperAdmin || isHrAdmin,
              canExport: isSuperAdmin || isHrAdmin || isFinanceRole || isManager,
            },
          });
        }
      }
    }
    counts.roles = allRoles.length;
    counts.rolePermissions = allRoles.length * modules.length;

    // ──────── USERS & EMPLOYEES ────────
    const marqAdminUser = await db.user.create({ data: { email: 'admin@marqai.tech', password: defaultPassword, name: 'MARQ Admin', role: 'super_admin', isActive: true, companyId: marq.id } });
    const tcgAdminUser = await db.user.create({ data: { email: 'admin@techcorp.com', password: defaultPassword, name: 'TCG Admin', role: 'super_admin', isActive: true, companyId: tcg.id } });
    const platformAdmin = await db.user.create({ data: { email: 'superadmin@eh2r.com', password: defaultPassword, name: 'Platform Super Admin', role: 'super_admin', isActive: true } });

    const marqEmpDefs = [
      { empId: 'MQ-001', fn: 'Aarav', ln: 'Sharma', email: 'aarav.sharma@marqai.tech', phone: '+91-9876543201', designation: 'VP Engineering', dept: marqDepts[0], branch: marqBranches[0], role: 'manager', jDate: '2020-01-15', dob: '1985-06-15', gender: 'male', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-002', fn: 'Meera', ln: 'Patel', email: 'meera.patel@marqai.tech', phone: '+91-9876543202', designation: 'HR Manager', dept: marqDepts[1], branch: marqBranches[0], role: 'company_hr_admin', jDate: '2020-05-01', dob: '1988-03-22', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-003', fn: 'Vikram', ln: 'Singh', email: 'vikram.singh@marqai.tech', phone: '+91-9876543203', designation: 'Senior ML Engineer', dept: marqDepts[0], branch: marqBranches[0], role: 'employee', jDate: '2021-03-10', dob: '1990-11-08', gender: 'male', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-004', fn: 'Ananya', ln: 'Reddy', email: 'ananya.reddy@marqai.tech', phone: '+91-9876543204', designation: 'Product Designer', dept: marqDepts[5], branch: marqBranches[0], role: 'employee', jDate: '2022-01-20', dob: '1993-07-14', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-005', fn: 'Rohan', ln: 'Joshi', email: 'rohan.joshi@marqai.tech', phone: '+91-9876543205', designation: 'Finance Analyst', dept: marqDepts[2], branch: marqBranches[1], role: 'finance', jDate: '2022-09-05', dob: '1991-04-30', gender: 'male', city: 'Mumbai', state: 'Maharashtra', country: 'IN', status: 'active' },
      { empId: 'MQ-006', fn: 'Priya', ln: 'Nair', email: 'priya.nair@marqai.tech', phone: '+91-9876543206', designation: 'Tech Lead', dept: marqDepts[0], branch: marqBranches[2], role: 'manager', jDate: '2021-11-01', dob: '1987-12-03', gender: 'female', city: 'Hyderabad', state: 'Telangana', country: 'IN', status: 'active' },
      { empId: 'MQ-007', fn: 'Arjun', ln: 'Kumar', email: 'arjun.kumar@marqai.tech', phone: '+91-9876543207', designation: 'Sales Executive', dept: marqDepts[4], branch: marqBranches[1], role: 'employee', jDate: '2023-04-12', dob: '1994-09-18', gender: 'male', city: 'Mumbai', state: 'Maharashtra', country: 'IN', status: 'active' },
      { empId: 'MQ-008', fn: 'Sneha', ln: 'Gupta', email: 'sneha.gupta@marqai.tech', phone: '+91-9876543208', designation: 'Operations Manager', dept: marqDepts[3], branch: marqBranches[0], role: 'manager', jDate: '2021-08-15', dob: '1989-02-25', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
      { empId: 'MQ-009', fn: 'Rajesh', ln: 'Verma', email: 'rajesh.verma@marqai.tech', phone: '+91-9876543209', designation: 'Backend Developer', dept: marqDepts[0], branch: marqBranches[2], role: 'employee', jDate: '2024-09-01', dob: '1996-05-11', gender: 'male', city: 'Hyderabad', state: 'Telangana', country: 'IN', status: 'probation' },
      { empId: 'MQ-010', fn: 'Kavitha', ln: 'Menon', email: 'kavitha.menon@marqai.tech', phone: '+91-9876543210', designation: 'Data Scientist', dept: marqDepts[0], branch: marqBranches[0], role: 'employee', jDate: '2022-06-20', dob: '1992-10-07', gender: 'female', city: 'Bangalore', state: 'Karnataka', country: 'IN', status: 'active' },
    ];

    const tcgEmpDefs = [
      { empId: 'TC-001', fn: 'Sarah', ln: 'Johnson', email: 'sarah.johnson@techcorp.com', phone: '+1-415-555-0001', designation: 'VP Engineering', dept: tcgDepts[0], branch: tcgBranches[0], role: 'manager', jDate: '2019-06-15', dob: '1984-08-20', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-002', fn: 'Michael', ln: 'Brown', email: 'michael.brown@techcorp.com', phone: '+1-212-555-0002', designation: 'HR Director', dept: tcgDepts[1], branch: tcgBranches[1], role: 'company_hr_admin', jDate: '2020-02-01', dob: '1986-11-12', gender: 'male', city: 'New York', state: 'NY', country: 'US', status: 'active' },
      { empId: 'TC-003', fn: 'Emily', ln: 'Chen', email: 'emily.chen@techcorp.com', phone: '+1-415-555-0003', designation: 'Senior Software Engineer', dept: tcgDepts[0], branch: tcgBranches[0], role: 'employee', jDate: '2021-03-10', dob: '1990-04-15', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-004', fn: 'David', ln: 'Wilson', email: 'david.wilson@techcorp.com', phone: '+1-415-555-0004', designation: 'UX Lead', dept: tcgDepts[5], branch: tcgBranches[0], role: 'employee', jDate: '2021-07-20', dob: '1989-09-28', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-005', fn: 'Lisa', ln: 'Anderson', email: 'lisa.anderson@techcorp.com', phone: '+1-512-555-0005', designation: 'Finance Manager', dept: tcgDepts[2], branch: tcgBranches[2], role: 'finance', jDate: '2020-11-01', dob: '1987-01-05', gender: 'female', city: 'Austin', state: 'TX', country: 'US', status: 'active' },
      { empId: 'TC-006', fn: 'James', ln: 'Martinez', email: 'james.martinez@techcorp.com', phone: '+1-415-555-0006', designation: 'DevOps Lead', dept: tcgDepts[0], branch: tcgBranches[0], role: 'employee', jDate: '2022-01-15', dob: '1991-06-30', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
      { empId: 'TC-007', fn: 'Amanda', ln: 'Taylor', email: 'amanda.taylor@techcorp.com', phone: '+1-212-555-0007', designation: 'Sales Manager', dept: tcgDepts[4], branch: tcgBranches[1], role: 'manager', jDate: '2021-05-10', dob: '1988-12-18', gender: 'female', city: 'New York', state: 'NY', country: 'US', status: 'active' },
      { empId: 'TC-008', fn: 'Robert', ln: 'Garcia', email: 'robert.garcia@techcorp.com', phone: '+1-512-555-0008', designation: 'Operations Lead', dept: tcgDepts[3], branch: tcgBranches[2], role: 'employee', jDate: '2022-04-01', dob: '1990-03-22', gender: 'male', city: 'Austin', state: 'TX', country: 'US', status: 'active' },
      { empId: 'TC-009', fn: 'Jessica', ln: 'Lee', email: 'jessica.lee@techcorp.com', phone: '+1-415-555-0009', designation: 'Frontend Developer', dept: tcgDepts[0], branch: tcgBranches[0], role: 'employee', jDate: '2024-10-01', dob: '1995-07-09', gender: 'female', city: 'San Francisco', state: 'CA', country: 'US', status: 'probation' },
      { empId: 'TC-010', fn: 'Daniel', ln: 'Kim', email: 'daniel.kim@techcorp.com', phone: '+1-415-555-0010', designation: 'Data Engineer', dept: tcgDepts[0], branch: tcgBranches[0], role: 'employee', jDate: '2023-02-14', dob: '1993-10-02', gender: 'male', city: 'San Francisco', state: 'CA', country: 'US', status: 'active' },
    ];

    // Create users and employees for both companies
    const allUsers: { id: string }[] = [platformAdmin, marqAdminUser, tcgAdminUser];
    const allEmployees: { id: string; companyId: string; employeeId: string }[] = [];

    for (const [compId, adminUser, empDefs] of [[marq.id, marqAdminUser, marqEmpDefs], [tcg.id, tcgAdminUser, tcgEmpDefs]] as const) {
      for (const ed of empDefs) {
        const pw = ['manager', 'company_hr_admin', 'finance'].includes(ed.role) ? defaultPassword : empPassword;
        const user = await db.user.create({ data: { email: ed.email, password: pw, name: `${ed.fn} ${ed.ln}`, role: ed.role, isActive: true, companyId: compId } });
        allUsers.push(user);

        const emp = await db.employee.create({
          data: {
            employeeId: ed.empId, firstName: ed.fn, lastName: ed.ln, email: ed.email, phone: ed.phone,
            designation: ed.designation, jobTitle: ed.designation, employmentType: 'full-time', status: ed.status,
            joiningDate: d(ed.jDate), probationEnd: ed.status === 'probation' ? d('2025-06-01') : null,
            dateOfBirth: d(ed.dob), gender: ed.gender, city: ed.city, state: ed.state, country: ed.country,
            nationality: ed.country === 'IN' ? 'Indian' : 'American',
            companyId: compId, departmentId: ed.dept.id, branchId: ed.branch.id, userId: user.id,
          },
        });
        allEmployees.push(emp);
      }
    }
    counts.users = allUsers.length;
    counts.employees = allEmployees.length;

    // Set reporting managers
    const marqEmps = allEmployees.filter(e => e.companyId === marq.id);
    const tcgEmps = allEmployees.filter(e => e.companyId === tcg.id);
    for (const emps of [marqEmps, tcgEmps]) {
      for (let i = 2; i < emps.length; i++) {
        if (i === 5 || i === 7) continue;
        await db.employee.update({ where: { id: emps[i].id }, data: { reportingManagerId: i < 5 ? emps[0].id : emps[5].id } });
      }
    }

    // User role assignments
    for (const comp of [marq, tcg]) {
      const compAdmin = comp.id === marq.id ? marqAdminUser : tcgAdminUser;
      const hrRole = allRoles.find(r => r.name === `${comp.id === marq.id ? 'MARQ' : 'TCG'}_company_hr_admin`);
      const superAdminRole = allRoles.find(r => r.name === `${comp.id === marq.id ? 'MARQ' : 'TCG'}_super_admin`);
      if (hrRole) await db.userRoleAssignment.create({ data: { userId: compAdmin.id, roleId: hrRole.id } });
      if (superAdminRole) await db.userRoleAssignment.create({ data: { userId: compAdmin.id, roleId: superAdminRole.id } });
    }

    // ──────── JOBS ────────
    const marqJobs = await Promise.all([
      db.job.create({ data: { title: 'Senior Full-Stack Developer', description: 'Join our engineering team.', requirements: 'React, Node.js, TypeScript, 5+ years', department: 'Engineering', location: 'Bangalore', employmentType: 'Full-time', experienceMin: 5, experienceMax: 8, salaryMin: 1800000, salaryMax: 3000000, status: 'open', priority: 'high', positions: 2, postedDate: daysAgo(20), companyId: marq.id } }),
      db.job.create({ data: { title: 'AI/ML Research Scientist', description: 'Work on cutting-edge AI.', requirements: 'ML, Python, 4+ years', department: 'Engineering', location: 'Hyderabad', employmentType: 'Full-time', experienceMin: 4, experienceMax: 7, salaryMin: 2000000, salaryMax: 3500000, status: 'open', priority: 'urgent', positions: 1, postedDate: daysAgo(15), companyId: marq.id } }),
      db.job.create({ data: { title: 'HR Business Partner', description: 'Dedicated HR support.', requirements: '7+ years HR experience', department: 'HR', location: 'Mumbai', employmentType: 'Full-time', experienceMin: 6, experienceMax: 10, salaryMin: 1200000, salaryMax: 1800000, status: 'open', priority: 'medium', positions: 1, postedDate: daysAgo(25), companyId: marq.id } }),
      db.job.create({ data: { title: 'Product Designer', description: 'Design our products.', requirements: 'Figma, 3+ years', department: 'Design', location: 'Bangalore', employmentType: 'Full-time', experienceMin: 3, experienceMax: 6, salaryMin: 1000000, salaryMax: 1800000, status: 'draft', priority: 'medium', positions: 1, companyId: marq.id } }),
      db.job.create({ data: { title: 'Data Engineer', description: 'Build data pipelines.', requirements: 'SQL, Python, Spark', department: 'Engineering', location: 'Bangalore', employmentType: 'Full-time', experienceMin: 3, experienceMax: 5, salaryMin: 1500000, salaryMax: 2200000, status: 'open', priority: 'high', positions: 2, postedDate: daysAgo(10), companyId: marq.id } }),
    ]);

    const tcgJobs = await Promise.all([
      db.job.create({ data: { title: 'Senior Full-Stack Developer', description: 'Join our engineering team.', requirements: 'React, Node.js, 5+ years', department: 'Engineering', location: 'San Francisco, CA', employmentType: 'Full-time', experienceMin: 5, experienceMax: 8, salaryMin: 140000, salaryMax: 180000, status: 'open', priority: 'high', positions: 2, postedDate: daysAgo(20), companyId: tcg.id } }),
      db.job.create({ data: { title: 'Cloud Infrastructure Engineer', description: 'Cloud infra role.', requirements: 'AWS, Terraform, K8s', department: 'Engineering', location: 'Austin, TX', employmentType: 'Full-time', experienceMin: 4, experienceMax: 7, salaryMin: 120000, salaryMax: 160000, status: 'open', priority: 'medium', positions: 1, postedDate: daysAgo(15), companyId: tcg.id } }),
      db.job.create({ data: { title: 'UX Research Lead', description: 'Lead UX research.', requirements: '6+ years UX research', department: 'Design', location: 'San Francisco, CA', employmentType: 'Full-time', experienceMin: 6, experienceMax: 9, salaryMin: 130000, salaryMax: 165000, status: 'open', priority: 'high', positions: 1, postedDate: daysAgo(30), companyId: tcg.id } }),
      db.job.create({ data: { title: 'Sales Executive', description: 'Drive enterprise sales.', requirements: '3+ years B2B sales', department: 'Sales', location: 'New York, NY', employmentType: 'Full-time', experienceMin: 3, experienceMax: 5, salaryMin: 80000, salaryMax: 110000, status: 'draft', priority: 'low', positions: 3, companyId: tcg.id } }),
      db.job.create({ data: { title: 'DevOps Engineer', description: 'Automate everything.', requirements: 'CI/CD, Docker, K8s', department: 'Engineering', location: 'Remote', employmentType: 'Full-time', experienceMin: 3, experienceMax: 6, salaryMin: 110000, salaryMax: 150000, status: 'open', priority: 'medium', positions: 1, postedDate: daysAgo(12), companyId: tcg.id } }),
    ]);
    counts.jobs = marqJobs.length + tcgJobs.length;

    // ──────── CANDIDATES ────────
    const candidateData = [
      { fn: 'Rahul', ln: 'Verma', email: 'rahul.verma@email.com', company: 'Infosys', title: 'Senior Developer', exp: 6, sal: 2200000, status: 'interviewing', source: 'LinkedIn', jobIdx: 0, comp: 'MARQ' },
      { fn: 'Sneha', ln: 'Kapoor', email: 'sneha.kapoor@email.com', company: 'TCS', title: 'ML Engineer', exp: 4, sal: 2500000, status: 'shortlisted', source: 'Naukri', jobIdx: 1, comp: 'MARQ' },
      { fn: 'Vikram', ln: 'Malhotra', email: 'vikram.m@email.com', company: 'Wipro', title: 'Data Engineer', exp: 5, sal: 1800000, status: 'applied', source: 'Referral', jobIdx: 4, comp: 'MARQ' },
      { fn: 'Anita', ln: 'Bose', email: 'anita.bose@email.com', company: 'Accenture', title: 'HR Manager', exp: 8, sal: 1500000, status: 'offered', source: 'Naukri', jobIdx: 2, comp: 'MARQ' },
      { fn: 'Deepak', ln: 'Chopra', email: 'deepak.c@email.com', company: 'Cognizant', title: 'Full Stack Dev', exp: 3, sal: 1600000, status: 'screening', source: 'Portal', jobIdx: 0, comp: 'MARQ' },
      { fn: 'Alex', ln: 'Turner', email: 'alex.turner@email.com', company: 'Google', title: 'Software Engineer', exp: 6, sal: 170000, status: 'interviewing', source: 'LinkedIn', jobIdx: 0, comp: 'TCG' },
      { fn: 'Maya', ln: 'Singh', email: 'maya.singh@email.com', company: 'Amazon', title: 'Senior Developer', exp: 8, sal: 185000, status: 'shortlisted', source: 'Indeed', jobIdx: 1, comp: 'TCG' },
      { fn: 'James', ln: 'Williams', email: 'james.w@email.com', company: 'Microsoft', title: 'Cloud Engineer', exp: 5, sal: 155000, status: 'offered', source: 'Referral', jobIdx: 1, comp: 'TCG' },
      { fn: 'Sophie', ln: 'Martin', email: 'sophie.m@email.com', company: 'Meta', title: 'UX Researcher', exp: 7, sal: 150000, status: 'screening', source: 'Portal', jobIdx: 2, comp: 'TCG' },
      { fn: 'Wei', ln: 'Zhang', email: 'wei.z@email.com', company: 'Apple', title: 'Data Engineer', exp: 4, sal: 140000, status: 'applied', source: 'LinkedIn', jobIdx: 4, comp: 'TCG' },
    ];

    const allCandidates = await Promise.all(candidateData.map(cd => {
      const jobs = cd.comp === 'MARQ' ? marqJobs : tcgJobs;
      return db.candidate.create({
        data: {
          firstName: cd.fn, lastName: cd.ln, email: cd.email, currentCompany: cd.company, currentTitle: cd.title,
          experience: cd.exp, expectedSalary: cd.sal, noticePeriod: '30 days', status: cd.status, source: cd.source,
          aiScore: 65 + Math.floor(Math.random() * 30), skillMatch: 60 + Math.floor(Math.random() * 35), cultureFitScore: 70 + Math.floor(Math.random() * 25),
          jobId: jobs[cd.jobIdx].id,
        },
      });
    }));
    counts.candidates = allCandidates.length;

    // ──────── INTERVIEWS ────────
    let interviewCount = 0;
    for (const [candIdx, cand] of allCandidates.entries()) {
      if (candIdx >= 5) break;
      await db.interview.create({
        data: {
          type: ['technical', 'hr', 'manager', 'technical', 'culture'][candIdx],
          scheduledAt: daysFromNow(candIdx + 1), duration: 60,
          status: ['scheduled', 'completed', 'completed', 'scheduled', 'cancelled'][candIdx],
          feedback: candIdx === 1 || candIdx === 2 ? 'Good skills. Recommended.' : null,
          rating: candIdx === 1 || candIdx === 2 ? 4 : null,
          meetingLink: `https://meet.example.com/interview-${candIdx + 1}`,
          candidateId: cand.id, jobId: cand.jobId,
        },
      });
      interviewCount++;
    }
    counts.interviews = interviewCount;

    // ──────── AI INTERVIEWS ────────
    const aiQuestions = [
      { question: 'Tell us about a challenging project you led.', category: 'experience' },
      { question: 'How do you approach system design?', category: 'technical' },
      { question: 'Describe your microservices experience.', category: 'technical' },
      { question: 'How do you handle team conflicts?', category: 'communication' },
      { question: 'What is your debugging approach?', category: 'problem-solving' },
      { question: 'How do you stay updated with trends?', category: 'culture-fit' },
    ];

    for (const [i, cand] of allCandidates.entries()) {
      if (i >= 4) break;
      const scores = aiQuestions.map(() => 65 + Math.floor(Math.random() * 30));
      const responses = aiQuestions.map((q, idx) => ({
        question: q.question,
        answer: `My experience in ${q.category} is strong. At my previous role, I worked on ${q.category === 'technical' ? 'system architecture' : 'collaboration'}.`,
        score: scores[idx], duration: 60 + Math.floor(Math.random() * 120),
      }));
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const isCompleted = i < 2;

      await db.aIInterview.create({
        data: {
          candidateId: cand.id, jobId: cand.jobId,
          status: isCompleted ? 'completed' : 'in_progress',
          questions: JSON.stringify(aiQuestions), responses: JSON.stringify(responses),
          score: isCompleted ? overall : null,
          feedback: isCompleted ? JSON.stringify({ overallScore: overall, recommendation: overall >= 75 ? 'proceed' : 'reject' }) : null,
          language: 'en', interviewLink: `/interview/ai-${i + 1}`,
          cvScore: 70 + i * 8, duration: isCompleted ? 22 + i * 5 : null,
          startedAt: daysAgo(5 - i), completedAt: isCompleted ? daysAgo(4 - i) : null,
        },
      });
    }
    counts.aiInterviews = 4;

    // ──────── ATTENDANCE (last 7 days) ────────
    let attCount = 0;
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = daysAgo(dayOffset);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      for (const emp of allEmployees) {
        const rand = Math.random();
        const status = rand < 0.75 ? 'present' : rand < 0.85 ? 'late' : rand < 0.93 ? 'half_day' : 'absent';
        const dateStr = date.toISOString().split('T')[0];
        if (status !== 'absent') {
          await db.attendance.create({
            data: {
              date, checkIn: d(`${dateStr}T${status === 'late' ? '10' : '09'}:${String(Math.floor(Math.random() * 30)).padStart(2,'0')}:00`),
              checkOut: status === 'half_day' ? d(`${dateStr}T13:00:00`) : d(`${dateStr}T18:${String(Math.floor(Math.random() * 30)).padStart(2,'0')}:00`),
              workHours: status === 'half_day' ? 4 : 8, status, source: 'web', employeeId: emp.id,
            },
          });
        } else {
          await db.attendance.create({ data: { date, status, source: 'web', employeeId: emp.id } });
        }
        attCount++;
      }
    }
    counts.attendance = attCount;

    // ──────── LEAVE POLICIES ────────
    const lpData = [
      { name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarry: 3 },
      { name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, maxCarry: 0 },
      { name: 'Earned Leave', type: 'earned', totalDays: 15, carryForward: true, maxCarry: 5 },
      { name: 'Maternity Leave', type: 'maternity', totalDays: 182, carryForward: false, maxCarry: 0 },
    ];
    for (const comp of [marq, tcg]) {
      for (const lp of lpData) {
        await db.leavePolicy.create({ data: { ...lp, isPaid: true, maxCarryDays: lp.maxCarry, companyId: comp.id } });
      }
    }
    counts.leavePolicies = lpData.length * 2;

    // ──────── LEAVES ────────
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
          data: { type: ld.type, startDate: daysFromNow(ld.startOff), endDate: daysFromNow(ld.endOff), totalDays: ld.days, reason: ld.reason, status: ld.status, approverId: ld.status !== 'pending' ? compEmps[1].id : null, employeeId: compEmps[leaveCount % compEmps.length].id },
        });
        leaveCount++;
      }
    }
    counts.leaves = leaveCount;

    // ──────── PAYROLL ────────
    await db.payrollStructure.create({ data: { name: 'Standard MARQ', basicPay: 50000, hra: 20000, da: 5000, transportAllowance: 3000, medicalAllowance: 1500, specialAllowance: 10000, pfEmployee: 6000, pfEmployer: 6000, esiEmployee: 1500, esiEmployer: 4000, taxDeduction: 5000, companyId: marq.id } });
    await db.payrollStructure.create({ data: { name: 'Standard TCG', basicPay: 6000, hra: 2400, da: 600, transportAllowance: 400, medicalAllowance: 200, specialAllowance: 1200, pfEmployee: 720, pfEmployer: 720, taxDeduction: 1500, companyId: tcg.id } });
    counts.payrollStructures = 2;

    let payrollCount = 0;
    const basicINR = [80000, 60000, 70000, 55000, 50000, 90000, 45000, 65000, 40000, 60000];
    const basicUSD = [10000, 8000, 9000, 7500, 8500, 9500, 7000, 7500, 6000, 8000];
    for (let month = 1; month <= 3; month++) {
      for (const [compEmps, pays] of [[marqEmps, basicINR], [tcgEmps, basicUSD]] as const) {
        for (let eIdx = 0; eIdx < compEmps.length; eIdx++) {
          const basic = pays[eIdx]; const gross = basic * 1.5; const deductions = basic * 0.22;
          await db.payrollRecord.create({ data: { month, year: 2025, basicPay: basic, grossSalary: gross, totalDeductions: deductions, netSalary: gross - deductions, status: month < 3 ? 'paid' : 'processed', paymentDate: d(`2025-${String(month).padStart(2,'0')}-28`), employeeId: compEmps[eIdx].id } });
          payrollCount++;
        }
      }
    }
    counts.payrollRecords = payrollCount;

    // ──────── GOALS ────────
    let goalCount = 0;
    const goalTitles = ['Improve code quality', 'Complete certification', 'Lead a project', 'Reduce bug rate', 'Mentor juniors', 'Improve velocity'];
    for (const emp of allEmployees) {
      for (let g = 0; g < 3; g++) {
        await db.goal.create({ data: { title: goalTitles[goalCount % goalTitles.length], description: `Annual goal`, type: g === 0 ? 'individual' : 'team', category: ['Technical', 'Development', 'Leadership'][g % 3], progress: Math.min(100, (goalCount + 1) * 15), status: ['not_started', 'in_progress', 'completed'][g % 3], startDate: d('2025-01-01'), endDate: d('2025-12-31'), employeeId: emp.id } });
        goalCount++;
      }
    }
    counts.goals = goalCount;

    // ──────── PERFORMANCE ────────
    let reviewCount = 0;
    for (const comp of [marq, tcg]) {
      const cycle = await db.reviewCycle.create({ data: { name: `${comp.code} Annual 2025`, type: 'annual', startDate: d('2025-01-01'), endDate: d('2025-01-31'), status: 'active', companyId: comp.id } });
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (let i = 0; i < 5; i++) {
        await db.performanceReview.create({ data: { cycleId: cycle.id, reviewerId: compEmps[(i + 1) % compEmps.length].id, revieweeId: compEmps[i].id, rating: 3 + (i % 3), comments: ['Quality work', 'Needs improvement', 'Team player', 'Good skills', 'Leadership'][i], status: i < 3 ? 'completed' : 'pending' } });
        reviewCount++;
        await db.performance.create({ data: { employeeId: compEmps[i].id, reviewPeriod: 'Q1 2025', reviewerId: compEmps[(i + 1) % compEmps.length].id, rating: 3 + (i % 3), objectives: 'Deliver key objectives', achievements: 'Met targets', feedback: 'Good progress.', status: i < 3 ? 'completed' : 'draft' } });
      }
    }
    counts.performanceReviews = reviewCount;
    counts.performanceRecords = 10;

    // ──────── ASSETS ────────
    let assetCount = 0;
    const assetDefs = [
      { type: 'laptop', name: 'MacBook Pro 16"', code: 'LTP' }, { type: 'laptop', name: 'Dell XPS 15', code: 'LTP' },
      { type: 'monitor', name: 'Dell 27" 4K', code: 'MON' }, { type: 'phone', name: 'iPhone 15 Pro', code: 'PHN' },
      { type: 'headset', name: 'Jabra Evolve2', code: 'HST' },
    ];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const prefix = comp.id === marq.id ? 'MQ' : 'TC';
      for (let i = 0; i < assetDefs.length; i++) {
        await db.assetAllocation.create({ data: { assetType: assetDefs[i].type, assetName: assetDefs[i].name, assetCode: `${assetDefs[i].code}-${prefix}-${String(i + 1).padStart(3, '0')}`, serialNumber: `SN-${prefix}-${String(i + 1).padStart(4, '0')}`, status: 'allocated', allocatedAt: daysAgo(60 + i * 10), employeeId: compEmps[i % compEmps.length].id } });
        assetCount++;
      }
    }
    counts.assets = assetCount;

    // ──────── TRAVEL ────────
    let travelCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const isINR = comp.id === marq.id;
      for (const [purpose, dest, cost] of [['Client meeting', isINR ? 'Mumbai' : 'New York', isINR ? 15000 : 2500], ['Tech Conference', isINR ? 'Singapore' : 'Las Vegas', isINR ? 80000 : 4000], ['Team sync', isINR ? 'Hyderabad' : 'Austin', isINR ? 8000 : 800]] as const) {
        await db.travelRequest.create({ data: { purpose, destination: dest, departureDate: daysFromNow(15 + travelCount * 5), returnDate: daysFromNow(17 + travelCount * 5), estimatedCost: cost, status: travelCount % 3 === 1 ? 'approved' : 'pending', approverId: travelCount % 3 === 1 ? compEmps[1].id : null, employeeId: compEmps[travelCount % compEmps.length].id } });
        travelCount++;
      }
    }
    counts.travelRequests = travelCount;

    // ──────── EXPENSES ────────
    let expenseCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const isINR = comp.id === marq.id;
      for (const [type, amt, desc, status] of [['travel', isINR ? 5000 : 450, 'Taxi to airport', 'pending'], ['food', isINR ? 2500 : 120, 'Team lunch', 'approved'], ['communication', isINR ? 1500 : 85, 'Project calls', 'reimbursed'], ['equipment', isINR ? 8000 : 250, 'USB-C hub', 'pending'], ['travel', isINR ? 12000 : 350, 'Flight for client', 'approved']] as const) {
        await db.expenseClaim.create({ data: { type, amount: amt, description: desc, status, approverId: status !== 'pending' ? compEmps[1].id : null, employeeId: compEmps[expenseCount % compEmps.length].id } });
        expenseCount++;
      }
    }
    counts.expenseClaims = expenseCount;

    // ──────── LEARNING ────────
    let learningCount = 0;
    const courseDefs = [
      { name: 'Advanced React Patterns', provider: 'Frontend Masters', type: 'e_learning' },
      { name: 'AWS Solutions Architect', provider: 'AWS Training', type: 'certification' },
      { name: 'Leadership Essentials', provider: 'Coursera', type: 'e_learning' },
      { name: 'Data Science with Python', provider: 'edX', type: 'e_learning' },
      { name: 'Scrum Master Certification', provider: 'Scrum Alliance', type: 'certification' },
    ];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (let i = 0; i < courseDefs.length; i++) {
        await db.learningRecord.create({ data: { courseName: courseDefs[i].name, provider: courseDefs[i].provider, type: courseDefs[i].type, status: i < 2 ? 'completed' : i === 2 ? 'in_progress' : 'enrolled', completedAt: i < 2 ? daysAgo(15 + i * 5) : null, score: i < 2 ? 80 + (i * 5) % 20 : null, certificate: i < 2 && courseDefs[i].type === 'certification' ? `cert-${i + 1}` : null, employeeId: compEmps[i % compEmps.length].id } });
        learningCount++;
      }
    }
    counts.learningRecords = learningCount;

    // ──────── TICKETS ────────
    let ticketCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (const [subject, cat, pri, status] of [['VPN Connection Issue', 'it', 'high', 'in_progress'], ['Payroll Discrepancy', 'payroll', 'urgent', 'open'], ['Access Request', 'it', 'medium', 'resolved'], ['New Laptop Request', 'it', 'medium', 'open'], ['Cafeteria Feedback', 'general', 'low', 'resolved']] as const) {
        await db.ticket.create({ data: { subject, description: `Detailed: ${subject}`, category: cat, priority: pri, status, resolution: status === 'resolved' ? 'Issue resolved' : null, employeeId: compEmps[ticketCount % compEmps.length].id } });
        ticketCount++;
      }
    }
    counts.tickets = ticketCount;

    // ──────── HELPDESK ────────
    let helpdeskCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const prefix = comp.id === marq.id ? 'MARQ' : 'TCG';
      for (const [subject, cat, pri, status] of [['Email not syncing', 'IT Support', 'high', 'open'], ['Software license renewal', 'IT Support', 'medium', 'in_progress'], ['Office AC not working', 'Facilities', 'medium', 'resolved'], ['New hire equipment', 'IT Support', 'high', 'open'], ['Badge access issue', 'Security', 'urgent', 'resolved']] as const) {
        const ticket = await db.helpdeskTicket.create({ data: { ticketId: `${prefix}-HD-${String(helpdeskCount + 1001).padStart(4, '0')}`, requesterId: compEmps[helpdeskCount % compEmps.length].id, requesterType: 'employee', category: cat, priority: pri, subject, description: `Detailed: ${subject}`, assignedAgentId: status !== 'open' ? compEmps[1].id : null, slaDeadline: daysFromNow(2), status, resolution: status === 'resolved' ? 'Issue resolved.' : null, companyId: comp.id } });
        await db.helpdeskTicketComment.create({ data: { content: status === 'resolved' ? 'Fixed.' : 'Looking into it.', ticketId: ticket.id, employeeId: compEmps[1].id } });
        helpdeskCount++;
      }
    }
    counts.helpdeskTickets = helpdeskCount;

    // ──────── CLIENTS ────────
    let clientCount = 0;
    for (const [comp, clients] of [[marq, [{ name: 'TechCorp Solutions', email: 'biz@techcorp.in', industry: 'IT' }, { name: 'Global Finance', email: 'partner@globalfin.in', industry: 'Finance' }, { name: 'HealthFirst India', email: 'connect@healthfirst.in', industry: 'Healthcare' }, { name: 'EduLearn Academy', email: 'admin@edulearn.in', industry: 'Education' }]], [tcg, [{ name: 'Acme Corp', email: 'hr@acme.com', industry: 'Technology' }, { name: 'GlobalTech Inc', email: 'talent@globaltech.com', industry: 'Software' }, { name: 'BuildRight Construction', email: 'biz@buildright.com', industry: 'Construction' }]]] as const) {
      for (const cd of clients) {
        await db.client.create({ data: { ...cd, clientCompany: cd.name, contractStart: d('2024-01-01'), contractEnd: d('2025-12-31'), status: 'active', companyId: comp.id } });
        clientCount++;
      }
    }
    counts.clients = clientCount;

    // ──────── VENDORS & SUB-VENDORS ────────
    let vendorCount = 0; let subVendorCount = 0;
    for (const [comp, vDefs] of [[marq, [{ name: 'TalentHunt India', email: 'hr@talenthunt.in', company: 'TalentHunt', service: 'Recruitment', rating: 4.5 }, { name: 'CloudHost India', email: 'support@cloudhost.in', company: 'CloudHost', service: 'IT Infra', rating: 4.0 }, { name: 'SecureIT Solutions', email: 'contact@secureit.in', company: 'SecureIT', service: 'Cybersecurity', rating: 4.2 }]], [tcg, [{ name: 'TalentHunt Agency', email: 'info@talenthunt.com', company: 'TalentHunt', service: 'recruitment', rating: 4.5 }, { name: 'StaffPro Solutions', email: 'contact@staffpro.com', company: 'StaffPro', service: 'staffing', rating: 4.2 }, { name: 'VerifyRight BGV', email: 'team@verifyright.com', company: 'VerifyRight', service: 'bgv', rating: 4.8 }]]] as const) {
      for (const vd of vDefs) {
        const vendor = await db.vendor.create({ data: { ...vd, vendorCompany: vd.company, status: 'active', companyId: comp.id } });
        vendorCount++;
        await db.subVendor.create({ data: { name: `${vd.name} Partner`, email: `partner@${vd.email.split('@')[1]}`, company: `${vd.company} Associates`, status: 'active', vendorId: vendor.id } });
        subVendorCount++;
      }
    }
    counts.vendors = vendorCount;
    counts.subVendors = subVendorCount;

    // ──────── DOCUMENTS ────────
    let docCount = 0;
    for (const emp of allEmployees) {
      for (const docType of ['offer-letter', 'id-proof', 'certificate']) {
        await db.document.create({ data: { name: `${docType}_${emp.employeeId}`, type: docType, status: 'active', employeeId: emp.id } });
        docCount++;
      }
    }
    counts.documents = docCount;

    // ──────── SHIFTS ────────
    let shiftCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const shifts = await Promise.all([
        db.shift.create({ data: { name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakMinutes: 30, isActive: true, companyId: comp.id } }),
        db.shift.create({ data: { name: 'General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60, isActive: true, companyId: comp.id } }),
        db.shift.create({ data: { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakMinutes: 30, isActive: true, companyId: comp.id } }),
      ]);
      for (let i = 0; i < compEmps.length; i++) {
        await db.shiftMember.create({ data: { effectiveDate: d('2025-01-01'), shiftId: shifts[i < 7 ? 1 : i % 3].id, employeeId: compEmps[i].id } });
      }
      shiftCount += shifts.length;
    }
    counts.shifts = shiftCount;

    // ──────── COMPANY POLICIES ────────
    let policyCount = 0;
    for (const comp of [marq, tcg]) {
      for (const [title, cat, ver] of [['Leave Policy', 'Leave', '2.1'], ['Code of Conduct', 'HR', '2.5'], ['Remote Work Policy', 'Work Policy', '1.3'], ['IT Security Policy', 'Security', '1.8'], ['Travel Policy', 'Finance', '2.0'], ['Anti-Harassment Policy', 'Compliance', '3.0']] as const) {
        await db.companyPolicy.create({ data: { title, content: `${title} for ${comp.name}`, category: cat, version: ver, effectiveDate: d('2024-01-01'), status: 'active', companyId: comp.id } });
        policyCount++;
      }
    }
    counts.companyPolicies = policyCount;

    // ──────── PROJECTS ────────
    let projectCount = 0;
    for (const [comp, pDefs, compEmps] of [[marq, [{ name: 'HRMS 2.0 Redesign', status: 'in_progress', priority: 'high', budget: 5000000, progress: 45 }, { name: 'AI Chatbot Integration', status: 'completed', priority: 'medium', budget: 1500000, progress: 100 }, { name: 'Mobile App Development', status: 'planning', priority: 'high', budget: 3000000, progress: 10 }], marqEmps], [tcg, [{ name: 'Cloud Migration', status: 'in_progress', priority: 'high', budget: 800000, progress: 60 }, { name: 'Client Portal v3', status: 'in_progress', priority: 'medium', budget: 450000, progress: 35 }, { name: 'DevOps Automation', status: 'planning', priority: 'medium', budget: 250000, progress: 5 }], tcgEmps]] as const) {
      for (const pd of pDefs) {
        const project = await db.project.create({ data: { ...pd, description: pd.name, startDate: daysAgo(60), endDate: daysFromNow(120), companyId: comp.id, createdBy: compEmps[0].id } });
        for (let m = 0; m < 3; m++) await db.projectMember.create({ data: { role: m === 0 ? 'lead' : 'member', projectId: project.id, employeeId: compEmps[(projectCount + m) % compEmps.length].id } });
        await db.projectMilestone.create({ data: { name: 'Phase 1', description: `Phase 1 of ${pd.name}`, dueDate: daysFromNow(30), status: pd.status === 'completed' ? 'completed' : 'pending', projectId: project.id } });
        projectCount++;
      }
    }
    counts.projects = projectCount;

    // ──────── TASKS ────────
    let taskCount = 0;
    const taskTitles = ['Implement feature X', 'Design flow Y', 'Build API Z', 'Fix bug W', 'Add search', 'Create report module', 'Deploy to staging', 'Optimize queries'];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (let i = 0; i < 8; i++) {
        const task = await db.task.create({ data: { title: taskTitles[i], description: `Complete: ${taskTitles[i]}`, priority: ['low', 'medium', 'high', 'urgent'][i % 4], status: ['todo', 'in_progress', 'completed', 'review'][i % 4], dueDate: daysFromNow(5 + i * 3), companyId: comp.id, createdBy: compEmps[0].id } });
        await db.taskAssignment.create({ data: { taskId: task.id, employeeId: compEmps[i % compEmps.length].id } });
        if (i % 2 === 0) await db.taskComment.create({ data: { content: `Working on this. ETA: ${3 + i} days.`, taskId: task.id, employeeId: compEmps[i % compEmps.length].id } });
        taskCount++;
      }
    }
    counts.tasks = taskCount;

    // ──────── TIMESHEETS ────────
    let tsCount = 0;
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
    for (const emp of allEmployees) {
      const ts = await db.timesheet.create({ data: { employeeId: emp.id, weekStart, weekEnd, totalHours: 40, status: 'approved', approvedBy: allEmployees[0].id, approvedAt: daysAgo(1) } });
      for (let day = 1; day <= 5; day++) {
        const entryDate = new Date(weekStart); entryDate.setDate(entryDate.getDate() + day);
        await db.timesheetEntry.create({ data: { timesheetId: ts.id, date: entryDate, hours: 8, project: 'Main Project', task: 'Development', notes: 'Regular work' } });
      }
      tsCount++;
    }
    counts.timesheets = tsCount;

    // ──────── REQUISITIONS ────────
    let reqCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (const [title, dept, pos, needed, pri, just, status] of [['Senior ML Engineer', 'Engineering', 'ML Engineer', 2, 'urgent', 'AI demand', 'approved'], ['HR Business Partner', 'HR', 'HR BP', 1, 'medium', 'HR support', 'pending'], ['Sales Lead', 'Sales', 'Sales Lead', 1, 'high', 'Expand pipeline', 'draft']] as const) {
        await db.manpowerRequisition.create({ data: { title, department: dept, position: pos, positionsNeeded: needed, priority: pri, justification: just, status, requestedBy: compEmps[0].id, approvedBy: status === 'approved' ? compEmps[1].id : null, companyId: comp.id } });
        reqCount++;
      }
    }
    counts.requisitions = reqCount;

    // ──────── COMPLIANCE ────────
    let compItemCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (const [title, cat, status] of [['Annual Safety Training', 'safety', 'pending'], ['Data Protection Audit', 'regulatory', 'pending'], ['Quarterly Tax Filing', 'tax', 'completed'], ['Privacy Policy Update', 'legal', 'in_progress'], ['ISO Certification Renewal', 'industry', 'pending']] as const) {
        await db.complianceItem.create({ data: { title, description: title, category: cat, dueDate: daysFromNow(60), status, assignee: compEmps[1].id, companyId: comp.id } });
        compItemCount++;
      }
    }
    counts.complianceItems = compItemCount;

    // ──────── NOTIFICATIONS ────────
    let notifCount = 0;
    for (const user of allUsers.slice(0, 6)) {
      for (const [title, msg, type, cat] of [['Leave Request', 'A leave request was submitted', 'info', 'leave'], ['New Candidate', 'New application received', 'success', 'recruitment'], ['Payslip Generated', 'Payslip is ready', 'info', 'payroll'], ['Expense Approved', 'Travel expense approved', 'success', 'expense'], ['Task Overdue', 'Task is overdue', 'warning', 'task']] as const) {
        await db.notification.create({ data: { title, message: msg, type, category: cat, isRead: Math.random() > 0.5, actionUrl: `/${cat}`, userId: user.id } });
        notifCount++;
      }
    }
    counts.notifications = notifCount;

    // ──────── ONBOARDING ────────
    let onbCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const targetEmp = compEmps.find(e => e.employeeId.includes('009')) || compEmps[0];
      for (const [title, cat, status] of [['Complete IT Setup', 'it', 'completed'], ['HR Orientation', 'hr', 'completed'], ['Team Introduction', 'team', 'completed'], ['Codebase Walkthrough', 'training', 'in_progress'], ['First Project Assignment', 'training', 'pending']] as const) {
        await db.onboardingTask.create({ data: { title, description: title, category: cat, status, dueDate: daysFromNow(7 + onbCount * 3), completedAt: status === 'completed' ? daysAgo(7 - onbCount) : null, assignedTo: compEmps[0].id, employeeId: targetEmp.id } });
        onbCount++;
      }
    }
    counts.onboardingTasks = onbCount;

    // ──────── SKILLS ────────
    let skillCount = 0;
    const skillNames = ['React', 'Node.js', 'Python', 'ML', 'TensorFlow', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'TypeScript', 'Figma', 'GraphQL', 'Redis', 'CI/CD', 'Data Analysis'];
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const prefix = comp.id === marq.id ? 'MARQ' : 'TCG';
      const skills = await Promise.all(skillNames.map(sn => db.skill.upsert({ where: { name: `${prefix}_${sn}` }, update: {}, create: { name: `${prefix}_${sn}`, category: 'Technical', description: sn } })));
      for (const emp of compEmps) {
        for (let s = 0; s < 4; s++) {
          try { await db.employeeSkill.create({ data: { employeeId: emp.id, skillId: skills[(compEmps.indexOf(emp) * 3 + s) % skills.length].id, proficiency: ['beginner', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)], yearsExp: 1 + Math.floor(Math.random() * 8) } }); } catch { /* unique */ }
        }
      }
      skillCount += skills.length;
    }
    counts.skills = skillCount;

    // ──────── AUDIT LOGS ────────
    let auditCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      for (const [action, entity, mod] of [['CREATE', 'Employee', 'employees'], ['UPDATE', 'Leave', 'leaves'], ['APPROVE', 'ExpenseClaim', 'expenses'], ['LOGIN', 'User', 'auth'], ['UPDATE', 'PayrollRecord', 'payroll'], ['CREATE', 'Job', 'recruitment'], ['DELETE', 'Document', 'documents'], ['UPDATE', 'CompanyPolicy', 'settings'], ['CREATE', 'Project', 'projects'], ['APPROVE', 'TravelRequest', 'travel']] as const) {
        await db.auditLog.create({ data: { action, entity, entityId: `sample-${auditCount + 1}`, details: `${action} on ${entity}`, userId: allUsers[auditCount % allUsers.length]?.id, ipAddress: '192.168.1.' + (100 + auditCount), module: mod, employeeId: compEmps[auditCount % compEmps.length].id } });
        auditCount++;
      }
    }
    counts.auditLogs = auditCount;

    // ──────── WORKFLOWS ────────
    let wfCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const prefix = comp.id === marq.id ? 'MARQ' : 'TCG';
      for (const [name, entity, desc, role1, role2] of [['Leave Approval', 'leave', 'Manager → HR', `${prefix}_manager`, `${prefix}_company_hr_admin`], ['Expense Approval', 'expense', 'Manager → Finance', `${prefix}_manager`, `${prefix}_finance`]] as const) {
        const wf = await db.workflowDefinition.create({ data: { name, type: 'approval', entity, description: desc, isActive: true, companyId: comp.id } });
        await db.workflowStepDef.createMany({ data: [
          { name: 'Manager Approval', stepOrder: 0, approverRole: role1, approverType: 'role', action: 'approve_reject', workflowDefId: wf.id },
          { name: 'HR/Finance Approval', stepOrder: 1, approverRole: role2, approverType: 'role', action: 'approve_reject', workflowDefId: wf.id },
        ]});
        const instance = await db.workflowInstance.create({ data: { status: 'approved', currentStep: 2, initiatedBy: compEmps[2].id, workflowDefId: wf.id } });
        await db.workflowStepInstance.createMany({ data: [
          { stepOrder: 0, status: 'approved', actionedBy: compEmps[0].id, comments: 'Approved', actedAt: daysAgo(2), workflowInstanceId: instance.id },
          { stepOrder: 1, status: 'approved', actionedBy: compEmps[1].id, comments: 'OK', actedAt: daysAgo(1), workflowInstanceId: instance.id },
        ]});
        wfCount++;
      }
    }
    counts.workflowDefinitions = wfCount;

    // ──────── SURVEYS ────────
    let surveyCount = 0;
    for (const comp of [marq, tcg]) {
      const compEmps = allEmployees.filter(e => e.companyId === comp.id);
      const survey = await db.survey.create({ data: { title: `Q1 2025 Engagement - ${comp.code}`, description: 'Employee engagement pulse survey.', type: 'pulse', status: 'active', startDate: daysAgo(10), endDate: daysFromNow(5), companyId: comp.id } });
      const qs = await Promise.all([
        db.surveyQuestion.create({ data: { question: 'How satisfied are you with your role?', type: 'rating', order: 0, surveyId: survey.id } }),
        db.surveyQuestion.create({ data: { question: 'Do you feel recognized?', type: 'rating', order: 1, surveyId: survey.id } }),
        db.surveyQuestion.create({ data: { question: 'How is team collaboration?', type: 'rating', order: 2, surveyId: survey.id } }),
      ]);
      for (let i = 0; i < Math.min(5, compEmps.length); i++) {
        for (const q of qs) await db.surveyResponse.create({ data: { answer: String(3 + (i % 3)), questionId: q.id, employeeId: compEmps[i].id } });
      }
      surveyCount++;
    }
    counts.surveys = surveyCount;

    // ──────── ALUMNI ────────
    let alumniCount = 0;
    for (const comp of [marq, tcg]) {
      const prefix = comp.id === marq.id ? 'MQ' : 'TC';
      const alumniEmp = await db.employee.create({ data: { employeeId: `${prefix}-AL1`, firstName: comp.id === marq.id ? 'Rahul' : 'Kevin', lastName: comp.id === marq.id ? 'Das' : 'White', email: comp.id === marq.id ? 'rahul.das@alumni.marqai.tech' : 'kevin.white@alumni.techcorp.com', designation: 'Former Engineer', employmentType: 'full-time', status: 'exited', joiningDate: d('2021-06-01'), exitDate: d('2024-11-30'), companyId: comp.id, departmentId: (comp.id === marq.id ? marqDepts : tcgDepts)[0].id, branchId: (comp.id === marq.id ? marqBranches : tcgBranches)[0].id } });
      await db.alumniRecord.create({ data: { exitReason: 'Career change', rehireEligible: true, alumniEmail: alumniEmp.email, joinedAlumniAt: d('2024-11-30'), employeeId: alumniEmp.id } });
      alumniCount++;
    }
    counts.alumniRecords = alumniCount;

    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with 2 companies and all module data',
      elapsed: `${(elapsed / 1000).toFixed(1)}s`,
      counts,
      credentials: {
        platformAdmin: 'superadmin@eh2r.com / admin123',
        marqAdmin: 'admin@marqai.tech / admin123',
        tcgAdmin: 'admin@techcorp.com / admin123',
        employeePassword: 'employee123 or admin123',
      },
    });

  } catch (error: unknown) {
    console.error('Seed error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
      counts,
    }, { status: 500 });
  }
}
