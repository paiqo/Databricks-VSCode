"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigAttributes = exports.EnvironmentLoader = exports.ConfigAttribute = exports.attribute = exports.getAttributesFromDecorators = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const Config_1 = require("./Config");
const ATTRIBUTES = new WeakMap();
function getAttributesFromDecorators(target, config) {
    const attributes = new ConfigAttributes(config);
    if (!ATTRIBUTES.get(target)) {
        return attributes;
    }
    ATTRIBUTES.get(target).map((f) => attributes.add(f(config)));
    return attributes;
}
exports.getAttributesFromDecorators = getAttributesFromDecorators;
/**
 * Decorator to annotate config attributes
 */
function attribute(options) {
    return (target, propertyKey) => {
        if (!ATTRIBUTES.get(target)) {
            ATTRIBUTES.set(target, []);
        }
        ATTRIBUTES.get(target).push((config) => {
            return new ConfigAttribute({
                name: propertyKey,
                envVar: options.env,
                confName: options.name,
                auth: options.auth,
                sensitive: !!options.sensitive,
            }, config);
        });
    };
}
exports.attribute = attribute;
/**
 * ConfigAttribute provides generic way to work with Config configuration
 * attributes and parses `name`, `env`, and `auth` field tags.
 */
class ConfigAttribute {
    constructor(options, config) {
        this.config = config;
        this.name = options.name;
        this.envVar = options.envVar;
        this.confName = options.confName;
        this.auth = options.auth;
        this.sensitive = options.sensitive || false;
        this.internal = options.internal || false;
    }
    isUndefined() {
        return this.config[this.name] === undefined;
    }
    readEnv() {
        if (this.envVar) {
            return this.config.env[this.envVar];
        }
    }
    readFromConfigFile(conf) {
        if (this.confName) {
            return conf[this.confName];
        }
    }
}
exports.ConfigAttribute = ConfigAttribute;
class EnvironmentLoader {
    constructor() {
        this.name = "environment";
    }
    async configure(cfg) {
        return cfg.attributes.resolveFromEnv();
    }
}
exports.EnvironmentLoader = EnvironmentLoader;
class ConfigAttributes {
    constructor(config) {
        this.config = config;
        this.attributes = [];
        // this.attributes = Object.keys(AUTH_TYPE_FOR_CONFIG).map((key) => {
        //     return new ConfigAttribute(key as AttributeName, config);
        // });
    }
    add(attr) {
        this.attributes.push(attr);
    }
    validate() {
        if (this.config.authType !== undefined) {
            return;
        }
        const authsUsed = new Set();
        for (const attr of this.attributes) {
            if (attr.isUndefined()) {
                continue;
            }
            if (attr.auth === undefined) {
                continue;
            }
            authsUsed.add(attr.auth);
        }
        if (authsUsed.size <= 1) {
            return;
        }
        const sortedMethods = Array.from(authsUsed).sort();
        throw new Config_1.ConfigError(`validate: more than one authorization method configured: ${sortedMethods.join(" and ")}`, this.config);
    }
    resolveFromEnv() {
        for (const attr of this.attributes) {
            if (!attr.isUndefined()) {
                // don't overwrite a value previously set
                continue;
            }
            const env = attr.readEnv();
            if (env !== undefined) {
                this.config[attr.name] = env;
            }
        }
    }
    resolveFromStringMap(map) {
        for (const attr of this.attributes) {
            if (!attr.isUndefined()) {
                // don't overwrite a value previously set
                continue;
            }
            if (!attr.confName) {
                continue;
            }
            const value = map[attr.confName];
            if (value !== undefined) {
                this.config[attr.name] = value;
            }
        }
    }
    debugString() {
        const attrUsed = {};
        const envUsed = [];
        let result = "";
        for (const attr of this.attributes) {
            if (attr.isUndefined()) {
                continue;
            }
            if (attr.confName) {
                attrUsed[attr.confName] = attr.sensitive
                    ? "***"
                    : this.config[attr.name];
            }
            if (attr.envVar) {
                if (attr.readEnv() !== undefined) {
                    envUsed.push(attr.envVar);
                }
            }
        }
        if (Object.keys(attrUsed).length > 0) {
            result += `Config: ${Object.keys(attrUsed)
                .map((key) => `${key}=${attrUsed[key]}`)
                .join(", ")}`;
        }
        if (Object.keys(envUsed).length > 0) {
            result += `. Env: ${envUsed.join(", ")}`;
        }
        return result;
    }
    *[Symbol.iterator]() {
        yield* this.attributes;
    }
}
exports.ConfigAttributes = ConfigAttributes;
//# sourceMappingURL=ConfigAttributes.js.map