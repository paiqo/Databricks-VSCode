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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const assert = __importStar(require("node:assert"));
const ts_mockito_1 = require("ts-mockito");
const Time_1 = __importStar(require("../retries/Time"));
const ClusterFixtures_1 = require("../test/fixtures/ClusterFixtures");
const TokenFixtures_1 = require("../test/fixtures/TokenFixtures");
const fake_timers_1 = __importDefault(require("@sinonjs/fake-timers"));
describe(__filename, function () {
    this.timeout(new Time_1.default(10, Time_1.TimeUnits.minutes).toMillSeconds().value);
    let mockedClient;
    let mockedCluster;
    let testClusterDetails;
    let fakeTimer;
    beforeEach(async () => {
        ({ mockedCluster, mockedClient, testClusterDetails } =
            await (0, ClusterFixtures_1.getMockTestCluster)());
        fakeTimer = fake_timers_1.default.install();
    });
    afterEach(() => {
        fakeTimer.uninstall();
    });
    it("calling start on a non terminated state should not throw an error", async () => {
        (0, ts_mockito_1.when)(mockedClient.request("/api/2.0/clusters/get", "GET", (0, ts_mockito_1.deepEqual)({
            cluster_id: testClusterDetails.cluster_id,
        }), (0, ts_mockito_1.anything)())).thenResolve({
            ...testClusterDetails,
            state: "PENDING",
        }, {
            ...testClusterDetails,
            state: "PENDING",
        }, {
            ...testClusterDetails,
            state: "PENDING",
        }, {
            ...testClusterDetails,
            state: "PENDING",
        }, {
            ...testClusterDetails,
            state: "PENDING",
        }, {
            ...testClusterDetails,
            state: "RUNNING",
        });
        await mockedCluster.refresh();
        assert.notEqual(mockedCluster.state, "RUNNING");
        const startPromise = mockedCluster.start();
        await fakeTimer.runToLastAsync();
        await startPromise;
        assert.equal(mockedCluster.state, "RUNNING");
        (0, ts_mockito_1.verify)(mockedClient.request("/api/2.0/clusters/get", (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).times(6);
        (0, ts_mockito_1.verify)(mockedClient.request("/api/2.0/clusters/start", (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).never();
    });
    it("should terminate cluster", async () => {
        (0, ts_mockito_1.when)(mockedClient.request("/api/2.0/clusters/get", "GET", (0, ts_mockito_1.deepEqual)({
            cluster_id: testClusterDetails.cluster_id,
        }), (0, ts_mockito_1.anything)())).thenResolve({
            ...testClusterDetails,
            state: "RUNNING",
        }, {
            ...testClusterDetails,
            state: "TERMINATING",
        }, {
            ...testClusterDetails,
            state: "TERMINATED",
        });
        (0, ts_mockito_1.when)(mockedClient.request("/api/2.0/clusters/delete", "POST", (0, ts_mockito_1.deepEqual)({
            cluster_id: testClusterDetails.cluster_id,
        }), (0, ts_mockito_1.anything)())).thenResolve({});
        assert.equal(mockedCluster.state, "RUNNING");
        const stopPromise = mockedCluster.stop();
        await fakeTimer.runToLastAsync();
        await stopPromise;
        assert.equal(mockedCluster.state, "TERMINATED");
        (0, ts_mockito_1.verify)(mockedClient.request("/api/2.0/clusters/get", (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).times(3);
        (0, ts_mockito_1.verify)(mockedClient.request("/api/2.0/clusters/delete", (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).once();
    });
    it("should terminate non running clusters", async () => {
        (0, ts_mockito_1.when)(mockedClient.request("/api/2.0/clusters/get", "GET", (0, ts_mockito_1.deepEqual)({
            cluster_id: testClusterDetails.cluster_id,
        }), (0, ts_mockito_1.anything)())).thenResolve({
            ...testClusterDetails,
            state: "PENDING",
        }, {
            ...testClusterDetails,
            state: "TERMINATING",
        }, {
            ...testClusterDetails,
            state: "TERMINATED",
        });
        await mockedCluster.refresh();
        assert.notEqual(mockedCluster.state, "RUNNING");
        const stopPromise = mockedCluster.stop();
        await fakeTimer.runToLastAsync();
        await stopPromise;
        assert.equal(mockedCluster.state, "TERMINATED");
        (0, ts_mockito_1.verify)(mockedClient.request("/api/2.0/clusters/get", (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).times(3);
        (0, ts_mockito_1.verify)(mockedClient.request("/api/2.0/clusters/delete", (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).once();
    });
    it("should cancel cluster start", async () => {
        const whenMockGetCluster = (0, ts_mockito_1.when)(mockedClient.request("/api/2.0/clusters/get", "GET", (0, ts_mockito_1.deepEqual)({
            cluster_id: testClusterDetails.cluster_id,
        }), (0, ts_mockito_1.anything)()));
        whenMockGetCluster.thenResolve({
            ...testClusterDetails,
            state: "PENDING",
        });
        (0, ts_mockito_1.when)(mockedClient.request("/api/2.0/clusters/delete", "POST", (0, ts_mockito_1.deepEqual)({
            cluster_id: testClusterDetails.cluster_id,
        }), (0, ts_mockito_1.anything)())).thenCall(() => {
            whenMockGetCluster.thenResolve({
                ...testClusterDetails,
                state: "TERMINATING",
            }, {
                ...testClusterDetails,
                state: "TERMINATED",
            });
            return {};
        });
        const token = (0, ts_mockito_1.mock)(TokenFixtures_1.TokenFixture);
        (0, ts_mockito_1.when)(token.isCancellationRequested).thenReturn(false, false, true);
        //mocked cluster is initially in running state, this gets it to pending state
        await mockedCluster.refresh();
        assert.equal(mockedCluster.state, "PENDING");
        const startPromise = mockedCluster.start((0, ts_mockito_1.instance)(token));
        await fakeTimer.runToLastAsync();
        await startPromise;
        (0, ts_mockito_1.verify)(token.isCancellationRequested).thrice();
    });
    it("should parse DBR from spark_version", () => {
        const mockedClient = (0, ts_mockito_1.mock)(__1.ApiClient);
        const clusterDetails = {
            spark_version: "7.3.x-scala2.12",
        };
        const cluster = new __1.Cluster((0, ts_mockito_1.instance)(mockedClient), clusterDetails);
        const versions = [
            ["11.x-snapshot-aarch64-scala2.12", [11, "x", "x"]],
            ["10.4.x-scala2.12", [10, 4, "x"]],
            ["7.3.x-scala2.12", [7, 3, "x"]],
            [
                "custom:custom-local__11.3.x-snapshot-cpu-ml-scala2.12__unknown__head__7335a01__cb1aa83__jenkins__641f1a5__format-2.lz4",
                [11, 3, "x"],
            ],
        ];
        for (const [sparkVersion, expectedDbr] of versions) {
            clusterDetails.spark_version = sparkVersion;
            assert.deepEqual(cluster.dbrVersion, expectedDbr);
        }
    });
    it("should return correct URLs", async () => {
        const mockedClient = (0, ts_mockito_1.mock)(__1.ApiClient);
        (0, ts_mockito_1.when)(mockedClient.host).thenResolve(new URL("https://test.cloud.databricks.com"));
        const clusterDetails = {
            cluster_id: "1118-013127-82wynr8t",
        };
        const cluster = new __1.Cluster((0, ts_mockito_1.instance)(mockedClient), clusterDetails);
        assert.equal(await cluster.url, "https://test.cloud.databricks.com/#setting/clusters/1118-013127-82wynr8t/configuration");
        assert.equal(await cluster.driverLogsUrl, "https://test.cloud.databricks.com/#setting/clusters/1118-013127-82wynr8t/driverLogs");
        assert.equal(await cluster.metricsUrl, "https://test.cloud.databricks.com/#setting/clusters/1118-013127-82wynr8t/metrics");
        assert.equal(await cluster.getSparkUiUrl(), "https://test.cloud.databricks.com/#setting/clusters/1118-013127-82wynr8t/sparkUi");
        assert.equal(await cluster.getSparkUiUrl("7189805239423176682"), "https://test.cloud.databricks.com/#setting/sparkui/1118-013127-82wynr8t/driver-7189805239423176682");
    });
});
//# sourceMappingURL=Cluster.test.js.map