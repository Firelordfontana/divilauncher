'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function TokenLaunchForm() {
  const { publicKey, connected } = useWallet()
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    imageUrl: '',
    website: '',
    telegram: '',
    twitter: '',
    discord: '',
    rewardTokenAddress: '',
    rewardDistributionPercent: 0,
    burnPercent: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Implement token launch logic
      // This will call your API endpoint to launch the token
      setSuccess('Token launch functionality coming soon!')
    } catch (err: any) {
      setError(err.message || 'Failed to launch token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
      </div>

      {!connected && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
          <p className="text-yellow-300">Please connect your wallet to launch a token</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Token Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="My Awesome Token"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ticker *</label>
            <input
              type="text"
              required
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="MAT"
              maxLength={10}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            rows={3}
            placeholder="Describe your token..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            placeholder="https://..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Twitter</label>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="@username"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Telegram</label>
            <input
              type="text"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="t.me/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discord</label>
            <input
              type="text"
              value={formData.discord}
              onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="discord.gg/..."
            />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold mb-4">Reward Configuration</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Reward Token Address</label>
            <input
              type="text"
              value={formData.rewardTokenAddress}
              onChange={(e) => setFormData({ ...formData, rewardTokenAddress: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Token address for rewards (optional)"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Reward Distribution % (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.rewardDistributionPercent}
                onChange={(e) => setFormData({ ...formData, rewardDistributionPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Burn % (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.burnPercent}
                onChange={(e) => setFormData({ ...formData, burnPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-green-300">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!connected || loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          {loading ? 'Launching...' : 'Launch Token'}
        </button>
      </form>
    </div>
  )
}
