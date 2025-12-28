import { APIClient } from './client';
import { CreatorProfile, UpdateProfileParams } from './types';
export declare class ProfilesAPI {
    private client;
    constructor(client: APIClient);
    /**
     * Get a profile by wallet address
     */
    get(walletAddress: string): Promise<{
        profile: CreatorProfile;
    }>;
    /**
     * Update or create a profile
     */
    update(walletAddress: string, params: UpdateProfileParams): Promise<{
        profile: CreatorProfile;
    }>;
}
//# sourceMappingURL=profiles.d.ts.map