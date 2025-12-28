import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaProfileToAPIProfile } from '@/lib/db-helpers'
import { PublicKey } from '@solana/web3.js'

// GET /api/profiles/[walletAddress] - Get profile
export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    // Validate wallet address
    try {
      new PublicKey(params.walletAddress)
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    const prismaProfile = await prisma.creatorProfile.findUnique({
      where: { walletAddress: params.walletAddress }
    })

    if (!prismaProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const profile = prismaProfileToAPIProfile(prismaProfile)

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/profiles/[walletAddress] - Update or create profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    // Validate wallet address
    try {
      new PublicKey(params.walletAddress)
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { username, bio, profileImageUrl, bannerImageUrl, socialLinks } = body

    // Upsert profile (create or update)
    const prismaProfile = await prisma.creatorProfile.upsert({
      where: { walletAddress: params.walletAddress },
      update: {
        username: username ?? undefined,
        bio: bio ?? undefined,
        profileImageUrl: profileImageUrl ?? undefined,
        bannerImageUrl: bannerImageUrl ?? undefined,
        socialLinks: socialLinks ? (socialLinks as any) : undefined,
      },
      create: {
        walletAddress: params.walletAddress,
        username: username || null,
        bio: bio || null,
        profileImageUrl: profileImageUrl || null,
        bannerImageUrl: bannerImageUrl || null,
        socialLinks: socialLinks ? (socialLinks as any) : {},
      }
    })

    const profile = prismaProfileToAPIProfile(prismaProfile)

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}

