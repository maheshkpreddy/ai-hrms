import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('Seeding database with bcrypt-hashed passwords...');

  // ==================== COMPANIES ====================
  const companies = await Promise.all([
    prisma.company.upsert({ where: { code: 'MARQ' }, update: {}, create: { name: 'MARQ AI Technologies', code: 'MARQ', industry: 'AI & Technology', country: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', isActive: true } }),
    prisma.company.upsert({ where: { code: 'ACME' }, update: {}, create: { name: 'ACME Corporation', code: 'ACME', industry: 'Technology', country: 'US', currency: 'USD', timezone: 'America/New_York', isActive: true } }),
    prisma.company.upsert({ where: { code: 'TCG' }, update: {}, create: { name: 'TechCorp Global', code: 'TCG', industry: 'IT Services', country: 'US', currency: 'USD', timezone: 'America/New_York', isActive: true } }),
    prisma.company.upsert({ where: { code: 'MPI' }, update: {}, create: { name: 'ManufactPro Industries', code: 'MPI', industry: 'Manufacturing', country: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', isActive: true } }),
    prisma.company.upsert({ where: { code: 'HFS' }, update: {}, create: { name: 'HealthFirst Solutions', code: 'HFS', industry: 'Healthcare', country: 'GB', currency: 'GBP', timezone: 'Europe/London', isActive: true } }),
    prisma.company.upsert({ where: { code: 'RMG' }, update: {}, create: { name: 'RetailMax Group', code: 'RMG', industry: 'Retail', country: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', isActive: true } }),
    prisma.company.upsert({ where: { code: 'LTW' }, update: {}, create: { name: 'LogiTrans Worldwide', code: 'LTW', industry: 'Logistics', country: 'SG', currency: 'SGD', timezone: 'Asia/Singapore', isActive: true } }),
  ]);
  console.log(`Created ${companies.length} companies`);

  const marq = companies[0];
  const acme = companies[1];
  const tcg = companies[2];
  const mpi = companies[3];
  const hfs = companies[4];

  // ==================== BRANCHES ====================
  const branches = await Promise.all([
    prisma.branch.upsert({ where: { id: 'branch-tcg-sf' }, update: {}, create: { id: 'branch-tcg-sf', name: 'HQ San Francisco', code: 'TCG-SF', city: 'San Francisco', state: 'CA', country: 'US', companyId: tcg.id } }),
    prisma.branch.upsert({ where: { id: 'branch-tcg-ny' }, update: {}, create: { id: 'branch-tcg-ny', name: 'NYC Office', code: 'TCG-NY', city: 'New York', state: 'NY', country: 'US', companyId: tcg.id } }),
    prisma.branch.upsert({ where: { id: 'branch-mpi-mum' }, update: {}, create: { id: 'branch-mpi-mum', name: 'Mumbai HQ', code: 'MPI-MUM', city: 'Mumbai', state: 'MH', country: 'IN', companyId: mpi.id } }),
    prisma.branch.upsert({ where: { id: 'branch-hfs-lon' }, update: {}, create: { id: 'branch-hfs-lon', name: 'London Office', code: 'HFS-LON', city: 'London', state: 'England', country: 'GB', companyId: hfs.id } }),
  ]);
  console.log(`Created ${branches.length} branches`);

  // ==================== DEPARTMENTS ====================
  const departments = await Promise.all([
    prisma.department.upsert({ where: { id: 'dept-eng' }, update: {}, create: { id: 'dept-eng', name: 'Engineering', code: 'ENG', companyId: tcg.id } }),
    prisma.department.upsert({ where: { id: 'dept-hr' }, update: {}, create: { id: 'dept-hr', name: 'Human Resources', code: 'HR', companyId: tcg.id } }),
    prisma.department.upsert({ where: { id: 'dept-dsg' }, update: {}, create: { id: 'dept-dsg', name: 'Design', code: 'DSG', companyId: tcg.id } }),
    prisma.department.upsert({ where: { id: 'dept-fin' }, update: {}, create: { id: 'dept-fin', name: 'Finance', code: 'FIN', companyId: tcg.id } }),
    prisma.department.upsert({ where: { id: 'dept-ops' }, update: {}, create: { id: 'dept-ops', name: 'Operations', code: 'OPS', companyId: tcg.id } }),
    prisma.department.upsert({ where: { id: 'dept-sal' }, update: {}, create: { id: 'dept-sal', name: 'Sales', code: 'SAL', companyId: tcg.id } }),
    prisma.department.upsert({ where: { id: 'dept-qat' }, update: {}, create: { id: 'dept-qat', name: 'Quality', code: 'QAT', companyId: mpi.id } }),
    prisma.department.upsert({ where: { id: 'dept-prd' }, update: {}, create: { id: 'dept-prd', name: 'Production', code: 'PRD', companyId: mpi.id } }),
    prisma.department.upsert({ where: { id: 'dept-cli' }, update: {}, create: { id: 'dept-cli', name: 'Clinical', code: 'CLI', companyId: hfs.id } }),
    prisma.department.upsert({ where: { id: 'dept-ana' }, update: {}, create: { id: 'dept-ana', name: 'Analytics', code: 'ANA', companyId: tcg.id } }),
  ]);
  console.log(`Created ${departments.length} departments`);

  const engDept = departments[0];
  const hrDept = departments[1];
  const designDept = departments[2];
  const finDept = departments[3];
  const opsDept = departments[4];
  const salesDept = departments[5];
  const qualDept = departments[6];
  const prodDept = departments[7];
  const clinDept = departments[8];
  const anaDept = departments[9];

  // ==================== USERS (with bcrypt-hashed passwords) ====================
  const adminHash = await hashPassword('admin123');
  const sarahHash = await hashPassword('sarah123');
  const rajHash = await hashPassword('raj123');
  const emilyHash = await hashPassword('emily123');
  const michaelHash = await hashPassword('michael123');
  const priyaHash = await hashPassword('priya123');
  const davidHash = await hashPassword('david123');
  const aikoHash = await hashPassword('aiko123');
  const carlosHash = await hashPassword('carlos123');
  const lisaHash = await hashPassword('lisa123');
  const arjunHash = await hashPassword('arjun123');
  const acmeHash = await hashPassword('acme123');
  const thuntHash = await hashPassword('thunt123');
  const recruitHash = await hashPassword('recruit123');

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@marqai.com' }, update: { password: adminHash }, create: { email: 'admin@marqai.com', password: adminHash, name: 'MARQ Admin', role: 'super_admin', companyId: marq.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'sarah.j@techcorp.com' }, update: { password: sarahHash }, create: { email: 'sarah.j@techcorp.com', password: sarahHash, name: 'Sarah Johnson', role: 'company_hr_admin', companyId: tcg.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'raj.p@techcorp.com' }, update: { password: rajHash }, create: { email: 'raj.p@techcorp.com', password: rajHash, name: 'Raj Patel', role: 'reporting_manager', companyId: tcg.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'emily.c@techcorp.com' }, update: { password: emilyHash }, create: { email: 'emily.c@techcorp.com', password: emilyHash, name: 'Emily Chen', role: 'employee', companyId: tcg.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'michael.b@techcorp.com' }, update: { password: michaelHash }, create: { email: 'michael.b@techcorp.com', password: michaelHash, name: 'Michael Brown', role: 'employee', companyId: tcg.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'priya.s@manufactpro.com' }, update: { password: priyaHash }, create: { email: 'priya.s@manufactpro.com', password: priyaHash, name: 'Priya Sharma', role: 'reporting_manager', companyId: mpi.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'david.w@healthfirst.com' }, update: { password: davidHash }, create: { email: 'david.w@healthfirst.com', password: davidHash, name: 'David Wilson', role: 'employee', companyId: hfs.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'aiko.t@logitrans.com' }, update: { password: aikoHash }, create: { email: 'aiko.t@logitrans.com', password: aikoHash, name: 'Aiko Tanaka', role: 'employee', companyId: companies[6].id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'carlos.r@retailmax.com' }, update: { password: carlosHash }, create: { email: 'carlos.r@retailmax.com', password: carlosHash, name: 'Carlos Rodriguez', role: 'employee', companyId: companies[5].id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'lisa.a@techcorp.com' }, update: { password: lisaHash }, create: { email: 'lisa.a@techcorp.com', password: lisaHash, name: 'Lisa Anderson', role: 'finance', companyId: tcg.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'arjun.k@manufactpro.com' }, update: { password: arjunHash }, create: { email: 'arjun.k@manufactpro.com', password: arjunHash, name: 'Arjun Kumar', role: 'employee', companyId: mpi.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'hr@acme.com' }, update: { password: acmeHash }, create: { email: 'hr@acme.com', password: acmeHash, name: 'Acme Corp', role: 'client', companyId: acme.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'info@talenthunt.com' }, update: { password: thuntHash }, create: { email: 'info@talenthunt.com', password: thuntHash, name: 'TalentHunt Agency', role: 'vendor', companyId: tcg.id, isActive: true } }),
    prisma.user.upsert({ where: { email: 'recruiter@techcorp.com' }, update: { password: recruitHash }, create: { email: 'recruiter@techcorp.com', password: recruitHash, name: 'Recruiter Kim', role: 'recruiter', companyId: tcg.id, isActive: true } }),
  ]);
  console.log(`Created ${users.length} users with bcrypt-hashed passwords`);

  // ==================== EMPLOYEES ====================
  const employees = await Promise.all([
    prisma.employee.upsert({ where: { employeeId: 'EMP001' }, update: {}, create: { employeeId: 'EMP001', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@techcorp.com', designation: 'Senior Software Engineer', jobTitle: 'Senior Developer', employmentType: 'full-time', status: 'active', joiningDate: new Date('2022-03-15'), companyId: tcg.id, branchId: branches[0].id, departmentId: engDept.id, userId: users[1].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP002' }, update: {}, create: { employeeId: 'EMP002', firstName: 'Raj', lastName: 'Patel', email: 'raj.p@techcorp.com', designation: 'HR Manager', employmentType: 'full-time', status: 'active', joiningDate: new Date('2021-07-01'), companyId: tcg.id, branchId: branches[0].id, departmentId: hrDept.id, userId: users[2].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP003' }, update: {}, create: { employeeId: 'EMP003', firstName: 'Emily', lastName: 'Chen', email: 'emily.c@techcorp.com', designation: 'Product Designer', employmentType: 'full-time', status: 'active', joiningDate: new Date('2023-01-10'), companyId: tcg.id, branchId: branches[0].id, departmentId: designDept.id, userId: users[3].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP004' }, update: {}, create: { employeeId: 'EMP004', firstName: 'Michael', lastName: 'Brown', email: 'michael.b@techcorp.com', designation: 'DevOps Lead', employmentType: 'full-time', status: 'probation', joiningDate: new Date('2024-09-01'), probationEnd: new Date('2025-03-01'), companyId: tcg.id, branchId: branches[0].id, departmentId: engDept.id, userId: users[4].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP005' }, update: {}, create: { employeeId: 'EMP005', firstName: 'Priya', lastName: 'Sharma', email: 'priya.s@manufactpro.com', designation: 'Production Manager', employmentType: 'full-time', status: 'active', joiningDate: new Date('2020-11-20'), companyId: mpi.id, branchId: branches[2].id, departmentId: prodDept.id, userId: users[5].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP006' }, update: {}, create: { employeeId: 'EMP006', firstName: 'David', lastName: 'Wilson', email: 'david.w@healthfirst.com', designation: 'Nurse Practitioner', employmentType: 'full-time', status: 'on_leave', joiningDate: new Date('2019-05-15'), companyId: hfs.id, branchId: branches[3].id, departmentId: clinDept.id, userId: users[6].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP007' }, update: {}, create: { employeeId: 'EMP007', firstName: 'Aiko', lastName: 'Tanaka', email: 'aiko.t@logitrans.com', designation: 'Fleet Coordinator', employmentType: 'full-time', status: 'active', joiningDate: new Date('2023-06-01'), companyId: companies[6].id, departmentId: opsDept.id, userId: users[7].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP008' }, update: {}, create: { employeeId: 'EMP008', firstName: 'Carlos', lastName: 'Rodriguez', email: 'carlos.r@retailmax.com', designation: 'Store Manager', employmentType: 'full-time', status: 'notice_period', joiningDate: new Date('2021-02-10'), companyId: companies[5].id, departmentId: salesDept.id, userId: users[8].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP009' }, update: {}, create: { employeeId: 'EMP009', firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@techcorp.com', designation: 'Finance Analyst', employmentType: 'full-time', status: 'active', joiningDate: new Date('2022-08-22'), companyId: tcg.id, branchId: branches[1].id, departmentId: finDept.id, userId: users[9].id } }),
    prisma.employee.upsert({ where: { employeeId: 'EMP010' }, update: {}, create: { employeeId: 'EMP010', firstName: 'Arjun', lastName: 'Kumar', email: 'arjun.k@manufactpro.com', designation: 'Quality Inspector', employmentType: 'full-time', status: 'active', joiningDate: new Date('2023-04-01'), companyId: mpi.id, branchId: branches[2].id, departmentId: qualDept.id, userId: users[10].id } }),
  ]);
  console.log(`Created ${employees.length} employees`);

  // Set reporting manager for some employees
  await Promise.all([
    prisma.employee.update({ where: { id: employees[2].id }, data: { reportingManagerId: employees[0].id } }),
    prisma.employee.update({ where: { id: employees[3].id }, data: { reportingManagerId: employees[0].id } }),
    prisma.employee.update({ where: { id: employees[8].id }, data: { reportingManagerId: employees[0].id } }),
  ]);

  // ==================== JOBS ====================
  const jobs = await Promise.all([
    prisma.job.upsert({ where: { id: 'job-fullstack-1' }, update: {}, create: { id: 'job-fullstack-1', title: 'Senior Full-Stack Developer', description: 'We are looking for a senior full-stack developer to join our engineering team.', requirements: 'React, Node.js, TypeScript, 5+ years experience', department: 'Engineering', location: 'San Francisco, CA', employmentType: 'Full-time', experienceMin: 5, experienceMax: 8, salaryMin: 140000, salaryMax: 180000, status: 'open', priority: 'high', positions: 2, postedDate: new Date('2024-12-01'), companyId: tcg.id } }),
    prisma.job.upsert({ where: { id: 'job-hr-1' }, update: {}, create: { id: 'job-hr-1', title: 'HR Business Partner', description: 'Seeking an experienced HR business partner.', requirements: '7+ years HR experience, PHR certification preferred', department: 'Human Resources', location: 'New York, NY', employmentType: 'Full-time', experienceMin: 7, experienceMax: 10, salaryMin: 95000, salaryMax: 120000, status: 'open', priority: 'medium', positions: 1, postedDate: new Date('2024-11-28'), companyId: tcg.id } }),
    prisma.job.upsert({ where: { id: 'job-ux-1' }, update: {}, create: { id: 'job-ux-1', title: 'UX Research Lead', description: 'Lead UX research initiatives across products.', requirements: '6+ years UX research, mixed methods expertise', department: 'Design', location: 'Remote', employmentType: 'Full-time', experienceMin: 6, experienceMax: 9, salaryMin: 120000, salaryMax: 150000, status: 'open', priority: 'high', positions: 1, postedDate: new Date('2024-11-15'), companyId: tcg.id } }),
    prisma.job.upsert({ where: { id: 'job-prod-1' }, update: {}, create: { id: 'job-prod-1', title: 'Production Supervisor', description: 'Oversee daily production operations.', requirements: '8+ years in manufacturing, Six Sigma preferred', department: 'Operations', location: 'Mumbai, India', employmentType: 'Full-time', experienceMin: 8, experienceMax: 12, salaryMin: 1500000, salaryMax: 2200000, status: 'open', priority: 'urgent', positions: 3, postedDate: new Date('2024-12-05'), companyId: mpi.id } }),
    prisma.job.upsert({ where: { id: 'job-ds-1' }, update: {}, create: { id: 'job-ds-1', title: 'Data Scientist', description: 'Build ML models for business insights.', requirements: 'Python, TensorFlow, 3+ years experience', department: 'Analytics', location: 'Austin, TX', employmentType: 'Full-time', experienceMin: 3, experienceMax: 5, salaryMin: 110000, salaryMax: 145000, status: 'draft', priority: 'medium', positions: 1, companyId: tcg.id } }),
    prisma.job.upsert({ where: { id: 'job-nurse-1' }, update: {}, create: { id: 'job-nurse-1', title: 'Registered Nurse', description: 'Join our clinical team.', requirements: 'RN license, BLS/ACLS certified, 2+ years', department: 'Clinical', location: 'London, UK', employmentType: 'Full-time', experienceMin: 2, experienceMax: 5, salaryMin: 35000, salaryMax: 45000, status: 'open', priority: 'high', positions: 5, postedDate: new Date('2024-12-03'), companyId: hfs.id } }),
    prisma.job.upsert({ where: { id: 'job-cloud-1' }, update: {}, create: { id: 'job-cloud-1', title: 'Cloud Infrastructure Engineer', description: 'Design and maintain cloud infrastructure.', requirements: 'AWS/Azure, Terraform, Kubernetes, 4+ years', department: 'Engineering', location: 'Singapore', employmentType: 'Full-time', experienceMin: 4, experienceMax: 7, salaryMin: 8000, salaryMax: 12000, status: 'on_hold', priority: 'low', positions: 1, postedDate: new Date('2024-11-20'), companyId: companies[6].id } }),
  ]);
  console.log(`Created ${jobs.length} jobs`);

  // ==================== CANDIDATES ====================
  const candidates = await Promise.all([
    prisma.candidate.upsert({ where: { id: 'cand-alex' }, update: {}, create: { id: 'cand-alex', firstName: 'Alex', lastName: 'Turner', email: 'alex.t@email.com', currentCompany: 'Google', currentTitle: 'Software Engineer', experience: 6, expectedSalary: 160000, noticePeriod: '30 days', status: 'interviewing', source: 'LinkedIn', aiScore: 92, skillMatch: 88, cultureFitScore: 85, jobId: jobs[0].id } }),
    prisma.candidate.upsert({ where: { id: 'cand-maya' }, update: {}, create: { id: 'cand-maya', firstName: 'Maya', lastName: 'Singh', email: 'maya.s@email.com', currentCompany: 'Amazon', currentTitle: 'Senior Developer', experience: 8, expectedSalary: 175000, noticePeriod: '60 days', status: 'shortlisted', source: 'Naukri', aiScore: 89, skillMatch: 91, cultureFitScore: 80, jobId: jobs[0].id } }),
    prisma.candidate.upsert({ where: { id: 'cand-james' }, update: {}, create: { id: 'cand-james', firstName: 'James', lastName: 'Williams', email: 'james.w@email.com', currentCompany: 'Microsoft', currentTitle: 'HR Manager', experience: 9, expectedSalary: 110000, noticePeriod: '30 days', status: 'offered', source: 'Referral', aiScore: 95, skillMatch: 94, cultureFitScore: 90, jobId: jobs[1].id } }),
    prisma.candidate.upsert({ where: { id: 'cand-sophie' }, update: {}, create: { id: 'cand-sophie', firstName: 'Sophie', lastName: 'Martin', email: 'sophie.m@email.com', currentCompany: 'Meta', currentTitle: 'UX Researcher', experience: 7, expectedSalary: 140000, noticePeriod: '45 days', status: 'screening', source: 'Portal', aiScore: 78, skillMatch: 82, cultureFitScore: 88, jobId: jobs[2].id } }),
    prisma.candidate.upsert({ where: { id: 'cand-wei' }, update: {}, create: { id: 'cand-wei', firstName: 'Wei', lastName: 'Zhang', email: 'wei.z@email.com', currentCompany: 'ByteDance', currentTitle: 'Data Engineer', experience: 4, expectedSalary: 135000, noticePeriod: '30 days', status: 'applied', source: 'Indeed', aiScore: 72, skillMatch: 68, cultureFitScore: 75, jobId: jobs[4].id } }),
  ]);
  console.log(`Created ${candidates.length} candidates`);

  // ==================== ATTENDANCE ====================
  const today = new Date('2025-01-20');
  await Promise.all([
    prisma.attendance.create({ data: { date: today, checkIn: new Date('2025-01-20T09:02:00'), checkOut: new Date('2025-01-20T18:15:00'), workHours: 8.5, status: 'present', source: 'biometric', employeeId: employees[0].id } }),
    prisma.attendance.create({ data: { date: today, checkIn: new Date('2025-01-20T09:35:00'), checkOut: new Date('2025-01-20T18:30:00'), workHours: 8.0, status: 'late', source: 'mobile', employeeId: employees[1].id } }),
    prisma.attendance.create({ data: { date: today, checkIn: new Date('2025-01-20T08:50:00'), checkOut: new Date('2025-01-20T17:45:00'), workHours: 8.0, status: 'present', source: 'gps', employeeId: employees[2].id } }),
    prisma.attendance.create({ data: { date: today, status: 'absent', source: 'web', employeeId: employees[5].id } }),
    prisma.attendance.create({ data: { date: today, checkIn: new Date('2025-01-20T09:00:00'), checkOut: new Date('2025-01-20T14:00:00'), workHours: 4.0, status: 'half_day', source: 'web', employeeId: employees[4].id } }),
    prisma.attendance.create({ data: { date: today, checkIn: new Date('2025-01-20T08:45:00'), checkOut: new Date('2025-01-20T18:00:00'), workHours: 8.5, status: 'present', source: 'rfid', employeeId: employees[6].id } }),
  ]);
  console.log('Created attendance records');

  // ==================== LEAVE POLICIES ====================
  await Promise.all([
    prisma.leavePolicy.upsert({ where: { id: 'lp-casual' }, update: {}, create: { id: 'lp-casual', name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarryDays: 3, isPaid: true, companyId: tcg.id } }),
    prisma.leavePolicy.upsert({ where: { id: 'lp-sick' }, update: {}, create: { id: 'lp-sick', name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, isPaid: true, companyId: tcg.id } }),
    prisma.leavePolicy.upsert({ where: { id: 'lp-paid' }, update: {}, create: { id: 'lp-paid', name: 'Paid Leave', type: 'paid', totalDays: 15, carryForward: true, maxCarryDays: 5, isPaid: true, companyId: tcg.id } }),
    prisma.leavePolicy.upsert({ where: { id: 'lp-maternity' }, update: {}, create: { id: 'lp-maternity', name: 'Maternity Leave', type: 'maternity', totalDays: 182, carryForward: false, isPaid: true, companyId: tcg.id } }),
    prisma.leavePolicy.upsert({ where: { id: 'lp-compoff' }, update: {}, create: { id: 'lp-compoff', name: 'Comp Off', type: 'comp_off', totalDays: 5, carryForward: false, isPaid: true, companyId: tcg.id } }),
  ]);
  console.log('Created leave policies');

  // ==================== LEAVES ====================
  await Promise.all([
    prisma.leave.create({ data: { type: 'casual', startDate: new Date('2025-01-22'), endDate: new Date('2025-01-23'), totalDays: 2, reason: 'Personal work', status: 'approved', approverId: employees[1].id, employeeId: employees[0].id } }),
    prisma.leave.create({ data: { type: 'sick', startDate: new Date('2025-01-20'), endDate: new Date('2025-01-21'), totalDays: 2, reason: 'Not feeling well', status: 'pending', employeeId: employees[1].id } }),
    prisma.leave.create({ data: { type: 'paid', startDate: new Date('2025-02-10'), endDate: new Date('2025-02-14'), totalDays: 5, reason: 'Family vacation', status: 'pending', employeeId: employees[2].id } }),
    prisma.leave.create({ data: { type: 'maternity', startDate: new Date('2025-01-15'), endDate: new Date('2025-07-15'), totalDays: 182, reason: 'Maternity', status: 'approved', approverId: employees[1].id, employeeId: employees[8].id } }),
    prisma.leave.create({ data: { type: 'comp_off', startDate: new Date('2025-01-25'), endDate: new Date('2025-01-25'), totalDays: 1, reason: 'Weekend work compensation', status: 'approved', approverId: employees[4].id, employeeId: employees[9].id } }),
  ]);
  console.log('Created leaves');

  // ==================== PAYROLL ====================
  await prisma.payrollStructure.upsert({ where: { id: 'ps-standard' }, update: {}, create: { id: 'ps-standard', name: 'Standard Salaried', basicPay: 8000, hra: 3200, da: 800, transportAllowance: 1500, medicalAllowance: 500, specialAllowance: 2000, pfEmployee: 960, pfEmployer: 960, esiEmployee: 200, esiEmployer: 550, taxDeduction: 1200, companyId: tcg.id } });

  await Promise.all([
    prisma.payrollRecord.create({ data: { month: 1, year: 2025, basicPay: 8000, grossSalary: 12000, totalDeductions: 3200, netSalary: 8800, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: employees[0].id } }),
    prisma.payrollRecord.create({ data: { month: 1, year: 2025, basicPay: 7500, grossSalary: 11000, totalDeductions: 2900, netSalary: 8100, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: employees[1].id } }),
    prisma.payrollRecord.create({ data: { month: 1, year: 2025, basicPay: 6500, grossSalary: 9500, totalDeductions: 2500, netSalary: 7000, status: 'processed', employeeId: employees[2].id } }),
    prisma.payrollRecord.create({ data: { month: 1, year: 2025, basicPay: 9000, grossSalary: 13500, totalDeductions: 3600, netSalary: 9900, status: 'draft', employeeId: employees[3].id } }),
  ]);
  console.log('Created payroll records');

  // ==================== GOALS ====================
  await Promise.all([
    prisma.goal.create({ data: { title: 'Complete React 19 Migration', description: 'Migrate all frontend apps to React 19', type: 'individual', category: 'okr', progress: 65, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31'), employeeId: employees[0].id } }),
    prisma.goal.create({ data: { title: 'Reduce Hiring Time-to-Fill', description: 'Reduce average time-to-fill from 45 to 30 days', type: 'department', category: 'kpi', progress: 40, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'), employeeId: employees[1].id } }),
    prisma.goal.create({ data: { title: 'Improve Design System Coverage', description: 'Achieve 90% component coverage in design system', type: 'individual', category: 'smart', progress: 80, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-02-28'), employeeId: employees[2].id } }),
    prisma.goal.create({ data: { title: 'Achieve 99.9% Uptime', description: 'Maintain 99.9% uptime for all production services', type: 'team', category: 'kpi', progress: 95, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), employeeId: employees[3].id } }),
  ]);
  console.log('Created goals');

  // ==================== ASSETS ====================
  await Promise.all([
    prisma.assetAllocation.create({ data: { assetType: 'laptop', assetName: 'MacBook Pro 16"', assetCode: 'LTP-0042', serialNumber: 'MBP16-2024-0042', status: 'allocated', employeeId: employees[0].id } }),
    prisma.assetAllocation.create({ data: { assetType: 'phone', assetName: 'iPhone 15 Pro', assetCode: 'PHN-0088', status: 'allocated', employeeId: employees[1].id } }),
    prisma.assetAllocation.create({ data: { assetType: 'access_card', assetName: 'Access Card - Floor 5', assetCode: 'AC-1025', status: 'allocated', employeeId: employees[2].id } }),
    prisma.assetAllocation.create({ data: { assetType: 'laptop', assetName: 'Dell XPS 15', assetCode: 'LTP-0045', status: 'allocated', notes: 'On loan from IT pool', employeeId: employees[3].id } }),
  ]);
  console.log('Created assets');

  // ==================== TRAVEL & EXPENSE ====================
  await Promise.all([
    prisma.travelRequest.create({ data: { purpose: 'Client Meeting - Acme Corp', destination: 'New York, NY', departureDate: new Date('2025-02-15'), returnDate: new Date('2025-02-17'), estimatedCost: 2500, status: 'pending', employeeId: employees[0].id } }),
    prisma.travelRequest.create({ data: { purpose: 'Tech Conference 2025', destination: 'Las Vegas, NV', departureDate: new Date('2025-03-10'), returnDate: new Date('2025-03-13'), estimatedCost: 4000, approvedCost: 3800, status: 'approved', employeeId: employees[2].id } }),
  ]);

  await Promise.all([
    prisma.expenseClaim.create({ data: { type: 'travel', amount: 450, description: 'Taxi to airport', status: 'pending', employeeId: employees[0].id } }),
    prisma.expenseClaim.create({ data: { type: 'food', amount: 120, description: 'Team lunch meeting', status: 'approved', employeeId: employees[1].id } }),
    prisma.expenseClaim.create({ data: { type: 'communication', amount: 85, description: 'International calls for project', status: 'reimbursed', employeeId: employees[2].id } }),
  ]);
  console.log('Created travel requests and expense claims');

  // ==================== LEARNING ====================
  await Promise.all([
    prisma.learningRecord.create({ data: { courseName: 'Advanced React Patterns', provider: 'Frontend Masters', type: 'e_learning', status: 'in_progress', employeeId: employees[0].id } }),
    prisma.learningRecord.create({ data: { courseName: 'HR Analytics Fundamentals', provider: 'Coursera', type: 'certification', status: 'completed', completedAt: new Date('2024-12-15'), score: 92, certificate: 'cert-hr-analytics-2024', employeeId: employees[1].id } }),
    prisma.learningRecord.create({ data: { courseName: 'Design Systems Workshop', provider: 'Internal', type: 'workshop', status: 'enrolled', employeeId: employees[2].id } }),
  ]);
  console.log('Created learning records');

  // ==================== TICKETS ====================
  await Promise.all([
    prisma.ticket.create({ data: { subject: 'VPN Connection Issue', description: 'Cannot connect to VPN since morning', category: 'it', priority: 'high', status: 'in_progress', employeeId: employees[0].id } }),
    prisma.ticket.create({ data: { subject: 'Payroll Discrepancy', description: 'December salary has incorrect deduction', category: 'payroll', priority: 'urgent', status: 'open', employeeId: employees[1].id } }),
    prisma.ticket.create({ data: { subject: 'Access Request - Production DB', description: 'Need read access to production database for debugging', category: 'it', priority: 'medium', status: 'resolved', resolution: 'Access granted by IT admin', employeeId: employees[3].id } }),
  ]);
  console.log('Created tickets');

  // ==================== CLIENTS & VENDORS ====================
  await Promise.all([
    prisma.client.create({ data: { name: 'Acme Corp', email: 'hr@acme.com', clientCompany: 'Acme Corporation', industry: 'Technology', contractStart: new Date('2024-01-01'), contractEnd: new Date('2025-12-31'), status: 'active', companyId: tcg.id } }),
    prisma.client.create({ data: { name: 'GlobalTech Inc', email: 'talent@globaltech.com', clientCompany: 'GlobalTech Inc', industry: 'Software', contractStart: new Date('2024-06-01'), contractEnd: new Date('2025-05-31'), status: 'active', companyId: tcg.id } }),
    prisma.client.create({ data: { name: 'BuildRight Construction', email: 'hr@buildright.com', clientCompany: 'BuildRight', industry: 'Construction', contractStart: new Date('2023-09-01'), contractEnd: new Date('2024-08-31'), status: 'active', companyId: tcg.id } }),
  ]);

  const vendors = await Promise.all([
    prisma.vendor.create({ data: { name: 'TalentHunt Agency', email: 'info@talenthunt.com', vendorCompany: 'TalentHunt', serviceType: 'recruitment', status: 'active', rating: 4.5, companyId: tcg.id } }),
    prisma.vendor.create({ data: { name: 'StaffPro Solutions', email: 'contact@staffpro.com', vendorCompany: 'StaffPro', serviceType: 'staffing', status: 'active', rating: 4.2, companyId: tcg.id } }),
    prisma.vendor.create({ data: { name: 'VerifyRight BGV', email: 'team@verifyright.com', vendorCompany: 'VerifyRight', serviceType: 'bgv', status: 'active', rating: 4.8, companyId: tcg.id } }),
  ]);

  await Promise.all([
    prisma.subVendor.create({ data: { name: 'QuickHire Regional', email: 'hire@quickhire.com', company: 'QuickHire', status: 'active', vendorId: vendors[0].id } }),
    prisma.subVendor.create({ data: { name: 'TalentBridge East', email: 'east@talentbridge.com', company: 'TalentBridge', status: 'active', vendorId: vendors[1].id } }),
  ]);
  console.log('Created clients, vendors, sub-vendors');

  // ==================== WORKFLOW DEFINITIONS ====================
  await prisma.workflowDefinition.upsert({ where: { id: 'wf-leave' }, update: {}, create: { id: 'wf-leave', name: 'Leave Approval Workflow', type: 'approval', entity: 'leave', description: 'Standard leave approval: Manager → HR', isActive: true, companyId: tcg.id } });
  await prisma.workflowDefinition.upsert({ where: { id: 'wf-expense' }, update: {}, create: { id: 'wf-expense', name: 'Expense Approval Workflow', type: 'approval', entity: 'expense', description: 'Expense approval: Manager → Finance', isActive: true, companyId: tcg.id } });
  await prisma.workflowDefinition.upsert({ where: { id: 'wf-travel' }, update: {}, create: { id: 'wf-travel', name: 'Travel Request Workflow', type: 'approval', entity: 'travel', description: 'Travel approval: Manager → HR → Finance', isActive: true, companyId: tcg.id } });
  console.log('Created workflow definitions');

  // ==================== SURVEYS ====================
  const survey = await prisma.survey.upsert({ where: { id: 'survey-q1-2025' }, update: {}, create: { id: 'survey-q1-2025', title: 'Q1 2025 Employee Engagement Pulse', description: 'Quarterly pulse survey to measure employee engagement and satisfaction.', type: 'pulse', status: 'active', startDate: new Date('2025-01-15'), endDate: new Date('2025-01-31'), companyId: tcg.id } });

  const surveyQuestions = await Promise.all([
    prisma.surveyQuestion.upsert({ where: { id: 'sq-1' }, update: {}, create: { id: 'sq-1', question: 'How satisfied are you with your current role?', type: 'rating', order: 0, surveyId: survey.id } }),
    prisma.surveyQuestion.upsert({ where: { id: 'sq-2' }, update: {}, create: { id: 'sq-2', question: 'Do you feel your work is recognized?', type: 'rating', order: 1, surveyId: survey.id } }),
    prisma.surveyQuestion.upsert({ where: { id: 'sq-3' }, update: {}, create: { id: 'sq-3', question: 'How would you rate team collaboration?', type: 'rating', order: 2, surveyId: survey.id } }),
    prisma.surveyQuestion.upsert({ where: { id: 'sq-4' }, update: {}, create: { id: 'sq-4', question: 'What could we improve?', type: 'text', required: false, order: 3, surveyId: survey.id } }),
    prisma.surveyQuestion.upsert({ where: { id: 'sq-5' }, update: {}, create: { id: 'sq-5', question: 'Would you recommend this company as a workplace?', type: 'rating', order: 4, surveyId: survey.id } }),
  ]);

  await Promise.all([
    prisma.surveyResponse.create({ data: { answer: '4', questionId: surveyQuestions[0].id, employeeId: employees[0].id } }),
    prisma.surveyResponse.create({ data: { answer: '3', questionId: surveyQuestions[1].id, employeeId: employees[0].id } }),
    prisma.surveyResponse.create({ data: { answer: '5', questionId: surveyQuestions[2].id, employeeId: employees[0].id } }),
    prisma.surveyResponse.create({ data: { answer: '4', questionId: surveyQuestions[0].id, employeeId: employees[1].id } }),
    prisma.surveyResponse.create({ data: { answer: '4', questionId: surveyQuestions[1].id, employeeId: employees[1].id } }),
  ]);
  console.log('Created survey with questions and responses');

  // ==================== ONBOARDING TASKS ====================
  await Promise.all([
    prisma.onboardingTask.create({ data: { title: 'Complete IT Setup', description: 'Laptop, email, VPN access setup', category: 'it', status: 'completed', completedAt: new Date('2024-09-02'), employeeId: employees[3].id } }),
    prisma.onboardingTask.create({ data: { title: 'HR Orientation', description: 'Company policies, benefits overview', category: 'hr', status: 'completed', completedAt: new Date('2024-09-03'), employeeId: employees[3].id } }),
    prisma.onboardingTask.create({ data: { title: 'Team Introduction', description: 'Meet the engineering team', category: 'team', status: 'completed', completedAt: new Date('2024-09-04'), employeeId: employees[3].id } }),
    prisma.onboardingTask.create({ data: { title: 'Codebase Walkthrough', description: 'Overview of the main repositories', category: 'training', status: 'in_progress', employeeId: employees[3].id } }),
    prisma.onboardingTask.create({ data: { title: 'First Project Assignment', description: 'Assign first development task', category: 'training', status: 'pending', employeeId: employees[3].id } }),
  ]);
  console.log('Created onboarding tasks');

  // ==================== INTERVIEWS ====================
  await Promise.all([
    prisma.interview.create({ data: { type: 'technical', scheduledAt: new Date('2025-01-22T10:00:00'), duration: 60, status: 'scheduled', meetingLink: 'https://meet.example.com/interview-1', candidateId: candidates[0].id, jobId: jobs[0].id } }),
    prisma.interview.create({ data: { type: 'hr', scheduledAt: new Date('2025-01-23T14:00:00'), duration: 45, status: 'scheduled', candidateId: candidates[0].id, jobId: jobs[0].id } }),
    prisma.interview.create({ data: { type: 'manager', scheduledAt: new Date('2025-01-20T11:00:00'), duration: 60, status: 'completed', feedback: 'Strong technical skills, good culture fit. Recommended for next round.', rating: 4, candidateId: candidates[2].id, jobId: jobs[1].id } }),
  ]);
  console.log('Created interviews');

  // ==================== SHIFTS ====================
  const shifts = await Promise.all([
    prisma.shift.upsert({ where: { id: 'shift-morning' }, update: {}, create: { id: 'shift-morning', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakMinutes: 30, companyId: tcg.id } }),
    prisma.shift.upsert({ where: { id: 'shift-general' }, update: {}, create: { id: 'shift-general', name: 'General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60, isActive: true, companyId: tcg.id } }),
    prisma.shift.upsert({ where: { id: 'shift-evening' }, update: {}, create: { id: 'shift-evening', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakMinutes: 30, companyId: tcg.id } }),
    prisma.shift.upsert({ where: { id: 'shift-night' }, update: {}, create: { id: 'shift-night', name: 'Night Shift', startTime: '22:00', endTime: '06:00', breakMinutes: 30, companyId: tcg.id } }),
  ]);
  await Promise.all([
    prisma.shiftMember.create({ data: { effectiveDate: new Date('2025-01-01'), shiftId: shifts[1].id, employeeId: employees[0].id } }),
    prisma.shiftMember.create({ data: { effectiveDate: new Date('2025-01-01'), shiftId: shifts[1].id, employeeId: employees[1].id } }),
    prisma.shiftMember.create({ data: { effectiveDate: new Date('2025-01-01'), shiftId: shifts[1].id, employeeId: employees[2].id } }),
  ]);
  console.log('Created shifts');

  // ==================== COMPLIANCE ITEMS ====================
  await Promise.all([
    prisma.complianceItem.create({ data: { title: 'Annual Fire Safety Training', description: 'Mandatory fire safety training for all employees', category: 'safety', dueDate: new Date('2025-03-31'), status: 'pending', companyId: tcg.id } }),
    prisma.complianceItem.create({ data: { title: 'POPI Act Compliance Review', description: 'Review data protection compliance', category: 'regulatory', dueDate: new Date('2025-06-30'), status: 'pending', companyId: tcg.id } }),
    prisma.complianceItem.create({ data: { title: 'Quarterly Tax Filing', description: 'Q4 2024 tax filing', category: 'tax', dueDate: new Date('2025-01-31'), status: 'completed', companyId: tcg.id } }),
  ]);
  console.log('Created compliance items');

  // ==================== NOTIFICATIONS ====================
  await Promise.all([
    prisma.notification.create({ data: { title: 'Leave Request', message: 'Raj Patel has submitted a sick leave request', type: 'info', category: 'leave', userId: users[1].id } }),
    prisma.notification.create({ data: { title: 'New Candidate', message: 'Alex Turner applied for Senior Full-Stack Developer', type: 'success', category: 'recruitment', userId: users[1].id } }),
    prisma.notification.create({ data: { title: 'Payroll Processed', message: 'January 2025 payroll has been processed', type: 'success', category: 'payroll', userId: users[1].id } }),
    prisma.notification.create({ data: { title: 'Attendance Alert', message: 'David Wilson is absent today without prior notice', type: 'warning', category: 'attendance', userId: users[1].id } }),
    prisma.notification.create({ data: { title: 'Expense Approval', message: 'You have 2 pending expense approvals', type: 'info', category: 'expense', userId: users[1].id } }),
    prisma.notification.create({ data: { title: 'Probation Ending', message: 'Michael Brown probation ends on March 1, 2025', type: 'warning', category: 'employee', userId: users[1].id } }),
    prisma.notification.create({ data: { title: 'New Ticket', message: 'VPN Connection Issue reported by Sarah Johnson', type: 'info', category: 'helpdesk', userId: users[1].id } }),
    prisma.notification.create({ data: { title: 'Interview Scheduled', message: 'Technical interview with Alex Turner on Jan 22', type: 'info', category: 'recruitment', userId: users[13].id } }),
  ]);
  console.log('Created notifications');

  // ==================== AUDIT LOGS ====================
  await Promise.all([
    prisma.auditLog.create({ data: { action: 'LOGIN', entity: 'User', entityId: users[1].id, details: 'Sarah Johnson logged in', userId: users[1].id, ipAddress: '192.168.1.100' } }),
    prisma.auditLog.create({ data: { action: 'CREATE', entity: 'Employee', entityId: employees[3].id, details: 'New employee Michael Brown added', userId: users[1].id } }),
  ]);
  console.log('Created audit logs');

  console.log('\n✅ Database seeding completed successfully with bcrypt-hashed passwords!');
  console.log('\n🔑 Demo Login Credentials:');
  console.log('  Super Admin:  admin@marqai.com / admin123');
  console.log('  HR Admin:     sarah.j@techcorp.com / sarah123');
  console.log('  Manager:      raj.p@techcorp.com / raj123');
  console.log('  Employee:     emily.c@techcorp.com / emily123');
  console.log('  Client:       hr@acme.com / acme123');
  console.log('  Vendor:       info@talenthunt.com / thunt123');
  console.log('  Recruiter:    recruiter@techcorp.com / recruit123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
