"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const assert_1 = __importDefault(require("assert"));
const ts_mockito_1 = require("ts-mockito");
const Client_1 = require("./Client");
const OidcEndpoints_1 = require("./OidcEndpoints");
const Token_1 = require("../Token");
const Config_1 = require("../Config");
describe(__filename, () => {
    const issuer = new OidcEndpoints_1.OidcEndpoints(new Config_1.Config({
        host: "https://example.com",
        isAzure: () => false,
        isAccountClient: () => false,
        accountId: undefined,
    }), new URL("https://example.com/authorize"), new URL("https://example.com/token"));
    const options = {
        clientId: "client-id",
        clientSecret: "client-secret",
    };
    describe("constructor", () => {
        it("should create an instance of Client", () => {
            const client = new Client_1.Client(issuer, options);
            assert_1.default.ok(client instanceof Client_1.Client);
        });
        it("should set default options", () => {
            const clientWithOptions = new Client_1.Client(issuer, {
                clientId: "client-id",
                clientSecret: "client-secret",
            });
            assert_1.default.deepStrictEqual(clientWithOptions.options, {
                clientId: "client-id",
                clientSecret: "client-secret",
                useParams: false,
                useHeader: false,
                headers: {},
            });
        });
    });
    describe("grant", () => {
        it("should not send secrets by default", async () => {
            const client = new Client_1.Client(issuer, options);
            const clientSpy = (0, ts_mockito_1.spy)(client);
            (0, ts_mockito_1.when)(clientSpy.fetch((0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenResolve({
                json: () => Promise.resolve({
                    access_token: "access-token",
                    expires_in: 3600,
                }),
                ok: true,
                headers: new Map(),
            });
            await client.grant("scope");
            (0, ts_mockito_1.verify)(clientSpy.fetch("https://example.com/token", (0, ts_mockito_1.anything)())).once();
        });
        it("should return a token", async () => {
            const client = new Client_1.Client(issuer, options);
            const clientSpy = (0, ts_mockito_1.spy)(client);
            (0, ts_mockito_1.when)(clientSpy.fetch((0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenResolve({
                json: () => Promise.resolve({
                    access_token: "access-token",
                    expires_in: 3600,
                }),
                ok: true,
                headers: new Map(),
            });
            const token = await client.grant("scope");
            assert_1.default.ok(token instanceof Token_1.Token);
            assert_1.default.equal(token.accessToken, "access-token");
            assert_1.default.ok(token.expiry);
        });
        it("should not send secrets in params if specified", async () => {
            const client = new Client_1.Client(issuer, {
                ...options,
                useParams: true,
            });
            const clientSpy = (0, ts_mockito_1.spy)(client);
            (0, ts_mockito_1.when)(clientSpy.fetch((0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenCall(async () => {
                return {
                    json: () => Promise.resolve({
                        access_token: "access-token",
                        expires_in: 3600,
                    }),
                    ok: true,
                    headers: new Map(),
                };
            });
            await client.grant("scope");
            const [url, requestOptions] = (0, ts_mockito_1.capture)(clientSpy.fetch).last();
            assert_1.default.equal(url, "https://example.com/token");
            assert_1.default.equal(requestOptions?.body.toString(), "grant_type=client_credentials&scope=scope&client_id=client-id&client_secret=client-secret");
        });
        it("should use headers if specified", async () => {
            const clientWithHeaders = new Client_1.Client(issuer, {
                ...options,
                useHeader: true,
            });
            const clientSpy = (0, ts_mockito_1.spy)(clientWithHeaders);
            (0, ts_mockito_1.when)(clientSpy.fetch((0, ts_mockito_1.anything)(), (0, ts_mockito_1.anything)())).thenCall(async () => {
                return {
                    json: () => Promise.resolve({
                        access_token: "access-token",
                        expires_in: 3600,
                    }),
                    ok: true,
                    headers: new Map(),
                };
            });
            await clientWithHeaders.grant("scope");
            const [url, requestOptions] = (0, ts_mockito_1.capture)(clientSpy.fetch).last();
            assert_1.default.equal(url, "https://example.com/token");
            assert_1.default.equal(requestOptions?.headers["Authorization"], "Basic Y2xpZW50LWlkOmNsaWVudC1zZWNyZXQ=");
        });
    });
});
//# sourceMappingURL=Client.test.js.map