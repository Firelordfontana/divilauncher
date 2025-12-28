'use client'

import Navigation from '@/components/Navigation'
import TokenLaunchForm from '@/components/TokenLaunchForm'

export default function LaunchPage() {
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

        {/* Launch Form */}
        <div className="max-w-4xl mx-auto">
          <TokenLaunchForm />
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

