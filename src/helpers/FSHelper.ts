/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Helper } from './Helper';

export abstract class FSHelper {
	static SEPARATOR: string = '/';

	static async addToWorkspace(uri: vscode.Uri, name: string, showMessage: boolean = true): Promise<void> {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showErrorMessage("Please save your current session as a VSCode workspace first to use this feature!");
		}
		else {
			// add at the end of the workspace
			if(showMessage)
			{
				vscode.window.showWarningMessage("This feature is still experimental!");
			}
			vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders.length, 0, { uri: uri, name: name });

			vscode.commands.executeCommand("workbench.files.action.focusFilesExplorer", uri);
		}
	}

	static async pathExists(uri: vscode.Uri | string): Promise<boolean> {
		try {
			if (typeof (uri) == "string") {
				uri = vscode.Uri.file(uri);
			}
			let stats = await vscode.workspace.fs.stat(uri);
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

	static joinPathSync(base: vscode.Uri, ...pathSegments: string[]): vscode.Uri {
		return vscode.Uri.joinPath(base, ...pathSegments)
	}

	static basename(uri: vscode.Uri): string {
		return Helper.getToken(uri.path, this.SEPARATOR, -1);
	}

	static parent(uri: vscode.Uri): vscode.Uri {
		let parentPaths = uri.path.split(this.SEPARATOR).slice(0, -1);
		let parentPath: string = "/";

		if(parentPaths.length > 1)
		{
			parentPath = parentPaths.join(this.SEPARATOR)
		}
		return uri.with({ path: parentPath });
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

		items = items.filter(x => x); // filters out items that would be undefined/null/empty etc.

		return this.SEPARATOR + items.join(this.SEPARATOR);
	}

	static isVSCodeInternalURI(uri: vscode.Uri): boolean {
		if (uri.path.includes('/.') // any hidden files/folders
			|| uri.path.endsWith("/pom.xml")
			|| uri.path.endsWith("/node_modules")
			|| uri.path.endsWith("AndroidManifest.xml")) {
			return true;
		}
		return false;
	}

	static resolvePath(path: string | vscode.Uri): vscode.Uri {
		if(!path)
		{
			return undefined;
		}
		let uri: vscode.Uri;

		if (typeof (path) == "string") {
				uri = vscode.Uri.file(path);
			}
		else
		{
			uri = path;
		}
		// replace environment variables in path
		const envVarRegex = /\$([A-Z_]+[A-Z0-9_]*)|\${([A-Z0-9_]*)}|%([^%]+)%/ig;

		do {
			uri = uri.with({path: uri.path.replace(envVarRegex, (_, a, b, c) => process.env[a || b || c])}) ;
		} while(uri.path.match(envVarRegex));

		if (uri.path[0] === '~') {
			uri = FSHelper.joinPathSync(this.getUserDir(), uri.path.slice(1));
		}
		
		return uri;

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

	static getUserDir(): vscode.Uri {
		const homeVar: string = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
		return vscode.Uri.file(process.env[homeVar]);
	}
}