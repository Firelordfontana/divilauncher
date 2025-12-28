import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token'
// Metaplex import - Note: createCreateMetadataAccountV3Instruction is not available in v3.4.0
// Metadata creation is handled via PumpFun or backend service
// import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata'
import axios from 'axios'
import bs58 from 'bs58'

const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'
// For testing, use: 'https://api.devnet.solana.com'

interface TokenFormData {
  name: string
  ticker: string
  description: string
  image: File | null
  banner: File | null
  socialLinks: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
  platformFeePercent: number // Platform fee (optional donation) 0-10%
  rewardDistributionPercent: number // Percentage of creator funds to distribute (0-100%)
  burnPercent: number // Percentage of creator funds to burn (0-100%)
  dividendToken: string // Token to convert funds into for rewards
  initialBuyAmount: number // Amount of SOL for initial buy (minimum 0.05)
}

interface LaunchTokenParams {
  wallet: PublicKey
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  formData: TokenFormData
  dividendToken: PublicKey | null
}

interface LaunchResult {
  tokenAddress: string
  transactionSignature: string
}

// Upload image to IPFS or similar service
async function uploadImage(image: File): Promise<string> {
  return uploadFileToIPFS(image)
}

// Upload file (image or banner) to IPFS
async function uploadFileToIPFS(file: File): Promise<string> {
  // For production, use a proper IPFS service like Pinata, NFT.Storage, or Arweave
  // This is a placeholder - you'll need to implement actual image upload
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    // Example using a free IPFS service (you may need to replace this)
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
      },
    })
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
  } catch (error: any) {
    // Fallback: return a placeholder or use base64
    console.error('Image upload failed:', error)
    // Check if it's an authentication error
    if (error?.response?.status === 401) {
      console.warn('Pinata API keys not configured. Using placeholder image URL.')
    }
    // For now, return a placeholder URL
    return 'https://via.placeholder.com/512'
  }
}

// Create token metadata URI
async function createMetadataURI(
  formData: TokenFormData,
  imageUrl: string,
  bannerUrl?: string
): Promise<string> {
  const metadata: any = {
    name: formData.name,
    symbol: formData.ticker,
    description: formData.description,
    image: imageUrl,
    properties: {
      category: 'token',
      creators: [],
      social: {
        telegram: formData.socialLinks.telegram || '',
        twitter: formData.socialLinks.twitter || '',
        website: formData.socialLinks.website || '',
        discord: formData.socialLinks.discord || '',
      },
      rewardConfig: {
        rewardDistributionPercent: formData.rewardDistributionPercent,
        burnPercent: formData.burnPercent,
        platformFeePercent: formData.platformFeePercent,
        // Funds will be converted to this token before distribution
        rewardToken: formData.dividendToken || '',
        // Solana burn address: 11111111111111111111111111111111
        burnAddress: '11111111111111111111111111111111',
      },
      dividendToken: formData.dividendToken || '',
    },
  }

  // Add banner if provided
  if (bannerUrl) {
    metadata.banner = bannerUrl
    metadata.properties.banner = bannerUrl
  }

  // Upload metadata to IPFS
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
        },
      }
    )
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
  } catch (error: any) {
    console.error('Metadata upload failed:', error)
    // Check if it's an authentication error
    if (error?.response?.status === 401) {
      console.warn('Pinata API keys not configured. Using placeholder metadata URI.')
    }
    // Return a placeholder
    return 'https://gateway.pinata.cloud/ipfs/QmPlaceholder'
  }
}

// Launch token via PumpFun
async function launchViaPumpFun(
  connection: Connection,
  wallet: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  formData: TokenFormData,
  metadataUri: string
): Promise<LaunchResult> {
  // PumpFun API integration
  // Note: PumpFun may have specific API endpoints - this is a generic implementation
  // You may need to adjust based on PumpFun's actual API
  
  // TODO: Replace with actual PumpFun API integration
  // This is a placeholder endpoint - you need to:
  // 1. Research PumpFun's actual API endpoints or SDK
  // 2. Set up a backend API that uses your program wallet
  // 3. Update this function to call your backend API instead
  
  try {
    // Placeholder API endpoint - this will fail
    const response = await axios.post('https://pumpfun-api.com/create', {
      name: formData.name,
      symbol: formData.ticker,
      description: formData.description,
      uri: metadataUri,
      creator: wallet.toBase58(),
    }, {
      timeout: 5000, // 5 second timeout
    })

    if (response.data.tokenAddress) {
      return {
        tokenAddress: response.data.tokenAddress,
        transactionSignature: response.data.signature || '',
      }
    }
  } catch (error: any) {
    console.error('PumpFun API error:', error)
    // Provide more helpful error message
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('timeout')) {
      throw new Error(
        'PumpFun API endpoint not configured. ' +
        'This is a placeholder endpoint. You need to implement a backend API that uses your program wallet to launch tokens. ' +
        'See PROGRAM_ARCHITECTURE.md for implementation details.'
      )
    }
    throw new Error('Failed to launch via PumpFun. Backend API implementation required.')
  }

  throw new Error('PumpFun launch failed - backend implementation required')
}

