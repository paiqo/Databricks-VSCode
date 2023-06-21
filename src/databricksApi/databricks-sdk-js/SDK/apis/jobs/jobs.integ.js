"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const IntegrationTestSetup_1 = require("../../test/IntegrationTestSetup");
describe(__filename, function () {
    let integSetup;
    this.timeout(10 * 60 * 1000);
    before(async () => {
        integSetup = await IntegrationTestSetup_1.IntegrationTestSetup.getInstance();
    });
    it("should run a notebook job", async () => {
        const jobsService = integSetup.client.jobs;
        const dbfsApi = integSetup.client.dbfs;
        const jobPath = `/tmp/sdk-js-integ-${integSetup.testRunId}.py`;
        await dbfsApi.put({
            path: jobPath,
            contents: Buffer.from("# Databricks notebook source\nprint('hello from job')").toString("base64"),
            overwrite: true,
        });
        const res = await jobsService.submit({
            tasks: [
                {
                    task_key: "hello_world",
                    existing_cluster_id: integSetup.cluster.id,
                    spark_python_task: {
                        python_file: `dbfs:${jobPath}`,
                    },
                },
            ],
        });
        // console.log(res);
        const runId = res.run_id;
        while (true) {
            await (0, IntegrationTestSetup_1.sleep)(3000);
            const run = await jobsService.getRun({ run_id: runId });
            const state = run.state.life_cycle_state;
            // console.log(`State: ${state} - URL: ${run.run_page_url}`);
            if (state === "INTERNAL_ERROR" || state === "TERMINATED") {
                const output = await jobsService.getRunOutput({
                    run_id: run.tasks[0].run_id,
                });
                // console.log(output);
                assert_1.default.equal(output.logs.trim(), "hello from job");
                break;
            }
        }
        await dbfsApi.delete({ path: jobPath });
    });
});
//# sourceMappingURL=jobs.integ.js.map