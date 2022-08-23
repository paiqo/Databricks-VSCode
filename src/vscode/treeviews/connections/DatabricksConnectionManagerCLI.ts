import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { ExportFormatsConfiguration, ThisExtension, LocalSyncSubfolderConfiguration } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';
import { Helper } from '../../../helpers/Helper';

export class DatabricksConnectionManagerCLI extends DatabricksConnectionManager {

	constructor() {
		super();
		this._initialized = false;

		this.initialize();
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager CLI ...");
		this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No connections have been configured yet! Please add a connection via the VSCode Settings -> Databricks before proceeding!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			this._lastActiveConnectionName = ThisExtension.getConfigurationSetting("databricks.lastActiveConnection").value;

			if (!this._lastActiveConnectionName) {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' is not set - using first available connection instead!");
				this._lastActiveConnectionName = this._connections[0].displayName;
			}
			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName);
				this._initialized = true;

				await this.activateConnection(this.LastActiveConnection);
				
			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}

	loadConnections(): void {
		let configFile = process.env.DATABRICKS_CONFIG_FILE;

		if (configFile == undefined) {
			configFile = fspath.join(Helper.getUserDir(), ".databrickscfg");
		}

		try {
			var data = fs.readFileSync(configFile, 'utf8');

			this._connections = [];
			let connectionParameters: iDatabricksConnection = undefined;
			for (let line of data.split(os.EOL)) {
				if (line.trim().length == 0) {
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
						localSyncFolder: fspath.join(Helper.getUserDir(), "DatabricksSync", Helper.getFirstRegexGroup(/\[([^\]]*)\]/gm, line)),
						_source: "CLI-profile"
					};
				}
				else {
					let kvp = line.split("=").map(x => x.trim());

					switch (kvp[0]) {
						case "host":
							connectionParameters.apiRootUrl = kvp[1];
							break;
						case "token":
							connectionParameters.personalAccessToken = kvp[1];
							break;
						case "localSyncFolder":
							connectionParameters.localSyncFolder = kvp[1];
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
			console.log('Error:', e.stack);
		}
		/*
				let connection: iDatabricksConnection = {
					displayName: "Env Variables",
					apiRootUrl: apiUrl,
					personalAccessToken: personalAccessToken,
					localSyncFolder: ""
				}
		
				if(DatabricksConnectionTreeItem.validate(defaultConnection, false))
				{
					defaultConnection._source = "databricks.default";
					this._connections.push(defaultConnection);
				}
				*/
	}

	updateConnection(updatedCon: iDatabricksConnection): void {

	}

	async getAccessToken(con: iDatabricksConnection): Promise<string> {
		return "";
	}
}