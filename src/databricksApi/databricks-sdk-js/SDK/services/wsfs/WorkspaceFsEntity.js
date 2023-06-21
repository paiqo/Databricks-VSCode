"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceFsEntity = exports.ObjectInfoValidationError = void 0;
const path_1 = require("path");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
const _1 = require(".");
const WorkspaceClient_1 = require("../../WorkspaceClient");
const apierr_1 = require("../../apierr");
class ObjectInfoValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
    }
}
exports.ObjectInfoValidationError = ObjectInfoValidationError;
/* eslint-disable @typescript-eslint/naming-convention */
class RequiredFields {
    constructor() {
        this["object_id"] = "";
        this["object_type"] = "";
        this["path"] = "";
    }
}
class WorkspaceFsEntity {
    constructor(wsClient, details) {
        this.wsClient = wsClient;
        this._workspaceFsService = wsClient.workspace;
        this._details = this.validateDetails(details);
    }
    validateDetails(details, ctx) {
        Object.keys(new RequiredFields()).forEach((field) => {
            if (details[field] === undefined) {
                const err = new ObjectInfoValidationError(`These fields are required for fs objects (${Object.keys(new RequiredFields()).join(", ")})`, details);
                ctx?.logger?.error("ObjectInfo validation error", err);
                throw err;
            }
        });
        return details;
    }
    set details(details) {
        this._details = this.validateDetails(details);
    }
    get details() {
        return this._details;
    }
    get path() {
        return this._details.path;
    }
    get url() {
        return new Promise((resolve) => {
            this.wsClient.apiClient.host.then((host) => resolve(this.generateUrl(host)));
        });
    }
    get type() {
        return this._details.object_type;
    }
    get id() {
        return this._details.object_id;
    }
    async fetchChildren() {
        const children = [];
        for await (const child of this._workspaceFsService.list({
            path: this.path,
        })) {
            const entity = entityFromObjInfo(this.wsClient, child);
            if (entity) {
                children.push(entity);
            }
        }
        this._children = children;
    }
    async refresh(ctx) {
        this._children = undefined;
        try {
            const details = await this._workspaceFsService.getStatus({
                path: this.path,
            }, ctx);
            this.details = details;
            return this;
        }
        catch (e) {
            if (e instanceof apierr_1.ApiError) {
                if (e.errorCode === "RESOURCE_DOES_NOT_EXIST") {
                    return undefined;
                }
            }
        }
    }
    get children() {
        return new Promise((resolve) => {
            if (this._children === undefined) {
                this.fetchChildren().then(() => resolve(this._children ?? []));
            }
            else {
                resolve(this._children);
            }
        });
    }
    static async fromPath(wsClient, path, ctx) {
        try {
            const entity = entityFromObjInfo(wsClient, await wsClient.workspace.getStatus({ path }, ctx));
            return entity;
        }
        catch (e) {
            if (e instanceof apierr_1.ApiError &&
                e.errorCode === "RESOURCE_DOES_NOT_EXIST") {
                return undefined;
            }
            throw e;
        }
    }
    get parent() {
        const parentPath = path_1.posix.dirname(this.path);
        return WorkspaceFsEntity.fromPath(this.wsClient, parentPath);
    }
    get basename() {
        return path_1.posix.basename(this.path);
    }
}
exports.WorkspaceFsEntity = WorkspaceFsEntity;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], WorkspaceFsEntity.prototype, "validateDetails", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceFsEntity.prototype, "refresh", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK, "WorkspaceFsEntity.fromPath"),
    __param(2, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WorkspaceClient_1.WorkspaceClient, String, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceFsEntity, "fromPath", null);
function entityFromObjInfo(wsClient, details) {
    switch (details.object_type) {
        case "DIRECTORY":
            return new _1.WorkspaceFsDir(wsClient, details);
        case "REPO":
            return new _1.WorkspaceFsRepo(wsClient, details);
        case "FILE":
            return new _1.WorkspaceFsFile(wsClient, details);
        case "NOTEBOOK":
            return new _1.WorkspaceFsNotebook(wsClient, details);
    }
    return undefined;
}
//# sourceMappingURL=WorkspaceFsEntity.js.map