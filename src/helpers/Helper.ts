/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as os from 'os';
import * as fspath from 'path';
import * as fs from 'fs';
import * as UniqueFileName from 'uniquefilename';
import { ThisExtension } from '../ThisExtension';

export abstract class Helper {
	private static CodeCellTag: string = "# %% Code Cell";
	private static DatabricksCommandTag: string = "# COMMAND ----------";
	private static openAsNotebookSettingName: string = 'python.dataScience.useNotebookEditor';

	private static _tempFiles: string[];
	private static _doubleClickTimer: any;

	private static _openAsNotebookOriginalSetting: boolean;

	static async showQuickPick(
		items: string[],
		toolTip: string,
	): Promise<string> {
		let i = 0;
		const result = await vscode.window.showQuickPick(items, {
			placeHolder: toolTip
			/*,
			onDidSelectItem: item => window.showInformationMessage(`Focus ${++i}: ${item}`)
			*/
		});

		return result;
	}

	static async showInputBox(
		defaultValue: string,
		toolTip: string,
		valueSelection: [number, number] = undefined,
	): Promise<string> {
		const result = await vscode.window.showInputBox({
			value: defaultValue,
			valueSelection: valueSelection,
			placeHolder: toolTip,
			prompt: toolTip
			/*,
			validateInput: text => {
				window.showInformationMessage(`Validating: ${text}`);
				return text === '123' ? 'Not 123!' : null;
			}*/
		});

		return result;
	}


	static async delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	static mapToObject<T>(map: Map<string, any>): T {
		const obj = {};
		for (let [key, value] of map) {
			obj[key] = value;
		}
		return obj as T;
	}

	static ensureLocalFolder(path: string, pathIsFile: boolean = false): void {
		let folder = path;
		if (pathIsFile) {
			folder = fspath.dirname(path);
		}
		if (!fs.existsSync(folder)) {
			fs.mkdirSync(folder, { recursive: true });
		}
	}

	static sortArrayByProperty(unsortedArray: object[], property: string = "label", direction: "ASC" | "DESC" = "ASC") {
		let direction_num: number = (direction == "ASC" ? 1 : -1);

		unsortedArray.sort((t1, t2) => {
			const name1 = t1[property].toString().toLowerCase();
			const name2 = t2[property].toString().toLowerCase();
			if (name1 > name2) { return 1 * direction_num; }
			if (name1 < name2) { return -1 * direction_num; }
			return 0;
		});
	}

	static get tempFiles(): string[] {
		if (this._tempFiles == undefined) {
			return [];
		}
		return this._tempFiles;
	}

	static addTempFile(filePath: string): void {
		if (this._tempFiles == undefined) {
			this._tempFiles = [];
		}
		this._tempFiles.push(filePath);
	}

	static async openTempFile(content: string = '', fileName: string = 'db-vscode-temp.json', open: boolean = true): Promise<string> {
		let tempDir = this.resolvePath(os.tmpdir());
		let filePath = `${tempDir}${fspath.sep}${fileName}`;
		let uniqueFilePath = await UniqueFileName.get(filePath, {});


		fs.writeFile(uniqueFilePath, content, (err) => { if (err) { vscode.window.showErrorMessage(err.message); } });
		this.addTempFile(uniqueFilePath);

		if (open) {
			await Helper.wait(500);
			vscode.workspace
				.openTextDocument(uniqueFilePath)
				.then(vscode.window.showTextDocument);
		}

		return uniqueFilePath;
	}

	static removeTempFiles(): void {
		for (const tempFile of Helper.tempFiles) {
			fs.unlink(tempFile, (err) => { if (err) { vscode.window.showErrorMessage(err.message); } });
		}
	}

	private static initOpenAsNotebookOriginalSetting(): void {
		if (this._openAsNotebookOriginalSetting == undefined) {
			this._openAsNotebookOriginalSetting = ThisExtension.getConfigurationSetting<boolean>(this.openAsNotebookSettingName).value;
		}
	}

	static trimChar(text: string, charToRemove: string, fromLeft: boolean = true, fromRight: boolean = true) {
		if (text == undefined) { return undefined; }
		if (text.length == 0) { return text; }
		while (text.charAt(0) == charToRemove && fromLeft) {
			text = text.substring(1);
		}

		while (text.charAt(text.length - 1) == charToRemove && fromRight) {
			text = text.substring(0, text.length - 1);
		}

		return text;
	}

	static disableOpenAsNotebook(): void {
		this.initOpenAsNotebookOriginalSetting();

		if (this._openAsNotebookOriginalSetting) {
			ThisExtension.log("Temporary setting " + this.openAsNotebookSettingName + " to false for proper DIFF ...");
			ThisExtension.updateConfigurationSetting(this.openAsNotebookSettingName, false, ThisExtension.SettingScope);
		}
	}

	static resetOpenAsNotebook(): void {
		this.initOpenAsNotebookOriginalSetting();

		ThisExtension.log("Setting " + this.openAsNotebookSettingName + " back to " + this._openAsNotebookOriginalSetting);
		ThisExtension.updateConfigurationSetting("python.dataScience.useNotebookEditor", this._openAsNotebookOriginalSetting, ThisExtension.SettingScope);
	}

