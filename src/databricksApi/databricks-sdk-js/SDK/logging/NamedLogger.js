"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamedLogger = exports.defaultOpts = exports.LEVELS = void 0;
const Redactor_1 = require("../Redactor");
const DefaultLogger_1 = require("./DefaultLogger");
var LEVELS;
(function (LEVELS) {
    LEVELS["error"] = "error";
    LEVELS["warn"] = "warn";
    LEVELS["info"] = "info";
    LEVELS["debug"] = "debug";
})(LEVELS || (exports.LEVELS = LEVELS = {}));
const loggers = new Map();
exports.defaultOpts = {
    get fieldNameDenyList() {
        const denyList = [];
        if (!(process.env["DATABRICKS_DEBUG_HEADERS"] &&
            process.env["DATABRICKS_DEBUG_HEADERS"] === "true")) {
            denyList.push(...["headers", "agent"]);
        }
        return denyList;
    },
    factory: () => new DefaultLogger_1.DefaultLogger(),
};
class NamedLogger {
    constructor(name) {
        this.name = name;
    }
    get opId() {
        return this._context?.opId;
    }
    get opName() {
        const rootNames = [
            this._context?.rootClassName,
            this._context?.rootFnName,
        ].filter((e) => e !== undefined);
        return this._context?.opName ?? rootNames.length !== 0
            ? rootNames.join(".")
            : undefined;
    }
    get loggingFnName() {
        return this._loggingFnName;
    }
    get _logger() {
        return loggers.get(this.name)?.logger;
    }
    get _loggerOpts() {
        return loggers.get(this.name)?.opts;
    }
    //TODO: consistently obfuscate the names of non exposed loggers
    static getOrCreate(name, opts, replace = false) {
        const loggerOpts = { ...exports.defaultOpts, ...opts };
        if (replace || !loggers.has(name)) {
            loggers.set(name, {
                name: name,
                logger: loggerOpts.factory(name),
                opts: loggerOpts,
            });
        }
        return new NamedLogger(name);
    }
    log(level, message, meta) {
        if (level === "error") {
            if (Object(meta) === meta) {
                meta = {
                    ...Object.getOwnPropertyNames(meta).reduce((acc, i) => {
                        acc[i] = meta[i];
                        return acc;
                    }, {}),
                    ...meta,
                };
            }
            meta = { error: meta };
        }
        meta = Redactor_1.defaultRedactor.sanitize(meta, this._loggerOpts?.fieldNameDenyList);
        this._logger?.log(level, message, {
            logger: this.name,
            operationId: this.opId,
            operationName: this.opName,
            loggingFunction: this.loggingFnName,
            timestamp: Date.now(),
            ...meta,
        });
    }
    debug(message, obj) {
        this.log(LEVELS.debug, message, obj);
    }
    info(message, obj) {
        this.log(LEVELS.info, message, obj);
    }
    warn(message, obj) {
        this.log(LEVELS.warn, message, obj);
    }
    error(message, obj) {
        this.log(LEVELS.error, message, obj);
    }
    withContext({ context, loggingFnName, }) {
        this._context = context ?? this._context;
        this._loggingFnName = loggingFnName ?? this._loggingFnName;
        return this;
    }
}
exports.NamedLogger = NamedLogger;
//# sourceMappingURL=NamedLogger.js.map