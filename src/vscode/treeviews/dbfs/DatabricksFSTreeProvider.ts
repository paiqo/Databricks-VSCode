import * as vscode from 'vscode';
import { DatabricksFSTreeItem } from './DatabricksFSTreeItem';
import { DatabricksFSDirectory } from './DatabricksFSDirectory';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksFSTreeProvider implements vscode.TreeDataProvider<DatabricksFSTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksFSTreeItem | undefined> = new vscode.EventEmitter<DatabricksFSTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksFSTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() {	}

	refresh(showInfoMessage: boolean = false): void {
		if(showInfoMessage){
			vscode.window.showInformationMessage('Refreshing DBFS ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	getTreeItem(element: DatabricksFSTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DatabricksFSTreeItem): Thenable<DatabricksFSTreeItem[]> {	
		if(!DatabricksApiService.isInitialized) { 
			return Promise.resolve([]);
		}
		
		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			return new DatabricksFSDirectory("/", "Online").getChildren();
		}
	}
}
