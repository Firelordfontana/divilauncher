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
  
  // Add connection timeout if not present
  if (!connectionStringWithSSL.includes('connect_timeout=')) {
    connectionStringWithSSL = connectionStringWithSSL.includes('?') 
      ? `${connectionStringWithSSL}&connect_timeout=30`
      : `${connectionStringWithSSL}?connect_timeout=30`
  }
  
  // For Supabase with forced SSL:
  // - If you have the certificate file, use verify-full and provide ca/cert/key
  // - For serverless (Vercel), use require with rejectUnauthorized: false
  // This allows connection without storing certificate files
  const sslConfig = process.env.SUPABASE_SSL_CERT 
    ? (() => {
        try {
          // If certificate is provided via environment variable (base64 encoded)
          const certContent = Buffer.from(process.env.SUPABASE_SSL_CERT, 'base64').toString()
          return {
            ca: certContent,
            rejectUnauthorized: true
          }
        } catch (certError) {
          console.warn('Failed to parse SUPABASE_SSL_CERT, falling back to default SSL config:', certError)
          return {
            rejectUnauthorized: false
          }
        }
      })()
    : {
        // Default: require SSL but don't verify certificate (works for serverless)
        rejectUnauthorized: false
      }
  
  pool = new Pool({ 
    connectionString: connectionStringWithSSL,
    ssl: sslConfig,
    // Connection pool settings for serverless
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  })
  adapter = new PrismaPg(pool)
} catch (error) {
  console.error('Failed to create database pool:', error)
  console.error('Connection string (masked):', connectionString?.replace(/:[^:@]+@/, ':****@'))
  throw error
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

