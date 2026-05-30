import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

// Types for raw query results (only columns that exist in the actual DB)
interface RawUser {
  id: string
  email: string
  password: string
  name: string
  avatar: string | null
  role: string
  isActive: boolean
  companyId: string | null
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
}

interface RawEmployee {
  id: string
  employeeId: string
  avatar: string | null
}

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

        await logToDb(`Credentials: email=${credentials?.email}, hasPwd=${!!credentials?.password}, companyCode=${credentials?.companyCode}`)

        if (!credentials?.email || !credentials?.password) {
          await logToDb('FAIL: Missing email or password')
          return null
        }

        try {
          // ─── Use raw SQL to avoid Prisma schema mismatch ───
          // The Prisma client may reference columns that don't exist in the DB yet.
          // Raw SQL lets us select only the columns that actually exist.

          // Step 1: Find user by email (selecting only known-existing columns)
          const users: RawUser[] = await db.$queryRaw`
            SELECT id, email, password, name, avatar, role, "isActive", "companyId", "lastLogin", "createdAt", "updatedAt"
            FROM "User" WHERE email = ${credentials.email}
          `

          const user = users[0]

          if (!user) {
            await logToDb(`FAIL: User not found: ${credentials.email}`)
            return null
          }

          if (!user.isActive) {
            await logToDb(`FAIL: User not active: ${credentials.email}`)
            return null
          }

          // Step 2: Verify company code if provided
          let companyData: { id: string; name: string; code: string } | null = null
          if (credentials.companyCode) {
            // Find company using only columns that exist (isActive, not status)
            const companies = await db.$queryRaw<Array<{ id: string; name: string; code: string; isActive: boolean }>>`
              SELECT id, name, code, "isActive" FROM "Company" WHERE code = ${credentials.companyCode.toUpperCase()}
            `
            const company = companies[0]
            if (!company) {
              await logToDb(`FAIL: Company not found: ${credentials.companyCode}`)
              return null
            }

            // Check if company is active using isActive (boolean)
            if (!company.isActive) {
              await logToDb(`FAIL: Company not active: ${credentials.companyCode}, isActive=${company.isActive}`)
              return null
            }

            if (user.companyId && user.companyId !== company.id) {
              await logToDb(`FAIL: Company mismatch: userComp=${user.companyId}, expectedComp=${company.id}`)
              return null
            }

            companyData = { id: company.id, name: company.name, code: company.code }
          }

          // Step 3: Compare password with bcrypt hash
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            await logToDb(`FAIL: Invalid password for: ${credentials.email}`)
            return null
          }

          await logToDb(`SUCCESS: Login for: ${credentials.email}, role: ${user.role}`)

          // Step 4: Get employee info if linked
          let employeeData: { id: string; employeeId: string } | null = null
          try {
            const employees: RawEmployee[] = await db.$queryRaw`
              SELECT id, "employeeId", avatar FROM "Employee" WHERE "userId" = ${user.id}
            `
            if (employees[0]) {
              employeeData = { id: employees[0].id, employeeId: employees[0].employeeId }
            }
          } catch {
            // Employee lookup is non-critical
          }

          // Step 5: Update last login (non-critical)
          try {
            await db.$executeRaw`
              UPDATE "User" SET "lastLogin" = NOW() WHERE id = ${user.id}
            `
          } catch (e) {
            console.error('Failed to update lastLogin:', e)
          }

          // Step 6: Create audit log (non-critical)
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
            avatar: user.avatar || employeeData?.avatar || null,
            employeeId: employeeData?.id || null,
            employeeCode: employeeData?.employeeId || null,
            companyCode: companyData?.code || credentials.companyCode?.toUpperCase() || null,
            companyName: companyData?.name || null,
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
