import * as vscode from 'vscode';
import { DatabricksFSTreeItem } from './DatabricksFSTreeItem';
import { DatabricksFSDirectory } from './DatabricksFSDirectory';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { Helper } from '../../../helpers/Helper';
import { ThisExtension } from '../../../ThisExtension';
import { FSHelper } from '../../../helpers/FSHelper';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksFSTreeProvider implements vscode.TreeDataProvider<DatabricksFSTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksFSTreeItem | undefined> = new vscode.EventEmitter<DatabricksFSTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksFSTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _treeView: vscode.TreeView<DatabricksFSTreeItem>;

	constructor(context: vscode.ExtensionContext) {
		const treeView = vscode.window.createTreeView('databricksFS', { 
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

		if(ThisExtension.isVirtualWorkspace)
		{
			this._treeView.message = "DBFS Browser is disabled in Virtual Workspaces!";
		}
	}

	private async _onDidChangeSelection(items: readonly DatabricksFSTreeItem[]): Promise<void> { }
	private async _onDidExpandElement(item: DatabricksFSTreeItem): Promise<void> { }
	private async _onDidCollapseElement(item: DatabricksFSTreeItem): Promise<void> { }
	private async _onDidChangeVisibility(visible: boolean): Promise<void> { }

	async refresh(showInfoMessage: boolean = false, item: DatabricksFSTreeItem = null): Promise<void> {
		if(showInfoMessage){
			Helper.showTemporaryInformationMessage('Refreshing DBFS ...');
		}
		this._onDidChangeTreeData.fire(item);
	}

	async getTreeItem(element: DatabricksFSTreeItem): Promise<DatabricksFSTreeItem> {
		return element;
	}

	async getParent(element: DatabricksFSTreeItem): Promise<DatabricksFSTreeItem> {
		return element.parent;
	}

	async getChildren(element?: DatabricksFSTreeItem): Promise<DatabricksFSTreeItem[]> {	
		if(!DatabricksApiService.isInitialized) { 
			return Promise.resolve([]);
		}
		
		if (element != null && element != undefined) 
		{
			return element.getChildren();
		} 
		else 
		{
			let dbfsRootFolder = vscode.Uri.joinPath(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ConnectionManager.SubfolderConfiguration().DBFS);
			
			// if the workspace folder does not yet exist we create it and return an empty array (as nothing can exist below it yet);
			if (!await FSHelper.pathExists(dbfsRootFolder)) {
				FSHelper.ensureFolder(dbfsRootFolder);
				//vscode.window.showWarningMessage("With release v5.0.0 the sub-folder 'Workspace' was added for synced Workspace items. This supports better integratino with CI/CD and DatabricksPS PowerShell module. Please move your local files manually to '" + workspaceRootFolder + "' or sync them again! This message will only show up once!");
				return Promise.resolve([]);
			}
			let items: DatabricksFSTreeItem[] = await new DatabricksFSDirectory("/", "Online", dbfsRootFolder, null).getChildren();

			// remove the artificial parent again to make sure to refresh the root 
			items.forEach(x => x.parent = null); 
			
			return items;
		}
	}
}
