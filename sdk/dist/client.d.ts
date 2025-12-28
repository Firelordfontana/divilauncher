import { SDKConfig } from './types';
export declare class APIClient {
    private baseUrl;
    private timeout;
    constructor(config: SDKConfig);
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, body: any): Promise<T>;
    put<T>(endpoint: string, body: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
//# sourceMappingURL=client.d.ts.map