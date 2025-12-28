# Wallet Authentication Guide

## Current Status

**Reading Wallet Data (Balance, Address)**: ✅ No authentication needed
- Balance and wallet address are public blockchain data
- The Solana Wallet Adapter handles connection
- RPC endpoint just needs to be accessible (not rate-limited)

**API Operations (Write Operations)**: ⚠️ Should add signature verification
- Currently using localStorage (client-side only)
- When moving to API, add signature verification for security

## When You Need Authentication

### ✅ No Authentication Needed For:
- Reading wallet balance
- Reading wallet address
- Viewing public token data
- Listing tokens

### 🔒 Authentication Required For:
- Updating token allocations
- Transferring ownership
- Creating tokens (if using API)
- Updating profile
- Any operation that modifies data

## Implementation: Signature Verification

### Frontend: Request Signature

```typescript
// utils/walletAuth.ts
import { useWallet } from '@solana/wallet-adapter-react'
import { signMessage } from '@solana/wallet-adapter-base'

export async function requestWalletSignature(
  wallet: any,
  message: string
): Promise<string | null> {
  if (!wallet.signMessage) {
    console.error('Wallet does not support message signing')
    return null
  }

  try {
    const encodedMessage = new TextEncoder().encode(message)
    const signature = await wallet.signMessage(encodedMessage)
    return Buffer.from(signature).toString('base64')
  } catch (err) {
    console.error('Failed to sign message:', err)
    return null
  }
}

// Usage example:
const message = `Sign to authenticate: ${Date.now()}`
const signature = await requestWalletSignature(wallet, message)
```

### Backend: Verify Signature

```typescript
// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, message, signature } = await request.json()

    // Verify signature
    const publicKey = new PublicKey(walletAddress)
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = Buffer.from(signature, 'base64')

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    return NextResponse.json({ verified: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
```

## Adding Authentication to Existing Operations

### Example: Update Allocations with Signature

```typescript
// In app/account/page.tsx - handleSaveAllocations
const handleSaveAllocations = async (tokenAddress: string) => {
  if (!editFormData || !wallet.publicKey || !wallet.signMessage) return

  try {
    // Create authentication message
    const message = `Update allocations for ${tokenAddress} at ${Date.now()}`
    const encodedMessage = new TextEncoder().encode(message)
    
    // Request signature
    const signature = await wallet.signMessage(encodedMessage)
    const signatureBase64 = Buffer.from(signature).toString('base64')

    // Send to API with signature
    const response = await fetch(`/api/tokens/${tokenAddress}/allocations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: wallet.publicKey.toBase58(),
        platformFeePercent: editFormData.platformFeePercent,
        rewardDistributionPercent: editFormData.rewardDistributionPercent,
        burnPercent: editFormData.burnPercent,
        message,
        signature: signatureBase64
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update allocations')
    }

    const data = await response.json()
    // Handle success
  } catch (err) {
    console.error('Failed to update allocations:', err)
    alert('Failed to update allocations')
  }
}
```

## Quick Answer

**For reading wallet balance/details**: No authentication needed - just need a working RPC endpoint.

**For API write operations**: Yes, add signature verification to prove wallet ownership before allowing modifications.

The current localStorage-based approach doesn't need authentication since it's client-side only. When you move to an API, add signature verification for security.

