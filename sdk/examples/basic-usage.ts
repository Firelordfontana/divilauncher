// Basic SDK Usage Examples

import { DiviLauncherSDK } from '../src'

// Initialize SDK
const sdk = new DiviLauncherSDK({
  apiUrl: 'http://localhost:3000', // Development
  // apiUrl: 'https://api.divilauncher.com', // Production
})

async function examples() {
  try {
    // 1. Get all tokens
    console.log('Getting all tokens...')
    const { tokens, total } = await sdk.tokens.getAll({ limit: 10 })
    console.log(`Found ${total} tokens`)

    // 2. Get tokens by owner
    console.log('\nGetting tokens by owner...')
    const walletAddress = 'YOUR_WALLET_ADDRESS'
    const { tokens: myTokens } = await sdk.tokens.getByOwner(walletAddress)
    console.log(`You have ${myTokens.length} tokens`)

    // 3. Get single token
    if (tokens.length > 0) {
      console.log('\nGetting single token...')
      const { token } = await sdk.tokens.get(tokens[0].tokenAddress)
      console.log(`Token: ${token.name} (${token.ticker})`)
    }

    // 4. Get balance
    console.log('\nGetting balance...')
    const { balance, cached } = await sdk.balance.get(walletAddress)
    console.log(`Balance: ${balance} SOL (cached: ${cached})`)

    // 5. Get profile
    console.log('\nGetting profile...')
    try {
      const { profile } = await sdk.profiles.get(walletAddress)
      console.log(`Profile: ${profile.username || 'No username'}`)
    } catch (error) {
      console.log('Profile not found')
    }

    // 6. Create token (example)
    console.log('\nCreating token...')
    const { token: newToken } = await sdk.tokens.create({
      tokenAddress: 'So11111111111111111111111111111111111111112',
      name: 'My Token',
      ticker: 'MTK',
      description: 'A great token',
      creatorWallet: walletAddress,
      platformFeePercent: 2,
      rewardDistributionPercent: 50,
      burnPercent: 20,
      rewardToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      initialBuyAmount: 0.1,
    })
    console.log(`Created token: ${newToken.name}`)

    // 7. Update allocations
    console.log('\nUpdating allocations...')
    const { token: updatedToken } = await sdk.tokens.updateAllocations(
      newToken.tokenAddress,
      {
        walletAddress: walletAddress,
        platformFeePercent: 3,
        rewardDistributionPercent: 60,
        burnPercent: 25,
      }
    )
    console.log(`Updated allocations for ${updatedToken.name}`)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Run examples
examples()

