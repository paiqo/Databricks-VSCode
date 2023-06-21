import { RequestVisitor, Config, CredentialProvider, AuthType } from "./Config";
export declare class DefaultCredentials implements CredentialProvider {
    name: AuthType;
    configure(config: Config): Promise<RequestVisitor>;
}
//# sourceMappingURL=DefaultCredentials.d.ts.map