import * as vscode from 'vscode';
import { WorkspaceItemLanguage } from './databricksApi/workspaces/_types';
import { DatabricksConnectionManager } from './connections/DatabricksConnectionManager';
import { Helper } from './helpers/Helper';
import { DatabricksConnection } from './connections/DatabricksConnection';
import { iDatabricksConnection } from './connections/iDatabricksConnection';
import { DatabricksApiService } from './databricksApi/databricksApiService';
import { DatabricksConnectionManagerVSCode } from './connections/DatabricksConnectionManagerVSCode';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export abstract class ThisExtension {
	static extension_id = 'paiqo.databricks-vscode';

	private static _context: vscode.ExtensionContext;
	private static _extension: vscode.Extension<any>;
	private static _isValidated: boolean = false;
	private static _logger: vscode.OutputChannel;
	private static _keytar;
	private static _connectionManager: DatabricksConnectionManager;

	static get rootPath(): string {
		return this._context.extensionPath;
	}

	static get extensionContext(): vscode.ExtensionContext {
		return this._context;
	}

	static set ActiveConnectionName(displayName: string) {
		this.ConnectionManager.activateConnection(displayName);
	}

	static get ActiveConnectionName(): string {
		return this.ConnectionManager.ActiveConnectionName;
	}

	static get ActiveConnection(): DatabricksConnection {
		return this.ConnectionManager.ActiveConnection;
	}

	static get RefreshAfterUpDownload(): boolean {
		return true;
	}

	static get IsValidated(): boolean {
		return this._isValidated;
	}

	static initialize(context: vscode.ExtensionContext): boolean {
		try {
			this._logger = vscode.window.createOutputChannel(ThisExtension.extension_id);
			this.log("Logger initialized!");

			this._context = context;
			this._extension = vscode.extensions.getExtension(this.extension_id);

			this.log("Initializing ConnectionManager ...");
			// could use 
			this._connectionManager = new DatabricksConnectionManagerVSCode();

			this.log("Initializing Databricks API Service ...");


			this._keytar = require('keytar');

			DatabricksApiService.initialize();

			return true;
		} catch (error) {
			return false;
		}
	}

	static cleanUp(): void {
		Helper.removeTempFiles();
	}

	static get ConnectionManager(): DatabricksConnectionManager {
		return this._connectionManager;
	}

	static get allFileExtensions(): string[] {
		let config = ThisExtension.configuration.packageJSON.contributes.configuration[0];
		let exportFormats = config.properties["databricks.connection.default.exportFormats"].properties;

		let extensions: string[] = [];
		for (let format of Object.values(exportFormats)) {
			(format["enum"] as string[]).forEach(element => {
				extensions.push(element);
			});
		}
		extensions.push(".py.ipynb"); // for legacy support of old file extensions - will be removed in the future

		return extensions;
	}

	static allLanguageFileExtensions(language: WorkspaceItemLanguage): string[] {
		let config = ThisExtension.configuration.packageJSON.contributes.configuration[0];
		let exportFormats = config.properties["databricks.connection.default.exportFormats"].properties;

		let extensions: string[] = [];

		switch (language) {
			case "PYTHON":
				extensions = exportFormats["Python"]["enum"];
				extensions.push(".py.ipynb"); // workaround to support legacy file extension - will be removed in the future
				break;
			case "R":
				extensions = exportFormats["R"]["enum"];
				break;
			case "SCALA":
				extensions = exportFormats["Scala"]["enum"];
				break;
			case "SQL":
				extensions = exportFormats["SQL"]["enum"];
				break;
			default: throw new Error("ExportFormat for Language '" + language + "' is not defined!");
		}

		return extensions;
	}

	static log(text: string, newLine: boolean = true): void {
		if (newLine) {
			this._logger.appendLine(text);
		}
		else {
			this._logger.append(text);
		}
	}

	static get configuration(): vscode.Extension<any> {
		return this._extension;
	}

	static async getSecureSetting(setting: string): Promise<string> {
		let value: string = this._keytar.getPassword(this.extension_id, setting);
		return value;
	}

	static async setSecureSetting(setting: string, value: string): Promise<void> {
		await this._keytar.setPassword(this.extension_id, setting, value);
	}

	static getConfigurationSetting<T=string>(setting: string, source?: ConfigSettingSource): ConfigSetting<T> {
		let value = vscode.workspace.getConfiguration().get(setting) as T;
		let inspect = vscode.workspace.getConfiguration().inspect(setting);

		if(source == "Global")
		{
			value = (inspect.globalValue ?? inspect.globalLanguageValue) as T;
		}
		else if(source == "Workspace")
		{
			value = (inspect.workspaceValue ?? inspect.workspaceFolderValue ?? inspect.workspaceLanguageValue ?? inspect.workspaceFolderLanguageValue) as T;
		}
		else if(source == "Default")
		{
			value = (inspect.defaultValue ?? inspect.defaultLanguageValue) as T;
		}
		else if(!source)
		{
			if(inspect.workspaceValue || inspect.workspaceFolderValue || inspect.workspaceLanguageValue || inspect.workspaceFolderLanguageValue)
			{
				source = "Workspace";
			}
			else if(inspect.globalValue || inspect.globalLanguageValue)
			{
				source = "Global";
			}
			else {
				source = "Default";
			}
		}
		
		return {
			value: value,
			inspect: inspect,
			source: source
		};
	}

	static get useProxy(): boolean {
		let httpProxySupport: ConfigSetting<string> = ThisExtension.getConfigurationSetting<string>("http.proxySupport");

		// only check if proxySupport is explicitly set to "off"
		if(httpProxySupport.value == "off")
		{
			this.log('Proxy support is disabled due to setting "http.proxySupport": "off"!');
			return false;
		}

		if(httpProxySupport.value == "on")
		{
			this.log('Proxy support is enabled due to setting "http.proxySupport": "on"!');
			return true;
		}

		return undefined;
	}
}

// represents the structure how the ExportFormats and FileExtensions for the different language are defined in the VS Code settings
export type ExportFormatsConfiguration = {
	Scala: string;
	Python: string;
	R: string;
	SQL: string;
};

// represents the structure how the reference to the VSCode User settings are stored in the VSCode workspace settings
export interface iWorkspaceConfiguration {
	workspaceGuid: string;
	lastActiveConnection: string;
}

// represents the structure how workspace configurations are stored in VSCode User Settings
export interface iUserWorkspaceConfiguration {
	workspaceConfig: iWorkspaceConfiguration;
	connections: iDatabricksConnection[];
}

export type ConfigSettingSource =
	"Workspace"
|	"Global"
|	"Default"
;

export interface ConfigSetting<T> {
	value: T;
	inspect;
	source: ConfigSettingSource;
}
