/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Helper } from './Helper';

export abstract class FSHelper {
	static SEPARATOR: string = '/';

	static async addToWorkspace(uri: vscode.Uri, name: string): Promise<void> {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage("Please save your current session as a VSCode workspace first to use this feature!");
		}
		else {
			// add at the end of the workspace
			vscode.window.showWarningMessage("This feature is still experimental!");
			vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders.length, 0, { uri: uri, name: name });

			vscode.commands.executeCommand("workbench.files.action.focusFilesExplorer", uri);
		}
	}

	static async pathExists(uri: vscode.Uri | string): Promise<boolean> {
		try {
			if (typeof (uri) == "string") {
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

	static basename(uri: vscode.Uri): string {
		return Helper.getToken(uri.path, this.SEPARATOR, -1);
	}

	static parent(uri: vscode.Uri): vscode.Uri {
		return uri.with({ path: uri.path.split(this.SEPARATOR).slice(0, -1).join(this.SEPARATOR) });
	}

	static removeExtension(uri: vscode.Uri): vscode.Uri {
		let extension: string = this.extension(uri);

		if (extension) {
			return uri.with({ path: uri.path.replace(extension, "") })
		}
		return uri;
	}

	static extension(uri: vscode.Uri): string {
		let splits: string[] = uri.path.split('.');

		if (splits.length > 1) {
			return "." + splits.slice(-1)[0];
		}
		return undefined;
	}

	static join(...paths: string[]) {
		let items: string[] = [];

		for (let path of paths) {
			items.push(Helper.trimChar(path, this.SEPARATOR))
		}

		items = items.filter(x => x);

		return this.SEPARATOR + items.join(this.SEPARATOR);
	}

	static isVSCodeInternalURI(uri: vscode.Uri): boolean {
		if (uri.path.startsWith("/.vscode")
			|| uri.path.startsWith("/.git")
			|| uri.path == "/pom.xml"
			|| uri.path == "/node_modules"
			|| uri.path.endsWith("AndroidManifest.xml")) {
			return true;
		}
		return false;
	}

}