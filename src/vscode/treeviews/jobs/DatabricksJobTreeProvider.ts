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

	constructor() {	}

	
	async autoRefresh(timeoutSeconds: number = 10) {
		while (true) {
			await new Promise(resolve => setTimeout(resolve, timeoutSeconds * 1000));
			
			this.refresh(false);
		}
	}

	refresh(showInfoMessage: boolean = false): void {
		if(showInfoMessage){
			Helper.showTemporaryInformationMessage('Refreshing Jobs ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	getTreeItem(element: DatabricksJobTreeItem): vscode.TreeItem {
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
		let responseData = await DatabricksApiService.listJobs();
		// array of file is in result.files
		let items = responseData.jobs;

		let jobItems: DatabricksJob[] = [];
		if (items != undefined) {
			items.map(item => jobItems.push(new DatabricksJob(item)));
			Helper.sortArrayByProperty(jobItems, "label", "ASC");
		}

		return jobItems;
	}

	add(): void {
		vscode.window.showErrorMessage(`Not yet implemented!`);
	}
}
