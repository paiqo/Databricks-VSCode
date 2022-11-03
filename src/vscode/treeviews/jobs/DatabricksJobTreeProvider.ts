import * as vscode from 'vscode';

import { Helper } from '../../../helpers/Helper';

import { DatabricksJobTreeItem } from './DatabricksJobTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksJob } from './DatabricksJob';
import { DatabricksInteractiveJobs } from './DatabricksInteractiveJobs';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksJobTreeProvider implements vscode.TreeDataProvider<DatabricksJobTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksJobTreeItem | undefined> = new vscode.EventEmitter<DatabricksJobTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksJobTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _treeView: vscode.TreeView<DatabricksJobTreeItem>;

	constructor(context: vscode.ExtensionContext) {
		const treeView = vscode.window.createTreeView('databricksJobs', { 
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

		this.autoRefresh(30); // refresh every 30 seconds
	}

	private async _onDidChangeSelection(items: readonly DatabricksJobTreeItem[]): Promise<void> { }
	private async _onDidExpandElement(item: DatabricksJobTreeItem): Promise<void> { }
	private async _onDidCollapseElement(item: DatabricksJobTreeItem): Promise<void> { }
	private async _onDidChangeVisibility(visible: boolean): Promise<void> { }
	
	async autoRefresh(timeoutSeconds: number) {
		while (true) {
			await new Promise(resolve => setTimeout(resolve, timeoutSeconds * 1000));
			
			this.refresh(false, undefined);
		}
	}

	async refresh(showInfoMessage: boolean = false, item: DatabricksJobTreeItem): Promise<void> {
		if(showInfoMessage){
			Helper.showTemporaryInformationMessage('Refreshing Jobs ...');
		}
		this._onDidChangeTreeData.fire(item);
	}

	async getTreeItem(element: DatabricksJobTreeItem): Promise<vscode.TreeItem> {
		return element;
	}

	async getChildren(element?: DatabricksJobTreeItem): Promise<DatabricksJobTreeItem[]> {	
		if(!DatabricksApiService.isInitialized) { 
			return Promise.resolve([]);
		}

		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			let allItems: DatabricksJobTreeItem[] = [];
			allItems.push(new DatabricksInteractiveJobs());
			
			let jobs = await this.getJobs();
			//this.getJobs().then(x => allItems.concat(x));
			return Promise.resolve(allItems.concat(jobs));
		}
	}

	async getJobs(): Promise<DatabricksJob[]> {
		let jobs = await DatabricksApiService.listJobs();

		let jobItems: DatabricksJob[] = [];
		if (jobs != undefined) {
			jobs.map(item => jobItems.push(new DatabricksJob(item)));
			Helper.sortArrayByProperty(jobItems, "label", "ASC");
		}

		return jobItems;
	}

	add(): void {
		vscode.window.showErrorMessage(`Not yet implemented!`);
	}
}
