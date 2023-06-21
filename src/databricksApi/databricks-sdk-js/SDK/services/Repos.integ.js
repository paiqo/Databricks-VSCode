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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const IntegrationTestSetup_1 = require("../test/IntegrationTestSetup");
const assert = __importStar(require("node:assert"));
const Repos_1 = require("./Repos");
const repos_1 = require("../apis/repos");
const node_crypto_1 = require("node:crypto");
const workspace_1 = require("../apis/workspace");
const context_1 = require("../context");
describe(__filename, function () {
    let integSetup;
    const repoDir = "/Repos/js-sdk-tests";
    let testRepoDetails;
    this.timeout(10 * 60 * 1000);
    async function createRandomRepo(repoService) {
        repoService =
            repoService ?? new repos_1.ReposService(integSetup.client.apiClient);
        const id = (0, node_crypto_1.randomUUID)();
        const resp = await repoService.create({
            path: `${repoDir}/test-${id}`,
            url: "https://github.com/fjakobs/empty-repo.git",
            provider: "github",
        });
        assert.equal(resp.path, `${repoDir}/test-${id}`);
        return resp;
    }
    before(async () => {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
        const workspaceService = new workspace_1.WorkspaceService(integSetup.client.apiClient);
        await workspaceService.mkdirs({
            path: repoDir,
        });
        testRepoDetails = await createRandomRepo(new repos_1.ReposService(integSetup.client.apiClient));
    });
    after(async () => {
        const repos = new repos_1.ReposService(integSetup.client.apiClient);
        await repos.delete({ repo_id: testRepoDetails.id });
    });
    it("should list repos by prefix", async () => {
        const repos = [];
        for await (const repo of Repos_1.Repo.list(integSetup.client.apiClient, {
            path_prefix: repoDir,
        })) {
            repos.push(repo);
        }
        assert.ok(repos.length > 0);
    });
    // skip test as it takes too long to run
    it.skip("should list all repos", async () => {
        const repos = [];
        for await (const repo of Repos_1.Repo.list(integSetup.client.apiClient, {})) {
            repos.push(repo);
        }
        assert.ok(repos.length > 0);
    });
    it("should cancel listing repos", async () => {
        let listener;
        const token = {
            isCancellationRequested: false,
            onCancellationRequested: (_listener) => {
                listener = _listener;
            },
        };
        const response = Repos_1.Repo.list(integSetup.client.apiClient, {
            path_prefix: repoDir,
        }, new context_1.Context({ cancellationToken: token }));
        setTimeout(() => {
            token.isCancellationRequested = true;
            listener && listener();
        }, 100);
        // reponse should finish soon after cancellation
        const start = Date.now();
        try {
            for await (const repo of response) {
                assert.ok(repo);
            }
        }
        catch (err) {
            assert.equal(err.name, "AbortError");
        }
        assert.ok(Date.now() - start < 300);
    });
    it("Should find the exact matching repo if multiple repos with same prefix in fromPath", async () => {
        const actual = await Repos_1.Repo.fromPath(integSetup.client.apiClient, testRepoDetails.path);
        assert.equal(actual.path, testRepoDetails.path);
    });
});
//# sourceMappingURL=Repos.integ.js.map