	static async showDiff(filePath1: string, filePath2: string): Promise<void> {
		let localFileUri = vscode.Uri.file(filePath1);
		let onlnieFileUri = vscode.Uri.file(filePath2);

		let options: vscode.TextDocumentShowOptions = {
			"preserveFocus": true,
			"preview": false
		};

		vscode.commands.executeCommand("vscode.diff", localFileUri, onlnieFileUri, "Online <-> Local", options);
	}

	private static resolvePath(filepath: string): string {
		if (filepath[0] === '~') {
			// could also use os.homedir()
			const homeVar = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
			return fspath.join(process.env[homeVar], filepath.slice(1));
		}
		else {
			return fspath.resolve(filepath);
		}

		/*
		Migrate to Portable mode
		You can also migrate an existing installation to Portable mode:

		Download the VS Code ZIP distribution for your platform.
		Create the data or code-portable-data folder as above.
		Copy the user data directory Code to data and rename it to user-data:
		Windows %APPDATA%\Code
		macOS $HOME/Library/Application Support/Code
		Linux $HOME/.config/Code
		Copy the extensions directory to data:
		Windows %USERPROFILE%\.vscode\extensions
		macOS ~/.vscode/extensions
		Linux ~/.vscode/extensions
		*/
	}

	static openLink(link: string): void {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
	}

	static async wait(ms): Promise<void> {
		await setTimeout(() => { }, ms);
	}

	static bytesToSize(bytes: number): string {
		let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Byte';

		let i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
	}

	static async singleVsDoubleClick(
		sourceObject: any,
		singleClickFunction: Function,
		doubleClickFunction: Function,
		timeout: number = 250): Promise<void> {
		if (!Helper._doubleClickTimer) {
			//if timer still exists, it's a double-click
			Helper._doubleClickTimer = setTimeout(await sourceObject[singleClickFunction.name], timeout); //do single-click once timer has elapsed
			setTimeout(this.resetDoubleClickTimer, timeout + 1);
		}
		else {
			await Helper.resetDoubleClickTimer();

			await sourceObject[doubleClickFunction.name]();
		}
	}

	private static async resetDoubleClickTimer(): Promise<void> {
		clearTimeout(Helper._doubleClickTimer); //cancel timer
		Helper._doubleClickTimer = undefined;
	}

	public static localUserFolder(): string {
		return "";
	}

	static newGuid() {
		return 'xxxxxxxx-xxxx-1908-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	static async addCodeCells(filePath: string): Promise<void> {
		try {
			const replace = require('replace-in-file');
			let regex = new RegExp(this.DatabricksCommandTag, 'g');
			let options = {
				files: filePath,
				from: regex,
				to: this.DatabricksCommandTag + '\n' + this.CodeCellTag
			};


			let results = await replace(options);
			ThisExtension.log('Replacement results:', results[0].hasChanged);

			// remove duplicat code cells that might have been added
			regex = new RegExp(this.CodeCellTag + '[\\r\\n]' + this.CodeCellTag, 'g');
			options = {
				files: filePath,
				from: regex,
				to: this.CodeCellTag
			};

			results = await replace(options);
			ThisExtension.log('Replacement results:', results[0].hasChanged);
		}
		catch (error) {
			ThisExtension.log('Error occurred:', error);
		}
	}
	static async removeCodeCells(filePath: string): Promise<void> {
		try {
			const replace = require('replace-in-file');
			const regex = new RegExp(this.DatabricksCommandTag + '[\\r\\n]*' + this.CodeCellTag, 'g');
			const options = {
				files: filePath,
				from: regex,
				to: this.DatabricksCommandTag,
			};

			const results = await replace(options);
			ThisExtension.log('Replacement results:', results[0].hasChanged);
		}
		catch (error) {
			ThisExtension.log('Error occurred:', error);
		}
	}

	static secondsToHms(seconds: number) {
		var h = Math.floor(seconds / 3600);
		var m = Math.floor(seconds % 3600 / 60);
		var s = Math.floor(seconds % 3600 % 60);

		var hDisplay = h > 0 ? h + ":" : "";
		var mDisplay = m > 0 ? m + ":" : "";
		var sDisplay = s > 0 ? s + ":" : "";

		var hDisplay = h > 0 ? `${h.toString().length > 1 ? `${h}` : `0${h}`}` : '00';
		var mDisplay = m > 0 ? `${m.toString().length > 1 ? `${m}` : `0${m}`}` : '00';
		var sDisplay = s > 0 ? `${s.toString().length > 1 ? `${s}` : `0${s}`}` : '00';

		return `${hDisplay}:${mDisplay}:${sDisplay}`; 
	}

	static getFirstRegexGroup(regexp: RegExp, text: string): string {
		const array = [...text.matchAll(regexp)];
		if(array.length >= 1)
		{
			return array[0][1];
		}
		return null;
	}

	static getUserDir(): string {
		return os.homedir();
	}

	static parseBoolean(value: string): boolean {
		return value === 'false' || value === 'undefined' || value === 'null' || value === '0' ? false : !!value;
	}
}