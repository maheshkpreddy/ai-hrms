import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get('companyId');
    const companyFilter = companyId ? { companyId } : {};

    // Total & active employees
    const totalEmployees = await db.employee.count({
      where: { ...companyFilter, status: 'active' },
    });
    const activeEmployees = totalEmployees;

    // New hires this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const recentHires = await db.employee.count({
      where: {
        ...companyFilter,
        joiningDate: { gte: firstOfMonth },
      },
    });

    // Departments count
    const departments = await db.department.count({
      where: companyId ? { companyId } : {},
    });

    // Open positions & total candidates
    const openJobs = await db.job.count({
      where: { ...companyFilter, status: 'open' },
    });
    const totalCandidates = await db.candidate.count();

    // Attendance today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = await db.attendance.count({
      where: {
        date: { gte: today },
        status: 'present',
        employee: companyFilter,
      },
    });
    const absentToday = await db.attendance.count({
      where: {
        date: { gte: today },
        status: { not: 'present' },
        employee: companyFilter,
      },
    });

    // Pending approvals
    const pendingLeaves = await db.leave.count({
      where: { status: 'pending', employee: companyFilter },
    });
    const pendingExpenses = await db.expenseClaim.count({
      where: { status: 'pending', employee: companyFilter },
    });

    // Active courses
    const coursesActive = await db.learningRecord.count({
      where: { status: 'enrolled', employee: companyFilter },
    });

    // Total payroll this month (sum of netSalary for current month)
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const payrollAgg = await db.payrollRecord.aggregate({
      _sum: { netSalary: true },
      where: { month: currentMonth, year: currentYear },
    });
    const totalPayrollThisMonth = payrollAgg._sum.netSalary || 0;

    // ─── Charts ─────────────────────────────────────────────────────────────────
    // Department headcount
    const departmentDistribution = await db.employee.groupBy({
      by: ['departmentId'],
      where: { ...companyFilter, status: 'active' },
      _count: { id: true },
    });
    const deptList = await db.department.findMany({
      where: companyId ? { companyId } : {},
      select: { id: true, name: true },
    });
    const deptMap = new Map(deptList.map((d) => [d.id, d.name]));

    const departmentHeadcount = departmentDistribution.map((d) => ({
      department: deptMap.get(d.departmentId) || 'Unknown',
      count: d._count.id,
    }));

    // Attendance distribution
    const attendanceStatuses = await db.attendance.groupBy({
      by: ['status'],
      where: { date: { gte: today }, employee: companyFilter },
      _count: { id: true },
    });
    const attendanceDistribution = attendanceStatuses.map((a) => ({
      status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
      count: a._count.id,
    }));

    // Leave type distribution
    const leaveTypes = await db.leave.groupBy({
      by: ['type'],
      _count: { id: true },
    });
    const leaveTypeDistribution = leaveTypes.map((l) => ({
      leaveType: l.type.charAt(0).toUpperCase() + l.type.slice(1),
      count: l._count.id,
    }));

    // Expense by category
    const expenseCategories = await db.expenseClaim.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { amount: true },
    });
    const expenseByCategory = expenseCategories.map((e) => ({
      category: e.type.charAt(0).toUpperCase() + e.type.slice(1),
      totalAmount: e._sum.amount || 0,
      count: e._count.id,
    }));

    // ─── Performance ─────────────────────────────────────────────────────────────
    const performanceAgg = await db.performanceReview.aggregate({
      _avg: { rating: true },
      _count: { id: true },
    });
    const performance = {
      averageRating: performanceAgg._avg.rating || 0,
      averageAttritionRisk: 0.12, // placeholder
      totalReviews: performanceAgg._count.id || 0,
    };

    // ─── Candidate Pipeline ──────────────────────────────────────────────────────
    const candidateStatuses = await db.candidate.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const candidatePipeline = candidateStatuses.map((c) => ({
      status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
      count: c._count.id,
    }));

    // ─── Recent Activities ───────────────────────────────────────────────────────
    const auditLogs = await db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Map audit logs to the format Dashboard expects:
    // { action, module, details, createdAt, employee: { firstName, lastName } }
    const recentActivities = auditLogs.map((log) => {
      const nameParts = (log.user?.name || 'System').split(' ');
      return {
        action: log.action || '',
        module: log.entity || 'general',
        details: log.details || '',
        createdAt: log.createdAt.toISOString(),
        employee: {
          firstName: nameParts[0] || 'System',
          lastName: nameParts.slice(1).join(' ') || '',
        },
      };
    });

    return NextResponse.json({
      overview: {
        totalEmployees,
        activeEmployees,
        departments,
        recentHires,
        presentToday,
        absentToday,
        openJobs,
        totalCandidates,
        pendingLeaves,
        pendingExpenses,
        coursesActive,
        totalPayrollThisMonth,
      },
      charts: {
        departmentHeadcount,
        attendanceDistribution,
        leaveTypeDistribution,
        expenseByCategory,
      },
      performance,
      candidatePipeline,
      recentActivities,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
