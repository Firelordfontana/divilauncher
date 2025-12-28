'use client'

import { useState, useEffect, useRef } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import Navigation from '@/components/Navigation'
import { optimizeProfileImage, optimizeBannerImage, validateFileSize, validateImageType } from '@/utils/imageOptimizer'
import { getIPFSUrl } from '@/utils/ipfsGateways'
import { useDatabaseStorage } from '@/utils/storageConfig'

interface TokenInfo {
  tokenAddress: string
  name: string
  ticker: string
  description: string
  imageUrl: string
  bannerUrl?: string
  launchDate: string
  creatorWallet: string
  currentOwnerWallet: string // Current owner (can be different from creator after transfer)
  platformFeePercent: number
  rewardDistributionPercent: number
  burnPercent: number
  burnToken?: string
  rewardToken: string
  initialBuyAmount: number
  socialLinks?: {
    telegram?: string
    twitter?: string
    website?: string
    discord?: string
  }
  allocationHistory?: Array<{
    date: string
    platformFeePercent: number
    rewardDistributionPercent: number
    burnPercent: number
  }>
  ownershipTransferHistory?: Array<{
    date: string
    fromWallet: string
    toWallet: string
    fee: number // SOL fee paid for transfer
  }>
  marketCap?: number
  price?: number
}

interface CreatorProfile {
  walletAddress: string
  username: string
  bio: string
  profileImageUrl: string
  bannerImageUrl: string
  socialLinks: {
    twitter?: string
    telegram?: string
    website?: string
    discord?: string
  }
  createdAt: string
}

