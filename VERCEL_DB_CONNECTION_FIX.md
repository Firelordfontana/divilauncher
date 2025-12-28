# Fix Database Connection on Vercel - URGENT

## The Problem
Vercel can't reach the Supabase database server. This is a network connectivity issue.

## Solution: Use Supabase Connection Pooler

Supabase provides a **connection pooler** that's designed for serverless environments like Vercel. It's more reliable than direct connections.

### Step 1: Get Your Pooler Connection String

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **Database**
3. Scroll to **Connection Pooling**
4. Copy the **Connection string** (it should look like this):
   ```
   postgresql://postgres:YOUR_PASSWORD@db.vsgzyzxvijmetsxiqayh.supabase.co:6543/postgres?pgbouncer=true
   ```
   
   **Note:** Port `6543` is the pooler port (not `5432`)

### Step 2: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. **Replace it** with the pooler connection string:
   ```
   postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:6543/postgres?pgbouncer=true
   ```
4. Make sure it's set for **Production** (and Preview/Development if needed)
5. Click **Save**

### Step 3: Verify Connection String Format

Your `DATABASE_URL` should be:
```
postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:6543/postgres?pgbouncer=true
```

**Key differences:**
- ✅ Port `6543` (pooler) instead of `5432` (direct)
- ✅ `?pgbouncer=true` parameter included
- ✅ Same password: `Jewmuff-7766`

### Step 4: Redeploy

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **three dots** (⋯) on latest deployment
3. Click **Redeploy**

Or push a commit to trigger automatic redeploy.

### Step 5: Test

After redeploy, test:
```
https://your-app.vercel.app/api/test-db
```

Should return:
```json
{
  "status": "success",
  "message": "Database connection successful!",
  "tokenCount": 0,
  "profileCount": 0
}
```

## Alternative: Check Supabase Network Settings

If pooler doesn't work:

1. **Supabase Dashboard** → **Settings** → **Database**
2. Check **Network Restrictions** or **IP Allowlist**
3. Make sure it's set to **Allow all connections** (not restricted to specific IPs)
4. Vercel uses dynamic IPs, so IP restrictions will block it

## Why Connection Pooler?

- ✅ **Designed for serverless** - Handles connection lifecycle better
- ✅ **More reliable** - Better connection management
- ✅ **Faster** - Reuses connections efficiently
- ✅ **Recommended by Supabase** for serverless environments

## Troubleshooting

**Still getting "Can't reach database server"?**

1. ✅ Verify DATABASE_URL in Vercel has port `6543` and `?pgbouncer=true`
2. ✅ Check Supabase dashboard - is database running?
3. ✅ Try the direct connection URL (port 5432) as fallback
4. ✅ Check Vercel deployment logs for more details
5. ✅ Verify password is correct in connection string

