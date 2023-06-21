"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenIniObject = exports.KnownConfigLoader = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const promises_1 = __importDefault(require("node:fs/promises"));
const Config_1 = require("./Config");
const ini_1 = require("ini");
/**
 * Loads configuration from the Databricks config file which is by default
 * in `~/.databrickscfg`.
 */
class KnownConfigLoader {
    constructor() {
        this.name = "config-file";
    }
    async configure(cfg) {
        const configFile = cfg.configFile || "~/.databrickscfg";
        const configPath = node_path_1.default.resolve(configFile.replace(/^~/, process.env.HOME || node_os_1.default.homedir()));
        try {
            await promises_1.default.stat(configPath);
        }
        catch (e) {
            cfg.logger.debug(`${configPath} does not exist`);
            return;
        }
        const iniFile = flattenIniObject((0, ini_1.parse)(await promises_1.default.readFile(configPath, { encoding: "utf-8" })));
        const profile = cfg.profile || "DEFAULT";
        const hasExplicitProfile = cfg.profile !== undefined;
        if (!iniFile[profile]) {
            if (!hasExplicitProfile) {
                cfg.logger.debug(`resolve: ${configPath} has no ${profile} profile configured`);
                return;
            }
            throw new Config_1.ConfigError(`resolve: ${configPath} has no ${profile} profile configured`, cfg);
        }
        cfg.logger.info(`loading ${profile} profile from ${configPath}`);
        cfg.attributes.resolveFromStringMap(iniFile[profile]);
    }
}
exports.KnownConfigLoader = KnownConfigLoader;
/**
 * The ini library encodes dots as nested objects, which is not what we want.
 * See: https://github.com/npm/ini/issues/22
 *
 * Reduce the nested object back to a flat object by concatenating object keys with a `.`
 */
function flattenIniObject(obj) {
    function _flattenIniObject(obj, topLevel = [], resp = {}) {
        const props = {};
        for (const key in obj) {
            if (typeof obj[key] === "object") {
                topLevel.push(key);
                resp = {
                    ...resp,
                    ..._flattenIniObject(obj[key], topLevel, resp),
                };
            }
            else {
                props[key] = obj[key];
            }
        }
        const topLevelName = topLevel.join(".");
        if (topLevelName !== "" && Object.keys(props).length > 0) {
            resp = { ...resp, [topLevelName]: props };
        }
        topLevel.pop();
        return resp;
    }
    return _flattenIniObject(obj);
}
exports.flattenIniObject = flattenIniObject;
//# sourceMappingURL=KnownConfigLoader.js.map