import * as vscode from 'vscode';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { Helper } from '../../../helpers/Helper';
import { LocalSyncSubfolderConfiguration, ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';


export abstract class DatabricksConnectionManager {
	protected _connections: iDatabricksConnection[];
	protected _lastActiveConnectionName: string;

	protected _initialized: boolean;

	abstract initialize(): Promise<void>;
	abstract loadConnections(): Promise<void>;

	abstract updateConnection(updatedCon: iDatabricksConnection): void;

	async getPersonalAccessToken(con: iDatabricksConnection): Promise<string> {
		return con.personalAccessToken;
	}

	async getAuthorizationHeaders(con: iDatabricksConnection): Promise<object> {
		return { "Authorization": 'Bearer ' + await this.getPersonalAccessToken(con) };
	}

	public get Connections(): iDatabricksConnection[] {
		while (!this._initialized) { Helper.wait(500); }

		return this._connections;
	}

	get LastActiveConnectionName(): string {
		return this._lastActiveConnectionName;
	}

	get LastActiveConnection(): iDatabricksConnection {
		return this.Connections.find((x) => x.displayName == this.LastActiveConnectionName);
	}

	async activateConnection(con: iDatabricksConnection, refreshComponents: boolean = false): Promise<void> {
		ThisExtension.log(`Activating Databricks Connection '${con.displayName}' ...`);

		ThisExtension.ActiveConnection = con;
		await ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", con.displayName);

		ThisExtension.SQLClusterID = undefined;

		if (await DatabricksApiService.initialize(con)) {

			if (con.useCodeCells) {
				let codeCellsCurrentValue = ThisExtension.getConfigurationSetting(Helper.JupyterCodeCellsSettingName).value;
				if (!codeCellsCurrentValue.includes(Helper.DatabricksCommandTagRegEx)) // Databricks tag was not yet added
				{
					await ThisExtension.updateConfigurationSetting(Helper.JupyterCodeCellsSettingName, "^(" + Helper.DatabricksCommandTagRegEx + "|" + codeCellsCurrentValue.slice(2));
				}
			}
			else {
				await ThisExtension.updateConfigurationSetting(Helper.JupyterCodeCellsSettingName, undefined);
			}

			if (refreshComponents) {
				await Helper.delay(100);

				vscode.commands.executeCommand("databricksWorkspace.refresh", undefined, false);
				vscode.commands.executeCommand("databricksClusters.refresh", undefined, false);
				vscode.commands.executeCommand("databricksJobs.refresh", undefined, false);
				vscode.commands.executeCommand("databricksFS.refresh", undefined, false);
				vscode.commands.executeCommand("databricksSecrets.refresh", undefined, false);
				vscode.commands.executeCommand("databricksSQL.refresh", undefined, false);
				vscode.commands.executeCommand("databricksRepos.refresh", undefined, false);
			}
		}
	}

	SubfolderConfiguration(con: iDatabricksConnection = undefined): LocalSyncSubfolderConfiguration {
		if (!con) {
			con = this.LastActiveConnection;
		}

		let dbfs: string = "DBFS";
		try {
			dbfs = con.localSyncSubfolders.DBFS;
		} catch (error) { }

		let workspace: string = "Workspace";
		try {
			workspace = con.localSyncSubfolders.Workspace;
		} catch (error) { }

		let clusters: string = "Clusters";
		try {
			clusters = con.localSyncSubfolders.Clusters;
		} catch (error) { }

		let jobs: string = "Jobs";
		try {
			jobs = con.localSyncSubfolders.Jobs;
		} catch (error) { }

		return {
			"Clusters": clusters,
			"DBFS": dbfs,
			"Jobs": jobs,
			"Workspace": workspace
		};
	}
}