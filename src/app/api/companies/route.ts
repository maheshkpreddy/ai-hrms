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

    const where: Record<string, unknown> = {};

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
            select: { members: true, officeLocations: true },
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
        description: body.description,
        industry: body.industry,
        website: body.website,
        logo: body.logo,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        pincode: body.pincode,
        phone: body.phone,
        email: body.email,
        foundedYear: body.foundedYear,
        employeeCount: body.employeeCount,
        isActive: body.isActive ?? true,
        createdBy: body.createdBy,
      },
    });

    // If createdBy is provided, auto-add creator as owner member
    if (body.createdBy) {
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

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
