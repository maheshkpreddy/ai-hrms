import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const isActive = url.searchParams.get('isActive');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { industry: { contains: search } },
        { domain: { contains: search } },
      ];
    }

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { employees: true, departments: true, branches: true, members: true, officeLocations: true },
          },
          parent: { select: { id: true, name: true } },
        },
      }),
      db.company.count({ where }),
    ]);

    return NextResponse.json({
      data: companies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Companies GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, description, industry, logo, domain, website, address, city, state, country, pincode, phone, email, foundedYear, employeeCount, currency, timezone, isActive, parentId, createdBy } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Generate code from name if not provided
    const companyCode = code || name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);

    // Check unique code
    const existing = await db.company.findUnique({ where: { code: companyCode } });
    if (existing) {
      return NextResponse.json(
        { error: 'Company code already exists' },
        { status: 400 }
      );
    }

    const company = await db.company.create({
      data: {
        name,
        code: companyCode,
        description: description || null,
        industry: industry || null,
        logo: logo || null,
        domain: domain || null,
        website: website || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        pincode: pincode || null,
        phone: phone || null,
        email: email || null,
        foundedYear: foundedYear || null,
        employeeCount: employeeCount || null,
        currency: currency || 'USD',
        timezone: timezone || 'UTC',
        isActive: isActive !== undefined ? isActive : true,
        parentId: parentId || null,
        createdBy: createdBy || null,
      },
      include: {
        _count: { select: { employees: true, departments: true, branches: true, members: true, officeLocations: true } },
        parent: true,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Company',
        entityId: company.id,
        userId: body.createdBy || null,
        details: `Company created: ${name} (${companyCode})`,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Companies POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check code uniqueness if being updated
    if (updateData.code && updateData.code !== existing.code) {
      const codeExists = await db.company.findUnique({ where: { code: updateData.code } });
      if (codeExists) {
        return NextResponse.json(
          { error: 'Company code already exists' },
          { status: 400 }
        );
      }
    }

    const company = await db.company.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { employees: true, departments: true, branches: true, members: true, officeLocations: true } },
        parent: true,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Company',
        entityId: id,
        userId: body.updatedBy,
        details: `Company updated: ${existing.name}`,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Companies PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
