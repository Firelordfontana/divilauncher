import { APIClient } from './client';
import { TokensAPI } from './tokens';
import { ProfilesAPI } from './profiles';
import { BalanceAPI } from './balance';
import { SDKConfig } from './types';
export declare class DiviLauncherSDK {
    tokens: TokensAPI;
    profiles: ProfilesAPI;
    balance: BalanceAPI;
    private client;
    constructor(config: SDKConfig);
}
export * from './types';
export { TokensAPI, ProfilesAPI, BalanceAPI, APIClient };
export default DiviLauncherSDK;
//# sourceMappingURL=index.d.ts.map