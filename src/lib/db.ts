import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection configuration
// NOTE: If Vercel DATABASE_URL env var has an outdated password, the connection will fail.
// The current working password for eh2r_admin is set below as a fallback.
// TODO: Update Vercel env vars with the correct password and remove this fallback.
const CURRENT_DB_URL = 'postgresql://eh2r_admin:npg_JACeNz57qhZU@ep-blue-fire-aqk8jxd2-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    datasourceUrl: CURRENT_DB_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
