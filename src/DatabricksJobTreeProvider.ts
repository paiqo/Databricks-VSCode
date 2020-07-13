import * as vscode from 'vscode';
import { Helper } from './helpers/Helper';

import { DatabricksJobTreeItem } from './databricksApi/jobs/DatabricksJobTreeItem';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksJobTreeProvider implements vscode.TreeDataProvider<DatabricksJobTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksJobTreeItem | undefined> = new vscode.EventEmitter<DatabricksJobTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksJobTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() {	}

	refresh(showInfoMessage: boolean = false): void {
		if(showInfoMessage){
			vscode.window.showInformationMessage('Refreshing Jobs ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	getTreeItem(element: DatabricksJobTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DatabricksJobTreeItem): Thenable<DatabricksJobTreeItem[]> {	
		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			return new DatabricksJobTreeItem("ROOT", '').getChildren();
		}
	}

	add(): void {
		vscode.window.showErrorMessage(`Not yet implemented!`);
	}
}
