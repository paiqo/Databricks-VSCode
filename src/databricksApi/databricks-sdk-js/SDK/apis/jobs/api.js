"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.JobsService = exports.JobsError = exports.JobsRetriableError = void 0;
const model = __importStar(require("./model"));
const retries_1 = __importDefault(require("../../retries/retries"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
const wait_1 = require("../../wait");
class JobsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Jobs", method, message);
    }
}
exports.JobsRetriableError = JobsRetriableError;
class JobsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Jobs", method, message);
    }
}
exports.JobsError = JobsError;
/**
 * The Jobs API allows you to create, edit, and delete jobs.
 *
 * You can use a Databricks job to run a data processing or data analysis task in
 * a Databricks cluster with scalable resources. Your job can consist of a single
 * task or can be a large, multi-task workflow with complex dependencies.
 * Databricks manages the task orchestration, cluster management, monitoring, and
 * error reporting for all of your jobs. You can run your jobs immediately or
 * periodically through an easy-to-use scheduling system. You can implement job
 * tasks using notebooks, JARS, Delta Live Tables pipelines, or Python, Scala,
 * Spark submit, and Java applications.
 *
 * You should never hard code secrets or store them in plain text. Use the
 * :service:secrets to manage secrets in the [Databricks CLI]. Use the [Secrets
 * utility] to reference secrets in notebooks and jobs.
 *
 * [Databricks CLI]: https://docs.databricks.com/dev-tools/cli/index.html
 * [Secrets utility]: https://docs.databricks.com/dev-tools/databricks-utils.html#dbutils-secrets
 */
