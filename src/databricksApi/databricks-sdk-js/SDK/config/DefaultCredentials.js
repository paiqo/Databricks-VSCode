"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCredentials = void 0;
const AzureCliCredentials_1 = require("./AzureCliCredentials");
const BasicCredentials_1 = require("./BasicCredentials");
const DatabricksCliCredentials_1 = require("./DatabricksCliCredentials");
const Config_1 = require("./Config");
const MetadataServiceCredentials_1 = require("./MetadataServiceCredentials");
const PatCredentials_1 = require("./PatCredentials");
const M2mCredentials_1 = require("./M2mCredentials");
class DefaultCredentials {
    constructor() {
        this.name = "default";
    }
    async configure(config) {
        const defaultChain = [
            new PatCredentials_1.PatCredentials(),
            new BasicCredentials_1.BasicCredentials(),
            new M2mCredentials_1.M2mCredentials(),
            new DatabricksCliCredentials_1.DatabricksCliCredentials(),
            new MetadataServiceCredentials_1.MetadataServiceCredentials(),
            // Attempt to configure auth from most specific to most generic (the Azure CLI).
            // new AzureMsiCredentials(),
            // new AzureClientSecretCredentials(),
            new AzureCliCredentials_1.AzureCliCredentials(),
            // Attempt to configure auth from most specific to most generic (Google Application Default Credentials).
            // new GoogleDefaultCredentials(),
            // new GoogleCredentials(),
        ];
        for (const p of defaultChain) {
            if (config.authType && p.name !== config.authType) {
                config.logger.info(`Ignoring ${p.name} auth, because ${config.authType} is preferred`);
                continue;
            }
            config.logger.info(`Attempting to configure auth: ${p.name}`);
            const visitor = await p.configure(config);
            if (visitor) {
                this.name = p.name;
                return visitor;
            }
        }
        throw new Config_1.ConfigError("cannot configure default credentials", config);
    }
}
exports.DefaultCredentials = DefaultCredentials;
//# sourceMappingURL=DefaultCredentials.js.map