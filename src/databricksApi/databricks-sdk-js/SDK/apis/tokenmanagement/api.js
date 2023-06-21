"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManagementService = exports.TokenManagementError = exports.TokenManagementRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class TokenManagementRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("TokenManagement", method, message);
    }
}
exports.TokenManagementRetriableError = TokenManagementRetriableError;
class TokenManagementError extends apiError_1.ApiError {
    constructor(method, message) {
        super("TokenManagement", method, message);
    }
}
exports.TokenManagementError = TokenManagementError;
/**
 * Enables administrators to get all tokens and delete tokens for other users.
 * Admins can either get every token, get a specific token by ID, or get all
 * tokens for a particular user.
 */
class TokenManagementService {
    constructor(client) {
        this.client = client;
    }
    async _createOboToken(request, context) {
        const path = "/api/2.0/token-management/on-behalf-of/tokens";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create on-behalf token.
     *
     * Creates a token on behalf of a service principal.
     */
    async createOboToken(request, context) {
        return await this._createOboToken(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/token-management/tokens/${request.token_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a token.
     *
     * Deletes a token, specified by its ID.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/token-management/tokens/${request.token_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get token info.
     *
     * Gets information about a token, specified by its ID.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/token-management/tokens";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List all tokens.
     *
     * Lists all tokens associated with the specified workspace or user.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).token_infos;
        for (const v of response || []) {
            yield v;
        }
    }
}
exports.TokenManagementService = TokenManagementService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TokenManagementService.prototype, "_createOboToken", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TokenManagementService.prototype, "createOboToken", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TokenManagementService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TokenManagementService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TokenManagementService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TokenManagementService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TokenManagementService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], TokenManagementService.prototype, "list", null);
//# sourceMappingURL=api.js.map