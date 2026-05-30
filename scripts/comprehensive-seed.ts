import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcryptjs';

const db = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rDate(d: string): Date { return new Date(d); }
function rNow(): Date { return new Date(); }
function daysAgo(n: number): Date { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n: number): Date { const d = new Date(); d.setDate(d.getDate() + n); return d; }

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // ── 1. Company ─────────────────────────────────────────────────────────────
  const company = await db.company.upsert({
    where: { code: 'MARQ' },
    update: {},
    create: {
      name: 'MARQ AI Technologies Pvt. Ltd.',
      code: 'MARQ',
      industry: 'Technology',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      isActive: true,
      domain: 'marqai.tech',
    },
  });
  console.log('✅ Company:', company.name);

  // ── 2. Branches ────────────────────────────────────────────────────────────
  const branches = await Promise.all([
    db.branch.upsert({ where: { id: 'br-mum' }, update: {}, create: { id: 'br-mum', name: 'Mumbai HQ', code: 'MUM-HQ', address: 'BKC, Bandra Kurla Complex, Mumbai', city: 'Mumbai', state: 'Maharashtra', country: 'India', isActive: true, companyId: company.id } }),
    db.branch.upsert({ where: { id: 'br-blr' }, update: {}, create: { id: 'br-blr', name: 'Bangalore Tech', code: 'BLR-TECH', address: 'Whitefield, Bangalore', city: 'Bangalore', state: 'Karnataka', country: 'India', isActive: true, companyId: company.id } }),
    db.branch.upsert({ where: { id: 'br-del' }, update: {}, create: { id: 'br-del', name: 'Delhi NCR', code: 'DEL-NCR', address: 'Connaught Place, New Delhi', city: 'New Delhi', state: 'Delhi', country: 'India', isActive: true, companyId: company.id } }),
    db.branch.upsert({ where: { id: 'br-hyd' }, update: {}, create: { id: 'br-hyd', name: 'Hyderabad Dev', code: 'HYD-DEV', address: 'HITEC City, Hyderabad', city: 'Hyderabad', state: 'Telangana', country: 'India', isActive: true, companyId: company.id } }),
    db.branch.upsert({ where: { id: 'br-pun' }, update: {}, create: { id: 'br-pun', name: 'Pune Office', code: 'PNE-OFF', address: 'Hinjewadi, Pune', city: 'Pune', state: 'Maharashtra', country: 'India', isActive: true, companyId: company.id } }),
  ]);
  console.log('✅ Branches:', branches.length);

  // ── 3. Departments ─────────────────────────────────────────────────────────
  const depts = await Promise.all([
    db.department.upsert({ where: { id: 'dep-eng' }, update: {}, create: { id: 'dep-eng', name: 'Engineering', code: 'ENG', description: 'Software Engineering', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-hr' }, update: {}, create: { id: 'dep-hr', name: 'Human Resources', code: 'HR', description: 'HR & People Ops', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-fin' }, update: {}, create: { id: 'dep-fin', name: 'Finance', code: 'FIN', description: 'Finance & Accounts', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-sales' }, update: {}, create: { id: 'dep-sales', name: 'Sales', code: 'SAL', description: 'Sales & Business Development', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-mkt' }, update: {}, create: { id: 'dep-mkt', name: 'Marketing', code: 'MKT', description: 'Marketing & Communications', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-ops' }, update: {}, create: { id: 'dep-ops', name: 'Operations', code: 'OPS', description: 'Operations & Admin', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-product' }, update: {}, create: { id: 'dep-product', name: 'Product', code: 'PRD', description: 'Product Management', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-design' }, update: {}, create: { id: 'dep-design', name: 'Design', code: 'DSN', description: 'UI/UX Design', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-qa' }, update: {}, create: { id: 'dep-qa', name: 'Quality Assurance', code: 'QA', description: 'QA & Testing', isActive: true, companyId: company.id } }),
    db.department.upsert({ where: { id: 'dep-legal' }, update: {}, create: { id: 'dep-legal', name: 'Legal', code: 'LGL', description: 'Legal & Compliance', isActive: true, companyId: company.id } }),
  ]);
  console.log('✅ Departments:', depts.length);

  // ── 4. Admin User ──────────────────────────────────────────────────────────
  const hashedPw = await bcrypt.hash('admin123', 10);
  const adminUser = await db.user.upsert({
    where: { email: 'admin@marqai.tech' },
    update: {},
    create: {
      email: 'admin@marqai.tech',
      password: hashedPw,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      companyId: company.id,
    },
  });
  console.log('✅ Admin User:', adminUser.email);

  // ── 5. Employees ──────────────────────────────────────────────────────────
  const empData = [
    { empId: 'EMP001', fn: 'Aarav', ln: 'Sharma', email: 'aarav.sharma@marqai.tech', designation: 'Software Engineer', deptId: 'dep-eng', branchId: 'br-mum', phone: '+91-9876543210', jDate: '2023-03-15' },
    { empId: 'EMP002', fn: 'Meera', ln: 'Patel', email: 'meera.patel@marqai.tech', designation: 'HR Executive', deptId: 'dep-hr', branchId: 'br-mum', phone: '+91-9876543211', jDate: '2023-06-01' },
    { empId: 'EMP003', fn: 'Vikram', ln: 'Singh', email: 'vikram.singh@marqai.tech', designation: 'Senior Engineer', deptId: 'dep-eng', branchId: 'br-blr', phone: '+91-9876543212', jDate: '2022-01-10' },
    { empId: 'EMP004', fn: 'Ananya', ln: 'Reddy', email: 'ananya.reddy@marqai.tech', designation: 'Product Manager', deptId: 'dep-product', branchId: 'br-blr', phone: '+91-9876543213', jDate: '2022-07-20' },
    { empId: 'EMP005', fn: 'Rohan', ln: 'Joshi', email: 'rohan.joshi@marqai.tech', designation: 'Finance Analyst', deptId: 'dep-fin', branchId: 'br-mum', phone: '+91-9876543214', jDate: '2023-09-05' },
    { empId: 'EMP006', fn: 'Priya', ln: 'Nair', email: 'priya.nair@marqai.tech', designation: 'Tech Lead', deptId: 'dep-eng', branchId: 'br-blr', phone: '+91-9876543215', jDate: '2021-11-01' },
    { empId: 'EMP007', fn: 'Arjun', ln: 'Kumar', email: 'arjun.kumar@marqai.tech', designation: 'Sales Executive', deptId: 'dep-sales', branchId: 'br-del', phone: '+91-9876543216', jDate: '2023-04-12' },
    { empId: 'EMP008', fn: 'Sneha', ln: 'Gupta', email: 'sneha.gupta@marqai.tech', designation: 'UX Designer', deptId: 'dep-design', branchId: 'br-blr', phone: '+91-9876543217', jDate: '2023-02-28' },
    { empId: 'EMP009', fn: 'Rajesh', ln: 'Verma', email: 'rajesh.verma@marqai.tech', designation: 'Engineering Manager', deptId: 'dep-eng', branchId: 'br-mum', phone: '+91-9876543218', jDate: '2021-05-15' },
    { empId: 'EMP010', fn: 'Kavitha', ln: 'Menon', email: 'kavitha.menon@marqai.tech', designation: 'QA Lead', deptId: 'dep-qa', branchId: 'br-hyd', phone: '+91-9876543219', jDate: '2022-08-22' },
    { empId: 'EMP011', fn: 'Suresh', ln: 'Reddy', email: 'suresh.reddy@marqai.tech', designation: 'DevOps Engineer', deptId: 'dep-eng', branchId: 'br-hyd', phone: '+91-9876543220', jDate: '2023-01-09' },
    { empId: 'EMP012', fn: 'Deepa', ln: 'Joshi', email: 'deepa.joshi@marqai.tech', designation: 'Marketing Manager', deptId: 'dep-mkt', branchId: 'br-mum', phone: '+91-9876543221', jDate: '2022-04-18' },
    { empId: 'EMP013', fn: 'Amit', ln: 'Patel', email: 'amit.patel@marqai.tech', designation: 'Sales Manager', deptId: 'dep-sales', branchId: 'br-del', phone: '+91-9876543222', jDate: '2021-12-01' },
    { empId: 'EMP014', fn: 'Neha', ln: 'Kapoor', email: 'neha.kapoor@marqai.tech', designation: 'HR Manager', deptId: 'dep-hr', branchId: 'br-mum', phone: '+91-9876543223', jDate: '2021-09-15' },
    { empId: 'EMP015', fn: 'Kiran', ln: 'Rao', email: 'kiran.rao@marqai.tech', designation: 'Operations Manager', deptId: 'dep-ops', branchId: 'br-pun', phone: '+91-9876543224', jDate: '2022-03-10' },
    { empId: 'EMP016', fn: 'Srinivas', ln: 'Iyer', email: 'srinivas.iyer@marqai.tech', designation: 'Backend Developer', deptId: 'dep-eng', branchId: 'br-hyd', phone: '+91-9876543225', jDate: '2023-07-01' },
    { empId: 'EMP017', fn: 'Pooja', ln: 'Sharma', email: 'pooja.sharma@marqai.tech', designation: 'Frontend Developer', deptId: 'dep-eng', branchId: 'br-blr', phone: '+91-9876543226', jDate: '2023-08-15' },
    { empId: 'EMP018', fn: 'Manish', ln: 'Agarwal', email: 'manish.agarwal@marqai.tech', designation: 'Finance Manager', deptId: 'dep-fin', branchId: 'br-mum', phone: '+91-9876543227', jDate: '2021-06-20' },
    { empId: 'EMP019', fn: 'Ritu', ln: 'Singh', email: 'ritu.singh@marqai.tech', designation: 'Legal Counsel', deptId: 'dep-legal', branchId: 'br-del', phone: '+91-9876543228', jDate: '2022-10-05' },
    { empId: 'EMP020', fn: 'Sanjay', ln: 'Mishra', email: 'sanjay.mishra@marqai.tech', designation: 'Data Analyst', deptId: 'dep-eng', branchId: 'br-pun', phone: '+91-9876543229', jDate: '2023-05-20' },
    { empId: 'EMP021', fn: 'Lakshmi', ln: 'Krishnan', email: 'lakshmi.krishnan@marqai.tech', designation: 'Content Writer', deptId: 'dep-mkt', branchId: 'br-blr', phone: '+91-9876543230', jDate: '2023-11-01' },
    { empId: 'EMP022', fn: 'Rahul', ln: 'Das', email: 'rahul.das@marqai.tech', designation: 'ML Engineer', deptId: 'dep-eng', branchId: 'br-hyd', phone: '+91-9876543231', jDate: '2023-03-25' },
    { empId: 'EMP023', fn: 'Divya', ln: 'Chauhan', email: 'divya.chauhan@marqai.tech', designation: 'QA Engineer', deptId: 'dep-qa', branchId: 'br-mum', phone: '+91-9876543232', jDate: '2024-01-10' },
    { empId: 'EMP024', fn: 'Vivek', ln: 'Thakur', email: 'vivek.thakur@marqai.tech', designation: 'Cloud Architect', deptId: 'dep-eng', branchId: 'br-blr', phone: '+91-9876543233', jDate: '2022-06-15' },
    { empId: 'EMP025', fn: 'Anita', ln: 'Desai', email: 'anita.desai@marqai.tech', designation: 'Business Analyst', deptId: 'dep-product', branchId: 'br-pun', phone: '+91-9876543234', jDate: '2023-10-08' },
  ];

  const employees = [];
  for (const e of empData) {
    const emp = await db.employee.upsert({
      where: { employeeId: e.empId },
      update: {},
      create: {
        employeeId: e.empId,
        firstName: e.fn,
        lastName: e.ln,
        email: e.email,
        phone: e.phone,
        designation: e.designation,
        jobTitle: e.designation,
        employmentType: 'full-time',
        status: 'active',
        joiningDate: rDate(e.jDate),
        companyId: company.id,
        departmentId: e.deptId,
        branchId: e.branchId,
        ...(e.empId === 'EMP001' ? { userId: adminUser.id } : {}),
      },
    });
    employees.push(emp);
  }
  console.log('✅ Employees:', employees.length);

  // ── 6. Company Policies ─────────────────────────────────────────────────────
  const policies = [
    { title: 'Leave Policy', category: 'Leave', content: '## Leave Policy\n\n- **Casual Leave**: 12 days/year\n- **Sick Leave**: 10 days/year\n- **Earned Leave**: 15 days/year\n- **Maternity Leave**: 26 weeks\n- **Paternity Leave**: 15 days\n\nCarry forward allowed up to 5 days for Earned Leave.', version: '2.1', effectiveDate: rDate('2024-01-01') },
    { title: 'Remote Work Policy', category: 'Work Policy', content: '## Remote Work Policy\n\n- Employees can work remotely up to 3 days/week\n- Must be available during core hours (10 AM - 4 PM IST)\n- Home office setup allowance of ₹25,000/year\n- Monthly in-office attendance minimum: 8 days', version: '1.3', effectiveDate: rDate('2024-02-01') },
    { title: 'Anti-Harassment Policy', category: 'Compliance', content: '## Anti-Harassment Policy\n\n- Zero tolerance for harassment of any kind\n- POSH committee formed with external member\n- Confidential reporting mechanism\n- Investigation within 30 working days\n- Protection against retaliation', version: '3.0', effectiveDate: rDate('2024-01-01') },
    { title: 'Code of Conduct', category: 'HR', content: '## Code of Conduct\n\n- Professional behavior at all times\n- Respect for colleagues and clients\n- No conflict of interest\n- Confidentiality of company information\n- Dress code: Business casual', version: '2.5', effectiveDate: rDate('2024-01-01') },
    { title: 'Data Security Policy', category: 'Security', content: '## Data Security Policy\n\n- All devices must have company-approved antivirus\n- No personal cloud storage for company data\n- MFA required for all systems\n- Regular security training mandatory\n- Incident reporting within 24 hours', version: '1.8', effectiveDate: rDate('2024-03-01') },
    { title: 'Travel Policy', category: 'Finance', content: '## Travel Policy\n\n- Domestic travel: Economy class\n- International travel: Economy for <4hrs, Business for >4hrs\n- Per diem: ₹3,000 domestic, $75 international\n- Pre-approval required for all travel\n- Expense submission within 7 days', version: '2.0', effectiveDate: rDate('2024-01-01') },
    { title: 'Dress Code Policy', category: 'Work Policy', content: '## Dress Code Policy\n\n- Business casual Monday-Thursday\n- Casual Friday\n- Client-facing meetings: Business formal\n- No offensive clothing or graphics', version: '1.2', effectiveDate: rDate('2024-01-01') },
    { title: 'Performance Review Policy', category: 'HR', content: '## Performance Review Policy\n\n- Annual performance reviews in January\n- Mid-year check-in in July\n- 360-degree feedback from peers, reports, and managers\n- Rating scale: 1-5\n- PIP process for ratings below 2', version: '1.5', effectiveDate: rDate('2024-01-01') },
    { title: 'Grievance Redressal Policy', category: 'HR', content: '## Grievance Redressal Policy\n\n- Three-tier grievance mechanism\n- Level 1: Direct manager (5 working days)\n- Level 2: HR department (10 working days)\n- Level 3: Grievance committee (15 working days)\n- Anonymous reporting option available', version: '1.3', effectiveDate: rDate('2024-02-01') },
    { title: 'Probation Policy', category: 'HR', content: '## Probation Policy\n\n- All new hires on 6-month probation\n- Monthly review by manager\n- Extension possible up to 3 months\n- Confirmation based on performance metrics\n- Leave during probation: 1 CL per month', version: '2.0', effectiveDate: rDate('2024-01-01') },
  ];

  for (const p of policies) {
    await db.companyPolicy.upsert({
      where: { id: `pol-${p.title.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `pol-${p.title.replace(/\s+/g, '-').toLowerCase()}`,
        title: p.title,
        content: p.content,
        category: p.category,
        version: p.version,
        effectiveDate: p.effectiveDate,
        status: 'active',
        companyId: company.id,
      },
    });
  }
  console.log('✅ Policies:', policies.length);

  // ── 7. Assets ──────────────────────────────────────────────────────────────
  const assetTypes = ['Laptop', 'Monitor', 'Phone', 'Headset', 'Keyboard', 'Mouse', 'Tablet', 'Webcam'];
  const assetStatuses = ['allocated', 'returned'];
  for (let i = 0; i < 30; i++) {
    const emp = employees[i % employees.length];
    const type = assetTypes[i % assetTypes.length];
    await db.assetAllocation.upsert({
      where: { id: `asset-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `asset-${String(i + 1).padStart(3, '0')}`,
        assetType: type,
        assetName: `${type} - ${['Dell', 'HP', 'Lenovo', 'Apple', 'Logitech', 'Samsung'][i % 6]}`,
        assetCode: `AST-${String(i + 1).padStart(4, '0')}`,
        serialNumber: `SN-${nanoid(8)}`,
        status: i < 25 ? 'allocated' : 'returned',
        allocatedAt: rDate('2024-01-15'),
        returnedAt: i >= 25 ? rDate('2024-12-01') : null,
        employeeId: emp.id,
      },
    });
  }
  console.log('✅ Assets: 30');

  // ── 8. Documents ──────────────────────────────────────────────────────────
  const docTypes = ['offer-letter', 'id-proof', 'certificate', 'contract', 'agreement'];
  for (let i = 0; i < 20; i++) {
    const emp = employees[i % employees.length];
    await db.document.upsert({
      where: { id: `doc-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `doc-${String(i + 1).padStart(3, '0')}`,
        name: `${docTypes[i % docTypes.length]}_${emp.firstName}_${emp.lastName}`,
        type: docTypes[i % docTypes.length],
        status: 'active',
        employeeId: emp.id,
      },
    });
  }
  console.log('✅ Documents: 20');

  // ── 9. Tasks ──────────────────────────────────────────────────────────────
  const taskTitles = [
    'Implement user authentication', 'Design database schema', 'Create API endpoints',
    'Build dashboard UI', 'Write unit tests', 'Deploy to staging',
    'Optimize database queries', 'Fix login bug', 'Add email notifications',
    'Implement search feature', 'Create reporting module', 'Set up CI/CD pipeline',
    'Refactor legacy code', 'Add pagination to lists', 'Implement file upload',
    'Design mobile responsive layout', 'Create user onboarding flow',
    'Add dark mode support', 'Implement WebSocket notifications', 'Build analytics dashboard',
  ];
  const taskStatuses = ['todo', 'in_progress', 'completed', 'review'];
  const taskPriorities = ['low', 'medium', 'high', 'urgent'];

  for (let i = 0; i < 20; i++) {
    const emp = employees[i % employees.length];
    const task = await db.task.upsert({
      where: { id: `task-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `task-${String(i + 1).padStart(3, '0')}`,
        title: taskTitles[i],
        description: `Complete implementation of: ${taskTitles[i]}`,
        priority: taskPriorities[i % taskPriorities.length],
        status: taskStatuses[i % taskStatuses.length],
        dueDate: daysFromNow(7 + (i % 14)),
        companyId: company.id,
      },
    });
    // Assign task
    await db.taskAssignment.upsert({
      where: { id: `ta-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `ta-${String(i + 1).padStart(3, '0')}`,
        taskId: task.id,
        employeeId: emp.id,
      },
    });
    // Add comment
    if (i % 3 === 0) {
      await db.taskComment.upsert({
        where: { id: `tc-${String(i + 1).padStart(3, '0')}` },
        update: {},
        create: {
          id: `tc-${String(i + 1).padStart(3, '0')}`,
          content: `Working on this task. ETA: ${3 + (i % 5)} days.`,
          taskId: task.id,
          employeeId: emp.id,
        },
      });
    }
  }
  console.log('✅ Tasks: 20');

  // ── 10. Attendance ────────────────────────────────────────────────────────
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    for (let eIdx = 0; eIdx < 10; eIdx++) {
      const emp = employees[eIdx];
      const date = daysAgo(dayOffset);
      date.setHours(0, 0, 0, 0);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      const statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'half_day', 'late', 'absent'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const checkInHour = status === 'late' ? 10 + Math.floor(Math.random() * 2) : 9;
      const checkInMin = Math.floor(Math.random() * 30);

      if (status !== 'absent') {
        try {
          await db.attendance.create({
            data: {
              employeeId: emp.id,
              date: date,
              checkIn: rDate(`${date.toISOString().split('T')[0]}T${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:00`),
              checkOut: status === 'half_day' ? rDate(`${date.toISOString().split('T')[0]}T13:00:00`) : rDate(`${date.toISOString().split('T')[0]}T18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00`),
              status: status,
              source: 'web',
              workHours: status === 'half_day' ? 4 : 8 + Math.random() - 0.5,
            },
          });
        } catch { /* Already exists */ }
      }
    }
  }
  console.log('✅ Attendance: 30 days × 10 employees');

  // ── 11. Leaves ────────────────────────────────────────────────────────────
  const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off', 'Loss of Pay'];
  const leaveStatuses = ['approved', 'pending', 'rejected'];

  for (let i = 0; i < 15; i++) {
    const emp = employees[i % employees.length];
    const startDate = daysFromNow(5 + i * 3);
    const days = 1 + (i % 3);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1);
    await db.leave.upsert({
      where: { id: `leave-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `leave-${String(i + 1).padStart(3, '0')}`,
        type: leaveTypes[i % leaveTypes.length],
        startDate: startDate,
        endDate: endDate,
        totalDays: days,
        reason: ['Family vacation', 'Medical appointment', 'Personal work', 'Festival', 'Family function'][i % 5],
        status: leaveStatuses[i % leaveStatuses.length],
        approverId: i % 3 === 0 ? employees[8].id : null,
        employeeId: emp.id,
      },
    });
  }
  console.log('✅ Leaves: 15');

  // ── 12. Payroll Records ────────────────────────────────────────────────────
  for (let month = 1; month <= 3; month++) {
    for (let eIdx = 0; eIdx < 10; eIdx++) {
      const emp = employees[eIdx];
      const basic = [50000, 45000, 60000, 55000, 40000, 65000, 35000, 50000, 70000, 48000][eIdx];
      const hra = basic * 0.4;
      const da = basic * 0.1;
      const gross = basic + hra + da;
      const pf = basic * 0.12;
      const tax = basic * 0.1;
      const deductions = pf + tax;
      const net = gross - deductions;

      await db.payrollRecord.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month, year: 2025 } },
        update: {},
        create: {
          employeeId: emp.id,
          month,
          year: 2025,
          basicPay: basic,
          grossSalary: gross,
          totalDeductions: deductions,
          netSalary: net,
          status: 'processed',
          paymentDate: rDate(`2025-${String(month).padStart(2, '0')}-28`),
        },
      });
    }
  }
  console.log('✅ Payroll: 3 months × 10 employees');

  // ── 13. Performance Reviews ────────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const reviewer = employees[8 + (i % 3)];
    const reviewee = employees[i];
    await db.performanceReview.upsert({
      where: { id: `pr-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `pr-${String(i + 1).padStart(3, '0')}`,
        reviewerId: reviewer.id,
        revieweeId: reviewee.id,
        rating: 3 + (i % 3),
        comments: ['Consistently delivers quality work', 'Needs improvement in time management', 'Excellent team player', 'Good technical skills'][i % 4],
        status: i < 5 ? 'completed' : 'pending',
      },
    });
  }
  console.log('✅ Performance Reviews: 8');

  // ── 14. Goals ──────────────────────────────────────────────────────────────
  for (let i = 0; i < 10; i++) {
    const emp = employees[i];
    await db.goal.upsert({
      where: { id: `goal-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `goal-${String(i + 1).padStart(3, '0')}`,
        title: ['Improve code quality', 'Complete certification', 'Lead a project', 'Reduce bug rate', 'Mentor junior devs', 'Improve sprint velocity', 'Learn new framework', 'Improve documentation', 'Build automation tools', 'Enhance testing coverage'][i],
        description: 'Annual goal for performance review cycle',
        type: i % 2 === 0 ? 'individual' : 'team',
        category: ['Technical', 'Professional Development', 'Leadership', 'Quality'][i % 4],
        progress: Math.min(100, (i + 1) * 15),
        status: ['not_started', 'in_progress', 'completed', 'in_progress'][i % 4],
        startDate: rDate('2025-01-01'),
        endDate: rDate('2025-12-31'),
        employeeId: emp.id,
      },
    });
  }
  console.log('✅ Goals: 10');

  // ── 15. Learning & Development ─────────────────────────────────────────────
  const courses = [
    { name: 'React Advanced Patterns', provider: 'Udemy', type: 'e_learning' },
    { name: 'AWS Solutions Architect', provider: 'AWS Training', type: 'certification' },
    { name: 'Leadership Essentials', provider: 'Coursera', type: 'e_learning' },
    { name: 'Data Science with Python', provider: 'edX', type: 'e_learning' },
    { name: 'Project Management Professional', provider: 'PMI', type: 'certification' },
    { name: 'DevOps CI/CD Pipeline', provider: 'LinkedIn Learning', type: 'e_learning' },
    { name: 'Machine Learning Fundamentals', provider: 'Google', type: 'e_learning' },
    { name: 'Scrum Master Certification', provider: 'Scrum Alliance', type: 'certification' },
    { name: 'Cloud Security', provider: 'CompTIA', type: 'certification' },
    { name: 'Communication Skills', provider: 'Harvard ManageMentor', type: 'workshop' },
  ];

  for (let i = 0; i < courses.length; i++) {
    for (let eIdx = 0; eIdx < 2; eIdx++) {
      const emp = employees[(i + eIdx) % employees.length];
      await db.learningRecord.upsert({
        where: { id: `lr-${String(i * 2 + eIdx + 1).padStart(3, '0')}` },
        update: {},
        create: {
          id: `lr-${String(i * 2 + eIdx + 1).padStart(3, '0')}`,
          courseName: courses[i].name,
          provider: courses[i].provider,
          type: courses[i].type,
          status: eIdx === 0 ? 'completed' : 'enrolled',
          completedAt: eIdx === 0 ? daysAgo(10 + i) : null,
          score: eIdx === 0 ? 75 + (i * 2) % 25 : null,
          certificate: eIdx === 0 && courses[i].type === 'certification' ? `cert-${nanoid(8)}` : null,
          employeeId: emp.id,
        },
      });
    }
  }
  console.log('✅ Learning Records: 20');

  // ── 16. AI Interview Data ──────────────────────────────────────────────────
  const jobs = [
    { title: 'Senior Full-Stack Developer', department: 'Engineering', location: 'Bangalore', experienceMin: 5, experienceMax: 8, salaryMin: 1500000, salaryMax: 2500000, status: 'open', priority: 'high' },
    { title: 'Product Designer', department: 'Design', location: 'Mumbai', experienceMin: 3, experienceMax: 6, salaryMin: 1000000, salaryMax: 1800000, status: 'open', priority: 'medium' },
    { title: 'Data Scientist', department: 'Engineering', location: 'Hyderabad', experienceMin: 4, experienceMax: 7, salaryMin: 1800000, salaryMax: 3000000, status: 'open', priority: 'high' },
  ];

  const createdJobs = [];
  for (let i = 0; i < jobs.length; i++) {
    const job = await db.job.upsert({
      where: { id: `ai-job-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `ai-job-${String(i + 1).padStart(3, '0')}`,
        ...jobs[i],
        description: `We are looking for a ${jobs[i].title} to join our team.`,
        requirements: JSON.stringify(['Problem solving', 'Team collaboration', 'Communication', 'Technical expertise']),
        employmentType: 'Full-time',
        positions: 2,
        postedDate: rNow(),
        companyId: company.id,
      },
    });
    createdJobs.push(job);
  }

  const candidates = [
    { fn: 'Rahul', ln: 'Verma', email: 'rahul.verma@email.com', phone: '+91-9988776655', currentCompany: 'Infosys', currentTitle: 'Senior Developer', experience: 6, status: 'interviewing' },
    { fn: 'Sneha', ln: 'Kapoor', email: 'sneha.kapoor@email.com', phone: '+91-9988776656', currentCompany: 'TCS', currentTitle: 'UI Designer', experience: 4, status: 'shortlisted' },
    { fn: 'Vikram', ln: 'Malhotra', email: 'vikram.malhotra@email.com', phone: '+91-9988776657', currentCompany: 'Wipro', currentTitle: 'Data Engineer', experience: 5, status: 'applied' },
    { fn: 'Anita', ln: 'Bose', email: 'anita.bose@email.com', phone: '+91-9988776658', currentCompany: 'Accenture', currentTitle: 'Tech Lead', experience: 7, status: 'offered' },
    { fn: 'Deepak', ln: 'Chopra', email: 'deepak.chopra@email.com', phone: '+91-9988776659', currentCompany: 'Cognizant', currentTitle: 'ML Engineer', experience: 3, status: 'interviewing' },
  ];

  const createdCandidates = [];
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const candidate = await db.candidate.upsert({
      where: { id: `ai-cand-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `ai-cand-${String(i + 1).padStart(3, '0')}`,
        firstName: c.fn,
        lastName: c.ln,
        email: c.email,
        phone: c.phone,
        currentCompany: c.currentCompany,
        currentTitle: c.currentTitle,
        experience: c.experience,
        status: c.status,
        source: 'ai-portal',
        aiScore: 70 + (i * 5) % 25,
        skillMatch: 75 + (i * 3) % 20,
        cultureFitScore: 80 + (i * 2) % 15,
        jobId: createdJobs[i % createdJobs.length].id,
      },
    });
    createdCandidates.push(candidate);
  }

  // AI Interview records
  const interviewQuestions = [
    { question: 'Tell us about a challenging project you led recently.', category: 'experience', type: 'behavioral' },
    { question: 'How do you approach system design for high-traffic applications?', category: 'technical', type: 'technical' },
    { question: 'Describe your experience with microservices architecture.', category: 'technical', type: 'technical' },
    { question: 'How do you handle conflicts within your team?', category: 'communication', type: 'behavioral' },
    { question: 'What is your approach to debugging production issues?', category: 'problem-solving', type: 'technical' },
    { question: 'How do you stay updated with the latest industry trends?', category: 'culture-fit', type: 'behavioral' },
    { question: 'Describe a time when you had to make a difficult technical decision.', category: 'problem-solving', type: 'behavioral' },
    { question: 'What are your salary expectations and availability?', category: 'logistics', type: 'logistics' },
  ];

  // Completed interviews
  for (let i = 0; i < 2; i++) {
    const scores = [75 + i * 10, 80 + i * 5, 70 + i * 8, 85 + i * 3, 65 + i * 12, 78 + i * 7, 72 + i * 9, 82 + i * 4];
    const responses = interviewQuestions.map((q, idx) => ({
      question: q.question,
      answer: `This is a sample response for question ${idx + 1}. The candidate demonstrated strong ${q.category} skills.`,
      score: scores[idx],
      duration: 60 + Math.floor(Math.random() * 120),
    }));
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const feedback = {
      overallScore,
      categoryScores: {
        technical: Math.round((scores[1] + scores[2] + scores[4]) / 3),
        communication: scores[3],
        problemSolving: Math.round((scores[4] + scores[6]) / 2),
        cultureFit: scores[5],
      },
      strengths: ['Strong technical foundation', 'Good communication skills', 'Problem-solving ability'],
      weaknesses: ['Could improve system design skills', 'Limited cloud experience'],
      recommendation: overallScore >= 75 ? 'proceed' : 'reject',
    };

    await db.aIInterview.upsert({
      where: { id: `ai-int-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `ai-int-${String(i + 1).padStart(3, '0')}`,
        candidateId: createdCandidates[i].id,
        jobId: createdJobs[i].id,
        status: 'completed',
        questions: JSON.stringify(interviewQuestions),
        responses: JSON.stringify(responses),
        score: overallScore,
        feedback: JSON.stringify(feedback),
        language: 'en',
        interviewLink: `/interview/sample-${i + 1}`,
        resumeUrl: createdCandidates[i].resume,
        cheatingSignals: JSON.stringify([]),
        cvScore: 70 + i * 12,
        transcript: `Interview transcript for candidate ${createdCandidates[i].firstName}...`,
        duration: 25 + i * 10,
        startedAt: daysAgo(5 - i),
        completedAt: daysAgo(4 - i),
      },
    });
  }

  // In-progress interview
  await db.aIInterview.upsert({
    where: { id: 'ai-int-003' },
    update: {},
    create: {
      id: 'ai-int-003',
      candidateId: createdCandidates[2].id,
      jobId: createdJobs[2].id,
      status: 'in_progress',
      questions: JSON.stringify(interviewQuestions),
      responses: JSON.stringify(interviewQuestions.slice(0, 3).map((q, idx) => ({
        question: q.question,
        answer: `Partial response ${idx + 1}...`,
        score: 70 + idx * 5,
        duration: 90,
      }))),
      score: null,
      feedback: null,
      language: 'en',
      interviewLink: `/interview/sample-3`,
      resumeUrl: createdCandidates[2].resume,
      cheatingSignals: JSON.stringify([]),
      cvScore: 72,
      duration: null,
      startedAt: daysAgo(1),
    },
  });

  // Scheduled interviews
  for (let i = 3; i < 5; i++) {
    await db.aIInterview.upsert({
      where: { id: `ai-int-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `ai-int-${String(i + 1).padStart(3, '0')}`,
        candidateId: createdCandidates[i].id,
        jobId: createdJobs[i % createdJobs.length].id,
        status: 'scheduled',
        questions: JSON.stringify(interviewQuestions),
        responses: JSON.stringify([]),
        score: null,
        feedback: null,
        language: 'en',
        interviewLink: `/interview/sample-${i + 1}`,
        resumeUrl: createdCandidates[i].resume,
        cvScore: 68 + i * 3,
        duration: null,
      },
    });
  }
  console.log('✅ AI Interviews: 5');

  // ── 17. Clients ──────────────────────────────────────────────────────────
  const clientData = [
    { name: 'TechCorp Solutions', email: 'contact@techcorp.com', phone: '+1-555-0101', industry: 'Technology', status: 'active' },
    { name: 'Global Finance Ltd', email: 'info@globalfin.com', phone: '+1-555-0102', industry: 'Finance', status: 'active' },
    { name: 'HealthFirst Inc', email: 'hello@healthfirst.com', phone: '+1-555-0103', industry: 'Healthcare', status: 'active' },
    { name: 'EduLearn Academy', email: 'admin@edulearn.com', phone: '+1-555-0104', industry: 'Education', status: 'inactive' },
    { name: 'RetailMax Group', email: 'partnerships@retailmax.com', phone: '+1-555-0105', industry: 'Retail', status: 'active' },
  ];
  for (let i = 0; i < clientData.length; i++) {
    await db.client.upsert({
      where: { id: `client-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `client-${String(i + 1).padStart(3, '0')}`,
        ...clientData[i],
        clientCompany: clientData[i].name,
        contractStart: rDate('2024-01-01'),
        contractEnd: rDate('2025-12-31'),
        companyId: company.id,
      },
    });
  }
  console.log('✅ Clients: 5');

  // ── 18. Vendors & SubVendors ──────────────────────────────────────────────
  const vendorData = [
    { name: 'TalentHunt Agency', email: 'hr@talenthunt.com', vendorCompany: 'TalentHunt Pvt Ltd', serviceType: 'Recruitment', status: 'active', rating: 4.5 },
    { name: 'StaffPro Solutions', email: 'info@staffpro.com', vendorCompany: 'StaffPro Inc', serviceType: 'Staffing', status: 'active', rating: 4.0 },
    { name: 'VerifyRight BGV', email: 'verify@verifyright.com', vendorCompany: 'VerifyRight Services', serviceType: 'Background Verification', status: 'active', rating: 4.8 },
    { name: 'CloudHost Services', email: 'support@cloudhost.com', vendorCompany: 'CloudHost Technologies', serviceType: 'IT Infrastructure', status: 'active', rating: 3.5 },
    { name: 'SecureIT Solutions', email: 'contact@secureit.com', vendorCompany: 'SecureIT Systems', serviceType: 'Cybersecurity', status: 'inactive', rating: 3.8 },
  ];

  const createdVendors = [];
  for (let i = 0; i < vendorData.length; i++) {
    const v = await db.vendor.upsert({
      where: { id: `vendor-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `vendor-${String(i + 1).padStart(3, '0')}`,
        ...vendorData[i],
        companyId: company.id,
      },
    });
    createdVendors.push(v);

    // Sub-vendors
    await db.subVendor.upsert({
      where: { id: `subvendor-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `subvendor-${String(i + 1).padStart(3, '0')}`,
        name: `${vendorData[i].name} - Partner`,
        email: `partner@${vendorData[i].email.split('@')[1]}`,
        phone: '+91-9988776600',
        company: `${vendorData[i].vendorCompany} Associates`,
        status: 'active',
        vendorId: v.id,
      },
    });
  }
  console.log('✅ Vendors: 5, SubVendors: 5');

  // ── 19. Projects ──────────────────────────────────────────────────────────
  const projectData = [
    { name: 'HRMS 2.0 Redesign', description: 'Complete redesign of HRMS platform', status: 'in_progress', priority: 'high', startDate: rDate('2025-01-15'), endDate: rDate('2025-06-30'), budget: 5000000, progress: 45 },
    { name: 'Mobile App Development', description: 'Native mobile app for HRMS', status: 'planning', priority: 'high', startDate: rDate('2025-03-01'), endDate: rDate('2025-09-30'), budget: 3000000, progress: 10 },
    { name: 'AI Chatbot Integration', description: 'AI-powered HR assistant chatbot', status: 'completed', priority: 'medium', startDate: rDate('2024-10-01'), endDate: rDate('2025-02-28'), budget: 1500000, progress: 100 },
    { name: 'Data Analytics Dashboard', description: 'Advanced analytics and reporting', status: 'in_progress', priority: 'medium', startDate: rDate('2025-02-01'), endDate: rDate('2025-07-31'), budget: 2000000, progress: 30 },
    { name: 'Payroll Automation', description: 'Automated payroll processing', status: 'planning', priority: 'low', startDate: rDate('2025-04-01'), endDate: rDate('2025-08-31'), budget: 1000000, progress: 5 },
  ];

  for (let i = 0; i < projectData.length; i++) {
    const project = await db.project.upsert({
      where: { id: `proj-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `proj-${String(i + 1).padStart(3, '0')}`,
        ...projectData[i],
        companyId: company.id,
        createdBy: employees[0].id,
      },
    });

    // Add project members
    for (let m = 0; m < 3; m++) {
      try {
        await db.projectMember.create({
          data: {
            role: m === 0 ? 'lead' : 'member',
            projectId: project.id,
            employeeId: employees[(i + m) % employees.length].id,
          },
        });
      } catch { /* Already exists */ }
    }

    // Add milestone
    await db.projectMilestone.upsert({
      where: { id: `pm-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `pm-${String(i + 1).padStart(3, '0')}`,
        name: `Phase 1 Completion`,
        description: `Complete first phase of ${projectData[i].name}`,
        dueDate: rDate('2025-04-30'),
        status: i === 2 ? 'completed' : 'pending',
        projectId: project.id,
      },
    });
  }
  console.log('✅ Projects: 5');

  // ── 20. Notifications ─────────────────────────────────────────────────────
  const notifications = [
    { title: 'Leave Approved', message: 'Your casual leave for Feb 15-16 has been approved', type: 'success', category: 'leave' },
    { title: 'New Task Assigned', message: 'You have been assigned a new task: Build dashboard UI', type: 'info', category: 'task' },
    { title: 'Payslip Generated', message: 'Your payslip for January 2025 is ready for download', type: 'info', category: 'payroll' },
    { title: 'Password Expiry', message: 'Your password will expire in 7 days. Please change it.', type: 'warning', category: 'security' },
    { title: 'Interview Scheduled', message: 'AI Interview scheduled for tomorrow at 10:00 AM', type: 'info', category: 'recruitment' },
  ];
  for (let i = 0; i < notifications.length; i++) {
    await db.notification.upsert({
      where: { id: `notif-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `notif-${String(i + 1).padStart(3, '0')}`,
        ...notifications[i],
        isRead: i < 3,
        userId: adminUser.id,
      },
    });
  }
  console.log('✅ Notifications: 5');

  // ── 21. Helpdesk Tickets ───────────────────────────────────────────────────
  const tickets = [
    { subject: 'Cannot access VPN', category: 'IT', priority: 'high', status: 'open' },
    { subject: 'Leave balance incorrect', category: 'HR', priority: 'medium', status: 'in_progress' },
    { subject: 'Payroll discrepancy', category: 'Finance', priority: 'high', status: 'resolved' },
    { subject: 'Laptop screen flickering', category: 'IT', priority: 'low', status: 'open' },
    { subject: 'Missing onboarding documents', category: 'HR', priority: 'medium', status: 'closed' },
  ];
  for (let i = 0; i < tickets.length; i++) {
    await db.ticket.upsert({
      where: { id: `ticket-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `ticket-${String(i + 1).padStart(3, '0')}`,
        subject: tickets[i].subject,
        description: `Detailed description for: ${tickets[i].subject}`,
        category: tickets[i].category,
        priority: tickets[i].priority,
        status: tickets[i].status,
        resolution: tickets[i].status === 'resolved' || tickets[i].status === 'closed' ? 'Issue resolved by support team' : null,
        employeeId: employees[i % employees.length].id,
      },
    });
  }
  console.log('✅ Tickets: 5');

  // ── 22. Audit Logs ────────────────────────────────────────────────────────
  const auditActions = [
    { action: 'LOGIN', entity: 'Auth', details: 'User logged in from Chrome/Windows' },
    { action: 'CREATE', entity: 'Employee', details: 'Created employee record for Rohan Joshi' },
    { action: 'UPDATE', entity: 'Leave', details: 'Approved leave application LV-003' },
    { action: 'DELETE', entity: 'Asset', details: 'Retired laptop AST-045' },
    { action: 'EXPORT', entity: 'Payroll', details: 'Monthly payroll report exported' },
    { action: 'UPDATE', entity: 'RBAC', details: 'Modified permissions for Manager role' },
    { action: 'CREATE', entity: 'Policy', details: 'Created new WFH policy document' },
    { action: 'LOGIN', entity: 'Auth', details: 'Failed login attempt (3rd) for user test@marqai.tech' },
    { action: 'PROCESS', entity: 'Payroll', details: 'Payroll processing initiated for March 2025' },
    { action: 'CREATE', entity: 'Helpdesk', details: 'Raised helpdesk ticket HD-2025-008' },
    { action: 'CHECK_IN', entity: 'Attendance', details: 'Check-in recorded with GPS location' },
    { action: 'UPDATE', entity: 'Profile', details: 'Updated emergency contact information' },
  ];
  for (let i = 0; i < auditActions.length; i++) {
    await db.auditLog.upsert({
      where: { id: `audit-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `audit-${String(i + 1).padStart(3, '0')}`,
        ...auditActions[i],
        userId: i % 3 === 0 ? adminUser.id : null,
        ipAddress: `192.168.1.${100 + i}`,
        module: auditActions[i].entity,
        createdAt: daysAgo(i),
      },
    });
  }
  console.log('✅ Audit Logs: 12');

  // ── 23. Workflow Definitions ───────────────────────────────────────────────
  const workflowDefs = [
    { name: 'Leave Approval Workflow', type: 'approval', entity: 'Leave', description: 'Standard leave approval process' },
    { name: 'Expense Approval Workflow', type: 'approval', entity: 'Expense', description: 'Expense claim approval process' },
    { name: 'Purchase Order Workflow', type: 'approval', entity: 'PurchaseOrder', description: 'Purchase order approval process' },
  ];

  for (let i = 0; i < workflowDefs.length; i++) {
    const wf = await db.workflowDefinition.upsert({
      where: { id: `wf-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `wf-${String(i + 1).padStart(3, '0')}`,
        ...workflowDefs[i],
        isActive: true,
        companyId: company.id,
      },
    });

    // Add steps
    await db.workflowStepDef.upsert({ where: { id: `wfs-${i + 1}-1` }, update: {}, create: { id: `wfs-${i + 1}-1`, name: 'Manager Approval', stepOrder: 1, approverRole: 'manager', workflowDefId: wf.id } });
    await db.workflowStepDef.upsert({ where: { id: `wfs-${i + 1}-2` }, update: {}, create: { id: `wfs-${i + 1}-2`, name: 'HR Approval', stepOrder: 2, approverRole: 'hr', workflowDefId: wf.id } });
    await db.workflowStepDef.upsert({ where: { id: `wfs-${i + 1}-3` }, update: {}, create: { id: `wfs-${i + 1}-3`, name: 'Finance Approval', stepOrder: 3, approverRole: 'finance', autoApprove: i === 2, workflowDefId: wf.id } });
  }
  console.log('✅ Workflow Definitions: 3');

  // ── 24. Onboarding Tasks ──────────────────────────────────────────────────
  const onboardingTasks = [
    { title: 'Complete IT Setup', category: 'IT', description: 'Set up laptop, email, VPN access' },
    { title: 'HR Documentation', category: 'HR', description: 'Complete joining formalities and document submission' },
    { title: 'Team Introduction', category: 'General', description: 'Meet the team and understand team structure' },
    { title: 'Policy Review', category: 'Compliance', description: 'Review and acknowledge company policies' },
    { title: 'First Week Check-in', category: 'HR', description: 'First week feedback and support check' },
  ];
  for (let i = 0; i < onboardingTasks.length; i++) {
    await db.onboardingTask.upsert({
      where: { id: `ob-task-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `ob-task-${String(i + 1).padStart(3, '0')}`,
        ...onboardingTasks[i],
        status: i < 2 ? 'completed' : 'pending',
        dueDate: daysFromNow(7),
        completedAt: i < 2 ? daysAgo(3) : null,
        employeeId: employees[0].id,
      },
    });
  }
  console.log('✅ Onboarding Tasks: 5');

  // ── 25. Shifts ────────────────────────────────────────────────────────────
  const shifts = [
    { name: 'General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
    { name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakMinutes: 45 },
    { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakMinutes: 45 },
    { name: 'Night Shift', startTime: '22:00', endTime: '06:00', breakMinutes: 45 },
  ];
  for (let i = 0; i < shifts.length; i++) {
    await db.shift.upsert({
      where: { id: `shift-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `shift-${String(i + 1).padStart(3, '0')}`,
        ...shifts[i],
        isActive: true,
        companyId: company.id,
      },
    });
  }
  console.log('✅ Shifts: 4');

  // ── 26. Leave Policies ────────────────────────────────────────────────────
  const leavePolicyData = [
    { name: 'Casual Leave', type: 'casual', totalDays: 12, carryForward: true, maxCarryDays: 3, isPaid: true },
    { name: 'Sick Leave', type: 'sick', totalDays: 10, carryForward: false, maxCarryDays: 0, isPaid: true },
    { name: 'Earned Leave', type: 'earned', totalDays: 15, carryForward: true, maxCarryDays: 5, isPaid: true },
    { name: 'Maternity Leave', type: 'maternity', totalDays: 182, carryForward: false, maxCarryDays: 0, isPaid: true },
    { name: 'Paternity Leave', type: 'paternity', totalDays: 15, carryForward: false, maxCarryDays: 0, isPaid: true },
    { name: 'Compensatory Off', type: 'comp_off', totalDays: 0, carryForward: false, maxCarryDays: 0, isPaid: true },
    { name: 'Loss of Pay', type: 'lop', totalDays: 0, carryForward: false, maxCarryDays: 0, isPaid: false },
  ];
  for (let i = 0; i < leavePolicyData.length; i++) {
    await db.leavePolicy.upsert({
      where: { id: `lp-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `lp-${String(i + 1).padStart(3, '0')}`,
        ...leavePolicyData[i],
        companyId: company.id,
      },
    });
  }
  console.log('✅ Leave Policies: 7');

  // ── 27. Skills ────────────────────────────────────────────────────────────
  const skills = [
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Machine Learning', category: 'AI/ML' },
    { name: 'GraphQL', category: 'API' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'Figma', category: 'Design' },
    { name: 'Agile/Scrum', category: 'Methodology' },
    { name: 'Project Management', category: 'Management' },
    { name: 'Data Analysis', category: 'Analytics' },
    { name: 'Cybersecurity', category: 'Security' },
  ];
  for (let i = 0; i < skills.length; i++) {
    await db.skill.upsert({
      where: { id: `skill-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `skill-${String(i + 1).padStart(3, '0')}`,
        name: skills[i].name,
        category: skills[i].category,
      },
    });
  }
  console.log('✅ Skills: 15');

  // ── 28. Compliance Items ──────────────────────────────────────────────────
  const complianceItems = [
    { title: 'GDPR Compliance', category: 'Data Privacy', status: 'compliant', dueDate: rDate('2025-08-15') },
    { title: 'PF/ESI Returns Filing', category: 'Statutory', status: 'compliant', dueDate: rDate('2025-07-01') },
    { title: 'Document Expiry Tracking', category: 'Documentation', status: 'pending', dueDate: rDate('2025-06-01') },
    { title: 'POSH Compliance', category: 'Workplace Safety', status: 'compliant', dueDate: rDate('2025-12-31') },
    { title: 'Data Retention Policy Review', category: 'Data Privacy', status: 'pending', dueDate: rDate('2025-06-15') },
  ];
  for (let i = 0; i < complianceItems.length; i++) {
    await db.complianceItem.upsert({
      where: { id: `comp-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `comp-${String(i + 1).padStart(3, '0')}`,
        title: complianceItems[i].title,
        category: complianceItems[i].category,
        status: complianceItems[i].status,
        dueDate: complianceItems[i].dueDate,
        assignee: employees[i % employees.length].id,
        companyId: company.id,
      },
    });
  }
  console.log('✅ Compliance Items: 5');

  // ── 29. Helpdesk Enhanced Tickets ─────────────────────────────────────────
  const helpdeskTickets = [
    { ticketId: 'HD-2025-001', category: 'IT', subCategory: 'Hardware', priority: 'high', subject: 'Laptop not booting', status: 'open' },
    { ticketId: 'HD-2025-002', category: 'HR', subCategory: 'Policy', priority: 'medium', subject: 'Leave policy clarification needed', status: 'resolved' },
    { ticketId: 'HD-2025-003', category: 'IT', subCategory: 'Software', priority: 'low', subject: 'Software installation request', status: 'in_progress' },
    { ticketId: 'HD-2025-004', category: 'Finance', subCategory: 'Reimbursement', priority: 'medium', subject: 'Travel reimbursement delayed', status: 'open' },
    { ticketId: 'HD-2025-005', category: 'Admin', subCategory: 'Facilities', priority: 'low', subject: 'Air conditioning not working', status: 'closed' },
  ];
  for (let i = 0; i < helpdeskTickets.length; i++) {
    await db.helpdeskTicket.upsert({
      where: { id: `hdt-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `hdt-${String(i + 1).padStart(3, '0')}`,
        ...helpdeskTickets[i],
        description: `Detailed description for: ${helpdeskTickets[i].subject}`,
        resolution: helpdeskTickets[i].status === 'resolved' || helpdeskTickets[i].status === 'closed' ? 'Issue resolved by support team' : null,
        companyId: company.id,
      },
    });
  }
  console.log('✅ Helpdesk Tickets: 5');

  // ── 30. RBAC Roles ────────────────────────────────────────────────────────
  const roles = [
    { name: 'admin', description: 'System Administrator', isSystem: true },
    { name: 'hr', description: 'HR Manager', isSystem: true },
    { name: 'manager', description: 'Department Manager', isSystem: false },
    { name: 'employee', description: 'Regular Employee', isSystem: true },
    { name: 'recruiter', description: 'Recruitment Specialist', isSystem: false },
    { name: 'payroll', description: 'Payroll Admin', isSystem: false },
  ];
  for (let i = 0; i < roles.length; i++) {
    const role = await db.role.upsert({
      where: { id: `role-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `role-${String(i + 1).padStart(3, '0')}`,
        name: roles[i].name,
        description: roles[i].description,
        isSystem: roles[i].isSystem,
        companyId: company.id,
      },
    });

    // Add basic permissions
    const modules = ['dashboard', 'employees', 'leave', 'attendance', 'payroll', 'performance'];
    for (const mod of modules) {
      await db.rolePermission.upsert({
        where: { id: `rp-${role.id}-${mod}` },
        update: {},
        create: {
          id: `rp-${role.id}-${mod}`,
          roleId: role.id,
          module: mod,
          canRead: true,
          canWrite: roles[i].name === 'admin' || roles[i].name === 'hr',
          canDelete: roles[i].name === 'admin',
          canExport: roles[i].name === 'admin' || roles[i].name === 'hr',
        },
      });
    }
  }
  console.log('✅ RBAC Roles: 6');

  // ── 31. Timesheets ────────────────────────────────────────────────────────
  for (let week = 0; week < 2; week++) {
    for (let eIdx = 0; eIdx < 5; eIdx++) {
      const emp = employees[eIdx];
      const weekStart = daysAgo((week + 1) * 7);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 4); // Friday

      const ts = await db.timesheet.upsert({
        where: { id: `ts-${week}-${eIdx}` },
        update: {},
        create: {
          id: `ts-${week}-${eIdx}`,
          employeeId: emp.id,
          weekStart: weekStart,
          weekEnd: weekEnd,
          totalHours: 40 - (week * 2),
          status: week === 1 ? 'approved' : 'submitted',
          approvedBy: week === 1 ? employees[8].id : null,
          approvedAt: week === 1 ? daysAgo(3) : null,
        },
      });

      // Add entries for each day
      for (let day = 0; day < 5; day++) {
        const entryDate = new Date(weekStart);
        entryDate.setDate(entryDate.getDate() + day);
        await db.timesheetEntry.upsert({
          where: { id: `tse-${week}-${eIdx}-${day}` },
          update: {},
          create: {
            id: `tse-${week}-${eIdx}-${day}`,
            timesheetId: ts.id,
            date: entryDate,
            hours: 8 - (day === 4 ? 1 : 0),
            project: projectData[eIdx % projectData.length].name,
            task: 'Development & meetings',
          },
        });
      }
    }
  }
  console.log('✅ Timesheets: 2 weeks × 5 employees');

  // ── 32. Performance Records ───────────────────────────────────────────────
  for (let i = 0; i < 10; i++) {
    await db.performance.upsert({
      where: { id: `perf-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        id: `perf-${String(i + 1).padStart(3, '0')}`,
        employeeId: employees[i].id,
        reviewPeriod: 'Q1 2025',
        reviewerId: employees[8 + (i % 3)].id,
        rating: 3 + (i % 3),
        objectives: 'Deliver project milestones on time',
        achievements: 'Successfully completed 2 major deliverables',
        feedback: 'Strong technical skills, needs improvement in communication',
        selfReview: 'Contributed to team goals and mentored junior developers',
        goals: 'Lead a project team in Q2',
        attritionRisk: i === 3 ? 0.7 : 0.1 + (i % 5) * 0.05,
        status: i < 7 ? 'completed' : 'draft',
      },
    });
  }
  console.log('✅ Performance Records: 10');

  // ── 33. Employee Skills ───────────────────────────────────────────────────
  const skillIds = (await db.skill.findMany()).map(s => s.id);
  for (let i = 0; i < Math.min(employees.length, 15); i++) {
    for (let s = 0; s < 3; s++) {
      const skillId = skillIds[(i * 3 + s) % skillIds.length];
      try {
        await db.employeeSkill.create({
          data: {
            employeeId: employees[i].id,
            skillId: skillId,
            proficiency: ['beginner', 'intermediate', 'advanced', 'expert'][s % 4],
            yearsExp: 1 + (s * 2),
          },
        });
      } catch { /* Already exists */ }
    }
  }
  console.log('✅ Employee Skills linked');

  // ── 34. Link admin user to first employee ─────────────────────────────────
  await db.employee.update({
    where: { id: employees[0].id },
    data: { userId: adminUser.id },
  });
  console.log('✅ Admin user linked to EMP001');

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n🎉 Comprehensive seed completed successfully!');
  console.log('📊 Summary:');
  console.log('   Company: 1');
  console.log('   Branches: 5');
  console.log('   Departments: 10');
  console.log('   Employees: 25');
  console.log('   Policies: 10');
  console.log('   Assets: 30');
  console.log('   Documents: 20');
  console.log('   Tasks: 20');
  console.log('   Attendance: 30 days');
  console.log('   Leaves: 15');
  console.log('   Payroll: 3 months');
  console.log('   Performance: 10');
  console.log('   Learning: 20 records');
  console.log('   AI Interviews: 5');
  console.log('   Clients: 5');
  console.log('   Vendors: 5 + 5 sub-vendors');
  console.log('   Projects: 5');
  console.log('   Notifications: 5');
  console.log('   Tickets: 5 + 5 helpdesk');
  console.log('   Audit Logs: 12');
  console.log('   Workflows: 3');
  console.log('   Onboarding: 5');
  console.log('   Shifts: 4');
  console.log('   Leave Policies: 7');
  console.log('   Skills: 15');
  console.log('   Compliance: 5');
  console.log('   Timesheets: 10');
  console.log('   RBAC Roles: 6');

  await db.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
