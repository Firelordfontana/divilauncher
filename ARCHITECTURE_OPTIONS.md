# Architecture Options for DiviLauncher

## The Key Question

**Who owns the token launch, and where do creator funds go?**

## Option 1: User Launches with Their Wallet (Current Approach)

### How It Works:
1. User connects their wallet (Phantom, Solflare, etc.)
2. User launches token on PumpFun using **their own wallet**
3. PumpFun sends creator funds to **user's wallet** (or PumpFun's treasury)
4. Your program monitors and processes funds

### Pros:
- ✅ User owns the token launch
- ✅ User has full control
- ✅ More decentralized

### Cons:
- ❌ If funds go to user's wallet, program can't automatically access them
- ❌ User would need to manually trigger distribution OR
- ❌ Program would need user to sign transactions for each distribution
- ❌ Not fully automatic

### Implementation:
```rust
// User must sign each time funds are processed
pub fn process_funds(
    ctx: Context<ProcessFunds>,
) -> Result<()> {
    // Requires user signature to transfer from their wallet
    // Not fully automatic
}
```

---

## Option 2: Program Wallet Launches Tokens

### How It Works:
1. User connects wallet to your platform
2. **Your program's wallet** launches the token on PumpFun
3. Creator funds go to **program-controlled account**
4. Program automatically processes funds (no user signature needed)

### Pros:
- ✅ Fully automatic - no user signatures needed
- ✅ Program has full control over funds
- ✅ Can process immediately when funds arrive

### Cons:
- ❌ User doesn't own the token launch
- ❌ Program wallet owns all tokens
- ❌ Less decentralized
- ❌ User must trust your platform

### Implementation:
```rust
// Program wallet owns token, can process automatically
pub fn process_funds(
    ctx: Context<ProcessFunds>,
) -> Result<()> {
    // Program has authority, can process automatically
    // No user signature needed
}
```

---

## Option 3: Hybrid - Program PDA Treasury (RECOMMENDED)

### How It Works:
1. User connects their wallet
2. User launches token on PumpFun with **their wallet**
3. During launch, program creates a **PDA (Program Derived Address) treasury** for that token
4. PumpFun creator funds are configured to go to the **PDA treasury** (if possible)
5. Program automatically processes funds from PDA (no user signature needed)
6. User still owns the token, but rewards are handled automatically

### Pros:
- ✅ User owns the token launch
- ✅ Fully automatic processing (PDA is program-controlled)
- ✅ No user signatures needed for distributions
- ✅ Best of both worlds

### Cons:
- ⚠️ Requires PumpFun to support custom treasury addresses
- ⚠️ Or requires additional setup to route funds to PDA

### Implementation:
```rust
// PDA treasury receives funds, program can process automatically
pub fn initialize_token_treasury(
    ctx: Context<InitializeTreasury>,
    token_mint: Pubkey,
) -> Result<()> {
    // Create PDA treasury for this token
    // This PDA will receive creator funds
}

pub fn process_funds(
    ctx: Context<ProcessFunds>,
) -> Result<()> {
    // Process from PDA - no user signature needed
    // Fully automatic
}
```

---

## Option 4: User Delegates Authority (Alternative)

### How It Works:
1. User launches token with their wallet
2. User **delegates authority** to your program for reward processing
3. Creator funds go to user's wallet
4. Program can process funds using delegated authority
5. User can revoke delegation anytime

### Pros:
- ✅ User owns token
- ✅ User maintains control (can revoke)
- ✅ Program can process automatically (with delegation)

### Cons:
- ⚠️ Requires user to set up delegation (extra step)
- ⚠️ More complex UX

---

## Recommended Approach: Option 3 (PDA Treasury)

### Why This Works Best:

1. **User launches with their wallet** → They own the token
2. **PDA treasury receives creator funds** → Program can process automatically
3. **Fully automatic** → No user signatures needed for distributions
4. **User maintains ownership** → They control the token

### Implementation Flow:

```
1. User connects wallet
2. User fills form (reward token, percentages)
3. User clicks "Launch Token"
4. Frontend calls your program to create PDA treasury
5. Token launches on PumpFun with:
   - User's wallet as creator
   - PDA treasury as recipient for creator funds
6. Creator funds arrive in PDA treasury
7. Program automatically processes:
   - Swaps SOL → Reward Token
   - Distributes to holders
   - Sends burns
```

### Code Structure:

```rust
// 1. Initialize treasury when token is launched
pub fn initialize_reward_system(
    ctx: Context<InitializeRewardSystem>,
    token_mint: Pubkey,
    reward_token: Pubkey,
    reward_percent: u8,
    burn_percent: u8,
) -> Result<()> {
    // Create PDA treasury
    // Store configuration
    // This PDA will receive PumpFun creator funds
}

// 2. Process funds automatically (called by cron/monitor)
pub fn process_creator_funds(
    ctx: Context<ProcessFunds>,
) -> Result<()> {
    // Read from PDA treasury
    // Process automatically (no user signature needed)
    // Swap and distribute
}
```

---

## What You Need to Check

1. **Does PumpFun allow custom treasury addresses?**
   - If yes → Use Option 3 (PDA Treasury)
   - If no → Need to use Option 2 or 4

2. **Alternative if PumpFun doesn't support custom treasuries:**
   - Use Option 2: Program wallet launches
   - OR Option 4: User delegates authority
   - OR: Monitor user's wallet and request signatures when needed

---

## Summary

**Best Case (if PumpFun supports it):**
- User launches with their wallet
- Creator funds go to program-controlled PDA
- Fully automatic processing
- User owns token

**Fallback:**
- Program wallet launches tokens
- Fully automatic
- User doesn't own launch (but gets rewards)

**Current Frontend:**
- Assumes user launches with their wallet
- You'll need to decide which option fits your use case


