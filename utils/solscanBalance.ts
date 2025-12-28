/**
 * Fetch SOL balance using Solscan's free public API
 * This avoids rate limits from RPC providers like Helius
 */

export interface SolscanBalanceResponse {
  success: boolean
  data: {
    lamports: string
    sol: string
  }
}

/**
 * Fetch SOL balance from Solscan API
 * @param walletAddress - Solana wallet address
 * @returns Balance in SOL (as number) or null if fetch fails
 */
export async function fetchBalanceFromSolscan(walletAddress: string): Promise<number | null> {
  try {
    // Solscan public API endpoint (free, no authentication required)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(`https://public-api.solscan.io/account/${walletAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // If rate limited or error, return null
      if (response.status === 429 || response.status >= 500) {
        console.warn('Solscan API rate limited or error, will retry later')
        return null
      }
      // Try alternative endpoint on 404
      if (response.status === 404) {
        return await fetchBalanceFromSolscanAlternative(walletAddress)
      }
      return null
    }

    const data = await response.json()
    
    // Solscan returns balance in lamports
    if (data.lamports !== undefined) {
      return parseFloat(data.lamports) / 1_000_000_000 // Convert lamports to SOL
    }
    
    // Alternative format - some endpoints return sol directly
    if (data.sol !== undefined) {
      return parseFloat(data.sol)
    }

    // Try alternative endpoint if this one doesn't have the data
    return await fetchBalanceFromSolscanAlternative(walletAddress)
  } catch (error: any) {
    // Silently handle errors - don't spam console
    if (error.name !== 'AbortError') {
      // Try alternative endpoint on error
      return await fetchBalanceFromSolscanAlternative(walletAddress)
    }
    return null
  }
}

/**
 * Alternative Solscan endpoint (fallback)
 */
async function fetchBalanceFromSolscanAlternative(walletAddress: string): Promise<number | null> {
  try {
    // Alternative: Use Solscan's mainnet API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(`https://api.solscan.io/account?address=${walletAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    // Check various possible response formats
    if (data.lamports !== undefined) {
      return parseFloat(data.lamports) / 1_000_000_000
    }
    if (data.sol !== undefined) {
      return parseFloat(data.sol)
    }
    if (data.balance !== undefined) {
      return parseFloat(data.balance) / 1_000_000_000
    }

    return null
  } catch (error: any) {
    return null
  }
}

/**
 * Fetch balance with fallback options
 * 1. Try Solscan API (free, no rate limits)
 * 2. Fall back to RPC connection if provided
 */
export async function fetchBalanceWithFallback(
  walletAddress: string,
  rpcConnection?: { getBalance: (publicKey: any) => Promise<number> },
  publicKey?: any
): Promise<number | null> {
  // First try Solscan (free, no rate limits)
  const solscanBalance = await fetchBalanceFromSolscan(walletAddress)
  if (solscanBalance !== null) {
    return solscanBalance
  }

  // Fall back to RPC if available
  if (rpcConnection && publicKey) {
    try {
      const balance = await Promise.race([
        rpcConnection.getBalance(publicKey),
        new Promise<number>((_, reject) => 
          setTimeout(() => reject(new Error('RPC timeout')), 10000)
        )
      ])
      return balance / 1_000_000_000 // Convert lamports to SOL
    } catch (error) {
      console.warn('RPC fallback failed:', error)
      return null
    }
  }

  return null
}

