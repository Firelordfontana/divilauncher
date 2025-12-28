/**
 * Test Wallet Security API Route
 * 
 * This endpoint helps verify that the private key is properly secured.
 * It should return that the private key exists (server-side) but never expose the actual value.
 * 
 * Test in browser: The private key should return undefined in DevTools console
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Check if private key is set (server-side only)
  const hasPrivateKey = !!process.env.LAUNCH_WALLET_PRIVATE_KEY
  const hasPublicAddress = !!process.env.NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS
  
  // Check for accidental NEXT_PUBLIC_ exposure (security check)
  const hasNextPublicPrivateKey = !!process.env.NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY
  
  // Get address (safe to return - it's public)
  const address = process.env.NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS || 'Not set'
  
  // Security status
  const isSecure = hasPrivateKey && !hasNextPublicPrivateKey
  
  return NextResponse.json({
    security: {
      isSecure,
      hasPrivateKey: hasPrivateKey,
      hasAccidentalExposure: hasNextPublicPrivateKey,
      message: isSecure 
        ? '✅ Private key is properly secured (server-side only)'
        : hasNextPublicPrivateKey
        ? '❌ SECURITY ERROR: Private key has NEXT_PUBLIC_ prefix!'
        : '⚠️ Private key not set',
    },
    publicAddress: address,
    // NEVER return the private key itself!
    // The private key should only be accessible server-side
  })
}


