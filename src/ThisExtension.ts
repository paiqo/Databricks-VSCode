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
	private static _tempFiles: string[];
	private static _activeEnvironment: string;
	private static _isValidated: boolean;

	static get rootPath(): string {
		return this._context.extensionPath;
	}

	static set ActiveEnvironment(displayName: string) {
		this._activeEnvironment = displayName;
	}

	static get ActiveEnvironment(): string {
		return this._activeEnvironment;
	}

	static get IsValidated(): boolean {
		return this._isValidated;
	}

	static initialize(context: vscode.ExtensionContext): void {
		this._context = context;
		this._extension = vscode.extensions.getExtension(this.extension_id);
		this.validateSettings();
		
		this._activeEnvironment = ActiveDatabricksEnvironment.displayName;
	}

	static validateSettings(): void {
		let config = this._extension.packageJSON.contributes.configuration[0];
		let requiredSettings = config.required;

		this._isValidated = true;
		for(let setting in requiredSettings) {
			let currentValue = vscode.workspace.getConfiguration().get(requiredSettings[setting]);

			if(currentValue == undefined || currentValue == null || currentValue == "") {
				this._isValidated = false;
				vscode.window.showErrorMessage("Databricks not configured correctly! Please populate all mandatory configuration settings in VSCode settings!");
				//let settingConfig = config.properties[setting];
				//let newValue = Helper.showInputBox(settingConfig.default, settingConfig.description);
				//vscode.workspace.getConfiguration().update(setting, newValue, vscode.ConfigurationTarget.Workspace);
			}
		}
	}

	static get configuration(): any {
		return this._extension;
	}
}
