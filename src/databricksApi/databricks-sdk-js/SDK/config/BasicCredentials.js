"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBasicAuthHeader = exports.BasicCredentials = void 0;
/**
 * Authenticate using username and password
 */
class BasicCredentials {
    constructor() {
        this.name = "basic";
    }
    async configure(config) {
        if (!config.username || !config.password || !config.host) {
            return;
        }
        return async (headers) => {
            headers["Authorization"] = getBasicAuthHeader(config.username, config.password);
        };
    }
}
exports.BasicCredentials = BasicCredentials;
function getBasicAuthHeader(username, password) {
    const tokenUnB64 = `${username}:${password}`;
    const b64 = Buffer.from(tokenUnB64).toString("base64");
    return `Basic ${b64}`;
}
exports.getBasicAuthHeader = getBasicAuthHeader;
//# sourceMappingURL=BasicCredentials.js.map