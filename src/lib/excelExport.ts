// Use dynamic import for xlsx to avoid Turbopack module resolution issues
async function getXLSX() {
  const XLSX = await import('xlsx')
  return XLSX
}

/**
 * Export data to Excel (.xlsx) file and trigger browser download
 * @param data Array of objects to export
 * @param columns Column definitions with header labels and data keys
 * @param filename Name of the file (without extension)
 * @param sheetName Name of the sheet
 */
export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: string; label: string; transform?: (value: unknown, row: T) => string | number }[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  const XLSX = await getXLSX()

  // Transform data using column definitions
  const rows = data.map((row) => {
    const obj: Record<string, string | number> = {}
    columns.forEach((col) => {
      const raw = row[col.key]
      obj[col.label] = col.transform ? col.transform(raw, row) : (raw as string | number) ?? ''
    })
    return obj
  })

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Set column widths based on header length
  const colWidths = columns.map((col) => ({
    wch: Math.max(col.label.length + 4, 15),
  }))
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Generate and download
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export attendance data to Excel
 */
export async function exportAttendanceReport(
  records: {
    name: string
    employeeId: string
    date: string
    checkIn: string
    checkOut: string
    hours: number
    shift: string
    status: string
    department: string
    location: string
  }[]
) {
  await exportToExcel(
    records,
    [
      { key: 'name', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'department', label: 'Department' },
      { key: 'date', label: 'Date' },
      { key: 'checkIn', label: 'Check-In' },
      { key: 'checkOut', label: 'Check-Out' },
      { key: 'hours', label: 'Hours Worked' },
      { key: 'shift', label: 'Shift' },
      { key: 'status', label: 'Status' },
      { key: 'location', label: 'Location' },
    ],
    `Attendance_Report_${new Date().toISOString().split('T')[0]}`,
    'Attendance'
  )
}

/**
 * Export payroll data to Excel
 */
export async function exportPayrollReport(
  records: {
    employeeName: string
    employeeId: string
    department: string
    month: string
    year: number
    basicSalary: number
    hra: number
    da: number
    grossPay: number
    pf: number
    esi: number
    tax: number
    totalDeductions: number
    netPay: number
    status: string
  }[]
) {
  await exportToExcel(
    records,
    [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'department', label: 'Department' },
      { key: 'month', label: 'Month' },
      { key: 'year', label: 'Year' },
      { key: 'basicSalary', label: 'Basic Salary' },
      { key: 'hra', label: 'HRA' },
      { key: 'da', label: 'DA' },
      { key: 'grossPay', label: 'Gross Pay' },
      { key: 'pf', label: 'PF' },
      { key: 'esi', label: 'ESI' },
      { key: 'tax', label: 'Tax' },
      { key: 'totalDeductions', label: 'Total Deductions' },
      { key: 'netPay', label: 'Net Pay' },
      { key: 'status', label: 'Status' },
    ],
    `Payroll_Report_${new Date().toISOString().split('T')[0]}`,
    'Payroll'
  )
}

/**
 * Export leave data to Excel
 */
export async function exportLeaveReport(
  records: {
    name: string
    employeeId: string
    leaveType: string
    startDate: string
    endDate: string
    days: number
    reason: string
    status: string
    approvedBy: string | null
  }[]
) {
  await exportToExcel(
    records,
    [
      { key: 'name', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'leaveType', label: 'Leave Type' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'days', label: 'Days' },
      { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Status' },
      { key: 'approvedBy', label: 'Approved By' },
    ],
    `Leave_Report_${new Date().toISOString().split('T')[0]}`,
    'Leaves'
  )
}

/**
 * Export expense data to Excel
 */
export async function exportExpenseReport(
  records: {
    employeeName: string
    employeeId: string
    category: string
    amount: number
    description: string
    date: string
    status: string
    approvedBy: string | null
  }[]
) {
  await exportToExcel(
    records,
    [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount' },
      { key: 'description', label: 'Description' },
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'approvedBy', label: 'Approved By' },
    ],
    `Expense_Report_${new Date().toISOString().split('T')[0]}`,
    'Expenses'
  )
}

/**
 * Export project data to Excel
 */
export async function exportProjectReport(
  records: {
    name: string
    status: string
    priority: string
    startDate: string
    endDate: string
    progress: number
    budget: number
    memberCount: number
    milestoneCount: number
  }[]
) {
  await exportToExcel(
    records,
    [
      { key: 'name', label: 'Project Name' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'progress', label: 'Progress (%)' },
      { key: 'budget', label: 'Budget' },
      { key: 'memberCount', label: 'Team Size' },
      { key: 'milestoneCount', label: 'Milestones' },
    ],
    `Project_Report_${new Date().toISOString().split('T')[0]}`,
    'Projects'
  )
}

/**
 * Export employee data to Excel
 */
export async function exportEmployeeReport(
  records: {
    employeeId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    department: string
    designation: string
    jobTitle: string
    status: string
    joinDate: string
    salary: number
  }[]
) {
  await exportToExcel(
    records,
    [
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'department', label: 'Department' },
      { key: 'designation', label: 'Designation' },
      { key: 'jobTitle', label: 'Job Title' },
      { key: 'status', label: 'Status' },
      { key: 'joinDate', label: 'Join Date' },
      { key: 'salary', label: 'Salary' },
    ],
    `Employee_Report_${new Date().toISOString().split('T')[0]}`,
    'Employees'
  )
}
