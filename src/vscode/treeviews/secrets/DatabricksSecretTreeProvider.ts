import * as vscode from 'vscode';

import { DatabricksSecretTreeItem } from './DatabricksSecretTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { iDatabricksSecretScope } from './iDatabricksSecretScope';
import { Helper } from '../../../helpers/Helper';
import { DatabricksSecretScope } from './DatabricksSecretScope';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksSecretTreeProvider implements vscode.TreeDataProvider<DatabricksSecretTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksSecretTreeItem | undefined> = new vscode.EventEmitter<DatabricksSecretTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksSecretTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() { }

	refresh(showInfoMessage: boolean = false): void {
		if (showInfoMessage) {
			vscode.window.showInformationMessage('Refreshing Secrets ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	getTreeItem(element: DatabricksSecretTreeItem): vscode.TreeItem {
		return element;
	}

	getParent(element: DatabricksSecretTreeItem): vscode.ProviderResult<DatabricksSecretTreeItem> {
		return element.parent;
	}

	async getChildren(element?: DatabricksSecretTreeItem): Promise<DatabricksSecretTreeItem[]> {
		if (!DatabricksApiService.isInitialized) {
			return Promise.resolve([]);
		}

		if (element != null && element != undefined) {
			return element.getChildren();
		}
		else {
			let items: iDatabricksSecretScope[] = await DatabricksApiService.listSecretScopes();

			let scopeItems: DatabricksSecretScope[] = []

			if (items != undefined) {
				items.map(item => scopeItems.push(new DatabricksSecretScope(item)));
			}

			return scopeItems;
		}
	}

	async addSecretScope(): Promise<void> {
		let scopeName = await Helper.showInputBox("<name of scope>", "The name of the secret scope to create");
		let managingPrincipal = await Helper.showQuickPick(["users"], "Which group/user is allowed to manage the secret scope");

		await DatabricksApiService.createSecretScopes(scopeName, managingPrincipal);

		setTimeout(() => vscode.commands.executeCommand("databricksSecrets.refresh", false), 500);
	}
}
