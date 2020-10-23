import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';
import { DatabricksWorkspaceTreeItem } from './databricksApi/workspaces/DatabricksWorkspaceTreeItem';
import { DatabricksWorkspaceDirectory } from './databricksApi/workspaces/DatabricksWorkspaceDirectory';
import { ThisExtension } from './ThisExtension';
import { Helper } from './helpers/Helper';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksWorkspaceTreeProvider implements vscode.TreeDataProvider<DatabricksWorkspaceTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined> = new vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksWorkspaceTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() { }

	refresh(showInfoMessage: boolean = false): void {
		if (showInfoMessage) {
			vscode.window.showInformationMessage('Refreshing Workspace ...');
		}
		this._onDidChangeTreeData.fire(null);
	}

	getTreeItem(element: DatabricksWorkspaceTreeItem): DatabricksWorkspaceTreeItem {
		return element;
	}

	getChildren(element?: DatabricksWorkspaceTreeItem): Thenable<DatabricksWorkspaceTreeItem[]> {
		if (element != null && element != undefined) {
			return element.getChildren();
		}
		else {
			let workspaceRootFolder = fspath.join(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ConnectionManager.WorkspaceSubFolder);
			if (!fs.existsSync(workspaceRootFolder)) {
				Helper.ensureLocalFolder(workspaceRootFolder);
				//vscode.window.showWarningMessage("With release v5.0.0 the sub-folder 'Workspace' was added for synced Workspace items. This supports better integratino with CI/CD and DatabricksPS PowerShell module. Please move your local files manually to '" + workspaceRootFolder + "' or sync them again! This message will only show up once!");
				return Promise.resolve([]);
			}
			else {
				return new DatabricksWorkspaceDirectory("/", -1, "Online").getChildren();
			}
		}
	}

	download(): void {
		new DatabricksWorkspaceDirectory("/", -1, "Online").download();
	}

	upload(): void {
		new DatabricksWorkspaceDirectory("/", -1, "Online").upload();
	}
}
