import { AuthType, Config, CredentialProvider, RequestVisitor } from "./Config";
/**
 * M2mCredentials provides OAuth 2.0 client credentials flow for service principals
 */
export declare class M2mCredentials implements CredentialProvider {
    name: AuthType;
    configure(config: Config): Promise<RequestVisitor | undefined>;
}
//# sourceMappingURL=M2mCredentials.d.ts.map