import { Context } from "../../context";
import { WorkspaceFsEntity } from ".";
export declare class WorkspaceFsDir extends WorkspaceFsEntity {
    generateUrl(host: URL): Promise<string>;
    getAbsoluteChildPath(path: string): string | undefined;
    mkdir(path: string, ctx?: Context): Promise<WorkspaceFsDir | undefined>;
    createFile(path: string, content: string, overwrite?: boolean, ctx?: Context): Promise<import("./WorkspaceFsFile").WorkspaceFsFile | undefined>;
}
export declare class WorkspaceFsRepo extends WorkspaceFsDir {
}
//# sourceMappingURL=WorkspaceFsDir.d.ts.map