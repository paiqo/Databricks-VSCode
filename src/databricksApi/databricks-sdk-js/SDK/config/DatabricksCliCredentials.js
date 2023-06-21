"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabricksCliCredentials = void 0;
const Config_1 = require("./Config");
const execUtils_1 = require("./execUtils");
const Token_1 = require("./Token");
const semver_1 = __importDefault(require("semver"));
/**
 * Authenticate through the Databricks CLI.
 */
class DatabricksCliCredentials {
    constructor() {
        this.name = "databricks-cli";
    }
    async configure(config) {
        if (!config.isAws()) {
            return;
        }
        if (config.host === "") {
            return;
        }
        const ts = this.getTokenSource(config);
        try {
            await ts();
        }
        catch (e) {
            if (e instanceof Config_1.ConfigError) {
                if (e.message.indexOf("Can't find 'databricks' command") >= 0) {
                    config.logger.debug("Most likely Databricks CLI is not installed");
                    return;
                }
                else if (e.message
                    .toLowerCase()
                    .indexOf("databricks OAuth is not") >= 0) {
                    return;
                }
                throw e;
            }
            throw e;
        }
        return (0, Token_1.refreshableTokenProvider)(ts);
    }
    getTokenSource(config) {
        return async () => {
            const args = ["auth", "token"];
            if (config.isAccountClient()) {
                args.push("--account-id", config.accountId);
            }
            else {
                args.push("--host", config.host);
            }
            const databricksCli = config.databricksCliPath || "databricks";
            try {
                const child = await (0, execUtils_1.execFile)(databricksCli, ["version"]);
                const versionString = child.stdout.trim();
                if (!versionString ||
                    !semver_1.default.valid(versionString) ||
                    semver_1.default.lt(versionString, "0.100.0")) {
                    throw new Config_1.ConfigError(`databricks-cli: Legacy version of the Databricks CLI detected. Please upgrade to version 0.100.0 or higher.`, config);
                }
            }
            catch (e) {
                if ((0, execUtils_1.isFileNotFound)(e)) {
                    throw new Config_1.ConfigError("databricks-cli: Can't find 'databricks' command.", config);
                }
            }
            try {
                const child = await (0, execUtils_1.execFile)(databricksCli, args);
                let token;
                try {
                    token = JSON.parse(child.stdout);
                    if (!token.access_token || !token.expiry) {
                        throw new Error();
                    }
                }
                catch (e) {
                    throw new Config_1.ConfigError(`databricks-cli: cannot unmarshal Databricks CLI result: ${e}`, config);
                }
                return new Token_1.Token({
                    accessToken: token.access_token,
                    expiry: new Date(token.expiry).getTime(),
                });
            }
            catch (e) {
                throw new Config_1.ConfigError(`databricks-cli: cannot get access token: ${e + ""}`, config);
            }
        };
    }
}
exports.DatabricksCliCredentials = DatabricksCliCredentials;
//# sourceMappingURL=DatabricksCliCredentials.js.map