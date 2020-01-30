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

	static get rootPath(): string {
		return this._context.extensionPath;
	}

	static set ActiveEnvironment(displayName: string) {
		this._activeEnvironment = displayName;
	}

	static get ActiveEnvironment(): string {
		return this._activeEnvironment;
	}

	static initialize(context: vscode.ExtensionContext): void {
		this._context = context;

		this._extension = vscode.extensions.getExtension(this.extension_id);
		this._activeEnvironment = ActiveDatabricksEnvironment.displayName;

		this.validateSettings();
	}

	static validateSettings(): void {
		let config = this._extension.packageJSON.contributes.configuration[0];
		let requiredSettings = config.required;

		for(let setting in requiredSettings) {
			let currentValue = vscode.workspace.getConfiguration().get(requiredSettings[setting]);

			if(currentValue == undefined || currentValue == null) {
				let settingConfig = config.properties[setting];
				let newValue = Helper.showInputBox(settingConfig.default, settingConfig.description);
				vscode.workspace.getConfiguration().update(setting, newValue, vscode.ConfigurationTarget.Workspace);
			}
		}
	}

	static get configuration(): any {
		return this._extension;
	}

	static get tempFiles(): string[] {
		if(this._tempFiles == undefined) {
			return [];
		}
		return this._tempFiles;
	}

	static addTempFile(filePath: string): void {
		if(this._tempFiles == undefined) {
			this._tempFiles = [];
		}
		this._tempFiles.push(filePath);
	}

	static openTempFile(content: string = '', fileName: string = 'db-vscode-temp.json', ): string {
		const tempDir = this.resolvePath(os.tmpdir());
		const filePath = `${tempDir}${Path.sep}${fileName}`;
		const uniqueFilePath = UniqueFileName.get(filePath, {});

		uniqueFilePath.then( path => {
			fs.writeFile(path, content, (err) => vscode.window.showErrorMessage(err.message));
			this.addTempFile(path);

			vscode.workspace
				.openTextDocument(path)
				.then(vscode.window.showTextDocument);
			}
		);

		return uniqueFilePath;
	}

	static removeTempFiles(): void {
		for (const tempFile of ThisExtension.tempFiles)
		{
			fs.unlink(tempFile, (err) => vscode.window.showErrorMessage(err.message));
		}
	}

	private static resolvePath(filepath: string): string 
	{
		if (filepath[0] === '~')
		{
			const hoveVar = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
			return Path.join(process.env[hoveVar], filepath.slice(1));
		}
		else
		{
			return Path.resolve(filepath);
		}
	}
}
