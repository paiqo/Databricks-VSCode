"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const events_1 = require("events");
const retries_1 = __importStar(require("../retries/retries"));
const commands_1 = require("../apis/commands");
function getCommandErrorMessage(errorParams) {
    return `Command [${errorParams.commandId}] Context [${errorParams.contextId}] Cluster [${errorParams.clusterId}]: ${errorParams.message}`;
}
class CommandRetriableError extends retries_1.RetriableError {
    constructor(errorParams) {
        super(getCommandErrorMessage(errorParams));
    }
}
class CommandError extends Error {
    constructor(errorParams) {
        super(getCommandErrorMessage(errorParams));
    }
}
class Command extends events_1.EventEmitter {
    constructor(context) {
        super();
        this.context = context;
        this.commandsApi = new commands_1.CommandExecutionService(context.client);
    }
    get commandErrorParams() {
        return {
            commandId: this.id,
            clusterId: this.context.cluster.id,
            contextId: this.context.id,
        };
    }
    async refresh() {
        this.result = await this.commandsApi.commandStatus({
            clusterId: this.context.cluster.id,
            contextId: this.context.id,
            commandId: this.id,
        });
    }
    async cancel() {
        await this.commandsApi.cancel({
            commandId: this.id,
            contextId: this.context.id,
            clusterId: this.context.cluster.id,
        });
        await (0, retries_1.default)({
            fn: async () => {
                await this.refresh();
                // The API surfaces an exception when a command is cancelled
                // The cancellation itself proceeds as expected, but the status
                // is FINISHED instead of CANCELLED.
                if (this.result.results?.resultType === "error" &&
                    !this.result.results.cause.includes("CommandCancelledException")) {
                    throw new CommandError({
                        ...this.commandErrorParams,
                        message: this.result.results.cause,
                    });
                }
                if (["Cancelled", "Finished"].includes(this.result.status)) {
                    return;
                }
                if (this.result.status === "Error") {
                    throw new CommandError({
                        ...this.commandErrorParams,
                        message: "Error while cancelling the command",
                    });
                }
                throw new CommandRetriableError({
                    ...this.commandErrorParams,
                    message: `Current state of command is ${this.result.status}`,
                });
            },
        });
    }
    async response(cancellationToken, timeout = retries_1.DEFAULT_MAX_TIMEOUT) {
        await (0, retries_1.default)({
            timeout: timeout,
            fn: async () => {
                await this.refresh();
                this.emit(Command.statusUpdateEvent, this.result);
                if (!["Cancelled", "Error", "Finished"].includes(this.result.status)) {
                    if (cancellationToken?.isCancellationRequested) {
                        await this.cancel();
                        return;
                    }
                    throw new CommandRetriableError({
                        ...this.commandErrorParams,
                        message: `Current state of command is ${this.result.status}`,
                    });
                }
            },
        });
        return this.result;
    }
    static async execute(context, command, onStatusUpdate = () => { }, cancellationToken, timeout = retries_1.DEFAULT_MAX_TIMEOUT) {
        const cmd = new Command(context);
        cmd.on(Command.statusUpdateEvent, onStatusUpdate);
        const executeApiResponse = await cmd.commandsApi.execute({
            clusterId: cmd.context.cluster.id,
            contextId: cmd.context.id,
            language: cmd.context.language,
            command,
        });
        cmd.id = executeApiResponse.id;
        const executionResult = await cmd.response(cancellationToken, timeout);
        return { cmd: cmd, result: executionResult };
    }
}
exports.Command = Command;
Command.statusUpdateEvent = "statusUpdate";
//# sourceMappingURL=Command.js.map