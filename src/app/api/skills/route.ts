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

    // If employeeId is provided, return employee skills with skill details
    if (employeeId) {
      const where: Record<string, unknown> = { employeeId };

      const [employeeSkills, total] = await Promise.all([
        db.employeeSkill.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            skill: true,
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
        db.employeeSkill.count({ where }),
      ]);

      return NextResponse.json({
        employeeSkills,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Otherwise, return skills list
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [skills, total] = await Promise.all([
      db.skill.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { employeeSkills: true },
          },
        },
      }),
      db.skill.count({ where }),
    ]);

    return NextResponse.json({
      skills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Skill name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await db.skill.findUnique({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Skill with this name already exists' },
        { status: 409 }
      );
    }

    const skill = await db.skill.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'hr',
        details: `Created skill: ${skill.name}${skill.category ? ` (Category: ${skill.category})` : ''}`,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating skill:', error);
    const message = error instanceof Error ? error.message : 'Failed to create skill';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Skill id is required' },
        { status: 400 }
      );
    }

    const existing = await db.skill.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (name && name !== existing.name) {
      const duplicate = await db.skill.findUnique({ where: { name } });
      if (duplicate) {
        return NextResponse.json(
          { error: 'Skill with this name already exists' },
          { status: 409 }
        );
      }
    }

    const skill = await db.skill.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'update',
        module: 'hr',
        details: `Updated skill: ${skill.name}`,
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
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
        { error: 'Skill id is required' },
        { status: 400 }
      );
    }

    const existing = await db.skill.findUnique({
      where: { id },
      include: { _count: { select: { employeeSkills: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    if (existing._count.employeeSkills > 0) {
      return NextResponse.json(
        { error: 'Cannot delete skill assigned to employees. Remove employee associations first.' },
        { status: 409 }
      );
    }

    await db.skill.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'hr',
        details: `Deleted skill: ${existing.name}`,
      },
    });

    return NextResponse.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
