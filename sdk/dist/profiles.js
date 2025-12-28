// Profile operations for DiviLauncher SDK
export class ProfilesAPI {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get a profile by wallet address
     */
    async get(walletAddress) {
        return this.client.get(`/api/profiles/${walletAddress}`);
    }
    /**
     * Update or create a profile
     */
    async update(walletAddress, params) {
        return this.client.put(`/api/profiles/${walletAddress}`, params);
    }
}
