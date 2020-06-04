import * as vscode from 'vscode';
import { CloudProvider } from './_types';
import { iDatabricksConnection } from './iDatabricksConnection';
import { ExportFormatsConfiguration, ThisExtension } from '../ThisExtension';

export class DatabricksConnection implements iDatabricksConnection {

	displayName: string;
	apiRootUrl: string;
	cloudProvider: CloudProvider;
	personalAccessToken: string;
	localSyncFolder: string;
	databricksConnectJars: string;
	pythonInterpreter: string;
	port: number;
	organizationId: string;
	exportFormats: ExportFormatsConfiguration;
	useCodeCells: boolean;

	constructor(
		config: iDatabricksConnection
	) {

		this.displayName = config.displayName;
		this.apiRootUrl = config.apiRootUrl;
		this.cloudProvider = config.cloudProvider;
		this.personalAccessToken = config.personalAccessToken;
		this.localSyncFolder = config.localSyncFolder;
		this.databricksConnectJars = config.databricksConnectJars;
		this.pythonInterpreter = config.pythonInterpreter;
		this.port = config.port;
		this.organizationId = config.organizationId;
		this.exportFormats = config.exportFormats;
		this.useCodeCells = config.useCodeCells;
	}

	private propertyIsValid(value): boolean {
		if (value != undefined && value != null && value != "") {
			return true;
		}
		return false;
	}

	validate(): boolean {
		let msg: string = null;

		// check mandatory properties and raise an error if necessary
		if (!this.propertyIsValid(this.displayName)) {
			msg = 'Configuration property "displayName" is not valid! Please check your user and/or workspace settings!';
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
			return false;
		}
		if (!this.propertyIsValid(this.apiRootUrl)) {
			msg = 'Configuration ' + this.displayName + ': Property "apiRootUrl" is not valid! Please check your user and/or workspace settings!';
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
			return false;
		}
		if (!this.propertyIsValid(this.personalAccessToken)) {
			msg = 'Configuration ' + this.displayName + ': Property "personalAccessToken" is not valid! Please check your user and/or workspace settings!';
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
			return false;
		}
		if (!this.propertyIsValid(this.localSyncFolder)) {
			msg = 'Configuration ' + this.displayName + ': Property "localSyncFolder" is not valid! Please check your user and/or workspace settings!';
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
			return false;
		}

		// check defaultvalues, etc.
		if (!this.propertyIsValid(this.exportFormats)) {
			// get the default from the config of this extension
			let defaultFromConfig = ThisExtension.configuration.packageJSON.contributes.configuration[0].properties["databricks.userWorkspaceConfigurations"].items.properties.connections.items.properties.exportFormats.default;
			this.exportFormats = defaultFromConfig;
			msg = 'Configuration ' + this.displayName + ': Property "exportFormats" was not provided - using the default value "' + defaultFromConfig + '"!';
			ThisExtension.log(msg);
			vscode.window.showWarningMessage(msg);
		}
		if (!this.propertyIsValid(this.cloudProvider)) {
			if (this.apiRootUrl.includes('azuredatabricks')) {
				this.cloudProvider = "Azure";
			}
			else {
				this.cloudProvider = "AWS";
			}
			msg = 'Configuration ' + this.displayName + ': Setting Configuration property "cloudProvider" to "' + this.cloudProvider + '" based on the property "apiRootUrl"';
			ThisExtension.log(msg);
		}
		if (!this.propertyIsValid(this.port) || this.port == 0) {
			// get the default from the config of this extension
			let defaultFromConfig = ThisExtension.configuration.packageJSON.contributes.configuration[0].properties["databricks.userWorkspaceConfigurations"].items.properties.connections.items.properties.port.default;
			this.port = defaultFromConfig;
			msg = 'Configuration ' + this.displayName + ': Property "port" was not provided - using the default value "' + defaultFromConfig + '"!';
			ThisExtension.log(msg);
			vscode.window.showWarningMessage(msg);
		}
		if (this.useCodeCells == undefined) { // this.propertyIsValid does not work for booleans !!!
			// get the default from the config of this extension
			let defaultFromConfig = ThisExtension.configuration.packageJSON.contributes.configuration[0].properties["databricks.userWorkspaceConfigurations"].items.properties.connections.items.properties.useCodeCells.default;
			this.useCodeCells = defaultFromConfig;
			msg = 'Configuration ' + this.displayName + ': Property "useCodeCells" was not provided - using the default value "' + defaultFromConfig + '"!';
			ThisExtension.log(msg);
			vscode.window.showWarningMessage(msg);
		}

		return true;
	}

	get allowAllSupportedFileExtensions(): boolean {
		return true;
	}
}