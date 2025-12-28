# DiviLauncher

A Solana token launchpad that allows users to create and launch tokens with customizable features, tax rates, and dividend distribution.

## Features

- 🚀 **Easy Token Launch**: Launch tokens on PumpFun with customizable features
- 💰 **Reward Distribution**: For PumpFun tokens, automatically distribute a percentage (0-100%) of creator funds as rewards to token holders based on wallet weight
- 🔥 **Token Burning**: Option to burn a percentage (0-100%) of creator funds by sending them to the Solana burn address
- ⚙️ **Customizable**: Full control over token name, ticker, description, image, and social links
- 📊 **Flexible Configuration**: 
  - Set reward distribution percentage (0-100% of creator funds) and/or burn percentage (0-100%)
- 🔗 **Social Integration**: Add Telegram, Twitter, Website, and Discord links
- 🎨 **Modern UI**: Beautiful, responsive web interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js, SPL Token, Metaplex
- **Wallet Integration**: Solana Wallet Adapter (Phantom, Solflare)
- **Storage**: IPFS (via Pinata) for metadata and images

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Solana wallet (Phantom, Solflare, etc.)
- (Optional) Pinata API keys for IPFS storage

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd DiviLauncher
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=your_platform_wallet_address
```
**Important**: Set `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS` to your Solana wallet address where the 2% platform fee will be sent.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Connect Wallet**: Click the wallet button in the header to connect your Solana wallet
2. **Fill Token Details**: 
   - Enter token name and ticker
   - Add description and upload an image
   - Add social media links (optional)
3. **Configure Rewards/Burns**: 
   - Set reward distribution percentage (0-100%) and/or burn percentage (0-100%) of creator funds
4. **Set Reward Token**: Enter the Solana token address to convert funds into (only needed if rewards > 0%)
5. **Launch**: Click "Launch Token" and approve the transaction in your wallet

## Important Notes

### Reward and Dividend Distribution

**Token Launch & Reward System:**
- All tokens are launched via PumpFun
- PumpFun provides creator funds when tokens are launched (typically in SOL)
- You can configure:
  - **Reward Distribution** (0-98%): Percentage of creator funds to distribute to token holders
  - **Token Burning** (0-98%): Percentage of creator funds used to buy back your token, then sent to Solana burn address (reduces supply)
  - **Platform Fee**: 2% of all creator funds automatically sent to platform wallet (deducted first)
  - Total allocation (rewards + burns) cannot exceed 98% (2% platform fee is deducted automatically)
  - Remaining funds stay with the creator
- **Token Conversion**: For reward distribution, incoming creator funds are automatically converted/swapped into the reward token you select (using Jupiter Aggregator)
- **Share-Based Distribution**: Rewards are distributed based on shares, not wallet weight:
  - Each 500,000 tokens = 1 share
  - Maximum 50 shares per wallet (prevents large holders from dominating)
  - Example: 2.5M tokens = 5 shares, 30M tokens = 50 shares (capped)

### ⚠️ Important: Automatic Conversion Requires a Solana Program

**The current frontend only collects configuration** - it does NOT automatically convert funds. The conversion happens when:

1. **You deploy a Solana Program** that:
   - Monitors incoming creator funds from PumpFun
   - Reads the reward token address from token metadata (that you configure here)
   - Automatically swaps SOL → Reward Token using Jupiter when funds arrive
   - Distributes rewards to holders based on shares (500k tokens = 1 share, max 50 shares per wallet)
   - Sends burn percentage to Solana burn address: `11111111111111111111111111111111`

2. **The program is triggered** when creator funds arrive (via program instructions or monitoring service)

### Architecture: Program Wallet Launch

**Since PumpFun doesn't support custom treasury addresses, the program wallet launches all tokens** to enable fully automatic processing:

- ✅ **User configures**: User connects wallet and fills out token details
- ✅ **Program launches**: Program wallet actually launches token on PumpFun
- ✅ **Automatic processing**: Program wallet receives creator funds and processes automatically
- ✅ **No user signatures needed**: After launch, rewards are distributed automatically

See `PROGRAM_ARCHITECTURE.md` for detailed implementation guide.

**What the frontend does:**
- ✅ Collects reward token address and configuration
- ✅ Stores configuration in token metadata
- ✅ Provides UI for setup

**What the frontend does NOT do:**
- ❌ Automatically convert funds (requires Solana program)
- ❌ Monitor incoming funds (requires Solana program)
- ❌ Distribute rewards (requires Solana program)

See `ARCHITECTURE.md` for detailed information about how the conversion system should work.

### PumpFun Integration

The PumpFun integration uses a placeholder API endpoint. You'll need to:
- Research PumpFun's actual API endpoints
- Update the `launchViaPumpFun` function in `utils/tokenLauncher.ts`
- Or use PumpFun's SDK if available

### Image Upload

The current implementation uses Pinata for IPFS storage. You can:
- Sign up for a free Pinata account at [pinata.cloud](https://pinata.cloud)
- Get your API keys and add them to `.env.local`
- Or replace with another IPFS service (NFT.Storage, Arweave, etc.)

### Network Configuration

By default, the app connects to Solana mainnet. For testing:
- Change `RPC_ENDPOINT` in `utils/tokenLauncher.ts` to `'https://api.devnet.solana.com'`
- Change `network` in `components/WalletProvider.tsx` to `WalletAdapterNetwork.Devnet`

## Project Structure

```
DiviLauncher/
├── app/
│   ├── layout.tsx          # Root layout with wallet provider
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles
├── components/
│   ├── WalletProvider.tsx   # Solana wallet provider setup
│   └── TokenLaunchForm.tsx  # Token creation form
├── utils/
│   └── tokenLauncher.ts     # Token creation and launch logic
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Security Considerations

- Always verify token addresses before investing
- Do your own research (DYOR) on any tokens
- Be cautious of scams and rug pulls
- The tax and dividend features require a trusted Solana program
- Never share your private keys or seed phrases

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. Always do your own research before investing in any cryptocurrency or token.

