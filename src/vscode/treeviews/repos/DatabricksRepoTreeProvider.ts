import * as vscode from 'vscode';
import { Helper } from '../../../helpers/Helper';

import { DatabricksRepoTreeItem } from './DatabricksRepoTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { iDatabricksRepo } from './_types';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksRepoTreeProvider implements vscode.TreeDataProvider<DatabricksRepoTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksRepoTreeItem | undefined> = new vscode.EventEmitter<DatabricksRepoTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksRepoTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() {	}

	
	async autoRefresh(timeoutSeconds: number = 10) {
		while (true) {
			await new Promise(resolve => setTimeout(resolve, timeoutSeconds * 1000));
			
			this.refresh(false);
		}
	}

	refresh(showInfoMessage: boolean = false): void {
		if(showInfoMessage){
			vscode.window.showInformationMessage('Refreshing Repos ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	getTreeItem(element: DatabricksRepoTreeItem): vscode.TreeItem {
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

			let repoItems: DatabricksRepoTreeItem[] = [];

			if (responseData != undefined) {
				responseData.repos.map(item => repoItems.push(new DatabricksRepoTreeItem(item.id, item)));
				Helper.sortArrayByProperty(repoItems, "label", "ASC");
			}
			
			return Promise.resolve(repoItems);
		}
	}

	add(): void {
		vscode.window.showErrorMessage(`Not yet implemented!`);
	}
}
