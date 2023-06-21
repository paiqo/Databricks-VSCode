import { Cluster } from "../services/Cluster";
import { WorkspaceClient } from "../WorkspaceClient";
export declare class IntegrationTestSetup {
    readonly client: WorkspaceClient;
    readonly cluster: Cluster;
    readonly testRunId: string;
    constructor(client: WorkspaceClient, cluster: Cluster);
    private static _instance;
    static getInstance(): Promise<IntegrationTestSetup>;
}
export declare function sleep(timeout: number): Promise<void>;
//# sourceMappingURL=IntegrationTestSetup.d.ts.map