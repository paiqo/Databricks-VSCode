import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class InstancePoolsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class InstancePoolsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Instance Pools API are used to create, edit, delete and list instance pools by
 * using ready-to-use cloud instances which reduces a cluster start and
 * auto-scaling times.
 *
 * Databricks pools reduce cluster start and auto-scaling times by maintaining a
 * set of idle, ready-to-use instances. When a cluster is attached to a pool,
 * cluster nodes are created using the pool’s idle instances. If the pool has
 * no idle instances, the pool expands by allocating a new instance from the
 * instance provider in order to accommodate the cluster’s request. When a
 * cluster releases an instance, it returns to the pool and is free for another
 * cluster to use. Only clusters attached to a pool can use that pool’s idle
 * instances.
 *
 * You can specify a different pool for the driver node and worker nodes, or use
 * the same pool for both.
 *
 * Databricks does not charge DBUs while instances are idle in the pool. Instance
 * provider billing does apply. See pricing.
 */
export declare class InstancePoolsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a new instance pool.
     *
     * Creates a new instance pool using idle and ready-to-use cloud instances.
     */
    create(request: model.CreateInstancePool, context?: Context): Promise<model.CreateInstancePoolResponse>;
    private _delete;
    /**
     * Delete an instance pool.
     *
     * Deletes the instance pool permanently. The idle instances in the pool are
     * terminated asynchronously.
     */
    delete(request: model.DeleteInstancePool, context?: Context): Promise<model.EmptyResponse>;
    private _edit;
    /**
     * Edit an existing instance pool.
     *
     * Modifies the configuration of an existing instance pool.
     */
    edit(request: model.EditInstancePool, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get instance pool information.
     *
     * Retrieve the information for an instance pool based on its identifier.
     */
    get(request: model.Get, context?: Context): Promise<model.GetInstancePool>;
    private _list;
    /**
     * List instance pool info.
     *
     * Gets a list of instance pools with their statistics.
     */
    list(context?: Context): AsyncIterable<model.InstancePoolAndStats>;
}
//# sourceMappingURL=api.d.ts.map