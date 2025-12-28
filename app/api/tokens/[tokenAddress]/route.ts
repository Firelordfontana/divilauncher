import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaTokenToTokenInfo } from '@/lib/db-helpers'

// GET /api/tokens/[tokenAddress] - Get single token
export async function GET(
  request: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const prismaToken = await prisma.token.findUnique({
      where: { tokenAddress: params.tokenAddress },
      include: {
        allocations: {
          orderBy: { date: 'desc' }
        },
        ownershipTransfers: {
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!prismaToken) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    const token = prismaTokenToTokenInfo(prismaToken)

    return NextResponse.json({ token })
  } catch (error: any) {
    console.error('Failed to fetch token:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/tokens/[tokenAddress] - Update token (partial update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const body = await request.json()
    
    // Remove fields that shouldn't be updated directly
    const { tokenAddress, id, createdAt, ...updateData } = body

    const updatedPrismaToken = await prisma.token.update({
      where: { tokenAddress: params.tokenAddress },
      data: updateData,
      include: {
        allocations: {
          orderBy: { date: 'desc' }
        },
        ownershipTransfers: {
          orderBy: { date: 'desc' }
        }
      }
    })

    const token = prismaTokenToTokenInfo(updatedPrismaToken)

    return NextResponse.json({ token })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }
    console.error('Failed to update token:', error)
    return NextResponse.json(
      { error: 'Failed to update token', details: error.message },
      { status: 500 }
    )
  }
}

