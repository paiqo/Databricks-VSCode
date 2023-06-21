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
exports.SecretsService = exports.SecretsError = exports.SecretsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class SecretsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Secrets", method, message);
    }
}
exports.SecretsRetriableError = SecretsRetriableError;
class SecretsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Secrets", method, message);
    }
}
exports.SecretsError = SecretsError;
/**
 * The Secrets API allows you to manage secrets, secret scopes, and access
 * permissions.
 *
 * Sometimes accessing data requires that you authenticate to external data
 * sources through JDBC. Instead of directly entering your credentials into a
 * notebook, use Databricks secrets to store your credentials and reference them
 * in notebooks and jobs.
 *
 * Administrators, secret creators, and users granted permission can read
 * Databricks secrets. While Databricks makes an effort to redact secret values
 * that might be displayed in notebooks, it is not possible to prevent such users
 * from reading secrets.
 */
class SecretsService {
    constructor(client) {
        this.client = client;
    }
    async _createScope(request, context) {
        const path = "/api/2.0/secrets/scopes/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new secret scope.
     *
     * The scope name must consist of alphanumeric characters, dashes,
     * underscores, and periods, and may not exceed 128 characters. The maximum
     * number of scopes in a workspace is 100.
     */
    async createScope(request, context) {
        return await this._createScope(request, context);
    }
    async _deleteAcl(request, context) {
        const path = "/api/2.0/secrets/acls/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete an ACL.
     *
     * Deletes the given ACL on the given scope.
     *
     * Users must have the `MANAGE` permission to invoke this API. Throws
     * `RESOURCE_DOES_NOT_EXIST` if no such secret scope, principal, or ACL
     * exists. Throws `PERMISSION_DENIED` if the user does not have permission to
     * make this API call.
     */
    async deleteAcl(request, context) {
        return await this._deleteAcl(request, context);
    }
    async _deleteScope(request, context) {
        const path = "/api/2.0/secrets/scopes/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a secret scope.
     *
     * Deletes a secret scope.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if the scope does not exist. Throws
     * `PERMISSION_DENIED` if the user does not have permission to make this API
     * call.
     */
    async deleteScope(request, context) {
        return await this._deleteScope(request, context);
    }
    async _deleteSecret(request, context) {
        const path = "/api/2.0/secrets/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a secret.
     *
     * Deletes the secret stored in this secret scope. You must have `WRITE` or
     * `MANAGE` permission on the secret scope.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if no such secret scope or secret exists.
     * Throws `PERMISSION_DENIED` if the user does not have permission to make
     * this API call.
     */
    async deleteSecret(request, context) {
        return await this._deleteSecret(request, context);
    }
    async _getAcl(request, context) {
        const path = "/api/2.0/secrets/acls/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get secret ACL details.
     *
     * Gets the details about the given ACL, such as the group and permission.
     * Users must have the `MANAGE` permission to invoke this API.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if no such secret scope exists. Throws
     * `PERMISSION_DENIED` if the user does not have permission to make this API
     * call.
     */
    async getAcl(request, context) {
        return await this._getAcl(request, context);
    }
    async _listAcls(request, context) {
        const path = "/api/2.0/secrets/acls/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Lists ACLs.
     *
     * List the ACLs for a given secret scope. Users must have the `MANAGE`
     * permission to invoke this API.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if no such secret scope exists. Throws
     * `PERMISSION_DENIED` if the user does not have permission to make this API
     * call.
     */
    async *listAcls(request, context) {
        const response = (await this._listAcls(request, context)).items;
        for (const v of response || []) {
            yield v;
        }
    }
    async _listScopes(context) {
        const path = "/api/2.0/secrets/scopes/list";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List all scopes.
     *
     * Lists all secret scopes available in the workspace.
     *
     * Throws `PERMISSION_DENIED` if the user does not have permission to make
     * this API call.
     */
    async *listScopes(context) {
        const response = (await this._listScopes(context)).scopes;
        for (const v of response || []) {
            yield v;
        }
    }
    async _listSecrets(request, context) {
        const path = "/api/2.0/secrets/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List secret keys.
     *
     * Lists the secret keys that are stored at this scope. This is a
     * metadata-only operation; secret data cannot be retrieved using this API.
     * Users need the READ permission to make this call.
     *
     * The lastUpdatedTimestamp returned is in milliseconds since epoch. Throws
     * `RESOURCE_DOES_NOT_EXIST` if no such secret scope exists. Throws
     * `PERMISSION_DENIED` if the user does not have permission to make this API
     * call.
     */
    async *listSecrets(request, context) {
        const response = (await this._listSecrets(request, context)).secrets;
        for (const v of response || []) {
            yield v;
        }
    }
    async _putAcl(request, context) {
        const path = "/api/2.0/secrets/acls/put";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create/update an ACL.
     *
     * Creates or overwrites the Access Control List (ACL) associated with the
     * given principal (user or group) on the specified scope point.
     *
     * In general, a user or group will use the most powerful permission
     * available to them, and permissions are ordered as follows:
     *
     * * `MANAGE` - Allowed to change ACLs, and read and write to this secret
     * scope. * `WRITE` - Allowed to read and write to this secret scope. *
     * `READ` - Allowed to read this secret scope and list what secrets are
     * available.
     *
     * Note that in general, secret values can only be read from within a command
     * on a cluster (for example, through a notebook). There is no API to read
     * the actual secret value material outside of a cluster. However, the user's
     * permission will be applied based on who is executing the command, and they
     * must have at least READ permission.
     *
     * Users must have the `MANAGE` permission to invoke this API.
     *
     * The principal is a user or group name corresponding to an existing
     * Databricks principal to be granted or revoked access.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if no such secret scope exists. Throws
     * `RESOURCE_ALREADY_EXISTS` if a permission for the principal already
     * exists. Throws `INVALID_PARAMETER_VALUE` if the permission is invalid.
     * Throws `PERMISSION_DENIED` if the user does not have permission to make
     * this API call.
     */
    async putAcl(request, context) {
        return await this._putAcl(request, context);
    }
    async _putSecret(request, context) {
        const path = "/api/2.0/secrets/put";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Add a secret.
     *
     * Inserts a secret under the provided scope with the given name. If a secret
     * already exists with the same name, this command overwrites the existing
     * secret's value. The server encrypts the secret using the secret scope's
     * encryption settings before storing it.
     *
     * You must have `WRITE` or `MANAGE` permission on the secret scope. The
     * secret key must consist of alphanumeric characters, dashes, underscores,
     * and periods, and cannot exceed 128 characters. The maximum allowed secret
     * value size is 128 KB. The maximum number of secrets in a given scope is
     * 1000.
     *
     * The input fields "string_value" or "bytes_value" specify the type of the
     * secret, which will determine the value returned when the secret value is
     * requested. Exactly one must be specified.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if no such secret scope exists. Throws
     * `RESOURCE_LIMIT_EXCEEDED` if maximum number of secrets in scope is
     * exceeded. Throws `INVALID_PARAMETER_VALUE` if the key name or value length
     * is invalid. Throws `PERMISSION_DENIED` if the user does not have
     * permission to make this API call.
     */
    async putSecret(request, context) {
        return await this._putSecret(request, context);
    }
}
exports.SecretsService = SecretsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_createScope", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "createScope", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_deleteAcl", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "deleteAcl", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_deleteScope", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "deleteScope", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_deleteSecret", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "deleteSecret", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_getAcl", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "getAcl", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_listAcls", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], SecretsService.prototype, "listAcls", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_listScopes", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], SecretsService.prototype, "listScopes", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_listSecrets", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], SecretsService.prototype, "listSecrets", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_putAcl", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "putAcl", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "_putSecret", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SecretsService.prototype, "putSecret", null);
//# sourceMappingURL=api.js.map