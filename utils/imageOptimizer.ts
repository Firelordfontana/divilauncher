/**
 * Image Optimization Utility
 * Compresses and resizes images before upload to reduce file size and improve upload speed
 */

import imageCompression from 'browser-image-compression'

export interface ImageOptimizationOptions {
  maxSizeMB?: number // Maximum file size in MB (default: 1MB)
  maxWidthOrHeight?: number // Maximum width or height in pixels (default: 1920)
  useWebWorker?: boolean // Use web worker for compression (default: true)
  initialQuality?: number // Initial image quality 0-1 (default: 0.8)
}

const DEFAULT_OPTIONS: Required<Omit<ImageOptimizationOptions, 'initialQuality'>> & { initialQuality: number } = {
  maxSizeMB: 1, // Target 1MB for profile images
  maxWidthOrHeight: 1920, // Max 1920px for profile images
  useWebWorker: true,
  initialQuality: 0.8, // 80% quality (good balance)
}

/**
 * Optimize an image file before upload
 * Compresses and resizes the image to reduce file size
 * 
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Optimized File object
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
      // Check if file is already small enough
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB <= opts.maxSizeMB) {
        // File is already small, but still resize if needed
        const compressed = await imageCompression(file, {
          maxSizeMB: opts.maxSizeMB * 1.5, // Allow slightly larger to avoid over-compression
          maxWidthOrHeight: opts.maxWidthOrHeight,
          useWebWorker: opts.useWebWorker,
          initialQuality: opts.initialQuality,
        })
        return compressed
      }

      // Compress the image
      const compressed = await imageCompression(file, {
        maxSizeMB: opts.maxSizeMB,
        maxWidthOrHeight: opts.maxWidthOrHeight,
        useWebWorker: opts.useWebWorker,
        initialQuality: opts.initialQuality,
      })

    return compressed
  } catch (error: any) {
    console.error('Image optimization failed:', error)
    // Return original file if optimization fails
    return file
  }
}

/**
 * Optimize a profile image (smaller size)
 */
export async function optimizeProfileImage(file: File): Promise<File> {
  return optimizeImage(file, {
    maxSizeMB: 0.5, // 500KB for profile images
    maxWidthOrHeight: 512, // 512x512 for profile images
    initialQuality: 0.85,
  })
}

/**
 * Validate file size (15MB limit like pump.fun)
 */
export function validateFileSize(file: File, maxSizeMB: number = 15): {
  valid: boolean
  error?: string
} {
  const fileSizeMB = file.size / (1024 * 1024)
  
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSizeMB}MB. Your file is ${fileSizeMB.toFixed(2)}MB.`,
    }
  }

  return { valid: true }
}

/**
 * Validate image file type
 */
export function validateImageType(file: File): {
  valid: boolean
  error?: string
} {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Supported formats: JPG, PNG, GIF, WebP. Your file is: ${file.type}`,
    }
  }

  return { valid: true }
}

