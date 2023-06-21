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
exports.PublishedAppIntegrationService = exports.PublishedAppIntegrationError = exports.PublishedAppIntegrationRetriableError = exports.CustomAppIntegrationService = exports.CustomAppIntegrationError = exports.CustomAppIntegrationRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class CustomAppIntegrationRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("CustomAppIntegration", method, message);
    }
}
exports.CustomAppIntegrationRetriableError = CustomAppIntegrationRetriableError;
class CustomAppIntegrationError extends apiError_1.ApiError {
    constructor(method, message) {
        super("CustomAppIntegration", method, message);
    }
}
exports.CustomAppIntegrationError = CustomAppIntegrationError;
/**
 * These APIs enable administrators to manage custom oauth app integrations,
 * which is required for adding/using Custom OAuth App Integration like Tableau
 * Cloud for Databricks in AWS cloud.
 *
 * **Note:** You can only add/use the OAuth custom application integrations when
 * OAuth enrollment status is enabled. For more details see
 * :method:OAuthEnrollment/create
 */
class CustomAppIntegrationService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/custom-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create Custom OAuth App Integration.
     *
     * Create Custom OAuth App Integration.
     *
     * You can retrieve the custom oauth app integration via :method:get.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/custom-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete Custom OAuth App Integration.
     *
     * Delete an existing Custom OAuth App Integration. You can retrieve the
     * custom oauth app integration via :method:get.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/custom-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get OAuth Custom App Integration.
     *
     * Gets the Custom OAuth App Integration for the given integration id.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/custom-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Updates Custom OAuth App Integration.
     *
     * Updates an existing custom OAuth App Integration. You can retrieve the
     * custom oauth app integration via :method:get.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.CustomAppIntegrationService = CustomAppIntegrationService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CustomAppIntegrationService.prototype, "update", null);
class PublishedAppIntegrationRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("PublishedAppIntegration", method, message);
    }
}
exports.PublishedAppIntegrationRetriableError = PublishedAppIntegrationRetriableError;
class PublishedAppIntegrationError extends apiError_1.ApiError {
    constructor(method, message) {
        super("PublishedAppIntegration", method, message);
    }
}
exports.PublishedAppIntegrationError = PublishedAppIntegrationError;
/**
 * These APIs enable administrators to manage published oauth app integrations,
 * which is required for adding/using Published OAuth App Integration like
 * Tableau Cloud for Databricks in AWS cloud.
 *
 * **Note:** You can only add/use the OAuth published application integrations
 * when OAuth enrollment status is enabled. For more details see
 * :method:OAuthEnrollment/create
 */
class PublishedAppIntegrationService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/published-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create Published OAuth App Integration.
     *
     * Create Published OAuth App Integration.
     *
     * You can retrieve the published oauth app integration via :method:get.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/published-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete Published OAuth App Integration.
     *
     * Delete an existing Published OAuth App Integration. You can retrieve the
     * published oauth app integration via :method:get.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/published-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get OAuth Published App Integration.
     *
     * Gets the Published OAuth App Integration for the given integration id.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/oauth2/published-app-integration/${request.integration_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Updates Published OAuth App Integration.
     *
     * Updates an existing published OAuth App Integration. You can retrieve the
     * published oauth app integration via :method:get.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.PublishedAppIntegrationService = PublishedAppIntegrationService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PublishedAppIntegrationService.prototype, "update", null);
//# sourceMappingURL=api.js.map