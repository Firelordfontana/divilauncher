// TypeScript types for DiviLauncher SDK

export interface TokenInfo {
  tokenAddress: string
  name: string
  ticker: string
  description: string
  imageUrl: string
  bannerUrl?: string
  launchDate: string
  creatorWallet: string
  currentOwnerWallet: string
  platformFeePercent: number
  rewardDistributionPercent: number
  burnPercent: number
  burnToken?: string
  rewardToken: string
  initialBuyAmount: number
  socialLinks?: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
  allocationHistory?: Array<{
    date: string
    platformFeePercent: number
    rewardDistributionPercent: number
    burnPercent: number
  }>
  ownershipTransferHistory?: Array<{
    date: string
    fromWallet: string
    toWallet: string
    fee: number
  }>
}

export interface CreatorProfile {
  walletAddress: string
  username: string
  bio: string
  profileImageUrl: string
  bannerImageUrl: string
  socialLinks: {
    twitter?: string
    telegram?: string
    website?: string
    discord?: string
  }
  createdAt: string
}

export interface CreateTokenParams {
  tokenAddress: string
  name: string
  ticker: string
  description?: string
  imageUrl?: string
  bannerUrl?: string
  creatorWallet: string
  currentOwnerWallet?: string
  platformFeePercent?: number
  rewardDistributionPercent?: number
  burnPercent?: number
  burnToken?: string
  rewardToken?: string
  initialBuyAmount?: number
  socialLinks?: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
}

export interface UpdateAllocationsParams {
  walletAddress: string
  platformFeePercent?: number
  rewardDistributionPercent?: number
  burnPercent?: number
  burnToken?: string
}

export interface TransferOwnershipParams {
  fromWallet: string
  toWallet: string
  fee?: number
}

export interface UpdateProfileParams {
  username?: string
  bio?: string
  profileImageUrl?: string
  bannerImageUrl?: string
  socialLinks?: {
    twitter?: string
    telegram?: string
    website?: string
    discord?: string
  }
}

export interface GetTokensParams {
  owner?: string
  limit?: number
  offset?: number
}

export interface GetTokensResponse {
  tokens: TokenInfo[]
  total: number
  limit: number
  offset: number
}

export interface BalanceResponse {
  balance: number
  cached: boolean
}

export interface SDKConfig {
  apiUrl: string
  rpcUrl?: string
  timeout?: number
}

export class SDKError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'SDKError'
  }
}

