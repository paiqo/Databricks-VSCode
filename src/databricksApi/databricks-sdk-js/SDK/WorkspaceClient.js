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
exports.WorkspaceClient = void 0;
// Code generated from OpenAPI specs by Databricks SDK Generator. DO NOT EDIT.
const Config_1 = require("./config/Config");
const api_client_1 = require("./api-client");
const clusterpolicies = __importStar(require("./apis/clusterpolicies"));
const clusters = __importStar(require("./apis/clusters"));
const commands = __importStar(require("./apis/commands"));
const dbfs = __importStar(require("./apis/dbfs"));
const endpoints = __importStar(require("./apis/endpoints"));
const gitcredentials = __importStar(require("./apis/gitcredentials"));
const globalinitscripts = __importStar(require("./apis/globalinitscripts"));
const instancepools = __importStar(require("./apis/instancepools"));
const ipaccesslists = __importStar(require("./apis/ipaccesslists"));
const jobs = __importStar(require("./apis/jobs"));
const libraries = __importStar(require("./apis/libraries"));
const mlflow = __importStar(require("./apis/mlflow"));
const permissions = __importStar(require("./apis/permissions"));
const pipelines = __importStar(require("./apis/pipelines"));
const repos = __importStar(require("./apis/repos"));
const scim = __importStar(require("./apis/scim"));
const secrets = __importStar(require("./apis/secrets"));
const sql = __importStar(require("./apis/sql"));
const tokenmanagement = __importStar(require("./apis/tokenmanagement"));
const tokens = __importStar(require("./apis/tokens"));
const unitycatalog = __importStar(require("./apis/unitycatalog"));
const workspace = __importStar(require("./apis/workspace"));
const workspaceconf = __importStar(require("./apis/workspaceconf"));
class WorkspaceClient {
    constructor(config, options = {}) {
        if (!(config instanceof Config_1.Config)) {
            config = new Config_1.Config(config);
        }
        this.config = config;
        this.apiClient = new api_client_1.ApiClient(this.config, options);
        this.alerts = new sql.AlertsService(this.apiClient);
        this.catalogs = new unitycatalog.CatalogsService(this.apiClient);
        this.clusterPolicies = new clusterpolicies.ClusterPoliciesService(this.apiClient);
        this.clusters = new clusters.ClustersService(this.apiClient);
        this.commands = new commands.CommandExecutionService(this.apiClient);
        this.currentUser = new scim.CurrentUserService(this.apiClient);
        this.dashboards = new sql.DashboardsService(this.apiClient);
        this.dataSources = new sql.DataSourcesService(this.apiClient);
        this.dbfs = new dbfs.DbfsService(this.apiClient);
        this.dbsqlPermissions = new sql.DbsqlPermissionsService(this.apiClient);
        this.experiments = new mlflow.ExperimentsService(this.apiClient);
        this.externalLocations = new unitycatalog.ExternalLocationsService(this.apiClient);
        this.functions = new unitycatalog.FunctionsService(this.apiClient);
        this.gitCredentials = new gitcredentials.GitCredentialsService(this.apiClient);
        this.globalInitScripts = new globalinitscripts.GlobalInitScriptsService(this.apiClient);
        this.grants = new unitycatalog.GrantsService(this.apiClient);
        this.groups = new scim.GroupsService(this.apiClient);
        this.instancePools = new instancepools.InstancePoolsService(this.apiClient);
        this.instanceProfiles = new clusters.InstanceProfilesService(this.apiClient);
        this.ipAccessLists = new ipaccesslists.IpAccessListsService(this.apiClient);
        this.jobs = new jobs.JobsService(this.apiClient);
        this.libraries = new libraries.LibrariesService(this.apiClient);
        this.mLflowArtifacts = new mlflow.MLflowArtifactsService(this.apiClient);
        this.mLflowDatabricks = new mlflow.MLflowDatabricksService(this.apiClient);
        this.mLflowMetrics = new mlflow.MLflowMetricsService(this.apiClient);
        this.mLflowRuns = new mlflow.MLflowRunsService(this.apiClient);
        this.metastores = new unitycatalog.MetastoresService(this.apiClient);
        this.modelVersionComments = new mlflow.ModelVersionCommentsService(this.apiClient);
        this.modelVersions = new mlflow.ModelVersionsService(this.apiClient);
        this.permissions = new permissions.PermissionsService(this.apiClient);
        this.pipelines = new pipelines.PipelinesService(this.apiClient);
        this.policyFamilies = new clusterpolicies.PolicyFamiliesService(this.apiClient);
        this.providers = new unitycatalog.ProvidersService(this.apiClient);
        this.queries = new sql.QueriesService(this.apiClient);
        this.queryHistory = new sql.QueryHistoryService(this.apiClient);
        this.recipientActivation = new unitycatalog.RecipientActivationService(this.apiClient);
        this.recipients = new unitycatalog.RecipientsService(this.apiClient);
        this.registeredModels = new mlflow.RegisteredModelsService(this.apiClient);
        this.registryWebhooks = new mlflow.RegistryWebhooksService(this.apiClient);
        this.repos = new repos.ReposService(this.apiClient);
        this.schemas = new unitycatalog.SchemasService(this.apiClient);
        this.secrets = new secrets.SecretsService(this.apiClient);
        this.servicePrincipals = new scim.ServicePrincipalsService(this.apiClient);
        this.servingEndpoints = new endpoints.ServingEndpointsService(this.apiClient);
        this.shares = new unitycatalog.SharesService(this.apiClient);
        this.statementExecution = new sql.StatementExecutionService(this.apiClient);
        this.storageCredentials = new unitycatalog.StorageCredentialsService(this.apiClient);
        this.tableConstraints = new unitycatalog.TableConstraintsService(this.apiClient);
        this.tables = new unitycatalog.TablesService(this.apiClient);
        this.tokenManagement = new tokenmanagement.TokenManagementService(this.apiClient);
        this.tokens = new tokens.TokensService(this.apiClient);
        this.transitionRequests = new mlflow.TransitionRequestsService(this.apiClient);
        this.users = new scim.UsersService(this.apiClient);
        this.warehouses = new sql.WarehousesService(this.apiClient);
        this.workspace = new workspace.WorkspaceService(this.apiClient);
        this.workspaceConf = new workspaceconf.WorkspaceConfService(this.apiClient);
    }
}
exports.WorkspaceClient = WorkspaceClient;
//# sourceMappingURL=WorkspaceClient.js.map