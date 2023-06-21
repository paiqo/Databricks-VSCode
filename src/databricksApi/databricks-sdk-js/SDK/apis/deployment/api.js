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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = exports.WorkspacesError = exports.WorkspacesRetriableError = exports.VpcEndpointsService = exports.VpcEndpointsError = exports.VpcEndpointsRetriableError = exports.StorageService = exports.StorageError = exports.StorageRetriableError = exports.PrivateAccessService = exports.PrivateAccessError = exports.PrivateAccessRetriableError = exports.NetworksService = exports.NetworksError = exports.NetworksRetriableError = exports.EncryptionKeysService = exports.EncryptionKeysError = exports.EncryptionKeysRetriableError = exports.CredentialsService = exports.CredentialsError = exports.CredentialsRetriableError = void 0;
const model = __importStar(require("./model"));
const retries_1 = __importDefault(require("../../retries/retries"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
const wait_1 = require("../../wait");
class CredentialsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Credentials", method, message);
    }
}
exports.CredentialsRetriableError = CredentialsRetriableError;
class CredentialsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Credentials", method, message);
    }
}
exports.CredentialsError = CredentialsError;
/**
 * These APIs manage credential configurations for this workspace. Databricks
 * needs access to a cross-account service IAM role in your AWS account so that
 * Databricks can deploy clusters in the appropriate VPC for the new workspace. A
 * credential configuration encapsulates this role information, and its ID is
 * used when creating a new workspace.
 */
class CredentialsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/credentials`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create credential configuration.
     *
     * Creates a Databricks credential configuration that represents cloud
     * cross-account credentials for a specified account. Databricks uses this to
     * set up network infrastructure properly to host Databricks clusters. For
     * your AWS IAM role, you need to trust the External ID (the Databricks
     * Account API account ID) in the returned credential object, and configure
     * the required access policy.
     *
     * Save the response's `credentials_id` field, which is the ID for your new
     * credential configuration object.
     *
     * For information about how to create a new workspace with this API, see
     * [Create a new workspace using the Account API]
     *
     * [Create a new workspace using the Account API]: http://docs.databricks.com/administration-guide/account-api/new-workspace.html
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
        const path = `/api/2.0/accounts/${config.accountId}/credentials/${request.credentials_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete credential configuration.
     *
     * Deletes a Databricks credential configuration object for an account, both
     * specified by ID. You cannot delete a credential that is associated with
     * any workspace.
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
        const path = `/api/2.0/accounts/${config.accountId}/credentials/${request.credentials_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get credential configuration.
     *
     * Gets a Databricks credential configuration object for an account, both
     * specified by ID.
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
        const path = `/api/2.0/accounts/${config.accountId}/credentials`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all credential configurations.
     *
     * Gets all Databricks credential configurations associated with an account
     * specified by ID.
     */
    async list(context) {
        return await this._list(context);
    }
}
exports.CredentialsService = CredentialsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], CredentialsService.prototype, "list", null);
class EncryptionKeysRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("EncryptionKeys", method, message);
    }
}
exports.EncryptionKeysRetriableError = EncryptionKeysRetriableError;
class EncryptionKeysError extends apiError_1.ApiError {
    constructor(method, message) {
        super("EncryptionKeys", method, message);
    }
}
exports.EncryptionKeysError = EncryptionKeysError;
/**
 * These APIs manage encryption key configurations for this workspace (optional).
 * A key configuration encapsulates the AWS KMS key information and some
 * information about how the key configuration can be used. There are two
 * possible uses for key configurations:
 *
 * * Managed services: A key configuration can be used to encrypt a workspace's
 * notebook and secret data in the control plane, as well as Databricks SQL
 * queries and query history. * Storage: A key configuration can be used to
 * encrypt a workspace's DBFS and EBS data in the data plane.
 *
 * In both of these cases, the key configuration's ID is used when creating a new
 * workspace. This Preview feature is available if your account is on the E2
 * version of the platform. Updating a running workspace with workspace storage
 * encryption requires that the workspace is on the E2 version of the platform.
 * If you have an older workspace, it might not be on the E2 version of the
 * platform. If you are not sure, contact your Databricks representative.
 */
class EncryptionKeysService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/customer-managed-keys`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create encryption key configuration.
     *
     * Creates a customer-managed key configuration object for an account,
     * specified by ID. This operation uploads a reference to a customer-managed
     * key to Databricks. If the key is assigned as a workspace's
     * customer-managed key for managed services, Databricks uses the key to
     * encrypt the workspaces notebooks and secrets in the control plane, in
     * addition to Databricks SQL queries and query history. If it is specified
     * as a workspace's customer-managed key for workspace storage, the key
     * encrypts the workspace's root S3 bucket (which contains the workspace's
     * root DBFS and system data) and, optionally, cluster EBS volume data.
     *
     * **Important**: Customer-managed keys are supported only for some
     * deployment types, subscription types, and AWS regions.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform or on a select custom plan that allows multiple workspaces
     * per account.
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
        const path = `/api/2.0/accounts/${config.accountId}/customer-managed-keys/${request.customer_managed_key_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete encryption key configuration.
     *
     * Deletes a customer-managed key configuration object for an account. You
     * cannot delete a configuration that is associated with a running workspace.
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
        const path = `/api/2.0/accounts/${config.accountId}/customer-managed-keys/${request.customer_managed_key_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get encryption key configuration.
     *
     * Gets a customer-managed key configuration object for an account, specified
     * by ID. This operation uploads a reference to a customer-managed key to
     * Databricks. If assigned as a workspace's customer-managed key for managed
     * services, Databricks uses the key to encrypt the workspaces notebooks and
     * secrets in the control plane, in addition to Databricks SQL queries and
     * query history. If it is specified as a workspace's customer-managed key
     * for storage, the key encrypts the workspace's root S3 bucket (which
     * contains the workspace's root DBFS and system data) and, optionally,
     * cluster EBS volume data.
     *
     * **Important**: Customer-managed keys are supported only for some
     * deployment types, subscription types, and AWS regions.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform.
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
        const path = `/api/2.0/accounts/${config.accountId}/customer-managed-keys`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all encryption key configurations.
     *
     * Gets all customer-managed key configuration objects for an account. If the
     * key is specified as a workspace's managed services customer-managed key,
     * Databricks uses the key to encrypt the workspace's notebooks and secrets
     * in the control plane, in addition to Databricks SQL queries and query
     * history. If the key is specified as a workspace's storage customer-managed
     * key, the key is used to encrypt the workspace's root S3 bucket and
     * optionally can encrypt cluster EBS volumes data in the data plane.
     *
     * **Important**: Customer-managed keys are supported only for some
     * deployment types, subscription types, and AWS regions.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform.
     */
    async list(context) {
        return await this._list(context);
    }
}
exports.EncryptionKeysService = EncryptionKeysService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], EncryptionKeysService.prototype, "list", null);
class NetworksRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Networks", method, message);
    }
}
exports.NetworksRetriableError = NetworksRetriableError;
class NetworksError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Networks", method, message);
    }
}
exports.NetworksError = NetworksError;
/**
 * These APIs manage network configurations for customer-managed VPCs (optional).
 * Its ID is used when creating a new workspace if you use customer-managed VPCs.
 */
