/// <reference types="node" />
import { Writable } from "stream";
import { Logger } from "./types";
export declare class DefaultLogger implements Logger {
    private _stream;
    constructor(outputStream?: Writable);
    log(level: string, message?: string, obj?: any): void;
}
//# sourceMappingURL=DefaultLogger.d.ts.map