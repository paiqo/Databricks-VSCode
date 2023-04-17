import * as vscode from 'vscode';

import { ExportFormatsConfiguration, ThisExtension, ConfigSettingSource, LocalSyncSubfolderConfiguration } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { AccessTokenSecure } from './_types';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';

export class DatabricksConnectionManagerVSCode extends DatabricksConnectionManager {

	private _settingScope: ConfigSettingSource;

	constructor() {
		super();
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager VSCode ...");
		this._initialized = false;
		this._settingScope = ThisExtension.SettingScope;

		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No connections have been configured yet! Please add a connection via the VSCode Settings -> Databricks before proceeding!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			await super.manageLastActiveConnection();

			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName, this._settingScope);
				this._initialized = true;

				await this.activateConnection(this.LastActiveConnection, true);

			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}

	async loadConnections(): Promise<void> {
		/*
		there are 2 different areas from where Connections can be loaded from:
		1) the VSCode setting 'databricks.connection.default.*' - a single connection that can be easily configured in the UI
		2) the VSCode setting 'databricks.connections' - an array of connections

		The result is a superset of both. 
		As VSCode settings can be stored globally (User-Settings) and in the VSCode Workspace (Workspace-Setting),
		we need to check if any of Workspace-Setting is configured. If yes, we always use the Workspace-settings,
		otherwise we always use the User-Settings.
		*/

		this._settingScope = ThisExtension.SettingScope;
		this._connections = [];

		try {
			ThisExtension.log("Loading Connections from 'databricks.connections' ...");
			let connections = ThisExtension.getConfigurationSetting<iDatabricksConnection[]>('databricks.connections', this._settingScope, true);
			connections.value.forEach(x => x._source = "databricks.connections");
			connections.value.forEach(x => DatabricksConnectionTreeItem.validate(x, false));
			this._connections = this._connections.concat(connections.value);
		}
		catch (error) {
			let msg = "Could not load connections from 'databricks.connections' settings!";
			ThisExtension.log("ERROR: " + msg);
			vscode.window.showErrorMessage(msg);
		}


		ThisExtension.log("Loading Connection from 'databricks.connection.default.*' ...");
		try {
			let defaultApiRootUrl = ThisExtension.getConfigurationSetting<string>('databricks.connection.default.apiRootUrl', this._settingScope);
			if (defaultApiRootUrl.value) {
				let defaultConnection: iDatabricksConnection = {
					"displayName": ThisExtension.getConfigurationSetting<string>('databricks.connection.default.displayName', this._settingScope).value,
					"apiRootUrl": vscode.Uri.parse(ThisExtension.getConfigurationSetting<string>('databricks.connection.default.apiRootUrl', this._settingScope).value),
					"localSyncFolder": vscode.Uri.file(ThisExtension.getConfigurationSetting<string>('databricks.connection.default.localSyncFolder', this._settingScope).value),
					"localSyncSubfolders": ThisExtension.getConfigurationSetting<LocalSyncSubfolderConfiguration>('databricks.connection.default.localSyncSubfolders', this._settingScope).value,
					"personalAccessToken": ThisExtension.getConfigurationSetting<string>('databricks.connection.default.personalAccessToken', this._settingScope).value,
					"personalAccessTokenSecure": ThisExtension.getConfigurationSetting<AccessTokenSecure>('databricks.connection.default.personalAccessTokenSecure', this._settingScope).value,
					"exportFormats": ThisExtension.getConfigurationSetting<ExportFormatsConfiguration>('databricks.connection.default.exportFormats', this._settingScope).value,
					"_source": "databricks.default"
				};

				if (DatabricksConnectionTreeItem.validate(defaultConnection, false)) {
					defaultConnection._source = "databricks.default";
					this._connections.push(defaultConnection);
				}
			}
		}
		catch (error) {
			let msg = "Could not load connection from 'databricks.connection.default.*' settings!";
			ThisExtension.log("ERROR: " + msg);
			vscode.window.showErrorMessage(msg);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void {
		if (updatedCon._source == "databricks.default") {
			ThisExtension.updateConfigurationSetting("databricks.connection.default.personalAccessToken", undefined, ThisExtension.SettingScope);
			ThisExtension.updateConfigurationSetting("databricks.connection.default.personalAccessTokenSecure", updatedCon.personalAccessTokenSecure, ThisExtension.SettingScope);
		}
		else {
			let configConnections = ThisExtension.getConfigurationSetting<iDatabricksConnection[]>("databricks.connections", ThisExtension.SettingScope);

			for (let con of configConnections.value) {
				if (con.displayName == updatedCon.displayName) {
					con.personalAccessToken = undefined;
					con.personalAccessTokenSecure = updatedCon.personalAccessTokenSecure;
				}
			}

			ThisExtension.updateConfigurationSetting("databricks.connections", configConnections.value, ThisExtension.SettingScope);
		}
	}

	async getPersonalAccessToken(con: iDatabricksConnection): Promise<string> {
		let accessToken: string = con.personalAccessToken;
		const secureTokenName: string = con.displayName + "-API-Token";
		const secureTokenStore = ThisExtension.SensitiveValueStore;

		if (!accessToken) {
			switch (secureTokenStore) {
				case "SystemKeyChain":
					ThisExtension.log("Getting Personal Access Token from System KeyChain '" + secureTokenName + "'");
					accessToken = await ThisExtension.getSecureSetting(secureTokenName);

					if (!accessToken) {
						let msg = "Databricks Personal Access Token not found in System Key Chain!";
						ThisExtension.log(msg);
						ThisExtension.log("Please add the Personal access token again using the configuration property 'personalAccessToken' and refersh the connections.");
						vscode.window.showErrorMessage(msg);
					}

					break;

				case "ExternalConfigFile":
					ThisExtension.log("Getting Personal Access Token from External Config File");
					throw "Not yet implemented!";

					break;

				case "VSCodeSettings":
					throw "Not yet implemented!";

					break;

				default:
					throw "Invalid Sensitive Value Store !";

					break;
			}
		}

		if (!accessToken) {
			ThisExtension.log("ERROR: Could not load PersonalAccessToken '" + secureTokenName + "' from '" + secureTokenStore + "'!");
			vscode.window.showErrorMessage("Could not load PersonalAccessToken '" + secureTokenName + "' from '" + secureTokenStore + "'!");
		}

		return accessToken;
	}
}