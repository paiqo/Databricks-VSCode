import * as vscode from 'vscode';

import { Helper } from '../../../helpers/Helper';

import { DatabricksRepoTreeItem } from './DatabricksRepoTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksRepoDirectory } from './DatabricksRepoDirectory';


// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksRepoTreeProvider implements vscode.TreeDataProvider<DatabricksRepoTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksRepoTreeItem | undefined> = new vscode.EventEmitter<DatabricksRepoTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksRepoTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _treeView: vscode.TreeView<DatabricksRepoTreeItem>;

	constructor(context: vscode.ExtensionContext) {
		const treeView = vscode.window.createTreeView('databricksRepos', { 
			treeDataProvider: this, 
			showCollapseAll: true, 
			canSelectMany: false
			});
		context.subscriptions.push(treeView);

		treeView.onDidChangeSelection((event) => this._onDidChangeSelection(event.selection));
		treeView.onDidExpandElement((event) => this._onDidExpandElement(event.element));
		treeView.onDidCollapseElement((event) => this._onDidCollapseElement(event.element));
		treeView.onDidChangeVisibility((event) => this._onDidChangeVisibility(event.visible));

		this._treeView = treeView;
	}

	private async _onDidChangeSelection(items: readonly DatabricksRepoTreeItem[]): Promise<void> { }
	private async _onDidExpandElement(item: DatabricksRepoTreeItem): Promise<void> { }
	private async _onDidCollapseElement(item: DatabricksRepoTreeItem): Promise<void> { }
	private async _onDidChangeVisibility(visible: boolean): Promise<void> { }
	
	async refresh(showInfoMessage: boolean = false, item: DatabricksRepoTreeItem = null): Promise<void> {
		if(showInfoMessage){
			Helper.showTemporaryInformationMessage('Refreshing Repos ...');
		}
		this._onDidChangeTreeData.fire(item);
	}

	async getTreeItem(element: DatabricksRepoTreeItem): Promise<vscode.TreeItem> {
		return element;
	}

	async getChildren(element?: DatabricksRepoTreeItem): Promise<DatabricksRepoTreeItem[]> {	
		if(!DatabricksApiService.isInitialized) { 
			return Promise.resolve([]);
		}

		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			let responseData = await DatabricksApiService.listRepos();

			let directories: string[] = [];
			let repoItems: DatabricksRepoTreeItem[] = [];

			if (responseData != undefined) {
				responseData.map(item => directories.push(item.path.split("/")[2]));
				directories = Array.from(new Set(directories));
				directories.map(item => repoItems.push(new DatabricksRepoDirectory(item)));
				Helper.sortArrayByProperty(repoItems, "label", "ASC");
			}
			
			return Promise.resolve(repoItems);
		}
	}

	async add(): Promise<void> {
		vscode.window.showErrorMessage(`Not yet implemented!`);
	}
}
