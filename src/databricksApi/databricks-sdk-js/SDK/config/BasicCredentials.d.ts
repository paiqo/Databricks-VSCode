import { RequestVisitor, Config, CredentialProvider, AuthType } from "./Config";
/**
 * Authenticate using username and password
 */
export declare class BasicCredentials implements CredentialProvider {
    name: AuthType;
    configure(config: Config): Promise<RequestVisitor | undefined>;
}
export declare function getBasicAuthHeader(username: string, password: string): string;
//# sourceMappingURL=BasicCredentials.d.ts.map