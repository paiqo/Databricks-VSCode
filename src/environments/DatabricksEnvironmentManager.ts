import * as vscode from 'vscode';
import { CloudProvider } from './_types';
import { iDatabricksEnvironment } from './iDatabricksEnvironment';
import { Helper } from '../helpers/Helper';
import { ExportFormatsConfiguration, iWorkspaceConfiguration, iUserWorkspaceConfiguration, ThisExtension } from '../ThisExtension';
import { DatabricksEnvironment } from './DatabricksEnvironment';

export class DatabricksEnvironmentManager {

	private _workspaceConfig: iWorkspaceConfiguration;
	private _environments: DatabricksEnvironment[];
	private _activeEnvironment: iDatabricksEnvironment;

	constructor() {
		this._workspaceConfig = vscode.workspace.getConfiguration().get('databricks.workspaceConfiguration');

		if (this._workspaceConfig.workspaceGuid == undefined) {
			this._workspaceConfig.workspaceGuid = Helper.newGuid();
		}

		this.loadEnvironments();

		this.updateUserWorkspaceConfig();

		if (this._workspaceConfig.lastActiveEnvironment == undefined) {
			this._workspaceConfig.lastActiveEnvironment = this._environments[0].displayName;
		}
		this.activateEnvironment(this._workspaceConfig.lastActiveEnvironment);
	}

	loadEnvironments(): void {
		/*
		there are 3 different areas from where Connections can be loaded from:
		1) the VSCode Workspace configuration using a list of connections in setting 'databricks.connections'
		2) the VSCode Workspace configuration using the default connection populated via the GUI. Settings 'databricks.connection.default.*'
		3) the VSCode User/Machine configuration in setting 'databricks.userWorkspaceConfigurations' for the current workspaceGuid

		1) and 2) are used to add new or update existing connections hence they have priority over 3)
		*/

		this._environments = this.getConnectionsFromWorkspace();

		let defaultConnectionFromWorkspace = this.getDefaultConnectionFromWorkspace();
		let connectionsFromUserConfig = this.getConnectionsFromUserConfig();

		if (!this._environments.map((x) => x.displayName).includes(defaultConnectionFromWorkspace.displayName) && defaultConnectionFromWorkspace.isValid) {
			this._environments.push(defaultConnectionFromWorkspace);
		}

		let newConnectionsFromWorkspace: DatabricksEnvironment[] = connectionsFromUserConfig.filter((x) => !(this._environments.map((y) => y.displayName).includes(x.displayName)));

		this._environments = this._environments.concat(newConnectionsFromWorkspace);
	}

	activateEnvironment(displayName: string): iDatabricksEnvironment {

		let filteredEnvironments: iDatabricksEnvironment[] = this.Environments.filter((x) => x.displayName == displayName);

		if (filteredEnvironments.length == 1) {
			this._activeEnvironment = filteredEnvironments[0];
			this._workspaceConfig.lastActiveEnvironment = displayName;
			this.updateWorkspaceConfig();

			return this._activeEnvironment;
		}
		else {
			throw new Error("Environment with name  '" + displayName + "' could not be found!");
		}
	}

	private getConnectionsFromUserConfig(): DatabricksEnvironment[] {
		let currentUserWorkspaceConfig: iUserWorkspaceConfiguration = this.CurrentUserWorkspaceConfiguration;

		let updatedUserWorkspaceConfigs: iUserWorkspaceConfiguration[] = [];

		if (currentUserWorkspaceConfig != undefined) {
			return currentUserWorkspaceConfig.connections as DatabricksEnvironment[];
		}
		else {
			return [];
		}
	}

	private getConnectionsFromWorkspace(): DatabricksEnvironment[] {
		let envs: DatabricksEnvironment[] = vscode.workspace.getConfiguration().get('databricks.connections');

		return envs;
	}

	private getDefaultConnectionFromWorkspace(): DatabricksEnvironment {
		let defaultCon: DatabricksEnvironment = new DatabricksEnvironment();
		defaultCon.displayName = vscode.workspace.getConfiguration().get('databricks.connection.default.displayName');
		defaultCon.cloudProvider = vscode.workspace.getConfiguration().get('databricks.connection.default.cloudProvider');
		defaultCon.apiRootUrl = vscode.workspace.getConfiguration().get('databricks.connection.default.apiRootUrl');
		defaultCon.personalAccessToken = vscode.workspace.getConfiguration().get('databricks.connection.default.personalAccessToken');
		defaultCon.localSyncFolder = vscode.workspace.getConfiguration().get('databricks.connection.default.localSyncFolder');

		defaultCon.databricksConnectJars = vscode.workspace.getConfiguration().get('databricks.connection.default.databricksConnectJars');
		defaultCon.pythonInterpreter = vscode.workspace.getConfiguration().get('databricks.connection.default.pythonInterpreter');
		defaultCon.port = vscode.workspace.getConfiguration().get<number>('databricks.connection.default.port');
		defaultCon.organizationId = vscode.workspace.getConfiguration().get('databricks.connection.default.organizationId');
		defaultCon.exportFormatsConfiguration = vscode.workspace.getConfiguration().get<ExportFormatsConfiguration>('databricks.connection.default.exportFormats');

		let allowAllSupportedFileExtensions: boolean = true;

		return defaultCon;
	}

