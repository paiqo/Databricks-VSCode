import { RetriableError } from "../retries/retries";
export declare class ApiError extends Error {
    constructor(service: string, method: string, message?: string);
}
export declare class ApiRetriableError extends RetriableError {
    constructor(service: string, method: string, message?: string);
}
//# sourceMappingURL=apiError.d.ts.map