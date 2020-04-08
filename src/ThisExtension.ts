import * as vscode from 'vscode';
import { ActiveDatabricksEnvironment } from './environments/ActiveDatabricksEnvironment';
import { WorkspaceItemLanguage } from './databricksApi/workspaces/_types';
import { DatabricksEnvironmentManager } from './environments/DatabricksEnvironmentManager';
import { Helper } from './helpers/Helper';
import { iDatabricksEnvironment } from './environments/iDatabricksEnvironment';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export abstract class ThisExtension {
	static extension_id = 'paiqo.databricks-vscode';

	private static _context: vscode.ExtensionContext;
	private static _extension: vscode.Extension<any>;
	private static _activeEnvironmentName: string;
	private static _isValidated: boolean;
	private static _logger: vscode.OutputChannel;
	private static _keytar;
	private static _environmentManager: DatabricksEnvironmentManager;

	static get rootPath(): string {
		return this._context.extensionPath;
	}

	static set ActiveEnvironmentName(displayName: string) {
		this._activeEnvironmentName = displayName;
	}

	static get ActiveEnvironmentName(): string {
		return this._activeEnvironmentName;
	}

	static get RefreshAfterUpDownload(): boolean {
		return true;
	}

	static get IsValidated(): boolean {
		return this._isValidated;
	}

	static initialize(context: vscode.ExtensionContext): void {
		this._logger = vscode.window.createOutputChannel(ThisExtension.extension_id);
		this.log("Logger initialized!");

		this._context = context;
		this._extension = vscode.extensions.getExtension(this.extension_id);

		this._environmentManager = new DatabricksEnvironmentManager();

		this.validateSettings();

		this._activeEnvironmentName = this.EnvironmentManager.ActiveEnvironmentName; // ActiveDatabricksEnvironment.displayName;

		this._keytar = require('keytar');


	}

	static cleanUp(): void {
		Helper.removeTempFiles();
	}

	static get EnvironmentManager(): DatabricksEnvironmentManager {
		return this._environmentManager;
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

		return extensions;
	}

	static allLanguageFileExtensions(language: WorkspaceItemLanguage): string[] {
		let config = ThisExtension.configuration.packageJSON.contributes.configuration[0];
		let exportFormats = config.properties["databricks.connection.default.exportFormats"].properties;

		let extensions: string[] = [];

		switch (language) {
			case "PYTHON":
				extensions = exportFormats["Python"]["enum"];
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

	static validateSettings(): void {
		this.log("Validating settings ...");

		if (this.EnvironmentManager.Environments.length == 0) {
			vscode.window.showErrorMessage("No environments have been configured! Please add new Environments using the VSCode Settings dialog!");
		}

		this.log("Settings validated!");
	}

	static get configuration(): vscode.Extension<any> {
		return this._extension;
	}

	static async getSecureSetting(setting: string): Promise<string> {
		let value: string = await this._keytar.getPassword(this.extension_id, setting);
		return value;
	}

	static async setSecureSetting(setting: string, value: string): Promise<void> {
		await this._keytar.setPassword(this.extension_id, setting, value);
	}
}

// represents the structure how the ExportFormats and FileExtensions for the different language are defined in the VS Code settings
export type ExportFormatsConfiguration = {
	Scala: string;
	Python: string;
	R: string;
	SQL: string;
};

// 
export interface iWorkspaceConfiguration {
	workspaceGuid: string;
	lastActiveEnvironment: string;
}

// represents the structure how the ExportFormats and FileExtensions for the different language are defined in the VS Code settings
export interface iUserWorkspaceConfiguration {
	workspaceConfig: iWorkspaceConfiguration;
	connections: iDatabricksEnvironment[];
}

