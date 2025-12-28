// Token operations for DiviLauncher SDK
export class TokensAPI {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get all tokens with optional filtering and pagination
     */
    async getAll(params) {
        const queryParams = new URLSearchParams();
        if (params?.owner)
            queryParams.append('owner', params.owner);
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        if (params?.offset)
            queryParams.append('offset', params.offset.toString());
        const query = queryParams.toString();
        const endpoint = `/api/tokens${query ? `?${query}` : ''}`;
        return this.client.get(endpoint);
    }
    /**
     * Get tokens created or owned by a specific wallet
     */
    async getByOwner(walletAddress, limit = 50, offset = 0) {
        return this.getAll({ owner: walletAddress, limit, offset });
    }
    /**
     * Get a single token by address
     */
    async get(tokenAddress) {
        return this.client.get(`/api/tokens/${tokenAddress}`);
    }
    /**
     * Create a new token
     */
    async create(params) {
        return this.client.post('/api/tokens', params);
    }
    /**
     * Update token (partial update)
     */
    async update(tokenAddress, updates) {
        return this.client.put(`/api/tokens/${tokenAddress}`, updates);
    }
    /**
     * Update token allocations (owner only)
     */
    async updateAllocations(tokenAddress, params) {
        return this.client.put(`/api/tokens/${tokenAddress}/allocations`, params);
    }
    /**
     * Transfer token ownership (owner only)
     */
    async transferOwnership(tokenAddress, params) {
        return this.client.post(`/api/tokens/${tokenAddress}/ownership`, params);
    }
}
