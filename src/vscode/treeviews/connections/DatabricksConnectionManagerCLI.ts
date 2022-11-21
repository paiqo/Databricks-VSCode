import * as vscode from 'vscode';

import { ExportFormatsConfiguration, ThisExtension, LocalSyncSubfolderConfiguration } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';
import { Helper } from '../../../helpers/Helper';
import { FSHelper } from '../../../helpers/FSHelper';

export class DatabricksConnectionManagerCLI extends DatabricksConnectionManager {

	constructor() {
		super();
		this._initialized = false;
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager CLI ...");
		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No connections have been configured yet! Please add a connection via the Databricks CLI config file before proceeding!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			this._lastActiveConnectionName = ThisExtension.getConfigurationSetting("databricks.lastActiveConnection", ThisExtension.SettingScope).value;

			if (!this._lastActiveConnectionName || !this._connections.some((x) => x.displayName == this._lastActiveConnectionName)) {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' is not set - using first available connection instead!");
				this._lastActiveConnectionName = this._connections[0].displayName;
			}
			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName);
				this._initialized = true;

				await this.activateConnection(this.LastActiveConnection, false);
				
			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}

	async loadConnections(): Promise<void> {
		let configFileEnv = process.env.DATABRICKS_CONFIG_FILE;
		let configFile: vscode.Uri;
		if (configFileEnv == undefined) {
			configFile = FSHelper.joinPathSync(FSHelper.getUserDir(), ".databrickscfg");
		}
		else
		{
			configFile = vscode.Uri.file(configFileEnv)
		}

		try {
			var data = Buffer.from(await vscode.workspace.fs.readFile(configFile)).toString('utf8');

			this._connections = [];
			let connectionParameters: iDatabricksConnection = undefined;
			for (let line of data.split("\n")) {
				line = line.trim();
				if (line.length == 0) {
					continue;
				}
				if (line.startsWith("[") && line.endsWith("]")) {
					if (connectionParameters != undefined) {
						let newConnection: iDatabricksConnection = connectionParameters as iDatabricksConnection;
						if (DatabricksConnectionTreeItem.validate(newConnection, false)) {
							this._connections.push(newConnection);
						}
						else {
							ThisExtension.log("Could not load all necessary information from CLI profile '" + newConnection.displayName + "'!");
						}
					}
					connectionParameters = {
						displayName: Helper.getFirstRegexGroup(/\[([^\]]*)\]/gm, line),
						personalAccessToken: undefined, // mandatory in CLI config
						apiRootUrl: undefined, // mandatory in CLI config
						localSyncFolder: await FSHelper.joinPath(FSHelper.getUserDir(), "DatabricksSync", Helper.getFirstRegexGroup(/\[([^\]]*)\]/gm, line)),
						_source: "CLI-profile"
					};
				}
				else {
					let kvp = line.split("=").map(x => x.trim());

					switch (kvp[0]) {
						case "host":
							connectionParameters.apiRootUrl = vscode.Uri.parse(kvp[1]);
							break;
						case "token":
							connectionParameters.personalAccessToken = kvp[1];
							break;
						case "localSyncFolder":
							connectionParameters.localSyncFolder = vscode.Uri.file(kvp[1]);
							break;
						case "localSyncSubfolders":
							connectionParameters.localSyncSubfolders = JSON.parse(kvp[1]) as LocalSyncSubfolderConfiguration;
							break;
						case "exportFormats":
							connectionParameters.exportFormats = JSON.parse(kvp[1]) as ExportFormatsConfiguration;
							break;
						case "useCodeCells":
							connectionParameters.useCodeCells = Helper.parseBoolean(kvp[1]);
							break;
					}
				}
			}

			if (connectionParameters != undefined) {
				let newConnection: iDatabricksConnection = connectionParameters as iDatabricksConnection;
				if (DatabricksConnectionTreeItem.validate(newConnection, false)) {
					this._connections.push(newConnection);
				}
				else {
					ThisExtension.log("Could not load all necessary information from CLI profile '" + newConnection.displayName + "'!");
				}
			}
		} catch (e) {
			ThisExtension.log(e);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void {	}
}