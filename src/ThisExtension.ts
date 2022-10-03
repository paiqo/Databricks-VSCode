import * as vscode from 'vscode';

import { WorkspaceItemLanguage } from './vscode/treeviews/workspaces/_types';
import { DatabricksConnectionManager } from './vscode/treeviews/connections/DatabricksConnectionManager';
import { iDatabricksConnection } from './vscode/treeviews/connections/iDatabricksConnection';
import { DatabricksConnectionManagerVSCode } from './vscode/treeviews/connections/DatabricksConnectionManagerVSCode';
import { SensitiveValueStore } from './vscode/treeviews/connections/_types';
import { DatabricksConnectionManagerCLI } from './vscode/treeviews/connections/DatabricksConnectionManagerCLI';
import { DatabricksKernel } from './vscode/notebook/DatabricksKernel';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export abstract class ThisExtension {

	private static _context: vscode.ExtensionContext;
	private static _extension: vscode.Extension<any>;
	private static _statusBar: vscode.StatusBarItem;
	private static _isValidated: boolean = false;
	private static _logger: vscode.OutputChannel;
	private static _connectionManager: DatabricksConnectionManager;
	private static _settingScope: ConfigSettingSource;
	private static _sensitiveValueStore: SensitiveValueStore;
	private static _sqlClusterId: string;
	

	static get rootPath(): vscode.Uri {
		return vscode.Uri.file(this._context.extensionPath);
	}

	static get rootUri(): vscode.Uri {
		return this._context.extensionUri;
	}

	static get extensionContext(): vscode.ExtensionContext {
		return this._context;
	}

	static get secrets(): vscode.SecretStorage {
		return this._context.secrets;
	}

	static get ActiveConnectionName(): string {
		if (!this.ActiveConnection) {
			return this.ConnectionManager.LastActiveConnectionName;
		}
		return this.ActiveConnection.displayName;
	}

	static ActiveConnection: iDatabricksConnection;

	static get RefreshAfterUpDownload(): boolean {
		return true;
	}

	static get IsValidated(): boolean {
		return this._isValidated;
	}

	static async initialize(context: vscode.ExtensionContext): Promise<boolean> {
		try {
			this._logger = vscode.window.createOutputChannel(context.extension.id);
			this.log("Logger initialized!");

			this._extension = context.extension;
			this.log(`Loading VS Code extension '${context.extension.packageJSON.displayName}' (${context.extension.packageJSON.id}) version ${context.extension.packageJSON.version} ...`);
			this.log(`If you experience issues please open a ticket at ${context.extension.packageJSON.qna}`);

			this._context = context;			

			ThisExtension.readGlobalSettings();

			let connectionManager = this.getConfigurationSetting("databricks.connectionManager");
			switch (connectionManager.value) {
				case "VSCode Settings":
					this._connectionManager = new DatabricksConnectionManagerVSCode();
					break;
				case "Databricks CLI Profiles":
					this._connectionManager = new DatabricksConnectionManagerCLI();
					break;
				default:
					this.log("'" + connectionManager + "' is not a valid value for config setting 'databricks.connectionManager!");
			}

			await this.ConnectionManager.initialize();

			return true;
		} catch (error) {
			return false;
		}
	}

	static dispose(): void {
		
	}

	private static readGlobalSettings(): void {
		let settingScope: ConfigSettingSource = "Workspace";

		ThisExtension.log("Trying to get config from Workspace settings ...");
		let workspaceConnections = ThisExtension.getConfigurationSetting<iDatabricksConnection[]>('databricks.connections', settingScope);
		let workspaceDefaultConnection = ThisExtension.getConfigurationSetting<string>('databricks.connection.default.displayName', settingScope);

		if (workspaceConnections.value || workspaceDefaultConnection.value) {
			ThisExtension.log("Workspace settings found and using them! (User-Settings are ignored)");
			this._settingScope = "Workspace";
		}
		else {
			ThisExtension.log("No Workspace settings found! Trying to get User-Settings instead ...");
			this._settingScope = "Global";
		}

		let svs = ThisExtension.getConfigurationSetting<SensitiveValueStore>('databricks.sensitiveValueStore', this._settingScope, true);

		this._sensitiveValueStore = svs.value;
	}

	static get SettingScope(): ConfigSettingSource {
		return this._settingScope;
	}

	static get SensitiveValueStore(): SensitiveValueStore {
		return this._sensitiveValueStore;
	}

	static get ConnectionManager(): DatabricksConnectionManager {
		return this._connectionManager;
	}

	static get SQLClusterID(): string {
		return this._sqlClusterId;
	}

	static set SQLClusterID(value: string) {
		if(value != undefined)
		{
			ThisExtension.log(`Using cluster with id '${value}' for SQL Browser!`);
			this._sqlClusterId = value;
			vscode.commands.executeCommand("databricksSQL.refresh", false);
		}
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
		let value = this.secrets.get(setting); 
	
		return value;
	}

	static async setSecureSetting(setting: string, value: string): Promise<void> {
		// changing the way we store secrets and make sure we are backward compatible
		await this.secrets.store(setting, value);
	}

	static getConfigurationSetting<T = string>(setting: string, source?: ConfigSettingSource, allowDefaultValue: boolean = false): ConfigSetting<T> {
		// usage: ThisExtension.getConfigurationSetting('databricks.connection.default.displayName')

		let value = vscode.workspace.getConfiguration().get(setting) as T;
		let inspect = vscode.workspace.getConfiguration().inspect(setting);

		if (!source) {
			// if no source was specified we use the most specific value that exists.
			if (inspect.workspaceValue != undefined || inspect.workspaceFolderValue != undefined || inspect.workspaceLanguageValue != undefined || inspect.workspaceFolderLanguageValue != undefined) {
				source = "Workspace";
			}
			else if (inspect.globalValue != undefined || inspect.globalLanguageValue != undefined) {
				source = "Global";
			}
			else {
				source = "Default";
			}
		}

		if (source == "Global") {
			value = (inspect.globalValue ?? inspect.globalLanguageValue) as T;
		}
		else if (source == "Workspace") {
			value = (inspect.workspaceValue ?? inspect.workspaceFolderValue ?? inspect.workspaceLanguageValue ?? inspect.workspaceFolderLanguageValue) as T;
		}

		if (source == "Default" || (allowDefaultValue && !value)) {
			value = (inspect.defaultValue ?? inspect.defaultLanguageValue) as T;
		}

		return {
			setting: inspect.key,
			value: value,
			inspect: inspect,
			source: source
		};
	}

	static async updateConfigurationSetting(setting: string, value: any, target: ConfigSettingSource = this._settingScope): Promise<void> {
		let finalTarget: vscode.ConfigurationTarget = undefined;

		switch (target) {
			case "Workspace":
				finalTarget = vscode.ConfigurationTarget.Workspace;
				break;

			case "Global":
				finalTarget = vscode.ConfigurationTarget.Global;
				break;

			default:
				finalTarget = vscode.ConfigurationTarget.Workspace;
				break;
		}
		vscode.workspace.getConfiguration().update(setting, value, finalTarget);
	}

	static async updateConfigurationSettingByConfigSetting(configSetting: ConfigSetting<any>, target: vscode.ConfigurationTarget): Promise<void> {
		vscode.workspace.getConfiguration().update(configSetting.setting, configSetting.value, target);
	}

	static get useProxy(): boolean {
		let httpProxySupport: ConfigSetting<string> = ThisExtension.getConfigurationSetting<string>("http.proxySupport");

		// only check if proxySupport is explicitly set to "off"
		if (httpProxySupport.value == "off") {
			this.log('Proxy support is disabled due to setting "http.proxySupport": "off"!');
			return false;
		}

		if (httpProxySupport.value == "on") {
			this.log('Proxy support is enabled due to setting "http.proxySupport": "on"!');
			return true;
		}

		return undefined;
	}

	static get rejectUnauthorizedSSL(): boolean {
		let httpProxyStrictSSL: ConfigSetting<boolean> = ThisExtension.getConfigurationSetting<boolean>("http.proxyStrictSSL");

		// check if Strict Proxy SSL is NOT enabled
		if (httpProxyStrictSSL.value) {
			if (httpProxyStrictSSL.source != "Default") {
				this.log('Strict Proxy SSL verification enabled due to setting "http.proxyStrictSSL": true !');
			}
		}
		else
		{
			this.log('Strict Proxy SSL verification disabled due to setting "http.proxyStrictSSL": false !');
		}

		return httpProxyStrictSSL.value;
	}

	static PushDisposable(item: any)
	{
		this.extensionContext.subscriptions.push(item);
	}

	static GetDisposable(id: string): vscode.Disposable
	{
		return this.extensionContext.subscriptions.find((x: any) => x.id == id)
	}

	static RemoveDisposable(id: string)
	{
		let item: vscode.Disposable = this.GetDisposable(id);

		if(item)
		{
			item.dispose();
		}
	}

	static DisposableExists(id: string): boolean {
		if(this.GetDisposable(id))
		{
			return true;
		}
		return false;
	}

	

	// #region StatusBar
	static set StatusBar(value: vscode.StatusBarItem) {
		this._statusBar = value;
	}

	static get StatusBar(): vscode.StatusBarItem {
		return this._statusBar;
	}

	static setStatusBar(text: string, inProgress: boolean = false): void {
		if(inProgress)
		{
			this.StatusBar.text = "$(loading~spin) " + text;
		}
		else
		{
			this.StatusBar.text = text;
		}
		
	}
	//#endregion
}

// represents the structure how the ExportFormats and FileExtensions for the different language are defined in the VS Code settings
export type ExportFormatsConfiguration = {
	Scala: string;
	Python: string;
	R: string;
	SQL: string;
};

export type LocalSyncSubfolderConfiguration = {
	Workspace: string;
	Clusters: string;
	DBFS: string;
	Jobs: string;
};

export type ConfigSettingSource =
	"Workspace"
	| "Global"
	| "Default"
	;

export interface ConfigSetting<T> {
	setting: string;
	value: T;
	inspect;
	source: ConfigSettingSource;
}


