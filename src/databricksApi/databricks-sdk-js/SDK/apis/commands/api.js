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
exports.CommandExecutionService = exports.CommandExecutionError = exports.CommandExecutionRetriableError = void 0;
const model = __importStar(require("./model"));
const retries_1 = __importDefault(require("../../retries/retries"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
const wait_1 = require("../../wait");
class CommandExecutionRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("CommandExecution", method, message);
    }
}
exports.CommandExecutionRetriableError = CommandExecutionRetriableError;
class CommandExecutionError extends apiError_1.ApiError {
    constructor(method, message) {
        super("CommandExecution", method, message);
    }
}
exports.CommandExecutionError = CommandExecutionError;
/**
 * This API allows execution of Python, Scala, SQL, or R commands on running
 * Databricks Clusters.
 */
class CommandExecutionService {
    constructor(client) {
        this.client = client;
    }
    async _cancel(request, context) {
        const path = "/api/1.2/commands/cancel";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Cancel a command.
     *
     * Cancels a currently running command within an execution context.
     *
     * The command ID is obtained from a prior successful call to __execute__.
     */
    async cancel(cancelCommand, context) {
        const cancellationToken = context?.cancellationToken;
        await this._cancel(cancelCommand, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.commandStatus({
                        clusterId: cancelCommand.clusterId,
                        commandId: cancelCommand.commandId,
                        contextId: cancelCommand.contextId,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("CommandExecution.cancelAndWait: cancelled");
                        throw new CommandExecutionError("cancelAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.status;
                    const statusMessage = pollResponse.results.cause;
                    switch (status) {
                        case "Cancelled": {
                            return pollResponse;
                        }
                        case "Error": {
                            const errorMessage = `failed to reach Cancelled state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`CommandExecution.cancelAndWait: ${errorMessage}`);
                            throw new CommandExecutionError("cancelAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach Cancelled state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`CommandExecution.cancelAndWait: retrying: ${errorMessage}`);
                            throw new CommandExecutionRetriableError("cancelAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _commandStatus(request, context) {
        const path = "/api/1.2/commands/status";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get command info.
     *
     * Gets the status of and, if available, the results from a currently
     * executing command.
     *
     * The command ID is obtained from a prior successful call to __execute__.
     */
    async commandStatus(request, context) {
        return await this._commandStatus(request, context);
    }
    async _contextStatus(request, context) {
        const path = "/api/1.2/contexts/status";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get status.
     *
     * Gets the status for an execution context.
     */
    async contextStatus(request, context) {
        return await this._contextStatus(request, context);
    }
    async _create(request, context) {
        const path = "/api/1.2/contexts/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create an execution context.
     *
     * Creates an execution context for running cluster commands.
     *
     * If successful, this method returns the ID of the new execution context.
     */
    async create(createContext, context) {
        const cancellationToken = context?.cancellationToken;
        const created = await this._create(createContext, context);
        return (0, wait_1.asWaiter)(created, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.contextStatus({
                        clusterId: createContext.clusterId,
                        contextId: created.id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("CommandExecution.createAndWait: cancelled");
                        throw new CommandExecutionError("createAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.status;
                    const statusMessage = pollResponse;
                    switch (status) {
                        case "Running": {
                            return pollResponse;
                        }
                        case "Error": {
                            const errorMessage = `failed to reach Running state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`CommandExecution.createAndWait: ${errorMessage}`);
                            throw new CommandExecutionError("createAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach Running state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`CommandExecution.createAndWait: retrying: ${errorMessage}`);
                            throw new CommandExecutionRetriableError("createAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _destroy(request, context) {
        const path = "/api/1.2/contexts/destroy";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete an execution context.
     *
     * Deletes an execution context.
     */
    async destroy(request, context) {
        return await this._destroy(request, context);
    }
    async _execute(request, context) {
        const path = "/api/1.2/commands/execute";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Run a command.
     *
     * Runs a cluster command in the given execution context, using the provided
     * language.
     *
     * If successful, it returns an ID for tracking the status of the command's
     * execution.
     */
    async execute(command, context) {
        const cancellationToken = context?.cancellationToken;
        const created = await this._execute(command, context);
        return (0, wait_1.asWaiter)(created, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.commandStatus({
                        clusterId: command.clusterId,
                        commandId: created.id,
                        contextId: command.contextId,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("CommandExecution.executeAndWait: cancelled");
                        throw new CommandExecutionError("executeAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.status;
                    const statusMessage = pollResponse;
                    switch (status) {
                        case "Finished":
                        case "Error": {
                            return pollResponse;
                        }
                        case "Cancelled":
                        case "Cancelling": {
                            const errorMessage = `failed to reach Finished or Error state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`CommandExecution.executeAndWait: ${errorMessage}`);
                            throw new CommandExecutionError("executeAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach Finished or Error state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`CommandExecution.executeAndWait: retrying: ${errorMessage}`);
                            throw new CommandExecutionRetriableError("executeAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
}
exports.CommandExecutionService = CommandExecutionService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "_cancel", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "cancel", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "_commandStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "commandStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "_contextStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "contextStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "_destroy", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "destroy", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "_execute", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CommandExecutionService.prototype, "execute", null);
//# sourceMappingURL=api.js.map