// Token operations for DiviLauncher SDK

import { APIClient } from './client'
import {
  TokenInfo,
  CreateTokenParams,
  UpdateAllocationsParams,
  TransferOwnershipParams,
  GetTokensParams,
  GetTokensResponse,
} from './types'

export class TokensAPI {
  constructor(private client: APIClient) {}

  /**
   * Get all tokens with optional filtering and pagination
   */
  async getAll(params?: GetTokensParams): Promise<GetTokensResponse> {
    const queryParams = new URLSearchParams()
    
    if (params?.owner) queryParams.append('owner', params.owner)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const query = queryParams.toString()
    const endpoint = `/api/tokens${query ? `?${query}` : ''}`

    return this.client.get<GetTokensResponse>(endpoint)
  }

  /**
   * Get tokens created or owned by a specific wallet
   */
  async getByOwner(walletAddress: string, limit = 50, offset = 0): Promise<GetTokensResponse> {
    return this.getAll({ owner: walletAddress, limit, offset })
  }

  /**
   * Get a single token by address
   */
  async get(tokenAddress: string): Promise<{ token: TokenInfo }> {
    return this.client.get<{ token: TokenInfo }>(`/api/tokens/${tokenAddress}`)
  }

  /**
   * Create a new token
   */
  async create(params: CreateTokenParams): Promise<{ token: TokenInfo }> {
    return this.client.post<{ token: TokenInfo }>('/api/tokens', params)
  }

  /**
   * Update token (partial update)
   */
  async update(
    tokenAddress: string,
    updates: Partial<TokenInfo>
  ): Promise<{ token: TokenInfo }> {
    return this.client.put<{ token: TokenInfo }>(`/api/tokens/${tokenAddress}`, updates)
  }

  /**
   * Update token allocations (owner only)
   */
  async updateAllocations(
    tokenAddress: string,
    params: UpdateAllocationsParams
  ): Promise<{ token: TokenInfo }> {
    return this.client.put<{ token: TokenInfo }>(
      `/api/tokens/${tokenAddress}/allocations`,
      params
    )
  }

  /**
   * Transfer token ownership (owner only)
   */
  async transferOwnership(
    tokenAddress: string,
    params: TransferOwnershipParams
  ): Promise<{ token: TokenInfo; message: string }> {
    return this.client.post<{ token: TokenInfo; message: string }>(
      `/api/tokens/${tokenAddress}/ownership`,
      params
    )
  }
}

