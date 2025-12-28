import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prismaProfileToCreatorProfile } from '@/lib/db-helpers'
import { useDatabaseStorage, MAX_DB_IMAGE_SIZE } from '@/utils/storageConfig'

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
      avatarData, // Base64 data for database storage
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

    // Handle storage based on mode
    const useDB = useDatabaseStorage()
    
    let finalAvatarUrl: string | null = null
    let finalAvatarData: string | null = null
    
    if (useDB) {
      // Database storage mode: use base64 data
      if (avatarData && avatarData.trim() !== '') {
        // Validate size (2MB limit for base64)
        if (avatarData.length > MAX_DB_IMAGE_SIZE) {
          return NextResponse.json(
            { error: `Avatar image is too large. Maximum size is ${MAX_DB_IMAGE_SIZE / 1024 / 1024}MB base64.` },
            { status: 400 }
          )
        }
        finalAvatarData = avatarData
        // Also store as data URI for easy retrieval
        finalAvatarUrl = avatarData.startsWith('data:') ? avatarData : `data:image/jpeg;base64,${avatarData}`
      } else if (avatarUrl && avatarUrl.trim() !== '' && !avatarUrl.startsWith('data:')) {
        // Keep existing IPFS URL if switching from IPFS to DB
        finalAvatarUrl = avatarUrl
      }
    } else {
      // IPFS storage mode: use URLs only
      const normalizedAvatarUrl = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : null
      
      // Validate that URLs are valid (should be IPFS URLs, not base64)
      if (normalizedAvatarUrl && normalizedAvatarUrl.startsWith('data:')) {
        return NextResponse.json(
          { error: 'Avatar image must be uploaded to IPFS first. Please select an image file to upload.' },
          { status: 400 }
        )
      }
      
      finalAvatarUrl = normalizedAvatarUrl
    }

    // Upsert profile (create or update)
    // Build update object with only defined fields
    const updateData: any = {
      updatedAt: new Date(),
    }
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (finalAvatarUrl !== undefined) updateData.avatarUrl = finalAvatarUrl
    if (finalAvatarData !== undefined) updateData.avatarData = finalAvatarData
    if (website !== undefined) updateData.website = website
    if (twitter !== undefined) updateData.twitter = twitter
    if (telegram !== undefined) updateData.telegram = telegram
    if (discord !== undefined) updateData.discord = discord

    // Build create object
    const createData: any = {
      walletAddress,
      username: username || null,
      bio: bio || null,
      website: website || null,
      twitter: twitter || null,
      telegram: telegram || null,
      discord: discord || null,
    }
    if (finalAvatarUrl !== undefined) createData.avatarUrl = finalAvatarUrl
    if (finalAvatarData !== undefined) createData.avatarData = finalAvatarData

    const profile = await prisma.profile.upsert({
      where: { walletAddress },
      update: updateData,
      create: createData,
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

