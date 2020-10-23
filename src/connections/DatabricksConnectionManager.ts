import { CloudProvider } from './_types';
import { ExportFormatsConfiguration } from '../ThisExtension';
import { DatabricksConnection } from './DatabricksConnection';


export abstract class DatabricksConnectionManager {
	protected _connections: DatabricksConnection[];
	protected _activeConnection: DatabricksConnection;

	protected _initialized: boolean;

	abstract loadConnections(): void ;
	abstract activateConnection(displayName: string): Promise<DatabricksConnection>;

	ActiveConnection: DatabricksConnection;
	ActiveConnectionName: string;
	Connections: DatabricksConnection[];

	get WorkspaceSubFolder(): string {
		return "Workspace";
	}

	get ClustersSubFolder(): string {
		return "Clusters";
	}

	get DatabricksFSSubFolder(): string {
		return "DBFS";
	}

	get JobsSubFolder(): string {
		return "Jobs";
	}
}