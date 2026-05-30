import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Use raw SQL to avoid Prisma schema mismatch (DB has isActive boolean, schema has status text)
    const whereParts: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (status === 'active') {
      // Support both isActive (boolean) and status (text) columns
      whereParts.push(`("isActive" = true OR status = 'active')`);
    } else if (status === 'inactive') {
      whereParts.push(`("isActive" = false OR status = 'inactive')`);
    }

    if (search) {
      whereParts.push(`(name ILIKE '%${search}%' OR code ILIKE '%${search}%' OR industry ILIKE '%${search}%' OR domain ILIKE '%${search}%')`);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    const companies = await db.$queryRawUnsafe(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM "Employee" WHERE "companyId" = c.id) as emp_count,
        (SELECT COUNT(*) FROM "Department" WHERE "companyId" = c.id) as dept_count,
        (SELECT COUNT(*) FROM "Branch" WHERE "companyId" = c.id) as branch_count,
        (SELECT COUNT(*) FROM "CompanyMember" WHERE "companyId" = c.id) as member_count,
        (SELECT COUNT(*) FROM "OfficeLocation" WHERE "companyId" = c.id) as location_count
      FROM "Company" c
      ${whereClause}
      ORDER BY c."createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `) as any[];

    const totalResult = await db.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "Company" c ${whereClause}
    `) as any[];
    const total = Number(totalResult[0]?.count || 0);

    // Map to expected format with _count
    const mappedCompanies = companies.map(c => ({
      ...c,
      status: c.status || (c.isActive ? 'active' : 'inactive'),
      _count: {
        employees: Number(c.emp_count || 0),
        departments: Number(c.dept_count || 0),
        branches: Number(c.branch_count || 0),
        members: Number(c.member_count || 0),
        officeLocations: Number(c.location_count || 0),
      },
    }));

    return NextResponse.json({
      data: mappedCompanies,
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
    const { name, legalName, code, industry, logo, domain, address, city, state, country, gstVat, panTanCin, registrationNumber, currency, timezone, payrollCycle, financialYear, defaultLanguage, status, parentId } = body;

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
        legalName: legalName || null,
        code: companyCode,
        gstVat: gstVat || null,
        panTanCin: panTanCin || null,
        registrationNumber: registrationNumber || null,
        industry: industry || null,
        logo: logo || null,
        domain: domain || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        currency: currency || 'USD',
        timezone: timezone || 'UTC',
        payrollCycle: payrollCycle || null,
        financialYear: financialYear || null,
        defaultLanguage: defaultLanguage || null,
        status: status || 'active',
        parentId: parentId || null,
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
