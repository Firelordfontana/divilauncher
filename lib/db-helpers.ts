/**
 * Database Helper Functions
 * Convert between Prisma models and API response types
 */

import { Token, Profile, Allocation, OwnershipTransfer } from '@prisma/client'

export interface TokenInfo {
  tokenAddress: string
  name: string
  ticker: string
  description: string | null
  imageUrl: string | null
  website: string | null
  telegram: string | null
  twitter: string | null
  discord: string | null
  creatorWallet: string
  currentOwnerWallet: string
  initialOwnerWallet: string
  rewardTokenAddress: string | null
  rewardDistributionPercent: number
  burnPercent: number
  burnToken: string | null
  platformFeePercent: number
  createdAt: string
  updatedAt: string
  allocations?: Array<{
    walletAddress: string
    percentage: number
  }>
  ownershipTransferHistory?: Array<{
    fromWallet: string
    toWallet: string
    transferredAt: string
  }>
}

export interface CreatorProfile {
  walletAddress: string
  username: string | null
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  website: string | null
  twitter: string | null
  telegram: string | null
  discord: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Convert Prisma Token model to API TokenInfo
 */
export function prismaTokenToTokenInfo(token: Token & {
  allocations?: Allocation[]
  ownershipTransfers?: OwnershipTransfer[]
}): TokenInfo {
  // Get current owner (most recent ownership transfer or creator)
  const latestTransfer = token.ownershipTransfers && token.ownershipTransfers.length > 0
    ? token.ownershipTransfers.sort((a, b) => 
        new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime()
      )[0]
    : null
  
  const currentOwnerWallet = latestTransfer?.toWallet || token.creatorWallet

  return {
    tokenAddress: token.tokenAddress,
    name: token.name,
    ticker: token.ticker,
    description: token.description,
    imageUrl: token.imageUrl,
    website: token.website,
    telegram: token.telegram,
    twitter: token.twitter,
    discord: token.discord,
    creatorWallet: token.creatorWallet,
    currentOwnerWallet,
    initialOwnerWallet: token.initialOwnerWallet,
    rewardTokenAddress: token.rewardTokenAddress,
    rewardDistributionPercent: token.rewardDistributionPercent,
    burnPercent: token.burnPercent,
    burnToken: token.burnToken,
    platformFeePercent: token.platformFeePercent,
    createdAt: token.createdAt.toISOString(),
    updatedAt: token.updatedAt.toISOString(),
    allocations: token.allocations?.map(a => ({
      walletAddress: a.walletAddress,
      percentage: a.percentage,
    })),
    ownershipTransferHistory: token.ownershipTransfers?.map(ot => ({
      fromWallet: ot.fromWallet,
      toWallet: ot.toWallet,
      transferredAt: ot.transferredAt.toISOString(),
    })),
  }
}

/**
 * Convert Prisma Profile model to API CreatorProfile
 */
export function prismaProfileToCreatorProfile(profile: Profile): CreatorProfile {
  return {
    walletAddress: profile.walletAddress,
    username: profile.username,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl || null,
    website: profile.website,
    twitter: profile.twitter,
    telegram: profile.telegram,
    discord: profile.discord,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  }
}

