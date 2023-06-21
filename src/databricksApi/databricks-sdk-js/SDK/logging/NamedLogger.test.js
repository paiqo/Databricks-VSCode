"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("..");
const _1 = require(".");
const stream_1 = require("stream");
const assert_1 = __importDefault(require("assert"));
describe(__filename, () => {
    it("should scrub debug headers if DATABRICKS_DEBUG_HEADERS is not set", () => {
        process.env["DATABRICKS_DEBUG_HEADERS"] = undefined;
        const logs = [];
        const stream = new stream_1.PassThrough();
        stream.on("data", (data) => {
            logs.push(data.toString());
        });
        const logger = _1.NamedLogger.getOrCreate("TEST", {
            factory: () => new _1.DefaultLogger(stream),
        }, true);
        logger.debug("test", {
            headers: "header",
            agent: "agent",
            somethingElse: "value",
        });
        assert_1.default.equal(logs.length, 1);
        logs.forEach((value) => {
            const jsonValue = JSON.parse(value);
            delete jsonValue["timestamp"];
            assert_1.default.deepEqual(jsonValue, {
                logger: "TEST",
                level: "debug",
                message: "test",
                somethingElse: "value",
            });
        });
    });
    it("should show debug headers if DATABRICKS_DEBUG_HEADERS is set", () => {
        process.env["DATABRICKS_DEBUG_HEADERS"] = "true";
        const logs = [];
        const stream = new stream_1.PassThrough();
        stream.on("data", (data) => {
            logs.push(data.toString());
        });
        const logger = _1.NamedLogger.getOrCreate("TEST", {
            factory: () => new _1.DefaultLogger(stream),
        }, true);
        logger.debug("test", {
            headers: "header",
            agent: "agent",
            somethingElse: "value",
        });
        assert_1.default.equal(logs.length, 1);
        logs.forEach((value) => {
            const jsonValue = JSON.parse(value);
            delete jsonValue["timestamp"];
            assert_1.default.deepEqual(jsonValue, {
                logger: "TEST",
                level: "debug",
                message: "test",
                headers: "header",
                agent: "agent",
                somethingElse: "value",
            });
        });
    });
    afterEach(() => {
        process.env["DATABRICKS_DEBUG_HEADERS"] = undefined;
    });
});
//# sourceMappingURL=NamedLogger.test.js.map