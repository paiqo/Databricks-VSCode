import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksKernelManager } from '../../notebook/DatabricksKernelManager';
import { iDatabricksCluster } from '../clusters/iDatabricksCluster';

export class DatabricksConnectionManagerDatabricks extends DatabricksConnectionManager {

	private _databricksConnectionManager: any;
	private _apiClient: any;
	private _remoteSyncfolder: vscode.Uri;

	constructor() {
		super();
	}

	// TODO
	/* 
	there is also an event that fires when the Databricks Extension config is changed
	in that case we should also re-initialize the connection manager
	*/

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager Databricks Extension ...");
		this._initialized = false;

		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No Databricks Workspaces have been found! Please make sure the Databricks extension is configured properly and working!";
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

				if (this._databricksConnectionManager.serverless) {
					// currently not supported - cluster is empty for serverless
					vscode.window.showWarningMessage("Serverless clusters are not supported yet!");
				}
				else {
					if (!this._databricksConnectionManager.cluster) {
						throw new Error("Please configure/attach a cluster in the Databricks Extension first to use all features!");
					}

					let cluster = this._databricksConnectionManager.cluster.details as iDatabricksCluster;
					ThisExtension.SQLClusterID = cluster.cluster_id;
					cluster.cluster_name = "Extension (Generic)";
					cluster.kernel_id = "databricks_extension_generic";

					DatabricksKernelManager.createKernels(cluster);
				}
				
			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				ThisExtension.log(error)
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
				// TODO
				/*
				You can trigger the installation using the workbench.extensions.installExtension command (see https://code.visualstudio.com/api/references/commands).
				*/
				return;
			}

			ThisExtension.log("Databricks extension is installed! Deriving settings from there ...");
			const publicApi = await databricksExtension.activate();
			const connectionManager = publicApi.connectionManager;
			await connectionManager.login();
			await connectionManager.waitForConnect();

			this._databricksConnectionManager = connectionManager;
			// new logic to handle two versions of the Databricks Extension
			this._apiClient = connectionManager.apiClient ?? connectionManager.workspaceClient?.apiClient;
			const host = await this._apiClient.host;

			// localSyncFolder is not mandatory, hence we also allow null/undefined values
			const localSyncfolder = connectionManager.syncDestinationMapper?.localUri?.uri || connectionManager.workspaceFolderManager.activeProjectUri;
			this._remoteSyncfolder = connectionManager.syncDestinationMapper?.remoteUri?.uri;

			this._connections.push({
				"apiRootUrl": vscode.Uri.parse(host),
				"displayName": "Databricks Extension",
				"localSyncFolder": localSyncfolder,
				"exportFormats": {
					"Scala": ".scala",
					"Python": ".ipynb",
					"SQL": ".sql",
					"R": ".r"
				},
				"localSyncSubfolders": {
					"Workspace": undefined,
					"DBFS": undefined,
					"Jobs": undefined,
					"Clusters": undefined
				},
				"_source": "DatabricksExtension"
			})
		} catch (e) {
			ThisExtension.log(`ERROR: Something went wrong loading the connections from Connection Manager 'Databricks Extensions'!`);
			ThisExtension.log(e);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void { }

	async getAuthorizationHeaders(con: iDatabricksConnection): Promise<object> {
		//const headers: Record<string, string> = {};
		const headers: Map<string, string> = new Map<string, string>();
		await this._apiClient.config.authenticate(headers);

		return headers
	}

	get enableJwtTokenRefresh(): boolean {
		return true;
	}

	get remoteSyncFolder(): vscode.Uri {
		return this._remoteSyncfolder;
	}

	dispose(): void { }
}