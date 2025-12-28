/**
 * Launch Wallet Utility
 * 
 * This module provides utilities for using the platform-controlled launch wallet
 * to sign transactions for token launches and reward allocations.
 * 
 * ⚠️ SECURITY CRITICAL: The private key is server-side only and never exposed to the client.
 * 
 * This file should ONLY be imported in:
 * - API routes (app/api/**)
 * - Server Actions ('use server')
 * - Server Components (never in 'use client' components)
 * 
 * NEVER import this in client-side code!
 */

import { Keypair, PublicKey } from '@solana/web3.js'
import { LAUNCH_WALLET_PRIVATE_KEY, LAUNCH_WALLET_ADDRESS } from './constants'

// Runtime check to ensure we're on the server
if (typeof window !== 'undefined') {
  throw new Error(
    '🚨 SECURITY ERROR: launchWallet.ts must only be used on the server-side! ' +
    'Never import this in client components or browser code.'
  )
}

// Check for accidental NEXT_PUBLIC_ exposure
if (process.env.NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY) {
  throw new Error(
    '🚨 SECURITY ERROR: LAUNCH_WALLET_PRIVATE_KEY must NOT have NEXT_PUBLIC_ prefix! ' +
    'This would expose the private key to the client. Use LAUNCH_WALLET_PRIVATE_KEY instead.'
  )
}

/**
 * Get the launch wallet Keypair from the private key
 * This should only be called on the server-side (API routes, server actions)
 * 
 * @returns Keypair instance for the launch wallet
 * @throws Error if private key is not set
 */
export function getLaunchWallet(): Keypair {
  if (!LAUNCH_WALLET_PRIVATE_KEY) {
    throw new Error(
      'LAUNCH_WALLET_PRIVATE_KEY is not set. ' +
      'Please add it to your .env.local file (server-side only, not NEXT_PUBLIC_).'
    )
  }

  try {
    // Convert private key from base58 to Uint8Array
    // The private key can be in different formats, so we'll try to handle them
    
    let privateKeyBytes: Uint8Array
    
    // Try base58 first (most common format)
    try {
      // If using bs58 library: const bs58 = require('bs58'); privateKeyBytes = bs58.decode(LAUNCH_WALLET_PRIVATE_KEY)
      // For now, we'll assume it's a JSON array or base64
      if (LAUNCH_WALLET_PRIVATE_KEY.startsWith('[')) {
        // JSON array format: [1,2,3,...]
        privateKeyBytes = new Uint8Array(JSON.parse(LAUNCH_WALLET_PRIVATE_KEY))
      } else if (LAUNCH_WALLET_PRIVATE_KEY.includes(',')) {
        // Comma-separated format: 1,2,3,...
        privateKeyBytes = new Uint8Array(
          LAUNCH_WALLET_PRIVATE_KEY.split(',').map(Number)
        )
      } else {
        // Try base58 decode (requires bs58 library)
        const bs58 = require('bs58')
        privateKeyBytes = new Uint8Array(bs58.decode(LAUNCH_WALLET_PRIVATE_KEY))
      }
    } catch (error) {
      throw new Error(
        `Failed to decode private key. Make sure it's in base58, JSON array, or comma-separated format. Error: ${error}`
      )
    }

    // Validate key length (Solana private keys are 64 bytes)
    if (privateKeyBytes.length !== 64) {
      throw new Error(
        `Invalid private key length. Expected 64 bytes, got ${privateKeyBytes.length}. ` +
        'Make sure you copied the full private key.'
      )
    }

    return Keypair.fromSecretKey(privateKeyBytes)
  } catch (error: any) {
    throw new Error(
      `Failed to create launch wallet keypair: ${error.message}. ` +
      'Please verify your LAUNCH_WALLET_PRIVATE_KEY is correct.'
    )
  }
}

/**
 * Get the launch wallet's public address
 * 
 * @returns PublicKey instance for the launch wallet
 * @throws Error if address is not set
 */
export function getLaunchWalletAddress(): PublicKey {
  if (!LAUNCH_WALLET_ADDRESS) {
    throw new Error(
      'NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS is not set. ' +
      'Please add it to your .env.local file.'
    )
  }

  try {
    return new PublicKey(LAUNCH_WALLET_ADDRESS)
  } catch (error: any) {
    throw new Error(
      `Invalid launch wallet address: ${LAUNCH_WALLET_ADDRESS}. ` +
      `Error: ${error.message}`
    )
  }
}

/**
 * Verify that the launch wallet is properly configured
 * 
 * @returns Object with validation results
 */
export function validateLaunchWallet(): {
  isValid: boolean
  errors: string[]
  address?: string
} {
  const errors: string[] = []

  // Check if address is set
  if (!LAUNCH_WALLET_ADDRESS) {
    errors.push('NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS is not set')
  } else {
    try {
      new PublicKey(LAUNCH_WALLET_ADDRESS)
    } catch {
      errors.push(`Invalid launch wallet address: ${LAUNCH_WALLET_ADDRESS}`)
    }
  }

  // Check if private key is set
  if (!LAUNCH_WALLET_PRIVATE_KEY) {
    errors.push('LAUNCH_WALLET_PRIVATE_KEY is not set')
  } else {
    try {
      const keypair = getLaunchWallet()
      const address = keypair.publicKey.toBase58()
      
      // Verify address matches
      if (LAUNCH_WALLET_ADDRESS && address !== LAUNCH_WALLET_ADDRESS) {
        errors.push(
          `Private key address (${address}) does not match ` +
          `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS (${LAUNCH_WALLET_ADDRESS})`
        )
      }
    } catch (error: any) {
      errors.push(`Invalid private key: ${error.message}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    address: LAUNCH_WALLET_ADDRESS || undefined,
  }
}

