/**
 * Image Upload Utility
 * Uploads images to IPFS via Pinata and returns the IPFS URL
 */

import axios from 'axios'

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''

/**
 * Upload an image file to Pinata IPFS
 * @param file - The image file to upload
 * @returns The IPFS URL (e.g., https://gateway.pinata.cloud/ipfs/Qm...)
 */
export async function uploadImageToIPFS(file: File): Promise<string> {
  if (!PINATA_API_KEY) {
    throw new Error('Pinata API key is not configured. Please set NEXT_PUBLIC_PINATA_API_KEY in your environment variables.')
  }

  const formData = new FormData()
  formData.append('file', file)

  // Add metadata for better organization
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      type: 'profile-image',
      uploadedAt: new Date().toISOString(),
    },
  })
  formData.append('pinataMetadata', metadata)

  // Add options for better performance
  const pinataOptions = JSON.stringify({
    cidVersion: 1,
    wrapWithDirectory: false,
  })
  formData.append('pinataOptions', pinataOptions)

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000, // 60 second timeout for large files
      }
    )

    const ipfsHash = response.data.IpfsHash
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
  } catch (error: any) {
    console.error('Failed to upload image to Pinata:', error)
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Pinata API key. Please check your NEXT_PUBLIC_PINATA_API_KEY.')
    }
    if (error.response?.status === 403) {
      throw new Error('Pinata API key does not have permission to upload files.')
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.')
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. The image may be too large. Please try a smaller image or check your connection.')
    }
    
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Upload a base64 image string to IPFS
 * Converts base64 to a File object first, then uploads
 * @param base64String - Base64 encoded image string (data:image/...;base64,...)
 * @param filename - Optional filename for the image
 * @returns The IPFS URL
 */
export async function uploadBase64ImageToIPFS(
  base64String: string,
  filename: string = 'image.png'
): Promise<string> {
  // Convert base64 to File object
  const response = await fetch(base64String)
  const blob = await response.blob()
  const file = new File([blob], filename, { type: blob.type })
  
  return uploadImageToIPFS(file)
}

