// Profile operations for DiviLauncher SDK

import { APIClient } from './client'
import { CreatorProfile, UpdateProfileParams } from './types'

export class ProfilesAPI {
  constructor(private client: APIClient) {}

  /**
   * Get a profile by wallet address
   */
  async get(walletAddress: string): Promise<{ profile: CreatorProfile }> {
    return this.client.get<{ profile: CreatorProfile }>(`/api/profiles/${walletAddress}`)
  }

  /**
   * Update or create a profile
   */
  async update(
    walletAddress: string,
    params: UpdateProfileParams
  ): Promise<{ profile: CreatorProfile }> {
    return this.client.put<{ profile: CreatorProfile }>(
      `/api/profiles/${walletAddress}`,
      params
    )
  }
}

