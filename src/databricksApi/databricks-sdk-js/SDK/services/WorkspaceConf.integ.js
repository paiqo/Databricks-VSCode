"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const assert_1 = __importDefault(require("assert"));
const IntegrationTestSetup_1 = require("../test/IntegrationTestSetup");
describe(__filename, function () {
    let integSetup;
    this.timeout(10 * 60 * 1000);
    before(async function () {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
        try {
            const wsConf = new __1.WorkspaceConf(integSetup.client.apiClient);
            await wsConf.getStatus(["enableProjectTypeInWorkspace"]);
        }
        catch (e) {
            if (e instanceof __1.ApiError && e.statusCode === 403) {
                // eslint-disable-next-line no-console
                console.log("Workspace conf tests require administrator permissions");
                this.skip();
            }
        }
    });
    it("should read configuration properties", async () => {
        const wsConf = new __1.WorkspaceConf(integSetup.client.apiClient);
        const state = await wsConf.getStatus([
            "enableProjectTypeInWorkspace",
            "enableWorkspaceFilesystem",
        ]);
        (0, assert_1.default)("enableProjectTypeInWorkspace" in state);
        (0, assert_1.default)("enableWorkspaceFilesystem" in state);
    });
});
//# sourceMappingURL=WorkspaceConf.integ.js.map