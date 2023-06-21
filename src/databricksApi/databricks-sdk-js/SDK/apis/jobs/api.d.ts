import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
import { Waiter } from "../../wait";
export declare class JobsRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class JobsError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Jobs API allows you to create, edit, and delete jobs.
 *
 * You can use a Databricks job to run a data processing or data analysis task in
 * a Databricks cluster with scalable resources. Your job can consist of a single
 * task or can be a large, multi-task workflow with complex dependencies.
 * Databricks manages the task orchestration, cluster management, monitoring, and
 * error reporting for all of your jobs. You can run your jobs immediately or
 * periodically through an easy-to-use scheduling system. You can implement job
 * tasks using notebooks, JARS, Delta Live Tables pipelines, or Python, Scala,
 * Spark submit, and Java applications.
 *
 * You should never hard code secrets or store them in plain text. Use the
 * :service:secrets to manage secrets in the [Databricks CLI]. Use the [Secrets
 * utility] to reference secrets in notebooks and jobs.
 *
 * [Databricks CLI]: https://docs.databricks.com/dev-tools/cli/index.html
 * [Secrets utility]: https://docs.databricks.com/dev-tools/databricks-utils.html#dbutils-secrets
 */
export declare class JobsService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _cancelAllRuns;
    /**
     * Cancel all runs of a job.
     *
     * Cancels all active runs of a job. The runs are canceled asynchronously, so
     * it doesn't prevent new runs from being started.
     */
    cancelAllRuns(request: model.CancelAllRuns, context?: Context): Promise<model.EmptyResponse>;
    private _cancelRun;
    /**
     * Cancel a job run.
     *
     * Cancels a job run. The run is canceled asynchronously, so it may still be
     * running when this request completes.
     */
    cancelRun(cancelRun: model.CancelRun, context?: Context): Promise<Waiter<model.EmptyResponse, model.Run>>;
    private _create;
    /**
     * Create a new job.
     *
     * Create a new job.
     */
    create(request: model.CreateJob, context?: Context): Promise<model.CreateResponse>;
    private _delete;
    /**
     * Delete a job.
     *
     * Deletes a job.
     */
    delete(request: model.DeleteJob, context?: Context): Promise<model.EmptyResponse>;
    private _deleteRun;
    /**
     * Delete a job run.
     *
     * Deletes a non-active run. Returns an error if the run is active.
     */
    deleteRun(request: model.DeleteRun, context?: Context): Promise<model.EmptyResponse>;
    private _exportRun;
    /**
     * Export and retrieve a job run.
     *
     * Export and retrieve the job run task.
     */
    exportRun(request: model.ExportRun, context?: Context): Promise<model.ExportRunOutput>;
    private _get;
    /**
     * Get a single job.
     *
     * Retrieves the details for a single job.
     */
    get(request: model.Get, context?: Context): Promise<model.Job>;
    private _getRun;
    /**
     * Get a single job run.
     *
     * Retrieve the metadata of a run.
     */
    getRun(getRun: model.GetRun, context?: Context): Promise<Waiter<model.Run, model.Run>>;
    private _getRunOutput;
    /**
     * Get the output for a single run.
     *
     * Retrieve the output and metadata of a single task run. When a notebook
     * task returns a value through the `dbutils.notebook.exit()` call, you can
     * use this endpoint to retrieve that value. Databricks restricts this API to
     * returning the first 5 MB of the output. To return a larger result, you can
     * store job results in a cloud storage service.
     *
     * This endpoint validates that the __run_id__ parameter is valid and returns
     * an HTTP status code 400 if the __run_id__ parameter is invalid. Runs are
     * automatically removed after 60 days. If you to want to reference them
     * beyond 60 days, you must save old run results before they expire.
     */
    getRunOutput(request: model.GetRunOutput, context?: Context): Promise<model.RunOutput>;
    private _list;
    /**
     * List all jobs.
     *
     * Retrieves a list of jobs.
     */
    list(request: model.List, context?: Context): AsyncIterable<model.BaseJob>;
    private _listRuns;
    /**
     * List runs for a job.
     *
     * List runs in descending order by start time.
     */
    listRuns(request: model.ListRuns, context?: Context): AsyncIterable<model.BaseRun>;
    private _repairRun;
    /**
     * Repair a job run.
     *
     * Re-run one or more tasks. Tasks are re-run as part of the original job
     * run. They use the current job and task settings, and can be viewed in the
     * history for the original job run.
     */
    repairRun(repairRun: model.RepairRun, context?: Context): Promise<Waiter<model.RepairRunResponse, model.Run>>;
    private _reset;
    /**
     * Overwrites all settings for a job.
     *
     * Overwrites all the settings for a specific job. Use the Update endpoint to
     * update job settings partially.
     */
    reset(request: model.ResetJob, context?: Context): Promise<model.EmptyResponse>;
    private _runNow;
    /**
     * Trigger a new job run.
     *
     * Run a job and return the `run_id` of the triggered run.
     */
    runNow(runNow: model.RunNow, context?: Context): Promise<Waiter<model.RunNowResponse, model.Run>>;
    private _submit;
    /**
     * Create and trigger a one-time run.
     *
     * Submit a one-time run. This endpoint allows you to submit a workload
     * directly without creating a job. Runs submitted using this endpoint
     * don’t display in the UI. Use the `jobs/runs/get` API to check the run
     * state after the job is submitted.
     */
    submit(submitRun: model.SubmitRun, context?: Context): Promise<Waiter<model.SubmitRunResponse, model.Run>>;
    private _update;
    /**
     * Partially updates a job.
     *
     * Add, update, or remove specific settings of an existing job. Use the
     * ResetJob to overwrite all job settings.
     */
    update(request: model.UpdateJob, context?: Context): Promise<model.EmptyResponse>;
}
//# sourceMappingURL=api.d.ts.map