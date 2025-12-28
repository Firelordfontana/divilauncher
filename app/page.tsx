'use client'

import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 w-full">
          {/* Logo at far left */}
          <div className="flex-shrink-0">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary-500"
            >
              {/* Gold bar/stack representing dividends */}
              <rect x="10" y="20" width="40" height="8" fill="currentColor" rx="2" />
              <rect x="10" y="32" width="35" height="8" fill="currentColor" rx="2" opacity="0.8" />
              <rect x="10" y="44" width="30" height="8" fill="currentColor" rx="2" opacity="0.6" />
            </svg>
          </div>
          
          {/* Navigation and wallet button at far right */}
          <div className="flex-shrink-0 ml-auto">
            <Navigation />
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 -mt-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-2 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-300 bg-clip-text text-transparent">
              DiviLauncher
            </h1>
            <h2 className="text-3xl font-bold text-primary-300 mb-4">
              Sharing The Wealth Throughout Solana
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create and launch tokens on PumpFun with automatic dividend distribution, 
              customizable tax rates, and full control over your tokenomics.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 p-6">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Easy Launch</h3>
              <p className="text-gray-300">
                Launch your token on PumpFun with fully automatic reward processing. 
                Simple form, powerful results.
              </p>
            </div>
            <div className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 p-6">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Reward Distribution</h3>
              <p className="text-gray-300">
                Automatically distribute creator funds (0-100%) to token holders based on shares. 
                Fair and transparent dividend system.
              </p>
            </div>
            <div className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 p-6">
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Customizable</h3>
              <p className="text-gray-300">
                Full control over token name, image, social links, tax rates, and dividend allocation. 
                Make it yours.
              </p>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 p-8 mb-12">
            <h3 className="text-2xl font-bold text-primary-400 mb-4 text-center">
              How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-primary-300 mb-2">1. Configure Your Token</h4>
                <p className="text-gray-400">
                  Set your token name, ticker, description, images, and social links. 
                  Customize your tokenomics with reward distribution (0-100%), burn percentages (0-100%), 
                  and optional platform fee (0-10%). Choose your reward token for dividend distribution.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary-300 mb-2">2. Launch on PumpFun</h4>
                <p className="text-gray-400">
                  Your token launches on PumpFun with all your configured settings. 
                  Creator funds are automatically processed according to your allocation strategy.
                  Set initial owner wallet or use your connected wallet as the default owner.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary-300 mb-2">3. Automatic Rewards</h4>
                <p className="text-gray-400">
                  Dividends are automatically distributed to token holders based on their share count. 
                  Each 500,000 tokens equals 1 share, with a max of 50 shares per wallet (25M token cap).
                  Fair and proportional distribution system.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary-300 mb-2">4. Manage & Control</h4>
                <p className="text-gray-400">
                  View all your launched tokens on your account page. Edit allocations post-launch, 
                  transfer ownership, track allocation history, and monitor performance all in one place.
                  Full control even after launch!
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Features Section */}
          <div className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 p-8 mb-12">
            <h3 className="text-2xl font-bold text-primary-400 mb-6 text-center">
              🎯 Post-Launch Control & Flexibility
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-black border border-primary-600/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">📊</div>
                  <h4 className="text-xl font-semibold text-primary-400">Edit Allocations Anytime</h4>
                </div>
                <p className="text-gray-300 mb-3">
                  <strong className="text-primary-300">Full control after launch!</strong> Adjust your token's allocation strategy at any time:
                </p>
                <ul className="text-gray-400 space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>Modify platform fee (0-10%) to support the ecosystem</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>Adjust reward distribution (0-100%) to reward holders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>Change burn percentage (0-100%) to manage supply</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>Complete allocation history tracking for transparency</span>
                  </li>
                </ul>
                <p className="text-primary-300 text-sm mt-4 font-semibold">
                  ✨ Adapt your tokenomics as your project evolves!
                </p>
              </div>
              
              <div className="bg-black border border-primary-600/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">🔄</div>
                  <h4 className="text-xl font-semibold text-primary-400">Transfer Ownership</h4>
                </div>
                <p className="text-gray-300 mb-3">
                  <strong className="text-primary-300">Sell or transfer your token project!</strong> Seamlessly transfer ownership to another wallet:
                </p>
                <ul className="text-gray-400 space-y-2 ml-4">
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>Transfer token ownership to any Solana wallet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>Secure transfer with 0.1 SOL fee</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>Complete ownership transfer history</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">•</span>
                    <span>New owner gains full control and allocation editing rights</span>
                  </li>
                </ul>
                <p className="text-primary-300 text-sm mt-4 font-semibold">
                  ✨ Perfect for selling projects or team transitions!
                </p>
              </div>
            </div>
          </div>

          {/* What You Can Do Section */}
          <div className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 p-8 mb-12">
            <h3 className="text-2xl font-bold text-primary-400 mb-6 text-center">
              🚀 What DiviLauncher Can Do For You
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Launch Tokens Instantly</h4>
                    <p className="text-gray-400 text-sm">
                      Create and launch Solana tokens on PumpFun in minutes. No coding required, 
                      just fill out the form and launch.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Custom Tokenomics</h4>
                    <p className="text-gray-400 text-sm">
                      Set reward distribution (0-100%), burn percentage (0-100%), and optional 
                      platform fee (0-10%). Full flexibility to design your token economy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Post-Launch Editing</h4>
                    <p className="text-gray-400 text-sm">
                      Edit allocations anytime after launch. Adjust platform fees, reward distribution, 
                      and burn percentages as your project evolves. Complete history tracking included.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Ownership Transfers</h4>
                    <p className="text-gray-400 text-sm">
                      Transfer token ownership to any Solana wallet. Perfect for selling projects, 
                      team transitions, or multi-sig setups. Secure transfers with fee protection.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Automatic Dividends</h4>
                    <p className="text-gray-400 text-sm">
                      Automatic dividend distribution to token holders based on share count. 
                      Fair system: 500k tokens = 1 share, max 50 shares per wallet.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Creator Profiles</h4>
                    <p className="text-gray-400 text-sm">
                      Build your creator profile with custom banner, profile picture, username, and bio. 
                      Showcase all your launched tokens in one portfolio.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Complete History</h4>
                    <p className="text-gray-400 text-sm">
                      Track all allocation changes and ownership transfers with complete history. 
                      Transparent and auditable records for every modification.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary-400 text-xl font-bold">✓</span>
                  <div>
                    <h4 className="text-lg font-semibold text-primary-300 mb-1">Owner-Only Controls</h4>
                    <p className="text-gray-400 text-sm">
                      Edit allocations and transfer ownership are restricted to token owners only. 
                      Secure and permissioned access ensures only authorized changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <a
              href="/launch"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Launch Your token
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400">
          <p>Built for Solana Network • DiviLauncher © 2026</p>
          <p className="text-sm mt-2">
            Always verify token addresses and do your own research before investing
          </p>
        </footer>
      </div>
    </main>
  )
}

