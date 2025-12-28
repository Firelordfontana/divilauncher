import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    if (!PINATA_API_KEY) {
      return NextResponse.json(
        { error: 'Pinata API key is not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create FormData for Pinata
    const pinataFormData = new FormData()
    pinataFormData.append('file', file)

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: 'profile-image',
        uploadedAt: new Date().toISOString(),
      },
    })
    pinataFormData.append('pinataMetadata', metadata)

    // Add options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false,
    })
    pinataFormData.append('pinataOptions', pinataOptions)

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      pinataFormData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000, // 2 minute timeout for large files
      }
    )

    const ipfsHash = response.data.IpfsHash
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

    return NextResponse.json({
      ipfsUrl,
      ipfsHash,
    })
  } catch (error: any) {
    console.error('Failed to upload image to Pinata:', error)
    
    let errorMessage = 'Failed to upload image'
    if (error.response?.status === 401) {
      errorMessage = 'Invalid Pinata API key'
    } else if (error.response?.status === 403) {
      errorMessage = 'Pinata API key does not have permission to upload files'
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment'
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Upload timeout. Please try again'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

