# Vercel Deployment Steps

## ✅ What Changed

1. **Fixed Prisma SSL configuration** (`lib/prisma.ts`)
   - Added PrismaPg adapter (required for Prisma 7)
   - Configured SSL to accept Supabase's self-signed certificates
   - Automatically handles SSL without needing `sslmode` in connection string

## 📋 Pre-Deployment Checklist

### 1. Update DATABASE_URL in Vercel (IMPORTANT!)

**Check your current `DATABASE_URL` in Vercel:**

- ❌ **Remove** `?sslmode=require` if it exists
- ✅ **Keep** just the connection string: `postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres`

The code now handles SSL automatically, so you don't need `sslmode` in the connection string.

### 2. Add Missing Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Required variables to add** (if not already present):

```
NEXT_PUBLIC_SUPABASE_URL
https://vsgzyzxvijmetsxiqayh.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
sb_publishable_2vQM7yzUWSOSBdfSFp5okg_-A2i24P_

DIRECT_URL
postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
[No NEXT_PUBLIC_ prefix = automatically protected]

NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS
EYztxemddPNrAtur4yqEZtcWu2TQVxM9zd3taU5GNMgy

NEXT_PUBLIC_LAUNCH_WALLET_ADDRESS
[Your launch wallet address from .env.local]

LAUNCH_WALLET_PRIVATE_KEY
[Your private key from .env.local]
[NO NEXT_PUBLIC_ prefix = automatically protected]

NEXT_PUBLIC_PINATA_API_KEY
[Your Pinata JWT token from .env.local]
```

### 3. Commit and Push Code

```bash
git add lib/prisma.ts
git commit -m "Fix Prisma SSL configuration for Supabase"
git push
```

Vercel will automatically deploy when you push.

### 4. Manual Redeploy (Optional)

If you want to redeploy immediately without pushing:

1. Go to **Vercel Dashboard → Your Project → Deployments**
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**

## ✅ After Deployment

1. **Test database connection**: Visit `https://your-app.vercel.app/api/test-db`
   - Should return: `{"status":"success",...}`

2. **Test tokens endpoint**: Visit `https://your-app.vercel.app/api/tokens`
   - Should return: `{"tokens":[],"total":0,...}`

3. **Verify environment variables**:
   - Check that `LAUNCH_WALLET_PRIVATE_KEY` shows as masked (`••••••••`) in Vercel dashboard
   - Verify `DATABASE_URL` doesn't have `?sslmode=require`

## 🔍 Troubleshooting

**If database connection fails after deployment:**

1. Check `DATABASE_URL` in Vercel - remove `?sslmode=require` if present
2. Verify all environment variables are set
3. Check deployment logs for errors
4. Test the `/api/test-db` endpoint

**If you see "PrismaClientConstructorValidationError":**

- Make sure you pushed the updated `lib/prisma.ts` file
- The adapter should be included in the deployment


