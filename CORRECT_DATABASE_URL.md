# Correct DATABASE_URL for Vercel

## ❌ Wrong (Direct Connection - Port 5432)
```
postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
```
**This doesn't work reliably on Vercel serverless**

## ✅ Correct (Connection Pooler - Port 6543)
```
postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:6543/postgres?pgbouncer=true
```
**This is what you need for Vercel**

## Steps to Fix

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Find `DATABASE_URL`**

3. **Update it to:**
   ```
   postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:6543/postgres?pgbouncer=true
   ```

4. **Key changes:**
   - Port changed from `5432` → `6543`
   - Added `?pgbouncer=true` at the end

5. **Make sure it's set for Production** (and Preview/Development if needed)

6. **Save** the changes

7. **Redeploy:**
   - Go to **Deployments**
   - Click **three dots** (⋯) on latest deployment
   - Click **Redeploy**

## Verify It's Correct

After updating, the connection string should:
- ✅ Use port `6543` (not `5432`)
- ✅ Include `?pgbouncer=true` parameter
- ✅ Have the correct password: `Jewmuff-7766`
- ✅ Have the correct host: `db.vsgzyzxvijmetsxiqayh.supabase.co`

## Test After Redeploy

Visit:
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

## Why Pooler Works Better

- ✅ **Designed for serverless** - Handles connection lifecycle
- ✅ **More reliable** - Better connection management
- ✅ **Faster** - Reuses connections efficiently
- ✅ **Recommended by Supabase** for Vercel/serverless


