/**
 * Solana Network Constants
 */

// Solana Burn Address (all 1s, 32 bytes)
export const SOLANA_BURN_ADDRESS = '11111111111111111111111111111111'

// Native SOL mint address
export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112'

// Platform Configuration
export const PLATFORM_FEE_PERCENT = 2 // 2% platform fee
export const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || ''
// Note: Set NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS in .env.local with your wallet address

// Launch/Program Wallet Configuration
// This wallet is fully controlled by the platform backend for launching tokens
export const LAUNCH_WALLET_ADDRESS = process.env.NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS || ''
// Note: Set NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS in .env.local (public address)

// PRIVATE KEY - Server-side only, never expose to client
// This is used by the backend to sign transactions
export const LAUNCH_WALLET_PRIVATE_KEY = (() => {
  const key = process.env.LAUNCH_WALLET_PRIVATE_KEY || ''
  
  // Runtime security check: Ensure we're on the server
  if (typeof window !== 'undefined') {
    console.error('🚨 SECURITY ERROR: LAUNCH_WALLET_PRIVATE_KEY accessed in client code!')
    return '' // Return empty to prevent exposure
  }
  
  // Check for accidental NEXT_PUBLIC_ exposure
  if (process.env.NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY) {
    throw new Error(
      '🚨 SECURITY ERROR: Private key has NEXT_PUBLIC_ prefix! ' +
      'This would expose it to the client. Use LAUNCH_WALLET_PRIVATE_KEY (without NEXT_PUBLIC_) instead.'
    )
  }
  
  return key
})()
// Note: Set LAUNCH_WALLET_PRIVATE_KEY in .env.local (server-side only, NOT NEXT_PUBLIC)
// This wallet will:
// - Receive funds from users when they launch tokens
// - Launch tokens on PumpFun with user-provided details (name, ticker, description, socials, images)
// - Sign all transactions needed for token launches
// - Set up creator reward allocations
// - Pay PumpFun launch fees
// - Receive creator funds from PumpFun (which then get processed for rewards/burns)

// Common Solana token addresses
export const COMMON_TOKENS = {
  SOL: NATIVE_SOL_MINT,
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
}

