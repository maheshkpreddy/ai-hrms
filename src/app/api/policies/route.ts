import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [policies, total] = await Promise.all([
      db.companyPolicy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.companyPolicy.count({ where }),
    ]);

    return NextResponse.json({
      policies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { error: 'Policy title is required' },
        { status: 400 }
      );
    }

    const policy = await db.companyPolicy.create({
      data: {
        title: body.title,
        category: body.category,
        content: body.content,
        version: body.version,
        effectiveDate: body.effectiveDate,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'hr',
        details: `Created company policy: ${policy.title}${policy.category ? ` (Category: ${policy.category})` : ''}${policy.version ? ` v${policy.version}` : ''}`,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating policy:', error);
    const message = error instanceof Error ? error.message : 'Failed to create policy';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, category, content, version, effectiveDate } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Policy id is required' },
        { status: 400 }
      );
    }

    const existing = await db.companyPolicy.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    const policy = await db.companyPolicy.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(category !== undefined && { category }),
        ...(content !== undefined && { content }),
        ...(version !== undefined && { version }),
        ...(effectiveDate !== undefined && { effectiveDate }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'update',
        module: 'hr',
        details: `Updated company policy: ${policy.title}${policy.version ? ` v${policy.version}` : ''}`,
      },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Policy id is required' },
        { status: 400 }
      );
    }

    const existing = await db.companyPolicy.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    await db.companyPolicy.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'hr',
        details: `Deleted company policy: ${existing.title}`,
      },
    });

    return NextResponse.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json(
      { error: 'Failed to delete policy' },
      { status: 500 }
    );
  }
}
