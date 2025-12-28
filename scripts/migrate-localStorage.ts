// Migration script to move data from localStorage to database
// Run with: npx tsx scripts/migrate-localStorage.ts

import { prisma } from '../lib/prisma'

// This script should be run manually after exporting localStorage data
// Example localStorage data structure:
/*
{
  tokens: [
    {
      tokenAddress: "...",
      name: "...",
      // ... other fields
    }
  ],
  profiles: [
    {
      walletAddress: "...",
      username: "...",
      // ... other fields
    }
  ]
}
*/

async function migrateFromLocalStorage(data: {
  tokens?: any[]
  profiles?: any[]
}) {
  try {
    console.log('Starting migration...')

    // Migrate tokens
    if (data.tokens && data.tokens.length > 0) {
      console.log(`Migrating ${data.tokens.length} tokens...`)
      
      for (const token of data.tokens) {
        try {
          // Check if token already exists
          const existing = await prisma.token.findUnique({
            where: { tokenAddress: token.tokenAddress }
          })

          if (existing) {
            console.log(`Token ${token.tokenAddress} already exists, skipping...`)
            continue
          }

          // Create token with allocation history
          await prisma.token.create({
            data: {
              tokenAddress: token.tokenAddress,
              name: token.name,
              ticker: token.ticker,
              description: token.description || null,
              imageUrl: token.imageUrl || null,
              bannerUrl: token.bannerUrl || null,
              launchDate: new Date(token.launchDate),
              creatorWallet: token.creatorWallet,
              currentOwnerWallet: token.currentOwnerWallet || token.creatorWallet,
              platformFeePercent: token.platformFeePercent || 2,
              rewardDistributionPercent: token.rewardDistributionPercent || 0,
              burnPercent: token.burnPercent || 0,
              burnToken: token.burnToken || null,
              rewardToken: token.rewardToken || null,
              initialBuyAmount: token.initialBuyAmount || 0.05,
              socialLinks: token.socialLinks || {},
              allocations: {
                create: (token.allocationHistory || []).map((alloc: any) => ({
                  platformFeePercent: alloc.platformFeePercent,
                  rewardDistributionPercent: alloc.rewardDistributionPercent,
                  burnPercent: alloc.burnPercent,
                  date: new Date(alloc.date),
                }))
              },
              ownershipTransfers: {
                create: (token.ownershipTransferHistory || []).map((transfer: any) => ({
                  fromWallet: transfer.fromWallet,
                  toWallet: transfer.toWallet,
                  fee: transfer.fee || 0.1,
                  date: new Date(transfer.date),
                }))
              }
            }
          })

          console.log(`✓ Migrated token: ${token.name} (${token.ticker})`)
        } catch (error: any) {
          console.error(`✗ Failed to migrate token ${token.tokenAddress}:`, error.message)
        }
      }
    }

    // Migrate profiles
    if (data.profiles && data.profiles.length > 0) {
      console.log(`\nMigrating ${data.profiles.length} profiles...`)
      
      for (const profile of data.profiles) {
        try {
          await prisma.creatorProfile.upsert({
            where: { walletAddress: profile.walletAddress },
            update: {
              username: profile.username || null,
              bio: profile.bio || null,
              profileImageUrl: profile.profileImageUrl || null,
              bannerImageUrl: profile.bannerImageUrl || null,
              socialLinks: profile.socialLinks || {},
            },
            create: {
              walletAddress: profile.walletAddress,
              username: profile.username || null,
              bio: profile.bio || null,
              profileImageUrl: profile.profileImageUrl || null,
              bannerImageUrl: profile.bannerImageUrl || null,
              socialLinks: profile.socialLinks || {},
              createdAt: new Date(profile.createdAt || new Date()),
            }
          })

          console.log(`✓ Migrated profile: ${profile.walletAddress}`)
        } catch (error: any) {
          console.error(`✗ Failed to migrate profile ${profile.walletAddress}:`, error.message)
        }
      }
    }

    console.log('\n✅ Migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Example usage:
// 1. Export localStorage data from browser console:
//    JSON.stringify({
//      tokens: JSON.parse(localStorage.getItem('launchedTokens') || '[]'),
//      profiles: JSON.parse(localStorage.getItem('creatorProfiles') || '[]')
//    })
//
// 2. Save to a file (e.g., localStorage-backup.json)
//
// 3. Run this script:
//    import data from './localStorage-backup.json'
//    migrateFromLocalStorage(data)

export { migrateFromLocalStorage }

// If running directly:
if (require.main === module) {
  console.log('Please import this function and call it with your localStorage data.')
  console.log('See comments in the file for usage instructions.')
}

