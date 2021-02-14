import * as vscode from 'vscode';
import { ExportFormatsConfiguration, ThisExtension, ConfigSettingSource } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { AccessTokenSecure } from './_types';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';

export class DatabricksConnectionManagerVSCode extends DatabricksConnectionManager{

	private _settingScope: ConfigSettingSource;
	

	constructor() {
		super();
		this._initialized = false;
		this._settingScope = ThisExtension.SettingScope;

		this.initialize();
	}

	initialize(): void {
		this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No connections have been configured yet! Please add a connection via the VSCode Settings -> Databricks before proceeding!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			this._lastActiveConnectionName = ThisExtension.getConfigurationSetting("databricks.lastActiveConnection", this._settingScope).value;

			if(!this._lastActiveConnectionName)
			{
				ThisExtension.log("Setting 'databricks.lastActiveConnection' is not set - using first available connection instead!");
				this._lastActiveConnectionName = this._connections[0].displayName;
			}
			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName, this._settingScope);
				this._initialized = true;
			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}

	migrateOldConfigurations(): void {

	}

	loadConnections(): void {
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

		ThisExtension.log("Loading Connections from 'databricks.connections' ...");
		let connections = ThisExtension.getConfigurationSetting<iDatabricksConnection[]>('databricks.connections', this._settingScope);
		connections.value.forEach( x => x._source = "databricks.connections");

		this._connections = this._connections.concat(connections.value);

		ThisExtension.log("Loading Connection from 'databricks.default.*' ...");
		let defaultConnection: iDatabricksConnection = {
				"displayName": ThisExtension.getConfigurationSetting<string>('databricks.connection.default.displayName', this._settingScope).value,
				"apiRootUrl": ThisExtension.getConfigurationSetting<string>('databricks.connection.default.apiRootUrl', this._settingScope).value,
				"localSyncFolder": ThisExtension.getConfigurationSetting<string>('databricks.connection.default.localSyncFolder', this._settingScope).value,
				"personalAccessToken": ThisExtension.getConfigurationSetting<string>('databricks.connection.default.personalAccessToken', this._settingScope).value,
				"personalAccessTokenSecure": ThisExtension.getConfigurationSetting<AccessTokenSecure>('databricks.connection.default.personalAccessTokenSecure', this._settingScope).value,
				"exportFormats": ThisExtension.getConfigurationSetting<ExportFormatsConfiguration>('databricks.connection.default.exportFormats', this._settingScope).value,
				"useCodeCells": ThisExtension.getConfigurationSetting<boolean>('databricks.connection.default.useCodeCells', this._settingScope).value,
				"_source": "databricks.default"
			};

		if(DatabricksConnectionTreeItem.validate(defaultConnection, false))
		{
			defaultConnection._source = "databricks.default";
			this._connections.push(defaultConnection);
		}
	}	

	updateConnection(updatedCon: iDatabricksConnection): void {
		if(updatedCon._source == "databricks.default")
		{
			ThisExtension.updateConfigurationSetting("databricks.connection.default.personalAccessToken", undefined, ThisExtension.SettingScope);
			ThisExtension.updateConfigurationSetting("databricks.connection.default.personalAccessTokenSecure", updatedCon.personalAccessTokenSecure, ThisExtension.SettingScope);
		}
		else
		{
			let configConnections = ThisExtension.getConfigurationSetting<iDatabricksConnection[]>("databricks.connections", ThisExtension.SettingScope);

			for (let con of configConnections.value)
			{
				if(con.displayName == updatedCon.displayName)
				{
					con.personalAccessToken = undefined;
					con.personalAccessTokenSecure = updatedCon.personalAccessTokenSecure;
				}
			}

			ThisExtension.updateConfigurationSetting("databricks.connections", configConnections.value, ThisExtension.SettingScope);
		}
	}
}