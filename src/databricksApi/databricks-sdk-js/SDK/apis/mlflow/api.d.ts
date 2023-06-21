import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class ExperimentsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ExperimentsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class ExperimentsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
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
    create(request: model.CreateExperiment, context?: Context): Promise<model.CreateExperimentResponse>;
    private _delete;
    /**
     * Delete an experiment.
     *
     * Marks an experiment and associated metadata, runs, metrics, params, and
     * tags for deletion. If the experiment uses FileStore, artifacts associated
     * with experiment are also deleted.
     */
    delete(request: model.DeleteExperiment, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get an experiment.
     *
     * Gets metadata for an experiment. This method works on deleted experiments.
     */
    get(request: model.GetExperimentRequest, context?: Context): Promise<model.Experiment>;
    private _getByName;
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
    getByName(request: model.GetByNameRequest, context?: Context): Promise<model.GetExperimentByNameResponse>;
    private _list;
    /**
     * List experiments.
     *
     * Gets a list of all experiments.
     */
    list(request: model.ListExperimentsRequest, context?: Context): AsyncIterable<model.Experiment>;
    private _restore;
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
    restore(request: model.RestoreExperiment, context?: Context): Promise<model.EmptyResponse>;
    private _search;
    /**
     * Search experiments.
     *
     * Searches for experiments that satisfy specified search criteria.
     */
    search(request: model.SearchExperiments, context?: Context): AsyncIterable<model.Experiment>;
    private _setExperimentTag;
    /**
     * Set a tag.
     *
     * Sets a tag on an experiment. Experiment tags are metadata that can be
     * updated.
     */
    setExperimentTag(request: model.SetExperimentTag, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Update an experiment.
     *
     * Updates experiment metadata.
     */
    update(request: model.UpdateExperiment, context?: Context): Promise<model.EmptyResponse>;
}
export declare class MLflowArtifactsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class MLflowArtifactsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class MLflowArtifactsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _list;
    /**
     * Get all artifacts.
     *
     * List artifacts for a run. Takes an optional `artifact_path` prefix. If it
     * is specified, the response contains only artifacts with the specified
     * prefix.",
     */
    list(request: model.ListArtifactsRequest, context?: Context): AsyncIterable<model.FileInfo>;
}
export declare class MLflowDatabricksRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class MLflowDatabricksError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * These endpoints are modified versions of the MLflow API that accept additional
 * input parameters or return additional information.
 */
