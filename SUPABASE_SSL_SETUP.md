# Supabase SSL Certificate Setup

## If Supabase Requires SSL Certificate Verification

When "Force SSL" is enabled in Supabase, you have two options:

### Option 1: Use `sslmode=require` (Current Setup - Recommended for Serverless)

**This is what we're currently using.** It requires SSL but doesn't verify the certificate, which works perfectly for serverless environments like Vercel where you can't store certificate files.

**Connection string:**
```
postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require
```

**Code configuration:**
```typescript
ssl: {
  rejectUnauthorized: false
}
```

✅ **This should work** - The code is already configured this way.

---

### Option 2: Use Certificate File (If Supabase Requires It)

If Supabase specifically requires certificate verification:

1. **Download the certificate from Supabase:**
   - Go to Supabase Dashboard → Settings → Database
   - Download the SSL certificate file

2. **Convert to base64 for environment variable:**
   ```bash
   # On Mac/Linux
   base64 -i certificate.crt
   
   # On Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.crt"))
   ```

3. **Add to Vercel environment variables:**
   - `SUPABASE_SSL_CERT` = (the base64 encoded certificate)

4. **The code will automatically use it** if `SUPABASE_SSL_CERT` is set.

---

## Current Configuration

The code is currently set to use **Option 1** (`sslmode=require` with `rejectUnauthorized: false`), which should work with forced SSL enabled.

**If you're still getting connection errors:**
1. Make sure your `DATABASE_URL` in Vercel includes `?sslmode=require`
2. Check Supabase dashboard for any IP whitelist restrictions
3. Verify the connection string is correct

---

## Testing

Test the connection:
```bash
# Test locally
curl http://localhost:3000/api/test-db

# Test on Vercel (after deployment)
curl https://didilauncher.com/api/test-db
```

The test endpoint will show if the connection works.

