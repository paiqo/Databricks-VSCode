import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksKernelManager } from '../../notebook/DatabricksKernelManager';
import { iDatabricksCluster } from '../clusters/iDatabricksCluster';

export class DatabricksConnectionManagerDatabricks extends DatabricksConnectionManager {

	private _databricksConnectionManager: any;
	private _apiClient: any;

	constructor() {
		super();
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager Databricks Extension ...");
		this._initialized = false;

		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No Databricks Workspaces have been found! Please make sure you are connected to the right tenant and have the appropriate permissions!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			await super.manageLastActiveConnection();

			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName);
				this._initialized = true;

				await this.activateConnection(this.LastActiveConnection, true);

				let cluster = this._databricksConnectionManager.cluster.details as iDatabricksCluster;
				ThisExtension.SQLClusterID = cluster.cluster_id;
				cluster.cluster_name = "Extension (Generic)";
				cluster.kernel_id = "databricks_extension_generic";

				DatabricksKernelManager.createKernels(cluster);
			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}

	async loadConnections(): Promise<void> {
		try {
			this._connections = [];

			const databricksExtension: vscode.Extension<any> = vscode.extensions.getExtension("databricks.databricks");
			if (!databricksExtension) {
				vscode.window.showErrorMessage("Please install the Databricks extension ('databricks.databricks') first!");
				return;
			}

			ThisExtension.log("Databricks extension is installed!");
			let publicApi = await databricksExtension.activate();
			let connectionManager = publicApi.connectionManager;
			await connectionManager.login();
			this._databricksConnectionManager = connectionManager;;

			let workspaceManager = connectionManager.workspaceClient;
			this._apiClient = workspaceManager.apiClient;
			let host = await this._apiClient.host;

			let localSyncfolder = connectionManager.syncDestinationMapper?.localUri;

			this._connections.push({
				"apiRootUrl": vscode.Uri.parse(host), 
				"displayName": "Databricks Extension",
				"localSyncFolder": localSyncfolder.uri,
				"exportFormats": {
					"Scala": ".scala",
					"Python": ".ipynb",
					"SQL": ".sql",
					"R": ".r"
				},
				"useCodeCells": false,
				"_source": "DatabricksExtension"
				})			
		} catch (e) {
			ThisExtension.log(e);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void { }

	async getAuthorizationHeaders(con: iDatabricksConnection): Promise<object> {
		const headers: Record<string, string> = {};
		await this._apiClient.config.authenticate(headers);

		return headers
	}
}