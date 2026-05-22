import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your.email@company.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { role: true, employee: true },
        })

        if (!user) {
          throw new Error('No account found with this email')
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated. Please contact HR.')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error('Invalid password. Please try again.')
        }

        // Update last login timestamp
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // Log the login event
        await db.auditLog.create({
          data: {
            userId: user.id,
            employeeId: user.employeeId,
            action: 'login',
            module: 'auth',
            details: `User ${user.name} logged in`,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name || 'Employee',
          roleId: user.roleId,
          roleLevel: user.role?.level || 4,
          permissions: user.role?.permissions || '{}',
          employeeId: user.employeeId,
          avatar: user.avatar || user.employee?.avatar || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.roleId = (user as any).roleId
        token.roleLevel = (user as any).roleLevel
        token.permissions = (user as any).permissions
        token.employeeId = (user as any).employeeId
        token.avatar = (user as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).roleId = token.roleId
        ;(session.user as any).roleLevel = token.roleLevel
        ;(session.user as any).permissions = token.permissions
        ;(session.user as any).employeeId = token.employeeId
        ;(session.user as any).avatar = token.avatar
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
}
