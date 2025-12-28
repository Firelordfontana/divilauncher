# DiviLauncher SDK

JavaScript/TypeScript SDK for interacting with DiviLauncher APIs.

## Installation

```bash
npm install @divilauncher/sdk
```

## Quick Start

```typescript
import { DiviLauncherSDK } from '@divilauncher/sdk'

// Initialize SDK
const sdk = new DiviLauncherSDK({
  apiUrl: 'https://api.divilauncher.com'
})

// Get all tokens
const { tokens } = await sdk.tokens.getAll()

// Get balance
const { balance } = await sdk.balance.get('WALLET_ADDRESS')

// Create token
const { token } = await sdk.tokens.create({
  tokenAddress: '...',
  name: 'My Token',
  ticker: 'MTK',
  creatorWallet: 'WALLET_ADDRESS',
  // ... other fields
})
```

## API Reference

### Tokens

- `getAll(params?)` - Get all tokens
- `getByOwner(address, limit?, offset?)` - Get tokens by owner
- `get(address)` - Get single token
- `create(params)` - Create new token
- `update(address, updates)` - Update token
- `updateAllocations(address, params)` - Update allocations
- `transferOwnership(address, params)` - Transfer ownership

### Profiles

- `get(address)` - Get profile
- `update(address, params)` - Update profile

### Balance

- `get(address)` - Get SOL balance (cached)
- `clearCache(address?)` - Clear cache

## Examples

See `examples/` directory for more examples.

## TypeScript Support

Full TypeScript support with exported types.

```typescript
import { TokenInfo, CreateTokenParams } from '@divilauncher/sdk'
```

