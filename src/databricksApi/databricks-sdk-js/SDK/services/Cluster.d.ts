import { ApiClient } from "../api-client";
import { RetriableError } from "../retries/retries";
import { RunLifeCycleState, RunOutput, SubmitRun } from "../apis/jobs";
import { CancellationToken } from "../types";
import { ExecutionContext } from "./ExecutionContext";
import { WorkflowRun } from "./WorkflowRun";
import { commands } from "..";
import { ClusterInfo, ClusterSource, DataSecurityMode, State } from "../apis/clusters";
import { Context } from "../context";
import { User } from "../apis/scim";
export declare class ClusterRetriableError extends RetriableError {
}
export declare class ClusterError extends Error {
}
export declare class Cluster {
    private client;
    private clusterDetails;
    private clusterApi;
    private _canExecute?;
    private _hasExecutePerms?;
    constructor(client: ApiClient, clusterDetails: ClusterInfo);
    get id(): string;
    get name(): string;
    get url(): Promise<string>;
    get driverLogsUrl(): Promise<string>;
    get metricsUrl(): Promise<string>;
    getSparkUiUrl(sparkContextId?: string): Promise<string>;
    get memoryMb(): number | undefined;
    get cores(): number | undefined;
    get sparkVersion(): string;
    get dbrVersion(): Array<number | "x">;
    get creator(): string;
    get state(): State;
    get stateMessage(): string;
    get source(): ClusterSource;
    get details(): ClusterInfo;
    set details(details: ClusterInfo);
    get accessMode(): DataSecurityMode | "SHARED" | "LEGACY_SINGLE_USER_PASSTHROUGH" | "LEGACY_SINGLE_USER_STANDARD";
    isUc(): boolean;
    isSingleUser(): boolean;
    isValidSingleUser(userName?: string): boolean;
    get hasExecutePermsCached(): boolean | undefined;
    hasExecutePerms(userDetails?: User): Promise<boolean>;
    refresh(): Promise<void>;
    start(token?: CancellationToken, onProgress?: (state: State) => void): Promise<void>;
    stop(token?: CancellationToken, onProgress?: (newPollResponse: ClusterInfo) => Promise<void>): Promise<void>;
    createExecutionContext(language?: commands.Language): Promise<ExecutionContext>;
    get canExecuteCached(): boolean | undefined;
    canExecute(ctx?: Context): Promise<boolean>;
    static fromClusterName(client: ApiClient, clusterName: string): Promise<Cluster | undefined>;
    static fromClusterId(client: ApiClient, clusterId: string): Promise<Cluster>;
    static list(client: ApiClient): AsyncIterable<Cluster>;
    submitRun(submitRunRequest: SubmitRun): Promise<WorkflowRun>;
    /**
     * Run a notebook as a workflow on a cluster and export result as HTML
     */
    runNotebookAndWait({ path, parameters, onProgress, token, }: {
        path: string;
        parameters?: Record<string, string>;
        onProgress?: (state: RunLifeCycleState, run: WorkflowRun) => void;
        token?: CancellationToken;
    }): Promise<import("../apis/jobs").ExportRunOutput>;
    /**
     * Run a python file as a workflow on a cluster
     */
    runPythonAndWait({ path, args, onProgress, token, }: {
        path: string;
        args?: string[];
        onProgress?: (state: RunLifeCycleState, run: WorkflowRun) => void;
        token?: CancellationToken;
    }): Promise<RunOutput>;
    private waitForWorkflowCompletion;
}
//# sourceMappingURL=Cluster.d.ts.map