# Database Connection Fix

## Issue
Getting 500 errors on `/api/tokens` and profiles not saving due to database connection issues.

## Root Cause
SSL certificate error: "self-signed certificate in certificate chain"

## Solution Applied

1. ✅ **Created Prisma schema** with Token, Profile, Allocation, and OwnershipTransfer models
2. ✅ **Generated Prisma Client** 
3. ✅ **Created database tables** (ran `prisma db push`)
4. ✅ **Created API routes**:
   - `/api/tokens` - GET and POST
   - `/api/profiles/[walletAddress]` - GET and PUT
   - `/api/test-db` - Database connection test
5. ✅ **Fixed SSL configuration** - Set `sslmode=require` and `rejectUnauthorized: false` for Supabase

## Test the Fix

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Test database connection**:
   Visit: `http://localhost:3000/api/test-db`
   
   Should return:
   ```json
   {
     "status": "success",
     "message": "Database connection successful!",
     "databaseTime": "...",
     "databaseName": "postgres",
     "tokenCount": 0,
     "profileCount": 0
   }
   ```

3. **Test tokens endpoint**:
   Visit: `http://localhost:3000/api/tokens`
   
   Should return:
   ```json
   {
     "tokens": [],
     "total": 0,
     "limit": 50,
     "offset": 0
   }
   ```

## If Still Getting Errors

### Check Your DATABASE_URL

Make sure it's set correctly in `.env.local`:
```env
DATABASE_URL=postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
```

### SSL Certificate (Optional)

If you want to use Supabase's SSL certificate:

1. Download the certificate from Supabase dashboard
2. Convert to base64: `node scripts/convert-ssl-cert.js path/to/cert.pem`
3. Add to `.env.local`:
   ```env
   SUPABASE_SSL_CERT=base64_encoded_cert_here
   ```

### Connection String Format

Your connection string should include SSL:
```
postgresql://postgres:PASSWORD@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres?sslmode=require
```

The code automatically adds `sslmode=require` if not present.

## Next Steps

1. ✅ Database schema created
2. ✅ API routes created
3. ✅ SSL configured
4. ⏳ Test the endpoints
5. ⏳ Verify profiles can be saved


