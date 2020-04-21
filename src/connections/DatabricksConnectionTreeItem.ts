import * as vscode from 'vscode';
import * as fspath from 'path';
import { ThisExtension, ExportFormatsConfiguration } from '../ThisExtension';
import { CloudProvider } from './_types';
import { iDatabricksConnection } from './iDatabricksConnection';
import { Helper } from '../helpers/Helper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksConnectionTreeItem extends vscode.TreeItem implements iDatabricksConnection {
	_displayName: string;
	_cloudProvider: CloudProvider;
	_personalAccessToken: string;
	_apiRootUrl: string;
	_localSyncFolder: string;
	_databricksConnectJars: string;
	_pythonInterpreter: string;
	_port: number;
	_organizationId: string;
	_isActive: boolean;
	_exportFormats: ExportFormatsConfiguration;

	constructor(
		displayName: string,
		cloudProvider: CloudProvider,
		personalAccessToken: string,
		apiRootUrl: string,
		localSyncFolder: string,
		databricksConnectJars: string = undefined,
		pythonInterpreter: string = undefined,
		port: number = 15001,
		organizationId: string = undefined,
		exportFormats: ExportFormatsConfiguration = undefined
	) {
		super(displayName);
		this._displayName = displayName;
		this._cloudProvider = cloudProvider;
		this._personalAccessToken = personalAccessToken;
		this._apiRootUrl = Helper.trimChar(apiRootUrl, '/', false, true);
		//this._localSyncFolder = Helper.trimChar(localSyncFolder, '/');
		this._localSyncFolder = localSyncFolder;
		this._databricksConnectJars = databricksConnectJars;
		this._pythonInterpreter = pythonInterpreter;
		this._port = port;
		this._organizationId = organizationId;
		this._exportFormats = exportFormats;

		this._isActive = this.displayName === ThisExtension.ActiveConnectionName;

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
		// Connections are never expandable
		super.collapsibleState = undefined;

		this._isActive = false;
	}

	get tooltip(): string {
		return `${this.displayName} (${this.cloudProvider})`;
	}

	// description is show next to the label
	get description(): string {
		return `${this.localSyncFolder}`;
	}

	// used in package.json to filter commands via viewItem == ACTIVE
	get contextValue(): string {
		if (this.displayName == ThisExtension.ActiveConnectionName) {
			return 'ACTIVE';
		}
		return 'INACTIVE';
	}

	private getIconPath(theme: string): string {
		let state = this.isActive ? 'connected' : 'disconnected';
		return fspath.join(ThisExtension.rootPath, 'resources', theme, state + '.png');
	}


	get displayName(): string {
		return this._displayName;
	}

	get cloudProvider(): CloudProvider {
		return this._cloudProvider;
	}

	get apiRootUrl(): string {
		return this._apiRootUrl;
	}

	get personalAccessToken(): string {
		return this._personalAccessToken;
	}

	get localSyncFolder(): string {
		return this._localSyncFolder;
	}

	get databricksConnectJars(): string {
		return this._databricksConnectJars;
	}

	get pythonInterpreter(): string {
		return this._pythonInterpreter;
	}

	get port(): number {
		return this._port;
	}

	get organizationId(): string {
		return this._organizationId;
	}

	get exportFormats(): ExportFormatsConfiguration {
		return this._exportFormats;
	}


	get isActive(): boolean {
		return this._isActive;
	}

	static fromJson(jsonString: string): DatabricksConnectionTreeItem {
		let item: iDatabricksConnection = JSON.parse(jsonString);
		return DatabricksConnectionTreeItem.fromConnection(item);
	}

	static fromConnection(Connection: iDatabricksConnection) {
		return new DatabricksConnectionTreeItem(
			Connection.displayName,
			Connection.cloudProvider,
			Connection.personalAccessToken,
			Connection.apiRootUrl,
			Connection.localSyncFolder,
			Connection.databricksConnectJars,
			Connection.pythonInterpreter,
			Connection.port,
			Connection.organizationId);
	}

	activate(): void {
		vscode.window.showInformationMessage(`Activating Databricks Connection '${this.displayName}' ...`);

		ThisExtension.ConnectionManager.activateConnection(this.displayName);
		/*
		vscode.workspace.getConfiguration().update('databricks.connection.default.displayName', this.displayName, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.cloudProvider', this.cloudProvider, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.apiRootUrl', this.apiRootUrl, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.personalAccessToken', this.personalAccessToken, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.localSyncFolder', this.localSyncFolder, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.databricksConnectJars', this.databricksConnectJars, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.pythonInterpreter', this.pythonInterpreter, vscode.ConfigurationTarget.Workspace);

		// update the venvPath for Databricks-Connect
		//vscode.workspace.getConfiguration().update('python.venvPath', this.databricksConnectJars, vscode.ConfigurationTarget.Workspace);
		//vscode.workspace.getConfiguration().update('python.venvPath', this.databricksConnectJars, vscode.ConfigurationTarget.Global);
		vscode.workspace.getConfiguration().update('python.linting.enabled', false, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('python.linting.enabled', false, vscode.ConfigurationTarget.Global);

		// update the actual Python interpreter
		vscode.workspace.getConfiguration().update('python.pythonPath', this.pythonInterpreter, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('python.pythonPath', this.pythonInterpreter, vscode.ConfigurationTarget.Global);
		*/

		this._isActive = true;

		//Helper.delay(1000);

		vscode.commands.executeCommand("DatabricksConnections.refresh", false);
		vscode.commands.executeCommand("databricksWorkspace.refresh", false);
		vscode.commands.executeCommand("databricksClusters.refresh", false);
		vscode.commands.executeCommand("databricksJobs.refresh", false);
		vscode.commands.executeCommand("databricksFS.refresh", false);
		vscode.commands.executeCommand("databricksSecrets.refresh", false);
	}
}
