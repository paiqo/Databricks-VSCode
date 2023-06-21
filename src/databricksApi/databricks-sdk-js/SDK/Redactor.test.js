"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const _1 = require(".");
const Redactor_1 = require("./Redactor");
describe(__filename, () => {
    it("should redact by field names", () => {
        const testObj = {
            prop: "value1",
            nested: {
                prop: false,
                prop2: "value",
                headers: {
                    header1: "test",
                    header2: "value",
                },
            },
        };
        _1.defaultRedactor.addFieldName("prop");
        const actual = _1.defaultRedactor.sanitize(testObj, ["headers"]);
        const expected = {
            prop: "***REDACTED***",
            nested: {
                prop: "***REDACTED***",
                prop2: "value",
            },
        };
        assert_1.default.deepEqual(actual, expected);
    });
    it("should truncate string to n bytes", () => {
        const n = 5;
        const str = "1234567890";
        assert_1.default.equal((0, Redactor_1.onlyNBytes)(str, n), "12345...(5 more bytes)");
    });
    it("should handle circular objects", () => {
        const a = {};
        a["a"] = a;
        a["b"] = "b";
        const actual = _1.defaultRedactor.sanitize(a);
        const expected = {
            a: "circular ref",
            b: "b",
        };
        assert_1.default.deepEqual(actual, expected);
    });
    it("should handle circular lists", () => {
        const a = [1, 2];
        a.push(a);
        const actual = _1.defaultRedactor.sanitize(a);
        const expected = [1, 2, "circular ref"];
        assert_1.default.deepEqual(actual, expected);
    });
});
//# sourceMappingURL=Redactor.test.js.map