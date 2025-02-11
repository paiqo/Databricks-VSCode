import * as vscode from 'vscode';

import { DatabricksConnectionManager } from './vscode/treeviews/connections/DatabricksConnectionManager';
import { iDatabricksConnection } from './vscode/treeviews/connections/iDatabricksConnection';
import { DatabricksConnectionManagerVSCode } from './vscode/treeviews/connections/DatabricksConnectionManagerVSCode';
import { ConnectionManager, SensitiveValueStore } from './vscode/treeviews/connections/_types';
import { DatabricksConnectionManagerCLI } from './vscode/treeviews/connections/DatabricksConnectionManagerCLI';
import { DatabricksConnectionManagerManualInput } from './vscode/treeviews/connections/DatabricksConnectionManagerManualInput';
import { DatabricksConnectionManagerAzure } from './vscode/treeviews/connections/DatabricksConnectionManagerAzure';
import { DatabricksConnectionManagerDatabricks } from './vscode/treeviews/connections/DatabricksConnectionManagerDatabricks';
import { ENVIRONMENT } from '@env/env';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export abstract class ThisExtension {

	static readonly DBFS_SCHEME = "dbfs";
	static readonly WORKSPACE_SCHEME = "wsfs";
	static readonly WORKSPACE_SCHEME_LEGACY = "dbws";

	private static _context: vscode.ExtensionContext;
	private static _extension: vscode.Extension<any>;
	private static _statusBar: vscode.StatusBarItem;
	private static _isValidated: boolean = false;
	private static _logger: vscode.OutputChannel;
	private static _connectionManagerText: ConnectionManager;
	private static _connectionManager: DatabricksConnectionManager;
	private static _settingScope: ConfigSettingSource;
	private static _sensitiveValueStore: SensitiveValueStore;
	private static _sqlClusterId: string;

	public static ActiveConnection: iDatabricksConnection;

	static get rootUri(): vscode.Uri {
		return this._context.extensionUri;
	}

	static get extensionContext(): vscode.ExtensionContext {
		return this._context;
	}

	static set extensionContext(value: vscode.ExtensionContext) {
		this._context = value;
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

	static get RefreshAfterUpDownload(): boolean {
		return true;
	}

	static get IsValidated(): boolean {
		return this._isValidated;
	}

	static async initialize(context: vscode.ExtensionContext): Promise<boolean> {
		try {
			this._context = context;
			this._extension = context.extension;
			this.log(`Loading VS Code extension '${context.extension.packageJSON.displayName}' (${context.extension.packageJSON.id}) version ${context.extension.packageJSON.version} ...`);
			this.log(`If you experience issues please open a ticket at ${context.extension.packageJSON.qna}`);

			ThisExtension.readGlobalSettings();

			this._connectionManagerText = undefined;
			let connectionManager = this.getConfigurationSetting<ConnectionManager>("databricks.connectionManager", this.SettingScope, true);
			let conManager: ConnectionManager = connectionManager.value;

			// handle default
			if (conManager == "Default") {
				ThisExtension.log("Default connection manager selected. Trying to find the best connection manager ...")
				if (ThisExtension.isInBrowser) {
					ThisExtension.log("Using Azure connection manager as it works best from the browser ...");
					conManager = "Azure";
				}
				else if (vscode.extensions.getExtension("databricks.databricks")) {
					ThisExtension.log("Databricks Extension found. Using it as connection manager ...");
					conManager = "Databricks Extension";
				}
				else {
					ThisExtension.log("Databricks Extension not found. Using VSCode Settings as connection manager ...");
					conManager = "VSCode Settings";
					// should open workspace settings with a filter but the filter is not yet working
					vscode.commands.executeCommand("workbench.action.openWorkspaceSettings", ThisExtension.configuration.id);
				}

				this._connectionManagerText = conManager;
			}

			switch (conManager) {

				case "VSCode Settings":
					this._connectionManager = new DatabricksConnectionManagerVSCode();
					break;
				case "Databricks CLI Profiles":
					this._connectionManager = new DatabricksConnectionManagerCLI();
					break;
				case "Azure":
					this._connectionManager = new DatabricksConnectionManagerAzure();
					break;
				case "Databricks Extension":
					this._connectionManager = new DatabricksConnectionManagerDatabricks();
					break;
				case "Manual":
					this._connectionManager = new DatabricksConnectionManagerManualInput();
					break;
				default:
					this.log("'" + connectionManager + "' is not a valid value for config setting 'databricks.connectionManager!");
			}

			this._connectionManagerText = conManager

			await this.ConnectionManager.initialize();

			await this.setContext();

			this.refreshUI();

			return true;
		} catch (error) {
			return false;
		}
	}

	

	public static async refreshUI(): Promise<void> {
		// refresh all treeviews after the extension has been initialized
		const allCommands = await vscode.commands.getCommands(true);

		for (let command of allCommands) {
			if (command.match(/^databricks.*?\.refresh/)) {
				vscode.commands.executeCommand(command, undefined, false);
			}
		}
	}

	static dispose(): void {

	}

	private static async setContext(): Promise<void> {
		// we hide the Connections Tab as we load all information from the Databricks Extension
		await vscode.commands.executeCommand(
			"setContext",
			"paiqo.databricks.hideConnectionManager",
			this._connectionManagerText == "Databricks Extension"
		);

		await vscode.commands.executeCommand(
			"setContext",
			"paiqo.databricks.connectionManager",
			this._connectionManagerText
		);

		await vscode.commands.executeCommand(
			"setContext",
			"paiqo.databricks.isInBrowser",
			this.isInBrowser
		);
	}

	private static readGlobalSettings(): void {
		let settingScope: ConfigSettingSource = "Workspace";

		ThisExtension.log("Trying to get config from Workspace settings ...");
		let workspaceConnectionManager = ThisExtension.getConfigurationSetting<iDatabricksConnection[]>('databricks.connectionManager', settingScope);
		let workspaceConnections = ThisExtension.getConfigurationSetting<iDatabricksConnection[]>('databricks.connections', settingScope);
		let workspaceDefaultConnection = ThisExtension.getConfigurationSetting<string>('databricks.connection.default.displayName', settingScope);

		if (workspaceConnections.value || workspaceDefaultConnection.value || workspaceConnectionManager.value) {
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

	static set ConnectionManager(value: DatabricksConnectionManager) {
		this._connectionManager = value;
	}

	static get ConnectionManagerText(): ConnectionManager {
		return this._connectionManagerText;
	}

	static get SQLClusterID(): string {
		return this._sqlClusterId;
	}

	static get WorkspaceRootPath(): string {	
		const workspaceRootFolder = ThisExtension.getConfigurationSetting<string>("databricks.workspace.root", ThisExtension.SettingScope, true).value;

		return workspaceRootFolder;
	}

	static set SQLClusterID(value: string) {
		if (value != undefined) {
			ThisExtension.log(`Using cluster with id '${value}' for SQL Browser!`);
			this._sqlClusterId = value;
			vscode.commands.executeCommand("databricksSQL.refresh", undefined, false);
		}
	}

	static log(text: string, newLine: boolean = true): void {
		if (newLine) {
			this._logger.appendLine(text);
		}
		else {
			this._logger.append(text);
		}
	}

	static get IsDevelopmentMode(): boolean {
		return this._context.extensionMode == vscode.ExtensionMode.Development;
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

	static get isInBrowser(): boolean {
		return ENVIRONMENT == "web";

		/*
		// legacy code
		if (this._isInBrowser == undefined) {
		// some features are disabled if we are in the browser - this seems to work for all cases I found so far
		this._isInBrowser = vscode.env.uiKind === vscode.UIKind.Web || process.hasOwnProperty("browser") && process["browser"];
		}
		return this._isInBrowser
		*/
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
			return false;
		}

		if (httpProxySupport.value == "on") {
			return true;
		}

		return undefined;
	}

	static get useStrictSSL(): boolean {
		let httpProxyStrictSSL: ConfigSetting<boolean> = ThisExtension.getConfigurationSetting<boolean>("http.proxyStrictSSL");

		// check if Strict Proxy SSL is NOT enabled
		if (httpProxyStrictSSL.value) {
			if (httpProxyStrictSSL.source != "Default") {
				this.log('Strict Proxy SSL verification enabled due to setting "http.proxyStrictSSL": true !');
			}
		}
		else {
			this.log('Strict Proxy SSL verification disabled due to setting "http.proxyStrictSSL": false !');
		}

		return httpProxyStrictSSL.value;
	}

	static PushDisposable(item: any) {
		this.extensionContext.subscriptions.push(item);
	}

	static GetDisposable(id: string): vscode.Disposable {
		return this.extensionContext.subscriptions.find((x: any) => x.id == id)
	}

	static RemoveDisposable(id: string) {
		let item: vscode.Disposable = this.GetDisposable(id);

		if (item) {
			item.dispose();
		}
	}

	static DisposableExists(id: string): boolean {
		if (this.GetDisposable(id)) {
			return true;
		}
		return false;
	}

	// #region Logger
	static set Logger(value: vscode.OutputChannel) {
		this._logger = value;
	}

	static get Logger(): vscode.OutputChannel {
		return this._logger;
	}
	//#endregion

	// #region StatusBar
	static set StatusBar(value: vscode.StatusBarItem) {
		this._statusBar = value;
	}

	static get StatusBar(): vscode.StatusBarItem {
		return this._statusBar;
	}

	static setStatusBar(text: string, inProgress: boolean = false): void {
		if (inProgress) {
			this.StatusBar.text = "$(loading~spin) " + text;
		}
		else {
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
	Clusters?: string;
	DBFS?: string;
	Jobs?: string;
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


