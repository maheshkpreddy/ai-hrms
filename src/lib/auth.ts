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
        companyCode: { label: 'Company Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { role: true, employee: true, company: true },
        })

        if (!user) {
          throw new Error('No account found with this email')
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated. Please contact HR.')
        }

        // Verify company code if provided
        if (credentials.companyCode) {
          const company = await db.company.findUnique({
            where: { code: credentials.companyCode.toUpperCase() },
          })
          if (!company) {
            throw new Error('Invalid company code. Please check and try again.')
          }
          if (!company.isActive) {
            throw new Error('This company account is inactive. Please contact support.')
          }
          if (user.companyId && user.companyId !== company.id) {
            throw new Error('You are not authorized to access this company portal.')
          }
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error('Invalid password. Please try again.')
        }

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        await db.auditLog.create({
          data: {
            userId: user.id,
            employeeId: user.employeeId,
            action: 'login',
            module: 'auth',
            details: `User ${user.name} logged in${credentials.companyCode ? ` to company ${credentials.companyCode}` : ''}`,
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
          companyId: user.companyId,
          companyCode: user.company?.code || credentials.companyCode?.toUpperCase() || null,
          companyName: user.company?.name || null,
          dashboard: user.role?.dashboard || 'employee',
          menuItems: user.role?.menuItems || null,
          roleColor: user.role?.color || 'teal',
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
        token.companyId = (user as any).companyId
        token.companyCode = (user as any).companyCode
        token.companyName = (user as any).companyName
        token.dashboard = (user as any).dashboard
        token.menuItems = (user as any).menuItems
        token.roleColor = (user as any).roleColor
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
        ;(session.user as any).companyId = token.companyId
        ;(session.user as any).companyCode = token.companyCode
        ;(session.user as any).companyName = token.companyName
        ;(session.user as any).dashboard = token.dashboard
        ;(session.user as any).menuItems = token.menuItems
        ;(session.user as any).roleColor = token.roleColor
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
