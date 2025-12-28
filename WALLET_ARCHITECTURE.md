# Wallet Architecture

DiviLauncher uses **two separate wallets** for different purposes:

## 1. Platform Wallet (Fee Collection)

**Environment Variable:** `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS`

**Purpose:** Receives the 2% platform fee from all token launches

**Current Address:** `EYztxemddPNrAtur4yqEZtcWu2TQVxM9zd3taU5GNMgy`

**How it works:**
- When creator funds arrive, 2% is automatically deducted
- This 2% is sent to the Platform Wallet
- This is your personal wallet for receiving platform revenue

**Security:**
- This wallet should be secure (consider hardware wallet)
- You control this wallet completely
- Funds here are your platform fees

---

## 2. Launch/Program Wallet (Token Launch & Processing)

**Environment Variable:** `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS`

**Purpose:** 
- Receives funds from users when they launch tokens
- Launches tokens on PumpFun with user-provided details
- Pays PumpFun launch fees
- Receives creator funds from PumpFun (for processing rewards/burns)

**How it works:**
1. User wants to launch a token
2. User sends SOL to Launch Wallet (covers launch fees + initial buy)
3. Launch Wallet uses those funds to:
   - Launch token on PumpFun with:
     - Name
     - Ticker
     - Description
     - Social links (Telegram, Twitter, Website, Discord)
     - Images (from IPFS/Pinata)
   - Pay PumpFun launch fees
   - Make initial buy (if user provided funds for it)
4. Creator funds from PumpFun go to Launch Wallet
5. Launch Wallet processes funds:
   - Deducts 2% platform fee → sends to Platform Wallet
   - Processes reward distribution (if configured)
   - Processes burn (if configured)

**Security:**
- This wallet needs to be controlled by your backend/program
- Should have sufficient SOL for launch fees
- Will receive and process user funds automatically
- Consider using a program-derived address (PDA) for better security

---

## Wallet Flow Diagram

```
User Launches Token
    ↓
User sends SOL → Launch Wallet
    ↓
Launch Wallet launches token on PumpFun:
  - Uses user's name, ticker, description
  - Uploads images from IPFS
  - Sets social links
  - Pays PumpFun fees
    ↓
Token is live on PumpFun
    ↓
Creator funds accumulate → Launch Wallet
    ↓
Launch Wallet processes:
  - 2% → Platform Wallet (your fee)
  - Remaining → Rewards/Burns/Creator
```

---

## Environment Variables

Add both wallets to your `.env.local`:

```env
# Platform Wallet (receives 2% fees)
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=EYztxemddPNrAtur4yqEZtcWu2TQVxM9zd3taU5GNMgy

# Launch Wallet (launches tokens, receives funds)
NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS=YourLaunchWalletAddressHere
```

---

## Important Notes

1. **Different Wallets:** These are two separate wallets with different purposes
2. **Platform Wallet:** Your personal wallet for fees (you control)
3. **Launch Wallet:** Program wallet for operations (backend controls)
4. **Security:** Both should be secured, but Launch Wallet needs programmatic access
5. **Funding:** Launch Wallet needs SOL for launch fees and operations

---

## Next Steps

1. Create a new Solana wallet for the Launch Wallet
2. Fund it with SOL (for launch fees)
3. Add `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS` to `.env.local`
4. Update your backend/program to use this wallet for launches

