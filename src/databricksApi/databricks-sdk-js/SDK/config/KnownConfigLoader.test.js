"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ini_1 = require("ini");
const node_assert_1 = __importDefault(require("node:assert"));
const KnownConfigLoader_1 = require("./KnownConfigLoader");
describe(__filename, () => {
    it("should handle profiles with a dot in the name", () => {
        const config = (0, KnownConfigLoader_1.flattenIniObject)((0, ini_1.parse)(`[foo.bar]
host = https://foo.bar

[.foo]
host = https://foo

[bar]
host = https://bar`));
        node_assert_1.default.equal(config["foo.bar"].host, "https://foo.bar");
        node_assert_1.default.equal(config[".foo"].host, "https://foo");
        node_assert_1.default.equal(config["bar"].host, "https://bar");
    });
});
//# sourceMappingURL=KnownConfigLoader.test.js.map