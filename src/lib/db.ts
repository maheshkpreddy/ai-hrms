import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Priority: DATABASE_URL (our configured Neon DB) > POSTGRES_PRISMA_URL (Vercel Neon integration)
// This ensures our seeded database is always used
const datasourceUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
