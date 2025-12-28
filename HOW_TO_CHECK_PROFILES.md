# How to Check Profiles in the Database

## Method 1: Prisma Studio (Visual GUI) - Easiest

1. **Open a terminal** in your project directory
2. **Run Prisma Studio**:
   ```bash
   npm run db:studio
   ```
   Or directly:
   ```bash
   npx prisma studio
   ```

3. **Prisma Studio will open** in your browser (usually at `http://localhost:5555`)
4. **Click on "Profile"** in the left sidebar
5. **View all profiles** - you can see, edit, and delete profiles here

## Method 2: API Endpoint (via Browser/curl)

### Check a specific profile by wallet address:

**In browser:**
```
http://localhost:3000/api/profiles/YOUR_WALLET_ADDRESS
```

**Example:**
```
http://localhost:3000/api/profiles/EYztxemddPNrAtur4yqEZtcWu2TQVxM9zd3taU5GNMgy
```

**Using curl:**
```bash
curl http://localhost:3000/api/profiles/YOUR_WALLET_ADDRESS
```

### Response:
- **If found**: Returns profile data
- **If not found**: Returns `{"error": "Profile not found"}`

## Method 3: Check Profile Count

**Visit:**
```
http://localhost:3000/api/test-db
```

This shows:
- Total number of profiles in database
- Total number of tokens
- Database connection status

**Example response:**
```json
{
  "status": "success",
  "message": "Database connection successful!",
  "databaseTime": "2025-12-28T...",
  "databaseName": "postgres",
  "tokenCount": 0,
  "profileCount": 2
}
```

## Method 4: Direct Database Query (Advanced)

If you have direct database access:

```sql
-- View all profiles
SELECT * FROM "Profile";

-- Count profiles
SELECT COUNT(*) FROM "Profile";

-- Find profile by wallet address
SELECT * FROM "Profile" WHERE "walletAddress" = 'YOUR_WALLET_ADDRESS';
```

## Quick Test

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open Prisma Studio** in another terminal:
   ```bash
   npm run db:studio
   ```

3. **View profiles** in the Prisma Studio interface

## Profile Fields

Each profile has:
- `id` - Unique ID
- `walletAddress` - Solana wallet address (unique)
- `username` - Optional username
- `bio` - Optional bio
- `avatarUrl` - Optional profile image URL
- `website` - Optional website
- `twitter` - Optional Twitter handle
- `telegram` - Optional Telegram link
- `discord` - Optional Discord link
- `createdAt` - When profile was created
- `updatedAt` - When profile was last updated


