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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServingEndpointsService = exports.ServingEndpointsError = exports.ServingEndpointsRetriableError = void 0;
const model = __importStar(require("./model"));
const retries_1 = __importDefault(require("../../retries/retries"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
const wait_1 = require("../../wait");
class ServingEndpointsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("ServingEndpoints", method, message);
    }
}
exports.ServingEndpointsRetriableError = ServingEndpointsRetriableError;
class ServingEndpointsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("ServingEndpoints", method, message);
    }
}
exports.ServingEndpointsError = ServingEndpointsError;
/**
 * The Serving Endpoints API allows you to create, update, and delete model
 * serving endpoints.
 *
 * You can use a serving endpoint to serve models from the Databricks Model
 * Registry. Endpoints expose the underlying models as scalable REST API
 * endpoints using serverless compute. This means the endpoints and associated
 * compute resources are fully managed by Databricks and will not appear in your
 * cloud account. A serving endpoint can consist of one or more MLflow models
 * from the Databricks Model Registry, called served models. A serving endpoint
 * can have at most ten served models. You can configure traffic settings to
 * define how requests should be routed to your served models behind an endpoint.
 * Additionally, you can configure the scale of resources that should be applied
 * to each served model.
 */
class ServingEndpointsService {
    constructor(client) {
        this.client = client;
    }
    async _buildLogs(request, context) {
        const path = `/api/2.0/serving-endpoints/${request.name}/served-models/${request.served_model_name}/build-logs`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Retrieve the logs associated with building the model's environment for a
     * given serving endpoint's served model.
     *
     * Retrieves the build logs associated with the provided served model.
     */
    async buildLogs(request, context) {
        return await this._buildLogs(request, context);
    }
    async _create(request, context) {
        const path = "/api/2.0/serving-endpoints";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new serving endpoint.
     */
    async create(createServingEndpoint, context) {
        const cancellationToken = context?.cancellationToken;
        const servingEndpointDetailed = await this._create(createServingEndpoint, context);
        return (0, wait_1.asWaiter)(servingEndpointDetailed, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        name: servingEndpointDetailed.name,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("ServingEndpoints.createAndWait: cancelled");
                        throw new ServingEndpointsError("createAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state.config_update;
                    const statusMessage = pollResponse;
                    switch (status) {
                        case "NOT_UPDATING": {
                            return pollResponse;
                        }
                        case "UPDATE_FAILED": {
                            const errorMessage = `failed to reach NOT_UPDATING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`ServingEndpoints.createAndWait: ${errorMessage}`);
                            throw new ServingEndpointsError("createAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach NOT_UPDATING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`ServingEndpoints.createAndWait: retrying: ${errorMessage}`);
                            throw new ServingEndpointsRetriableError("createAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _delete(request, context) {
        const path = `/api/2.0/serving-endpoints/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a serving endpoint.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _exportMetrics(request, context) {
        const path = `/api/2.0/serving-endpoints/${request.name}/metrics`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Retrieve the metrics corresponding to a serving endpoint for the current
     * time in Prometheus or OpenMetrics exposition format.
     *
     * Retrieves the metrics associated with the provided serving endpoint in
     * either Prometheus or OpenMetrics exposition format.
     */
    async exportMetrics(request, context) {
        return await this._exportMetrics(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/serving-endpoints/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a single serving endpoint.
     *
     * Retrieves the details for a single serving endpoint.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.0/serving-endpoints";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Retrieve all serving endpoints.
     */
    async list(context) {
        return await this._list(context);
    }
    async _logs(request, context) {
        const path = `/api/2.0/serving-endpoints/${request.name}/served-models/${request.served_model_name}/logs`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Retrieve the most recent log lines associated with a given serving
     * endpoint's served model.
     *
     * Retrieves the service logs associated with the provided served model.
     */
    async logs(request, context) {
        return await this._logs(request, context);
    }
    async _query(request, context) {
        const path = `/serving-endpoints/${request.name}/invocations`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Query a serving endpoint with provided model input.
     */
    async query(request, context) {
        return await this._query(request, context);
    }
    async _updateConfig(request, context) {
        const path = `/api/2.0/serving-endpoints/${request.name}/config`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Update a serving endpoint with a new config.
     *
     * Updates any combination of the serving endpoint's served models, the
     * compute configuration of those served models, and the endpoint's traffic
     * config. An endpoint that already has an update in progress can not be
     * updated until the current update completes or fails.
     */
    async updateConfig(endpointCoreConfigInput, context) {
        const cancellationToken = context?.cancellationToken;
        const servingEndpointDetailed = await this._updateConfig(endpointCoreConfigInput, context);
        return (0, wait_1.asWaiter)(servingEndpointDetailed, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        name: servingEndpointDetailed.name,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("ServingEndpoints.updateConfigAndWait: cancelled");
                        throw new ServingEndpointsError("updateConfigAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state.config_update;
                    const statusMessage = pollResponse;
                    switch (status) {
                        case "NOT_UPDATING": {
                            return pollResponse;
                        }
                        case "UPDATE_FAILED": {
                            const errorMessage = `failed to reach NOT_UPDATING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`ServingEndpoints.updateConfigAndWait: ${errorMessage}`);
                            throw new ServingEndpointsError("updateConfigAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach NOT_UPDATING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`ServingEndpoints.updateConfigAndWait: retrying: ${errorMessage}`);
                            throw new ServingEndpointsRetriableError("updateConfigAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
}
exports.ServingEndpointsService = ServingEndpointsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_buildLogs", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "buildLogs", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_exportMetrics", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "exportMetrics", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_logs", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "logs", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_query", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "query", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "_updateConfig", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServingEndpointsService.prototype, "updateConfig", null);
//# sourceMappingURL=api.js.map