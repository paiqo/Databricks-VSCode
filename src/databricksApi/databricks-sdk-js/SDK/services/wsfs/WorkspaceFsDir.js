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
exports.WorkspaceFsRepo = exports.WorkspaceFsDir = void 0;
const path_1 = require("path");
const context_1 = require("../../context");
const _1 = require(".");
const logging_1 = require("../../logging");
const utils_1 = require("./utils");
class WorkspaceFsDir extends _1.WorkspaceFsEntity {
    async generateUrl(host) {
        return `${host.host}#folder/${this.details.object_id}`;
    }
    getAbsoluteChildPath(path) {
        //Since this.path returns path value from details returned by the API,
        //it is always absolute. So we can directly use it here.
        const resolved = path_1.posix.resolve(this.path, path);
        const relative = path_1.posix.relative(this.path, resolved);
        if (!path_1.posix.isAbsolute(relative) &&
            !relative.startsWith(".." + path_1.posix.sep) &&
            relative !== "..") {
            return resolved;
        }
        return undefined;
    }
    async mkdir(path, ctx) {
        const validPath = this.getAbsoluteChildPath(path);
        if (!validPath) {
            const err = new Error(`Can't create ${path} as child of ${this.path}: Invalid path`);
            ctx?.logger?.error(`Can't create ${path} as child of ${this.path}`, err);
            throw err;
        }
        try {
            await this._workspaceFsService.mkdirs({ path: validPath });
        }
        catch (e) {
            let err = e;
            if (e instanceof Error) {
                if (e.message.includes("RESOURCE_ALREADY_EXISTS")) {
                    err = new Error(`Can't create ${path} as child of ${this.path}: A file with same path exists`);
                }
            }
            ctx?.logger?.error(`Can't create ${path} as child of ${this.path}`, err);
            throw err;
        }
        const entity = await _1.WorkspaceFsEntity.fromPath(this.wsClient, validPath, ctx);
        if ((0, utils_1.isDirectory)(entity)) {
            return entity;
        }
        return undefined;
    }
    async createFile(path, content, overwrite = true, ctx) {
        const validPath = this.getAbsoluteChildPath(path);
        if (!validPath) {
            const err = new Error(`Can't create ${path} as child of ${this.path}: Invalid path`);
            ctx?.logger?.error(`Can't create ${path} as child of ${this.path}`, err);
            throw err;
        }
        try {
            await this._workspaceFsService.import({
                path: validPath,
                overwrite,
                format: "AUTO",
                content: Buffer.from(content).toString("base64"),
            }, ctx);
        }
        catch (e) {
            ctx?.logger?.error("Error writing ${validPath} file", e);
            throw e;
        }
        let entity = await _1.WorkspaceFsEntity.fromPath(this.wsClient, validPath, ctx);
        if (entity === undefined) {
            //try to read notebook
            entity = await _1.WorkspaceFsEntity.fromPath(this.wsClient, validPath.replace(/^(\/.*)\.(py|ipynb|scala|r|sql)/g, "$1"), ctx);
        }
        if ((0, utils_1.isFile)(entity)) {
            return entity;
        }
    }
}
exports.WorkspaceFsDir = WorkspaceFsDir;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceFsDir.prototype, "mkdir", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(3, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceFsDir.prototype, "createFile", null);
class WorkspaceFsRepo extends WorkspaceFsDir {
}
exports.WorkspaceFsRepo = WorkspaceFsRepo;
//# sourceMappingURL=WorkspaceFsDir.js.map