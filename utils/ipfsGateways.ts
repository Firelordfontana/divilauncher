/**
 * IPFS Gateway Utilities
 * Provides multiple IPFS gateway fallbacks for reliable image retrieval
 */

/**
 * List of IPFS gateways to try (in order of preference)
 */
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/', // Pinata gateway (fast, reliable)
  'https://ipfs.io/ipfs/', // Public IPFS gateway
  'https://cloudflare-ipfs.com/ipfs/', // Cloudflare gateway (fast CDN)
  'https://dweb.link/ipfs/', // Protocol Labs gateway
  'https://gateway.ipfs.io/ipfs/', // Alternative public gateway
]

/**
 * Get IPFS URL with fallback gateways
 * @param ipfsHash - The IPFS hash (CID)
 * @param preferredGateway - Optional preferred gateway index
 * @returns IPFS URL
 */
export function getIPFSUrl(ipfsHash: string, preferredGateway: number = 0): string {
  // Remove any existing gateway prefix
  const hash = ipfsHash.replace(/^https?:\/\/[^/]+\/ipfs\//, '').replace(/^ipfs:\/\//, '')
  
  const gateway = IPFS_GATEWAYS[preferredGateway] || IPFS_GATEWAYS[0]
  return `${gateway}${hash}`
}

/**
 * Get all possible IPFS URLs for a hash (for fallback)
 * @param ipfsHash - The IPFS hash (CID)
 * @returns Array of IPFS URLs
 */
export function getAllIPFSUrls(ipfsHash: string): string[] {
  const hash = ipfsHash.replace(/^https?:\/\/[^/]+\/ipfs\//, '').replace(/^ipfs:\/\//, '')
  return IPFS_GATEWAYS.map(gateway => `${gateway}${hash}`)
}

/**
 * Try to load an image from multiple IPFS gateways
 * Falls back to next gateway if one fails
 * @param ipfsHash - The IPFS hash (CID)
 * @returns Promise that resolves to the first working URL
 */
export async function loadImageFromIPFS(ipfsHash: string): Promise<string> {
  const urls = getAllIPFSUrls(ipfsHash)
  
  for (const url of urls) {
    try {
      // Try to fetch the image to verify it works
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
      if (response.ok) {
        return url
      }
    } catch (error) {
      // Try next gateway
      continue
    }
  }
  
  // If all fail, return the first one anyway (browser will handle the error)
  return urls[0]
}

/**
 * Create an img element with IPFS fallback
 * @param ipfsHash - The IPFS hash (CID)
 * @param alt - Alt text for the image
 * @returns HTMLImageElement with onerror fallback
 */
export function createIPFSImage(ipfsHash: string, alt: string = ''): HTMLImageElement {
  const img = document.createElement('img')
  const urls = getAllIPFSUrls(ipfsHash)
  let currentIndex = 0
  
  img.alt = alt
  img.src = urls[currentIndex]
  
  // Fallback to next gateway on error
  img.onerror = () => {
    currentIndex++
    if (currentIndex < urls.length) {
      img.src = urls[currentIndex]
    }
  }
  
  return img
}

