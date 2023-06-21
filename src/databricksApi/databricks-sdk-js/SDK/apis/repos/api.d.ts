import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class ReposRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class ReposError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Repos API allows users to manage their git repos. Users can use the API to
 * access all repos that they have manage permissions on.
 *
 * Databricks Repos is a visual Git client in Databricks. It supports common Git
 * operations such a cloning a repository, committing and pushing, pulling,
 * branch management, and visual comparison of diffs when committing.
 *
 * Within Repos you can develop code in notebooks or other files and follow data
 * science and engineering code development best practices using Git for version
 * control, collaboration, and CI/CD.
 */
export declare class ReposService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a repo.
     *
     * Creates a repo in the workspace and links it to the remote Git repo
     * specified. Note that repos created programmatically must be linked to a
     * remote Git repo, unlike repos created in the browser.
     */
    create(request: model.CreateRepo, context?: Context): Promise<model.RepoInfo>;
    private _delete;
    /**
     * Delete a repo.
     *
     * Deletes the specified repo.
     */
    delete(request: model.Delete, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a repo.
     *
     * Returns the repo with the given repo ID.
     */
    get(request: model.Get, context?: Context): Promise<model.RepoInfo>;
    private _list;
    /**
     * Get repos.
     *
     * Returns repos that the calling user has Manage permissions on. Results are
     * paginated with each page containing twenty repos.
     */
    list(request: model.List, context?: Context): AsyncIterable<model.RepoInfo>;
    private _update;
    /**
     * Update a repo.
     *
     * Updates the repo to a different branch or tag, or updates the repo to the
     * latest commit on the same branch.
     */
    update(request: model.UpdateRepo, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map