"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureCliCredentials = void 0;
const Token_1 = require("./Token");
const Config_1 = require("./Config");
const execUtils_1 = require("./execUtils");
// Resource ID of the Azure application we need to log in.
const azureDatabricksLoginAppID = "2ff814a6-3304-4ab8-85cb-cd0e6f879c1d";
/**
 * Authenticate using Azure CLI
 */
class AzureCliCredentials {
    constructor() {
        this.name = "azure-cli";
    }
    async configure(config) {
        if (!config.isAzure()) {
            return;
        }
        const appId = config.azureLoginAppId || azureDatabricksLoginAppID;
        const ts = this.getTokenSource(config, appId);
        try {
            await ts();
        }
        catch (error) {
            if (error instanceof Config_1.ConfigError) {
                if (error.message.indexOf("Can't find 'az' command") >= 0) {
                    config.logger.debug("Most likely Azure CLI is not installed. " +
                        "See https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest for details");
                    return;
                }
                throw error;
            }
            throw error;
        }
        return (0, Token_1.refreshableTokenProvider)(ts);
    }
    getTokenSource(config, appId) {
        return async () => {
            let stdout = "";
            try {
                ({ stdout } = await (0, execUtils_1.execFileWithShell)("az", [
                    "account",
                    "get-access-token",
                    "--resource",
                    appId,
                    "--output",
                    "json",
                ]));
            }
            catch (e) {
                if (e instanceof execUtils_1.FileNotFoundException) {
                    throw new Config_1.ConfigError("azure-cli: Can't find 'az' command. Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli", config);
                }
                if ((0, execUtils_1.isExecFileException)(e)) {
                    throw new Config_1.ConfigError(`azure-cli: cannot get access token: ${e.stderr}`, config);
                }
                throw new Config_1.ConfigError(`azure-cli: cannot get access token: ${e + ""}`, config);
            }
            let token;
            let azureToken;
            try {
                azureToken = JSON.parse(stdout);
                token = new Token_1.Token({
                    accessToken: azureToken.accessToken,
                    expiry: new Date(azureToken.expiresOn).getTime(),
                });
            }
            catch (e) {
                throw new Config_1.ConfigError(`azure-cli: cannot parse access token: ${e.message}`, config);
            }
            config.logger.info(`Refreshed OAuth token for ${appId} from Azure CLI, which expires on ${azureToken.expiresOn}`);
            return token;
        };
    }
}
exports.AzureCliCredentials = AzureCliCredentials;
//# sourceMappingURL=AzureCliCredentials.js.map