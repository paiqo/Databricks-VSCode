import * as vscode from 'vscode';
import { DatabricksWorkspaceTreeItem } from './databricksApi/workspaces/DatabricksWorkspaceTreeItem';
import { DatabricksWorkspaceDirectory } from './databricksApi/workspaces/DatabricksWorkspaceDirectory';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksWorkspaceTreeProvider implements vscode.TreeDataProvider<DatabricksWorkspaceTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined> = new vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksWorkspaceTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() {	}

	refresh(showInfoMessage: boolean = false): void {
		if(showInfoMessage){
			vscode.window.showInformationMessage('Refreshing Workspace ...');
		}
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: DatabricksWorkspaceTreeItem): DatabricksWorkspaceTreeItem {
		return element;
	}

	getChildren(element?: DatabricksWorkspaceTreeItem): Thenable<DatabricksWorkspaceTreeItem[]> {	
		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			return new DatabricksWorkspaceDirectory("/", -1, "Online").getChildren();
		}
	}

	download(): void {
		new DatabricksWorkspaceDirectory("/", -1, "Online").download();
	}

	upload(): void {
		new DatabricksWorkspaceDirectory("/", -1, "Online").upload();
	}
}
