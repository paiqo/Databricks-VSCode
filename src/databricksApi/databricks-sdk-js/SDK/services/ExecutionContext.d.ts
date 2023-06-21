import { CancellationToken, Time } from "..";
import { ApiClient } from "../api-client";
import { CommandExecutionService, Language } from "../apis/commands";
import { Cluster } from "./Cluster";
import { CommandWithResult, StatusUpdateListener } from "./Command";
export declare class ExecutionContext {
    readonly client: ApiClient;
    readonly cluster: Cluster;
    readonly language: Language;
    readonly executionContextApi: CommandExecutionService;
    id?: string;
    private constructor();
    static create(client: ApiClient, cluster: Cluster, language?: Language): Promise<ExecutionContext>;
    execute(command: string, onStatusUpdate?: StatusUpdateListener, token?: CancellationToken, timeout?: Time): Promise<CommandWithResult>;
    destroy(): Promise<void>;
}
//# sourceMappingURL=ExecutionContext.d.ts.map