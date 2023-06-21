"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OidcEndpoints = void 0;
const Client_1 = require("./Client");
class OidcEndpoints {
    constructor(config, authorizationEndpoint, tokenEndpoint) {
        this.config = config;
        this.authorizationEndpoint = authorizationEndpoint;
        this.tokenEndpoint = tokenEndpoint;
    }
    getClient(options) {
        return new Client_1.Client(this, options);
    }
}
exports.OidcEndpoints = OidcEndpoints;
//# sourceMappingURL=OidcEndpoints.js.map