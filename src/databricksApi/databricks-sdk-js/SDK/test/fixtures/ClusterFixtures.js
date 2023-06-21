"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockTestCluster = void 0;
const __1 = require("../..");
const ts_mockito_1 = require("ts-mockito");
const testClusterDetails = {
    cluster_id: "testClusterId",
    cluster_name: "testClusterName",
};
async function getMockTestCluster() {
    const mockedClient = (0, ts_mockito_1.mock)(__1.ApiClient);
    (0, ts_mockito_1.when)(mockedClient.request("/api/2.0/clusters/get", "GET", (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenResolve({
        ...testClusterDetails,
        state: "RUNNING",
    });
    const mockedCluster = await __1.Cluster.fromClusterId((0, ts_mockito_1.instance)(mockedClient), testClusterDetails.cluster_id);
    (0, ts_mockito_1.resetCalls)(mockedClient);
    return { mockedCluster, mockedClient, testClusterDetails };
}
exports.getMockTestCluster = getMockTestCluster;
//# sourceMappingURL=ClusterFixtures.js.map