	private cleanConnectionsFromConfig(): void {
		vscode.workspace.getConfiguration().update('databricks.connections', undefined, vscode.ConfigurationTarget.Workspace);
	}

	private cleanDefaultConnectionFromConfig(): void {
		vscode.workspace.getConfiguration().update('databricks.connection.default.displayName', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.cloudProvider', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.apiRootUrl', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.personalAccessToken', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.localSyncFolder', undefined, vscode.ConfigurationTarget.Workspace);

		vscode.workspace.getConfiguration().update('databricks.connection.default.databricksConnectJars', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.pythonInterpreter', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.port', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.organizationId', undefined, vscode.ConfigurationTarget.Workspace);
		vscode.workspace.getConfiguration().update('databricks.connection.default.exportFormats', undefined, vscode.ConfigurationTarget.Workspace);
	}

	private updateWorkspaceConfig(): void {
		vscode.workspace.getConfiguration().update('databricks.workspaceConfiguration', this._workspaceConfig, vscode.ConfigurationTarget.Workspace);
	}

	private get CurrentWorkspaceConfiguration(): iUserWorkspaceConfiguration {
		return {
			"workspaceConfig": this._workspaceConfig,
			"connections": this.Environments
		};
	}

	private get AllUserWorkspaceConfigurations(): iUserWorkspaceConfiguration[] {
		let allUserWorkspaceConfigs: iUserWorkspaceConfiguration[] = vscode.workspace.getConfiguration().get('databricks.userWorkspaceConfigurations');

		return allUserWorkspaceConfigs;
	}

	private get CurrentUserWorkspaceConfiguration(): iUserWorkspaceConfiguration {
		let allUserWorkspaceConfigs: iUserWorkspaceConfiguration[] = this.AllUserWorkspaceConfigurations;

		let currentUserWorkspaceConfig: iUserWorkspaceConfiguration[] = allUserWorkspaceConfigs.filter((x) => x.workspaceConfig.workspaceGuid == this._workspaceConfig.workspaceGuid);

		if (currentUserWorkspaceConfig.length == 1) {
			return currentUserWorkspaceConfig[0];
		}
		else if (currentUserWorkspaceConfig.length == 0) {
			return undefined;
		}

		throw new Error("There is an error in your User Workspace Configurations ('databricks.userWorkspaceConfigurations'). Please make sure all 'workspaceGuid' are unique!");
	}

	private updateUserWorkspaceConfig(): void {
		ThisExtension.log("Updating user setting 'databricks.userWorkspaceConfigurations' ...");
		let AllUserWorkspaceConfigurations: iUserWorkspaceConfiguration[] = this.AllUserWorkspaceConfigurations;
		let currentUserWorkspaceConfig: iUserWorkspaceConfiguration = this.CurrentUserWorkspaceConfiguration;

		let updatedUserWorkspaceConfigs: iUserWorkspaceConfiguration[] = [];

		if (currentUserWorkspaceConfig != undefined) {
			// get the original userWorkspaceConfigs except for the current one basically leaving all others unchanged
			updatedUserWorkspaceConfigs = AllUserWorkspaceConfigurations.filter((x) => x.workspaceConfig.workspaceGuid != this._workspaceConfig.workspaceGuid);
			// append the current/changed WorkspaceConfig
			updatedUserWorkspaceConfigs.push(this.CurrentWorkspaceConfiguration);
		}
		else {
			updatedUserWorkspaceConfigs = AllUserWorkspaceConfigurations;
			updatedUserWorkspaceConfigs.push(currentUserWorkspaceConfig);
		}

		let update = vscode.workspace.getConfiguration().update('databricks.userWorkspaceConfigurations', updatedUserWorkspaceConfigs, vscode.ConfigurationTarget.Global);
		update.then((x) =>
			ThisExtension.log("User setting 'databricks.userWorkspaceConfigurations' was updated!")
		);

		ThisExtension.log("Removing workspace settings 'databricks.*' as they have been persisted in the user settings!");
		this.cleanConnectionsFromConfig();
		this.cleanDefaultConnectionFromConfig();
	}

	get ActiveEnvironment(): iDatabricksEnvironment {
		return this._activeEnvironment;
	}

	get ActiveEnvironmentName(): string {
		return this.ActiveEnvironment.displayName;
	}



	get Environments(): DatabricksEnvironment[] {
		return this._environments;
	}


}