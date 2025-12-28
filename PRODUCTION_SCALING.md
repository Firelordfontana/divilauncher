# Production Scaling Guide for RPC Endpoints

## The Problem

**Free tier Helius API keys have rate limits:**
- Typically ~100,000 requests/month
- With hundreds of users, each fetching balance every 60 seconds:
  - 100 users × 1 request/minute × 60 minutes × 24 hours = **144,000 requests/day**
  - That's **4.3 million requests/month** - way over the free tier limit!

**Current architecture issues:**
- Every user makes direct RPC calls from their browser
- No caching or rate limiting on the client side
- API key is exposed in client-side code (security risk)
- No load balancing or failover

## Production Solutions

### Option 1: Backend API with Caching (RECOMMENDED)

**How it works:**
- Move all RPC calls to your backend API
- Cache balance data (e.g., 30-60 seconds)
- Single RPC endpoint serves all users
- API key stays secure on the server

**Benefits:**
- ✅ Much lower RPC usage (caching reduces calls by 90%+)
- ✅ API key is secure (not exposed to clients)
- ✅ Can use free tier for small apps, paid tier for scale
- ✅ Better error handling and retry logic
- ✅ Can add rate limiting per user

**Implementation:**

```typescript
// app/api/balance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Redis } from '@upstash/redis' // Or use any Redis provider

const connection = new Connection(process.env.SOLANA_RPC_URL!)
const redis = new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN })

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('address')
  if (!walletAddress) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  try {
    // Check cache first (30 second TTL)
    const cacheKey = `balance:${walletAddress}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json({ balance: cached })
    }

    // Fetch from RPC
    const publicKey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(publicKey)
    const solBalance = balance / LAMPORTS_PER_SOL

    // Cache for 30 seconds
    await redis.setex(cacheKey, 30, solBalance)

    return NextResponse.json({ balance: solBalance })
  } catch (error) {
    console.error('Balance fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
```

**Frontend update:**

```typescript
// Instead of: connection.getBalance(wallet.publicKey)
// Use: fetch(`/api/balance?address=${wallet.publicKey.toBase58()}`)
```

### Option 2: Paid Helius Plan

**Pricing:**
- **Developer Plan**: ~$99/month - 1M requests/month
- **Startup Plan**: ~$499/month - 10M requests/month
- **Business Plan**: Custom pricing - unlimited

**When to use:**
- Small to medium apps (< 1,000 active users)
- Don't want to build backend caching
- Need immediate solution

**Still recommended:** Use backend API even with paid plan (better security, caching, error handling)

### Option 3: Multiple RPC Endpoints with Load Balancing

**How it works:**
- Use multiple free tier API keys
- Rotate between them
- Distribute load across endpoints

**Implementation:**

```typescript
// utils/rpcLoadBalancer.ts
const RPC_ENDPOINTS = [
  process.env.HELIUS_RPC_1,
  process.env.HELIUS_RPC_2,
  process.env.HELIUS_RPC_3,
].filter(Boolean)

let currentIndex = 0

export function getNextRpcEndpoint(): string {
  const endpoint = RPC_ENDPOINTS[currentIndex]
  currentIndex = (currentIndex + 1) % RPC_ENDPOINTS.length
  return endpoint
}
```

**Limitations:**
- Still exposes API keys to clients
- More complex error handling
- Not a long-term solution

### Option 4: Hybrid Approach (BEST FOR PRODUCTION)

**Combine:**
1. Backend API with Redis caching
2. Paid Helius plan (for reliability)
3. Fallback to public RPC if Helius fails
4. Rate limiting per user/IP

**Architecture:**
```
User Browser → Your Backend API → Redis Cache → Helius RPC
                                      ↓ (cache miss)
                              Helius RPC → Cache result
```

## Recommended Production Setup

### 1. Backend API Route

```typescript
// app/api/balance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Use server-side only (not NEXT_PUBLIC_*)
const connection = new Connection(process.env.SOLANA_RPC_URL!)

// Simple in-memory cache (or use Redis for production)
const balanceCache = new Map<string, { balance: number; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get('address')
  if (!walletAddress) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  try {
    // Check cache
    const cached = balanceCache.get(walletAddress)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ balance: cached.balance })
    }

    // Fetch from RPC
    const publicKey = new PublicKey(walletAddress)
    const balance = await connection.getBalance(publicKey)
    const solBalance = balance / LAMPORTS_PER_SOL

    // Update cache
    balanceCache.set(walletAddress, { balance: solBalance, timestamp: Date.now() })

    return NextResponse.json({ balance: solBalance })
  } catch (error) {
    console.error('Balance fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
```

### 2. Update Frontend to Use API

```typescript
// Replace direct RPC calls with API calls
const fetchBalance = async () => {
  if (!wallet.publicKey) return
  try {
    const response = await fetch(`/api/balance?address=${wallet.publicKey.toBase58()}`)
    const data = await response.json()
    setSolBalance(data.balance)
  } catch (err) {
    console.error('Failed to fetch balance:', err)
  }
}
```

### 3. Environment Variables

```env
# .env.local (development)
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# .env.production (production - use paid plan)
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_PAID_KEY
```

## Cost Estimates

**With backend caching (30 second cache):**
- 100 active users: ~2,880 requests/day = ~86k/month (fits free tier)
- 1,000 active users: ~28,800 requests/day = ~864k/month (needs Developer plan)
- 10,000 active users: ~288k requests/day = ~8.6M/month (needs Startup plan)

**Without caching:**
- 100 users: ~144k requests/day = ~4.3M/month (needs Startup plan)
- 1,000 users: ~1.4M requests/day = ~43M/month (needs Business plan)

## Security Best Practices

1. **Never expose API keys in client-side code**
   - ❌ `NEXT_PUBLIC_SOLANA_RPC_URL` (exposed to browser)
   - ✅ `SOLANA_RPC_URL` (server-side only)

2. **Use environment variables**
   - Development: `.env.local`
   - Production: Vercel/Netlify environment variables

3. **Add rate limiting**
   - Limit requests per user/IP
   - Prevent abuse

4. **Monitor usage**
   - Track RPC request counts
   - Set up alerts for rate limits

## Next Steps

1. **Immediate (for current setup):**
   - Keep free tier for development
   - Monitor usage

2. **Before launch:**
   - Implement backend API with caching
   - Move API key to server-side only
   - Add Redis caching (optional but recommended)

3. **At scale:**
   - Upgrade to paid Helius plan
   - Add monitoring and alerts
   - Implement rate limiting

## Summary

**For production with hundreds of users:**
- ✅ Use backend API (not client-side RPC calls)
- ✅ Add caching (Redis or in-memory)
- ✅ Keep API key server-side only
- ✅ Consider paid Helius plan for reliability
- ✅ Monitor and set up alerts

**Current setup (client-side RPC):**
- ⚠️ Fine for development
- ❌ Won't scale to hundreds of users
- ❌ API key exposed to clients
- ❌ No caching = excessive RPC usage

