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

	constructor() {	}

	refresh(showInfoMessage: boolean = false, item: DatabricksFSTreeItem = null): void {
		if(showInfoMessage){
			Helper.showTemporaryInformationMessage('Refreshing DBFS ...');
		}
		this._onDidChangeTreeData.fire(item);
	}

	getTreeItem(element: DatabricksFSTreeItem): vscode.TreeItem {
		return element;
	}

	getParent(element: DatabricksFSTreeItem): vscode.ProviderResult<DatabricksFSTreeItem> {
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
			let dbfsRootFolder = vscode.Uri.joinPath(vscode.Uri.file(ThisExtension.ActiveConnection.localSyncFolder), ThisExtension.ActiveConnection.DatabricksFSSubFolder);
			
			// if the workspace folder does not yet exist we create it and return an empty array (as nothing can exist below it yet);
			if (!await FSHelper.pathExists(dbfsRootFolder)) {
				FSHelper.ensureFolder(dbfsRootFolder);
				//vscode.window.showWarningMessage("With release v5.0.0 the sub-folder 'Workspace' was added for synced Workspace items. This supports better integratino with CI/CD and DatabricksPS PowerShell module. Please move your local files manually to '" + workspaceRootFolder + "' or sync them again! This message will only show up once!");
				return Promise.resolve([]);
			}
			let items: DatabricksFSTreeItem[] = await new DatabricksFSDirectory("/", "Online", dbfsRootFolder, null).getChildren();

			//items.forEach(x => x.parent = null); 
			// remove the artificial parent again
			return items;
		}
	}
}
