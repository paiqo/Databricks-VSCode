export declare class HttpError extends Error {
    readonly message: string;
    readonly code: number;
    constructor(message: string, code: number);
}
export declare class ApiError extends Error {
    readonly message: string;
    readonly errorCode: string;
    readonly statusCode: number;
    readonly response: any;
    constructor(message: string, errorCode: string, statusCode: number, response: any);
    isRetryable(): boolean;
    private isTransientError;
}
export interface ApiErrorBody {
    error_code: string;
    message: string;
    detail?: string;
    status?: string;
    scimType?: string;
    error?: string;
}
export declare function parseErrorFromResponse(statusCode: number, statusMessage: string, body: string): ApiError;
export declare function parseUnknownError(statusMessage: string, body: string): ApiErrorBody;
//# sourceMappingURL=apierr.d.ts.map