import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection configuration
const CURRENT_DB_URL = process.env.DATABASE_URL || 'postgresql://eh2r_admin:npg_2bRKB1CZl6Fe@ep-blue-fire-aqk8jxd2-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    datasourceUrl: CURRENT_DB_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
