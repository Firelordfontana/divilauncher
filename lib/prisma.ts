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
  // Configure connection string with SSL and timeout
  // For Supabase connection pooling (pgbouncer), we need to handle it differently
  const isPooler = connectionString.includes('pooler.supabase.com') || connectionString.includes('pgbouncer=true')
  
  let connectionStringWithSSL = connectionString
  
  // For pooler connections, pgbouncer=true is already in the URL
  // For direct connections, add sslmode
  if (!isPooler && !connectionString.includes('sslmode=')) {
    // Use 'prefer' for flexibility (works with or without Force SSL)
    // Change to 'require' if you want to enforce SSL
    connectionStringWithSSL = connectionString.includes('?') 
      ? `${connectionString}&sslmode=prefer`
      : `${connectionString}?sslmode=prefer`
  }
  
  // Add connection timeout if not present (pooler handles this differently)
  if (!connectionStringWithSSL.includes('connect_timeout=') && !isPooler) {
    connectionStringWithSSL = connectionStringWithSSL.includes('?') 
      ? `${connectionStringWithSSL}&connect_timeout=30`
      : `${connectionStringWithSSL}?connect_timeout=30`
  }
  
  // SSL configuration:
  // - If certificate is provided, use it for verification
  // - Otherwise, use flexible SSL (works with Force SSL on or off)
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
        // Default: prefer SSL but don't verify certificate (works for serverless and with/without Force SSL)
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

