import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class GitCredentialsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class GitCredentialsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Registers personal access token for Databricks to do operations on behalf of
 * the user.
 *
 * See [more info].
 *
 * [more info]: https://docs.databricks.com/repos/get-access-tokens-from-git-provider.html
 */
export declare class GitCredentialsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a credential entry.
     *
     * Creates a Git credential entry for the user. Only one Git credential per
     * user is supported, so any attempts to create credentials if an entry
     * already exists will fail. Use the PATCH endpoint to update existing
     * credentials, or the DELETE endpoint to delete existing credentials.
     */
    create(request: model.CreateCredentials, context?: Context): Promise<model.CreateCredentialsResponse>;
    private _delete;
    /**
     * Delete a credential.
     *
     * Deletes the specified Git credential.
     */
    delete(request: model.Delete, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get a credential entry.
     *
     * Gets the Git credential with the specified credential ID.
     */
    get(request: model.Get, context?: Context): Promise<model.CredentialInfo>;
    private _list;
    /**
     * Get Git credentials.
     *
     * Lists the calling user's Git credentials. One credential per user is
     * supported.
     */
    list(context?: Context): AsyncIterable<model.CredentialInfo>;
    private _update;
    /**
     * Update a credential.
     *
     * Updates the specified Git credential.
     */
    update(request: model.UpdateCredentials, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map