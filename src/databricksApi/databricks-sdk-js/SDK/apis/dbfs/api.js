"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbfsService = exports.DbfsError = exports.DbfsRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class DbfsRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Dbfs", method, message);
    }
}
exports.DbfsRetriableError = DbfsRetriableError;
class DbfsError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Dbfs", method, message);
    }
}
exports.DbfsError = DbfsError;
/**
 * DBFS API makes it simple to interact with various data sources without having
 * to include a users credentials every time to read a file.
 */
class DbfsService {
    constructor(client) {
        this.client = client;
    }
    async _addBlock(request, context) {
        const path = "/api/2.0/dbfs/add-block";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Append data block.
     *
     * Appends a block of data to the stream specified by the input handle. If
     * the handle does not exist, this call will throw an exception with
     * `RESOURCE_DOES_NOT_EXIST`.
     *
     * If the block of data exceeds 1 MB, this call will throw an exception with
     * `MAX_BLOCK_SIZE_EXCEEDED`.
     */
    async addBlock(request, context) {
        return await this._addBlock(request, context);
    }
    async _close(request, context) {
        const path = "/api/2.0/dbfs/close";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Close the stream.
     *
     * Closes the stream specified by the input handle. If the handle does not
     * exist, this call throws an exception with `RESOURCE_DOES_NOT_EXIST`.
     */
    async close(request, context) {
        return await this._close(request, context);
    }
    async _create(request, context) {
        const path = "/api/2.0/dbfs/create";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Open a stream.
     *
     * "Opens a stream to write to a file and returns a handle to this stream.
     * There is a 10 minute idle timeout on this handle. If a file or directory
     * already exists on the given path and __overwrite__ is set to `false`, this
     * call throws an exception with `RESOURCE_ALREADY_EXISTS`.
     *
     * A typical workflow for file upload would be:
     *
     * 1. Issue a `create` call and get a handle. 2. Issue one or more
     * `add-block` calls with the handle you have. 3. Issue a `close` call with
     * the handle you have.
     */
    async create(request, context) {
        return await this._create(request, context);
    }
    async _delete(request, context) {
        const path = "/api/2.0/dbfs/delete";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Delete a file/directory.
     *
     * Delete the file or directory (optionally recursively delete all files in
     * the directory). This call throws an exception with `IO_ERROR` if the path
     * is a non-empty directory and `recursive` is set to `false` or on other
     * similar errors.
     *
     * When you delete a large number of files, the delete operation is done in
     * increments. The call returns a response after approximately 45 seconds
     * with an error message (503 Service Unavailable) asking you to re-invoke
     * the delete operation until the directory structure is fully deleted.
     *
     * For operations that delete more than 10K files, we discourage using the
     * DBFS REST API, but advise you to perform such operations in the context of
     * a cluster, using the [File system utility
     * (dbutils.fs)](/dev-tools/databricks-utils.html#dbutils-fs). `dbutils.fs`
     * covers the functional scope of the DBFS REST API, but from notebooks.
     * Running such operations using notebooks provides better control and
     * manageability, such as selective deletes, and the possibility to automate
     * periodic delete jobs.
     */
    async delete(request, context) {
        return await this._delete(request, context);
    }
    async _getStatus(request, context) {
        const path = "/api/2.0/dbfs/get-status";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get the information of a file or directory.
     *
     * Gets the file information for a file or directory. If the file or
     * directory does not exist, this call throws an exception with
     * `RESOURCE_DOES_NOT_EXIST`.
     */
    async getStatus(request, context) {
        return await this._getStatus(request, context);
    }
    async _list(request, context) {
        const path = "/api/2.0/dbfs/list";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * List directory contents or file details.
     *
     * List the contents of a directory, or details of the file. If the file or
     * directory does not exist, this call throws an exception with
     * `RESOURCE_DOES_NOT_EXIST`.
     *
     * When calling list on a large directory, the list operation will time out
     * after approximately 60 seconds. We strongly recommend using list only on
     * directories containing less than 10K files and discourage using the DBFS
     * REST API for operations that list more than 10K files. Instead, we
     * recommend that you perform such operations in the context of a cluster,
     * using the [File system utility
     * (dbutils.fs)](/dev-tools/databricks-utils.html#dbutils-fs), which provides
     * the same functionality without timing out.
     */
    async *list(request, context) {
        const response = (await this._list(request, context)).files;
        for (const v of response || []) {
            yield v;
        }
    }
    async _mkdirs(request, context) {
        const path = "/api/2.0/dbfs/mkdirs";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Create a directory.
     *
     * Creates the given directory and necessary parent directories if they do
     * not exist. If a file (not a directory) exists at any prefix of the input
     * path, this call throws an exception with `RESOURCE_ALREADY_EXISTS`.
     * **Note**: If this operation fails, it might have succeeded in creating
     * some of the necessary parent directories.
     */
    async mkdirs(request, context) {
        return await this._mkdirs(request, context);
    }
    async _move(request, context) {
        const path = "/api/2.0/dbfs/move";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Move a file.
     *
     * Moves a file from one location to another location within DBFS. If the
     * source file does not exist, this call throws an exception with
     * `RESOURCE_DOES_NOT_EXIST`. If a file already exists in the destination
     * path, this call throws an exception with `RESOURCE_ALREADY_EXISTS`. If the
     * given source path is a directory, this call always recursively moves all
     * files.",
     */
    async move(request, context) {
        return await this._move(request, context);
    }
    async _put(request, context) {
        const path = "/api/2.0/dbfs/put";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Upload a file.
     *
     * Uploads a file through the use of multipart form post. It is mainly used
     * for streaming uploads, but can also be used as a convenient single call
     * for data upload.
     *
     * Alternatively you can pass contents as base64 string.
     *
     * The amount of data that can be passed (when not streaming) using the
     * __contents__ parameter is limited to 1 MB. `MAX_BLOCK_SIZE_EXCEEDED` will
     * be thrown if this limit is exceeded.
     *
     * If you want to upload large files, use the streaming upload. For details,
     * see :method:dbfs/create, :method:dbfs/addBlock, :method:dbfs/close.
     */
    async put(request, context) {
        return await this._put(request, context);
    }
    async _read(request, context) {
        const path = "/api/2.0/dbfs/read";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get the contents of a file.
     *
     * "Returns the contents of a file. If the file does not exist, this call
     * throws an exception with `RESOURCE_DOES_NOT_EXIST`. If the path is a
     * directory, the read length is negative, or if the offset is negative, this
     * call throws an exception with `INVALID_PARAMETER_VALUE`. If the read
     * length exceeds 1 MB, this call throws an exception with
     * `MAX_READ_SIZE_EXCEEDED`.
     *
     * If `offset + length` exceeds the number of bytes in a file, it reads the
     * contents until the end of file.",
     */
    async read(request, context) {
        return await this._read(request, context);
    }
}
exports.DbfsService = DbfsService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_addBlock", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "addBlock", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_close", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "close", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "delete", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_getStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "getStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Object)
], DbfsService.prototype, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_mkdirs", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "mkdirs", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_move", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "move", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_put", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "put", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "_read", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], DbfsService.prototype, "read", null);
//# sourceMappingURL=api.js.map