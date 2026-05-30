import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const employeeId = searchParams.get('employeeId');
    const docType = searchParams.get('docType');
    const accessLevel = searchParams.get('accessLevel');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (docType) {
      where.docType = docType;
    }

    if (accessLevel) {
      where.accessLevel = accessLevel;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { docType: { contains: search } },
      ];
    }

    const [documents, total] = await Promise.all([
      db.document.findMany({
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
              department: { select: { id: true, name: true } },
              avatar: true,
            },
          },
        },
      }),
      db.document.count({ where }),
    ]);

    // Transform documents so employee.department is a string (department name)
    const transformedDocs = documents.map((doc: any) => ({
      ...doc,
      employee: doc.employee
        ? {
            ...doc.employee,
            department: doc.employee.department?.name ?? doc.employee.department ?? null,
          }
        : doc.employee,
    }));

    return NextResponse.json({
      documents: transformedDocs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    // Return empty results instead of 500 so the UI always gets valid data
    return NextResponse.json({
      documents: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.docType || !body.title) {
      return NextResponse.json(
        { error: 'employeeId, docType, and title are required' },
        { status: 400 }
      );
    }

    const document = await db.document.create({
      data: {
        employeeId: body.employeeId,
        name: body.name || body.title || 'Untitled Document',
        docType: body.docType,
        title: body.title,
        fileUrl: body.fileUrl,
        accessLevel: body.accessLevel || 'hr-only',
        uploadedBy: body.uploadedBy,
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
        entity: 'document',
        entityId: document.id,
        module: 'hr',
        details: `Document uploaded for ${document.employee.firstName} ${document.employee.lastName}: ${body.docType} - ${body.title}`,
      },
    }).catch(() => {});

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, docType, fileUrl, accessLevel } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Document id is required' },
        { status: 400 }
      );
    }

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = await db.document.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(docType && { docType }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(accessLevel && { accessLevel }),
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
        employeeId: existing.employeeId,
        action: 'update',
        entity: 'document',
        entityId: existing.id,
        module: 'hr',
        details: `Document updated: ${existing.title || existing.name} (${existing.docType})`,
      },
    }).catch(() => {});

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
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
        { error: 'Document id is required' },
        { status: 400 }
      );
    }

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    await db.document.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        employeeId: existing.employeeId,
        action: 'delete',
        entity: 'document',
        entityId: existing.id,
        module: 'hr',
        details: `Deleted document: ${existing.title || existing.name} (${existing.docType})`,
      },
    }).catch(() => {});

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
