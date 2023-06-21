"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withLogContext = void 0;
require("reflect-metadata");
const NamedLogger_1 = require("./NamedLogger");
const context_1 = require("../context");
function withLogContext(name, opName, override = false) {
    return function (_target, _propertyKey, descriptor) {
        const method = descriptor.value;
        const contextParamIndex = (0, context_1.getContextParamIndex)(_target, _propertyKey);
        descriptor.value = function (...args) {
            const logger = NamedLogger_1.NamedLogger.getOrCreate(name);
            while (args.length <= contextParamIndex) {
                args.push(undefined);
            }
            const contextParam = (args[contextParamIndex] ??
                new context_1.Context()).copy();
            const items = {
                logger: (contextParam.logger && override) ||
                    contextParam.logger === undefined
                    ? logger
                    : contextParam.logger,
                opName: contextParam.opName ?? opName,
                rootClassName: contextParam.rootClassName ?? this.constructor.name,
                rootFnName: contextParam.rootFnName ?? _propertyKey,
            };
            contextParam.setItems(items);
            args[contextParamIndex] = contextParam;
            logger.withContext({
                context: contextParam,
                loggingFnName: `${this.constructor.name}.${_propertyKey}`,
            });
            return method.apply(this, args);
        };
    };
}
exports.withLogContext = withLogContext;
//# sourceMappingURL=loggingDecorators.js.map