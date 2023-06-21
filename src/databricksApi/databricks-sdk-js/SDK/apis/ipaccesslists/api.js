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
exports.IpAccessListsService = exports.IpAccessListsError = exports.IpAccessListsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class IpAccessListsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("IpAccessLists", method, message);
    }
}
exports.IpAccessListsRetriableError = IpAccessListsRetriableError;
class IpAccessListsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("IpAccessLists", method, message);
    }
}
exports.IpAccessListsError = IpAccessListsError;
/**
 * IP Access List enables admins to configure IP access lists.
 *
 * IP access lists affect web application access and REST API access to this
 * workspace only. If the feature is disabled for a workspace, all access is
 * allowed for this workspace. There is support for allow lists (inclusion) and
 * block lists (exclusion).
 *
 * When a connection is attempted: 1. **First, all block lists are checked.** If
 * the connection IP address matches any block list, the connection is rejected.
 * 2. **If the connection was not rejected by block lists**, the IP address is
 * compared with the allow lists.
 *
 * If there is at least one allow list for the workspace, the connection is
 * allowed only if the IP address matches an allow list. If there are no allow
 * lists for the workspace, all IP addresses are allowed.
 *
 * For all allow lists and block lists combined, the workspace supports a maximum
 * of 1000 IP/CIDR values, where one CIDR counts as a single value.
 *
 * After changes to the IP access list feature, it can take a few minutes for
 * changes to take effect.
 */
class IpAccessListsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/ip-access-lists";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create access list.
     *
     * Creates an IP access list for this workspace.
     *
     * A list can be an allow list or a block list. See the top of this file for
     * a description of how the server treats allow lists and block lists at
     * runtime.
     *
     * When creating or updating an IP access list:
     *
     * * For all allow lists and block lists combined, the API supports a maximum
     * of 1000 IP/CIDR values, where one CIDR counts as a single value. Attempts
     * to exceed that number return error 400 with `error_code` value
     * `QUOTA_EXCEEDED`. * If the new list would block the calling user's current
     * IP, error 400 is returned with `error_code` value `INVALID_STATE`.
     *
     * It can take a few minutes for the changes to take effect. **Note**: Your
     * new IP access list has no effect until you enable the feature. See
     * :method:workspaceconf/setStatus
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/ip-access-lists/${request.ip_access_list_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete access list.
     *
     * Deletes an IP access list, specified by its list ID.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/ip-access-lists/${request.ip_access_list_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get access list.
     *
     * Gets an IP access list, specified by its list ID.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.0/ip-access-lists";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get access lists.
     *
     * Gets all IP access lists for the specified workspace.
     */
    async *list(context) {
        const response = (await this._list(context)).ip_access_lists;
        for (const v of response || []) {
            yield v;
        }
    }
    async _replace(request, context) {
        const path = `/api/2.0/ip-access-lists/${request.ip_access_list_id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace access list.
     *
     * Replaces an IP access list, specified by its ID.
     *
     * A list can include allow lists and block lists. See the top of this file
     * for a description of how the server treats allow lists and block lists at
     * run time. When replacing an IP access list: * For all allow lists and
     * block lists combined, the API supports a maximum of 1000 IP/CIDR values,
     * where one CIDR counts as a single value. Attempts to exceed that number
     * return error 400 with `error_code` value `QUOTA_EXCEEDED`. * If the
     * resulting list would block the calling user's current IP, error 400 is
     * returned with `error_code` value `INVALID_STATE`. It can take a few
     * minutes for the changes to take effect. Note that your resulting IP access
     * list has no effect until you enable the feature. See
     * :method:workspaceconf/setStatus.
     */
    async replace(request, context) {
        return await this._replace(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.0/ip-access-lists/${request.ip_access_list_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update access list.
     *
     * Updates an existing IP access list, specified by its ID.
     *
     * A list can include allow lists and block lists. See the top of this file
     * for a description of how the server treats allow lists and block lists at
     * run time.
     *
     * When updating an IP access list:
     *
     * * For all allow lists and block lists combined, the API supports a maximum
     * of 1000 IP/CIDR values, where one CIDR counts as a single value. Attempts
     * to exceed that number return error 400 with `error_code` value
     * `QUOTA_EXCEEDED`. * If the updated list would block the calling user's
     * current IP, error 400 is returned with `error_code` value `INVALID_STATE`.
     *
     * It can take a few minutes for the changes to take effect. Note that your
     * resulting IP access list has no effect until you enable the feature. See
     * :method:workspaceconf/setStatus.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.IpAccessListsService = IpAccessListsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], IpAccessListsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "_replace", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "replace", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], IpAccessListsService.prototype, "update", null);
//# sourceMappingURL=api.js.map