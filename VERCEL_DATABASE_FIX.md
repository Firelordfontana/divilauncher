# Fix Database Connection on Vercel

## Issue
Getting "Can't reach database server" error on Vercel production.

## Root Cause
The database connection is timing out or not configured correctly in Vercel.

## Solution

### 1. Verify DATABASE_URL in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Check that `DATABASE_URL` is set correctly:**
```
postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
```

**Important:**
- ❌ **DO NOT** include `?sslmode=require` - the code handles SSL automatically
- ✅ **Make sure** it's set for **Production** environment (and Preview/Development if needed)
- ✅ **Verify** the password is correct

### 2. Check Supabase Database Settings

1. Go to **Supabase Dashboard** → Your Project → Settings → Database
2. **Check connection pooling:**
   - Make sure "Connection Pooling" is enabled
   - Use the **direct connection** URL (not pooler) for Prisma
3. **Check IP restrictions:**
   - Make sure Vercel IPs are not blocked
   - Or disable IP restrictions temporarily to test

### 3. Verify Network Access

**Supabase allows connections from:**
- ✅ Anywhere (default)
- ❌ Specific IPs only (might block Vercel)

**To check:**
1. Supabase Dashboard → Settings → Database
2. Look for "Network Restrictions" or "IP Allowlist"
3. Make sure it's set to allow all connections

### 4. Test Connection

After updating, test:
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

### 5. Common Issues

**Issue: "Can't reach database server"**
- ✅ Check DATABASE_URL is set in Vercel
- ✅ Verify password is correct
- ✅ Check Supabase database is running
- ✅ Verify no IP restrictions

**Issue: "Connection timeout"**
- ✅ Connection timeout increased to 30 seconds
- ✅ Check Supabase database performance
- ✅ Verify network connectivity

**Issue: "SSL certificate error"**
- ✅ Code handles this automatically with `rejectUnauthorized: false`
- ✅ No need to add `sslmode=require` to connection string

### 6. Alternative: Use Supabase Connection Pooler

If direct connection doesn't work, try using Supabase's connection pooler:

**In Vercel, change DATABASE_URL to:**
```
postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:6543/postgres?pgbouncer=true
```

**Note:** Port `6543` is the pooler port, `5432` is direct connection.

### 7. Redeploy After Changes

After updating environment variables:
1. Go to **Vercel Dashboard → Deployments**
2. Click **three dots** (⋯) on latest deployment
3. Click **Redeploy**

Or push a new commit to trigger automatic redeploy.


