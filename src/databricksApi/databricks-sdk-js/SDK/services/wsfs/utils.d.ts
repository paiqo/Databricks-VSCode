import { WorkspaceFsEntity } from "./WorkspaceFsEntity";
import { WorkspaceFsDir, WorkspaceFsRepo } from "./WorkspaceFsDir";
import { WorkspaceFsFile, WorkspaceFsNotebook } from "./WorkspaceFsFile";
export declare function isDirectory(entity?: WorkspaceFsEntity): entity is WorkspaceFsDir;
export declare function isRepo(entity?: WorkspaceFsEntity): entity is WorkspaceFsRepo;
export declare function isFile(entity?: WorkspaceFsEntity): entity is WorkspaceFsFile;
export declare function isNotebook(entity?: WorkspaceFsEntity): entity is WorkspaceFsNotebook;
//# sourceMappingURL=utils.d.ts.map