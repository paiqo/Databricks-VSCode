/// <reference types="node" />
/// <reference types="node" />
/**
 * This file contains a subset of the `fetch` API that is compatible with
 * Node.js. It is not a complete implementation of the `fetch` API.
 *
 * We just implement enough to make the SDK work.
 */
import https from "node:https";
import http from "node:http";
export type BodyInit = string;
export type Headers = Record<string, string>;
type AbortListener = (this: AbortSignal) => void;
export declare class AbortError extends Error {
    type: string;
    name: string;
    [Symbol.toStringTag]: string;
    constructor(message: string, type?: string);
}
export declare class AbortController {
    readonly signal: AbortSignal;
    private aborted;
    private listeners;
    constructor();
    abort(): void;
}
export interface AbortSignal {
    get aborted(): boolean;
    addEventListener: (type: "abort", listener: AbortListener) => void;
    removeEventListener: (type: "abort", listener: AbortListener) => void;
}
export interface RequestInit {
    body?: BodyInit;
    headers?: Headers;
    method?: string;
    signal?: AbortSignal;
    agent?: https.Agent;
}
export interface ResponseInit {
    headers?: Headers;
    status?: number;
    statusText?: string;
}
export declare class Response {
    private body;
    readonly headers: Headers;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly url: string;
    constructor(nodeResponse: http.IncomingMessage, body: string);
    text(): Promise<string>;
    json(): Promise<unknown>;
}
export declare function fetch(uri: string, init?: RequestInit): Promise<Response>;
export {};
//# sourceMappingURL=fetch.d.ts.map