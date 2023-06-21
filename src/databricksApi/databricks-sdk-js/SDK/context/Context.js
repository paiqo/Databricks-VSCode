"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const crypto_1 = require("crypto");
class Context {
    get logger() {
        return this._items.logger;
    }
    get opId() {
        return this._items.opId;
    }
    get opName() {
        return this._items.opName;
    }
    get rootClassName() {
        return this._items.rootClassName;
    }
    get rootFnName() {
        return this._items.rootFnName;
    }
    get cancellationToken() {
        return this._items?.cancellationToken;
    }
    constructor(items = {}) {
        this._items = {};
        this.setItems(items);
        this._items.opId = this._items.opId ?? (0, crypto_1.randomUUID)();
    }
    setItems(items = {}) {
        this._items = {
            ...this._items,
            ...items,
        };
    }
    copy() {
        return new Context(this._items);
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map