class NetworksService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/networks`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create network configuration.
     *
     * Creates a Databricks network configuration that represents an VPC and its
     * resources. The VPC will be used for new Databricks clusters. This requires
     * a pre-existing VPC and subnets.
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
        const path = `/api/2.0/accounts/${config.accountId}/networks/${request.network_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a network configuration.
     *
     * Deletes a Databricks network configuration, which represents a cloud VPC
     * and its resources. You cannot delete a network that is associated with a
     * workspace.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform.
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
        const path = `/api/2.0/accounts/${config.accountId}/networks/${request.network_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a network configuration.
     *
     * Gets a Databricks network configuration, which represents a cloud VPC and
     * its resources.
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
        const path = `/api/2.0/accounts/${config.accountId}/networks`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all network configurations.
     *
     * Gets a list of all Databricks network configurations for an account,
     * specified by ID.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform.
     */
    async list(context) {
        return await this._list(context);
    }
}
exports.NetworksService = NetworksService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], NetworksService.prototype, "list", null);
class PrivateAccessRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("PrivateAccess", method, message);
    }
}
exports.PrivateAccessRetriableError = PrivateAccessRetriableError;
class PrivateAccessError extends apiError_1.ApiError {
    constructor(method, message) {
        super("PrivateAccess", method, message);
    }
}
exports.PrivateAccessError = PrivateAccessError;
/**
 * These APIs manage private access settings for this account. A private access
 * settings object specifies how your workspace is accessed using AWS
 * PrivateLink. Each workspace that has any PrivateLink connections must include
 * the ID for a private access settings object is in its workspace configuration
 * object. Your account must be enabled for PrivateLink to use these APIs. Before
 * configuring PrivateLink, it is important to read the [Databricks article about
 * PrivateLink].
 *
 * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
 */
class PrivateAccessService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/private-access-settings`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create private access settings.
     *
     * Creates a private access settings object, which specifies how your
     * workspace is accessed over [AWS PrivateLink]. To use AWS PrivateLink, a
     * workspace must have a private access settings object referenced by ID in
     * the workspace's `private_access_settings_id` property.
     *
     * You can share one private access settings with multiple workspaces in a
     * single account. However, private access settings are specific to AWS
     * regions, so only workspaces in the same AWS region can use a given private
     * access settings object.
     *
     * Before configuring PrivateLink, read the [Databricks article about
     * PrivateLink].
     *
     * [AWS PrivateLink]: https://aws.amazon.com/privatelink
     * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
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
        const path = `/api/2.0/accounts/${config.accountId}/private-access-settings/${request.private_access_settings_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a private access settings object.
     *
     * Deletes a private access settings object, which determines how your
     * workspace is accessed over [AWS PrivateLink].
     *
     * Before configuring PrivateLink, read the [Databricks article about
     * PrivateLink].
     *
     * [AWS PrivateLink]: https://aws.amazon.com/privatelink
     * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
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
        const path = `/api/2.0/accounts/${config.accountId}/private-access-settings/${request.private_access_settings_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a private access settings object.
     *
     * Gets a private access settings object, which specifies how your workspace
     * is accessed over [AWS PrivateLink].
     *
     * Before configuring PrivateLink, read the [Databricks article about
     * PrivateLink].
     *
     * [AWS PrivateLink]: https://aws.amazon.com/privatelink
     * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
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
        const path = `/api/2.0/accounts/${config.accountId}/private-access-settings`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all private access settings objects.
     *
     * Gets a list of all private access settings objects for an account,
     * specified by ID.
     */
    async list(context) {
        return await this._list(context);
    }
    async _replace(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/private-access-settings/${request.private_access_settings_id}`;
        return (await this.client.request(path, "PUT", request, context));
    }
    /**
     * Replace private access settings.
     *
     * Updates an existing private access settings object, which specifies how
     * your workspace is accessed over [AWS PrivateLink]. To use AWS PrivateLink,
     * a workspace must have a private access settings object referenced by ID in
     * the workspace's `private_access_settings_id` property.
     *
     * This operation completely overwrites your existing private access settings
     * object attached to your workspaces. All workspaces attached to the private
     * access settings are affected by any change. If `public_access_enabled`,
     * `private_access_level`, or `allowed_vpc_endpoint_ids` are updated, effects
     * of these changes might take several minutes to propagate to the workspace
     * API.
     *
     * You can share one private access settings object with multiple workspaces
     * in a single account. However, private access settings are specific to AWS
     * regions, so only workspaces in the same AWS region can use a given private
     * access settings object.
     *
     * Before configuring PrivateLink, read the [Databricks article about
     * PrivateLink].
     *
     * [AWS PrivateLink]: https://aws.amazon.com/privatelink
     * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
     */
    async replace(request, context) {
        return await this._replace(request, context);
    }
}
exports.PrivateAccessService = PrivateAccessService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "_replace", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], PrivateAccessService.prototype, "replace", null);
class StorageRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Storage", method, message);
    }
}
exports.StorageRetriableError = StorageRetriableError;
class StorageError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Storage", method, message);
    }
}
exports.StorageError = StorageError;
/**
 * These APIs manage storage configurations for this workspace. A root storage S3
 * bucket in your account is required to store objects like cluster logs,
 * notebook revisions, and job results. You can also use the root storage S3
 * bucket for storage of non-production DBFS data. A storage configuration
 * encapsulates this bucket information, and its ID is used when creating a new
 * workspace.
 */
class StorageService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/storage-configurations`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create new storage configuration.
     *
     * Creates new storage configuration for an account, specified by ID. Uploads
     * a storage configuration object that represents the root AWS S3 bucket in
     * your account. Databricks stores related workspace assets including DBFS,
     * cluster logs, and job results. For the AWS S3 bucket, you need to
     * configure the required bucket policy.
     *
     * For information about how to create a new workspace with this API, see
     * [Create a new workspace using the Account API]
     *
     * [Create a new workspace using the Account API]: http://docs.databricks.com/administration-guide/account-api/new-workspace.html
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
        const path = `/api/2.0/accounts/${config.accountId}/storage-configurations/${request.storage_configuration_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete storage configuration.
     *
     * Deletes a Databricks storage configuration. You cannot delete a storage
     * configuration that is associated with any workspace.
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
        const path = `/api/2.0/accounts/${config.accountId}/storage-configurations/${request.storage_configuration_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get storage configuration.
     *
     * Gets a Databricks storage configuration for an account, both specified by
     * ID.
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
        const path = `/api/2.0/accounts/${config.accountId}/storage-configurations`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all storage configurations.
     *
     * Gets a list of all Databricks storage configurations for your account,
     * specified by ID.
     */
    async list(context) {
        return await this._list(context);
    }
}
exports.StorageService = StorageService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], StorageService.prototype, "list", null);
class VpcEndpointsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("VpcEndpoints", method, message);
    }
}
exports.VpcEndpointsRetriableError = VpcEndpointsRetriableError;
class VpcEndpointsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("VpcEndpoints", method, message);
    }
}
exports.VpcEndpointsError = VpcEndpointsError;
/**
 * These APIs manage VPC endpoint configurations for this account. This object
 * registers an AWS VPC endpoint in your Databricks account so your workspace can
 * use it with AWS PrivateLink. Your VPC endpoint connects to one of two VPC
 * endpoint services -- one for workspace (both for front-end connection and for
 * back-end connection to REST APIs) and one for the back-end secure cluster
 * connectivity relay from the data plane. Your account must be enabled for
 * PrivateLink to use these APIs. Before configuring PrivateLink, it is important
 * to read the [Databricks article about PrivateLink].
 *
 * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
 */
class VpcEndpointsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/vpc-endpoints`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create VPC endpoint configuration.
     *
     * Creates a VPC endpoint configuration, which represents a [VPC endpoint]
     * object in AWS used to communicate privately with Databricks over [AWS
     * PrivateLink].
     *
     * After you create the VPC endpoint configuration, the Databricks [endpoint
     * service] automatically accepts the VPC endpoint.
     *
     * Before configuring PrivateLink, read the [Databricks article about
     * PrivateLink].
     *
     * [AWS PrivateLink]: https://aws.amazon.com/privatelink
     * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
     * [VPC endpoint]: https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html
     * [endpoint service]: https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html
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
        const path = `/api/2.0/accounts/${config.accountId}/vpc-endpoints/${request.vpc_endpoint_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete VPC endpoint configuration.
     *
     * Deletes a VPC endpoint configuration, which represents an [AWS VPC
     * endpoint] that can communicate privately with Databricks over [AWS
     * PrivateLink].
     *
     * Upon deleting a VPC endpoint configuration, the VPC endpoint in AWS
     * changes its state from `accepted` to `rejected`, which means that it is no
     * longer usable from your VPC.
     *
     * Before configuring PrivateLink, read the [Databricks article about
     * PrivateLink].
     *
     * [AWS PrivateLink]: https://aws.amazon.com/privatelink
     * [AWS VPC endpoint]: https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html
     * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
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
        const path = `/api/2.0/accounts/${config.accountId}/vpc-endpoints/${request.vpc_endpoint_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a VPC endpoint configuration.
     *
     * Gets a VPC endpoint configuration, which represents a [VPC endpoint]
     * object in AWS used to communicate privately with Databricks over [AWS
     * PrivateLink].
     *
     * [AWS PrivateLink]: https://aws.amazon.com/privatelink
     * [VPC endpoint]: https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html
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
        const path = `/api/2.0/accounts/${config.accountId}/vpc-endpoints`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all VPC endpoint configurations.
     *
     * Gets a list of all VPC endpoints for an account, specified by ID.
     *
     * Before configuring PrivateLink, read the [Databricks article about
     * PrivateLink].
     *
     * [Databricks article about PrivateLink]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/privatelink.html
     */
    async list(context) {
        return await this._list(context);
    }
}
exports.VpcEndpointsService = VpcEndpointsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], VpcEndpointsService.prototype, "list", null);
class WorkspacesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Workspaces", method, message);
    }
}
exports.WorkspacesRetriableError = WorkspacesRetriableError;
class WorkspacesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Workspaces", method, message);
    }
}
exports.WorkspacesError = WorkspacesError;
/**
 * These APIs manage workspaces for this account. A Databricks workspace is an
 * environment for accessing all of your Databricks assets. The workspace
 * organizes objects (notebooks, libraries, and experiments) into folders, and
 * provides access to data and computational resources such as clusters and jobs.
 *
 * These endpoints are available if your account is on the E2 version of the
 * platform or on a select custom plan that allows multiple workspaces per
 * account.
 */
class WorkspacesService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/workspaces`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new workspace.
     *
     * Creates a new workspace.
     *
     * **Important**: This operation is asynchronous. A response with HTTP status
     * code 200 means the request has been accepted and is in progress, but does
     * not mean that the workspace deployed successfully and is running. The
     * initial workspace status is typically `PROVISIONING`. Use the workspace ID
     * (`workspace_id`) field in the response to identify the new workspace and
     * make repeated `GET` requests with the workspace ID and check its status.
     * The workspace becomes available when the status changes to `RUNNING`.
     */
    async create(createWorkspaceRequest, context) {
        const cancellationToken = context?.cancellationToken;
        const workspace = await this._create(createWorkspaceRequest, context);
        return (0, wait_1.asWaiter)(workspace, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        workspace_id: workspace.workspace_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Workspaces.createAndWait: cancelled");
                        throw new WorkspacesError("createAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.workspace_status;
                    const statusMessage = pollResponse.workspace_status_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "BANNED":
                        case "FAILED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Workspaces.createAndWait: ${errorMessage}`);
                            throw new WorkspacesError("createAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Workspaces.createAndWait: retrying: ${errorMessage}`);
                            throw new WorkspacesRetriableError("createAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _delete(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a workspace.
     *
     * Terminates and deletes a Databricks workspace. From an API perspective,
     * deletion is immediate. However, it might take a few minutes for all
     * workspaces resources to be deleted, depending on the size and number of
     * workspace resources.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform or on a select custom plan that allows multiple workspaces
     * per account.
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
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a workspace.
     *
     * Gets information including status for a Databricks workspace, specified by
     * ID. In the response, the `workspace_status` field indicates the current
     * status. After initial workspace creation (which is asynchronous), make
     * repeated `GET` requests with the workspace ID and check its status. The
     * workspace becomes available when the status changes to `RUNNING`.
     *
     * For information about how to create a new workspace with this API
     * **including error handling**, see [Create a new workspace using the
     * Account API].
     *
     * This operation is available only if your account is on the E2 version of
     * the platform or on a select custom plan that allows multiple workspaces
     * per account.
     *
     * [Create a new workspace using the Account API]: http://docs.databricks.com/administration-guide/account-api/new-workspace.html
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
        const path = `/api/2.0/accounts/${config.accountId}/workspaces`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all workspaces.
     *
     * Gets a list of all workspaces associated with an account, specified by ID.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform or on a select custom plan that allows multiple workspaces
     * per account.
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
        const path = `/api/2.0/accounts/${config.accountId}/workspaces/${request.workspace_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update workspace configuration.
     *
     * Updates a workspace configuration for either a running workspace or a
     * failed workspace. The elements that can be updated varies between these
     * two use cases.
     *
     * ### Update a failed workspace You can update a Databricks workspace
     * configuration for failed workspace deployment for some fields, but not all
     * fields. For a failed workspace, this request supports updates to the
     * following fields only: - Credential configuration ID - Storage
     * configuration ID - Network configuration ID. Used only to add or change a
     * network configuration for a customer-managed VPC. For a failed workspace
     * only, you can convert a workspace with Databricks-managed VPC to use a
     * customer-managed VPC by adding this ID. You cannot downgrade a workspace
     * with a customer-managed VPC to be a Databricks-managed VPC. You can update
     * the network configuration for a failed or running workspace to add
     * PrivateLink support, though you must also add a private access settings
     * object. - Key configuration ID for managed services (control plane
     * storage, such as notebook source and Databricks SQL queries). Used only if
     * you use customer-managed keys for managed services. - Key configuration ID
     * for workspace storage (root S3 bucket and, optionally, EBS volumes). Used
     * only if you use customer-managed keys for workspace storage.
     * **Important**: If the workspace was ever in the running state, even if
     * briefly before becoming a failed workspace, you cannot add a new key
     * configuration ID for workspace storage. - Private access settings ID to
     * add PrivateLink support. You can add or update the private access settings
     * ID to upgrade a workspace to add support for front-end, back-end, or both
     * types of connectivity. You cannot remove (downgrade) any existing
     * front-end or back-end PrivateLink support on a workspace.
     *
     * After calling the `PATCH` operation to update the workspace configuration,
     * make repeated `GET` requests with the workspace ID and check the workspace
     * status. The workspace is successful if the status changes to `RUNNING`.
     *
     * For information about how to create a new workspace with this API
     * **including error handling**, see [Create a new workspace using the
     * Account API].
     *
     * ### Update a running workspace You can update a Databricks workspace
     * configuration for running workspaces for some fields, but not all fields.
     * For a running workspace, this request supports updating the following
     * fields only: - Credential configuration ID
     *
     * - Network configuration ID. Used only if you already use a
     * customer-managed VPC. You cannot convert a running workspace from a
     * Databricks-managed VPC to a customer-managed VPC. You can use a network
     * configuration update in this API for a failed or running workspace to add
     * support for PrivateLink, although you also need to add a private access
     * settings object.
     *
     * - Key configuration ID for managed services (control plane storage, such
     * as notebook source and Databricks SQL queries). Databricks does not
     * directly encrypt the data with the customer-managed key (CMK). Databricks
     * uses both the CMK and the Databricks managed key (DMK) that is unique to
     * your workspace to encrypt the Data Encryption Key (DEK). Databricks uses
     * the DEK to encrypt your workspace's managed services persisted data. If
     * the workspace does not already have a CMK for managed services, adding
     * this ID enables managed services encryption for new or updated data.
     * Existing managed services data that existed before adding the key remains
     * not encrypted with the DEK until it is modified. If the workspace already
     * has customer-managed keys for managed services, this request rotates
     * (changes) the CMK keys and the DEK is re-encrypted with the DMK and the
     * new CMK. - Key configuration ID for workspace storage (root S3 bucket and,
     * optionally, EBS volumes). You can set this only if the workspace does not
     * already have a customer-managed key configuration for workspace storage. -
     * Private access settings ID to add PrivateLink support. You can add or
     * update the private access settings ID to upgrade a workspace to add
     * support for front-end, back-end, or both types of connectivity. You cannot
     * remove (downgrade) any existing front-end or back-end PrivateLink support
     * on a workspace.
     *
     * **Important**: To update a running workspace, your workspace must have no
     * running compute resources that run in your workspace's VPC in the Classic
     * data plane. For example, stop all all-purpose clusters, job clusters,
     * pools with running clusters, and Classic SQL warehouses. If you do not
     * terminate all cluster instances in the workspace before calling this API,
     * the request will fail.
     *
     * ### Wait until changes take effect. After calling the `PATCH` operation to
     * update the workspace configuration, make repeated `GET` requests with the
     * workspace ID and check the workspace status and the status of the fields.
     * * For workspaces with a Databricks-managed VPC, the workspace status
     * becomes `PROVISIONING` temporarily (typically under 20 minutes). If the
     * workspace update is successful, the workspace status changes to `RUNNING`.
     * Note that you can also check the workspace status in the [Account
     * Console]. However, you cannot use or create clusters for another 20
     * minutes after that status change. This results in a total of up to 40
     * minutes in which you cannot create clusters. If you create or use clusters
     * before this time interval elapses, clusters do not launch successfully,
     * fail, or could cause other unexpected behavior.
     *
     * * For workspaces with a customer-managed VPC, the workspace status stays
     * at status `RUNNING` and the VPC change happens immediately. A change to
     * the storage customer-managed key configuration ID might take a few minutes
     * to update, so continue to check the workspace until you observe that it
     * has been updated. If the update fails, the workspace might revert silently
     * to its original configuration. After the workspace has been updated, you
     * cannot use or create clusters for another 20 minutes. If you create or use
     * clusters before this time interval elapses, clusters do not launch
     * successfully, fail, or could cause other unexpected behavior.
     *
     * If you update the _storage_ customer-managed key configurations, it takes
     * 20 minutes for the changes to fully take effect. During the 20 minute
     * wait, it is important that you stop all REST API calls to the DBFS API. If
     * you are modifying _only the managed services key configuration_, you can
     * omit the 20 minute wait.
     *
     * **Important**: Customer-managed keys and customer-managed VPCs are
     * supported by only some deployment types and subscription types. If you
     * have questions about availability, contact your Databricks representative.
     *
     * This operation is available only if your account is on the E2 version of
     * the platform or on a select custom plan that allows multiple workspaces
     * per account.
     *
     * [Account Console]: https://docs.databricks.com/administration-guide/account-settings-e2/account-console-e2.html
     * [Create a new workspace using the Account API]: http://docs.databricks.com/administration-guide/account-api/new-workspace.html
     */
    async update(updateWorkspaceRequest, context) {
        const cancellationToken = context?.cancellationToken;
        await this._update(updateWorkspaceRequest, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        workspace_id: updateWorkspaceRequest.workspace_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Workspaces.updateAndWait: cancelled");
                        throw new WorkspacesError("updateAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.workspace_status;
                    const statusMessage = pollResponse.workspace_status_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "BANNED":
                        case "FAILED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Workspaces.updateAndWait: ${errorMessage}`);
                            throw new WorkspacesError("updateAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Workspaces.updateAndWait: retrying: ${errorMessage}`);
                            throw new WorkspacesRetriableError("updateAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
}
exports.WorkspacesService = WorkspacesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspacesService.prototype, "update", null);
//# sourceMappingURL=api.js.map