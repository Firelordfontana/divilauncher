import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import axios from 'axios'

// Jupiter Aggregator API for token swaps on Solana
const JUPITER_API_BASE = 'https://quote-api.jup.ag/v6'

interface SwapQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee?: {
    amount: string
    feeBps: number
  }
  priceImpactPct: string
  routePlan: any[]
}

interface SwapTransaction {
  swapTransaction: string // Base64 encoded transaction
}

/**
 * Get a quote for swapping tokens using Jupiter Aggregator
 */
export async function getSwapQuote(
  inputMint: string, // Token address to swap FROM
  outputMint: string, // Token address to swap TO
  amount: number, // Amount in smallest unit (lamports for SOL, or token decimals)
  slippageBps: number = 50 // Slippage in basis points (50 = 0.5%)
): Promise<SwapQuote> {
  try {
    const response = await axios.get(`${JUPITER_API_BASE}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps,
        onlyDirectRoutes: false,
        asLegacyTransaction: false,
      },
    })

    return response.data
  } catch (error: any) {
    console.error('Error getting swap quote:', error)
    throw new Error(`Failed to get swap quote: ${error.message}`)
  }
}

/**
 * Get a swap transaction from Jupiter
 */
export async function getSwapTransaction(
  quote: SwapQuote,
  userPublicKey: string,
  wrapUnwrapSOL: boolean = true,
  feeAccount?: string
): Promise<SwapTransaction> {
  try {
    const response = await axios.post(
      `${JUPITER_API_BASE}/swap`,
      {
        quoteResponse: quote,
        userPublicKey,
        wrapUnwrapSOL,
        feeAccount,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Error getting swap transaction:', error)
    throw new Error(`Failed to get swap transaction: ${error.message}`)
  }
}

/**
 * Convert creator funds to the specified reward token
 * This function handles the full swap process
 */
export async function convertFundsToRewardToken(
  connection: Connection,
  fromTokenMint: string, // Usually SOL (native) or the token that creator funds come in
  toTokenMint: string, // The reward token address
  amount: number, // Amount to convert
  userPublicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  slippageBps: number = 50
): Promise<string> {
  try {
    // Get swap quote
    const quote = await getSwapQuote(
      fromTokenMint,
      toTokenMint,
      amount,
      slippageBps
    )

    if (!quote || !quote.outAmount) {
      throw new Error('Invalid swap quote received')
    }

    // Get swap transaction
    const swapTxData = await getSwapTransaction(
      quote,
      userPublicKey.toBase58(),
      true // Wrap/unwrap SOL if needed
    )

    // Deserialize and sign the transaction
    const swapTransaction = Transaction.from(
      Buffer.from(swapTxData.swapTransaction, 'base64')
    )

    // Sign the transaction
    const signed = await signTransaction(swapTransaction)

    // Send and confirm
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    })

    await connection.confirmTransaction(signature, 'confirmed')

    return signature
  } catch (error: any) {
    console.error('Error converting funds:', error)
    throw new Error(`Failed to convert funds: ${error.message}`)
  }
}

/**
 * Common Solana token addresses
 */
export const COMMON_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
}




