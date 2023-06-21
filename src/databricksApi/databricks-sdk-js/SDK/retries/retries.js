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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MAX_TIMEOUT = exports.DEFAULT_RETRY_CONFIG = exports.ExponetionalBackoffWithJitterRetryPolicy = exports.LinearRetryPolicy = exports.TimeoutError = exports.RetriableError = void 0;
const Time_1 = __importStar(require("./Time"));
class RetriableError extends Error {
    constructor() {
        super(...arguments);
        this.name = "RetriableError";
    }
}
exports.RetriableError = RetriableError;
class TimeoutError extends Error {
    constructor(message) {
        super(`Timeout: ${message}`);
    }
}
exports.TimeoutError = TimeoutError;
class LinearRetryPolicy {
    constructor(_waitTime) {
        this._waitTime = _waitTime;
    }
    waitTime() {
        return this._waitTime;
    }
}
exports.LinearRetryPolicy = LinearRetryPolicy;
class ExponetionalBackoffWithJitterRetryPolicy {
    constructor(options = {}) {
        this.maxJitter =
            options.maxJitter || new Time_1.default(750, Time_1.TimeUnits.milliseconds);
        this.minJitter =
            options.minJitter || new Time_1.default(50, Time_1.TimeUnits.milliseconds);
        this.maxWaitTime =
            options.maxWaitTime || new Time_1.default(10, Time_1.TimeUnits.seconds);
    }
    waitTime(attempt) {
        const jitter = this.maxJitter
            .sub(this.minJitter)
            .multiply(Math.random())
            .add(this.minJitter);
        const timeout = new Time_1.default(attempt, Time_1.TimeUnits.seconds).add(jitter);
        return timeout.gt(this.maxWaitTime) ? this.maxWaitTime : timeout;
    }
}
exports.ExponetionalBackoffWithJitterRetryPolicy = ExponetionalBackoffWithJitterRetryPolicy;
exports.DEFAULT_RETRY_CONFIG = new ExponetionalBackoffWithJitterRetryPolicy();
exports.DEFAULT_MAX_TIMEOUT = new Time_1.default(10, Time_1.TimeUnits.minutes);
async function retry({ timeout = exports.DEFAULT_MAX_TIMEOUT, retryPolicy: retryConfig = exports.DEFAULT_RETRY_CONFIG, fn, }) {
    let attempt = 1;
    let retriableErr = new RetriableError("timeout");
    let nonRetriableErr = undefined;
    let result = undefined;
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
    }, timeout.toMillSeconds().value);
    let success = false;
    while (!timedOut) {
        try {
            result = await fn();
            success = true;
            break;
        }
        catch (err) {
            if (err instanceof RetriableError) {
                retriableErr = err;
            }
            else {
                nonRetriableErr = err;
                break;
            }
        }
        await new Promise((resolve) => setTimeout(resolve, retryConfig.waitTime(attempt).toMillSeconds().value));
        attempt += 1;
    }
    clearTimeout(timer);
    if (nonRetriableErr) {
        throw nonRetriableErr;
    }
    if (!success) {
        throw new TimeoutError(retriableErr.message);
    }
    return result;
}
exports.default = retry;
//# sourceMappingURL=retries.js.map