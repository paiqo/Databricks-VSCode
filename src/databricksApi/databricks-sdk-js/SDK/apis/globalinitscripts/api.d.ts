import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class GlobalInitScriptsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class GlobalInitScriptsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Global Init Scripts API enables Workspace administrators to configure
 * global initialization scripts for their workspace. These scripts run on every
 * node in every cluster in the workspace.
 *
 * **Important:** Existing clusters must be restarted to pick up any changes made
 * to global init scripts. Global init scripts are run in order. If the init
 * script returns with a bad exit code, the Apache Spark container fails to
 * launch and init scripts with later position are skipped. If enough containers
 * fail, the entire cluster fails with a `GLOBAL_INIT_SCRIPT_FAILURE` error code.
 */
export declare class GlobalInitScriptsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create init script.
     *
     * Creates a new global init script in this workspace.
     */
    create(request: model.GlobalInitScriptCreateRequest, context?: Context): Promise<model.CreateResponse>;
    private _delete;
    /**
     * Delete init script.
     *
     * Deletes a global init script.
     */
    delete(request: model.Delete, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get an init script.
     *
     * Gets all the details of a script, including its Base64-encoded contents.
     */
    get(request: model.Get, context?: Context): Promise<model.GlobalInitScriptDetailsWithContent>;
    private _list;
    /**
     * Get init scripts.
     *
     * "Get a list of all global init scripts for this workspace. This returns
     * all properties for each script but **not** the script contents. To
     * retrieve the contents of a script, use the [get a global init
     * script](#operation/get-script) operation.
     */
    list(context?: Context): AsyncIterable<model.GlobalInitScriptDetails>;
    private _update;
    /**
     * Update init script.
     *
     * Updates a global init script, specifying only the fields to change. All
     * fields are optional. Unspecified fields retain their current value.
     */
    update(request: model.GlobalInitScriptUpdateRequest, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map