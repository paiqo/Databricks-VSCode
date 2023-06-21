"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRetriableError = exports.ApiError = void 0;
const retries_1 = require("../retries/retries");
class ApiError extends Error {
    constructor(service, method, message) {
        super(`${service}.${method}: ${message}`);
    }
}
exports.ApiError = ApiError;
class ApiRetriableError extends retries_1.RetriableError {
    constructor(service, method, message) {
        super(`${service}.${method}: ${message}`);
    }
}
exports.ApiRetriableError = ApiRetriableError;
//# sourceMappingURL=apiError.js.map