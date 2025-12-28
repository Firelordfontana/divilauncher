# DiviLauncher SDK Implementation Guide

## Overview

The DiviLauncher SDK provides a JavaScript/TypeScript library for developers to easily interact with DiviLauncher APIs and token launch functionality.

## SDK Structure

```
divi-launcher-sdk/
├── src/
│   ├── index.ts              # Main SDK entry point
│   ├── client.ts             # API client
│   ├── types.ts              # TypeScript types
│   ├── tokens.ts             # Token operations
│   ├── profiles.ts           # Profile operations
│   ├── balance.ts            # Balance operations
│   └── utils/
│       ├── validation.ts     # Validation helpers
│       └── constants.ts      # Constants
├── package.json
├── tsconfig.json
└── README.md
```

## SDK Features

1. **Type-Safe API Calls**: Full TypeScript support
2. **Wallet Integration**: Helper functions for wallet operations
3. **Error Handling**: Consistent error handling across all methods
4. **Caching**: Built-in caching for balance and token data
5. **Validation**: Input validation before API calls

## Installation

```bash
npm install @divilauncher/sdk
# or
yarn add @divilauncher/sdk
```

## Basic Usage

```typescript
import { DiviLauncherSDK } from '@divilauncher/sdk'

// Initialize SDK
const sdk = new DiviLauncherSDK({
  apiUrl: 'https://api.divilauncher.com', // or 'http://localhost:3000' for dev
  rpcUrl: 'https://api.mainnet-beta.solana.com' // Optional: custom RPC
})

// Use SDK methods
const tokens = await sdk.tokens.getAll()
const balance = await sdk.balance.get('YOUR_WALLET_ADDRESS')
```

## API Reference

### Tokens

```typescript
// Get all tokens
const tokens = await sdk.tokens.getAll({ limit: 50, offset: 0 })

// Get tokens by owner
const myTokens = await sdk.tokens.getByOwner('WALLET_ADDRESS')

// Get single token
const token = await sdk.tokens.get('TOKEN_ADDRESS')

// Create token
const newToken = await sdk.tokens.create({
  tokenAddress: '...',
  name: 'My Token',
  ticker: 'MTK',
  description: 'A great token',
  creatorWallet: 'WALLET_ADDRESS',
  platformFeePercent: 2,
  rewardDistributionPercent: 50,
  burnPercent: 20,
  rewardToken: 'USDC_ADDRESS',
  initialBuyAmount: 0.1
})

// Update allocations
const updated = await sdk.tokens.updateAllocations('TOKEN_ADDRESS', {
  walletAddress: 'WALLET_ADDRESS',
  platformFeePercent: 3,
  rewardDistributionPercent: 60,
  burnPercent: 25
})

// Transfer ownership
const transferred = await sdk.tokens.transferOwnership('TOKEN_ADDRESS', {
  fromWallet: 'WALLET_ADDRESS',
  toWallet: 'NEW_OWNER_ADDRESS',
  fee: 0.1
})
```

### Profiles

```typescript
// Get profile
const profile = await sdk.profiles.get('WALLET_ADDRESS')

// Update profile
const updated = await sdk.profiles.update('WALLET_ADDRESS', {
  username: 'MyUsername',
  bio: 'My bio',
  profileImageUrl: 'https://...',
  bannerImageUrl: 'https://...'
})
```

### Balance

```typescript
// Get SOL balance
const balance = await sdk.balance.get('WALLET_ADDRESS')
// Returns: { balance: 1.2345, cached: false }
```

## Advanced Usage

### With Wallet Adapter

```typescript
import { useWallet } from '@solana/wallet-adapter-react'
import { DiviLauncherSDK } from '@divilauncher/sdk'

function MyComponent() {
  const wallet = useWallet()
  const sdk = new DiviLauncherSDK({ apiUrl: 'http://localhost:3000' })

  const handleCreateToken = async () => {
    if (!wallet.publicKey) return

    const token = await sdk.tokens.create({
      tokenAddress: '...',
      name: 'My Token',
      ticker: 'MTK',
      creatorWallet: wallet.publicKey.toBase58(),
      // ... other fields
    })
  }
}
```

### Error Handling

```typescript
try {
  const token = await sdk.tokens.create({ ... })
} catch (error) {
  if (error instanceof SDKError) {
    console.error('SDK Error:', error.message)
    console.error('Status:', error.status)
    console.error('Details:', error.details)
  }
}
```

### Caching

```typescript
// Balance is automatically cached for 30 seconds
const balance1 = await sdk.balance.get('WALLET') // Fetches from API
const balance2 = await sdk.balance.get('WALLET') // Returns cached value

// Clear cache
sdk.balance.clearCache('WALLET')
```

## SDK Implementation

See the example SDK code in `sdk/` directory for full implementation.

