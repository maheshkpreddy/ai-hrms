import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ==================== HELPER UTILITIES ====================

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ==================== COMPREHENSIVE DATA DEFINITIONS ====================

const EMPLOYEE_NAMES = [
  { firstName: 'Vikram', lastName: 'Mehta' }, { firstName: 'Ananya', lastName: 'Reddy' },
  { firstName: 'Rohit', lastName: 'Gupta' }, { firstName: 'Deepa', lastName: 'Nair' },
  { firstName: 'Suresh', lastName: 'Iyer' }, { firstName: 'Kavitha', lastName: 'Raman' },
  { firstName: 'Manish', lastName: 'Tiwari' }, { firstName: 'Shreya', lastName: 'Mukherjee' },
  { firstName: 'Arun', lastName: 'Desai' }, { firstName: 'Pooja', lastName: 'Joshi' },
  { firstName: 'Nikhil', lastName: 'Bhat' }, { firstName: 'Meera', lastName: 'Krishnan' },
  { firstName: 'Sanjay', lastName: 'Rao' }, { firstName: 'Divya', lastName: 'Saxena' },
  { firstName: 'Amit', lastName: 'Verma' }, { firstName: 'Swati', lastName: 'Pillai' },
  { firstName: 'Ravi', lastName: 'Shankar' }, { firstName: 'Neha', lastName: 'Chopra' },
  { firstName: 'Kiran', lastName: 'Patil' }, { firstName: 'Sunita', lastName: 'Agarwal' },
  { firstName: 'James', lastName: 'Wilson' }, { firstName: 'Olivia', lastName: 'Martinez' },
  { firstName: 'Liam', lastName: "O'Brien" }, { firstName: 'Sophia', lastName: 'Kim' },
  { firstName: 'Noah', lastName: 'Fischer' }, { firstName: 'Emma', lastName: 'Johansson' },
  { firstName: 'Lucas', lastName: 'Dubois' }, { firstName: 'Mia', lastName: 'Rossi' },
  { firstName: 'Ethan', lastName: 'Nakamura' }, { firstName: 'Ava', lastName: 'Thompson' },
  { firstName: 'Daniel', lastName: 'Santos' }, { firstName: 'Isabella', lastName: 'Müller' },
  { firstName: 'Alexander', lastName: 'Petrov' }, { firstName: 'Charlotte', lastName: 'Andersen' },
  { firstName: 'Benjamin', lastName: 'Hoffman' }, { firstName: 'Amelia', lastName: 'Larsson' },
  { firstName: 'Henry', lastName: 'Weber' }, { firstName: 'Harper', lastName: 'Tan' },
  { firstName: 'Sebastian', lastName: 'Lopez' }, { firstName: 'Chloe', lastName: 'Van Berg' },
  { firstName: 'Rahul', lastName: 'Kapoor' }, { firstName: 'Fatima', lastName: 'Khan' },
  { firstName: 'Chen', lastName: 'Wei' }, { firstName: 'Yuki', lastName: 'Sato' },
  { firstName: 'Kwame', lastName: 'Asante' }, { firstName: 'Ingrid', lastName: 'Bergström' },
  { firstName: 'Hans', lastName: 'Gruber' }, { firstName: 'Priya', lastName: 'Dasgupta' },
  { firstName: 'Tariq', lastName: 'Hussain' }, { firstName: 'Maria', lastName: 'Gonzalez' },
];

const DESIGNATIONS: Record<string, { title: string; jobTitle: string; salaryRange: [number, number] }[]> = {
  ENG: [
    { title: 'Software Engineer', jobTitle: 'SDE-II', salaryRange: [800000, 1500000] },
    { title: 'Senior Software Engineer', jobTitle: 'SDE-III', salaryRange: [1500000, 2500000] },
    { title: 'Tech Lead', jobTitle: 'Lead Engineer', salaryRange: [2500000, 4000000] },
    { title: 'Full Stack Developer', jobTitle: 'Full Stack Dev', salaryRange: [700000, 1400000] },
    { title: 'Backend Developer', jobTitle: 'Backend Dev', salaryRange: [700000, 1300000] },
    { title: 'Frontend Developer', jobTitle: 'Frontend Dev', salaryRange: [600000, 1200000] },
    { title: 'DevOps Engineer', jobTitle: 'DevOps Eng', salaryRange: [900000, 1800000] },
    { title: 'QA Engineer', jobTitle: 'QA Eng', salaryRange: [500000, 1000000] },
  ],
  HR: [
    { title: 'HR Executive', jobTitle: 'HR Exec', salaryRange: [400000, 700000] },
    { title: 'HR Manager', jobTitle: 'HR Manager', salaryRange: [800000, 1500000] },
    { title: 'Talent Acquisition Specialist', jobTitle: 'TA Specialist', salaryRange: [500000, 900000] },
    { title: 'HR Business Partner', jobTitle: 'HRBP', salaryRange: [1000000, 1800000] },
  ],
  DSG: [
    { title: 'UI Designer', jobTitle: 'UI Designer', salaryRange: [500000, 1000000] },
    { title: 'UX Designer', jobTitle: 'UX Designer', salaryRange: [600000, 1200000] },
    { title: 'Product Designer', jobTitle: 'Product Designer', salaryRange: [700000, 1400000] },
  ],
  FIN: [
    { title: 'Accountant', jobTitle: 'Accountant', salaryRange: [400000, 700000] },
    { title: 'Finance Analyst', jobTitle: 'Fin Analyst', salaryRange: [600000, 1100000] },
    { title: 'Finance Manager', jobTitle: 'Fin Manager', salaryRange: [1000000, 1800000] },
  ],
  OPS: [
    { title: 'Operations Executive', jobTitle: 'Ops Executive', salaryRange: [400000, 700000] },
    { title: 'Operations Manager', jobTitle: 'Ops Manager', salaryRange: [800000, 1500000] },
    { title: 'Supply Chain Analyst', jobTitle: 'SC Analyst', salaryRange: [500000, 900000] },
  ],
  SAL: [
    { title: 'Sales Executive', jobTitle: 'Sales Exec', salaryRange: [400000, 800000] },
    { title: 'Account Manager', jobTitle: 'Account Mgr', salaryRange: [600000, 1200000] },
    { title: 'Sales Manager', jobTitle: 'Sales Mgr', salaryRange: [800000, 1600000] },
  ],
  QAT: [
    { title: 'Quality Inspector', jobTitle: 'QA Inspector', salaryRange: [350000, 600000] },
    { title: 'Quality Manager', jobTitle: 'QA Manager', salaryRange: [700000, 1200000] },
  ],
  PRD: [
    { title: 'Production Engineer', jobTitle: 'Prod Engineer', salaryRange: [400000, 700000] },
    { title: 'Production Manager', jobTitle: 'Prod Manager', salaryRange: [800000, 1500000] },
  ],
  CLI: [
    { title: 'Nurse Practitioner', jobTitle: 'NP', salaryRange: [35000, 55000] },
    { title: 'Clinical Research Coordinator', jobTitle: 'CRC', salaryRange: [30000, 50000] },
    { title: 'Healthcare Administrator', jobTitle: 'HC Admin', salaryRange: [35000, 60000] },
  ],
  ANA: [
    { title: 'Data Analyst', jobTitle: 'Data Analyst', salaryRange: [600000, 1100000] },
    { title: 'Data Scientist', jobTitle: 'Data Scientist', salaryRange: [1000000, 2000000] },
  ],
  RD: [
    { title: 'Research Scientist', jobTitle: 'Research Sci', salaryRange: [900000, 1800000] },
    { title: 'AI Engineer', jobTitle: 'AI Eng', salaryRange: [1000000, 2000000] },
    { title: 'ML Engineer', jobTitle: 'ML Eng', salaryRange: [900000, 1800000] },
  ],
  RET: [
    { title: 'Store Manager', jobTitle: 'Store Mgr', salaryRange: [30000, 50000] },
    { title: 'Regional Manager', jobTitle: 'Regional Mgr', salaryRange: [50000, 80000] },
    { title: 'Retail Operations Lead', jobTitle: 'Retail Ops Lead', salaryRange: [35000, 55000] },
  ],
  LOG: [
    { title: 'Fleet Coordinator', jobTitle: 'Fleet Coord', salaryRange: [40000, 65000] },
    { title: 'Warehouse Manager', jobTitle: 'Warehouse Mgr', salaryRange: [35000, 55000] },
    { title: 'Supply Chain Manager', jobTitle: 'SC Manager', salaryRange: [50000, 80000] },
  ],
  MKT: [
    { title: 'Marketing Executive', jobTitle: 'Mkt Exec', salaryRange: [500000, 900000] },
    { title: 'Content Strategist', jobTitle: 'Content Str', salaryRange: [600000, 1100000] },
    { title: 'Digital Marketing Manager', jobTitle: 'Digital Mkt Mgr', salaryRange: [800000, 1500000] },
  ],
};

