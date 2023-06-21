"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
require(".");
const node_assert_1 = __importDefault(require("node:assert"));
const api_client_1 = require("./api-client");
const _1 = require(".");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sdkVersion = require("../package.json").version;
describe(__filename, () => {
    beforeEach(() => {
        delete process.env.DATABRICKS_CONFIG_FILE;
    });
    it("should create proper user agent", () => {
        const ua = new api_client_1.ApiClient(new _1.Config({
            authType: "pat",
        }), {
            product: "unit",
            productVersion: "3.4.5",
        }).userAgent();
        node_assert_1.default.equal(ua, `unit/3.4.5 databricks-sdk-js/${sdkVersion} nodejs/${process.version.slice(1)} os/${process.platform} auth/pat`);
    });
});
//# sourceMappingURL=api-client.test.js.map