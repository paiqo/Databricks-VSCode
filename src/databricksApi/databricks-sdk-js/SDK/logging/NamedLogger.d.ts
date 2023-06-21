import { Context } from "../context";
import { Logger } from "./types";
export declare enum LEVELS {
    error = "error",
    warn = "warn",
    info = "info",
    debug = "debug"
}
export interface LoggerOpts {
    fieldNameDenyList: string[];
    factory: (name: string) => Logger;
}
export declare const defaultOpts: LoggerOpts;
export declare class NamedLogger {
    readonly name: string;
    private constructor();
    private _context?;
    private _loggingFnName?;
    get opId(): string | undefined;
    get opName(): string | undefined;
    get loggingFnName(): string | undefined;
    private get _logger();
    private get _loggerOpts();
    static getOrCreate(name: string, opts?: Partial<LoggerOpts>, replace?: boolean): NamedLogger;
    log(level: string, message?: string, meta?: any): void;
    debug(message?: string, obj?: any): void;
    info(message?: string, obj?: any): void;
    warn(message?: string, obj?: any): void;
    error(message?: string, obj?: any): void;
    withContext({ context, loggingFnName, }: {
        context?: Context;
        loggingFnName?: string;
    }): this;
}
//# sourceMappingURL=NamedLogger.d.ts.map