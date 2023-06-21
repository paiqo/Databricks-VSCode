import { AttributeName, Config, Loader } from "./Config";
export declare function getAttributesFromDecorators(target: any, config: Config): ConfigAttributes;
/**
 * Decorator to annotate config attributes
 */
export declare function attribute(options: {
    name?: string;
    env?: string;
    auth?: "pat" | "basic" | "azure" | "google" | "metadata-service" | "oauth";
    sensitive?: boolean;
}): (target: any, propertyKey: AttributeName) => void;
/**
 * ConfigAttribute provides generic way to work with Config configuration
 * attributes and parses `name`, `env`, and `auth` field tags.
 */
export declare class ConfigAttribute {
    private config;
    name: AttributeName;
    envVar?: string;
    confName?: string;
    auth?: string | undefined;
    sensitive: boolean;
    internal: boolean;
    constructor(options: {
        name: AttributeName;
        envVar?: string;
        confName?: string;
        auth?: string | undefined;
        sensitive?: boolean;
        internal?: boolean;
    }, config: Config);
    isUndefined(): boolean;
    readEnv(): string | undefined;
    readFromConfigFile(conf: Record<string, string>): string | undefined;
}
export declare class EnvironmentLoader implements Loader {
    name: string;
    configure(cfg: Config): Promise<void>;
}
export declare class ConfigAttributes {
    private config;
    readonly attributes: ConfigAttribute[];
    constructor(config: Config);
    add(attr: ConfigAttribute): void;
    validate(): void;
    resolveFromEnv(): void;
    resolveFromStringMap(map: Record<string, string>): void;
    debugString(): string;
    [Symbol.iterator](): Generator<ConfigAttribute, void, undefined>;
}
//# sourceMappingURL=ConfigAttributes.d.ts.map