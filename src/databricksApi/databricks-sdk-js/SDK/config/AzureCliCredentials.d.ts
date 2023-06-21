import { Token } from "./Token";
import { RequestVisitor, Config, CredentialProvider, AuthType } from "./Config";
import { Provider } from "../types";
/**
 * Authenticate using Azure CLI
 */
export declare class AzureCliCredentials implements CredentialProvider {
    name: AuthType;
    configure(config: Config): Promise<RequestVisitor | undefined>;
    getTokenSource(config: Config, appId: string): Provider<Token>;
}
//# sourceMappingURL=AzureCliCredentials.d.ts.map