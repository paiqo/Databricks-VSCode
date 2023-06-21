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
exports.TablesService = exports.TablesError = exports.TablesRetriableError = exports.TableConstraintsService = exports.TableConstraintsError = exports.TableConstraintsRetriableError = exports.StorageCredentialsService = exports.StorageCredentialsError = exports.StorageCredentialsRetriableError = exports.SharesService = exports.SharesError = exports.SharesRetriableError = exports.SchemasService = exports.SchemasError = exports.SchemasRetriableError = exports.RecipientsService = exports.RecipientsError = exports.RecipientsRetriableError = exports.RecipientActivationService = exports.RecipientActivationError = exports.RecipientActivationRetriableError = exports.ProvidersService = exports.ProvidersError = exports.ProvidersRetriableError = exports.MetastoresService = exports.MetastoresError = exports.MetastoresRetriableError = exports.GrantsService = exports.GrantsError = exports.GrantsRetriableError = exports.FunctionsService = exports.FunctionsError = exports.FunctionsRetriableError = exports.ExternalLocationsService = exports.ExternalLocationsError = exports.ExternalLocationsRetriableError = exports.CatalogsService = exports.CatalogsError = exports.CatalogsRetriableError = exports.AccountStorageCredentialsService = exports.AccountStorageCredentialsError = exports.AccountStorageCredentialsRetriableError = exports.AccountMetastoresService = exports.AccountMetastoresError = exports.AccountMetastoresRetriableError = exports.AccountMetastoreAssignmentsService = exports.AccountMetastoreAssignmentsError = exports.AccountMetastoreAssignmentsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class AccountMetastoreAssignmentsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("AccountMetastoreAssignments", method, message);
    }
}
exports.AccountMetastoreAssignmentsRetriableError = AccountMetastoreAssignmentsRetriableError;
class AccountMetastoreAssignmentsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("AccountMetastoreAssignments", method, message);
    }
}
exports.AccountMetastoreAssignmentsError = AccountMetastoreAssignmentsError;
/**
 * These APIs manage metastore assignments to a workspace.
 */
class AccountMetastoreAssignmentsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/metastores/${request.metastore_id}`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Assigns a workspace to a metastore.
     *
     * Creates an assignment to a metastore for a workspace
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
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/metastores/${request.metastore_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a metastore assignment.
     *
     * Deletes a metastore assignment to a workspace, leaving the workspace with
     * no metastore.
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
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/metastore`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Gets the metastore assignment for a workspace.
     *
     * Gets the metastore assignment, if any, for the workspace specified by ID.
     * If the workspace is assigned a metastore, the mappig will be returned. If
     * no metastore is assigned to the workspace, the assignment will not be
     * found and a 404 returned.
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
        const path = `/api/2.0/accounts/${config.accountId}/metastores/${request.metastore_id}/workspaces`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get all workspaces assigned to a metastore.
     *
     * Gets a list of all Databricks workspace IDs that have been assigned to
     * given metastore.
     */
    async list(request, context) {
        return await this._list(request, context);
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}/metastores/${request.metastore_id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Updates a metastore assignment to a workspaces.
     *
     * Updates an assignment to a metastore for a workspace. Currently, only the
     * default catalog may be updated
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.AccountMetastoreAssignmentsService = AccountMetastoreAssignmentsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoreAssignmentsService.prototype, "update", null);
class AccountMetastoresRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("AccountMetastores", method, message);
    }
}
exports.AccountMetastoresRetriableError = AccountMetastoresRetriableError;
class AccountMetastoresError extends apiError_1.ApiError {
    constructor(method, message) {
        super("AccountMetastores", method, message);
    }
}
exports.AccountMetastoresError = AccountMetastoresError;
/**
 * These APIs manage Unity Catalog metastores for an account. A metastore
 * contains catalogs that can be associated with workspaces
 */
class AccountMetastoresService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/metastores`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create metastore.
     *
     * Creates a Unity Catalog metastore.
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
        const path = `/api/2.0/accounts/${config.accountId}/metastores/${request.metastore_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a metastore.
     *
     * Deletes a Databricks Unity Catalog metastore for an account, both
     * specified by ID.
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
        const path = `/api/2.0/accounts/${config.accountId}/metastores/${request.metastore_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a metastore.
     *
     * Gets a Databricks Unity Catalog metastore from an account, both specified
     * by ID.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/metastores`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all metastores associated with an account.
     *
     * Gets all Unity Catalog metastores associated with an account specified by
     * ID.
     */
    async list(context) {
        return await this._list(context);
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/metastores/${request.metastore_id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Update a metastore.
     *
     * Updates an existing Unity Catalog metastore.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.AccountMetastoresService = AccountMetastoresService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountMetastoresService.prototype, "update", null);
class AccountStorageCredentialsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("AccountStorageCredentials", method, message);
    }
}
exports.AccountStorageCredentialsRetriableError = AccountStorageCredentialsRetriableError;
class AccountStorageCredentialsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("AccountStorageCredentials", method, message);
    }
}
exports.AccountStorageCredentialsError = AccountStorageCredentialsError;
/**
 * These APIs manage storage credentials for a particular metastore.
 */
class AccountStorageCredentialsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/metastores/${request.metastore_id}/storage-credentials`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a storage credential.
     *
     * Creates a new storage credential. The request object is specific to the
     * cloud:
     *
     * * **AwsIamRole** for AWS credentials * **AzureServicePrincipal** for Azure
     * credentials * **GcpServiceAcountKey** for GCP credentials.
     *
     * The caller must be a metastore admin and have the
     * **CREATE_STORAGE_CREDENTIAL** privilege on the metastore.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _get(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/metastores/${request.metastore_id}/storage-credentials/`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Gets the named storage credential.
     *
     * Gets a storage credential from the metastore. The caller must be a
     * metastore admin, the owner of the storage credential, or have a level of
     * privilege on the storage credential.
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
        const path = `/api/2.0/accounts/${config.accountId}/metastores/${request.metastore_id}/storage-credentials`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get all storage credentials assigned to a metastore.
     *
     * Gets a list of all storage credentials that have been assigned to given
     * metastore.
     */
    async list(request, context) {
        return await this._list(request, context);
    }
}
exports.AccountStorageCredentialsService = AccountStorageCredentialsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountStorageCredentialsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountStorageCredentialsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountStorageCredentialsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountStorageCredentialsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountStorageCredentialsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], AccountStorageCredentialsService.prototype, "list", null);
class CatalogsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Catalogs", method, message);
    }
}
exports.CatalogsRetriableError = CatalogsRetriableError;
class CatalogsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Catalogs", method, message);
    }
}
exports.CatalogsError = CatalogsError;
/**
 * A catalog is the first layer of Unity Catalog’s three-level namespace.
 * It’s used to organize your data assets. Users can see all catalogs on which
 * they have been assigned the USE_CATALOG data permission.
 *
 * In Unity Catalog, admins and data stewards manage users and their access to
 * data centrally across all of the workspaces in a Databricks account. Users in
 * different workspaces can share access to the same data, depending on
 * privileges granted centrally in Unity Catalog.
 */
class CatalogsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/catalogs";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a catalog.
     *
     * Creates a new catalog instance in the parent metastore if the caller is a
     * metastore admin or has the **CREATE_CATALOG** privilege.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/catalogs/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a catalog.
     *
     * Deletes the catalog that matches the supplied name. The caller must be a
     * metastore admin or the owner of the catalog.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/catalogs/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a catalog.
     *
     * Gets the specified catalog in a metastore. The caller must be a metastore
     * admin, the owner of the catalog, or a user that has the **USE_CATALOG**
     * privilege set for their account.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.1/unity-catalog/catalogs";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List catalogs.
     *
     * Gets an array of catalogs in the metastore. If the caller is the metastore
     * admin, all catalogs will be retrieved. Otherwise, only catalogs owned by
     * the caller (or for which the caller has the **USE_CATALOG** privilege)
     * will be retrieved. There is no guarantee of a specific ordering of the
     * elements in the array.
     */
    async *list(context) {
        const response = (await this._list(context)).catalogs;
        for (const v of response || []) {
            yield v;
        }
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/catalogs/${request.name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a catalog.
     *
     * Updates the catalog that matches the supplied name. The caller must be
     * either the owner of the catalog, or a metastore admin (when changing the
     * owner field of the catalog).
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.CatalogsService = CatalogsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], CatalogsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CatalogsService.prototype, "update", null);
class ExternalLocationsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("ExternalLocations", method, message);
    }
}
exports.ExternalLocationsRetriableError = ExternalLocationsRetriableError;
class ExternalLocationsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("ExternalLocations", method, message);
    }
}
exports.ExternalLocationsError = ExternalLocationsError;
/**
 * An external location is an object that combines a cloud storage path with a
 * storage credential that authorizes access to the cloud storage path. Each
 * external location is subject to Unity Catalog access-control policies that
 * control which users and groups can access the credential. If a user does not
 * have access to an external location in Unity Catalog, the request fails and
 * Unity Catalog does not attempt to authenticate to your cloud tenant on the
 * user’s behalf.
 *
 * Databricks recommends using external locations rather than using storage
 * credentials directly.
 *
 * To create external locations, you must be a metastore admin or a user with the
 * **CREATE_EXTERNAL_LOCATION** privilege.
 */
class ExternalLocationsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/external-locations";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create an external location.
     *
     * Creates a new external location entry in the metastore. The caller must be
     * a metastore admin or have the **CREATE_EXTERNAL_LOCATION** privilege on
     * both the metastore and the associated storage credential.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/external-locations/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete an external location.
     *
     * Deletes the specified external location from the metastore. The caller
     * must be the owner of the external location.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/external-locations/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get an external location.
     *
     * Gets an external location from the metastore. The caller must be either a
     * metastore admin, the owner of the external location, or a user that has
     * some privilege on the external location.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.1/unity-catalog/external-locations";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List external locations.
     *
     * Gets an array of external locations (__ExternalLocationInfo__ objects)
     * from the metastore. The caller must be a metastore admin, the owner of the
     * external location, or a user that has some privilege on the external
     * location. There is no guarantee of a specific ordering of the elements in
     * the array.
     */
    async *list(context) {
        const response = (await this._list(context)).external_locations;
        for (const v of response || []) {
            yield v;
        }
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/external-locations/${request.name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update an external location.
     *
     * Updates an external location in the metastore. The caller must be the
     * owner of the external location, or be a metastore admin. In the second
     * case, the admin can only update the name of the external location.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.ExternalLocationsService = ExternalLocationsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], ExternalLocationsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExternalLocationsService.prototype, "update", null);
class FunctionsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Functions", method, message);
    }
}
exports.FunctionsRetriableError = FunctionsRetriableError;
class FunctionsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Functions", method, message);
    }
}
exports.FunctionsError = FunctionsError;
/**
 * Functions implement User-Defined Functions (UDFs) in Unity Catalog.
 *
 * The function implementation can be any SQL expression or Query, and it can be
 * invoked wherever a table reference is allowed in a query. In Unity Catalog, a
 * function resides at the same level as a table, so it can be referenced with
 * the form __catalog_name__.__schema_name__.__function_name__.
 */
class FunctionsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/functions";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a function.
     *
     * Creates a new function
     *
     * The user must have the following permissions in order for the function to
     * be created: - **USE_CATALOG** on the function's parent catalog -
     * **USE_SCHEMA** and **CREATE_FUNCTION** on the function's parent schema
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/functions/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a function.
     *
     * Deletes the function that matches the supplied name. For the deletion to
     * succeed, the user must satisfy one of the following conditions: - Is the
     * owner of the function's parent catalog - Is the owner of the function's
     * parent schema and have the **USE_CATALOG** privilege on its parent catalog
     * - Is the owner of the function itself and have both the **USE_CATALOG**
     * privilege on its parent catalog and the **USE_SCHEMA** privilege on its
     * parent schema
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/functions/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a function.
     *
     * Gets a function from within a parent catalog and schema. For the fetch to
     * succeed, the user must satisfy one of the following requirements: - Is a
     * metastore admin - Is an owner of the function's parent catalog - Have the
     * **USE_CATALOG** privilege on the function's parent catalog and be the
     * owner of the function - Have the **USE_CATALOG** privilege on the
     * function's parent catalog, the **USE_SCHEMA** privilege on the function's
     * parent schema, and the **EXECUTE** privilege on the function itself
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.1/unity-catalog/functions";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List functions.
     *
     * List functions within the specified parent catalog and schema. If the user
     * is a metastore admin, all functions are returned in the output list.
     * Otherwise, the user must have the **USE_CATALOG** privilege on the catalog
     * and the **USE_SCHEMA** privilege on the schema, and the output list
     * contains only functions for which either the user has the **EXECUTE**
     * privilege or the user is the owner. There is no guarantee of a specific
     * ordering of the elements in the array.
     */
    async list(request, context) {
        return await this._list(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/functions/${request.name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a function.
     *
     * Updates the function that matches the supplied name. Only the owner of the
     * function can be updated. If the user is not a metastore admin, the user
     * must be a member of the group that is the new function owner. - Is a
     * metastore admin - Is the owner of the function's parent catalog - Is the
     * owner of the function's parent schema and has the **USE_CATALOG**
     * privilege on its parent catalog - Is the owner of the function itself and
     * has the **USE_CATALOG** privilege on its parent catalog as well as the
     * **USE_SCHEMA** privilege on the function's parent schema.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.FunctionsService = FunctionsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], FunctionsService.prototype, "update", null);
class GrantsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Grants", method, message);
    }
}
exports.GrantsRetriableError = GrantsRetriableError;
class GrantsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Grants", method, message);
    }
}
exports.GrantsError = GrantsError;
/**
 * In Unity Catalog, data is secure by default. Initially, users have no access
 * to data in a metastore. Access can be granted by either a metastore admin, the
 * owner of an object, or the owner of the catalog or schema that contains the
 * object. Securable objects in Unity Catalog are hierarchical and privileges are
 * inherited downward.
 *
 * Securable objects in Unity Catalog are hierarchical and privileges are
 * inherited downward. This means that granting a privilege on the catalog
 * automatically grants the privilege to all current and future objects within
 * the catalog. Similarly, privileges granted on a schema are inherited by all
 * current and future objects within that schema.
 */
