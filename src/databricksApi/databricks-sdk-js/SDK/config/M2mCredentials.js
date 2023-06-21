"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.M2mCredentials = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const Config_1 = require("./Config");
const Token_1 = require("./Token");
/**
 * M2mCredentials provides OAuth 2.0 client credentials flow for service principals
 */
class M2mCredentials {
    constructor() {
        this.name = "oauth-m2m";
    }
    async configure(config) {
        if (!config.clientId || !config.clientSecret) {
            return;
        }
        let client;
        try {
            const endpoints = await config.getOidcEndpoints();
            if (!endpoints) {
                throw new Error("Unable to discover OIDC endpoints");
            }
            client = await endpoints?.getClient({
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                useHeader: true,
            });
        }
        catch (error) {
            throw new Config_1.ConfigError(`oidc: ${error.message}`, config);
        }
        config.logger.debug(`Generating Databricks OAuth token for Service Principal (${config.clientId})`);
        return (0, Token_1.refreshableTokenProvider)(async () => {
            return await client.grant("all-apis");
        });
    }
}
exports.M2mCredentials = M2mCredentials;
//# sourceMappingURL=M2mCredentials.js.map