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
	static async pathExists(uri: vscode.Uri | string): Promise<boolean> {
		try {
			if(typeof(uri) == "string")
			{
				uri = vscode.Uri.file(uri);
			}
			await vscode.workspace.fs.stat(uri);
			return true;
		} catch {
			return false;
		}
	}

	static async ensureFolder(uri: vscode.Uri): Promise<void> {
		if (!(await FSHelper.pathExists(uri))) {
			await vscode.workspace.fs.createDirectory(uri);
		}
	}

	static async joinPath(base: vscode.Uri, ...pathSegments: string[]): Promise<vscode.Uri> {
		return vscode.Uri.joinPath(base, ...pathSegments)
	}

	static basename(uri: vscode.Uri): string{
		return Helper.getToken(uri.path, this.SEPARATOR, -1);
	}

	static parent(uri: vscode.Uri): vscode.Uri{
		return uri.with({path: uri.path.split(this.SEPARATOR).slice(0, -1).join(this.SEPARATOR)});
	}

	static removeExtension(uri: vscode.Uri): vscode.Uri
	{
		let extension: string = this.extension(uri);

		if(extension)
		{
			return uri.with({path: uri.path.replace(extension, "")})
		}
		return uri;
	}

	static extension(uri: vscode.Uri): string
	{
		let splits: string[] = uri.path.split('.');

		if(splits.length > 1)
		{
			return "." + splits.slice(-1)[0];
		}
		return undefined;
	}

	static join(...paths: string[])
	{
		let items: string[] = [];

		for(let path of paths)
		{
			items.push(Helper.trimChar(path, this.SEPARATOR))
		}

		items = items.filter(x => x);

		return this.SEPARATOR + items.join(this.SEPARATOR);
	}

}