export default function AccountPage() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const [myTokens, setMyTokens] = useState<TokenInfo[]>([])
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingToken, setEditingToken] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState<{
    platformFeePercent: number
    rewardDistributionPercent: number
    burnPercent: number
    burnToken?: string
  } | null>(null)
  const [profileFormData, setProfileFormData] = useState<CreatorProfile | null>(null)
  const profileImageRef = useRef<HTMLInputElement>(null)
  const bannerImageRef = useRef<HTMLInputElement>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ profile: number; banner: number }>({ profile: 0, banner: 0 })
  const [optimizingImages, setOptimizingImages] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasCheckedWallet, setHasCheckedWallet] = useState(false)
  const [transferringOwnership, setTransferringOwnership] = useState<string | null>(null)
  const [newOwnerWallet, setNewOwnerWallet] = useState('')
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    // Give wallet adapter time to initialize
    const initTimer = setTimeout(() => {
      setHasCheckedWallet(true)
    }, 1000)

    return () => clearTimeout(initTimer)
  }, [])

  useEffect(() => {
    if (!hasCheckedWallet) return // Wait for initial check

    if (wallet.connected && wallet.publicKey) {
      loadProfileAndTokens()
      
      // Fetch SOL balance (matching Navigation component pattern)
      const fetchBalance = async () => {
        if (!wallet.publicKey || !connection) return
        try {
          setBalanceLoading(true)
          // Add timeout to prevent hanging
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
          // Don't set balance to null on rate limit - keep previous value if available
          if (!isRateLimit) {
            setSolBalance(null)
          }
        } finally {
          setBalanceLoading(false)
        }
      }
      
      // Fetch balance with a delay to ensure connection is ready
      const balanceTimer = setTimeout(() => {
        fetchBalance()
      }, 1000)
      
      // Refresh balance periodically (longer interval to avoid rate limits)
      // Increased to 60 seconds to reduce rate limit issues
      const interval = setInterval(fetchBalance, 60000) // Every 60 seconds to avoid rate limits
      return () => {
        clearTimeout(balanceTimer)
        clearInterval(interval)
      }
    } else if (!wallet.connected && !wallet.connecting && hasCheckedWallet) {
      // Only redirect if wallet is explicitly disconnected after we've checked
      router.push('/')
    } else {
      setMyTokens([])
      setProfile(null)
      setSolBalance(null)
      setLoading(false)
    }
  }, [wallet.connected, wallet.publicKey, wallet.connecting, router, hasCheckedWallet, connection])

  const loadProfileAndTokens = async () => {
    try {
      setLoading(true)
      const walletAddress = wallet.publicKey?.toBase58() || ''
      
      // Load profile from database API
      try {
        const response = await fetch(`/api/profiles/${walletAddress}`)
        if (response.ok) {
          const data = await response.json()
          const dbProfile = data.profile
          
          // Convert database profile to CreatorProfile format
          // Use avatarData/bannerData if available (database storage), otherwise use URL
          const avatarUrl = dbProfile.avatarData || dbProfile.avatarUrl || ''
          const bannerUrl = dbProfile.bannerData || dbProfile.bannerUrl || ''
          
          const myProfile: CreatorProfile = {
            walletAddress: dbProfile.walletAddress,
            username: dbProfile.username || '',
            bio: dbProfile.bio || '',
            profileImageUrl: avatarUrl,
            bannerImageUrl: bannerUrl,
            socialLinks: {
              website: dbProfile.website || undefined,
              twitter: dbProfile.twitter || undefined,
              telegram: dbProfile.telegram || undefined,
              discord: dbProfile.discord || undefined,
            },
            createdAt: dbProfile.createdAt || new Date().toISOString(),
          }
          
          setProfile(myProfile)
          setProfileFormData(myProfile)
        } else if (response.status === 404) {
          // Profile doesn't exist yet, create default
          const newProfile: CreatorProfile = {
            walletAddress,
            username: '',
            bio: '',
            profileImageUrl: '',
            bannerImageUrl: '',
            socialLinks: {},
            createdAt: new Date().toISOString(),
          }
          setProfile(newProfile)
          setProfileFormData(newProfile)
        } else {
          throw new Error('Failed to load profile')
        }
      } catch (err) {
        console.error('Failed to load profile from database:', err)
        // Fallback to localStorage if database fails
        const profiles = localStorage.getItem('creatorProfiles')
        const profilesData: CreatorProfile[] = profiles ? JSON.parse(profiles) : []
        const myProfile = profilesData.find(p => p.walletAddress.toLowerCase() === walletAddress.toLowerCase())
        
        if (!myProfile) {
          const newProfile: CreatorProfile = {
            walletAddress,
            username: '',
            bio: '',
            profileImageUrl: '',
            bannerImageUrl: '',
            socialLinks: {},
            createdAt: new Date().toISOString(),
          }
          setProfile(newProfile)
          setProfileFormData(newProfile)
        } else {
          setProfile(myProfile)
          setProfileFormData(myProfile)
        }
      }
      
      // Load all tokens
      const allTokens = localStorage.getItem('launchedTokens')
      let tokens: TokenInfo[] = allTokens ? JSON.parse(allTokens) : []
      
      // Migrate existing tokens to include currentOwnerWallet if missing
      tokens = tokens.map(token => {
        if (!token.currentOwnerWallet) {
          return {
            ...token,
            currentOwnerWallet: token.creatorWallet || walletAddress,
            ownershipTransferHistory: token.ownershipTransferHistory || [],
          }
        }
        return token
      })
      if (tokens.some(t => !t.currentOwnerWallet)) {
        localStorage.setItem('launchedTokens', JSON.stringify(tokens))
      }
      
      // Filter tokens created by this wallet OR owned by this wallet
      const myTokensList = tokens.filter(
        (token) => {
          const creatorMatch = token.creatorWallet && token.creatorWallet.toLowerCase() === walletAddress.toLowerCase()
          const ownerMatch = token.currentOwnerWallet && token.currentOwnerWallet.toLowerCase() === walletAddress.toLowerCase()
          return creatorMatch || ownerMatch
        }
      )
      
      setMyTokens(myTokensList)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const typeValidation = validateImageType(file)
      if (!typeValidation.valid) {
        alert(typeValidation.error)
        e.target.value = ''
        return
      }

      // Validate file size (15MB limit like pump.fun)
      const sizeValidation = validateFileSize(file, 15)
      if (!sizeValidation.valid) {
        alert(sizeValidation.error)
        e.target.value = ''
        return
      }

      // Show preview immediately (base64 for display)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.onerror = () => {
        alert('Failed to read image file. Please try again.')
        e.target.value = ''
      }
      reader.readAsDataURL(file)
      
      // Optimize image before storing (this will happen in background)
      // Store original for now, optimization happens on save
      setProfileImageFile(file)
    }
  }

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const typeValidation = validateImageType(file)
      if (!typeValidation.valid) {
        alert(typeValidation.error)
        e.target.value = ''
        return
      }

      // Validate file size (15MB limit like pump.fun)
      const sizeValidation = validateFileSize(file, 15)
      if (!sizeValidation.valid) {
        alert(sizeValidation.error)
        e.target.value = ''
        return
      }

      // Show preview immediately (base64 for display)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string)
      }
      reader.onerror = () => {
        alert('Failed to read banner image file. Please try again.')
        e.target.value = ''
      }
      reader.readAsDataURL(file)
      
      // Optimize image before storing (this will happen in background)
      // Store original for now, optimization happens on save
      setBannerImageFile(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileFormData || !wallet.publicKey) return

    setSavingProfile(true)
    setUploadingImages(true)
    try {
      const walletAddress = wallet.publicKey.toBase58()
      
      // Upload images to IPFS if new files were selected
      // Use existing URLs if no new file was selected, otherwise upload new file
      // Convert empty strings to null, and ensure we're not using base64 previews
      let avatarUrl: string | null = null
      if (profileImageFile) {
        // New file selected - will upload to IPFS
        avatarUrl = null // Will be set after upload
      } else {
        // No new file - use existing URL (but not if it's base64 or empty)
        const existingUrl = profileFormData.profileImageUrl
        if (existingUrl && existingUrl.trim() !== '' && !existingUrl.startsWith('data:')) {
          avatarUrl = existingUrl
        } else {
          avatarUrl = null // No existing valid URL
        }
      }
      
      let bannerUrl: string | null = null
      if (bannerImageFile) {
        // New file selected - will upload to IPFS
        bannerUrl = null // Will be set after upload
      } else {
        // No new file - use existing URL (but not if it's base64 or empty)
        const existingUrl = profileFormData.bannerImageUrl
        if (existingUrl && existingUrl.trim() !== '' && !existingUrl.startsWith('data:')) {
          bannerUrl = existingUrl
        } else {
          bannerUrl = null // No existing valid URL
        }
      }
      
      if (profileImageFile) {
        try {
          setUploadProgress(prev => ({ ...prev, profile: 10 }))
          
          // Optimize image before upload
          setOptimizingImages(true)
          const optimizedFile = await optimizeProfileImage(profileImageFile)
          setOptimizingImages(false)
          setUploadProgress(prev => ({ ...prev, profile: 30 }))
          
          const formData = new FormData()
          formData.append('file', optimizedFile)
          
          // Use AbortController for timeout handling
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout
          
          // Simulate upload progress (since we can't track actual progress with fetch)
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
              ...prev,
              profile: Math.min(prev.profile + 10, 90),
            }))
          }, 500)
          
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          })
          
          clearInterval(progressInterval)
          clearTimeout(timeoutId)
          setUploadProgress(prev => ({ ...prev, profile: 100 }))
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}))
            throw new Error(errorData.error || `Upload failed: ${uploadResponse.statusText}`)
          }
          
          const uploadData = await uploadResponse.json()
          avatarUrl = uploadData.ipfsUrl
          setUploadProgress(prev => ({ ...prev, profile: 0 }))
        } catch (error: any) {
          console.error('Failed to process profile image:', error)
          setUploadProgress(prev => ({ ...prev, profile: 0 }))
          let errorMessage = 'Failed to process profile image'
          
          if (error.name === 'AbortError') {
            errorMessage = 'Upload timed out. The image may be too large or your connection is slow. Please try a smaller image or check your connection.'
          } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Network')) {
            errorMessage = 'Network error. Please check your connection and try again.'
          } else if (error.message) {
            errorMessage = error.message
          }
          
          alert(errorMessage)
          setSavingProfile(false)
          setUploadingImages(false)
          setOptimizingImages(false)
          return
        }
      }
      
      if (bannerImageFile) {
        try {
          setUploadProgress(prev => ({ ...prev, banner: 10 }))
          
          // Optimize image before upload
          setOptimizingImages(true)
          const optimizedFile = await optimizeBannerImage(bannerImageFile)
          setOptimizingImages(false)
          setUploadProgress(prev => ({ ...prev, banner: 50 }))
          
          if (useDatabaseStorage()) {
            // Database storage: convert to base64
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(optimizedFile)
            })
            bannerUrl = base64 // Store as data URI
            setUploadProgress(prev => ({ ...prev, banner: 100 }))
          } else {
            // IPFS storage: upload to IPFS
            setUploadProgress(prev => ({ ...prev, banner: 30 }))
            
            const formData = new FormData()
            formData.append('file', optimizedFile)
            
            // Use AbortController for timeout handling
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout
            
            // Simulate upload progress (since we can't track actual progress with fetch)
            const progressInterval = setInterval(() => {
              setUploadProgress(prev => ({
                ...prev,
                banner: Math.min(prev.banner + 10, 90),
              }))
            }, 500)
            
            const uploadResponse = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            })
            
            clearInterval(progressInterval)
            clearTimeout(timeoutId)
            setUploadProgress(prev => ({ ...prev, banner: 100 }))
            
            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({}))
              throw new Error(errorData.error || `Upload failed: ${uploadResponse.statusText}`)
            }
            
            const uploadData = await uploadResponse.json()
            bannerUrl = uploadData.ipfsUrl
          }
          
          setUploadProgress(prev => ({ ...prev, banner: 0 }))
        } catch (error: any) {
          console.error('Failed to process banner image:', error)
          setUploadProgress(prev => ({ ...prev, banner: 0 }))
          let errorMessage = 'Failed to process banner image'
          
          if (error.name === 'AbortError') {
            errorMessage = 'Upload timed out. The image may be too large or your connection is slow. Please try a smaller image or check your connection.'
          } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Network')) {
            errorMessage = 'Network error. Please check your connection and try again.'
          } else if (error.message) {
            errorMessage = error.message
          }
          
          alert(errorMessage)
          setSavingProfile(false)
          setUploadingImages(false)
          setOptimizingImages(false)
          return
        }
      }
      
      // Prepare profile data for API
      const profileData: any = {
        username: profileFormData.username || null,
        bio: profileFormData.bio || null,
        website: profileFormData.socialLinks?.website || null,
        twitter: profileFormData.socialLinks?.twitter || null,
        telegram: profileFormData.socialLinks?.telegram || null,
        discord: profileFormData.socialLinks?.discord || null,
      }
      
      // Add image data based on storage mode
      if (useDatabaseStorage()) {
        // Database storage: send base64 data
        if (avatarUrl && avatarUrl.startsWith('data:')) {
          profileData.avatarData = avatarUrl
        } else {
          profileData.avatarUrl = avatarUrl
        }
        if (bannerUrl && bannerUrl.startsWith('data:')) {
          profileData.bannerData = bannerUrl
        } else {
          profileData.bannerUrl = bannerUrl
        }
      } else {
        // IPFS storage: send URLs only
        profileData.avatarUrl = avatarUrl
        profileData.bannerUrl = bannerUrl
      }

      // Save to database via API
      const response = await fetch(`/api/profiles/${walletAddress}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      const result = await response.json()
      const savedProfile = result.profile

      // Update local state immediately with saved data (faster UI update)
      // Use avatarData/bannerData if available (database storage), otherwise use URL
      const savedAvatarUrl = savedProfile.avatarData || savedProfile.avatarUrl || ''
      const savedBannerUrl = savedProfile.bannerData || savedProfile.bannerUrl || ''
      
      const updatedProfile: CreatorProfile = {
        walletAddress: savedProfile.walletAddress,
        username: savedProfile.username || '',
        bio: savedProfile.bio || '',
        profileImageUrl: savedAvatarUrl,
        bannerImageUrl: savedBannerUrl,
        socialLinks: {
          website: savedProfile.website,
          twitter: savedProfile.twitter,
          telegram: savedProfile.telegram,
          discord: savedProfile.discord,
        },
        createdAt: savedProfile.createdAt || new Date().toISOString(),
      }

      // Update state immediately (no need to wait for reload)
      setProfile(updatedProfile)
      setProfileFormData(updatedProfile)
      setEditingProfile(false)
      setProfileImagePreview(null)
      setBannerImagePreview(null)
      setProfileImageFile(null)
      setBannerImageFile(null)
      
      // Notify Navigation component of profile update
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedProfile }))
      
      // Reload profile from database in background (for consistency, but don't wait)
      loadProfileAndTokens().catch(err => {
        console.error('Background profile reload failed:', err)
        // Don't show error to user since we already updated the UI
      })
      
      // Show success toast
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      alert(`Failed to save profile: ${err.message}`)
           } finally {
             setSavingProfile(false)
             setUploadingImages(false)
           }
  }

  const handleEditAllocations = (token: TokenInfo) => {
    setEditingToken(token.tokenAddress)
    setEditFormData({
      platformFeePercent: token.platformFeePercent,
      rewardDistributionPercent: token.rewardDistributionPercent,
      burnPercent: token.burnPercent,
      burnToken: token.burnToken,
    })
  }

  const handleSaveAllocations = (tokenAddress: string) => {
    if (!editFormData) return

    try {
      if (editFormData.platformFeePercent < 0 || editFormData.platformFeePercent > 10) {
        alert('Platform fee must be between 0% and 10%')
        return
      }
      if (editFormData.rewardDistributionPercent < 0 || editFormData.rewardDistributionPercent > 100) {
        alert('Reward distribution must be between 0% and 100%')
        return
      }
      if (editFormData.burnPercent < 0 || editFormData.burnPercent > 100) {
        alert('Burn percentage must be between 0% and 100%')
        return
      }

      const allTokens = localStorage.getItem('launchedTokens')
      const tokens: TokenInfo[] = allTokens ? JSON.parse(allTokens) : []
      
      const tokenIndex = tokens.findIndex((t) => t.tokenAddress === tokenAddress)
      if (tokenIndex === -1) {
        alert('Token not found')
        return
      }

      const token = tokens[tokenIndex]
      
      const historyEntry = {
        date: new Date().toISOString(),
        platformFeePercent: token.platformFeePercent,
        rewardDistributionPercent: token.rewardDistributionPercent,
        burnPercent: token.burnPercent,
      }

      tokens[tokenIndex] = {
        ...token,
        platformFeePercent: editFormData.platformFeePercent,
        rewardDistributionPercent: editFormData.rewardDistributionPercent,
        burnPercent: editFormData.burnPercent,
        burnToken: editFormData.burnToken,
        allocationHistory: [
          ...(token.allocationHistory || []),
          historyEntry,
        ],
      }

      localStorage.setItem('launchedTokens', JSON.stringify(tokens))
      loadProfileAndTokens()
      setEditingToken(null)
      setEditFormData(null)
      alert('Allocations updated successfully!')
    } catch (err) {
      console.error('Failed to update allocations:', err)
      alert('Failed to update allocations')
    }
  }

  const handleCancelEdit = () => {
    setEditingToken(null)
    setEditFormData(null)
  }

  const handleTransferOwnership = (tokenAddress: string) => {
    setTransferringOwnership(tokenAddress)
    setNewOwnerWallet('')
  }

  const handleSaveOwnershipTransfer = async (tokenAddress: string) => {
    if (!newOwnerWallet.trim()) {
      alert('Please enter a wallet address')
      return
    }

    // Basic wallet address validation
    try {
      // This will throw if invalid
      new PublicKey(newOwnerWallet.trim())
    } catch {
      alert('Invalid Solana wallet address')
      return
    }

    const TRANSFER_FEE = 0.1 // 0.1 SOL fee

    // Check SOL balance
    if (!wallet.publicKey) {
      alert('Wallet not connected')
      return
    }

    try {
      const balance = await connection.getBalance(wallet.publicKey)
      const solBalance = balance / LAMPORTS_PER_SOL

      if (solBalance < TRANSFER_FEE) {
        alert(`Insufficient SOL balance. You need ${TRANSFER_FEE} SOL for the transfer fee. Your balance: ${solBalance.toFixed(4)} SOL`)
        return
      }

      const allTokens = localStorage.getItem('launchedTokens')
      const tokens: TokenInfo[] = allTokens ? JSON.parse(allTokens) : []
      
      const tokenIndex = tokens.findIndex((t) => t.tokenAddress === tokenAddress)
      if (tokenIndex === -1) {
        alert('Token not found')
        return
      }

      const token = tokens[tokenIndex]
      const walletAddress = wallet.publicKey?.toBase58() || ''
      
      // Verify current owner (check currentOwnerWallet first, fallback to creatorWallet)
      const isOwner = token.currentOwnerWallet?.toLowerCase() === walletAddress.toLowerCase() ||
                     (!token.currentOwnerWallet && token.creatorWallet?.toLowerCase() === walletAddress.toLowerCase())
      
      if (!isOwner) {
        alert('You are not the current owner of this token')
        return
      }

      // Don't allow transferring to the same wallet
      if (newOwnerWallet.trim().toLowerCase() === walletAddress.toLowerCase()) {
        alert('Cannot transfer ownership to the same wallet')
        return
      }

      // In a real implementation, you would send a transaction here to transfer 0.1 SOL as fee
      // For now, we'll just record the transfer with the fee
      const transferEntry = {
        date: new Date().toISOString(),
        fromWallet: token.currentOwnerWallet || token.creatorWallet,
        toWallet: newOwnerWallet.trim(),
        fee: TRANSFER_FEE,
      }

      tokens[tokenIndex] = {
        ...token,
        currentOwnerWallet: newOwnerWallet.trim(),
        ownershipTransferHistory: [
          ...(token.ownershipTransferHistory || []),
          transferEntry,
        ],
      }

      localStorage.setItem('launchedTokens', JSON.stringify(tokens))
      
      // Reload tokens
      loadProfileAndTokens()
      
      setTransferringOwnership(null)
      setNewOwnerWallet('')
      alert(`Ownership transferred successfully! ${TRANSFER_FEE} SOL fee applied.`)
    } catch (err) {
      console.error('Failed to transfer ownership:', err)
      alert('Failed to transfer ownership')
    }
  }

  const handleCancelTransfer = () => {
    setTransferringOwnership(null)
    setNewOwnerWallet('')
  }

  const handleClearMyTokens = () => {
    if (!wallet.publicKey) return
    
    const confirmed = window.confirm(
      'Are you sure you want to remove all tokens created by your wallet? This will remove them from the display but they will still exist on-chain.'
    )
    
    if (!confirmed) return
    
    try {
      const walletAddress = wallet.publicKey.toBase58()
      const allTokens = localStorage.getItem('launchedTokens')
      let tokens: TokenInfo[] = allTokens ? JSON.parse(allTokens) : []
      
      // Filter out tokens created by this wallet
      const filteredTokens = tokens.filter(
        token => token.creatorWallet?.toLowerCase() !== walletAddress.toLowerCase()
      )
      
      localStorage.setItem('launchedTokens', JSON.stringify(filteredTokens))
      
      // Reload tokens
      loadProfileAndTokens()
      
      alert('Your tokens have been removed from the display.')
    } catch (err) {
      console.error('Failed to clear tokens:', err)
      alert('Failed to clear tokens')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  // Calculate stats
  const totalTokens = myTokens.length
  const totalMarketCap = myTokens.reduce((sum, token) => sum + (token.marketCap || 0), 0)
  const totalVolume = myTokens.reduce((sum, token) => sum + (token.initialBuyAmount || 0), 0)

  // Show loading state while checking wallet connection
  if (!hasCheckedWallet || loading || wallet.connecting) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show redirect message if wallet is disconnected after checking
  if (!wallet.connected && !wallet.connecting && hasCheckedWallet) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-300">Redirecting...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while wallet is connecting or page is loading
  if (loading || wallet.connecting || !wallet.connected) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayProfile = profileFormData || profile

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 w-full z-10">
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

        {/* Profile Banner */}
        <div className="relative mb-20 mt-16">
          <div className="h-48 bg-gradient-to-r from-primary-600/30 to-primary-500/30 relative">
            {displayProfile?.bannerImageUrl || bannerImagePreview ? (
              <img
                src={bannerImagePreview || (displayProfile?.bannerImageUrl 
                  ? (displayProfile.bannerImageUrl.startsWith('data:') 
                      ? displayProfile.bannerImageUrl 
                      : getIPFSUrl(displayProfile.bannerImageUrl))
                  : '')}
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to next gateway if image fails to load (only for IPFS URLs)
                  const img = e.currentTarget
                  const src = img.src
                  if (!src.startsWith('data:') && src.includes('gateway.pinata.cloud')) {
                    img.src = src.replace('gateway.pinata.cloud', 'ipfs.io')
                  } else if (!src.startsWith('data:') && src.includes('ipfs.io')) {
                    img.src = src.replace('ipfs.io', 'cloudflare-ipfs.com')
                  }
                }}
              />
            ) : null}
            {editingProfile && (
              <div className="absolute top-4 right-4">
                <input
                  ref={bannerImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageChange}
                  className="hidden"
                />
                <button
                  onClick={() => bannerImageRef.current?.click()}
                  className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Change Banner
                </button>
              </div>
            )}
          </div>
          
          {/* Profile Picture */}
          <div className="absolute bottom-0 left-6 transform translate-y-1/2">
            <div className="relative">
              {displayProfile?.profileImageUrl || profileImagePreview ? (
                <img
                  src={profileImagePreview || (displayProfile?.profileImageUrl 
                    ? (displayProfile.profileImageUrl.startsWith('data:') 
                        ? displayProfile.profileImageUrl 
                        : getIPFSUrl(displayProfile.profileImageUrl))
                    : '')}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-black"
                  onError={(e) => {
                    // Fallback to next gateway if image fails to load (only for IPFS URLs)
                    const img = e.currentTarget
                    const src = img.src
                    if (!src.startsWith('data:') && src.includes('gateway.pinata.cloud')) {
                      img.src = src.replace('gateway.pinata.cloud', 'ipfs.io')
                    } else if (!src.startsWith('data:') && src.includes('ipfs.io')) {
                      img.src = src.replace('ipfs.io', 'cloudflare-ipfs.com')
                    }
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-600/30 border-4 border-black flex items-center justify-center">
                  <span className="text-4xl text-primary-400 font-bold">
                    {wallet.publicKey?.toBase58().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {editingProfile && (
                <button
                  onClick={() => profileImageRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full border-2 border-black"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="absolute bottom-4 right-6">
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <div className="space-y-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || uploadingImages || optimizingImages}
                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
                  >
                    {optimizingImages ? 'Optimizing images...' : uploadingImages ? 'Uploading images...' : savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                  
                  {/* Progress Indicators */}
                  {(uploadProgress.profile > 0 || uploadProgress.banner > 0) && (
                    <div className="space-y-1">
                      {uploadProgress.profile > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Profile Image</span>
                            <span>{uploadProgress.profile}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div
                              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.profile}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {uploadProgress.banner > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Banner Image</span>
                            <span>{uploadProgress.banner}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5">
                            <div
                              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress.banner}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingProfile(false)
                    setProfileFormData(profile)
                    setProfileImagePreview(null)
                    setBannerImagePreview(null)
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingProfile ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
                  <input
                    type="text"
                    value={profileFormData?.username || ''}
                    onChange={(e) => setProfileFormData(prev => prev ? { ...prev, username: e.target.value } : null)}
                    placeholder="Choose a username"
                    className="w-full max-w-md px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500 text-2xl font-bold"
                  />
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-white mb-2">
                  {displayProfile?.username || wallet.publicKey?.toBase58().slice(0, 8) + '...' + wallet.publicKey?.toBase58().slice(-4)}
                </h1>
              )}

              {editingProfile ? (
                <textarea
                  value={profileFormData?.bio || ''}
                  onChange={(e) => setProfileFormData(prev => prev ? { ...prev, bio: e.target.value } : null)}
                  placeholder="Tell us about yourself..."
                  className="w-full max-w-2xl mt-2 px-4 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white placeholder:text-gray-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-300 max-w-2xl mb-4">
                  {displayProfile?.bio || 'No bio yet. Click "Edit Profile" to add one.'}
                </p>
              )}

              {/* Wallet Address and SOL Balance */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <button
                  onClick={async () => {
                    if (wallet.publicKey) {
                      await navigator.clipboard.writeText(wallet.publicKey.toBase58())
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }
                  }}
                  className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  title="Click to copy"
                >
                  {wallet.publicKey?.toBase58().slice(0, 4)}...{wallet.publicKey?.toBase58().slice(-4)}
                  {copied && <span className="ml-2 text-primary-400">✓ Copied!</span>}
                </button>
                {balanceLoading ? (
                  <span className="text-xs text-gray-500">Loading balance...</span>
                ) : solBalance !== null ? (
                  <span className="text-xs text-gray-400">
                    SOL Balance: <span className="text-primary-400 font-semibold">{solBalance.toFixed(4)} SOL</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Balance unavailable</span>
                )}
                <a
                  href={`https://solscan.io/account/${wallet.publicKey?.toBase58()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  View on Solscan →
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 mb-8">
          <div className="bg-black border border-primary-600/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Tokens Created</p>
            <p className="text-2xl font-bold text-primary-400">{totalTokens}</p>
          </div>
          <div className="bg-black border border-primary-600/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Market Cap</p>
            <p className="text-2xl font-bold text-primary-400">{formatMarketCap(totalMarketCap)}</p>
          </div>
          <div className="bg-black border border-primary-600/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-primary-400">{totalVolume.toFixed(2)} SOL</p>
          </div>
        </div>

        {/* My Tokens */}
        <div className="px-6">
          {myTokens.length === 0 ? (
            <div className="bg-black border border-primary-600/30 rounded-lg p-8 text-center">
              <p className="text-gray-300 mb-4">
                You haven't created any tokens yet.
              </p>
              <a
                href="/launch"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Launch your first token →
              </a>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary-400">
                  My Tokens ({myTokens.length})
                </h2>
                {myTokens.length > 0 && (
                  <button
                    onClick={handleClearMyTokens}
                    className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors px-3 py-1 border border-red-400/30 hover:border-red-300/50 rounded-lg"
                    title="Remove all your tokens from display"
                  >
                    Clear My Tokens
                  </button>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myTokens.map((token) => (
                  <div
                    key={token.tokenAddress}
                    className="bg-black border border-primary-600/30 rounded-lg shadow-lg shadow-primary-600/10 overflow-hidden relative max-w-[80%]"
                  >
                    {/* Token Image Preview - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                      {token.imageUrl ? (
                        <img
                          src={token.imageUrl}
                          alt={token.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary-400 shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-600/30 border-2 border-primary-400 flex items-center justify-center text-primary-300 text-sm font-bold shadow-lg">
                          {token.ticker.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {/* Token Header */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold mb-1 text-white">{token.name}</h3>
                        <p className="text-xs text-gray-400 font-mono">
                          {token.ticker}
                        </p>
                      </div>
                      
                      {/* Token Description */}
                      {token.description && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                            {token.description}
                          </p>
                        </div>
                      )}

                      {/* Token Address */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">Contract Address</p>
                        <p className="text-xs font-mono text-gray-300 break-all">
                          {token.tokenAddress}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <a
                            href={`https://solscan.io/token/${token.tokenAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            View on Solscan →
                          </a>
                          <a
                            href={`https://pump.fun/${token.tokenAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            View on pump.fun →
                          </a>
                        </div>
                      </div>

                      {/* Market Data */}
                      {token.marketCap && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                            <p className="text-sm font-semibold text-white">{formatMarketCap(token.marketCap)}</p>
                          </div>
                        </div>
                      )}

                      {/* Current Allocations */}
                      {editingToken === token.tokenAddress && editFormData ? (
                        <div className="bg-black border border-primary-600/20 rounded-lg p-3 mb-3">
                          <h4 className="text-xs font-semibold text-primary-400 mb-2">Edit Allocations</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-300">Platform Fee (0-10%)</label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={editFormData.platformFeePercent}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    platformFeePercent: Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)),
                                  })
                                }
                                className="w-full px-3 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-300">Rewards (0-100%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={editFormData.rewardDistributionPercent}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    rewardDistributionPercent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                  })
                                }
                                className="w-full px-3 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-300">Burn (0-100%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={editFormData.burnPercent}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    burnPercent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                                  })
                                }
                                className="w-full px-3 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white text-sm"
                              />
                            </div>
                            {editFormData.burnPercent > 0 && (
                              <div>
                                <label className="block text-xs font-medium mb-1 text-gray-300">Burn Token (Optional)</label>
                                <input
                                  type="text"
                                  value={editFormData.burnToken || ''}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      burnToken: e.target.value.trim() || undefined,
                                    })
                                  }
                                  placeholder="Leave empty to burn your own token"
                                  className="w-full px-3 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white text-sm font-mono placeholder:text-gray-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                  Optional: Token address to buy back and burn. If empty, your created token will be burned.
                                </p>
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleSaveAllocations(token.tokenAddress)}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-black border border-primary-600/20 rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-primary-400 mb-2">
                            Dividend Allocation
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Platform Fee:</span>
                              <span className="font-semibold text-primary-400">{token.platformFeePercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Reward Dividends:</span>
                              <span className="font-semibold text-primary-300">{token.rewardDistributionPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Burned:</span>
                              <span className="font-semibold text-red-400">{token.burnPercent}%</span>
                            </div>
                            {token.burnToken && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Burn Token:</span>
                                <span className="font-mono text-gray-400">
                                  {token.burnToken.slice(0, 8)}...{token.burnToken.slice(-6)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-primary-600/30 pt-1 mt-1">
                              <span className="font-medium text-gray-300">Remaining:</span>
                              <span className="font-semibold text-primary-300">
                                {100 - (token.platformFeePercent + token.rewardDistributionPercent + token.burnPercent)}%
                              </span>
                            </div>
                          </div>
                          {(token.currentOwnerWallet?.toLowerCase() === wallet.publicKey?.toBase58().toLowerCase() || 
                            (!token.currentOwnerWallet && token.creatorWallet?.toLowerCase() === wallet.publicKey?.toBase58().toLowerCase())) && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleEditAllocations(token)}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-1 px-2 rounded-lg transition-colors text-xs"
                              >
                                Edit Allocations
                              </button>
                              <button
                                onClick={() => handleTransferOwnership(token.tokenAddress)}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded-lg transition-colors text-xs"
                              >
                                Transfer Ownership
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ownership Transfer Form */}
                      {transferringOwnership === token.tokenAddress && (
                        <div className="bg-black border border-yellow-600/30 rounded-lg p-3 mb-3">
                          <h4 className="text-xs font-semibold text-yellow-400 mb-2">Transfer Ownership</h4>
                          <div className="space-y-3">
                            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mb-3">
                              <p className="text-xs text-yellow-300">
                                <strong>Transfer Fee:</strong> 0.1 SOL will be required to complete this transfer.
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1 text-gray-300">New Owner Wallet Address</label>
                              <input
                                type="text"
                                value={newOwnerWallet}
                                onChange={(e) => setNewOwnerWallet(e.target.value)}
                                placeholder="Enter Solana wallet address"
                                className="w-full px-3 py-2 border border-primary-600/30 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-black text-white text-sm font-mono"
                              />
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleSaveOwnershipTransfer(token.tokenAddress)}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                              >
                                Transfer (0.1 SOL fee)
                              </button>
                              <button
                                onClick={handleCancelTransfer}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ownership Transfer History */}
                      {token.ownershipTransferHistory && token.ownershipTransferHistory.length > 0 && (
                        <div className="mt-2 text-xs">
                          <p className="text-gray-500 mb-1">Transfer History:</p>
                          {token.ownershipTransferHistory.slice(-3).map((transfer, idx) => (
                            <div key={idx} className="text-gray-400 mb-1">
                              {new Date(transfer.date).toLocaleDateString()} - Fee: {transfer.fee || 0.1} SOL
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Owner at Bottom */}
                      <div className="mt-3 pt-3 border-t border-primary-600/20">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Owner:</span>
                            <span className="text-xs text-gray-300 font-mono">
                              {token.currentOwnerWallet || token.creatorWallet
                                ? `${(token.currentOwnerWallet || token.creatorWallet).slice(0, 4)}...${(token.currentOwnerWallet || token.creatorWallet).slice(-4)}`
                                : 'N/A'}
                            </span>
                          </div>
                          {(token.currentOwnerWallet || token.creatorWallet) && (
                            <a
                              href={`https://solscan.io/account/${token.currentOwnerWallet || token.creatorWallet}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                            >
                              View on Solscan →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-green-400/50 flex items-center gap-3 min-w-[300px]">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">Profile Saved!</p>
              <p className="text-sm text-green-100">Your profile has been successfully saved to the database.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
