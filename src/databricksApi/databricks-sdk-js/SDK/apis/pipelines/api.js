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
exports.PipelinesService = exports.PipelinesError = exports.PipelinesRetriableError = void 0;
const model = __importStar(require("./model"));
const retries_1 = __importDefault(require("../../retries/retries"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
const wait_1 = require("../../wait");
class PipelinesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Pipelines", method, message);
    }
}
exports.PipelinesRetriableError = PipelinesRetriableError;
class PipelinesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Pipelines", method, message);
    }
}
exports.PipelinesError = PipelinesError;
/**
 * The Delta Live Tables API allows you to create, edit, delete, start, and view
 * details about pipelines.
 *
 * Delta Live Tables is a framework for building reliable, maintainable, and
 * testable data processing pipelines. You define the transformations to perform
 * on your data, and Delta Live Tables manages task orchestration, cluster
 * management, monitoring, data quality, and error handling.
 *
 * Instead of defining your data pipelines using a series of separate Apache
 * Spark tasks, Delta Live Tables manages how your data is transformed based on a
 * target schema you define for each processing step. You can also enforce data
 * quality with Delta Live Tables expectations. Expectations allow you to define
 * expected data quality and specify how to handle records that fail those
 * expectations.
 */
class PipelinesService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/pipelines";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a pipeline.
     *
     * Creates a new data processing pipeline based on the requested
     * configuration. If successful, this method returns the ID of the new
     * pipeline.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a pipeline.
     *
     * Deletes a pipeline.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a pipeline.
     */
    async get(get, context) {
        const cancellationToken = context?.cancellationToken;
        const getPipelineResponse = await this._get(get, context);
        return (0, wait_1.asWaiter)(getPipelineResponse, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        pipeline_id: getPipelineResponse.pipeline_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Pipelines.getAndWait: cancelled");
                        throw new PipelinesError("getAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.cause;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "FAILED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Pipelines.getAndWait: ${errorMessage}`);
                            throw new PipelinesError("getAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Pipelines.getAndWait: retrying: ${errorMessage}`);
                            throw new PipelinesRetriableError("getAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _getUpdate(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}/updates/${request.update_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a pipeline update.
     *
     * Gets an update from an active pipeline.
     */
    async getUpdate(request, context) {
        return await this._getUpdate(request, context);
    }
    async _listPipelineEvents(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}/events`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List pipeline events.
     *
     * Retrieves events for a pipeline.
     */
    async *listPipelineEvents(request, context) {
        while (true) {
            const response = await this._listPipelineEvents(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.events || response.events.length === 0) {
                break;
            }
            for (const v of response.events) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _listPipelines(request, context) {
        const path = "/api/2.0/pipelines";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List pipelines.
     *
     * Lists pipelines defined in the Delta Live Tables system.
     */
    async *listPipelines(request, context) {
        while (true) {
            const response = await this._listPipelines(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.statuses || response.statuses.length === 0) {
                break;
            }
            for (const v of response.statuses) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _listUpdates(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}/updates`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List pipeline updates.
     *
     * List updates for an active pipeline.
     */
    async listUpdates(request, context) {
        return await this._listUpdates(request, context);
    }
    async _reset(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}/reset`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Reset a pipeline.
     *
     * Resets a pipeline.
     */
    async reset(reset, context) {
        const cancellationToken = context?.cancellationToken;
        await this._reset(reset, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        pipeline_id: reset.pipeline_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Pipelines.resetAndWait: cancelled");
                        throw new PipelinesError("resetAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.cause;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "FAILED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Pipelines.resetAndWait: ${errorMessage}`);
                            throw new PipelinesError("resetAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Pipelines.resetAndWait: retrying: ${errorMessage}`);
                            throw new PipelinesRetriableError("resetAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _startUpdate(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}/updates`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Queue a pipeline update.
     *
     * Starts or queues a pipeline update.
     */
    async startUpdate(request, context) {
        return await this._startUpdate(request, context);
    }
    async _stop(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}/stop`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Stop a pipeline.
     *
     * Stops a pipeline.
     */
    async stop(stop, context) {
        const cancellationToken = context?.cancellationToken;
        await this._stop(stop, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        pipeline_id: stop.pipeline_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Pipelines.stopAndWait: cancelled");
                        throw new PipelinesError("stopAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.cause;
                    switch (status) {
                        case "IDLE": {
                            return pollResponse;
                        }
                        case "FAILED": {
                            const errorMessage = `failed to reach IDLE state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Pipelines.stopAndWait: ${errorMessage}`);
                            throw new PipelinesError("stopAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach IDLE state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Pipelines.stopAndWait: retrying: ${errorMessage}`);
                            throw new PipelinesRetriableError("stopAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _update(request, context) {
        const path = `/api/2.0/pipelines/${request.pipeline_id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Edit a pipeline.
     *
     * Updates a pipeline with the supplied configuration.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.PipelinesService = PipelinesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_getUpdate", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "getUpdate", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_listPipelineEvents", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], PipelinesService.prototype, "listPipelineEvents", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_listPipelines", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], PipelinesService.prototype, "listPipelines", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_listUpdates", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "listUpdates", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_reset", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "reset", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_startUpdate", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "startUpdate", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_stop", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "stop", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PipelinesService.prototype, "update", null);
//# sourceMappingURL=api.js.map