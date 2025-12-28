import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Simple in-memory cache (in production, use Redis)
const balanceCache = new Map<string, { balance: number; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

// GET /api/balance?address=... - Get SOL balance with caching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter required' },
        { status: 400 }
      )
    }

    // Validate wallet address
    let publicKey: PublicKey
    try {
      publicKey = new PublicKey(address)
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Check cache
    const cached = balanceCache.get(address)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ 
        balance: cached.balance,
        cached: true
      })
    }

    // Fetch from RPC
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')

    try {
      const balance = await connection.getBalance(publicKey)
      const solBalance = balance / LAMPORTS_PER_SOL

      // Update cache
      balanceCache.set(address, { balance: solBalance, timestamp: Date.now() })

      // Clean old cache entries (keep last 100)
      if (balanceCache.size > 100) {
        const entries = Array.from(balanceCache.entries())
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
        balanceCache.clear()
        entries.slice(0, 100).forEach(([key, value]) => {
          balanceCache.set(key, value)
        })
      }

      return NextResponse.json({ 
        balance: solBalance,
        cached: false
      })
    } catch (rpcError: any) {
      // If RPC fails but we have cached data, return it
      if (cached) {
        return NextResponse.json({ 
          balance: cached.balance,
          cached: true,
          warning: 'Using cached balance due to RPC error'
        })
      }

      throw rpcError
    }
  } catch (error: any) {
    console.error('Failed to fetch balance:', error)
    
    // Silently handle rate limit errors
    const isRateLimit = error?.message?.includes('403') || 
                       error?.message?.includes('rate limit') ||
                       error?.message?.includes('Forbidden')

    if (isRateLimit) {
      return NextResponse.json(
        { error: 'Rate limited', balance: null },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch balance', details: error.message },
      { status: 500 }
    )
  }
}

