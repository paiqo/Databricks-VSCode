import * as vscode from 'vscode';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { Helper } from '../../../helpers/Helper';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksCluster } from './DatabricksCluster';
import { DatabricksClusterJobClusters } from './DatabricksClusterJobClusters';
import { DatabricksClusterTreeItem } from './DatabricksClusterTreeItem';
import { iDatabricksCluster } from './iDatabricksCluster';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksClusterTreeProvider implements vscode.TreeDataProvider<DatabricksClusterTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksClusterTreeItem | undefined> = new vscode.EventEmitter<DatabricksClusterTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksClusterTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() { }

	async autoRefresh(timeoutSeconds: number = 10) {
		while (true) {
			await new Promise(resolve => setTimeout(resolve, timeoutSeconds * 1000));

			this.refresh(false, true);
		}
	}

	refresh(showInfoMessage: boolean = false, isAutoRefresh = false, item: DatabricksClusterTreeItem = null): void {
		if (showInfoMessage && !isAutoRefresh) {
			Helper.showTemporaryInformationMessage('Refreshing Clusters ...');
		}
		this._onDidChangeTreeData.fire(item);
	}

	getTreeItem(element: DatabricksClusterTreeItem): vscode.TreeItem {
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

			return items;
		}
	}

	add(): void {
		vscode.window.showErrorMessage(`Not yet implemented!`);
	}
}
