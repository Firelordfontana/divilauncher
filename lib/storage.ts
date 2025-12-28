// Storage utilities for localStorage-based data (will be replaced with database later)

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
  burnToken?: string // Optional: Token to buy back and burn (defaults to created token if empty)
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

// In-memory storage for server-side (will be replaced with database)
// Note: This is temporary - data will be lost on server restart
// For production, use a database (PostgreSQL, MongoDB, etc.)

let tokensStore: TokenInfo[] = []
let profilesStore: CreatorProfile[] = []

// Token operations
export function getAllTokens(): TokenInfo[] {
  // Server-side: use in-memory store
  if (typeof window === 'undefined') {
    return tokensStore
  }
  // Client-side: use localStorage
  const tokens = localStorage.getItem('launchedTokens')
  return tokens ? JSON.parse(tokens) : []
}

export function getTokenByAddress(tokenAddress: string): TokenInfo | null {
  const tokens = getAllTokens()
  return tokens.find(t => t.tokenAddress === tokenAddress) || null
}

export function getTokensByOwner(walletAddress: string): TokenInfo[] {
  const tokens = getAllTokens()
  return tokens.filter(t => 
    t.creatorWallet.toLowerCase() === walletAddress.toLowerCase() ||
    t.currentOwnerWallet.toLowerCase() === walletAddress.toLowerCase()
  )
}

export function saveToken(token: TokenInfo): void {
  if (typeof window === 'undefined') {
    // Server-side: use in-memory store
    const existingIndex = tokensStore.findIndex(t => t.tokenAddress === token.tokenAddress)
    if (existingIndex >= 0) {
      tokensStore[existingIndex] = token
    } else {
      tokensStore.push(token)
    }
  } else {
    // Client-side: use localStorage
    const tokens = getAllTokens()
    const existingIndex = tokens.findIndex(t => t.tokenAddress === token.tokenAddress)
    
    if (existingIndex >= 0) {
      tokens[existingIndex] = token
    } else {
      tokens.push(token)
    }
    
    localStorage.setItem('launchedTokens', JSON.stringify(tokens))
  }
}

export function updateTokenAllocations(
  tokenAddress: string,
  platformFeePercent: number,
  rewardDistributionPercent: number,
  burnPercent: number,
  burnToken?: string
): TokenInfo | null {
  const token = getTokenByAddress(tokenAddress)
  if (!token) return null
  
  token.platformFeePercent = platformFeePercent
  token.rewardDistributionPercent = rewardDistributionPercent
  token.burnPercent = burnPercent
  if (burnToken !== undefined) {
    token.burnToken = burnToken || undefined
  }
  
  if (!token.allocationHistory) {
    token.allocationHistory = []
  }
  
  token.allocationHistory.push({
    date: new Date().toISOString(),
    platformFeePercent,
    rewardDistributionPercent,
    burnPercent
  })
  
  saveToken(token)
  return token
}

export function transferTokenOwnership(
  tokenAddress: string,
  fromWallet: string,
  toWallet: string,
  fee: number
): TokenInfo | null {
  const token = getTokenByAddress(tokenAddress)
  if (!token) return null
  
  if (token.currentOwnerWallet.toLowerCase() !== fromWallet.toLowerCase() &&
      token.creatorWallet.toLowerCase() !== fromWallet.toLowerCase()) {
    return null // Not authorized
  }
  
  token.currentOwnerWallet = toWallet
  
  if (!token.ownershipTransferHistory) {
    token.ownershipTransferHistory = []
  }
  
  token.ownershipTransferHistory.push({
    date: new Date().toISOString(),
    fromWallet,
    toWallet,
    fee
  })
  
  saveToken(token)
  return token
}

// Profile operations
export function getAllProfiles(): CreatorProfile[] {
  // Server-side: use in-memory store
  if (typeof window === 'undefined') {
    return profilesStore
  }
  // Client-side: use localStorage
  const profiles = localStorage.getItem('creatorProfiles')
  return profiles ? JSON.parse(profiles) : []
}

export function getProfileByWallet(walletAddress: string): CreatorProfile | null {
  const profiles = getAllProfiles()
  return profiles.find(p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()) || null
}

export function saveProfile(profile: CreatorProfile): void {
  if (typeof window === 'undefined') {
    // Server-side: use in-memory store
    const existingIndex = profilesStore.findIndex(p => 
      p.walletAddress.toLowerCase() === profile.walletAddress.toLowerCase()
    )
    if (existingIndex >= 0) {
      profilesStore[existingIndex] = profile
    } else {
      profilesStore.push(profile)
    }
  } else {
    // Client-side: use localStorage
    const profiles = getAllProfiles()
    const existingIndex = profiles.findIndex(p => 
      p.walletAddress.toLowerCase() === profile.walletAddress.toLowerCase()
    )
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = profile
    } else {
      profiles.push(profile)
    }
    
    localStorage.setItem('creatorProfiles', JSON.stringify(profiles))
  }
}

