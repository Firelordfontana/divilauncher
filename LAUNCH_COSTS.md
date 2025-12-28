# PumpFun Token Launch Costs

## Minimum SOL Required Per Launch

### Breakdown of Fees:

1. **Transaction Gas Fees**: ~0.005 SOL
   - For creating the token transaction
   - For any metadata/configuration transactions

2. **First Buy Fee**: 0.02 SOL
   - Required to make token visible on-chain
   - Paid by the first buyer (your program wallet if you do the first buy)

3. **Recommended Buffer**: 0.015 SOL
   - For future transactions
   - Safety margin for fee fluctuations

4. **Optional: Initial Liquidity**: Variable
   - If you want to add initial liquidity
   - Not required, but can help token visibility

### **Total Minimum: ~0.04 - 0.05 SOL per launch**

## Recommended Program Wallet Balance

### For Single Launch:
- **Minimum**: 0.05 SOL
- **Recommended**: 0.1 SOL (includes safety buffer)

### For Multiple Launches:
- **10 launches**: 0.5 - 1 SOL
- **50 launches**: 2.5 - 5 SOL
- **100 launches**: 5 - 10 SOL

### Ongoing Operations:
- **Monitoring/Processing**: ~0.001 SOL per transaction
- **Reward Distribution**: Gas fees for each distribution
- **Jupiter Swaps**: Gas fees + potential slippage

## Cost Breakdown Per Launch

```
Token Creation:        FREE
Gas Fees:            ~0.005 SOL
First Buy Fee:        0.02 SOL
Buffer:              0.015 SOL
─────────────────────────────
Total Minimum:      ~0.04 SOL
Recommended:        ~0.05 SOL
With Safety:        ~0.1 SOL
```

## Additional Considerations

### If You Skip First Buy:
- Token won't be visible on-chain immediately
- Users can still buy, but it requires the first buy fee
- Minimum needed: ~0.005 SOL (just gas)

### If You Add Initial Liquidity:
- Additional SOL needed for liquidity pair
- Amount depends on your strategy
- Typically 0.1 - 1 SOL+ for meaningful liquidity

### Raydium Graduation (Later):
- 0.015 SOL fee when token reaches bonding curve completion
- This happens automatically when token is fully sold
- Not needed at launch time

## Recommended Setup

For your program wallet launching tokens:

1. **Initial Funding**: 1-2 SOL
   - Allows for 20-40 launches
   - Includes safety buffer
   - Covers unexpected fees

2. **Monitoring Threshold**: 0.1 SOL
   - Alert when balance drops below this
   - Refill before running out

3. **Per Launch Budget**: 0.05 SOL
   - Safe amount per token launch
   - Includes all fees and buffer

## Example Scenarios

### Scenario 1: Launch Only (No First Buy)
- Gas fees: 0.005 SOL
- **Total: ~0.01 SOL** (minimal, token not immediately visible)

### Scenario 2: Launch + First Buy
- Gas fees: 0.005 SOL
- First buy fee: 0.02 SOL
- Buffer: 0.015 SOL
- **Total: ~0.04 SOL** (recommended minimum)

### Scenario 3: Launch + First Buy + Small Liquidity
- All of Scenario 2: 0.04 SOL
- Initial liquidity: 0.1 SOL
- **Total: ~0.14 SOL**

## Summary

**Minimum to launch a token: ~0.04 - 0.05 SOL**

This covers:
- ✅ Token creation (free)
- ✅ Gas fees
- ✅ First buy to make it visible
- ✅ Safety buffer

**Recommended program wallet balance: 1-2 SOL** for multiple launches with safety margin.




