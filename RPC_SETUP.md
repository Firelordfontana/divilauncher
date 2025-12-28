# Setting Up a Free Solana RPC Endpoint

The default public Solana RPC endpoint has rate limits that cause 403 errors. For the balance to display correctly, you need to set up a free RPC endpoint.

## Quick Setup Options

### Option 1: Helius (Recommended - Easiest)

1. Go to https://www.helius.dev/
2. Sign up for a free account
3. Create a new API key
4. Copy your RPC endpoint URL (looks like: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`)
5. Create a `.env.local` file in your project root:
   ```env
   NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
   ```
6. Restart your dev server

### Option 2: QuickNode

1. Go to https://www.quicknode.com/
2. Sign up for a free account
3. Create a new endpoint (Solana Mainnet)
4. Copy your endpoint URL
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SOLANA_RPC_URL=https://your-endpoint.quiknode.pro/YOUR_KEY/
   ```
6. Restart your dev server

### Option 3: Triton

1. Go to https://triton.one/
2. Sign up for a free account
3. Get your RPC endpoint
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SOLANA_RPC_URL=https://your-endpoint.triton.one/
   ```
5. Restart your dev server

## Current Status

Without a custom RPC endpoint, the balance may show "Balance unavailable" due to rate limits on the public endpoint. The app will still function, but balance fetching may be unreliable.

## Note

The `.env.local` file should be in your `.gitignore` to keep your API keys secure. Never commit RPC endpoint URLs with API keys to version control.

