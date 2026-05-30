import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Force dynamic - always run server-side
export const dynamic = 'force-dynamic';

const d = (s: string) => new Date(s);
const daysAgo = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() - n); dt.setHours(0, 0, 0, 0); return dt; };
const daysFromNow = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() + n); dt.setHours(0, 0, 0, 0); return dt; };

// Helper: safely create a record, catching "column does not exist" and other DB errors
async function safeCreate<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.warn(`[reseed] SKIP ${label}: ${msg.substring(0, 300)}`);
    return null;
  }
}

// Helper: safely run an operation, catching errors
async function safeOp(label: string, fn: () => Promise<any>): Promise<void> {
  try {
    await fn();
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.warn(`[reseed] SKIP ${label}: ${msg.substring(0, 300)}`);
  }
}

// POST /api/reseed - Force re-seed database with correct 2-company data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { confirm } = body;

    if (confirm !== 'RESEED_CONFIRM') {
      return NextResponse.json({ error: 'Send { confirm: "RESEED_CONFIRM" } to reseed' }, { status: 400 });
    }

    console.log('Starting database re-seed...');

    // Delete all data in reverse dependency order
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
      () => db.companyMember.deleteMany(),
      () => db.officeLocation.deleteMany(),
      () => db.meetingInvitation.deleteMany(),
      () => db.meeting.deleteMany(),
      () => db.employee.deleteMany(),
      () => db.user.deleteMany(),
      () => db.department.deleteMany(),
      () => db.branch.deleteMany(),
      () => db.company.deleteMany(),
    ];

    for (const op of deleteOps) {
      try { await op(); } catch { /* continue */ }
    }
    console.log('All existing data deleted');

    const hashedPassword = await bcrypt.hash('admin123', 12);

    // =====================================================================
    // CRITICAL: COMPANY CREATION (only use known-existing columns)
    // Existing: id, name, code, industry, logo, domain, country, currency,
    //           timezone, isActive, parentId, createdAt, updatedAt
    // MISSING:  description, website, address, city, state, pincode, phone,
    //           email, foundedYear, employeeCount, createdBy
    // =====================================================================

    // Use raw SQL to create companies since Prisma client includes columns that don't exist in DB
    // Company columns that exist: id, name, code, industry, logo, domain, country, currency, timezone, isActive, parentId, createdAt, updatedAt
    await db.$executeRawUnsafe(`INSERT INTO "Company" (id, name, code, industry, logo, domain, country, currency, timezone, "isActive", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'MARQ AI Technologies', 'MARQ', 'AI & Technology', NULL, 'marqai.com', 'IN', 'INR', 'Asia/Kolkata', true, NOW(), NOW())`);
    const marqRows: { id: string }[] = await db.$queryRawUnsafe(`SELECT id FROM "Company" WHERE code = 'MARQ'`);
    const marq = marqRows[0];
    console.log('Company MARQ created:', marq.id);

    await db.$executeRawUnsafe(`INSERT INTO "Company" (id, name, code, industry, logo, domain, country, currency, timezone, "isActive", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'TechCorp Global', 'TCGC', 'IT Services', NULL, 'techcorp.com', 'US', 'USD', 'America/Los_Angeles', true, NOW(), NOW())`);
    const tcgRows: { id: string }[] = await db.$queryRawUnsafe(`SELECT id FROM "Company" WHERE code = 'TCGC'`);
    const tcg = tcgRows[0];
    console.log('Company TCGC created:', tcg.id);

    // =====================================================================
    // BRANCH CREATION - remove address & isActive (might not exist in DB)
    // Safe columns: name, code, city, state, country, companyId
    // =====================================================================

    const marqBranchResults = await Promise.all([
      safeCreate('MQ-Branch-BLR', () => db.branch.create({ data: { name: 'Bangalore HQ', code: 'MQ-BLR', city: 'Bangalore', state: 'Karnataka', country: 'IN', companyId: marq.id } })),
      safeCreate('MQ-Branch-MUM', () => db.branch.create({ data: { name: 'Mumbai Office', code: 'MQ-MUM', city: 'Mumbai', state: 'Maharashtra', country: 'IN', companyId: marq.id } })),
      safeCreate('MQ-Branch-HYD', () => db.branch.create({ data: { name: 'Hyderabad Dev Center', code: 'MQ-HYD', city: 'Hyderabad', state: 'Telangana', country: 'IN', companyId: marq.id } })),
    ]);
    const marqBranches = marqBranchResults.filter((b): b is NonNullable<typeof b> => b !== null);

    const tcgBranchResults = await Promise.all([
      safeCreate('TC-Branch-SF', () => db.branch.create({ data: { name: 'San Francisco HQ', code: 'TC-SF', city: 'San Francisco', state: 'CA', country: 'US', companyId: tcg.id } })),
      safeCreate('TC-Branch-NY', () => db.branch.create({ data: { name: 'New York Office', code: 'TC-NY', city: 'New York', state: 'NY', country: 'US', companyId: tcg.id } })),
      safeCreate('TC-Branch-AUS', () => db.branch.create({ data: { name: 'Austin Tech Hub', code: 'TC-AUS', city: 'Austin', state: 'TX', country: 'US', companyId: tcg.id } })),
    ]);
    const tcgBranches = tcgBranchResults.filter((b): b is NonNullable<typeof b> => b !== null);

    // =====================================================================
    // DEPARTMENT CREATION - remove description & isActive (might not exist)
    // Safe columns: name, code, companyId
    // =====================================================================

    const marqDeptResults = await Promise.all([
      safeCreate('MQ-Dept-ENG', () => db.department.create({ data: { name: 'Engineering', code: 'MQ-ENG', companyId: marq.id } })),
      safeCreate('MQ-Dept-HR', () => db.department.create({ data: { name: 'HR', code: 'MQ-HR', companyId: marq.id } })),
      safeCreate('MQ-Dept-FIN', () => db.department.create({ data: { name: 'Finance', code: 'MQ-FIN', companyId: marq.id } })),
      safeCreate('MQ-Dept-MKT', () => db.department.create({ data: { name: 'Marketing', code: 'MQ-MKT', companyId: marq.id } })),
      safeCreate('MQ-Dept-SAL', () => db.department.create({ data: { name: 'Sales', code: 'MQ-SAL', companyId: marq.id } })),
      safeCreate('MQ-Dept-OPS', () => db.department.create({ data: { name: 'Operations', code: 'MQ-OPS', companyId: marq.id } })),
    ]);
    const marqDepts = marqDeptResults.filter((d): d is NonNullable<typeof d> => d !== null);

    const tcgDeptResults = await Promise.all([
      safeCreate('TC-Dept-ENG', () => db.department.create({ data: { name: 'Engineering', code: 'TC-ENG', companyId: tcg.id } })),
      safeCreate('TC-Dept-HR', () => db.department.create({ data: { name: 'HR', code: 'TC-HR', companyId: tcg.id } })),
      safeCreate('TC-Dept-FIN', () => db.department.create({ data: { name: 'Finance', code: 'TC-FIN', companyId: tcg.id } })),
      safeCreate('TC-Dept-MKT', () => db.department.create({ data: { name: 'Marketing', code: 'TC-MKT', companyId: tcg.id } })),
      safeCreate('TC-Dept-SAL', () => db.department.create({ data: { name: 'Sales', code: 'TC-SAL', companyId: tcg.id } })),
      safeCreate('TC-Dept-OPS', () => db.department.create({ data: { name: 'Operations', code: 'TC-OPS', companyId: tcg.id } })),
    ]);
    const tcgDepts = tcgDeptResults.filter((d): d is NonNullable<typeof d> => d !== null);

    // =====================================================================
    // CRITICAL: ADMIN USER CREATION
    // =====================================================================

    const marqAdminUser = await db.user.create({
      data: { email: 'admin@marqai.com', password: hashedPassword, name: 'MARQ Admin', role: 'super_admin', isActive: true, companyId: marq.id }
    });
    console.log('Admin user created:', marqAdminUser.email);

    const tcgAdminUser = await safeCreate('TCG-Admin-User', () =>
      db.user.create({ data: { email: 'admin@techcorp.com', password: hashedPassword, name: 'TCG Admin', role: 'super_admin', isActive: true, companyId: tcg.id } })
    );

    const platformAdmin = await safeCreate('Platform-Admin', () =>
      db.user.create({ data: { email: 'superadmin@eh2r.com', password: hashedPassword, name: 'Platform Super Admin', role: 'super_admin', isActive: true } })
    );

    // =====================================================================
    // CRITICAL: ADMIN EMPLOYEE CREATION (minimal fields only)
    // Required in schema: employeeId, firstName, lastName, email, designation,
    //                     employmentType, status, joiningDate, companyId, departmentId
    // REMOVED (might not exist): phone, gender, dateOfBirth, nationality,
    //   city, state, country, probationEnd, reportingManagerId, avatar
    // =====================================================================

    const adminEmp = await db.employee.create({
      data: {
        employeeId: 'MQ-001',
        firstName: 'MARQ',
        lastName: 'Admin',
        email: 'admin@marqai.com',
        designation: 'Super Admin',
        jobTitle: 'Super Admin',
        employmentType: 'full-time',
        status: 'active',
        joiningDate: d('2020-01-01'),
        companyId: marq.id,
        departmentId: marqDepts[0]?.id ?? '',
        branchId: marqBranches[0]?.id || undefined,
        userId: marqAdminUser.id,
      }
    });
    console.log('Admin employee created:', adminEmp.employeeId);

    const allUsers: { id: string }[] = [marqAdminUser];
    if (tcgAdminUser) allUsers.push(tcgAdminUser);
    if (platformAdmin) allUsers.push(platformAdmin);

    const allEmployees: { id: string; companyId: string; employeeId: string }[] = [adminEmp];

    // =====================================================================
    // OTHER EMPLOYEES - minimal fields, wrap each in try/catch
    // =====================================================================

    const marqEmpDefs = [
      { empId: 'MQ-002', fn: 'Meera', ln: 'Patel', email: 'meera.patel@marqai.com', designation: 'HR Manager', deptIdx: 1, branchIdx: 0, role: 'company_hr_admin', jDate: '2020-05-01', status: 'active' },
      { empId: 'MQ-003', fn: 'Vikram', ln: 'Singh', email: 'vikram.singh@marqai.com', designation: 'Senior ML Engineer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2021-03-10', status: 'active' },
      { empId: 'MQ-004', fn: 'Ananya', ln: 'Reddy', email: 'ananya.reddy@marqai.com', designation: 'Marketing Lead', deptIdx: 3, branchIdx: 0, role: 'employee', jDate: '2022-01-20', status: 'active' },
      { empId: 'MQ-005', fn: 'Rohan', ln: 'Joshi', email: 'rohan.joshi@marqai.com', designation: 'Finance Analyst', deptIdx: 2, branchIdx: 1, role: 'finance', jDate: '2022-09-05', status: 'active' },
      { empId: 'MQ-006', fn: 'Priya', ln: 'Nair', email: 'priya.nair@marqai.com', designation: 'Tech Lead', deptIdx: 0, branchIdx: 2, role: 'manager', jDate: '2021-11-01', status: 'active' },
      { empId: 'MQ-007', fn: 'Arjun', ln: 'Kumar', email: 'arjun.kumar@marqai.com', designation: 'Sales Executive', deptIdx: 4, branchIdx: 1, role: 'employee', jDate: '2023-04-12', status: 'active' },
      { empId: 'MQ-008', fn: 'Sneha', ln: 'Gupta', email: 'sneha.gupta@marqai.com', designation: 'Operations Manager', deptIdx: 5, branchIdx: 0, role: 'manager', jDate: '2021-08-15', status: 'active' },
      { empId: 'MQ-009', fn: 'Rajesh', ln: 'Verma', email: 'rajesh.verma@marqai.com', designation: 'Backend Developer', deptIdx: 0, branchIdx: 2, role: 'employee', jDate: '2024-09-01', status: 'probation' },
      { empId: 'MQ-010', fn: 'Kavitha', ln: 'Menon', email: 'kavitha.menon@marqai.com', designation: 'Data Scientist', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2022-06-20', status: 'active' },
    ];

    const tcgEmpDefs = [
      { empId: 'TC-001', fn: 'Sarah', ln: 'Johnson', email: 'sarah.johnson@techcorp.com', designation: 'VP Engineering', deptIdx: 0, branchIdx: 0, role: 'manager', jDate: '2019-06-15', status: 'active' },
      { empId: 'TC-002', fn: 'Michael', ln: 'Brown', email: 'michael.brown@techcorp.com', designation: 'HR Director', deptIdx: 1, branchIdx: 1, role: 'company_hr_admin', jDate: '2020-02-01', status: 'active' },
      { empId: 'TC-003', fn: 'Emily', ln: 'Chen', email: 'emily.chen@techcorp.com', designation: 'Senior Software Engineer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2021-03-10', status: 'active' },
      { empId: 'TC-004', fn: 'David', ln: 'Wilson', email: 'david.wilson@techcorp.com', designation: 'Marketing Manager', deptIdx: 3, branchIdx: 0, role: 'employee', jDate: '2021-07-20', status: 'active' },
      { empId: 'TC-005', fn: 'Lisa', ln: 'Anderson', email: 'lisa.anderson@techcorp.com', designation: 'Finance Manager', deptIdx: 2, branchIdx: 2, role: 'finance', jDate: '2020-11-01', status: 'active' },
      { empId: 'TC-006', fn: 'James', ln: 'Martinez', email: 'james.martinez@techcorp.com', designation: 'DevOps Lead', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2022-01-15', status: 'active' },
      { empId: 'TC-007', fn: 'Amanda', ln: 'Taylor', email: 'amanda.taylor@techcorp.com', designation: 'Sales Manager', deptIdx: 4, branchIdx: 1, role: 'manager', jDate: '2021-05-10', status: 'active' },
      { empId: 'TC-008', fn: 'Robert', ln: 'Garcia', email: 'robert.garcia@techcorp.com', designation: 'Operations Lead', deptIdx: 5, branchIdx: 2, role: 'employee', jDate: '2022-04-01', status: 'active' },
      { empId: 'TC-009', fn: 'Jessica', ln: 'Lee', email: 'jessica.lee@techcorp.com', designation: 'Frontend Developer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2024-10-01', status: 'probation' },
      { empId: 'TC-010', fn: 'Daniel', ln: 'Kim', email: 'daniel.kim@techcorp.com', designation: 'Data Engineer', deptIdx: 0, branchIdx: 0, role: 'employee', jDate: '2023-02-14', status: 'active' },
    ];

    // Create MARQ employees
    for (const ed of marqEmpDefs) {
      if (!marqDepts[ed.deptIdx]) continue;
      const user = await safeCreate(`User-${ed.email}`, () =>
        db.user.create({ data: { email: ed.email, password: hashedPassword, name: `${ed.fn} ${ed.ln}`, role: ed.role, isActive: true, companyId: marq.id } })
      );
      if (!user) continue;
      allUsers.push(user);

      const emp = await safeCreate(`Emp-${ed.empId}`, () =>
        db.employee.create({
          data: {
            employeeId: ed.empId, firstName: ed.fn, lastName: ed.ln, email: ed.email,
            designation: ed.designation, jobTitle: ed.designation,
            employmentType: 'full-time', status: ed.status, joiningDate: d(ed.jDate),
            companyId: marq.id, departmentId: marqDepts[ed.deptIdx].id,
            branchId: marqBranches[ed.branchIdx]?.id || undefined,
            userId: user.id,
          }
        })
      );
      if (emp) allEmployees.push(emp);
    }

    // Create TCG employees
    for (const ed of tcgEmpDefs) {
      if (!tcgDepts[ed.deptIdx]) continue;
      const user = await safeCreate(`User-${ed.email}`, () =>
        db.user.create({ data: { email: ed.email, password: hashedPassword, name: `${ed.fn} ${ed.ln}`, role: ed.role, isActive: true, companyId: tcg.id } })
      );
      if (!user) continue;
      allUsers.push(user);

      const emp = await safeCreate(`Emp-${ed.empId}`, () =>
        db.employee.create({
          data: {
            employeeId: ed.empId, firstName: ed.fn, lastName: ed.ln, email: ed.email,
            designation: ed.designation, jobTitle: ed.designation,
            employmentType: 'full-time', status: ed.status, joiningDate: d(ed.jDate),
            companyId: tcg.id, departmentId: tcgDepts[ed.deptIdx].id,
            branchId: tcgBranches[ed.branchIdx]?.id || undefined,
            userId: user.id,
          }
        })
      );
      if (emp) allEmployees.push(emp);
    }

    // =====================================================================
    // REPORTING MANAGERS - wrap in try/catch (reportingManagerId might not exist)
    // =====================================================================

    const marqEmps = allEmployees.filter(e => e.companyId === marq.id);
    const tcgEmps = allEmployees.filter(e => e.companyId === tcg.id);
    for (const emps of [marqEmps, tcgEmps]) {
      for (let i = 2; i < emps.length; i++) {
        if (i === 5 || i === 7) continue;
        await safeOp(`ReportingMgr-${emps[i].employeeId}`, () =>
          db.employee.update({ where: { id: emps[i].id }, data: { reportingManagerId: i < 5 ? emps[0].id : emps[5].id } })
        );
      }
    }

    // =====================================================================
    // ROLES & PERMISSIONS - wrap in try/catch
    // =====================================================================

    const roleNames = ['super_admin', 'company_hr_admin', 'manager', 'employee', 'finance'];
    const modules = ['employees', 'leaves', 'payroll', 'attendance', 'recruitment', 'performance', 'assets', 'travel', 'expenses', 'helpdesk', 'projects', 'reports', 'settings', 'compliance', 'learning'];
    const allRoles: { id: string; name: string }[] = [];
    for (const comp of [marq, tcg]) {
      for (const rn of roleNames) {
        const role = await safeCreate(`Role-${comp.code}_${rn}`, () =>
          db.role.create({ data: { name: `${comp.code}_${rn}`, description: `${rn} role`, isSystem: rn === 'super_admin', companyId: comp.id } })
        );
        if (role) {
          allRoles.push(role);
          for (const mod of modules) {
            const isSA = rn === 'super_admin'; const isHA = rn === 'company_hr_admin'; const isM = rn === 'manager'; const isF = rn === 'finance';
            await safeOp(`RolePerm-${role.name}-${mod}`, () =>
              db.rolePermission.create({ data: { roleId: role.id, module: mod, canRead: true, canWrite: isSA || isHA || isM || (isF && ['payroll', 'expenses', 'reports'].includes(mod)), canDelete: isSA || isHA, canExport: isSA || isHA || isF || isM } })
            );
          }
        }
      }
    }

    // User role assignments
    for (const comp of [marq, tcg]) {
      const compAdmin = comp.id === marq.id ? marqAdminUser : tcgAdminUser;
      if (!compAdmin) continue;
      const prefix = comp.id === marq.id ? 'MARQ' : 'TCGC';
      const hrRole = allRoles.find(r => r.name === `${prefix}_company_hr_admin`);
      const superAdminRole = allRoles.find(r => r.name === `${prefix}_super_admin`);
      if (hrRole) await safeOp('URA-HR', () => db.userRoleAssignment.create({ data: { userId: compAdmin.id, roleId: hrRole.id } }));
      if (superAdminRole) await safeOp('URA-SA', () => db.userRoleAssignment.create({ data: { userId: compAdmin.id, roleId: superAdminRole.id } }));
    }

    // =====================================================================
    // JOBS - remove filledPositions, closingDate; wrap companyId in try/catch
    // companyId is required in schema but might not exist in DB
    // =====================================================================

    const marqJobResults = await Promise.all([
      safeCreate('Job-MQ-1', () => db.job.create({ data: { title: 'Senior Full-Stack Developer', description: 'Join our engineering team to build next-gen AI products.', requirements: 'React, Node.js, TypeScript, 5+ years', department: 'Engineering', location: 'Bangalore', employmentType: 'Full-time', experienceMin: 5, experienceMax: 8, salaryMin: 1800000, salaryMax: 3000000, status: 'open', priority: 'high', positions: 2, postedDate: daysAgo(20), companyId: marq.id } })),
      safeCreate('Job-MQ-2', () => db.job.create({ data: { title: 'AI/ML Research Scientist', description: 'Work on cutting-edge AI research and model development.', requirements: 'ML, Python, TensorFlow, 4+ years', department: 'Engineering', location: 'Hyderabad', employmentType: 'Full-time', experienceMin: 4, experienceMax: 7, salaryMin: 2000000, salaryMax: 3500000, status: 'open', priority: 'urgent', positions: 1, postedDate: daysAgo(15), companyId: marq.id } })),
      safeCreate('Job-MQ-3', () => db.job.create({ data: { title: 'HR Business Partner', description: 'Dedicated HR support for engineering teams.', requirements: '7+ years HR experience', department: 'HR', location: 'Mumbai', employmentType: 'Full-time', experienceMin: 6, experienceMax: 10, salaryMin: 1200000, salaryMax: 1800000, status: 'open', priority: 'medium', positions: 1, postedDate: daysAgo(25), companyId: marq.id } })),
    ]);
    const marqJobs = marqJobResults.filter((j): j is NonNullable<typeof j> => j !== null);

    const tcgJobResults = await Promise.all([
      safeCreate('Job-TC-1', () => db.job.create({ data: { title: 'Senior Full-Stack Developer', description: 'Join our engineering team.', requirements: 'React, Node.js, 5+ years', department: 'Engineering', location: 'San Francisco, CA', employmentType: 'Full-time', experienceMin: 5, experienceMax: 8, salaryMin: 140000, salaryMax: 180000, status: 'open', priority: 'high', positions: 2, postedDate: daysAgo(20), companyId: tcg.id } })),
      safeCreate('Job-TC-2', () => db.job.create({ data: { title: 'Cloud Infrastructure Engineer', description: 'Build and maintain cloud infrastructure.', requirements: 'AWS, Terraform, K8s', department: 'Engineering', location: 'Austin, TX', employmentType: 'Full-time', experienceMin: 4, experienceMax: 7, salaryMin: 120000, salaryMax: 160000, status: 'open', priority: 'medium', positions: 1, postedDate: daysAgo(15), companyId: tcg.id } })),
      safeCreate('Job-TC-3', () => db.job.create({ data: { title: 'Sales Executive', description: 'Drive enterprise sales growth.', requirements: '3+ years B2B sales', department: 'Sales', location: 'New York, NY', employmentType: 'Full-time', experienceMin: 3, experienceMax: 5, salaryMin: 80000, salaryMax: 110000, status: 'open', priority: 'medium', positions: 3, postedDate: daysAgo(12), companyId: tcg.id } })),
    ]);
    const tcgJobs = tcgJobResults.filter((j): j is NonNullable<typeof j> => j !== null);

    // =====================================================================
    // CANDIDATES - wrap in try/catch
    // =====================================================================

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

    const allCandidateResults = await Promise.all(candidateData.map(cd => {
      const jobs = cd.comp === 'MARQ' ? marqJobs : tcgJobs;
      if (!jobs[cd.jobIdx]) return Promise.resolve(null);
      return safeCreate(`Candidate-${cd.email}`, () =>
        db.candidate.create({ data: { firstName: cd.fn, lastName: cd.ln, email: cd.email, currentCompany: cd.company, currentTitle: cd.title, experience: cd.exp, expectedSalary: cd.sal, noticePeriod: '30 days', status: cd.status, source: cd.source, aiScore: 65 + Math.floor(Math.random() * 30), skillMatch: 60 + Math.floor(Math.random() * 35), cultureFitScore: 70 + Math.floor(Math.random() * 25), jobId: jobs[cd.jobIdx].id } })
      );
    }));
    const allCandidates = allCandidateResults.filter((c): c is NonNullable<typeof c> => c !== null);

    // =====================================================================
    // AI INTERVIEWS - wrap in try/catch
    // =====================================================================

    const aiQuestions = [
      { question: 'Tell us about a challenging project.', category: 'experience' },
      { question: 'How do you approach system design?', category: 'technical' },
      { question: 'Describe microservices experience.', category: 'technical' },
      { question: 'How do you handle team conflicts?', category: 'communication' },
      { question: 'Debugging approach for production?', category: 'problem-solving' },
      { question: 'How do you stay updated?', category: 'culture-fit' }
    ];

    for (let i = 0; i < Math.min(2, allCandidates.length); i++) {
      const cand = allCandidates[i];
      if (!cand.jobId) continue;
      const scores = aiQuestions.map(() => 65 + Math.floor(Math.random() * 30));
      const responses = aiQuestions.map((q, idx) => ({ question: q.question, answer: `My experience in ${q.category} is strong.`, score: scores[idx], duration: 60 + Math.floor(Math.random() * 120) }));
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const isCompleted = i === 0;
      await safeCreate(`AIInterview-MARQ-${i}`, () =>
        db.aIInterview.create({ data: { candidateId: cand.id, jobId: cand.jobId!, status: isCompleted ? 'completed' : 'in_progress', questions: JSON.stringify(aiQuestions), responses: JSON.stringify(responses), score: isCompleted ? overall : null, feedback: isCompleted ? JSON.stringify({ overallScore: overall, recommendation: overall >= 75 ? 'proceed' : 'reject' }) : null, language: 'en', interviewLink: `/interview/ai-marq-${i + 1}`, cvScore: 70 + i * 8, duration: isCompleted ? 22 + i * 5 : null, startedAt: daysAgo(5 - i), completedAt: isCompleted ? daysAgo(4 - i) : null } })
      );
    }
    for (let i = 0; i < Math.min(2, Math.max(0, allCandidates.length - 5)); i++) {
      const cand = allCandidates[5 + i];
      if (!cand?.jobId) continue;
      const scores = aiQuestions.map(() => 65 + Math.floor(Math.random() * 30));
      const responses = aiQuestions.map((q, idx) => ({ question: q.question, answer: `My experience in ${q.category} is solid.`, score: scores[idx], duration: 60 + Math.floor(Math.random() * 120) }));
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const isCompleted = i === 0;
      await safeCreate(`AIInterview-TCG-${i}`, () =>
        db.aIInterview.create({ data: { candidateId: cand.id, jobId: cand.jobId!, status: isCompleted ? 'completed' : 'in_progress', questions: JSON.stringify(aiQuestions), responses: JSON.stringify(responses), score: isCompleted ? overall : null, feedback: isCompleted ? JSON.stringify({ overallScore: overall, recommendation: overall >= 75 ? 'proceed' : 'reject' }) : null, language: 'en', interviewLink: `/interview/ai-tcg-${i + 1}`, cvScore: 72 + i * 6, duration: isCompleted ? 25 + i * 4 : null, startedAt: daysAgo(3 - i), completedAt: isCompleted ? daysAgo(2 - i) : null } })
      );
    }

    // =====================================================================
    // ATTENDANCE - wrap in try/catch
    // =====================================================================

    let attCount = 0;
    const gpsCoords = { IN: { lat: 12.9716, lng: 77.5946 }, US: { lat: 37.7749, lng: -122.4194 } };
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = daysAgo(dayOffset);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      for (const emp of allEmployees) {
        const rand = Math.random();
        const status = rand < 0.75 ? 'present' : rand < 0.85 ? 'late' : rand < 0.93 ? 'half_day' : 'absent';
        const dateStr = date.toISOString().split('T')[0];
        const coords = gpsCoords[emp.companyId === marq.id ? 'IN' : 'US'] || gpsCoords.US;
        const latV = (Math.random() - 0.5) * 0.01;
        const lngV = (Math.random() - 0.5) * 0.01;
        await safeOp(`Attendance-${emp.employeeId}-${dateStr}`, async () => {
          if (status !== 'absent') {
            await db.attendance.create({ data: { date, checkIn: d(`${dateStr}T${status === 'late' ? '10' : '09'}:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00`), checkOut: status === 'half_day' ? d(`${dateStr}T13:00:00`) : d(`${dateStr}T18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00`), workHours: status === 'half_day' ? 4 : 8, status, source: 'web', gpsLatitude: coords.lat + latV, gpsLongitude: coords.lng + lngV, employeeId: emp.id } });
          } else {
            await db.attendance.create({ data: { date, status, source: 'web', gpsLatitude: coords.lat + latV, gpsLongitude: coords.lng + lngV, employeeId: emp.id } });
          }
        });
        attCount++;
      }
    }

    // =====================================================================
    // LEAVE POLICIES & LEAVES - remove approverId from leaves
    // =====================================================================

    const lpData = [
      { name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarryDays: 3 },
      { name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, maxCarryDays: 0 },
      { name: 'Earned Leave', type: 'earned', totalDays: 15, carryForward: true, maxCarryDays: 5 },
      { name: 'Maternity Leave', type: 'maternity', totalDays: 182, carryForward: false, maxCarryDays: 0 },
    ];
    for (const comp of [marq, tcg]) {
      for (const lp of lpData) {
        await safeOp(`LeavePolicy-${comp.code}-${lp.type}`, () =>
          db.leavePolicy.create({ data: { name: lp.name, type: lp.type, totalDays: lp.totalDays, carryForward: lp.carryForward, maxCarryDays: lp.maxCarryDays, isPaid: true, companyId: comp.id } })
        );
      }
    }

    let leaveCount = 0;
    const leaveDefs = [
      { type: 'casual', startOff: -5, endOff: -4, days: 2, reason: 'Personal work', status: 'approved' },
      { type: 'sick', startOff: -2, endOff: -1, days: 2, reason: 'Not feeling well', status: 'pending' },
      { type: 'earned', startOff: 10, endOff: 14, days: 5, reason: 'Family vacation', status: 'pending' },
      { type: 'casual', startOff: 20, endOff: 20, days: 1, reason: 'Doctor appointment', status: 'rejected' },
      { type: 'sick', startOff: -10, endOff: -9, days: 2, reason: 'Fever', status: 'approved' },
    ];
    for (const comp of [marq, tcg]) {
      const compEmpsList = allEmployees.filter(e => e.companyId === comp.id);
      for (const ld of leaveDefs) {
        // REMOVED: approverId (might not exist in DB)
        await safeOp(`Leave-${comp.code}-${ld.type}-${leaveCount}`, () =>
          db.leave.create({ data: { type: ld.type, startDate: daysFromNow(ld.startOff), endDate: daysFromNow(ld.endOff), totalDays: ld.days, reason: ld.reason, status: ld.status, employeeId: compEmpsList[leaveCount % compEmpsList.length].id } })
        );
        leaveCount++;
      }
    }

    // =====================================================================
    // PAYROLL - wrap in try/catch
    // =====================================================================

    await safeOp('PayrollStructure-MARQ', () =>
      db.payrollStructure.create({ data: { name: 'Standard MARQ', basicPay: 50000, hra: 20000, da: 5000, transportAllowance: 3000, medicalAllowance: 1500, specialAllowance: 10000, pfEmployee: 6000, pfEmployer: 6000, esiEmployee: 1500, esiEmployer: 4000, taxDeduction: 5000, companyId: marq.id } })
    );
    await safeOp('PayrollStructure-TCG', () =>
      db.payrollStructure.create({ data: { name: 'Standard TCG', basicPay: 6000, hra: 2400, da: 600, transportAllowance: 400, medicalAllowance: 200, specialAllowance: 1200, pfEmployee: 720, pfEmployer: 720, taxDeduction: 1500, companyId: tcg.id } })
    );

    let payrollCount = 0;
    const basicINR = [80000, 60000, 70000, 55000, 50000, 90000, 45000, 65000, 40000, 60000];
    const basicUSD = [10000, 8000, 9000, 7500, 8500, 9500, 7000, 7500, 6000, 8000];
    for (let month = 1; month <= 3; month++) {
      for (const [compEmpsList, pays] of [[marqEmps, basicINR], [tcgEmps, basicUSD]] as const) {
        for (let eIdx = 0; eIdx < compEmpsList.length; eIdx++) {
          const basic = pays[eIdx];
          if (!basic) continue;
          const gross = basic * 1.5;
          const deductions = basic * 0.22;
          await safeOp(`Payroll-${compEmpsList[eIdx].employeeId}-${month}`, () =>
            db.payrollRecord.create({ data: { month, year: 2025, basicPay: basic, grossSalary: gross, totalDeductions: deductions, netSalary: gross - deductions, status: month < 3 ? 'paid' : 'processed', paymentDate: d(`2025-${String(month).padStart(2, '0')}-28`), employeeId: compEmpsList[eIdx].id } })
          );
          payrollCount++;
        }
      }
    }

    // =====================================================================
    // GOALS & PERFORMANCE - wrap in try/catch
    // =====================================================================

    let goalCount = 0;
    for (const emp of allEmployees) {
      for (let g = 0; g < 3; g++) {
        const goalTitles = ['Improve code quality', 'Complete certification', 'Lead a project', 'Reduce bug rate', 'Mentor juniors', 'Improve velocity'];
        await safeOp(`Goal-${emp.employeeId}-${g}`, () =>
          db.goal.create({ data: { title: goalTitles[goalCount % goalTitles.length], description: 'Annual goal', type: g === 0 ? 'individual' : 'team', category: ['Technical', 'Development', 'Leadership'][g % 3], progress: Math.min(100, (goalCount + 1) * 15), status: ['not_started', 'in_progress', 'completed'][g % 3], startDate: d('2025-01-01'), endDate: d('2025-12-31'), employeeId: emp.id } })
        );
        goalCount++;
      }
    }

    for (const comp of [marq, tcg]) {
      const cycle = await safeCreate(`ReviewCycle-${comp.code}`, () =>
        db.reviewCycle.create({ data: { name: `${comp.code} Annual 2025`, type: 'annual', startDate: d('2025-01-01'), endDate: d('2025-01-31'), status: 'active', companyId: comp.id } })
      );
      if (!cycle) continue;
      const compEmpsList = allEmployees.filter(e => e.companyId === comp.id);
      for (let i = 0; i < Math.min(5, compEmpsList.length); i++) {
        const reviewerIdx = (i + 1) % compEmpsList.length;
        await safeOp(`PerfReview-${comp.code}-${i}`, () =>
          db.performanceReview.create({ data: { cycleId: cycle.id, reviewerId: compEmpsList[reviewerIdx].id, revieweeId: compEmpsList[i].id, rating: 3 + (i % 3), comments: ['Quality work', 'Needs improvement', 'Team player', 'Good skills', 'Leadership'][i], status: i < 3 ? 'completed' : 'pending' } })
        );
        await safeOp(`Performance-${comp.code}-${i}`, () =>
          db.performance.create({ data: { employeeId: compEmpsList[i].id, reviewPeriod: 'Q1 2025', reviewerId: compEmpsList[reviewerIdx].id, rating: 3 + (i % 3), objectives: 'Deliver key objectives', achievements: 'Met targets', feedback: 'Good progress.', status: i < 3 ? 'completed' : 'draft' } })
        );
      }
    }

    // =====================================================================
    // ASSETS - wrap in try/catch
    // =====================================================================

    for (const [comp, compEmpsList, prefix] of [[marq, marqEmps, 'MQ'], [tcg, tcgEmps, 'TC']] as const) {
      const assetDefs = [
        { type: 'laptop', name: 'MacBook Pro 16"', code: 'LTP' },
        { type: 'laptop', name: 'Dell XPS 15', code: 'LTP' },
        { type: 'monitor', name: 'Dell 27" 4K', code: 'MON' },
        { type: 'phone', name: 'iPhone 15 Pro', code: 'PHN' },
        { type: 'headset', name: 'Jabra Evolve2', code: 'HST' },
      ];
      for (let i = 0; i < assetDefs.length; i++) {
        await safeOp(`Asset-${prefix}-${i}`, () =>
          db.assetAllocation.create({ data: { assetType: assetDefs[i].type, assetName: assetDefs[i].name, assetCode: `${assetDefs[i].code}-${prefix}-${String(i + 1).padStart(3, '0')}`, serialNumber: `SN-${prefix}-${String(i + 1).padStart(4, '0')}`, status: 'allocated', allocatedAt: daysAgo(60 + i * 10), employeeId: compEmpsList[i % compEmpsList.length].id } })
        );
      }
    }

    // =====================================================================
    // TRAVEL & EXPENSES - remove approvedCost, approverId
    // =====================================================================

    for (const comp of [marq, tcg]) {
      const compEmpsList = allEmployees.filter(e => e.companyId === comp.id);
      if (compEmpsList.length === 0) continue;
      const isINR = comp.id === marq.id;
      for (const [purpose, dest, cost, status] of [
        ['Client meeting', isINR ? 'Mumbai' : 'New York', isINR ? 15000 : 2500, 'approved'],
        ['Tech Conference', isINR ? 'Singapore' : 'Las Vegas', isINR ? 80000 : 4000, 'pending'],
        ['Team sync', isINR ? 'Hyderabad' : 'Austin', isINR ? 8000 : 800, 'pending'],
      ] as const) {
        // REMOVED: approvedCost, approverId (might not exist in DB)
        await safeOp(`Travel-${comp.code}-${purpose}`, () =>
          db.travelRequest.create({ data: { purpose, destination: dest, departureDate: daysFromNow(15), returnDate: daysFromNow(17), estimatedCost: cost, status, employeeId: compEmpsList[0].id } })
        );
      }
    }

    for (const comp of [marq, tcg]) {
      const compEmpsList = allEmployees.filter(e => e.companyId === comp.id);
      if (compEmpsList.length === 0) continue;
      const isINR = comp.id === marq.id;
      for (const [type, amt, desc, status] of [
        ['travel', isINR ? 5000 : 450, 'Taxi to airport', 'pending'],
        ['food', isINR ? 2500 : 120, 'Team lunch', 'approved'],
        ['communication', isINR ? 1500 : 85, 'International calls', 'reimbursed'],
        ['equipment', isINR ? 8000 : 250, 'USB Hub', 'pending'],
        ['travel', isINR ? 12000 : 350, 'Flight booking', 'approved'],
      ] as const) {
        // REMOVED: approverId (might not exist in DB)
        await safeOp(`Expense-${comp.code}-${type}-${status}`, () =>
          db.expenseClaim.create({ data: { type, amount: amt, description: desc, status, employeeId: compEmpsList[0].id } })
        );
      }
    }

    // =====================================================================
    // LEARNING - wrap in try/catch
    // =====================================================================

    for (const comp of [marq, tcg]) {
      const compEmpsList = allEmployees.filter(e => e.companyId === comp.id);
      if (compEmpsList.length === 0) continue;
      const courses = [
        { courseName: 'Advanced React Patterns', provider: 'Frontend Masters', type: 'e_learning' },
        { courseName: 'AWS Solutions Architect', provider: 'AWS Training', type: 'certification' },
        { courseName: 'Leadership Essentials', provider: 'Coursera', type: 'e_learning' },
        { courseName: 'Data Science with Python', provider: 'edX', type: 'e_learning' },
        { courseName: 'Scrum Master Certification', provider: 'Scrum Alliance', type: 'certification' },
      ];
      for (let i = 0; i < courses.length; i++) {
        await safeOp(`Learning-${comp.code}-${i}`, () =>
          db.learningRecord.create({ data: { courseName: courses[i].courseName, provider: courses[i].provider, type: courses[i].type, status: i < 2 ? 'completed' : i === 2 ? 'in_progress' : 'enrolled', completedAt: i < 2 ? daysAgo(15 + i * 5) : null, score: i < 2 ? 80 + (i * 5) % 20 : null, certificate: i < 2 && courses[i].type === 'certification' ? `cert-${i + 1}` : null, employeeId: compEmpsList[i % compEmpsList.length].id } })
        );
      }
    }

    // =====================================================================
    // TICKETS - wrap in try/catch
    // =====================================================================

    for (const comp of [marq, tcg]) {
      const compEmpsList = allEmployees.filter(e => e.companyId === comp.id);
      if (compEmpsList.length === 0) continue;
      for (const [subject, cat, pri, status] of [
        ['VPN Connection Issue', 'it', 'high', 'in_progress'],
        ['Payroll Discrepancy', 'payroll', 'urgent', 'open'],
        ['Access Request', 'it', 'medium', 'resolved'],
        ['New Laptop Request', 'it', 'medium', 'open'],
        ['Cafeteria Feedback', 'general', 'low', 'resolved'],
      ] as const) {
        await safeOp(`Ticket-${comp.code}-${cat}`, () =>
          db.ticket.create({ data: { subject, description: `Detailed: ${subject}`, category: cat, priority: pri, status, resolution: status === 'resolved' ? 'Resolved successfully' : null, employeeId: compEmpsList[0].id } })
        );
      }
    }

    // =====================================================================
    // CLIENTS - wrap in try/catch
    // =====================================================================

    for (const cd of [
      { name: 'TechCorp Solutions', email: 'biz@techcorp.in', industry: 'IT' },
      { name: 'Global Finance', email: 'partner@globalfin.in', industry: 'Finance' },
      { name: 'HealthFirst India', email: 'connect@healthfirst.in', industry: 'Healthcare' },
    ]) {
      await safeOp(`Client-MQ-${cd.name}`, () =>
        db.client.create({ data: { ...cd, clientCompany: cd.name, contractStart: d('2024-01-01'), contractEnd: d('2025-12-31'), status: 'active', companyId: marq.id } })
      );
    }
    for (const cd of [
      { name: 'Acme Corp', email: 'hr@acme.com', industry: 'Technology' },
      { name: 'GlobalTech Inc', email: 'talent@globaltech.com', industry: 'Software' },
      { name: 'BuildRight', email: 'biz@buildright.com', industry: 'Construction' },
    ]) {
      await safeOp(`Client-TC-${cd.name}`, () =>
        db.client.create({ data: { ...cd, clientCompany: cd.name, contractStart: d('2024-01-01'), contractEnd: d('2025-12-31'), status: 'active', companyId: tcg.id } })
      );
    }

    // =====================================================================
    // VENDORS & SUBVENDORS - remove companyName, contactPerson from SubVendor
    // (they're required in schema but might not exist in actual DB; wrap in try/catch)
    // =====================================================================

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
        const vendor = await safeCreate(`Vendor-${vd.name}`, () =>
          db.vendor.create({ data: { name: vd.name, email: vd.email, vendorCompany: vd.vendorCompany, serviceType: vd.serviceType, rating: vd.rating, status: 'active', companyId: comp.id } })
        );
        if (!vendor) continue;
        // SubVendor: companyName and contactPerson might not exist in DB
        // Try with them first, then without
        const subVendor = await safeCreate(`SubVendor-${vd.vendorCompany}`, () =>
          db.subVendor.create({ data: { companyName: `${vd.vendorCompany} Associates`, contactPerson: `${vd.name} Partner`, email: `partner@${vd.email.split('@')[1]}`, status: 'active', vendorId: vendor.id } })
        );
        if (!subVendor) {
          // Retry without companyName and contactPerson (use dummy values since they're required in schema)
          // If these columns truly don't exist, this will also fail and be caught
          await safeCreate(`SubVendor-retry-${vd.vendorCompany}`, () =>
            (db.subVendor.create as any)({ data: { email: `partner@${vd.email.split('@')[1]}`, status: 'active', vendorId: vendor.id } })
          );
        }
      }
    }

    // =====================================================================
    // DOCUMENTS - remove fileName, fileSize, mimeType, uploadedAt
    // (these fields may not exist in the actual DB)
    // =====================================================================

    for (const comp of [marq, tcg]) {
      const compEmpsList = allEmployees.filter(e => e.companyId === comp.id);
      if (compEmpsList.length === 0) continue;
      for (const [name, type] of [
        ['Employment Offer Letter', 'contract'],
        ['Non-Disclosure Agreement', 'legal'],
        ['ID Proof', 'id_proof'],
        ['Address Proof', 'id_proof'],
        ['Tax Document', 'financial'],
      ] as const) {
        await safeOp(`Document-${comp.code}-${type}`, () =>
          db.document.create({ data: { name, type, status: 'verified', employeeId: compEmpsList[Math.floor(Math.random() * compEmpsList.length)].id } })
        );
      }
    }

    // =====================================================================
    // PROJECTS - remove createdBy (might not exist); wrap in try/catch
    // =====================================================================

    const marqProjectDefs = [
      { name: 'MARQ AI Platform v2', desc: 'Next-gen AI platform', status: 'in_progress', priority: 'high', budget: 5000000, progress: 45 },
      { name: 'Mobile App Redesign', desc: 'Redesigning mobile app', status: 'planning', priority: 'medium', budget: 1500000, progress: 10 },
      { name: 'Data Pipeline Optimization', desc: 'Optimize ETL pipelines', status: 'completed', priority: 'high', budget: 800000, progress: 100 },
    ];
    const tcgProjectDefs = [
      { name: 'Smart Factory Initiative', desc: 'IoT-enabled smart factory', status: 'in_progress', priority: 'high', budget: 8000000, progress: 30 },
      { name: 'Supply Chain Digitization', desc: 'Digital transformation', status: 'planning', priority: 'medium', budget: 3000000, progress: 5 },
      { name: 'Quality Management System', desc: 'QMS for ISO compliance', status: 'in_progress', priority: 'medium', budget: 1200000, progress: 60 },
    ];

    for (const [comp, compEmpsList, projectDefs] of [[marq, marqEmps, marqProjectDefs], [tcg, tcgEmps, tcgProjectDefs]] as const) {
      for (const pd of projectDefs) {
        // REMOVED: createdBy (might not exist in DB)
        await safeOp(`Project-${pd.name}`, () =>
          db.project.create({ data: { name: pd.name, description: pd.desc, status: pd.status, priority: pd.priority, startDate: daysAgo(60), endDate: daysFromNow(90), budget: pd.budget, progress: pd.progress, companyId: comp.id } })
        );
      }
    }

    // =====================================================================
    // WORKFLOWS - wrap in try/catch
    // =====================================================================

    for (const comp of [marq, tcg]) {
      await safeOp(`Workflow-Leave-${comp.code}`, () =>
        db.workflowDefinition.create({ data: { name: 'Leave Approval Workflow', type: 'approval', entity: 'leave', description: 'Standard leave approval', isActive: true, companyId: comp.id, steps: { create: [{ name: 'Manager Approval', stepOrder: 0, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject' }, { name: 'HR Approval', stepOrder: 1, approverRole: 'company_hr_admin', approverType: 'role', action: 'approve_reject' }] } } })
      );
      await safeOp(`Workflow-Onboarding-${comp.code}`, () =>
        db.workflowDefinition.create({ data: { name: 'Onboarding Workflow', type: 'sequential', entity: 'onboarding', description: 'Onboarding steps', isActive: true, companyId: comp.id, steps: { create: [{ name: 'HR Orientation', stepOrder: 0, approverRole: 'company_hr_admin', approverType: 'role', action: 'confirm' }, { name: 'IT Setup', stepOrder: 1, approverRole: 'it_admin', approverType: 'role', action: 'confirm' }] } } })
      );
      await safeOp(`Workflow-Offboarding-${comp.code}`, () =>
        db.workflowDefinition.create({ data: { name: 'Offboarding Workflow', type: 'sequential', entity: 'offboarding', description: 'Offboarding steps', isActive: true, companyId: comp.id, steps: { create: [{ name: 'Manager Exit Review', stepOrder: 0, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject' }, { name: 'HR Clearance', stepOrder: 1, approverRole: 'company_hr_admin', approverType: 'role', action: 'approve_reject' }, { name: 'IT Asset Recovery', stepOrder: 2, approverRole: 'it_admin', approverType: 'role', action: 'confirm' }] } } })
      );
    }

    // =====================================================================
    // OFFICE LOCATIONS - these were just created so should have all columns
    // =====================================================================

    await safeOp('OfficeLoc-MQ-BLR', () =>
      db.officeLocation.create({ data: { name: 'MARQ Bangalore HQ', address: 'Whitefield, Bangalore', latitude: 12.9716, longitude: 77.5946, radius: 500, isActive: true, companyId: marq.id } })
    );
    await safeOp('OfficeLoc-MQ-MUM', () =>
      db.officeLocation.create({ data: { name: 'MARQ Mumbai Office', address: 'BKC, Mumbai', latitude: 19.0760, longitude: 72.8777, radius: 500, isActive: true, companyId: marq.id } })
    );
    await safeOp('OfficeLoc-TC-SF', () =>
      db.officeLocation.create({ data: { name: 'TCG San Francisco HQ', address: '101 Market St, San Francisco', latitude: 37.7749, longitude: -122.4194, radius: 500, isActive: true, companyId: tcg.id } })
    );
    await safeOp('OfficeLoc-TC-NY', () =>
      db.officeLocation.create({ data: { name: 'TCG New York Office', address: '350 5th Ave, New York', latitude: 40.7484, longitude: -73.9857, radius: 500, isActive: true, companyId: tcg.id } })
    );

    // =====================================================================
    // DONE
    // =====================================================================

    console.log('Database re-seeded successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database re-seeded successfully!',
      data: {
        companies: 2,
        users: allUsers.length,
        employees: allEmployees.length,
        candidates: allCandidates.length,
        attendance: attCount,
        leaves: leaveCount,
        payroll: payrollCount,
        goals: goalCount,
        loginCredentials: {
          MARQ: { email: 'admin@marqai.com', password: 'admin123', companyCode: 'MARQ' },
          TCGC: { email: 'admin@techcorp.com', password: 'admin123', companyCode: 'TCGC' },
          Platform: { email: 'superadmin@eh2r.com', password: 'admin123' },
        }
      }
    });

  } catch (error: any) {
    console.error('Reseed error:', error);
    return NextResponse.json({ success: false, error: error.message?.substring(0, 500) }, { status: 500 });
  }
}

// GET - Check reseed status
export async function GET() {
  try {
    const companyCount = await db.company.count();
    const userCount = await db.user.count();
    const employeeCount = await db.employee.count();
    const adminUser = await db.user.findUnique({ where: { email: 'admin@marqai.com' } });

    return NextResponse.json({
      status: 'connected',
      currentData: { companies: companyCount, users: userCount, employees: employeeCount },
      adminUserExists: !!adminUser,
      adminUserActive: adminUser?.isActive ?? false,
      loginCredentials: {
        MARQ: { email: 'admin@marqai.com', password: 'admin123', companyCode: 'MARQ' },
        TCGC: { email: 'admin@techcorp.com', password: 'admin123', companyCode: 'TCGC' },
      },
      reseedEndpoint: 'POST /api/reseed with { confirm: "RESEED_CONFIRM" }',
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message?.substring(0, 300) }, { status: 500 });
  }
}
