import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
import { Waiter } from "../../wait";
export declare class CommandExecutionRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class CommandExecutionError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * This API allows execution of Python, Scala, SQL, or R commands on running
 * Databricks Clusters.
 */
export declare class CommandExecutionService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _cancel;
    /**
     * Cancel a command.
     *
     * Cancels a currently running command within an execution context.
     *
     * The command ID is obtained from a prior successful call to __execute__.
     */
    cancel(cancelCommand: model.CancelCommand, context?: Context): Promise<Waiter<model.EmptyResponse, model.CommandStatusResponse>>;
    private _commandStatus;
    /**
     * Get command info.
     *
     * Gets the status of and, if available, the results from a currently
     * executing command.
     *
     * The command ID is obtained from a prior successful call to __execute__.
     */
    commandStatus(request: model.CommandStatusRequest, context?: Context): Promise<model.CommandStatusResponse>;
    private _contextStatus;
    /**
     * Get status.
     *
     * Gets the status for an execution context.
     */
    contextStatus(request: model.ContextStatusRequest, context?: Context): Promise<model.ContextStatusResponse>;
    private _create;
    /**
     * Create an execution context.
     *
     * Creates an execution context for running cluster commands.
     *
     * If successful, this method returns the ID of the new execution context.
     */
    create(createContext: model.CreateContext, context?: Context): Promise<Waiter<model.Created, model.ContextStatusResponse>>;
    private _destroy;
    /**
     * Delete an execution context.
     *
     * Deletes an execution context.
     */
    destroy(request: model.DestroyContext, context?: Context): Promise<model.EmptyResponse>;
    private _execute;
    /**
     * Run a command.
     *
     * Runs a cluster command in the given execution context, using the provided
     * language.
     *
     * If successful, it returns an ID for tracking the status of the command's
     * execution.
     */
    execute(command: model.Command, context?: Context): Promise<Waiter<model.Created, model.CommandStatusResponse>>;
}
//# sourceMappingURL=api.d.ts.map