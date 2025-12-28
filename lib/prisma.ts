// Prisma Client Singleton
// Prevents multiple instances of Prisma Client in development

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Remove any sslmode from connection string - we'll handle SSL via Pool config
let connectionStringWithSSL = connectionString.replace(/[?&]sslmode=[^&]*/g, '')

// Create pool with SSL config that accepts self-signed certificates
// CRITICAL: We must set rejectUnauthorized: false for Supabase's self-signed certs
const pool = new Pool({
  connectionString: connectionStringWithSSL,
  ssl: {
    rejectUnauthorized: false // CRITICAL: Allow Supabase's self-signed certificate
  },
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
