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

// Common Solana token addresses
export const COMMON_TOKENS = {
  SOL: NATIVE_SOL_MINT,
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
}

