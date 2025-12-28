# DiviLauncher Architecture

## How Token Conversion Works

### Yes, You Can Launch on PumpFun AND Have Automatic Conversion!

**PumpFun handles the token launch**, and **your Solana program handles the automatic conversion**. They work together:

1. **Token launches on PumpFun** (via the frontend)
2. **Configuration is stored** in token metadata (reward token, percentages)
3. **Your Solana program monitors** the PumpFun creator funds account
4. **When funds arrive**, your program automatically converts and distributes

### Current Implementation (Frontend Only)

The current frontend application **only collects configuration**. When a user inputs a reward token address, it's stored in the token metadata but **does not automatically convert funds**.

### How Automatic Conversion Works with PumpFun

The automatic conversion requires a **Solana Program (Smart Contract)** to be deployed that:

1. **Monitors Creator Funds**: The program watches the PumpFun creator funds account for your token
2. **Reads Configuration**: Retrieves the reward token address and percentages from the token metadata
3. **Performs Swap**: When funds arrive, automatically swaps SOL → Reward Token using Jupiter
4. **Distributes Rewards**: Sends converted tokens to holders based on shares (500k tokens = 1 share, max 50 shares per wallet)
5. **Handles Burns**: Uses burn percentage of creator funds to buy back the created token, then sends those tokens to Solana burn address (reduces token supply)

**Key Point**: Your program is separate from PumpFun - it just monitors PumpFun's accounts and acts when funds arrive.

### Flow Diagram

```
User Launches Token via Frontend
    ↓
Token Created on PumpFun ✅
    ↓
Configuration Stored in Token Metadata:
  - Reward Token Address
  - Reward Distribution %
  - Burn %
    ↓
[YOUR SOLANA PROGRAM - Deployed Separately]
    ↓
Program Monitors PumpFun Creator Funds Account
    ↓
Creator Funds Arrive from PumpFun (SOL)
    ↓
Program Detects Funds (via account monitoring or instruction)
    ↓
Program Reads Configuration from Token Metadata
    ↓
Program Swaps SOL → Reward Token (via Jupiter Swap Program)
    ↓
Program Distributes:
  - X% to token holders (based on wallet weight)
  - Y% to burn address (1111111...)
  - Remaining stays with creator
```

### How PumpFun and Your Program Work Together

1. **PumpFun**: Handles token creation, bonding curve, and initial liquidity
2. **Your Program**: Monitors PumpFun's creator funds account and handles conversion/distribution
3. **They're separate but complementary**:
   - PumpFun creates the token and manages trading
   - Your program handles the reward/burn logic using PumpFun's creator funds

### What Needs to Be Built

You need to deploy a **Solana Program** that:

1. **Listens for Events**: Monitors when creator funds arrive in the treasury account
2. **Calls Jupiter Swap**: Uses Jupiter's program to swap tokens
3. **Distributes Tokens**: Calculates wallet weights and distributes rewards
4. **Handles Burns**: Sends funds to burn address

### Example Solana Program Structure

```rust
// Pseudocode - not actual Rust code
// This program works alongside PumpFun

pub fn process_creator_funds(
    ctx: Context<ProcessFunds>,
    amount: u64,
) -> Result<()> {
    // 1. Verify this is from PumpFun creator funds account
    require!(
        ctx.accounts.creator_funds_account.owner == PUMPFUN_PROGRAM_ID,
        ErrorCode::InvalidSource
    );
    
    // 2. Read configuration from token metadata (stored during launch)
    let config = get_token_config(&ctx.accounts.token_mint)?;
    
    // 3. Calculate amounts
    let reward_amount = amount * config.reward_percent / 100;
    let burn_amount = amount * config.burn_percent / 100;
    
    // 4. Swap SOL to reward token via Jupiter
    if reward_amount > 0 {
        jupiter_swap(
            SOL_MINT,
            config.reward_token_mint,
            reward_amount,
        )?;
    }
    
    // 5. Distribute to holders (based on shares: 500k = 1 share, max 50 shares per wallet)
    distribute_rewards(&ctx, reward_amount)?;
    
    // 6. Send to burn address
    if burn_amount > 0 {
        send_to_burn(&ctx, burn_amount)?;
    }
    
    Ok(())
}

// Monitor function - can be called by cron job or account change listener
pub fn check_and_process_funds(
    ctx: Context<CheckFunds>,
) -> Result<()> {
    // Check if new funds arrived in PumpFun creator account
    let current_balance = ctx.accounts.creator_funds_account.lamports();
    let last_processed = ctx.accounts.state.last_processed_balance;
    
    if current_balance > last_processed {
        let new_funds = current_balance - last_processed;
        process_creator_funds(ctx, new_funds)?;
        ctx.accounts.state.last_processed_balance = current_balance;
    }
    
    Ok(())
}
```

### Integration Points

1. **PumpFun Creator Funds Account**: Your program monitors this account
2. **Token Metadata**: Configuration stored here during launch
3. **Jupiter Swap Program**: Your program calls this for conversions
4. **Token Holders**: Your program distributes to these accounts

### Current Frontend Capabilities

The frontend currently:
- ✅ Collects reward token address
- ✅ Stores configuration in metadata
- ✅ Provides UI for configuration
- ❌ Does NOT perform automatic conversion
- ❌ Does NOT monitor funds
- ❌ Does NOT distribute rewards

### Next Steps

To make conversion automatic while still using PumpFun:

1. **Deploy a Solana Program** that handles the conversion logic
   - Program is separate from PumpFun
   - Monitors PumpFun's creator funds account
   - Works alongside PumpFun, not replacing it

2. **Set up monitoring** to trigger when funds arrive:
   - Option A: Cron job that calls your program's `check_and_process_funds` instruction
   - Option B: Account change listener that triggers on balance changes
   - Option C: PumpFun webhook (if they support it) that calls your program

3. **Integrate Jupiter Swap** into your program
   - Use Jupiter's program ID and instruction format
   - Swap SOL → Reward Token automatically

4. **Implement wallet weight calculation** for distribution
   - Query token holders and their balances
   - Calculate proportional distribution
   - Send rewards to each holder

5. **Test on devnet** before mainnet deployment
   - Deploy program to devnet
   - Test with devnet PumpFun tokens
   - Verify conversion and distribution work correctly

### Key Architecture Points

✅ **PumpFun handles**: Token creation, bonding curve, trading, liquidity
✅ **Your program handles**: Monitoring creator funds, conversion, distribution, burns
✅ **They work together**: PumpFun creates tokens, your program enhances them with rewards

### Alternative: Manual Conversion

Until the program is deployed, you could:
- Manually monitor creator funds
- Use the `convertFundsToRewardToken()` function in `utils/tokenSwap.ts` to convert funds
- Manually distribute to holders

But this defeats the purpose of "automatic" conversion.