class GrantsService {
    constructor(client) {
        this.client = client;
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/permissions/${request.securable_type}/${request.full_name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get permissions.
     *
     * Gets the permissions for a securable.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _getEffective(request, context) {
        const path = `/api/2.1/unity-catalog/effective-permissions/${request.securable_type}/${request.full_name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get effective permissions.
     *
     * Gets the effective permissions for a securable.
     */
    async getEffective(request, context) {
        return await this._getEffective(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/permissions/${request.securable_type}/${request.full_name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update permissions.
     *
     * Updates the permissions for a securable.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.GrantsService = GrantsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GrantsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GrantsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GrantsService.prototype, "_getEffective", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GrantsService.prototype, "getEffective", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GrantsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], GrantsService.prototype, "update", null);
class MetastoresRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Metastores", method, message);
    }
}
exports.MetastoresRetriableError = MetastoresRetriableError;
class MetastoresError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Metastores", method, message);
    }
}
exports.MetastoresError = MetastoresError;
/**
 * A metastore is the top-level container of objects in Unity Catalog. It stores
 * data assets (tables and views) and the permissions that govern access to them.
 * Databricks account admins can create metastores and assign them to Databricks
 * workspaces to control which workloads use each metastore. For a workspace to
 * use Unity Catalog, it must have a Unity Catalog metastore attached.
 *
 * Each metastore is configured with a root storage location in a cloud storage
 * account. This storage location is used for metadata and managed tables data.
 *
 * NOTE: This metastore is distinct from the metastore included in Databricks
 * workspaces created before Unity Catalog was released. If your workspace
 * includes a legacy Hive metastore, the data in that metastore is available in a
 * catalog named hive_metastore.
 */
class MetastoresService {
    constructor(client) {
        this.client = client;
    }
    async _assign(request, context) {
        const path = `/api/2.1/unity-catalog/workspaces/${request.workspace_id}/metastore`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Create an assignment.
     *
     * Creates a new metastore assignment. If an assignment for the same
     * __workspace_id__ exists, it will be overwritten by the new
     * __metastore_id__ and __default_catalog_name__. The caller must be an
     * account admin.
     */
    async assign(request, context) {
        return await this._assign(request, context);
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/metastores";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a metastore.
     *
     * Creates a new metastore based on a provided name and storage root path.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _current(context) {
        const path = "/api/2.1/unity-catalog/current-metastore-assignment";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get metastore assignment for workspace.
     *
     * Gets the metastore assignment for the workspace being accessed.
     */
    async current(context) {
        return await this._current(context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/metastores/${request.id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a metastore.
     *
     * Deletes a metastore. The caller must be a metastore admin.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/metastores/${request.id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a metastore.
     *
     * Gets a metastore that matches the supplied ID. The caller must be a
     * metastore admin to retrieve this info.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.1/unity-catalog/metastores";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List metastores.
     *
     * Gets an array of the available metastores (as __MetastoreInfo__ objects).
     * The caller must be an admin to retrieve this info. There is no guarantee
     * of a specific ordering of the elements in the array.
     */
    async *list(context) {
        const response = (await this._list(context)).metastores;
        for (const v of response || []) {
            yield v;
        }
    }
    async _summary(context) {
        const path = "/api/2.1/unity-catalog/metastore_summary";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get a metastore summary.
     *
     * Gets information about a metastore. This summary includes the storage
     * credential, the cloud vendor, the cloud region, and the global metastore
     * ID.
     */
    async summary(context) {
        return await this._summary(context);
    }
    async _unassign(request, context) {
        const path = `/api/2.1/unity-catalog/workspaces/${request.workspace_id}/metastore`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete an assignment.
     *
     * Deletes a metastore assignment. The caller must be an account
     * administrator.
     */
    async unassign(request, context) {
        return await this._unassign(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/metastores/${request.id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a metastore.
     *
     * Updates information for a specific metastore. The caller must be a
     * metastore admin.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
    async _updateAssignment(request, context) {
        const path = `/api/2.1/unity-catalog/workspaces/${request.workspace_id}/metastore`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update an assignment.
     *
     * Updates a metastore assignment. This operation can be used to update
     * __metastore_id__ or __default_catalog_name__ for a specified Workspace, if
     * the Workspace is already assigned a metastore. The caller must be an
     * account admin to update __metastore_id__; otherwise, the caller can be a
     * Workspace admin.
     */
    async updateAssignment(request, context) {
        return await this._updateAssignment(request, context);
    }
}
exports.MetastoresService = MetastoresService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_assign", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "assign", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_current", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "current", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], MetastoresService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_summary", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "summary", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_unassign", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "unassign", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "_updateAssignment", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MetastoresService.prototype, "updateAssignment", null);
class ProvidersRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Providers", method, message);
    }
}
exports.ProvidersRetriableError = ProvidersRetriableError;
class ProvidersError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Providers", method, message);
    }
}
exports.ProvidersError = ProvidersError;
/**
 * Databricks Delta Sharing: Providers REST API
 */
class ProvidersService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/providers";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create an auth provider.
     *
     * Creates a new authentication provider minimally based on a name and
     * authentication type. The caller must be an admin on the metastore.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/providers/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a provider.
     *
     * Deletes an authentication provider, if the caller is a metastore admin or
     * is the owner of the provider.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/providers/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a provider.
     *
     * Gets a specific authentication provider. The caller must supply the name
     * of the provider, and must either be a metastore admin or the owner of the
     * provider.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.1/unity-catalog/providers";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List providers.
     *
     * Gets an array of available authentication providers. The caller must
     * either be a metastore admin or the owner of the providers. Providers not
     * owned by the caller are not included in the response. There is no
     * guarantee of a specific ordering of the elements in the array.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).providers;
        for (const v of response || []) {
            yield v;
        }
    }
    async _listShares(request, context) {
        const path = `/api/2.1/unity-catalog/providers/${request.name}/shares`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List shares by Provider.
     *
     * Gets an array of a specified provider's shares within the metastore where:
     *
     * * the caller is a metastore admin, or * the caller is the owner.
     */
    async listShares(request, context) {
        return await this._listShares(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/providers/${request.name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a provider.
     *
     * Updates the information for an authentication provider, if the caller is a
     * metastore admin or is the owner of the provider. If the update changes the
     * provider name, the caller must be both a metastore admin and the owner of
     * the provider.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.ProvidersService = ProvidersService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ProvidersService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "_listShares", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "listShares", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ProvidersService.prototype, "update", null);
class RecipientActivationRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("RecipientActivation", method, message);
    }
}
exports.RecipientActivationRetriableError = RecipientActivationRetriableError;
class RecipientActivationError extends apiError_1.ApiError {
    constructor(method, message) {
        super("RecipientActivation", method, message);
    }
}
exports.RecipientActivationError = RecipientActivationError;
/**
 * Databricks Delta Sharing: Recipient Activation REST API
 */
class RecipientActivationService {
    constructor(client) {
        this.client = client;
    }
    async _getActivationUrlInfo(request, context) {
        const path = `/api/2.1/unity-catalog/public/data_sharing_activation_info/${request.activation_url}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a share activation URL.
     *
     * Gets an activation URL for a share.
     */
    async getActivationUrlInfo(request, context) {
        return await this._getActivationUrlInfo(request, context);
    }
    async _retrieveToken(request, context) {
        const path = `/api/2.1/unity-catalog/public/data_sharing_activation/${request.activation_url}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get an access token.
     *
     * Retrieve access token with an activation url. This is a public API without
     * any authentication.
     */
    async retrieveToken(request, context) {
        return await this._retrieveToken(request, context);
    }
}
exports.RecipientActivationService = RecipientActivationService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientActivationService.prototype, "_getActivationUrlInfo", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientActivationService.prototype, "getActivationUrlInfo", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientActivationService.prototype, "_retrieveToken", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientActivationService.prototype, "retrieveToken", null);
class RecipientsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Recipients", method, message);
    }
}
exports.RecipientsRetriableError = RecipientsRetriableError;
class RecipientsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Recipients", method, message);
    }
}
exports.RecipientsError = RecipientsError;
/**
 * Databricks Delta Sharing: Recipients REST API
 */
class RecipientsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/recipients";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a share recipient.
     *
     * Creates a new recipient with the delta sharing authentication type in the
     * metastore. The caller must be a metastore admin or has the
     * **CREATE_RECIPIENT** privilege on the metastore.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/recipients/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a share recipient.
     *
     * Deletes the specified recipient from the metastore. The caller must be the
     * owner of the recipient.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/recipients/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a share recipient.
     *
     * Gets a share recipient from the metastore if:
     *
     * * the caller is the owner of the share recipient, or: * is a metastore
     * admin
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.1/unity-catalog/recipients";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List share recipients.
     *
     * Gets an array of all share recipients within the current metastore where:
     *
     * * the caller is a metastore admin, or * the caller is the owner. There is
     * no guarantee of a specific ordering of the elements in the array.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).recipients;
        for (const v of response || []) {
            yield v;
        }
    }
    async _rotateToken(request, context) {
        const path = `/api/2.1/unity-catalog/recipients/${request.name}/rotate-token`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Rotate a token.
     *
     * Refreshes the specified recipient's delta sharing authentication token
     * with the provided token info. The caller must be the owner of the
     * recipient.
     */
    async rotateToken(request, context) {
        return await this._rotateToken(request, context);
    }
    async _sharePermissions(request, context) {
        const path = `/api/2.1/unity-catalog/recipients/${request.name}/share-permissions`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get recipient share permissions.
     *
     * Gets the share permissions for the specified Recipient. The caller must be
     * a metastore admin or the owner of the Recipient.
     */
    async sharePermissions(request, context) {
        return await this._sharePermissions(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/recipients/${request.name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a share recipient.
     *
     * Updates an existing recipient in the metastore. The caller must be a
     * metastore admin or the owner of the recipient. If the recipient name will
     * be updated, the user must be both a metastore admin and the owner of the
     * recipient.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.RecipientsService = RecipientsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], RecipientsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "_rotateToken", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "rotateToken", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "_sharePermissions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "sharePermissions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RecipientsService.prototype, "update", null);
class SchemasRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Schemas", method, message);
    }
}
exports.SchemasRetriableError = SchemasRetriableError;
class SchemasError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Schemas", method, message);
    }
}
exports.SchemasError = SchemasError;
/**
 * A schema (also called a database) is the second layer of Unity Catalog’s
 * three-level namespace. A schema organizes tables, views and functions. To
 * access (or list) a table or view in a schema, users must have the USE_SCHEMA
 * data permission on the schema and its parent catalog, and they must have the
 * SELECT permission on the table or view.
 */
class SchemasService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/schemas";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a schema.
     *
     * Creates a new schema for catalog in the Metatastore. The caller must be a
     * metastore admin, or have the **CREATE_SCHEMA** privilege in the parent
     * catalog.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/schemas/${request.full_name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a schema.
     *
     * Deletes the specified schema from the parent catalog. The caller must be
     * the owner of the schema or an owner of the parent catalog.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/schemas/${request.full_name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a schema.
     *
     * Gets the specified schema within the metastore. The caller must be a
     * metastore admin, the owner of the schema, or a user that has the
     * **USE_SCHEMA** privilege on the schema.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.1/unity-catalog/schemas";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List schemas.
     *
     * Gets an array of schemas for a catalog in the metastore. If the caller is
     * the metastore admin or the owner of the parent catalog, all schemas for
     * the catalog will be retrieved. Otherwise, only schemas owned by the caller
     * (or for which the caller has the **USE_SCHEMA** privilege) will be
     * retrieved. There is no guarantee of a specific ordering of the elements in
     * the array.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).schemas;
        for (const v of response || []) {
            yield v;
        }
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/schemas/${request.full_name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a schema.
     *
     * Updates a schema for a catalog. The caller must be the owner of the schema
     * or a metastore admin. If the caller is a metastore admin, only the
     * __owner__ field can be changed in the update. If the __name__ field must
     * be updated, the caller must be a metastore admin or have the
     * **CREATE_SCHEMA** privilege on the parent catalog.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.SchemasService = SchemasService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], SchemasService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SchemasService.prototype, "update", null);
class SharesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Shares", method, message);
    }
}
exports.SharesRetriableError = SharesRetriableError;
class SharesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Shares", method, message);
    }
}
exports.SharesError = SharesError;
/**
 * Databricks Delta Sharing: Shares REST API
 */
class SharesService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/shares";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a share.
     *
     * Creates a new share for data objects. Data objects can be added at this
     * time or after creation with **update**. The caller must be a metastore
     * admin or have the **CREATE_SHARE** privilege on the metastore.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/shares/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a share.
     *
     * Deletes a data object share from the metastore. The caller must be an
     * owner of the share.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/shares/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a share.
     *
     * Gets a data object share from the metastore. The caller must be a
     * metastore admin or the owner of the share.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.1/unity-catalog/shares";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List shares.
     *
     * Gets an array of data object shares from the metastore. The caller must be
     * a metastore admin or the owner of the share. There is no guarantee of a
     * specific ordering of the elements in the array.
     */
    async *list(context) {
        const response = (await this._list(context)).shares;
        for (const v of response || []) {
            yield v;
        }
    }
    async _sharePermissions(request, context) {
        const path = `/api/2.1/unity-catalog/shares/${request.name}/permissions`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get permissions.
     *
     * Gets the permissions for a data share from the metastore. The caller must
     * be a metastore admin or the owner of the share.
     */
    async sharePermissions(request, context) {
        return await this._sharePermissions(request, context);
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/shares/${request.name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a share.
     *
     * Updates the share with the changes and data objects in the request. The
     * caller must be the owner of the share or a metastore admin.
     *
     * When the caller is a metastore admin, only the __owner__ field can be
     * updated.
     *
     * In the case that the share name is changed, **updateShare** requires that
     * the caller is both the share owner and a metastore admin.
     *
     * For each table that is added through this method, the share owner must
     * also have **SELECT** privilege on the table. This privilege must be
     * maintained indefinitely for recipients to be able to access the table.
     * Typically, you should use a group as the share owner.
     *
     * Table removals through **update** do not require additional privileges.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
    async _updatePermissions(request, context) {
        const path = `/api/2.1/unity-catalog/shares/${request.name}/permissions`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update permissions.
     *
     * Updates the permissions for a data share in the metastore. The caller must
     * be a metastore admin or an owner of the share.
     *
     * For new recipient grants, the user must also be the owner of the
     * recipients. recipient revocations do not require additional privileges.
     */
    async updatePermissions(request, context) {
        return await this._updatePermissions(request, context);
    }
}
exports.SharesService = SharesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], SharesService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "_sharePermissions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "sharePermissions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "_updatePermissions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], SharesService.prototype, "updatePermissions", null);
class StorageCredentialsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("StorageCredentials", method, message);
    }
}
exports.StorageCredentialsRetriableError = StorageCredentialsRetriableError;
class StorageCredentialsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("StorageCredentials", method, message);
    }
}
exports.StorageCredentialsError = StorageCredentialsError;
/**
 * A storage credential represents an authentication and authorization mechanism
 * for accessing data stored on your cloud tenant. Each storage credential is
 * subject to Unity Catalog access-control policies that control which users and
 * groups can access the credential. If a user does not have access to a storage
 * credential in Unity Catalog, the request fails and Unity Catalog does not
 * attempt to authenticate to your cloud tenant on the user’s behalf.
 *
 * Databricks recommends using external locations rather than using storage
 * credentials directly.
 *
 * To create storage credentials, you must be a Databricks account admin. The
 * account admin who creates the storage credential can delegate ownership to
 * another user or group to manage permissions on it.
 */
class StorageCredentialsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/storage-credentials";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a storage credential.
     *
     * Creates a new storage credential. The request object is specific to the
     * cloud:
     *
     * * **AwsIamRole** for AWS credentials * **AzureServicePrincipal** for Azure
     * credentials * **GcpServiceAcountKey** for GCP credentials.
     *
     * The caller must be a metastore admin and have the
     * **CREATE_STORAGE_CREDENTIAL** privilege on the metastore.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/storage-credentials/${request.name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a credential.
     *
     * Deletes a storage credential from the metastore. The caller must be an
     * owner of the storage credential.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/storage-credentials/${request.name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a credential.
     *
     * Gets a storage credential from the metastore. The caller must be a
     * metastore admin, the owner of the storage credential, or have some
     * permission on the storage credential.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(context) {
        const path = "/api/2.1/unity-catalog/storage-credentials";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List credentials.
     *
     * Gets an array of storage credentials (as __StorageCredentialInfo__
     * objects). The array is limited to only those storage credentials the
     * caller has permission to access. If the caller is a metastore admin, all
     * storage credentials will be retrieved. There is no guarantee of a specific
     * ordering of the elements in the array.
     */
    async list(context) {
        return await this._list(context);
    }
    async _update(request, context) {
        const path = `/api/2.1/unity-catalog/storage-credentials/${request.name}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a credential.
     *
     * Updates a storage credential on the metastore. The caller must be the
     * owner of the storage credential or a metastore admin. If the caller is a
     * metastore admin, only the __owner__ credential can be changed.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
    async _validate(request, context) {
        const path = "/api/2.1/unity-catalog/validate-storage-credentials";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Validate a storage credential.
     *
     * Validates a storage credential. At least one of __external_location_name__
     * and __url__ need to be provided. If only one of them is provided, it will
     * be used for validation. And if both are provided, the __url__ will be used
     * for validation, and __external_location_name__ will be ignored when
     * checking overlapping urls.
     *
     * Either the __storage_credential_name__ or the cloud-specific credential
     * must be provided.
     *
     * The caller must be a metastore admin or the storage credential owner or
     * have the **CREATE_EXTERNAL_LOCATION** privilege on the metastore and the
     * storage credential.
     */
    async validate(request, context) {
        return await this._validate(request, context);
    }
}
exports.StorageCredentialsService = StorageCredentialsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "_validate", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageCredentialsService.prototype, "validate", null);
class TableConstraintsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("TableConstraints", method, message);
    }
}
exports.TableConstraintsRetriableError = TableConstraintsRetriableError;
class TableConstraintsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("TableConstraints", method, message);
    }
}
exports.TableConstraintsError = TableConstraintsError;
/**
 * Primary key and foreign key constraints encode relationships between fields in
 * tables.
 *
 * Primary and foreign keys are informational only and are not enforced. Foreign
 * keys must reference a primary key in another table. This primary key is the
 * parent constraint of the foreign key and the table this primary key is on is
 * the parent table of the foreign key. Similarly, the foreign key is the child
 * constraint of its referenced primary key; the table of the foreign key is the
 * child table of the primary key.
 *
 * You can declare primary keys and foreign keys as part of the table
 * specification during table creation. You can also add or drop constraints on
 * existing tables.
 */
class TableConstraintsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.1/unity-catalog/constraints";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a table constraint.
     *
     * Creates a new table constraint.
     *
     * For the table constraint creation to succeed, the user must satisfy both
     * of these conditions: - the user must have the **USE_CATALOG** privilege on
     * the table's parent catalog, the **USE_SCHEMA** privilege on the table's
     * parent schema, and be the owner of the table. - if the new constraint is a
     * __ForeignKeyConstraint__, the user must have the **USE_CATALOG** privilege
     * on the referenced parent table's catalog, the **USE_SCHEMA** privilege on
     * the referenced parent table's schema, and be the owner of the referenced
     * parent table.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/constraints/${request.full_name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a table constraint.
     *
     * Deletes a table constraint.
     *
     * For the table constraint deletion to succeed, the user must satisfy both
     * of these conditions: - the user must have the **USE_CATALOG** privilege on
     * the table's parent catalog, the **USE_SCHEMA** privilege on the table's
     * parent schema, and be the owner of the table. - if __cascade__ argument is
     * **true**, the user must have the following permissions on all of the child
     * tables: the **USE_CATALOG** privilege on the table's catalog, the
     * **USE_SCHEMA** privilege on the table's schema, and be the owner of the
     * table.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
}
exports.TableConstraintsService = TableConstraintsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TableConstraintsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TableConstraintsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TableConstraintsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TableConstraintsService.prototype, "delete", null);
class TablesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Tables", method, message);
    }
}
exports.TablesRetriableError = TablesRetriableError;
class TablesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Tables", method, message);
    }
}
exports.TablesError = TablesError;
/**
 * A table resides in the third layer of Unity Catalog’s three-level namespace.
 * It contains rows of data. To create a table, users must have CREATE_TABLE and
 * USE_SCHEMA permissions on the schema, and they must have the USE_CATALOG
 * permission on its parent catalog. To query a table, users must have the SELECT
 * permission on the table, and they must have the USE_CATALOG permission on its
 * parent catalog and the USE_SCHEMA permission on its parent schema.
 *
 * A table can be managed or external. From an API perspective, a __VIEW__ is a
 * particular kind of table (rather than a managed or external table).
 */
