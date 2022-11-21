/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

import { ThisExtension } from '../ThisExtension';
import { FSHelper } from './FSHelper';

export abstract class Helper {
	private static CodeCellTag: string = "# %% Code Cell";
	static DatabricksCommandTagRegEx: string = '#\\s*COMMAND\\s*[-]*';
	static JupyterCodeCellsSettingName: string = "jupyter.codeRegularExpression";
	private static openAsNotebookSettingName: string = 'python.dataScience.useNotebookEditor';

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
		ignoreFocusOut: boolean,
		valueSelection: [number, number] = undefined,
	): Promise<string | undefined> {
		const result = await vscode.window.showInputBox({
			value: defaultValue,
			valueSelection: valueSelection,
			placeHolder: toolTip,
			prompt: toolTip,
			ignoreFocusOut: ignoreFocusOut
			/*,
			validateInput: text => {
				window.showInformationMessage(`Validating: ${text}`);
				return text === '123' ? 'Not 123!' : null;
			}*/
		});

		return result;
	}

	static async showTemporaryInformationMessage(message: string, timeout: number = 2000): Promise<void> {
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: message,
			cancellable: false
		}, (progress) => {
			return new Promise<void>(resolve => {
				setTimeout(() => {
					resolve();
				}, timeout);
			});
		});
	}

	static async pathExists(path: vscode.Uri | string): Promise<boolean> {
		try {
			// three '/' in the beginning indicate a local path
			// however, there are issues if this.localFilePath also starts with a '/' so we do a replace in this special case
			if(typeof(path) == "string")
			{
				path = vscode.Uri.parse(("file:///" + path).replace('////', '///'));
			}
			await vscode.workspace.fs.stat(path);
			return true;
		} catch {
			return false;
		}
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

	static getToken(text: string, separator: string, token: number): string {
		let parts: string[] = text.split(separator);

		if(token < 0)
		{
			return parts.slice(token)[0];
		}
		return parts[token];
	}

	// not working!
	static runAsyncFunction<T>(func: Function, args: any = undefined): T {
		return (async function () {
			if(args == undefined)
			{
				return func()
			}
			return func(args);
		}()) as unknown as T;
	}
	// not working!
	static runAsyncFunction2<T>(func: Function, args: any = undefined): T {
		const immediatelyResolvedPromise = () => {
			const resultPromise = new Promise((resolve, reject) => {
				resolve(func(args))
			})
			return resultPromise.then(x => x as unknown as T);
		}
		return immediatelyResolvedPromise as unknown as T;
	}
	

	static ensureLocalFolder(path: string, pathIsFile: boolean = false): void {
		let folder: vscode.Uri = vscode.Uri.file(path);
		if (pathIsFile) {
			folder = FSHelper.parent(folder);
		}
		if (!FSHelper.pathExists(folder)) {
			vscode.workspace.fs.createDirectory(folder);
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

	static async showDiff(filePath1: vscode.Uri, filePath2: vscode.Uri): Promise<void> {
		let options: vscode.TextDocumentShowOptions = {
			"preserveFocus": true,
			"preview": false
		};

		vscode.commands.executeCommand("vscode.diff", filePath1, filePath2, "Online <-> Local", options);
	}

	

	static openLink(link: string): void {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
	}

	static async wait(ms: number): Promise<void> {
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

	static parseBoolean(value: string): boolean {
		return value === 'false' || value === 'undefined' || value === 'null' || value === '0' ? false : !!value;
	}
}