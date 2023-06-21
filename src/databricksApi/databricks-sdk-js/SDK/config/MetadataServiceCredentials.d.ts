import { AuthType, Config, CredentialProvider, RequestVisitor } from "./Config";
export declare const MetadataServiceVersion = "1";
export declare const MetadataServiceVersionHeader = "x-databricks-metadata-version";
export declare const MetadataServiceHostHeader = "x-databricks-host";
export interface ServerResponse {
    access_token: string;
    expires_on: number;
    token_type: string;
}
/**
 * Credentials provider that fetches a token from a locally running HTTP server
 *
 * The credentials provider will perform a GET request to the configured URL.
 *
 * The MUST return 4xx response if the "X-Databricks-Metadata-Version" header
 * is not set or set to a version that the server doesn't support.
 *
 * The server MUST guarantee stable sessions per URL path. That is, if the
 * server returns a token for a Host on a given URL path, it MUST continue to return
 * tokens for the same Host.
 *
 * The server MUST return a 4xx response if the Host passed in the "X-Databricks-Host"
 * header doesn't match the token.
 *
 * The server is expected to return a JSON response with the following fields:
 *
 * - access_token: The requested access token.
 * - token_type: The type of token, which is a "Bearer" access token.
 * - expires_on: Unix timestamp in seconds when the access token expires.
 */
export declare class MetadataServiceCredentials implements CredentialProvider {
    name: AuthType;
    configure(config: Config): Promise<RequestVisitor | undefined>;
    private getTokenSource;
    private makeRequest;
}
//# sourceMappingURL=MetadataServiceCredentials.d.ts.map