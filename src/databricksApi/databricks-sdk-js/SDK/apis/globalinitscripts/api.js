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
exports.GlobalInitScriptsService = exports.GlobalInitScriptsError = exports.GlobalInitScriptsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class GlobalInitScriptsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("GlobalInitScripts", method, message);
    }
}
exports.GlobalInitScriptsRetriableError = GlobalInitScriptsRetriableError;
class GlobalInitScriptsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("GlobalInitScripts", method, message);
    }
}
exports.GlobalInitScriptsError = GlobalInitScriptsError;
/**
 * The Global Init Scripts API enables Workspace administrators to configure
 * global initialization scripts for their workspace. These scripts run on every
 * node in every cluster in the workspace.
 *
 * **Important:** Existing clusters must be restarted to pick up any changes made
 * to global init scripts. Global init scripts are run in order. If the init
 * script returns with a bad exit code, the Apache Spark container fails to
 * launch and init scripts with later position are skipped. If enough containers
 * fail, the entire cluster fails with a `GLOBAL_INIT_SCRIPT_FAILURE` error code.
 */
class GlobalInitScriptsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/global-init-scripts";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create init script.
     *
     * Creates a new global init script in this workspace.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/global-init-scripts/${request.script_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete init script.
     *
     * Deletes a global init script.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/global-init-scripts/${request.script_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get an init script.
     *
     * Gets all the details of a script, including its Base64-encoded contents.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.0/global-init-scripts";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get init scripts.
     *
     * "Get a list of all global init scripts for this workspace. This returns
     * all properties for each script but **not** the script contents. To
     * retrieve the contents of a script, use the [get a global init
     * script](#operation/get-script) operation.
     */
    async *list(context) {
        const response = (await this._list(context)).scripts;
        for (const v of response || []) {
            yield v;
        }
    }
    async _update(request, context) {
        const path = `/api/2.0/global-init-scripts/${request.script_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update init script.
     *
     * Updates a global init script, specifying only the fields to change. All
     * fields are optional. Unspecified fields retain their current value.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.GlobalInitScriptsService = GlobalInitScriptsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], GlobalInitScriptsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GlobalInitScriptsService.prototype, "update", null);
//# sourceMappingURL=api.js.map