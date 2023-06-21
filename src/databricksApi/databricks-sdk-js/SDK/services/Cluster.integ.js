"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const node_assert_1 = __importDefault(require("node:assert"));
const IntegrationTestSetup_1 = require("../test/IntegrationTestSetup");
describe(__filename, function () {
    let integSetup;
    this.timeout(10 * 60 * 1000);
    before(async () => {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
    });
    it("should create an execution context", async () => {
        (0, node_assert_1.default)(await integSetup.cluster.canExecute());
        const ctx = await integSetup.cluster.createExecutionContext();
        const { result } = await ctx.execute("print('hello')");
        (0, node_assert_1.default)(result.results);
        (0, node_assert_1.default)(result.results.resultType === "text");
        node_assert_1.default.equal(result.results.data, "hello");
    });
    it("should load a cluster by name", async () => {
        const clusterA = integSetup.cluster;
        const clusterB = await __1.Cluster.fromClusterName(integSetup.client.apiClient, clusterA.details.cluster_name);
        (0, node_assert_1.default)(clusterA.id);
        node_assert_1.default.equal(clusterA.id, clusterB?.id);
    });
    // skipping because running the test takes too long
    it.skip("should start a stopping cluster", async () => {
        let listener;
        const token = {
            isCancellationRequested: false,
            onCancellationRequested: (_listener) => {
                listener = _listener;
            },
        };
        const cluster = integSetup.cluster;
        // stop cluster
        await Promise.race([
            cluster.stop(token, async (info) => 
            // eslint-disable-next-line no-console
            console.log(`Stopping - ${info.state}`)),
            new Promise((resolve) => {
                // cancel stop
                setTimeout(() => {
                    token.isCancellationRequested = true;
                    listener();
                    resolve();
                }, 500);
            }),
        ]);
        // start cluster
        await cluster.start(undefined, (state) => 
        // eslint-disable-next-line no-console
        console.log(`Starting ${state}`));
    });
});
//# sourceMappingURL=Cluster.integ.js.map