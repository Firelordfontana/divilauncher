# Cloud PostgreSQL Database Setup (Quick Guide)

## Recommended: Supabase (Free Tier)

Supabase offers a free PostgreSQL database that's perfect for this project.

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up (free)
4. Create a new project

### Step 2: Get Database URL

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 3: Add to Environment Variables

Add to your `.env.local` file:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password (shown when you create the project).

### Step 4: Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:migrate
```

### Step 5: Verify

```bash
# Open Prisma Studio to see your database
npm run db:studio
```

You should see your tables: `tokens`, `allocations`, `ownership_transfers`, `creator_profiles`

---

## Alternative: Neon (Also Free)

If you prefer Neon:

1. Go to https://neon.tech
2. Sign up (free)
3. Create a project
4. Copy the connection string
5. Add to `.env.local`
6. Run migrations

---

## That's It! 🎉

Once you've:
1. ✅ Created a Supabase/Neon account
2. ✅ Added `DATABASE_URL` to `.env.local`
3. ✅ Run `npm run db:migrate`

Your backend will be fully connected to the database!

---

## Testing

After setup, test the API:

```bash
# Start dev server
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/tokens
```

You should get: `{"tokens":[],"total":0,"limit":50,"offset":0}`

This means the database is connected and working! 🚀

