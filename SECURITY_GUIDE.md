# Security Guide: Launch Wallet Private Key

## ⚠️ CRITICAL SECURITY INFORMATION

The Launch Wallet private key is **extremely sensitive** and must be protected at all costs. If compromised, attackers could:
- Steal all funds in the launch wallet
- Launch unauthorized tokens
- Drain user funds
- Destroy your platform's reputation

## How We Protect the Private Key

### 1. Server-Side Only

✅ **Correct:** `LAUNCH_WALLET_PRIVATE_KEY` (no `NEXT_PUBLIC_` prefix)
- Only accessible on the server
- Never sent to the browser
- Never exposed in client-side code

❌ **WRONG:** `NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY`
- Would be exposed to the browser
- Visible in client-side JavaScript
- Anyone could steal it

### 2. Runtime Protection

The code includes automatic checks that:
- Prevent the private key from being accessed in client components
- Throw errors if accidentally exposed
- Validate the environment variable name

### 3. Build-Time Validation

Next.js automatically:
- Only exposes `NEXT_PUBLIC_*` variables to the client
- Keeps other environment variables server-side only
- Bundles them separately for client vs server

## Environment Variable Setup

### ✅ Correct Setup

```env
# .env.local (server-side only, never commit to git)

# Public address (safe to expose)
NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS=YourWalletAddressHere

# Private key (SERVER-SIDE ONLY - never expose!)
LAUNCH_WALLET_PRIVATE_KEY=YourPrivateKeyBase58Here
```

### ❌ NEVER Do This

```env
# ❌ WRONG - This exposes the private key to the browser!
NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY=YourPrivateKeyBase58Here
```

## Where to Use the Private Key

### ✅ Safe Locations (Server-Side Only)

1. **API Routes** (`app/api/**/route.ts`)
   ```typescript
   import { getLaunchWallet } from '@/utils/launchWallet'
   
   export async function POST(request: NextRequest) {
     const launchWallet = getLaunchWallet() // ✅ Safe - API routes are server-side
     // ... use wallet
   }
   ```

2. **Server Actions** (`'use server'`)
   ```typescript
   'use server'
   
   import { getLaunchWallet } from '@/utils/launchWallet'
   
   export async function launchToken(data: TokenData) {
     const launchWallet = getLaunchWallet() // ✅ Safe - Server actions are server-side
     // ... use wallet
   }
   ```

3. **Server Components** (default in Next.js App Router)
   ```typescript
   // No 'use client' directive = Server Component
   import { getLaunchWallet } from '@/utils/launchWallet'
   
   export default async function Page() {
     const launchWallet = getLaunchWallet() // ✅ Safe - Server components are server-side
     // ... use wallet
   }
   ```

### ❌ NEVER Use In (Client-Side)

1. **Client Components** (`'use client'`)
   ```typescript
   'use client' // ❌ DANGER!
   
   import { getLaunchWallet } from '@/utils/launchWallet' // ❌ Will throw error
   ```

2. **Browser JavaScript**
   ```typescript
   // ❌ Never import in any client-side code
   import { LAUNCH_WALLET_PRIVATE_KEY } from '@/utils/constants'
   ```

3. **Frontend Components**
   ```typescript
   // ❌ Any component that runs in the browser
   export default function ClientComponent() {
     // Never access private key here
   }
   ```

## Deployment Security

### Vercel

1. Go to **Project Settings** → **Environment Variables**
2. Add `LAUNCH_WALLET_PRIVATE_KEY` (without `NEXT_PUBLIC_`)
3. Mark it as **Sensitive** (Vercel will hide it in logs)
4. Set for **Production**, **Preview**, and **Development**
5. **Never** add it with `NEXT_PUBLIC_` prefix

### Other Platforms

- **Railway**: Add in Variables (not exposed to client)
- **Render**: Add in Environment (server-side only)
- **AWS/GCP**: Use Secrets Manager (most secure)

## Security Checklist

Before deploying:

- [ ] Private key is `LAUNCH_WALLET_PRIVATE_KEY` (NOT `NEXT_PUBLIC_*`)
- [ ] `.env.local` is in `.gitignore` (never commit)
- [ ] Private key only used in API routes/server actions
- [ ] No `'use client'` components import launch wallet utilities
- [ ] Environment variables set correctly in deployment platform
- [ ] Private key marked as sensitive in deployment platform
- [ ] Backup stored securely (password manager, encrypted)
- [ ] Access limited to trusted team members only

## What Happens If Compromised?

If your private key is exposed:

1. **Immediately** transfer all funds from the launch wallet
2. Generate a new wallet and private key
3. Update environment variables everywhere
4. Revoke old key access
5. Monitor for unauthorized transactions
6. Notify users if funds were stolen

## Best Practices

1. **Separate Wallets**
   - Launch Wallet: For operations (can be compromised, limited funds)
   - Platform Wallet: For fees (hardware wallet, maximum security)

2. **Limit Funds**
   - Keep minimum SOL needed in launch wallet
   - Transfer excess to platform wallet regularly
   - Monitor balance and set alerts

3. **Access Control**
   - Limit who can access environment variables
   - Use secrets management tools
   - Rotate keys periodically
   - Audit access logs

4. **Monitoring**
   - Monitor wallet for unexpected transactions
   - Set up alerts for large withdrawals
   - Track all token launches

5. **Backup Security**
   - Encrypt backups
   - Store in secure password manager
   - Never store in plain text files
   - Use hardware security modules (HSM) for production

## Testing Security

To verify your setup is secure:

1. **Check Build Output**
   ```bash
   npm run build
   # Search for your private key in .next/static - should NOT appear
   ```

2. **Check Browser**
   - Open browser DevTools → Console
   - Type: `process.env.LAUNCH_WALLET_PRIVATE_KEY`
   - Should be `undefined` (not exposed)

3. **Check Source Code**
   - View page source in browser
   - Search for your private key
   - Should NOT appear anywhere

## Emergency Response

If you suspect a breach:

1. **Immediate Actions:**
   - Transfer all funds to a new secure wallet
   - Generate new private key
   - Update all environment variables
   - Revoke old key

2. **Investigation:**
   - Check transaction history
   - Review access logs
   - Identify how it was compromised

3. **Prevention:**
   - Review security practices
   - Update procedures
   - Train team on security

## Questions?

If you're unsure about security:
- ✅ When in doubt, ask
- ✅ Test in development first
- ✅ Review code before deploying
- ✅ Use code reviews for security-critical changes

