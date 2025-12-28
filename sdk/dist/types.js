// TypeScript types for DiviLauncher SDK
export class SDKError extends Error {
    constructor(message, status, details) {
        super(message);
        this.status = status;
        this.details = details;
        this.name = 'SDKError';
    }
}
