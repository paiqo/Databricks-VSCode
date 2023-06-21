"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("..");
const _1 = require(".");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const context_1 = require("../context");
const context_2 = require("../context");
const stream_1 = require("stream");
const assert_1 = __importDefault(require("assert"));
class B {
    async run(context) {
        context?.logger?.debug("B: start");
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
        context?.logger?.debug("B: end");
    }
}
__decorate([
    (0, _1.withLogContext)("Test"),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_2.Context]),
    __metadata("design:returntype", Promise)
], B.prototype, "run", null);
class A {
    constructor() {
        this.b = new B();
    }
    async run(context) {
        context?.logger?.debug("A: start");
        await this.b.run(context);
        context?.logger?.debug("A: end");
    }
}
__decorate([
    (0, _1.withLogContext)("Test"),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_2.Context]),
    __metadata("design:returntype", Promise)
], A.prototype, "run", null);
describe(__filename, () => {
    it("should log multiple contexts", async () => {
        const logs = [];
        const stream = new stream_1.PassThrough();
        stream.on("data", (data) => {
            logs.push(data.toString());
        });
        const logger = _1.NamedLogger.getOrCreate("Test", {
            factory: () => {
                return new _1.DefaultLogger(stream);
            },
        });
        (0, assert_1.default)(logger);
        const firstExec = new A().run(new context_2.Context({ opId: "testId" }));
        const secondExec = new A().run(new context_2.Context({ opId: "testId2" }));
        await firstExec;
        await secondExec;
        assert_1.default.equal(logs.length, 8);
        const jsonLogs = logs.map((value) => JSON.parse(value));
        function findLog(id, target) {
            return jsonLogs.find((v) => v.message.includes(target) && v.operationId === id);
        }
        function testForExec(execId) {
            assert_1.default.notEqual(findLog(execId, "A: start"), undefined);
            assert_1.default.notEqual(findLog(execId, "B: start"), undefined);
            assert_1.default.notEqual(findLog(execId, "B: end"), undefined);
            assert_1.default.notEqual(findLog(execId, "A: end"), undefined);
            assert_1.default.ok(findLog(execId, "A: start")?.timestamp <=
                findLog(execId, "B: start")?.timestamp);
            assert_1.default.ok(findLog(execId, "B: start")?.timestamp <=
                findLog(execId, "B: end")?.timestamp);
            assert_1.default.ok(findLog(execId, "B: end")?.timestamp <=
                findLog(execId, "A: end")?.timestamp);
        }
        testForExec("testId");
        testForExec("testId2");
    });
});
//# sourceMappingURL=loggingDecorators.test.js.map