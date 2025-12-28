import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaTokenToTokenInfo } from '@/lib/db-helpers'
import { PublicKey } from '@solana/web3.js'

// PUT /api/tokens/[tokenAddress]/allocations - Update allocations
export async function PUT(
  request: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const body = await request.json()
    const { walletAddress, platformFeePercent, rewardDistributionPercent, burnPercent, burnToken } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Validate wallet address
    try {
      new PublicKey(walletAddress)
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Get token to verify ownership
    const token = await prisma.token.findUnique({
      where: { tokenAddress: params.tokenAddress }
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const isOwner = 
      token.currentOwnerWallet.toLowerCase() === walletAddress.toLowerCase() ||
      (!token.currentOwnerWallet && token.creatorWallet.toLowerCase() === walletAddress.toLowerCase())

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Only token owner can update allocations' },
        { status: 403 }
      )
    }

    // Validate percentages
    if (platformFeePercent !== undefined && (platformFeePercent < 0 || platformFeePercent > 10)) {
      return NextResponse.json(
        { error: 'Platform fee must be between 0 and 10%' },
        { status: 400 }
      )
    }

    if (rewardDistributionPercent !== undefined && (rewardDistributionPercent < 0 || rewardDistributionPercent > 100)) {
      return NextResponse.json(
        { error: 'Reward distribution must be between 0 and 100%' },
        { status: 400 }
      )
    }

    if (burnPercent !== undefined && (burnPercent < 0 || burnPercent > 100)) {
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

    // Update token and create allocation history entry
    const updatedPrismaToken = await prisma.token.update({
      where: { tokenAddress: params.tokenAddress },
      data: {
        platformFeePercent: platformFeePercent ?? token.platformFeePercent,
        rewardDistributionPercent: rewardDistributionPercent ?? token.rewardDistributionPercent,
        burnPercent: burnPercent ?? token.burnPercent,
        burnToken: burnToken !== undefined ? (burnToken || null) : token.burnToken,
        allocations: {
          create: {
            platformFeePercent: platformFeePercent ?? token.platformFeePercent,
            rewardDistributionPercent: rewardDistributionPercent ?? token.rewardDistributionPercent,
            burnPercent: burnPercent ?? token.burnPercent,
          }
        }
      },
      include: {
        allocations: {
          orderBy: { date: 'desc' }
        },
        ownershipTransfers: {
          orderBy: { date: 'desc' }
        }
      }
    })

    const updatedToken = prismaTokenToTokenInfo(updatedPrismaToken)

    return NextResponse.json({ token: updatedToken })
  } catch (error: any) {
    console.error('Failed to update allocations:', error)
    return NextResponse.json(
      { error: 'Failed to update allocations', details: error.message },
      { status: 500 }
    )
  }
}

