import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Counters for summary
const counts = {
  branches: 0,
  departments: 0,
  users: 0,
  employees: 0,
  leavePolicies: 0,
  leaves: 0,
  payrollStructures: 0,
  payrollRecords: 0,
  goals: 0,
  assets: 0,
  attendance: 0,
  learning: 0,
  tickets: 0,
  shifts: 0,
  compliance: 0,
  notifications: 0,
  workflows: 0,
  workflowSteps: 0,
};

async function main() {
  await prisma.$connect();
  console.log('🌱 Seeding MARQ AI company data...\n');

  // ==================== FIND MARQ COMPANY ====================
  const marq = await prisma.company.findUnique({ where: { code: 'MARQ' } });
  if (!marq) {
    console.error('❌ MARQ company not found. Run the main seed.ts first.');
    process.exit(1);
  }
  console.log(`✅ Found MARQ company: ${marq.name} (${marq.id})\n`);

  // ==================== MARQ BRANCHES ====================
  console.log('📍 Creating MARQ branches...');
  const branchHyd = await prisma.branch.upsert({
    where: { id: 'branch-marq-hyd' },
    update: {},
    create: {
      id: 'branch-marq-hyd',
      name: 'MARQ HQ Hyderabad',
      code: 'MARQ-HYD',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'IN',
      companyId: marq.id,
    },
  });
  const branchBlr = await prisma.branch.upsert({
    where: { id: 'branch-marq-blr' },
    update: {},
    create: {
      id: 'branch-marq-blr',
      name: 'MARQ Bangalore Office',
      code: 'MARQ-BLR',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'IN',
      companyId: marq.id,
    },
  });
  const branchMum = await prisma.branch.upsert({
    where: { id: 'branch-marq-mum' },
    update: {},
    create: {
      id: 'branch-marq-mum',
      name: 'MARQ Mumbai Office',
      code: 'MARQ-MUM',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'IN',
      companyId: marq.id,
    },
  });
  counts.branches = 3;
  console.log(`  Created ${counts.branches} branches\n`);

  // ==================== MARQ DEPARTMENTS ====================
  console.log('🏢 Creating MARQ departments...');
  const deptAI = await prisma.department.upsert({
    where: { id: 'dept-marq-ai' },
    update: {},
    create: { id: 'dept-marq-ai', name: 'AI Research', code: 'AI', companyId: marq.id },
  });
  const deptEng = await prisma.department.upsert({
    where: { id: 'dept-marq-eng' },
    update: {},
    create: { id: 'dept-marq-eng', name: 'Engineering', code: 'ENG', companyId: marq.id },
  });
  const deptProduct = await prisma.department.upsert({
    where: { id: 'dept-marq-product' },
    update: {},
    create: { id: 'dept-marq-product', name: 'Product Development', code: 'PROD', companyId: marq.id },
  });
  const deptHR = await prisma.department.upsert({
    where: { id: 'dept-marq-hr' },
    update: {},
    create: { id: 'dept-marq-hr', name: 'Human Resources', code: 'HR', companyId: marq.id },
  });
  const deptFin = await prisma.department.upsert({
    where: { id: 'dept-marq-fin' },
    update: {},
    create: { id: 'dept-marq-fin', name: 'Finance & Accounts', code: 'FIN', companyId: marq.id },
  });
  const deptSales = await prisma.department.upsert({
    where: { id: 'dept-marq-sales' },
    update: {},
    create: { id: 'dept-marq-sales', name: 'Sales & Marketing', code: 'SALES', companyId: marq.id },
  });
  const deptOps = await prisma.department.upsert({
    where: { id: 'dept-marq-ops' },
    update: {},
    create: { id: 'dept-marq-ops', name: 'Operations', code: 'OPS', companyId: marq.id },
  });
  const deptDS = await prisma.department.upsert({
    where: { id: 'dept-marq-ds' },
    update: {},
    create: { id: 'dept-marq-ds', name: 'Data Science', code: 'DS', companyId: marq.id },
  });
  counts.departments = 8;
  console.log(`  Created ${counts.departments} departments\n`);

  // ==================== MARQ USERS ====================
  console.log('👤 Creating MARQ users...');
  const ananyaHash = await hashPassword('ananya123');
  const vikramHash = await hashPassword('vikram123');
  const meeraHash = await hashPassword('meera123');
  const rahulHash = await hashPassword('rahul123');
  const sanjayHash = await hashPassword('sanjay123');
  const deepaHash = await hashPassword('deepa123');
  const amitHash = await hashPassword('amit123');
  const nehaHash = await hashPassword('neha123');
  const sureshHash = await hashPassword('suresh123');
  const kavitaHash = await hashPassword('kavita123');
  const raviHash = await hashPassword('ravi123');
  const poojaHash = await hashPassword('pooja123');
  const arunHash = await hashPassword('arun123');
  const swatiHash = await hashPassword('swati123');
  const manishHash = await hashPassword('manish123');

  const userAnanya = await prisma.user.upsert({
    where: { email: 'ananya.r@marqai.com' },
    update: { password: ananyaHash },
    create: { email: 'ananya.r@marqai.com', password: ananyaHash, name: 'Ananya Reddy', role: 'company_hr_admin', companyId: marq.id, isActive: true },
  });
  const userVikram = await prisma.user.upsert({
    where: { email: 'vikram.s@marqai.com' },
    update: { password: vikramHash },
    create: { email: 'vikram.s@marqai.com', password: vikramHash, name: 'Vikram Singh', role: 'reporting_manager', companyId: marq.id, isActive: true },
  });
  const userMeera = await prisma.user.upsert({
    where: { email: 'meera.k@marqai.com' },
    update: { password: meeraHash },
    create: { email: 'meera.k@marqai.com', password: meeraHash, name: 'Meera Krishnan', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userRahul = await prisma.user.upsert({
    where: { email: 'rahul.g@marqai.com' },
    update: { password: rahulHash },
    create: { email: 'rahul.g@marqai.com', password: rahulHash, name: 'Rahul Gupta', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userSanjay = await prisma.user.upsert({
    where: { email: 'sanjay.m@marqai.com' },
    update: { password: sanjayHash },
    create: { email: 'sanjay.m@marqai.com', password: sanjayHash, name: 'Sanjay Mehta', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userDeepa = await prisma.user.upsert({
    where: { email: 'deepa.n@marqai.com' },
    update: { password: deepaHash },
    create: { email: 'deepa.n@marqai.com', password: deepaHash, name: 'Deepa Nair', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userAmit = await prisma.user.upsert({
    where: { email: 'amit.t@marqai.com' },
    update: { password: amitHash },
    create: { email: 'amit.t@marqai.com', password: amitHash, name: 'Amit Tiwari', role: 'finance', companyId: marq.id, isActive: true },
  });
  const userNeha = await prisma.user.upsert({
    where: { email: 'neha.j@marqai.com' },
    update: { password: nehaHash },
    create: { email: 'neha.j@marqai.com', password: nehaHash, name: 'Neha Joshi', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userSuresh = await prisma.user.upsert({
    where: { email: 'suresh.b@marqai.com' },
    update: { password: sureshHash },
    create: { email: 'suresh.b@marqai.com', password: sureshHash, name: 'Suresh Babu', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userKavita = await prisma.user.upsert({
    where: { email: 'kavita.p@marqai.com' },
    update: { password: kavitaHash },
    create: { email: 'kavita.p@marqai.com', password: kavitaHash, name: 'Kavita Patil', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userRavi = await prisma.user.upsert({
    where: { email: 'ravi.k@marqai.com' },
    update: { password: raviHash },
    create: { email: 'ravi.k@marqai.com', password: raviHash, name: 'Ravi Kumar', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userPooja = await prisma.user.upsert({
    where: { email: 'pooja.s@marqai.com' },
    update: { password: poojaHash },
    create: { email: 'pooja.s@marqai.com', password: poojaHash, name: 'Pooja Sharma', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userArun = await prisma.user.upsert({
    where: { email: 'arun.d@marqai.com' },
    update: { password: arunHash },
    create: { email: 'arun.d@marqai.com', password: arunHash, name: 'Arun Das', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userSwati = await prisma.user.upsert({
    where: { email: 'swati.v@marqai.com' },
    update: { password: swatiHash },
    create: { email: 'swati.v@marqai.com', password: swatiHash, name: 'Swati Verma', role: 'employee', companyId: marq.id, isActive: true },
  });
  const userManish = await prisma.user.upsert({
    where: { email: 'manish.a@marqai.com' },
    update: { password: manishHash },
    create: { email: 'manish.a@marqai.com', password: manishHash, name: 'Manish Agarwal', role: 'employee', companyId: marq.id, isActive: true },
  });
  counts.users = 15;
  console.log(`  Created ${counts.users} users\n`);

  // ==================== MARQ EMPLOYEES ====================
  console.log('👔 Creating MARQ employees...');
  const emp101 = await prisma.employee.upsert({
    where: { employeeId: 'EMP101' },
    update: {},
    create: {
      employeeId: 'EMP101', firstName: 'Ananya', lastName: 'Reddy', email: 'ananya.r@marqai.com',
      designation: 'VP of Human Resources', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2021-01-15'), companyId: marq.id,
      departmentId: deptHR.id, branchId: branchHyd.id, userId: userAnanya.id,
    },
  });
  const emp102 = await prisma.employee.upsert({
    where: { employeeId: 'EMP102' },
    update: {},
    create: {
      employeeId: 'EMP102', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.s@marqai.com',
      designation: 'Head of Engineering', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2020-06-01'), companyId: marq.id,
      departmentId: deptEng.id, branchId: branchHyd.id, userId: userVikram.id,
    },
  });
  const emp103 = await prisma.employee.upsert({
    where: { employeeId: 'EMP103' },
    update: {},
    create: {
      employeeId: 'EMP103', firstName: 'Meera', lastName: 'Krishnan', email: 'meera.k@marqai.com',
      designation: 'Senior AI Researcher', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2022-03-20'), companyId: marq.id,
      departmentId: deptAI.id, branchId: branchHyd.id, userId: userMeera.id,
    },
  });
  const emp104 = await prisma.employee.upsert({
    where: { employeeId: 'EMP104' },
    update: {},
    create: {
      employeeId: 'EMP104', firstName: 'Rahul', lastName: 'Gupta', email: 'rahul.g@marqai.com',
      designation: 'Full Stack Developer', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2023-07-01'), companyId: marq.id,
      departmentId: deptEng.id, branchId: branchBlr.id, userId: userRahul.id,
    },
  });
  const emp105 = await prisma.employee.upsert({
    where: { employeeId: 'EMP105' },
    update: {},
    create: {
      employeeId: 'EMP105', firstName: 'Sanjay', lastName: 'Mehta', email: 'sanjay.m@marqai.com',
      designation: 'Product Manager', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2022-09-15'), companyId: marq.id,
      departmentId: deptProduct.id, branchId: branchHyd.id, userId: userSanjay.id,
    },
  });
  const emp106 = await prisma.employee.upsert({
    where: { employeeId: 'EMP106' },
    update: {},
    create: {
      employeeId: 'EMP106', firstName: 'Deepa', lastName: 'Nair', email: 'deepa.n@marqai.com',
      designation: 'UX Designer', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2023-02-01'), companyId: marq.id,
      departmentId: deptProduct.id, branchId: branchBlr.id, userId: userDeepa.id,
    },
  });
  const emp107 = await prisma.employee.upsert({
    where: { employeeId: 'EMP107' },
    update: {},
    create: {
      employeeId: 'EMP107', firstName: 'Amit', lastName: 'Tiwari', email: 'amit.t@marqai.com',
      designation: 'Finance Controller', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2021-04-10'), companyId: marq.id,
      departmentId: deptFin.id, branchId: branchHyd.id, userId: userAmit.id,
    },
  });
  const emp108 = await prisma.employee.upsert({
    where: { employeeId: 'EMP108' },
    update: {},
    create: {
      employeeId: 'EMP108', firstName: 'Neha', lastName: 'Joshi', email: 'neha.j@marqai.com',
      designation: 'Data Scientist', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2023-05-15'), companyId: marq.id,
      departmentId: deptDS.id, branchId: branchHyd.id, userId: userNeha.id,
    },
  });
  const emp109 = await prisma.employee.upsert({
    where: { employeeId: 'EMP109' },
    update: {},
    create: {
      employeeId: 'EMP109', firstName: 'Suresh', lastName: 'Babu', email: 'suresh.b@marqai.com',
      designation: 'DevOps Engineer', employmentType: 'full-time', status: 'probation',
      joiningDate: new Date('2024-11-01'), probationEnd: new Date('2025-05-01'),
      companyId: marq.id, departmentId: deptEng.id, branchId: branchBlr.id, userId: userSuresh.id,
    },
  });
  const emp110 = await prisma.employee.upsert({
    where: { employeeId: 'EMP110' },
    update: {},
    create: {
      employeeId: 'EMP110', firstName: 'Kavita', lastName: 'Patil', email: 'kavita.p@marqai.com',
      designation: 'Sales Director', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2021-08-20'), companyId: marq.id,
      departmentId: deptSales.id, branchId: branchMum.id, userId: userKavita.id,
    },
  });
  const emp111 = await prisma.employee.upsert({
    where: { employeeId: 'EMP111' },
    update: {},
    create: {
      employeeId: 'EMP111', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi.k@marqai.com',
      designation: 'ML Engineer', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2023-01-10'), companyId: marq.id,
      departmentId: deptAI.id, branchId: branchHyd.id, userId: userRavi.id,
    },
  });
  const emp112 = await prisma.employee.upsert({
    where: { employeeId: 'EMP112' },
    update: {},
    create: {
      employeeId: 'EMP112', firstName: 'Pooja', lastName: 'Sharma', email: 'pooja.s@marqai.com',
      designation: 'HR Business Partner', employmentType: 'full-time', status: 'on_leave',
      joiningDate: new Date('2022-05-01'), companyId: marq.id,
      departmentId: deptHR.id, branchId: branchHyd.id, userId: userPooja.id,
    },
  });
  const emp113 = await prisma.employee.upsert({
    where: { employeeId: 'EMP113' },
    update: {},
    create: {
      employeeId: 'EMP113', firstName: 'Arun', lastName: 'Das', email: 'arun.d@marqai.com',
      designation: 'Operations Manager', employmentType: 'full-time', status: 'active',
      joiningDate: new Date('2020-11-15'), companyId: marq.id,
      departmentId: deptOps.id, branchId: branchMum.id, userId: userArun.id,
    },
  });
  const emp114 = await prisma.employee.upsert({
    where: { employeeId: 'EMP114' },
    update: {},
    create: {
      employeeId: 'EMP114', firstName: 'Swati', lastName: 'Verma', email: 'swati.v@marqai.com',
      designation: 'Frontend Developer', employmentType: 'contract', status: 'active',
      joiningDate: new Date('2024-01-15'), companyId: marq.id,
      departmentId: deptEng.id, branchId: branchBlr.id, userId: userSwati.id,
    },
  });
  const emp115 = await prisma.employee.upsert({
    where: { employeeId: 'EMP115' },
    update: {},
    create: {
      employeeId: 'EMP115', firstName: 'Manish', lastName: 'Agarwal', email: 'manish.a@marqai.com',
      designation: 'Business Analyst', employmentType: 'full-time', status: 'notice_period',
      joiningDate: new Date('2021-03-01'), companyId: marq.id,
      departmentId: deptProduct.id, branchId: branchHyd.id, userId: userManish.id,
    },
  });
  counts.employees = 15;
  console.log(`  Created ${counts.employees} employees\n`);

  // ==================== SET REPORTING MANAGERS ====================
  console.log('🔗 Setting reporting managers...');
  try {
    // EMP103 (Meera - AI Researcher), EMP104 (Rahul - Full Stack), EMP109 (Suresh - DevOps), EMP111 (Ravi - ML Engineer), EMP108 (Neha - Data Scientist) → report to EMP102 (Vikram - Head of Engineering)
    await prisma.employee.update({ where: { id: emp103.id }, data: { reportingManagerId: emp102.id } });
    await prisma.employee.update({ where: { id: emp104.id }, data: { reportingManagerId: emp102.id } });
    await prisma.employee.update({ where: { id: emp109.id }, data: { reportingManagerId: emp102.id } });
    await prisma.employee.update({ where: { id: emp111.id }, data: { reportingManagerId: emp102.id } });
    await prisma.employee.update({ where: { id: emp108.id }, data: { reportingManagerId: emp102.id } });

    // EMP106 (Deepa - UX), EMP115 (Manish - BA) → report to EMP105 (Sanjay - Product Manager)
    await prisma.employee.update({ where: { id: emp106.id }, data: { reportingManagerId: emp105.id } });
    await prisma.employee.update({ where: { id: emp115.id }, data: { reportingManagerId: emp105.id } });

    // EMP112 (Pooja - HR BP) → report to EMP101 (Ananya - VP HR)
    await prisma.employee.update({ where: { id: emp112.id }, data: { reportingManagerId: emp101.id } });

    // EMP110 (Kavita - Sales Director) → report to EMP113 (Arun - Ops Manager)
    await prisma.employee.update({ where: { id: emp110.id }, data: { reportingManagerId: emp113.id } });

    // EMP114 (Swati - Frontend) → report to EMP102 (Vikram)
    await prisma.employee.update({ where: { id: emp114.id }, data: { reportingManagerId: emp102.id } });

    console.log('  Reporting managers set successfully\n');
  } catch (error) {
    console.error('  Error setting reporting managers:', error);
  }

  // ==================== MARQ LEAVE POLICIES ====================
  console.log('📋 Creating MARQ leave policies...');
  try {
    await prisma.leavePolicy.upsert({
      where: { id: 'lp-marq-casual' },
      update: {},
      create: { id: 'lp-marq-casual', name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarryDays: 3, isPaid: true, companyId: marq.id },
    });
    await prisma.leavePolicy.upsert({
      where: { id: 'lp-marq-sick' },
      update: {},
      create: { id: 'lp-marq-sick', name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, isPaid: true, companyId: marq.id },
    });
    await prisma.leavePolicy.upsert({
      where: { id: 'lp-marq-earned' },
      update: {},
      create: { id: 'lp-marq-earned', name: 'Earned Leave', type: 'earned', totalDays: 15, carryForward: true, maxCarryDays: 5, isPaid: true, companyId: marq.id },
    });
    counts.leavePolicies = 3;
    console.log(`  Created ${counts.leavePolicies} leave policies\n`);
  } catch (error) {
    console.error('  Error creating leave policies:', error);
  }

  // ==================== MARQ LEAVE RECORDS ====================
  console.log('🏖️ Creating MARQ leave records...');
  try {
    await prisma.leave.create({
      data: { type: 'casual', startDate: new Date('2025-01-20'), endDate: new Date('2025-01-21'), totalDays: 2, reason: 'Personal work', status: 'approved', approverId: emp101.id, employeeId: emp104.id },
    });
    await prisma.leave.create({
      data: { type: 'sick', startDate: new Date('2025-02-03'), endDate: new Date('2025-02-04'), totalDays: 2, reason: 'Fever and cold', status: 'pending', employeeId: emp103.id },
    });
    await prisma.leave.create({
      data: { type: 'earned', startDate: new Date('2025-03-10'), endDate: new Date('2025-03-14'), totalDays: 5, reason: 'Family vacation', status: 'pending', employeeId: emp105.id },
    });
    await prisma.leave.create({
      data: { type: 'casual', startDate: new Date('2025-01-27'), endDate: new Date('2025-01-27'), totalDays: 1, reason: 'Personal errand', status: 'approved', approverId: emp102.id, employeeId: emp111.id },
    });
    await prisma.leave.create({
      data: { type: 'sick', startDate: new Date('2025-02-17'), endDate: new Date('2025-02-18'), totalDays: 2, reason: 'Medical appointment', status: 'rejected', approverId: emp101.id, approverComment: 'Please reschedule after project deadline', employeeId: emp112.id },
    });
    counts.leaves = 5;
    console.log(`  Created ${counts.leaves} leave records\n`);
  } catch (error) {
    console.error('  Error creating leave records:', error);
  }

  // ==================== MARQ PAYROLL STRUCTURES ====================
  console.log('💰 Creating MARQ payroll structures...');
  try {
    await prisma.payrollStructure.upsert({
      where: { id: 'ps-marq-executive' },
      update: {},
      create: {
        id: 'ps-marq-executive', name: 'MARQ Executive Pay', basicPay: 120000, hra: 48000, da: 12000,
        transportAllowance: 5000, medicalAllowance: 3000, specialAllowance: 12000,
        pfEmployee: 14400, pfEmployer: 14400, esiEmployee: 2500, esiEmployer: 6000, taxDeduction: 30000,
        companyId: marq.id,
      },
    });
    await prisma.payrollStructure.upsert({
      where: { id: 'ps-marq-standard' },
      update: {},
      create: {
        id: 'ps-marq-standard', name: 'MARQ Standard Pay', basicPay: 80000, hra: 32000, da: 8000,
        transportAllowance: 3500, medicalAllowance: 2500, specialAllowance: 8000,
        pfEmployee: 9600, pfEmployer: 9600, esiEmployee: 1800, esiEmployer: 4500, taxDeduction: 18000,
        companyId: marq.id,
      },
    });
    await prisma.payrollStructure.upsert({
      where: { id: 'ps-marq-junior' },
      update: {},
      create: {
        id: 'ps-marq-junior', name: 'MARQ Junior Pay', basicPay: 50000, hra: 20000, da: 5000,
        transportAllowance: 2500, medicalAllowance: 1500, specialAllowance: 5000,
        pfEmployee: 6000, pfEmployer: 6000, esiEmployee: 1200, esiEmployer: 3000, taxDeduction: 8000,
        companyId: marq.id,
      },
    });
    counts.payrollStructures = 3;
    console.log(`  Created ${counts.payrollStructures} payroll structures\n`);
  } catch (error) {
    console.error('  Error creating payroll structures:', error);
  }

  // ==================== MARQ PAYROLL RECORDS ====================
  console.log('💵 Creating MARQ payroll records...');
  try {
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 120000, grossSalary: 200000, totalDeductions: 61300, netSalary: 138700, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: emp101.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 150000, grossSalary: 195000, totalDeductions: 62500, netSalary: 132500, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: emp102.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 90000, grossSalary: 131000, totalDeductions: 37100, netSalary: 93900, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: emp103.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 70000, grossSalary: 111000, totalDeductions: 28100, netSalary: 82900, status: 'processed', employeeId: emp104.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 95000, grossSalary: 135000, totalDeductions: 40100, netSalary: 94900, status: 'processed', employeeId: emp105.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 65000, grossSalary: 95000, totalDeductions: 22200, netSalary: 72800, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: emp106.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 110000, grossSalary: 160000, totalDeductions: 50500, netSalary: 109500, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: emp107.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 85000, grossSalary: 125000, totalDeductions: 34700, netSalary: 90300, status: 'draft', employeeId: emp108.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 55000, grossSalary: 78000, totalDeductions: 16200, netSalary: 61800, status: 'draft', employeeId: emp109.id },
    });
    await prisma.payrollRecord.create({
      data: { month: 1, year: 2025, basicPay: 100000, grossSalary: 145000, totalDeductions: 43500, netSalary: 101500, status: 'paid', paymentDate: new Date('2025-01-31'), employeeId: emp110.id },
    });
    counts.payrollRecords = 10;
    console.log(`  Created ${counts.payrollRecords} payroll records\n`);
  } catch (error) {
    console.error('  Error creating payroll records:', error);
  }

  // ==================== MARQ GOALS ====================
  console.log('🎯 Creating MARQ goals...');
  try {
    await prisma.goal.create({
      data: { title: 'Launch MARQ AI Platform v2.0', description: 'Deliver the next version of our AI platform with improved NLP capabilities', type: 'team', category: 'okr', progress: 45, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'), employeeId: emp102.id },
    });
    await prisma.goal.create({
      data: { title: 'Reduce Employee Attrition to <10%', description: 'Implement retention strategies to bring attrition below 10%', type: 'department', category: 'kpi', progress: 60, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), employeeId: emp101.id },
    });
    await prisma.goal.create({
      data: { title: 'Publish 3 AI Research Papers', description: 'Publish papers on transformer architectures and few-shot learning', type: 'individual', category: 'okr', progress: 33, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), employeeId: emp103.id },
    });
    await prisma.goal.create({
      data: { title: 'Achieve 95% Test Coverage', description: 'Increase automated test coverage across all microservices', type: 'individual', category: 'smart', progress: 70, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31'), employeeId: emp104.id },
    });
    await prisma.goal.create({
      data: { title: 'Increase Q1 Revenue by 20%', description: 'Drive new enterprise deals and expand existing accounts', type: 'department', category: 'kpi', progress: 55, status: 'in_progress', startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31'), employeeId: emp110.id },
    });
    await prisma.goal.create({
      data: { title: 'Complete ML Pipeline Migration', description: 'Migrate legacy ML pipelines to Kubernetes-based infrastructure', type: 'individual', category: 'okr', progress: 20, status: 'in_progress', startDate: new Date('2025-02-01'), endDate: new Date('2025-05-31'), employeeId: emp111.id },
    });
    counts.goals = 6;
    console.log(`  Created ${counts.goals} goals\n`);
  } catch (error) {
    console.error('  Error creating goals:', error);
  }

  // ==================== MARQ ASSETS ====================
  console.log('💻 Creating MARQ asset allocations...');
  try {
    await prisma.assetAllocation.create({
      data: { assetType: 'laptop', assetName: 'MacBook Pro 16" M3', assetCode: 'MARQ-LTP-001', serialNumber: 'MBPM3-2024-001', status: 'allocated', employeeId: emp101.id },
    });
    await prisma.assetAllocation.create({
      data: { assetType: 'laptop', assetName: 'ThinkPad X1 Carbon Gen 11', assetCode: 'MARQ-LTP-002', serialNumber: 'TPX1-2024-002', status: 'allocated', employeeId: emp102.id },
    });
    await prisma.assetAllocation.create({
      data: { assetType: 'laptop', assetName: 'MacBook Pro 14" M3 Pro', assetCode: 'MARQ-LTP-003', serialNumber: 'MBPM3P-2024-003', status: 'allocated', notes: 'GPU-intensive workloads', employeeId: emp103.id },
    });
    await prisma.assetAllocation.create({
      data: { assetType: 'laptop', assetName: 'Dell XPS 15', assetCode: 'MARQ-LTP-004', serialNumber: 'DXPS-2024-004', status: 'allocated', employeeId: emp104.id },
    });
    await prisma.assetAllocation.create({
      data: { assetType: 'phone', assetName: 'iPhone 15 Pro', assetCode: 'MARQ-PHN-001', serialNumber: 'IP15P-2024-001', status: 'allocated', notes: 'Executive device', employeeId: emp101.id },
    });
    await prisma.assetAllocation.create({
      data: { assetType: 'phone', assetName: 'Samsung Galaxy S24', assetCode: 'MARQ-PHN-002', serialNumber: 'SGS24-2024-002', status: 'allocated', employeeId: emp110.id },
    });
    await prisma.assetAllocation.create({
      data: { assetType: 'access_card', assetName: 'Access Card - All Floors', assetCode: 'MARQ-AC-001', status: 'allocated', notes: 'Admin access', employeeId: emp101.id },
    });
    await prisma.assetAllocation.create({
      data: { assetType: 'monitor', assetName: 'Dell UltraSharp 34" Curved', assetCode: 'MARQ-MON-001', serialNumber: 'DUS34-2024-001', status: 'allocated', employeeId: emp103.id },
    });
    counts.assets = 8;
    console.log(`  Created ${counts.assets} asset allocations\n`);
  } catch (error) {
    console.error('  Error creating assets:', error);
  }

  // ==================== MARQ ATTENDANCE ====================
  console.log('⏰ Creating MARQ attendance records...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    await prisma.attendance.create({
      data: { date: today, checkIn: new Date(today.getTime() + 9 * 3600000), checkOut: new Date(today.getTime() + 18.25 * 3600000), workHours: 8.5, status: 'present', source: 'biometric', employeeId: emp101.id },
    });
    await prisma.attendance.create({
      data: { date: today, checkIn: new Date(today.getTime() + 8.75 * 3600000), checkOut: new Date(today.getTime() + 18 * 3600000), workHours: 8.5, status: 'present', source: 'biometric', employeeId: emp102.id },
    });
    await prisma.attendance.create({
      data: { date: today, checkIn: new Date(today.getTime() + 9.5 * 3600000), checkOut: new Date(today.getTime() + 18.5 * 3600000), workHours: 8.0, status: 'late', source: 'mobile', employeeId: emp104.id },
    });
    await prisma.attendance.create({
      data: { date: today, checkIn: new Date(today.getTime() + 9 * 3600000), status: 'present', source: 'web', employeeId: emp105.id },
    });
    await prisma.attendance.create({
      data: { date: today, status: 'absent', source: 'system', notes: 'On approved leave', employeeId: emp112.id },
    });
    await prisma.attendance.create({
      data: { date: today, checkIn: new Date(today.getTime() + 9 * 3600000), checkOut: new Date(today.getTime() + 14 * 3600000), workHours: 4.0, status: 'half_day', source: 'web', notes: 'Left early - medical appointment', employeeId: emp108.id },
    });
    counts.attendance = 6;
    console.log(`  Created ${counts.attendance} attendance records\n`);
  } catch (error) {
    console.error('  Error creating attendance records:', error);
  }

  // ==================== MARQ LEARNING RECORDS ====================
  console.log('📚 Creating MARQ learning records...');
  try {
    await prisma.learningRecord.create({
      data: { courseName: 'Advanced LLM Fine-tuning', provider: 'DeepLearning.AI', type: 'e_learning', status: 'in_progress', employeeId: emp103.id },
    });
    await prisma.learningRecord.create({
      data: { courseName: 'Kubernetes Administrator (CKA)', provider: 'CNCF', type: 'certification', status: 'completed', completedAt: new Date('2024-11-20'), score: 88, certificate: 'cka-2024-marq-001', employeeId: emp109.id },
    });
    await prisma.learningRecord.create({
      data: { courseName: 'Product Management Masterclass', provider: 'Internal MARQ Academy', type: 'workshop', status: 'completed', completedAt: new Date('2024-12-10'), score: 95, employeeId: emp105.id },
    });
    await prisma.learningRecord.create({
      data: { courseName: 'Effective Leadership & Communication', provider: 'Coursera', type: 'e_learning', status: 'enrolled', employeeId: emp101.id },
    });
    await prisma.learningRecord.create({
      data: { courseName: 'React & Next.js Advanced Patterns', provider: 'Frontend Masters', type: 'e_learning', status: 'in_progress', employeeId: emp114.id },
    });
    counts.learning = 5;
    console.log(`  Created ${counts.learning} learning records\n`);
  } catch (error) {
    console.error('  Error creating learning records:', error);
  }

  // ==================== MARQ TICKETS ====================
  console.log('🎫 Creating MARQ tickets...');
  try {
    await prisma.ticket.create({
      data: { subject: 'GPU Cluster Access Issue', description: 'Cannot SSH into GPU node 3 for model training', category: 'it', priority: 'urgent', status: 'open', employeeId: emp103.id },
    });
    await prisma.ticket.create({
      data: { subject: 'Salary Reimbursement Delay', description: 'Travel reimbursement for December not yet processed', category: 'payroll', priority: 'high', status: 'in_progress', employeeId: emp110.id },
    });
    await prisma.ticket.create({
      data: { subject: 'New Monitor Request', description: 'Need a second monitor for data visualization work', category: 'it', priority: 'low', status: 'open', employeeId: emp108.id },
    });
    await prisma.ticket.create({
      data: { subject: 'VPN Configuration for Client Project', description: 'Need VPN access set up for the FinServe client project', category: 'it', priority: 'medium', status: 'resolved', resolution: 'VPN configured and tested successfully by IT team', employeeId: emp104.id },
    });
    await prisma.ticket.create({
      data: { subject: 'Office AC Malfunction - Floor 4', description: 'AC not working on 4th floor, very uncomfortable for team', category: 'facility', priority: 'medium', status: 'in_progress', employeeId: emp106.id },
    });
    counts.tickets = 5;
    console.log(`  Created ${counts.tickets} tickets\n`);
  } catch (error) {
    console.error('  Error creating tickets:', error);
  }

  // ==================== MARQ SHIFTS ====================
  console.log('🕐 Creating MARQ shifts...');
  try {
    const shiftGeneral = await prisma.shift.upsert({
      where: { id: 'shift-marq-general' },
      update: {},
      create: { id: 'shift-marq-general', name: 'MARQ General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60, isActive: true, companyId: marq.id },
    });
    const shiftMorning = await prisma.shift.upsert({
      where: { id: 'shift-marq-morning' },
      update: {},
      create: { id: 'shift-marq-morning', name: 'MARQ Morning Shift', startTime: '06:00', endTime: '14:00', breakMinutes: 30, isActive: true, companyId: marq.id },
    });
    const shiftEvening = await prisma.shift.upsert({
      where: { id: 'shift-marq-evening' },
      update: {},
      create: { id: 'shift-marq-evening', name: 'MARQ Evening Shift', startTime: '14:00', endTime: '22:00', breakMinutes: 30, isActive: true, companyId: marq.id },
    });
    const shiftNight = await prisma.shift.upsert({
      where: { id: 'shift-marq-night' },
      update: {},
      create: { id: 'shift-marq-night', name: 'MARQ Night Shift', startTime: '22:00', endTime: '06:00', breakMinutes: 30, isActive: true, companyId: marq.id },
    });

    // Assign shift members
    await prisma.shiftMember.create({
      data: { effectiveDate: new Date('2025-01-01'), shiftId: shiftGeneral.id, employeeId: emp101.id },
    }).catch(() => {});
    await prisma.shiftMember.create({
      data: { effectiveDate: new Date('2025-01-01'), shiftId: shiftGeneral.id, employeeId: emp102.id },
    }).catch(() => {});
    await prisma.shiftMember.create({
      data: { effectiveDate: new Date('2025-01-01'), shiftId: shiftGeneral.id, employeeId: emp105.id },
    }).catch(() => {});
    await prisma.shiftMember.create({
      data: { effectiveDate: new Date('2025-01-01'), shiftId: shiftGeneral.id, employeeId: emp107.id },
    }).catch(() => {});
    await prisma.shiftMember.create({
      data: { effectiveDate: new Date('2025-01-01'), shiftId: shiftMorning.id, employeeId: emp109.id },
    }).catch(() => {});
    await prisma.shiftMember.create({
      data: { effectiveDate: new Date('2025-01-01'), shiftId: shiftGeneral.id, employeeId: emp110.id },
    }).catch(() => {});

    counts.shifts = 4;
    console.log(`  Created ${counts.shifts} shifts\n`);
  } catch (error) {
    console.error('  Error creating shifts:', error);
  }

  // ==================== MARQ COMPLIANCE ITEMS ====================
  console.log('✅ Creating MARQ compliance items...');
  try {
    await prisma.complianceItem.create({
      data: { title: 'Annual POSH Training', description: 'Mandatory Prevention of Sexual Harassment training for all MARQ employees', category: 'regulatory', dueDate: new Date('2025-03-31'), status: 'pending', assignee: 'Ananya Reddy', companyId: marq.id },
    });
    await prisma.complianceItem.create({
      data: { title: 'GDPR Data Audit', description: 'Quarterly GDPR compliance audit for AI data processing', category: 'data_privacy', dueDate: new Date('2025-04-15'), status: 'pending', assignee: 'Vikram Singh', companyId: marq.id },
    });
    await prisma.complianceItem.create({
      data: { title: 'TDS Return Filing - Q4 2024', description: 'File TDS returns for the October-December 2024 quarter', category: 'tax', dueDate: new Date('2025-01-31'), status: 'completed', assignee: 'Amit Tiwari', companyId: marq.id },
    });
    await prisma.complianceItem.create({
      data: { title: 'Fire Safety Drill', description: 'Annual fire safety drill for all MARQ offices', category: 'safety', dueDate: new Date('2025-06-30'), status: 'pending', companyId: marq.id },
    });
    await prisma.complianceItem.create({
      data: { title: 'ISO 27001 Recertification', description: 'Information security management system recertification audit', category: 'regulatory', dueDate: new Date('2025-09-30'), status: 'in_progress', assignee: 'Suresh Babu', companyId: marq.id },
    });
    counts.compliance = 5;
    console.log(`  Created ${counts.compliance} compliance items\n`);
  } catch (error) {
    console.error('  Error creating compliance items:', error);
  }

  // ==================== MARQ NOTIFICATIONS ====================
  console.log('🔔 Creating MARQ notifications...');
  try {
    // Notifications for Ananya (HR Admin)
    await prisma.notification.create({
      data: { title: 'New Leave Request', message: 'Meera Krishnan has submitted a sick leave request for Feb 3-4', type: 'info', category: 'leave', userId: userAnanya.id },
    });
    await prisma.notification.create({
      data: { title: 'Probation Ending Soon', message: 'Suresh Babu\'s probation ends on May 1, 2025. Please initiate review.', type: 'warning', category: 'employee', userId: userAnanya.id },
    });
    await prisma.notification.create({
      data: { title: 'Onboarding Task Overdue', message: '3 onboarding tasks are overdue for the new hires', type: 'warning', category: 'onboarding', userId: userAnanya.id },
    });
    await prisma.notification.create({
      data: { title: 'Monthly Payroll Processed', message: 'January 2025 payroll has been processed successfully', type: 'success', category: 'payroll', userId: userAnanya.id },
    });
    await prisma.notification.create({
      data: { title: 'Compliance Deadline', message: 'TDS Return Filing deadline is January 31, 2025', type: 'warning', category: 'compliance', userId: userAnanya.id },
    });

    // Notifications for Vikram (Manager)
    await prisma.notification.create({
      data: { title: 'Leave Approval Needed', message: 'Neha Joshi has requested earned leave for Mar 10-14', type: 'info', category: 'leave', userId: userVikram.id },
    });
    await prisma.notification.create({
      data: { title: 'GPU Cluster Issue', message: 'A critical GPU cluster access issue has been reported', type: 'error', category: 'it', userId: userVikram.id },
    });
    await prisma.notification.create({
      data: { title: 'Sprint Review', message: 'Sprint 14 review scheduled for Friday at 3 PM', type: 'info', category: 'project', userId: userVikram.id },
    });

    // Notifications for Amit (Finance)
    await prisma.notification.create({
      data: { title: 'Expense Approval Pending', message: 'Kavita Patil has submitted a travel expense claim of INR 12,500', type: 'info', category: 'expense', userId: userAmit.id },
    });
    await prisma.notification.create({
      data: { title: 'Invoice Received', message: 'New invoice from CloudVendor Solutions for January cloud services', type: 'info', category: 'finance', userId: userAmit.id },
    });

    counts.notifications = 10;
    console.log(`  Created ${counts.notifications} notifications\n`);
  } catch (error) {
    console.error('  Error creating notifications:', error);
  }

  // ==================== MARQ WORKFLOW DEFINITIONS ====================
  console.log('⚙️ Creating MARQ workflow definitions...');
  try {
    const wfLeaveMarq = await prisma.workflowDefinition.upsert({
      where: { id: 'wf-marq-leave' },
      update: {},
      create: { id: 'wf-marq-leave', name: 'MARQ Leave Approval', type: 'approval', entity: 'leave', description: 'Leave approval: Reporting Manager → HR Admin', isActive: true, companyId: marq.id },
    });
    const wfExpenseMarq = await prisma.workflowDefinition.upsert({
      where: { id: 'wf-marq-expense' },
      update: {},
      create: { id: 'wf-marq-expense', name: 'MARQ Expense Approval', type: 'approval', entity: 'expense', description: 'Expense approval: Reporting Manager → Finance', isActive: true, companyId: marq.id },
    });
    const wfTravelMarq = await prisma.workflowDefinition.upsert({
      where: { id: 'wf-marq-travel' },
      update: {},
      create: { id: 'wf-marq-travel', name: 'MARQ Travel Request Approval', type: 'approval', entity: 'travel', description: 'Travel approval: Reporting Manager → HR Admin → Finance', isActive: true, companyId: marq.id },
    });

    // Workflow steps for Leave
    await prisma.workflowStepDef.upsert({
      where: { id: 'wfs-marq-leave-1' },
      update: {},
      create: { id: 'wfs-marq-leave-1', name: 'Manager Approval', stepOrder: 1, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject', workflowDefId: wfLeaveMarq.id },
    });
    await prisma.workflowStepDef.upsert({
      where: { id: 'wfs-marq-leave-2' },
      update: {},
      create: { id: 'wfs-marq-leave-2', name: 'HR Admin Approval', stepOrder: 2, approverRole: 'company_hr_admin', approverType: 'role', action: 'approve_reject', workflowDefId: wfLeaveMarq.id },
    });

    // Workflow steps for Expense
    await prisma.workflowStepDef.upsert({
      where: { id: 'wfs-marq-expense-1' },
      update: {},
      create: { id: 'wfs-marq-expense-1', name: 'Manager Approval', stepOrder: 1, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject', workflowDefId: wfExpenseMarq.id },
    });
    await prisma.workflowStepDef.upsert({
      where: { id: 'wfs-marq-expense-2' },
      update: {},
      create: { id: 'wfs-marq-expense-2', name: 'Finance Approval', stepOrder: 2, approverRole: 'finance', approverType: 'role', action: 'approve_reject', workflowDefId: wfExpenseMarq.id },
    });

    // Workflow steps for Travel
    await prisma.workflowStepDef.upsert({
      where: { id: 'wfs-marq-travel-1' },
      update: {},
      create: { id: 'wfs-marq-travel-1', name: 'Manager Approval', stepOrder: 1, approverRole: 'reporting_manager', approverType: 'role', action: 'approve_reject', workflowDefId: wfTravelMarq.id },
    });
    await prisma.workflowStepDef.upsert({
      where: { id: 'wfs-marq-travel-2' },
      update: {},
      create: { id: 'wfs-marq-travel-2', name: 'HR Admin Approval', stepOrder: 2, approverRole: 'company_hr_admin', approverType: 'role', action: 'approve_reject', workflowDefId: wfTravelMarq.id },
    });
    await prisma.workflowStepDef.upsert({
      where: { id: 'wfs-marq-travel-3' },
      update: {},
      create: { id: 'wfs-marq-travel-3', name: 'Finance Approval', stepOrder: 3, approverRole: 'finance', approverType: 'role', action: 'approve_reject', workflowDefId: wfTravelMarq.id },
    });

    counts.workflows = 3;
    counts.workflowSteps = 7;
    console.log(`  Created ${counts.workflows} workflow definitions with ${counts.workflowSteps} steps\n`);
  } catch (error) {
    console.error('  Error creating workflow definitions:', error);
  }

  // ==================== SUMMARY ====================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🎉 MARQ AI SEED DATA SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Branches:            ${counts.branches}`);
  console.log(`  Departments:         ${counts.departments}`);
  console.log(`  Users:               ${counts.users}`);
  console.log(`  Employees:           ${counts.employees}`);
  console.log(`  Leave Policies:      ${counts.leavePolicies}`);
  console.log(`  Leave Records:       ${counts.leaves}`);
  console.log(`  Payroll Structures:  ${counts.payrollStructures}`);
  console.log(`  Payroll Records:     ${counts.payrollRecords}`);
  console.log(`  Goals:               ${counts.goals}`);
  console.log(`  Assets:              ${counts.assets}`);
  console.log(`  Attendance:          ${counts.attendance}`);
  console.log(`  Learning Records:    ${counts.learning}`);
  console.log(`  Tickets:             ${counts.tickets}`);
  console.log(`  Shifts:              ${counts.shifts}`);
  console.log(`  Compliance Items:    ${counts.compliance}`);
  console.log(`  Notifications:       ${counts.notifications}`);
  console.log(`  Workflows:           ${counts.workflows} (${counts.workflowSteps} steps)`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n🔑 MARQ Demo Login Credentials:');
  console.log('  HR Admin:     ananya.r@marqai.com / ananya123');
  console.log('  Manager:      vikram.s@marqai.com / vikram123');
  console.log('  Employee:     meera.k@marqai.com / meera123');
  console.log('  Employee:     rahul.g@marqai.com / rahul123');
  console.log('  Employee:     sanjay.m@marqai.com / sanjay123');
  console.log('  Employee:     deepa.n@marqai.com / deepa123');
  console.log('  Finance:      amit.t@marqai.com / amit123');
  console.log('  Employee:     neha.j@marqai.com / neha123');
  console.log('  Employee:     suresh.b@marqai.com / suresh123');
  console.log('  Employee:     kavita.p@marqai.com / kavita123');
  console.log('  Employee:     ravi.k@marqai.com / ravi123');
  console.log('  Employee:     pooja.s@marqai.com / pooja123');
  console.log('  Employee:     arun.d@marqai.com / arun123');
  console.log('  Employee:     swati.v@marqai.com / swati123');
  console.log('  Employee:     manish.a@marqai.com / manish123');
  console.log('\n✅ MARQ AI seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ MARQ seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
