import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaTokenToTokenInfo } from '@/lib/db-helpers'

export const dynamic = 'force-dynamic' // Force dynamic rendering for this route

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set')
      return NextResponse.json(
        { error: 'Database not configured', details: 'DATABASE_URL environment variable is missing' },
        { status: 500 }
      )
    }

    const { searchParams } = request.nextUrl
    const owner = searchParams.get('owner')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where = owner ? { creatorWallet: owner } : {}

    // Get tokens with pagination
    const [tokens, total] = await Promise.all([
      prisma.token.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          allocations: true,
          ownershipTransfers: {
            orderBy: { transferredAt: 'desc' },
          },
        },
      }),
      prisma.token.count({ where }),
    ])

    // Convert to API format
    const tokenInfos = tokens.map(prismaTokenToTokenInfo)

    return NextResponse.json({
      tokens: tokenInfos,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Failed to fetch tokens:', error)
    if (error.message?.includes('DATABASE_URL') || error.message?.includes('environment variable')) {
      return NextResponse.json(
        { error: 'Database configuration error', details: 'DATABASE_URL environment variable is not set. Please configure it in Vercel.' },
        { status: 500 }
      )
    }
    if (error.message?.includes("Can't reach database") || error.message?.includes('connection')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: 'Unable to connect to database. Please check your DATABASE_URL and database server status.' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch tokens', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      tokenAddress,
      name,
      ticker,
      description,
      imageUrl,
      website,
      telegram,
      twitter,
      discord,
      creatorWallet,
      initialOwnerWallet,
      rewardTokenAddress,
      rewardDistributionPercent = 0,
      burnPercent = 0,
      burnToken,
      platformFeePercent = 2.0,
    } = body

    // Validate required fields
    if (!tokenAddress || !name || !ticker || !creatorWallet || !initialOwnerWallet) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'tokenAddress, name, ticker, creatorWallet, and initialOwnerWallet are required' },
        { status: 400 }
      )
    }

    // Validate burnToken if burnPercent > 0
    if (burnPercent > 0 && !burnToken) {
      return NextResponse.json(
        { error: 'burnToken required when burnPercent > 0' },
        { status: 400 }
      )
    }

    // Create token
    const createdToken = await prisma.token.create({
      data: {
        tokenAddress,
        name,
        ticker,
        description: description || null,
        imageUrl: imageUrl || null,
        website: website || null,
        telegram: telegram || null,
        twitter: twitter || null,
        discord: discord || null,
        creatorWallet,
        initialOwnerWallet,
        rewardTokenAddress: rewardTokenAddress || null,
        rewardDistributionPercent,
        burnPercent,
        burnToken: burnToken || null,
        platformFeePercent,
      },
      include: {
        allocations: true,
        ownershipTransfers: true,
      },
    })

    const token = prismaTokenToTokenInfo(createdToken)

    return NextResponse.json({ success: true, token }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create token:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Token already exists', details: 'A token with this address already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create token', details: error.message },
      { status: 500 }
    )
  }
}


