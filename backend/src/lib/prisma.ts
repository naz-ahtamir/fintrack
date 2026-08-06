// src/lib/prisma.ts
import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient
  pool: pg.Pool 
}

// Create connection pool (reuse across hot reloads in development)
const pool = globalForPrisma.pool || new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

// Create Prisma adapter
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma