# API & SDK Implementation Guide for DiviLauncher

## Overview

This guide outlines how to implement a backend API and SDK for DiviLauncher, transitioning from the current localStorage-based frontend to a production-ready architecture.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   API Server    │
│  (Next.js API   │
│   Routes or     │
│   Express)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Database│ │ Solana  │
│(Postgres│ │Program │
│/MongoDB)│ │        │
└────────┘ └────────┘
```

## Step 1: Database Setup

### Option A: PostgreSQL (Recommended for Production)

```bash
npm install pg @types/pg
npm install prisma @prisma/client
```

**Prisma Schema (`prisma/schema.prisma`):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Token {
  id                      String   @id @default(cuid())
  tokenAddress            String   @unique
  name                    String
  ticker                  String
  description             String?
  imageUrl                String?
  bannerUrl               String?
  launchDate              DateTime @default(now())
  creatorWallet           String
  currentOwnerWallet      String
  platformFeePercent      Float    @default(2.0)
  rewardDistributionPercent Float  @default(0)
  burnPercent             Float    @default(0)
  rewardToken             String?
  initialBuyAmount        Float
  socialLinks             Json?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  allocations             Allocation[]
  ownershipTransfers      OwnershipTransfer[]
  
  @@index([creatorWallet])
  @@index([currentOwnerWallet])
}

model Allocation {
  id                      String   @id @default(cuid())
  tokenId                 String
  token                   Token    @relation(fields: [tokenId], references: [id])
  platformFeePercent      Float
  rewardDistributionPercent Float
  burnPercent            Float
  date                    DateTime @default(now())
  
  @@index([tokenId])
}

model OwnershipTransfer {
  id                      String   @id @default(cuid())
  tokenId                 String
  token                   Token    @relation(fields: [tokenId], references: [id])
  fromWallet              String
  toWallet                String
  fee                     Float
  date                    DateTime @default(now())
  
  @@index([tokenId])
  @@index([toWallet])
}

model CreatorProfile {
  id                      String   @id @default(cuid())
  walletAddress           String   @unique
  username                String?
  profileImageUrl         String?
  bannerImageUrl          String?
  bio                     String?
  socialLinks             Json?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@index([walletAddress])
}
```

### Option B: MongoDB (Alternative)

```bash
npm install mongoose
```

## Step 2: API Routes Structure

Create API routes in `app/api/` directory:

### `app/api/tokens/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PublicKey } from '@solana/web3.js'

// GET /api/tokens - List all tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = owner ? {
      OR: [
        { creatorWallet: owner },
        { currentOwnerWallet: owner }
      ]
    } : {}

    const tokens = await prisma.token.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { launchDate: 'desc' },
      include: {
        allocations: {
          orderBy: { date: 'desc' },
          take: 1
        },
        ownershipTransfers: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    })

    return NextResponse.json({ tokens })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

// POST /api/tokens - Create new token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tokenAddress,
      name,
      ticker,
      description,
      imageUrl,
      bannerUrl,
      creatorWallet,
      currentOwnerWallet,
      platformFeePercent,
      rewardDistributionPercent,
      burnPercent,
      rewardToken,
      initialBuyAmount,
      socialLinks
    } = body

    // Validate wallet addresses
    new PublicKey(creatorWallet)
    new PublicKey(currentOwnerWallet)

    const token = await prisma.token.create({
      data: {
        tokenAddress,
        name,
        ticker,
        description,
        imageUrl,
        bannerUrl,
        creatorWallet,
        currentOwnerWallet,
        platformFeePercent,
        rewardDistributionPercent,
        burnPercent,
        rewardToken,
        initialBuyAmount,
        socialLinks: socialLinks || {}
      }
    })

    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
}
```

### `app/api/tokens/[tokenAddress]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tokens/[tokenAddress] - Get single token
export async function GET(
  request: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const token = await prisma.token.findUnique({
      where: { tokenAddress: params.tokenAddress },
      include: {
        allocations: {
          orderBy: { date: 'desc' }
        },
        ownershipTransfers: {
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch token' },
      { status: 500 }
    )
  }
}
```

### `app/api/tokens/[tokenAddress]/allocations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/tokens/[tokenAddress]/allocations - Update allocations
export async function PUT(
  request: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const body = await request.json()
    const { walletAddress, platformFeePercent, rewardDistributionPercent, burnPercent } = body

    // Verify ownership
    const token = await prisma.token.findUnique({
      where: { tokenAddress: params.tokenAddress }
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    const isOwner = token.currentOwnerWallet.toLowerCase() === walletAddress.toLowerCase() ||
                   (!token.currentOwnerWallet && token.creatorWallet.toLowerCase() === walletAddress.toLowerCase())

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update token allocations
    const updatedToken = await prisma.token.update({
      where: { tokenAddress: params.tokenAddress },
      data: {
        platformFeePercent,
        rewardDistributionPercent,
        burnPercent,
        allocations: {
          create: {
            platformFeePercent,
            rewardDistributionPercent,
            burnPercent
          }
        }
      }
    })

    return NextResponse.json({ token: updatedToken })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update allocations' },
      { status: 500 }
    )
  }
}
```

### `app/api/tokens/[tokenAddress]/ownership/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PublicKey } from '@solana/web3.js'

// POST /api/tokens/[tokenAddress]/ownership - Transfer ownership
export async function POST(
  request: NextRequest,
  { params }: { params: { tokenAddress: string } }
) {
  try {
    const body = await request.json()
    const { fromWallet, toWallet, signature } = body

    // Validate wallet addresses
    new PublicKey(fromWallet)
    new PublicKey(toWallet)

    // Verify ownership
    const token = await prisma.token.findUnique({
      where: { tokenAddress: params.tokenAddress }
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    const isOwner = token.currentOwnerWallet.toLowerCase() === fromWallet.toLowerCase() ||
                   (!token.currentOwnerWallet && token.creatorWallet.toLowerCase() === fromWallet.toLowerCase())

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // TODO: Verify on-chain transaction signature
    // const isValid = await verifyOwnershipTransferSignature(signature, fromWallet, toWallet)

    const TRANSFER_FEE = 0.1 // 0.1 SOL

    const updatedToken = await prisma.token.update({
      where: { tokenAddress: params.tokenAddress },
      data: {
        currentOwnerWallet: toWallet,
        ownershipTransfers: {
          create: {
            fromWallet,
            toWallet,
            fee: TRANSFER_FEE
          }
        }
      }
    })

    return NextResponse.json({ token: updatedToken })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to transfer ownership' },
      { status: 500 }
    )
  }
}
```

### `app/api/profiles/[walletAddress]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/profiles/[walletAddress]
export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const profile = await prisma.creatorProfile.findUnique({
      where: { walletAddress: params.walletAddress }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profiles/[walletAddress]
export async function PUT(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const body = await request.json()
    const { username, profileImageUrl, bannerImageUrl, bio, socialLinks } = body

    const profile = await prisma.creatorProfile.upsert({
      where: { walletAddress: params.walletAddress },
      update: {
        username,
        profileImageUrl,
        bannerImageUrl,
        bio,
        socialLinks: socialLinks || {}
      },
      create: {
        walletAddress: params.walletAddress,
        username,
        profileImageUrl,
        bannerImageUrl,
        bio,
        socialLinks: socialLinks || {}
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
```

## Step 3: Prisma Client Setup

### `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Step 4: SDK Implementation

### Create SDK package structure:

```
sdk/
├── package.json
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── types.ts
│   └── methods/
│       ├── tokens.ts
│       ├── profiles.ts
│       └── ownership.ts
└── tsconfig.json
```

### `sdk/src/types.ts`

```typescript
export interface Token {
  id: string
  tokenAddress: string
  name: string
  ticker: string
  description?: string
  imageUrl?: string
  bannerUrl?: string
  launchDate: string
  creatorWallet: string
  currentOwnerWallet: string
  platformFeePercent: number
  rewardDistributionPercent: number
  burnPercent: number
  rewardToken?: string
  initialBuyAmount: number
  socialLinks?: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
  allocations?: Allocation[]
  ownershipTransfers?: OwnershipTransfer[]
}

export interface Allocation {
  id: string
  platformFeePercent: number
  rewardDistributionPercent: number
  burnPercent: number
  date: string
}

export interface OwnershipTransfer {
  id: string
  fromWallet: string
  toWallet: string
  fee: number
  date: string
}

export interface CreatorProfile {
  id: string
  walletAddress: string
  username?: string
  profileImageUrl?: string
  bannerImageUrl?: string
  bio?: string
  socialLinks?: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
  createdAt: string
  updatedAt: string
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
  rewardToken?: string
  initialBuyAmount: number
  socialLinks?: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
}

export interface UpdateAllocationsParams {
  walletAddress: string
  platformFeePercent: number
  rewardDistributionPercent: number
  burnPercent: number
}

export interface TransferOwnershipParams {
  fromWallet: string
  toWallet: string
  signature?: string
}
```

### `sdk/src/client.ts`

```typescript
import axios, { AxiosInstance } from 'axios'

export class DiviLauncherClient {
  private api: AxiosInstance
  private apiKey?: string

  constructor(baseURL: string, apiKey?: string) {
    this.apiKey = apiKey
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    })
  }

  get axios() {
    return this.api
  }
}
```

### `sdk/src/methods/tokens.ts`

```typescript
import { DiviLauncherClient } from '../client'
import { Token, CreateTokenParams, UpdateAllocationsParams, TransferOwnershipParams } from '../types'

export class TokenMethods {
  constructor(private client: DiviLauncherClient) {}

  async list(params?: { owner?: string; limit?: number; offset?: number }): Promise<Token[]> {
    const { data } = await this.client.axios.get('/api/tokens', { params })
    return data.tokens
  }

  async get(tokenAddress: string): Promise<Token> {
    const { data } = await this.client.axios.get(`/api/tokens/${tokenAddress}`)
    return data.token
  }

  async create(params: CreateTokenParams): Promise<Token> {
    const { data } = await this.client.axios.post('/api/tokens', params)
    return data.token
  }

  async updateAllocations(
    tokenAddress: string,
    params: UpdateAllocationsParams
  ): Promise<Token> {
    const { data } = await this.client.axios.put(
      `/api/tokens/${tokenAddress}/allocations`,
      params
    )
    return data.token
  }

  async transferOwnership(
    tokenAddress: string,
    params: TransferOwnershipParams
  ): Promise<Token> {
    const { data } = await this.client.axios.post(
      `/api/tokens/${tokenAddress}/ownership`,
      params
    )
    return data.token
  }
}
```

### `sdk/src/methods/profiles.ts`

```typescript
import { DiviLauncherClient } from '../client'
import { CreatorProfile } from '../types'

export class ProfileMethods {
  constructor(private client: DiviLauncherClient) {}

  async get(walletAddress: string): Promise<CreatorProfile> {
    const { data } = await this.client.axios.get(`/api/profiles/${walletAddress}`)
    return data.profile
  }

  async update(
    walletAddress: string,
    profile: Partial<CreatorProfile>
  ): Promise<CreatorProfile> {
    const { data } = await this.client.axios.put(
      `/api/profiles/${walletAddress}`,
      profile
    )
    return data.profile
  }
}
```

### `sdk/src/index.ts`

```typescript
import { DiviLauncherClient } from './client'
import { TokenMethods } from './methods/tokens'
import { ProfileMethods } from './methods/profiles'

export class DiviLauncherSDK {
  public tokens: TokenMethods
  public profiles: ProfileMethods

  constructor(baseURL: string, apiKey?: string) {
    const client = new DiviLauncherClient(baseURL, apiKey)
    this.tokens = new TokenMethods(client)
    this.profiles = new ProfileMethods(client)
  }
}

export * from './types'
export default DiviLauncherSDK
```

### `sdk/package.json`

```json
{
  "name": "@divilauncher/sdk",
  "version": "1.0.0",
  "description": "DiviLauncher API SDK",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

## Step 5: Authentication (Optional but Recommended)

### JWT-based Authentication

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { verifyMessage } from '@solana/web3.js'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json()

    // Verify signature
    const isValid = verifyMessage(
      new PublicKey(walletAddress),
      Buffer.from(message),
      Buffer.from(signature, 'base64')
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = jwt.sign(
      { walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
```

## Step 6: Environment Variables

### `.env.local`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/divilauncher"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Step 7: Migration from localStorage

Create a migration script to move data from localStorage to database:

```typescript
// scripts/migrate-localStorage.ts
import { prisma } from '../lib/prisma'

async function migrate() {
  // This would be run manually or via admin panel
  // Read from localStorage backup and insert into database
}
```

## Step 8: Usage Examples

### Frontend Usage

```typescript
// Replace localStorage calls with API calls
import { DiviLauncherSDK } from '@divilauncher/sdk'

const sdk = new DiviLauncherSDK(process.env.NEXT_PUBLIC_API_URL!)

// Get all tokens
const tokens = await sdk.tokens.list()

// Get user's tokens
const myTokens = await sdk.tokens.list({ owner: walletAddress })

// Create token
const newToken = await sdk.tokens.create({
  tokenAddress: '...',
  name: 'My Token',
  ticker: 'MTK',
  // ... other fields
})

// Update allocations
await sdk.tokens.updateAllocations(tokenAddress, {
  walletAddress: '...',
  platformFeePercent: 2,
  rewardDistributionPercent: 50,
  burnPercent: 20
})
```

### External SDK Usage

```typescript
import DiviLauncherSDK from '@divilauncher/sdk'

const sdk = new DiviLauncherSDK('https://api.divilauncher.com', 'your-api-key')

// Use SDK methods
const tokens = await sdk.tokens.list()
```

## Next Steps

1. **Set up database** (PostgreSQL or MongoDB)
2. **Run Prisma migrations**: `npx prisma migrate dev`
3. **Create API routes** following the structure above
4. **Build and publish SDK**: `cd sdk && npm run build && npm publish`
5. **Update frontend** to use API instead of localStorage
6. **Add authentication** for secure operations
7. **Add rate limiting** to prevent abuse
8. **Add monitoring** and logging

## Additional Considerations

- **Caching**: Use Redis for caching frequently accessed data
- **Rate Limiting**: Implement rate limiting on API endpoints
- **Webhooks**: Add webhook support for token events
- **GraphQL**: Consider GraphQL API as alternative to REST
- **Real-time**: Add WebSocket support for real-time updates
- **Analytics**: Track API usage and token metrics

