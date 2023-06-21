import "reflect-metadata";
import { NamedLogger } from "../logging";
import { ConfigAttributes } from "./ConfigAttributes";
import { Headers, fetch } from "../fetch";
import { OidcEndpoints } from "./oauth/OidcEndpoints";
export declare class ConfigError extends Error {
    readonly baseMessage: string;
    readonly config: Config;
    constructor(baseMessage: string, config: Config);
}
/**
 * CredentialsProvider responsible for configuring static or refreshable
 * authentication credentials for Databricks REST APIs
 */
export interface CredentialProvider {
    /** Name returns human-addressable name of this credentials provider name */
    name: AuthType;
    /**
     * Configure creates HTTP Request Visitor or returns undefined if a given credetials
     * are not configured. It throws an error if credentials are misconfigured.
     */
    configure(config: Config): Promise<RequestVisitor | undefined>;
}
export interface Loader {
    /** Name is human-addressable representation of this config resolver */
    name: string;
    configure(config: Config): Promise<void>;
}
export interface Logger {
    debug(message: string): void;
    info(message: string): void;
}
export type RequestVisitor = (headers: Headers) => Promise<void>;
type PublicInterface<T> = {
    [K in keyof T]: T[K];
};
export type ConfigOptions = Partial<PublicInterface<Config>>;
export type AuthType = "default" | "pat" | "basic" | "azure-cli" | "google-id" | "metadata-service" | "databricks-cli" | "oauth-m2m";
export type AttributeName = keyof Omit<ConfigOptions, "credentials" | "logger" | "env" | "loaders">;
export declare class Config {
    private config;
    /**
     * Credentials holds an instance of Credentials Provider to authenticate with Databricks REST APIs.
     * If no credentials provider is specified, `DefaultCredentials` are implicitly used.
     */
    credentials?: CredentialProvider;
    /** Databricks host (either of workspace endpoint or Accounts API endpoint) */
    host?: string;
    /** URL of the local metadata service that provides authentication credentials. */
    localMetadataServiceUrl?: string;
    /** Databricks Account ID for Accounts API. This field is used in dependencies. */
    accountId?: string;
    token?: string;
    username?: string;
    password?: string;
    /** Connection profile specified within ~/.databrickscfg. */
    profile?: string;
    /**
     * Location of the Databricks CLI credentials file, that is created
     * by `databricks configure --token` command. By default, it is located
     * in ~/.databrickscfg.
     */
    configFile?: string;
    googleServiceAccount?: string;
    googleCredentials?: string;
    /** Azure Resource Manager ID for Azure Databricks workspace, which is exhanged for a Host */
    azureResourceId?: string;
    azureUseMSI?: boolean;
    azureClientSecret?: string;
    azureClientId?: string;
    azureTenantId?: string;
    /** AzureEnvironment (Public, UsGov, China, Germany) has specific set of API endpoints. */
    azureEnvironment?: string;
    azureLoginAppId?: string;
    clientId?: string;
    clientSecret?: string;
    /** Path to the 'databricks' CLI */
    databricksCliPath?: string;
    authType?: AuthType;
    /**
     * Skip SSL certificate verification for HTTP calls.
     * Use at your own risk or for unit testing purposes.
     */
    insecureSkipVerify?: boolean;
    /** Number of seconds for HTTP timeout */
    httpTimeoutSeconds?: number;
    /** Number of seconds to keep retrying HTTP requests. Default is 300 (5 minutes) */
    retryTimeoutSeconds?: number;
    private resolved;
    private auth?;
    readonly attributes: ConfigAttributes;
    logger: NamedLogger;
    env: typeof process.env;
    constructor(config: ConfigOptions);
    getHost(): Promise<URL>;
    setAttribute(name: AttributeName, value: string): void;
    /**
     * Authenticate adds special headers to HTTP request to authorize it to work with Databricks REST API
     */
    authenticate(headers: Headers): Promise<void>;
    /**
     * isAzure returns true if client is configured for Azure Databricks
     */
    isAzure(): boolean;
    /**
     * isGcp returns true if client is configured for GCP
     */
    isGcp(): boolean;
    /**
     * isAws returns true if client is configured for AWS
     */
    isAws(): boolean;
    /**
     * isAccountClient returns true if client is configured for Accounts API
     */
    isAccountClient(): boolean;
    ensureResolved(): Promise<void>;
    private fixHost;
    private configureCredentialProvider;
    getOidcEndpoints(): Promise<OidcEndpoints | undefined>;
    fetch(url: string, options: any): ReturnType<typeof fetch>;
}
export {};
//# sourceMappingURL=Config.d.ts.map