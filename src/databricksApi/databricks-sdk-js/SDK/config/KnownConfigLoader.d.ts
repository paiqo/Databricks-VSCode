import { Config, Loader } from "./Config";
/**
 * Loads configuration from the Databricks config file which is by default
 * in `~/.databrickscfg`.
 */
export declare class KnownConfigLoader implements Loader {
    name: string;
    configure(cfg: Config): Promise<void>;
}
/**
 * The ini library encodes dots as nested objects, which is not what we want.
 * See: https://github.com/npm/ini/issues/22
 *
 * Reduce the nested object back to a flat object by concatenating object keys with a `.`
 */
export declare function flattenIniObject(obj: {
    [key: string]: any;
}): {
    [key: string]: any;
};
//# sourceMappingURL=KnownConfigLoader.d.ts.map