/// <reference types="node" />
import * as child_process from "node:child_process";
import { ExecException } from "node:child_process";
export declare const execFile: typeof child_process.execFile.__promisify__;
export interface ExecFileException extends ExecException {
    stdout?: string;
    stderr?: string;
}
export declare class FileNotFoundException extends Error {
}
export declare function isExecFileException(e: any): e is ExecFileException;
export declare function isFileNotFound(e: any): e is ExecFileException;
export declare function execFileWithShell(cmd: string, args: Array<string>): Promise<{
    stdout: string;
    stderr: string;
}>;
//# sourceMappingURL=execUtils.d.ts.map