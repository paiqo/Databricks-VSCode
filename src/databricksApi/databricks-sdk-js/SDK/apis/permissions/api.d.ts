import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class PermissionsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class PermissionsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Permissions API are used to create read, write, edit, update and manage access
 * for various users on different objects and endpoints.
 */
export declare class PermissionsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _get;
    /**
     * Get object permissions.
     *
     * Gets the permission of an object. Objects can inherit permissions from
     * their parent objects or root objects.
     */
    get(request: model.Get, context?: Context): Promise<model.ObjectPermissions>;
    private _getPermissionLevels;
    /**
     * Get permission levels.
     *
     * Gets the permission levels that a user can have on an object.
     */
    getPermissionLevels(request: model.GetPermissionLevels, context?: Context): Promise<model.GetPermissionLevelsResponse>;
    private _set;
    /**
     * Set permissions.
     *
     * Sets permissions on object. Objects can inherit permissions from their
     * parent objects and root objects.
     */
    set(request: model.PermissionsRequest, context?: Context): Promise<model.EmptyResponse>;
    private _update;
    /**
     * Update permission.
     *
     * Updates the permissions on an object.
     */
    update(request: model.PermissionsRequest, context?: Context): Promise<model.EmptyResponse>;
}
export declare class WorkspaceAssignmentRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class WorkspaceAssignmentError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Workspace Permission Assignment API allows you to manage workspace
 * permissions for principals in your account.
 */
export declare class WorkspaceAssignmentService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _delete;
    /**
     * Delete permissions assignment.
     *
     * Deletes the workspace permissions assignment in a given account and
     * workspace for the specified principal.
     */
    delete(request: model.DeleteWorkspaceAssignmentRequest, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * List workspace permissions.
     *
     * Get an array of workspace permissions for the specified account and
     * workspace.
     */
    get(request: model.GetWorkspaceAssignmentRequest, context?: Context): Promise<model.WorkspacePermissions>;
    private _list;
    /**
     * Get permission assignments.
     *
     * Get the permission assignments for the specified Databricks Account and
     * Databricks Workspace.
     */
    list(request: model.ListWorkspaceAssignmentRequest, context?: Context): AsyncIterable<model.PermissionAssignment>;
    private _update;
    /**
     * Create or update permissions assignment.
     *
     * Creates or updates the workspace permissions assignment in a given account
     * and workspace for the specified principal.
     */
    update(request: model.UpdateWorkspaceAssignments, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map