const CITIES_INDIA = ['Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Delhi', 'Kolkata', 'Noida', 'Gurgaon', 'Ahmedabad'];
const CITIES_GLOBAL = ['San Francisco', 'New York', 'London', 'Berlin', 'Singapore', 'Tokyo', 'Sydney', 'Toronto'];
const PHONE_CODES: Record<string, string> = { IN: '+91', US: '+1', GB: '+44', DE: '+49', SG: '+65' };

const ASSET_TYPES = [
  { type: 'laptop', names: ['MacBook Pro 14"', 'MacBook Pro 16"', 'Dell XPS 15', 'ThinkPad X1 Carbon', 'HP EliteBook 840'] },
  { type: 'monitor', names: ['Dell UltraSharp 27"', 'LG 4K 27"', 'Samsung Curved 32"'] },
  { type: 'phone', names: ['iPhone 15 Pro', 'iPhone 14', 'Samsung Galaxy S24', 'Google Pixel 8'] },
  { type: 'tablet', names: ['iPad Pro 12.9"', 'iPad Air', 'Samsung Galaxy Tab S9'] },
  { type: 'headset', names: ['Jabra Evolve2 85', 'Poly Voyager Focus 2', 'Logitech Zone Wireless'] },
  { type: 'access_card', names: ['Access Card - Floor 3', 'Access Card - Floor 5', 'Parking Pass'] },
];

const LEAVE_TYPES = ['casual', 'sick', 'earned', 'maternity', 'paternity', 'comp_off'];
const LEAVE_REASONS = ['Personal work', 'Family emergency', 'Not feeling well', 'Doctor appointment', 'Family vacation', 'Religious festival', 'Home relocation', 'Child care', 'Mental health day'];

