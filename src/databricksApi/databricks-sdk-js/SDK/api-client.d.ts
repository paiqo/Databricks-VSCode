/// <reference types="node" />
import * as https from "node:https";
import { Context } from "./context";
import { Config } from "./config/Config";
type HttpMethod = "POST" | "GET" | "DELETE" | "PATCH" | "PUT";
export type ProductVersion = `${number}.${number}.${number}`;
export interface ClientOptions {
    agent?: https.Agent;
    product?: string;
    productVersion?: ProductVersion;
    userAgentExtra?: Record<string, string>;
}
export declare class ApiClient {
    readonly config: Config;
    private agent;
    readonly product: string;
    readonly productVersion: ProductVersion;
    readonly userAgentExtra: Record<string, string>;
    constructor(config: Config, options?: ClientOptions);
    get host(): Promise<URL>;
    get accountId(): Promise<string | undefined>;
    userAgent(): string;
    request(path: string, method: HttpMethod, payload?: any, context?: Context): Promise<unknown>;
}
export {};
//# sourceMappingURL=api-client.d.ts.map