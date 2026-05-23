import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const employeeId = searchParams.get('employeeId');

    // If employeeId is provided, return enrollments for that employee
    if (employeeId) {
      const where: Record<string, unknown> = { employeeId };
      const status = searchParams.get('enrollmentStatus');
      if (status) {
        where.status = status;
      }

      const [enrollments, total] = await Promise.all([
        db.courseEnrollment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            course: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeId: true,
              },
            },
          },
        }),
        db.courseEnrollment.count({ where }),
      ]);

      return NextResponse.json({
        enrollments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Otherwise return courses
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { provider: { contains: search } },
      ];
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      }),
      db.course.count({ where }),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If enrolling an employee in a course
    if (body.employeeId && body.courseId && !body.title) {
      // Check for existing enrollment
      const existing = await db.courseEnrollment.findFirst({
        where: {
          employeeId: body.employeeId,
          courseId: body.courseId,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Employee is already enrolled in this course' },
          { status: 409 }
        );
      }

      // Verify employee and course exist
      const [employee, course] = await Promise.all([
        db.employee.findUnique({ where: { id: body.employeeId } }),
        db.course.findUnique({ where: { id: body.courseId } }),
      ]);

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        );
      }

      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      const enrollment = await db.courseEnrollment.create({
        data: {
          employeeId: body.employeeId,
          courseId: body.courseId,
          status: body.status || 'enrolled',
          progress: body.progress ?? 0,
        },
        include: {
          course: true,
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
        },
      });

      // Create audit log
      await db.auditLog.create({
        data: {
          employeeId: body.employeeId,
          action: 'create',
          module: 'learning',
          details: `${enrollment.employee.firstName} ${enrollment.employee.lastName} enrolled in course: ${enrollment.course.title}`,
        },
      });

      return NextResponse.json(enrollment, { status: 201 });
    }

    // If creating a new course
    if (body.title) {
      const course = await db.course.create({
        data: {
          title: body.title,
          description: body.description,
          category: body.category,
          duration: body.duration,
          provider: body.provider,
          url: body.url,
          skills: body.skills,
        },
      });

      // Create audit log
      await db.auditLog.create({
        data: {
          action: 'create',
          module: 'learning',
          details: `New course created: ${body.title}`,
        },
      });

      return NextResponse.json(course, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Provide either (employeeId + courseId) for enrollment or title for new course' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in courses POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
