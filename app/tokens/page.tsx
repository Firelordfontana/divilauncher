'use client'

import { useState, useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import Navigation from '@/components/Navigation'

interface TokenInfo {
  tokenAddress: string
  name: string
  ticker: string
  description: string
  imageUrl: string
  bannerUrl?: string
  launchDate: string
  creatorWallet?: string
  currentOwnerWallet?: string
  rewardDistributionPercent: number
  burnPercent: number
  burnToken?: string
  platformFeePercent: number
  rewardToken: string
  initialBuyAmount: number
  socialLinks?: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
}

interface TokenWithMarketData extends TokenInfo {
  marketCap?: number
  price?: number
  supply?: number
  holders?: number
}

const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenWithMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    try {
      setLoading(true)
      // Load from API
      const response = await fetch('/api/tokens')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.statusText}`)
      }
      
      const data = await response.json()
      const parsedTokens: TokenInfo[] = data.tokens || []
      
      // Fetch market data for each token
      const tokensWithMarketData = await Promise.all(
        parsedTokens.map(async (token) => {
          try {
            const marketData = await fetchTokenMarketData(token.tokenAddress)
            return { ...token, ...marketData }
          } catch (err) {
            console.error(`Failed to fetch market data for ${token.tokenAddress}:`, err)
            return token
          }
        })
      )
      setTokens(tokensWithMarketData)
    } catch (err: any) {
      console.error('Failed to load tokens:', err)
      setError('Failed to load tokens. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTokenMarketData = async (tokenAddress: string): Promise<Partial<TokenWithMarketData>> => {
    try {
      // TODO: Integrate with a real price API (Jupiter, Birdeye, DexScreener, etc.)
      // For now, return placeholder data
      // In production, you would:
      // 1. Query token supply from Solana
      // 2. Get price from Jupiter/Birdeye API
      // 3. Calculate market cap = price * supply
      // 4. Get holder count from Solana

      const connection = new Connection(RPC_ENDPOINT, 'confirmed')
      
      // Validate token address
      try {
        new PublicKey(tokenAddress)
      } catch {
        return {}
      }

      // Placeholder - replace with actual API calls
      return {
        // marketCap: 0, // Will be calculated
        // price: 0, // From price API
        // supply: 0, // From token account
        // holders: 0, // From token accounts
      }
    } catch (err) {
      console.error('Error fetching market data:', err)
      return {}
    }
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-black min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading tokens...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-black min-h-screen">
        <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 w-full">
          {/* Logo at far left */}
          <div className="flex-shrink-0">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary-500"
            >
              {/* Gold bar/stack representing dividends */}
              <rect x="10" y="20" width="40" height="8" fill="currentColor" rx="2" />
              <rect x="10" y="32" width="35" height="8" fill="currentColor" rx="2" opacity="0.8" />
              <rect x="10" y="44" width="30" height="8" fill="currentColor" rx="2" opacity="0.6" />
            </svg>
          </div>
          
          {/* Navigation and wallet button at far right */}
          <div className="flex-shrink-0 ml-auto">
            <Navigation />
          </div>
        </header>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary-400 mb-2">
            Launched Tokens
          </h1>
          <p className="text-primary-300">
            Track all tokens launched through DiviLauncher
          </p>
        </div>

        {tokens.length === 0 ? (
        <div className="bg-black border border-primary-600/30 rounded-lg p-8 text-center">
          <p className="text-gray-300 mb-4">
            No tokens have been launched yet.
          </p>
          <a
            href="/launch"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Launch your first token →
          </a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {tokens.map((token) => (
            <div
              key={token.tokenAddress}
              className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 overflow-hidden hover:shadow-xl hover:shadow-primary-600/20 transition-shadow relative max-w-[80%]"
            >
              {/* Token Image Preview - Top Right */}
              <div className="absolute top-3 right-3 z-10">
                {token.imageUrl ? (
                  <img
                    src={token.imageUrl}
                    alt={token.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-400 shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-600/30 border-2 border-primary-400 flex items-center justify-center text-primary-300 text-sm font-bold shadow-lg">
                    {token.ticker.charAt(0)}
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Token Header */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold mb-1 text-white">{token.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">
                    {token.ticker}
                  </p>
                </div>

                {/* Token Description */}
                {token.description && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                      {token.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Owner: <span className="font-mono text-gray-300">{token.currentOwnerWallet || token.creatorWallet || 'N/A'}</span>
                    </p>
                  </div>
                )}
                {!token.description && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400">
                      Owner: <span className="font-mono text-gray-300">{token.currentOwnerWallet || token.creatorWallet || 'N/A'}</span>
                    </p>
                  </div>
                )}

                {/* Contract Address */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Contract Address</p>
                  <p className="text-xs font-mono text-gray-300 break-all">
                    {token.tokenAddress}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <a
                      href={`https://solscan.io/token/${token.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View on Solscan →
                    </a>
                    <a
                      href={`https://pump.fun/${token.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View on pump.fun →
                    </a>
                  </div>
                </div>

                {/* Market Data */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                    <p className="text-sm font-semibold text-white">{formatMarketCap(token.marketCap)}</p>
                  </div>
                  {token.price && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Price</p>
                      <p className="text-sm font-semibold text-white">${token.price.toFixed(6)}</p>
                    </div>
                  )}
                </div>

                {/* Dividend Breakdown */}
                <div className="bg-black border border-primary-600/20 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-primary-400 mb-2">
                    Dividend Allocation
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fee:</span>
                      <span className="font-semibold text-primary-400">
                        {token.platformFeePercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reward Dividends:</span>
                      <span className="font-semibold text-primary-300">{token.rewardDistributionPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Burned:</span>
                      <span className="font-semibold text-red-400">
                        {token.burnPercent}%
                      </span>
                    </div>
                    {token.burnToken && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Burn Token:</span>
                        <span className="font-mono text-gray-400">
                          {token.burnToken.slice(0, 8)}...{token.burnToken.slice(-6)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-primary-600/30 pt-1 mt-1">
                      <span className="font-medium text-gray-300">Remaining:</span>
                      <span className="font-semibold text-primary-300">
                        {100 - (token.platformFeePercent + token.rewardDistributionPercent + token.burnPercent)}%
                      </span>
                    </div>
                  </div>
                  {token.rewardToken && (
                    <p className="text-xs text-gray-400 mt-2">
                      Rewards paid in: <span className="font-mono">{token.rewardToken.slice(0, 8)}...</span>
                    </p>
                  )}
                </div>

                {/* Launch Info */}
                <div className="text-xs text-gray-400">
                  <p>Launched: {formatDate(token.launchDate)}</p>
                  {token.initialBuyAmount && (
                    <p>Initial Buy: {token.initialBuyAmount} SOL</p>
                  )}
                </div>

                {/* Social Links */}
                {token.socialLinks && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-primary-600/30">
                    {token.socialLinks.website && (
                      <a
                        href={token.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                        title="Website"
                      >
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                      </a>
                    )}
                    {token.socialLinks.twitter && (
                      <a
                        href={token.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                        title="Twitter/X"
                      >
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {token.socialLinks.telegram && (
                      <a
                        href={token.socialLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                        title="Telegram"
                      >
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      </a>
                    )}
                    {token.socialLinks.discord && (
                      <a
                        href={token.socialLinks.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                        title="Discord"
                      >
                        <svg
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

