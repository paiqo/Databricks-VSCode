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
exports.ApiClient = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const https = __importStar(require("node:https"));
const logging_1 = require("./logging");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const context_1 = require("./context");
const context_2 = require("./context");
const retries_1 = __importStar(require("./retries/retries"));
const Time_1 = __importStar(require("./retries/Time"));
const apierr_1 = require("./apierr");
const fetch_1 = require("./fetch");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sdkVersion = "0.3.15";
function logAndReturnError(url, request, response, error, context) {
    context?.logger?.error(url.toString(), {
        request,
        response,
        error: logging_1.Utils.liftAllErrorProps(error),
    });
    return error;
}
class ApiClient {
    constructor(config, options = {}) {
        this.config = config;
        this.agent =
            options.agent ||
                new https.Agent({
                    keepAlive: true,
                    keepAliveMsecs: 15000,
                    rejectUnauthorized: config.insecureSkipVerify === false,
                    timeout: (config.httpTimeoutSeconds || 5) * 1000,
                });
        this.product = options.product || "unknown";
        this.productVersion = options.productVersion || "0.0.0";
        this.userAgentExtra = options.userAgentExtra || {};
    }
    get host() {
        return this.config.getHost();
    }
    get accountId() {
        return this.config.ensureResolved().then(() => {
            return this.config.accountId;
        });
    }
    userAgent() {
        const pairs = [
            `${this.product}/${this.productVersion}`,
            `databricks-sdk-js/${sdkVersion}`,
            `nodejs/${process.version.slice(1)}`,
            `os/${process.platform}`,
            `auth/${this.config.authType}`,
        ];
        for (const [key, value] of Object.entries(this.userAgentExtra)) {
            pairs.push(`${key}/${value}`);
        }
        return pairs.join(" ");
    }
    async request(path, method, payload, context) {
        const headers = {
            "User-Agent": this.userAgent(),
            "Content-Type": "text/json",
        };
        await this.config.authenticate(headers);
        // create a copy of the URL, so that we can modify it
        const url = new URL(this.config.host);
        url.pathname = path;
        const options = {
            method,
            headers,
            agent: this.agent,
        };
        if (payload) {
            if (method === "POST") {
                options.body = JSON.stringify(payload);
            }
            else {
                url.search = new URLSearchParams(payload).toString();
            }
        }
        const responseText = await (0, retries_1.default)({
            timeout: new Time_1.default(this.config.retryTimeoutSeconds || 300, Time_1.TimeUnits.seconds),
            fn: async () => {
                let response;
                let body;
                try {
                    const controller = new fetch_1.AbortController();
                    const signal = controller.signal;
                    const abort = controller.abort;
                    if (context?.cancellationToken?.onCancellationRequested) {
                        context?.cancellationToken?.onCancellationRequested(abort);
                    }
                    if (context?.cancellationToken?.isCancellationRequested) {
                        abort();
                    }
                    response = await (0, fetch_1.fetch)(url.toString(), {
                        signal,
                        ...options,
                    });
                    body = await response.text();
                }
                catch (e) {
                    const err = e.code && e.code === "ENOTFOUND"
                        ? new apierr_1.HttpError(`Can't connect to ${url.toString()}`, 500)
                        : e;
                    throw logAndReturnError(url, options, "", err, context);
                }
                if (!response.ok) {
                    const err = (0, apierr_1.parseErrorFromResponse)(response.status, response.statusText, body);
                    if (err.isRetryable()) {
                        throw new retries_1.RetriableError();
                    }
                    else {
                        throw logAndReturnError(url, options, response, err, context);
                    }
                }
                return body;
            },
        });
        let responseJson;
        try {
            responseJson =
                responseText.length === 0 ? {} : JSON.parse(responseText);
        }
        catch (e) {
            logAndReturnError(url, options, responseText, e, context);
            throw new Error(`Can't parse reponse as JSON: ${responseText}`);
        }
        context?.logger?.debug(url.toString(), {
            request: options,
            response: responseJson,
        });
        return responseJson;
    }
}
exports.ApiClient = ApiClient;
__decorate([
    (0, logging_1.withLogContext)(logging_1.ExposedLoggers.SDK),
    __param(3, context_1.context),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, context_2.Context]),
    __metadata("design:returntype", Promise)
], ApiClient.prototype, "request", null);
//# sourceMappingURL=api-client.js.map