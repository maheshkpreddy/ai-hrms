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
        // Debug: Log to database so we can see what's happening
        const logToDb = async (msg: string) => {
          try {
            await db.auditLog.create({ data: { action: 'AUTH_DEBUG', entity: 'Auth', details: msg, userId: 'system' } })
          } catch {}
        }

        await logToDb(`Credentials: email=${credentials?.email}, hasPwd=${!!credentials?.password}, companyCode=${credentials?.companyCode}, keys=${credentials ? Object.keys(credentials).join(',') : 'none'}`)

        if (!credentials?.email || !credentials?.password) {
          await logToDb('FAIL: Missing email or password')
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: { company: true, employee: true },
          })

          if (!user) {
            await logToDb(`FAIL: User not found: ${credentials.email}`)
            return null
          }

          if (!user.isActive) {
            await logToDb(`FAIL: User not active: ${credentials.email}`)
            return null
          }

          // Verify company code if provided
          if (credentials.companyCode) {
            const company = await db.company.findUnique({
              where: { code: credentials.companyCode.toUpperCase() },
            })
            if (!company) {
              await logToDb(`FAIL: Company not found: ${credentials.companyCode}`)
              return null
            }
            if (company.status !== 'active') {
              await logToDb(`FAIL: Company not active: ${credentials.companyCode}, status=${company.status}`)
              return null
            }
            if (user.companyId && user.companyId !== company.id) {
              await logToDb(`FAIL: Company mismatch: userComp=${user.companyId}, expectedComp=${company.id}`)
              return null
            }
          }

          // Compare password with bcrypt hash
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            await logToDb(`FAIL: Invalid password for: ${credentials.email}`)
            return null
          }

          await logToDb(`SUCCESS: Login for: ${credentials.email}, role: ${user.role}`)

          // Update last login (non-critical)
          try {
            await db.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            })
          } catch (e) {
            console.error('Failed to update lastLogin:', e)
          }

          // Create audit log (non-critical)
          try {
            await db.auditLog.create({
              data: {
                action: 'LOGIN',
                entity: 'User',
                entityId: user.id,
                userId: user.id,
                details: `User ${user.name} logged in`,
              },
            })
          } catch (e) {
            console.error('Failed to create audit log:', e)
          }

          // Determine dashboard based on role
          const roleToDashboard: Record<string, string> = {
            super_admin: 'admin',
            company_hr_admin: 'hr',
            hr_executive: 'hr',
            reporting_manager: 'manager',
            dept_head: 'manager',
            finance: 'hr',
            it_admin: 'admin',
            recruiter: 'recruiter',
            employee: 'employee',
            client: 'employee',
            vendor: 'employee',
            sub_vendor: 'employee',
            auditor: 'admin',
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            avatar: user.avatar || user.employee?.avatar || null,
            employeeId: user.employee?.id || null,  // Database UUID for API lookups
            employeeCode: user.employee?.employeeId || null,  // Human-readable code like EMP001
            companyCode: user.company?.code || credentials.companyCode?.toUpperCase() || null,
            companyName: user.company?.name || null,
            dashboard: roleToDashboard[user.role] || 'employee',
          }
        } catch (error) {
          console.error('[AUTH DEBUG] Auth error:', error)
          await logToDb(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.companyId = (user as any).companyId
        token.avatar = (user as any).avatar
        token.employeeId = (user as any).employeeId
        token.employeeCode = (user as any).employeeCode
        token.companyCode = (user as any).companyCode
        token.companyName = (user as any).companyName
        token.dashboard = (user as any).dashboard
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).companyId = token.companyId
        ;(session.user as any).avatar = token.avatar
        ;(session.user as any).employeeId = token.employeeId
        ;(session.user as any).employeeCode = token.employeeCode
        ;(session.user as any).companyCode = token.companyCode
        ;(session.user as any).companyName = token.companyName
        ;(session.user as any).dashboard = token.dashboard
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
  secret: process.env.NEXTAUTH_SECRET || process.env.NEXT_PUBLIC_NEXTAUTH_SECRET || 'dev-secret-change-in-production',
  debug: process.env.NODE_ENV === 'development',
}
