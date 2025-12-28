// Database helper functions to convert between Prisma models and API types

import { Token, CreatorProfile, Allocation, OwnershipTransfer } from '@prisma/client'
import { TokenInfo, CreatorProfile as APICreatorProfile } from './storage'

// Convert Prisma Token with relations to API TokenInfo
export function prismaTokenToTokenInfo(
  token: Token & {
    allocations: Allocation[]
    ownershipTransfers: OwnershipTransfer[]
  }
): TokenInfo {
  return {
    tokenAddress: token.tokenAddress,
    name: token.name,
    ticker: token.ticker,
    description: token.description || '',
    imageUrl: token.imageUrl || '',
    bannerUrl: token.bannerUrl || undefined,
    launchDate: token.launchDate.toISOString(),
    creatorWallet: token.creatorWallet,
    currentOwnerWallet: token.currentOwnerWallet,
    platformFeePercent: token.platformFeePercent,
    rewardDistributionPercent: token.rewardDistributionPercent,
    burnPercent: token.burnPercent,
    burnToken: token.burnToken || undefined,
    rewardToken: token.rewardToken || '',
    initialBuyAmount: token.initialBuyAmount,
    socialLinks: (token.socialLinks as any) || {},
    allocationHistory: token.allocations.map((alloc) => ({
      date: alloc.date.toISOString(),
      platformFeePercent: alloc.platformFeePercent,
      rewardDistributionPercent: alloc.rewardDistributionPercent,
      burnPercent: alloc.burnPercent,
    })),
    ownershipTransferHistory: token.ownershipTransfers.map((transfer) => ({
      date: transfer.date.toISOString(),
      fromWallet: transfer.fromWallet,
      toWallet: transfer.toWallet,
      fee: transfer.fee,
    })),
  }
}

// Convert Prisma CreatorProfile to API CreatorProfile
export function prismaProfileToAPIProfile(profile: CreatorProfile): APICreatorProfile {
  return {
    walletAddress: profile.walletAddress,
    username: profile.username || '',
    bio: profile.bio || '',
    profileImageUrl: profile.profileImageUrl || '',
    bannerImageUrl: profile.bannerImageUrl || '',
    socialLinks: (profile.socialLinks as any) || {},
    createdAt: profile.createdAt.toISOString(),
  }
}

