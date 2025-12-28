import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { status: 'error', message: 'DATABASE_URL not set' },
        { status: 500 }
      )
    }

    // Test raw query
    const result = await prisma.$queryRaw`SELECT NOW() as time, current_database() as database`
    
    // Test model query
    const tokenCount = await prisma.token.count()
    const profileCount = await prisma.profile.count()

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful!',
      databaseTime: (result as any[])[0].time,
      databaseName: (result as any[])[0].database,
      tokenCount,
      profileCount,
    })
  } catch (error: any) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed', 
        details: error.message,
        errorCode: error.code,
      },
      { status: 500 }
    )
  }
}

