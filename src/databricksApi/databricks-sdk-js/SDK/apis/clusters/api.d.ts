import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
import { Waiter } from "../../wait";
export declare class ClustersRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ClustersError extends ApiError {
    constructor(method: string, message?: string);
}
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
export declare class ClustersService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _changeOwner;
    /**
     * Change cluster owner.
     *
     * Change the owner of the cluster. You must be an admin to perform this
     * operation.
     */
    changeOwner(request: model.ChangeClusterOwner, context?: Context): Promise<model.EmptyResponse>;
    private _create;
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
    create(createCluster: model.CreateCluster, context?: Context): Promise<Waiter<model.CreateClusterResponse, model.ClusterInfo>>;
    private _delete;
    /**
     * Terminate cluster.
     *
     * Terminates the Spark cluster with the specified ID. The cluster is removed
     * asynchronously. Once the termination has completed, the cluster will be in
     * a `TERMINATED` state. If the cluster is already in a `TERMINATING` or
     * `TERMINATED` state, nothing will happen.
     */
    delete(deleteCluster: model.DeleteCluster, context?: Context): Promise<Waiter<model.EmptyResponse, model.ClusterInfo>>;
    private _edit;
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
    edit(editCluster: model.EditCluster, context?: Context): Promise<Waiter<model.EmptyResponse, model.ClusterInfo>>;
    private _events;
    /**
     * List cluster activity events.
     *
     * Retrieves a list of events about the activity of a cluster. This API is
     * paginated. If there are more events to read, the response includes all the
     * nparameters necessary to request the next page of events.
     */
    events(request: model.GetEvents, context?: Context): AsyncIterable<model.ClusterEvent>;
    private _get;
    /**
     * Get cluster info.
     *
     * "Retrieves the information for a cluster given its identifier. Clusters
     * can be described while they are running, or up to 60 days after they are
     * terminated.
     */
    get(get: model.Get, context?: Context): Promise<Waiter<model.ClusterInfo, model.ClusterInfo>>;
    private _list;
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
    list(request: model.List, context?: Context): AsyncIterable<model.ClusterInfo>;
    private _listNodeTypes;
    /**
     * List node types.
     *
     * Returns a list of supported Spark node types. These node types can be used
     * to launch a cluster.
     */
    listNodeTypes(context?: Context): Promise<model.ListNodeTypesResponse>;
    private _listZones;
    /**
     * List availability zones.
     *
     * Returns a list of availability zones where clusters can be created in (For
     * example, us-west-2a). These zones can be used to launch a cluster.
     */
    listZones(context?: Context): Promise<model.ListAvailableZonesResponse>;
    private _permanentDelete;
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
    permanentDelete(request: model.PermanentDeleteCluster, context?: Context): Promise<model.EmptyResponse>;
    private _pin;
    /**
     * Pin cluster.
     *
     * Pinning a cluster ensures that the cluster will always be returned by the
     * ListClusters API. Pinning a cluster that is already pinned will have no
     * effect. This API can only be called by workspace admins.
     */
    pin(request: model.PinCluster, context?: Context): Promise<model.EmptyResponse>;
    private _resize;
    /**
     * Resize cluster.
     *
     * Resizes a cluster to have a desired number of workers. This will fail
     * unless the cluster is in a `RUNNING` state.
     */
    resize(resizeCluster: model.ResizeCluster, context?: Context): Promise<Waiter<model.EmptyResponse, model.ClusterInfo>>;
    private _restart;
    /**
     * Restart cluster.
     *
     * Restarts a Spark cluster with the supplied ID. If the cluster is not
     * currently in a `RUNNING` state, nothing will happen.
     */
    restart(restartCluster: model.RestartCluster, context?: Context): Promise<Waiter<model.EmptyResponse, model.ClusterInfo>>;
    private _sparkVersions;
    /**
     * List available Spark versions.
     *
     * Returns the list of available Spark versions. These versions can be used
     * to launch a cluster.
     */
    sparkVersions(context?: Context): Promise<model.GetSparkVersionsResponse>;
    private _start;
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
    start(startCluster: model.StartCluster, context?: Context): Promise<Waiter<model.EmptyResponse, model.ClusterInfo>>;
    private _unpin;
    /**
     * Unpin cluster.
     *
     * Unpinning a cluster will allow the cluster to eventually be removed from
     * the ListClusters API. Unpinning a cluster that is not pinned will have no
     * effect. This API can only be called by workspace admins.
     */
    unpin(request: model.UnpinCluster, context?: Context): Promise<model.EmptyResponse>;
}
export declare class InstanceProfilesRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class InstanceProfilesError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Instance Profiles API allows admins to add, list, and remove instance
 * profiles that users can launch clusters with. Regular users can list the
 * instance profiles available to them. See [Secure access to S3 buckets] using
 * instance profiles for more information.
 *
 * [Secure access to S3 buckets]: https://docs.databricks.com/administration-guide/cloud-configurations/aws/instance-profiles.html
 */
export declare class InstanceProfilesService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _add;
    /**
     * Register an instance profile.
     *
     * In the UI, you can select the instance profile when launching clusters.
     * This API is only available to admin users.
     */
    add(request: model.AddInstanceProfile, context?: Context): Promise<model.EmptyResponse>;
    private _edit;
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
    edit(request: model.InstanceProfile, context?: Context): Promise<model.EmptyResponse>;
    private _list;
    /**
     * List available instance profiles.
     *
     * List the instance profiles that the calling user can use to launch a
     * cluster.
     *
     * This API is available to all users.
     */
    list(context?: Context): AsyncIterable<model.InstanceProfile>;
    private _remove;
    /**
     * Remove the instance profile.
     *
     * Remove the instance profile with the provided ARN. Existing clusters with
     * this instance profile will continue to function.
     *
     * This API is only accessible to admin users.
     */
    remove(request: model.RemoveInstanceProfile, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map