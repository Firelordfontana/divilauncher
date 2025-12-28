# Platform Fee Configuration

## Overview

DiviLauncher automatically deducts a **2% platform fee** from all creator funds. This fee is sent to the platform wallet that you control.

## How It Works

### Fee Calculation

1. **Creator funds arrive** (e.g., 100 SOL)
2. **Platform fee deducted first**: 2% = 2 SOL → sent to platform wallet
3. **Remaining funds**: 98 SOL available for allocation
4. **User allocations calculated** from remaining 98 SOL:
   - Reward distribution % of 98 SOL
   - Burn % of 98 SOL
   - Remaining stays with creator

### Example

**Creator funds: 100 SOL**
- Platform fee (2%): 2 SOL → Platform wallet
- Remaining: 98 SOL
- User sets: 50% rewards, 20% burns
  - Rewards: 50% of 98 SOL = 49 SOL
  - Burns: 20% of 98 SOL = 19.6 SOL
  - Creator keeps: 30% of 98 SOL = 29.4 SOL

## Configuration

### Platform Wallet Address

Set your platform wallet address in `.env.local`:

```env
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=YourSolanaWalletAddressHere
```

**Important**: 
- This wallet address receives all platform fees
- Make sure this is a wallet you control
- Keep the private key secure
- Consider using a hardware wallet for security

### Platform Fee Percentage

The platform fee is currently set to **2%** and is hardcoded in `utils/constants.ts`:

```typescript
export const PLATFORM_FEE_PERCENT = 2
```

To change the fee percentage, update this constant.

## Implementation in Solana Program

Your Solana program should:

1. **When creator funds arrive:**
   ```rust
   let total_funds = incoming_amount;
   let platform_fee = total_funds * 2 / 100; // 2%
   let remaining_funds = total_funds - platform_fee;
   ```

2. **Send platform fee to platform wallet:**
   ```rust
   send_sol_to_platform_wallet(platform_fee)?;
   ```

3. **Process remaining funds:**
   ```rust
   let reward_amount = remaining_funds * reward_percent / 100;
   let burn_amount = remaining_funds * burn_percent / 100;
   // ... process rewards and burns
   ```

## Allocation Limits

- **Maximum user allocation**: 98% (rewards + burns)
- **Platform fee**: 2% (automatic)
- **Total**: 100%

Users cannot allocate more than 98% because the 2% platform fee is deducted first.

## Security Considerations

- **Platform wallet security**: The platform wallet private key must be securely stored
- **Access control**: Only your backend/program should have access to send fees
- **Transparency**: Consider displaying platform fee in UI for transparency
- **Audit trail**: Log all platform fee transactions for accounting

## Revenue Model

The 2% platform fee provides revenue for:
- Platform maintenance and development
- Server costs
- Support and operations
- Future feature development

## Example Transaction Flow

```
Creator Funds: 100 SOL
    ↓
Platform Fee (2%): 2 SOL → Platform Wallet ✅
    ↓
Remaining: 98 SOL
    ↓
User Allocation:
  - Rewards: 50% of 98 = 49 SOL
  - Burns: 20% of 98 = 19.6 SOL
  - Creator: 30% of 98 = 29.4 SOL
```

## Summary

- ✅ **2% platform fee** automatically deducted from all creator funds
- ✅ Sent to **platform wallet** (configured in environment variables)
- ✅ Deducted **first**, before calculating user allocations
- ✅ Users can allocate up to **98%** (rewards + burns)
- ✅ Platform fee is **transparent** and shown in allocation summary


