import * as vscode from 'vscode';

import { Helper } from '../../../helpers/Helper';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksSQLDatabase } from './DatabricksSQLDatabase';
import { DatabricksSQLSelectCluster } from './DatabricksSQLSelectCluster';
import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { iDatabricksApiCommandsStatusResponse } from '../../../databricksApi/_types';


// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksSQLTreeProvider implements vscode.TreeDataProvider<DatabricksSQLTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksSQLTreeItem | undefined> = new vscode.EventEmitter<DatabricksSQLTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksSQLTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _treeView: vscode.TreeView<DatabricksSQLTreeItem>;

	constructor(context: vscode.ExtensionContext) {
		const treeView = vscode.window.createTreeView('databricksSQL', { 
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
	}

	private async _onDidChangeSelection(items: readonly DatabricksSQLTreeItem[]): Promise<void> { }
	private async _onDidExpandElement(item: DatabricksSQLTreeItem): Promise<void> { }
	private async _onDidCollapseElement(item: DatabricksSQLTreeItem): Promise<void> { }
	private async _onDidChangeVisibility(visible: boolean): Promise<void> { }

	async refresh(showInfoMessage: boolean = false, item: DatabricksSQLTreeItem = null): Promise<void> {
		if (showInfoMessage) {
			Helper.showTemporaryInformationMessage('Refreshing SQL ...');
		}
		this._onDidChangeTreeData.fire(item);
	}

	async getTreeItem(element: DatabricksSQLTreeItem): Promise<vscode.TreeItem> {
		return element;
	}

	async getParent(element: DatabricksSQLTreeItem): Promise<DatabricksSQLTreeItem> {
		return element.parent;
	}

	async getChildren(element?: DatabricksSQLTreeItem): Promise<DatabricksSQLTreeItem[]> {
		if (!DatabricksApiService.isInitialized) {
			return Promise.resolve([]);
		}

		if (!ThisExtension.SQLClusterID) {
			return [new DatabricksSQLSelectCluster()];
		}

		if (element != null && element != undefined) {
			return element.getChildren();
		}
		else {
			try {
				let context = await DatabricksApiService.getExecutionContext(ThisExtension.SQLClusterID, "sql");

				let cmd = await DatabricksApiService.runCommand(context, "SHOW DATABASES");

				let result: iDatabricksApiCommandsStatusResponse = await DatabricksApiService.getCommandResult(cmd);

				let databases: DatabricksSQLDatabase[] = [];
				for (let db of result.results.data) {
					databases.push(new DatabricksSQLDatabase(db[0], context, undefined));
				}

				return databases;

			} catch (error) {
				vscode.window.showErrorMessage("Please make sure Cluster '" + ThisExtension.SQLClusterID + "' is running and can run SQL commands!");
				return Promise.resolve([]);
			}
		}
	}
}
