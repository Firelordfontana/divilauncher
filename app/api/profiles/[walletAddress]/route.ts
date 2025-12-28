import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaProfileToCreatorProfile } from '@/lib/db-helpers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { walletAddress },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profile: prismaProfileToCreatorProfile(profile),
    })
  } catch (error: any) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params
    const body = await request.json()

    const {
      username,
      bio,
      avatarUrl,
      bannerUrl,
      website,
      twitter,
      telegram,
      discord,
    } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate that URLs are valid (should be IPFS URLs, not base64)
    // If it's a base64 string (starts with data:), reject it
    if (avatarUrl && avatarUrl.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Avatar image must be uploaded to IPFS first. Please select an image file to upload.' },
        { status: 400 }
      )
    }
    if (bannerUrl && bannerUrl.startsWith('data:')) {
      return NextResponse.json(
        { error: 'Banner image must be uploaded to IPFS first. Please select an image file to upload.' },
        { status: 400 }
      )
    }

    // Upsert profile (create or update)
    const profile = await prisma.profile.upsert({
      where: { walletAddress },
      update: {
        username: username !== undefined ? username : undefined,
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        bannerUrl: bannerUrl !== undefined ? bannerUrl : undefined,
        website: website !== undefined ? website : undefined,
        twitter: twitter !== undefined ? twitter : undefined,
        telegram: telegram !== undefined ? telegram : undefined,
        discord: discord !== undefined ? discord : undefined,
        updatedAt: new Date(),
      },
      create: {
        walletAddress,
        username: username || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        bannerUrl: bannerUrl || null,
        website: website || null,
        twitter: twitter || null,
        telegram: telegram || null,
        discord: discord || null,
      },
    })

    return NextResponse.json({
      profile: prismaProfileToCreatorProfile(profile),
    })
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Failed to update profile'
    if (error.message?.includes('string') && error.message?.includes('pattern')) {
      errorMessage = 'Image is too large or invalid format. Please use a smaller image (under 2MB recommended).'
    } else if (error.message?.includes('value too long')) {
      errorMessage = 'Image is too large. Please use a smaller image (under 2MB recommended).'
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile', details: errorMessage },
      { status: 500 }
    )
  }
}

