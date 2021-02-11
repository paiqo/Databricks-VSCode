import { Helper } from '../../../helpers/Helper';
import { iDatabricksConnection } from './iDatabricksConnection';


export abstract class DatabricksConnectionManager {
	protected _connections: iDatabricksConnection[];
	protected _lastActiveConnectionName: string;

	protected _initialized: boolean;

	abstract initialize(): void;
	abstract loadConnections(): void;

	abstract updateConnection(updatedCon: iDatabricksConnection): void;

	public get Connections(): iDatabricksConnection[] {
		while (!this._initialized) { Helper.wait(500); }

		return this._connections;
	}

	get LastActiveconnectionName(): string {
		return this._lastActiveConnectionName;
	}

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