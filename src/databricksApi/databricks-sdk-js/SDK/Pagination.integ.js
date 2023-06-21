"use strict";
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
/* eslint-disable @typescript-eslint/naming-convention */
const WorkspaceClient_1 = require("./WorkspaceClient");
const assert = __importStar(require("assert"));
/**
 * This test is skipped because it only works in workspaces that have a sufficient amount of resources
 * to paginate through.
 */
describe.skip(__filename, function () {
    this.timeout(10000);
    let wsClient;
    beforeEach(() => {
        wsClient = new WorkspaceClient_1.WorkspaceClient({});
    });
    // repos list
    it("should paginate by token", async () => {
        const items = [];
        for await (const repo of wsClient.repos.list({})) {
            items.push(repo);
            if (items.length > 50) {
                break;
            }
        }
        assert.ok(items.length > 0);
    });
    // jobs list
    it("should paginate by token and dedupe results", async () => {
        const items = [];
        const seen = new Set();
        for await (const job of wsClient.jobs.list({})) {
            items.push(job);
            assert.ok(job.job_id);
            if (seen.has(job.job_id)) {
                assert.fail(`job_id ${job.job_id} already seen`);
            }
            else {
                seen.add(job.job_id);
            }
            if (items.length > 50) {
                break;
            }
        }
        assert.ok(items.length > 0);
    });
    // jobs list
    it("should paginate by offset", async () => {
        const items = [];
        for await (const job of wsClient.jobs.list({
            limit: 25,
        })) {
            if (items.length > 50) {
                break;
            }
            items.push(job);
        }
        assert.ok(items.length > 0);
    });
    // sql dashboards list
    it("should paginate with offset 1", async () => {
        const items = [];
        for await (const dashboard of wsClient.dashboards.list({})) {
            if (items.length > 40) {
                break;
            }
            items.push(dashboard);
        }
        assert.ok(items.length > 0);
    });
    it("should paginate cluster events", async () => {
        const items = [];
        for await (const item of wsClient.clusters.events({
            cluster_id: process.env.DATABRICKS_CLUSTER_ID,
        })) {
            items.push(item);
            if (items.length > 50) {
                break;
            }
        }
        assert.ok(items.length > 0);
    });
    it("should return the body for calls that don't paginate", async () => {
        // this case doesn't seem to exist
    });
    // cluster policies
    it("should return items for calls that don't paginate", async () => {
        const items = [];
        for await (const item of wsClient.clusterPolicies.list({})) {
            items.push(item);
        }
        assert.ok(items.length > 0);
    });
});
//# sourceMappingURL=Pagination.integ.js.map