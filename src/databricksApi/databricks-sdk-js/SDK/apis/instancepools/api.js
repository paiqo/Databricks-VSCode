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
exports.InstancePoolsService = exports.InstancePoolsError = exports.InstancePoolsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class InstancePoolsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("InstancePools", method, message);
    }
}
exports.InstancePoolsRetriableError = InstancePoolsRetriableError;
class InstancePoolsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("InstancePools", method, message);
    }
}
exports.InstancePoolsError = InstancePoolsError;
/**
 * Instance Pools API are used to create, edit, delete and list instance pools by
 * using ready-to-use cloud instances which reduces a cluster start and
 * auto-scaling times.
 *
 * Databricks pools reduce cluster start and auto-scaling times by maintaining a
 * set of idle, ready-to-use instances. When a cluster is attached to a pool,
 * cluster nodes are created using the pool’s idle instances. If the pool has
 * no idle instances, the pool expands by allocating a new instance from the
 * instance provider in order to accommodate the cluster’s request. When a
 * cluster releases an instance, it returns to the pool and is free for another
 * cluster to use. Only clusters attached to a pool can use that pool’s idle
 * instances.
 *
 * You can specify a different pool for the driver node and worker nodes, or use
 * the same pool for both.
 *
 * Databricks does not charge DBUs while instances are idle in the pool. Instance
 * provider billing does apply. See pricing.
 */
class InstancePoolsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/instance-pools/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new instance pool.
     *
     * Creates a new instance pool using idle and ready-to-use cloud instances.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/instance-pools/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete an instance pool.
     *
     * Deletes the instance pool permanently. The idle instances in the pool are
     * terminated asynchronously.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _edit(request, context) {
        const path = "/api/2.0/instance-pools/edit";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Edit an existing instance pool.
     *
     * Modifies the configuration of an existing instance pool.
     */
    async edit(request, context) {
        return await this._edit(request, context);
    }
    async _get(request, context) {
        const path = "/api/2.0/instance-pools/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get instance pool information.
     *
     * Retrieve the information for an instance pool based on its identifier.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.0/instance-pools/list";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List instance pool info.
     *
     * Gets a list of instance pools with their statistics.
     */
    async *list(context) {
        const response = (await this._list(context)).instance_pools;
        for (const v of response || []) {
            yield v;
        }
    }
}
exports.InstancePoolsService = InstancePoolsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "_edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], InstancePoolsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], InstancePoolsService.prototype, "list", null);
//# sourceMappingURL=api.js.map