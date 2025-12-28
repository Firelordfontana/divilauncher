import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaTokenToTokenInfo } from '@/lib/db-helpers'
import { PublicKey } from '@solana/web3.js'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/tokens - List all tokens
export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is set
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

    // Validate wallet address if provided
    if (owner) {
      try {
        new PublicKey(owner)
      } catch {
        return NextResponse.json(
          { error: 'Invalid wallet address' },
          { status: 400 }
        )
      }
    }

    // Build where clause
    const where = owner
      ? {
          OR: [
            { creatorWallet: owner },
            { currentOwnerWallet: owner }
          ]
        }
      : {}

    // Get total count
    const total = await prisma.token.count({ where })

    // Fetch tokens with relations
    const prismaTokens = await prisma.token.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { launchDate: 'desc' },
      include: {
        allocations: {
          orderBy: { date: 'desc' }
        },
        ownershipTransfers: {
          orderBy: { date: 'desc' }
        }
      }
    })

    // Convert to API format
    const tokens = prismaTokens.map(prismaTokenToTokenInfo)

    return NextResponse.json({
      tokens,
      total,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Failed to fetch tokens:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('DATABASE_URL') || error.message?.includes('environment variable')) {
      return NextResponse.json(
        { error: 'Database configuration error', details: 'DATABASE_URL environment variable is not set. Please configure it in Vercel.' },
        { status: 500 }
      )
    }
    
    if (error.message?.includes('Can\'t reach database') || error.message?.includes('connection')) {
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

// POST /api/tokens - Create new token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tokenAddress,
      name,
      ticker,
      description,
      imageUrl,
      bannerUrl,
      creatorWallet,
      currentOwnerWallet,
      platformFeePercent,
      rewardDistributionPercent,
      burnPercent,
      burnToken,
      rewardToken,
      initialBuyAmount,
      socialLinks
    } = body

    // Validate required fields
    if (!tokenAddress || !name || !ticker || !creatorWallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate wallet addresses
    try {
      new PublicKey(creatorWallet)
      if (currentOwnerWallet) {
        new PublicKey(currentOwnerWallet)
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Validate percentages
    if (platformFeePercent < 0 || platformFeePercent > 10) {
      return NextResponse.json(
        { error: 'Platform fee must be between 0 and 10%' },
        { status: 400 }
      )
    }

    if (rewardDistributionPercent < 0 || rewardDistributionPercent > 100) {
      return NextResponse.json(
        { error: 'Reward distribution must be between 0 and 100%' },
        { status: 400 }
      )
    }

    if (burnPercent < 0 || burnPercent > 100) {
      return NextResponse.json(
        { error: 'Burn percentage must be between 0 and 100%' },
        { status: 400 }
      )
    }

    // Validate burnToken if provided
    if (burnToken !== undefined && burnToken.trim() !== '') {
      try {
        new PublicKey(burnToken)
      } catch {
        return NextResponse.json(
          { error: 'Invalid burn token address' },
          { status: 400 }
        )
      }
    }

    // Create token in database
    const createdToken = await prisma.token.create({
      data: {
        tokenAddress,
        name,
        ticker,
        description: description || '',
        imageUrl: imageUrl || '',
        bannerUrl: bannerUrl || null,
        creatorWallet,
        currentOwnerWallet: currentOwnerWallet || creatorWallet,
        platformFeePercent: platformFeePercent || 2,
        rewardDistributionPercent: rewardDistributionPercent || 0,
        burnPercent: burnPercent || 0,
        burnToken: burnToken || null,
        rewardToken: rewardToken || '',
        initialBuyAmount: initialBuyAmount || 0.05,
        socialLinks: socialLinks || {},
        allocations: {
          create: {
            platformFeePercent: platformFeePercent || 2,
            rewardDistributionPercent: rewardDistributionPercent || 0,
            burnPercent: burnPercent || 0,
          }
        }
      },
      include: {
        allocations: true,
        ownershipTransfers: true
      }
    })

    const token = prismaTokenToTokenInfo(createdToken)

    return NextResponse.json({ token }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create token:', error)
    return NextResponse.json(
      { error: 'Failed to create token', details: error.message },
      { status: 500 }
    )
  }
}

