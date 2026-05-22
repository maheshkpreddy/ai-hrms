import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Run all count queries in parallel
    const [
      totalEmployees,
      activeEmployees,
      departments,
      pendingLeaves,
      approvedLeavesToday,
      pendingExpenses,
      openJobs,
      totalCandidates,
      presentToday,
      absentToday,
      totalPayrollThisMonth,
      coursesActive,
    ] = await Promise.all([
      db.employee.count(),
      db.employee.count({ where: { status: 'active' } }),
      db.department.count(),
      db.leave.count({ where: { status: 'pending' } }),
      db.leave.count({ where: { status: 'approved' } }),
      db.expense.count({ where: { status: 'pending' } }),
      db.job.count({ where: { status: 'open' } }),
      db.candidate.count(),
      db.attendance.count({ where: { status: 'present' } }),
      db.attendance.count({ where: { status: 'absent' } }),
      db.payroll.aggregate({
        _sum: { netPay: true },
        where: {
          status: { in: ['processed', 'paid'] },
        },
      }),
      db.courseEnrollment.count({
        where: { status: { in: ['enrolled', 'in-progress'] } },
      }),
    ]);

    // Get employees by department
    const employeesByDepartment = await db.employee.groupBy({
      by: ['department'],
      where: { status: 'active', department: { not: null } },
      _count: { id: true },
    });

    // Get attendance distribution
    const attendanceDistribution = await db.attendance.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get leave type distribution
    const leaveTypeDistribution = await db.leave.groupBy({
      by: ['leaveType'],
      _count: { id: true },
    });

    // Get expense by category
    const expenseByCategory = await db.expense.groupBy({
      by: ['category'],
      where: { status: { in: ['pending', 'approved', 'reimbursed'] } },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = await db.employee.count({
      where: {
        joinDate: { gte: thirtyDaysAgo.toISOString().split('T')[0] },
        status: 'active',
      },
    });

    // Get department headcount formatted
    const departmentHeadcount = employeesByDepartment.map((dept) => ({
      department: dept.department || 'Unassigned',
      count: dept._count.id,
    }));

    // Get recent activities
    const recentActivities = await db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Performance overview
    const performanceStats = await db.performance.aggregate({
      _avg: { rating: true, attritionRisk: true },
      _count: { id: true },
    });

    // Candidate pipeline
    const candidatePipeline = await db.candidate.groupBy({
      by: ['status'],
      _count: { id: true },
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
        totalPayrollThisMonth: totalPayrollThisMonth._sum.netPay ?? 0,
      },
      charts: {
        departmentHeadcount,
        attendanceDistribution: attendanceDistribution.map((a) => ({
          status: a.status,
          count: a._count.id,
        })),
        leaveTypeDistribution: leaveTypeDistribution.map((l) => ({
          leaveType: l.leaveType,
          count: l._count.id,
        })),
        expenseByCategory: expenseByCategory.map((e) => ({
          category: e.category,
          totalAmount: e._sum.amount ?? 0,
          count: e._count.id,
        })),
      },
      performance: {
        averageRating: performanceStats._avg.rating ?? 0,
        averageAttritionRisk: performanceStats._avg.attritionRisk ?? 0,
        totalReviews: performanceStats._count.id,
      },
      candidatePipeline: candidatePipeline.map((c) => ({
        status: c.status,
        count: c._count.id,
      })),
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
