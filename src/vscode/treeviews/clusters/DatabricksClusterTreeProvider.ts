import * as vscode from 'vscode';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { Helper } from '../../../helpers/Helper';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksKernelManager } from '../../notebook/DatabricksKernelManager';
import { DatabricksCluster } from './DatabricksCluster';
import { DatabricksClusterJobClusters } from './DatabricksClusterJobClusters';
import { DatabricksClusterTreeItem } from './DatabricksClusterTreeItem';
import { iDatabricksCluster } from './iDatabricksCluster';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksClusterTreeProvider implements vscode.TreeDataProvider<DatabricksClusterTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksClusterTreeItem | undefined> = new vscode.EventEmitter<DatabricksClusterTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksClusterTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _treeView: vscode.TreeView<DatabricksClusterTreeItem>;
	private _autoRefreshTimer;

	constructor(context: vscode.ExtensionContext) {
		const treeView = vscode.window.createTreeView('databricksClusters', {
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

		this.startAutoRefresh(300); // refresh every 5 minutes
	}

	private async _onDidChangeSelection(items: readonly DatabricksClusterTreeItem[]): Promise<void> { }
	private async _onDidExpandElement(item: DatabricksClusterTreeItem): Promise<void> { }
	private async _onDidCollapseElement(item: DatabricksClusterTreeItem): Promise<void> { }
	private async _onDidChangeVisibility(visible: boolean): Promise<void> { }

	async startAutoRefresh(timeoutSeconds: number): Promise<void> {
		if (this._autoRefreshTimer) {
			ThisExtension.log('AutoRefresh for ClusterTreeView is already running!');
		}
		else {
			ThisExtension.log(`Starting AutoRefresh for ClusterTreeView every ${timeoutSeconds} seconds!`);
			this._autoRefreshTimer = setInterval(async () => {
				await this.refresh(false, true);
			}, timeoutSeconds * 1000);
		}

	}

	async stopAutoRefresh(): Promise<void> {
		if (this._autoRefreshTimer) {
			ThisExtension.log('Stopping AutoRefresh for ClusterTreeView!');
			clearInterval(this._autoRefreshTimer);
			this._autoRefreshTimer = undefined;
		}
		else {
			ThisExtension.log('AutoRefresh for ClusterTreeView is not running!');
		}
	}

	async refresh(showInfoMessage: boolean = false, isAutoRefresh = false, item: DatabricksClusterTreeItem = null): Promise<void> {
		if (showInfoMessage && !isAutoRefresh) {
			Helper.showTemporaryInformationMessage('Refreshing Clusters ...');
		}
		if (!isAutoRefresh) {
			DatabricksKernelManager.refresh(false);
		}
		this._onDidChangeTreeData.fire(item);
	}

	async getTreeItem(element: DatabricksClusterTreeItem): Promise<vscode.TreeItem> {
		return element;
	}

	async getChildren(element?: DatabricksClusterTreeItem): Promise<DatabricksClusterTreeItem[]> {
		if (!DatabricksApiService.isInitialized) {
			return Promise.resolve([]);
		}

		if (element != null && element != undefined) {
			return element.getChildren();
		}
		else {
			let clusters: iDatabricksCluster[] = await DatabricksApiService.listClusters();
			let items: DatabricksClusterTreeItem[] = [];

			if (clusters != undefined) {
				let job_clusters_found: boolean = false;
				for (let cluster of clusters) {
					if (["API", "UI"].includes(cluster.cluster_source)) {
						items.push(new DatabricksCluster(cluster));

						if (cluster.state == "RUNNING" && ThisExtension.SQLClusterID == undefined) {
							ThisExtension.log(`Running cluster "${cluster.cluster_name}"(${cluster.cluster_id}) found! It will be used for SQL Browser!`);
							ThisExtension.SQLClusterID = cluster.cluster_id;
						}
					}
					if (["JOB"].includes(cluster.cluster_source)) {
						job_clusters_found = true;
					}
				}

				if (job_clusters_found) {
					items.push(new DatabricksClusterJobClusters());
				}
			}

			return items;
		}
	}

	async add(): Promise<void> {
		let actConn = ThisExtension.ActiveConnection;
		//https://adb-1232342536639.99.azuredatabricks.net/#create/cluster
		let link: string = actConn.apiRootUrl.toString(true) + "#create/cluster";

		await Helper.openLink(link);
	}
}
