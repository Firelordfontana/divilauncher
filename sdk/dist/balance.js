// Balance operations for DiviLauncher SDK
export class BalanceAPI {
    constructor(client) {
        this.client = client;
        this.cache = new Map();
        this.cacheTTL = 30000; // 30 seconds
    }
    /**
     * Get SOL balance for a wallet address
     * Uses caching to reduce API calls
     */
    async get(walletAddress) {
        // Check cache first
        const cached = this.cache.get(walletAddress);
        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return {
                balance: cached.balance,
                cached: true,
            };
        }
        // Fetch from API
        try {
            const response = await this.client.get(`/api/balance?address=${walletAddress}`);
            // Update cache
            this.cache.set(walletAddress, {
                balance: response.balance,
                timestamp: Date.now(),
            });
            return response;
        }
        catch (error) {
            // If API fails but we have cached data, return it
            if (cached) {
                return {
                    balance: cached.balance,
                    cached: true,
                };
            }
            throw error;
        }
    }
    /**
     * Clear cache for a specific wallet or all wallets
     */
    clearCache(walletAddress) {
        if (walletAddress) {
            this.cache.delete(walletAddress);
        }
        else {
            this.cache.clear();
        }
    }
    /**
     * Set cache TTL (time to live) in milliseconds
     */
    setCacheTTL(ttl) {
        this.cacheTTL = ttl;
    }
}
