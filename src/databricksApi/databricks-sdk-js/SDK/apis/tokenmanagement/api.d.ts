import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class TokenManagementRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class TokenManagementError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * Enables administrators to get all tokens and delete tokens for other users.
 * Admins can either get every token, get a specific token by ID, or get all
 * tokens for a particular user.
 */
export declare class TokenManagementService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _createOboToken;
    /**
     * Create on-behalf token.
     *
     * Creates a token on behalf of a service principal.
     */
    createOboToken(request: model.CreateOboTokenRequest, context?: Context): Promise<model.CreateOboTokenResponse>;
    private _delete;
    /**
     * Delete a token.
     *
     * Deletes a token, specified by its ID.
     */
    delete(request: model.Delete, context?: Context): Promise<model.EmptyResponse>;
    private _get;
    /**
     * Get token info.
     *
     * Gets information about a token, specified by its ID.
     */
    get(request: model.Get, context?: Context): Promise<model.TokenInfo>;
    private _list;
    /**
     * List all tokens.
     *
     * Lists all tokens associated with the specified workspace or user.
     */
    list(request: model.List, context?: Context): AsyncIterable<model.TokenInfo>;
}
//# sourceMappingURL=api.d.ts.map