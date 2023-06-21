import { AuthType, Config, CredentialProvider, RequestVisitor } from "./Config";
/**
 * Authenticate through the Databricks CLI.
 */
export declare class DatabricksCliCredentials implements CredentialProvider {
    name: AuthType;
    configure(config: Config): Promise<RequestVisitor | undefined>;
    private getTokenSource;
}
//# sourceMappingURL=DatabricksCliCredentials.d.ts.map