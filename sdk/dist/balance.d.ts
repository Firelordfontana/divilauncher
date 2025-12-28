import { APIClient } from './client';
import { BalanceResponse } from './types';
export declare class BalanceAPI {
    private client;
    private cache;
    private cacheTTL;
    constructor(client: APIClient);
    /**
     * Get SOL balance for a wallet address
     * Uses caching to reduce API calls
     */
    get(walletAddress: string): Promise<BalanceResponse>;
    /**
     * Clear cache for a specific wallet or all wallets
     */
    clearCache(walletAddress?: string): void;
    /**
     * Set cache TTL (time to live) in milliseconds
     */
    setCacheTTL(ttl: number): void;
}
//# sourceMappingURL=balance.d.ts.map