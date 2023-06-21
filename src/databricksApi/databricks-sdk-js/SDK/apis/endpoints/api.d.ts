import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
import { Waiter } from "../../wait";
export declare class ServingEndpointsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ServingEndpointsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Serving Endpoints API allows you to create, update, and delete model
 * serving endpoints.
 *
 * You can use a serving endpoint to serve models from the Databricks Model
 * Registry. Endpoints expose the underlying models as scalable REST API
 * endpoints using serverless compute. This means the endpoints and associated
 * compute resources are fully managed by Databricks and will not appear in your
 * cloud account. A serving endpoint can consist of one or more MLflow models
 * from the Databricks Model Registry, called served models. A serving endpoint
 * can have at most ten served models. You can configure traffic settings to
 * define how requests should be routed to your served models behind an endpoint.
 * Additionally, you can configure the scale of resources that should be applied
 * to each served model.
 */
export declare class ServingEndpointsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _buildLogs;
    /**
     * Retrieve the logs associated with building the model's environment for a
     * given serving endpoint's served model.
     *
     * Retrieves the build logs associated with the provided served model.
     */
    buildLogs(request: model.BuildLogsRequest, context?: Context): Promise<model.BuildLogsResponse>;
    private _create;
    /**
     * Create a new serving endpoint.
     */
    create(createServingEndpoint: model.CreateServingEndpoint, context?: Context): Promise<Waiter<model.ServingEndpointDetailed, model.ServingEndpointDetailed>>;
    private _delete;
    /**
     * Delete a serving endpoint.
     */
    delete(request: model.DeleteServingEndpointRequest, context?: Context): Promise<model.EmptyResponse>;
    private _exportMetrics;
    /**
     * Retrieve the metrics corresponding to a serving endpoint for the current
     * time in Prometheus or OpenMetrics exposition format.
     *
     * Retrieves the metrics associated with the provided serving endpoint in
     * either Prometheus or OpenMetrics exposition format.
     */
    exportMetrics(request: model.ExportMetricsRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a single serving endpoint.
     *
     * Retrieves the details for a single serving endpoint.
     */
    get(request: model.GetServingEndpointRequest, context?: Context): Promise<model.ServingEndpointDetailed>;
    private _list;
    /**
     * Retrieve all serving endpoints.
     */
    list(context?: Context): Promise<model.ListEndpointsResponse>;
    private _logs;
    /**
     * Retrieve the most recent log lines associated with a given serving
     * endpoint's served model.
     *
     * Retrieves the service logs associated with the provided served model.
     */
    logs(request: model.LogsRequest, context?: Context): Promise<model.ServerLogsResponse>;
    private _query;
    /**
     * Query a serving endpoint with provided model input.
     */
    query(request: model.QueryRequest, context?: Context): Promise<model.QueryEndpointResponse>;
    private _updateConfig;
    /**
     * Update a serving endpoint with a new config.
     *
     * Updates any combination of the serving endpoint's served models, the
     * compute configuration of those served models, and the endpoint's traffic
     * config. An endpoint that already has an update in progress can not be
     * updated until the current update completes or fails.
     */
    updateConfig(endpointCoreConfigInput: model.EndpointCoreConfigInput, context?: Context): Promise<Waiter<model.ServingEndpointDetailed, model.ServingEndpointDetailed>>;
}
//# sourceMappingURL=api.d.ts.map