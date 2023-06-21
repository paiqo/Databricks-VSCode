/// <reference types="node" />
import { EventEmitter } from "events";
import { ExecutionContext } from "./ExecutionContext";
import { CancellationToken } from "../types";
import { CommandExecutionService, CommandStatusResponse } from "../apis/commands";
import Time from "../retries/Time";
export interface CommandWithResult {
    cmd: Command;
    result: CommandStatusResponse;
}
export type StatusUpdateListener = (result: CommandStatusResponse) => void;
export declare class Command extends EventEmitter {
    readonly context: ExecutionContext;
    readonly commandsApi: CommandExecutionService;
    result?: CommandStatusResponse;
    id?: string;
    private static statusUpdateEvent;
    private constructor();
    private get commandErrorParams();
    refresh(): Promise<void>;
    cancel(): Promise<void>;
    response(cancellationToken?: CancellationToken, timeout?: Time): Promise<CommandStatusResponse>;
    static execute(context: ExecutionContext, command: string, onStatusUpdate?: StatusUpdateListener, cancellationToken?: CancellationToken, timeout?: Time): Promise<CommandWithResult>;
}
//# sourceMappingURL=Command.d.ts.map