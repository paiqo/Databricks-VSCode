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
exports.Repo = exports.RepoError = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const api_client_1 = require("../api-client");
const repos_1 = require("../apis/repos");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const context_1 = require("../context");
const context_2 = require("../context");
const logging_1 = require("../logging");
class RepoError extends Error {
}
exports.RepoError = RepoError;
class Repo {
    constructor(client, details) {
        this.client = client;
        this.details = details;
        this.reposApi = new repos_1.ReposService(this.client);
    }
    async refresh() {
        this.details = await this.reposApi.get({ repo_id: this.id });
        return this.details;
    }
    get id() {
        return this.details.id;
    }
    get path() {
        return this.details.path;
    }
    get url() {
        return (async () => `${(await this.client.host).host}#folder/${this.id}`)();
    }
    static async create(client, req, context) {
        const repoService = new repos_1.ReposService(client);
        return new Repo(client, await repoService.create(req, context));
    }
    static async *list(client, req, context) {
        const reposApi = new repos_1.ReposService(client);
        for await (const repo of reposApi.list(req, context)) {
            yield new Repo(client, repo);
        }
    }
    static async fromPath(client, path, context) {
        const repos = [];
        let exactRepo;
        for await (const repo of this.list(client, {
            path_prefix: path,
        }, context)) {
            if (repo.path === path) {
                exactRepo = repo;
            }
            repos.push(repo);
        }
        if (repos.length !== 1 && !exactRepo) {
            throw new RepoError(`${repos.length} repos match prefix ${path}`);
        }
        return exactRepo ?? repos[0];
    }
}
exports.Repo = Repo;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(2, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_client_1.ApiClient, Object, context_2.Context]),
    __metadata("design:returntype", Promise)
], Repo, "create", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(2, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_client_1.ApiClient, Object, context_2.Context]),
    __metadata("design:returntype", Object)
], Repo, "list", null);
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(2, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_client_1.ApiClient, String, context_2.Context]),
    __metadata("design:returntype", Promise)
], Repo, "fromPath", null);
//# sourceMappingURL=Repos.js.map