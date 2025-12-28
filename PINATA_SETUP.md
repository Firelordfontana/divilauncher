# Pinata API Key Setup Guide

Pinata is used to upload token images and metadata to IPFS (InterPlanetary File System) for decentralized storage.

## Step 1: Create a Pinata Account

1. Go to [Pinata.cloud](https://pinata.cloud)
2. Click **"Sign Up"** or **"Get Started"**
3. Create an account (you can use email or connect with GitHub/Google)

## Step 2: Get Your API Keys

1. **Log in** to your Pinata account
2. Click on your **profile icon** (top right corner)
3. Select **"API Keys"** from the dropdown menu
4. Click **"New Key"** button
5. Configure your API key:
   - **Key Name**: Give it a name (e.g., "DiviLauncher")
   - **Admin**: Check this box if you want full access (recommended for development)
   - **Pin File To IPFS**: ✅ Check this (required)
   - **Pin JSON To IPFS**: ✅ Check this (required)
   - **Unpin**: ✅ Check this (optional, allows you to remove files)
   - **Pin Jobs**: ✅ Check this (optional, for monitoring)
6. Click **"Create Key"**
7. **IMPORTANT**: Copy the API Key immediately:
   - **API Key** (JWT) - This is your `NEXT_PUBLIC_PINATA_API_KEY`
   - **API Secret** (JWT) - You DON'T need this for API calls (it's used internally by Pinata)

⚠️ **Note**: 
- You only need the **API Key (JWT)** for making API calls
- The API Secret is used internally by Pinata to sign tokens, but you don't use it in your code
- The API Key is only shown **once** when you create the key, so copy it immediately

## Step 3: Add Keys to .env.local

Add these lines to your `.env.local` file:

```env
# IPFS Storage (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=your_jwt_token_here
```

Replace `your_jwt_token_here` with the JWT token (API Key) you copied from Pinata.

**Note**: You only need the API Key (JWT token), not the secret. The secret is used internally by Pinata.

## Step 4: Verify Setup

After adding the keys, restart your development server:

```bash
npm run dev
```

## Free Tier Limits

Pinata's free tier includes:
- ✅ **1 GB** of storage
- ✅ **100 files** per month
- ✅ Perfect for development and small projects

For production with higher traffic, consider upgrading to a paid plan.

## Alternative: Skip Pinata (Optional)

If you don't want to use Pinata right now, you can:
- Leave the keys empty (the app will still work, but image uploads won't function)
- Use a different IPFS service (NFT.Storage, Web3.Storage, etc.)
- Store images on a traditional server (less decentralized)

## Troubleshooting

**Error: "Invalid API key"**
- Make sure you copied the full key (they're long JWT tokens)
- Check for extra spaces or line breaks
- Verify the keys in your Pinata dashboard

**Error: "Rate limit exceeded"**
- You've hit the free tier limit
- Wait for the limit to reset or upgrade your plan

**Images not uploading**
- Check that the API key is set correctly
- Verify the key has "Pin File To IPFS" permission enabled
- Make sure you copied the full JWT token (they're long)
- Check your Pinata dashboard for upload errors

