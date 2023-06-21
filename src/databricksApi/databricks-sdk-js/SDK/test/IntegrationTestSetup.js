"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.IntegrationTestSetup = void 0;
const uuid_1 = require("uuid");
const Cluster_1 = require("../services/Cluster");
const WorkspaceClient_1 = require("../WorkspaceClient");
class IntegrationTestSetup {
    constructor(client, cluster) {
        this.client = client;
        this.cluster = cluster;
        this.testRunId = (0, uuid_1.v4)();
    }
    static async getInstance() {
        if (!this._instance) {
            const client = new WorkspaceClient_1.WorkspaceClient({}, {
                product: "integration-tests",
                productVersion: "0.0.1",
            });
            if (!process.env["TEST_DEFAULT_CLUSTER_ID"]) {
                throw new Error("Environment variable 'TEST_DEFAULT_CLUSTER_ID' must be set");
            }
            const clusterId = process.env["TEST_DEFAULT_CLUSTER_ID"].split("'").join("");
            const cluster = await Cluster_1.Cluster.fromClusterId(client.apiClient, clusterId);
            await cluster.start();
            this._instance = new IntegrationTestSetup(client, cluster);
        }
        return this._instance;
    }
}
exports.IntegrationTestSetup = IntegrationTestSetup;
function sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
exports.sleep = sleep;
//# sourceMappingURL=IntegrationTestSetup.js.map