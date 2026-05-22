# PayrollExpense Component - Work Record

## Task ID: payroll-expense-component
## Agent: Main Agent

## Summary
Created the Payroll & Expense Management module component for the AI-powered HRMS application.

## Files Created/Modified

### Created
- `/home/z/my-project/src/components/hrms/PayrollExpense.tsx` — Main component (~530 lines)

### Modified
- `/home/z/my-project/src/app/page.tsx` — Updated to render PayrollExpense component

## Component Features

### Tab 1: Payroll Processing
- 4 stat cards: Total Payroll (₹1.85 Cr), Employees Processed (4/170), Pending (1), Next Pay Date (28 Feb)
- Month/Year selector using shadcn Select
- Payroll table with: Employee (avatar initials + name + ID), Basic Salary, HRA, DA, Gross Pay, PF, ESI, Tax, Net Pay, Status badges (emerald=paid, amber=processed, rose=pending)
- Breakdown button per row → opens dialog with PieChart (earnings) + deductions list + net pay summary
- Generate Payslip button per row
- Bulk actions: Process Payroll, Process All, Export to Excel

### Tab 2: Expense Claims
- 4 stat cards: Total Claims (₹56,200), Approved (₹31,500), Pending (₹24,700), Rejected (₹5,000)
- Expense table with category badges (plane=Travel, bed=Accommodation, monitor=Equipment, utensils=Food)
- Approve/Reject buttons for pending items
- "Submit Expense" dialog with category select, amount, date, description, receipt upload
- Monthly expense trend LineChart (Aug-Jan)

### Tab 3: Tax Declarations
- Employee self-service view for FY 2023-24
- 4 tax sections: 80C (PPF, ELSS, Life Insurance), 80D (Health Insurance), HRA Exemption, Other Deductions
- Each section: declared vs proof submitted with progress bars
- Overall declaration vs limit progress bar
- Submit Declaration and Upload Proof buttons
- Tax Computation Summary card: Gross Salary, Total Deductions, Taxable Income, Estimated Tax
- Tax Saving Opportunity tip box

## Technical Details
- Uses emerald as primary color (no blue/indigo)
- Fully responsive (mobile-first with sm/md/lg breakpoints)
- Recharts for PieChart and LineChart
- shadcn/ui components: Tabs, Card, Badge, Table, Dialog, Select, Progress, Input, Label, Textarea, Button
- Lucide icons throughout
- Mock data imported from `@/lib/data` (payrollData, expenseData)
- Tax declarations and expense trend data defined inline
- `use client` directive applied
- Lint passes with zero errors
