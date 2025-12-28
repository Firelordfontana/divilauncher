# API Testing Guide

This guide shows you how to test all the DiviLauncher API endpoints.

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000/api`

2. **Get a test wallet address:**
   - Connect your wallet in the app
   - Copy your wallet address (you'll need it for testing)

## Testing Methods

### Method 1: Using Browser (GET requests only)

Open these URLs in your browser:
- `http://localhost:3000/api/tokens`
- `http://localhost:3000/api/tokens?owner=YOUR_WALLET_ADDRESS`
- `http://localhost:3000/api/balance?address=YOUR_WALLET_ADDRESS`

### Method 2: Using cURL (Command Line)

### Method 3: Using Postman/Insomnia

Import the examples below into your API testing tool.

---

## API Endpoints

### 1. GET /api/tokens - List All Tokens

**Request:**
```bash
curl http://localhost:3000/api/tokens
```

**With pagination:**
```bash
curl "http://localhost:3000/api/tokens?limit=10&offset=0"
```

**Filter by owner:**
```bash
curl "http://localhost:3000/api/tokens?owner=YOUR_WALLET_ADDRESS"
```

**Expected Response:**
```json
{
  "tokens": [
    {
      "tokenAddress": "...",
      "name": "My Token",
      "ticker": "MTK",
      "description": "...",
      "creatorWallet": "...",
      "currentOwnerWallet": "...",
      "platformFeePercent": 2,
      "rewardDistributionPercent": 50,
      "burnPercent": 20,
      "burnToken": "...",
      "rewardToken": "...",
      ...
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### 2. POST /api/tokens - Create New Token

**Request:**
```bash
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "tokenAddress": "So11111111111111111111111111111111111111112",
    "name": "Test Token",
    "ticker": "TEST",
    "description": "A test token",
    "imageUrl": "https://example.com/image.png",
    "bannerUrl": "https://example.com/banner.png",
    "creatorWallet": "YOUR_WALLET_ADDRESS",
    "currentOwnerWallet": "YOUR_WALLET_ADDRESS",
    "platformFeePercent": 2,
    "rewardDistributionPercent": 50,
    "burnPercent": 20,
    "burnToken": "",
    "rewardToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "initialBuyAmount": 0.1,
    "socialLinks": {
      "twitter": "https://twitter.com/test",
      "telegram": "https://t.me/test",
      "website": "https://example.com",
      "discord": "https://discord.gg/test"
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "token": {
    "tokenAddress": "So11111111111111111111111111111111111111112",
    "name": "Test Token",
    "ticker": "TEST",
    ...
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required fields"
}
```

---

### 3. GET /api/tokens/[tokenAddress] - Get Single Token

**Request:**
```bash
curl http://localhost:3000/api/tokens/So11111111111111111111111111111111111111112
```

**Expected Response (200 OK):**
```json
{
  "token": {
    "tokenAddress": "So11111111111111111111111111111111111111112",
    "name": "Test Token",
    ...
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Token not found"
}
```

---

### 4. PUT /api/tokens/[tokenAddress] - Update Token

**Request:**
```bash
curl -X PUT http://localhost:3000/api/tokens/So11111111111111111111111111111111111111112 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "imageUrl": "https://example.com/new-image.png"
  }'
```

**Expected Response (200 OK):**
```json
{
  "token": {
    ...
  }
}
```

---

### 5. PUT /api/tokens/[tokenAddress]/allocations - Update Allocations

**Request:**
```bash
curl -X PUT http://localhost:3000/api/tokens/So11111111111111111111111111111111111111112/allocations \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "platformFeePercent": 3,
    "rewardDistributionPercent": 60,
    "burnPercent": 25,
    "burnToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  }'
```

**Expected Response (200 OK):**
```json
{
  "token": {
    "platformFeePercent": 3,
    "rewardDistributionPercent": 60,
    "burnPercent": 25,
    "burnToken": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    ...
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Unauthorized: Only token owner can update allocations"
}
```

---

### 6. POST /api/tokens/[tokenAddress]/ownership - Transfer Ownership

**Request:**
```bash
curl -X POST http://localhost:3000/api/tokens/So11111111111111111111111111111111111111112/ownership \
  -H "Content-Type: application/json" \
  -d '{
    "fromWallet": "YOUR_WALLET_ADDRESS",
    "toWallet": "NEW_OWNER_WALLET_ADDRESS",
    "fee": 0.1
  }'
```

**Expected Response (200 OK):**
```json
{
  "token": {
    "currentOwnerWallet": "NEW_OWNER_WALLET_ADDRESS",
    ...
  },
  "message": "Ownership transferred successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Unauthorized: Only token owner can transfer ownership"
}
```

---

### 7. GET /api/profiles/[walletAddress] - Get Profile

**Request:**
```bash
curl http://localhost:3000/api/profiles/YOUR_WALLET_ADDRESS
```

**Expected Response (200 OK):**
```json
{
  "profile": {
    "walletAddress": "...",
    "username": "MyUsername",
    "bio": "My bio",
    "profileImageUrl": "...",
    "bannerImageUrl": "...",
    "socialLinks": {},
    ...
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Profile not found"
}
```

---

### 8. PUT /api/profiles/[walletAddress] - Update Profile

**Request:**
```bash
curl -X PUT http://localhost:3000/api/profiles/YOUR_WALLET_ADDRESS \
  -H "Content-Type: application/json" \
  -d '{
    "username": "NewUsername",
    "bio": "Updated bio",
    "profileImageUrl": "https://example.com/profile.png",
    "bannerImageUrl": "https://example.com/banner.png",
    "socialLinks": {
      "twitter": "https://twitter.com/new"
    }
  }'
```

**Expected Response (200 OK):**
```json
{
  "profile": {
    "username": "NewUsername",
    ...
  }
}
```

---

### 9. GET /api/balance - Get SOL Balance

**Request:**
```bash
curl "http://localhost:3000/api/balance?address=YOUR_WALLET_ADDRESS"
```

**Expected Response (200 OK):**
```json
{
  "balance": 1.2345,
  "cached": false
}
```

**Cached Response:**
```json
{
  "balance": 1.2345,
  "cached": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Address parameter required"
}
```

---

## Testing with JavaScript/Fetch

You can also test APIs from the browser console:

```javascript
// GET all tokens
fetch('http://localhost:3000/api/tokens')
  .then(res => res.json())
  .then(data => console.log(data))

// Create a token
fetch('http://localhost:3000/api/tokens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenAddress: 'So11111111111111111111111111111111111111112',
    name: 'Test Token',
    ticker: 'TEST',
    description: 'A test token',
    creatorWallet: 'YOUR_WALLET_ADDRESS',
    platformFeePercent: 2,
    rewardDistributionPercent: 50,
    burnPercent: 20,
    rewardToken: '',
    initialBuyAmount: 0.05
  })
})
  .then(res => res.json())
  .then(data => console.log(data))

