/**
 * Share-Based Distribution System
 * 
 * Rules:
 * - 500,000 tokens = 1 share
 * - Maximum 50 shares per wallet
 * - Rewards distributed proportionally based on shares
 */

export const SHARES_PER_500K = 1
export const TOKENS_PER_SHARE = 500000
export const MAX_SHARES_PER_WALLET = 50
export const MAX_TOKENS_FOR_SHARES = MAX_SHARES_PER_WALLET * TOKENS_PER_SHARE // 25,000,000

/**
 * Calculate shares for a given token balance
 * @param balance - Token balance (in smallest unit, accounting for decimals)
 * @param decimals - Token decimals (usually 6 or 9 for Solana tokens)
 * @returns Number of shares (capped at MAX_SHARES_PER_WALLET)
 */
export function calculateShares(balance: bigint, decimals: number = 6): number {
  // Convert balance to actual token amount (accounting for decimals)
  const divisor = BigInt(10 ** decimals)
  const tokenAmount = Number(balance / divisor)
  
  // Calculate shares: 500k tokens = 1 share
  const shares = Math.floor(tokenAmount / TOKENS_PER_SHARE)
  
  // Cap at maximum shares per wallet
  return Math.min(shares, MAX_SHARES_PER_WALLET)
}

/**
 * Calculate total shares across all holders
 * @param holders - Array of holder balances
 * @param decimals - Token decimals
 * @returns Total shares across all holders
 */
export function calculateTotalShares(
  holders: Array<{ address: string; balance: bigint }>,
  decimals: number = 6
): number {
  let totalShares = 0
  
  for (const holder of holders) {
    totalShares += calculateShares(holder.balance, decimals)
  }
  
  return totalShares
}

/**
 * Calculate reward amount for a specific holder
 * @param holderBalance - Holder's token balance
 * @param totalRewardAmount - Total reward amount to distribute
 * @param totalShares - Total shares across all holders
 * @param decimals - Token decimals
 * @returns Reward amount for this holder
 */
export function calculateHolderReward(
  holderBalance: bigint,
  totalRewardAmount: bigint,
  totalShares: number,
  decimals: number = 6
): bigint {
  if (totalShares === 0) {
    return BigInt(0)
  }
  
  const holderShares = calculateShares(holderBalance, decimals)
  if (holderShares === 0) {
    return BigInt(0)
  }
  
  // Calculate proportional reward: (holderShares / totalShares) * totalRewardAmount
  const rewardMultiplier = BigInt(holderShares)
  const rewardDivisor = BigInt(totalShares)
  
  // Use integer division to avoid floating point issues
  const reward = (totalRewardAmount * rewardMultiplier) / rewardDivisor
  
  return reward
}

/**
 * Distribute rewards to all holders based on shares
 * @param holders - Array of holder balances
 * @param totalRewardAmount - Total reward amount to distribute
 * @param decimals - Token decimals
 * @returns Array of reward amounts for each holder
 */
export function distributeRewards(
  holders: Array<{ address: string; balance: bigint }>,
  totalRewardAmount: bigint,
  decimals: number = 6
): Array<{ address: string; shares: number; reward: bigint }> {
  const totalShares = calculateTotalShares(holders, decimals)
  
  if (totalShares === 0) {
    return holders.map(holder => ({
      address: holder.address,
      shares: 0,
      reward: BigInt(0),
    }))
  }
  
  return holders.map(holder => {
    const shares = calculateShares(holder.balance, decimals)
    const reward = calculateHolderReward(
      holder.balance,
      totalRewardAmount,
      totalShares,
      decimals
    )
    
    return {
      address: holder.address,
      shares,
      reward,
    }
  })
}

/**
 * Example usage and testing
 */
export function exampleShareCalculation() {
  // Example holders
  const holders = [
    { address: 'wallet1', balance: BigInt(2500000 * 1e6) }, // 2.5M tokens = 5 shares
    { address: 'wallet2', balance: BigInt(1000000 * 1e6) }, // 1M tokens = 2 shares
    { address: 'wallet3', balance: BigInt(30000000 * 1e6) }, // 30M tokens = 50 shares (capped)
    { address: 'wallet4', balance: BigInt(250000 * 1e6) }, // 250k tokens = 0 shares
  ]
  
  const totalReward = BigInt(1000 * 1e6) // 1000 reward tokens
  const decimals = 6
  
  const distribution = distributeRewards(holders, totalReward, decimals)
  
  console.log('Share-based distribution:')
  distribution.forEach(({ address, shares, reward }) => {
    console.log(`${address}: ${shares} shares, ${Number(reward) / 1e6} reward tokens`)
  })
  
  // Total shares: 5 + 2 + 50 + 0 = 57 shares
  // wallet1: 5/57 of rewards
  // wallet2: 2/57 of rewards
  // wallet3: 50/57 of rewards (even though they hold 30M tokens)
  // wallet4: 0/57 of rewards (below 500k threshold)
}



