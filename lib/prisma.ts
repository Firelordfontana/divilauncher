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
  console.error('DATABASE_URL environment variable is not set')
  throw new Error('DATABASE_URL environment variable is not set')
}

// Supabase requires SSL connections
let pool: Pool
let adapter: PrismaPg

try {
  pool = new Pool({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false // Supabase uses self-signed certificates
    }
  })
  adapter = new PrismaPg(pool)
} catch (error) {
  console.error('Failed to create database pool:', error)
  throw error
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

