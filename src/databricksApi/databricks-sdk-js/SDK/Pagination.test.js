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
 * This test uses scraped responses from a workspace that has a sufficient amount of resources.
 */
describe(__filename, () => {
    let wsClient;
    beforeEach(() => {
        wsClient = new WorkspaceClient_1.WorkspaceClient({});
    });
    // repos list
    it("should paginate by token", async () => {
        const items = [];
        const responses = [
            {
                repos: [...Array(20).keys()].map((i) => {
                    return {
                        id: 43368721962707 + i,
                        path: `/Repos/test-user/repo-${i}`,
                    };
                }),
                next_page_token: "eyJyZXBvX3RyZWVub2RlX2lkIjo0MzM2ODcyMTk2MjcwN30=",
            },
            {
                repos: [...Array(20).keys()].map((i) => {
                    return {
                        id: 43368721962707 + i + 20,
                        path: `/Repos/test-user/repo-${i + 20}`,
                    };
                }),
            },
        ];
        const reposApi = wsClient.repos;
        reposApi._list =
            async function () {
                return responses.shift();
            };
        for await (const repo of wsClient.repos.list({})) {
            items.push(repo);
        }
        assert.equal(items.length, 40);
    });
    // jobs list
    it("should paginate by token and dedupe results", async () => {
        const responses = [
            {
                jobs: [...Array(20).keys()].map((i) => {
                    return {
                        job_id: 43368721962707 + i,
                        creator_user_name: `test-user-${i}`,
                    };
                }),
                has_more: true,
            },
            {
                jobs: [...Array(20).keys()]
                    .map((i) => {
                    return {
                        job_id: 43368721962707 + i + 20,
                        creator_user_name: `test-user-${i + 20}`,
                    };
                })
                    .concat([
                    {
                        // duplicate entry
                        job_id: 43368721962707,
                        creator_user_name: `test-user-0`,
                    },
                ]),
                has_more: true,
            },
            {
                has_more: false,
            },
        ];
        const jobsApi = wsClient.jobs;
        jobsApi._list = async function () {
            return responses.shift();
        };
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
        assert.equal(items.length, 40);
    });
    // jobs list
    it("should paginate by offset", async () => {
        const responses = [
            {
                jobs: [...Array(25).keys()].map((i) => {
                    return {
                        job_id: 43368721962707 + i,
                        creator_user_name: `test-user-${i}`,
                    };
                }),
                has_more: true,
            },
            {
                jobs: [...Array(25).keys()].map((i) => {
                    return {
                        job_id: 43368721962707 + i + 25,
                        creator_user_name: `test-user-${i + 25}`,
                    };
                }),
                has_more: true,
            },
            {
                has_more: false,
            },
        ];
        const jobsApi = wsClient.jobs;
        jobsApi._list = async function () {
            return responses.shift();
        };
        const items = [];
        for await (const job of wsClient.jobs.list({
            limit: 25,
        })) {
            items.push(job);
        }
        assert.equal(items.length, 50);
    });
    // sql dashboards list
    it("should paginate with offset 1", async () => {
        const responses = [
            {
                count: 35,
                page: 1,
                page_size: 25,
                results: [...Array(20).keys()].map((i) => {
                    return {
                        id: 43368721962707 + i,
                    };
                }),
            },
            {
                count: 35,
                page: 2,
                page_size: 25,
                results: [...Array(15).keys()].map((i) => {
                    return {
                        id: 43368721962707 + i + 15,
                    };
                }),
            },
            { count: 35, page: 3, page_size: 25, results: [] },
        ];
        wsClient.dashboards._list = async function () {
            return responses.shift();
        };
        const items = [];
        for await (const dashboard of wsClient.dashboards.list({})) {
            items.push(dashboard);
        }
        assert.equal(items.length, 30);
    });
    it("should paginate cluster events", async () => {
        const responses = [
            {
                events: [...Array(50).keys()].map((i) => {
                    return {
                        cluster_id: `0819-204509-12345`,
                        timestamp: 1629475046792 + i,
                    };
                }),
                next_page: {
                    cluster_id: "0819-204509-12345",
                    end_time: 1681289683905,
                    offset: 50,
                },
                total_count: 101,
            },
            {
                events: [...Array(50).keys()].map((i) => {
                    return {
                        cluster_id: `0819-204509-12345`,
                        timestamp: 1629475046792 + i + 50,
                    };
                }),
                next_page: {
                    cluster_id: "0819-204509-12345",
                    end_time: 1681289683905,
                    offset: 100,
                },
                total_count: 101,
            },
            {
                events: [
                    {
                        cluster_id: "0819-204509-12345",
                        timestamp: 1629475046792,
                        type: "EDITED",
                        details: [Object],
                    },
                ],
                total_count: 101,
            },
        ];
        wsClient.clusters._events = async function () {
            return responses.shift();
        };
        const items = [];
        for await (const item of wsClient.clusters.events({
            cluster_id: process.env.DATABRICKS_CLUSTER_ID,
        })) {
            items.push(item);
        }
        assert.equal(items.length, 101);
    });
    // this case doesn't seem to exist
    it.skip("should return the body for calls that don't paginate", async () => { });
    // cluster policies
    it("should return items for calls that don't paginate", async () => {
        wsClient.clusterPolicies._list = async function () {
            return {
                policies: [...Array(50).keys()].map((i) => {
                    return {
                        policy_id: `abcd-${i}`,
                    };
                }),
            };
        };
        const items = [];
        for await (const item of wsClient.clusterPolicies.list({})) {
            items.push(item);
        }
        assert.equal(items.length, 50);
    });
});
//# sourceMappingURL=Pagination.test.js.map