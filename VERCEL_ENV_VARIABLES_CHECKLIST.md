# Vercel Environment Variables Checklist

## Current Variables (You Already Have)

✅ `NEXT_PUBLIC_SOLANA_RPC_URL` - Your Solana RPC endpoint
✅ `DATABASE_URL` - Your PostgreSQL database connection string

## Required Variables to Add

### 1. Supabase Variables (for Supabase client)

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://vsgzyzxvijmetsxiqayh.supabase.co`
- **Environment**: All (Production, Preview, Development)
- **Sensitive**: No (URL is public)

- **Key**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- **Value**: `sb_publishable_2vQM7yzUWSOSBdfSFp5okg_-A2i24P_`
- **Environment**: All (Production, Preview, Development)
- **Sensitive**: No (publishable key is meant to be public)

### 2. Database Variables (if using connection pooling)

- **Key**: `DIRECT_URL`
- **Value**: `postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres`
- **Environment**: All (Production, Preview, Development)
- **Sensitive**: Automatically protected (no `NEXT_PUBLIC_` prefix = server-side only)

### 3. Platform Wallet (for receiving fees)

- **Key**: `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS`
- **Value**: `EYztxemddPNrAtur4yqEZtcWu2TQVxM9zd3taU5GNMgy`
- **Environment**: All (Production, Preview, Development)
- **Sensitive**: No (address is public)

### 4. Launch Wallet (for token launches) ⚠️ CRITICAL

- **Key**: `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS`
- **Value**: `YourLaunchWalletAddressHere` (replace with actual address)
- **Environment**: All (Production, Preview, Development)
- **Sensitive**: No (address is public)

- **Key**: `LAUNCH_WALLET_PRIVATE_KEY` ⚠️ **NO NEXT_PUBLIC_ prefix!**
- **Value**: `YourPrivateKeyBase58Here` (replace with actual private key)
- **Environment**: All (Production, Preview, Development)
- **Sensitive**: Automatically protected ✅ (no `NEXT_PUBLIC_` = server-side only, masked in dashboard)

### 5. IPFS Storage (Pinata) - Optional

- **Key**: `NEXT_PUBLIC_PINATA_API_KEY`
- **Value**: Your Pinata JWT token
- **Environment**: All (Production, Preview, Development)
- **Sensitive**: No (API key is meant to be used client-side)

## Complete List to Add in Vercel

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Select your project
   - Settings → Environment Variables

2. **Add Each Variable** (click "Add New" for each):

#### Supabase (2 variables)
```
NEXT_PUBLIC_SUPABASE_URL = https://vsgzyzxvijmetsxiqayh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY = sb_publishable_2vQM7yzUWSOSBdfSFp5okg_-A2i24P_
```

#### Database (1 variable)
```
DIRECT_URL = postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
```
- ✅ Automatically protected (no `NEXT_PUBLIC_` prefix)

#### Platform Wallet (1 variable)
```
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS = EYztxemddPNrAtur4yqEZtcWu2TQVxM9zd3taU5GNMgy
```

#### Launch Wallet (2 variables) ⚠️
```
NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS = YourLaunchWalletAddressHere
LAUNCH_WALLET_PRIVATE_KEY = YourPrivateKeyBase58Here
```
- ✅ `LAUNCH_WALLET_PRIVATE_KEY` is automatically protected (no `NEXT_PUBLIC_` prefix)
- ⚠️ **NO** `NEXT_PUBLIC_` prefix on the private key!

#### Pinata (1 variable - Optional)
```
NEXT_PUBLIC_PINATA_API_KEY = YourPinataJWTTokenHere
```

## Final Vercel Environment Variables List

After adding everything, you should have:

1. ✅ `NEXT_PUBLIC_SOLANA_RPC_URL` (already have)
2. ✅ `DATABASE_URL` (already have)
3. ➕ `NEXT_PUBLIC_SUPABASE_URL` (add)
4. ➕ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (add)
5. ➕ `DIRECT_URL` (add, mark sensitive)
6. ➕ `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS` (add)
7. ➕ `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS` (add)
8. ➕ `LAUNCH_WALLET_PRIVATE_KEY` (add, mark sensitive, NO NEXT_PUBLIC_)
9. ➕ `NEXT_PUBLIC_PINATA_API_KEY` (add, optional)

## Quick Copy-Paste for Vercel

### Variables to Add (in order):

```
NEXT_PUBLIC_SUPABASE_URL
https://vsgzyzxvijmetsxiqayh.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
sb_publishable_2vQM7yzUWSOSBdfSFp5okg_-A2i24P_

DIRECT_URL
postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
[Mark as Sensitive]

NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS
EYztxemddPNrAtur4yqEZtcWu2TQVxM9zd3taU5GNMgy

NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS
[Your launch wallet address - get from your .env.local]

LAUNCH_WALLET_PRIVATE_KEY
[Your private key - get from your .env.local]
[Mark as Sensitive - NO NEXT_PUBLIC_ prefix!]

NEXT_PUBLIC_PINATA_API_KEY
[Your Pinata JWT token - get from your .env.local]
```

## After Adding Variables

1. **Redeploy** your project (required for new env vars to take effect)
2. **Test** using the security test endpoint: `/api/test-wallet-security`
3. **Verify** in browser DevTools that private key returns `undefined`

## Important Notes

- ⚠️ `LAUNCH_WALLET_PRIVATE_KEY` must **NOT** have `NEXT_PUBLIC_` prefix
- ✅ Variables without `NEXT_PUBLIC_` are automatically protected:
  - Masked in Vercel dashboard (show as `••••••••`)
  - Hidden in build logs
  - Server-side only (not exposed to browser)
- ✅ Select **All environments** (Production, Preview, Development) for each variable
- ✅ **Redeploy** after adding variables
- ✅ After adding, verify the private key shows as masked (`••••••••`) in dashboard

