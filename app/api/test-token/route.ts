import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaTokenToTokenInfo } from '@/lib/db-helpers'

export const dynamic = 'force-dynamic'

/**
 * POST /api/test-token
 * Creates a test token in the database for testing purposes
 */
export async function POST(request: NextRequest) {
  try {
    // Generate a fake Solana wallet address (44 characters, base58-like)
    const generateFakeAddress = () => {
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let result = ''
      for (let i = 0; i < 44; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    const testToken = {
      tokenAddress: generateFakeAddress(),
      name: 'Test Token',
      ticker: 'TEST',
      description: 'This is a test token created to verify database connectivity',
      imageUrl: 'https://via.placeholder.com/400',
      bannerUrl: null,
      creatorWallet: generateFakeAddress(),
      currentOwnerWallet: generateFakeAddress(),
      platformFeePercent: 2.0,
      rewardDistributionPercent: 5.0,
      burnPercent: 3.0,
      burnToken: null,
      rewardToken: null,
      initialBuyAmount: 0.05,
      socialLinks: {
        twitter: 'https://twitter.com/test',
        telegram: 'https://t.me/test',
        website: 'https://test.com'
      }
    }

    const createdToken = await prisma.token.create({
      data: {
        ...testToken,
        allocations: {
          create: {
            platformFeePercent: testToken.platformFeePercent,
            rewardDistributionPercent: testToken.rewardDistributionPercent,
            burnPercent: testToken.burnPercent,
          }
        }
      },
      include: {
        allocations: true,
        ownershipTransfers: true
      }
    })

    const token = prismaTokenToTokenInfo(createdToken)

    return NextResponse.json({
      success: true,
      message: 'Test token created successfully',
      token
    }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create test token:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test token',
        details: error.message
      },
      { status: 500 }
    )
  }
}

