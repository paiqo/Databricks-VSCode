"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceFsNotebook = exports.WorkspaceFsFile = void 0;
const _1 = require(".");
class WorkspaceFsFile extends _1.WorkspaceFsEntity {
    get children() {
        return Promise.resolve([]);
    }
    async generateUrl(host) {
        return `${host.host}#folder/${(await this.parent)?.id ?? ""}`;
    }
}
exports.WorkspaceFsFile = WorkspaceFsFile;
class WorkspaceFsNotebook extends WorkspaceFsFile {
    get language() {
        return this.details.language;
    }
}
exports.WorkspaceFsNotebook = WorkspaceFsNotebook;
//# sourceMappingURL=WorkspaceFsFile.js.map