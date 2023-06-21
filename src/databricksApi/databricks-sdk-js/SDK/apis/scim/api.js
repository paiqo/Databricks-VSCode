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
exports.UsersService = exports.UsersError = exports.UsersRetriableError = exports.ServicePrincipalsService = exports.ServicePrincipalsError = exports.ServicePrincipalsRetriableError = exports.GroupsService = exports.GroupsError = exports.GroupsRetriableError = exports.CurrentUserService = exports.CurrentUserError = exports.CurrentUserRetriableError = exports.AccountUsersService = exports.AccountUsersError = exports.AccountUsersRetriableError = exports.AccountServicePrincipalsService = exports.AccountServicePrincipalsError = exports.AccountServicePrincipalsRetriableError = exports.AccountGroupsService = exports.AccountGroupsError = exports.AccountGroupsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class AccountGroupsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("AccountGroups", method, message);
    }
}
exports.AccountGroupsRetriableError = AccountGroupsRetriableError;
class AccountGroupsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("AccountGroups", method, message);
    }
}
exports.AccountGroupsError = AccountGroupsError;
/**
 * Groups simplify identity management, making it easier to assign access to
 * Databricks Account, data, and other securable objects.
 *
 * It is best practice to assign access to workspaces and access-control policies
 * in Unity Catalog to groups, instead of to users individually. All Databricks
 * Account identities can be assigned as members of groups, and members inherit
 * permissions that are assigned to their group.
 */
class AccountGroupsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Groups`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new group.
     *
     * Creates a group in the Databricks Account with a unique name, using the
     * supplied group details.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a group.
     *
     * Deletes a group from the Databricks Account.
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
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get group details.
     *
     * Gets the information for a specific group in the Databricks Account.
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
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Groups`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List group details.
     *
     * Gets all details of the groups associated with the Databricks Account.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).Resources;
        for (const v of response || []) {
            yield v;
        }
    }
    async _patch(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update group details.
     *
     * Partially updates the details of a group.
     */
    async patch(request, context) {
        return await this._patch(request, context);
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace a group.
     *
     * Updates the details of a group by replacing the entire group entity.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.AccountGroupsService = AccountGroupsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], AccountGroupsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "_patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountGroupsService.prototype, "update", null);
class AccountServicePrincipalsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("AccountServicePrincipals", method, message);
    }
}
exports.AccountServicePrincipalsRetriableError = AccountServicePrincipalsRetriableError;
class AccountServicePrincipalsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("AccountServicePrincipals", method, message);
    }
}
exports.AccountServicePrincipalsError = AccountServicePrincipalsError;
/**
 * Identities for use with jobs, automated tools, and systems such as scripts,
 * apps, and CI/CD platforms. Databricks recommends creating service principals
 * to run production jobs or modify production data. If all processes that act on
 * production data run with service principals, interactive users do not need any
 * write, delete, or modify privileges in production. This eliminates the risk of
 * a user overwriting production data by accident.
 */
class AccountServicePrincipalsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/ServicePrincipals`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a service principal.
     *
     * Creates a new service principal in the Databricks Account.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a service principal.
     *
     * Delete a single service principal in the Databricks Account.
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
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get service principal details.
     *
     * Gets the details for a single service principal define in the Databricks
     * Account.
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
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/ServicePrincipals`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List service principals.
     *
     * Gets the set of service principals associated with a Databricks Account.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).Resources;
        for (const v of response || []) {
            yield v;
        }
    }
    async _patch(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update service principal details.
     *
     * Partially updates the details of a single service principal in the
     * Databricks Account.
     */
    async patch(request, context) {
        return await this._patch(request, context);
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace service principal.
     *
     * Updates the details of a single service principal.
     *
     * This action replaces the existing service principal with the same name.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.AccountServicePrincipalsService = AccountServicePrincipalsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], AccountServicePrincipalsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "_patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountServicePrincipalsService.prototype, "update", null);
class AccountUsersRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("AccountUsers", method, message);
    }
}
exports.AccountUsersRetriableError = AccountUsersRetriableError;
class AccountUsersError extends apiError_1.ApiError {
    constructor(method, message) {
        super("AccountUsers", method, message);
    }
}
exports.AccountUsersError = AccountUsersError;
/**
 * User identities recognized by Databricks and represented by email addresses.
 *
 * Databricks recommends using SCIM provisioning to sync users and groups
 * automatically from your identity provider to your Databricks Account. SCIM
 * streamlines onboarding a new employee or team by using your identity provider
 * to create users and groups in Databricks Account and give them the proper
 * level of access. When a user leaves your organization or no longer needs
 * access to Databricks Account, admins can terminate the user in your identity
 * provider and that user’s account will also be removed from Databricks
 * Account. This ensures a consistent offboarding process and prevents
 * unauthorized users from accessing sensitive data.
 */
