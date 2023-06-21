"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountClient = void 0;
// Code generated from OpenAPI specs by Databricks SDK Generator. DO NOT EDIT.
const Config_1 = require("./config/Config");
const api_client_1 = require("./api-client");
const billing = __importStar(require("./apis/billing"));
const deployment = __importStar(require("./apis/deployment"));
const oauth2 = __importStar(require("./apis/oauth2"));
const permissions = __importStar(require("./apis/permissions"));
const scim = __importStar(require("./apis/scim"));
const unitycatalog = __importStar(require("./apis/unitycatalog"));
class AccountClient {
    constructor(config, options = {}) {
        if (!(config instanceof Config_1.Config)) {
            config = new Config_1.Config(config);
        }
        this.config = config;
        this.apiClient = new api_client_1.ApiClient(this.config, options);
        this.billableUsage = new billing.BillableUsageService(this.apiClient);
        this.budgets = new billing.BudgetsService(this.apiClient);
        this.credentials = new deployment.CredentialsService(this.apiClient);
        this.customAppIntegration = new oauth2.CustomAppIntegrationService(this.apiClient);
        this.encryptionKeys = new deployment.EncryptionKeysService(this.apiClient);
        this.groups = new scim.AccountGroupsService(this.apiClient);
        this.logDelivery = new billing.LogDeliveryService(this.apiClient);
        this.accountMetastoreAssignments =
            new unitycatalog.AccountMetastoreAssignmentsService(this.apiClient);
        this.accountMetastores = new unitycatalog.AccountMetastoresService(this.apiClient);
        this.networks = new deployment.NetworksService(this.apiClient);
        this.privateAccess = new deployment.PrivateAccessService(this.apiClient);
        this.publishedAppIntegration =
            new oauth2.PublishedAppIntegrationService(this.apiClient);
        this.servicePrincipals = new scim.AccountServicePrincipalsService(this.apiClient);
        this.storage = new deployment.StorageService(this.apiClient);
        this.accountStorageCredentials =
            new unitycatalog.AccountStorageCredentialsService(this.apiClient);
        this.users = new scim.AccountUsersService(this.apiClient);
        this.vpcEndpoints = new deployment.VpcEndpointsService(this.apiClient);
        this.workspaceAssignment = new permissions.WorkspaceAssignmentService(this.apiClient);
        this.workspaces = new deployment.WorkspacesService(this.apiClient);
    }
}
exports.AccountClient = AccountClient;
//# sourceMappingURL=AccountClient.js.map