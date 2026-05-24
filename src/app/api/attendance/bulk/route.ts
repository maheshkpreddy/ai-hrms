import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records, markedBy } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'records array is required and must not be empty' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const errors: { employeeId: string; error: string }[] = [];

    for (const record of records) {
      try {
        if (!record.employeeId || !record.date) {
          errors.push({ employeeId: record.employeeId, error: 'employeeId and date are required' });
          continue;
        }

        // Verify employee exists
        const employee = await db.employee.findUnique({ where: { id: record.employeeId } });
        if (!employee) {
          errors.push({ employeeId: record.employeeId, error: 'Employee not found' });
          continue;
        }

        // Check for duplicate
        const existing = await db.attendance.findFirst({
          where: { employeeId: record.employeeId, date: record.date },
        });

        if (existing) {
          // Update the existing record instead
          const updated = await db.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status || existing.status,
              checkIn: record.checkIn || existing.checkIn,
              checkOut: record.checkOut || existing.checkOut,
              shift: record.shift || existing.shift,
              location: record.location || existing.location,
              notes: record.notes || existing.notes,
            },
            include: {
              employee: {
                select: { firstName: true, lastName: true, employeeId: true },
              },
            },
          });
          results.push(updated);
        } else {
          const created = await db.attendance.create({
            data: {
              employeeId: record.employeeId,
              date: record.date,
              checkIn: record.checkIn || '09:00',
              checkOut: record.checkOut,
              status: record.status || 'present',
              shift: record.shift,
              location: record.location || 'Office',
              notes: record.notes,
            },
            include: {
              employee: {
                select: { firstName: true, lastName: true, employeeId: true },
              },
            },
          });
          results.push(created);
        }

        // Audit log
        await db.auditLog.create({
          data: {
            employeeId: record.employeeId,
            action: existing ? 'update' : 'create',
            module: 'attendance',
            details: `Attendance ${existing ? 'updated' : 'created'} for ${record.employeeId} on ${record.date} by ${markedBy || 'admin'}`,
          },
        });
      } catch (err) {
        errors.push({ employeeId: record.employeeId, error: 'Failed to process record' });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} records successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in bulk attendance:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk attendance' },
      { status: 500 }
    );
  }
}
