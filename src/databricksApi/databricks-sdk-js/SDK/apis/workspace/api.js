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
exports.WorkspaceService = exports.WorkspaceError = exports.WorkspaceRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class WorkspaceRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Workspace", method, message);
    }
}
exports.WorkspaceRetriableError = WorkspaceRetriableError;
class WorkspaceError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Workspace", method, message);
    }
}
exports.WorkspaceError = WorkspaceError;
/**
 * The Workspace API allows you to list, import, export, and delete notebooks and
 * folders.
 *
 * A notebook is a web-based interface to a document that contains runnable code,
 * visualizations, and explanatory text.
 */
class WorkspaceService {
    constructor(client) {
        this.client = client;
    }
    async _delete(request, context) {
        const path = "/api/2.0/workspace/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a workspace object.
     *
     * Deletes an object or a directory (and optionally recursively deletes all
     * objects in the directory). * If `path` does not exist, this call returns
     * an error `RESOURCE_DOES_NOT_EXIST`. * If `path` is a non-empty directory
     * and `recursive` is set to `false`, this call returns an error
     * `DIRECTORY_NOT_EMPTY`.
     *
     * Object deletion cannot be undone and deleting a directory recursively is
     * not atomic.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _export(request, context) {
        const path = "/api/2.0/workspace/export";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Export a notebook.
     *
     * Exports a notebook or the contents of an entire directory.
     *
     * If `path` does not exist, this call returns an error
     * `RESOURCE_DOES_NOT_EXIST`.
     *
     * One can only export a directory in `DBC` format. If the exported data
     * would exceed size limit, this call returns `MAX_NOTEBOOK_SIZE_EXCEEDED`.
     * Currently, this API does not support exporting a library.
     */
    async export(request, context) {
        return await this._export(request, context);
    }
    async _getStatus(request, context) {
        const path = "/api/2.0/workspace/get-status";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get status.
     *
     * Gets the status of an object or a directory. If `path` does not exist,
     * this call returns an error `RESOURCE_DOES_NOT_EXIST`.
     */
    async getStatus(request, context) {
        return await this._getStatus(request, context);
    }
    async _import(request, context) {
        const path = "/api/2.0/workspace/import";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Import a notebook.
     *
     * Imports a notebook or the contents of an entire directory. If `path`
     * already exists and `overwrite` is set to `false`, this call returns an
     * error `RESOURCE_ALREADY_EXISTS`. One can only use `DBC` format to import a
     * directory.
     */
    async import(request, context) {
        return await this._import(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/workspace/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List contents.
     *
     * Lists the contents of a directory, or the object if it is not a
     * directory.If the input path does not exist, this call returns an error
     * `RESOURCE_DOES_NOT_EXIST`.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).objects;
        for (const v of response || []) {
            yield v;
        }
    }
    async _mkdirs(request, context) {
        const path = "/api/2.0/workspace/mkdirs";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a directory.
     *
     * Creates the specified directory (and necessary parent directories if they
     * do not exist). If there is an object (not a directory) at any prefix of
     * the input path, this call returns an error `RESOURCE_ALREADY_EXISTS`.
     *
     * Note that if this operation fails it may have succeeded in creating some
     * of the necessary parrent directories.
     */
    async mkdirs(request, context) {
        return await this._mkdirs(request, context);
    }
}
exports.WorkspaceService = WorkspaceService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "_export", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "export", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "_getStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "getStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "_import", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "import", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], WorkspaceService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "_mkdirs", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceService.prototype, "mkdirs", null);
//# sourceMappingURL=api.js.map