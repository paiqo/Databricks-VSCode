"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatCredentials = void 0;
/**
 * Authenticate using a personal access token (PAT)
 */
class PatCredentials {
    constructor() {
        this.name = "pat";
    }
    async configure(config) {
        if (!config.token || !config.host) {
            return;
        }
        return async function (headers) {
            headers["Authorization"] = `Bearer ${config.token}`;
        };
    }
}
exports.PatCredentials = PatCredentials;
//# sourceMappingURL=PatCredentials.js.map