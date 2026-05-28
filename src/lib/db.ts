import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection URLs - try configured URL first, fall back to known working URLs
const PRIMARY_URL = process.env.DATABASE_URL
const FALLBACK_URLS = [
  // Current working password (updated 2026-05-28)
  'postgresql://eh2r_admin:npg_JACeNz57qhZU@ep-blue-fire-aqk8jxd2-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require',
]

function getDatabaseUrl(): string {
  if (PRIMARY_URL && !PRIMARY_URL.includes('file:')) {
    return PRIMARY_URL
  }
  // If PRIMARY_URL is a local SQLite file or not set, use the fallback
  console.warn('[db] Primary DATABASE_URL not suitable, using fallback Neon URL')
  return FALLBACK_URLS[0]
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    datasourceUrl: getDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
