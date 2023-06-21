import { ObjectInfo, WorkspaceService } from "../../apis/workspace";
import { Context } from "../../context";
import { WorkspaceFsDir, WorkspaceFsFile } from ".";
import { WorkspaceClient } from "../../WorkspaceClient";
export declare class ObjectInfoValidationError extends Error {
    readonly details: ObjectInfo;
    constructor(message: string, details: ObjectInfo);
}
export declare abstract class WorkspaceFsEntity {
    protected readonly wsClient: WorkspaceClient;
    protected _workspaceFsService: WorkspaceService;
    private _children?;
    private _details;
    constructor(wsClient: WorkspaceClient, details: ObjectInfo);
    private validateDetails;
    set details(details: ObjectInfo);
    get details(): ObjectInfo;
    get path(): string;
    protected abstract generateUrl(host: URL): Promise<string>;
    get url(): Promise<string>;
    get type(): "NOTEBOOK" | "DIRECTORY" | "FILE" | "LIBRARY" | "REPO";
    get id(): never;
    protected fetchChildren(): Promise<void>;
    refresh(ctx?: Context): Promise<this | undefined>;
    get children(): Promise<WorkspaceFsEntity[]>;
    static fromPath(wsClient: WorkspaceClient, path: string, ctx?: Context): Promise<WorkspaceFsDir | WorkspaceFsFile | undefined>;
    get parent(): Promise<WorkspaceFsEntity | undefined>;
    get basename(): string;
}
//# sourceMappingURL=WorkspaceFsEntity.d.ts.map