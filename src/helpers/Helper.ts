/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as os from 'os';
import * as fspath from 'path';
import * as fs from 'fs';
import * as UniqueFileName from 'uniquefilename';

export abstract class Helper
{
	private static _tempFiles: string[];

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
		return new Promise( resolve => setTimeout(resolve, ms) );
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
		if(pathIsFile)
		{
			folder = fspath.dirname(path);
		}
		if (!fs.existsSync(folder)){
			fs.mkdirSync(folder, { recursive: true });
		}
	}

	static sortArrayByProperty(unsortedArray: object[], property: string = "label", direction:"ASC" | "DESC" = "ASC") {
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

	static openTempFile(content: string = '', fileName: string = 'db-vscode-temp.json', ): string {
		const tempDir = this.resolvePath(os.tmpdir());
		const filePath = `${tempDir}${fspath.sep}${fileName}`;
		const uniqueFilePath = UniqueFileName.get(filePath, {});

		uniqueFilePath.then(path => {
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
		for (const tempFile of Helper.tempFiles) {
			fs.unlink(tempFile, (err) => vscode.window.showErrorMessage(err.message));
		}
	}

	private static resolvePath(filepath: string): string {
		if (filepath[0] === '~') {
			const hoveVar = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
			return fspath.join(process.env[hoveVar], filepath.slice(1));
		}
		else {
			return fspath.resolve(filepath);
		}
	}

	static openLink(link: string): void {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
	}

	static wait(ms): void {
		let start = new Date().getTime();
		let end = start;
		while (end < start + ms) {
			end = new Date().getTime();
		}
	}
}