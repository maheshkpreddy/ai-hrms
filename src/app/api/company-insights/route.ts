import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const insightType = searchParams.get('type') || 'all'

    if (!companyId) {
      // Return aggregated insights across all companies
      return await getAllCompanyInsights()
    }

    // Get company-specific insights
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: {
        _count: { select: { employees: true, departments: true, branches: true } },
        employees: {
          select: {
            id: true,
            status: true,
            joiningDate: true,
            exitDate: true,
            employmentType: true,
            department: { select: { name: true } },
          },
          where: { status: 'active' },
          take: 1000,
        },
        departments: { select: { id: true, name: true } },
        branches: { select: { id: true, name: true, city: true } },
        leavePolicies: { select: { id: true, name: true, type: true, totalDays: true } },
        payrollStructures: { select: { id: true, name: true, basicPay: true } },
        clients: { select: { id: true, status: true } },
        vendors: { select: { id: true, status: true, rating: true } },
        companyPolicies: { select: { id: true, category: true, status: true } },
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const insights: Record<string, any> = {}

    if (insightType === 'all' || insightType === 'workforce') {
      insights.workforce = generateWorkforceInsights(company)
    }

    if (insightType === 'all' || insightType === 'headcount') {
      insights.headcount = generateHeadcountForecast(company)
    }

    if (insightType === 'all' || insightType === 'cost') {
      insights.cost = generateCostPrediction(company)
    }

    if (insightType === 'all' || insightType === 'compliance') {
      insights.compliance = await generateComplianceRisk(company)
    }

    if (insightType === 'all' || insightType === 'attrition') {
      insights.attrition = await generateAttritionTrends(companyId)
    }

    return NextResponse.json({ companyId, companyName: company.name, insights })
  } catch (error) {
    console.error('Error generating company insights:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}

async function getAllCompanyInsights() {
  try {
    const companies = await db.company.findMany({
      where: { status: 'active' },
      include: {
        _count: { select: { employees: true, departments: true, branches: true } },
        employees: {
          select: { id: true, status: true, joiningDate: true, exitDate: true },
          take: 500,
        },
      },
      take: 50,
    })

    const totalEmployees = companies.reduce((acc, c) => acc + c._count.employees, 0)
    const totalDepartments = companies.reduce((acc, c) => acc + c._count.departments, 0)
    const totalBranches = companies.reduce((acc, c) => acc + c._count.branches, 0)

    // Company-wise breakdown
    const companyBreakdown = companies.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      employeeCount: c._count.employees,
      departmentCount: c._count.departments,
      branchCount: c._count.branches,
      industry: c.industry,
      country: c.country,
      currency: c.currency,
    }))

    // Aggregated attrition across all companies
    const allAttritionData = await generateAllCompanyAttrition()

    return NextResponse.json({
      overview: {
        totalCompanies: companies.length,
        totalEmployees,
        totalDepartments,
        totalBranches,
      },
      companyBreakdown,
      attritionTrends: allAttritionData,
    })
  } catch (error) {
    console.error('Error getting all company insights:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}

function generateWorkforceInsights(company: any) {
  const employees = company.employees || []
  const activeEmployees = employees.filter((e: any) => e.status === 'active')

  // Department distribution
  const deptDistribution: Record<string, number> = {}
  activeEmployees.forEach((e: any) => {
    const deptName = e.department?.name || 'Unassigned'
    deptDistribution[deptName] = (deptDistribution[deptName] || 0) + 1
  })

  // Employment type distribution
  const empTypeDistribution: Record<string, number> = {}
  activeEmployees.forEach((e: any) => {
    empTypeDistribution[e.employmentType] = (empTypeDistribution[e.employmentType] || 0) + 1
  })

  // Average tenure
  const now = new Date()
  const tenures = activeEmployees.map((e: any) => {
    const joinDate = new Date(e.joiningDate)
    return (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  })
  const avgTenure = tenures.length > 0 ? tenures.reduce((a: number, b: number) => a + b, 0) / tenures.length : 0

  // Recent hires (last 90 days)
  const recentHires = activeEmployees.filter((e: any) => {
    const joinDate = new Date(e.joiningDate)
    return (now.getTime() - joinDate.getTime()) < 90 * 24 * 60 * 60 * 1000
  }).length

  return {
    totalActive: activeEmployees.length,
    departmentDistribution: deptDistribution,
    employmentTypeDistribution: empTypeDistribution,
    averageTenure: Math.round(avgTenure * 10) / 10,
    recentHires,
    departments: company._count.departments,
    branches: company._count.branches,
    leavePolicies: company.leavePolicies?.length || 0,
    payrollStructures: company.payrollStructures?.length || 0,
    clients: company.clients?.filter((c: any) => c.status === 'active').length || 0,
    vendors: company.vendors?.filter((v: any) => v.status === 'active').length || 0,
    policies: company.companyPolicies?.length || 0,
  }
}

function generateHeadcountForecast(company: any) {
  const employees = company.employees || []
  const activeEmployees = employees.filter((e: any) => e.status === 'active')
  const currentHeadcount = activeEmployees.length

  // Generate monthly forecast for next 12 months
  const now = new Date()
  const forecast = []

  // Calculate growth rate from join dates
  const joinDates = activeEmployees
    .map((e: any) => new Date(e.joiningDate))
    .sort((a: Date, b: Date) => a.getTime() - b.getTime())

  let monthlyGrowthRate = 0.02 // default 2%
  if (joinDates.length >= 2) {
    const last6Months = activeEmployees.filter((e: any) => {
      const j = new Date(e.joiningDate)
      return (now.getTime() - j.getTime()) < 180 * 24 * 60 * 60 * 1000
    }).length
    monthlyGrowthRate = currentHeadcount > 0 ? last6Months / currentHeadcount / 6 : 0.02
  }

  for (let i = 1; i <= 12; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const projected = Math.round(currentHeadcount * Math.pow(1 + monthlyGrowthRate, i))
    forecast.push({
      month: forecastDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
      projected,
      lowerBound: Math.round(projected * 0.9),
      upperBound: Math.round(projected * 1.15),
    })
  }

  return {
    currentHeadcount,
    monthlyGrowthRate: Math.round(monthlyGrowthRate * 1000) / 10,
    projected12Months: forecast[11]?.projected || currentHeadcount,
    forecast,
  }
}

function generateCostPrediction(company: any) {
  const payrollStructures = company.payrollStructures || []
  const activeCount = company.employees?.filter((e: any) => e.status === 'active').length || 0

  // Calculate average salary from payroll structures
  let avgSalary = 50000 // default
  if (payrollStructures.length > 0) {
    avgSalary = payrollStructures.reduce((acc: number, p: any) => acc + (p.basicPay || 0), 0) / payrollStructures.length
    // Assuming basicPay is ~40% of CTC, multiply by 2.5 for approximate CTC
    avgSalary = avgSalary * 2.5
  }

  const monthlyPayroll = avgSalary * activeCount
  const annualPayroll = monthlyPayroll * 12

  // Cost projections with different growth scenarios
  const projections = {
    conservative: { rate: 0.05, annual: Math.round(annualPayroll * 1.05) },
    moderate: { rate: 0.10, annual: Math.round(annualPayroll * 1.10) },
    aggressive: { rate: 0.18, annual: Math.round(annualPayroll * 1.18) },
  }

  // Monthly cost breakdown
  const monthlyCost = []
  for (let i = 1; i <= 12; i++) {
    monthlyCost.push({
      month: new Date(new Date().getFullYear(), new Date().getMonth() + i, 1)
        .toLocaleString('default', { month: 'short' }),
      salary: Math.round(monthlyPayroll * Math.pow(1.005, i)),
      benefits: Math.round(monthlyPayroll * 0.25 * Math.pow(1.003, i)),
      overhead: Math.round(monthlyPayroll * 0.15 * Math.pow(1.002, i)),
    })
  }

  return {
    averageSalary: Math.round(avgSalary),
    activeEmployees: activeCount,
    monthlyPayroll: Math.round(monthlyPayroll),
    annualPayroll: Math.round(annualPayroll),
    benefitsCost: Math.round(annualPayroll * 0.25),
    overheadCost: Math.round(annualPayroll * 0.15),
    totalProjectedCost: Math.round(annualPayroll * 1.4),
    projections,
    monthlyCost,
    currency: company.currency || 'USD',
  }
}

async function generateComplianceRisk(company: any) {
  // Check for various compliance indicators
  const risks: any[] = []

  // Check policies
  const policies = company.companyPolicies || []
  const requiredPolicies = ['HR', 'IT', 'Compliance', 'Finance']
  const policyCategories = new Set(policies.map((p: any) => p.category))
  requiredPolicies.forEach(cat => {
    if (!policyCategories.has(cat)) {
      risks.push({
        category: cat,
        severity: 'high',
        title: `Missing ${cat} Policy`,
        description: `No ${cat} policy found for this company. This may result in compliance gaps.`,
        recommendation: `Create and implement a ${cat} policy immediately.`,
      })
    }
  })

  // Check leave policies
  const leavePolicies = company.leavePolicies || []
  if (leavePolicies.length < 3) {
    risks.push({
      category: 'Leave',
      severity: 'medium',
      title: 'Insufficient Leave Policies',
      description: `Only ${leavePolicies.length} leave policy types defined. Most companies require at least 3-5 types.`,
      recommendation: 'Add standard leave types: Casual, Sick, Earned, and Maternity/Paternity.',
    })
  }

  // Check payroll structures
  const payrollStructures = company.payrollStructures || []
  if (payrollStructures.length === 0) {
    risks.push({
      category: 'Payroll',
      severity: 'high',
      title: 'No Payroll Structure Defined',
      description: 'No payroll structure configured. This may lead to payroll processing issues.',
      recommendation: 'Set up at least one payroll structure with basic salary components.',
    })
  }

  // Check for expired documents/contracts
  risks.push({
    category: 'Documents',
    severity: 'low',
    title: 'Document Expiry Check',
    description: 'Recommend reviewing employee document expiry dates regularly.',
    recommendation: 'Set up automated reminders for document renewals.',
  })

  const highRiskCount = risks.filter(r => r.severity === 'high').length
  const mediumRiskCount = risks.filter(r => r.severity === 'medium').length
  const lowRiskCount = risks.filter(r => r.severity === 'low').length

  let overallRisk = 'low'
  if (highRiskCount > 0) overallRisk = 'high'
  else if (mediumRiskCount > 1) overallRisk = 'medium'

  return {
    overallRisk,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    risks,
    complianceScore: Math.max(0, 100 - (highRiskCount * 25 + mediumRiskCount * 10 + lowRiskCount * 5)),
  }
}

async function generateAttritionTrends(companyId: string) {
  // Get employees who left in the last 12 months
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)

  const exitedEmployees = await db.employee.findMany({
    where: {
      companyId,
      exitDate: { gte: twelveMonthsAgo },
    },
    select: {
      id: true,
      exitDate: true,
      department: { select: { name: true } },
      employmentType: true,
    },
  })

  const activeCount = await db.employee.count({
    where: { companyId, status: 'active' },
  })

  // Monthly attrition data
  const monthlyAttrition: { month: string; exits: number; rate: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const exitsInMonth = exitedEmployees.filter((e: any) => {
      if (!e.exitDate) return false
      const exitDate = new Date(e.exitDate)
      return exitDate >= monthStart && exitDate <= monthEnd
    }).length
    const approxHeadcount = activeCount + exitedEmployees.length // rough estimate
    const rate = approxHeadcount > 0 ? (exitsInMonth / approxHeadcount) * 100 : 0

    monthlyAttrition.push({
      month: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
      exits: exitsInMonth,
      rate: Math.round(rate * 10) / 10,
    })
  }

  // Department-wise attrition
  const deptAttrition: Record<string, number> = {}
  exitedEmployees.forEach((e: any) => {
    const dept = e.department?.name || 'Unknown'
    deptAttrition[dept] = (deptAttrition[dept] || 0) + 1
  })

  const totalExits = exitedEmployees.length
  const avgHeadcount = activeCount + Math.round(totalExits / 2)
  const annualAttritionRate = avgHeadcount > 0 ? (totalExits / avgHeadcount) * 100 : 0

  return {
    totalExits,
    activeEmployees: activeCount,
    annualAttritionRate: Math.round(annualAttritionRate * 10) / 10,
    monthlyAttrition,
    departmentAttrition: deptAttrition,
    trend: monthlyAttrition.length >= 3
      ? (monthlyAttrition[monthlyAttrition.length - 1].rate > monthlyAttrition[0].rate ? 'increasing' : 'decreasing')
      : 'stable',
  }
}

async function generateAllCompanyAttrition() {
  try {
    const companies = await db.company.findMany({
      where: { status: 'active' },
      include: {
        _count: { select: { employees: true } },
      },
      take: 20,
    })

    const companyAttrition = []
    for (const company of companies) {
      const activeCount = await db.employee.count({
        where: { companyId: company.id, status: 'active' },
      })
      const exitCount = await db.employee.count({
        where: {
          companyId: company.id,
          exitDate: { gte: new Date(new Date().getFullYear() - 1, 0, 1) },
        },
      })
      const rate = activeCount > 0 ? (exitCount / (activeCount + exitCount)) * 100 : 0

      companyAttrition.push({
        companyId: company.id,
        companyName: company.name,
        code: company.code,
        activeEmployees: activeCount,
        exits: exitCount,
        attritionRate: Math.round(rate * 10) / 10,
      })
    }

    return companyAttrition.sort((a, b) => b.attritionRate - a.attritionRate)
  } catch {
    return []
  }
}
