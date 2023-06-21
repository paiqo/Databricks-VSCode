"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceConf = void 0;
const workspaceconf_1 = require("../apis/workspaceconf");
const context_1 = require("../context");
const logging_1 = require("../logging");
/**
 * Types interface to the workspace conf service.
 *
 * This class provides strong typing for a subset of the workspace conf
 * properties.
 *
 * In order to set arbitrary properties use the API wrapper directly.
 */
class WorkspaceConf {
    constructor(client) {
        this.client = client;
    }
    async getStatus(keys, ctx) {
        const wsConfApi = new workspaceconf_1.WorkspaceConfService(this.client);
        return await wsConfApi.getStatus({
            keys: keys.join(","),
        }, ctx);
    }
    async setStatus(request, ctx) {
        const wsConfApi = new workspaceconf_1.WorkspaceConfService(this.client);
        return await wsConfApi.setStatus(request, ctx);
    }
}
exports.WorkspaceConf = WorkspaceConf;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array,
        context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceConf.prototype, "getStatus", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(1, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, context_1.Context]),
    __metadata("design:returntype", Promise)
], WorkspaceConf.prototype, "setStatus", null);
//# sourceMappingURL=WorkspaceConf.js.map