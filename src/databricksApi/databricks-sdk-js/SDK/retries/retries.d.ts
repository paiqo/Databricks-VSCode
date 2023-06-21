import Time from "./Time";
export declare class RetriableError extends Error {
    name: string;
}
export declare class TimeoutError extends Error {
    constructor(message?: string);
}
export interface RetryPolicy {
    waitTime(attempt: number): Time;
}
export declare class LinearRetryPolicy {
    readonly _waitTime: Time;
    constructor(_waitTime: Time);
    waitTime(): Time;
}
export declare class ExponetionalBackoffWithJitterRetryPolicy implements RetryPolicy {
    maxJitter: Time;
    minJitter: Time;
    maxWaitTime: Time;
    constructor(options?: {
        maxJitter?: Time;
        minJitter?: Time;
        maxWaitTime?: Time;
    });
    waitTime(attempt: number): Time;
}
export declare const DEFAULT_RETRY_CONFIG: ExponetionalBackoffWithJitterRetryPolicy;
export declare const DEFAULT_MAX_TIMEOUT: Time;
interface RetryArgs<T> {
    timeout?: Time;
    retryPolicy?: RetryPolicy;
    fn: () => Promise<T>;
}
export default function retry<T>({ timeout, retryPolicy: retryConfig, fn, }: RetryArgs<T>): Promise<T>;
export {};
//# sourceMappingURL=retries.d.ts.map