# What is the Pinata JWT Token?

The JWT token is a long string that Pinata gives you when you create an API key. It looks something like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZjE5YzE4ZC1iYjY0LTRjYzUtODU3ZC1hYzQ4YjY5YzE4ZDIiLCJlbWFpbCI6InlvdXJAZW1haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZX0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlS2V5Iiwic2NvcGVLZXlzIjpbImFkbWluIl0sInNjb3BlS2V5Um9sZSI6ImFkbWluIiwiaWF0IjoxNzA5ODc2NTQzLCJleHAiOjE3MTA0ODEzNDN9.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## How to Get Your JWT Token:

1. **Go to Pinata Dashboard**: https://pinata.cloud
2. **Log in** to your account
3. **Click your profile icon** (top right)
4. **Select "API Keys"**
5. **Click "New Key"** button
6. **Configure the key**:
   - Name: "DiviLauncher" (or any name)
   - Check "Admin" checkbox
   - Check "Pin File To IPFS"
   - Check "Pin JSON To IPFS"
7. **Click "Create Key"**
8. **Copy the JWT token** - It will be shown in a box labeled "JWT" or "API Key"
   - It's a very long string (usually 200+ characters)
   - It starts with `eyJ` and has multiple parts separated by dots (`.`)

## Example .env.local Entry:

```env
NEXT_PUBLIC_PINATA_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZjE5YzE4ZC1iYjY0LTRjYzUtODU3ZC1hYzQ4YjY5YzE4ZDIiLCJlbWFpbCI6InlvdXJAZW1haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZX0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlS2V5Iiwic2NvcGVLZXlzIjpbImFkbWluIl0sInNjb3BlS2V5Um9sZSI6ImFkbWluIiwiaWF0IjoxNzA5ODc2NTQzLCJleHAiOjE3MTA0ODEzNDN9.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## Important Notes:

- ✅ The JWT token is **one long string** (no spaces, no line breaks)
- ✅ It has **three parts** separated by dots (`.`)
- ✅ It's usually **200-500 characters** long
- ✅ Copy the **entire token** from Pinata
- ⚠️ **Don't share it publicly** - it's like a password
- ⚠️ **Copy it immediately** - Pinata only shows it once when you create the key

## What It Looks Like in Pinata Dashboard:

When you create a new API key, Pinata will show you something like:

```
┌─────────────────────────────────────────┐
│  JWT Token                              │
│  ─────────────────────────────────────  │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│  [Copy] button                          │
└─────────────────────────────────────────┘
```

Click the **"Copy"** button to copy the entire token, then paste it into your `.env.local` file.