// Create SPL token directly
async function createSPLToken(
  connection: Connection,
  wallet: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  formData: TokenFormData,
  metadataUri: string
): Promise<LaunchResult> {
  // Generate a new keypair for the mint
  const mintKeypair = Keypair.generate()
  const mintPublicKey = mintKeypair.publicKey

  // Get rent exemption for mint account
  const lamports = await getMinimumBalanceForRentExemptMint(connection)

  // Create the mint account and initialize it
  // Note: This is a simplified version. In production, you'd want to use
  // the SPL Token program's createInitializeMint instruction properly
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet,
    newAccountPubkey: mintPublicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  })

  // Note: You'll need to add the initializeMint instruction here
  // This requires importing the proper instruction builder from @solana/spl-token
  // For now, this is a placeholder that shows the structure

  const transaction = new Transaction().add(createAccountInstruction)
  
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = wallet

  // Sign with both the wallet and the mint keypair
  // Note: In a real implementation, you'd need to handle the mint keypair signing
  // This might require using a different approach or having the user sign both
  const signed = await signTransaction(transaction)
  
  // Add the mint keypair signature
  signed.partialSign(mintKeypair)
  
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(signature, 'confirmed')

  // Create metadata
  const metadataProgramId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  const [metadataAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      metadataProgramId.toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    metadataProgramId
  )

  // Note: Metadata creation requires Metaplex v3.x compatible API
  // This is a placeholder - in production, use the correct Metaplex SDK methods
  // For now, metadata creation is handled by PumpFun or needs backend implementation
  // TODO: Implement metadata creation using @metaplex-foundation/js or update to compatible API
  
  // const metadataInstruction = createCreateMetadataAccountV3Instruction(...)
  // This function is not available in @metaplex-foundation/mpl-token-metadata v3.4.0
  // Metadata will be created via PumpFun or backend service

  return {
    tokenAddress: mintPublicKey.toBase58(),
    transactionSignature: signature,
  }
}

// Main launch function
export async function launchToken(params: LaunchTokenParams): Promise<LaunchResult> {
  const { wallet, signTransaction, formData, dividendToken } = params
  const connection = new Connection(RPC_ENDPOINT, 'confirmed')

  // Upload image if provided
  let imageUrl = 'https://via.placeholder.com/512'
  if (formData.image) {
    imageUrl = await uploadImage(formData.image)
  }

  // Upload banner if provided
  let bannerUrl: string | undefined = undefined
  if (formData.banner) {
    bannerUrl = await uploadFileToIPFS(formData.banner)
  }

  // Create metadata URI
  const metadataUri = await createMetadataURI(formData, imageUrl, bannerUrl)

  // Launch via PumpFun
  try {
    return await launchViaPumpFun(connection, wallet, signTransaction, formData, metadataUri)
  } catch (error) {
    console.error('PumpFun launch failed, falling back to direct creation:', error)
    // Fallback to direct creation if PumpFun fails
    return await createSPLToken(connection, wallet, signTransaction, formData, metadataUri)
  }
}

// Note: Tax and dividend distribution would typically be handled by a Solana program
// This would require deploying a custom program that:
// 1. Intercepts buy/sell transactions (for direct liquidity pools)
// 2. Applies the tax
// 3. Accumulates taxes in a treasury
// 4. For PumpFun: Monitors incoming creator funds
// 5. Reward Distribution: Converts SOL -> Reward Token via Jupiter swap, distributes to holders based on shares
// 6. Burn Mechanism: Uses SOL to buy back the created token, then sends tokens to burn address
// For a production implementation, you would need to create and deploy such a program
//
// The conversion process for PumpFun creator funds:
// 1. Creator funds arrive (typically in SOL)
// 2. Reward Distribution (if configured):
//    - Program uses Jupiter Aggregator to swap SOL -> Reward Token
//    - Takes the configured percentage of converted tokens
//    - Distributes to token holders based on shares (500k tokens = 1 share, max 50 shares)
// 3. Burn Distribution (if configured):
//    - Program uses SOL to buy back the created token from the market
//    - Sends the bought tokens to Solana burn address (1111111...)
//    - This reduces the token supply

