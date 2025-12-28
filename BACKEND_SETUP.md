# Backend Setup Guide

This guide will help you set up the DiviLauncher backend with PostgreSQL and Prisma.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn

## Step 1: Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Step 2: Set Up Database

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
   ```sql
   CREATE DATABASE divilauncher;
   ```

### Option B: Cloud Database (Recommended - Easiest!)

Use a cloud provider like:
- **Supabase** (Free tier, recommended): https://supabase.com - See `CLOUD_DATABASE_SETUP.md` for quick setup
- **Neon** (Free tier available): https://neon.tech
- **Railway** (Free tier available): https://railway.app
- **Vercel Postgres**: https://vercel.com/storage/postgres

**Quick Setup:** See `CLOUD_DATABASE_SETUP.md` for step-by-step instructions (takes ~5 minutes)

## Step 3: Configure Environment Variables

1. Update your `.env.local` file with the database URL:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/divilauncher?schema=public"

# Solana RPC (already configured)
NEXT_PUBLIC_SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"

# Optional: JWT Secret for authentication
JWT_SECRET="your-secret-key-here"
```

**For Supabase:**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**For Neon:**
```env
DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/[dbname]?sslmode=require"
```

## Step 4: Run Database Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Or if you want to push schema without migrations (development only)
npm run db:push
```

## Step 5: Verify Setup

```bash
# Open Prisma Studio to view your database
npm run db:studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit your database.

## Step 6: Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## Database Schema

The database includes these tables:

- **tokens**: Token information (includes `burnToken` field)
- **allocations**: Allocation history for tokens
- **ownership_transfers**: Ownership transfer history
- **creator_profiles**: User profiles

## Migrating from localStorage

If you have existing data in localStorage, you can migrate it:

1. **Export your localStorage data** (use browser console on your site):
   ```javascript
   JSON.stringify({
     tokens: JSON.parse(localStorage.getItem('launchedTokens') || '[]'),
     profiles: JSON.parse(localStorage.getItem('creatorProfiles') || '[]')
   })
   ```

2. **Save the output** to a file (e.g., `localStorage-backup.json`)

3. **Create a migration script** (`scripts/migrate-run.ts`):
   ```typescript
   import { migrateFromLocalStorage } from './migrate-localStorage'
   import * as fs from 'fs'
   
   const data = JSON.parse(fs.readFileSync('./localStorage-backup.json', 'utf-8'))
   migrateFromLocalStorage(data)
   ```

4. **Run the migration**:
   ```bash
   npx tsx scripts/migrate-run.ts
   ```

## API Routes Now Use Database

All API routes have been updated to use Prisma:
- ✅ `GET /api/tokens` - Fetches from database
- ✅ `POST /api/tokens` - Saves to database
- ✅ `GET /api/tokens/[address]` - Fetches from database
- ✅ `PUT /api/tokens/[address]/allocations` - Updates in database
- ✅ `POST /api/tokens/[address]/ownership` - Updates in database
- ✅ `GET /api/profiles/[address]` - Fetches from database
- ✅ `PUT /api/profiles/[address]` - Saves to database

## Troubleshooting

### Error: "Can't reach database server"

- Check your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if local)
- Check firewall/network settings (if cloud)

### Error: "P1001: Can't reach database server"

- Verify database credentials
- Check database is accessible from your network
- For cloud databases, check IP whitelist settings

### Error: "P2002: Unique constraint failed"

- A token with that address already exists
- This is expected if you're re-running migrations

### Error: "PrismaClient is not configured"

- Run `npm run db:generate` to generate Prisma Client
- Make sure `DATABASE_URL` is set in `.env.local`

## Production Deployment

1. Set up a production PostgreSQL database
2. Update `DATABASE_URL` in production environment
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Generate Prisma Client:
   ```bash
   npm run db:generate
   ```

## Next Steps

- ✅ Database schema created
- ✅ Prisma Client configured
- ✅ API routes updated to use database
- ⏭️ Set up your database and run migrations
- ⏭️ Update frontend to use API routes (optional - can still use localStorage for now)
- ⏭️ Add authentication (see `WALLET_AUTHENTICATION.md`)
- ⏭️ Add rate limiting
- ⏭️ Set up monitoring and logging
