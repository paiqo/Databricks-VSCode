import * as vscode from 'vscode';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';
import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { Helper } from '../../../helpers/Helper';
import { DatabricksConnectionManagerManualInput } from './DatabricksConnectionManagerManualInput';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksConnectionTreeProvider implements vscode.TreeDataProvider<DatabricksConnectionTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksConnectionTreeItem | undefined> = new vscode.EventEmitter<DatabricksConnectionTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksConnectionTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _isInitialized: boolean = false;

	constructor() { }

	async refresh(item: DatabricksConnectionTreeItem = null, showInfoMessage: boolean = false): Promise<void> {
		if (showInfoMessage) {
			Helper.showTemporaryInformationMessage('Refreshing Connections ...');
		}
		//await ThisExtension.ConnectionManager.initialize();
		await ThisExtension.initialize(ThisExtension.extensionContext);
		// we always refresh the whole tree-View!
		this._onDidChangeTreeData.fire(undefined);
	}

	async getTreeItem(element: DatabricksConnectionTreeItem): Promise<vscode.TreeItem> {
		return element;
	}

	async getChildren(element?: DatabricksConnectionTreeItem): Promise<DatabricksConnectionTreeItem[]> {
		let items: iDatabricksConnection[] = ThisExtension.ConnectionManager.Connections;

		let envItems: DatabricksConnectionTreeItem[] = [];

		for (let i = 0; i < items.length; i++) {
			let item = items[i];

			let con = new DatabricksConnectionTreeItem(item);

			if(DatabricksConnectionTreeItem.validate(con))
			{
				if(con.displayName == ThisExtension.ConnectionManager.LastActiveConnectionName && !this._isInitialized)
				{
					this._isInitialized = true;
					//con.activate();
				}
				envItems.push(con);
			}
			else
			{
				ThisExtension.log(`Connection '${item.displayName}' is not valid!`);
				vscode.window.showErrorMessage(`ERROR: Connection '${item.displayName}' is not valid!`);
			}
		}
		return envItems;
	}

	async add(): Promise<void> {
		// [Add] is only displayed for Manual Connection Manager which asks for credentials during initialize()
		ThisExtension.ConnectionManager = new DatabricksConnectionManagerManualInput();
		await ThisExtension.ConnectionManager.initialize();
	}

	async openSettings(): Promise<void> {
		vscode.commands.executeCommand( 'workbench.action.openSettings', 'Databricks' );
		return;
	}
}
