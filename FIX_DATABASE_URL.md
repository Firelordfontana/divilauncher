# Fix Database Connection - Update DATABASE_URL

The server is hanging because the DATABASE_URL needs SSL parameters for Supabase.

## Quick Fix

**Update your `.env.local` file** - add `?sslmode=require` to your DATABASE_URL:

### Current (causing hang):
```env
DATABASE_URL=postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres
```

### Fixed (add SSL mode):
```env
DATABASE_URL=postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres?sslmode=require
```

### Also update DIRECT_URL:
```env
DIRECT_URL=postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres?sslmode=require
```

## Steps

1. **Open `.env.local`**
2. **Find `DATABASE_URL`** line
3. **Add `?sslmode=require`** at the end (before any existing `?` parameters)
4. **Do the same for `DIRECT_URL`** if it exists
5. **Save the file**
6. **Restart dev server**: `npm run dev`

## Why This Works

- Supabase requires SSL connections
- `sslmode=require` tells PostgreSQL to use SSL but accept self-signed certificates
- Without this, Prisma tries to connect and hangs waiting for SSL negotiation

## Test After Fix

Visit: `http://localhost:3001/api/test-db` (or 3000 if available)

Should return:
```json
{
  "status": "success",
  "message": "Database connection successful!",
  ...
}
```

