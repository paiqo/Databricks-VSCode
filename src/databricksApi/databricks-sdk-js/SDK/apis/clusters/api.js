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
exports.InstanceProfilesService = exports.InstanceProfilesError = exports.InstanceProfilesRetriableError = exports.ClustersService = exports.ClustersError = exports.ClustersRetriableError = void 0;
const model = __importStar(require("./model"));
const retries_1 = __importDefault(require("../../retries/retries"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
const wait_1 = require("../../wait");
class ClustersRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Clusters", method, message);
    }
}
exports.ClustersRetriableError = ClustersRetriableError;
class ClustersError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Clusters", method, message);
    }
}
exports.ClustersError = ClustersError;
/**
 * The Clusters API allows you to create, start, edit, list, terminate, and
 * delete clusters.
 *
 * Databricks maps cluster node instance types to compute units known as DBUs.
 * See the instance type pricing page for a list of the supported instance types
 * and their corresponding DBUs.
 *
 * A Databricks cluster is a set of computation resources and configurations on
 * which you run data engineering, data science, and data analytics workloads,
 * such as production ETL pipelines, streaming analytics, ad-hoc analytics, and
 * machine learning.
 *
 * You run these workloads as a set of commands in a notebook or as an automated
 * job. Databricks makes a distinction between all-purpose clusters and job
 * clusters. You use all-purpose clusters to analyze data collaboratively using
 * interactive notebooks. You use job clusters to run fast and robust automated
 * jobs.
 *
 * You can create an all-purpose cluster using the UI, CLI, or REST API. You can
 * manually terminate and restart an all-purpose cluster. Multiple users can
 * share such clusters to do collaborative interactive analysis.
 *
 * IMPORTANT: Databricks retains cluster configuration information for up to 200
 * all-purpose clusters terminated in the last 30 days and up to 30 job clusters
 * recently terminated by the job scheduler. To keep an all-purpose cluster
 * configuration even after it has been terminated for more than 30 days, an
 * administrator can pin a cluster to the cluster list.
 */
