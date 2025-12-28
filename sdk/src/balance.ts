// Balance operations for DiviLauncher SDK

import { APIClient } from './client'
import { BalanceResponse } from './types'

interface CachedBalance {
  balance: number
  timestamp: number
}

export class BalanceAPI {
  private cache: Map<string, CachedBalance> = new Map()
  private cacheTTL = 30000 // 30 seconds

  constructor(private client: APIClient) {}

  /**
   * Get SOL balance for a wallet address
   * Uses caching to reduce API calls
   */
  async get(walletAddress: string): Promise<BalanceResponse> {
    // Check cache first
    const cached = this.cache.get(walletAddress)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return {
        balance: cached.balance,
        cached: true,
      }
    }

    // Fetch from API
    try {
      const response = await this.client.get<BalanceResponse>(
        `/api/balance?address=${walletAddress}`
      )

      // Update cache
      this.cache.set(walletAddress, {
        balance: response.balance,
        timestamp: Date.now(),
      })

      return response
    } catch (error) {
      // If API fails but we have cached data, return it
      if (cached) {
        return {
          balance: cached.balance,
          cached: true,
        }
      }
      throw error
    }
  }

  /**
   * Clear cache for a specific wallet or all wallets
   */
  clearCache(walletAddress?: string): void {
    if (walletAddress) {
      this.cache.delete(walletAddress)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Set cache TTL (time to live) in milliseconds
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl
  }
}