export declare class MLflowDatabricksService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _get;
    /**
     * Get model.
     *
     * Get the details of a model. This is a Databricks Workspace version of the
     * [MLflow endpoint] that also returns the model's Databricks Workspace ID
     * and the permission level of the requesting user on the model.
     *
     * [MLflow endpoint]: https://www.mlflow.org/docs/latest/rest-api.html#get-registeredmodel
     */
    get(request: model.GetMLflowDatabrickRequest, context?: Context): Promise<model.GetResponse>;
    private _transitionStage;
    /**
     * Transition a stage.
     *
     * Transition a model version's stage. This is a Databricks Workspace version
     * of the [MLflow endpoint] that also accepts a comment associated with the
     * transition to be recorded.",
     *
     * [MLflow endpoint]: https://www.mlflow.org/docs/latest/rest-api.html#transition-modelversion-stage
     */
    transitionStage(request: model.TransitionModelVersionStageDatabricks, context?: Context): Promise<model.TransitionStageResponse>;
}
export declare class MLflowMetricsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class MLflowMetricsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class MLflowMetricsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _getHistory;
    /**
     * Get history of a given metric within a run.
     *
     * Gets a list of all values for the specified metric for a given run.
     */
    getHistory(request: model.GetHistoryRequest, context?: Context): Promise<model.GetMetricHistoryResponse>;
}
export declare class MLflowRunsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class MLflowRunsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class MLflowRunsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a run.
     *
     * Creates a new run within an experiment. A run is usually a single
     * execution of a machine learning or data ETL pipeline. MLflow uses runs to
     * track the `mlflowParam`, `mlflowMetric` and `mlflowRunTag` associated with
     * a single execution.
     */
    create(request: model.CreateRun, context?: Context): Promise<model.CreateRunResponse>;
    private _delete;
    /**
     * Delete a run.
     *
     * Marks a run for deletion.
     */
    delete(request: model.DeleteRun, context?: Context): Promise<model.EmptyResponse>;
    private _deleteTag;
    /**
     * Delete a tag.
     *
     * Deletes a tag on a run. Tags are run metadata that can be updated during a
     * run and after a run completes.
     */
    deleteTag(request: model.DeleteTag, context?: Context): Promise<model.EmptyResponse>;
    private _get;
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
    get(request: model.GetRunRequest, context?: Context): Promise<model.GetRunResponse>;
    private _logBatch;
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
    logBatch(request: model.LogBatch, context?: Context): Promise<model.EmptyResponse>;
    private _logMetric;
    /**
     * Log a metric.
     *
     * Logs a metric for a run. A metric is a key-value pair (string key, float
     * value) with an associated timestamp. Examples include the various metrics
     * that represent ML model accuracy. A metric can be logged multiple times.
     */
    logMetric(request: model.LogMetric, context?: Context): Promise<model.EmptyResponse>;
    private _logModel;
    /**
     * Log a model.
     *
     * **NOTE:** Experimental: This API may change or be removed in a future
     * release without warning.
     */
    logModel(request: model.LogModel, context?: Context): Promise<model.EmptyResponse>;
    private _logParameter;
    /**
     * Log a param.
     *
     * Logs a param used for a run. A param is a key-value pair (string key,
     * string value). Examples include hyperparameters used for ML model training
     * and constant dates and values used in an ETL pipeline. A param can be
     * logged only once for a run.
     */
    logParameter(request: model.LogParam, context?: Context): Promise<model.EmptyResponse>;
    private _restore;
    /**
     * Restore a run.
     *
     * Restores a deleted run.
     */
    restore(request: model.RestoreRun, context?: Context): Promise<model.EmptyResponse>;
    private _search;
    /**
     * Search for runs.
     *
     * Searches for runs that satisfy expressions.
     *
     * Search expressions can use `mlflowMetric` and `mlflowParam` keys.",
     */
    search(request: model.SearchRuns, context?: Context): AsyncIterable<model.Run>;
    private _setTag;
    /**
     * Set a tag.
     *
     * Sets a tag on a run. Tags are run metadata that can be updated during a
     * run and after a run completes.
     */
    setTag(request: model.SetTag, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Update a run.
     *
     * Updates run metadata.
     */
    update(request: model.UpdateRun, context?: Context): Promise<model.UpdateRunResponse>;
}
export declare class ModelVersionCommentsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ModelVersionCommentsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class ModelVersionCommentsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Post a comment.
     *
     * Posts a comment on a model version. A comment can be submitted either by a
     * user or programmatically to display relevant information about the model.
     * For example, test results or deployment errors.
     */
    create(request: model.CreateComment, context?: Context): Promise<model.CreateResponse>;
    private _delete;
    /**
     * Delete a comment.
     *
     * Deletes a comment on a model version.
     */
    delete(request: model.DeleteModelVersionCommentRequest, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Update a comment.
     *
     * Post an edit to a comment on a model version.
     */
    update(request: model.UpdateComment, context?: Context): Promise<model.UpdateResponse>;
}
export declare class ModelVersionsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ModelVersionsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class ModelVersionsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a model version.
     *
     * Creates a model version.
     */
    create(request: model.CreateModelVersionRequest, context?: Context): Promise<model.CreateModelVersionResponse>;
    private _delete;
    /**
     * Delete a model version.
     *
     * Deletes a model version.
     */
    delete(request: model.DeleteModelVersionRequest, context?: Context): Promise<model.EmptyResponse>;
    private _deleteTag;
    /**
     * Delete a model version tag.
     *
     * Deletes a model version tag.
     */
    deleteTag(request: model.DeleteModelVersionTagRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a model version.
     *
     * Get a model version.
     */
    get(request: model.GetModelVersionRequest, context?: Context): Promise<model.GetModelVersionResponse>;
    private _getDownloadUri;
    /**
     * Get a model version URI.
     *
     * Gets a URI to download the model version.
     */
    getDownloadUri(request: model.GetModelVersionDownloadUriRequest, context?: Context): Promise<model.GetModelVersionDownloadUriResponse>;
    private _search;
    /**
     * Searches model versions.
     *
     * Searches for specific model versions based on the supplied __filter__.
     */
    search(request: model.SearchModelVersionsRequest, context?: Context): AsyncIterable<model.ModelVersion>;
    private _setTag;
    /**
     * Set a version tag.
     *
     * Sets a model version tag.
     */
    setTag(request: model.SetModelVersionTagRequest, context?: Context): Promise<model.EmptyResponse>;
    private _transitionStage;
    /**
     * Transition a stage.
     *
     * Transition to the next model stage.
     */
    transitionStage(request: model.TransitionModelVersionStage, context?: Context): Promise<model.TransitionModelVersionStageResponse>;
    private _update;
    /**
     * Update model version.
     *
     * Updates the model version.
     */
    update(request: model.UpdateModelVersionRequest, context?: Context): Promise<model.EmptyResponse>;
}
export declare class RegisteredModelsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class RegisteredModelsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class RegisteredModelsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a model.
     *
     * Creates a new registered model with the name specified in the request
     * body.
     *
     * Throws `RESOURCE_ALREADY_EXISTS` if a registered model with the given name
     * exists.
     */
    create(request: model.CreateRegisteredModelRequest, context?: Context): Promise<model.CreateRegisteredModelResponse>;
    private _delete;
    /**
     * Delete a model.
     *
     * Deletes a registered model.
     */
    delete(request: model.DeleteRegisteredModelRequest, context?: Context): Promise<model.EmptyResponse>;
    private _deleteTag;
    /**
     * Delete a model tag.
     *
     * Deletes the tag for a registered model.
     */
    deleteTag(request: model.DeleteRegisteredModelTagRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a model.
     *
     * Gets the registered model that matches the specified ID.
     */
    get(request: model.GetRegisteredModelRequest, context?: Context): Promise<model.GetRegisteredModelResponse>;
    private _getLatestVersions;
    /**
     * Get the latest version.
     *
     * Gets the latest version of a registered model.
     */
    getLatestVersions(request: model.GetLatestVersionsRequest, context?: Context): AsyncIterable<model.ModelVersion>;
    private _list;
    /**
     * List models.
     *
     * Lists all available registered models, up to the limit specified in
     * __max_results__.
     */
    list(request: model.ListRegisteredModelsRequest, context?: Context): AsyncIterable<model.RegisteredModel>;
    private _rename;
    /**
     * Rename a model.
     *
     * Renames a registered model.
     */
    rename(request: model.RenameRegisteredModelRequest, context?: Context): Promise<model.RenameRegisteredModelResponse>;
    private _search;
    /**
     * Search models.
     *
     * Search for registered models based on the specified __filter__.
     */
    search(request: model.SearchRegisteredModelsRequest, context?: Context): AsyncIterable<model.RegisteredModel>;
    private _setTag;
    /**
     * Set a tag.
     *
     * Sets a tag on a registered model.
     */
    setTag(request: model.SetRegisteredModelTagRequest, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Update model.
     *
     * Updates a registered model.
     */
    update(request: model.UpdateRegisteredModelRequest, context?: Context): Promise<model.EmptyResponse>;
}
export declare class RegistryWebhooksRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class RegistryWebhooksError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class RegistryWebhooksService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a webhook.
     *
     * **NOTE**: This endpoint is in Public Preview.
     *
     * Creates a registry webhook.
     */
    create(request: model.CreateRegistryWebhook, context?: Context): Promise<model.CreateResponse>;
    private _delete;
    /**
     * Delete a webhook.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Deletes a registry webhook.
     */
    delete(request: model.DeleteRegistryWebhookRequest, context?: Context): Promise<model.EmptyResponse>;
    private _list;
    /**
     * List registry webhooks.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Lists all registry webhooks.
     */
    list(request: model.ListRegistryWebhooksRequest, context?: Context): AsyncIterable<model.RegistryWebhook>;
    private _test;
    /**
     * Test a webhook.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Tests a registry webhook.
     */
    test(request: model.TestRegistryWebhookRequest, context?: Context): Promise<model.TestRegistryWebhookResponse>;
    private _update;
    /**
     * Update a webhook.
     *
     * **NOTE:** This endpoint is in Public Preview.
     *
     * Updates a registry webhook.
     */
    update(request: model.UpdateRegistryWebhook, context?: Context): Promise<model.EmptyResponse>;
}
export declare class TransitionRequestsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class TransitionRequestsError extends ApiError {
    constructor(method: string, message?: string);
}
/**

*/
export declare class TransitionRequestsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _approve;
    /**
     * Approve transition requests.
     *
     * Approves a model version stage transition request.
     */
    approve(request: model.ApproveTransitionRequest, context?: Context): Promise<model.ApproveResponse>;
    private _create;
    /**
     * Make a transition request.
     *
     * Creates a model version stage transition request.
     */
    create(request: model.CreateTransitionRequest, context?: Context): Promise<model.CreateResponse>;
    private _delete;
    /**
     * Delete a ransition request.
     *
     * Cancels a model version stage transition request.
     */
    delete(request: model.DeleteTransitionRequestRequest, context?: Context): Promise<model.EmptyResponse>;
    private _list;
    /**
     * List transition requests.
     *
     * Gets a list of all open stage transition requests for the model version.
     */
    list(request: model.ListTransitionRequestsRequest, context?: Context): AsyncIterable<model.Activity>;
    private _reject;
    /**
     * Reject a transition request.
     *
     * Rejects a model version stage transition request.
     */
    reject(request: model.RejectTransitionRequest, context?: Context): Promise<model.RejectResponse>;
}
//# sourceMappingURL=api.d.ts.map