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
exports.ReposService = exports.ReposError = exports.ReposRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class ReposRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Repos", method, message);
    }
}
exports.ReposRetriableError = ReposRetriableError;
class ReposError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Repos", method, message);
    }
}
exports.ReposError = ReposError;
/**
 * The Repos API allows users to manage their git repos. Users can use the API to
 * access all repos that they have manage permissions on.
 *
 * Databricks Repos is a visual Git client in Databricks. It supports common Git
 * operations such a cloning a repository, committing and pushing, pulling,
 * branch management, and visual comparison of diffs when committing.
 *
 * Within Repos you can develop code in notebooks or other files and follow data
 * science and engineering code development best practices using Git for version
 * control, collaboration, and CI/CD.
 */
class ReposService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/repos";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a repo.
     *
     * Creates a repo in the workspace and links it to the remote Git repo
     * specified. Note that repos created programmatically must be linked to a
     * remote Git repo, unlike repos created in the browser.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/repos/${request.repo_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a repo.
     *
     * Deletes the specified repo.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/repos/${request.repo_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a repo.
     *
     * Returns the repo with the given repo ID.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/repos";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get repos.
     *
     * Returns repos that the calling user has Manage permissions on. Results are
     * paginated with each page containing twenty repos.
     */
    async *list(request, context) {
        while (true) {
            const response = await this._list(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.repos || response.repos.length === 0) {
                break;
            }
            for (const v of response.repos) {
                yield v;
            }
            request.next_page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _update(request, context) {
        const path = `/api/2.0/repos/${request.repo_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a repo.
     *
     * Updates the repo to a different branch or tag, or updates the repo to the
     * latest commit on the same branch.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.ReposService = ReposService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ReposService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ReposService.prototype, "update", null);
//# sourceMappingURL=api.js.map