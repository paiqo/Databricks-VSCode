/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { ThisExtension } from '../ThisExtension';
import { Helper } from './Helper';

export abstract class FSHelper {
	private static _tempFiles: string[];
	static SEPARATOR: string = '/';

	// sooner or later we want to move await from native libraries like (path, os, ...) and use VSCode API implementations instead, e.g. vscode.workspace.fs
	static async pathExists(path: vscode.Uri | string): Promise<boolean> {
		try {
			if(typeof(path) == "string")
			{
				path = vscode.Uri.file(path);
			}
			await vscode.workspace.fs.stat(path);
			return true;
		} catch {
			return false;
		}
	}

	static async ensureFolder(path: vscode.Uri): Promise<void> {
		if (!(await FSHelper.pathExists(path))) {
			await vscode.workspace.fs.createDirectory(path);
		}
	}

	static async joinPath(base: vscode.Uri, ...pathSegments: string[]): Promise<vscode.Uri> {
		return vscode.Uri.joinPath(base, ...pathSegments)
	}

	static basename(path: vscode.Uri){
		return Helper.getToken(path.path, this.SEPARATOR, -1);
	}

	static join(...paths: string[])
	{
		let items: string[] = [];

		for(let path of paths)
		{
			items.push(Helper.trimChar(path, this.SEPARATOR))
		}

		return this.SEPARATOR + items.join(this.SEPARATOR);
	}

}