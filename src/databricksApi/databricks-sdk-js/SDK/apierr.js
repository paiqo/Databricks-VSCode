"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUnknownError = exports.parseErrorFromResponse = exports.ApiError = exports.HttpError = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const transientErrorStringMatches = [
    "com.databricks.backend.manager.util.UnknownWorkerEnvironmentException",
    "does not have any associated worker environments",
    "There is no worker environment with id",
    "Unknown worker environment",
    "ClusterNotReadyException",
    "connection reset by peer",
    "TLS handshake timeout",
    "connection refused",
    "Unexpected error",
    "i/o timeout",
];
class HttpError extends Error {
    constructor(message, code) {
        super(message);
        this.message = message;
        this.code = code;
    }
}
exports.HttpError = HttpError;
class ApiError extends Error {
    constructor(message, errorCode, statusCode, response) {
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.response = response;
    }
    isRetryable() {
        if (this.statusCode === 429) {
            // Repos API returns 429 when the user has too many repos. Don't retry in this case.
            if (this.message.includes("Please delete repos before creating new repos")) {
                return false;
            }
            return true;
        }
        if (this.statusCode >= 400) {
            if (this.isTransientError(this.message)) {
                return true;
            }
        }
        // some API's recommend retries on HTTP 500, but we'll add that later
        return false;
    }
    isTransientError(body) {
        return transientErrorStringMatches.some((s) => body.includes(s));
    }
}
exports.ApiError = ApiError;
function parseErrorFromResponse(statusCode, statusMessage, body) {
    // try to read in nicely formatted API error response
    let errorJson;
    try {
        errorJson = JSON.parse(body);
    }
    catch (e) { }
    let errorBody;
    if (!errorJson || !errorJson.message || !errorJson.error_code) {
        errorBody = parseUnknownError(statusMessage, body);
    }
    else {
        errorBody = errorJson;
    }
    // API 1.2 has different response format, let's adapt
    if (errorBody.error) {
        errorBody.message = errorBody.error || "";
    }
    // Handle SCIM error message details
    if (!errorBody.message && errorBody.detail) {
        if (errorBody.detail === "null") {
            errorBody.message = "SCIM API Internal Error";
        }
        else {
            errorBody.message = errorBody.detail || "";
        }
        // add more context from SCIM responses
        errorBody.message = `${errorBody.scimType} ${errorBody.message}`;
        errorBody.message = errorBody.message.trim();
        errorBody.error_code = `SCIM_${errorBody.status}`;
    }
    return new ApiError(errorBody.message, errorBody.error_code, statusCode, errorJson || body);
}
exports.parseErrorFromResponse = parseErrorFromResponse;
function parseUnknownError(statusMessage, body) {
    // this is most likely HTML... since parsing JSON failed
    // Status parts first in case html message is not as expected
    const errorCode = statusMessage || "UNKNOWN";
    let message;
    const m = body.match(/<pre>(.*)<\/pre>/);
    if (m) {
        message = m[1].trim().replace(/([\s.])*$/, "");
    }
    else {
        // When the AAD tenant is not configured correctly, the response is a HTML page with a title like this:
        // "Error 400 io.jsonwebtoken.IncorrectClaimException: Expected iss claim to be: https://sts.windows.net/aaaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa/, but was: https://sts.windows.net/bbbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb/."
        const m = body.match(/<title>(Error \d+.*?)<\/title>/);
        if (m) {
            message = m[1].trim().replace(/([\s.])*$/, "");
        }
        else {
            message = `Response from server (${statusMessage}) ${body}`;
        }
    }
    return {
        error_code: errorCode,
        message: message,
    };
}
exports.parseUnknownError = parseUnknownError;
//# sourceMappingURL=apierr.js.map