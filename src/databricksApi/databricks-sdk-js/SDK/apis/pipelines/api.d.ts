import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
import { Waiter } from "../../wait";
export declare class PipelinesRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class PipelinesError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Delta Live Tables API allows you to create, edit, delete, start, and view
 * details about pipelines.
 *
 * Delta Live Tables is a framework for building reliable, maintainable, and
 * testable data processing pipelines. You define the transformations to perform
 * on your data, and Delta Live Tables manages task orchestration, cluster
 * management, monitoring, data quality, and error handling.
 *
 * Instead of defining your data pipelines using a series of separate Apache
 * Spark tasks, Delta Live Tables manages how your data is transformed based on a
 * target schema you define for each processing step. You can also enforce data
 * quality with Delta Live Tables expectations. Expectations allow you to define
 * expected data quality and specify how to handle records that fail those
 * expectations.
 */
export declare class PipelinesService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a pipeline.
     *
     * Creates a new data processing pipeline based on the requested
     * configuration. If successful, this method returns the ID of the new
     * pipeline.
     */
    create(request: model.CreatePipeline, context?: Context): Promise<model.CreatePipelineResponse>;
    private _delete;
    /**
     * Delete a pipeline.
     *
     * Deletes a pipeline.
     */
    delete(request: model.Delete, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a pipeline.
     */
    get(get: model.Get, context?: Context): Promise<Waiter<model.GetPipelineResponse, model.GetPipelineResponse>>;
    private _getUpdate;
    /**
     * Get a pipeline update.
     *
     * Gets an update from an active pipeline.
     */
    getUpdate(request: model.GetUpdate, context?: Context): Promise<model.GetUpdateResponse>;
    private _listPipelineEvents;
    /**
     * List pipeline events.
     *
     * Retrieves events for a pipeline.
     */
    listPipelineEvents(request: model.ListPipelineEvents, context?: Context): AsyncIterable<model.PipelineEvent>;
    private _listPipelines;
    /**
     * List pipelines.
     *
     * Lists pipelines defined in the Delta Live Tables system.
     */
    listPipelines(request: model.ListPipelines, context?: Context): AsyncIterable<model.PipelineStateInfo>;
    private _listUpdates;
    /**
     * List pipeline updates.
     *
     * List updates for an active pipeline.
     */
    listUpdates(request: model.ListUpdates, context?: Context): Promise<model.ListUpdatesResponse>;
    private _reset;
    /**
     * Reset a pipeline.
     *
     * Resets a pipeline.
     */
    reset(reset: model.Reset, context?: Context): Promise<Waiter<model.EmptyResponse, model.GetPipelineResponse>>;
    private _startUpdate;
    /**
     * Queue a pipeline update.
     *
     * Starts or queues a pipeline update.
     */
    startUpdate(request: model.StartUpdate, context?: Context): Promise<model.StartUpdateResponse>;
    private _stop;
    /**
     * Stop a pipeline.
     *
     * Stops a pipeline.
     */
    stop(stop: model.Stop, context?: Context): Promise<Waiter<model.EmptyResponse, model.GetPipelineResponse>>;
    private _update;
    /**
     * Edit a pipeline.
     *
     * Updates a pipeline with the supplied configuration.
     */
    update(request: model.EditPipeline, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map