class TablesService {
    constructor(client) {
        this.client = client;
    }
    async _delete(request, context) {
        const path = `/api/2.1/unity-catalog/tables/${request.full_name}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a table.
     *
     * Deletes a table from the specified parent catalog and schema. The caller
     * must be the owner of the parent catalog, have the **USE_CATALOG**
     * privilege on the parent catalog and be the owner of the parent schema, or
     * be the owner of the table and have the **USE_CATALOG** privilege on the
     * parent catalog and the **USE_SCHEMA** privilege on the parent schema.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = `/api/2.1/unity-catalog/tables/${request.full_name}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a table.
     *
     * Gets a table from the metastore for a specific catalog and schema. The
     * caller must be a metastore admin, be the owner of the table and have the
     * **USE_CATALOG** privilege on the parent catalog and the **USE_SCHEMA**
     * privilege on the parent schema, or be the owner of the table and have the
     * **SELECT** privilege on it as well.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.1/unity-catalog/tables";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List tables.
     *
     * Gets an array of all tables for the current metastore under the parent
     * catalog and schema. The caller must be a metastore admin or an owner of
     * (or have the **SELECT** privilege on) the table. For the latter case, the
     * caller must also be the owner or have the **USE_CATALOG** privilege on the
     * parent catalog and the **USE_SCHEMA** privilege on the parent schema.
     * There is no guarantee of a specific ordering of the elements in the array.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).tables;
        for (const v of response || []) {
            yield v;
        }
    }
    async _listSummaries(request, context) {
        const path = "/api/2.1/unity-catalog/table-summaries";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List table summaries.
     *
     * Gets an array of summaries for tables for a schema and catalog within the
     * metastore. The table summaries returned are either:
     *
     * * summaries for all tables (within the current metastore and parent
     * catalog and schema), when the user is a metastore admin, or: * summaries
     * for all tables and schemas (within the current metastore and parent
     * catalog) for which the user has ownership or the **SELECT** privilege on
     * the table and ownership or **USE_SCHEMA** privilege on the schema,
     * provided that the user also has ownership or the **USE_CATALOG** privilege
     * on the parent catalog.
     *
     * There is no guarantee of a specific ordering of the elements in the array.
     */
    async listSummaries(request, context) {
        return await this._listSummaries(request, context);
    }
}
exports.TablesService = TablesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TablesService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TablesService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TablesService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TablesService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TablesService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], TablesService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TablesService.prototype, "_listSummaries", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TablesService.prototype, "listSummaries", null);
//# sourceMappingURL=api.js.map