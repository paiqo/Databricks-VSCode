"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContextParamIndex = exports.context = void 0;
require("reflect-metadata");
const CONTEXT_SYMBOL = Symbol.for("context");
function context(_target, _propertyKey, parameterIndex) {
    const existingParameters = Reflect.getOwnMetadata(CONTEXT_SYMBOL, _target, _propertyKey) || [];
    existingParameters.push(parameterIndex);
    Reflect.defineMetadata(CONTEXT_SYMBOL, existingParameters, _target, _propertyKey);
}
exports.context = context;
function getContextParamIndex(_target, _propertyKey) {
    const contextParams = Reflect.getOwnMetadata(CONTEXT_SYMBOL, _target, _propertyKey);
    if (contextParams.length !== 1) {
        throw Error(`Use @context to specify exactly 1 parameter of ${_propertyKey} as context`);
    }
    return contextParams[0];
}
exports.getContextParamIndex = getContextParamIndex;
//# sourceMappingURL=contextDecorator.js.map