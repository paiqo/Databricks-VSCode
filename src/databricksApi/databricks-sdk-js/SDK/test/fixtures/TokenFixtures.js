"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenFixture = void 0;
class TokenFixture {
    constructor() {
        this.listeners = [];
    }
    get isCancellationRequested() {
        return false;
    }
    onCancellationRequested(f) {
        this.listeners.push(f);
    }
}
exports.TokenFixture = TokenFixture;
//# sourceMappingURL=TokenFixtures.js.map