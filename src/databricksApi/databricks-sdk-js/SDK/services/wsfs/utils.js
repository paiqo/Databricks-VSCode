"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotebook = exports.isFile = exports.isRepo = exports.isDirectory = void 0;
function isDirectory(entity) {
    if (entity?.type === "DIRECTORY" || entity?.type === "REPO") {
        return true;
    }
    return false;
}
exports.isDirectory = isDirectory;
function isRepo(entity) {
    if (entity?.type === "REPO") {
        return true;
    }
    return false;
}
exports.isRepo = isRepo;
function isFile(entity) {
    if (entity?.type === "FILE" || entity?.type === "NOTEBOOK") {
        return true;
    }
    return false;
}
exports.isFile = isFile;
function isNotebook(entity) {
    if (entity?.type === "NOTEBOOK") {
        return true;
    }
    return false;
}
exports.isNotebook = isNotebook;
//# sourceMappingURL=utils.js.map