"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const IntegrationTestSetup_1 = require("../../test/IntegrationTestSetup");
describe(__filename, function () {
    let integSetup;
    this.timeout(10 * 60 * 1000);
    before(async () => {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
    });
    it("should execute python with low level API", async () => {
        const commandsApi = integSetup.client.commands;
        const context = await (await commandsApi.create({
            clusterId: integSetup.cluster.id,
            language: "python",
        })).wait();
        //console.log("Execution context", context);
        const status = await (await commandsApi.execute({
            clusterId: integSetup.cluster.id,
            contextId: context.id,
            language: "python",
            command: "print('juhu')",
        })).wait();
        // console.log("Status", status);
        (0, assert_1.default)(status.results);
        (0, assert_1.default)(status.results.resultType === "text");
        assert_1.default.equal(status.results.data, "juhu");
        await commandsApi.destroy({
            clusterId: integSetup.cluster.id,
            contextId: context.id,
        });
    });
});
//# sourceMappingURL=commands.integ.js.map