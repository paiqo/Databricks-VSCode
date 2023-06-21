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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cluster = exports.ClusterError = exports.ClusterRetriableError = void 0;
const retries_1 = __importStar(require("../retries/retries"));
const jobs_1 = require("../apis/jobs");
const ExecutionContext_1 = require("./ExecutionContext");
const WorkflowRun_1 = require("./WorkflowRun");
const __1 = require("..");
const clusters_1 = require("../apis/clusters");
const context_1 = require("../context");
const logging_1 = require("../logging");
const permissions_1 = require("../apis/permissions");
class ClusterRetriableError extends retries_1.RetriableError {
}
exports.ClusterRetriableError = ClusterRetriableError;
class ClusterError extends Error {
}
exports.ClusterError = ClusterError;
class Cluster {
    constructor(client, clusterDetails) {
        this.client = client;
        this.clusterDetails = clusterDetails;
        this.clusterApi = new clusters_1.ClustersService(client);
    }
    get id() {
        return this.clusterDetails.cluster_id;
    }
    get name() {
        return this.clusterDetails.cluster_name;
    }
    get url() {
        return (async () => `https://${(await this.client.host).host}/#setting/clusters/${this.id}/configuration`)();
    }
    get driverLogsUrl() {
        return (async () => `https://${(await this.client.host).host}/#setting/clusters/${this.id}/driverLogs`)();
    }
    get metricsUrl() {
        return (async () => `https://${(await this.client.host).host}/#setting/clusters/${this.id}/metrics`)();
    }
    async getSparkUiUrl(sparkContextId) {
        const host = (await this.client.host).host;
        if (sparkContextId) {
            return `https://${host}/#setting/sparkui/${this.id}/driver-${sparkContextId}`;
        }
        else {
            return `https://${host}/#setting/clusters/${this.id}/sparkUi`;
        }
    }
    get memoryMb() {
        return this.clusterDetails.cluster_memory_mb;
    }
    get cores() {
        return this.clusterDetails.cluster_cores;
    }
    get sparkVersion() {
        return this.clusterDetails.spark_version;
    }
    get dbrVersion() {
        const sparkVersion = this.clusterDetails.spark_version;
        const match = sparkVersion.match(/^(custom:.*?__)?(.*?)-/);
        if (!match) {
            return ["x", "x", "x"];
        }
        const parts = match[2].split(".");
        return [
            parseInt(parts[0], 10) || "x",
            parseInt(parts[1], 10) || "x",
            parseInt(parts[2], 10) || "x",
        ];
    }
    get creator() {
        return this.clusterDetails.creator_user_name || "";
    }
    get state() {
        return this.clusterDetails.state;
    }
    get stateMessage() {
        return this.clusterDetails.state_message || "";
    }
    get source() {
        return this.clusterDetails.cluster_source;
    }
    get details() {
        return this.clusterDetails;
    }
    set details(details) {
        this.clusterDetails = details;
    }
    get accessMode() {
        //TODO: deprecate data_security_mode once access_mode is available everywhere
        return (this.details.access_mode ?? this.details.data_security_mode);
    }
    isUc() {
        return ["SINGLE_USER", "SHARED", "USER_ISOLATION"].includes(this.accessMode);
    }
    isSingleUser() {
        const modeProperty = this.accessMode;
        return (modeProperty !== undefined &&
            [
                "SINGLE_USER",
                "LEGACY_SINGLE_USER_PASSTHROUGH",
                "LEGACY_SINGLE_USER_STANDARD",
                //enums unique to data_security_mode
                "LEGACY_SINGLE_USER",
            ].includes(modeProperty));
    }
    isValidSingleUser(userName) {
        return (this.isSingleUser() && this.details.single_user_name === userName);
    }
    get hasExecutePermsCached() {
        return this._hasExecutePerms;
    }
    async hasExecutePerms(userDetails) {
        if (userDetails === undefined) {
            return (this._hasExecutePerms = false);
        }
        if (this.isSingleUser()) {
            return (this._hasExecutePerms = this.isValidSingleUser(userDetails.userName));
        }
        const permissionApi = new permissions_1.PermissionsService(this.client);
        const perms = await permissionApi.get({
            request_object_id: this.id,
            request_object_type: "clusters",
        });
        return (this._hasExecutePerms =
            (perms.access_control_list ?? []).find((ac) => {
                return (ac.user_name === userDetails.userName ||
                    userDetails.groups
                        ?.map((v) => v.display)
                        .includes(ac.group_name ?? ""));
            }) !== undefined);
    }
    async refresh() {
        this.details = await this.clusterApi.get({
            cluster_id: this.clusterDetails.cluster_id,
        });
    }
    async start(token, onProgress = () => { }) {
        await this.refresh();
        onProgress(this.state);
        if (this.state === "RUNNING") {
            return;
        }
        if (this.state === "TERMINATED" ||
            this.state === "ERROR" ||
            this.state === "UNKNOWN") {
            await this.clusterApi.start({
                cluster_id: this.id,
            });
        }
        // wait for cluster to be stopped before re-starting
        if (this.state === "TERMINATING") {
            await (0, retries_1.default)({
                timeout: new __1.Time(1, __1.TimeUnits.minutes),
                retryPolicy: new retries_1.LinearRetryPolicy(new __1.Time(1, __1.TimeUnits.seconds)),
                fn: async () => {
                    if (token?.isCancellationRequested) {
                        return;
                    }
                    await this.refresh();
                    onProgress(this.state);
                    if (this.state === "TERMINATING") {
                        throw new retries_1.RetriableError();
                    }
                },
            });
            await this.clusterApi.start({
                cluster_id: this.id,
            });
        }
        this._canExecute = undefined;
        await (0, retries_1.default)({
            fn: async () => {
                if (token?.isCancellationRequested) {
                    return;
                }
                await this.refresh();
                onProgress(this.state);
                switch (this.state) {
                    case "RUNNING":
                        return;
                    case "TERMINATED":
                        throw new ClusterError(`Cluster[${this.name}]: CurrentState - Terminated; Reason - ${JSON.stringify(this.clusterDetails.termination_reason)}`);
                    case "ERROR":
                        throw new ClusterError(`Cluster[${this.name}]: Error in starting the cluster (${this.clusterDetails.state_message})`);
                    default:
                        throw new ClusterRetriableError(`Cluster[${this.name}]: CurrentState - ${this.state}; Reason - ${this.clusterDetails.state_message}`);
                }
            },
        });
    }
    async stop(token, onProgress) {
        this.details = await (await this.clusterApi.delete({
            cluster_id: this.id,
        }, new context_1.Context({ cancellationToken: token }))).wait({
            onProgress: async (clusterInfo) => {
                this.details = clusterInfo;
                if (onProgress) {
                    await onProgress(clusterInfo);
                }
            },
        });
    }
    async createExecutionContext(language = "python") {
        return await ExecutionContext_1.ExecutionContext.create(this.client, this, language);
    }
    get canExecuteCached() {
        return this._canExecute;
    }
    async canExecute(ctx) {
        let executionContext;
        try {
            executionContext = await this.createExecutionContext();
            const result = await executionContext.execute("1==1");
            this._canExecute =
                result.result?.results?.resultType === "error" ? false : true;
        }
        catch (e) {
            ctx?.logger?.error(`Can't execute code on cluster ${this.id}`, e);
            this._canExecute = false;
        }
        finally {
            if (executionContext) {
                await executionContext.destroy();
            }
        }
        return this._canExecute ?? false;
    }
    static async fromClusterName(client, clusterName) {
        const clusterApi = new clusters_1.ClustersService(client);
        for await (const clusterInfo of clusterApi.list({ can_use_client: "" })) {
            if (clusterInfo.cluster_name === clusterName) {
                const cluster = await clusterApi.get({
                    cluster_id: clusterInfo.cluster_id,
                });
                return new Cluster(client, cluster);
            }
        }
        return;
    }
    static async fromClusterId(client, clusterId) {
        const clusterApi = new clusters_1.ClustersService(client);
        const response = await clusterApi.get({ cluster_id: clusterId });
        return new Cluster(client, response);
    }
    static async *list(client) {
        const clusterApi = new clusters_1.ClustersService(client);
        for await (const clusterInfo of clusterApi.list({ can_use_client: "" })) {
            yield new Cluster(client, clusterInfo);
        }
    }
    async submitRun(submitRunRequest) {
        const jobsService = new jobs_1.JobsService(this.client);
        const res = await jobsService.submit(submitRunRequest);
        return await WorkflowRun_1.WorkflowRun.fromId(this.client, res.run_id);
    }
    /**
     * Run a notebook as a workflow on a cluster and export result as HTML
     */
    async runNotebookAndWait({ path, parameters = {}, onProgress, token, }) {
        const run = await this.submitRun({
            tasks: [
                {
                    task_key: "js_sdk_job_run",
                    existing_cluster_id: this.id,
                    notebook_task: {
                        notebook_path: path,
                        base_parameters: parameters,
                    },
                    depends_on: [],
                    libraries: [],
                },
            ],
        });
        await this.waitForWorkflowCompletion(run, onProgress, token);
        return await run.export();
    }
    /**
     * Run a python file as a workflow on a cluster
     */
    async runPythonAndWait({ path, args = [], onProgress, token, }) {
        const run = await this.submitRun({
            tasks: [
                {
                    task_key: "js_sdk_job_run",
                    existing_cluster_id: this.id,
                    spark_python_task: {
                        python_file: path,
                        parameters: args,
                    },
                },
            ],
        });
        await this.waitForWorkflowCompletion(run, onProgress, token);
        return await run.getOutput();
    }
    async waitForWorkflowCompletion(run, onProgress, token) {
        while (true) {
            if (run.lifeCycleState === "INTERNAL_ERROR") {
                return;
            }
            if (run.lifeCycleState === "TERMINATED") {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 3000));
            if (token && token.isCancellationRequested) {
                await run.cancel();
                return;
            }
            await run.update();
            onProgress && onProgress(run.lifeCycleState, run);
        }
    }
}
exports.Cluster = Cluster;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], Cluster.prototype, "canExecute", null);
//# sourceMappingURL=Cluster.js.map