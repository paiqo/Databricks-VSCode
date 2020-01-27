import * as vscode from 'vscode';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export abstract class ThisExtension {
	private static _context: vscode.ExtensionContext;

	static get rootPath(): string {
		return this._context.extensionPath;
	}

	static initialize(context: vscode.ExtensionContext): void {
		this._context = context;
	}
}
