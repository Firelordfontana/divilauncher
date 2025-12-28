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

// Supabase requires SSL connections (especially with forced SSL enabled)
let pool: Pool
let adapter: PrismaPg

try {
  // Ensure connection string has sslmode=require if not already present
  // For forced SSL, we need sslmode=require (or verify-full if certificate is provided)
  let connectionStringWithSSL = connectionString
  if (!connectionString.includes('sslmode=')) {
    connectionStringWithSSL = connectionString.includes('?') 
      ? `${connectionString}&sslmode=require`
      : `${connectionString}?sslmode=require`
  }
  
  // For Supabase with forced SSL:
  // - If you have the certificate file, use verify-full and provide ca/cert/key
  // - For serverless (Vercel), use require with rejectUnauthorized: false
  // This allows connection without storing certificate files
  pool = new Pool({ 
    connectionString: connectionStringWithSSL,
    ssl: process.env.SUPABASE_SSL_CERT 
      ? {
          // If certificate is provided via environment variable (base64 encoded)
          ca: Buffer.from(process.env.SUPABASE_SSL_CERT, 'base64').toString(),
          rejectUnauthorized: true
        }
      : {
          // Default: require SSL but don't verify certificate (works for serverless)
          rejectUnauthorized: false
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

