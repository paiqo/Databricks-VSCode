"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.ConfigError = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
require("reflect-metadata");
const logging_1 = require("../logging");
const ConfigAttributes_1 = require("./ConfigAttributes");
const DefaultCredentials_1 = require("./DefaultCredentials");
const KnownConfigLoader_1 = require("./KnownConfigLoader");
const fetch_1 = require("../fetch");
const OidcEndpoints_1 = require("./oauth/OidcEndpoints");
class ConfigError extends Error {
    constructor(baseMessage, config) {
        let msg = baseMessage;
        const debugString = config.attributes.debugString();
        if (debugString) {
            msg += `. ${debugString}`;
        }
        super(msg);
        this.baseMessage = baseMessage;
        this.config = config;
    }
}
exports.ConfigError = ConfigError;
class Config {
    constructor(config) {
        this.config = config;
        this.resolved = false;
        this.attributes = (0, ConfigAttributes_1.getAttributesFromDecorators)(Object.getPrototypeOf(this), this);
        for (const [key, value] of Object.entries(config)) {
            this[key] = value;
        }
        this.logger =
            config.logger || logging_1.NamedLogger.getOrCreate(logging_1.ExposedLoggers.SDK);
        this.env = config.env || process.env;
    }
    async getHost() {
        await this.ensureResolved();
        return new URL(this.host);
    }
    setAttribute(name, value) {
        this[name] = value;
    }
    /**
     * Authenticate adds special headers to HTTP request to authorize it to work with Databricks REST API
     */
    async authenticate(headers) {
        await this.ensureResolved();
        await this.configureCredentialProvider();
        return this.auth(headers);
    }
    /**
     * isAzure returns true if client is configured for Azure Databricks
     */
    isAzure() {
        return ((!!this.host &&
            !!this.host.match(/(\.databricks\.azure\.us|\.databricks\.azure\.cn|\.azuredatabricks\.net)$/)) ||
            !!this.azureResourceId);
    }
    /**
     * isGcp returns true if client is configured for GCP
     */
    isGcp() {
        return !!this.host && this.host.endsWith(".gcp.databricks.com");
    }
    /**
     * isAws returns true if client is configured for AWS
     */
    isAws() {
        return !!this.host && !this.isAzure() && !this.isGcp();
    }
    /**
     * isAccountClient returns true if client is configured for Accounts API
     */
    isAccountClient() {
        return !!this.host && this.host.startsWith("https://accounts.");
    }
    async ensureResolved() {
        if (this.resolved) {
            return;
        }
        const loaders = [new ConfigAttributes_1.EnvironmentLoader(), new KnownConfigLoader_1.KnownConfigLoader()];
        for (const loader of loaders) {
            this.logger.info(`Loading config via ${loader.name}`);
            await loader.configure(this);
        }
        await this.attributes.validate();
        this.fixHost();
        this.resolved = true;
    }
    fixHost() {
        if (!this.host) {
            return;
        }
        let host = this.host;
        if (!host.startsWith("http")) {
            host = `https://${host}`;
        }
        this.host = `https://${new URL(host).hostname}`;
    }
    async configureCredentialProvider() {
        if (this.auth) {
            return;
        }
        if (!this.credentials) {
            this.credentials = new DefaultCredentials_1.DefaultCredentials();
        }
        try {
            this.auth = await this.credentials.configure(this);
        }
        catch (e) {
            if (e instanceof ConfigError) {
                throw new ConfigError(`${this.credentials.name} auth: ${e.baseMessage}`, this);
            }
            throw e;
        }
        this.authType = this.credentials.name;
    }
    async getOidcEndpoints() {
        if (!this.host) {
            return;
        }
        if (this.isAzure()) {
            const response = await this.fetch(`${this.host}/oidc/oauth2/v2.0/authorize`, {});
            const realAuthUrl = response.headers["location"];
            if (!realAuthUrl) {
                return;
            }
            return new OidcEndpoints_1.OidcEndpoints(this, new URL(realAuthUrl), new URL(realAuthUrl.replace("/authorize", "/token")));
        }
        if (this.isAccountClient() && this.accountId) {
            const prefix = `${this.host}/oidc/accounts/${this.accountId}`;
            return new OidcEndpoints_1.OidcEndpoints(this, new URL(`${prefix}/v1/authorize`), new URL(`${prefix}/v1/token`));
        }
        const oidcEndpoint = `${this.host}/oidc/.well-known/oauth-authorization-server`;
        const response = await this.fetch(oidcEndpoint, {});
        if (response.status !== 200) {
            return;
        }
        const json = (await response.json());
        if (!json ||
            typeof json.authorization_endpoint !== "string" ||
            typeof json.token_endpoint !== "string") {
            return;
        }
        return new OidcEndpoints_1.OidcEndpoints(this, new URL(json.authorization_endpoint), new URL(json.token_endpoint));
    }
    async fetch(url, options) {
        return await (0, fetch_1.fetch)(url, options);
    }
}
exports.Config = Config;
__decorate([
    (0, ConfigAttributes_1.attribute)({ name: "host", env: "DATABRICKS_HOST" }),
    __metadata("design:type", String)
], Config.prototype, "host", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "metadata_service_url",
        env: "DATABRICKS_METADATA_SERVICE_URL",
        auth: "metadata-service",
        sensitive: true,
    }),
    __metadata("design:type", String)
], Config.prototype, "localMetadataServiceUrl", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({ name: "account_id", env: "DATABRICKS_ACCOUNT_ID" }),
    __metadata("design:type", String)
], Config.prototype, "accountId", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "token",
        env: "DATABRICKS_TOKEN",
        auth: "pat",
        sensitive: true,
    }),
    __metadata("design:type", String)
], Config.prototype, "token", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "username",
        env: "DATABRICKS_USERNAME",
        auth: "basic",
    }),
    __metadata("design:type", String)
], Config.prototype, "username", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "password",
        env: "DATABRICKS_PASSWORD",
        auth: "basic",
        sensitive: true,
    }),
    __metadata("design:type", String)
], Config.prototype, "password", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({ name: "profile", env: "DATABRICKS_CONFIG_PROFILE" }),
    __metadata("design:type", String)
], Config.prototype, "profile", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({ name: "config_file", env: "DATABRICKS_CONFIG_FILE" }),
    __metadata("design:type", String)
], Config.prototype, "configFile", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "google_service_account",
        env: "DATABRICKS_GOOGLE_SERVICE_ACCOUNT",
        auth: "google",
    }),
    __metadata("design:type", String)
], Config.prototype, "googleServiceAccount", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "google_credentials",
        env: "DATABRICKS_GOOGLE_CREDENTIALS",
        auth: "google",
        sensitive: true,
    }),
    __metadata("design:type", String)
], Config.prototype, "googleCredentials", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "azure_workspace_resource_id",
        env: "DATABRICKS_AZURE_RESOURCE_ID",
        auth: "azure",
    }),
    __metadata("design:type", String)
], Config.prototype, "azureResourceId", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "azure_use_msi",
        env: "ARM_USE_MSI",
        auth: "azure",
    }),
    __metadata("design:type", Boolean)
], Config.prototype, "azureUseMSI", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "azure_client_secret",
        env: "ARM_CLIENT_SECRET",
        auth: "azure",
        sensitive: true,
    }),
    __metadata("design:type", String)
], Config.prototype, "azureClientSecret", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "azure_client_id",
        env: "ARM_CLIENT_ID",
        auth: "azure",
    }),
    __metadata("design:type", String)
], Config.prototype, "azureClientId", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "azure_tenant_id",
        env: "ARM_TENANT_ID",
        auth: "azure",
    }),
    __metadata("design:type", String)
], Config.prototype, "azureTenantId", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "azure_environment",
        env: "ARM_ENVIRONMENT",
    }),
    __metadata("design:type", String)
], Config.prototype, "azureEnvironment", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "azure_login_app_id",
        env: "DATABRICKS_AZURE_LOGIN_APP_ID",
        auth: "azure",
    }),
    __metadata("design:type", String)
], Config.prototype, "azureLoginAppId", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "client_id",
        env: "DATABRICKS_CLIENT_ID",
        auth: "oauth",
    }),
    __metadata("design:type", String)
], Config.prototype, "clientId", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "client_secret",
        env: "DATABRICKS_CLIENT_SECRET",
        auth: "oauth",
        sensitive: true,
    }),
    __metadata("design:type", String)
], Config.prototype, "clientSecret", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "databricks_cli_path",
        env: "DATABRICKS_CLI_PATH",
    }),
    __metadata("design:type", String)
], Config.prototype, "databricksCliPath", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "auth_type",
        env: "DATABRICKS_AUTH_TYPE",
    }),
    __metadata("design:type", String)
], Config.prototype, "authType", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "skip_verify",
    }),
    __metadata("design:type", Boolean)
], Config.prototype, "insecureSkipVerify", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "http_timeout_seconds",
    }),
    __metadata("design:type", Number)
], Config.prototype, "httpTimeoutSeconds", void 0);
__decorate([
    (0, ConfigAttributes_1.attribute)({
        name: "retry_timeout_seconds",
    }),
    __metadata("design:type", Number)
], Config.prototype, "retryTimeoutSeconds", void 0);
//# sourceMappingURL=Config.js.map