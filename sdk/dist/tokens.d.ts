import { APIClient } from './client';
import { TokenInfo, CreateTokenParams, UpdateAllocationsParams, TransferOwnershipParams, GetTokensParams, GetTokensResponse } from './types';
export declare class TokensAPI {
    private client;
    constructor(client: APIClient);
    /**
     * Get all tokens with optional filtering and pagination
     */
    getAll(params?: GetTokensParams): Promise<GetTokensResponse>;
    /**
     * Get tokens created or owned by a specific wallet
     */
    getByOwner(walletAddress: string, limit?: number, offset?: number): Promise<GetTokensResponse>;
    /**
     * Get a single token by address
     */
    get(tokenAddress: string): Promise<{
        token: TokenInfo;
    }>;
    /**
     * Create a new token
     */
    create(params: CreateTokenParams): Promise<{
        token: TokenInfo;
    }>;
    /**
     * Update token (partial update)
     */
    update(tokenAddress: string, updates: Partial<TokenInfo>): Promise<{
        token: TokenInfo;
    }>;
    /**
     * Update token allocations (owner only)
     */
    updateAllocations(tokenAddress: string, params: UpdateAllocationsParams): Promise<{
        token: TokenInfo;
    }>;
    /**
     * Transfer token ownership (owner only)
     */
    transferOwnership(tokenAddress: string, params: TransferOwnershipParams): Promise<{
        token: TokenInfo;
        message: string;
    }>;
}
//# sourceMappingURL=tokens.d.ts.map