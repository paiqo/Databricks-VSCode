import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class WorkspaceConfRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class WorkspaceConfError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * This API allows updating known workspace settings for advanced users.
 */
export declare class WorkspaceConfService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _getStatus;
    /**
     * Check configuration status.
     *
     * Gets the configuration status for a workspace.
     */
    getStatus(request: model.GetStatus, context?: Context): Promise<model.WorkspaceConf>;
    private _setStatus;
    /**
     * Enable/disable features.
     *
     * Sets the configuration status for a workspace, including enabling or
     * disabling it.
     */
    setStatus(request: model.WorkspaceConf, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map