import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Test endpoint to check database connection
export async function GET() {
  try {
    // Test 1: Check if DATABASE_URL is set
    const hasDbUrl = !!process.env.DATABASE_URL
    if (!hasDbUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL not set',
        hasDbUrl: false
      }, { status: 500 })
    }

    // Test 2: Try to query the database
    const count = await prisma.token.count()
    
    return NextResponse.json({
      success: true,
      hasDbUrl: true,
      tokenCount: count,
      message: 'Database connection successful'
    })
  } catch (error: any) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      error: 'Database test failed',
      message: error.message,
      code: error.code,
      details: error.toString()
    }, { status: 500 })
  }
}

