import * as vscode from 'vscode';
import * as os from 'os';
import * as Path from 'path';
import * as fs from 'fs';
import * as UniqueFileName from 'uniquefilename';
import { Helper } from './helpers/Helper';
import { ActiveDatabricksEnvironment } from './environments/ActiveDatabricksEnvironment';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export abstract class ThisExtension {
	static extension_id = 'paiqo.databricks-vscode';

	private static _context: vscode.ExtensionContext;
	private static _extension: vscode.Extension<any>;
	private static _activeEnvironmentName: string;
	private static _isValidated: boolean;
	private static _logger: vscode.OutputChannel;

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
		this.validateSettings();
		
		this._activeEnvironmentName = ActiveDatabricksEnvironment.displayName;
	}

	static log(text: string, newLine: boolean = true): void {
		if(newLine) {
			this._logger.appendLine(text);
		}
		else{
			this._logger.appendLine(text);
		}
	}

	static validateSettings(): void {
		this.log("Validating settings ...");
		let config = this._extension.packageJSON.contributes.configuration[0];
		let requiredSettings = config.required;

		this._isValidated = true;
		for(let setting of requiredSettings) {
			let currentValue = vscode.workspace.getConfiguration().get(setting);

			if(currentValue == undefined || currentValue == null || currentValue == "") {
				this._isValidated = false;
				vscode.window.showErrorMessage("Databricks not configured correctly! Please populate all mandatory configuration settings in VSCode settings!");
				//let settingConfig = config.properties[setting];
				//let newValue = Helper.showInputBox(settingConfig.default, settingConfig.description);
				//vscode.workspace.getConfiguration().update(setting, newValue, vscode.ConfigurationTarget.Workspace);
			}
		}

		this.log("Settings validated!");
	}

	static get configuration(): any {
		return this._extension;
	}
}

// represents the structure how the ExportFormats and FileExtensions for the different language are defined in the VS Code settings
export type ExportFormatsConfiguration = {
	Scala: string;
	Python: string;
	R: string;
	SQL: string;
};