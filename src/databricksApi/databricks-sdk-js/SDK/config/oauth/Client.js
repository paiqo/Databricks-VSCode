"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const Token_1 = require("../Token");
const fetch_1 = require("../../fetch");
const BasicCredentials_1 = require("../BasicCredentials");
class Client {
    constructor(issuer, options) {
        this.issuer = issuer;
        this.options = options;
        options.useParams = options.useParams ?? false;
        options.useHeader = options.useHeader ?? false;
        options.headers = options.headers ?? {};
    }
    async grant(scope) {
        const params = {
            grant_type: "client_credentials",
            scope,
        };
        const requestOptions = {
            method: "POST",
            headers: this.options.headers,
        };
        if (this.options.useParams) {
            params["client_id"] = this.options.clientId;
            params["client_secret"] = this.options.clientSecret;
        }
        else if (this.options.useHeader) {
            requestOptions.headers = {
                ...requestOptions.headers,
                Authorization: (0, BasicCredentials_1.getBasicAuthHeader)(this.options.clientId, this.options.clientSecret),
            };
        }
        requestOptions.body = new URLSearchParams(params).toString();
        const response = await this.fetch(this.issuer.tokenEndpoint.toString(), requestOptions);
        if (!response.ok) {
            if (response.headers["content-type"]?.includes("application/json")) {
                const json = (await response.json());
                const code = json.errorCode ||
                    json.error_code ||
                    json.error ||
                    "Unknown";
                const summary = (json.errorSummary ||
                    json.error_description ||
                    "Unknown").replace(/\r?\n/g, " ");
                throw new Error(`Failed to retrieve token: ${code} ${summary}`);
            }
            else {
                throw new Error(`Failed to retrieve token: ${response.status} ${response.statusText}`);
            }
        }
        const tokenSet = (await response.json());
        if (!tokenSet ||
            typeof tokenSet.access_token !== "string" ||
            typeof tokenSet.expires_in !== "number") {
            throw new Error(`Failed to retrieve token: ${JSON.stringify(tokenSet)}`);
        }
        return new Token_1.Token({
            accessToken: tokenSet.access_token,
            expiry: Date.now() + tokenSet.expires_in * 1000,
        });
    }
    fetch(url, options) {
        return (0, fetch_1.fetch)(url, options);
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map