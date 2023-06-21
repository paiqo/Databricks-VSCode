import { Config } from "../Config";
import { Client, ClientOptions } from "./Client";
export declare class OidcEndpoints {
    readonly config: Config;
    readonly authorizationEndpoint: URL;
    readonly tokenEndpoint: URL;
    constructor(config: Config, authorizationEndpoint: URL, tokenEndpoint: URL);
    getClient(options: ClientOptions): Client;
}
//# sourceMappingURL=OidcEndpoints.d.ts.map