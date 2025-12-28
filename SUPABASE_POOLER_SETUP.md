# Supabase Connection Pooling Setup

Connection pooling is **recommended for serverless environments** like Vercel. It helps manage database connections more efficiently and prevents connection limit issues.

## Setup Instructions

### 1. Get Your Connection Strings from Supabase

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Database**
2. Scroll to **Connection Pooling** section
3. You'll see two connection strings:

#### Connection Pooler (for queries - use this for DATABASE_URL)
```
postgresql://postgres.vsgzyzxvijmetsxiqayh:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Direct Connection (for migrations - use this for DIRECT_URL)
```
postgresql://postgres:[YOUR-PASSWORD]@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
```

### 2. Update Environment Variables

#### In `.env.local` (for local development):
```env
# Connection Pooler (for queries)
DATABASE_URL="postgresql://postgres.vsgzyzxvijmetsxiqayh:Jewmuff-7766@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres"
```

#### In Vercel (Production):
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add/Update:
   - **`DATABASE_URL`** = `postgresql://postgres.vsgzyzxvijmetsxiqayh:Jewmuff-7766@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **`DIRECT_URL`** = `postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres`
3. Make sure both are set for **Production**, **Preview**, and **Development**
4. **Redeploy** after adding

### 3. How It Works

- **`DATABASE_URL`** (Pooler): Used for all queries in your application. This goes through PgBouncer which manages connections efficiently for serverless.
- **`DIRECT_URL`**: Used only for migrations (`prisma migrate`, `prisma db push`). Migrations need a direct connection.

### 4. Benefits of Connection Pooling

✅ **Better for Serverless**: Handles connection limits better  
✅ **Faster**: Reuses connections efficiently  
✅ **More Reliable**: Reduces connection errors  
✅ **Scalable**: Works better with high traffic  

### 5. Important Notes

- **Migrations**: Always use `DIRECT_URL` (Prisma handles this automatically)
- **Queries**: Always use `DATABASE_URL` (pooler) - this is what your app uses
- **SSL**: Pooler connections handle SSL automatically
- **Port**: Pooler uses port `6543`, direct uses port `5432`

### 6. Testing

After updating environment variables:

1. **Test locally:**
   ```bash
   # Test connection
   npm run db:studio
   ```

2. **Test on Vercel:**
   - Visit: `https://divilauncher.com/api/test-token`
   - Should create a test token successfully

### 7. Troubleshooting

**Error: "Can't reach database server"**
- Check that `DATABASE_URL` uses the pooler URL (port 6543)
- Verify password is correct
- Make sure `DIRECT_URL` is also set (for migrations)

**Error: "Migration failed"**
- Check that `DIRECT_URL` is set correctly
- Direct URL should use port 5432 (not 6543)

**Connection limit errors**
- This is why we use pooling! Make sure you're using the pooler URL for `DATABASE_URL`

