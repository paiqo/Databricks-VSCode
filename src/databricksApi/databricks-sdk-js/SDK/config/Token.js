"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshableTokenProvider = exports.Token = void 0;
// expiryDelta determines how earlier a token should be considered
// expired than its actual expiration time. It is used to avoid late
// expirations due to client-server time mismatches.
const expiryDelta = 10 * 1000;
class Token {
    constructor(options) {
        this.refreshToken = options.refreshToken;
        this.accessToken = options.accessToken;
        this.expiry = options.expiry || 0;
    }
    isValid() {
        return this.expiry === 0 || this.expiry > Date.now() + expiryDelta;
    }
}
exports.Token = Token;
function refreshableTokenProvider(source) {
    let token;
    return async (headers) => {
        if (!token || !token.isValid()) {
            token = await source();
        }
        headers["Authorization"] = `Bearer ${token.accessToken}`;
    };
}
exports.refreshableTokenProvider = refreshableTokenProvider;
//# sourceMappingURL=Token.js.map