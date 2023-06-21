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
/* eslint-disable @typescript-eslint/naming-convention */
const http = __importStar(require("http"));
const node_assert_1 = __importDefault(require("node:assert"));
const Config_1 = require("./Config");
const MetadataServiceCredentials_1 = require("./MetadataServiceCredentials");
describe(__filename, () => {
    let server;
    beforeEach(async () => {
        let i = 0;
        server = http.createServer((req, res) => {
            if (req.headers[MetadataServiceCredentials_1.MetadataServiceVersionHeader] !==
                MetadataServiceCredentials_1.MetadataServiceVersion) {
                res.writeHead(400);
                res.end();
                return;
            }
            if (req.headers[MetadataServiceCredentials_1.MetadataServiceHostHeader] !== "https://test.com") {
                res.writeHead(404);
                res.end();
                return;
            }
            const response = {
                access_token: `XXXX-${i++}`,
                expires_on: Math.floor(new Date(Date.now() + 1000).getTime() / 1000),
                token_type: "Bearer",
            };
            res.end(JSON.stringify(response));
        });
        await new Promise((resolve, reject) => {
            server.listen(0, "127.0.0.1", () => {
                resolve(null);
            });
            server.on("error", (err) => {
                reject(err);
            });
        });
    });
    afterEach(async () => {
        await new Promise((resolve) => {
            server.close(() => {
                resolve(null);
            });
        });
    });
    it("should authorize using local server", async () => {
        const lmsCredentials = new MetadataServiceCredentials_1.MetadataServiceCredentials();
        const config = new Config_1.Config({
            host: "https://test.com",
            authType: "metadata-service",
            localMetadataServiceUrl: `http://localhost:${server.address().port}`,
        });
        const visitor = await lmsCredentials.configure(config);
        node_assert_1.default.ok(visitor);
        const headers = {};
        await visitor(headers);
        node_assert_1.default.equal(headers["Authorization"], "Bearer XXXX-1");
    });
    it("should check host", async () => {
        const lmsCredentials = new MetadataServiceCredentials_1.MetadataServiceCredentials();
        const config = new Config_1.Config({
            host: "https://test2.com",
            authType: "metadata-service",
            localMetadataServiceUrl: `http://localhost:${server.address().port}`,
        });
        const visitor = await lmsCredentials.configure(config);
        node_assert_1.default.ok(!visitor);
    });
    it("should refresh credentials", async () => {
        const lmsCredentials = new MetadataServiceCredentials_1.MetadataServiceCredentials();
        const config = new Config_1.Config({
            host: "https://test.com",
            authType: "metadata-service",
            localMetadataServiceUrl: `http://localhost:${server.address().port}`,
        });
        const visitor = await lmsCredentials.configure(config);
        node_assert_1.default.ok(visitor);
        const headers = {};
        await visitor(headers);
        node_assert_1.default.equal(headers["Authorization"], "Bearer XXXX-1");
        // expires immediately since expiery is lower than expiryDelta
        await visitor(headers);
        node_assert_1.default.equal(headers["Authorization"], "Bearer XXXX-2");
    });
});
//# sourceMappingURL=MetadataServiceCredentials.test.js.map