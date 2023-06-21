"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const IntegrationTestSetup_1 = require("../test/IntegrationTestSetup");
const Cluster_1 = require("./Cluster");
describe(__filename, function () {
    let integSetup;
    this.timeout(10 * 60 * 1000);
    before(async () => {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
    });
    it("should run a python job", async () => {
        const cluster = await Cluster_1.Cluster.fromClusterId(integSetup.client.apiClient, integSetup.cluster.id);
        const dbfsApi = integSetup.client.dbfs;
        const jobPath = `/tmp/sdk-js-integ-${integSetup.testRunId}.py`;
        await dbfsApi.put({
            path: jobPath,
            contents: Buffer.from("# Databricks notebook source\nprint('hello from job')").toString("base64"),
            overwrite: true,
        });
        try {
            const progress = [];
            const output = await cluster.runPythonAndWait({
                path: `dbfs:${jobPath}`,
                onProgress: (_state, run) => {
                    progress.push(run);
                },
            });
            (0, assert_1.default)(progress.length > 1);
            assert_1.default.equal(progress[progress.length - 1].lifeCycleState, "TERMINATED");
            assert_1.default.equal(output.logs?.trim(), "hello from job");
        }
        finally {
            await dbfsApi.delete({ path: jobPath });
        }
    });
    it("should run a notebook job", async () => {
        const cluster = await Cluster_1.Cluster.fromClusterId(integSetup.client.apiClient, integSetup.cluster.id);
        const jobPath = `/tmp/js-sdk-jobs-tests/sdk-js-integ-${integSetup.testRunId}.py`;
        await integSetup.client.workspace.mkdirs({
            path: "/tmp/js-sdk-jobs-tests",
        });
        await integSetup.client.workspace.import({
            path: jobPath,
            format: "SOURCE",
            language: "PYTHON",
            content: Buffer.from("# Databricks notebook source\nprint('hello from job')").toString("base64"),
            overwrite: true,
        });
        try {
            const progress = [];
            const output = await cluster.runNotebookAndWait({
                path: `${jobPath}`,
                onProgress: (_state, run) => {
                    progress.push(run);
                },
            });
            (0, assert_1.default)(progress.length > 1);
            assert_1.default.equal(progress[progress.length - 1].lifeCycleState, "TERMINATED");
            (0, assert_1.default)(output.views &&
                output.views.length > 0 &&
                output.views[0].content);
            (0, assert_1.default)(output.views[0].content.startsWith("<!DOCTYPE html>"));
        }
        finally {
            await integSetup.client.workspace.delete({ path: jobPath });
        }
    });
    it("should run a broken notebook job", async () => {
        const cluster = await Cluster_1.Cluster.fromClusterId(integSetup.client.apiClient, integSetup.cluster.id);
        const jobPath = `/tmp/js-sdk-jobs-tests/sdk-js-integ-${integSetup.testRunId}.py`;
        await integSetup.client.workspace.mkdirs({
            path: "/tmp/js-sdk-jobs-tests",
        });
        await integSetup.client.workspace.import({
            path: jobPath,
            format: "SOURCE",
            language: "PYTHON",
            content: Buffer.from(`# Databricks notebook source
# COMMAND ----------
            
pr int("Cell 1")
            
# COMMAND ----------

print("Cell 2")`).toString("base64"),
            overwrite: true,
        });
        try {
            const progress = [];
            const output = await cluster.runNotebookAndWait({
                path: `${jobPath}`,
                onProgress: (_state, run) => {
                    progress.push(run);
                },
            });
            (0, assert_1.default)(progress.length > 1);
            assert_1.default.equal(progress[progress.length - 1].lifeCycleState, "INTERNAL_ERROR");
            (0, assert_1.default)(output.views &&
                output.views.length > 0 &&
                output.views[0].content);
            (0, assert_1.default)(output.views[0].content.startsWith("<!DOCTYPE html>"));
        }
        finally {
            await integSetup.client.workspace.delete({ path: jobPath });
        }
    });
});
//# sourceMappingURL=WorkflowRun.integ.js.map