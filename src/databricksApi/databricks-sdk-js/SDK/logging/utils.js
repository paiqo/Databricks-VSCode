"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liftAllErrorProps = void 0;
/*
Standard Error class has message and stack fields set as non enumerable.
To correctly account for all such fields, we iterate over all own-properties of
the error object and accumulate them as enumerable fields in the final err object.
*/
function liftAllErrorProps(err) {
    if (Object(err) === err) {
        err = {
            ...Object.getOwnPropertyNames(err).reduce((acc, i) => {
                acc[i] = err[i];
                return acc;
            }, {}),
            ...err,
        };
    }
    return err;
}
exports.liftAllErrorProps = liftAllErrorProps;
//# sourceMappingURL=utils.js.map