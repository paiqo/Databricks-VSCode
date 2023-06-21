"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const node_assert_1 = __importDefault(require("node:assert"));
const Config_1 = require("./Config");
const node_path_1 = __importDefault(require("node:path"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testData = require("./testdata/unified-auth-cases.json");
/**
 * Test runner for the unified auth test cases in `testdata/unified-auth-cases.json`.
 *
 * Run a single test case:
 * Add a `only: true` property to the test case in `testdata/unified-auth-cases.json`.
 *
 * Skip a test case:
 * Add a `skip: true` property to the test case in `testdata/unified-auth-cases.json`.
 */
describe(__dirname, function () {
    let envBackup;
    const debug = false;
    beforeEach(() => {
        envBackup = process.env;
        process.env = {};
        process.chdir(__dirname);
    });
    afterEach(() => {
        process.env = envBackup;
    });
    for (const testCase of testData.testCases) {
        if (testCase.only) {
            // eslint-disable-next-line no-only-tests/no-only-tests
            it.only(testCase.name, async function () {
                this.timeout(10000);
                await apply(testCase);
            });
        }
        else if (testCase.skip) {
            it.skip(testCase.name, async () => { });
        }
        else {
            it(testCase.name, async function () {
                this.timeout(10000);
                await apply(testCase);
            });
        }
    }
    async function configureProviderAndReturnConfig(cf) {
        const config = new Config_1.Config({
            ...cf,
            logger: debug ? console : undefined,
        });
        await config.authenticate({});
        return config;
    }
    async function apply(cf) {
        let config;
        for (const key of Object.keys(cf)) {
            cf[ConfigToAttribute[key]] = cf[key];
        }
        for (const envName of Object.keys(cf.env || {})) {
            if (envName === "PATH" && cf.env[envName].indexOf("$PATH") >= 0) {
                process.env[envName] = cf
                    .env[envName].replace(/:/g, node_path_1.default.delimiter)
                    .replace("$PATH", envBackup.PATH || "");
            }
            else {
                process.env[envName] = cf.env[envName];
            }
        }
        if (!cf.env || !cf.env["HOME"]) {
            process.env["HOME"] = "i-dont-exist";
        }
        try {
            config = await configureProviderAndReturnConfig(cf);
        }
        catch (error) {
            if (cf.assertError) {
                node_assert_1.default.equal(error.message
                    .replace(/\r?\n/g, "\n") // normalize line endings between windows and unix
                    .replace(__dirname + node_path_1.default.sep, "") // make paths relative
                    .replace(/\\/g, "/"), // normalize path separators
                cf.assertError.replace());
                return;
            }
            throw error;
        }
        if (cf.assertAzure !== undefined) {
            node_assert_1.default.equal(cf.assertAzure, config.isAzure());
        }
        node_assert_1.default.equal(cf.assertAuth, config.authType);
        node_assert_1.default.equal(`https://${new URL(cf.assertHost).hostname}`, config.host);
    }
});
const ConfigToAttribute = {
    host: "host",
    token: "token",
    username: "username",
    password: "password",
    config_file: "configFile",
    profile: "profile",
    azure_resource_id: "azureResourceId",
    auth_type: "authType",
    env: "env",
    assert_error: "assertError",
    assert_auth: "assertAuth",
    assert_host: "assertHost",
    assert_azure: "assertAzure",
};
//# sourceMappingURL=Config.test.js.map