class AccountUsersService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Users`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new user.
     *
     * Creates a new user in the Databricks Account. This new user will also be
     * added to the Databricks account.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a user.
     *
     * Deletes a user. Deleting a user from a Databricks Account also removes
     * objects associated with the user.
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
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get user details.
     *
     * Gets information for a specific user in Databricks Account.
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
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Users`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List users.
     *
     * Gets details for all the users associated with a Databricks Account.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).Resources;
        for (const v of response || []) {
            yield v;
        }
    }
    async _patch(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update user details.
     *
     * Partially updates a user resource by applying the supplied operations on
     * specific user attributes.
     */
    async patch(request, context) {
        return await this._patch(request, context);
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace a user.
     *
     * Replaces a user's information with the data supplied in request.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.AccountUsersService = AccountUsersService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], AccountUsersService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "_patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountUsersService.prototype, "update", null);
class CurrentUserRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("CurrentUser", method, message);
    }
}
exports.CurrentUserRetriableError = CurrentUserRetriableError;
class CurrentUserError extends apiError_1.ApiError {
    constructor(method, message) {
        super("CurrentUser", method, message);
    }
}
exports.CurrentUserError = CurrentUserError;
/**
 * This API allows retrieving information about currently authenticated user or
 * service principal.
 */
class CurrentUserService {
    constructor(client) {
        this.client = client;
    }
    async _me(context) {
        const path = "/api/2.0/preview/scim/v2/Me";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get current user info.
     *
     * Get details about the current method caller's identity.
     */
    async me(context) {
        return await this._me(context);
    }
}
exports.CurrentUserService = CurrentUserService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], CurrentUserService.prototype, "_me", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], CurrentUserService.prototype, "me", null);
class GroupsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Groups", method, message);
    }
}
exports.GroupsRetriableError = GroupsRetriableError;
class GroupsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Groups", method, message);
    }
}
exports.GroupsError = GroupsError;
/**
 * Groups simplify identity management, making it easier to assign access to
 * Databricks Workspace, data, and other securable objects.
 *
 * It is best practice to assign access to workspaces and access-control policies
 * in Unity Catalog to groups, instead of to users individually. All Databricks
 * Workspace identities can be assigned as members of groups, and members inherit
 * permissions that are assigned to their group.
 */
class GroupsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/preview/scim/v2/Groups";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new group.
     *
     * Creates a group in the Databricks Workspace with a unique name, using the
     * supplied group details.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/preview/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a group.
     *
     * Deletes a group from the Databricks Workspace.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/preview/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get group details.
     *
     * Gets the information for a specific group in the Databricks Workspace.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/preview/scim/v2/Groups";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List group details.
     *
     * Gets all details of the groups associated with the Databricks Workspace.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).Resources;
        for (const v of response || []) {
            yield v;
        }
    }
    async _patch(request, context) {
        const path = `/api/2.0/preview/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update group details.
     *
     * Partially updates the details of a group.
     */
    async patch(request, context) {
        return await this._patch(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.0/preview/scim/v2/Groups/${request.id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace a group.
     *
     * Updates the details of a group by replacing the entire group entity.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.GroupsService = GroupsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], GroupsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "_patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GroupsService.prototype, "update", null);
class ServicePrincipalsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("ServicePrincipals", method, message);
    }
}
exports.ServicePrincipalsRetriableError = ServicePrincipalsRetriableError;
class ServicePrincipalsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("ServicePrincipals", method, message);
    }
}
exports.ServicePrincipalsError = ServicePrincipalsError;
/**
 * Identities for use with jobs, automated tools, and systems such as scripts,
 * apps, and CI/CD platforms. Databricks recommends creating service principals
 * to run production jobs or modify production data. If all processes that act on
 * production data run with service principals, interactive users do not need any
 * write, delete, or modify privileges in production. This eliminates the risk of
 * a user overwriting production data by accident.
 */
class ServicePrincipalsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/preview/scim/v2/ServicePrincipals";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a service principal.
     *
     * Creates a new service principal in the Databricks Workspace.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/preview/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a service principal.
     *
     * Delete a single service principal in the Databricks Workspace.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/preview/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get service principal details.
     *
     * Gets the details for a single service principal define in the Databricks
     * Workspace.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/preview/scim/v2/ServicePrincipals";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List service principals.
     *
     * Gets the set of service principals associated with a Databricks Workspace.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).Resources;
        for (const v of response || []) {
            yield v;
        }
    }
    async _patch(request, context) {
        const path = `/api/2.0/preview/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update service principal details.
     *
     * Partially updates the details of a single service principal in the
     * Databricks Workspace.
     */
    async patch(request, context) {
        return await this._patch(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.0/preview/scim/v2/ServicePrincipals/${request.id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace service principal.
     *
     * Updates the details of a single service principal.
     *
     * This action replaces the existing service principal with the same name.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.ServicePrincipalsService = ServicePrincipalsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ServicePrincipalsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "_patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ServicePrincipalsService.prototype, "update", null);
class UsersRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Users", method, message);
    }
}
exports.UsersRetriableError = UsersRetriableError;
class UsersError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Users", method, message);
    }
}
exports.UsersError = UsersError;
/**
 * User identities recognized by Databricks and represented by email addresses.
 *
 * Databricks recommends using SCIM provisioning to sync users and groups
 * automatically from your identity provider to your Databricks Workspace. SCIM
 * streamlines onboarding a new employee or team by using your identity provider
 * to create users and groups in Databricks Workspace and give them the proper
 * level of access. When a user leaves your organization or no longer needs
 * access to Databricks Workspace, admins can terminate the user in your identity
 * provider and that user’s account will also be removed from Databricks
 * Workspace. This ensures a consistent offboarding process and prevents
 * unauthorized users from accessing sensitive data.
 */
class UsersService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/preview/scim/v2/Users";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new user.
     *
     * Creates a new user in the Databricks Workspace. This new user will also be
     * added to the Databricks account.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.0/preview/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a user.
     *
     * Deletes a user. Deleting a user from a Databricks Workspace also removes
     * objects associated with the user.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.0/preview/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get user details.
     *
     * Gets information for a specific user in Databricks Workspace.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/preview/scim/v2/Users";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List users.
     *
     * Gets details for all the users associated with a Databricks Workspace.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).Resources;
        for (const v of response || []) {
            yield v;
        }
    }
    async _patch(request, context) {
        const path = `/api/2.0/preview/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update user details.
     *
     * Partially updates a user resource by applying the supplied operations on
     * specific user attributes.
     */
    async patch(request, context) {
        return await this._patch(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.0/preview/scim/v2/Users/${request.id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace a user.
     *
     * Replaces a user's information with the data supplied in request.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.UsersService = UsersService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], UsersService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "_patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "patch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "update", null);
//# sourceMappingURL=api.js.map