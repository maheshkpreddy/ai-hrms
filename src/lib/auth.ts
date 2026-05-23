import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
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
            details: `User ${user.name} logged in via credentials`,
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our DB
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
            include: { role: true, employee: true },
          })

          if (existingUser) {
            if (!existingUser.isActive) {
              return false
            }
            // Update last login
            await db.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            })
            // Create or update account link
            await db.account.upsert({
              where: { provider_providerAccountId: { provider: 'google', providerAccountId: account.providerAccountId } },
              create: {
                userId: existingUser.id,
                type: 'oauth',
                provider: 'google',
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
              },
              update: {
                access_token: account.access_token,
                refresh_token: account.refresh_token,
              },
            })
            // Log the login
            await db.auditLog.create({
              data: {
                userId: existingUser.id,
                employeeId: existingUser.employeeId,
                action: 'login',
                module: 'auth',
                details: `User ${existingUser.name} logged in via Google`,
              },
            })
            // Set custom fields on user object for JWT callback
            ;(user as any).dbUserId = existingUser.id
            ;(user as any).role = existingUser.role?.name || 'Employee'
            ;(user as any).roleId = existingUser.roleId
            ;(user as any).roleLevel = existingUser.role?.level || 4
            ;(user as any).permissions = existingUser.role?.permissions || '{}'
            ;(user as any).employeeId = existingUser.employeeId
            ;(user as any).avatar = existingUser.avatar || existingUser.employee?.avatar || null
          } else {
            // Auto-create user for Google sign-in
            const employeeRole = await db.role.findFirst({ where: { name: 'Employee' } })
            const newUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name || 'Google User',
                passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
                avatar: user.image || null,
                roleId: employeeRole?.id,
                isActive: true,
              },
              include: { role: true },
            })
            await db.account.create({
              data: {
                userId: newUser.id,
                type: 'oauth',
                provider: 'google',
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
              },
            })
            ;(user as any).dbUserId = newUser.id
            ;(user as any).role = newUser.role?.name || 'Employee'
            ;(user as any).roleId = newUser.roleId
            ;(user as any).roleLevel = newUser.role?.level || 4
            ;(user as any).permissions = newUser.role?.permissions || '{}'
            ;(user as any).employeeId = null
            ;(user as any).avatar = newUser.avatar
          }
        } catch (error) {
          console.error('Google auth error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        // For Google auth, use dbUserId; for credentials, use id
        token.id = (user as any).dbUserId || user.id
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
