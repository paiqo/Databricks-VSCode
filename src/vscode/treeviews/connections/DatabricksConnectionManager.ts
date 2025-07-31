import * as vscode from 'vscode';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { Helper } from '../../../helpers/Helper';
import { LocalSyncSubfolderConfiguration, ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';


export abstract class DatabricksConnectionManager implements vscode.Disposable {
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
		//while (!this._initialized) { Helper.wait(500); }

		return this._connections;
	}

	get LastActiveConnectionName(): string {
		return this._lastActiveConnectionName;
	}

	get LastActiveConnection(): iDatabricksConnection {
		return this.Connections.find((x) => x.displayName == this.LastActiveConnectionName);
	}

	get enableJwtTokenRefresh(): boolean {
		return false;
	}

	async activateConnection(con: iDatabricksConnection, refreshComponents: boolean = false): Promise<void> {
		ThisExtension.log(`Activating Databricks Connection '${con.displayName}' ...`);

		ThisExtension.ActiveConnection = con;
		await ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", con.displayName);

		ThisExtension.SQLClusterID = undefined;

		if (await DatabricksApiService.initialize(con)) {

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
			if (con.localSyncSubfolders?.DBFS) {
				dbfs = con.localSyncSubfolders.DBFS;
			}
		} catch (error) { }

		let workspace: string = "Workspace";
		try {
			if (con.localSyncSubfolders?.Workspace) {
				workspace = con.localSyncSubfolders.Workspace;
			}
		} catch (error) { }

		let clusters: string = "Clusters";
		try {
			if (con.localSyncSubfolders?.Clusters) {
				clusters = con.localSyncSubfolders.Clusters;
			}
		} catch (error) { }

		let jobs: string = "Jobs";
		try {
			if (con.localSyncSubfolders?.Jobs) {
				jobs = con.localSyncSubfolders.Jobs;
			}
		} catch (error) { }

		return {
			"Clusters": clusters,
			"DBFS": dbfs,
			"Jobs": jobs,
			"Workspace": workspace
		};
	}

	async manageLastActiveConnection(): Promise<void> {
		this._lastActiveConnectionName = ThisExtension.getConfigurationSetting("databricks.lastActiveConnection", ThisExtension.SettingScope).value;

		if (!this._lastActiveConnectionName || !this._connections.some((x) => x.displayName == this._lastActiveConnectionName)) {
			ThisExtension.log("Setting 'databricks.lastActiveConnection' is not set - using first available connection instead!");
			this._lastActiveConnectionName = this._connections[0].displayName;
		}
	}

	/**
	 * Dispose this object.
	 */
	abstract dispose(): void;
}