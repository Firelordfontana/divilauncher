import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaTokenToTokenInfo } from '@/lib/db-helpers'
import { PublicKey } from '@solana/web3.js'

// POST /api/tokens/[tokenAddress]/ownership - Transfer ownership
export async function POST(
  request: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const body = await request.json()
    const { fromWallet, toWallet, fee } = body

    if (!fromWallet || !toWallet) {
      return NextResponse.json(
        { error: 'From wallet and to wallet addresses required' },
        { status: 400 }
      )
    }

    // Validate wallet addresses
    try {
      new PublicKey(fromWallet)
      new PublicKey(toWallet)
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
      token.currentOwnerWallet.toLowerCase() === fromWallet.toLowerCase() ||
      (!token.currentOwnerWallet && token.creatorWallet.toLowerCase() === fromWallet.toLowerCase())

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Only token owner can transfer ownership' },
        { status: 403 }
      )
    }

    // Prevent transferring to same wallet
    if (fromWallet.toLowerCase() === toWallet.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same wallet' },
        { status: 400 }
      )
    }

    // Transfer ownership
    const TRANSFER_FEE = 0.1 // SOL
    const updatedPrismaToken = await prisma.token.update({
      where: { tokenAddress: params.tokenAddress },
      data: {
        currentOwnerWallet: toWallet,
        ownershipTransfers: {
          create: {
            fromWallet,
            toWallet,
            fee: fee || TRANSFER_FEE,
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

    return NextResponse.json({ 
      token: updatedToken,
      message: 'Ownership transferred successfully'
    })
  } catch (error: any) {
    console.error('Failed to transfer ownership:', error)
    return NextResponse.json(
      { error: 'Failed to transfer ownership', details: error.message },
      { status: 500 }
    )
  }
}