class ClustersService {
    constructor(client) {
        this.client = client;
    }
    async _changeOwner(request, context) {
        const path = "/api/2.0/clusters/change-owner";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Change cluster owner.
     *
     * Change the owner of the cluster. You must be an admin to perform this
     * operation.
     */
    async changeOwner(request, context) {
        return await this._changeOwner(request, context);
    }
    async _create(request, context) {
        const path = "/api/2.0/clusters/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create new cluster.
     *
     * Creates a new Spark cluster. This method will acquire new instances from
     * the cloud provider if necessary. This method is asynchronous; the returned
     * `cluster_id` can be used to poll the cluster status. When this method
     * returns, the cluster will be in a `PENDING` state. The cluster will be
     * usable once it enters a `RUNNING` state.
     *
     * Note: Databricks may not be able to acquire some of the requested nodes,
     * due to cloud provider limitations (account limits, spot price, etc.) or
     * transient network issues.
     *
     * If Databricks acquires at least 85% of the requested on-demand nodes,
     * cluster creation will succeed. Otherwise the cluster will terminate with
     * an informative error message.
     */
    async create(createCluster, context) {
        const cancellationToken = context?.cancellationToken;
        const createClusterResponse = await this._create(createCluster, context);
        return (0, wait_1.asWaiter)(createClusterResponse, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        cluster_id: createClusterResponse.cluster_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Clusters.createAndWait: cancelled");
                        throw new ClustersError("createAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.state_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "ERROR":
                        case "TERMINATED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.createAndWait: ${errorMessage}`);
                            throw new ClustersError("createAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.createAndWait: retrying: ${errorMessage}`);
                            throw new ClustersRetriableError("createAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _delete(request, context) {
        const path = "/api/2.0/clusters/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Terminate cluster.
     *
     * Terminates the Spark cluster with the specified ID. The cluster is removed
     * asynchronously. Once the termination has completed, the cluster will be in
     * a `TERMINATED` state. If the cluster is already in a `TERMINATING` or
     * `TERMINATED` state, nothing will happen.
     */
    async delete(deleteCluster, context) {
        const cancellationToken = context?.cancellationToken;
        await this._delete(deleteCluster, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        cluster_id: deleteCluster.cluster_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Clusters.deleteAndWait: cancelled");
                        throw new ClustersError("deleteAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.state_message;
                    switch (status) {
                        case "TERMINATED": {
                            return pollResponse;
                        }
                        case "ERROR": {
                            const errorMessage = `failed to reach TERMINATED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.deleteAndWait: ${errorMessage}`);
                            throw new ClustersError("deleteAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach TERMINATED state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.deleteAndWait: retrying: ${errorMessage}`);
                            throw new ClustersRetriableError("deleteAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _edit(request, context) {
        const path = "/api/2.0/clusters/edit";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Update cluster configuration.
     *
     * Updates the configuration of a cluster to match the provided attributes
     * and size. A cluster can be updated if it is in a `RUNNING` or `TERMINATED`
     * state.
     *
     * If a cluster is updated while in a `RUNNING` state, it will be restarted
     * so that the new attributes can take effect.
     *
     * If a cluster is updated while in a `TERMINATED` state, it will remain
     * `TERMINATED`. The next time it is started using the `clusters/start` API,
     * the new attributes will take effect. Any attempt to update a cluster in
     * any other state will be rejected with an `INVALID_STATE` error code.
     *
     * Clusters created by the Databricks Jobs service cannot be edited.
     */
    async edit(editCluster, context) {
        const cancellationToken = context?.cancellationToken;
        await this._edit(editCluster, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        cluster_id: editCluster.cluster_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Clusters.editAndWait: cancelled");
                        throw new ClustersError("editAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.state_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "ERROR":
                        case "TERMINATED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.editAndWait: ${errorMessage}`);
                            throw new ClustersError("editAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.editAndWait: retrying: ${errorMessage}`);
                            throw new ClustersRetriableError("editAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _events(request, context) {
        const path = "/api/2.0/clusters/events";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * List cluster activity events.
     *
     * Retrieves a list of events about the activity of a cluster. This API is
     * paginated. If there are more events to read, the response includes all the
     * nparameters necessary to request the next page of events.
     */
    async *events(request, context) {
        while (true) {
            const response = await this._events(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.events || response.events.length === 0) {
                break;
            }
            for (const v of response.events) {
                yield v;
            }
            if (!response.next_page) {
                break;
            }
            request = response.next_page;
        }
    }
    async _get(request, context) {
        const path = "/api/2.0/clusters/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get cluster info.
     *
     * "Retrieves the information for a cluster given its identifier. Clusters
     * can be described while they are running, or up to 60 days after they are
     * terminated.
     */
    async get(get, context) {
        const cancellationToken = context?.cancellationToken;
        const clusterInfo = await this._get(get, context);
        return (0, wait_1.asWaiter)(clusterInfo, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        cluster_id: clusterInfo.cluster_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Clusters.getAndWait: cancelled");
                        throw new ClustersError("getAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.state_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "ERROR":
                        case "TERMINATED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.getAndWait: ${errorMessage}`);
                            throw new ClustersError("getAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.getAndWait: retrying: ${errorMessage}`);
                            throw new ClustersRetriableError("getAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _list(request, context) {
        const path = "/api/2.0/clusters/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List all clusters.
     *
     * Return information about all pinned clusters, active clusters, up to 200
     * of the most recently terminated all-purpose clusters in the past 30 days,
     * and up to 30 of the most recently terminated job clusters in the past 30
     * days.
     *
     * For example, if there is 1 pinned cluster, 4 active clusters, 45
     * terminated all-purpose clusters in the past 30 days, and 50 terminated job
     * clusters in the past 30 days, then this API returns the 1 pinned cluster,
     * 4 active clusters, all 45 terminated all-purpose clusters, and the 30 most
     * recently terminated job clusters.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).clusters;
        for (const v of response || []) {
            yield v;
        }
    }
    async _listNodeTypes(context) {
        const path = "/api/2.0/clusters/list-node-types";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List node types.
     *
     * Returns a list of supported Spark node types. These node types can be used
     * to launch a cluster.
     */
    async listNodeTypes(context) {
        return await this._listNodeTypes(context);
    }
    async _listZones(context) {
        const path = "/api/2.0/clusters/list-zones";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List availability zones.
     *
     * Returns a list of availability zones where clusters can be created in (For
     * example, us-west-2a). These zones can be used to launch a cluster.
     */
    async listZones(context) {
        return await this._listZones(context);
    }
    async _permanentDelete(request, context) {
        const path = "/api/2.0/clusters/permanent-delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Permanently delete cluster.
     *
     * Permanently deletes a Spark cluster. This cluster is terminated and
     * resources are asynchronously removed.
     *
     * In addition, users will no longer see permanently deleted clusters in the
     * cluster list, and API users can no longer perform any action on
     * permanently deleted clusters.
     */
    async permanentDelete(request, context) {
        return await this._permanentDelete(request, context);
    }
    async _pin(request, context) {
        const path = "/api/2.0/clusters/pin";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Pin cluster.
     *
     * Pinning a cluster ensures that the cluster will always be returned by the
     * ListClusters API. Pinning a cluster that is already pinned will have no
     * effect. This API can only be called by workspace admins.
     */
    async pin(request, context) {
        return await this._pin(request, context);
    }
    async _resize(request, context) {
        const path = "/api/2.0/clusters/resize";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Resize cluster.
     *
     * Resizes a cluster to have a desired number of workers. This will fail
     * unless the cluster is in a `RUNNING` state.
     */
    async resize(resizeCluster, context) {
        const cancellationToken = context?.cancellationToken;
        await this._resize(resizeCluster, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        cluster_id: resizeCluster.cluster_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Clusters.resizeAndWait: cancelled");
                        throw new ClustersError("resizeAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.state_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "ERROR":
                        case "TERMINATED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.resizeAndWait: ${errorMessage}`);
                            throw new ClustersError("resizeAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.resizeAndWait: retrying: ${errorMessage}`);
                            throw new ClustersRetriableError("resizeAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _restart(request, context) {
        const path = "/api/2.0/clusters/restart";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Restart cluster.
     *
     * Restarts a Spark cluster with the supplied ID. If the cluster is not
     * currently in a `RUNNING` state, nothing will happen.
     */
    async restart(restartCluster, context) {
        const cancellationToken = context?.cancellationToken;
        await this._restart(restartCluster, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        cluster_id: restartCluster.cluster_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Clusters.restartAndWait: cancelled");
                        throw new ClustersError("restartAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.state_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "ERROR":
                        case "TERMINATED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.restartAndWait: ${errorMessage}`);
                            throw new ClustersError("restartAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.restartAndWait: retrying: ${errorMessage}`);
                            throw new ClustersRetriableError("restartAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _sparkVersions(context) {
        const path = "/api/2.0/clusters/spark-versions";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List available Spark versions.
     *
     * Returns the list of available Spark versions. These versions can be used
     * to launch a cluster.
     */
    async sparkVersions(context) {
        return await this._sparkVersions(context);
    }
    async _start(request, context) {
        const path = "/api/2.0/clusters/start";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Start terminated cluster.
     *
     * Starts a terminated Spark cluster with the supplied ID. This works similar
     * to `createCluster` except:
     *
     * * The previous cluster id and attributes are preserved. * The cluster
     * starts with the last specified cluster size. * If the previous cluster was
     * an autoscaling cluster, the current cluster starts with the minimum number
     * of nodes. * If the cluster is not currently in a `TERMINATED` state,
     * nothing will happen. * Clusters launched to run a job cannot be started.
     */
    async start(startCluster, context) {
        const cancellationToken = context?.cancellationToken;
        await this._start(startCluster, context);
        return (0, wait_1.asWaiter)(null, async (options) => {
            options = options || {};
            options.onProgress =
                options.onProgress || (async (newPollResponse) => { });
            const { timeout, onProgress } = options;
            return await (0, retries_1.default)({
                timeout,
                fn: async () => {
                    const pollResponse = await this.get({
                        cluster_id: startCluster.cluster_id,
                    }, context);
                    if (cancellationToken?.isCancellationRequested) {
                        context?.logger?.error("Clusters.startAndWait: cancelled");
                        throw new ClustersError("startAndWait", "cancelled");
                    }
                    await onProgress(pollResponse);
                    const status = pollResponse.state;
                    const statusMessage = pollResponse.state_message;
                    switch (status) {
                        case "RUNNING": {
                            return pollResponse;
                        }
                        case "ERROR":
                        case "TERMINATED": {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.startAndWait: ${errorMessage}`);
                            throw new ClustersError("startAndWait", errorMessage);
                        }
                        default: {
                            const errorMessage = `failed to reach RUNNING state, got ${status}: ${statusMessage}`;
                            context?.logger?.error(`Clusters.startAndWait: retrying: ${errorMessage}`);
                            throw new ClustersRetriableError("startAndWait", errorMessage);
                        }
                    }
                },
            });
        });
    }
    async _unpin(request, context) {
        const path = "/api/2.0/clusters/unpin";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Unpin cluster.
     *
     * Unpinning a cluster will allow the cluster to eventually be removed from
     * the ListClusters API. Unpinning a cluster that is not pinned will have no
     * effect. This API can only be called by workspace admins.
     */
    async unpin(request, context) {
        return await this._unpin(request, context);
    }
}
exports.ClustersService = ClustersService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_changeOwner", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "changeOwner", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_events", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ClustersService.prototype, "events", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ClustersService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_listNodeTypes", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "listNodeTypes", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_listZones", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "listZones", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_permanentDelete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "permanentDelete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_pin", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "pin", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_resize", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "resize", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_restart", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "restart", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_sparkVersions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "sparkVersions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_start", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "start", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "_unpin", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ClustersService.prototype, "unpin", null);
class InstanceProfilesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("InstanceProfiles", method, message);
    }
}
exports.InstanceProfilesRetriableError = InstanceProfilesRetriableError;
class InstanceProfilesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("InstanceProfiles", method, message);
    }
}
exports.InstanceProfilesError = InstanceProfilesError;
/**
 * The Instance Profiles API allows admins to add, list, and remove instance
 * profiles that users can launch clusters with. Regular users can list the
 * instance profiles available to them. See [Secure access to S3 buckets] using
 * instance profiles for more information.
 *
 * [Secure access to S3 buckets]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/instance-profiles.html
 */
class InstanceProfilesService {
    constructor(client) {
        this.client = client;
    }
    async _add(request, context) {
        const path = "/api/2.0/instance-profiles/add";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Register an instance profile.
     *
     * In the UI, you can select the instance profile when launching clusters.
     * This API is only available to admin users.
     */
    async add(request, context) {
        return await this._add(request, context);
    }
    async _edit(request, context) {
        const path = "/api/2.0/instance-profiles/edit";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Edit an instance profile.
     *
     * The only supported field to change is the optional IAM role ARN associated
     * with the instance profile. It is required to specify the IAM role ARN if
     * both of the following are true:
     *
     * * Your role name and instance profile name do not match. The name is the
     * part after the last slash in each ARN. * You want to use the instance
     * profile with [Databricks SQL Serverless].
     *
     * To understand where these fields are in the AWS console, see [Enable
     * serverless SQL warehouses].
     *
     * This API is only available to admin users.
     *
     * [Databricks SQL Serverless]: https://docs.databricks.com/sql/admin/serverless.html
     * [Enable serverless SQL warehouses]: https://docs.databricks.com/sql/admin/serverless.html
     */
    async edit(request, context) {
        return await this._edit(request, context);
    }
    async _list(context) {
        const path = "/api/2.0/instance-profiles/list";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * List available instance profiles.
     *
     * List the instance profiles that the calling user can use to launch a
     * cluster.
     *
     * This API is available to all users.
     */
    async *list(context) {
        const response = (await this._list(context)).instance_profiles;
        for (const v of response || []) {
            yield v;
        }
    }
    async _remove(request, context) {
        const path = "/api/2.0/instance-profiles/remove";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Remove the instance profile.
     *
     * Remove the instance profile with the provided ARN. Existing clusters with
     * this instance profile will continue to function.
     *
     * This API is only accessible to admin users.
     */
    async remove(request, context) {
        return await this._remove(request, context);
    }
}
exports.InstanceProfilesService = InstanceProfilesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstanceProfilesService.prototype, "_add", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstanceProfilesService.prototype, "add", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstanceProfilesService.prototype, "_edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstanceProfilesService.prototype, "edit", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], InstanceProfilesService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Object)
], InstanceProfilesService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstanceProfilesService.prototype, "_remove", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], InstanceProfilesService.prototype, "remove", null);
//# sourceMappingURL=api.js.map