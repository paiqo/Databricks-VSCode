import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class WorkspaceRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class WorkspaceError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Workspace API allows you to list, import, export, and delete notebooks and
 * folders.
 *
 * A notebook is a web-based interface to a document that contains runnable code,
 * visualizations, and explanatory text.
 */
export declare class WorkspaceService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _delete;
    /**
     * Delete a workspace object.
     *
     * Deletes an object or a directory (and optionally recursively deletes all
     * objects in the directory). * If `path` does not exist, this call returns
     * an error `RESOURCE_DOES_NOT_EXIST`. * If `path` is a non-empty directory
     * and `recursive` is set to `false`, this call returns an error
     * `DIRECTORY_NOT_EMPTY`.
     *
     * Object deletion cannot be undone and deleting a directory recursively is
     * not atomic.
     */
    delete(request: model.Delete, context?: Context): Promise<model.EmptyResponse>;
    private _export;
    /**
     * Export a notebook.
     *
     * Exports a notebook or the contents of an entire directory.
     *
     * If `path` does not exist, this call returns an error
     * `RESOURCE_DOES_NOT_EXIST`.
     *
     * One can only export a directory in `DBC` format. If the exported data
     * would exceed size limit, this call returns `MAX_NOTEBOOK_SIZE_EXCEEDED`.
     * Currently, this API does not support exporting a library.
     */
    export(request: model.Export, context?: Context): Promise<model.ExportResponse>;
    private _getStatus;
    /**
     * Get status.
     *
     * Gets the status of an object or a directory. If `path` does not exist,
     * this call returns an error `RESOURCE_DOES_NOT_EXIST`.
     */
    getStatus(request: model.GetStatus, context?: Context): Promise<model.ObjectInfo>;
    private _import;
    /**
     * Import a notebook.
     *
     * Imports a notebook or the contents of an entire directory. If `path`
     * already exists and `overwrite` is set to `false`, this call returns an
     * error `RESOURCE_ALREADY_EXISTS`. One can only use `DBC` format to import a
     * directory.
     */
    import(request: model.Import, context?: Context): Promise<model.EmptyResponse>;
    private _list;
    /**
     * List contents.
     *
     * Lists the contents of a directory, or the object if it is not a
     * directory.If the input path does not exist, this call returns an error
     * `RESOURCE_DOES_NOT_EXIST`.
     */
    list(request: model.List, context?: Context): AsyncIterable<model.ObjectInfo>;
    private _mkdirs;
    /**
     * Create a directory.
     *
     * Creates the specified directory (and necessary parent directories if they
     * do not exist). If there is an object (not a directory) at any prefix of
     * the input path, this call returns an error `RESOURCE_ALREADY_EXISTS`.
     *
     * Note that if this operation fails it may have succeeded in creating some
     * of the necessary parrent directories.
     */
    mkdirs(request: model.Mkdirs, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map