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
exports.TransitionRequestsService = exports.TransitionRequestsError = exports.TransitionRequestsRetriableError = exports.RegistryWebhooksService = exports.RegistryWebhooksError = exports.RegistryWebhooksRetriableError = exports.RegisteredModelsService = exports.RegisteredModelsError = exports.RegisteredModelsRetriableError = exports.ModelVersionsService = exports.ModelVersionsError = exports.ModelVersionsRetriableError = exports.ModelVersionCommentsService = exports.ModelVersionCommentsError = exports.ModelVersionCommentsRetriableError = exports.MLflowRunsService = exports.MLflowRunsError = exports.MLflowRunsRetriableError = exports.MLflowMetricsService = exports.MLflowMetricsError = exports.MLflowMetricsRetriableError = exports.MLflowDatabricksService = exports.MLflowDatabricksError = exports.MLflowDatabricksRetriableError = exports.MLflowArtifactsService = exports.MLflowArtifactsError = exports.MLflowArtifactsRetriableError = exports.ExperimentsService = exports.ExperimentsError = exports.ExperimentsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class ExperimentsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Experiments", method, message);
    }
}
exports.ExperimentsRetriableError = ExperimentsRetriableError;
class ExperimentsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Experiments", method, message);
    }
}
exports.ExperimentsError = ExperimentsError;
/**

*/
class ExperimentsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/mlflow/experiments/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create experiment.
     *
     * Creates an experiment with a name. Returns the ID of the newly created
     * experiment. Validates that another experiment with the same name does not
     * already exist and fails if another experiment with the same name already
     * exists.
     *
     * Throws `RESOURCE_ALREADY_EXISTS` if a experiment with the given name
     * exists.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/mlflow/experiments/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete an experiment.
     *
     * Marks an experiment and associated metadata, runs, metrics, params, and
     * tags for deletion. If the experiment uses FileStore, artifacts associated
     * with experiment are also deleted.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _get(request, context) {
        const path = "/api/2.0/mlflow/experiments/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get an experiment.
     *
     * Gets metadata for an experiment. This method works on deleted experiments.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _getByName(request, context) {
        const path = "/api/2.0/mlflow/experiments/get-by-name";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get metadata.
     *
     * "Gets metadata for an experiment.
     *
     * This endpoint will return deleted experiments, but prefers the active
     * experiment if an active and deleted experiment share the same name. If
     * multiple deleted experiments share the same name, the API will return one
     * of them.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if no experiment with the specified name
     * exists.S
     */
    async getByName(request, context) {
        return await this._getByName(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/mlflow/experiments/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List experiments.
     *
     * Gets a list of all experiments.
     */
    async *list(request, context) {
        while (true) {
            const response = await this._list(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.experiments || response.experiments.length === 0) {
                break;
            }
            for (const v of response.experiments) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _restore(request, context) {
        const path = "/api/2.0/mlflow/experiments/restore";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Restores an experiment.
     *
     * "Restore an experiment marked for deletion. This also restores associated
     * metadata, runs, metrics, params, and tags. If experiment uses FileStore,
     * underlying artifacts associated with experiment are also restored.
     *
     * Throws `RESOURCE_DOES_NOT_EXIST` if experiment was never created or was
     * permanently deleted.",
     */
    async restore(request, context) {
        return await this._restore(request, context);
    }
    async _search(request, context) {
        const path = "/api/2.0/mlflow/experiments/search";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Search experiments.
     *
     * Searches for experiments that satisfy specified search criteria.
     */
    async *search(request, context) {
        while (true) {
            const response = await this._search(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.experiments || response.experiments.length === 0) {
                break;
            }
            for (const v of response.experiments) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _setExperimentTag(request, context) {
        const path = "/api/2.0/mlflow/experiments/set-experiment-tag";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Set a tag.
     *
     * Sets a tag on an experiment. Experiment tags are metadata that can be
     * updated.
     */
    async setExperimentTag(request, context) {
        return await this._setExperimentTag(request, context);
    }
    async _update(request, context) {
        const path = "/api/2.0/mlflow/experiments/update";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Update an experiment.
     *
     * Updates experiment metadata.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.ExperimentsService = ExperimentsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_getByName", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "getByName", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ExperimentsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_restore", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "restore", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ExperimentsService.prototype, "search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_setExperimentTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "setExperimentTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ExperimentsService.prototype, "update", null);
class MLflowArtifactsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("MLflowArtifacts", method, message);
    }
}
exports.MLflowArtifactsRetriableError = MLflowArtifactsRetriableError;
class MLflowArtifactsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("MLflowArtifacts", method, message);
    }
}
exports.MLflowArtifactsError = MLflowArtifactsError;
/**

*/
class MLflowArtifactsService {
    constructor(client) {
        this.client = client;
    }
    async _list(request, context) {
        const path = "/api/2.0/mlflow/artifacts/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get all artifacts.
     *
     * List artifacts for a run. Takes an optional `artifact_path` prefix. If it
     * is specified, the response contains only artifacts with the specified
     * prefix.",
     */
    async *list(request, context) {
        while (true) {
            const response = await this._list(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.files || response.files.length === 0) {
                break;
            }
            for (const v of response.files) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
}
exports.MLflowArtifactsService = MLflowArtifactsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowArtifactsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], MLflowArtifactsService.prototype, "list", null);
class MLflowDatabricksRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("MLflowDatabricks", method, message);
    }
}
exports.MLflowDatabricksRetriableError = MLflowDatabricksRetriableError;
class MLflowDatabricksError extends apiError_1.ApiError {
    constructor(method, message) {
        super("MLflowDatabricks", method, message);
    }
}
exports.MLflowDatabricksError = MLflowDatabricksError;
/**
 * These endpoints are modified versions of the MLflow API that accept additional
 * input parameters or return additional information.
 */
class MLflowDatabricksService {
    constructor(client) {
        this.client = client;
    }
    async _get(request, context) {
        const path = "/api/2.0/mlflow/databricks/registered-models/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get model.
     *
     * Get the details of a model. This is a Databricks Workspace version of the
     * [MLflow endpoint] that also returns the model's Databricks Workspace ID
     * and the permission level of the requesting user on the model.
     *
     * [MLflow endpoint]: https://www.mlflow.org/docs/latest/rest-api.html#get-registeredmodel
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _transitionStage(request, context) {
        const path = "/api/2.0/mlflow/databricks/model-versions/transition-stage";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Transition a stage.
     *
     * Transition a model version's stage. This is a Databricks Workspace version
     * of the [MLflow endpoint] that also accepts a comment associated with the
     * transition to be recorded.",
     *
     * [MLflow endpoint]: https://www.mlflow.org/docs/latest/rest-api.html#transition-modelversion-stage
     */
    async transitionStage(request, context) {
        return await this._transitionStage(request, context);
    }
}
exports.MLflowDatabricksService = MLflowDatabricksService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowDatabricksService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowDatabricksService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowDatabricksService.prototype, "_transitionStage", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowDatabricksService.prototype, "transitionStage", null);
class MLflowMetricsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("MLflowMetrics", method, message);
    }
}
exports.MLflowMetricsRetriableError = MLflowMetricsRetriableError;
class MLflowMetricsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("MLflowMetrics", method, message);
    }
}
exports.MLflowMetricsError = MLflowMetricsError;
/**

*/
class MLflowMetricsService {
    constructor(client) {
        this.client = client;
    }
    async _getHistory(request, context) {
        const path = "/api/2.0/mlflow/metrics/get-history";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get history of a given metric within a run.
     *
     * Gets a list of all values for the specified metric for a given run.
     */
    async getHistory(request, context) {
        return await this._getHistory(request, context);
    }
}
exports.MLflowMetricsService = MLflowMetricsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowMetricsService.prototype, "_getHistory", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowMetricsService.prototype, "getHistory", null);
class MLflowRunsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("MLflowRuns", method, message);
    }
}
exports.MLflowRunsRetriableError = MLflowRunsRetriableError;
class MLflowRunsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("MLflowRuns", method, message);
    }
}
exports.MLflowRunsError = MLflowRunsError;
/**

*/
class MLflowRunsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/mlflow/runs/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a run.
     *
     * Creates a new run within an experiment. A run is usually a single
     * execution of a machine learning or data ETL pipeline. MLflow uses runs to
     * track the `mlflowParam`, `mlflowMetric` and `mlflowRunTag` associated with
     * a single execution.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/mlflow/runs/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a run.
     *
     * Marks a run for deletion.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _deleteTag(request, context) {
        const path = "/api/2.0/mlflow/runs/delete-tag";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a tag.
     *
     * Deletes a tag on a run. Tags are run metadata that can be updated during a
     * run and after a run completes.
     */
    async deleteTag(request, context) {
        return await this._deleteTag(request, context);
    }
    async _get(request, context) {
        const path = "/api/2.0/mlflow/runs/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a run.
     *
     * "Gets the metadata, metrics, params, and tags for a run. In the case where
     * multiple metrics with the same key are logged for a run, return only the
     * value with the latest timestamp.
     *
     * If there are multiple values with the latest timestamp, return the maximum
     * of these values.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _logBatch(request, context) {
        const path = "/api/2.0/mlflow/runs/log-batch";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Log a batch.
     *
     * Logs a batch of metrics, params, and tags for a run. If any data failed to
     * be persisted, the server will respond with an error (non-200 status code).
     *
     * In case of error (due to internal server error or an invalid request),
     * partial data may be written.
     *
     * You can write metrics, params, and tags in interleaving fashion, but
     * within a given entity type are guaranteed to follow the order specified in
     * the request body.
     *
     * The overwrite behavior for metrics, params, and tags is as follows:
     *
     * * Metrics: metric values are never overwritten. Logging a metric (key,
     * value, timestamp) appends to the set of values for the metric with the
     * provided key.
     *
     * * Tags: tag values can be overwritten by successive writes to the same tag
     * key. That is, if multiple tag values with the same key are provided in the
     * same API request, the last-provided tag value is written. Logging the same
     * tag (key, value) is permitted. Specifically, logging a tag is idempotent.
     *
     * * Parameters: once written, param values cannot be changed (attempting to
     * overwrite a param value will result in an error). However, logging the
     * same param (key, value) is permitted. Specifically, logging a param is
     * idempotent.
     *
     * Request Limits ------------------------------- A single JSON-serialized
     * API request may be up to 1 MB in size and contain:
     *
     * * No more than 1000 metrics, params, and tags in total * Up to 1000
     * metrics - Up to 100 params * Up to 100 tags
     *
     * For example, a valid request might contain 900 metrics, 50 params, and 50
     * tags, but logging 900 metrics, 50 params, and 51 tags is invalid.
     *
     * The following limits also apply to metric, param, and tag keys and values:
     *
     * * Metric keyes, param keys, and tag keys can be up to 250 characters in
     * length * Parameter and tag values can be up to 250 characters in length
     */
    async logBatch(request, context) {
        return await this._logBatch(request, context);
    }
    async _logMetric(request, context) {
        const path = "/api/2.0/mlflow/runs/log-metric";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Log a metric.
     *
     * Logs a metric for a run. A metric is a key-value pair (string key, float
     * value) with an associated timestamp. Examples include the various metrics
     * that represent ML model accuracy. A metric can be logged multiple times.
     */
    async logMetric(request, context) {
        return await this._logMetric(request, context);
    }
    async _logModel(request, context) {
        const path = "/api/2.0/mlflow/runs/log-model";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Log a model.
     *
     * **NOTE:** Experimental: This API may change or be removed in a future
     * release without warning.
     */
    async logModel(request, context) {
        return await this._logModel(request, context);
    }
    async _logParameter(request, context) {
        const path = "/api/2.0/mlflow/runs/log-parameter";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Log a param.
     *
     * Logs a param used for a run. A param is a key-value pair (string key,
     * string value). Examples include hyperparameters used for ML model training
     * and constant dates and values used in an ETL pipeline. A param can be
     * logged only once for a run.
     */
    async logParameter(request, context) {
        return await this._logParameter(request, context);
    }
    async _restore(request, context) {
        const path = "/api/2.0/mlflow/runs/restore";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Restore a run.
     *
     * Restores a deleted run.
     */
    async restore(request, context) {
        return await this._restore(request, context);
    }
    async _search(request, context) {
        const path = "/api/2.0/mlflow/runs/search";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Search for runs.
     *
     * Searches for runs that satisfy expressions.
     *
     * Search expressions can use `mlflowMetric` and `mlflowParam` keys.",
     */
    async *search(request, context) {
        while (true) {
            const response = await this._search(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.runs || response.runs.length === 0) {
                break;
            }
            for (const v of response.runs) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _setTag(request, context) {
        const path = "/api/2.0/mlflow/runs/set-tag";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Set a tag.
     *
     * Sets a tag on a run. Tags are run metadata that can be updated during a
     * run and after a run completes.
     */
    async setTag(request, context) {
        return await this._setTag(request, context);
    }
    async _update(request, context) {
        const path = "/api/2.0/mlflow/runs/update";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Update a run.
     *
     * Updates run metadata.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.MLflowRunsService = MLflowRunsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_deleteTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "deleteTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_logBatch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "logBatch", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_logMetric", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "logMetric", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_logModel", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "logModel", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_logParameter", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "logParameter", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_restore", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "restore", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], MLflowRunsService.prototype, "search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_setTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "setTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], MLflowRunsService.prototype, "update", null);
class ModelVersionCommentsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("ModelVersionComments", method, message);
    }
}
exports.ModelVersionCommentsRetriableError = ModelVersionCommentsRetriableError;
class ModelVersionCommentsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("ModelVersionComments", method, message);
    }
}
exports.ModelVersionCommentsError = ModelVersionCommentsError;
/**

*/
class ModelVersionCommentsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/mlflow/comments/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Post a comment.
     *
     * Posts a comment on a model version. A comment can be submitted either by a
     * user or programmatically to display relevant information about the model.
     * For example, test results or deployment errors.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/mlflow/comments/delete";
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a comment.
     *
     * Deletes a comment on a model version.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _update(request, context) {
        const path = "/api/2.0/mlflow/comments/update";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Update a comment.
     *
     * Post an edit to a comment on a model version.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.ModelVersionCommentsService = ModelVersionCommentsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionCommentsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionCommentsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionCommentsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionCommentsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionCommentsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionCommentsService.prototype, "update", null);
class ModelVersionsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("ModelVersions", method, message);
    }
}
exports.ModelVersionsRetriableError = ModelVersionsRetriableError;
class ModelVersionsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("ModelVersions", method, message);
    }
}
exports.ModelVersionsError = ModelVersionsError;
/**

*/
class ModelVersionsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/mlflow/model-versions/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a model version.
     *
     * Creates a model version.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/mlflow/model-versions/delete";
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a model version.
     *
     * Deletes a model version.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _deleteTag(request, context) {
        const path = "/api/2.0/mlflow/model-versions/delete-tag";
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a model version tag.
     *
     * Deletes a model version tag.
     */
    async deleteTag(request, context) {
        return await this._deleteTag(request, context);
    }
    async _get(request, context) {
        const path = "/api/2.0/mlflow/model-versions/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a model version.
     *
     * Get a model version.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _getDownloadUri(request, context) {
        const path = "/api/2.0/mlflow/model-versions/get-download-uri";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a model version URI.
     *
     * Gets a URI to download the model version.
     */
    async getDownloadUri(request, context) {
        return await this._getDownloadUri(request, context);
    }
    async _search(request, context) {
        const path = "/api/2.0/mlflow/model-versions/search";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Searches model versions.
     *
     * Searches for specific model versions based on the supplied __filter__.
     */
    async *search(request, context) {
        while (true) {
            const response = await this._search(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.model_versions ||
                response.model_versions.length === 0) {
                break;
            }
            for (const v of response.model_versions) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _setTag(request, context) {
        const path = "/api/2.0/mlflow/model-versions/set-tag";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Set a version tag.
     *
     * Sets a model version tag.
     */
    async setTag(request, context) {
        return await this._setTag(request, context);
    }
    async _transitionStage(request, context) {
        const path = "/api/2.0/mlflow/model-versions/transition-stage";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Transition a stage.
     *
     * Transition to the next model stage.
     */
    async transitionStage(request, context) {
        return await this._transitionStage(request, context);
    }
    async _update(request, context) {
        const path = "/api/2.0/mlflow/model-versions/update";
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update model version.
     *
     * Updates the model version.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.ModelVersionsService = ModelVersionsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_deleteTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "deleteTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_getDownloadUri", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "getDownloadUri", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], ModelVersionsService.prototype, "search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_setTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "setTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_transitionStage", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "transitionStage", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], ModelVersionsService.prototype, "update", null);
class RegisteredModelsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("RegisteredModels", method, message);
    }
}
exports.RegisteredModelsRetriableError = RegisteredModelsRetriableError;
class RegisteredModelsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("RegisteredModels", method, message);
    }
}
exports.RegisteredModelsError = RegisteredModelsError;
/**

*/
class RegisteredModelsService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/mlflow/registered-models/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a model.
     *
     * Creates a new registered model with the name specified in the request
     * body.
     *
     * Throws `RESOURCE_ALREADY_EXISTS` if a registered model with the given name
     * exists.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/mlflow/registered-models/delete";
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a model.
     *
     * Deletes a registered model.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _deleteTag(request, context) {
        const path = "/api/2.0/mlflow/registered-models/delete-tag";
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a model tag.
     *
     * Deletes the tag for a registered model.
     */
    async deleteTag(request, context) {
        return await this._deleteTag(request, context);
    }
    async _get(request, context) {
        const path = "/api/2.0/mlflow/registered-models/get";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get a model.
     *
     * Gets the registered model that matches the specified ID.
     */
    async get(request, context) {
        return await this._get(request, context);
    }
    async _getLatestVersions(request, context) {
        const path = "/api/2.0/mlflow/registered-models/get-latest-versions";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Get the latest version.
     *
     * Gets the latest version of a registered model.
     */
    async *getLatestVersions(request, context) {
        const response = (await this._getLatestVersions(request, context))
            .model_versions;
        for (const v of response || []) {
            yield v;
        }
    }
    async _list(request, context) {
        const path = "/api/2.0/mlflow/registered-models/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List models.
     *
     * Lists all available registered models, up to the limit specified in
     * __max_results__.
     */
    async *list(request, context) {
        while (true) {
            const response = await this._list(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.registered_models ||
                response.registered_models.length === 0) {
                break;
            }
            for (const v of response.registered_models) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _rename(request, context) {
        const path = "/api/2.0/mlflow/registered-models/rename";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Rename a model.
     *
     * Renames a registered model.
     */
    async rename(request, context) {
        return await this._rename(request, context);
    }
    async _search(request, context) {
        const path = "/api/2.0/mlflow/registered-models/search";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Search models.
     *
     * Search for registered models based on the specified __filter__.
     */
    async *search(request, context) {
        while (true) {
            const response = await this._search(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.registered_models ||
                response.registered_models.length === 0) {
                break;
            }
            for (const v of response.registered_models) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _setTag(request, context) {
        const path = "/api/2.0/mlflow/registered-models/set-tag";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Set a tag.
     *
     * Sets a tag on a registered model.
     */
    async setTag(request, context) {
        return await this._setTag(request, context);
    }
    async _update(request, context) {
        const path = "/api/2.0/mlflow/registered-models/update";
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update model.
     *
     * Updates a registered model.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.RegisteredModelsService = RegisteredModelsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_deleteTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "deleteTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "get", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_getLatestVersions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], RegisteredModelsService.prototype, "getLatestVersions", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], RegisteredModelsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_rename", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "rename", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], RegisteredModelsService.prototype, "search", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_setTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "setTag", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegisteredModelsService.prototype, "update", null);
class RegistryWebhooksRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("RegistryWebhooks", method, message);
    }
}
exports.RegistryWebhooksRetriableError = RegistryWebhooksRetriableError;
class RegistryWebhooksError extends apiError_1.ApiError {
    constructor(method, message) {
        super("RegistryWebhooks", method, message);
    }
}
exports.RegistryWebhooksError = RegistryWebhooksError;
/**

*/
class RegistryWebhooksService {
    constructor(client) {
        this.client = client;
    }
    async _create(request, context) {
        const path = "/api/2.0/mlflow/registry-webhooks/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a webhook.
     *
     * **NOTE**: This endpoint is in Public Preview.
     *
     * Creates a registry webhook.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/mlflow/registry-webhooks/delete";
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a webhook.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Deletes a registry webhook.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/mlflow/registry-webhooks/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List registry webhooks.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Lists all registry webhooks.
     */
    async *list(request, context) {
        while (true) {
            const response = await this._list(request, context);
            if (context?.cancellationToken &&
                context?.cancellationToken.isCancellationRequested) {
                break;
            }
            if (!response.webhooks || response.webhooks.length === 0) {
                break;
            }
            for (const v of response.webhooks) {
                yield v;
            }
            request.page_token = response.next_page_token;
            if (!response.next_page_token) {
                break;
            }
        }
    }
    async _test(request, context) {
        const path = "/api/2.0/mlflow/registry-webhooks/test";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Test a webhook.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Tests a registry webhook.
     */
    async test(request, context) {
        return await this._test(request, context);
    }
    async _update(request, context) {
        const path = "/api/2.0/mlflow/registry-webhooks/update";
        return (await this.client.request(path, "PATCH", request, context));
    }
    /**
     * Update a webhook.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Updates a registry webhook.
     */
    async update(request, context) {
        return await this._update(request, context);
    }
}
exports.RegistryWebhooksService = RegistryWebhooksService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], RegistryWebhooksService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "_test", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "test", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "_update", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], RegistryWebhooksService.prototype, "update", null);
class TransitionRequestsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("TransitionRequests", method, message);
    }
}
exports.TransitionRequestsRetriableError = TransitionRequestsRetriableError;
class TransitionRequestsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("TransitionRequests", method, message);
    }
}
exports.TransitionRequestsError = TransitionRequestsError;
/**

*/
class TransitionRequestsService {
    constructor(client) {
        this.client = client;
    }
    async _approve(request, context) {
        const path = "/api/2.0/mlflow/transition-requests/approve";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Approve transition requests.
     *
     * Approves a model version stage transition request.
     */
    async approve(request, context) {
        return await this._approve(request, context);
    }
    async _create(request, context) {
        const path = "/api/2.0/mlflow/transition-requests/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Make a transition request.
     *
     * Creates a model version stage transition request.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/mlflow/transition-requests/delete";
        return (await this.client.request(path, "DELETE", request, context));
    }
    /**
     * Delete a ransition request.
     *
     * Cancels a model version stage transition request.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/mlflow/transition-requests/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List transition requests.
     *
     * Gets a list of all open stage transition requests for the model version.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).requests;
        for (const v of response || []) {
            yield v;
        }
    }
    async _reject(request, context) {
        const path = "/api/2.0/mlflow/transition-requests/reject";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Reject a transition request.
     *
     * Rejects a model version stage transition request.
     */
    async reject(request, context) {
        return await this._reject(request, context);
    }
}
exports.TransitionRequestsService = TransitionRequestsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "_approve", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "approve", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], TransitionRequestsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "_reject", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], TransitionRequestsService.prototype, "reject", null);
//# sourceMappingURL=api.js.map