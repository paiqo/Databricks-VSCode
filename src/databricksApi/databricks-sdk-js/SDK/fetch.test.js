"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const http_1 = __importDefault(require("http"));
const assert_1 = __importDefault(require("assert"));
const fetch_1 = require("./fetch");
describe(__filename, () => {
    let server;
    let port;
    before(async () => {
        return new Promise((resolve, reject) => {
            // start http server
            server = http_1.default.createServer((req, res) => {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                });
                if (req.method === "POST") {
                    let body = "";
                    req.on("data", (chunk) => {
                        body += chunk;
                    });
                    req.on("end", () => {
                        res.write(JSON.stringify({
                            result: JSON.parse(body),
                        }));
                        res.end();
                    });
                }
                else {
                    const query = new URL(req.url, "http://localhost");
                    const timeout = parseInt(query.searchParams.get("timeout") || "0");
                    setTimeout(() => {
                        res.end('{"hello": "world"}');
                    }, timeout);
                }
            });
            server.listen(0);
            server.on("listening", () => {
                port = server.address().port;
                console.log(`Server listening on http://localhost:${port}`);
                resolve();
            });
            server.on("error", reject);
        });
    });
    after(async () => {
        return new Promise((resolve, reject) => {
            // stop http server
            server.close();
            server.on("close", resolve);
            server.on("error", reject);
        });
    });
    it("should fetch", async () => {
        const response = await (0, fetch_1.fetch)("http://localhost:" + port);
        const json = await response.json();
        assert_1.default.deepEqual(json, { hello: "world" });
    });
    it("should post data", async () => {
        const response = await (0, fetch_1.fetch)("http://localhost:" + port, {
            method: "POST",
            body: JSON.stringify({ hello: "world" }),
        });
        const json = await response.json();
        assert_1.default.deepEqual(json, { result: { hello: "world" } });
    });
    it("should abort after the request", async () => {
        const ac = new fetch_1.AbortController();
        const signal = ac.signal;
        await (0, fetch_1.fetch)("http://localhost:" + port, { signal });
        ac.abort();
    });
    it("should abort during the request", async () => {
        const ac = new fetch_1.AbortController();
        const signal = ac.signal;
        setTimeout(() => {
            ac.abort();
        }, 50);
        let aborted = false;
        try {
            await (0, fetch_1.fetch)(`http://localhost:${port}?timeout=1000`, { signal });
        }
        catch (err) {
            assert_1.default.equal(err.name, "AbortError");
            aborted = true;
        }
        assert_1.default.ok(aborted);
    });
    it("should abort before the request", async () => {
        const ac = new fetch_1.AbortController();
        const signal = ac.signal;
        ac.abort();
        let aborted = false;
        try {
            await (0, fetch_1.fetch)("http://localhost:" + port, { signal });
        }
        catch (err) {
            assert_1.default.equal(err.name, "AbortError");
            aborted = true;
        }
        assert_1.default.ok(aborted);
    });
});
//# sourceMappingURL=fetch.test.js.map