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
      bannerUrl,
      bannerData, // Base64 data for database storage
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
    let finalBannerUrl: string | null = null
    let finalBannerData: string | null = null
    
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
      
      if (bannerData && bannerData.trim() !== '') {
        // Validate size (2MB limit for base64)
        if (bannerData.length > MAX_DB_IMAGE_SIZE) {
          return NextResponse.json(
            { error: `Banner image is too large. Maximum size is ${MAX_DB_IMAGE_SIZE / 1024 / 1024}MB base64.` },
            { status: 400 }
          )
        }
        finalBannerData = bannerData
        // Also store as data URI for easy retrieval
        finalBannerUrl = bannerData.startsWith('data:') ? bannerData : `data:image/jpeg;base64,${bannerData}`
      } else if (bannerUrl && bannerUrl.trim() !== '' && !bannerUrl.startsWith('data:')) {
        // Keep existing IPFS URL if switching from IPFS to DB
        finalBannerUrl = bannerUrl
      }
    } else {
      // IPFS storage mode: use URLs only
      const normalizedAvatarUrl = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : null
      const normalizedBannerUrl = bannerUrl && bannerUrl.trim() !== '' ? bannerUrl : null
      
      // Validate that URLs are valid (should be IPFS URLs, not base64)
      if (normalizedAvatarUrl && normalizedAvatarUrl.startsWith('data:')) {
        return NextResponse.json(
          { error: 'Avatar image must be uploaded to IPFS first. Please select an image file to upload.' },
          { status: 400 }
        )
      }
      if (normalizedBannerUrl && normalizedBannerUrl.startsWith('data:')) {
        return NextResponse.json(
          { error: 'Banner image must be uploaded to IPFS first. Please select an image file to upload.' },
          { status: 400 }
        )
      }
      
      finalAvatarUrl = normalizedAvatarUrl
      finalBannerUrl = normalizedBannerUrl
    }

    // Upsert profile (create or update)
    const profile = await prisma.profile.upsert({
      where: { walletAddress },
      update: {
        username: username !== undefined ? username : undefined,
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
        avatarData: finalAvatarData !== undefined ? finalAvatarData : undefined,
        bannerUrl: finalBannerUrl !== undefined ? finalBannerUrl : undefined,
        bannerData: finalBannerData !== undefined ? finalBannerData : undefined,
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
        avatarUrl: finalAvatarUrl,
        avatarData: finalAvatarData,
        bannerUrl: finalBannerUrl,
        bannerData: finalBannerData,
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

