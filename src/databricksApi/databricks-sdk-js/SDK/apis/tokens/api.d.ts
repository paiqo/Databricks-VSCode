import { ApiClient } from "../../api-client";
import * as model from "./model";
import { ApiError, ApiRetriableError } from "../apiError";
import { Context } from "../../context";
export declare class TokensRetriableError extends ApiRetriableError {
    constructor(method: string, message?: string);
}
export declare class TokensError extends ApiError {
    constructor(method: string, message?: string);
}
/**
 * The Token API allows you to create, list, and revoke tokens that can be used
 * to authenticate and access Databricks REST APIs.
 */
export declare class TokensService {
    readonly client: ApiClient;
    constructor(client: ApiClient);
    private _create;
    /**
     * Create a user token.
     *
     * Creates and returns a token for a user. If this call is made through token
     * authentication, it creates a token with the same client ID as the
     * authenticated token. If the user's token quota is exceeded, this call
     * returns an error **QUOTA_EXCEEDED**.
     */
    create(request: model.CreateTokenRequest, context?: Context): Promise<model.CreateTokenResponse>;
    private _delete;
    /**
     * Revoke token.
     *
     * Revokes an access token.
     *
     * If a token with the specified ID is not valid, this call returns an error
     * **RESOURCE_DOES_NOT_EXIST**.
     */
    delete(request: model.RevokeTokenRequest, context?: Context): Promise<model.EmptyResponse>;
    private _list;
    /**
     * List tokens.
     *
     * Lists all the valid tokens for a user-workspace pair.
     */
    list(context?: Context): AsyncIterable<model.PublicTokenInfo>;
}
//# sourceMappingURL=api.d.ts.map