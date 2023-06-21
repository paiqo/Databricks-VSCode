import { ApiClient } from "../api-client";
import { List, RepoInfo, CreateRepo } from "../apis/repos";
import { Context } from "../context";
export interface RepoList {
    repos: Repo[];
    next_page_token: any;
}
export declare class RepoError extends Error {
}
export declare class Repo {
    private readonly client;
    private details;
    private readonly reposApi;
    constructor(client: ApiClient, details: RepoInfo);
    refresh(): Promise<RepoInfo>;
    get id(): number;
    get path(): string;
    get url(): Promise<string>;
    static create(client: ApiClient, req: CreateRepo, context?: Context): Promise<Repo>;
    static list(client: ApiClient, req: List, context?: Context): AsyncIterable<Repo>;
    static fromPath(client: ApiClient, path: string, context?: Context): Promise<Repo>;
}
//# sourceMappingURL=Repos.d.ts.map