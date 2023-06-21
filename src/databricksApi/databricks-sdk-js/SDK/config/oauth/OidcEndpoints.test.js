"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const assert_1 = __importDefault(require("assert"));
const ts_mockito_1 = require("ts-mockito");
const OidcEndpoints_1 = require("./OidcEndpoints");
const Client_1 = require("./Client");
const Config_1 = require("../Config");
describe(__filename, () => {
    const config = new Config_1.Config({
        host: "https://example.com",
        isAzure: () => false,
        isAccountClient: () => false,
        accountId: undefined,
    });
    const authorizationEndpoint = new URL("https://example.com/authorize");
    const tokenEndpoint = new URL("https://example.com/token");
    describe("constructor", () => {
        const endpoints = new OidcEndpoints_1.OidcEndpoints(config, authorizationEndpoint, tokenEndpoint);
        it("should create an instance of Issuer", () => {
            assert_1.default.ok(endpoints instanceof OidcEndpoints_1.OidcEndpoints);
        });
    });
    describe("getClient", () => {
        const endpoints = new OidcEndpoints_1.OidcEndpoints(config, authorizationEndpoint, tokenEndpoint);
        it("should return an instance of Client", () => {
            const client = endpoints.getClient({
                clientId: "client-id",
                clientSecret: "client-secret",
            });
            assert_1.default.ok(client instanceof Client_1.Client);
        });
    });
    describe("discover", () => {
        it("should return undefined if config.host is not set", async () => {
            const config = new Config_1.Config({});
            const result = await config.getOidcEndpoints();
            assert_1.default.strictEqual(result, undefined);
        });
        it("should return an instance of Issuer for Azure", async () => {
            const response = {
                headers: {
                    location: "https://example.com/real-auth-url/authorize",
                },
            };
            const cfg = new Config_1.Config({
                ...config,
            });
            (0, ts_mockito_1.when)((0, ts_mockito_1.spy)(cfg).fetch((0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenResolve(response);
            cfg.isAzure = () => true;
            const result = await cfg.getOidcEndpoints();
            assert_1.default.ok(result instanceof OidcEndpoints_1.OidcEndpoints);
            assert_1.default.deepStrictEqual(result.authorizationEndpoint.href, "https://example.com/real-auth-url/authorize");
            assert_1.default.deepStrictEqual(result.tokenEndpoint.href, "https://example.com/real-auth-url/token");
        });
        it("should return an instance for a workspace client", async () => {
            const cfg = new Config_1.Config({
                ...config,
            });
            const response = {
                status: 200,
                json: async () => ({
                    authorization_endpoint: "https://example.com/authorize",
                    token_endpoint: "https://example.com/token",
                }),
            };
            (0, ts_mockito_1.when)((0, ts_mockito_1.spy)(cfg).fetch((0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenResolve(response);
            const result = await cfg.getOidcEndpoints();
            assert_1.default.ok(result instanceof OidcEndpoints_1.OidcEndpoints);
            assert_1.default.deepStrictEqual(result.authorizationEndpoint, new URL("https://example.com/authorize"));
            assert_1.default.deepStrictEqual(result.tokenEndpoint, new URL("https://example.com/token"));
        });
        it("should return an instance of Issuer for account client", async () => {
            const cfg = new Config_1.Config({
                ...config,
                isAccountClient: () => true,
                accountId: "123",
            });
            const result = await cfg.getOidcEndpoints();
            assert_1.default.ok(result instanceof OidcEndpoints_1.OidcEndpoints);
            assert_1.default.deepStrictEqual(result.authorizationEndpoint, new URL("https://example.com/oidc/accounts/123/v1/authorize"));
            assert_1.default.deepStrictEqual(result.tokenEndpoint, new URL("https://example.com/oidc/accounts/123/v1/token"));
        });
    });
});
//# sourceMappingURL=OidcEndpoints.test.js.map