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
exports.WorkspaceAssignmentService = exports.WorkspaceAssignmentError = exports.WorkspaceAssignmentRetriableError = exports.PermissionsService = exports.PermissionsError = exports.PermissionsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class PermissionsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Permissions", method, message);
    }
}
exports.PermissionsRetriableError = PermissionsRetriableError;
class PermissionsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Permissions", method, message);
    }
}
exports.PermissionsError = PermissionsError;
/**
 * Permissions API are used to create read, write, edit, update and manage access
 * for various users on different objects and endpoints.
 */
class PermissionsService {
    constructor(client) {
        this.client = client;
    }
    async _get(request, context) {
        const path = `/api/2.0/permissions/${request.request_object_type}/${request.request_object_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get object permissions.
     *
     * Gets the permission of an object. Objects can inherit permissions from
     * their parent objects or root objects.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _getPermissionLevels(request, context) {
        const path = `/api/2.0/permissions/${request.request_object_type}/${request.request_object_id}/permissionLevels`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get permission levels.
     *
     * Gets the permission levels that a user can have on an object.
     */
    async getPermissionLevels(request, context) {
        return await this._getPermissionLevels(request, context);
    }
    async _set(request, context) {
        const path = `/api/2.0/permissions/${request.request_object_type}/${request.request_object_id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Set permissions.
     *
     * Sets permissions on object. Objects can inherit permissions from their
     * parent objects and root objects.
     */
    async set(request, context) {
        return await this._set(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.0/permissions/${request.request_object_type}/${request.request_object_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update permission.
     *
     * Updates the permissions on an object.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.PermissionsService = PermissionsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "_getPermissionLevels", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "getPermissionLevels", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "_set", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "set", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PermissionsService.prototype, "update", null);
class WorkspaceAssignmentRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("WorkspaceAssignment", method, message);
    }
}
exports.WorkspaceAssignmentRetriableError = WorkspaceAssignmentRetriableError;
class WorkspaceAssignmentError extends apiError_1.ApiError {
    constructor(method, message) {
        super("WorkspaceAssignment", method, message);
    }
}
exports.WorkspaceAssignmentError = WorkspaceAssignmentError;
/**
 * The Workspace Permission Assignment API allows you to manage workspace
 * permissions for principals in your account.
 */
class WorkspaceAssignmentService {
    constructor(client) {
        this.client = client;
    }
    async _delete(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/permissionassignments/principals/${request.principal_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete permissions assignment.
     *
     * Deletes the workspace permissions assignment in a given account and
     * workspace for the specified principal.
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
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/permissionassignments/permissions`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List workspace permissions.
     *
     * Get an array of workspace permissions for the specified account and
     * workspace.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/permissionassignments`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get permission assignments.
     *
     * Get the permission assignments for the specified Databricks Account and
     * Databricks Workspace.
     */
    async *list(request, context) {
        const response = (await this._list(request, context))
            .permission_assignments;
        for (const v of response || []) {
            yield v;
        }
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/permissionassignments/principals/${request.principal_id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Create or update permissions assignment.
     *
     * Creates or updates the workspace permissions assignment in a given account
     * and workspace for the specified principal.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.WorkspaceAssignmentService = WorkspaceAssignmentService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceAssignmentService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceAssignmentService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceAssignmentService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceAssignmentService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceAssignmentService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], WorkspaceAssignmentService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceAssignmentService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceAssignmentService.prototype, "update", null);
//# sourceMappingURL=api.js.map