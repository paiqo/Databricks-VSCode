import * as vscode from 'vscode';

import { DatabricksSecretTreeItem } from './DatabricksSecretTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksSecretTreeProvider implements vscode.TreeDataProvider<DatabricksSecretTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksSecretTreeItem | undefined> = new vscode.EventEmitter<DatabricksSecretTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksSecretTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() {	}

	refresh(showInfoMessage: boolean = false): void {
		if(showInfoMessage){
			vscode.window.showInformationMessage('Refreshing Secrets ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	getTreeItem(element: DatabricksSecretTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DatabricksSecretTreeItem): Thenable<DatabricksSecretTreeItem[]> {	
		if(!DatabricksApiService.isInitialized) { 
			return Promise.resolve([]);
		}
		
		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			return new DatabricksSecretTreeItem().getChildren();
		}
	}

	addSecretScope(): void {
		new DatabricksSecretTreeItem().addSecretScope();
	}
}
