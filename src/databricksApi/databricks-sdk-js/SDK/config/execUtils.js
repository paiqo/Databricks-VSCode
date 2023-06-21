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
exports.execFileWithShell = exports.isFileNotFound = exports.isExecFileException = exports.FileNotFoundException = exports.execFile = void 0;
const child_process = __importStar(require("node:child_process"));
const node_util_1 = require("node:util");
exports.execFile = (0, node_util_1.promisify)(child_process.execFile);
class FileNotFoundException extends Error {
}
exports.FileNotFoundException = FileNotFoundException;
function isExecFileException(e) {
    return (e.code !== undefined ||
        e.stderr !== undefined ||
        e.stdout !== undefined ||
        e.signal !== undefined);
}
exports.isExecFileException = isExecFileException;
function isFileNotFound(e) {
    // when using plain execFile
    if (e.code === "ENOENT") {
        return true;
    }
    if (!isExecFileException(e)) {
        return false;
    }
    // when using execFile with shell on Linux
    if (e.code === 127 &&
        e.stderr &&
        e.stderr.indexOf("command not found") >= 0) {
        return true;
    }
    // when using execFile with shell on Windows
    if (e.code === 1 &&
        e.stderr &&
        e.stderr.indexOf("is not recognized as an internal or external command") >= 0) {
        return true;
    }
    return false;
}
exports.isFileNotFound = isFileNotFound;
async function execFileWithShell(cmd, args) {
    try {
        return await (0, exports.execFile)(cmd, args, { shell: true });
    }
    catch (e) {
        if (isFileNotFound(e)) {
            throw new FileNotFoundException(e.message);
        }
        else {
            throw e;
        }
    }
}
exports.execFileWithShell = execFileWithShell;
//# sourceMappingURL=execUtils.js.map