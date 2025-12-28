'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import WalletMultiButton for connect functionality
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

interface CreatorProfile {
  walletAddress: string
  username: string
  profileImageUrl: string
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [copied, setCopied] = useState(false)
  
  const wallet = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      // Load profile from database API
      const loadProfile = async () => {
        try {
          const walletAddress = wallet.publicKey?.toBase58()
          if (!walletAddress) return
          
          const response = await fetch(`/api/profiles/${walletAddress}`)
          if (response.ok) {
            const data = await response.json()
            const dbProfile = data.profile
            
            // Use avatarData if available (database storage), otherwise use avatarUrl
            const avatarUrl = dbProfile.avatarData || dbProfile.avatarUrl || ''
            
            const userProfile: CreatorProfile = {
              walletAddress: dbProfile.walletAddress,
              username: dbProfile.username || '',
              profileImageUrl: avatarUrl,
            }
            setProfile(userProfile)
            
            // Also update localStorage for backward compatibility
            const profiles = localStorage.getItem('creatorProfiles')
            const profilesData: CreatorProfile[] = profiles ? JSON.parse(profiles) : []
            const existingIndex = profilesData.findIndex(
              p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
            )
            if (existingIndex !== -1) {
              profilesData[existingIndex] = userProfile
            } else {
              profilesData.push(userProfile)
            }
            localStorage.setItem('creatorProfiles', JSON.stringify(profilesData))
          } else if (response.status === 404) {
            // Profile doesn't exist yet
            setProfile(null)
          }
        } catch (err) {
          console.error('Failed to load profile in Navigation:', err)
          // Fallback to localStorage
          const profiles = localStorage.getItem('creatorProfiles')
          const profilesData: CreatorProfile[] = profiles ? JSON.parse(profiles) : []
          const userProfile = profilesData.find(
            p => p.walletAddress.toLowerCase() === wallet.publicKey?.toBase58().toLowerCase()
          )
          setProfile(userProfile || null)
        }
      }
      
      loadProfile()
      
      // Listen for profile updates (custom event from account page)
      const handleProfileUpdate = (event: CustomEvent) => {
        const updatedProfile = event.detail as CreatorProfile
        if (updatedProfile.walletAddress.toLowerCase() === wallet.publicKey?.toBase58().toLowerCase()) {
          setProfile(updatedProfile)
        }
      }
      
      window.addEventListener('profileUpdated', handleProfileUpdate as EventListener)
      
      // Refresh profile periodically (every 30 seconds)
      const profileInterval = setInterval(loadProfile, 30000)
      
      return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener)
        clearInterval(profileInterval)
      }

      // Fetch SOL balance
      const fetchBalance = async () => {
        if (!wallet.publicKey || !connection) return
        try {
          const balance = await Promise.race([
            connection.getBalance(wallet.publicKey),
            new Promise<number>((_, reject) => 
              setTimeout(() => reject(new Error('Balance fetch timeout')), 10000)
            )
          ])
          setSolBalance(balance / LAMPORTS_PER_SOL)
        } catch (err: any) {
          // Silently handle rate limit errors - don't spam console
          const isRateLimit = err?.message?.includes('403') || 
                             err?.message?.includes('rate limit') ||
                             err?.message?.includes('Forbidden') ||
                             err?.code === 403
          
          if (!isRateLimit) {
            // Only log non-rate-limit errors
            console.error('Failed to fetch balance:', err)
          }
          // Don't clear balance on rate limit - keep previous value if available
        }
      }
      
      // Fetch with delay
      const balanceTimer = setTimeout(fetchBalance, 1000)

      // Refresh balance periodically (longer interval to avoid rate limits)
      // Increased to 60 seconds to reduce rate limit issues
      const interval = setInterval(fetchBalance, 60000) // Every 60 seconds
      return () => {
        clearTimeout(balanceTimer)
        clearInterval(interval)
      }
    } else {
      setSolBalance(null)
      setProfile(null)
    }
  }, [wallet.connected, wallet.publicKey, connection])

  const handleCopyAddress = async () => {
    if (wallet.publicKey) {
      await navigator.clipboard.writeText(wallet.publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setIsProfileOpen(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await wallet.disconnect()
      setIsProfileOpen(false)
      setProfile(null)
      setSolBalance(null)
      // Redirect to home page if on account page
      if (pathname === '/account') {
        router.push('/')
      }
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  const displayName = profile?.username || 
    (wallet.publicKey ? `${wallet.publicKey.toBase58().slice(0, 4)}...${wallet.publicKey.toBase58().slice(-4)}` : '')

  return (
    <div className="flex items-center gap-4">
      {/* Navigation Dropdown Menu */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors bg-black border border-primary-600/30 rounded-full px-4 py-1.5"
        >
          <span>Menu</span>
          <svg
            className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-black border-2 border-primary-600/50 rounded-lg shadow-xl shadow-primary-600/30 z-20 backdrop-blur-sm">
              <div className="py-2">
                <a
                  href="/"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary-600/20 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="/launch"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary-600/20 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Launch Token
                </a>
                <a
                  href="/tokens"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-primary-600/20 hover:text-primary-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View Tokens
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Preview / Wallet Connect */}
      {mounted && (
        wallet.connected && wallet.publicKey ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-black border border-primary-600/30 rounded-full px-3 py-1.5 hover:border-primary-500 transition-colors"
            >
              {/* Profile Image */}
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl.startsWith('data:') 
                    ? profile.profileImageUrl 
                    : profile.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show placeholder
                    const img = e.currentTarget
                    img.style.display = 'none'
                    const parent = img.parentElement
                    if (parent) {
                      const placeholder = document.createElement('div')
                      placeholder.className = 'w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center'
                      placeholder.innerHTML = `<span class="text-xs text-primary-400 font-bold">${wallet.publicKey?.toBase58().charAt(0).toUpperCase()}</span>`
                      parent.insertBefore(placeholder, img)
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center">
                  <span className="text-xs text-primary-400 font-bold">
                    {wallet.publicKey.toBase58().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Name and Balance */}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-white">{displayName}</span>
                {solBalance !== null && (
                  <span className="text-xs text-gray-400">{solBalance.toFixed(4)} SOL</span>
                )}
              </div>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-black border-2 border-primary-600/50 rounded-lg shadow-xl shadow-primary-600/30 z-20 backdrop-blur-sm">
                  <div className="py-2">
                    <a
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-primary-600/20 hover:text-primary-400 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </a>
                    <button
                      onClick={handleCopyAddress}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-primary-600/20 hover:text-primary-400 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copied ? 'Copied!' : 'Copy Address'}
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Disconnect
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="wallet-adapter-button-wrapper">
            <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !text-sm !py-1.5 !px-4 !rounded-full !h-auto" />
          </div>
        )
      )}
    </div>
  )
}

