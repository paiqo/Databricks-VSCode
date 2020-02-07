import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../databricksApi/databricksApiService';
import { ThisExtension } from '../ThisExtension';
import { CloudProvider } from './_types';
import { iDatabricksEnvironment } from './iDatabricksEnvironment';
import { ActiveDatabricksEnvironment } from './ActiveDatabricksEnvironment';
import { Helper } from '../helpers/Helper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksEnvironmentTreeItem extends vscode.TreeItem implements iDatabricksEnvironment {
	_displayName:			string;
	_cloudProvider:			CloudProvider;
	_personalAccessToken:	string;
	_apiRootUrl: 			string;
	_localSyncFolder:		string;
	_databricksConnectJars:	string;
	_pythonInterpreter:		string;
	_port:					number;
	_organizationId:		string;
	_isActive:				boolean;
	
	constructor(
		displayName:			string,
		cloudProvider:			CloudProvider,
		personalAccessToken:	string,
		apiRootUrl: 			string,
		localSyncFolder:		string,
		databricksConnectJars:	string,
		pythonInterpreter:		string,
		port:					number = 15001,
		organizationId:			string = undefined
	) {
		super(displayName);
		this._displayName = displayName;
		this._cloudProvider = cloudProvider;
		this._personalAccessToken = personalAccessToken;
		this._apiRootUrl = apiRootUrl;
		this._localSyncFolder = localSyncFolder;
		this._databricksConnectJars = databricksConnectJars;
		this._pythonInterpreter = pythonInterpreter;
		this._port = port;
		this._organizationId = organizationId;

		this._isActive = this.displayName === ThisExtension.ActiveEnvironment;

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
		// Environments are never expandable
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
		if(this.displayName == ActiveDatabricksEnvironment.displayName)
		{
			return 'ACTIVE';
		}
		return 'INACTIVE';
	}

	private getIconPath(theme: string): string {
		let state = this.isActive ? 'connected' : 'disconnected';
		return fspath.join(ThisExtension.rootPath, 'resources', theme, state + '.svg');
	}


	get displayName (): string {
		return this._displayName;
	}

	get cloudProvider (): CloudProvider {
		return this._cloudProvider;
	}

	get apiRootUrl (): string {
		return this._apiRootUrl;
	}

	get personalAccessToken (): string {
		return this._personalAccessToken;
	}

	get localSyncFolder (): string {
		return this._localSyncFolder;
	}

	get databricksConnectJars (): string {
		return this._databricksConnectJars;
	}
	
	get pythonInterpreter (): string {
		return this._pythonInterpreter;
	}

	get port (): number {
		return this._port;
	}

	get organizationId (): string {
		return this._organizationId;
	}


	get isActive (): boolean {
		return this._isActive;
	}

	static fromJson(jsonString: string): DatabricksEnvironmentTreeItem {
		let item: iDatabricksEnvironment = JSON.parse(jsonString);
		return DatabricksEnvironmentTreeItem.fromEnvironment(item);
	}

	static fromEnvironment(environment: iDatabricksEnvironment) {
		return new DatabricksEnvironmentTreeItem(
			environment.displayName, 
			environment.cloudProvider, 
			environment.personalAccessToken, 
			environment.apiRootUrl, 
			environment.localSyncFolder, 
			environment.databricksConnectJars, 
			environment.pythonInterpreter,
			environment.port,
			environment.organizationId);
	}

	activate(): void {
		vscode.window.showInformationMessage(`Activating Databricks environment '${this.displayName}' ...`);
		
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


		this._isActive = true;
		ThisExtension.ActiveEnvironment = this.displayName;

		DatabricksApiService.initialize(this);
	
		//Helper.delay(1000);

		vscode.commands.executeCommand("databricksEnvironments.refresh", false);
		vscode.commands.executeCommand("databricksWorkspace.refresh", false);
		vscode.commands.executeCommand("databricksClusters.refresh", false);
		vscode.commands.executeCommand("databricksFS.refresh", false);
		vscode.commands.executeCommand("databricksSecrets.refresh", false);
	}
}
