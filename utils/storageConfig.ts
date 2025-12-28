/**
 * Storage Configuration
 * Determines whether to use IPFS or database storage for images
 */

// Storage mode: 'ipfs' or 'database'
// Database is cheaper at medium scale (1K-10K users)
// IPFS is better for large scale and public assets
export const STORAGE_MODE = (process.env.NEXT_PUBLIC_STORAGE_MODE || 'database') as 'ipfs' | 'database'

// Maximum size for database storage (base64)
// PostgreSQL TEXT can handle up to 1GB, but we'll limit to 2MB base64 (~1.5MB image)
export const MAX_DB_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB base64 string

/**
 * Check if we should use database storage
 */
export function useDatabaseStorage(): boolean {
  return STORAGE_MODE === 'database'
}

/**
 * Check if we should use IPFS storage
 */
export function useIPFSStorage(): boolean {
  return STORAGE_MODE === 'ipfs'
}

/**
 * Get storage mode
 */
export function getStorageMode(): 'ipfs' | 'database' {
  return STORAGE_MODE
}