class JobsService {
    constructor(client) {
        this.client = client;
    }
    async _cancelAllRuns(request, context) {
        const path = "/api/2.1/jobs/runs/cancel-all";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Cancel all runs of a job.
     *
     * Cancels all active runs of a job. The runs are canceled asynchronously, so
     * it doesn't prevent new runs from being started.
     */
    async cancelAllRuns(request, context) {
        return await this._cancelAllRuns(request, context);
    }
    async _cancelRun(request, context) {
        const path = "/api/2.1/jobs/runs/cancel";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Cancel a job run.
     *
     * Cancels a job run. The run is canceled asynchronously, so it may still be
     * running when this request completes.
     */
    async cancelRun(cancelRun, context) {
        const cancellationToken = context?.cancellationToken;
        await this._cancelRun(cancelRun, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.getRun({
                        run_id: cancelRun.run_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Jobs.cancelRunAndWait: cancelled");
                        throw new JobsError("cancelRunAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state.life_cycle_state;
                    const statusMessage = pollResponse.state.state_message;
                    switch (status) {
                        case "TERMINATED":
                        case "SKIPPED": {
                            return pollResponse;
                        }
                        case "INTERNAL_ERROR": {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.cancelRunAndWait: ${errorMessage}`);
                            throw new JobsError("cancelRunAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.cancelRunAndWait: retrying: ${errorMessage}`);
                            throw new JobsRetriableError("cancelRunAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _create(request, context) {
        const path = "/api/2.1/jobs/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a new job.
     *
     * Create a new job.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.1/jobs/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a job.
     *
     * Deletes a job.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _deleteRun(request, context) {
        const path = "/api/2.1/jobs/runs/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a job run.
     *
     * Deletes a non-active run. Returns an error if the run is active.
     */
    async deleteRun(request, context) {
        return await this._deleteRun(request, context);
    }
    async _exportRun(request, context) {
        const path = "/api/2.1/jobs/runs/export";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Export and retrieve a job run.
     *
     * Export and retrieve the job run task.
     */
    async exportRun(request, context) {
        return await this._exportRun(request, context);
    }
    async _get(request, context) {
        const path = "/api/2.1/jobs/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a single job.
     *
     * Retrieves the details for a single job.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _getRun(request, context) {
        const path = "/api/2.1/jobs/runs/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a single job run.
     *
     * Retrieve the metadata of a run.
     */
    async getRun(getRun, context) {
        const cancellationToken = context?.cancellationToken;
        const run = await this._getRun(getRun, context);
        return (0, wait_1.asWaiter)(run, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.getRun({
                        run_id: run.run_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Jobs.getRunAndWait: cancelled");
                        throw new JobsError("getRunAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state.life_cycle_state;
                    const statusMessage = pollResponse.state.state_message;
                    switch (status) {
                        case "TERMINATED":
                        case "SKIPPED": {
                            return pollResponse;
                        }
                        case "INTERNAL_ERROR": {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.getRunAndWait: ${errorMessage}`);
                            throw new JobsError("getRunAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.getRunAndWait: retrying: ${errorMessage}`);
                            throw new JobsRetriableError("getRunAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _getRunOutput(request, context) {
        const path = "/api/2.1/jobs/runs/get-output";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get the output for a single run.
     *
     * Retrieve the output and metadata of a single task run. When a notebook
     * task returns a value through the `dbutils.notebook.exit()` call, you can
     * use this endpoint to retrieve that value. Databricks restricts this API to
     * returning the first 5 MB of the output. To return a larger result, you can
     * store job results in a cloud storage service.
     *
     * This endpoint validates that the __run_id__ parameter is valid and returns
     * an HTTP status code 400 if the __run_id__ parameter is invalid. Runs are
     * automatically removed after 60 days. If you to want to reference them
     * beyond 60 days, you must save old run results before they expire.
     */
    async getRunOutput(request, context) {
        return await this._getRunOutput(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.1/jobs/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List all jobs.
     *
     * Retrieves a list of jobs.
     */
    async *list(request, context) {
        // deduplicate items that may have been added during iteration
        const seen = {};
        while (true) {
            const response = await this._list(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.jobs || response.jobs.length === 0) {
                break;
            }
            for (const v of response.jobs) {
                const id = v.job_id;
                if (id) {
                    if (seen[id]) {
                        // item was added during iteration
                        continue;
                    }
                    seen[id] = true;
                }
                yield v;
            }
            request.offset = request.offset || 0;
            request.offset += response.jobs.length;
        }
    }
    async _listRuns(request, context) {
        const path = "/api/2.1/jobs/runs/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List runs for a job.
     *
     * List runs in descending order by start time.
     */
    async *listRuns(request, context) {
        // deduplicate items that may have been added during iteration
        const seen = {};
        while (true) {
            const response = await this._listRuns(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.runs || response.runs.length === 0) {
                break;
            }
            for (const v of response.runs) {
                const id = v.run_id;
                if (id) {
                    if (seen[id]) {
                        // item was added during iteration
                        continue;
                    }
                    seen[id] = true;
                }
                yield v;
            }
            request.offset = request.offset || 0;
            request.offset += response.runs.length;
        }
    }
    async _repairRun(request, context) {
        const path = "/api/2.1/jobs/runs/repair";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Repair a job run.
     *
     * Re-run one or more tasks. Tasks are re-run as part of the original job
     * run. They use the current job and task settings, and can be viewed in the
     * history for the original job run.
     */
    async repairRun(repairRun, context) {
        const cancellationToken = context?.cancellationToken;
        const repairRunResponse = await this._repairRun(repairRun, context);
        return (0, wait_1.asWaiter)(repairRunResponse, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.getRun({
                        run_id: repairRun.run_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Jobs.repairRunAndWait: cancelled");
                        throw new JobsError("repairRunAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state.life_cycle_state;
                    const statusMessage = pollResponse.state.state_message;
                    switch (status) {
                        case "TERMINATED":
                        case "SKIPPED": {
                            return pollResponse;
                        }
                        case "INTERNAL_ERROR": {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.repairRunAndWait: ${errorMessage}`);
                            throw new JobsError("repairRunAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.repairRunAndWait: retrying: ${errorMessage}`);
                            throw new JobsRetriableError("repairRunAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _reset(request, context) {
        const path = "/api/2.1/jobs/reset";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Overwrites all settings for a job.
     *
     * Overwrites all the settings for a specific job. Use the Update endpoint to
     * update job settings partially.
     */
    async reset(request, context) {
        return await this._reset(request, context);
    }
    async _runNow(request, context) {
        const path = "/api/2.1/jobs/run-now";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Trigger a new job run.
     *
     * Run a job and return the `run_id` of the triggered run.
     */
    async runNow(runNow, context) {
        const cancellationToken = context?.cancellationToken;
        const runNowResponse = await this._runNow(runNow, context);
        return (0, wait_1.asWaiter)(runNowResponse, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.getRun({
                        run_id: runNowResponse.run_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Jobs.runNowAndWait: cancelled");
                        throw new JobsError("runNowAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state.life_cycle_state;
                    const statusMessage = pollResponse.state.state_message;
                    switch (status) {
                        case "TERMINATED":
                        case "SKIPPED": {
                            return pollResponse;
                        }
                        case "INTERNAL_ERROR": {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.runNowAndWait: ${errorMessage}`);
                            throw new JobsError("runNowAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.runNowAndWait: retrying: ${errorMessage}`);
                            throw new JobsRetriableError("runNowAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _submit(request, context) {
        const path = "/api/2.1/jobs/runs/submit";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create and trigger a one-time run.
     *
     * Submit a one-time run. This endpoint allows you to submit a workload
     * directly without creating a job. Runs submitted using this endpoint
     * don’t display in the UI. Use the `jobs/runs/get` API to check the run
     * state after the job is submitted.
     */
    async submit(submitRun, context) {
        const cancellationToken = context?.cancellationToken;
        const submitRunResponse = await this._submit(submitRun, context);
        return (0, wait_1.asWaiter)(submitRunResponse, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.getRun({
                        run_id: submitRunResponse.run_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Jobs.submitAndWait: cancelled");
                        throw new JobsError("submitAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state.life_cycle_state;
                    const statusMessage = pollResponse.state.state_message;
                    switch (status) {
                        case "TERMINATED":
                        case "SKIPPED": {
                            return pollResponse;
                        }
                        case "INTERNAL_ERROR": {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.submitAndWait: ${errorMessage}`);
                            throw new JobsError("submitAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach TERMINATED or SKIPPED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Jobs.submitAndWait: retrying: ${errorMessage}`);
                            throw new JobsRetriableError("submitAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _update(request, context) {
        const path = "/api/2.1/jobs/update";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Partially updates a job.
     *
     * Add, update, or remove specific settings of an existing job. Use the
     * ResetJob to overwrite all job settings.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.JobsService = JobsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_cancelAllRuns", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "cancelAllRuns", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_cancelRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "cancelRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_deleteRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "deleteRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_exportRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "exportRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_getRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "getRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_getRunOutput", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "getRunOutput", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], JobsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_listRuns", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], JobsService.prototype, "listRuns", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_repairRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "repairRun", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_reset", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "reset", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_runNow", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "runNow", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_submit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "submit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "update", null);
//# sourceMappingURL=api.js.map