const COURSE_NAMES = ['Advanced React Patterns', 'AWS Solutions Architect', 'Kubernetes Administration', 'Machine Learning with Python', 'Data Engineering on GCP', 'Cybersecurity Fundamentals', 'Agile Project Management', 'Leadership Essentials', 'Cloud Security Certification', 'DevOps CI/CD Pipeline', 'Product Management Bootcamp', 'Design Thinking Workshop', 'Communication Skills', 'Six Sigma Green Belt', 'Python for Data Analysis', 'Tableau Data Visualization', 'People Analytics', 'Conflict Resolution'];
const COURSE_PROVIDERS = ['Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'Internal', 'Pluralsight', 'Frontend Masters'];

const TICKET_SUBJECTS: Record<string, string[]> = {
  it: ['VPN Connection Issue', 'Email not syncing', 'Laptop running slow', 'Software license expired', 'Printer not working'],
  payroll: ['Payroll Discrepancy', 'Missing reimbursement', 'Tax deduction query', 'Overtime not calculated'],
  hr: ['Update personal details', 'Request employment letter', 'Benefits enrollment issue', 'Policy clarification'],
  facilities: ['AC not working', 'Parking spot request', 'Desk allocation', 'Meeting room booking issue'],
  finance: ['Invoice processing delay', 'Budget approval needed', 'Vendor payment status'],
};

const TRAVEL_PURPOSES = ['Client Meeting - Q1 Review', 'Tech Conference 2025', 'Branch Office Visit', 'Team Offsite', 'Industry Summit', 'Partner Onboarding', 'Site Inspection', 'Training Program', 'Product Launch Event', 'Annual Sales Meet', 'Vendor Audit', 'Knowledge Transfer Session'];
const TRAVEL_DESTINATIONS = ['New York, NY', 'London, UK', 'Singapore', 'Mumbai, India', 'Berlin, Germany', 'Tokyo, Japan', 'Sydney, Australia', 'Dubai, UAE', 'Toronto, Canada', 'San Francisco, CA'];

const EXPENSE_TYPES = ['travel', 'food', 'communication', 'office_supplies', 'training', 'client_entertainment', 'medical'];
const EXPENSE_DESCRIPTIONS: Record<string, string[]> = {
  travel: ['Taxi to airport', 'Flight to client site', 'Hotel stay - conference', 'Rental car'],
  food: ['Team lunch meeting', 'Client dinner', 'Working lunch', 'Team celebration dinner'],
  communication: ['International calls for project', 'Mobile phone bill', 'Zoom license'],
  office_supplies: ['Monitor stand', 'Ergonomic keyboard', 'Desk organizer'],
  training: ['Online course subscription', 'Conference registration', 'Certification exam fee'],
  client_entertainment: ['Golf outing with client', 'Dinner with prospects'],
  medical: ['Annual health checkup', 'Prescription reimbursement'],
};

const DOCUMENT_NAMES = ['Employment Offer Letter', 'Non-Disclosure Agreement', 'Tax Form W-4', 'Direct Deposit Authorization', 'Emergency Contact Form', 'Benefits Enrollment Form', 'Performance Improvement Plan', 'Exit Interview Form', 'Probation Completion Letter', 'Promotion Letter', 'Remote Work Agreement', 'Relocation Agreement'];

const COMPLIANCE_ITEMS = [
  { title: 'Annual Fire Safety Training', category: 'safety' },
  { title: 'POPI Act Compliance Review', category: 'data_protection' },
  { title: 'Quarterly Tax Filing', category: 'tax' },
  { title: 'Workplace Harassment Prevention Training', category: 'labor' },
  { title: 'Environmental Impact Assessment', category: 'environmental' },
  { title: 'ISO 27001 Certification Renewal', category: 'industry' },
  { title: 'GDPR Data Processing Audit', category: 'data_protection' },
  { title: 'Annual Health & Safety Inspection', category: 'safety' },
  { title: 'Employee Background Verification Update', category: 'regulatory' },
  { title: 'Business Continuity Plan Review', category: 'regulatory' },
  { title: 'Anti-Money Laundering Training', category: 'regulatory' },
  { title: 'First Aid Certification Renewal', category: 'safety' },
];

const CLIENT_DATA = [
  { name: 'Acme Corp', email: 'hr@acme.com', clientCompany: 'Acme Corporation', industry: 'Technology' },
  { name: 'GlobalTech Inc', email: 'talent@globaltech.com', clientCompany: 'GlobalTech Inc', industry: 'Software' },
  { name: 'BuildRight Construction', email: 'hr@buildright.com', clientCompany: 'BuildRight', industry: 'Construction' },
  { name: 'FinServe Partners', email: 'info@finserve.com', clientCompany: 'FinServe Partners', industry: 'Finance' },
  { name: 'MedTech Solutions', email: 'contact@medtech.com', clientCompany: 'MedTech Solutions', industry: 'Healthcare' },
  { name: 'EduLearn Academy', email: 'admin@edulearn.org', clientCompany: 'EduLearn Academy', industry: 'Education' },
  { name: 'GreenEnergy Corp', email: 'ops@greenenergy.com', clientCompany: 'GreenEnergy Corp', industry: 'Energy' },
  { name: 'FoodChain Logistics', email: 'supply@foodchain.com', clientCompany: 'FoodChain Logistics', industry: 'Food & Beverage' },
];

const VENDOR_DATA = [
  { name: 'TalentHunt Agency', email: 'info@talenthunt.com', vendorCompany: 'TalentHunt', serviceType: 'recruitment', rating: 4.5 },
  { name: 'StaffPro Solutions', email: 'contact@staffpro.com', vendorCompany: 'StaffPro', serviceType: 'staffing', rating: 4.2 },
  { name: 'VerifyRight BGV', email: 'team@verifyright.com', vendorCompany: 'VerifyRight', serviceType: 'bgv', rating: 4.8 },
  { name: 'CloudHost Pro', email: 'support@cloudhost.com', vendorCompany: 'CloudHost Pro', serviceType: 'cloud_services', rating: 4.0 },
  { name: 'SecureIT Systems', email: 'sales@secureit.com', vendorCompany: 'SecureIT', serviceType: 'security', rating: 4.6 },
  { name: 'CleanPro Services', email: 'info@cleanpro.com', vendorCompany: 'CleanPro', serviceType: 'facilities', rating: 3.9 },
  { name: 'PrintMax Solutions', email: 'orders@printmax.com', vendorCompany: 'PrintMax', serviceType: 'printing', rating: 4.3 },
  { name: 'TravelWise Corporate', email: 'biz@travelwise.com', vendorCompany: 'TravelWise', serviceType: 'travel', rating: 4.1 },
];

// ==================== MAIN SEED FUNCTION ====================

export async function POST() {
  const log: string[] = [];
  const created: Record<string, number> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    // ==================== 1. FETCH EXISTING COMPANIES ====================
    log.push('--- Step 1: Fetching Companies ---');
    const companies = await db.company.findMany({ where: { code: { in: ['MARQ', 'TCG', 'MPI', 'HFS', 'RMG', 'LTW'] } } });
    const companyMap: Record<string, (typeof companies)[0]> = {};
    for (const c of companies) companyMap[c.code] = c;
    log.push(`Found ${companies.length} companies`);

    // ==================== 2. ENSURE BRANCHES ====================
    log.push('--- Step 2: Ensuring Branches ---');
    const branchDefs = [
      { name: 'MARQ Bangalore HQ', code: 'MARQ-BLR', city: 'Bangalore', state: 'KA', country: 'IN', companyCode: 'MARQ' },
      { name: 'MARQ Mumbai', code: 'MARQ-MUM', city: 'Mumbai', state: 'MH', country: 'IN', companyCode: 'MARQ' },
      { name: 'TCG San Francisco HQ', code: 'TCG-SF', city: 'San Francisco', state: 'CA', country: 'US', companyCode: 'TCG' },
      { name: 'TCG NYC Office', code: 'TCG-NY', city: 'New York', state: 'NY', country: 'US', companyCode: 'TCG' },
      { name: 'MPI Mumbai HQ', code: 'MPI-MUM', city: 'Mumbai', state: 'MH', country: 'IN', companyCode: 'MPI' },
      { name: 'MPI Pune Plant', code: 'MPI-PUN', city: 'Pune', state: 'MH', country: 'IN', companyCode: 'MPI' },
      { name: 'HFS London Office', code: 'HFS-LON', city: 'London', state: 'England', country: 'GB', companyCode: 'HFS' },
      { name: 'RMG Berlin HQ', code: 'RMG-BER', city: 'Berlin', state: 'Berlin', country: 'DE', companyCode: 'RMG' },
      { name: 'RMG Munich Store', code: 'RMG-MUC', city: 'Munich', state: 'Bavaria', country: 'DE', companyCode: 'RMG' },
      { name: 'LTW Singapore HQ', code: 'LTW-SGP', city: 'Singapore', state: 'Central', country: 'SG', companyCode: 'LTW' },
    ];

    // Pre-fetch all existing branches
    const existingBranches = await db.branch.findMany({ select: { id: true, code: true, companyId: true } });
    const branchMap: Record<string, string> = {};
    for (const eb of existingBranches) {
      branchMap[eb.code] = eb.id;
    }

    const newBranches = [];
    for (const bd of branchDefs) {
      const compId = companyMap[bd.companyCode]?.id;
      if (!compId) continue;
      if (branchMap[bd.code]) continue;
      newBranches.push({ name: bd.name, code: bd.code, city: bd.city, state: bd.state, country: bd.country, companyId: compId });
    }
    if (newBranches.length > 0) {
      const created2 = await db.branch.createMany({ data: newBranches, skipDuplicates: true });
      log.push(`Created ${created2.count} new branches`);
      // Re-fetch to get IDs
      const allBranches = await db.branch.findMany({ select: { id: true, code: true } });
      for (const b of allBranches) branchMap[b.code] = b.id;
    }
    created.branches = Object.keys(branchMap).length;
    log.push(`Branches: ${created.branches} total ensured`);

    // ==================== 3. ENSURE DEPARTMENTS ====================
    log.push('--- Step 3: Ensuring Departments ---');
    const deptDefs = [
      { name: 'Engineering', code: 'ENG', companyCode: 'TCG' },
      { name: 'Human Resources', code: 'HR', companyCode: 'TCG' },
      { name: 'Design', code: 'DSG', companyCode: 'TCG' },
      { name: 'Finance', code: 'FIN', companyCode: 'TCG' },
      { name: 'Operations', code: 'OPS', companyCode: 'TCG' },
      { name: 'Sales', code: 'SAL', companyCode: 'TCG' },
      { name: 'Analytics', code: 'ANA', companyCode: 'TCG' },
      { name: 'Marketing', code: 'MKT', companyCode: 'TCG' },
      { name: 'Research & Development', code: 'RD', companyCode: 'MARQ' },
      { name: 'Engineering', code: 'ENG', companyCode: 'MARQ' },
      { name: 'Human Resources', code: 'HR', companyCode: 'MARQ' },
      { name: 'Finance', code: 'FIN', companyCode: 'MARQ' },
      { name: 'Analytics', code: 'ANA', companyCode: 'MARQ' },
      { name: 'Quality', code: 'QAT', companyCode: 'MPI' },
      { name: 'Production', code: 'PRD', companyCode: 'MPI' },
      { name: 'Human Resources', code: 'HR', companyCode: 'MPI' },
      { name: 'Finance', code: 'FIN', companyCode: 'MPI' },
      { name: 'Operations', code: 'OPS', companyCode: 'MPI' },
      { name: 'Clinical', code: 'CLI', companyCode: 'HFS' },
      { name: 'Human Resources', code: 'HR', companyCode: 'HFS' },
      { name: 'Finance', code: 'FIN', companyCode: 'HFS' },
      { name: 'Retail Operations', code: 'RET', companyCode: 'RMG' },
      { name: 'Human Resources', code: 'HR', companyCode: 'RMG' },
      { name: 'Finance', code: 'FIN', companyCode: 'RMG' },
      { name: 'Marketing', code: 'MKT', companyCode: 'RMG' },
      { name: 'Logistics', code: 'LOG', companyCode: 'LTW' },
      { name: 'Human Resources', code: 'HR', companyCode: 'LTW' },
      { name: 'Finance', code: 'FIN', companyCode: 'LTW' },
      { name: 'Operations', code: 'OPS', companyCode: 'LTW' },
    ];

    const existingDepts = await db.department.findMany({ select: { id: true, code: true, companyId: true } });
    const deptMap: Record<string, string> = {};
    for (const ed of existingDepts) {
      const comp = companies.find(c => c.id === ed.companyId);
      if (comp) deptMap[`${comp.code}-${ed.code}`] = ed.id;
    }

    const newDepts = [];
    for (const dd of deptDefs) {
      const compId = companyMap[dd.companyCode]?.id;
      if (!compId) continue;
      if (deptMap[`${dd.companyCode}-${dd.code}`]) continue;
      newDepts.push({ name: dd.name, code: dd.code, companyId: compId });
    }
    if (newDepts.length > 0) {
      const created2 = await db.department.createMany({ data: newDepts, skipDuplicates: true });
      log.push(`Created ${created2.count} new departments`);
      const allDepts = await db.department.findMany({ select: { id: true, code: true, companyId: true } });
      for (const d of allDepts) {
        const comp = companies.find(c => c.id === d.companyId);
        if (comp) deptMap[`${comp.code}-${d.code}`] = d.id;
      }
    }
    created.departments = Object.keys(deptMap).length;
    log.push(`Departments: ${created.departments} total ensured`);

    // ==================== 4. CREATE EMPLOYEES (50+) ====================
    log.push('--- Step 4: Creating Employees ---');

    const allEmpsBefore = await db.employee.findMany({ select: { id: true, employeeId: true, email: true, companyId: true, departmentId: true, joiningDate: true, status: true } });
    const existingEmails = new Set(allEmpsBefore.map(e => e.email));
    let empIdCounter = allEmpsBefore.length > 0 ? Math.max(...allEmpsBefore.map(e => parseInt(e.employeeId.replace('EMP', '')) || 0)) + 1 : 1;

    const companyEmployeeDistribution: { code: string; count: number; deptCodes: string[]; branchCode: string; country: string }[] = [
      { code: 'MARQ', count: 10, deptCodes: ['RD', 'ENG', 'HR', 'FIN', 'ANA'], branchCode: 'MARQ-BLR', country: 'IN' },
      { code: 'TCG', count: 12, deptCodes: ['ENG', 'HR', 'DSG', 'FIN', 'OPS', 'SAL', 'ANA', 'MKT'], branchCode: 'TCG-SF', country: 'US' },
      { code: 'MPI', count: 10, deptCodes: ['QAT', 'PRD', 'HR', 'FIN', 'OPS'], branchCode: 'MPI-MUM', country: 'IN' },
      { code: 'HFS', count: 8, deptCodes: ['CLI', 'HR', 'FIN'], branchCode: 'HFS-LON', country: 'GB' },
      { code: 'RMG', count: 7, deptCodes: ['RET', 'HR', 'FIN', 'MKT'], branchCode: 'RMG-BER', country: 'DE' },
      { code: 'LTW', count: 7, deptCodes: ['LOG', 'HR', 'FIN', 'OPS'], branchCode: 'LTW-SGP', country: 'SG' },
    ];

    const EMPLOYMENT_TYPES = ['full-time', 'full-time', 'full-time', 'full-time', 'part-time', 'contract'];
    const EMPLOYEE_STATUSES = ['active', 'active', 'active', 'active', 'active', 'active', 'probation', 'on_leave', 'notice_period'];

    let newEmployeeCount = 0;
    const employeeDataToCreate: { data: Parameters<typeof db.employee.create>[0]['data']; email: string }[] = [];

    for (const dist of companyEmployeeDistribution) {
      const compId = companyMap[dist.code]?.id;
      if (!compId) continue;

      for (let i = 0; i < dist.count; i++) {
        const nameIdx = (employeeDataToCreate.length + i) % EMPLOYEE_NAMES.length;
        const name = EMPLOYEE_NAMES[nameIdx];
        const deptCode = pickRandom(dist.deptCodes);
        const deptId = deptMap[`${dist.code}-${deptCode}`];
        if (!deptId) continue;

        const branchId = branchMap[dist.branchCode] || null;
        const desigs = DESIGNATIONS[deptCode] || DESIGNATIONS['ENG'];
        const desig = pickRandom(desigs);

        const emailDomain = dist.code === 'MARQ' ? 'marqai.com' : dist.code === 'TCG' ? 'techcorp.com' : dist.code === 'MPI' ? 'manufactpro.com' : dist.code === 'HFS' ? 'healthfirst.com' : dist.code === 'RMG' ? 'retailmax.com' : 'logitrans.com';
        const email = `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase().replace(/[^a-z]/g, '')}${randomBetween(1, 99)}@${emailDomain}`;
        if (existingEmails.has(email)) continue;

        const empId = `EMP${String(empIdCounter++).padStart(3, '0')}`;
        const phoneCode = PHONE_CODES[dist.country] || '+1';
        const phone = `${phoneCode}${randomBetween(7000000000, 9999999999)}`;
        const city = dist.country === 'IN' ? pickRandom(CITIES_INDIA) : pickRandom(CITIES_GLOBAL);
        const state = dist.country === 'IN' ? pickRandom(['MH', 'KA', 'TN', 'DL', 'HR', 'GJ', 'WB', 'TG']) : '';
        const joiningYearsAgo = randomBetween(0, 5);
        const joiningDate = new Date(now.getFullYear() - joiningYearsAgo, randomBetween(0, 11), randomBetween(1, 28));
        const employmentType = pickRandom(EMPLOYMENT_TYPES);
        const status = pickRandom(EMPLOYEE_STATUSES);
        const gender = pickRandom(['male', 'female', 'other']);
        const maritalStatus = pickRandom(['single', 'single', 'married', 'married']);

        employeeDataToCreate.push({
          email,
          data: {
            employeeId: empId,
            firstName: name.firstName,
            lastName: name.lastName,
            email,
            phone,
            designation: desig.title,
            jobTitle: desig.jobTitle,
            employmentType,
            status,
            joiningDate,
            probationEnd: joiningYearsAgo < 1 ? addDays(joiningDate, 180) : undefined,
            dateOfBirth: new Date(now.getFullYear() - randomBetween(24, 50), randomBetween(0, 11), randomBetween(1, 28)),
            gender,
            maritalStatus,
            nationality: dist.country === 'IN' ? 'Indian' : dist.country === 'US' ? 'American' : dist.country === 'GB' ? 'British' : dist.country === 'DE' ? 'German' : 'Singaporean',
            address: `${randomBetween(1, 999)}, Sector ${randomBetween(1, 50)}`,
            city,
            state,
            country: dist.country,
            zipCode: String(randomBetween(100000, 999999)),
            emergencyContact: pickRandom(EMPLOYEE_NAMES).firstName + ' ' + pickRandom(EMPLOYEE_NAMES).lastName,
            emergencyPhone: `${phoneCode}${randomBetween(7000000000, 9999999999)}`,
            companyId: compId,
            branchId,
            departmentId: deptId,
          },
        });
        existingEmails.add(email);
      }
    }

    // Create employees sequentially (to handle unique constraints gracefully)
    const createdEmps: { id: string; employeeId: string; email: string; companyId: string; departmentId: string; joiningDate: Date; status: string }[] = [];
    for (const empData of employeeDataToCreate) {
      try {
        const emp = await db.employee.create({ data: empData.data, select: { id: true, employeeId: true, email: true, companyId: true, departmentId: true, joiningDate: true, status: true } });
        createdEmps.push(emp);
        newEmployeeCount++;
      } catch { /* skip unique violations */ }
    }

    // Fetch ALL employees
    const allEmps = await db.employee.findMany({ select: { id: true, employeeId: true, email: true, companyId: true, departmentId: true, joiningDate: true, status: true } });
    created.employees = allEmps.length;
    log.push(`Employees: ${allEmps.length} total (${newEmployeeCount} new)`);

    // Set reporting managers
    for (const comp of companies) {
      const compEmps = allEmps.filter(e => e.companyId === comp.id);
      if (compEmps.length < 3) continue;
      const manager = compEmps[0];
      const reportIds = compEmps.slice(1, Math.min(4, compEmps.length)).map(e => e.id);
      try {
        await db.employee.updateMany({ where: { id: { in: reportIds }, reportingManagerId: null }, data: { reportingManagerId: manager.id } });
      } catch { /* skip */ }
    }

    // ==================== 5. ATTENDANCE (30 days) ====================
    log.push('--- Step 5: Creating Attendance ---');
    const existingAttendanceCount = await db.attendance.count();

    // Pre-fetch existing attendance for the last 30 days to avoid duplicates
    const thirtyDaysAgo = addDays(today, -30);
    const existingAttendance = await db.attendance.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: { employeeId: true, date: true },
    });
    const existingAttKeys = new Set(existingAttendance.map(a => `${a.employeeId}_${fmtDate(a.date)}`));

    const sources = ['web', 'biometric', 'mobile', 'gps', 'rfid'];
    const attendanceData: { date: Date; checkIn: Date | null; checkOut: Date | null; workHours: number | null; breakDuration: number | null; status: string; source: string; employeeId: string }[] = [];

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = addDays(today, -dayOffset);
      if (!isWeekday(date)) continue;
      const dateStr = fmtDate(date);

      for (const emp of allEmps) {
        const key = `${emp.id}_${dateStr}`;
        if (existingAttKeys.has(key)) continue;

        const rand = Math.random();
        let status: string;
        if (rand < 0.75) status = 'present';
        else if (rand < 0.85) status = 'late';
        else if (rand < 0.92) status = 'absent';
        else if (rand < 0.97) status = 'half_day';
        else status = 'wfh';

        let checkIn: Date | null = null;
        let checkOut: Date | null = null;
        let workHours: number | null = null;
        let breakDuration: number | null = null;

        if (status === 'present' || status === 'late' || status === 'wfh') {
          const checkInHour = status === 'late' ? randomBetween(9, 10) : randomBetween(8, 9);
          const checkInMin = status === 'late' ? randomBetween(30, 59) : randomBetween(30, 59);
          checkIn = new Date(`${dateStr}T${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:00`);
          const checkOutHour = randomBetween(17, 19);
          const checkOutMin = randomBetween(0, 59);
          checkOut = new Date(`${dateStr}T${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}:00`);
          workHours = parseFloat(((checkOutHour - checkInHour) + (checkOutMin - checkInMin) / 60).toFixed(1));
          breakDuration = randomBetween(30, 60);
        } else if (status === 'half_day') {
          checkIn = new Date(`${dateStr}T09:${String(randomBetween(0, 30)).padStart(2, '0')}:00`);
          checkOut = new Date(`${dateStr}T13:${String(randomBetween(0, 30)).padStart(2, '0')}:00`);
          workHours = 4.0;
          breakDuration = 0;
        }

        attendanceData.push({ date, checkIn, checkOut, workHours, breakDuration, status, source: pickRandom(sources), employeeId: emp.id });
      }
    }

    // Create attendance in batches
    const ATT_BATCH = 100;
    let newAttendanceCount = 0;
    for (let i = 0; i < attendanceData.length; i += ATT_BATCH) {
      const batch = attendanceData.slice(i, i + ATT_BATCH);
      try {
        const result = await db.attendance.createMany({ data: batch, skipDuplicates: true });
        newAttendanceCount += result.count;
      } catch { /* skip batch errors */ }
    }
    created.attendance = existingAttendanceCount + newAttendanceCount;
    log.push(`Attendance: ${newAttendanceCount} new (total: ${created.attendance})`);

    // ==================== 6. LEAVES (20+) ====================
    log.push('--- Step 6: Creating Leaves ---');
    const existingLeaveCount = await db.leave.count();
    let newLeaveCount = 0;
    const leaveStatuses = ['approved', 'approved', 'pending', 'pending', 'rejected'];

    if (allEmps.length > 5) {
      const leaveEmployees = shuffleArray([...allEmps]).slice(0, 25);
      for (const emp of leaveEmployees) {
        for (let l = 0; l < randomBetween(1, 2); l++) {
          const type = pickRandom(LEAVE_TYPES);
          const startMonth = randomBetween(0, 5);
          const startDate = new Date(now.getFullYear(), startMonth, randomBetween(1, 28));
          const daysCount = type === 'maternity' ? 182 : type === 'paternity' ? 15 : randomBetween(1, 5);
          const endDate = addDays(startDate, daysCount - 1);
          const status = pickRandom(leaveStatuses);
          const approvers = allEmps.filter(e => e.companyId === emp.companyId && e.id !== emp.id);

          try {
            await db.leave.create({
              data: {
                type, startDate, endDate, totalDays: daysCount,
                reason: pickRandom(LEAVE_REASONS), status,
                approverComment: status === 'rejected' ? 'Not approved due to project deadline' : status === 'approved' ? 'Approved' : undefined,
                approverId: (status !== 'pending') && approvers.length > 0 ? approvers[0].id : null,
                employeeId: emp.id,
              },
            });
            newLeaveCount++;
          } catch { /* skip */ }
        }
      }
    }
    created.leaves = existingLeaveCount + newLeaveCount;
    log.push(`Leaves: ${newLeaveCount} new (total: ${created.leaves})`);

    // ==================== 7. PAYROLL RECORDS (3 months) ====================
    log.push('--- Step 7: Creating Payroll Records ---');
    const existingPayrollCount = await db.payrollRecord.count();

    // Pre-fetch existing payroll
    const existingPayroll = await db.payrollRecord.findMany({ select: { employeeId: true, month: true, year: true } });
    const payrollKeys = new Set(existingPayroll.map(p => `${p.employeeId}_${p.month}_${p.year}`));

    const payrollData: { month: number; year: number; basicPay: number; grossSalary: number; totalDeductions: number; netSalary: number; status: string; paymentDate: Date | null; employeeId: string }[] = [];

    for (const emp of allEmps) {
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const payrollDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const month = payrollDate.getMonth() + 1;
        const year = payrollDate.getFullYear();
        if (emp.joiningDate > new Date(year, month, 0)) continue;

        const key = `${emp.id}_${month}_${year}`;
        if (payrollKeys.has(key)) continue;

        const basicPay = randomBetween(30000, 150000);
        const hra = Math.round(basicPay * 0.4);
        const specialAllowance = Math.round(basicPay * 0.2);
        const grossSalary = basicPay + hra + specialAllowance;
        const pf = Math.round(basicPay * 0.12);
        const tax = Math.round(basicPay * 0.1);
        const totalDeductions = pf + tax;
        const netSalary = grossSalary - totalDeductions;
        const status = monthOffset === 0 ? 'draft' : pickRandom(['paid', 'processed', 'processed']);

        payrollData.push({ month, year, basicPay, grossSalary, totalDeductions, netSalary, status, paymentDate: status === 'paid' ? new Date(year, month, randomBetween(25, 28)) : null, employeeId: emp.id });
      }
    }

    let newPayrollCount = 0;
    for (let i = 0; i < payrollData.length; i += ATT_BATCH) {
      const batch = payrollData.slice(i, i + ATT_BATCH);
      try {
        const result = await db.payrollRecord.createMany({ data: batch, skipDuplicates: true });
        newPayrollCount += result.count;
      } catch { /* skip */ }
    }
    created.payrollRecords = existingPayrollCount + newPayrollCount;
    log.push(`Payroll: ${newPayrollCount} new (total: ${created.payrollRecords})`);

    // ==================== 8. REVIEW CYCLES & PERFORMANCE REVIEWS ====================
    log.push('--- Step 8: Creating Review Cycles & Performance Reviews ---');
    const reviewCycles: { id: string }[] = [];
    for (const comp of companies) {
      for (const cd of [
        { name: `FY${now.getFullYear()} Annual Review`, type: 'annual', startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31), status: 'active' },
        { name: `FY${now.getFullYear()} Mid-Year Review`, type: 'mid_year', startDate: new Date(now.getFullYear(), 6, 1), endDate: new Date(now.getFullYear(), 8, 30), status: 'draft' },
      ]) {
        const existing2 = await db.reviewCycle.findFirst({ where: { name: cd.name, companyId: comp.id } });
        if (existing2) { reviewCycles.push(existing2); continue; }
        try {
          const rc = await db.reviewCycle.create({ data: { ...cd, companyId: comp.id } });
          reviewCycles.push(rc);
        } catch { /* skip */ }
      }
    }
    created.reviewCycles = reviewCycles.length;

    const existingReviewCount = await db.performanceReview.count();
    let newReviewCount = 0;
    if (reviewCycles.length > 0 && allEmps.length > 3) {
      const reviewStatuses = ['pending', 'completed', 'completed', 'completed'];
      for (const cycle of reviewCycles) {
        const reviewEmps = shuffleArray([...allEmps]).slice(0, randomBetween(5, 8));
        for (const emp of reviewEmps) {
          const reviewers = allEmps.filter(e => e.id !== emp.id);
          if (reviewers.length === 0) continue;
          const reviewer = reviewers[0];
          const existing2 = await db.performanceReview.findFirst({ where: { cycleId: cycle.id, revieweeId: emp.id, reviewerId: reviewer.id } });
          if (existing2) continue;
          const status = pickRandom(reviewStatuses);
          try {
            await db.performanceReview.create({
              data: {
                cycleId: cycle.id, reviewerId: reviewer.id, revieweeId: emp.id,
                rating: status === 'completed' ? randomBetween(1, 5) : undefined,
                comments: status === 'completed' ? pickRandom(['Delivers quality work', 'Excellent team player', 'Shows great initiative', 'Meets expectations', 'Outstanding performance']) : undefined,
                status,
              },
            });
            newReviewCount++;
          } catch { /* skip */ }
        }
      }
    }
    created.performanceReviews = existingReviewCount + newReviewCount;
    log.push(`Reviews: ${reviewCycles.length} cycles, ${newReviewCount} new reviews (total: ${created.performanceReviews})`);

    // ==================== 9. GOALS ====================
    log.push('--- Step 9: Creating Goals ---');
    const existingGoalCount = await db.goal.count();
    let newGoalCount = 0;

    const goalTitles = ['Complete React 19 Migration', 'Reduce Hiring Time-to-Fill', 'Improve Design System Coverage', 'Achieve 99.9% Uptime', 'Launch Mobile App v2.0', 'Implement CI/CD Pipeline', 'Increase Customer Satisfaction', 'Reduce Production Defect Rate', 'Complete ISO Certification', 'Migrate to Cloud Infrastructure', 'Build ML Model for Forecasting', 'Improve Employee Retention', 'Launch New Product Line', 'Expand to APAC Markets', 'Achieve Zero Security Incidents', 'Reduce Operational Costs by 15%', 'Automate Regression Testing', 'Build Customer 360 Dashboard'];

    if (allEmps.length > 0) {
      const goalEmployees = shuffleArray([...allEmps]).slice(0, Math.min(30, allEmps.length));
      for (let i = 0; i < goalEmployees.length; i++) {
        const emp = goalEmployees[i];
        for (let g = 0; g < randomBetween(1, 2); g++) {
          const title = goalTitles[(i + g) % goalTitles.length];
          const status = pickRandom(['not_started', 'in_progress', 'in_progress', 'completed', 'completed']);
          const progress = status === 'completed' ? 100 : status === 'not_started' ? 0 : randomBetween(10, 90);
          const startMonth = randomBetween(0, 5);
          const startDate = new Date(now.getFullYear(), startMonth, 1);
          const endDate = new Date(now.getFullYear(), startMonth + randomBetween(2, 6), randomBetween(25, 30));

          const existing2 = await db.goal.findFirst({ where: { title, employeeId: emp.id } });
          if (existing2) continue;
          try {
            await db.goal.create({
              data: { title, description: `Goal: ${title}`, type: pickRandom(['individual', 'team', 'department']), category: pickRandom(['okr', 'kpi', 'smart']), progress, status, startDate, endDate, employeeId: emp.id },
            });
            newGoalCount++;
          } catch { /* skip */ }
        }
      }
    }
    created.goals = existingGoalCount + newGoalCount;
    log.push(`Goals: ${newGoalCount} new (total: ${created.goals})`);

    // ==================== 10. ASSETS (20+) ====================
    log.push('--- Step 10: Creating Assets ---');
    const existingAssetCount = await db.assetAllocation.count();
    let newAssetCount = 0;
    let assetCodeCounter = 1000;

    if (allEmps.length > 0) {
      const assetEmployees = shuffleArray([...allEmps]).slice(0, Math.min(30, allEmps.length));
      for (const emp of assetEmployees) {
        for (let a = 0; a < randomBetween(1, 2); a++) {
          const assetGroup = pickRandom(ASSET_TYPES);
          const assetName = pickRandom(assetGroup.names);
          const assetCode = `${assetGroup.type.substring(0, 3).toUpperCase()}-${assetCodeCounter++}`;
          const isReturned = Math.random() < 0.15;
          const allocatedDaysAgo = randomBetween(30, 730);
          try {
            await db.assetAllocation.create({
              data: {
                assetType: assetGroup.type, assetName, assetCode,
                serialNumber: Math.random() < 0.7 ? `SN-${randomBetween(100000, 999999)}` : undefined,
                allocatedAt: addDays(now, -allocatedDaysAgo),
                returnedAt: isReturned ? addDays(now, -randomBetween(1, 30)) : undefined,
                status: isReturned ? 'returned' : 'allocated',
                notes: Math.random() < 0.3 ? pickRandom(['On loan from IT pool', 'Replacement unit', 'New allocation']) : undefined,
                employeeId: emp.id,
              },
            });
            newAssetCount++;
          } catch { /* skip */ }
        }
      }
    }
    created.assets = existingAssetCount + newAssetCount;
    log.push(`Assets: ${newAssetCount} new (total: ${created.assets})`);

    // ==================== 11. TRAVEL REQUESTS (10+) ====================
    log.push('--- Step 11: Creating Travel Requests ---');
    const existingTravelCount = await db.travelRequest.count();
    let newTravelCount = 0;

    if (allEmps.length > 3) {
      const travelEmployees = shuffleArray([...allEmps]).slice(0, 12);
      for (let i = 0; i < Math.min(12, travelEmployees.length); i++) {
        const emp = travelEmployees[i];
        const departureDate = addDays(now, randomBetween(-30, 60));
        const tripDays = randomBetween(2, 7);
        const estimatedCost = randomFloat(500, 5000);
        const status = pickRandom(['pending', 'pending', 'approved', 'approved', 'rejected', 'completed']);
        const approvers = allEmps.filter(e => e.companyId === emp.companyId && e.id !== emp.id);
        try {
          await db.travelRequest.create({
            data: {
              purpose: TRAVEL_PURPOSES[i % TRAVEL_PURPOSES.length],
              destination: pickRandom(TRAVEL_DESTINATIONS),
              departureDate, returnDate: addDays(departureDate, tripDays),
              estimatedCost, approvedCost: (status === 'approved' || status === 'completed') ? estimatedCost * 0.95 : undefined,
              status,
              approverComment: status === 'rejected' ? 'Budget constraints' : status === 'approved' ? 'Approved' : undefined,
              approverId: (status !== 'pending') && approvers.length > 0 ? approvers[0].id : null,
              employeeId: emp.id,
            },
          });
          newTravelCount++;
        } catch { /* skip */ }
      }
    }
    created.travelRequests = existingTravelCount + newTravelCount;
    log.push(`Travel: ${newTravelCount} new (total: ${created.travelRequests})`);

    // ==================== 12. EXPENSE CLAIMS (10+) ====================
    log.push('--- Step 12: Creating Expense Claims ---');
    const existingExpenseCount = await db.expenseClaim.count();
    let newExpenseCount = 0;

    if (allEmps.length > 3) {
      const expenseEmployees = shuffleArray([...allEmps]).slice(0, 12);
      for (let i = 0; i < Math.min(12, expenseEmployees.length); i++) {
        const emp = expenseEmployees[i];
        const type = pickRandom(EXPENSE_TYPES);
        const status = pickRandom(['pending', 'pending', 'approved', 'approved', 'rejected', 'reimbursed']);
        const approvers = allEmps.filter(e => e.companyId === emp.companyId && e.id !== emp.id);
        try {
          await db.expenseClaim.create({
            data: {
              type, amount: randomFloat(50, 2000),
              description: pickRandom(EXPENSE_DESCRIPTIONS[type] || ['General expense']),
              status,
              approverComment: status === 'rejected' ? 'Not within policy' : status === 'approved' ? 'Verified' : undefined,
              approverId: (status !== 'pending') && approvers.length > 0 ? approvers[0].id : null,
              employeeId: emp.id,
            },
          });
          newExpenseCount++;
        } catch { /* skip */ }
      }
    }
    created.expenseClaims = existingExpenseCount + newExpenseCount;
    log.push(`Expenses: ${newExpenseCount} new (total: ${created.expenseClaims})`);

    // ==================== 13. LEARNING RECORDS (15+) ====================
    log.push('--- Step 13: Creating Learning Records ---');
    const existingLearningCount = await db.learningRecord.count();
    let newLearningCount = 0;

    if (allEmps.length > 0) {
      const learningEmployees = shuffleArray([...allEmps]).slice(0, 20);
      for (let i = 0; i < learningEmployees.length; i++) {
        const emp = learningEmployees[i];
        const courseName = COURSE_NAMES[i % COURSE_NAMES.length];
        const status = pickRandom(['enrolled', 'in_progress', 'in_progress', 'completed', 'completed']);
        const existing2 = await db.learningRecord.findFirst({ where: { courseName, employeeId: emp.id } });
        if (existing2) continue;
        try {
          await db.learningRecord.create({
            data: {
              courseName, provider: pickRandom(COURSE_PROVIDERS),
              type: pickRandom(['e_learning', 'certification', 'workshop']),
              status,
              completedAt: status === 'completed' ? addDays(now, -randomBetween(1, 90)) : undefined,
              score: status === 'completed' ? randomBetween(65, 100) : undefined,
              certificate: status === 'completed' && Math.random() < 0.5 ? `cert-${i}-${now.getFullYear()}` : undefined,
              employeeId: emp.id,
            },
          });
          newLearningCount++;
        } catch { /* skip */ }
      }
    }
    created.learningRecords = existingLearningCount + newLearningCount;
    log.push(`Learning: ${newLearningCount} new (total: ${created.learningRecords})`);

    // ==================== 14. TICKETS (10+) ====================
    log.push('--- Step 14: Creating Tickets ---');
    const existingTicketCount = await db.ticket.count();
    let newTicketCount = 0;

    if (allEmps.length > 0) {
      const ticketEmployees = shuffleArray([...allEmps]).slice(0, 12);
      for (let i = 0; i < Math.min(12, ticketEmployees.length); i++) {
        const emp = ticketEmployees[i];
        const category = pickRandom(Object.keys(TICKET_SUBJECTS));
        const subject = pickRandom(TICKET_SUBJECTS[category]);
        const status = pickRandom(['open', 'open', 'in_progress', 'in_progress', 'resolved', 'closed']);
        const possibleAssignees = allEmps.filter(e => e.companyId === emp.companyId && e.id !== emp.id);
        try {
          await db.ticket.create({
            data: {
              subject, description: `${subject} - Reported on ${fmtDate(addDays(now, -randomBetween(1, 30)))}`,
              category, priority: pickRandom(['low', 'medium', 'medium', 'high', 'urgent']),
              status,
              resolution: (status === 'resolved' || status === 'closed') ? 'Issue resolved' : undefined,
              assignedTo: (status !== 'open') && possibleAssignees.length > 0 ? possibleAssignees[0].id : undefined,
              employeeId: emp.id,
            },
          });
          newTicketCount++;
        } catch { /* skip */ }
      }
    }
    created.tickets = existingTicketCount + newTicketCount;
    log.push(`Tickets: ${newTicketCount} new (total: ${created.tickets})`);

    // ==================== 15. CLIENTS (5+) ====================
    log.push('--- Step 15: Creating Clients ---');
    const existingClientCount = await db.client.count();
    let newClientCount = 0;

    for (const cd of CLIENT_DATA) {
      const compId = pickRandom(companies).id;
      const existing2 = await db.client.findFirst({ where: { name: cd.name, companyId: compId } });
      if (existing2) continue;
      try {
        await db.client.create({
          data: {
            name: cd.name, email: cd.email,
            phone: `+${randomBetween(1, 99)}${randomBetween(1000000000, 9999999999)}`,
            clientCompany: cd.clientCompany, industry: cd.industry,
            contractStart: addDays(now, -randomBetween(30, 365)),
            contractEnd: addDays(now, randomBetween(180, 730)),
            status: pickRandom(['active', 'active', 'inactive']),
            companyId: compId,
          },
        });
        newClientCount++;
      } catch { /* skip */ }
    }
    created.clients = existingClientCount + newClientCount;
    log.push(`Clients: ${newClientCount} new (total: ${created.clients})`);

    // ==================== 16. VENDORS (5+) ====================
    log.push('--- Step 16: Creating Vendors ---');
    const existingVendorCount = await db.vendor.count();
    let newVendorCount = 0;

    for (const vd of VENDOR_DATA) {
      const compId = pickRandom(companies).id;
      const existing2 = await db.vendor.findFirst({ where: { name: vd.name, companyId: compId } });
      if (existing2) continue;
      try {
        const vendor = await db.vendor.create({
          data: {
            name: vd.name, email: vd.email,
            phone: `+${randomBetween(1, 99)}${randomBetween(1000000000, 9999999999)}`,
            vendorCompany: vd.vendorCompany, serviceType: vd.serviceType,
            status: pickRandom(['active', 'active', 'inactive']), rating: vd.rating,
            companyId: compId,
          },
        });
        if (Math.random() < 0.5) {
          try {
            await db.subVendor.create({
              data: {
                name: `${vd.vendorCompany} Regional`, email: `regional@${vd.vendorCompany.toLowerCase().replace(/\s+/g, '')}.com`,
                company: `${vd.vendorCompany} Regional`, status: 'active', vendorId: vendor.id,
              },
            });
          } catch { /* skip */ }
        }
        newVendorCount++;
      } catch { /* skip */ }
    }
    created.vendors = existingVendorCount + newVendorCount;
    log.push(`Vendors: ${newVendorCount} new (total: ${created.vendors})`);

    // ==================== 17. DOCUMENTS (10+) ====================
    log.push('--- Step 17: Creating Documents ---');
    const existingDocCount = await db.document.count();
    let newDocCount = 0;

    if (allEmps.length > 0) {
      const docEmployees = shuffleArray([...allEmps]).slice(0, 15);
      for (let i = 0; i < Math.min(DOCUMENT_NAMES.length, docEmployees.length); i++) {
        const emp = docEmployees[i];
        const docName = DOCUMENT_NAMES[i];
        const existing2 = await db.document.findFirst({ where: { name: docName, employeeId: emp.id } });
        if (existing2) continue;
        try {
          await db.document.create({
            data: {
              name: docName, type: pickRandom(['contract', 'id_proof', 'tax', 'general', 'offer']),
              fileUrl: `/documents/${emp.employeeId}/${docName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
              status: pickRandom(['active', 'active', 'expired']),
              employeeId: emp.id,
            },
          });
          newDocCount++;
        } catch { /* skip */ }
      }
    }
    created.documents = existingDocCount + newDocCount;
    log.push(`Documents: ${newDocCount} new (total: ${created.documents})`);

    // ==================== 18. SURVEYS & RESPONSES ====================
    log.push('--- Step 18: Creating Surveys ---');
    const existingSurveyCount = await db.survey.count();
    let newSurveyCount = 0;
    let newSurveyQuestions = 0;
    let newSurveyResponses = 0;

    for (const st of [
      { title: 'Q1 2025 Employee Engagement Pulse', type: 'pulse', status: 'active' },
      { title: 'Annual Satisfaction Survey 2025', type: 'annual', status: 'draft' },
      { title: 'Remote Work Experience Survey', type: 'pulse', status: 'active' },
      { title: 'Leadership Effectiveness Survey', type: '360', status: 'active' },
    ]) {
      const compId = pickRandom(companies).id;
      const existing2 = await db.survey.findFirst({ where: { title: st.title, companyId: compId } });
      if (existing2) continue;
      try {
        const survey = await db.survey.create({
          data: { title: st.title, description: `${st.title} - Please share your feedback`, type: st.type, status: st.status, startDate: addDays(now, -randomBetween(1, 30)), endDate: addDays(now, randomBetween(7, 60)), companyId: compId },
        });
        const questions = ['How satisfied are you with your current role?', 'Do you feel your work is recognized?', 'How would you rate team collaboration?', 'What could we improve?', 'Would you recommend this company?'];
        const createdQuestions = [];
        for (let q = 0; q < questions.length; q++) {
          try {
            const q2 = await db.surveyQuestion.create({ data: { question: questions[q], type: q === 3 ? 'text' : 'rating', required: q !== 3, order: q, surveyId: survey.id } });
            createdQuestions.push(q2);
            newSurveyQuestions++;
          } catch { /* skip */ }
        }
        const respEmps = shuffleArray([...allEmps]).slice(0, 5);
        for (const emp of respEmps) {
          for (const q of createdQuestions) {
            try {
              await db.surveyResponse.create({ data: { answer: q.type === 'text' ? 'Better communication' : String(randomBetween(1, 5)), questionId: q.id, employeeId: emp.id } });
              newSurveyResponses++;
            } catch { /* skip */ }
          }
        }
        newSurveyCount++;
      } catch { /* skip */ }
    }
    created.surveys = existingSurveyCount + newSurveyCount;
    log.push(`Surveys: ${newSurveyCount} new with ${newSurveyQuestions} questions and ${newSurveyResponses} responses`);

    // ==================== 19. ONBOARDING TASKS ====================
    log.push('--- Step 19: Creating Onboarding Tasks ---');
    const existingOnboardingCount = await db.onboardingTask.count();
    let newOnboardingCount = 0;

    const recentEmployees = allEmps.filter(e => e.joiningDate > addDays(now, -180));
    for (const emp of recentEmployees.slice(0, 15)) {
      for (const task of [
        { title: 'Complete IT Setup', description: 'Laptop, email, VPN access setup', category: 'it' },
        { title: 'HR Orientation', description: 'Company policies, benefits overview', category: 'hr' },
        { title: 'Team Introduction', description: 'Meet the team members', category: 'team' },
        { title: 'Codebase Walkthrough', description: 'Overview of the main systems', category: 'training' },
        { title: 'First Project Assignment', description: 'Assign initial work items', category: 'training' },
      ]) {
        const status = pickRandom(['completed', 'completed', 'completed', 'in_progress', 'pending']);
        const existing2 = await db.onboardingTask.findFirst({ where: { title: task.title, employeeId: emp.id } });
        if (existing2) continue;
        try {
          await db.onboardingTask.create({
            data: { ...task, status, dueDate: addDays(emp.joiningDate, randomBetween(7, 30)), completedAt: status === 'completed' ? addDays(emp.joiningDate, randomBetween(1, 14)) : undefined, employeeId: emp.id },
          });
          newOnboardingCount++;
        } catch { /* skip */ }
      }
    }
    created.onboardingTasks = existingOnboardingCount + newOnboardingCount;
    log.push(`Onboarding: ${newOnboardingCount} new (total: ${created.onboardingTasks})`);

    // ==================== 20. NOTIFICATIONS (15+) ====================
    log.push('--- Step 20: Creating Notifications ---');
    const existingNotifCount = await db.notification.count();
    let newNotifCount = 0;

    const allUsers = await db.user.findMany({ select: { id: true } });
    if (allUsers.length > 0) {
      const notifTemplates = [
        { title: 'Leave Request', message: 'A new leave request has been submitted', type: 'info' as const, category: 'leave' },
        { title: 'New Candidate', message: 'A candidate applied for an open position', type: 'success' as const, category: 'recruitment' },
        { title: 'Payroll Processed', message: 'Monthly payroll has been processed', type: 'success' as const, category: 'payroll' },
        { title: 'Attendance Alert', message: 'An employee is absent without notice', type: 'warning' as const, category: 'attendance' },
        { title: 'Expense Approval', message: 'You have pending expense approvals', type: 'info' as const, category: 'expense' },
        { title: 'Probation Ending', message: 'An employee probation ends soon', type: 'warning' as const, category: 'employee' },
        { title: 'New Ticket', message: 'A new support ticket has been created', type: 'info' as const, category: 'helpdesk' },
        { title: 'Interview Scheduled', message: 'An interview has been scheduled', type: 'info' as const, category: 'recruitment' },
        { title: 'Goal Deadline', message: 'A goal deadline is approaching', type: 'warning' as const, category: 'performance' },
        { title: 'Compliance Due', message: 'A compliance item is due soon', type: 'warning' as const, category: 'compliance' },
        { title: 'Asset Allocation', message: 'A new asset has been allocated', type: 'info' as const, category: 'asset' },
        { title: 'Travel Approved', message: 'Your travel request has been approved', type: 'success' as const, category: 'travel' },
        { title: 'Training Completed', message: 'A team member completed training', type: 'success' as const, category: 'learning' },
        { title: 'Survey Available', message: 'A new survey is available', type: 'info' as const, category: 'survey' },
        { title: 'Policy Update', message: 'Company policies have been updated', type: 'info' as const, category: 'hr' },
        { title: 'Birthday Reminder', message: 'A team member has a birthday this week', type: 'info' as const, category: 'social' },
        { title: 'System Maintenance', message: 'Scheduled maintenance this weekend', type: 'warning' as const, category: 'system' },
        { title: 'Work Anniversary', message: 'An employee has a work anniversary', type: 'success' as const, category: 'social' },
      ];

      const notifData = notifTemplates.map(n => ({
        title: n.title, message: n.message, type: n.type, category: n.category,
        isRead: Math.random() < 0.5,
        actionUrl: Math.random() < 0.3 ? `/${n.category}` : undefined,
        userId: pickRandom(allUsers).id,
      }));

      try {
        const result = await db.notification.createMany({ data: notifData, skipDuplicates: true });
        newNotifCount = result.count;
      } catch { /* skip */ }
    }
    created.notifications = existingNotifCount + newNotifCount;
    log.push(`Notifications: ${newNotifCount} new (total: ${created.notifications})`);

    // ==================== 21. AUDIT LOGS ====================
    log.push('--- Step 21: Creating Audit Logs ---');
    const existingAuditCount = await db.auditLog.count();
    let newAuditCount = 0;

    if (allUsers.length > 0) {
      const auditActions = [
        { action: 'LOGIN', entity: 'User', details: 'User logged in' },
        { action: 'CREATE', entity: 'Employee', details: 'New employee onboarded' },
        { action: 'UPDATE', entity: 'Employee', details: 'Employee details updated' },
        { action: 'CREATE', entity: 'Leave', details: 'Leave request submitted' },
        { action: 'APPROVE', entity: 'Leave', details: 'Leave request approved' },
        { action: 'REJECT', entity: 'Leave', details: 'Leave request rejected' },
        { action: 'CREATE', entity: 'PayrollRecord', details: 'Payroll record generated' },
        { action: 'PROCESS', entity: 'PayrollRecord', details: 'Payroll processed' },
        { action: 'CREATE', entity: 'TravelRequest', details: 'Travel request submitted' },
        { action: 'APPROVE', entity: 'TravelRequest', details: 'Travel request approved' },
        { action: 'CREATE', entity: 'ExpenseClaim', details: 'Expense claim submitted' },
        { action: 'CREATE', entity: 'Ticket', details: 'Support ticket created' },
        { action: 'UPDATE', entity: 'Ticket', details: 'Ticket status updated' },
        { action: 'CREATE', entity: 'AssetAllocation', details: 'Asset allocated' },
        { action: 'UPDATE', entity: 'Goal', details: 'Goal progress updated' },
        { action: 'BULK_IMPORT', entity: 'Employee', details: 'Bulk employee import' },
      ];

      const auditData = Array.from({ length: 25 }, () => {
        const template = pickRandom(auditActions);
        return {
          action: template.action, entity: template.entity,
          entityId: allEmps.length > 0 ? pickRandom(allEmps).id : undefined,
          details: `${template.details} - ${fmtDate(addDays(now, -randomBetween(1, 90)))}`,
          userId: pickRandom(allUsers).id,
          ipAddress: `192.168.${randomBetween(1, 255)}.${randomBetween(1, 255)}`,
        };
      });

      try {
        const result = await db.auditLog.createMany({ data: auditData, skipDuplicates: true });
        newAuditCount = result.count;
      } catch { /* skip */ }
    }
    created.auditLogs = existingAuditCount + newAuditCount;
    log.push(`Audit Logs: ${newAuditCount} new (total: ${created.auditLogs})`);

    // ==================== 22. COMPLIANCE ITEMS ====================
    log.push('--- Step 22: Creating Compliance Items ---');
    const existingComplianceCount = await db.complianceItem.count();
    let newComplianceCount = 0;

    for (const ci of COMPLIANCE_ITEMS) {
      const compId = pickRandom(companies).id;
      const existing2 = await db.complianceItem.findFirst({ where: { title: ci.title, companyId: compId } });
      if (existing2) continue;
      try {
        await db.complianceItem.create({
          data: {
            title: ci.title, description: `Compliance: ${ci.title}`, category: ci.category,
            dueDate: addDays(now, randomBetween(-30, 180)),
            status: pickRandom(['pending', 'pending', 'in_progress', 'completed', 'overdue']),
            assignee: allEmps.length > 0 ? pickRandom(allEmps).id : undefined,
            companyId: compId,
          },
        });
        newComplianceCount++;
      } catch { /* skip */ }
    }
    created.complianceItems = existingComplianceCount + newComplianceCount;
    log.push(`Compliance: ${newComplianceCount} new (total: ${created.complianceItems})`);

    // ==================== 23. SHIFTS & SHIFT MEMBERS ====================
    log.push('--- Step 23: Creating Shift Assignments ---');

    const shiftTemplates = [
      { name: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakMinutes: 30 },
      { name: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakMinutes: 30 },
      { name: 'Night Shift', startTime: '22:00', endTime: '06:00', breakMinutes: 30 },
      { name: 'General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
    ];

    for (const comp of companies) {
      for (const st of shiftTemplates) {
        const existing2 = await db.shift.findFirst({ where: { name: st.name, companyId: comp.id } });
        if (!existing2) {
          try { await db.shift.create({ data: { name: st.name, startTime: st.startTime, endTime: st.endTime, breakMinutes: st.breakMinutes, isActive: true, companyId: comp.id } }); } catch { /* skip */ }
        }
      }
    }

    const allShifts = await db.shift.findMany({ select: { id: true, companyId: true, name: true } });
    const existingShiftMemberCount = await db.shiftMember.count();
    let newShiftMemberCount = 0;

    for (const comp of companies) {
      const compShifts = allShifts.filter(s => s.companyId === comp.id);
      if (compShifts.length === 0) continue;
      const compEmps = allEmps.filter(e => e.companyId === comp.id);
      const effectiveDate = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const emp of compEmps.slice(0, 10)) {
        const shift = pickRandom(compShifts);
        try {
          await db.shiftMember.upsert({
            where: { employeeId_effectiveDate_shiftId: { employeeId: emp.id, effectiveDate, shiftId: shift.id } },
            update: {},
            create: { effectiveDate, shiftId: shift.id, employeeId: emp.id },
          });
          newShiftMemberCount++;
        } catch { /* skip */ }
      }
    }
    created.shiftMembers = existingShiftMemberCount + newShiftMemberCount;
    log.push(`Shift Members: ${newShiftMemberCount} new (total: ${created.shiftMembers})`);

    // ==================== 24. WORKFLOW INSTANCES ====================
    log.push('--- Step 24: Creating Workflow Instances ---');
    let newWorkflowInstanceCount = 0;

    const allWorkflowDefs = await db.workflowDefinition.findMany({ include: { steps: true } });
    if (allWorkflowDefs.length > 0 && allEmps.length > 0) {
      for (let i = 0; i < 8; i++) {
        const wfDef = pickRandom(allWorkflowDefs);
        const initiator = pickRandom(allEmps);
        try {
          const instance = await db.workflowInstance.create({
            data: { status: pickRandom(['pending', 'in_progress']), currentStep: randomBetween(0, Math.max(0, wfDef.steps.length - 1)), initiatedBy: initiator.id, workflowDefId: wfDef.id },
          });
          for (const stepDef of wfDef.steps) {
            try {
              await db.workflowStepInstance.create({
                data: {
                  stepOrder: stepDef.stepOrder,
                  status: stepDef.stepOrder < instance.currentStep ? 'approved' : 'pending',
                  actionedBy: stepDef.stepOrder < instance.currentStep ? initiator.id : undefined,
                  comments: stepDef.stepOrder < instance.currentStep ? 'Approved' : undefined,
                  actedAt: stepDef.stepOrder < instance.currentStep ? addDays(now, -randomBetween(1, 7)) : undefined,
                  workflowInstanceId: instance.id,
                },
              });
            } catch { /* skip */ }
          }
          newWorkflowInstanceCount++;
        } catch { /* skip */ }
      }
    }
    created.workflowInstances = newWorkflowInstanceCount;
    log.push(`Workflow Instances: ${newWorkflowInstanceCount} new`);

    // ==================== 25. ALUMNI RECORDS ====================
    log.push('--- Step 25: Creating Alumni Records ---');
    const existingAlumniCount = await db.alumniRecord.count();
    let newAlumniCount = 0;

    const exitedEmps = allEmps.filter(e => e.status === 'notice_period');
    for (const emp of exitedEmps) {
      const existing2 = await db.alumniRecord.findFirst({ where: { employeeId: emp.id } });
      if (existing2) continue;
      try {
        await db.alumniRecord.create({
          data: {
            exitReason: pickRandom(['Better opportunity', 'Relocation', 'Career change', 'Personal reasons']),
            rehireEligible: Math.random() < 0.7,
            alumniEmail: `alumni.${emp.employeeId.toLowerCase()}@alumni.com`,
            employeeId: emp.id,
          },
        });
        newAlumniCount++;
      } catch { /* skip */ }
    }
    created.alumniRecords = existingAlumniCount + newAlumniCount;
    log.push(`Alumni: ${newAlumniCount} new (total: ${created.alumniRecords})`);

    // ==================== FINAL SUMMARY ====================
    log.push('\n========================================');
    log.push('=== COMPREHENSIVE SEED COMPLETED ===');
    log.push('========================================');

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
