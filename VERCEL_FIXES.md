# Common Vercel Deployment Errors & Fixes

## Most Common Issues

### 1. Missing Environment Variables

**Error:** `Environment variable DATABASE_URL is missing`

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `DATABASE_URL` = `postgresql://postgres:Jewmuff-7766@db.vsgzyzxvijmetsxiqayh.supabase.co:5432/postgres`
   - `NEXT_PUBLIC_SOLANA_RPC_URL` = `https://mainnet.helius-rpc.com/?api-key=c89898a1-ec90-4bea-9647-e58a35d32541`
3. Make sure to select "Production", "Preview", and "Development" for each variable
4. Redeploy

---

### 2. Prisma Generate Fails

**Error:** `Prisma schema validation error` or `Failed to generate Prisma Client`

**Possible causes:**
- Missing `prisma.config.ts` file
- DATABASE_URL not set during build
- Prisma version mismatch

**Fix:**
- Make sure `prisma.config.ts` is committed to GitHub
- Ensure `DATABASE_URL` is set in Vercel environment variables
- The build script already includes `prisma generate` (in package.json)

---

### 3. Build Script Issues

**Error:** `Command "build" exited with 1`

**Check:**
- Your `package.json` has: `"build": "prisma generate && next build"`
- All dependencies are in `dependencies` (not just `devDependencies`)

---

### 4. TypeScript Errors

**Error:** `Type error: ...`

**Fix:**
- Run `npm run build` locally first to catch TypeScript errors
- Fix any type errors before deploying

---

### 5. Missing Files

**Error:** `Cannot find module` or `File not found`

**Check:**
- All necessary files are committed to GitHub
- `.gitignore` isn't excluding important files
- `prisma/schema.prisma` exists
- `prisma.config.ts` exists

---

## Quick Checklist

Before deploying, make sure:

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] `NEXT_PUBLIC_SOLANA_RPC_URL` is set in Vercel environment variables
- [ ] All files are committed to GitHub
- [ ] `npm run build` works locally
- [ ] `prisma.config.ts` is in the repository
- [ ] `prisma/schema.prisma` is in the repository

---

## How to Share the Error

Please copy the **full error message** from the Vercel build logs, especially:
- The red error text
- Any stack traces
- The command that failed

This will help me provide a specific fix!

