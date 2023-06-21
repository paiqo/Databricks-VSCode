import { ApiClient } from "../api-client";
import { ExportRunOutput, Run, RunLifeCycleState, RunOutput, RunState, RunTask } from "../apis/jobs";
export declare class WorkflowRun {
    readonly client: ApiClient;
    private details;
    constructor(client: ApiClient, details: Run);
    static fromId(client: ApiClient, runId: number): Promise<WorkflowRun>;
    get lifeCycleState(): RunLifeCycleState;
    get state(): RunState | undefined;
    get tasks(): Array<RunTask> | undefined;
    get runPageUrl(): string;
    cancel(): Promise<void>;
    update(): Promise<void>;
    getOutput(task?: RunTask): Promise<RunOutput>;
    export(task?: RunTask): Promise<ExportRunOutput>;
}
//# sourceMappingURL=WorkflowRun.d.ts.map