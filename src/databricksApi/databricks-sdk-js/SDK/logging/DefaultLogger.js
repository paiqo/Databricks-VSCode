"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLogger = void 0;
const stream_1 = require("stream");
class DefaultLogger {
    constructor(outputStream) {
        //set to noop if no stream specified
        this._stream =
            outputStream ??
                new (class extends stream_1.Writable {
                    _write(chunk, encoding, callback) {
                        callback();
                    }
                })();
    }
    log(level, message, obj) {
        this._stream.write(JSON.stringify({
            level: level,
            message: message,
            ...obj,
        }) + "\n");
    }
}
exports.DefaultLogger = DefaultLogger;
//# sourceMappingURL=DefaultLogger.js.map