// Get balance
fetch('http://localhost:3000/api/balance?address=YOUR_WALLET_ADDRESS')
  .then(res => res.json())
  .then(data => console.log(data))
```

---

## Common Test Scenarios

### Scenario 1: Create and View Token
1. Create a token using POST /api/tokens
2. Get all tokens using GET /api/tokens
3. Get specific token using GET /api/tokens/[tokenAddress]

### Scenario 2: Update Allocations
1. Create a token (you must be the owner)
2. Update allocations using PUT /api/tokens/[tokenAddress]/allocations
3. Verify the update by getting the token again

### Scenario 3: Transfer Ownership
1. Create a token
2. Transfer ownership using POST /api/tokens/[tokenAddress]/ownership
3. Verify new owner by getting the token

### Scenario 4: Profile Management
1. Create/update profile using PUT /api/profiles/[walletAddress]
2. Get profile using GET /api/profiles/[walletAddress]

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors
- Make sure the dev server is running (`npm run dev`)
- Check that you're using `http://localhost:3000` (not `https://`)

### Issue: "Token not found"
- The token might not exist in localStorage yet
- Create a token first using POST /api/tokens
- Or create one through the UI at `/launch`

### Issue: "Unauthorized" errors
- Make sure you're using the correct wallet address
- The wallet address must match the token's `creatorWallet` or `currentOwnerWallet`

### Issue: Balance not showing
- Check that your RPC endpoint is configured in `.env.local`
- The endpoint might be rate-limited (check console for errors)

---

## Notes

- **Current Storage**: APIs use in-memory storage (server) and localStorage (client)
- **Data Persistence**: Data will be lost on server restart (in-memory) or browser clear (localStorage)
- **Production**: For production, you'll need to integrate with a database (see `API_IMPLEMENTATION_GUIDE.md`)

