"use strict";
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
const retries_1 = __importStar(require("./retries"));
const Time_1 = __importStar(require("./Time"));
const fake_timers_1 = __importDefault(require("@sinonjs/fake-timers"));
const assert = __importStar(require("node:assert"));
class NonRetriableError extends Error {
}
describe(__filename, () => {
    let fakeTimer;
    beforeEach(() => {
        fakeTimer = fake_timers_1.default.install();
    });
    afterEach(() => {
        fakeTimer.uninstall();
    });
    it("should return result if timeout doesn't expire", async function () {
        const startTime = Date.now();
        const retryResult = (0, retries_1.default)({
            timeout: new Time_1.default(5, Time_1.TimeUnits.seconds),
            fn: () => {
                if (Date.now() - startTime < 1000) {
                    throw new retries_1.RetriableError();
                }
                return new Promise((resolve) => resolve("returned_string"));
            },
        });
        fakeTimer.tick(800);
        fakeTimer.tick(800);
        fakeTimer.tick(800);
        assert.equal(await retryResult, "returned_string");
    });
    it("should return retriable error if timeout expires", async function () {
        const startTime = Date.now();
        const retryResult = (0, retries_1.default)({
            timeout: new Time_1.default(5, Time_1.TimeUnits.seconds),
            fn: () => {
                if (Date.now() - startTime < 10000) {
                    throw new retries_1.RetriableError();
                }
                return new Promise((resolve) => resolve("returned_string"));
            },
        });
        fakeTimer.tick(800);
        fakeTimer.tick(800);
        fakeTimer.tick(2000);
        fakeTimer.tick(5000);
        try {
            await retryResult;
            assert.fail("should throw TimeoutError");
        }
        catch (err) {
            assert.ok(err instanceof retries_1.TimeoutError);
        }
    });
    it("should throw non retriable error immediately", async function () {
        let callCount = 0;
        try {
            await (0, retries_1.default)({
                timeout: new Time_1.default(5, Time_1.TimeUnits.seconds),
                fn: () => {
                    callCount += 1;
                    throw new NonRetriableError();
                },
            });
            assert.fail("should throw NonRetriableError");
        }
        catch (err) {
            assert.ok(err instanceof NonRetriableError);
        }
        assert.equal(callCount, 1);
    });
});
//# sourceMappingURL=retries.test.js.map