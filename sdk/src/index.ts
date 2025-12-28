// DiviLauncher SDK - Main Entry Point

import { APIClient } from './client'
import { TokensAPI } from './tokens'
import { ProfilesAPI } from './profiles'
import { BalanceAPI } from './balance'
import { SDKConfig } from './types'

export class DiviLauncherSDK {
  public tokens: TokensAPI
  public profiles: ProfilesAPI
  public balance: BalanceAPI
  private client: APIClient

  constructor(config: SDKConfig) {
    this.client = new APIClient(config)
    this.tokens = new TokensAPI(this.client)
    this.profiles = new ProfilesAPI(this.client)
    this.balance = new BalanceAPI(this.client)
  }
}

// Export types
export * from './types'

// Export individual APIs for advanced usage
export { TokensAPI, ProfilesAPI, BalanceAPI, APIClient }

// Default export
export default DiviLauncherSDK

