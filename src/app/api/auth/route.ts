import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        company: true,
        employee: {
          include: {
            department: true,
            branch: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    try {
      await db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch (e) {
      // Non-critical, continue even if update fails
      console.error('Failed to update lastLogin:', e);
    }

    // Create audit log
    try {
      await db.auditLog.create({
        data: {
          action: 'LOGIN',
          entity: 'User',
          entityId: user.id,
          userId: user.id,
          details: `User ${user.email} logged in`,
        },
      });
    } catch (e) {
      // Non-critical, continue even if audit log fails
      console.error('Failed to create audit log:', e);
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token: Buffer.from(`${user.id}:${Date.now()}`).toString('base64'),
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
