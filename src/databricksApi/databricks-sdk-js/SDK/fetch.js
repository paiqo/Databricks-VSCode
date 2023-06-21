"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = exports.Response = exports.AbortController = exports.AbortError = void 0;
/**
 * This file contains a subset of the `fetch` API that is compatible with
 * Node.js. It is not a complete implementation of the `fetch` API.
 *
 * We just implement enough to make the SDK work.
 */
const node_https_1 = __importDefault(require("node:https"));
const node_http_1 = __importDefault(require("node:http"));
const node_assert_1 = __importDefault(require("node:assert"));
class AbortError extends Error {
    constructor(message, type = "aborted") {
        super(message);
        this.name = "AbortError";
        this[_a] = "AbortError";
        this.type = type;
    }
}
exports.AbortError = AbortError;
_a = Symbol.toStringTag;
class AbortController {
    constructor() {
        this.aborted = false;
        this.listeners = [];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.signal = {
            get aborted() {
                return self.aborted;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            addEventListener: (type = "abort", listener) => {
                self.listeners.push(listener);
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            removeEventListener: (type = "abort", listener) => {
                self.listeners = self.listeners.filter((l) => l !== listener);
            },
        };
        this.abort = this.abort.bind(this);
    }
    abort() {
        this.aborted = true;
        this.listeners.forEach((listener) => listener.call(this.signal));
    }
}
exports.AbortController = AbortController;
class Response {
    constructor(nodeResponse, body) {
        this.body = body;
        this.headers = nodeResponse.headers;
        this.ok =
            nodeResponse.statusCode === undefined
                ? true
                : nodeResponse.statusCode < 400;
        this.status = nodeResponse.statusCode ?? 200;
        this.statusText = nodeResponse.statusMessage ?? "";
        this.url = nodeResponse.url ?? "";
    }
    async text() {
        return this.body;
    }
    async json() {
        const text = await this.text();
        return JSON.parse(text);
    }
}
exports.Response = Response;
function fetch(uri, init) {
    const signal = init?.signal;
    const method = init?.method ?? "GET";
    const headers = init?.headers ?? {};
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            return reject(new AbortError("The operation was aborted."));
        }
        const url = new URL(uri);
        if (init?.body) {
            (0, node_assert_1.default)(method === "POST" || method === "PUT");
            headers["Content-Length"] = Buffer.byteLength(init.body).toString();
        }
        const protocol = url.protocol === "https:" ? node_https_1.default : node_http_1.default;
        const req = protocol
            .request({
            method,
            headers: init?.headers ?? {},
            agent: init?.agent,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
        }, (res) => {
            res.setEncoding("utf8");
            // redirect
            if ((res.statusCode === 301 || res.statusCode === 302) &&
                res.headers.location) {
                return fetch(res.headers.location, init);
            }
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                if (signal) {
                    signal.removeEventListener("abort", abort);
                }
                if (signal?.aborted) {
                    return;
                }
                resolve(new Response(res, body));
            });
            res.on("error", (err) => {
                if (signal) {
                    signal.removeEventListener("abort", abort);
                }
                reject(err);
            });
        })
            .on("error", (err) => {
            reject(err);
        });
        if (signal) {
            signal.addEventListener("abort", abort);
        }
        function abort() {
            const err = new AbortError("The operation was aborted.");
            try {
                req.destroy();
            }
            catch (e) {
                // pass
            }
            reject(err);
        }
        new Promise((resolve, reject) => {
            if (init?.body) {
                req.write(init.body, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        })
            .then(() => {
            req.end();
        })
            .catch((err) => {
            reject(err);
        });
    });
}
exports.fetch = fetch;
//# sourceMappingURL=fetch.js.map