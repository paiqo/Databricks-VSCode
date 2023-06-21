"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataServiceCredentials = exports.MetadataServiceHostHeader = exports.MetadataServiceVersionHeader = exports.MetadataServiceVersion = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const Config_1 = require("./Config");
const fetch_1 = require("../fetch");
const Token_1 = require("./Token");
exports.MetadataServiceVersion = "1";
exports.MetadataServiceVersionHeader = "x-databricks-metadata-version";
exports.MetadataServiceHostHeader = "x-databricks-host";
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
class MetadataServiceCredentials {
    constructor() {
        this.name = "metadata-service";
    }
    async configure(config) {
        if (!config.localMetadataServiceUrl || !config.host) {
            return;
        }
        let parsedMetadataServiceUrl;
        try {
            parsedMetadataServiceUrl = new URL(config.localMetadataServiceUrl);
        }
        catch (error) {
            throw new Config_1.ConfigError(`invalid auth server URL: ${config.localMetadataServiceUrl}`, config);
        }
        // only allow localhost URLs
        if (parsedMetadataServiceUrl.hostname !== "localhost" &&
            parsedMetadataServiceUrl.hostname !== "127.0.0.1") {
            throw new Config_1.ConfigError(`invalid auth server URL: ${config.localMetadataServiceUrl}`, config);
        }
        const response = await this.makeRequest(config, parsedMetadataServiceUrl);
        if (!response) {
            return;
        }
        const ts = this.getTokenSource(config, parsedMetadataServiceUrl);
        return (0, Token_1.refreshableTokenProvider)(ts);
    }
    getTokenSource(config, url) {
        return async () => {
            const serverResponse = await this.makeRequest(config, url);
            if (!serverResponse) {
                throw new Config_1.ConfigError(`error fetching auth server URL: ${url}`, config);
            }
            config.logger.info(`Refreshed access token from local credentials server, which expires on ${new Date(serverResponse.expires_on * 1000)}`);
            return new Token_1.Token({
                accessToken: serverResponse.access_token,
                expiry: serverResponse.expires_on * 1000,
            });
        };
    }
    async makeRequest(config, url) {
        let body;
        try {
            const response = await (0, fetch_1.fetch)(url.toString(), {
                headers: {
                    [exports.MetadataServiceVersionHeader]: exports.MetadataServiceVersion,
                    [exports.MetadataServiceHostHeader]: config.host,
                },
            });
            if (response.status === 404) {
                return;
            }
            body = (await response.json());
        }
        catch (error) {
            config.logger.error("Error fetching credentials from auth server", error);
            throw new Config_1.ConfigError(`error fetching auth server URL: ${url}`, config);
        }
        if (!body || !body.access_token) {
            throw new Config_1.ConfigError("token parse: invalid token", config);
        }
        return body;
    }
}
exports.MetadataServiceCredentials = MetadataServiceCredentials;
//# sourceMappingURL=MetadataServiceCredentials.js.map