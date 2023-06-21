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
exports.LibrariesService = exports.LibrariesError = exports.LibrariesRetriableError = void 0;
const model = __importStar(require("./model"));
const apiError_1 = require("../apiError");
const context_1 = require("../../context");
const logging_1 = require("../../logging");
class LibrariesRetriableError extends apiError_1.ApiRetriableError {
    constructor(method, message) {
        super("Libraries", method, message);
    }
}
exports.LibrariesRetriableError = LibrariesRetriableError;
class LibrariesError extends apiError_1.ApiError {
    constructor(method, message) {
        super("Libraries", method, message);
    }
}
exports.LibrariesError = LibrariesError;
/**
 * The Libraries API allows you to install and uninstall libraries and get the
 * status of libraries on a cluster.
 *
 * To make third-party or custom code available to notebooks and jobs running on
 * your clusters, you can install a library. Libraries can be written in Python,
 * Java, Scala, and R. You can upload Java, Scala, and Python libraries and point
 * to external packages in PyPI, Maven, and CRAN repositories.
 *
 * Cluster libraries can be used by all notebooks running on a cluster. You can
 * install a cluster library directly from a public repository such as PyPI or
 * Maven, using a previously installed workspace library, or using an init
 * script.
 *
 * When you install a library on a cluster, a notebook already attached to that
 * cluster will not immediately see the new library. You must first detach and
 * then reattach the notebook to the cluster.
 *
 * When you uninstall a library from a cluster, the library is removed only when
 * you restart the cluster. Until you restart the cluster, the status of the
 * uninstalled library appears as Uninstall pending restart.
 */
class LibrariesService {
    constructor(client) {
        this.client = client;
    }
    async _allClusterStatuses(context) {
        const path = "/api/2.0/libraries/all-cluster-statuses";
        return (await this.client.request(path, "GET", undefined, context));
    }
    /**
     * Get all statuses.
     *
     * Get the status of all libraries on all clusters. A status will be
     * available for all libraries installed on this cluster via the API or the
     * libraries UI as well as libraries set to be installed on all clusters via
     * the libraries UI.
     */
    async allClusterStatuses(context) {
        return await this._allClusterStatuses(context);
    }
    async _clusterStatus(request, context) {
        const path = "/api/2.0/libraries/cluster-status";
        return (await this.client.request(path, "GET", request, context));
    }
    /**
     * Get status.
     *
     * Get the status of libraries on a cluster. A status will be available for
     * all libraries installed on this cluster via the API or the libraries UI as
     * well as libraries set to be installed on all clusters via the libraries
     * UI. The order of returned libraries will be as follows.
     *
     * 1. Libraries set to be installed on this cluster will be returned first.
     * Within this group, the final order will be order in which the libraries
     * were added to the cluster.
     *
     * 2. Libraries set to be installed on all clusters are returned next. Within
     * this group there is no order guarantee.
     *
     * 3. Libraries that were previously requested on this cluster or on all
     * clusters, but now marked for removal. Within this group there is no order
     * guarantee.
     */
    async clusterStatus(request, context) {
        return await this._clusterStatus(request, context);
    }
    async _install(request, context) {
        const path = "/api/2.0/libraries/install";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Add a library.
     *
     * Add libraries to be installed on a cluster. The installation is
     * asynchronous; it happens in the background after the completion of this
     * request.
     *
     * **Note**: The actual set of libraries to be installed on a cluster is the
     * union of the libraries specified via this method and the libraries set to
     * be installed on all clusters via the libraries UI.
     */
    async install(request, context) {
        return await this._install(request, context);
    }
    async _uninstall(request, context) {
        const path = "/api/2.0/libraries/uninstall";
        return (await this.client.request(path, "POST", request, context));
    }
    /**
     * Uninstall libraries.
     *
     * Set libraries to be uninstalled on a cluster. The libraries won't be
     * uninstalled until the cluster is restarted. Uninstalling libraries that
     * are not installed on the cluster will have no impact but is not an error.
     */
    async uninstall(request, context) {
        return await this._uninstall(request, context);
    }
}
exports.LibrariesService = LibrariesService;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "_allClusterStatuses", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(0, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "allClusterStatuses", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "_clusterStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "clusterStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "_install", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "install", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "_uninstall", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], LibrariesService.prototype, "uninstall", null);
//# sourceMappingURL=api.js.map