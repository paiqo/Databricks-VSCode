import { RequestVisitor, Config, CredentialProvider, AuthType } from "./Config";
/**
 * Authenticate using a personal access token (PAT)
 */
export declare class PatCredentials implements CredentialProvider {
    name: AuthType;
    configure(config: Config): Promise<RequestVisitor | undefined>;
}
//# sourceMappingURL=PatCredentials.d.ts.map