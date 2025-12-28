# Vercel Security Setup Guide

This guide shows you how to securely configure your Launch Wallet private key in Vercel.

## Step 1: Add Environment Variables in Vercel

### Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and log in
2. Select your **DiviLauncher** project
3. Click on **Settings** (in the top navigation)
4. Click on **Environment Variables** (in the left sidebar)

### Add Launch Wallet Address (Public - Safe)

1. Click **Add New** button
2. Fill in:
   - **Key**: `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS`
   - **Value**: Your launch wallet's public address (e.g., `ABC123...`)
   - **Environment**: Select all (Production, Preview, Development)
3. Click **Save**

### Add Launch Wallet Private Key (SECRET - Critical!)

1. Click **Add New** button again
2. Fill in:
   - **Key**: `LAUNCH_WALLET_PRIVATE_KEY` ⚠️ **NO `NEXT_PUBLIC_` prefix!**
   - **Value**: Your private key in base58 format
   - **Environment**: Select all (Production, Preview, Development)
3. Click **Save**

**Note**: Vercel doesn't have a "Sensitive" checkbox, but variables without `NEXT_PUBLIC_` prefix are automatically:
- ✅ Masked in the dashboard (shown as `••••••••`)
- ✅ Hidden in build logs
- ✅ Not exposed to the client/browser

### Verify Your Setup

