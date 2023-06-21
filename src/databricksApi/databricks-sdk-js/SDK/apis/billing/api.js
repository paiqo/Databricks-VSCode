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
exports.LogDeliveryService = exports.LogDeliveryError = exports.LogDeliveryRetriableError = exports.BudgetsService = exports.BudgetsError = exports.BudgetsRetriableError = exports.BillableUsageService = exports.BillableUsageError = exports.BillableUsageRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class BillableUsageRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("BillableUsage", method, message);
    }
}
exports.BillableUsageRetriableError = BillableUsageRetriableError;
class BillableUsageError extends apiError_1.ApiError {
    constructor(method, message) {
        super("BillableUsage", method, message);
    }
}
exports.BillableUsageError = BillableUsageError;
/**
 * This API allows you to download billable usage logs for the specified account
 * and date range. This feature works with all account types.
 */
class BillableUsageService {
    constructor(client) {
        this.client = client;
    }
    async _download(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/usage/download`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Return billable usage logs.
     *
     * Returns billable usage logs in CSV format for the specified account and
     * date range. For the data schema, see [CSV file schema]. Note that this
     * method might take multiple seconds to complete.
     *
     * [CSV file schema]: https://docs.databricks.com/administration-guide/account-settings/usage-analysis.html#schema
     */
    async download(request, context) {
        return await this._download(request, context);
    }
}
exports.BillableUsageService = BillableUsageService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BillableUsageService.prototype, "_download", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BillableUsageService.prototype, "download", null);
class BudgetsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Budgets", method, message);
    }
}
exports.BudgetsRetriableError = BudgetsRetriableError;
class BudgetsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Budgets", method, message);
    }
}
exports.BudgetsError = BudgetsError;
/**
 * These APIs manage budget configuration including notifications for exceeding a
 * budget for a period. They can also retrieve the status of each budget.
 */
class BudgetsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/budget`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new budget.
     *
     * Creates a new budget in the specified account.
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
        const path = `/api/2.0/accounts/${config.accountId}/budget/${request.budget_id}`;
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete budget.
     *
     * Deletes the budget specified by its UUID.
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
        const path = `/api/2.0/accounts/${config.accountId}/budget/${request.budget_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get budget and its status.
     *
     * Gets the budget specified by its UUID, including noncumulative status for
     * each day that the budget is configured to include.
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
        const path = `/api/2.0/accounts/${config.accountId}/budget`;
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all budgets.
     *
     * Gets all budgets associated with this account, including noncumulative
     * status for each day that the budget is configured to include.
     */
    async *list(context) {
        const response = (await this._list(context)).budgets;
        for (const v of response || []) {
            yield v;
        }
    }
    async _update(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/budget/${request.budget_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Modify budget.
     *
     * Modifies a budget in this account. Budget properties are completely
     * overwritten.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.BudgetsService = BudgetsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], BudgetsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], BudgetsService.prototype, "update", null);
class LogDeliveryRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("LogDelivery", method, message);
    }
}
exports.LogDeliveryRetriableError = LogDeliveryRetriableError;
class LogDeliveryError extends apiError_1.ApiError {
    constructor(method, message) {
        super("LogDelivery", method, message);
    }
}
exports.LogDeliveryError = LogDeliveryError;
/**
 * These APIs manage log delivery configurations for this account. The two
 * supported log types for this API are _billable usage logs_ and _audit logs_.
 * This feature is in Public Preview. This feature works with all account ID
 * types.
 *
 * Log delivery works with all account types. However, if your account is on the
 * E2 version of the platform or on a select custom plan that allows multiple
 * workspaces per account, you can optionally configure different storage
 * destinations for each workspace. Log delivery status is also provided to know
 * the latest status of log delivery attempts. The high-level flow of billable
 * usage delivery:
 *
 * 1. **Create storage**: In AWS, [create a new AWS S3 bucket] with a specific
 * bucket policy. Using Databricks APIs, call the Account API to create a
 * [storage configuration object](#operation/create-storage-config) that uses the
 * bucket name. 2. **Create credentials**: In AWS, create the appropriate AWS IAM
 * role. For full details, including the required IAM role policies and trust
 * relationship, see [Billable usage log delivery]. Using Databricks APIs, call
 * the Account API to create a [credential configuration
 * object](#operation/create-credential-config) that uses the IAM role's ARN. 3.
 * **Create log delivery configuration**: Using Databricks APIs, call the Account
 * API to [create a log delivery
 * configuration](#operation/create-log-delivery-config) that uses the credential
 * and storage configuration objects from previous steps. You can specify if the
 * logs should include all events of that log type in your account (_Account
 * level_ delivery) or only events for a specific set of workspaces (_workspace
 * level_ delivery). Account level log delivery applies to all current and future
 * workspaces plus account level logs, while workspace level log delivery solely
 * delivers logs related to the specified workspaces. You can create multiple
 * types of delivery configurations per account.
 *
 * For billable usage delivery: * For more information about billable usage logs,
 * see [Billable usage log delivery]. For the CSV schema, see the [Usage page]. *
 * The delivery location is `<bucket-name>/<prefix>/billable-usage/csv/`, where
 * `<prefix>` is the name of the optional delivery path prefix you set up during
 * log delivery configuration. Files are named
 * `workspaceId=<workspace-id>-usageMonth=<month>.csv`. * All billable usage logs
 * apply to specific workspaces (_workspace level_ logs). You can aggregate usage
 * for your entire account by creating an _account level_ delivery configuration
 * that delivers logs for all current and future workspaces in your account. *
 * The files are delivered daily by overwriting the month's CSV file for each
 * workspace.
 *
 * For audit log delivery: * For more information about about audit log delivery,
 * see [Audit log delivery], which includes information about the used JSON
 * schema. * The delivery location is
 * `<bucket-name>/<delivery-path-prefix>/workspaceId=<workspaceId>/date=<yyyy-mm-dd>/auditlogs_<internal-id>.json`.
 * Files may get overwritten with the same content multiple times to achieve
 * exactly-once delivery. * If the audit log delivery configuration included
 * specific workspace IDs, only _workspace-level_ audit logs for those workspaces
 * are delivered. If the log delivery configuration applies to the entire account
 * (_account level_ delivery configuration), the audit log delivery includes
 * workspace-level audit logs for all workspaces in the account as well as
 * account-level audit logs. See [Audit log delivery] for details. * Auditable
 * events are typically available in logs within 15 minutes.
 *
 * [Audit log delivery]: https://docs.databricks.com/administration-guide/account-settings/audit-logs.html
 * [Billable usage log delivery]: https://docs.databricks.com/administration-guide/account-settings/billable-usage-delivery.html
 * [Usage page]: https://docs.databricks.com/administration-guide/account-settings/usage.html
 * [create a new AWS S3 bucket]: https://docs.databricks.com/administration-guide/account-api/aws-storage.html
 */
class LogDeliveryService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/log-delivery`;
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new log delivery configuration.
     *
     * Creates a new Databricks log delivery configuration to enable delivery of
     * the specified type of logs to your storage location. This requires that
     * you already created a [credential
     * object](#operation/create-credential-config) (which encapsulates a
     * cross-account service IAM role) and a [storage configuration
     * object](#operation/create-storage-config) (which encapsulates an S3
     * bucket).
     *
     * For full details, including the required IAM role policies and bucket
     * policies, see [Deliver and access billable usage logs] or [Configure audit
     * logging].
     *
     * **Note**: There is a limit on the number of log delivery configurations
     * available per account (each limit applies separately to each log type
     * including billable usage and audit logs). You can create a maximum of two
     * enabled account-level delivery configurations (configurations without a
     * workspace filter) per type. Additionally, you can create two enabled
     * workspace-level delivery configurations per workspace for each log type,
     * which means that the same workspace ID can occur in the workspace filter
     * for no more than two delivery configurations per log type.
     *
     * You cannot delete a log delivery configuration, but you can disable it
     * (see [Enable or disable log delivery
     * configuration](#operation/patch-log-delivery-config-status)).
     *
     * [Configure audit logging]: https://docs.databricks.com/administration-guide/account-settings/audit-logs.html
     * [Deliver and access billable usage logs]: https://docs.databricks.com/administration-guide/account-settings/billable-usage-delivery.html
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
        const path = `/api/2.0/accounts/${config.accountId}/log-delivery/${request.log_delivery_configuration_id}`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get log delivery configuration.
     *
     * Gets a Databricks log delivery configuration object for an account, both
     * specified by ID.
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
        const path = `/api/2.0/accounts/${config.accountId}/log-delivery`;
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get all log delivery configurations.
     *
     * Gets all Databricks log delivery configurations associated with an account
     * specified by ID.
     */
    async *list(request, context) {
        const response = (await this._list(request, context))
            .log_delivery_configurations;
        for (const v of response || []) {
            yield v;
        }
    }
    async _patchStatus(request, context) {
        const config = this.client.config;
        await config.ensureResolved();
        if (!config.accountId || !config.isAccountClient()) {
            throw new Error("invalid Databricks Account configuration");
        }
        const path = `/api/2.0/accounts/${config.accountId}/log-delivery/${request.log_delivery_configuration_id}`;
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Enable or disable log delivery configuration.
     *
     * Enables or disables a log delivery configuration. Deletion of delivery
     * configurations is not supported, so disable log delivery configurations
     * that are no longer needed. Note that you can't re-enable a delivery
     * configuration if this would violate the delivery configuration limits
     * described under [Create log
     * delivery](#operation/create-log-delivery-config).
     */
    async patchStatus(request, context) {
        return await this._patchStatus(request, context);
    }
}
exports.LogDeliveryService = LogDeliveryService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LogDeliveryService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LogDeliveryService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LogDeliveryService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LogDeliveryService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LogDeliveryService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], LogDeliveryService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LogDeliveryService.prototype, "_patchStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LogDeliveryService.prototype, "patchStatus", null);
//# sourceMappingURL=api.js.map