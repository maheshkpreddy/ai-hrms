import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry');
    const isActive = searchParams.get('isActive');
    const code = searchParams.get('code');

    const where: Record<string, unknown> = {};

    if (code) {
      where.code = code.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry) {
      where.industry = industry;
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { members: true, officeLocations: true, employees: true, departments: true, users: true },
          },
        },
      }),
      db.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Generate unique join code
    let code = generateJoinCode();
    let existing = await db.company.findUnique({ where: { code } });
    while (existing) {
      code = generateJoinCode();
      existing = await db.company.findUnique({ where: { code } });
    }

    const company = await db.company.create({
      data: {
        name: body.name,
        code,
        description: body.description || null,
        industry: body.industry || null,
        website: body.website || null,
        logo: body.logo || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || null,
        pincode: body.pincode || null,
        phone: body.phone || null,
        email: body.email || null,
        foundedYear: body.foundedYear || null,
        employeeCount: body.employeeCount || null,
        gstNumber: body.gstNumber || null,
        panNumber: body.panNumber || null,
        subscription: body.subscription || 'free',
        isActive: body.isActive ?? true,
        createdBy: body.createdBy || null,
      },
    });

    // If createdBy is provided, auto-add creator as owner member
    if (body.createdBy) {
      const employeeExists = await db.employee.findUnique({ where: { id: body.createdBy } });
      if (employeeExists) {
        await db.companyMember.create({
          data: {
            companyId: company.id,
            employeeId: body.createdBy,
            role: 'owner',
            status: 'approved',
            joinedAt: new Date().toISOString(),
          },
        });
      }
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'create',
        module: 'hr',
        details: `Created company: ${company.name} (${company.code})`,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, industry, website, logo, address, city, state, country, pincode, phone, email, foundedYear, employeeCount, gstNumber, panNumber, subscription, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Company id is required' },
        { status: 400 }
      );
    }

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const company = await db.company.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(industry !== undefined && { industry }),
        ...(website !== undefined && { website }),
        ...(logo !== undefined && { logo }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(pincode !== undefined && { pincode }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(foundedYear !== undefined && { foundedYear }),
        ...(employeeCount !== undefined && { employeeCount }),
        ...(gstNumber !== undefined && { gstNumber }),
        ...(panNumber !== undefined && { panNumber }),
        ...(subscription !== undefined && { subscription }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'update',
        module: 'hr',
        details: `Updated company: ${company.name} (${company.code})`,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
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
        { error: 'Company id is required' },
        { status: 400 }
      );
    }

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check for associated employees
    const memberCount = await db.companyMember.count({ where: { companyId: id } });
    if (memberCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete company with active members. Remove members first.' },
        { status: 409 }
      );
    }

    await db.company.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'delete',
        module: 'hr',
        details: `Deleted company: ${existing.name} (${existing.code})`,
      },
    });

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
