import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [expenses, total] = await Promise.all([
      db.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              department: true,
              avatar: true,
            },
          },
        },
      }),
      db.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.category || !body.amount || !body.date) {
      return NextResponse.json(
        { error: 'employeeId, category, amount, and date are required' },
        { status: 400 }
      );
    }

    const expense = await db.expense.create({
      data: {
        employeeId: body.employeeId,
        category: body.category,
        amount: body.amount,
        description: body.description,
        receiptUrl: body.receiptUrl,
        date: body.date,
        status: 'pending',
      },
      include: {
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
        module: 'expense',
        details: `Expense claim submitted by ${expense.employee.firstName} ${expense.employee.lastName}: ${body.category} - ₹${body.amount}`,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy, comments } = body;

    if (!id || !status || !['approved', 'rejected', 'reimbursed'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid id and status (approved/rejected/reimbursed) are required' },
        { status: 400 }
      );
    }

    const existingExpense = await db.expense.findUnique({ where: { id } });
    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    if (existingExpense.status === 'rejected') {
      return NextResponse.json(
        { error: 'Cannot update a rejected expense' },
        { status: 409 }
      );
    }

    if (status === 'reimbursed' && existingExpense.status !== 'approved') {
      return NextResponse.json(
        { error: 'Expense must be approved before it can be reimbursed' },
        { status: 409 }
      );
    }

    const expense = await db.expense.update({
      where: { id },
      data: {
        status,
        approvedBy,
        comments,
      },
      include: {
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
        employeeId: existingExpense.employeeId,
        action: 'update',
        module: 'expense',
        details: `Expense ${status} for ${expense.employee.firstName} ${expense.employee.lastName}: ${existingExpense.category} - ₹${existingExpense.amount}`,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}