You should see:
- ✅ `NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS` - Visible (this is OK, it's public)
- ✅ `LAUNCH_WALLET_PRIVATE_KEY` - Shows as `••••••••` or masked (this is correct!)
- ✅ `LAUNCH_WALLET_PRIVATE_KEY` marked as "Sensitive" or has a lock icon

### ❌ What NOT to Do

- ❌ **NEVER** add `NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY` (with NEXT_PUBLIC_ prefix)
- ❌ **NEVER** leave the private key unmasked/visible
- ❌ **NEVER** share screenshots showing the private key value

## Step 2: How Vercel Protects Sensitive Variables

### Automatic Protection (No Checkbox Needed!)

Vercel **automatically protects** environment variables that don't have the `NEXT_PUBLIC_` prefix:

1. **Dashboard Masking**: 
   - Variables without `NEXT_PUBLIC_` are automatically masked
   - They show as `••••••••` in the Vercel dashboard
   - You can click "Reveal" to see them (but they're hidden by default)

2. **Build Log Protection**:
   - Non-`NEXT_PUBLIC_` variables are automatically hidden in build logs
   - They won't appear in deployment logs even if you log `process.env`

3. **Client-Side Protection**:
   - Only `NEXT_PUBLIC_*` variables are exposed to the browser
   - Variables without this prefix are server-side only

### How to Verify It's Protected

After adding `LAUNCH_WALLET_PRIVATE_KEY`:
1. It should show as `••••••••` in the Vercel dashboard
2. You'll need to click "Reveal" to see the actual value
3. This confirms it's being treated as sensitive

## Step 3: Redeploy After Adding Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

**Important**: Environment variables are only loaded during build/deployment, so you must redeploy after adding them.

## Step 4: Test That Private Key is NOT in Browser

### Method 1: Check Browser DevTools Console

1. **Deploy your app** to Vercel (or run locally with `npm run dev`)
2. **Open your deployed site** in a browser
3. **Open DevTools**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
4. Go to **Console** tab
5. Type these commands one by one:

```javascript
// Check if private key is exposed (should be undefined)
process.env.LAUNCH_WALLET_PRIVATE_KEY

// Check if NEXT_PUBLIC_ version exists (should be undefined)
process.env.NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY

// Check public address (this SHOULD work - it's safe to expose)
process.env.NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS
```

### Expected Results:

✅ **CORRECT** (Private key is secure):
```javascript
process.env.LAUNCH_WALLET_PRIVATE_KEY
// Returns: undefined ✅

process.env.NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY
// Returns: undefined ✅

process.env.NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS
// Returns: "YourWalletAddress..." ✅ (This is OK - address is public)
```

❌ **WRONG** (Private key is exposed - FIX IMMEDIATELY!):
```javascript
process.env.LAUNCH_WALLET_PRIVATE_KEY
// Returns: "YourPrivateKey..." ❌ SECURITY BREACH!

process.env.NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY
// Returns: "YourPrivateKey..." ❌ SECURITY BREACH!
```

### Method 2: Check Page Source

1. **Right-click** on your deployed page
2. Select **"View Page Source"** or **"View Source"**
3. Press `Ctrl+F` (or `Cmd+F` on Mac) to search
4. Search for:
   - Your private key (first few characters)
   - `LAUNCH_WALLET_PRIVATE_KEY`
   - `NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY`

**Expected Result**: Should find **NOTHING** ✅

**If you find it**: Your private key is exposed! Fix immediately.

### Method 3: Check Network Tab

1. Open **DevTools** → **Network** tab
2. Refresh the page (`F5`)
3. Look for JavaScript files (`.js` files)
4. Click on `_next/static/chunks/` files
5. Search for your private key in the response

**Expected Result**: Should find **NOTHING** ✅

### Method 4: Check Build Output (Local)

If testing locally:

```bash
# Build the project
npm run build

# Search for private key in build output
grep -r "LAUNCH_WALLET_PRIVATE_KEY" .next/static/ || echo "✅ Not found (secure)"

# Or on Windows PowerShell:
Select-String -Path ".next\static\**\*.js" -Pattern "LAUNCH_WALLET_PRIVATE_KEY" || Write-Host "✅ Not found (secure)"
```

**Expected Result**: Should find **NOTHING** ✅

## Step 5: Verify in Vercel Build Logs

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on a deployment
3. Click on **Build Logs** or **Function Logs**
4. Search for `LAUNCH_WALLET_PRIVATE_KEY`

**Expected Result**: 
- Should **NOT** show the actual private key value
- Should show as `••••••••` or be completely hidden
- If you see the actual key, it's exposed in logs (less critical but still a concern)

## Troubleshooting

### Private Key Shows in Browser

**If `process.env.LAUNCH_WALLET_PRIVATE_KEY` returns a value in browser:**

1. **IMMEDIATELY**:
   - Transfer all funds from the launch wallet
   - Generate a new wallet and private key
   - Update environment variables

2. **Check**:
   - Did you accidentally use `NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY`?
   - Is the private key imported in a client component?
   - Did you expose it in an API response?

3. **Fix**:
   - Remove `NEXT_PUBLIC_` prefix
   - Only use in API routes/server actions
   - Never return it in API responses

### Can't See "Sensitive" Option in Vercel

- Some Vercel plans may not have this feature
- The key is still secure if it's not prefixed with `NEXT_PUBLIC_`
- The value will be masked in the dashboard automatically

### Environment Variable Not Working

1. **Redeploy** after adding variables
2. Check the **variable name** matches exactly (case-sensitive)
3. Verify it's set for the correct **environment** (Production/Preview/Development)
4. Check **build logs** for errors

## Security Checklist

Before going to production:

- [ ] `LAUNCH_WALLET_PRIVATE_KEY` added to Vercel (without `NEXT_PUBLIC_`)
- [ ] Marked as "Sensitive" in Vercel
- [ ] Value is masked in Vercel dashboard
- [ ] Redeployed after adding variables
- [ ] Tested in browser DevTools - returns `undefined`
- [ ] Checked page source - private key not found
- [ ] Checked network tab - private key not in JS files
- [ ] Build logs don't show private key value
- [ ] Only minimum SOL in launch wallet
- [ ] Backup stored securely

## Quick Test Script

Create a test API route to verify security:

```typescript
// app/api/test-wallet-security/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // This should work (server-side)
  const hasPrivateKey = !!process.env.LAUNCH_WALLET_PRIVATE_KEY
  
  return NextResponse.json({
    hasPrivateKey: hasPrivateKey,
    address: process.env.NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS || 'Not set',
    // NEVER return the private key itself!
  })
}
```

Then test:
- ✅ API route should return `hasPrivateKey: true`
- ✅ Browser console should show `process.env.LAUNCH_WALLET_PRIVATE_KEY` as `undefined`

## Summary

✅ **Correct Setup:**
- `LAUNCH_WALLET_PRIVATE_KEY` in Vercel (no `NEXT_PUBLIC_`)
- Marked as "Sensitive"
- Returns `undefined` in browser
- Not found in page source

❌ **Incorrect Setup:**
- `NEXT_PUBLIC_LAUNCH_WALLET_PRIVATE_KEY` in Vercel
- Returns value in browser
- Found in page source
- Visible in build logs

Your private key is secure when it returns `undefined` in the browser! 🔒

