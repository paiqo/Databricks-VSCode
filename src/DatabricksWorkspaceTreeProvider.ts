import * as vscode from 'vscode';
import { DatabricksApiService} from './databricksApi/databricksApiService';
import { DatabricksWorkspaceTreeItem } from './databricksApi/workspaces/DatabricksWorkspaceTreeItem';
import { DatabricksClusterTreeItem } from './databricksApi/clusters/DatabricksClusterTreeItem';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksWorkspaceTreeProvider implements vscode.TreeDataProvider<DatabricksWorkspaceTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined> = new vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksWorkspaceTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() {	}

	refresh(): void {
		vscode.window.showInformationMessage(`Refreshing Workspace ...`);
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: DatabricksWorkspaceTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DatabricksWorkspaceTreeItem): Thenable<DatabricksWorkspaceTreeItem[]> {	
		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			return new DatabricksWorkspaceTreeItem("/", "DIRECTORY", -1).getChildren();
		}
	}

	download(): void {
		new DatabricksWorkspaceTreeItem("/", "DIRECTORY", -1).download();
	}

	upload(): void {
		new DatabricksWorkspaceTreeItem("/", "DIRECTORY", -1).upload();
	}
}
