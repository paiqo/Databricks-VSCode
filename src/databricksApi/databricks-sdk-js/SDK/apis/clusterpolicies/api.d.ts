import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class ClusterPoliciesRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ClusterPoliciesError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Cluster policy limits the ability to configure clusters based on a set of
 * rules. The policy rules limit the attributes or attribute values available for
 * cluster creation. Cluster policies have ACLs that limit their use to specific
 * users and groups.
 *
 * Cluster policies let you limit users to create clusters with prescribed
 * settings, simplify the user interface and enable more users to create their
 * own clusters (by fixing and hiding some values), control cost by limiting per
 * cluster maximum cost (by setting limits on attributes whose values contribute
 * to hourly price).
 *
 * Cluster policy permissions limit which policies a user can select in the
 * Policy drop-down when the user creates a cluster: - A user who has cluster
 * create permission can select the Unrestricted policy and create
 * fully-configurable clusters. - A user who has both cluster create permission
 * and access to cluster policies can select the Unrestricted policy and policies
 * they have access to. - A user that has access to only cluster policies, can
 * select the policies they have access to.
 *
 * If no policies have been created in the workspace, the Policy drop-down does
 * not display.
 *
 * Only admin users can create, edit, and delete policies. Admin users also have
 * access to all policies.
 */
export declare class ClusterPoliciesService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a new policy.
     *
     * Creates a new policy with prescribed settings.
     */
    create(request: model.CreatePolicy, context?: Context): Promise<model.CreatePolicyResponse>;
    private _delete;
    /**
     * Delete a cluster policy.
     *
     * Delete a policy for a cluster. Clusters governed by this policy can still
     * run, but cannot be edited.
     */
    delete(request: model.DeletePolicy, context?: Context): Promise<model.EmptyResponse>;
    private _edit;
    /**
     * Update a cluster policy.
     *
     * Update an existing policy for cluster. This operation may make some
     * clusters governed by the previous policy invalid.
     */
    edit(request: model.EditPolicy, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get entity.
     *
     * Get a cluster policy entity. Creation and editing is available to admins
     * only.
     */
    get(request: model.Get, context?: Context): Promise<model.Policy>;
    private _list;
    /**
     * Get a cluster policy.
     *
     * Returns a list of policies accessible by the requesting user.
     */
    list(request: model.List, context?: Context): AsyncIterable<model.Policy>;
}
export declare class PolicyFamiliesRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class PolicyFamiliesError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * View available policy families. A policy family contains a policy definition
 * providing best practices for configuring clusters for a particular use case.
 *
 * Databricks manages and provides policy families for several common cluster use
 * cases. You cannot create, edit, or delete policy families.
 *
 * Policy families cannot be used directly to create clusters. Instead, you
 * create cluster policies using a policy family. Cluster policies created using
 * a policy family inherit the policy family's policy definition.
 */
export declare class PolicyFamiliesService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _get;
    /**
        
        */
    get(request: model.GetPolicyFamilyRequest, context?: Context): Promise<model.PolicyFamily>;
    private _list;
    /**
        
        */
    list(request: model.ListPolicyFamiliesRequest, context?: Context): AsyncIterable<model.PolicyFamily>;
}
//# sourceMappingURL=api.d.ts.map