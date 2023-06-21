import { Token } from "../Token";
import { OidcEndpoints } from "./OidcEndpoints";
import { Headers } from "../../fetch";
export interface ClientOptions {
    clientId: string;
    clientSecret: string;
    useParams?: boolean;
    useHeader?: boolean;
    headers?: Headers;
}
export declare class Client {
    private issuer;
    private options;
    constructor(issuer: OidcEndpoints, options: ClientOptions);
    grant(scope: string): Promise<Token>;
    private fetch;
}
//# sourceMappingURL=Client.d.ts.map