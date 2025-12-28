/**
 * Script to create a test token in the database
 * 
 * Usage:
 *   npm run tsx scripts/create-test-token.ts
 * 
 * Or with ts-node:
 *   npx tsx scripts/create-test-token.ts
 */

import { prisma } from '../lib/prisma'

async function createTestToken() {
  try {
    console.log('Creating test token...')

    // Generate a fake Solana wallet address (44 characters, base58-like)
    const generateFakeAddress = () => {
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let result = ''
      for (let i = 0; i < 44; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    const testToken = {
      tokenAddress: generateFakeAddress(),
      name: 'Test Token',
      ticker: 'TEST',
      description: 'This is a test token created to verify database connectivity',
      imageUrl: 'https://via.placeholder.com/400',
      bannerUrl: null,
      creatorWallet: generateFakeAddress(),
      currentOwnerWallet: generateFakeAddress(),
      platformFeePercent: 2.0,
      rewardDistributionPercent: 5.0,
      burnPercent: 3.0,
      burnToken: null,
      rewardToken: null,
      initialBuyAmount: 0.05,
      socialLinks: {
        twitter: 'https://twitter.com/test',
        telegram: 'https://t.me/test',
        website: 'https://test.com'
      }
    }

    const createdToken = await prisma.token.create({
      data: {
        ...testToken,
        allocations: {
          create: {
            platformFeePercent: testToken.platformFeePercent,
            rewardDistributionPercent: testToken.rewardDistributionPercent,
            burnPercent: testToken.burnPercent,
          }
        }
      },
      include: {
        allocations: true,
        ownershipTransfers: true
      }
    })

    console.log('✅ Test token created successfully!')
    console.log('\nToken Details:')
    console.log(`  ID: ${createdToken.id}`)
    console.log(`  Name: ${createdToken.name}`)
    console.log(`  Ticker: ${createdToken.ticker}`)
    console.log(`  Token Address: ${createdToken.tokenAddress}`)
    console.log(`  Creator Wallet: ${createdToken.creatorWallet}`)
    console.log(`  Created At: ${createdToken.createdAt}`)
    console.log('\nYou can now view this token on the tokens page!')
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to create test token:', error.message)
    console.error('\nError details:', error)
    process.exit(1)
  }
}

createTestToken()

