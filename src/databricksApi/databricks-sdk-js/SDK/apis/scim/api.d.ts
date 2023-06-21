import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class AccountGroupsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class AccountGroupsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Groups simplify identity management, making it easier to assign access to
 * Databricks Account, data, and other securable objects.
 *
 * It is best practice to assign access to workspaces and access-control policies
 * in Unity Catalog to groups, instead of to users individually. All Databricks
 * Account identities can be assigned as members of groups, and members inherit
 * permissions that are assigned to their group.
 */
export declare class AccountGroupsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a new group.
     *
     * Creates a group in the Databricks Account with a unique name, using the
     * supplied group details.
     */
    create(request: model.Group, context?: Context): Promise<model.Group>;
    private _delete;
    /**
     * Delete a group.
     *
     * Deletes a group from the Databricks Account.
     */
    delete(request: model.DeleteGroupRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get group details.
     *
     * Gets the information for a specific group in the Databricks Account.
     */
    get(request: model.GetGroupRequest, context?: Context): Promise<model.Group>;
    private _list;
    /**
     * List group details.
     *
     * Gets all details of the groups associated with the Databricks Account.
     */
    list(request: model.ListGroupsRequest, context?: Context): AsyncIterable<model.Group>;
    private _patch;
    /**
     * Update group details.
     *
     * Partially updates the details of a group.
     */
    patch(request: model.PartialUpdate, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Replace a group.
     *
     * Updates the details of a group by replacing the entire group entity.
     */
    update(request: model.Group, context?: Context): Promise<model.EmptyResponse>;
}
export declare class AccountServicePrincipalsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class AccountServicePrincipalsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Identities for use with jobs, automated tools, and systems such as scripts,
 * apps, and CI/CD platforms. Databricks recommends creating service principals
 * to run production jobs or modify production data. If all processes that act on
 * production data run with service principals, interactive users do not need any
 * write, delete, or modify privileges in production. This eliminates the risk of
 * a user overwriting production data by accident.
 */
export declare class AccountServicePrincipalsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a service principal.
     *
     * Creates a new service principal in the Databricks Account.
     */
    create(request: model.ServicePrincipal, context?: Context): Promise<model.ServicePrincipal>;
    private _delete;
    /**
     * Delete a service principal.
     *
     * Delete a single service principal in the Databricks Account.
     */
    delete(request: model.DeleteServicePrincipalRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get service principal details.
     *
     * Gets the details for a single service principal define in the Databricks
     * Account.
     */
    get(request: model.GetServicePrincipalRequest, context?: Context): Promise<model.ServicePrincipal>;
    private _list;
    /**
     * List service principals.
     *
     * Gets the set of service principals associated with a Databricks Account.
     */
    list(request: model.ListServicePrincipalsRequest, context?: Context): AsyncIterable<model.ServicePrincipal>;
    private _patch;
    /**
     * Update service principal details.
     *
     * Partially updates the details of a single service principal in the
     * Databricks Account.
     */
    patch(request: model.PartialUpdate, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Replace service principal.
     *
     * Updates the details of a single service principal.
     *
     * This action replaces the existing service principal with the same name.
     */
    update(request: model.ServicePrincipal, context?: Context): Promise<model.EmptyResponse>;
}
export declare class AccountUsersRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class AccountUsersError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * User identities recognized by Databricks and represented by email addresses.
 *
 * Databricks recommends using SCIM provisioning to sync users and groups
 * automatically from your identity provider to your Databricks Account. SCIM
 * streamlines onboarding a new employee or team by using your identity provider
 * to create users and groups in Databricks Account and give them the proper
 * level of access. When a user leaves your organization or no longer needs
 * access to Databricks Account, admins can terminate the user in your identity
 * provider and that user’s account will also be removed from Databricks
 * Account. This ensures a consistent offboarding process and prevents
 * unauthorized users from accessing sensitive data.
 */
export declare class AccountUsersService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a new user.
     *
     * Creates a new user in the Databricks Account. This new user will also be
     * added to the Databricks account.
     */
    create(request: model.User, context?: Context): Promise<model.User>;
    private _delete;
    /**
     * Delete a user.
     *
     * Deletes a user. Deleting a user from a Databricks Account also removes
     * objects associated with the user.
     */
    delete(request: model.DeleteUserRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get user details.
     *
     * Gets information for a specific user in Databricks Account.
     */
    get(request: model.GetUserRequest, context?: Context): Promise<model.User>;
    private _list;
    /**
     * List users.
     *
     * Gets details for all the users associated with a Databricks Account.
     */
    list(request: model.ListUsersRequest, context?: Context): AsyncIterable<model.User>;
    private _patch;
    /**
     * Update user details.
     *
     * Partially updates a user resource by applying the supplied operations on
     * specific user attributes.
     */
    patch(request: model.PartialUpdate, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Replace a user.
     *
     * Replaces a user's information with the data supplied in request.
     */
    update(request: model.User, context?: Context): Promise<model.EmptyResponse>;
}
export declare class CurrentUserRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class CurrentUserError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * This API allows retrieving information about currently authenticated user or
 * service principal.
 */
export declare class CurrentUserService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _me;
    /**
     * Get current user info.
     *
     * Get details about the current method caller's identity.
     */
    me(context?: Context): Promise<model.User>;
}
export declare class GroupsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class GroupsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Groups simplify identity management, making it easier to assign access to
 * Databricks Workspace, data, and other securable objects.
 *
 * It is best practice to assign access to workspaces and access-control policies
 * in Unity Catalog to groups, instead of to users individually. All Databricks
 * Workspace identities can be assigned as members of groups, and members inherit
 * permissions that are assigned to their group.
 */
export declare class GroupsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a new group.
     *
     * Creates a group in the Databricks Workspace with a unique name, using the
     * supplied group details.
     */
    create(request: model.Group, context?: Context): Promise<model.Group>;
    private _delete;
    /**
     * Delete a group.
     *
     * Deletes a group from the Databricks Workspace.
     */
    delete(request: model.DeleteGroupRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get group details.
     *
     * Gets the information for a specific group in the Databricks Workspace.
     */
    get(request: model.GetGroupRequest, context?: Context): Promise<model.Group>;
    private _list;
    /**
     * List group details.
     *
     * Gets all details of the groups associated with the Databricks Workspace.
     */
    list(request: model.ListGroupsRequest, context?: Context): AsyncIterable<model.Group>;
    private _patch;
    /**
     * Update group details.
     *
     * Partially updates the details of a group.
     */
    patch(request: model.PartialUpdate, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Replace a group.
     *
     * Updates the details of a group by replacing the entire group entity.
     */
    update(request: model.Group, context?: Context): Promise<model.EmptyResponse>;
}
export declare class ServicePrincipalsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ServicePrincipalsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Identities for use with jobs, automated tools, and systems such as scripts,
 * apps, and CI/CD platforms. Databricks recommends creating service principals
 * to run production jobs or modify production data. If all processes that act on
 * production data run with service principals, interactive users do not need any
 * write, delete, or modify privileges in production. This eliminates the risk of
 * a user overwriting production data by accident.
 */
export declare class ServicePrincipalsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a service principal.
     *
     * Creates a new service principal in the Databricks Workspace.
     */
    create(request: model.ServicePrincipal, context?: Context): Promise<model.ServicePrincipal>;
    private _delete;
    /**
     * Delete a service principal.
     *
     * Delete a single service principal in the Databricks Workspace.
     */
    delete(request: model.DeleteServicePrincipalRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get service principal details.
     *
     * Gets the details for a single service principal define in the Databricks
     * Workspace.
     */
    get(request: model.GetServicePrincipalRequest, context?: Context): Promise<model.ServicePrincipal>;
    private _list;
    /**
     * List service principals.
     *
     * Gets the set of service principals associated with a Databricks Workspace.
     */
    list(request: model.ListServicePrincipalsRequest, context?: Context): AsyncIterable<model.ServicePrincipal>;
    private _patch;
    /**
     * Update service principal details.
     *
     * Partially updates the details of a single service principal in the
     * Databricks Workspace.
     */
    patch(request: model.PartialUpdate, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Replace service principal.
     *
     * Updates the details of a single service principal.
     *
     * This action replaces the existing service principal with the same name.
     */
    update(request: model.ServicePrincipal, context?: Context): Promise<model.EmptyResponse>;
}
export declare class UsersRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class UsersError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * User identities recognized by Databricks and represented by email addresses.
 *
 * Databricks recommends using SCIM provisioning to sync users and groups
 * automatically from your identity provider to your Databricks Workspace. SCIM
 * streamlines onboarding a new employee or team by using your identity provider
 * to create users and groups in Databricks Workspace and give them the proper
 * level of access. When a user leaves your organization or no longer needs
 * access to Databricks Workspace, admins can terminate the user in your identity
 * provider and that user’s account will also be removed from Databricks
 * Workspace. This ensures a consistent offboarding process and prevents
 * unauthorized users from accessing sensitive data.
 */
export declare class UsersService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a new user.
     *
     * Creates a new user in the Databricks Workspace. This new user will also be
     * added to the Databricks account.
     */
    create(request: model.User, context?: Context): Promise<model.User>;
    private _delete;
    /**
     * Delete a user.
     *
     * Deletes a user. Deleting a user from a Databricks Workspace also removes
     * objects associated with the user.
     */
    delete(request: model.DeleteUserRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get user details.
     *
     * Gets information for a specific user in Databricks Workspace.
     */
    get(request: model.GetUserRequest, context?: Context): Promise<model.User>;
    private _list;
    /**
     * List users.
     *
     * Gets details for all the users associated with a Databricks Workspace.
     */
    list(request: model.ListUsersRequest, context?: Context): AsyncIterable<model.User>;
    private _patch;
    /**
     * Update user details.
     *
     * Partially updates a user resource by applying the supplied operations on
     * specific user attributes.
     */
    patch(request: model.PartialUpdate, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Replace a user.
     *
     * Replaces a user's information with the data supplied in request.
     */
    update(request: model.User, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map