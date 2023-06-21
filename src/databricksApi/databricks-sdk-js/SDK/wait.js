"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asWaiter = void 0;
/**
 * Takes an API response object and adds a wait method that polls
 * the API until the response is ready.
 *
 * This function is used for long running operations that complete
 * asynchronously.
 */
function asWaiter(response, poll) {
    return {
        ...response,
        wait: async (options) => {
            return await poll(options);
        },
    };
}
exports.asWaiter = asWaiter;
//# sourceMappingURL=wait.js.map