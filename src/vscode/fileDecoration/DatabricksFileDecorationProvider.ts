import * as vscode from 'vscode';

import { ThisExtension } from '../../ThisExtension';
import { DatabricksNotebook } from '../notebook/DatabricksNotebook';
import { DatabricksKernelManager } from '../notebook/DatabricksKernelManager';
import { DatabricksKernel } from '../notebook/DatabricksKernel';


export class DatabricksFileDecorationProvider implements vscode.FileDecorationProvider {
	private static provider: DatabricksFileDecorationProvider;

	protected _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri[]>();
	readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

	public static async register(context: vscode.ExtensionContext) {
		const fdp = new DatabricksFileDecorationProvider()
		context.subscriptions.push(vscode.window.registerFileDecorationProvider(fdp));

		DatabricksFileDecorationProvider.provider = fdp;
	}

	public static updateFileDecoration(urisToUpdate: vscode.Uri[]) {
		this.provider._onDidChangeFileDecorations.fire(urisToUpdate);
	}

	public provideFileDecoration(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
		if (uri.scheme !== ThisExtension.WORKSPACE_SCHEME && uri.scheme !== ThisExtension.WORKSPACE_SCHEME_LEGACY) {
			return undefined;
		}

		let fileDeco: vscode.FileDecoration = undefined;

		const repo = DatabricksKernel.getRepoSync(uri, true)
		if(repo) {
			fileDeco = new vscode.FileDecoration("R", "GIT-Repository", new vscode.ThemeColor("gitDecoration.modifiedResourceForeground"));
			fileDeco.propagate = false;
		}

		return fileDeco;
	}
}
