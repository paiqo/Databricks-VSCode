import * as vscode from 'vscode';

import { Helper } from '../../../helpers/Helper';

import { DatabricksSecretTreeItem } from './DatabricksSecretTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { iDatabricksSecretScope } from './iDatabricksSecretScope';
import { DatabricksSecretScope } from './DatabricksSecretScope';
import { DatabricksSecretDragAndDropController } from './DatabricksSecretDragAndDropController';


// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksSecretTreeProvider implements vscode.TreeDataProvider<DatabricksSecretTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksSecretTreeItem | undefined> = new vscode.EventEmitter<DatabricksSecretTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksSecretTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('databricksSecrets', { treeDataProvider: this, showCollapseAll: true, canSelectMany: true, dragAndDropController: new DatabricksSecretDragAndDropController() });
		context.subscriptions.push(view);

		view.onDidChangeSelection((event) => this._onDidChangeSelection(event.selection));

		//ThisExtension.TreeViewWorkspaces = this;
	}

	private async _onDidChangeSelection(items: readonly DatabricksSecretTreeItem[]): Promise<void>
	{
	}

	async refresh(showInfoMessage: boolean = false): Promise<void> {
		if (showInfoMessage) {
			Helper.showTemporaryInformationMessage('Refreshing Secrets ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	async getTreeItem(element: DatabricksSecretTreeItem): Promise<vscode.TreeItem> {
		return element;
	}

	async getParent(element: DatabricksSecretTreeItem): Promise<DatabricksSecretTreeItem> {
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

		setTimeout(() => vscode.commands.executeCommand("databricksSecrets.refresh", undefined, false), 500);
	}
}
