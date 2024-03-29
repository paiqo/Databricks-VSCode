import * as vscode from 'vscode';

import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';
import { DatabricksWorkspaceDirectory } from './DatabricksWorkspaceDirectory';
import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';
import { FSHelper } from '../../../helpers/FSHelper';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksWorkspaceTreeProvider implements vscode.TreeDataProvider<DatabricksWorkspaceTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined> = new vscode.EventEmitter<DatabricksWorkspaceTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksWorkspaceTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _treeView: vscode.TreeView<DatabricksWorkspaceTreeItem>;

	constructor(context: vscode.ExtensionContext) {
		const treeView = vscode.window.createTreeView('databricksWorkspace', { 
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

		if(ThisExtension.isInBrowser)
		{
			this._treeView.message = "Workspace Browser is disabled in Virtual Workspaces!";
		}
	}

	private async _onDidChangeSelection(items: readonly DatabricksWorkspaceTreeItem[]): Promise<void> { }
	private async _onDidExpandElement(item: DatabricksWorkspaceTreeItem): Promise<void> { }
	private async _onDidCollapseElement(item: DatabricksWorkspaceTreeItem): Promise<void> { }
	private async _onDidChangeVisibility(visible: boolean): Promise<void> { }

	async refresh(item: DatabricksWorkspaceTreeItem = null, showInfoMessage: boolean = false): Promise<void> {
		if (showInfoMessage) {
			Helper.showTemporaryInformationMessage('Refreshing Workspace ...');
		}

		this._onDidChangeTreeData.fire(item);
	}

	async getTreeItem(element: DatabricksWorkspaceTreeItem): Promise<DatabricksWorkspaceTreeItem> {
		return element;
	}

	async getParent(element: DatabricksWorkspaceTreeItem): Promise<DatabricksWorkspaceTreeItem> {
		return element.parent;
	}

	async getChildren(element?: DatabricksWorkspaceTreeItem): Promise<DatabricksWorkspaceTreeItem[]> {
		if(!DatabricksApiService.isInitialized) { 			
			return Promise.resolve([]);
		}

		if (element != null && element != undefined) {
			return element.getChildren();
		}
		else {
			let workspaceRootFolder = vscode.Uri.joinPath(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ConnectionManager.SubfolderConfiguration().Workspace);
			
			// if the workspace folder does not yet exist we create it
			if (!await FSHelper.pathExists(workspaceRootFolder)) {
				FSHelper.ensureFolder(workspaceRootFolder);
			}
			
			return new DatabricksWorkspaceDirectory("/", 0, workspaceRootFolder).getChildren();
		}
	}

	async download(): Promise<void> {
		await new DatabricksWorkspaceDirectory("/", 0).download();
	}

	async upload(): Promise<void> {
		await new DatabricksWorkspaceDirectory("/", 0).upload();
	}
}
