import * as vscode from 'vscode';
import { DatabricksApiService} from './databricksApi/databricksApiService';
import { DatabricksEnvironmentTreeItem } from './environments/DatabricksEnvironmentTreeItem';
import { iDatabricksEnvironment } from './environments/iDatabricksEnvironment';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksEnvironmentTreeProvider implements vscode.TreeDataProvider<DatabricksEnvironmentTreeItem> {
	private _activeEnvironment: iDatabricksEnvironment;

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksEnvironmentTreeItem | undefined> = new vscode.EventEmitter<DatabricksEnvironmentTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksEnvironmentTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() { }

	refresh(): void {
		vscode.window.showInformationMessage(`Refreshing Environments ...`);
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: DatabricksEnvironmentTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DatabricksEnvironmentTreeItem): Thenable<DatabricksEnvironmentTreeItem[]> {	
		const databricksEnvironments = vscode.workspace.getConfiguration().get('databricks.connections');

		// array of file is in result.files
		let items = databricksEnvironments as iDatabricksEnvironment[];
		
		let envItems: DatabricksEnvironmentTreeItem[] = [];
		if(items != undefined)
		{
			items.map(item => envItems.push(new DatabricksEnvironmentTreeItem(
													item.displayName, 
													item.cloudProvider, 
													item.personalAccessToken, 
													item.apiRootUrl, 
													item.localSyncFolder,
													item.databricksConnectJars,
													item.pythonInterpreter,
													item.port,
													item.organizationId)));
		}
		return Promise.resolve(envItems);
	}
}
