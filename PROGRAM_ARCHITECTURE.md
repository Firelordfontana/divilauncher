# Program Wallet Launch Architecture

## Overview

Since PumpFun doesn't allow custom treasury addresses, **the program wallet launches all tokens** to enable fully automatic reward processing.

## How It Works

### Launch Flow

```
1. User connects wallet to frontend
2. User fills out token configuration form
3. User clicks "Launch Token"
4. Frontend sends configuration to backend/API
5. Backend calls Solana program with program wallet
6. Program wallet launches token on PumpFun
7. Token is created and trading begins
8. Creator funds flow to program wallet
9. Program automatically processes funds:
   - Converts SOL → Reward Token
   - Distributes to holders
   - Sends burns
```

### Key Points

- ✅ **User configures**: User provides token details, reward settings, etc.
- ✅ **Program launches**: Program wallet actually creates the token on PumpFun
- ✅ **Automatic processing**: Program wallet receives funds and processes automatically
- ✅ **No user signatures needed**: After launch, everything is automatic

## Program Wallet Responsibilities

### 1. Token Launch
- Receives launch request
- Validates configuration
- Launches token on PumpFun using program wallet
- Stores configuration in token metadata

### 2. Fund Processing
- Monitors program wallet for incoming creator funds
- Automatically processes when funds arrive:
  - **Deducts 2% platform fee** and sends to platform wallet
  - Calculates reward and burn amounts from remaining funds
  - Swaps SOL → Reward Token via Jupiter (if rewards > 0%)
  - Distributes rewards to token holders
  - Uses burn percentage to buy back created token, then sends to burn address (reduces supply)

### 3. Distribution Logic
- Queries token holders and balances
- Calculates shares: Each 500,000 tokens = 1 share
- Caps shares: Maximum 50 shares per wallet
- Distributes rewards proportionally based on shares (not total holdings)
- Handles edge cases (dust, minimum amounts, etc.)

**Share Calculation:**
- 500,000 tokens = 1 share
- Maximum 50 shares per wallet (25M tokens cap)
- Example: 2.5M tokens = 5 shares, 30M tokens = 50 shares (capped)
- This prevents large holders from dominating rewards

## User Experience

### What Users See

1. **Connect Wallet**: User connects their wallet (Phantom, Solflare, etc.)
2. **Configure Token**: User fills out the form with:
   - Token name, ticker, description
   - Image and social links
   - Reward distribution %
   - Burn %
   - Reward token address
3. **Launch**: User clicks "Launch Token"
4. **Confirmation**: User sees token address and transaction signature
5. **Automatic Rewards**: From that point, rewards are distributed automatically

### What Users Don't Need to Do

- ❌ Don't need to sign transactions for each reward distribution
- ❌ Don't need to manually convert funds
- ❌ Don't need to monitor funds
- ❌ Don't need to distribute rewards

## Security Considerations

### Program Wallet Security

- **Private Key Management**: Program wallet private key must be securely stored
- **Access Control**: Only authorized backend services should access program wallet
- **Rate Limiting**: Prevent abuse of launch functionality
- **Validation**: Validate all configurations before launching

### User Trust

- Users must trust that:
  - Program will launch tokens correctly
  - Rewards will be distributed as configured
  - Burns will be sent as configured
  - No funds will be misappropriated

### Transparency

- Consider providing:
  - On-chain verification of configurations
  - Public program source code
  - Transaction history
  - Real-time status of reward distributions

## Implementation Details

### Backend API Endpoints Needed

```typescript
// Launch token endpoint
POST /api/launch-token
Body: {
  name: string
  ticker: string
  description: string
  image: File
  socialLinks: {...}
  rewardDistributionPercent: number
  burnPercent: number
  dividendToken: string
  userWallet: string // User's wallet address (for reference)
}
Response: {
  tokenAddress: string
  transactionSignature: string
}

// Check token status
GET /api/token/:tokenAddress
Response: {
  tokenAddress: string
  totalFundsReceived: number
  totalRewardsDistributed: number
  totalBurned: number
  lastProcessed: timestamp
}
```

### Solana Program Structure

```rust
// Launch token instruction
pub fn launch_token(
    ctx: Context<LaunchToken>,
    config: TokenConfig,
) -> Result<()> {
    // 1. Validate configuration
    // 2. Launch token on PumpFun using program wallet
    // 3. Store configuration in metadata
    // 4. Initialize reward system state
}

// Process creator funds (called automatically)
pub fn process_creator_funds(
    ctx: Context<ProcessFunds>,
) -> Result<()> {
    // 1. Check for new funds in program wallet
    // 2. Read configuration
    // 3. Calculate amounts
    // 4. Swap via Jupiter
    // 5. Distribute to holders
    // 6. Send burns
}

// Get token status
pub fn get_token_status(
    ctx: Context<GetStatus>,
) -> Result<TokenStatus> {
    // Return current status
}
```

## Monitoring & Automation

### Automatic Processing

The program needs to automatically process funds. Options:

1. **Cron Job**: Backend service calls program instruction periodically
2. **Account Monitoring**: Monitor program wallet balance changes
3. **Event Listeners**: Listen for PumpFun events
4. **Webhook**: If PumpFun provides webhooks

### Recommended Approach

**Cron Job + Account Monitoring**:
- Backend service runs every X minutes
- Checks program wallet for new funds
- Calls `process_creator_funds` instruction if funds detected
- Updates state to track processed amounts

## Cost Considerations

### Program Wallet Costs

- **Launch Costs**: SOL needed for each token launch
- **Transaction Fees**: Fees for swaps and distributions
- **Rent**: Account rent for program state accounts

### Funding Strategy

- Pre-fund program wallet with sufficient SOL
- **Minimum per launch: ~0.04-0.05 SOL** (covers gas + first buy fee + buffer)
- **Recommended initial funding: 1-2 SOL** (allows 20-40 launches)
- Monitor wallet balance
- Alert when balance drops below 0.1 SOL
- Consider charging users a small fee for launches (optional)

See `LAUNCH_COSTS.md` for detailed cost breakdown.

## Testing Strategy

1. **Deploy program to devnet**
2. **Test token launches** with devnet PumpFun
3. **Test fund processing** with test funds
4. **Test distribution logic** with multiple holders
5. **Test edge cases** (zero holders, small amounts, etc.)
6. **Security audit** before mainnet
7. **Gradual rollout** on mainnet

## Summary

- **Program wallet launches tokens** → Enables automatic processing
- **Users configure** → Provide token details and reward settings
- **Fully automatic** → No user signatures needed after launch
- **Secure & transparent** → Program handles everything automatically

