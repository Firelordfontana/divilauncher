// SDK Usage with Solana Wallet Adapter
// This is an example showing how to use the SDK with React and wallet adapter

import { DiviLauncherSDK } from '../src'

// Example: Using SDK with wallet adapter in a React component
// Note: This is a conceptual example. In a real React component, you would use:
// import { useWallet } from '@solana/wallet-adapter-react'
// import { useState } from 'react'

async function walletIntegrationExample() {
  // Initialize SDK
  const sdk = new DiviLauncherSDK({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  })

  // Example wallet address (in real app, get from useWallet hook)
  const walletAddress = 'YOUR_WALLET_ADDRESS'

  // Example: Create token with wallet
  async function handleCreateToken() {
    if (!walletAddress) {
      console.error('Please connect your wallet')
      return
    }

    try {
      const { token } = await sdk.tokens.create({
        tokenAddress: 'GENERATED_TOKEN_ADDRESS', // In real app, generate this
        name: 'My Token',
        ticker: 'MTK',
        description: 'A token created via SDK',
        creatorWallet: walletAddress,
        platformFeePercent: 2,
        rewardDistributionPercent: 50,
        burnPercent: 20,
        initialBuyAmount: 0.1,
      })

      console.log(`Token created: ${token.name} (${token.ticker})`)
    } catch (error: any) {
      console.error('Failed to create token:', error)
      console.error(`Error: ${error.message}`)
    }
  }

  // Example: Get tokens owned by wallet
  async function handleGetMyTokens() {
    if (!walletAddress) return

    try {
      const { tokens } = await sdk.tokens.getByOwner(walletAddress)
      console.log('My tokens:', tokens)
    } catch (error) {
      console.error('Failed to get tokens:', error)
    }
  }

  // Example: Get wallet balance
  async function handleGetBalance() {
    if (!walletAddress) return

    try {
      const { balance } = await sdk.balance.get(walletAddress)
      console.log(`Balance: ${balance} SOL`)
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  // Run examples
  await handleGetMyTokens()
  await handleGetBalance()
  // await handleCreateToken() // Uncomment to test token creation
}

// React Component Example (for reference):
/*
import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { DiviLauncherSDK } from '@divilauncher/sdk'

function TokenCreator() {
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const sdk = new DiviLauncherSDK({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  })

  const handleCreateToken = async () => {
    if (!wallet.publicKey) {
      alert('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      const { token } = await sdk.tokens.create({
        tokenAddress: 'GENERATED_TOKEN_ADDRESS',
        name: 'My Token',
        ticker: 'MTK',
        description: 'A token created via SDK',
        creatorWallet: wallet.publicKey.toBase58(),
        platformFeePercent: 2,
        rewardDistributionPercent: 50,
        burnPercent: 20,
        initialBuyAmount: 0.1,
      })
      alert(`Token created: ${token.name} (${token.ticker})`)
    } catch (error: any) {
      console.error('Failed to create token:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleCreateToken} disabled={loading || !wallet.connected}>
        {loading ? 'Creating...' : 'Create Token'}
      </button>
    </div>
  )
}
*/

export { walletIntegrationExample }

