import { WorkspaceFsEntity } from ".";
export declare class WorkspaceFsFile extends WorkspaceFsEntity {
    get children(): Promise<never[]>;
    generateUrl(host: URL): Promise<string>;
}
export declare class WorkspaceFsNotebook extends WorkspaceFsFile {
    get language(): import("../../apis/workspace").Language | undefined;
}
//# sourceMappingURL=WorkspaceFsFile.d.ts.map