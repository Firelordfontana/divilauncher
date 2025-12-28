# Launch Wallet Setup Guide

The Launch Wallet is **fully controlled by your platform backend** to automatically launch tokens and manage creator reward allocations.

## Overview

The Launch Wallet needs:
1. **Public Address** - For receiving funds and identifying the wallet
2. **Private Key** - For signing transactions (server-side only)

## Security Requirements

⚠️ **CRITICAL**: The private key must be kept secure and never exposed to the client!

- ✅ Store private key in **server-side environment variables only**
- ✅ Use `LAUNCH_WALLET_PRIVATE_KEY` (NOT `NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY`)
- ❌ Never expose private key to frontend/client
- ❌ Never commit private key to git
- ❌ Never log private key in console

## Step 1: Generate a New Wallet

You can generate a new Solana wallet using one of these methods:

### Option A: Using Solana CLI

```bash
# Install Solana CLI if you haven't
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate new keypair
solana-keygen new --outfile ~/launch-wallet.json

# Get the public address
solana address -k ~/launch-wallet.json

# Get the private key (base58 encoded)
cat ~/launch-wallet.json
```

### Option B: Using Node.js Script

Create a file `scripts/generate-launch-wallet.js`:

```javascript
const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

// Generate new keypair
const keypair = Keypair.generate();

console.log('Public Address:', keypair.publicKey.toBase58());
console.log('Private Key (base58):', Buffer.from(keypair.secretKey).toString('base58'));

// Save to file (optional, for backup)
const keypairData = {
  publicKey: keypair.publicKey.toBase58(),
  privateKey: Buffer.from(keypair.secretKey).toString('base58'),
};

fs.writeFileSync('launch-wallet-backup.json', JSON.stringify(keypairData, null, 2));
console.log('\n✅ Wallet saved to launch-wallet-backup.json');
console.log('⚠️  Keep this file secure and delete it after adding to .env.local');
```

Run it:
```bash
node scripts/generate-launch-wallet.js
```

### Option C: Using Phantom/Solflare (Not Recommended)

While you can create a wallet in Phantom/Solflare and export the private key, this is less secure for server use. Better to generate a dedicated server wallet.

## Step 2: Fund the Wallet

Send SOL to the Launch Wallet address for:
- PumpFun launch fees
- Transaction fees
- Initial token buys (if needed)

**Recommended minimum:** 1-2 SOL to start (for testing and initial launches)

## Step 3: Add to Environment Variables

Add both the public address and private key to your `.env.local`:

```env
# Launch Wallet - Public Address (can be public)
NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS=YourLaunchWalletAddressHere

# Launch Wallet - Private Key (SERVER-SIDE ONLY, never expose!)
LAUNCH_WALLET_PRIVATE_KEY=YourPrivateKeyBase58Here
```

**Important:**
- `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS` - Can be public (used in frontend)
- `LAUNCH_WALLET_PRIVATE_KEY` - Must be server-side only (used in API routes)

## Step 4: Using the Wallet in Your Backend

### In API Routes (Server-Side)

```typescript
import { Keypair } from '@solana/web3.js';
import { LAUNCH_WALLET_PRIVATE_KEY } from '@/utils/constants';

// Convert private key from base58 to Keypair
function getLaunchWallet(): Keypair {
  if (!LAUNCH_WALLET_PRIVATE_KEY) {
    throw new Error('LAUNCH_WALLET_PRIVATE_KEY not set');
  }
  
  const privateKeyBytes = Buffer.from(LAUNCH_WALLET_PRIVATE_KEY, 'base58');
  return Keypair.fromSecretKey(privateKeyBytes);
}

// Use in your API route
export async function POST(request: NextRequest) {
  const launchWallet = getLaunchWallet();
  
  // Now you can sign transactions with launchWallet
  // Example: Launch token on PumpFun
  // const transaction = new Transaction();
  // transaction.add(...);
  // transaction.sign(launchWallet);
}
```

### In Server Actions

```typescript
'use server'

import { Keypair } from '@solana/web3.js';
import { LAUNCH_WALLET_PRIVATE_KEY } from '@/utils/constants';

export async function launchToken(tokenData: TokenData) {
  const launchWallet = getLaunchWallet();
  
  // Sign and send transaction
  // ...
}
```

## What the Launch Wallet Does

1. **Receives User Funds**
   - Users send SOL to launch wallet when launching tokens
   - Wallet holds funds temporarily during launch process

2. **Launches Tokens on PumpFun**
   - Signs transactions to create tokens
   - Uploads metadata (name, ticker, description, images, socials)
   - Pays PumpFun launch fees
   - Makes initial buy (if user provided funds)

3. **Sets Up Reward Allocations**
   - Configures reward token address
   - Sets reward distribution percentage
   - Sets burn percentage
   - Stores configuration in token metadata

4. **Receives Creator Funds**
   - PumpFun sends creator funds to launch wallet
   - Wallet processes funds automatically:
     - Deducts 2% platform fee → sends to Platform Wallet
     - Processes reward distribution
     - Processes burn

## Security Best Practices

1. **Separate Wallets**
   - Platform Wallet: Your personal wallet (hardware wallet recommended)
   - Launch Wallet: Server wallet (dedicated for operations)

2. **Private Key Storage**
   - ✅ Server-side environment variables
   - ✅ Vercel environment variables (for production)
   - ✅ Encrypted secrets manager (for enterprise)
   - ❌ Never in client code
   - ❌ Never in git repository
   - ❌ Never in logs

3. **Access Control**
   - Limit who can access the private key
   - Use environment variable encryption
   - Rotate keys periodically
   - Monitor wallet activity

4. **Backup**
   - Keep a secure backup of the private key
   - Store in password manager or secure vault
   - Never store in plain text files

## Production Deployment

### Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS` (available to all environments)
   - `LAUNCH_WALLET_PRIVATE_KEY` (available to all environments)
3. Mark `LAUNCH_WALLET_PRIVATE_KEY` as **sensitive**
4. Redeploy after adding

### Other Platforms

- **Railway**: Add in project settings → Variables
- **Render**: Add in Environment section
- **AWS/GCP**: Use Secrets Manager or Parameter Store

## Troubleshooting

**Error: "LAUNCH_WALLET_PRIVATE_KEY not set"**
- Make sure the environment variable is set
- Check it's not prefixed with `NEXT_PUBLIC_`
- Restart your dev server after adding

**Error: "Invalid private key"**
- Make sure the private key is in base58 format
- Check for extra spaces or line breaks
- Verify you copied the entire key

**Transactions failing**
- Check wallet has sufficient SOL for fees
- Verify network (mainnet vs devnet)
- Check RPC endpoint is working


