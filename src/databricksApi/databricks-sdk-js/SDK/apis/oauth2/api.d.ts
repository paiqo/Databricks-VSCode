import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class CustomAppIntegrationRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class CustomAppIntegrationError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * These APIs enable administrators to manage custom oauth app integrations,
 * which is required for adding/using Custom OAuth App Integration like Tableau
 * Cloud for Databricks in AWS cloud.
 *
 * **Note:** You can only add/use the OAuth custom application integrations when
 * OAuth enrollment status is enabled. For more details see
 * :method:OAuthEnrollment/create
 */
export declare class CustomAppIntegrationService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create Custom OAuth App Integration.
     *
     * Create Custom OAuth App Integration.
     *
     * You can retrieve the custom oauth app integration via :method:get.
     */
    create(request: model.CreateCustomAppIntegration, context?: Context): Promise<model.CreateCustomAppIntegrationOutput>;
    private _delete;
    /**
     * Delete Custom OAuth App Integration.
     *
     * Delete an existing Custom OAuth App Integration. You can retrieve the
     * custom oauth app integration via :method:get.
     */
    delete(request: model.DeleteCustomAppIntegrationRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get OAuth Custom App Integration.
     *
     * Gets the Custom OAuth App Integration for the given integration id.
     */
    get(request: model.GetCustomAppIntegrationRequest, context?: Context): Promise<model.GetCustomAppIntegrationOutput>;
    private _update;
    /**
     * Updates Custom OAuth App Integration.
     *
     * Updates an existing custom OAuth App Integration. You can retrieve the
     * custom oauth app integration via :method:get.
     */
    update(request: model.UpdateCustomAppIntegration, context?: Context): Promise<model.EmptyResponse>;
}
export declare class PublishedAppIntegrationRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class PublishedAppIntegrationError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * These APIs enable administrators to manage published oauth app integrations,
 * which is required for adding/using Published OAuth App Integration like
 * Tableau Cloud for Databricks in AWS cloud.
 *
 * **Note:** You can only add/use the OAuth published application integrations
 * when OAuth enrollment status is enabled. For more details see
 * :method:OAuthEnrollment/create
 */
export declare class PublishedAppIntegrationService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create Published OAuth App Integration.
     *
     * Create Published OAuth App Integration.
     *
     * You can retrieve the published oauth app integration via :method:get.
     */
    create(request: model.CreatePublishedAppIntegration, context?: Context): Promise<model.CreatePublishedAppIntegrationOutput>;
    private _delete;
    /**
     * Delete Published OAuth App Integration.
     *
     * Delete an existing Published OAuth App Integration. You can retrieve the
     * published oauth app integration via :method:get.
     */
    delete(request: model.DeletePublishedAppIntegrationRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get OAuth Published App Integration.
     *
     * Gets the Published OAuth App Integration for the given integration id.
     */
    get(request: model.GetPublishedAppIntegrationRequest, context?: Context): Promise<model.GetPublishedAppIntegrationOutput>;
    private _update;
    /**
     * Updates Published OAuth App Integration.
     *
     * Updates an existing published OAuth App Integration. You can retrieve the
     * published oauth app integration via :method:get.
     */
    update(request: model.UpdatePublishedAppIntegration, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map