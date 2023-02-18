import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';

export class DatabricksConnectionManagerDatabricks extends DatabricksConnectionManager {

	private _databricksConnectionManager: any;

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

				ThisExtension.SQLClusterID = this._databricksConnectionManager.cluster.id;

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
			let apiClient = workspaceManager.apiClient;
			let host = await apiClient.host;
			let token = apiClient.config.token;

			let localSyncfolder = connectionManager.syncDestinationMapper?.localUri;

			this._connections.push({
				"apiRootUrl": vscode.Uri.parse(host), 
				"personalAccessToken": token, 
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

			let i = 0;
			
		} catch (e) {
			ThisExtension.log(e);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void { }
}