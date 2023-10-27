import * as vscode from 'vscode';

import { Helper } from '../../../helpers/Helper';

import { DatabricksUCTreeItem } from './DatabricksUCTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksUCMetastore } from './DatabricksUCMetastore';
import { iDatabricksUCMetastore } from './iDatabricksUCMetastore';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksUCTreeProvider implements vscode.TreeDataProvider<DatabricksUCTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksUCTreeItem | undefined> = new vscode.EventEmitter<DatabricksUCTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksUCTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _treeView: vscode.TreeView<DatabricksUCTreeItem>;

	private _autoRefreshTimer;

	constructor(context: vscode.ExtensionContext) {
		const treeView = vscode.window.createTreeView('databricksUnityCatalog', { 
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

		this.startAutoRefresh(300); // refresh every 5 minutes
	}

	private async _onDidChangeSelection(items: readonly DatabricksUCTreeItem[]): Promise<void> { }
	private async _onDidExpandElement(item: DatabricksUCTreeItem): Promise<void> { }
	private async _onDidCollapseElement(item: DatabricksUCTreeItem): Promise<void> { }
	private async _onDidChangeVisibility(visible: boolean): Promise<void> { }
	
	async startAutoRefresh(timeoutSeconds: number): Promise<void> {
		if (this._autoRefreshTimer) {
			ThisExtension.log('AutoRefresh for UCsTreeView is already running!');
		}
		else {
			ThisExtension.log(`Starting AutoRefresh for UCsTreeView every ${timeoutSeconds} seconds!`);
			this._autoRefreshTimer = setInterval(async () => {
				await this.refresh(undefined, false, true);
			}, timeoutSeconds * 1000);
		}
	}

	async stopAutoRefresh(): Promise<void> {
		if (this._autoRefreshTimer) {
			ThisExtension.log('Stopping AutoRefresh for UCsTreeView!');
			clearInterval(this._autoRefreshTimer);
			this._autoRefreshTimer = undefined;
		}
		else {
			ThisExtension.log('AutoRefresh for UCsTreeView is not running!');
		}
	}

	async refresh(item: DatabricksUCTreeItem = null, showInfoMessage: boolean = false, isAutoRefresh = false): Promise<void> {
		if (showInfoMessage && !isAutoRefresh) {
			Helper.showTemporaryInformationMessage('Refreshing UCs ...');
		}
		this._onDidChangeTreeData.fire(item);
	}

	async getTreeItem(element: DatabricksUCTreeItem): Promise<vscode.TreeItem> {
		return element;
	}

	async getChildren(element?: DatabricksUCTreeItem): Promise<DatabricksUCTreeItem[]> {	
		if(!DatabricksApiService.isInitialized) { 
			return Promise.resolve([]);
		}

		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			let items: DatabricksUCTreeItem[] = [];
			
			let apiItem: iDatabricksUCMetastore = await DatabricksApiService.getUCMetastore();

			if (apiItem != undefined) {
				items.push(new DatabricksUCMetastore(apiItem));
			}

			return items;
		}
	}
}
