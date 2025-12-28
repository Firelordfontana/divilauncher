'use client'

import { useState, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { launchToken } from '@/utils/tokenLauncher'
import { PublicKey } from '@solana/web3.js'

interface SocialLinks {
  telegram?: string
  twitter?: string
  website?: string
  discord?: string
}

interface TokenFormData {
  name: string
  ticker: string
  description: string
  image: File | null
  banner: File | null
  socialLinks: SocialLinks
  platformFeePercent: number // Platform fee (optional donation) 0-10%
  rewardDistributionPercent: number // Percentage of creator funds to distribute (0-100%)
  burnPercent: number // Percentage of creator funds to burn (0-100%)
  burnToken: string // Optional: Token to buy back and burn (defaults to created token if empty)
  dividendToken: string // Token to convert funds into for rewards
  initialBuyAmount: number // Amount of SOL for initial buy (minimum 0.05)
  initialOwnerWallet: string // Optional: transfer ownership to another wallet on launch
}

export default function TokenLaunchForm() {
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [showCreatorFundsInfo, setShowCreatorFundsInfo] = useState(false)
  const [showRewardTokenInfo, setShowRewardTokenInfo] = useState(false)
  const [showSocialLinks, setShowSocialLinks] = useState(false)
  const [showInitialBuyInfo, setShowInitialBuyInfo] = useState(false)
  const [showBannerInfo, setShowBannerInfo] = useState(false)
  const [showTokenImageInfo, setShowTokenImageInfo] = useState(false)
  const [initialBuyTouched, setInitialBuyTouched] = useState(false)
  const [initialBuyDisplay, setInitialBuyDisplay] = useState<string>('')

  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    ticker: '',
    description: '',
    image: null,
    banner: null,
    socialLinks: {
      telegram: '',
      twitter: '',
      website: '',
      discord: '',
    },
    platformFeePercent: 2, // Default 2% platform fee (optional donation)
    rewardDistributionPercent: 0, // Default 0% of creator funds
    burnPercent: 0, // Default 0% burned
    burnToken: '', // Optional: Token to buy back and burn (defaults to created token)
    dividendToken: '',
    initialBuyAmount: 0.05, // Default 0.05 SOL for initial buy
    initialOwnerWallet: '', // Optional: transfer ownership to another wallet on launch (pre-bonding)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1] as keyof SocialLinks
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }))
    } else if (name === 'platformFeePercent') {
      const newValue = parseFloat(value) || 0
      // Ensure value is between 0 and 10%
      const cappedValue = Math.max(0, Math.min(newValue, 10))
      setFormData(prev => ({
        ...prev,
        [name]: cappedValue,
      }))
    } else if (name === 'rewardDistributionPercent' || name === 'burnPercent') {
      const newValue = parseFloat(value) || 0
      // Ensure value is between 0 and 100%
      const cappedValue = Math.max(0, Math.min(newValue, 100))
      setFormData(prev => ({
        ...prev,
        [name]: cappedValue,
      }))
    } else if (name === 'initialBuyAmount') {
      // Allow typing and handle decimal numbers
      const numericValue = value.replace(/[^0-9.]/g, '')
      // Ensure only one decimal point
      const parts = numericValue.split('.')
      const formattedValue = parts.length > 2 
        ? parts[0] + '.' + parts.slice(1).join('')
        : numericValue
      
      // Store the display value as string to preserve "0." while typing
      setInitialBuyDisplay(formattedValue)
      
      // Parse and store the numeric value (handles "0." as 0, but display keeps the dot)
      const numValue = formattedValue === '' || formattedValue === '.' 
        ? 0 
        : parseFloat(formattedValue) || 0
      
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, banner: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!wallet.connected || !wallet.publicKey) {
      setError('Please connect your wallet first')
      return
    }

    if (!formData.name || !formData.ticker) {
      setError('Please fill in token name and ticker')
      return
    }

    // Validate allocations
    if (formData.platformFeePercent < 0 || formData.platformFeePercent > 10) {
      setError('Platform fee (optional donation) must be between 0% and 10%')
      return
    }
    if (formData.rewardDistributionPercent < 0 || formData.rewardDistributionPercent > 100) {
      setError('Reward distribution percentage must be between 0% and 100%')
      return
    }
    if (formData.burnPercent < 0 || formData.burnPercent > 100) {
      setError('Burn percentage must be between 0% and 100%')
      return
    }
    if (formData.rewardDistributionPercent > 0 && (!formData.dividendToken || formData.dividendToken.trim() === '')) {
      setError('Please select a reward token to convert funds into, or set reward distribution to 0%')
      return
    }
    if (formData.initialBuyAmount < 0.05) {
      setError('Initial buy amount must be at least 0.05 SOL to cover all launch fees')
      return
    }

    // Validate initial owner wallet if provided
    if (formData.initialOwnerWallet && formData.initialOwnerWallet.trim()) {
      try {
        new PublicKey(formData.initialOwnerWallet.trim())
      } catch {
        setError('Invalid initial owner wallet address')
        return
      }
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let dividendTokenPubkey: PublicKey | null = null
      if (formData.dividendToken) {
        try {
          dividendTokenPubkey = new PublicKey(formData.dividendToken)
        } catch {
          setError('Invalid dividend token address')
          setLoading(false)
          return
        }
      }

      const result = await launchToken({
        wallet: wallet.publicKey,
        signTransaction: wallet.signTransaction!,
        formData,
        dividendToken: dividendTokenPubkey,
      })

      setSuccess(`Token launched successfully! Token Address: ${result.tokenAddress}`)
      
      // Get image URLs from form previews (in production, these would come from IPFS uploads)
      const imageUrl = imagePreview || 'https://via.placeholder.com/512'
      const bannerUrl = bannerPreview || undefined

      // Save token to localStorage for tracking
      const tokenInfo = {
        tokenAddress: result.tokenAddress,
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        imageUrl: imageUrl,
        bannerUrl: bannerUrl,
        launchDate: new Date().toISOString(),
        creatorWallet: wallet.publicKey?.toBase58() || '',
        currentOwnerWallet: formData.initialOwnerWallet.trim() || wallet.publicKey?.toBase58() || '', // Use initial owner if provided, otherwise creator
        platformFeePercent: formData.platformFeePercent,
        rewardDistributionPercent: formData.rewardDistributionPercent,
        burnPercent: formData.burnPercent,
        burnToken: formData.burnToken || undefined,
        rewardToken: formData.dividendToken,
        initialBuyAmount: formData.initialBuyAmount,
        socialLinks: formData.socialLinks,
        allocationHistory: [],
        ownershipTransferHistory: formData.initialOwnerWallet?.trim() ? [{
          date: new Date().toISOString(),
          fromWallet: wallet.publicKey?.toBase58() || '',
          toWallet: formData.initialOwnerWallet.trim(),
          fee: 0.1, // 0.1 SOL fee for initial transfer
        }] : [],
      }
      
      // Load existing tokens and add new one
      const existingTokens = localStorage.getItem('launchedTokens')
      const tokens = existingTokens ? JSON.parse(existingTokens) : []
      tokens.push(tokenInfo)
      localStorage.setItem('launchedTokens', JSON.stringify(tokens))
      
      // Reset form
      setFormData({
        name: '',
        ticker: '',
        description: '',
        image: null,
        banner: null,
        socialLinks: {
          telegram: '',
          twitter: '',
          website: '',
          discord: '',
        },
        platformFeePercent: 2,
        rewardDistributionPercent: 0,
        burnPercent: 0,
        burnToken: '',
        dividendToken: '',
        initialBuyAmount: 0.05,
        initialOwnerWallet: '',
      })
      setInitialBuyTouched(false)
      setInitialBuyDisplay('')
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      console.error('Launch error:', err)
      // Provide helpful error message
      if (err.message?.includes('pumpfun-api.com') || err.message?.includes('Failed to launch via PumpFun') || err.message?.includes('Network Error')) {
        setError(
          '⚠️ Launch functionality requires backend implementation. ' +
          'The frontend currently uses a placeholder API endpoint. ' +
          'You need to: 1) Set up a backend API that uses your program wallet, ' +
          '2) Update the launch function to call your backend instead of PumpFun directly. ' +
          'See PROGRAM_ARCHITECTURE.md for implementation details.'
        )
      } else if (err.message?.includes('403') || err.message?.includes('Access forbidden')) {
        setError(
          '⚠️ Solana RPC endpoint is temporarily rate-limited. ' +
          'Please try again in a few moments. ' +
          'If this persists, check your RPC endpoint configuration in environment variables.'
        )
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError(
          '⚠️ Pinata API keys not configured. ' +
          'Please add NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY to your .env.local file. ' +
          'See README.md for setup instructions.'
        )
      } else {
        setError(err.message || 'Failed to launch token. This feature requires backend implementation.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6 bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-primary-400">Launch Your Token</h2>

        {/* Token Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary-400">Token Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Token Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                placeholder="My Awesome Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Ticker Symbol *</label>
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleInputChange}
                required
                maxLength={10}
                className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500 uppercase"
                placeholder="MAT"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
              placeholder="Describe your token..."
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-300">Token Image *</label>
              <button
                type="button"
                onClick={() => setShowTokenImageInfo(!showTokenImageInfo)}
                className="w-5 h-5 rounded-full bg-primary-900/30 border border-primary-600/50 text-primary-400 hover:bg-primary-900/50 flex items-center justify-center text-xs font-bold transition-colors"
                aria-label="Toggle token image information"
              >
                ?
              </button>
            </div>
            {showTokenImageInfo && (
              <div className="bg-primary-900/20 border border-primary-600/30 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm font-semibold text-primary-300 mb-2">File size and type</p>
                <ul className="text-xs text-gray-300 mb-3 space-y-1">
                  <li>• <strong>Image</strong> - max 15MB. '.jpg', '.gif' or '.png' recommended</li>
                  <li>• <strong>Video</strong> - max 30MB. '.mp4' recommended</li>
                </ul>
                <p className="text-sm font-semibold text-primary-300 mb-2">Resolution and aspect ratio</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• <strong>Image</strong> - min. 1000x1000px, 1:1 square recommended</li>
                  <li>• <strong>Video</strong> - 16:9 or 9:16, 1080p+ recommended</li>
                </ul>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-300">Banner Image (Optional)</label>
              <button
                type="button"
                onClick={() => setShowBannerInfo(!showBannerInfo)}
                className="w-5 h-5 rounded-full bg-primary-900/30 border border-primary-600/50 text-primary-400 hover:bg-primary-900/50 flex items-center justify-center text-xs font-bold transition-colors"
                aria-label="Toggle banner information"
              >
                ?
              </button>
            </div>
            {showBannerInfo && (
              <div className="bg-primary-900/20 border border-primary-600/30 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-gray-300">
                  This will be shown on the coin page in addition to the coin image. Images or animated GIFs up to 5MB, 3:1 / 1500x500px original. You can only do this when creating the coin, and it cannot be changed later.
                </p>
              </div>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
            />
            {bannerPreview && (
              <div className="mt-4">
                <img src={bannerPreview} alt="Banner Preview" className="w-full max-w-2xl h-48 rounded-lg object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowSocialLinks(!showSocialLinks)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-xl font-semibold text-primary-400">Social Links (Optional)</h3>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${showSocialLinks ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showSocialLinks && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Telegram</label>
                <input
                  type="url"
                  name="social.telegram"
                  value={formData.socialLinks.telegram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                  placeholder="https://t.me/yourchannel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Twitter (X)</label>
                <input
                  type="url"
                  name="social.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Website</label>
                <input
                  type="url"
                  name="social.website"
                  value={formData.socialLinks.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Discord</label>
                <input
                  type="url"
                  name="social.discord"
                  value={formData.socialLinks.discord}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                  placeholder="https://discord.gg/yourserver"
                />
              </div>
            </div>
          )}
        </div>

        {/* Creator Funds Allocation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-primary-400">Creator Funds Allocation</h3>
            <button
              type="button"
              onClick={() => setShowCreatorFundsInfo(!showCreatorFundsInfo)}
              className="w-5 h-5 rounded-full bg-primary-900/30 border border-primary-600/50 text-primary-400 hover:bg-primary-900/50 flex items-center justify-center text-xs font-bold transition-colors"
              aria-label="Toggle creator funds information"
            >
              ?
            </button>
          </div>
          {showCreatorFundsInfo && (
            <div className="bg-primary-900/20 border border-primary-600/30 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm text-gray-300">
                <strong>How it works:</strong> PumpFun provides creator funds when your token launches. 
                Allocate percentages to distribute rewards to holders and/or burn tokens. 
                You can optionally set a platform fee (0-10%) as a donation to support the platform.
              </p>
              <p className="text-xs text-gray-300 mt-2">
                <strong>Platform Fee (Optional Donation):</strong> An optional fee (0-10%) that goes to the platform wallet. 
                This is completely optional and can be set to 0% if you don't want to donate.
              </p>
              <p className="text-xs text-gray-300 mt-2">
                <strong>Share-Based Distribution:</strong> Rewards are distributed based on shares, not wallet weight. 
                Each 500,000 tokens = 1 share, with a maximum of 50 shares per wallet. This ensures fair distribution 
                and prevents large holders from dominating rewards.
              </p>
              <p className="text-xs text-gray-300 mt-2">
                <strong>Burn Mechanism:</strong> The burn percentage uses creator funds to buy back tokens from the market, 
                then sends those tokens to the Solana burn address. By default, your created token will be burned, but you can 
                optionally specify a different token address to burn instead. This reduces the token supply and can increase the value 
                of remaining tokens.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Platform Fee and Reward Dividends side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Platform Fee (Optional Donation) (0-10%)
                </label>
                <input
                  type="number"
                  name="platformFeePercent"
                  value={formData.platformFeePercent}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional donation to support the platform (default: 2%)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Reward Dividends (0-100%)
                </label>
                <input
                  type="number"
                  name="rewardDistributionPercent"
                  value={formData.rewardDistributionPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Percentage to distribute to token holders
                </p>
              </div>
            </div>

            {/* Burn Percentage and Burn Token side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Burn Percentage (0-100%)
                </label>
                <input
                  type="number"
                  name="burnPercent"
                  value={formData.burnPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Percentage of creator funds used to buy back tokens and send to burn address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Burn Token (Optional)
                  {formData.burnPercent === 0 && (
                    <span className="text-xs text-gray-500 ml-2">(Only applies when burn % &gt; 0)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="burnToken"
                  value={formData.burnToken}
                  onChange={handleInputChange}
                  placeholder="Leave empty to burn your own token, or enter another token address"
                  disabled={formData.burnPercent === 0}
                  className={`w-full px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500 ${
                    formData.burnPercent === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.burnPercent === 0 ? (
                    'Set burn percentage above 0% to enable'
                  ) : (
                    'Optional: Token address to burn. If empty, your created token will be burned.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Allocation Summary */}
          <h4 className="text-base font-semibold mb-3 text-primary-400">Allocation Summary</h4>
          <div className="bg-black border border-primary-600/30 rounded-lg p-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-300">Platform Fee (Optional Donation):</span>
                <span className="font-semibold text-primary-400">{formData.platformFeePercent}%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-300">Rewards to Holders:</span>
                <span className="font-semibold text-primary-300">{formData.rewardDistributionPercent}%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-300">Burned (Buy Back):</span>
                <span className="font-semibold text-red-400">{formData.burnPercent}%</span>
              </div>
              <div className="flex justify-between items-center border-t border-primary-600/30 pt-3 mt-2">
                <span className="font-medium text-gray-300">Total Allocated:</span>
                <span className="font-bold text-primary-300">{formData.platformFeePercent + formData.rewardDistributionPercent + formData.burnPercent}%</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-medium text-gray-300">Remaining (Your Funds):</span>
                <span className="font-bold text-primary-300">
                  {100 - (formData.platformFeePercent + formData.rewardDistributionPercent + formData.burnPercent)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reward Token Configuration */}
        {formData.rewardDistributionPercent > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-primary-400">Reward Token Configuration</h3>
              <button
                type="button"
                onClick={() => setShowRewardTokenInfo(!showRewardTokenInfo)}
                className="w-5 h-5 rounded-full bg-primary-900/30 border border-primary-600/50 text-primary-400 hover:bg-primary-900/50 flex items-center justify-center text-xs font-bold transition-colors"
                aria-label="Toggle reward token information"
              >
                ?
              </button>
            </div>
            
            {showRewardTokenInfo && (
              <div className="bg-primary-900/20 border border-primary-600/30 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-gray-300">
                  <strong>Automatic Processing:</strong> Your token will be launched by our program wallet, and all 
                  creator funds will be automatically processed. Incoming funds (typically SOL) will be converted/swapped 
                  into the reward token you select below using Jupiter Aggregator, then distributed to holders based 
                  on shares.
                </p>
                <p className="text-xs text-gray-300 mt-2">
                  <strong>Share System:</strong> Each 500,000 tokens = 1 share. Maximum 50 shares per wallet. 
                  Rewards are distributed proportionally based on shares, not total holdings. This prevents large holders 
                  from dominating rewards and ensures fair distribution.
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  <strong>Example:</strong> Wallet with 2.5M tokens = 5 shares. Wallet with 30M tokens = 50 shares (capped).
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Convert Funds To (Token Address)
              </label>
              <input
                type="text"
                name="dividendToken"
                value={formData.dividendToken}
                onChange={handleInputChange}
                required={formData.rewardDistributionPercent > 0}
                className="w-full px-4 py-2.5 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black font-mono text-sm text-white placeholder:text-gray-500"
                placeholder="Enter Solana token address (e.g., USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)"
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400">
                  Incoming creator funds will be converted to this token, then {formData.rewardDistributionPercent}% will be distributed to holders based on shares (500k tokens = 1 share, max 50 shares per wallet)
                </p>
                <div className="text-xs text-gray-400 mt-2">
                  <p className="font-semibold mb-1">Popular tokens:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, dividendToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }))}
                      className="px-2 py-1 bg-primary-900/30 border border-primary-600/30 rounded hover:bg-primary-900/50 text-primary-300 transition-colors"
                    >
                      USDC
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, dividendToken: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' }))}
                      className="px-2 py-1 bg-primary-900/30 border border-primary-600/30 rounded hover:bg-primary-900/50 text-primary-300 transition-colors"
                    >
                      USDT
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, dividendToken: 'So11111111111111111111111111111111111111112' }))}
                      className="px-2 py-1 bg-primary-900/30 border border-primary-600/30 rounded hover:bg-primary-900/50 text-primary-300 transition-colors"
                    >
                      SOL
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Initial Buy Amount */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-primary-400">Initial Buy Amount</h3>
                <button
                  type="button"
                  onClick={() => setShowInitialBuyInfo(!showInitialBuyInfo)}
                  className="w-5 h-5 rounded-full bg-primary-900/30 border border-primary-600/50 text-primary-400 hover:bg-primary-900/50 flex items-center justify-center text-xs font-bold transition-colors"
                  aria-label="Toggle initial buy information"
                >
                  ?
                </button>
              </div>
              
              {showInitialBuyInfo && (
                <div className="bg-primary-900/20 border border-primary-600/30 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-gray-300">
                    <strong>Why 0.05 SOL minimum?</strong> This amount covers all fees required to launch and make your token visible on-chain:
                  </p>
                  <ul className="text-xs text-gray-300 mt-2 list-disc list-inside space-y-1">
                    <li><strong>Gas fees:</strong> ~0.005 SOL for transaction costs</li>
                    <li><strong>First buy fee:</strong> 0.02 SOL required by PumpFun to make token visible</li>
                    <li><strong>Safety buffer:</strong> 0.015 SOL for fee fluctuations and future transactions</li>
                    <li><strong>Initial buy:</strong> Remaining amount goes toward the actual token purchase</li>
                  </ul>
                  <p className="text-xs text-gray-300 mt-2">
                    You can add more than 0.05 SOL if you want a larger initial buy, which can help with token visibility and initial liquidity.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Initial Buy Amount (SOL)
                </label>
                <input
                  type="text"
                  name="initialBuyAmount"
                  value={!initialBuyTouched && formData.initialBuyAmount === 0.05 ? '' : (initialBuyDisplay || formData.initialBuyAmount.toString())}
                  onChange={(e) => {
                    setInitialBuyTouched(true)
                    handleInputChange(e)
                  }}
                  onFocus={() => {
                    setInitialBuyTouched(true)
                    if (formData.initialBuyAmount === 0.05) {
                      setInitialBuyDisplay('')
                    }
                  }}
                  onBlur={() => {
                    // On blur, ensure we have a valid number
                    if (initialBuyDisplay === '' || initialBuyDisplay === '.') {
                      setInitialBuyDisplay('0.05')
                      setFormData(prev => ({ ...prev, initialBuyAmount: 0.05 }))
                    } else {
                      const numValue = parseFloat(initialBuyDisplay) || 0.05
                      setFormData(prev => ({ ...prev, initialBuyAmount: numValue }))
                      setInitialBuyDisplay(numValue.toString())
                    }
                  }}
                  required
                  className="w-full px-4 py-2.5 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                  placeholder="Min 0.05"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 0.05 SOL required to cover all launch fees and make token visible on-chain
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-600 text-green-300 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !wallet.connected}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Launching Token...' : 'Launch Token'}
        </button>

        {!wallet.connected && (
          <p className="text-center text-sm text-gray-400">
            Please connect your wallet to configure and launch a token
          </p>
        )}
        
        <div className="bg-primary-900/20 border border-primary-600/30 rounded-lg p-4 mt-4">
          <p className="text-sm text-primary-300">
            <strong>ℹ️ Launch Process:</strong> Your wallet is used to configure the token. The actual launch on 
            PumpFun is performed by our program wallet, which enables fully automatic reward processing. You'll receive 
            the token address after launch.
          </p>
        </div>
      </form>
    </div>
  )
}

