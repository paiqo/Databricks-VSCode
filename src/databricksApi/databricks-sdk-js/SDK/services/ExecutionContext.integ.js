"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const assert_1 = __importDefault(require("assert"));
const IntegrationTestSetup_1 = require("../test/IntegrationTestSetup");
const ts_mockito_1 = require("ts-mockito");
const TokenFixtures_1 = require("../test/fixtures/TokenFixtures");
const retries_1 = require("../retries/retries");
describe(__filename, function () {
    let integSetup;
    this.timeout(10 * 60 * 1000);
    before(async () => {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
    });
    it("should run python with high level API", async () => {
        const context = await __1.ExecutionContext.create(integSetup.client.apiClient, integSetup.cluster);
        let statusUpdateCalled = false;
        let { cmd, result } = await context.execute("print('juhu')", () => (statusUpdateCalled = true));
        (0, assert_1.default)(cmd);
        (0, assert_1.default)(statusUpdateCalled);
        (0, assert_1.default)(result.results);
        (0, assert_1.default)(result.results.resultType === "text");
        assert_1.default.equal(result.results.data, "juhu");
        statusUpdateCalled = false;
        ({ cmd, result } = await context.execute("print('kinners')"));
        (0, assert_1.default)(cmd);
        (0, assert_1.default)(!statusUpdateCalled);
        (0, assert_1.default)(result.results);
        (0, assert_1.default)(result.results.resultType === "text");
        assert_1.default.equal(result.results.data, "kinners");
        await context.destroy();
    });
    it("should cancel running command", async () => {
        const context = await __1.ExecutionContext.create(integSetup.client.apiClient, integSetup.cluster);
        const token = (0, ts_mockito_1.mock)(TokenFixtures_1.TokenFixture);
        (0, ts_mockito_1.when)(token.isCancellationRequested).thenReturn(false, false, true);
        const { cmd, result } = await context.execute("while True: pass", undefined, (0, ts_mockito_1.instance)(token), retries_1.DEFAULT_MAX_TIMEOUT);
        // The API surfaces an exception when a command is cancelled
        // The cancellation itself proceeds as expected, but the status
        // is FINISHED instead of CANCELLED
        (0, assert_1.default)(cmd);
        assert_1.default.equal(result.status, "Finished");
        (0, assert_1.default)(result.results?.resultType === "error");
        (0, assert_1.default)(result.results.cause.includes("CommandCancelledException"));
    });
});
//# sourceMappingURL=ExecutionContext.integ.js.map